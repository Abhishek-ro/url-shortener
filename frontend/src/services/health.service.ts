import apiService from './api.service';
import { SystemHealth } from '../types/health';

export const getSystemHealth = async (): Promise<SystemHealth[]> => {
  const response = await apiService.get('/system/health');
  return response.data;
};
