'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for token in localStorage first
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Backend'den auth durumunu kontrol et
      const response = await authService.checkAuthStatus();
      if (response) {
        setIsAuthenticated(true);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
      
    } catch (err) {
      // If there's an error, clear the token and set not authenticated
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.isSuccess) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        setIsAuthenticated(true);
        router.push('/seller');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.isSuccess) {
        setIsAuthenticated(true);
        router.push('/seller');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 