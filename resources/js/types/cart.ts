import { Product } from './product';

/**
 * A cart item as returned by CartItemResource.
 * cartId  — cart_items.id (integer) used for PUT/DELETE API calls
 * cartItemId — string form of cartId, used as React key and UI callback handle
 */
export interface CartItem {
  cartId:        number;
  cartItemId:    string;
  product:       Product;
  // Flattened product fields — Cart.tsx and Navbar.tsx read these directly
  id:            number;
  name:          string;
  price:         number;
  images:        string[];
  selectedColor: string;
  selectedSize:  string;
  quantity:      number;
}

/**
 * Shape stored in localStorage for guest (unauthenticated) carts.
 * Includes a product snapshot so the UI can render without an API call.
 */
export interface GuestCartItem {
  product_id: number;
  size:       string;
  color:      string;
  quantity:   number;
  // Product snapshot for guest UI rendering
  name:       string;
  price:      number;
  images:     string[];
}
