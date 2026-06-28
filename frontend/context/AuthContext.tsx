'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { setAccessToken, getAccessToken, refreshToken as refreshTokenApi } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  showAuthModal: boolean;
  login: (email: string, name: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const onLoginSuccess = useCallback((email: string, name: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserName(name);
    setShowAuthModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const refreshed = await refreshTokenApi();
    if (refreshed) {
      const email =
        (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || 'User';
      const name =
        (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'User';
      onLoginSuccess(email, name);
    } else {
      setShowAuthModal(true);
    }
  }, [onLoginSuccess]);

  const login = useCallback(
    async (email: string, name: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success) {
        setAccessToken(result.data.accessToken);
        onLoginSuccess(result.data.user.email, result.data.user.name || 'User');
      } else {
        throw new Error(result.message || 'Login failed');
      }
    },
    [onLoginSuccess]
  );

  const signup = useCallback(async (email: string, name: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
      credentials: 'include',
    });
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Signup failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = getAccessToken();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserName(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      }
      setShowAuthModal(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        userName,
        showAuthModal,
        login,
        signup,
        logout,
        checkAuth,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
