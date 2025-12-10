import { generateImage, generateText } from './aiService'
import type { UserInput, Comic, ComicPanel } from '@/types'

export async function generateComic(input: UserInput): Promise<Comic> {
  // Najprv vygeneruj príbeh komiksu
  const storyPrompt = `Vytvor krátky komiksový príbeh na základe týchto informácií:
- Osoba: ${input.self}
- Situácia: ${input.situation}
- Kamaráti: ${input.friends}

DÔLEŽITÉ: Vytvor presne 4-6 panelov komiksu. Pre každý panel MUSÍŠ použiť tento presný formát:
Panel 1: [stručný popis scény] | [dialóg alebo text]
Panel 2: [stručný popis scény] | [dialóg alebo text]
Panel 3: [stručný popis scény] | [dialóg alebo text]
Panel 4: [stručný popis scény] | [dialóg alebo text]

Každý panel musí byť na samostatnom riadku a musí obsahovať "Panel X:" na začiatku a "|" medzi popisom a textom.
Popis by mal byť stručný (max 50 slov) a text/dialóg by mal byť vtipný alebo zaujímavý.`

  const storyText = await generateText(storyPrompt)
  
  // Parsuj príbeh na panely
  const panels = parseStoryToPanels(storyText)
  
  // Validácia - musíme mať aspoň 1 panel
  if (panels.length === 0) {
    throw new Error('Nepodarilo sa vytvoriť panely komiksu. Skúste to znova s detailnejším popisom.')
  }
  
  // Vygeneruj obrázky pre každý panel
  const comicPanels: ComicPanel[] = []
  
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i]
    
    // Validácia panela
    if (!panel.description || panel.description.trim().length === 0) {
      console.warn(`Panel ${i + 1} nemá popis, používam fallback`)
      panel.description = `Scéna z príbehu o ${input.situation}`
    }
    
    if (!panel.text || panel.text.trim().length === 0) {
      console.warn(`Panel ${i + 1} nemá text, používam fallback`)
      panel.text = '...'
    }
    
    const imagePrompt = `Komiksový panel v štýle moderného farebného komiksu. Scéna: ${panel.description}. 
    Hlavná postava: ${input.self}. Situácia: ${input.situation}. Ostatné postavy: ${input.friends}.
    Štýl: kreslený komiks, farebné, dynamické, expresívne, profesionálne, detaily, čitateľné. 
    Panel by mal byť ako z profesionálneho komiksu s dobrým osvetlením a kompozíciou.`
    
    try {
      const imageUrl = await generateImage(imagePrompt)
      
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
  const titlePrompt = `Vytvor krátky, vtipný názov komiksu (max 5 slov) na základe tejto situácie: ${input.situation}
  
  Odpovedaj LEN názvom, bez dodatočného textu.`
  const title = await generateText(titlePrompt)
  const cleanTitle = title.replace(/['"]/g, '').trim().split('\n')[0].split('.')[0]

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
  const panelRegex1 = /Panel\s+(\d+):\s*(.+?)\s*\|\s*(.+?)(?=Panel|\n\n|$)/gis
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
    const panelRegex2 = /Panel\s+(\d+):\s*(.+?)(?=Panel|\n\n|$)/gis
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
      const chunkSize = Math.max(1, Math.ceil(sentences.length / 4))
      
      for (let i = 0; i < 4 && i * chunkSize < sentences.length; i++) {
        const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize)
        const description = chunk.join('. ').trim().substring(0, 200)
        const text = chunk[chunk.length - 1]?.trim() || '...'
        
        panels.push({ description, text })
      }
    } else if (lines.length > 0) {
      const chunkSize = Math.max(1, Math.ceil(lines.length / 4))
      
      for (let i = 0; i < 4 && i * chunkSize < lines.length; i++) {
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
    .slice(0, 6) // Max 6 panelov
  
  return validPanels.length > 0 ? validPanels : [
    { description: 'Začiatok príbehu', text: '...' },
    { description: 'Stred príbehu', text: '...' },
    { description: 'Koniec príbehu', text: '...' },
  ]
}

