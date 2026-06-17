<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTrapezoid, PhArrowClockwise, PhCopy
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Oppervlakte: Trapezium' },
  instruction: {
    type: String,
    default: 'Een trapezium heeft twee evenwijdige basissen (boven en onder). De formule lijkt heel raar: <strong>(Basis1 + Basis2) × Hoogte / 2</strong>. Waarom gedeeld door 2?<br/><br/><strong>Opdracht:</strong> Kloon het trapezium en ontdek welke bekende vorm je met twéé trapeziums kan maken. Bereken dan de oppervlakte van ÉÉN trapezium.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTrapezoid }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de vorm te klonen en te draaien.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Randomization helpers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(levelIndex) {
  switch (levelIndex) {
    case 0: // Level 1: constrained
      return { baseTop: randomInt(2, 4), baseBot: randomInt(5, 8), height: randomInt(3, 5) }
    case 1: // Level 2: medium
      return { baseTop: randomInt(3, 6), baseBot: randomInt(7, 10), height: randomInt(4, 7) }
    case 2: // Level 3: challenging
      return { baseTop: randomInt(4, 8), baseBot: randomInt(8, 12), height: randomInt(5, 8) }
    default:
      return { baseTop: 4, baseBot: 8, height: 5 }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const targetArea = computed(() => ((currentLevelData.value.baseTop + currentLevelData.value.baseBot) * currentLevelData.value.height) / 2)
const totalArea = computed(() => (currentLevelData.value.baseTop + currentLevelData.value.baseBot) * currentLevelData.value.height)

// Domain Logic
const step = ref(0) // 0: initial, 1: cloned
const userAns = ref(null)

function transformShape() {
    if (isCorrect.value) return;
    step.value = 1
    feedback.value = { type: 'success', text: `Kijk! Twee identieke trapeziums vormen samen een groot PARALLELLOGRAM. Bereken de oppervlakte van dat grote parallellogram (basis ${currentLevelData.value.baseTop + currentLevelData.value.baseBot} × hoogte ${currentLevelData.value.height}) en deel door twee.` }
}

function getHint() {
  const hints = [
    `Kijk naar de tekening. Hoe lang is de totale onderkant na het klonen?`,
    `Het grote parallellogram heeft basis = (Boven + Onder) en hoogte = h. Bereken de totale oppervlakte en deel door 2.`,
    `Berekening: (${currentLevelData.value.baseTop} + ${currentLevelData.value.baseBot}) × ${currentLevelData.value.height} ÷ 2 = ?`
  ]
  if (attemptCount.value <= 1) return hints[0]
  if (attemptCount.value === 2) return hints[1]
  return hints[2]
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de vorm te klonen en te draaien.' };
    step.value = 0;
    userAns.value = null;
    attemptCount.value = 0;
    if (levels.value.length === 0) {
      levels.value = [0, 1, 2].map(i => generateLevel(i))
    }
}

function checkAnswer() {
  isChecked.value = true;

  if (userAns.value === targetArea.value) {
    if (step.value === 1) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Super! Het grote parallellogram heeft basis (${currentLevelData.value.baseTop}+${currentLevelData.value.baseBot})=${currentLevelData.value.baseTop + currentLevelData.value.baseBot} en hoogte ${currentLevelData.value.height}. De totale oppervlakte is ${totalArea.value}. Omdat er 2 trapeziums inzitten, delen we door 2. Antwoord: ${targetArea.value}!`
        }
    } else {
        isCorrect.value = false
        attemptCount.value++
        feedback.value = { type: 'error', text: `${targetArea.value} is correct! Maar klik eerst op de knop om de vorm te klonen en het wiskundig te bewijzen.`}
    }
  } else {
    isCorrect.value = false
    attemptCount.value++

    if (userAns.value === totalArea.value) {
        feedback.value = { type: 'error', text: `${totalArea.value} is de oppervlakte van het GROTE parallellogram (de twee samen). Maar de opdracht vraagt de oppervlakte van ÉÉN blauw trapezium! (Vergeet niet te delen door 2)`}
    } else {
        feedback.value = { type: 'error', text: getHint() }
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
    levels.value = [0, 1, 2].map(i => generateLevel(i))
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-sky-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-sky-500' : 'bg-slate-200'"></div>
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

            <div class="p-4 mt-6 border border-sky-200 bg-sky-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-sky-900 mb-2">Oppervlakte EEN Trapezium:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-xl p-4 border-2 border-sky-300 rounded-lg focus:border-sky-500 focus:ring-sky-500 text-center bg-white" />
                   <span class="font-black text-2xl text-slate-500">cm²</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Oppervlakte</button>
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

                  <div class="mb-12">
                      <button @click="transformShape" :disabled="isCorrect || step === 1"
                              class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                          <PhCopy weight="bold" class="w-6 h-6" /> Kloon en Draai 180°
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-12" :key="'svg'+currentInternalLevel">
                      <svg width="600" height="300" viewBox="0 0 600 300" class="block">

                          <!-- Grid lines -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 19" :key="'v'+i" :x1="i * 30" y1="0" :x2="i * 30" y2="300" />
                              <line v-for="i in 9" :key="'h'+i" x1="0" :y1="i * 30" x2="600" :y2="i * 30" />
                          </g>

                          <g :transform="`translate(0, ${150 - (currentLevelData.height*30)/2})`"> <!-- Center vertically -->

                              <!-- The Main Trapezium (Blue) -->
                              <polygon :points="`150,${currentLevelData.height*30} ${150 + currentLevelData.baseBot*30},${currentLevelData.height*30} ${210 + currentLevelData.baseTop*30},0 210,0`"
                                       fill="rgba(14, 165, 233, 0.7)" stroke="#0284c7" stroke-width="3" stroke-linejoin="round" />

                              <!-- Dimensions Labels Main -->
                              <text :x="150 + (currentLevelData.baseBot*30)/2" :y="currentLevelData.height*30 + 25" font-weight="bold" fill="#0284c7" text-anchor="middle">Basis = {{ currentLevelData.baseBot }}</text>
                              <text :x="210 + (currentLevelData.baseTop*30)/2" y="-10" font-weight="bold" fill="#0284c7" text-anchor="middle">Basis = {{ currentLevelData.baseTop }}</text>

                              <line x1="180" y1="0" x2="180" :y2="currentLevelData.height*30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                              <text x="165" :y="(currentLevelData.height*30)/2" font-weight="bold" fill="#64748b" text-anchor="end">h = {{ currentLevelData.height }}</text>

                              <!-- The Cloned Trapezium (Pink) -->
                              <g class="transition-all duration-1000 ease-in-out"
                                 :style="{
                                     transformOrigin: `${(150 + currentLevelData.baseBot*30 + 210 + currentLevelData.baseTop*30)/2}px ${(currentLevelData.height*30)/2}px`,
                                     opacity: step === 1 ? 1 : 0,
                                     transform: step === 1 ? 'rotate(180deg)' : 'translate(-100px, 0) scale(0.5)'
                                 }">
                                  <polygon :points="`150,${currentLevelData.height*30} ${150 + currentLevelData.baseBot*30},${currentLevelData.height*30} ${210 + currentLevelData.baseTop*30},0 210,0`"
                                           fill="rgba(236, 72, 153, 0.6)" stroke="#db2777" stroke-width="3" stroke-linejoin="round" />
                                  <text :x="150 + (currentLevelData.baseBot*30)/2" :y="currentLevelData.height*30 + 25" font-weight="bold" fill="#db2777" text-anchor="middle" transform="rotate(180 270 220)">Basis = {{ currentLevelData.baseBot }}</text>
                                  <text :x="210 + (currentLevelData.baseTop*30)/2" y="-10" font-weight="bold" fill="#db2777" text-anchor="middle" transform="rotate(180 270 35)">Basis = {{ currentLevelData.baseTop }}</text>
                              </g>

                              <!-- Overall new dimensions (Visible in step 1) -->
                              <g v-if="step === 1" class="animate-fadeIn" style="animation-delay: 1s">
                                  <line x1="150" :y1="currentLevelData.height*30 + 40" :x2="150 + (currentLevelData.baseBot + currentLevelData.baseTop)*30" :y2="currentLevelData.height*30 + 40" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
                                  <line x1="150" :y1="currentLevelData.height*30 + 35" x2="150" :y2="currentLevelData.height*30 + 45" stroke="#1e293b" stroke-width="3" />
                                  <line :x1="150 + (currentLevelData.baseBot + currentLevelData.baseTop)*30" :y1="currentLevelData.height*30 + 35" :x2="150 + (currentLevelData.baseBot + currentLevelData.baseTop)*30" :y2="currentLevelData.height*30 + 45" stroke="#1e293b" stroke-width="3" />
                                  <text :x="150 + ((currentLevelData.baseBot + currentLevelData.baseTop)*30)/2" :y="currentLevelData.height*30 + 65" font-weight="bold" font-size="18" fill="#1e293b" text-anchor="middle">Totaal = {{ currentLevelData.baseBot + currentLevelData.baseTop }} ({{ currentLevelData.baseBot }} + {{ currentLevelData.baseTop }})</text>
                              </g>
                          </g>

                      </svg>
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
</style>
