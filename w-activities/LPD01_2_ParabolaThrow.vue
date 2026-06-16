<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBasketball, PhArrowClockwise, PhPlay
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Fenomenen: De Basketbalworp' },
  instruction: { 
    type: String, 
    default: 'Tuning de parabool y = a(x - p)² + q. Zorg dat je worp perfect in de basket belandt!' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBasketball }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Pas de parameters a, p en q aan om de parabool te vormen.' })

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    name: 'Level 1: Vrije Worp',
    basketX: 6, basketY: 3,
    hasDefender: false, defenderX: 0, defenderY: 0
  },
  {
    name: 'Level 2: Driepunter',
    basketX: 10, basketY: 4,
    hasDefender: false, defenderX: 0, defenderY: 0
  },
  {
    name: 'Level 3: Over de Verdediger',
    basketX: 9, basketY: 3,
    hasDefender: true, defenderX: 5, defenderY: 5.5
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const aVal = ref(-0.5) // -1.0 to -0.05
const pVal = ref(5)    // 0 to 12
const qVal = ref(5)    // 0 to 12

const isShooting = ref(false)
const ballX = ref(1)
const ballY = ref(3) // Thrower hands are at (1,3)

function shootBall() {
    if (isShooting.value) return;
    isChecked.value = true;
    isShooting.value = true;
    
    let x = 1;
    feedback.value = { type: 'info', text: 'Worp onderweg...' }
    
    const target = currentLevelData.value;
    
    const interval = setInterval(() => {
        x += 0.15;
        ballX.value = x;
        ballY.value = aVal.value * Math.pow((x - pVal.value), 2) + qVal.value;
        
        // 1. Defender Check
        if (target.hasDefender) {
            // Very simple collision bounding box for defender head/hands
            if (x > target.defenderX - 0.5 && x < target.defenderX + 0.5 && ballY.value < target.defenderY) {
                clearInterval(interval);
                isCorrect.value = false
                feedback.value = { type: 'error', text: 'Geblokt! De bal is tegen de verdediger gekomen. Verhoog je top (q) of verklein je opening (a) voor een hogere boog.'}
                setTimeout(() => {
                    isShooting.value = false;
                    ballX.value = 1;
                    ballY.value = 3;
                }, 2000)
                return;
            }
        }

        // 2. Basket Check
        if (x >= target.basketX) {
            clearInterval(interval);
            
            // Allow a small margin of error for "swish"
            if (Math.abs(ballY.value - target.basketY) < 0.4) {
                isCorrect.value = true
                feedback.value = { type: 'success', text: 'SWISH! Perfecte parabool. De wiskunde klopt!' }
            } else {
                isCorrect.value = false
                if (ballY.value > target.basketY) {
                   feedback.value = { type: 'error', text: 'Mis! De bal vloog bóven de basket. Maak de parabool iets smaller (a meer negatief) of verlaag de top (q).' }
                } else {
                   feedback.value = { type: 'error', text: 'Mis! De bal vloog ónder de basket of raakte de ring. Breng de boog omhoog.' }
                }
            }
            
            setTimeout(() => {
                isShooting.value = false;
                ballX.value = 1;
                ballY.value = 3;
            }, 2000)
            return;
        }
        
        // 3. Ground hit Check
        if (ballY.value < 0) {
            clearInterval(interval);
            isCorrect.value = false
            feedback.value = { type: 'error', text: 'Airball! Te kort. Verschuif je top (p) verder naar voren.'}
            setTimeout(() => {
                isShooting.value = false;
                ballX.value = 1;
                ballY.value = 3;
            }, 2000)
        }

    }, 30)
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Pas de parameters a, p en q aan om de parabool te vormen.' };
    aVal.value = -0.5;
    pVal.value = 5;
    qVal.value = 5;
    isShooting.value = false;
    ballX.value = 1;
    ballY.value = 3;
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
              <p class="text-xs font-medium text-slate-500">{{ currentLevelData.name }}</p>
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
            
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner flex flex-col gap-6">
               
               <div class="font-mono font-black text-2xl text-slate-700 bg-white p-3 rounded shadow text-center border-2 border-orange-200">
                   y = <span class="text-rose-500">{{ aVal.toFixed(2) }}</span>(x - <span class="text-blue-500">{{ pVal }}</span>)² + <span class="text-emerald-500">{{ qVal }}</span>
               </div>

               <!-- Slider a (opening) -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-rose-700 flex justify-between">
                       <span>a (Opening / Breedte)</span>
                       <span>{{ aVal.toFixed(2) }}</span>
                   </label>
                   <input type="range" min="-1.5" max="-0.05" step="0.05" v-model.number="aVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500" />
               </div>

               <!-- Slider p (x-coördinaat top) -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-blue-700 flex justify-between">
                       <span>p (Horizontale Top)</span>
                       <span>{{ pVal }}</span>
                   </label>
                   <input type="range" min="0" max="12" step="0.5" v-model.number="pVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
               </div>

               <!-- Slider q (y-coördinaat top) -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-emerald-700 flex justify-between">
                       <span>q (Verticale Top / Hoogte)</span>
                       <span>{{ qVal }}</span>
                   </label>
                   <input type="range" min="0" max="12" step="0.5" v-model.number="qVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
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
              
              <button v-if="!isCorrect" @click="shootBall" :disabled="isShooting" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-orange-500 hover:bg-orange-600 active:scale-[0.98] flex items-center justify-center gap-2">
                  <PhPlay weight="fill" /> Test Worp
              </button>
              
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Physics Canvas -->
              <!-- X: 0 to 12. Y: 0 to 10. Scale: 50px per unit. -->
              <div class="relative bg-[#f8fafc] shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-800 flex items-end">
                  <svg width="600" height="500" viewBox="0 0 600 500" class="block">
                      
                      <!-- Coordinate System (y is flipped in SVG, 0 is bottom) -->
                      <g transform="translate(0, 500) scale(1, -1)">
                          
                          <!-- Grid -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 13" :key="'v'+i" :x1="(i-1)*50" y1="0" :x2="(i-1)*50" y2="500" />
                              <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*50" x2="600" :y2="(i-1)*50" />
                          </g>

                          <!-- The Basket -->
                          <g>
                              <!-- Pole -->
                              <line :x1="currentLevelData.basketX * 50 + 20" y1="0" :x2="currentLevelData.basketX * 50 + 20" y2="200" stroke="#64748b" stroke-width="6" class="transition-all duration-500" />
                              <!-- Backboard -->
                              <line :x1="currentLevelData.basketX * 50 + 20" :y1="currentLevelData.basketY * 50 - 30" :x2="currentLevelData.basketX * 50 + 20" :y2="currentLevelData.basketY * 50 + 50" stroke="#fef08a" stroke-width="8" class="transition-all duration-500" />
                              <line :x1="currentLevelData.basketX * 50 + 20" :y1="currentLevelData.basketY * 50 - 30" :x2="currentLevelData.basketX * 50 + 20" :y2="currentLevelData.basketY * 50 + 50" stroke="#ca8a04" stroke-width="2" class="transition-all duration-500" />
                              <!-- Hoop -->
                              <line :x1="currentLevelData.basketX * 50 - 20" :y1="currentLevelData.basketY * 50" :x2="currentLevelData.basketX * 50 + 20" :y2="currentLevelData.basketY * 50" stroke="#ef4444" stroke-width="4" stroke-linecap="round" class="transition-all duration-500" />
                          </g>

                          <!-- The Defender (if applicable) -->
                          <g v-if="currentLevelData.hasDefender" class="animate-fadeIn">
                              <!-- Defender Body -->
                              <line :x1="currentLevelData.defenderX * 50" y1="0" :x2="currentLevelData.defenderX * 50" :y2="currentLevelData.defenderY * 50 - 20" stroke="#ef4444" stroke-width="12" stroke-linecap="round" />
                              <!-- Defender Head -->
                              <circle :cx="currentLevelData.defenderX * 50" :cy="currentLevelData.defenderY * 50 - 10" r="10" fill="#fca5a5" />
                              <!-- Defender Hand -->
                              <line :x1="currentLevelData.defenderX * 50" :y1="currentLevelData.defenderY * 50 - 10" :x2="currentLevelData.defenderX * 50 - 10" :y2="currentLevelData.defenderY * 50" stroke="#fca5a5" stroke-width="6" stroke-linecap="round" />
                          </g>

                          <!-- The Thrower (At X=0) -->
                          <g>
                              <circle cx="50" cy="120" r="15" fill="#3b82f6" />
                              <line x1="50" y1="105" x2="50" y2="40" stroke="#3b82f6" stroke-width="8" stroke-linecap="round" />
                              <line x1="50" y1="90" x2="70" y2="140" stroke="#3b82f6" stroke-width="6" stroke-linecap="round" />
                          </g>

                          <!-- The Parabola Curve Preview (Dashed) -->
                          <polyline 
                              fill="none" 
                              stroke="#cbd5e1" 
                              stroke-width="3" 
                              stroke-dasharray="10 5"
                              :points="Array.from({length: 120}, (_, i) => {
                                  const x = i * 0.1;
                                  const y = aVal * Math.pow((x - pVal), 2) + qVal;
                                  return `${x * 50},${y * 50}`;
                              }).join(' ')" 
                          />

                          <!-- The Vertex Marker -->
                          <circle :cx="pVal * 50" :cy="qVal * 50" r="6" fill="#10b981" />
                          <circle :cx="pVal * 50" :cy="qVal * 50" r="12" fill="none" stroke="#10b981" stroke-width="2" class="animate-pulse" />

                          <!-- The Ball (Animated) -->
                          <circle :cx="ballX * 50" :cy="ballY * 50" r="12" fill="#f97316" />
                          <circle :cx="ballX * 50 - 3" :cy="ballY * 50 + 3" r="3" fill="rgba(255,255,255,0.4)" />

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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 3px solid white;
  cursor: pointer;
  margin-top: -6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  border-radius: 4px;
}
</style>