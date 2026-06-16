<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhMathOperations,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Reststelling bij Veeltermen'
  },
  instruction: {
    type: String,
    default: 'Gebruik de reststelling om de rest te bepalen als je veelterm P(x) deelt door de deler d(x). Tip: De rest is gelijk aan P(a) als d(x) = x - a.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// P(x) = x³ - 2x² + x + 4
// d(x) = x - 2
// a = 2
// Rest = P(2) = 8 - 8 + 2 + 4 = 6
const p_expr = 'x³ - 2x² + x + 4'
const d_expr = 'x - 2'
const correctA = 2
const correctRest = 6

const userA = ref('')
const userRest = ref('')

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userA.value = '';
  userRest.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  const a = parseInt(userA.value)
  const rest = parseInt(userRest.value)
  
  if (a === correctA && rest === correctRest) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Helemaal juist! Omdat je deelt door (x - 2), is de rest gelijk aan P(2) = 6.' 
    }
  } else if (a !== correctA) {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'De waarde van a klopt niet. Als d(x) = x - a en je hebt x - 2, wat is dan a?'
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Je hebt a correct, maar de rest klopt niet. Bereken P(2) door 2 in te vullen in de veelterm P(x).'
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <button @click="emit('close')" 
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">
              
              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm space-y-2">
                <p class="text-indigo-600 font-bold">P(x) = {{ p_expr }}</p>
                <p class="text-slate-600 font-bold">d(x) = {{ d_expr }}</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">1. Wat is a?</label>
                <input type="number" v-model="userA" 
                       class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                       placeholder="a = ?">
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">2. Wat is de rest (R)?</label>
                <input type="number" v-model="userRest" 
                       @keyup.enter="checkAnswer"
                       class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                       placeholder="R = ?">
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userA || !userRest" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">
              
              <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-indigo-200 flex items-center justify-center gap-6 w-full max-w-2xl transform scale-110">
                <div class="font-mono text-3xl font-black text-indigo-700">P(x)</div>
                <div class="text-4xl font-light text-slate-300">/</div>
                <div class="font-mono text-3xl font-black text-slate-700">(x - a)</div>
                <div class="text-4xl font-light text-slate-300">→</div>
                <div class="font-mono text-3xl font-black text-emerald-600">Rest = P(a)</div>
              </div>

              <!-- Calculation hint box -->
              <div v-if="userA" class="bg-white p-6 rounded-xl shadow-md border border-slate-200 text-center animate-fadeIn w-full max-w-lg">
                <p class="font-bold text-slate-500 mb-2">Berekening:</p>
                <p class="font-mono text-xl text-slate-800">
                  P(<span class="text-indigo-600 font-bold">{{ userA }}</span>) = 
                  (<span class="text-indigo-600 font-bold">{{ userA }}</span>)³ - 
                  2(<span class="text-indigo-600 font-bold">{{ userA }}</span>)² + 
                  (<span class="text-indigo-600 font-bold">{{ userA }}</span>) + 4
                </p>
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

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>