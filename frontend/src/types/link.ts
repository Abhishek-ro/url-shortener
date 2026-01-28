export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
  title?: string;
  description?: string;
  favicon?: string;
  isProtected: boolean;
  password?: string | null;
  isExpiring: boolean;
  expiresAt?: string | null;
  isRateLimited: boolean;
  maxClicksPerMin?: number;
}
