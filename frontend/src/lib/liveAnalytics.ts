import { LiveStreamItem } from '../types/dashboard';

/**
 * Starts a live analytics data stream simulation.
 * Generates a new random LiveStreamItem every 1500ms and invokes the provided callback.
 * 
 * @param callback - Function to handle the generated analytics item.
 * @returns {number} The interval ID which can be used to stop the simulation.
 */
export const startLiveAnalytics = (callback: (data: LiveStreamItem) => void): number => {
  const regions = ["US-EAST", "US-WEST", "EU-CENTRAL", "ASIA-SOUTH", "BRAZIL"];

  const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const intervalId = window.setInterval(() => {
    const newItem: LiveStreamItem = {
      id: generateId(),
      region: regions[Math.floor(Math.random() * regions.length)],
      ops: Math.floor(Math.random() * 191) + 10, // Generates number between 10 and 200
      volume: Math.floor(Math.random() * 1101) + 100, // Generates number between 100 and 1200
    };
    callback(newItem);
  }, 1500);

  return intervalId;
};
