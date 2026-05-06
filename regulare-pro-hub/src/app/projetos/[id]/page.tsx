'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Plus,
  Download,
  Eye,
  Trash2,
  PieChart,
  DollarSign,
  Printer,
  ChevronRight,
  ShieldCheck,
  Calculator
} from 'lucide-react'
import Link from 'next/link'

// --- CATEGORIAS DO VAULT ---
const VAULT_CATEGORIES = [
  { id: 'certidoes', label: 'Certidões', icon: FileText },
  { id: 'art', label: 'ART / RRT', icon: ShieldCheck },
  { id: 'projetos', label: 'Projetos Arquitetônicos', icon: FileText },
  { id: 'alvaras', label: 'Alvarás', icon: FileText },
  { id: 'habite_se', label: 'Habite-se', icon: CheckCircle2 },
]

export default function ProjectVaultDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('vault')

  // MOCK DE ORÇAMENTO
  const [budget, setBudget] = useState({
    honorarios: 5000,
    taxasMunicipais: 850,
    custosCartorio: 1200,
    outrosCustos: 300
  })

  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DO PROJETO */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
           <Link href="/dashboard" className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">REG_SILVA_001</span>
                 <span className="text-slate-500 text-xs">• Criado em 05 Mai, 2026</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Residência <span className="neon-text">João da Silva</span></h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                 Rua das Flores, 123 - Centro, Salvador/BA
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progresso</span>
              <span className="text-xl font-black text-primary">65%</span>
           </div>
           <button className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg shadow-primary/20">
              <Upload className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* TABS DE NAVEGAÇÃO INTERNA */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
         <button 
           onClick={() => setActiveTab('vault')}
           className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'vault' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-400 hover:text-white'}`}
         >
           Vault de Documentos
         </button>
         <button 
           onClick={() => setActiveTab('budget')}
           className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'budget' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-400 hover:text-white'}`}
         >
           Calculadora de Orçamento
         </button>
         <button 
           onClick={() => setActiveTab('details')}
           className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'details' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-400 hover:text-white'}`}
         >
           Dados do Imóvel
         </button>
      </div>

      {/* CONTEÚDO: VAULT */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           {/* CATEGORIAS */}
           <div className="lg:col-span-2 space-y-6">
              {VAULT_CATEGORIES.map(cat => (
                <div key={cat.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                            <cat.icon className="w-5 h-5 text-primary" />
                         </div>
                         <h3 className="font-bold text-slate-200">{cat.label}</h3>
                      </div>
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                         <Plus className="w-4 h-4 text-slate-500" />
                      </button>
                   </div>

                   <div className="space-y-3">
                      {/* FILE ITEM */}
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:neon-border transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-300">Certidão Negativa_Final.pdf</p>
                               <p className="text-[10px] text-slate-500">2.4 MB • Verificado em 04 Mai</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Download className="w-4 h-4" /></button>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group border-dashed opacity-60">
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                               <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-400">Pendente de Upload</p>
                               <p className="text-[10px] text-slate-500 tracking-wider">AGUARDANDO ARQUIVO</p>
                            </div>
                         </div>
                         <button className="text-[10px] font-bold text-primary uppercase px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">Enviar</button>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* LATERAL: DEADLINE & CLIENT INFO */}
           <div className="space-y-6">
              <div className="bg-slate-900 border border-primary/20 rounded-3xl p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                 <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Deadline Intelligence</h3>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="text-4xl font-black text-warning">03</div>
                    <div>
                       <p className="text-xs font-bold text-slate-300">Dias Restantes</p>
                       <p className="text-[10px] text-slate-500 uppercase">META: 08 MAIO, 2026</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-warning w-[85%] shadow-[0_0_10px_rgba(255,165,0,0.5)]" />
                    </div>
                    <p className="text-[10px] text-warning font-bold flex items-center gap-2">
                       <AlertCircle className="w-3 h-3" /> FASE DE PROTOCOLO CRÍTICA
                    </p>
                 </div>
              </div>

              <div className="glass p-8 rounded-3xl space-y-6">
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal do Cliente</h3>
                 <p className="text-xs text-slate-400">O cliente pode acompanhar o progresso através de um link seguro.</p>
                 <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    Visualizar Link Público <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* CONTEÚDO: CALCULADORA FINANCEIRA */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="glass p-10 rounded-[40px] space-y-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                 <Calculator className="w-5 h-5 text-primary" /> Módulos de Custo
              </h3>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Honorários Técnicos</label>
                    <input type="number" value={budget.honorarios} onChange={e => setBudget({...budget, honorarios: Number(e.target.value)})} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-primary transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Taxas Municipais (Prefeitura)</label>
                    <input type="number" value={budget.taxasMunicipais} onChange={e => setBudget({...budget, taxasMunicipais: Number(e.target.value)})} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-primary transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Custos de Cartório</label>
                    <input type="number" value={budget.custosCartorio} onChange={e => setBudget({...budget, custosCartorio: Number(e.target.value)})} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-primary transition-all" />
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-12 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_rgba(0,255,255,0.8)]" />
              <div>
                 <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-12">Totalizador em Tempo Real</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400">Total Serviços</span>
                       <span className="font-mono text-xl">R$ {budget.honorarios.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400">Total Taxas/Custos</span>
                       <span className="font-mono text-xl">R$ {(budget.taxasMunicipais + budget.custosCartorio).toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10">
                 <p className="text-xs text-slate-500 uppercase mb-2">Valor Geral da Proposta</p>
                 <p className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                    R$ {totalBudget.toLocaleString()}
                 </p>
                 <button className="w-full mt-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <Printer className="w-5 h-5" /> Gerar Proposta Comercial
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
