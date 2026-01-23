import { useState, useEffect } from "react";
import { getAnalytics } from "../services/analytics.service";
import { AnalyticsResponse } from "../types/analytics";

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
          setData(response);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
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
