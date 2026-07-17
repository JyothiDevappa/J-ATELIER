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
    const keyword = colorLabel.replace(/\s+/g, "").toLowerCase();
    return products.filter((p) => {
      // If the database has been cleaned and has single specific colors, match exactly
      if (p.colors && p.colors.length === 1 && p.colors[0].label) {
        return p.colors[0].label.toLowerCase() === colorLabel.toLowerCase();
      }
      // Fallback: search image paths, ensuring we don't match "darkpink" when querying "pink"
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
