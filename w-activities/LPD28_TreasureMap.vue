<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMapPin, PhArrowClockwise, PhCrosshair
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Coördinaten: De Schatkaart' },
  instruction: { 
    type: String, 
    default: 'Een coördinaat (x, y) werkt altijd in deze volgorde: éérst wandel je horizontaal (x-as), daarna klim je verticaal (y-as). Net zoals in een boom klimmen: eerst naar de boom stappen, dan pas naar boven!<br/><br/><strong>Opdracht:</strong> De schat is begraven op <strong>(4, -3)</strong>. Klik in het rooster op de exacte locatie om te graven.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMapPin }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een kruispunt in het assenstelsel.' })

// Domain Logic
const targetX = 4
const targetY = -3

const userX = ref(null)
const userY = ref(null)

const minCoord = -5
const maxCoord = 5

function clickGrid(x, y) {
    if (isCorrect.value) return;
    userX.value = x
    userY.value = y
    checkAnswer()
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op een kruispunt in het assenstelsel.' };
    userX.value = null;
    userY.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userX.value === targetX && userY.value === targetY) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Gevonden! Je bent eerst 4 stappen naar rechts gegaan op de x-as, en dan 3 stappen naar beneden op de y-as.' 
    }
  } else {
    isCorrect.value = false
    
    if (userX.value === targetY && userY.value === targetX) {
        feedback.value = { type: 'error', text: `Oeps! Je hebt op (${userX.value}, ${userY.value}) geklikt. Je hebt de X en de Y omgedraaid! Het eerste getal (4) is altijd de HORIZONTALE as.`}
    } else if (userX.value !== targetX && userY.value === targetY) {
        feedback.value = { type: 'error', text: `Je y-coördinaat klopt (-3, verticaal), maar je x-coördinaat is fout. Je moet horizontaal naar de 4.`}
    } else if (userX.value === targetX && userY.value !== targetY) {
        feedback.value = { type: 'error', text: `Je x-coördinaat klopt (4, horizontaal), maar je y-coördinaat is fout. Let op het minteken voor de 3!`}
    } else {
        feedback.value = { type: 'error', text: `Je hebt gegraven op (${userX.value}, ${userY.value}). Dat is fout. Begin altijd in de oorsprong (0,0). Ga eerst 4 stappen horizontaal.`}
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
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
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-orange-900 mb-2">Jouw klik:</label>
               <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-700">
                   <span>(</span>
                   <div class="w-16 bg-white p-2 rounded shadow-sm border" :class="userX !== null ? 'border-orange-300 text-orange-600' : 'border-slate-200 text-slate-300'">{{ userX !== null ? userX : 'x' }}</div>
                   <span>,</span>
                   <div class="w-16 bg-white p-2 rounded shadow-sm border" :class="userY !== null ? 'border-blue-300 text-blue-600' : 'border-slate-200 text-slate-300'">{{ userY !== null ? userY : 'y' }}</div>
                   <span>)</span>
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
              <button v-if="isCorrect" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-map">
              
              <!-- SVG Coordinate Grid -->
              <!-- Logical grid from -5 to +5 on both axes. Total 10 units. -->
              <!-- Visual size 500x500. 1 unit = 50px. Origin at (250, 250). -->
              <div class="relative bg-[#fdfbf7] shadow-xl rounded-2xl overflow-hidden border-4 border-slate-800 p-4">
                  <svg width="500" height="500" viewBox="0 0 500 500" class="block">
                      
                      <!-- Grid lines -->
                      <g stroke="#cbd5e1" stroke-width="1">
                          <line v-for="i in 11" :key="'vg'+i" :x1="(i-1) * 50" y1="0" :x2="(i-1) * 50" y2="500" />
                          <line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1) * 50" x2="500" :y2="(i-1) * 50" />
                      </g>

                      <!-- Axes -->
                      <line x1="0" y1="250" x2="500" y2="250" stroke="#0ea5e9" stroke-width="4" /> <!-- X axis (blue/horizontal) -->
                      <line x1="250" y1="0" x2="250" y2="500" stroke="#f97316" stroke-width="4" /> <!-- Y axis (orange/vertical) -->

                      <!-- Axes Labels -->
                      <text x="480" y="240" font-weight="bold" fill="#0ea5e9" font-size="16">x</text>
                      <text x="260" y="20" font-weight="bold" fill="#f97316" font-size="16">y</text>

                      <!-- Tick labels (only positive for cleanliness, or origin) -->
                      <text x="260" y="240" font-weight="bold" fill="#334155" font-size="12">0</text>
                      <text x="500" y="240" font-weight="bold" fill="#0ea5e9" font-size="12" text-anchor="end">5</text>
                      <text x="260" y="490" font-weight="bold" fill="#f97316" font-size="12">-5</text>

                      <!-- Interactive Click Zones (Intersections) -->
                      <g v-for="x in 11" :key="'x'+x">
                          <g v-for="y in 11" :key="'y'+y">
                              <!-- Math coordinates -->
                              <!-- x_math = x - 6. y_math = 6 - y. (SVG y is inverted) -->
                              <circle :cx="(x-1)*50" :cy="(y-1)*50" r="15" fill="transparent" class="cursor-crosshair hover:fill-amber-500/30 transition-colors"
                                      @click="clickGrid(x - 6, 6 - y)" />
                          </g>
                      </g>

                      <!-- User Selection Marker -->
                      <!-- svg_x = (userX + 5) * 50 -->
                      <!-- svg_y = (5 - userY) * 50 -->
                      <g v-if="userX !== null && userY !== null" class="animate-fadeIn pointer-events-none">
                          <circle :cx="(userX + 5) * 50" :cy="(5 - userY) * 50" r="12" fill="none" stroke="#ef4444" stroke-width="4" />
                          <circle :cx="(userX + 5) * 50" :cy="(5 - userY) * 50" r="4" fill="#ef4444" />
                          
                          <!-- Treasure chest if correct -->
                          <text v-if="isCorrect" :x="(userX + 5) * 50 - 15" :y="(5 - userY) * 50 - 15" font-size="24">💎</text>
                      </g>

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
.pattern-map { background-color: #f8fafc; background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 100 100 M 100 0 L 0 100" stroke="rgba(0,0,0,0.03)" stroke-width="1"/></svg>'); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
</style>