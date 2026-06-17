<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSymmetryHorizontal, PhArrowClockwise, PhArrowsClockwise, PhSplitHorizontal
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Symmetrie-Scanner' },
  instruction: {
    type: String,
    default: 'Mensen denken vaak dat bepaalde figuren heel symmetrisch zijn, totdat ze het echt uittesten.<br/><br/><strong>Opdracht:</strong> Gebruik de Symmetrie-Scanner. Test de <strong>Lijnsymmetrie</strong> (spiegelen over een as) en de <strong>Puntsymmetrie</strong> (180° draaien). Bepaal daarna de eigenschap van de figuur.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSymmetryHorizontal }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de scanner-knoppen om de figuur te testen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      goalText: 'Opdracht: Het Parallellogram',
      shapeSVG: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'point',
      successMsg: 'Perfect! Een parallellogram past na 180° draaien (puntsymmetrie) exact op zichzelf, maar als je hem spiegelt (lijnsymmetrie) steken de hoeken uit!',
      errLine: 'Heb je de Lijnsymmetrie-test (spiegelen) uitgevoerd? De rode vorm valt NIET perfect over de blauwe vorm.',
      errPoint: 'Puntsymmetrie klopt, maar de lijnsymmetrie-test mislukt. Kijk naar de uitstekende rode hoeken!',
      errBoth: 'Hij slaagt maar voor één test. Probeer beide testen opnieuw.',
      errNone: 'Hij heeft wel symmetrie. Test beide soorten.',
      hint1: 'Probeer beide testen. Let op of de rode en blauwe vorm perfect samenvallen.',
      hint2: 'Bij lijnsymmetrie moet de gespiegelde vorm exact passen. Bij puntsymmetrie moet 180° draaien werken.',
      hint3: 'Een parallellogram heeft puntsymmetrie (geen lijnsymmetrie).'
    },
    {
      goalText: 'Opdracht: De Vlieger',
      shapeSVG: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'line',
      successMsg: 'Heel goed! Je kan een vlieger exact in de helft vouwen (spiegelen), maar als je hem ondersteboven draait (180°) past hij niet meer.',
      errPoint: 'Heb je de Puntsymmetrie-test (draaien) uitgevoerd? De puntige staart steekt nu plots bovenaan uit!',
      errLine: 'Lijnsymmetrie klopt, maar de puntsymmetrie-test mislukt. Hij mag niet uitsteken.',
      errBoth: 'Hij slaagt maar voor één test. Probeer beide testen opnieuw.',
      errNone: 'Hij heeft wel symmetrie. Test beide soorten.',
      hint1: 'Probeer beide testen. Welke past perfect?',
      hint2: 'Let op of de vorm symmetrisch is over een middellijn (spiegelas).',
      hint3: 'Een vlieger heeft lijnsymmetrie (geen puntsymmetrie).'
    },
    {
      goalText: 'Opdracht: De Rechthoek',
      shapeSVG: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'both',
      successMsg: 'Fantastisch! Een rechthoek is een zeer regelmatige figuur. Je kan hem vouwen én ondersteboven draaien, hij past altijd!',
      errLine: 'Heb je de Puntsymmetrie-test niet geprobeerd? Draai hem eens om, hij past ook perfect!',
      errPoint: 'Heb je de Lijnsymmetrie-test niet geprobeerd? Spiegel hem eens, hij past ook perfect!',
      errBoth: 'Hij slaagt voor allebei! Kies "beide".',
      errNone: 'Hij heeft zeker symmetrie. Test beide soorten opnieuw.',
      hint1: 'Probeer beide testen zorgvuldig. Wat zie je?',
      hint2: 'Een rechthoek is zeer symmetrisch. Test beide soorten.',
      hint3: 'Een rechthoek heeft zowel lijn- als puntsymmetrie.'
    },
    {
      goalText: 'Opdracht: Het Vierkant',
      shapeSVG: '<polygon points="100,30 300,30 300,170 100,170" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="100,30 300,30 300,170 100,170" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'both',
      successMsg: 'Super! Een vierkant is de meest symmetrische veelhoek. Je kan hem op vele manieren vouwen én 180° draaien.',
      errLine: 'Probeer ook de puntsymmetrie-test. Een vierkant heeft beide!',
      errPoint: 'Probeer ook de lijnsymmetrie-test. Een vierkant heeft beide!',
      errBoth: 'Hij slaagt voor allebei! Kies "beide".',
      errNone: 'Hij heeft zeker symmetrie. Test beide soorten.',
      hint1: 'Dit is een zeer regelmatige figuur. Beide testen zouden moeten werken.',
      hint2: 'Een vierkant is symmetrisch in vele opzichten.',
      hint3: 'Een vierkant heeft zowel lijn- als puntsymmetrie.'
    },
    {
      goalText: 'Opdracht: De Ruit',
      shapeSVG: '<polygon points="200,20 350,100 200,180 50,100" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,20 350,100 200,180 50,100" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'point',
      successMsg: 'Juist! Een ruit (geroteerd vierkant) heeft puntsymmetrie: na 180° draaien past hij perfect. Maar lijnsymmetrie werkt niet in deze stand.',
      errLine: 'De lijnsymmetrie-test (spiegelen) werkt niet voor deze ruit. Probeer de andere test.',
      errPoint: 'De puntsymmetrie-test werkt! Maar kijk ook naar lijnsymmetrie.',
      errBoth: 'Hij slaagt maar voor één test. Welke?',
      errNone: 'Hij heeft wel symmetrie! Test beide soorten opnieuw.',
      hint1: 'Probeer de puntsymmetrie-test. Draai de figuur 180°.',
      hint2: 'Deze ruit heeft puntsymmetrie maar geen lijnsymmetrie in deze stand.',
      hint3: 'Een ruit heeft puntsymmetrie (geen lijnsymmetrie in deze oriëntatie).'
    },
    {
      goalText: 'Opdracht: De Onregelmatige Vijfhoek',
      shapeSVG: '<polygon points="200,30 320,80 280,160 120,160 80,80" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,30 320,80 280,160 120,160 80,80" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'none',
      successMsg: 'Goed gezien! Deze onregelmatige vijfhoek heeft geen enkele symmetrie. Niet alle figuren zijn symmetrisch!',
      errLine: 'Kijk nog eens goed. De gespiegelde versie past niet precies.',
      errPoint: 'Kijk nog eens goed. Na 180° draaien past hij niet precies.',
      errBoth: 'Hij heeft geen van beide. Test nog eens en kijk goed.',
      errNone: 'Dat klopt! Hij heeft inderdaad geen symmetrie.',
      hint1: 'Sommige figuren hebben helemaal geen symmetrie. Test beide soorten.',
      hint2: 'Let op of de rode vorm exact over de blauwe valt. Bij geen enkele test zou dat moeten lukken.',
      hint3: 'Deze vijfhoek heeft geen lijn- en geen puntsymmetrie.'
    }
  ]

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const testState = ref('none') // 'none', 'line', 'point'
const userAns = ref('')

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function runTest(type) {
    if (isCorrect.value) return;
    testState.value = 'none'
    setTimeout(() => {
        testState.value = type
    }, 50)
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op de scanner-knoppen om de figuur te testen.' };
    testState.value = 'none';
    userAns.value = '';
}

function checkAnswer() {
  isChecked.value = true;

  const target = currentLevelData.value.correctAns;
  const hint = getHint(currentLevelData.value);

  if (userAns.value === target) {
    if (testState.value === 'none') {
        isCorrect.value = false
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Het antwoord is correct, maar gebruik de scanner knoppen eerst om het met je eigen ogen te bewijzen! ' + hint }
    } else {
        isCorrect.value = true
        attemptCount.value = 0
        feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
    }
  } else {
    isCorrect.value = false
    attemptCount.value++
    if (userAns.value === 'line') {
        feedback.value = { type: 'error', text: (currentLevelData.value.errLine || 'Kijk goed. Past hij na het spiegelen écht perfect?') + ' ' + hint }
    } else if (userAns.value === 'point') {
        feedback.value = { type: 'error', text: (currentLevelData.value.errPoint || 'Kijk goed. Past hij na 180° draaien écht perfect?') + ' ' + hint }
    } else if (userAns.value === 'both') {
        feedback.value = { type: 'error', text: (currentLevelData.value.errBoth || 'Hij slaagt niet voor allebei de testen.') + ' ' + hint }
    } else if (userAns.value === 'none') {
        feedback.value = { type: 'error', text: (currentLevelData.value.errNone || 'Deze vorm heeft minstens één soort symmetrie.') + ' ' + hint }
    } else {
        feedback.value = { type: 'error', text: 'Kies een antwoord uit de lijst. ' + hint }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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
    levels.value = generateLevel();
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

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-math-blue mb-2">Conclusie over de figuur:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een eigenschap...</option>
                   <option value="line">Enkel Lijnsymmetrisch (Spiegelas)</option>
                   <option value="point">Enkel Puntsymmetrisch (180° draai)</option>
                   <option value="both">Zowel Lijn- als Puntsymmetrisch</option>
                   <option value="none">Geen van beide</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Eigenschap</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <div class="flex gap-4 mb-12">
                      <button @click="runTest('line')" :disabled="isCorrect" class="px-6 py-4 font-bold bg-white text-math-blue border-2 border-math-blue rounded-xl shadow-md flex items-center gap-2 hover:bg-math-blue-bg active:scale-95 transition-all">
                          <PhSplitHorizontal weight="bold" class="w-6 h-6" /> Test Lijnsymmetrie
                      </button>
                      <button @click="runTest('point')" :disabled="isCorrect" class="px-6 py-4 font-bold bg-white text-math-blue border-2 border-math-blue rounded-xl shadow-md flex items-center gap-2 hover:bg-math-blue-bg active:scale-95 transition-all">
                          <PhArrowsClockwise weight="bold" class="w-6 h-6" /> Test Puntsymmetrie
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative w-[500px] h-[300px] bg-white shadow-md border-4 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden" :key="currentInternalLevel">

                      <!-- Center Point for Point Symmetry -->
                      <circle v-if="testState === 'point'" cx="250" cy="150" r="4" fill="#6366f1" class="absolute z-30 top-[146px] left-[246px] rounded-full w-2 h-2 bg-math-blue" />

                      <!-- Axis of Symmetry for Line Symmetry -->
                      <div v-if="testState === 'line'" class="absolute w-1 h-full bg-slate-400 border-x border-white border-dashed z-30"></div>

                      <!-- Base Static Shape (Blue) -->
                      <svg width="400" height="200" viewBox="0 0 400 200" class="absolute z-10" v-html="currentLevelData.shapeSVG"></svg>

                      <!-- Animated Clone Shape (Red) -->
                      <svg v-if="testState !== 'none'" width="400" height="200" viewBox="0 0 400 200" class="absolute z-20 pointer-events-none"
                           :class="testState === 'line' ? 'animate-flip' : 'animate-spin180'" v-html="currentLevelData.shapeSVGRed"></svg>

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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Custom animations for symmetry */
.animate-flip {
    animation: flipX 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-origin: center;
}
@keyframes flipX {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(-1); } /* Mirrors horizontally */
}

.animate-spin180 {
    animation: spin180 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-origin: center;
}
@keyframes spin180 {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(180deg); }
}
</style>
