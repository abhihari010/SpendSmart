// Authentication context for managing user session state and authentication methods
// 
// AI-GENERATED (Cursor AI Assistant)
// Prompt: "Create an authentication context with login, register, and logout functionality
// that persists user session and handles JWT token management."
// 
// Modifications by Abhishek:
// - Added TypeScript interfaces for type safety
// - Added loading state 

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Update the AuthContextType
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const { data: user } = await response.json();
          setUser(user);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Session check failed', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  checkAuth();
}, []);

const login = async (email: string, password: string) => {
  try {
    const response = await loginApi({ email, password });
    // The backend now sends the user data in the response
    setUser(response.user);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

const register = async (userData: any) => {
  try {
    const { token, user } = await registerApi(userData);
    localStorage.setItem('token', token);
    setUser(user);
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};