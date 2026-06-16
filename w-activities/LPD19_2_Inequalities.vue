<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
    default: 'Ongelijkheden Oplossen'
  },
  instruction: {
    type: String,
    default: 'Los de ongelijkheid op en teken de oplossing op de getallenas. Let op: delen door een negatief getal draait het teken om!'
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

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Los op voor x.',
    problem: '2x > 8',
    targetVal: 4,
    targetDirection: 'right', // 'right' means >, >=
    targetIncluded: false,    // open circle
    hintVal: 'Los op: 2x = 8 om de grenswaarde te vinden.',
    hintDir: 'Let op de ongelijkheid: x moet groter zijn dan 4, dus de pijl moet naar rechts wijzen.'
  },
  {
    goalText: 'Opdracht 2: Delen door een negatief getal!',
    problem: '-3x ≤ 12',
    targetVal: -4,
    targetDirection: 'right', // -3x <= 12  => x >= -4
    targetIncluded: true,     // closed circle
    hintVal: 'Los op: -3x = 12 om de grenswaarde te vinden.',
    hintDir: 'Als je deelt door -3, móét het ongelijkheidsteken omklappen! De pijl moet dus de ándere kant op wijzen.'
  },
  {
    goalText: 'Opdracht 3: Combinatie van bewerkingen.',
    problem: '5 - 2x < 11',
    targetVal: -3,            // -2x < 6 => x > -3
    targetDirection: 'right', 
    targetIncluded: false,
    hintVal: 'Breng de 5 naar de andere kant (11 - 5 = 6) en deel dan door -2.',
    hintDir: 'Omdat je op het laatst deelt door -2, klapt het teken om.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Interactive State
const userValue = ref(0) // -10 to 10
const userDirection = ref('right') // 'left' or 'right'
const userIncluded = ref(false)

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Teken de oplossing visueel op de as.' };
  userValue.value = 0;
  userDirection.value = 'right';
  userIncluded.value = false;
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value;
  
  const valCorrect = userValue.value === target.targetVal;
  const dirCorrect = userDirection.value === target.targetDirection;
  const incCorrect = userIncluded.value === target.targetIncluded;

  if (valCorrect && dirCorrect && incCorrect) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Uitstekend! De algebraïsche bewerking is perfect visueel vertaald.' 
    }
  } else {
    isCorrect.value = false
    
    if (!valCorrect) {
      feedback.value = { type: 'error', text: target.hintVal }
    } else if (!dirCorrect) {
      feedback.value = { type: 'error', text: target.hintDir }
    } else if (!incCorrect) {
      feedback.value = { type: 'error', text: 'Bijna goed! Maar let op de grens: is het een open of gesloten (vol) bolletje? Kijk naar het teken in de opgave.' }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800 mb-2">{{ currentLevelData.goalText }}</p>
              <div class="font-mono text-2xl font-black text-slate-800 bg-white p-2 rounded border border-orange-200 shadow-inner inline-block px-4">
                {{ currentLevelData.problem }}
              </div>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">
              
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">1. Waarde op de x-as (Grenspunt)</label>
                <input type="range" v-model.number="userValue" min="-10" max="10" step="1" class="w-full accent-orange-600">
                <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono font-bold">
                  <span>-10</span><span>0</span><span>10</span>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">2. Richting van de pijl</label>
                <div class="flex gap-2">
                  <button @click="userDirection = 'left'" 
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-xl"
                          :class="userDirection === 'left' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    ← (x < )
                  </button>
                  <button @click="userDirection = 'right'" 
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-xl"
                          :class="userDirection === 'right' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    (x > ) →
                  </button>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">3. Is het bolletje open of dicht?</label>
                <div class="flex gap-2">
                  <button @click="userIncluded = true" 
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Dicht (≤ of ≥)
                  </button>
                  <button @click="userIncluded = false" 
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="!userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Open (< of >)
                  </button>
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
              
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
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
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <div class="w-full max-w-3xl bg-white p-12 rounded-2xl shadow-md border border-slate-300">
                
                <h3 class="text-3xl font-black text-slate-800 font-mono tracking-widest text-center mb-12 animate-fadeIn" v-if="isCorrect">
                  x {{ userDirection === 'left' ? (userIncluded ? '≤' : '<') : (userIncluded ? '≥' : '>') }} {{ userValue }}
                </h3>
                <h3 class="text-3xl font-black text-slate-300 font-mono tracking-widest text-center mb-12 animate-fadeIn" v-else>
                  x ? {{ userValue }}
                </h3>

                <!-- Number line representation -->
                <div class="relative w-full h-16 flex items-center mt-4">
                  <!-- Base line -->
                  <div class="absolute inset-x-0 h-1.5 bg-slate-300 rounded-full"></div>
                  
                  <!-- Ticks -->
                  <div class="absolute flex justify-between inset-x-4 px-2">
                    <div v-for="i in 21" :key="i" class="w-0.5 h-4 bg-slate-400 relative">
                      <span v-if="(i-11) % 2 === 0" class="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">{{ i - 11 }}</span>
                    </div>
                  </div>

                  <!-- Highlighted Region (The Arrow) -->
                  <div class="absolute h-3 bg-orange-500 rounded-full pointer-events-none transition-all duration-300 flex items-center"
                       :class="userDirection === 'left' ? 'justify-start rounded-r-none' : 'justify-end rounded-l-none'"
                       :style="{
                         left: userDirection === 'left' ? '0' : `calc(2rem + ${((userValue + 10) / 20) * 100}%)`,
                         right: userDirection === 'right' ? '0' : `calc(2rem + ${((10 - userValue) / 20) * 100}%)`
                       }">
                       
                       <!-- Arrow head -->
                       <div v-if="userDirection === 'left'" class="w-0 h-0 border-t-8 border-b-8 border-r-[12px] border-transparent border-r-orange-500 -translate-x-2"></div>
                       <div v-if="userDirection === 'right'" class="w-0 h-0 border-t-8 border-b-8 border-l-[12px] border-transparent border-l-orange-500 translate-x-2"></div>
                  </div>
                  
                  <!-- Boundary Dot -->
                  <div class="absolute w-6 h-6 rounded-full border-4 border-orange-600 transition-all duration-300 z-10 shadow-sm bg-white"
                       :style="{ left: `calc(1rem + 8px + ${((userValue + 10) / 20) * 100}%)`, transform: 'translateX(-50%)' }">
                       <div v-if="userIncluded" class="w-full h-full bg-orange-600 rounded-full scale-[1.1]"></div>
                  </div>
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