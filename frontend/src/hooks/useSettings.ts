import { useState, useEffect } from "react";
import { getUserSettings } from "../services/settings.service";
import { UserSettings } from "../types/settings";

/**
 * Custom hook to manage the state and fetching of user-specific profile and configuration settings.
 * 
 * @returns {{ settings: UserSettings | null, loading: boolean }}
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getUserSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
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