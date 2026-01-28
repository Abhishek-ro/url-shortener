import { useState, useEffect } from 'react';
import { getTopLinks } from '../services/link.service';
import { ShortLink } from '../types/link';

export const useTopLinks = (limit: number = 10) => {
  const [topLinks, setTopLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTopLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopLinks(limit);
        if (isMounted) {
          setTopLinks(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch top links');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTopLinks();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { topLinks, loading, error };
};
