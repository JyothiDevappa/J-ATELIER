import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Search, Download } from "lucide-react";

const ORDERS = [
  { id: "JA-538421", customer: "Isabelle M.", email: "isabelle@example.com", date: "12 Feb 2025", items: 1, amount: 295, status: "Processing", method: "Card" },
  { id: "JA-538420", customer: "Clara T.", email: "clara@example.com", date: "11 Feb 2025", items: 1, amount: 235, status: "Shipped", method: "Card" },
  { id: "JA-538419", customer: "Valentina R.", email: "val@example.com", date: "10 Feb 2025", items: 2, amount: 550, status: "Delivered", method: "Apple Pay" },
  { id: "JA-538418", customer: "Nadia T.", email: "nadia@example.com", date: "10 Feb 2025", items: 1, amount: 495, status: "Processing", method: "Card" },
  { id: "JA-538417", customer: "Sofia M.", email: "sofia@example.com", date: "9 Feb 2025", items: 3, amount: 660, status: "Delivered", method: "Google Pay" },
  { id: "JA-538416", customer: "Elena M.", email: "elena@example.com", date: "8 Feb 2025", items: 1, amount: 425, status: "Shipped", method: "Card" },
  { id: "JA-538415", customer: "Bianca M.", email: "bianca@example.com", date: "7 Feb 2025", items: 2, amount: 490, status: "Delivered", method: "Card" },
  { id: "JA-538414", customer: "Laura B.", email: "laura@example.com", date: "6 Feb 2025", items: 1, amount: 235, status: "Delivered", method: "Card" },
];

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-accent/10 text-accent",
  Shipped: "bg-muted text-muted-foreground",
  Delivered: "bg-card text-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

const STATUSES = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = ORDERS.filter((o) =>
    (status === "All" || o.status === status) &&
    (o.id.toLowerCase().includes(query.toLowerCase()) || o.customer.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Orders</h1>
            <p className="text-sm text-muted-foreground">{ORDERS.length} orders total</p>
          </div>
          <button className="flex items-center gap-2 border border-border/40 text-foreground px-5 py-3 text-xs uppercase tracking-widest hover:border-accent transition-colors" data-testid="button-export-orders">
            <Download className="w-4 h-4" strokeWidth={1.5} /> Export CSV
          </button>
        </div>

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order or customer..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-order-search"
              />
            </div>
            <div className="flex gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${status === s ? "bg-primary text-primary-foreground" : "border border-border/40 text-muted-foreground hover:border-accent"}`}
                  data-testid={`filter-status-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Order ID", "Customer", "Date", "Items", "Amount", "Method", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-card/50 transition-colors cursor-pointer" data-testid={`admin-order-row-${order.id}`}>
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{order.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{order.date}</td>
                  <td className="py-3 px-4">{order.items}</td>
                  <td className="py-3 px-4 font-medium">${order.amount}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{order.method}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status] || ""}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-t border-border/20 text-xs text-muted-foreground">
            Showing {filtered.length} of {ORDERS.length} orders
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
