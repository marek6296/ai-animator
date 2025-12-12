'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Lightbulb, Languages, BarChart3 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ReviewAnalysisResult, NormalizedReview } from '@/types'

interface ReviewAnalysisDisplayProps {
  result: ReviewAnalysisResult
}

interface TranslatedReview extends NormalizedReview {
  translatedText?: string
  isTranslating?: boolean
}

export default function ReviewAnalysisDisplay({ result }: ReviewAnalysisDisplayProps) {
  const { t, selectedLanguage } = useLanguage()
  const { placeName, formattedAddress, rating, userRatingsTotal, analysis, normalizedReviews } = result
  const [translatedReviews, setTranslatedReviews] = useState<TranslatedReview[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  // Mapovanie jazykových kódov (sk, en, no -> sk, en, no)
  const languageMap: Record<string, string> = {
    'sk': 'sk',
    'en': 'en',
    'no': 'no',
    'slovak': 'sk',
    'slovenčina': 'sk',
    'english': 'en',
    'norwegian': 'no',
    'norsk': 'no',
  }

  // Prelož recenzie, ak nie sú v zvolenom jazyku
  useEffect(() => {
    const translateReviews = async () => {
      // Skontroluj, či sú všetky recenzie už v zvolenom jazyku
      const targetLang = selectedLanguage
      const allInTargetLanguage = normalizedReviews.every(review => {
        const reviewLang = languageMap[review.language.toLowerCase()] || review.language.toLowerCase()
        return reviewLang === targetLang
      })

      if (allInTargetLanguage) {
        // Všetky recenzie sú už v zvolenom jazyku
        setTranslatedReviews(normalizedReviews.map(r => ({ ...r, translatedText: r.text })))
        return
      }

      setIsTranslating(true)
      try {
        const response = await fetch('/api/translate-reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviews: normalizedReviews.map(r => ({
              text: r.text,
              language: r.language,
            })),
            targetLanguage: selectedLanguage,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const translated = normalizedReviews.map((review, index) => {
            const translatedData = data.translatedReviews[index]
            return {
              ...review,
              translatedText: translatedData?.translatedText || review.text,
            }
          })
          setTranslatedReviews(translated)
        } else {
          // V prípade chyby použij pôvodné recenzie
          setTranslatedReviews(normalizedReviews.map(r => ({ ...r, translatedText: r.text })))
        }
      } catch (error) {
        console.error('Error translating reviews:', error)
        // V prípade chyby použij pôvodné recenzie
        setTranslatedReviews(normalizedReviews.map(r => ({ ...r, translatedText: r.text })))
      } finally {
        setIsTranslating(false)
      }
    }

    translateReviews()
  }, [normalizedReviews, selectedLanguage])

  // Použi preložené recenzie, ak sú dostupné, inak pôvodné
  const reviewsToDisplay = translatedReviews.length > 0 ? translatedReviews : normalizedReviews

  // Google Places API vracia len obmedzený počet recenzií (zvyčajne 5)
  const hasMoreReviews = userRatingsTotal && userRatingsTotal > normalizedReviews.length

  // Filtruj recenzie podľa sentimentu (rating)
  const positiveReviews = reviewsToDisplay.filter(r => r.rating >= 4)
  const neutralReviews = reviewsToDisplay.filter(r => r.rating === 3)
  const negativeReviews = reviewsToDisplay.filter(r => r.rating <= 2)

  const getTrendIcon = () => {
    if (!analysis.recentTrends) return <Minus className="w-5 h-5" />
    switch (analysis.recentTrends.trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-400" />
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-400" />
      default:
        return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    if (!analysis.recentTrends) return 'text-gray-400'
    switch (analysis.recentTrends.trend) {
      case 'improving':
        return 'text-green-400'
      case 'declining':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Place Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 border border-purple-500/30"
      >
        <h2 className="text-3xl font-bold text-purple-400 mb-2">{placeName}</h2>
        {formattedAddress && (
          <p className="text-gray-400 mb-4">{formattedAddress}</p>
        )}
        <div className="flex items-center gap-6">
          {rating && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xl font-bold text-white">{rating.toFixed(1)}</span>
            </div>
          )}
          {userRatingsTotal && (
            <span className="text-gray-400">
              ({userRatingsTotal} {t.reviewAnalysis.totalReviews}, {normalizedReviews.length} {t.reviewAnalysis.availableFromApi})
              {hasMoreReviews && (
                <span className="text-yellow-400 text-sm ml-2 block mt-1">
                  ⚠ {t.reviewAnalysis.apiLimitWarning}
                </span>
              )}
            </span>
          )}
        </div>
      </motion.div>

      {/* Overall Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-6"
      >
        <div className="glass rounded-xl p-6 border border-purple-500/20">
          <div className="text-sm text-gray-400 mb-2">{t.reviewAnalysis.overallRating}</div>
          <div className="text-3xl font-bold text-purple-400">{analysis.overallRating.toFixed(1)}</div>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(analysis.overallRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">{analysis.totalReviews} {t.reviewAnalysis.reviews}</div>
        </div>

        <div className="glass rounded-xl p-6 border border-green-500/30">
          <div className="text-sm text-gray-400 mb-2">{t.reviewAnalysis.positive}</div>
          <div className="text-3xl font-bold text-green-400">{analysis.sentimentBreakdown.positive}%</div>
          <div className="text-xs text-gray-500 mt-2">
            {Math.round((analysis.sentimentBreakdown.positive / 100) * analysis.totalReviews)} {t.reviewAnalysis.reviews}
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-2">{t.reviewAnalysis.neutral}</div>
          <div className="text-3xl font-bold text-yellow-400">{analysis.sentimentBreakdown.neutral}%</div>
          <div className="text-xs text-gray-500 mt-2">
            {Math.round((analysis.sentimentBreakdown.neutral / 100) * analysis.totalReviews)} {t.reviewAnalysis.reviews}
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-red-500/30">
          <div className="text-sm text-gray-400 mb-2">{t.reviewAnalysis.negative}</div>
          <div className="text-3xl font-bold text-red-400">{analysis.sentimentBreakdown.negative}%</div>
          <div className="text-xs text-gray-500 mt-2">
            {Math.round((analysis.sentimentBreakdown.negative / 100) * analysis.totalReviews)} {t.reviewAnalysis.reviews}
          </div>
        </div>
      </motion.div>

      {/* Key Themes */}
      {analysis.keyThemes && analysis.keyThemes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-8 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            {t.reviewAnalysis.keyThemes}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.keyThemes.map((theme, index) => (
              <div
                key={index}
                className="p-4 glass border border-purple-500/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{theme.theme}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    theme.sentiment === 'positive'
                      ? 'bg-green-500/20 text-green-400'
                      : theme.sentiment === 'negative'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {theme.frequency}%
                  </span>
                </div>
                {theme.exampleQuotes && theme.exampleQuotes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {theme.exampleQuotes.slice(0, 2).map((quote, qIndex) => (
                      <p key={qIndex} className="text-sm text-gray-400 italic">
                        "{quote}"
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {analysis.strengths && analysis.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8 border border-green-500/30"
          >
            <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              {t.reviewAnalysis.strengths}
            </h3>
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8 border border-red-500/30"
          >
            <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              {t.reviewAnalysis.weaknesses}
            </h3>
            <ul className="space-y-3">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-8 border border-cyan-500/30"
        >
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            {t.reviewAnalysis.recommendations}
          </h3>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-8 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-purple-400 mb-6">{t.reviewAnalysis.ratingDistribution}</h3>
        <div className="space-y-3">
          {(['5', '4', '3', '2', '1'] as const).map((rating) => {
            const count = analysis.ratingDistribution[rating] || 0
            const percentage = analysis.totalReviews > 0
              ? (count / analysis.totalReviews) * 100
              : 0
            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-16">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{rating}</span>
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm w-20 text-right">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Language Distribution */}
      {Object.keys(analysis.languageDistribution).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-8 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <Languages className="w-6 h-6" />
            {t.reviewAnalysis.languageDistribution}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analysis.languageDistribution)
              .sort(([, a], [, b]) => b - a) // Zoraď podľa percenta (najvyššie prvé)
              .map(([lang, percentage]) => {
                // percentage je už percento (0-100), nie počet
                const count = Math.round((percentage / 100) * analysis.totalReviews)
                return (
                  <div key={lang} className="text-center p-4 glass border border-purple-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{percentage}%</div>
                    <div className="text-sm text-gray-400 mt-1">{lang.toUpperCase()}</div>
                    <div className="text-xs text-gray-500 mt-1">{count} {t.reviewAnalysis.reviews}</div>
                  </div>
                )
              })}
          </div>
        </motion.div>
      )}

      {/* Sentiment Reviews - Pozitívne, Neutrálne, Negatívne */}
      {normalizedReviews && normalizedReviews.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pozitívne recenzie */}
          {positiveReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6 border border-green-500/30"
            >
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t.reviewAnalysis.positiveReviews} ({positiveReviews.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {positiveReviews.map((review, index) => (
                  <div key={index} className="p-3 glass border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      {review.author_name && (
                        <span className="text-xs text-gray-400 ml-2">{review.author_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {(review as TranslatedReview).translatedText || review.text}
                    </p>
                    {review.relative_time_description && (
                      <p className="text-xs text-gray-500 mt-1">{review.relative_time_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Neutrálne recenzie */}
          {neutralReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-2xl p-6 border border-yellow-500/30"
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Minus className="w-5 h-5" />
                {t.reviewAnalysis.neutralReviews} ({neutralReviews.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {neutralReviews.map((review, index) => (
                  <div key={index} className="p-3 glass border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      {review.author_name && (
                        <span className="text-xs text-gray-400 ml-2">{review.author_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {(review as TranslatedReview).translatedText || review.text}
                    </p>
                    {review.relative_time_description && (
                      <p className="text-xs text-gray-500 mt-1">{review.relative_time_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Negatívne recenzie */}
          {negativeReviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-2xl p-6 border border-red-500/30"
            >
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t.reviewAnalysis.negativeReviews} ({negativeReviews.length})
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {negativeReviews.map((review, index) => (
                  <div key={index} className="p-3 glass border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      {review.author_name && (
                        <span className="text-xs text-gray-400 ml-2">{review.author_name}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {(review as TranslatedReview).translatedText || review.text}
                    </p>
                    {review.relative_time_description && (
                      <p className="text-xs text-gray-500 mt-1">{review.relative_time_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Trends */}
      {analysis.recentTrends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="glass rounded-2xl p-8 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            {getTrendIcon()}
            <span className={getTrendColor()}>{t.reviewAnalysis.recentTrends}</span>
          </h3>
          <p className="text-gray-300">{analysis.recentTrends.description}</p>
        </motion.div>
      )}
    </div>
  )
}

