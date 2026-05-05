'use client'

import { Search, Database, RefreshCw, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ConfiguracoesPage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<null | { total: number }>(null)

  const usersMock = [
    { in: 'HT', name: 'Helena Torres', role: 'Engenheira Resp.', email: 'helena@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'MB', name: 'Marcos Barros', role: 'Engenheiro', email: 'marcos@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'JT', name: 'Júlia Tavares', role: 'Analista', email: 'julia@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'RL', name: 'Rogério Lima', role: 'Administrativo', email: 'rogerio@engarq.gestao', status: 'INATIVO', color: 'bg-muted' },
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
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden mb-20">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Configurações <span className="text-muted-foreground font-normal ml-2">// MOD.CFG / 10</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-sm text-xs w-64 shadow-sm">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input 
              placeholder="Buscar processo, cliente..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Link href="/processos/novo" className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
            + Novo Projeto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - EMPRESA E USUÁRIOS */}
        <div className="xl:col-span-2 space-y-12">
          {/* EMPRESA */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Empresa / Matriz
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">RAZÃO SOCIAL</div>
                  <div className="text-sm font-black text-foreground">REGULARIZA PRO SOLUÇÕES EM ENGENHARIA LTDA</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">CNPJ</div>
                  <div className="text-sm font-black text-foreground">44.118.882/0001-77</div>
                </div>
              </div>
            </div>
          </section>

          {/* USUÁRIOS */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Equipe & Permissões
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">USUÁRIO</th>
                    <th className="px-6 py-4">PAPEL</th>
                    <th className="px-6 py-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersMock.map((u, i) => (
                    <tr key={i} className="hover:bg-muted/20 smooth-transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 ${u.color} flex items-center justify-center text-[9px] font-bold rounded-sm border border-border text-muted-foreground uppercase`}>
                            {u.in}
                          </div>
                          <span className="font-bold text-foreground uppercase">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground uppercase">{u.role}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">{u.status}</span>
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
          
          {/* FERRAMENTAS DE ADMINISTRAÇÃO */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Ferramentas de Administrador
            </h2>
            <div className="border border-rose-500/20 bg-rose-500/5 shadow-sm rounded-sm p-6 space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase text-rose-500 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" /> Migração Inteligente de Base
                </h3>
                <p className="text-[9px] text-muted-foreground uppercase leading-relaxed font-bold">
                  TRANSFORME TODOS OS SEUS CLIENTES E IMÓVEIS ANTIGOS EM PROCESSOS ATIVOS NO KANBAN COM UM CLIQUE.
                </p>
              </div>

              {migrationResult ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-[10px] font-black text-emerald-600 uppercase">SUCESSO TOTAL!</div>
                    <div className="text-[9px] text-emerald-600 font-bold uppercase">
                      {migrationResult.total} NOVOS PROJETOS FORAM CRIADOS E ADICIONADOS AO KANBAN.
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleMigration}
                  disabled={isMigrating}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 smooth-transition shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? 'MIGRANDO DADOS...' : 'Gerar Processos Automaticamente'}
                </button>
              )}
              
              <p className="text-[8px] text-rose-500/70 italic uppercase font-bold text-center">
                * ESTA AÇÃO NÃO PODE SER DESFEITA. USE COM CAUTELA.
              </p>
            </div>
          </section>

          {/* PLANO ATUAL */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Plano & Assinatura
            </h2>
            <div className="border-2 border-foreground bg-card shadow-md rounded-sm p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-foreground translate-x-8 -translate-y-8 rotate-45"></div>
              <div className="text-lg font-black text-foreground mb-4 uppercase tracking-tighter">Plano Profissional</div>
              <div className="flex items-baseline gap-1 mb-6 border-b border-border pb-4">
                <span className="text-3xl font-black text-foreground">R$ 349</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/mês</span>
              </div>
              <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Usuários Ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Processos Ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Relatórios Avançados</li>
              </ul>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
