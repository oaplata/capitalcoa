import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// Configuración base de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticación
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  logout: () => apiClient.post('/auth/logout'),
  
  getProfile: () => apiClient.get('/auth/profile'),
};

// API de usuarios
export const usersApi = {
  getAll: (params?: any) => apiClient.get('/users', { params }),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (user: any) => apiClient.post('/users', user),
  update: (id: number, user: any) => apiClient.patch(`/users/${id}`, user),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

// API de activos
export const assetsApi = {
  getAll: (params?: any) => apiClient.get('/assets', { params }),
  getById: (ticker: string) => apiClient.get(`/assets/${ticker}`),
  create: (asset: any) => apiClient.post('/assets', asset),
  update: (ticker: string, asset: any) => apiClient.put(`/assets/${ticker}`, asset),
  delete: (ticker: string) => apiClient.delete(`/assets/${ticker}`),
};

// API de señales
export const signalsApi = {
  getAll: (params?: any) => apiClient.get('/signals', { params }),
  getById: (id: number) => apiClient.get(`/signals/${id}`),
  create: (signal: any) => apiClient.post('/signals', signal),
  update: (id: number, signal: any) => apiClient.patch(`/signals/${id}`, signal),
  delete: (id: number) => apiClient.delete(`/signals/${id}`),
};

// API de trades
export const tradesApi = {
  getAll: (params?: any) => apiClient.get('/trades', { params }),
  getById: (id: number) => apiClient.get(`/trades/${id}`),
  create: (trade: any) => apiClient.post('/trades', trade),
  update: (id: number, trade: any) => apiClient.patch(`/trades/${id}`, trade),
  delete: (id: number) => apiClient.delete(`/trades/${id}`),
  close: (id: number, exitData: any) => apiClient.post(`/trades/${id}/close`, exitData),
};

// API de backtests
export const backtestsApi = {
  getAll: (params?: any) => apiClient.get('/backtests', { params }),
  getById: (id: number) => apiClient.get(`/backtests/${id}`),
  create: (backtest: any) => apiClient.post('/backtests', backtest),
  update: (id: number, backtest: any) => apiClient.patch(`/backtests/${id}`, backtest),
  delete: (id: number) => apiClient.delete(`/backtests/${id}`),
  run: (id: number) => apiClient.post(`/backtests/${id}/run`),
  compare: (ids: number[]) => apiClient.post('/backtests/compare', { ids }),
  getStats: () => apiClient.get('/backtests/stats'),
};

export default apiClient; 