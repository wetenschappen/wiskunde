<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  PhNavigationArrow, PhCheckCircle, PhWarningCircle, PhPlayCircle,
  PhArrowRight, PhTrash, PhX, PhArrowDown, PhArrowUp,
  PhWaves
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Archimedes Labo' },
  instruction: String,
  fullscreen: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'complete'])

// ============================================================================
// 5. SCENARIO DATA (Complete Definition)
// ============================================================================
const scenarios = [
  {
    id: 0,
    title: 'Scenario 1: IJzeren blok in water',
    desc: 'Een ijzeren blok wordt in water losgelaten. Wat doet het blok?',
    emoji: '🧱',
    objectLabel: 'het ijzeren blok',
    fluidLabel: 'het water',
    fluidActorId: 'water',
    isGas: false,
    rho_obj: 7900,
    rho_fluid: 1000,
    vol_obj: 1.0e-4,
    vol_obj_display: '100 cm³',
    behavior: 'zinkt',
    expectedComparison: 'greater',
    expectedBehavior: 'zinkt',
    explanation: 'Correct! De zwaartekracht (Fz = 7,75 N) is veel groter dan de archimedeskracht (FA = 0,98 N). De resulterende kracht wijst naar beneden: het ijzeren blok zinkt. Dit klopt: ρijzer (7900 kg/m³) > ρwater (1000 kg/m³).'
  },
  {
    id: 1,
    title: 'Scenario 2: Ei in zout water',
    desc: 'Een ei wordt volledig ondergedompeld in zout water en losgelaten. Het ei zweeft.',
    emoji: '🥚',
    objectLabel: 'het ei',
    fluidLabel: 'het zout water',
    fluidActorId: 'zoutwater',
    isGas: false,
    rho_obj: 1030,
    rho_fluid: 1030,
    vol_obj: 5.0e-5,
    vol_obj_display: '50 cm³',
    behavior: 'zweeft',
    expectedComparison: 'equal',
    expectedBehavior: 'zweeft',
    explanation: 'Uitstekend! Fz = 0,506 N en FA = 0,506 N. De krachten zijn precies even groot: translatie-evenwicht. De resulterende kracht is nul. Het ei zweeft! Dit klopt: ρei = ρzoutwater = 1030 kg/m³.'
  },
  {
    id: 2,
    title: 'Scenario 3: Kurken stop in water',
    desc: 'Een kurken stop wordt volledig onder water gedrukt en losgelaten. Wat gebeurt er?',
    emoji: '🪵',
    objectLabel: 'de kurken stop',
    fluidLabel: 'het water',
    fluidActorId: 'water',
    isGas: false,
    rho_obj: 250,
    rho_fluid: 1000,
    vol_obj: 1.0e-4,
    vol_obj_display: '100 cm³',
    behavior: 'stijgt',
    expectedComparison: 'less',
    expectedBehavior: 'stijgt',
    explanation: 'Perfect! FA = 0,981 N is veel groter dan Fz = 0,245 N. De resulterende kracht wijst naar boven: de kurken stop stijgt op. ρkurk (250 kg/m³) < ρwater (1000 kg/m³).'
  },
  {
    id: 3,
    title: 'Scenario 4: Houten blok op water',
    desc: 'Een houten blok wordt op het water gelegd. Het blok drijft en is gedeeltelijk ondergedompeld.',
    emoji: '🛶',
    objectLabel: 'het houten blok',
    fluidLabel: 'het water',
    fluidActorId: 'water',
    isGas: false,
    rho_obj: 600,
    rho_fluid: 1000,
    vol_obj: 2.0e-4,
    vol_obj_display: '200 cm³',
    behavior: 'drijft',
    expectedComparison: 'equal',
    expectedBehavior: 'drijft',
    explanation: 'Bravo! Het houten blok drijft in evenwicht: Fz = FA = 1,18 N. Slechts 60% van het blok is ondergedompeld (Vonder = 120 cm³). Omdat ρhout (600 kg/m³) < ρwater (1000 kg/m³), zakt het blok net genoeg om evenwicht te bereiken: dan drijft het.'
  },
  {
    id: 4,
    title: 'Scenario 5 (bonus): Heteluchtballon',
    desc: 'Een heteluchtballon wordt gevuld met warme lucht. De omringende koude lucht is dichter. Wat doet de ballon?',
    emoji: '🎈',
    objectLabel: 'de luchtballon',
    fluidLabel: 'de koude lucht',
    fluidActorId: 'koude_lucht',
    isGas: true,
    rho_obj: 0.90,
    rho_fluid: 1.25,
    vol_obj: 10.0,
    vol_obj_display: '10 m³',
    behavior: 'stijgt',
    expectedComparison: 'less',
    expectedBehavior: 'stijgt',
    explanation: 'Geweldig! FA = 122,6 N > Fz = 88,3 N. De archimedeskracht van de koude lucht op de ballon is groter dan de zwaartekracht. De ballon stijgt op! De wet van Archimedes werkt ook in gassen: koude lucht (1,25 kg/m³) is dichter dan de warme lucht + mantel (0,90 kg/m³).'
  }
]

// ============================================================================
// 7. REACTIVE STATE
// ============================================================================
const currentScenarioIndex = ref(0)
const currentPhase = ref('A') // 'A' = tekenen, 'B' = balans

const inputs = ref({
  fz: { origin: 'none', direction: 'none', sender: '', receiver: '' },
  fa: { origin: 'none', direction: 'none', sender: '', receiver: '' }
})

const balanceInputs = ref({
  comparison: null,
  behavior: null
})

const feedback = ref(null)
const isCorrect = ref(false)
const phaseALocked = ref(false)
const shouldPulse = ref(false)
const hoveredPoint = ref(null)
const allScenariosComplete = ref(false)

// ============================================================================
// 6. COMPUTED VALUES (Physics Calculations)
// ============================================================================
const currentScenario = computed(() => scenarios[currentScenarioIndex.value])

const mass = computed(() =>
  currentScenario.value.rho_obj * currentScenario.value.vol_obj
)

const Fz = computed(() => mass.value * 9.81)

const FA_max = computed(() =>
  currentScenario.value.rho_fluid * currentScenario.value.vol_obj * 9.81
)

const vol_onder = computed(() => {
  const s = currentScenario.value
  if (s.behavior === 'drijft') {
    return (s.rho_obj / s.rho_fluid) * s.vol_obj
  }
  return s.vol_obj
})

const FA_actual = computed(() =>
  currentScenario.value.rho_fluid * vol_onder.value * 9.81
)

const percentage_onder = computed(() =>
  Math.round((vol_onder.value / currentScenario.value.vol_obj) * 100)
)

const isDone = computed(() =>
  isCorrect.value && currentScenarioIndex.value === scenarios.length - 1 && currentPhase.value === 'B'
)

// ============================================================================
// 9. ACTORS (for DOOR/OP selects)
// ============================================================================
const actors = computed(() => {
  const s = currentScenario.value
  return [
    { id: 'aarde', label: 'de aarde' },
    { id: 'voorwerp', label: s.objectLabel },
    { id: s.fluidActorId, label: s.fluidLabel }
  ]
})

// ============================================================================
// 11. CANVAS COMPUTED PROPERTIES
// ============================================================================
const objectY = computed(() => {
  const s = currentScenario.value
  const fluidSurface = 110  // moved up with tank
  const tankBottom = 340   // moved up with tank
  const emojiSize = 30     // approximate emoji visual size

  if (s.behavior === 'zinkt') {
    // Sits on tank bottom
    return tankBottom - emojiSize / 2
  }
  if (s.behavior === 'zweeft') {
    // Middle of fluid
    return 210
  }
  if (s.behavior === 'stijgt') {
    // Just below water surface
    return fluidSurface + emojiSize / 2
  }
  if (s.behavior === 'drijft') {
    // Partially submerged - adjust based on submerged percentage
    const submergedPx = (percentage_onder.value / 100) * emojiSize
    return fluidSurface + submergedPx - emojiSize / 2
  }
  return 180
})

const wavePath = computed(() => {
  const y = 130
  return `M 43 ${y} C 100 ${y - 8}, 200 ${y + 8}, 257 ${y} L 257 362 L 43 362 Z`
})

const vProps = computed(() => {
  const BASE = 60
  const MAX = 120
  const MIN = 18

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

const vectorConfig = computed(() => [
  {
    id: 'fz',
    label: 'Zwaartekracht (Fz)',
    colorClass: 'text-orange-700 bg-orange-50 border-orange-300',
    iconColor: 'text-orange-500',
    borderHighlight: 'border-orange-400'
  },
  {
    id: 'fa',
    label: 'Archimedeskracht (FA)',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
    iconColor: 'text-rose-500',
    borderHighlight: 'border-rose-400'
  }
])

// ============================================================================
// 4.4 FULLSCREEN & KEYBOARD BEHAVIOR
// ============================================================================
watch(() => props.isOpen, (val) => {
  if (!val) {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  } else {
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      shouldPulse.value = true
      setTimeout(() => { shouldPulse.value = false }, 3000)
    })
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {
            console.log('Fullscreen request denied:', e)
          })
        }
      })
    }
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

const handleFullscreenChange = () => {
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
})

// ============================================================================
// STATE MANAGEMENT FUNCTIONS
// ============================================================================
function handleOriginClick(forceId, originStr) {
  inputs.value[forceId].origin = originStr
  if (originStr === 'none') {
    inputs.value[forceId].direction = 'none'
    inputs.value[forceId].sender = ''
    inputs.value[forceId].receiver = ''
  }
}

function advanceToPhaseB() {
  currentPhase.value = 'B'
  feedback.value = null
  isCorrect.value = false
}

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
  currentScenarioIndex.value = idx
  resetState()
}

// ============================================================================
// 13. VALIDATION LOGIC
// ============================================================================
function checkPhaseA() {
  const s = currentScenario.value
  let correct = true
  let msg = ''

  const checkVis = (key, expectedOrigin, expectedDir) => {
    const inp = inputs.value[key]
    return inp.origin === expectedOrigin && inp.direction === expectedDir
  }

  const checkTxt = (key, expectedSender, expectedReceiver) => {
    const inp = inputs.value[key]
    return inp.sender === expectedSender && inp.receiver === expectedReceiver
  }

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
  } else if (!checkVis('fa', 'center', 'up')) {
    correct = false
    if (inputs.value.fa.origin === 'none') {
      msg = `De archimedeskracht is nog niet getekend. Kies 'Zwaartepunt' als aangrijpingspunt voor FA.`
    } else if (inputs.value.fa.direction === 'down') {
      msg = `De archimedeskracht (FA) is een OPwaartse kracht: ze duwt het voorwerp omhoog (↑). Pas de richting aan.`
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

function checkPhaseB() {
  const s = currentScenario.value
  let correct = true
  let msg = ''

  if (balanceInputs.value.comparison === null) {
    correct = false
    msg = 'Selecteer eerst hoe Fz en FA zich tot elkaar verhouden (Fz > FA, Fz = FA, of Fz < FA).'
  } else if (balanceInputs.value.comparison !== s.expectedComparison) {
    correct = false
    const fzVal = Fz.value.toFixed(2).replace('.', ',')
    const faVal = FA_actual.value.toFixed(2).replace('.', ',')
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
    const got = balanceInputs.value.behavior
    const exp = s.expectedBehavior
    if (exp === 'zinkt' && got === 'zweeft') {
      msg = `Bij zweven is de resulterende kracht nul (Fz = FA). Hier is Fz > FA: de resulterende kracht wijst naar beneden. Het voorwerp versnelt dus naar beneden: het zinkt.`
    } else if (exp === 'zweeft' && got === 'zinkt') {
      msg = `Fz = FA: de resulterende kracht is nul. Daardoor behoudt het voorwerp zijn toestand (eerste wet van Newton). Ondergedompeld en in rust → het zweeft.`
    } else if (exp === 'stijgt' && got === 'drijft') {
      msg = `'Drijven' betekent gedeeltelijk boven het vloeistofoppervlak. Als het voorwerp VOLLEDIG ondergedompeld is en FA > Fz, beweegt het omhoog: het stijgt.`
    } else if (exp === 'drijft' && got === 'stijgt') {
      msg = `Stijgen geldt wanneer het voorwerp volledig ondergedompeld is. Hier is het voorwerp gedeeltelijk boven het water (in evenwicht). Dat noemen we drijven.`
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
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-slate-100 shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none">

      <!-- HEADER -->
      <div class="p-2 md:p-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 relative shrink-0">
        <div class="flex items-center gap-4">
          <h2 class="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">{{ title }}</h2>
          <div class="hidden md:flex items-center gap-2">
            <button
              v-for="(scen, idx) in scenarios"
              :key="idx"
              @click="goToScenario(idx)"
              class="w-8 h-8 rounded-full text-xs font-extrabold transition-all flex items-center justify-center border-2 cursor-pointer hover:scale-105"
              :class="[
                idx === currentScenarioIndex
                  ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
              ]"
              :title="scen.title"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
            <span class="text-xs font-bold"
              :class="currentPhase === 'A' ? 'text-indigo-600' : 'text-emerald-600'"
            >
              {{ currentPhase === 'A' ? '① Krachten tekenen' : '② Krachtenbalans' }}
            </span>
          </div>
          <button @click="$emit('close')"
            class="p-2 md:p-3 bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-all shadow-inner relative"
            :class="{ 'ring-pulse-red': shouldPulse }">
            <PhX class="text-xl font-bold" />
          </button>
        </div>
      </div>

      <!-- MAIN BODY -->
      <div class="flex-1 overflow-hidden p-3 md:p-5 flex flex-col md:flex-row gap-5 md:gap-6 bg-slate-50 min-h-0">

        <!-- LEFT: SVG CANVAS (40%) -->
        <div class="md:w-[42%] xl:w-[40%] flex flex-col gap-3 min-h-0 shrink-0">
          <div class="bg-white rounded-3xl shadow-xl border-4 border-slate-200 relative w-full flex items-center justify-center overflow-hidden flex-1 min-h-[320px]">
            <svg viewBox="0 0 300 480" class="w-full h-full drop-shadow-md">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" class="stroke-slate-100" stroke-width="1"/>
                </pattern>
                <linearGradient id="waterGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.55" />
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0.75" />
                </linearGradient>
                <marker id="arrowFz" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" class="fill-orange-500" />
                </marker>
                <marker id="arrowFa" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" class="fill-rose-500" />
                </marker>
              </defs>

              <!-- Background grid -->
              <rect width="100%" height="100%" fill="url(#grid)" />

              <!-- Tank background (square edges to prevent water leakage, moved up, extended down) -->
              <rect x="40" y="10" width="220" height="390" rx="0"
                class="fill-slate-50 stroke-slate-300" stroke-width="4" />

              <!-- Fluid or Gas visualization -->
              <g v-if="!currentScenario.isGas">
                <!-- Water filling (moved up) -->
                <rect x="44" :y="110" width="212" height="230" fill="url(#waterGradient)" />
                <!-- Wave surface path -->
                <path :d="wavePath" stroke="#38bdf8" stroke-width="2" fill="#38bdf8" fill-opacity="0.4"/>
                <!-- Bubbles (moved up) -->
                <circle cx="80" cy="320" r="2" fill="white" opacity="0.5" class="bubble" style="animation-duration:5s"/>
                <circle cx="180" cy="330" r="1.5" fill="white" opacity="0.6" class="bubble" style="animation-duration:4.5s; animation-delay:1.5s"/>
                <circle cx="220" cy="325" r="2.5" fill="white" opacity="0.4" class="bubble" style="animation-duration:6s; animation-delay:0.8s"/>
              </g>

              <!-- Gas visualization (balloon scenario) -->
              <g v-else>
                <rect x="44" y="34" width="212" height="322" fill="rgb(203 213 225 / 0.3)" />
                <text x="150" y="200" text-anchor="middle" font-size="48"
                  class="fill-slate-400/20 font-extrabold select-none pointer-events-none">
                  LUCHT
                </text>
                <line x1="40" y1="130" x2="260" y2="130"
                  stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 4" />
              </g>

              <!-- Glass reflection effect -->
              <polygon points="45,34 258,34 235,358 68,358"
                fill="white" opacity="0.07" class="pointer-events-none" />

              <!-- Tank frame (open top - no lid, square edges, extended down) -->
              <!-- Left side -->
              <line x1="40" y1="10" x2="40" y2="400" class="stroke-slate-300" stroke-width="4" />
              <!-- Right side -->
              <line x1="260" y1="10" x2="260" y2="400" class="stroke-slate-300" stroke-width="4" />
              <!-- Bottom -->
              <line x1="40" y1="400" x2="260" y2="400" class="stroke-slate-300" stroke-width="4" />

              <!-- Object (physics group with transition) -->
              <g :transform="`translate(150, ${objectY})`"
                class="transition-transform duration-1000 ease-out">

                <!-- Object (immersible - no box, just the emoji) -->
                <text x="0" y="10" text-anchor="middle" font-size="30"
                  class="select-none pointer-events-none">
                  {{ currentScenario.emoji }}
                </text>

                <!-- Submerged overlay for 'drijft' (floating) -->
                <rect v-if="currentScenario.behavior === 'drijft'"
                  x="-15"
                  :y="-(15 - (percentage_onder / 100 * 30))"
                  width="30"
                  :height="percentage_onder / 100 * 30"
                  rx="0"
                  fill="#38bdf8" fill-opacity="0.25"
                  class="pointer-events-none" />

                <!-- Zwaartepunt interaction point -->
                <g @mouseenter="hoveredPoint = 'center'" @mouseleave="hoveredPoint = null">
                  <circle cx="0" cy="0" r="7"
                    class="fill-slate-800 stroke-white transition-all duration-200 hover:r-9 cursor-help"
                    stroke-width="2" />
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

                <!-- Fz Vector (orange, high contrast vs blue water) -->
                <g v-if="inputs.fz.origin === 'center' && inputs.fz.direction === 'down'"
                  class="transition-opacity duration-300 pointer-events-none">
                  <line x1="0" y1="0" x2="0" :y2="vProps.fz.len"
                    class="stroke-orange-500" stroke-width="3.5"
                    marker-end="url(#arrowFz)" />
                  <text x="-14" :y="vProps.fz.len / 2 + 5"
                    class="fill-orange-700 font-extrabold pointer-events-none select-none"
                    font-size="11" text-anchor="end">
                    F<tspan font-size="8" dy="2">z</tspan>
                  </text>
                </g>
                <!-- Fz upward (wrong direction shown but student sees feedback) -->
                <g v-if="inputs.fz.origin === 'center' && inputs.fz.direction === 'up'"
                  class="pointer-events-none">
                  <line x1="0" y1="0" x2="0" :y2="-vProps.fz.len"
                    class="stroke-orange-500" stroke-width="3.5"
                    marker-end="url(#arrowFz)" />
                  <text x="-14" :y="-vProps.fz.len / 2 - 3"
                    class="fill-orange-700 font-extrabold pointer-events-none select-none"
                    font-size="11" text-anchor="end">
                    F<tspan font-size="8" dy="2">z</tspan>
                  </text>
                </g>

                <!-- FA Vector (rose, high contrast vs blue water) -->
                <g v-if="inputs.fa.origin === 'center' && inputs.fa.direction === 'up'"
                  class="transition-opacity duration-300 pointer-events-none">
                  <line x1="0" y1="0" x2="0" :y2="-vProps.fa.len"
                    class="stroke-rose-500" stroke-width="3.5"
                    marker-end="url(#arrowFa)" />
                  <text x="14" :y="-vProps.fa.len / 2 - 3"
                    class="fill-rose-700 font-extrabold pointer-events-none select-none"
                    font-size="11" text-anchor="start">
                    F<tspan font-size="8" dy="2">A</tspan>
                  </text>
                </g>
                <!-- FA downward (wrong direction shown but student sees feedback) -->
                <g v-if="inputs.fa.origin === 'center' && inputs.fa.direction === 'down'"
                  class="pointer-events-none">
                  <line x1="0" y1="0" x2="0" :y2="vProps.fa.len"
                    class="stroke-rose-500" stroke-width="3.5"
                    marker-end="url(#arrowFa)" />
                  <text x="14" :y="vProps.fa.len / 2 + 5"
                    class="fill-rose-700 font-extrabold pointer-events-none select-none"
                    font-size="11" text-anchor="start">
                    F<tspan font-size="8" dy="2">A</tspan>
                  </text>
                </g>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 left-4 flex flex-col gap-1.5 text-[10px] md:text-xs font-bold tracking-wider">
              <div class="flex items-center gap-2">
                <div class="w-5 h-1.5 bg-orange-500 rounded"></div>
                <span class="bg-white/85 px-2 py-1 rounded border border-slate-200">
                  Zwaartekracht (F<sub>z</sub>)
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-1.5 bg-rose-500 rounded"></div>
                <span class="bg-white/85 px-2 py-1 rounded border border-slate-200">
                  Archimedeskracht (F<sub>A</sub>)
                </span>
              </div>
            </div>

            <!-- SI Units info card -->
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
          </div>
        </div>

        <!-- RIGHT: TASK PANEL (60%) -->
        <div class="md:w-[58%] xl:w-[60%] flex flex-col min-h-0 min-w-0">

          <!-- SCENARIO HEADER -->
          <div class="mb-3 bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-lg shrink-0 relative overflow-hidden">
            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 pointer-events-none select-none">
              {{ currentScenario.emoji }}
            </div>
            <div class="relative z-10">
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

          <!-- SCROLLABLE TASK AREA -->
          <div class="flex-1 overflow-y-auto pr-2 pb-4 min-h-0 custom-scrollbar space-y-4">

            <!-- PHASE A: FORCE CARDS -->
            <div v-for="force in vectorConfig" :key="force.id"
              class="bg-white rounded-2xl border-2 shadow-sm transition-all duration-300 overflow-hidden"
              :class="[
                force.colorClass,
                inputs[force.id].origin === 'none' ? 'opacity-80' : '',
                phaseALocked ? 'opacity-60 pointer-events-none' : ''
              ]">

              <!-- Card header -->
              <div class="px-4 py-3 border-b flex items-center justify-between"
                :class="force.colorClass.includes('orange') ? 'border-orange-200' : 'border-rose-200'">
                <div class="flex items-center gap-3">
                  <PhNavigationArrow class="text-xl md:text-2xl" :class="force.iconColor" weight="fill" />
                  <h4 class="font-extrabold text-base md:text-lg">{{ force.label }}</h4>
                </div>
                <button v-if="!phaseALocked"
                  @click="handleOriginClick(force.id, 'none')"
                  class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Kracht Wissen">
                  <PhTrash weight="fill" size="18" />
                </button>
                <PhCheckCircle v-if="phaseALocked" weight="fill"
                  class="text-emerald-500 text-xl" />
              </div>

              <!-- Card content -->
              <div class="p-3 md:p-4 pb-5 space-y-4"
                :class="{'bg-slate-50/50': inputs[force.id].origin === 'none'}">

                <!-- Step 1: DOOR/OP description -->
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

                <!-- Steps 2 & 3: Origin and Direction grid -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Step 2: Origin -->
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
                        : 'border-amber-400 bg-amber-50/30 text-amber-900'">
                      <option value="none">Niet getekend</option>
                      <option value="center">⚫ Zwaartepunt</option>
                    </select>
                  </div>

                  <!-- Step 3: Direction -->
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

            <!-- PHASE B: FORCE BALANCE (visible after phase A is locked) -->
            <div v-if="currentPhase === 'B'"
              class="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">

              <!-- Header -->
              <div class="px-4 py-3 bg-slate-800 text-white flex items-center gap-3">
                <PhWaves weight="fill" size="20" class="text-indigo-300" />
                <h4 class="font-extrabold text-base">Krachtenbalans</h4>
              </div>

              <div class="p-4 space-y-5">
                <!-- Calculated values (read-only table) -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Berekende krachten</p>
                  <div class="space-y-1.5">
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-slate-600">Massa (m = ρ · V)</span>
                      <span class="font-mono font-bold text-slate-800 text-sm">
                        {{ mass.toLocaleString('nl-BE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }} kg
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-orange-600">Zwaartekracht (F<sub>z</sub> = m · g)</span>
                      <span class="font-mono font-bold text-orange-700 text-sm">
                        {{ Fz.toFixed(2).replace('.', ',') }} N
                      </span>
                    </div>
                    <div class="flex justify-between items-center border-t border-slate-100 pt-1.5">
                      <span class="text-xs font-medium text-rose-600">
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
                      <span class="font-mono font-bold text-rose-700 text-sm">
                        {{ FA_actual.toFixed(2).replace('.', ',') }} N
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Question 1: Compare Fz and FA -->
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    1. Vergelijk de krachten
                  </p>
                  <div class="flex gap-2">
                    <button v-for="opt in [
                      { id: 'greater', label: 'Fz > FA' },
                      { id: 'equal', label: 'Fz = FA' },
                      { id: 'less', label: 'Fz < FA' }
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

                <!-- Question 2: What does the object do? -->
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    2. Wat doet {{ currentScenario.objectLabel }}?
                  </p>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="opt in [
                      { id: 'zinkt', label: 'Zinkt', icon: '↓', color: 'sky' },
                      { id: 'zweeft', label: 'Zweeft', icon: '-', color: 'slate' },
                      { id: 'stijgt', label: 'Stijgt', icon: '↑', color: 'amber' },
                      { id: 'drijft', label: 'Drijft', icon: '≈', color: 'emerald' }
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

            <!-- FEEDBACK BANNER -->
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

            <!-- ACTION BUTTONS -->
            <div class="flex gap-3 pt-2">
              <!-- Phase A, not correct: Check Forces -->
              <button v-if="currentPhase === 'A' && !isCorrect"
                @click="checkPhaseA"
                class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                <PhPlayCircle class="text-xl" weight="fill" /> Controleer Krachten
              </button>

              <!-- Phase A, correct: Go to Force Balance -->
              <button v-else-if="currentPhase === 'A' && isCorrect"
                @click="advanceToPhaseB"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl shadow-md shadow-indigo-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                Ga naar Krachtenbalans <PhArrowRight class="text-xl" weight="bold" />
              </button>

              <!-- Phase B, not correct: Check Balance -->
              <button v-else-if="currentPhase === 'B' && !isCorrect"
                @click="checkPhaseB"
                class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                <PhPlayCircle class="text-xl" weight="fill" /> Controleer Balans
              </button>

              <!-- Phase B, correct: Next Scenario or Complete Lab -->
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

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-pulse-red {
  animation: ring-pulse 1s ease-out 3;
  z-index: 50;
}

@keyframes ring-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 1);
    background-color: rgba(239, 68, 68, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(239, 68, 68, 0.8);
    background-color: rgba(239, 68, 68, 0.6);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 40px rgba(239, 68, 68, 0);
    background-color: transparent;
    transform: scale(1);
  }
}

@keyframes bubble-rise {
  0%   { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
}
.bubble {
  animation: bubble-rise linear infinite;
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgb(203 213 225); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgb(148 163 184); }
</style>
