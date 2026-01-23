
export interface Link {
  id: string;
  originalUrl: string;
  shortCode: string;
  domain: string;
  totalClicks: number;
  uniqueVisitors: number;
  createdAt: string;
  expiresAt?: string;
  rateLimit?: number;
  status: 'active' | 'expired' | 'suspended';
  clicksTrend: number[];
}

export interface AnalyticsData {
  time: string;
  clicks: number;
  latency: number;
}

export interface GeoDistribution {
  country: string;
  percentage: number;
  clicks: number;
}

export interface ReferrerData {
  domain: string;
  category: string;
  clicks: number;
  trend: string;
  avgSession: string;
}

export interface SystemService {
  name: string;
  uptime: string;
  latency: string;
  status: 'healthy' | 'warning' | 'degraded';
}

export interface ShardStatus {
  id: number;
  load: 'idle' | 'healthy' | 'high';
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  LINKS = 'LINKS',
  CAMPAIGNS = 'CAMPAIGNS',
  ANALYTICS = 'ANALYTICS',
  ALERTS = 'ALERTS',
  SETTINGS = 'SETTINGS',
  DEVELOPER = 'DEVELOPER',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH'
}
