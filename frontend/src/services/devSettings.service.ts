import { devSettingsMock } from '../data/devSettings.mock';
import { DeveloperSettings } from '../types/devSettings';

/**
 * Fetches developer-specific settings including API keys and webhook configurations.
 * Simulates a secure backend retrieval with network latency.
 * 
 * @returns {Promise<DeveloperSettings>}
 */
export const getDeveloperSettings = (): Promise<DeveloperSettings> => {
  return new Promise((resolve) => {
    // Simulate API retrieval delay
    setTimeout(() => {
      resolve({ ...devSettingsMock });
    }, 550);
  });
};