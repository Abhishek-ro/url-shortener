import { useState, useEffect } from 'react';
import { getSystemHealth } from '../services/health.service';
import { SystemHealth } from '../types/health';

export const useHealth = () => {
  const [health, setHealth] = useState<SystemHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealthData = async () => {
    try {
      const data = await getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching system health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Optional: Refresh health data every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const globalLatency = health.length
    ? Math.round(
        health.reduce((acc, curr) => acc + (curr.latency || 0), 0) /
          health.length,
      )
    : 0;

  return { health, loading, globalLatency, refresh: fetchHealthData };
};
