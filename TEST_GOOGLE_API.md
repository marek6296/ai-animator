# Test Google Custom Search API

Všetko je nastavené! Teraz môžete otestovať, či Google API funguje.

## ✅ Čo máte nastavené:

- ✅ Google API Key: `AIzaSyAtOYfCxBlUekpLn2nm2BElw6tXAgtZjpg`
- ✅ Google CSE ID: `f28fca8bd7d394bc4`
- ✅ Custom Search API: Povolené

## 🚀 Ďalšie kroky:

### 1. Reštartujte dev server

Ak máte bežiaci dev server, reštartujte ho:

```bash
# Zastavte server (Ctrl+C)
# Potom spustite znova:
npm run dev
```

### 2. Otestujte aplikáciu

1. Otvorte aplikáciu v prehliadači (zvyčajne http://localhost:3000)
2. Vygenerujte nový plán výletu (napr. Paríž)
3. Otvorte konzolu (F12 → Console)
4. Mali by ste vidieť:
   - `✓ Google found image for "..."` - ak sa obrázky našli
   - `Image query: "..."` - aké query sa používa

### 3. Pre Vercel (ak používate Vercel)

Nezabudnite pridať environment variables do Vercel:

1. Choďte do Vercel projektu
2. Settings → Environment Variables
3. Pridajte:
   - `GOOGLE_API_KEY` = `AIzaSyAtOYfCxBlUekpLn2nm2BElw6tXAgtZjpg`
   - `GOOGLE_CSE_ID` = `f28fca8bd7d394bc4`
4. Redeploy projekt

## 🧪 Rýchly test API

Môžete otestovať API priamo v termináli:

```bash
curl "https://www.googleapis.com/customsearch/v1?key=AIzaSyAtOYfCxBlUekpLn2nm2BElw6tXAgtZjpg&cx=f28fca8bd7d394bc4&q=Paris%20Eiffel%20Tower&searchType=image&num=1"
```

Ak to funguje, uvidíte JSON s výsledkami obrázkov.

## ✅ Čo očakávať:

- Obrázky by sa mali zobrazovať pri každom tipe
- Obrázky by mali byť relevantné k danému miestu
- V konzole by ste mali vidieť `✓ Google found image` pre každý tip

## ❌ Ak to nefunguje:

1. **Skontrolujte konzolu** - tam uvidíte chybové správy
2. **Skontrolujte .env súbor** - či sú premenné správne
3. **Skontrolujte, či je Image Search zapnutý** v Google CSE:
   - https://cse.google.com/cse/
   - Vyberte váš search engine
   - Setup → Advanced → Image search settings → Enable image search

