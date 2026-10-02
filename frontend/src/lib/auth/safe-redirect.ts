import { USER_ROLE, type UserRole } from '@/types/auth';

const ADMIN_PATH_PREFIX = '/admin';

function isInternalPath(raw: string): boolean {
  return raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\');
}


export function safeRedirectPath(
  raw: string | null,
  role: UserRole,
): string | null {
  if (!raw) return null;
  if (!isInternalPath(raw)) return null;

  const wantsAdminArea = raw === ADMIN_PATH_PREFIX || raw.startsWith(`${ADMIN_PATH_PREFIX}/`);

  if (wantsAdminArea && role !== USER_ROLE.Admin) return null;

  return raw;
}
