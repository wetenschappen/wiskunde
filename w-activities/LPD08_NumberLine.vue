<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSortAscending, PhArrowClockwise, PhCaretUp, PhCaretDown
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rationale Getallen: Ordenen' },
  instruction: { 
    type: String, 
    default: 'Mensen denken vaak dat 1/4 groter is dan 1/2 omdat 4 groter is dan 2. Dat klopt natuurlijk niet!<br/><br/><strong>Opdracht:</strong> Sorteer de rationale getallen van <strong>klein naar groot</strong>. Gebruik de pijltjesknoppen om de blokken omhoog of omlaag te verplaatsen.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSortAscending }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk goed naar de visuele balken (Bar Models) om de grootte in te schatten.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Positieve Breuken',
    initialItems: [
        { id: 1, label: '3/4', value: 0.75, fractionParts: [3, 4] },
        { id: 2, label: '1/3', value: 0.333, fractionParts: [1, 3] },
        { id: 3, label: '1/2', value: 0.5, fractionParts: [1, 2] }
    ]
  },
  {
    goalText: 'Opdracht 2: Inclusief Negatieve Getallen',
    initialItems: [
        { id: 4, label: '-0.5', value: -0.5, fractionParts: null },
        { id: 5, label: '1/4', value: 0.25, fractionParts: [1, 4] },
        { id: 6, label: '-3/4', value: -0.75, fractionParts: [3, 4] }
    ]
  },
  {
    goalText: 'Opdracht 3: De Mix (Breuken en Kommagetallen)',
    initialItems: [
        { id: 7, label: '0.8', value: 0.8, fractionParts: null },
        { id: 8, label: '2/3', value: 0.666, fractionParts: [2, 3] },
        { id: 9, label: '-0.2', value: -0.2, fractionParts: null },
        { id: 10, label: '-1/3', value: -0.333, fractionParts: [1, 3] }
    ]
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const items = ref([...levels[0].initialItems]) // Clone

function moveUp(index) {
    if (index > 0 && !isCorrect.value) {
        const temp = items.value[index]
        items.value[index] = items.value[index - 1]
        items.value[index - 1] = temp
        isChecked.value = false;
    }
}

function moveDown(index) {
    if (index < items.value.length - 1 && !isCorrect.value) {
        const temp = items.value[index]
        items.value[index] = items.value[index + 1]
        items.value[index + 1] = temp
        isChecked.value = false;
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kijk goed naar de visuele balken (Bar Models) om de grootte in te schatten.' };
    items.value = [...levels[currentInternalLevel.value].initialItems]
}

function checkAnswer() {
  isChecked.value = true;
  
  // Check if sorted ascending
  let isSorted = true;
  for (let i = 0; i < items.value.length - 1; i++) {
      if (items.value[i].value > items.value[i+1].value) {
          isSorted = false;
          break;
      }
  }

  if (isSorted) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Uitstekend! Je hebt de getallen correct van klein naar groot geordend op de getallenas.' 
    }
  } else {
    isCorrect.value = false
    
    // Didactic feedback based on specific common errors
    const index0 = items.value[0].value
    
    if (index0 > 0 && items.value.some(i => i.value < 0)) {
        feedback.value = { type: 'error', text: 'Kijk naar je kleinste getal (bovenaan). Een positief getal kan nooit kleiner zijn dan een negatief getal.'}
    } else if (items.value.find(i => i.label === '-0.5') && items.value.find(i => i.label === '-3/4') && 
               items.value.findIndex(i => i.label === '-0.5') < items.value.findIndex(i => i.label === '-3/4')) {
        feedback.value = { type: 'error', text: 'Let op bij negatieve getallen! -3/4 is dieper onder nul dan -0.5, dus -3/4 is KLEINER en moet hoger in de lijst.'}
    } else {
        feedback.value = { type: 'error', text: 'Niet helemaal juist. Controleer de volgorde van boven (kleinste, meest negatieve) naar onder (grootste). Vergelijk de balkjes visueel!'}
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
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Volgorde</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-8 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Sorting Area -->
              <div class="w-full max-w-3xl flex flex-col gap-4 relative">
                  
                  <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-16 mb-2">
                      <span>Kleinste</span>
                      <span class="text-slate-300">Sorteer hieronder</span>
                      <span>Grootste</span>
                  </div>

                  <!-- Global axis guide line in background -->
                  <div class="absolute top-[30px] bottom-0 left-[220px] right-[40px] pointer-events-none">
                      <!-- Center zero line -->
                      <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-300/50"></div>
                      <span class="absolute left-1/2 -top-6 -translate-x-1/2 text-xs font-bold text-slate-400">0</span>
                      <span class="absolute left-0 -top-6 -translate-x-1/2 text-xs font-bold text-slate-400">-1</span>
                      <span class="absolute right-0 -top-6 translate-x-1/2 text-xs font-bold text-slate-400">1</span>
                  </div>

                  <!-- Sortable List (Simulated with up/down buttons for robustness) -->
                  <div class="flex flex-col gap-3 relative z-10 w-full min-h-[300px]">
                      <transition-group name="list">
                          <div v-for="(item, index) in items" :key="item.id" 
                               class="bg-white/90 backdrop-blur border-2 border-slate-200 rounded-2xl p-3 shadow-sm flex items-center gap-4 w-full">
                              
                              <!-- Order Controls -->
                              <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                  <button @click="moveUp(index)" :disabled="index === 0 || isCorrect" class="p-2 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"><PhCaretUp weight="bold" /></button>
                                  <div class="h-px bg-slate-200"></div>
                                  <button @click="moveDown(index)" :disabled="index === items.length - 1 || isCorrect" class="p-2 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"><PhCaretDown weight="bold" /></button>
                              </div>

                              <!-- The Number Label -->
                              <div class="w-24 shrink-0 flex justify-center">
                                  <!-- Render as fraction if it has fractionParts -->
                                  <div v-if="item.fractionParts" class="flex items-center gap-1 font-bold text-2xl text-slate-700">
                                      <span v-if="item.value < 0">-</span>
                                      <div class="flex flex-col items-center">
                                          <span>{{ item.fractionParts[0] }}</span>
                                          <div class="h-1 w-full bg-slate-700 rounded-full my-1"></div>
                                          <span>{{ item.fractionParts[1] }}</span>
                                      </div>
                                  </div>
                                  <!-- Else render as decimal -->
                                  <div v-else class="font-bold text-2xl text-slate-700">
                                      {{ item.label }}
                                  </div>
                              </div>

                              <!-- Visual Bar Model (Number Line Representation) -->
                              <div class="flex-1 h-12 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200">
                                  
                                  <!-- Zero axis -->
                                  <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>

                                  <!-- The Bar -->
                                  <!-- Range is -1 to 1. Center is 50%. Width is value/2. -->
                                  <div class="absolute top-1 bottom-1 rounded z-0 transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                                       :class="item.value < 0 ? 'bg-red-400' : 'bg-emerald-400'"
                                       :style="{
                                           left: item.value < 0 ? `${50 + (item.value / 2) * 100}%` : '50%',
                                           width: `${Math.abs(item.value / 2) * 100}%`
                                       }">
                                       
                                       <!-- Show fraction partitions inside the bar if it's a fraction -->
                                       <div v-if="item.fractionParts" class="absolute inset-0 flex">
                                           <div v-for="part in item.fractionParts[0]" :key="'p'+part" 
                                                class="h-full border-r border-white/40 last:border-r-0"
                                                :style="{ width: `${100 / item.fractionParts[0]}%` }">
                                           </div>
                                       </div>

                                  </div>

                              </div>
                          </div>
                      </transition-group>
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

/* Vue transition-group animations */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>