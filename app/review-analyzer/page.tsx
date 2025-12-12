'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PlaceSelector from '@/components/PlaceSelector'
import ReviewAnalysisDisplay from '@/components/ReviewAnalysisDisplay'
import type { ReviewAnalysisResult } from '@/types'

export default function ReviewAnalyzer() {
  const router = useRouter()
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
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ReviewAnalysisResult | null>(null)

  const handlePlaceSelect = (place: {
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
  }) => {
    setSelectedPlace(place)
    setAnalysisResult(null)
  }

  const handleAnalyze = async () => {
    if (!selectedPlace) {
      toast.error('Prosím, vyberte miesto')
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
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Chyba pri analýze recenzií')
      }

      const result: ReviewAnalysisResult = await response.json()
      setAnalysisResult(result)
      toast.success('Analýza recenzií bola úspešne dokončená!')
    } catch (error: any) {
      console.error('Error analyzing reviews:', error)
      toast.error(error.message || 'Nastala chyba pri analýze recenzií')
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 glass border border-purple-500/30 rounded-lg text-purple-400 font-bold hover:bg-purple-400/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Späť na hlavnú stránku
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <BarChart3 className="w-16 h-16 text-purple-400 neon-cyan" />
              <motion.div
                className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              REVIEW ANALYZER
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Vyberte miesto z Google Maps a získajte <span className="text-purple-400 font-semibold">podrobnú AI analýzu</span> všetkých recenzií
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
              <h2 className="text-2xl font-bold text-purple-400 mb-6">Vyberte miesto</h2>
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
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">{selectedPlace.name}</h3>
                  {selectedPlace.formatted_address && (
                    <p className="text-gray-400 text-sm">{selectedPlace.formatted_address}</p>
                  )}
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
                    Analyzujem recenzie...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    Analyzovať recenzie
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
                Analyzovať ďalšie miesto
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}

