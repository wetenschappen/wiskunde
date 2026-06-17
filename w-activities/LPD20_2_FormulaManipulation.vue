<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhFunction,
  PhArrowClockwise,
  PhX as PhMultiply,
  PhDivide
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Formules Omvormen'
  },
  instruction: {
    type: String,
    default: 'Vorm de formule om door aan BEIDE kanten dezelfde bewerking uit te voeren totdat de gevraagde variabele helemaal alleen staat.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhFunction }
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
  const formulaPool = [
    {
      goalText: 'Isoleer s in de snelheidsformule.',
      targetVar: 's',
      initL: { term: 'v', fraction: null },
      initR: { term: 's', fraction: 't' },
      hint1: 'Vermenigvuldig beide kanten met t om s uit de noemer te halen.',
      hint2: 's staat nu niet meer in een breuk. Welke bewerking heeft s nog nodig? Zoek naar vermenigvuldigingen.',
      hint3: 's = v·t. Vermenigvuldig met t, klaar!'
    },
    {
      goalText: 'Isoleer t in de formule v = s/t.',
      targetVar: 't',
      initL: { term: 'v', fraction: null },
      initR: { term: 's', fraction: 't' },
      hint1: 'Vermenigvuldig met t om t uit de noemer te halen.',
      hint2: 'Je hebt nu v·t = s. Deel door v om t alleen te zetten.',
      hint3: 't = s/v. Vermenigvuldig met t, deel door v.'
    },
    {
      goalText: 'Isoleer m in de wet van Newton.',
      targetVar: 'm',
      initL: { term: 'F', fraction: null },
      initR: { term: 'm·a', fraction: null },
      hint1: 'm is vermenigvuldigd met a. Hoe maak je m alleen?',
      hint2: 'Deel beide kanten door a om m te isoleren.',
      hint3: 'm = F / a. Deel door a.'
    },
    {
      goalText: 'Isoleer R in de wet van Ohm.',
      targetVar: 'R',
      initL: { term: 'V', fraction: null },
      initR: { term: 'I·R', fraction: null },
      hint1: 'R is vermenigvuldigd met I. Welke bewerking maakt R vrij?',
      hint2: 'Deel beide kanten door I om R te isoleren.',
      hint3: 'R = V / I. Deel door I.'
    },
    {
      goalText: 'Isoleer h in de driehoeksformule. Dit vereist 2 stappen!',
      targetVar: 'h',
      initL: { term: 'A', fraction: null },
      initR: { term: 'b·h', fraction: '2' },
      hint1: 'Vermenigvuldig met 2 om de noemer weg te werken.',
      hint2: 'Deel dan door b om h te isoleren.',
      hint3: 'h = 2A / b. Eerst ×2, dan ÷b.'
    },
    {
      goalText: 'Isoleer b in de formule A = (b·h)/2.',
      targetVar: 'b',
      initL: { term: 'A', fraction: null },
      initR: { term: 'b·h', fraction: '2' },
      hint1: 'Vermenigvuldig met 2 om de breuk weg te werken.',
      hint2: 'Deel dan door h om b te isoleren.',
      hint3: 'b = 2A / h. Eerst ×2, dan ÷h.'
    },
    {
      goalText: 'Isoleer A in de formule P = F/A.',
      targetVar: 'A',
      initL: { term: 'P', fraction: null },
      initR: { term: 'F', fraction: 'A' },
      hint1: 'Vermenigvuldig met A om A uit de noemer te halen.',
      hint2: 'Deel dan door P om A te isoleren.',
      hint3: 'A = F / P. Eerst ×A, dan ÷P.'
    }
  ]

  // Pick 3 distinct formulas
  const shuffled = [...formulaPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Math state
const stateL = ref({ term: '', fraction: null })
const stateR = ref({ term: '', fraction: null })

// Input State
const opType = ref('*')
const opVar = ref('')

function resetActivityState() {
  levels.value = generateLevel();
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Kies een bewerking en voer die uit.' };

  const init = currentLevelData.value;
  stateL.value = JSON.parse(JSON.stringify(init.initL));
  stateR.value = JSON.parse(JSON.stringify(init.initR));

  opType.value = '*';
  opVar.value = '';
}

function applyOperation() {
  if (isCorrect.value) return;
  const v = opVar.value.trim();
  if (!v) return;

  isChecked.value = true;

  const applySide = (state) => {
    let newState = { ...state };

    if (opType.value === '*') {
      if (newState.fraction === v) {
        newState.fraction = null;
      } else if (newState.fraction === null) {
        newState.term = newState.term ? `${newState.term}\u00B7${v}` : v;
      } else {
        newState.term = `${newState.term}\u00B7${v}`;
      }
    } else if (opType.value === '/') {
      const parts = newState.term.split('\u00B7');
      const idx = parts.indexOf(v);

      if (idx > -1) {
        parts.splice(idx, 1);
        newState.term = parts.join('\u00B7') || '1';
      } else {
        if (newState.fraction === null) {
          newState.fraction = v;
        } else {
          newState.fraction = `${newState.fraction}\u00B7${v}`;
        }
      }
    }
    return newState;
  }

  stateL.value = applySide(stateL.value);
  stateR.value = applySide(stateR.value);
  opVar.value = '';

  checkWin();
}

function isIsolated(state, target) {
  return state.term === target && state.fraction === null;
}

function checkWin() {
  const target = currentLevelData.value.targetVar;

  const isolatedLeft = isIsolated(stateL.value, target);
  const isolatedRight = isIsolated(stateR.value, target);

  if (isolatedLeft || isolatedRight) {
    isCorrect.value = true;
    attemptCount.value = 0;
    feedback.value = {
      type: 'success',
      text: `Uitstekend! Je hebt de formule succesvol omgevormd naar ${target} = ${isolatedLeft ? stateR.value.term + (stateR.value.fraction ? '/' + stateR.value.fraction : '') : stateL.value.term + (stateL.value.fraction ? '/' + stateL.value.fraction : '')}.`
    }
  } else {
    isCorrect.value = false;
    attemptCount.value++;

    const data = currentLevelData.value;
    if (attemptCount.value <= 1) {
      feedback.value = { type: 'info', text: data.hint1 }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'info', text: data.hint2 }
    } else {
      feedback.value = { type: 'info', text: data.hint3 }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-blue-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-blue-50 p-4 border border-blue-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-blue-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Jouw Bewerking</p>

              <div class="flex flex-col gap-4">

                <div class="flex gap-2">
                  <button @click="opType = '*'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '*' ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-200 bg-white text-slate-500'"><PhMultiply /></button>
                  <button @click="opType = '/'" class="flex-1 h-12 rounded-lg font-black text-xl border-2 transition-colors flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="opType === '/' ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-200 bg-white text-slate-500'"><PhDivide /></button>
                </div>

                <div class="flex gap-2 items-center">
                   <input type="text" v-model="opVar" class="flex-1 p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-blue-500 text-center" placeholder="variabele of getal">
                </div>

                <button @click="applyOperation" :disabled="isCorrect || !opVar" class="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                   Toepassen op L en R
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

              <button v-if="!isCorrect" disabled class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 opacity-50">
                Voer een actie uit
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="bg-white p-16 rounded-xl shadow-md border-4 flex items-center gap-8 min-w-[400px] justify-center transition-all duration-300 transform scale-125"
                   :class="isCorrect ? 'border-emerald-400' : 'border-blue-200'">

                <!-- Left Side -->
                <div class="text-4xl font-mono font-black text-slate-700 min-w-[80px] text-right" :class="{ 'text-emerald-600 scale-110 transition-transform': isCorrect && isIsolated(stateL, currentLevelData.targetVar) }">
                  <span v-if="stateL.fraction !== null" class="inline-flex flex-col items-center">
                    <span>{{ stateL.term }}</span>
                    <span class="w-full border-t-[4px] border-slate-700 my-1"></span>
                    <span>{{ stateL.fraction }}</span>
                  </span>
                  <span v-else>{{ stateL.term }}</span>
                </div>

                <!-- Equals -->
                <div class="text-5xl font-mono font-black text-slate-300">
                  =
                </div>

                <!-- Right Side -->
                <div class="text-4xl font-mono font-black text-slate-700 min-w-[80px] text-left" :class="{ 'text-emerald-600 scale-110 transition-transform': isCorrect && isIsolated(stateR, currentLevelData.targetVar) }">
                  <span v-if="stateR.fraction !== null" class="inline-flex flex-col items-center">
                    <span>{{ stateR.term }}</span>
                    <span class="w-full border-t-[4px] border-slate-700 my-1"></span>
                    <span>{{ stateR.fraction }}</span>
                  </span>
                  <span v-else>{{ stateR.term }}</span>
                </div>

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
