'use client'

import { 
  Search, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Building2, 
  Users, 
  CreditCard, 
  ShieldCheck,
  ChevronRight,
  Settings,
  Mail,
  MoreVertical,
  Check,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ConfiguracoesPage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<null | { total: number }>(null)

  const usersMock = [
    { in: 'HT', name: 'Helena Torres', role: 'Engenheira Resp.', email: 'helena@engarq.gestao', status: 'ativo', color: 'bg-blue-100 text-blue-600' },
    { in: 'MB', name: 'Marcos Barros', role: 'Engenheiro', email: 'marcos@engarq.gestao', status: 'ativo', color: 'bg-indigo-100 text-indigo-600' },
    { in: 'JT', name: 'Júlia Tavares', role: 'Analista', email: 'julia@engarq.gestao', status: 'ativo', color: 'bg-purple-100 text-purple-600' },
    { in: 'RL', name: 'Rogério Lima', role: 'Administrativo', email: 'rogerio@engarq.gestao', status: 'inativo', color: 'bg-slate-100 text-slate-400' },
  ]

  const handleMigration = async () => {
    setIsMigrating(true)
    try {
      const response = await fetch('/api/admin/migrar-tudo', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setMigrationResult({ total: data.total })
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao processar migração.')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Configurações</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gerenciamento da conta, equipe e ferramentas do sistema</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA - EMPRESA E USUÁRIOS */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* EMPRESA */}
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Dados da Empresa</h2>
                    <p className="text-xs text-slate-500">Informações institucionais da matriz</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-100">
                  Editar Dados
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Razão Social</p>
                  <p className="text-sm font-medium text-slate-800">REGULARIZA PRO SOLUÇÕES EM ENGENHARIA LTDA</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CNPJ / Identificação</p>
                  <p className="text-sm font-medium text-slate-800">44.118.882/0001-77</p>
                </div>
              </div>
            </section>

            {/* USUÁRIOS */}
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Equipe & Permissões</h2>
                    <p className="text-xs text-slate-500">Gerencie quem tem acesso ao sistema</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors">
                  Convidar Membro
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500">Membro</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500">Papel / Função</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 text-center">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersMock.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${u.color} flex items-center justify-center text-[11px] font-bold rounded-lg shadow-sm`}>
                              {u.in}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{u.name}</span>
                              <span className="text-[11px] text-slate-400">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-600">{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${u.status === 'ativo' ? 'badge-green' : 'badge-gray'} capitalize`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - FERRAMENTAS E PLANO */}
          <div className="space-y-8">
            
            {/* PLANO ATUAL */}
            <section className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -translate-y-16 translate-x-16"></div>
              
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Plano Atual</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">Professional SaaS</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold tracking-tight">R$ 349</span>
                <span className="text-xs text-slate-400 font-medium">/mês</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Processos Ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Usuários da Equipe Ilimitados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Dashboard Customizado</span>
                </div>
              </div>
              
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20">
                Gerenciar Assinatura
              </button>
            </section>

            {/* FERRAMENTAS DE ADMINISTRAÇÃO */}
            <section className="bg-white border border-rose-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-rose-50 flex items-center gap-3 bg-rose-50/30">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-semibold text-rose-900">Painel do Administrador</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" /> Migração Automática
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Converta clientes e imóveis legados em processos ativos no quadro Kanban instantaneamente.
                  </p>
                </div>

                {migrationResult ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700">Migração Concluída!</p>
                      <p className="text-[10px] text-emerald-600">
                        {migrationResult.total} novos processos gerados.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 py-3 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                    {isMigrating ? 'Processando...' : 'Migrar Base de Dados'}
                  </button>
                )}
                
                <p className="text-[10px] text-rose-400 italic text-center font-medium">
                  Atenção: Esta ação é irreversível.
                </p>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
