'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { 
  MapPin, Filter, Search, RefreshCw, Layers, 
  AlertCircle, CheckCircle2, Clock, Circle, X,
  ChevronRight, ArrowUpRight, Building2, User,
  Globe, Zap, Maximize2, Map as MapIcon
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Import do mapa SEM SSR
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-[32px]">
      <div className="text-center animate-pulse">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
           <MapIcon className="text-primary animate-bounce" size={24} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando Cartografia...</p>
      </div>
    </div>
  ),
})

const STATUS_CONFIG = [
  { value: '',           label: 'Todos Projetos',  color: '#2D5BFF', icon: Layers },
  { value: 'finalizado', label: 'Finalizado',     color: '#10b981', icon: CheckCircle2 },
  { value: 'em_analise', label: 'Em Análise',     color: '#f59e0b', icon: Clock },
  { value: 'protocolo',  label: 'Protocolado',    color: '#6366f1', icon: Zap },
  { value: 'pendente',   label: 'Pendente',       color: '#ef4444', icon: AlertCircle },
]

export default function MapaPage() {
  const [projetos, setProjetos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [withoutCoords, setWithoutCoords] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mapa').then(r => r.json())
      const list = Array.isArray(res) ? res : []
      setProjetos(list)
      setWithoutCoords(list.filter((p: any) => p.imovel && !p.imovel.latitude).length)
    } catch { /* ... */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const projetosFiltrados = useMemo(() => projetos.filter(p => {
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchSearch = !search ||
      p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.imovel?.cidade?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  }), [projetos, statusFilter, search])

  const comCoordenadas = useMemo(() => projetosFiltrados.filter(p => p.imovel?.latitude && p.imovel?.longitude), [projetosFiltrados])

  const center = useMemo((): [number, number] => {
    if (comCoordenadas.length === 0) return [-12.9718, -38.5011]
    const lats = comCoordenadas.map(p => p.imovel.latitude!)
    const lngs = comCoordenadas.map(p => p.imovel.longitude!)
    return [
      lats.reduce((a, b) => a + b, 0) / lats.length,
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
    ]
  }, [comCoordenadas])

  const selectedProj = useMemo(() => projetos.find(p => p.id === selectedId) || null, [projetos, selectedId])

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      
      {/* ── SIDEBAR FILTERS ── */}
      <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 space-y-4">
           <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Mapa Zonal</h2>
           <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                placeholder="Buscar por cliente ou cidade..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                value={search} onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
           <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Filtrar por Status</p>
              {STATUS_CONFIG.map(s => (
                <button 
                  key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight transition-all ${
                    statusFilter === s.value ? 'bg-primary/5 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                  <span className="ml-auto text-[9px] font-bold opacity-60">
                     {projetos.filter(p => (!s.value || p.status === s.value) && p.imovel?.latitude).length}
                  </span>
                </button>
              ))}
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Lista de Projetos</p>
              <div className="space-y-2">
                 {projetosFiltrados.slice(0, 10).map(p => (
                   <button 
                     key={p.id} onClick={() => setSelectedId(p.id)}
                     className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                       selectedId === p.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                     }`}
                   >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">{p.codigo || '—'}</p>
                      <p className={`text-xs font-bold truncate ${selectedId === p.id ? 'text-primary' : 'text-slate-800'}`}>{p.cliente?.nome}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_CONFIG.find(s => s.value === p.status)?.color || '#ccc' }} />
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{p.imovel?.cidade} / {p.imovel?.estado}</span>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {withoutCoords > 0 && (
           <div className="p-6 bg-amber-50 border-t border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                 <AlertCircle size={14} className="text-amber-600" />
                 <span className="text-[10px] font-bold text-amber-700 uppercase">{withoutCoords} Imóveis s/ Coordenadas</span>
              </div>
              <button className="w-full py-2 bg-amber-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/10">
                 <RefreshCw size={12} /> Geocodificar Agora
              </button>
           </div>
        )}
      </div>

      {/* ── CENTRAL MAP ── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
        <MapView 
          key={`${statusFilter}-${search}`}
          projetos={comCoordenadas}
          center={center}
        />
        
        {/* Floating Tool */}
        <div className="absolute bottom-6 left-6 z-[1000] flex gap-3">
           <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{comCoordenadas.length} Online</span>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">Exportar GeoJSON</button>
           </div>
        </div>
      </div>

      {/* ── RIGHT DRAWER ── */}
      <AnimatePresence>
         {selectedProj && (
           <motion.div 
             initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
             transition={{ type: 'spring', damping: 30, stiffness: 300 }}
             className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0"
           >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Ficha Geoespacial</h2>
                 <button onClick={() => setSelectedId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-all"><X size={16}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                         selectedProj.status === 'finalizado' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
                       }`}>
                          {selectedProj.status}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{selectedProj.imovel?.endereco}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 font-mono">
                       <Globe size={12} /> {selectedProj.imovel?.latitude}, {selectedProj.imovel?.longitude}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CLIENTE PROPRIETÁRIO</p>
                       <p className="text-xs font-bold text-slate-800">{selectedProj.cliente?.nome}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TIPO DE REGULARIZAÇÃO</p>
                       <p className="text-xs font-bold text-slate-800">{selectedProj.tipo_regularizacao || '—'}</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DADOS DO IMÓVEL</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Terreno</p>
                          <p className="text-xs font-bold text-slate-800">{selectedProj.imovel?.area_terreno || 0}m²</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Construído</p>
                          <p className="text-xs font-bold text-slate-800">{selectedProj.imovel?.area_construida || 0}m²</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                 <Link 
                   href={`/processos/${selectedProj.id}`}
                   className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                 >
                    ABRIR PROCESSO <ArrowUpRight size={14} />
                 </Link>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      <style>{`
        .leaflet-popup-content-wrapper { border-radius: 24px !important; overflow: hidden; border: none !important; box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important; }
        .leaflet-popup-content { margin: 0 !important; width: 280px !important; }
        .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  )
}
