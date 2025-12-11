import { generateText } from './aiService'
import { getImageFromUnsplash, createImageQuery, createAlternativeQuery } from './imageService'
import { getMultipleCoordinates } from './geocodingService'
import { searchPlacesInCity, findPlaceByName, getPlacePhotoUrl, type Place } from './placesService'
import type { UserInput, Trip, TripTip } from '@/types'

// Zoznam európskych miest a krajín
const EUROPEAN_DESTINATIONS = [
  'Paríž', 'Londýn', 'Rím', 'Barcelona', 'Amsterdam', 'Berlín', 'Viedeň', 'Praha',
  'Budapešť', 'Krakow', 'Atény', 'Lisabon', 'Dublin', 'Edinburgh', 'Kodaň', 'Štokholm',
  'Oslo', 'Helsinki', 'Reykjavík', 'Zürich', 'Miláno', 'Florencia', 'Venezia', 'Neapol',
  'Madrid', 'Sevilla', 'Valencia', 'Porto', 'Brusel', 'Antverpy', 'Bruggy', 'Luxemburg',
  'Varšava', 'Gdańsk', 'Wrocław', 'Bratislava', 'Ljubljana', 'Záhreb', 'Sarajevo', 'Belehrad',
  'Bukurešť', 'Sofia', 'Tirana', 'Skopje', 'Podgorica', 'Pristina', 'Tallinn', 'Riga', 'Vilnius',
  'Kyjev', 'Minsk', 'Moskva', 'Istanbul', 'Ankara', 'Nicosia', 'Valletta', 'Monaco', 'San Marino',
  'Vatican', 'Andorra la Vella', 'Lichtenštajnsko'
]

export async function generateTrip(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Trip> {
  try {
    if (!input.destination) {
      throw new Error('Destinácia je povinná')
    }

    console.log(`[generateTrip] Starting for destination: ${input.destination}`)
    onProgress?.(5, 'Generujem plán výletu...')

  // Vytvor prompt pre generovanie trip tips
  let tripPrompt = `Vytvor detailný plán výletu do ${input.destination} v Európe.`
  
  if (input.tripType) {
    const tripTypeNames: Record<string, string> = {
      'city': 'mestský',
      'nature': 'prírodný',
      'culture': 'kultúrny'
    }
    tripPrompt += ` Typ výletu: ${tripTypeNames[input.tripType] || input.tripType}.`
  }
  
  if (input.duration) {
    tripPrompt += ` Dĺžka výletu: ${input.duration} dní.`
  }
  
  if (input.interests) {
    tripPrompt += ` Záujmy: ${input.interests}.`
  }
  
  if (input.budget) {
    const budgetNames: Record<string, string> = {
      'low': 'nízky',
      'medium': 'stredný',
      'high': 'vysoký'
    }
    tripPrompt += ` Rozpočet: ${budgetNames[input.budget] || input.budget}.`
  }

  tripPrompt += `

Vytvor 10-12 tipov na výlet do ${input.destination}. Pre každý tip MUSÍŠ použiť tento PRESNÝ formát (každý tip na novom riadku):
Tip 1: [Názov miesta/aktivity] | [Kategória] | [Popis 50-100 slov v slovenčine] | [Trvanie] | [Cena]
Tip 2: [Názov] | [Kategória] | [Popis] | [Trvanie] | [Cena]
Tip 3: [Názov] | [Kategória] | [Popis] | [Trvanie] | [Cena]
... (pokračuj až do Tip 12)

Kategórie (použi presne tieto hodnoty):
- attraction (pre pamiatky, múzeá, historické miesta)
- activity (pre aktivity, zábavu, športy)
- restaurant (pre reštaurácie, kaviarne, jedlo)
- accommodation (pre ubytovanie, hotely)
- tip (pre užitočné tipy, rady, praktické informácie)

Príklady:
Tip 1: Eiffelova veža | attraction | Eiffelova veža je ikonická oceľová veža v Paríži, ktorá je jednou z najznámejších pamiatok na svete. | 2-3 hodiny | €25-30
Tip 2: Louvre | attraction | Louvre je najväčšie múzeum na svete s obrovskou zbierkou umenia vrátane Mony Lisy. | 3-4 hodiny | €17

DÔLEŽITÉ PRAVIDLÁ:
1. Každý tip MUSÍ začínať "Tip X:" kde X je číslo
2. Všetky polia MUSIA byť oddelené znakom | (pipe)
3. Všetky texty MUSIA byť v slovenčine
4. Vytvor MINIMÁLNE 10 tipov, ideálne 12
5. Zahrň rôzne kategórie - aspoň 3-4 attraction, 2-3 activity, 2 restaurant, 1-2 accommodation, 1-2 tip
6. Názvy miest musia byť konkrétne a skutočné (napr. "Eiffelova veža", nie "vysoká veža")
7. Popis musí byť detailný a zaujímavý (50-100 slov)

Vráť LEN zoznam tipov v tomto formáte, bez úvodu, bez záveru, bez dodatočného textu. Začni priamo s "Tip 1:"`

  const tipsText = await generateText(tripPrompt)
  onProgress?.(50, 'Spracovávam tipy...')
  
  // Loguj odpoveď z AI pre debugging
  console.log('AI Response:', tipsText.substring(0, 500))
  
  // Parsuj tipy
  const tips = parseTips(tipsText)
  
  console.log(`Parsed ${tips.length} tips`)
  
  if (tips.length === 0) {
    console.error('Failed to parse tips. Raw text:', tipsText)
    throw new Error('Nepodarilo sa vytvoriť tipy. Skúste to znova.')
  }
  
  if (tips.length < 3) {
    console.warn(`Only ${tips.length} tips parsed. This might be a parsing issue.`)
  }

  // Získame obrázky z Unsplash pre každý tip
  onProgress?.(60, 'Načítavam obrázky...')
  const tipsWithImages: TripTip[] = []
  
  for (let i = 0; i < tips.length; i++) {
    const tip = tips[i]
    const progress = 60 + (i / tips.length) * 15
    
    onProgress?.(progress, `Načítavam obrázok pre: ${tip.title}...`)
    
    try {
      // NAJPRV: Skúsime Google Places Photo API priamo (najpresnejšie)
      let imageUrl: string = ''
      
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
      const englishCity = cityTranslations[input.destination] || input.destination
      
      // Vyčistíme názov miesta
      let cleanTitle = tip.title
        .replace(/^(v|na|do|z|k|o|s|a|the|a|le|la|les|el|los|las)\s+/gi, '')
        .replace(/\s+(v|na|do|z|k|o|s|a|the|a)$/gi, '')
        .trim()
      
      // Skúsime Google Places API priamo
      if (cleanTitle && englishCity) {
        try {
          const { getImageFromGooglePlaces } = await import('@/lib/imageService')
          const placesImage = await getImageFromGooglePlaces(cleanTitle, englishCity)
          if (placesImage) {
            imageUrl = placesImage
            console.log(`✓ Google Places found image for "${tip.title}"`)
          }
        } catch (error) {
          console.warn(`Google Places API failed for "${tip.title}":`, error)
        }
      }
      
      // Ak Google Places nefunguje, použijeme bežné vyhľadávanie
      if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
        // Vytvor query pre vyhľadávanie obrázka
        const imageQuery = createImageQuery(input.destination, tip.title, tip.category)
        console.log(`Image query for "${tip.title}": ${imageQuery}`)
        
        // Získaj obrázok s viacerými pokusmi a fallbackmi
        // getImageFromUnsplash VŽDY vráti URL (nikdy null), takže imageUrl bude vždy string
        let attempts = 0
        const maxAttempts = 10 // Zvýšený počet pokusov
        
        // Pokus 1: Hlavné query
        attempts++
        try {
          imageUrl = await getImageFromUnsplash(imageQuery)
          if (imageUrl && !imageUrl.includes('via.placeholder.com')) {
            console.log(`✓ Found image on first attempt for "${tip.title}"`)
          }
        } catch (error) {
          console.warn(`Error in attempt ${attempts} for "${tip.title}":`, error)
          // Aj pri chybe použijeme placeholder
          imageUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=Travel`
        }
        
        // Pokus 2-6: Alternatívne query (len ak sme nenašli dobrý obrázok)
        if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
          const alternativeQueries = createAlternativeQuery(input.destination, tip.title, tip.category)
          
          for (const altQuery of alternativeQueries) {
            if (imageUrl || attempts >= maxAttempts) break
            
            attempts++
            console.log(`Attempt ${attempts}/${maxAttempts}: Trying alternative query: "${altQuery}"`)
            await new Promise(resolve => setTimeout(resolve, 400)) // Oneskorenie medzi requestmi
            
            try {
              const newImageUrl = await getImageFromUnsplash(altQuery)
              if (newImageUrl && !newImageUrl.includes('via.placeholder.com')) {
                imageUrl = newImageUrl
                console.log(`✓ Found image with alternative query for "${tip.title}"`)
                break
              } else if (!imageUrl) {
                // Ak sme ešte nemali žiadny obrázok, použijeme aj placeholder
                imageUrl = newImageUrl
              }
            } catch (error) {
              console.warn(`Error in attempt ${attempts}:`, error)
              // Aj pri chybe použijeme placeholder
              if (!imageUrl) {
                imageUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=Travel`
              }
            }
          }
        }
      
        // Pokus 7: Len názov miesta (bez destinácie) - viac variácií
        if (!imageUrl && tip.title) {
          attempts++
          let cleanTitle = tip.title
            .replace(/^(v|na|do|z|k|o|s|a|the|a|le|la|les|el|los|las)\s+/gi, '')
            .replace(/\s+(v|na|do|z|k|o|s|a|the|a)$/gi, '')
            .replace(/[^\w\s]/g, ' ')
            .trim()
          
          // Skúsime celý názov
          console.log(`Attempt ${attempts}/${maxAttempts}: Trying full title: "${cleanTitle}"`)
          await new Promise(resolve => setTimeout(resolve, 400))
          try {
            imageUrl = await getImageFromUnsplash(cleanTitle)
          } catch (error) {
            console.warn(`Error in attempt ${attempts}:`, error)
          }
          
          // Ak to nefungovalo, skúsime len prvé 2-3 slová
          if (!imageUrl && attempts < maxAttempts) {
            attempts++
            const titleWords = cleanTitle.split(/\s+/)
            if (titleWords.length > 2) {
              const shortTitle = titleWords.slice(0, 3).join(' ')
              console.log(`Attempt ${attempts}/${maxAttempts}: Trying short title: "${shortTitle}"`)
              await new Promise(resolve => setTimeout(resolve, 400))
              try {
                imageUrl = await getImageFromUnsplash(shortTitle)
              } catch (error) {
                console.warn(`Error in attempt ${attempts}:`, error)
              }
            }
          }
        }
        
        // Pokus 8-9: Destinácia + kategória + názov (rôzne kombinácie)
        if (!imageUrl && attempts < maxAttempts) {
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
          const categoryKeywords: Record<string, string> = {
            'attraction': 'landmark',
            'restaurant': 'restaurant',
            'activity': 'activity',
            'accommodation': 'hotel',
          }
          const englishCity = cityTranslations[input.destination] || input.destination
          const categoryKeyword = categoryKeywords[tip.category] || 'travel'
          
          // Skúsime: názov + destinácia
          if (tip.title && attempts < maxAttempts) {
            attempts++
            let cleanTitle = tip.title
              .replace(/^(v|na|do|z|k|o|s|a|the|a|le|la|les|el|los|las)\s+/gi, '')
              .replace(/\s+(v|na|do|z|k|o|s|a|the|a)$/gi, '')
              .replace(/[^\w\s]/g, ' ')
              .trim()
              .split(/\s+/)
              .slice(0, 3)
              .join(' ')
            const query = `${cleanTitle} ${englishCity}`
            console.log(`Attempt ${attempts}/${maxAttempts}: Trying title + city: "${query}"`)
            await new Promise(resolve => setTimeout(resolve, 400))
            try {
              imageUrl = await getImageFromUnsplash(query)
            } catch (error) {
              console.warn(`Error in attempt ${attempts}:`, error)
            }
          }
          
          // Skúsime: destinácia + kategória
          if (!imageUrl && attempts < maxAttempts) {
            attempts++
            const fallbackQuery = `${englishCity} ${categoryKeyword}`
            console.log(`Attempt ${attempts}/${maxAttempts}: Trying destination + category: "${fallbackQuery}"`)
            await new Promise(resolve => setTimeout(resolve, 400))
            try {
              imageUrl = await getImageFromUnsplash(fallbackQuery)
            } catch (error) {
              console.warn(`Error in attempt ${attempts}:`, error)
            }
          }
        }
        
        // Posledný fallback: Placeholder (Unsplash Source už nefunguje - 503)
        if (!imageUrl) {
          // Použijeme placeholder.com, ktorý vždy funguje
          const placeholderUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=${encodeURIComponent(tip.title.substring(0, 30))}`
          imageUrl = placeholderUrl
          console.log(`⚠ Using placeholder fallback for "${tip.title}": ${placeholderUrl}`)
        }
      }
      
      // VŽDY musíme mať nejaký URL - aj keď je to fallback
      if (!imageUrl) {
        console.error(`✗ CRITICAL: No image found for "${tip.title}"`)
        // Ako posledný pokus, použijeme generický obrázok
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
        // Použijeme placeholder namiesto Unsplash Source (ktorý nefunguje)
        imageUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=${encodeURIComponent(tip.title.substring(0, 30))}`
        console.log(`⚠ Using final placeholder fallback for "${tip.title}": ${imageUrl}`)
      } else {
        console.log(`✓ Final image for "${tip.title}": ${imageUrl.substring(0, 80)}...`)
      }
      
      // VŽDY pridáme tip s imageUrl a place_id/photo_reference
      tipsWithImages.push({
        ...tip,
        imageUrl: imageUrl,
        place_id: place_id,
        photo_reference: photo_reference,
        coordinates: coordinates,
      })
      
      console.log(`✓ Added tip "${tip.title}" with imageUrl: ${imageUrl ? 'YES' : 'NO'}`)
      
      // Väčšie oneskorenie medzi requestmi, aby sme neprekročili rate limit
      // Google API má limit 100 req/deň, takže potrebujeme byť opatrní
      if (i < tips.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay medzi tipmi
      }
    } catch (error) {
      console.error(`Chyba pri získavaní obrázka pre tip ${i + 1} (${tip.title}):`, error)
      // Pokračujeme bez obrázka
      tipsWithImages.push({
        ...tip,
        imageUrl: '',
      })
    }
  }

  onProgress?.(80, 'Vytváram súhrn...')
  
  // Vygeneruj súhrn
  const summaryPrompt = `Vytvor krátky súhrn (3-4 vety) o ${input.destination} v slovenčine. Zahrň základné informácie o meste, jeho histórii, kultúre a prečo je to dobrá destinácia pre výlet.`
  const summary = await generateText(summaryPrompt)
  
  // Extrahuj krajinu (jednoduchá logika)
  const country = extractCountry(input.destination)

    onProgress?.(100, 'Plán výletu hotový!')

    console.log(`[generateTrip] Completed successfully for: ${input.destination}`)
    
    return {
      destination: input.destination,
      country: country,
      tips: tipsWithImages,
      summary: summary.trim(),
      bestTimeToVisit: undefined, // Môžeme pridať neskôr
      currency: undefined, // Môžeme pridať neskôr
      language: undefined, // Môžeme pridať neskôr
    }
  } catch (error: any) {
    console.error(`[generateTrip] Error for destination ${input.destination}:`, error)
    console.error(`[generateTrip] Error stack:`, error.stack)
    throw error // Re-throw aby sa chyba zachytila v route
  }
}

function parseTips(tipsText: string): Omit<TripTip, 'imageUrl'>[] {
  const tips: Omit<TripTip, 'imageUrl'>[] = []
  
  if (!tipsText || tipsText.trim().length === 0) {
    console.warn('Empty tips text')
    return tips
  }
  
  // Vylepšený regex - flexibilnejší na formátovanie
  // Podporuje rôzne formáty: "Tip 1:", "Tip1:", "1.", atď.
  const tipRegex = /(?:Tip\s*)?\d+[.:]\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*(?:\|\s*(.+?)\s*(?:\|\s*(.+?))?)?(?=\s*(?:Tip\s*)?\d+[.:]|$)/gis
  
  const matches = Array.from(tipsText.matchAll(tipRegex))
  
  console.log(`Found ${matches.length} matches with regex`)
  
  if (matches.length > 0) {
    for (const match of matches) {
      const title = match[1]?.trim() || ''
      const category = (match[2]?.trim().toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
      const description = match[3]?.trim() || ''
      const duration = match[4]?.trim() || ''
      const price = match[5]?.trim() || ''
      
      // Validácia kategórie
      const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
      const finalCategory = validCategories.includes(category as TripTip['category']) 
        ? (category as TripTip['category'])
        : 'attraction'
      
      if (title && description && title.length > 2 && description.length > 20) {
        tips.push({
          title,
          description,
          category: finalCategory,
          duration: duration || undefined,
          price: price || undefined,
        })
      } else {
        console.warn(`Skipping invalid tip: title="${title}", desc="${description.substring(0, 30)}"`)
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
      let titlePart = parts[0] || ''
      titlePart = titlePart.replace(/^(?:Tip\s*)?\d+[.:]\s*/, '').trim()
      
      if (parts.length >= 3 && titlePart) {
        const category = (parts[1]?.toLowerCase() || 'attraction').replace(/[^a-z]/g, '')
        const validCategories: TripTip['category'][] = ['attraction', 'activity', 'restaurant', 'accommodation', 'tip']
        const finalCategory = validCategories.includes(category as TripTip['category']) 
          ? (category as TripTip['category'])
          : 'attraction'
        
        tips.push({
          title: titlePart,
          description: parts[2] || parts[1] || line,
          category: finalCategory,
          duration: parts[3] || undefined,
          price: parts[4] || undefined,
        })
      }
    }
  }
  
  // Fallback 2: Ak stále nič, skús rozdeliť podľa čísel
  if (tips.length === 0) {
    console.log('Trying fallback parsing method 2')
    const numberedLines = tipsText.split(/\d+[.:]/).filter(line => line.trim().length > 10)
    for (let i = 0; i < Math.min(numberedLines.length, 12); i++) {
      const line = numberedLines[i].trim()
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim())
        if (parts.length >= 2) {
          tips.push({
            title: parts[0] || `Tip ${i + 1}`,
            description: parts[1] || line,
            category: 'attraction',
            duration: parts[2] || undefined,
            price: parts[3] || undefined,
          })
        }
      }
    }
  }
  
  console.log(`Final parsed tips count: ${tips.length}`)
  return tips.slice(0, 12) // Max 12 tipov
}

function extractCountry(destination: string): string {
  // Jednoduchá logika na extrakciu krajiny
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

