<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPuzzlePiece, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getalwaarde: Formules Inpluggen' },
  instruction: { type: String, default: 'Klik op een leeg vakje in de formule en kies het juiste getal uit de tekening.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhPuzzlePiece }
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
const feedback = ref({ type: 'info', text: 'Klik op een vakje en kies een getal.' })
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
  { id: 'match', text: 'Ik koppel de letters aan de juiste zijden in de tekening' },
  { id: 'formula', text: 'Ik gebruik een vaste formule zonder te kijken' },
  { id: 'trial', text: 'Ik probeer alle combinaties' }
])
const reflectionQuestions = computed(() => [
  'Waarom moet je de juiste waarde aan de juiste letter koppelen?',
  'Waarom verandert de uitkomst als je andere getallen in dezelfde formule stopt?',
  'Waarom is een formule met letters nuttiger dan een vaste berekening?'
])

const shapeConfigs = [
  { shape: 'driehoek', formula: '(b × h) / 2', label: 'Oppervlakte driehoek', slots: ['b', 'h'], hasDiv2: true, svg: 'M40,240 L360,240 L120,40' },
  { shape: 'rechthoek', formula: 'l × b', label: 'Oppervlakte rechthoek', slots: ['l', 'b'], hasDiv2: false, svg: 'M40,60 L360,60 L360,260 L40,260' },
  { shape: 'parallellogram', formula: 'b × h', label: 'Oppervlakte parallellogram', slots: ['b', 'h'], hasDiv2: false, svg: 'M40,240 L360,240 L280,60 L-40,60' }
]

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

const levels = ref([])

function generateLevel() {
  const nl = []
  for (let i = 0; i < 3; i++) {
    const cfg = shapeConfigs[i]
    let v1 = randomInt(4, 9); let v2 = randomInt(3, 7)
    if (cfg.hasDiv2 && (v1 * v2) % 2 !== 0) v2++
    const target = cfg.hasDiv2 ? (v1 * v2) / 2 : v1 * v2
    nl.push({
      shape: cfg.shape, formula: cfg.formula, label: cfg.label, slots: cfg.slots,
      values: { [cfg.slots[0]]: v1, [cfg.slots[1]]: v2 }, target,
      svg: cfg.svg, hasDiv2: cfg.hasDiv2
    })
  }
  return nl
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])
const slotData = ref({})
const activeSlot = ref(null)
const userAns = ref(null)

function selectSlot(slot) { if (!isCorrect.value) activeSlot.value = slot }
function assignValue(val) {
  const l = currentLevel.value
  if (activeSlot.value && l.slots.includes(activeSlot.value)) {
    slotData.value[activeSlot.value] = val; activeSlot.value = null
  }
}

const hintTexts = computed(() => {
  const l = currentLevel.value
  if (!l) return ['', '', '']
  return [
    `Tip 1: Kijk naar de tekening. Welk getal hoort bij ${l.slots[0]} en welk bij ${l.slots[1]}?`,
    `Tip 2: ${l.slots[0]} = ${l.values[l.slots[0]]}, ${l.slots[1]} = ${l.values[l.slots[1]]}. Gebruik deze in de formule.`,
    `Tip 3: ${l.formula.replace('b', String(l.values[l.slots[0]])).replace('h', String(l.values[l.slots[1]])).replace('l', String(l.values[l.slots[0]]))} = ... (vul het antwoord in).`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError() {
  const l = currentLevel.value
  if (!l) return null
  const b = slotData.value[l.slots[0]]; const h = slotData.value[l.slots[1]]
  if (b !== undefined && h !== undefined && userAns.value === b * h && l.hasDiv2) return 'Let op! Vergeet niet te delen door 2. De formule is (b × h) / 2, niet b × h.'
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const l = currentLevel.value
  const b = slotData.value[l.slots[0]]; const h = slotData.value[l.slots[1]]
  const specific = detectError()
  if (b === l.values[l.slots[0]] && h === l.values[l.slots[1]] && userAns.value === l.target) {
    isCorrect.value = true; showWhy.value = true
    feedback.value = { type: 'success', text: `Perfect! ${l.formula} = ${l.target}.` }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else if (b === undefined || h === undefined) feedback.value = { type: 'error', text: 'Plug eerst de getallen in de formule! Klik op een vakje en kies een getal.' }
    else if (b === l.values[l.slots[0]] && h === l.values[l.slots[1]] && userAns.value !== l.target) feedback.value = { type: 'error', text: 'De getallen kloppen, maar de berekening niet. Controleer de formule.' }
    else feedback.value = { type: 'error', text: 'Controleer welke getallen waar horen in de formule.' }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Klik op een vakje en kies een getal.' }
  slotData.value = {}; activeSlot.value = null; userAns.value = null
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
  'In een formule staat elke letter voor een meetkundige grootheid (basis, hoogte, lengte).',
  'Door de juiste waarde in te vullen voor elke letter, bereken je de gevraagde grootheid.'
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
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} — {{ currentLevel.shape }}</p>
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Driehoek: opp = (b × h) / 2. b = 6, h = 4.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> b = 6, h = 4 invullen: (6 × 4) / 2.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 24 / 2 = 12. Oppervlakte = 12.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe ga je de juiste getallen vinden?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p class="font-bold text-amber-800 text-sm">{{ currentLevel.label }}</p>
              <p class="text-xs text-slate-500 mt-1">Formule: {{ currentLevel.formula }}</p>
              <div class="flex items-center justify-center gap-4 text-2xl font-black mt-3">
                <button @click="selectSlot(currentLevel.slots[0])" :disabled="isCorrect"
                  class="min-w-[60px] h-12 bg-white rounded-lg border-2 flex items-center justify-center hover:scale-105 transition-all"
                  :class="activeSlot === currentLevel.slots[0] ? 'border-amber-500 ring-4 ring-amber-200' : (slotData[currentLevel.slots[0]] ? 'border-amber-600 text-amber-700' : 'border-slate-300 border-dashed text-slate-400')">
                  {{ slotData[currentLevel.slots[0]] !== undefined ? slotData[currentLevel.slots[0]] : `[${currentLevel.slots[0]}]` }}
                </button>
                <span class="text-xl">×</span>
                <button @click="selectSlot(currentLevel.slots[1])" :disabled="isCorrect"
                  class="min-w-[60px] h-12 bg-white rounded-lg border-2 flex items-center justify-center hover:scale-105 transition-all"
                  :class="activeSlot === currentLevel.slots[1] ? 'border-amber-500 ring-4 ring-amber-200' : (slotData[currentLevel.slots[1]] ? 'border-amber-600 text-amber-700' : 'border-slate-300 border-dashed text-slate-400')">
                  {{ slotData[currentLevel.slots[1]] !== undefined ? slotData[currentLevel.slots[1]] : `[${currentLevel.slots[1]}]` }}
                </button>
                <div v-if="currentLevel.hasDiv2" class="flex flex-col items-center">
                  <div class="h-1 w-8 bg-slate-700 rounded-full"></div>
                  <span class="text-base">2</span>
                </div>
              </div>
              <div class="flex items-center gap-2 border-t border-amber-200 pt-3 mt-3">
                <span class="font-bold text-sm">Antwoord:</span>
                <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                  class="flex-1 font-bold text-xl p-2 border-2 border-amber-300 rounded-lg text-center bg-white tabular-nums" />
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
              class="flex-1 py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Bereken</button>
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 30</h4>
            <p class="text-xs text-amber-700">LPD 30: Getalwaarde van een formule berekenen.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 30</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center">
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-4 border-slate-200 p-12">
              <svg width="400" height="300" viewBox="0 0 400 300" class="block">
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 9" :key="'vg'+i" :x1="i * 40" y1="0" :x2="i * 40" y2="300" />
                  <line v-for="i in 7" :key="'hg'+i" x1="0" :y1="i * 40" x2="400" :y2="i * 40" />
                </g>
                <polygon :points="currentLevel.svg" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="4" />
              </svg>
            </div>
            <div class="mt-6 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200">
              Klik op een vakje in de formule en kies een getal
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
