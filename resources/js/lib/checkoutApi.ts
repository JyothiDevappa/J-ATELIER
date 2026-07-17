import axios from './axios';

export interface CheckoutPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  delivery: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  message: string;
  order_number: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: string[];
  };
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  delivery_method: string;
  delivery_cost: number;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export async function submitCheckout(data: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await axios.post('/checkout', data);
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await axios.get('/orders');
  return response.data;
}
