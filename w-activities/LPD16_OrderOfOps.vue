<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhListNumbers, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Volgorde van Bewerkingen' },
  instruction: { 
    type: String, 
    default: 'Wiskunde lees je niet zomaar van links naar rechts zoals een boek. Er is een strikte hiërarchie (voorrangsregels)!<br/><br/><strong>Opdracht:</strong> Klik in de formule telkens op de bewerking die je als EERSTE moet uitvoeren. Blijf klikken tot je één getal overhoudt.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een wiskundig symbool in de formule.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Data-driven levels for step-by-step resolution
const levels = [
  {
    goalText: 'Opdracht 1: Optellen, vermenigvuldigen en machten.',
    steps: [
      {
        state: [
          { type: 'num', val: '5' }, { type: 'op', val: '+', id: 'op1' },
          { type: 'num', val: '2' }, { type: 'op', val: '×', id: 'op2' },
          { type: 'num', val: '3' }, { type: 'op', val: '^', id: 'op3', render: '²' }
        ],
        correctOp: 'op3',
        successMsg: 'Mooi! Machten hebben voorrang op vermenigvuldigen en optellen. 3² = 9.',
        errorMsg: 'Fout! Er staat nog een MACHT in de formule. Die heeft absolute voorrang.'
      },
      {
        state: [
          { type: 'num', val: '5' }, { type: 'op', val: '+', id: 'op1' },
          { type: 'num', val: '2' }, { type: 'op', val: '×', id: 'op2' },
          { type: 'num', val: '9', highlight: true }
        ],
        correctOp: 'op2',
        successMsg: 'Klopt! Vermenigvuldigen komt voor optellen. 2 × 9 = 18.',
        errorMsg: 'Nee. Vermenigvuldigen (×) is sterker dan optellen (+).'
      },
      {
        state: [
          { type: 'num', val: '5' }, { type: 'op', val: '+', id: 'op1' },
          { type: 'num', val: '18', highlight: true }
        ],
        correctOp: 'op1',
        successMsg: 'Perfect! Je hebt de hiërarchie helemaal gerespecteerd. Het antwoord is 23.',
        errorMsg: ''
      },
      {
        state: [ { type: 'num', val: '23', final: true } ]
      }
    ]
  },
  {
    goalText: 'Opdracht 2: Haakjes en Delen.',
    steps: [
      {
        state: [
          { type: 'num', val: '20' }, { type: 'op', val: '-', id: 'op1' },
          { type: 'num', val: '(10' }, { type: 'op', val: '+', id: 'op2' },
          { type: 'num', val: '2)' }, { type: 'op', val: '÷', id: 'op3' },
          { type: 'num', val: '4' }
        ],
        correctOp: 'op2',
        successMsg: 'Juist! Wat BINNEN de haakjes staat moet altijd als allereerste. 10 + 2 = 12.',
        errorMsg: 'Let op! Haakjes ( ) zijn de absolute baas in de wiskunde. Kijk binnen de haakjes.'
      },
      {
        state: [
          { type: 'num', val: '20' }, { type: 'op', val: '-', id: 'op1' },
          { type: 'num', val: '12', highlight: true }, { type: 'op', val: '÷', id: 'op3' },
          { type: 'num', val: '4' }
        ],
        correctOp: 'op3',
        successMsg: 'Heel goed. Delen heeft voorrang op aftrekken. 12 ÷ 4 = 3.',
        errorMsg: 'Fout. Delen is sterker dan aftrekken.'
      },
      {
        state: [
          { type: 'num', val: '20' }, { type: 'op', val: '-', id: 'op1' },
          { type: 'num', val: '3', highlight: true }
        ],
        correctOp: 'op1',
        successMsg: 'Goed zo. 20 - 3 = 17.',
        errorMsg: ''
      },
      {
        state: [ { type: 'num', val: '17', final: true } ]
      }
    ]
  },
  {
    goalText: 'Opdracht 3: Gelijkwaardige bewerkingen.',
    steps: [
      {
        state: [
          { type: 'num', val: '24' }, { type: 'op', val: '÷', id: 'op1' },
          { type: 'num', val: '4' }, { type: 'op', val: '×', id: 'op2' },
          { type: 'num', val: '2' }
        ],
        correctOp: 'op1',
        successMsg: 'Correct! Delen en vermenigvuldigen zijn EVEN sterk. Dan werken we strikt van LINKS naar RECHTS. 24 ÷ 4 = 6.',
        errorMsg: 'Opgelet! Delen en vermenigvuldigen zijn even sterk. Dan moet je gewoon van links naar rechts lezen.'
      },
      {
        state: [
          { type: 'num', val: '6', highlight: true }, { type: 'op', val: '×', id: 'op2' },
          { type: 'num', val: '2' }
        ],
        correctOp: 'op2',
        successMsg: 'Helemaal juist. 6 × 2 = 12.',
        errorMsg: ''
      },
      {
        state: [ { type: 'num', val: '12', final: true } ]
      }
    ]
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const currentStepIdx = ref(0)
const expressionState = computed(() => currentLevelData.value.steps[currentStepIdx.value].state)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op een wiskundig symbool in de formule.' };
    currentStepIdx.value = 0;
}

function handleOpClick(id) {
    if (isCorrect.value) return;
    
    const stepData = currentLevelData.value.steps[currentStepIdx.value]
    
    if (id === stepData.correctOp) {
        feedback.value = { type: 'success', text: stepData.successMsg }
        currentStepIdx.value++;
        
        // If this was the last operation, mark as fully correct
        if (currentStepIdx.value === currentLevelData.value.steps.length - 1) {
            isCorrect.value = true;
            isChecked.value = true;
        }
    } else {
        feedback.value = { type: 'error', text: stepData.errorMsg }
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
            
            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-2">Voorrangsregels</h4>
               <ol class="list-decimal pl-5 text-sm text-slate-600 font-medium space-y-1">
                   <li>Haakjes ( )</li>
                   <li>Machten en Wortels</li>
                   <li>Vermenigvuldigen en Delen</li>
                   <li>Optellen en Aftrekken</li>
               </ol>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Interactive Equation -->
              <div class="bg-white px-12 py-10 rounded-3xl shadow-xl border-4 border-slate-200 flex items-center justify-center min-w-[400px]">
                  
                  <transition-group name="equation" tag="div" class="flex items-baseline gap-3 relative justify-center">
                      <template v-for="(item, idx) in expressionState" :key="item.val + idx + currentStepIdx">
                          
                          <!-- Render Number -->
                          <div v-if="item.type === 'num'" 
                               class="font-mono font-black text-5xl transition-all duration-500 px-2 rounded-lg"
                               :class="item.highlight ? 'bg-amber-200 text-amber-800 scale-110 shadow-sm' : (item.final ? 'text-emerald-500 scale-125' : 'text-slate-700')">
                              {{ item.val }}
                          </div>
                          
                          <!-- Render Operator as Button -->
                          <button v-if="item.type === 'op'" 
                                  @click="handleOpClick(item.id)"
                                  class="w-12 h-12 rounded-full border-4 font-black text-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                                  :class="item.id.includes('power') ? 'border-fuchsia-500 text-fuchsia-600 bg-fuchsia-50 -mt-2 -ml-2' : 'border-blue-500 text-blue-600 bg-blue-50 relative top-1'">
                              {{ item.render || item.val }}
                          </button>
                          
                      </template>
                  </transition-group>

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
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.equation-move { transition: transform 0.5s ease-out; }
.equation-enter-active, .equation-leave-active { transition: all 0.5s ease-out; }
.equation-enter-from { opacity: 0; transform: translateY(30px) scale(0.5); }
.equation-leave-to { opacity: 0; transform: translateY(-30px) scale(0.5); position: absolute; }
</style>