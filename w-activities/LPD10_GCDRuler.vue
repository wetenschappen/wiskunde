<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'GGD: De Perfecte Tegel' },
  instruction: { 
    type: String, 
    default: 'De <strong>Grootste Gemeenschappelijke Deler (GGD)</strong> vertelt je wat de grootste tegel is waarmee je een muur perfect kan betegelen zonder stukjes te moeten afsnijden (geen "rest").<br/><br/><strong>Opdracht:</strong> Zoek de GGD door de slider te verschuiven naar de <strong>grootste vierkante tegel</strong> die perfect past.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om een tegelformaat te kiezen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Een muur van 18 bij 12',
    wallW: 18,
    wallH: 12,
    targetAns: 6,
    maxTile: 12
  },
  {
    goalText: 'Opdracht 2: Een muur van 24 bij 16',
    wallW: 24,
    wallH: 16,
    targetAns: 8,
    maxTile: 16
  },
  {
    goalText: 'Opdracht 3: Een muur van 20 bij 15',
    wallW: 20,
    wallH: 15,
    targetAns: 5,
    maxTile: 15
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const tileSize = ref(1)

const tilesX = computed(() => Math.floor(currentLevelData.value.wallW / tileSize.value))
const tilesY = computed(() => Math.floor(currentLevelData.value.wallH / tileSize.value))

const remX = computed(() => currentLevelData.value.wallW % tileSize.value)
const remY = computed(() => currentLevelData.value.wallH % tileSize.value)

const hasRemainder = computed(() => remX.value > 0 || remY.value > 0)

// SVG Scaling logic so the wall always fits nicely
const maxWallW = 24 // from level 2
const maxWallH = 16 // from level 2
const maxSvgWidth = 500
const maxSvgHeight = 350
// Scale factor dynamically adjusted to fit the largest possible wall in the container
const scale = computed(() => Math.min(maxSvgWidth / currentLevelData.value.wallW, maxSvgHeight / currentLevelData.value.wallH))

const svgWidth = computed(() => currentLevelData.value.wallW * scale.value)
const svgHeight = computed(() => currentLevelData.value.wallH * scale.value)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider om een tegelformaat te kiezen.' };
    tileSize.value = 1;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (tileSize.value === currentLevelData.value.targetAns) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! De ${tileSize.value}x${tileSize.value} tegel is de grootste die past zonder rest. GGD(${currentLevelData.value.wallW}, ${currentLevelData.value.wallH}) = ${tileSize.value}.` 
    }
  } else {
    isCorrect.value = false
    
    if (hasRemainder.value) {
        feedback.value = { type: 'error', text: `Met tegels van ${tileSize.value}x${tileSize.value} hou je een rode "rest" over (de randen). Deze tegel past dus niet perfect.`}
    } else {
        feedback.value = { type: 'error', text: `Tegelformaat ${tileSize.value} past inderdaad perfect, maar het is zeker niet de GROOTSTE. Verschuif de slider verder naar rechts.`}
    }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="mb-10 w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div class="flex justify-between items-end mb-4">
                    <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Grootte Tegel</label>
                    <span class="font-black text-2xl text-orange-600">{{ tileSize }} × {{ tileSize }}</span>
                </div>
                <input type="range" min="1" :max="currentLevelData.maxTile" step="1" v-model.number="tileSize" :disabled="isCorrect"
                       class="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                <div class="flex justify-between mt-2 text-xs font-mono text-slate-400">
                    <span>1</span><span>{{ currentLevelData.maxTile }}</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Tegel</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Visualisation -->
              <div class="flex flex-col items-center w-full max-w-3xl">

                  <div class="relative bg-white p-6 rounded-xl shadow-xl border-4 border-slate-300 transition-all duration-300"
                       :class="isCorrect ? 'border-emerald-400 bg-emerald-50' : ''">
                      
                      <!-- Labels -->
                      <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-500 text-lg">Breedte: {{ currentLevelData.wallW }}</div>
                      <div class="absolute top-1/2 -left-8 -translate-y-1/2 font-mono font-bold text-slate-500 text-lg transform -rotate-90 origin-center">Hoogte: {{ currentLevelData.wallH }}</div>

                      <!-- The Wall -->
                      <svg :width="svgWidth" :height="svgHeight" class="bg-slate-100 shadow-inner">
                          
                          <!-- Grid of perfectly fitted tiles -->
                          <g>
                              <template v-for="x in tilesX" :key="'tx'+x">
                                  <template v-for="y in tilesY" :key="'ty'+y">
                                      <rect :x="(x-1) * tileSize * scale" 
                                            :y="(y-1) * tileSize * scale" 
                                            :width="tileSize * scale" 
                                            :height="tileSize * scale" 
                                            fill="#93c5fd" stroke="#2563eb" stroke-width="2" class="transition-all duration-300" />
                                  </template>
                              </template>
                          </g>

                          <!-- Remainder X Area (Red) -->
                          <rect v-if="remX > 0"
                                :x="tilesX * tileSize * scale" 
                                :y="0" 
                                :width="remX * scale" 
                                :height="svgHeight" 
                                fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3" />

                          <!-- Remainder Y Area (Red) -->
                          <rect v-if="remY > 0"
                                :x="0" 
                                :y="tilesY * tileSize * scale" 
                                :width="tilesX * tileSize * scale" 
                                :height="remY * scale" 
                                fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3" />

                          <!-- Definitions for Red Hatching -->
                          <defs>
                              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                  <line x1="0" y1="0" x2="0" y2="10" stroke="#fca5a5" stroke-width="4" />
                              </pattern>
                          </defs>

                      </svg>
                      
                      <!-- Overlay Win Message -->
                      <div v-if="isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div class="bg-emerald-500 text-white font-black text-4xl px-6 py-3 rounded-2xl shadow-xl transform -rotate-12 animate-bounce">
                              GGD = {{ tileSize }}
                          </div>
                      </div>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #f97316;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>