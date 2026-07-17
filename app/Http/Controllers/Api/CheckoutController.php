<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    private const DELIVERY_OPTIONS = [
        'standard' => 15.00,
        'express'  => 28.00,
        'overnight'=> 45.00,
    ];

    private function getOrCreateSessionId(Request $request): string
    {
        $sessionId = $request->session()->get('cart_session_id');

        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
            $request->session()->put('cart_session_id', $sessionId);
        }

        return $sessionId;
    }

    private function resolveCartOwner(Request $request): array
    {
        if (Auth::check()) {
            return [
                'user_id' => Auth::id(),
                'session_id' => null,
            ];
        }

        return [
            'user_id' => null,
            'session_id' => $this->getOrCreateSessionId($request),
        ];
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => ['required', 'string', 'max:255'],
            'lastName'  => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255'],
            'phone'     => ['required', 'string', 'max:20'],
            'address'   => ['required', 'string', 'max:255'],
            'city'      => ['required', 'string', 'max:255'],
            'postcode'  => ['required', 'string', 'max:50'],
            'country'   => ['required', 'string', 'max:255'],
            'delivery'  => ['required', 'string', 'in:standard,express,overnight'],
            'couponCode' => ['nullable', 'string'],
        ]);

        $owner = $this->resolveCartOwner($request);

        $cartItems = CartItem::with('product')->where(function ($query) use ($owner) {
            if ($owner['user_id'] !== null) {
                $query->where('user_id', $owner['user_id']);
            } else {
                $query->where('session_id', $owner['session_id']);
            }
        })->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $subtotal = 0;
        foreach ($cartItems as $item) {
            if (!$item->product || !$item->product->active || !$item->product->in_stock) {
                return response()->json([
                    'message' => 'Product ' . ($item->product->name ?? 'Unknown') . ' is currently unavailable.'
                ], 422);
            }
            
            // Check available stock (stock - reserved) for the exact variant
            $colorId = \App\Models\Color::where('name', $item->color)->value('id');
            $variant = \App\Models\ProductVariant::where('product_id', $item->product_id)
                ->where('color_id', $colorId)
                ->where('size', $item->size)
                ->first();

            $reserved = OrderItem::where('product_id', $item->product_id)
                ->where('color', $item->color)
                ->where('size', $item->size)
                ->whereHas('order', function ($q) {
                    $q->whereIn('status', ['Processing', 'Shipped']);
                })
                ->sum('quantity');

            $availableStock = max(0, ($variant ? $variant->stock : 0) - $reserved);

            if ($availableStock < $item->quantity) {
                return response()->json([
                    'message' => 'Product ' . $item->product->name . ' (' . $item->color . ' - ' . $item->size . ') has insufficient stock. Available: ' . $availableStock
                ], 422);
            }

            $subtotal += $item->product->price * $item->quantity;
        }

        // Validate and apply coupon if provided
        $discountAmount = 0.00;
        $appliedCoupon = null;
        if (!empty($validated['couponCode'])) {
            $code = strtoupper(trim($validated['couponCode']));
            $coupon = \App\Models\Coupon::where('code', $code)->first();

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

            if ($subtotal < $coupon->min_order) {
                return response()->json([
                    'message' => sprintf('Minimum order amount of $%s not met for this coupon.', number_format($coupon->min_order, 2))
                ], 422);
            }

            if ($coupon->type === 'Percentage') {
                $discountAmount = (float)$subtotal * ((float)$coupon->value / 100);
            } elseif ($coupon->type === 'Fixed') {
                $discountAmount = (float)$coupon->value;
            }

            $discountAmount = min($discountAmount, (float)$subtotal);
            $appliedCoupon = $coupon;
        }

        $deliveryCost = self::DELIVERY_OPTIONS[$validated['delivery']];
        $total = max(0.00, $subtotal - $discountAmount) + $deliveryCost;

        try {
            DB::beginTransaction();

            if ($owner['user_id'] !== null) {
                $addressExists = Address::where([
                    'user_id' => $owner['user_id'],
                    'first_name' => $validated['firstName'],
                    'last_name' => $validated['lastName'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'city' => $validated['city'],
                    'postcode' => $validated['postcode'],
                    'country' => $validated['country'],
                ])->exists();

                if (!$addressExists) {
                    $hasAddresses = Address::where('user_id', $owner['user_id'])->exists();
                    Address::create([
                        'user_id' => $owner['user_id'],
                        'first_name' => $validated['firstName'],
                        'last_name' => $validated['lastName'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'],
                        'address' => $validated['address'],
                        'city' => $validated['city'],
                        'postcode' => $validated['postcode'],
                        'country' => $validated['country'],
                        'is_default' => !$hasAddresses,
                    ]);
                }
            }

            // Generate unique order number
            $orderNumber = 'JA-' . strtoupper(Str::random(6));
            while (Order::where('order_number', $orderNumber)->exists()) {
                $orderNumber = 'JA-' . strtoupper(Str::random(6));
            }

            $order = Order::create([
                'user_id'         => $owner['user_id'],
                'session_id'      => $owner['session_id'],
                'order_number'    => $orderNumber,
                'status'          => 'Processing',
                'first_name'      => $validated['firstName'],
                'last_name'       => $validated['lastName'],
                'email'           => $validated['email'],
                'phone'           => $validated['phone'],
                'address'         => $validated['address'],
                'city'            => $validated['city'],
                'postcode'        => $validated['postcode'],
                'country'         => $validated['country'],
                'delivery_method' => $validated['delivery'],
                'delivery_cost'   => $deliveryCost,
                'subtotal'        => $subtotal,
                'total'           => $total,
                'coupon_code'     => $appliedCoupon ? $appliedCoupon->code : null,
                'discount_amount' => $discountAmount,
            ]);

            if ($appliedCoupon) {
                $appliedCoupon->increment('used');
            }

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'size'       => $item->size,
                    'color'      => $item->color,
                    'quantity'   => $item->quantity,
                    'price'      => $item->product->price,
                ]);

                // Reduce variant stock and update product total stock
                $colorId = \App\Models\Color::where('name', $item->color)->value('id');
                $variant = \App\Models\ProductVariant::where('product_id', $item->product_id)
                    ->where('color_id', $colorId)
                    ->where('size', $item->size)
                    ->first();

                if ($variant) {
                    $variant->decrement('stock', $item->quantity);
                    $totalStock = \App\Models\ProductVariant::where('product_id', $item->product_id)->sum('stock');
                    $item->product->update([
                        'stock' => $totalStock,
                        'in_stock' => $totalStock > 0
                    ]);
                } else {
                    $item->product->decrement('stock', $item->quantity);
                    $updatedProduct = $item->product->fresh();
                    if ($updatedProduct->stock <= 0) {
                        $updatedProduct->update(['in_stock' => false]);
                    }
                }
            }

            // Clear the cart
            CartItem::whereIn('id', $cartItems->pluck('id'))->delete();

            DB::commit();

            return response()->json([
                'message'      => 'Order created successfully',
                'order_number' => $order->order_number,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $orders = Order::with('items.product')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json($orders);
    }
}
