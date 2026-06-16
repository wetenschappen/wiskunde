<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhMagnifyingGlass,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Kenmerken Eerstegraadsfuncties'
  },
  instruction: {
    type: String,
    default: 'Zoek de nulwaarde met de scanner en vul het tekenschema in (klik op de + of - tekens in de tabel).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMagnifyingGlass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    f_str: 'f(x) = 2x - 4', f: (x) => 2 * x - 4,
    root: 2,
    signLeft: '-', signRight: '+'
  },
  {
    f_str: 'f(x) = -x + 3', f: (x) => -x + 3,
    root: 3,
    signLeft: '+', signRight: '-'
  },
  {
    f_str: 'f(x) = 0.5x + 2', f: (x) => 0.5 * x + 2,
    root: -4,
    signLeft: '-', signRight: '+'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

const scanX = ref(0)
const userSignLeft = ref('')
const userSignRight = ref('')

function toggleSign(side) {
  if (isCorrect.value) return;
  if (side === 'left') {
    userSignLeft.value = userSignLeft.value === '+' ? '-' : (userSignLeft.value === '-' ? '' : '+');
  } else {
    userSignRight.value = userSignRight.value === '+' ? '-' : (userSignRight.value === '-' ? '' : '+');
  }
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Beweeg de oranje lijn om de nulwaarde op de x-as te vinden.' };
  scanX.value = 0;
  userSignLeft.value = '';
  userSignRight.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value;
  
  const rootCorrect = scanX.value === target.root;
  const signsCorrect = userSignLeft.value === target.signLeft && userSignRight.value === target.signRight;

  if (rootCorrect && signsCorrect) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect! De nulwaarde en het bijbehorende tekenschema kloppen helemaal.' 
    }
  } else if (!rootCorrect) {
    isCorrect.value = false
    feedback.value = { type: 'error', text: 'De nulwaarde klopt niet. Een nulwaarde is de x-coördinaat waar de grafiek de x-as (y=0) snijdt.' }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: 'De nulwaarde klopt, maar de plus/min tekens zijn fout. Ligt de grafiek vóór de nulwaarde onder (-) of boven (+) de x-as?' }
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
            
            <div class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">
              
              <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center">
                 <span class="font-bold text-slate-700">Functie: </span>
                 <span class="font-mono font-black text-xl text-teal-600 ml-2">{{ currentLevelData.f_str }}</span>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">1. Vind de Nulwaarde (x = {{ scanX }})</label>
                <input type="range" v-model.number="scanX" min="-6" max="6" step="0.5" class="w-full accent-orange-500">
                <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>-6</span><span>0</span><span>6</span>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">2. Tekenschema</label>
                <div class="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm overflow-hidden">
                     <table class="w-full border-collapse text-center">
                       <tr>
                         <td class="border-b-2 border-r-2 border-slate-200 text-sm font-bold text-slate-500 py-2 w-12">x</td>
                         <td class="border-b-2 border-slate-200 py-2 w-16"></td>
                         <td class="border-b-2 border-slate-200 font-mono font-bold text-lg text-orange-600">{{ scanX }}</td>
                         <td class="border-b-2 border-slate-200 py-2 w-16"></td>
                       </tr>
                       <tr>
                         <td class="text-sm font-bold text-slate-500 py-2 border-r-2 border-slate-200">f(x)</td>
                         <td class="py-2">
                            <button @click="toggleSign('left')" class="w-10 h-10 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center">
                              {{ userSignLeft }}
                            </button>
                         </td>
                         <td class="font-mono font-bold text-xl text-emerald-600 py-2 bg-emerald-50 rounded">0</td>
                         <td class="py-2">
                            <button @click="toggleSign('right')" class="w-10 h-10 bg-slate-100 rounded hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center">
                              {{ userSignRight }}
                            </button>
                         </td>
                       </tr>
                     </table>
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
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userSignLeft || !userSignRight" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
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
              
              <!-- Coordinate System SVG -->
              <svg width="450" height="450" viewBox="-8 -8 16 16" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="0.1">
                  <line v-for="i in 17" :key="'v'+i" :x1="i-9" y1="-8" :x2="i-9" y2="8" />
                  <line v-for="i in 17" :key="'h'+i" x1="-8" :y1="i-9" x2="8" :y2="i-9" />
                </g>

                <!-- Zone coloring based on signs -->
                <!-- Left Zone -->
                <rect v-if="userSignLeft === '+'" x="-8" y="-8" :width="scanX + 8" height="8" fill="#10b981" opacity="0.1" />
                <rect v-if="userSignLeft === '-'" x="-8" y="0" :width="scanX + 8" height="8" fill="#ef4444" opacity="0.1" />
                <!-- Right Zone -->
                <rect v-if="userSignRight === '+'" :x="scanX" y="-8" :width="8 - scanX" height="8" fill="#10b981" opacity="0.1" />
                <rect v-if="userSignRight === '-'" :x="scanX" y="0" :width="8 - scanX" height="8" fill="#ef4444" opacity="0.1" />

                <!-- Axes -->
                <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748b" stroke-width="0.2" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" stroke-width="0.2" />
                
                <!-- The Graph -->
                <line x1="-8" :y1="-currentLevelData.f(-8)" x2="8" :y2="-currentLevelData.f(8)" stroke="#0d9488" stroke-width="0.3" stroke-linecap="round" />
                
                <!-- Scanner Line -->
                <line :x1="scanX" y1="-8" :x2="scanX" y2="8" stroke="#f97316" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-150" />
                <circle :cx="scanX" cy="0" r="0.3" fill="#f97316" class="transition-all duration-150 shadow-sm" />
                
                <!-- Correct highlight -->
                <circle v-if="isCorrect" :cx="currentLevelData.root" cy="0" r="0.5" fill="#f97316" class="animate-pulse" />
                
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
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>