export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  isPrivate: boolean;
  allowPublicView: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDashboard {
  user: User;
  stats: {
    totalLinks: number;
    totalClicks: number;
    topLink?: {
      shortCode: string;
      title?: string;
      clicks: number;
    };
    links: Array<{
      id: string;
      shortCode: string;
      clicks: number;
      title?: string;
      createdAt: string;
    }>;
  };
  trending: Array<{
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    title?: string;
    description?: string;
    favicon?: string;
    createdAt: string;
  }>;
}
