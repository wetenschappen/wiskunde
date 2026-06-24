<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhFunction, PhChartLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: '🧮 De Functiemachine' },
  instruction: { type: String, default: 'Kies een functie, voer een x-waarde in en zie wat er gebeurt.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhFunction }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })

const phase = ref('explore')

// ——— FUNCTIONS ———
const functions = [
  { id: 'double', label: 'Verdubbelaar', expr: '2x', latex: 'f(x) = 2x', color: '#F97316', desc: 'Vermenigvuldig met 2', domain: 'alle getallen' },
  { id: 'add3', label: 'Opteller', expr: 'x + 3', latex: 'f(x) = x + 3', color: '#22C55E', desc: 'Tel 3 op', domain: 'alle getallen' },
  { id: 'square', label: 'Kwadraat', expr: 'x²', latex: 'f(x) = x^2', color: '#3B82F6', desc: 'Vermenigvuldig met zichzelf', domain: 'alle getallen' },
  { id: 'inverse', label: 'Omgekeerde', expr: '1/x', latex: 'f(x) = \\frac{1}{x}', color: '#A855F7', desc: '1 delen door x', domain: 'alle getallen behalve 0' },
  { id: 'linear', label: 'Eerstegraads', expr: '2x + 1', latex: 'f(x) = 2x + 1', color: '#EF4444', desc: 'Vermenigvuldig met 2, tel 1 op', domain: 'alle getallen' },
  { id: 'halfminus', label: 'Halvering', expr: '-0.5x + 2', latex: 'f(x) = -\\frac{1}{2}x + 2', color: '#8B5CF6', desc: 'Halveer, keer om, tel 2', domain: 'alle getallen' }
]

const selectedFn = ref(functions[0])
const inputX = ref(2)
const outputY = ref(null)
const showCalculation = ref(false)
const history = ref([])

const plottedPoints = computed(() => {
  return history.value.map((h, i) => ({ x: h.x, y: h.y, idx: i }))
})

// ——— LEVELS ———
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelConfig = computed(() => {
  return [
    { name: 'Ontdekken', task: 'Probeer verschillende x-waarden. Wat gebeurt er met de output?' },
    { name: 'Voorspellen', task: 'Kies een functie. Voer x in en voorspel f(x) voordat je kijkt.' },
    { name: 'Omkeren', task: 'Gegeven de output: wat was de input? Gebruik de functie in omgekeerde richting.' }
  ][currentInternalLevel.value]
})

// ——— PREDICTION (level 2) ———
const predictionMode = ref(false)
const prediction = ref(null)
const predictionCorrect = ref(null)

// ——— REVERSE (level 3) ———
const reverseMode = ref(false)
const reverseTarget = ref(null)
const reverseAnswer = ref('')
const reverseAttempts = ref(0)

// ——— DOMAIN CHECK ———
const domainError = ref('')

function compute(fn, x) {
  const val = typeof x === 'number' ? x : parseFloat(x)
  if (isNaN(val)) return { error: 'Voer een geldig getal in.' }
  if (fn.id === 'inverse' && val === 0) return { error: 'Delen door 0 kan niet! x = 0 is niet toegestaan voor deze functie.' }
  switch (fn.id) {
    case 'double': return { y: 2 * val }
    case 'add3': return { y: val + 3 }
    case 'square': return { y: val * val }
    case 'inverse': return { y: 1 / val }
    case 'linear': return { y: 2 * val + 1 }
    case 'halfminus': return { y: -0.5 * val + 2 }
    default: return { y: val }
  }
}

function computeReverse(fn, y) {
  const val = typeof y === 'number' ? y : parseFloat(y)
  if (isNaN(val)) return null
  switch (fn.id) {
    case 'double': return val / 2
    case 'add3': return val - 3
    case 'square': return val < 0 ? null : Math.sqrt(val)
    case 'inverse': return val === 0 ? null : 1 / val
    case 'linear': return (val - 1) / 2
    case 'halfminus': return (2 - val) * 2
    default: return val
  }
}

function runMachine() {
  domainError.value = ''
  showCalculation.value = false
  predictionCorrect.value = null

  const result = compute(selectedFn.value, inputX.value)
  if (result.error) {
    domainError.value = result.error
    outputY.value = null
    return
  }

  outputY.value = result.y

  // Level 2: check prediction
  if (predictionMode.value && prediction.value !== null) {
    predictionCorrect.value = Math.abs(prediction.value - result.y) < 0.001
  }

  // Add to history
  history.value.push({ x: inputX.value, y: result.y, fn: selectedFn.value.id })
  if (history.value.length > 20) history.value.shift()

  // Show step-by-step after brief delay (for animation)
  setTimeout(() => { showCalculation.value = true }, 300)

  const roundedY = Number.isInteger(result.y) ? result.y : result.y.toFixed(4)
  feedback.value = { type: 'success', text: `f(${inputX.value}) = ${roundedY}` }
}

function clearHistory() {
  history.value = []
  outputY.value = null
  showCalculation.value = false
  prediction.value = null
  predictionCorrect.value = null
  feedback.value = { type: 'info', text: 'Geschiedenis gewist. Probeer opnieuw!' }
}

function setInput(x) {
  inputX.value = x
  if (phase.value === 'explore') runMachine()
}

// ——— LEVEL 2: PREDICTION ———
function enterPredictionMode() {
  predictionMode.value = true
  prediction.value = null
  predictionCorrect.value = null
  feedback.value = { type: 'info', text: `Voorspel: wat is f(${inputX.value}) voor ${selectedFn.value.label}?` }
}

function submitPrediction() {
  if (prediction.value === null) return
  runMachine()
}

// ——— LEVEL 3: REVERSE ———
function generateReverseChallenge() {
  reverseMode.value = true
  const fn = functions[Math.floor(Math.random() * 4)] // simpler functions only
  selectedFn.value = fn
  const targetX = [-3, -2, -1, 1, 2, 3, 4, 5][Math.floor(Math.random() * 8)]
  const result = compute(fn, targetX)
  if (result.error) { generateReverseChallenge(); return }
  reverseTarget.value = { fn: fn, x: targetX, y: result.y }
  reverseAnswer.value = ''
  reverseAttempts.value = 0
  feedback.value = { type: 'info', text: `f(x) = ${result.y}. Wat was x? Gebruik de functie ${fn.label}.` }
}

function checkReverse() {
  const parsed = parseFloat(reverseAnswer.value)
  if (isNaN(parsed)) { feedback.value = { type: 'error', text: 'Voer een geldig getal in.' }; return }
  if (Math.abs(parsed - reverseTarget.value.x) < 0.001) {
    reverseMode.value = false
    inputX.value = reverseTarget.value.x
    outputY.value = reverseTarget.value.y
    showCalculation.value = true
    history.value.push({ x: reverseTarget.value.x, y: reverseTarget.value.y, fn: reverseTarget.value.fn.id })
    feedback.value = { type: 'success', text: `Correct! x = ${reverseTarget.value.x}. f(${reverseTarget.value.x}) = ${reverseTarget.value.y}. Dat klopt!` }
    setTimeout(() => { nextLevel() }, 1500)
  } else {
    reverseAttempts.value++
    feedback.value = { type: 'error', text: `Niet juist. De functie is ${reverseTarget.value.fn.label}. Denk aan de omgekeerde bewerking.` }
  }
}

// ——— LEVEL ADVANCEMENT ———
function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetLevel()
  } else {
    feedback.value = { type: 'success', text: 'Proficiat! Je hebt alle levels voltooid.' }
    setTimeout(() => emit('complete'), 1000)
  }
}

function resetLevel() {
  phase.value = 'explore'
  predictionMode.value = false
  reverseMode.value = false
  reverseTarget.value = null
  reverseAnswer.value = ''
  reverseAttempts.value = 0
  prediction.value = null
  predictionCorrect.value = null
  inputX.value = 2
  outputY.value = null
  showCalculation.value = false
  domainError.value = ''
  selectedFn.value = functions[0]
  if (currentInternalLevel.value === 0) history.value = []
  feedback.value = { type: 'info', text: `Level ${currentInternalLevel.value + 1}: ${levelConfig.value.task}` }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetLevel()
  } else emit('complete')
}

// ——— SVG GRAPH ———
const graphPoints = computed(() => {
  const fn = selectedFn.value
  const pts = []
  for (let x = -5; x <= 5; x += 0.1) {
    const result = compute(fn, x)
    if (!result.error) pts.push({ x, y: result.y })
  }
  return pts
})

const svgPath = computed(() => {
  if (graphPoints.value.length === 0) return ''
  const scale = 20
  const pts = graphPoints.value.filter(p => p.y > -8 && p.y < 8)
  if (pts.length === 0) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * scale).toFixed(1)},${(-p.y * scale).toFixed(1)}`).join(' ')
})

// ——— LIFECYCLE ———
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetLevel()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
  if (e.key === 'Enter' && reverseMode.value) checkReverse()
}
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>

  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-xl bg-white">

    <header class="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-slate-200 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2.5 rounded-xl bg-amber-50 ring-1 ring-amber-200">
          <component :is="props.icon" weight="fill" class="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} / {{ totalInternalLevels }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-400 transition-colors rounded-xl hover:bg-slate-100 hover:text-slate-600 active:scale-[0.95]"><PhX class="w-5 h-5" weight="bold" /></button>
    </header>

    <main class="flex flex-1 overflow-hidden">

      <!-- SIDEBAR -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r-2 border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]">
          <h3 class="text-sm font-bold tracking-wider text-slate-500 uppercase">{{ levelConfig.name }}</h3>
          <MathText :content="props.instruction" class="prose prose-sm text-slate-600" />

          <!-- Level task -->
          <div class="bg-amber-50 rounded-xl border-2 border-amber-200 p-4">
            <p class="text-sm font-medium text-amber-800">{{ levelConfig.task }}</p>
          </div>

          <!-- Function selector -->
          <div class="bg-white rounded-xl border-2 border-slate-200 p-4">
            <label class="block text-sm font-bold text-slate-700 mb-2">Kies een functie:</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="fn in functions" :key="fn.id" @click="selectedFn = fn"
                class="py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all active:scale-[0.98]"
                :class="selectedFn.id === fn.id ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'"
                :style="selectedFn.id === fn.id ? { borderColor: fn.color, backgroundColor: fn.color + '15', color: fn.color } : {}">
                {{ fn.label }}
              </button>
            </div>
            <p class="mt-2 text-xs text-slate-500 font-mono">{{ selectedFn.latex }}</p>
            <p class="text-xs text-slate-400">Domein: {{ selectedFn.domain }}</p>
          </div>

          <!-- Input controls -->
          <div class="bg-white rounded-xl border-2 border-slate-200 p-4">
            <label class="block text-sm font-bold text-slate-700 mb-3">Input (x):</label>

            <div class="flex gap-2 mb-3">
              <input type="number" v-model.number="inputX" @keydown.enter="runMachine"
                class="flex-1 p-3 text-lg font-mono font-bold border-2 border-slate-300 rounded-xl bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                :disabled="reverseMode" />
              <button @click="runMachine"
                class="px-5 py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 transition-all active:scale-[0.98]"
                :disabled="reverseMode">Stoppen!</button>
            </div>

            <!-- Quick input buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button v-for="val in [-3, -2, -1, 0, 1, 2, 3, 5, 10]" :key="val" @click="setInput(val)"
                class="px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all active:scale-[0.95]"
                :class="inputX === val ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'"
                :disabled="reverseMode">{{ val }}</button>
            </div>

            <p v-if="domainError" class="mt-2 text-xs text-red-600 font-medium p-2 bg-red-50 rounded-lg border border-red-200">{{ domainError }}</p>
          </div>

          <!-- Output display -->
          <div class="bg-amber-50 rounded-xl border-2 border-amber-200 p-4 text-center" v-if="outputY !== null && !domainError">
            <p class="text-xs text-slate-500 mb-1">Output (y):</p>
            <p class="font-mono text-2xl font-black text-amber-600">{{ Number.isInteger(outputY) ? outputY : outputY.toFixed(4) }}</p>
            <div v-if="showCalculation" class="animate-fadeIn mt-3 p-3 bg-white rounded-xl border border-amber-200">
              <p class="text-xs font-mono text-slate-600">{{ selectedFn.desc }}: <span class="font-bold">{{ inputX }} → {{ Number.isInteger(outputY) ? outputY : outputY.toFixed(4) }}</span></p>
            </div>

            <!-- Prediction feedback (level 2) -->
            <div v-if="predictionCorrect !== null" class="mt-2 text-xs font-bold" :class="predictionCorrect ? 'text-emerald-600' : 'text-red-600'">
              {{ predictionCorrect ? '✓ Voorspelling juist!' : '✗ Voorspelling niet juist. Het antwoord was ' + (Number.isInteger(outputY) ? outputY : outputY.toFixed(4)) }}
            </div>
          </div>

          <!-- Level 2: Prediction mode -->
          <div v-if="currentInternalLevel === 1 && phase === 'explore' && !predictionMode" class="text-center">
            <button @click="enterPredictionMode" class="w-full py-3 font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-[0.98]">Voorspel eerst!</button>
          </div>

          <div v-if="predictionMode" class="bg-indigo-50 rounded-xl border-2 border-indigo-200 p-4">
            <p class="text-sm font-bold text-indigo-800 mb-2">Jouw voorspelling:</p>
            <div class="flex gap-2 mb-2">
              <input type="number" v-model.number="prediction" placeholder="f(x) = ?" step="any"
                class="flex-1 p-2 text-sm font-mono border-2 border-indigo-300 rounded-xl bg-white focus:border-indigo-500 focus:outline-none" />
              <button @click="submitPrediction" :disabled="prediction === null" class="px-4 py-2 font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40">Check</button>
            </div>
          </div>

          <!-- Level 3: Reverse mode -->
          <div v-if="reverseMode && reverseTarget" class="bg-purple-50 rounded-xl border-2 border-purple-200 p-4">
            <p class="text-sm font-bold text-purple-800 mb-2">Omgekeerd! f(x) = {{ reverseTarget.y }}</p>
            <p class="text-xs text-purple-600 mb-2">Functie: {{ reverseTarget.fn.label }} ({{ reverseTarget.fn.latex }})</p>
            <div class="flex gap-2">
              <input v-model="reverseAnswer" placeholder="Wat was x?" type="number" step="any"
                class="flex-1 p-2 text-sm font-mono border-2 border-purple-300 rounded-xl bg-white focus:border-purple-500 focus:outline-none" />
              <button @click="checkReverse" class="px-4 py-2 font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-500">Check</button>
            </div>
            <p v-if="reverseAttempts > 1" class="text-xs text-purple-600 mt-2">Tip: doe de OMGEKEERDE bewerking van {{ reverseTarget.fn.label }}.</p>
          </div>

          <!-- History -->
          <div v-if="history.length > 0" class="bg-white rounded-xl border-2 border-slate-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-bold text-slate-700">Geschiedenis:</label>
              <button @click="clearHistory" class="text-xs text-slate-400 hover:text-slate-600 underline">Wissen</button>
            </div>
            <div class="max-h-24 overflow-y-auto space-y-1">
              <div v-for="(h, i) in [...history].reverse()" :key="i" class="text-xs font-mono text-slate-500">
                f({{ h.x }}) = {{ Number.isInteger(h.y) ? h.y : h.y.toFixed(4) }}
              </div>
            </div>
          </div>

          <!-- Feedback -->
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 text-sm font-medium rounded-xl border-2 animate-fadeIn"
            :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-300': feedback.type === 'success', 'bg-red-50 text-red-800 border-red-300': feedback.type === 'error', 'bg-blue-50 text-blue-800 border-blue-300': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

        </div>

        <!-- Footer nav -->
        <div class="p-4 bg-slate-50 border-t-2 border-slate-200 shrink-0">
          <div class="flex items-center gap-3">
            <button @click="resetLevel" class="p-3 transition-colors rounded-xl text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-100 active:scale-[0.98]"><PhArrowClockwise weight="bold" class="w-5 h-5" /></button>
            <button v-if="currentInternalLevel === 0 && history.length >= 3" @click="nextLevel" class="flex-1 py-3 font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level →</button>
            <div v-else-if="currentInternalLevel === 0" class="flex-1 py-3 text-sm font-medium text-slate-400 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">Probeer 3x of meer</div>

            <button v-if="currentInternalLevel === 1 && predictionMode === false && !reverseMode" @click="nextLevel" class="flex-1 py-3 font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level →</button>

            <button v-if="currentInternalLevel >= 2 && !reverseMode" @click="generateReverseChallenge" class="flex-1 py-3 font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98]">Nieuwe omgekeerde!</button>
          </div>
        </div>
      </div>

      <!-- GRAPH VIEW -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center pattern-grid">
          <div class="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div class="text-center mb-4">
              <span class="font-mono text-lg font-bold" :style="{ color: selectedFn.color }">{{ selectedFn.latex }}</span>
            </div>

            <!-- SVG Graph -->
            <svg width="400" height="400" viewBox="-110 -110 220 220" class="w-full h-auto mx-auto bg-white rounded-xl border border-slate-200">
              <!-- Grid -->
              <g stroke="#e2e8f0" stroke-width="0.5">
                <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*20" y1="-100" :x2="(i-11)*20" y2="100" />
                <line v-for="i in 21" :key="'h'+i" x1="-100" :y1="(i-11)*20" x2="100" :y2="(i-11)*20" />
              </g>
              <!-- Axes -->
              <line x1="-100" y1="0" x2="100" y2="0" stroke="#64748b" stroke-width="1.5" />
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#64748b" stroke-width="1.5" />
              <!-- Axis labels -->
              <text x="95" y="-5" font-size="8" font-weight="bold" fill="#64748b" text-anchor="end">x</text>
              <text x="5" y="-95" font-size="8" font-weight="bold" fill="#64748b" text-anchor="start">y</text>

              <!-- Function graph -->
              <path v-if="svgPath" :d="svgPath" fill="none" :stroke="selectedFn.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7" />

              <!-- Plotted history points -->
              <g v-for="p in plottedPoints" :key="p.idx">
                <circle :cx="p.x * 20" :cy="-p.y * 20" r="4" fill="#0f172a" class="animate-fadeIn" />
              </g>

              <!-- Current point highlight -->
              <g v-if="outputY !== null && !domainError && inputX > -5.5 && inputX < 5.5 && outputY > -5.5 && outputY < 5.5">
                <circle :cx="inputX * 20" :cy="-outputY * 20" r="6" :fill="selectedFn.color" stroke="white" stroke-width="2" class="animate-fadeIn" />
                <text :x="inputX * 20 + 8" :y="-outputY * 20 - 5" font-size="8" font-weight="bold" :fill="selectedFn.color">
                  ({{ inputX }}, {{ Number.isInteger(outputY) ? outputY : outputY.toFixed(1) }})
                </text>
              </g>

              <!-- Origin label -->
              <text x="4" y="12" font-size="7" fill="#94a3b8">O</text>
            </svg>

            <!-- Legend -->
            <div class="flex flex-wrap gap-2 mt-3 justify-center">
              <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-3 h-0.5 rounded" :style="{ backgroundColor: selectedFn.color }"></span>
                <span class="font-mono">{{ selectedFn.latex }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <span class="w-2 h-2 rounded-full bg-slate-800"></span>
                <span>Invoerwaarden</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>
<SuccessCelebration :show="false" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 12px -8px rgba(0,0,0,0.08); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
