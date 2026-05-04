import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const usersMock = [
    { in: 'HT', name: 'Helena Torres', role: 'Engenheira Resp.', email: 'helena@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'MB', name: 'Marcos Barros', role: 'Engenheiro', email: 'marcos@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'JT', name: 'Júlia Tavares', role: 'Analista', email: 'julia@engarq.gestao', status: 'ATIVO', color: 'bg-muted' },
    { in: 'RL', name: 'Rogério Lima', role: 'Administrativo', email: 'rogerio@engarq.gestao', status: 'INATIVO', color: 'bg-muted' },
  ]

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Configurações <span className="text-muted-foreground font-normal ml-2">// MOD.CFG / 10</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-sm text-xs w-64 shadow-sm">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input 
              placeholder="Buscar processo, cliente, matrícula..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
          <button className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
            + Assistente IA
          </button>
          <Link href="/processos/novo" className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
            + Novo Processo
          </Link>
        </div>
      </div>

      <div className="space-y-12 pb-16">
        
        {/* EMPRESA */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Empresa <span className="opacity-50">CFG.001</span>
          </h2>
          <div className="border border-border bg-card shadow-sm rounded-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">RAZÃO SOCIAL</div>
                <div className="text-sm font-medium text-foreground">Regulariza Pro Soluções LTDA</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">CNPJ</div>
                <div className="text-sm font-medium text-foreground">44.118.882/0001-77</div>
              </div>
              
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">RESPONSÁVEL TÉCNICO</div>
                <div className="text-sm font-medium text-foreground">Helena Torres · CREA 5069212-D</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">ENDEREÇO</div>
                <div className="text-sm font-medium text-foreground">Av. Paulista, 1842 — sala 1102, São Paulo / SP</div>
              </div>

              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">TELEFONE</div>
                <div className="text-sm font-medium text-foreground">(11) 4002-8821</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">E-MAIL COMERCIAL</div>
                <div className="text-sm font-medium text-foreground">contato@engarq.gestao</div>
              </div>
            </div>
          </div>
        </section>

        {/* USUÁRIOS & PERMISSÕES */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Usuários & Permissões <span className="opacity-50">CFG.002</span>
          </h2>
          <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4">USUÁRIO</th>
                  <th className="px-6 py-4">PAPEL</th>
                  <th className="px-6 py-4">E-MAIL</th>
                  <th className="px-6 py-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersMock.map((u, i) => (
                  <tr key={i} className="hover:bg-muted/20 smooth-transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${u.color} flex items-center justify-center text-[9px] font-bold rounded-sm border border-border text-muted-foreground`}>
                          {u.in}
                        </div>
                        <span className="font-bold text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.role}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 text-right">
                      {u.status === 'ATIVO' ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ATIVO
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full border border-border"></span> INATIVO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PLANO & ASSINATURA */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Plano & Assinatura <span className="opacity-50">CFG.003</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border bg-card shadow-sm rounded-sm p-6 flex flex-col hover:border-foreground smooth-transition cursor-pointer group">
              <div className="text-lg font-bold text-foreground mb-4 group-hover:text-blue-600 smooth-transition">Starter</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">R$ 149</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/mês</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Até 3 usuários</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 30 processos ativos</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Documentos ilimitados</li>
              </ul>
            </div>

            <div className="border-2 border-foreground bg-card shadow-md rounded-sm p-6 flex flex-col relative">
              <div className="absolute top-4 right-4 bg-foreground text-background text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                PLANO ATUAL
              </div>
              <div className="text-lg font-bold text-foreground mb-4">Profissional</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">R$ 349</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/mês</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Até 10 usuários</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> 150 processos ativos</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Documentos ilimitados</li>
              </ul>
            </div>

            <div className="border border-border bg-card shadow-sm rounded-sm p-6 flex flex-col hover:border-foreground smooth-transition cursor-pointer group">
              <div className="text-lg font-bold text-foreground mb-4 group-hover:text-blue-600 smooth-transition">Escritório</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">R$ 749</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/mês</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Usuários ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Processos ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span> Documentos ilimitados</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
