# Nastavenie Google Maps pre Trip Planner

Aby aplikácia mohla zobrazovať mapu s miestami, musíte nastaviť Google Maps JavaScript API.

## ✅ Krok 1: Povoľte Google Maps JavaScript API

1. Choďte na https://console.cloud.google.com/
2. Vyberte váš projekt (rovnaký ako pre Custom Search API)
3. Choďte na "APIs & Services" → "Library"
4. Vyhľadajte "Maps JavaScript API"
5. Kliknite na "Maps JavaScript API"
6. Kliknite "Enable"

## ✅ Krok 2: Povoľte Geocoding API

1. V "APIs & Services" → "Library"
2. Vyhľadajte "Geocoding API"
3. Kliknite na "Geocoding API"
4. Kliknite "Enable"

## 🔑 Krok 3: Použite existujúci API Key

Môžete použiť rovnaký `GOOGLE_API_KEY` ako pre Custom Search API, ale musíte ho pridať aj ako `NEXT_PUBLIC_GOOGLE_API_KEY` pre klienta.

**Dôležité:** `NEXT_PUBLIC_` prefix je potrebný, aby bol API key dostupný v prehliadači (klientovi).

## 📝 Krok 4: Pridajte do projektu

Vytvorte alebo upravte `.env` súbor v root adresári projektu:

```env
# Existujúce premenné
GOOGLE_API_KEY=AIzaSy...váš_api_key
GOOGLE_CSE_ID=f28fca8bd7d394bc4

# Nová premenná pre Google Maps (musí byť rovnaká ako GOOGLE_API_KEY)
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSy...váš_api_key
```

**Dôležité:** 
- `NEXT_PUBLIC_GOOGLE_API_KEY` musí byť rovnaký ako `GOOGLE_API_KEY`
- `NEXT_PUBLIC_` prefix je potrebný pre Next.js, aby bol dostupný v prehliadači

## 🚀 Krok 5: Pre Vercel (ak používate Vercel)

1. Choďte do Vercel projektu
2. Settings → Environment Variables
3. Pridajte:
   - `NEXT_PUBLIC_GOOGLE_API_KEY` = váš API key (rovnaký ako `GOOGLE_API_KEY`)
4. **Redeploy projekt** (Settings → Deployments → Redeploy)

## ✅ Krok 6: Obmedzte API Key (Odporúčané)

1. Choďte na "APIs & Services" → "Credentials"
2. Kliknite na váš API key
3. V "API restrictions" vyberte "Restrict key"
4. Vyberte tieto API:
   - Custom Search API
   - Maps JavaScript API
   - Geocoding API
5. Kliknite "Save"

## 🧪 Krok 7: Overenie

Po nastavení skúste vygenerovať nový plán výletu. Mala by sa zobraziť:
- Interaktívna mapa s markermi pre každé miesto
- Rôzne farby markerov podľa kategórie (pamiatky, aktivity, reštaurácie, atď.)
- Kliknutie na marker zobrazí info window s názvom a popisom

## 📊 Limity

- **Maps JavaScript API**: 
  - Bezplatný limit: $200 kreditov/mesiac (približne 28,000 načítaní mapy)
  - Každé načítanie mapy stojí ~$0.007
- **Geocoding API**:
  - Bezplatný limit: $200 kreditov/mesiac (približne 40,000 geocoding requestov)
  - Každý geocoding request stojí ~$0.005

## ❌ Časté problémy

**"Google Maps API key nie je nastavený"**
- Skontrolujte, či máte `NEXT_PUBLIC_GOOGLE_API_KEY` v `.env` súbore
- Skontrolujte, či je premenná správne nastavená vo Vercel (ak používate Vercel)
- Reštartujte dev server po pridaní do `.env`

**"Nepodarilo sa načítať Google Maps"**
- Skontrolujte, či je Maps JavaScript API povolené v Google Cloud Console
- Skontrolujte, či API key má povolený prístup k Maps JavaScript API
- Skontrolujte konzolu prehliadača (F12) pre chybové správy

**"Žiadne miesta nemajú súradnice"**
- Skontrolujte, či je Geocoding API povolené
- Skontrolujte, či API key má povolený prístup k Geocoding API
- Skontrolujte konzolu servera pre chybové správy

## 💡 Tipy

- Mapa automaticky nastaví zoom, aby zobrazila všetky markery
- Markery majú rôzne farby podľa kategórie miesta
- Kliknutie na marker zobrazí detailné informácie
- Mapa má tmavý štýl, ktorý sa hodí k futuristickému dizajnu aplikácie


