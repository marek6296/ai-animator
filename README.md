# AI Animator 🎨

Aplikácia pre vytváranie personalizovaných komiksov, animácií a meme packov pomocou umelnej inteligencie.

## Funkcie

- 🎭 **Komiksy** - AI vytvorí personalizovaný komiks na základe vášho príbehu
- 🎬 **Animácie** - Krátke animácie zachytávajúce vašu situáciu
- 😂 **Meme Pack** - Sada personalizovaných memov pre vás a vašich kamarátov

## Požiadavky

- Node.js 18+ 
- npm alebo yarn
- OpenAI API kľúč (pre GPT-4 - text a prompty)
- Replicate API token (pre Stable Diffusion SDXL + LoRA - obrázky)

## Inštalácia

1. Nainštalujte závislosti:
```bash
npm install
```

2. Vytvorte `.env` súbor v koreňovom adresári:
```env
# OpenAI API (pre text a prompty)
OPENAI_API_KEY=your_openai_api_key_here

# Replicate API (pre Stable Diffusion SDXL + LoRA)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Voliteľné: LoRA model (ak máte vlastný)
LORA_MODEL=username/your-lora-model
LORA_WEIGHT=0.8
```

**Poznámka:** Pre detailné nastavenie Stable Diffusion SDXL + LoRA pozrite si [STABLE_DIFFUSION_SETUP.md](./STABLE_DIFFUSION_SETUP.md)

3. Spustite vývojový server:
```bash
npm run dev
```

4. Otvorte [http://localhost:3000](http://localhost:3000) v prehliadači

## Použitie

1. Vyplňte formulár:
   - **O sebe** - Opíšte seba
   - **Situácia** - Opíšte situáciu, ktorú chcete zachytiť
   - **Kamarátov** - Opíšte svojich kamarátov

2. Kliknite na "Vytvoriť komiks, animáciu a meme pack"

3. Počkajte na vygenerovanie (môže trvať niekoľko minút)

4. Prezrite si výsledky a stiahnite si ich

## Technológie

- **Next.js 14** - React framework
- **TypeScript** - Typovaný JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animácie
- **OpenAI API** - GPT-4 pre text a prompty
- **Replicate API** - Stable Diffusion SDXL + LoRA pre obrázky

## Deployment

### GitHub & Vercel

Pre kompletné inštrukcie na nasadenie na GitHub a Vercel, pozrite si [DEPLOYMENT.md](./DEPLOYMENT.md).

**Rýchly štart:**

1. **GitHub:**
   ```bash
   # Spustite pomocný skript
   ./scripts/setup-github.sh
   
   # Alebo manuálne:
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. **Vercel:**
   - Choďte na https://vercel.com
   - Importujte váš GitHub repozitár
   - Pridajte Environment Variable: `OPENAI_API_KEY`
   - Deploy!

Vercel automaticky nasadí novú verziu pri každom push na GitHub! 🚀

## Poznámky

- Generovanie môže trvať niekoľko minút, pretože každý obrázok sa generuje individuálne
- Uistite sa, že máte dostatočný kredit na OpenAI účte
- DALL-E 3 má rate limits, takže veľké požiadavky môžu trvať dlhšie

## Licencia

MIT




