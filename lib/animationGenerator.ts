import { generateImage } from './aiService'
import type { UserInput, Animation } from '@/types'

export async function generateAnimation(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<Animation> {
  // Vytvor 4-6 rámcov pre animáciu
  const frames: string[] = []
  const frameCount = 5

  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1) // 0 až 1
    const frameProgress = (i / frameCount) * 100
    
    onProgress?.(frameProgress, `Generujem rámec ${i + 1} z ${frameCount}...`)
    
    const framePrompt = `Animovaný rámec ${i + 1} z ${frameCount} pre krátku animáciu.
    Hlavná postava: ${input.self}
    Situácia: ${input.situation}
    Ostatné postavy: ${input.friends}
    
    Toto je rámec ${i + 1}, ktorý zachytáva ${Math.round(progress * 100)}% príbehu.
    Štýl: animovaný, dynamický, expresívny, farebný, profesionálny, plynulý pohyb.
    Zachyť konkrétny moment v príbehu, ktorý zodpovedá tomuto časovému bodu. 
    Ak je to začiatok (rámec 1), ukáž začiatok príbehu. Ak je to koniec (rámec ${frameCount}), ukáž záver alebo vrchol príbehu.`
    
    try {
      const imageUrl = await generateImage(framePrompt)
      
      if (!imageUrl) {
        throw new Error(`Nepodarilo sa vygenerovať rámec ${i + 1}`)
      }
      
      frames.push(imageUrl)
    } catch (error: any) {
      console.error(`Chyba pri generovaní rámca ${i + 1}:`, error)
      // Pokračujeme s ďalšími rámcami
      if (frames.length === 0 && i === frameCount - 1) {
        throw new Error(`Nepodarilo sa vygenerovať žiadny rámec: ${error.message}`)
      }
    }
    
    // Malé oneskorenie medzi rámcami, aby sa nepreťažil API
    if (i < frameCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Validácia - musíme mať aspoň 1 rámec
  if (frames.length === 0) {
    throw new Error('Nepodarilo sa vygenerovať žiadny rámec animácie')
  }

  onProgress?.(100, 'Animácia hotová!')

  return {
    frames,
    // V produkcii by ste mohli vytvoriť GIF pomocou knižnice ako 'gifencoder' alebo 'sharp'
    // Pre teraz vrátime len rámce
  }
}

