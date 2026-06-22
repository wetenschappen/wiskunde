<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Ongelijkheden Oplossen' },
  instruction: { type: String, default: 'Los de ongelijkheid eerst algebraïsch op (kies de juiste stappen). Teken daarna de oplossing op de getallenas.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhX }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

// === Level generation (algebra-driven: student picks each step) ===
function generateLevel() {
  // Level 1: ax > b (positive a, no flip needed)
  const l1_aPool = [2, 3, 4]
  const l1_xPool = [2, 3, 4, 5]
  const l1_a = l1_aPool[Math.floor(Math.random() * l1_aPool.length)]
  const l1_x = l1_xPool[Math.floor(Math.random() * l1_xPool.length)]
  const l1_b = l1_a * l1_x

  // Level 2: -ax <= b (divide by negative → sign flips)
  const l2_aPool = [2, 3, 4]
  const l2_xPool = [-5, -4, -3, -2, -1]
  const l2_a = l2_aPool[Math.floor(Math.random() * l2_aPool.length)]
  const l2_x = l2_xPool[Math.floor(Math.random() * l2_xPool.length)]
  const l2_b = -l2_a * l2_x

  // Level 3: c - ax < b (multi-step, negative coefficient)
  const l3_aPool = [2, 3]
  const l3_xPool = [2, 3, 4, 5]
  const l3_a = l3_aPool[Math.floor(Math.random() * l3_aPool.length)]
  const l3_x = l3_xPool[Math.floor(Math.random() * l3_xPool.length)]
  const l3_b = 1 + Math.floor(Math.random() * 2)
  const l3_c = l3_a * l3_x + l3_b

  return [
    {
      // Level 1: simple one-step, positive coefficient
      problem: `${l1_a}x > ${l1_b}`,
      targetVal: l1_x,
      targetDirection: 'right',
      targetIncluded: false,
      targetInterval: `]${l1_x}, +∞[`,
      solutionStr: `x > ${l1_x}`,
      flipSign: false,
      multiStep: false,
      solveSteps: [
        { text: `Deel beide kanten door ${l1_a}`, operation: `÷${l1_a}`, correct: true },
        { text: `Vermenigvuldig beide kanten met ${l1_a}`, operation: `×${l1_a}`, correct: false },
        { text: `Tel ${l1_a} op bij beide kanten`, operation: `+${l1_a}`, correct: false },
        { text: `Trek ${l1_b} af van beide kanten`, operation: `−${l1_b}`, correct: false },
      ]
    },
    {
      // Level 2: sign flip required
      problem: `-${l2_a}x ≤ ${l2_b}`,
      targetVal: l2_x,
      targetDirection: 'right',
      targetIncluded: true,
      targetInterval: `[${l2_x}, +∞[`,
      solutionStr: `x ≥ ${l2_x}`,
      flipSign: true,
      multiStep: false,
      solveSteps: [
        { text: `Deel door -${l2_a} en klap het teken om`, operation: `÷(-${l2_a}) flip`, correct: true },
        { text: `Deel door -${l2_a} zonder te klappen`, operation: `÷(-${l2_a}) noflip`, correct: false },
        { text: `Vermenigvuldig met -${l2_a} zonder te klappen`, operation: `×(-${l2_a})`, correct: false },
      ]
    },
    {
      // Level 3: multi-step with sign flip
      problem: `${l3_c} - ${l3_a}x < ${l3_b}`,
      targetVal: l3_x,
      targetDirection: 'right',
      targetIncluded: false,
      targetInterval: `]${l3_x}, +∞[`,
      solutionStr: `x > ${l3_x}`,
      flipSign: true,
      multiStep: true,
      solveSteps: [
        { text: `Trek ${l3_c} af van beide kanten: −${l3_a}x < ${l3_b} − ${l3_c} = ${l3_b - l3_c}`, operation: `−${l3_c}`, correct: true },
        { text: `Tel ${l3_c} op bij beide kanten: −${l3_a}x + ${l3_c} < ${l3_b} + ${l3_c}`, operation: `+${l3_c}`, correct: false },
        { text: `Vermenigvuldig alle termen met ${l3_a}`, operation: `×${l3_a}`, correct: false },
      ],
      solveSteps2: [
        { text: `Deel door -${l3_a} en klap het teken: x > ${l3_x}`, operation: `÷(-${l3_a})`, correct: true },
        { text: `Deel door -${l3_a} zonder te klappen: x < ${l3_x}`, operation: `÷(-${l3_a}) noflip`, correct: false },
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// === Algebraic solving state ===
const algStep = ref(0)
const chosenStep = ref(null)
const chosenStepErrors = ref(0)
const numberLineDone = ref(false)

// === Number line state ===
const userValue = ref(0)
const userDirection = ref('right')
const userIncluded = ref(false)

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false
  showReflection.value = false; reflectionAnswer.value = ''
  showWorkedExample.value = currentInternalLevel.value === 0
  attemptCount.value = 0; chosenStepErrors.value = 0
  feedback.value = { type: 'info', text: '' }
  userValue.value = 0; userDirection.value = 'right'; userIncluded.value = false
  algStep.value = 0; numberLineDone.value = false; chosenStep.value = null
}

function skipWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Los algebraïsch op, daarna teken je het op de as.' }
}

// === Algebraic step selection ===
function selectStep(idx) {
  const lvl = currentLevelData.value
  const steps = algStep.value === 0 ? lvl.solveSteps : (lvl.solveSteps2 || [])
  if (!steps) return
  const step = steps[idx]

  if (step.correct) {
    chosenStep.value = step.operation
    feedback.value = { type: 'success', text: `Juiste stap! ${step.text}` }
    if (lvl.multiStep && algStep.value === 0) {
      algStep.value = 1  // Move to second solving step
      chosenStepErrors.value = 0
    } else {
      algStep.value = -1  // Algebra solved, move to number line
      feedback.value = { type: 'success', text: `Algebra opgelost! Oplossing: ${lvl.solutionStr}. Teken dit nu op de getallenas.` }
    }
  } else {
    chosenStepErrors.value++
    // Error analysis
    if (lvl.flipSign && step.operation && step.operation.includes('noflip')) {
      feedback.value = { type: 'error', text: `Let op: delen door een NEGATIEF getal draait het ongelijkheidsteken om! Kies de stap waarbij je het teken omklapt.` }
    } else if (lvl.flipSign && step.operation && step.operation.includes('×')) {
      feedback.value = { type: 'error', text: 'Vermenigvuldigen met een negatief getal is toegestaan, maar hier is delen efficiënter.' }
    } else {
      feedback.value = { type: 'error', text: `Niet correct. Denk na over wat je moet doen om x te isoleren. Hint: ${lvl.flipSign ? 'let op het minteken voor x!' : 'deel door de coëfficiënt van x.'}` }
    }
    if (chosenStepErrors.value >= 3) {
      feedback.value = { type: 'info', text: `De juiste oplossing is: ${lvl.solutionStr}. Klik het juiste antwoord.` }
    }
  }
}

// === Number line check ===
function checkNumberLine() {
  const lvl = currentLevelData.value
  const valCorrect = userValue.value === lvl.targetVal
  const dirCorrect = userDirection.value === lvl.targetDirection
  const incCorrect = userIncluded.value === lvl.targetIncluded

  if (valCorrect && dirCorrect && incCorrect) {
    numberLineDone.value = true
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Perfect! ${lvl.solutionStr} → Interval: ${lvl.targetInterval}` }
  } else {
    isCorrect.value = false
    if (!valCorrect) feedback.value = { type: 'error', text: `De grenswaarde is x = ${lvl.targetVal}. Sleep naar ${lvl.targetVal}.` }
    else if (!dirCorrect) feedback.value = { type: 'error', text: lvl.flipSign ? 'Denk aan het omklappen: de pijl moet naar rechts.' : 'Controleer de richting van de pijl.' }
    else feedback.value = { type: 'error', text: lvl.targetIncluded ? '≤ of ≥ betekent een GESLOTEN bolletje (ingevuld).' : '< of > betekent een OPEN bolletje (niet ingevuld).' }
  }
}

// === Reflection ===
function checkReflection() {
  const lvl = currentLevelData.value
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = lvl.flipSign ? ['omklap', 'negatief', 'teken', 'flip'] : ['deel', 'delen', 'coëfficiënt']
  const hasKeyword = keywords.some(k => ans.includes(k))
  if (hasKeyword && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: lvl.flipSign
      ? 'Leg uit: waarom moet het teken omklappen bij delen door een negatief getal?'
      : 'Leg uit: hoe kom je van ax > b naar de oplossing?' }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })

const exampleLevels = [
  { problem: '2x > 8', solution: 'x > 4', note: 'Deel door 2 (positief) → teken blijft hetzelfde' },
  { problem: '-3x ≤ 12', solution: 'x ≥ -4', note: 'Deel door -3 (NEGATIEF) → teken klapt om!' },
  { problem: '5 - 2x < 3', solution: 'x > 1', note: 'Eerst -5, dan ÷(-2) → teken klapt om!' },
]
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeelden:</p>
            <div class="space-y-3 text-sm text-slate-700">
              <div v-for="(ex, i) in exampleLevels" :key="i" class="bg-white p-2 rounded border border-amber-200">
                <p class="font-mono font-bold">{{ ex.problem }}</p>
                <p class="text-emerald-700">→ {{ ex.solution }}</p>
                <p class="text-xs text-slate-500">{{ ex.note }}</p>
              </div>
            </div>
            <p class="text-xs text-slate-500 mt-2"><strong>Belangrijk:</strong> Deel of vermenigvuldig je met een NEGATIEF getal? Dan klapt het teken om!</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Problem display -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-mono text-2xl font-black text-slate-800">{{ currentLevelData.problem }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ currentLevelData.flipSign ? '⚠️ Delen door een negatief getal!' : '' }}</p>
          </div>

          <!-- Algebraic solving phase -->
          <div v-if="!showWorkedExample && algStep >= 0" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">{{ algStep === 0 ? 'Stap 1: Kies de juiste algebraïsche bewerking' : 'Stap 2: Kies de volgende bewerking' }}</p>
            <div class="flex flex-col gap-2">
              <button v-for="(step, idx) in (algStep === 0 ? currentLevelData.solveSteps : (currentLevelData.solveSteps2 || []))" :key="idx"
                @click="selectStep(idx)" :disabled="isCorrect"
                class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all disabled:opacity-40"
                :class="chosenStep === step.operation ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                {{ step.text }}
              </button>
            </div>
          </div>

          <!-- Solved: show solution + number line phase -->
          <div v-if="algStep === -1 && !numberLineDone" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-3 font-mono">Oplossing: {{ currentLevelData.solutionStr }}</p>
            <p class="text-xs text-slate-600 mb-3">Teken dit nu op de getallenas.</p>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Grenswaarde:</label>
                <input type="range" v-model.number="userValue" min="-10" max="10" step="1" class="w-full accent-amber-600">
                <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono"><span>-10</span><span>0</span><span>10</span></div>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Richting:</label>
                <div class="flex gap-2">
                  <button @click="userDirection = 'left'" class="flex-1 py-2 rounded-lg font-bold border-2 text-lg" :class="userDirection === 'left' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500'">← (x &lt;)</button>
                  <button @click="userDirection = 'right'" class="flex-1 py-2 rounded-lg font-bold border-2 text-lg" :class="userDirection === 'right' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500'">(x &gt;) →</button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Bolletje:</label>
                <div class="flex gap-2">
                  <button @click="userIncluded = true" class="flex-1 py-2 rounded-lg font-bold border-2 text-sm" :class="userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500'">Dicht (≤ of ≥)</button>
                  <button @click="userIncluded = false" class="flex-1 py-2 rounded-lg font-bold border-2 text-sm" :class="!userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500'">Open (&lt; of &gt;)</button>
                </div>
              </div>
              <button @click="checkNumberLine" class="w-full py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">Teken op de as</button>
            </div>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection && numberLineDone" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom klapt het teken om?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Als je beide kanten van een ongelijkheid met een negatief getal vermenigvuldigt of deelt, moet het teken omklappen. Voorbeeld: 2 &lt; 5 is waar. Deel door -1: -2 &lt; -5 is NIET waar. Maar -2 &gt; -5 is waar — dus het teken klapt om. Dit komt doordat getallen op de getallenas van plaats wisselen ten opzichte van 0.</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">{{ currentLevelData.flipSign ? 'Reflectie: Waarom klapt het teken om bij delen door een negatief getal?' : 'Reflectie: Hoe controleer je of je ongelijkheid juist is opgelost?' }}</p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-indigo-300 rounded-lg bg-white outline-none focus:border-indigo-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4" role="status" aria-live="polite" aria-atomic="true"
            :class="{ 'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-blue-100 text-blue-800 border-blue-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] flex items-center justify-center gap-2">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual: Number line display -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <!-- Solution display -->
            <div class="text-center mb-6">
              <div v-if="isCorrect" class="text-xl font-black text-emerald-700 font-mono">
                {{ currentLevelData.solutionStr }}
                <span class="text-sm text-slate-500 ml-2">({{ currentLevelData.targetInterval }})</span>
              </div>
              <div v-else-if="algStep === -1" class="text-xl font-black text-slate-700 font-mono">
                x ? {{ userValue }}
              </div>
              <div v-else class="text-xl font-black text-amber-600 font-mono">
                {{ currentLevelData.problem }}
              </div>
            </div>

            <!-- Number line -->
            <div class="relative w-full h-20 flex items-center mt-4">
              <div class="absolute inset-x-0 h-1.5 bg-slate-300 rounded-full"></div>
              <div class="absolute flex justify-between inset-x-4 px-2">
                <div v-for="i in 21" :key="i" class="w-0.5 h-4 bg-slate-400 relative">
                  <span v-if="(i-11) % 2 === 0" class="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">{{ i - 11 }}</span>
                </div>
              </div>
              <!-- Highlighted region -->
              <div v-if="algStep === -1 || isCorrect" class="absolute h-3 bg-amber-500 rounded-full pointer-events-none transition-all duration-300 opacity-70"
                :class="userDirection === 'left' ? 'justify-start rounded-r-none' : 'justify-end rounded-l-none'"
                :style="{ left: userDirection === 'left' ? '0' : `calc(2rem + ${((userValue + 10) / 20) * 100}%)`, right: userDirection === 'right' ? '0' : `calc(2rem + ${((10 - userValue) / 20) * 100}%)` }">
              </div>
              <!-- Dot -->
              <div v-if="algStep === -1 || isCorrect" class="absolute w-6 h-6 rounded-full border-4 border-amber-600 transition-all duration-300 z-10 shadow-sm bg-white"
                :style="{ left: `calc(1rem + 8px + ${((userValue + 10) / 20) * 100}%)`, transform: 'translateX(-50%)' }">
                <div v-if="userIncluded" class="w-full h-full bg-amber-600 rounded-full scale-[1.1]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showReflection" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
