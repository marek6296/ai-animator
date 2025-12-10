import OpenAI from 'openai'
import { generateImageWithSDXL } from './stableDiffusionService'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function generateImage(prompt: string, retries = 2): Promise<string> {
  // Použi Stable Diffusion SDXL + LoRA namiesto DALL-E
  const useStableDiffusion = process.env.USE_STABLE_DIFFUSION !== 'false'
  
  if (useStableDiffusion) {
    // Použi Stable Diffusion SDXL + LoRA
    return generateImageWithSDXL(prompt, {
      loraModel: process.env.LORA_MODEL,
      loraWeight: parseFloat(process.env.LORA_WEIGHT || '0.8'),
      numInferenceSteps: parseInt(process.env.SDXL_STEPS || '30'),
      guidanceScale: parseFloat(process.env.SDXL_GUIDANCE || '7.5'),
      width: 1024,
      height: 1024,
    }, retries)
  }

  // Fallback na DALL-E 3 (ak USE_STABLE_DIFFUSION=false)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY nie je nastavený v .env súbore')
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt.trim(),
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('Nepodarilo sa vygenerovať obrázok - žiadne dáta')
      }

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error('Nepodarilo sa vygenerovať obrázok - chýba URL')
      }

      return imageUrl
    } catch (error: any) {
      console.error(`OpenAI API error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      if (attempt === retries) {
        throw new Error(`Chyba pri generovaní obrázka: ${error.message}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  throw new Error('Nepodarilo sa vygenerovať obrázok po viacerých pokusoch')
}

export async function generateText(prompt: string, retries = 2): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY nie je nastavený v .env súbore')
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Si kreatívny asistent, ktorý pomáha vytvárať komiksy a príbehy. Odpovedaj výlučne v slovenčine. Buď presný a dodržiavaj formátovanie.',
          },
          {
            role: 'user',
            content: prompt.trim(),
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content || content.trim().length === 0) {
        throw new Error('AI nevrátilo žiadny obsah')
      }

      return content.trim()
    } catch (error: any) {
      console.error(`OpenAI API error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      // Ak je to posledný pokus, vyhod chybu
      if (attempt === retries) {
        throw new Error(`Chyba pri generovaní textu: ${error.message}`)
      }
      
      // Počkaj pred retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  throw new Error('Nepodarilo sa vygenerovať text po viacerých pokusoch')
}

