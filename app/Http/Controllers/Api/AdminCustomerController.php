<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    /**
     * GET /api/admin/customers
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount(['orders'])
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('status', '!=', 'Cancelled');
            }], 'total');

        // Search by Name or Email
        if ($request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'highest_spending':
                $query->orderByRaw('COALESCE(total_spent, 0) desc');
                break;
            case 'most_orders':
                $query->orderBy('orders_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginate - 10 per page
        $paginated = $query->paginate(10);

        // Map Tier on backend or return items wrapped
        $items = collect($paginated->items())->map(function ($user) {
            $spent = (float) ($user->total_spent ?? 0);
            $tier = 'New';
            if ($spent >= 1500) {
                $tier = 'VIP';
            } elseif ($spent > 0) {
                $tier = 'Regular';
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'joined' => $user->created_at->format('M Y'),
                'joined_full' => $user->created_at->format('d M Y'),
                'orders' => $user->orders_count,
                'spent' => $spent,
                'tier' => $tier,
            ];
        });

        // Sum overall VIP count and aggregate totals for the page/cards header
        $totalCustomersCount = User::count();
        
        // Sum total spent and count VIPs overall in DB
        $allCustomersSpent = (float) \App\Models\Order::where('status', '!=', 'Cancelled')->sum('total');
        
        // Count VIPs (total spent >= 1500)
        $vipCount = User::has('orders')
            ->whereHas('orders', function ($q) {
                $q->where('status', '!=', 'Cancelled');
            })
            ->select('users.id')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('status', '!=', 'Cancelled');
            }], 'total')
            ->get()
            ->filter(function ($u) {
                return (float) ($u->total_spent ?? 0) >= 1500;
            })
            ->count();

        $avgLifetimeValue = $totalCustomersCount > 0 ? $allCustomersSpent / $totalCustomersCount : 0;

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
            'header' => [
                'vip_count' => $vipCount,
                'total_spent' => $allCustomersSpent,
                'avg_lifetime_value' => $avgLifetimeValue,
                'total_customers' => $totalCustomersCount
            ]
        ]);
    }

    /**
     * GET /api/admin/customers/{user}
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['addresses', 'orders.items.product']);
        
        $totalOrders = $user->orders()->count();
        $totalSpent = (float) $user->orders()->where('status', '!=', 'Cancelled')->sum('total');
        $lastOrder = $user->orders()->latest()->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->addresses->first()?->phone ?? 'N/A',
                'joined' => $user->created_at->format('d M Y'),
                'addresses' => $user->addresses,
                'orders' => $user->orders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total' => (float)$order->total,
                        'status' => $order->status,
                        'date' => $order->created_at->format('d M Y'),
                        'items_count' => $order->items->reduce(fn($acc, $it) => $acc + $it->quantity, 0),
                    ];
                })
            ],
            'stats' => [
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'last_order_date' => $lastOrder ? $lastOrder->created_at->format('d M Y') : 'N/A',
            ]
        ]);
    }
}
