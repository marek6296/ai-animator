'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, MapPin, Calendar, DollarSign, Users, ChevronRight, ChevronLeft, 
  Star, Clock, Car, Utensils, Heart, Sparkles, CheckCircle2
} from 'lucide-react'
import type { UserInput } from '@/types'
import toast from 'react-hot-toast'

// Typy pre Google Maps
declare global {
  interface Window {
    google: any
  }
}

interface InputFormProps {
  onSubmit: (input: UserInput) => void
  isGenerating: boolean
}

// KROK 2 - Cieľ tripu
const TRIP_GOALS = [
  { id: 'relax', label: 'Relax / Chill', icon: '🧘' },
  { id: 'city_tourism', label: 'Mestská turistika', icon: '🏛️' },
  { id: 'party', label: 'Party / Nočný život', icon: '🎉' },
  { id: 'gastronomy', label: 'Gastronómia', icon: '🍽️' },
  { id: 'nature', label: 'Príroda & výlety', icon: '🌲' },
  { id: 'culture', label: 'Kultúra & múzeá', icon: '🎨' },
  { id: 'shopping', label: 'Nákupy', icon: '🛍️' },
  { id: 'romance', label: 'Romantika', icon: '💕' },
  { id: 'family', label: 'Rodinný výlet', icon: '👨‍👩‍👧‍👦' },
]

// KROK 3 - Záujmy
const INTERESTS = [
  { id: 'landmarks', label: 'Pamätihodnosti', icon: '🏛️' },
  { id: 'museums', label: 'Múzeá / Galérie', icon: '🎨' },
  { id: 'parks', label: 'Parky / Príroda', icon: '🌳' },
  { id: 'viewpoints', label: 'Výhľady / Vyhliadky', icon: '🌄' },
  { id: 'cafes', label: 'Kaviarne', icon: '☕' },
  { id: 'restaurants', label: 'Reštaurácie', icon: '🍽️' },
  { id: 'street_food', label: 'Street food', icon: '🌮' },
  { id: 'bars', label: 'Bary', icon: '🍸' },
  { id: 'clubs', label: 'Kluby', icon: '🎵' },
  { id: 'markets', label: 'Lokálne trhy', icon: '🛒' },
  { id: 'kids_activities', label: 'Detské aktivity', icon: '🎠' },
  { id: 'wellness', label: 'Wellness / Spa', icon: '💆' },
]

// KROK 5 - Typ jedla
const FOOD_PREFERENCES = [
  { id: 'local', label: 'Lokálna kuchyňa', icon: '🍲' },
  { id: 'european', label: 'Európska', icon: '🥖' },
  { id: 'asian', label: 'Ázijská', icon: '🍜' },
  { id: 'street_food', label: 'Street food', icon: '🌮' },
  { id: 'fine_dining', label: 'Fine dining', icon: '🍾' },
]

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [destination, setDestination] = useState('')
  const [destinationPlaceId, setDestinationPlaceId] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<{
    place_id: string
    name: string
    formatted_address?: string
    types?: string[]
    geometry?: {
      location: {
        lat: number
        lng: number
      }
    }
  } | null>(null)
  const [hasSpecificDates, setHasSpecificDates] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [adults, setAdults] = useState<number>(2)
  const [children, setChildren] = useState<number>(0)
  const [travelType, setTravelType] = useState<'solo' | 'couple' | 'family' | 'group'>('couple')
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium')
  const [tripGoals, setTripGoals] = useState<string[]>([])
  const [programPace, setProgramPace] = useState<'relaxed' | 'balanced' | 'intensive'>('balanced')
  const [interests, setInterests] = useState<string[]>([])
  const [preferredInterests, setPreferredInterests] = useState<string[]>([])
  const [transportation, setTransportation] = useState<'walk_public' | 'walk_only' | 'car' | 'taxi'>('walk_public')
  // Max walking removed for now
  const [maxWalkingMinutes, setMaxWalkingMinutes] = useState<number | undefined>(undefined)
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false)
  const [avoidStairs, setAvoidStairs] = useState(false)
  const [travelingWithPet, setTravelingWithPet] = useState(false)
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([])
  const [dietaryRestrictions, setDietaryRestrictions] = useState<'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free' | 'other'>('none')
  const [dietaryOther, setDietaryOther] = useState('')
  const [foodPreferences, setFoodPreferences] = useState<string[]>([])
  const [itineraryDetail, setItineraryDetail] = useState<'list' | 'basic' | 'detailed'>('basic')
  const [mode, setMode] = useState<'city' | 'around' | 'single'>('city')
  const [selectedCategories, setSelectedCategories] = useState<('attraction' | 'activity' | 'restaurant' | 'accommodation' | 'tip')[]>([])
  
  const autocompleteRef = useRef<HTMLInputElement>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  // Načítaj Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Skontroluj, či už je načítaný
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('[Autocomplete] Google Maps API už je načítaný')
      setIsGoogleLoaded(true)
      return
    }

    // Skontroluj, či už existuje script tag
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('[Autocomplete] Script už existuje, čakám na načítanie...')
      // Počkaj na načítanie
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('[Autocomplete] Google Maps API načítaný')
          setIsGoogleLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }

    // Načítaj Google Maps API s novým PlaceAutocompleteElement
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) {
      console.error('[Autocomplete] NEXT_PUBLIC_GOOGLE_API_KEY nie je nastavený')
      toast.error('Google Maps API key nie je nastavený. Autocomplete nebude fungovať.')
      return
    }

    console.log('[Autocomplete] Načítavam Google Maps API...')
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=sk`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('[Autocomplete] Script načítaný, čakám na inicializáciu Places API...')
      // Počkaj, kým bude Places API skutočne dostupné
      const checkPlaces = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('[Autocomplete] Google Maps API a Places API načítané úspešne')
          setIsGoogleLoaded(true)
          clearInterval(checkPlaces)
        }
      }, 50)
      
      // Timeout po 10 sekundách
      setTimeout(() => {
        clearInterval(checkPlaces)
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('[Autocomplete] Timeout: Places API sa nenačítalo')
          toast.error('Nepodarilo sa načítať Google Places API')
        }
      }, 10000)
    }
    script.onerror = () => {
      console.error('[Autocomplete] Chyba pri načítaní Google Maps API')
      toast.error('Nepodarilo sa načítať Google Maps API')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Inicializuj Autocomplete widget
  useEffect(() => {
    // Počkaj, kým sa načíta Google Maps API a input element je pripravený
    if (!isGoogleLoaded) {
      console.log('[Autocomplete] Čakám na načítanie Google Maps API...')
      return
    }
    
    // Skontroluj, či je Places API skutočne dostupné
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('[Autocomplete] Google Maps API nie je dostupný (skontroluj window.google.maps.places)')
      // Skús ešte raz po krátkom čase
      const retryTimeout = setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.places && autocompleteRef.current) {
          initializeAutocomplete()
        }
      }, 200)
      return () => clearTimeout(retryTimeout)
    }
    
    // Počkaj na input element (môže byť ešte nie je renderovaný)
    if (!autocompleteRef.current) {
      console.log('[Autocomplete] Input element ešte nie je pripravený, čakám...')
      // Skús znova po krátkom čase
      const timeout = setTimeout(() => {
        if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
          initializeAutocomplete()
        }
      }, 100)
      return () => clearTimeout(timeout)
    }

    initializeAutocomplete()
  }, [isGoogleLoaded, currentStep]) // Pridaj currentStep, aby sa reinicializovalo pri zmene kroku

  const initializeAutocomplete = () => {
    // POZNÁMKA: Používame starý google.maps.places.Autocomplete
    // Google odporúča migráciu na PlaceAutocompleteElement, ale:
    // - Starý Autocomplete stále funguje pre existujúcich zákazníkov
    // - Google dá aspoň 12 mesiacov výpovede pred ukončením podpory
    // - Varovanie v konzole je len informačné, nie chyba
    // Migráciu na nový element plánujeme v budúcnosti
    
    if (!autocompleteRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return
    }

    try {
      console.log('[Autocomplete] Inicializujem Autocomplete widget...')
      
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
        language: 'sk',
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        handlePlaceSelection(place)
      })
      
      console.log('[Autocomplete] Widget inicializovaný úspešne')
    } catch (error) {
      console.error('[Autocomplete] Chyba pri inicializácii:', error)
      toast.error('Chyba pri inicializácii autocomplete')
    }
  }

  const handlePlaceSelection = (place: any) => {
    console.log('[Autocomplete] Miesto vybraté:', place)
    
    if (place && place.place_id) {
      setDestination(place.name || '')
      setDestinationPlaceId(place.place_id)
      
      // Ulož kompletnú informáciu o mieste
      setSelectedPlace({
        place_id: place.place_id,
        name: place.name || '',
        formatted_address: place.formatted_address,
        types: place.types || [],
        geometry: place.geometry ? {
          location: {
            lat: typeof place.geometry.location.lat === 'function' 
              ? place.geometry.location.lat() 
              : place.geometry.location.lat,
            lng: typeof place.geometry.location.lng === 'function'
              ? place.geometry.location.lng()
              : place.geometry.location.lng,
          }
        } : undefined,
      })
      
      console.log('[Autocomplete] Miesto uložené:', place.name)
      
      // Automaticky urči režim podľa typu miesta
      if (place.types && place.types.some((t: string) => ['point_of_interest', 'tourist_attraction', 'museum', 'park', 'restaurant'].includes(t))) {
        if (mode === 'city') {
          setMode('around')
        }
      } else {
        setMode('city')
      }
    } else {
      console.warn('[Autocomplete] Miesto nemá place_id:', place)
    }
  }

  // Google Places Autocomplete - handled by widget
  const handleDestinationChange = (value: string) => {
    setDestination(value)
    // Ak používateľ zmení text manuálne, resetni place_id
    if (!value) {
      setDestinationPlaceId('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // MUSÍ vybrať miesto z autocomplete (nie len text)
    if (!selectedPlace || !selectedPlace.place_id) {
      toast.error('Prosím, vyberte miesto zo zoznamu návrhov')
      setCurrentStep(1)
      return
    }
    // MUSÍ vybrať aspoň jednu kategóriu
    if (selectedCategories.length === 0) {
      toast.error('Prosím, vyberte aspoň jednu kategóriu')
      setCurrentStep(1)
      return
    }
    
    const input: UserInput = {
      destination: selectedPlace.name, // Pre kompatibilitu
      destinationPlaceId: selectedPlace.place_id, // Pre kompatibilitu
      root_place_id: selectedPlace.place_id,
      selectedPlace: selectedPlace,
      mode: mode,
      selectedCategories: selectedCategories,
      hasSpecificDates,
      dateFrom: hasSpecificDates ? dateFrom : undefined,
      dateTo: hasSpecificDates ? dateTo : undefined,
      duration: hasSpecificDates ? undefined : duration,
      adults: undefined,
      children: undefined,
      travelType,
      budget,
      tripGoals: tripGoals.length > 0 ? tripGoals : undefined,
      programPace,
      interests: interests.length > 0 ? interests : undefined,
      preferredInterests: preferredInterests.length > 0 ? preferredInterests : undefined,
      transportation,
      accessibilityNeeds,
      avoidStairs,
      travelingWithPet,
      specialRequirements: specialRequirements.length > 0 ? specialRequirements : undefined,
      dietaryRestrictions: dietaryRestrictions !== 'none' ? dietaryRestrictions : undefined,
      dietaryOther: dietaryRestrictions === 'other' ? dietaryOther : undefined,
      foodPreferences: foodPreferences.length > 0 ? foodPreferences : undefined,
      itineraryDetail,
      contentType: 'trip',
    }
    
    onSubmit(input)
  }

  const nextStep = () => {
    if (currentStep === 1) {
      if (!destination || !selectedPlace) {
        toast.error('Prosím, vyberte destináciu')
        return
      }
      if (selectedCategories.length === 0) {
        toast.error('Prosím, vyberte aspoň jednu kategóriu')
        return
      }
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setInterests(interests.filter(i => i !== interestId))
      setPreferredInterests(preferredInterests.filter(i => i !== interestId))
    } else {
      setInterests([...interests, interestId])
    }
  }

  const togglePreferredInterest = (interestId: string) => {
    if (preferredInterests.includes(interestId)) {
      setPreferredInterests(preferredInterests.filter(i => i !== interestId))
    } else {
      if (interests.includes(interestId)) {
        setPreferredInterests([...preferredInterests, interestId])
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 max-w-5xl mx-auto card-futuristic border border-cyan-500/20"
    >
      <div className="flex items-center justify-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-cyan-400 neon-cyan" />
        <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          PLÁNOVANIE VÝLETU
        </h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                  currentStep >= step
                    ? 'bg-cyan-400 text-gray-900'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
              </div>
              <span className="text-xs mt-2 text-gray-400 text-center">
                {step === 1 && 'Mesto & Kategórie'}
                {step === 2 && 'Špeciálne požiadavky'}
              </span>
            </div>
            {step < 2 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step ? 'bg-cyan-400' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {/* KROK 1 - ZÁKLAD */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-black text-cyan-400 mb-6">KROK 1 – MESTO & KATEGÓRIE</h3>
              
              {/* Destinácia */}
              <div>
                <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
                  <MapPin className="w-6 h-6" />
                  Destinácia <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  {/* Používame starý Autocomplete (stále funguje pre existujúcich zákazníkov) */}
                  {/* Varovanie v konzole je len informačné - Google dá aspoň 12 mesiacov výpovede */}
                  <input
                    ref={autocompleteRef}
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    placeholder="Zadajte mesto, región alebo konkrétne miesto (napr. Eiffel Tower, Paríž, Koloseum...)"
                    disabled={isGenerating || !isGoogleLoaded}
                    className="w-full px-5 py-4 glass border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50"
                    required
                    autoComplete="off"
                    id="autocomplete-input"
                  />
                  {!isGoogleLoaded && (
                    <div className="absolute top-4 right-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {isGoogleLoaded 
                    ? 'Musíte vybrať konkrétne miesto zo zoznamu návrhov (autocomplete)' 
                    : 'Načítavam Google Maps API...'}
                </p>
                {!isGoogleLoaded && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠ Ak sa autocomplete nenačíta, skontrolujte NEXT_PUBLIC_GOOGLE_API_KEY v .env
                  </p>
                )}
                {selectedPlace && (
                  <div className="mt-3 p-3 glass border border-green-400/30 rounded-lg">
                    <p className="text-sm text-green-400 font-bold">✓ Vybraté miesto:</p>
                    <p className="text-white">{selectedPlace.name}</p>
                    {selectedPlace.formatted_address && (
                      <p className="text-xs text-gray-400">{selectedPlace.formatted_address}</p>
                    )}
                    {selectedPlace.types && selectedPlace.types.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedPlace.types.slice(0, 5).map((type, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-cyan-400/20 text-cyan-400 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Výber kategórií */}
                <div className="mt-6">
                  <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
                    <Sparkles className="w-6 h-6" />
                    Čo chcete hľadať? <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'attraction', label: 'Pamiatky', icon: '🏛️' },
                      { id: 'activity', label: 'Aktivity', icon: '🏔️' },
                      { id: 'restaurant', label: 'Reštaurácie', icon: '🍽️' },
                      { id: 'accommodation', label: 'Ubytovanie', icon: '🏨' },
                      { id: 'tip', label: 'Tipy', icon: '💡' },
                    ].map((category) => {
                      const isSelected = selectedCategories.includes(category.id as any)
                      return (
                        <label
                          key={category.id}
                          className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all glass ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                              : 'border-gray-600 text-gray-400 hover:border-cyan-400/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id as any])
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category.id))
                              }
                            }}
                            disabled={isGenerating}
                            className="sr-only"
                          />
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-sm font-bold">{category.label}</span>
                        </label>
                      )
                    })}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-yellow-400 mt-2">
                      ⚠ Musíte vybrať aspoň jednu kategóriu
                    </p>
                  )}
                </div>
                
                {/* Výber režimu (ak je to POI) */}
                {selectedPlace && selectedPlace.types && 
                 selectedPlace.types.some(t => ['point_of_interest', 'tourist_attraction', 'museum', 'park', 'restaurant'].includes(t)) && (
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Režim plánovania:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all glass ${
                        mode === 'around'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                          : 'border-gray-600 text-gray-400 hover:border-cyan-400/50'
                      }`}>
                        <input
                          type="radio"
                          name="mode"
                          value="around"
                          checked={mode === 'around'}
                          onChange={(e) => setMode(e.target.value as typeof mode)}
                          disabled={isGenerating}
                          className="sr-only"
                        />
                        <span className="text-sm font-bold mb-1">Trip okolo miesta</span>
                        <span className="text-xs text-gray-400">Nájdeme ďalšie miesta v okolí</span>
                      </label>
                      <label className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all glass ${
                        mode === 'single'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                          : 'border-gray-600 text-gray-400 hover:border-cyan-400/50'
                      }`}>
                        <input
                          type="radio"
                          name="mode"
                          value="single"
                          checked={mode === 'single'}
                          onChange={(e) => setMode(e.target.value as typeof mode)}
                          disabled={isGenerating}
                          className="sr-only"
                        />
                        <span className="text-sm font-bold mb-1">Detail miesta</span>
                        <span className="text-xs text-gray-400">Len informácie o tomto mieste</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* KROK 2 - ŠPECIÁLNE POŽIADAVKY */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-black text-cyan-400 mb-6">KROK 2 – ŠPECIÁLNE POŽIADAVKY</h3>
              
              {/* Špeciálne požiadavky (Google Maps friendly) */}
              <div>
                <label className="flex items-center gap-3 text-lg font-bold text-cyan-400 mb-4">
                  <Heart className="w-6 h-6" />
                  Špeciálne požiadavky
                </label>
                <div className="space-y-3">
                  {/* Pôvodné prepínače */}
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 rounded-lg cursor-pointer transition-all glass hover:border-cyan-400/50">
                    <input
                      type="checkbox"
                      checked={accessibilityNeeds}
                      onChange={(e) => setAccessibilityNeeds(e.target.checked)}
                      disabled={isGenerating}
                      className="w-5 h-5 accent-cyan-400"
                    />
                    <span className="text-gray-300">Potrebujem bezbariérový prístup</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 rounded-lg cursor-pointer transition-all glass hover:border-cyan-400/50">
                    <input
                      type="checkbox"
                      checked={avoidStairs}
                      onChange={(e) => setAvoidStairs(e.target.checked)}
                      disabled={isGenerating}
                      className="w-5 h-5 accent-cyan-400"
                    />
                    <span className="text-gray-300">Nechcem veľa schodov / náročné túry</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-600 rounded-lg cursor-pointer transition-all glass hover:border-cyan-400/50">
                    <input
                      type="checkbox"
                      checked={travelingWithPet}
                      onChange={(e) => setTravelingWithPet(e.target.checked)}
                      disabled={isGenerating}
                      className="w-5 h-5 accent-cyan-400"
                    />
                    <span className="text-gray-300">Cestujem so psom</span>
                  </label>

                  {/* Nové Google Maps filtre */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'wheelchair_accessible', label: 'Bezbariérový vstup (Google)' },
                      { id: 'kid_friendly', label: 'Vhodné pre deti' },
                      { id: 'pet_friendly', label: 'Vhodné pre zvieratá' },
                      { id: 'parking', label: 'Parkovanie k dispozícii' },
                      { id: 'outdoor_seating', label: 'Vonkajšie sedenie' },
                    ].map((option) => {
                      const isSelected = specialRequirements.includes(option.id)
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all glass ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                              : 'border-gray-600 text-gray-300 hover:border-cyan-400/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecialRequirements([...specialRequirements, option.id])
                              } else {
                                setSpecialRequirements(specialRequirements.filter(r => r !== option.id))
                              }
                            }}
                            disabled={isGenerating}
                            className="w-5 h-5 accent-cyan-400"
                          />
                          <span className="text-gray-300">{option.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || isGenerating}
            className="flex items-center gap-2 px-6 py-3 glass border border-cyan-500/30 rounded-lg text-cyan-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Späť
          </button>

          {currentStep < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 glass border border-cyan-500/30 rounded-lg text-cyan-400 font-bold hover:bg-cyan-400/10 transition-all"
            >
              Ďalej
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <motion.button
              type="submit"
              disabled={isGenerating || !destination}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed btn-futuristic glow-cyan hover:glow-purple transition-all"
            >
              <Send className="w-5 h-5" />
              {isGenerating ? 'Generujem plán...' : 'Vytvoriť plán výletu'}
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
