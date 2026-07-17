import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../types/product";
import { useAuth } from "@/context/AuthContext";
import { fetchWishlist, addWishlistItem, removeWishlistItem } from "@/lib/wishlistApi";
import { toast } from "@/hooks/use-toast";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [dbItemsMap, setDbItemsMap] = useState<Record<number, number>>({});

  // 1. Initial Load and Sync
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      const loadWishlist = async () => {
        try {
          const apiProducts = await fetchWishlist();
          const mapping = apiProducts.reduce((acc, p) => {
            if (p.wishlistId) acc[p.id] = p.wishlistId;
            return acc;
          }, {} as Record<number, number>);

          setItems(apiProducts);
          setDbItemsMap(mapping);
        } catch (error) {
          console.error("Failed to load wishlist from server", error);
        }
      };
      void loadWishlist();
    } else {
      // Guest initialization from localStorage
      try {
        const saved = localStorage.getItem("wishlist_items");
        setItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setItems([]);
      }
      setDbItemsMap({});
    }
  }, [isAuthenticated, authLoading]);

  // 2. Toggle Action (Authenticated API / Guest localStorage)
  const toggleWishlist = async (product: Product) => {
    const exists = items.some((item) => item.id === product.id);

    if (isAuthenticated) {
      try {
        if (exists) {
          const dbId = dbItemsMap[product.id];
          if (dbId) {
            await removeWishlistItem(dbId);
            setItems((prev) => prev.filter((item) => item.id !== product.id));
            setDbItemsMap((prev) => {
              const copy = { ...prev };
              delete copy[product.id];
              return copy;
            });
            toast({
              title: "Removed from wishlist",
              description: `${product.name} has been removed from your wishlist.`,
            });
          }
        } else {
          const savedProduct = await addWishlistItem(product.id);
          setItems((prev) => [...prev, product]);
          if (savedProduct.wishlistId) {
            setDbItemsMap((prev) => ({
              ...prev,
              [product.id]: savedProduct.wishlistId!,
            }));
          }
          toast({
            title: "Saved to wishlist",
            description: `${product.name} has been saved to your wishlist.`,
          });
        }
      } catch (error) {
        toast({
          title: "Wishlist update failed",
          description: "There was an error updating your wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // LocalStorage fallback for guest users
      setItems((prev) => {
        const itemExists = prev.some((item) => item.id === product.id);
        let next;
        if (itemExists) {
          toast({
            title: "Removed from wishlist",
            description: `${product.name} has been removed from your wishlist.`,
          });
          next = prev.filter((item) => item.id !== product.id);
        } else {
          toast({
            title: "Saved to wishlist",
            description: `${product.name} has been saved to your wishlist.`,
          });
          next = [...prev, product];
        }
        localStorage.setItem("wishlist_items", JSON.stringify(next));
        return next;
      });
    }
  };

  const isInWishlist = (id: number) => items.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
