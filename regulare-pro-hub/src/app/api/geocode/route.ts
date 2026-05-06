import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Endereço não fornecido' }, { status: 400 })
  }

  try {
    // Nominatim — OpenStreetMap geocoding gratuito
    const encoded = encodeURIComponent(address + ', Brasil')
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=br`,
      {
        headers: {
          'User-Agent': 'RegularizaPro/1.0 (saas@regularizapro.com.br)',
          'Accept-Language': 'pt-BR',
        },
        next: { revalidate: 3600 }, // cache 1h
      }
    )

    const data = await res.json()

    if (data.length === 0) {
      return NextResponse.json({ error: 'Endereço não encontrado', lat: null, lng: null })
    }

    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display: data[0].display_name,
    })
  } catch (error) {
    console.error('ERRO geocoding:', error)
    return NextResponse.json({ error: 'Falha no geocoding', lat: null, lng: null }, { status: 500 })
  }
}
