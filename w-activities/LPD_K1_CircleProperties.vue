<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCircleDashed,
  PhArrowClockwise
} from '@phosphor-icons/vue'

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
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// --- 3-Level structure with generateLevel() ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  let central, inscribed, unknown
  const types = ['inscribed', 'central']

  if (lvl === 0) {
    // Level 1: Omtrekshoek — find inscribed angle given central
    unknown = 'inscribed'
    const cVals = [60, 70, 80, 90, 100, 110, 120]
    central = cVals[randInt(0, cVals.length - 1)]
    // Ensure divisible by 2
    central = Math.round(central / 10) * 10
    inscribed = central / 2
  } else if (lvl === 1) {
    // Level 2: Middelpuntshoek — find central angle given inscribed
    unknown = 'central'
    const iVals = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
    inscribed = iVals[randInt(0, iVals.length - 1)]
    central = inscribed * 2
  } else {
    // Level 3: Gemengd — randomly pick which to ask
    unknown = types[randInt(0, 1)]
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

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Denk aan de relatie tussen middelpuntshoek en omtrekshoek.'
  if (c === 2) {
    if (currentScenario.value.unknown === 'inscribed') return 'Hint: De omtrekshoek is de helft van de middelpuntshoek. Deel ' + currentScenario.value.central + ' door 2.'
    return 'Hint: De middelpuntshoek is het dubbel van de omtrekshoek. Verdubbel ' + currentScenario.value.inscribed + '.'
  }
  if (currentScenario.value.unknown === 'inscribed') return 'Hint: ' + currentScenario.value.central + ' / 2 = ?'
  return 'Hint: ' + currentScenario.value.inscribed + ' x 2 = ?'
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userAnswer.value = '';
  currentScenarioIndex.value = 0
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    goToNextStep()
  }
}

function checkAnswer() {
  isChecked.value = true;
  const correctVal = currentScenario.value.unknown === 'inscribed' ? currentScenario.value.inscribed : currentScenario.value.central;

  if (parseInt(userAnswer.value) === correctVal) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Helemaal juist! De omtrekshoek is altijd de helft van de middelpuntshoek die op dezelfde boog staat.'
    }
  } else {
    attemptCount.value++
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'Niet juist. Onthoud: Middelpuntshoek = 2 &times; Omtrekshoek.<br/><br/>' + getHint()
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-pink-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <p v-if="totalSteps > 1" class="text-xs text-slate-300">|</p>
              <p class="text-xs font-medium text-indigo-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} &mdash; {{ currentLevel.name }}</p>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="currentInstruction"></div>

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4">
              <p class="font-bold text-slate-800 text-lg mb-2">
                Gegeven: <br>
                <span v-if="currentScenario.unknown === 'inscribed'" class="text-pink-600">Middelpuntshoek = {{ currentScenario.central }}&deg;</span>
                <span v-else class="text-sky-600">Omtrekshoek = {{ currentScenario.inscribed }}&deg;</span>
              </p>

              <label class="block mb-2 text-sm font-bold text-slate-700">
                Wat is de grootte van de
                {{ currentScenario.unknown === 'inscribed' ? 'omtrekshoek' : 'middelpuntshoek' }}?
              </label>
              <input type="number" v-model="userAnswer"
                     @keyup.enter="checkAnswer"
                     class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-pink-500 transition-colors"
                     placeholder="Bv. 45">
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Keep Controleer: number input -->
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Circle SVG -->
              <svg width="300" height="300" viewBox="-150 -150 300 300" class="overflow-visible bg-white rounded-full shadow-md border border-slate-200">
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="4" />
                <circle cx="0" cy="0" r="4" fill="#334155" /> <!-- Centrum -->

                <!-- Fixed Points on arc -->
                <circle cx="-70.7" cy="70.7" r="5" fill="#334155" /> <!-- Point A (bottom left) -->
                <circle cx="70.7" cy="70.7" r="5" fill="#334155" /> <!-- Point B (bottom right) -->

                <!-- Inscribed point (top) -->
                <circle cx="0" cy="-100" r="5" fill="#0ea5e9" /> <!-- Point C -->

                <!-- Lines for central angle -->
                <line x1="0" y1="0" x2="-70.7" y2="70.7" stroke="#db2777" stroke-width="3" />
                <line x1="0" y1="0" x2="70.7" y2="70.7" stroke="#db2777" stroke-width="3" />

                <!-- Lines for inscribed angle -->
                <line x1="0" y1="-100" x2="-70.7" y2="70.7" stroke="#0ea5e9" stroke-width="3" />
                <line x1="0" y1="-100" x2="70.7" y2="70.7" stroke="#0ea5e9" stroke-width="3" />

                <!-- Text Labels -->
                <text x="-15" y="30" font-weight="bold" fill="#db2777">
                  {{ currentScenario.unknown === 'central' ? '?' : currentScenario.central + '&deg;' }}
                </text>

                <text x="-10" y="-70" font-weight="bold" fill="#0ea5e9">
                  {{ currentScenario.unknown === 'inscribed' ? '?' : currentScenario.inscribed + '&deg;' }}
                </text>

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>