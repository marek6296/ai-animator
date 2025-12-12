import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createSystemPromptWithLanguage, getLanguageNameForAI, type Language } from '@/lib/languageUtils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviews, targetLanguage = 'sk' } = body

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: 'Reviews array is required' },
        { status: 400 }
      )
    }

    const languageName = getLanguageNameForAI(targetLanguage as Language)
    const basePrompt = `Si profesionálny prekladateľ. Prelož nasledujúce recenzie do ${languageName}. Zachovaj pôvodný tón a štýl. Vráť len preložený text, bez komentárov.`
    const systemPrompt = createSystemPromptWithLanguage(targetLanguage as Language) + '\n\n' + basePrompt

    // Prelož každú recenziu
    const translatedReviews = await Promise.all(
      reviews.map(async (review: { text: string; language: string }) => {
        // Ak je recenzia už v cieľovom jazyku, vráť ju bez prekladu
        if (review.language === targetLanguage) {
          return {
            ...review,
            translatedText: review.text,
            needsTranslation: false,
          }
        }

        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Prelož túto recenziu do ${languageName}:\n\n"${review.text}"`,
              },
            ],
            temperature: 0.3,
            max_tokens: 500,
          })

          const translatedText = response.choices[0]?.message?.content?.trim() || review.text

          return {
            ...review,
            translatedText,
            needsTranslation: true,
          }
        } catch (error) {
          console.error('Translation error for review:', error)
          // V prípade chyby vráť pôvodný text
          return {
            ...review,
            translatedText: review.text,
            needsTranslation: false,
            translationError: true,
          }
        }
      })
    )

    return NextResponse.json({ translatedReviews })
  } catch (error: any) {
    console.error('[translate-reviews] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}

