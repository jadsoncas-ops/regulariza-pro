import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/authAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { logAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // RATE LIMITING
    const rateLimit = checkRateLimit(`admin_${email}`);
    if (!rateLimit.success) {
      await logAction({
        acao: 'BLOQUEIO ADMIN BRUTE FORCE',
        modulo: 'ADMIN_AUTH',
        usuario: email,
        detalhe: `Bloqueado por ${rateLimit.remainingTime} min.`
      });
      return NextResponse.json({ 
        error: `Muitas tentativas. Tente novamente em ${rateLimit.remainingTime} minutos.` 
      }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // In a real production app, use bcrypt.compare(password, user.password)
    // For now, we compare direct strings to match the user's current setup if needed,
    // but we SHOULD use hashing. 
    if (!user || user.password !== password) {
      await logAction({
        acao: 'FALHA DE LOGIN ADMIN',
        modulo: 'ADMIN_AUTH',
        usuario: email,
        detalhe: 'Credenciais inválidas'
      });
      return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 });
    }

    await loginAdmin(user);

    await logAction({
      acao: 'LOGIN ADMIN SUCESSO',
      modulo: 'ADMIN_AUTH',
      usuario: user.name,
      detalhe: `IP: ${req.headers.get('x-forwarded-for') || 'local'}`
    });

    return NextResponse.json({ success: true, name: user.name });

  } catch (error) {
    console.error('ADMIN_LOGIN_ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
