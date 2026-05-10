import { getPortalSession } from '@/lib/authPortal';
import { getClientPortalData } from '@/lib/portalData';
import { redirect } from 'next/navigation';
import { 
  Building2, Box, CheckCircle2, Clock, 
  ChevronRight, ArrowUpRight, Wallet, 
  FileText, Activity, MapPin 
} from 'lucide-react';
import Link from 'next/link';

export default async function PortalDashboardPage() {
  const session = await getPortalSession();
  if (!session) redirect('/portal/login');

  const data = await getClientPortalData(session.id);
  if (!data) redirect('/portal/login');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* ── PORTAL HEADER ── */}
      <header className="bg-white border-b border-slate-100 px-8 py-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Building2 size={24} />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight">Bem-vindo, {data.nome.split(' ')[0]}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sua Central de Regularização</p>
             </div>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Investido</p>
                <p className="text-sm font-black text-blue-600">{data.totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <Box size={24} />
              </div>
              <div>
                 <p className="text-2xl font-black leading-none">{data.activeProcessos}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Processos Ativos</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                 <p className="text-2xl font-black leading-none">{data.processos.filter(p => p.status === 'concluido').length}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Finalizados</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                 <Clock size={24} />
              </div>
              <div>
                 <p className="text-2xl font-black leading-none">{data.pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pendente</p>
              </div>
           </div>
        </div>

        {/* ── ACTIVE PROCESSES ── */}
        <div className="space-y-4">
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Acompanhamento de Processos</h2>
           
           <div className="grid grid-cols-1 gap-4">
              {data.processos.map(p => (
                <Link key={p.id} href={`/portal/processo/${p.id}`} className="group block">
                  <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Activity size={20} />
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">{p.tipo}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                   <MapPin size={12} className="text-blue-500" /> {p.imovel?.endereco}
                                </div>
                             </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             p.status === 'atrasado' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                             {p.status.replace('_', ' ')}
                          </span>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Etapa Atual: <span className="text-slate-900 ml-1">{p.etapa || 'Iniciando'}</span></p>
                             <p className="text-[11px] font-black text-blue-600">{p.percentual}%</p>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${p.percentual}%` }} />
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto md:border-l border-slate-100 md:pl-10">
                       <div className="flex-1 md:flex-none">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ações</p>
                          <p className="text-xs font-bold text-slate-800 mt-1">{p.documentosPendentes} Docs Pendentes</p>
                       </div>
                       <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-blue-600 group-hover:text-blue-600 transition-all">
                          <ChevronRight size={24} />
                       </div>
                    </div>

                  </div>
                </Link>
              ))}

              {data.processos.length === 0 && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-20 text-center">
                   <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Box size={40} />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight">Nenhum processo ativo</h3>
                   <p className="text-sm text-slate-400 font-medium mt-2">Assim que iniciarmos sua regularização, ela aparecerá aqui.</p>
                </div>
              )}
           </div>
        </div>

      </main>

    </div>
  )
}
