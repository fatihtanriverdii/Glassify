import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async checkAuthStatus(): Promise<boolean> {
    const token = localStorage.getItem('token');

    if (!token)
      return false;

    const response = await fetch(`${API_URL}/Auth/check`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.status === 200;
  },
};
