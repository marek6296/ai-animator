# Podrobný návod: Ako povoliť Google Maps API a Geocoding API

## Krok 1: Otvorte Google Cloud Console

1. Choďte na: **https://console.cloud.google.com/**
2. **Prihláste sa** s vaším Google účtom (rovnakým, ktorý používate pre Custom Search API)

## Krok 2: Vyberte projekt

1. V **hornej časti stránky** (modrý pruh) uvidíte dropdown s názvom projektu
2. Kliknite na **dropdown** (môže tam byť napísané názov existujúceho projektu)
3. **Vyberte projekt**, ktorý používate pre Custom Search API (rovnaký projekt)

## Krok 3: Povoľte Maps JavaScript API

**Metóda A - Presná cesta:**
1. V **ľavom bočnom menu** (hamburger menu ☰ v ľavom hornom rohu) kliknite na **"APIs & Services"**
2. V podmenu kliknite na **"Library"** (alebo "Knižnica")
3. Do **vyhľadávacieho poľa** (Search for APIs and services) zadajte: `Maps JavaScript API`
4. Kliknite na **"Maps JavaScript API"** v výsledkoch
5. Kliknite na modré tlačidlo **"ENABLE"** (alebo "POVOLIŤ")

**Metóda B - Priamy odkaz:**
1. Choďte priamo na: **https://console.cloud.google.com/apis/library/maps-javascript-api.googleapis.com**
2. (Ak sa zobrazí výzva na výber projektu, vyberte váš projekt)
3. Kliknite na modré tlačidlo **"ENABLE"** (alebo "POVOLIŤ")

**Metóda C - Cez vyhľadávanie:**
1. V **hornej lište vyhľadávania** (Search bar) zadajte: `Maps JavaScript API`
2. Kliknite na **"Maps JavaScript API"** v výsledkoch
3. Kliknite na modré tlačidlo **"ENABLE"**

## Krok 4: Povoľte Geocoding API

**Presne rovnaký postup ako v Kroku 3, len s iným názvom:**

**Metóda A - Presná cesta:**
1. V **ľavom bočnom menu** kliknite na **"APIs & Services"** → **"Library"**
2. Do **vyhľadávacieho poľa** zadajte: `Geocoding API`
3. Kliknite na **"Geocoding API"** v výsledkoch
4. Kliknite na modré tlačidlo **"ENABLE"**

**Metóda B - Priamy odkaz:**
1. Choďte priamo na: **https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com**
2. (Ak sa zobrazí výzva na výber projektu, vyberte váš projekt)
3. Kliknite na modré tlačidlo **"ENABLE"**

## Krok 5: Overenie

Po povolení oboch API by ste mali vidieť:
- ✅ **Maps JavaScript API** - "API enabled" (alebo "API povolené")
- ✅ **Geocoding API** - "API enabled" (alebo "API povolené")

Môžete to skontrolovať:
1. Choďte na **"APIs & Services"** → **"Enabled APIs"** (alebo "Povolené API")
2. Mali by ste vidieť oba API v zozname

## 📸 Vizuálny pomocník

**Čo hľadať:**
- **Ľavý bočný panel** - "APIs & Services" → "Library"
- **Vyhľadávacie pole** - v hornej časti stránky "Library"
- **Tlačidlo "ENABLE"** - modré tlačidlo na stránke API

**Ako vyzerá stránka API:**
- Názov API (napr. "Maps JavaScript API")
- Popis API
- Modré tlačidlo "ENABLE" (alebo "POVOLIŤ")
- Po povolení sa zmení na "API enabled" (alebo "API povolené")

## ❓ Časté problémy

**"Nevidím ľavé menu"**
- Kliknite na hamburger menu ☰ v ľavom hornom rohu
- Alebo použite priame odkazy vyššie

**"Neviem, ktorý projekt vybrať"**
- Vyberte projekt, ktorý používate pre Custom Search API
- Alebo vytvorte nový projekt (ak nemáte žiadny)

**"Tlačidlo ENABLE nie je viditeľné"**
- Skontrolujte, či ste prihlásení
- Skontrolujte, či máte oprávnenia v projekte
- Skúste obnoviť stránku (F5)

**"API už je povolené"**
- To je v poriadku! Môžete pokračovať na ďalší krok

## ✅ Ďalšie kroky

Po povolení oboch API:
1. Pridajte `NEXT_PUBLIC_GOOGLE_API_KEY` do `.env` súboru
2. Reštartujte dev server
3. Skúste vygenerovať nový plán výletu

Podrobné inštrukcie sú v `GOOGLE_MAPS_SETUP.md`.


