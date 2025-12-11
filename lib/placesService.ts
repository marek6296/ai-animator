/**
 * Služba pre prácu s Google Places API
 * Získava presné miesta a ich fotky z Google Maps
 */

export interface Place {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  types?: string[]
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

/**
 * Vyhľadá miesta v meste pomocou Google Places Text Search API
 */
export async function searchPlacesInCity(
  cityName: string,
  query?: string,
  maxResults: number = 20
): Promise<Place[]> {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY nie je nastavený')
  }

  try {
    // Text Search API - hľadá miesta v meste
    const searchQuery = query 
      ? `${query} in ${cityName}`
      : `tourist attractions in ${cityName}`
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleApiKey}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      const response = await fetch(searchUrl, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Google Places API error: ${errorData.error?.message || response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results) {
        // Vráť len miesta s fotkami
        const placesWithPhotos = data.results
          .filter((place: any) => place.photos && place.photos.length > 0)
          .slice(0, maxResults)
          .map((place: any) => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            rating: place.rating,
            photos: place.photos,
            types: place.types,
            geometry: place.geometry,
          }))
        
        console.log(`✓ Found ${placesWithPhotos.length} places with photos in ${cityName}`)
        return placesWithPhotos
      } else if (data.status === 'ZERO_RESULTS') {
        console.warn(`No places found for "${searchQuery}"`)
        return []
      } else {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Google Places API timeout')
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error searching places:', error)
    throw error
  }
}

/**
 * Získa fotku z Google Place Photos API pomocou photo_reference
 */
export function getPlacePhotoUrl(
  photoReference: string,
  maxWidth: number = 800
): string {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY nie je nastavený')
  }

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${googleApiKey}`
}

/**
 * Vyhľadá konkrétne miesto podľa názvu v meste
 * Skúša viacero variantov query pre lepšie výsledky
 */
export async function findPlaceByName(
  placeName: string,
  cityName: string
): Promise<Place | null> {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    return null
  }

  // Vytvor viacero variantov query pre lepšie výsledky
  const queries = [
    `${placeName}, ${cityName}`,           // Presný názov + mesto
    `${placeName} ${cityName}`,           // Bez čiarky
    placeName,                            // Len názov miesta
    `${placeName} landmark`,              // S "landmark"
    `${placeName} attraction`,            // S "attraction"
  ]

  // Odstráň duplikáty a prázdne query
  const uniqueQueries = [...new Set(queries.filter(q => q.trim().length > 0))]

  for (const searchQuery of uniqueQueries) {
    try {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleApiKey}`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      try {
        const response = await fetch(searchUrl, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Skús nájsť najlepšie zhoda
            for (const place of data.results) {
              // Skontroluj, či má fotky
              if (place.photos && place.photos.length > 0) {
                // Skontroluj, či sa názvy zhodujú (fuzzy match)
                const placeNameLower = placeName.toLowerCase().trim()
                const foundNameLower = place.name.toLowerCase().trim()
                
                // Presná zhoda alebo názov obsahuje hľadaný názov
                if (
                  foundNameLower === placeNameLower ||
                  foundNameLower.includes(placeNameLower) ||
                  placeNameLower.includes(foundNameLower) ||
                  // Alebo aspoň 70% podobnosť (jednoduchý fuzzy match)
                  calculateSimilarity(placeNameLower, foundNameLower) > 0.7
                ) {
                  console.log(`✓ Found place "${place.name}" for query "${placeName}" (matched: ${searchQuery})`)
                  return {
                    place_id: place.place_id,
                    name: place.name,
                    formatted_address: place.formatted_address,
                    rating: place.rating,
                    photos: place.photos,
                    types: place.types,
                    geometry: place.geometry,
                  }
                }
              }
            }
            
            // Ak sme nenašli presnú zhodu, vezmeme prvý výsledok s fotkami
            const firstWithPhoto = data.results.find((p: any) => p.photos && p.photos.length > 0)
            if (firstWithPhoto) {
              console.log(`⚠ Using first result "${firstWithPhoto.name}" for query "${placeName}" (not exact match)`)
              return {
                place_id: firstWithPhoto.place_id,
                name: firstWithPhoto.name,
                formatted_address: firstWithPhoto.formatted_address,
                rating: firstWithPhoto.rating,
                photos: firstWithPhoto.photos,
                types: firstWithPhoto.types,
                geometry: firstWithPhoto.geometry,
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn(`Error finding place with query "${searchQuery}":`, error.message)
        }
      }
    } catch (error: any) {
      console.warn(`Error finding place with query "${searchQuery}":`, error.message)
    }
  }
  
  return null
}

/**
 * Jednoduchá funkcia pre výpočet podobnosti dvoch reťazcov (Levenshtein distance)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) {
    return 1.0
  }
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Levenshtein distance - počet zmien potrebných na transformáciu jedného reťazca na druhý
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

