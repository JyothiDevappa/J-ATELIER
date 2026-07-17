import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { fetchAnalyticsData, AnalyticsData } from "@/lib/analyticsApi";
import { toast } from "@/hooks/use-toast";

const PIE_COLORS = ["#F5F0E8", "#1A1A1A", "#F4A7B9", "#87CEEB", "#8C6A56"];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAnalyticsData();
        setData(result);
      } catch (error: any) {
        toast({
          title: "Failed to load analytics",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 py-20 text-center text-sm text-muted-foreground">
          Loading analytics data...
        </div>
      </AdminLayout>
    );
  }

  const sales = data?.sales;
  const orders = data?.orders;
  const customers = data?.customers;
  const charts = data?.charts;
  const products = data?.products;

  const monthlyData = charts?.monthly_revenue || [];
  const collectionData = charts?.collection_sales || [];
  const sizeData = charts?.size_sales || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance overview · Real-time data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders + Revenue Trend */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Orders & Revenue</h2>
            {monthlyData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                No order data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(0,0%,12%)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(22,24%,44%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sales by Collection */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Sales by Collection</h2>
            {collectionData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                No collection sales data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={collectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total_sold" name="Units Sold" fill="hsl(22,24%,44%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Order Status</h2>
            {(!orders || orders.total === 0) ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Processing", value: orders.processing },
                        { name: "Shipped", value: orders.shipped },
                        { name: "Delivered", value: orders.delivered },
                        { name: "Cancelled", value: orders.cancelled },
                      ].filter(d => d.value > 0)}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {[
                        { name: "Processing", value: orders.processing },
                        { name: "Shipped", value: orders.shipped },
                        { name: "Delivered", value: orders.delivered },
                        { name: "Cancelled", value: orders.cancelled },
                      ].filter(d => d.value > 0).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(30,20%,82%)" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v} orders`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {[
                    { label: "Processing", value: orders.processing, color: PIE_COLORS[0] },
                    { label: "Shipped", value: orders.shipped, color: PIE_COLORS[1] },
                    { label: "Delivered", value: orders.delivered, color: PIE_COLORS[2] },
                    { label: "Cancelled", value: orders.cancelled, color: PIE_COLORS[3] },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full border border-border/30 flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Breakdown */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Sales by Size</h2>
            {sizeData.every(d => d.units === 0) ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                No size data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sizeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                  <XAxis dataKey="size" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="units" fill="hsl(0,0%,12%)" radius={[2, 2, 0, 0]} label={{ position: "top", fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Revenue",
              value: `$${(sales?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: `${(sales?.revenue_growth ?? 0) >= 0 ? "+" : ""}${sales?.revenue_growth ?? 0}%`,
            },
            {
              label: "Total Orders",
              value: (sales?.total_orders || 0).toLocaleString(),
              change: `${orders?.processing || 0} processing`,
            },
            {
              label: "Avg. Order Value",
              value: `$${(sales?.avg_order_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: "Live from database",
            },
            {
              label: "Repeat Purchase Rate",
              value: `${customers?.repeat_purchase_rate || 0}%`,
              change: `${customers?.returning_customers || 0} returning`,
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card p-6" data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{kpi.label}</p>
              <p className="font-serif text-2xl mb-1">{kpi.value}</p>
              <p className="text-xs text-accent">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Customer & Product Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Customer Stats */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Customer Insights</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Customers", value: customers?.total_customers || 0 },
                { label: "New (30 days)", value: customers?.new_customers || 0 },
                { label: "Returning", value: customers?.returning_customers || 0 },
                { label: "Repeat Rate", value: `${customers?.repeat_purchase_rate || 0}%` },
              ].map((stat) => (
                <div key={stat.label} className="border border-border/20 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-serif text-xl">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Best Selling Products</h2>
            {(!products?.best_selling || products.best_selling.length === 0) ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No sales data available yet
              </div>
            ) : (
              <div className="space-y-3">
                {products.best_selling.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-8 h-10 object-cover bg-background flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_sold} sold · ${product.total_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert & Worst Selling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Products */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Low Stock Alert</h2>
            {(!products?.low_stock || products.low_stock.length === 0) ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                All products are well stocked
              </div>
            ) : (
              <div className="space-y-3">
                {products.low_stock.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-8 h-10 object-cover bg-background flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Stock: {product.stock} · Available: {product.available}</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${product.available <= 0 ? "bg-destructive/10 text-destructive" : "bg-destructive/5 text-destructive"}`}>
                      {product.available <= 0 ? "Out of Stock" : "Low Stock"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worst Selling Products */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Least Selling Products</h2>
            {(!products?.worst_selling || products.worst_selling.length === 0) ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No sales data available yet
              </div>
            ) : (
              <div className="space-y-3">
                {products.worst_selling.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-8 h-10 object-cover bg-background flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_sold} sold · ${product.total_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
