<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rationale Getallen: Ongelijkheden' },
  instruction: { 
    type: String, 
    default: 'Vergelijk de twee getallen.<br/><br/><strong>Opdracht:</strong> Beweeg de slider om de weegschaal te kantelen naar de zwaarste (grootste) kant. Let op hoe het wiskundige symbool (&lt;, &gt;, =) verandert!' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider (de wip) onderaan om te wegen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Vergelijk twee eenvoudige breuken.',
    left: '1/3', right: '1/4', 
    leftVal: 0.333, rightVal: 0.25,
    hintCheck: (tilt) => tilt === 1 ? 'Fout. De noemer is 4, dus 1/4 is een KLEINER stukje van de taart dan 1/3. De weegschaal moet andersom.' : 'De weegschaal staat verkeerd.'
  },
  {
    goalText: 'Opdracht 2: Vergelijk twee negatieve kommagetallen.',
    left: '-0.5', right: '-0.8', 
    leftVal: -0.5, rightVal: -0.8,
    hintCheck: (tilt) => tilt === 1 ? 'Fout. Bij negatieve getallen is het getal dichter bij nul GROTER. -0.5 is dus groter dan -0.8.' : 'Kijk goed naar de mintekens.'
  },
  {
    goalText: 'Opdracht 3: Vergelijk een onvereenvoudigde breuk.',
    left: '3/6', right: '1/2', 
    leftVal: 0.5, rightVal: 0.5,
    hintCheck: (tilt) => tilt !== 0 ? 'Kijk nog eens goed. 3 van de 6 stukken, is dat niet exact de helft? De balans moet in evenwicht zijn.' : 'Maak de breuk eenvoudiger in je hoofd.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const tiltValue = ref(0) // -1 (left down, left > right), 0 (equal), 1 (right down, right > left)

const currentSymbol = computed(() => {
    if (tiltValue.value < 0) return '>'
    if (tiltValue.value > 0) return '<'
    return '='
})

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider (de wip) onderaan om te wegen.' };
    tiltValue.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  
  const prob = currentLevelData.value;
  let correctTilt = 0;
  if (prob.leftVal > prob.rightVal) correctTilt = -1;
  else if (prob.leftVal < prob.rightVal) correctTilt = 1;

  if (tiltValue.value === correctTilt) {
    isCorrect.value = true 
    feedback.value = { type: 'success', text: 'Perfect! Je weegt feilloos en gebruikt het correcte symbool.' }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: prob.hintCheck(tiltValue.value) }
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
            
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center animate-fadeIn">
               <p class="font-bold text-teal-800 mb-4">{{ currentLevelData.goalText }}</p>
               
               <div class="flex items-center justify-center gap-4 mt-4">
                   <div class="text-3xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">{{ currentLevelData.left }}</div>
                   
                   <div class="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-md border-4 border-teal-200 transition-all"
                        :class="tiltValue !== 0 ? 'scale-110' : ''">
                       {{ currentSymbol }}
                   </div>
                   
                   <div class="text-3xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">{{ currentLevelData.right }}</div>
               </div>
               <p class="text-xs text-teal-600 mt-4 italic">Het symbool open staat altijd naar het GROOTSTE getal (of de zwaarste kant).</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Wegen</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl min-h-[400px] flex flex-col items-center justify-center">
                  
                  <!-- Visual Balance Scale -->
                  <div class="relative w-full max-w-lg mb-20 transition-transform duration-500 ease-in-out origin-bottom"
                       :style="{ transform: `rotate(${tiltValue * 15}deg)` }">
                      
                      <!-- The Beam -->
                      <div class="w-full h-4 bg-slate-700 rounded-full shadow-lg relative z-10 flex justify-between px-10">
                          <!-- Left Pan -->
                          <div class="absolute left-8 bottom-4 flex flex-col items-center transform origin-bottom transition-transform duration-500"
                               :style="{ transform: `rotate(${-tiltValue * 15}deg)` }"> <!-- Counter-rotate to stay upright -->
                              <div class="w-24 h-24 bg-sky-200 border-4 border-sky-500 rounded-xl flex items-center justify-center shadow-md mb-2">
                                  <span class="font-black text-2xl text-sky-800">{{ currentLevelData.left }}</span>
                              </div>
                          </div>

                          <!-- Right Pan -->
                          <div class="absolute right-8 bottom-4 flex flex-col items-center transform origin-bottom transition-transform duration-500"
                               :style="{ transform: `rotate(${-tiltValue * 15}deg)` }">
                              <div class="w-24 h-24 bg-amber-200 border-4 border-amber-500 rounded-xl flex items-center justify-center shadow-md mb-2">
                                  <span class="font-black text-2xl text-amber-800">{{ currentLevelData.right }}</span>
                              </div>
                          </div>
                      </div>

                      <!-- The Fulcrum (Pivot) -->
                      <div class="absolute left-1/2 bottom-[-60px] -translate-x-1/2 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-slate-400 z-0 drop-shadow-md"></div>
                  </div>

                  <!-- Slider Control -->
                  <div class="w-full max-w-sm mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <p class="text-center font-bold text-slate-500 mb-4 uppercase tracking-widest text-xs">Kantel de weegschaal</p>
                      
                      <div class="flex items-center justify-between mb-2 px-1 text-sm font-bold text-slate-400">
                          <span>Links Zwaarder</span>
                          <span>In Evenwicht</span>
                          <span>Rechts Zwaarder</span>
                      </div>
                      
                      <!-- -1 to 1 slider -->
                      <input type="range" min="-1" max="1" step="1" v-model.number="tiltValue" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

/* Custom Range Slider styling for better UX */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #14b8a6;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-top: -11px;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>