<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMountains, PhArrowClockwise, PhHandGrabbing, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Afronden: De Getallenheuvel' },
  instruction: { type: String, default: 'Zet de bal op de heuvel en laat hem rollen om te zien welk getal het dichtstbij ligt.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhMountains }
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
const feedback = ref({ type: 'info', text: 'Plaats de bal en laat hem los.' })
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
const predictionOptions = computed(() => {
  if (currentLevelData.value?.targetDecimal === 4.5) return [
    { id: 'four', text: 'De bal rolt naar 4' },
    { id: 'five', text: 'De bal rolt naar 5' },
    { id: 'mid', text: 'De bal blijft in het midden steken' }
  ]
  return [
    { id: 'lower', text: 'De bal rolt naar het laagste getal' },
    { id: 'closest', text: 'De bal rolt naar het dichtstbijzijnde getal' },
    { id: 'higher', text: 'De bal rolt naar het hoogste getal' }
  ]
})
const reflectionQuestions = computed(() => [
  'Waarom ronden we getallen af naar het dichtstbijzijnde gehele getal?',
  'Waarom hebben wiskundigen afgesproken dat .5 naar boven afrondt?',
  'Waarom is afronden nuttig in het dagelijks leven?'
])

const levels = ref([])

function generateLevel() {
  const l1 = [4.1, 4.2, 4.3, 4.4][Math.floor(Math.random() * 4)]
  const l2 = [4.6, 4.7, 4.8, 4.9][Math.floor(Math.random() * 4)]
  return [
    { goalText: 'Opdracht 1: Afronden naar beneden', targetDecimal: l1, exactAns: 4 },
    { goalText: 'Opdracht 2: Afronden naar boven', targetDecimal: l2, exactAns: 5 },
    { goalText: 'Opdracht 3: Precies op de top', targetDecimal: 4.5, exactAns: 5 }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const decimalValue = ref(4.0)
const isDropped = ref(false)
const userAns = ref(null)

const finalValue = computed(() => {
  if (!isDropped.value) return decimalValue.value
  if (decimalValue.value < 4.5) return 4.0
  return 5.0
})

const hintTexts = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']
  return [
    `Tip 1: Zet de slider op ${d.targetDecimal} en klik op "Laat Los". Bekijk naar welk dal de bal rolt.`,
    `Tip 2: De bal rolt altijd naar het dichtstbijzijnde dal. Lig je dichter bij 4 of bij 5?`,
    d.targetDecimal === 4.5
      ? 'Tip 3: 4.5 ligt precies in het midden. Wiskundigen hebben afgesproken: rond af naar ... (vul 4 of 5 in).'
      : `Tip 3: ${d.targetDecimal} ligt het dichtst bij ... (vul 4 of 5 in). Dat is het antwoord.`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function dropBall() { isDropped.value = true }

function detectError(val, dec) {
  const d = currentLevelData.value
  if (!d) return null
  if (val === 4 && dec === 4.6) return 'Let op! 4.6 ligt dichter bij 5 dan bij 4. Het verschil met 5 is maar 0.4, met 4 is het 0.6.'
  if (val === 5 && d.targetDecimal === 4.1) return 'Let op! 4.1 ligt dichter bij 4 dan bij 5. Het verschil met 4 is maar 0.1.'
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const d = currentLevelData.value
  const specific = detectError(userAns.value, decimalValue.value)
  if (userAns.value === d.exactAns) {
    if (isDropped.value && decimalValue.value === d.targetDecimal) {
      isCorrect.value = true; showWhy.value = true
      feedback.value = { type: 'success', text: d.targetDecimal === 4.5 ? `Correct! Omdat 4.5 exact in het midden ligt, ronden we naar boven af (5).` : `Perfect! ${d.targetDecimal} ligt het dichtst bij ${d.exactAns}.` }
    } else {
      feedback.value = { type: 'error', text: `Antwoord klopt! Maar zet de slider eerst op ${d.targetDecimal} en laat de bal rollen om het te bewijzen.` }
    }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else feedback.value = { type: 'error', text: `Niet juist. Zet de bal op ${d.targetDecimal} en kijk naar welk dal hij rolt.` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Plaats de bal en laat hem los.' }
  decimalValue.value = 4.0; isDropped.value = false; userAns.value = null
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
  'Afronden is een manier om een getal te vervangen door een eenvoudiger getal dat er dichtbij ligt.',
  'Bij .5 is de afstand naar beide kanten even groot; wiskundigen hebben afgesproken om dan naar boven af te ronden.'
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 4.3 ligt tussen 4 en 5 op de getallenheuvel.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Afstand tot 4: 0.3. Afstand tot 5: 0.7.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 4.3 ligt DICHTER bij 4. We ronden af naar 4.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Wat gebeurt er met de bal op de heuvel?</p>
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
              <label class="text-sm font-bold text-amber-700 mb-2 block">Jouw afronding:</label>
              <div class="flex items-center gap-4 text-2xl font-black justify-center">
                <span class="bg-white p-2 rounded-lg border border-slate-300 tabular-nums">{{ currentLevelData.targetDecimal }}</span>
                <span class="text-slate-400">≈</span>
                <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                  class="w-20 font-bold text-2xl p-2 border-2 border-amber-400 rounded-lg text-center bg-white tabular-nums" />
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 17</h4>
            <p class="text-xs text-amber-700">LPD 17: Afronden van getallen (decimale getallen naar gehele getallen).</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 17</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-3xl flex flex-col items-center">
            <div class="mb-12 w-full max-w-md bg-white p-4 rounded-xl border border-slate-200">
              <div class="flex justify-between items-end mb-2">
                <label class="font-bold text-slate-500 uppercase text-xs">Plaats de Bal</label>
                <span class="font-black text-xl text-red-600 tabular-nums">{{ decimalValue.toFixed(1) }}</span>
              </div>
              <input type="range" min="4.0" max="5.0" step="0.1" v-model.number="decimalValue" :disabled="isCorrect || isDropped"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
              <button @click="dropBall" :disabled="isDropped || decimalValue !== currentLevelData.targetDecimal"
                class="mt-4 w-full py-2 bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700 disabled:opacity-50 text-sm">
                <PhHandGrabbing weight="fill" /> Laat Los
              </button>
            </div>
            <div class="relative w-full h-[300px] flex items-end justify-center">
              <svg width="600" height="200" viewBox="0 0 600 200" class="absolute bottom-0 z-0">
                <path d="M 0 200 L 50 200 C 150 200 200 50 300 50 C 400 50 450 200 550 200 L 600 200 Z" fill="#94a3b8" stroke="#475569" stroke-width="4" />
                <line x1="50" y1="200" x2="50" y2="180" stroke="white" stroke-width="2" />
                <text x="50" y="170" text-anchor="middle" font-weight="900" font-size="20" fill="white">4</text>
                <line x1="300" y1="50" x2="300" y2="70" stroke="white" stroke-width="2" />
                <text x="300" y="92" text-anchor="middle" font-weight="900" font-size="16" fill="white">4.5</text>
                <line x1="550" y1="200" x2="550" y2="180" stroke="white" stroke-width="2" />
                <text x="550" y="170" text-anchor="middle" font-weight="900" font-size="20" fill="white">5</text>
              </svg>
              <div class="absolute w-10 h-10 bg-red-500 rounded-full shadow-md border-2 border-white z-10 flex items-center justify-center font-bold text-white text-xs tabular-nums"
                :style="{ left: `calc(50% - 300px + 50px + ${(finalValue - 4.0) * 500}px - 20px)`, bottom: `${finalValue <= 4.5 ? Math.pow((finalValue - 4.0)/0.5, 1.5) * 150 : Math.pow((5.0 - finalValue)/0.5, 1.5) * 150}px` }">
                {{ decimalValue.toFixed(1) }}
              </div>
              <div v-if="isDropped && decimalValue === 4.5" class="absolute top-[10%] left-1/2 -translate-x-1/2 text-sky-500 font-bold flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border border-sky-200 text-sm">
                Wiskunde-wind! <PhArrowRight weight="bold" class="w-4 h-4" />
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #ef4444; border: 4px solid white; cursor: pointer; margin-top: -11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #cbd5e1; }
</style>
