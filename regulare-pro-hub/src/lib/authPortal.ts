import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = "secret-portal-key-regulare-pro"; // In production, use process.env.PORTAL_SECRET
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function loginPortal(cliente: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ id: cliente.id, nome: cliente.nome, email: cliente.email });

  const cookieStore = await cookies();
  cookieStore.set('portal_session', session, { expires, httpOnly: true });
}

export async function logoutPortal() {
  const cookieStore = await cookies();
  cookieStore.set('portal_session', '', { expires: new Date(0) });
}

export async function getPortalSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('portal_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}
