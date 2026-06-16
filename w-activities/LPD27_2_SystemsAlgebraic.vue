<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhBracketsCurly,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelsels Algebraïsch Oplossen (Substitutie)'
  },
  instruction: {
    type: String,
    default: 'Sleep de reeds afgezonderde onbekende (x of y) uit de ene vergelijking en laat deze los in de andere vergelijking om te substitueren.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBracketsCurly }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Substitueer y.',
    eq1Left: 'y', eq1Right: '2x + 1',
    eq2LeftPre: '3x + ', eq2Var: 'y', eq2LeftPost: '', eq2Right: '11',
    dragTarget: '2x + 1',
    substitutedStringHTML: '<span class="text-blue-600">3x</span> + <span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(2x + 1)</span> = 11',
    questionVar: 'x',
    answer: 2 // 3x + 2x + 1 = 11 -> 5x = 10 -> x=2
  },
  {
    goalText: 'Opdracht 2: Substitueer x.',
    eq1Left: 'x', eq1Right: 'y - 2',
    eq2LeftPre: '2', eq2Var: 'x', eq2LeftPost: ' + 3y', eq2Right: '6',
    dragTarget: 'y - 2',
    substitutedStringHTML: '2<span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(y - 2)</span> + <span class="text-blue-600">3y</span> = 6',
    questionVar: 'y',
    answer: 2 // 2(y-2) + 3y = 6 -> 5y - 4 = 6 -> 5y = 10 -> y=2
  },
  {
    goalText: 'Opdracht 3: Let op de haakjes en het min-teken!',
    eq1Left: 'y', eq1Right: '-x + 5',
    eq2LeftPre: 'x - ', eq2Var: 'y', eq2LeftPost: '', eq2Right: '-1',
    dragTarget: '-x + 5',
    substitutedStringHTML: '<span class="text-blue-600">x</span> - <span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(-x + 5)</span> = -1',
    questionVar: 'x',
    answer: 2 // x - (-x + 5) = -1 -> 2x - 5 = -1 -> 2x = 4 -> x=2
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

const substituted = ref(false)
const answeredVar = ref('')

let draggedItem = null

function onDragStart(item) {
  if (isCorrect.value) return;
  draggedItem = item
}

function onDrop() {
  if (draggedItem === currentLevelData.value.dragTarget) {
    substituted.value = true
    draggedItem = null
    feedback.value = { type: 'success', text: 'Mooi gesubstitueerd! Reken nu de resulterende vergelijking uit.' }
  } else {
    feedback.value = { type: 'error', text: 'Je sleept het verkeerde stuk. Sleep het expressiegedeelte (rechts) naar de variabele in de andere vergelijking.' }
    draggedItem = null
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Voer de substitutie uit door te slepen.' };
  substituted.value = false;
  answeredVar.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  if (!substituted.value) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Je moet eerst de substitutie uitvoeren door te slepen.' }
    return;
  }

  if (parseFloat(answeredVar.value) === currentLevelData.value.answer) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! Als ${currentLevelData.value.questionVar} = ${currentLevelData.value.answer}, dan is je stelsel correct opgelost!` 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Er zit een rekenfout in je uitwerking. Werk de haakjes uit, breng alles met de onbekende naar links en de getallen naar rechts.'
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
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
            
            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div v-if="substituted" class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner animate-fadeIn">
              <p class="font-bold text-slate-800">Vergelijking met 1 onbekende:</p>
              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm text-center" v-html="currentLevelData.substitutedStringHTML">
              </div>

              <div class="mt-4">
                <label class="block mb-2 text-sm font-bold text-slate-700">Wat is de waarde voor {{ currentLevelData.questionVar }}?</label>
                <div class="flex items-center gap-3">
                  <span class="font-mono text-xl font-bold">{{ currentLevelData.questionVar }} = </span>
                  <input type="number" v-model="answeredVar" 
                         @keyup.enter="checkAnswer"
                         class="flex-1 p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-teal-500 transition-colors"
                         placeholder="?">
                </div>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !substituted || !answeredVar" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-8">
              
              <div class="text-4xl font-light text-slate-400 absolute left-[25%] top-1/2 -translate-y-1/2 scale-[5] opacity-30 pointer-events-none">
                {
              </div>

              <!-- Equation 1 -->
              <div class="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all duration-300" :class="{ 'opacity-40 grayscale': substituted }">
                <span class="text-slate-700">{{ currentLevelData.eq1Left }}</span>
                <span class="text-slate-400">=</span>
                <!-- Draggable part -->
                <div v-if="!substituted"
                     draggable="true"
                     @dragstart="onDragStart(currentLevelData.dragTarget)"
                     class="px-4 py-2 bg-emerald-50 text-emerald-600 border-2 border-emerald-400 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                  {{ currentLevelData.eq1Right }}
                </div>
                <div v-else class="px-4 py-2 text-emerald-600">
                  {{ currentLevelData.eq1Right }}
                </div>
              </div>

              <!-- Equation 2 -->
              <div class="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all duration-300" :class="{ 'scale-110 shadow-xl border-blue-300': substituted }">
                
                <span class="text-blue-600">{{ currentLevelData.eq2LeftPre }}</span>
                
                <!-- Drop zone -->
                <div v-if="!substituted"
                     @dragover.prevent
                     @drop="onDrop"
                     class="w-20 h-16 border-4 border-dashed rounded-xl flex items-center justify-center transition-colors"
                     :class="draggedItem ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'">
                  <span class="text-slate-400">{{ currentLevelData.eq2Var }}</span>
                </div>
                
                <div v-else class="px-4 py-2 bg-emerald-50 text-emerald-600 border-2 border-emerald-400 rounded-xl animate-fadeIn whitespace-nowrap">
                  ({{ currentLevelData.dragTarget }})
                </div>

                <span class="text-blue-600">{{ currentLevelData.eq2LeftPost }}</span>
                <span class="text-slate-400">=</span>
                <span class="text-slate-700">{{ currentLevelData.eq2Right }}</span>
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