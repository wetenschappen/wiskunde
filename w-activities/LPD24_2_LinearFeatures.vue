<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMagnifyingGlass,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Kenmerken Eerstegraadsfuncties'
  },
  instruction: {
    type: String,
    default: 'Zoek de nulwaarde met de scanner en vul het tekenschema in (klik op de + of - tekens in de tabel).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMagnifyingGlass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: simple integer a, b
  const a1 = pickRandom([1, 2, -1, -2])
  const b1 = pickRandom([-6, -4, -3, -2, 2, 3, 4, 6])
  newLevels.push(createFunctionLevel(a1, b1))

  // Level 2: half steps (±0.5)
  const a2 = pickRandom([0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2])
  const b2 = pickRandom([-6, -4, -3, -2, -1, 1, 2, 3, 4, 6])
  newLevels.push(createFunctionLevel(a2, b2))

  // Level 3: more variety
  const a3 = pickRandom([-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3])
  const b3 = pickRandom([-8, -6, -5, -4, -3, 3, 4, 5, 6, 8])
  newLevels.push(createFunctionLevel(a3, b3))

  levels.value = newLevels
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createFunctionLevel(a, b) {
  const root = -b / a
  const f_str = Number.isInteger(a) ? (a === 1 ? 'x' : a === -1 ? '-x' : a + 'x') : a + 'x'
  const bStr = b >= 0 ? (b === 0 ? '' : ' + ' + b) : ' - ' + Math.abs(b)
  const signLeft = a > 0 ? '-' : '+'
  const signRight = a > 0 ? '+' : '-'
  return {
    f_str: 'f(x) = ' + f_str + bStr,
    f: (x) => a * x + b,
    root,
    signLeft,
    signRight
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const scanX = ref(0)
const userSignLeft = ref('')
const userSignRight = ref('')

function toggleSign(side) {
  if (isCorrect.value) return;
  if (side === 'left') {
    userSignLeft.value = userSignLeft.value === '+' ? '-' : (userSignLeft.value === '-' ? '' : '+');
  } else {
    userSignRight.value = userSignRight.value === '+' ? '-' : (userSignRight.value === '-' ? '' : '+');
  }
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Beweeg de oranje lijn om de nulwaarde op de x-as te vinden.' };
  scanX.value = 0;
  userSignLeft.value = '';
  userSignRight.value = '';
  attemptCount.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;
  const target = currentLevelData.value;

  const rootCorrect = scanX.value === target.root;
  const signsCorrect = userSignLeft.value === target.signLeft && userSignRight.value === target.signRight;

  if (rootCorrect && signsCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Perfect! De nulwaarde en het bijbehorende tekenschema kloppen helemaal.'
    }
  } else if (!rootCorrect) {
    isCorrect.value = false
    if (attemptCount.value >= 3) {
      feedback.value = { type: 'error', text: `De nulwaarde is het x-getal waarvoor f(x)=0. Los ${target.f_str} = 0 op. x = ${target.root}.` }
    } else if (attemptCount.value >= 2) {
      feedback.value = { type: 'error', text: 'Een nulwaarde is de x-coördinaat waar de grafiek de x-as (y=0) snijdt. Waar gebeurt dat?' }
    } else {
      feedback.value = { type: 'error', text: 'De nulwaarde klopt niet. Een nulwaarde is de x-coördinaat waar de grafiek de x-as (y=0) snijdt.' }
    }
  } else {
    isCorrect.value = false
    if (attemptCount.value >= 3) {
      feedback.value = { type: 'error', text: `De nulwaarde (x=${target.root}) klopt. De tekens: vóór de nulwaarde is f(x) ${target.signLeft}, erna is f(x) ${target.signRight}. Kijk naar de grafiek: ligt ze boven (+) of onder (-) de x-as?` }
    } else if (attemptCount.value >= 2) {
      feedback.value = { type: 'error', text: `De nulwaarde klopt. Maar kijk naar de grafiek: aan de linkerkant van de nulwaarde, ligt f(x) boven of onder de x-as?` }
    } else {
      feedback.value = { type: 'error', text: 'De nulwaarde klopt, maar de plus/min tekens zijn fout. Ligt de grafiek vóór de nulwaarde onder (-) of boven (+) de x-as?' }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    generateLevel()
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
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
              </div>
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
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">

              <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
                 <span class="font-bold text-slate-700">Functie: </span>
                 <span class="font-mono font-black text-xl text-teal-600 ml-2">{{ currentLevelData.f_str }}</span>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">1. Vind de Nulwaarde (x = {{ scanX }})</label>
                <input type="range" v-model.number="scanX" min="-6" max="6" step="0.5" class="w-full accent-orange-500">
                <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>-6</span><span>0</span><span>6</span>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">2. Tekenschema</label>
                <div class="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm overflow-hidden">
                     <table class="w-full border-collapse text-center">
                       <tr>
                         <td class="border-b-2 border-r-2 border-slate-200 text-sm font-bold text-slate-500 py-2 w-12">x</td>
                         <td class="border-b-2 border-slate-200 py-2 w-16"></td>
                         <td class="border-b-2 border-slate-200 font-mono font-bold text-lg text-orange-600">{{ scanX }}</td>
                         <td class="border-b-2 border-slate-200 py-2 w-16"></td>
                       </tr>
                       <tr>
                         <td class="text-sm font-bold text-slate-500 py-2 border-r-2 border-slate-200">f(x)</td>
                         <td class="py-2">
                            <button @click="toggleSign('left')" class="w-10 h-10 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center">
                              {{ userSignLeft }}
                            </button>
                         </td>
                         <td class="font-mono font-bold text-xl text-emerald-600 py-2 bg-emerald-50 rounded">0</td>
                         <td class="py-2">
                            <button @click="toggleSign('right')" class="w-10 h-10 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center">
                              {{ userSignRight }}
                            </button>
                         </td>
                       </tr>
                     </table>
                </div>
              </div>

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
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userSignLeft || !userSignRight" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Coordinate System SVG -->
              <svg width="450" height="450" viewBox="-8 -8 16 16" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="0.1">
                  <line v-for="i in 17" :key="'v'+i" :x1="i-9" y1="-8" :x2="i-9" y2="8" />
                  <line v-for="i in 17" :key="'h'+i" x1="-8" :y1="i-9" x2="8" :y2="i-9" />
                </g>

                <!-- Zone coloring based on signs -->
                <!-- Left Zone -->
                <rect v-if="userSignLeft === '+'" x="-8" y="-8" :width="scanX + 8" height="8" fill="#10b981" opacity="0.1" />
                <rect v-if="userSignLeft === '-'" x="-8" y="0" :width="scanX + 8" height="8" fill="#ef4444" opacity="0.1" />
                <!-- Right Zone -->
                <rect v-if="userSignRight === '+'" :x="scanX" y="-8" :width="8 - scanX" height="8" fill="#10b981" opacity="0.1" />
                <rect v-if="userSignRight === '-'" :x="scanX" y="0" :width="8 - scanX" height="8" fill="#ef4444" opacity="0.1" />

                <!-- Axes -->
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748b" stroke-width="0.2" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" stroke-width="0.2" />

                <!-- The Graph -->
                <line x1="-8" :y1="-currentLevelData.f(-8)" x2="8" :y2="-currentLevelData.f(8)" stroke="#0d9488" stroke-width="0.3" stroke-linecap="round" />

                <!-- Scanner Line -->
                <line :x1="scanX" y1="-8" :x2="scanX" y2="8" stroke="#f97316" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-150" />
                <circle :cx="scanX" cy="0" r="0.3" fill="#f97316" class="transition-all duration-150 shadow-sm" />

                <!-- Correct highlight -->
                <circle v-if="isCorrect" :cx="currentLevelData.root" cy="0" r="0.5" fill="#f97316" class="animate-pulse" />

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
