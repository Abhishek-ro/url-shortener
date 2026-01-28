import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/analytics.service';
import { AnalyticsResponse } from '../types/analytics';

/**
 * Custom hook to manage the state and fetching of platform-wide analytics.
 *
 * @returns {{ data: AnalyticsResponse | null, loading: boolean }}
 */
export const useAnalytics = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await getAnalytics();
        if (isMounted) {
          // Ensure data has required fields with defaults
          const enhancedData: AnalyticsResponse = {
            summary: {
              totalClicks: response.summary?.totalClicks || 0,
              totalLinks: response.summary?.totalLinks || 0,
              topRegion: response.summary?.topRegion || 'UNKNOWN',
              topDevice: response.summary?.topDevice || 'UNKNOWN',
              avgLatency: response.summary?.avgLatency || 0,
              conversionRate: response.summary?.conversionRate || 0,
            },
            points: response.points || [],
            topRegions: response.topRegions || [],
            lastUpdated: response.lastUpdated || new Date().toISOString(),
          };
          setData(enhancedData);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Set empty data structure on error to show "no data" instead of loading forever
        if (isMounted) {
          setData({
            summary: {
              totalClicks: 0,
              totalLinks: 0,
              topRegion: 'UNKNOWN',
              topDevice: 'UNKNOWN',
              avgLatency: 0,
              conversionRate: 0,
            },
            points: [],
            topRegions: [],
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading };
};
