
export interface Trend {
  clicks: number;
  active: number;
}

export interface DashboardStats {
  totalClicks: number;
  activeLinks: number;
  topRegion: string;
  trend: Trend;
}

// Fixed missing LiveStreamItem interface required for the live analytics simulation
export interface LiveStreamItem {
  id: string;
  region: string;
  ops: number;
  volume: number;
}
