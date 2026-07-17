import axios from './axios';

export interface AnalyticsSalesData {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  revenue_growth: number;
}

export interface AnalyticsOrderData {
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
}

export interface AnalyticsCustomerData {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  repeat_purchase_rate: number;
}

export interface AnalyticsProductItem {
  id: number;
  name: string;
  image: string;
  total_sold: number;
  total_revenue: number;
}

export interface AnalyticsLowStockItem {
  id: number;
  name: string;
  image: string;
  stock: number;
  available: number;
}

export interface AnalyticsData {
  sales: AnalyticsSalesData;
  orders: AnalyticsOrderData;
  customers: AnalyticsCustomerData;
  products: {
    best_selling: AnalyticsProductItem[];
    worst_selling: AnalyticsProductItem[];
    low_stock: AnalyticsLowStockItem[];
  };
  charts: {
    monthly_revenue: { month: string; revenue: number; orders: number }[];
    weekly_revenue: { week: string; revenue: number }[];
    daily_revenue: { day: string; revenue: number }[];
    collection_sales: { name: string; total_sold: number }[];
    size_sales: { size: string; units: number }[];
  };
}

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const response = await axios.get('/admin/analytics');
  return response.data;
};
