import apiService from './api.service';
import { ShortLink } from '../types/link';

export const getAllLinks = async (): Promise<ShortLink[]> => {
  const response = await apiService.get('/links');
  return response.data;
};

export const createShortLink = async (
  url: string,
  options?: {
    isProtected?: boolean;
    password?: string;
    isExpiring?: boolean;
    expiresAt?: string;
    isRateLimited?: boolean;
    maxClicksPerMin?: number;
  },
): Promise<ShortLink> => {
  const response = await apiService.post('/shorten', {
    url,
    ...options,
  });
  return response.data;
};

export const updateLink = async (
  id: string,
  updates: Partial<ShortLink>,
): Promise<ShortLink> => {
  const response = await apiService.patch(`/links/${id}`, updates);
  return response.data;
};

export const deleteLink = async (id: string): Promise<boolean> => {
  await apiService.delete(`/links/${id}`);
  return true;
};

export const getTopLinks = async (limit: number = 10): Promise<ShortLink[]> => {
  const response = await apiService.get(`/top-links?limit=${limit}`);
  return response.data;
};

export const getLinkMetadata = async (url: string) => {
  const response = await apiService.post('/metadata', { url });
  return response.data;
};

export const getLinkAnalytics = async (code: string) => {
  const response = await apiService.get(`/analytics/${code}`);
  return response.data;
};
