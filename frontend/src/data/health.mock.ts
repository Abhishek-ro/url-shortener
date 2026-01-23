import { SystemHealth } from '../types/health';

export const healthMock: SystemHealth[] = [
  {
    region: 'US-EAST-1 (N. Virginia)',
    status: 'healthy',
    uptime: 99.99,
    cpu: 42,
    memory: 65,
  },
  {
    region: 'US-WEST-2 (Oregon)',
    status: 'healthy',
    uptime: 99.98,
    cpu: 38,
    memory: 58,
  },
  {
    region: 'EU-WEST-1 (Ireland)',
    status: 'degraded',
    uptime: 98.45,
    cpu: 89,
    memory: 92,
  },
  {
    region: 'AP-SOUTHEAST-1 (Singapore)',
    status: 'healthy',
    uptime: 99.95,
    cpu: 25,
    memory: 44,
  },
  {
    region: 'SA-EAST-1 (São Paulo)',
    status: 'healthy',
    uptime: 99.90,
    cpu: 31,
    memory: 52,
  },
  {
    region: 'AF-SOUTH-1 (Cape Town)',
    status: 'down',
    uptime: 0,
    cpu: 0,
    memory: 0,
  },
  {
    region: 'ME-SOUTH-1 (Bahrain)',
    status: 'healthy',
    uptime: 99.97,
    cpu: 18,
    memory: 35,
  },
  {
    region: 'EU-CENTRAL-1 (Frankfurt)',
    status: 'healthy',
    uptime: 99.99,
    cpu: 55,
    memory: 70,
  },
];