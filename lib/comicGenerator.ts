import { generateImage, generateText } from './aiService'
import type { UserInput, Comic, ComicPanel } from '@/types'

export async function generateComic(input: UserInput): Promise<Comic> {
  // Najprv vygeneruj príbeh komiksu
  const storyPrompt = `Vytvor krátky komiksový príbeh na základe týchto informácií:
- Osoba: ${input.self}
- Situácia: ${input.situation}
- Kamaráti: ${input.friends}

Vytvor 4-6 panelov komiksu. Pre každý panel opíš:
1. Čo sa deje (stručne)
2. Text/dialóg pre panel

Formát:
Panel 1: [popis] | [text]
Panel 2: [popis] | [text]
...`

  const storyText = await generateText(storyPrompt)
  
  // Parsuj príbeh na panely
  const panels = parseStoryToPanels(storyText)
  
  // Vygeneruj obrázky pre každý panel
  const comicPanels: ComicPanel[] = []
  
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i]
    const imagePrompt = `Komiksový panel v štýle moderného komiksu. ${panel.description}. 
    Osoba: ${input.self}. Situácia: ${input.situation}. Kamaráti: ${input.friends}.
    Kreslený štýl, farebné, dynamické, expresívne.`
    
    const imageUrl = await generateImage(imagePrompt)
    
    comicPanels.push({
      panelNumber: i + 1,
      text: panel.text,
      imageUrl,
    })
  }

  // Vygeneruj názov komiksu
  const titlePrompt = `Vytvor krátky, vtipný názov komiksu na základe tohto príbehu: ${input.situation}`
  const title = await generateText(titlePrompt)
  const cleanTitle = title.replace(/['"]/g, '').trim().split('\n')[0]

  return {
    title: cleanTitle || 'Môj komiks',
    panels: comicPanels,
  }
}

function parseStoryToPanels(storyText: string): Array<{ description: string; text: string }> {
  const panels: Array<{ description: string; text: string }> = []
  
  // Skús nájsť panely v rôznych formátoch
  const panelRegex = /Panel\s+(\d+):\s*(.+?)\s*\|\s*(.+?)(?=Panel|\n\n|$)/gi
  const matches = storyText.matchAll(panelRegex)
  
  for (const match of matches) {
    panels.push({
      description: match[2]?.trim() || '',
      text: match[3]?.trim() || '',
    })
  }
  
  // Ak sa nepodarilo parsovať, vytvor panely manuálne
  if (panels.length === 0) {
    const lines = storyText.split('\n').filter(line => line.trim())
    const chunkSize = Math.ceil(lines.length / 4)
    
    for (let i = 0; i < 4; i++) {
      const chunk = lines.slice(i * chunkSize, (i + 1) * chunkSize)
      panels.push({
        description: chunk.join(' ').substring(0, 200),
        text: chunk[chunk.length - 1] || '...',
      })
    }
  }
  
  return panels.slice(0, 6) // Max 6 panelov
}

