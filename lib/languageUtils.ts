/**
 * Utility funkcie pre prácu s jazykmi
 */

export type Language = 'sk' | 'en' | 'no'

/**
 * Vráti názov jazyka pre AI prompt
 */
export function getLanguageNameForAI(lang: Language): string {
  const names: Record<Language, string> = {
    sk: 'slovenčina',
    en: 'English',
    no: 'Norwegian Bokmål',
  }
  return names[lang]
}

/**
 * Vytvorí system prompt s vynúteným jazykom
 */
export function createSystemPromptWithLanguage(lang: Language): string {
  const languageName = getLanguageNameForAI(lang)
  return `Vždy odpovedaj výhradne v jazyku: ${languageName}.

Nikdy nemiešaj jazyky.

Používaj prirodzený štýl pre turistický popis.

Ak sú vstupné dáta v inom jazyku, automaticky ich prelož do ${languageName}.`
}

