<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    /**
     * GET /api/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product'])->orderBy('created_at', 'desc');

        // Search by Order Number, Customer Name, or Customer Email
        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($request->filled('status') && $request->input('status') !== 'All') {
            $query->where('status', $request->input('status'));
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
     * GET /api/admin/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['items.product', 'user']);
        return response()->json($order);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Processing,Shipped,Delivered,Cancelled'],
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        if ($oldStatus !== $newStatus) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($order, $oldStatus, $newStatus) {
                $order->update(['status' => $newStatus]);

                // If transitioned TO Cancelled, restore stock and decrease coupon usage
                if ($newStatus === 'Cancelled') {
                    foreach ($order->items as $item) {
                        if ($item->product) {
                            $colorId = \App\Models\Color::where('name', $item->color)->value('id');
                            $variant = \App\Models\ProductVariant::where('product_id', $item->product_id)
                                ->where('color_id', $colorId)
                                ->where('size', $item->size)
                                ->first();

                            if ($variant) {
                                $variant->increment('stock', $item->quantity);
                                $totalStock = \App\Models\ProductVariant::where('product_id', $item->product_id)->sum('stock');
                                $item->product->update([
                                    'stock' => $totalStock,
                                    'in_stock' => $totalStock > 0
                                ]);
                            } else {
                                $item->product->increment('stock', $item->quantity);
                                if ($item->product->stock > 0) {
                                    $item->product->update(['in_stock' => true]);
                                }
                            }
                        }
                    }

                    if (!empty($order->coupon_code)) {
                        $coupon = \App\Models\Coupon::where('code', $order->coupon_code)->first();
                        if ($coupon) {
                            $coupon->decrement('used');
                        }
                    }
                }
                
                // If transitioned FROM Cancelled (e.g. back to Processing), deduct stock again and increase coupon usage
                if ($oldStatus === 'Cancelled') {
                    foreach ($order->items as $item) {
                        if ($item->product) {
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
                    }

                    if (!empty($order->coupon_code)) {
                        $coupon = \App\Models\Coupon::where('code', $order->coupon_code)->first();
                        if ($coupon) {
                            $coupon->increment('used');
                        }
                    }
                }
            });
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load(['items.product', 'user']),
        ]);
    }
}
