export interface UserInput {
  // KROK 1 - ZÁKLAD
  destination?: string // Destinácia (mesto, región, alebo konkrétny point) - DEPRECATED, použite root_place_id
  destinationPlaceId?: string // Google Places place_id pre presnú identifikáciu - DEPRECATED, použite root_place_id
  root_place_id?: string // Google Places place_id pre vybraté miesto (povinné)
  selectedPlace?: {
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
  } // Kompletná informácia o vybratom mieste
  mode?: 'city' | 'around' | 'single' // Režim plánovania: city = mesto/oblasť, around = trip okolo POI, single = detail jedného miesta
  hasSpecificDates?: boolean // true = má konkrétne dátumy, false = len dĺžka
  dateFrom?: string // ISO dátum
  dateTo?: string // ISO dátum
  duration?: number // Počet dní (1-14)
  adults?: number // Počet dospelých
  children?: number // Počet detí (voliteľné)
  travelType?: 'solo' | 'couple' | 'family' | 'group' // Typ cestovania (voliteľné)
  budget?: 'low' | 'medium' | 'high' // Rozpočet
  
  // KROK 2 - ŠTÝL VÝLETU
  tripGoals?: string[] // Multi-select: relax, city_tourism, party, gastronomy, nature, culture, shopping, romance, family
  programPace?: 'relaxed' | 'balanced' | 'intensive' // Tempo programu
  
  // KROK 3 - ZÁUJMY (pre filtrovanie Google Places)
  interests?: string[] // Multi-select: landmarks, museums, parks, viewpoints, cafes, restaurants, street_food, bars, clubs, markets, kids_activities, wellness
  preferredInterests?: string[] // Hviezdičkou označené preferované záujmy
  
  // VÝBER KATEGÓRIÍ (čo sa má hľadať)
  selectedCategories?: ('attraction' | 'activity' | 'restaurant' | 'accommodation' | 'tip')[] // Kategórie, ktoré sa majú hľadať
  
  // KROK 4 - DOPRAVA A LIMITY
  transportation?: 'walk_public' | 'walk_only' | 'car' | 'taxi' // Ako sa pohybuje po meste
  accessibilityNeeds?: boolean // Bezbarérový prístup
  avoidStairs?: boolean // Nechce veľa schodov
  travelingWithPet?: boolean // Cestuje so psom
  specialRequirements?: string[] // Google Maps filtre: napr. wheelchair_accessible, kid_friendly, pet_friendly, parking, outdoor_seating
  
  // KROK 5 - JEDLO A OBMEDZENIA
  dietaryRestrictions?: 'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free' | 'other'
  dietaryOther?: string // Iné obmedzenia (text)
  foodPreferences?: string[] // Multi-select: local, european, asian, street_food, fine_dining
  
  // KROK 6 - DETAIL ITINERÁRA
  itineraryDetail?: 'list' | 'basic' | 'detailed' // Úroveň detailu plánu
  
  // Legacy fields (pre kompatibilitu)
  tripType?: 'city' | 'nature' | 'culture' // Starý typ výletu
  contentType?: 'trip' // Typ obsahu: trip
}

export interface ComicPanel {
  imageUrl: string
  text: string
  panelNumber: number
}

export interface Comic {
  panels: ComicPanel[]
  title: string
}

export interface Animation {
  frames: string[]
  gifUrl?: string
}

export interface Meme {
  imageUrl: string
  text: string
  template: string
}

export interface MemePack {
  memes: Meme[]
}

export interface SingleImage {
  imageUrl: string
  title: string
  description: string
}

export interface TripTip {
  title: string
  description: string
  imageUrl: string
  category: 'attraction' | 'activity' | 'restaurant' | 'accommodation' | 'tip'
  location?: string
  duration?: string // Napr. "2-3 hodiny"
  price?: string // Napr. "Zdarma" alebo "€10-20"
  rating?: number
  user_ratings_total?: number
  price_level?: number // 0-4
  business_status?: string
  open_now?: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  place_id?: string // Google Places place_id (môže byť v tvare "places/ChIJ..." pre nové API alebo klasický ID pre legacy)
  photo_reference?: string // Google Places photo reference - môže byť:
  // - Legacy API: photo_reference (dlhý string)
  // - New API: name (v tvare "places/ChIJ.../photos/...")
  // Funkcia getPlacePhotoUrl() automaticky rozpozná formát
  photoReferences?: string[] // Prvé 3 photo references pre animáciu pri hover (voliteľné)
}

export interface Trip {
  destination: string
  country: string
  tips: TripTip[]
  summary: string
  bestTimeToVisit?: string
  currency?: string
  language?: string
}

export interface GenerationResult {
  trip?: Trip
}

export interface ProgressUpdate {
  step: 'trip' | 'complete'
  progress: number // 0-100
  message: string
  estimatedTimeRemaining?: number // v sekundách
}

