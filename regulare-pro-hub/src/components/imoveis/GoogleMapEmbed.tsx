'use client'

interface GoogleMapEmbedProps {
  address?: string
  latitude?: number | null
  longitude?: number | null
  zoom?: number
  className?: string
  mapType?: 'm' | 'k' | 'h' | 'p' // m=roadmap, k=satellite, h=hybrid, p=terrain
}

export default function GoogleMapEmbed({ address, latitude, longitude, zoom = 15, className = "", mapType = 'm' }: GoogleMapEmbedProps) {
  // Se tivermos coordenadas, usamos elas. Se não, usamos o endereço.
  const query = latitude && longitude 
    ? `${latitude},${longitude}` 
    : address ? encodeURIComponent(address) : null

  if (!query) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <p className="text-xs font-bold uppercase tracking-widest">Endereço não disponível</p>
      </div>
    )
  }

  // Google Maps Legacy Embed URL
  const embedUrl = `https://maps.google.com/maps?q=${query}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
      />
      {/* Overlay to catch clicks and prevent map interaction if desired, but here we want it interactive */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[inherit]" />
    </div>
  )
}
