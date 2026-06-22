<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour,
  PhArrowClockwise, PhLightbulb, PhQuestion, PhArrowsLeftRight
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Heuristieken: De Boer en de Rivier' },
  instruction: { type: String, default: 'Schuif het hek om de maximale oppervlakte te vinden!' },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhSquaresFour }
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
const feedback = ref({ type: 'info', text: 'Beweeg de slider om te testen.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswers = ref(['', '', ''])
const showLPD = ref(false)
const lpdAnswer = ref('')
const lpdDone = ref(false)

// Prediction
const predictionMade = ref(false)
const predictionChoice = ref(null)
const predictionOptions = computed(() => {
  if (currentInternalLevel.value === 0) return [
    { id: 'guess', text: 'Ik gok de maximale oppervlakte' },
    { id: 'slide', text: 'Ik schuif de slider heen en weer tot ik het maximum zie' },
    { id: 'formula', text: 'Ik bereken het exacte maximum met een formule' }
  ]
  if (currentInternalLevel.value === 1) return [
    { id: 'double', text: 'Het maximum wordt ongeveer het dubbele' },
    { id: 'same', text: 'Het maximum blijft ongeveer hetzelfde' },
    { id: 'quadruple', text: 'Het maximum wordt vier keer zo groot' }
  ]
  return [
    { id: 'smaller', text: 'Zonder rivier wordt het maximum kleiner' },
    { id: 'bigger', text: 'Zonder rivier wordt het maximum groter' },
    { id: 'same2', text: 'Het maakt niet uit of er een rivier is' }
  ]
})

const reflectionQuestions = computed(() => [
  'Waarom is de maximale oppervlakte niet gewoon de grootste breedte keer de grootste lengte?',
  'Waarom verandert de optimale breedte als de totale hoeveelheid hek verandert?',
  'Waarom is het maximum zonder rivier kleiner dan met rivier bij dezelfde hoeveelheid hek?'
])

function generateLevel(index) {
  let totalFence, hasRiver, maxArea, minX, maxX
  switch (index) {
    case 0:
      totalFence = Math.floor(Math.random() * 7) * 2 + 16
      hasRiver = true
      maxArea = Math.round(totalFence * totalFence / 8)
      minX = 1; maxX = Math.floor(totalFence / 2) - 1
      break
    case 1:
      totalFence = Math.floor(Math.random() * 9) * 4 + 32
      hasRiver = true
      maxArea = Math.round(totalFence * totalFence / 8)
      minX = 1; maxX = Math.floor(totalFence / 2) - 1
      break
    case 2:
      totalFence = Math.floor(Math.random() * 5) * 4 + 24
      hasRiver = false
      maxArea = Math.round(totalFence * totalFence / 16)
      minX = 1; maxX = Math.floor(totalFence / 2) - 1
      break
  }
  return {
    goalText: `Opdracht ${index + 1}: ${hasRiver ? 'Tegen de rivier' : 'In het open veld'} — ${totalFence}m hek. Wat is de MAXIMALE oppervlakte?`,
    totalFence, hasRiver, maxArea, minX, maxX,
    maxX_opt: Math.round(totalFence / (hasRiver ? 4 : 4))
  }
}

const levels = ref([generateLevel(0), generateLevel(1), generateLevel(2)])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const widthX = ref(2)
const userMaxArea = ref(null)
const lengthY = computed(() => {
  const d = currentLevelData.value
  return d.hasRiver ? d.totalFence - (2 * widthX.value) : (d.totalFence - (2 * widthX.value)) / 2
})
const currentArea = computed(() => widthX.value * lengthY.value)

const hintTexts = computed(() => {
  const d = currentLevelData.value
  return [
    `Tip 1: Beweeg de slider langzaam en kijk naar de oppervlakte. Zoek de hoogste waarde.`,
    `Tip 2: Het maximum zit ongeveer bij x = ${d.maxX_opt}. Probeer in de buurt van deze waarde.`,
    `Tip 3: Bij x = ${d.maxX_opt} is de oppervlakte ... (vul de ontbrekende waarde in). De formule is: opp = x × (${d.totalFence} - 2x)${d.hasRiver ? '' : '/2'}.`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() {
  if (predictionChoice.value) predictionMade.value = true
}

function resetPrediction() {
  predictionMade.value = false; predictionChoice.value = null
}

function detectError(val) {
  if (val === currentArea.value && currentArea.value !== currentLevelData.value.maxArea) {
    return 'Let op! Je hebt de oppervlakte bij de huidige breedte ingevuld, maar dat is niet het MAXIMUM. Blijf de slider verplaatsen tot je de hoogste waarde vindt.'
  }
  if (currentLevelData.value.hasRiver && val === currentLevelData.value.totalFence) {
    return 'Let op! De maximale oppervlakte is niet hetzelfde als de totale hoeveelheid hek. Zoek naar de grootste oppervlakte in m^2.'
  }
  return null
}

function checkAnswer() {
  isChecked.value = true
  attemptCount.value++
  const d = currentLevelData.value
  const specificError = detectError(userMaxArea.value)
  if (userMaxArea.value === d.maxArea) {
    isCorrect.value = true
    attemptCount.value = 0
    showWhy.value = true
    feedback.value = { type: 'success', text: `Prima! Je vond het maximum ${d.maxArea} m^2 door systematisch te proberen (heuristiek).` }
  } else {
    isCorrect.value = false
    if (specificError) feedback.value = { type: 'error', text: specificError }
    else if (userMaxArea.value === null || userMaxArea.value === undefined) feedback.value = { type: 'error', text: 'Vul eerst een getal in.' }
    else feedback.value = { type: 'error', text: `Niet correct. Probeer de slider te verplaatsen en vind de hoogste waarde. Het maximum zit rond x = ${d.maxX_opt}.` }
  }
}

function resetActivityState() {
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Beweeg de slider en vul de maximale oppervlakte in.' }
  widthX.value = 2; userMaxArea.value = null
  const d = currentLevelData.value
  widthX.value = Math.min(d.minX + 1, d.maxX - 1)
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
}

function handleNext() {
  if (isCorrect.value && !showReflection.value) {
    showReflection.value = true
  } else if (showReflection.value && allReflectionsDone.value) {
    submitReflection()
  }
}

const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false
    reflectionAnswers.value = ['', '', '']
    if (currentInternalLevel.value < totalInternalLevels - 1) {
      currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus())
    } else {
      showLPD.value = true
    }
  }
}

function submitLPD() {
  if (lpdAnswer.value.length >= 20) { lpdDone.value = true; emit('complete') }
}

const whyText = computed(() => [
  'Een rechthoekige omheining heeft een oppervlakte die eerst stijgt en dan daalt naarmate de breedte toeneemt.',
  'Het maximum vind je door de afgeleide nul te stellen of door systematisch te proberen — dat heet een heuristische methode.'
])

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
    nextTick(() => mainArea.value?.focus())
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Stel: 20m hek tegen de rivier. Formule: opp = x (20 - 2x).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Probeer x = 4: opp = 4 x 12 = 48 m^2.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Probeer x = 5: opp = 5 x 10 = 50 m^2. Dat is al beter!</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Probeer x = 6: opp = 6 x 8 = 48 m^2. Daalt terug. Maximum = 50 m^2.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe ga je de maximale oppervlakte vinden?</p>
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

            <div class="p-4 border border-amber-200 bg-white rounded-xl">
              <label class="block text-sm font-bold text-amber-800 mb-2">Maximale oppervlakte:</label>
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="userMaxArea" placeholder="..." :disabled="isCorrect"
                  class="w-full font-bold text-2xl p-4 border-2 border-amber-300 rounded-lg focus:border-amber-500 text-center tabular-nums" />
                <span class="font-black text-xl text-slate-500">m²</span>
              </div>
            </div>

            <div v-if="showWhy" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 animate-fadeIn">
              <h4 class="font-bold text-indigo-800 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(line, i) in whyText" :key="i" class="text-xs text-indigo-700 mb-1">{{ line }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

          <div v-if="!predictionMade" class="flex gap-3">
            <button @click="emit('close')" class="flex-1 py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-lg">Sluiten</button>
          </div>

          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg shrink-0"><PhLightbulb weight="fill" /></button>
            <div v-if="showHints" class="bg-amber-100 p-2 rounded-lg text-xs text-amber-800 animate-fadeIn">{{ hintTexts[hintLevel] }}</div>
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="userMaxArea === null"
              class="flex-1 py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Controleer Maximum</button>
            <button v-else @click="handleNext" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500">Reflecteer <PhArrowRight weight="bold" class="inline" /></button>
          </div>

          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-800 text-sm">Reflectie</h4>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-700">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 border border-indigo-200 rounded-lg bg-white resize-none" placeholder="Typ je antwoord (min 10 tekens)..."></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 2</h4>
            <p class="text-xs text-amber-700">LPD 2: Problemen oplossen via heuristieken (systematisch proberen).</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt (min 20 tekens)..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 2</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex items-center justify-center gap-12">
            <div class="flex flex-col items-center w-full max-w-lg">
              <div class="mb-4 w-full bg-white p-4 rounded-xl border border-slate-200">
                <div class="flex justify-between items-end mb-2">
                  <label class="font-bold text-slate-500 uppercase text-xs"><PhArrowsLeftRight weight="bold" /> Breedte (x)</label>
                  <span class="font-black text-xl text-amber-600 tabular-nums">{{ widthX }} m</span>
                </div>
                <input type="range" :min="currentLevelData.minX" :max="currentLevelData.maxX" step="1" v-model.number="widthX" :disabled="isCorrect"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              </div>
              <div class="relative bg-[#f8fafc] shadow-md rounded-xl overflow-hidden border-4 border-slate-800 w-[500px] h-[400px] flex items-end justify-center">
                <div v-if="currentLevelData.hasRiver" class="absolute top-0 inset-x-0 h-16 bg-blue-400 opacity-80 flex items-center justify-center z-0">
                  <span class="font-black text-blue-900/30 uppercase tracking-[0.5em] text-3xl">Rivier</span>
                </div>
                <div class="absolute bg-emerald-400/30 transition-all duration-300 flex items-center justify-center z-10"
                  :class="currentLevelData.hasRiver ? 'border-b-4 border-x-4 border-slate-800' : 'border-4 border-slate-800 rounded-lg'"
                  :style="{ top: currentLevelData.hasRiver ? '64px' : '50%', transform: currentLevelData.hasRiver ? 'none' : 'translate(-50%, -50%)', left: currentLevelData.hasRiver ? 'auto' : '50%', width: `${lengthY * 12}px`, height: `${widthX * 12}px` }">
                  <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-300 flex flex-col items-center"
                    :class="currentArea === currentLevelData.maxArea ? 'border-amber-500 scale-110' : ''">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Oppervlakte</span>
                    <span class="font-black text-3xl tabular-nums" :class="currentArea === currentLevelData.maxArea ? 'text-amber-600' : 'text-slate-700'">{{ currentArea }} m²</span>
                  </div>
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f59e0b; border: 4px solid white; cursor: pointer; margin-top: -10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #cbd5e1; border-radius: 4px; }
</style>
