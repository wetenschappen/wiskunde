# 🤖 AI AGENT INSTRUCTIES - Complete Gids voor Lesson Planner

> **Laatste Update:** 2026-02-05  
> **Dit document:** Enige bron van waarheid voor AI agents  
> **Supersedes:** QUICK_START.md, README.md, IMPLEMENTATION_COMPLETE.md, OPTIMIZATION_PROPOSAL.md

---

## 📋 INHOUDSOPGAVE

1. [Quick Start: Nieuwe Les Maken](#-quick-start-nieuwe-les-maken)
2. [Projectstructuur](#-projectstructuur)
3. [Complete Data Referentie](#-complete-data-referentie)
4. [Presentation Slides Systeem](#-presentation-slides-systeem)
5. [Exit Ticket Systeem](#-exit-ticket-systeem)
6. [Icon Referentie](#-icon-referentie)
7. [Do's and Don'ts](#-dos-and-donts)
8. [Quality Checklist](#-quality-checklist)
9. [Troubleshooting](#-troubleshooting)
10. [Design System](#-design-system)
11. [Component Referentie](#-component-referentie)
12. [Cognitieve Principes](#-cognitieve-principes)

---

## 🚀 QUICK START: NIEUWE LES MAKEN

### ⏱️ Geschatte tijd: 2-3 minuten | 💰 Tokens: ~3K

### Stap 1: Kopieer Template
```javascript
// Kopieer src/lessons/_template.js naar src/lessons/jouw-les-naam.js
// Voorbeeld: src/lessons/chemie-zuren-basen.js
```

### Stap 2: Vul de 9 Secties In
```javascript
export default {
  // 1. METADATA (verplicht)
  id: 'vak-onderwerp',
  subject: 'physics',          // 'physics' | 'chemistry' | 'science'
  className: '4NWb',
  title: 'Les Titel',
  description: 'Subtitel',
  
  // 2. CONFIG (verplicht)
  config: { /* ... */ },
  
  // 3. GOALS (aanbevolen)
  goals: [ /* ... */ ],
  
  // 4. WORKBOOK (verplicht)
  workbook: { /* ... */ },
  
  // 5. TIMELINE (verplicht)
  timeline: { /* ... */ },
  
  // 6. ACTIVITIES (verplicht)
  activities: { /* ... */ },
  
  // 7. SLIDES (verplicht voor presentatie)
  slides: [ /* ... */ ],
  
  // 8. EXIT TICKET (verplicht)
  exitTicket: { /* ... */ }
}
```

### Stap 3: Update App.vue Import
```javascript
// App.vue - regel ~4
import lessonData from './lessons/jouw-les-naam.js'
```

### Stap 4: Test
```bash
node ./node_modules/vite/bin/vite.js dev
# OF: npm run dev
```

---

## 📁 PROJECTSTRUCTUUR

```
src/
├── App.vue                           # Main orchestrator
├── main.js                           # Entry point
├── style.css                         # Global styles + Tailwind
├── data/
│   └── students.js                   # Student lists for name picker
├── lessons/
│   ├── _template.js                  # 📘 Template voor nieuwe lessen
│   ├── fysica-newton.js              # 📦 Voorbeeld les (referentie)
│   └── README.md                     # AI instructies (legacy)
└── components/
    ├── modals/
    │   ├── PresentationModal.vue     # Presentatie (gebruikt lessonData.slides)
    │   ├── ExitTicketModal.vue       # Exit ticket (gebruikt lessonData.exitTicket)
    │   ├── WorkbookModal.vue         # Werkboek instructies
    │   └── [Activity].vue            # 4 activity modals
    └── widgets/
        └── ...
```

---

## 📚 COMPLETE DATA REFERENTIE

### 1. METADATA (Verplicht)

```javascript
{
  id: 'vak-onderwerp',              // Kebab-case, uniek (localStorage key)
  subject: 'physics',               // 'physics' | 'chemistry' | 'science'
  className: '4NWb',                // Display naam klas
  title: 'De Wetten van Newton',    // Hoofdtitel (in header)
  description: 'Traagheid...',      // Ondertitel
}
```

---

### 2. CONFIG (Verplicht)

```javascript
config: {
  groenCode: 'F=MA',                // Code voor antwoordenblad
  groenAntwoord: 'kracht',          // Password voor uitwerkingen
  masterCode: 'einstein',           // Master override
  cursusLink: 'https://...',        // Link naar handboek
  classId: '4-Newton',              // ID uit src/data/students.js

  textbook: 'Focus 3 - T2'          // Handboek referentie

  // Optioneel: tuchtregels op de startslide
  disciplineRules: ['Gsm in de tas', 'Stilte bij instructie', 'Steek je hand op']
}
```

---

### 3. GOALS (Aanbevolen)

```javascript
goals: [
  'Ik kan de drie wetten van Newton in eigen woorden uitleggen',
  'Ik kan F = m · a toepassen in eenvoudige vraagstukken',
  'Ik kan alledaagse situaties koppelen aan de juiste wet van Newton'
  // 3-5 leerdoelen
]
```

---

### 4. WORKBOOK (Verplicht)

```javascript
workbook: {
  title: 'Werkboek: De Wetten van Newton',   // Titel in header
  subtitle: 'Fysica • Mechanica',            // Ondertitel
  instruction: 'Maak <strong>oefeningen 1-10</strong> op <strong>pagina 12-15</strong>.',

}
```

**Note:** Gebruik `<strong>` voor belangrijke woorden in `instruction`.

---

### 5. TIMELINE (Verplicht)

**Standaard structuur:** Start → Instructie → Oefening → etc.

```javascript
timeline: {
  // STEP A: Instructie
  stepA: {
    step: 'A',
    title: 'Instructie',
    time: '20 min',
    status: 'active',
    cards: [
      {
        id: 'card-pres',              // Uniek ID (progress tracking)
        type: 'class',                // 'class' | 'digital' | 'paper' | 'check'
        title: 'Demonstratie Titel',
        description: 'Wat doen leerlingen?',
        action: 'presentation'        // Zie Action Types
      }
    ]
  },
  
  // STEP B: Oefening
  stepB: {
    step: 'B',
    title: 'Begeleide Oefening',
    subtitle: 'Samen Werken',
    time: '30 min',
    cards: [
      { id: 'card-workbook', type: 'paper', title: '...', action: 'workbook' }
    ],
    extraActivities: [                  // 2-3 support/challenge activities
      { id: 'dragdrop', title: '...', category: 'Basis', icon: 'PhArrowsDownUp' }
    ]
  },
  
  // STEPS C, D, E: Normale flow
  stepC: { /* ... */ },
  stepD: { /* ... */ },
  stepE: { /* ... */ }
}
```

#### Card Types

| Type | Badge | Kleur | Gebruik |
|------|-------|-------|---------|
| `class` | Klassikaal | Rood | Leraar-geleide activiteiten |
| `digital` | Digitaal | Blauw | Online activiteiten |
| `paper` | Werkboek | Groen | Handboek oefeningen |
| `check` | Vastzetting | Paars | Toetsen, checks |

#### Action Types

| Action | Effect |
|--------|--------|
| `presentation` | Opent PresentationModal |
| `workbook` | Opent WorkbookModal |
| `exit-ticket` | Opent ExitTicketModal |
| `external-link` | Opent URL (+ `url` field) |
| `custom` | Alleen markeren als done |

---

### 5. ACTIVITIES (Verplicht)

#### 5.1 Drag & Drop
```javascript
dragDrop: {
  title: 'Begrippen Matchen',
  instruction: 'Sleep elk begrip naar de juiste definitie',
  pairs: [
    { term: 'Kracht (F)', definition: 'Eenheid: Newton (N)' },
    // Minimum 4, maximum 8 paren
  ]
}
```

#### 5.2 Fill Blanks
```javascript
fillBlanks: {
  title: 'Vul de Lege Plekken In',
  instruction: 'Typ het juiste woord of getal',
  questions: [
    { 
      sentence: 'De eenheid van kracht is de ___.', 
      answer: 'newton',              // Lowercase, exact
      hint: 'Denk aan de wetenschapper' 
    }
    // Minimum 4 vragen
  ]
}
```

#### 5.3 Category Sort
```javascript
categorySort: {
  title: 'Wetten Sorteren',
  instruction: 'Sleep elk item naar de juiste categorie',
  columns: [
    { id: 'cat1', label: '1ste Wet' },
    { id: 'cat2', label: '2de Wet' },
    { id: 'cat3', label: '3de Wet' }
    // 2-4 kolommen
  ],
  items: [
    { id: 'i1', text: 'Munt op glas', columnId: 'cat1' },
    // columnId MOET matchen met column.id!
    // Minimum 6 items (2 per kolom)
  ]
}
```



---

## 🎬 PRESENTATION SLIDES SYSTEEM

### Design Philosophy: "Classic PowerPoint with Modern UI"

Het presentatiesysteem is ontworpen als een klassieke PowerPoint maar met een frisse, professionele uitstraling:

- **Consistente structuur**: Elke slide heeft een header bar, content area en fixed footer
- **Linker uitlijning**: Titels en content zijn links uitgelijnd voor natuurlijke leesrichting
- **Compacte spacing**: ~40-64px padding, niet de over-the-top 80-96px van modernistisch design
- **Hiërarchische fonts**: Titels 2.5-3.5rem, content 1.4-1.8rem (veel leesbaarder)
- **Effen kleuren**: Geen constante gradients/blurs, subtiele borders voor structuur
- **Brand orange accent**: Enkel voor highlights, niet overal

### Beschikbare Layouts (20 types)

| Layout | Gebruik | Cognitive Principle |
|--------|---------|---------------------|
| `discipline` | **Auto-generated** - Tucht slide met cursus URL | — |
| `title` | Module introductie | — |
| `hero` | Emotionele hook, sectie opener | Dual Coding |
| `steps` | Leerdoelen (click-to-reveal) | Progressive Disclosure |
| `predict` | Activeer voorkennis | Generation Effect |
| `standard` | Definities, uitleg | — |
| `realworld` | Verbind met dagelijks leven | Concrete Examples |
| `big` | Key principles, takeaways | — |
| `equation` | Formules | — |
| `attention` / `task` | Kritieke informatie / Opdrachten | — |
| `multichoice` | Interactieve quiz | Retrieval Practice |
| `recap` | Mid-lesson check | Testing Effect |
| `summary` | Samenvatting punten | — |
| `celebration` | Module voltooiing | — |
| `split` | Tekst + afbeelding zij-aan-zij | — |
| `comparison` | Vergelijk twee concepten | — |
| `image-grid` | 2 afbeeldingen met captions | — |
| `image-grid-2` | 2 afbeeldingen met titels | — |
| `image-left` | Afbeelding links, tekst rechts | — |
| `image-hero` | Grote afbeelding boven, tekst onder | — |

### Slide Structuren

```javascript
slides: [
  // TITLE (verplicht als eerste)
  {
    layout: 'title',
    title: 'De Wetten van Newton',
    subtitle: 'Of: Waarom dingen bewegen',
    badge: 'Fysica • Mechanica',
    icon: 'atom'  // 'atom', 'flask', 'fire', 'drop', 'scales', 'lightbulb'
  },

  // HERO (aanbevolen - visuele impact)
  {
    layout: 'hero',
    title: 'Sir Isaac Newton',
    subtitle: 'De man die de zwaartekracht begreep',
    image: 'https://images.unsplash.com/...',
    credit: 'NASA/SpaceX'
  },

  // STEPS (leerdoelen)
  {
    layout: 'steps',
    title: 'Wat ga je leren?',
    steps: [
      { icon: 'flask', text: 'Traagheid begrijpen' },
      { icon: 'function', text: 'F = m · a toepassen' },
      { icon: 'lightbulb', text: 'Actie-Reactie herkennen' }
    ]
  },

  // PREDICT (activeer voorkennis)
  {
    layout: 'predict',
    title: 'Even nadenken',
    question: 'Als een bus plotseling remt, wat gebeurt er met jou?',
    hint: 'Denk aan je eigen beweging...',
    revealText: 'Je vliegt naar voren! (Traagheid)'
  },

  // STANDARD (uitleg)
  {
    layout: 'standard',
    title: 'Wet 1: De Traagheidswet',
    content: `Een voorwerp in rust blijft in rust.<br>
              Een voorwerp in beweging blijft bewegen.<br><br>
              Tenzij er een <strong>kracht</strong> op werkt.`
  },

  // REALWORLD (context)
  {
    layout: 'realworld',
    title: 'Toepassing: De Gordel',
    context: 'Veiligheid',
    example: 'Auto stopt abrupt, jij wilt doorvliegen met 100 km/u.',
    consequence: 'Zonder gordel vlieg je door de voorruit.',
    takeaway: 'De gordel levert de kracht om je traagheid te stoppen.'
  },

  // BIG (grote boodschap)
  {
    layout: 'big',
    title: 'Wet 2: De Hoofdwet',
    content: 'F = m · a',
    subtext: 'Kracht = massa × versnelling'
  },

  // EQUATION (formule uitleg)
  {
    layout: 'equation',
    title: 'De Formule',
    equation: 'F = 1000 N',
    parts: [
      { label: 'Massa (m)', items: ['Hoe zwaar is het?', 'm = 100 kg'], color: 'teal' },
      { label: 'Versnelling (a)', items: ['Hoe snel verandert v?', 'a = 10 m/s²'], color: 'violet' }
    ],
    note: 'Hoe zwaarder, hoe meer kracht nodig!'
  },

  // ATTENTION (waarschuwing)
  {
    layout: 'attention',
    title: 'Let op de eenheden!',
    content: 'Fysica werkt alleen als je de taal spreekt.',
    highlight: 'Massa is ALTIJD in kilogram (kg)!'
  },

  // MULTICHOICE (quiz)
  {
    layout: 'multichoice',
    title: 'Quiz: Space Walk',
    question: 'Een astronaut gooit een hamer weg. Wat gebeurt er?',
    options: [
      { id: 'A', text: 'Astronaut blijft stil.', correct: false },
      { id: 'B', text: 'Astronaut beweegt andere kant op.', correct: true },
      { id: 'C', text: 'Hamer valt naar beneden.', correct: false },
      { id: 'D', text: 'Beiden dezelfde kant op.', correct: false }
    ],
    explanation: 'Actie = Reactie! Hamer wegduwen duwt astronaut terug.'
  },

  // RECAP (check begrip)
  {
    layout: 'recap',
    title: 'Weet je het nog?',
    questions: [
      { q: 'Wat is de eenheid van Kracht?', a: 'Newton (N)' },
      { q: 'Wat is F als m=10 en a=2?', a: '20 Newton' }
    ]
  },

  // COMPARISON (twee concepten vergelijken)
  {
    layout: 'comparison',
    title: 'Massa vs. Gewicht',
    left: {
      title: 'Massa (m)',
      content: 'De hoeveelheid materie in een object. Blijft overal hetzelfde.',
      example: 'm = 70 kg',
      icon: 'scales'
    },
    right: {
      title: 'Gewicht (Fz)',
      content: 'De zwaartekracht die op massa werkt. Verschilt per planeet.',
      example: 'Fz = m × g',
      icon: 'arrow-down'
    }
  },

  // SPLIT (tekst + afbeelding)
  {
    layout: 'split',
    title: 'De Appel van Newton',
    content: 'De bekende anekdote legt de basis voor de zwaartekrachtswet.',
    image: './images/newton-apple.jpg'
  },

  // IMAGE-GRID (2 afbeeldingen)
  {
    layout: 'image-grid',
    title: 'Voorbeelden van Traagheid',
    images: [
      { src: './images/bus-remt.jpg', caption: 'Passagiers vliegen naar voren' },
      { src: './images/snelweg-file.jpg', caption: 'Auto\'s stoten op elkaar' }
    ]
  },

  // EXERCISE (step-by-step met S-toets reveal)
  {
    layout: 'exercise',
    title: 'Bereken de Kracht',
    context: 'Een auto van 1000 kg versnelt van 0 naar 20 m/s in 5 seconden.',
    steps: [
      { question: 'Wat is de versnelling?', answer: 'a = Δv / Δt = (20-0)/5 = 4 m/s²' },
      { question: 'Bereken F met F = m·a', answer: 'F = 1000 kg × 4 m/s² = 4000 N' }
    ]
  },

  // SUMMARY (samenvatting)
  {
    layout: 'summary',
    title: 'Samenvatting',
    items: [
      'Wet 1: <strong>Traagheid</strong> - dingen willen blijven doen wat ze deden.',
      'Wet 2: <strong>F = m · a</strong> - kracht kost moeite.',
      'Wet 3: <strong>Actie = Reactie</strong> - krachten komen in paren.'
    ]
  },

  // CELEBRATION (einde)
  {
    layout: 'celebration',
    title: 'Missie Volbracht!',
    subtitle: 'Je bent klaar voor de lancering.',
    stats: [
      { label: 'Wetten', value: '3' },
      { label: 'Status', value: 'GO' }
    ]
  }
]
```

### Special: Discipline Slide (Auto-Generated)

De eerste slide wordt **automatisch** gegenereerd op basis van `config.disciplineRules` en `config.cursusLink`:

- **4 tuchtregels** in compacte kaarten (icon + tekst)
- **Prominente URL sectie** in de onderste helft van de slide
- URL is groot genoeg voor leerlingen op de achterste rij (~2.2-4.5rem)
- Label: "Deze les is raadpleegbaar op"

**Geen actie nodig** - wordt automatisch toegevoegd als eerste slide wanneer `showDisciplineSlide: true`.

### Optimale Slide Flow

```
0. DISCIPLINE     — Vaste tucht-slide (altijd, auto-generated)
1. TITLE          — Module introductie
2. HERO           — Emotionele hook (optioneel)
3. STEPS          — "Wat ga je leren?"
4. PREDICT        — Activeer voorkennis
5-7. CONTENT      — Core teaching (standard, realworld, big)
8. EXERCISE       — Begeleide oefening (step-by-step reveal met S-toets)
9. RECAP          — Mid-lesson check
10-11. MORE       — Continue teaching
12. MULTICHOICE   — Actieve quiz
13. SUMMARY       — Consolideer
14. CELEBRATION   — Positieve afsluiting
```

**Verhouding:** 3 content slides : 1 interactive slide

---

## 📝 EXIT TICKET SYSTEEM

Exit ticket bevat quiz vragen voor einde les. `mood` en `finish` stappen worden automatisch toegevoegd.

```javascript
exitTicket: {
  questions: [
    // MULTIPLE CHOICE
    {
      id: 'q1',
      type: 'mc',                     // 'mc' of 'open'
      question: 'Wat is de eenheid van Kracht?',
      options: ['Kilogram (kg)', 'Newton (N)', 'Joule (J)', 'Watt (W)'],
      correct: 1                       // 0-indexed!
    },
    {
      id: 'q2',
      type: 'mc',
      question: 'Vul aan: F = ... · a',
      options: ['v (snelheid)', 'g (zwaartekracht)', 'm (massa)', 't (tijd)'],
      correct: 2
    },
    
    // OPEN VRAAG
    {
      id: 'open',
      type: 'open',
      question: 'Open Vraag',
      description: 'Leg uit waarom een vrachtwagen moeilijker stopt dan een fiets.'
    }
    // 3-5 vragen aanbevolen
  ]
}
```

---

## 🎯 ICON REFERENTIE

### Phosphor Icons voor Extra Activities

```javascript
PhArrowsDownUp    → Drag & Drop, Match
PhTextAa          → Fill Blanks, Vocabulaire
PhDiamondsFour    → Category Sort, Classificatie

PhTarget          → Assessment
PhCheck           → Check/Toets
PhInfo            → Informatie
PhPresentationChart → Presentatie
PhGameController  → Simulatie/Game
PhFlask           → Lab/Experiment
PhRocket          → Advanced
PhHandHeart       → Samenwerken
PhBookOpen        → Werkboek
```

### Slide Icons

```javascript
// Voor layout: 'title' of 'steps'
icon: 'atom'           // Fysica
icon: 'flask'          // Chemie algemeen
icon: 'fire'           // Reacties
icon: 'drop'           // Vloeistoffen
icon: 'scales'         // Evenwicht
icon: 'lightbulb'      // Idee/inzicht
icon: 'function'       // Formules
icon: 'arrows-out-simple'  // Krachten
```

---

## ⚠️ DO'S AND DON'TS

### ✅ DO'S

- ✅ Gebruik exact de veld namen uit template (case-sensitive!)
- ✅ Geef elk card een uniek `id` (voor progress tracking)
- ✅ Zorg dat `columnId` matcht met `column.id` (category sort)
- ✅ Gebruik 0-indexed voor `correct` in exitTicket
- ✅ Houd tijd realistisch (totaal ~90 min max)
- ✅ Gebruik HTML in slides (`<strong>`, `<br>`, `<em>`)
- ✅ Test na elke wijziging
- ✅ Gebruik Phosphor Icons voor alle icons

### ❌ DON'TS

- ❌ Gebruik NOOIT emojis in UI teksten
- ❌ Specificeer geen `meta` field meer (is verwijderd)
- ❌ Gebruik geen `font-black` (te agressief)
- ❌ Gebruik geen arbitrary spacing (p-7, mb-11)
- ❌ Modificeer PresentationModal scaling logic NIET

---

## 📊 QUALITY CHECKLIST

Voordat je een les indient, check:

### Data Structuur
- [ ] Alle 4 activities hebben minimaal 4 items
- [ ] Exit ticket heeft 3-5 vragen
- [ ] Timeline heeft stappen A, B, C, D, E
- [ ] Elke card heeft uniek `id`

### Slides
- [ ] Begint met `title` layout
- [ ] Eindigt met `celebration` layout
- [ ] Bevat minstens 1 `predict` en 1 `recap`
- [ ] Bevat minstens 1 `multichoice` quiz
- [ ] Verhouding ~3:1 content:interactive

### Algemeen
- [ ] Tijden tellen op tot ~80-100 minuten
- [ ] Config heeft alle vereiste velden
- [ ] Geen emojis gebruikt
- [ ] Icons zijn valide Phosphor icon namen

---

## 🔧 TROUBLESHOOTING

**Q: "Import error in App.vue"**  
A: Check of filename exact matcht: `import lessonData from './lessons/exact-filename.js'`

**Q: "Activities niet zichtbaar"**  
A: Controleer of `extraActivities` ids matchen met `activities` keys  
   (bijv. `dragdrop` → `dragDrop`)

**Q: "Slides werken niet"**  
A: Controleer of `slides` array in lessonData bestaat en correct gestructureerd is

**Q: "Exit ticket leeg"**  
A: Controleer of `exitTicket.questions` array bestaat

**Q: "npm geblokkeerd"**  
A: Gebruik: `node ./node_modules/vite/bin/vite.js dev`

**Q: "Timeline status incorrect"**  
A: Status wordt automatisch bepaald. Gebruik alleen `status: 'active'` voor stepA.

---

## 🎨 DESIGN SYSTEM

### Kleuren

| Rol | Kleur | Tailwind | Gebruik |
|-----|-------|----------|---------|
| Primary | Amber/Orange | `amber-500` | Timeline, mission briefing |
| Secondary | Indigo | `indigo-600` | Buttons, links |
| Success | Emerald | `emerald-500` | Completed, default route |
| Challenge | Violet | `violet-500` | Advanced route |
| Warning | Amber | `amber-400` | Help panels |
| Neutral | Slate | `slate-700` | Text, borders |

### Spacing (8-point grid)

```css
/* Standaard */
p-4 (16px), p-6 (24px), p-8 (32px)
gap-4,6,8  mb-4,6,8

/* NOOIT: p-7, mb-11, gap-5 */
```

### Border Radius

```css
rounded-2xl (16px)  /* Cards */
rounded-xl (12px)   /* Kleine elementen */
rounded-lg (8px)    /* Badges/pills */
```

---

## 🧩 COMPONENT REFERENTIE

### Modals

| Component | Props | Werking |
|-----------|-------|---------|
| `PresentationModal` | `:slides`, `:isOpen` | Biedt full-screen slides aan. `discipline` slide wordt *automatisch* als eerste slide toegevoegd aan de eerste theorie module van de les. Druk `'S'` om de leerkrachtmodus en antwoorden te ontgrendelen. |
| `ExitTicketModal` | `:questions`, `:isOpen` | Leest `lessonData.exitTicket.questions` |
| `WorkbookModal` | `:config`, `:workbook`, `:isOpen` | Leest `lessonData.workbook` |

### Activity Modals

| Component | Data Bron |
|-----------|-----------|
| `DragDropActivity` | `lessonData.activities.dragDrop` |
| `FillBlanksActivity` | `lessonData.activities.fillBlanks` |
| `CategorySortActivity` | `lessonData.activities.categorySort` |


---

## 🧠 COGNITIEVE PRINCIPES

| Principe | Implementatie | Slide Layout |
|----------|---------------|--------------|
| Generation Effect | Voorspelling voordat je leert | `predict` |
| Testing Effect | Retrieval practice | `multichoice`, `recap` |
| Dual Coding | Tekst + beeld samen | `hero`, `split` |
| Concrete Examples | Alledaagse voorbeelden | `realworld` |
| Progressive Disclosure | Click-to-reveal | `steps` |
| Spaced Repetition | Activities verspreid over timeline | extraActivities |

---

## ⌨️ KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| `N` | Name Picker |
| `C` | Commander Cat background |
| `R` | Reset all progress |
| `←` `→` | Navigate slides |
| `Space` | Reveal/advance |
| `S` | Onthul volgende stap (exercise/steps) - navigeert NIET |
| `Esc` | Close modals |

---

## 📂 localStorage Keys

| Key | Purpose |
|-----|---------|
| `planner-route-${lessonId}` | Route assignment |
| `${lessonId}` | Progress (done items) |
| `planner-goals-${lessonId}` | Checked objectives |
| `planner-help-usage` | Help usage tracking |
| `planner-show-watermark` | Background toggle |

---

## 🚀 VOORBEELD: COMPLETE LES IN 2 MINUTEN

```
USER: "Maak een les over Zuren en Basen voor 5NW"

AI WORKFLOW:
1. ✅ Lees dit document (AI_AGENT_INSTRUCTIONS.md)
2. ✅ Kopieer _template.js naar chemie-zuren-basen.js
3. ✅ Vul metadata, config, goals in
4. ✅ Schrijf timeline (5 steps)
5. ✅ Maak "Holy 5" activities
6. ✅ Schrijf 10-15 slides
7. ✅ Maak exit ticket (5 vragen)
8. ✅ Update App.vue import
9. ✅ Test met dev server

⏱️ Tijd: 2-3 minuten
💰 Tokens: ~3K
```

---

## 📝 OPTIONELE SECTIES

### Olympiad (alleen voor advanced)

```javascript
olympiad: {
  title: 'Junior Natuurwetenschappen Olympiade',
  challenges: [
    {
      year: 2024,
      questionNumber: 5,
      pdfPage: 3,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',           // String!
      explanation: 'Uitleg waarom B'
    }
  ]
}
```

### Spot Check (klassikale check)

```javascript
spotCheck: {
  title: 'Weten we het nog?',
  questions: [
    { question: 'Vraag voor de klas?', answer: 'Antwoord' }
  ]
}
```

---

**📌 Dit document is de enige bron van waarheid voor AI agents.**

**Laatste update:** 2026-02-05  
**Compatibel met:** Planner v2.0
