import { alertsMock } from '../data/alerts.mock';
import { Alert } from '../types/alert';

export const getAlerts = (): Promise<Alert[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...alertsMock]);
    }, 600);
  });
};
