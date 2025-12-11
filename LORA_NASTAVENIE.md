# 🎨 Nastavenie LoRA modelov pre každý štýl

## 📝 Čo musíte pridať

Keď nájdete LoRA model na Replicate, pridajte ho do súboru **`lib/loraModels.ts`** pre každý štýl.

---

## 🔧 Ako pridať LoRA model

### 1. Otvorte súbor: `lib/loraModels.ts`

### 2. Pre každý štýl nájdite riadok s `loraModel` a odkomentujte/pridajte model:

```typescript
{
  id: 'comic-book',
  name: 'Klasický komiks',
  description: 'Tradičný komiksový štýl, Marvel/DC štýl, farebné, expresívne',
  loraModel: 'username/comic-book-lora', // ← TU PRIDAJTE VÁŠ MODEL
  promptEnhancement: 'comic book style, Marvel comics style...',
  loraWeight: 0.8,
},
```

---

## 📋 Zoznam štýlov a čo pridať

### 1. **Klasický komiks** (`comic-book`)

**Hľadajte na Replicate:**
- "comic book LoRA SDXL"
- "Marvel comic LoRA"
- "DC comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/comic-book-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'john/comic-book-sdxl',
```

---

### 2. **Manga/Anime** (`manga`)

**Hľadajte na Replicate:**
- "manga LoRA SDXL"
- "anime comic LoRA"
- "japanese comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/manga-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'jane/manga-style-lora',
```

---

### 3. **Realistický komiks** (`realistic-comic`)

**Hľadajte na Replicate:**
- "realistic comic LoRA SDXL"
- "photorealistic comic LoRA"
- "cinematic comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/realistic-comic-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'artist/realistic-comic-sdxl',
```

---

### 4. **Kreslený komiks** (`cartoon-comic`)

**Hľadajte na Replicate:**
- "cartoon comic LoRA SDXL"
- "Disney comic LoRA"
- "animated comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/cartoon-comic-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'animator/cartoon-comic-lora',
```

---

### 5. **Akvarelový komiks** (`watercolor-comic`)

**Hľadajte na Replicate:**
- "watercolor LoRA SDXL"
- "watercolor comic LoRA"
- "painting comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/watercolor-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'painter/watercolor-comic-lora',
```

---

### 6. **Digitálny art komiks** (`digital-art-comic`)

**Hľadajte na Replicate:**
- "digital art LoRA SDXL"
- "concept art LoRA"
- "modern comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/digital-art-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'designer/digital-art-comic-lora',
```

---

### 7. **Noir komiks** (`noir-comic`)

**Hľadajte na Replicate:**
- "noir comic LoRA SDXL"
- "black white comic LoRA"
- "film noir LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/noir-comic-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'director/noir-comic-lora',
```

---

### 8. **Vintage komiks** (`vintage-comic`)

**Hľadajte na Replicate:**
- "vintage comic LoRA SDXL"
- "retro comic LoRA"
- "1950s comic LoRA"

**Pridajte do `lib/loraModels.ts`:**
```typescript
loraModel: 'username/vintage-comic-lora', // ← PRIDAJTE MODEL
```

**Príklad:**
```typescript
loraModel: 'collector/vintage-comic-lora',
```

---

## 🎯 Krok za krokom

### Krok 1: Nájdite model na Replicate

1. Choďte na: **https://replicate.com/models**
2. Vyhľadajte model (napr. "comic book LoRA")
3. Skopírujte Model ID (napr. `username/model-name`)

### Krok 2: Pridajte do kódu

1. Otvorte: `lib/loraModels.ts`
2. Nájdite štýl, ktorý chcete upraviť
3. Odkomentujte/pridajte `loraModel` a vložte váš model:

```typescript
loraModel: 'username/your-model-name', // ← VÁŠ MODEL
```

### Krok 3: Otestujte

1. Spustite aplikáciu: `npm run dev`
2. Vyberte štýl v aplikácii
3. Vygenerujte komiks
4. Skontrolujte kvalitu

---

## ⚠️ Dôležité poznámky

### Formát modelu:
- ✅ **Správne:** `username/model-name`
- ✅ **Správne:** `username/model-name:version-id`
- ❌ **Nesprávne:** `https://replicate.com/username/model-name`
- ❌ **Nesprávne:** `model-name` (bez username)

### Ak model nefunguje:
1. Skontrolujte, či je model kompatibilný so SDXL
2. Skontrolujte, či máte správne oprávnenia
3. Skúste iný model alebo použite len prompt enhancement

### Ak nemáte LoRA model:
- Aplikácia funguje aj bez LoRA modelov
- Použije sa len prompt enhancement
- Kvalita môže byť stále veľmi dobrá

---

## 💡 Tipy

1. **Začnite s jedným štýlom** - otestujte jeden LoRA model pred pridaním ďalších
2. **Testujte rôzne váhy** - zmeňte `loraWeight` (0.6 - 0.9) pre najlepšie výsledky
3. **Kombinujte s prompt enhancement** - LoRA + prompt enhancement = najlepšia kvalita
4. **Použite populárne modely** - modely s viac používateľmi sú často lepšie

---

## 📚 Kde hľadať modely

### Replicate:
- **Hlavná stránka:** https://replicate.com/models
- **Vyhľadávanie:** "SDXL LoRA comic" alebo "SDXL LoRA manga"

### Civitai (alternatíva):
- **Hlavná stránka:** https://civitai.com
- **Filtre:** SDXL, LoRA, Comic Book Style

### Hugging Face (alternatíva):
- **Hlavná stránka:** https://huggingface.co/models
- **Filtre:** SDXL, LoRA

---

## ✅ Kontrolný zoznam

- [ ] Nájdite LoRA model pre Klasický komiks
- [ ] Nájdite LoRA model pre Manga/Anime
- [ ] Nájdite LoRA model pre Realistický komiks
- [ ] Nájdite LoRA model pre Kreslený komiks
- [ ] Nájdite LoRA model pre Akvarelový komiks
- [ ] Nájdite LoRA model pre Digitálny art
- [ ] Nájdite LoRA model pre Noir komiks
- [ ] Nájdite LoRA model pre Vintage komiks
- [ ] Pridajte všetky modely do `lib/loraModels.ts`
- [ ] Otestujte každý štýl v aplikácii

---

**Poznámka:** Ak nemáte čas hľadať modely teraz, aplikácia funguje výborne aj bez LoRA modelov. Môžete ich pridať neskôr, keď nájdete vhodné modely.


