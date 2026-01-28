import apiService from './api.service';
import { DashboardStats } from '../types/dashboard';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiService.get('/stats/overview');

    if (!response.data) {
      throw new Error('Empty response from stats engine');
    }

    return response.data;
  } catch (error) {
    console.error('Dashboard Service Error:', error);
    return {
      totalClicks: 0,
      activeLinks: 0,
      topRegion: 'None',
      avgLatency: '0ms',
      trend: { clicks: 0, active: 0 },
    };
  }
};
