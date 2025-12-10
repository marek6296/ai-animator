'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Film, Smile, Download, DownloadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedFrames from './AnimatedFrames'
import { downloadComicAsPDF, downloadAnimationAsGIF, downloadMemePackAsZIP, downloadAll } from '@/lib/downloadUtils'
import type { GenerationResult, UserInput } from '@/types'

interface ResultsDisplayProps {
  results: GenerationResult
  userInput: UserInput | null
}

export default function ResultsDisplay({ results, userInput }: ResultsDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  const handleDownloadComic = async () => {
    try {
      setIsDownloading(true)
      await downloadComicAsPDF(results.comic)
      toast.success('Komiks bol stiahnutý!')
    } catch (error) {
      toast.error('Chyba pri stiahnutí komiksu')
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAnimation = async () => {
    try {
      setIsDownloading(true)
      await downloadAnimationAsGIF(results.animation)
      toast.success('Animácia bola stiahnutá!')
    } catch (error) {
      toast.error('Chyba pri stiahnutí animácie')
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadMemePack = async () => {
    try {
      setIsDownloading(true)
      await downloadMemePackAsZIP(results.memePack)
      toast.success('Meme pack bol stiahnutý!')
    } catch (error) {
      toast.error('Chyba pri stiahnutí meme packu')
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true)
      await downloadAll(results.comic, results.animation, results.memePack)
      toast.success('Všetko bolo stiahnuté!')
    } catch (error) {
      toast.error('Chyba pri stiahnutí')
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Download All Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <button
          onClick={handleDownloadAll}
          disabled={isDownloading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadCloud className="w-5 h-5" />
          {isDownloading ? 'Sťahujem...' : 'Stiahnuť všetko (PDF + ZIP + ZIP)'}
        </button>
      </motion.div>

      {/* Komiks */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              {results.comic.title}
            </h2>
          </div>
          <button
            onClick={handleDownloadComic}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť PDF
          </button>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Animácia
            </h2>
          </div>
          <button
            onClick={handleDownloadAnimation}
            disabled={isDownloading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť ZIP
          </button>
        </div>
        
        <AnimatedFrames frames={results.animation.frames} autoPlay={true} speed={600} />
      </motion.section>

      {/* Meme Pack */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Smile className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Meme Pack
            </h2>
          </div>
          <button
            onClick={handleDownloadMemePack}
            disabled={isDownloading}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg flex items-center gap-2 hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Stiahnuť ZIP
          </button>
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

