<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhSwap,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Verwante Hoeken'
  },
  instruction: {
    type: String,
    default: 'Draai hoek B naar de juiste positie op de eenheidscirkel om de symmetrie met hoek α te ontdekken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSwap }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])
const baseAngle = ref(40) // Will be randomized by generateLevel

function generateLevel() {
  // Randomize base angle (between 20 and 50, step 5)
  const base = (20 + Math.floor(Math.random() * 7) * 5) // 20, 25, 30, 35, 40, 45, 50

  // Level targets derived from base angle
  const target1 = 360 - base // opposite (-α)
  const target2 = 180 - base  // supplementary (180° - α)
  const target3 = 180 + base  // anti-supplementary (180° + α)

  baseAngle.value = base

  levels.value = [
    {
      name: 'Tegengestelde Hoek (-α)',
      goalText: `Opdracht 1: Draai hoek B naar de tegengestelde hoek (-α).`,
      targetAngle: target1,
      validate: (a) => a === target1,
      successText: 'Correct! De x-waarden (cosinus) blijven gelijk, maar de y-waarde (sinus) draait om van teken!',
      hints: [
        'De tegengestelde hoek klapt de driehoek omlaag over de x-as.',
        `Als α = ${base}°, dan is de tegengestelde hoek 360° - ${base}°.`,
        `Probeer ${target1}°.`
      ]
    },
    {
      name: 'Supplementaire Hoek (180° - α)',
      goalText: `Opdracht 2: Draai hoek B naar de supplementaire hoek (180° - α).`,
      targetAngle: target2,
      validate: (a) => a === target2,
      successText: 'Juist! De y-waarden (sinus) zijn gelijk, maar de x-waarde (cosinus) is van teken gewisseld.',
      hints: [
        'Supplementair betekent dat ze samen 180° zijn. Klap de hoek over de y-as.',
        `180° - ${base}° = ?`,
        `Probeer ${target2}°.`
      ]
    },
    {
      name: 'Anti-Supplementaire Hoek (180° + α)',
      goalText: `Opdracht 3: Draai hoek B naar (180° + α).`,
      targetAngle: target3,
      validate: (a) => a === target3,
      successText: 'Perfect! Zowel de sinus als cosinus zijn nu omgewisseld van teken vergeleken met hoek α.',
      hints: [
        'Tel een halve cirkel (180°) op bij de basishoek α.',
        `180° + ${base}° = ?`,
        `Probeer ${target3}°.`
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State for Angle B
const userAngle = ref(0)

const alphaRad = computed(() => baseAngle.value * (Math.PI / 180))
const betaRad = computed(() => userAngle.value * (Math.PI / 180))

const cosAlpha = computed(() => Math.cos(alphaRad.value))
const sinAlpha = computed(() => Math.sin(alphaRad.value))

const cosBeta = computed(() => Math.cos(betaRad.value))
const sinBeta = computed(() => Math.sin(betaRad.value))

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Pas de slider aan om de juiste verwante hoek te vinden.' };
  userAngle.value = 0;
  generateLevel();
}

// Auto-correct on slider change
watch(userAngle, (newAngle) => {
  if (isCorrect.value || !currentLevelData.value) return;
  if (currentLevelData.value.validate(newAngle)) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successText
    }
  } else if (!isChecked.value && newAngle !== 0) {
    attemptCount.value++
    if (attemptCount.value >= 5) {
      const hintIdx = Math.min(Math.floor((attemptCount.value - 1) / 3), currentLevelData.value.hints.length - 1)
      feedback.value = {
        type: 'info',
        text: `Niet helemaal. ${currentLevelData.value.hints[hintIdx]}`
      }
    }
  }
})

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
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

            <div class="text-center bg-math-blue-bg p-5 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue text-lg">{{ currentLevelData.name }}</p>
              <p class="text-sm text-math-blue mt-2">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner space-y-6">

              <!-- Alpha reference -->
              <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span class="font-bold text-slate-600">Referentie hoek α</span>
                <span class="font-mono font-bold text-blue-600">{{ baseAngle }}°</span>
              </div>

              <!-- Interactive Beta slider -->
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verwante hoek B: <span class="text-math-blue font-mono text-lg">{{ userAngle }}°</span></label>
                <input type="range" v-model.number="userAngle" min="0" max="360" step="5" class="w-full accent-rose-600">
              </div>

              <!-- Live Comparison -->
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(α)</div>
                   <div class="font-mono text-sm text-blue-600">{{ sinAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(B)</div>
                   <div class="font-mono text-sm text-math-blue">{{ sinBeta.toFixed(2) }}</div>
                 </div>

                 <div class="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(α)</div>
                   <div class="font-mono text-sm text-blue-600">{{ cosAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(B)</div>
                   <div class="font-mono text-sm text-math-blue">{{ cosBeta.toFixed(2) }}</div>
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
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white rounded-full shadow-inner border-4 border-slate-200 z-10">

                <!-- Inner grid subtle -->
                <g stroke="#f1f5f9" stroke-width="1">
                  <line v-for="i in 11" :key="'v'+i" :x1="(i-6)*20" y1="-100" :x2="(i-6)*20" y2="100" />
                  <line v-for="i in 11" :key="'h'+i" x1="-100" :y1="(i-6)*20" x2="100" :y2="(i-6)*20" />
                </g>

                <!-- Axes -->
                <line x1="-130" y1="0" x2="130" y2="0" stroke="#94a3b8" stroke-width="2" />
                <line x1="0" y1="-130" x2="0" y2="130" stroke="#94a3b8" stroke-width="2" />

                <!-- Circle R=100 -->
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />

                <!-- ALPHA (Reference angle, fixed) -->
                <g opacity="0.4">
                   <!-- Radius -->
                   <line x1="0" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="3" />
                   <!-- Projection lines -->
                   <line :x1="100 * cosAlpha" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="2" stroke-dasharray="2,2" />
                   <line x1="0" :y1="-100 * sinAlpha" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="2" stroke-dasharray="2,2" />
                   <!-- Point -->
                   <circle :cx="100 * cosAlpha" :cy="-100 * sinAlpha" r="5" fill="#3b82f6" />
                   <text :x="100 * cosAlpha + 10" :y="-100 * sinAlpha - 10" font-weight="bold" fill="#3b82f6">α</text>
                </g>

                <!-- BETA (User angle, interactive) -->
                <g class="transition-all duration-100">
                   <!-- Radius -->
                   <line x1="0" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="4" stroke-linecap="round" />
                   <!-- Projection lines -->
                   <line :x1="100 * cosBeta" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,4" />
                   <line x1="0" :y1="-100 * sinBeta" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,4" />
                   <!-- Point -->
                   <circle :cx="100 * cosBeta" :cy="-100 * sinBeta" r="8" fill="#f43f5e" stroke="white" stroke-width="2" class="shadow-sm" />
                   <text :x="100 * cosBeta + 12" :y="-100 * sinBeta - 12" font-weight="bold" fill="#f43f5e">B</text>
                </g>

                <!-- Highlight Visual Alignment if Correct -->
                <g v-if="isCorrect" class="animate-fadeIn">
                   <line :x1="100 * cosAlpha" :y1="-100 * sinAlpha" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" />
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
