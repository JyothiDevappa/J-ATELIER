import axios from './axios';
import { Product } from "@/types/product";

export interface PaginatedProducts {
  data: Product[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get('/products');
  return response.data.data;
};

export const fetchAdminProducts = async (params?: Record<string, any>): Promise<PaginatedProducts> => {
  const response = await axios.get('/admin/products', { params });
  return response.data;
};

export const createProduct = async (data: any): Promise<Product> => {
  const response = await axios.post('/admin/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: any): Promise<Product> => {
  const response = await axios.put(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`/admin/products/${id}`);
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axios.post('/admin/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.url;
};

export const fetchColors = async (): Promise<{ id: number; name: string; hex: string }[]> => {
  const response = await axios.get('/colors');
  return response.data;
};

export const createColor = async (color: { name: string; hex: string }): Promise<{ id: number; name: string; hex: string }> => {
  const response = await axios.post('/admin/colors', color);
  return response.data;
};
