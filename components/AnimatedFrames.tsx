'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

interface AnimatedFramesProps {
  frames: string[]
  autoPlay?: boolean
  speed?: number // ms medzi rámcami
}

export default function AnimatedFrames({ 
  frames, 
  autoPlay = true,
  speed = 500 
}: AnimatedFramesProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length)
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, frames.length, speed])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const goToFrame = (index: number) => {
    setCurrentFrame(index)
  }

  if (frames.length === 0) return null

  return (
    <div className="w-full">
      {/* Hlavný obrázok */}
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '1/1' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentFrame}
            src={frames[currentFrame]}
            alt={`Frame ${currentFrame + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
          aria-label={isPlaying ? 'Pauza' : 'Prehrať'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        {/* Frame indicator */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {currentFrame + 1} / {frames.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {frames.map((frame, index) => (
          <button
            key={index}
            onClick={() => goToFrame(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              currentFrame === index
                ? 'border-primary-600 ring-2 ring-primary-300'
                : 'border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={frame}
              alt={`Frame ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

