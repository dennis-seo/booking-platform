import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { logger } from '../utils/logger';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: { name: string; phone: string }) => Promise<void>;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock users for development (used when Supabase is not configured)
const mockUsers: (User & { password: string })[] = [
  {
    id: 'user-1',
    name: '김고객',
    email: 'customer@test.com',
    password: 'password',
    phone: '010-1234-5678',
    role: 'customer',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-owner-1',
    name: '박사장',
    email: 'owner@test.com',
    password: 'password',
    phone: '010-9876-5432',
    role: 'business_owner',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-1',
    name: '관리자',
    email: 'admin@test.com',
    password: 'password',
    phone: '010-0000-0000',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const STORAGE_KEY = 'booking_platform_auth';

// Convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    phone: supabaseUser.user_metadata?.phone,
    role: supabaseUser.user_metadata?.role || 'customer',
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // Supabase mode: Check session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const user = mapSupabaseUser(session.user);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          logger.info('Supabase session restored', { userId: user.id });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const user = mapSupabaseUser(session.user);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock mode: Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          logger.info('Mock user restored from storage', { userId: user.id });
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  // Email/Password Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));

    if (isSupabaseConfigured() && supabase) {
      // Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(error.message);
      }

      if (data.user) {
        const user = mapSupabaseUser(data.user);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.info('Supabase login successful', { userId: user.id });
      }
    } else {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUser = mockUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!mockUser) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      const { password: _, ...user } = mockUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      logger.info('Mock login successful', { userId: user.id });
    }
  }, []);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Google 로그인을 사용하려면 Supabase 설정이 필요합니다.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    logger.info('User logged out');
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));

    if (isSupabaseConfigured() && supabase) {
      // Supabase registration
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            phone: data.phone,
            role: data.role,
          },
        },
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(error.message);
      }

      if (authData.user) {
        const user = mapSupabaseUser(authData.user);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.info('Supabase registration successful', { userId: user.id });
      }
    } else {
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mockUsers.some(u => u.email === data.email)) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error('이미 사용 중인 이메일입니다.');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        createdAt: new Date().toISOString(),
      };

      mockUsers.push({ ...newUser, password: data.password });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      setState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      logger.info('Mock registration successful', { userId: newUser.id });
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback(async (data: { name: string; phone: string }) => {
    if (!state.user) {
      throw new Error('로그인이 필요합니다.');
    }

    if (isSupabaseConfigured() && supabase) {
      // Supabase profile update
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          phone: data.phone,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const updatedUser: User = {
        ...state.user,
        name: data.name,
        phone: data.phone,
      };

      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      logger.info('Supabase profile updated', { userId: updatedUser.id });
    } else {
      // Mock profile update
      const updatedUser: User = {
        ...state.user,
        name: data.name,
        phone: data.phone,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      logger.info('Mock profile updated', { userId: updatedUser.id });
    }
  }, [state.user]);

  // Check if profile is complete (has name and phone)
  const isProfileComplete = !!(state.user?.name && state.user?.phone);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, logout, register, updateProfile, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
