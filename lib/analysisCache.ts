/**
 * Cache pre výsledky analýzy recenzií
 * Umožňuje konzistentné výsledky pre rovnaké miesto
 */

interface CachedAnalysis {
  place_id: string
  analysis: any
  normalizedReviews: any[]
  timestamp: number
  reviewsHash: string // Hash recenzií pre validáciu
}

// Jednoduchý in-memory cache (pre produkciu by sa mal použiť Redis alebo databáza)
const cache = new Map<string, CachedAnalysis>()

// Cache TTL: 24 hodín
const CACHE_TTL = 24 * 60 * 60 * 1000

/**
 * Vytvorí hash z recenzií pre validáciu cache
 */
function createReviewsHash(reviews: any[]): string {
  const reviewsData = reviews
    .map(r => `${r.rating}-${r.text?.substring(0, 50)}-${r.time}`)
    .join('|')
  // Jednoduchý hash (pre produkciu použiť crypto.createHash)
  return Buffer.from(reviewsData).toString('base64').substring(0, 32)
}

/**
 * Získa cacheovanú analýzu pre miesto
 */
export function getCachedAnalysis(place_id: string, reviews: any[]): any | null {
  const cached = cache.get(place_id)
  if (!cached) return null

  // Skontroluj, či cache nie je expirovaný
  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(place_id)
    return null
  }

  // Skontroluj, či recenzie sa nezmenili
  const currentHash = createReviewsHash(reviews)
  if (cached.reviewsHash !== currentHash) {
    cache.delete(place_id)
    return null
  }

  return cached.analysis
}

/**
 * Uloží analýzu do cache
 */
export function setCachedAnalysis(
  place_id: string,
  reviews: any[],
  analysis: any,
  normalizedReviews: any[]
): void {
  const reviewsHash = createReviewsHash(reviews)
  cache.set(place_id, {
    place_id,
    analysis,
    normalizedReviews,
    timestamp: Date.now(),
    reviewsHash,
  })

  // Vyčisti staré cache položky (ak je cache príliš veľký)
  if (cache.size > 100) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    // Odstráň najstaršie 20 položiek
    entries.slice(0, 20).forEach(([key]) => cache.delete(key))
  }
}

/**
 * Vymaže cache pre miesto
 */
export function clearCache(place_id: string): void {
  cache.delete(place_id)
}

