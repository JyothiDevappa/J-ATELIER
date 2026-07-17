import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from '@/lib/cartApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartTotal: number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cartItems = await fetchCart();
      setItems(cartItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load your cart right now.';
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      void loadCart();
    }
  }, [authLoading, isAuthenticated]);

  const addToCart = async (
    product: Product,
    color: string,
    size: string,
    quantity: number,
  ): Promise<void> => {
    setError(null);

    try {
      const newItem = await addCartItem(product.id, size, color, quantity);
      setItems((prev) => {
        const existing = prev.find((item) => item.cartId === newItem.cartId);
        if (existing) {
          return prev.map((item) => (item.cartId === newItem.cartId ? newItem : item));
        }
        return [...prev, newItem];
      });

      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add this item to your cart.';
      setError(message);
      toast({
        title: 'Could not add to cart',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<void> => {
    const item = items.find((entry) => entry.cartItemId === cartItemId);
    if (!item) return;

    setError(null);

    try {
      await removeCartItem(item.cartId);
      setItems((prev) => prev.filter((entry) => entry.cartItemId !== cartItemId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove this item from your cart.';
      setError(message);
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<void> => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    const item = items.find((entry) => entry.cartItemId === cartItemId);
    if (!item) return;

    setError(null);

    try {
      const updated = await updateCartItem(item.cartId, quantity);
      setItems((prev) => prev.map((entry) => (entry.cartId === updated.cartId ? updated : entry)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update this item quantity.';
      setError(message);
      throw error;
    }
  };

  const cartTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, isLoading, error }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
