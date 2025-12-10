# 🎨 Príručka pre LoRA modely - Komiksové štýly

## 📋 Dostupné štýly komiksov

Aplikácia podporuje **8 profesionálnych štýlov komiksov**:

1. **Klasický komiks** - Tradičný Marvel/DC štýl
2. **Manga/Anime** - Japonský manga štýl
3. **Realistický komiks** - Fotorealistický štýl
4. **Kreslený komiks** - Disney/Pixar štýl
5. **Akvarelový komiks** - Umeniecký akvarel
6. **Digitálny art komiks** - Moderný koncept art
7. **Noir komiks** - Čiernobiely film noir
8. **Vintage komiks** - Retro 50s-60s štýl

---

## 🔍 Ako nájsť LoRA modely na Replicate

### Krok 1: Prehľadávanie modelov

1. Choďte na: **https://replicate.com/models**
2. Vyhľadajte: `SDXL LoRA` alebo `comic book LoRA` alebo `manga LoRA`
3. Prehľadávajte dostupné modely

### Krok 2: Nájdite vhodný model

**Hľadajte modely typu:**
- `comic-book-lora`
- `manga-lora`
- `anime-lora`
- `realistic-comic-lora`
- `cartoon-lora`
- `watercolor-lora`
- `noir-lora`
- `vintage-comic-lora`

**Príklad formátu modelu:**
- `username/comic-book-lora`
- `username/manga-style-lora:version-id`

### Krok 3: Skopírujte Model ID

Keď nájdete vhodný model, skopírujte jeho ID (napr. `john/comic-lora` alebo `jane/manga-lora:abc123`)

---

## ⚙️ Ako pridať LoRA modely do aplikácie

### Možnosť 1: Globálny LoRA model (pre všetky štýly)

**Lokálne (.env):**
```env
LORA_MODEL=username/your-comic-lora-model
LORA_WEIGHT=0.8
```

**Na Vercel:**
- Settings → Environment Variables
- Pridajte `LORA_MODEL` = `username/your-model`
- Pridajte `LORA_WEIGHT` = `0.8`

### Možnosť 2: Špecifický LoRA pre každý štýl (ODPORÚČANÉ)

**Upravte súbor:** `lib/loraModels.ts`

Pre každý štýl odkomentujte a pridajte model:

```typescript
{
  id: 'comic-book',
  name: 'Klasický komiks',
  description: 'Tradičný komiksový štýl',
  loraModel: 'username/comic-book-lora', // ← PRIDAJTE VÁŠ MODEL
  promptEnhancement: '...',
  loraWeight: 0.8,
},
```

---

## 📝 Príklady populárnych LoRA modelov

### Pre Klasický komiks:
```
LORA_MODEL=username/comic-book-sdxl
```
**Kde hľadať:** Replicate → vyhľadajte "comic book SDXL LoRA"

### Pre Manga/Anime:
```
LORA_MODEL=username/manga-style-lora
```
**Kde hľadať:** Replicate → vyhľadajte "manga SDXL LoRA" alebo "anime comic LoRA"

### Pre Realistický komiks:
```
LORA_MODEL=username/realistic-comic-lora
```
**Kde hľadať:** Replicate → vyhľadajte "realistic comic LoRA"

### Pre Kreslený komiks:
```
LORA_MODEL=username/cartoon-comic-lora
```
**Kde hľadať:** Replicate → vyhľadajte "cartoon comic LoRA"

### Pre Akvarelový komiks:
```
LORA_MODEL=username/watercolor-lora
```
**Kde hľadať:** Replicate → vyhľadajte "watercolor SDXL LoRA"

### Pre Digitálny art:
```
LORA_MODEL=username/digital-art-lora
```
**Kde hľadať:** Replicate → vyhľadajte "digital art LoRA"

### Pre Noir komiks:
```
LORA_MODEL=username/noir-comic-lora
```
**Kde hľadať:** Replicate → vyhľadajte "noir comic LoRA" alebo "black white comic LoRA"

### Pre Vintage komiks:
```
LORA_MODEL=username/vintage-comic-lora
```
**Kde hľadať:** Replicate → vyhľadajte "vintage comic LoRA" alebo "retro comic LoRA"

---

## 🎯 Odporúčaný postup

### 1. Začnite bez LoRA modelov
- Aplikácia funguje výborne aj bez LoRA
- Otestujte rôzne štýly pomocou prompt enhancement

### 2. Nájdite vhodné LoRA modely
- Prejdite si Replicate modely
- Vyberte modely, ktoré sa vám páčia
- Otestujte ich kvalitu

### 3. Pridajte modely do aplikácie

**Ak chcete jeden model pre všetky štýly:**
```env
LORA_MODEL=username/universal-comic-lora
```

**Ak chcete špecifický model pre každý štýl:**
Upravte `lib/loraModels.ts` a pridajte `loraModel` pre každý štýl.

---

## 🔧 Technické detaily

### Formát LoRA modelu:
- **Jednoduchý:** `username/model-name`
- **S verziou:** `username/model-name:version-id`

### LoRA Weight (váha):
- **0.0 - 0.5**: Slabý vplyv LoRA
- **0.6 - 0.8**: Odporúčané (default 0.8)
- **0.9 - 1.0**: Silný vplyv LoRA

### Ako to funguje:
1. Používateľ vyberie štýl
2. Aplikácia nájde LoRA model pre štýl (alebo použije globálny)
3. LoRA sa pridá do promptu: `<lora:model-name:weight>`
4. Stable Diffusion generuje obrázok so štýlom

---

## 📚 Užitočné odkazy

- **Replicate Models**: https://replicate.com/models
- **Civitai** (alternatíva): https://civitai.com (pre lokálne modely)
- **Hugging Face** (alternatíva): https://huggingface.co/models (pre SDXL LoRA)

---

## ⚠️ Dôležité poznámky

1. **LoRA modely nie sú povinné** - aplikácia funguje aj bez nich
2. **Kvalita závisí od modelu** - nie všetky LoRA modely sú rovnako dobré
3. **Testujte modely** - skúste rôzne modely a vyberte najlepší
4. **Náklady** - každý LoRA model môže mať iné náklady na Replicate

---

## 💡 Tipy

- Začnite s **jedným univerzálnym LoRA modelom** pre všetky štýly
- Postupne pridávajte **špecifické modely** pre každý štýl
- **Testujte rôzne váhy** (0.6 - 0.9) pre najlepšie výsledky
- **Kombinujte LoRA s prompt enhancement** pre najlepšiu kvalitu

