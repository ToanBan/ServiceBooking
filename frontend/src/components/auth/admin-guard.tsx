'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_HOME, ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/auth-context';
import { USER_ROLE } from '@/types/auth';

interface AdminGuardProps {
  children: React.ReactNode;
}


export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, status } = useAuth();

  const isAdmin = user?.role === USER_ROLE.Admin;
  const redirectPath = user ? ROUTES.forbidden : ROLE_HOME[USER_ROLE.Customer];

  useEffect(() => {
    if (status === 'loading' || isAdmin) return;
    router.replace(redirectPath);
  }, [status, isAdmin, redirectPath, router]);
  if (status === 'loading') return null;

  if (!isAdmin) return null;

  return <>{children}</>;
}
