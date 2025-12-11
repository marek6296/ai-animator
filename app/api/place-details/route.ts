import { NextRequest, NextResponse } from 'next/server'
import { getPlaceDetails } from '@/lib/placesService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json(
      { error: 'place_id parameter is required' },
      { status: 400 }
    )
  }

  try {
    const details = await getPlaceDetails(placeId)
    
    if (!details) {
      return NextResponse.json(
        { error: 'Place details not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ details })
  } catch (error: any) {
    console.error('Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place details', details: error.message },
      { status: 500 }
    )
  }
}


