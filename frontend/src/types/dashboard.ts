export interface Trend {
  clicks: number;
  active: number;
}

export interface DashboardStats {
  totalClicks: number;
  activeLinks: number;
  topRegion: string;
  avgLatency: string;
  trend: Trend;
}

export interface LiveStreamItem {
  id: string;
  region: string;
  ops: number;
  volume: number;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}
