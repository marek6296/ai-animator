'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'
import type { TripTip, Trip } from '@/types'

interface TripMapProps {
  trip: Trip
  tips: TripTip[]
}

// Typy pre Google Maps
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

const categoryColors: Record<TripTip['category'], string> = {
  attraction: '#00ffff', // Cyan
  activity: '#8a2be2', // Purple
  restaurant: '#ff00c0', // Pink
  accommodation: '#00c0ff', // Blue
  tip: '#00ff00', // Green
}

export default function TripMap({ trip, tips }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    // Filtrujeme tipy, ktoré majú súradnice
    const tipsWithCoords = tips.filter(tip => tip.coordinates)

    if (tipsWithCoords.length === 0) {
      setIsLoading(false)
      setMapError('Žiadne miesta nemajú súradnice')
      return
    }

    // Načítame Google Maps API
    // Poznámka: NEXT_PUBLIC_GOOGLE_API_KEY musí byť nastavený v .env
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
    
    if (!apiKey) {
      setMapError('Google Maps API key nie je nastavený')
      setIsLoading(false)
      return
    }

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      script.onerror = () => {
        setMapError('Nepodarilo sa načítať Google Maps')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } else {
      initializeMap()
    }

    function initializeMap() {
      if (!mapRef.current || !window.google) {
        setMapError('Google Maps nie je dostupné')
        setIsLoading(false)
        return
      }

      try {
        // Získame centrum mapy (prvý tip alebo destinácia)
        const firstTip = tipsWithCoords[0]
        const center = firstTip.coordinates || { lat: 48.8566, lng: 2.3522 } // Default: Paríž

        // Vytvoríme mapu
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: center,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#1a1a1a' }],
            },
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#000000' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0a0a0a' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#2a2a2a' }],
            },
          ],
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
        })

        mapInstanceRef.current = map

        // Vytvoríme markery pre každý tip
        const bounds = new window.google.maps.LatLngBounds()
        const infoWindows: any[] = []

        tipsWithCoords.forEach((tip, index) => {
          if (!tip.coordinates) return

          const position = new window.google.maps.LatLng(tip.coordinates.lat, tip.coordinates.lng)
          bounds.extend(position)

          const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            title: tip.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: categoryColors[tip.category] || '#00ffff',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            label: {
              text: (index + 1).toString(),
              color: '#000000',
              fontSize: '12px',
              fontWeight: 'bold',
            },
          })

          // Info window pre každý marker
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${categoryColors[tip.category] || '#00ffff'}">
                  ${tip.title}
                </h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                  ${tip.description.substring(0, 100)}${tip.description.length > 100 ? '...' : ''}
                </p>
                ${tip.location ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">📍 ${tip.location}</p>` : ''}
              </div>
            `,
          })

          marker.addListener('click', () => {
            // Zatvoríme všetky ostatné info windows
            infoWindows.forEach(iw => iw.close())
            infoWindow.open(map, marker)
          })

          infoWindows.push(infoWindow)
          markersRef.current.push(marker)
        })

        // Nastavíme zoom aby zobrazil všetky markery
        if (tipsWithCoords.length > 1) {
          map.fitBounds(bounds)
          // Obmedzíme maximálny zoom
          map.addListener('bounds_changed', () => {
            if (map.getZoom() && map.getZoom() > 16) {
              map.setZoom(16)
            }
          })
        }

        setIsLoading(false)
      } catch (error: any) {
        console.error('Error initializing map:', error)
        setMapError('Chyba pri inicializácii mapy')
        setIsLoading(false)
      }
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }
  }, [trip, tips])

  if (mapError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-xl p-8 border border-red-500/20 text-center"
      >
        <p className="text-red-400">{mapError}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden border border-purple-500/20 relative"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">Načítavam mapu...</p>
          </div>
        </div>
      )}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 glass rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="font-bold">{trip.destination}</span>
          </div>
        </div>
        <div ref={mapRef} className="w-full h-[500px] rounded-xl" />
      </div>
      
      {/* Legenda */}
      <div className="p-4 bg-black/30 border-t border-purple-500/20">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(categoryColors).map(([category, color]) => {
            const categoryLabels: Record<string, string> = {
              attraction: 'Pamiatky',
              activity: 'Aktivity',
              restaurant: 'Reštaurácie',
              accommodation: 'Ubytovanie',
              tip: 'Tipy',
            }
            return (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300">{categoryLabels[category]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

