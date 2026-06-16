<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRectangle, PhArrowClockwise, PhArrowsLeftRight
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Evenredigheden: Omgekeerd Evenredig' },
  instruction: { 
    type: String, 
    default: 'Bij een <strong>omgekeerd evenredig</strong> verband is het product van twee getallen (x en y) altijd hetzelfde: <strong>x × y = c</strong>. Als de ene stijgt, moet de andere dalen!<br/><br/><strong>Opdracht:</strong> Kneed de rechthoek door de breedte te veranderen. De oppervlakte (het product) moet altijd 24 blijven. Kijk welke mooie grafiek er ontstaat. Welke formule past hierbij?' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRectangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider (Breedte x) en observeer de curve.' })

// Domain Logic
const userAns = ref('')
const area = 24
const widthX = ref(4) // 1 to 12

const heightY = computed(() => area / widthX.value)

// Record history to draw the curve
const history = ref([
    { x: 4, y: 6 }
])

// Debounce saving to history to avoid too many points
watch(widthX, (newVal) => {
    if (!history.value.some(pt => pt.x === newVal)) {
        history.value.push({ x: newVal, y: area / newVal })
    }
})

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider (Breedte x) en observeer de curve.' };
    widthX.value = 4;
    userAns.value = '';
    history.value = [ { x: 4, y: 6 } ];
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === 'inverse') {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magistraal! Dit noem je een hyperbool. Omdat Oppervlakte = Breedte × Hoogte, is de formule x · y = c. Als je x verdubbelt, halveer je y.' 
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 'direct') {
        feedback.value = { type: 'error', text: 'Fout! y/x = c hoort bij een recht evenredig verband (een rechte lijn door de oorsprong). Onze grafiek is krom en daalt!'}
    } else {
        feedback.value = { type: 'error', text: 'Kies een formule uit de lijst.'}
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-pink-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-pink-600" />
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
            
            <div class="p-4 mt-6 border border-pink-200 bg-pink-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-pink-900 mb-2">Conclusie Formule:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een formule...</option>
                   <option value="direct">y / x = c (Recht evenredig)</option>
                   <option value="inverse">x · y = c (Omgekeerd evenredig)</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex items-center justify-center gap-12">
                  
                  <!-- Left side: The Rectangle -->
                  <div class="flex flex-col items-center">
                      <div class="mb-4 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                          <div class="flex w-full justify-between items-end mb-2">
                              <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsLeftRight weight="bold" /> Breedte x</label>
                              <span class="font-black text-xl text-pink-600">{{ widthX }}</span>
                          </div>
                          <input type="range" min="1" max="12" step="1" v-model.number="widthX" :disabled="isCorrect"
                                 class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                      </div>

                      <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8 flex items-end justify-start min-w-[300px] min-h-[350px]">
                          
                          <!-- Visual representation of rectangle. Max X = 12. Max Y = 24. Scale: 1 unit = 10px. So 120x240 max -->
                          <div class="absolute bottom-8 left-8 bg-pink-500/20 border-4 border-pink-500 transition-all duration-300 ease-out flex items-center justify-center shadow-inner"
                               :style="{ width: `${widthX * 20}px`, height: `${heightY * 10}px` }">
                              <span class="font-black text-pink-700 text-lg whitespace-nowrap">Opp = 24</span>
                          </div>

                          <div class="absolute bottom-2 left-8 font-bold text-pink-600">x = {{ widthX }}</div>
                          <div class="absolute bottom-8 left-0 -translate-x-full font-bold text-pink-600 pr-2 pb-2 -rotate-90 origin-bottom-right" :style="{ bottom: `${8 + (heightY*10)/2}px` }">y = {{ heightY.toFixed(1) }}</div>

                      </div>
                  </div>

                  <!-- Right side: The Graph -->
                  <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-6 flex items-center justify-center min-w-[350px]">
                      
                      <h4 class="absolute top-4 left-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Grafiek (Hyperbool)</h4>

                      <svg width="300" height="300" viewBox="0 0 300 300" class="mt-8">
                          
                          <!-- Grid (1 unit = 20px for X, 10px for Y) -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <!-- X: 0 to 14 -> 14 * 20 = 280 -->
                              <line v-for="i in 15" :key="'vg'+i" :x1="20 + (i-1)*20" y1="20" :x2="20 + (i-1)*20" y2="280" />
                              <!-- Y: 0 to 26 -> 26 * 10 = 260 -->
                              <line v-for="i in 14" :key="'hg'+i" x1="20" :y1="280 - (i-1)*20" x2="280" :y2="280 - (i-1)*20" /> <!-- step 2 units per line -->
                          </g>

                          <!-- Axes -->
                          <line x1="20" y1="280" x2="290" y2="280" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="20" y1="280" x2="20" y2="10" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <text x="280" y="295" font-weight="bold" fill="#64748b" font-size="10">x</text>
                          <text x="10" y="20" font-weight="bold" fill="#64748b" font-size="10">y</text>

                          <!-- Plot history points -->
                          <circle v-for="pt in history" :key="pt.x" 
                                  :cx="20 + pt.x * 20" 
                                  :cy="280 - pt.y * 10" 
                                  r="4" fill="#f43f5e" class="animate-fadeIn" />
                          
                          <!-- Current point highlighted -->
                          <circle :cx="20 + widthX * 20" 
                                  :cy="280 - heightY * 10" 
                                  r="6" fill="#be123c" stroke="white" stroke-width="2" class="transition-all duration-300 shadow-sm" />

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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #ec4899;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -13px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: background-color 0.3s;
}
input[type=range]:disabled::-webkit-slider-thumb {
  background: #10b981;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>