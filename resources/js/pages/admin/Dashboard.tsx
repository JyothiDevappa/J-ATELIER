import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { fetchDashboardData, DashboardData } from "@/lib/dashboardApi";
import { toast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-accent/10 text-accent",
  Shipped: "bg-muted text-muted-foreground",
  Delivered: "bg-card text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch (error: any) {
        toast({
          title: "Failed to load dashboard data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 py-20 text-center text-sm text-muted-foreground">
          Loading dashboard statistics...
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${(data?.cards.total_revenue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "Live from database",
      icon: DollarSign,
      up: true,
    },
    {
      label: "Orders",
      value: (data?.cards.total_orders || 0).toLocaleString(),
      change: "Live from database",
      icon: ShoppingBag,
      up: true,
    },
    {
      label: "Customers",
      value: (data?.cards.total_customers || 0).toLocaleString(),
      change: "Live from database",
      icon: Users,
      up: true,
    },
    {
      label: "Avg. Order Value",
      value: `$${(data?.cards.avg_order_value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "Live from database",
      icon: TrendingUp,
      up: true,
    },
  ];

  const recentOrders = data?.recent_orders || [];
  const revenueChartData = data?.revenue_chart || [];
  const collectionChartData = data?.collection_chart || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, change, icon: Icon, up }) => (
            <div key={label} className="bg-card p-6" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
                <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="font-serif text-2xl text-foreground mb-1">{value}</p>
              <p className="text-xs text-muted-foreground">{change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Revenue</h2>
            {revenueChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(22,24%,44%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(22,24%,44%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(22,24%,44%)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sales by Collection */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">By Collection</h2>
            {collectionChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={collectionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(22,24%,44%)" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">View All</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Order", "Customer", "Product", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground pb-3 pr-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} data-testid={`admin-order-row-${order.id}`}>
                    <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">#{order.order_number}</td>
                    <td className="py-3 pr-4">{order.customer}</td>
                    <td className="py-3 pr-4 text-muted-foreground truncate max-w-[160px]">{order.product}</td>
                    <td className="py-3 pr-4">${order.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status] || ""}`}>{order.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
