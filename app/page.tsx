'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Users, Image as ImageIcon, Film, Smile, X } from 'lucide-react'
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
      // Spusti generovanie
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

      // Polling pre progress
      progressIntervalRef.current = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/generate-stream?id=${newRequestId}`, {
            signal: abortControllerRef.current?.signal,
          })

          if (!progressResponse.ok) {
            throw new Error('Chyba pri získavaní progressu')
          }

          const progressData = await progressResponse.json()
          setProgress(progressData)

          // Ak je hotovo, získaj výsledky
          if (progressData.step === 'complete') {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
            }
            
            if (progressData.error) {
              throw new Error(progressData.error)
            }

            if (progressData.result) {
              setResults(progressData.result)
              toast.success('Komiks, animácia a meme pack boli úspešne vygenerované!')
            }
            
            setIsGenerating(false)
            setProgress(null)
            setRequestId(null)
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            return
          }
          console.error('Progress polling error:', error)
        }
      }, 1000) // Poll každú sekundu

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Animator
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Vytvárajte personalizované komiksy, animácie a meme packy pomocou umelnej inteligencie
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <ImageIcon className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Komiks</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI vytvorí personalizovaný komiks na základe vášho príbehu
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <Film className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Animácia</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Krátka animácia zachytávajúca vašu situáciu
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <Smile className="w-10 h-10 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Meme Pack</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sada personalizovaných memov pre vás a vašich kamarátov
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InputForm onSubmit={handleSubmit} isGenerating={isGenerating} />
        </motion.div>

        {results && (results.comic || results.animation || results.memePack) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <ResultsDisplay results={results} userInput={userInput} />
          </motion.div>
        )}

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-2xl w-full mx-4">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Zrušiť"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {progress && <ProgressBar progress={progress} />}
                
                {!progress && (
                  <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                    <p className="text-xl font-semibold">Spúšťam generovanie...</p>
                  </>
                )}
                
                <button
                  onClick={handleCancel}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

