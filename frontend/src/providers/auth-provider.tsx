"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { onAuthFailure } from "@/lib/http";
import { authApi } from "@/services/auth.service";
import type { AuthUser, RegisterPayload } from "@/types/auth";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const wasAuthenticated = useRef(false);

  const applyUser = useCallback((next: AuthUser | null) => {
    wasAuthenticated.current = next !== null;
    setUser(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(
    () =>
      onAuthFailure(() => {
        const shouldRedirect = wasAuthenticated.current;
        applyUser(null);

        if (shouldRedirect) {
          router.replace(
            `${ROUTES.login}?redirect=${encodeURIComponent(pathname)}`,
          );
        }
      }),
    [applyUser, pathname, router],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const me = await authApi.me();
        if (!cancelled) applyUser(me);
      } catch {
        if (!cancelled) applyUser(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: loggedIn } = await authApi.login({ email, password });
      applyUser(loggedIn);
      return loggedIn;
    },
    [applyUser],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      applyUser(null);
      router.replace(ROUTES.login);
    }
  }, [applyUser, router]);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
