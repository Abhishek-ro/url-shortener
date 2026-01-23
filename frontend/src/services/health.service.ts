import { healthMock } from '../data/health.mock';
import { SystemHealth } from '../types/health';

/**
 * Fetches real-time health metrics for all distributed edge regions.
 * Simulates network latency for retrieving infrastructure telemetry.
 * 
 * @returns {Promise<SystemHealth[]>}
 */
export const getSystemHealth = (): Promise<SystemHealth[]> => {
  return new Promise((resolve) => {
    // Simulate telemetry aggregation delay
    setTimeout(() => {
      resolve([...healthMock]);
    }, 450);
  });
};