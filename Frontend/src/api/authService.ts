import axios from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest,
  AuthResponse,
  UpdateUserRequest,
  User 
} from '@/types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // Register (POST /api/users/register)
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/register', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  // Login (POST /api/users/login)
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/login', data);

    console.log(response);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  // Refresh Token (POST /api/users/refresh-token)
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/refresh-token', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  // Logout (POST /api/users/logout) - requires auth
  logout: async (): Promise<void> => {
    await api.post('/users/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Get Current User (GET /api/users/me) - requires auth
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Get User by ID (GET /api/users/{id}) - requires auth
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update User (PUT /api/users/{id}) - requires auth
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete User (DELETE /api/users/{id}) - requires auth
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get tokens
  getTokens: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),
};