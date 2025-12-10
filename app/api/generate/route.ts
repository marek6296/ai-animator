import { NextRequest, NextResponse } from 'next/server'
import { generateComic } from '@/lib/comicGenerator'
import { generateAnimation } from '@/lib/animationGenerator'
import { generateMemePack } from '@/lib/memeGenerator'
import { ProgressTracker } from '@/lib/progressTracker'
import type { UserInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const input: UserInput = await request.json()

    // Validácia vstupu
    if (!input.self || !input.situation || !input.friends) {
      return NextResponse.json(
        { error: 'Všetky polia sú povinné' },
        { status: 400 }
      )
    }

    if (input.self.trim().length < 10) {
      return NextResponse.json(
        { error: 'Popis seba musí mať aspoň 10 znakov' },
        { status: 400 }
      )
    }

    if (input.situation.trim().length < 10) {
      return NextResponse.json(
        { error: 'Popis situácie musí mať aspoň 10 znakov' },
        { status: 400 }
      )
    }

    if (input.friends.trim().length < 10) {
      return NextResponse.json(
        { error: 'Popis kamarátov musí mať aspoň 10 znakov' },
        { status: 400 }
      )
    }

    // Generuj všetko postupne (pre progress tracking)
    const timeout = 300000 // 5 minút
    
    // Generuj komiks
    const comic = await generateComic(input).catch(err => {
      console.error('Comic generation error:', err)
      throw new Error(`Chyba pri generovaní komiksu: ${err.message}`)
    })

    // Generuj animáciu
    const animation = await generateAnimation(input).catch(err => {
      console.error('Animation generation error:', err)
      throw new Error(`Chyba pri generovaní animácie: ${err.message}`)
    })

    // Generuj meme pack
    const memePack = await generateMemePack(input).catch(err => {
      console.error('Meme pack generation error:', err)
      throw new Error(`Chyba pri generovaní meme packu: ${err.message}`)
    })

    // Validácia výsledkov
    if (!comic || !comic.panels || comic.panels.length === 0) {
      throw new Error('Komiks nebol správne vygenerovaný')
    }

    if (!animation || !animation.frames || animation.frames.length === 0) {
      throw new Error('Animácia nebola správne vygenerovaná')
    }

    if (!memePack || !memePack.memes || memePack.memes.length === 0) {
      throw new Error('Meme pack nebol správne vygenerovaný')
    }

    return NextResponse.json({
      comic,
      animation,
      memePack,
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    
    // Lepšie error messages
    let errorMessage = 'Chyba pri generovaní'
    if (error.message) {
      errorMessage = error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

