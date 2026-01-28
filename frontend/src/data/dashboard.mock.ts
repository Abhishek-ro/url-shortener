import { DashboardStats } from '../types/dashboard';

export const dashboardMock: DashboardStats = {
  totalClicks: 45281,
  activeLinks: 128,
  topRegion: 'US-EAST',
  avgLatency: '14ms',
  trend: {
    clicks: 12.5,
    active: 2.1,
  },
};
