<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquareHalf, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten en Wortels: De Vierkantswortel' },
  instruction: {
    type: String,
    default: 'Het woord "vierkantswortel" zegt letterlijk wat het is: de <strong>wortel (de basis, de zijde) van een vierkant</strong>!<br/><br/><strong>Opdracht:</strong> Bereken de vierkantswortel door met de slider een vierkant te maken dat exact het gevraagde aantal tegeltjes (oppervlakte) bevat.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquareHalf }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de slider om de grootte van het vierkant te veranderen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: small perfect squares
  const smallSquares = [16, 25, 36, 49]
  const t1 = smallSquares[Math.floor(Math.random() * smallSquares.length)]
  const r1 = Math.round(Math.sqrt(t1))
  newLevels.push({
    goalText: `Opdracht 1: Wat is √${t1}?`,
    targetArea: t1,
    exactAns: r1,
    hintError: `Je vierkant is perfect (${t1} tegeltjes). Maar wat is de lengte van de ZIJDE? Dat is de vierkantswortel!`
  })

  // Level 2: medium perfect squares
  const mediumSquares = [49, 64, 81, 100]
  const t2 = mediumSquares[Math.floor(Math.random() * mediumSquares.length)]
  const r2 = Math.round(Math.sqrt(t2))
  newLevels.push({
    goalText: `Opdracht 2: Wat is √${t2}?`,
    targetArea: t2,
    exactAns: r2,
    hintError: `Kijk naar het vierkant van ${t2} tegeltjes. Hoeveel tegels passen er op 1 zijde?`
  })

  // Level 3: larger perfect squares
  const largeSquares = [64, 81, 100]
  const t3 = largeSquares[Math.floor(Math.random() * largeSquares.length)]
  const r3 = Math.round(Math.sqrt(t3))
  newLevels.push({
    goalText: `Opdracht 3: Wat is √${t3}?`,
    targetArea: t3,
    exactAns: r3,
    hintError: `Hoe lang is de zijde van een ${t3}-tegeltjes vierkant?`
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const sideLength = ref(1) // 1 to 10
const userAns = ref(null)

const currentArea = computed(() => sideLength.value * sideLength.value)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Gebruik de slider om de grootte van het vierkant te veranderen.' };
    sideLength.value = 1;
    userAns.value = null;
    attemptCount.value = 0;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  const data = currentLevelData.value;

  if (userAns.value === data.exactAns) {
    if (sideLength.value === data.exactAns) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Uitstekend! Een vierkant met oppervlakte ${data.targetArea} heeft zijden van ${data.exactAns}. Daarom is √${data.targetArea} = ${data.exactAns}.`
        }
    } else {
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `${data.exactAns} is correct! Maar zet je visuele vierkant eerst ook op ${data.targetArea} tegeltjes om het te bewijzen.`}
        } else {
          feedback.value = { type: 'error', text: `Schuif de slider naar ${data.exactAns} om het vierkant met ${data.targetArea} tegeltjes te tonen.`}
        }
    }
  } else {
    attemptCount.value++

    if (userAns.value === data.targetArea / 2) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Fout! Een vierkantswortel is NIET gewoon de helft nemen. Kijk naar je vierkant!'}
    } else if (currentArea.value !== data.targetArea) {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `Je vierkant heeft nu ${currentArea.value} tegeltjes. Pas de slider aan tot je er exact ${data.targetArea} hebt.`}
        } else {
          feedback.value = { type: 'error', text: `Zet de slider op de juiste zijde. √${data.targetArea} = ?` }
        }
    } else {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: data.hintError }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `Het vierkant heeft ${data.targetArea} tegeltjes. De zijde is de vierkantswortel van ${data.targetArea}.` }
        } else {
          feedback.value = { type: 'error', text: `√${data.targetArea} = ${data.exactAns}.` }
        }
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
    generateLevel();
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-emerald-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-emerald-900 mb-2">Conclusie:</label>
               <div class="flex items-center justify-center gap-2">
                   <div class="font-black text-4xl text-slate-400">√</div>
                   <div class="font-black text-3xl text-slate-700 mr-2 border-t-4 border-slate-400 pt-1">{{ currentLevelData.targetArea }}</div>
                   <div class="font-black text-3xl text-slate-400">=</div>
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-24 font-bold text-2xl p-2 border-2 border-emerald-400 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-center bg-white" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl flex flex-col items-center">

                  <div class="mb-8 w-full max-w-sm bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                      <div class="flex justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Zijde Vierkant</label>
                          <span class="font-black text-xl text-emerald-600">{{ sideLength }}</span>
                      </div>
                      <input type="range" min="1" max="10" step="1" v-model.number="sideLength" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  <!-- The Grid -->
                  <div class="relative bg-white border-4 border-slate-700 shadow-md rounded-lg overflow-hidden">

                      <!-- Dynamic Labels -->
                      <div class="absolute -left-6 top-1/2 -translate-y-1/2 font-black text-slate-600 transform -rotate-90">{{ sideLength }}</div>
                      <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-slate-600">{{ sideLength }}</div>

                      <svg viewBox="0 0 300 300" class="w-full max-w-sm h-auto block">
                          <!-- Base grid 10x10 outline -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 9" :key="'v'+i" :x1="i * 30" y1="0" :x2="i * 30" y2="300" />
                              <line v-for="i in 9" :key="'h'+i" x1="0" :y1="i * 30" x2="300" :y2="i * 30" />
                          </g>

                          <!-- The actual square -->
                          <rect x="0" y="0" :width="sideLength * 30" :height="sideLength * 30" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="3" class="transition-all duration-300" />

                          <!-- Render tiles inside the square -->
                          <g class="transition-all duration-300">
                              <template v-for="x in sideLength" :key="'tx'+x">
                                  <template v-for="y in sideLength" :key="'ty'+y">
                                      <rect :x="(x-1)*30" :y="(y-1)*30" width="30" height="30" fill="transparent" stroke="#10b981" stroke-width="1" />
</template>
</template>
                          </g>

                          <!-- Display total Area inside -->
                          <text :x="(sideLength * 30) / 2" :y="(sideLength * 30) / 2" text-anchor="middle" dominant-baseline="central" font-weight="900" font-size="28" fill="#047857" class="transition-all duration-300">
                              {{ currentArea }}
                          </text>

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


input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  margin-top: -11px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
