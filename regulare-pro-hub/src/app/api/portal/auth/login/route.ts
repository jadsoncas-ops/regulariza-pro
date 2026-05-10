import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { loginPortal } from '@/lib/authPortal';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';
import { logAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

    // RATE LIMITING
    const rateLimit = checkRateLimit(identifier);
    if (!rateLimit.success) {
      await logAction({
        acao: 'BLOQUEIO BRUTE FORCE',
        modulo: 'PORTAL_AUTH',
        usuario: identifier,
        detalhe: `Muitas tentativas falhas. Bloqueado por ${rateLimit.remainingTime} min.`
      });
      return NextResponse.json({ 
        error: `Muitas tentativas. Tente novamente em ${rateLimit.remainingTime} minutos.` 
      }, { status: 429 });
    }

    // Find client by CPF/CNPJ or Email
    const cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { cpf_cnpj: identifier },
          { email: identifier }
        ],
        accessCode: code
      }
    });

    if (!cliente) {
      await logAction({
        acao: 'FALHA DE LOGIN PORTAL',
        modulo: 'PORTAL_AUTH',
        usuario: identifier,
        detalhe: 'Identificação ou código inválido'
      });
      return NextResponse.json({ error: 'Identificação ou código inválido' }, { status: 401 });
    }

    if (cliente.status !== 'ativo') {
      return NextResponse.json({ error: 'Acesso suspenso. Entre em contato com o suporte.' }, { status: 403 });
    }

    resetRateLimit(identifier);
    await loginPortal(cliente);

    await logAction({
      clienteId: cliente.id,
      acao: 'LOGIN PORTAL SUCESSO',
      modulo: 'PORTAL_AUTH',
      usuario: cliente.nome,
      detalhe: `IP: ${req.headers.get('x-forwarded-for') || 'local'}`
    });

    return NextResponse.json({ success: true, nome: cliente.nome });

  } catch (error) {
    console.error('PORTAL_LOGIN_ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
