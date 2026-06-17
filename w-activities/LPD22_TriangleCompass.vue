<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCompass, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Constructie: Driehoek met Passer' },
  instruction: {
    type: String,
    default: 'Waarom gebruiken we een passer om driehoeken te tekenen? Omdat een cirkel álle punten bevat die op een vaste afstand liggen!<br/><br/><strong>Opdracht:</strong> Construeer de gevraagde driehoek. De basis (het onderste lijnstuk) is al getekend. Gebruik de passer-knoppen om het exacte derde hoekpunt te vinden.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de eerste passer-knop om te beginnen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      goalText: 'Opdracht A: Zijden van 5 cm, 4 cm en 3 cm.',
      baseLen: 5, rA: 4, rB: 3,
      pA: { x: 175, y: 350 }, pB: { x: 425, y: 350 },
      pC: { x: 335, y: 230 },
      successMsg: 'Perfect! Je hebt een rechthoekige driehoek met zijden 5, 4 en 3 geconstrueerd. Dit is altijd een perfecte 90° driehoek!',
      hint1: 'Start met een cirkel vanuit A met straal ' + 4 + '.',
      hint2: 'Teken dan een cirkel vanuit B met straal ' + 3 + '.',
      hint3: 'Het snijpunt boven de basis is het derde hoekpunt C.'
    },
    {
      goalText: 'Opdracht B: Zijden van 5 cm, 5 cm en 4 cm.',
      baseLen: 5, rA: 5, rB: 4,
      pA: { x: 175, y: 350 }, pB: { x: 425, y: 350 },
      pC: { x: 345, y: 166.7 },
      successMsg: 'Knap! Zijden 5, 5 en 4. Twee zijden zijn even lang (gelijkbenig), dus het snijpunt ligt bijna in het midden.',
      hint1: 'Cirkel A met straal ' + 5 + ', cirkel B met straal ' + 4 + '.',
      hint2: 'Let op: de stralen hebben verschillende lengtes.',
      hint3: 'Het snijpunt is het derde hoekpunt C van deze gelijkbenige driehoek.'
    },
    {
      goalText: 'Opdracht C: Zijden van 6 cm, 5 cm en 5 cm.',
      baseLen: 6, rA: 5, rB: 5,
      pA: { x: 150, y: 350 }, pB: { x: 450, y: 350 },
      pC: { x: 300, y: 150 },
      successMsg: 'Fantastisch! Zijden 6, 5 en 5. Omdat twee zijden even lang zijn, spreken we van een Gelijkbenige driehoek. Het snijpunt ligt perfect in het midden boven de basis.',
      hint1: 'Beide cirkels hebben dezelfde straal (' + 5 + ').',
      hint2: 'Symmetrie! De cirkels zijn even groot, dus het snijpunt ligt in het midden.',
      hint3: 'Verbind A, B en het snijpunt C voor een gelijkbenige driehoek.'
    },
    {
      goalText: 'Opdracht D: Zijden van 6 cm, 4 cm en 4 cm.',
      baseLen: 6, rA: 4, rB: 4,
      pA: { x: 150, y: 350 }, pB: { x: 450, y: 350 },
      pC: { x: 300, y: 217.7 },
      successMsg: 'Uitstekend! Zijden 6, 4 en 4. Een smallere gelijkbenige driehoek - het snijpunt ligt lager dan bij langere gelijke zijden.',
      hint1: 'Beide stralen zijn ' + 4 + '. Teken de cirkels.',
      hint2: 'De cirkels overlappen elkaar gedeeltelijk.',
      hint3: 'Het bovenste snijpunt van de twee cirkels is punt C.'
    },
    {
      goalText: 'Opdracht E: Zijden van 7 cm, 4 cm en 5 cm.',
      baseLen: 7, rA: 4, rB: 5,
      pA: { x: 125, y: 350 }, pB: { x: 475, y: 350 },
      pC: { x: 267.85, y: 210 },
      successMsg: 'Geweldig! Zijden 7, 4 en 5. Omdat alle zijden verschillend zijn, is dit een Ongelijkbenige (willekeurige) driehoek.',
      hint1: 'Cirkel A met straal ' + 4 + ', cirkel B met straal ' + 5 + '.',
      hint2: 'De verschillende stralen geven een asymmetrisch snijpunt.',
      hint3: 'Het snijpunt van beide cirkels is punt C van deze ongelijkbenige driehoek.'
    },
    {
      goalText: 'Opdracht F: Zijden van 7 cm, 6 cm en 5 cm.',
      baseLen: 7, rA: 6, rB: 5,
      pA: { x: 125, y: 350 }, pB: { x: 475, y: 350 },
      pC: { x: 339.3, y: 140 },
      successMsg: 'Super! Zijden 7, 6 en 5. Een mooie ongelijkbenige driehoek met een scherpe punt!',
      hint1: 'Eerst cirkel A met straal ' + 6 + '.',
      hint2: 'Dan cirkel B met straal ' + 5 + '.',
      hint3: 'Verbind A, B en C voor de volledige driehoek.'
    }
  ]

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function getHint() {
  const data = currentLevelData.value
  if (!data) return ''
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

// Domain Logic
const circleADrawn = ref(false)
const circleBDrawn = ref(false)
const pointCPlaced = ref(false)

function drawCircleA() {
    if (isCorrect.value) return;
    circleADrawn.value = true
    feedback.value = { type: 'info', text: `Mooi. Elk punt op deze blauwe cirkel ligt exact ${currentLevelData.value.rA} eenheden van punt A.` }
}

function drawCircleB() {
    if (isCorrect.value) return;
    if (!circleADrawn.value) {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Teken eerst de cirkel vanuit A! ' + getHint() }
        return
    }
    circleBDrawn.value = true
    feedback.value = { type: 'info', text: `Goed. Elk punt op de rode cirkel ligt exact ${currentLevelData.value.rB} eenheden van punt B.` }
}

function placePointC() {
    if (isCorrect.value) return;
    if (!circleADrawn.value || !circleBDrawn.value) {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Je moet eerst beide cirkels tekenen om te weten waar ze elkaar snijden! ' + getHint() }
        return
    }
    pointCPlaced.value = true
    checkAnswer()
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op de eerste passer-knop om te beginnen.' };
    circleADrawn.value = false;
    circleBDrawn.value = false;
    pointCPlaced.value = false;
}

function checkAnswer() {
  isChecked.value = true;

  if (pointCPlaced.value) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-3">Stappenplan:</h4>

               <div class="flex flex-col gap-2">
                   <button @click="drawCircleA" :disabled="isCorrect || circleADrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="circleADrawn ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>1. Passer in A (straal = {{ currentLevelData.rA }})</span>
                       <PhCheckCircle v-if="circleADrawn" weight="fill" class="text-blue-500" />
                   </button>
                   <button @click="drawCircleB" :disabled="isCorrect || circleBDrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="circleBDrawn ? 'bg-red-100 border-red-400 text-red-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>2. Passer in B (straal = {{ currentLevelData.rB }})</span>
                       <PhCheckCircle v-if="circleBDrawn" weight="fill" class="text-red-500" />
                   </button>
                   <button @click="placePointC" :disabled="isCorrect || pointCPlaced" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="pointCPlaced ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700 disabled:opacity-50'">
                       <span>3. Verbind Snijpunt C</span>
                       <PhCheckCircle v-if="pointCPlaced" weight="fill" class="text-emerald-500" />
                   </button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- SVG Visualisation -->
              <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8" :key="currentInternalLevel">
                  <svg width="600" height="500" viewBox="0 0 600 500">

                      <!-- The Circles -->
                      <g>
                          <!-- Circle A -->
                          <circle v-if="circleADrawn" :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.rA * 50" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                          <circle v-if="circleADrawn" :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.rA * 50" fill="rgba(59, 130, 246, 0.05)" class="animate-fadeIn" />

                          <!-- Radius line A -->
                          <line v-if="circleADrawn && !pointCPlaced" :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pC.x" :y2="currentLevelData.pC.y" stroke="#3b82f6" stroke-width="2" class="animate-fadeIn" />
                          <text v-if="circleADrawn && !pointCPlaced" :x="(currentLevelData.pA.x + currentLevelData.pC.x)/2 - 10" :y="(currentLevelData.pA.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#3b82f6" class="animate-fadeIn">{{ currentLevelData.rA }} cm</text>

                          <!-- Circle B -->
                          <circle v-if="circleBDrawn" :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.rB * 50" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                          <circle v-if="circleBDrawn" :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.rB * 50" fill="rgba(239, 68, 68, 0.05)" class="animate-fadeIn" />

                          <!-- Radius line B -->
                          <line v-if="circleBDrawn && !pointCPlaced" :x1="currentLevelData.pB.x" :y1="currentLevelData.pB.y" :x2="currentLevelData.pC.x" :y2="currentLevelData.pC.y" stroke="#ef4444" stroke-width="2" class="animate-fadeIn" />
                          <text v-if="circleBDrawn && !pointCPlaced" :x="(currentLevelData.pB.x + currentLevelData.pC.x)/2 + 10" :y="(currentLevelData.pB.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#ef4444" class="animate-fadeIn">{{ currentLevelData.rB }} cm</text>
                      </g>

                      <!-- The Completed Triangle -->
                      <g v-if="pointCPlaced" class="animate-fadeIn">
                          <polygon :points="`${currentLevelData.pA.x},${currentLevelData.pA.y} ${currentLevelData.pB.x},${currentLevelData.pB.y} ${currentLevelData.pC.x},${currentLevelData.pC.y}`" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" />
                          <circle :cx="currentLevelData.pC.x" :cy="currentLevelData.pC.y" r="5" fill="#1e293b" />
                          <text :x="currentLevelData.pC.x - 5" :y="currentLevelData.pC.y - 15" font-weight="bold" fill="#1e293b">C</text>

                          <text :x="(currentLevelData.pA.x + currentLevelData.pC.x)/2 - 20" :y="(currentLevelData.pA.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#047857">{{ currentLevelData.rA }} cm</text>
                          <text :x="(currentLevelData.pB.x + currentLevelData.pC.x)/2 + 10" :y="(currentLevelData.pB.y + currentLevelData.pC.y)/2 - 10" font-weight="bold" fill="#047857">{{ currentLevelData.rB }} cm</text>
                      </g>

                      <!-- The Base Segment AB (always visible) -->
                      <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pB.x" :y2="currentLevelData.pB.y" stroke="#1e293b" stroke-width="4" />
                      <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" r="5" fill="#1e293b" />
                      <circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" r="5" fill="#1e293b" />

                      <text :x="currentLevelData.pA.x - 20" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#1e293b">A</text>
                      <text :x="currentLevelData.pB.x + 5" :y="currentLevelData.pB.y + 25" font-weight="bold" fill="#1e293b">B</text>
                      <text :x="(currentLevelData.pA.x + currentLevelData.pB.x)/2" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#64748b" text-anchor="middle">{{ currentLevelData.baseLen }} cm</text>

                  </svg>
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
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
