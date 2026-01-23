export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  cpu: number;
  memory: number;
  region: string;
}