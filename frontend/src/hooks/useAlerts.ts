import { useState, useEffect } from "react";
import { getAlerts } from "../services/alert.service";
import { Alert } from "../types/alert";

/**
 * Custom hook to manage the state and fetching of system alerts.
 * 
 * @returns {{ alerts: Alert[], loading: boolean }}
 */
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const data = await getAlerts();
        if (isMounted) {
          setAlerts(data);
        }
      } catch (error) {
        console.error("Error fetching alerts data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { alerts, loading };
};