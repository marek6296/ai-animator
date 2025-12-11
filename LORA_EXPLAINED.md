# 🎨 LoRA Model - Čo to je a či ho potrebujete?

## Čo je LoRA model?

**LoRA** (Low-Rank Adaptation) je špeciálny typ AI modelu, ktorý:
- Umožňuje "naučiť" Stable Diffusion konkrétny štýl alebo postavu
- Je malý a rýchly (niekoľko MB)
- Môže byť trénovaný na vlastných dátach
- Môže zmeniť štýl generovaných obrázkov

## Potrebujem ho?

### ❌ NIE - LoRA model NIE JE povinný!

Aplikácia funguje aj bez LoRA modelu:
- ✅ **Bez LoRA**: Použije sa štandardný SDXL model
- ✅ **S LoRA**: Použije sa SDXL + váš vlastný štýl

**Záver:** LoRA je voliteľné vylepšenie, nie požiadavka!

---

## Kedy by ste chceli LoRA model?

### 1. Ak chcete konzistentný štýl
- Všetky obrázky budú v rovnakom štýle
- Napríklad: všetky komiksy v anime štýle

### 2. Ak chcete konkrétnu postavu
- Môžete trénovať LoRA na konkrétnej postave
- Postava bude vyzerať rovnako vo všetkých obrázkoch

### 3. Ak chcete špecifický štýl
- Komiksový štýl, realistický, anime, atď.
- LoRA "naučí" SDXL váš preferovaný štýl

---

## Ako získať LoRA model?

### Možnosť 1: Použiť existujúci LoRA z Replicate

1. Choďte na: **https://replicate.com/models**
2. Vyhľadajte "SDXL LoRA" alebo "LoRA"
3. Nájdite model, ktorý sa vám páči
4. Skopírujte model ID (napr. `username/model-name`)
5. Pridajte do `.env`:
   ```env
   LORA_MODEL=username/model-name
   ```

**Príklady populárnych LoRA modelov:**
- Komiksový štýl
- Anime štýl
- Realistický štýl
- Špecifické postavy

### Možnosť 2: Vytvoriť vlastný LoRA model

**Čo potrebujete:**
- 20-50 obrázkov v rovnakom štýle
- GPU (alebo cloud službu)
- Trénovací nástroj (napr. Kohya SS)

**Postup:**
1. Zbierte obrázky v štýle, ktorý chcete
2. Trénujte LoRA pomocou Kohya SS alebo podobného nástroja
3. Upload model na Replicate alebo vlastný server
4. Použite model ID v aplikácii

**Nástroje na trénovanie:**
- **Kohya SS** - najpopulárnejší nástroj
- **Google Colab** - bezplatné GPU pre trénovanie
- **RunPod** - cloud GPU služba

---

## Odporúčanie

### Pre začiatok:
**NEPRIDÁVAJTE LoRA model** - aplikácia funguje výborne aj bez neho!

### Ak chcete vylepšiť:
1. Najprv otestujte aplikáciu bez LoRA
2. Ak chcete konzistentný štýl, nájdite vhodný LoRA na Replicate
3. Ak chcete úplne vlastný štýl, trénujte vlastný LoRA

---

## Ako pridať LoRA model (ak ho máte)

### Lokálne (.env):
```env
LORA_MODEL=username/your-lora-model
LORA_WEIGHT=0.8
```

### Na Vercel:
1. Settings → Environment Variables
2. Pridajte `LORA_MODEL` = `username/your-lora-model`
3. Pridajte `LORA_WEIGHT` = `0.8` (voliteľné)
4. Redeploy

---

## Súhrn

- ❌ **LoRA NIE JE povinný** - aplikácia funguje bez neho
- ✅ **LoRA je voliteľné vylepšenie** - pre konzistentný štýl
- 🎯 **Začnite bez LoRA** - otestujte aplikáciu najprv
- 🚀 **Pridajte LoRA neskôr** - ak chcete špecifický štýl

**Záver:** Pre teraz **NEPOTREBUJETE** LoRA model. Aplikácia funguje výborne aj bez neho!


