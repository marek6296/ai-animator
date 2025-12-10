# Nastavenie Google Obrázkov pre Trip Planner

Aby aplikácia mohla používať obrázky z Google Obrázkov, musíte nastaviť Google Custom Search API.

## ✅ Krok 1: Máte už Search Engine ID

Váš Search Engine ID: `f28fca8bd7d394bc4`

## 🔑 Krok 2: Získajte Google API Key

1. Choďte na https://console.cloud.google.com/
2. **Vytvorte nový projekt** (alebo vyberte existujúci):
   - Kliknite na dropdown s názvom projektu v hornej časti
   - Kliknite na "New Project"
   - Zadajte názov (napr. "Trip Planner")
   - Kliknite "Create"

3. **Povoľte Custom Search API**:
   - Choďte na "APIs & Services" → "Library"
   - Vyhľadajte "Custom Search API"
   - Kliknite na "Custom Search API"
   - Kliknite "Enable"

4. **Vytvorte API Key**:
   - Choďte na "APIs & Services" → "Credentials"
   - Kliknite na "Create Credentials" → "API Key"
   - Skopírujte API key (bude vyzeráť ako: `AIzaSy...`)

5. **(Odporúčané) Obmedzte API key**:
   - Kliknite na vytvorený API key
   - V "API restrictions" vyberte "Restrict key"
   - Vyberte "Custom Search API"
   - Kliknite "Save"

## 📝 Krok 3: Pridajte do projektu

Vytvorte alebo upravte `.env` súbor v root adresári projektu:

```env
GOOGLE_API_KEY=AIzaSy...váš_api_key
GOOGLE_CSE_ID=f28fca8bd7d394bc4
```

**Dôležité:** 
- Nahraďte `AIzaSy...váš_api_key` skutočným API key
- `GOOGLE_CSE_ID` už máte správne nastavené

## 🚀 Krok 4: Pre Vercel (ak používate Vercel)

1. Choďte do Vercel projektu
2. Settings → Environment Variables
3. Pridajte:
   - `GOOGLE_API_KEY` = váš API key (napr. `AIzaSy...`)
   - `GOOGLE_CSE_ID` = `f28fca8bd7d394bc4`
4. **Redeploy projekt** (Settings → Deployments → Redeploy)

## ✅ Krok 5: Overenie

Po nastavení skúste vygenerovať nový plán výletu. V konzole (F12 → Console) by ste mali vidieť:
- `✓ Google found image for "..."` - ak sa obrázky našli cez Google
- `✓ Pexels found image for "..."` - ak sa použil fallback na Pexels

## 📊 Limity

- **Bezplatný limit**: 100 requestov/deň
- **Platený limit**: $5 za 1000 requestov (prvých 100 je bezplatných každý deň)

## 🔄 Alternatíva bez Google API

Ak nechcete používať Google API, aplikácia automaticky použije:
1. Pexels API (200 req/hod bez API key)
2. Unsplash API (ak máte API key)
3. Unsplash Source (fallback)

## ❌ Riešenie problémov

**Chyba: "API key not valid"**
- Skontrolujte, či je API key správne nastavený v `.env`
- Skontrolujte, či je Custom Search API povolený v Google Cloud Console
- Skontrolujte, či API key nie je obmedzený na iný projekt

**Chyba: "Daily limit exceeded"**
- Bezplatný limit je 100 requestov/deň
- Počkajte do ďalšieho dňa alebo použite platený plán

**Obrázky sa nezobrazujú**
- Skontrolujte konzolu pre chyby (F12 → Console)
- Skontrolujte, či sú environment variables správne nastavené
- Skontrolujte, či je Image search zapnutý v Custom Search Engine:
  - Choďte na https://cse.google.com/cse/
  - Vyberte váš search engine
  - Setup → Advanced → Image search settings → Enable image search

**"Search engine ID not found"**
- Skontrolujte, či je Search Engine ID správne: `f28fca8bd7d394bc4`
- Skontrolujte, či je search engine aktívny v Google CSE

## 🎯 Rýchle overenie

Po nastavení môžete otestovať API priamo v termináli:

```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=f28fca8bd7d394bc4&q=Paris%20Eiffel%20Tower&searchType=image&num=1"
```

Nahraďte `YOUR_API_KEY` vaším skutočným API key. Ak to funguje, uvidíte JSON s výsledkami.
