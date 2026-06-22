<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScissors, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Handig Rekenen: Distributiviteit' },
  instruction: { type: String, default: 'Sleep de snijlijn naar een handige plaats om de berekening te splitsen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhScissors }
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
const feedback = ref({ type: 'info', text: 'Beweeg de rode snijlijn over het rooster.' })
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
  if (currentInternalLevel.value === 0) return [
    { id: 'tens', text: 'Ik splits bij de tientallen (bv. 12 = 10 + 2)' },
    { id: 'half', text: 'Ik splits precies in twee gelijke helften' },
    { id: 'random', text: 'Ik kies een willekeurige splitsing' }
  ]
  return [
    { id: 'bigger', text: 'Ik splits bij een groter rond getal, zoals 20' },
    { id: 'exact', text: 'Ik zoek de meest handige splitsing voor hoofdrekenen' },
    { id: 'same', text: 'Ik splits weer bij de tientallen' }
  ]
})
const reflectionQuestions = computed(() => [
  'Waarom is a(b + c) = ab + ac? Wat gebeurt er met de a?',
  'Waarom is het handiger om bij een tiental te splitsen dan willekeurig?',
  'Waarom werkt distributiviteit ook met grotere getallen en breuken?'
])

const cutPosition = ref(0)
const userAns = ref(null)
const levels = ref([])

function generateLevel() {
  const nl = []
  for (let l = 0; l < 3; l++) {
    let h, tw, bc
    if (l === 0) { h = Math.floor(Math.random() * 3) + 3; tw = Math.floor(Math.random() * 6) + 10 }
    else if (l === 1) { h = Math.floor(Math.random() * 4) + 5; tw = Math.floor(Math.random() * 8) + 14 }
    else { h = Math.floor(Math.random() * 5) + 5; tw = Math.floor(Math.random() * 10) + 18 }
    bc = Math.floor(tw / 10) * 10
    if (bc === 0 || bc >= tw) bc = Math.max(5, Math.floor(tw / 5) * 5)
    nl.push({ goalText: `Opdracht ${l+1}: ${h} × ${tw} splitsen`, height: h, totalWidth: tw, bestCut: bc, exactAns: h * tw })
  }
  return nl
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const part1 = computed(() => cutPosition.value)
const part2 = computed(() => currentLevelData.value ? currentLevelData.value.totalWidth - cutPosition.value : 0)
const calculationResult = computed(() => {
  if (!currentLevelData.value) return ''
  const d = currentLevelData.value
  if (cutPosition.value === 0 || cutPosition.value === d.totalWidth) return '?'
  return `${d.height * part1.value} + ${d.height * part2.value} = ${d.height * d.totalWidth}`
})

const hintTexts = computed(() => {
  const d = currentLevelData.value
  return [
    `Tip 1: Splits ${d.totalWidth} in een tiental en een rest. Waar leg je de lijn?`,
    `Tip 2: Probeer te splitsen bij ${d.bestCut}. Dan wordt één deel een makkelijk tiental.`,
    `Tip 3: ${d.height} × ${d.bestCut} = ${d.height * d.bestCut}. Tel daar ... (bereken zelf) bij op om het totaal te krijgen.`
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
  const d = currentLevelData.value
  if (val === d.height * d.totalWidth && (cutPosition.value === 0 || cutPosition.value === d.totalWidth)) {
    return 'Let op! Het antwoord is juist, maar je hebt de snijlijn niet gebruikt. Sleep de lijn naar een handige splitsing!'
  }
  if (val && cutPosition.value > 0 && cutPosition.value < d.totalWidth && val !== d.exactAns) {
    return 'Let op! Rekenfout. Tel de twee delen correct op: ' + calculationResult.value.split('=')[0] + '.'
  }
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const d = currentLevelData.value
  const specific = detectError(userAns.value)
  if (userAns.value === d.exactAns) {
    if (cutPosition.value === d.bestCut) {
      isCorrect.value = true
      showWhy.value = true
      feedback.value = { type: 'success', text: `Perfect! Distributiviteit: ${d.height} × (${d.bestCut} + ${d.totalWidth - d.bestCut}) = (${d.height} × ${d.bestCut}) + (${d.height} × ${d.totalWidth - d.bestCut}) = ${d.exactAns}.` }
    } else {
      isCorrect.value = true
      showWhy.value = true
      feedback.value = { type: 'success', text: `Juist! Maar de handigste snede is bij ${d.bestCut} (mooi tiental).` }
    }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else feedback.value = { type: 'error', text: `Niet juist. De oppervlakte is hoogte × breedte = ${d.height} × ${d.totalWidth} = ?` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Beweeg de rode snijlijn.' }
  cutPosition.value = 0; userAns.value = null
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
  'Distributiviteit a(b + c) = ab + ac laat toe een moeilijke vermenigvuldiging op te splitsen in twee makkelijke.',
  'Door te splitsen bij een tiental wordt het hoofdrekenen veel eenvoudiger, omdat vermenigvuldigen met 10, 20, 30... makkelijk is.'
])

const svgWidth = 520; const svgHeight = 200
const unitWidth = computed(() => currentLevelData.value ? svgWidth / currentLevelData.value.totalWidth : 1)
const unitHeight = computed(() => currentLevelData.value ? svgHeight / currentLevelData.value.height : 1)

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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 7 × 13: splits 13 in 10 + 3.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 7 × 13 = 7 × (10 + 3) = (7 × 10) + (7 × 3).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 70 + 21 = 91. Makkelijk hoofdrekenen!</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe ga je de vermenigvuldiging splitsen?</p>
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
              <div class="font-mono text-xs text-slate-600 bg-white p-2 rounded-lg border" v-if="currentLevelData">
                {{ currentLevelData.height }} × ({{ part1 }} + {{ part2 }}) = ({{ currentLevelData.height }} × {{ part1 }}) + ({{ currentLevelData.height }} × {{ part2 }})
              </div>
              <div class="font-mono font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border mt-2" v-if="currentLevelData">
                {{ calculationResult }}
              </div>
              <div class="flex items-center gap-2 mt-2" v-if="currentLevelData">
                <span class="font-bold text-sm">Antwoord:</span>
                <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                  class="flex-1 font-bold text-lg p-2 border-2 border-amber-300 rounded-lg text-center tabular-nums" />
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 12</h4>
            <p class="text-xs text-amber-700">LPD 12: De distributieve eigenschap a(b + c) = ab + ac toepassen.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 12</button>
          </div>
        </div>
      </div>

      <!-- SVG Grid -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-3xl flex flex-col items-center" v-if="currentLevelData">
            <input type="range" min="0" :max="currentLevelData.totalWidth" step="1" v-model.number="cutPosition" :disabled="isCorrect"
              class="w-full max-w-[520px] mb-4 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
            <div class="relative shadow-md rounded-lg overflow-hidden border-4 border-slate-700 bg-white">
              <div class="absolute -left-8 top-1/2 -translate-y-1/2 font-black text-xl text-slate-600">{{ currentLevelData.height }}</div>
              <svg :width="svgWidth" :height="svgHeight" class="block">
                <g stroke="#cbd5e1" stroke-width="1">
                  <line v-for="i in (currentLevelData.totalWidth-1)" :key="'vx'+i" :x1="i * unitWidth" y1="0" :x2="i * unitWidth" :y2="svgHeight" />
                  <line v-for="i in (currentLevelData.height-1)" :key="'hy'+i" x1="0" :y1="i * unitHeight" :x2="svgWidth" :y2="i * unitHeight" />
                </g>
                <rect v-if="cutPosition > 0" x="0" y="0" :width="cutPosition * unitWidth" :height="svgHeight" fill="rgba(245, 158, 11, 0.2)" />
                <rect v-if="cutPosition < currentLevelData.totalWidth" :x="cutPosition * unitWidth" y="0" :width="(currentLevelData.totalWidth - cutPosition) * unitWidth" :height="svgHeight" fill="rgba(16, 185, 129, 0.2)" />
                <text v-if="cutPosition > 0" :x="(cutPosition * unitWidth) / 2" :y="svgHeight / 2 + 8" text-anchor="middle" font-weight="900" font-size="24" fill="#d97706">{{ currentLevelData.height * cutPosition }}</text>
                <text v-if="cutPosition < currentLevelData.totalWidth" :x="cutPosition * unitWidth + ((currentLevelData.totalWidth - cutPosition) * unitWidth) / 2" :y="svgHeight / 2 + 8" text-anchor="middle" font-weight="900" font-size="24" fill="#059669">{{ currentLevelData.height * (currentLevelData.totalWidth - cutPosition) }}</text>
                <line v-if="cutPosition > 0 && cutPosition < currentLevelData.totalWidth" :x1="cutPosition * unitWidth" y1="0" :x2="cutPosition * unitWidth" :y2="svgHeight" stroke="#ef4444" stroke-width="4" stroke-dasharray="8 4" />
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 32px; width: 32px; border-radius: 50%; background: #ef4444; border: 4px solid white; cursor: pointer; margin-top: -14px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #cbd5e1; }
</style>
