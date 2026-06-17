<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhLines,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Onderlinge Ligging van Rechten'
  },
  instruction: {
    type: String,
    default: 'Vergelijk de vergelijkingen van de twee rechten. Zijn ze evenwijdig (niet samenvallend), snijdend of samenvallend?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLines }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    name: 'Basis',
    description: 'Eenvoudige evenwijdige en snijdende rechten.',
    scenarios: [
      { id: 1, l1: 'y = 2x + 3', l2: 'y = 2x - 5', correct: 'evenwijdig', desc: 'Gelijke rico, ander snijpunt.' },
      { id: 2, l1: 'y = 3x + 1', l2: 'y = -x + 1', correct: 'snijdend', desc: 'Verschillende rico.' }
    ]
  },
  {
    name: 'Toepassing',
    description: 'Gemengde situaties met cartesische vergelijkingen.',
    scenarios: [
      { id: 1, l1: 'y = 2x + 3', l2: 'y = 2x - 5', correct: 'evenwijdig', desc: 'Gelijke rico, ander snijpunt.' },
      { id: 2, l1: '2x - 3y + 6 = 0', l2: '4x - 6y + 12 = 0', correct: 'samenvallend', desc: 'Vergelijkingen zijn een veelvoud.' },
      { id: 3, l1: 'y = 3x + 1', l2: 'y = -x + 1', correct: 'snijdend', desc: 'Verschillende rico.' },
      { id: 4, l1: 'x + 2y - 4 = 0', l2: '2x + y - 4 = 0', correct: 'snijdend', desc: 'Verhouding van u en v is niet gelijk.' }
    ]
  },
  {
    name: 'Uitdaging',
    description: 'Complexe veelvouden en speciale gevallen.',
    scenarios: [
      { id: 1, l1: 'y = 2x + 3', l2: 'y = 2x - 5', correct: 'evenwijdig', desc: 'Gelijke rico, ander snijpunt.' },
      { id: 2, l1: '2x - 3y + 6 = 0', l2: '4x - 6y + 12 = 0', correct: 'samenvallend', desc: 'Vergelijkingen zijn een veelvoud.' },
      { id: 3, l1: 'y = 3x + 1', l2: 'y = -x + 1', correct: 'snijdend', desc: 'Verschillende rico.' },
      { id: 4, l1: 'x + 2y - 4 = 0', l2: '2x + y - 4 = 0', correct: 'snijdend', desc: 'Verhouding van u en v is niet gelijk.' },
      { id: 5, l1: '2x - 3y = 5', l2: '-4x + 6y = -10', correct: 'samenvallend', desc: 'Tweede vergelijking is een veelvoud van de eerste.' },
      { id: 6, l1: '3x + y = 2', l2: '6x + 2y = 8', correct: 'evenwijdig', desc: 'Zelfde verhouding coëfficiënten maar andere constante.' }
    ]
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

const currentScenarioIndex = ref(0)
const currentScenario = computed(() => currentLevel.value.scenarios[currentScenarioIndex.value])
const userChoice = ref(null)

const options = ['snijdend', 'evenwijdig', 'samenvallend']

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userChoice.value = null;
  currentScenarioIndex.value = Math.floor(Math.random() * currentLevel.value.scenarios.length);
}

function checkAnswer() {
  isChecked.value = true;
  if (userChoice.value === currentScenario.value.correct) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Helemaal juist! ${currentScenario.value.desc}`
    }
  } else {
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'Kijk naar de richtingscoëfficiënten of de verhouding van de coëfficiënten u en v.'
    }
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
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
    currentInternalLevel.value = 0
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <!-- Level indicator -->
          <div class="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <div v-for="(level, i) in levels" :key="i"
                 class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                 :class="i === currentInternalLevel ? 'bg-orange-500 ring-2 ring-orange-200 scale-125' : i < currentInternalLevel ? 'bg-orange-300' : 'bg-slate-300'">
            </div>
            <span class="text-xs font-bold text-orange-700 ml-1.5 uppercase">{{ currentLevel.name }}</span>
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
            <p class="mb-2 text-xs font-semibold text-orange-600">Level {{ currentInternalLevel + 1 }} — {{ currentLevel.name }}</p>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl">

              <div class="bg-white p-4 border border-slate-200 rounded mb-6 font-mono text-lg shadow-sm">
                <p class="text-blue-600">l₁: {{ currentScenario.l1 }}</p>
                <p class="text-emerald-600 mt-2">l₂: {{ currentScenario.l2 }}</p>
              </div>

              <div class="flex flex-col gap-3">
                <button v-for="opt in options" :key="opt"
                        @click="() => { if(!isCorrect) { userChoice = opt; isChecked = false; } }"
                        class="p-4 border-2 rounded-xl text-left font-bold transition-all capitalize"
                        :class="userChoice === opt ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-300 text-slate-700'">
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userChoice" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
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

              <div class="w-64 h-64 relative bg-white border-2 border-slate-300 rounded shadow-inner overflow-hidden">
                <!-- Graphical hint of the situation -->
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <g v-if="currentScenario.correct === 'evenwijdig'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#2563eb" stroke-width="4" />
                    <line x1="20" y1="100" x2="100" y2="20" stroke="#10b981" stroke-width="4" />
                  </g>
                  <g v-if="currentScenario.correct === 'snijdend'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#2563eb" stroke-width="4" />
                    <line x1="10" y1="10" x2="90" y2="90" stroke="#10b981" stroke-width="4" />
                  </g>
                  <g v-if="currentScenario.correct === 'samenvallend'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#2563eb" stroke-width="6" />
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#10b981" stroke-width="3" stroke-dasharray="4" />
                  </g>
                </svg>
              </div>

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