'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MapPin, Sparkles, BarChart3, Compass } from 'lucide-react'

export default function Home() {
  const router = useRouter()

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
              EASY PLACES
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Inteligentné nástroje pre <span className="text-cyan-400 font-semibold">nájdenie zaujímavých miest</span> a{' '}
            <span className="text-purple-400 font-semibold">analýzu recenzií</span>
          </motion.p>
        </motion.div>

        {/* Two Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-16">
          {/* Trip Planner Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass rounded-2xl p-8 border border-cyan-500/30 cursor-pointer group relative overflow-hidden"
            onClick={() => router.push('/trip-planner')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-6 group-hover:bg-cyan-500/30 transition-colors">
                <Compass className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-cyan-400 mb-4">Miesta</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Navrhne miesta na základe recenzií a vyberie relevantné miesta, ktoré stoja za návštevu.
              </p>
              <div className="mt-6 flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                Začať plánovať
                <span className="ml-2">→</span>
              </div>
            </div>
          </motion.div>

          {/* Review Analyzer Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass rounded-2xl p-8 border border-purple-500/30 cursor-pointer group relative overflow-hidden"
            onClick={() => router.push('/review-analyzer')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6 group-hover:bg-purple-500/30 transition-colors">
                <BarChart3 className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-purple-400 mb-4">Analyzovať recenzie</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Vyber ľubovoľné miesto z Google Maps a získaj podrobnú AI analýzu všetkých recenzií.
              </p>
              <div className="mt-6 flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Analyzovať miesto
                <span className="ml-2">→</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center justify-center gap-8 mt-16"
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">50+ Destinácií</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI Analýza</span>
          </div>
          <div className="flex items-center gap-2 text-pink-400">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Detailné Recenzie</span>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
