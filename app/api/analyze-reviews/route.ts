import { NextRequest, NextResponse } from 'next/server'
import { getPlaceDetails } from '@/lib/placesService'
import { normalizeReviews, analyzeReviews } from '@/lib/reviewAnalyzer'
import type { ReviewAnalysisResult } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { place_id, formatted_address } = body

    if (!place_id) {
      return NextResponse.json(
        { error: 'place_id je povinný' },
        { status: 400 }
      )
    }

    // KROK 1: Získaj detaily miesta vrátane recenzií
    console.log(`[analyze-reviews] Fetching place details for: ${place_id}`)
    const placeDetails = await getPlaceDetails(place_id, formatted_address)

    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Miesto sa nenašlo' },
        { status: 404 }
      )
    }

    // KROK 2: Skontroluj, či má recenzie
    if (!placeDetails.reviews || placeDetails.reviews.length === 0) {
      return NextResponse.json(
        { error: 'Toto miesto nemá žiadne recenzie' },
        { status: 400 }
      )
    }

    console.log(`[analyze-reviews] Found ${placeDetails.reviews.length} reviews`)

    // KROK 3: Normalizuj recenzie
    const normalizedReviews = normalizeReviews(placeDetails.reviews)
    console.log(`[analyze-reviews] Normalized ${normalizedReviews.length} reviews`)

    // KROK 4: Analyzuj recenzie pomocou AI
    console.log(`[analyze-reviews] Starting AI analysis...`)
    const analysis = await analyzeReviews(placeDetails.name, normalizedReviews)
    console.log(`[analyze-reviews] Analysis completed`)

    // KROK 5: Vytvor výsledok
    const result: ReviewAnalysisResult = {
      placeName: placeDetails.name,
      placeId: placeDetails.place_id,
      formattedAddress: placeDetails.formatted_address || '',
      rating: placeDetails.rating,
      userRatingsTotal: placeDetails.user_ratings_total,
      analysis,
      normalizedReviews,
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[analyze-reviews] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Nastala chyba pri analýze recenzií' },
      { status: 500 }
    )
  }
}

