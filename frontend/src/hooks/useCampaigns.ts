import { useState, useEffect } from 'react';
import { getAllCampaigns, createCampaign } from '../services/campaign.service';
import { Campaign } from '../types/campaign';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const data = await getAllCampaigns();
        if (isMounted) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  async function addCampaign(name: string) {
    const newCamp = await createCampaign(name);
    setCampaigns((prev) => [newCamp, ...prev]);
  }

  return { campaigns, loading, addCampaign };
};
