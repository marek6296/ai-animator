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
 */
export async function findPlaceByName(
  placeName: string,
  cityName: string
): Promise<Place | null> {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    return null
  }

  try {
    const searchQuery = `${placeName}, ${cityName}`
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
          const place = data.results[0]
          
          if (place.photos && place.photos.length > 0) {
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
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Error finding place:', error.message)
      }
    }
  } catch (error: any) {
    console.warn('Error finding place:', error.message)
  }
  
  return null
}

