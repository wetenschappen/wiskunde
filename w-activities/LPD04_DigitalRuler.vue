<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRuler, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetinstrumenten: De Digitale Meetlat' },
  instruction: { 
    type: String, 
    default: 'Sleep de meetlat over het lijnstuk. Meet de lengte exact in millimeter (mm) en vul dit in.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRuler }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Tip: Je kan de meetlat slepen met je muis.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Meet de lengte van de RODE lijn in millimeter.',
    targetLength: 42,
    color: 'bg-red-500',
    dotColor: 'bg-red-600',
    yOffset: 150,
    xOffset: 60,
    hint: 'Elk klein streepje op de meetlat is 1 mm. De getallen zijn in cm (1 cm = 10 mm).'
  },
  {
    goalText: 'Opdracht 2: Meet de lengte van de BLAUWE lijn in millimeter.',
    targetLength: 78,
    color: 'bg-blue-500',
    dotColor: 'bg-blue-600',
    yOffset: 250,
    xOffset: 120, // Different offset to prevent lazy measuring
    hint: 'Vergeet niet het nulpunt (0) exact gelijk te leggen met het linker begin van de lijn!'
  },
  {
    goalText: 'Opdracht 3: Meet de lengte van de GROENE lijn in millimeter.',
    targetLength: 115,
    color: 'bg-emerald-500',
    dotColor: 'bg-emerald-600',
    yOffset: 100,
    xOffset: 80,
    hint: 'Dit is een langere lijn. Controleer zorgvuldig de millimeters voorbij de laatste cm.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const userLength = ref(null)

// Dragging logic for the ruler
const rulerX = ref(100)
const rulerY = ref(200)
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0

function startDrag(e) {
    isDragging = true
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0)
    dragOffsetX = clientX - rulerX.value
    dragOffsetY = clientY - rulerY.value
}

function onDrag(e) {
    if (!isDragging) return
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0)
    
    rulerX.value = Math.max(10, Math.min(800, clientX - dragOffsetX))
    rulerY.value = Math.max(10, Math.min(600, clientY - dragOffsetY))
}

function endDrag() {
    isDragging = false
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Tip: Je kan de meetlat slepen met je muis.' };
    userLength.value = null;
    rulerX.value = 100;
    rulerY.value = 350; // default lower
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value.targetLength;
  
  if (userLength.value === target) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect gemeten! Je hebt het nulpunt goed gepositioneerd.' 
    }
  } else {
    isCorrect.value = false
    
    // Didactic feedback based on common errors
    if (userLength.value === target + 3 || userLength.value === target + 4) {
        feedback.value = { type: 'error', text: 'Let goed op! Je bent beginnen meten vanaf de fysieke RAND van de meetlat. Je moet beginnen bij het lange streepje van de 0.'}
    } else if (userLength.value === target / 10) {
        feedback.value = { type: 'error', text: 'Dat getal lijkt in centimeter (cm) te staan. We vragen het specifiek in millimeter (mm).'}
    } else {
        feedback.value = { type: 'error', text: `Niet helemaal juist. ${currentLevelData.value.hint}`}
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
     @mouseup="endDrag" @mouseleave="endDrag" @touchend="endDrag">
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
            
            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-2">Lengte lijnstuk:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userLength" placeholder="..." :disabled="isCorrect"
                          class="w-24 font-bold text-lg p-2 border border-slate-300 rounded focus:border-teal-500 focus:ring-teal-500 text-center" />
                   <span class="text-slate-600 font-bold">mm</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userLength === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-3xl min-h-[500px] bg-white rounded-2xl border-2 border-slate-200/50 shadow-sm relative overflow-hidden"
                   @mousemove="onDrag" @touchmove.prevent="onDrag">
                  
                  <!-- Dynamic Target Line Segment -->
                  <!-- Scale: 1mm = 10px. -->
                  <div class="absolute h-2 rounded-full z-0 flex items-center justify-between transition-all duration-500"
                       :class="currentLevelData.color"
                       :style="{ 
                         top: `${currentLevelData.yOffset}px`, 
                         left: `${currentLevelData.xOffset}px`, 
                         width: `${currentLevelData.targetLength * 10}px` 
                       }">
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                  </div>

                  <!-- The Draggable Ruler -->
                  <div class="absolute cursor-move select-none z-10 drop-shadow-xl"
                       :style="{ left: `${rulerX}px`, top: `${rulerY}px` }"
                       @mousedown="startDrag" @touchstart.prevent="startDrag">
                       
                       <!-- Ruler Body (Plastic) -->
                       <div class="bg-[#f0f9ff]/90 backdrop-blur-sm border-2 border-slate-400/50 rounded flex flex-col justify-between"
                            style="width: 700px; height: 80px;">
                            
                            <!-- Markings Top Edge -->
                            <div class="relative w-full h-8 border-b border-slate-300/50">
                                <!-- Edge offset is 30px. -->
                                <div class="absolute left-[30px] bottom-0 w-[600px] h-full pointer-events-none">
                                    <div v-for="mm in 61" :key="mm" class="absolute bottom-0 bg-slate-700"
                                         :style="{ 
                                            left: `${(mm-1) * 10}px`, 
                                            width: '2px', 
                                            height: (mm-1) % 10 === 0 ? '20px' : ((mm-1) % 5 === 0 ? '14px' : '8px') 
                                         }">
                                         <!-- Numbers -->
                                         <span v-if="(mm-1) % 10 === 0" class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800">
                                             {{ (mm-1)/10 }}
                                         </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex-1 flex items-center justify-center pointer-events-none opacity-20">
                                <PhRuler weight="duotone" class="w-12 h-12 text-teal-800" />
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>