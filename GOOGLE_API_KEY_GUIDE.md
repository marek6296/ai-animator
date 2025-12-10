# Presný návod: Ako nájsť a vytvoriť Google API Key

## Krok 1: Otvorte Google Cloud Console

1. Choďte na: https://console.cloud.google.com/
2. **Prihláste sa** s vaším Google účtom

## Krok 2: Vytvorte alebo vyberte projekt

1. V **hornej časti stránky** (modrý pruh) uvidíte dropdown s názvom projektu
2. Kliknite na **dropdown** (môže tam byť napísané "Select a project" alebo názov existujúceho projektu)
3. Kliknite na **"NEW PROJECT"** (alebo vyberte existujúci projekt)
4. Zadajte názov projektu (napr. "Trip Planner")
5. Kliknite **"CREATE"**

## Krok 3: Nájdite "Credentials" (API Keys)

**Metóda A - Presná cesta:**
1. V **ľavom bočnom menu** (hamburger menu ☰ v ľavom hornom rohu) kliknite na **"APIs & Services"**
2. V podmenu, ktoré sa zobrazí, kliknite na **"Credentials"**

**Metóda B - Ak nevidíte menu:**
1. V **hornej lište vyhľadávania** (Search bar) zadajte: `credentials`
2. Kliknite na **"Credentials"** v výsledkoch

**Metóda C - Priamy odkaz:**
1. Choďte priamo na: https://console.cloud.google.com/apis/credentials
2. (Ak sa zobrazí výzva na výber projektu, vyberte váš projekt)

## Krok 4: Vytvorte API Key

1. Na stránke "Credentials" kliknite na tlačidlo **"+ CREATE CREDENTIALS"** (modré tlačidlo v hornej časti)
2. V dropdown menu vyberte **"API key"**
3. Zobrazí sa popup s vaším novým API key (začína `AIzaSy...`)
4. **SKOPÍRUJTE** tento API key (celý text)
5. Kliknite **"CLOSE"** (zatvoríte popup)

## Krok 5: (Odporúčané) Obmedzte API Key

1. V zozname "API keys" nájdite váš novovytvorený key
2. Kliknite na **názov key** (alebo na ikonu ceruzky ✏️)
3. V sekcii **"API restrictions"**:
   - Vyberte **"Restrict key"**
   - V dropdown "Select APIs" vyberte **"Custom Search API"**
4. Kliknite **"SAVE"**

## Krok 6: Povoľte Custom Search API

1. V **ľavom menu** kliknite na **"APIs & Services"** → **"Library"**
2. Do vyhľadávacieho poľa zadajte: `Custom Search API`
3. Kliknite na **"Custom Search API"**
4. Kliknite na modré tlačidlo **"ENABLE"**

## Krok 7: Pridajte do projektu

Pridajte do `.env` súboru:

```env
GOOGLE_API_KEY=AIzaSy...váš_skutočný_api_key
GOOGLE_CSE_ID=f28fca8bd7d394bc4
```

## 📸 Vizuálny pomocník

Ak stále neviete nájsť, pozrite sa na:
- **Ľavý bočný panel** - tam by malo byť "APIs & Services"
- **Horná lišta** - vyhľadávacie pole (môžete zadať "credentials")
- **Priamy odkaz**: https://console.cloud.google.com/apis/credentials

## ❓ Časté problémy

**"Nemám žiadny projekt"**
- Vytvorte nový projekt (Krok 2)

**"Nevidím ľavé menu"**
- Kliknite na hamburger menu ☰ v ľavom hornom rohu

**"API key sa nezobrazuje"**
- Skontrolujte, či ste klikli na "API key" v dropdown menu
- Skontrolujte, či máte povolený JavaScript v prehliadači

**"Nemôžem vytvoriť API key"**
- Skontrolujte, či máte vybraný projekt
- Skontrolujte, či máte oprávnenia v Google Cloud Console

