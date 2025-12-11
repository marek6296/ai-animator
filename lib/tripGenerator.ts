import { generateText } from './aiService'
import { searchPlacesInCity, getPlacePhotoUrl, findPlaceByName, getPlaceDetails, type Place } from './placesService'
import type { UserInput, Trip, TripTip } from '@/types'

// Jednoduchá funkcia pre fuzzy matching názvov
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  if (longer.length === 0) return 1.0
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

/**
 * Nová logika podľa požiadaviek:
 * 1. Google Places API - len na miesta a fotky (cez photo_reference)
 * 2. OpenAI - len na itinerár a texty
 * 3. Všetko sa spája cez place_id, nie cez textové matching
 * 4. Nikdy sa nevyhľadávajú fotky podľa textu
 */

export async function generateTrip(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  try {
    // KROK 0: Získaj informácie o root mieste
    const rootPlaceId = input.root_place_id || input.destinationPlaceId
    const mode = input.mode || 'city'
    
    if (!rootPlaceId && !input.destination) {
      throw new Error('Destinácia alebo root_place_id je povinná')
    }

    console.log(`[generateTrip] Starting - mode: ${mode}, root_place_id: ${rootPlaceId || 'N/A'}, destination: ${input.destination || 'N/A'}`)
    
    onProgress?.(5, 'Získavam informácie o mieste...')
    
    let rootPlaceDetails: Place | null = null
    let rootLat: number | undefined
    let rootLng: number | undefined
    let rootTypes: string[] = []
    let rootName = input.destination || 'Neznáme miesto'
    let rootAddress = ''
    
    // Ak máme root_place_id, získaj detaily
    if (rootPlaceId) {
      try {
        const details = await getPlaceDetails(rootPlaceId, input.selectedPlace?.formatted_address)
        if (details) {
          rootPlaceDetails = {
            place_id: details.place_id,
            name: details.name,
            formatted_address: details.formatted_address,
            rating: details.rating,
            photos: details.photos?.map(p => ({
              name: p.name,
              photo_reference: p.name, // Pre kompatibilitu
              height: p.height,
              width: p.width,
            })),
            types: details.types || [],
            geometry: details.geometry || (input.selectedPlace?.geometry ? {
              location: {
                lat: input.selectedPlace.geometry.location.lat,
                lng: input.selectedPlace.geometry.location.lng,
              }
            } : undefined),
          }
          
          // Získaj súradnice z geometry (ak sú dostupné)
          if (details.geometry) {
            rootLat = details.geometry.location.lat
            rootLng = details.geometry.location.lng
          } else if (input.selectedPlace?.geometry) {
            rootLat = input.selectedPlace.geometry.location.lat
            rootLng = input.selectedPlace.geometry.location.lng
          }
          
          rootTypes = details.types || []
          rootName = details.name
          rootAddress = details.formatted_address
          
          // Extrahuj názov mesta z adresy (posledný komponent pred krajinou)
          let rootCity = ''
          if (rootAddress) {
            const addressParts = rootAddress.split(',').map(p => p.trim())
            // Zvyčajne je mesto pred krajinou (napr. "Bratislava, Slovakia" -> "Bratislava")
            if (addressParts.length >= 2) {
              rootCity = addressParts[addressParts.length - 2] || addressParts[0]
            } else {
              rootCity = addressParts[0]
            }
          }
          
          console.log(`[generateTrip] Root place: ${rootName}, city: ${rootCity}, types: ${rootTypes.join(', ')}`)
        }
      } catch (error) {
        console.warn('[generateTrip] Failed to get place details, continuing with fallback:', error)
      }
    }
    
    // Rozhodni sa o režime na základe types (ak nie je explicitne nastavený)
    let finalMode = mode
    if (mode === 'city' && rootTypes.length > 0) {
      const cityTypes = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 
                         'administrative_area_level_3', 'colloquial_area', 'country', 'political']
      const poiTypes = ['point_of_interest', 'tourist_attraction', 'museum', 'park', 'restaurant']
      
      if (rootTypes.some(t => poiTypes.includes(t)) && !rootTypes.some(t => cityTypes.includes(t))) {
        // Je to POI, ale mode je city - zmeň na around
        finalMode = 'around'
        console.log(`[generateTrip] Auto-detected POI, switching mode to 'around'`)
      }
    }
    
    // Pre režim "single" - detail jedného miesta
    if (finalMode === 'single') {
      return await generateSinglePlaceTrip(rootPlaceDetails || {
        place_id: rootPlaceId || '',
        name: rootName,
        formatted_address: rootAddress,
        types: rootTypes,
      }, input, onProgress)
    }
    
    // Pre režim "around" - trip okolo POI
    if (finalMode === 'around') {
      if (!rootLat || !rootLng) {
        throw new Error('Súradnice sú potrebné pre režim "around"')
      }
      return await generateAroundPlaceTrip(rootPlaceDetails || {
        place_id: rootPlaceId || '',
        name: rootName,
        formatted_address: rootAddress,
        types: rootTypes,
        geometry: {
          location: {
            lat: rootLat,
            lng: rootLng,
          }
        }
      }, rootLat, rootLng, input, onProgress)
    }
    
    // Pre režim "city" - klasický trip (pôvodná logika)
    // Extrahuj názov mesta z adresy, ak nie je dostupný
    let rootCity = ''
    if (rootAddress) {
      const addressParts = rootAddress.split(',').map(p => p.trim())
      if (addressParts.length >= 2) {
        rootCity = addressParts[addressParts.length - 2] || addressParts[0]
      } else {
        rootCity = addressParts[0]
      }
    }
    
    // Použij názov mesta z adresy, ak je dostupný, inak použij rootName
    const cityNameForSearch = rootCity || rootName
    
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
    const englishCity = cityTranslations[cityNameForSearch] || cityNameForSearch || input.destination || 'Unknown'
    
    console.log(`[generateTrip] Searching in city: ${cityNameForSearch} (${englishCity}), location: ${rootLat ? `${rootLat}, ${rootLng}` : 'unknown'}`)

    // Získaj rôzne typy miest - len miesta s fotkami
    const places: Place[] = []
    
    // Mapovanie kategórií na Google Places typy (presnejšie, bez všeobecných typov)
    const categoryToTypes: Record<string, string[]> = {
      'attraction': ['museum', 'art_gallery', 'church', 'cathedral', 'monument', 'historical_site', 'castle', 'palace', 'ruins', 'archaeological_site'],
      'activity': ['park', 'natural_feature', 'amusement_park', 'zoo', 'aquarium', 'stadium', 'gym', 'spa', 'bowling_alley', 'movie_theater', 'night_club'],
      'restaurant': ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway', 'meal_delivery'],
      'accommodation': ['lodging', 'hotel', 'motel', 'hostel', 'resort', 'bed_and_breakfast'],
      'tip': [], // Tipy sa generujú AI, nie z Google Places
    }
    
    // Mapovanie záujmov na Google Places typy (pre kompatibilitu)
    const interestToTypes: Record<string, string[]> = {
      'landmarks': ['tourist_attraction', 'point_of_interest'],
      'museums': ['museum', 'art_gallery'],
      'parks': ['park', 'natural_feature'],
      'viewpoints': ['tourist_attraction', 'point_of_interest'],
      'cafes': ['cafe', 'bakery'],
      'restaurants': ['restaurant'],
      'street_food': ['restaurant', 'food'],
      'bars': ['bar'],
      'clubs': ['night_club'],
      'markets': ['shopping_mall', 'store'],
      'kids_activities': ['amusement_park', 'zoo', 'aquarium'],
      'wellness': ['spa', 'gym'],
    }

    // Získaj vybrané kategórie (ak nie sú, použij všetky okrem 'tip')
    // Definujeme selectedCategories na začiatku a použijeme ho v celom scope
    const selectedCategories = input.selectedCategories || ['attraction', 'activity', 'restaurant']
    const searchQueries: string[] = []
    
    // Pridaj typy podľa vybraných kategórií
    for (const category of selectedCategories) {
      if (category !== 'tip') { // Tipy sa nehľadajú v Google Places
        const types = categoryToTypes[category]
        if (types) {
          for (const type of types) {
            if (!searchQueries.includes(type)) {
              searchQueries.push(type)
            }
          }
        }
      }
    }
    
    // Ak má aj záujmy, pridaj ich typy (pre kompatibilitu)
    const userInterests = input.interests || []
    if (userInterests.length > 0) {
      for (const interest of userInterests) {
        const types = interestToTypes[interest]
        if (types) {
          for (const type of types) {
            if (!searchQueries.includes(type)) {
              searchQueries.push(type)
            }
          }
        }
      }
    }
    
    // Ak nemá žiadne typy, pridáme základné (fallback)
    if (searchQueries.length === 0) {
      searchQueries.push('tourist_attraction', 'restaurant', 'park', 'museum')
    }

    // Hľadaj miesta podľa záujmov - použij location bias ak máme súradnice
    let searchIndex = 0
    const locationBias = rootLat && rootLng ? { lat: rootLat, lng: rootLng, radius: 20000 } : undefined // 20km radius
    
    for (const query of searchQueries.slice(0, 10)) { // Max 10 queries
      onProgress?.(10 + searchIndex * 3, `Hľadám ${query}...`)
      try {
        const results = await searchPlacesInCity(englishCity, query, 10, locationBias)
        // Filtruj výsledky - musia obsahovať názov mesta v adrese
        const filteredResults = results.filter(place => {
          if (!place.formatted_address) return false
          const addressLower = place.formatted_address.toLowerCase()
          const cityLower = cityNameForSearch.toLowerCase()
          // Skontroluj, či adresa obsahuje názov mesta
          return addressLower.includes(cityLower) || cityLower.includes(addressLower.split(',')[0]?.toLowerCase() || '')
        })
        places.push(...filteredResults)
        searchIndex++
      } catch (error) {
        console.warn(`Error searching ${query}:`, error)
      }
    }
    
    // Vždy pridáme aj všeobecné turistické atrakcie
    if (!searchQueries.includes('tourist_attraction')) {
      onProgress?.(40, 'Hľadám turistické atrakcie...')
      try {
        const attractions = await searchPlacesInCity(englishCity, 'tourist attractions', 15, locationBias)
        // Filtruj výsledky - musia obsahovať názov mesta v adrese
        const filteredAttractions = attractions.filter(place => {
          if (!place.formatted_address) return false
          const addressLower = place.formatted_address.toLowerCase()
          const cityLower = cityNameForSearch.toLowerCase()
          return addressLower.includes(cityLower) || cityLower.includes(addressLower.split(',')[0]?.toLowerCase() || '')
        })
        places.push(...filteredAttractions)
      } catch (error) {
        console.warn('Error searching attractions:', error)
      }
    }

    // Odstráň duplikáty podľa place_id
    const uniquePlaces = new Map<string, Place>()
    for (const place of places) {
      if (!uniquePlaces.has(place.place_id)) {
        uniquePlaces.set(place.place_id, place)
      }
    }
    let finalPlaces = Array.from(uniquePlaces.values())
    
    // KROK 1.5: Získaj detaily pre top miesta, aby sme zistili aktivitu (recenzie)
    onProgress?.(20, 'Kontrolujem aktivitu miest...')
    const topPlacesForDetails = finalPlaces.slice(0, Math.min(50, finalPlaces.length))
    const placesWithActivity = await Promise.all(
      topPlacesForDetails.map(async (place) => {
        try {
          const { getPlaceDetails, isInSlovakia, isNameInEnglish, translatePlaceNameToSlovak } = await import('./placesService')
          const details = await getPlaceDetails(place.place_id, place.formatted_address)
          if (details && details.reviews && details.reviews.length > 0) {
            // Zisti čas poslednej recenzie a počet nedávnych recenzií
            const now = Date.now() / 1000 // Unix timestamp v sekundách
            const oneYearAgo = now - (365 * 24 * 60 * 60) // Pred rokom
            
            const reviewTimes = details.reviews
              .map(r => r.time)
              .filter(t => t > 0)
              .sort((a, b) => b - a) // Najnovšie prvé
            
            const lastReviewTime = reviewTimes[0] || 0
            const recentReviewsCount = reviewTimes.filter(t => t >= oneYearAgo).length
            
            // Miesto je aktívne, ak má recenziu za posledný rok
            const isActive = lastReviewTime >= oneYearAgo || recentReviewsCount > 0
            
            // Ak NEMÁ recenziu za posledný rok, vráť null (vylúčime ho)
            if (!isActive && lastReviewTime > 0) {
              console.log(`❌ Place "${place.name}" is inactive (last review: ${new Date(lastReviewTime * 1000).toLocaleDateString()}), excluding from results`)
              return null // Vylúč neaktívne miesto
            }
            
            // Skontroluj a prelož názov, ak je to potrebné (details.name môže byť anglický)
            let placeName = place.name
            if (details.name && place.formatted_address) {
              if (isInSlovakia(place.formatted_address) && isNameInEnglish(details.name)) {
                try {
                  placeName = await translatePlaceNameToSlovak(details.name)
                  console.log(`✓ Translated place name in activity check: "${details.name}" → "${placeName}"`)
                } catch (error) {
                  console.warn(`⚠ Failed to translate place name "${details.name}":`, error)
                }
              } else if (isInSlovakia(place.formatted_address) && !isNameInEnglish(details.name)) {
                // Ak details.name už nie je v angličtine, použij ho (môže byť lepší preklad)
                placeName = details.name
              }
            }
            
            return {
              ...place,
              name: placeName, // Použij preložený názov
              last_review_time: lastReviewTime,
              recent_reviews_count: recentReviewsCount,
              is_active: isActive || (place.user_ratings_total || 0) > 0, // Alebo má aspoň nejaké recenzie
            }
          }
        } catch (error) {
          console.warn(`Failed to get details for ${place.name}:`, error)
        }
        return place
      })
    )
    
    // Nahraď top miesta miestami s aktivitou (filtruj null hodnoty - neaktívne miesta)
    const activePlacesFromDetails = placesWithActivity.filter(p => p !== null) as Place[]
    finalPlaces = [...activePlacesFromDetails, ...finalPlaces.slice(placesWithActivity.length)]
    
    // Filtruj podľa vybraných kategórií (použijeme už definovanú premennú selectedCategories)
    const categoryFilteredPlaces = finalPlaces.filter(place => {
      // Mapuj miesto na kategóriu - používame prioritné typy (najšpecifickejšie prvé)
      let placeCategory: string | null = null
      
      const types = place.types || []
      
      // PRIORITA 1: Jedlo a reštaurácie (najšpecifickejšie)
      if (types.some(t => ['restaurant', 'cafe', 'bar', 'food', 'bakery', 'meal_takeaway', 'meal_delivery', 'store', 'supermarket', 'grocery_or_supermarket'].includes(t))) {
        placeCategory = 'restaurant'
      }
      // PRIORITA 2: Ubytovanie
      else if (types.some(t => ['lodging', 'hotel', 'motel', 'hostel', 'resort', 'bed_and_breakfast'].includes(t))) {
        placeCategory = 'accommodation'
      }
      // PRIORITA 3: Aktivity
      else if (types.some(t => ['park', 'natural_feature', 'amusement_park', 'zoo', 'aquarium', 'stadium', 'gym', 'spa', 'bowling_alley', 'movie_theater', 'night_club'].includes(t))) {
        placeCategory = 'activity'
      }
      // PRIORITA 4: Pamiatky (len skutočné pamiatky, nie všeobecné point_of_interest)
      else if (types.some(t => ['museum', 'art_gallery', 'church', 'cathedral', 'monument', 'historical_site', 'castle', 'palace', 'ruins', 'archaeological_site'].includes(t))) {
        placeCategory = 'attraction'
      }
      // PRIORITA 5: Tourist attraction (len ak NEMÁ žiadne typy jedla/reštaurácie)
      else if (types.includes('tourist_attraction') && !types.some(t => ['restaurant', 'cafe', 'bar', 'food', 'store', 'shopping_mall'].includes(t))) {
        placeCategory = 'attraction'
      }
      // PRIORITA 6: Point of interest (len ak NEMÁ žiadne typy jedla/reštaurácie a je to skutočná pamiatka)
      else if (types.includes('point_of_interest') && !types.some(t => ['restaurant', 'cafe', 'bar', 'food', 'store', 'shopping_mall', 'lodging', 'hotel'].includes(t))) {
        // Skontroluj názov - ak obsahuje slová ako "museum", "gallery", "church", atď., je to pamiatka
        const nameLower = place.name.toLowerCase()
        if (nameLower.includes('museum') || nameLower.includes('gallery') || nameLower.includes('church') || 
            nameLower.includes('cathedral') || nameLower.includes('monument') || nameLower.includes('castle') ||
            nameLower.includes('palace') || nameLower.includes('tower') || nameLower.includes('bridge') ||
            nameLower.includes('múzeum') || nameLower.includes('galéria') || nameLower.includes('kostol') ||
            nameLower.includes('hrad') || nameLower.includes('zámok') || nameLower.includes('veža')) {
          placeCategory = 'attraction'
        } else {
          // Ak nie je jasné, čo to je, vylúčime ho (nechceme všeobecné point_of_interest)
          placeCategory = null
        }
      }
      
      // Ak sme nedokázali určiť kategóriu, vylúčime miesto
      if (!placeCategory) {
        console.log(`❌ Excluding place "${place.name}" (unclear category, types: ${types.join(', ')})`)
        return false
      }
      
      // Ak je kategória vybraná, zahrni miesto
      if (selectedCategories.includes(placeCategory as any)) {
        return true
      }
      
      // Ak nie je vybraná, vylúč ho
      console.log(`❌ Excluding place "${place.name}" (category: ${placeCategory}, not in selected: ${selectedCategories.join(', ')}, types: ${types.join(', ')})`)
      return false
    })
    
    // Filtruj neaktívne miesta - vylúč miesta s recenziami staršími ako rok
    const activePlaces = categoryFilteredPlaces.filter(place => {
      // Ak nemá žiadne recenzie, stále ho zahrni (možno je nové miesto)
      if (!place.user_ratings_total || place.user_ratings_total === 0) {
        return true // Nové miesta môžu byť stále relevantné
      }
      
      // Ak má recenzie, MUSÍ mať recenziu za posledný rok, inak ho vylúč
      if (place.last_review_time) {
        const oneYearAgo = Date.now() / 1000 - (365 * 24 * 60 * 60)
        if (place.last_review_time < oneYearAgo) {
          console.log(`❌ Excluding inactive place "${place.name}" (last review: ${new Date(place.last_review_time * 1000).toLocaleDateString()})`)
          return false // Vylúč miesta s recenziami staršími ako rok
        }
        return true // Má recenziu za posledný rok - aktívne miesto
      }
      
      // Ak nemá last_review_time, ale má is_active === false, vylúč ho
      if (place.is_active === false) {
        console.log(`❌ Excluding inactive place "${place.name}" (is_active: false)`)
        return false
      }
      
      // Ak nemá last_review_time, ale má recenzie, zahrni ho (možno sme nedostali detaily)
      return true
    })
    
    // Použij len aktívne miesta - ak sme všetko odfiltrovali, použij aspoň miesta bez recenzií (nové miesta)
    if (activePlaces.length > 0) {
      finalPlaces = activePlaces
      console.log(`[generateTrip] Filtered to ${finalPlaces.length} active places (excluded ${finalPlaces.length - activePlaces.length} inactive)`)
    } else {
      // Fallback: ak sme všetko odfiltrovali, použij len miesta bez recenzií (nové miesta)
      const newPlaces = finalPlaces.filter(p => !p.user_ratings_total || p.user_ratings_total === 0)
      if (newPlaces.length > 0) {
        finalPlaces = newPlaces
        console.log(`[generateTrip] All places with reviews are inactive, using ${newPlaces.length} new places without reviews`)
      } else {
        console.warn(`[generateTrip] ⚠ All places are inactive, but keeping original list to avoid empty results`)
      }
    }
    
    // Zoraď všetky miesta podľa popularity a aktivity - preferuj aktívne miesta s nedávnymi recenziami
    finalPlaces.sort((a, b) => {
      // Base score: rating * log(počet recenzií + 1)
      let scoreA = (a.rating || 0) * Math.log((a.user_ratings_total || 0) + 1)
      let scoreB = (b.rating || 0) * Math.log((b.user_ratings_total || 0) + 1)
      
      // Bonus za aktivitu (nedávne recenzie)
      if (a.is_active && a.recent_reviews_count && a.recent_reviews_count > 0) {
        scoreA += a.recent_reviews_count * 0.5 // Bonus za každú nedávnu recenziu
      }
      if (b.is_active && b.recent_reviews_count && b.recent_reviews_count > 0) {
        scoreB += b.recent_reviews_count * 0.5
      }
      
      // Bonus za veľmi nedávne recenzie (posledný mesiac)
      if (a.last_review_time) {
        const oneMonthAgo = Date.now() / 1000 - (30 * 24 * 60 * 60)
        if (a.last_review_time >= oneMonthAgo) {
          scoreA += 2.0 // Veľký bonus za veľmi nedávne recenzie
        }
      }
      if (b.last_review_time) {
        const oneMonthAgo = Date.now() / 1000 - (30 * 24 * 60 * 60)
        if (b.last_review_time >= oneMonthAgo) {
          scoreB += 2.0
        }
      }
      
      // Penalizácia za neaktívne miesta
      if (a.is_active === false) {
        scoreA *= 0.3 // Výrazne zníž score neaktívnych miest
      }
      if (b.is_active === false) {
        scoreB *= 0.3
      }
      
      return scoreB - scoreA
    })

    console.log(`[generateTrip] Found ${finalPlaces.length} unique places from Google Places API (sorted by popularity and activity)`)

    // KROK 2: Ulož POI len v backende (NIKDY neposielame do OpenAI!)
    onProgress?.(25, 'Pripravujem miesta...')
    
    console.log(`[generateTrip] Stored ${finalPlaces.length} places in backend (NOT sending to OpenAI)`)
    
    // Organizuj miesta podľa typov pre rýchle vyhľadávanie
    const placesByType = new Map<string, Place[]>()
    const placesByCategory = new Map<string, Place[]>()
    
    for (const place of finalPlaces) {
      // Podľa types
      if (place.types) {
        for (const type of place.types) {
          if (!placesByType.has(type)) {
            placesByType.set(type, [])
          }
          placesByType.get(type)!.push(place)
        }
      }
      
      // Podľa kategórií (attraction, restaurant, atď.)
      let category = 'attraction'
      if (place.types?.some(t => ['restaurant', 'cafe', 'bar', 'food'].includes(t))) {
        category = 'restaurant'
      } else if (place.types?.some(t => ['park', 'natural_feature'].includes(t))) {
        category = 'activity'
      } else if (place.types?.some(t => ['museum', 'art_gallery'].includes(t))) {
        category = 'attraction'
      }
      
      if (!placesByCategory.has(category)) {
        placesByCategory.set(category, [])
      }
      placesByCategory.get(category)!.push(place)
    }
    
    // Zoraď miesta v každej kategórii podľa popularity a aktivity
    for (const [category, places] of placesByCategory.entries()) {
      places.sort((a, b) => {
        let scoreA = (a.rating || 0) * Math.log((a.user_ratings_total || 0) + 1)
        let scoreB = (b.rating || 0) * Math.log((b.user_ratings_total || 0) + 1)
        
        // Bonus za aktivitu
        if (a.is_active && a.recent_reviews_count && a.recent_reviews_count > 0) {
          scoreA += a.recent_reviews_count * 0.5
        }
        if (b.is_active && b.recent_reviews_count && b.recent_reviews_count > 0) {
          scoreB += b.recent_reviews_count * 0.5
        }
        
        // Penalizácia za neaktívne miesta
        if (a.is_active === false) scoreA *= 0.3
        if (b.is_active === false) scoreB *= 0.3
        
        return scoreB - scoreA
      })
    }
    
    // Zoraď miesta v každom type podľa popularity a aktivity
    for (const [type, places] of placesByType.entries()) {
      places.sort((a, b) => {
        let scoreA = (a.rating || 0) * Math.log((a.user_ratings_total || 0) + 1)
        let scoreB = (b.rating || 0) * Math.log((b.user_ratings_total || 0) + 1)
        
        // Bonus za aktivitu
        if (a.is_active && a.recent_reviews_count && a.recent_reviews_count > 0) {
          scoreA += a.recent_reviews_count * 0.5
        }
        if (b.is_active && b.recent_reviews_count && b.recent_reviews_count > 0) {
          scoreB += b.recent_reviews_count * 0.5
        }
        
        // Penalizácia za neaktívne miesta
        if (a.is_active === false) scoreA *= 0.3
        if (b.is_active === false) scoreB *= 0.3
        
        return scoreB - scoreA
      })
    }

    // KROK 3: Zavolaj OpenAI s MINIMÁLNYM promptom (iba preferencie, NIE POI!)
    onProgress?.(30, 'Generujem skeleton plánu pomocou AI...')
    
    // Vytvor detailný popis z nových polí (iba preferencie)
    const buildContextDescription = () => {
      const parts: string[] = []
      
      // Základné informácie
      if (input.hasSpecificDates && input.dateFrom && input.dateTo) {
        parts.push(`Termín: ${input.dateFrom} až ${input.dateTo}`)
      } else if (input.duration) {
        parts.push(`Dĺžka výletu: ${input.duration} dní`)
      }
      
      if (input.adults) {
        parts.push(`Počet dospelých: ${input.adults}`)
        if (input.children && input.children > 0) {
          parts.push(`Počet detí: ${input.children}`)
        }
      }
      
      if (input.travelType) {
        const travelTypes: Record<string, string> = {
          solo: 'solo cestovateľ',
          couple: 'pár',
          family: 'rodina',
          group: 'partia'
        }
        parts.push(`Typ cestovania: ${travelTypes[input.travelType]}`)
      }
      
      if (input.budget) {
        const budgetLabels: Record<string, string> = {
          low: 'nízky',
          medium: 'stredný',
          high: 'luxusný'
        }
        parts.push(`Rozpočet: ${budgetLabels[input.budget]}`)
      }
      
      // Štýl výletu
      if (input.tripGoals && input.tripGoals.length > 0) {
        const goalLabels: Record<string, string> = {
          relax: 'Relax / Chill',
          city_tourism: 'Mestská turistika',
          party: 'Party / Nočný život',
          gastronomy: 'Gastronómia',
          nature: 'Príroda & výlety',
          culture: 'Kultúra & múzeá',
          shopping: 'Nákupy',
          romance: 'Romantika',
          family: 'Rodinný výlet'
        }
        parts.push(`Ciele tripu: ${input.tripGoals.map(g => goalLabels[g] || g).join(', ')}`)
      }
      
      if (input.programPace) {
        const paceLabels: Record<string, string> = {
          relaxed: 'Voľné tempo (max 2 aktivity denne)',
          balanced: 'Vyvážené tempo',
          intensive: 'Nabitý program (čo najviac vecí)'
        }
        parts.push(`Tempo programu: ${paceLabels[input.programPace]}`)
      }
      
      // Záujmy
      if (input.interests && input.interests.length > 0) {
        const interestLabels: Record<string, string> = {
          landmarks: 'Pamätihodnosti',
          museums: 'Múzeá / Galérie',
          parks: 'Parky / Príroda',
          viewpoints: 'Výhľady / Vyhliadky',
          cafes: 'Kaviarne',
          restaurants: 'Reštaurácie',
          street_food: 'Street food',
          bars: 'Bary',
          clubs: 'Kluby',
          markets: 'Lokálne trhy',
          kids_activities: 'Detské aktivity',
          wellness: 'Wellness / Spa'
        }
        const interestsList = input.interests.map(i => interestLabels[i] || i)
        if (input.preferredInterests && input.preferredInterests.length > 0) {
          const preferred = input.preferredInterests.map(i => interestLabels[i] || i)
          parts.push(`Záujmy: ${interestsList.join(', ')} (najdôležitejšie: ${preferred.join(', ')})`)
        } else {
          parts.push(`Záujmy: ${interestsList.join(', ')}`)
        }
      }
      
      // Doprava
      if (input.transportation) {
        const transportLabels: Record<string, string> = {
          walk_public: 'Pešo + MHD',
          walk_only: 'Len pešo (krátke vzdialenosti)',
          car: 'Auto',
          taxi: 'Taxi / Uber'
        }
        parts.push(`Doprava: ${transportLabels[input.transportation]}`)
      }
      
      if (input.maxWalkingMinutes) {
        parts.push(`Max. chodenie pešo medzi miestami: ${input.maxWalkingMinutes} minút`)
      }
      
      // Špeciálne požiadavky
      const specialNeeds: string[] = []
      if (input.accessibilityNeeds) specialNeeds.push('bezbariérový prístup')
      if (input.avoidStairs) specialNeeds.push('bez schodov / náročných túr')
      if (input.travelingWithPet) specialNeeds.push('cestovanie so psom')
      if (specialNeeds.length > 0) {
        parts.push(`Špeciálne požiadavky: ${specialNeeds.join(', ')}`)
      }
      
      // Jedlo
      if (input.dietaryRestrictions && input.dietaryRestrictions !== 'none') {
        const dietLabels: Record<string, string> = {
          vegetarian: 'Vegetarián',
          vegan: 'Vegan',
          gluten_free: 'Bezlepkové',
          lactose_free: 'Bez laktózy',
          other: input.dietaryOther || 'Iné obmedzenia'
        }
        parts.push(`Stravovanie: ${dietLabels[input.dietaryRestrictions]}`)
      }
      
      if (input.foodPreferences && input.foodPreferences.length > 0) {
        const foodLabels: Record<string, string> = {
          local: 'Lokálna kuchyňa',
          european: 'Európska',
          asian: 'Ázijská',
          street_food: 'Street food',
          fine_dining: 'Fine dining'
        }
        parts.push(`Typ jedla: ${input.foodPreferences.map(f => foodLabels[f] || f).join(', ')}`)
      }
      
      // Detail itinerára
      if (input.itineraryDetail) {
        const detailLabels: Record<string, string> = {
          list: 'Len zoznam miest a odporúčaní',
          basic: 'Základný plán po dňoch (ráno/obed/večer)',
          detailed: 'Detailný plán po hodinách'
        }
        parts.push(`Úroveň detailu: ${detailLabels[input.itineraryDetail]}`)
      }
      
      return parts.join('\n')
    }

    const contextDescription = buildContextDescription()

    // KROK 3: AI dostane iba preferencie, nie POI zoznam (10x lacnejšie!)
    // Použijeme už definovanú premennú selectedCategories
    const categoryInstructions = selectedCategories.map(cat => {
      switch(cat) {
        case 'attraction': return '3-4 attraction (pamiatky, múzeá, historické miesta)'
        case 'activity': return '2-3 activity (aktivity, zábava, športy)'
        case 'restaurant': return '2-3 restaurant (reštaurácie, kaviarne, jedlo)'
        case 'accommodation': return '1-2 accommodation (ubytovanie, hotely)'
        case 'tip': return '1-2 tip (užitočné tipy, rady)'
        default: return ''
      }
    }).filter(Boolean).join(', ')
    
    const aiPrompt = `Vytvor skeleton plán výletu do ${input.destination} v Európe.

KONTEKT O CESTOVATEĽOVI:
${contextDescription || 'Žiadne špecifické preferencie'}

VYBRANÉ KATEGÓRIE (použi LEN tieto):
${selectedCategories.map(cat => {
  switch(cat) {
    case 'attraction': return '- attraction (pamiatky, múzeá, historické miesta)'
    case 'activity': return '- activity (aktivity, zábava, športy)'
    case 'restaurant': return '- restaurant (reštaurácie, kaviarne, jedlo)'
    case 'accommodation': return '- accommodation (ubytovanie, hotely)'
    case 'tip': return '- tip (užitočné tipy, rady, praktické informácie)'
    default: return ''
  }
}).filter(Boolean).join('\n')}

DÔLEŽITÉ: NEPOUŽÍVAJ konkrétne názvy miest. Namiesto toho použij GENERICKÉ KATEGÓRIE, napríklad:
- "top museum" (najlepšie múzeum)
- "best viewpoint" (najlepšia vyhliadka)
- "famous attraction" (známa atrakcia)
- "local restaurant" (lokálna reštaurácia)
- "hidden gem" (skrytý poklad)
- "popular park" (obľúbený park)
- "romantic cafe" (romantická kaviareň)
- "street food spot" (miesto so street food)
- "nightlife area" (nočný život)
- "shopping district" (nákupná štvrť)

Vytvor 10-12 tipov na výlet. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [GENERICKÁ KATEGÓRIA] | [Kategória] | [Krátky popis 20-30 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [GENERICKÁ KATEGÓRIA] | [Kategória] | [Popis] | [Trvanie] | [Cena]
Tip 3: [GENERICKÁ KATEGÓRIA] | [Kategória] | [Popis] | [Trvanie] | [Cena]
... (pokračuj až do Tip 12)

Kategórie (použi presne tieto hodnoty a LEN tie, ktoré sú vo VYBRANÝCH KATEGÓRIACH vyššie):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Prvé pole MUSÍ byť GENERICKÁ KATEGÓRIA (nie konkrétny názov miesta!)
3. Všetky polia MUSIA byť oddelené znakom | (pipe)
4. Všetky texty MUSIA byť v slovenčine
5. Vytvor MINIMÁLNE 10 tipov, ideálne 12
6. Zahrň LEN vybrané kategórie: ${categoryInstructions}
7. NEPOUŽÍVAJ kategórie, ktoré NIE SÚ vo VYBRANÝCH KATEGÓRIACH vyššie!

Príklad správneho formátu:
Tip 1: top museum | attraction | Najlepšie múzeum v meste s rozsiahlymi zbierkami... | 2-3 hodiny | €10-15
Tip 2: local restaurant | restaurant | Tradičná reštaurácia s lokálnou kuchyňou... | 1-2 hodiny | €30-50

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`

    const skeletonText = await generateText(aiPrompt)
    onProgress?.(40, 'Spracovávam skeleton plán...')
    
    console.log('[generateTrip] AI skeleton response:', skeletonText.substring(0, 500))
    console.log('[generateTrip] AI response length:', skeletonText.length, 'tokens (vs old ~20000 tokens)')
    
    // KROK 4: Parsuj skeleton a automaticky doplň konkrétne POI
    onProgress?.(45, 'Doplňujem konkrétne miesta...')
    
    const tips = parseSkeletonAndMatchPlaces(skeletonText, placesByCategory, placesByType, finalPlaces)
    
    console.log(`[generateTrip] Matched ${tips.length} places from skeleton`)
    
    if (tips.length === 0) {
      // Fallback - vytvor tipy z top miest
      console.warn('Skeleton parsing failed, using top places as fallback')
      const fallbackTips: ParsedTip[] = finalPlaces.slice(0, 10).map((place) => ({
        place_id: place.place_id,
        category: place.types?.some(t => ['restaurant', 'cafe'].includes(t)) ? 'restaurant' : 'attraction',
        description: '',
      }))
      return await generateTripWithTips(fallbackTips, finalPlaces, input, onProgress)
    }
    
    // KROK 5: Voliteľne - AI doplní krátky text pre max 10 miest (lacné!)
    if (tips.length > 0 && tips.length <= 10) {
      onProgress?.(50, 'Generujem krátke popisy...')
      
      const placesForText = tips.slice(0, 10).map((tip, index) => {
        const place = finalPlaces.find(p => p.place_id === tip.place_id)
        return place ? `${index + 1}. ${place.name} (${tip.category})` : null
      }).filter(Boolean).join('\n')
      
      const textPrompt = `Pre tieto miesta vytvor krátky popis (50-80 slov) v slovenčine:

${placesForText}

Formát:
1. [krátky popis]
2. [krátky popis]
...

Všetko v slovenčine.`
      
      try {
        const descriptionsText = await generateText(textPrompt)
        const descriptionLines = descriptionsText.split('\n').filter(l => l.trim().match(/^\d+\./))
        
        for (let i = 0; i < Math.min(tips.length, descriptionLines.length); i++) {
          const descMatch = descriptionLines[i].match(/^\d+\.\s*(.+)$/)
          if (descMatch) {
            tips[i].description = descMatch[1].trim()
          }
        }
      } catch (error) {
        console.warn('Failed to generate descriptions, continuing without:', error)
      }
    }
    
    // KROK 6: Spoj place_id s miestami z Google Places a získaj fotky
    return await generateTripWithTips(tips, finalPlaces, input, onProgress)
  } catch (error: any) {
    console.error(`[generateTrip] Error for destination ${input.destination}:`, error)
    console.error(`[generateTrip] Error stack:`, error.stack)
    throw error
  }
}

interface ParsedTip {
  place_id: string
  category: TripTip['category']
  description: string
  duration?: string
  price?: string
  placeName?: string // Pôvodný názov miesta (pre generateTripWithoutPlaces)
}

/**
 * Parsuje skeleton plán z AI a automaticky doplní konkrétne POI z Google Places
 */
function parseSkeletonAndMatchPlaces(
  skeletonText: string,
  placesByCategory: Map<string, Place[]>,
  placesByType: Map<string, Place[]>,
  allPlaces: Place[]
): ParsedTip[] {
  const tips: ParsedTip[] = []
  const usedPlaceIds = new Set<string>()
  
  // Mapovanie kategórií z AI na Google Places typy a kritériá
  const categoryMapping: Record<string, {
    types?: string[]
    category: TripTip['category']
    criteria: (place: Place) => boolean
  }> = {
    'top museum': {
      types: ['museum', 'art_gallery'],
      category: 'attraction',
      criteria: (p) => (p.rating || 0) >= 4.5 && (p.types?.some(t => ['museum', 'art_gallery'].includes(t)) || false)
    },
    'best viewpoint': {
      types: ['tourist_attraction', 'point_of_interest'],
      category: 'attraction',
      criteria: (p) => (p.rating || 0) >= 4.4 && (p.name.toLowerCase().includes('view') || p.name.toLowerCase().includes('vyhliad') || false)
    },
    'famous attraction': {
      types: ['tourist_attraction', 'point_of_interest'],
      category: 'attraction',
      criteria: (p) => (p.rating || 0) >= 4.3
    },
    'local restaurant': {
      types: ['restaurant', 'cafe'],
      category: 'restaurant',
      criteria: (p) => (p.rating || 0) >= 4.0 && (p.types?.some(t => ['restaurant', 'cafe'].includes(t)) || false)
    },
    'hidden gem': {
      category: 'attraction',
      criteria: (p) => (p.rating || 0) >= 4.6 && (!p.name.toLowerCase().includes('museum') || false) // Vysoký rating, menej známe
    },
    'popular park': {
      types: ['park', 'natural_feature'],
      category: 'activity',
      criteria: (p) => (p.types?.some(t => ['park', 'natural_feature'].includes(t)) || false)
    },
    'fine dining': {
      types: ['restaurant'],
      category: 'restaurant',
      criteria: (p) => (p.rating || 0) >= 4.5 && (p.types?.includes('restaurant') || false)
    },
    'street food': {
      types: ['restaurant', 'food'],
      category: 'restaurant',
      criteria: (p) => (p.types?.some(t => ['restaurant', 'food'].includes(t)) || false)
    },
    'local market': {
      types: ['shopping_mall', 'store'],
      category: 'activity',
      criteria: (p) => (p.types?.some(t => ['shopping_mall', 'store'].includes(t)) || false)
    },
    'evening walk': {
      category: 'activity',
      criteria: (p) => (p.types?.some(t => ['park', 'natural_feature'].includes(t)) || false)
    },
    'cultural site': {
      types: ['museum', 'art_gallery', 'tourist_attraction'],
      category: 'attraction',
      criteria: (p) => (p.types?.some(t => ['museum', 'art_gallery', 'tourist_attraction'].includes(t)) || false)
    },
  }
  
  // Parsuj skeleton text - hľadaj kategórie
  const lines = skeletonText.split('\n').filter(line => line.trim().length > 0)
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Preskoč hlavičky dní
    if (trimmed.match(/^Deň\s+\d+:/i) || trimmed.match(/^Day\s+\d+:/i)) {
      continue
    }
    
    // Hľadaj kategóriu (začína s "-" alebo číslom)
    const categoryMatch = trimmed.match(/^[-•\d.]+\s*(.+?)$/i)
    if (!categoryMatch) continue
    
    const categoryText = categoryMatch[1].toLowerCase().trim()
    
    // Nájdi mapovanie pre túto kategóriu
    let matchedMapping: typeof categoryMapping[string] | null = null
    for (const [key, mapping] of Object.entries(categoryMapping)) {
      if (categoryText.includes(key.toLowerCase())) {
        matchedMapping = mapping
        break
      }
    }
    
    if (!matchedMapping) {
      // Fallback - skús nájsť podľa všeobecných slov
      if (categoryText.includes('museum') || categoryText.includes('múzeum')) {
        matchedMapping = categoryMapping['top museum']
      } else if (categoryText.includes('restaurant') || categoryText.includes('reštaurácia') || categoryText.includes('jedlo')) {
        matchedMapping = categoryMapping['local restaurant']
      } else if (categoryText.includes('park') || categoryText.includes('park')) {
        matchedMapping = categoryMapping['popular park']
      } else if (categoryText.includes('attraction') || categoryText.includes('pamiatka')) {
        matchedMapping = categoryMapping['famous attraction']
      }
    }
    
    if (matchedMapping) {
      // Nájdi najlepšie miesto podľa kritérií
      let bestPlace: Place | null = null
      
      // Skús najprv podľa kategórie
      const categoryPlaces = placesByCategory.get(matchedMapping.category) || []
      for (const place of categoryPlaces) {
        if (!usedPlaceIds.has(place.place_id) && matchedMapping.criteria(place)) {
          bestPlace = place
          break
        }
      }
      
      // Ak nenašiel, skús podľa types
      if (!bestPlace && matchedMapping.types) {
        for (const type of matchedMapping.types) {
          const typePlaces = placesByType.get(type) || []
          for (const place of typePlaces) {
            if (!usedPlaceIds.has(place.place_id) && matchedMapping.criteria(place)) {
              bestPlace = place
              break
            }
          }
          if (bestPlace) break
        }
      }
      
      // Ak stále nenašiel, vezmi najlepšie miesto z kategórie
      if (!bestPlace) {
        const categoryPlaces = placesByCategory.get(matchedMapping.category) || []
        for (const place of categoryPlaces) {
          if (!usedPlaceIds.has(place.place_id)) {
            bestPlace = place
            break
          }
        }
      }
      
      // Ak stále nenašiel, vezmi akékoľvek miesto
      if (!bestPlace) {
        for (const place of allPlaces) {
          if (!usedPlaceIds.has(place.place_id)) {
            bestPlace = place
            break
          }
        }
      }
      
      if (bestPlace) {
        usedPlaceIds.add(bestPlace.place_id)
        tips.push({
          place_id: bestPlace.place_id,
          category: matchedMapping.category,
          description: '', // Doplníme neskôr cez AI (voliteľne)
          duration: undefined,
          price: undefined,
        })
        console.log(`✓ Matched "${categoryText}" → ${bestPlace.name} (${bestPlace.place_id})`)
      }
    }
  }
  
  return tips
}

function parseTipsByName(
  tipsText: string,
  nameToPlaceId: Map<string, string>
): ParsedTip[] {
  const tips: ParsedTip[] = []
  
  if (!tipsText || tipsText.trim().length === 0) {
    console.warn('Empty tips text')
    return tips
  }
  
  console.log('Raw tips text:', tipsText.substring(0, 1000))
  
  // Regex pre formát: Tip X: Názov | category | description | duration | price
  const tipRegex = /(?:Tip\s*)?\d+[.:]\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\|\s*(.+?)\s*(?:\|\s*(.+?))?)?(?=\s*(?:Tip\s*)?\d+[.:]|$)/gis
  
  const matches = Array.from(tipsText.matchAll(tipRegex))
  
  console.log(`Found ${matches.length} matches with regex`)
  
  if (matches.length > 0) {
    for (const match of matches) {
      const placeName = match[1]?.trim() || ''
      const category = (match[2]?.trim().toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
      const description = match[3]?.trim() || ''
      const duration = match[4]?.trim() || ''
      const price = match[5]?.trim() || ''
      
      // Nájdeme place_id podľa názvu
      const placeNameLower = placeName.toLowerCase().trim()
      let place_id = nameToPlaceId.get(placeNameLower)
      
      // Ak sme nenašli presnú zhodu, skúsime viacero variantov
      if (!place_id) {
        // Variant bez diakritiky
        const nameNoDiacritics = placeNameLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        place_id = nameToPlaceId.get(nameNoDiacritics)
        
        if (!place_id) {
          // Variant bez článkov
          const nameCleaned = placeNameLower.replace(/^(the|a|an|le|la|les|der|die|das|il|lo|gli|le|el|los|las)\s+/i, '').trim()
          place_id = nameToPlaceId.get(nameCleaned)
        }
        
        if (!place_id) {
          // Variant len s prvými slovami
          const firstWords = placeNameLower.split(/\s+/).slice(0, 3).join(' ')
          place_id = nameToPlaceId.get(firstWords)
        }
        
        // Ak stále nemáme, skúsime fuzzy match
        if (!place_id) {
          let bestMatch: { similarity: number; id: string } | null = null
          for (const [name, id] of nameToPlaceId.entries()) {
            const similarity = calculateSimilarity(placeNameLower, name)
            if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
              bestMatch = { similarity, id }
            }
            // Tiež skúsime či jeden obsahuje druhý
            if (name.includes(placeNameLower) || placeNameLower.includes(name)) {
              if (!bestMatch || similarity > bestMatch.similarity) {
                bestMatch = { similarity: 0.9, id }
              }
            }
          }
          if (bestMatch) {
            place_id = bestMatch.id
            console.log(`✓ Found fuzzy match: "${placeName}" -> place_id: ${place_id} (similarity: ${bestMatch.similarity.toFixed(2)})`)
          }
        }
      } else {
        console.log(`✓ Found exact match: "${placeName}" -> place_id: ${place_id}`)
      }
      
      // Validácia kategórie
      const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
      const finalCategory = validCategories.includes(category as TripTip['category']) 
        ? (category as TripTip['category'])
        : 'attraction'
      
      if (place_id && description && description.length > 20) {
        tips.push({
          place_id,
          category: finalCategory,
          description,
          duration: duration || undefined,
          price: price || undefined,
        })
        console.log(`✓ Parsed tip: place_name="${placeName}" -> place_id="${place_id}", category="${finalCategory}"`)
      } else {
        console.warn(`Skipping invalid tip: place_name="${placeName}" (place_id: ${place_id || 'NOT FOUND'}), desc="${description.substring(0, 30)}" (length: ${description.length})`)
      }
    }
  }
  
  // Fallback: Skús rozdeliť podľa riadkov s "|"
  if (tips.length === 0) {
    console.log('Trying fallback parsing method')
    const lines = tipsText.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 10 && trimmed.includes('|')
    })
    
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i]
      const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0)
      
      // Odstráň číslo na začiatku ak existuje
      let placeName = parts[0] || ''
      placeName = placeName.replace(/^(?:Tip\s*)?\d+[.:]\s*/, '').trim()
      
      if (parts.length >= 3 && placeName) {
        // Nájdeme place_id podľa názvu
        const placeNameLower = placeName.toLowerCase().trim()
        let place_id = nameToPlaceId.get(placeNameLower)
        
        if (!place_id) {
          for (const [name, id] of nameToPlaceId.entries()) {
            if (name.includes(placeNameLower) || placeNameLower.includes(name)) {
              place_id = id
              break
            }
          }
        }
        
        if (place_id) {
          const category = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
          const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
          const finalCategory = validCategories.includes(category as TripTip['category']) 
            ? (category as TripTip['category'])
            : 'attraction'
          
          tips.push({
            place_id: place_id,
            category: finalCategory,
            description: parts[2] || parts[1] || line,
            duration: parts[3] || undefined,
            price: parts[4] || undefined,
          })
          console.log(`✓ Parsed tip (fallback): place_name="${placeName}" -> place_id="${place_id}"`)
        }
      }
    }
  }
  
  console.log(`Final parsed tips count: ${tips.length}`)
  
  if (tips.length === 0) {
    console.error('Failed to parse any tips. Full text:', tipsText)
  }
  
  return tips.slice(0, 12) // Max 12 tipov
}

function parseTipsSimple(
  tipsText: string,
  nameToPlaceId: Map<string, string>
): ParsedTip[] {
  const tips: ParsedTip[] = []
  
  // Najjednoduchšia metóda: nájdi názvy miest v texte a vytvor tipy
  const lines = tipsText.split('\n').filter(line => line.trim().length > 5)
  
  for (const line of lines) {
    for (const [name, place_id] of nameToPlaceId.entries()) {
      if (line.toLowerCase().includes(name.toLowerCase()) && !tips.find(t => t.place_id === place_id)) {
        // Skús extrahovať kategóriu a popis z riadku
        const parts = line.split('|').map(p => p.trim())
        let category: TripTip['category'] = 'attraction'
        let description = line
        
        if (parts.length >= 2) {
          const categoryStr = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
          const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
          if (validCategories.includes(categoryStr as TripTip['category'])) {
            category = categoryStr as TripTip['category']
          }
          description = parts[2] || parts[1] || line
        }
        
        // Vytvor jednoduchý tip
        tips.push({
          place_id: place_id,
          category: category,
          description: description.substring(0, 500) || `Navštívte ${name}`,
          duration: parts[3] || undefined,
          price: parts[4] || undefined,
        })
        console.log(`✓ Simple parsed tip: "${name}" -> place_id="${place_id}"`)
        break
      }
    }
    
    if (tips.length >= 12) break
  }
  
  return tips.slice(0, 12)
}

/**
 * Parsuje tipy bez place_id - len názvy miest a popisy
 */
function parseTipsWithoutPlaceId(tipsText: string): ParsedTip[] {
  const tips: ParsedTip[] = []
  
  if (!tipsText || tipsText.trim().length === 0) {
    return tips
  }
  
  // Regex pre formát: Tip X: Názov | category | description | duration | price
  const tipRegex = /(?:Tip\s*)?\d+[.:]\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\|\s*(.+?)\s*(?:\|\s*(.+?))?)?(?=\s*(?:Tip\s*)?\d+[.:]|$)/gis
  
  const matches = Array.from(tipsText.matchAll(tipRegex))
  
  for (const match of matches) {
    const placeName = match[1]?.trim() || ''
    const category = (match[2]?.trim().toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
    const description = match[3]?.trim() || ''
    const duration = match[4]?.trim() || ''
    const price = match[5]?.trim() || ''
    
    const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
    const finalCategory = validCategories.includes(category as TripTip['category']) 
      ? (category as TripTip['category'])
      : 'attraction'
    
    if (placeName && description && description.length > 20) {
      // Vytvor fake place_id z názvu (pre kompatibilitu)
      const fakePlaceId = `AI_${placeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`
      
      tips.push({
        place_id: fakePlaceId,
        category: finalCategory,
        description,
        duration: duration || undefined,
        price: price || undefined,
        placeName: placeName, // Ulož pôvodný názov
      })
    }
  }
  
  return tips.slice(0, 12)
}

/**
 * Spojí parsované tipy s miestami z Google Places a vytvorí finálny Trip objekt
 */
async function generateTripWithTips(
  tips: ParsedTip[],
  finalPlaces: Place[],
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  // KROK 4: Spoj place_id s miestami z Google Places a získaj fotky
  onProgress?.(60, 'Spárujem miesta s fotkami...')
  const tipsWithImages: TripTip[] = []
  const addedPlaceIds = new Set<string>() // Track pridané place_id, aby sme zabránili duplikátom
  
  // Vytvor mapu place_id -> Place pre rýchle vyhľadávanie
  const placesMap = new Map<string, Place>()
  for (const place of finalPlaces) {
    placesMap.set(place.place_id, place)
  }
  
  // Odstráň duplikáty podľa place_id pred spracovaním
  const uniqueTipsMap = new Map<string, ParsedTip>()
  for (const tip of tips) {
    if (tip.place_id && !uniqueTipsMap.has(tip.place_id)) {
      uniqueTipsMap.set(tip.place_id, tip)
    }
  }
  const uniqueTips = Array.from(uniqueTipsMap.values())
  
  console.log(`[generateTripWithTips] Processing ${uniqueTips.length} unique tips (from ${tips.length} total)`)
  
  for (let i = 0; i < uniqueTips.length; i++) {
    const tip = uniqueTips[i]
    const progress = 60 + (i / uniqueTips.length) * 20
    
    // Skontroluj, či už sme toto miesto pridali
    if (addedPlaceIds.has(tip.place_id)) {
      console.log(`⚠ Skipping duplicate place_id: ${tip.place_id}`)
      continue
    }
    
    onProgress?.(progress, `Spárujem: ${tip.place_id}...`)
    
    try {
      // Nájdeme miesto podľa place_id - žiadne textové matching!
      let place = placesMap.get(tip.place_id)
      
      // Ak sme nenašli miesto podľa place_id, skúsime nájsť podľa názvu (fallback)
      if (!place) {
        console.warn(`⚠ Place not found by place_id "${tip.place_id}", trying to find by name...`)
        
        // Skúsime nájsť miesto podľa názvu v finalPlaces
        // Najprv skúsime nájsť v AI odpovedi názov miesta (ak máme description)
        const descriptionLower = tip.description.toLowerCase()
        let bestMatch: { place: Place; score: number } | null = null
        
        for (const p of finalPlaces) {
          const placeNameLower = p.name.toLowerCase()
          let score = 0
          
          // Presná zhoda názvu v description
          if (descriptionLower.includes(placeNameLower)) {
            score += 10
          }
          
          // Čiastočná zhoda
          const placeNameWords = placeNameLower.split(/\s+/)
          let matchingWords = 0
          for (const word of placeNameWords) {
            if (word.length > 3 && descriptionLower.includes(word)) {
              matchingWords++
            }
          }
          score += matchingWords * 2
          
          // Fuzzy similarity
          const similarity = calculateSimilarity(descriptionLower, placeNameLower)
          score += similarity * 5
          
          if (score > 5 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { place: p, score }
          }
        }
        
        if (bestMatch && bestMatch.score > 5) {
          place = bestMatch.place
          console.log(`✓ Found place by description match: "${place.name}" (score: ${bestMatch.score.toFixed(2)})`)
        } else {
          // Ak stále nemáme, skúsime nájsť pomocou findPlaceByName
          console.warn(`⚠ Still no place found, trying findPlaceByName...`)
          
          // Extrahuj názov z description alebo place_id
          const placeNameFromDescription = tip.description.split(' ').slice(0, 3).join(' ')
          const placeName = placeNameFromDescription || tip.place_id.replace(/^AI_/, '').replace(/_\d+$/, '').replace(/_/g, ' ')
          
          try {
            const foundPlace = await findPlaceByName(placeName, input.destination || '')
            if (foundPlace && foundPlace.photos && foundPlace.photos.length > 0) {
              place = foundPlace
              console.log(`✓ Found place by findPlaceByName: ${foundPlace.name}`)
            }
          } catch (searchError) {
            console.warn(`⚠ findPlaceByName failed for "${placeName}":`, searchError)
          }
        }
      }
      
      let imageUrl: string = ''
      let photo_reference: string | undefined
      let coordinates: { lat: number; lng: number } | undefined
      
      if (place && place.photos && place.photos.length > 0) {
        // Použijeme photo_reference z Google Places - VŽDY cez Place Photos API
        const firstPhoto = place.photos[0]
        // Podporujeme oba formáty: photo_reference (legacy) a name (new API)
        photo_reference = (firstPhoto.photo_reference || firstPhoto.name || '') as string
        
        if (!photo_reference) {
          console.error(`⚠ Place "${place.name}" has photos array but no photo_reference or name!`, firstPhoto)
          throw new Error('Photo reference missing')
        }
        
        imageUrl = getPlacePhotoUrl(photo_reference, 800)
        
        // Ulož prvých 3 photo references pre animáciu pri hover
        const photoReferences: string[] = []
        for (let i = 0; i < Math.min(3, place.photos.length); i++) {
          const photo = place.photos[i]
          const ref = (photo.photo_reference || photo.name || '') as string
          if (ref) {
            photoReferences.push(ref)
          }
        }
        
        if (place.geometry?.location) {
          coordinates = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          }
        }
        
        console.log(`✓ Found place for place_id "${tip.place_id}": ${place.name}`)
        console.log(`  Photo reference: ${photo_reference.substring(0, 50)}...`)
        console.log(`  Image URL: ${imageUrl.substring(0, 100)}...`)
        console.log(`  Photo references for hover: ${photoReferences.length}`)
      } else {
        // Ak miesto nemá fotku, skúsime nájsť miesto podľa názvu pomocou Places API
        console.warn(`⚠ Place "${tip.place_id}" not found or has no photo, trying to search by name...`)
        
        // Extrahuj názov z place_id (ak je to fake AI_ place_id)
        const placeName = tip.place_id.replace(/^AI_/, '').replace(/_\d+$/, '').replace(/_/g, ' ')
        
        try {
          const foundPlace = await findPlaceByName(placeName, input.destination || '')
          if (foundPlace && foundPlace.photos && foundPlace.photos.length > 0) {
            const firstPhoto = foundPlace.photos[0]
            photo_reference = firstPhoto.photo_reference || firstPhoto.name || ''
            
            if (!photo_reference) {
              throw new Error('Photo reference missing from found place')
            }
            
            imageUrl = getPlacePhotoUrl(photo_reference, 800)
            place = foundPlace
            console.log(`✓ Found place by name search: ${foundPlace.name}`)
            console.log(`  Photo reference: ${photo_reference.substring(0, 50)}...`)
            console.log(`  Image URL: ${imageUrl.substring(0, 100)}...`)
          } else {
            throw new Error('Place not found or has no photos')
          }
        } catch (searchError) {
          console.error(`Failed to find place by name "${placeName}":`, searchError)
          // Použijeme placeholder ako posledný fallback
          const placeholderText = encodeURIComponent(placeName.substring(0, 30))
          imageUrl = `https://placehold.co/800x600/1a1a2e/00ffff?text=${placeholderText}`
        }
      }
      
      // Skontroluj, či už sme toto miesto pridali (dvojitá kontrola)
      if (!addedPlaceIds.has(tip.place_id)) {
        addedPlaceIds.add(tip.place_id)
        
        // Získaj názov miesta - ak je na Slovensku a v angličtine, prelož ho
        let placeName = place?.name || tip.place_id
        if (place && place.formatted_address) {
          const { isInSlovakia, isNameInEnglish, translatePlaceNameToSlovak } = await import('./placesService')
          if (isInSlovakia(place.formatted_address) && isNameInEnglish(placeName)) {
            try {
              placeName = await translatePlaceNameToSlovak(placeName)
              console.log(`✓ Translated place name in generateTripWithTips: "${place.name}" → "${placeName}"`)
            } catch (error) {
              console.warn(`⚠ Failed to translate place name "${placeName}":`, error)
            }
          }
        }
        
        // Získaj description - ak nie je alebo je prázdny, vygeneruj pomocou OpenAI
        let description = tip.description?.trim() || ''
        
        // Ak description je prázdny alebo veľmi krátky, skús vygenerovať pomocou OpenAI
        if (!description || description.length < 20) {
          try {
            // Získaj názov mesta z input.destination alebo z formatted_address
            const cityName = input.destination || place?.formatted_address?.split(',')[0] || 'mesto'
            const descriptionPrompt = `Vytvor krátky popis (50-100 slov) v slovenčine pre miesto "${placeName}" v meste ${cityName}. 
            
Popis by mal obsahovať:
- Čo je to za miesto
- Prečo je to zaujímavé alebo dôležité
- Čo tam návštevníci môžu očakávať alebo zažiť

Odpovedz len popisom v slovenčine, bez úvodu, bez záveru, bez formátovania.`
            
            onProgress?.(60 + (i / uniqueTips.length) * 10, `Generujem popis pre ${placeName}...`)
            const generatedDescription = await generateText(descriptionPrompt)
            if (generatedDescription && generatedDescription.trim().length > 20) {
              description = generatedDescription.trim()
              console.log(`✓ Generated description for "${placeName}": ${description.substring(0, 100)}...`)
            } else {
              // Fallback ak generovanie zlyhalo
              description = `Navštívte ${placeName} v ${cityName}.`
            }
          } catch (error) {
            console.warn(`⚠ Failed to generate description for "${placeName}":`, error)
            // Použijeme fallback description
            description = `Navštívte ${placeName}`
          }
        }
        
        tipsWithImages.push({
          title: placeName,
          description: description,
          category: tip.category,
          duration: tip.duration,
          price: tip.price,
          location: place?.formatted_address,
          imageUrl: imageUrl,
          place_id: tip.place_id,
          photo_reference: photo_reference,
          photoReferences: place && place.photos && place.photos.length > 0
            ? place.photos.slice(0, 3).map(p => (p.photo_reference || p.name || '') as string).filter(Boolean)
            : undefined,
          coordinates: coordinates,
        })
        
        console.log(`✓ Added tip "${placeName}" with imageUrl: ${imageUrl ? 'YES' : 'NO'}`)
      } else {
        console.log(`⚠ Skipping duplicate place_id in tipsWithImages: ${tip.place_id}`)
      }
      
      // Malé oneskorenie medzi requestmi
      if (i < uniqueTips.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.error(`Chyba pri získavaní obrázka pre tip ${i + 1} (place_id: ${tip.place_id}):`, error)
      // Pokračujeme bez obrázka - použijeme placeholder
      const placeholderText = encodeURIComponent(tip.place_id.substring(0, 30))
      // Skontroluj, či už sme toto miesto pridali
      if (!addedPlaceIds.has(tip.place_id)) {
        addedPlaceIds.add(tip.place_id)
        // Získaj description - ak nie je alebo je prázdny, vygeneruj pomocou OpenAI
        let description = tip.description?.trim() || ''
        
        // Ak description je prázdny alebo veľmi krátky, skús vygenerovať pomocou OpenAI
        if (!description || description.length < 20) {
          try {
            const cityName = input.destination || 'mesto'
            const descriptionPrompt = `Vytvor krátky popis (50-100 slov) v slovenčine pre miesto "${tip.place_id}" v meste ${cityName}. 
            
Popis by mal obsahovať:
- Čo je to za miesto
- Prečo je to zaujímavé alebo dôležité
- Čo tam návštevníci môžu očakávať alebo zažiť

Odpovedz len popisom v slovenčine, bez úvodu, bez záveru, bez formátovania.`
            
            const generatedDescription = await generateText(descriptionPrompt)
            if (generatedDescription && generatedDescription.trim().length > 20) {
              description = generatedDescription.trim()
            } else {
              description = `Navštívte ${tip.place_id} v ${cityName}.`
            }
          } catch (error) {
            console.warn(`⚠ Failed to generate description for "${tip.place_id}":`, error)
            description = `Navštívte ${tip.place_id}`
          }
        }
        
        tipsWithImages.push({
          title: tip.place_id,
          description: description,
          category: tip.category,
          duration: tip.duration,
          price: tip.price,
          imageUrl: `https://placehold.co/800x600/1a1a2e/00ffff?text=${placeholderText}`,
          place_id: tip.place_id,
        })
      } else {
        console.log(`⚠ Skipping duplicate place_id (no photo): ${tip.place_id}`)
      }
    }
  }

  // KROK 5: Finálna kontrola cez OpenAI - odstráň duplikáty a skontroluj konzistentnosť
  onProgress?.(75, 'Kontrolujem duplikáty a konzistentnosť...')
  
  if (tipsWithImages.length > 0) {
    const tipsForReview = tipsWithImages.map((tip, index) => ({
      index: index + 1,
      title: tip.title,
      description: tip.description.substring(0, 200), // Skráť popis pre prompt
      category: tip.category,
      location: tip.location || '',
      place_id: tip.place_id,
    }))
    
    const reviewPrompt = `Skontroluj tento zoznam tipov na výlet do ${input.destination} a identifikuj DUPLIKÁTY alebo VEĽMI PODOBNÉ MIESTA.

Zoznam tipov:
${tipsForReview.map(t => `${t.index}. ${t.title} (${t.category}) - ${t.description.substring(0, 100)}... - ${t.location}`).join('\n')}

ÚLOHA:
1. Identifikuj miesta, ktoré sú DUPLIKÁTY (rovnaké miesto s rôznymi názvami alebo variantmi)
2. Identifikuj miesta, ktoré sú VEĽMI PODOBNÉ (napr. "Hrad Bzovík" a "Kláštor Bzovík" - obe sú v Bzovíku a môžu byť to isté miesto)
3. Skontroluj, či všetky popisy sú konzistentné a relevantné

Vráť JSON v tomto formáte:
{
  "duplicates": [
    {
      "indices": [1, 3],
      "reason": "Rovnaké miesto s rôznymi názvami"
    }
  ],
  "similar": [
    {
      "indices": [2, 4],
      "reason": "Veľmi podobné miesta (rovnaká lokalita)"
    }
  ],
  "inconsistent": [
    {
      "index": 5,
      "reason": "Popis neodpovedá miestu"
    }
  ],
  "toRemove": [1, 3]
}

Poznámky:
- "duplicates" = presne rovnaké miesta
- "similar" = veľmi podobné miesta (napr. rôzne časti toho istého komplexu)
- "inconsistent" = popisy alebo informácie, ktoré nesedia
- "toRemove" = indexy tipov, ktoré by sa mali odstrániť (vždy ponechaj ten s lepším popisom alebo fotkou)

Vráť LEN JSON, bez dodatočného textu.`

    try {
      const reviewResponse = await generateText(reviewPrompt)
      console.log('[Review] OpenAI response:', reviewResponse)
      
      // Parsuj JSON odpoveď
      let reviewResult: {
        duplicates?: Array<{ indices: number[]; reason: string }>
        similar?: Array<{ indices: number[]; reason: string }>
        inconsistent?: Array<{ index: number; reason: string }>
        toRemove?: number[]
      } = {}
      
      try {
        // Skús extrahovať JSON z odpovede (môže byť obalený v markdown alebo textu)
        const jsonMatch = reviewResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          reviewResult = JSON.parse(jsonMatch[0])
        } else {
          reviewResult = JSON.parse(reviewResponse)
        }
      } catch (parseError) {
        console.warn('[Review] Failed to parse JSON, skipping review:', parseError)
        // Pokračujeme bez review
      }
      
      // Odstráň duplikáty podľa review
      if (reviewResult.toRemove && reviewResult.toRemove.length > 0) {
        console.log(`[Review] Removing ${reviewResult.toRemove.length} duplicate/similar tips`)
        
        // Vytvor Set pre rýchle vyhľadávanie
        const indicesToRemove = new Set(reviewResult.toRemove.map(i => i - 1)) // -1 lebo indexy sú 1-based
        
        // Filtruj tipy
        const filteredTips = tipsWithImages.filter((_, index) => !indicesToRemove.has(index))
        
        console.log(`[Review] Reduced tips from ${tipsWithImages.length} to ${filteredTips.length}`)
        tipsWithImages.length = 0
        tipsWithImages.push(...filteredTips)
      }
      
      // Loguj nájdené problémy
      if (reviewResult.duplicates && reviewResult.duplicates.length > 0) {
        console.log('[Review] Found duplicates:', reviewResult.duplicates)
      }
      if (reviewResult.similar && reviewResult.similar.length > 0) {
        console.log('[Review] Found similar places:', reviewResult.similar)
      }
      if (reviewResult.inconsistent && reviewResult.inconsistent.length > 0) {
        console.log('[Review] Found inconsistent tips:', reviewResult.inconsistent)
      }
    } catch (reviewError) {
      console.warn('[Review] Error during review, continuing without review:', reviewError)
      // Pokračujeme bez review - lepšie mať tipy ako žiadne
    }
  }

  onProgress?.(80, 'Vytváram súhrn...')
  
  // Vygeneruj súhrn
  const summaryPrompt = `Vytvor krátky súhrn (3-4 vety) o ${input.destination} v slovenčine. Zahrň základné informácie o meste, jeho histórii, kultúre a prečo je to dobrá destinácia pre výlet.`
  const summary = await generateText(summaryPrompt)
  
  // Extrahuj krajinu
  const country = extractCountry(input.destination || '')

  onProgress?.(100, 'Plán výletu hotový!')

  console.log(`[generateTrip] Completed successfully for: ${input.destination}`)
  
  return {
    destination: input.destination || '',
    country: country,
    tips: tipsWithImages,
    summary: summary.trim(),
    bestTimeToVisit: undefined,
    currency: undefined,
    language: undefined,
  }
}

/**
 * Vytvorí Trip bez Google Places API - len z AI generovaných tipov
 * Pre každý tip skúsi nájsť skutočné miesto a obrázok pomocou findPlaceByName
 */
async function generateTripWithoutPlaces(
  tips: ParsedTip[],
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  onProgress?.(60, 'Vytváram tipy a hľadám obrázky...')
  
  const tipsWithImages: TripTip[] = []
  
  for (let i = 0; i < tips.length; i++) {
    const tip = tips[i]
    const progress = 60 + (i / tips.length) * 20
    
    // Použij pôvodný názov miesta ak existuje, inak skús extrahovať z place_id
    let title = tip.placeName || tip.place_id
      .replace(/^AI_/, '')
      .replace(/_\d+$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
    
    onProgress?.(progress, `Hľadám obrázok pre: ${title}...`)
    
    let imageUrl = `https://placehold.co/800x600/1a1a2e/00ffff?text=${encodeURIComponent(title.substring(0, 30))}`
    let place_id = tip.place_id
    let coordinates: { lat: number; lng: number } | undefined
    let foundPlace: Place | null = null
    
    console.log(`[generateTripWithoutPlaces] Searching for place: "${title}" in "${input.destination}"`)
    
    // Skús nájsť skutočné miesto pomocou findPlaceByName
    try {
      foundPlace = await findPlaceByName(title, input.destination || '')
      
      if (foundPlace) {
        // Použij názov z nájdeného miesta (už môže byť preložený)
        title = foundPlace.name
        
        console.log(`[generateTripWithoutPlaces] ✓ Found place: "${foundPlace.name}"`)
        console.log(`[generateTripWithoutPlaces]   Photos count: ${foundPlace.photos?.length || 0}`)
        
        if (foundPlace.photos && foundPlace.photos.length > 0) {
          const firstPhoto = foundPlace.photos[0]
          console.log(`[generateTripWithoutPlaces]   First photo object:`, JSON.stringify({
            photo_reference: firstPhoto.photo_reference?.substring(0, 50) || 'none',
            name: firstPhoto.name?.substring(0, 50) || 'none',
            height: firstPhoto.height,
            width: firstPhoto.width,
          }))
          
          // Nové API používa 'name', legacy používa 'photo_reference'
          const photo_reference = (firstPhoto.name || firstPhoto.photo_reference || '') as string
          
          console.log(`[generateTripWithoutPlaces]   Extracted photo_reference: ${photo_reference ? photo_reference.substring(0, 80) + '...' : 'MISSING'}`)
          
          if (photo_reference) {
            imageUrl = getPlacePhotoUrl(photo_reference, 800)
            place_id = foundPlace.place_id
            
            // Ulož prvých 3 photo references pre animáciu pri hover
            const photoReferences: string[] = []
            for (let i = 0; i < Math.min(3, foundPlace.photos.length); i++) {
              const photo = foundPlace.photos[i]
              const ref = (photo.photo_reference || photo.name || '') as string
              if (ref) {
                photoReferences.push(ref)
              }
            }
            
            if (foundPlace.geometry?.location) {
              coordinates = {
                lat: foundPlace.geometry.location.lat,
                lng: foundPlace.geometry.location.lng,
              }
            }
            
            console.log(`✓ Found place and image for "${title}": ${foundPlace.name}`)
            console.log(`  Final Image URL: ${imageUrl}`)
            console.log(`  Photo references for hover: ${photoReferences.length}`)
          } else {
            console.error(`❌ Photo reference is MISSING for "${title}"`)
          }
        } else {
          console.warn(`⚠ Place "${title}" found but has no photos`)
        }
      } else {
        console.warn(`⚠ Place "${title}" NOT FOUND by findPlaceByName`)
      }
    } catch (error: any) {
      console.error(`❌ ERROR finding place "${title}":`, error.message || error)
      console.error(`  Error stack:`, error.stack)
      // Použijeme placeholder
    }
    
    // Ak sme našli miesto, skontroluj a prelož názov, ak je to potrebné
    if (foundPlace && foundPlace.formatted_address) {
      const { isInSlovakia, isNameInEnglish, translatePlaceNameToSlovak } = await import('./placesService')
      if (isInSlovakia(foundPlace.formatted_address) && isNameInEnglish(title)) {
        try {
          title = await translatePlaceNameToSlovak(title)
          console.log(`✓ Translated place name in generateTripWithoutPlaces: "${foundPlace.name}" → "${title}"`)
        } catch (error) {
          console.warn(`⚠ Failed to translate place name "${title}":`, error)
        }
      }
    }
    
    // Malé oneskorenie medzi requestmi
    if (i < tips.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // Získaj photoReferences ak máme foundPlace
    let photoReferences: string[] | undefined = undefined
    if (foundPlace && foundPlace.photos && foundPlace.photos.length > 0) {
      photoReferences = []
      for (let i = 0; i < Math.min(3, foundPlace.photos.length); i++) {
        const photo = foundPlace.photos[i]
        const ref = (photo.photo_reference || photo.name || '') as string
        if (ref) {
          photoReferences.push(ref)
        }
      }
    }
    
    // Získaj description - ak nie je alebo je prázdny, vygeneruj pomocou OpenAI
    let description = tip.description?.trim() || ''
    
    // Ak description je prázdny alebo veľmi krátky, skús vygenerovať pomocou OpenAI
    if (!description || description.length < 20) {
      try {
        // Získaj názov mesta z input.destination alebo z formatted_address
        const cityName = input.destination || foundPlace?.formatted_address?.split(',')[0] || 'mesto'
        const descriptionPrompt = `Vytvor krátky popis (50-100 slov) v slovenčine pre miesto "${title}" v meste ${cityName}. 
        
Popis by mal obsahovať:
- Čo je to za miesto
- Prečo je to zaujímavé alebo dôležité
- Čo tam návštevníci môžu očakávať alebo zažiť

Odpovedz len popisom v slovenčine, bez úvodu, bez záveru, bez formátovania.`
        
        onProgress?.(70 + (i / tips.length) * 10, `Generujem popis pre ${title}...`)
        const generatedDescription = await generateText(descriptionPrompt)
        if (generatedDescription && generatedDescription.trim().length > 20) {
          description = generatedDescription.trim()
          console.log(`✓ Generated description for "${title}": ${description.substring(0, 100)}...`)
        } else {
          // Fallback ak generovanie zlyhalo
          description = `Navštívte ${title} v ${cityName}.`
        }
      } catch (error) {
        console.warn(`⚠ Failed to generate description for "${title}":`, error)
        // Použijeme fallback description
        description = `Navštívte ${title}`
      }
    }
    
    tipsWithImages.push({
      title: title,
      description: description,
      category: tip.category,
      duration: tip.duration,
      price: tip.price,
      imageUrl: imageUrl,
      place_id: place_id,
      photoReferences: photoReferences,
      coordinates: coordinates,
    })
  }

  onProgress?.(80, 'Vytváram súhrn...')
  
  const summaryPrompt = `Vytvor krátky súhrn (3-4 vety) o ${input.destination} v slovenčine. Zahrň základné informácie o meste, jeho histórii, kultúre a prečo je to dobrá destinácia pre výlet.`
  const summary = await generateText(summaryPrompt)
  
  const country = extractCountry(input.destination || '')

  onProgress?.(100, 'Plán výletu hotový!')

  return {
    destination: input.destination || '',
    country: country,
    tips: tipsWithImages,
    summary: summary.trim(),
    bestTimeToVisit: undefined,
    currency: undefined,
    language: undefined,
  }
}

function parseTipsWithPlaceId(tipsText: string): ParsedTip[] {
  const tips: ParsedTip[] = []
  
  if (!tipsText || tipsText.trim().length === 0) {
    console.warn('Empty tips text')
    return tips
  }
  
  console.log('Raw tips text:', tipsText.substring(0, 1000))
  
  // Regex pre formát: Tip X: place_id | category | description | duration | price
  // place_id môže obsahovať písmená, čísla, podčiarkovníky, pomlčky
  const tipRegex = /(?:Tip\s*)?\d+[.:]\s*([A-Za-z0-9_-]{10,})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\|\s*(.+?)\s*(?:\|\s*(.+?))?)?(?=\s*(?:Tip\s*)?\d+[.:]|$)/gis
  
  const matches = Array.from(tipsText.matchAll(tipRegex))
  
  console.log(`Found ${matches.length} matches with regex`)
  
  if (matches.length > 0) {
    for (const match of matches) {
      const place_id = match[1]?.trim() || ''
      const category = (match[2]?.trim().toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
      const description = match[3]?.trim() || ''
      const duration = match[4]?.trim() || ''
      const price = match[5]?.trim() || ''
      
      // Validácia kategórie
      const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
      const finalCategory = validCategories.includes(category as TripTip['category']) 
        ? (category as TripTip['category'])
        : 'attraction'
      
      if (place_id && description && place_id.length >= 10 && description.length > 20) {
        tips.push({
          place_id,
          category: finalCategory,
          description,
          duration: duration || undefined,
          price: price || undefined,
        })
        console.log(`✓ Parsed tip: place_id="${place_id}", category="${finalCategory}"`)
      } else {
        console.warn(`Skipping invalid tip: place_id="${place_id}" (length: ${place_id.length}), desc="${description.substring(0, 30)}" (length: ${description.length})`)
      }
    }
  }
  
  // Fallback 1: Skús rozdeliť podľa riadkov s "|"
  if (tips.length === 0) {
    console.log('Trying fallback parsing method 1')
    const lines = tipsText.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 10 && trimmed.includes('|')
    })
    
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i]
      const parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0)
      
      // Odstráň číslo na začiatku ak existuje
      let placeIdPart = parts[0] || ''
      placeIdPart = placeIdPart.replace(/^(?:Tip\s*)?\d+[.:]\s*/, '').trim()
      
      // Skús nájsť place_id (začína s ChIJ alebo obsahuje len alfanumerické znaky a podčiarkovníky)
      const placeIdMatch = placeIdPart.match(/([A-Za-z0-9_-]{10,})/)
      const place_id = placeIdMatch ? placeIdMatch[1] : placeIdPart
      
      if (parts.length >= 3 && place_id && place_id.length >= 10) {
        const category = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
        const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
        const finalCategory = validCategories.includes(category as TripTip['category']) 
          ? (category as TripTip['category'])
          : 'attraction'
        
        tips.push({
          place_id: place_id,
          category: finalCategory,
          description: parts[2] || parts[1] || line,
          duration: parts[3] || undefined,
          price: parts[4] || undefined,
        })
        console.log(`✓ Parsed tip (fallback 1): place_id="${place_id}"`)
      }
    }
  }
  
  // Fallback 2: Ak OpenAI nevrátil place_id, použijeme názvy miest a nájdeme ich place_id neskôr
  if (tips.length === 0) {
    console.log('Trying fallback parsing method 2 - parsing by name')
    const lines = tipsText.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 10 && (trimmed.includes('|') || trimmed.match(/^(?:Tip\s*)?\d+[.:]/))
    })
    
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i]
      let parts = line.split('|').map(p => p.trim()).filter(p => p.length > 0)
      
      // Ak nie je pipe, skús rozdeliť inak
      if (parts.length === 1) {
        const match = line.match(/(?:Tip\s*)?\d+[.:]\s*(.+)/)
        if (match) {
          parts = [match[1]]
        }
      }
      
      if (parts.length >= 2) {
        // Odstráň číslo na začiatku
        let firstPart = parts[0].replace(/^(?:Tip\s*)?\d+[.:]\s*/, '').trim()
        
        // Skús nájsť place_id
        const placeIdMatch = firstPart.match(/([A-Za-z0-9_-]{10,})/)
        const place_id = placeIdMatch ? placeIdMatch[1] : null
        
        if (place_id && place_id.length >= 10) {
          const category = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
          const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
          const finalCategory = validCategories.includes(category as TripTip['category']) 
            ? (category as TripTip['category'])
            : 'attraction'
          
          tips.push({
            place_id: place_id,
            category: finalCategory,
            description: parts[2] || parts[1] || line,
            duration: parts[3] || undefined,
            price: parts[4] || undefined,
          })
          console.log(`✓ Parsed tip (fallback 2): place_id="${place_id}"`)
        }
      }
    }
  }
  
  console.log(`Final parsed tips count: ${tips.length}`)
  
  if (tips.length === 0) {
    console.error('Failed to parse any tips. Full text:', tipsText)
  }
  
  return tips.slice(0, 12) // Max 12 tipov
}

function extractCountry(destination: string): string {
  const countryMap: Record<string, string> = {
    'Paríž': 'Francúzsko',
    'Londýn': 'Veľká Británia',
    'Rím': 'Taliansko',
    'Barcelona': 'Španielsko',
    'Amsterdam': 'Holandsko',
    'Berlín': 'Nemecko',
    'Viedeň': 'Rakúsko',
    'Praha': 'Česko',
    'Budapešť': 'Maďarsko',
    'Krakow': 'Poľsko',
    'Atény': 'Grécko',
    'Lisabon': 'Portugalsko',
    'Dublin': 'Írsko',
    'Edinburgh': 'Veľká Británia',
    'Kodaň': 'Dánsko',
    'Štokholm': 'Švédsko',
    'Oslo': 'Nórsko',
    'Helsinki': 'Fínsko',
    'Reykjavík': 'Island',
    'Zürich': 'Švajčiarsko',
    'Miláno': 'Taliansko',
    'Florencia': 'Taliansko',
    'Venezia': 'Taliansko',
    'Neapol': 'Taliansko',
    'Madrid': 'Španielsko',
    'Sevilla': 'Španielsko',
    'Valencia': 'Španielsko',
    'Porto': 'Portugalsko',
    'Brusel': 'Belgicko',
    'Antverpy': 'Belgicko',
    'Bruggy': 'Belgicko',
    'Bratislava': 'Slovensko',
    'Ljubljana': 'Slovinsko',
    'Záhreb': 'Chorvátsko',
    'Varšava': 'Poľsko',
    'Gdańsk': 'Poľsko',
    'Wrocław': 'Poľsko',
  }
  
  return countryMap[destination] || 'Európa'
}

/**
 * Režim "around" - trip okolo POI
 * Nájde ďalšie zaujímavé miesta v okolí (2-5 km) a zahrnie pôvodné miesto ako povinnú zastávku
 */
async function generateAroundPlaceTrip(
  rootPlace: Place,
  rootLat: number,
  rootLng: number,
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  console.log(`[generateAroundPlaceTrip] Starting for place: ${rootPlace.name}`)
  
  onProgress?.(10, 'Hľadám zaujímavé miesta v okolí...')
  
  // Hľadaj miesta v okolí pomocou Nearby Search
  const places: Place[] = []
  const radius = 5000 // 5 km v metroch
  
  // Mapovanie záujmov na Google Places typy
  const interestToTypes: Record<string, string[]> = {
    'landmarks': ['tourist_attraction', 'point_of_interest'],
    'museums': ['museum', 'art_gallery'],
    'parks': ['park', 'natural_feature'],
    'viewpoints': ['tourist_attraction', 'point_of_interest'],
    'cafes': ['cafe', 'bakery'],
    'restaurants': ['restaurant'],
    'street_food': ['restaurant', 'food'],
    'bars': ['bar'],
    'clubs': ['night_club'],
    'markets': ['shopping_mall', 'store'],
    'kids_activities': ['amusement_park', 'zoo', 'aquarium'],
    'wellness': ['spa', 'gym'],
  }
  
  const userInterests = input.interests || []
  const searchTypes: string[] = []
  
  if (userInterests.length > 0) {
    for (const interest of userInterests) {
      const types = interestToTypes[interest]
      if (types) {
        searchTypes.push(...types)
      }
    }
  }
  
  // Ak nemá záujmy, použij všeobecné typy
  if (searchTypes.length === 0) {
    searchTypes.push('tourist_attraction', 'restaurant', 'park', 'museum')
  }
  
  // Hľadaj miesta v okolí (použijeme Text Search s location bias)
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY
    if (!googleApiKey) {
      throw new Error('GOOGLE_API_KEY nie je nastavený')
    }
    
    // Použijeme Text Search s location bias na získanie miest v okolí
    const searchQueries = [
      'tourist attractions',
      'restaurants',
      'museums',
      'parks',
    ]
    
    for (const query of searchQueries.slice(0, 4)) {
      try {
        const searchUrl = `https://places.googleapis.com/v1/places:searchText`
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.types,places.location',
          },
          body: JSON.stringify({
            textQuery: query,
            maxResultCount: 10,
            // languageCode sa nepoužije - Google vráti originálny jazyk krajiny
            locationBias: {
              circle: {
                center: {
                  latitude: rootLat,
                  longitude: rootLng,
                },
                radius: radius,
              },
            },
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.places && data.places.length > 0) {
            const nearbyPlaces = data.places
              .filter((place: any) => place.photos && place.photos.length > 0)
              .filter((place: any) => place.id !== rootPlace.place_id) // Vylúč pôvodné miesto
              .slice(0, 5)
              .map((place: any) => ({
                place_id: place.id,
                name: place.displayName?.text || place.displayName || 'Unknown',
                formatted_address: place.formattedAddress || '',
                rating: place.rating,
                user_ratings_total: place.userRatingCount || 0,
                photos: place.photos.map((photo: any) => ({
                  photo_reference: photo.name,
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
            
            places.push(...nearbyPlaces)
          }
        }
      } catch (error) {
        console.warn(`Error searching ${query}:`, error)
      }
    }
  } catch (error) {
    console.warn('Error in nearby search:', error)
  }
  
  // Odstráň duplikáty
  const uniquePlaces = new Map<string, Place>()
  for (const place of places) {
    if (!uniquePlaces.has(place.place_id)) {
      uniquePlaces.set(place.place_id, place)
    }
  }
  let finalPlaces = Array.from(uniquePlaces.values())
  
  // Zoraď podľa popularity a aktivity (najaktívnejšie prvé)
  finalPlaces.sort((a, b) => {
    let scoreA = (a.rating || 0) * Math.log((a.user_ratings_total || 0) + 1)
    let scoreB = (b.rating || 0) * Math.log((b.user_ratings_total || 0) + 1)
    
    // Bonus za aktivitu
    if (a.is_active && a.recent_reviews_count && a.recent_reviews_count > 0) {
      scoreA += a.recent_reviews_count * 0.5
    }
    if (b.is_active && b.recent_reviews_count && b.recent_reviews_count > 0) {
      scoreB += b.recent_reviews_count * 0.5
    }
    
    // Penalizácia za neaktívne miesta
    if (a.is_active === false) scoreA *= 0.3
    if (b.is_active === false) scoreB *= 0.3
    
    return scoreB - scoreA
  })
  
  // Pridaj pôvodné miesto ako prvú zastávku
  if (rootPlace.photos && rootPlace.photos.length > 0) {
    finalPlaces.unshift(rootPlace)
  }
  
  console.log(`[generateAroundPlaceTrip] Found ${finalPlaces.length} places (including root)`)
  
  // Pokračuj s klasickou logikou generovania tripu
  // (použijeme existujúcu logiku, ale s finalPlaces)
  onProgress?.(30, 'Generujem itinerár...')
  
  // Vytvor zoznam miest pre AI
  const placesList = finalPlaces.slice(0, 20).map((place, index) => {
    return `${index + 1}. ${place.name} (ID: ${place.place_id}) - ${place.formatted_address}${place.rating ? ` - ⭐ ${place.rating}/5` : ''}`
  }).join('\n')
  
  // Vytvor context description (zjednodušená verzia)
  const contextParts: string[] = []
  if (input.duration) contextParts.push(`Dĺžka výletu: ${input.duration} dní`)
  if (input.budget) {
    const budgetLabels: Record<string, string> = { low: 'nízky', medium: 'stredný', high: 'luxusný' }
    contextParts.push(`Rozpočet: ${budgetLabels[input.budget]}`)
  }
  if (input.interests && input.interests.length > 0) {
    const interestLabels: Record<string, string> = {
      landmarks: 'Pamätihodnosti', museums: 'Múzeá', parks: 'Parky',
      restaurants: 'Reštaurácie', cafes: 'Kaviarne', bars: 'Bary',
    }
    contextParts.push(`Záujmy: ${input.interests.map(i => interestLabels[i] || i).join(', ')}`)
  }
  const contextDescription = contextParts.join('\n')
  
  const aiPrompt = `Vytvor mini-itinerár okolo miesta ${rootPlace.name} v ${input.destination || 'okolí'}.

PÔVODNÉ MIESTO (povinná zastávka #1):
${rootPlace.name} - ${rootPlace.formatted_address}

ĎALŠIE MIESTA V OKOLÍ:
${placesList}

KONTEKT O CESTOVATEĽOVI:
${contextDescription || 'Žiadne špecifické preferencie'}

Vytvor 6-8 tipov na výlet. Prvý tip MUSÍ byť "${rootPlace.name}". Pre každý tip použite formát:
Tip 1: [NÁZOV MIESTA PRESNE AKO V ZOZNAME] | [Kategória] | [Popis 50-100 slov] | [Trvanie] | [Cena]

Kategórie: attraction, activity, restaurant, accommodation, tip

Vráť LEN zoznam tipov, bez úvodu, bez záveru. Začni priamo s "Tip 1:"`
  
  const tipsText = await generateText(aiPrompt)
  onProgress?.(50, 'Spracovávam tipy...')
  
  // Vytvor mapu názov -> place_id
  const nameToPlaceId = new Map<string, string>()
  for (const place of finalPlaces) {
    const nameLower = place.name.toLowerCase().trim()
    nameToPlaceId.set(nameLower, place.place_id)
  }
  
  // Parsuj tipy
  const parsedTips = parseTipsByName(tipsText, nameToPlaceId)
  
  // Odstráň duplikáty
  const uniqueTipsMap = new Map<string, typeof parsedTips[0]>()
  for (const tip of parsedTips) {
    if (tip.place_id && !uniqueTipsMap.has(tip.place_id)) {
      uniqueTipsMap.set(tip.place_id, tip)
    }
  }
  const uniqueTips = Array.from(uniqueTipsMap.values())
  
  // Pokračuj s generovaním
  return await generateTripWithTips(uniqueTips, finalPlaces, input, onProgress)
}

/**
 * Režim "single" - detail jedného miesta
 * Vytvorí detailný popis a tipy pre jedno konkrétne miesto
 */
async function generateSinglePlaceTrip(
  rootPlace: Place,
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  console.log(`[generateSinglePlaceTrip] Starting for place: ${rootPlace.name}`)
  
  onProgress?.(20, 'Získavam detailné informácie...')
  
  // Získaj detailné informácie o mieste
  let placeDetails: any = null
  if (rootPlace.place_id) {
    try {
      placeDetails = await getPlaceDetails(rootPlace.place_id, rootPlace.formatted_address)
    } catch (error) {
      console.warn('Failed to get place details:', error)
    }
  }
  
  onProgress?.(40, 'Generujem detailný popis...')
  
  // Vygeneruj detailný popis a tipy pomocou OpenAI
  const detailPrompt = `Vytvor detailný popis a tipy pre návštevu miesta "${rootPlace.name}"${rootPlace.formatted_address ? ` v ${rootPlace.formatted_address}` : ''}.

${placeDetails ? `
Dostupné informácie:
- Hodnotenie: ${placeDetails.rating ? `⭐ ${placeDetails.rating}/5` : 'N/A'}
- Typy: ${placeDetails.types?.join(', ') || 'N/A'}
${placeDetails.opening_hours ? `- Otváracie hodiny: ${placeDetails.opening_hours.weekday_text?.join(', ') || 'N/A'}` : ''}
${placeDetails.phone_number ? `- Telefón: ${placeDetails.phone_number}` : ''}
${placeDetails.website ? `- Web: ${placeDetails.website}` : ''}
` : ''}

Vytvor:
1. Detailný popis miesta (100-150 slov)
2. Tipy na návštevu (vhodný čas, na čo si dať pozor)
3. Odporúčania v okolí (môžeš spomenúť všeobecné typy miest, ale konkrétne miesta získame z Google Maps)

Formát:
POPIS:
[detailný popis miesta]

TIPY:
- [tip 1]
- [tip 2]
- [tip 3]

ODPORÚČANIA V OKOLÍ:
- [odporúčanie 1]
- [odporúčanie 2]`
  
  const detailText = await generateText(detailPrompt)
  onProgress?.(60, 'Spracovávam informácie...')
  
  // Parsuj odpoveď
  const descriptionMatch = detailText.match(/POPIS:\s*(.+?)(?=TIPY:|$)/s)
  const tipsMatch = detailText.match(/TIPY:\s*(.+?)(?=ODPORÚČANIA:|$)/s)
  const recommendationsMatch = detailText.match(/ODPORÚČANIA V OKOLÍ:\s*(.+?)$/s)
  
  const description = descriptionMatch ? descriptionMatch[1].trim() : detailText.substring(0, 200)
  const tips = tipsMatch ? tipsMatch[1].trim().split('\n').filter(t => t.trim().startsWith('-')).map(t => t.replace(/^-\s*/, '')) : []
  const recommendations = recommendationsMatch ? recommendationsMatch[1].trim().split('\n').filter(r => r.trim().startsWith('-')).map(r => r.replace(/^-\s*/, '')) : []
  
  // Získaj názov miesta - ak je na Slovensku a v angličtine, prelož ho
  let placeName = rootPlace.name
  if (rootPlace.formatted_address) {
    const { isInSlovakia, isNameInEnglish, translatePlaceNameToSlovak } = await import('./placesService')
    if (isInSlovakia(rootPlace.formatted_address) && isNameInEnglish(placeName)) {
      try {
        placeName = await translatePlaceNameToSlovak(placeName)
        console.log(`✓ Translated place name in generateSinglePlaceTrip: "${rootPlace.name}" → "${placeName}"`)
      } catch (error) {
        console.warn(`⚠ Failed to translate place name "${placeName}":`, error)
      }
    }
  }
  
  // Získaj photoReferences pre hlavné miesto
  let photoReferences: string[] | undefined = undefined
  if (rootPlace.photos && rootPlace.photos.length > 0) {
    photoReferences = []
    for (let i = 0; i < Math.min(3, rootPlace.photos.length); i++) {
      const photo = rootPlace.photos[i]
      const ref = (photo.photo_reference || photo.name || '') as string
      if (ref) {
        photoReferences.push(ref)
      }
    }
  }
  
  // Vytvor TripTip pre hlavné miesto
  const mainTip: TripTip = {
    title: placeName,
    description: description,
    category: rootPlace.types?.some(t => ['restaurant', 'cafe', 'bar'].includes(t)) ? 'restaurant' : 
              rootPlace.types?.some(t => ['museum', 'art_gallery'].includes(t)) ? 'attraction' : 'attraction',
    location: rootPlace.formatted_address,
    imageUrl: rootPlace.photos && rootPlace.photos.length > 0 
      ? getPlacePhotoUrl(rootPlace.photos[0].photo_reference || rootPlace.photos[0].name || '', 800)
      : `https://placehold.co/800x600/1a1a2e/00ffff?text=${encodeURIComponent(rootPlace.name)}`,
    place_id: rootPlace.place_id,
    photo_reference: rootPlace.photos?.[0]?.photo_reference || rootPlace.photos?.[0]?.name,
    photoReferences: photoReferences,
    coordinates: rootPlace.geometry?.location,
    duration: '1-2 hodiny',
    price: placeDetails?.rating ? `⭐ ${placeDetails.rating}/5` : undefined,
  }
  
  // Vytvor tipy z odporúčaní
  const recommendationTips: TripTip[] = recommendations.slice(0, 3).map((rec, index) => ({
    title: `Odporúčanie ${index + 1}`,
    description: rec,
    category: 'tip' as TripTip['category'],
    imageUrl: `https://placehold.co/800x600/1a1a2e/00ffff?text=${encodeURIComponent(rec.substring(0, 30))}`,
  }))
  
  const allTips = [mainTip, ...recommendationTips]
  
  onProgress?.(80, 'Vytváram súhrn...')
  
  const summary = `Detailný popis a tipy pre návštevu ${rootPlace.name}${rootPlace.formatted_address ? ` v ${rootPlace.formatted_address}` : ''}.`
  
  return {
    destination: rootPlace.name,
    country: extractCountry(input.destination || rootPlace.formatted_address || ''),
    tips: allTips,
    summary: summary,
  }
}
