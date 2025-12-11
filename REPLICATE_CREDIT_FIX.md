# 💳 Riešenie problému s kreditom na Replicate

## ❌ Problém

Chyba: **"Insufficient credit"** alebo **"402 Payment Required"**

```
ApiError: Request to https://api.replicate.com/v1/predictions failed with status 402 Payment Required: 
{"title":"Insufficient credit","detail":"You have insufficient credit to run this model. 
Go to https://replicate.com/account/billing#billing to purchase credit..."}
```

## ✅ Riešenie

### Krok 1: Pridajte kredit na Replicate

1. Choďte na: **https://replicate.com/account/billing#billing**
2. Kliknite na **"Add credit"** alebo **"Purchase credit"**
3. Vyberte sumu (napr. $10, $20, $50)
4. Dokončite platbu

### Krok 2: Počkajte niekoľko minút

Po pridaní kreditu počkajte **2-5 minút** pred ďalším pokusom. Replicate potrebuje čas na spracovanie platby.

### Krok 3: Skúste znova

Počkajte a skúste vygenerovať komiks/obrázok znova.

---

## 💰 Ceny na Replicate

**SDXL model** (ktorý používame):
- **Cena:** ~$0.003 - $0.01 per obrázok
- **Komiks s 6 panelmi:** ~$0.02 - $0.06
- **Jeden obrázok:** ~$0.003 - $0.01

**Odporúčané:**
- Začnite s **$10** kreditom
- To vám stačí na **1000-3000 obrázkov**
- Alebo **150-500 komiksov** (6 panelov)

---

## 🔍 Ako skontrolovať kredit

1. Choďte na: **https://replicate.com/account/billing**
2. Pozrite sa na **"Credit balance"**
3. Ak je **$0.00** alebo veľmi nízky, pridajte kredit

---

## ⚠️ Dôležité poznámky

### Rate Limits (429 Too Many Requests)

Ak vidíte chybu **"429 Too Many Requests"**:
- **Bez payment method:** 6 requestov za minútu
- **S payment method:** Viac requestov za minútu

**Riešenie:**
1. Pridajte payment method na https://replicate.com/account/billing
2. Počkajte niekoľko minút
3. Skúste znova

### Free Tier

Replicate **nemá free tier** pre SDXL modely. Musíte mať kredit na účte.

---

## 🆘 Alternatívy

### Možnosť 1: Použiť DALL-E 3 (ak máte OpenAI kredit)

V `.env` súbore:
```env
USE_STABLE_DIFFUSION=false
OPENAI_API_KEY=sk-...
```

**Poznámka:** DALL-E 3 je drahší (~$0.04 per obrázok), ale môže byť dostupný ak máte OpenAI kredit.

### Možnosť 2: Použiť iný model

Môžete skúsiť iný, lacnejší model na Replicate, ale kvalita môže byť nižšia.

---

## 📝 Kontrolný zoznam

- [ ] Skontroloval som kredit na https://replicate.com/account/billing
- [ ] Pridal som kredit (ak bol nedostatok)
- [ ] Počkal som 2-5 minút po pridaní kreditu
- [ ] Skúšal som generovať znova
- [ ] (Voliteľne) Pridal som payment method pre vyššie rate limity

---

## 💡 Tipy

1. **Sledujte spotrebu** - Pozrite si históriu na Replicate, koľko kreditu ste použili
2. **Nastavte si limit** - Na Replicate môžete nastaviť monthly spending limit
3. **Optimalizujte použitie** - Generujte len to, čo skutočne potrebujete
4. **Kombinujte s DALL-E** - Ak máte OpenAI kredit, môžete použiť DALL-E pre niektoré obrázky

---

## 🔗 Užitočné odkazy

- **Replicate Billing:** https://replicate.com/account/billing
- **Replicate Pricing:** https://replicate.com/pricing
- **Replicate Docs:** https://replicate.com/docs

---

**Poznámka:** Replicate je pay-as-you-go služba. Platíte len za to, čo použijete. SDXL je relatívne lacný model, takže náklady by mali byť nízke.


