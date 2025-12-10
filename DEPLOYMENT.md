# Deployment Guide - GitHub & Vercel 🚀

## Krok 1: Vytvorenie GitHub repozitára

### 1.1 Vytvorte nový repozitár na GitHub

1. Choďte na https://github.com/new
2. Vyplňte:
   - **Repository name**: `ai-animator` (alebo akýkoľvek názov chcete)
   - **Description**: "AI aplikácia pre vytváranie personalizovaných komiksov, animácií a meme packov"
   - **Visibility**: Public alebo Private (podľa preferencie)
   - **NEPRIDÁVAJTE** README, .gitignore alebo licenciu (už máme)
3. Kliknite na "Create repository"

### 1.2 Nahrajte kód na GitHub

Po vytvorení repozitára, GitHub vám ukáže inštrukcie. Spustite tieto príkazy v termináli:

```bash
cd "/Users/marek/AI animator"

# Pridajte remote repozitár (nahraďte YOUR_USERNAME a REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Zmeňte názov branch na main (ak ešte nie je)
git branch -M main

# Nahrajte kód
git push -u origin main
```

**Poznámka:** Nahraďte `YOUR_USERNAME` vaším GitHub používateľským menom a `REPO_NAME` názvom vášho repozitára.

---

## Krok 2: Nasadenie na Vercel

### 2.1 Vytvorenie Vercel účtu a projektu

1. Choďte na https://vercel.com
2. Prihláste sa pomocou GitHub účtu (najjednoduchšie)
3. Kliknite na "Add New..." → "Project"
4. Importujte váš GitHub repozitár:
   - Vyberte repozitár `ai-animator` (alebo váš názov)
   - Kliknite na "Import"

### 2.2 Konfigurácia projektu na Vercel

Vercel automaticky detekuje Next.js projekt. Nastavte:

1. **Framework Preset**: Next.js (mal by byť automaticky)
2. **Root Directory**: `./` (štandardne)
3. **Build Command**: `npm run build` (štandardne)
4. **Output Directory**: `.next` (štandardne)

### 2.3 Nastavenie Environment Variables

**DÔLEŽITÉ:** Musíte pridať OpenAI API kľúč!

1. V sekcii "Environment Variables" kliknite na "Add"
2. Pridajte:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-VAS-OPENAI-API-KEY` (použite váš skutočný API kľúč)
   - **Environment**: Vyberte všetky (Production, Preview, Development)
3. Kliknite na "Save"

### 2.4 Deployment

1. Kliknite na "Deploy"
2. Počkajte na dokončenie buildu (2-3 minúty)
3. Váš web bude dostupný na URL typu: `https://ai-animator-xxxxx.vercel.app`

---

## Krok 3: Automatické updaty

### 3.1 Ako to funguje

Vercel automaticky:
- ✅ Detekuje push na GitHub
- ✅ Spustí nový build
- ✅ Nasadí novú verziu

**Takže keď urobíte zmeny:**

```bash
# 1. Urobte zmeny v kóde
# 2. Commitnite zmeny
git add .
git commit -m "Popis zmien"

# 3. Pushnite na GitHub
git push origin main

# 4. Vercel automaticky nasadí novú verziu!
```

### 3.2 Vlastná doména (voliteľné)

Ak chcete vlastnú doménu:

1. V Vercel projekte choďte na "Settings" → "Domains"
2. Pridajte svoju doménu
3. Postupujte podľa inštrukcií pre DNS nastavenie

---

## Krok 4: Monitoring a logy

### 4.1 Zobrazenie logov

- V Vercel dashboarde → "Deployments" → vyberte deployment → "Functions" → "View Function Logs"

### 4.2 Analytics

- Vercel poskytuje základné analytics v "Analytics" sekcii

---

## Riešenie problémov

### Build zlyhá

1. Skontrolujte logy v Vercel
2. Skontrolujte, či sú všetky environment variables nastavené
3. Skontrolujte, či `package.json` má všetky závislosti

### API nefunguje

1. Skontrolujte, či je `OPENAI_API_KEY` nastavený v Environment Variables
2. Skontrolujte, či máte dostatočný kredit na OpenAI účte
3. Skontrolujte logy v Vercel Functions

### Obrázky sa nenačítavajú

1. Skontrolujte `next.config.js` - mali by byť správne nastavené `remotePatterns`
2. Skontrolujte, či OpenAI API vracia platné URL

---

## Bezpečnostné poznámky

✅ **DOBRE:**
- `.env` je v `.gitignore` - API kľúč nebude v GitHub repozitári
- API kľúč je nastavený len v Vercel Environment Variables

❌ **NIKDY:**
- Nenahrávajte `.env` súbor do GitHub
- Nezdieľajte API kľúč verejne
- Necommitnite API kľúč v kóde

---

## Užitočné odkazy

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions) (pre pokročilejšiu automatizáciu)

