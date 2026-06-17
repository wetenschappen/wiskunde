<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCalculator, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Schatten: De Kapotte Rekenmachine' },
  instruction: {
    type: String,
    default: 'Een rekenmachine kan kapot zijn, of je kan zélf per ongeluk een getal verkeerd intypen. Schatten helpt je om <strong>onzin-antwoorden</strong> eruit te filteren!<br/><br/><strong>Opdracht:</strong> Rond de getallen af naar makkelijke tientallen om snel te schatten. Beoordeel daarna of het antwoord van de rekenmachine klopt of pure onzin is.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCalculator }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Rond eerst de getallen af en beslis dan of de rekenmachine de waarheid spreekt.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Addition — compute actual sum, decide if nonsense
  const ops = ['+', '-', '×']
  const op1 = ops[Math.floor(Math.random() * 3)]
  const n1a = 20 + Math.floor(Math.random() * 60)   // 20-79
  const n1b = 10 + Math.floor(Math.random() * 40)   // 10-49
  const real1 = op1 === '+' ? n1a + n1b : op1 === '-' ? n1a - n1b : n1a * n1b
  const wrong1 = op1 === '+' ? n1a * 10 + n1b : op1 === '-' ? n1a - n1b * 10 : n1a * n1b * 10
  const isNonsense1 = Math.random() > 0.5
  const calcAns1 = isNonsense1 ? wrong1 : real1

  const round1a = Math.round(n1a / 10) * 10
  const round1b = Math.round(n1b / 10) * 10

  // Level 2: Subtraction
  const n2a = 80 + Math.floor(Math.random() * 121)  // 80-200
  const n2b = 20 + Math.floor(Math.random() * 60)   // 20-79
  const op2 = '-'
  const real2 = n2a - n2b
  const wrong2 = n2a + n2b
  const isNonsense2 = Math.random() > 0.5
  const calcAns2 = isNonsense2 ? wrong2 : real2

  const round2a = Math.round(n2a / 10) * 10
  const round2b = Math.round(n2b / 10) * 10

  // Level 3: Multiplication
  const n3a = 10 + Math.floor(Math.random() * 20)   // 10-29
  const n3b = 3 + Math.floor(Math.random() * 8)     // 3-10
  const op3 = '×'
  const real3 = n3a * n3b
  const wrong3 = n3a * n3b * 10
  const isNonsense3 = Math.random() > 0.5
  const calcAns3 = isNonsense3 ? wrong3 : real3

  const round3a = Math.round(n3a / 5) * 5 > 0 ? Math.round(n3a / 5) * 5 : n3a
  const round3b = Math.round(n3b / 1) * 1 // round to nearest integer

  levels.value = [
    {
      goalText: `Opdracht 1: ${op1 === '+' ? 'Optellen' : op1 === '-' ? 'Aftrekken' : 'Vermenigvuldigen'}`,
      num1: n1a, num2: n1b,
      op: op1 === '+' ? '+' : op1 === '-' ? '−' : '×',
      calcAns: isNonsense1 ? wrong1 : real1,
      targetRound1: round1a, targetRound2: round1b,
      targetVerdict: isNonsense1 ? 'nonsense' : 'correct',
      successMsg: isNonsense1
        ? `Geweldig! ${round1a} ${op1 === '+' ? '+' : op1 === '-' ? '−' : '×'} ${round1b} ≈ ${op1 === '+' ? round1a + round1b : op1 === '-' ? round1a - round1b : round1a * round1b}. Het antwoord ${wrong1} is zware ONZIN!`
        : `Goed zo! ${round1a} ${op1 === '+' ? '+' : op1 === '-' ? '−' : '×'} ${round1b} ≈ ${op1 === '+' ? round1a + round1b : op1 === '-' ? round1a - round1b : round1a * round1b}. Het antwoord ${real1} is correct.`,
      hints: [
        `Rond ${n1a} af naar een mooi tiental.`,
        `Rond ${n1b} af naar een mooi tiental.`,
        isNonsense1
          ? `Je schatting is ${round1a} ${op1 === '+' ? '+' : op1 === '-' ? '−' : '×'} ${round1b} = ${op1 === '+' ? round1a + round1b : op1 === '-' ? round1a - round1b : round1a * round1b}. Is ${wrong1} realistisch?`
          : `Je schatting is ${round1a} ${op1 === '+' ? '+' : op1 === '-' ? '−' : '×'} ${round1b} = ${op1 === '+' ? round1a + round1b : op1 === '-' ? round1a - round1b : round1a * round1b}. Ligt ${real1} in de buurt?`
      ]
    },
    {
      goalText: 'Opdracht 2: Aftrekken',
      num1: n2a, num2: n2b,
      op: '−',
      calcAns: isNonsense2 ? wrong2 : real2,
      targetRound1: round2a, targetRound2: round2b,
      targetVerdict: isNonsense2 ? 'nonsense' : 'correct',
      successMsg: isNonsense2
        ? `Geweldig! ${round2a} − ${round2b} ≈ ${round2a - round2b}. Het antwoord ${wrong2} is ONZIN (veel te groot)!`
        : `Goed zo! ${round2a} − ${round2b} ≈ ${round2a - round2b}. Het antwoord ${real2} is correct.`,
      hints: [
        `Rond ${n2a} af naar het dichtstbijzijnde tiental.`,
        `Rond ${n2b} af naar een mooi tiental.`,
        isNonsense2
          ? `${round2a} − ${round2b} ≈ ${round2a - round2b}. Het rekenmachine-antwoord ${wrong2} is veel te groot!`
          : `${round2a} − ${round2b} ≈ ${round2a - round2b}. Ligt ${real2} dicht bij je schatting?`
      ]
    },
    {
      goalText: 'Opdracht 3: Vermenigvuldigen',
      num1: n3a, num2: n3b,
      op: '×',
      calcAns: isNonsense3 ? wrong3 : real3,
      targetRound1: round3a, targetRound2: round3b,
      targetVerdict: isNonsense3 ? 'nonsense' : 'correct',
      successMsg: isNonsense3
        ? `Perfect! ${round3a} × ${round3b} ≈ ${round3a * round3b}. Het antwoord ${wrong3} is veel te groot (kommafout?). ONZIN dus!`
        : `Goed zo! ${round3a} × ${round3b} ≈ ${round3a * round3b}. Het antwoord ${real3} is correct.`,
      hints: [
        `Rond ${n3a} af naar een mooi rond getal.`,
        `Rond ${n3b} af naar het dichtstbijzijnde gehele getal.`,
        isNonsense3
          ? `${round3a} × ${round3b} ≈ ${round3a * round3b}. Het antwoord ${wrong3} is véél te groot!`
          : `${round3a} × ${round3b} ≈ ${round3a * round3b}. Ligt ${real3} in de buurt?`
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const userRound1 = ref(null)
const userRound2 = ref(null)
const userVerdict = ref('') // 'correct', 'nonsense'

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Rond eerst de getallen af en beslis dan of de rekenmachine de waarheid spreekt.' };
    userRound1.value = null;
    userRound2.value = null;
    userVerdict.value = '';
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const data = currentLevelData.value;

  if (userRound1.value === data.targetRound1 && userRound2.value === data.targetRound2 && userVerdict.value === data.targetVerdict) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    isCorrect.value = false

    const hints = data.hints
    const hintIdx = Math.min(attemptCount.value - 1, hints.length - 1)

    if (userRound1.value !== data.targetRound1) {
        feedback.value = { type: 'error', text: hints[0] }
    } else if (userRound2.value !== data.targetRound2) {
        feedback.value = { type: 'error', text: hints[1] }
    } else if (userVerdict.value === '') {
        feedback.value = { type: 'error', text: 'Vergeet niet je eindoordeel te geven over de rekenmachine (KLOPT / ONZIN).'}
    } else {
        feedback.value = { type: 'error', text: hints[hintIdx] }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    nextTick(() => mainArea.value?.focus())
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
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner flex flex-col gap-4">

               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-math-blue">Stap 1: Schatting maken</label>
                   <div class="flex items-center gap-2">
                       <input type="number" v-model.number="userRound1" :placeholder="`${currentLevelData.num1}`" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                       <span class="font-black text-slate-400">{{ currentLevelData.op }}</span>
                       <input type="number" v-model.number="userRound2" :placeholder="`${currentLevelData.num2}`" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                   </div>
               </div>

               <div class="flex flex-col gap-2 border-t border-surface-200 pt-4">
                   <label class="text-sm font-bold text-math-blue">Stap 2: Beoordeling Rekenmachine</label>
                   <div class="flex gap-2">
                       <button @click="userVerdict = 'correct'" :disabled="isCorrect"
                               class="flex-1 py-2 rounded-lg font-bold transition-colors border-2"
                               :class="userVerdict === 'correct' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                           KLOPT
                       </button>
                       <button @click="userVerdict = 'nonsense'" :disabled="isCorrect"
                               class="flex-1 py-2 rounded-lg font-bold transition-colors border-2"
                               :class="userVerdict === 'nonsense' ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                           ONZIN
                       </button>
                   </div>
               </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (userRound1 === null || userRound2 === null || userVerdict === '')" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Calculator Visual -->
              <div class="w-72 bg-slate-800 rounded-xl p-6 shadow-md border-b-8 border-slate-900 flex flex-col relative" :class="isCorrect && userVerdict === 'nonsense' ? 'animate-shake' : ''">

                  <div v-if="isCorrect && userVerdict === 'nonsense'" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black px-6 py-2 rounded-full shadow-sm border-4 border-white rotate-12 z-20 whitespace-nowrap text-xl">
                      GEBUISD!
                  </div>

                  <div v-if="isCorrect && userVerdict === 'correct'" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black px-6 py-2 rounded-full shadow-sm border-4 border-white -rotate-6 z-20 whitespace-nowrap text-xl">
                      GOEDGEKEURD!
                  </div>

                  <!-- Screen -->
                  <div class="h-28 bg-[#a3c2b8] rounded-xl border-4 border-slate-700 shadow-inner flex flex-col p-4 mb-6 relative overflow-hidden">
                      <div class="absolute inset-0 opacity-10 bg-stripes pointer-events-none"></div>
                      <span class="text-[10px] font-mono text-slate-600 font-bold">MATH</span>
                      <span class="text-right text-base font-mono text-slate-600 mb-1" :key="currentInternalLevel + 'eq'">{{ currentLevelData.num1 }} {{ currentLevelData.op }} {{ currentLevelData.num2 }}</span>
                      <span class="text-right text-4xl font-mono text-slate-800 font-black mt-auto tracking-widest" :key="currentInternalLevel + 'ans'">{{ currentLevelData.calcAns }}</span>
                  </div>

                  <!-- Buttons Grid -->
                  <div class="grid grid-cols-4 gap-4">
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow-sm border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow-sm border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow-sm border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-math-blue rounded-lg shadow-sm border-b-4 border-math-blue"></div>

                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-blue-500 rounded-lg shadow-sm border-b-4 border-blue-600"></div>

                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-blue-500 rounded-lg shadow-sm border-b-4 border-blue-600"></div>

                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow-sm border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-700 rounded-lg shadow-sm border-b-4 border-slate-900 flex items-center justify-center font-black text-white text-2xl">=</div>
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
.bg-stripes { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-2deg); }
  20%, 80% { transform: translate3d(2px, 0, 0) rotate(2deg); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-4deg); }
  40%, 60% { transform: translate3d(4px, 0, 0) rotate(4deg); }
}
</style>
