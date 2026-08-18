import axios from 'axios';

export interface HomepageSectionData {
  id?: number;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  is_enabled: boolean;
}

export type HomepageSectionsMap = Record<string, HomepageSectionData>;

export async function fetchPublicHomepageSections(): Promise<HomepageSectionsMap> {
  const response = await axios.get('/api/homepage/sections');
  return response.data;
}

export async function fetchAdminHomepageSections(): Promise<HomepageSectionsMap> {
  const response = await axios.get('/api/admin/homepage-sections');
  return response.data;
}

export async function updateAdminHomepageSection(payload: {
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content?: any;
  is_enabled?: boolean;
}): Promise<any> {
  const response = await axios.post('/api/admin/homepage-sections/update', payload);
  return response.data;
}

export async function uploadHomepageImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axios.post('/api/admin/homepage-sections/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
}
