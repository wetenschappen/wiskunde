<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSymmetryHorizontal, PhArrowClockwise, PhArrowsClockwise, PhSplitHorizontal
} from '@phosphor-icons/vue'

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
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de scanner-knoppen om de figuur te testen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Het Parallellogram',
    shapeSVG: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
    shapeSVGRed: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
    correctAns: 'point',
    successMsg: 'Perfect! Een parallellogram past na 180° draaien (puntsymmetrie) exact op zichzelf, maar als je hem spiegelt (lijnsymmetrie) steken de hoeken uit!',
    errLine: 'Heb je de Lijnsymmetrie-test (spiegelen) uitgevoerd? De rode vorm valt NIET perfect over de blauwe vorm.',
    errBoth: 'Puntsymmetrie klopt, maar de lijnsymmetrie-test mislukt. Kijk naar de uitstekende rode hoeken!'
  },
  {
    goalText: 'Opdracht 2: De Vlieger',
    shapeSVG: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
    shapeSVGRed: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
    correctAns: 'line',
    successMsg: 'Heel goed! Je kan een vlieger exact in de helft vouwen (spiegelen), maar als je hem ondersteboven draait (180°) past hij niet meer.',
    errPoint: 'Heb je de Puntsymmetrie-test (draaien) uitgevoerd? De puntige staart steekt nu plots bovenaan uit!',
    errBoth: 'Lijnsymmetrie klopt, maar de puntsymmetrie-test mislukt. Hij mag niet uitsteken.'
  },
  {
    goalText: 'Opdracht 3: De Rechthoek',
    shapeSVG: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(59, 130, 246, 0.5)" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />',
    shapeSVGRed: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
    correctAns: 'both',
    successMsg: 'Fantastisch! Een rechthoek is een zeer regelmatige figuur. Je kan hem vouwen én ondersteboven draaien, hij past altijd!',
    errLine: 'Heb je de Puntsymmetrie-test niet geprobeerd? Draai hem eens om, hij past ook perfect!',
    errPoint: 'Heb je de Lijnsymmetrie-test niet geprobeerd? Spiegel hem eens, hij past ook perfect!'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const testState = ref('none') // 'none', 'line', 'point'
const userAns = ref('')

function runTest(type) {
    if (isCorrect.value) return;
    
    // reset first to re-trigger animation
    testState.value = 'none'
    setTimeout(() => {
        testState.value = type
    }, 50)
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de scanner-knoppen om de figuur te testen.' };
    testState.value = 'none';
    userAns.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  
  const target = currentLevelData.value.correctAns;
  
  if (userAns.value === target) {
    if (testState.value === 'none') {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'Het antwoord is correct, maar gebruik de scanner knoppen eerst om het met je eigen ogen te bewijzen!'}
    } else {
        isCorrect.value = true
        feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 'line') {
        feedback.value = { type: 'error', text: currentLevelData.value.errLine || 'Kijk goed. Past hij na het spiegelen écht perfect?' }
    } else if (userAns.value === 'point') {
        feedback.value = { type: 'error', text: currentLevelData.value.errPoint || 'Kijk goed. Past hij na 180° draaien écht perfect?' }
    } else if (userAns.value === 'both') {
        feedback.value = { type: 'error', text: currentLevelData.value.errBoth || 'Hij slaagt niet voor allebei de testen. Probeer ze nog eens.' }
    } else if (userAns.value === 'none') {
        feedback.value = { type: 'error', text: 'Deze vorm heeft minstens één soort symmetrie. Test ze allebei nog eens goed.' }
    } else {
        feedback.value = { type: 'error', text: 'Kies een antwoord uit de lijst.'}
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-fuchsia-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-fuchsia-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-fuchsia-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-fuchsia-50 p-4 border border-fuchsia-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-fuchsia-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-fuchsia-200 bg-fuchsia-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-fuchsia-900 mb-2">Conclusie over de figuur:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-fuchsia-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een eigenschap...</option>
                   <option value="line">Enkel Lijnsymmetrisch (Spiegelas)</option>
                   <option value="point">Enkel Puntsymmetrisch (180° draai)</option>
                   <option value="both">Zowel Lijn- als Puntsymmetrisch</option>
                   <option value="none">Geen van beide</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Eigenschap</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
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
                      <button @click="runTest('line')" :disabled="isCorrect" class="px-6 py-3 font-bold bg-white text-fuchsia-700 border-2 border-fuchsia-500 rounded-xl shadow-md flex items-center gap-2 hover:bg-fuchsia-50 active:scale-95 transition-all">
                          <PhSplitHorizontal weight="bold" class="w-6 h-6" /> Test Lijnsymmetrie
                      </button>
                      <button @click="runTest('point')" :disabled="isCorrect" class="px-6 py-3 font-bold bg-white text-indigo-700 border-2 border-indigo-500 rounded-xl shadow-md flex items-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all">
                          <PhArrowsClockwise weight="bold" class="w-6 h-6" /> Test Puntsymmetrie
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative w-[500px] h-[300px] bg-white shadow-xl border-4 border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden" :key="currentInternalLevel">
                      
                      <!-- Center Point for Point Symmetry -->
                      <circle v-if="testState === 'point'" cx="250" cy="150" r="4" fill="#6366f1" class="absolute z-30 top-[146px] left-[246px] rounded-full w-2 h-2 bg-indigo-500" />
                      
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
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
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