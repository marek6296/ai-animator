import { NextRequest, NextResponse } from 'next/server'
import { getPlacePhotoUrl } from '@/lib/placesService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photoReference = searchParams.get('photo_reference')
  const maxWidth = searchParams.get('maxWidth') || '1200'

  if (!photoReference) {
    return NextResponse.json(
      { error: 'photo_reference parameter is required' },
      { status: 400 }
    )
  }

  try {
    const photoUrl = getPlacePhotoUrl(photoReference, parseInt(maxWidth))
    return NextResponse.json({ photoUrl })
  } catch (error: any) {
    console.error('Error generating place photo URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate photo URL', details: error.message },
      { status: 500 }
    )
  }
}


