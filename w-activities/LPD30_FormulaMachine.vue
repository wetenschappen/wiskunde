<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEngine, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getalwaarde: De Formule-Machine' },
  instruction: { type: String, default: 'Kies een input x en bereken de output y via de formule-machine.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhEngine }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintLevel = ref(0)
const showHints = ref(false)
const feedback = ref({ type: 'info', text: 'Kies x en bereken y.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswers = ref(['', '', ''])
const showLPD = ref(false)
const lpdAnswer = ref('')
const lpdDone = ref(false)

const predictionMade = ref(false)
const predictionChoice = ref(null)
const predictionOptions = computed(() => [
  { id: 'follow', text: 'Ik volg de machine stap voor stap' },
  { id: 'formula', text: 'Ik bereken het direct met de formule' },
  { id: 'guess3', text: 'Ik probeer te raden' }
])
const reflectionQuestions = computed(() => [
  'Waarom moet je vermenigvuldigen voor optellen/aftrekken in de formule-machine?',
  'Waarom kun je met dezelfde formule verschillende outputs krijgen voor verschillende inputs?',
  'Waarom is het belangrijk om elke stap in de juiste volgorde te doen?'
])

const levels = ref([])

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

function generateLevel() {
  const nl = []
  let m1 = randomInt(2, 4); let c1 = randomInt(1, 6)
  nl.push({ formula: `y = ${m1}x + ${c1}`, steps: [`× ${m1}`, `+ ${c1}`], calc: (x) => m1 * x + c1, m: m1, c: c1, op: '+' })
  let m2 = randomInt(2, 4); let c2 = randomInt(3, 7)
  nl.push({ formula: `y = ${m2}x - ${c2}`, steps: [`× ${m2}`, `− ${c2}`], calc: (x) => m2 * x - c2, m: m2, c: c2, op: '−' })
  let m3 = randomInt(3, 6); let c3 = randomInt(2, 8)
  let op3 = Math.random() > 0.5 ? '+' : '−'
  let calc3 = op3 === '+' ? (x) => m3 * x + c3 : (x) => m3 * x - c3
  nl.push({ formula: `y = ${m3}x ${op3} ${c3}`, steps: [`× ${m3}`, `${op3 === '+' ? '+ ' : '− '}${c3}`], calc: calc3, m: m3, c: c3, op: op3 })
  return nl
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])
const xValue = ref(4)
const userAns = ref(null)
const step = ref(0)
const currentNumber = ref(4)

const hintTexts = computed(() => {
  const lvl = currentLevel.value
  if (!lvl) return ['', '', '']
  return [
    `Tip 1: Volg de formule stap voor stap. ${lvl.formula.replace('x', '')}.`,
    `Tip 2: ${lvl.steps[0]} van ${xValue.value} = ${lvl.m * xValue.value}. Daarna ${lvl.steps[1]}.`,
    `Tip 3: ${xValue.value} ${lvl.steps[0]} = ${lvl.m * xValue.value}. Dan ${lvl.m * xValue.value} ${lvl.steps[1]} = ... (vul in).`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function runMachine() {
  isChecked.value = true
  const lvl = currentLevel.value
  const correctAns = lvl.calc(xValue.value)
  if (userAns.value === correctAns) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Prima! Machine start...' }
    currentNumber.value = xValue.value
    const step1 = lvl.m * xValue.value
    setTimeout(() => { step.value = 1; currentNumber.value = step1 }, 800)
    setTimeout(() => { step.value = 2; currentNumber.value = correctAns; showWhy.value = true
      feedback.value = { type: 'success', text: `${lvl.formula} met x=${xValue.value} geeft y=${correctAns}.` }
    }, 1600)
  } else {
    attemptCount.value++; isCorrect.value = false
    const step1 = lvl.m * xValue.value
    if (userAns.value === step1) feedback.value = { type: 'error', text: `Goed begin! ${lvl.m} × ${xValue.value} = ${step1}. Maar vergeet de volgende stap.` }
    else feedback.value = { type: 'error', text: `Niet juist. ${lvl.formula} met x=${xValue.value}. Volg de machine stap voor stap.` }
  }
}

function detectError(val) {
  const lvl = currentLevel.value
  if (!lvl) return null
  if (lvl.op === '−' && val === lvl.m * xValue.value + lvl.c) return 'Let op! Je hebt opgeteld in plaats van afgetrokken. De formule is y = ' + lvl.formula
  return null
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Kies x en bereken y.' }
  xValue.value = 4; userAns.value = null; step.value = 0; currentNumber.value = 4
}

const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function handleNext() {
  if (isCorrect.value && !showReflection.value) { showReflection.value = true }
  else if (showReflection.value && allReflectionsDone.value) { submitReflection() }
}

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false; reflectionAnswers.value = ['', '', '']
    if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
    else { showLPD.value = true }
  }
}

function submitLPD() { if (lpdAnswer.value.length >= 20) { lpdDone.value = true; emit('complete') } }

const whyText = computed(() => [
  'Een formule is een recept: je stopt er een getal in (input) en er komt een ander getal uit (output).',
  'De volgorde van bewerkingen is belangrijk: eerst vermenigvuldigen, dan optellen/aftrekken.'
])

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
    nextTick(() => mainArea.value?.focus()); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { shouldPulse.value = false }
})

watch(xValue, (v) => { if (!isChecked.value) currentNumber.value = v })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
  <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">
    <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 z-50">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
          <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-400 rounded-full hover:bg-slate-700"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm prose-invert text-slate-300" />

          <details class="bg-slate-700/50 rounded-xl p-4 border border-slate-600 mb-4">
            <summary class="font-bold text-amber-400 cursor-pointer text-sm">Voorbeeld — Stap voor Stap</summary>
            <div class="mt-3 text-sm space-y-2 text-slate-300">
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-400 shrink-0" /> Formule: y = 3x + 2. Kies x = 4.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-400 shrink-0" /> Stap 1: 3 × 4 = 12.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-400 shrink-0" /> Stap 2: 12 + 2 = 14. y = 14.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-900/50 rounded-xl p-4 border border-indigo-700 mb-4">
            <h4 class="font-bold text-indigo-300 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-400 mb-3">Hoe ga je de output berekenen?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-slate-700 border cursor-pointer text-xs text-slate-200"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-800' : 'border-slate-600'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-500" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
              <label class="block text-sm font-bold text-slate-300 mb-2">Input x:</label>
              <div class="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-600 mb-4">
                <input type="range" min="1" max="10" step="1" v-model.number="xValue" :disabled="isChecked"
                  class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                <span class="font-black text-xl text-amber-400 w-8 text-center tabular-nums">{{ xValue }}</span>
              </div>
              <label class="block text-sm font-bold text-slate-300 mb-2">Jouw Output y:</label>
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isChecked && isCorrect"
                class="w-full font-bold text-2xl p-3 border-2 border-slate-500 bg-slate-900 text-white rounded-lg text-center tabular-nums" />
            </div>
            <div v-if="showWhy" class="bg-indigo-900/50 rounded-xl p-4 border border-indigo-700 animate-fadeIn">
              <h4 class="font-bold text-indigo-300 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(l, i) in whyText" :key="i" class="text-xs text-indigo-400 mb-1">{{ l }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-900 border-t border-slate-700 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

          <div v-if="!predictionMade">
            <button @click="emit('close')" class="w-full py-3 font-bold text-slate-400 bg-slate-800 border border-slate-600 rounded-lg">Sluiten</button>
          </div>
          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-400 bg-slate-800 border border-slate-600 rounded-lg shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-400 bg-slate-800 border border-slate-600 rounded-lg shrink-0"><PhLightbulb weight="fill" /></button>
            <div v-if="showHints" class="bg-slate-700 p-2 rounded-lg text-xs text-slate-300 animate-fadeIn flex-1">{{ hintTexts[hintLevel] }}</div>
            <button v-if="!isCorrect" @click="runMachine" :disabled="userAns === null"
              class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Start Machine</button>
            <button v-else @click="handleNext" class="flex-1 py-3 font-bold text-slate-900 rounded-lg bg-emerald-400 hover:bg-emerald-300">Reflecteer <PhArrowRight weight="bold" class="inline" /></button>
          </div>

          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-300 text-sm">Reflectie</h4>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-400">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none" placeholder="Min 10 tekens..."></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-400 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-400" /> Bewijs van LPD 30/31</h4>
            <p class="text-xs text-amber-300">Formules met variabelen: getalwaarde berekenen.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 bg-slate-800 border border-amber-700 rounded-lg text-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 30/31</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
        <div class="flex flex-1 p-6 items-center justify-center relative bg-circuit-pattern">
          <div class="w-full max-w-4xl flex items-center justify-center relative min-h-[400px]">
            <div class="font-mono text-slate-500 font-bold absolute top-0 text-xl bg-slate-800 px-4 py-1 rounded-full border border-slate-700">{{ currentLevel.formula }}</div>
            <div class="flex items-center gap-2 mt-12 w-full max-w-3xl">
              <div class="flex flex-col items-center">
                <div class="w-24 h-16 bg-slate-800 border-2 border-slate-500 rounded-xl flex items-center justify-center relative z-10">
                  <span class="font-bold text-slate-400 text-sm">Input x</span>
                </div>
                <span class="font-black text-2xl text-amber-400 mt-1 tabular-nums">{{ xValue }}</span>
              </div>
              <div class="h-2 flex-1 bg-slate-600"></div>
              <div class="bg-blue-900/50 border-4 border-blue-500 p-6 rounded-xl flex flex-col items-center justify-center min-w-[100px]" :class="step === 1 ? 'scale-110' : ''">
                <span class="font-black text-3xl text-blue-400">{{ currentLevel.steps[0] }}</span>
              </div>
              <div class="h-2 flex-1 bg-slate-600"></div>
              <div class="bg-amber-900/50 border-4 border-amber-500 p-6 rounded-xl flex flex-col items-center justify-center min-w-[100px]" :class="step === 2 ? 'scale-110' : ''">
                <span class="font-black text-3xl text-amber-400">{{ currentLevel.steps[1] }}</span>
              </div>
              <div class="h-2 flex-1 bg-slate-600"></div>
              <div class="flex flex-col items-center">
                <div class="w-24 h-16 bg-slate-800 border-2 border-slate-500 rounded-xl flex items-center justify-center">
                  <span class="font-bold text-slate-400 text-sm">Output y</span>
                </div>
                <span class="font-black text-2xl text-emerald-400 mt-1 tabular-nums">{{ currentNumber }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
.bg-circuit-pattern { background-color: #0f172a; background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f59e0b; border: 4px solid white; cursor: pointer; margin-top: -10px; box-shadow: 0 4px 6px rgba(0,0,0,0.5); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #475569; border-radius: 4px; }
</style>
