<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable,
  PhArrowClockwise, PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Waarheidstabellen' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)
const feedback = ref({ type: 'info', text: '' })

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedClassification = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 4
const levelLabels = ['Toepassen', 'Analyseren', 'Classificeren', 'Reflecteren']

// ========== OPERATOR POOL ==========
function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const operatorPool = [
  {
    label: 'Disjunctie (OF)', operatorText: 'A ∨ B',
    instruction: 'Vul de waarheidstabel in voor de disjunctie (A of B). Klik op de vakjes om te wisselen tussen 0 (Onwaar) en 1 (Waar).',
    description: 'Een disjunctie is enkel onwaar als alle beweringen onwaar zijn.',
    successText: 'Perfect! De disjunctie "A of B" is waar zodra minstens één van beide beweringen waar is.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 1 },
      { A: 1, B: 1, ans: null, correct: 1 }
    ],
    worked: {
      steps: [
        'Rij 1: A=0, B=0 → OF is enkel 0 als beide 0 zijn → 0',
        'Rij 2: A=0, B=1 → minstens één is 1 → 1',
        'Rij 3: A=1, B=0 → minstens één is 1 → 1',
        'Rij 4: A=1, B=1 → beide zijn 1 → 1'
      ],
      keyRule: 'A ∨ B = 0 alleen als A=0 EN B=0'
    }
  },
  {
    label: 'Conjunctie (EN)', operatorText: 'A ∧ B',
    instruction: 'Vul de waarheidstabel in voor de conjunctie (A en B).',
    description: 'Een conjunctie is enkel waar als ALLE beweringen waar zijn.',
    successText: 'Perfect! A ∧ B is enkel 1 wanneer beide 1 zijn.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 0 },
      { A: 1, B: 0, ans: null, correct: 0 },
      { A: 1, B: 1, ans: null, correct: 1 }
    ],
    worked: {
      steps: [
        'A ∧ B is enkel waar (1) als A=1 EN B=1',
        'Alle andere combinaties geven 0'
      ],
      keyRule: 'A ∧ B = 1 alleen als A=1 EN B=1'
    }
  },
  {
    label: 'Exclusieve Disjunctie (XOR)', operatorText: 'A ⊕ B',
    instruction: 'Vul de waarheidstabel in voor XOR.',
    description: 'XOR is waar als precies één van beide waar is.',
    successText: 'Perfect! XOR is waar wanneer A en B verschillen.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 1 },
      { A: 1, B: 1, ans: null, correct: 0 }
    ],
    worked: null
  },
  {
    label: 'NAND (Niet-EN)', operatorText: 'A ↑ B',
    instruction: 'Vul de waarheidstabel in voor NAND.',
    description: 'NAND is het tegengestelde van EN: enkel onwaar als beide waar zijn.',
    successText: 'Perfect! NAND is overal 1 behalve bij A=1, B=1.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 1 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 1 },
      { A: 1, B: 1, ans: null, correct: 0 }
    ],
    worked: null
  },
  {
    label: 'Implicatie (ALS...DAN)', operatorText: 'A → B',
    instruction: 'Vul de waarheidstabel in voor de implicatie (A impliceert B).',
    description: 'Een implicatie is enkel onwaar als A waar is en B onwaar.',
    successText: 'Perfect! A → B is enkel 0 wanneer A=1 en B=0.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 1 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 0 },
      { A: 1, B: 1, ans: null, correct: 1 }
    ],
    worked: {
      steps: [
        'Denk aan "ALS het regent (A), DAN is de straat nat (B)"',
        'Rij 1: niet regenen, droog → regen belooft niets, dus WAAR',
        'Rij 2: niet regenen, nat → andere oorzaak, belofte niet gebroken, WAAR',
        'Rij 3: regenen, droog → BELOFTE GEBROKEN, ONWAAR!',
        'Rij 4: regenen, nat → belofte nagekomen, WAAR'
      ],
      keyRule: 'A → B = 0 alleen als A=1 EN B=0'
    }
  }
]

const tautologyPool = [
  { formula: 'A ∨ ¬A', description: 'De wet van de uitgesloten derde.', correct: 'tautologie', hint: 'A=0→¬A=1→A∨¬A=1. A=1→¬A=0→A∨¬A=1. Alle uitkomsten 1!' },
  { formula: 'A ∧ ¬A', description: 'A waar EN A niet waar — kan niet.', correct: 'contradictie', hint: 'A=0→1∧0=0. A=1→0∧1=0. Alle uitkomsten 0!' },
  { formula: 'A → (B → A)', description: 'Als A waar is, impliceert B hoe dan ook A.', correct: 'tautologie', hint: 'A=0: 0→(...)=1. A=1: 1→(B→1)=1. Alles 1!' },
  { formula: '(A ∧ B) → A', description: 'Als A en B waar zijn, dan is A waar.', correct: 'tautologie', hint: 'De enige 0-mogelijkheid: A∧B=1 en A=0 — onmogelijk!' },
  { formula: 'A ∧ (¬A ∨ B)', description: 'Geen vaste uitkomst — hangt af van A en B.', correct: 'satisfiable', hint: 'A=0: 0. A=1: B. Soms 0, soms 1.' },
  { formula: '(A ∨ B) ∧ ¬A', description: 'A of B waar, A niet waar — dus B moet waar zijn.', correct: 'satisfiable', hint: 'A=0,B=0: 0. A=0,B=1: 1. A=1: 0.' },
  { formula: '(A → B) ↔ (¬A ∨ B)', description: 'Implicatie ≡ ¬A ∨ B.', correct: 'tautologie', hint: 'Vergelijk A→B en ¬A∨B — identiek in alle 4 rijen.' }
]

// ========== LEVEL LOGIC ==========
const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const tableRows = ref([])
const currentTautology = ref(null)
const tautologyAnswer = ref(null)
const selectedTautologyAnswer = ref(null)

// Worked example definitions
const workedExamples = {
  0: null, // handled inline
  1: {
    operator: 'A ∨ B (Disjunctie)',
    steps: [
      'Stap 1: Kijk naar rij 1: A=0, B=0. OF is alleen 0 als beide 0 zijn → dus 0.',
      'Stap 2: Rij 2: A=0, B=1. Minstens één is 1 → OF is 1.',
      'Stap 3: Rij 3: A=1, B=0. Minstens één is 1 → OF is 1.',
      'Stap 4: Rij 4: A=1, B=1. Allebei 1 → OF is 1.'
    ],
    keyRule: 'Regel: A ∨ B = 0 alleen als A=0 en B=0'
  },
  2: null
}

function generateLevel(levelNum) {
  const pool = shuffle(operatorPool)
  const chosen = pool[levelNum % pool.length]

  if (levelNum <= 2) {
    return {
      type: 'table',
      ...chosen,
      tableRows: chosen.tableRows.map(r => ({ ...r, ans: null }))
    }
  }

  // Level 3: tautology/contradiction/satisfiable
  currentTautology.value = shuffle(tautologyPool)[0]
  tautologyAnswer.value = null
  return {
    type: 'classification',
    formula: currentTautology.value.formula,
    description: currentTautology.value.description,
    correct: currentTautology.value.correct,
    hint: currentTautology.value.hint
  }
}

// ========== TABLE ANSWER HANDLING ==========
function toggleAns(index) {
  if (isCorrect.value) return
  const current = tableRows.value[index].ans
  if (current === null) tableRows.value[index].ans = 0
  else if (current === 0) tableRows.value[index].ans = 1
  else tableRows.value[index].ans = null
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  if (tableRows.value.length === 4 && tableRows.value.every(r => r.ans !== null)) {
    autoCheck()
  }
}

function autoCheck() {
  isChecked.value = true
  const allCorrect = tableRows.value.every(r => r.ans === r.correct)
  if (allCorrect) {
    isCorrect.value = true
    attemptCount.value = 0
    hintCount.value = 0
    const why = 'Een waarheidstabel toont ALLE mogelijke combinaties van waarheidswaarden. Elke rij is één mogelijke situatie. Door alle rijen te vullen, zie je exact onder welke voorwaarden de formule waar of onwaar is.'
    showWhy.value = true
    whyText.value = why + '<br/><br/><strong>LPD 36 bewezen:</strong> Je kan een waarheidstabel correct invullen en de logische operator toepassen op alle mogelijke combinaties.'
    feedback.value = { type: 'success', text: currentLevel.value.successText }
  } else {
    attemptCount.value++

    // Count how many are wrong to give specific error
    const wrongRows = tableRows.value.filter((r, i) => r.ans !== null && r.ans !== r.correct)
    const emptyRows = tableRows.value.filter(r => r.ans === null)
    let errMsg = ''
    if (wrongRows.length > 0) {
      const wrongIndices = wrongRows.map((r, i) => tableRows.value.indexOf(r) + 1)
      errMsg = `Rij ${wrongIndices.join(', ')} is niet correct. Denk aan de definitie van deze operator.`
    } else if (emptyRows.length > 0) {
      errMsg = 'Nog niet alle rijen zijn ingevuld. Vul alle rijen in voor automatische controle.'
    } else {
      errMsg = 'Niet alle rijen kloppen. Probeer elke combinatie stap voor stap te beredeneren.'
    }
    if (attemptCount.value >= 3) {
      errMsg = 'Bekijk de instructies en de beschrijving van de operator. Elke rij is één combinatie van A en B.'
    }
    feedback.value = { type: 'error', text: errMsg }
  }
}

// ========== HINTS (table mode) ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  if (currentInternalLevel.value < 3) {
    const hints = [
      'Denk aan de definitie van deze logische operator. Wat zegt de beschrijving in de instructies?',
      currentLevel.value.description ? `Lees de beschrijving: "${currentLevel.value.description}"` : 'Controleer elke rij: is de formule waar of onwaar voor deze combinatie?',
      'Probeer per rij: wat is de uitkomst voor A=0,B=0? En voor A=0,B=1? Enzovoort.'
    ]
    feedback.value = { type: 'info', text: hints[idx] }
  } else {
    const hints = [
      currentLevel.value.hint,
      'Controleer wat er voor ALLE combinaties van A en B gebeurt. Als alle uitkomsten 1 zijn → tautologie. Allemaal 0 → contradictie. Anders → satisfiable.',
      'Schrijf de waarheidstabel voor deze formule uit op papier. Kijk dan naar de resultaten.'
    ]
    feedback.value = { type: 'info', text: hints[idx] }
  }
}

// ========== CLASSIFICATION (Level 3) ==========
function checkTautologyAnswer() {
  if (!selectedTautologyAnswer.value || isCorrect.value) return
  tautologyAnswer.value = selectedTautologyAnswer.value
  if (selectedTautologyAnswer.value === currentLevel.value.correct) {
    isCorrect.value = true
    attemptCount.value = 0
    hintCount.value = 0
    const whyExplanations = {
      'tautologie': 'Een tautologie is ALTIJD waar, ongeacht de waarden van A en B. Dit zijn de "wetmatigheden" van de logica — ze gelden in elke mogelijke situatie.',
      'contradictie': 'Een contradictie is ALTIJD onwaar, ongeacht A en B. Dit toont aan dat sommige logische formules logisch onmogelijk zijn.',
      'satisfiable': 'Een satisfiable formule is soms waar, soms onwaar — het hangt af van A en B. Dit zijn de meeste formules in de praktijk.'
    }
    showWhy.value = true
    whyText.value = (whyExplanations[currentLevel.value.correct] || '') + '<br/><br/><strong>LPD 36 bewezen:</strong> Je kan een logische formule classificeren als tautologie, contradictie of satisfiable door de waarheidstabel te analyseren.'
    feedback.value = { type: 'success', text: `✓ Correct! ${currentLevel.value.description}` }
  } else {
    attemptCount.value++
    isCorrect.value = false
    const hints = [
      currentLevel.value.hint,
      'Controleer wat er voor ALLE combinaties van A en B gebeurt.',
      'Tautologie = alle uitkomsten 1. Contradictie = alle uitkomsten 0. Satisfiable = mix.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (!predictedClassification.value) return
  if (currentInternalLevel.value < 3) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Laten we de tabel nu invullen.' }
    return
  }
  const correct = currentLevel.value.correct
  if (predictedClassification.value === correct) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist ingeschat! Bevestig nu met de definitieve keuze.' }
  } else {
    attemptCount.value++
    const hints = [
      'Denk aan wat "altijd waar" (tautologie), "altijd onwaar" (contradictie) en "soms waar, soms onwaar" (satisfiable) betekent voor deze formule.',
      'Test de formule met A=0 en A=1. Wat gebeurt er?',
      'Schrijf de waarheidstabel mentaal uit. Zijn alle uitkomsten hetzelfde?'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasTautologie = text.includes('tautologie') || text.includes('altijd waar')
  const hasContradictie = text.includes('contradictie') || text.includes('altijd onwaar') || text.includes('tegenstrijdig')
  const hasSatisfiable = text.includes('satisfiable') || text.includes('soms') || text.includes('hangt af')
  const hasReden = text.length > 20

  if ((hasTautologie || hasContradictie || hasSatisfiable) && hasReden) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Uitstekend!<br/><br/><strong>LPD 36 bewezen:</strong> Je begrijpt de drie categorieën van logische formules en kan ze onderscheiden op basis van hun waarheidstabel.'
    }
  } else {
    attemptCount.value++
    const hints = [
      'Leg uit: wat is het verschil tussen een tautologie, contradictie en satisfiable formule?',
      'Bespreek wat er gebeurt met de uitkomsten in de waarheidstabel voor elk type.',
      'Geef een voorbeeld van een tautologie en waarom die altijd waar is.'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== NAVIGATION ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  feedback.value = { type: 'info', text: currentInternalLevel.value >= 1 ? 'Voorspel eerst hoe de tabel eruit zal zien.' : 'Vul de waarheidstabel in.' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedClassification.value = null
  selectedTautologyAnswer.value = null
  tautologyAnswer.value = null

  const lvl = currentInternalLevel.value
  if (lvl < 3) {
    if (currentLevel.value && currentLevel.value.tableRows) {
      tableRows.value = currentLevel.value.tableRows.map(r => ({ ...r, ans: null }))
    }
  }

  showWorkedExample.value = lvl === 0
  showPrediction.value = lvl >= 1

  if (lvl >= 1 && lvl < 3) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: wat wordt de uitkomst voor deze operator?' }
  } else if (lvl === 3) {
    feedback.value = { type: 'info', text: 'Voorspel: is deze formule een tautologie, contradictie of satisfiable?' }
  } else {
    feedback.value = { type: 'info', text: 'Vul de waarheidstabel in. Klik op een cel om te wisselen tussen 0 en 1.' }
  }
}

function handleNext() {
  // Show reflection at end
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op de drie categorieën van logische formules.' }
    return
  }

  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    // Regenerate levels
    const newLevels = []
    for (let i = 0; i < totalInternalLevels; i++) {
      if (i === 3) {
        // For level 3, just set up the tautology
        currentTautology.value = shuffle(tautologyPool)[0]
        newLevels.push({
          type: 'classification',
          formula: currentTautology.value.formula,
          description: currentTautology.value.description,
          correct: currentTautology.value.correct,
          hint: currentTautology.value.hint
        })
      } else {
        const pool = shuffle(operatorPool)
        const chosen = pool[i % pool.length]
        newLevels.push({
          type: 'table',
          ...chosen,
          tableRows: chosen.tableRows.map(r => ({ ...r, ans: null }))
        })
      }
    }
    levels.value = newLevels
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// ========== LIFECYCLE ==========
watch(() => props.isOpen, (val) => {
  if (val) {
    const newLevels = []
    for (let i = 0; i < totalInternalLevels; i++) {
      if (i === 3) {
        currentTautology.value = shuffle(tautologyPool)[0]
        newLevels.push({
          type: 'classification',
          formula: currentTautology.value.formula,
          description: currentTautology.value.description,
          correct: currentTautology.value.correct,
          hint: currentTautology.value.hint
        })
      } else {
        const pool = shuffle(operatorPool)
        const chosen = pool[i % pool.length]
        newLevels.push({
          type: 'table',
          ...chosen,
          tableRows: chosen.tableRows.map(r => ({ ...r, ans: null }))
        })
      }
    }
    levels.value = newLevels
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-600' : 'bg-slate-200 border-slate-300'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-500">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-400 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <!-- MAIN -->
      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction || 'Vul de waarheidstabel in om logische operatoren te begrijpen.'" class="mb-4 prose prose-sm text-slate-600" />

            <!-- WORKED EXAMPLE (Level 0-1 table modes) -->
            <div v-if="showWorkedExample && currentInternalLevel < 3 && currentLevel.worked" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorbeeld — Ik doe voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">{{ currentLevel.operatorText }} — {{ currentLevel.label }}</p>
              <div class="space-y-1.5 text-sm text-slate-600 mb-2">
                <div v-for="(step, si) in currentLevel.worked.steps" :key="si" class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold shrink-0">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="bg-white p-2 rounded-lg border border-amber-200 text-sm font-bold text-amber-700 text-center mt-2">
                {{ currentLevel.worked.keyRule }}
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-700 bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- PREDICTION GATE (Levels 1-2) -->
            <div v-if="showPrediction && currentInternalLevel < 3 && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Bekijk de operator <strong>{{ currentLevel.operatorText }}</strong>. Wat wordt de uitkomst?</p>
              <div class="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-600 mb-3 italic">
                "{{ currentLevel.description }}"
              </div>
              <button @click="checkPrediction"
                      class="w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Ik begrijp het, laten we invullen
              </button>
            </div>

            <!-- PREDICTION GATE (Level 3 classification) -->
            <div v-if="showPrediction && currentInternalLevel === 3" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm font-mono font-bold text-slate-800 mb-2">{{ currentLevel.formula }}</p>
              <p class="text-xs text-slate-600 mb-3">{{ currentLevel.description }}</p>
              <p class="text-sm text-slate-700 mb-3">Is deze formule een...</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [{id:'tautologie',label:'Tautologie (altijd waar)'},{id:'contradictie',label:'Contradictie (altijd onwaar)'},{id:'satisfiable',label:'Satisfiable (soms waar/onwaar)'}]"
                        :key="opt.id"
                        @click="predictedClassification = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedClassification === opt.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedClassification" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- OPERATOR DESCRIPTION (table mode) -->
            <div v-if="currentInternalLevel < 3 && !showWorkedExample && !showPrediction" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 mb-4 animate-fadeIn">
              <p class="font-bold text-slate-700 text-sm">Operator:</p>
              <div class="bg-white p-3 border border-slate-200 rounded-lg font-mono text-base text-center font-bold">{{ currentLevel.operatorText }}</div>
              <p class="text-xs text-slate-500 italic">{{ currentLevel.description }}</p>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom is dit waar?</span>
              </div>
              <p class="text-sm text-indigo-700" v-html="whyText"></p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Wat is het verschil tussen een <strong>tautologie</strong>, een <strong>contradictie</strong> en een <strong>satisfiable</strong> formule? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Een tautologie is... een contradictie is... een satisfiable formule is..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM CONTROLS -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'success',
                          'bg-red-50 text-red-800 border border-red-200': feedback.type === 'error',
                          'bg-blue-50 text-blue-800 border border-blue-200': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <!-- Hint -->
              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-600 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <!-- Classification confirm button (level 3) -->
              <button v-if="currentInternalLevel === 3 && !showPrediction && !showReflection && !isCorrect && selectedTautologyAnswer"
                      @click="checkTautologyAnswer"
                      class="flex-1 py-4 font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Afronden</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Table / Classification -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Level 0-2: Truth Table -->
              <template v-if="currentInternalLevel < 3">
                <div class="bg-white rounded-xl shadow-md border-2 border-slate-300 overflow-hidden w-full max-w-lg">
                  <div class="flex bg-slate-800 text-white text-xl font-bold">
                    <div class="flex-1 p-4 text-center border-r border-slate-600">A</div>
                    <div class="flex-1 p-4 text-center border-r border-slate-600">B</div>
                    <div class="flex-1 p-4 text-center text-amber-300">{{ currentLevel.operatorText }}</div>
                  </div>
                  <div v-for="(row, index) in tableRows" :key="index" class="flex border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors h-16 items-center">
                    <div class="flex-1 text-center font-mono text-2xl font-bold border-r border-slate-200 h-full flex items-center justify-center text-slate-700">{{ row.A }}</div>
                    <div class="flex-1 text-center font-mono text-2xl font-bold border-r border-slate-200 h-full flex items-center justify-center text-slate-700">{{ row.B }}</div>
                    <div class="flex-1 text-center font-mono text-2xl font-bold h-full flex items-center justify-center p-2">
                      <button @click="toggleAns(index)"
                              class="w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors font-black text-2xl focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                              :class="{ 'border-slate-300 hover:border-amber-400 bg-slate-50 text-transparent': row.ans === null, 'border-amber-500 bg-amber-50 text-amber-700': row.ans !== null }">
                        {{ row.ans !== null ? row.ans : '?' }}
                      </button>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Level 3: Classification -->
              <template v-else>
                <div class="bg-white rounded-xl shadow-md border-2 border-slate-300 p-8 w-full max-w-lg text-center">
                  <div class="text-2xl font-mono font-black text-slate-800 mb-4">{{ currentLevel.formula }}</div>
                  <p class="text-sm text-slate-600 mb-6">{{ currentLevel.description }}</p>
                  <p class="font-bold text-slate-700 mb-4">Dit is een...</p>
                  <div class="flex flex-col gap-3">
                    <button v-for="opt in [{id:'tautologie',label:'Tautologie (altijd waar)',icon:'✅'},{id:'contradictie',label:'Contradictie (altijd onwaar)',icon:'❌'},{id:'satisfiable',label:'Satisfiable (soms waar/onwaar)',icon:'❓'}]"
                            :key="opt.id"
                            @click="selectedTautologyAnswer = opt.id; tautologyAnswer = null"
                            class="w-full py-4 font-bold text-lg rounded-xl transition-all border-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                            :class="selectedTautologyAnswer === opt.id && tautologyAnswer === null ? 'bg-amber-50 border-amber-400 text-amber-700' : tautologyAnswer === opt.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'"
                            :disabled="isCorrect">
                      <span v-if="tautologyAnswer !== opt.id">{{ opt.icon }} {{ opt.label }}</span>
                      <span v-else class="text-white">{{ opt.icon }} {{ opt.label }}</span>
                    </button>
                  </div>
                </div>
              </template>

            </div>
          </div>
        </div>
      </main>
    </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel >= totalInternalLevels - 1 && reflectionDone" />
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
