<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise, PhPaintBrush
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vormen Omzetten: Het 100-Rooster' },
  instruction: { 
    type: String, 
    default: 'Breuken, kommagetallen en procenten zijn 3 talen voor hetzelfde ding.<br/><br/><strong>Opdracht:</strong> Kleur exact het gevraagde deel van het rooster in. Vul daarna het juiste kommagetal en procent in.' 
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
const feedback = ref({ type: 'info', text: 'Klik op de blokjes om ze in te kleuren, of sleep om er meer tegelijk te kleuren.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Een kwart',
    fractionDisplay: '1/4',
    targetSquares: 25,
    targetDecimal: 0.25,
    targetPercent: 25,
    hintSquare: 'Bereken 100 gedeeld door 4.',
    hintDecimal: '25 honderdsten schrijf je als 0.25.',
    hintPercent: 'Procent betekent letterlijk "per honderd".'
  },
  {
    goalText: 'Opdracht 2: Een tiende',
    fractionDisplay: '1/10',
    targetSquares: 10,
    targetDecimal: 0.1,
    targetPercent: 10,
    hintSquare: 'Hoeveel keer past 10 in 100? Kleur 1 volledige rij of kolom.',
    hintDecimal: 'Één tiende schrijf je in kommagetal als 0.1 (of 0.10).',
    hintPercent: 'Als 10 van de 100 vakjes gekleurd zijn, is het 10 procent.'
  },
  {
    goalText: 'Opdracht 3: Drie kwart',
    fractionDisplay: '3/4',
    targetSquares: 75,
    targetDecimal: 0.75,
    targetPercent: 75,
    hintSquare: 'Als 1/4 = 25 vakjes, dan is 3/4 gelijk aan 3 keer 25.',
    hintDecimal: '75 honderdsten is als decimaal getal 0.75.',
    hintPercent: '75 op 100 is gelijk aan 75%.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const grid = ref(Array(100).fill(false))
const userDecimal = ref('')
const userPercent = ref(null)

const coloredCount = computed(() => grid.value.filter(b => b).length)

// Drag to color logic
let isDragging = false
let dragMode = true // true = coloring, false = erasing

function startDrag(index) {
    if(isCorrect.value) return;
    isDragging = true
    dragMode = !grid.value[index]
    grid.value[index] = dragMode
}
function onEnter(index) {
    if (isDragging && !isCorrect.value) {
        grid.value[index] = dragMode
    }
}
function endDrag() {
    isDragging = false
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de blokjes om ze in te kleuren, of sleep om er meer tegelijk te kleuren.' };
    grid.value = Array(100).fill(false);
    userDecimal.value = '';
    userPercent.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  const decimalNum = parseFloat(userDecimal.value.toString().replace(',', '.'))
  const data = currentLevelData.value;
  
  if (coloredCount.value === data.targetSquares && decimalNum === data.targetDecimal && userPercent.value === data.targetPercent) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Briljant! ${data.fractionDisplay} = ${data.targetSquares}/100 = ${data.targetDecimal} = ${data.targetPercent}%.` 
    }
  } else {
    isCorrect.value = false
    
    if (coloredCount.value !== data.targetSquares) {
        feedback.value = { type: 'error', text: `Je hebt ${coloredCount.value} blokjes gekleurd. Dat is niet ${data.fractionDisplay}. ${data.hintSquare}`}
    } else if (decimalNum !== data.targetDecimal) {
        feedback.value = { type: 'error', text: `Het rooster klopt (${data.targetSquares} blokjes)! Maar het kommagetal is fout. ${data.hintDecimal}`}
    } else if (userPercent.value !== data.targetPercent) {
        feedback.value = { type: 'error', text: `Het rooster en kommagetal kloppen! Maar het percentage is fout. ${data.hintPercent}`}
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
    window.addEventListener('mouseup', endDrag) // Catch mouseup outside the grid
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('mouseup', endDrag)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mouseup', endDrag)
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
            
            <div class="p-4 mt-6 border border-blue-200 bg-blue-50 rounded-xl shadow-inner relative overflow-visible">
               <h4 class="font-bold text-slate-700 mb-3 border-b border-blue-200 pb-2">De Drievuldigheid</h4>
               
               <div class="space-y-4">
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Breuk</span>
                       <span class="font-black text-2xl text-blue-700 bg-white px-3 py-1 rounded shadow-sm border border-blue-200">{{ currentLevelData.fractionDisplay }}</span>
                   </div>
                   
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Kommagetal</span>
                       <input type="text" v-model="userDecimal" placeholder="0..." :disabled="isCorrect"
                              class="w-24 font-bold text-lg p-2 border border-blue-300 rounded focus:border-blue-500 focus:ring-blue-500 text-center" />
                   </div>
                   
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Procent</span>
                       <div class="flex items-center gap-1">
                           <input type="number" v-model.number="userPercent" placeholder="..." :disabled="isCorrect"
                                  class="w-20 font-bold text-lg p-2 border border-blue-300 rounded focus:border-blue-500 focus:ring-blue-500 text-center" />
                           <span class="font-black text-xl text-slate-500">%</span>
                       </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Alles</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- 10x10 Grid -->
              <div class="relative bg-white p-2 rounded-xl shadow-md border-2 border-slate-300">
                  <div class="grid grid-cols-10 grid-rows-10 gap-1"
                       @mouseleave="endDrag">
                      <div v-for="(block, index) in grid" :key="index"
                           @mousedown.prevent="startDrag(index)"
                           @mouseenter.prevent="onEnter(index)"
                           @touchstart.prevent="startDrag(index)"
                           @touchmove.prevent
                           class="w-8 h-8 sm:w-10 sm:h-10 border transition-colors cursor-crosshair rounded-sm"
                           :class="block ? (isCorrect ? 'bg-emerald-500 border-emerald-600 shadow-inner' : 'bg-blue-500 border-blue-600 shadow-inner') : 'bg-slate-100 border-slate-300 hover:bg-slate-200'">
                      </div>
                  </div>
                  
                  <!-- Indicator -->
                  <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 font-bold text-slate-600">
                      <PhPaintBrush weight="duotone" class="w-5 h-5 text-blue-500" />
                      <span>{{ coloredCount }} / 100 gekleurd</span>
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
</style>