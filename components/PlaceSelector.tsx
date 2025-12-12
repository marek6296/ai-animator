'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

declare global {
  interface Window {
    google: any
  }
}

interface PlaceSelectorProps {
  onPlaceSelect: (place: {
    place_id: string
    name: string
    formatted_address?: string
    types?: string[]
    geometry?: {
      location: {
        lat: number
        lng: number
      }
    }
    photo_reference?: string
  }) => void
  disabled?: boolean
}

export default function PlaceSelector({ onPlaceSelect, disabled }: PlaceSelectorProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const autocompleteRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps?.places) {
        initializeAutocomplete()
        return
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script už existuje, počkaj na načítanie
        let attempts = 0
        const checkInterval = setInterval(() => {
          attempts++
          if (window.google?.maps?.places) {
            clearInterval(checkInterval)
            initializeAutocomplete()
          } else if (attempts > 50) {
            clearInterval(checkInterval)
            console.error('[PlaceSelector] Google Maps API timeout')
            toast.error('Failed to load Google Maps API')
          }
        }, 100)
        return () => clearInterval(checkInterval)
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        let attempts = 0
        const checkInterval = setInterval(() => {
          attempts++
          if (window.google?.maps?.places) {
            clearInterval(checkInterval)
            initializeAutocomplete()
          } else if (attempts > 50) {
            clearInterval(checkInterval)
            console.error('[PlaceSelector] Google Maps API timeout after script load')
            toast.error('Failed to load Google Maps API')
          }
        }, 100)
      }
      script.onerror = () => {
        console.error('[PlaceSelector] Failed to load Google Maps API')
        toast.error('Error loading Google Maps API')
      }
      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return

      try {
        const Autocomplete = window.google.maps.places.Autocomplete
        const autocomplete = new Autocomplete(inputRef.current, {
          fields: ['place_id', 'name', 'formatted_address', 'types', 'geometry', 'photos'],
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.place_id && place.name) {
            // Získaj photo_reference z prvého obrázka (ak existuje)
            let photoReference: string | undefined
            if (place.photos && place.photos.length > 0) {
              const firstPhoto = place.photos[0]
              // Nové API používa name, staré photo_reference
              photoReference = firstPhoto.name || firstPhoto.photo_reference
            }

            onPlaceSelect({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              types: place.types,
              geometry: place.geometry ? {
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }
              } : undefined,
              photo_reference: photoReference,
            })
            setSearchQuery(place.name)
          }
        })

        autocompleteRef.current = autocomplete
      } catch (error) {
        console.error('[PlaceSelector] Error initializing autocomplete:', error)
        toast.error('Error initializing autocomplete')
      }
    }

    loadGoogleMaps()
  }, [onPlaceSelect])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.reviewAnalyzer.placeSearchPlaceholder}
          disabled={disabled || isLoading}
          className="w-full pl-12 pr-4 py-4 glass border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-2 text-sm text-gray-400">
        {t.reviewAnalyzer.placeSearchHint}
      </p>
    </div>
  )
}

