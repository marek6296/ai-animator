'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Camera, Utensils, Hotel, Mountain, Info, Calendar, Globe, Star } from 'lucide-react'
import type { GenerationResult, UserInput, TripTip } from '@/types'
import TripMap from './TripMap'
import TipDetailModal from './TipDetailModal'

interface ResultsDisplayProps {
  results: GenerationResult
  userInput: UserInput | null
}

const categoryIcons: Record<TripTip['category'], React.ReactNode> = {
  attraction: <Camera className="w-4 h-4" />,
  activity: <Mountain className="w-4 h-4" />,
  restaurant: <Utensils className="w-4 h-4" />,
  accommodation: <Hotel className="w-4 h-4" />,
  tip: <Info className="w-4 h-4" />,
}

const categoryLabels: Record<TripTip['category'], string> = {
  attraction: 'Pamiatka',
  activity: 'Aktivita',
  restaurant: 'Reštaurácia',
  accommodation: 'Ubytovanie',
  tip: 'Tip',
}

const categoryColors: Record<TripTip['category'], { bg: string; border: string; text: string; glow: string }> = {
  attraction: {
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    text: 'text-cyan-400',
    glow: 'glow-cyan',
  },
  activity: {
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    glow: 'glow-purple',
  },
  restaurant: {
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/30',
    text: 'text-pink-400',
    glow: 'glow-pink',
  },
  accommodation: {
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    glow: 'glow-cyan',
  },
  tip: {
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    text: 'text-green-400',
    glow: 'glow-cyan',
  },
}

export default function ResultsDisplay({ results, userInput }: ResultsDisplayProps) {
  const [selectedTip, setSelectedTip] = useState<TripTip | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredTipIndex, setHoveredTipIndex] = useState<string | null>(null)
  const [hoverPhotoUrls, setHoverPhotoUrls] = useState<Record<string, string[]>>({})
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({})
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({})
  
  // Načítaj obrázky pre všetky tipy, ktoré majú photoReferences (už pri načítaní komponentu)
  useEffect(() => {
    if (!results.trip) return
    
    const loadAllPhotos = async () => {
      const photoUrlsMap: Record<string, string[]> = {}
      
      // Zoskupte tipy podľa kategórie (rovnaká logika ako v render)
      const tipsByCategory = results.trip!.tips.reduce((acc, tip) => {
        if (!acc[tip.category]) {
          acc[tip.category] = []
        }
        acc[tip.category].push(tip)
        return acc
      }, {} as Record<TripTip['category'], TripTip[]>)
      
      // Prejdeme všetky kategórie a tipy v nich
      for (const [category, tips] of Object.entries(tipsByCategory)) {
        for (let index = 0; index < tips.length; index++) {
          const tip = tips[index]
          if (tip.photoReferences && tip.photoReferences.length > 0) {
            const globalIndex = `${category}-${index}`
            const urls: string[] = []
            
            await Promise.all(
              tip.photoReferences.slice(0, 3).map(async (photoRef) => {
                try {
                  const response = await fetch(`/api/place-photo?photo_reference=${encodeURIComponent(photoRef)}&maxWidth=800`)
                  const data = await response.json()
                  if (response.ok && data.photoUrl) {
                    urls.push(data.photoUrl)
                  }
                } catch (error) {
                  console.error(`Error fetching photo URL for ${tip.title}:`, error)
                }
              })
            )
            
            if (urls.length > 0) {
              photoUrlsMap[globalIndex] = urls
            }
          }
        }
      }
      
      setHoverPhotoUrls(photoUrlsMap)
    }
    
    loadAllPhotos()
    
    // Cleanup - vyčisti intervaly pri odstránení komponentu
    return () => {
      Object.values(intervalRefs.current).forEach(interval => clearInterval(interval))
    }
  }, [results.trip])

  if (!results.trip) return null

  const { trip } = results

  // Zoskupte tipy podľa kategórie
  const tipsByCategory = trip.tips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = []
    }
    acc[tip.category].push(tip)
    return acc
  }, {} as Record<TripTip['category'], TripTip[]>)

  const handleTipClick = (tip: TripTip) => {
    setSelectedTip(tip)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTip(null)
  }

  return (
    <div className="space-y-12">
      {/* Hero Section - Trip Header */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-10 border border-cyan-500/20 card-futuristic relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="p-6 bg-cyan-400/20 rounded-2xl border border-cyan-400/30 glow-cyan">
              <MapPin className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {trip.destination}
              </h2>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-semibold">{trip.country}</span>
                </div>
                {userInput?.duration && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-semibold">{userInput.duration} {userInput.duration === 1 ? 'deň' : userInput.duration < 5 ? 'dni' : 'dní'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        {trip.summary && (
          <div className="glass border border-purple-500/20 rounded-xl p-6 mt-6">
            <p className="text-gray-200 leading-relaxed text-lg">{trip.summary}</p>
          </div>
        )}
      </div>
    </motion.section>

    {/* Google Map */}
    {trip.tips && trip.tips.length > 0 && (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <TripMap trip={trip} tips={trip.tips} />
      </motion.section>
    )}

    {/* Trip Tips by Category */}
      <div className="space-y-8">
        {Object.entries(tipsByCategory).map(([category, tips]) => {
          const categoryKey = category as TripTip['category']
          const colors = categoryColors[categoryKey]
          
          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4">
                <div className={`p-3 ${colors.bg} ${colors.border} border-2 rounded-xl ${colors.glow}`}>
                  <div className={colors.text}>
                    {categoryIcons[categoryKey]}
                  </div>
                </div>
                <h3 className={`text-3xl font-black ${colors.text} uppercase tracking-wider`}>
                  {categoryLabels[categoryKey]}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-pink-400/30" />
                <span className={`text-2xl font-black ${colors.text}`}>
                  {tips.length}
                </span>
              </div>

              {/* Tips Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips.map((tip, index) => {
                  // Použij unique key kombinujúci category a index pre globálny identifikátor
                  const globalIndex = `${category}-${index}`
                  const isHovered = hoveredTipIndex === globalIndex
                  const photoUrls = hoverPhotoUrls[globalIndex] || []
                  const currentIndex = currentPhotoIndex[globalIndex] || 0
                  
                  // Ak máme načítané obrázky, použijeme ich (aj bez hover), inak použijeme imageUrl
                  const displayImageUrl = photoUrls.length > 0
                    ? photoUrls[currentIndex % photoUrls.length]
                    : tip.imageUrl
                  
                  return (
                    <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTipClick(tip)}
                    onMouseEnter={() => {
                      setHoveredTipIndex(globalIndex)
                      // Spusti animáciu zmeny fotiek ak máme načítané obrázky
                      if (photoUrls.length > 1) {
                        // Vyčisti existujúci interval ak existuje
                        if (intervalRefs.current[globalIndex]) {
                          clearInterval(intervalRefs.current[globalIndex])
                        }
                        const interval = setInterval(() => {
                          setCurrentPhotoIndex(prev => {
                            const current = prev[globalIndex] || 0
                            const next = (current + 1) % photoUrls.length
                            return { ...prev, [globalIndex]: next }
                          })
                        }, 2000) // Zmeň fotku každé 2 sekundy
                        intervalRefs.current[globalIndex] = interval
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredTipIndex(null)
                      // Vyčisti interval
                      if (intervalRefs.current[globalIndex]) {
                        clearInterval(intervalRefs.current[globalIndex])
                        delete intervalRefs.current[globalIndex]
                      }
                      setCurrentPhotoIndex(prev => {
                        const newState = { ...prev }
                        delete newState[globalIndex]
                        return newState
                      })
                    }}
                    className={`glass rounded-xl overflow-hidden border-2 card-futuristic ${colors.border} ${colors.bg} hover:${colors.glow} transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {/* Image */}
                    {displayImageUrl && displayImageUrl.trim() !== '' ? (
                      <div className="relative w-full h-96 md:h-[28rem] overflow-hidden bg-gray-800">
                        <motion.img
                          key={displayImageUrl}
                          src={displayImageUrl}
                          alt={`${tip.title} in ${trip.destination}`}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={async (e) => {
                            // Fallback ak sa obrázok nenačíta - skúsime iný zdroj
                            console.error(`Failed to load image for "${tip.title}": ${tip.imageUrl}`)
                            const img = e.currentTarget as HTMLImageElement
                            
                            // Ak je to Unsplash Source, skúsime Pexels
                            if (tip.imageUrl.includes('source.unsplash.com')) {
                              const cityTranslations: Record<string, string> = {
                                'Paríž': 'Paris', 'Londýn': 'London', 'Rím': 'Rome', 'Barcelona': 'Barcelona',
                                'Amsterdam': 'Amsterdam', 'Berlín': 'Berlin', 'Viedeň': 'Vienna', 'Praha': 'Prague',
                              }
                              const englishCity = cityTranslations[trip.destination] || trip.destination
                              
                              // Skúsime Pexels API priamo
                              try {
                                const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${tip.title} ${englishCity}`)}&per_page=1&orientation=landscape`
                                const response = await fetch(pexelsUrl)
                                if (response.ok) {
                                  const data = await response.json()
                                  if (data.photos && data.photos.length > 0) {
                                    const newUrl = data.photos[0].src?.large || data.photos[0].src?.medium
                                    if (newUrl) {
                                      img.src = newUrl
                                      console.log(`✓ Retry successful with Pexels for "${tip.title}"`)
                                      return
                                    }
                                  }
                                }
                              } catch (error) {
                                console.warn('Pexels retry failed:', error)
                              }
                            }
                            
                            // Ak sa stále nenačíta, zobrazíme placeholder
                            const parent = img.parentElement
                            if (parent) {
                              img.style.display = 'none'
                              if (!parent.querySelector('.error-placeholder')) {
                                const placeholder = document.createElement('div')
                                placeholder.className = 'error-placeholder absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center z-10'
                                placeholder.innerHTML = `
                                  <div class="text-center">
                                    <svg class="w-12 h-12 text-gray-500 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p class="text-xs text-gray-400 opacity-50">Obrázok sa nenačítal</p>
                                  </div>
                                `
                                parent.appendChild(placeholder)
                              }
                            }
                          }}
                          onLoad={() => {
                            console.log(`✓ Image loaded successfully for "${tip.title}"`)
                            console.log(`  Image URL: ${displayImageUrl}`)
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className={`absolute top-2 left-2 px-2.5 py-1.5 rounded-lg bg-black/90 ${colors.border} border backdrop-blur-md shadow-xl ${colors.glow} z-10`}>
                          <div className={`flex items-center gap-1.5 ${colors.text}`}>
                            <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
                              {categoryIcons[categoryKey]}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide drop-shadow-lg leading-none">{categoryLabels[categoryKey]}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Placeholder ak nie je obrázok
                      <div className="relative w-full h-96 md:h-[28rem] overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className={`w-12 h-12 ${colors.text} mx-auto mb-2 opacity-50`} />
                          <p className={`text-xs ${colors.text} opacity-50`}>Obrázok sa načítava...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Title with Star */}
                      <div className="flex items-start gap-3 mb-4">
                        <Star className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-1`} />
                        <h4 className="text-xl font-black text-white leading-tight">{tip.title}</h4>
                      </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-5 min-h-[80px]">{tip.description}</p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                        {tip.duration && (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                            <Clock className={`w-4 h-4 ${colors.text}`} />
                            <span className={`text-xs font-bold ${colors.text}`}>{tip.duration}</span>
                          </div>
                        )}
                        {tip.price && (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                            <DollarSign className={`w-4 h-4 ${colors.text}`} />
                            <span className={`text-xs font-bold ${colors.text}`}>{tip.price}</span>
                          </div>
                        )}
                        {tip.location && (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                            <MapPin className={`w-4 h-4 ${colors.text}`} />
                            <span className={`text-xs font-bold ${colors.text}`}>{tip.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )
        })}
      </div>

      {/* Summary Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-8 border border-cyan-500/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Star className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-black text-cyan-400">Váš plán výletu je pripravený!</h3>
        </div>
        <p className="text-gray-300">
          Máte celkom <span className="text-cyan-400 font-bold">{trip.tips.length}</span> odporúčaní na nezabudnuteľný výlet do {trip.destination}
        </p>
      </motion.div>

      {/* Detail Modal */}
      {selectedTip && (
        <TipDetailModal
          tip={selectedTip}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
