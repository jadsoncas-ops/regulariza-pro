'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Filter, Search, RefreshCw, Layers, AlertCircle, CheckCircle2, Clock, Circle, X } from 'lucide-react'
import Link from 'next/link'

// Import do mapa SEM SSR (Leaflet não funciona no servidor)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl" style={{ minHeight: '500px' }}>
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-500">Carregando mapa...</p>
      </div>
    </div>
  ),
})

const STATUS_CONFIG = [
  { value: '',           label: 'Todos',         color: '#6366f1', icon: Layers },
  { value: 'finalizado', label: 'Finalizado',    color: '#16a34a', icon: CheckCircle2 },
  { value: 'em_analise', label: 'Em Análise',    color: '#f59e0b', icon: Clock },
  { value: 'protocolo',  label: 'Protocolado',   color: '#2563eb', icon: Circle },
  { value: 'pendente',   label: 'Pendente',      color: '#ef4444', icon: AlertCircle },
]

// Geocode um projeto que não tem coordenadas
async function geocodeProject(imovel: any): Promise<{ lat: number; lng: number } | null> {
  if (!imovel?.endereco) return null
  const address = [imovel.endereco, imovel.numero, imovel.cidade, imovel.estado]
    .filter(Boolean).join(', ')
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
    const data = await res.json()
    if (data.lat && data.lng) return { lat: data.lat, lng: data.lng }
  } catch { /* silencioso */ }
  return null
}

export default function MapaPage() {
  const [projetos, setProjetos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [search, setSearch] = useState('')
  const [withoutCoords, setWithoutCoords] = useState(0)
  const [mapKey, setMapKey] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/mapa').then(r => r.json()).catch(() => [])
    const list = Array.isArray(res) ? res : []
    setProjetos(list)
    setWithoutCoords(list.filter((p: any) => p.imovel && !p.imovel.latitude).length)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Geocoding automático para projetos sem coordenadas
  const handleAutoGeocode = async () => {
    setGeocoding(true)
    const semCoords = projetos.filter(p => p.imovel && !p.imovel.latitude)
    let updated = 0

    for (const proj of semCoords) {
      const coords = await geocodeProject(proj.imovel)
      if (coords) {
        // Salvar coords no banco via API
        await fetch(`/api/imoveis/${proj.imovel.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: coords.lat, longitude: coords.lng }),
        })
        updated++
        // Aguardar 1s entre requests para respeitar rate limit do Nominatim
        await new Promise(r => setTimeout(r, 1100))
      }
    }

    setGeocoding(false)
    if (updated > 0) {
      await fetchData()
      setMapKey(k => k + 1)
    }
    alert(`✅ ${updated} de ${semCoords.length} imóveis geocodificados!`)
  }

  // Filtros
  const projetosFiltrados = useMemo(() => projetos.filter(p => {
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchTipo   = !tipoFilter   || p.tipo?.toLowerCase().includes(tipoFilter.toLowerCase())
    const matchSearch = !search       ||
      p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.imovel?.cidade?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchTipo && matchSearch
  }), [projetos, statusFilter, tipoFilter, search])

  const comCoordenadas = projetosFiltrados.filter(p => p.imovel?.latitude && p.imovel?.longitude)

  // Centro do mapa = cidade com mais projetos
  const center = useMemo((): [number, number] => {
    if (comCoordenadas.length === 0) return [-12.9718, -38.5011] // Salvador default

    // Média ponderada das coordenadas
    const lats = comCoordenadas.map(p => p.imovel.latitude!)
    const lngs = comCoordenadas.map(p => p.imovel.longitude!)
    return [
      lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
      lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length,
    ]
  }, [comCoordenadas])

  const tiposUnicos = [...new Set(projetos.map(p => p.tipo).filter(Boolean))]

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px - 64px)' }}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Mapa de Projetos</h1>
          <p className="page-subtitle">
            {loading ? 'Carregando...' : `${comCoordenadas.length} projeto(s) no mapa · ${projetos.length} total`}
          </p>
        </div>
        <div className="flex gap-2">
          {withoutCoords > 0 && (
            <button
              onClick={handleAutoGeocode}
              disabled={geocoding}
              className="btn-secondary text-sm"
              title={`${withoutCoords} imóveis sem coordenadas`}
            >
              <RefreshCw className={`w-4 h-4 ${geocoding ? 'animate-spin' : ''}`} />
              {geocoding ? 'Geocodificando...' : `Geocodificar (${withoutCoords})`}
            </button>
          )}
        </div>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* PAINEL LATERAL */}
        <div className="w-64 shrink-0 flex flex-col gap-3 overflow-y-auto">

          {/* Busca */}
          <div className="card p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Cliente, cidade, código..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro Status */}
          <div className="card p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status</p>
            <div className="space-y-1">
              {STATUS_CONFIG.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    statusFilter === s.value
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-left">{s.label}</span>
                  <span className="text-xs text-slate-400">
                    {s.value
                      ? projetos.filter(p => p.status === s.value && p.imovel?.latitude).length
                      : comCoordenadas.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Tipo */}
          <div className="card p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tipo de Serviço</p>
            <button
              onClick={() => setTipoFilter('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all ${!tipoFilter ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Todos
            </button>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tiposUnicos.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoFilter(tipo)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate ${
                    tipoFilter === tipo ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* LEGENDA */}
          <div className="card p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Legenda</p>
            <div className="space-y-2">
              {STATUS_CONFIG.slice(1).map(s => (
                <div key={s.value} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-600">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de projetos sem coords */}
          {withoutCoords > 0 && (
            <div className="card p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700">{withoutCoords} sem localização</p>
              </div>
              <p className="text-[11px] text-amber-600">
                Clique em "Geocodificar" para gerar coordenadas automaticamente via endereço.
              </p>
            </div>
          )}
        </div>

        {/* MAPA */}
        <div className="flex-1 card overflow-hidden min-h-0 relative">
          {/* Badge de contagem */}
          <div className="absolute top-4 left-4 z-[1000] flex gap-2">
            <div className="bg-white shadow-md rounded-lg px-3 py-1.5 flex items-center gap-2 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">{comCoordenadas.length} projetos</span>
            </div>
            {(statusFilter || tipoFilter || search) && (
              <button
                onClick={() => { setStatusFilter(''); setTipoFilter(''); setSearch('') }}
                className="bg-white shadow-md rounded-lg px-3 py-1.5 flex items-center gap-1.5 border border-slate-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-slate-500">Carregando projetos...</p>
              </div>
            </div>
          ) : comCoordenadas.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center max-w-xs">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-700 mb-2">Nenhum projeto no mapa</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {projetos.length === 0
                    ? 'Cadastre processos com imóveis para visualizá-los no mapa.'
                    : `${projetos.length} projeto(s) encontrado(s), mas sem coordenadas. Clique em "Geocodificar" para gerar automaticamente.`}
                </p>
                {projetos.length === 0 ? (
                  <Link href="/processos/novo" className="btn-primary inline-flex">Criar Processo</Link>
                ) : withoutCoords > 0 ? (
                  <button onClick={handleAutoGeocode} disabled={geocoding} className="btn-primary inline-flex">
                    <RefreshCw className={`w-4 h-4 ${geocoding ? 'animate-spin' : ''}`} />
                    {geocoding ? 'Geocodificando...' : 'Geocodificar Endereços'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <MapView
              key={`${mapKey}-${statusFilter}-${tipoFilter}-${search}`}
              projetos={comCoordenadas}
              center={center}
            />
          )}
        </div>
      </div>

      {/* Leaflet popup CSS customizado */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          border: 1px solid #e2e8f0 !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 16px !important; }
        .leaflet-popup-tip { background: white !important; }
        .leaflet-container { font-family: Inter, system-ui, sans-serif; }
        .leaflet-control-zoom { border: 1px solid #e2e8f0 !important; border-radius: 8px !important; overflow: hidden; }
        .leaflet-control-zoom a { color: #475569 !important; }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; }
      `}</style>
    </div>
  )
}
