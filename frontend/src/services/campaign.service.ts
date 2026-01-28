import apiService from './api.service';

export const getAllCampaigns = async () => {
  const response = await apiService.get('/campaigns');
  return response.data;
};

export const createCampaign = async (name: string, description?: string) => {
  const response = await apiService.post('/campaigns', { name, description });
  return response.data;
};

export const updateCampaign = async (
  id: string,
  name: string,
  description?: string,
) => {
  const response = await apiService.patch(`/campaigns/${id}`, {
    name,
    description,
  });
  return response.data;
};

export const deleteCampaign = async (id: string) => {
  const response = await apiService.delete(`/campaigns/${id}`);
  return response.data;
};

export const getCampaignById = async (id: string) => {
  const response = await apiService.get(`/campaigns/${id}`);
  return response.data;
};

export const addLinkToCampaign = async (campaignId: string, linkId: string) => {
  const response = await apiService.post('/campaigns/link', {
    campaignId,
    linkId,
  });
  return response.data;
};
