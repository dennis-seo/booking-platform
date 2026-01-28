import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { logger } from '../utils/logger';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock users for development
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for stored auth on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        logger.info('User restored from storage', { userId: user.id });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call delay
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

    logger.info('User logged in', { userId: user.id });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    logger.info('User logged out');
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
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

    // In a real app, this would be saved to the backend
    mockUsers.push({ ...newUser, password: data.password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    setState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });

    logger.info('User registered', { userId: newUser.id });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
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
