import apiService from './api.service';

export const generateApiKey = async (): Promise<{ apiKey: string }> => {
  const response = await apiService.post('/generate-key');
  return response.data;
};
