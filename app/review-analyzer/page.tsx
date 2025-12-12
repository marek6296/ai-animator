'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PlaceSelector from '@/components/PlaceSelector'
import ReviewAnalysisDisplay from '@/components/ReviewAnalysisDisplay'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ReviewAnalysisResult } from '@/types'

export default function ReviewAnalyzer() {
  const router = useRouter()
  const { selectedLanguage, t } = useLanguage()
  const [selectedPlace, setSelectedPlace] = useState<{
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
  } | null>(null)
  const [placePhotoUrl, setPlacePhotoUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ReviewAnalysisResult | null>(null)

  const handlePlaceSelect = async (place: {
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
  }) => {
    setSelectedPlace(place)
    setAnalysisResult(null)
    setPlacePhotoUrl(null)

    // Získaj detaily miesta vrátane fotiek cez Place Details API
    try {
      const detailsResponse = await fetch(
        `/api/place-details?place_id=${encodeURIComponent(place.place_id)}&formatted_address=${encodeURIComponent(place.formatted_address || '')}`
      )
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json()
        const placeDetails = detailsData.details
        
        // Získaj prvú fotku z detaily miesta
        if (placeDetails?.photos && placeDetails.photos.length > 0) {
          const firstPhoto = placeDetails.photos[0]
          const photoReference = firstPhoto.photo_reference || firstPhoto.name
          
          if (photoReference) {
            const photoResponse = await fetch(
              `/api/place-photo?photo_reference=${encodeURIComponent(photoReference)}&maxWidth=800`
            )
            if (photoResponse.ok) {
              const photoData = await photoResponse.json()
              setPlacePhotoUrl(photoData.photoUrl)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching place details for photo:', error)
      // Fallback: skús použiť photo_reference z place, ak existuje
      if (place.photo_reference) {
        try {
          const response = await fetch(
            `/api/place-photo?photo_reference=${encodeURIComponent(place.photo_reference)}&maxWidth=800`
          )
          if (response.ok) {
            const data = await response.json()
            setPlacePhotoUrl(data.photoUrl)
          }
        } catch (fallbackError) {
          console.error('Error fetching place photo (fallback):', fallbackError)
        }
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedPlace) {
      toast.error(t.reviewAnalyzer.selectPlaceError)
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/analyze-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place_id: selectedPlace.place_id,
          formatted_address: selectedPlace.formatted_address,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || t.reviewAnalyzer.analyzeError)
      }

      const result: ReviewAnalysisResult = await response.json()
      setAnalysisResult(result)
      toast.success(t.reviewAnalyzer.analyzeSuccess)
    } catch (error: any) {
      console.error('Error analyzing reviews:', error)
      toast.error(error.message || t.reviewAnalyzer.analyzeError)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen animated-gradient grid-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl floating"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl floating"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-3 glass border border-purple-500/30 rounded-lg text-purple-400 font-bold hover:bg-purple-400/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {t.reviewAnalyzer.backToMain}
            </button>
          </motion.div>
          <LanguageSelector />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 flex flex-col items-center justify-center"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6"
            whileHover={{ scale: 1.05 }}
          >
            {t.reviewAnalyzer.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t.reviewAnalyzer.selectPlace}
          </motion.p>
        </motion.div>

        {/* Place Selector */}
        {!analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="glass rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">{t.reviewAnalyzer.selectPlace}</h2>
              <PlaceSelector
                onPlaceSelect={handlePlaceSelect}
                disabled={isAnalyzing}
              />
              
              {selectedPlace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 glass border border-purple-500/20 rounded-lg"
                >
                  <div className="flex gap-4">
                    {placePhotoUrl ? (
                      <div className="flex-shrink-0">
                        <img
                          src={placePhotoUrl}
                          alt={selectedPlace.name}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Error loading place photo:', e)
                            setPlacePhotoUrl(null)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">{t.reviewAnalyzer.loadingPhoto}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">{selectedPlace.name}</h3>
                      {selectedPlace.formatted_address && (
                        <p className="text-gray-400 text-sm">{selectedPlace.formatted_address}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedPlace || isAnalyzing}
                className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.reviewAnalyzer.analyzing}
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    {t.reviewAnalyzer.analyzeButton}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ReviewAnalysisDisplay result={analysisResult} />
            
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAnalysisResult(null)
                  setSelectedPlace(null)
                }}
                className="px-6 py-3 glass border border-purple-500/30 rounded-lg text-purple-400 font-bold hover:bg-purple-400/10 transition-all"
              >
                {t.reviewAnalyzer.analyzeAnother}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}

