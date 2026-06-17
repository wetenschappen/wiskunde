<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhNavigationArrow, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Transformaties: De Vector-Motor' },
  instruction: {
    type: String,
    default: 'Een <strong>translatie (verschuiving)</strong> wordt bestuurd door een vector. Een vector is een pijl die zegt: "Zo ver in deze richting!"<br/><br/><strong>Opdracht:</strong> Sleep de punt van de rode vectorpijl. Parkeer de blauwe vorm exact op de gestippelde doelvorm.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhNavigationArrow }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep de punt van de rode pijl (vector).' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: Horizontal-ish shift (dy near 0)
  const l1 = makeLevelCoords(
    80, 180, 380, 180,  // startX, startY, targetX, targetY (dx≈300, dy≈0)
    120, 380,            // vecOriginX, vecOriginY
    '<polygon points="0,0 60,0 30,-50" fill="currentColor" stroke="inherit" stroke-width="3" />',
    'Perfect! De vector stuurt de driehoek nu mooi horizontaal naar rechts (X is positief, Y is nul of klein).'
  )
  newLevels.push(l1)

  // Level 2: Diagonal shift
  const l2 = makeLevelCoords(
    60, 220, 320, 60,   // startX, startY, targetX, targetY (dx≈260, dy≈-160)
    180, 370,            // vecOriginX, vecOriginY
    '<rect x="0" y="-40" width="40" height="40" fill="currentColor" stroke="inherit" stroke-width="3" />',
    'Goed zo! De vector stuurde het vierkant diagonaal (X is positief, Y is negatief want je gaat omhoog).'
  )
  newLevels.push(l2)

  // Level 3: Negative shift (both dx and dy negative or mixed)
  const l3 = makeLevelCoords(
    420, 90, 90, 260,   // startX, startY, targetX, targetY (dx≈-330, dy≈170)
    370, 270,            // vecOriginX, vecOriginY
    '<polygon points="0,0 20,-40 60,-40 40,0" fill="currentColor" stroke="inherit" stroke-width="3" />',
    'Uitstekend geparkeerd! De pijl wijst naar beneden en naar links, dus zowel de X- als de Y-verschuiving hebben de juiste tekens.'
  )
  newLevels.push(l3)

  levels.value = newLevels
}

function makeLevelCoords(startX, startY, targetX, targetY, vecOriginX, vecOriginY, shapeSVG, successMsg) {
  const goalIdx = levels.value.length + 1
  const goals = [
    'Horizontale verschuiving',
    'Diagonale verschuiving',
    'Negatieve verschuiving'
  ]
  return {
    goalText: `Opdracht ${goalIdx}: ${goals[goalIdx - 1] || 'Verschuiving'}`,
    startX, startY, targetX, targetY,
    vecOriginX, vecOriginY,
    shapeSVG,
    successMsg
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const vecTipX = ref(100)
const vecTipY = ref(350)

// Calculated translation vector
const dx = computed(() => vecTipX.value - currentLevelData.value.vecOriginX)
const dy = computed(() => vecTipY.value - currentLevelData.value.vecOriginY)

// Moving Shape Position
const objX = computed(() => currentLevelData.value.startX + dx.value)
const objY = computed(() => currentLevelData.value.startY + dy.value)

let isDragging = false

function startDrag(e) {
    if (isCorrect.value) return;
    isDragging = true
    updateVector(e)
}

function onDrag(e) {
    if (!isDragging) return
    updateVector(e)
}

function endDrag() {
    isDragging = false
    checkWinCondition()
}

function updateVector(e) {
    let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    let clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0)

    const svgEl = document.getElementById('vector-svg')
    if (svgEl) {
        const rect = svgEl.getBoundingClientRect()
        vecTipX.value = Math.max(20, Math.min(580, clientX - rect.left))
        vecTipY.value = Math.max(20, Math.min(430, clientY - rect.top))
    }
}

function checkWinCondition() {
    const data = currentLevelData.value
    const dist = Math.sqrt(Math.pow(objX.value - data.targetX, 2) + Math.pow(objY.value - data.targetY, 2))

    if (dist < 15) {
        // Snap!
        vecTipX.value = data.vecOriginX + (data.targetX - data.startX)
        vecTipY.value = data.vecOriginY + (data.targetY - data.startY)
        isCorrect.value = true
        isChecked.value = true
        feedback.value = { type: 'success', text: data.successMsg }
    } else {
        isCorrect.value = false;
        isChecked.value = false;
        attemptCount.value++;
        if (dist > 50) {
            if (attemptCount.value >= 3) {
              feedback.value = { type: 'error', text: 'Blijf de pijlpunt verslepen tot de vorm exact op de stippellijn ligt.' }
            } else {
              feedback.value = { type: 'error', text: 'Je bent er nog niet. Sleep de punt van de pijl verder zodat de blauwe vorm EXACT op de stippellijn past.' }
            }
        }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Sleep de punt van de rode pijl (vector).' };
    vecTipX.value = currentLevelData.value.vecOriginX;
    vecTipY.value = currentLevelData.value.vecOriginY;
    attemptCount.value = 0;
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    generateLevel()
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

// Also reset when level changes to update the origin
watch(currentInternalLevel, () => {
    if (levels.value.length > 0) {
      vecTipX.value = currentLevelData.value.vecOriginX;
      vecTipY.value = currentLevelData.value.vecOriginY;
    }
})

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800"
     @mouseup="endDrag" @mouseleave="endDrag" @touchend="endDrag" @mousemove="onDrag" @touchmove.prevent="onDrag">
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-sky-50 p-4 border border-sky-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-sky-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-2">Vector Eigenschappen</h4>
               <ul class="space-y-2 font-mono text-sm text-slate-600">
                   <li>Vershuiving X: <strong :class="dx === 0 ? 'text-slate-400' : (dx > 0 ? 'text-emerald-600' : 'text-red-600')">{{ dx > 0 ? '+' : ''}}{{ Math.round(dx) }}</strong></li>
                   <li>Verschuiving Y: <strong :class="dy === 0 ? 'text-slate-400' : (dy > 0 ? 'text-red-600' : (dy < 0 ? 'text-emerald-600' : 'text-slate-400'))">{{ dy > 0 ? '-' : (dy < 0 ? '+' : '') }}{{ Math.abs(Math.round(dy)) }}</strong> <span class="text-xs opacity-50">(omhoog = +)</span></li>
               </ul>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-2">
                  <svg id="vector-svg" width="600" height="450" viewBox="0 0 600 450" class="block bg-slate-50" :key="currentInternalLevel">

                      <!-- Grid lines for visual reference -->
                      <g stroke="#e2e8f0" stroke-width="1">
                          <line v-for="i in 12" :key="'v'+i" :x1="i * 50" y1="0" :x2="i * 50" y2="450" />
                          <line v-for="i in 9" :key="'h'+i" x1="0" :y1="i * 50" x2="600" :y2="i * 50" />
                      </g>

                      <defs>
                          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                              <polygon points="0 0, 10 5, 0 10" fill="#ef4444" />
                          </marker>
                      </defs>

                      <!-- Target Ghost Shape -->
                      <g :transform="`translate(${currentLevelData.targetX}, ${currentLevelData.targetY})`"
                         color="#94a3b8" v-html="currentLevelData.shapeSVG" stroke-dasharray="6 4" fill="transparent"></g>

                      <!-- Starting Position Ghost (Faded) -->
                      <g :transform="`translate(${currentLevelData.startX}, ${currentLevelData.startY})`"
                         color="transparent" fill="rgba(148, 163, 184, 0.2)" v-html="currentLevelData.shapeSVG"></g>

                      <!-- The Moving Shape -->
                      <g :transform="`translate(${objX}, ${objY})`" class="transition-all duration-75"
                         color="#0284c7" fill="rgba(14, 165, 233, 0.8)" v-html="currentLevelData.shapeSVG"></g>

                      <!-- Translation Path Lines (Optional visual flair) -->
                      <g v-if="dx !== 0 || dy !== 0" opacity="0.3">
                          <line :x1="currentLevelData.startX" :y1="currentLevelData.startY" :x2="objX" :y2="objY" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 4" />
                      </g>

                      <!-- The Vector Engine (Arrow) -->
                      <g>
                          <!-- Vector Origin Dot -->
                          <circle :cx="currentLevelData.vecOriginX" :cy="currentLevelData.vecOriginY" r="6" fill="#1e293b" />

                          <!-- Vector Line -->
                          <line :x1="currentLevelData.vecOriginX" :y1="currentLevelData.vecOriginY" :x2="vecTipX" :y2="vecTipY"
                                stroke="#ef4444" stroke-width="6" marker-end="url(#arrow)" />

                          <!-- Draggable Tip Overlay -->
                          <circle :cx="vecTipX" :cy="vecTipY" r="20" fill="rgba(239, 68, 68, 0.3)"
                                  stroke="#ef4444" stroke-width="2"
                                  class="cursor-pointer hover:scale-125 transition-transform origin-center"
                                  :class="isCorrect ? 'pointer-events-none opacity-0' : ''"
                                  @mousedown.stop="startDrag" @touchstart.stop.prevent="startDrag" />

                          <text :x="currentLevelData.vecOriginX - 10" :y="currentLevelData.vecOriginY + 25" font-weight="bold" fill="#1e293b" font-family="monospace">Start</text>
                      </g>

                  </svg>
              </div>

              <p v-if="!isCorrect" class="mt-6 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                  Sleep de transparante rode knop aan het einde van de pijl.
              </p>

          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>