import { DeveloperSettings } from '../types/devSettings';

export const devSettingsMock: DeveloperSettings = {
  apiKeys: [
    {
      id: 'AK-001',
      key: 'bolt_live_a7f293b1c5e4d2',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'AK-002',
      key: 'bolt_test_k9b1x7r4p2z5q8',
      createdAt: '2024-02-20T14:30:00Z',
    },
    {
      id: 'AK-003',
      key: 'bolt_analytics_p2r4m5n8s1',
      createdAt: '2024-03-10T09:15:00Z',
    }
  ],
  webhooks: [
    {
      id: 'WH-001',
      url: 'https://api.myapp.com/webhooks/bolt',
      active: true,
      createdAt: '2024-01-18T11:00:00Z',
    },
    {
      id: 'WH-002',
      url: 'https://events.analytics-tool.io/inbound',
      active: false,
      createdAt: '2024-02-25T16:45:00Z',
    }
  ]
};