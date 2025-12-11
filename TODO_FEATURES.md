# 📋 TODO - Funkcie pre aplikáciu

## 🔥 Vysoká priorita (základná funkcionalita)

### 1. Progress tracking
- [ ] Zobrazenie progress baru počas generovania
- [ ] Zobrazenie, ktorá časť sa práve generuje (komiks/animácia/meme)
- [ ] Odhadovaný čas do dokončenia

### 2. Stiahnutie výsledkov
- [ ] Stiahnutie celého komiksu ako PDF
- [ ] Stiahnutie jednotlivých panelov
- [ ] Stiahnutie animácie ako GIF (alebo všetkých rámcov)
- [ ] Stiahnutie meme packu ako ZIP
- [ ] Tlačidlo "Stiahnuť všetko"

### 3. Zrušenie generovania
- [ ] Tlačidlo "Zrušiť" počas generovania
- [ ] Cleanup pri zrušení (zastavenie API volaní)

### 4. Lepšie error handling
- [ ] Retry tlačidlo pri chybe
- [ ] Detailnejšie error messages
- [ ] Možnosť pokračovať od miesta zlyhania

## 🎨 Stredná priorita (UX vylepšenia)

### 5. Animácia - automatické prehrávanie
- [ ] Automatické prehrávanie rámcov animácie
- [ ] Kontrola rýchlosti prehrávania
- [ ] Možnosť pauzovať/play

### 6. Dark mode toggle
- [ ] Prepínanie dark/light módu
- [ ] Uloženie preferencie do localStorage

### 7. Validácia formulára
- [ ] Real-time validácia počas písania
- [ ] Zobrazenie počtu znakov
- [ ] Tipy pre lepšie výsledky

### 8. História generovaní
- [ ] Uloženie do localStorage
- [ ] Zobrazenie histórie
- [ ] Možnosť znovu použiť predchádzajúce vstupy

## 🚀 Nízka priorita (nice to have)

### 9. Zdieľanie
- [ ] Generovanie zdieľateľného odkazu
- [ ] Zdieľanie na sociálne siete
- [ ] Embed kód pre výsledky

### 10. Pokročilé možnosti
- [ ] Výber štýlu komiksu (realistický, kreslený, anime...)
- [ ] Výber počtu panelov
- [ ] Výber počtu rámcov animácie
- [ ] Výber počtu memov

### 11. Optimalizácia
- [ ] Cachovanie výsledkov
- [ ] Paralelné generovanie (ak je to možné)
- [ ] Kompresia obrázkov

### 12. Analytics
- [ ] Počítadlo generovaní
- [ ] Štatistiky používania

---

## 🎯 Odporúčaný poriadok implementácie:

1. **Progress tracking** - používateľ musí vedieť, čo sa deje
2. **Stiahnutie výsledkov** - základná funkcionalita
3. **Zrušenie generovania** - používateľská kontrola
4. **Lepšie error handling** - lepšia UX pri chybách
5. **Animácia prehrávanie** - lepšie zobrazenie výsledkov
6. **Dark mode** - pohodlie používateľa
7. **História** - užitočná funkcia
8. **Ostatné** - podľa potreby

---

## 💡 Nápady na budúcnosť:

- Export do rôznych formátov (PNG, JPG, PDF, GIF)
- AI vylepšenie existujúcich obrázkov
- Batch generovanie (viacero príbehov naraz)
- Templates pre rýchle generovanie
- Užívateľské účty a cloud storage
- API pre integráciu s inými aplikáciami


