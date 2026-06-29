import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Search } from "lucide-react";

const CUSTOMERS = [
  { id: "C001", name: "Isabelle M.", email: "isabelle@example.com", joined: "Jan 2023", orders: 8, spent: 2340, tier: "VIP" },
  { id: "C002", name: "Clara T.", email: "clara@example.com", joined: "Mar 2023", orders: 5, spent: 1175, tier: "Regular" },
  { id: "C003", name: "Valentina R.", email: "val@example.com", joined: "Jun 2023", orders: 12, spent: 3180, tier: "VIP" },
  { id: "C004", name: "Nadia T.", email: "nadia@example.com", joined: "Aug 2023", orders: 3, spent: 765, tier: "Regular" },
  { id: "C005", name: "Sofia M.", email: "sofia@example.com", joined: "Feb 2023", orders: 9, spent: 1890, tier: "VIP" },
  { id: "C006", name: "Elena M.", email: "elena@example.com", joined: "Sep 2023", orders: 2, spent: 850, tier: "Regular" },
  { id: "C007", name: "Bianca M.", email: "bianca@example.com", joined: "Nov 2022", orders: 15, spent: 3525, tier: "VIP" },
  { id: "C008", name: "Laura B.", email: "laura@example.com", joined: "Dec 2023", orders: 1, spent: 235, tier: "New" },
];

const TIER_STYLES: Record<string, string> = {
  VIP: "bg-accent/10 text-accent",
  Regular: "bg-muted text-muted-foreground",
  New: "bg-card text-foreground",
};

export default function AdminCustomers() {
  const [query, setQuery] = useState("");
  const filtered = CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Customers</h1>
          <p className="text-sm text-muted-foreground">{CUSTOMERS.length} registered customers</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">{CUSTOMERS.filter((c) => c.tier === "VIP").length}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">VIP Members</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">${CUSTOMERS.reduce((s, c) => s + c.spent, 0).toLocaleString()}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Revenue</p>
          </div>
          <div className="bg-card p-6 text-center">
            <p className="font-serif text-2xl mb-1">${Math.round(CUSTOMERS.reduce((s, c) => s + c.spent, 0) / CUSTOMERS.length)}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg. Lifetime Value</p>
          </div>
        </div>

        <div className="bg-card">
          <div className="p-4 border-b border-border/20">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-customer-search"
              />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Customer", "Joined", "Orders", "Total Spent", "Tier"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-card/50 transition-colors" data-testid={`admin-customer-row-${c.id}`}>
                  <td className="py-3 px-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{c.joined}</td>
                  <td className="py-3 px-4">{c.orders}</td>
                  <td className="py-3 px-4 font-medium">${c.spent.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${TIER_STYLES[c.tier] || ""}`}>{c.tier}</span>
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
