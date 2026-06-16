<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhTrendUp,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Spreidingsdiagram en Correlatie'
  },
  instruction: {
    type: String,
    default: 'Sleep de slider om de correlatie (r) van de puntenwolk aan te passen. Zorg dat de spreiding exact overeenkomt met de gevraagde correlatiecoëfficiënt!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTrendUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Pas r aan om de puntenwolk te hervormen.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Maak een puntenwolk met een STERKE POSITIEVE correlatie (r = 0.9).',
    targetR: 0.9,
    hint: 'Bij een sterke positieve correlatie liggen de punten dicht rond een stijgende lijn.'
  },
  {
    goalText: 'Opdracht 2: Maak een puntenwolk met GEEN correlatie (r = 0).',
    targetR: 0,
    hint: 'Bij een correlatie van 0 is er geen touw aan vast te knopen. Het is een willekeurige wolk ronde stippen zonder richting.'
  },
  {
    goalText: 'Opdracht 3: Maak een puntenwolk met een STERKE NEGATIEVE correlatie (r = -0.8).',
    targetR: -0.8,
    hint: 'Bij een negatieve correlatie daalt de trendlijn. Sterk betekent dat ze relatief dicht bij elkaar liggen.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const userR = ref(0.1) // Slider from -1.0 to 1.0

// Base random points (fixed seed equivalent for stability during slider drag)
const basePoints = Array.from({length: 40}, () => ({
  x: Math.random() * 80 + 10,
  noise: (Math.random() - 0.5) * 60 // Base noise
}))

// Live points based on userR
const dataPoints = computed(() => {
  return basePoints.map(pt => {
    // If r is 1, y is exactly x.
    // If r is -1, y is exactly 100 - x.
    // If r is 0, y is pure random (noise shifted to center).
    
    let perfectY;
    if (userR.value >= 0) {
      perfectY = pt.x;
    } else {
      perfectY = 100 - pt.x; // downward
    }

    // Blend between pure noise and perfect line based on absolute R
    const rAbs = Math.abs(userR.value);
    
    // As rAbs approaches 1, noise goes to 0
    const currentNoise = pt.noise * (1 - rAbs);
    
    // We also need to center the pure noise around 50 when r=0
    const centerPull = 50 * (1 - rAbs);
    const linePull = perfectY * rAbs;

    let y = centerPull + linePull + currentNoise;
    
    // Keep it in bounds visually
    y = Math.max(5, Math.min(95, y));

    return { x: pt.x, y };
  })
})


function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Pas r aan om de puntenwolk te hervormen.' };
  userR.value = 0.1;
}

function checkAnswer() {
  isChecked.value = true;
  
  // Give a small margin of error (0.1) to be forgiving but require active tuning
  if (Math.abs(userR.value - currentLevelData.value.targetR) <= 0.05) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magistraal! Dit is exact hoe deze correlatie eruitziet in het echt.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: `Niet helemaal. Je huidige wolk heeft r = ${userR.value.toFixed(1)}. ${currentLevelData.value.hint}`
    }
  }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-emerald-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">
              
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Correlatie (r): <span class="font-mono text-lg text-emerald-600">{{ userR.toFixed(1) }}</span></label>
                <input type="range" v-model.number="userR" min="-1" max="1" step="0.1" :disabled="isCorrect" class="w-full accent-emerald-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400 font-mono">
                  <span>-1.0</span><span>0</span><span>1.0</span>
                </div>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <div class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[400px] flex items-end px-8 pb-8 pt-8">
                
                <!-- SVG Scatter Plot -->
                <svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible">
                  <!-- Axes -->
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#94a3b8" stroke-width="1" />
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#94a3b8" stroke-width="1" />

                  <!-- Trendlijn (shown when correct AND if there is actual correlation) -->
                  <line v-if="isCorrect && Math.abs(currentLevelData.targetR) >= 0.5" 
                        :x1="10" :y1="currentLevelData.targetR > 0 ? 90 : 10" 
                        :x2="90" :y2="currentLevelData.targetR > 0 ? 10 : 90" 
                        stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2" class="animate-fadeIn" />

                  <!-- Data points -->
                  <circle v-for="(pt, idx) in dataPoints" :key="idx" 
                          :cx="pt.x" :cy="100 - pt.y" r="2.5" fill="#0ea5e9" class="transition-all duration-300 ease-out" 
                          :class="isCorrect ? 'fill-emerald-500' : ''" />
                  
                </svg>

                <div class="absolute bottom-2 right-2 text-xs font-bold text-slate-400">Grootheid X</div>
                <div class="absolute top-2 left-2 text-xs font-bold text-slate-400 rotate-90 origin-left">Grootheid Y</div>

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

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -9px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 3px;
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>