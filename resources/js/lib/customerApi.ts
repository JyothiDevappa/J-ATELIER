import axios from './axios';

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  joined: string;
  joined_full: string;
  orders: number;
  spent: number;
  tier: 'VIP' | 'Regular' | 'New';
}

export interface PaginatedCustomers {
  data: AdminCustomer[];
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
  header: {
    vip_count: number;
    total_spent: number;
    avg_lifetime_value: number;
    total_customers: number;
  };
}

export interface CustomerDetails {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    joined: string;
    addresses: {
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      address: string;
      city: string;
      postcode: string;
      country: string;
      is_default: boolean;
    }[];
    orders: {
      id: number;
      order_number: string;
      total: number;
      status: string;
      date: string;
      items_count: number;
    }[];
  };
  stats: {
    total_orders: number;
    total_spent: number;
    last_order_date: string | null;
  };
}

export const fetchAdminCustomers = async (params?: Record<string, any>): Promise<PaginatedCustomers> => {
  const response = await axios.get('/admin/customers', { params });
  return response.data;
};

export const fetchCustomerDetails = async (id: number): Promise<CustomerDetails> => {
  const response = await axios.get(`/admin/customers/${id}`);
  return response.data;
};
