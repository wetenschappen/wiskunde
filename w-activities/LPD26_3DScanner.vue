<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScan, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Ruimtefiguren: De Aanzichten-Scanner' },
  instruction: {
    type: String,
    default: 'Een 3D-object ziet er compleet anders uit als je het van de zijkant, bovenkant of voorkant bekijkt. Dit heet de projectie of het "aanzicht".<br/><br/><strong>Opdracht:</strong> Welke platte (2D) vorm zie je als je de figuur pal van BOVEN bekijkt, en welke als je hem plat van VOOR bekijkt?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScan }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste vormen uit de lijsten.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const shapeTemplates = [
  {
    goalText: 'Opdracht: Een Cilinder (Blik)',
    objSVG: `
      <!-- Cylinder built with SVG -->
      <rect x="10" y="25" width="80" height="100" fill="rgba(14, 165, 233, 0.6)" stroke="#0ea5e9" stroke-width="2" />
      <!-- Bottom Ellipse -->
      <ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(14, 165, 233, 0.8)" stroke="#0ea5e9" stroke-width="2" />
      <!-- Top Ellipse -->
      <ellipse cx="50" cy="25" rx="40" ry="15" fill="rgba(56, 189, 248, 1)" stroke="#0284c7" stroke-width="3" />
    `,
    topAns: 'circle',
    frontAns: 'rectangle',
    successMsg: 'Magisch, niet? Een ronde cilinder heeft gewoon een platte Rechthoek als vooraanzicht!',
    errTop: 'Kijk in de 3D-weergave naar het deksel van de cilinder. Welke vorm is dat? Dat is je bovenaanzicht.',
    errFront: 'Een vooraanzicht is ALTIJD een platte, 2D-vorm. Diepte verdwijnt! Als je plat van voren naar een blikje kijkt zonder dieptezicht, zie je een rechthoek.'
  },
  {
    goalText: 'Opdracht: Een Kegel (Feestmuts)',
    objSVG: `
      <!-- Cone built with SVG -->
      <polygon points="50,15 10,125 90,125" fill="rgba(245, 158, 11, 0.6)" stroke="#d97706" stroke-width="2" />
      <!-- Bottom Ellipse -->
      <ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(245, 158, 11, 0.8)" stroke="#d97706" stroke-width="2" />
    `,
    topAns: 'circle_dot',
    frontAns: 'triangle',
    successMsg: 'Perfect! Een kegel wordt een platte Driehoek als je er recht opkijkt. Vanboven zie je een Cirkel met een stipje in het midden (de top).',
    errTop: 'Kijk in de 3D-weergave vanboven op de feestmuts. Je ziet de ronde basis met in het midden de scherpe top (stipje).',
    errFront: 'Bekijk de kegel plat van voren, zonder bodem of diepte. Welke veelhoek met rechte lijnen schiet er over?'
  },
  {
    goalText: 'Opdracht: Een Piramide',
    objSVG: `
      <!-- Pyramid built with SVG -->
      <polygon points="50,15 10,120 90,120" fill="rgba(16, 185, 129, 0.4)" stroke="#059669" stroke-width="2" />
      <!-- Visible Edges -->
      <line x1="50" y1="15" x2="60" y2="135" stroke="#059669" stroke-width="2" />
      <!-- Base (Perspective Square) -->
      <polygon points="10,120 60,135 90,120 40,105" fill="rgba(16, 185, 129, 0.6)" stroke="#059669" stroke-width="2" />
      <!-- Edges to base corners -->
      <line x1="50" y1="15" x2="40" y2="105" stroke="#059669" stroke-width="2" stroke-dasharray="2 2" />
    `,
    topAns: 'square_cross',
    frontAns: 'triangle',
    successMsg: 'Geweldig! Ook een piramide wordt een platte driehoek van voren. Vanboven zie je het vierkantige grondvlak met de 4 opstaande ribben die als een kruis naar het midden lopen.',
    errTop: 'Kijk naar het grondvlak. Dat is een vierkant (in perspectief). Naar de top toe lopen er opstaande randen.',
    errFront: 'Bekijk de piramide plat van voren. Diepte en achterste lijnen vallen weg. Wat zie je dan?'
  }
]

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const topViewAns = ref('')
const frontViewAns = ref('')

function getHint() {
  const data = currentLevelData.value
  if (attemptCount.value <= 1) {
    return 'Een aanzicht is ALTIJD een platte, 2D-vorm. Diepte verdwijnt! Probeer je de figuur van boven of van voren voor te stellen op een plat vlak.'
  } else if (attemptCount.value === 2) {
    if (topViewAns.value !== data.topAns) return data.errTop
    return data.errFront
  }
  if (topViewAns.value !== data.topAns) return data.errTop
  return data.errFront
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kies de juiste vormen uit de lijsten.' };
    topViewAns.value = '';
    frontViewAns.value = '';
    attemptCount.value = 0;
    if (levels.value.length === 0) {
      levels.value = shuffleArray(shapeTemplates)
    }
}

function checkAnswer() {
  isChecked.value = true;

  const data = currentLevelData.value;

  if (topViewAns.value === data.topAns && frontViewAns.value === data.frontAns) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    isCorrect.value = false
    attemptCount.value++

    // Trap answers specific checks
    if (topViewAns.value === 'cylinder' || topViewAns.value === 'cone' || topViewAns.value === 'pyramid' ||
        frontViewAns.value === 'cylinder' || frontViewAns.value === 'cone' || frontViewAns.value === 'pyramid') {
        feedback.value = { type: 'error', text: 'Niet helemaal... Een aanzicht is ALTIJD een platte, 2D-vorm. Diepte verdwijnt! Je mag dus nooit een 3D figuur als antwoord geven.'}
        return;
    }

    feedback.value = { type: 'error', text: getHint() }
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
    levels.value = shuffleArray(shapeTemplates)
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
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

               <div>
                   <label class="block text-sm font-bold text-math-blue mb-2">1. Bovenaanzicht:</label>
                   <select v-model="topViewAns" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                       <option value="" disabled>Kies een 2D vorm...</option>
                       <option value="rectangle">Rechthoek</option>
                       <option value="triangle">Driehoek</option>
                       <option value="circle">Cirkel</option>
                       <option value="circle_dot">Cirkel met stip in het midden</option>
                       <option value="square_cross">Vierkant met kruis erin</option>
                       <option value="square">Vierkant</option>
                       <option value="pyramid">Piramide (strikvraag!)</option>
                   </select>
               </div>

               <div>
                   <label class="block text-sm font-bold text-math-blue mb-2">2. Vooraanzicht:</label>
                   <select v-model="frontViewAns" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                       <option value="" disabled>Kies een 2D vorm...</option>
                       <option value="rectangle">Rechthoek</option>
                       <option value="triangle">Driehoek</option>
                       <option value="circle">Cirkel</option>
                       <option value="square">Vierkant</option>
                       <option value="cylinder">Cilinder (strikvraag!)</option>
                       <option value="cone">Kegel (strikvraag!)</option>
                   </select>
               </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (topViewAns === '' || frontViewAns === '')" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer Aanzichten</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex justify-center gap-12 items-center">

                  <!-- The 3D Object -->
                  <div class="flex flex-col items-center">
                      <h4 class="font-bold text-slate-500 uppercase tracking-widest text-sm mb-4">3D Object</h4>
                      <div class="relative w-48 h-64 bg-slate-100 rounded-xl shadow-inner border-2 border-slate-300 flex items-center justify-center overflow-hidden" :key="'obj'+currentInternalLevel">

                          <svg width="100" height="150" viewBox="0 0 100 150" v-html="currentLevelData.objSVG"></svg>

                          <!-- Scanner Line Effect -->
                          <div class="absolute inset-x-0 h-1 bg-green-400 shadow-[0_0_10px_#4ade80] animate-scan opacity-60"></div>
                      </div>
                  </div>

                  <PhArrowRight weight="bold" class="w-8 h-8 text-slate-300" />

                  <!-- Projections Output based on user choice -->
                  <div class="flex flex-col gap-6">

                      <!-- Top View Projection -->
                      <div class="flex items-center gap-4">
                          <span class="font-bold text-slate-400 w-24 text-right">Boven:</span>
                          <div class="w-24 h-24 bg-white rounded-xl shadow-sm border-2 border-slate-300 flex items-center justify-center relative overflow-hidden transition-all"
                               :class="topViewAns === currentLevelData.topAns && isCorrect ? 'border-emerald-500 bg-emerald-50' : ''">

                              <span v-if="!topViewAns" class="text-slate-300 text-3xl font-black">?</span>

                              <div v-if="topViewAns === 'circle'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn"></div>

                              <div v-if="topViewAns === 'circle_dot'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn flex items-center justify-center">
                                  <div class="w-2 h-2 bg-white rounded-full"></div>
                              </div>

                              <div v-if="topViewAns === 'rectangle'" class="w-12 h-16 bg-slate-800 animate-fadeIn"></div>
                              <div v-if="topViewAns === 'square'" class="w-16 h-16 bg-slate-800 animate-fadeIn"></div>

                              <div v-if="topViewAns === 'square_cross'" class="w-16 h-16 bg-slate-800 animate-fadeIn relative">
                                  <svg width="100%" height="100%" class="absolute inset-0">
                                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" stroke-width="2" />
                                      <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" stroke-width="2" />
                                  </svg>
                              </div>

                              <div v-if="topViewAns === 'triangle'" class="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-800 animate-fadeIn drop-shadow-sm"></div>

                          </div>
                      </div>

                      <!-- Front View Projection -->
                      <div class="flex items-center gap-4">
                          <span class="font-bold text-slate-400 w-24 text-right">Voor:</span>
                          <div class="w-24 h-24 bg-white rounded-xl shadow-sm border-2 border-slate-300 flex items-center justify-center relative overflow-hidden transition-all"
                               :class="frontViewAns === currentLevelData.frontAns && isCorrect ? 'border-emerald-500 bg-emerald-50' : ''">

                              <span v-if="!frontViewAns" class="text-slate-300 text-3xl font-black">?</span>

                              <div v-if="frontViewAns === 'circle'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn"></div>
                              <div v-if="frontViewAns === 'rectangle'" class="w-16 h-20 bg-slate-800 animate-fadeIn"></div>
                              <div v-if="frontViewAns === 'square'" class="w-16 h-16 bg-slate-800 animate-fadeIn"></div>
                              <div v-if="frontViewAns === 'triangle'" class="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-800 animate-fadeIn drop-shadow-sm"></div>

                              <!-- 3D Traps -->
                              <svg v-if="frontViewAns === 'cylinder'" width="50" height="75" viewBox="0 0 100 150" class="animate-fadeIn">
                                  <rect x="10" y="25" width="80" height="100" fill="rgba(148, 163, 184, 0.6)" stroke="#64748b" stroke-width="2" />
                                  <ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(148, 163, 184, 0.8)" stroke="#64748b" stroke-width="2" />
                                  <ellipse cx="50" cy="25" rx="40" ry="15" fill="rgba(148, 163, 184, 1)" stroke="#475569" stroke-width="3" />
                              </svg>

                              <svg v-if="frontViewAns === 'cone'" width="50" height="75" viewBox="0 0 100 150" class="animate-fadeIn">
                                  <polygon points="50,15 10,125 90,125" fill="rgba(148, 163, 184, 0.6)" stroke="#64748b" stroke-width="2" />
                                  <ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(148, 163, 184, 0.8)" stroke="#64748b" stroke-width="2" />
                              </svg>

                          </div>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }


.animate-scan { animation: scan 3s linear infinite alternate; }
@keyframes scan {
    0% { top: 10%; }
    100% { top: 90%; }
}
</style>
