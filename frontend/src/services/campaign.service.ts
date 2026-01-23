import { campaignsMock } from '../data/campaigns.mock';
import { Campaign } from '../types/campaign';

/**
 * Fetches all marketing campaigns from the mock data source.
 * @returns {Promise<Campaign[]>}
 */
export const getAllCampaigns = (): Promise<Campaign[]> => {
  return new Promise((resolve) => {
    // Simulate a backend delay
    setTimeout(() => {
      resolve([...campaignsMock]);
    }, 700);
  });
};

/**
 * Creates a new marketing campaign and adds it to the mock data source.
 * 
 * @param name - The name of the new campaign.
 * @returns {Promise<Campaign>}
 */
export const createCampaign = (name: string): Promise<Campaign> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: `CMP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name,
        createdAt: new Date().toISOString(),
        totalLinks: 0,
        totalClicks: 0,
      };
      campaignsMock.unshift(newCampaign);
      resolve(newCampaign);
    }, 500);
  });
};