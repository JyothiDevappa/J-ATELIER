import axios from './axios';

export interface AdminVariantItem {
  id: number;
  size: string;
  color: string;
  hex: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface AdminInventoryItem {
  id: number;
  name: string;
  sku: string;
  collection: string;
  image: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  variants: AdminVariantItem[];
}

export interface PaginatedInventory {
  data: AdminInventoryItem[];
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
  low_stock_list: string[];
}

export const fetchAdminInventory = async (params?: Record<string, any>): Promise<PaginatedInventory> => {
  const response = await axios.get('/admin/inventory', { params });
  return response.data;
};

export const updateProductStock = async (id: number, stock: number): Promise<void> => {
  await axios.put(`/admin/inventory/${id}`, { stock });
};

export const updateVariantStock = async (variantId: number, stock: number): Promise<void> => {
  await axios.put(`/admin/inventory/variant/${variantId}`, { stock });
};
