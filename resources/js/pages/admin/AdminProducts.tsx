import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { products } from "@/data/products";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("");

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesColl = !collection || p.collection === collection;
    return matchesQuery && matchesColl;
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Products</h1>
            <p className="text-sm text-muted-foreground">{products.length} pieces in catalogue</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-add-product">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Product
          </button>
        </div>

        <div className="bg-card">
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-product-search"
              />
            </div>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="bg-transparent border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer"
              data-testid="select-admin-collection-filter"
            >
              <option value="">All Collections</option>
              <option value="new-arrivals">New Arrivals</option>
              <option value="best-sellers">Best Sellers</option>
              <option value="oversized">Oversized</option>
              <option value="everyday-essentials">Everyday Essentials</option>
              <option value="limited-edition">Limited Edition</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Product", "Collection", "Price", "Stock", "Rating", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-card/50 transition-colors" data-testid={`admin-product-row-${product.id}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-10 h-12 object-cover flex-shrink-0 bg-background" />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{product.collection.replace(/-/g, " ")}</td>
                  <td className="py-3 px-4">${product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${product.inStock ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">{product.rating} ({product.reviewCount})</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:text-accent transition-colors" data-testid={`button-edit-product-${product.id}`} aria-label="Edit">
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button className="p-1.5 hover:text-destructive transition-colors" data-testid={`button-delete-product-${product.id}`} aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 border-t border-border/20 text-xs text-muted-foreground">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
