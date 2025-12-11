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
    photo_reference?: string  // Legacy API
    name?: string  // New API
    height?: number
    width?: number
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
    // Skús najprv nové Places API (New)
    const searchQuery = query 
      ? `${query} in ${cityName}`
      : `tourist attractions in ${cityName}`
    
    try {
      const searchUrl = `https://places.googleapis.com/v1/places:searchText`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.types,places.location',
          },
          body: JSON.stringify({
            textQuery: searchQuery,
            maxResultCount: maxResults,
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.places && data.places.length > 0) {
            const placesWithPhotos = data.places
              .filter((place: any) => place.photos && place.photos.length > 0)
              .slice(0, maxResults)
              .map((place: any) => ({
                place_id: place.id,
                name: place.displayName?.text || place.displayName || 'Unknown',
                formatted_address: place.formattedAddress || '',
                rating: place.rating,
                photos: place.photos.map((photo: any) => ({
                  photo_reference: photo.name, // V novom API je to name
                  height: photo.heightPx || 800,
                  width: photo.widthPx || 800,
                })),
                types: place.types || [],
                geometry: place.location ? {
                  location: {
                    lat: place.location.latitude,
                    lng: place.location.longitude,
                  }
                } : undefined,
              }))
            
            console.log(`✓ Found ${placesWithPhotos.length} places with photos (New API) in ${cityName}`)
            return placesWithPhotos
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn('Places API (New) failed, falling back to legacy:', error.message)
        }
      }
    } catch (error: any) {
      console.warn('Places API (New) not available, using legacy API')
    }
    
    // Fallback na legacy API
    return await searchPlacesLegacy(cityName, query, maxResults, googleApiKey)
  } catch (error: any) {
    console.error('Error searching places:', error)
    throw error
  }
}

/**
 * Fallback na legacy Text Search API
 */
async function searchPlacesLegacy(
  cityName: string,
  query: string | undefined,
  maxResults: number,
  googleApiKey: string
): Promise<Place[]> {
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
      
      console.log(`✓ Found ${placesWithPhotos.length} places with photos (legacy API) in ${cityName}`)
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

  // Nové Places API používa iný formát pre fotky
  // photoReference môže byť buď photo_reference (legacy) alebo name (new API)
  if (photoReference.startsWith('places/')) {
    // Nové API - photoReference je name (napr. "places/ChIJ.../photos/...")
    // Nové API používa GET request s key v query parametri
    return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${googleApiKey}`
  } else {
    // Legacy API - photoReference je photo_reference (dlhý string)
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${googleApiKey}`
  }
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
  ]

  // Odstráň duplikáty a prázdne query
  const uniqueQueries = [...new Set(queries.filter(q => q.trim().length > 0))]

  // Skús najprv nové Places API (New)
  for (const searchQuery of uniqueQueries) {
    try {
      const searchUrl = `https://places.googleapis.com/v1/places:searchText`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.types,places.location',
          },
          body: JSON.stringify({
            textQuery: searchQuery,
            maxResultCount: 5,
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()

          if (data.places && data.places.length > 0) {
            // Skús nájsť najlepšie zhoda
            for (const place of data.places) {
              // Skontroluj, či má fotky
              if (place.photos && place.photos.length > 0) {
                // Skontroluj, či sa názvy zhodujú (fuzzy match)
                const placeNameLower = placeName.toLowerCase().trim()
                const foundName = place.displayName?.text || place.displayName || ''
                const foundNameLower = foundName.toLowerCase().trim()
                
                // Presná zhoda alebo názov obsahuje hľadaný názov
                if (
                  foundNameLower === placeNameLower ||
                  foundNameLower.includes(placeNameLower) ||
                  placeNameLower.includes(foundNameLower) ||
                  // Alebo aspoň 70% podobnosť (jednoduchý fuzzy match)
                  calculateSimilarity(placeNameLower, foundNameLower) > 0.7
                ) {
                  console.log(`✓ Found place "${foundName}" for query "${placeName}" (New API, matched: ${searchQuery})`)
                  return {
                    place_id: place.id,
                    name: foundName,
                    formatted_address: place.formattedAddress || '',
                    rating: place.rating,
                    photos: place.photos.map((photo: any) => ({
                      photo_reference: photo.name, // V novom API je to name
                      height: photo.heightPx || 800,
                      width: photo.widthPx || 800,
                    })),
                    types: place.types || [],
                    geometry: place.location ? {
                      location: {
                        lat: place.location.latitude,
                        lng: place.location.longitude,
                      }
                    } : undefined,
                  }
                }
              }
            }
            
            // Ak sme nenašli presnú zhodu, vezmeme prvý výsledok s fotkami
            const firstWithPhoto = data.places.find((p: any) => p.photos && p.photos.length > 0)
            if (firstWithPhoto) {
              const foundName = firstWithPhoto.displayName?.text || firstWithPhoto.displayName || ''
              console.log(`⚠ Using first result "${foundName}" for query "${placeName}" (New API, not exact match)`)
              return {
                place_id: firstWithPhoto.id,
                name: foundName,
                formatted_address: firstWithPhoto.formattedAddress || '',
                rating: firstWithPhoto.rating,
                photos: firstWithPhoto.photos.map((photo: any) => ({
                  photo_reference: photo.name,
                  height: photo.heightPx || 800,
                  width: photo.widthPx || 800,
                })),
                types: firstWithPhoto.types || [],
                geometry: firstWithPhoto.location ? {
                  location: {
                    lat: firstWithPhoto.location.latitude,
                    lng: firstWithPhoto.location.longitude,
                  }
                } : undefined,
              }
            }
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn(`Places API (New) failed for "${searchQuery}":`, error.message)
        }
      }
    } catch (error: any) {
      console.warn(`Error finding place with query "${searchQuery}":`, error.message)
    }
  }
  
  // Fallback na legacy API (ak nové API zlyhalo)
  console.warn(`New Places API failed, trying legacy API for "${placeName}"`)
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
                  console.log(`✓ Found place "${place.name}" for query "${placeName}" (Legacy API, matched: ${searchQuery})`)
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
              console.log(`⚠ Using first result "${firstWithPhoto.name}" for query "${placeName}" (Legacy API, not exact match)`)
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
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn(`Error finding place with query "${searchQuery}" (Legacy):`, error.message)
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

