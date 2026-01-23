import { apiRequest } from './api.service';
import { ShortLink } from '../types/link';

// GET /links
export const getAllLinks = async (): Promise<ShortLink[]> => {
  return apiRequest('/links');
};

// POST /shorten
export const createShortLink = async (url: string): Promise<ShortLink> => {
  return apiRequest('/shorten', {
    method: 'POST',
    body: JSON.stringify({ originalUrl: url }),
  });
};

// PATCH /links/:id
export const updateLink = async (
  id: string,
  updates: Partial<ShortLink>,
): Promise<ShortLink> => {
  return apiRequest(`/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// DELETE /links/:id
export const deleteLink = async (id: string): Promise<boolean> => {
  await apiRequest(`/links/${id}`, {
    method: 'DELETE',
  });
  return true;
};

// GET /top-links
export const getTopLinks = async (): Promise<ShortLink[]> => {
  return apiRequest('/top-links');
};
