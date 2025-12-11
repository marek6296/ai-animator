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
      user_ratings_total: 0,
      types: place.types || [],
      formatted_address: place.formatted_address,
    }))

    // KROK 3: Zavolaj OpenAI na vytvorenie itinerára
    onProgress?.(30, 'Generujem itinerár pomocou AI...')
    
    // Vytvor zoznam miest v jednoduchšom formáte pre OpenAI
    const placesList = placesForAI.length > 0
      ? placesForAI.slice(0, 50).map((place, index) => {
          return `${index + 1}. ${place.name} (ID: ${place.place_id}) - ${place.formatted_address}${place.rating ? ` - ⭐ ${place.rating}/5` : ''}`
        }).join('\n')
      : `Žiadne konkrétne miesta z Google Maps nie sú k dispozícii. Vytvor všeobecné tipy na výlet do ${input.destination} na základe tvojich znalostí.`

    // Vytvor mapu názov -> place_id pre fallback matching
    const nameToPlaceId = new Map<string, string>()
    for (const place of placesForAI) {
      nameToPlaceId.set(place.name.toLowerCase().trim(), place.place_id)
    }

    const aiPrompt = finalPlaces.length > 0
      ? `Vytvor detailný plán výletu do ${input.destination} v Európe.

Mám zoznam skutočných miest z Google Maps:
${placesList}

${input.tripType ? `Typ výletu: ${input.tripType === 'city' ? 'mestský' : input.tripType === 'nature' ? 'prírodný' : 'kultúrny'}.` : ''}
${input.duration ? `Dĺžka výletu: ${input.duration} dní.` : ''}
${input.interests ? `Záujmy: ${input.interests}.` : ''}
${input.budget ? `Rozpočet: ${input.budget === 'low' ? 'nízky' : input.budget === 'medium' ? 'stredný' : 'vysoký'}.` : ''}

Vytvor 10-12 tipov na výlet. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [NÁZOV MIESTA PRESNE AKO V ZOZNAME] | [Kategória] | [Popis 50-100 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
Tip 3: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
... (pokračuj až do Tip 12)

Kategórie (použi presne tieto hodnoty):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Prvé pole MUSÍ byť PRESNÝ názov miesta z vyššie uvedeného zoznamu (presne taký, ako je v zozname)
3. Všetky polia MUSIA byť oddelené znakom | (pipe)
4. Všetky texty MUSIA byť v slovenčine
5. Vytvor MINIMÁLNE 10 tipov, ideálne 12
6. Zahrň rôzne kategórie - aspoň 3-4 attraction, 2-3 activity, 2 restaurant, 1-2 accommodation, 1-2 tip
7. Popis musí byť detailný a zaujímavý (50-100 slov)
8. Použi LEN názvy miest z poskytnutého zoznamu - NIKDY nevymýšľaj nové miesta

Príklad správneho formátu:
Tip 1: Colosseum | attraction | Toto je najznámejšia pamiatka v meste... | 2-3 hodiny | €15-20
Tip 2: Trattoria da Enzo | restaurant | Táto reštaurácia ponúka... | 1-2 hodiny | €30-50

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`
      : `Vytvor detailný plán výletu do ${input.destination} v Európe.

${input.tripType ? `Typ výletu: ${input.tripType === 'city' ? 'mestský' : input.tripType === 'nature' ? 'prírodný' : 'kultúrny'}.` : ''}
${input.duration ? `Dĺžka výletu: ${input.duration} dní.` : ''}
${input.interests ? `Záujmy: ${input.interests}.` : ''}
${input.budget ? `Rozpočet: ${input.budget === 'low' ? 'nízky' : input.budget === 'medium' ? 'stredný' : 'vysoký'}.` : ''}

Vytvor 10-12 tipov na výlet. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [NÁZOV MIESTA] | [Kategória] | [Popis 50-100 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
Tip 3: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
... (pokračuj až do Tip 12)

Kategórie (použi presne tieto hodnoty):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Prvé pole MUSÍ byť názov miesta (môžeš použiť známe miesta v ${input.destination})
3. Všetky polia MUSIA byť oddelené znakom | (pipe)
4. Všetky texty MUSIA byť v slovenčine
5. Vytvor MINIMÁLNE 10 tipov, ideálne 12
6. Zahrň rôzne kategórie - aspoň 3-4 attraction, 2-3 activity, 2 restaurant, 1-2 accommodation, 1-2 tip
7. Popis musí byť detailný a zaujímavý (50-100 slov)

Príklad správneho formátu:
Tip 1: Koloseum | attraction | Toto je najznámejšia pamiatka v meste... | 2-3 hodiny | €15-20
Tip 2: Trattoria da Enzo | restaurant | Táto reštaurácia ponúka... | 1-2 hodiny | €30-50

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`

${input.tripType ? `Typ výletu: ${input.tripType === 'city' ? 'mestský' : input.tripType === 'nature' ? 'prírodný' : 'kultúrny'}.` : ''}
${input.duration ? `Dĺžka výletu: ${input.duration} dní.` : ''}
${input.interests ? `Záujmy: ${input.interests}.` : ''}
${input.budget ? `Rozpočet: ${input.budget === 'low' ? 'nízky' : input.budget === 'medium' ? 'stredný' : 'vysoký'}.` : ''}

Vytvor 10-12 tipov na výlet. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [NÁZOV MIESTA PRESNE AKO V ZOZNAME] | [Kategória] | [Popis 50-100 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
Tip 3: [NÁZOV] | [Kategória] | [Popis] | [Trvanie] | [Cena]
... (pokračuj až do Tip 12)

Kategórie (použi presne tieto hodnoty):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Prvé pole MUSÍ byť PRESNÝ názov miesta z vyššie uvedeného zoznamu (presne taký, ako je v zozname)
3. Všetky polia MUSIA byť oddelené znakom | (pipe)
4. Všetky texty MUSIA byť v slovenčine
5. Vytvor MINIMÁLNE 10 tipov, ideálne 12
6. Zahrň rôzne kategórie - aspoň 3-4 attraction, 2-3 activity, 2 restaurant, 1-2 accommodation, 1-2 tip
7. Popis musí byť detailný a zaujímavý (50-100 slov)
8. Použi LEN názvy miest z poskytnutého zoznamu - NIKDY nevymýšľaj nové miesta

Príklad správneho formátu:
Tip 1: Colosseum | attraction | Toto je najznámejšia pamiatka v meste... | 2-3 hodiny | €15-20
Tip 2: Trattoria da Enzo | restaurant | Táto reštaurácia ponúka... | 1-2 hodiny | €30-50

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`

    const tipsText = await generateText(aiPrompt)
    onProgress?.(50, 'Spracovávam tipy...')
    
    console.log('AI Response (first 2000 chars):', tipsText.substring(0, 2000))
    console.log('AI Response (full length):', tipsText.length)
    
    // Parsuj tipy - teraz očakávame názov miesta ako prvé pole, potom nájdeme place_id
    const tips = parseTipsByName(tipsText, nameToPlaceId)
    
    console.log(`Parsed ${tips.length} tips`)
    
    if (tips.length === 0) {
      // Ak parsing zlyhal, skúsime ešte raz s jednoduchším formátom
      console.warn('First parsing attempt failed, trying simpler format...')
      const simpleTips = parseTipsSimple(tipsText, nameToPlaceId)
      if (simpleTips.length > 0) {
        console.log(`Simple parsing succeeded: ${simpleTips.length} tips`)
        return await generateTripWithTips(simpleTips, finalPlaces, input, onProgress)
      }
      
      // Ak ani jednoduché parsovanie nefunguje, ale máme miesta, vytvor tipy z miest
      if (finalPlaces.length > 0) {
        console.warn('Creating tips from places directly since parsing failed')
        const fallbackTips: ParsedTip[] = finalPlaces.slice(0, 12).map((place) => ({
          place_id: place.place_id,
          category: 'attraction' as TripTip['category'],
          description: `Navštívte ${place.name} v ${input.destination}. ${place.formatted_address || ''}`,
        }))
        return await generateTripWithTips(fallbackTips, finalPlaces, input, onProgress)
      }
      
      // Ak nemáme žiadne miesta, vytvor tipy len z AI odpovede (bez place_id)
      console.warn('No places available, creating tips from AI response only')
      const aiOnlyTips = parseTipsWithoutPlaceId(tipsText)
      if (aiOnlyTips.length > 0) {
        console.log(`Created ${aiOnlyTips.length} tips from AI response (without place_id)`)
        return await generateTripWithoutPlaces(aiOnlyTips, input, onProgress)
      }
      
      console.error('Failed to parse tips. Raw text:', tipsText)
      throw new Error('Nepodarilo sa vytvoriť tipy. Skúste to znova.')
    }
    
    // KROK 4: Spoj place_id s miestami z Google Places a získaj fotky
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
      
      // Ak sme nenašli presnú zhodu, skúsime fuzzy match
      if (!place_id) {
        for (const [name, id] of nameToPlaceId.entries()) {
          if (name.includes(placeNameLower) || placeNameLower.includes(name)) {
            place_id = id
            console.log(`✓ Found fuzzy match: "${placeName}" -> "${name}" (place_id: ${id})`)
            break
          }
        }
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
