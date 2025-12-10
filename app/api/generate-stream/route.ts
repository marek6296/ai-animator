import { NextRequest } from 'next/server'
import { generateComic } from '@/lib/comicGenerator'
import { generateAnimation } from '@/lib/animationGenerator'
import { generateMemePack } from '@/lib/memeGenerator'
import type { UserInput } from '@/types'

// Store pre progress (v produkcii by ste použili Redis alebo databázu)
const progressStore = new Map<string, {
  step: 'comic' | 'animation' | 'meme' | 'complete'
  progress: number
  message: string
  estimatedTimeRemaining?: number
  result?: any
  error?: string
}>()

export async function POST(request: NextRequest) {
  const input: UserInput = await request.json()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Validácia
  if (!input.self || !input.situation || !input.friends) {
    return new Response(JSON.stringify({ error: 'Všetky polia sú povinné' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Spusti generovanie asynchrónne
  generateWithProgress(requestId, input).catch(err => {
    progressStore.set(requestId, {
      step: 'complete',
      progress: 0,
      message: 'Chyba',
      error: err.message,
    })
  })

  return new Response(JSON.stringify({ requestId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function generateWithProgress(requestId: string, input: UserInput) {
  try {
    // Komiks
    updateProgress(requestId, 'comic', 0, 'Začínam generovať komiks...')
    const comic = await generateComic(input, (progress, message) => {
      updateProgress(requestId, 'comic', progress, message)
    })

    // Animácia
    updateProgress(requestId, 'animation', 0, 'Začínam generovať animáciu...')
    const animation = await generateAnimation(input, (progress, message) => {
      updateProgress(requestId, 'animation', progress, message)
    })

    // Meme pack
    updateProgress(requestId, 'meme', 0, 'Začínam generovať meme pack...')
    const memePack = await generateMemePack(input, (progress, message) => {
      updateProgress(requestId, 'meme', progress, message)
    })

    // Hotovo
    progressStore.set(requestId, {
      step: 'complete',
      progress: 100,
      message: 'Hotovo!',
      result: { comic, animation, memePack },
    })
  } catch (error: any) {
    progressStore.set(requestId, {
      step: 'complete',
      progress: 0,
      message: 'Chyba',
      error: error.message,
    })
  }
}

function updateProgress(
  requestId: string,
  step: 'comic' | 'animation' | 'meme',
  progress: number,
  message: string
) {
  const elapsed = Date.now()
  const estimatedTimeRemaining = progress > 0 && progress < 100 
    ? (100 - progress) / progress * 10 // Jednoduchý odhad
    : undefined

  progressStore.set(requestId, {
    step,
    progress,
    message,
    estimatedTimeRemaining,
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get('id')

  if (!requestId) {
    return new Response(JSON.stringify({ error: 'Chýba requestId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const progress = progressStore.get(requestId)
  
  if (!progress) {
    return new Response(JSON.stringify({ error: 'Progress nebol nájdený' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(progress), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

