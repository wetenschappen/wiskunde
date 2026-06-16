<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhLockKey, PhLockKeyOpen
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Onbekenden' },
  instruction: { 
    type: String, 
    default: 'Soms gebruiken we een letter (zoals <strong>x</strong>) als tijdelijke vervanger voor een specifiek getal dat we nog moeten ontdekken. Dit is een <strong>onbekende</strong>.<br/><br/><strong>Opdracht:</strong> Kijk naar de weegschaal: <strong>x + 3 = 8</strong>. Hoeveel blokjes zitten er verstopt in de doos \'x\' om de weegschaal in perfect evenwicht te houden?' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Pas het aantal blokjes in doos x aan met de knoppen (+ en -).' })

// Domain Logic
const leftLoose = 3
const rightLoose = 8
const xValue = ref(1) // Starts wrong, must reach 5

const totalLeft = computed(() => xValue.value + leftLoose)
const totalRight = computed(() => rightLoose)

const tiltValue = computed(() => {
    // Return -1 (left heavy), 0 (balanced), 1 (right heavy)
    if (totalLeft.value > totalRight.value) return -1
    if (totalLeft.value < totalRight.value) return 1
    return 0
})

const boxUnlocked = computed(() => isCorrect.value)

function increaseX() {
    if (!isCorrect.value && xValue.value < 10) xValue.value++
    isChecked.value = false
}

function decreaseX() {
    if (!isCorrect.value && xValue.value > 0) xValue.value--
    isChecked.value = false
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Pas het aantal blokjes in doos x aan met de knoppen (+ en -).' };
    xValue.value = 1;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (tiltValue.value === 0) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magisch! De doos gaat open. Omdat de weegschaal in evenwicht moet blijven, KAN de letter x hier maar één specifiek getal zijn: 5.' 
    }
  } else {
    isCorrect.value = false
    
    if (tiltValue.value === -1) {
        feedback.value = { type: 'error', text: 'De linkerkant is te zwaar. Er zitten te veel blokjes in doos x! Haal er wat uit.'}
    } else {
        feedback.value = { type: 'error', text: 'De linkerkant is te licht. Je moet meer blokjes in doos x steken om het gewicht van rechts (8) te evenaren.'}
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-amber-900 mb-2">Vergelijk:</label>
               
               <div class="font-mono font-black text-2xl text-slate-800 flex items-center justify-center gap-3">
                   <span class="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">x + 3</span>
                   <span class="text-amber-500">=</span>
                   <span class="bg-white px-3 py-1 rounded shadow-sm border border-slate-200">8</span>
               </div>
               
               <div class="mt-6 flex items-center justify-center gap-4">
                   <button @click="decreaseX" class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">-</button>
                   <div class="flex flex-col items-center">
                       <span class="text-xs font-bold text-slate-400 uppercase">Doos x</span>
                       <span class="text-3xl font-black text-amber-600 w-12">{{ xValue }}</span>
                   </div>
                   <button @click="increaseX" class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">+</button>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Evenwicht</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl min-h-[500px] flex items-center justify-center relative">
                  
                  <!-- Visual Balance Scale -->
                  <div class="relative w-full max-w-lg transition-transform duration-700 ease-in-out origin-bottom"
                       :style="{ transform: `rotate(${tiltValue * 10}deg)` }">
                      
                      <!-- The Beam -->
                      <div class="w-full h-4 bg-slate-700 rounded-full shadow-lg relative z-10 flex justify-between px-8">
                          
                          <!-- Left Pan (x + 3) -->
                          <!-- Counter rotate to keep items upright -->
                          <div class="absolute left-8 bottom-4 w-40 flex flex-col items-center transform origin-bottom transition-transform duration-700"
                               :style="{ transform: `rotate(${-tiltValue * 10}deg)` }">
                              
                              <div class="flex items-end justify-center gap-2 mb-2 w-full px-2">
                                  <!-- The Box 'x' -->
                                  <div class="w-20 h-20 bg-amber-200 border-4 border-amber-500 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden transition-all duration-500"
                                       :class="boxUnlocked ? 'bg-transparent border-dashed border-amber-300' : ''">
                                      
                                      <div v-if="!boxUnlocked" class="flex flex-col items-center">
                                          <PhLockKey weight="bold" class="w-6 h-6 text-amber-600 mb-1" />
                                          <span class="font-black text-2xl text-amber-800 font-mono">x</span>
                                      </div>
                                      
                                      <div v-else class="flex flex-wrap gap-1 p-1 justify-center items-center h-full w-full">
                                          <div v-for="i in xValue" :key="'xb'+i" class="w-5 h-5 bg-amber-400 border border-amber-600 rounded-sm shadow-sm animate-fadeIn" :style="`animation-delay: ${i*0.05}s`"></div>
                                      </div>
                                  </div>
                                  
                                  <!-- Plus 3 Loose Blocks -->
                                  <div class="flex flex-col gap-1 justify-end h-full mb-1">
                                      <div v-for="i in leftLoose" :key="'ll'+i" class="w-6 h-6 bg-slate-200 border-2 border-slate-400 rounded shadow-sm flex items-center justify-center font-bold text-slate-500 text-[10px]">1</div>
                                  </div>
                              </div>
                              
                              <!-- Pan Base -->
                              <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                          </div>

                          <!-- Right Pan (8) -->
                          <div class="absolute right-8 bottom-4 w-40 flex flex-col items-center transform origin-bottom transition-transform duration-700"
                               :style="{ transform: `rotate(${-tiltValue * 10}deg)` }">
                              
                              <div class="flex items-end justify-center gap-1 mb-2 w-full px-2 flex-wrap">
                                  <div v-for="i in rightLoose" :key="'rl'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs">1</div>
                              </div>
                              
                              <!-- Pan Base -->
                              <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                          </div>
                      </div>

                      <!-- The Fulcrum (Pivot) -->
                      <div class="absolute left-1/2 bottom-[-80px] -translate-x-1/2 w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[80px] border-b-slate-400 z-0 drop-shadow-md"></div>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
</style>