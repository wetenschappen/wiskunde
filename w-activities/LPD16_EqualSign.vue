<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEquals, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

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
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een van de gelijkheidstekens (=) in het notitieblok.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Simple 2-step chain with wrong early =
  const ops1 = ['+', '-', '×']
  const op1 = ops1[Math.floor(Math.random() * ops1.length)]
  const n1a = 2 + Math.floor(Math.random() * 8) // 2-9
  const n1b = 2 + Math.floor(Math.random() * 8)
  // Build: n1a op n1b = n1a op n1b result - n1c = final
  // The first = is wrong because LHS ≠ RHS+continuation

  // Level 2: medium chain
  const ops2 = ['×', '+', '-']
  const op2 = ops2[Math.floor(Math.random() * ops2.length)]
  const n2a = 3 + Math.floor(Math.random() * 7) // 3-9
  const n2b = 2 + Math.floor(Math.random() * 6) // 2-7

  // Level 3: longer chain, trickier misplacement
  const ops3a = ['+', '-', '×']
  const ops3b = ['÷', '×', '+']
  const op3a = ops3a[Math.floor(Math.random() * ops3a.length)]
  const op3b = ops3b[Math.floor(Math.random() * ops3b.length)]
  const n3a = 5 + Math.floor(Math.random() * 10) // 5-14
  const n3b = 2 + Math.floor(Math.random() * 5)  // 2-6
  const n3c = 2 + Math.floor(Math.random() * 4)  // 2-5

  // Helper to compute values
  function compute(a, op, b) {
    if (op === '+') return a + b
    if (op === '-') return a - b
    if (op === '×') return a * b
    if (op === '÷') return Math.floor(a / b)
    return a + b
  }

  // Level 1
  const r1_1 = compute(n1a, op1, n1b)
  const sub1 = Math.floor(Math.random() * 5) + 1
  const final1 = r1_1 - sub1

  // Level 2
  const r2_1 = compute(n2a, op2, n2b)
  const final2 = r2_1

  // Level 3
  const r3_1 = compute(n3a, op3a, n3b)
  const r3_2 = compute(r3_1, op3b, n3c)
  const final3 = r3_2

  levels.value = [
    {
      goalText: `Vraag: Bereken ${n1a} ${op1} ${n1b} en trek er daarna ${sub1} van af.`,
      parts: [
        { text: `${n1a} ${op1} ${n1b}`, val: r1_1 },
        { isEq: true, id: 1 },
        { text: `${r1_1} - ${sub1}`, val: r1_1 - sub1 },
        { isEq: true, id: 2 },
        { text: `${final1}`, val: final1 }
      ],
      badEqId: 1,
      hints: [
        `Reken de linkerkant van het eerste "="-teken uit. Is dat gelijk aan de rechterkant van DÍT teken?`,
        `${n1a} ${op1} ${n1b} = ${r1_1}. Maar de rechterkant is "${r1_1} - ${sub1}" = ${r1_1 - sub1}. ${r1_1} ≠ ${r1_1 - sub1}, dus dit "="-teken klopt niet.`,
        `Het eerste "="-teken is fout. ${r1_1} is niet gelijk aan ${r1_1 - sub1}.`
      ]
    },
    {
      goalText: `Vraag: Vermenigvuldig ${n2a} met ${n2b} en trek er daarna ... nee, dat is de val.`,
      parts: [
        { text: `${n2a} ${op2} ${n2b}`, val: r2_1 },
        { isEq: true, id: 1 },
        { text: `${r2_1}`, val: r2_1 },
        { isEq: true, id: 2 },
        { text: `${r2_1}`, val: r2_1 }
      ],
      badEqId: 1,
      hints: [
        `Het eerste "="-teken: links staat ${n2a} ${op2} ${n2b}, rechts staat ${r2_1}. Kloppen die?`,
        `${n2a} ${op2} ${n2b} = ${r2_1}. Maar het teken zegt dat dit gelijk is aan het volgende...`,
        `Het EERSTE "="-teken is fout. Het tweede is correct (${r2_1} = ${r2_1}).`
      ]
    },
    {
      goalText: `Vraag: Bereken ${n3a} ${op3a} ${n3b} ${op3b} ${n3c}.`,
      parts: [
        { text: `${n3a} ${op3a} ${n3b}`, val: r3_1 },
        { isEq: true, id: 1 },
        { text: `${r3_1}`, val: r3_1 },
        { isEq: true, id: 2 },
        { text: `${r3_1} ${op3b} ${n3c}`, val: r3_2 },
        { isEq: true, id: 3 },
        { text: `${final3}`, val: final3 }
      ],
      badEqId: 2,
      hints: [
        `Het TWEEDE "="-teken: links staat ${r3_1}, rechts staat "${r3_1} ${op3b} ${n3c}" = ${r3_2}. Zijn die gelijk?`,
        `${r3_1} is niet gelijk aan ${r3_2}. Het tweede "="-teken is wiskundig fout!`,
        `Het tweede "="-teken is de boosdoener: ${r3_1} ≠ ${r3_1} ${op3b} ${n3c}.`
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const eqStates = ref({}) // map of eqId -> 'normal', 'wrong', 'correct'

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op het FOUTE gelijkheidsteken (=) in het notitieblok.' };
    eqStates.value = {};
    generateLevel();
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
        feedback.value = { type: 'success', text: 'Perfect gezien! Dit gelijkheidsteken is wiskundig fout, ook al volgt de leerling de opdracht in stappen.' }
    } else {
        isCorrect.value = false;
        attemptCount.value++;
        eqStates.value[eqId] = 'wrong';

        const hints = currentLevelData.value.hints
        const hintIdx = Math.min(attemptCount.value - 1, hints.length - 1)
        feedback.value = {
          type: 'error',
          text: `Niet juist. ${hints[hintIdx]}`
        }
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
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
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
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
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
