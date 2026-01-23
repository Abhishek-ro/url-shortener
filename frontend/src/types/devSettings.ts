export interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface DeveloperSettings {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
}