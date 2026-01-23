import { useState, useEffect } from 'react';
import { getAllLinks, createShortLink, updateLink, deleteLink } from '../services/link.service';
import { ShortLink } from '../types/link';

/**
 * Custom hook to manage the state and operations for short links.
 * Handles fetching existing links and adding new ones.
 * 
 * @returns {{ links: ShortLink[], loading: boolean, addLink: (url: string) => Promise<void>, editLink: (id: string, updates: Partial<ShortLink>) => Promise<void>, removeLink: (id: string) => Promise<void> }}
 */
export const useLinks = () => {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLinks = async () => {
      setLoading(true);
      try {
        const data = await getAllLinks();
        if (isMounted) {
          setLinks(data);
        }
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLinks();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Shortens a new URL and adds it to the list of links.
   * 
   * @param url - The destination URL to shorten.
   */
  const addLink = async (url: string) => {
    try {
      const newLink = await createShortLink(url);
      setLinks((prev) => [newLink, ...prev]);
    } catch (error) {
      console.error('Error adding new link:', error);
      throw error;
    }
  };

  async function editLink(id: string, updates: Partial<ShortLink>) {
    const updated = await updateLink(id, updates);
    setLinks(prev =>
      prev.map(l => (l.id === id ? updated : l))
    );
  }

  async function removeLink(id: string) {
    await deleteLink(id);
    setLinks(prev => prev.filter(l => l.id !== id));
  }

  return { links, loading, addLink, editLink, removeLink };
};