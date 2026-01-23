import { dashboardMock } from '../data/dashboard.mock';
import { DashboardStats } from '../types/dashboard';

/**
 * Fetches dashboard statistics from the mock data source.
 * Simulates a backend delay using setTimeout.
 * @returns {Promise<DashboardStats>}
 */
export const getDashboardStats = (): Promise<DashboardStats> => {
  return new Promise((resolve) => {
    // Simulate a small backend delay
    setTimeout(() => {
      resolve(dashboardMock);
    }, 500);
  });
};
