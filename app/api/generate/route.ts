import { NextRequest, NextResponse } from 'next/server'
import { generateComic } from '@/lib/comicGenerator'
import { generateAnimation } from '@/lib/animationGenerator'
import { generateMemePack } from '@/lib/memeGenerator'
import type { UserInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const input: UserInput = await request.json()

    if (!input.self || !input.situation || !input.friends) {
      return NextResponse.json(
        { error: 'Všetky polia sú povinné' },
        { status: 400 }
      )
    }

    // Generuj všetko paralelne
    const [comic, animation, memePack] = await Promise.all([
      generateComic(input),
      generateAnimation(input),
      generateMemePack(input),
    ])

    return NextResponse.json({
      comic,
      animation,
      memePack,
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Chyba pri generovaní' },
      { status: 500 }
    )
  }
}

