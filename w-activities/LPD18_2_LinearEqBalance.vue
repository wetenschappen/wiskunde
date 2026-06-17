<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhScales,
  PhArrowClockwise,
  PhPlus,
  PhMinus,
  PhX as PhMultiply,
  PhDivide
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Vergelijkingen Oplossen (Balans)'
  },
  instruction: {
    type: String,
    default: 'Kies een bewerking (+, -, ×, :) en een getal/waarde. Voer dit uit op BEIDE kanten van de weegschaal tot je x hebt afgezonderd.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels — dynamically generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const l1_a = 2 + Math.floor(Math.random() * 3) // 2,3,4
  const l1_x = 2 + Math.floor(Math.random() * 4) // 2,3,4,5
  const l1_b = 1 + Math.floor(Math.random() * 5) // 1-5
  const l1_c = l1_a * l1_x + l1_b

  const l2_a = 4 + Math.floor(Math.random() * 3) // 4,5,6
  const l2_c = 2 + Math.floor(Math.random() * 2) // 2,3
  const l2_x = 2 + Math.floor(Math.random() * 4) // 2,3,4,5
  const l2_b = 1 + Math.floor(Math.random() * 5) // 1-5
  const l2_d = (l2_a - l2_c) * l2_x + l2_b

  const l3_denom = 2 + Math.floor(Math.random() * 3) // 2,3,4
  const l3_x = l3_denom * (1 + Math.floor(Math.random() * 4)) // multiple of denominator
  const l3_b = 1 + Math.floor(Math.random() * 4) // 1-4
  const l3_c = l3_x / l3_denom + l3_b

  return [
    {
      goalText: 'Opdracht 1: Isoleer x aan de linkerkant.',
      init: () => ({ lx: l1_a, lc: l1_b, rx: 0, rc: l1_c }),
      hintStep1: 'Kun je de ' + l1_b + ' aan de linkerkant wegwerken? Trek ' + l1_b + ' af van beide kanten.',
      hintStep2: 'Deel nu beide kanten door ' + l1_a + ' om x te isoleren.',
      hintFinal: 'Doel: x = ? Eerst -' + l1_b + ', dan ÷' + l1_a + '.'
    },
    {
      goalText: 'Opdracht 2: Er staan nu termen met x aan béíde kanten. Zorg eerst dat ze allemaal aan 1 kant staan.',
      init: () => ({ lx: l2_a, lc: l2_b, rx: l2_c, rc: l2_d }),
      hintStep1: 'Begin met ' + l2_c + 'x van beide kanten af te trekken.',
      hintStep2: 'Haal daarna de constante naar de andere kant.',
      hintFinal: 'Doel: x = ? Eerst -' + l2_c + 'x, dan constante verplaatsen, dan ÷ door de x-coëfficiënt.'
    },
    {
      goalText: 'Opdracht 3: Een deling in de opgave? Gebruik een vermenigvuldiging om ze weg te werken.',
      init: () => ({ lx: 1 / l3_denom, lc: l3_b, rx: 0, rc: l3_c }),
      hintStep1: 'Vermenigvuldig beide kanten met ' + l3_denom + ' om de breuk weg te werken.',
      hintStep2: 'Trek daarna ' + l3_b + ' af van beide kanten.',
      hintFinal: 'Doel: x = ? Eerst ×' + l3_denom + ', dan -' + l3_b + '.'
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Expression State: lx * x + lc = rx * x + rc
const leftExpr = ref({ x: 0, c: 0 })
const rightExpr = ref({ x: 0, c: 0 })

// Operation State
const opType = ref('+') // '+', '-', '*', '/'
const opValue = ref(0)
const opVarType = ref('c') // 'c' for constants, 'x' for variables (e.g. subtract 2x)

function resetActivityState() {
  levels.value = generateLevel();
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Stel een bewerking in en pas toe.' };

  const initial = currentLevelData.value.init();
  leftExpr.value = { x: initial.lx, c: initial.lc };
  rightExpr.value = { x: initial.rx, c: initial.rc };

  opType.value = '+';
  opValue.value = 1;
  opVarType.value = 'c';
}

function applyOperation() {
  if (isCorrect.value) return;

  const val = Number(opValue.value);
  if (isNaN(val)) return;

  if (opType.value === '/' && val === 0) {
    feedback.value = { type: 'error', text: 'Niet helemaal... Delen door 0 is wiskundig niet toegestaan!' };
    return;
  }

  // Toepassen op beide kanten
  let newLx = leftExpr.value.x;
  let newLc = leftExpr.value.c;
  let newRx = rightExpr.value.x;
  let newRc = rightExpr.value.c;

  if (opType.value === '+') {
    if (opVarType.value === 'c') { newLc += val; newRc += val; }
    else { newLx += val; newRx += val; }
  } else if (opType.value === '-') {
    if (opVarType.value === 'c') { newLc -= val; newRc -= val; }
    else { newLx -= val; newRx -= val; }
  } else if (opType.value === '*') {
    if (opVarType.value === 'x') {
      feedback.value = { type: 'error', text: 'Niet helemaal... Vermenigvuldigen met x mag, maar geeft tweedegraadsvergelijkingen (\\(x^2\\)). We houden het hier bij eerstegraads.' };
      return;
    }
    newLx *= val; newLc *= val;
    newRx *= val; newRc *= val;
  } else if (opType.value === '/') {
    if (opVarType.value === 'x') {
      feedback.value = { type: 'error', text: 'Niet helemaal... Delen door x mag alleen als je zeker weet dat x niet 0 is. In de balansmethode doen we dit best niet.' };
      return;
    }
    newLx /= val; newLc /= val;
    newRx /= val; newRc /= val;
  }

  leftExpr.value.x = Math.round(newLx * 100) / 100;
  leftExpr.value.c = Math.round(newLc * 100) / 100;
  rightExpr.value.x = Math.round(newRx * 100) / 100;
  rightExpr.value.c = Math.round(newRc * 100) / 100;

  checkWin();
}

function checkWin() {
  isChecked.value = true;

  const isXOnLeft = leftExpr.value.x === 1 && leftExpr.value.c === 0 && rightExpr.value.x === 0;
  const isXOnRight = rightExpr.value.x === 1 && rightExpr.value.c === 0 && leftExpr.value.x === 0;

  if (isXOnLeft || isXOnRight) {
    isCorrect.value = true;
    attemptCount.value = 0;
    feedback.value = { type: 'success', text: `Briljant! De weegschaal is in balans en x is volledig afgezonderd. Oplossing is x = ${isXOnLeft ? rightExpr.value.c : leftExpr.value.c}.` }
  } else if (leftExpr.value.x === 0 && rightExpr.value.x === 0) {
    isCorrect.value = false;
    attemptCount.value++;
    feedback.value = { type: 'error', text: 'Niet helemaal... Oeps! Je hebt aan beide kanten alle x-termen weggewerkt. Je weegschaal klopt nog steeds, maar je kan x niet meer vinden. Reset en probeer opnieuw.' }
  } else {
    isCorrect.value = false;
    attemptCount.value++;

    const data = currentLevelData.value;
    if (attemptCount.value <= 1) {
      feedback.value = { type: 'info', text: data.hintStep1 }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'info', text: data.hintStep2 }
    } else {
      feedback.value = { type: 'info', text: data.hintFinal }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    nextTick(() => mainArea.value?.focus())
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>

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
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
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

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Jouw Bewerking</p>

              <!-- Operation Toolbar -->
              <div class="flex flex-col gap-4">

                <div class="flex gap-2">
                  <button @click="opType = '+'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '+' ? 'border-math-blue bg-math-blue-bg text-math-blue' : 'border-slate-200 bg-white text-slate-500'"><PhPlus /></button>
                  <button @click="opType = '-'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '-' ? 'border-math-blue bg-math-blue-bg text-math-blue' : 'border-slate-200 bg-white text-slate-500'"><PhMinus /></button>
                  <button @click="opType = '*'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '*' ? 'border-math-blue bg-math-blue-bg text-math-blue' : 'border-slate-200 bg-white text-slate-500'"><PhMultiply /></button>
                  <button @click="opType = '/'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '/' ? 'border-math-blue bg-math-blue-bg text-math-blue' : 'border-slate-200 bg-white text-slate-500'"><PhDivide /></button>
                </div>

                <div class="flex gap-2 items-center">
                   <input type="number" v-model="opValue" class="flex-1 p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-math-blue" placeholder="getal">

                   <!-- Only show 'x' option if it's add or subtract -->
                   <select v-if="opType === '+' || opType === '-'" v-model="opVarType" class="p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-math-blue">
                     <option value="c">getal</option>
                     <option value="x">x</option>
                   </select>
                </div>

                <button @click="applyOperation" :disabled="isCorrect" class="w-full py-4 bg-math-blue hover:bg-math-blue active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                   Uitvoeren op Beide Kanten
                </button>

              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Visual Scale -->
              <div class="relative w-full max-w-2xl flex flex-col items-center">

                <!-- The equations as blocks -->
                <div class="flex justify-between w-full px-16 mb-4 z-10 transition-all duration-500">

                  <!-- Left side -->
                  <div class="flex items-end justify-center gap-2 w-48 h-32 p-4 bg-white/80 border-2 border-surface-200 rounded-xl shadow-md">
                     <span v-if="leftExpr.x !== 0" class="text-3xl font-black text-math-blue">{{ leftExpr.x === 1 ? 'x' : (leftExpr.x === -1 ? '-x' : leftExpr.x + 'x') }}</span>
                     <span v-if="leftExpr.x !== 0 && leftExpr.c > 0" class="text-2xl font-bold text-slate-400">+</span>
                     <span v-if="leftExpr.c !== 0" class="text-3xl font-black text-slate-700">{{ leftExpr.c > 0 ? (leftExpr.x === 0 ? leftExpr.c : leftExpr.c) : leftExpr.c }}</span>
                     <span v-if="leftExpr.x === 0 && leftExpr.c === 0" class="text-3xl font-black text-slate-700">0</span>
                  </div>

                  <div class="text-5xl font-black text-slate-300 self-center">=</div>

                  <!-- Right side -->
                  <div class="flex items-end justify-center gap-2 w-48 h-32 p-4 bg-white/80 border-2 border-surface-200 rounded-xl shadow-md">
                     <span v-if="rightExpr.x !== 0" class="text-3xl font-black text-math-blue">{{ rightExpr.x === 1 ? 'x' : (rightExpr.x === -1 ? '-x' : rightExpr.x + 'x') }}</span>
                     <span v-if="rightExpr.x !== 0 && rightExpr.c > 0" class="text-2xl font-bold text-slate-400">+</span>
                     <span v-if="rightExpr.c !== 0" class="text-3xl font-black text-slate-700">{{ rightExpr.c > 0 ? (rightExpr.x === 0 ? rightExpr.c : rightExpr.c) : rightExpr.c }}</span>
                     <span v-if="rightExpr.x === 0 && rightExpr.c === 0" class="text-3xl font-black text-slate-700">0</span>
                  </div>
                </div>

                <!-- Scale base visual -->
                <div class="w-full max-w-lg h-4 bg-slate-400 rounded-full shadow-md"></div>
                <div class="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[60px] border-l-transparent border-r-transparent border-b-slate-400 mt-[-2px]"></div>

              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
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

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
