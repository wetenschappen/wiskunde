<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhFunction,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Functiemachine Reverse-Engineering'
  },
  instruction: {
    type: String,
    default: 'Sleep getallen in de machine om te ontdekken wat hij doet. Bouw daarna het interne mechanisme f(x) = ax + b na!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhFunction }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const result = []

  // Level 1: Small integer coefficients (positive a)
  const a1 = Math.floor(Math.random() * 4) + 2 // 2..5
  const b1 = Math.floor(Math.random() * 7) - 3 // -3..3
  result.push({ targetA: a1, targetB: b1,
    hint1: 'Test meer getallen in de machine om een patroon te ontdekken.',
    hint2: 'Bereken eerst het verschil tussen opeenvolgende outputs. Dat is a.',
    hint3: `De formule is f(x) = ${a1}x ${b1 >= 0 ? '+ ' + b1 : '- ' + Math.abs(b1)}.`
  })

  // Level 2: Negative slope a
  const a2 = -(Math.floor(Math.random() * 4) + 1) // -4..-1
  const b2 = Math.floor(Math.random() * 9) - 4 // -4..4
  result.push({ targetA: a2, targetB: b2,
    hint1: 'Let op of de output groter of kleiner wordt als de input toeneemt.',
    hint2: 'Als output daalt naarmate input stijgt, is a negatief.',
    hint3: `De formule is f(x) = ${a2}x ${b2 >= 0 ? '+ ' + b2 : '- ' + Math.abs(b2)}.`
  })

  // Level 3: Fractional a
  const aOptions = [0.5, 1.5, -0.5, -1.5]
  const a3 = aOptions[Math.floor(Math.random() * aOptions.length)]
  const b3 = Math.floor(Math.random() * 5) - 2 // -2..2
  result.push({ targetA: a3, targetB: b3,
    hint1: 'Kijk goed naar de tabel. Wordt de output met een halve eenheid groter?',
    hint2: 'Misschien is a geen geheel getal. Wat gebeurt er als x met 2 toeneemt?',
    hint3: `De formule is f(x) = ${a3}x ${b3 >= 0 ? '+ ' + b3 : '- ' + Math.abs(b3)}.`
  })

  return result
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State
const inputs = [0, 1, 2, 4]
const history = ref([]) // array of { in: number, out: number }
const currentOutput = ref('?')

const userA = ref(1)
const userB = ref(0)

let draggedItem = null

function applyFunction(x) {
  return currentLevelData.value.targetA * x + currentLevelData.value.targetB;
}

function onDragStart(num) {
  if (isCorrect.value) return;
  draggedItem = num;
}

function onDrop() {
  if (draggedItem !== null && !isCorrect.value) {
    const out = applyFunction(draggedItem);
    currentOutput.value = out;
    if (!history.value.some(h => h.in === draggedItem)) {
      history.value.push({ in: draggedItem, out: out });
      history.value.sort((a, b) => a.in - b.in);
    }
    draggedItem = null;
    isChecked.value = false;
  }
}

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Sleep de blokken in de trechter om data te verzamelen.' };
  history.value = [];
  currentOutput.value = '?';
  userA.value = 1;
  userB.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  if (history.value.length < 2) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Niet helemaal... Je hebt niet genoeg data verzameld! Test minstens 2 getallen in de machine om een patroon te kunnen zien.' };
    return;
  }

  const targetA = currentLevelData.value.targetA;
  const targetB = currentLevelData.value.targetB;
  const hint = getHint(currentLevelData.value);

  if (userA.value === targetA && userB.value === targetB) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Prima! Bingo! Je hebt het wiskundige algoritme van de machine perfect nagebouwd.'
    }
  } else {
    isCorrect.value = false
    attemptCount.value++
    if (userA.value !== targetA) {
      feedback.value = {
        type: 'error',
        text: 'Niet helemaal... De richtingscoëfficiënt (a) klopt niet. Kijk naar je tabel: hoeveel verandert de output als de input met 1 toeneemt? ' + hint
      }
    } else {
      feedback.value = {
        type: 'error',
        text: 'Niet helemaal... De toename per eenheid (a) is juist, maar je startwaarde (b) klopt niet. Wat is de output als de input exact 0 is? ' + hint
      }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    levels.value = generateLevel();
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <p class="font-bold text-slate-800 mb-2">Gelogde Data:</p>
              <div class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div class="flex bg-slate-800 text-white border-b border-slate-200">
                  <div class="flex-1 p-2 font-bold text-center border-r border-slate-600">Input (x)</div>
                  <div class="flex-1 p-2 font-bold text-center">Output f(x)</div>
                </div>
                <div v-for="h in history" :key="h.in" class="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div class="flex-1 p-2 text-center border-r border-slate-200 font-mono font-bold">{{ h.in }}</div>
                  <div class="flex-1 p-2 text-center font-mono text-math-blue font-black">{{ h.out }}</div>
                </div>
                <div v-if="history.length === 0" class="p-4 text-center text-sm text-slate-400 italic">
                  Tabel is leeg.
                </div>
              </div>

              <div class="mt-8 space-y-6">
                <p class="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Bouw de formule</p>

                <div class="text-center bg-white p-4 rounded-lg border-2 border-surface-200 shadow-sm font-mono font-black text-xl text-math-blue">
                  f(x) = {{ userA }}x {{ userB >= 0 ? '+ ' + userB : '- ' + Math.abs(userB) }}
                </div>

                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700 flex justify-between">
                    <span>Vermenigvuldiger (a)</span>
                    <span class="text-math-blue">{{ userA }}</span>
                  </label>
                  <input type="range" v-model.number="userA" min="-5" max="5" step="0.5" class="w-full accent-fuchsia-600">
                </div>

                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700 flex justify-between">
                    <span>Opteller (b)</span>
                    <span class="text-blue-600">{{ userB }}</span>
                  </label>
                  <input type="range" v-model.number="userB" min="-5" max="5" step="1" class="w-full accent-blue-600">
                </div>

              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                Controleer
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <!-- Inputs Panel -->
              <div class="flex gap-6">
                <div v-for="num in inputs" :key="num"
                     draggable="true"
                     @dragstart="onDragStart(num)"
                     class="w-16 h-16 bg-white border-4 border-slate-300 rounded-xl flex items-center justify-center text-2xl font-black text-slate-700 cursor-grab hover:border-math-blue hover:text-math-blue active:cursor-grabbing shadow-sm z-20 relative transition-colors"
                     :class="{ 'opacity-30 pointer-events-none': history.some(h => h.in === num) }">
                  {{ num }}
                </div>
              </div>

              <!-- Machine -->
              <div class="relative flex flex-col items-center justify-center mt-4">

                <!-- The animated dropping input (ghost) -->
                <div v-if="draggedItem !== null" class="absolute -top-16 w-12 h-12 bg-white/50 border-2 border-slate-300 border-dashed rounded-lg flex items-center justify-center text-slate-300 font-black animate-pulse z-0 pointer-events-none">
                  {{ draggedItem }}
                </div>

                <!-- Funnel (Drop zone) -->
                <div @dragover.prevent @drop="onDrop" class="w-40 h-20 bg-slate-300 rounded-t-full border-t-8 border-l-8 border-r-8 border-slate-500 flex items-center justify-center z-10 transition-colors shadow-inner" :class="draggedItem !== null ? 'bg-math-blue-light border-math-blue shadow-[0_0_15px_rgba(217,70,239,0.5)]' : ''">
                  <span class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-6" :class="draggedItem !== null ? 'text-math-blue' : ''">Sleep Hier</span>
                </div>

                <!-- Body -->
                <div class="w-64 h-56 bg-slate-800 rounded-xl shadow-md flex flex-col items-center justify-center relative z-20 border-b-[12px] border-slate-900 overflow-hidden">

                   <!-- Internal visual flair -->
                   <div class="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)] pointer-events-none"></div>

                   <div class="text-5xl font-black text-white tracking-widest z-10 drop-shadow-md">f(x)</div>

                   <!-- Fake gears moving -->
                   <div class="absolute bottom-6 left-6 text-slate-600 animate-spin-slow">⚙️</div>
                   <div class="absolute top-6 right-6 text-slate-600 animate-spin-slow" style="animation-direction: reverse;">⚙️</div>

                   <!-- Lights/Details -->
                   <div class="absolute top-4 left-4 w-4 h-4 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" :class="draggedItem !== null ? 'bg-math-blue shadow-[0_0_15px_rgba(217,70,239,1)]' : 'bg-red-500'"></div>
                   <div class="absolute top-4 left-10 w-4 h-4 rounded-full bg-slate-700"></div>
                   <div class="absolute top-4 right-4 w-4 h-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)]" :class="isCorrect ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-600'"></div>
                </div>

                <!-- Output pipe -->
                <div class="w-24 h-16 bg-slate-400 border-l-8 border-r-8 border-slate-500 z-10 relative flex justify-center shadow-inner">
                  <!-- The Output Number dropping out -->
                  <div :key="currentOutput" class="absolute -bottom-8 w-20 h-20 bg-white border-4 border-math-blue rounded-xl flex items-center justify-center text-3xl font-black text-math-blue shadow-md animate-popOut z-0 origin-top">
                    {{ currentOutput }}
                  </div>
                </div>
              </div>

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


.animate-spin-slow { animation: spin 4s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.animate-popOut { animation: popOut 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes popOut {
  0% { transform: scaleY(0); opacity: 0; }
  50% { transform: scaleY(1.1); opacity: 1; }
  100% { transform: scaleY(1); opacity: 1; }
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
