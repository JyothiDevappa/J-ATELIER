import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, List, X, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products, Product } from "@/data/products";

const COLLECTIONS = [
  { label: "All", value: "" },
  { label: "New Arrivals", value: "new-arrivals" },
  { label: "Best Sellers", value: "best-sellers" },
  { label: "Oversized", value: "oversized" },
  { label: "Everyday Essentials", value: "everyday-essentials" },
  { label: "Limited Edition", value: "limited-edition" },
];

const COLORS = ["Ivory", "Black", "Mocha", "Olive"];
const SIZES = ["XS", "S", "M", "L"] as const;
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating" },
];

const PAGE_SIZE = 12;

export default function Shop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [collection, setCollection] = useState(params.get("collection") || "");
  const [color, setColor] = useState(params.get("color") || "");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (collection) list = list.filter((p) => p.collection === collection);
    if (color) list = list.filter((p) => p.colors.some((c) => c.label.toLowerCase() === color.toLowerCase()));
    if (size) list = list.filter((p) => p.sizes.includes(size as "XS" | "S" | "M" | "L"));
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    switch (sort) {
      case "price-asc": return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "newest": return list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
      case "rating": return list.sort((a, b) => b.rating - a.rating);
      default: return list;
    }
  }, [collection, color, size, sort, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCollection = COLLECTIONS.find((c) => c.value === collection);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="border-b border-border/20 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Women's Hoodies</p>
            <h1 className="font-serif text-4xl md:text-5xl">
              {activeCollection?.label || "All Products"}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="search"
                placeholder="Search hoodies..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="bg-transparent border border-border/40 px-4 py-2.5 text-sm w-full md:w-64 focus:outline-none focus:border-accent transition-colors"
                data-testid="input-shop-search"
              />
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest border border-border/40 px-4 py-2.5 hover:border-accent transition-colors md:hidden"
                data-testid="button-filters-toggle"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">{filtered.length} pieces</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent border border-border/40 px-3 py-2.5 text-xs uppercase tracking-wider focus:outline-none focus:border-accent cursor-pointer"
                data-testid="select-sort"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="hidden md:flex items-center gap-1">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "text-foreground" : "text-muted-foreground"}`} data-testid="button-view-grid">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "text-foreground" : "text-muted-foreground"}`} data-testid="button-view-list">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-10">
            {/* Sidebar Filters */}
            <aside className={`w-52 flex-shrink-0 hidden md:block`} data-testid="shop-filters">
              <div className="sticky top-28 space-y-8">
                {/* Collection */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Collection</p>
                  <div className="space-y-2">
                    {COLLECTIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { setCollection(c.value); setPage(1); }}
                        className={`block text-sm w-full text-left transition-colors hover:text-accent ${collection === c.value ? "text-foreground font-medium" : "text-muted-foreground"}`}
                        data-testid={`filter-collection-${c.value || "all"}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Color */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setColor(color === c ? "" : c); setPage(1); }}
                        className={`text-xs px-3 py-1.5 border transition-colors ${color === c ? "border-foreground text-foreground" : "border-border/40 text-muted-foreground hover:border-accent"}`}
                        data-testid={`filter-color-${c.toLowerCase()}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Size */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSize(size === s ? "" : s); setPage(1); }}
                        className={`w-10 h-10 text-xs border transition-colors ${size === s ? "border-foreground bg-foreground text-primary-foreground" : "border-border/40 text-muted-foreground hover:border-accent"}`}
                        data-testid={`filter-size-${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Clear */}
                {(collection || color || size) && (
                  <button
                    onClick={() => { setCollection(""); setColor(""); setSize(""); setPage(1); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3 h-3" /> Clear Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1 min-w-0">
              {paginated.length === 0 ? (
                <div className="text-center py-24">
                  <p className="font-serif text-2xl text-muted-foreground mb-4">No pieces found</p>
                  <button onClick={() => { setCollection(""); setColor(""); setSize(""); setQuery(""); }} className="text-xs uppercase tracking-widest underline" data-testid="button-reset-filters">Reset filters</button>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {paginated.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 text-xs transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "border border-border/40 hover:border-accent text-muted-foreground"}`}
                      data-testid={`button-page-${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
