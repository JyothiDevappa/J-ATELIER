import axios from './axios';

export interface DashboardData {
  cards: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    avg_order_value: number;
  };
  revenue_chart: {
    month: string;
    revenue: number;
  }[];
  collection_chart: {
    name: string;
    sales: number;
  }[];
  recent_orders: {
    id: number;
    order_number: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get('/admin/dashboard');
  return response.data;
};
