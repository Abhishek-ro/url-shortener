import { Campaign } from '../types/campaign';

export const campaignsMock: Campaign[] = [
  {
    id: 'CMP-001',
    name: 'Black Friday 2024',
    createdAt: '2024-11-01T09:00:00Z',
    totalLinks: 42,
    totalClicks: 842100
  },
  {
    id: 'CMP-002',
    name: 'Influencer Outreach',
    createdAt: '2024-12-15T10:30:00Z',
    totalLinks: 128,
    totalClicks: 1200000
  },
  {
    id: 'CMP-003',
    name: 'Product Launch v2',
    createdAt: '2025-01-20T08:15:00Z',
    totalLinks: 12,
    totalClicks: 15400
  },
  {
    id: 'CMP-004',
    name: 'Q1 Marketing Blitz',
    createdAt: '2025-02-10T14:45:00Z',
    totalLinks: 245,
    totalClicks: 94200
  }
];
