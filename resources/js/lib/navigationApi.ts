import axios from 'axios';

export interface HeaderNavItem {
  id: number;
  label: string;
  url: string;
  sort_order: number;
  is_enabled?: boolean;
}

export interface FooterLinkItem {
  id: number;
  footer_section_id?: number | null;
  label: string;
  url: string;
  type: 'section_link' | 'legal_link';
  sort_order: number;
  is_enabled?: boolean;
}

export interface FooterSectionItem {
  id: number;
  title: string;
  sort_order: number;
  is_enabled?: boolean;
  links: FooterLinkItem[];
}

export interface PublicNavigationResponse {
  brand_name: string;
  header_items: HeaderNavItem[];
  footer: {
    brand_name: string;
    description: string;
    copyright_text: string;
    sections: FooterSectionItem[];
    legal_links: FooterLinkItem[];
  };
}

export interface AdminNavigationResponse {
  header_items: HeaderNavItem[];
  footer_brand_name: string;
  footer_description: string;
  copyright_text: string;
  footer_sections: FooterSectionItem[];
  legal_links: FooterLinkItem[];
}

export async function fetchPublicNavigation(): Promise<PublicNavigationResponse> {
  const response = await axios.get('/api/navigation');
  return response.data;
}

export async function fetchAdminNavigation(): Promise<AdminNavigationResponse> {
  const response = await axios.get('/api/admin/navigation');
  return response.data;
}

/* Header CRUD */
export async function createHeaderNavItem(data: Partial<HeaderNavItem>): Promise<any> {
  const response = await axios.post('/api/admin/navigation/header', data);
  return response.data;
}

export async function updateHeaderNavItem(id: number, data: Partial<HeaderNavItem>): Promise<any> {
  const response = await axios.put(`/api/admin/navigation/header/${id}`, data);
  return response.data;
}

export async function deleteHeaderNavItem(id: number): Promise<any> {
  const response = await axios.delete(`/api/admin/navigation/header/${id}`);
  return response.data;
}

/* Footer Section CRUD */
export async function createFooterSection(data: Partial<FooterSectionItem>): Promise<any> {
  const response = await axios.post('/api/admin/navigation/footer-sections', data);
  return response.data;
}

export async function updateFooterSection(id: number, data: Partial<FooterSectionItem>): Promise<any> {
  const response = await axios.put(`/api/admin/navigation/footer-sections/${id}`, data);
  return response.data;
}

export async function deleteFooterSection(id: number): Promise<any> {
  const response = await axios.delete(`/api/admin/navigation/footer-sections/${id}`);
  return response.data;
}

/* Footer Link CRUD */
export async function createFooterLink(data: Partial<FooterLinkItem>): Promise<any> {
  const response = await axios.post('/api/admin/navigation/footer-links', data);
  return response.data;
}

export async function updateFooterLink(id: number, data: Partial<FooterLinkItem>): Promise<any> {
  const response = await axios.put(`/api/admin/navigation/footer-links/${id}`, data);
  return response.data;
}

export async function deleteFooterLink(id: number): Promise<any> {
  const response = await axios.delete(`/api/admin/navigation/footer-links/${id}`);
  return response.data;
}

/* Footer Settings */
export async function updateFooterSettings(data: {
  footer_brand_name?: string;
  footer_description?: string;
  copyright_text?: string;
}): Promise<any> {
  const response = await axios.post('/api/admin/navigation/footer-settings', data);
  return response.data;
}
