import { NextRequest } from 'next/server'
import { generateTrip } from '@/lib/tripGenerator'
import type { UserInput } from '@/types'

// Export pre Next.js App Router
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minút pre dlhé generovanie

export async function POST(request: NextRequest) {
  try {
    const input: UserInput = await request.json()

    // Validácia
    if (!input.destination) {
      return new Response(
        JSON.stringify({ error: 'Destinácia je povinná' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Vytvor streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (progress: number, message: string) => {
          const data = JSON.stringify({
            step: 'trip',
            progress,
            message,
          }) + '\n\n'
          controller.enqueue(encoder.encode(`data: ${data}`))
        }

        const sendComplete = (result: any) => {
          try {
            const data = JSON.stringify({
              step: 'complete',
              progress: 100,
              message: 'Hotovo!',
              result,
            })
            
            console.log(`[Stream] Sending complete result (${data.length} bytes)`)
            
            // Pošli kompletný JSON naraz - SSE formát vyžaduje `data: ` prefix a `\n\n` na konci
            const sseData = `data: ${data}\n\n`
            controller.enqueue(encoder.encode(sseData))
            controller.close()
          } catch (error: any) {
            console.error('[Stream] Error in sendComplete:', error)
            const errorData = JSON.stringify({
              step: 'complete',
              progress: 0,
              message: 'Chyba',
              error: 'Chyba pri serializácii výsledku',
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        }

        const sendError = (error: string) => {
          const data = JSON.stringify({
            step: 'complete',
            progress: 0,
            message: 'Chyba',
            error,
          }) + '\n\n'
          controller.enqueue(encoder.encode(`data: ${data}`))
          controller.close()
        }

        try {
          console.log(`[Stream] Starting trip generation for: ${input.destination}`)
          
          // Začni generovanie
          sendProgress(1, 'Začínam generovať plán výletu...')
          
          const trip = await generateTrip(input, (progress, message) => {
            console.log(`[Stream] Progress: ${progress}% - ${message}`)
            sendProgress(progress, message)
          })

          console.log(`[Stream] Trip generation completed successfully`)
          sendComplete({ trip })
        } catch (error: any) {
          console.error(`[Stream] Error in generation:`, error)
          console.error(`[Stream] Error stack:`, error.stack)
          sendError(error.message || 'Neznáma chyba')
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('POST /api/generate-stream error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

