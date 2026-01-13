export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  avatarUrl?: string;
  role?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  avatarUrl?: string;
}