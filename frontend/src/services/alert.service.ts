import { alertsMock } from '../data/alerts.mock';
import { Alert } from '../types/alert';

/**
 * Fetches current system alerts and notifications.
 * @returns {Promise<Alert[]>}
 */
export const getAlerts = (): Promise<Alert[]> => {
  return new Promise((resolve) => {
    // Simulate network latency
    setTimeout(() => {
      resolve([...alertsMock]);
    }, 600);
  });
};