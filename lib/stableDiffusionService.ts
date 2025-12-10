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
  // Img2Img options
  image?: string // Base64 alebo URL referenčného obrázka
  imageStrength?: number // Sila vplyvu referenčného obrázka (0.0 - 1.0), default 0.7
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
      const inputParams: any = {
        prompt: finalPrompt,
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, letters, signature",
        num_inference_steps: options.numInferenceSteps || 30,
        guidance_scale: options.guidanceScale || 7.5,
        width: options.width || 1024,
        height: options.height || 1024,
      }
      
      if (LORA_MODEL) {
        const loraWeight = options.loraWeight || 0.8
        
        // Ak je LoRA URL (Hugging Face alebo CivitAI), použij lora_weights parameter
        if (LORA_MODEL.startsWith('http://') || LORA_MODEL.startsWith('https://')) {
          // Pre URL LoRA modely použijeme lora_weights parameter (ak ho model podporuje)
          inputParams.lora_weights = LORA_MODEL
          inputParams.lora_scale = loraWeight
        } else {
          // Pre Replicate model ID použijeme prompt formát
          // Formát: <lora:model-name:weight>
          finalPrompt = `<lora:${LORA_MODEL}:${loraWeight}> ${finalPrompt}`
          inputParams.prompt = finalPrompt
        }
      }

      // Img2Img - ak je poskytnutý referenčný obrázok
      if (options.image) {
        // SDXL img2img je veľmi pamäťovo náročné a často zlyháva s CUDA out of memory
        // Preto znížime rozlíšenie a upravíme nastavenia
        let imageInput = options.image
        
        // Ak je Base64 data URL, skúsme ho použiť priamo
        if (imageInput.startsWith('data:image')) {
          imageInput = imageInput
        }
        
        // Znížime rozlíšenie pre img2img aby sa zmestilo do pamäte
        // SDXL img2img s veľkým obrázkom často zlyháva
        inputParams.width = 768  // Znížené z 1024
        inputParams.height = 768 // Znížené z 1024
        inputParams.num_inference_steps = 30 // Zvýšené pre lepšiu transformáciu štýlu
        
        // Pre img2img potrebujeme vyšší guidance scale pre lepšiu transformáciu štýlu
        inputParams.guidance_scale = 9.0 // Zvýšené z 7.5 pre silnejšiu aplikáciu štýlu
        
        // Sila vplyvu fotky - pre komiks používame VEĽMI nízku silu (0.2-0.25)
        // Pre transformáciu fotky (jeden obrázok) používame vyššiu silu (0.5)
        inputParams.image = imageInput
        inputParams.strength = options.imageStrength || 0.5
        
        // Pre veľmi nízku silu (komiks) - pridajme negatívny prompt proti fotorealizmu
        if (options.imageStrength && options.imageStrength < 0.3) {
          // Komiks - generujeme nový panel, nie transformujeme fotku
          inputParams.negative_prompt = "photorealistic, photo, realistic, photograph, real person, real face, camera photo, DSLR, professional photography, photo manipulation, filtered photo, " + inputParams.negative_prompt
        } else {
          // Transformácia fotky - zakážme fotorealistický štýl
          inputParams.negative_prompt = "photorealistic, photo, realistic, photograph, real person, real face, camera photo, DSLR, professional photography, " + inputParams.negative_prompt
        }
      }

      // Volanie Replicate API pomocou SDK
      // SDXL_MODEL musí byť v formáte "username/model-name" alebo "username/model-name:version"
      const modelId = SDXL_MODEL as `${string}/${string}` | `${string}/${string}:${string}`
      
      // Log pre debugging (len v development móde)
      if (process.env.NODE_ENV === 'development') {
        console.log('Calling Replicate API with:', {
          model: modelId,
          hasImage: !!inputParams.image,
          promptLength: inputParams.prompt.length,
        })
      }
      
      const output = await replicate.run(modelId, {
        input: inputParams,
      }) as string | string[]

      // Replicate vracia pole URL-iek alebo jednu URL
      const imageUrl = Array.isArray(output) ? output[0] : output

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Nepodarilo sa vygenerovať obrázok - neplatný výstup')
      }

      return imageUrl
    } catch (error: any) {
      console.error(`Stable Diffusion API error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      // Detailnejšie logovanie chyby
      if (error.response) {
        console.error('API Response error:', error.response.status, error.response.data)
      }
      if (error.message) {
        console.error('Error message:', error.message)
      }
      
      if (attempt === retries) {
        // Vytvor detailnejšiu chybovú správu
        let errorMessage = 'Chyba pri generovaní obrázka'
        
        // Skontroluj status code
        const statusCode = error.response?.status || error.status
        
        if (statusCode === 402) {
          // Payment Required - Insufficient credit
          errorMessage = 'Nedostatok kreditu na Replicate účte. Choďte na https://replicate.com/account/billing#billing a pridajte kredit. Po pridaní kreditu počkajte niekoľko minút pred ďalším pokusom.'
        } else if (statusCode === 429) {
          // Too Many Requests
          const retryAfter = error.response?.headers?.get('retry-after') || '10'
          errorMessage = `Príliš veľa requestov. Počkajte ${retryAfter} sekúnd a skúste to znova. Ak nemáte pridaný payment method, pridajte ho na https://replicate.com/account/billing`
        } else if (error.message) {
          errorMessage = error.message
          
          // CUDA out of memory - problém s img2img
          if (errorMessage.includes('CUDA out of memory') || errorMessage.includes('out of memory')) {
            if (options.image) {
              errorMessage = 'Referenčná fotka je príliš veľká alebo komplexná. Skúste: 1) Použiť menšiu fotku (max 1MB), 2) Znížiť silu vplyvu fotky, 3) Alebo generovať bez referenčnej fotky.'
            } else {
              errorMessage = 'Model má problém s pamäťou. Skúste to znova o chvíľu alebo znížte rozlíšenie.'
            }
          }
          
          // Skontroluj, či obsahuje "Insufficient credit"
          if (errorMessage.includes('Insufficient credit') || errorMessage.includes('insufficient credit')) {
            errorMessage = 'Nedostatok kreditu na Replicate účte. Choďte na https://replicate.com/account/billing#billing a pridajte kredit.'
          }
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail
          if (errorMessage.includes('Insufficient credit') || errorMessage.includes('insufficient credit')) {
            errorMessage = 'Nedostatok kreditu na Replicate účte. Choďte na https://replicate.com/account/billing#billing a pridajte kredit.'
          }
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        
        // Špecifické chyby
        if (errorMessage.includes('image') || errorMessage.includes('img2img')) {
          if (!errorMessage.includes('referenčnej fotky')) {
            errorMessage = 'Chyba pri spracovaní referenčnej fotky. Skúste to bez fotky alebo použite menšiu, jednoduchšiu fotku.'
          }
        } else if (errorMessage.includes('token') || errorMessage.includes('auth')) {
          errorMessage = 'Chyba autentifikácie. Skontrolujte REPLICATE_API_TOKEN v .env súbore.'
        } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
          errorMessage = 'Model nie je dostupný. Skontrolujte SDXL_MODEL v .env súbore.'
        }
        
        throw new Error(errorMessage)
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
    }
  }
  
  throw new Error('Nepodarilo sa vygenerovať obrázok po viacerých pokusoch')
}


