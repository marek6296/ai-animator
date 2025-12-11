'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, DollarSign, Star, Phone, Globe, Calendar, User, ExternalLink, Loader2 } from 'lucide-react'
import type { TripTip } from '@/types'

interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  phone_number?: string
  website?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference?: string
    name?: string
    height?: number
    width?: number
  }>
  types?: string[]
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
  }>
}

interface TipDetailModalProps {
  tip: TripTip
  isOpen: boolean
  onClose: () => void
}

export default function TipDetailModal({ tip, isOpen, onClose }: TipDetailModalProps) {
  const [details, setDetails] = useState<PlaceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})

  useEffect(() => {
    if (isOpen && tip.place_id && !details && !loading) {
      fetchPlaceDetails()
    }
  }, [isOpen, tip.place_id])

  // Zablokuj scrollovanie body keď je modal otvorený (bez globálnych wheel/touch listenerov)
  useEffect(() => {
    if (isOpen) {
      // Ulož aktuálnu scroll pozíciu
      const scrollY = window.scrollY
      
      // Zablokuj scrollovanie
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // Vždy obnov scrollovanie
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        
        // Obnov scroll pozíciu
        window.scrollTo(0, scrollY)
      }
    } else {
      // Ak modal nie je otvorený, uisti sa, že scrollovanie je povolené
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (details?.photos && details.photos.length > 0) {
      loadPhotoUrls()
    }
  }, [details])

  const fetchPlaceDetails = async () => {
    if (!tip.place_id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/place-details?place_id=${encodeURIComponent(tip.place_id)}`)
      const data = await response.json()

      if (response.ok && data.details) {
        setDetails(data.details)
      } else {
        setError(data.error || 'Nepodarilo sa načítať detaily')
      }
    } catch (err: any) {
      setError(err.message || 'Chyba pri načítaní detailov')
    } finally {
      setLoading(false)
    }
  }

  const loadPhotoUrls = async () => {
    if (!details?.photos) return

    const urls: Record<number, string> = {}
    
    await Promise.all(
      details.photos.slice(0, 6).map(async (photo, index) => {
        const photoRef = photo.name || photo.photo_reference
        if (!photoRef) return

        try {
          const response = await fetch(`/api/place-photo?photo_reference=${encodeURIComponent(photoRef)}&maxWidth=1200`)
          const data = await response.json()
          if (response.ok && data.photoUrl) {
            urls[index] = data.photoUrl
          }
        } catch (error) {
          console.error(`Error fetching photo URL for photo ${index}:`, error)
        }
      })
    )

    setPhotoUrls(urls)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden"
            onClick={(e) => {
              // Zatvor modal ak klikneme mimo neho
              if (e.target === e.currentTarget) {
                onClose()
              }
            }}
          >
            <div 
              data-modal-container
              className="glass rounded-3xl bg-gray-900/95 backdrop-blur-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
              style={{
                maxHeight: '90vh',
                height: '90vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '2px solid',
                borderImage: 'linear-gradient(135deg, rgba(34, 211, 238, 0.5), rgba(176, 38, 255, 0.5), rgba(255, 0, 110, 0.5)) 1',
                borderRadius: '1.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="relative p-6 border-b border-cyan-400/30 flex-shrink-0 overflow-hidden bg-gray-900/95">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>

                <div className="pr-12 overflow-hidden">
                  <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                    {tip.title}
                  </h2>
                  {details?.formatted_address && (
                    <div className="flex items-center gap-2 text-gray-300 overflow-hidden">
                      <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{details.formatted_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content - Scrollable */}
              <div 
                data-modal-content
                className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 modal-scroll bg-gray-900/95"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(34, 211, 238, 0.3) rgba(31, 41, 55, 0.5)',
                  height: 'calc(90vh - 120px)', // Presná výška - odpočítaj header
                  maxHeight: 'calc(90vh - 120px)',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  minHeight: 0, // Dôležité pre flex-1
                  overscrollBehavior: 'contain'
                }}
              >
                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="ml-3 text-gray-300">Načítavam detaily...</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                  </div>
                )}

                {details && !loading && (
                  <>
                    {/* Photos */}
                    {details.photos && details.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {details.photos.slice(0, 6).map((photo, index) => {
                          const photoUrl = photoUrls[index]
                          if (!photoUrl) {
                            return (
                              <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                              </div>
                            )
                          }
                          return (
                            <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                              <img
                                src={photoUrl}
                                alt={`${tip.title} - Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Description */}
                    <div className="glass border border-purple-500/20 rounded-xl p-6 overflow-hidden">
                      <h3 className="text-xl font-bold text-purple-400 mb-3 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>Popis</h3>
                      <p className="text-gray-300 leading-relaxed break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.description}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-4 overflow-hidden items-stretch">
                      {/* Rating */}
                      {details.rating && (
                        <div className="glass border border-cyan-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <Star className="w-6 h-6 text-cyan-400 fill-cyan-400 flex-shrink-0" />
                            <div className="overflow-hidden leading-tight">
                              <div className="text-2xl font-black text-cyan-400 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{details.rating.toFixed(1)}</div>
                              {details.user_ratings_total && (
                                <div className="text-xs text-gray-400 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                                  {details.user_ratings_total.toLocaleString()} hodnotení
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Opening Hours */}
                      {details.opening_hours && (
                        <div className="glass border border-purple-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <Clock className="w-6 h-6 text-purple-400 flex-shrink-0" />
                            <div className="overflow-hidden leading-tight">
                              <div className="text-lg font-bold text-purple-400 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                                {details.opening_hours.open_now ? 'Otvorené' : 'Zatvorené'}
                              </div>
                              {details.opening_hours.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                                  {details.opening_hours.weekday_text[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      {details.phone_number && (
                        <div className="glass border border-pink-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <Phone className="w-6 h-6 text-pink-400 flex-shrink-0" />
                            <a
                              href={`tel:${details.phone_number}`}
                              className="text-pink-400 hover:text-pink-300 font-semibold break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {details.phone_number}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Website */}
                      {details.website && (
                        <div className="glass border border-blue-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <Globe className="w-6 h-6 text-blue-400 flex-shrink-0" />
                            <a
                              href={details.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              Webová stránka
                              <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      {tip.duration && (
                        <div className="glass border border-green-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <Clock className="w-6 h-6 text-green-400 flex-shrink-0" />
                            <div className="text-green-400 font-semibold break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.duration}</div>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      {tip.price && (
                        <div className="glass border border-yellow-400/20 rounded-xl p-4 overflow-hidden h-full">
                          <div className="flex items-center gap-3 overflow-hidden h-full">
                            <DollarSign className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                            <div className="text-yellow-400 font-semibold break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.price}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Opening Hours Full */}
                    {details.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                      <div className="glass border border-purple-500/20 rounded-xl p-6 overflow-hidden">
                        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                          <Calendar className="w-5 h-5 flex-shrink-0" />
                          Otváracie hodiny
                        </h3>
                        <div className="space-y-2 overflow-hidden">
                          {details.opening_hours.weekday_text.map((day, index) => (
                            <div key={index} className="flex justify-between items-center text-gray-300 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                              <span>{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reviews */}
                    {details.reviews && details.reviews.length > 0 && (
                      <div className="glass border border-cyan-500/20 rounded-xl p-6 overflow-hidden">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                          <Star className="w-5 h-5 flex-shrink-0" />
                          Recenzie ({details.reviews.length})
                        </h3>
                        <div className="space-y-4 overflow-hidden">
                          {details.reviews.slice(0, 5).map((review, index) => (
                            <div key={index} className="border-b border-gray-700/50 pb-4 last:border-0 last:pb-0 overflow-hidden">
                              <div className="flex items-center gap-3 mb-2 overflow-hidden">
                                <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                  <div className="font-semibold text-gray-200 break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{review.author_name}</div>
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="flex flex-shrink-0">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-gray-600'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                      {new Date(review.time * 1000).toLocaleDateString('sk-SK')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mt-2 leading-relaxed break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{review.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Fallback if no place_id */}
                {!tip.place_id && !loading && (
                  <div className="glass border border-purple-500/20 rounded-xl p-6 overflow-hidden">
                    <p className="text-gray-300 leading-relaxed break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.description}</p>
                    {tip.duration && (
                      <div className="mt-4 flex items-center gap-2 text-gray-400 overflow-hidden">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.duration}</span>
                      </div>
                    )}
                    {tip.price && (
                      <div className="mt-2 flex items-center gap-2 text-gray-400 overflow-hidden">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.price}</span>
                      </div>
                    )}
                    {tip.location && (
                      <div className="mt-2 flex items-center gap-2 text-gray-400 overflow-hidden">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{tip.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

