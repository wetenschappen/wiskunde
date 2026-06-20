# AGENTS.md — Digitaal Leerpad (Wiskunde)

> Single source of truth for AI agents working on this project.  
> Last updated: 2026-06-20

---

## Project Overview

A **Vue 3 mathematics lesson planner** used in a Belgian secondary school (3rd–4th year). Teachers navigate Year → Class → Module → Lesson, and the app renders an interactive timeline of activities, presentations, and exercises.

**Stack:** Vue 3 (Composition API) · Vue Router · Vite · Tailwind CSS v4 · KaTeX · mathjs · Phosphor Icons

---

## Dev Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Architecture

### Routing Flow

```
/ (YearSelection)
  └─► /year/:id/class (ClassSelection)
        └─► /year/:id/class/:classId (ModuleSelection)
              └─► /les/:id (LessonView → LessonContent)
```

- `App.vue` is a **thin shell** — just `<router-view>` + background watermark.
- `LessonView.vue` dynamically imports the lesson: `import('../lessons/${id}.js')`
- `LessonContent.vue` is the main lesson orchestrator (timeline, modals, activities).
- Module registry lives in `src/data/modules.js` — **every lesson file must be registered here**.

### Key Files

```
src/
├── App.vue                        # Shell (router-view only)
├── main.js                        # Mounts app, imports KaTeX CSS, registers router
├── router/index.js                # Route definitions (hash history)
├── data/
│   ├── modules.js                 # Lesson registry (id, title, year, class, etc.)
│   └── students.js                # Student name lists per classId
├── views/
│   ├── YearSelection.vue          # Year picker (1–4)
│   ├── ClassSelection.vue         # Class picker per year
│   ├── ModuleSelection.vue        # Module/lesson list
│   └── LessonView.vue             # Dynamic lesson loader
├── lessons/
│   ├── _template.js               # Template for new lessons
│   ├── nando3-m01-l01-symbolen.js # Example lesson
│   └── ...                        # nando3-m* and nando4-m* lessons
├── composables/
│   ├── useLesson.js               # Normalises lesson data, exposes config/timeline/goals
│   ├── useProgress.js             # localStorage-backed card progress
│   ├── useActivitySystem.js       # Activity registry + open/close/complete logic
│   └── useMathEngine.js           # Auto-processes math notation in all lesson strings
├── components/
│   ├── LessonContent.vue          # Main orchestrator (timeline, modals, keyboard)
│   ├── modals/
│   │   ├── PresentationModal.vue  # Full-screen slide deck
│   │   ├── WorkbookModal.vue      # Workbook instructions
│   │   ├── TicketModal.vue        # Entry + exit tickets (mode prop)
│   │   ├── SpotCheckModal.vue     # Spot check questions
│   │   └── SolutionsModal.vue     # Solutions viewer
│   ├── presentation/              # One Vue component per slide layout
│   │   └── Slide*.vue
│   └── activities/                # One Vue component per activity type
│       └── *.vue
```

---

## Adding a New Lesson

### Step 1: Create the lesson file

```bash
cp src/lessons/_template.js src/lessons/nando3-m07-l01-gelijkvormigheid.js
```

Fill in the lesson data (see format below).

### Step 2: Register in modules.js

```javascript
// src/data/modules.js
{
  id: 'nando3-m07-l01-gelijkvormigheid',
  title: 'Gelijkvormigheid: Begrippen',
  year: 3,
  grade: '3 Wiskunde (D5)',
  icon: PhMathOperations,
  color: 'text-brand-orange',
  bg: 'bg-orange-50'
}
```

That's it — `LessonView.vue` handles the rest via dynamic import.

---

## Lesson Data Format

```javascript
export default {
  // 1. METADATA (required)
  id: 'nando3-m07-l01-gelijkvormigheid',  // Must match filename and modules.js entry
  subject: 'math',                         // Always 'math' for this project
  className: '3de Middelbaar',
  title: 'Module 07 - Les 1',
  description: 'Gelijkvormigheid: Begrippen en eigenschappen',

  // 2. CONFIG (required)
  config: {
    groenCode: 'M07L1',         // Code shown on answer sheet
    groenAntwoord: 'wiskunde',  // Password to unlock teacher reveal (S key in presentation)
    masterCode: 'nando',        // Master override password
    classId: '3-Wiskunde',      // Key into src/data/students.js
    textbook: 'Nando 3 Module 07',
    cursusLink: 'https://albertshalaj.github.io/3nw',  // Optional: opens in Toolbox
    disciplineRules: [...],     // Optional: overrides discipline slide rules
    extraTools: [...],          // Optional: extra toolbox buttons
  },

  // 3. GOALS (recommended, array of strings)
  goals: [
    'Ik begrijp wat gelijkvormige figuren zijn.',
    'Ik kan de verhoudingsregel toepassen.'
  ],

  // 4. WORKBOOK (required)
  workbook: {
    title: 'Werkboek Oefeningen',
    subtitle: 'Module 07',
    instruction: '<p>Maak <strong>oefeningen 1–8</strong> op pagina 45.</p>',
    formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
  },

  // 5. TIMELINE (required)
  // Typically 3 steps: A (instap/diagnostisch), B (verwerken), C (samenvatting/exit)
  timeline: {
    stepA: {
      step: 'A', title: 'Diagnostisch & Instap', time: '15 min',
      cards: [
        { id: 'card-entry', type: 'digital', title: 'Diagnostische Toets',
          description: 'Wat weet je al?', action: 'entry-ticket', icon: 'PhQuestion' },
        { id: 'card-pres-a', type: 'class', title: 'Inleidende Instructie',
          description: 'Korte theorie.', action: 'presentation', slidesKey: 'slidesA' }
      ]
    },
    stepB: {
      step: 'B', title: 'Verwerken', time: '30 min',
      cards: [
        { id: 'card-pres-b', type: 'class', title: 'Uitgebreide Theorie',
          description: 'Stap voor stap uitgewerkt.', action: 'presentation', slidesKey: 'slidesB' },
        { id: 'card-workbook', type: 'paper', title: 'Boek Oefeningen',
          description: 'Maak oefeningen in het handboek.', action: 'workbook', icon: 'PhBookOpen' },
        { id: 'card-activity', type: 'digital', title: 'Interactieve Oefening',
          description: 'Visuele verkenning.', action: 'activity', activityId: 'similarity', icon: 'PhShapes' }
      ],
      extraActivities: [   // Optional: shown in collapsible branch
        { id: 'mixedRetrieval', title: 'Gemengde Herhaling', category: 'Herhaling', icon: 'PhArrowsClockwise' }
      ]
    },
    stepC: {
      step: 'C', title: 'Samenvatting & Exit', time: '5 min',
      cards: [
        { id: 'card-pres-c', type: 'class', title: 'Samenvatting',
          description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
        { id: 'card-exit', type: 'digital', title: 'Exit Ticket',
          description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
      ]
    }
  },

  // 6. ACTIVITIES (required if cards reference them)
  activities: {
    similarity: { type: 'similarity', title: 'Gelijkvormigheid' },
    mixedRetrieval: { type: 'mixedRetrieval', title: 'Gemengde Herhaling' }
  },

  // 7. SLIDE ARRAYS (one per slidesKey used in timeline cards)
  slidesA: [
    { layout: 'title', title: 'Module 07', subtitle: 'Gelijkvormigheid', badge: 'Wiskunde', icon: 'function' },
    { layout: 'standard', title: 'Wat is gelijkvormigheid?', content: 'Twee figuren zijn gelijkvormig als...' }
  ],
  slidesB: [
    { layout: 'definition', term: 'Gelijkvormige figuren', definition: 'Figuren met dezelfde vorm maar...' },
    { layout: 'worked-example', title: 'Voorbeeld', steps: [
      { label: 'Stap 1', content: 'Schrijf de verhouding op.' },
      { label: 'Stap 2', content: 'Los op voor x.' }
    ]}
  ],
  slidesC: [
    { layout: 'summary', title: 'Samenvatting', items: ['Gelijkvormig = zelfde vorm, andere grootte.'] },
    { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
  ],

  // 8. TICKETS
  entryTicket: {
    questions: [
      { id: 'en1', type: 'mc', question: 'Zijn twee vierkanten altijd gelijkvormig?',
        options: ['Ja', 'Nee', 'Soms'], correct: 0 }
    ]
  },
  exitTicket: {
    questions: [
      { id: 'ex1', type: 'mc', question: 'Wat is de schaalfactor?',
        options: ['Verhouding van zijden', 'Oppervlakte', 'Hoeksom'], correct: 0 },
      { id: 'ex2', type: 'open', question: 'Open Vraag', description: 'Geef een voorbeeld van gelijkvormige figuren in het dagelijks leven.' }
    ]
  },

  // 9. SPOT CHECK (optional)
  spotCheck: {
    questions: [{ question: 'Noem twee gelijkvormige figuren.', answer: 'Bijv. twee cirkels, twee vierkanten.' }]
  }
}
```

---

## Card Actions

| Action | Effect | Extra fields |
|---|---|---|
| `presentation` | Opens `PresentationModal` with the specified slide array | `slidesKey` (default: `'slides'`) |
| `workbook` | Opens `WorkbookModal` | — |
| `exit-ticket` | Opens `TicketModal` in exit mode | — |
| `entry-ticket` | Opens `TicketModal` in entry mode | — |
| `activity` | Opens activity component | `activityId` (key in `activities`) |
| `external-link` | Opens URL in new tab + marks done | `url` |
| `custom` | Marks card as done only | — |

### Card Types (badge colour)

| Type | Badge | Use |
|---|---|---|
| `class` | Rood — Klassikaal | Teacher-led |
| `digital` | Blauw — Digitaal | Interactive / online |
| `paper` | Groen — Werkboek | Handboek exercises |
| `check` | Paars — Vastzetting | Tests / checks |

---

## Presentation Slides

### How It Works

- `PresentationModal.vue` renders slides full-screen (1920×1080 scaled to fit).
- Each layout is a separate component in `src/components/presentation/`.
- Math text (`\( ... \)`) in **all lesson strings** is auto-processed by `useMathEngine.js` — no manual KaTeX needed.
- The `discipline` slide is **auto-prepended** for the first presentation card of a lesson (or when `card.showDiscipline: true`).

### Keyboard Shortcuts (inside presentation)

| Key | Action |
|---|---|
| `→` / `Space` | Next slide (or reveal next step) |
| `←` | Previous slide (or un-reveal last step) |
| `S` | Reveal next step on `steps`, `exercise`, `worked-example`, `recap` — password-gated (`config.groenAntwoord`) |
| `Esc` / exit fullscreen | Close modal |

### All Supported Slide Layouts

#### General layouts
| Layout | Use |
|---|---|
| `discipline` | Auto-generated rules + cursus URL (never write manually) |
| `title` | Module opener |
| `hero` | Visual hook with image |
| `standard` | Plain text / explanation |
| `big` | Large single statement / key formula |
| `predict` | Activate prior knowledge (click to reveal answer) |
| `realworld` | Real-world context (cause/consequence/takeaway) |
| `comparison` | Two-column side-by-side comparison |
| `split` | Text + image side by side |
| `image-grid` | Two images with captions |
| `image-hero` | Large image above, text below |
| `multichoice` | Interactive quiz (click answer) |
| `recap` | Step-by-step Q&A reveal |
| `summary` | Bullet-point summary |
| `celebration` | Positive end slide |
| `steps` | Click-to-reveal learning goals |
| `exercise` | Step-by-step worked exercise (S key) |
| `equation` | Formula breakdown with colour-coded parts |

#### Math-specific layouts (new)
| Layout | Use |
|---|---|
| `definition` | Formal term + definition box |
| `worked-example` | Multi-step solution with S-key reveal |
| `value-table` | Input/output table for functions |
| `properties` | Numbered list of mathematical properties |
| `equation-solver` | Step-by-step equation solving |
| `theorem-proof` | Theorem statement + proof steps |
| `math-graph` | SVG function graph with step-by-step reveals |

### Slide Structure Examples

```javascript
// TITLE
{ layout: 'title', title: 'Module 07', subtitle: 'Gelijkvormigheid', badge: 'Wiskunde', icon: 'function' }

// STANDARD
{ layout: 'standard', title: 'Definitie', content: 'Twee figuren zijn gelijkvormig als \( k > 0 \) zodat...' }

// DEFINITION (math-specific)
{ layout: 'definition', term: 'Schaalfactor', definition: 'De verhouding \( k = \\frac{b}{a} \) waarbij...' }

// WORKED EXAMPLE (S-key step reveal)
{ layout: 'worked-example', title: 'Bereken x', steps: [
  { label: 'Gegeven', content: '\( \\frac{x}{4} = \\frac{6}{8} \)' },
  { label: 'Stap 1', content: 'Kruislings vermenigvuldigen: \( 8x = 24 \)' },
  { label: 'Oplossing', content: '\( x = 3 \)' }
]}

// PROPERTIES
{ layout: 'properties', title: 'Eigenschappen van gelijkvormige driehoeken', items: [
  'Overeenkomstige hoeken zijn gelijk.',
  'Overeenkomstige zijden zijn evenredig.'
]}

// VALUE TABLE
{ layout: 'value-table', title: 'Functietabel', headers: ['x', 'f(x) = 2x + 1'],
  rows: [[-2, -3], [-1, -1], [0, 1], [1, 3], [2, 5]] }

// MATH GRAPH (step-by-step)
{ layout: 'math-graph', title: 'Grafiek van f(x) = 2x + 1',
  steps: [
    { label: 'Assen', mathConfig: { functions: [], axes: true } },
    { label: 'Lijn', mathConfig: { functions: [{ expr: '2*x+1', color: '#F97316' }] } }
  ]
}

// MULTICHOICE
{ layout: 'multichoice', title: 'Quiz', question: 'Zijn twee rechthoeken altijd gelijkvormig?',
  options: [
    { id: 'A', text: 'Ja, altijd.', correct: false },
    { id: 'B', text: 'Nee, niet altijd.', correct: true }
  ],
  explanation: 'Een rechthoek 2×4 en een rechthoek 3×4 zijn niet gelijkvormig.'
}

// SUMMARY
{ layout: 'summary', title: 'Samenvatting', items: [
  'Gelijkvormig = zelfde vorm, andere grootte.',
  'Schaalfactor \( k = \\frac{b}{a} \)'
]}

// CELEBRATION
{ layout: 'celebration', title: 'Klaar!', subtitle: 'Je beheerst gelijkvormigheid.',
  stats: [{ label: 'Slides', value: '12' }, { label: 'Status', value: 'TOP' }] }
```

### Optimal Slide Flow

```
1. discipline   — Auto-generated (first deck only)
2. title        — Module opener
3. steps        — "Wat ga je leren?"
4. predict      — Activeer voorkennis
5–8. content    — definition / standard / properties / worked-example
9. recap        — Mid-lesson check
10. multichoice — Active quiz
11. summary     — Consolidate
12. celebration — Positive close
```

---

## Activity System

Activities are registered in `src/composables/useActivitySystem.js`. Each maps a string key to a Vue component.

### Full Activity Registry

| Key | Component | Topic |
|---|---|---|
| `dragDrop` | DragDropActivity | Generic matching |
| `fillBlanks` | FillBlanksActivity | Fill-in-the-blank |
| `categorySort` | CategorySortActivity | Sorting into categories |
| `symbolDrill` | SymbolDrillActivity | Math symbol practice |
| `mixedRetrieval` | MixedRetrievalActivity | Mixed review |
| `hotspot` | HotspotActivity | Click-on-image |
| `realNumbers` | RealNumbersActivity | Real number sets |
| `logic` | LogicActivity | Logic / sets |
| `linearEquations` | LinearEquationsActivity | 1st degree equations |
| `linearSystems` | LinearSystemsActivity | Systems of equations |
| `linearFunctions` | LinearFunctionsActivity | Linear functions |
| `functionIntroduction` | FunctionIntroductionActivity | Function concept |
| `quadraticFunctions` | QuadraticFunctionsActivity | Quadratic functions |
| `quadraticEquations` | QuadraticEquationsActivity | Quadratic equations |
| `rationalFunctions` | RationalFunctionsActivity | Rational functions |
| `polynomialDivision` | PolynomialDivisionActivity | Polynomial division |
| `vectors` | VectorsActivity | Vectors |
| `analyticGeometry` | AnalyticGeometryActivity | Analytic geometry |
| `circleGeometry` | CircleGeometryActivity | Circle geometry |
| `similarity` | SimilarityActivity | Similarity / scaling |
| `pythagoras` | PythagorasActivity | Pythagoras |
| `trigonometryCircle` | TrigonometryCircleActivity | Unit circle |
| `trigonometryRightTriangle` | TrigonometryRightTriangleActivity | Right triangle trig |
| `spatialGeometry` | SpatialGeometryActivity | 3D / spatial geometry |
| `descriptiveStatistics` | DescriptiveStatisticsActivity | Stats: centre + spread |
| `correlation` | CorrelationActivity | Correlation / regression |
| `graphTheory` | GraphTheoryActivity | Graph theory |
| `countingProblems` | CountingProblemsActivity | Combinatorics / counting |

### Referencing an Activity from a Card

```javascript
// In timeline card:
{ id: 'card-activity', type: 'digital', title: 'Interactieve Oefening',
  action: 'activity', activityId: 'similarity' }

// In activities map:
activities: {
  similarity: { type: 'similarity', title: 'Gelijkvormigheid' }
}
```

Activity completion marks `'card-' + activityId` as done in progress.

---

## Tickets (Entry + Exit)

Both use `TicketModal.vue` with a `mode` prop (`'entry'` or `'exit'`).

```javascript
entryTicket: {
  questions: [
    { id: 'en1', type: 'mc', question: 'Vraag?', options: ['A', 'B', 'C'], correct: 0 },
    { id: 'en2', type: 'open', question: 'Open vraag', description: 'Beschrijf...' }
  ]
},
exitTicket: {
  questions: [
    { id: 'ex1', type: 'mc', question: 'Vraag?', options: ['A', 'B', 'C'], correct: 1 }
  ]
}
```

- Supported types: `mc`, `open`
- `juist-fout` is **auto-normalized** to `mc` with options `['Juist', 'Fout']` by `useLesson.js`
- Modal appends built-in `mood` and `finish` steps after provided questions
- Open questions require > 10 characters to continue

---

## Global Keyboard Shortcuts (in lesson view)

| Key | Action |
|---|---|
| `N` | Toggle name picker |
| `R` | Reset progress (with confirmation) |
| `C` | Toggle math background watermark |

---

## localStorage Keys

| Key | Purpose |
|---|---|
| `${lessonId}` | Lesson progress (done card IDs) |
| `planner-show-watermark` | Background toggle |
| `teacher_unlocked` | Presentation teacher-mode unlock |

---

## Design System

- **Font:** `Open Sans` (body), `JetBrains Mono` (accents)
- **Brand orange:** `#F97316` (`brand-orange`, `amber-500`)
- **Brand dark:** `#0B1120` (`brand-dark`)
- **Slate palette** for structure and text
- **8-point spacing grid:** `p-4`, `p-6`, `p-8`, `gap-4/6/8` — never `p-7`, `mb-11`
- **Radii:** `rounded-2xl` cards, `rounded-xl` small elements, `rounded-lg` badges

---

## Do's and Don'ts

### ✅ DO
- Register every new lesson in `src/data/modules.js`
- Use `slidesKey` on presentation cards to point to the right slide array
- Give every card a unique `id` (used for progress tracking)
- Use KaTeX-style math wrapped in `\( ... \)` — it renders correctly everywhere (tickets, slides, spot checks, activities)
- Use `type: 'math'` as the subject value (not `'physics'` or `'chemistry'`)
- Keep timeline to 3 steps: A (instap), B (verwerken), C (exit)
- Use `entry-ticket` for diagnostic questions at the start

### ❌ DON'T
- Don't use `route-assessment` — this feature has been removed
- Don't use `sequence` or `trueFalse` activity keys — not in the current registry
- Don't write a `discipline` slide manually — it's always auto-generated
- Don't use emojis in lesson text — use Phosphor icons instead
- Don't use math in the `userInput` binding of FillBlanks activity — that field is user-typed text, not lesson data
- Don't import lesson files in `App.vue` — routing handles this automatically
- Don't use arbitrary spacing values (`p-7`, `mb-11`, etc.)

---

## Troubleshooting

**Lesson not showing in module list**  
→ Check `src/data/modules.js` — the `id` must exactly match the filename (without `.js`).

**Activity not opening**  
→ Check that `activityId` in the card matches a key in `activities` map, and that key exists in the `COMPONENT_MAP` in `useActivitySystem.js`.

**Math not rendering**  
→ Wrap in `\( ... \)` (preferred) or `$...$` (also supported). Both are processed by `useMathEngine.js` and rendered via `v-html` everywhere in the app — tickets, spot checks, slide content, and activity instructions all support math notation.

**Slides not loading**  
→ Check that `slidesKey` on the card matches a top-level key in the lesson file (e.g. `slidesB`).

**Progress not resetting**  
→ Use the `R` key in lesson view, or clear `localStorage` manually.
