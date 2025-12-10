import { NextRequest, NextResponse } from 'next/server'
import { generateTrip } from '@/lib/tripGenerator'
import type { UserInput } from '@/types'

// Export pre Next.js App Router
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minút pre dlhé generovanie

// Store pre progress (v produkcii by ste použili Redis alebo databázu)
const progressStore = new Map<string, {
  step: 'trip' | 'complete'
  progress: number
  message: string
  estimatedTimeRemaining?: number
  result?: any
  error?: string
}>()

export async function POST(request: NextRequest) {
  try {
    const input: UserInput = await request.json()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Validácia
    if (!input.destination) {
      return NextResponse.json(
        { error: 'Destinácia je povinná' },
        { status: 400 }
      )
    }

    // Inicializuj progress
    progressStore.set(requestId, {
      step: 'trip',
      progress: 0,
      message: 'Začínam generovať plán výletu...',
    })

    // Spusti generovanie asynchrónne
    generateWithProgress(requestId, input).catch(err => {
      console.error('generateWithProgress error:', err)
      progressStore.set(requestId, {
        step: 'complete',
        progress: 0,
        message: 'Chyba',
        error: err.message || 'Neznáma chyba',
      })
    })

    return NextResponse.json({ requestId })
  } catch (error: any) {
    console.error('POST /api/generate-stream error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}

async function generateWithProgress(requestId: string, input: UserInput) {
  try {
    // Generuj trip plan
    updateProgress(requestId, 'trip', 0, 'Začínam generovať plán výletu...')
    const trip = await generateTrip(input, (progress, message) => {
      updateProgress(requestId, 'trip', progress, message)
    })

    // Hotovo
    progressStore.set(requestId, {
      step: 'complete',
      progress: 100,
      message: 'Hotovo!',
      result: { trip },
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
  step: 'trip',
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
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('id')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Chýba requestId' },
        { status: 400 }
      )
    }

    const progress = progressStore.get(requestId)
    
    if (!progress) {
      // Ak progress neexistuje, možno ešte nie je pripravený - vráťme "pending"
      return NextResponse.json({
        step: 'trip',
        progress: 0,
        message: 'Čakám na spustenie...',
      })
    }

    return NextResponse.json(progress)
  } catch (error: any) {
    console.error('GET /api/generate-stream error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}

