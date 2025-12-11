export interface UserInput {
  // Trip planning
  destination?: string // Destinácia (mesto alebo krajina v Európe)
  tripType?: 'city' | 'nature' | 'culture' // Typ výletu
  duration?: number // Počet dní
  interests?: string // Záujmy (napr. "múzeá, architektúra, jedlo")
  budget?: 'low' | 'medium' | 'high' // Rozpočet
  
  // Legacy fields (pre kompatibilitu, môžeme odstrániť neskôr)
  self?: string
  situation?: string
  friends?: string
  simpleDescription?: string
  style?: string
  contentType?: 'trip' // Typ obsahu: trip
  referenceImage?: string
  useReferenceImage?: boolean
  imageStrength?: number
  customPrompt?: string
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
  coordinates?: {
    lat: number
    lng: number
  }
  place_id?: string // Google Places place_id
  photo_reference?: string // Google Places photo_reference
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

