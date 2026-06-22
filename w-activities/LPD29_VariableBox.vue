<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTextAa, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Variabelen' },
  instruction: { type: String, default: 'Beweeg de slider en bereken de omtrek voor de opgegeven waarde.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhTextAa }
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
const feedback = ref({ type: 'info', text: 'Beweeg de slider en bereken de omtrek.' })
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
  { id: 'multiply', text: 'Ik vermenigvuldig de variabele met het aantal zijden' },
  { id: 'add', text: 'Ik tel de zijden bij elkaar op' },
  { id: 'guess2', text: 'Ik raad het antwoord' }
])
const reflectionQuestions = computed(() => [
  'Waarom kun je een formule met letters gebruiken voor elke mogelijke waarde?',
  'Waarom verandert de formule niet, terwijl de uitkomst wel verandert?',
  'Waarom is het handig om een variabele te gebruiken in plaats van een concreet getal?'
])

const levels = ref([])

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

function generateLevel() {
  const nl = []
  let z1 = randomInt(4, 9)
  nl.push({ figure: 'vierkant', formula: '4 × z', label: 'Omtrek vierkant', varName: 'z', calc: (v) => 4 * v, targetVar: z1, targetAns: 4 * z1 })
  let b2 = randomInt(5, 10); let h2 = randomInt(3, 6)
  nl.push({ figure: 'rechthoek', formula: '2 × (b + h)', label: 'Omtrek rechthoek', varName: 'b', varName2: 'h', fixedVal: h2, calc: (v) => 2 * (v + h2), targetVar: b2, targetAns: 2 * (b2 + h2) })
  let z3 = randomInt(8, 14)
  nl.push({ figure: 'driehoek', formula: 'z + z + z', label: 'Omtrek driehoek', varName: 'z', calc: (v) => 3 * v, targetVar: z3, targetAns: 3 * z3 })
  return nl
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])
const sliderVal = ref(5)
const userAns = ref(null)
const computedValue = computed(() => currentLevel.value ? currentLevel.value.calc(sliderVal.value) : 0)

const hintTexts = computed(() => {
  const t = currentLevel.value
  if (!t) return ['', '', '']
  return [
    `Tip 1: De formule is ${t.formula}. Vervang de letter door het getal.`,
    `Tip 2: Vul ${t.targetVar} in voor ${t.varName}${t.varName2 ? ` en ${t.fixedVal} voor ${t.varName2}` : ''}. Wat wordt de omtrek?`,
    `Tip 3: ${t.formula.replace('z', String(t.targetVar)).replace('b', String(t.targetVar)).replace('h', String(t.fixedVal))} = ... (vul het antwoord in).`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError(val) {
  const t = currentLevel.value
  if (!t) return null
  if (t.figure === 'vierkant' && val === t.targetVar * t.targetVar) return 'Let op! Dat is de OPPERVLAKTE (z × z). De omtrek is de som van de zijden (4 × z).'
  if (t.figure === 'rechthoek' && val === t.targetVar + t.fixedVal) return 'Let op! Je hebt alleen b + h gedaan. Vergeet niet te verdubbelen: 2 × (b + h).'
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const t = currentLevel.value
  const specific = detectError(userAns.value)
  if (userAns.value === t.targetAns) {
    isCorrect.value = true; showWhy.value = true
    feedback.value = { type: 'success', text: `Perfect! ${t.formula.replace('z', String(t.targetVar)).replace('b', String(t.targetVar)).replace('h', String(t.fixedVal))} = ${t.targetAns}.` }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else feedback.value = { type: 'error', text: `Niet juist. ${t.formula}. Vervang de letter(s) door de getallen.` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Beweeg de slider en bereken de omtrek.' }
  sliderVal.value = 5; userAns.value = null
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
  'Een variabele is een letter die een getal voorstelt dat kan veranderen.',
  'Door de variabele in te vullen in de formule, krijg je de uitkomst voor die specifieke waarde.'
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
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} — {{ currentLevel.figure }}</p>
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Vierkant met z = 5. Omtrek = 4 × z = 4 × 5.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 4 × 5 = 20. De omtrek is 20.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe bereken je de omtrek?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig Voorspelling</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center">
              <p class="text-sm text-slate-600">Als <strong class="text-amber-700">{{ currentLevel.varName }} = {{ currentLevel.targetVar }}</strong><span v-if="currentLevel.varName2"> en <strong class="text-amber-700">{{ currentLevel.varName2 }} = {{ currentLevel.fixedVal }}</strong></span></p>
              <p class="text-lg font-bold text-amber-800">{{ currentLevel.label }}</p>
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                class="w-full font-bold text-2xl p-3 border-2 border-amber-300 rounded-lg text-center bg-white tabular-nums mt-2" />
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
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="userAns === null"
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 29</h4>
            <p class="text-xs text-amber-700">LPD 29: Rekenen met variabelen en formules.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 29</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex flex-col items-center">
            <div class="mb-6 w-full max-w-md bg-white p-4 rounded-xl border border-slate-200">
              <div class="flex justify-between items-end mb-2">
                <label class="font-bold text-slate-500 uppercase text-xs">{{ currentLevel.varName }}</label>
                <span class="font-black text-xl text-amber-600 tabular-nums">{{ sliderVal }}</span>
              </div>
              <input type="range" min="1" max="12" step="1" v-model.number="sliderVal" :disabled="isCorrect"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              <div class="text-right text-xs text-slate-400 mt-1">{{ currentLevel.formula }} = <span class="font-bold tabular-nums">{{ computedValue }}</span></div>
            </div>
            <div class="relative bg-white shadow-md rounded-xl border-4 border-slate-200 p-8 flex items-center justify-center overflow-hidden" style="width: 500px; height: 500px;">
              <svg width="400" height="400" viewBox="0 0 400 400" class="block">
                <g v-if="currentInternalLevel === 0">
                  <rect :x="200 - (sliderVal * 12)" :y="200 - (sliderVal * 12)" :width="sliderVal * 24" :height="sliderVal * 24"
                    fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="4" />
                  <text :x="200" :y="200 - (sliderVal * 12) - 15" font-weight="bold" fill="#b45309" font-size="16" text-anchor="middle">z</text>
                  <text :x="200" :y="200 + (sliderVal * 12) + 25" font-weight="bold" fill="#b45309" font-size="16" text-anchor="middle">z</text>
                </g>
                <g v-if="currentInternalLevel === 1">
                  <rect x="40" y="200 - (sliderVal * 8)" :width="sliderVal * 16" :height="sliderVal * 16"
                    fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="4" />
                  <text x="40" y="200 - (sliderVal * 8) - 15" font-weight="bold" fill="#1d4ed8" font-size="16" text-anchor="start">b = {{ sliderVal }}</text>
                  <text x="180" y="250" font-weight="bold" fill="#1d4ed8" font-size="16" text-anchor="middle">h = {{ currentLevel.fixedVal }}</text>
                </g>
                <g v-if="currentInternalLevel === 2">
                  <polygon :points="`40,340 360,340 200,${340 - Math.min(sliderVal * 10, 280)}`" fill="rgba(217, 70, 239, 0.15)" stroke="#d946ef" stroke-width="4" />
                  <text x="200" y="365" font-weight="bold" fill="#a21caf" font-size="16" text-anchor="middle">z = {{ sliderVal }}</text>
                </g>
              </svg>
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f59e0b; border: 4px solid white; cursor: pointer; margin-top: -13px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; }
</style>
