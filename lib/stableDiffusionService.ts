// Stable Diffusion SDXL + LoRA service
// Používa Replicate API pre SDXL s LoRA podporou

import Replicate from 'replicate'

interface StableDiffusionOptions {
  loraModel?: string // ID LoRA modelu na Replicate (napr. "username/model-name")
  loraWeight?: number // 0.0 - 1.0, default 0.8
  numInferenceSteps?: number // Počet krokov, default 30
  guidanceScale?: number // Guidance scale, default 7.5
  width?: number // Šírka obrázka, default 1024
  height?: number // Výška obrázka, default 1024
}

export async function generateImageWithSDXL(
  prompt: string,
  options: StableDiffusionOptions = {},
  retries = 2
): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
  const SDXL_MODEL = process.env.SDXL_MODEL || "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
  const LORA_MODEL = options.loraModel || process.env.LORA_MODEL

  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN nie je nastavený v .env súbore. Pozrite si STABLE_DIFFUSION_SETUP.md')
  }

  const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  })

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Zostav prompt s LoRA ak je nastavený
      let finalPrompt = prompt.trim()
      
      if (LORA_MODEL) {
        // LoRA sa pridáva do promptu v špeciálnom formáte
        // Formát: <lora:model-name:weight>
        const loraWeight = options.loraWeight || 0.8
        finalPrompt = `<lora:${LORA_MODEL}:${loraWeight}> ${finalPrompt}`
      }

      // Volanie Replicate API pomocou SDK
      const output = await replicate.run(SDXL_MODEL, {
        input: {
          prompt: finalPrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, letters, signature",
          num_inference_steps: options.numInferenceSteps || 30,
          guidance_scale: options.guidanceScale || 7.5,
          width: options.width || 1024,
          height: options.height || 1024,
        },
      }) as string | string[]

      // Replicate vracia pole URL-iek alebo jednu URL
      const imageUrl = Array.isArray(output) ? output[0] : output

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Nepodarilo sa vygenerovať obrázok - neplatný výstup')
      }

      return imageUrl
    } catch (error: any) {
      console.error(`Stable Diffusion API error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      if (attempt === retries) {
        throw new Error(`Chyba pri generovaní obrázka: ${error.message}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
    }
  }
  
  throw new Error('Nepodarilo sa vygenerovať obrázok po viacerých pokusoch')
}


