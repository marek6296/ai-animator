import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const googleApiKey = process.env.GOOGLE_API_KEY
  
  if (!googleApiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_API_KEY nie je nastavený' },
      { status: 500 }
    )
  }

  try {
    // Test nového Places API
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.types,places.location',
      },
      body: JSON.stringify({
        textQuery: 'Colosseum Rome',
        maxResultCount: 1,
      }),
    })

    const responseText = await response.text()
    let data: any = {}
    
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { error: responseText }
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Places API (New) funguje správne!',
        apiKey: googleApiKey.substring(0, 10) + '...',
        placesFound: data.places?.length || 0,
        firstPlace: data.places?.[0] ? {
          id: data.places[0].id,
          name: data.places[0].displayName?.text || data.places[0].displayName,
          hasPhotos: !!(data.places[0].photos && data.places[0].photos.length > 0),
          photoCount: data.places[0].photos?.length || 0,
        } : null,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Places API (New) zlyhalo',
        status: response.status,
        statusText: response.statusText,
        apiKey: googleApiKey.substring(0, 10) + '...',
        error: data.error || data,
      }, { status: response.status })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Chyba pri volaní Places API (New)',
      apiKey: googleApiKey.substring(0, 10) + '...',
      error: error.message || error.toString(),
    }, { status: 500 })
  }
}

