import { NextRequest, NextResponse } from 'next/server'
import { getPlaceDetails } from '@/lib/placesService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get('place_id')
  const formattedAddress = searchParams.get('formatted_address') || undefined

  if (!placeId) {
    return NextResponse.json(
      { error: 'place_id parameter is required' },
      { status: 400 }
    )
  }

  try {
    console.log(`[place-details] Fetching details for place_id: ${placeId}`)
    const details = await getPlaceDetails(placeId, formattedAddress)
    
    if (!details) {
      console.warn(`[place-details] Place details not found for place_id: ${placeId}`)
      return NextResponse.json(
        { error: 'Place details not found' },
        { status: 404 }
      )
    }

    console.log(`[place-details] Successfully fetched details for: ${details.name}`)
    return NextResponse.json({ details })
  } catch (error: any) {
    console.error('[place-details] Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details', details: error.message },
      { status: 500 }
    )
  }
}


