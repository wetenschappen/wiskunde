<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vergelijkingen Oplossen (Balans)' },
  instruction: { type: String, default: 'Kies een bewerking (+, −, ×, ÷) en een getal. Voer het uit op BEIDE kanten tot je x hebt geïsoleerd.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhScales }
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
const showPrediction = ref(true)
const predictedFirstStep = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])
const leftExpr = ref({ x: 0, c: 0 })
const rightExpr = ref({ x: 0, c: 0 })
const opType = ref('+')
const opValue = ref(1)

// === Level generation ===
function generateLevel() {
  const l1_a = 2 + Math.floor(Math.random() * 3)
  const l1_x = 2 + Math.floor(Math.random() * 4)
  const l1_b = 1 + Math.floor(Math.random() * 5)
  const l1_c = l1_a * l1_x + l1_b

  const l2_a = 4 + Math.floor(Math.random() * 3)
  const l2_c = 2 + Math.floor(Math.random() * 2)
  const l2_x = 2 + Math.floor(Math.random() * 4)
  const l2_b = 1 + Math.floor(Math.random() * 5)
  const l2_d = (l2_a - l2_c) * l2_x + l2_b

  const l3_denom = 2 + Math.floor(Math.random() * 3)
  const l3_x = l3_denom * (1 + Math.floor(Math.random() * 4))
  const l3_b = 1 + Math.floor(Math.random() * 4)
  const l3_c = l3_x / l3_denom + l3_b

  return [
    {
      label: 'ax + b = c (basis)',
      init: () => ({ lx: l1_a, lc: l1_b, rx: 0, rc: l1_c }),
      answer: l1_x,
      hints: [
        'Eerst de constante aan de linkerkant wegwerken: trek eraf of tel op.',
        `Kun je ${l1_b} wegwerken? Trek ${l1_b} af van beide kanten.`,
        `Stap 1: −${l1_b}. Stap 2: ÷${l1_a}. x = ${l1_x}`
      ],
      hintMethod: `−${l1_b}, daarna ÷${l1_a}`
    },
    {
      label: 'x aan beide kanten', init: () => ({ lx: l2_a, lc: l2_b, rx: l2_c, rc: l2_d }),
      answer: l2_x,
      hints: [
        'x staat zowel links als rechts. Zet ze eerst aan één kant.',
        `Trek ${l2_c}x af van beide kanten.`,
        `Stap 1: −${l2_c}x. Stap 2: −${l2_b}. Stap 3: ÷${l2_a - l2_c}. x = ${l2_x}`
      ],
      hintMethod: `−${l2_c}x, dan −${l2_b}, dan ÷${l2_a - l2_c}`
    },
    {
      label: 'x in een breuk', init: () => ({ lx: 1 / l3_denom, lc: l3_b, rx: 0, rc: l3_c }),
      answer: l3_x,
      hints: [
        'x staat in een breuk. Werk de noemer weg met een vermenigvuldiging.',
        `Vermenigvuldig met ${l3_denom} om de breuk weg te werken.`,
        `Stap 1: ×${l3_denom}. Stap 2: −${l3_b}. x = ${l3_x}`
      ],
      hintMethod: `×${l3_denom}, dan −${l3_b}`
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value !== 0
  predictedFirstStep.value = ''
  const initial = currentLevelData.value.init()
  leftExpr.value = { x: initial.lx, c: initial.lc }
  rightExpr.value = { x: initial.rx, c: initial.rc }
  opType.value = '+'; opValue.value = 1
  feedback.value = { type: 'info', text: '' }
  if (!showWorkedExample && showPrediction) initPrediction()
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) showPrediction.value = true
  initPrediction()
}

function initPrediction() {
  const lvl = currentLevelData.value
  predictedFirstStep.value = ''
  feedback.value = { type: 'info', text: `Wat is de EERSTE stap om x te isoleren?` }
}

function checkPrediction() {
  const lvl = currentLevelData.value
  if (predictedFirstStep.value === 'subConst') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: `Juist! ${lvl.hintMethod}` }
  } else {
    feedback.value = { type: 'error', text: `Denk na: wat staat er nog bij x? Eerst dat wegwerken. Hint: ${lvl.hints[0]}` }
  }
}

function applyOperation() {
  if (isCorrect.value) return
  const val = Number(opValue.value)
  if (isNaN(val) || val === 0) return
  if (opType.value === '/' && val === 0) {
    feedback.value = { type: 'error', text: 'Delen door 0 is niet toegestaan!' }
    return
  }

  let newLx = leftExpr.value.x, newLc = leftExpr.value.c
  let newRx = rightExpr.value.x, newRc = rightExpr.value.c

  if (opType.value === '+') { newLc += val; newRc += val }
  else if (opType.value === '-') { newLc -= val; newRc -= val }
  else if (opType.value === '*') {
    if (leftExpr.value.x !== Math.round(leftExpr.value.x) || rightExpr.value.x !== Math.round(rightExpr.value.x)) {
      feedback.value = { type: 'error', text: 'Vermenigvuldigen met een breuk is complex. Werk eerst de breuk weg.' }
      return
    }
    newLx *= val; newLc *= val; newRx *= val; newRc *= val
  } else if (opType.value === '/') {
    if (val === 0) return
    newLx /= val; newLc /= val; newRx /= val; newRc /= val
  }

  leftExpr.value.x = Math.round(newLx * 100) / 100
  leftExpr.value.c = Math.round(newLc * 100) / 100
  rightExpr.value.x = Math.round(newRx * 100) / 100
  rightExpr.value.c = Math.round(newRc * 100) / 100
  checkWin()
}

function checkWin() {
  const isXOnLeft = leftExpr.value.x === 1 && leftExpr.value.c === 0 && rightExpr.value.x === 0
  const isXOnRight = rightExpr.value.x === 1 && rightExpr.value.c === 0 && leftExpr.value.x === 0

  if (isXOnLeft || isXOnRight) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    const xVal = isXOnLeft ? rightExpr.value.c : leftExpr.value.c
    feedback.value = { type: 'success', text: `Briljant! x = ${xVal}` }
  } else if (leftExpr.value.x === 0 && rightExpr.value.x === 0) {
    attemptCount.value++
    feedback.value = { type: 'error', text: 'Je hebt alle x-en weggewerkt! Reset en probeer opnieuw, maar nu met een andere volgorde.' }
  } else {
    attemptCount.value++
    const lvl = currentLevelData.value
    const idx = Math.min(attemptCount.value - 1, 2)
    feedback.value = { type: 'info', text: lvl.hints[idx] }
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['beide', 'kant', 'zelfde', 'balans', 'evenwicht']
  if (keywords.some(k => ans.includes(k)) && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Leg uit met de termen: beide kanten, dezelfde bewerking, evenwicht.' }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
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
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: 2x + 5 = 13</p>
            <p class="text-sm text-slate-700 mb-1">We willen x alleen. Eerst het losse getal +5 weg, daarna de ×2.</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 1:</strong> −5 van beide kanten → 2x = 8</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 2:</strong> ÷2 van beide kanten → x = 4</p>
            <p class="text-xs text-slate-500 mt-1">De balans blijft in evenwicht omdat we links en rechts hetzelfde doen.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.label }}</p>
            <p class="font-mono text-xl font-black text-slate-800 mt-2">
              <span v-if="leftExpr.x !== 0">{{ leftExpr.x === 1 ? '' : leftExpr.x }}<span class="text-amber-600">x</span></span>
              <span v-if="leftExpr.c > 0"> + {{ leftExpr.c }}</span><span v-if="leftExpr.c < 0"> − {{ Math.abs(leftExpr.c) }}</span>
              <span v-if="rightExpr.x !== 0"> + {{ rightExpr.x }}<span class="text-amber-600">x</span></span>
              <span> = {{ rightExpr.c }}</span>
            </p>
          </div>

          <!-- Prediction -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Wat is de EERSTE stap om x te isoleren?</p>
            <div class="flex flex-col gap-2">
              <button @click="predictedFirstStep = 'subConst'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all" :class="predictedFirstStep === 'subConst' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                De constante wegwerken (+, −)
              </button>
              <button @click="predictedFirstStep = 'divX'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all" :class="predictedFirstStep === 'divX' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                Delen door de coëfficiënt van x
              </button>
              <button @click="predictedFirstStep = 'multX'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all" :class="predictedFirstStep === 'multX' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                Vermenigvuldigen
              </button>
            </div>
            <button v-if="predictedFirstStep" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">Bevestig</button>
          </div>

          <!-- Operation controls -->
          <div v-if="!showPrediction && !showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner">
            <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Kies een bewerking:</p>
            <div class="grid grid-cols-4 gap-2">
              <button @click="opType = '+'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '+' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">+</button>
              <button @click="opType = '-'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '-' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">−</button>
              <button @click="opType = '*'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '*' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">×</button>
              <button @click="opType = '/'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '/' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">÷</button>
            </div>
            <input type="number" v-model="opValue" class="w-full p-3 text-lg font-bold bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 tabular-nums" placeholder="getal" />
            <button @click="applyOperation" :disabled="isCorrect" class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-[0.98]">
              Uitvoeren op beide kanten
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt dit?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Elke bewerking die je op BEIDE kanten toepast, behoudt het evenwicht van de vergelijking. Dit is de <strong>balansmethode</strong>: het =-teken garandeert dat linker- en rechterlid gelijk zijn; wat je met het ene lid doet, moet je met het andere doen om de gelijkheid te bewaren.</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Waarom moet je altijd aan BEIDE kanten dezelfde bewerking doen? Leg uit in je eigen woorden.</p>
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
          <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] mr-4"><PhArrowClockwise /></button>
          <button v-if="isCorrect && !showReflection" @click="handleNext" class="py-4 px-6 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
            <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
            <PhArrowRight weight="bold" class="inline ml-1" />
          </button>
        </div>
      </div>

      <!-- Visual: Equation display -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center gap-6">
            <div class="font-mono font-black text-2xl text-slate-700 bg-white px-8 py-4 rounded-full shadow-sm border-2 border-slate-200 flex gap-3 items-center justify-center flex-wrap transition-all">
              <span>
                <span v-if="leftExpr.x !== 0">
                  <span v-if="leftExpr.x !== 1 && leftExpr.x !== -1">{{ leftExpr.x }}</span>
                  <span v-if="leftExpr.x === -1">−</span>
                  <span class="text-amber-600">x</span>
                </span>
                <span v-if="leftExpr.c > 0 && leftExpr.x !== 0"> + </span>
                <span v-if="leftExpr.c !== 0" class="tabular-nums">{{ leftExpr.c }}</span>
              </span>
              <span class="text-amber-500">=</span>
              <span class="tabular-nums">{{ rightExpr.c }}</span>
              <span v-if="rightExpr.x !== 0">
                <span v-if="rightExpr.x !== 1">{{ rightExpr.x }}</span>
                <span class="text-amber-600">x</span>
              </span>
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
