# Easy Trip 🗺️

Inteligentný plánovač výletov po Európe. Získajte personalizované tipy na destinácie, aktivity a miesta na návštevu pomocou umelnej inteligencie a Google Places API.

## Funkcie

- 🏛️ **Pamiatky** - Objavte najkrajšie historické pamiatky a múzeá
- 🎯 **Aktivity** - Nájdite zábavné aktivity a zážitky
- 🍽️ **Reštaurácie** - Odporučenia na najlepšie reštaurácie a kaviarne
- 🏨 **Ubytovanie** - Tipy na ubytovanie
- 💡 **Tipy** - Praktické rady a užitočné informácie
- 📍 **Google Maps integrácia** - Presné fotky a informácie z Google Maps
- 🎨 **Moderný dizajn** - Futuristické UI s animáciami

## Požiadavky

- Node.js 18+ 
- npm alebo yarn
- OpenAI API kľúč (pre GPT-4 - generovanie popisov a plánov)
- Google Places API (New) kľúč (pre vyhľadávanie miest a fotiek)

## Inštalácia

1. Nainštalujte závislosti:
```bash
npm install
```

2. Vytvorte `.env` súbor v koreňovom adresári:
```env
# OpenAI API (pre text a generovanie plánov)
OPENAI_API_KEY=your_openai_api_key_here

# Google Places API (pre vyhľadávanie miest a fotiek)
GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
```

**Poznámka:** Pre detailné nastavenie Google Places API pozrite si [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

3. Spustite vývojový server:
```bash
npm run dev
```

4. Otvorte [http://localhost:3000](http://localhost:3000) v prehliadači

## Použitie

1. Vyplňte formulár:
   - **Mesto** - Vyberte destináciu pomocou Google Places Autocomplete
   - **Kategórie** - Vyberte, čo chcete hľadať (pamiatky, aktivity, reštaurácie, ubytovanie, tipy)
   - **Špeciálne požiadavky** - Vyberte požiadavky (bezbariérový prístup, vhodné pre deti, atď.)

2. Kliknite na "Vytvoriť výlet"

3. Počkajte na vygenerovanie (môže trvať niekoľko minút)

4. Prezrite si výsledky s presnými fotkami z Google Maps

5. Kliknite na akékoľvek miesto pre detailné informácie

## Technológie

- **Next.js 14** - React framework
- **TypeScript** - Typovaný JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animácie
- **OpenAI API** - GPT-4 pre generovanie plánov a popisov
- **Google Places API (New)** - Vyhľadávanie miest a fotiek
- **Server-Sent Events (SSE)** - Real-time progress updates

## Deployment

### GitHub & Vercel

Projekt je nasadený na Vercel pod názvom **easy-trip.sk**.

Pre kompletné inštrukcie na nasadenie na GitHub a Vercel, pozrite si [DEPLOYMENT.md](./DEPLOYMENT.md).

**Rýchly štart:**

1. **GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. **Vercel:**
   - Choďte na https://vercel.com
   - Importujte váš GitHub repozitár
   - Pridajte Environment Variables:
     - `OPENAI_API_KEY`
     - `GOOGLE_API_KEY`
     - `NEXT_PUBLIC_GOOGLE_API_KEY`
   - Deploy!

Vercel automaticky nasadí novú verziu pri každom push na GitHub! 🚀

## Poznámky

- Generovanie môže trvať niekoľko minút, pretože sa vyhľadávajú miesta a generujú popisy
- Uistite sa, že máte dostatočný kredit na OpenAI účte
- Google Places API má rate limits, takže veľké požiadavky môžu trvať dlhšie
- Všetky fotky sú z Google Maps, takže sú presné a relevantné

## Licencia

MIT
