<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhRuler,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelling van Pythagoras (Oppervlaktes)'
  },
  instruction: {
    type: String,
    default: 'De Stelling van Pythagoras draait om vierkanten! Bereken en sleep de juiste oppervlakte naar de bijbehorende vierkanten rond de rechthoekige driehoek.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRuler }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Bereken de totale oppervlakte van C.',
    sideA: 3, sideB: 4, sideC: 5,
    areaA_given: 9, areaB_given: 16, areaC_given: null,
    targetC: 25,
    options: [20, 25, 36, 49]
  },
  {
    goalText: 'Opdracht 2: Zoek de ontbrekende rechthoekszijde B.',
    sideA: 5, sideB: 12, sideC: 13,
    areaA_given: 25, areaB_given: null, areaC_given: 169,
    targetB: 144,
    options: [100, 144, 194, 60]
  },
  {
    goalText: 'Opdracht 3: Je krijgt alleen de lengtes van de zijden. Bereken eerst de kwadraten zelf!',
    sideA: 6, sideB: 8, sideC: 10,
    areaA_given: null, areaB_given: null, areaC_given: null,
    targetA: 36, targetB: 64, targetC: 100,
    options: [14, 36, 48, 64, 100]
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Slots
const slotA = ref(null)
const slotB = ref(null)
const slotC = ref(null)

let draggedItem = null

function onDragStart(val) {
  if (isCorrect.value) return;
  draggedItem = val;
}

function onDrop(target) {
  if (isCorrect.value || !draggedItem) return;
  if (target === 'A') slotA.value = draggedItem;
  if (target === 'B') slotB.value = draggedItem;
  if (target === 'C') slotC.value = draggedItem;
  draggedItem = null;
  isChecked.value = false;
}

function removeSlot(target) {
  if (isCorrect.value) return;
  if (target === 'A') slotA.value = null;
  if (target === 'B') slotB.value = null;
  if (target === 'C') slotC.value = null;
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Sleep de getallen naar de lege vakken.' };
  
  const d = currentLevelData.value;
  slotA.value = d.areaA_given;
  slotB.value = d.areaB_given;
  slotC.value = d.areaC_given;
}

function checkAnswer() {
  isChecked.value = true;
  
  const d = currentLevelData.value;
  
  if (slotA.value === null || slotB.value === null || slotC.value === null) {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: 'Vul alle lege vierkanten in voordat je controleert.' };
      return;
  }

  // The ultimate Pythagoras check
  if (slotA.value + slotB.value === slotC.value) {
      // Also ensure they didn't just put random math that works but doesn't fit the sides
      // We check if A = sideA^2 etc.
      if (slotA.value === d.sideA * d.sideA && slotB.value === d.sideB * d.sideB && slotC.value === d.sideC * d.sideC) {
        isCorrect.value = true;
        feedback.value = { type: 'success', text: `Schitterend! a² + b² = c² -> ${slotA.value} + ${slotB.value} = ${slotC.value}. Pythagoras is tevreden.` };
      } else {
        isCorrect.value = false;
        feedback.value = { type: 'error', text: 'De som klopt wel, maar dit zijn niet de juiste kwadraten van deze specifieke zijden! Bereken basis × basis.' };
      }
  } else {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: `Oeps, ${slotA.value} + ${slotB.value} is NIET gelijk aan ${slotC.value}. De oppervlaktes van A en B moeten samen C vormen.` };
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-rose-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-rose-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-rose-50 p-4 border border-rose-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-rose-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="mt-8 space-y-4">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Mogelijke Oppervlaktes</p>
              
              <div class="flex flex-wrap gap-3">
                <div v-for="opt in currentLevelData.options" :key="opt"
                     draggable="true"
                     @dragstart="onDragStart(opt)"
                     class="w-16 h-16 border-2 border-slate-300 bg-white rounded-xl flex items-center justify-center font-bold text-xl font-mono text-slate-700 cursor-grab active:cursor-grabbing hover:border-rose-400 hover:text-rose-600 transition-colors shadow-sm"
                     :class="{ 'opacity-30 pointer-events-none': slotA === opt || slotB === opt || slotC === opt }">
                  {{ opt }}
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
              
              <!-- Scale visualization -->
              <div class="relative flex items-center justify-center transition-all duration-700 scale-75 md:scale-100">
                  
                  <!-- The central triangle -->
                  <div class="absolute w-[120px] h-[160px] bg-slate-200" style="clip-path: polygon(100% 0%, 0% 100%, 100% 100%); left: 0; top: 0;"></div>
                  
                  <!-- Right angle marker -->
                  <div class="absolute border-t-4 border-l-4 border-slate-800 w-6 h-6" style="left: 116px; top: 156px; transform: rotate(180deg);"></div>
                  
                  <!-- Side A Label (bottom) -->
                  <div class="absolute font-bold text-blue-800 bg-white/80 px-1 rounded" style="left: 60px; top: 165px;">a = {{ currentLevelData.sideA }}</div>
                  
                  <!-- Side B Label (right) -->
                  <div class="absolute font-bold text-fuchsia-800 bg-white/80 px-1 rounded" style="left: 130px; top: 80px;">b = {{ currentLevelData.sideB }}</div>
                  
                  <!-- Side C Label (hypotenuse) -->
                  <div class="absolute font-bold text-emerald-800 bg-white/80 px-1 rounded transform -rotate-[53deg]" style="left: 20px; top: 70px;">c = {{ currentLevelData.sideC }}</div>

                  <!-- Square A (Bottom) -->
                  <div class="absolute flex flex-col items-center justify-center bg-blue-100 border-4 border-blue-400 rounded-lg shadow-inner" style="left: 0px; top: 160px; width: 120px; height: 120px;">
                      <span class="text-blue-400 font-bold mb-1">A (a²)</span>
                      <div v-if="currentLevelData.areaA_given !== null" class="text-3xl font-mono font-black text-blue-600">{{ slotA }}</div>
                      <div v-else
                           @dragover.prevent.stop
                           @drop.prevent.stop="onDrop('A')"
                           class="w-16 h-16 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer"
                           :class="slotA ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-blue-500 text-blue-600') : 'border-blue-300'"
                           @click="removeSlot('A')">
                           <span v-if="slotA" class="font-mono text-xl font-black">{{ slotA }}</span>
                      </div>
                  </div>

                  <!-- Square B (Right) -->
                  <div class="absolute flex flex-col items-center justify-center bg-fuchsia-100 border-4 border-fuchsia-400 rounded-lg shadow-inner" style="left: 120px; top: 0px; width: 160px; height: 160px;">
                      <span class="text-fuchsia-400 font-bold mb-1">B (b²)</span>
                      <div v-if="currentLevelData.areaB_given !== null" class="text-3xl font-mono font-black text-fuchsia-600">{{ slotB }}</div>
                      <div v-else
                           @dragover.prevent.stop
                           @drop.prevent.stop="onDrop('B')"
                           class="w-16 h-16 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer"
                           :class="slotB ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-fuchsia-500 text-fuchsia-600') : 'border-fuchsia-300'"
                           @click="removeSlot('B')">
                           <span v-if="slotB" class="font-mono text-xl font-black">{{ slotB }}</span>
                      </div>
                  </div>

                  <!-- Square C (Hypotenuse) -->
                  <!-- The hypotenuse goes from (120,0) to (0,160). Length is 200. Angle is roughly -53.13 deg -->
                  <div class="absolute flex flex-col items-center justify-center bg-emerald-100 border-4 border-emerald-400 rounded-lg shadow-inner origin-top-left transform -translate-x-[120px] -translate-y-[160px]" 
                       style="left: 0px; top: 160px; width: 200px; height: 200px; transform: rotate(36.87deg) translateY(-200px);">
                      <div class="transform -rotate-[36.87deg] flex flex-col items-center">
                          <span class="text-emerald-500 font-bold mb-2">C (c²)</span>
                          <div v-if="currentLevelData.areaC_given !== null" class="text-4xl font-mono font-black text-emerald-600">{{ slotC }}</div>
                          <div v-else
                               @dragover.prevent.stop
                               @drop.prevent.stop="onDrop('C')"
                               class="w-20 h-20 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer"
                               :class="slotC ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-emerald-500 text-emerald-600') : 'border-emerald-300'"
                               @click="removeSlot('C')">
                               <span v-if="slotC" class="font-mono text-2xl font-black">{{ slotC }}</span>
                          </div>
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

.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8) rotate(0deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>