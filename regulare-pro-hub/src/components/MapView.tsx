'use client'

import { useEffect, useRef } from 'react'

interface Projeto {
  id: string
  codigo: string | null
  tipo: string
  status: string
  etapa: string | null
  prioridade: string
  cliente: { id: string; nome: string } | null
  imovel: {
    endereco: string; numero: string | null; bairro: string | null
    cidade: string | null; estado: string | null; cep: string | null
    area_construida: number | null; area_terreno: number | null
    latitude: number | null; longitude: number | null
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  finalizado:  '#16a34a',
  em_analise:  '#f59e0b',
  protocolo:   '#2563eb',
  pendente:    '#ef4444',
  aprovado:    '#16a34a',
}

function getColor(status: string): string {
  return STATUS_COLORS[status] || '#6366f1'
}

interface MapViewProps {
  projetos: Projeto[]
  center: [number, number]
}

export default function MapView({ projetos, center }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Import dinâmico — única forma segura com Next.js + Leaflet
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center,
        zoom: 12,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map)

      projetos.forEach(proj => {
        const lat = proj.imovel?.latitude
        const lng = proj.imovel?.longitude
        if (!lat || !lng) return

        const color = getColor(proj.status)

        const svgPin = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
          <path d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25S30 25 30 15C30 6.716 23.284 0 15 0z" fill="${color}"/>
          <circle cx="15" cy="15" r="6" fill="white" opacity="0.9"/>
        </svg>`

        const icon = L.divIcon({
          html: svgPin,
          className: '',
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -42],
        })

        const statusLabel: Record<string, string> = {
          finalizado: 'Finalizado',
          em_analise: 'Em Análise',
          protocolo:  'Protocolado',
          pendente:   'Pendente',
          aprovado:   'Aprovado',
        }

        const area = proj.imovel?.area_construida
          ? `${proj.imovel.area_construida} m²`
          : proj.imovel?.area_terreno
          ? `${proj.imovel.area_terreno} m² (terreno)`
          : '—'

        const popupContent = `
          <div style="font-family:Inter,system-ui,sans-serif;min-width:240px;padding:4px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></div>
              <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.1em">
                ${statusLabel[proj.status] || proj.status}
              </span>
            </div>
            <p style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 2px">${proj.cliente?.nome || '—'}</p>
            <p style="font-size:12px;color:#64748b;margin:0 0 10px">${proj.tipo}</p>
            <div style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;border:1px solid #e2e8f0">
              <p style="font-size:11px;color:#94a3b8;margin:0 0 2px;font-weight:600;text-transform:uppercase">Endereço</p>
              <p style="font-size:12px;color:#374151;margin:0">
                ${proj.imovel?.endereco || ''}${proj.imovel?.numero ? ', ' + proj.imovel.numero : ''}
              </p>
              <p style="font-size:12px;color:#6b7280;margin:2px 0 0">
                ${proj.imovel?.bairro ? proj.imovel.bairro + ' · ' : ''}${proj.imovel?.cidade || ''}/${proj.imovel?.estado || ''}
              </p>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
              ${proj.codigo ? `<span style="font-size:10px;font-weight:700;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:3px 8px;border-radius:99px">${proj.codigo}</span>` : ''}
              <span style="font-size:10px;font-weight:600;background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;padding:3px 8px;border-radius:99px">Área: ${area}</span>
            </div>
            <a href="/processos/${proj.id}"
               style="display:block;text-align:center;background:#2563eb;color:white;font-size:12px;font-weight:600;padding:8px 16px;border-radius:8px;text-decoration:none">
              Abrir Processo →
            </a>
          </div>`

        L.marker([lat, lng], { icon })
          .bindPopup(popupContent, { maxWidth: 280 })
          .addTo(map)
      })

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [projetos, center])

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper{border-radius:12px!important;box-shadow:0 10px 40px rgba(0,0,0,.15)!important;border:1px solid #e2e8f0!important;padding:0!important}
        .leaflet-popup-content{margin:16px!important}
        .leaflet-popup-tip{background:white!important}
        .leaflet-container{font-family:Inter,system-ui,sans-serif}
        .leaflet-control-zoom{border:1px solid #e2e8f0!important;border-radius:8px!important;overflow:hidden}
        .leaflet-control-zoom a{color:#475569!important}
        .leaflet-control-zoom a:hover{background:#f1f5f9!important}
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
    </>
  )
}
