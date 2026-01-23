import { Alert } from '../types/alert';

export const alertsMock: Alert[] = [
  {
    id: 'ALR-001',
    type: 'error',
    message: 'Critical Latency Spike: US-EAST-1 region average latency > 400ms.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 'ALR-002',
    type: 'warning',
    message: 'Storage Threshold: Shard EU-WEST-04 is at 85% capacity.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'ALR-003',
    type: 'info',
    message: 'System Update: CDN Purge successfully completed for all regions.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'ALR-004',
    type: 'warning',
    message: 'Unusual Traffic Pattern: Rapid click growth detected on campaign "Influencer Outreach".',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  }
];