import { generateImage } from './aiService'
import type { UserInput, Animation } from '@/types'

export async function generateAnimation(input: UserInput): Promise<Animation> {
  // Vytvor 4-6 rámcov pre animáciu
  const frames: string[] = []
  const frameCount = 5

  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1) // 0 až 1
    
    const framePrompt = `Animovaný rámec ${i + 1} z ${frameCount} pre krátku animáciu.
    Osoba: ${input.self}
    Situácia: ${input.situation}
    Kamaráti: ${input.friends}
    
    Toto je rámec ${i + 1}, ktorý zachytáva ${Math.round(progress * 100)}% príbehu.
    Animovaný štýl, dynamické, expresívne, farebné.
    Zachyť moment v príbehu, ktorý zodpovedá tomuto časovému bodu.`
    
    const imageUrl = await generateImage(framePrompt)
    frames.push(imageUrl)
    
    // Malé oneskorenie medzi rámcami, aby sa nepreťažil API
    if (i < frameCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return {
    frames,
    // V produkcii by ste mohli vytvoriť GIF pomocou knižnice ako 'gifencoder' alebo 'sharp'
    // Pre teraz vrátime len rámce
  }
}

