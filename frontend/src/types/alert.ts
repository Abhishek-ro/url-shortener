export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
}