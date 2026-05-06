'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import Link from 'next/link'

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
  finalizado:  '#16a34a', // verde
  em_analise:  '#f59e0b', // amarelo
  protocolo:   '#2563eb', // azul
  pendente:    '#ef4444', // vermelho
  aprovado:    '#16a34a',
}

function getColor(status: string): string {
  return STATUS_COLORS[status] || '#6366f1'
}

function createIcon(color: string) {
  // SVG pin customizado
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25S30 25 30 15C30 6.716 23.284 0 15 0z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="15" cy="15" r="6" fill="white" opacity="0.9"/>
    </svg>
  `
  const encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))

  const L = require('leaflet')
  return L.icon({
    iconUrl: encoded,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -42],
  })
}

interface MapViewProps {
  projetos: Projeto[]
  center: [number, number]
}

export default function MapView({ projetos, center }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map(containerRef.current, {
      center,
      zoom: 12,
      zoomControl: false,
    })

    // Zoom control na posição certa
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Tile layer OpenStreetMap com estilo CartoDB Positron (mais limpo)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map)

    // Adicionar pins para cada projeto com coordenadas
    projetos.forEach(proj => {
      const lat = proj.imovel?.latitude
      const lng = proj.imovel?.longitude
      if (!lat || !lng) return

      const color = getColor(proj.status)
      const icon = createIcon(color)

      const area = proj.imovel?.area_construida
        ? `${proj.imovel.area_construida} m²`
        : proj.imovel?.area_terreno
        ? `${proj.imovel.area_terreno} m² (terreno)`
        : '—'

      const statusLabel: Record<string, string> = {
        finalizado: 'Finalizado',
        em_analise: 'Em Análise',
        protocolo: 'Protocolado',
        pendente: 'Pendente',
        aprovado: 'Aprovado',
      }

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; min-width: 240px; padding: 4px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${color}; flex-shrink:0;"></div>
            <span style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.1em;">
              ${statusLabel[proj.status] || proj.status}
            </span>
          </div>
          
          <p style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 2px;">
            ${proj.cliente?.nome || 'Cliente'}
          </p>
          <p style="font-size:12px; color:#64748b; margin:0 0 10px;">
            ${proj.tipo}
          </p>

          <div style="background:#f8fafc; border-radius:8px; padding:10px; margin-bottom:12px; border:1px solid #e2e8f0;">
            <p style="font-size:11px; color:#94a3b8; margin:0 0 2px; font-weight:600; text-transform:uppercase;">Endereço</p>
            <p style="font-size:12px; color:#374151; margin:0;">
              ${proj.imovel?.endereco || ''}${proj.imovel?.numero ? ', ' + proj.imovel.numero : ''}
            </p>
            <p style="font-size:12px; color:#6b7280; margin:2px 0 0;">
              ${proj.imovel?.bairro ? proj.imovel.bairro + ' · ' : ''}${proj.imovel?.cidade || ''}/${proj.imovel?.estado || ''}
            </p>
          </div>

          <div style="display:flex; gap:8px; margin-bottom:12px;">
            ${proj.codigo ? `<span style="font-size:10px; font-weight:700; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:3px 8px; border-radius:99px;">${proj.codigo}</span>` : ''}
            <span style="font-size:10px; font-weight:600; background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; padding:3px 8px; border-radius:99px;">
              Área: ${area}
            </span>
          </div>

          <a href="/processos/${proj.id}" 
             style="display:block; text-align:center; background:#2563eb; color:white; font-size:12px; font-weight:600; padding:8px 16px; border-radius:8px; text-decoration:none; transition:background 0.2s;"
             onmouseover="this.style.background='#1d4ed8'"
             onmouseout="this.style.background='#2563eb'">
            Abrir Processo →
          </a>
        </div>
      `

      L.marker([lat, lng], { icon })
        .bindPopup(popupContent, {
          maxWidth: 280,
          className: 'leaflet-popup-custom',
        })
        .addTo(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [projetos, center])

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: '500px' }} />
}
