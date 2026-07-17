import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, adminLogin as apiAdminLogin, register as apiRegister, logout as apiLogout, updateProfile as apiUpdateProfile, User } from '@/lib/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  adminLogin: (credentials: Record<string, string>) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; email: string; password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on initial load
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: Record<string, string>) => {
    const userData = await apiLogin(credentials);
    setUser(userData);
  };

  const adminLogin = async (credentials: Record<string, string>) => {
    const userData = await apiAdminLogin(credentials);
    setUser(userData);
  };

  const register = async (data: Record<string, string>) => {
    const userData = await apiRegister(data);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: { name: string; email: string; password?: string }) => {
    const userData = await apiUpdateProfile(data);
    setUser(userData);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, adminLogin, register, logout, updateProfile }}>
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
