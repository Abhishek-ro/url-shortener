import { settingsMock } from '../data/settings.mock';
import { UserSettings } from '../types/settings';

export const getUserSettings = (): Promise<UserSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...settingsMock });
    }, 400);
  });
};
