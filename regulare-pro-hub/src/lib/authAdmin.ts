import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-in-production";
const key = new TextEncoder().encode(secretKey);

export async function encryptAdmin(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Admin sessions are shorter for security
    .sign(key);
}

export async function loginAdmin(user: any) {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
  const session = await encryptAdmin({ 
    id: user.id, 
    role: user.role || 'admin', 
    name: user.name,
    empresaId: user.empresaId 
  });

  const cookieStore = await cookies();
  cookieStore.set('admin_session', session, { 
    expires, 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { expires: new Date(0) });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (e) {
    return null;
  }
}
