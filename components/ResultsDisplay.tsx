'use client'

import { motion } from 'framer-motion'
import { Image as ImageIcon, Film, Smile, Download } from 'lucide-react'
import type { GenerationResult, UserInput } from '@/types'

interface ResultsDisplayProps {
  results: GenerationResult
  userInput: UserInput | null
}

export default function ResultsDisplay({ results, userInput }: ResultsDisplayProps) {
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  return (
    <div className="space-y-12">
      {/* Komiks */}
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
              className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md"
            >
              <div className="relative">
                <img
                  src={panel.imageUrl}
                  alt={`Panel ${panel.panelNumber}`}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-bold">
                  {panel.panelNumber}
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

      {/* Animácia */}
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
        
        <div className="flex flex-wrap gap-4 justify-center">
          {results.animation.frames.map((frame, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="relative"
            >
              <img
                src={frame}
                alt={`Frame ${index + 1}`}
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Frame {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
        
        {results.animation.gifUrl && (
          <div className="mt-6 text-center">
            <img
              src={results.animation.gifUrl}
              alt="Animácia GIF"
              className="mx-auto rounded-lg shadow-lg max-w-full"
            />
          </div>
        )}
      </motion.section>

      {/* Meme Pack */}
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
              className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md relative group"
            >
              <img
                src={meme.imageUrl}
                alt={meme.text}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <p className="text-gray-800 dark:text-white font-semibold mb-2">
                  {meme.text}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Template: {meme.template}
                </p>
              </div>
              <button
                onClick={() => downloadImage(meme.imageUrl, `meme-${index + 1}.png`)}
                className="absolute top-2 right-2 bg-primary-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

