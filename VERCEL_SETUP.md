# 🔧 Nastavenie Environment Variables na Vercel

## Krok za krokom:

### 1. Otvorte Vercel Dashboard
- Choďte na: **https://vercel.com/dashboard**
- Prihláste sa (ak nie ste)

### 2. Nájdite váš projekt
- V zozname projektov nájdite **"ai-animator"** (alebo názov vášho projektu)
- **Kliknite na názov projektu** (nie na ikonu, ale na text názvu)

### 3. Otvorte Settings
- V hornej navigácii projektu uvidíte tieto záložky:
  - Overview
  - Deployments
  - **Settings** ← Kliknite sem
  - Analytics
  - Logs

### 4. Nájdite Environment Variables
- V ľavom menu pod "Settings" uvidíte:
  - General
  - Domains
  - **Environment Variables** ← Kliknite sem
  - Git
  - Security
  - Functions
  - etc.

### 5. Pridajte Environment Variable
- Kliknite na tlačidlo **"Add New"** alebo **"Add"**
- Vyplňte:
  - **Key**: `OPENAI_API_KEY`
  - **Value**: `sk-proj-VAS-OPENAI-API-KEY` (použite váš skutočný API kľúč)
  - **Environment**: Zaškrtnite všetky tri:
    - ☑️ Production
    - ☑️ Preview  
    - ☑️ Development
- Kliknite **"Save"**

### 6. Redeploy projekt
- Po pridaní Environment Variable musíte **redeployovať** projekt
- Choďte na záložku **"Deployments"**
- Nájdite najnovší deployment
- Kliknite na **tri bodky (⋯)** vedľa neho
- Vyberte **"Redeploy"**
- Alebo jednoducho urobte nový commit a push na GitHub - Vercel automaticky redeployne

---

## Alternatívny spôsob (ak nevidíte Settings):

### Počas importu projektu:
1. Keď importujete projekt z GitHub
2. Pred kliknutím na "Deploy" uvidíte sekciu **"Environment Variables"**
3. Tam môžete pridať `OPENAI_API_KEY` hneď

### Ak už máte projekt nasadený:
1. Choďte na **Deployments**
2. Kliknite na najnovší deployment
3. Vpravo hore kliknite na **"..."** (tri bodky)
4. Vyberte **"View Build Logs"** alebo **"Redeploy"**
5. Alebo choďte cez **Settings → Environment Variables**

---

## Obrázok cesty v UI:

```
Vercel Dashboard
  └── Projects
      └── ai-animator (kliknite sem)
          └── Settings (záložka hore)
              └── Environment Variables (v ľavom menu)
                  └── Add New (tlačidlo)
```

---

## ⚠️ Dôležité:

- Environment Variables sa **NEPRIDÁVAJÚ** automaticky pri redeploy
- Po pridaní novej Environment Variable musíte **redeployovať** projekt
- Uistite sa, že ste zaškrtli všetky tri environmenty (Production, Preview, Development)

---

## 🆘 Ak stále nevidíte Environment Variables:

1. **Skontrolujte, či ste vlastníkom projektu** - Environment Variables vidia len vlastníci
2. **Skontrolujte, či máte správne oprávnenia** - možno ste len collaborator
3. **Skúste iný prehliadač** alebo **vymazať cache**
4. **Kontaktujte Vercel support** - https://vercel.com/support

---

## 📸 Screenshot popis:

Ak máte problém nájsť, hľadajte:
- V **Settings** sekcii (nie v Overview)
- V **ľavom sidebar menu** (nie v hornej navigácii)
- Text **"Environment Variables"** alebo **"Env Vars"**
- Tlačidlo **"Add"** alebo **"Add New"**

