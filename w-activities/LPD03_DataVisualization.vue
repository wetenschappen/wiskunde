<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartBar, PhArrowClockwise, PhTable, PhSortAscending
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: Data Visualiseren' },
  instruction: { 
    type: String, 
    default: 'Gebruik de ICT-knoppen (Staafdiagram, Sorteer) om de dataset te analyseren en beantwoord de vraag.' 
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
const feedback = ref({ type: 'info', text: 'Kies een grafiektype en analyseer de data.' })

// Domain Logic
const rawData = [
  { month: 'Jan', value: 85 }, { month: 'Feb', value: 72 },
  { month: 'Mrt', value: 65 }, { month: 'Apr', value: 50 },
  { month: 'Mei', value: 60 }, { month: 'Jun', value: 75 },
  { month: 'Jul', value: 80 }, { month: 'Aug', value: 95 },
  { month: 'Sep', value: 110 }, { month: 'Okt', value: 130 },
  { month: 'Nov', value: 105 }, { month: 'Dec', value: 90 }
]

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Wat was de natste maand (hoogste neerslag)?',
    options: ['Jan', 'Mei', 'Aug', 'Okt', 'Nov'],
    targetVal: 'Okt',
    hint: 'Sorteer de data of kijk naar de hoogste staaf in het staafdiagram.'
  },
  {
    goalText: 'Opdracht 2: Wat was de droogste maand (laagste neerslag)?',
    options: ['Feb', 'Apr', 'Mei', 'Dec', 'Mrt'],
    targetVal: 'Apr',
    hint: 'Welke staaf is het kortst? Of wat staat onderaan als je sorteert?'
  },
  {
    goalText: 'Opdracht 3: Hoeveel maanden hadden MEER dan 90 mm neerslag?',
    options: ['2', '3', '4', '5', '6'],
    targetVal: '3', // Sep (110), Okt (130), Nov (105) -> 3 months
    hint: 'Tel het aantal staven dat hoger is dan de 90 mm lijn.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const userSelection = ref('')

const currentView = ref('table') // 'table', 'bar'
const isSorted = ref(false)

const displayData = computed(() => {
    let data = [...rawData]
    if (isSorted.value) {
        data.sort((a, b) => b.value - a.value)
    }
    return data
})

const maxValue = computed(() => Math.max(...rawData.map(d => d.value)))

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kies een grafiektype en analyseer de data.' };
    userSelection.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  if (userSelection.value === currentLevelData.value.targetVal) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Helemaal juist! Met ICT vind je razendsnel het antwoord in grote datasets.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: `Niet correct. ${currentLevelData.value.hint}`}
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    // Keep user's preferred view (bar vs table) but reset sort to make them think
    isSorted.value = false;
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    currentView.value = 'table';
    isSorted.value = false;
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-blue-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-blue-50 p-4 border border-blue-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-blue-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl">
               <label class="block text-sm font-bold text-slate-700 mb-3">Jouw Antwoord:</label>
               <div class="flex flex-col gap-2">
                 <button v-for="opt in currentLevelData.options" :key="opt"
                         @click="() => { if(!isCorrect) { userSelection = opt; isChecked = false; } }"
                         class="p-3 border-2 rounded-lg font-bold transition-all text-left"
                         :class="userSelection === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'">
                   {{ opt }}
                 </button>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userSelection" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] bg-white rounded-2xl border-2 border-slate-200/50 p-6 shadow-sm">
              
              <!-- ICT Controls -->
              <div class="w-full max-w-4xl flex gap-4 mb-6">
                  <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                      <button @click="currentView = 'table'" class="flex items-center gap-2 px-4 py-2 rounded font-bold transition-all text-sm" :class="currentView === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                          <PhTable weight="bold" /> Ruwe Tabel
                      </button>
                      <button @click="currentView = 'bar'" class="flex items-center gap-2 px-4 py-2 rounded font-bold transition-all text-sm" :class="currentView === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                          <PhChartBar weight="bold" /> Staafdiagram
                      </button>
                  </div>
                  
                  <button @click="isSorted = !isSorted" class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm border shadow-sm" :class="isSorted ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
                      <PhSortAscending weight="bold" /> {{ isSorted ? 'Sortering Uit' : 'Sorteer Data' }}
                  </button>
              </div>

              <!-- Visualisation Area -->
              <div class="w-full max-w-4xl flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col p-6">
                  
                  <!-- TABLE VIEW -->
                  <div v-if="currentView === 'table'" class="flex-1 overflow-auto animate-fadeIn">
                      <table class="w-full text-left border-collapse">
                          <thead>
                              <tr class="border-b-2 border-slate-300 text-slate-500 uppercase text-xs tracking-wider">
                                  <th class="p-3">Maand</th>
                                  <th class="p-3">Neerslag (mm)</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="d in displayData" :key="d.month" class="border-b border-slate-200 hover:bg-white transition-colors">
                                  <td class="p-3 font-bold text-slate-700">{{ d.month }}</td>
                                  <td class="p-3 text-slate-600">{{ d.value }} mm</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <!-- BAR CHART VIEW -->
                  <div v-else-if="currentView === 'bar'" class="flex-1 flex items-end gap-2 px-4 pt-10 pb-6 border-b-2 border-slate-400 relative animate-fadeIn">
                      <!-- Grid lines -->
                      <div class="absolute inset-x-4 inset-y-10 flex flex-col justify-between pointer-events-none z-0">
                          <div v-for="i in 5" :key="i" class="border-t border-slate-200/60 w-full h-0 relative">
                             <!-- Show 90mm line specially if level 3 -->
                             <span v-if="i===2 && currentInternalLevel===2" class="absolute -top-4 right-0 text-xs font-bold text-red-500 bg-white px-1">90 mm grens</span>
                             <div v-if="i===2 && currentInternalLevel===2" class="absolute inset-x-0 border-t-2 border-dashed border-red-400"></div>
                          </div>
                      </div>

                      <div v-for="d in displayData" :key="d.month" class="flex-1 flex flex-col items-center justify-end h-full z-10 group relative transition-all duration-500 ease-out"
                           :style="{ height: `${(d.value / maxValue) * 100}%` }">
                          <div class="w-full bg-blue-500 rounded-t-sm shadow-md group-hover:bg-blue-400 transition-colors h-full flex flex-col items-center justify-start pt-2">
                              <!-- Tooltip on hover -->
                              <span class="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded -translate-y-8 absolute pointer-events-none transition-opacity">
                                  {{ d.value }}mm
                              </span>
                          </div>
                          <span class="absolute -bottom-6 text-xs font-bold text-slate-500">{{ d.month }}</span>
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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>