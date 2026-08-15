"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import { clearToken, setToken } from "@/lib/api";
import { USER_KEY } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "STUDENT" | "RECRUITER";
    companyName?: string;
  }) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = loadStoredUser();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate stored session after mount to avoid SSR mismatch
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await get<{ id?: string } & User>("/users/profile");
      const fetched = res.data as unknown as User;
      const normalized = { ...fetched, _id: fetched._id || fetched.id || "" };
      setUser(normalized);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    } catch {
      // keep stored user
    }
  }, []);

  const persistAuth = (res: AuthResponse) => {
    const normalized = { ...res.user, _id: res.user._id || res.user.id || "" };
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await post<AuthResponse>("/auth/login", { email, password });
      return persistAuth(res.data);
    },
    [],
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: "STUDENT" | "RECRUITER";
      companyName?: string;
    }) => {
      const res = await post<AuthResponse>("/auth/register", data);
      return persistAuth(res.data);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      setUser,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
