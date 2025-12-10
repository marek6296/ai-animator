# 🔧 Nastavenie Environment Variables na Vercel

## Krok za krokom:

### 1. Otvorte Vercel Dashboard
- Choďte na: **https://vercel.com/dashboard**
- Prihláste sa (ak nie ste)

### 2. Nájdite váš projekt
- V zozname projektov kliknite na **"ai-animator"** (alebo názov vášho projektu)

### 3. Otvorte Settings
- V hornej navigácii kliknite na záložku **"Settings"**

### 4. Nájdite Environment Variables
- V ľavom menu kliknite na **"Environment Variables"**

### 5. Pridajte REPLICATE_API_TOKEN (POVINNÉ)

1. Kliknite na tlačidlo **"Add New"** alebo **"Add"**
2. Vyplňte:
   - **Key**: `REPLICATE_API_TOKEN`
   - **Value**: `r8-VAS-REPLICATE-API-TOKEN` (váš skutočný token z Replicate)
   - **Environment**: Zaškrtnite všetky tri:
     - ☑️ Production
     - ☑️ Preview  
     - ☑️ Development
3. Kliknite **"Save"**

### 6. (VOLITEĽNÉ) Pridajte LORA_MODEL

**Len ak máte vlastný LoRA model na Replicate:**

1. Kliknite na **"Add New"**
2. Vyplňte:
   - **Key**: `LORA_MODEL`
   - **Value**: `username/your-lora-model` (nahraďte vaším skutočným modelom)
   - **Environment**: Všetky tri
3. Kliknite **"Save"**

**Príklad:**
- Ak máte LoRA model na Replicate s názvom `marek6296/comic-style-lora`
- Value bude: `marek6296/comic-style-lora`

### 7. (VOLITEĽNÉ) Pridajte LORA_WEIGHT

**Len ak chcete zmeniť default váhu LoRA (default je 0.8):**

1. Kliknite na **"Add New"**
2. Vyplňte:
   - **Key**: `LORA_WEIGHT`
   - **Value**: `0.8` (alebo hodnotu medzi 0.0 a 1.0)
   - **Environment**: Všetky tri
3. Kliknite **"Save"**

**Poznámka:** Ak nepridáte `LORA_WEIGHT`, aplikácia použije default hodnotu 0.8.

---

## 📋 Súhrn - čo musíte pridať:

### ✅ POVINNÉ:
- `REPLICATE_API_TOKEN` = `r8-VAS-REPLICATE-API-TOKEN` (váš skutočný token)

### ⚙️ VOLITEĽNÉ (len ak máte vlastný LoRA):
- `LORA_MODEL` = `username/your-lora-model`
- `LORA_WEIGHT` = `0.8` (alebo iná hodnota)

---

## 🔄 Po pridaní Environment Variables:

### Možnosť 1: Automatický redeploy
- Vercel automaticky redeployne pri ďalšom push na GitHub
- Alebo počkajte na automatický deploy

### Možnosť 2: Manuálny redeploy
1. Choďte na záložku **"Deployments"**
2. Nájdite najnovší deployment
3. Kliknite na **tri bodky (⋯)** vedľa neho
4. Vyberte **"Redeploy"**
5. Potvrďte

---

## ✅ Ako overiť, že to funguje:

1. Po redeploy otvorte vašu aplikáciu na Vercel
2. Skúste vygenerovať komiks/animáciu/meme
3. Ak sa obrázky generujú, všetko funguje správne!

---

## 🆘 Riešenie problémov:

**Obrázky sa negenerujú:**
- Skontrolujte, či je `REPLICATE_API_TOKEN` správne nastavený
- Skontrolujte, či máte dostatočný kredit na Replicate účte
- Pozrite si logy v Vercel (Deployments → Functions → View Function Logs)

**LoRA nefunguje:**
- Skontrolujte, či je `LORA_MODEL` správne nastavený (formát: `username/model-name`)
- Skontrolujte, či máte prístup k modelu na Replicate
- Skúste zmeniť `LORA_WEIGHT` (0.5 - 1.0)

---

## 📝 Poznámky:

- Environment Variables sa **NEPRIDÁVAJÚ** automaticky pri redeploy
- Po pridaní novej Environment Variable musíte **redeployovať** projekt
- Uistite sa, že ste zaškrtli všetky tri environmenty (Production, Preview, Development)

