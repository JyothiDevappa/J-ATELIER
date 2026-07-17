import axios from './axios';
import { Product } from '@/types/product';
import { getCsrfCookie } from './authApi';

export interface WishlistProduct extends Product {
  wishlistId?: number;
}

export async function fetchWishlist(): Promise<WishlistProduct[]> {
  const response = await axios.get<{ data: WishlistProduct[] }>('/wishlist');
  return response.data.data;
}

export async function addWishlistItem(productId: number): Promise<WishlistProduct> {
  await getCsrfCookie();
  const response = await axios.post<{ data: WishlistProduct }>('/wishlist', {
    product_id: productId,
  });
  return response.data.data;
}

export async function removeWishlistItem(wishlistItemId: number): Promise<void> {
  await getCsrfCookie();
  await axios.delete(`/wishlist/${wishlistItemId}`);
}
