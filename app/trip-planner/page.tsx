'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Sparkles, X, Rocket, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import InputForm from '@/components/InputForm'
import ResultsDisplay from '@/components/ResultsDisplay'
import ProgressBar from '@/components/ProgressBar'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import type { UserInput, GenerationResult, ProgressUpdate } from '@/types'

export default function TripPlanner() {
  const router = useRouter()
  const { selectedLanguage, t } = useLanguage()
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [results, setResults] = useState<GenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Uisti sa, že scrollovanie je vždy povolené pri načítaní komponentu
  useEffect(() => {
    // Obnov scrollovanie pri načítaní
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    
    return () => {
      // Cleanup - uisti sa, že scrollovanie je povolené pri odstránení
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [])

  // Bezpečnostný watchdog: vždy po zmene výsledkov/komponentu uvoľni scroll,
  // aby sa predišlo prípadnému zablokovaniu scrollovania (napr. po modale).
  useEffect(() => {
    const resetBodyScroll = () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
    resetBodyScroll()
    return () => resetBodyScroll()
  }, [results])

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
    toast(t.tripPlanner.cancelGeneration, { icon: 'ℹ️' })
  }

  const handleBackToForm = () => {
    setResults(null)
    setUserInput(null)
    setIsGenerating(false)
    setProgress(null)
    setRequestId(null)
    // Scroll na začiatok stránky
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (input: UserInput) => {
    // Pridaj jazyk do inputu
    const inputWithLanguage = {
      ...input,
      language: selectedLanguage,
    }
    
    setUserInput(inputWithLanguage)
    setIsGenerating(true)
    setResults(null)
    setProgress(null)
    
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(t.tripPlanner.generationStartedError)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('[Frontend] Stream ended')
              // Skús parsovať zvyšok bufferu
              if (buffer.trim()) {
                // SSE eventy sú oddelené `\n\n`
                const events = buffer.split('\n\n')
                for (const event of events) {
                  if (event.trim()) {
                    const lines = event.split('\n')
                    for (const line of lines) {
                      if (line.startsWith('data: ')) {
                        try {
                          const jsonStr = line.slice(6).trim()
                          if (jsonStr) {
                            const data = JSON.parse(jsonStr)
                            handleProgressData(data)
                          }
                        } catch (parseError) {
                          console.warn('Error parsing final buffer:', parseError)
                        }
                      }
                    }
                  }
                }
              }
              break
            }

            // Pridaj chunk do bufferu
            buffer += decoder.decode(value, { stream: true })
            
            // SSE eventy sú oddelené `\n\n` - rozdel buffer na eventy
            const events = buffer.split('\n\n')
            // Posledný event môže byť neúplný, tak ho necháme v bufferi
            buffer = events.pop() || ''

            // Spracuj kompletné eventy
            for (const event of events) {
              if (event.trim()) {
                const lines = event.split('\n')
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const jsonStr = line.slice(6).trim()
                      if (jsonStr) {
                        const data = JSON.parse(jsonStr)
                        handleProgressData(data)
                      }
                    } catch (parseError) {
                      console.error('Error parsing progress data:', parseError, 'Event length:', event.length, 'First 200 chars:', event.substring(0, 200))
                    }
                  }
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            return
          }
          console.error('Error reading stream:', error)
          toast.error(t.tripPlanner.readingProgressError)
          setIsGenerating(false)
          setProgress(null)
        }
      }

      const handleProgressData = (data: any) => {
        console.log(`[Frontend] Progress update:`, data)
        setProgress(data)

        if (data.step === 'complete') {
          if (data.error) {
            console.error('Generation error:', data.error)
            toast.error(data.error || t.tripPlanner.generationError)
            setIsGenerating(false)
            setProgress(null)
            return
          }

          if (data.result) {
            console.log('[Frontend] Received result:', data.result)
            if (data.result.trip && data.result.trip.tips) {
              console.log('[Frontend] Tips with imageUrls:')
              data.result.trip.tips.forEach((tip: any, index: number) => {
                console.log(`  Tip ${index + 1}: "${tip.title}"`)
                console.log(`    imageUrl: ${tip.imageUrl || 'MISSING'}`)
                console.log(`    place_id: ${tip.place_id || 'MISSING'}`)
              })
            }
            setResults(data.result)
            toast.success(t.tripPlanner.tripGeneratedSuccess)
          } else {
            console.error('No result in progress data:', data)
            toast.error('Nepodarilo sa vygenerovať obsah. Skúste to znova.')
          }
          
          setIsGenerating(false)
          setProgress(null)
        }
      }

      readStream()

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      console.error('Error:', error)
      const errorMessage = error.message || t.tripPlanner.generationError
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
        {/* Ak sú výsledky, zobraz len výsledky s tlačidlom Späť */}
        {results && results.trip ? (
          <div>
            {/* Tlačidlo Späť */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <button
                onClick={handleBackToForm}
                className="flex items-center gap-2 px-6 py-3 glass border border-cyan-500/30 rounded-lg text-cyan-400 font-bold hover:bg-cyan-400/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                {t.tripPlanner.backToNewTrip}
              </button>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ResultsDisplay results={results} userInput={userInput} />
            </motion.div>
          </div>
        ) : (
          <>
            {/* Back Button and Language Selector */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-6 py-3 glass border border-cyan-500/30 rounded-lg text-cyan-400 font-bold hover:bg-cyan-400/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t.tripPlanner.backToMain}
                </button>
              </motion.div>
              <LanguageSelector />
            </div>

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
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                  {t.tripPlanner.title}
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: t.tripPlanner.subtitle
                    .replace(/<highlight1>(.*?)<\/highlight1>/g, '<span class="text-cyan-400 font-semibold">$1</span>')
                    .replace(/<highlight2>(.*?)<\/highlight2>/g, '<span class="text-purple-400 font-semibold">$1</span>')
                    .replace(/<highlight3>(.*?)<\/highlight3>/g, '<span class="text-pink-400 font-semibold">$1</span>')
                }}
              />

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
                  <span className="text-sm font-medium">{t.tripPlanner.intelligentSystem}</span>
                </div>
                <div className="flex items-center gap-2 text-pink-400">
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.tripPlanner.instantResults}</span>
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
          </>
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
                  aria-label={t.tripPlanner.cancel}
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
