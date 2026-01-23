import { useState, useEffect } from "react";
import { getSystemHealth } from "../services/health.service";
import { SystemHealth } from "../types/health";

/**
 * Custom hook to manage the state and fetching of regional system health metrics.
 * 
 * @returns {{ health: SystemHealth[], loading: boolean }}
 */
export const useHealth = () => {
  const [health, setHealth] = useState<SystemHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHealthData = async () => {
      setLoading(true);
      try {
        const data = await getSystemHealth();
        if (isMounted) {
          setHealth(data);
        }
      } catch (error) {
        console.error("Error fetching system health data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHealthData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { health, loading };
};