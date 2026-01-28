export interface AnalyticsPoint {
  timestamp: string;
  clicks: number;
  region: string;
}

export interface RegionStat {
  region: string;
  clicks: number;
  percentage: string;
}

export interface AnalyticsResponse {
  summary: {
    totalClicks: number;
    totalLinks?: number;
    topRegion: string;
    topDevice?: string;
    avgLatency: number;
    conversionRate: number;
  };
  points: AnalyticsPoint[];
  topRegions?: RegionStat[];
  lastUpdated?: string;
}

export interface SystemHealthRegion {
  region: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  cpu: number;
  memory: number;
  uptime: number;
}
