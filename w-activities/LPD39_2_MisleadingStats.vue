<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhEye,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Misleidende Grafieken Herstellen'
  },
  instruction: {
    type: String,
    default: 'Deze grafieken wekken een verkeerde indruk door een visuele truc. Gebruik de slider om de grafiek te "herstellen" naar een eerlijke, wiskundig correcte weergave!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhEye }
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
    goalText: 'Opdracht 1: De y-as afsnijding.',
    trickDesc: 'Groep B lijkt dubbel zo groot als Groep A! Herstel de startwaarde van de y-as.',
    valA: 50, valB: 55,
    sliderMin: 0, sliderMax: 45, sliderStep: 5,
    sliderLabel: 'Startwaarde y-as',
    targetVal: 0,
    initVal: 45,
    success: 'Juist! Door de y-as bij 0 te laten beginnen, zie je dat het verschil (50 vs 55) eigenlijk heel klein is.'
  },
  {
    goalText: 'Opdracht 2: Oppervlakte vs Hoogte.',
    trickDesc: 'Merk B verkoopt 2x zoveel als Merk A (20 vs 10). Maar de staaf van B ziet er 4x zo groot uit! Waarom?',
    valA: 10, valB: 20,
    sliderMin: 1, sliderMax: 2, sliderStep: 0.1,
    sliderLabel: 'Breedte-factor Merk B',
    targetVal: 1,
    initVal: 2,
    success: 'Correct! Als de waarde 2x groter wordt, mag je alleen de HOOGTE 2x groter maken. Als je ook de breedte verdubbelt, wordt de oppervlakte 4x zo groot. Dat is pure misleiding!'
  },
  {
    goalText: 'Opdracht 3: De Inverteerde Y-as.',
    trickDesc: 'Het aantal misdaden lijkt spectaculair te dalen... of toch niet? Bekijk de y-as heel goed!',
    valA: 100, valB: 200, valC: 300,
    sliderMin: -1, sliderMax: 1, sliderStep: 2, // -1 means inverted, 1 means normal
    sliderLabel: 'Richting y-as (Flip)',
    targetVal: 1,
    initVal: -1,
    success: 'BAM! Door de y-as ondersteboven te zetten (hoog naar laag), leek een stijging op een daling. Een beruchte truc in de media!'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const sliderVal = ref(0)

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Beweeg de slider om de grafiek te herstellen.' };
  sliderVal.value = currentLevelData.value.initVal;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (sliderVal.value === currentLevelData.value.targetVal) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: currentLevelData.value.success 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Nog niet helemaal hersteld. Blijf schuiven totdat de grafiek een volkomen neutrale en wiskundig eerlijke weergave toont.'
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
            
            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800 mb-1">{{ currentLevelData.goalText }}</p>
              <p class="text-xs text-orange-700">{{ currentLevelData.trickDesc }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <label class="block mb-2 text-sm font-bold text-slate-700">{{ currentLevelData.sliderLabel }}</label>
              
              <!-- Special handling for level 3 slider -->
              <input v-if="currentInternalLevel < 2" type="range" v-model.number="sliderVal" :min="currentLevelData.sliderMin" :max="currentLevelData.sliderMax" :step="currentLevelData.sliderStep" :disabled="isCorrect" class="w-full accent-orange-600">
              
              <div v-else class="flex gap-2">
                <button @click="sliderVal = -1" class="flex-1 py-2 rounded-lg font-bold border-2 transition-all" :class="sliderVal === -1 ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500'">Misleidend</button>
                <button @click="sliderVal = 1" class="flex-1 py-2 rounded-lg font-bold border-2 transition-all" :class="sliderVal === 1 ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500'">Eerlijk</button>
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
              
              <!-- Level 1: Y-axis Truncation -->
              <div v-if="currentInternalLevel === 0" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <!-- Y-axis values -->
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-slate-500 text-sm py-4 transition-all">
                  <span>60</span>
                  <!-- Range is 60 - sliderVal -->
                  <span>{{ Math.round(60 - (60 - sliderVal) * 0.25) }}</span>
                  <span>{{ Math.round(60 - (60 - sliderVal) * 0.5) }}</span>
                  <span>{{ Math.round(60 - (60 - sliderVal) * 0.75) }}</span>
                  <span :class="sliderVal > 0 ? 'text-red-500' : 'text-emerald-500'">{{ sliderVal }}</span>
                </div>
                <!-- Grid lines -->
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <!-- Bars -->
                <div class="relative w-full h-full flex justify-around items-end z-10 px-8">
                  <div class="flex flex-col items-center w-24 group">
                    <div class="w-full bg-blue-500 transition-all duration-300 shadow-sm" :style="{ height: `${((50 - sliderVal) / (60 - sliderVal)) * 100}%` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600">Groep A (50)</span>
                  </div>
                  <div class="flex flex-col items-center w-24 group">
                    <div class="w-full bg-emerald-500 transition-all duration-300 shadow-sm" :style="{ height: `${((55 - sliderVal) / (60 - sliderVal)) * 100}%` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600">Groep B (55)</span>
                  </div>
                </div>
              </div>

              <!-- Level 2: Area Distortion -->
              <div v-if="currentInternalLevel === 1" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-slate-500 text-sm py-4">
                  <span>20</span><span>15</span><span>10</span><span>5</span><span>0</span>
                </div>
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <div class="relative w-full h-full flex justify-around items-end z-10 px-8 gap-8">
                  <div class="flex flex-col items-center justify-end h-full">
                    <!-- Base width is 40px -->
                    <div class="bg-blue-500 transition-all duration-300 shadow-sm w-[40px]" style="height: 50%;"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600 whitespace-nowrap">Merk A (10)</span>
                  </div>
                  <div class="flex flex-col items-center justify-end h-full">
                    <!-- Width is 40px * sliderVal -->
                    <div class="bg-emerald-500 transition-all duration-300 shadow-sm" :style="{ height: '100%', width: `${40 * sliderVal}px` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600 whitespace-nowrap">Merk B (20)</span>
                  </div>
                </div>
              </div>

              <!-- Level 3: Inverted Y-axis -->
              <div v-if="currentInternalLevel === 2" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <!-- Y-axis values. If sliderVal === -1 (inverted), 0 is top, 400 is bottom. -->
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-sm py-4 transition-all" :class="sliderVal === -1 ? 'text-red-500' : 'text-slate-500'">
                  <span>{{ sliderVal === -1 ? '0' : '400' }}</span>
                  <span>{{ sliderVal === -1 ? '100' : '300' }}</span>
                  <span>{{ sliderVal === -1 ? '200' : '200' }}</span>
                  <span>{{ sliderVal === -1 ? '300' : '100' }}</span>
                  <span>{{ sliderVal === -1 ? '400' : '0' }}</span>
                </div>
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <!-- Line Chart Points. Values: 100, 200, 300. -->
                <!-- If normal (1): 100 is 25% height, 200 is 50%, 300 is 75%. -->
                <!-- If inverted (-1): 100 is 75% height, 200 is 50%, 300 is 25%. -->
                <svg class="absolute inset-x-12 top-4 bottom-10 w-full h-full overflow-visible z-10">
                   <polyline fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
                             class="transition-all duration-700"
                             :points="`
                               50,${sliderVal === 1 ? 100 - (100/400)*100 : (100/400)*100}% 
                               150,${sliderVal === 1 ? 100 - (200/400)*100 : (200/400)*100}% 
                               250,${sliderVal === 1 ? 100 - (300/400)*100 : (300/400)*100}%`" />
                   
                   <circle cx="50" :cy="`${sliderVal === 1 ? 100 - (100/400)*100 : (100/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                   <circle cx="150" :cy="`${sliderVal === 1 ? 100 - (200/400)*100 : (200/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                   <circle cx="250" :cy="`${sliderVal === 1 ? 100 - (300/400)*100 : (300/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                </svg>

                <div class="absolute -bottom-8 w-full flex justify-around px-8 font-bold text-slate-600">
                   <span>2023</span><span>2024</span><span>2025</span>
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