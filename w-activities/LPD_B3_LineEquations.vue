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
    default: 'Vergelijkingen van Rechten'
  },
  instruction: {
    type: String,
    default: 'Koppel de cartesische vergelijking (links) aan de bijhorende richtingsvector (rechts). Onthoud dat voor ux + vy + w = 0 de normaalvector (u, v) is en de richtingsvector (v, -u).'
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

// Pairs
const pairs = [
  { id: 1, expr: '2x + 3y - 6 = 0', ans: '(3, -2)' },
  { id: 2, expr: '-x + 4y + 2 = 0', ans: '(4, 1)' },
  { id: 3, expr: '5x - y = 0', ans: '(-1, -5)' },
  { id: 4, expr: 'y = 3', ans: '(1, 0)' }
]

const expressions = ref([...pairs].sort(() => Math.random() - 0.5))
const answers = ref([...pairs].sort(() => Math.random() - 0.5))

const selectedExpr = ref(null)
const selectedAns = ref(null)
const matchedPairs = ref([])

function selectExpr(item) {
  if (matchedPairs.value.includes(item.id)) return;
  if (selectedExpr.value === item.id) {
    selectedExpr.value = null; 
  } else {
    selectedExpr.value = item.id;
    checkMatch();
  }
}

function selectAns(item) {
  if (matchedPairs.value.includes(item.id)) return;
  if (selectedAns.value === item.id) {
    selectedAns.value = null; 
  } else {
    selectedAns.value = item.id;
    checkMatch();
  }
}

function checkMatch() {
  if (selectedExpr.value !== null && selectedAns.value !== null) {
    if (selectedExpr.value === selectedAns.value) {
      matchedPairs.value.push(selectedExpr.value);
      selectedExpr.value = null;
      selectedAns.value = null;
      
      if (matchedPairs.value.length === pairs.length) {
        checkAnswer();
      }
    } else {
      setTimeout(() => {
        selectedExpr.value = null;
        selectedAns.value = null;
      }, 500);
    }
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  matchedPairs.value = [];
  selectedExpr.value = null;
  selectedAns.value = null;
  expressions.value = [...pairs].sort(() => Math.random() - 0.5)
  answers.value = [...pairs].sort(() => Math.random() - 0.5)
}

function checkAnswer() {
  isChecked.value = true;
  if (matchedPairs.value.length === pairs.length) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Uitstekend! Je kan de richtingsvector aflezen uit een cartesische vergelijking.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Er ontbreken nog enkele koppelingen.'
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
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
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-50 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid">
              
              <div class="flex w-full max-w-4xl gap-12 justify-center">
                
                <!-- Expressions -->
                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Cartesische Verg.</h4>
                  <button v-for="item in expressions" :key="'expr-'+item.id"
                          @click="selectExpr(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center"
                          :class="{
                            'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-50': matchedPairs.includes(item.id),
                            'border-indigo-500 ring-4 ring-indigo-100': selectedExpr === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-indigo-300': selectedExpr !== item.id && !matchedPairs.includes(item.id)
                          }">
                    {{ item.expr }}
                  </button>
                </div>

                <!-- Answers -->
                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Richtingsvector</h4>
                  <button v-for="item in answers" :key="'ans-'+item.id"
                          @click="selectAns(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center"
                          :class="{
                            'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-50': matchedPairs.includes(item.id),
                            'border-amber-500 ring-4 ring-amber-100': selectedAns === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-amber-300': selectedAns !== item.id && !matchedPairs.includes(item.id)
                          }">
                    {{ item.ans }}
                  </button>
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