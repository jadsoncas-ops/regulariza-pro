import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC ROUTES (No auth needed)
  if (
    pathname === '/' ||
    pathname === '/portal/login' ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/portal/auth/login') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // 2. CLIENT PORTAL PROTECTION
  if (pathname.startsWith('/portal') || pathname.startsWith('/api/portal')) {
    const session = request.cookies.get('portal_session')?.value;

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    try {
      await jwtVerify(session, SECRET);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  // 3. ADMIN / INTERNAL PROTECTION
  // For now, if no admin_session exists, we redirect to a future admin login.
  // To avoid locking the user out while they haven't set up admin auth, 
  // we will allow GET requests for now but PROTECT all mutations (POST, PATCH, DELETE)
  // and critical admin paths.
  
  const adminSession = request.cookies.get('admin_session')?.value;
  const isMutation = ['POST', 'PATCH', 'DELETE'].includes(request.method);
  const isAdminPath = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/clientes') || 
                      pathname.startsWith('/processos') || 
                      pathname.startsWith('/api/');

  if (isAdminPath && (isMutation || pathname.includes('admin') || !adminSession)) {
    if (!adminSession) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ 
          error: 'Acesso Restrito: Autenticação administrativa necessária.' 
        }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(adminSession, SECRET);
      const role = payload.role as string;

      // RBAC - Path Protection
      if (pathname.startsWith('/bi') && !['admin', 'manager'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if ((pathname.startsWith('/usuarios') || pathname.startsWith('/api/usuarios')) && role !== 'admin') {
        return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
      }

      return NextResponse.next();
    } catch (e) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Sessão administrativa inválida' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
