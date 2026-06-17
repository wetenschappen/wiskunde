<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartBar, PhArrowClockwise, PhTable, PhSortAscending
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

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
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Kies een grafiektype en klik op een antwoord.' })

// Domain Logic
const rawData = [
  { month: 'Jan', value: 85 }, { month: 'Feb', value: 72 },
  { month: 'Mrt', value: 65 }, { month: 'Apr', value: 50 },
  { month: 'Mei', value: 60 }, { month: 'Jun', value: 75 },
  { month: 'Jul', value: 80 }, { month: 'Aug', value: 95 },
  { month: 'Sep', value: 110 }, { month: 'Okt', value: 130 },
  { month: 'Nov', value: 105 }, { month: 'Dec', value: 90 }
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel(index) {
  const sorted = [...rawData].sort((a, b) => b.value - a.value)
  switch (index) {
    case 0: {
      const highest = sorted[0]
      const others = sorted.slice(1, 5).map(d => d.month)
      const options = shuffle([highest.month, ...others])
      return {
        goalText: `Opdracht 1: Wat was de natste maand (hoogste neerslag)?`,
        options,
        targetVal: highest.month,
        hint: 'Kijk naar de hoogste staaf in het staafdiagram of sorteer de data.'
      }
    }
    case 1: {
      const lowest = sorted[sorted.length - 1]
      const others = sorted.slice(0, 4).map(d => d.month)
      const options = shuffle([lowest.month, ...others])
      return {
        goalText: `Opdracht 2: Wat was de droogste maand (laagste neerslag)?`,
        options,
        targetVal: lowest.month,
        hint: 'Welke staaf is het kortst? Of wat staat onderaan als je sorteert?'
      }
    }
    case 2: {
      const thresholds = [75, 85, 95, 105]
      const threshold = thresholds[Math.floor(Math.random() * thresholds.length)]
      const count = rawData.filter(d => d.value > threshold).length
      const options = shuffle([String(count), String(count + 1), String(Math.max(count - 1, 0)), String(count + 2), String(Math.max(count - 2, 0))].slice(0, 5))
      const uniqueOptions = [...new Set(options)].slice(0, 5)
      if (uniqueOptions.length < 4) {
        for (let i = 0; i < 5; i++) {
          if (!uniqueOptions.includes(String(i))) { uniqueOptions.push(String(i)); if (uniqueOptions.length >= 5) break }
        }
      }
      return {
        goalText: `Opdracht 3: Hoeveel maanden hadden MEER dan ${threshold} mm neerslag?`,
        options: uniqueOptions.slice(0, 5),
        targetVal: String(count),
        hint: `Tel het aantal staven dat hoger is dan de ${threshold} mm lijn.`
      }
    }
    default:
      return { goalText: 'Opdracht 1: Wat was de natste maand?', options: ['Jan', 'Mei', 'Aug', 'Okt', 'Nov'], targetVal: 'Okt', hint: 'Kijk naar het staafdiagram.' }
  }
}

const levels = ref([
  generateLevel(0),
  generateLevel(1),
  generateLevel(2)
])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userSelection = ref('')

const currentView = ref('table')
const isSorted = ref(false)

const displayData = computed(() => {
    let data = [...rawData]
    if (isSorted.value) {
        data.sort((a, b) => b.value - a.value)
    }
    return data
})

const maxValue = computed(() => Math.max(...rawData.map(d => d.value)))

function selectOption(opt) {
    if (isCorrect.value) return
    userSelection.value = opt
    isChecked.value = true

    if (opt === currentLevelData.value.targetVal) {
        isCorrect.value = true
        attemptCount.value = 0
        feedback.value = {
            type: 'success',
            text: 'Helemaal juist! Met ICT vind je razendsnel het antwoord in grote datasets.'
        }
    } else {
        attemptCount.value++
        const hintIdx = Math.min(attemptCount.value - 1, 2)
        const hints = [
            `Niet correct. ${currentLevelData.value.hint}`,
            `Probeer een andere weergave. Het juiste antwoord is ${currentLevelData.value.targetVal}.`,
            `Antwoord: ${currentLevelData.value.targetVal}`
        ]
        feedback.value = { type: 'error', text: hints[hintIdx] }
    }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Kies een grafiektype en klik op een antwoord.' };
    userSelection.value = '';
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ];
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    nextTick(() => mainArea.value?.focus())
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-blue-50 p-4 border border-blue-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-blue-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl">
               <label class="block text-sm font-bold text-slate-700 mb-3">Jouw Antwoord:</label>
               <div class="flex flex-col gap-2">
                 <button v-for="opt in currentLevelData.options" :key="opt"
                         @click="selectOption(opt)"
                         class="p-4 border-2 rounded-lg font-bold transition-all text-left active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                         :class="userSelection === opt ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'">
                   {{ opt }}
                 </button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-4 text-center text-sm font-medium text-slate-400">Klik op een antwoord hiernaast</div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] bg-white rounded-xl border-2 border-slate-200/50 p-6 shadow-sm">

              <!-- ICT Controls -->
              <div class="w-full max-w-4xl flex gap-4 mb-6">
                  <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                      <button @click="currentView = 'table'" class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="currentView === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                          <PhTable weight="bold" /> Ruwe Tabel
                      </button>
                      <button @click="currentView = 'bar'" class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="currentView === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                          <PhChartBar weight="bold" /> Staafdiagram
                      </button>
                  </div>

                  <button @click="isSorted = !isSorted" class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm border shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="isSorted ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
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
                                  <th class="p-4">Maand</th>
                                  <th class="p-4">Neerslag (mm)</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="d in displayData" :key="d.month" class="border-b border-slate-200 hover:bg-white transition-colors">
                                  <td class="p-4 font-bold text-slate-700">{{ d.month }}</td>
                                  <td class="p-4 text-slate-600">{{ d.value }} mm</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  <!-- BAR CHART VIEW -->
                  <div v-else-if="currentView === 'bar'" class="flex-1 flex items-end gap-2 px-4 pt-10 pb-6 border-b-2 border-slate-400 relative animate-fadeIn">
                      <!-- Grid lines -->
                      <div class="absolute inset-x-4 inset-y-10 flex flex-col justify-between pointer-events-none z-0">
                          <div v-for="i in 5" :key="i" class="border-t border-slate-200/60 w-full h-0 relative">
                             <span v-if="i===2 && currentInternalLevel===2" class="absolute -top-4 right-0 text-xs font-bold text-red-500 bg-white px-1">grens</span>
                             <div v-if="i===2 && currentInternalLevel===2" class="absolute inset-x-0 border-t-2 border-dashed border-red-400"></div>
                          </div>
                      </div>

                      <div v-for="d in displayData" :key="d.month" class="flex-1 flex flex-col items-center justify-end h-full z-10 group relative transition-all duration-500 ease-out"
                           :style="{ height: `${(d.value / maxValue) * 100}%` }">
                          <div class="w-full bg-blue-500 rounded-t-sm shadow-md group-hover:bg-blue-400 transition-colors h-full flex flex-col items-center justify-start pt-2">
                              <span class="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded-lg -translate-y-8 absolute pointer-events-none transition-opacity">
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
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
