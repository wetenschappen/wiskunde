<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhGraph,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Grafen Interpreteren'
  },
  instruction: {
    type: String,
    default: 'Dit is een model van een sociaal netwerk (een graaf). Elke knoop is een persoon, een boog betekent "is bevriend met". Hoeveel vrienden (wat is de graad) heeft persoon A?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGraph }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// --- 3-Level structure ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    name: 'Graad van A',
    instruction: 'Dit is een model van een sociaal netwerk (een graaf). Elke knoop is een persoon, een boog betekent "is bevriend met". Hoeveel vrienden (wat is de graad) heeft persoon A?',
    correctAnswer: 3,
    successFeedback: 'Helemaal juist! De graad van knoop A is 3, want er vertrekken 3 bogen.',
    errorFeedback: 'Niet juist. Tel hoeveel lijnen (bogen) er rechtstreeks aan knoop A vastzitten.'
  },
  {
    name: 'Graad van B',
    instruction: 'Bekijk hetzelfde netwerk. Persoon B is ook verbonden met een aantal personen. Wat is de graad van knoop B?',
    correctAnswer: 2,
    successFeedback: 'Helemaal juist! B is rechtstreeks verbonden met A en D, dus graad 2.',
    errorFeedback: 'Niet juist. Kijk welke bogen er rechtstreeks aan B vastzitten.'
  },
  {
    name: 'Som der Graden',
    instruction: 'Bereken de som van ALLE graden (A+B+C+D). Tel de graden van elke knoop bij elkaar op.',
    correctAnswer: 8,
    successFeedback: 'Perfect! A=3, B=2, C=1, D=2. De som is 3+2+1+2 = 8.',
    errorFeedback: 'Niet juist. A heeft graad 3, B heeft graad 2, C heeft graad 1, D heeft graad 2.'
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])
const currentInstruction = computed(() => currentLevel.value.instruction || props.instruction)

const userAnswer = ref('')

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userAnswer.value = '';
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
  if (parseInt(userAnswer.value) === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevel.value.successFeedback
    }
  } else {
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: currentLevel.value.errorFeedback
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
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
              <label class="block mb-2 text-sm font-bold text-slate-700">
                <span v-if="currentInternalLevel === 0">Wat is de graad van A?</span>
                <span v-else-if="currentInternalLevel === 1">Wat is de graad van B?</span>
                <span v-else>Wat is de som van alle graden?</span>
              </label>
              <input type="number" v-model="userAnswer"
                     @keyup.enter="checkAnswer"
                     class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-teal-500 transition-colors"
                     placeholder="Bv. 2">
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

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative bg-white rounded-2xl shadow-xl border border-slate-300 w-[400px] h-[400px] flex items-center justify-center">
                <!-- SVG Graph -->
                <svg width="100%" height="100%" viewBox="0 0 200 200">
                  <!-- Edges -->
                  <!-- A to B -->
                  <line x1="100" y1="50" x2="50" y2="150" stroke="#cbd5e1" stroke-width="4" />
                  <!-- A to C -->
                  <line x1="100" y1="50" x2="150" y2="150" stroke="#cbd5e1" stroke-width="4" />
                  <!-- A to D -->
                  <line x1="100" y1="50" x2="100" y2="150" stroke="#cbd5e1" stroke-width="4" />
                  <!-- B to D -->
                  <line x1="50" y1="150" x2="100" y2="150" stroke="#cbd5e1" stroke-width="4" />

                  <!-- Nodes -->
                  <circle cx="100" cy="50" r="15" fill="#0ea5e9" stroke="#fff" stroke-width="3" />
                  <text x="100" y="55" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">A</text>

                  <circle cx="50" cy="150" r="15" fill="#f59e0b" stroke="#fff" stroke-width="3" />
                  <text x="50" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">B</text>

                  <circle cx="150" cy="150" r="15" fill="#10b981" stroke="#fff" stroke-width="3" />
                  <text x="150" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">C</text>

                  <circle cx="100" cy="150" r="15" fill="#8b5cf6" stroke="#fff" stroke-width="3" />
                  <text x="100" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">D</text>

                  <!-- Highlight if correct -->
                  <circle v-if="isCorrect" cx="100" cy="50" r="22" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="4" class="animate-[spin_4s_linear_infinite]" />
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