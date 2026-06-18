<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rationale Getallen: Ongelijkheden' },
  instruction: {
    type: String,
    default: 'Vergelijk de twee getallen.<br/><br/><strong>Opdracht:</strong> Beweeg de slider om de weegschaal te kantelen naar de zwaarste (grootste) kant. Let op hoe het wiskundige symbool (&lt;, &gt;, =) verandert!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider (de wip) onderaan om te wegen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  const pairs = [
    { left: '1/3', right: '1/4', leftVal: 0.333, rightVal: 0.25, correct: 1 },
    { left: '1/2', right: '1/5', leftVal: 0.5, rightVal: 0.2, correct: 1 },
    { left: '2/3', right: '3/4', leftVal: 0.666, rightVal: 0.75, correct: -1 },
    { left: '-0.5', right: '-0.3', leftVal: -0.5, rightVal: -0.3, correct: -1 },
    { left: '-0.5', right: '-0.8', leftVal: -0.5, rightVal: -0.8, correct: 1 },
    { left: '-1.2', right: '-0.9', leftVal: -1.2, rightVal: -0.9, correct: -1 },
    { left: '3/6', right: '1/2', leftVal: 0.5, rightVal: 0.5, correct: 0 },
    { left: '2/4', right: '1/2', leftVal: 0.5, rightVal: 0.5, correct: 0 },
    { left: '4/8', right: '3/6', leftVal: 0.5, rightVal: 0.5, correct: 0 },
    { left: '-0.25', right: '-0.5', leftVal: -0.25, rightVal: -0.5, correct: 1 },
    { left: '0.6', right: '2/3', leftVal: 0.6, rightVal: 0.666, correct: -1 },
    { left: '0.75', right: '3/4', leftVal: 0.75, rightVal: 0.75, correct: 0 }
  ]
  const shuffled = [...pairs].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 3)
  return picked.map((p, i) => ({
    goalText: 'Opdracht ' + (i + 1) + ': Vergelijk de twee getallen.',
    left: p.left,
    right: p.right,
    leftVal: p.leftVal,
    rightVal: p.rightVal,
    hintCheck: (tilt) => {
      if (p.correct === 0) return 'Deze getallen zijn even groot. Kun je beide breuken vereenvoudigen?'
      if (tilt === 0) return 'Deze getallen zijn NIET gelijk. Kantel de weegschaal naar de juiste kant.'
      return 'De weegschaal kantelt de verkeerde kant op. Welk getal is groter?'
    }
  }))
}

const levels = ref(generateLevel())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const tiltValue = ref(0)

const currentSymbol = computed(() => {
    if (tiltValue.value < 0) return '>'
    if (tiltValue.value > 0) return '<'
    return '='
})

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider (de wip) onderaan om te wegen.' };
    tiltValue.value = 0;
    attemptCount.value = 0;
    levels.value = generateLevel();
}

// Auto-correct: watch tiltValue for match
watch(tiltValue, (val) => {
  if (isCorrect.value) return
  const prob = currentLevelData.value
  let correctTilt = 0
  if (prob.leftVal > prob.rightVal) correctTilt = -1
  else if (prob.leftVal < prob.rightVal) correctTilt = 1

  if (val === correctTilt) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Prima!! Je weegt feilloos en gebruikt het correcte symbool.' }
  } else {
    // Only show feedback if they've moved from initial position
    if (val !== 0 || prob.correct !== 0) {
      attemptCount.value++
      if (attemptCount.value === 1) {
        const msg = prob.correct === 0 ? 'Kijk goed: zijn deze twee getallen misschien aan elkaar gelijk?' : 'Het symbool < of > wijst naar het KLEINSTE getal. De weegschaal moet naar het GROOTSTE getal kantelen.'
        feedback.value = { type: 'error', text: msg }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: prob.hintCheck(val) }
      } else {
        if (prob.correct === -1) feedback.value = { type: 'error', text: 'Niet helemaal... Links is groter. Zet de slider op Links Zwaarder (-1).' }
        else if (prob.correct === 0) feedback.value = { type: 'error', text: 'Niet helemaal... Ze zijn gelijk. Zet de slider in het midden (0).' }
        else feedback.value = { type: 'error', text: 'Niet helemaal... Rechts is groter. Zet de slider op Rechts Zwaarder (1).' }
      }
    }
  }
})

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

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center animate-fadeIn">
               <p class="font-bold text-math-blue mb-4">{{ currentLevelData.goalText }}</p>

               <div class="flex items-center justify-center gap-4 mt-4">
                   <div class="text-3xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">{{ currentLevelData.left }}</div>

                   <div class="w-12 h-12 rounded-full bg-math-blue text-white flex items-center justify-center text-2xl font-black shadow-md border-4 border-surface-200 transition-all"
                        :class="tiltValue !== 0 ? 'scale-110' : ''">
                       {{ currentSymbol }}
                   </div>

                   <div class="text-3xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">{{ currentLevelData.right }}</div>
               </div>
               <p class="text-xs text-math-blue mt-4 italic">Het symbool open staat altijd naar het GROOTSTE getal (of de zwaarste kant).</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" disabled class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60">Auto-controle actief</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl min-h-[400px] flex flex-col items-center justify-center">

                  <div class="relative w-full max-w-lg mb-20 transition-transform duration-500 ease-in-out origin-bottom"
                       :style="{ transform: 'rotate(' + (tiltValue * 15) + 'deg)' }">

                      <div class="w-full h-4 bg-slate-700 rounded-full shadow-md relative z-10 flex justify-between px-10">
                          <div class="absolute left-8 bottom-4 flex flex-col items-center transform origin-bottom transition-transform duration-500"
                               :style="{ transform: 'rotate(' + (-tiltValue * 15) + 'deg)' }">
                              <div class="w-24 h-24 bg-sky-200 border-4 border-sky-500 rounded-xl flex items-center justify-center shadow-md mb-2">
                                  <span class="font-black text-2xl text-sky-800">{{ currentLevelData.left }}</span>
                              </div>
                          </div>

                          <div class="absolute right-8 bottom-4 flex flex-col items-center transform origin-bottom transition-transform duration-500"
                               :style="{ transform: 'rotate(' + (-tiltValue * 15) + 'deg)' }">
                              <div class="w-24 h-24 bg-math-blue-light border-4 border-math-blue rounded-xl flex items-center justify-center shadow-md mb-2">
                                  <span class="font-black text-2xl text-math-blue">{{ currentLevelData.right }}</span>
                              </div>
                          </div>
                      </div>

                      <div class="absolute left-1/2 bottom-[-60px] -translate-x-1/2 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-slate-400 z-0 drop-shadow-md"></div>
                  </div>

                  <div class="w-full max-w-sm mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <p class="text-center font-bold text-slate-500 mb-4 uppercase tracking-widest text-xs">Kantel de weegschaal</p>

                      <div class="flex items-center justify-between mb-2 px-1 text-sm font-bold text-slate-400">
                          <span>Links Zwaarder</span>
                          <span>In Evenwicht</span>
                          <span>Rechts Zwaarder</span>
                      </div>

                      <input type="range" min="-1" max="1" step="1" v-model.number="tiltValue" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-2 focus:ring-math-blue" />
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


input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #14b8a6;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-top: -11px;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
