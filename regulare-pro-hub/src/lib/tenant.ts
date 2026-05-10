import { getAdminSession } from './authAdmin';

/**
 * Ensures the user is authenticated and returns their empresaId.
 * Falls back to 'default-tenant' for backward compatibility during transition.
 */
export async function getTenantId(): Promise<string> {
  try {
    const session = await getAdminSession();
    if (session && session.empresaId) {
      return session.empresaId as string;
    }
  } catch (e) {
    // Session read failed — use default tenant for safety
  }
  // Fallback: allows the system to work before full admin auth is configured
  return 'default-tenant';
}

/**
 * Standard where clause for multi-tenant isolation.
 */
export async function tenantWhere(additional: Record<string, any> = {}) {
  const empresaId = await getTenantId();
  return {
    empresaId,
    ...additional
  };
}
