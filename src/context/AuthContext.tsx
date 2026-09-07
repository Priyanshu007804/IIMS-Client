import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { loginApi, registerApi } from '../api/auth';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  ROLE_OVERRIDE_KEY,
  onApiEvent,
} from '../api/client';
import { decodeJwt, isTokenExpired } from '../utils/jwt';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  coldStartActive: boolean;
  login: (email: string, password: string, preferredRole?: UserRole) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const inferRoleFromEmail = (email: string): UserRole => {
  const lower = email.toLowerCase().trim();
  if (lower === 'admin@test.com') return 'USER';
  if (lower.includes('engineer')) return 'ENGINEER';
  if (lower.includes('admin')) return 'ADMIN';
  return 'USER';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(ROLE_OVERRIDE_KEY) as UserRole | null;
    if (savedRole && ['ADMIN', 'ENGINEER', 'USER'].includes(savedRole)) {
      return savedRole;
    }
    return 'ADMIN'; // Default view mode to ADMIN to showcase full enterprise capabilities
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [coldStartActive, setColdStartActive] = useState<boolean>(false);

  // Initialize and validate token
  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existingToken) {
      if (isTokenExpired(existingToken)) {
        console.warn('Stored JWT session expired. Logging out.');
        logout();
      } else {
        const decoded = decodeJwt(existingToken);
        if (decoded?.sub) {
          const cachedUser = localStorage.getItem(USER_STORAGE_KEY);
          let parsedUser: User | null = null;
          if (cachedUser) {
            try {
              parsedUser = JSON.parse(cachedUser);
            } catch {
              // ignore
            }
          }
          if (!parsedUser) {
            const resolvedRole = (decoded.role as UserRole) || inferRoleFromEmail(decoded.sub);
            const newUser: User = {
              email: decoded.sub,
              role: resolvedRole,
            };
            setUser(newUser);
            setActiveRoleState(resolvedRole);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            localStorage.setItem(ROLE_OVERRIDE_KEY, resolvedRole);
          } else {
            setActiveRoleState(parsedUser.role);
          }
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Listen to API events (unauthorized, cold starts)
  useEffect(() => {
    const unsubs = [
      onApiEvent('unauthorized', () => {
        logout();
      }),
      onApiEvent('cold_start_begin', () => {
        setColdStartActive(true);
      }),
      onApiEvent('cold_start_end', () => {
        setColdStartActive(false);
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  const setActiveRole = useCallback((role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(ROLE_OVERRIDE_KEY, role);
    setUser((prev) => (prev ? { ...prev, role } : null));
  }, []);

  const login = useCallback(
    async (email: string, password: string, preferredRole?: UserRole) => {
      const response = await loginApi(email, password);
      const jwt = response.token;

      localStorage.setItem(TOKEN_STORAGE_KEY, jwt);
      setToken(jwt);

      const decoded = decodeJwt(jwt);
      const userEmail = decoded?.sub || email;
      const targetRole = preferredRole || (decoded?.role as UserRole) || inferRoleFromEmail(userEmail);

      setActiveRoleState(targetRole);
      localStorage.setItem(ROLE_OVERRIDE_KEY, targetRole);

      const newUser: User = {
        email: userEmail,
        role: targetRole,
      };

      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const response = await registerApi(email, password);
      // Real backend returns UserResponse: { id, email, role: 'USER' }
      // Auto-login so the user immediately transitions to the authenticated workspace
      await login(email, password, (response.role as UserRole) || 'USER');
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ROLE_OVERRIDE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        isAuthenticated,
        isLoading,
        coldStartActive,
        login,
        register,
        logout,
        setActiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
