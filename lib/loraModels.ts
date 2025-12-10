// Zoznam dostupných LoRA modelov a štýlov pre profesionálne komiksy

export interface StyleOption {
  id: string
  name: string
  description: string
  loraModel?: string // Model ID na Replicate (formát: username/model-name alebo username/model-name:version)
  promptEnhancement: string // Dodatočný text do promptu pre lepšiu kvalitu
  loraWeight?: number // Váha LoRA modelu (0.0 - 1.0), default 0.8
}

export const styleOptions: StyleOption[] = [
  {
    id: 'comic-book',
    name: 'Klasický komiks',
    description: 'Tradičný komiksový štýl, Marvel/DC štýl, farebné, expresívne',
    // LoRA modely - odkomentujte a pridajte URL alebo Replicate model ID
    // Hugging Face URL (pre SDXL):
    // loraModel: 'https://huggingface.co/shourya-abot/comic-lora/resolve/main/lora.safetensors',
    // Replicate model ID:
    // loraModel: 'username/comic-book-lora',
    promptEnhancement: 'comic book style, Marvel comics style, vibrant colors, bold lines, dynamic composition, professional comic art, detailed, expressive characters, speech bubbles',
    loraWeight: 0.8,
  },
  {
    id: 'manga',
    name: 'Manga/Anime',
    description: 'Japonský manga štýl, anime komiks, čiernobiele alebo farebné',
    // LoRA modely z Hugging Face alebo CivitAI
    // loraModel: 'https://huggingface.co/username/manga-lora/resolve/main/lora.safetensors',
    // loraModel: 'https://civitai.com/api/download/models/12345', // CivitAI model ID
    promptEnhancement: 'manga style, anime comic, japanese comic book, detailed line art, expressive faces, dynamic action, professional manga art',
    loraWeight: 0.8,
  },
  {
    id: 'realistic-comic',
    name: 'Realistický komiks',
    description: 'Fotorealistický komiks, ako z filmu, prirodzený vzhľad',
    // loraModel: 'https://huggingface.co/username/realistic-comic-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'realistic comic book style, photorealistic comic, highly detailed, 8k quality, professional comic art, natural lighting, cinematic',
    loraWeight: 0.7,
  },
  {
    id: 'cartoon-comic',
    name: 'Kreslený komiks',
    description: 'Vtipný kreslený štýl, Disney/Pixar štýl, hravý',
    // loraModel: 'https://huggingface.co/username/cartoon-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'cartoon comic style, animated movie style, Disney style, colorful, playful, expressive characters, fun, vibrant',
    loraWeight: 0.8,
  },
  {
    id: 'watercolor-comic',
    name: 'Akvarelový komiks',
    description: 'Umeniecký akvarelový štýl, mäkké farby, elegantný',
    // loraModel: 'https://huggingface.co/username/watercolor-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'watercolor comic book, watercolor painting style, soft colors, artistic, beautiful brush strokes, elegant, artistic comic',
    loraWeight: 0.75,
  },
  {
    id: 'digital-art-comic',
    name: 'Digitálny art komiks',
    description: 'Moderný digitálny štýl, koncept art, futuristický',
    // loraModel: 'https://huggingface.co/username/digital-art-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'digital art comic, concept art style, modern illustration, detailed, vibrant, professional digital art, futuristic',
    loraWeight: 0.8,
  },
  {
    id: 'noir-comic',
    name: 'Noir komiks',
    description: 'Čiernobiely film noir štýl, dramatický, kontrastný',
    // loraModel: 'https://huggingface.co/username/noir-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'noir comic book style, black and white comic, film noir, dramatic shadows, high contrast, cinematic, moody',
    loraWeight: 0.8,
  },
  {
    id: 'vintage-comic',
    name: 'Vintage komiks',
    description: 'Retro štýl, 50s-60s komiks, nostalgický',
    // loraModel: 'https://huggingface.co/username/vintage-comic-lora/resolve/main/lora.safetensors',
    promptEnhancement: 'vintage comic book style, retro comic, 1950s comic style, nostalgic, classic comic art, bold colors, vintage illustration',
    loraWeight: 0.8,
  },
]

// Funkcia na získanie prompt enhancement pre vybraný štýl
export function getStylePromptEnhancement(styleId: string): string {
  const style = styleOptions.find(s => s.id === styleId) || styleOptions[0]
  return style.promptEnhancement || ''
}

// Funkcia na získanie LoRA modelu pre vybraný štýl (ak je dostupný)
export function getLoraModelForStyle(styleId: string): string | undefined {
  const style = styleOptions.find(s => s.id === styleId)
  // Ak má štýl vlastný LoRA model, použij ho, inak použij globálny LORA_MODEL
  return style?.loraModel || process.env.LORA_MODEL
}

// Funkcia na získanie LoRA váhy pre vybraný štýl
export function getLoraWeightForStyle(styleId: string): number {
  const style = styleOptions.find(s => s.id === styleId)
  return style?.loraWeight || parseFloat(process.env.LORA_WEIGHT || '0.8')
}

