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
    
    const framePrompt = `Animovaný rámec ${i + 1} z ${frameCount} pre plynulú animáciu pohybu.
    Hlavná postava: ${(input as any).self || 'postava'}
    Situácia: ${(input as any).situation || 'animácia'}
    Ostatné postavy: ${(input as any).friends || ''}
    
    Toto je rámec ${i + 1} z ${frameCount} pre plynulú animáciu. Postavy sa pohybujú a menia pozíciu.
    Pre rámec ${i + 1}: ${i === 0 ? 'začiatočná pozícia' : i === frameCount - 1 ? 'konečná pozícia' : 'stredná pozícia v pohybe'}.
    Štýl: animovaný, dynamický, expresívny, farebný, profesionálny, plynulý pohyb, konzistentné postavy.
    Postavy musia byť v každom rámci na mierne inej pozícii, aby vytvorili ilúziu pohybu.
    Všetky texty musia byť v slovenčine.`
    
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

