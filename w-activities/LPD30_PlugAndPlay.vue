<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPuzzlePiece, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getalwaarde: Formules Inpluggen' },
  instruction: { 
    type: String, 
    default: 'Een formule is eigenlijk een template met lege vakjes. Je "plugt" de getallen uit de tekening in de juiste vakjes in.<br/><br/><strong>Opdracht:</strong> Kijk naar de driehoek. Klik eerst op de lege lettervakjes (b en h) in de formule en koppel ze aan het juiste getal. Bereken daarna het eindantwoord.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhPuzzlePiece }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een leeg vakje in de formule, en klik daarna op het getal in de tekening.' })

// Domain Logic
// Formula: (b * h) / 2
// Values: b=8, h=5, extra distractor side=6
const valB = 8
const valH = 5
const distractor = 6

const slotB = ref(null)
const slotH = ref(null)

const activeSlot = ref(null) // 'b' or 'h'
const userAns = ref(null)

function selectSlot(slot) {
    if (isCorrect.value) return;
    activeSlot.value = slot;
}

function assignValue(val) {
    if (activeSlot.value === 'b') {
        slotB.value = val;
        activeSlot.value = null;
    } else if (activeSlot.value === 'h') {
        slotH.value = val;
        activeSlot.value = null;
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op een leeg vakje in de formule, en klik daarna op het getal in de tekening.' };
    slotB.value = null;
    slotH.value = null;
    activeSlot.value = null;
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (slotB.value === valB && slotH.value === valH && userAns.value === 20) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect! Je hebt de juiste basis (8) en de juiste hoogte (5) "ingeplugd". 8 × 5 / 2 = 20.' 
    }
  } else {
    isCorrect.value = false
    
    // Detailed feedback
    if (slotB.value === null || slotH.value === null) {
        feedback.value = { type: 'error', text: 'Plug eerst de getallen in de formule! Klik op [b] of [h] en kies het getal in de tekening.'}
    } else if (slotB.value === distractor || slotH.value === distractor) {
        feedback.value = { type: 'error', text: 'Fout ingeplugd! Je hebt het getal 6 gekozen. Maar 6 is een schuine zijde, geen basis en geen hoogtelijn!'}
    } else if ((slotB.value === valH && slotH.value === valB)) {
        // Technically math works (5*8), but we want strict coupling for understanding
        if (userAns.value === 20) {
             isCorrect.value = true
             feedback.value = { type: 'success', text: 'Het antwoord klopt! Je hebt wel de basis en hoogte omgewisseld, maar bij vermenigvuldigen mag dat (commutatief).' }
        } else {
             feedback.value = { type: 'error', text: 'De formule-getallen kloppen (hoewel omgedraaid). Maar je eindberekening (5 × 8 / 2) klopt niet.'}
        }
    } else if (slotB.value === valB && slotH.value === valH && userAns.value !== 20) {
        if (userAns.value === 40) {
            feedback.value = { type: 'error', text: 'Je bent vergeten te delen door 2! De formule is (b × h) / 2.'}
        } else {
            feedback.value = { type: 'error', text: `Je hebt correct ingeplugd: (${valB} × ${valH}) / 2. Maar de eindberekening is fout.`}
        }
    } else {
        feedback.value = { type: 'error', text: 'Herbekijk je stappen. Welk getal in de tekening is de basis (b)? Welk is de hoogte (h)?'}
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
            
            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-emerald-900 mb-4">Inpluggen:</label>
               
               <div class="flex items-center justify-center gap-4 text-3xl font-black text-slate-700 mb-6">
                   <div class="flex flex-col items-center">
                       <div class="flex items-center gap-2">
                           <!-- Slot b -->
                           <button @click="selectSlot('b')" :disabled="isCorrect"
                                   class="min-w-[60px] h-12 bg-white rounded-lg border-2 shadow-sm flex items-center justify-center transition-all hover:scale-105"
                                   :class="activeSlot === 'b' ? 'border-emerald-500 ring-4 ring-emerald-200' : (slotB !== null ? 'border-emerald-600 text-emerald-700' : 'border-slate-300 text-slate-400 border-dashed')">
                               {{ slotB !== null ? slotB : '[ b ]' }}
                           </button>
                           <span class="text-xl">×</span>
                           <!-- Slot h -->
                           <button @click="selectSlot('h')" :disabled="isCorrect"
                                   class="min-w-[60px] h-12 bg-white rounded-lg border-2 shadow-sm flex items-center justify-center transition-all hover:scale-105"
                                   :class="activeSlot === 'h' ? 'border-emerald-500 ring-4 ring-emerald-200' : (slotH !== null ? 'border-emerald-600 text-emerald-700' : 'border-slate-300 text-slate-400 border-dashed')">
                               {{ slotH !== null ? slotH : '[ h ]' }}
                           </button>
                       </div>
                       <div class="h-1 w-full bg-slate-700 rounded-full my-2"></div>
                       <span>2</span>
                   </div>
                   
                   <span class="ml-4">=</span>
               </div>

               <div class="flex items-center gap-2 border-t border-emerald-200 pt-4">
                   <span class="font-bold text-sm text-emerald-800 w-32">Eindantwoord:</span>
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="flex-1 font-bold text-xl p-2 border-2 border-emerald-300 rounded focus:border-emerald-500 focus:ring-emerald-500 text-center bg-white" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Bereken</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl flex flex-col items-center">
                  
                  <div class="relative bg-white shadow-xl rounded-3xl overflow-hidden border-4 border-slate-200 p-12">
                      <svg width="400" height="300" viewBox="0 0 400 300" class="block">
                          
                          <!-- Grid lines -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 9" :key="'vg'+i" :x1="i * 40" y1="0" :x2="i * 40" y2="300" />
                              <line v-for="i in 7" :key="'hg'+i" x1="0" :y1="i * 40" x2="400" :y2="i * 40" />
                          </g>

                          <!-- The Triangle -->
                          <!-- Base = 8 units (320px). Starts at (40, 240). Ends at (360, 240). -->
                          <!-- Height = 5 units (200px). Top vertex at (120, 40). -->
                          <polygon points="40,240 360,240 120,40" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" />
                          
                          <!-- Altitude Line -->
                          <line x1="120" y1="40" x2="120" y2="240" stroke="#ef4444" stroke-width="3" stroke-dasharray="8 4" />
                          <polyline points="120,225 135,225 135,240" fill="none" stroke="#ef4444" stroke-width="2" />

                      </svg>

                      <!-- Interactive Number Tags mapped over the SVG -->
                      
                      <!-- Base tag (8) -->
                      <button @click="assignValue(8)" 
                              class="absolute bottom-[20px] left-[50%] -translate-x-1/2 bg-white px-4 py-1 rounded-full border-2 border-emerald-500 font-black text-emerald-700 shadow-md transition-all hover:scale-110 active:scale-95"
                              :class="activeSlot ? 'animate-pulse ring-4 ring-emerald-200' : ''">
                          8
                      </button>

                      <!-- Height tag (5) -->
                      <button @click="assignValue(5)" 
                              class="absolute top-[140px] left-[130px] bg-white px-3 py-1 rounded-full border-2 border-red-500 font-black text-red-600 shadow-md transition-all hover:scale-110 active:scale-95"
                              :class="activeSlot ? 'animate-pulse ring-4 ring-red-200' : ''">
                          5
                      </button>

                      <!-- Distractor tag (6) on left side -->
                      <button @click="assignValue(6)" 
                              class="absolute top-[140px] left-[10px] bg-white px-3 py-1 rounded-full border-2 border-slate-400 font-black text-slate-500 shadow-md transition-all hover:scale-110 active:scale-95"
                              :class="activeSlot ? 'animate-pulse ring-4 ring-slate-200' : ''">
                          6
                      </button>

                  </div>
                  
                  <div class="mt-6 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                      Klik eerst op een vakje in de formule (links), en pik dan een getal uit de tekening!
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