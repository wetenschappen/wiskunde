<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEquals, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Het Gelijkheidsteken' },
  instruction: { 
    type: String, 
    default: 'Een gelijkheidsteken (=) betekent dat de linkerkant <strong>exact evenveel waard is</strong> als de rechterkant. Vaak plakken leerlingen berekeningen aan elkaar vast, wat wiskundig illegaal is!<br/><br/><strong>Opdracht:</strong> Jij bent de leraar. Welk gelijkheidsteken in de nota\'s hieronder is <strong>FOUT</strong> gebruikt? Klik erop om het te doorstrepen.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhEquals }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een van de gelijkheidstekens (=) in het notitieblok.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Vraag: Bereken de helft van 10 en tel er daarna 4 bij.',
    parts: [
      { text: '10 / 2', val: 5 },
      { isEq: true, id: 1 },
      { text: '5 + 4', val: 9 },
      { isEq: true, id: 2 },
      { text: '9', val: 9 }
    ],
    badEqId: 1,
    hintSuccess: 'Perfect gezien! 10 / 2 is 5, maar de rechterkant van dat "=" teken is "5 + 4" en dat is 9. Aangezien 5 ≠ 9 is dat "=" teken fout. Dit noemen we "kettingbotsen".'
  },
  {
    goalText: 'Vraag: Vermenigvuldig 3 met 4 en trek er daarna 2 van af.',
    parts: [
      { text: '3 × 4', val: 12 },
      { isEq: true, id: 1 },
      { text: '12 - 2', val: 10 },
      { isEq: true, id: 2 },
      { text: '10', val: 10 }
    ],
    badEqId: 1,
    hintSuccess: 'Goed zo! 3 × 4 is 12, niet 10. Het eerste gelijkheidsteken is wiskundig fout, ook al volgt de leerling de opdracht netjes in stappen.'
  },
  {
    goalText: 'Vraag: Trek 5 af van 15 en deel het resultaat door 2.',
    parts: [
      { text: '15 - 5', val: 10 },
      { isEq: true, id: 1 },
      { text: '10', val: 10 },
      { isEq: true, id: 2 },
      { text: '10 / 2', val: 5 },
      { isEq: true, id: 3 },
      { text: '5', val: 5 }
    ],
    badEqId: 2,
    hintSuccess: 'Precies! Het is niet het eerste teken dat fout is (15-5 is inderdaad 10). Maar het TWEEDE teken stelt dat 10 gelijk is aan 10/2. Dat is onzin!'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const eqStates = ref({}) // map of eqId -> 'normal', 'wrong', 'correct'

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op het FOUTE gelijkheidsteken (=) in het notitieblok.' };
    eqStates.value = {};
    currentLevelData.value.parts.forEach(p => {
        if (p.isEq) eqStates.value[p.id] = 'normal';
    });
}

function selectEq(eqId) {
    if (isCorrect.value) return;
    isChecked.value = true;
    
    // Reset all
    for (let key in eqStates.value) eqStates.value[key] = 'normal';

    if (eqId === currentLevelData.value.badEqId) {
        isCorrect.value = true;
        eqStates.value[eqId] = 'correct'; // Correctly identified as error
        feedback.value = { type: 'success', text: currentLevelData.value.hintSuccess }
    } else {
        isCorrect.value = false;
        eqStates.value[eqId] = 'wrong';
        feedback.value = { type: 'error', text: 'Dit gelijkheidsteken klopt wél: reken de linkerkant en de rechterkant van DIT teken maar eens uit. Ze zijn precies even groot! Zoek verder.'}
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Notebook Paper Visual -->
              <div class="w-full max-w-3xl bg-[#fffcee] min-h-[400px] shadow-lg border border-slate-300 relative rounded-r-xl overflow-hidden font-mono text-2xl text-blue-900 tracking-wider">
                  
                  <!-- Margin line -->
                  <div class="absolute top-0 bottom-0 left-12 w-0.5 bg-red-400"></div>
                  <!-- Notebook rings simulated -->
                  <div class="absolute top-0 bottom-0 left-0 w-8 flex flex-col justify-evenly">
                      <div v-for="i in 12" :key="'ring'+i" class="w-6 h-6 rounded-full border border-slate-300 bg-slate-50 shadow-inner ml-2"></div>
                  </div>

                  <!-- Content -->
                  <div class="pl-20 pt-16 pr-8">
                      <p class="text-lg font-sans font-bold text-slate-800 mb-8 border-b-2 border-dashed border-slate-300 pb-2">
                          {{ currentLevelData.goalText }}
                      </p>
                      
                      <!-- The flawed equation -->
                      <div class="flex items-center gap-4 mt-8 flex-wrap leading-[3rem]">
                          
                          <template v-for="(part, index) in currentLevelData.parts" :key="index">
                              
                              <span v-if="!part.isEq" class="opacity-90 hover:opacity-100 transition-opacity" :class="index === currentLevelData.parts.length - 1 ? 'border-b-4 border-blue-900' : ''">
                                  {{ part.text }}
                              </span>
                              
                              <div v-else class="relative inline-block">
                                  <button @click="selectEq(part.id)" :disabled="isCorrect"
                                          class="px-2 rounded border-2 border-transparent transition-all hover:border-blue-300 active:scale-95 bg-white/50 cursor-pointer"
                                          :class="eqStates[part.id] === 'correct' ? '!border-red-500 !bg-red-100' : (eqStates[part.id] === 'wrong' ? '!border-red-500 !bg-red-100 animate-shake' : '')">
                                      =
                                  </button>
                                  
                                  <!-- Strike through if chosen correctly -->
                                  <div v-if="eqStates[part.id] === 'correct'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div class="w-full h-1.5 bg-red-600 transform rotate-[-20deg] rounded-full scale-125 animate-fadeIn"></div>
                                  </div>
                                  
                                  <!-- X mark if chosen wrong -->
                                  <div v-if="eqStates[part.id] === 'wrong'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <PhX weight="bold" class="w-8 h-8 text-red-600 absolute -top-1 animate-fadeIn" />
                                  </div>
                              </div>

                          </template>

                      </div>

                      <div v-if="isCorrect" class="mt-12 bg-red-100 border border-red-300 p-4 rounded-xl shadow-sm text-lg font-sans font-medium text-red-800 animate-fadeIn flex items-start gap-4">
                          <div class="text-3xl mt-1">🤔</div>
                          <div>
                              <strong>Lerarennotitie:</strong><br/>
                              Dit gelijkheidsteken liegt! De waarde aan de linkerkant is niet hetzelfde als de waarde aan de rechterkant. Leerlingen schrijven vaak in een 'treintje' om stappen te noteren, maar wiskundig mag je het '=' teken dan niet gebruiken.
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>