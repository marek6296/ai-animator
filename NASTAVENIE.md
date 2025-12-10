# 🚀 Rýchle nastavenie GitHub + Vercel

## ✅ Čo už je hotové:

- ✅ Git repozitár je inicializovaný
- ✅ Všetky súbory sú commitnuté
- ✅ `.env` je v `.gitignore` (API kľúč nebude nahraný)
- ✅ Vercel konfigurácia je pripravená

## 📋 Čo musíte urobiť:

### KROK 1: Vytvorte GitHub repozitár

1. Choďte na: **https://github.com/new**
2. Vyplňte:
   - **Repository name**: `ai-animator` (alebo akýkoľvek názov)
   - **Description**: "AI aplikácia pre personalizované komiksy a animácie"
   - **Public** alebo **Private** (podľa preferencie)
   - **NEPRIDÁVAJTE** README, .gitignore, licenciu
3. Kliknite **"Create repository"**

### KROK 2: Nahrajte kód na GitHub

**Možnosť A - Pomocou skriptu (najjednoduchšie):**

```bash
cd "/Users/marek/AI animator"
./scripts/setup-github.sh
```

Skript sa vás opýta na:
- GitHub používateľské meno
- Názov repozitára

**Možnosť B - Manuálne:**

```bash
cd "/Users/marek/AI animator"

# Nahraďte YOUR_USERNAME a REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### KROK 3: Nasadenie na Vercel

1. **Choďte na:** https://vercel.com
2. **Prihláste sa** pomocou GitHub účtu
3. **Kliknite:** "Add New..." → "Project"
4. **Importujte** váš repozitár (vyberte `ai-animator` alebo váš názov)
5. **Pridajte Environment Variable:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-VAS-OPENAI-API-KEY` (použite váš skutočný API kľúč)
   - Environment: **Všetky** (Production, Preview, Development)
6. **Kliknite:** "Deploy"

### KROK 4: Hotovo! 🎉

Po dokončení buildu (2-3 minúty) budete mať:
- ✅ Web dostupný na `https://ai-animator-xxxxx.vercel.app`
- ✅ Automatické updaty pri každom push na GitHub

## 🔄 Ako updatovať projekt v budúcnosti:

```bash
# 1. Urobte zmeny v kóde
# 2. Commitnite
git add .
git commit -m "Popis zmien"

# 3. Pushnite na GitHub
git push origin main

# 4. Vercel automaticky nasadí novú verziu! ✨
```

## 📖 Viac informácií:

- Kompletná dokumentácia: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Rýchly štart: [QUICKSTART.md](./QUICKSTART.md)

## ⚠️ Dôležité:

- **API kľúč je už nastavený lokálne** v `.env` súbore
- **Na Vercel musíte pridať** `OPENAI_API_KEY` v Environment Variables
- **`.env` NIE JE** v git repozitári (je v `.gitignore`) ✅

---

**Potrebujete pomoc?** Pozrite si [DEPLOYMENT.md](./DEPLOYMENT.md) pre detailné inštrukcie.

