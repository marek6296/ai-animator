# 🎨 Nové možnosti - Rozšírené promptovanie a Upload fotky

## ✨ Čo je nové

### 1. **Rozšírené možnosti promptovania**

Teraz môžete špecifikovať viac detailov o vašom príbehu:

- **Emócie a výrazy** - Napríklad: "veselý, energický, prekvapený, vážny"
- **Akcia alebo aktivita** - Napríklad: "beží, skáče, sedí, tančí, bojuje"
- **Prostredie** - Napríklad: "v kaviarni, na pláži, v lese, v meste"
- **Atmosféra** - Napríklad: "romantická, akčná, tajomná, veselá, dramatická"

Tieto možnosti sú **voliteľné** a pomôžu AI vytvoriť presnejší a detailnejší príbeh.

### 2. **Upload referenčnej fotky**

Môžete nahrať vlastnú fotku, z ktorej sa zoberie tvár a prerobí do vybraného štýlu:

- **Nahranie fotky** - Drag & drop alebo kliknutie
- **Použitie fotky** - Zapnite/vypnite použitie referenčnej fotky
- **Sila vplyvu** - Nastavte, ako veľmi má byť výsledok podobný pôvodnej fotke (30% - 90%)

**Ako to funguje:**
1. Nahrajte fotku (PNG, JPG, WEBP, max 5MB)
2. Zapnite "Použiť túto fotku pre tvár"
3. Nastavte silu vplyvu (odporúčané: 70%)
4. Vygenerujte komiks alebo obrázok

**Tip:** Nižšia sila vplyvu (30-50%) = viac kreativity, menej podobnosti
Väčšia sila vplyvu (70-90%) = viac podobnosti, menej kreativity

---

## 🎯 Ako používať

### Základné použitie (bez rozšírených možností)

1. Vyplňte základné polia:
   - O sebe
   - Situácia
   - Kamaráti
2. Vyberte štýl
3. Kliknite "Vytvoriť"

### Rozšírené použitie

1. Kliknite na **"Zobraziť rozšírené možnosti"**
2. Vyplňte voliteľné polia:
   - Emócie a výrazy
   - Akcia alebo aktivita
   - Prostredie
   - Atmosféra
3. (Voliteľné) Nahrajte referenčnú fotku
4. Kliknite "Vytvoriť"

---

## 📝 Príklady použitia

### Príklad 1: Komiks s vlastnou fotkou

**Základné informácie:**
- O sebe: "Som 25-ročný programátor"
- Situácia: "Našiel som sa s kamarátmi v kaviarni"
- Kamaráti: "Marek - vtipný, Ján - vážny"

**Rozšírené možnosti:**
- Emócie: "veselý, usmievavý"
- Akcia: "sedí, rozpráva sa, gestikuluje"
- Prostredie: "v útulnej kaviarni s kávou"
- Atmosféra: "priateľská, uvoľnená"

**Referenčná fotka:** Vlastná fotka

**Výsledok:** Komiks s vašou tvárou v kaviarni, veselý, sedí a rozpráva sa s kamarátmi

---

### Príklad 2: Akčný obrázok

**Základné informácie:**
- O sebe: "Som superhrdina"
- Situácia: "Zachraňujem mesto"
- Kamaráti: "Môj tím superhrdinov"

**Rozšírené možnosti:**
- Emócie: "odhodlaný, silný, hrdinský"
- Akcia: "letí, bojuje, zachraňuje"
- Prostredie: "na streche mrakodrapu, v meste"
- Atmosféra: "epická, dramatická, akčná"

**Výsledok:** Epický akčný obrázok superhrdinu v akcii

---

## 🔧 Technické detaily

### Img2Img (Image-to-Image)

Aplikácia používa **Stable Diffusion SDXL** s podporou **img2img**:

- **Referenčná fotka** sa používa ako východiskový bod
- **Prompt** určuje, čo sa má zmeniť
- **Sila vplyvu** (strength) určuje, koľko z pôvodnej fotky sa zachová

**Ako to funguje:**
1. AI vezme vašu fotku
2. Aplikuje vybraný štýl (komiks, manga, atď.)
3. Zachová podobnosť tváre podľa nastavenej sily vplyvu
4. Vytvorí nový obrázok v danom štýle

### Rozšírené prompty

Rozšírené možnosti sa pridávajú do promptu, ktorý sa posiela AI:

- **Emócie** → Pridajú sa do popisu postáv
- **Akcia** → Pridajú sa do popisu scény
- **Prostredie** → Pridajú sa do popisu prostredia
- **Atmosféra** → Pridajú sa do celkového tónu

---

## ⚠️ Dôležité poznámky

### Upload fotky

- **Max veľkosť:** 5MB
- **Podporované formáty:** PNG, JPG, WEBP
- **Odporúčané:** Jasná fotka tváre, dobre osvetlená
- **Pozor:** Fotka sa používa len pre tvár, nie pre celé telo

### Sila vplyvu

- **0.3 - 0.5:** Menej podobnosti, viac kreativity
- **0.6 - 0.8:** Vyvážené (odporúčané)
- **0.8 - 0.9:** Viac podobnosti, menej kreativity

### Rozšírené možnosti

- **Voliteľné:** Nemusíte vyplniť všetky polia
- **Kombinovanie:** Môžete použiť len niektoré možnosti
- **Detailnosť:** Čím viac detailov, tým lepší výsledok

---

## 💡 Tipy

1. **Začnite jednoducho** - Najprv vyskúšajte bez rozšírených možností
2. **Postupne pridávajte** - Pridajte rozšírené možnosti, ak chcete presnejší výsledok
3. **Experimentujte** - Skúste rôzne kombinácie emócií, akcií a atmosféry
4. **Fotka** - Použite jasnú, dobre osvetlenú fotku tváre
5. **Sila vplyvu** - Začnite s 70%, potom upravte podľa výsledku

---

## 🎨 Príklady štýlov s fotkou

### Klasický komiks
- **Sila vplyvu:** 70%
- **Výsledok:** Vaša tvár v Marvel/DC štýle

### Manga/Anime
- **Sila vplyvu:** 65%
- **Výsledok:** Vaša tvár v japonskom anime štýle

### Realistický komiks
- **Sila vplyvu:** 75%
- **Výsledok:** Vaša tvár v fotorealistickom komiksovom štýle

### Kreslený komiks
- **Sila vplyvu:** 60%
- **Výsledok:** Vaša tvár v Disney/Pixar štýle

---

## 📚 Ďalšie informácie

- **Stable Diffusion SDXL:** Používa sa pre generovanie obrázkov
- **Img2Img:** Technológia pre premenu fotky do iného štýlu
- **LoRA modely:** Voliteľné modely pre špecifické štýly

---

**Poznámka:** Všetky nové možnosti sú voliteľné. Aplikácia funguje výborne aj bez nich!

