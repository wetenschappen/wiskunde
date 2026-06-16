<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhChartBar,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Centrum- en Spreidingsmaten (Boxplot)'
  },
  instruction: {
    type: String,
    default: 'Construeer zelf de boxplot! Sleep de 5 verticale grenzen naar de juiste posities op de getallenas, gebaseerd op de gegeven data.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stel de 5 waarden in met de sliders.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Maak de boxplot voor de volgende testscores:',
    datasetText: 'Scores: 10, 15, 20, 25, 30, 40, 50, 50, 60',
    targets: { min: 10, q1: 17.5, med: 30, q3: 50, max: 60 },
    hint: 'De mediaan is het middelste getal (30). Q1 is het midden van de linkerhelft (tussen 15 en 20). Q3 is het midden van de rechterhelft (50).'
  },
  {
    goalText: 'Opdracht 2: Een data set met uitschieters.',
    datasetText: 'Schoenmaten: 36, 38, 38, 39, 40, 42, 48', // med = 39. left half (36,38,38)->med 38. right half (40,42,48)->med 42.
    targets: { min: 36, q1: 38, med: 39, q3: 42, max: 48 },
    hint: 'Zoek de 5 getallen: Minimum, Q1 (mediaan linkerhelft), Mediaan, Q3 (mediaan rechterhelft), Maximum.'
  },
  {
    goalText: 'Opdracht 3: Maak de perfect symmetrische boxplot.',
    datasetText: 'Verdeling: 100, 110, 120, 130, 140', 
    targets: { min: 100, q1: 105, med: 120, q3: 135, max: 140 }, // mid of 100, 110 is 105. mid of 130, 140 is 135.
    hint: 'Omdat de data perfect symmetrisch is, liggen Q1 en Q3 exact halverwege de kwartieren.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Interactive state (the 5 slider values)
// Provide some arbitrary defaults so they have to move them
const valMin = ref(0)
const valQ1 = ref(0)
const valMed = ref(0)
const valQ3 = ref(0)
const valMax = ref(0)

// Helper to determine reasonable axis ranges per level
const axisMin = computed(() => {
   if (currentInternalLevel.value === 0) return 0;
   if (currentInternalLevel.value === 1) return 30;
   return 80;
})
const axisMax = computed(() => {
   if (currentInternalLevel.value === 0) return 70;
   if (currentInternalLevel.value === 1) return 55;
   return 160;
})

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Stel de 5 waarden in met de sliders.' };
  
  // Set to center-ish to force thinking
  const mid = (axisMax.value + axisMin.value) / 2;
  valMin.value = mid - 10;
  valQ1.value = mid - 5;
  valMed.value = mid;
  valQ3.value = mid + 5;
  valMax.value = mid + 10;
}

function checkAnswer() {
  isChecked.value = true;
  const t = currentLevelData.value.targets;

  const mCorrect = valMin.value === t.min;
  const q1Correct = valQ1.value === t.q1;
  const medCorrect = valMed.value === t.med;
  const q3Correct = valQ3.value === t.q3;
  const maxCorrect = valMax.value === t.max;

  // Enforce ordering visually
  if (!(valMin.value <= valQ1.value && valQ1.value <= valMed.value && valMed.value <= valQ3.value && valQ3.value <= valMax.value)) {
     isCorrect.value = false;
     feedback.value = { type: 'error', text: 'Let op! Je getallen staan door elkaar (bijv. Minimum is groter dan Q1). Dat kan niet in een boxplot.'};
     return;
  }

  if (mCorrect && q1Correct && medCorrect && q3Correct && maxCorrect) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magistraal! Je hebt alle vijf de getallen perfect berekend en visueel opgebouwd.' 
    }
  } else {
    isCorrect.value = false
    
    // Detailed feedback
    if (!mCorrect || !maxCorrect) {
        feedback.value = { type: 'error', text: 'Het minimum of maximum klopt niet. Zoek de uiterste getallen in de dataset.'};
    } else if (!medCorrect) {
        feedback.value = { type: 'error', text: 'De mediaan (middelste getal) is fout. Streep getallen van links en rechts weg tot je in het midden bent.'};
    } else {
        feedback.value = { type: 'error', text: `Q1 of Q3 is fout. ${currentLevelData.value.hint}`};
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
            
            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800 mb-2">{{ currentLevelData.goalText }}</p>
              <div class="bg-white p-2 rounded border border-teal-200 font-mono font-bold text-slate-700 shadow-inner text-sm">
                {{ currentLevelData.datasetText }}
              </div>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Minimum: <span class="font-mono text-teal-600">{{ valMin }}</span></label>
                <input type="range" v-model.number="valMin" :min="axisMin" :max="axisMax" step="0.5" class="w-full accent-teal-600">
              </div>

              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Q1: <span class="font-mono text-teal-600">{{ valQ1 }}</span></label>
                <input type="range" v-model.number="valQ1" :min="axisMin" :max="axisMax" step="0.5" class="w-full accent-teal-600">
              </div>

              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Mediaan: <span class="font-mono text-blue-600">{{ valMed }}</span></label>
                <input type="range" v-model.number="valMed" :min="axisMin" :max="axisMax" step="0.5" class="w-full accent-blue-600">
              </div>

              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Q3: <span class="font-mono text-teal-600">{{ valQ3 }}</span></label>
                <input type="range" v-model.number="valQ3" :min="axisMin" :max="axisMax" step="0.5" class="w-full accent-teal-600">
              </div>

              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Maximum: <span class="font-mono text-teal-600">{{ valMax }}</span></label>
                <input type="range" v-model.number="valMax" :min="axisMin" :max="axisMax" step="0.5" class="w-full accent-teal-600">
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
              
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
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
              
              <div class="relative w-full max-w-2xl h-64 bg-white rounded border border-slate-300 shadow-xl flex flex-col items-center justify-center px-12">
                
                <!-- Dynamic SVG Boxplot -->
                <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none" class="overflow-visible mt-10">
                  
                  <!-- Axis Line -->
                  <line x1="0" y1="80" x2="100" y2="80" stroke="#94a3b8" stroke-width="0.5" />
                  
                  <!-- Transform logic: scale raw values to 0-100% based on axisMin and axisMax -->
                  <g :transform="`scale(${100 / (axisMax - axisMin)}, 1) translate(${-axisMin}, 0)`">
                    
                    <!-- Axis Ticks (Draw a few to give scale context) -->
                    <line v-for="i in 11" :key="i" 
                          :x1="axisMin + ((axisMax - axisMin) / 10) * (i-1)" y1="78" 
                          :x2="axisMin + ((axisMax - axisMin) / 10) * (i-1)" y2="82" 
                          stroke="#94a3b8" stroke-width="0.5" />
                    
                    <text v-for="i in 11" :key="'t'+i" 
                          :x="axisMin + ((axisMax - axisMin) / 10) * (i-1)" y="95" 
                          font-size="4" fill="#64748b" text-anchor="middle" 
                          :transform="`scale(${1 / (100 / (axisMax - axisMin))}, 1) translate(${-(axisMin + ((axisMax - axisMin) / 10) * (i-1)) * (100 / (axisMax - axisMin)) + (axisMin + ((axisMax - axisMin) / 10) * (i-1))}, 0)`">
                          {{ Math.round(axisMin + ((axisMax - axisMin) / 10) * (i-1)) }}
                    </text>

                    <!-- The Live Boxplot -->
                    <g class="transition-all duration-300">
                        <!-- Left Whisker -->
                        <line v-if="valMin <= valQ1" :x1="valMin" y1="40" :x2="valQ1" y2="40" stroke="#0ea5e9" stroke-width="1" />
                        <!-- Right Whisker -->
                        <line v-if="valQ3 <= valMax" :x1="valQ3" y1="40" :x2="valMax" y2="40" stroke="#0ea5e9" stroke-width="1" />
                        
                        <!-- Whisker Ends -->
                        <line :x1="valMin" y1="30" :x2="valMin" y2="50" stroke="#0ea5e9" stroke-width="1" />
                        <line :x1="valMax" y1="30" :x2="valMax" y2="50" stroke="#0ea5e9" stroke-width="1" />
                        
                        <!-- The Box -->
                        <rect v-if="valQ1 <= valQ3" :x="valQ1" y="20" :width="valQ3 - valQ1" height="40" fill="#bae6fd" stroke="#0ea5e9" stroke-width="1" opacity="0.8" />
                        
                        <!-- The Median -->
                        <line v-if="valMed >= valQ1 && valMed <= valQ3" :x1="valMed" y1="20" :x2="valMed" y2="60" stroke="#0284c7" stroke-width="1.5" />
                    </g>

                    <!-- Target Overlay when correct -->
                    <g v-if="isCorrect" class="animate-pulse">
                        <circle :cx="currentLevelData.targets.min" cy="40" r="1.5" fill="#f59e0b" />
                        <circle :cx="currentLevelData.targets.q1" cy="40" r="1.5" fill="#f59e0b" />
                        <circle :cx="currentLevelData.targets.med" cy="40" r="1.5" fill="#f59e0b" />
                        <circle :cx="currentLevelData.targets.q3" cy="40" r="1.5" fill="#f59e0b" />
                        <circle :cx="currentLevelData.targets.max" cy="40" r="1.5" fill="#f59e0b" />
                    </g>
                  </g>
                  
                </svg>

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
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>