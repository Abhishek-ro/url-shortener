import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboard.service';
import { DashboardStats } from '../types/dashboard';
import { ShortLink } from '../types/link';

/**
 * Custom hook to fetch and manage dashboard statistics.
 * Handles the loading state and data storage for the Dashboard module.
 * 
 * @param _newLink - Unused parameter after removing live stream logic.
 * @returns {{ data: DashboardStats | null, loading: boolean }}
 */
export function useDashboard(_newLink?: ShortLink) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await getDashboardStats();
        if (isMounted) {
          setData(stats);
        }
      } catch (error) {
        console.error('Error loading dashboard statistics:', error);
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
  }, []);

  return { data, loading };
}