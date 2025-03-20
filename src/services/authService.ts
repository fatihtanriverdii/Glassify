import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:7289/api';

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
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token)
      return false;

    const response = await fetch(`${API_URL}/Auth/check`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if(response.status === 200)
      return true;
    else
      return false;
  },
};
