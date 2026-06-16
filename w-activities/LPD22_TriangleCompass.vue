<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCompass, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Constructie: Driehoek met Passer' },
  instruction: { 
    type: String, 
    default: 'Waarom gebruiken we een passer om driehoeken te tekenen? Omdat een cirkel álle punten bevat die op een vaste afstand liggen!<br/><br/><strong>Opdracht:</strong> Construeer de gevraagde driehoek. De basis (het onderste lijnstuk) is al getekend. Gebruik de passer-knoppen om het exacte derde hoekpunt te vinden.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de eerste passer-knop om te beginnen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Base is always scaled so 1 unit = 50px for visual clarity, unless stated otherwise.
// L1: 5-4-3 (Right Triangle). Base=5 (250px).
// L2: 6-5-5 (Isosceles). Base=6 (300px).
// L3: 7-4-5 (Scalene). Base=7 (350px).

const levels = [
  {
    goalText: 'Opdracht 1: Zijden van 5 cm, 4 cm en 3 cm.',
    baseLen: 5, rA: 4, rB: 3,
    pA: { x: 175, y: 350 }, pB: { x: 425, y: 350 },
    // Intersection calculation:
    // x = (c^2 + b^2 - a^2) / 2c. Here c=5, b=4, a=3. x = (25+16-9)/10 = 32/10 = 3.2
    // y = sqrt(b^2 - x^2) = sqrt(16 - 10.24) = sqrt(5.76) = 2.4
    // C.x = 175 + 3.2 * 50 = 335
    // C.y = 350 - 2.4 * 50 = 230
    pC: { x: 335, y: 230 },
    successMsg: 'Perfect! Je hebt een driehoek met zijden 5, 4 en 3 geconstrueerd. Wist je dat dit altijd een perfecte rechthoekige driehoek oplevert?'
  },
  {
    goalText: 'Opdracht 2: Zijden van 6 cm, 5 cm en 5 cm.',
    baseLen: 6, rA: 5, rB: 5,
    pA: { x: 150, y: 350 }, pB: { x: 450, y: 350 },
    // c=6, b=5, a=5. x = (36+25-25)/12 = 3.
    // y = sqrt(25 - 9) = 4.
    // C.x = 150 + 3 * 50 = 300
    // C.y = 350 - 4 * 50 = 150
    pC: { x: 300, y: 150 },
    successMsg: 'Fantastisch! Zijden 6, 5 en 5. Omdat twee zijden even lang zijn, spreken we van een Gelijkbenige driehoek. Het snijpunt ligt perfect in het midden boven de basis.'
  },
  {
    goalText: 'Opdracht 3: Zijden van 7 cm, 4 cm en 5 cm.',
    baseLen: 7, rA: 4, rB: 5,
    pA: { x: 125, y: 350 }, pB: { x: 475, y: 350 },
    // c=7, b=4, a=5. x = (49+16-25)/14 = 40/14 = 2.857
    // y = sqrt(16 - 8.16) = sqrt(7.84) = 2.8
    // C.x = 125 + 2.857 * 50 = 267.85
    // C.y = 350 - 2.8 * 50 = 210
    pC: { x: 267.85, y: 210 },
    successMsg: 'Geweldig! Zijden 7, 4 en 5. Omdat alle zijden verschillend zijn, is dit een Ongelijkbenige (willekeurige) driehoek.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const circleADrawn = ref(false)
const circleBDrawn = ref(false)
const pointCPlaced = ref(false)

function drawCircleA() {
    if (isCorrect.value) return;
    circleADrawn.value = true
    feedback.value = { type: 'info', text: `Mooi. Elk punt op deze blauwe cirkel ligt exact ${currentLevelData.value.rA} eenheden van punt A.` }
}

function drawCircleB() {
    if (isCorrect.value) return;
    circleBDrawn.value = true
    feedback.value = { type: 'info', text: `Goed. Elk punt op de rode cirkel ligt exact ${currentLevelData.value.rB} eenheden van punt B.` }
}

function placePointC() {
    if (isCorrect.value) return;
    if (circleADrawn.value && circleBDrawn.value) {
        pointCPlaced.value = true
        checkAnswer()
    } else {
        feedback.value = { type: 'error', text: 'Je moet eerst beide cirkels tekenen om te weten waar ze elkaar snijden!' }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de eerste passer-knop om te beginnen.' };
    circleADrawn.value = false;
    circleBDrawn.value = false;
    pointCPlaced.value = false;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (pointCPlaced.value) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
  }
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-3">Stappenplan:</h4>
               
               <div class="flex flex-col gap-2">
                   <button @click="drawCircleA" :disabled="isCorrect || circleADrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="circleADrawn ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>1. Passer in A (straal = {{ currentLevelData.rA }})</span>
                       <PhCheckCircle v-if="circleADrawn" weight="fill" class="text-blue-500" />
                   </button>
                   <button @click="drawCircleB" :disabled="isCorrect || circleBDrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="circleBDrawn ? 'bg-red-100 border-red-400 text-red-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>2. Passer in B (straal = {{ currentLevelData.rB }})</span>
                       <PhCheckCircle v-if="circleBDrawn" weight="fill" class="text-red-500" />
                   </button>
                   <button @click="placePointC" :disabled="isCorrect || pointCPlaced" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="pointCPlaced ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700 disabled:opacity-50'">
                       <span>3. Verbind Snijpunt C</span>
                       <PhCheckCircle v-if="pointCPlaced" weight="fill" class="text-emerald-500" />
                   </button>
               </div>
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
              
              <!-- SVG Visualisation -->
              <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8" :key="currentInternalLevel">
                  <svg width="600" height="500" viewBox="0 0 600 500">
                      
                      <!-- The Circles -->
                      <g>
                          <!-- Circle A -->
                          <circle v-if="circleADrawn" :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.rA * 50" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                          <circle v-if="circleADrawn" :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.rA * 50" fill="rgba(59, 130, 246, 0.05)" class="animate-fadeIn" />
                          
                          <!-- Radius line A -->
                          <line v-if="circleADrawn && !pointCPlaced" :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pC.x" :y2="currentLevelData.pC.y" stroke="#3b82f6" stroke-width="2" class="animate-fadeIn" />
                          <text v-if="circleADrawn && !pointCPlaced" :x="(currentLevelData.pA.x + currentLevelData.pC.x)/2 - 10" :y="(currentLevelData.pA.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#3b82f6" class="animate-fadeIn">{{ currentLevelData.rA }} cm</text>

                          <!-- Circle B -->
                          <circle v-if="circleBDrawn" :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.rB * 50" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                          <circle v-if="circleBDrawn" :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.rB * 50" fill="rgba(239, 68, 68, 0.05)" class="animate-fadeIn" />
                          
                          <!-- Radius line B -->
                          <line v-if="circleBDrawn && !pointCPlaced" :x1="currentLevelData.pB.x" :y1="currentLevelData.pB.y" :x2="currentLevelData.pC.x" :y2="currentLevelData.pC.y" stroke="#ef4444" stroke-width="2" class="animate-fadeIn" />
                          <text v-if="circleBDrawn && !pointCPlaced" :x="(currentLevelData.pB.x + currentLevelData.pC.x)/2 + 10" :y="(currentLevelData.pB.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#ef4444" class="animate-fadeIn">{{ currentLevelData.rB }} cm</text>
                      </g>

                      <!-- The Completed Triangle -->
                      <g v-if="pointCPlaced" class="animate-fadeIn">
                          <polygon :points="`${currentLevelData.pA.x},${currentLevelData.pA.y} ${currentLevelData.pB.x},${currentLevelData.pB.y} ${currentLevelData.pC.x},${currentLevelData.pC.y}`" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" />
                          <circle :cx="currentLevelData.pC.x" :cy="currentLevelData.pC.y" r="5" fill="#1e293b" />
                          <text :x="currentLevelData.pC.x - 5" :y="currentLevelData.pC.y - 15" font-weight="bold" fill="#1e293b">C</text>
                          
                          <text :x="(currentLevelData.pA.x + currentLevelData.pC.x)/2 - 20" :y="(currentLevelData.pA.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#047857">{{ currentLevelData.rA }} cm</text>
                          <text :x="(currentLevelData.pB.x + currentLevelData.pC.x)/2 + 10" :y="(currentLevelData.pB.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#047857">{{ currentLevelData.rB }} cm</text>
                      </g>

                      <!-- The Base Segment AB (always visible) -->
                      <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pB.x" :y2="currentLevelData.pB.y" stroke="#1e293b" stroke-width="4" />
                      <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" r="5" fill="#1e293b" />
                      <circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" r="5" fill="#1e293b" />
                      
                      <text :x="currentLevelData.pA.x - 20" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#1e293b">A</text>
                      <text :x="currentLevelData.pB.x + 5" :y="currentLevelData.pB.y + 25" font-weight="bold" fill="#1e293b">B</text>
                      <text :x="(currentLevelData.pA.x + currentLevelData.pB.x)/2" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#64748b" text-anchor="middle">{{ currentLevelData.baseLen }} cm</text>

                  </svg>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>