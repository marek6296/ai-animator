# 💳 Platba a náklady - Replicate API

## ❓ Musím platiť?

**ÁNO**, Replicate API vyžaduje kredit (platbu) pre generovanie obrázkov.

**Prečo?**
- Replicate používa výkonné GPU servery
- SDXL model je výpočtovo náročný
- Replicate nemá free tier pre SDXL modely

---

## 💰 Koľko to stojí?

### Ceny na Replicate

**SDXL model** (ktorý používame):
- **Jeden obrázok:** ~$0.003 - $0.01 (0.3 - 1 cent)
- **Komiks s 6 panelmi:** ~$0.02 - $0.06 (2 - 6 centov)
- **Komiks s 8 panelmi:** ~$0.03 - $0.08 (3 - 8 centov)

### Príklady nákladov

**$10 kredit:**
- ✅ ~1,000 - 3,000 obrázkov
- ✅ ~150 - 500 komiksov (6 panelov)
- ✅ ~100 - 300 komiksov (8 panelov)

**$20 kredit:**
- ✅ ~2,000 - 6,000 obrázkov
- ✅ ~300 - 1,000 komiksov (6 panelov)

**$50 kredit:**
- ✅ ~5,000 - 15,000 obrázkov
- ✅ ~800 - 2,500 komiksov (6 panelov)

---

## 🎯 Ako to funguje?

### 1. **Pay-as-you-go** (Platba za použitie)

- **Nepotrebujete** mesačný predplatný
- **Platíte len** za to, čo použijete
- **Kredit sa** odpočítava pri každom obrázku
- **Žiadne skryté poplatky**

### 2. **Minimálna suma**

- **Minimálna platba:** $5 - $10
- **Odporúčané:** Začnite s $10
- **Kredit neexpiroje** (ak používate účet)

---

## 📝 Ako pridať kredit

### Krok 1: Choďte na Replicate

1. Otvorte: **https://replicate.com/account/billing#billing**
2. Prihláste sa do svojho účtu

### Krok 2: Pridajte kredit

1. Kliknite na **"Add credit"** alebo **"Purchase credit"**
2. Vyberte sumu:
   - **$5** - pre testovanie
   - **$10** - odporúčané na začiatok
   - **$20** - pre viac používania
   - **$50** - pre intenzívne používanie
3. Vyberte spôsob platby (kreditná karta, PayPal)
4. Dokončite platbu

### Krok 3: Počkajte

- Po pridaní kreditu počkajte **2-5 minút**
- Replicate potrebuje čas na spracovanie platby
- Potom skúste generovať znova

---

## 🔄 Alternatívy

### Možnosť 1: DALL-E 3 (OpenAI)

**Ak máte OpenAI kredit**, môžete použiť DALL-E 3:

**V `.env` súbore:**
```env
USE_STABLE_DIFFUSION=false
OPENAI_API_KEY=sk-...
```

**Ceny DALL-E 3:**
- Jeden obrázok: ~$0.04 (4 centy)
- **Drahšie** ako Replicate SDXL
- Ale možno už máte OpenAI kredit

### Možnosť 2: Iný model na Replicate

Môžete skúsiť iný, lacnejší model, ale kvalita môže byť nižšia.

---

## 💡 Tipy na úsporu

### 1. **Optimalizujte použitie**

- Generujte len to, čo skutočne potrebujete
- Skúste najprv s jedným obrázkom pred komiksom
- Použite referenčnú fotku len ak je potrebná

### 2. **Sledujte spotrebu**

- Pozrite si históriu na Replicate
- Sledujte, koľko kreditu ste použili
- Nastavte si monthly spending limit

### 3. **Kombinujte služby**

- Použite Replicate pre komiksy (lacnejšie)
- Použite DALL-E pre špeciálne obrázky (ak máte kredit)

---

## ⚠️ Dôležité poznámky

### Rate Limits

**Bez payment method:**
- 6 requestov za minútu
- Obmedzené možnosti

**S payment method:**
- Viac requestov za minútu
- Lepšie rate limity

**Riešenie:** Pridajte payment method na https://replicate.com/account/billing

### Free Tier

Replicate **nemá free tier** pre SDXL modely. Musíte mať kredit.

### Kredit neexpiroje

- Kredit neexpiroje, ak používate účet
- Môžete ho použiť kedykoľvek
- Žiadne skryté poplatky

---

## 📊 Porovnanie nákladov

### Replicate SDXL vs DALL-E 3

| Služba | Cena za obrázok | Cena za komiks (6 panelov) |
|--------|----------------|---------------------------|
| **Replicate SDXL** | $0.003 - $0.01 | $0.02 - $0.06 |
| **DALL-E 3** | $0.04 | $0.24 |

**Záver:** Replicate SDXL je **4-10x lacnejší** ako DALL-E 3.

---

## 🎯 Odporúčanie

### Pre začiatočníkov:

1. **Začnite s $10 kreditom**
   - Stačí na testovanie
   - ~1,000 - 3,000 obrázkov
   - Môžete otestovať aplikáciu

2. **Pridajte payment method**
   - Lepšie rate limity
   - Automatické dopĺňanie (voliteľné)

3. **Sledujte spotrebu**
   - Pozrite si históriu
   - Nastavte si limit

### Pre pravidelné používanie:

1. **$20 - $50 kredit**
   - Viac obrázkov
   - Menej časté dopĺňanie

2. **Monthly spending limit**
   - Ochrana pred prečerpaním
   - Kontrola nákladov

---

## 🔗 Užitočné odkazy

- **Replicate Billing:** https://replicate.com/account/billing
- **Replicate Pricing:** https://replicate.com/pricing
- **Replicate Docs:** https://replicate.com/docs
- **Replicate Status:** https://status.replicate.com

---

## ❓ Časté otázky

### Musím platiť každý mesiac?

**Nie.** Replicate je pay-as-you-go. Platíte len za to, čo použijete. Kredit neexpiroje.

### Koľko stojí jeden komiks?

**~$0.02 - $0.06** (2-6 centov) pre komiks s 6 panelmi.

### Môžem použiť bez platby?

**Nie.** Replicate vyžaduje kredit pre SDXL modely. Nie je free tier.

### Je to drahé?

**Nie.** SDXL je jeden z najlacnejších modelov. $10 kredit = ~1,000-3,000 obrázkov.

### Môžem použiť DALL-E namiesto Replicate?

**Áno**, ak máte OpenAI kredit. V `.env` nastavte `USE_STABLE_DIFFUSION=false`. Ale DALL-E je drahší.

---

## ✅ Zhrnutie

- ✅ **Replicate vyžaduje kredit** (platbu)
- ✅ **Cena:** ~$0.003 - $0.01 per obrázok
- ✅ **$10 kredit** = ~1,000-3,000 obrázkov
- ✅ **Pay-as-you-go** - platíte len za použitie
- ✅ **Žiadne skryté poplatky**
- ✅ **Kredit neexpiroje**

**Odporúčanie:** Začnite s $10 kreditom a otestujte aplikáciu. Potom môžete pridať viac podľa potreby.

