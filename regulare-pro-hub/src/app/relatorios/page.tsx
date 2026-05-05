'use client'

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react'

export default function RelatoriosPage() {
  
  const stats = [
    { label: 'Performance Mensal', value: '+12.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Conversão de Leads', value: '64%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Tempo Médio Processo', value: '42 dias', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Documentos Pendentes', value: '18', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  ]

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-20">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Relatórios & Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Visão estratégica de performance, prazos e faturamento</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        
        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-[hsl(var(--border))] p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3" /> 8%
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GRÁFICO DE FATURAMENTO (PLACEHOLDER VISUAL) */}
          <div className="lg:col-span-2 bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Projeção de Receita</h2>
                  <p className="text-xs text-slate-500">Fluxo financeiro dos últimos 6 meses</p>
                </div>
              </div>
            </div>
            <div className="p-10 flex items-end justify-between h-64 gap-2">
              {[40, 65, 45, 90, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mês {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DISTRIBUIÇÃO DE PROCESSOS */}
          <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Mix de Serviços</h2>
                <p className="text-xs text-slate-500">Distribuição por tipo de processo</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: 'Regularização Urb.', value: 45, color: 'bg-blue-500' },
                { label: 'Usucapião', value: 25, color: 'bg-purple-500' },
                { label: 'Desmembramento', value: 20, color: 'bg-amber-500' },
                { label: 'REURB', value: 10, color: 'bg-slate-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RECENT PERFORMANCE TABLE */}
        <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Rank de Eficiência por Responsável</h2>
            <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Membro da Equipe</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Processos Ativos</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Taxa de Conclusão</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Helena Torres', active: 12, rate: '92%', ticket: 'R$ 8.400' },
                { name: 'Marcos Barros', active: 8, rate: '85%', ticket: 'R$ 7.200' },
                { name: 'Júlia Tavares', active: 15, rate: '78%', ticket: 'R$ 5.100' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.active}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-bold">{row.rate}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{row.ticket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
