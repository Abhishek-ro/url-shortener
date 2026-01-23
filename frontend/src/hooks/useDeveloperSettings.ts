import { useState, useEffect } from "react";
import { getDeveloperSettings } from "../services/devSettings.service";
import { DeveloperSettings } from "../types/devSettings";

/**
 * Custom hook to manage the state and fetching of developer-specific settings.
 * 
 * @returns {{ settings: DeveloperSettings | null, loading: boolean }}
 */
export const useDeveloperSettings = () => {
  const [settings, setSettings] = useState<DeveloperSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getDeveloperSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching developer settings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
};