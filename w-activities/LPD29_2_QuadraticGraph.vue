<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhWaveCurve,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Grafiek van een Tweedegraadsfunctie'
  },
  instruction: {
    type: String,
    default: 'Pas de parameters a, p en q aan zodat de rode parabool exact over de stippellijn valt. Let op: het doel verandert per level!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhWaveCurve }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels and Dynamic State
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const attemptCount = ref(0)

const valA = ref(1)
const valP = ref(0)
const valQ = ref(0)

// Randomizers for different difficulty levels
const levelGenerators = [
  // Level 1: Translation only (a = 1)
  () => {
    let p = Math.floor(Math.random() * 7) - 3; // -3 to 3
    let q = Math.floor(Math.random() * 7) - 3;
    if (p === 0 && q === 0) p = 2;
    return { a: 1, p, q };
  },
  // Level 2: Reflection and translation (a = 2 or -2)
  () => {
    let a = Math.random() > 0.5 ? 2 : -2;
    let p = Math.floor(Math.random() * 7) - 3;
    let q = Math.floor(Math.random() * 7) - 3;
    return { a, p, q };
  },
  // Level 3: Scaling, reflection, and translation (a is decimal)
  () => {
    let aOptions = [-1.5, -0.5, 0.5, 1.5];
    let a = aOptions[Math.floor(Math.random() * aOptions.length)];
    let p = Math.floor(Math.random() * 9) - 4; // -4 to 4
    let q = Math.floor(Math.random() * 9) - 4;
    return { a, p, q };
  }
]

function generateLevel() {
  levels.value = levelGenerators.map(gen => gen())
}

const target = computed(() => levels.value[currentInternalLevel.value] || { a: 1, p: 0, q: 0 })

const graphPathTarget = computed(() => generateParabolaPath(target.value.a, target.value.p, target.value.q))
const graphPathUser = computed(() => generateParabolaPath(valA.value, valP.value, valQ.value))

function generateParabolaPath(a, p, q) {
  const points = [];
  for (let x = -10; x <= 10; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q;
    if (y < -12 || y > 12) continue;
    const svgX = x * 15;
    const svgY = -y * 15;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
}

function getHintText(count, t) {
  if (count <= 3) {
    return `Hint: de top van de parabool is (${t.p}, ${t.q}). Pas p (horizontaal) en q (verticaal) aan.`
  } else if (count <= 6) {
    return `Hint: de a-waarde bepaalt de vorm. Voor a=${t.a} is de parabool ${t.a > 0 ? 'open naar boven' : 'open naar beneden'}${Math.abs(t.a) !== 1 ? ' met factor ' + Math.abs(t.a) : ''}.`
  } else {
    return `Doel: a=${t.a}, p=${t.p}, q=${t.q}. Stel deze exact in.`
  }
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Stel de parameters in om de parabool te verplaatsen en vervormen.' }
  valA.value = 1
  valP.value = 0
  valQ.value = 0
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

// Auto-correct on slider match with debounced hint
let sliderTimer = null

watch([valA, valP, valQ], () => {
  const t = target.value
  if (valA.value === t.a && valP.value === t.p && valQ.value === t.q) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Briljant! De parabool dekt het doelwit perfect af. f(x) = ${t.a === 1 ? '' : (t.a === -1 ? '-' : t.a)}(x ${t.p >= 0 ? '- ' + t.p : '+ ' + Math.abs(t.p)})² ${t.q >= 0 ? '+ ' + t.q : '- ' + Math.abs(t.q)}`
    }
    clearTimeout(sliderTimer)
    return
  }
  isCorrect.value = false
  attemptCount.value++

  clearTimeout(sliderTimer)
  sliderTimer = setTimeout(() => {
    if (!isCorrect.value) {
      feedback.value = {
        type: 'error',
        text: getHintText(attemptCount.value, t)
      }
    }
  }, 1200)
})

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    generateLevel();
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-rose-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-rose-500' : 'bg-slate-200'"></div>
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

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <div class="text-center bg-white p-4 border border-slate-200 rounded shadow-sm">
                <p class="font-mono text-xl font-black text-rose-600">
                  f(x) = {{ valA === 1 ? '' : (valA === -1 ? '-' : valA) }}(x {{ valP >= 0 ? '- ' + valP : '+ ' + Math.abs(valP) }})² {{ valQ >= 0 ? '+ ' + valQ : '- ' + Math.abs(valQ) }}
                </p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter a: {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-rose-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter p: {{ valP }}</label>
                <input type="range" v-model.number="valP" min="-5" max="5" step="1" class="w-full accent-blue-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter q: {{ valQ }}</label>
                <input type="range" v-model.number="valQ" min="-5" max="5" step="1" class="w-full accent-emerald-600">
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

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
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
              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*15" y1="-150" :x2="(i-11)*15" y2="150" />
                  <line v-for="i in 21" :key="'h'+i" x1="-150" :y1="(i-11)*15" x2="150" :y2="(i-11)*15" />
                </g>

                <!-- Axes -->
                <line x1="-150" y1="0" x2="150" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-150" x2="0" y2="150" stroke="#64748b" stroke-width="2" />

                <!-- Target Graph (dashed) -->
                <path :d="graphPathTarget" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="8,4" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />

                <!-- User Graph -->
                <path v-if="valA !== 0" :d="graphPathUser" fill="none" stroke="#e11d48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-150" />

                <!-- User Vertex Dot -->
                <circle :cx="valP * 15" :cy="-valQ * 15" r="5" fill="#1e293b" class="transition-all duration-150 shadow-sm" />

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
