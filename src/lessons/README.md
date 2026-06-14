# 🤖 LESSON CREATION GUIDE (AI Agent Instructies)

> **⚠️ DEPRECATED:** Dit bestand is verplaatst naar `AI_AGENT_INSTRUCTIONS.md` in de root folder.
> 
> **Gebruik:** `/AI_AGENT_INSTRUCTIONS.md` voor complete, up-to-date instructies.
> 
> Dit bestand blijft bestaan voor backwards compatibility maar wordt niet meer onderhouden.

## 📋 QUICK START: Nieuwe Les Maken

### Stap 1: Kopieer Template
```bash
# Kopieer _template.js naar nieuwe naam
cp src/lessons/_template.js src/lessons/jouw-les-naam.js
```

### Stap 2: Vul Lesson Data In
Open `jouw-les-naam.js` en vul de 6 hoofdsecties in:

1. ✅ **METADATA** - Basis informatie
2. ✅ **CONFIG** - Codes en settings
3. ✅ **TIMELINE** - Lesstructuur (A → B → C → D → E)
4. ✅ **ACTIVITIES** - De "Holy 5" interactieve activiteiten
5. ✅ **ROUTE ASSESSMENT** - 4 vragen voor route bepaling
6. ✅ **OLYMPIAD** (optioneel) - Extra uitdagingen

### Stap 3: Update App.vue
```javascript
// App.vue - Regel 4 (ongeveer)
import lessonData from './lessons/jouw-les-naam.js'
```

### Stap 4: Test
```bash
npm run dev
```

---

## 📚 FIELD REFERENCE (Complete Beschrijving)

### 1. METADATA (Verplicht)

```javascript
{
  id: 'vak-onderwerp',              // Lowercase, kebab-case, uniek
  subject: 'physics',                // 'physics' | 'chemistry' | 'science'
  className: '4NWb',                 // Display naam van de klas
  title: 'De Wetten van Newton',    // Hoofdtitel (zichtbaar in header)
  description: 'Traagheid...',       // Ondertitel (onder titel)
}
```

**Regels:**
- `id` moet uniek zijn (wordt gebruikt voor localStorage keys)
- `subject` bepaalt automatisch het achtergrond icoon (PhPlanet vs PhFlask)

---

### 2. CONFIG (Verplicht)

```javascript
config: {
  groenCode: 'F=MA',                 // Code voor "groen antwoordenblad"
  groenAntwoord: 'kracht',           // Password om uitwerkingen te ontgrendelen
  masterCode: 'einstein',            // Master override (alles ontgrendelen)
  cursusLink: 'https://...',         // Link naar online cursus/handboek
  classId: '4-Newton',               // ID uit src/data/students.js
  
  prerequisites: [                   // Voorkennis (2-4 items)
    'Ik weet nog hoe ik snelheid bereken',
    'Ik weet wat een vector is'
  ],
  equipment: [                       // Benodigdheden (2-4 items)
    'Rekenmachine',
    'Tabel Waarden'
  ],
  textbook: 'Focus 3 - T2'           // Handboek referentie
}
```

---

### 3. TIMELINE (Verplicht)

**Standaard structuur:** A → B (route keuze) → B (route-specifiek) → C → D → E

#### Step A: Instructie (altijd)
```javascript
stepA: {
  step: 'A',
  title: 'Instructie',
  time: '20 min',
  status: 'active',                  // 'active' | 'pending' | 'done'
  cards: [
    {
      id: 'card-pres',               // Uniek ID (voor progress tracking)
      type: 'class',                 // 'class' | 'digital' | 'paper' | 'check'
      title: 'Presentatie Titel',
      description: 'Wat gaan leerlingen doen?',
      action: 'presentation'         // Trigger presentatie modal
    }
  ]
}
```

#### Step B: Route Bepaling (altijd)
```javascript
stepB_routeChoice: {
  step: 'B',
  title: 'Route Bepaling',
  time: '5 min',
  showUntil: 'route-chosen',         // Verberg na route keuze!
  cards: [
    {
      id: 'card-route-assessment',
      type: 'digital',
      title: 'Waar sta jij?',
      description: 'Bepaal je leerpad...',
      action: 'route-assessment'     // Trigger assessment modal
    }
  ]
}
```

#### Step B: Route-Specifieke Content
```javascript
stepB_default: {
  step: 'B',
  title: 'Begeleide Oefening',       // Voor zwakkere leerlingen
  time: '30 min',
  route: 'default',                   // Belangrijk!
  cards: [...],
  extraActivities: [                  // 2-3 ondersteuning activiteiten
    { id: 'dragdrop', title: '...', category: 'Basis', icon: 'PhArrowsDownUp' },
    { id: 'sequence', title: '...', category: 'Methodiek', icon: 'PhListBullets' }
  ]
},

stepB_advanced: {
  step: 'B',
  title: 'Zelfstandig Oefenen',      // Voor sterkere leerlingen
  time: '30 min',
  route: 'advanced',                  // Belangrijk!
  cards: [...],
  extraActivities: [                  // Alle 5 activiteiten
    { id: 'dragdrop', title: '...', category: 'Interactief', icon: 'PhArrowsDownUp' },
    { id: 'fillblanks', title: '...', category: 'Vocabulaire', icon: 'PhTextAa' },
    { id: 'sort', title: '...', category: 'Classificatie', icon: 'PhDiamondsFour' },
    { id: 'sequence', title: '...', category: 'Methodiek', icon: 'PhListBullets' },
    { id: 'truefalse', title: '...', category: 'Concept Check', icon: 'PhThumbsUp' }
  ]
}
```

#### Steps C, D, E: Normale Flow
```javascript
stepC: {
  step: 'C',
  title: 'Onderzoek',
  time: '25 min',
  cards: [...],
  spacedRepetition: [                 // Herhaling van eerdere activiteiten
    { id: 'dragdrop', title: '...' },
    { id: 'truefalse', title: '...' }
  ]
}
```

**Card Types:**

| Type | Badge | Gebruik | Icon Suggestie |
|------|-------|---------|----------------|
| `class` | Klassikaal (rood) | Leraar-geleide activiteiten | PhPresentationChart |
| `digital` | Digitaal (blauw) | Online activiteiten | PhGameController, PhTarget |
| `paper` | Werkboek (groen) | Handboek oefeningen | PhInfo |
| `check` | Vastzetting (paars) | Toetsen, checks | PhCheckCircle |

**Action Types:**

| Action | Effect |
|--------|--------|
| `presentation` | Opent PresentationModal |
| `workbook` | Opent WorkbookModal |
| `exit-ticket` | Opent ExitTicketModal |
| `route-assessment` | Opent RouteAssessmentModal |
| `external-link` | Opent URL (specificeer `url` field) |
| `custom` | Alleen markeren als done (geen modal) |

---

### 4. ACTIVITIES (De "Holy 5" - Verplicht)

#### 4.1 Drag & Drop
```javascript
dragDrop: {
  title: 'Begrippen Matchen',
  instruction: 'Sleep elk begrip naar de juiste definitie',
  pairs: [
    { term: 'Kracht (F)', definition: 'Eenheid: Newton (N)' },
    // Minimum 4 paren, maximum 8
  ]
}
```

#### 4.2 Fill Blanks
```javascript
fillBlanks: {
  title: 'Vul de Lege Plekken In',
  instruction: 'Typ het juiste woord of getal',
  questions: [
    { 
      sentence: 'De eenheid van kracht is de ___.', 
      answer: 'newton',              // Lowercase, exacte match
      hint: 'Denk aan de wetenschapper' 
    },
    // Minimum 4 vragen
  ]
}
```

**Tip:** Gebruik `___` (3 underscores) voor het invulveld

#### 4.3 Category Sort
```javascript
categorySort: {
  title: 'Wetten Sorteren',
  instruction: 'Sleep elk item naar de juiste categorie',
  columns: [
    { id: 'cat1', label: '1ste Wet (Traagheid)' },
    { id: 'cat2', label: '2de Wet (F=ma)' },
    { id: 'cat3', label: '3de Wet (Interactie)' }
    // 2-4 kolommen aanbevolen
  ],
  items: [
    { id: 'i1', text: 'Munt op glas', columnId: 'cat1' },
    // Minimum 6 items (2 per kolom), maximum 12
  ]
}
```

**Belangrijk:** `columnId` moet matchen met een `column.id`!

#### 4.4 Sequence
```javascript
sequence: {
  title: 'Stappenplan Oplossen',
  instruction: 'Zet de stappen in de juiste volgorde',
  steps: [
    'Stap 1: Teken de situatie',
    'Stap 2: Kies assenstelsel',
    'Stap 3: Noteer gegevens',
    'Stap 4: Pas formule toe',
    'Stap 5: Los op'
    // Minimum 4 stappen, maximum 7
  ]
}
```

#### 4.5 True/False
```javascript
trueFalse: {
  title: 'Feit of Fabel?',
  statements: [
    { 
      statement: 'Deze stelling is waar of onwaar', 
      isTrue: true,                   // Boolean!
      explanation: 'Uitleg waarom dit waar/onwaar is' 
    },
    // Minimum 4 statements
  ]
}
```

---

### 5. ROUTE ASSESSMENT (Verplicht)

**Precies 4 vragen** om leerlingen naar een route te leiden.

```javascript
routeAssessment: {
  threshold: 75,                      // >= 75% → advanced, < 75% → default
  questions: [
    {
      id: 'q1',                       // Uniek ID
      question: 'Wat zegt de eerste wet van Newton?',
      options: [
        'Optie A',
        'Optie B - Correct',
        'Optie C',
        'Optie D'
      ],
      correct: 1                      // 0-indexed! (A=0, B=1, C=2, D=3)
    },
    // Precies 4 vragen totaal
  ]
}
```

**Threshold Tips:**
- 75% = standaard (2/4 of meer correct → advanced)
- 50% = minder streng (1/4 correct al advanced)
- 100% = zeer streng (alle 4 correct voor advanced)

---

### 6. GOALS (Optioneel maar aanbevolen)

```javascript
goals: [
  'Ik kan de drie wetten van Newton in eigen woorden uitleggen',
  'Ik kan F = m · a toepassen in eenvoudige vraagstukken',
  'Ik kan alledaagse situaties koppelen aan de juiste wet van Newton'
  // 3-5 leerdoelen aanbevolen
]
```

Verschijnt in de "Mission Briefing" (Commander Cat widget).

---

### 7. OLYMPIAD (Optioneel)

```javascript
olympiad: {
  title: 'Junior Natuurwetenschappen Olympiade',
  challenges: [
    {
      year: 2024,
      questionNumber: 5,
      questionTitle: 'Krachten en beweging',  // Optioneel
      pdfPage: 3,                             // Pagina in JNO PDF
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',                     // String! (niet index)
      explanation: 'Uitleg waarom B juist is'
    }
    // Minimum 3 vragen aanbevolen
  ]
}
```

Wordt alleen getoond als `timeline.stepD.olympiad = true`.

---

### 8. SPOT CHECK (Optioneel)

```javascript
spotCheck: {
  title: 'Weten we het nog?',
  questions: [
    { 
      question: 'Geef een voorbeeld van traagheid uit het dagelijks leven.', 
      answer: 'Bus die remt, muntje op glas, etc.' 
    }
    // 4-6 vragen aanbevolen
  ]
}
```

Open-ended vragen voor klassikale check.

---

## 🎯 ICON REFERENCE

Gebruik deze Phosphor Icons voor extra activities:

```javascript
PhArrowsDownUp    → Drag & Drop, Match
PhTextAa          → Fill Blanks, Vocabulaire
PhDiamondsFour    → Category Sort, Classificatie
PhListBullets     → Sequence, Stappenplan
PhThumbsUp        → True/False, Juist/Fout
PhTrophy          → Olympiad
PhTarget          → Assessment
PhCheck           → Check/Toets
PhInfo            → Informatie
PhPresentationChart → Presentatie
PhGameController  → Simulatie/Game
PhFlask           → Lab/Experiment
```

---

## ⚠️ BELANGRIJKE REGELS

### DO'S ✅
- ✅ Gebruik exact de veld namen uit template (case-sensitive!)
- ✅ Geef elk card een uniek `id` (voor progress tracking)
- ✅ Zorg dat `columnId` matcht met `column.id` (category sort)
- ✅ Gebruik 0-indexed voor `correct` in routeAssessment
- ✅ Gebruik String voor `correctAnswer` in olympiad ('A', 'B', 'C', 'D')
- ✅ Houd tijd realistisch (totaal ~90 min max)

### DON'TS ❌
- ❌ Gebruik NOOIT emojis in teksten (gebruik Phosphor icons)
- ❌ Vergeet niet `route: 'default'` / `route: 'advanced'` bij stepB routes
- ❌ Maak geen tijdlijn zonder route bepaling (stepB_routeChoice verplicht)
- ❌ Gebruik geen HTML in lesson data (wordt gedaan in components)
- ❌ Specificeer geen `meta` field meer in cards (is verwijderd voor cognitive load)

---

## 📊 QUALITY CHECKLIST

Voordat je een les indient, check:

- [ ] Alle 5 activities hebben minimaal 4 items
- [ ] Route assessment heeft precies 4 vragen
- [ ] Beide routes (default + advanced) zijn gedefinieerd
- [ ] Timeline heeft stappen A, B, C, D, E
- [ ] Elke card heeft uniek `id`
- [ ] Tijden tellen op tot ~80-100 minuten
- [ ] Config heeft alle vereiste velden
- [ ] Geen emojis gebruikt
- [ ] Icons zijn valide Phosphor icon namen

---

## 🚀 VOORBEELD WORKFLOW (AI Agent)

**USER:** "Maak een les over Zuren en Basen voor 5NW"

**AI ANTWOORD:**
```
Ik ga een nieuwe les maken: chemie-zuren-basen.js

Stap 1: Metadata invullen
- id: 'chemie-zuren-basen'
- subject: 'chemistry'
- className: '5NW'
- title: 'Zuren en Basen'

Stap 2: Timeline opzetten (A → B → C → D → E)
- A: Presentatie over pH-schaal
- B: Route bepaling + oefeningen
- C: Indicator experiment
- D: Toepassing huishoudproducten
- E: Exit ticket

Stap 3: "Holy 5" activities invullen
- Drag & Drop: Zuren vs Basen
- Fill Blanks: pH formules
- Category Sort: Huishoudproducten
- Sequence: Titratie stappenplan
- True/False: pH misconcepties

Stap 4: Route assessment (4 vragen over voorkennis)

[Schrijft volledige lesson file]

Klaar! Test met: npm run dev
```

**Tijd:** 2-3 minuten  
**Tokens gebruikt:** ~3K (vs 15K in oude systeem)

---

## 📞 TROUBLESHOOTING

**Q: "Import error in App.vue"**  
A: Check of de filename exact matcht: `import lessonData from './lessons/exact-filename.js'`

**Q: "Activities niet zichtbaar"**  
A: Controleer of `extraActivities` ids matchen met `activities` keys (bijv. `dragdrop` → `dragDrop`)

**Q: "Route keuze werkt niet"**  
A: Zorg dat `stepB_routeChoice` bestaat EN `stepB_default` + `stepB_advanced` beide bestaan

**Q: "Timeline stappen hebben verkeerde status"**  
A: Status wordt automatisch bepaald door progress. Gebruik alleen `status: 'active'` voor stepA.

---

**Succes met het maken van je les! 🎓**
