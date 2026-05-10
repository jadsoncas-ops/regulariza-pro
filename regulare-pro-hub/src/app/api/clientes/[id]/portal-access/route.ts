import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Generate a random 6-digit code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    const updated = await prisma.cliente.update({
      where: { id },
      data: { accessCode }
    });

    return NextResponse.json({ success: true, accessCode: updated.accessCode });
  } catch (error) {
    console.error('PORTAL_ACCESS_GEN_ERROR:', error);
    return NextResponse.json({ error: 'Erro ao gerar código de acesso' }, { status: 500 });
  }
}
