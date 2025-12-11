import { generateText } from './aiService'
import { searchPlacesInCity, getPlacePhotoUrl, type Place } from './placesService'
import type { UserInput, Trip, TripTip } from '@/types'

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
    if (!input.destination) {
      throw new Error('Destinácia je povinná')
    }

    console.log(`[generateTrip] Starting for destination: ${input.destination}`)
    
    onProgress?.(5, 'Hľadám zaujímavé miesta v meste...')
    await new Promise(resolve => setTimeout(resolve, 50))

    // KROK 1: Získaj miesta z Google Places API
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
    const englishCity = cityTranslations[input.destination] || input.destination

    // Získaj rôzne typy miest - len miesta s fotkami
    const places: Place[] = []
    
    // Mapovanie preferencií na Google Places typy
    const preferenceToTypes: Record<string, string[]> = {
      'múzeá': ['museum', 'art_gallery'],
      'história': ['tourist_attraction', 'point_of_interest'],
      'príroda': ['park', 'natural_feature'],
      'nočný život': ['bar', 'night_club', 'restaurant'],
      'jedlo': ['restaurant', 'cafe', 'food'],
      'architektúra': ['tourist_attraction', 'point_of_interest'],
    }

    // Turistické atrakcie
    onProgress?.(10, 'Hľadám turistické atrakcie...')
    try {
      const attractions = await searchPlacesInCity(englishCity, 'tourist attractions', 20)
      places.push(...attractions)
    } catch (error) {
      console.warn('Error searching attractions:', error)
    }
    
    // Reštaurácie
    onProgress?.(15, 'Hľadám reštaurácie...')
    try {
      const restaurants = await searchPlacesInCity(englishCity, 'restaurants', 15)
      places.push(...restaurants)
    } catch (error) {
      console.warn('Error searching restaurants:', error)
    }
    
    // Aktivity
    onProgress?.(20, 'Hľadám aktivity...')
    try {
      const activities = await searchPlacesInCity(englishCity, 'activities', 15)
      places.push(...activities)
    } catch (error) {
      console.warn('Error searching activities:', error)
    }

    // Odstráň duplikáty podľa place_id
    const uniquePlaces = new Map<string, Place>()
    for (const place of places) {
      if (!uniquePlaces.has(place.place_id)) {
        uniquePlaces.set(place.place_id, place)
      }
    }
    const finalPlaces = Array.from(uniquePlaces.values())

    console.log(`[generateTrip] Found ${finalPlaces.length} unique places from Google Places API`)

    // KROK 2: Priprav JSON pre OpenAI s miestami (iba place_id, name, rating, types)
    onProgress?.(25, 'Pripravujem dáta pre AI...')
    
    const placesForAI = finalPlaces.map(place => ({
      place_id: place.place_id,
      name: place.name,
      rating: place.rating,
      user_ratings_total: 0, // Google Places API neposkytuje toto v Text Search
      types: place.types || [],
      formatted_address: place.formatted_address,
    }))

    // KROK 3: Zavolaj OpenAI na vytvorenie itinerára
    onProgress?.(30, 'Generujem itinerár pomocou AI...')
    
    const aiPrompt = `Vytvor detailný plán výletu do ${input.destination} v Európe.

Mám zoznam skutočných miest z Google Maps s place_id:
${JSON.stringify(placesForAI.slice(0, 50), null, 2)}

${input.tripType ? `Typ výletu: ${input.tripType === 'city' ? 'mestský' : input.tripType === 'nature' ? 'prírodný' : 'kultúrny'}.` : ''}
${input.duration ? `Dĺžka výletu: ${input.duration} dní.` : ''}
${input.interests ? `Záujmy: ${input.interests}.` : ''}
${input.budget ? `Rozpočet: ${input.budget === 'low' ? 'nízky' : input.budget === 'medium' ? 'stredný' : 'vysoký'}.` : ''}

Vytvor 10-12 tipov na výlet. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [place_id] | [Kategória] | [Popis 50-100 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [place_id] | [Kategória] | [Popis] | [Trvanie] | [Cena]
...

Kategórie (použi presne tieto hodnoty):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Prvé pole MUSÍ byť place_id z vyššie uvedeného zoznamu (presne taký, ako je v JSON)
3. Všetky polia MUSIA byť oddelené znakom | (pipe)
4. Všetky texty MUSIA byť v slovenčine
5. Vytvor MINIMÁLNE 10 tipov, ideálne 12
6. Zahrň rôzne kategórie
7. Popis musí byť detailný a zaujímavý (50-100 slov)
8. Použi len place_id z poskytnutého zoznamu - NIKDY nevymýšľaj nové miesta

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`

    const tipsText = await generateText(aiPrompt)
    onProgress?.(50, 'Spracovávam tipy...')
    
    console.log('AI Response:', tipsText.substring(0, 500))
    
    // Parsuj tipy - teraz očakávame place_id ako prvé pole
    const tips = parseTipsWithPlaceId(tipsText)
    
    console.log(`Parsed ${tips.length} tips`)
    
    if (tips.length === 0) {
      console.error('Failed to parse tips. Raw text:', tipsText)
      throw new Error('Nepodarilo sa vytvoriť tipy. Skúste to znova.')
    }

    // KROK 4: Spoj place_id s miestami z Google Places a získaj fotky
    onProgress?.(60, 'Spárujem miesta s fotkami...')
    const tipsWithImages: TripTip[] = []
    
    // Vytvor mapu place_id -> Place pre rýchle vyhľadávanie
    const placesMap = new Map<string, Place>()
    for (const place of finalPlaces) {
      placesMap.set(place.place_id, place)
    }
    
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i]
      const progress = 60 + (i / tips.length) * 20
      
      onProgress?.(progress, `Spárujem: ${tip.place_id}...`)
      
      try {
        // Nájdeme miesto podľa place_id - žiadne textové matching!
        const place = placesMap.get(tip.place_id)
        
        let imageUrl: string = ''
        let photo_reference: string | undefined
        let coordinates: { lat: number; lng: number } | undefined
        
        if (place && place.photos && place.photos.length > 0) {
          // Použijeme photo_reference z Google Places - VŽDY cez Place Photos API
          photo_reference = place.photos[0].photo_reference
          imageUrl = getPlacePhotoUrl(photo_reference, 800)
          
          if (place.geometry?.location) {
            coordinates = {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            }
          }
          
          console.log(`✓ Found place for place_id "${tip.place_id}": ${place.name}`)
        } else {
          // Ak miesto nemá fotku, použijeme placeholder
          console.warn(`⚠ Place "${tip.place_id}" has no photo, using placeholder`)
          const placeholderText = encodeURIComponent(place?.name || tip.place_id.substring(0, 30))
          imageUrl = `https://placehold.co/800x600/1a1a2e/00ffff?text=${placeholderText}`
        }
        
        // VŽDY pridáme tip s imageUrl a place_id/photo_reference
        tipsWithImages.push({
          title: place?.name || tip.place_id,
          description: tip.description,
          category: tip.category,
          duration: tip.duration,
          price: tip.price,
          location: place?.formatted_address,
          imageUrl: imageUrl,
          place_id: tip.place_id,
          photo_reference: photo_reference,
          coordinates: coordinates,
        })
        
        console.log(`✓ Added tip "${place?.name || tip.place_id}" with imageUrl: ${imageUrl ? 'YES' : 'NO'}`)
        
        // Malé oneskorenie medzi requestmi
        if (i < tips.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (error) {
        console.error(`Chyba pri získavaní obrázka pre tip ${i + 1} (place_id: ${tip.place_id}):`, error)
        // Pokračujeme bez obrázka - použijeme placeholder
        const placeholderText = encodeURIComponent(tip.place_id.substring(0, 30))
        tipsWithImages.push({
          title: tip.place_id,
          description: tip.description,
          category: tip.category,
          duration: tip.duration,
          price: tip.price,
          imageUrl: `https://placehold.co/800x600/1a1a2e/00ffff?text=${placeholderText}`,
          place_id: tip.place_id,
        })
      }
    }

    onProgress?.(80, 'Vytváram súhrn...')
    
    // Vygeneruj súhrn
    const summaryPrompt = `Vytvor krátky súhrn (3-4 vety) o ${input.destination} v slovenčine. Zahrň základné informácie o meste, jeho histórii, kultúre a prečo je to dobrá destinácia pre výlet.`
    const summary = await generateText(summaryPrompt)
    
    // Extrahuj krajinu
    const country = extractCountry(input.destination)

    onProgress?.(100, 'Plán výletu hotový!')

    console.log(`[generateTrip] Completed successfully for: ${input.destination}`)
    
    return {
      destination: input.destination,
      country: country,
      tips: tipsWithImages,
      summary: summary.trim(),
      bestTimeToVisit: undefined,
      currency: undefined,
      language: undefined,
    }
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
}

function parseTipsWithPlaceId(tipsText: string): ParsedTip[] {
  const tips: ParsedTip[] = []
  
  if (!tipsText || tipsText.trim().length === 0) {
    console.warn('Empty tips text')
    return tips
  }
  
  // Regex pre formát: Tip X: place_id | category | description | duration | price
  const tipRegex = /(?:Tip\s*)?\d+[.:]\s*([A-Za-z0-9_-]+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\|\s*(.+?)\s*(?:\|\s*(.+?))?)?(?=\s*(?:Tip\s*)?\d+[.:]|$)/gis
  
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
      
      if (place_id && description && place_id.length > 5 && description.length > 20) {
        tips.push({
          place_id,
          category: finalCategory,
          description,
          duration: duration || undefined,
          price: price || undefined,
        })
      } else {
        console.warn(`Skipping invalid tip: place_id="${place_id}", desc="${description.substring(0, 30)}"`)
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
      let placeIdPart = parts[0] || ''
      placeIdPart = placeIdPart.replace(/^(?:Tip\s*)?\d+[.:]\s*/, '').trim()
      
      if (parts.length >= 3 && placeIdPart) {
        const category = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
        const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
        const finalCategory = validCategories.includes(category as TripTip['category']) 
          ? (category as TripTip['category'])
          : 'attraction'
        
        tips.push({
          place_id: placeIdPart,
          category: finalCategory,
          description: parts[2] || parts[1] || line,
          duration: parts[3] || undefined,
          price: parts[4] || undefined,
        })
      }
    }
  }
  
  console.log(`Final parsed tips count: ${tips.length}`)
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
