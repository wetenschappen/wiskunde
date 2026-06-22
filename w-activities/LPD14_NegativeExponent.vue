<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhLightbulb, PhQuestion, PhCaretUp, PhCaretDown } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten: Negatieve Exponenten' },
  instruction: { type: String, default: 'Een negatieve exponent betekent delen in plaats van vermenigvuldigen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhMathOperations }
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
const feedback = ref({ type: 'info', text: 'Gebruik de pijltjes om de exponent in te stellen.' })
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
  { id: 'fraction', text: 'Een negatieve exponent geeft een breuk (1 / ...)' },
  { id: 'negative', text: 'Een negatieve exponent geeft een negatief getal' },
  { id: 'zero', text: 'Een negatieve exponent geeft 0' }
])
const reflectionQuestions = computed(() => [
  'Waarom wordt het getal kleiner naarmate de negatieve exponent negatiever wordt?',
  'Waarom is een negatieve exponent een breuk en geen negatief getal?',
  'Waarom kun je a^(-n) schrijven als 1 / a^n? Welke bewerking zit erachter?'
])

const levels = ref([])

function generateLevel() {
  const nl = []
  const b1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)]
  nl.push({ goalText: 'Opdracht 1: De basis', base: b1, targetExponent: -2, targetNum: 1, targetDen: Math.pow(b1, 2) })
  const b2 = [2, 3, 5, 6][Math.floor(Math.random() * 4)]
  nl.push({ goalText: 'Opdracht 2: Grotere exponent', base: b2, targetExponent: -3, targetNum: 1, targetDen: Math.pow(b2, 3) })
  const b3 = [4, 5, 7, 8, 9, 10][Math.floor(Math.random() * 4)]
  nl.push({ goalText: 'Opdracht 3: Nog een grondtal', base: b3, targetExponent: -2, targetNum: 1, targetDen: Math.pow(b3, 2) })
  return nl
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const exponent = ref(0)
const userNum = ref(null)
const userDen = ref(null)

const operationList = computed(() => {
  const ops = []; const base = currentLevelData.value?.base
  if (!base) return ops
  if (exponent.value > 0) { for (let i = 0; i < exponent.value; i++) ops.push(`× ${base}`) }
  else if (exponent.value < 0) { for (let i = 0; i < Math.abs(exponent.value); i++) ops.push(`÷ ${base}`) }
  return ops
})

const currentResultStr = computed(() => {
  const base = currentLevelData.value?.base
  if (!base) return ''
  if (exponent.value >= 0) return Math.pow(base, exponent.value).toString()
  return `1 / ${Math.pow(base, Math.abs(exponent.value))}`
})

function increaseExponent() { if (exponent.value < 3 && !isCorrect.value) exponent.value++ }
function decreaseExponent() { if (exponent.value > -3 && !isCorrect.value) exponent.value-- }

const hintTexts = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']
  return [
    `Tip 1: Zet de exponent op ${d.targetExponent} met de pijltjes en kijk wat er gebeurt.`,
    `Tip 2: Je begint met 1, en deelt ${Math.abs(d.targetExponent)} keer door ${d.base}. Wat wordt de breuk?`,
    `Tip 3: ${d.base}^(${d.targetExponent}) = 1 / ${d.base}^${Math.abs(d.targetExponent)} = 1 / ... (vul de noemer in)`
  ]
})

function detectError(num, den) {
  const d = currentLevelData.value
  if (!d) return null
  if (num === -(d.targetDen)) return 'Let op! Een negatieve exponent maakt het getal NIET negatief. Het betekent DELEN, niet "negatief maken".'
  if (num === d.base * d.targetExponent) return 'Let op! Een macht is niet grondtal × exponent. Een macht is herhaald vermenigvuldigen (of delen).'
  return null
}

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const d = currentLevelData.value
  if (userNum.value === d.targetNum && userDen.value === d.targetDen) {
    if (exponent.value === d.targetExponent) {
      isCorrect.value = true; showWhy.value = true
      feedback.value = { type: 'success', text: `Perfect! ${d.base}^(${d.targetExponent}) = ${d.targetNum}/${d.targetDen}. Negatieve exponent = breuk, niet negatief getal!` }
    } else {
      feedback.value = { type: 'error', text: 'Breuk klopt! Maar stel de exponent eerst in op ' + d.targetExponent + ' om de werking te zien.' }
    }
  } else {
    const specific = detectError(userNum.value, userDen.value)
    if (specific) feedback.value = { type: 'error', text: specific }
    else feedback.value = { type: 'error', text: `Niet juist. ${d.base}^(${d.targetExponent}) = 1 / ${d.base}^${Math.abs(d.targetExponent)}. Wat is ${Math.pow(d.base, Math.abs(d.targetExponent))}?` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Gebruik de pijltjes om de exponent in te stellen.' }
  exponent.value = 0; userNum.value = null; userDen.value = null
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
  'Een positieve exponent betekent herhaald vermenigvuldigen met het grondtal.',
  'Een negatieve exponent betekent precies het omgekeerde: herhaald DELEN door het grondtal. Vandaar de breuk 1 / a^n.'
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 2^3 = 2 × 2 × 2 = 8 (vermenigvuldigen).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 2^(-3) = 1 ÷ 2 ÷ 2 ÷ 2 = 1/8 (delen).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Dus 2^(-3) = 1 / 2^3 = 1/8.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Wat denk je dat een negatieve exponent geeft?</p>
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
            <div class="p-4 border border-amber-200 bg-amber-50 rounded-xl text-center">
              <div class="flex items-center justify-center gap-4 text-3xl font-black mb-2">
                <span>{{ currentLevelData.base }}<sup>{{ currentLevelData.targetExponent }}</sup></span>
                <span class="text-slate-400">=</span>
                <div class="flex flex-col items-center gap-1">
                  <input type="number" v-model.number="userNum" placeholder="?" :disabled="isCorrect" class="w-16 font-bold text-xl p-2 border border-amber-300 rounded-lg text-center bg-white" />
                  <div class="h-1 w-full bg-slate-700 rounded-full"></div>
                  <input type="number" v-model.number="userDen" placeholder="?" :disabled="isCorrect" class="w-16 font-bold text-xl p-2 border border-amber-300 rounded-lg text-center bg-white" />
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
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="userNum === null || userDen === null"
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 14</h4>
            <p class="text-xs text-amber-700">LPD 14: Rekenregels voor machten met negatieve exponenten.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 14</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-3xl bg-slate-800 p-8 rounded-xl shadow-md border-b-8 border-slate-900 flex flex-col items-center">
            <h3 class="text-slate-400 font-bold tracking-widest text-sm mb-8 uppercase">De Exponenten Machine</h3>
            <div class="flex items-center w-full justify-between px-8">
              <div class="w-20 h-20 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shrink-0">
                <span class="font-black text-3xl text-white">1</span>
              </div>
              <div class="h-2 flex-1 bg-slate-700 mx-2 relative flex items-center justify-center">
                <div v-if="operationList.length === 0" class="bg-slate-800 px-2 text-slate-500 font-bold text-sm">Geen Actie (= 0)</div>
                <div v-else class="flex gap-2 bg-slate-800 px-4 py-2 rounded-full border-2 border-slate-600">
                  <span v-for="(op, idx) in operationList" :key="idx" class="font-bold text-sm animate-fadeIn" :class="exponent > 0 ? 'text-emerald-400' : 'text-amber-400'">{{ op }}</span>
                </div>
              </div>
              <div class="w-24 h-24 rounded-xl bg-white border-4 border-slate-300 flex items-center justify-center shadow-md shrink-0">
                <span class="font-black text-xl tabular-nums" :key="currentResultStr">{{ currentResultStr }}</span>
              </div>
            </div>
            <div class="mt-12 bg-slate-200 p-6 rounded-xl flex items-center gap-8 shadow-inner w-full max-w-sm">
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-slate-500 uppercase mb-2">Basis</span>
                <div class="w-16 h-16 bg-white rounded-lg shadow-sm border border-slate-300 flex items-center justify-center">
                  <span class="font-black text-4xl text-slate-700">{{ currentLevelData.base }}</span>
                </div>
              </div>
              <div class="flex-1 flex flex-col items-center">
                <span class="text-xs font-bold text-slate-500 uppercase mb-2">Exponent</span>
                <div class="flex items-center bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden w-full">
                  <button @click="decreaseExponent" :disabled="isCorrect" class="p-3 hover:bg-slate-100 border-r border-slate-300"><PhCaretDown weight="bold" class="text-slate-600" /></button>
                  <div class="flex-1 text-center font-black text-2xl tabular-nums" :class="exponent < 0 ? 'text-amber-500' : (exponent > 0 ? 'text-emerald-600' : 'text-slate-700')">{{ exponent }}</div>
                  <button @click="increaseExponent" :disabled="isCorrect" class="p-3 hover:bg-slate-100 border-l border-slate-300"><PhCaretUp weight="bold" class="text-slate-600" /></button>
                </div>
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
