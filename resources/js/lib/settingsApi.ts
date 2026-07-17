import axios from './axios';

export interface StoreSettings {
  store_name: string;
  store_url: string;
  support_email: string;
  currency: string;
}

export interface SecurityPayload {
  current_password: string;
  new_email?: string;
  confirm_email?: string;
  new_password?: string;
  confirm_password?: string;
}

/**
 * Public: load current store settings (no auth required).
 * Called on app start so the brand name is always up to date.
 */
export const fetchStoreSettings = async (): Promise<StoreSettings> => {
  const response = await axios.get('/settings/general');
  return response.data;
};

/**
 * Authenticated: save updated store information.
 * Only callable by an admin-authenticated session.
 */
export const saveStoreSettings = async (data: StoreSettings): Promise<StoreSettings> => {
  const response = await axios.post('/admin/settings/general', data);
  return response.data;
};

export const updateSecurity = async (data: SecurityPayload): Promise<{ message: string; email?: string }> => {
  const response = await axios.post('/admin/settings/security', data);
  return response.data;
};

