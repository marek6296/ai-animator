# 🎨 Nastavenie Stable Diffusion SDXL + LoRA

## Prečo Stable Diffusion?

- **SDXL** - Najnovšia verzia Stable Diffusion s lepšou kvalitou
- **LoRA** - Vlastné trénované modely pre špecifické štýly/postavy
- **Nižšie náklady** - Lacnejšie ako DALL-E 3
- **Viac kontroly** - Viac možností na prispôsobenie

## Nastavenie

### 1. Získajte Replicate API Token

1. Choďte na https://replicate.com
2. Vytvorte účet alebo sa prihláste
3. Choďte na https://replicate.com/account/api-tokens
4. Vytvorte nový API token
5. Skopírujte token

### 2. Vytvorte alebo nájdite LoRA model

**Možnosť A: Použiť existujúci LoRA model na Replicate**
- Prehľadávajte https://replicate.com/models
- Nájdite SDXL LoRA model, ktorý chcete použiť
- Skopírujte model ID (napr. `username/model-name`)

**Možnosť B: Vytvoriť vlastný LoRA model**
- Trénujte LoRA model pomocou nástrojov ako Kohya SS
- Upload model na Replicate alebo vlastný server
- Použite model ID v konfigurácii

### 3. Nastavenie Environment Variables

Pridajte do `.env` súboru:

```env
# Replicate API (pre Stable Diffusion)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# SDXL Model (voliteľné, default je stability-ai/sdxl)
SDXL_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b

# LoRA Model (voliteľné, ak máte vlastný LoRA)
LORA_MODEL=username/your-lora-model

# LoRA Weight (0.0 - 1.0, default 0.8)
LORA_WEIGHT=0.8

# SDXL nastavenia
SDXL_STEPS=30
SDXL_GUIDANCE=7.5

# Ak chcete použiť DALL-E 3 namiesto SDXL, nastavte:
USE_STABLE_DIFFUSION=false

# OpenAI API (stále potrebné pre text a prompty)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Pre Vercel

Pridajte tieto Environment Variables v Vercel dashboarde:
- `REPLICATE_API_TOKEN`
- `LORA_MODEL` (ak používate)
- `LORA_WEIGHT` (voliteľné)
- `SDXL_MODEL` (voliteľné)
- `USE_STABLE_DIFFUSION=true` (alebo nechajte prázdne)

## Ako to funguje

1. **Text a prompty** → Stále cez OpenAI GPT-4
2. **Obrázky** → Stable Diffusion SDXL + LoRA cez Replicate API

## Príklady LoRA modelov

- **Komiksový štýl**: `username/comic-style-lora`
- **Anime štýl**: `username/anime-lora`
- **Realistický štýl**: `username/realistic-lora`
- **Vlastný štýl**: Váš vlastný trénovaný model

## Troubleshooting

**Chyba: "REPLICATE_API_TOKEN nie je nastavený"**
- Skontrolujte, či je token v `.env` súbore
- Skontrolujte, či je token správny

**Chyba: "Generovanie trvalo príliš dlho"**
- Znížte `SDXL_STEPS` (napr. na 20)
- Skontrolujte, či Replicate API funguje

**Obrázky sú pomalé**
- SDXL generovanie trvá 10-30 sekúnd
- To je normálne, SDXL je výpočtovo náročnejší

**LoRA nefunguje**
- Skontrolujte, či je `LORA_MODEL` správne nastavený
- Skontrolujte, či máte prístup k modelu na Replicate
- Skúste zmeniť `LORA_WEIGHT` (0.5 - 1.0)

## Náklady

- **Replicate**: ~$0.002 - $0.01 per obrázok (závisí od modelu)
- **OpenAI**: Stále potrebné pre text (GPT-4)

## Alternatívy

Ak nechcete použiť Replicate, môžete:
- Nastaviť vlastný server so Stable Diffusion
- Použiť inú službu (Stability AI, Hugging Face, atď.)
- Upraviť `stableDiffusionService.ts` pre iný API


