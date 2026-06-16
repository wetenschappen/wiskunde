<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMountains, PhArrowClockwise, PhHandGrabbing
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Afronden: De Getallenheuvel' },
  instruction: { 
    type: String, 
    default: 'Afronden op eenheden betekent kijken welk geheel getal het dichtstbij ligt.<br/><br/><strong>Opdracht:</strong> Zet de getallen op de heuvel. Klik op "Laat Los" en kijk naar welk dal de bal rolt (zwaartekracht!). Vul daarna je antwoord in.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMountains }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de slider om de rode bal op de heuvel te plaatsen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Afronden naar beneden',
    targetDecimal: 4.2,
    exactAns: 4,
    hintPos: 'Je bal staat niet op 4.2. Zet hem eerst goed.',
    hintAns: 'Kijk naar de bal op 4.2. Welk dal ligt het dichtstbij? Naar welk cijfer rolt hij terug?'
  },
  {
    goalText: 'Opdracht 2: Afronden naar boven',
    targetDecimal: 4.7,
    exactAns: 5,
    hintPos: 'Zet de bal eerst op 4.7 zoals gevraagd in de opdracht.',
    hintAns: 'De bal op 4.7 is al lang over de top. Welk dal is nu het dichtstbij?'
  },
  {
    goalText: 'Opdracht 3: Precies op de top',
    targetDecimal: 4.5,
    exactAns: 5,
    hintPos: 'Plaats de bal exact op de top: 4.5.',
    hintAns: 'Wiskundigen hebben afgesproken: bij .5 ronden we altijd naar BOVEN af. De "Wiskunde-wind" helpt je hierbij.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const decimalValue = ref(4.0) // 4.0 to 5.0
const isDropped = ref(false)
const userAns = ref(null)

// If decimal is 4.5, by convention it rounds UP (to 5). We simulate this with a tiny "wind" push.
const finalValue = computed(() => {
    if (!isDropped.value) return decimalValue.value
    if (decimalValue.value < 4.5) return 4.0
    return 5.0
})

function dropBall() {
    isDropped.value = true
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Gebruik de slider om de rode bal op de heuvel te plaatsen.' };
    decimalValue.value = 4.0;
    isDropped.value = false;
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  const data = currentLevelData.value;
  
  if (userAns.value === data.exactAns) {
    if (isDropped.value && decimalValue.value === data.targetDecimal) {
        isCorrect.value = true
        if (data.targetDecimal === 4.5) {
            feedback.value = { type: 'success', text: 'Correct! Omdat 4.5 perfect in het midden ligt, hebben wiskundigen afgesproken om het altijd naar boven (5) af te ronden.'}
        } else {
            feedback.value = { type: 'success', text: `Perfect! Omdat ${data.targetDecimal} dichter bij ${data.exactAns} ligt, ronden we af naar ${data.exactAns}.` }
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${data.exactAns} is correct! Maar pas de simulatie eerst aan naar ${data.targetDecimal} en laat de bal rollen om het visueel te bewijzen.`}
    }
  } else {
    isCorrect.value = false
    
    if (decimalValue.value !== data.targetDecimal) {
        feedback.value = { type: 'error', text: data.hintPos }
    } else {
        feedback.value = { type: 'error', text: data.hintAns }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-teal-900 mb-2">Jouw afronding:</label>
               <div class="flex items-center gap-4 text-3xl font-black text-slate-700 justify-center">
                   <div class="bg-white p-2 rounded border border-slate-300 w-24 text-center">{{ currentLevelData.targetDecimal }}</div>
                   <span class="text-slate-400">≈</span>
                   <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                          class="w-24 font-bold text-2xl p-2 border-2 border-teal-400 rounded focus:border-teal-500 focus:ring-teal-500 text-center bg-white" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-3xl flex flex-col items-center">
                  
                  <div class="mb-12 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center z-20">
                      <div class="flex w-full justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Plaats de Bal</label>
                          <span class="font-black text-xl text-red-600">{{ decimalValue.toFixed(1) }}</span>
                      </div>
                      <input type="range" min="4.0" max="5.0" step="0.1" v-model.number="decimalValue" :disabled="isCorrect || isDropped"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                      
                      <button @click="dropBall" :disabled="isDropped || decimalValue !== currentLevelData.targetDecimal" 
                              class="mt-6 px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                          <PhHandGrabbing weight="fill" /> Laat Los (Zwaartekracht)
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative w-full h-[300px] flex items-end justify-center">
                      
                      <!-- The Hill (SVG) -->
                      <svg width="600" height="200" viewBox="0 0 600 200" class="absolute bottom-0 z-0">
                          <!-- A smooth hill curve from x=50 to x=550. Peak at 300. -->
                          <!-- Valley left: 50, Valley right: 550 -->
                          <path d="M 0 200 L 50 200 C 150 200 200 50 300 50 C 400 50 450 200 550 200 L 600 200 Z" fill="#94a3b8" stroke="#475569" stroke-width="4" />
                          
                          <!-- Number Line Ticks -->
                          <!-- 4.0 is at x=50, 4.5 is at x=300, 5.0 is at x=550 -->
                          <line x1="50" y1="200" x2="50" y2="180" stroke="white" stroke-width="2" />
                          <text x="50" y="170" text-anchor="middle" font-weight="900" font-size="20" fill="white">4</text>
                          
                          <line x1="300" y1="50" x2="300" y2="70" stroke="white" stroke-width="2" />
                          <text x="300" y="90" text-anchor="middle" font-weight="900" font-size="16" fill="white">4.5</text>
                          
                          <line x1="550" y1="200" x2="550" y2="180" stroke="white" stroke-width="2" />
                          <text x="550" y="170" text-anchor="middle" font-weight="900" font-size="20" fill="white">5</text>
                          
                          <!-- Minor ticks -->
                          <g opacity="0.5">
                              <line v-for="i in 9" :key="'t'+i" :x1="50 + i * 50" :y1="i < 5 ? (200 - Math.pow(i/5, 2)*150) : (50 + Math.pow((i-5)/5, 2)*150)" :x2="50 + i * 50" :y2="i < 5 ? (200 - Math.pow(i/5, 2)*150) + 10 : (50 + Math.pow((i-5)/5, 2)*150) + 10" stroke="white" stroke-width="2" />
                          </g>
                      </svg>

                      <!-- The Ball -->
                      <!-- We need to calculate its x and y based on its value (4.0 to 5.0) -->
                      <!-- Mapping: val 4.0 -> x=50, val 5.0 -> x=550. Ratio: (val - 4.0) / 1.0 -->
                      <!-- Y mapping uses the bezier approximation or simple quadratic for visual sync -->
                      <div class="absolute w-10 h-10 bg-red-500 rounded-full shadow-lg border-2 border-white transition-all duration-[1500ms] ease-bounce z-10 flex items-center justify-center font-bold text-white text-sm"
                           :style="{
                               left: `calc(50% - 300px + 50px + ${(finalValue - 4.0) * 500}px - 20px)`,
                               bottom: `${finalValue <= 4.5 ? Math.pow((finalValue - 4.0)/0.5, 1.5) * 150 : Math.pow((5.0 - finalValue)/0.5, 1.5) * 150}px`,
                               marginBottom: '4px' // radius offset
                           }">
                           {{ decimalValue.toFixed(1) }}
                      </div>
                      
                      <!-- Wind indicator if exactly 4.5 and dropped -->
                      <div v-if="isDropped && decimalValue === 4.5" class="absolute top-[10%] left-1/2 -translate-x-1/2 text-sky-500 font-bold animate-pulse flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow border border-sky-200">
                          Wiskunde-wind! <PhArrowRight weight="bold" class="w-5 h-5" />
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
.ease-bounce { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); } /* Custom smooth roll */

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #ef4444;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -11px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>