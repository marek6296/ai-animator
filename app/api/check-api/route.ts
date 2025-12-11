import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const googleApiKey = process.env.GOOGLE_API_KEY
  
  if (!googleApiKey) {
    return NextResponse.json({
      success: false,
      message: 'GOOGLE_API_KEY nie je nastavený v .env',
      action: 'Pridajte GOOGLE_API_KEY do .env súboru'
    }, { status: 500 })
  }

  // Skontrolujte, či je to správny key
  const isCorrectKey = googleApiKey === 'AIzaSyC3_x2uHzpduhmumw_EzZyEnYDkqNOvG2I'
  
  const results: any = {
    apiKeySet: true,
    apiKeyMatches: isCorrectKey,
    apiKeyPreview: googleApiKey.substring(0, 20) + '...',
    tests: []
  }

  // Test 1: Places API (New) - searchText
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({
        textQuery: 'Eiffel Tower',
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
      results.tests.push({
        name: 'Places API (New) - searchText',
        status: '✅ FUNGUJE',
        message: 'API je povolené a funguje správne!',
        placesFound: data.places?.length || 0
      })
    } else {
      const errorMsg = data.error?.message || data.message || 'Unknown error'
      const errorCode = data.error?.code || data.code
      const errorStatus = data.error?.status || data.status
      
      results.tests.push({
        name: 'Places API (New) - searchText',
        status: '❌ ZLYHALO',
        error: errorMsg,
        errorCode: errorCode,
        errorStatus: errorStatus,
        statusCode: response.status,
        fullError: data,
        action: errorMsg.includes('not been used') || errorMsg.includes('disabled') || errorCode === 403
          ? 'API nie je povolené alebo ešte nie je propagované. Skontrolujte: https://console.cloud.google.com/apis/api/places.googleapis.com/overview?project=352745064960'
          : errorCode === 400
          ? 'Nesprávny formát požiadavky'
          : 'Skontrolujte API key restrictions a billing'
      })
    }
  } catch (error: any) {
    results.tests.push({
      name: 'Places API (New) - searchText',
      status: '❌ CHYBA',
      error: error.message,
      stack: error.stack
    })
  }
  
  // Test 2: Skontrolujte, či je API key správne nastavený
  if (googleApiKey && googleApiKey.length > 20) {
    results.tests.push({
      name: 'API Key Format',
      status: '✅ OK',
      message: `API key má správnu dĺžku (${googleApiKey.length} znakov)`,
      preview: googleApiKey.substring(0, 10) + '...' + googleApiKey.substring(googleApiKey.length - 4)
    })
  } else {
    results.tests.push({
      name: 'API Key Format',
      status: '❌ CHYBA',
      message: 'API key má nesprávnu dĺžku alebo formát'
    })
  }

  // Zhrnutie
  const allWorking = results.tests.every((t: any) => t.status === '✅ FUNGUJE')
  
  return NextResponse.json({
    success: allWorking,
    summary: allWorking 
      ? '✅ Všetko funguje správne!'
      : '❌ Places API (New) nie je povolené',
    ...results,
    nextSteps: allWorking ? [] : [
      '1. Choďte na: https://console.cloud.google.com/apis/api/places.googleapis.com/overview?project=352745064960',
      '2. Kliknite na tlačidlo "ENABLE"',
      '3. Choďte na: https://console.cloud.google.com/apis/credentials',
      '4. Kliknite na "Maps Platform API Key"',
      '5. V "API restrictions" pridajte "Places API (New)"',
      '6. Počkajte 5-10 minút a skúste znova'
    ]
  })
}

