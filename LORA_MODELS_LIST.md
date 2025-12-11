# 📋 Zoznam LoRA modelov pre komiksové štýly

## 🎯 Kde nájsť LoRA modely

### 1. **Hugging Face** (odporúčané)
- **URL:** https://huggingface.co/models?search=sdxl+lora+comic
- **Formát:** `https://huggingface.co/username/model-name/resolve/main/lora.safetensors`
- **Príklad:** `https://huggingface.co/shourya-abot/comic-lora/resolve/main/lora.safetensors`

### 2. **CivitAI** (alternatíva)
- **URL:** https://civitai.com/models?types=LORA&query=sdxl+comic
- **Formát:** `https://civitai.com/api/download/models/MODEL_ID`
- **Poznámka:** Potrebujete sa prihlásiť a získať API kľúč

### 3. **Replicate** (ak máte vlastný model)
- **Formát:** `username/model-name` alebo `username/model-name:version`

---

## 🎨 Konkrétne modely pre každý štýl

### 1. **Klasický komiks** (`comic-book`)

**Hugging Face:**
- `shourya-abot/comic-lora` - https://huggingface.co/shourya-abot/comic-lora
  - URL: `https://huggingface.co/shourya-abot/comic-lora/resolve/main/lora.safetensors`
  - **Poznámka:** Tento model je pre FLUX, nie SDXL. Hľadajte SDXL verziu.

**CivitAI:**
- Vyhľadajte: "SDXL comic book LoRA"
- Filtre: SDXL, LoRA, Comic Book Style

**Ako pridať:**
```typescript
// V lib/loraModels.ts
{
  id: 'comic-book',
  loraModel: 'https://huggingface.co/username/comic-lora/resolve/main/lora.safetensors',
  // alebo
  loraModel: 'username/comic-book-lora', // Replicate model
}
```

---

### 2. **Manga/Anime** (`manga`)

**Hugging Face:**
- Vyhľadajte: "SDXL manga LoRA" alebo "SDXL anime LoRA"
- URL formát: `https://huggingface.co/username/manga-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL manga LoRA"
- Filtre: SDXL, LoRA, Manga Style

**Ako pridať:**
```typescript
{
  id: 'manga',
  loraModel: 'https://huggingface.co/username/manga-lora/resolve/main/lora.safetensors',
}
```

---

### 3. **Realistický komiks** (`realistic-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL realistic comic LoRA"
- URL formát: `https://huggingface.co/username/realistic-comic-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL photorealistic comic LoRA"
- Filtre: SDXL, LoRA, Realistic

---

### 4. **Kreslený komiks** (`cartoon-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL cartoon LoRA" alebo "SDXL Disney LoRA"
- URL formát: `https://huggingface.co/username/cartoon-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL cartoon LoRA"
- Filtre: SDXL, LoRA, Cartoon Style

---

### 5. **Akvarelový komiks** (`watercolor-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL watercolor LoRA"
- URL formát: `https://huggingface.co/username/watercolor-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL watercolor LoRA"
- Filtre: SDXL, LoRA, Watercolor

---

### 6. **Digitálny art komiks** (`digital-art-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL digital art LoRA" alebo "SDXL concept art LoRA"
- URL formát: `https://huggingface.co/username/digital-art-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL digital art LoRA"
- Filtre: SDXL, LoRA, Digital Art

---

### 7. **Noir komiks** (`noir-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL noir LoRA" alebo "SDXL black white LoRA"
- URL formát: `https://huggingface.co/username/noir-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL noir LoRA"
- Filtre: SDXL, LoRA, Noir, Black White

---

### 8. **Vintage komiks** (`vintage-comic`)

**Hugging Face:**
- Vyhľadajte: "SDXL vintage comic LoRA" alebo "SDXL retro LoRA"
- URL formát: `https://huggingface.co/username/vintage-comic-lora/resolve/main/lora.safetensors`

**CivitAI:**
- Vyhľadajte: "SDXL vintage comic LoRA"
- Filtre: SDXL, LoRA, Vintage, Retro

---

## 🔧 Ako pridať modely do aplikácie

### Krok 1: Nájdite model

1. Choďte na Hugging Face alebo CivitAI
2. Vyhľadajte SDXL LoRA model pre váš štýl
3. Skopírujte URL alebo model ID

### Krok 2: Pridajte do kódu

**Otvorte:** `lib/loraModels.ts`

**Pre Hugging Face URL:**
```typescript
{
  id: 'comic-book',
  loraModel: 'https://huggingface.co/username/comic-lora/resolve/main/lora.safetensors',
  // ...
}
```

**Pre Replicate model:**
```typescript
{
  id: 'comic-book',
  loraModel: 'username/comic-book-lora',
  // ...
}
```

### Krok 3: Otestujte

1. Spustite aplikáciu: `npm run dev`
2. Vyberte štýl s pridaným LoRA modelom
3. Vygenerujte obrázok
4. Skontrolujte kvalitu

---

## ⚠️ Dôležité poznámky

### SDXL vs FLUX
- **SDXL** - používame v aplikácii
- **FLUX** - iný model, nie je kompatibilný
- **Pozor:** Nie všetky LoRA modely sú pre SDXL!

### Kompatibilita
- Skontrolujte, či je model kompatibilný so SDXL
- Niektoré modely sú len pre FLUX alebo iné modely
- Testujte modely pred použitím v produkcii

### URL formát
- **Hugging Face:** `https://huggingface.co/username/model/resolve/main/lora.safetensors`
- **CivitAI:** `https://civitai.com/api/download/models/MODEL_ID` (vyžaduje API kľúč)
- **Replicate:** `username/model-name`

---

## 💡 Tipy

1. **Začnite bez LoRA** - aplikácia funguje výborne aj len s prompt enhancement
2. **Testujte jeden model** - pridajte jeden model a otestujte ho
3. **Kombinujte s prompt enhancement** - LoRA + prompt = najlepšia kvalita
4. **Použite populárne modely** - modely s viac používateľmi sú často lepšie
5. **Skontrolujte kompatibilitu** - uistite sa, že model je pre SDXL

---

## 🔍 Ako hľadať modely

### Hugging Face:
1. Choďte na: https://huggingface.co/models
2. Vyhľadajte: `sdxl lora comic` alebo `sdxl lora manga`
3. Filtre: `LoRA`, `SDXL`
4. Skopírujte URL modelu

### CivitAI:
1. Choďte na: https://civitai.com/models
2. Filtre: `Type: LoRA`, `Base Model: SDXL`
3. Vyhľadajte: `comic` alebo `manga`
4. Skopírujte model ID alebo API URL

---

## 📚 Užitočné odkazy

- **Hugging Face Models:** https://huggingface.co/models?search=sdxl+lora
- **CivitAI Models:** https://civitai.com/models?types=LORA&baseModel=SDXL
- **Replicate Models:** https://replicate.com/models
- **SDXL Documentation:** https://stability.ai/blog/sdxl-1-0

---

**Poznámka:** Aplikácia funguje výborne aj bez LoRA modelov. LoRA modely sú voliteľné a slúžia na vylepšenie kvality a konzistencie štýlu.


