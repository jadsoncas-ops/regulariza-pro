import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { loginPortal } from '@/lib/authPortal';

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

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
      return NextResponse.json({ error: 'Identificação ou código inválido' }, { status: 401 });
    }

    if (cliente.status !== 'ativo') {
      return NextResponse.json({ error: 'Acesso suspenso. Entre em contato com o suporte.' }, { status: 403 });
    }

    await loginPortal(cliente);

    return NextResponse.json({ success: true, nome: cliente.nome });

  } catch (error) {
    console.error('PORTAL_LOGIN_ERROR:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
