import { AnalyticsResponse } from '../types/analytics';

export const analyticsMock: AnalyticsResponse = {
  summary: {
    totalClicks: 142850,
    topRegion: 'US-EAST-1'
  },
  points: [
    { timestamp: '2024-03-21T08:00:00Z', clicks: 1240, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T08:15:00Z', clicks: 2150, region: 'EU-WEST-2' },
    { timestamp: '2024-03-21T08:30:00Z', clicks: 1890, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T08:45:00Z', clicks: 3420, region: 'AP-SOUTH-1' },
    { timestamp: '2024-03-21T09:00:00Z', clicks: 2800, region: 'US-WEST-2' },
    { timestamp: '2024-03-21T09:15:00Z', clicks: 4100, region: 'EU-WEST-2' },
    { timestamp: '2024-03-21T09:30:00Z', clicks: 3950, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T09:45:00Z', clicks: 1200, region: 'SA-EAST-1' },
    { timestamp: '2024-03-21T10:00:00Z', clicks: 5600, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T10:15:00Z', clicks: 4800, region: 'EU-CENTRAL-1' },
    { timestamp: '2024-03-21T10:30:00Z', clicks: 3200, region: 'AP-NORTHEAST-1' },
    { timestamp: '2024-03-21T10:45:00Z', clicks: 2100, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T11:00:00Z', clicks: 1500, region: 'US-WEST-1' },
    { timestamp: '2024-03-21T11:15:00Z', clicks: 900, region: 'EU-WEST-1' },
    { timestamp: '2024-03-21T11:30:00Z', clicks: 2300, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T11:45:00Z', clicks: 3100, region: 'AP-SOUTH-1' },
    { timestamp: '2024-03-21T12:00:00Z', clicks: 4500, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T12:15:00Z', clicks: 5200, region: 'EU-WEST-2' },
    { timestamp: '2024-03-21T12:30:00Z', clicks: 4100, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T12:45:00Z', clicks: 3800, region: 'US-WEST-2' },
    { timestamp: '2024-03-21T13:00:00Z', clicks: 2900, region: 'AP-SOUTHEAST-1' },
    { timestamp: '2024-03-21T13:15:00Z', clicks: 1800, region: 'EU-CENTRAL-1' },
    { timestamp: '2024-03-21T13:30:00Z', clicks: 2400, region: 'US-EAST-1' },
    { timestamp: '2024-03-21T13:45:00Z', clicks: 3300, region: 'SA-EAST-1' },
    { timestamp: '2024-03-21T14:00:00Z', clicks: 4000, region: 'US-EAST-1' }
  ]
};
