<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTextAa, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Variabelen' },
  instruction: {
    type: String,
    default: 'Soms gebruiken we in de wiskunde een letter (zoals <strong>z</strong>) in de plaats van een getal. Dit noemen we een <strong>variabele</strong>.<br/><br/><strong>Opdracht:</strong> Beweeg de slider en bereken de omtrek voor de gegeven waarde.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTextAa }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider en bereken de omtrek voor de opgegeven variabele.' })

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
  // Level 1: vierkant (square) — omtrek = 4 × z
  let z1 = randomInt(4, 9)
  l.push({ figure: 'vierkant', formula: '4 × z', label: 'Omtrek vierkant', varName: 'z', calc: (v) => 4 * v, targetVar: z1, targetAns: 4 * z1 })
  // Level 2: rechthoek (rectangle) — omtrek = 2 × (b + h)
  let b2 = randomInt(5, 10)
  let h2 = randomInt(3, 6)
  l.push({ figure: 'rechthoek', formula: '2 × (b + h)', label: 'Omtrek rechthoek', varName: 'b', varName2: 'h', fixedVal: h2, calc: (v) => 2 * (v + h2), targetVar: b2, targetAns: 2 * (b2 + h2) })
  // Level 3: driehoek (triangle) — omtrek = z + z + z
  let z3 = randomInt(8, 14)
  l.push({ figure: 'driehoek', formula: 'z + z + z', label: 'Omtrek gelijkzijdige driehoek', varName: 'z', calc: (v) => 3 * v, targetVar: z3, targetAns: 3 * z3 })
  levels.value = l
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || levels.value[0])

const sliderVal = ref(5)
const userAns = ref(null)

const computedValue = computed(() => currentLevel.value ? currentLevel.value.calc(sliderVal.value) : 0)

function getHintText(count, t) {
  if (count === 1) {
    return `Hint: de formule is ${t.formula}. Vul de waarde van de variabele in.`
  } else if (count === 2) {
    if (t.figure === 'vierkant') {
      return `Hint: een vierkant heeft 4 gelijke zijden. Omtrek = 4 × ${t.targetVar} = ?`
    } else if (t.figure === 'rechthoek') {
      return `Hint: omtrek = 2 × (b + h) = 2 × (${t.targetVar} + ${t.fixedVal}) = ?`
    } else {
      return `Hint: gelijkzijdige driehoek heeft 3 gelijke zijden. Omtrek = 3 × ${t.targetVar} = ?`
    }
  } else {
    if (t.figure === 'vierkant') {
      return `Het antwoord is 4 × ${t.targetVar} = ${4 * t.targetVar}.`
    } else if (t.figure === 'rechthoek') {
      return `Het antwoord is 2 × (${t.targetVar} + ${t.fixedVal}) = 2 × ${t.targetVar + t.fixedVal} = ${2 * (t.targetVar + t.fixedVal)}.`
    } else {
      return `Het antwoord is 3 × ${t.targetVar} = ${3 * t.targetVar}.`
    }
  }
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Beweeg de slider en bereken de omtrek voor de opgegeven waarde.' }
  sliderVal.value = 5
  userAns.value = null
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

function checkAnswer() {
  isChecked.value = true
  const t = currentLevel.value
  if (userAns.value === t.targetAns) {
    isCorrect.value = true
    const formulaDisplay = t.formula.replace('z', t.targetVar).replace('b', t.targetVar).replace('h', t.fixedVal)
    feedback.value = { type: 'success', text: `Perfect! ${t.label}: ${formulaDisplay} = ${t.targetAns}. De formule werkt voor ELKE waarde.` }
  } else {
    attemptCount.value++
    isCorrect.value = false
    if (t.figure === 'vierkant' && userAns.value === t.targetVar * t.targetVar) {
      feedback.value = { type: 'error', text: `Dat is de OPPERVLAKTE! De omtrek is 4 × z (de rand eromheen). ${getHintText(attemptCount.value, t)}` }
    } else {
      feedback.value = { type: 'error', text: `Niet juist. De formule is ${t.formula}. Vervang de letter(s) door de gevraagde getallen. ${getHintText(attemptCount.value, t)}` }
    }
  }
}

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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.figure }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-emerald-900 mb-2">Test het zelf:</label>
              <div class="font-mono text-slate-600 mb-2">
                Als <strong class="text-emerald-700">{{ currentLevel.varName }} = {{ currentLevel.targetVar }}</strong>,
                <span v-if="currentLevel.varName2"> en <strong class="text-emerald-700">{{ currentLevel.varName2 }} = {{ currentLevel.fixedVal }}</strong>,</span>
                wat is de omtrek?
              </div>
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                  class="w-full font-bold text-2xl p-4 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-center" />
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-math-blue hover:bg-math-blue active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="mb-12 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center z-20">
                <div class="flex w-full justify-between items-end mb-2">
                  <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">{{ currentLevel.varName }}</label>
                  <span class="font-black text-xl text-emerald-600">{{ sliderVal }}</span>
                </div>
                <input type="range" min="1" max="12" step="1" v-model.number="sliderVal" :disabled="isCorrect"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <div class="w-full text-right text-xs text-slate-400 mt-1">{{ currentLevel.formula }} = {{ computedValue }}</div>
              </div>
              <div class="relative bg-white shadow-md rounded-xl border-4 border-slate-200 p-8 flex items-center justify-center overflow-hidden" style="width: 500px; height: 500px;">
                <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-100 border-2 border-emerald-300 px-4 py-1 rounded-full font-mono font-black text-xl text-emerald-800 shadow-sm z-10 transition-all">
                  {{ currentLevel.formula }} = <span class="text-emerald-500">{{ computedValue }}</span>
                </div>
                <svg width="400" height="400" viewBox="0 0 400 400" class="block">
                  <!-- Level 1: Square -->
                  <g v-if="currentInternalLevel === 0">
                    <rect :x="200 - (sliderVal * 12)" :y="200 - (sliderVal * 12)"
                      :width="sliderVal * 24" :height="sliderVal * 24"
                      fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="4" stroke-linejoin="round" class="transition-all duration-300" />
                    <text :x="200" :y="200 - (sliderVal * 12) - 15" font-weight="bold" fill="#047857" font-size="16" text-anchor="middle" class="transition-all">z</text>
                    <text :x="200" :y="200 + (sliderVal * 12) + 25" font-weight="bold" fill="#047857" font-size="16" text-anchor="middle" class="transition-all">z</text>
                  </g>
                  <!-- Level 2: Rectangle -->
                  <g v-if="currentInternalLevel === 1">
                    <rect x="40" y="200 - (sliderVal * 8)"
                      :width="sliderVal * 16" :height="sliderVal * 16"
                      fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" class="transition-all duration-300" />
                    <text x="40" y="200 - (sliderVal * 8) - 15" font-weight="bold" fill="#1d4ed8" font-size="16" text-anchor="start" class="transition-all">b = slider</text>
                    <text x="180" y="250" font-weight="bold" fill="#1d4ed8" font-size="16" text-anchor="middle">h = {{ currentLevel.fixedVal }}</text>
                  </g>
                  <!-- Level 3: Triangle -->
                  <g v-if="currentInternalLevel === 2">
                    <polygon points="40,340 360,340 200,340-(sliderVal*10)" fill="rgba(217, 70, 239, 0.15)" stroke="#d946ef" stroke-width="4" stroke-linejoin="round" class="transition-all" />
                    <text x="200" y="365" font-weight="bold" fill="#a21caf" font-size="16" text-anchor="middle" class="transition-all">z = slider</text>
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #10b981; border: 4px solid white; cursor: pointer; margin-top: -13px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; border-radius: 3px; }
</style>
