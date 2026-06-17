<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCalculator,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Wortel-Kraker (Vereenvoudigen)'
  },
  instruction: {
    type: String,
    default: 'Vereenvoudig de vierkantswortel door hem op te splitsen. Zoek het GROOTSTE kwadraat (1, 4, 9, 16, 25...) dat een deler is van het getal onder de wortel.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCalculator }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Typ de twee factoren in.' })
const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const rootPools = [
  // Level 1: perfect square = 4 or 9
  [
    { target: 8, square: 4, remain: 2, root: 2, label: '2\u221A2' },
    { target: 12, square: 4, remain: 3, root: 2, label: '2\u221A3' },
    { target: 18, square: 9, remain: 2, root: 3, label: '3\u221A2' },
    { target: 20, square: 4, remain: 5, root: 2, label: '2\u221A5' },
    { target: 27, square: 9, remain: 3, root: 3, label: '3\u221A3' },
    { target: 28, square: 4, remain: 7, root: 2, label: '2\u221A7' }
  ],
  // Level 2: perfect square up to 25
  [
    { target: 45, square: 9, remain: 5, root: 3, label: '3\u221A5' },
    { target: 48, square: 16, remain: 3, root: 4, label: '4\u221A3' },
    { target: 50, square: 25, remain: 2, root: 5, label: '5\u221A2' },
    { target: 54, square: 9, remain: 6, root: 3, label: '3\u221A6' },
    { target: 63, square: 9, remain: 7, root: 3, label: '3\u221A7' },
    { target: 75, square: 25, remain: 3, root: 5, label: '5\u221A3' }
  ],
  // Level 3: perfect square up to 49
  [
    { target: 72, square: 36, remain: 2, root: 6, label: '6\u221A2' },
    { target: 80, square: 16, remain: 5, root: 4, label: '4\u221A5' },
    { target: 98, square: 49, remain: 2, root: 7, label: '7\u221A2' },
    { target: 99, square: 9, remain: 11, root: 3, label: '3\u221A11' },
    { target: 52, square: 4, remain: 13, root: 2, label: '2\u221A13' },
    { target: 68, square: 4, remain: 17, root: 2, label: '2\u221A17' }
  ]
]

function generateLevel() {
  return rootPools.map((pool, i) => {
    const picked = pool[randomInt(0, pool.length - 1)]
    return {
      goalText: `Opdracht ${i+1}: Vereenvoudig \u221A${picked.target}.`,
      targetRoot: picked.target,
      perfectSquare: picked.square,
      remainder: picked.remain,
      finalAns: picked.label,
      rootSquare: picked.root
    }
  })
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State
const inputSquare = ref(null)
const inputRemainder = ref(null)

const step = ref(0) // 0: input, 1: exploded (correct factors), 2: final simplified

function resetActivityState() {
  levels.value = generateLevel();
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Typ de twee factoren in.' };
  attemptCount.value = 0;
  inputSquare.value = null;
  inputRemainder.value = null;
  step.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value;

  if (!inputSquare.value || !inputRemainder.value) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Vul beide vakjes in!' };
    return;
  }

  // Did they multiply correctly?
  if (inputSquare.value * inputRemainder.value !== target.targetRoot) {
    attemptCount.value++;
    isCorrect.value = false;
    feedback.value = { type: 'error', text: `Foutje: ${inputSquare.value} x ${inputRemainder.value} is geen ${target.targetRoot}!` };
    return;
  }

  // Did they pick the LARGEST perfect square?
  if (inputSquare.value === target.perfectSquare && inputRemainder.value === target.remainder) {
    isCorrect.value = true;
    attemptCount.value = 0;
    step.value = 1; // move to explosion animation
    feedback.value = { type: 'success', text: `Briljant! ${inputSquare.value} is inderdaad een perfect kwadraat. Kijk naar de machine!` };

    // Auto progress to final step after a short delay
    setTimeout(() => {
        if(isCorrect.value && step.value === 1) {
            step.value = 2;
        }
    }, 2000);
  }
  // What if they swapped them?
  else if (inputRemainder.value === target.perfectSquare && inputSquare.value === target.remainder) {
    attemptCount.value++;
    isCorrect.value = false;
    feedback.value = { type: 'error', text: `Je getallen kloppen, maar vul het kwadraat (${target.perfectSquare}) in het linkervakje in (onder de blauwe wortel).` };
  }
  else {
    attemptCount.value++;
    // Math is right, but not the *largest* perfect square
    const isSquare = Math.sqrt(inputSquare.value) % 1 === 0;
    if (!isSquare) {
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `${inputSquare.value} is geen perfect kwadraat! Je kunt er niet mooi de wortel uit trekken. Probeer getallen als 4, 9, 16, 25...` };
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: `Welke kwadraten (4, 9, 16, 25, 36, 49...) kun je delen uit ${target.targetRoot}?` };
      } else {
        feedback.value = { type: 'error', text: `${target.targetRoot} = ${target.perfectSquare} x ${target.remainder}. Het grootste kwadraat dat een deler is, is ${target.perfectSquare}.` };
      }
    } else {
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `Je koos het kwadraat ${inputSquare.value}, maar er is een GROTER kwadraat dat een deler is van ${target.targetRoot}!` };
      } else if (attemptCount.value === 2) {
        const squares = [4, 9, 16, 25, 36, 49].filter(s => target.targetRoot % s === 0).join(', ');
        feedback.value = { type: 'error', text: `De kwadraten die deler zijn van ${target.targetRoot} zijn: ${squares}. Kies de grootste!` };
      } else {
        feedback.value = { type: 'error', text: `Het grootste kwadraat is ${target.perfectSquare}. Dus: ${target.targetRoot} = ${target.perfectSquare} x ${target.remainder}.` };
      }
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

            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Jouw splitsing</p>

              <div class="flex items-center justify-between gap-2">
                 <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-500 mb-1 text-center">Het Kwadraat</label>
                    <input type="number" v-model.number="inputSquare" :disabled="step > 0" class="w-full p-3 text-xl font-mono font-black text-center text-blue-600 bg-white border-2 border-blue-300 rounded-lg outline-none focus:border-blue-500" placeholder="?">
                 </div>
                 <div class="text-slate-400 font-black text-xl mt-4">x</div>
                 <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-500 mb-1 text-center">De Rest</label>
                    <input type="number" v-model.number="inputRemainder" :disabled="step > 0" class="w-full p-3 text-xl font-mono font-black text-center text-emerald-600 bg-white border-2 border-emerald-300 rounded-lg outline-none focus:border-emerald-500" placeholder="?">
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

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !inputSquare || !inputRemainder" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="handleNext" :disabled="step < 2" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <div class="w-full max-w-4xl flex items-center justify-center gap-4 transition-all duration-700" :class="step === 2 ? 'scale-110' : 'scale-100'">

                 <!-- Original Root -->
                 <div class="text-7xl font-mono font-black text-slate-700 relative z-10 transition-all duration-500" :class="step > 0 ? 'opacity-30' : 'opacity-100'">
                    \u221A<span class="border-t-8 border-slate-700 pt-2 ml-1 inline-block">{{ currentLevelData.targetRoot }}</span>
                 </div>

                 <!-- Equals Sign -->
                 <div class="text-6xl font-mono font-black text-slate-300 mx-4 transition-all duration-500" :class="step > 0 ? 'opacity-100' : 'opacity-0 -translate-x-4'">
                    =
                 </div>

                 <!-- Factored Form (Exploded) -->
                 <div class="flex items-center gap-4 transition-all duration-500" :class="step > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'">

                    <!-- The Square Part -->
                    <div class="relative group">
                       <div class="text-6xl font-mono font-black text-blue-600 relative z-10 transition-all duration-500" :class="step === 2 ? 'opacity-0 scale-150 absolute top-0 left-0' : 'opacity-100 scale-100'">
                          \u221A<span class="border-t-[6px] border-blue-600 pt-2 ml-1 inline-block">{{ inputSquare || '?' }}</span>
                       </div>

                       <!-- The Resolved Square Part -->
                       <div class="text-7xl font-mono font-black text-rose-500 absolute top-0 left-0 z-20 transition-all duration-500 origin-center" :class="step === 2 ? 'opacity-100 scale-100 drop-shadow-xl' : 'opacity-0 scale-50'">
                          {{ currentLevelData.rootSquare }}
                       </div>
                    </div>

                    <!-- Multiplication Sign -->
                    <div class="text-4xl font-mono font-black text-slate-400 mt-2 transition-all duration-300" :class="step === 2 ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'">
                       x
                    </div>

                    <!-- The Remainder Part -->
                    <div class="text-6xl font-mono font-black text-emerald-600 relative z-10 transition-all duration-500" :class="step === 2 ? '-translate-x-8 text-7xl' : 'translate-x-0'">
                       \u221A<span class="border-t-[6px] border-emerald-600 pt-2 ml-1 inline-block" :class="step === 2 ? 'border-t-8' : ''">{{ inputRemainder || '?' }}</span>
                    </div>

                 </div>

              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
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

.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
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