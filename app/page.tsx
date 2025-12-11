'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Sparkles, X, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import InputForm from '@/components/InputForm'
import ResultsDisplay from '@/components/ResultsDisplay'
import ProgressBar from '@/components/ProgressBar'
import type { UserInput, GenerationResult, ProgressUpdate } from '@/types'

export default function Home() {
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [results, setResults] = useState<GenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    setIsGenerating(false)
    setProgress(null)
    setRequestId(null)
    toast('Generovanie bolo zrušené', { icon: 'ℹ️' })
  }

  const handleSubmit = async (input: UserInput) => {
    setUserInput(input)
    setIsGenerating(true)
    setResults(null)
    setProgress(null)
    
    abortControllerRef.current = new AbortController()

    try {
      const startResponse = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: abortControllerRef.current.signal,
      })

      if (!startResponse.ok) {
        throw new Error('Chyba pri spustení generovania')
      }

      const { requestId: newRequestId } = await startResponse.json()
      setRequestId(newRequestId)

      progressIntervalRef.current = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/generate-stream?id=${newRequestId}`, {
            signal: abortControllerRef.current?.signal,
          })

          if (!progressResponse.ok) {
            const errorText = await progressResponse.text()
            console.error(`Progress fetch failed: ${progressResponse.status} - ${errorText}`)
            throw new Error(`Chyba pri získavaní progressu: ${progressResponse.status}`)
          }

          const progressData = await progressResponse.json()
          console.log(`[Frontend] Progress update:`, progressData)
          setProgress(progressData)

          if (progressData.step === 'complete') {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
            }
            
            if (progressData.error) {
              console.error('Generation error:', progressData.error)
              toast.error(progressData.error || 'Nastala chyba pri generovaní')
              setIsGenerating(false)
              setProgress(null)
              setRequestId(null)
              return
            }

            if (progressData.result) {
              setResults(progressData.result)
              toast.success('Plán výletu bol úspešne vygenerovaný!')
            } else {
              console.error('No result in progress data:', progressData)
              toast.error('Nepodarilo sa vygenerovať obsah. Skúste to znova.')
            }
            
            setIsGenerating(false)
            setProgress(null)
            setRequestId(null)
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            return
          }
          console.error('Error fetching progress:', error)
          console.error('Progress polling error:', error)
        }
      }, 1000)

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      console.error('Error:', error)
      const errorMessage = error.message || 'Nastala chyba pri generovaní'
      toast.error(
        errorMessage.includes('OPENAI_API_KEY')
          ? 'Skontrolujte, či máte nastavený OPENAI_API_KEY v .env súbore'
          : errorMessage
      )
      setIsGenerating(false)
      setProgress(null)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  return (
    <main className="min-h-screen animated-gradient grid-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl floating"
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
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating"
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
        <motion.div
          className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl floating"
          animate={{
            x: [0, 120, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Sparkles className="w-16 h-16 text-cyan-400 neon-cyan" />
              <motion.div
                className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
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
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TRIP PLANNER
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Objavte <span className="text-cyan-400 font-semibold">najlepšie destinácie</span> v Európe s{' '}
            <span className="text-purple-400 font-semibold">inteligentným plánovačom</span>. Získajte{' '}
            <span className="text-pink-400 font-semibold">personalizované tipy</span> na nezabudnuteľné zážitky.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-8 mt-8"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">50+ Destinácií</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Inteligentný Systém</span>
            </div>
            <div className="flex items-center gap-2 text-pink-400">
              <Rocket className="w-5 h-5" />
              <span className="text-sm font-medium">Okamžité Výsledky</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <InputForm onSubmit={handleSubmit} isGenerating={isGenerating} />
        </motion.div>

        {/* Results */}
        {results && results.trip && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <ResultsDisplay results={results} userInput={userInput} />
          </motion.div>
        )}

        {/* Loading Modal */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="glass-strong rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 border border-cyan-500/30 animated-border">
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  aria-label="Zrušiť"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {progress && <ProgressBar progress={progress} />}
                
                {!progress && (
                  <>
                    <motion.div
                      className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <p className="text-xl font-semibold text-cyan-400">Spúšťam generovanie...</p>
                  </>
                )}
                
                <button
                  onClick={handleCancel}
                  className="mt-4 px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Zrušiť generovanie
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
