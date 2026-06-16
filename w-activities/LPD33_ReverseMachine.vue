<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEngine, PhArrowClockwise, PhArrowUUpLeft
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vergelijkingen: De Machine Terugdraaien' },
  instruction: { 
    type: String, 
    default: 'Een vergelijking is eigenlijk een verhaaltje: "Ik begon met een getal x, deelde het door 2, trok er 4 van af en kwam op 6."<br/><br/><strong>Opdracht:</strong> Los de vergelijking <strong>x/2 - 4 = 6</strong> op. Draai de machine om door de <strong>tegengestelde bewerkingen</strong> (inverse bewerkingen) te kiezen en de uitkomst stap voor stap te berekenen.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhEngine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer de bewerking die tegengesteld is aan -4.' })

// Domain Logic
// Forward: x -> [/2] -> [-4] -> 6
// Reverse: 6 -> [+4] -> [x2] -> x
const step = ref(0) // 0: select op1, 1: calc val1, 2: select op2, 3: calc val2 (x)

const op1 = ref('')
const val1 = ref(null) // Should be 10

const op2 = ref('')
const val2 = ref(null) // Should be 20

function selectOp1(op) {
    if (step.value > 0) return
    if (op === '+4') {
        op1.value = '+ 4'
        step.value = 1
        feedback.value = { type: 'success', text: 'Juist! Het tegenovergestelde van aftrekken is optellen (+ 4). Bereken nu 6 + 4.' }
    } else {
        feedback.value = { type: 'error', text: 'Fout. Wat is het EXACTE wiskundige tegengestelde van de bewerking "- 4"?' }
    }
}

function selectOp2(op) {
    if (step.value > 2) return
    if (op === 'x2') {
        op2.value = '× 2'
        step.value = 3
        feedback.value = { type: 'success', text: 'Juist! Het tegenovergestelde van delen door 2 is vermenigvuldigen met 2 (× 2). Bereken nu 10 × 2 om x te vinden.' }
    } else {
        feedback.value = { type: 'error', text: 'Fout. Wat is het EXACTE wiskundige tegengestelde van de bewerking "÷ 2"?' }
    }
}

function checkVal1() {
    if (val1.value === 10) {
        step.value = 2
        feedback.value = { type: 'success', text: 'Correct, 6 + 4 = 10. Selecteer nu de volgende tegengestelde bewerking.' }
    } else {
        feedback.value = { type: 'error', text: 'Reken nog eens. Je hebt het eindgetal 6, en de actie is + 4.' }
    }
}

function checkVal2() {
    isChecked.value = true;
    if (val2.value === 20) {
        isCorrect.value = true
        feedback.value = { type: 'success', text: 'Briljant! Je hebt de onbekende x gevonden door van achter naar voor te werken. Dit is de essentie van algebra: bewerkingen omkeren!' }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `Reken nog eens. Het tussengetal was 10, en de actie is × 2.` }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer de bewerking die tegengesteld is aan -4.' };
    step.value = 0;
    op1.value = '';
    val1.value = null;
    op2.value = '';
    val2.value = null;
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="instruction"></div>
            
            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-slate-300 mb-4 flex items-center justify-center gap-2"><PhArrowUUpLeft weight="bold"/> Kies een tegengestelde bewerking:</label>
               
               <div class="grid grid-cols-2 gap-2">
                   <button @click="selectOp1('+4'); selectOp2('+4')" :disabled="isCorrect || (step !== 0 && step !== 2)" class="py-3 rounded bg-slate-600 border-2 border-slate-500 font-black text-xl hover:bg-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+ 4</button>
                   <button @click="selectOp1('-4'); selectOp2('-4')" :disabled="isCorrect || (step !== 0 && step !== 2)" class="py-3 rounded bg-slate-600 border-2 border-slate-500 font-black text-xl hover:bg-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">- 4</button>
                   <button @click="selectOp1('x2'); selectOp2('x2')" :disabled="isCorrect || (step !== 0 && step !== 2)" class="py-3 rounded bg-slate-600 border-2 border-slate-500 font-black text-xl hover:bg-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">× 2</button>
                   <button @click="selectOp1('/2'); selectOp2('/2')" :disabled="isCorrect || (step !== 0 && step !== 2)" class="py-3 rounded bg-slate-600 border-2 border-slate-500 font-black text-xl hover:bg-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">÷ 2</button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="step === 1" @click="checkVal1" class="flex-1 py-3 font-bold tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 rounded-lg bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400">Verifieer Tussenstap</button>
              <button v-else-if="step === 3 && !isCorrect" @click="checkVal2" class="flex-1 py-3 font-bold tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 rounded-lg bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400">Controleer x</button>
              <button v-else-if="isCorrect" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
              
              <div class="w-full max-w-4xl flex flex-col items-center gap-12">
                  
                  <!-- Forward Pipeline (Top) -->
                  <div class="flex items-center w-full justify-between px-8 bg-slate-800/80 p-6 rounded-2xl border border-slate-600 opacity-50 pointer-events-none">
                      
                      <div class="w-20 h-20 rounded-xl bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-inner">
                          <span class="font-black text-3xl text-slate-400">x</span>
                      </div>

                      <div class="h-1 flex-1 bg-slate-500 mx-4 relative">
                          <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-slate-400">÷ 2</div>
                          <PhArrowRight weight="bold" class="absolute -right-2 -top-2 text-slate-500" />
                      </div>

                      <div class="w-20 h-20 rounded-xl bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-inner">
                          <span class="font-black text-3xl text-slate-400">?</span>
                      </div>

                      <div class="h-1 flex-1 bg-slate-500 mx-4 relative">
                          <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-slate-400">- 4</div>
                          <PhArrowRight weight="bold" class="absolute -right-2 -top-2 text-slate-500" />
                      </div>

                      <div class="w-20 h-20 rounded-xl bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-inner">
                          <span class="font-black text-3xl text-slate-400">6</span>
                      </div>
                  </div>

                  <!-- Reverse Pipeline (Bottom) -->
                  <div class="flex items-center w-full justify-between px-8 bg-slate-800 p-6 rounded-2xl border-4 border-slate-600 shadow-xl relative">
                      
                      <h4 class="absolute -top-3 left-8 bg-slate-800 px-2 text-xs font-bold uppercase tracking-widest text-emerald-400">De Omgekeerde Machine (Start hier rechts)</h4>

                      <!-- Step 3: End value (x) -->
                      <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner transition-colors"
                           :class="isCorrect ? 'bg-emerald-500 border-4 border-emerald-300' : 'bg-slate-900 border-4 border-emerald-600'">
                          <span v-if="!isCorrect && step < 3" class="font-black text-4xl text-emerald-600 opacity-50">x</span>
                          <input v-else type="number" v-model.number="val2" :disabled="isCorrect" class="w-full h-full bg-transparent text-center font-black text-4xl text-white outline-none focus:bg-emerald-900" />
                      </div>

                      <!-- Op 2 connection -->
                      <div class="h-2 flex-1 bg-emerald-600 mx-4 relative flex items-center justify-center transition-all" :class="step >= 3 ? 'bg-emerald-400' : ''">
                          <!-- Inverse Arrow direction (Right to Left) -->
                          <div class="w-3 h-3 border-b-2 border-l-2 border-emerald-600 transform rotate-45 absolute -left-1" :class="step >= 3 ? 'border-emerald-400' : ''"></div>
                          
                          <!-- Operation Block -->
                          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 border-2 border-slate-500 px-4 py-2 rounded-lg font-black text-xl text-emerald-400 min-w-[80px] text-center"
                               :class="step === 2 ? 'ring-2 ring-emerald-400 animate-pulse' : ''">
                              {{ op2 || '?' }}
                          </div>
                      </div>

                      <!-- Step 2: Intermediate value -->
                      <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner transition-colors"
                           :class="step >= 2 ? 'bg-emerald-800 border-4 border-emerald-500' : 'bg-slate-900 border-4 border-slate-600'">
                          <span v-if="step < 1" class="font-black text-4xl text-slate-700">?</span>
                          <input v-else type="number" v-model.number="val1" :disabled="step >= 2" class="w-full h-full bg-transparent text-center font-black text-4xl text-emerald-300 outline-none focus:bg-slate-800" />
                      </div>

                      <!-- Op 1 connection -->
                      <div class="h-2 flex-1 bg-emerald-600 mx-4 relative flex items-center justify-center transition-all" :class="step >= 1 ? 'bg-emerald-400' : ''">
                          <!-- Inverse Arrow direction -->
                          <div class="w-3 h-3 border-b-2 border-l-2 border-emerald-600 transform rotate-45 absolute -left-1" :class="step >= 1 ? 'border-emerald-400' : ''"></div>
                          
                          <!-- Operation Block -->
                          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 border-2 border-slate-500 px-4 py-2 rounded-lg font-black text-xl text-emerald-400 min-w-[80px] text-center"
                               :class="step === 0 ? 'ring-2 ring-emerald-400 animate-pulse' : ''">
                              {{ op1 || '?' }}
                          </div>
                      </div>

                      <!-- Step 1: Start value (6) -->
                      <div class="w-24 h-24 rounded-2xl bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-inner">
                          <span class="font-black text-4xl text-white">6</span>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Chrome, Safari, Edge, Opera hide number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>