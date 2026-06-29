import { AdminLayout } from "./AdminLayout";
import { TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const REVENUE_DATA = [
  { month: "Aug", revenue: 18400 },
  { month: "Sep", revenue: 22100 },
  { month: "Oct", revenue: 31500 },
  { month: "Nov", revenue: 41200 },
  { month: "Dec", revenue: 56800 },
  { month: "Jan", revenue: 38400 },
  { month: "Feb", revenue: 29700 },
];

const COLLECTION_DATA = [
  { name: "New Arrivals", sales: 142 },
  { name: "Best Sellers", sales: 312 },
  { name: "Oversized", sales: 198 },
  { name: "Everyday", sales: 241 },
  { name: "Limited Ed.", sales: 87 },
];

const RECENT_ORDERS = [
  { id: "JA-538421", customer: "Isabelle M.", product: "Cashmere Blend Pullover", amount: 295, status: "Processing" },
  { id: "JA-538420", customer: "Clara T.", product: "Classic Oversized Pullover", amount: 235, status: "Shipped" },
  { id: "JA-538419", customer: "Valentina R.", product: "Turtleneck Hoodie", amount: 275, status: "Delivered" },
  { id: "JA-538418", customer: "Nadia T.", product: "Archive Pullover", amount: 495, status: "Processing" },
  { id: "JA-538417", customer: "Sofia M.", product: "Drawstring Comfort Hoodie", amount: 210, status: "Delivered" },
];

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-accent/10 text-accent",
  Shipped: "bg-muted text-muted-foreground",
  Delivered: "bg-card text-foreground",
};

export default function Dashboard() {
  const stats = [
    { label: "Total Revenue", value: "$238,100", change: "+18.2%", icon: DollarSign, up: true },
    { label: "Orders", value: "1,247", change: "+12.4%", icon: ShoppingBag, up: true },
    { label: "Customers", value: "894", change: "+8.1%", icon: Users, up: true },
    { label: "Avg. Order Value", value: "$247", change: "+6.8%", icon: TrendingUp, up: true },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">February 2025 overview</p>
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
              <p className={`text-xs ${up ? "text-accent" : "text-destructive"}`}>{change} from last month</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Revenue</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(22,24%,44%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(22,24%,44%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(22,24%,44%)" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Collection */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">By Collection</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={COLLECTION_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(22,24%,44%)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              {RECENT_ORDERS.map((order) => (
                <tr key={order.id} data-testid={`admin-order-row-${order.id}`}>
                  <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">{order.id}</td>
                  <td className="py-3 pr-4">{order.customer}</td>
                  <td className="py-3 pr-4 text-muted-foreground truncate max-w-[160px]">{order.product}</td>
                  <td className="py-3 pr-4">${order.amount}</td>
                  <td className="py-3">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status] || ""}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
