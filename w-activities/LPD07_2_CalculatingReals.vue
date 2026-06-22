<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCalculator, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Wortel-Kraker (Vereenvoudigen)' },
  instruction: { type: String, default: 'Vereenvoudig de vierkantswortel door hem op te splitsen. Zoek het GROOTSTE kwadraat dat een deler is.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCalculator }
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
const feedback = ref({ type: 'info', text: 'Typ de twee factoren in.' })
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
  { id: 'factor', text: 'Ik splits het getal in een kwadraat x rest' },
  { id: 'guess', text: 'Ik probeer willekeurige getallen' },
  { id: 'calculator', text: 'Ik gebruik een rekenmachine om de delers te vinden' }
])
const reflectionQuestions = computed(() => [
  'Waarom moet je het GROOTSTE kwadraat kiezen en niet zomaar een kwadraat?',
  'Waarom kun je een wortel niet vereenvoudigen als het getal onder de wortel een priemgetal is?',
  'Waarom is √(a × b) = √a × √b? Welke eigenschap van wortels gebruik je?'
])

const inputSquare = ref(null)
const inputRemainder = ref(null)
const step = ref(0)

const rootPools = [
  [{target:8,square:4,remain:2,root:2},{target:12,square:4,remain:3,root:2},{target:18,square:9,remain:2,root:3},{target:20,square:4,remain:5,root:2},{target:27,square:9,remain:3,root:3},{target:28,square:4,remain:7,root:2}],
  [{target:45,square:9,remain:5,root:3},{target:48,square:16,remain:3,root:4},{target:50,square:25,remain:2,root:5},{target:54,square:9,remain:6,root:3},{target:63,square:9,remain:7,root:3},{target:75,square:25,remain:3,root:5}],
  [{target:72,square:36,remain:2,root:6},{target:80,square:16,remain:5,root:4},{target:98,square:49,remain:2,root:7},{target:99,square:9,remain:11,root:3},{target:52,square:4,remain:13,root:2},{target:68,square:4,remain:17,root:2}]
]

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function generateLevel() {
  return rootPools.map((pool, i) => {
    const p = pool[randomInt(0, pool.length - 1)]
    return { goalText: `Opdracht ${i+1}: Vereenvoudig √${p.target}.`, targetRoot: p.target, perfectSquare: p.square, remainder: p.remain, finalAns: p.label, rootSquare: p.root }
  })
}

const hintTexts = computed(() => {
  const d = currentLevelData.value
  return [
    `Tip 1: Welke kwadraten (4, 9, 16, 25...) zijn delers van ${d.targetRoot}?`,
    `Tip 2: De kwadraten die deler zijn van ${d.targetRoot} zijn: ${[4,9,16,25,36,49].filter(s => d.targetRoot % s === 0).join(', ')}. Kies de grootste.`,
    `Tip 3: ${d.targetRoot} = ${d.perfectSquare} × ${d.remainder}. Dus √${d.targetRoot} = √${d.perfectSquare} × √${d.remainder} = ... (vul de wortel van ${d.perfectSquare} in) × √${d.remainder}.`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError(sq, rem) {
  const d = currentLevelData.value
  if (sq * rem !== d.targetRoot) return `Let op! ${sq} × ${rem} = ${sq * rem}, niet ${d.targetRoot}. De factoren moeten samen ${d.targetRoot} geven.`
  if (!Number.isInteger(Math.sqrt(sq))) return `Let op! ${sq} is geen perfect kwadraat. Je kunt er niet mooi de wortel uit trekken. Probeer 4, 9, 16, 25...`
  const squares = [4, 9, 16, 25, 36, 49].filter(s => d.targetRoot % s === 0)
  if (sq !== d.perfectSquare && squares.length > 0) return `Let op! ${sq} is een kwadraat, maar er is een GROTER kwadraat dat een deler is van ${d.targetRoot}: ${squares[squares.length - 1]}.`
  return null
}

function checkAnswer() {
  isChecked.value = true
  const d = currentLevelData.value
  if (!inputSquare.value || !inputRemainder.value) {
    feedback.value = { type: 'error', text: 'Vul beide vakjes in!' }; return
  }
  const specific = detectError(inputSquare.value, inputRemainder.value)
  if (specific) { attemptCount.value++; isCorrect.value = false; feedback.value = { type: 'error', text: specific }; return }
  if (inputSquare.value === d.perfectSquare && inputRemainder.value === d.remainder) {
    isCorrect.value = true; attemptCount.value = 0; step.value = 1; showWhy.value = true
    feedback.value = { type: 'success', text: `Briljant! ${d.perfectSquare} is het grootste kwadraat. √${d.targetRoot} = ${d.rootSquare}√${d.remainder}.` }
    setTimeout(() => { if (isCorrect.value) step.value = 2 }, 1500)
  } else if (inputRemainder.value === d.perfectSquare && inputSquare.value === d.remainder) {
    attemptCount.value++; feedback.value = { type: 'error', text: `Let op! Je hebt de factoren omgewisseld. Het kwadraat (${d.perfectSquare}) hoort in het LINKER vakje.` }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: `Niet juist. ${d.targetRoot} = ? × ?. Het grootste kwadraat dat een deler is, is ${d.perfectSquare}.` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Typ de twee factoren in.' }
  inputSquare.value = null; inputRemainder.value = null; step.value = 0
}

function handleNext() {
  if (isCorrect.value && !showReflection.value) { showReflection.value = true }
  else if (showReflection.value && allReflectionsDone.value) { submitReflection() }
}

const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false; reflectionAnswers.value = ['', '', '']
    if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
    else { showLPD.value = true }
  }
}

function submitLPD() { if (lpdAnswer.value.length >= 20) { lpdDone.value = true; emit('complete') } }

const whyText = computed(() => [
  '√(a × b) = √a × √b. Dat is de hoofdeigenschap van vierkantswortels.',
  'Door het getal te splitsen in een perfect kwadraat × een rest, kun je de wortel van het kwadraat wél mooi schrijven.'
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
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> √48: zoek delers die een kwadraat zijn.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 48 = 16 × 3. 16 is een kwadraat (4^2).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> √48 = √(16 × 3) = √16 × √3 = 4√3.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Klaar! 4√3 is de vereenvoudigde vorm.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe ga je de wortel vereenvoudigen?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig Voorspelling</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p class="font-bold text-amber-800 text-sm">{{ currentLevelData.goalText }}</p>
            </div>
            <div class="p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1">
                  <label class="block text-xs font-bold text-slate-500 mb-1 text-center">Kwadraat</label>
                  <input type="number" v-model.number="inputSquare" :disabled="step > 0" class="w-full p-4 text-xl font-mono font-black text-center text-amber-600 bg-white border-2 border-amber-300 rounded-lg" placeholder="?">
                </div>
                <div class="text-slate-400 font-black text-xl mt-4">x</div>
                <div class="flex-1">
                  <label class="block text-xs font-bold text-slate-500 mb-1 text-center">Rest</label>
                  <input type="number" v-model.number="inputRemainder" :disabled="step > 0" class="w-full p-4 text-xl font-mono font-black text-center text-emerald-600 bg-white border-2 border-emerald-300 rounded-lg" placeholder="?">
                </div>
              </div>
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
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="!inputSquare || !inputRemainder"
              class="flex-1 py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Controleer</button>
            <button v-else @click="handleNext" :disabled="step < 2" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">Reflecteer <PhArrowRight weight="bold" class="inline" /></button>
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 7</h4>
            <p class="text-xs text-amber-700">LPD 7: Rekenen met reële getallen (wortelvereenvoudiging).</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 7</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex items-center justify-center gap-4">
            <div class="text-7xl font-mono font-black text-slate-700" :class="step > 0 ? 'opacity-30' : ''">√<span class="border-t-8 border-slate-700 pt-2 ml-1">{{ currentLevelData.targetRoot }}</span></div>
            <div class="text-6xl font-mono font-black text-slate-300" :class="step > 0 ? 'opacity-100' : 'opacity-0'">=</div>
            <div class="flex items-center gap-4" :class="step > 0 ? 'opacity-100' : 'opacity-0'">
              <div class="relative">
                <div class="text-6xl font-mono font-black text-amber-600" :class="step === 2 ? 'opacity-0' : ''">√<span class="border-t-[6px] border-amber-600 pt-2 ml-1">{{ inputSquare || '?' }}</span></div>
                <div class="text-7xl font-mono font-black text-amber-600 absolute top-0 left-0 z-20" :class="step === 2 ? 'opacity-100 scale-100' : 'opacity-0'">{{ currentLevelData.rootSquare }}</div>
              </div>
              <div class="text-4xl font-mono font-black text-slate-400" :class="step === 2 ? 'opacity-0 w-0 overflow-hidden' : ''">×</div>
              <div class="text-6xl font-mono font-black text-emerald-600" :class="step === 2 ? '-translate-x-8 text-7xl' : ''">√<span class="border-t-[6px] border-emerald-600 pt-2 ml-1">{{ inputRemainder || '?' }}</span></div>
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
