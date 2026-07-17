import axios from './axios';

export interface HomepageColor {
  label: string;
  hex: string;
  slug: string;
}

export interface AdminHomepageColor {
  id: number;
  name: string;
  hex: string;
  show_on_homepage: boolean;
  homepage_sort_order: number;
  products_count?: number;
}

export interface InstagramGalleryItem {
  id: number;
  image_path: string;
  alt_text: string | null;
  instagram_url: string | null;
  is_enabled: boolean;
  sort_order: number;
}

// Public API
export const fetchHomepageColors = async (): Promise<HomepageColor[]> => {
  const response = await axios.get('/homepage/colors');
  return response.data;
};

export const fetchHomepageInstagramGallery = async (): Promise<InstagramGalleryItem[]> => {
  const response = await axios.get('/homepage/instagram-gallery');
  return response.data;
};

// Admin API
export const fetchAdminShopByColor = async (): Promise<AdminHomepageColor[]> => {
  const response = await axios.get('/admin/shop-by-color');
  return response.data;
};

export const saveAdminShopByColor = async (colors: { id: number; show_on_homepage: boolean; homepage_sort_order: number }[]): Promise<void> => {
  await axios.put('/admin/shop-by-color', { colors });
};

export const fetchAdminInstagramGallery = async (): Promise<InstagramGalleryItem[]> => {
  const response = await axios.get('/admin/instagram-gallery');
  return response.data;
};

export const createAdminInstagramGalleryItem = async (formData: FormData): Promise<InstagramGalleryItem> => {
  const response = await axios.post('/admin/instagram-gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAdminInstagramGalleryItem = async (id: number, data: Partial<InstagramGalleryItem> | FormData): Promise<InstagramGalleryItem> => {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
  
  if (isFormData) {
    data.append('_method', 'PUT');
    const response = await axios.post(`/admin/instagram-gallery/${id}`, data, config);
    return response.data;
  } else {
    const response = await axios.put(`/admin/instagram-gallery/${id}`, data);
    return response.data;
  }
};

export const deleteAdminInstagramGalleryItem = async (id: number): Promise<void> => {
  await axios.delete(`/admin/instagram-gallery/${id}`);
};
