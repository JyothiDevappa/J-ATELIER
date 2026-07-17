<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    /**
     * GET /api/admin/inventory
     */
    public function index(Request $request): JsonResponse
    {
        $reservedSubquery = OrderItem::whereColumn('product_id', 'products.id')
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['Processing', 'Shipped']);
            })
            ->selectRaw('COALESCE(SUM(quantity), 0)');

        $reservedSql = '(SELECT COALESCE(SUM(quantity), 0) FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE order_items.product_id = products.id AND orders.status IN ("Processing", "Shipped"))';

        $query = Product::with(['variants.color'])->select('products.*')
            ->selectSub($reservedSubquery, 'reserved_stock')
            ->orderBy('products.sort_order');

        // Search by Product Name or SKU
        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by Stock Status
        if ($request->filled('status')) {
            $statusFilter = $request->input('status');
            if ($statusFilter === 'in_stock') {
                $query->whereRaw("COALESCE(stock, 0) - {$reservedSql} > 5");
            } elseif ($statusFilter === 'low_stock') {
                $query->whereRaw("COALESCE(stock, 0) - {$reservedSql} > 0")
                      ->whereRaw("COALESCE(stock, 0) - {$reservedSql} <= 5");
            } elseif ($statusFilter === 'out_of_stock') {
                $query->whereRaw("COALESCE(stock, 0) - {$reservedSql} <= 0");
            }
        }

        // Paginate - 10 per page
        $paginated = $query->paginate(10);

        // Map response items
        $items = collect($paginated->items())->map(function ($product) {
            if ($product->variants->isEmpty() && !empty($product->sizes)) {
                $product->syncVariants();
                $product->load(['variants.color']);
            }

            $mappedVariants = $product->variants->map(function ($variant) use ($product) {
                $variantReserved = OrderItem::where('product_id', $product->id)
                    ->where('size', $variant->size)
                    ->where('color', $variant->color?->name)
                    ->whereHas('order', function ($q) {
                        $q->whereIn('status', ['Processing', 'Shipped']);
                    })
                    ->sum('quantity');
                    
                $variantAvailable = max(0, $variant->stock - $variantReserved);
                
                $variantStatus = 'In Stock';
                if ($variantAvailable <= 0) {
                    $variantStatus = 'Out of Stock';
                } elseif ($variantAvailable <= 5) {
                    $variantStatus = 'Low Stock';
                }

                return [
                    'id' => $variant->id,
                    'size' => $variant->size,
                    'color' => $variant->color?->name ?? 'Default',
                    'hex' => $variant->color?->hex ?? '#CCCCCC',
                    'current_stock' => $variant->stock,
                    'reserved_stock' => $variantReserved,
                    'available_stock' => $variantAvailable,
                    'status' => $variantStatus,
                ];
            })->toArray();

            $currentStock = collect($mappedVariants)->sum('current_stock');
            $reserved = collect($mappedVariants)->sum('reserved_stock');
            $available = collect($mappedVariants)->sum('available_stock');

            $status = 'In Stock';
            if ($available <= 0) {
                $status = 'Out of Stock';
            } else {
                $hasLowStockVariant = collect($mappedVariants)->contains(function ($v) {
                    return $v['available_stock'] <= 5;
                });
                if ($hasLowStockVariant) {
                    $status = 'Low Stock';
                }
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku ?? ('JA-' . strtoupper(substr($product->slug, 0, 4)) . '-' . $product->id),
                'collection' => $product->collection,
                'image' => $product->images[0] ?? '',
                'current_stock' => $currentStock,
                'reserved_stock' => $reserved,
                'available_stock' => $available,
                'status' => $status,
                'variants' => $mappedVariants,
            ];
        });

        // Count products running low (available_stock <= 5)
        $lowStockQuery = Product::whereRaw("COALESCE(stock, 0) - {$reservedSql} <= 5");
            
        $lowStockProducts = $lowStockQuery->pluck('name');

        return response()->json([
            'data' => $items,
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
            ],
            'low_stock_list' => $lowStockProducts,
        ]);
    }

    /**
     * PUT /api/admin/inventory/{product}
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $product->update([
            'stock' => $validated['stock'],
            'in_stock' => $validated['stock'] > 0,
        ]);

        return response()->json([
            'message' => 'Stock updated successfully',
            'product' => $product,
        ]);
    }

    /**
     * PUT /api/admin/inventory/variant/{variant}
     */
    public function updateVariant(Request $request, \App\Models\ProductVariant $variant): JsonResponse
    {
        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $variant->update([
            'stock' => $validated['stock'],
        ]);

        // Sync the total product stock and status
        $product = $variant->product;
        $totalStock = $product->variants()->sum('stock');
        $product->update([
            'stock' => $totalStock,
            'in_stock' => $totalStock > 0,
        ]);

        return response()->json([
            'message' => 'Variant stock updated successfully',
            'variant' => $variant,
        ]);
    }
}
