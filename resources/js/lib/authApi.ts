import axios from './axios';

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const getCsrfCookie = async () => {
  // Laravel Sanctum requires hitting this endpoint first before login/register
  await axios.get('/sanctum/csrf-cookie', { baseURL: '' });
};

export const login = async (credentials: Record<string, string>) => {
  await getCsrfCookie();
  const response = await axios.post('/login', credentials);
  return response.data;
};

export const adminLogin = async (credentials: Record<string, string>) => {
  await getCsrfCookie();
  const response = await axios.post('/admin/login', credentials);
  return response.data;
};

export const register = async (data: Record<string, string>) => {
  await getCsrfCookie();
  const response = await axios.post('/register', data);
  return response.data;
};

export const logout = async () => {
  await axios.post('/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get('/user');
  return response.data;
};

export const updateProfile = async (data: { name: string; email: string; password?: string }): Promise<User> => {
  const response = await axios.put('/user', data);
  return response.data;
};
