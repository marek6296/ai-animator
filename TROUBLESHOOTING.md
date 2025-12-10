# 🔧 Riešenie problémov - Chyby pri generovaní

## ❌ Časté chyby a riešenia

### 1. **Chyba: "Insufficient credit" alebo "402 Payment Required"** ⚠️ NAJČASTEJŠIE

**Príčina:**
- Nedostatok kreditu na Replicate účte
- Replicate vyžaduje kredit pre SDXL modely

**Riešenie:**
1. Choďte na: **https://replicate.com/account/billing#billing**
2. Pridajte kredit (odporúčané: $10)
3. Počkajte **2-5 minút** po pridaní kreditu
4. Skúste generovať znova

**Ceny:**
- Jeden obrázok: ~$0.003 - $0.01
- Komiks (6 panelov): ~$0.02 - $0.06
- $10 kredit = ~1000-3000 obrázkov

**Viac informácií:** Pozrite si `REPLICATE_CREDIT_FIX.md`

---

### 2. **Chyba: "429 Too Many Requests"**

**Príčina:**
- Príliš veľa requestov za minútu
- Bez payment method: 6 requestov/min
- S payment method: viac requestov/min

**Riešenie:**
1. Pridajte payment method na https://replicate.com/account/billing
2. Počkajte niekoľko minút
3. Skúste znova

---

### 3. **Chyba: "Nepodarilo sa vygenerovať obrázok"**

**Možné príčiny:**
- Neplatný REPLICATE_API_TOKEN
- Neplatný SDXL_MODEL
- Problém s referenčnou fotkou (img2img)
- Príliš dlhý prompt

**Riešenie:**
1. Skontrolujte `.env` súbor:
   ```env
   REPLICATE_API_TOKEN=r8_...
   SDXL_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
   ```

2. Skontrolujte terminál - tam uvidíte detailnejšiu chybovú správu

3. Skúste generovať bez referenčnej fotky

4. Skráťte prompt alebo odstráňte rozšírené možnosti

---

### 2. **Chyba: "Chyba pri spracovaní referenčnej fotky"**

**Príčina:**
- SDXL model na Replicate môže mať problém s Base64 obrázkom
- Príliš veľký obrázok
- Nesprávny formát obrázka

**Riešenie:**
1. Použite menší obrázok (max 5MB)
2. Skúste iný formát (JPG namiesto PNG)
3. Skúste generovať bez referenčnej fotky
4. Použite jasnú, dobre osvetlenú fotku

---

### 3. **Chyba: "Chyba autentifikácie"**

**Príčina:**
- Neplatný alebo chýbajúci REPLICATE_API_TOKEN

**Riešenie:**
1. Skontrolujte `.env` súbor
2. Skontrolujte, či token nie je expirovaný
3. Vytvorte nový token na https://replicate.com/account/api-tokens
4. Na Vercel: Skontrolujte Environment Variables

---

### 4. **Chyba: "Model nie je dostupný"**

**Príčina:**
- Neplatný SDXL_MODEL ID
- Model bol odstránený alebo zmenený

**Riešenie:**
1. Skontrolujte SDXL_MODEL v `.env`
2. Použite default model:
   ```env
   SDXL_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
   ```

---

### 5. **Chyba: "Nepodarilo sa vygenerovať obrázok - neplatný výstup"**

**Príčina:**
- Replicate API vrátilo neplatný formát
- Timeout alebo prerušenie spojenia

**Riešenie:**
1. Skúste to znova (automatický retry)
2. Skontrolujte internetové pripojenie
3. Skúste kratší prompt
4. Skontrolujte, či máte dostatok kreditu na Replicate

---

## 🔍 Ako zistiť, čo sa stalo

### 1. **Pozrite sa do terminálu**

V termináli uvidíte detailné chybové správy:
```
Stable Diffusion API error (attempt 1/3): [chyba]
```

### 2. **Pozrite sa do konzoly prehliadača**

Otvorite Developer Tools (F12) a pozrite sa na:
- **Console** - JavaScript chyby
- **Network** - API requesty a odpovede

### 3. **Skontrolujte progress**

Aplikácia zobrazuje progress. Ak sa zastaví, pozrite sa na poslednú správu.

---

## 🛠️ Krok za krokom - Diagnostika

### Krok 1: Skontrolujte Environment Variables

**Lokálne (.env):**
```bash
cat .env
```

Mali by ste vidieť:
```
REPLICATE_API_TOKEN=r8_...
OPENAI_API_KEY=sk-...
```

**Na Vercel:**
1. Choďte do projektu
2. Settings → Environment Variables
3. Skontrolujte, či sú všetky nastavené

### Krok 2: Testujte bez referenčnej fotky

1. Skúste generovať komiks/obrázok **bez** referenčnej fotky
2. Ak to funguje, problém je s img2img
3. Ak to nefunguje, problém je všeobecný

### Krok 3: Testujte s jednoduchým promptom

1. Použite len základné polia:
   - O sebe: "Test"
   - Situácia: "Test situácia"
   - Kamaráti: "Test kamarát"
2. Bez rozšírených možností
3. Bez referenčnej fotky

### Krok 4: Skontrolujte API tokeny

**Replicate:**
```bash
curl https://api.replicate.com/v1/models \
  -H "Authorization: Token r8_YOUR_TOKEN"
```

**OpenAI:**
- Skontrolujte na https://platform.openai.com/api-keys
- Skontrolujte, či máte dostatok kreditu

---

## 📝 Logovanie chýb

Aplikácia automaticky loguje chyby:

1. **Server-side** (terminál):
   - Všetky API chyby
   - Detailné informácie o chybe

2. **Client-side** (konzola prehliadača):
   - JavaScript chyby
   - Network chyby

---

## 💡 Tipy

1. **Vždy skontrolujte terminál** - tam sú najdetailnejšie chyby
2. **Skúste bez referenčnej fotky** - img2img môže mať problémy
3. **Skráťte prompt** - príliš dlhý prompt môže spôsobiť chyby
4. **Skontrolujte API tokeny** - často je problém tam
5. **Skúste znova** - niekedy je to len dočasný problém

---

## 🆘 Ak nič nepomôže

1. **Skontrolujte dokumentáciu:**
   - [Replicate Docs](https://replicate.com/docs)
   - [Stable Diffusion SDXL](https://replicate.com/stability-ai/sdxl)

2. **Kontaktujte podporu:**
   - Replicate: support@replicate.com
   - Skontrolujte status: https://status.replicate.com

3. **Vytvorte issue:**
   - Popíšte problém
   - Pridajte chybové správy z terminálu
   - Pridajte kroky na reprodukciu

---

## ✅ Kontrolný zoznam

Pred nahlásením problému skontrolujte:

- [ ] REPLICATE_API_TOKEN je nastavený a platný
- [ ] OPENAI_API_KEY je nastavený a platný
- [ ] Skúšal som generovať bez referenčnej fotky
- [ ] Skúšal som generovať s jednoduchým promptom
- [ ] Pozrel som sa do terminálu na chyby
- [ ] Pozrel som sa do konzoly prehliadača
- [ ] Skontroloval som internetové pripojenie
- [ ] Skontroloval som kredit na Replicate

---

**Poznámka:** Väčšina problémov je spôsobená nesprávnymi API tokenmi alebo problémami s referenčnou fotkou. Skúste najprv tieto riešenia!

