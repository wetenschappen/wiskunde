<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTrendUp,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Richtingscoëfficiënt'
  },
  instruction: {
    type: String,
    default: 'Pas de richtingscoëfficiënt (a) aan zodat de lijn f(x) = a·x voldoet aan de opdracht.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTrendUp }
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

  // Level 1: Positive slope matching a visible point
  const px = Math.floor(Math.random() * 4) + 1 // 1..4
  const py = Math.floor(Math.random() * 6) + 1 // 1..6
  const a1 = Math.round(py / px * 10) / 10 // Ensure clean fraction

  result.push({
    goalText: `Opdracht 1: Maak een grafiek die door het blauwe punt (${px}, ${py}) gaat.`,
    targetA: a1,
    hasPoint: true, pointX: px, pointY: py,
    hintNegative: 'Dit is een dalende rechte, maar het punt ligt in het positieve kwadrant. De grafiek moet stijgen!',
    hintTooSteep: 'De rechte is te steil, hij gaat bóven het punt door. Maak de richtingscoëfficiënt kleiner.',
    hintTooFlat: 'De rechte is niet steil genoeg, hij gaat onder het punt door. Maak de richtingscoëfficiënt groter.'
  })

  // Level 2: Negative slope
  const a2 = -(Math.floor(Math.random() * 4) + 2) // -5..-2
  const desc = Math.abs(a2)
  result.push({
    goalText: `Opdracht 2: Maak een grafiek die dalend is en voor elke 1 stap naar rechts, ${desc} stappen zakt.`,
    targetA: a2,
    hasPoint: false, pointX: 0, pointY: 0,
    hintNegative: 'Je rechte stijgt! Als hij daalt, moet de factor negatief zijn.',
    hintTooSteep: `Bijna! Hij daalt nu te veel. Kijk naar het oranje hulptriangeltje. De daling moet ${desc} zijn per stap.`,
    hintTooFlat: `Bijna! Hij daalt nu te weinig. De daling moet ${desc} zijn per stap.`
  })

  // Level 3: Horizontal (a=0) or fractional slope
  const level3Options = [
    {
      goalText: 'Opdracht 3: Maak de rechte volledig horizontaal (constante functie).',
      targetA: 0,
      hintNegative: 'De grafiek gaat nog steeds naar boven of beneden. Hij moet perfect horizontaal zijn.',
      hintTooSteep: 'De grafiek gaat nog steeds naar boven of beneden. Hij moet perfect horizontaal zijn.',
      hintTooFlat: 'De grafiek gaat nog steeds naar boven of beneden. Hij moet perfect horizontaal zijn.'
    },
    {
      goalText: 'Opdracht 3: Maak een stijgende rechte die precies door (4, 6) gaat.',
      targetA: 1.5,
      hintNegative: 'De rechte daalt, maar (4, 6) ligt boven. De rechte moet stijgen!',
      hintTooSteep: 'Te steil. Voor x=4 is de y-waarde te hoog. Probeer een kleinere a.',
      hintTooFlat: 'Te vlak. Voor x=4 is de y-waarde te laag. Probeer een grotere a.'
    }
  ]
  result.push(level3Options[Math.floor(Math.random() * level3Options.length)])

  return result
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// State
const a = ref(1)

let hintTimer = null

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  attemptCount.value = 0;
  if (hintTimer) clearTimeout(hintTimer);
  feedback.value = { type: 'info', text: 'Beweeg de slider om de grafiek te laten kantelen.' };

  // Start away from the target
  const data = currentLevelData.value
  if (!data) {
    a.value = 1
    return
  }
  if (data.targetA > 0) a.value = -3
  else if (data.targetA < 0) a.value = 3
  else a.value = 3
}

// Auto-correct when slider matches target
watch(a, (newVal) => {
  if (isCorrect.value || !currentLevelData.value) return
  if (hintTimer) clearTimeout(hintTimer)

  const targetA = currentLevelData.value.targetA

  if (newVal === targetA) {
    isCorrect.value = true
    isChecked.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Prima!! Je hebt de juiste richtingscoëfficiënt gevonden.'
    }
    return
  }

  // Show debounced hint after 2 seconds on a wrong value
  const data = currentLevelData.value
  hintTimer = setTimeout(() => {
    attemptCount.value++
    let msg
    if (Math.sign(newVal) !== Math.sign(targetA) && targetA !== 0) {
      msg = data.hintNegative
    } else if (newVal > targetA) {
      msg = data.hintTooSteep
    } else if (newVal < targetA) {
      msg = data.hintTooFlat
    } else {
      msg = 'Blijf de slider aanpassen tot de lijn door de juiste positie gaat.'
    }
    feedback.value = { type: 'error', text: msg }
  }, 2000)
})

function checkAnswer() {
  // Legacy - not used since auto-correct replaces the check button
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
  if (hintTimer) clearTimeout(hintTimer)
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

            <div class="text-center bg-math-blue-bg p-5 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">

              <div class="text-center">
                <p class="font-mono text-3xl font-black text-math-blue">f(x) = {{ a }}x</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Richtingscoëfficiënt a: <span class="text-math-blue font-mono">{{ a }}</span></label>
                <input type="range" v-model.number="a" min="-5" max="5" step="1" class="w-full accent-teal-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400 font-mono">
                  <span>-5</span><span>0</span><span>5</span>
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

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
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

              <!-- Coordinate System SVG -->
              <svg width="450" height="450" viewBox="-10 -10 20 20" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300">
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="0.1">
                  <line v-for="i in 21" :key="'v'+i" :x1="i-11" y1="-10" :x2="i-11" y2="10" />
                  <line v-for="i in 21" :key="'h'+i" x1="-10" :y1="i-11" x2="10" :y2="i-11" />
                </g>

                <!-- Axes -->
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748b" stroke-width="0.2" />
                <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748b" stroke-width="0.2" />

                <!-- The Target Point (if level has one) -->
                <g v-if="currentLevelData.hasPoint">
                   <circle :cx="currentLevelData.pointX" :cy="-currentLevelData.pointY" r="0.4" fill="#3b82f6" class="animate-pulse" />
                   <text :x="currentLevelData.pointX + 0.6" :y="-currentLevelData.pointY" font-size="0.8" font-weight="bold" fill="#3b82f6">({{ currentLevelData.pointX }}, {{ currentLevelData.pointY }})</text>
                </g>

                <!-- The Graph of f(x) = a * x -->
                <line x1="-10" :y1="10 * a" x2="10" :y2="-10 * a" stroke="#0d9488" stroke-width="0.4" stroke-linecap="round" class="transition-all duration-300" />

                <!-- Rico helper triangle (1 right, 'a' up) -->
                <path v-if="a !== 0" :d="`M 0 0 L 1 0 L 1 ${-a}`" fill="none" stroke="#f59e0b" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-300" />

                <!-- Text on helper triangle -->
                <text v-if="a !== 0" x="0.5" y="0.8" font-size="0.6" fill="#f59e0b" font-weight="bold">1</text>
                <text v-if="a > 0" x="1.4" :y="-a/2" font-size="0.6" fill="#f59e0b" font-weight="bold">+{{ a }}</text>
                <text v-if="a < 0" x="1.4" :y="-a/2" font-size="0.6" fill="#f59e0b" font-weight="bold">{{ a }}</text>

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

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
