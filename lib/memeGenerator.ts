import { generateImage, generateText } from './aiService'
import type { UserInput, MemePack, Meme } from '@/types'

const memeTemplates = [
  'Drake pointing meme',
  'Distracted boyfriend meme',
  'Expanding brain meme',
  'Woman yelling at cat meme',
  'This is fine meme',
  'Success kid meme',
]

export async function generateMemePack(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<MemePack> {
  const memes: Meme[] = []
  const memeCount = 4

  // Vygeneruj meme texty
  onProgress?.(5, 'Generujem meme texty...')
  const memeTextsPrompt = `Vytvor presne ${memeCount} vtipných meme textov na základe:
- Osoba: ${input.self}
- Situácia: ${input.situation}
- Kamaráti: ${input.friends}

DÔLEŽITÉ: Použi presne tento formát, každý text na samostatnom riadku:
1. [krátky vtipný text max 50 znakov]
2. [krátky vtipný text max 50 znakov]
3. [krátky vtipný text max 50 znakov]
4. [krátky vtipný text max 50 znakov]

Texty by mali byť vtipné, relevantné k situácii a vhodné pre memy.`

  const memeTextsResponse = await generateText(memeTextsPrompt)
  const memeTexts = parseMemeTexts(memeTextsResponse)
  onProgress?.(15, 'Generujem memy...')

  // Vygeneruj memy
  for (let i = 0; i < memeCount; i++) {
    const memeProgress = 15 + (i / memeCount) * 85
    onProgress?.(memeProgress, `Generujem meme ${i + 1} z ${memeCount}...`)
    const template = memeTemplates[i % memeTemplates.length]
    const text = memeTexts[i] || `Meme ${i + 1} o ${input.situation}`
    
    const memePrompt = `Vytvor meme v štýle "${template}".
    Text memu: "${text}"
    Hlavná postava: ${input.self}
    Ostatné postavy: ${input.friends}
    Situácia: ${input.situation}
    
    Štýl: klasický meme, vtipný, farebný, profesionálny, čitateľný text, známy meme formát.
    Text musí byť jasne viditeľný a čitateľný.
    Všetky texty v meme musia byť v slovenčine.`
    
    try {
      const imageUrl = await generateImage(memePrompt)
      
      if (!imageUrl) {
        throw new Error(`Nepodarilo sa vygenerovať meme ${i + 1}`)
      }
      
      memes.push({
        imageUrl,
        text: text.trim(),
        template,
      })
    } catch (error: any) {
      console.error(`Chyba pri generovaní memu ${i + 1}:`, error)
      // Pokračujeme s ďalšími memami
      if (memes.length === 0 && i === memeCount - 1) {
        throw new Error(`Nepodarilo sa vygenerovať žiadny meme: ${error.message}`)
      }
    }
    
    // Malé oneskorenie medzi memami
    if (i < memeCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Validácia - musíme mať aspoň 1 meme
  if (memes.length === 0) {
    throw new Error('Nepodarilo sa vygenerovať žiadny meme')
  }

  onProgress?.(100, 'Meme pack hotový!')

  return { memes }
}

function parseMemeTexts(text: string): string[] {
  const texts: string[] = []
  
  // Skús nájsť číslované zoznamy
  const lines = text.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)$/)
    if (match) {
      texts.push(match[1].trim())
    } else if (line.trim() && !line.match(/^\d+\./)) {
      // Ak nie je číslovaný, ale obsahuje text
      texts.push(line.trim())
    }
  }
  
  // Ak sa nepodarilo parsovať, vytvor základné texty
  if (texts.length === 0) {
    return [
      'Keď sa stretneme s kamarátmi',
      'A situácia sa vyvinie nečakane',
      'Ale všetko je v pohode',
      'Lebo sme najlepší kamaráti',
    ]
  }
  
  return texts
}

