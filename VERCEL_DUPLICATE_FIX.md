# 🔧 Riešenie duplicitných projektov na Vercel

## Problém:
Máte 2 projekty na Vercel:
1. `ai-animator-9k2b` → `ai-animator-9k2b.vercel.app`
2. `ai-animator` → `ai-animator-lemon.vercel.app`

Oba sú z toho istého GitHub repozitára `marek6296/ai-animator`.

## Riešenie:

### Krok 1: Rozhodnite sa, ktorý projekt chcete zachovať

**✅ ROZHODNUTÉ:** Zachovať `ai-animator` (druhý projekt) - už máte nastavený API kľúč!

**❌ ZMAZAŤ:** `ai-animator-9k2b` (prvý projekt)

### Krok 3: Zmazanie duplicitného projektu

**Pre projekt `ai-animator-9k2b`:**

1. Kliknite na projekt **`ai-animator-9k2b`** v zozname projektov
2. Choďte na záložku **"Settings"** (v hornej navigácii)
3. Scrollujte úplne dole na stránku
4. Nájdite sekciu **"Danger Zone"** alebo **"Delete Project"**
5. Kliknite na **"Delete Project"** alebo **"Remove Project"**
6. Potvrďte zmazanie (budete musieť napísať názov projektu)

### Krok 4: ✅ Hotovo!

Projekt **`ai-animator`** už má nastavený `OPENAI_API_KEY`, takže je pripravený na použitie!

### Krok 5: (Voliteľné) Zmena názvu projektu

Ak chcete, aby projekt mal presný názov "ai-animator":

1. V projekte `ai-animator` choďte na **"Settings"** → **"General"**
2. Nájdite **"Project Name"**
3. Zmeňte na `ai-animator` (ak ešte nie je)
4. Uložte

---

## Alternatívne riešenie (ak chcete zachovať oba):

Môžete zachovať oba projekty, ale:
- Jeden použite pre **Production**
- Druhý pre **Testing/Development**

Ale odporúčam zmazať jeden, aby ste nemali zmätok.

---

## Ako sa to stalo?

Pravdepodobne ste:
- Importovali projekt dvakrát
- Alebo Vercel automaticky vytvoril nový projekt pri nejakej zmene v repozitári

---

## ⚠️ Dôležité pred zmazaním:

1. **Skontrolujte Environment Variables** v oboch projektoch
2. **Skontrolujte, ktorý projekt je aktívne nasadený**
3. **Uistite sa, že zachovaný projekt má všetko správne nastavené**

---

## Po zmazaní:

- Váš web bude dostupný len na jednom URL
- GitHub repozitár zostane pripojený len k jednému projektu
- Nové commity budú automaticky nasadené len do jedného projektu

