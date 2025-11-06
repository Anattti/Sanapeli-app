# 🎮 Englannin Sanaston Oppimispeli / English Vocabulary Learning Game

Hauska ja interaktiivinen englannin sanaston oppimispeli emojeilla. Sovellus tukee sekä suomea että englantia käyttöliittymäkielenä.

A fun and interactive English vocabulary learning game with emojis. The app supports both Finnish and English as UI languages.

## ✨ Ominaisuudet / Features

### 🎯 Kaksi pelitilaa / Two Game Modes
- **🧠 Harjoittele / Practice**: Selaa ja opi sanoja omaan tahtiin ilman painetta
- **🎮 Pelaa / Play**: Testaa osaamistasi monivalintakysymyksillä

### 🌍 Kaksikielinen / Bilingual
- Suomenkielinen käyttöliittymä oletuksena
- Englanninkielinen käyttöliittymä vaihtoehtona
- Vaihda kieltä milloin tahansa yläkulman painikkeesta

### 🎨 Moderni Design
- Pastellivärimaailma ja sarjakuvamainen tyyli
- Sujuvat animaatiot Framer Motionilla
- Täysin responsiivinen (toimii mobiililla, tabletilla ja työpöydällä)
- Emoji-kuvat tiedostojen sijaan

### 🧠 Adaptiivinen Oppiminen
- Algoritmi painottaa vaikeampia sanoja
- Väärät vastaukset näytetään useammin
- Edistyminen tallennetaan LocalStorageen
- Parhaat tulokset säilyvät

### 📊 Tulosseuranta
- Näe suorituksesi prosenttiosuutena
- Emoji-palaute tuloksen perusteella
- Konfetti-animaatio erinomaisille tuloksille (90%+)

## 🚀 Käynnistäminen / Getting Started

### Asenna riippuvuudet / Install dependencies
```bash
npm install
```

### Kehitysympäristö / Development server
```bash
npm run dev
```

Avaa selaimessa [http://localhost:3000](http://localhost:3000)

### Tuotantoversio / Production build
```bash
npm run build
npm start
```

## 🛠️ Teknologiat / Technologies

- **Next.js 16** - React-framework App Routerilla
- **TypeScript** - Tyyppiturvallisuus
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animaatiot ja siirtymät
- **LocalStorage** - Paikallinen tiedon tallennus
- **Google Fonts (Poppins)** - Pehmeä sans-serif -fontti

## 📂 Projektin Rakenne / Project Structure

```
/
├── app/                  # Next.js App Router -sivut
│   ├── page.tsx         # Päävalikko / Main menu
│   ├── practice/        # Harjoittelutila / Practice mode
│   ├── play/            # Pelitila / Game mode
│   ├── results/         # Tulossivu / Results page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Globaalit tyylit
├── components/          # Uudelleenkäytettävät komponentit
│   ├── Button.tsx
│   ├── EmojiCard.tsx
│   ├── GameHUD.tsx
│   ├── ChoiceButton.tsx
│   ├── LanguageToggle.tsx
│   └── PageTransition.tsx
├── contexts/            # React Context
│   └── LanguageContext.tsx
├── i18n/                # Käännökset / Translations
│   └── translations.ts
├── data/                # Data
│   └── words.ts         # Sanasto (46 sanaa)
├── utils/               # Apufunktiot
│   ├── storage.ts       # LocalStorage-toiminnot
│   └── gameLogic.ts     # Pelilogiikka ja adaptiivinen oppiminen
└── types/               # TypeScript-tyypit
    └── index.ts
```

## 📚 Sanasto / Vocabulary

Sovellus sisältää **46 englannin sanaa** kategorioittain:
- Retkeilyvälineet ja kodin tavarat (16 sanaa)
- Eläimet (6 sanaa)
- Ruoka (5 sanaa)
- Luonto ja ympäristö (6 sanaa)
- Liikenne (4 sanaa)
- Vaatteet (4 sanaa)
- Muuta (5 sanaa)

## 🎮 Käyttöohje / How to Use

1. **Aloita päävalikosta**: Valitse joko Harjoittele tai Pelaa
2. **Harjoittele-tila**: Klikkaa emoji-kortteja nähdäksesi englanninkieliset sanat
3. **Pelaa-tila**: Valitse oikea englanninkielinen sana emojille
4. **Tulokset**: Näe suorituksesi ja pelaa uudelleen

## 🌟 Erityisominaisuudet / Special Features

### Adaptiivinen Oppiminen
- Jokainen sana alkaa painolla 1
- Väärä vastaus: paino kasvaa (+1)
- Oikea vastaus: paino pienenee (-0.5, min 1)
- Seuraavassa pelissä painotetut sanat valitaan todennäköisemmin

### Animaatiot
- Korttien kääntyminen (rotateY 180°)
- Nappien hover- ja tap-efektit
- Emoji-pomppiminen sisään
- Siirtymät sivujen välillä
- Oikean vastauksen vihreä hehku
- Väärän vastauksen punainen tärinä

## 📱 Responsiivisuus / Responsiveness

- **Mobiili** (<640px): 2 saraketta, isot napit
- **Tabletti** (640-1024px): 3 saraketta
- **Työpöytä** (>1024px): 4-5 saraketta

## 🎨 Väripaletti / Color Palette

- **Taustat**: Sky blue (#E0F2FE), Mint (#D1FAE5), Lavender (#E9D5FF)
- **Kortit**: Peach (#FED7AA), Pink (#FBCFE8), Yellow (#FEF08A)
- **Tekstit**: Dark navy (#1E293B)

## 📄 Lisenssi / License

Tämä projekti on luotu oppimis- ja kehitystarkoituksiin.

## 🤝 Kehitys / Development

Projekti noudattaa Next.js 16 ja TypeScript parhaita käytäntöjä:
- Strict mode TypeScriptissä
- Client-komponentit merkitty 'use client' -direktiivillä
- Type guards LocalStorage-datalle
- Responsiiviset breakpointit
- Accessibility-huomioon otettu

---

**Tehty ❤️:llä Next.js 16:lla, TypeScriptillä ja Framer Motionilla**
