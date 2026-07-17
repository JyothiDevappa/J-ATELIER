import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { AlertTriangle, Search } from "lucide-react";
import { fetchAdminInventory, updateProductStock, updateVariantStock, PaginatedInventory, AdminInventoryItem, AdminVariantItem } from "@/lib/inventoryApi";
import { toast } from "@/hooks/use-toast";
import { clearProductCache } from "@/hooks/useProducts";

const STATUS_STYLES: Record<string, string> = {
  "In Stock": "bg-accent/10 text-accent",
  "Low Stock": "bg-destructive/10 text-destructive",
  "Out of Stock": "bg-muted text-muted-foreground",
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock", value: "low_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
];

export default function AdminInventory() {
  const [paginatedData, setPaginatedData] = useState<PaginatedInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (query) params.query = query;
      if (statusFilter) params.status = statusFilter;

      const data = await fetchAdminInventory(params);
      setPaginatedData(data);
    } catch (error: any) {
      toast({
        title: "Failed to load inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, statusFilter]);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadInventory();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  interface GroupedVariant {
    color: string;
    hex: string;
    sizes: AdminVariantItem[];
  }

  const getGroupedVariants = (variants: AdminVariantItem[]): GroupedVariant[] => {
    const groups: Record<string, GroupedVariant> = {};
    variants.forEach((v) => {
      if (!groups[v.color]) {
        groups[v.color] = {
          color: v.color,
          hex: v.hex || "#CCCCCC",
          sizes: [],
        };
      }
      groups[v.color].sizes.push(v);
    });
    const sizeOrder = ["XS", "S", "M", "L", "XL"];
    Object.values(groups).forEach(g => {
      g.sizes.sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
    });
    return Object.values(groups);
  };

  const handleVariantStockUpdate = async (productId: number, variantId: number, newStock: number) => {
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "Invalid Stock Value",
        description: "Stock cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (paginatedData) {
      const updatedData = { ...paginatedData };
      updatedData.data = updatedData.data.map(p => {
        if (p.id === productId) {
          const updatedVariants = p.variants.map(v => {
            if (v.id === variantId) {
              return { ...v, current_stock: newStock, available_stock: Math.max(0, newStock - v.reserved_stock) };
            }
            return v;
          });
          
          const totalCurrent = updatedVariants.reduce((sum, v) => sum + v.current_stock, 0);
          const totalReserved = updatedVariants.reduce((sum, v) => sum + v.reserved_stock, 0);
          const totalAvailable = updatedVariants.reduce((sum, v) => sum + v.available_stock, 0);
          
          let overallStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (totalAvailable <= 0) {
            overallStatus = 'Out of Stock';
          } else if (updatedVariants.some(v => v.available_stock <= 5)) {
            overallStatus = 'Low Stock';
          }

          return {
            ...p,
            variants: updatedVariants,
            current_stock: totalCurrent,
            reserved_stock: totalReserved,
            available_stock: totalAvailable,
            status: overallStatus
          };
        }
        return p;
      });
      setPaginatedData(updatedData);
    }

    try {
      await updateVariantStock(variantId, newStock);
      toast({
        title: "Stock updated",
        description: "Variant inventory has been successfully adjusted.",
      });
      clearProductCache();
    } catch (error: any) {
      toast({
        title: "Failed to update stock",
        description: error.message,
        variant: "destructive",
      });
      loadInventory();
    }
  };

  const inventoryItems = paginatedData?.data || [];
  const lowStockList = paginatedData?.low_stock_list || [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-1">Inventory</h1>
          <p className="text-sm text-muted-foreground">Stock levels across all products</p>
        </div>

        {/* Low Stock Alerts */}
        {!loading && lowStockList.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-destructive mb-1">
                {lowStockList.length} product{lowStockList.length > 1 ? "s" : ""} running low or out of stock
              </p>
              <p className="text-xs text-muted-foreground">{lowStockList.join(", ")}</p>
            </div>
          </div>
        )}

        <div className="bg-card">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-border/20 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full bg-transparent border border-border/40 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                data-testid="input-admin-inventory-search"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${statusFilter === f.value ? "bg-primary text-primary-foreground" : "border border-border/40 text-muted-foreground hover:border-accent"}`}
                  data-testid={`filter-status-${f.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                {["Product", "SKU", "Collection", "Current Stock", "Reserved", "Available", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Loading inventory...</td>
                </tr>
              ) : inventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No inventory items found.</td>
                </tr>
              ) : inventoryItems.map((item) => {
                const isLow = item.status === "Low Stock";
                const isOut = item.status === "Out of Stock";
                
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-card/50 transition-colors ${isOut ? "bg-muted/5" : isLow ? "bg-destructive/3" : ""}`}
                    data-testid={`admin-inventory-row-${item.id}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} className="w-10 h-12 object-cover bg-background" alt={item.name} />
                        <p className="font-medium truncate max-w-[160px]">{item.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{item.sku}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{item.collection.replace(/-/g, " ")}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-3 min-w-[200px]">
                        {getGroupedVariants(item.variants || []).map((group) => (
                          <div key={group.color} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-border/40 flex-shrink-0" 
                                style={{ backgroundColor: group.hex }} 
                              />
                              <span>{group.color}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.sizes.map((variant) => (
                                <div 
                                  key={variant.id} 
                                  className="flex items-center gap-1 border border-border/40 px-2 py-1 bg-background/50 rounded"
                                >
                                  <span className="text-[9px] font-mono text-muted-foreground uppercase font-semibold">{variant.size}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    defaultValue={variant.current_stock}
                                    onBlur={(e) => handleVariantStockUpdate(item.id, variant.id, parseInt(e.target.value))}
                                    className="w-10 bg-transparent text-xs text-foreground focus:outline-none text-center font-medium"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{item.reserved_stock}</td>
                    <td className={`py-3 px-4 font-medium ${isOut || isLow ? "text-destructive" : ""}`}>{item.available_stock}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[item.status] || ""}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border/20 text-xs text-muted-foreground">
            <div>
              Showing {paginatedData?.meta?.from || 0} to {paginatedData?.meta?.to || 0} of {paginatedData?.meta?.total || 0} items
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Previous
              </button>
              <button
                disabled={!paginatedData?.links?.next}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-border/40 hover:border-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[10px] uppercase tracking-widest"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
