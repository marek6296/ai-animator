# Nastavenie Pexels API pre lepšie obrázky

Pexels API poskytuje bezplatný prístup k vysokokvalitným fotografiám. S API key získate viac requestov a lepšie výsledky.

## ✅ Krok 1: Získajte Pexels API Key

1. **Choďte na**: https://www.pexels.com/api/
2. **Kliknite na "Get Started"** alebo **"Sign Up"**
3. **Vytvorte účet** (alebo sa prihláste, ak už máte účet)
   - Môžete použiť Google, Facebook alebo email
4. **Po prihlásení**:
   - Choďte na "Your API Key" alebo "Dashboard"
   - Uvidíte svoj API key (začína napr. `563492ad6f91700001000001...`)
   - **Skopírujte** celý API key

## 📝 Krok 2: Pridajte do .env súboru

1. **Otvorte `.env` súbor** v root adresári projektu
2. **Pridajte** tento riadok:
   ```env
   PEXELS_API_KEY=563492ad6f91700001000001...váš_skutočný_key
   ```
3. **Nahraďte** `563492ad6f91700001000001...váš_skutočný_key` skutočným API key

**Príklad:**
```env
PEXELS_API_KEY=563492ad6f91700001000001abc123def456
```

## 🚀 Krok 3: Pre Vercel (ak používate Vercel)

1. Choďte do Vercel projektu
2. **Settings** → **Environment Variables**
3. Pridajte:
   - **Key**: `PEXELS_API_KEY`
   - **Value**: váš API key (napr. `563492ad6f91700001000001...`)
4. **Redeploy projekt** (Settings → Deployments → Redeploy)

## ✅ Krok 4: Reštartujte server

```bash
# Zastavte server (Ctrl+C)
# Spustite znova:
npm run dev
```

## 📊 Limity

- **Bez API key**: 200 requestov/hodinu
- **S API key**: 20,000 requestov/hodinu
- **Bezplatné**: Áno, Pexels API je bezplatné

## 🧪 Krok 5: Overenie

Po nastavení skúste vygenerovať nový plán výletu. V konzole (F12 → Console) by ste mali vidieť:
- `✓ Pexels found image for "..."` - ak sa obrázky našli cez Pexels

## ❓ Časté problémy

**"Neviem, kde nájsť API key"**
- Po prihlásení choďte na https://www.pexels.com/api/
- Alebo choďte na "Your Account" → "API"

**"API key nefunguje"**
- Skontrolujte, či ste skopírovali celý key (niekedy je dlhý)
- Skontrolujte, či nie sú medzery pred alebo za key
- Reštartujte server po pridaní do `.env`

**"Stále používa placeholder"**
- Skontrolujte, či je `PEXELS_API_KEY` správne nastavený v `.env`
- Skontrolujte konzolu - možno Pexels nenašiel obrázok pre konkrétne query
- To je v poriadku - aplikácia použije Google API alebo placeholder

## 💡 Tipy

- Pexels API je bezplatné a poskytuje vysokokvalitné fotografie
- S API key získate viac requestov a lepšie výsledky
- Aplikácia automaticky použije Pexels, ak je API key nastavený
- Ak Pexels nenašiel obrázok, aplikácia skúsi Google API alebo použije placeholder

