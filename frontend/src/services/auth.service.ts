import apiService from './api.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserDashboard,
} from '../types/user';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiService.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiService.post('/auth/login', data);
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiService.get('/auth/profile');
    return response.data;
  },

  getDashboard: async (): Promise<UserDashboard> => {
    const response = await apiService.get('/users/dashboard');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiService.put('/users/profile', data);
    return response.data;
  },

  getUserPublicProfile: async (userId: string) => {
    const response = await apiService.get(`/users/${userId}`);
    return response.data;
  },

  getTrendingLinks: async (limit = 10, days = 7) => {
    const response = await apiService.get('/users/trending', {
      params: { limit, days },
    });
    return response.data;
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

export default authService;
