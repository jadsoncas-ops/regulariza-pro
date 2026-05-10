import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// SECURITY: Move secret to ENV variable with fallback for development
const secretKey = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-in-production";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Reduced from 7d to 1d for higher security
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

/**
 * Portal Session Management
 */
export async function loginPortal(cliente: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ 
    id: cliente.id, 
    role: 'client',
    sub: cliente.id 
  });

  const cookieStore = await cookies();
  cookieStore.set('portal_session', session, { 
    expires, 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

export async function logoutPortal() {
  const cookieStore = await cookies();
  cookieStore.set('portal_session', '', { expires: new Date(0) });
}

export async function getPortalSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('portal_session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (e) {
    return null;
  }
}
