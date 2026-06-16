<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhBoundingBox,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Gelijkvormigheid en Schaal'
  },
  instruction: {
    type: String,
    default: 'Verander de schaalfactor k via de slider om de opdracht te voltooien. Wat is het effect op de oppervlakte?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBoundingBox }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Maak het blauwe beeld exact 4 keer zo groot in OPPERVLAKTE.',
    targetK: 2,
    hintBase: 'Als de schaalfactor k is, wordt de oppervlakte k² keer zo groot. Welk getal in het kwadraat is 4?'
  },
  {
    goalText: 'Opdracht 2: Maak het beeld een kwart (0.25x) van de originele oppervlakte.',
    targetK: 0.5,
    hintBase: 'Het beeld moet kleiner worden. Welk getal keer zichzelf (k²) is gelijk aan 0.25 (of 1/4)?'
  },
  {
    goalText: 'Opdracht 3: Maak het beeld 9 keer zo groot in OPPERVLAKTE.',
    targetK: 3,
    hintBase: 'Als de oppervlakte x9 gaat, met hoeveel moeten de zijden (basis en hoogte) dan vermenigvuldigd worden?'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Activity State
const scaleFactor = ref(1) // Starts neutral

const originalBase = 40 // px visually
const originalHeight = 30 // px visually
const originalAreaValue = 60 // symbolic area

const newBase = computed(() => originalBase * scaleFactor.value)
const newHeight = computed(() => originalHeight * scaleFactor.value)
const newAreaValue = computed(() => originalAreaValue * (scaleFactor.value * scaleFactor.value))

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Stel de schaalfactor k in.' };
  scaleFactor.value = 1;
}

function checkAnswer() {
  isChecked.value = true;
  if (scaleFactor.value === currentLevelData.value.targetK) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Correct! De lengtes gaan x${scaleFactor.value}, dus de oppervlakte gaat x${scaleFactor.value * scaleFactor.value} (k²).` 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: `Bijna. Jouw huidige oppervlakte is nu ${newAreaValue.value} (dat is ${scaleFactor.value * scaleFactor.value}x groter). ${currentLevelData.value.hintBase}`
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
            
            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <label class="block mb-2 text-sm font-bold text-slate-700">Schaalfactor (k): <span class="font-mono text-lg text-indigo-600">{{ scaleFactor }}</span></label>
              <input type="range" v-model.number="scaleFactor" min="0.5" max="3" step="0.5" :disabled="isCorrect" class="w-full accent-indigo-600">
              <div class="flex justify-between mt-2 text-xs font-medium text-slate-400 font-mono">
                <span>0.5</span><span>1.0</span><span>3.0</span>
              </div>
            </div>

            <div class="mt-8 space-y-4">
              <div class="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between">
                <span class="font-bold text-slate-500 uppercase tracking-widest text-xs">Oppervlakte Origineel</span>
                <span class="font-mono font-black text-xl text-slate-800">{{ originalAreaValue }}</span>
              </div>
              <div class="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm flex items-center justify-between transition-all" :class="isCorrect ? 'bg-emerald-50 border-emerald-400' : ''">
                <span class="font-bold uppercase tracking-widest text-xs" :class="isCorrect ? 'text-emerald-700' : 'text-indigo-700'">Oppervlakte Beeld</span>
                <span class="font-mono font-black text-2xl" :class="isCorrect ? 'text-emerald-600' : 'text-indigo-600'">{{ newAreaValue }}</span>
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
              
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
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
            
            <div class="relative flex-1 flex items-end justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <!-- Container for scaling visual -->
              <div class="relative flex items-end justify-center gap-16 w-full h-full pb-10">
                
                <!-- Original Shape (fixed visual scale) -->
                <div class="flex flex-col items-center gap-4 transition-opacity" :class="isCorrect ? 'opacity-30' : 'opacity-100'">
                  <div class="text-center font-bold text-slate-400 uppercase tracking-widest text-xs">Origineel</div>
                  <div class="relative bg-slate-400 transform-origin-bottom"
                       style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%); width: 80px; height: 60px;">
                  </div>
                </div>

                <!-- Scaled Shape -->
                <div class="flex flex-col items-center gap-4">
                  <div class="text-center font-bold text-indigo-600 uppercase tracking-widest text-xs transition-colors" :class="isCorrect ? 'text-emerald-600' : ''">Beeld (k = {{ scaleFactor }})</div>
                  <div class="relative transition-all duration-300 transform-origin-bottom shadow-lg"
                       :class="isCorrect ? 'bg-emerald-500' : 'bg-indigo-500'"
                       :style="{
                         clip-path: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                         width: `${80 * scaleFactor}px`,
                         height: `${60 * scaleFactor}px`
                       }">
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

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.transform-origin-bottom { transform-origin: bottom center; }

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

.ring-pulse-amber {
    animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>