import apiService from './api.service';
import { DeveloperSettings } from '../types/devSettings';

export const getDeveloperSettings = async (): Promise<DeveloperSettings> => {
  const response = await apiService.get('/settings/developer');
  return response.data;
};

export const updateWebhookUrl = async (url: string): Promise<void> => {
  await apiService.patch('/settings/developer/webhook', { url });
};
