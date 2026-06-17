<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhVectorPattern, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: Dynamische Meetkunde' },
  instruction: {
    type: String,
    default: 'Sleep de blauwe hoekpunten om de driehoek aan te passen. Voldoe aan de opdracht!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhVectorPattern }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Sleep de blauwe bolletjes om te beginnen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel(index) {
  switch (index) {
    case 0: {
      const threshold = 90 + Math.floor(Math.random() * 5) + 1 // 91 to 96
      return {
        goalText: 'Opdracht 1: Maak een stomphoekige driehoek.',
        targetRule: (angles) => Math.max(...angles) > threshold,
        threshold,
        hint: `Eén van de hoeken moet groter dan ${threshold}° zijn.`
      }
    }
    case 1: {
      const tolerance = Math.random() * 1 + 0.8 // 0.8 to 1.8
      return {
        goalText: 'Opdracht 2: Maak een rechthoekige driehoek.',
        targetRule: (angles) => angles.some(a => Math.abs(a - 90) < tolerance),
        tolerance,
        hint: `Eén van de hoeken moet exact (of heel dichtbij) 90° zijn (binnen ${tolerance.toFixed(1)}°).`
      }
    }
    case 2: {
      const maxAngle = 90 - Math.floor(Math.random() * 3) - 1 // 86 to 89
      return {
        goalText: 'Opdracht 3: Maak een scherphoekige driehoek.',
        targetRule: (angles) => Math.max(...angles) < maxAngle,
        maxAngle,
        hint: `ALLE drie de hoeken moeten kleiner dan ${maxAngle}° zijn.`
      }
    }
    default:
      return { goalText: 'Opdracht 1: Maak een stomphoekige driehoek.', targetRule: (angles) => Math.max(...angles) > 90.5, hint: 'Eén hoek > 90°.' }
  }
}

const levels = ref([
  generateLevel(0),
  generateLevel(1),
  generateLevel(2)
])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic: Dynamic Geometry
const svgWidth = 600
const svgHeight = 400

const pA = ref({ x: 200, y: 300 })
const pB = ref({ x: 400, y: 300 })
const pC = ref({ x: 300, y: 100 })

const draggingPoint = ref(null)

function startDrag(pointName) { draggingPoint.value = pointName; isChecked.value = false; }
function endDrag() {
  draggingPoint.value = null
  // Auto-check on drag end
  if (!isCorrect.value) {
    const angles = [angleA.value, angleB.value, angleC.value];
    const passed = currentLevelData.value.targetRule(angles);
    if (passed) {
      isCorrect.value = true
      isChecked.value = true
      attemptCount.value = 0
      feedback.value = {
        type: 'success',
        text: `Goed zo! De hoeken zijn: ${angleA.value.toFixed(1)}°, ${angleB.value.toFixed(1)}°, en ${angleC.value.toFixed(1)}°. De som is prachtig ${angleSum.value}°!`
      }
    } else {
      attemptCount.value++
      const hintIdx = Math.min(attemptCount.value - 1, 2)
      const hints = [
        `Dat is niet de gevraagde driehoek. ${currentLevelData.value.hint}`,
        `Bijna! Kijk naar de hoekwaarden links. ${currentLevelData.value.hint}`,
        `Probeer een hoekpunt naar een specifieke positie te slepen. Hint: gebruik een rechte hoek als referentie.`
      ]
      feedback.value = { type: 'error', text: hints[hintIdx] }
    }
  }
}
function onDrag(e) {
    if (!draggingPoint.value) return;
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(20, Math.min(svgWidth - 20, e.clientX - rect.left))
    const y = Math.max(20, Math.min(svgHeight - 20, e.clientY - rect.top))

    if (draggingPoint.value === 'A') { pA.value = { x, y } }
    if (draggingPoint.value === 'B') { pB.value = { x, y } }
    if (draggingPoint.value === 'C') { pC.value = { x, y } }
}

// Math logic to calculate angles
function calculateAngle(p1, p2, p3) {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y)
    const mag2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y)
    if (mag1 === 0 || mag2 === 0) return 0;
    let cosTheta = dot / (mag1 * mag2)
    cosTheta = Math.max(-1, Math.min(1, cosTheta))
    return Math.acos(cosTheta) * (180 / Math.PI)
}

const angleA = computed(() => calculateAngle(pB.value, pA.value, pC.value))
const angleB = computed(() => calculateAngle(pA.value, pB.value, pC.value))
const angleC = computed(() => calculateAngle(pA.value, pC.value, pB.value))
const angleSum = computed(() => Math.round(angleA.value + angleB.value + angleC.value))

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Sleep de blauwe bolletjes om te beginnen.' };

    // Give a generic non-matching starting shape based on level
    if (currentInternalLevel.value === 0) {
        pA.value = { x: 200, y: 300 }; pB.value = { x: 400, y: 300 }; pC.value = { x: 300, y: 100 };
    } else if (currentInternalLevel.value === 1) {
        pA.value = { x: 250, y: 300 }; pB.value = { x: 350, y: 300 }; pC.value = { x: 100, y: 250 };
    } else {
        pA.value = { x: 200, y: 300 }; pB.value = { x: 400, y: 300 }; pC.value = { x: 200, y: 100 };
    }

    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ];
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

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800"
     @mouseup="endDrag" @mouseleave="endDrag">
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
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

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">Dynamische Metingen</h4>
               <ul class="space-y-2 text-sm font-mono">
                   <li class="flex justify-between" :class="currentInternalLevel === 0 && angleA > 90 ? 'text-math-blue font-bold' : (currentInternalLevel === 1 && Math.abs(angleA-90) < 1.5 ? 'text-emerald-600 font-bold' : 'text-slate-600')"><span>∠A:</span> <span>{{ angleA.toFixed(1) }}°</span></li>
                   <li class="flex justify-between" :class="currentInternalLevel === 0 && angleB > 90 ? 'text-math-blue font-bold' : (currentInternalLevel === 1 && Math.abs(angleB-90) < 1.5 ? 'text-emerald-600 font-bold' : 'text-slate-600')"><span>∠B:</span> <span>{{ angleB.toFixed(1) }}°</span></li>
                   <li class="flex justify-between" :class="currentInternalLevel === 0 && angleC > 90 ? 'text-math-blue font-bold' : (currentInternalLevel === 1 && Math.abs(angleC-90) < 1.5 ? 'text-emerald-600 font-bold' : 'text-slate-600')"><span>∠C:</span> <span>{{ angleC.toFixed(1) }}°</span></li>
                   <li class="flex justify-between border-t border-slate-300 pt-2 mt-2 font-bold text-slate-800">
                       <span>Som:</span> <span>{{ angleSum }}°</span>
                   </li>
               </ul>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <div v-if="!isCorrect" class="flex-1 py-4 text-center text-sm font-medium text-slate-400">Sleep de blauwe punten tot de conditie klopt</div>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- SVG Canvas for Interactive Geometry -->
              <svg :width="svgWidth" :height="svgHeight"
                   class="bg-white rounded-xl shadow-md border-2 border-slate-200 touch-none select-none transition-colors"
                   :class="isCorrect ? 'border-emerald-400 bg-emerald-50' : ''"
                   @mousemove="onDrag" @touchmove.prevent="onDrag">

                   <!-- The Triangle Polygon -->
                   <polygon :points="`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`"
                            :fill="isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)'"
                            :stroke="isCorrect ? '#10b981' : '#6366f1'" stroke-width="3" stroke-linejoin="round" class="transition-colors" />

                   <!-- Points -->
                   <g>
                       <!-- Point A -->
                       <circle :cx="pA.x" :cy="pA.y" r="12" fill="#4f46e5" class="cursor-pointer hover:fill-indigo-400 transition-colors"
                               @mousedown="startDrag('A')" @touchstart.prevent="startDrag('A')" />
                       <text :x="pA.x - 20" :y="pA.y + 20" font-family="monospace" font-weight="bold" fill="#334155">A</text>

                       <!-- Point B -->
                       <circle :cx="pB.x" :cy="pB.y" r="12" fill="#4f46e5" class="cursor-pointer hover:fill-indigo-400 transition-colors"
                               @mousedown="startDrag('B')" @touchstart.prevent="startDrag('B')" />
                       <text :x="pB.x + 10" :y="pB.y + 20" font-family="monospace" font-weight="bold" fill="#334155">B</text>

                       <!-- Point C -->
                       <circle :cx="pC.x" :cy="pC.y" r="12" fill="#4f46e5" class="cursor-pointer hover:fill-indigo-400 transition-colors"
                               @mousedown="startDrag('C')" @touchstart.prevent="startDrag('C')" />
                       <text :x="pC.x + 10" :y="pC.y - 10" font-family="monospace" font-weight="bold" fill="#334155">C</text>
                   </g>
              </svg>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
