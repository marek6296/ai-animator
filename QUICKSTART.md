# Rýchly štart 🚀

## 1. Inštalácia závislostí

```bash
npm install
```

## 2. Nastavenie OpenAI API kľúča

Vytvorte súbor `.env` v koreňovom adresári projektu:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Ako získať API kľúč:**
1. Choďte na https://platform.openai.com/api-keys
2. Prihláste sa alebo vytvorte účet
3. Vytvorte nový API kľúč
4. Skopírujte ho do `.env` súboru

## 3. Spustenie aplikácie

```bash
npm run dev
```

Aplikácia bude dostupná na: http://localhost:3000

## 4. Použitie

1. Vyplňte formulár:
   - **O sebe** - Opíšte seba (napr. "Som 25-ročný študent, ktorý miluje programovanie")
   - **Situácia** - Opíšte situáciu (napr. "Našli sme sa s kamarátmi v kaviarni")
   - **Kamarátov** - Opíšte kamarátov (napr. "Marek - vtipný programátor, Ján - milovník prírody")

2. Kliknite na "Vytvoriť komiks, animáciu a meme pack"

3. Počkajte na vygenerovanie (môže trvať 2-5 minút)

4. Prezrite si výsledky!

## ⚠️ Dôležité poznámky

- **Náklady**: Každé generovanie používa OpenAI API (DALL-E 3 a GPT-4), čo môže stáť niekoľko dolárov
- **Čas**: Generovanie môže trvať niekoľko minút, pretože každý obrázok sa generuje individuálne
- **Rate Limits**: OpenAI má limity na počet požiadaviek za minútu

## 🛠️ Riešenie problémov

**Chyba: "OPENAI_API_KEY nie je nastavený"**
- Skontrolujte, či existuje `.env` súbor
- Skontrolujte, či je API kľúč správne nastavený v `.env` súbore

**Chyba: "Rate limit exceeded"**
- Počkajte chvíľu a skúste znova
- OpenAI má limity na počet požiadaviek

**Obrázky sa negenerujú**
- Skontrolujte, či máte dostatočný kredit na OpenAI účte
- Skontrolujte, či je API kľúč platný

