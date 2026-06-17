<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMathOperations,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Rekenen met Vectoren'
  },
  instruction: {
    type: String,
    default: 'Teken (sleep) een vector op het rooster die exact de gevraagde norm (lengte) en richting heeft!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Grid logic
const gridSize = 25; // px per unit
const originX = 150; // px
const originY = 250; // px

// Scenarios
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: Pythagorean triple in Q1 (both positive)
  const pythTriples = [[3,4,5], [6,8,10], [5,12,13], [9,12,15]]
  const t1 = pythTriples[Math.floor(Math.random() * pythTriples.length)]
  const t1x = t1[0]
  const t1y = t1[1]
  newLevels.push({
    goalText: `Opdracht 1: Teken een vector in het eerste kwadrant (rechtsboven) met een norm ||v|| = ${t1[2]}.`,
    validate: (x, y) => x > 0 && y > 0 && Math.sqrt(x*x + y*y) === t1[2],
    hint: `Denk aan de stelling van Pythagoras. Welke twee gehele getallen geven a² + b² = ${t1[2] * t1[2]}?`,
    target: { x: t1x, y: t1y }
  })

  // Level 2: Pythagorean triple scaled, with negative x
  const t2 = pythTriples[Math.floor(Math.random() * pythTriples.length)]
  const t2x = -t2[0]
  const t2y = t2[1]
  newLevels.push({
    goalText: `Opdracht 2: Teken een vector met norm ||v|| = ${t2[2]}, waarbij de x-coördinaat negatief is.`,
    validate: (x, y) => x < 0 && Math.sqrt(x*x + y*y) === t2[2],
    hint: `De vector moet naar links wijzen. Welke bekende rechthoekige driehoek (a² + b² = ${t2[2] * t2[2]}) kun je gebruiken?`,
    target: { x: t2x, y: t2y }
  })

  // Level 3: vertical unit vector downward
  newLevels.push({
    goalText: `Opdracht 3: Teken de kortst mogelijke vector (norm = 1) die zuiver over de y-as omlaag loopt.`,
    validate: (x, y) => x === 0 && y === -1,
    hint: 'Zuiver omlaag betekent dat hij op de verticale as ligt, onder de oorsprong.',
    target: { x: 0, y: -1 }
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userPoint = ref(null)

const userNorm = computed(() => {
  if (!userPoint.value) return 0;
  return Math.sqrt(userPoint.value.x * userPoint.value.x + userPoint.value.y * userPoint.value.y);
})

function handleGridClick(e) {
  if (isCorrect.value) return;

  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  let gridX = Math.round((clickX - originX) / gridSize)
  let gridY = Math.round((originY - clickY) / gridSize)

  gridX = Math.max(-5, Math.min(gridX, 8))
  gridY = Math.max(-5, Math.min(gridY, 8))

  userPoint.value = { x: gridX, y: gridY }
  isChecked.value = false

  // Auto-correct: check immediately
  const target = currentLevelData.value.target
  if (currentLevelData.value.validate(gridX, gridY)) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! Jouw vector (${gridX}, ${gridY}) voldoet helemaal. De norm is √( ${gridX}² + ${gridY}² ) = ${Math.sqrt(gridX*gridX + gridY*gridY)}.`
    }
  } else {
    attemptCount.value++
    if (attemptCount.value === 1) {
      feedback.value = {
        type: 'error',
        text: `Niet helemaal. Jouw vector heeft een norm van √(${gridX}² + ${gridY}²) = ${Math.sqrt(gridX*gridX + gridY*gridY) % 1 === 0 ? Math.sqrt(gridX*gridX + gridY*gridY) : Math.sqrt(gridX*gridX + gridY*gridY).toFixed(2)}. ${currentLevelData.value.hint}`
      }
    } else if (attemptCount.value === 2) {
      if (gridX > 0 && gridY > 0) {
        feedback.value = { type: 'error', text: `Probeer een andere combinatie. Het juiste antwoord heeft coördinaten in de buurt van (${target.x}, ${target.y}).` }
      } else if (gridX === target.x) {
        feedback.value = { type: 'error', text: `Je x-coördinaat klopt! Maar y moet ${target.y} zijn.` }
      } else if (gridY === target.y) {
        feedback.value = { type: 'error', text: `Je y-coördinaat klopt! Maar x moet ${target.x} zijn.` }
      } else {
        feedback.value = { type: 'error', text: `Hint: het juiste antwoord is (${target.x}, ${target.y}). ` + currentLevelData.value.hint }
      }
    } else {
      feedback.value = { type: 'error', text: `Het juiste antwoord is (${target.x}, ${target.y}).` }
    }
  }
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Klik op het raster om je vector (startend vanuit oorsprong) te tekenen.' };
  userPoint.value = null;
  attemptCount.value = 0;
  generateLevel();
}

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
    generateLevel();
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

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner space-y-4 text-center">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">Jouw Vector</p>
              <div v-if="userPoint" class="font-mono text-2xl font-black text-math-blue">
                v = ({{ userPoint.x }}, {{ userPoint.y }})
              </div>
              <div v-else class="font-mono text-2xl font-black text-slate-300">
                v = (?, ?)
              </div>

              <div class="h-px bg-slate-200 w-full my-2"></div>

              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Huidige Norm (Lengte)</p>
              <div v-if="userPoint" class="font-mono text-xl font-bold text-slate-700">
                ||v|| = {{ userNorm % 1 === 0 ? userNorm : userNorm.toFixed(2) }}
              </div>
              <div v-else class="font-mono text-xl font-bold text-slate-300">
                ||v|| = ?
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

              <!-- Auto-correct: no Controleer button needed -->
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-else disabled class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-70">
                Klik op het raster
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair"
                   style="width: 400px; height: 400px;"
                   @click="handleGridClick">

                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <rect width="25" height="25" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                    </pattern>
                    <marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
                    </marker>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <!-- Axes (Origin at 150, 250) -->
                  <line x1="150" y1="0" x2="150" y2="400" stroke="#94a3b8" stroke-width="2" />
                  <line x1="0" y1="250" x2="400" y2="250" stroke="#94a3b8" stroke-width="2" />

                  <!-- Pythagoras Components Preview -->
                  <g v-if="userPoint" opacity="0.4">
                    <line :x1="originX" :y1="originY" :x2="originX + userPoint.x * gridSize" :y2="originY" stroke="#64748b" stroke-width="2" stroke-dasharray="4,2" />
                    <line :x1="originX + userPoint.x * gridSize" :y1="originY" :x2="originX + userPoint.x * gridSize" :y2="originY - userPoint.y * gridSize" stroke="#64748b" stroke-width="2" stroke-dasharray="4,2" />
                    <text :x="originX + (userPoint.x * gridSize)/2" :y="originY + 15" fill="#64748b" font-weight="bold" font-size="12" text-anchor="middle">{{ userPoint.x }}</text>
                    <text :x="originX + userPoint.x * gridSize + 10" :y="originY - (userPoint.y * gridSize)/2" fill="#64748b" font-weight="bold" font-size="12">{{ userPoint.y }}</text>
                  </g>

                  <!-- User Vector -->
                  <line v-if="userPoint"
                        :x1="originX" :y1="originY"
                        :x2="originX + userPoint.x * gridSize" :y2="originY - userPoint.y * gridSize"
                        stroke="#4f46e5" stroke-width="4" marker-end="url(#arrow-indigo)" class="transition-all duration-150 shadow-md" />

                  <circle v-if="userPoint"
                          :cx="originX + userPoint.x * gridSize" :cy="originY - userPoint.y * gridSize"
                          r="5" fill="#4f46e5" stroke="white" stroke-width="2" class="transition-all duration-150" />
                </svg>

              </div>

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
