<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartLine, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: De Grafieken-Kraker' },
  instruction: { 
    type: String, 
    default: 'Pas de richtingscoëfficiënt (m) en het startgetal (q) aan via de sliders. Zorg dat jouw blauwe rechte lijn exact over de rode stippellijn valt.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartLine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Verschuif de sliders voor m en q.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Maak de rode stijgende rechte na.',
    targetM: 2, targetQ: -3,
    hintQ: 'Kijk naar het snijpunt met de verticale y-as. Dat is je startgetal (q). De rode lijn snijdt in -3.',
    hintM: 'De rode lijn is steiler of vlakker. Kijk: 1 stap naar rechts is hoeveel stappen omhoog? Dat is m!'
  },
  {
    goalText: 'Opdracht 2: Een dalende rechte!',
    targetM: -1, targetQ: 4,
    hintQ: 'Waar snijdt de rode lijn de y-as? Zet je slider "q" op die waarde.',
    hintM: 'De rode lijn daalt. Dat betekent dat m negatief moet zijn.'
  },
  {
    goalText: 'Opdracht 3: Een vlakke helling.',
    targetM: 0.5, targetQ: 1,
    hintQ: 'Zet de q slider goed. Dat is de eenvoudigste stap: kruising met de y-as.',
    hintM: 'De lijn stijgt, maar heel zachtjes. Gebruik een komma-getal (breuk) voor m.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

const userM = ref(1) // -5 to 5
const userQ = ref(0) // -5 to 5

const isMatch = computed(() => userM.value === currentLevelData.value.targetM && userQ.value === currentLevelData.value.targetQ)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Verschuif de sliders voor m en q.' };
    userM.value = 1;
    userQ.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (isMatch.value) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magistraal! Je hebt het startgetal en de helling perfect ingesteld.' 
    }
  } else {
    isCorrect.value = false
    
    if (userQ.value !== currentLevelData.value.targetQ) {
        feedback.value = { type: 'error', text: currentLevelData.value.hintQ }
    } else if (userM.value !== currentLevelData.value.targetM) {
        feedback.value = { type: 'error', text: currentLevelData.value.hintM }
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
            
            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner flex flex-col gap-6">
               
               <div class="font-mono font-black text-2xl text-slate-700 bg-white p-4 rounded shadow text-center border-2 border-indigo-200">
                   y = <span class="text-fuchsia-500">{{ userM }}</span>x <span class="text-blue-500">{{ userQ >= 0 ? '+' : '' }} {{ userQ }}</span>
               </div>

               <!-- Slider M -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-fuchsia-700 flex justify-between">
                       <span>m (Richtingscoëfficiënt)</span>
                       <span>{{ userM }}</span>
                   </label>
                   <input type="range" min="-5" max="5" step="0.5" v-model.number="userM" :disabled="isCorrect" class="w-full h-2 bg-fuchsia-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
               </div>

               <!-- Slider Q -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-blue-700 flex justify-between">
                       <span>q (Startgetal / y-as)</span>
                       <span>{{ userQ }}</span>
                   </label>
                   <input type="range" min="-5" max="5" step="1" v-model.number="userQ" :disabled="isCorrect" class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98]">Controleer Functie</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="relative bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-300 p-8 flex items-center justify-center" style="width: 500px; height: 500px;">
                  
                  <!-- Grid from -10 to +10. Center is (250, 250). 1 unit = 25px -->
                  <svg width="400" height="400" viewBox="-200 -200 400 400" class="block">
                      
                      <!-- Grid lines -->
                      <g stroke="#e2e8f0" stroke-width="1">
                          <line v-for="i in 21" :key="'vg'+i" :x1="-250 + (i-1)*25" y1="-200" :x2="-250 + (i-1)*25" y2="200" />
                          <line v-for="i in 21" :key="'hg'+i" x1="-200" :y1="-250 + (i-1)*25" x2="200" :y2="-250 + (i-1)*25" />
                      </g>

                      <!-- Axes -->
                      <line x1="-200" y1="0" x2="200" y2="0" stroke="#475569" stroke-width="3" />
                      <line x1="0" y1="-200" x2="0" y2="200" stroke="#475569" stroke-width="3" />

                      <!-- Target Line (Red Dashed) -->
                      <line :x1="-10 * 25" :y1="-1 * (currentLevelData.targetM * -10 + currentLevelData.targetQ) * 25" 
                            :x2="10 * 25"  :y2="-1 * (currentLevelData.targetM * 10 + currentLevelData.targetQ) * 25" 
                            stroke="#ef4444" stroke-width="4" stroke-dasharray="10 6" class="transition-all duration-300" />

                      <!-- User Line (Blue Solid) -->
                      <line :x1="-10 * 25" :y1="-1 * (userM * -10 + userQ) * 25" 
                            :x2="10 * 25"  :y2="-1 * (userM * 10 + userQ) * 25" 
                            stroke="#0ea5e9" stroke-width="4" class="transition-all duration-300" 
                            :class="isMatch && isChecked ? '!stroke-emerald-500 shadow-[0_0_10px_#10b981]' : ''" />

                      <!-- Highlight q (y-intercept) for user line -->
                      <circle cx="0" :cy="-1 * userQ * 25" r="6" fill="#3b82f6" class="transition-all duration-300" />

                      <!-- Success glow if match -->
                      <circle v-if="isMatch && isChecked" cx="0" :cy="-1 * currentLevelData.targetQ * 25" r="12" fill="none" stroke="#10b981" stroke-width="3" class="animate-pulse" />

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
</style>