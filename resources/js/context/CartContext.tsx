import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../data/products";

interface CartItem extends Product {
  cartItemId: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, color: string, size: string, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedColor === color && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === existing.cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        { ...product, cartItemId: Math.random().toString(36).substr(2, 9), selectedColor: color, selectedSize: size, quantity }
      ];
    });
  };

  const removeFromCart = (id: string) => setItems((prev) => prev.filter((item) => item.cartItemId !== id));
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    setItems((prev) => prev.map((item) => item.cartItemId === id ? { ...item, quantity } : item));
  };

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
