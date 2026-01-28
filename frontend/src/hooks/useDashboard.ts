import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboard.service';
import { DashboardStats } from '../types/dashboard';
import { ShortLink } from '../types/link';


export function useDashboard(_newLink: ShortLink | null = null) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      // Don't set loading to true if we already have data (prevents flickering)
      if (!data) setLoading(true);
      setError(null);

      try {
        const stats = await getDashboardStats();
        if (isMounted) {
          setData(stats);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading dashboard statistics:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [_newLink]);

  return { data, loading, error };
}
