<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
    default: 'Soorten Diagrammen'
  },
  instruction: {
    type: String,
    default: 'Kies voor de gegeven datasets welk diagram het meest geschikt is (staafdiagram, cirkeldiagram of histogram).'
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
const feedback = ref({ type: 'info', text: '' })

// Scenarios
const scenarios = [
  { id: 1, data: 'Lengtes van leerlingen gegroepeerd in klassen (bv. 160-170 cm).', type: 'continue', correct: 'Histogram' },
  { id: 2, data: 'Kleur van de ogen van leerlingen (blauw, bruin, groen).', type: 'categorisch', correct: 'Cirkeldiagram of Staafdiagram' },
  { id: 3, data: 'Aantal broers/zussen (0, 1, 2, 3+).', type: 'discreet', correct: 'Staafdiagram' }
]

const currentScenarioIndex = ref(0)
const currentScenario = computed(() => scenarios[currentScenarioIndex.value])
const userChoice = ref(null)

const options = [
  'Staafdiagram',
  'Cirkeldiagram of Staafdiagram',
  'Histogram'
]

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userChoice.value = null;
  currentScenarioIndex.value = Math.floor(Math.random() * scenarios.length);
}

function checkAnswer() {
  isChecked.value = true;
  if (userChoice.value === currentScenario.value.correct) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Correct! Omdat de data ' + currentScenario.value.type + ' is, is dit de beste voorstelling.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Fout. Bedenk of de data discreet, categorisch of gegroepeerd continu is.'
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
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
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">
              
              <div class="bg-white p-4 border border-slate-200 rounded text-lg shadow-sm font-medium text-slate-700">
                "{{ currentScenario.data }}"
              </div>

              <div>
                <p class="font-bold text-slate-800 mb-2">Kies het juiste diagram:</p>
                <div class="flex flex-col gap-2">
                  <button v-for="opt in options" :key="opt"
                          @click="() => { if(!isCorrect) { userChoice = opt; isChecked = false; } }"
                          class="p-4 border-2 rounded-lg font-bold transition-all text-center"
                          :class="userChoice === opt ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-teal-300 bg-white text-slate-700'">
                    {{ opt }}
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userChoice" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">
              
              <!-- Visuals for the 3 types -->
              <div class="flex flex-col gap-6">
                <!-- Bar chart -->
                <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-end gap-2 h-32 w-48 relative overflow-hidden"
                     :class="{ 'ring-4 ring-teal-400': userChoice === 'Staafdiagram' || userChoice === 'Cirkeldiagram of Staafdiagram' }">
                   <div class="w-8 bg-blue-400 rounded-t h-16 mx-auto"></div>
                   <div class="w-8 bg-emerald-400 rounded-t h-24 mx-auto"></div>
                   <div class="w-8 bg-rose-400 rounded-t h-12 mx-auto"></div>
                   <div class="absolute bottom-1 left-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Staafdiagram</div>
                </div>

                <!-- Histogram (touching bars) -->
                <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-end h-32 w-48 relative overflow-hidden"
                     :class="{ 'ring-4 ring-teal-400': userChoice === 'Histogram' }">
                   <div class="flex-1 bg-indigo-500 h-10 border-r border-white"></div>
                   <div class="flex-1 bg-indigo-500 h-20 border-r border-white"></div>
                   <div class="flex-1 bg-indigo-500 h-24 border-r border-white"></div>
                   <div class="flex-1 bg-indigo-500 h-16 border-r border-white"></div>
                   <div class="flex-1 bg-indigo-500 h-8"></div>
                   <div class="absolute bottom-1 left-2 text-xs font-bold text-slate-400 uppercase tracking-widest z-10">Histogram</div>
                </div>
              </div>

              <!-- Pie chart -->
              <div class="bg-white p-8 rounded-xl shadow-md border border-slate-200 flex items-center justify-center relative overflow-hidden h-64 w-64"
                   :class="{ 'ring-4 ring-teal-400': userChoice === 'Cirkeldiagram of Staafdiagram' }">
                 <svg viewBox="0 0 32 32" class="w-48 h-48 rounded-full transform -rotate-90">
                    <circle r="16" cx="16" cy="16" fill="#fbbf24" stroke="white" stroke-width="1" stroke-dasharray="100 100" />
                    <circle r="16" cx="16" cy="16" fill="#38bdf8" stroke="white" stroke-width="1" stroke-dasharray="60 100" />
                    <circle r="16" cx="16" cy="16" fill="#a78bfa" stroke="white" stroke-width="1" stroke-dasharray="20 100" />
                 </svg>
                 <div class="absolute bottom-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Cirkeldiagram</div>
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