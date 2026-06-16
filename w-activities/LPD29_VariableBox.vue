<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTextAa, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Variabelen' },
  instruction: { 
    type: String, 
    default: 'Soms gebruiken we in de wiskunde een letter (zoals <strong>z</strong>) in de plaats van een getal. Dit noemen we een <strong>variabele</strong>, omdat de waarde kan variëren (veranderen).<br/><br/><strong>Opdracht:</strong> Beweeg de slider om de zijde (z) van het vierkant te veranderen. Kijk hoe de formule meeverandert. Bereken daarna zélf de omtrek voor z = 12.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTextAa }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om de variabele z te veranderen.' })

// Domain Logic
const zValue = ref(5) // Slider 1 to 10
const userAns = ref(null)

const perimeter = computed(() => zValue.value * 4)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider om de variabele z te veranderen.' };
    zValue.value = 5;
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === 48) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect! Als de variabele z = 12, dan is de omtrek 4 × 12 = 48. De formule (4 × z) werkt voor ELK getal dat je kan bedenken!' 
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 144) {
        feedback.value = { type: 'error', text: 'Je hebt 12 × 12 berekend. Dat is de OPPERVLAKTE. De opdracht vraagt naar de OMTREK (de rand eromheen: 4 × z).'}
    } else if (userAns.value === 16) {
        feedback.value = { type: 'error', text: 'Je hebt 12 + 4 berekend. Een vierkant heeft 4 zijden van lengte z. Dat is z + z + z + z, oftewel 4 × z.'}
    } else {
        feedback.value = { type: 'error', text: 'Kijk naar de formule in de simulatie (Omtrek = 4 × z). Vervang de letter z nu door het getal 12. Wat wordt de berekening?'}
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
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
            
            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-emerald-900 mb-2">Test het zelf:</label>
               <div class="font-mono text-slate-600 mb-2">Als <strong class="text-emerald-700">z = 12</strong>, wat is de omtrek?</div>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-center" />
                   <span class="font-black text-2xl text-slate-500">cm</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Omtrek</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex flex-col items-center">
                  
                  <div class="mb-12 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center z-20">
                      <div class="flex w-full justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Variabele z</label>
                          <span class="font-black text-xl text-emerald-600">{{ zValue }}</span>
                      </div>
                      <input type="range" min="1" max="10" step="1" v-model.number="zValue" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  <!-- Visualisation Area -->
                  <!-- Max size 10 -> 300px. Scale = 30px per unit -->
                  <div class="relative bg-white shadow-xl rounded-3xl border-4 border-slate-200 p-8 flex items-center justify-center overflow-hidden" style="width: 500px; height: 500px;">
                      
                      <!-- Real-time formula display -->
                      <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-100 border-2 border-emerald-300 px-6 py-2 rounded-full font-mono font-black text-2xl text-emerald-800 shadow-sm z-10 transition-all">
                          Omtrek = 4 × <span class="text-emerald-500">{{ zValue }}</span> = {{ perimeter }}
                      </div>

                      <svg width="400" height="400" viewBox="0 0 400 400" class="block">
                          
                          <!-- Center square -->
                          <rect :x="200 - (zValue * 30)/2" :y="200 - (zValue * 30)/2" 
                                :width="zValue * 30" :height="zValue * 30" 
                                fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" class="transition-all duration-300 ease-out" />
                          
                          <!-- Dynamic Labels around the square -->
                          <!-- Top -->
                          <text :x="200" :y="200 - (zValue * 30)/2 - 10" font-weight="bold" fill="#047857" font-size="18" text-anchor="middle" class="transition-all duration-300 ease-out">z</text>
                          <!-- Bottom -->
                          <text :x="200" :y="200 + (zValue * 30)/2 + 20" font-weight="bold" fill="#047857" font-size="18" text-anchor="middle" class="transition-all duration-300 ease-out">z</text>
                          <!-- Left -->
                          <text :x="200 - (zValue * 30)/2 - 20" :y="200" font-weight="bold" fill="#047857" font-size="18" dominant-baseline="central" text-anchor="middle" class="transition-all duration-300 ease-out">z</text>
                          <!-- Right -->
                          <text :x="200 + (zValue * 30)/2 + 20" :y="200" font-weight="bold" fill="#047857" font-size="18" dominant-baseline="central" text-anchor="middle" class="transition-all duration-300 ease-out">z</text>

                      </svg>
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

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #10b981;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -13px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>