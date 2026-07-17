<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    /**
     * GET /api/admin/analytics
     *
     * Returns all analytics data in a single response.
     * Uses aggregate queries (SUM, COUNT, AVG, GROUP BY) to avoid N+1.
     */
    public function index(Request $request): JsonResponse
    {
        // ── Sales Analytics ──────────────────────────────────────────
        $totalRevenue      = (float) Order::where('status', '!=', 'Cancelled')->sum('total');
        $totalOrders       = Order::count();
        $nonCancelledCount = Order::where('status', '!=', 'Cancelled')->count();
        $avgOrderValue     = $nonCancelledCount > 0 ? $totalRevenue / $nonCancelledCount : 0;

        // Revenue growth: compare last 30 days vs the 30 days before that
        $currentPeriodRevenue = (float) Order::where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('total');

        $previousPeriodRevenue = (float) Order::where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', now()->subDays(60))
            ->where('created_at', '<', now()->subDays(30))
            ->sum('total');

        $revenueGrowth = $previousPeriodRevenue > 0
            ? round((($currentPeriodRevenue - $previousPeriodRevenue) / $previousPeriodRevenue) * 100, 1)
            : ($currentPeriodRevenue > 0 ? 100.0 : 0.0);

        // ── Monthly Revenue (last 12 months, zero-filled) ───────────
        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthlyRevenue[$monthKey] = [
                'month'   => $date->format('M'),
                'revenue' => 0,
                'orders'  => 0,
            ];
        }

        $monthlyData = Order::where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key, SUM(total) as revenue, COUNT(*) as order_count")
            ->groupBy('month_key')
            ->get();

        foreach ($monthlyData as $row) {
            if (isset($monthlyRevenue[$row->month_key])) {
                $monthlyRevenue[$row->month_key]['revenue'] = round((float) $row->revenue, 2);
                $monthlyRevenue[$row->month_key]['orders']  = (int) $row->order_count;
            }
        }

        // ── Weekly Revenue (last 8 weeks) ───────────────────────────
        $weeklyRevenue = [];
        for ($i = 7; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd   = now()->subWeeks($i)->endOfWeek();
            $weekLabel = $weekStart->format('d M');

            $weekRev = (float) Order::where('status', '!=', 'Cancelled')
                ->whereBetween('created_at', [$weekStart, $weekEnd])
                ->sum('total');

            $weeklyRevenue[] = [
                'week'    => $weekLabel,
                'revenue' => round($weekRev, 2),
            ];
        }

        // ── Daily Revenue (last 30 days) ────────────────────────────
        $dailyRevenue = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $dayKey   = $day->format('Y-m-d');
            $dayLabel = $day->format('d M');
            $dailyRevenue[$dayKey] = [
                'day'     => $dayLabel,
                'revenue' => 0,
            ];
        }

        $dailyData = Order::where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw("DATE(created_at) as day_key, SUM(total) as revenue")
            ->groupBy('day_key')
            ->get();

        foreach ($dailyData as $row) {
            if (isset($dailyRevenue[$row->day_key])) {
                $dailyRevenue[$row->day_key]['revenue'] = round((float) $row->revenue, 2);
            }
        }

        // ── Order Analytics ─────────────────────────────────────────
        $ordersByStatus = Order::selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $orderAnalytics = [
            'processing' => $ordersByStatus['Processing'] ?? 0,
            'shipped'    => $ordersByStatus['Shipped'] ?? 0,
            'delivered'  => $ordersByStatus['Delivered'] ?? 0,
            'cancelled'  => $ordersByStatus['Cancelled'] ?? 0,
            'total'      => $totalOrders,
        ];

        // ── Customer Analytics ──────────────────────────────────────
        $totalCustomers    = User::count();
        $newCustomers      = User::where('created_at', '>=', now()->subDays(30))->count();

        // Returning customers: users with more than 1 order
        $returningCustomers = (int) DB::table('orders')
            ->whereNotNull('user_id')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        $customersWithOrders = (int) DB::table('orders')
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $repeatPurchaseRate = $customersWithOrders > 0
            ? round(($returningCustomers / $customersWithOrders) * 100, 1)
            : 0;

        $customerAnalytics = [
            'total_customers'      => $totalCustomers,
            'new_customers'        => $newCustomers,
            'returning_customers'  => $returningCustomers,
            'repeat_purchase_rate' => $repeatPurchaseRate,
        ];

        // ── Product Analytics ───────────────────────────────────────
        // Best selling products (by total quantity sold, top 5)
        $bestSelling = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('products.id, products.name, products.images, SUM(order_items.quantity) as total_sold, SUM(order_items.price * order_items.quantity) as total_revenue')
            ->groupBy('products.id', 'products.name', 'products.images')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $images = json_decode($item->images, true) ?? [];
                return [
                    'id'            => $item->id,
                    'name'          => $item->name,
                    'image'         => $images[0] ?? '',
                    'total_sold'    => (int) $item->total_sold,
                    'total_revenue' => round((float) $item->total_revenue, 2),
                ];
            });

        // Worst selling products (products with fewest sales, bottom 5, excluding zero-sale products with no orders at all)
        $worstSelling = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('products.id, products.name, products.images, SUM(order_items.quantity) as total_sold, SUM(order_items.price * order_items.quantity) as total_revenue')
            ->groupBy('products.id', 'products.name', 'products.images')
            ->orderBy('total_sold', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $images = json_decode($item->images, true) ?? [];
                return [
                    'id'            => $item->id,
                    'name'          => $item->name,
                    'image'         => $images[0] ?? '',
                    'total_sold'    => (int) $item->total_sold,
                    'total_revenue' => round((float) $item->total_revenue, 2),
                ];
            });

        // Best collections (by total units sold)
        $bestCollections = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('products.collection, SUM(order_items.quantity) as total_sold')
            ->groupBy('products.collection')
            ->orderByDesc('total_sold')
            ->get()
            ->map(function ($item) {
                $displayMapping = [
                    'new-arrivals'       => 'New Arrivals',
                    'best-sellers'       => 'Best Sellers',
                    'oversized'          => 'Oversized',
                    'everyday-essentials'=> 'Everyday',
                    'limited-edition'    => 'Limited Ed.',
                ];
                return [
                    'name'       => $displayMapping[$item->collection] ?? ucfirst($item->collection),
                    'collection' => $item->collection,
                    'total_sold' => (int) $item->total_sold,
                ];
            });

        // Ensure all collections are represented even if zero sales
        $allCollections = ['new-arrivals', 'best-sellers', 'oversized', 'everyday-essentials', 'limited-edition'];
        $displayMapping = [
            'new-arrivals'       => 'New Arrivals',
            'best-sellers'       => 'Best Sellers',
            'oversized'          => 'Oversized',
            'everyday-essentials'=> 'Everyday',
            'limited-edition'    => 'Limited Ed.',
        ];
        $collectionChartData = [];
        foreach ($allCollections as $col) {
            $existing = $bestCollections->firstWhere('collection', $col);
            $collectionChartData[] = [
                'name'       => $displayMapping[$col] ?? ucfirst($col),
                'total_sold' => $existing ? $existing['total_sold'] : 0,
            ];
        }

        // Low stock products (available stock <= 5)
        $reservedSql = '(SELECT COALESCE(SUM(quantity), 0) FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE order_items.product_id = products.id AND orders.status IN ("Processing", "Shipped"))';

        $lowStockProducts = Product::whereRaw("COALESCE(stock, 0) - {$reservedSql} <= 5")
            ->select('id', 'name', 'images', 'stock')
            ->get()
            ->map(function ($product) {
                $reserved = (int) OrderItem::where('product_id', $product->id)
                    ->whereHas('order', function ($q) {
                        $q->whereIn('status', ['Processing', 'Shipped']);
                    })
                    ->sum('quantity');
                $available = max(0, $product->stock - $reserved);

                return [
                    'id'        => $product->id,
                    'name'      => $product->name,
                    'image'     => ($product->images ?? [])[0] ?? '',
                    'stock'     => $product->stock,
                    'available' => $available,
                ];
            });

        // ── Sales by Size ───────────────────────────────────────────
        $salesBySize = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('order_items.size, SUM(order_items.quantity) as units')
            ->groupBy('order_items.size')
            ->orderByRaw("CASE order_items.size WHEN 'XS' THEN 1 WHEN 'S' THEN 2 WHEN 'M' THEN 3 WHEN 'L' THEN 4 ELSE 5 END")
            ->get()
            ->map(fn ($row) => ['size' => $row->size, 'units' => (int) $row->units]);

        // Ensure all sizes present even if zero
        $allSizes = ['XS', 'S', 'M', 'L'];
        $sizeChartData = [];
        foreach ($allSizes as $sz) {
            $existing = $salesBySize->firstWhere('size', $sz);
            $sizeChartData[] = [
                'size'  => $sz,
                'units' => $existing ? $existing['units'] : 0,
            ];
        }

        // ── Build Response ──────────────────────────────────────────
        return response()->json([
            'sales' => [
                'total_revenue'   => round($totalRevenue, 2),
                'total_orders'    => $totalOrders,
                'avg_order_value' => round($avgOrderValue, 2),
                'revenue_growth'  => $revenueGrowth,
            ],
            'orders'    => $orderAnalytics,
            'customers' => $customerAnalytics,
            'products'  => [
                'best_selling'  => $bestSelling,
                'worst_selling' => $worstSelling,
                'low_stock'     => $lowStockProducts,
            ],
            'charts' => [
                'monthly_revenue'     => array_values($monthlyRevenue),
                'weekly_revenue'      => $weeklyRevenue,
                'daily_revenue'       => array_values($dailyRevenue),
                'collection_sales'    => $collectionChartData,
                'size_sales'          => $sizeChartData,
            ],
        ]);
    }
}
