/**
 * Služba na získavanie súradníc (geocoding) pomocou Google Geocoding API
 * Používa rovnaký GOOGLE_API_KEY ako pre obrázky
 */

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Získa súradnice pre miesto pomocou Google Geocoding API
 */
export async function getCoordinates(
  placeName: string,
  destination?: string
): Promise<Coordinates | null> {
  if (!placeName || placeName.trim().length === 0) {
    return null
  }

  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    console.warn('GOOGLE_API_KEY nie je nastavený, geocoding nebude fungovať')
    return null
  }

  try {
    // Vytvoríme query: "názov miesta, destinácia"
    let query = placeName.trim()
    if (destination) {
      // Preklad destinácie do angličtiny
      const cityTranslations: Record<string, string> = {
        'Paríž': 'Paris', 'Londýn': 'London', 'Rím': 'Rome', 'Barcelona': 'Barcelona',
        'Amsterdam': 'Amsterdam', 'Berlín': 'Berlin', 'Viedeň': 'Vienna', 'Praha': 'Prague',
        'Budapešť': 'Budapest', 'Krakow': 'Krakow', 'Atény': 'Athens', 'Lisabon': 'Lisbon',
        'Dublin': 'Dublin', 'Edinburgh': 'Edinburgh', 'Kodaň': 'Copenhagen', 'Štokholm': 'Stockholm',
        'Oslo': 'Oslo', 'Helsinki': 'Helsinki', 'Reykjavík': 'Reykjavik', 'Zürich': 'Zurich',
        'Miláno': 'Milan', 'Florencia': 'Florence', 'Venezia': 'Venice', 'Neapol': 'Naples',
        'Madrid': 'Madrid', 'Sevilla': 'Seville', 'Valencia': 'Valencia', 'Porto': 'Porto',
        'Brusel': 'Brussels', 'Antverpy': 'Antwerp', 'Bruggy': 'Bruges', 'Bratislava': 'Bratislava',
        'Ljubljana': 'Ljubljana', 'Záhreb': 'Zagreb',
      }
      const englishCity = cityTranslations[destination] || destination
      query = `${placeName}, ${englishCity}`
    }

    const encodedQuery = encodeURIComponent(query)
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${googleApiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(geocodingUrl, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`Geocoding API error: ${response.status}`)
        return null
      }

      const data = await response.json()

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        console.log(`✓ Found coordinates for "${placeName}": ${location.lat}, ${location.lng}`)
        return {
          lat: location.lat,
          lng: location.lng,
        }
      } else if (data.status === 'ZERO_RESULTS') {
        console.warn(`No results for geocoding: "${placeName}"`)
        return null
      } else {
        console.warn(`Geocoding API status: ${data.status} for "${placeName}"`)
        return null
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name !== 'AbortError') {
        throw fetchError
      }
      return null
    }
  } catch (error: any) {
    console.error(`Error in geocoding for "${placeName}":`, error.message)
    return null
  }
}

/**
 * Získa súradnice pre viacero miest naraz (s rate limiting)
 */
export async function getMultipleCoordinates(
  places: Array<{ name: string; destination?: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>()

  for (let i = 0; i < places.length; i++) {
    const place = places[i]
    onProgress?.(i + 1, places.length)

    const coords = await getCoordinates(place.name, place.destination)
    if (coords) {
      results.set(place.name, coords)
    }

    // Oneskorenie medzi requestmi, aby sme neprekročili rate limit
    if (i < places.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200)) // 200ms delay
    }
  }

  return results
}

