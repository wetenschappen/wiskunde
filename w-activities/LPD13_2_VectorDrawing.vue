<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhArrowUpRight,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Vectoren Tekenen'
  },
  instruction: {
    type: String,
    default: 'Lees de vector-opdracht en klik op het assenstelsel om het eindpunt van de resulterende vector aan te duiden (startend vanuit de oorsprong).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhArrowUpRight }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Grid settings
const gridSize = 30; // px per unit
const originX = 150; // px from left
const originY = 250; // px from top

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []
  // Level 1: sum (a + b)
  const a1x = Math.floor(Math.random() * 3) + 1 // 1-3
  const a1y = Math.floor(Math.random() * 3) + 1 // 1-3
  const b1x = Math.floor(Math.random() * 3) + 2 // 2-4
  const b1y = Math.floor(Math.random() * 3) + 1 // 1-3
  newLevels.push({
    goalText: `Opdracht 1: Teken de SOM-vector (v = a + b).`,
    vecA: { x: a1x, y: a1y },
    vecB: { x: b1x, y: b1y },
    op: 'a + b',
    target: { x: a1x + b1x, y: a1y + b1y }
  })

  // Level 2: difference (a - b)
  const a2x = Math.floor(Math.random() * 4) + 3 // 3-6
  const a2y = Math.floor(Math.random() * 4) + 2 // 2-5
  const b2x = Math.floor(Math.random() * 3) + 1 // 1-3
  const b2y = Math.floor(Math.random() * 3) + 1 // 1-3
  newLevels.push({
    goalText: `Opdracht 2: Teken de VERSCHIL-vector (v = a - b).`,
    vecA: { x: a2x, y: a2y },
    vecB: { x: b2x, y: b2y },
    op: 'a - b',
    target: { x: a2x - b2x, y: a2y - b2y }
  })

  // Level 3: scalar multiplication
  const a3x = Math.floor(Math.random() * 4) - 1 // -1 to 2
  const a3y = Math.floor(Math.random() * 4) - 1 // -1 to 2
  if (a3x === 0 && a3y === 0) { a3x = 1; a3y = 1 }
  const scalar = [-2, -1, 2, 3][Math.floor(Math.random() * 4)]
  const sf = scalar
  newLevels.push({
    goalText: `Opdracht 3: Teken de SCALAIRE vermenigvuldiging (v = ${scalar > 0 ? '' : '-'}${Math.abs(scalar)}a).`,
    vecA: { x: a3x, y: a3y },
    vecB: null,
    op: `${scalar}a`,
    target: { x: sf * a3x, y: sf * a3y }
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userPoint = ref(null) // {x, y} in grid units

function handleGridClick(e) {
  if (isCorrect.value) return;

  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  // Convert px to grid coordinates
  let gridX = Math.round((clickX - originX) / gridSize)
  let gridY = Math.round((originY - clickY) / gridSize)

  // Clamp to sensible values (-5 to 8)
  gridX = Math.max(-5, Math.min(gridX, 8))
  gridY = Math.max(-5, Math.min(gridY, 8))

  userPoint.value = { x: gridX, y: gridY }
  isChecked.value = false

  // Auto-correct: check on correct click
  const target = currentLevelData.value.target
  if (gridX === target.x && gridY === target.y) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! De resulterende vector ligt inderdaad op (${target.x}, ${target.y}).`
    }
  } else {
    // Give immediate feedback on wrong click
    attemptCount.value++
    if (gridX !== target.x && gridY === target.y) {
      feedback.value = { type: 'error', text: `Je hoogte (y) klopt perfect, maar je horizontale positie is verkeerd. Je koos x=${gridX}. Herbereken de x-waarden.` }
    } else if (gridX === target.x && gridY !== target.y) {
      feedback.value = { type: 'error', text: `Je breedte (x) klopt perfect, maar je verticale positie is verkeerd. Je koos y=${gridY}. Herbereken de y-waarden.` }
    } else {
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `Zowel je x- als y-coördinaat kloppen niet. Je tekende (${gridX}, ${gridY}). Pas de wiskundige bewerking (${currentLevelData.value.op}) toe op de componenten.` }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: `Bewerking: ${currentLevelData.value.op}. a = (${currentLevelData.value.vecA.x}, ${currentLevelData.value.vecA.y})${currentLevelData.value.vecB ? `, b = (${currentLevelData.value.vecB.x}, ${currentLevelData.value.vecB.y})` : ''}. Reken de componenten apart uit.` }
      } else {
        feedback.value = { type: 'error', text: `Het juiste antwoord is (${target.x}, ${target.y}). Werk stap voor stap: pas de bewerking toe op x en y apart.` }
      }
    }
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Klik op het raster om je antwoord te markeren.' };
  userPoint.value = null;
  attemptCount.value = 0;
  generateLevel();
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
    generateLevel();
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-sky-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-sky-500' : 'bg-slate-200'"></div>
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>

            <div class="p-5 border border-sky-200 bg-sky-50 rounded-xl mb-6 text-center animate-fadeIn shadow-sm">
              <p class="font-bold text-sky-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Gegeven Vectoren:</p>
              <ul class="text-lg font-mono font-bold text-slate-700 space-y-3">
                <li class="flex items-center gap-2">
                  <span class="inline-block w-4 h-4 bg-blue-500 rounded-sm"></span>
                  a = ({{ currentLevelData.vecA.x }}, {{ currentLevelData.vecA.y }})
                </li>
                <li v-if="currentLevelData.vecB" class="flex items-center gap-2">
                  <span class="inline-block w-4 h-4 bg-emerald-500 rounded-sm"></span>
                  b = ({{ currentLevelData.vecB.x }}, {{ currentLevelData.vecB.y }})
                </li>

                <li class="pt-4 mt-2 border-t-2 border-dashed border-slate-300"></li>

                <li v-if="userPoint" class="flex items-center gap-2 text-sky-600">
                  <span class="inline-block w-4 h-4 bg-sky-500 rounded-sm"></span>
                  v = ({{ userPoint.x }}, {{ userPoint.y }})
                </li>
                <li v-else class="flex items-center gap-2 text-slate-400">
                  <span class="inline-block w-4 h-4 border-2 border-dashed border-slate-400 rounded-sm"></span>
                  v = (?, ?)
                </li>
              </ul>
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
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Auto-correct: no Controleer button needed; click on grid is the answer -->
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-else disabled class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-70">
                Klik op het raster
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid">

              <div class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair"
                   style="width: 400px; height: 400px;"
                   @click="handleGridClick">

                <!-- Grid Background & Coordinate System -->
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <rect width="30" height="30" fill="none" stroke="#e2e8f0" stroke-width="1"/>
                    </pattern>
                    <!-- Markers -->
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                    </marker>
                    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                    <marker id="arrow-sky" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0ea5e9" />
                    </marker>
                  </defs>

                  <!-- Grid -->
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <!-- Axes (Origin at 150, 250) -->
                  <line x1="150" y1="0" x2="150" y2="400" stroke="#94a3b8" stroke-width="2" />
                  <line x1="0" y1="250" x2="400" y2="250" stroke="#94a3b8" stroke-width="2" />

                  <!-- Vector a (Always drawn from origin) -->
                  <line :x1="originX" :y1="originY"
                        :x2="originX + currentLevelData.vecA.x * gridSize" :y2="originY - currentLevelData.vecA.y * gridSize"
                        stroke="#3b82f6" stroke-width="4" marker-end="url(#arrow-blue)" class="transition-all duration-300" />

                  <!-- Vector b (Always drawn from origin, if exists) -->
                  <line v-if="currentLevelData.vecB" :x1="originX" :y1="originY"
                        :x2="originX + currentLevelData.vecB.x * gridSize" :y2="originY - currentLevelData.vecB.y * gridSize"
                        stroke="#10b981" stroke-width="4" marker-end="url(#arrow-emerald)" class="transition-all duration-300" />

                  <!-- User Target Vector -->
                  <line v-if="userPoint"
                        :x1="originX" :y1="originY"
                        :x2="originX + userPoint.x * gridSize" :y2="originY - userPoint.y * gridSize"
                        stroke="#0ea5e9" stroke-width="5" marker-end="url(#arrow-sky)" class="transition-all duration-150 shadow-md" />

                  <circle v-if="userPoint"
                          :cx="originX + userPoint.x * gridSize" :cy="originY - userPoint.y * gridSize"
                          r="5" fill="#0ea5e9" stroke="white" stroke-width="2" class="transition-all duration-150" />
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