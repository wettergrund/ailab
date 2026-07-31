export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'client' | 'worker' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserResponse {
  userId: number;
  email: string;
  role: string;
}
