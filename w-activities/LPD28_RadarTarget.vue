<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Coördinaten: Radar Detectie' },
  instruction: { 
    type: String, 
    default: 'Een vijandige onderzeeër is gespot op je radar!<br/><br/><strong>Opdracht:</strong> Lees de coördinaten af op de x-as (horizontaal) en de y-as (verticaal). Vul ze in om een torpedo af te vuren.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk naar de groene stip. Wat is zijn horizontale (x) en verticale (y) positie?' })

// Domain Logic
const targetX = -3
const targetY = 2

const userX = ref(null)
const userY = ref(null)

const isFired = ref(false)

function fireTorpedo() {
    isChecked.value = true;
    isFired.value = true;
    
    setTimeout(() => {
        checkAnswer();
    }, 1000) // Delay for animation effect
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kijk naar de groene stip. Wat is zijn horizontale (x) en verticale (y) positie?' };
    userX.value = null;
    userY.value = null;
    isFired.value = false;
}

function checkAnswer() {
  if (userX.value === targetX && userY.value === targetY) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'BOEM! Voltreffer. De x-coördinaat was -3 (3 stappen naar links) en de y-coördinaat was 2 (2 stappen naar boven).' 
    }
  } else {
    isCorrect.value = false
    
    if (userX.value === targetY && userY.value === targetX) {
        feedback.value = { type: 'error', text: `Mis! Je schoot op (2, -3). Je hebt de assen omgedraaid! Lees eerst de horizontale x-as af, dan pas de y-as.`}
    } else {
        feedback.value = { type: 'error', text: `Mis! Je schoot op (${userX.value}, ${userY.value}). Lees de assen vanaf de oorsprong (het midden) af.`}
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="instruction"></div>
            
            <div class="p-4 mt-6 border border-emerald-900 bg-emerald-900/30 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-emerald-400 mb-2">Vuur Coördinaten:</label>
               <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-300 mb-4">
                   <span>(</span>
                   <input type="number" v-model.number="userX" placeholder="x" :disabled="isCorrect || isFired"
                          class="w-20 bg-slate-900 p-2 rounded shadow-sm border border-emerald-500/50 text-emerald-400 focus:border-emerald-400 focus:ring-emerald-400 text-center" />
                   <span>,</span>
                   <input type="number" v-model.number="userY" placeholder="y" :disabled="isCorrect || isFired"
                          class="w-20 bg-slate-900 p-2 rounded shadow-sm border border-blue-500/50 text-blue-400 focus:border-blue-400 focus:ring-blue-400 text-center" />
                   <span>)</span>
               </div>
               
               <!-- Custom firing button to match the theme -->
               <button @click="fireTorpedo" :disabled="isFired || userX === null || userY === null"
                       class="w-full py-3 rounded-lg font-black tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1"
                       :class="isFired ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-red-500 border-red-700 text-white hover:bg-red-400'">
                   Vuur Torpedo
               </button>
            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative">
              
              <!-- Radar UI -->
              <div class="relative bg-slate-800 shadow-2xl rounded-full overflow-hidden border-8 border-slate-700 p-2">
                  
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#020617_100%)]"></div>

                  <svg width="400" height="400" viewBox="0 0 400 400" class="block relative z-10">
                      
                      <!-- Radar Grid (Radial) -->
                      <circle cx="200" cy="200" r="200" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3" />
                      <circle cx="200" cy="200" r="160" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                      <circle cx="200" cy="200" r="120" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                      <circle cx="200" cy="200" r="80" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                      <circle cx="200" cy="200" r="40" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />

                      <!-- Cartesian Grid (1 unit = 40px) -->
                      <!-- Ranges from -5 to +5 -->
                      <g stroke="#10b981" stroke-width="1" opacity="0.15">
                          <line v-for="i in 11" :key="'vg'+i" :x1="(i-1) * 40" y1="0" :x2="(i-1) * 40" y2="400" />
                          <line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1) * 40" x2="400" :y2="(i-1) * 40" />
                      </g>

                      <!-- Axes -->
                      <line x1="0" y1="200" x2="400" y2="200" stroke="#10b981" stroke-width="2" opacity="0.5" />
                      <line x1="200" y1="0" x2="200" y2="400" stroke="#10b981" stroke-width="2" opacity="0.5" />

                      <!-- Axes Labels (Subtle) -->
                      <text x="380" y="190" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">x</text>
                      <text x="210" y="20" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">y</text>

                      <!-- Tick marks along axes -->
                      <g fill="#10b981" font-size="8" opacity="0.5" font-weight="bold">
                          <text x="360" y="215" text-anchor="middle">4</text>
                          <text x="240" y="215" text-anchor="middle">1</text>
                          <text x="80" y="215" text-anchor="middle">-3</text>
                          
                          <text x="185" y="40" dominant-baseline="middle">4</text>
                          <text x="185" y="120" dominant-baseline="middle">2</text>
                          <text x="180" y="280" dominant-baseline="middle">-2</text>
                      </g>

                      <!-- Target: Submarine at (-3, 2) -->
                      <!-- x_svg = 200 + (-3 * 40) = 200 - 120 = 80 -->
                      <!-- y_svg = 200 - (2 * 40) = 200 - 80 = 120 -->
                      <circle cx="80" cy="120" r="6" fill="#34d399" class="animate-ping" />
                      <circle cx="80" cy="120" r="3" fill="#ecfdf5" />

                      <!-- Radar Sweeper -->
                      <g class="animate-spin-radar origin-center">
                          <line x1="200" y1="200" x2="200" y2="0" stroke="#34d399" stroke-width="2" opacity="0.8" />
                          <path d="M 200 200 L 200 0 A 200 200 0 0 1 250 6 Z" fill="rgba(52, 211, 153, 0.2)" />
                      </g>

                      <!-- User Torpedo Impact -->
                      <g v-if="isFired && isChecked" class="animate-fadeIn">
                          <!-- svg_x = 200 + (userX * 40) -->
                          <!-- svg_y = 200 - (userY * 40) -->
                          <circle :cx="200 + (userX * 40)" :cy="200 - (userY * 40)" r="20" fill="none" stroke="#ef4444" stroke-width="4" class="animate-pulse" />
                          <circle :cx="200 + (userX * 40)" :cy="200 - (userY * 40)" r="4" fill="#ef4444" />
                          
                          <!-- Boom text if correct -->
                          <text v-if="isCorrect" :x="200 + (userX * 40)" :y="200 - (userY * 40) - 25" text-anchor="middle" font-weight="900" font-size="16" fill="#f87171" class="animate-fadeIn" style="animation-delay: 0.5s">BOEM!</text>
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

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-spin-radar { animation: spin 4s linear infinite; transform-origin: 200px 200px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>