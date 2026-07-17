import axios from './axios';

export interface Coupon {
  id: number;
  code: string;
  type: "Percentage" | "Fixed";
  value: number;
  min_order: number;
  limit: number | null;
  used: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCoupons {
  data: Coupon[];
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

export interface CouponValidationResult {
  code: string;
  type: "Percentage" | "Fixed";
  value: number;
  discount_amount: number;
  subtotal: number;
  updated_total: number;
}

export const fetchCoupons = async (params?: Record<string, any>): Promise<PaginatedCoupons> => {
  const response = await axios.get('/admin/coupons', { params });
  return response.data;
};

export const createCoupon = async (data: any): Promise<Coupon> => {
  const response = await axios.post('/admin/coupons', data);
  return response.data;
};

export const updateCoupon = async (id: number, data: any): Promise<Coupon> => {
  const response = await axios.put(`/admin/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await axios.delete(`/admin/coupons/${id}`);
};

export const validateCoupon = async (code: string): Promise<CouponValidationResult> => {
  const response = await axios.post('/coupons/validate', { code });
  return response.data;
};
