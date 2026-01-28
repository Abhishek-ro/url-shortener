import { useState, useEffect } from 'react';
import {
  getDeveloperSettings,
  updateWebhookUrl,
} from '../services/devSettings.service';
import { generateApiKey } from '../services/developer.service';
import { DeveloperSettings } from '../types/devSettings';

export const useDeveloperSettings = () => {
  const [settings, setSettings] = useState<DeveloperSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getDeveloperSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching developer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    await generateApiKey();
    await fetchSettings(); // Refresh list
  };

  const handleUpdateWebhook = async (url: string) => {
    await updateWebhookUrl(url);
    await fetchSettings(); // Refresh list
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, handleGenerateKey, handleUpdateWebhook };
};
