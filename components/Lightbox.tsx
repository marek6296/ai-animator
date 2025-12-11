'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

interface LightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  title?: string
}

export default function Lightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious,
  title 
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrevious()
      if (e.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNext, onPrevious])

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = images[currentIndex]
    link.download = `${title || 'obrazok'}-${currentIndex + 1}.png`
    link.click()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            aria-label="Zatvoriť"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Download button */}
          <button
            onClick={downloadImage}
            className="absolute top-4 right-16 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            aria-label="Stiahnuť"
          >
            <Download className="w-6 h-6" />
          </button>

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt={title || `Obrázok ${currentIndex + 1}`}
            className="w-full h-full object-contain max-h-[90vh] rounded-lg"
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                aria-label="Predchádzajúci"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                aria-label="Ďalší"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


