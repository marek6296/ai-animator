import { generateImage, generateText } from './aiService'
import type { UserInput, Comic, ComicPanel } from '@/types'

export async function generateComic(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Comic> {
  // Vytvor priamo panel z vstupov používateľa - bez generovania príbehu cez GPT
  onProgress?.(5, 'Vytváram komiksový panel z vašich vstupov...')
  
  // Vytvor priamo panel z vstupov
  let panelDescription = ''
  let panelText = ''
  
  if (input.simpleDescription) {
    // Jednoduchý režim - použijeme simpleDescription priamo
    panelDescription = input.simpleDescription
    panelText = '...' // Dialóg sa môže pridať neskôr ak bude potreba
  } else {
    // Detailný režim - zostavíme popis z vstupov
    panelDescription = `${input.situation}`
    if (input.self) {
      panelDescription += ` Hlavná postava: ${input.self}.`
    }
    if (input.friends) {
      panelDescription += ` Ostatné postavy: ${input.friends}.`
    }
    panelText = '...'
  }
  
  // Pridaj rozšírené možnosti
  if (input.emotions) {
    panelDescription += ` Emócie: ${input.emotions}.`
  }
  if (input.action) {
    panelDescription += ` Akcia: ${input.action}.`
  }
  if (input.environment) {
    panelDescription += ` Prostredie: ${input.environment}.`
  }
  if (input.mood) {
    panelDescription += ` Atmosféra: ${input.mood}.`
  }
  
  // Vytvor panel objekt
  const panels = [{
    description: panelDescription,
    text: panelText
  }]
  
  // Vygeneruj obrázky pre každý panel
  const comicPanels: ComicPanel[] = []
  
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i]
    const panelProgress = 15 + (i / panels.length) * 70
    
    onProgress?.(panelProgress, `Generujem panel ${i + 1} z ${panels.length}...`)
    
    // Validácia panela
    if (!panel.description || panel.description.trim().length === 0) {
      console.warn(`Panel ${i + 1} nemá popis, používam fallback`)
      panel.description = `Scéna z príbehu o ${input.situation}`
    }
    
    if (!panel.text || panel.text.trim().length === 0) {
      console.warn(`Panel ${i + 1} nemá text, používam fallback`)
      panel.text = '...'
    }
    
    // Vylepšený prompt pre profesionálny komiks
    const { getStylePromptEnhancement } = await import('./loraModels')
    const styleEnhancement = input.style ? getStylePromptEnhancement(input.style) : 'high quality, professional comic book art, detailed, masterpiece'
    
    // Zostav detailný a presný prompt
    // Používame PRIAMO vstupy používateľa - žiadne náhodné prvky
    let extendedPrompt = `Professional comic book panel.`
    
    // Zostav detailný popis scény z vstupov používateľa
    let sceneDescription = ''
    
    if (input.simpleDescription) {
      sceneDescription = input.simpleDescription
    } else {
      // Detailný režim - zostavíme presný popis
      if (input.self) {
        sceneDescription += `Main character: ${input.self}. `
      }
      if (input.situation) {
        sceneDescription += `Situation: ${input.situation}. `
      }
      if (input.friends) {
        sceneDescription += `Other characters: ${input.friends}. `
      }
    }
    
    // Pridaj rozšírené možnosti
    if (input.environment) {
      sceneDescription += `Setting/environment: ${input.environment}. `
    }
    if (input.action) {
      sceneDescription += `Action happening: ${input.action}. `
    }
    if (input.emotions) {
      sceneDescription += `Emotions/expressions: ${input.emotions}. `
    }
    if (input.mood) {
      sceneDescription += `Mood/atmosphere: ${input.mood}. `
    }
    
    // Hlavný popis scény
    extendedPrompt += ` Scene: ${sceneDescription.trim()}`
    
    // Ak je referenčná fotka, pridáme inštrukcie pre tvár
    if (input.useReferenceImage && input.referenceImage) {
      extendedPrompt += ` The main character's face should look similar to the reference photo (same eye shape, nose, mouth, hair style and color, skin tone, age, gender, facial structure).`
    }
    
    // Štýl a kvalita
    extendedPrompt += ` ${styleEnhancement}.`
    extendedPrompt += ` Professional comic book art style, high quality, detailed, colorful, dynamic composition, proper lighting, expressive characters.`
    extendedPrompt += ` Draw this scene exactly as described. Do not add random elements. Follow the description precisely.`
    extendedPrompt += ` All texts and dialogues must be in Slovak.`
    
    try {
      // Pre komiks NEPOUŽÍVAME img2img - generujeme úplne nový panel podľa príbehu
      // Fotka sa použila len v prompte ako textová referencia pre tvár
      // Toto zabezpečí, že sa generuje nový panel podľa príbehu, nie transformácia fotky
      const imageUrl = await generateImage(
        extendedPrompt, 
        input.style,
        2,
        undefined, // NEPOUŽÍVAME img2img pre komiks - len textový popis tváre v prompte
        undefined
      )
      
      if (!imageUrl) {
        throw new Error(`Nepodarilo sa vygenerovať obrázok pre panel ${i + 1}`)
      }
      
      comicPanels.push({
        panelNumber: i + 1,
        text: panel.text.trim(),
        imageUrl,
      })
    } catch (error: any) {
      console.error(`Chyba pri generovaní panelu ${i + 1}:`, error)
      // Pokračujeme s ďalšími panelmi, ale logujeme chybu
      if (comicPanels.length === 0) {
        throw new Error(`Nepodarilo sa vygenerovať žiadny panel: ${error.message}`)
      }
    }
  }
  
  // Validácia - musíme mať aspoň 1 panel s obrázkom
  if (comicPanels.length === 0) {
    throw new Error('Nepodarilo sa vygenerovať žiadny panel komiksu')
  }

  // Vygeneruj názov komiksu
  onProgress?.(90, 'Generujem názov komiksu...')
  const titlePrompt = `Vytvor krátky, vtipný názov komiksu (max 5 slov) na základe tejto situácie: ${input.situation}
  
  Odpovedaj LEN názvom, bez dodatočného textu.`
  const title = await generateText(titlePrompt)
  const cleanTitle = title.replace(/['"]/g, '').trim().split('\n')[0].split('.')[0]
  onProgress?.(100, 'Komiks hotový!')

  return {
    title: cleanTitle || 'Môj komiks',
    panels: comicPanels,
  }
}

function parseStoryToPanels(storyText: string): Array<{ description: string; text: string }> {
  const panels: Array<{ description: string; text: string }> = []
  
  if (!storyText || storyText.trim().length === 0) {
    return panels
  }
  
  // Skús nájsť panely v rôznych formátoch
  // Formát 1: Panel 1: [popis] | [text]
  const panelRegex1 = /Panel\s+(\d+):\s*(.+?)\s*\|\s*(.+?)(?=Panel|[\n\n]|$)/gi
  const matches1 = Array.from(storyText.matchAll(panelRegex1))
  
  if (matches1.length > 0) {
    for (const match of matches1) {
      const description = match[2]?.trim() || ''
      const text = match[3]?.trim() || ''
      
      if (description.length > 0 || text.length > 0) {
        panels.push({ description, text })
      }
    }
  }
  
  // Ak sa nepodarilo parsovať, skús alternatívny formát
  if (panels.length === 0) {
    // Formát 2: Panel 1: [text bez |]
    const panelRegex2 = /Panel\s+(\d+):\s*(.+?)(?=Panel|[\n\n]|$)/gi
    const matches2 = Array.from(storyText.matchAll(panelRegex2))
    
    if (matches2.length > 0) {
      for (const match of matches2) {
        const text = match[2]?.trim() || ''
        if (text.length > 0) {
          // Rozdelíme text na popis a dialóg
          const parts = text.split(/[.,!?]/).filter(p => p.trim().length > 0)
          const description = parts.slice(0, -1).join('. ').trim() || text.substring(0, 100)
          const dialog = parts[parts.length - 1]?.trim() || text.substring(text.length - 50)
          
          panels.push({
            description: description || text.substring(0, 100),
            text: dialog || '...',
          })
        }
      }
    }
  }
  
  // Ak sa stále nepodarilo parsovať, vytvor panely manuálne
  if (panels.length === 0) {
    const lines = storyText.split('\n').filter(line => line.trim() && !line.match(/^Panel\s+\d+:/i))
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length > 0) {
      const chunkSize = Math.max(1, Math.ceil(sentences.length / 2))
      
      for (let i = 0; i < 2 && i * chunkSize < sentences.length; i++) {
        const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize)
        const description = chunk.join('. ').trim().substring(0, 200)
        const text = chunk[chunk.length - 1]?.trim() || '...'
        
        panels.push({ description, text })
      }
    } else if (lines.length > 0) {
      const chunkSize = Math.max(1, Math.ceil(lines.length / 2))
      
      for (let i = 0; i < 2 && i * chunkSize < lines.length; i++) {
        const chunk = lines.slice(i * chunkSize, (i + 1) * chunkSize)
        panels.push({
          description: chunk.join(' ').trim().substring(0, 200),
          text: chunk[chunk.length - 1]?.trim() || '...',
        })
      }
    }
  }
  
  // Validácia a očistenie panelov
  const validPanels = panels
    .filter(panel => panel.description.trim().length > 0 || panel.text.trim().length > 0)
    .slice(0, 1) // Len 1 panel pre rýchle generovanie
  
  return validPanels.length > 0 ? validPanels : [
    { description: 'Začiatok príbehu', text: '...' },
    { description: 'Koniec príbehu', text: '...' },
  ]
}

