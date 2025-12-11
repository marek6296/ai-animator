import { NextRequest, NextResponse } from 'next/server'
import { findPlaceByName } from '@/lib/placesService'
import { getPlacePhotoUrl } from '@/lib/placesService'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const googleApiKey = process.env.GOOGLE_API_KEY
  
  if (!googleApiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_API_KEY nie je nastavený' },
      { status: 500 }
    )
  }

  try {
    const placeName = 'Eiffel Tower'
    const cityName = 'Paris'
    
    console.log(`[Test Image] Searching for: "${placeName}" in "${cityName}"`)
    
    const foundPlace = await findPlaceByName(placeName, cityName)
    
    if (!foundPlace) {
      return NextResponse.json({
        success: false,
        message: `Place "${placeName}" not found`,
        step: 'findPlaceByName returned null'
      }, { status: 404 })
    }
    
    console.log(`[Test Image] ✓ Found place: ${foundPlace.name}`)
    console.log(`[Test Image]   Photos count: ${foundPlace.photos?.length || 0}`)
    
    if (!foundPlace.photos || foundPlace.photos.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Place "${foundPlace.name}" has no photos`,
        place: {
          name: foundPlace.name,
          place_id: foundPlace.place_id,
          photos_count: 0
        }
      }, { status: 404 })
    }
    
    const firstPhoto = foundPlace.photos[0]
    console.log(`[Test Image]   First photo:`, {
      photo_reference: firstPhoto.photo_reference?.substring(0, 50) || 'none',
      name: firstPhoto.name?.substring(0, 50) || 'none',
      height: firstPhoto.height,
      width: firstPhoto.width,
    })
    
    const photo_reference = (firstPhoto.name || firstPhoto.photo_reference || '') as string
    
    if (!photo_reference) {
      return NextResponse.json({
        success: false,
        message: 'Photo reference is missing',
        place: {
          name: foundPlace.name,
          place_id: foundPlace.place_id,
          photos_count: foundPlace.photos.length,
          first_photo: firstPhoto
        }
      }, { status: 500 })
    }
    
    console.log(`[Test Image]   Extracted photo_reference: ${photo_reference.substring(0, 80)}...`)
    
    const imageUrl = getPlacePhotoUrl(photo_reference, 800)
    
    console.log(`[Test Image]   Generated image URL: ${imageUrl.substring(0, 100)}...`)
    
    // Skúsme načítať obrázok
    try {
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' })
      console.log(`[Test Image]   Image URL response: ${imageResponse.status} ${imageResponse.statusText}`)
      
      return NextResponse.json({
        success: true,
        message: 'Image URL generated successfully',
        place: {
          name: foundPlace.name,
          place_id: foundPlace.place_id,
          formatted_address: foundPlace.formatted_address,
        },
        photo: {
          photo_reference: photo_reference.substring(0, 80) + '...',
          name: firstPhoto.name?.substring(0, 50) || 'none',
          height: firstPhoto.height,
          width: firstPhoto.width,
        },
        imageUrl: imageUrl,
        imageUrlStatus: imageResponse.status,
        imageUrlStatusText: imageResponse.statusText,
        imageUrlHeaders: {
          'content-type': imageResponse.headers.get('content-type'),
          'content-length': imageResponse.headers.get('content-length'),
        }
      })
    } catch (imageError: any) {
      return NextResponse.json({
        success: false,
        message: 'Image URL generated but failed to load',
        place: {
          name: foundPlace.name,
          place_id: foundPlace.place_id,
        },
        imageUrl: imageUrl,
        error: imageError.message || imageError.toString(),
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error(`[Test Image] ❌ Error:`, error)
    return NextResponse.json({
      success: false,
      message: 'Error testing image generation',
      error: error.message || error.toString(),
      stack: error.stack,
    }, { status: 500 })
  }
}


