'use client'

import { motion } from 'framer-motion'
import { Loader2, CheckCircle2 } from 'lucide-react'
import type { ProgressUpdate } from '@/types'

interface ProgressBarProps {
  progress: ProgressUpdate | null
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  if (!progress) return null

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'comic':
        return 'Generujem komiks...'
      case 'animation':
        return 'Generujem animáciu...'
      case 'meme':
        return 'Generujem meme pack...'
      case 'complete':
        return 'Hotovo!'
      default:
        return 'Generujem...'
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds || seconds < 0) return ''
    if (seconds < 60) {
      return `~${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `~${minutes}m ${secs}s`
  }

  const progressPercent = Math.min(100, Math.max(0, progress.progress))

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {progress.step === 'complete' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              )}
              <span className="font-semibold text-gray-800 dark:text-white">
                {getStepLabel(progress.step)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progressPercent.toFixed(0)}%
              {progress.estimatedTimeRemaining && (
                <span className="ml-2">{formatTime(progress.estimatedTimeRemaining)}</span>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
            />
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {progress.message}
        </p>
      </div>
    </div>
  )
}


