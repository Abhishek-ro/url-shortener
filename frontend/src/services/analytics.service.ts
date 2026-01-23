import { analyticsMock } from '../data/analytics.mock';
import { AnalyticsResponse } from '../types/analytics';

/**
 * Fetches platform-wide analytics data.
 * Simulates an asynchronous API call with a 750ms delay.
 * 
 * @returns {Promise<AnalyticsResponse>}
 */
export const getAnalytics = (): Promise<AnalyticsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(analyticsMock);
    }, 750);
  });
};
