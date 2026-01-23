import { settingsMock } from '../data/settings.mock';
import { UserSettings } from '../types/settings';

/**
 * Fetches the current user's configuration and profile settings.
 * Simulates a secure backend retrieval with network latency.
 * 
 * @returns {Promise<UserSettings>}
 */
export const getUserSettings = (): Promise<UserSettings> => {
  return new Promise((resolve) => {
    // Simulate API retrieval delay
    setTimeout(() => {
      resolve({ ...settingsMock });
    }, 400);
  });
};