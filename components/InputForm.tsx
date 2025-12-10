'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, User, MessageSquare, Users, Image as ImageIcon, Film, Smile } from 'lucide-react'
import type { UserInput } from '@/types'

interface InputFormProps {
  onSubmit: (input: UserInput) => void
  isGenerating: boolean
}

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [self, setSelf] = useState('')
  const [situation, setSituation] = useState('')
  const [friends, setFriends] = useState('')
  const [generateComic, setGenerateComic] = useState(true)
  const [generateAnimation, setGenerateAnimation] = useState(true)
  const [generateMemePack, setGenerateMemePack] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (self.trim() && situation.trim() && friends.trim()) {
      if (!generateComic && !generateAnimation && !generateMemePack) {
        alert('Vyberte aspoň jednu možnosť na generovanie!')
        return
      }
      onSubmit({ 
        self, 
        situation, 
        friends,
        generateComic,
        generateAnimation,
        generateMemePack
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Opíšte svoj príbeh
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <User className="w-5 h-5" />
            O sebe
          </label>
          <textarea
            value={self}
            onChange={(e) => setSelf(e.target.value)}
            placeholder="Napríklad: Som 25-ročný študent, ktorý miluje programovanie a kávu..."
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            required
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <MessageSquare className="w-5 h-5" />
            Situácia
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Napríklad: Našli sme sa s kamarátmi v kaviarni a rozhodli sme sa, že pôjdeme na výlet..."
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            required
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Users className="w-5 h-5" />
            Kamaráti
          </label>
          <textarea
            value={friends}
            onChange={(e) => setFriends(e.target.value)}
            placeholder="Napríklad: Marek - vtipný programátor, Ján - milovník prírody, Eva - kreatívna dizajnérka..."
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            required
            disabled={isGenerating}
          />
        </div>

        {/* Výber čo generovať */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
          <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Vyberte čo chcete vygenerovať:
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={generateComic}
                onChange={(e) => setGenerateComic(e.target.checked)}
                disabled={isGenerating}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-800 dark:text-white">Komiks</span>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={generateAnimation}
                onChange={(e) => setGenerateAnimation(e.target.checked)}
                disabled={isGenerating}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <Film className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-800 dark:text-white">Animácia</span>
            </label>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={generateMemePack}
                onChange={(e) => setGenerateMemePack(e.target.checked)}
                disabled={isGenerating}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <Smile className="w-6 h-6 text-pink-600" />
              <span className="font-semibold text-gray-800 dark:text-white">Meme Pack</span>
            </label>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isGenerating || !self.trim() || !situation.trim() || !friends.trim() || (!generateComic && !generateAnimation && !generateMemePack)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
        >
          <Send className="w-5 h-5" />
          {isGenerating ? 'Generujem...' : 'Vytvoriť vybrané'}
        </motion.button>
      </form>
    </motion.div>
  )
}

