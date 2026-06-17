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
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Representaties van een Rechte'
  },
  instruction: {
    type: String,
    default: 'Construeer het functievoorschrift f(x) = ax + b zodat de grafiek perfect door álle rode punten van de tabel gaat!'
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

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []
  // Level 1: small numbers, x=0 included
  const a1 = pickRandom([0.5, 1, 1.5, 2, -0.5, -1])
  const b1 = pickRandom([-2, -1, 0, 1, 2])
  newLevels.push(createLevelData(a1, b1, [-1, 0, 1, 2], 1))

  // Level 2: negative rico possible, wider range
  const a2 = pickRandom([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2])
  const b2 = pickRandom([-4, -3, -2, -1, 0, 1, 2, 3, 4])
  newLevels.push(createLevelData(a2, b2, [-2, 0, 2, 4], 2))

  // Level 3: x=0 not in table, must calculate b
  const a3 = pickRandom([-3, -2.5, -2, -1.5, 1.5, 2, 2.5, 3])
  const b3 = pickRandom([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  newLevels.push(createLevelData(a3, b3, [2, 4, 6, 8], 3))

  levels.value = newLevels
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createLevelData(a, b, xValues, level) {
  const table = xValues.map(x => ({ x, y: a * x + b }))
  const goalText = level === 1
    ? 'Opdracht 1: Maak de rechte die bij deze tabel hoort.'
    : level === 2
      ? 'Opdracht 2: Let op, de rechte daalt nu!'
      : 'Opdracht 3: De y-as snijding (x=0) staat niét in de tabel! Je moet b berekenen of aflezen.'
  return {
    goalText,
    targetA: a,
    targetB: b,
    table,
    hintA: 'De rico (a) klopt nog niet. Kijk naar de tabel: hoeveel stijgt y als x met 1 toeneemt?',
    hintB: 'Het snijpunt met de y-as (b) klopt niet. Waar snijdt de rode stip de y-as (x=0)?'
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State
const a = ref(1)
const b = ref(0)

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Pas a (helling) en b (hoogte) aan om de grafiek te fitten.' };
  a.value = 1;
  b.value = 0;
  attemptCount.value = 0;
}

// Auto-correct when sliders match target
watch([a, b], () => {
  if (isCorrect.value) return
  const target = currentLevelData.value
  if (a.value === target.targetA && b.value === target.targetB) {
    isCorrect.value = true
    isChecked.value = true
    feedback.value = {
      type: 'success',
      text: 'Juist! Je hebt het wiskundige verband tussen de tabel (punten) en de grafiek (lijn) perfect omgezet in een formule.'
    }
  }
})

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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">

              <div class="text-center bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                <p class="font-mono text-2xl font-black text-indigo-600">
                  f(x) = <span class="text-rose-500">{{ a }}</span>x {{ b >= 0 ? '+ ' + b : '- ' + Math.abs(b) }}
                </p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Richtingscoëfficiënt (a): <span class="text-rose-600 font-mono">{{ a }}</span></label>
                <input type="range" v-model.number="a" min="-4" max="4" step="0.5" class="w-full accent-rose-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Y-as snijpunt (b): <span class="text-blue-600 font-mono">{{ b }}</span></label>
                <input type="range" v-model.number="b" min="-6" max="6" step="1" class="w-full accent-blue-600">
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

              <button v-if="!isCorrect" @click="resetActivityState" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
                Probeer opnieuw
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

            <div class="relative flex-1 flex flex-col md:flex-row items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <!-- The Table -->
              <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-center z-10 w-48 shrink-0">
                <div class="flex bg-slate-800 text-white font-bold text-lg">
                  <div class="flex-1 p-3 border-r border-slate-600">x</div>
                  <div class="flex-1 p-3">y</div>
                </div>
                <div v-for="row in currentLevelData.table" :key="row.x" class="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div class="flex-1 p-3 border-r border-slate-200 font-mono font-bold">{{ row.x }}</div>
                  <div class="flex-1 p-3 font-mono font-bold text-rose-500">{{ row.y }}</div>
                </div>
              </div>

              <!-- Coordinate System SVG -->
              <svg width="400" height="400" viewBox="-8 -8 16 16" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10 shrink-0">
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="0.1">
                  <line v-for="i in 17" :key="'v'+i" :x1="i-9" y1="-8" :x2="i-9" y2="8" />
                  <line v-for="i in 17" :key="'h'+i" x1="-8" :y1="i-9" x2="8" :y2="i-9" />
                </g>

                <!-- Axes -->
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748b" stroke-width="0.2" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" stroke-width="0.2" />

                <!-- The User's Graph of f(x) = ax + b -->
                <line x1="-8" :y1="-(a * -8 + b)" x2="8" :y2="-(a * 8 + b)" stroke="#4f46e5" stroke-width="0.3" stroke-linecap="round" class="transition-all duration-300" />

                <!-- Target Points from table -->
                <circle v-for="row in currentLevelData.table" :key="'pt-'+row.x"
                        :cx="row.x" :cy="-row.y" r="0.3" fill="#f43f5e" class="shadow-sm" />

              </svg>

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