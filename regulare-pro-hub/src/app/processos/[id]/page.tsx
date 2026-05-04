import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  CheckSquare, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  Home,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DetalhesProcessoPage({ params }: { params: Promise<{ id: string }> }) {
  const processo = await prisma.processo.findUnique({
    where: { id: (await params).id },
    include: { 
      cliente: true, 
      imovel: true,
      financeiro: true, 
      tarefas: true, 
      documentos: true, 
      checklists: true,
      eventos: true
    }
  })
  
  if (!processo) return notFound()

  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })
  const imoveis = await prisma.imovel.findMany({ 
    where: { clienteId: processo.clienteId }, // Show only properties of this client
    orderBy: { endereco: 'asc' } 
  })

  async function updateProcesso(formData: FormData) {
    'use server'
    await prisma.processo.update({
      where: { id: (await params).id },
      data: {
        clienteId: formData.get('clienteId') as string,
        imovelId: (formData.get('imovelId') as string) || null,
        tipo_regularizacao: formData.get('tipo_regularizacao') as string,
        etapa_atual: formData.get('etapa_atual') as string,
        status: formData.get('status') as string,
        responsavel: formData.get('responsavel') as string,
        observacoes: formData.get('observacoes') as string,
        data_previsao: formData.get('data_previsao') ? new Date(formData.get('data_previsao') as string) : null,
      }
    })
    redirect(`/processos/${(await params).id}`)
  }

  async function deleteProcesso() {
    'use server'
    await prisma.processo.delete({ where: { id: (await params).id } })
    redirect('/processos')
  }

  const financeiroPendente = processo.financeiro.reduce((acc, f) => acc + (f.valor - f.valor_pago), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto w-full mb-16 font-mono">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2 border border-border hover:bg-muted rounded-sm smooth-transition">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
                Processo <span className="text-primary">PRC-{processo.id.substring(0,8)}</span>
              </h1>
              <span className="px-2 py-0.5 bg-muted/50 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest">
                {processo.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              INICIADO EM {new Date(processo.data_inicio).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <form action={deleteProcesso}>
          <button type="submit" className="flex items-center gap-2 border border-rose-500/30 bg-rose-500/5 text-rose-500 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white smooth-transition shadow-sm">
            <Trash2 className="w-3.5 h-3.5" />
            Excluir Processo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Formulário Principal */}
        <form action={updateProcesso} className="xl:col-span-2 bg-card border border-border rounded-sm shadow-sm p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Configurações do Processo</h2>
            <button type="submit" className="flex items-center gap-2 bg-foreground text-background px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              <Save className="w-3.5 h-3.5" />
              Salvar Alterações
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente *</label>
              <select required defaultValue={processo.clienteId} name="clienteId" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.cpf_cnpj})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Imóvel Vinculado</label>
              <select defaultValue={processo.imovelId || ''} name="imovelId" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
                <option value="">Selecione um imóvel...</option>
                {imoveis.map(i => (
                  <option key={i.id} value={i.id}>{i.endereco}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Regularização *</label>
              <select required defaultValue={processo.tipo_regularizacao} name="tipo_regularizacao" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase">
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status do Processo *</label>
              <select required defaultValue={processo.status} name="status" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase">
                <option value="em_analise">Em Análise</option>
                <option value="documentacao_pendente">Documentação Pendente</option>
                <option value="protocolo_prefeitura">Protocolado na Prefeitura</option>
                <option value="em_aprovacao">Em Aprovação</option>
                <option value="exigencia_tecnica">Exigência Técnica</option>
                <option value="aprovado">Aprovado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Etapa Atual</label>
              <input defaultValue={processo.etapa_atual || ''} type="text" name="etapa_atual" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" placeholder="Ex: Análise da Planta Baixa" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Previsão (Fim)</label>
              <input 
                defaultValue={processo.data_previsao ? processo.data_previsao.toISOString().split('T')[0] : ''} 
                type="date" 
                name="data_previsao" 
                className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" 
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Técnico / Eng. Responsável</label>
              <input defaultValue={processo.responsavel || ''} type="text" name="responsavel" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações / Andamento</label>
              <textarea defaultValue={processo.observacoes || ''} name="observacoes" rows={4} className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 resize-none"></textarea>
            </div>
          </div>
        </form>

        {/* Módulos Relacionados */}
        <div className="flex flex-col gap-6">
          
          {/* FINANCEIRO */}
          <div className="bg-card border border-border rounded-sm shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Financeiro
              </h3>
              <Link href="/financeiro" className="text-[9px] font-bold text-primary hover:underline uppercase">Gerenciar</Link>
            </div>
            
            {processo.financeiro.length > 0 ? (
              <div className="space-y-3">
                {processo.financeiro.map(f => (
                  <div key={f.id} className="text-xs bg-muted/20 p-3 rounded-sm border border-border">
                    <div className="font-bold mb-2 line-clamp-1">{f.descricao}</div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Valor:</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pago:</span>
                      <span className="text-emerald-500 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.valor_pago)}</span>
                    </div>
                  </div>
                ))}
                {financeiroPendente > 0 && (
                  <div className="pt-2 mt-2 border-t border-border flex justify-between items-center text-rose-500 font-bold text-xs">
                    <span>Pendente Total:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiroPendente)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center py-4">Nenhuma cobrança registrada.</p>
            )}
          </div>

          {/* DOCUMENTOS */}
          <div className="bg-card border border-border rounded-sm shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Documentos
              </h3>
              <Link href="/documentos" className="text-[9px] font-bold text-primary hover:underline uppercase">Central</Link>
            </div>
            
            {processo.documentos.length > 0 ? (
              <div className="space-y-2">
                {processo.documentos.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-sm border border-border">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-bold truncate">{doc.nome}</span>
                    </div>
                    <button className="p-1 hover:bg-muted rounded-sm text-primary"><Download className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center py-4">Nenhum documento.</p>
            )}
          </div>

          {/* TAREFAS / EVENTOS */}
          <div className="bg-card border border-border rounded-sm shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Agenda & Tarefas
              </h3>
              <Link href="/agenda" className="text-[9px] font-bold text-primary hover:underline uppercase">Agenda</Link>
            </div>
            
            <div className="space-y-4">
              {processo.eventos.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Próximos Eventos</div>
                  {processo.eventos.map(ev => (
                    <div key={ev.id} className="flex items-start gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
                      <div>
                        <div className="text-[10px] font-bold">{ev.titulo}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{new Date(ev.data_inicio).toLocaleDateString('pt-BR')} • {ev.tipo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {processo.tarefas.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-2 mt-4">Tarefas Pendentes</div>
                  {processo.tarefas.map(t => (
                    <div key={t.id} className="flex items-start gap-2 mb-2">
                      <CheckSquare className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold">{t.titulo}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{t.responsavel || 'Sem responsável'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {processo.eventos.length === 0 && processo.tarefas.length === 0 && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center py-4">Agenda limpa.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
