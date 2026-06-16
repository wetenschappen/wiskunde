<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRuler, PhArrowClockwise, PhCarProfile
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Eigenschappen: De Absolute Waarde' },
  instruction: { 
    type: String, 
    default: 'De absolute waarde van een getal, genoteerd als <strong>|x|</strong>, is de <strong>afstand</strong> van dat getal tot nul op de getallenas.<br/><br/><strong>Opdracht:</strong> Sleep het meetlint van het huis (0) naar de auto om de afstand te meten. Vul de absolute waarde in.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRuler }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Trek het rode meetlint uit vanaf het huis (0).' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Positieve afstand.',
    carPos: 5,
    exactAns: 5,
    hint: 'De auto staat op +5. Hoe ver is dat van 0?'
  },
  {
    goalText: 'Opdracht 2: Negatieve richting.',
    carPos: -7,
    exactAns: 7,
    hint: 'De auto staat op -7. Afstanden zijn altijd positief. Rol het meetlint uit.'
  },
  {
    goalText: 'Opdracht 3: Verder weg.',
    carPos: -12,
    exactAns: 12,
    hint: 'Kijk goed hoeveel eenheden je moet meten tot -12.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const userAns = ref(null)

const tapeLength = ref(0) // Visual tape length in steps
let isDragging = false
let startX = 0

// Axis configuration: -15 to +15. Total 31 ticks. House is at 0 (index 15)
const axisMin = -15
const axisMax = 15
const totalTicks = axisMax - axisMin + 1
const houseIndex = 15 // Because -15 + 15 = 0

const carPos = computed(() => currentLevelData.value.carPos)
const carIndex = computed(() => carPos.value - axisMin)
const exactAns = computed(() => currentLevelData.value.exactAns)

// Determine tape direction based on car position relative to house
const tapeDirection = computed(() => carPos.value >= 0 ? 1 : -1)

function startDrag(e) {
    if (isCorrect.value) return;
    isDragging = true
    startX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
}

function onDrag(e) {
    if (!isDragging || isCorrect.value) return
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    
    // Tape stretches from House. 
    // If car is left (dir = -1), moving mouse left stretches it -> startX - clientX
    // If car is right (dir = 1), moving mouse right stretches it -> clientX - startX
    const diff = tapeDirection.value === 1 ? (clientX - startX) : (startX - clientX)
    
    // Each step on our visual axis is ~20px
    const steps = Math.max(0, Math.min(15, Math.round(diff / 20)))
    tapeLength.value = steps
}

function endDrag() {
    isDragging = false
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Trek het rode meetlint uit vanaf het huis (0).' };
    userAns.value = null;
    tapeLength.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === exactAns.value) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! Afstanden zijn altijd positief. Daarom is |${carPos.value}| gewoon ${exactAns.value}.` 
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === carPos.value && carPos.value < 0) {
        feedback.value = { type: 'error', text: `Fout! De coördinaat van de auto is ${carPos.value}, maar kan een afstand negatief zijn? (Rol het meetlint uit!)`}
    } else if (tapeLength.value !== exactAns.value) {
        feedback.value = { type: 'error', text: 'Rol eerst het meetlint (rood) uit exact tot aan de auto om de afstand te controleren.'}
    } else {
        feedback.value = { type: 'error', text: `Kijk naar het meetlint. Wat is de totale lengte (afstand)? ${currentLevelData.value.hint}`}
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800"
     @mouseup="endDrag" @mouseleave="endDrag" @touchend="endDrag" @mousemove="onDrag" @touchmove.prevent="onDrag">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-emerald-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-emerald-900 mb-4">Bereken:</label>
               <div class="flex items-center justify-center gap-4 text-3xl font-black text-slate-700">
                   <span class="bg-white px-3 py-1 rounded shadow-sm border border-emerald-200">|{{ carPos }}|</span>
                   <span>=</span>
                   <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                          class="w-24 font-bold text-2xl p-2 border-2 border-emerald-300 rounded focus:border-emerald-500 focus:ring-emerald-500 text-center bg-white" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Visualisation -->
              <div class="w-full max-w-4xl relative h-64 flex items-center justify-center">
                  
                  <!-- The Number Line -->
                  <!-- Using percentage offsets for responsive layout -->
                  <div class="absolute inset-x-0 top-1/2 h-2 bg-slate-300 rounded-full flex items-center px-4">
                      <!-- Ticks -->
                      <div v-for="i in totalTicks" :key="'tick'+i" class="absolute flex flex-col items-center"
                           :style="{ left: `calc(16px + (100% - 32px) * (${i-1} / ${totalTicks-1}))`, transform: 'translateX(-50%)' }">
                          <div class="w-1 h-6 bg-slate-400 rounded-full absolute -top-2"></div>
                          <!-- Only show every 5th tick number for clarity, but always show car and house -->
                          <span v-if="(i-1 + axisMin) % 5 === 0 || (i-1) === houseIndex || (i-1) === carIndex" 
                                class="absolute top-6 font-bold text-xs text-slate-500"
                                :class="{ 'text-slate-800': (i-1) === houseIndex, 'text-indigo-600': (i-1) === carIndex }">
                                {{ (i - 1) + axisMin }}
                          </span>
                      </div>
                  </div>

                  <!-- The House (At 0) -->
                  <div class="absolute top-1/2 -translate-y-full pb-4" 
                       :style="{ left: `calc(16px + (100% - 32px) * (${houseIndex} / ${totalTicks-1}))`, transform: 'translateX(-50%) translateY(-100%)' }">
                      <div class="w-16 h-16 bg-white border-4 border-slate-700 rounded-t-[50%] rounded-b-lg flex items-center justify-center shadow-md relative z-10">
                          <div class="w-6 h-8 bg-amber-500 border-2 border-slate-700 absolute bottom-0 rounded-t-sm"></div>
                          <span class="absolute -top-6 font-black text-slate-500 bg-white px-2 rounded-full border border-slate-200">0</span>
                      </div>
                  </div>

                  <!-- The Car (At dynamic pos) -->
                  <div class="absolute top-1/2 -translate-y-full pb-4 transition-all duration-700 ease-out" 
                       :style="{ left: `calc(16px + (100% - 32px) * (${carIndex} / ${totalTicks-1}))`, transform: 'translateX(-50%) translateY(-100%)' }">
                      <div class="bg-indigo-500 text-white rounded-xl p-2 shadow-lg border-2 border-indigo-700 animate-pulse relative z-0">
                          <PhCarProfile weight="fill" class="w-10 h-10" />
                          <span class="absolute -top-8 left-1/2 -translate-x-1/2 font-black text-indigo-500 bg-indigo-50 px-2 rounded-full border border-indigo-200">{{ carPos }}</span>
                      </div>
                  </div>

                  <!-- The Measuring Tape -->
                  <!-- If car is negative, tape goes LEFT. If car is positive, tape goes RIGHT. -->
                  <!-- Width = tapeLength steps -->
                  <div class="absolute top-1/2 h-8 bg-red-500/80 border-y-4 border-red-700 transition-all duration-100 ease-linear flex items-center justify-center overflow-hidden z-20"
                       :class="tapeDirection === -1 ? 'rounded-l-md origin-right justify-end' : 'rounded-r-md origin-left justify-start'"
                       :style="{
                           left: tapeDirection === 1 ? `calc(16px + (100% - 32px) * (${houseIndex} / ${totalTicks-1}))` : 'auto',
                           right: tapeDirection === -1 ? `calc(100% - (16px + (100% - 32px) * (${houseIndex} / ${totalTicks-1})))` : 'auto',
                           width: `calc(((100% - 32px) / ${totalTicks-1}) * ${tapeLength})`,
                           transform: 'translateY(-50%)'
                       }">
                       
                       <!-- Tape markings -->
                       <div class="flex-1 h-full flex justify-between px-1 pointer-events-none opacity-50">
                           <div v-for="i in tapeLength" :key="'m'+i" class="h-full border-red-900 w-full" :class="tapeDirection === -1 ? 'border-r-2' : 'border-l-2'"></div>
                       </div>
                       
                       <!-- Display Distance -->
                       <div v-if="tapeLength > 0" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 rounded font-black text-red-600 shadow-sm border border-red-200 pointer-events-none whitespace-nowrap text-xs md:text-base z-30">
                           {{ tapeLength }} eenheden
                       </div>
                  </div>

                  <!-- Tape Pull Handle (Draggable) -->
                  <div class="absolute top-1/2 w-8 h-12 bg-slate-800 border-2 border-slate-600 rounded cursor-ew-resize shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
                       @mousedown.prevent="startDrag" @touchstart.prevent="startDrag"
                       :style="{
                           left: tapeDirection === 1 ? `calc(16px + (100% - 32px) * (${houseIndex} / ${totalTicks-1}) + (((100% - 32px) / ${totalTicks-1}) * ${tapeLength}))` : 'auto',
                           right: tapeDirection === -1 ? `calc(100% - (16px + (100% - 32px) * (${houseIndex} / ${totalTicks-1})) + (((100% - 32px) / ${totalTicks-1}) * ${tapeLength}))` : 'auto',
                           transform: tapeDirection === 1 ? 'translateX(-50%) translateY(-50%)' : 'translateX(50%) translateY(-50%)'
                       }">
                       <div class="w-1 h-8 bg-slate-500 rounded-full"></div>
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