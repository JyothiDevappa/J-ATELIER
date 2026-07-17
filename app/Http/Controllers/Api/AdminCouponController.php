<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\UUID;
use Illuminate\Support\Str;

class AdminCouponController extends Controller
{
    /**
     * GET /api/admin/coupons
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::orderBy('created_at', 'desc');

        // Search by Code
        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where('code', 'like', "%{$search}%");
        }

        // Filter by Status
        if ($request->filled('status')) {
            $status = $request->input('status');
            $today = today()->toDateString();
            if ($status === 'Active') {
                $query->where('active', true)
                      ->where(function ($q) use ($today) {
                          $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', $today);
                      })
                      ->where(function ($q) {
                          $q->whereNull('limit')
                            ->orWhereColumn('used', '<', 'limit');
                      });
            } elseif ($status === 'Expired') {
                $query->where(function ($q) use ($today) {
                    $q->where('active', false)->where('expires_at', '<', $today);
                })->orWhere(function ($q) use ($today) {
                    $q->where('active', true)->where('expires_at', '<', $today);
                });
            } elseif ($status === 'Disabled') {
                $query->where('active', false);
            }
        }

        // Paginate - 10 per page
        $paginated = $query->paginate(10);

        return response()->json([
            'data' => $paginated->items(),
            'links' => [
                'first' => $paginated->url(1),
                'last' => $paginated->url($paginated->lastPage()),
                'prev' => $paginated->previousPageUrl(),
                'next' => $paginated->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'from' => $paginated->firstItem(),
                'last_page' => $paginated->lastPage(),
                'path' => $paginated->path(),
                'per_page' => $paginated->perPage(),
                'to' => $paginated->lastItem(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    /**
     * POST /api/admin/coupons
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper(trim($request->input('code')))]);
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:coupons,code'],
            'type' => ['required', 'string', 'in:Percentage,Fixed'],
            'value' => ['required', 'numeric', 'min:0.01', function ($attribute, $value, $fail) use ($request) {
                if ($request->input('type') === 'Percentage' && $value > 100) {
                    $fail('Percentage discount value cannot exceed 100%.');
                }
            }],
            'min_order' => ['required', 'numeric', 'min:0'],
            'limit' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'active' => ['required', 'boolean'],
        ]);

        $coupon = Coupon::create($validated);

        return response()->json($coupon, 201);
    }

    /**
     * PUT /api/admin/coupons/{coupon}
     */
    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper(trim($request->input('code')))]);
        }

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:coupons,code,' . $coupon->id],
            'type' => ['required', 'string', 'in:Percentage,Fixed'],
            'value' => ['required', 'numeric', 'min:0.01', function ($attribute, $value, $fail) use ($request) {
                if ($request->input('type') === 'Percentage' && $value > 100) {
                    $fail('Percentage discount value cannot exceed 100%.');
                }
            }],
            'min_order' => ['required', 'numeric', 'min:0'],
            'limit' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'active' => ['required', 'boolean'],
        ]);

        $coupon->update($validated);

        return response()->json($coupon);
    }

    /**
     * DELETE /api/admin/coupons/{coupon}
     */
    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted successfully']);
    }

    /**
     * POST /api/coupons/validate
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = strtoupper(trim($validated['code']));
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Coupon does not exist.'], 422);
        }

        if (!$coupon->active) {
            return response()->json(['message' => 'Coupon is disabled.'], 422);
        }

        if ($coupon->isExpired()) {
            return response()->json(['message' => 'Coupon has expired.'], 422);
        }

        if ($coupon->limit !== null && $coupon->used >= $coupon->limit) {
            return response()->json(['message' => 'Coupon usage limit has been reached.'], 422);
        }

        // Calculate Subtotal
        $owner = $this->resolveCartOwner($request);
        $cartItems = CartItem::with('product')->where(function ($query) use ($owner) {
            if ($owner['user_id'] !== null) {
                $query->where('user_id', $owner['user_id']);
            } else {
                $query->where('session_id', $owner['session_id']);
            }
        })->get();

        $subtotal = 0;
        foreach ($cartItems as $item) {
            if ($item->product && $item->product->active && $item->product->in_stock) {
                $subtotal += $item->product->price * $item->quantity;
            }
        }

        if ($subtotal < $coupon->min_order) {
            return response()->json([
                'message' => sprintf('Minimum order amount of $%s not met for this coupon.', number_format($coupon->min_order, 2))
            ], 422);
        }

        // Calculate discount
        $discountAmount = 0.00;
        if ($coupon->type === 'Percentage') {
            $discountAmount = (float)$subtotal * ((float)$coupon->value / 100);
        } elseif ($coupon->type === 'Fixed') {
            $discountAmount = (float)$coupon->value;
        }

        $discountAmount = min($discountAmount, (float)$subtotal);
        $updatedTotal = max(0.00, (float)$subtotal - $discountAmount);

        return response()->json([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float)$coupon->value,
            'discount_amount' => round($discountAmount, 2),
            'subtotal' => round($subtotal, 2),
            'updated_total' => round($updatedTotal, 2)
        ]);
    }

    private function resolveCartOwner(Request $request): array
    {
        if (Auth::check()) {
            return [
                'user_id' => Auth::id(),
                'session_id' => null,
            ];
        }

        $sessionId = $request->session()->get('cart_session_id');
        return [
            'user_id' => null,
            'session_id' => $sessionId,
        ];
    }
}
