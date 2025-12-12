/**
 * Statické preklady pre UI texty
 * Tieto texty sú preložené vopred a uložené tu
 * AI sa používa len pre dynamický obsah (recenzie, trip planning)
 */

export type Language = 'sk' | 'en' | 'no'

export interface Translations {
  // Hlavná stránka
  mainPage: {
    title: string
    subtitle: string
    findPlaces: string
    analyzeReviews: string
    findPlacesDescription: string
    analyzeReviewsDescription: string
    startPlanning: string
    analyzePlace: string
    destinations: string
    aiAnalysis: string
    detailedReviews: string
  }
  
  // Trip Planner
  tripPlanner: {
    title: string
    backToMain: string
  }
  
  // Review Analyzer
  reviewAnalyzer: {
    title: string
    backToMain: string
    selectPlace: string
    analyzing: string
    noReviews: string
    analyzeButton: string
    analyzeAnother: string
    placeSearchPlaceholder: string
    placeSearchHint: string
    selectPlaceError: string
    analyzeError: string
    analyzeSuccess: string
    loadingPhoto: string
  }
  
  // Review Analysis Display
  reviewAnalysis: {
    overallRating: string
    positive: string
    neutral: string
    negative: string
    reviews: string
    keyThemes: string
    strengths: string
    weaknesses: string
    recommendations: string
    ratingDistribution: string
    languageDistribution: string
    recentTrends: string
    positiveReviews: string
    neutralReviews: string
    negativeReviews: string
    moreReviews: string
    noPhoto: string
    apiLimitWarning: string
    totalReviews: string
    availableFromApi: string
  }
}

const translations: Record<Language, Translations> = {
  sk: {
    mainPage: {
      title: 'EASY PLACES',
      subtitle: 'Inteligentné nástroje pre nájdenie zaujímavých miest a analýzu recenzií',
      findPlaces: 'Miesta',
      analyzeReviews: 'Analyzovať recenzie',
      findPlacesDescription: 'Navrhne miesta na základe recenzií a vyberie relevantné miesta, ktoré stoja za návštevu.',
      analyzeReviewsDescription: 'Vyber ľubovoľné miesto z Google Maps a získaj podrobnú AI analýzu všetkých recenzií.',
      startPlanning: 'Začať plánovať',
      analyzePlace: 'Analyzovať miesto',
      destinations: '50000+ Destinácií',
      aiAnalysis: 'AI Analýza',
      detailedReviews: 'Detailné Recenzie',
    },
    tripPlanner: {
      title: 'PLÁNOVAČ VÝLETOV',
      backToMain: 'Späť na hlavnú stránku',
    },
    reviewAnalyzer: {
      title: 'ANALÝZA RECENZIÍ',
      backToMain: 'Späť na hlavnú stránku',
      selectPlace: 'Vyberte miesto z Google Maps',
      analyzing: 'Analyzujem recenzie...',
      noReviews: 'Toto miesto nemá žiadne recenzie',
      analyzeButton: 'Analyzovať recenzie',
      analyzeAnother: 'Analyzovať ďalšie miesto',
      placeSearchPlaceholder: 'Vyhľadajte miesto na Google Maps...',
      placeSearchHint: 'Začnite písať názov miesta a vyberte z návrhov Google Maps',
      selectPlaceError: 'Prosím, vyberte miesto',
      analyzeError: 'Nastala chyba pri analýze recenzií',
      analyzeSuccess: 'Analýza recenzií bola úspešne dokončená!',
      loadingPhoto: 'Načítavam...',
    },
    reviewAnalysis: {
      overallRating: 'Celkové hodnotenie',
      positive: 'Pozitívne',
      neutral: 'Neutrálne',
      negative: 'Negatívne',
      reviews: 'recenzií',
      keyThemes: 'Kľúčové témy',
      strengths: 'Silné stránky',
      weaknesses: 'Slabé stránky',
      recommendations: 'Odporúčania',
      ratingDistribution: 'Rozdelenie hodnotení',
      languageDistribution: 'Rozdelenie podľa jazyka',
      recentTrends: 'Nedávne trendy',
      positiveReviews: 'Pozitívne recenzie',
      neutralReviews: 'Neutrálne recenzie',
      negativeReviews: 'Negatívne recenzie',
      moreReviews: 'ďalších recenzií',
      noPhoto: 'Bez fotky',
      apiLimitWarning: 'Google Places API vracia len obmedzený počet recenzií (zvyčajne 5)',
      totalReviews: 'celkom',
      availableFromApi: 'dostupných z API',
    },
  },
  en: {
    mainPage: {
      title: 'EASY PLACES',
      subtitle: 'Intelligent tools for finding interesting places and analyzing reviews',
      findPlaces: 'Places',
      analyzeReviews: 'Analyze Reviews',
      findPlacesDescription: 'Suggests places based on reviews and selects relevant places worth visiting.',
      analyzeReviewsDescription: 'Select any place from Google Maps and get a detailed AI analysis of all reviews.',
      startPlanning: 'Start Planning',
      analyzePlace: 'Analyze Place',
      destinations: '50000+ Destinations',
      aiAnalysis: 'AI Analysis',
      detailedReviews: 'Detailed Reviews',
    },
    tripPlanner: {
      title: 'TRIP PLANNER',
      backToMain: 'Back to Main Page',
    },
    reviewAnalyzer: {
      title: 'REVIEW ANALYZER',
      backToMain: 'Back to Main Page',
      selectPlace: 'Select a place from Google Maps',
      analyzing: 'Analyzing reviews...',
      noReviews: 'This place has no reviews',
      analyzeButton: 'Analyze Reviews',
      analyzeAnother: 'Analyze Another Place',
      placeSearchPlaceholder: 'Search for a place on Google Maps...',
      placeSearchHint: 'Start typing the place name and select from Google Maps suggestions',
      selectPlaceError: 'Please select a place',
      analyzeError: 'An error occurred while analyzing reviews',
      analyzeSuccess: 'Review analysis completed successfully!',
      loadingPhoto: 'Loading...',
    },
    reviewAnalysis: {
      overallRating: 'Overall Rating',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      reviews: 'reviews',
      keyThemes: 'Key Themes',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      recommendations: 'Recommendations',
      ratingDistribution: 'Rating Distribution',
      languageDistribution: 'Language Distribution',
      recentTrends: 'Recent Trends',
      positiveReviews: 'Positive Reviews',
      neutralReviews: 'Neutral Reviews',
      negativeReviews: 'Negative Reviews',
      moreReviews: 'more reviews',
      noPhoto: 'No Photo',
      apiLimitWarning: 'Google Places API returns only a limited number of reviews (usually 5)',
      totalReviews: 'total',
      availableFromApi: 'available from API',
    },
  },
  no: {
    mainPage: {
      title: 'EASY PLACES',
      subtitle: 'Intelligente verktøy for å finne interessante steder og analysere anmeldelser',
      findPlaces: 'Steder',
      analyzeReviews: 'Analyser Anmeldelser',
      findPlacesDescription: 'Foreslår steder basert på anmeldelser og velger relevante steder verdt å besøke.',
      analyzeReviewsDescription: 'Velg et hvilket som helst sted fra Google Maps og få en detaljert AI-analyse av alle anmeldelser.',
      startPlanning: 'Start Planlegging',
      analyzePlace: 'Analyser Sted',
      destinations: '50000+ Destinasjoner',
      aiAnalysis: 'AI Analyse',
      detailedReviews: 'Detaljerte Anmeldelser',
    },
    tripPlanner: {
      title: 'TURPLANLEGGER',
      backToMain: 'Tilbake til Hovedside',
    },
    reviewAnalyzer: {
      title: 'ANMELDELSESANALYSATOR',
      backToMain: 'Tilbake til Hovedside',
      selectPlace: 'Velg et sted fra Google Maps',
      analyzing: 'Analyserer anmeldelser...',
      noReviews: 'Dette stedet har ingen anmeldelser',
      analyzeButton: 'Analyser Anmeldelser',
      analyzeAnother: 'Analyser Et Annet Sted',
      placeSearchPlaceholder: 'Søk etter et sted på Google Maps...',
      placeSearchHint: 'Begynn å skrive stedsnavnet og velg fra Google Maps-forslag',
      selectPlaceError: 'Vennligst velg et sted',
      analyzeError: 'En feil oppstod under analyse av anmeldelser',
      analyzeSuccess: 'Anmeldelsesanalyse fullført!',
      loadingPhoto: 'Laster...',
    },
    reviewAnalysis: {
      overallRating: 'Samlet Vurdering',
      positive: 'Positiv',
      neutral: 'Nøytral',
      negative: 'Negativ',
      reviews: 'anmeldelser',
      keyThemes: 'Nøkkeltemaer',
      strengths: 'Styrker',
      weaknesses: 'Svakheter',
      recommendations: 'Anbefalinger',
      ratingDistribution: 'Vurderingsfordeling',
      languageDistribution: 'Språkfordeling',
      recentTrends: 'Nylige Trender',
      positiveReviews: 'Positive Anmeldelser',
      neutralReviews: 'Nøytrale Anmeldelser',
      negativeReviews: 'Negative Anmeldelser',
      moreReviews: 'flere anmeldelser',
      noPhoto: 'Ingen Foto',
      apiLimitWarning: 'Google Places API returnerer bare et begrenset antall anmeldelser (vanligvis 5)',
      totalReviews: 'totalt',
      availableFromApi: 'tilgjengelig fra API',
    },
  },
}

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}

export function t(lang: Language): Translations {
  return getTranslations(lang)
}

