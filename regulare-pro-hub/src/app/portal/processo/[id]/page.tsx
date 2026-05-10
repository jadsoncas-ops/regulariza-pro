import { getPortalSession } from '@/lib/authPortal';
import { getClientProcessoDetail } from '@/lib/portalDetail';
import { redirect } from 'next/navigation';
import { 
  ArrowLeft, Building2, FileText, Download, 
  CheckCircle2, Clock, ShieldCheck, MapPin, 
  ChevronRight, Calendar, Wallet, Info, AlertCircle, Sparkles, Zap
} from 'lucide-react';
import Link from 'next/link';
import { generateAISummary } from '@/lib/aiSummary';

export default async function PortalProcessoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getPortalSession();
  if (!session) redirect('/portal/login');

  const { id } = await params;
  const p = await getClientProcessoDetail(session.id, id);
  if (!p) redirect('/portal');

  const aiSummary = generateAISummary({
    tipo: p.tipo,
    etapa: p.etapa,
    status: p.status,
    documentosPendentes: p.documentos.filter(d => d.isPending).length,
    codigo: p.codigo || 'S/N'
  });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* ── PORTAL HEADER ── */}
      <header className="bg-white border-b border-slate-100 px-8 py-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/portal" className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <ArrowLeft size={20} />
             </Link>
             <div>
                <h1 className="text-xl font-black tracking-tight">{p.tipo}</h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                   <MapPin size={12} className="text-blue-500" /> {p.imovel?.endereco}
                </div>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                ID: {p.codigo}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 grid grid-cols-12 gap-8">
        
        {/* ── LEFT: WORKFLOW & PROGRESS (Col 8) ── */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           
           {/* AI EXECUTIVE SUMMARY */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-blue-600">
                 <Sparkles size={100} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                       <Zap size={10} /> IA Resumo do Processo
                    </span>
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{aiSummary.title}</h2>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                    {aiSummary.content}
                 </p>
              </div>
           </div>

           {/* PROGRESS SUMMARY */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Progresso da Regularização</h2>
                 <span className="text-xl font-black text-blue-600">{p.percentual}%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${p.percentual}%` }} />
              </div>
           </div>

           {/* TIMELINE */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-10">Esteira Operacional</h2>
              
              <div className="space-y-0 relative">
                 <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-slate-100" />
                 
                 {p.etapas.map((etapa, idx) => (
                   <div key={etapa.id} className="relative pl-14 pb-12 last:pb-0 group">
                      <div className={`absolute left-2.5 top-0 w-7 h-7 rounded-full flex items-center justify-center z-10 border-4 border-white transition-all ${
                         etapa.status === 'concluido' ? 'bg-emerald-500 text-white' : 
                         etapa.status === 'em_andamento' ? 'bg-blue-600 text-white animate-pulse' : 
                         'bg-slate-200 text-slate-400'
                      }`}>
                         {etapa.status === 'concluido' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      
                      <div className={`p-6 rounded-[24px] border transition-all ${
                         etapa.status === 'em_andamento' ? 'bg-blue-50/50 border-blue-100 shadow-lg shadow-blue-500/5' : 
                         etapa.status === 'concluido' ? 'bg-slate-50/50 border-slate-100' : 
                         'bg-transparent border-transparent opacity-40'
                      }`}>
                         <h4 className={`text-sm font-black tracking-tight ${etapa.status === 'pendente' ? 'text-slate-400' : 'text-slate-900'}`}>
                            {etapa.nome}
                         </h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {etapa.status === 'concluido' ? 'Concluído' : etapa.status === 'em_andamento' ? 'Em Andamento' : 'Aguardando'}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ── RIGHT: DOCS & FINANCIAL (Col 4) ── */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           
           {/* DOCUMENTS */}
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                 <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                    <FileText size={20} />
                 </div>
                 <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Documentos Liberados</h2>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                 {p.documentos.map(d => (
                   <div key={d.id} className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                      d.isPending ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                   }`}>
                      <div className="min-w-0">
                         <p className={`text-[11px] font-black uppercase truncate ${d.isPending ? 'text-amber-700' : 'text-slate-900'}`}>{d.nome}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                            {d.isPending ? 'Aguardando seu envio' : 'Disponível para Download'}
                         </p>
                      </div>
                      {!d.isPending && d.url && (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:scale-110 transition-transform">
                           <Download size={16} />
                        </a>
                      )}
                      {d.isPending && (
                        <div className="text-amber-500"><Info size={16} /></div>
                      )}
                   </div>
                 ))}

                 {p.documentos.length === 0 && (
                   <div className="text-center py-10 opacity-30">
                      <FileText size={40} className="mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase">Nenhum documento</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-3 items-start border border-blue-100">
                 <ShieldCheck size={18} className="text-blue-600 mt-1 shrink-0" />
                 <p className="text-[10px] font-medium text-blue-900 leading-relaxed">
                    Seus dados estão protegidos por criptografia de ponta a ponta.
                 </p>
              </div>
           </div>

           {/* FINANCIAL SUMMARY */}
           <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-xl shadow-slate-900/20">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Wallet size={14} className="text-emerald-400" /> Resumo Financeiro
              </h2>
              
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Valor do Contrato</p>
                 <p className="text-3xl font-black tracking-tight mt-1">{fmt(p.financeiro.total)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                 <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pago</p>
                    <p className="text-sm font-black text-emerald-400">{fmt(p.financeiro.pago)}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">A Pagar</p>
                    <p className="text-sm font-black text-white">{fmt(p.financeiro.total - p.financeiro.pago)}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Últimos Pagamentos</p>
                 {p.financeiro.historico.map(f => (
                   <div key={f.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <div>
                         <p className="text-[10px] font-black uppercase">{f.descricao}</p>
                         <p className="text-[8px] text-slate-500 font-bold uppercase">{new Date(f.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">{fmt(f.valor)}</span>
                   </div>
                 ))}
              </div>
           </div>

        </div>

      </main>

    </div>
  )
}
