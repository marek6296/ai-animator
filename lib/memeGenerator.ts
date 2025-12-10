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

export async function generateMemePack(input: UserInput): Promise<MemePack> {
  const memes: Meme[] = []
  const memeCount = 4

  // Vygeneruj meme texty
  const memeTextsPrompt = `Vytvor ${memeCount} vtipných meme textov na základe:
- Osoba: ${input.self}
- Situácia: ${input.situation}
- Kamaráti: ${input.friends}

Formát:
1. [text]
2. [text]
3. [text]
4. [text]`

  const memeTextsResponse = await generateText(memeTextsPrompt)
  const memeTexts = parseMemeTexts(memeTextsResponse)

  // Vygeneruj memy
  for (let i = 0; i < memeCount; i++) {
    const template = memeTemplates[i % memeTemplates.length]
    const text = memeTexts[i] || `Meme ${i + 1} o ${input.situation}`
    
    const memePrompt = `Vytvor meme v štýle "${template}".
    Text memu: "${text}"
    Osoba: ${input.self}
    Kamaráti: ${input.friends}
    Situácia: ${input.situation}
    
    Klasický meme štýl, vtipný, farebné, čitateľný text.`
    
    const imageUrl = await generateImage(memePrompt)
    
    memes.push({
      imageUrl,
      text,
      template,
    })
    
    // Malé oneskorenie medzi memami
    if (i < memeCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

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

