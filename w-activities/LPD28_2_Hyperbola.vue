<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTrendDown,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Omgekeerd Evenredig (f(x) = c/x)'
  },
  instruction: {
    type: String,
    default: 'Beweeg de parameter c. Bekijk de invloed van de parameter op de hyperbool. Beantwoord daarna de specifieke vraag.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTrendDown }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider en bestudeer het effect.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Randomization helpers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(levelIndex) {
  if (levelIndex === 0) {
    return {
      goalText: 'Opdracht 1: Positief',
      q: 'Maak de hyperbool zodat de takken in kwadrant I (rechtsboven) en III (linksonder) liggen.',
      checkFn: (c) => c > 0,
      successMsg: 'Juist! Als c positief is, ligt de hyperbool in kwadrant I en III.',
      errMsg: 'Fout. De takken liggen nu in II en IV. Dit gebeurt als c negatief is. Maak c positief.',
      startC: -3,
      targetPoint: null
    }
  } else if (levelIndex === 1) {
    return {
      goalText: 'Opdracht 2: Negatief',
      q: 'Maak de hyperbool zodat de takken in kwadrant II (linksboven) en IV (rechtsonder) liggen.',
      checkFn: (c) => c < 0,
      successMsg: 'Perfect! Als c negatief is, spiegelen de takken zich naar kwadrant II en IV.',
      errMsg: 'Fout. De takken liggen nu in I en III. Maak de parameter c negatief (kleiner dan nul).',
      startC: 3,
      targetPoint: null
    }
  } else {
    const tx = randomInt(1, 4)
    const ty = randomInt(1, 4)
    const targetC = tx * ty
    return {
      goalText: 'Opdracht 3: Het Doelpunt',
      q: `Zorg dat de hyperbool EXACT door het roze stippen-punt gaat (x=${tx}, y=${ty}).`,
      checkFn: (c) => c === targetC,
      successMsg: `Geweldig! Je hebt c=${targetC} gevonden. Immers: y = c/x => ${ty} = ${targetC}/${tx}. Dat klopt!`,
      errMsg: `Nog niet! Kijk of de roze curve exact door de roze stip loopt (x=${tx}, y=${ty}). Vul (${tx},${ty}) eens in de formule in: ${ty} = c / ${tx}. Wat moet c dan zijn?`,
      startC: 1,
      targetPoint: { x: tx, y: ty }
    }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// State
const cValue = ref(1)

// Calculate path data for SVG
const graphPath = computed(() => {
  const points1 = [];
  const points2 = [];
  const c = cValue.value;
  if(c === 0) return '';

  for (let x = -10; x <= 10; x += 0.2) {
    if (Math.abs(x) < 0.1) continue; // Avoid 0
    let y = c / x;
    if (Math.abs(y) > 10) continue; // Clip to viewBox

    // SVG coordinates: Center is (0,0), scale factor 10. Y is inverted.
    const svgX = x * 10;
    const svgY = -y * 10;

    if (x < 0) {
      points1.push(`${svgX},${svgY}`);
    } else {
      points2.push(`${svgX},${svgY}`);
    }
  }

  if(points1.length === 0 || points2.length === 0) return '';
  return `M ${points1.join(' L ')} M ${points2.join(' L ')}`;
})

// Auto-correct via slider change watch
watch(cValue, (newVal) => {
  if (!isCorrect.value && levels.value.length > 0) {
    const target = currentLevelData.value
    if (target.checkFn(newVal)) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: target.successMsg }
    }
  }
})

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Beweeg de slider en bestudeer het effect.' };
  attemptCount.value = 0;
  if (levels.value.length === 0) {
    levels.value = [0, 1, 2].map(i => generateLevel(i))
  }
  cValue.value = currentLevelData.value ? currentLevelData.value.startC : 1
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    levels.value = [0, 1, 2].map(i => generateLevel(i))
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
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

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
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData ? currentLevelData.goalText : '' }}</p>
            </div>

            <div class="p-6 mt-6 border-2 border-surface-200 bg-white rounded-xl shadow-inner space-y-6">

              <div class="text-center">
                <p class="font-mono text-2xl font-black text-math-blue flex items-center justify-center gap-2">
                  <span>f(x) = </span>
                  <span class="inline-flex flex-col items-center">
                    <span class="mb-0.5" :class="cValue === 0 ? 'text-red-500' : ''">{{ cValue }}</span>
                    <span class="w-8 border-t-2 border-math-blue"></span>
                    <span class="mt-0.5">x</span>
                  </span>
                </p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter c: {{ cValue }}</label>
                <input type="range" v-model.number="cValue" min="-5" max="5" step="0.5" :disabled="isCorrect" class="w-full accent-pink-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400 font-mono font-bold">
                  <span>-5</span><span>0</span><span>5</span>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-200">
                <p class="font-bold text-slate-800 text-center">{{ currentLevelData ? currentLevelData.q : '' }}</p>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-center gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Auto-correct via slider: no Controleer button -->
              <div v-if="!isCorrect" class="flex-1 py-4 font-bold text-slate-400 text-center rounded-lg shadow-md bg-slate-100 cursor-default">
                Schuif naar het juiste antwoord
              </div>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Coordinate System SVG -->
              <svg width="400" height="400" viewBox="-100 -100 200 200" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10" :key="currentInternalLevel">

                <!-- Quadrant labels background -->
                <text x="50" y="-50" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">I</text>
                <text x="-60" y="-50" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">II</text>
                <text x="-65" y="60" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">III</text>
                <text x="45" y="60" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">IV</text>

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*10" y1="-100" :x2="(i-11)*10" y2="100" />
                  <line v-for="i in 21" :key="'h'+i" x1="-100" :y1="(i-11)*10" x2="100" :y2="(i-11)*10" />
                </g>

                <!-- Axes -->
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#64748b" stroke-width="2" />

                <!-- Graph of f(x) = c / x -->
                <path v-if="cValue !== 0" :d="graphPath" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />

                <!-- Target Point for L3 -->
                <g v-if="currentLevelData && currentLevelData.targetPoint" class="animate-fadeIn">
                    <circle :cx="currentLevelData.targetPoint.x * 10" :cy="-(currentLevelData.targetPoint.y * 10)" r="4" fill="#ec4899" stroke="white" stroke-width="1" class="animate-pulse" />
                    <text :x="currentLevelData.targetPoint.x * 10 + 5" :y="-(currentLevelData.targetPoint.y * 10) - 5" font-weight="bold" fill="#ec4899" font-size="8">({{ currentLevelData.targetPoint.x }}, {{ currentLevelData.targetPoint.y }})</text>
                </g>
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #db2777;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
