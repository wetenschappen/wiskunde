<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCircleDashed,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Eigenschappen van de Cirkel'
  },
  instruction: {
    type: String,
    default: 'Gebruik de eigenschap van de middelpuntshoek en omtrekshoek om de ontbrekende hoek te berekenen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCircleDashed }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// --- 3-Level structure with generateLevel() ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  let central, inscribed, unknown

  if (lvl === 0) {
    unknown = 'inscribed'
    const cVals = [60, 70, 80, 90, 100, 110, 120]
    central = cVals[randInt(0, cVals.length - 1)]
    central = Math.round(central / 10) * 10
    inscribed = central / 2
  } else if (lvl === 1) {
    unknown = 'central'
    const iVals = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
    inscribed = iVals[randInt(0, iVals.length - 1)]
    central = inscribed * 2
  } else {
    unknown = ['inscribed', 'central'][randInt(0, 1)]
    if (unknown === 'inscribed') {
      const cVals = [60, 80, 100, 120, 140, 160]
      central = cVals[randInt(0, cVals.length - 1)]
      inscribed = central / 2
    } else {
      const iVals = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
      inscribed = iVals[randInt(0, iVals.length - 1)]
      central = inscribed * 2
    }
  }

  return {
    name: lvl === 0 ? 'Omtrekshoek' : lvl === 1 ? 'Middelpuntshoek' : 'Gemengd',
    instruction: lvl === 0
      ? '<strong>Omtrekshoek berekenen</strong><br>De omtrekshoek is altijd de helft van de middelpuntshoek die op dezelfde boog staat.'
      : lvl === 1
        ? '<strong>Middelpuntshoek berekenen</strong><br>De middelpuntshoek is steeds het dubbel van de omtrekshoek op dezelfde boog.'
        : '<strong>Omtrekshoek of middelpuntshoek?</strong><br>Bepaal telkens welke hoek ontbreekt en pas de regel toe.',
    scenarios: [
      { central, inscribed, unknown }
    ]
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const currentInstruction = computed(() => currentLevel.value.instruction || props.instruction)

const currentScenarioIndex = ref(0)
const currentScenario = computed(() => currentLevel.value.scenarios[currentScenarioIndex.value])
const userAnswer = ref('')

// --- 8-element additions ---
const showPrediction = ref(true)
const predictionDone = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  showPrediction.value = false
  predictionDone.value = true
  feedback.value = { type: 'info', text: 'Bereken nu de ontbrekende hoek met de juiste formule.' }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function getHint() {
  const c = attemptCount.value
  const sc = currentScenario.value
  if (c === 1) return 'Hint: Denk aan de relatie tussen middelpuntshoek en omtrekshoek.'
  if (c === 2) {
    if (sc.unknown === 'inscribed') return 'Hint: De omtrekshoek is de helft van de middelpuntshoek. Deel ' + sc.central + ' door 2.'
    return 'Hint: De middelpuntshoek is het dubbel van de omtrekshoek. Verdubbel ' + sc.inscribed + '.'
  }
  if (sc.unknown === 'inscribed') return 'Hint: ' + sc.central + ' / 2 = ?'
  return 'Hint: ' + sc.inscribed + ' x 2 = ?'
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  userAnswer.value = ''
  currentScenarioIndex.value = 0
  showPrediction.value = true
  predictionDone.value = false
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    goToNextStep()
  }
}

function checkAnswer() {
  isChecked.value = true
  const correctVal = currentScenario.value.unknown === 'inscribed' ? currentScenario.value.inscribed : currentScenario.value.central
  const parsed = parseInt(userAnswer.value)

  if (parsed === correctVal) {
    isCorrect.value = true
    const whyText = `<br><br><strong>Waarom?</strong> Deze eigenschap volgt uit de symmetrie van de cirkel. De middelpuntshoek staat in het middelpunt van de cirkel. De omtrekshoek staat op de omtrek. Beide onderspannen dezelfde boog. De middelpuntshoek is exact het dubbel omdat de straal twee keer dezelfde hoek maakt met de koorde. Het is een fundamentele eigenschap van cirkels die vaak wordt gebruikt om hoeken te berekenen zonder de volledige figuur te moeten tekenen.`
    feedback.value = {
      type: 'success',
      text: `Helemaal juist! De omtrekshoek is altijd de helft van de middelpuntshoek die op dezelfde boog staat.` + whyText
    }
    showReflection.value = true
  } else {
    attemptCount.value++
    isCorrect.value = false
    // Error analysis: check for common mistakes
    const sc = currentScenario.value
    if (sc.unknown === 'inscribed' && parsed === sc.central) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de middelpuntshoek (${sc.central}°) ingevuld. Maar we zoeken de omtrekshoek! Die is de <strong>helft</strong> van de middelpuntshoek, niet gelijk eraan. De omtrekshoek staat op de omtrek van de cirkel, de middelpuntshoek staat in het middelpunt — ze zijn niet hetzelfde.<br><br>${getHint()}` }
    } else if (sc.unknown === 'central' && parsed === sc.inscribed) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de omtrekshoek (${sc.inscribed}°) ingevuld. Maar we zoeken de middelpuntshoek! Die is het <strong>dubbel</strong> van de omtrekshoek, niet gelijk eraan. De middelpuntshoek is steeds groter dan de omtrekshoek op dezelfde boog.<br><br>${getHint()}` }
    } else if (sc.unknown === 'inscribed' && parsed === sc.central * 2) {
      feedback.value = { type: 'error', text: `Let op! Je hebt ${sc.central}° verdubbeld. Maar de omtrekshoek is de <strong>helft</strong> van ${sc.central}°, niet het dubbel. Je hebt de verkeerde richting gekozen: deel door 2, niet vermenigvuldigen. Omtrekshoek = 1/2 x middelpuntshoek.<br><br>${getHint()}` }
    } else if (sc.unknown === 'central' && parsed === Math.floor(sc.inscribed / 2)) {
      feedback.value = { type: 'error', text: `Let op! Je hebt ${sc.inscribed}° gedeeld door 2. Maar de middelpuntshoek is het <strong>dubbel</strong> van de omtrekshoek, niet de helft. Je hebt de verkeerde richting gekozen: vermenigvuldig met 2, niet delen. Middelpuntshoek = 2 x omtrekshoek.<br><br>${getHint()}` }
    } else if (sc.unknown === 'inscribed' && parsed === 180) {
      feedback.value = { type: 'error', text: 'Let op! 180° is een gestrekte hoek, niet zomaar een omtrekshoek. De omtrekshoek op de diameter van een cirkel is 90° (Thales), niet 180°. Controleer de middelpuntshoek.' }
    } else {
      feedback.value = { type: 'error', text: 'Niet helemaal... ' + getHint() }
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1)
    } else {
        emit('complete')
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <p v-if="totalSteps > 1" class="text-xs text-slate-300">|</p>
              <p class="text-xs font-medium text-amber-600">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} &mdash; {{ currentLevel.name }}</p>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentInstruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                <span v-if="currentInternalLevel === 0">In een cirkel is de middelpuntshoek 80&deg;. Wat is de bijhorende omtrekshoek?</span>
                <span v-else-if="currentInternalLevel === 1">In een cirkel is de omtrekshoek 35&deg;. Wat is de bijhorende middelpuntshoek?</span>
                <span v-else>Een omtrekshoek is altijd ___ van de middelpuntshoek op dezelfde boog.</span>
              </p>
              <div class="text-xs text-amber-700 p-2 bg-white rounded border border-amber-200 mb-2">
                <span v-if="currentInternalLevel === 0">
                  Tip: 80&deg; &divide; 2 = 40&deg;. De omtrekshoek is de helft.
                </span>
                <span v-else-if="currentInternalLevel === 1">
                  Tip: 35&deg; &times; 2 = 70&deg;. De middelpuntshoek is het dubbel.
                </span>
                <span v-else>
                  Tip: omtrekshoek = 1/2 &times; middelpuntshoek (zelfde boog).
                </span>
              </div>
              <button @click="submitPrediction"
                      class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="predictionDone && !showPrediction && !showReflection && !isCorrect" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <span v-if="currentScenario.unknown === 'inscribed'">
                  Middelpuntshoek = {{ currentScenario.central }}&deg;<br>
                  Omtrekshoek = {{ currentScenario.central }}&deg; &divide; 2 = <strong>{{ currentScenario.central / 2 }}&deg;</strong><br>
                  <span class="font-bold">Regel: omtrekshoek = 1/2 &times; middelpuntshoek</span>
                </span>
                <span v-else>
                  Omtrekshoek = {{ currentScenario.inscribed }}&deg;<br>
                  Middelpuntshoek = {{ currentScenario.inscribed }}&deg; &times; 2 = <strong>{{ currentScenario.inscribed * 2 }}&deg;</strong><br>
                  <span class="font-bold">Regel: middelpuntshoek = 2 &times; omtrekshoek</span>
                </span>
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Waarom is de middelpuntshoek altijd het dubbel van de omtrekshoek (op dezelfde boog)?<br>
                <span class="text-xs text-slate-500">Denk aan de meetkunde van de cirkel.</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Omdat de middelpuntshoek bij het middelpunt staat..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div class="p-6 mt-4 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4">
              <p class="font-bold text-slate-800 text-lg mb-2">
                Gegeven: <br>
                <span v-if="currentScenario.unknown === 'inscribed'" class="text-amber-600">Middelpuntshoek = {{ currentScenario.central }}&deg;</span>
                <span v-else class="text-amber-600">Omtrekshoek = {{ currentScenario.inscribed }}&deg;</span>
              </p>

              <label class="block mb-2 text-sm font-bold text-slate-700">
                Wat is de grootte van de
                {{ currentScenario.unknown === 'inscribed' ? 'omtrekshoek' : 'middelpuntshoek' }}?
              </label>
              <input type="number" v-model="userAnswer"
                     @keyup.enter="checkAnswer"
                     class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors"
                     placeholder="Bv. 45">
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showPrediction" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-else-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="300" height="300" viewBox="-150 -150 300 300" class="overflow-visible bg-white rounded-full shadow-md border border-slate-200">
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="4" />
                <circle cx="0" cy="0" r="4" fill="#334155" />

                <circle cx="-70.7" cy="70.7" r="5" fill="#334155" />
                <circle cx="70.7" cy="70.7" r="5" fill="#334155" />
                <circle cx="0" cy="-100" r="5" fill="#d97706" />

                <line x1="0" y1="0" x2="-70.7" y2="70.7" stroke="#d97706" stroke-width="3" />
                <line x1="0" y1="0" x2="70.7" y2="70.7" stroke="#d97706" stroke-width="3" />

                <line x1="0" y1="-100" x2="-70.7" y2="70.7" stroke="#475569" stroke-width="3" />
                <line x1="0" y1="-100" x2="70.7" y2="70.7" stroke="#475569" stroke-width="3" />

                <text x="-15" y="30" font-weight="bold" fill="#d97706">
                  {{ currentScenario.unknown === 'central' ? '?' : currentScenario.central + '&deg;' }}
                </text>

                <text x="-10" y="-70" font-weight="bold" fill="#475569">
                  {{ currentScenario.unknown === 'inscribed' ? '?' : currentScenario.inscribed + '&deg;' }}
                </text>

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
