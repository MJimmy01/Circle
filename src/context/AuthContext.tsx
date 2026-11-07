import React, { useCallback, useEffect, useState } from "react";
import type { User } from "../types/auth";
import { authApi } from "../services/api";
import { AuthContext } from "./authContextDef";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user?: string;
  id?: string;
  exp?: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(savedToken);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }
      return savedToken;
    } catch {
      return savedToken;
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem("token"));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, userData?: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await authApi.getProfile();
      const resolvedUser = response.user || response.data?.user;
      if (resolvedUser) {
        setUser(resolvedUser);
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    let isSubscribed = true;

    if (!token) {
      return;
    }

    authApi
      .getProfile()
      .then((response) => {
        const resolvedUser = response.user || response.data?.user;
        if (isSubscribed && resolvedUser) {
          setUser(resolvedUser);
        }
      })
      .catch((error) => {
        console.error("Session verification failed:", error);
        if (isSubscribed) {
          logout();
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        setUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
