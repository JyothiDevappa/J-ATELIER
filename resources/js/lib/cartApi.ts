import axiosInstance from './axios';
import axios from 'axios';
import { CartItem, GuestCartItem } from '@/types/cart';
import { Product } from '@/types/product';
import { getCsrfCookie } from './authApi';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (typeof error.message === 'string') {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Shapes returned by CartItemResource — flat API response before we
 * map it into the full CartItem shape in CartContext.
 */
interface ApiCartItem {
  cartId:   number;
  quantity: number;
  size:     string;
  color:    string;
  product:  Product;
}

/** Map a raw API response to the CartItem shape used in the UI. */
function mapApiItem(raw: ApiCartItem): CartItem {
  return {
    cartId:        raw.cartId,
    cartItemId:    String(raw.cartId),
    product:       raw.product,
    id:            raw.product.id,
    name:          raw.product.name,
    price:         raw.product.price,
    images:        raw.product.images,
    selectedColor: raw.color,
    selectedSize:  raw.size,
    quantity:      raw.quantity,
  };
}

/** GET /api/cart — fetch the authenticated user's cart. */
export async function fetchCart(): Promise<CartItem[]> {
  try {
    const response = await axiosInstance.get<{ data: ApiCartItem[] }>('/cart');
    return response.data.data.map(mapApiItem);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** POST /api/cart — add a product or increment existing quantity. */
export async function addCartItem(
  productId: number,
  size: string,
  color: string,
  quantity: number,
): Promise<CartItem> {
  try {
    await getCsrfCookie();
    const response = await axiosInstance.post<{ data: ApiCartItem }>('/cart', {
      product_id: productId,
      size,
      color,
      quantity,
    });
    return mapApiItem(response.data.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** PUT /api/cart/{cartId} — update quantity of an existing cart item. */
export async function updateCartItem(
  cartId: number,
  quantity: number,
): Promise<CartItem> {
  try {
    await getCsrfCookie();
    const response = await axiosInstance.put<{ data: ApiCartItem }>(`/cart/${cartId}`, {
      quantity,
    });
    return mapApiItem(response.data.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** DELETE /api/cart/{cartId} — remove an item from the cart. */
export async function removeCartItem(cartId: number): Promise<void> {
  try {
    await getCsrfCookie();
    await axiosInstance.delete(`/cart/${cartId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** POST /api/cart/merge — merge guest localStorage items into DB cart on login. */
export async function mergeCart(
  items: GuestCartItem[],
): Promise<CartItem[]> {
  try {
    await getCsrfCookie();
    const payload = items.map((item) => ({
      product_id: item.product_id,
      size:       item.size,
      color:      item.color,
      quantity:   item.quantity,
    }));
    const response = await axiosInstance.post<{ data: ApiCartItem[] }>('/cart/merge', {
      items: payload,
    });
    return response.data.data.map(mapApiItem);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
