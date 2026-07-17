import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types/product";

interface RecentlyViewedContextType {
  items: Product[];
  addToRecentlyViewed: (product: Product) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addToRecentlyViewed = (product: Product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 4);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addToRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return context;
};
