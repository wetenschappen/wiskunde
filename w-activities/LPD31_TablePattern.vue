<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhPlus, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Patronen: De Groeiende Tafels' },
  instruction: { type: String, default: 'Voeg tafels toe en ontdek het patroon.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhTable }
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
const feedback = ref({ type: 'info', text: 'Klik op "Voeg Tafel Toe" om het patroon te ontdekken.' })
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
  { id: 'linear', text: 'Het aantal stoelen groeit met een vast getal per tafel' },
  { id: 'double', text: 'Het aantal stoelen verdubbelt elke keer' },
  { id: 'random2', text: 'Het aantal stoelen volgt geen patroon' }
])
const reflectionQuestions = computed(() => [
  'Waarom kun je het aantal stoelen voorspellen met een lineaire formule S = mt + b?',
  'Waarom is m (de helling) gelijk aan de toename per tafel?',
  'Waarom is b (het startgetal) niet altijd 0? Wat stelt het voor?'
])

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (m, M) => Math.floor(Math.random() * (M - m + 1)) + m
  const configs = levelIndex === 0
    ? [{n:'Tafels in een rij',m:2,b:2},{n:'Tafels met banken',m:3,b:1},{n:'Rechte opstelling',m:4,b:0},{n:'Alternatieve rij',m:3,b:2}]
    : levelIndex === 1
    ? [{n:'Brede tafels',m:4,b:2},{n:'Lange banken',m:5,b:1},{n:'Smalle tafels',m:3,b:3}]
    : [{n:'Grote zaal',m:6,b:2},{n:'Feesttafels',m:5,b:3},{n:'Compact',m:4,b:4}]
  const cfg = configs[rng(0, configs.length - 1)]
  return { name: cfg.n, multTarget: cfg.m, addTarget: cfg.b, chairsFn: (t) => cfg.m * t + cfg.b, maxT: 5 }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const tables = ref(1)
const multValue = ref(null)
const addValue = ref(null)
const chairs = computed(() => currentLevel.value ? currentLevel.value.chairsFn(tables.value) : 0)

function addTable() { if (tables.value < currentLevel.value.maxT && !isCorrect.value) tables.value++ }

const hintTexts = computed(() => {
  const l = currentLevel.value
  if (!l) return ['', '', '']
  return [
    `Tip 1: Vergelijk ${l.chairsFn(1)} stoelen bij 1 tafel met ${l.chairsFn(2)} stoelen bij 2 tafels. Hoeveel komen erbij?`,
    `Tip 2: De toename per tafel is ${l.chairsFn(2) - l.chairsFn(1)}. Dat is m in S = mt + b. b is het aantal bij 0 tafels.`,
    `Tip 3: m = ${l.multTarget}. b = ... (vul in). De formule is S = ${l.multTarget}t + ?.`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError(m, b) {
  const l = currentLevel.value
  if (!l) return null
  if (m !== null && b !== null && m + b === l.chairsFn(1) && m !== l.multTarget) return 'Let op! Je formule klopt voor 1 tafel, maar niet voor 2. Controleer de toename tussen 1 en 2 tafels.'
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const l = currentLevel.value
  const specific = detectError(multValue.value, addValue.value)
  if (multValue.value === l.multTarget && addValue.value === l.addTarget) {
    if (tables.value > 1) {
      isCorrect.value = true; showWhy.value = true
      feedback.value = { type: 'success', text: `Perfect! ${l.name}: S = ${l.multTarget}t + ${l.addTarget === 0 ? '0' : l.addTarget}.` }
    } else {
      feedback.value = { type: 'error', text: 'Formule klopt! Maar voeg eerst tafels toe om het patroon te zien.' }
    }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else feedback.value = { type: 'error', text: `Kijk naar de reeks: ${l.chairsFn(1)} → ${l.chairsFn(2)} → ${l.chairsFn(3)}. Hoeveel komen erbij per tafel?` }
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Klik op "Voeg Tafel Toe".' }
  tables.value = 1; multValue.value = null; addValue.value = null
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
  'Lineaire patronen hebben een vaste toename per stap. Die toename is de helling m.',
  'Het startgetal b is het aantal bij 0 stappen — dat is de waarde voordat je begint te tellen.'
])

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
    nextTick(() => mainArea.value?.focus()); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { shouldPulse.value = false }
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} — {{ currentLevel.name }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <details class="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <summary class="font-bold text-amber-800 cursor-pointer text-sm">Voorbeeld — Stap voor Stap</summary>
            <div class="mt-3 text-sm space-y-2">
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 1 tafel = 4 stoelen. 2 tafels = 6 stoelen. 3 tafels = 8 stoelen.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Toename per tafel: +2. Dus m = 2.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Bij 0 tafels: 4 - 2 = 2 stoelen. Dus b = 2. Formule: S = 2t + 2.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Wat voor patroon verwacht je?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center">
              <p class="font-bold text-amber-800 text-sm mb-3">{{ currentLevel.name }}</p>
              <div class="flex items-center justify-center gap-3 text-2xl font-black">
                <span>S = </span>
                <input type="number" v-model.number="multValue" placeholder="?" :disabled="isCorrect"
                  class="w-16 font-bold text-xl p-2 border-2 border-amber-300 rounded-lg text-center bg-white tabular-nums" />
                <span> t + </span>
                <input type="number" v-model.number="addValue" placeholder="?" :disabled="isCorrect"
                  class="w-16 font-bold text-xl p-2 border-2 border-amber-300 rounded-lg text-center bg-white tabular-nums" />
              </div>
              <p class="text-xs text-slate-400 mt-2 italic">(t = aantal tafels)</p>
            </div>
            <div v-if="showWhy" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 animate-fadeIn">
              <h4 class="font-bold text-indigo-800 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(l, i) in whyText" :key="i" class="text-xs text-indigo-700 mb-1">{{ l }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-100': feedback.type === 'success', 'bg-red-100': feedback.type === 'error', 'bg-blue-100': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

          <div v-if="!predictionMade">
            <button @click="emit('close')" class="w-full py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-lg">Sluiten</button>
          </div>
          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg shrink-0"><PhLightbulb weight="fill" /></button>
            <div v-if="showHints" class="bg-amber-100 p-2 rounded-lg text-xs text-amber-800 animate-fadeIn flex-1">{{ hintTexts[hintLevel] }}</div>
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="multValue === null || addValue === null"
              class="flex-1 py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Controleer</button>
            <button v-else @click="handleNext" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500">Reflecteer <PhArrowRight weight="bold" class="inline" /></button>
          </div>

          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-800 text-sm">Reflectie</h4>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-700">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 border border-indigo-200 rounded-lg bg-white resize-none" placeholder="Min 10 tekens..."></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 31</h4>
            <p class="text-xs text-amber-700">LPD 31: Patronen herkennen en beschrijven met formules.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 31</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex flex-col items-center">
            <button @click="addTable" :disabled="isCorrect || tables >= currentLevel.maxT"
              class="mb-6 px-6 py-3 font-bold bg-slate-800 text-white rounded-xl flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50">
              <PhPlus weight="bold" class="w-6 h-6" /> Voeg Tafel Toe
            </button>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-12 min-h-[280px] flex items-center justify-center w-full max-w-3xl">
              <div class="flex relative items-center justify-center transition-all duration-500" :style="{ width: `${tables * 100}px` }">
                <div v-for="t in tables" :key="'t'+t" class="relative w-[100px] h-[100px] bg-amber-400 border-x border-amber-500 flex shrink-0 animate-fadeIn">
                  <div class="w-12 h-6 bg-amber-300 border-2 border-amber-500 rounded-t-full absolute -top-8 left-1/2 -translate-x-1/2"></div>
                  <div class="w-12 h-6 bg-amber-300 border-2 border-amber-500 rounded-b-full absolute -bottom-8 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
            </div>
            <div class="mt-4 bg-white p-4 rounded-xl border border-slate-200 flex gap-8">
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-slate-400 uppercase">Tafels (t)</span>
                <span class="font-black text-2xl text-amber-500 tabular-nums">{{ tables }}</span>
              </div>
              <div class="w-px bg-slate-200"></div>
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-slate-400 uppercase">Stoelen (S)</span>
                <span class="font-black text-2xl text-blue-600 tabular-nums" :key="chairs">{{ chairs }}</span>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
