<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rationale Getallen: Vermenigvuldigen' },
  instruction: { 
    type: String, 
    default: 'Breuken vermenigvuldigen lijkt op een formule (teller x teller, noemer x noemer), maar visueel is het de oppervlakte van een rechthoek!<br/><br/><strong>Opdracht:</strong> Gebruik de verticale slider om de ene breuk (geel) te selecteren. Gebruik de horizontale slider om de andere (blauw) te selecteren. Kijk naar het groene overlappende deel.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg beide sliders om de breuken te visualiseren.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: De basis',
    num1: 1, den1: 2, num2: 3, den2: 4, cols: 4, rows: 2, targetNum: 3, targetDen: 8, targetX: 3, targetY: 1
  },
  {
    goalText: 'Opdracht 2: Een groter raster',
    num1: 2, den1: 3, num2: 4, den2: 5, cols: 5, rows: 3, targetNum: 8, targetDen: 15, targetX: 4, targetY: 2
  },
  {
    goalText: 'Opdracht 3: Zelf nadenken',
    num1: 1, den1: 4, num2: 2, den2: 3, cols: 3, rows: 4, targetNum: 2, targetDen: 12, targetX: 2, targetY: 1
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const selX = ref(0) 
const selY = ref(0) 

const userNum = ref(null)
const userDen = ref(null)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg beide sliders om de breuken te visualiseren.' };
    selX.value = 0;
    selY.value = 0;
    userNum.value = null;
    userDen.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  const data = currentLevelData.value;

  // First check if the visual model is correct
  if (selX.value !== data.targetX || selY.value !== data.targetY) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: `De visualisatie klopt nog niet. Zorg dat je horizontaal ${data.num2}/${data.den2} kleurt, en verticaal ${data.num1}/${data.den1}.`}
      return
  }

  // Then check the numerical answer
  if (userNum.value === data.targetNum && userDen.value === data.targetDen) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! Je ziet dat het hele rooster uit ${data.targetDen} stukken bestaat (noemer x noemer). De groene overlap is ${data.targetNum} stukken groot (teller x teller).` 
    }
  } else {
    isCorrect.value = false
    
    if (userNum.value !== data.targetNum) {
        feedback.value = { type: 'error', text: `Kijk naar de GROENE (overlappende) vlakjes. Hoeveel zijn het er? Vul dit bovenaan in (de teller).`}
    } else if (userDen.value !== data.targetDen) {
        feedback.value = { type: 'error', text: `Uit hoeveel kleine vlakjes bestaat de Grote Vierkant in TOTAAL nu? Vul dit onderaan in (de noemer).`}
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
               <label class="block text-sm font-bold text-teal-900 mb-4">Wat is de groene breuk?</label>
               <div class="flex items-center gap-4 justify-center">
                   <div class="font-mono font-black text-2xl text-slate-500">
                       <div class="flex flex-col items-center">
                           <span>{{ currentLevelData.num1 }}</span>
                           <div class="h-1 w-full bg-slate-400 my-1"></div>
                           <span>{{ currentLevelData.den1 }}</span>
                       </div>
                   </div>
                   <span class="font-bold text-lg text-slate-400">×</span>
                   <div class="font-mono font-black text-2xl text-slate-500">
                       <div class="flex flex-col items-center">
                           <span>{{ currentLevelData.num2 }}</span>
                           <div class="h-1 w-full bg-slate-400 my-1"></div>
                           <span>{{ currentLevelData.den2 }}</span>
                       </div>
                   </div>
                   <span class="font-bold text-lg text-slate-400">=</span>
                   
                   <div class="flex flex-col items-center gap-1 w-16">
                       <input type="number" v-model.number="userNum" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-teal-300 rounded focus:border-teal-500 focus:ring-teal-500 text-center" />
                       <div class="h-1 w-full bg-slate-700 rounded-full"></div>
                       <input type="number" v-model.number="userDen" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-teal-300 rounded focus:border-teal-500 focus:ring-teal-500 text-center" />
                   </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (userNum === null || userDen === null)" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="relative flex flex-col items-center">
                  
                  <!-- Y Slider (for fraction 1) -->
                  <div class="absolute -left-16 top-0 bottom-0 flex flex-col items-center justify-between pb-8">
                      <span class="font-bold text-blue-600 mb-2">{{ currentLevelData.num1 }}/{{ currentLevelData.den1 }}</span>
                      <input type="range" min="0" :max="currentLevelData.rows" step="1" v-model.number="selY" :disabled="isCorrect"
                             class="h-64 appearance-none cursor-pointer accent-blue-500 slider-vertical" 
                             style="width: 8px; writing-mode: vertical-lr; direction: rtl; transform: rotate(180deg);" />
                  </div>

                  <!-- The Grid -->
                  <div class="relative bg-white border-4 border-slate-300 shadow-lg" style="width: 400px; height: 300px;">
                      
                      <!-- Grid container dynamic cols/rows -->
                      <div class="absolute inset-0 grid"
                           :style="{ gridTemplateColumns: `repeat(${currentLevelData.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${currentLevelData.rows}, minmax(0, 1fr))` }">
                          <template v-for="y in currentLevelData.rows" :key="'ry'+y">
                              <template v-for="x in currentLevelData.cols" :key="'rx'+x">
                                  
                                  <div class="border border-slate-200 transition-colors duration-300"
                                       :class="{
                                           'bg-emerald-400': x <= selX && y <= selY,
                                           'bg-amber-300': x <= selX && y > selY,
                                           'bg-blue-300': x > selX && y <= selY,
                                           'bg-transparent': x > selX && y > selY
                                       }">
                                  </div>

                              </template>
                          </template>
                      </div>

                  </div>

                  <!-- X Slider (for fraction 2) -->
                  <div class="w-[400px] mt-8 flex flex-col items-center">
                      <input type="range" min="0" :max="currentLevelData.cols" step="1" v-model.number="selX" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                      <span class="font-bold text-amber-600 mt-2">{{ currentLevelData.num2 }}/{{ currentLevelData.den2 }}</span>
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

/* Horizontal slider */
input[type=range]:not(.slider-vertical)::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #f59e0b;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-top: -11px;
}
input[type=range]:not(.slider-vertical)::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}

/* Vertical slider */
input[type=range].slider-vertical::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #3b82f6;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-left: -8px; 
}
input[type=range].slider-vertical::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>