export interface AnalyticsPoint {
  timestamp: string;
  clicks: number;
  region: string;
}

export interface AnalyticsResponse {
  summary: {
    totalClicks: number;
    topRegion: string;
  };
  points: AnalyticsPoint[];
}
