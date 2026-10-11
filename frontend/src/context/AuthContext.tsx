'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getAuthToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthModalOpen: false,
  authModalMode: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      setToken(savedToken);
      api
        .getMe()
        .then((userData) => {
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
            setToken(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.access_token);
    setIsAuthModalOpen(false);
  };

  const signup = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    setToken(res.access_token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
