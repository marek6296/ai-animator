/**
 * Služba na získavanie obrázkov z Google Custom Search API
 * Google Custom Search API poskytuje prístup k Google Obrázkom
 * Bezplatný limit: 100 requestov/deň
 * 
 * Nastavenie:
 * 1. Vytvorte Google Custom Search Engine: https://cse.google.com/cse/
 * 2. Povoľte "Search entire web" a "Image search"
 * 3. Získajte API key: https://console.cloud.google.com/apis/credentials
 * 4. Pridajte do .env: GOOGLE_API_KEY a GOOGLE_CSE_ID
 */

export async function getImageFromUnsplash(query: string): Promise<string> {
  // Táto funkcia VŽDY vráti URL - nikdy null
  if (!query || query.trim().length === 0) {
    // Ak je query prázdne, vráťme generický obrázok
    console.log(`⚠ Empty query, using generic fallback`)
    return `https://source.unsplash.com/800x600/?travel,tourism`
  }

  try {
    // Metóda 1: Google Custom Search API (najlepšie výsledky - Google Obrázky)
    const googleApiKey = process.env.GOOGLE_API_KEY
    const googleCseId = process.env.GOOGLE_CSE_ID
    
    if (googleApiKey && googleCseId) {
      try {
        // Použijeme num=10 aby sme mali viac možností na výber najrelevantnejšieho obrázka
        // imgSize=large pre kvalitné obrázky, imgType=photo pre fotografie (nie kresby/ilustrácie)
        // Pridáme site:maps.google.com alebo site:google.com/maps pre prioritizáciu Google Maps
        // Najprv skúsime Google Maps špecificky
        const mapsQuery = `${query.trim()} site:maps.google.com OR site:google.com/maps`
        const encodedMapsQuery = encodeURIComponent(mapsQuery)
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCseId}&q=${encodedMapsQuery}&searchType=image&num=10&safe=active&imgSize=large&imgType=photo&fileType=jpg`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // Zvýšený timeout
        
        try {
          const response = await fetch(googleUrl, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            if (data.items && data.items.length > 0) {
              // Extrahujme kľúčové slová z query pre matching
              // Odstránime úvodzovky, site: a OR a rozdělíme na slová
              const cleanQuery = query.toLowerCase()
                .replace(/"/g, '') // Odstránime úvodzovky
                .replace(/site:[\w.]+/g, '') // Odstránime site:maps.google.com
                .replace(/\s+OR\s+/g, ' ') // Odstránime OR
              const queryWords = cleanQuery
                .split(/\s+/)
                .filter(w => w.length > 2 && !['the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'in', 'landmark', 'monument', 'restaurant', 'hotel', 'activity', 'accommodation'].includes(w))
              
              // Extrahujme hlavné kľúčové slová (prvé dve slová v úvodzovkách sú najdôležitejšie)
              const quotedParts = query.match(/"([^"]+)"/g) || []
              const mainKeywords = quotedParts.map(p => p.replace(/"/g, '').toLowerCase().split(/\s+/)).flat()
              
              // Extrahujme englishCity z query
              const cityMatch = query.match(/"([^"]+)"/g)
              const englishCity = cityMatch && cityMatch.length > 1 ? cityMatch[1].replace(/"/g, '').toLowerCase() : ''
              
              // Skúsime nájsť najrelevantnejší obrázok
              // Prejdeme cez výsledky a vyberieme najrelevantnejší
              let bestMatch = null
              let bestScore = 0
              
              for (const item of data.items) {
                if (!item.link) continue
                
                // Overíme kvalitu obrázka - ak nemáme informácie o veľkosti, použijeme obrázok
                const width = item.image?.width || 0
                const height = item.image?.height || 0
                // Ak máme informácie o veľkosti a je príliš malá, preskočíme
                if (width > 0 && height > 0 && (width < 200 || height < 150)) continue
                
                // Skóre relevance - počet zhodných kľúčových slov v title alebo URL
                let score = 0
                const title = (item.title || '').toLowerCase()
                const link = (item.link || '').toLowerCase()
                const snippet = (item.snippet || '').toLowerCase()
                const displayLink = (item.displayLink || '').toLowerCase()
                
                // Skóre na základe zhodných kľúčových slov
                // Hlavné kľúčové slová (z úvodzoviek) sú najdôležitejšie
                for (const word of mainKeywords) {
                  if (word.length < 3) continue
                  
                  // Veľký bonus ak hlavné kľúčové slovo je v title
                  if (title.includes(word)) score += 10
                  // Bonus ak je v link
                  if (link.includes(word) || displayLink.includes(word)) score += 5
                  // Menej bonus ak je v snippet
                  if (snippet.includes(word)) score += 2
                }
                
                // Ostatné kľúčové slová
                for (const word of queryWords) {
                  if (word.length < 3 || mainKeywords.includes(word)) continue
                  
                  if (title.includes(word)) score += 3
                  if (link.includes(word) || displayLink.includes(word)) score += 2
                  if (snippet.includes(word)) score += 1
                }
                
                // Veľká penalizácia za neadekvátne slová
                const negativeWords = ['beach', 'ocean', 'sea', 'mountain', 'forest', 'nature', 'animal', 'person', 'people', 'portrait', 'face', 'close-up', 'abstract', 'art', 'drawing', 'illustration', 'cartoon', 'sketch', 'interior', 'inside', 'room']
                for (const negWord of negativeWords) {
                  if (title.includes(negWord) && !queryWords.some(qw => qw.includes(negWord))) {
                    score -= 20 // Veľká penalizácia za neadekvátne slová
                  }
                  if (snippet.includes(negWord) && !queryWords.some(qw => qw.includes(negWord))) {
                    score -= 10
                  }
                }
                
                // MASSIVE bonus za Google Maps - toto je najdôležitejšie!
                if (link.includes('maps.google.com') || link.includes('google.com/maps') || displayLink.includes('maps.google.com') || displayLink.includes('google.com/maps')) {
                  score += 100 // OBROVSKÝ bonus za Google Maps - prioritizujeme toto!
                }
                
                // Bonus za zdroje, ktoré majú presné obrázky miest
                const trustedSources = ['streetview', 'wikipedia', 'wikimedia', 'commons', 'tripadvisor', 'getty', 'alamy']
                for (const source of trustedSources) {
                  if (link.includes(source) || displayLink.includes(source)) {
                    score += 15 // Veľký bonus za dôveryhodné zdroje
                  }
                }
                
                // Bonus ak URL obsahuje názov miesta (často znamená presný obrázok)
                const hasExactMatch = mainKeywords.some(keyword => {
                  const keywordLower = keyword.toLowerCase()
                  return link.includes(keywordLower) || displayLink.includes(keywordLower)
                })
                if (hasExactMatch) {
                  score += 25 // Veľký bonus za presný match v URL
                }
                
                // Bonus za dobrú veľkosť
                if (width >= 800 && height >= 600) score += 3
                if (width >= 1200 && height >= 900) score += 5
                
                // Veľký bonus ak obsahuje názov miesta A destináciu
                const hasMainKeyword = mainKeywords.length > 0 && mainKeywords.some(w => title.includes(w))
                const hasCity = englishCity && (title.includes(englishCity) || link.includes(englishCity) || displayLink.includes(englishCity))
                if (hasMainKeyword && hasCity) {
                  score += 20 // Veľký bonus za oboje
                } else if (hasMainKeyword) {
                  score += 5 // Menší bonus len za hlavné kľúčové slovo
                }
                
                // Penalizácia ak obrázok neobsahuje žiadne kľúčové slová
                if (score <= 0) {
                  score = -10 // Veľká penalizácia
                }
                
                if (score > bestScore) {
                  bestScore = score
                  bestMatch = item.link
                }
              }
              
              // Ak sme našli dobrý match, použijeme ho
              if (bestMatch && bestScore > -50) { // Použijeme aj obrázky s nízkym skóre, ale nie príliš negatívnym
                if (bestScore > 0) {
                  console.log(`✓ Google found relevant image for "${query}" (score: ${bestScore})`)
                } else {
                  console.log(`⚠ Google found image with low score for "${query}" (score: ${bestScore}), using anyway`)
                }
                return bestMatch
              }
              
              // Fallback: vezmeme prvý obrázok s dobrou veľkosťou
              for (const item of data.items) {
                if (item.link) {
                  const width = item.image?.width || 0
                  const height = item.image?.height || 0
                  // Ak nemáme veľkosť alebo je dostatočne veľká
                  if (width === 0 && height === 0) {
                    // Bez informácií o veľkosti - použijeme
                    console.log(`✓ Google found image for "${query}" (unknown size, fallback)`)
                    return item.link
                  } else if (width >= 200 && height >= 150) {
                    console.log(`✓ Google found image for "${query}" (${width}x${height}, fallback)`)
                    return item.link
                  }
                }
              }
              
              // Posledný fallback: akýkoľvek obrázok (aj bez informácií o veľkosti)
              for (const item of data.items) {
                if (item.link) {
                  console.log(`✓ Google found image for "${query}" (any size, last fallback)`)
                  return item.link
                }
              }
              
              // Ak sme tu, Google nenašiel žiadny obrázok - pokračujeme na ďalšie zdroje
              console.warn(`⚠ Google: No image found for "${query}", trying next source...`)
            } else {
              console.warn(`Google API: No results for "${query}", trying next source...`)
            }
          } else if (response.status === 429) {
            console.warn('Google API rate limit reached, trying next source...')
          } else {
            const errorData = await response.json().catch(() => ({}))
            const errorMsg = errorData.error?.message || 'Unknown error'
            console.warn(`Google API error (${response.status}):`, errorMsg)
            // Ak je to 403 (Forbidden), možno API key nie je správne nastavený
            if (response.status === 403) {
              console.error('Google API: 403 Forbidden - skontrolujte API key a CSE ID')
            }
            // Pokračujeme na ďalšie zdroje
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId)
          if (fetchError.name !== 'AbortError') {
            console.warn('Google API fetch error:', fetchError.message)
            // Pokračujeme na ďalšie zdroje
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn('Google API error:', error.message)
          // Pokračujeme na ďalšie zdroje
        }
      }
    }
    
    // Metóda 2: Pexels API (bezplatné, 200 req/hod bez API key)
    try {
      const pexelsKey = process.env.PEXELS_API_KEY
      const encodedQuery = encodeURIComponent(query.trim())
      
      // Skúsime najprv s viacerými výsledkami
      const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=3&orientation=landscape&size=large`
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      }
      
      if (pexelsKey) {
        headers['Authorization'] = pexelsKey
      }
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      try {
        const response = await fetch(pexelsUrl, {
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data.photos && data.photos.length > 0) {
            // Skúsime nájsť najlepší obrázok (prioritizujeme large)
            for (const photo of data.photos) {
              const imageUrl = photo.src?.large || photo.src?.medium || photo.src?.original
              if (imageUrl) {
                console.log(`✓ Pexels found image for "${query}"`)
                return imageUrl
              }
            }
          }
        } else if (response.status === 429) {
          console.warn('Pexels rate limit reached, trying next source...')
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name !== 'AbortError') {
          throw fetchError
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Pexels API error:', error.message)
      }
    }
    
    // Metóda 3: Unsplash API (ak máme API key)
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
    if (unsplashKey) {
      try {
        const encodedQuery = encodeURIComponent(query.trim())
        // Zvýšime počet výsledkov na 3
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=3&orientation=landscape&client_id=${unsplashKey}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        try {
          const response = await fetch(apiUrl, {
            headers: {
              'Accept-Version': 'v1',
            },
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              // Skúsime nájsť najlepší obrázok
              for (const result of data.results) {
                const imageUrl = result.urls?.regular || result.urls?.small || result.urls?.thumb
                if (imageUrl) {
                  console.log(`✓ Unsplash found image for "${query}"`)
                  return imageUrl
                }
              }
            }
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId)
          if (fetchError.name !== 'AbortError') {
            throw fetchError
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn('Unsplash API error:', error.message)
        }
      }
    }
    
    // Metóda 4: Placeholder.com alebo iný bezplatný zdroj (Unsplash Source už nefunguje - 503)
    // Použijeme placeholder.com, ktorý vždy funguje
    try {
      const encodedQuery = encodeURIComponent(query.trim())
      // Placeholder.com - vždy funguje, ale je to len placeholder
      // Lepšie je použiť Pexels API, ktoré sme už skúsili vyššie
      // Ale ak všetko zlyhalo, použijeme placeholder
      const placeholderUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=${encodeURIComponent(query.substring(0, 30))}`
      console.log(`⚠ Using placeholder (all sources failed) for "${query}"`)
      return placeholderUrl
    } catch (error) {
      console.warn('Placeholder error:', error)
      // Ako posledný fallback, vráťme jednoduchý placeholder
      const fallbackUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=Travel`
      console.log(`⚠ Using final placeholder fallback: ${fallbackUrl}`)
      return fallbackUrl
    }
  } catch (error) {
    console.error('Error fetching image:', error)
    // Ako posledný fallback, vráťme placeholder
    const fallbackUrl = `https://via.placeholder.com/800x600/1a1a2e/00ffff?text=Travel`
    console.log(`⚠ Using error fallback: ${fallbackUrl}`)
    return fallbackUrl
  }
}

/**
 * Vytvorí optimalizovaný query pre vyhľadávanie obrázkov
 * Prioritizuje názov miesta + destináciu pre najrelevantnejšie výsledky
 */
export function createImageQuery(destination: string, tipTitle: string, category: string): string {
  // Preklad slovenských názvov do angličtiny
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
  
  // Vyčistíme názov miesta - odstránime všeobecné slová
  let cleanTitle = tipTitle
    .replace(/^(v|na|do|z|k|o|s|a|the|a|le|la|les|el|los|las)\s+/gi, '')
    .replace(/\s+(v|na|do|z|k|o|s|a|the|a)$/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .trim()
  
  // Odstránime všeobecné slová, ktoré nepridávajú hodnotu
  const stopWords = ['miesto', 'mesto', 'place', 'location', 'site', 'venue', 'spot']
  cleanTitle = cleanTitle
    .split(/\s+/)
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .join(' ')
    .trim()
  
  // Vytvoríme presnejšie query s viac kontextom a špecifickými kľúčovými slovami
  if (cleanTitle && englishCity) {
    // Pre každú kategóriu použijeme špecifický formát
    let query = ''
    
    if (category === 'attraction') {
      // Pre pamiatky: presný názov + mesto - Google Maps automaticky nájde správny obrázok
      query = `"${cleanTitle}" "${englishCity}"`
    } else if (category === 'restaurant') {
      // Pre reštaurácie: presný názov + mesto
      query = `"${cleanTitle}" "${englishCity}" restaurant`
    } else if (category === 'activity') {
      // Pre aktivity: presný názov + mesto
      query = `"${cleanTitle}" "${englishCity}"`
    } else if (category === 'accommodation') {
      // Pre ubytovanie: presný názov + mesto
      query = `"${cleanTitle}" "${englishCity}" hotel`
    } else {
      // Fallback: presný názov + mesto
      query = `"${cleanTitle}" "${englishCity}"`
    }
    
    console.log(`Image query: "${query}" (from: "${tipTitle}" in "${destination}")`)
    return query
  }
  
  // Fallback ak nie je názov - použijeme destináciu + kategóriu
  if (englishCity) {
    const categoryKeywords: Record<string, string> = {
      'attraction': 'landmark',
      'restaurant': 'restaurant',
      'activity': 'activity',
      'accommodation': 'hotel',
    }
    const categoryKeyword = categoryKeywords[category] || 'travel'
    const query = `${categoryKeyword} in ${englishCity}`
    console.log(`Image query (destination + category): "${query}"`)
    return query
  }
  
  return cleanTitle || 'travel'
}

/**
 * Vytvorí alternatívne query pre retry
 */
export function createAlternativeQuery(destination: string, tipTitle: string, category: string): string[] {
  const alternatives: string[] = []
  
  // Alternatíva 1: Len názov miesta + destinácia (bez kategórie)
  if (tipTitle && destination) {
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
    
    let cleanTitle = tipTitle.replace(/^(v|na|do|z|k|o|s|a|the|a|le|la|les|el|los|las)\s+/gi, '')
      .replace(/\s+(v|na|do|z|k|o|s|a|the|a)$/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(' ')
    
    const englishCity = cityTranslations[destination] || destination
    alternatives.push(`${cleanTitle} ${englishCity}`.trim())
  }
  
  // Alternatíva 2: Len destinácia + kategória
  if (destination) {
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
    
    const categoryMap: Record<string, string> = {
      'attraction': 'landmark',
      'restaurant': 'restaurant',
      'activity': 'activity',
      'accommodation': 'hotel',
      'tip': 'travel',
    }
    
    const englishCity = cityTranslations[destination] || destination
    const categoryKeyword = categoryMap[category] || 'travel'
    alternatives.push(`${englishCity} ${categoryKeyword}`)
  }
  
  // Alternatíva 3: Len destinácia
  if (destination) {
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
    alternatives.push(englishCity)
  }
  
  return alternatives
}
