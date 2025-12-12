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
    subtitle: string
    backToMain: string
    backToNewTrip: string
    cancelGeneration: string
    generationError: string
    readingProgressError: string
    generationStartedError: string
    intelligentSystem: string
    instantResults: string
    cancel: string
    // Input Form
    step1Title: string
    step2Title: string
    destination: string
    destinationPlaceholder: string
    destinationHint: string
    destinationHintLoading: string
    destinationApiWarning: string
    selectedPlace: string
    whatToSearch: string
    categoryAttraction: string
    categoryActivity: string
    categoryRestaurant: string
    categoryAccommodation: string
    categoryTips: string
    mustSelectCategory: string
    planningMode: string
    modeAround: string
    modeAroundDesc: string
    modeSingle: string
    modeSingleDesc: string
    specialRequirements: string
    accessibilityNeeds: string
    avoidStairs: string
    travelingWithPet: string
    wheelchairAccessible: string
    kidFriendly: string
    petFriendly: string
    parking: string
    outdoorSeating: string
      back: string
      next: string
      generating: string
      createTripPlan: string
      tripGeneratedSuccess: string
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
      title: 'VYHĽADÁVAČ MIEST',
      subtitle: 'Objavte <highlight1>najlepšie destinácie</highlight1> v Európe s <highlight2>inteligentným plánovačom</highlight2>. Získajte <highlight3>personalizované tipy</highlight3> na nezabudnuteľné zážitky.',
      backToMain: 'Späť na hlavnú stránku',
      backToNewTrip: 'Späť na vytvorenie nového výletu',
      cancelGeneration: 'Generovanie bolo zrušené',
      generationError: 'Nastala chyba pri generovaní',
      readingProgressError: 'Chyba pri čítaní progressu',
      generationStartedError: 'Chyba pri spustení generovania',
      intelligentSystem: 'Inteligentný Systém',
      instantResults: 'Okamžité Výsledky',
      cancel: 'Zrušiť',
      // Input Form
      step1Title: 'KROK 1 – MESTO & KATEGÓRIE',
      step2Title: 'KROK 2 – ŠPECIÁLNE POŽIADAVKY',
      destination: 'Destinácia',
      destinationPlaceholder: 'Zadajte mesto, región alebo konkrétne miesto (napr. Eiffel Tower, Paríž, Koloseum...)',
      destinationHint: 'Musíte vybrať konkrétne miesto zo zoznamu návrhov (autocomplete)',
      destinationHintLoading: 'Načítavam Google Maps API...',
      destinationApiWarning: '⚠ Ak sa autocomplete nenačíta, skontrolujte NEXT_PUBLIC_GOOGLE_API_KEY v .env',
      selectedPlace: '✓ Vybraté miesto:',
      whatToSearch: 'Čo chcete hľadať?',
      categoryAttraction: 'Pamiatky',
      categoryActivity: 'Aktivity',
      categoryRestaurant: 'Reštaurácie',
      categoryAccommodation: 'Ubytovanie',
      categoryTips: 'Tipy',
      mustSelectCategory: '⚠ Musíte vybrať aspoň jednu kategóriu',
      planningMode: 'Režim plánovania:',
      modeAround: 'Trip okolo miesta',
      modeAroundDesc: 'Nájdeme ďalšie miesta v okolí',
      modeSingle: 'Detail miesta',
      modeSingleDesc: 'Len informácie o tomto mieste',
      specialRequirements: 'Špeciálne požiadavky',
      accessibilityNeeds: 'Potrebujem bezbariérový prístup',
      avoidStairs: 'Nechcem veľa schodov / náročné túry',
      travelingWithPet: 'Cestujem so psom',
      wheelchairAccessible: 'Bezbariérový vstup (Google)',
      kidFriendly: 'Vhodné pre deti',
      petFriendly: 'Vhodné pre zvieratá',
      parking: 'Parkovanie k dispozícii',
      outdoorSeating: 'Vonkajšie sedenie',
      back: 'Späť',
      next: 'Ďalej',
      generating: 'Vyhľadávam miesta...',
      createTripPlan: 'Vyhľadať miesta',
      tripGeneratedSuccess: 'Miesta boli úspešne vyhľadané!',
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
      title: 'PLACE FINDER',
      subtitle: 'Discover <highlight1>best destinations</highlight1> in Europe with an <highlight2>intelligent planner</highlight2>. Get <highlight3>personalized tips</highlight3> for unforgettable experiences.',
      backToMain: 'Back to Main Page',
      backToNewTrip: 'Back to Create New Trip',
      cancelGeneration: 'Generation cancelled',
      generationError: 'An error occurred during generation',
      readingProgressError: 'Error reading progress',
      generationStartedError: 'Error starting generation',
      intelligentSystem: 'Intelligent System',
      instantResults: 'Instant Results',
      cancel: 'Cancel',
      // Input Form
      step1Title: 'STEP 1 – LOCATION & CATEGORIES',
      step2Title: 'STEP 2 – SPECIAL REQUIREMENTS',
      destination: 'Destination',
      destinationPlaceholder: 'Enter city, region or specific place (e.g. Eiffel Tower, Paris, Colosseum...)',
      destinationHint: 'You must select a specific place from the suggestions list (autocomplete)',
      destinationHintLoading: 'Loading Google Maps API...',
      destinationApiWarning: '⚠ If autocomplete doesn\'t load, check NEXT_PUBLIC_GOOGLE_API_KEY in .env',
      selectedPlace: '✓ Selected place:',
      whatToSearch: 'What do you want to search for?',
      categoryAttraction: 'Attractions',
      categoryActivity: 'Activities',
      categoryRestaurant: 'Restaurants',
      categoryAccommodation: 'Accommodation',
      categoryTips: 'Tips',
      mustSelectCategory: '⚠ You must select at least one category',
      planningMode: 'Planning mode:',
      modeAround: 'Trip around place',
      modeAroundDesc: 'We\'ll find more places nearby',
      modeSingle: 'Place details',
      modeSingleDesc: 'Only information about this place',
      specialRequirements: 'Special Requirements',
      accessibilityNeeds: 'I need wheelchair accessible access',
      avoidStairs: 'I don\'t want many stairs / difficult hikes',
      travelingWithPet: 'Traveling with a pet',
      wheelchairAccessible: 'Wheelchair accessible entrance (Google)',
      kidFriendly: 'Kid friendly',
      petFriendly: 'Pet friendly',
      parking: 'Parking available',
      outdoorSeating: 'Outdoor seating',
      back: 'Back',
      next: 'Next',
      generating: 'Searching for places...',
      createTripPlan: 'Search Places',
      tripGeneratedSuccess: 'Places found successfully!',
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
      title: 'STEDFINNER',
      subtitle: 'Oppdag de <highlight1>beste destinasjonene</highlight1> i Europa med en <highlight2>intelligent planlegger</highlight2>. Få <highlight3>personaliserte tips</highlight3> for uforglemmelige opplevelser.',
      backToMain: 'Tilbake til Hovedside',
      backToNewTrip: 'Tilbake til å opprette ny tur',
      cancelGeneration: 'Generering avbrutt',
      generationError: 'En feil oppstod under generering',
      readingProgressError: 'Feil ved lesing av fremgang',
      generationStartedError: 'Feil ved start av generering',
      intelligentSystem: 'Intelligent System',
      instantResults: 'Øyeblikkelige Resultater',
      cancel: 'Avbryt',
      // Input Form
      step1Title: 'STEG 1 – STED & KATEGORIER',
      step2Title: 'STEG 2 – SPESIELLE KRAV',
      destination: 'Destinasjon',
      destinationPlaceholder: 'Skriv inn by, region eller spesifikt sted (f.eks. Eiffeltårnet, Paris, Colosseum...)',
      destinationHint: 'Du må velge et spesifikt sted fra forslagslisten (autocomplete)',
      destinationHintLoading: 'Laster Google Maps API...',
      destinationApiWarning: '⚠ Hvis autocomplete ikke laster, sjekk NEXT_PUBLIC_GOOGLE_API_KEY i .env',
      selectedPlace: '✓ Valgt sted:',
      whatToSearch: 'Hva vil du søke etter?',
      categoryAttraction: 'Severdigheter',
      categoryActivity: 'Aktiviteter',
      categoryRestaurant: 'Restauranter',
      categoryAccommodation: 'Overnatting',
      categoryTips: 'Tips',
      mustSelectCategory: '⚠ Du må velge minst én kategori',
      planningMode: 'Planleggingsmodus:',
      modeAround: 'Tur rundt stedet',
      modeAroundDesc: 'Vi finner flere steder i nærheten',
      modeSingle: 'Stedsdetaljer',
      modeSingleDesc: 'Kun informasjon om dette stedet',
      specialRequirements: 'Spesielle Krav',
      accessibilityNeeds: 'Jeg trenger rullestoltilgjengelig tilgang',
      avoidStairs: 'Jeg vil ikke ha mange trapper / vanskelige turer',
      travelingWithPet: 'Reiser med kjæledyr',
      wheelchairAccessible: 'Rullestoltilgjengelig inngang (Google)',
      kidFriendly: 'Barnevennlig',
      petFriendly: 'Kjæledyrvennlig',
      parking: 'Parkering tilgjengelig',
      outdoorSeating: 'Utendørs sitteplasser',
      back: 'Tilbake',
      next: 'Neste',
      generating: 'Søker etter steder...',
      createTripPlan: 'Søk Steder',
      tripGeneratedSuccess: 'Steder funnet!',
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

