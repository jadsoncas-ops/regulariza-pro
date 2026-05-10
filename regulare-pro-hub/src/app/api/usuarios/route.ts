import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/tenant';
import { getAdminSession } from '@/lib/authAdmin';

export async function GET() {
  try {
    const empresaId = await getTenantId();
    const session = await getAdminSession();

    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const usuarios = await prisma.user.findMany({
      where: { empresaId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const empresaId = await getTenantId();
    const session = await getAdminSession();

    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    const usuario = await prisma.user.create({
      data: {
        name,
        email,
        password, // In real production, hash this
        role,
        empresaId,
        status: 'ativo'
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('USER_CREATE_ERROR:', error);
    return NextResponse.json({ error: 'Falha ao criar usuário' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const empresaId = await getTenantId();
    const session = await getAdminSession();

    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id, role, status, name, password } = await req.json();

    const updateData: any = { role, status, name };
    if (password) updateData.password = password;

    const usuario = await prisma.user.update({
      where: { id, empresaId },
      data: updateData
    });

    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao atualizar usuário' }, { status: 500 });
  }
}
