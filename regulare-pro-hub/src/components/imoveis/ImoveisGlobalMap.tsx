'use client'

import { useEffect, useRef, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'

interface Imovel {
  id: string
  cliente: { id: string; nome: string }
  endereco: string
  bairro: string | null
  cidade: string | null
  estado: string | null
  latitude: number | null
  longitude: number | null
  area_terreno: number | null
  area_construida: number | null
  num_matricula: string | null
}

interface ImoveisGlobalMapProps {
  imoveis: Imovel[]
}

const CLIENT_COLORS = [
  '#2563eb', '#16a34a', '#d33c3c', '#9333ea', 
  '#ea580c', '#0891b2', '#4f46e5', '#be123c',
  '#15803d', '#1d4ed8'
]

export default function ImoveisGlobalMap({ imoveis }: ImoveisGlobalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  // Map each client to a consistent color
  const clientColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    const uniqueClients = Array.from(new Set(imoveis.map(i => i.cliente.id)))
    uniqueClients.forEach((id, idx) => {
      map[id] = CLIENT_COLORS[idx % CLIENT_COLORS.length]
    })
    return map
  }, [imoveis])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Encontrar centro médio ou padrão (Brasil centro)
      const validImoveis = imoveis.filter(i => i.latitude !== null && i.longitude !== null)
      console.log('Valid Imoveis for Map:', validImoveis.length, validImoveis)
      
      const center: [number, number] = validImoveis.length > 0
        ? [Number(validImoveis[0].latitude), Number(validImoveis[0].longitude)]
        : [-15.7801, -47.9292]

      const map = L.map(containerRef.current, {
        center,
        zoom: 12,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Camada de Satélite/Híbrida de alta qualidade
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google',
        maxZoom: 20,
      }).addTo(map)

      validImoveis.forEach(imovel => {
        const color = clientColorMap[imovel.cliente.id]
        const filterId = `shadow-${imovel.id.replace(/[^a-z0-9]/gi, '')}`

        const svgPin = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M18 0C8.059 0 0 8.059 0 18c0 14 18 28 18 28s18-14 18-28c0-9.941-8.059-18-18-18z" fill="${color}" filter="url(#${filterId})"/>
          <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
          <circle cx="18" cy="18" r="4" fill="${color}"/>
        </svg>`

        const icon = L.divIcon({
          html: svgPin,
          className: '',
          iconSize: [36, 46],
          iconAnchor: [18, 46],
          popupAnchor: [0, -48],
        })

        const popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif;min-width:260px;padding:4px">
            <div style="margin-bottom:12px">
              <span style="font-[8px];font-weight:900;color:white;background:${color};padding:2px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:.1em">
                Propriedade
              </span>
            </div>
            <p style="font-size:16px;font-weight:900;color:#0f172a;margin:0 0 4px;line-height:1.2">${imovel.endereco}</p>
            <p style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:12px">${imovel.bairro} · ${imovel.cidade}/${imovel.estado}</p>
            
            <div style="background:#f8fafc;border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid #e2e8f0">
              <p style="font-size:9px;color:#94a3b8;margin:0 0 2px;font-weight:900;text-transform:uppercase">Proprietário</p>
              <p style="font-size:13px;color:#1e293b;margin:0;font-weight:700">${imovel.cliente.nome}</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
              <div style="background:#f1f5f9;padding:8px;border-radius:8px">
                <p style="font-size:8px;color:#64748b;font-weight:800;text-transform:uppercase;margin:0">Área Terreno</p>
                <p style="font-size:11px;font-weight:800;color:#334155;margin:0">${imovel.area_terreno || '—'} m²</p>
              </div>
              <div style="background:#f1f5f9;padding:8px;border-radius:8px">
                <p style="font-size:8px;color:#64748b;font-weight:800;text-transform:uppercase;margin:0">Construída</p>
                <p style="font-size:11px;font-weight:800;color:#334155;margin:0">${imovel.area_construida || '—'} m²</p>
              </div>
            </div>

            <a href="/imoveis/${imovel.id}"
               style="display:block;text-align:center;background:#0f172a;color:white;font-size:11px;font-weight:800;padding:10px;border-radius:10px;text-decoration:none;text-transform:uppercase;letter-spacing:.05em">
              Ver Detalhes Completos →
            </a>
          </div>`

        L.marker([Number(imovel.latitude), Number(imovel.longitude)], { icon })
          .bindPopup(popupContent, { maxWidth: 300 })
          .addTo(map)
      })

      // Ajustar bounds se houver mais de um marcador
      if (validImoveis.length > 1) {
        const bounds = L.latLngBounds(validImoveis.map(i => [Number(i.latitude), Number(i.longitude)]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [imoveis, clientColorMap])

  return (
    <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl">
      <style>{`
        .leaflet-popup-content-wrapper{border-radius:18px!important;box-shadow:0 20px 50px rgba(0,0,0,.2)!important;border:1px solid #e2e8f0!important;padding:0!important}
        .leaflet-popup-content{margin:16px!important}
        .leaflet-popup-tip{background:white!important}
        .leaflet-container{font-family:Inter,system-ui,sans-serif; background: #f1f5f9 !important}
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Legenda de Clientes Flutuante */}
      <div className="absolute top-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl max-w-[220px]">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legenda por Cliente</p>
          <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full">
            {imoveis.filter(i => i.latitude !== null && i.longitude !== null).length}/{imoveis.length} PINs
          </span>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
          {Object.entries(clientColorMap).map(([id, color]) => {
            const clienteImoveis = imoveis.filter(i => i.cliente.id === id)
            const clienteNome = clienteImoveis[0]?.cliente.nome
            const hasCoords = clienteImoveis.some(i => i.latitude !== null && i.longitude !== null)
            
            return (
              <div key={id} className={`flex items-center justify-between gap-2 ${!hasCoords ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[10px] font-bold text-slate-700 truncate">{clienteNome}</span>
                </div>
                {!hasCoords && <AlertCircle size={10} className="text-amber-500 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
