# `ArchimedesActivity.vue` — Rebuild Specification

> **Doel van dit document:** Volledige ontwerp- en implementatiespecificatie voor een ground-up herschrijf van `src/components/activities/ArchimedesActivity.vue`. Een ander LLM moet in staat zijn dit document te lezen en het component perfect te implementeren zonder verdere vragen. Niets mag worden aangenomen; alles is hier beschreven.

---

## 0. Probleemanalyse: Wat Is Er Mis met de Huidige Code

De huidige `ArchimedesActivity.vue` heeft de volgende concrete problemen:

1. **Chaotisch rechter paneel.** Alles wordt tegelijk getoond: drie sliders (dichtheid vloeistof, dichtheid voorwerp, volume), een tabel met live berekeningen, twee krachtenkaarten met DOOR/OP-selects, en een resultatenrij. Er is geen gevoel van prioriteit, volgorde of leerdoel.

2. **Volume-slider verandert de tank, niet het object.** De berekening van `waterSurfaceY` gebruikt `volObjRange.value.max` om de wateropstijging te berekenen, waardoor de slider de waterstand in de tank beïnvloedt in plaats van de objectgrootte. Dit is fysisch incorrect en visueel verwarrend.

3. **Geen SI-eenheden.** Dichtheden, volumes en krachten worden getoond zonder eenheden (geen `kg/m³`, `m³`, `N`). Dit is onaanvaardbaar voor een STEM-leeromgeving.

4. **Validatielogica is scenario-onafhankelijk.** In `checkScenario()` zijn de verwachte antwoorden hardcoded (`{ sender: 'aarde', receiver: 'voorwerp' }` enz.) en veranderen niet per scenario. Scenario 2 (ei dat zweeft) en Scenario 1 (ijzer dat zinkt) zijn identiek gecheckt.

5. **Geen pedagogische progressie.** Alle 4 scenario's zijn toegankelijk via een dropdown. Er is geen "learning journey": de student kan willekeurig navigeren zonder de concepten op te bouwen.

6. **Geen krachtenbalans-stap.** De student tekent krachten, maar de cruciale stap — "Welke kracht is groter? Wat doet het voorwerp?" — ontbreekt volledig. Dit is het eigenlijke leerplandoel (II-NatS-d F7).

7. **Origine-selectie is triviaal.** Er is slechts één optie naast "Geen": "Zwaartepunt/Massamiddelpunt". Het selecteren hiervan is daarmee een mechanische actie zonder begrip.

8. **Vectoren zijn altijd even lang.** `vProps.fz.len` en `vProps.fa.len` zijn beide gecapped op 140 en berekend op basis van dezelfde schaalfactor. Voor de scenario's "zinken" en "stijgen" zijn de krachten echter sterk ongelijk. De visuele proportionaliteit — een kernvisualisatie in het textboek — gaat verloren.

---

## 1. Doelstelling van de Nieuwe Activiteit

Bouw `ArchimedesActivity.vue` volledig opnieuw. Het resultaat moet een **premium, pedagogisch verantwoord interactief labo** zijn dat:

- studenten stap voor stap begeleidt door de 4 gedragsstaten van een voorwerp in een fluïdum (zinken, zweven, stijgen, drijven) + één bonusscenario (gas),
- de **ForcesLab-vector-interface** (krachten tekenen, DOOR/OP beschrijven) als kern behoudt,
- de **krachtenbalans** (Fz vs FA, bewegingstoestand) toevoegt als aparte, essentiële stap,
- **correcte SI-eenheden** toont bij elke waarde,
- **proportionele vectorlengten** gebruikt die de grootteorde van de krachten visueel communiceren,
- aansluit bij leerplandoel **II-NatS-d F7** en de terminologie uit de cursus (`cursus.md`),
- de **vrij-verkennenmodus** (sliders) bewaart als een beloningsfase ná de geleid-taak, niet als barrière erin.

---

## 2. Leerplandoel en Curriculumafstemming

**Leerplandoel (lpd.txt):** II-NatS-d F7  
> "De leerlingen stellen een krachtenbalans op van een systeem om het effect van de resultante te bepalen."

**Relevante context (lpd.txt):**  
- Archimedeskracht  
- Samenstellen en ontbinden van vectoren  
- Het effect van een resulterende kracht: dalen/zinken, zweven, stijgen/drijven  
- Notatie FAB: de kracht van object A op object B → "De kracht uitgeoefend DOOR A OP B"  
- Als de resulterende kracht nul is = translatie-evenwicht

**Textbookafstemming (cursus.md):**  
- Terminologie: `FA`, `Fz`, `fluïdum`, `ρvl`, `Vvwp`, `Vonder`, `g`  
- Vier gedragsstaten in volgorde: zweven (3.1), zinken (3.2), stijgen (3.3), drijven (3.4)  
- Wet van Archimedes: `FA = ρvl · Vonder · g`  
- Dichtheidsregel: ρ_obj > ρ_vl → zinkt; ρ_obj = ρ_vl → zweeft; ρ_obj < ρ_vl → stijgt/drijft  
- Gassen: luchtballon stijgt omdat warme lucht (lagere dichtheid) lichter is dan koude lucht

**Bloomse taxonomieniveaus per fase:**  
- Fase A (krachten tekenen + DOOR/OP): Herinneren + Begrijpen  
- Fase B (krachtenbalans + bewegingstoestand): Toepassen + Analyseren

---

## 3. Leerdoelen per Scenario

| Scenario | Gedrag | Kernleerdoel |
|----------|--------|--------------|
| 1: IJzer in water | Zinken | Student identificeert dat Fz > FA en leidt hieruit af dat het voorwerp zinkt. |
| 2: Ei in zout water | Zweven | Student identificeert dat Fz = FA (translatie-evenwicht) en concludeert zweefstand. |
| 3: Kurk in water | Stijgen | Student identificeert FA > Fz en verbindt dit met opwaartse versnelling. |
| 4: Hout op water | Drijven | Student begrijpt dat bij gedeeltelijke onderdompeling FA = Fz bereikt, ook al ρ_obj < ρ_vl. |
| 5 (bonus): Luchtballon | Stijgen in gas | Wet van Archimedes geldt ook in gassen. Warme lucht is minder dicht. |

---

## 4. Globale Architectuur van het Component

### 4.1. Props (identiek aan ForcesLabActivity.vue)

```js
defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Archimedes Labo' },
  instruction: String,
  fullscreen: { type: Boolean, default: true }
})
```

### 4.2. Emits (identiek aan ForcesLabActivity.vue)

```js
defineEmits(['close', 'complete'])
```

### 4.3. Imports

```js
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  PhNavigationArrow, PhCheckCircle, PhWarningCircle, PhPlayCircle,
  PhArrowRight, PhTrash, PhX, PhArrowDown, PhArrowUp,
  PhWaves, PhFlask, PhArrowsClockwise
} from '@phosphor-icons/vue'
```

### 4.4. Fullscreen & Keyboard Behavior

Kopieer exact de `watch(() => props.isOpen, ...)`, `handleFullscreenChange`, `handleKeydown`, `onMounted` en `onUnmounted` logica van `ForcesLabActivity.vue` (regels L212–L262). Geen wijzigingen nodig.

---

## 5. Scenario-gegevens (Volledige Definitie)

Definieer een `scenarios` array van 5 objecten. **Sliders bestaan niet in de taakfase.** Alle waarden zijn vast per scenario.

### Veldschema per scenario

```js
{
  id: Number,                    // 0-based index
  title: String,                 // weergegeven in header
  desc: String,                  // contextbeschrijving, 1 zin
  emoji: String,                 // object emoji (voor canvas)
  objectLabel: String,           // 'het ijzeren blok', 'het ei', enz.
  fluidLabel: String,            // 'het water', 'het zout water', 'de koude lucht'
  fluidActorId: String,          // id voor DOOR/OP select: 'water', 'zoutwater', 'koude_lucht'
  isGas: Boolean,                // true alleen voor scenario 4 (luchtballon)
  rho_obj: Number,               // kg/m³
  rho_fluid: Number,             // kg/m³
  vol_obj: Number,               // m³ (gebruik 1.0e-4 voor 100 cm³, enz.)
  vol_obj_display: String,       // leesbare weergave: '100 cm³'
  g: 9.81,                       // N/kg (constant)
  // Berekende waarden (als computed of direct in object):
  // mass = rho_obj * vol_obj
  // Fz = mass * g
  // FA_max = rho_fluid * vol_obj * g    (volledig ondergedompeld)
  // vol_onder = ...
  // FA_actual = ...
  // percentage_onder = ...
  behavior: String,              // 'zinkt' | 'zweeft' | 'stijgt' | 'drijft'
  behaviorExplanation: String,   // uitleg bij correcte krachtenbalans
  // Verwachte antwoorden:
  expectedFz: {
    origin: 'center',
    direction: 'down',
    sender: 'aarde',
    receiver: 'voorwerp'
  },
  expectedFa: {
    origin: 'center',
    direction: 'up',
    sender: String,              // = fluidActorId
    receiver: 'voorwerp'
  },
  expectedComparison: String,    // 'greater' | 'equal' | 'less' (Fz vs FA)
  expectedBehavior: String,      // 'zinkt' | 'zweeft' | 'stijgt' | 'drijft'
  explanation: String,           // feedbacktekst bij volledig correct scenario
}
```

### Scenario 0: Zinken — IJzeren blok in water

```js
{
  id: 0,
  title: 'Scenario 1: IJzeren blok in water',
  desc: 'Een ijzeren blok wordt in water losgelaten. Wat doet het blok?',
  emoji: '🧱',
  objectLabel: 'het ijzeren blok',
  fluidLabel: 'het water',
  fluidActorId: 'water',
  isGas: false,
  rho_obj: 7900,       // kg/m³ (ijzer)
  rho_fluid: 1000,     // kg/m³ (water)
  vol_obj: 1.0e-4,     // m³  (= 100 cm³)
  vol_obj_display: '100 cm³',
  behavior: 'zinkt',
  expectedComparison: 'greater',  // Fz > FA
  expectedBehavior: 'zinkt',
  explanation: 'Correct! De zwaartekracht (Fz = 7,75 N) is veel groter dan de archimedeskracht (FA = 0,98 N). De resulterende kracht wijst naar beneden: het ijzeren blok zinkt. Dit klopt: ρijzer (7900 kg/m³) > ρwater (1000 kg/m³).'
}
```

Berekeningen (ter controle, niet hardcoderen — gebruik `computed`):
- mass = 7900 × 1.0e-4 = 0.79 kg
- Fz = 0.79 × 9.81 = 7.75 N
- FA_max = 1000 × 1.0e-4 × 9.81 = 0.981 N ≈ 0.98 N
- FA < Fz → volledig ondergedompeld, zinkt

### Scenario 1: Zweven — Ei in zout water

```js
{
  id: 1,
  title: 'Scenario 2: Ei in zout water',
  desc: 'Een ei wordt volledig ondergedompeld in zout water en losgelaten. Het ei zweeft.',
  emoji: '🥚',
  objectLabel: 'het ei',
  fluidLabel: 'het zout water',
  fluidActorId: 'zoutwater',
  isGas: false,
  rho_obj: 1030,       // kg/m³
  rho_fluid: 1030,     // kg/m³ (zout water)
  vol_obj: 5.0e-5,     // m³ (= 50 cm³)
  vol_obj_display: '50 cm³',
  behavior: 'zweeft',
  expectedComparison: 'equal',  // Fz = FA
  expectedBehavior: 'zweeft',
  explanation: 'Uitstekend! Fz = 0,506 N en FA = 0,506 N. De krachten zijn precies even groot: translatie-evenwicht. De resulterende kracht is nul. Het ei zweeft! Dit klopt: ρei = ρzoutwater = 1030 kg/m³.'
}
```

Berekeningen:
- mass = 1030 × 5.0e-5 = 0.0515 kg
- Fz = 0.0515 × 9.81 = 0.505 N
- FA = 1030 × 5.0e-5 × 9.81 = 0.505 N
- FA = Fz → zweeft

### Scenario 2: Stijgen — Kurken stop in water

```js
{
  id: 2,
  title: 'Scenario 3: Kurken stop in water',
  desc: 'Een kurken stop wordt volledig onder water gedrukt en losgelaten. Wat gebeurt er?',
  emoji: '🪵',
  objectLabel: 'de kurken stop',
  fluidLabel: 'het water',
  fluidActorId: 'water',
  isGas: false,
  rho_obj: 250,        // kg/m³ (kurk)
  rho_fluid: 1000,     // kg/m³
  vol_obj: 1.0e-4,     // m³ (= 100 cm³)
  vol_obj_display: '100 cm³',
  behavior: 'stijgt',
  expectedComparison: 'less',   // Fz < FA
  expectedBehavior: 'stijgt',
  explanation: 'Perfect! FA = 0,981 N is veel groter dan Fz = 0,245 N. De resulterende kracht wijst naar boven: de kurken stop stijgt op. ρkurk (250 kg/m³) < ρwater (1000 kg/m³).'
}
```

Berekeningen:
- mass = 250 × 1.0e-4 = 0.025 kg
- Fz = 0.025 × 9.81 = 0.245 N
- FA = 1000 × 1.0e-4 × 9.81 = 0.981 N
- FA > Fz → stijgt

### Scenario 3: Drijven — Houten blok op water

```js
{
  id: 3,
  title: 'Scenario 4: Houten blok op water',
  desc: 'Een houten blok wordt op het water gelegd. Het blok drijft en is gedeeltelijk ondergedompeld.',
  emoji: '🪵',    // Gebruik hier eventueel een ander emoji dan scenario 2; alternatieven: '🛶', '📦'
  objectLabel: 'het houten blok',
  fluidLabel: 'het water',
  fluidActorId: 'water',
  isGas: false,
  rho_obj: 600,        // kg/m³ (eikenhout of vergelijkbaar)
  rho_fluid: 1000,     // kg/m³
  vol_obj: 2.0e-4,     // m³ (= 200 cm³)
  vol_obj_display: '200 cm³',
  behavior: 'drijft',
  expectedComparison: 'equal',  // Fz = FA (bij evenwicht)
  expectedBehavior: 'drijft',
  explanation: 'Bravo! Het houten blok drijft in evenwicht: Fz = FA = 1,18 N. Slechts 60% van het blok is ondergedompeld (Vonder = 120 cm³). Omdat ρhout (600 kg/m³) < ρwater (1000 kg/m³), zakt het blok net genoeg om evenwicht te bereiken — dan drijft het.'
}
```

Berekeningen:
- mass = 600 × 2.0e-4 = 0.12 kg
- Fz = 0.12 × 9.81 = 1.177 N ≈ 1.18 N
- vol_onder = (600/1000) × 2.0e-4 = 1.2e-4 m³ (= 120 cm³ = 60%)
- FA = 1000 × 1.2e-4 × 9.81 = 1.177 N = Fz ✓
- Percentage_onder = 60%
- FA = Fz → drijft (gedeeltelijk ondergedompeld)

**Belangrijk voor canvas:** Bij drijven is het object gedeeltelijk boven de waterlijn. De onderkant van het object bevindt zich op `waterSurfaceY + submergedFractionPx` en de bovenkant op `waterSurfaceY - (1-submergedFraction)*objectHeightPx`.

### Scenario 4 (bonus): Stijgen in gas — Luchtballon

```js
{
  id: 4,
  title: 'Scenario 5 (bonus): Heteluchtballon',
  desc: 'Een heteluchtballon wordt gevuld met warme lucht. De omringende koude lucht is dichter. Wat doet de ballon?',
  emoji: '🎈',
  objectLabel: 'de luchtballon',
  fluidLabel: 'de koude lucht',
  fluidActorId: 'koude_lucht',
  isGas: true,
  rho_obj: 0.90,       // kg/m³ (effectieve gemiddelde dichtheid ballon + warme lucht)
  rho_fluid: 1.25,     // kg/m³ (koude omgevingslucht)
  vol_obj: 10.0,       // m³ (vereenvoudigd volume)
  vol_obj_display: '10 m³',
  behavior: 'stijgt',
  expectedComparison: 'less',   // Fz < FA
  expectedBehavior: 'stijgt',
  explanation: 'Geweldig! FA = 1000 × ... nee — in dit geval: FA = ρkoude_lucht · V · g = 1,25 × 10 × 9,81 = 122,6 N > Fz = 0,90 × 10 × 9,81 = 88,3 N. De resulterende kracht wijst omhoog: de ballon stijgt! De wet van Archimedes geldt ook in gassen.'
}
```

Berekeningen:
- mass = 0.90 × 10 = 9.0 kg
- Fz = 9.0 × 9.81 = 88.3 N
- FA = 1.25 × 10 × 9.81 = 122.6 N
- FA > Fz → stijgt

**Canvasopmerking voor isGas=true:** Toon een lichtgrijze/hemelblauwe achtergrond in plaats van water. Teken een gestippelde lijn als "referentiehoogte van het gasniveau". Geen wateroppervlak. Het voorwerp (ballon) is volledig omgeven door gas.

---

## 6. Berekende Waarden (Computed Properties)

Definieer de volgende computed properties die altijd de waarden van het **huidige scenario** gebruiken:

```js
const currentScenario = computed(() => scenarios[currentScenarioIndex.value])

const mass = computed(() =>
  currentScenario.value.rho_obj * currentScenario.value.vol_obj
)

const Fz = computed(() => mass.value * 9.81)

// FA_max = volledig ondergedompeld
const FA_max = computed(() =>
  currentScenario.value.rho_fluid * currentScenario.value.vol_obj * 9.81
)

// vol_onder = ondergedompeld volume (bij drijven: slechts gedeeltelijk)
const vol_onder = computed(() => {
  const s = currentScenario.value
  if (s.behavior === 'drijft') {
    return (s.rho_obj / s.rho_fluid) * s.vol_obj
  }
  return s.vol_obj // zinkt, zweeft, stijgt: volledig ondergedompeld
})

// FA_actual = de ware archimedeskracht in de equilibriumtoestand
const FA_actual = computed(() =>
  currentScenario.value.rho_fluid * vol_onder.value * 9.81
)

const percentage_onder = computed(() =>
  Math.round((vol_onder.value / currentScenario.value.vol_obj) * 100)
)
```

---

## 7. Reactieve Toestand (Vue Refs)

```js
const currentScenarioIndex = ref(0)          // 0..4
const currentPhase = ref('A')                // 'A' (tekenen) | 'B' (balans)

const inputs = ref({
  fz: { origin: 'none', direction: 'none', sender: '', receiver: '' },
  fa: { origin: 'none', direction: 'none', sender: '', receiver: '' }
})

// Fase B inputs
const balanceInputs = ref({
  comparison: null,    // 'greater' | 'equal' | 'less'
  behavior: null       // 'zinkt' | 'zweeft' | 'stijgt' | 'drijft'
})

const feedback = ref(null)         // { type: 'success'|'error', text: String }
const isCorrect = ref(false)       // true als huidige fase gecheckt en correct
const phaseALocked = ref(false)    // true nadat fase A correct is bevestigd
const shouldPulse = ref(false)     // sluit-knop animatie bij openen
const hoveredPoint = ref(null)     // 'center' | null (voor SVG tooltip)
const isDone = computed(() =>
  isCorrect.value && currentScenarioIndex.value === scenarios.length - 1 && currentPhase.value === 'B'
)
const allScenariosComplete = ref(false) // true na isDone → unlock vrij verkennen
```

---

## 8. Toestandsmachine: Overgangen

```
START
  → currentScenarioIndex = 0, currentPhase = 'A'

FASE A:
  student vult in: inputs.fz (origin, direction, sender, receiver)
                   inputs.fa (origin, direction, sender, receiver)
  → klikt "Controleer Krachten"
  → checkPhaseA():
      CORRECT → feedback success, isCorrect=true, phaseALocked=true
                → knop verandert naar "Ga naar Krachtenbalans →"
      FOUT    → feedback error met specifieke hint, isCorrect=false

  → klikt "Ga naar Krachtenbalans →"
      → currentPhase = 'B', isCorrect=false, feedback=null

FASE B:
  student kiest: balanceInputs.comparison ('greater'|'equal'|'less')
                 balanceInputs.behavior ('zinkt'|'zweeft'|'stijgt'|'drijft')
  → klikt "Controleer Balans"
  → checkPhaseB():
      CORRECT → feedback success, isCorrect=true
                → knop: "Volgende Scenario →" of "Labo Afronden" (laatste)
      FOUT    → feedback error met specifieke hint

  → klikt "Volgende Scenario →"
      → currentScenarioIndex++
         resetState() → inputs en balanceInputs leegmaken, feedback=null,
                         isCorrect=false, phaseALocked=false, currentPhase='A'

  → klikt "Labo Afronden" (alleen als isDone)
      → allScenariosComplete=true
         emit('complete')
         OF: toon vrij-verkennen-modus (zie §14)

RESET (trash-knop per krachtkaart):
  → handleOriginClick(forceId, 'none')
     inputs.value[forceId] = { origin:'none', direction:'none', sender:'', receiver:'' }
     feedback=null, isCorrect=false
     (phaseALocked NIET resetten bij trash — enkel bij scenario-wissel)
```

---

## 9. Actors (voor DOOR/OP selects)

De actorenlijst is **scenario-afhankelijk** (computed, niet statisch):

```js
const actors = computed(() => {
  const s = currentScenario.value
  return [
    { id: 'aarde',            label: 'de aarde' },
    { id: 'voorwerp',         label: s.objectLabel },   // bijv. 'het ei'
    { id: s.fluidActorId,     label: s.fluidLabel }     // bijv. 'het zout water'
  ]
})
```

**Correcte antwoorden per force:**
- Fz: sender='aarde', receiver='voorwerp'
- FA: sender=`currentScenario.fluidActorId`, receiver='voorwerp'

---

## 10. Globale Lay-out (Template)

De template heeft exact dezelfde structuur als `ForcesLabActivity.vue`:

```
<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

  <div class="relative bg-slate-100 shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none">

    <!-- HEADER (shrink-0) -->
    [HEADER SECTIE — zie §10.1]

    <!-- BODY (flex-1, twee kolommen) -->
    <div class="flex-1 overflow-hidden p-3 md:p-5 flex flex-col md:flex-row gap-5 md:gap-6 bg-slate-50 min-h-0">
      
      <!-- LINKS: SVG CANVAS (40% breedte) -->
      [CANVAS SECTIE — zie §11]

      <!-- RECHTS: TAAKPANEEL (60% breedte, scrollbaar) -->
      [TAAKPANEEL — zie §12]

    </div>
  </div>
</div>
```

### 10.1. Header

```html
<div class="p-2 md:p-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 relative shrink-0">
  
  <!-- LINKS IN HEADER: Titel + Scenariobadge -->
  <div class="flex items-center gap-4">
    <h2 class="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">
      {{ title }}
    </h2>
    <!-- Scenario progress badge -->
    <div class="hidden md:flex items-center gap-2">
      <button
        v-for="(scen, idx) in scenarios"
        :key="idx"
        @click="currentScenarioIndex > idx ? goToScenario(idx) : null"
        class="w-8 h-8 rounded-full text-xs font-extrabold transition-all flex items-center justify-center border-2"
        :class="[
          idx === currentScenarioIndex
            ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
            : idx < currentScenarioIndex
              ? 'bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:scale-105'
              : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
        ]"
        :title="scen.title"
      >
        {{ idx < currentScenarioIndex ? '✓' : idx + 1 }}
      </button>
    </div>
  </div>

  <!-- RECHTS IN HEADER: Fase-indicator + Sluitknop -->
  <div class="flex items-center gap-3">
    <!-- Fase-badge -->
    <div class="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
      <span class="text-xs font-bold"
        :class="currentPhase === 'A' ? 'text-indigo-600' : 'text-emerald-600'"
      >
        {{ currentPhase === 'A' ? '① Krachten tekenen' : '② Krachtenbalans' }}
      </span>
    </div>
    <!-- Sluitknop met pulse-animatie (zie ForcesLabActivity.vue) -->
    <button @click="$emit('close')"
      class="p-2 md:p-3 bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-all shadow-inner relative"
      :class="{ 'ring-pulse-red': shouldPulse }">
      <PhX class="text-xl font-bold" />
    </button>
  </div>
</div>
```

---

## 11. Linker Paneel: SVG Canvas

**Container:**
```html
<div class="md:w-[42%] xl:w-[40%] flex flex-col gap-3 min-h-0 shrink-0">
  <div class="bg-white rounded-3xl shadow-xl border-4 border-slate-200 relative w-full flex items-center justify-center overflow-hidden flex-1 min-h-[320px]">
    <svg viewBox="0 0 300 420" class="w-full h-full drop-shadow-md">
      <!-- Inhoud: zie §11.1 t/m §11.6 -->
    </svg>
    <!-- Legenda: zie §11.7 -->
  </div>
</div>
```

### 11.1. Coördinatenstelsel

- ViewBox: `0 0 300 420` (portrait, hogere tank dan huidige code)
- Achtergrond: gridraster patroon (kopieer `<pattern id="grid">` exact van ForcesLabActivity.vue)
- Tank: x=40, y=30, breedte=220, hoogte=330, rx=10

**Sleutelpunten (y-coördinaten, vast):**
- `tankTop = 30`
- `tankBottom = 360` (tankTop + 330)
- `fluidSurface = 130`  ← waterlijn (bij niet-gas scenario's)
- `objectHeight = 60` (SVG pixels, vaste blokgrootte)
- `objectWidth = 60`
- `objectCenterX = 150` (horizontaal midden van tank)

### 11.2. Object Y-positie per Scenario (Computed)

```js
const objectY = computed(() => {
  const s = currentScenario.value
  const fluidSurface = 130
  const objectHeight = 60

  if (s.behavior === 'zinkt') {
    return 355 - objectHeight / 2  // ≈ 325: rust op de bodem van tank
  }
  if (s.behavior === 'zweeft') {
    return 230  // midden in de vloeistof
  }
  if (s.behavior === 'stijgt') {
    return 155  // net onder wateroppervlak, opwaartse beweging gesuggereerd
  }
  if (s.behavior === 'drijft') {
    // 60% ondergedompeld → 36px onder oppervlak, 24px boven
    // center = fluidSurface + 36 - objectHeight/2 = 130 + 36 - 30 = 136
    const submergedPx = (percentage_onder.value / 100) * objectHeight
    return fluidSurface + submergedPx - objectHeight / 2
  }
  return 200  // fallback
})
```

### 11.3. Vloeistoftank SVG-elementen

```svg
<!-- Raster -->
<rect width="100%" height="100%" fill="url(#grid)" />

<!-- Tank achtergrond (glas-effect) -->
<rect x="40" y="30" width="220" height="330" rx="10"
      class="fill-slate-50 stroke-slate-300" stroke-width="4" />

<!-- Vloeistof of Gas (conditioneel) -->
<!-- Scenario isGas=false: watervisualisatie -->
<g v-if="!currentScenario.isGas">
  <!-- Watervulling -->
  <rect x="44" :y="130" width="212" :height="316"
        fill="url(#waterGradient)" />
  <!-- Golfoppervlak (wave path — zie §11.3.1) -->
  <path :d="wavePath" stroke="#38bdf8" stroke-width="2"
        fill="#38bdf8" fill-opacity="0.4"/>
  <!-- Bellen (kopie van bestaande code) -->
  <circle cx="80" cy="340" r="2" fill="white" opacity="0.5" class="bubble" style="animation-duration:5s"/>
  <circle cx="180" cy="350" r="1.5" fill="white" opacity="0.6" class="bubble" style="animation-duration:4.5s; animation-delay:1.5s"/>
  <circle cx="220" cy="345" r="2.5" fill="white" opacity="0.4" class="bubble" style="animation-duration:6s; animation-delay:0.8s"/>
</g>

<!-- Scenario isGas=true: luchtvisualisatie -->
<g v-else>
  <rect x="44" y="34" width="212" height="322"
        fill="rgb(203 213 225 / 0.3)" />
  <text x="150" y="200" text-anchor="middle" font-size="48"
        class="fill-slate-400/20 font-extrabold select-none pointer-events-none">
    LUCHT
  </text>
  <!-- Gestippelde lijn als referentie -->
  <line x1="40" y1="130" x2="260" y2="130"
        stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 4" />
</g>

<!-- Glasreflectie-effect (decoratief) -->
<polygon points="45,34 258,34 235,358 68,358"
         fill="white" opacity="0.07" class="pointer-events-none" />

<!-- Tank kaders (boven de vloeistof) -->
<rect x="40" y="30" width="220" height="330" rx="10"
      fill="none" class="stroke-slate-300" stroke-width="4" />
```

#### 11.3.1. Golfpad (wave path)

```js
const wavePath = computed(() => {
  const y = 130
  return `M 43 ${y} C 100 ${y - 8}, 200 ${y + 8}, 257 ${y} L 257 362 L 43 362 Z`
})
```

### 11.4. Water Gradient Definitie

```svg
<defs>
  <linearGradient id="waterGradient" x1="0.5" y1="0" x2="0.5" y2="1">
    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.55" />
    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.75" />
  </linearGradient>
</defs>
```

### 11.5. Het Object (Voorwerp)

```svg
<!-- Physics group: object beweegt via transition naar correcte Y-positie -->
<g :transform="`translate(${150}, ${objectY})`"
   class="transition-transform duration-1000 ease-out">

  <!-- Object achtergrond blok -->
  <rect x="-30" y="-30" width="60" height="60" rx="6"
        class="fill-amber-100 stroke-amber-500" stroke-width="3.5" />

  <!-- Emoji label -->
  <text x="0" y="10" text-anchor="middle" font-size="30"
        class="select-none pointer-events-none">
    {{ currentScenario.emoji }}
  </text>

  <!-- Submerged overlay: semi-transparante blauwe overlay op het ONDERGEDOMPELD deel -->
  <!-- Alleen relevant bij 'drijft' (gedeeltelijke onderdompeling) -->
  <!-- Berekend: submergedTopY = max(-30, -(30 - submergedPx)) -->
  <!-- Clip: van submergedTopY tot y=30 -->
  <rect v-if="currentScenario.behavior === 'drijft'"
        x="-30"
        :y="-(30 - (percentage_onder.value / 100 * 60))"
        width="60"
        :height="percentage_onder.value / 100 * 60"
        rx="6"
        fill="#38bdf8" fill-opacity="0.25"
        class="pointer-events-none" />

</g>
```

### 11.6. Krachtvectoren (Student-getekend, Proportionele Lengten)

De vectoren worden getekend in hetzelfde transform-groep als het object (zodat ze meebewegen).

#### Vectorlengten (proportioneel)

```js
const vProps = computed(() => {
  const BASE = 60     // basispixels voor de kleinste kracht
  const MAX = 120     // maximale vectorlengte
  const MIN = 18      // minimale zichtbare lengte (voor bijna-nulkracht)

  const fzN = Fz.value
  const faN = FA_actual.value
  const maxForce = Math.max(fzN, faN)

  const scale = (f) => {
    if (maxForce === 0) return BASE
    return Math.max(MIN, Math.min(MAX, (f / maxForce) * BASE + MIN))
  }

  return {
    fz: { len: scale(fzN) },
    fa: { len: scale(faN) }
  }
})
```

Zo zijn de pijlen voor "zinken" duidelijk ongelijk (Fz veel langer), en voor "zweven" exact even lang.

#### Arrow Markers (in `<defs>`)

```svg
<marker id="arrowFz" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="5" markerHeight="5" orient="auto-start-reverse">
  <path d="M 0 0 L 10 5 L 0 10 z" class="fill-sky-500" />
</marker>
<marker id="arrowFa" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="5" markerHeight="5" orient="auto-start-reverse">
  <path d="M 0 0 L 10 5 L 0 10 z" class="fill-emerald-500" />
</marker>
```

#### Fz Vector (sky-blue, neerwaarts)

```svg
<!-- Fz Vector: verschijnt wanneer origin='center' en direction='down' -->
<g v-if="inputs.fz.origin === 'center' && inputs.fz.direction === 'down'"
   class="transition-opacity duration-300 pointer-events-none">
  <line x1="0" y1="0" x2="0" :y2="vProps.fz.len"
        class="stroke-sky-500" stroke-width="3.5"
        marker-end="url(#arrowFz)" />
  <text x="-14" :y="vProps.fz.len / 2 + 5"
        class="fill-sky-700 font-extrabold pointer-events-none select-none"
        font-size="11" text-anchor="end">
    F<tspan font-size="8" dy="2">z</tspan>
  </text>
</g>
<!-- Fz opwaarts (fout → toch tonen, maar student krijgt feedback) -->
<g v-if="inputs.fz.origin === 'center' && inputs.fz.direction === 'up'"
   class="pointer-events-none">
  <line x1="0" y1="0" x2="0" :y2="-vProps.fz.len"
        class="stroke-sky-500" stroke-width="3.5"
        marker-end="url(#arrowFz)" />
  <text x="-14" :y="-vProps.fz.len / 2 - 3"
        class="fill-sky-700 font-extrabold pointer-events-none select-none"
        font-size="11" text-anchor="end">
    F<tspan font-size="8" dy="2">z</tspan>
  </text>
</g>
```

#### FA Vector (emerald-green, opwaarts)

Zelfde structuur als Fz maar met emerald kleuren, `marker-end="url(#arrowFa)"`, tekst rechts (`x="14"`, `text-anchor="start"`), en de richting gespiegeld:
- `direction === 'up'` → line van (0,0) naar (0, -vProps.fa.len)  
- `direction === 'down'` → line van (0,0) naar (0, vProps.fa.len)

```svg
<g v-if="inputs.fa.origin === 'center' && inputs.fa.direction === 'up'"
   class="transition-opacity duration-300 pointer-events-none">
  <line x1="0" y1="0" x2="0" :y2="-vProps.fa.len"
        class="stroke-emerald-500" stroke-width="3.5"
        marker-end="url(#arrowFa)" />
  <text x="14" :y="-vProps.fa.len / 2 - 3"
        class="fill-emerald-700 font-extrabold pointer-events-none select-none"
        font-size="11" text-anchor="start">
    F<tspan font-size="8" dy="2">A</tspan>
  </text>
</g>
<g v-if="inputs.fa.origin === 'center' && inputs.fa.direction === 'down'"
   class="pointer-events-none">
  <line x1="0" y1="0" x2="0" :y2="vProps.fa.len"
        class="stroke-emerald-500" stroke-width="3.5"
        marker-end="url(#arrowFa)" />
  <text x="14" :y="vProps.fa.len / 2 + 5"
        class="fill-emerald-700 font-extrabold pointer-events-none select-none"
        font-size="11" text-anchor="start">
    F<tspan font-size="8" dy="2">A</tspan>
  </text>
</g>
```

### 11.6.1. Interactiepunt: Zwaartepunt (center)

```svg
<!-- Zwaartepunt dot (altijd zichtbaar op het object) -->
<g :transform="`translate(150, ${objectY})`" class="pointer-events-auto">
  <g @mouseenter="hoveredPoint = 'center'" @mouseleave="hoveredPoint = null">
    <circle cx="0" cy="0" r="7"
            class="fill-slate-800 stroke-white transition-all duration-200 hover:r-9 cursor-help"
            stroke-width="2" />
    <!-- Tooltip -->
    <g v-if="hoveredPoint === 'center'">
      <rect x="-80" y="-40" width="160" height="22" rx="4"
            class="fill-slate-900/95" />
      <text x="0" y="-25" text-anchor="middle"
            class="fill-white pointer-events-none"
            font-size="10" font-weight="700">
        Zwaartepunt / Massamiddelpunt
      </text>
    </g>
  </g>
</g>
```

### 11.7. Legenda (absolute overlay, linksonder)

```html
<div class="absolute bottom-4 left-4 flex flex-col gap-1.5 text-[10px] md:text-xs font-bold tracking-wider">
  <div class="flex items-center gap-2">
    <div class="w-5 h-1.5 bg-sky-500 rounded"></div>
    <span class="bg-white/85 px-2 py-1 rounded border border-slate-200">
      Zwaartekracht (F<sub>z</sub>)
    </span>
  </div>
  <div class="flex items-center gap-2">
    <div class="w-5 h-1.5 bg-emerald-500 rounded"></div>
    <span class="bg-white/85 px-2 py-1 rounded border border-slate-200">
      Archimedeskracht (F<sub>A</sub>)
    </span>
  </div>
</div>
```

### 11.8. SI-Eenhedeninformatiekaart (absolute overlay, rechtsboven in canvas)

Kleine informatiekaart die de scenario-gegevens toont BINNEN de canvas (rechtsboven), zodat de student de waarden altijd ziet terwijl hij tekent:

```html
<div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 border border-slate-200 shadow-sm text-[9px] md:text-[10px] font-mono space-y-0.5 min-w-[130px]">
  <div class="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Gegevens</div>
  <div class="flex justify-between gap-2">
    <span class="text-slate-500">ρ<sub>obj</sub></span>
    <span class="font-bold text-slate-800">{{ currentScenario.rho_obj.toLocaleString('nl-BE') }} kg/m³</span>
  </div>
  <div class="flex justify-between gap-2">
    <span class="text-slate-500">ρ<sub>vl</sub></span>
    <span class="font-bold text-slate-800">{{ currentScenario.rho_fluid.toLocaleString('nl-BE') }} kg/m³</span>
  </div>
  <div class="flex justify-between gap-2">
    <span class="text-slate-500">V</span>
    <span class="font-bold text-slate-800">{{ currentScenario.vol_obj_display }}</span>
  </div>
  <div class="flex justify-between gap-2 pt-0.5 border-t border-slate-100">
    <span class="text-slate-500">g</span>
    <span class="font-bold text-slate-800">9,81 N/kg</span>
  </div>
</div>
```

---

## 12. Rechter Paneel: Taakinterface

```html
<div class="md:w-[58%] xl:w-[60%] flex flex-col min-h-0 min-w-0">

  <!-- SCENARIO KOPTEKST (shrink-0) -->
  [zie §12.1]

  <!-- SCROLLBAAR TAAKVELD (flex-1 overflow-y-auto) -->
  <div class="flex-1 overflow-y-auto pr-2 pb-4 min-h-0 custom-scrollbar space-y-4">

    <!-- FASE A: Krachtenkaarten (altijd zichtbaar) -->
    [zie §12.2]

    <!-- FASE B: Krachtenbalans (zichtbaar zodra phaseALocked = true) -->
    [zie §12.3]

    <!-- FEEDBACK BANNER -->
    [zie §12.4]

    <!-- ACTIEKNOPPEN -->
    [zie §12.5]

  </div>
</div>
```

### 12.1. Scenario Koptekst

```html
<div class="mb-3 bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-lg shrink-0 relative overflow-hidden">
  <!-- Decoratieve achtergrondtekst -->
  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 pointer-events-none select-none">
    {{ currentScenario.emoji }}
  </div>

  <div class="relative z-10">
    <!-- Scenario nummer badge + titel -->
    <div class="flex items-center gap-2 mb-1">
      <span class="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
        Scenario {{ currentScenarioIndex + 1 }}/{{ scenarios.length }}
      </span>
      <span v-if="currentScenario.isGas"
            class="bg-slate-600 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
        ⚡ Gas
      </span>
    </div>

    <h3 class="font-extrabold text-base md:text-lg leading-tight mb-1">
      {{ currentScenario.title }}
    </h3>
    <p class="text-slate-300 text-xs md:text-sm leading-snug">
      {{ currentScenario.desc }}
    </p>
  </div>
</div>
```

### 12.2. Fase A: Krachtenkaarten (ForcesLab-stijl)

Dit is het HART van de activiteit. Kopieer de krachtenkaartstructuur exact van `ForcesLabActivity.vue` (template regels L745-L832), maar met de volgende aanpassingen:

**Aanpassingen t.o.v. ForcesLabActivity:**

1. **`viewMode` bestaat NIET in deze activiteit.** Er is maar één weergavemodus.
2. **De origin-selector heeft slechts 2 opties:** "Niet getekend / Geen" en "⚫ Zwaartepunt / Massamiddelpunt". Er is geen "surface"-optie omdat FA en Fz beide volume-/veldkrachten zijn die aangrijpen op het massamiddelpunt.
3. **Richtingsknoppen:** Alleen `↓` (neer) en `↑` (op). De `⟂`-knop bestaat niet.
4. **phaseALocked:** Wanneer `phaseALocked=true`, toon de krachtenkaarten in een "geslaagd"-stijl (groene rand, niet bewerkbaar, `pointer-events-none`).

**Krachtenkaarten config:**

```js
const vectorConfig = computed(() => [
  {
    id: 'fz',
    label: 'Zwaartekracht (Fz)',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-300',
    iconColor: 'text-sky-500',
    borderHighlight: 'border-sky-400'
  },
  {
    id: 'fa',
    label: 'Archimedeskracht (FA)',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    iconColor: 'text-emerald-500',
    borderHighlight: 'border-emerald-400'
  }
])
```

**Template voor één krachtenkaart:**

```html
<div v-for="force in vectorConfig" :key="force.id"
     class="bg-white rounded-2xl border-2 shadow-sm transition-all duration-300 overflow-hidden"
     :class="[
       force.colorClass,
       inputs[force.id].origin === 'none' ? 'opacity-80' : '',
       phaseALocked ? 'opacity-60 pointer-events-none' : ''
     ]">

  <!-- Kaarthoofding -->
  <div class="px-4 py-3 border-b flex items-center justify-between"
       :class="force.colorClass.includes('sky') ? 'border-sky-200' : 'border-emerald-200'">
    <div class="flex items-center gap-3">
      <PhNavigationArrow class="text-xl md:text-2xl" :class="force.iconColor" weight="fill" />
      <h4 class="font-extrabold text-base md:text-lg">{{ force.label }}</h4>
    </div>
    <!-- Trash knop (alleen als niet gelocked) -->
    <button v-if="!phaseALocked"
            @click="handleOriginClick(force.id, 'none')"
            class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title="Kracht Wissen">
      <PhTrash weight="fill" size="18" />
    </button>
    <!-- Check-icoon als gelocked en correct -->
    <PhCheckCircle v-if="phaseALocked" weight="fill"
                   class="text-emerald-500 text-xl" />
  </div>

  <!-- Kaartinhoud -->
  <div class="p-3 md:p-4 pb-5 space-y-4"
       :class="{'bg-slate-50/50': inputs[force.id].origin === 'none'}">

    <!-- STAP 1: Formuleer in een zin -->
    <div class="bg-indigo-50/60 -mx-3 -mt-3 mb-2 p-3 border-b border-indigo-100">
      <p class="text-[9px] font-bold uppercase tracking-widest text-indigo-800 mb-2 flex items-center gap-1">
        <PhNavigationArrow size="12" /> 1. Formuleer in een zin
      </p>
      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700 w-full">
        <span class="font-medium text-xs">De kracht uitgeoefend door</span>
        <select v-model="inputs[force.id].sender"
                class="bg-white border-2 border-indigo-200 rounded-lg px-2 py-1 font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[110px] shadow-sm appearance-none text-center text-xs">
          <option value="" disabled selected>Kies...</option>
          <option v-for="actor in actors" :key="'s-'+actor.id" :value="actor.id">
            {{ actor.label }}
          </option>
        </select>
        <span class="font-medium text-xs">op</span>
        <select v-model="inputs[force.id].receiver"
                class="bg-white border-2 border-indigo-200 rounded-lg px-2 py-1 font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[110px] shadow-sm appearance-none text-center text-xs">
          <option value="" disabled selected>Kies...</option>
          <option v-for="actor in actors" :key="'r-'+actor.id" :value="actor.id">
            {{ actor.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- STAP 2 & 3: Grid met aangrijpingspunt en richting -->
    <div class="grid grid-cols-2 gap-3">

      <!-- STAP 2: Startpunt -->
      <div>
        <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
          2. Aangrijpingspunt
        </p>
        <select
          :value="inputs[force.id].origin"
          @change="handleOriginClick(force.id, $event.target.value)"
          class="w-full bg-white border-2 rounded-lg px-2 py-1.5 font-bold focus:outline-none shadow-sm cursor-pointer appearance-none text-xs"
          :class="inputs[force.id].origin === 'none'
            ? 'border-slate-200 text-slate-400'
            : 'border-amber-400 bg-amber-50/30 text-amber-900'"
        >
          <option value="none">Niet getekend</option>
          <option value="center">⚫ Zwaartepunt</option>
        </select>
      </div>

      <!-- STAP 3: Richting & Zin -->
      <div :class="{'opacity-30 pointer-events-none grayscale': inputs[force.id].origin === 'none'}">
        <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
          3. Richting & Zin
        </p>
        <div class="flex gap-2">
          <button @click="inputs[force.id].direction = 'down'"
                  class="flex-1 py-2 rounded-xl border-2 transition-all flex justify-center items-center min-h-[42px]"
                  :class="inputs[force.id].direction === 'down'
                    ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                    : 'border-slate-200 text-slate-400 bg-white hover:border-slate-400'">
            <PhArrowDown weight="bold" size="20" />
          </button>
          <button @click="inputs[force.id].direction = 'up'"
                  class="flex-1 py-2 rounded-xl border-2 transition-all flex justify-center items-center min-h-[42px]"
                  :class="inputs[force.id].direction === 'up'
                    ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                    : 'border-slate-200 text-slate-400 bg-white hover:border-slate-400'">
            <PhArrowUp weight="bold" size="20" />
          </button>
        </div>
      </div>
    </div>

  </div>
</div>
```

**`handleOriginClick` functie:**

```js
function handleOriginClick(forceId, originStr) {
  inputs.value[forceId].origin = originStr
  if (originStr === 'none') {
    inputs.value[forceId].direction = 'none'
    inputs.value[forceId].sender = ''
    inputs.value[forceId].receiver = ''
  }
}
```

### 12.3. Fase B: Krachtenbalans Sectie

Deze sectie verschijnt uitsluitend wanneer `phaseALocked === true` (d.w.z. nadat fase A correct is bevestigd en de student op "Ga naar Krachtenbalans →" heeft geklikt en `currentPhase === 'B'`).

```html
<!-- Fase B sectie: alleen tonen in fase B -->
<div v-if="currentPhase === 'B'"
     class="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">

  <!-- Header krachtenbalans -->
  <div class="px-4 py-3 bg-slate-800 text-white flex items-center gap-3">
    <PhWaves weight="fill" size="20" class="text-indigo-300" />
    <h4 class="font-extrabold text-base">Krachtenbalans</h4>
  </div>

  <div class="p-4 space-y-5">

    <!-- Berekende waarden (read-only tabel) -->
    <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
      <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Berekende krachten</p>
      <div class="space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-slate-600">Massa (m = ρ · V)</span>
          <span class="font-mono font-bold text-slate-800 text-sm">
            {{ mass.toFixed(3) }} kg
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-sky-600">Zwaartekracht (F<sub>z</sub> = m · g)</span>
          <span class="font-mono font-bold text-sky-700 text-sm">
            {{ Fz.toFixed(2) }} N
          </span>
        </div>
        <div class="flex justify-between items-center border-t border-slate-100 pt-1.5">
          <!-- Voor 'drijft': toon V_onder apart -->
          <span class="text-xs font-medium text-emerald-600">
            <template v-if="currentScenario.behavior === 'drijft'">
              Archimedeskracht (F<sub>A</sub> = ρ<sub>vl</sub> · V<sub>onder</sub> · g)<br/>
              <span class="text-[10px] text-slate-400">
                V<sub>onder</sub> = {{ (vol_onder * 1e6).toFixed(0) }} cm³
                ({{ percentage_onder }}% ondergedompeld)
              </span>
            </template>
            <template v-else>
              Archimedeskracht (F<sub>A</sub> = ρ<sub>vl</sub> · V · g)
            </template>
          </span>
          <span class="font-mono font-bold text-emerald-700 text-sm">
            {{ FA_actual.toFixed(2) }} N
          </span>
        </div>
      </div>
    </div>

    <!-- VRAAG 1: Vergelijk Fz en FA -->
    <div>
      <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
        1. Vergelijk de krachten
      </p>
      <div class="flex gap-2">
        <button v-for="opt in [
                  { id: 'greater', label: 'Fz > FA' },
                  { id: 'equal',   label: 'Fz = FA' },
                  { id: 'less',    label: 'Fz < FA' }
                ]"
                :key="opt.id"
                @click="balanceInputs.comparison = opt.id"
                class="flex-1 py-2 px-1 text-xs md:text-sm font-extrabold rounded-xl border-2 transition-all"
                :class="balanceInputs.comparison === opt.id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                  : 'border-slate-200 text-slate-500 bg-white hover:border-indigo-300 hover:text-indigo-600'">
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- VRAAG 2: Wat doet het voorwerp? -->
    <div>
      <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
        2. Wat doet {{ currentScenario.objectLabel }}?
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="opt in [
                  { id: 'zinkt',   label: 'Zinkt',  icon: '↓', color: 'sky' },
                  { id: 'zweeft',  label: 'Zweeft', icon: '—', color: 'slate' },
                  { id: 'stijgt',  label: 'Stijgt', icon: '↑', color: 'amber' },
                  { id: 'drijft',  label: 'Drijft', icon: '≈', color: 'emerald' }
                ]"
                :key="opt.id"
                @click="balanceInputs.behavior = opt.id"
                class="py-2.5 px-3 text-xs md:text-sm font-extrabold rounded-xl border-2 transition-all flex items-center justify-center gap-1.5"
                :class="balanceInputs.behavior === opt.id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                  : 'border-slate-200 text-slate-500 bg-white hover:border-indigo-300 hover:text-indigo-600'">
          <span class="text-base leading-none">{{ opt.icon }}</span>
          {{ opt.label }}
        </button>
      </div>
    </div>

  </div>
</div>
```

### 12.4. Feedback Banner

Identiek aan ForcesLabActivity.vue. Plaatsen na de krachtenkaarten/balans-sectie, vóór de knoppen:

```html
<div v-if="feedback"
     class="p-3 md:p-4 rounded-xl flex gap-3 items-start shadow-sm border"
     :class="feedback.type === 'success'
       ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
       : 'bg-red-50 text-red-900 border-red-200'">
  <component
    :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle"
    class="text-xl md:text-2xl shrink-0 mt-0.5" />
  <p class="font-semibold text-xs md:text-sm leading-snug">{{ feedback.text }}</p>
</div>
```

### 12.5. Actieknoppen

Er zijn 4 toestandsafhankelijke knoppen. Gebruik `v-if`/`v-else-if`/`v-else`:

```html
<div class="flex gap-3 pt-2">

  <!-- Knop A1: Fase A, niet correct → "Controleer Krachten" -->
  <button v-if="currentPhase === 'A' && !isCorrect"
          @click="checkPhaseA"
          class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
    <PhPlayCircle class="text-xl" weight="fill" /> Controleer Krachten
  </button>

  <!-- Knop A2: Fase A, correct → "Ga naar Krachtenbalans" -->
  <button v-else-if="currentPhase === 'A' && isCorrect"
          @click="advanceToPhaseB"
          class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl shadow-md shadow-indigo-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
    Ga naar Krachtenbalans <PhArrowRight class="text-xl" weight="bold" />
  </button>

  <!-- Knop B1: Fase B, niet correct → "Controleer Balans" -->
  <button v-else-if="currentPhase === 'B' && !isCorrect"
          @click="checkPhaseB"
          class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
    <PhPlayCircle class="text-xl" weight="fill" /> Controleer Balans
  </button>

  <!-- Knop B2: Fase B, correct → "Volgende Scenario" of "Labo Afronden" -->
  <button v-else-if="currentPhase === 'B' && isCorrect"
          @click="nextScenario"
          class="flex-1 font-extrabold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
          :class="isDone
            ? 'bg-brand-orange hover:bg-orange-600 text-white shadow-orange-500/30'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'">
    {{ isDone ? '🎉 Labo Afronden' : 'Volgende Scenario' }}
    <PhArrowRight class="text-xl" weight="bold" />
  </button>

</div>
```

**`advanceToPhaseB` functie:**

```js
function advanceToPhaseB() {
  currentPhase.value = 'B'
  feedback.value = null
  isCorrect.value = false
}
```

**`nextScenario` functie:**

```js
function nextScenario() {
  if (currentScenarioIndex.value < scenarios.length - 1) {
    currentScenarioIndex.value++
    resetState()
  } else {
    allScenariosComplete.value = true
    emit('complete')
  }
}

function resetState() {
  currentPhase.value = 'A'
  inputs.value = {
    fz: { origin: 'none', direction: 'none', sender: '', receiver: '' },
    fa: { origin: 'none', direction: 'none', sender: '', receiver: '' }
  }
  balanceInputs.value = { comparison: null, behavior: null }
  feedback.value = null
  isCorrect.value = false
  phaseALocked.value = false
}

function goToScenario(idx) {
  // Alleen toegankelijk voor al voltooide scenario's
  currentScenarioIndex.value = idx
  resetState()
}
```

---

## 13. Validatielogica

### 13.1. checkPhaseA()

```js
function checkPhaseA() {
  const s = currentScenario.value
  let correct = true
  let msg = ''

  // Helper: check visueel (origin + direction)
  const checkVis = (key, expectedOrigin, expectedDir) => {
    const inp = inputs.value[key]
    return inp.origin === expectedOrigin && inp.direction === expectedDir
  }

  // Helper: check tekst (sender + receiver)
  const checkTxt = (key, expectedSender, expectedReceiver) => {
    const inp = inputs.value[key]
    return inp.sender === expectedSender && inp.receiver === expectedReceiver
  }

  // --- Valideer Fz ---
  // Verwacht: origin='center', direction='down', sender='aarde', receiver='voorwerp'
  if (!checkVis('fz', 'center', 'down')) {
    correct = false
    if (inputs.value.fz.origin === 'none') {
      msg = `De zwaartekracht is nog niet getekend. Kies 'Zwaartepunt' als aangrijpingspunt voor Fz.`
    } else if (inputs.value.fz.direction === 'up') {
      msg = `De zwaartekracht (Fz) trekt altijd naar de aarde, dus naar beneden (↓). Pas de richting aan.`
    } else if (inputs.value.fz.direction === 'none') {
      msg = `Je hebt een aangrijpingspunt gekozen voor Fz, maar nog geen richting. Kies ↓ of ↑.`
    } else {
      msg = `Controleer het aangrijpingspunt van Fz. De zwaartekracht grijpt aan op het zwaartepunt.`
    }
  } else if (!checkTxt('fz', 'aarde', 'voorwerp')) {
    correct = false
    if (inputs.value.fz.sender !== 'aarde') {
      msg = `Wie oefent de zwaartekracht uit? Het is de aarde die ${s.objectLabel} aantrekt, niet ${inputs.value.fz.sender === 'voorwerp' ? 'het voorwerp zelf' : s.fluidLabel}.`
    } else {
      msg = `Op wie werkt de zwaartekracht? De aarde trekt ${s.objectLabel} aan, niet ${actors.value.find(a => a.id === inputs.value.fz.receiver)?.label || '?'}.`
    }
  }

  // --- Valideer FA (alleen als Fz al correct is, om overrompeling te vermijden) ---
  else if (!checkVis('fa', 'center', 'up')) {
    correct = false
    if (inputs.value.fa.origin === 'none') {
      msg = `De archimedeskracht is nog niet getekend. Kies 'Zwaartepunt' als aangrijpingspunt voor FA.`
    } else if (inputs.value.fa.direction === 'down') {
      msg = `De archimedeskracht (FA) is een OPwaartse kracht — ze duwt het voorwerp omhoog (↑). Pas de richting aan.`
    } else if (inputs.value.fa.direction === 'none') {
      msg = `Je hebt een aangrijpingspunt gekozen voor FA, maar nog geen richting.`
    } else {
      msg = `Controleer het aangrijpingspunt van FA.`
    }
  } else if (!checkTxt('fa', s.fluidActorId, 'voorwerp')) {
    correct = false
    if (inputs.value.fa.sender === 'aarde') {
      msg = `De archimedeskracht wordt uitgeoefend DOOR ${s.fluidLabel}, niet door de aarde. Het fluïdum duwt omhoog.`
    } else if (inputs.value.fa.sender === 'voorwerp') {
      msg = `Het voorwerp kan geen kracht uitoefenen op zichzelf. FA wordt uitgeoefend door ${s.fluidLabel}.`
    } else if (inputs.value.fa.receiver !== 'voorwerp') {
      msg = `Op wie werkt de archimedeskracht? ${s.fluidLabel.charAt(0).toUpperCase() + s.fluidLabel.slice(1)} oefent FA uit OP ${s.objectLabel}.`
    } else {
      msg = `Controleer de DOOR/OP-omschrijving van de archimedeskracht.`
    }
  }

  if (correct) {
    isCorrect.value = true
    phaseALocked.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! Je hebt beide krachten juist getekend en omschreven. ✓ Fz wijst naar beneden (aarde trekt ${s.objectLabel} aan). ✓ FA wijst naar boven (${s.fluidLabel} duwt ${s.objectLabel} omhoog). Ga nu naar de krachtenbalans.`
    }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: msg }
  }
}
```

### 13.2. checkPhaseB()

```js
function checkPhaseB() {
  const s = currentScenario.value
  let correct = true
  let msg = ''

  // Valideer vergelijking
  if (balanceInputs.value.comparison === null) {
    correct = false
    msg = 'Selecteer eerst hoe Fz en FA zich tot elkaar verhouden (Fz > FA, Fz = FA, of Fz < FA).'
  } else if (balanceInputs.value.comparison !== s.expectedComparison) {
    correct = false
    const fzVal = Fz.value.toFixed(2)
    const faVal = FA_actual.value.toFixed(2)
    if (s.expectedComparison === 'greater') {
      msg = `Kijk naar de berekende waarden: Fz = ${fzVal} N en FA = ${faVal} N. Welke is groter?`
    } else if (s.expectedComparison === 'equal') {
      msg = `Kijk naar de berekende waarden: Fz = ${fzVal} N en FA = ${faVal} N. Ze zijn (vrijwel) gelijk. Is er een resulterende kracht?`
    } else {
      msg = `Kijk naar de berekende waarden: Fz = ${fzVal} N en FA = ${faVal} N. Welke is groter?`
    }
  } else if (balanceInputs.value.behavior === null) {
    correct = false
    msg = 'Kies nu wat het voorwerp doet: zinkt het, zweeft het, stijgt het, of drijft het?'
  } else if (balanceInputs.value.behavior !== s.expectedBehavior) {
    correct = false
    // Specifieke misconceptie-hints per fout antwoord:
    const got = balanceInputs.value.behavior
    const exp = s.expectedBehavior
    if (exp === 'zinkt' && got === 'zweeft') {
      msg = `Bij zweven is de resulterende kracht nul (Fz = FA). Hier is Fz > FA — de resulterende kracht wijst naar beneden. Het voorwerp versnelt dus naar beneden: het zinkt.`
    } else if (exp === 'zweeft' && got === 'zinkt') {
      msg = `Fz = FA: de resulterende kracht is nul. Daardoor behoudt het voorwerp zijn toestand (eerste wet van Newton). Ondergedompeld en in rust → het zweeft.`
    } else if (exp === 'stijgt' && got === 'drijft') {
      msg = `'Drijven' betekent gedeeltelijk boven het vloeistofoppervlak. Als het voorwerp VOLLEDIG ondergedompeld is en FA > Fz, beweegt het omhoog: het stijgt.`
    } else if (exp === 'drijft' && got === 'stijgt') {
      msg = `Stijgen geldt wanneer het voorwerp volledig ondergedompeld is. Hier is het voorwerp gedeeltelijk boven het water — in evenwicht. Dat noemen we drijven.`
    } else if (exp === 'drijft' && got === 'zweeft') {
      msg = `Zweven = volledig ondergedompeld én in evenwicht. Drijven = gedeeltelijk ondergedompeld én in evenwicht. Kijk naar de afbeelding: is het voorwerp volledig in de vloeistof?`
    } else {
      msg = `Dat klopt niet helemaal. Denk na over de richting van de resulterende kracht (= FA − Fz of Fz − FA).`
    }
  }

  if (correct) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: s.explanation }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: msg }
  }
}
```

---

## 14. Feedbackberichten — Volledige Nederlandstalige Strings

### 14.1. Fase A succesberichten (per scenario, gebruikt in `checkPhaseA`)

Alle scenario's gebruiken dezelfde succestekst voor fase A (zie §13.1). Scenario-specifieke uitleg zit in fase B.

### 14.2. Fase B succesberichten (per scenario, gebruikt in `scenarios[].explanation`)

| Scenario | Succestekst |
|----------|-------------|
| 0: Zinken | `'Correct! De zwaartekracht (Fz = 7,75 N) is veel groter dan de archimedeskracht (FA = 0,98 N). De resulterende kracht wijst naar beneden: het ijzeren blok zinkt. Dit klopt: ρijzer (7900 kg/m³) > ρwater (1000 kg/m³).'` |
| 1: Zweven | `'Uitstekend! Fz ≈ FA ≈ 0,50 N. De krachten houden elkaar perfect in evenwicht: translatie-evenwicht (Fres = 0). De eerste wet van Newton zegt dat het voorwerp zijn toestand behoudt → het ei zweeft. ρei = ρzoutwater = 1030 kg/m³.'` |
| 2: Stijgen | `'Perfect! FA = 0,981 N > Fz = 0,245 N. De resulterende kracht wijst naar boven: de kurken stop versnelt omhoog en stijgt. Dit klopt: ρkurk (250 kg/m³) < ρwater (1000 kg/m³).'` |
| 3: Drijven | `'Bravo! Het houten blok drijft in evenwicht: Fz = FA ≈ 1,18 N. Slechts 60% (120 cm³) is ondergedompeld — net genoeg om evenwicht te bereiken. ρhout (600 kg/m³) < ρwater (1000 kg/m³), dus het blok drijft aan het oppervlak.'` |
| 4: Luchtballon | `'Geweldig! FA = 122,6 N > Fz = 88,3 N. De archimedeskracht van de koude lucht op de ballon is groter dan de zwaartekracht. De ballon stijgt op! De wet van Archimedes werkt ook in gassen: koude lucht (1,25 kg/m³) is dichter dan de warme lucht + mantel (0,90 kg/m³).'` |

---

## 15. SI-Eenheden — Volledig Overzicht

Elke numerieke waarde in het component MOET vergezeld zijn van een eenheid. Gebruik de volgende notaties consistent:

| Grootheid | Symbool | Eenheid | Weergave in UI |
|-----------|---------|---------|----------------|
| Massadichtheid vloeistof | ρvl | kg/m³ | `1000 kg/m³` |
| Massadichtheid object | ρobj | kg/m³ | `7900 kg/m³` |
| Volume object (totaal) | V | m³ of cm³ | gebruik `cm³` voor kleinere volumes (bijv. `100 cm³`); gebruik `m³` alleen als V ≥ 0.01 m³ |
| Ondergedompeld volume | Vonder | m³ of cm³ | zelfde regel als V |
| Massa | m | kg | `0,79 kg` (gebruik Belgische kommanotatie: punt als duizendtal, komma als decimaal scheidingsteken — of laat Vue `toFixed()` + replace('.',',') doen) |
| Zwaartekracht | Fz | N | `7,75 N` |
| Archimedeskracht | FA | N | `0,98 N` |
| Zwaarteveldsterkte | g | N/kg | `9,81 N/kg` |

**Implementatienota voor decimaalnotatie:** In Belgisch onderwijs wordt de komma als decimaal scheidingsteken gebruikt. Gebruik `value.toFixed(2).replace('.', ',')` voor weergave, of configureer `Intl.NumberFormat` met `'nl-BE'`. Gebruik dit **enkel voor weergave**; interne berekeningen werken met JS decimale getallen (punt).

**Volume-omzettingsfunctie:**

```js
function displayVolume(vol_m3) {
  const cm3 = vol_m3 * 1e6
  if (cm3 < 1000) {
    return `${cm3.toFixed(0)} cm³`
  }
  return `${vol_m3.toFixed(4)} m³`
}
```

---

## 16. Vrij-Verkennen Modus (Bonusfase na afronding)

Na `emit('complete')` (of als `allScenariosComplete` true is en de parent de modal niet sluit), kan het component optioneel een vrij-verkennen modus tonen. Dit is een APARTE sectie die NIET zichtbaar is tijdens de taakfase.

**Trigger:** `allScenariosComplete === true`

**Implementatie:** Voeg een `v-if="allScenariosComplete"` toe aan een nieuwe sectie NA de scenario-flow, of toon deze in het rechter paneel nadat alle scenario's zijn afgerond.

### 16.1. Sliders Specificatie

| Slider | Label | Min | Max | Stap | Eenheid |
|--------|-------|-----|-----|------|---------|
| ρ fluïdum | `Dichtheid fluïdum (ρ_vl)` | 100 | 14000 | 10 | kg/m³ |
| ρ object | `Dichtheid object (ρ_obj)` | 10 | 14000 | 10 | kg/m³ |
| V object | `Volume object (V)` | 10 | 10000 | 10 | cm³ → intern m³ = V_cm3 / 1e6 |

### 16.2. Live Berekeningen Weergave

Toon hetzelfde informatieblok als in Fase B, maar nu reactief op de sliders:
- m, Fz, FA_max (volledig), vol_onder, % ondergedompeld
- Gedragslabel: "Zinkt" / "Zweeft" / "Stijgt" / "Drijft" (dynamisch berekend)

### 16.3. Canvas Vrij-Verkennen

In vrij-verkennen modus wordt de canvas dynamisch bijgewerkt:
- Object positie berekend zoals in §11.2 maar nu op basis van slider-waarden
- Vectorlengten proportioneel met dynamische krachten
- Golfoppervlak reageert op verandering van volume (waterstijging bij groter object)
- Geen vector-input panel — pure observatie

---

## 17. Wat Te Bewaren Uit Bestaande Code

| Element | Bestand | Regels | Actie |
|---------|---------|--------|-------|
| Fullscreen + keyboard logica | ArchimedesActivity.vue | L220-L262 | Kopieer exact (identiek aan ForcesLab) |
| Bubble animatie CSS | ArchimedesActivity.vue | `.bubble` style L616-620 | Kopieer exact |
| `ring-pulse-red` CSS | ArchimedesActivity.vue | L573-576 | Kopieer exact |
| `custom-scrollbar` CSS | ArchimedesActivity.vue | L596-609 | Kopieer exact |
| `waterGradient` definitie | ArchimedesActivity.vue | L322-325 | Kopieer, pas coördinaten aan |
| Arrowmarker definitie patroon | ForcesLabActivity.vue | L514-538 | Kopieer, pas kleuren aan voor Fa/Fz |
| DOOR/OP select interface | ForcesLabActivity.vue | L765-832 | Kopieer als basis, pas aan zoals §12.2 |
| Feedback banner template | ForcesLabActivity.vue | L836-841 | Kopieer exact |
| Sluitknop pulse-animatie | ForcesLabActivity.vue | L473-477 | Kopieer exact |
| Grid patroon `<pattern id="grid">` | ForcesLabActivity.vue | L511-513 | Kopieer exact |

---

## 18. Wat Te Verwijderen / Vervangen

| Element | Reden |
|---------|-------|
| Alle sliders (`rho_vl`, `rho_obj`, `vol_obj`) in de taakfase | Veroorzaken chaos, de bugs (volume verandert tank) en pedagogisch niet juist in taakfase. Enkel in vrij-verkennen modus. |
| `handleManualInput()` functie | Niet nodig; sliders zijn weg uit taakfase. |
| `rhoVlRange`, `rhoObjRange`, `volObjRange` refs | Idem. |
| Scenario selector dropdown | Vervangen door lineaire progressie met voortgangspills (§10.1). |
| `selectedScenarioId` ref | Vervangen door `currentScenarioIndex`. |
| Hardcoded expected answers in `checkScenario()` | Vervangen door scenario-specifieke validatielogica (§13). |
| `faActual` computed die FA altijd = `max_Fa` geeft voor "zinkt" | Incorrect voor "drijven". Vervangen door `FA_actual` in §6. |
| Live resultaten tabel in de TAAK-fase (massa, Fz, FA_max, %onder) | Enkel tonen in Fase B krachtenbalans-sectie. In Fase A verleidt het de student tot kopiëren in plaats van begrijpen. |
| De origin selector optie "none" als enige echte keuze naast "center" | Behouden, maar vereenvoudigen: label "Niet getekend" en "⚫ Zwaartepunt". |
| `stateText` computed | Verwijder. Gedragsinformatie hoort in feedback, niet als altijd-zichtbare hint. |
| `viewMode` logica (object/punt/gecombineerd) | Niet relevant voor Archimedes. Beide krachten (Fz en FA) zijn volumekrachten → altijd vanuit zwaartepunt. |
| `isFgDisabledByMode` | Niet relevant. |

---

## 19. CSS Stijlen (scoped)

Kopieer de volgende stijlen exact uit de bestaande bestanden:

```css
/* ring-pulse-red — voor sluitknop animatie */
.ring-pulse-red {
  animation: ring-pulse 1s ease-out 3;
  @apply ring-2 ring-red-500 ring-offset-2;
}

/* Bubble animatie voor SVG bellen */
@keyframes bubble-rise {
  0%   { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
}
.bubble {
  animation: bubble-rise linear infinite;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgb(203 213 225); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgb(148 163 184); }
```

---

## 20. Aandachtspunten voor de Implementerende LLM

1. **Behoud exact de Vue Composition API stijl** van ForcesLabActivity.vue (geen Options API, geen `<script>` zonder `setup`).

2. **Gebruik altijd `ref()` voor veranderlijke waarden** en `computed()` voor afgeleide waarden. Definieer `scenarios` als een gewone `const` array (niet reactief), want de scenario-data verandert nooit.

3. **`vol_onder` is een computed die afhangt van `currentScenario`**, die afhangt van `currentScenarioIndex`. Zorg dat alle downstream computeds correct gekoppeld zijn.

4. **De canvas SVG en de force-input panel werken op hetzelfde `inputs` ref-object.** Elke wijziging in de panel-dropdowns werkt onmiddellijk door in de canvas-vectoren — dit is het kerninteractiepatroon van ForcesLab en moet behouden blijven.

5. **De object-positie in de canvas moet vloeiend animeren** bij scenariowisseling. Gebruik de Tailwind class `transition-transform duration-1000 ease-out` op de `<g>` die het object bevat (zie §11.5). De `objectY` computed waarde verandert bij `currentScenarioIndex` change, waardoor de CSS-transitie automatisch triggert.

6. **Proportionele vectorlengten** zijn essentieel voor begrip. De formule in §11.6 (vProps computed) MOET correct geïmplementeerd worden. Test met scenario 0 (zinken): de Fz-pijl moet zichtbaar langer zijn dan de FA-pijl. Test met scenario 1 (zweven): pijlen moeten gelijke lengte hebben.

7. **Kracht FA is altijd opwaarts.** Als een student `direction='down'` kiest voor FA, toon dit dan visueel (zodat ze de fout zien) en geef bij het controleren de feedback uit §13.1. **Verwijder de FA-vector niet automatisch** — laat de student het corrigeren.

8. **Scenario 3 (drijven): de canvas toont het object GEDEELTELIJK boven water.** Dit vereist een visueel duidelijke waterlijn die door het objectblok loopt. Gebruik de `clip-path` of de overlay-rect aanpak uit §11.5 om het onderdompelde deel te benadrukken.

9. **Scenario 4 (luchtballon) vereist een andere canvas-achtergrond** (grijs/lichtblauw, geen watergradient). Gebruik `v-if="!currentScenario.isGas"` om te schakelen, zoals gespecificeerd in §11.3.

10. **De actors computed property** genereert de selectie-opties voor DOOR/OP op basis van het huidige scenario (§9). Dit is cruciaal voor correcte validatie — de `fluidActorId` in het verwachte antwoord moet exact overeenkomen met de actor-id in de select-opties.

11. **`goToScenario(idx)` in de voortgangsbadge** mag enkel werken voor `idx < currentScenarioIndex.value` (reeds voltooide scenario's). Blokkeer navigatie naar toekomstige scenario's.

12. **`emit('complete')` moet getriggerd worden** wanneer alle 5 scenario's zijn afgerond (na checkPhaseB op scenario 4 → correct → "Labo Afronden" knop → `nextScenario()`). De parent (`App.vue`) markeert dan de activity als voltooid.

13. **Gebruik Tailwind klassen consistent** met het design system: `slate-*` voor neutrale kleuren, `sky-*` voor Fz, `emerald-*` voor FA, `indigo-*` voor interactieve elementen (knoppen fase B), en `brand.orange` voor de afrond-knop.

14. **Geen KaTeX nodig** in deze component — alle formules worden als platte tekst weergegeven (subscripts via HTML `<sub>` of SVG `<tspan>` met verlaagde font-size).

15. **Test de volgende edge cases:**
    - Student klikt "Controleer Krachten" zonder iets ingevuld → feedback: "Beide krachten moeten getekend zijn."
    - Student klikt "Controleer Balans" zonder vergelijking of gedrag → feedback: specifiek welk deel ontbreekt (§13.2)
    - Scenario 1 (zweven): FA en Fz zijn exact gelijk → pijlen exact even lang → vergelijkingsknop "Fz = FA" is correct
    - Scenario 3 (drijven): student kiest "zweeft" i.p.v. "drijft" → specifieke misconceptie-hint (§13.2)

---

## 21. Bestandslocatie en Integratie

- **Component:** `src/components/activities/ArchimedesActivity.vue` (vervang volledig)
- **Registratie:** `src/composables/useActivitySystem.js` — al geregistreerd als `archimedesActivity`. Geen wijzigingen nodig.
- **Props interface:** Identiek aan bestaand component (`isOpen`, `title`, `instruction`, `fullscreen`). Geen wijzigingen nodig in `App.vue` of lessondatabestanden.

---

## 22. Samenvatting van Kernveranderingen

| Oud | Nieuw |
|-----|-------|
| Alles tegelijk zichtbaar (chaos) | Twee gefaseerde stappen per scenario (A: krachten, B: balans) |
| Volume-slider verandert tank | Sliders verwijderd uit taakfase; alleen in vrij-verkennen |
| Geen SI-eenheden | Alle waarden met correcte eenheden (kg/m³, N, m³/cm³) |
| Alle vectoren even lang | Proportionele vectorlengten op basis van echte krachtverhouding |
| Hardcoded validatie | Scenario-specifieke validatie met Socratische fouthints |
| Dropdown scenario-keuze | Lineaire progressie met voortgangspills |
| Geen krachtenbalans stap | Fase B: Fz vs FA vergelijken + gedrag identificeren |
| Geen pedagogische opbouw | Scaffolding: Bloom's taxonomie, ForcesLab-interface + balans |
| 4 scenario's | 5 scenario's (zinken, zweven, stijgen, drijven, luchtballon) |
| Geen bonusfase | Vrij-verkennen modus na afronding (sliders + live visualisatie) |