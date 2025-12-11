import { generateImage } from './aiService'
import type { UserInput, SingleImage } from '@/types'

export async function generateSingleImage(
  input: UserInput,
  onProgress?: (progress: number, message: string) => void
): Promise<SingleImage> {
  // Pre transformáciu fotky do štýlu - používame img2img
  if (!(input as any).useReferenceImage || !(input as any).referenceImage) {
    throw new Error('Pre transformáciu fotky je potrebná referenčná fotka')
  }

  onProgress?.(10, 'Transformujem fotku do vybraného štýlu...')
  
  // Vytvor prompt pre transformáciu štýlu
  let styleTransform = input.style === 'manga' 
    ? 'Transform this photo into manga/anime style. Convert realistic photo to Japanese manga art style. Anime character design, manga illustration style, cel-shaded, vibrant colors, expressive eyes, stylized features, anime art, manga drawing. The face should look similar but in anime/manga style, not photorealistic.'
    : input.style === 'comic-book'
    ? 'Transform this photo into comic book style. Convert realistic photo to comic book art. Bold lines, vibrant colors, comic book illustration, stylized features, comic art style. The face should look similar but in comic book style, not photorealistic.'
    : input.style === 'cartoon-comic'
    ? 'Transform this photo into cartoon style. Convert realistic photo to Disney/Pixar cartoon style. Stylized, colorful, animated movie style, cartoon art. The face should look similar but in cartoon style, not photorealistic.'
    : input.style === 'realistic-comic'
    ? 'Transform this photo into realistic comic book style. Convert photo to photorealistic comic art. Highly detailed, cinematic, professional comic art style.'
    : 'Transform this photo into the selected art style. Convert realistic photo to artistic illustration style. The face should look similar but in the selected art style, not photorealistic.'
  
  // Ak je zadaný vlastný prompt, pridáme ho
  let imagePrompt = styleTransform
  if (input.customPrompt && input.customPrompt.trim()) {
    imagePrompt = `${styleTransform} ${input.customPrompt.trim()}.`
  }
  
  onProgress?.(30, 'Generujem transformovaný obrázok...')
  
  // Vygeneruj obrázok pomocou img2img
  const imageUrl = await generateImage(
    imagePrompt, 
    style,
    2,
    (input as any).referenceImage,
    (input as any).imageStrength || 0.7
  )
  
  if (!imageUrl) {
    throw new Error('Nepodarilo sa vygenerovať obrázok')
  }
  
  onProgress?.(100, 'Obrázok hotový!')
  
  // Názov podľa štýlu
  const styleName = input.style === 'manga' ? 'Manga' 
    : input.style === 'comic-book' ? 'Komiks'
    : input.style === 'cartoon-comic' ? 'Kreslený'
    : input.style === 'realistic-comic' ? 'Realistický komiks'
    : 'Transformovaný obrázok'
  
  return {
    imageUrl,
    title: `${styleName} štýl`,
    description: `Fotka transformovaná do ${styleName.toLowerCase()} štýlu`,
  }
}
