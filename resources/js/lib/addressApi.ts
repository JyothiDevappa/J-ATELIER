import axios from './axios';

export interface Address {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAddresses(): Promise<Address[]> {
  const response = await axios.get('/addresses');
  return response.data;
}

export async function createAddress(data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
  const response = await axios.post('/addresses', data);
  return response.data;
}

export async function updateAddress(id: number, data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
  const response = await axios.put(`/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await axios.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const response = await axios.put(`/addresses/${id}/default`);
  return response.data;
}
