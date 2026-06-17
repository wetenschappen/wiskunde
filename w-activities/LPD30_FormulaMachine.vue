<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEngine, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getalwaarde: De Formule-Machine' },
  instruction: {
    type: String,
    default: 'De <strong>getalwaarde</strong> van een formule bereken je door een getal "in te pluggen" op de plaats van de letter.<br/><br/><strong>Opdracht:</strong> Kies een input x met de slider, bereken de output y voor de formule.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhEngine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies een input x en bereken de output y.' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const attemptCount = ref(0)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel() {
  const l = []
  // Level 1: simple addition
  let m1 = randomInt(2, 4)
  let c1 = randomInt(1, 6)
  l.push({ formula: `y = ${m1}x + ${c1}`, steps: [`× ${m1}`, `+ ${c1}`], calc: (x) => m1 * x + c1, m: m1, c: c1, op: '+' })
  // Level 2: subtraction
  let m2 = randomInt(2, 4)
  let c2 = randomInt(3, 7)
  l.push({ formula: `y = ${m2}x - ${c2}`, steps: [`× ${m2}`, `− ${c2}`], calc: (x) => m2 * x - c2, m: m2, c: c2, op: '−' })
  // Level 3: larger numbers, mixed operations
  let m3 = randomInt(3, 6)
  let c3 = randomInt(2, 8)
  let op3 = Math.random() > 0.5 ? '+' : '−'
  let calc3 = op3 === '+' ? (x) => m3 * x + c3 : (x) => m3 * x - c3
  l.push({ formula: `y = ${m3}x ${op3} ${c3}`, steps: [`× ${m3}`, `${op3 === '+' ? '+ ' : '− '}${c3}`], calc: calc3, m: m3, c: c3, op: op3 })
  levels.value = l
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])

const xValue = ref(4)
const userAns = ref(null)
const step = ref(0)
const currentNumber = ref(4)

function getHintText(count, lvl) {
  if (count === 1) {
    return `Hint: volg de formule stap voor stap. ${lvl.formula.replace('x', lvl.m + '')}.`
  } else if (count === 2) {
    return `Hint: ${lvl.steps[0]} van ${xValue.value} = ${lvl.m * xValue.value}. Daarna ${lvl.steps[1]}.`
  } else {
    const step1 = lvl.m * xValue.value
    const ans = lvl.calc(xValue.value)
    return `Stap 1: ${xValue.value} ${lvl.steps[0]} = ${step1}. Stap 2: ${step1} ${lvl.steps[1]} = ${ans}.`
  }
}

function runMachine() {
  isChecked.value = true
  const lvl = currentLevel.value
  const correctAns = lvl.calc(xValue.value)

  if (userAns.value === correctAns) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Machine start...' }
    currentNumber.value = xValue.value
    const step1 = lvl.m * xValue.value
    setTimeout(() => { step.value = 1; currentNumber.value = step1 }, 800)
    setTimeout(() => {
      step.value = 2
      currentNumber.value = correctAns
      feedback.value = { type: 'success', text: `Perfect! ${lvl.formula.replace('x', xValue.value)} = ${correctAns}.` }
    }, 1600)
  } else {
    attemptCount.value++
    isCorrect.value = false
    const step1 = lvl.m * xValue.value
    if (step.value === 0 && userAns.value === step1) {
      feedback.value = { type: 'error', text: `Goed begin! ${lvl.m} × ${xValue.value} = ${step1}. Maar vergeet de volgende stap niet. ${getHintText(attemptCount.value, lvl)}` }
    } else {
      feedback.value = { type: 'error', text: `Fout. Wat is ${lvl.formula.replace('x', xValue.value)}? Volg de machine stap voor stap. ${getHintText(attemptCount.value, lvl)}` }
    }
  }
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Kies een input x en bereken de output y.' }
  xValue.value = 4
  userAns.value = null
  step.value = 0
  currentNumber.value = 4
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    isCorrect.value = false
    isChecked.value = false
    attemptCount.value = 0
    feedback.value = { type: 'info', text: 'Kies een input x en bereken de output y.' }
    xValue.value = 4
    userAns.value = null
    step.value = 0
    currentNumber.value = 4
  } else {
    emit('complete')
  }
}

watch(xValue, (newVal) => { if (!isChecked.value) currentNumber.value = newVal })

function goToNextStep() {
  if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    generateLevel()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
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
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />
            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner">
              <label class="block text-sm font-bold text-slate-300 mb-2">Input x:</label>
              <div class="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-600 mb-6">
                <input type="range" min="1" max="10" step="1" v-model.number="xValue" :disabled="isChecked"
                  class="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                <span class="font-black text-xl text-orange-400 w-8 text-center">{{ xValue }}</span>
              </div>
              <label class="block text-sm font-bold text-slate-300 mb-2">Jouw Output y:</label>
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isChecked && isCorrect"
                class="w-full font-bold text-2xl p-3 border-2 border-slate-500 bg-slate-900 text-white rounded-lg focus:border-orange-500 text-center" />
            </div>
          </div>
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="runMachine" :disabled="userAns === null" class="flex-1 py-3 font-bold tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 rounded-lg"
                :class="userAns === null ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-orange-500 border-orange-700 text-white hover:bg-orange-400'">Start Machine</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-slate-900 transition-all rounded-lg bg-emerald-400 hover:bg-emerald-300">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 rounded-lg bg-amber-400 hover:bg-amber-300">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
            <div class="w-full max-w-4xl flex items-center justify-center relative min-h-[400px]">
              <div class="font-mono text-slate-500 font-bold absolute top-0 text-xl tracking-widest bg-slate-800 px-4 py-1 rounded-full border border-slate-700">{{ currentLevel.formula }}</div>
              <div class="flex items-center gap-2 mt-12 w-full max-w-3xl">
                <div class="flex flex-col items-center">
                  <div class="w-20 h-8 border-x-4 border-b-4 border-slate-500 rounded-b-xl bg-slate-800 flex justify-center relative z-10"></div>
                  <div class="w-8 h-16 bg-slate-600 flex justify-center -mt-2"></div>
                  <span class="font-bold text-slate-400 mt-2">Input x</span>
                </div>
                <div class="h-4 flex-1 bg-slate-600"></div>
                <div class="bg-blue-900/50 border-4 border-blue-500 p-6 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center min-w-[120px] transition-transform" :class="step === 1 ? 'scale-110 shadow-[0_0_30px_rgba(59,130,246,0.8)]' : ''">
                  <span class="font-black text-4xl text-blue-400">{{ currentLevel.steps[0] }}</span>
                </div>
                <div class="h-4 flex-1 bg-slate-600"></div>
                <div class="bg-fuchsia-900/50 border-4 border-fuchsia-500 p-6 rounded-2xl shadow-[0_0_20px_rgba(217,70,239,0.3)] flex flex-col items-center justify-center min-w-[120px] transition-transform" :class="step === 2 ? 'scale-110 shadow-[0_0_30px_rgba(217,70,239,0.8)]' : ''">
                  <span class="font-black text-4xl text-fuchsia-400">{{ currentLevel.steps[1] }}</span>
                </div>
                <div class="h-4 flex-1 bg-slate-600"></div>
                <div class="flex flex-col items-center">
                  <div class="w-20 h-20 bg-slate-800 border-4 border-slate-500 rounded-xl flex items-center justify-center overflow-hidden">
                    <div class="absolute inset-0 bg-green-500/20" :class="step === 2 ? 'animate-pulse' : 'hidden'"></div>
                  </div>
                  <span class="font-bold text-slate-400 mt-2">Output y</span>
                </div>
              </div>
              <div class="absolute top-[215px] -translate-y-1/2 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black text-xl shadow-lg transition-all duration-1000 ease-in-out z-20"
                :class="{ 'bg-orange-500 text-white left-[8%]': step === 0, 'bg-blue-500 text-white left-[42%]': step === 1, 'bg-emerald-500 text-white left-[88%]': step === 2 }">
                <span :key="currentNumber" class="animate-fadeIn">{{ currentNumber }}</span>
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
.bg-circuit-pattern { background-color: #0f172a; background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f97316; border: 4px solid white; cursor: pointer; margin-top: -10px; box-shadow: 0 4px 6px rgba(0,0,0,0.5); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #475569; border-radius: 4px; }
</style>
