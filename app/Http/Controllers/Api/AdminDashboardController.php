<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        // 1. Cards statistics
        $totalRevenue = (float) Order::where('status', '!=', 'Cancelled')->sum('total');
        $totalOrders = Order::count();
        $totalCustomers = User::count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // 2. Revenue Chart Data (Last 12 Months)
        $revenueByMonth = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->format('M');
            $revenueByMonth[$monthKey] = [
                'month' => $monthLabel,
                'revenue' => 0
            ];
        }

        $orders = Order::where('status', '!=', 'Cancelled')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->get();

        foreach ($orders as $order) {
            $monthKey = $order->created_at->format('Y-m');
            if (isset($revenueByMonth[$monthKey])) {
                $revenueByMonth[$monthKey]['revenue'] += (float)$order->total;
            }
        }

        $revenueChartData = array_values($revenueByMonth);

        // 3. Collection Sales Chart Data
        $collectionSales = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('products.collection, SUM(order_items.quantity) as sales')
            ->groupBy('products.collection')
            ->get();

        $displayMapping = [
            'new-arrivals' => 'New Arrivals',
            'best-sellers' => 'Best Sellers',
            'oversized' => 'Oversized',
            'everyday-essentials' => 'Everyday',
            'limited-edition' => 'Limited Ed.',
        ];

        $collectionChartData = [];
        foreach ($displayMapping as $slug => $label) {
            $saleRow = $collectionSales->firstWhere('collection', $slug);
            $collectionChartData[] = [
                'name' => $label,
                'sales' => $saleRow ? (int)$saleRow->sales : 0
            ];
        }

        // 4. Recent Orders
        $recentOrders = Order::with(['items.product'])->orderBy('created_at', 'desc')->limit(5)->get();
        $recentOrdersData = $recentOrders->map(function ($order) {
            $firstItem = $order->items->first();
            $productName = $firstItem && $firstItem->product ? $firstItem->product->name : 'N/A';
            $itemCount = $order->items->count();
            if ($itemCount > 1) {
                $productName .= ' + ' . ($itemCount - 1) . ' more';
            }

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->first_name . ' ' . $order->last_name,
                'product' => $productName,
                'amount' => (float)$order->total,
                'status' => $order->status,
                'date' => $order->created_at->format('d M Y')
            ];
        });

        return response()->json([
            'cards' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'avg_order_value' => $avgOrderValue,
            ],
            'revenue_chart' => $revenueChartData,
            'collection_chart' => $collectionChartData,
            'recent_orders' => $recentOrdersData,
        ]);
    }
}
