'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationPickerProps {
  initialLat?: number | null
  initialLng?: number | null
  onChange: (lat: number, lng: number) => void
}

export default function LocationPicker({ initialLat, initialLng, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const defaultCenter: [number, number] = [initialLat || -14.7946, initialLng || -39.2806] // Itabuna-BA as default if none

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      // Fix para ícones do Leaflet que as vezes não carregam no Next.js
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current).setView(defaultCenter, 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      // Se já tiver coordenadas iniciais, adiciona o marker
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng)
        } else {
          markerRef.current = L.marker(e.latlng, { draggable: true }).addTo(map)
        }
        
        onChange(lat, lng)

        markerRef.current.on('dragend', (event: any) => {
            const marker = event.target;
            const position = marker.getLatLng();
            onChange(position.lat, position.lng);
        });
      })

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pin no Mapa (Clique para marcar)</p>
      <div 
        ref={containerRef} 
        className="w-full h-48 rounded-2xl border border-slate-200 overflow-hidden z-0" 
      />
      {(initialLat || markerRef.current) && (
        <p className="text-[9px] text-slate-500 font-mono italic">Localização capturada: {initialLat?.toFixed(6)}, {initialLng?.toFixed(6)}</p>
      )}
    </div>
  )
}
