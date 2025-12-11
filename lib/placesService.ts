/**
 * Služba pre prácu s Google Places API
 * Získava presné miesta a ich fotky z Google Maps
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Zistí, či je miesto na Slovensku podľa formatted_address
 */
export function isInSlovakia(formattedAddress: string): boolean {
  if (!formattedAddress) return false
  const addressLower = formattedAddress.toLowerCase()
  // Skontroluj rôzne varianty názvu Slovenska
  return addressLower.includes('slovakia') || 
         addressLower.includes('slovensko') ||
         addressLower.includes('sk,') ||
         addressLower.endsWith(', sk') ||
         addressLower.endsWith(' slovakia') ||
         addressLower.endsWith(' slovensko')
}

/**
 * Zistí jazyk pre miesto podľa jeho adresy
 * Vráti 'sk' len pre Slovensko, inak undefined (Google použije default jazyk krajiny)
 */
function getLanguageCodeForPlace(formattedAddress: string): string | undefined {
  if (isInSlovakia(formattedAddress)) {
    return 'sk'
  }
  // Pre iné krajiny nepoužijeme languageCode - Google vráti originálny jazyk krajiny
  return undefined
}

/**
 * Zistí, či je názov v angličtine (jednoduchá heuristika)
 */
export function isNameInEnglish(name: string): boolean {
  if (!name) return false
  
  const nameLower = name.toLowerCase()
  
  // Anglické slová, ktoré sa často vyskytujú v názvoch miest
  const englishWords = [
    'tower', 'watch tower', 'castle', 'museum', 'gallery', 'church', 'cathedral',
    'palace', 'monument', 'statue', 'bridge', 'park', 'square', 'street', 'avenue',
    'boulevard', 'plaza', 'market', 'hall', 'theater', 'theatre', 'cinema',
    'restaurant', 'cafe', 'hotel', 'station', 'airport', 'harbor', 'harbour',
    'beach', 'lake', 'river', 'mountain', 'hill', 'valley', 'forest', 'garden',
    'zoo', 'aquarium', 'stadium', 'arena', 'center', 'centre', 'building',
    'memorial', 'tomb', 'temple', 'monastery', 'abbey', 'fortress', 'fort',
    'ruins', 'archaeological', 'site', 'viewpoint', 'lookout', 'observation'
  ]
  
  // Skontroluj, či názov obsahuje anglické slová
  for (const word of englishWords) {
    if (nameLower.includes(word)) {
      return true
    }
  }
  
  // Skontroluj, či názov začína anglickým slovom (často je to indikátor anglického názvu)
  const firstWord = nameLower.split(/\s+/)[0]
  if (englishWords.includes(firstWord)) {
    return true
  }
  
  return false
}

/**
 * Preloží názov miesta do slovenčiny pomocou OpenAI
 */
export async function translatePlaceNameToSlovak(name: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Si prekladateľ názvov miest a pamiatok. Preložíš názov miesta do slovenčiny. Vráť LEN preložený názov, bez dodatočného textu, bez úvodu, bez vysvetlení. Ak názov už je v slovenčine, vráť ho nezmenený.'
        },
        {
          role: 'user',
          content: `Prelož tento názov miesta do slovenčiny: "${name}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    })
    
    const translated = response.choices[0]?.message?.content?.trim() || name
    console.log(`✓ Translated "${name}" → "${translated}"`)
    return translated
  } catch (error) {
    console.warn(`⚠ Failed to translate place name "${name}":`, error)
    return name // Vráť originálny názov pri chybe
  }
}

/**
 * Skontroluje a preloží názov miesta, ak je to potrebné
 * Ak je miesto na Slovensku a názov je v angličtine, preloží ho do slovenčiny
 */
async function ensureSlovakName(place: Place): Promise<Place> {
  // Skontroluj, či je miesto na Slovensku
  if (!isInSlovakia(place.formatted_address)) {
    return place // Nie je na Slovensku, vráť nezmenené
  }
  
  // Skontroluj, či je názov v angličtine
  if (!isNameInEnglish(place.name)) {
    return place // Názov nie je v angličtine, vráť nezmenené
  }
  
  // Názov je v angličtine a miesto je na Slovensku - prelož ho
  const translatedName = await translatePlaceNameToSlovak(place.name)
  
  return {
    ...place,
    name: translatedName
  }
}

export interface Place {
  place_id: string // Môže byť v tvare "places/ChIJ..." (New API) alebo klasický ID (Legacy API)
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number // Počet recenzií (pre zoraďovanie podľa popularity)
  last_review_time?: number // Čas poslednej recenzie (Unix timestamp v sekundách)
  recent_reviews_count?: number // Počet recenzií za posledný rok
  is_active?: boolean // Či je miesto aktívne (má nedávne recenzie)
  photos?: Array<{
    photo_reference?: string  // Legacy API: photo_reference (dlhý string)
    name?: string  // New API: name (v tvare "places/ChIJ.../photos/...")
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
 * Zistí, či je mesto na Slovensku podľa názvu
 */
function isCityInSlovakia(cityName: string): boolean {
  if (!cityName) return false
  const cityLower = cityName.toLowerCase()
  // Zoznam slovenských miest (môžeš rozšíriť)
  const slovakCities = ['bratislava', 'košice', 'žilina', 'banská bystrica', 'trnava', 'trenčín', 'prešov', 'nitra', 'martin', 'poprad', 'prievidza', 'zvolen', 'nové zámky', 'michalovce', 'spišská nová ves', 'komárno', 'levice', 'humenné', 'bardejov', 'liptovský mikuláš', 'ružomberok', 'piešťany', 'topoľčany', 'trebišov', 'čadca', 'rimavská sobota', 'dubnica nad váhom', 'pezinok', 'partizánske', 'hriňová', 'vranov nad topľou', 'brezno', 'snina', 'nové mesto nad váhom', 'senica', 'rožňava', 'dolný kubín', 'banská štiavnica', 'žiar nad hronom', 'považská bystrica', 'detva', 'skalica', 'handlová', 'kežmarok', 'stará Ľubovňa', 'galanta', 'kysucké nové mesto', 'veľký krtíš', 'sereď', 'skalica', 'senec', 'nové zámky', 'moldava nad bodvou', 'holíč', 'fiľakovo', 'šamorín', 'stropkov', 'bánovce nad bebravou', 'žarnovica', 'vráble', 'tvrdošín', 'veľké kapušany', 'stará turá', 'kremnica', 'revúca', 'vrbové', 'sečovce', 'sabinov', 'poltár', 'hurbanovo', 'hnúšťa', 'banská belá', 'modra', 'svätý jur', 'sliač', 'šurany', 'trenčianske teplice', 'bojnice', 'púchov', 'myjava', 'veľký meder', 'kráľovský chlmec', 'medzilaborce', 'čierna nad tisou', 'veľký šariš', 'bardejovské kúpele', 'tatranská lomnica', 'štrbské pleso', 'smokovec', 'tatranská kotlina', 'ždiar', 'podbanské', 'tatranská javorina', 'tatranská lesná', 'tatranská polianka', 'tatranská zruby', 'tatranská štrba', 'tatranská veľká', 'tatranská malá', 'tatranská vysoká', 'tatranská nízká', 'tatranská středná', 'tatranská vysoká', 'tatranská nízká', 'tatranská středná']
  return slovakCities.some(city => cityLower.includes(city) || city.includes(cityLower))
}

/**
 * Vyhľadá miesta v meste pomocou Google Places Text Search API
 */
export async function searchPlacesInCity(
  cityName: string,
  query?: string,
  maxResults: number = 20,
  locationBias?: { lat: number; lng: number; radius?: number }
): Promise<Place[]> {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY nie je nastavený')
  }

  // Zisti, či je mesto na Slovensku
  const isSlovakia = isCityInSlovakia(cityName)
  const languageCode = isSlovakia ? 'sk' : undefined

  try {
    // Skús najprv nové Places API (New)
    const searchQuery = query 
      ? `${query} in ${cityName}`
      : `tourist attractions in ${cityName}`
    
    try {
      const searchUrl = `https://places.googleapis.com/v1/places:searchText`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      // Vytvor request body - pridaj languageCode len ak je to Slovensko
      const requestBody: any = {
        textQuery: searchQuery,
        maxResultCount: maxResults,
      }
      if (languageCode) {
        requestBody.languageCode = languageCode
      }
      
      // Pridaj location bias ak máme súradnice - to obmedzí výsledky na konkrétne mesto
      if (locationBias) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: locationBias.lat,
              longitude: locationBias.lng,
            },
            radius: locationBias.radius || 10000, // 10km default radius
          },
        }
      }
      
      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.types,places.location',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.places && data.places.length > 0) {
            const placesWithPhotos: Place[] = data.places
              .filter((place: any) => place.photos && place.photos.length > 0)
              .slice(0, maxResults)
              .map((place: any) => ({
                place_id: place.id,
                name: place.displayName?.text || place.displayName || 'Unknown',
                formatted_address: place.formattedAddress || '',
                rating: place.rating,
                user_ratings_total: place.userRatingCount || 0,
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
            
            console.log(`✓ Found ${placesWithPhotos.length} places with photos (New API) in ${cityName}${locationBias ? ` (location bias: ${locationBias.lat}, ${locationBias.lng}, radius: ${locationBias.radius}m)` : ''}`)
            
            // Filtruj výsledky - musia obsahovať názov mesta v adrese (ak nie je location bias alebo ako dodatočná kontrola)
            const filteredPlaces = placesWithPhotos.filter((place: Place) => {
              if (!place.formatted_address) return false
              const addressLower = place.formatted_address.toLowerCase()
              const cityLower = cityName.toLowerCase()
              // Skontroluj, či adresa obsahuje názov mesta
              const addressParts = addressLower.split(',').map(p => p.trim())
              const cityInAddress = addressParts.some(part => 
                part.includes(cityLower) || cityLower.includes(part)
              )
              return cityInAddress || addressLower.includes(cityLower)
            })
            
            if (filteredPlaces.length < placesWithPhotos.length) {
              console.log(`  Filtered from ${placesWithPhotos.length} to ${filteredPlaces.length} places in ${cityName} (by address)`)
            }
            
            return filteredPlaces
          } else {
            console.warn(`⚠ Places API (New) returned no places for query: "${searchQuery}"`)
          }
        } else {
          // Response nie je OK - loguj presnú chybu
          const errorText = await response.text().catch(() => 'Could not read error response')
          let errorData: any = {}
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: { message: errorText } }
          }
          console.error(`❌ Places API (New) error [${response.status}]:`, errorData.error?.message || errorData.message || response.statusText)
          console.error(`   Query: "${searchQuery}"`)
          console.error(`   Full error:`, errorData)
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.error('Places API (New) failed:', error.message)
        }
      }
    } catch (error: any) {
      console.error('Places API (New) error:', error.message)
    }
    
    // Fallback na legacy Places API (Text Search) - dočasne, kým sa Places API (New) nepropaguje
    console.warn('⚠ Places API (New) failed, trying legacy API as fallback...')
    
    try {
      const legacyPlaces = await searchPlacesLegacy(cityName, query, maxResults, googleApiKey)
      if (legacyPlaces.length > 0) {
        console.log(`✓ Found ${legacyPlaces.length} places using legacy API`)
        return legacyPlaces
      }
    } catch (legacyError: any) {
      console.error('Legacy Places API also failed:', legacyError.message)
    }
    
    console.warn('⚠ All APIs failed, returning empty array')
    return []
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
  
  // Zisti, či je mesto na Slovensku
  const isSlovakia = isCityInSlovakia(cityName)
  const languageParam = isSlovakia ? '&language=sk' : ''
  
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}${languageParam}&key=${googleApiKey}`
  
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
      const placesWithPhotos = await Promise.all(
        data.results
          .filter((place: any) => place.photos && place.photos.length > 0)
          .slice(0, maxResults)
          .map(async (place: any) => {
            const placeObj: Place = {
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total || 0,
              photos: place.photos,
              types: place.types,
              geometry: place.geometry,
            }
            
            // Skontroluj a prelož názov, ak je to potrebné
            return await ensureSlovakName(placeObj)
          })
      )
      
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
 * Získa URL fotky z Google Place Photos API
 * 
 * Podporuje oba formáty:
 * - Legacy API: photo_reference (dlhý string) → používa maps.googleapis.com
 * - New API: name (v tvare "places/ChIJ.../photos/...") → používa places.googleapis.com
 * 
 * Funkcia automaticky rozpozná formát podľa prefixu "places/"
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

  // Zisti, či je mesto na Slovensku
  const isSlovakia = isCityInSlovakia(cityName)
  const languageCode = isSlovakia ? 'sk' : undefined

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

      // Vytvor request body - pridaj languageCode len ak je to Slovensko
      const requestBody: any = {
        textQuery: searchQuery,
        maxResultCount: 5,
      }
      if (languageCode) {
        requestBody.languageCode = languageCode
      }

      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.types,places.location',
          },
          body: JSON.stringify(requestBody),
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
                  const placeObj: Place = {
                    place_id: place.id,
                    name: foundName,
                    formatted_address: place.formattedAddress || '',
                    rating: place.rating,
                    user_ratings_total: place.userRatingCount || 0,
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
                  
                  // Skontroluj a prelož názov, ak je to potrebné
                  return await ensureSlovakName(placeObj)
                }
              }
            }
            
            // Ak sme nenašli presnú zhodu, vezmeme prvý výsledok s fotkami
            const firstWithPhoto = data.places.find((p: any) => p.photos && p.photos.length > 0)
            if (firstWithPhoto) {
              const foundName = firstWithPhoto.displayName?.text || firstWithPhoto.displayName || ''
              console.log(`⚠ Using first result "${foundName}" for query "${placeName}" (New API, not exact match)`)
              const placeObj: Place = {
                place_id: firstWithPhoto.id,
                name: foundName,
                formatted_address: firstWithPhoto.formattedAddress || '',
                rating: firstWithPhoto.rating,
                user_ratings_total: firstWithPhoto.userRatingCount || 0,
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
              
              // Skontroluj a prelož názov, ak je to potrebné
              return await ensureSlovakName(placeObj)
            }
          } else {
            console.warn(`⚠ Places API (New) returned no places for query: "${searchQuery}"`)
          }
        } else {
          // Response nie je OK - loguj presnú chybu
          const errorText = await response.text().catch(() => 'Could not read error response')
          let errorData: any = {}
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: { message: errorText } }
          }
          console.error(`❌ Places API (New) error [${response.status}] for "${searchQuery}":`, errorData.error?.message || errorData.message || response.statusText)
          console.error(`   Full error:`, errorData)
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
  
  // Fallback na legacy Places API (Text Search) - dočasne, kým sa Places API (New) nepropaguje
  console.warn(`⚠ New Places API failed for "${placeName}", trying legacy API as fallback...`)
  
  for (const searchQuery of uniqueQueries) {
    try {
      const legacyUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&language=sk&key=${googleApiKey}`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const response = await fetch(legacyUrl, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            // Skús nájsť najlepšie zhoda
            for (const place of data.results) {
              if (place.photos && place.photos.length > 0) {
                const placeNameLower = placeName.toLowerCase().trim()
                const foundName = place.name || ''
                const foundNameLower = foundName.toLowerCase().trim()
                
                if (
                  foundNameLower === placeNameLower ||
                  foundNameLower.includes(placeNameLower) ||
                  placeNameLower.includes(foundNameLower) ||
                  calculateSimilarity(placeNameLower, foundNameLower) > 0.7
                ) {
                  console.log(`✓ Found place "${foundName}" for query "${placeName}" (Legacy API, matched: ${searchQuery})`)
                  const placeObj: Place = {
                    place_id: place.place_id,
                    name: foundName,
                    formatted_address: place.formatted_address || '',
                    rating: place.rating,
                    user_ratings_total: place.user_ratings_total || 0,
                    photos: place.photos.map((photo: any) => ({
                      photo_reference: photo.photo_reference,
                      height: photo.height || 800,
                      width: photo.width || 800,
                    })),
                    types: place.types || [],
                    geometry: place.geometry ? {
                      location: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                      }
                    } : undefined,
                  }
                  
                  // Skontroluj a prelož názov, ak je to potrebné
                  return await ensureSlovakName(placeObj)
                }
              }
            }
            
            // Ak sme nenašli presnú zhodu, vezmeme prvý výsledok s fotkami
            const firstWithPhoto = data.results.find((p: any) => p.photos && p.photos.length > 0)
            if (firstWithPhoto) {
              console.log(`✓ Found place "${firstWithPhoto.name}" for query "${placeName}" (Legacy API, first result)`)
              const placeObj: Place = {
                place_id: firstWithPhoto.place_id,
                name: firstWithPhoto.name || '',
                formatted_address: firstWithPhoto.formatted_address || '',
                rating: firstWithPhoto.rating,
                user_ratings_total: firstWithPhoto.user_ratings_total || 0,
                photos: firstWithPhoto.photos.map((photo: any) => ({
                  photo_reference: photo.photo_reference,
                  height: photo.height || 800,
                  width: photo.width || 800,
                })),
                types: firstWithPhoto.types || [],
                geometry: firstWithPhoto.geometry ? {
                  location: {
                    lat: firstWithPhoto.geometry.location.lat,
                    lng: firstWithPhoto.geometry.location.lng,
                  }
                } : undefined,
              }
              
              // Skontroluj a prelož názov, ak je to potrebné
              return await ensureSlovakName(placeObj)
            }
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn(`Legacy Places API failed for "${searchQuery}":`, error.message)
        }
      }
    } catch (error: any) {
      console.warn(`Error with legacy API for query "${searchQuery}":`, error.message)
    }
  }
  
  console.warn(`⚠ All APIs failed for "${placeName}", returning null`)
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

/**
 * Rozhranie pre detailné informácie o mieste z Google Places API
 */
export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  phone_number?: string
  website?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference?: string
    name?: string
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
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
  }>
}

/**
 * Získa detailné informácie o mieste z Google Places API
 */
export async function getPlaceDetails(placeId: string, formattedAddress?: string): Promise<PlaceDetails | null> {
  const googleApiKey = process.env.GOOGLE_API_KEY
  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY nie je nastavený')
  }

  // Zisti jazyk podľa adresy (len ak je to Slovensko)
  const languageCode = formattedAddress ? getLanguageCodeForPlace(formattedAddress) : undefined

  try {
    // Skús najprv nové Places API (New)
    // V novom API je place_id v tvare "places/ChIJ..." alebo len "ChIJ..."
    const normalizedPlaceId = placeId.startsWith('places/') ? placeId : `places/${placeId}`
    
    try {
      const detailsUrl = `https://places.googleapis.com/v1/${normalizedPlaceId}`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      // Pridaj languageCode len ak je to Slovensko
      const urlWithLang = languageCode ? `${detailsUrl}?languageCode=${languageCode}` : detailsUrl
      
      try {
        const response = await fetch(urlWithLang, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,photos,types,location,reviews',
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          const placeDetails: PlaceDetails = {
            place_id: data.id || placeId,
            name: data.displayName?.text || data.displayName || 'Unknown',
            formatted_address: data.formattedAddress || '',
            rating: data.rating,
            user_ratings_total: data.userRatingCount,
            phone_number: data.nationalPhoneNumber,
            website: data.websiteUri,
            opening_hours: data.currentOpeningHours ? {
              open_now: data.currentOpeningHours.openNow,
              weekday_text: data.currentOpeningHours.weekdayDescriptions || [],
            } : undefined,
            photos: data.photos?.map((photo: any) => ({
              name: photo.name,
              photo_reference: photo.name,
              height: photo.heightPx || 800,
              width: photo.widthPx || 800,
            })) || [],
            types: data.types || [],
            geometry: data.location ? {
              location: {
                lat: data.location.latitude,
                lng: data.location.longitude,
              }
            } : undefined,
            reviews: data.reviews?.map((review: any) => ({
              author_name: review.authorAttribution?.displayName || review.authorAttribution?.publisher || 'Anonymous',
              rating: review.rating || 0,
              text: review.text?.text || review.text || '',
              time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : Date.now() / 1000,
            })) || [],
          }
          
          console.log(`✓ Places API (New) details fetched successfully for: ${placeDetails.name}`)
          return placeDetails
        } else {
          const errorText = await response.text().catch(() => 'Could not read error response')
          let errorData: any = {}
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: { message: errorText } }
          }
          console.warn(`⚠ Places API (New) details error [${response.status}]:`, errorData.error?.message || errorData.message || response.statusText)
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn(`⚠ Places API (New) details request failed:`, error.message)
        }
      }
    } catch (error: any) {
      console.warn(`⚠ Error with Places API (New) details:`, error.message)
    }

    // Fallback na legacy Places API Details
    try {
      // Pre legacy API potrebujeme len ID bez "places/" prefixu
      const legacyPlaceId = placeId.replace(/^places\//, '')
      // Zisti jazyk podľa adresy (len ak je to Slovensko)
      const languageParam = languageCode ? `&language=${languageCode}` : ''
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(legacyPlaceId)}&fields=place_id,name,formatted_address,rating,user_ratings_total,formatted_phone_number,website,opening_hours,photos,types,geometry,reviews${languageParam}&key=${googleApiKey}`
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const response = await fetch(detailsUrl, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'OK' && data.result) {
            const result = data.result
            const placeDetails: PlaceDetails = {
              place_id: result.place_id || placeId,
              name: result.name || 'Unknown',
              formatted_address: result.formatted_address || '',
              rating: result.rating,
              user_ratings_total: result.user_ratings_total,
              phone_number: result.formatted_phone_number,
              website: result.website,
              opening_hours: result.opening_hours ? {
                open_now: result.opening_hours.open_now,
                weekday_text: result.opening_hours.weekday_text || [],
              } : undefined,
              photos: result.photos?.map((photo: any) => ({
                photo_reference: photo.photo_reference,
                height: photo.height || 800,
                width: photo.width || 800,
              })) || [],
              types: result.types || [],
              geometry: result.geometry ? {
                location: {
                  lat: result.geometry.location.lat,
                  lng: result.geometry.location.lng,
                }
              } : undefined,
              reviews: result.reviews?.map((review: any) => ({
                author_name: review.author_name || 'Anonymous',
                rating: review.rating || 0,
                text: review.text || '',
                time: review.time || Date.now() / 1000,
              })) || [],
            }
            
            // Skontroluj a prelož názov, ak je to potrebné
            if (isInSlovakia(placeDetails.formatted_address) && isNameInEnglish(placeDetails.name)) {
              placeDetails.name = await translatePlaceNameToSlovak(placeDetails.name)
            }
            
            return placeDetails
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.warn(`⚠ Legacy Places API details request failed:`, error.message)
        }
      }
    } catch (error: any) {
      console.warn(`⚠ Error with legacy Places API details:`, error.message)
    }
  } catch (error: any) {
    console.error(`❌ Error getting place details:`, error)
  }
  
  return null
}


// TypeScript fix verified
// Production build 20251211-070045
