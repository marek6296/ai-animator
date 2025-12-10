'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Film, Smile, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedFrames from './AnimatedFrames'
import Lightbox from './Lightbox'
import type { GenerationResult, UserInput } from '@/types'

interface ResultsDisplayProps {
  results: GenerationResult
  userInput: UserInput | null
}

export default function ResultsDisplay({ results, userInput }: ResultsDisplayProps) {
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    toast.success('Obrázok bol stiahnutý!')
  }

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const previousImage = () => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }


  return (
    <div className="space-y-12">
      {/* Komiks */}
      {results.comic && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {results.comic.title}
            </h2>
          </div>
        
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.comic.panels.map((panel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div 
                  className="relative"
                  onClick={() => openLightbox(
                    results.comic!.panels.map(p => p.imageUrl),
                    index
                  )}
                >
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${panel.panelNumber}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-bold">
                    {panel.panelNumber}
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImage(panel.imageUrl, `komiks-panel-${panel.panelNumber}.png`)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {panel.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
          title="Komiks"
        />
      )}

      {/* Animácia */}
      {results.animation && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Film className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Animácia
            </h2>
          </div>
          
          <AnimatedFrames 
            frames={results.animation.frames} 
            autoPlay={true} 
            speed={400}
            onFrameClick={(index) => openLightbox(results.animation!.frames, index)}
            onDownload={(index) => downloadImage(results.animation!.frames[index], `animacia-frame-${index + 1}.png`)}
          />
        </motion.section>
      )}

      {/* Meme Pack */}
      {results.memePack && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Smile className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Meme Pack
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.memePack.memes.map((meme, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md relative group cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div
                  onClick={() => openLightbox(
                    results.memePack!.memes.map(m => m.imageUrl),
                    index
                  )}
                >
                  <img
                    src={meme.imageUrl}
                    alt={meme.text}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImage(meme.imageUrl, `meme-${index + 1}.png`)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-800 dark:text-white font-semibold mb-2">
                    {meme.text}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Template: {meme.template}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}

