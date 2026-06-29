import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import { products } from "@/data/products";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.collection.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-background/97 backdrop-blur-lg"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-16">
            <button
              onClick={onClose}
              className="absolute top-8 right-6 p-2 hover:text-accent transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative border-b border-foreground/20 mb-12 pb-1"
            >
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hoodies, collections…"
                className="w-full bg-transparent pl-7 pr-4 py-2 text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                data-testid="input-search"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {query.trim().length > 1 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {results.length > 0 ? (
                    <>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
                        {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {results.map((product, i) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.04 }}
                          >
                            <Link href={`/product/${product.id}`} onClick={onClose}>
                              <div className="group">
                                <div className="aspect-[3/4] overflow-hidden bg-card mb-3">
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <p className="font-serif text-sm mb-1 group-hover:text-accent transition-colors">{product.name}</p>
                                <p className="text-xs text-muted-foreground">${product.price}</p>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                      {results.length >= 4 && (
                        <div className="mt-10 text-center">
                          <Link
                            href={`/shop?q=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                          >
                            View all results <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="font-serif text-xl text-muted-foreground mb-2">No results found</p>
                      <p className="text-sm text-muted-foreground">Try a different search or browse our collections</p>
                      <Link
                        href="/shop"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-widest border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                      >
                        Browse All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {query.trim().length <= 1 && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Popular Searches</p>
                    <div className="flex flex-wrap gap-3">
                      {["Cashmere", "Oversized", "Limited Edition", "Zip-Up", "Silk", "New Arrivals"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground hover:text-accent transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
