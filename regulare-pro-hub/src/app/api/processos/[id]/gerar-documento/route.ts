import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { mapDocumentData } from '@/lib/docMapper';
import { generateDOCXBuffer, generatePDFBuffer } from '@/lib/docGenerator';
import { logAction } from '@/lib/logger';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { templateId, format } = await req.json();

    const processo = await prisma.processo.findUnique({
      where: { id },
      include: {
        cliente: true,
        imovel: true
      }
    });

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 });
    }

    const empresa = await prisma.empresaConfig.findFirst();

    const mappedData = mapDocumentData(processo, empresa);
    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    const title = templateId.replace(/_/g, ' ').toUpperCase();

    if (format === 'docx') {
      buffer = await generateDOCXBuffer(title, mappedData);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `${templateId}_${processo.codigo_projeto}.docx`;
    } else {
      buffer = await generatePDFBuffer(title, mappedData);
      contentType = 'application/pdf';
      fileName = `${templateId}_${processo.codigo_projeto}.pdf`;
    }

    // Log the generation
    await logAction({
      processoId: id,
      acao: 'Documento Gerado Automático',
      modulo: 'DOCUMENTOS',
      detalhe: `Tipo: ${templateId} | Formato: ${format.toUpperCase()}`
    });

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('DOCGEN_ERROR:', error);
    return NextResponse.json({ error: 'Erro ao gerar documento' }, { status: 500 });
  }
}
