import axios from './axios';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
  price: string;
  product?: {
    id: number;
    name: string;
    images: string[];
    price: number;
  };
}

export interface AdminOrder {
  id: number;
  order_number: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  delivery_method: string;
  delivery_cost: string;
  subtotal: string;
  total: string;
  created_at: string;
  items: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PaginatedOrders {
  data: AdminOrder[];
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

export const fetchAdminOrders = async (params?: Record<string, any>): Promise<PaginatedOrders> => {
  const response = await axios.get('/admin/orders', { params });
  return response.data;
};

export const fetchAdminOrderDetails = async (id: number): Promise<AdminOrder> => {
  const response = await axios.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<AdminOrder> => {
  const response = await axios.put(`/admin/orders/${id}/status`, { status });
  return response.data.order;
};
