import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NovoProcessoPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })
  const imoveis = await prisma.imovel.findMany({ orderBy: { endereco: 'asc' } })

  async function createProcesso(formData: FormData) {
    'use server'
    
    const clienteId = formData.get('clienteId') as string
    const imovelId = formData.get('imovelId') as string
    
    const novoProcesso = await prisma.processo.create({
      data: {
        clienteId,
        imovelId: imovelId || null,
        tipo_regularizacao: formData.get('tipo_regularizacao') as string,
        status: formData.get('status') as string,
        etapa_atual: formData.get('etapa_atual') as string || null,
        responsavel: formData.get('responsavel') as string || null,
        observacoes: formData.get('observacoes') as string || null,
        data_previsao: formData.get('data_previsao') ? new Date(formData.get('data_previsao') as string) : null,
      }
    })

    redirect(`/processos/${novoProcesso.id}`)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full mb-16 font-mono">
      <div className="mb-8 flex items-center gap-4 border-b border-border pb-4">
        <Link href="/processos" className="p-2 border border-border hover:bg-muted rounded-sm smooth-transition">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
            Novo Processo
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Abertura de nova tramitação</p>
        </div>
      </div>

      <form action={createProcesso} className="bg-card border border-border rounded-sm shadow-sm p-8 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente Titular *</label>
            <select required name="clienteId" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.cpf_cnpj})</option>
              ))}
            </select>
            {clientes.length === 0 && (
              <p className="text-[9px] text-amber-500 mt-1">Cadastre um cliente primeiro.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Imóvel Vinculado</label>
            <select name="imovelId" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
              <option value="">Sem imóvel vinculado (avulso)</option>
              {imoveis.map(i => (
                <option key={i.id} value={i.id}>{i.endereco}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Regularização *</label>
            <select required name="tipo_regularizacao" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase">
              <option value="Regularização de Obra">Regularização de Obra</option>
              <option value="Averbação">Averbação</option>
              <option value="Habite-se">Habite-se</option>
              <option value="Desmembramento">Desmembramento</option>
              <option value="Unificação">Unificação</option>
              <option value="Retificação de Área">Retificação de Área</option>
              <option value="Usucapião">Usucapião</option>
              <option value="Alvará de Construção">Alvará de Construção</option>
              <option value="Licenciamento">Licenciamento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status Inicial *</label>
            <select required name="status" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase">
              <option value="em_analise">Em Análise Inicial</option>
              <option value="documentacao_pendente">Documentação Pendente</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Técnico / Responsável</label>
            <input type="text" name="responsavel" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" placeholder="Nome do Eng./Arq." />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Previsão (Fim)</label>
            <input type="date" name="data_previsao" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações Iniciais</label>
            <textarea name="observacoes" rows={4} className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 resize-none" placeholder="Detalhes do contrato, pendências iniciais, etc..."></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border mt-4">
          <button type="submit" className="flex items-center gap-2 bg-foreground text-background px-8 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
            <Save className="w-4 h-4" />
            Criar Processo
          </button>
        </div>
      </form>
    </div>
  )
}
