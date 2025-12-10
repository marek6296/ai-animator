# Ako povoliť Custom Search API - Presný návod

## Metóda 1: Priamy odkaz (najrýchlejšie)

1. **Otvorte tento odkaz v prehliadači:**
   ```
   https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   ```

2. **Ak sa zobrazí výzva na výber projektu:**
   - Vyberte váš projekt (alebo vytvorte nový)
   - Kliknite "SELECT"

3. **Na stránke Custom Search API:**
   - Kliknite na modré tlačidlo **"ENABLE"** (alebo "POVOLIŤ" v slovenčine)
   - Počkajte, kým sa API povolí (zobrazí sa "API enabled")

## Metóda 2: Cez menu (ak priamy odkaz nefunguje)

1. **Otvorte Google Cloud Console:**
   - Choďte na: https://console.cloud.google.com/
   - Prihláste sa a vyberte projekt

2. **Nájdite "APIs & Services":**
   - V **ľavom bočnom menu** (☰ hamburger menu) kliknite na **"APIs & Services"**
   - V podmenu kliknite na **"Library"** (alebo "Knižnica")

3. **Vyhľadajte Custom Search API:**
   - V **vyhľadávacom poli** (Search for APIs) zadajte: `Custom Search`
   - Alebo zadajte: `customsearch`
   - Kliknite na **"Custom Search API"** v výsledkoch

4. **Povoľte API:**
   - Kliknite na modré tlačidlo **"ENABLE"** (alebo "POVOLIŤ")

## Metóda 3: Cez vyhľadávanie

1. **V Google Cloud Console:**
   - V **hornej lište vyhľadávania** (Search bar) zadajte: `custom search api`
   - Kliknite na **"Custom Search API"** v výsledkoch
   - Kliknite **"ENABLE"**

## Overenie, že je API povolené

Po povolení by ste mali vidieť:
- ✅ Zelenú značku alebo "API enabled"
- ✅ Tlačidlo sa zmení z "ENABLE" na "MANAGE" alebo "SPRAVOVAŤ"

## Časté problémy

**"Nemám žiadny projekt"**
- Vytvorte nový projekt:
  - Kliknite na dropdown s názvom projektu (hore)
  - "NEW PROJECT"
  - Zadajte názov a "CREATE"

**"Nevidím ľavé menu"**
- Kliknite na hamburger menu ☰ v ľavom hornom rohu

**"API sa nezobrazuje"**
- Skontrolujte, či ste prihlásení
- Skontrolujte, či máte vybraný správny projekt
- Skúste obnoviť stránku (F5)

**"ENABLE tlačidlo nie je aktívne"**
- Skontrolujte, či máte oprávnenia v projekte
- Skontrolujte, či nie je API už povolené (možno je tam "MANAGE" namiesto "ENABLE")

## Alternatíva: Test bez povolenia API

Ak sa vám nepodarí povoliť API, aplikácia stále bude fungovať, len použije:
- Pexels API (200 req/hod bez API key)
- Unsplash API (ak máte API key)
- Unsplash Source (fallback)

Ale Google Obrázky nebudú fungovať bez povoleného Custom Search API.

