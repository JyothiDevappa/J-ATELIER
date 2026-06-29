import { AdminLayout } from "./AdminLayout";
import { products } from "@/data/products";
import { AlertTriangle } from "lucide-react";

const STOCK_DATA = products.map((p) => ({
  id: p.id,
  name: p.name,
  collection: p.collection,
  ivory: Math.floor(Math.random() * 30),
  black: Math.floor(Math.random() * 30),
  mocha: Math.floor(Math.random() * 20),
  olive: Math.floor(Math.random() * 20),
  total: 0,
  inStock: p.inStock,
})).map((p) => ({ ...p, total: p.ivory + p.black + p.mocha + p.olive }));

const LOW_STOCK_THRESHOLD = 5;

export default function AdminInventory() {
  const lowStock = STOCK_DATA.filter((p) => p.total < LOW_STOCK_THRESHOLD);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Inventory</h1>
          <p className="text-sm text-muted-foreground">Stock levels across all products</p>
        </div>

        {lowStock.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-destructive mb-1">{lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low</p>
              <p className="text-xs text-muted-foreground">{lowStock.map((p) => p.name).join(", ")}</p>
            </div>
          </div>
        )}

        <div className="bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Product", "Collection", "Ivory", "Black", "Mocha", "Olive", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {STOCK_DATA.map((item) => {
                const isLow = item.total < LOW_STOCK_THRESHOLD;
                return (
                  <tr key={item.id} className={`hover:bg-card/50 transition-colors ${isLow ? "bg-destructive/3" : ""}`} data-testid={`admin-inventory-row-${item.id}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium truncate max-w-[160px]">{item.name}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{item.collection.replace(/-/g, " ")}</td>
                    {["ivory", "black", "mocha", "olive"].map((color) => (
                      <td key={color} className={`py-3 px-4 text-xs ${(item[color as keyof typeof item] as number) < 3 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {item[color as keyof typeof item] as number}
                      </td>
                    ))}
                    <td className={`py-3 px-4 font-medium ${isLow ? "text-destructive" : ""}`}>{item.total}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${isLow ? "bg-destructive/10 text-destructive" : item.inStock ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {isLow ? "Low Stock" : item.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
