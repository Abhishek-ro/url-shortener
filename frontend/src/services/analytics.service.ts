import apiService from './api.service';
import { AnalyticsResponse } from '../types/analytics';

export const getAnalytics = async (
  code?: string,
): Promise<AnalyticsResponse> => {
  const url = code ? `/analytics/${code}` : '/analytics/global';
  const response = await apiService.get(url);
  return response.data;
};
