import { AdminLayout } from "./AdminLayout";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const MONTHLY = [
  { month: "Aug", orders: 68, revenue: 18400, visitors: 4210 },
  { month: "Sep", orders: 82, revenue: 22100, visitors: 5190 },
  { month: "Oct", orders: 118, revenue: 31500, visitors: 7240 },
  { month: "Nov", orders: 154, revenue: 41200, visitors: 9810 },
  { month: "Dec", orders: 213, revenue: 56800, visitors: 13200 },
  { month: "Jan", orders: 143, revenue: 38400, visitors: 8760 },
  { month: "Feb", orders: 110, revenue: 29700, visitors: 6420 },
];

const COLOR_DATA = [
  { name: "Ivory", value: 38 },
  { name: "Black", value: 32 },
  { name: "Mocha", value: 20 },
  { name: "Olive", value: 10 },
];

const SIZE_DATA = [
  { size: "XS", units: 142 },
  { size: "S", units: 312 },
  { size: "M", units: 287 },
  { size: "L", units: 198 },
];

const PIE_COLORS = ["#F5F0E8", "#1A1A1A", "#8C6A56", "#5C5C3D"];

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance overview · Last 7 months</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders + Revenue Trend */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Orders & Revenue</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={MONTHLY}>
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
          </div>

          {/* Visitors */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Store Visitors</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="visitors" fill="hsl(22,24%,44%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Breakdown */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Sales by Color</h2>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={COLOR_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {COLOR_DATA.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} stroke="hsl(30,20%,82%)" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {COLOR_DATA.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full border border-border/30 flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-sm">{c.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Size Breakdown */}
          <div className="bg-card p-6">
            <h2 className="font-serif text-xl mb-6">Sales by Size</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SIZE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,82%)" />
                <XAxis dataKey="size" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="units" fill="hsl(0,0%,12%)" radius={[2, 2, 0, 0]} label={{ position: "top", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Conversion Rate", value: "3.2%", change: "+0.4%" },
            { label: "Cart Abandonment", value: "68%", change: "−2.1%" },
            { label: "Return Rate", value: "4.8%", change: "−0.3%" },
            { label: "Avg. Session Duration", value: "4m 12s", change: "+18s" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card p-6" data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{kpi.label}</p>
              <p className="font-serif text-2xl mb-1">{kpi.value}</p>
              <p className="text-xs text-accent">{kpi.change} vs last period</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
