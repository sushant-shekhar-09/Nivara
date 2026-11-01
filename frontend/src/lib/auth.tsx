/**
 * Auth context + useAuth hook.
 * Manages JWT token persistence, role-based access, login/logout flow.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { loginUser, registerUser, type TokenResponse } from './api';

type UserRole = 'student' | 'counsellor' | 'admin' | 'institution_admin' | 'platform_admin' | 'org_admin';

interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  tenantId?: string;
  tenantSlug?: string;
  orgId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (response: TokenResponse, email: string) => void;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'nivara_token';
const USER_KEY = 'nivara_user';

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('studentmind_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    // Verify token still exists
    const token = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('studentmind_token');
    if (!token) return null;
    return { ...parsed, token };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = parseStoredUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const loginWithToken = useCallback((response: TokenResponse, email: string) => {
    const authUser: AuthUser = {
      userId: response.user_id,
      email,
      role: response.role as UserRole,
      token: response.access_token,
      tenantId: response.tenant_id,
      tenantSlug: response.tenant_slug,
      orgId: response.org_id,
    };
    localStorage.setItem(STORAGE_KEY, response.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response: TokenResponse = await loginUser({ email, password });
    loginWithToken(response, email);
  }, [loginWithToken]);

  const register = useCallback(async (email: string, password: string, role?: string) => {
    await registerUser({ email, password, role });
    // After registration, auto-login
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('studentmind_token');
    localStorage.removeItem('studentmind_user');
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: UserRole[]): boolean => {
    if (!user) return false;
    if (roles.includes(user.role)) return true;
    if (roles.includes('admin') && (user.role === 'institution_admin' || user.role === 'platform_admin')) return true;
    if (roles.includes('institution_admin') && user.role === 'admin') return true;
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        loginWithToken,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { UserRole, AuthUser };
