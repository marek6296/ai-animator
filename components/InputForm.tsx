'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Calendar, DollarSign, Heart, Sparkles } from 'lucide-react'
import type { UserInput } from '@/types'
import toast from 'react-hot-toast'

interface InputFormProps {
  onSubmit: (input: UserInput) => void
  isGenerating: boolean
}

// Zoznam európskych destinácií
const EUROPEAN_DESTINATIONS = [
  'Paríž', 'Londýn', 'Rím', 'Barcelona', 'Amsterdam', 'Berlín', 'Viedeň', 'Praha',
  'Budapešť', 'Krakow', 'Atény', 'Lisabon', 'Dublin', 'Edinburgh', 'Kodaň', 'Štokholm',
  'Oslo', 'Helsinki', 'Reykjavík', 'Zürich', 'Miláno', 'Florencia', 'Venezia', 'Neapol',
  'Madrid', 'Sevilla', 'Valencia', 'Porto', 'Brusel', 'Antverpy', 'Bruggy', 'Luxemburg',
  'Varšava', 'Gdańsk', 'Wrocław', 'Bratislava', 'Ljubljana', 'Záhreb', 'Sarajevo', 'Belehrad',
  'Bukurešť', 'Sofia', 'Tirana', 'Skopje', 'Podgorica', 'Pristina', 'Tallinn', 'Riga', 'Vilnius',
  'Kyjev', 'Minsk', 'Istanbul', 'Ankara', 'Nicosia', 'Valletta', 'Monaco', 'San Marino'
]

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [destination, setDestination] = useState('')
  const [customDestination, setCustomDestination] = useState('')
  const [useCustomDestination, setUseCustomDestination] = useState(false)
  const [tripType, setTripType] = useState<'city' | 'nature' | 'culture'>('city')
  const [duration, setDuration] = useState<number>(3)
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalDestination = useCustomDestination ? customDestination.trim() : destination
    
    if (!finalDestination) {
      toast.error('Prosím, vyberte alebo zadajte destináciu')
      return
    }
    
    onSubmit({ 
      destination: finalDestination,
      tripType,
      duration,
      interests: interests.length > 0 ? interests.join(', ') : undefined,
      budget,
      contentType: 'trip',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 max-w-4xl mx-auto card-futuristic border border-cyan-500/20"
    >
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-cyan-400 neon-cyan" />
        <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          PLÁNOVANIE VÝLETU
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Výber destinácie */}
        <div>
          <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
            <MapPin className="w-6 h-6" />
            Destinácia <span className="text-pink-400">*</span>
          </label>
          <div className="mb-4">
            <label className="flex items-center gap-3 mb-3 cursor-pointer group">
              <input
                type="radio"
                name="destinationType"
                checked={!useCustomDestination}
                onChange={() => setUseCustomDestination(false)}
                disabled={isGenerating}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
              <span className="text-gray-300 group-hover:text-cyan-400 transition-colors">Vybrať z ponuky</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isGenerating || useCustomDestination}
              className="w-full px-5 py-4 glass border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required={!useCustomDestination}
            >
              <option value="" className="bg-[#1e1e2e]">-- Vyberte destináciu --</option>
              {EUROPEAN_DESTINATIONS.map((dest) => (
                <option key={dest} value={dest} className="bg-[#1e1e2e]">{dest}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-3 mb-3 cursor-pointer group">
              <input
                type="radio"
                name="destinationType"
                checked={useCustomDestination}
                onChange={() => setUseCustomDestination(true)}
                disabled={isGenerating}
                className="w-5 h-5 accent-purple-400 cursor-pointer"
              />
              <span className="text-gray-300 group-hover:text-purple-400 transition-colors">Zadať vlastnú destináciu</span>
            </label>
            <input
              type="text"
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="Napríklad: Santorini, Mykonos, Dubrovnik..."
              disabled={isGenerating || !useCustomDestination}
              className="w-full px-5 py-4 glass border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required={useCustomDestination}
            />
          </div>
        </div>

        {/* Typ výletu */}
        <div>
          <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
            <Heart className="w-6 h-6" />
            Typ výletu
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'city', label: 'Mestský', color: 'cyan' },
              { value: 'nature', label: 'Prírodný', color: 'green' },
              { value: 'culture', label: 'Kultúrny', color: 'purple' },
            ].map((type) => {
              const isSelected = tripType === type.value
              const colorClasses = {
                cyan: isSelected ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400' : 'border-gray-600 text-gray-400 hover:border-cyan-400/50',
                green: isSelected ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-gray-600 text-gray-400 hover:border-green-400/50',
                blue: isSelected ? 'border-blue-400 bg-blue-400/20 text-blue-400' : 'border-gray-600 text-gray-400 hover:border-blue-400/50',
                purple: isSelected ? 'border-purple-400 bg-purple-400/20 text-purple-400' : 'border-gray-600 text-gray-400 hover:border-purple-400/50',
                pink: isSelected ? 'border-pink-400 bg-pink-400/20 text-pink-400' : 'border-gray-600 text-gray-400 hover:border-pink-400/50',
              }
              
              return (
                <label
                  key={type.value}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all glass ${colorClasses[type.color as keyof typeof colorClasses]}`}
                >
                  <input
                    type="radio"
                    name="tripType"
                    value={type.value}
                    checked={tripType === type.value}
                    onChange={(e) => setTripType(e.target.value as typeof tripType)}
                    disabled={isGenerating}
                    className="sr-only"
                  />
                  <span className="text-sm font-bold">{type.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Dĺžka výletu */}
        <div>
          <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
            <Calendar className="w-6 h-6" />
            Dĺžka výletu
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="1"
              max="14"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              disabled={isGenerating}
            />
            <div className="glass border border-cyan-400/30 rounded-lg px-6 py-3 min-w-[120px] text-center">
              <span className="text-2xl font-black text-cyan-400">
                {duration} {duration === 1 ? 'deň' : duration < 5 ? 'dni' : 'dní'}
              </span>
            </div>
          </div>
        </div>

        {/* Rozpočet */}
        <div>
          <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
            <DollarSign className="w-6 h-6" />
            Rozpočet
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'low', label: 'Nízky', desc: '€', color: 'green' },
              { value: 'medium', label: 'Stredný', desc: '€€', color: 'cyan' },
              { value: 'high', label: 'Vysoký', desc: '€€€', color: 'purple' },
            ].map((budgetOption) => {
              const isSelected = budget === budgetOption.value
              const colorClasses = {
                green: isSelected ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-gray-600 text-gray-400 hover:border-green-400/50',
                cyan: isSelected ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400' : 'border-gray-600 text-gray-400 hover:border-cyan-400/50',
                purple: isSelected ? 'border-purple-400 bg-purple-400/20 text-purple-400' : 'border-gray-600 text-gray-400 hover:border-purple-400/50',
              }
              
              return (
                <label
                  key={budgetOption.value}
                  className={`flex flex-col items-center p-6 border-2 rounded-lg cursor-pointer transition-all glass ${colorClasses[budgetOption.color as keyof typeof colorClasses]}`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={budgetOption.value}
                    checked={budget === budgetOption.value}
                    onChange={(e) => setBudget(e.target.value as typeof budget)}
                    disabled={isGenerating}
                    className="sr-only"
                  />
                  <span className="text-4xl mb-2 font-black">{budgetOption.desc}</span>
                  <span className="text-sm font-bold">{budgetOption.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Záujmy (voliteľné) */}
        <div>
          <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
            <Heart className="w-6 h-6" />
            Záujmy <span className="text-sm text-gray-400 font-normal">(voliteľné)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { id: 'museums', label: 'Múzeá', icon: '🏛️' },
              { id: 'architecture', label: 'Architektúra', icon: '🏛️' },
              { id: 'food', label: 'Jedlo', icon: '🍽️' },
              { id: 'nightlife', label: 'Nočný život', icon: '🌃' },
              { id: 'sports', label: 'Šport', icon: '⚽' },
              { id: 'nature', label: 'Príroda', icon: '🌲' },
              { id: 'shopping', label: 'Nakupovanie', icon: '🛍️' },
              { id: 'art', label: 'Umenie', icon: '🎨' },
              { id: 'music', label: 'Hudba', icon: '🎵' },
              { id: 'history', label: 'História', icon: '📜' },
              { id: 'photography', label: 'Fotografia', icon: '📸' },
              { id: 'relaxation', label: 'Relaxácia', icon: '🧘' },
            ].map((interest) => {
              const isSelected = interests.includes(interest.id)
              return (
                <label
                  key={interest.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all glass ${
                    isSelected
                      ? 'border-purple-400 bg-purple-400/20 text-purple-400'
                      : 'border-gray-600 text-gray-400 hover:border-purple-400/50 hover:text-purple-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, interest.id])
                      } else {
                        setInterests(interests.filter(i => i !== interest.id))
                      }
                    }}
                    disabled={isGenerating}
                    className="w-5 h-5 accent-purple-400 cursor-pointer"
                  />
                  <span className="text-2xl">{interest.icon}</span>
                  <span className="text-sm font-bold">{interest.label}</span>
                </label>
              )
            })}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Vyberte, čo vás zaujíma, aby sme mohli vytvoriť personalizovaný plán
          </p>
        </div>

        <motion.button
          type="submit"
          disabled={isGenerating || (!destination && !customDestination)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-black py-5 px-8 rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed btn-futuristic glow-cyan hover:glow-purple transition-all text-lg uppercase tracking-wider"
        >
          <Send className="w-6 h-6" />
          {isGenerating ? 'Generujem plán...' : 'Vytvoriť plán výletu'}
        </motion.button>
      </form>
    </motion.div>
  )
}
