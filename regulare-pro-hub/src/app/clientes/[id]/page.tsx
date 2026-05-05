import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CreditCard, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  DollarSign,
  Briefcase
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      processos: {
        include: {
          financeiro: true,
          documentos: true,
          imovel: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!cliente) {
    notFound()
  }

  // Cálculos financeiros
  let totalFaturado = 0
  let totalRecebido = 0
  let totalDespesas = 0
  let totalDespesasPagas = 0
  
  cliente.processos.forEach(p => {
    p.financeiro.forEach(f => {
      // Nota: No modelo atual, o financeiro pode ter tipo 'receita' ou 'despesa'
      // Se não houver campo 'tipo', assumimos que 'valor' é o bruto e 'valor_pago' é o recebido
      totalFaturado += f.valor
      totalRecebido += f.valor_pago
    })
  })

  const receitaPendente = totalFaturado - totalRecebido

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/clientes" 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/clientes" className="hover:text-blue-600">Clientes</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600">{cliente.nome}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
              {cliente.nome.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{cliente.nome}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`badge ${cliente.cpf_cnpj.length > 14 ? 'badge-blue' : 'badge-gray'} capitalize`}>
                  {cliente.cpf_cnpj.length > 14 ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
                <span className="text-xs text-slate-400 font-mono">Doc: {cliente.cpf_cnpj}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/processos/novo?clienteId=${cliente.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Novo Processo
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: INFO & FINANCE */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* INFORMAÇÕES DE CONTATO */}
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Informações de Contato</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone</p>
                    <p className="text-sm font-medium text-slate-800">{cliente.telefone || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{cliente.email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço Residencial</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{cliente.endereco || 'Não informado'}</p>
                    <p className="text-xs text-slate-400 mt-1">{cliente.bairro} {cliente.cidade ? `• ${cliente.cidade}/${cliente.estado}` : ''}</p>
                  </div>
                </div>
                {cliente.observacoes && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações Internas</p>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{cliente.observacoes}"
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* RESUMO FINANCEIRO */}
            <section className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -translate-y-16 translate-x-16"></div>
              
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Visão Financeira</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Total em Contratos</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalFaturado)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Recebido</p>
                    <p className="text-base font-bold text-emerald-400">{formatCurrency(totalRecebido)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Pendente</p>
                    <p className="text-base font-bold text-amber-400">{formatCurrency(receitaPendente)}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${totalFaturado > 0 ? (totalRecebido / totalFaturado) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-right font-medium">
                    {totalFaturado > 0 ? ((totalRecebido / totalFaturado) * 100).toFixed(1) : 0}% Liquidados
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: PROCESSES */}
          <div className="lg:col-span-2 space-y-8">
            
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Processos Vinculados</h2>
                    <p className="text-xs text-slate-500">Acompanhamento dos projetos ativos e finalizados</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                  {cliente.processos.length.toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {cliente.processos.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">Nenhum processo registrado para este cliente.</p>
                  </div>
                ) : (
                  cliente.processos.map((p) => (
                    <div key={p.id} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Link href={`/processos/${p.id}`} className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {p.tipo_regularizacao}
                            </Link>
                            <span className={`badge ${p.status === 'concluído' ? 'badge-green' : 'badge-blue'} capitalize text-[10px]`}>
                              {p.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" /> 
                              Início: {new Date(p.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium truncate max-w-[300px]">
                              <MapPin className="w-3.5 h-3.5" /> 
                              {p.imovel?.endereco || 'Imóvel não vinculado'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contrato</p>
                            <p className="text-sm font-semibold text-slate-800">{formatCurrency(p.financeiro.reduce((acc, f) => acc + f.valor, 0))}</p>
                          </div>
                          <Link 
                            href={`/processos/${p.id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>

                      {/* MINI DOCS VIEW */}
                      {p.documentos.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.documentos.slice(0, 3).map(doc => (
                            <div key={doc.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 font-medium">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[80px]">{doc.nome}</span>
                            </div>
                          ))}
                          {p.documentos.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">+{p.documentos.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
