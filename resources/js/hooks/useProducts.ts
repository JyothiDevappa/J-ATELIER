import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { fetchProducts } from '@/lib/productApi';

// Module-level cache to prevent refetching when navigating between pages
let cachedProducts: Product[] | null = null;
let fetchPromise: Promise<Product[]> | null = null;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts || []);
  const [loading, setLoading] = useState<boolean>(!cachedProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedProducts) {
      setProducts(cachedProducts);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchProducts().then((data) => {
        cachedProducts = data;
        return data;
      });
    }

    fetchPromise
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  const getNewArrivals = () => products.filter((p) => p.isNew);
  
  const getBestSellers = () => products.filter((p) => p.isBestSeller);
  
  const getProductsByColor = (colorLabel: string) => {
    const target = colorLabel.trim().toLowerCase();
    const keyword = colorLabel.replace(/\s+/g, "").toLowerCase();

    return products.filter((p) => {
      // 1. Primary match: Check assigned product colors array for matching color name or label
      if (p.colors && p.colors.length > 0) {
        const hasColorMatch = p.colors.some((c: any) => {
          const colorName = (c.name || c.label || "").trim().toLowerCase();
          return colorName === target;
        });
        if (hasColorMatch) return true;
      }

      // 2. Fallback: Search image paths for color keyword
      return p.images.some((img: string) => {
        const normalised = img.toLowerCase().replace(/-/g, "");
        if (keyword === "pink" && normalised.includes("darkpink")) {
          return false;
        }
        return normalised.includes(keyword);
      });
    });
  };

  return { products, loading, error, getNewArrivals, getBestSellers, getProductsByColor };
}

export function clearProductCache() {
  cachedProducts = null;
  fetchPromise = null;
}
