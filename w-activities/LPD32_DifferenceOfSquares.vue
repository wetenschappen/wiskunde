<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGhost, PhArrowClockwise, PhArrowsInLineHorizontal
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Producten: (a+b)(a-b)' },
  instruction: { type: String, default: 'Als we (a+b)(a-b) uitwerken krijgen we 4 termen: a\u00b2 - ab + ba - b\u00b2. Maar -ab en +ab heffen elkaar op!<br/><br/><strong>Opdracht:</strong> Klik op "Botsing" en kies de juiste formule.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGhost }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Botsing" om de tegengestelde termen te vernietigen.' })

const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, b

  if (levelIndex === 0) {
    // Level 1: small numbers
    const pairs = [[2, 1], [3, 1], [3, 2], [4, 1], [4, 3], [5, 2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else if (levelIndex === 1) {
    // Level 2: medium
    const pairs = [[5, 3], [6, 2], [7, 4], [8, 3], [5, 4], [7, 2], [6, 5]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else {
    // Level 3: larger
    const pairs = [[9, 5], [10, 7], [8, 5], [11, 6], [12, 5], [9, 4], [10, 3]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  }

  const formula = `(${a}+${b})(${a}-${b})`
  const result = `${a*a} - ${b*b} = ${a*a - b*b}`
  return { a, b, formula, result, answer: 'a\u00b2 - b\u00b2' }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const isAnnihilated = ref(false)
const userAns = ref('')

const numericResult = computed(() => currentLevel.value.a * currentLevel.value.a - currentLevel.value.b * currentLevel.value.b)

function annihilateTerms() {
  if (isCorrect.value) return
  isAnnihilated.value = true
  feedback.value = { type: 'success', text: `BAM! -${currentLevel.value.a}\u00b7${currentLevel.value.b} en +${currentLevel.value.b}\u00b7${currentLevel.value.a} (${-currentLevel.value.a * currentLevel.value.b} en ${currentLevel.value.b * currentLevel.value.a}) heffen elkaar op! Welke formule blijft over?` }
}

function getHintText(count) {
  if (count >= 3) {
    return { type: 'info', text: 'Er blijven 2 termen over: a\u00b2 en -b\u00b2. Het minteken staat voor de b\u00b2.' }
  } else if (count >= 2) {
    return { type: 'info', text: '-ab + ab = 0. Ze verdwijnen. Wat blijft er over van (a+b)(a-b)?' }
  } else {
    return { type: 'info', text: 'Kijk naar wat overblijft na de botsing. Twee termen.' }
  }
}

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === 'correct') {
    if (isAnnihilated.value) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: `Super! (${currentLevel.value.formula}) = ${currentLevel.value.result}. Altijd a\u00b2 - b\u00b2.` }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Voer eerst de botsing uit!' }
    }
  } else {
    attemptCount.value++
    if (userAns.value === 'wrong1') feedback.value = { type: 'error', text: 'Kijk naar wat overblijft. Het minteken staat voor de b\u00b2.' }
    else if (userAns.value === 'wrong2') feedback.value = { type: 'error', text: '-ab + ab is NUL. Ze verdwijnen compleet.' }
    else feedback.value = { type: 'error', text: 'Kies een formule.' }
    if (attemptCount.value >= 2) {
      feedback.value = getHintText(attemptCount.value)
    }
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false; isChecked.value = false; isAnnihilated.value = false
celebrationDone.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op "Botsing" om de tegengestelde termen te vernietigen.' }
  userAns.value = ''
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++; resetActivityState()
  } else { emit('complete') }
}

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleFullscreenChange); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) })
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
            <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.formula }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />
            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-slate-300 mb-2">Conclusie: (a+b)(a-b) = ...</label>
              <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-500 bg-slate-900 text-white rounded-lg focus:ring-orange-500 focus:border-orange-500 font-bold">
                <option value="" disabled>Kies de juiste formule...</option>
                <option value="wrong1">a\u00b2 + b\u00b2</option>
                <option value="correct">a\u00b2 - b\u00b2</option>
                <option value="wrong2">a\u00b2 - a\u00b2b\u00b2 - b\u00b2</option>
              </select>
              <div v-if="isCorrect" class="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-600">
                <span class="text-sm font-mono">Numeriek: {{ currentLevel.formula }} = {{ numericResult }} = {{ numericResult }}</span>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="userAns === ''" class="flex-1 py-3 font-bold tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 rounded-lg"
                :class="userAns === '' ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-orange-500 border-orange-700 text-white hover:bg-orange-400'">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-slate-900 rounded-lg bg-emerald-400 hover:bg-emerald-300">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 rounded-lg bg-amber-400 hover:bg-amber-300">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="mb-6 text-2xl font-mono font-bold text-slate-300">{{ currentLevel.formula }}</div>
              <div class="mb-8">
                <button @click="annihilateTerms" :disabled="isCorrect || isAnnihilated"
                  class="px-6 py-3 font-bold bg-white text-orange-600 border-2 border-orange-500 rounded-xl shadow-lg flex items-center gap-2 hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600">
                  <PhArrowsInLineHorizontal weight="bold" class="w-6 h-6" /> Botsing: Vernietig Tegengestelden
                </button>
              </div>
              <div class="relative w-full max-w-2xl h-48 bg-slate-800 border-4 border-slate-700 rounded-2xl shadow-xl flex items-center justify-between px-8 overflow-hidden">
                <div class="w-24 h-24 bg-blue-500/20 border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-lg transition-transform" :class="isAnnihilated ? 'translate-x-12' : ''">
                  <span class="font-black text-3xl text-blue-400">{{ currentLevel.a }}\u00b2</span>
                </div>
                <div class="absolute left-[30%] w-24 h-24 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-700 ease-in"
                  :class="isAnnihilated ? 'translate-x-[150px] opacity-0 scale-50 rotate-45' : ''">
                  <span class="font-black text-2xl text-red-400">-{{ currentLevel.a }}{{ currentLevel.b }}</span>
                </div>
                <div class="absolute right-[30%] w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-700 ease-in"
                  :class="isAnnihilated ? '-translate-x-[150px] opacity-0 scale-50 -rotate-45' : ''">
                  <span class="font-black text-2xl text-emerald-400">+{{ currentLevel.b }}{{ currentLevel.a }}</span>
                </div>
                <div v-if="isAnnihilated" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div class="w-32 h-32 bg-orange-500 rounded-full mix-blend-screen filter blur-xl animate-pulse" style="animation: explode 1s ease-out forwards;"></div>
                </div>
                <div class="w-24 h-24 bg-pink-500/20 border-2 border-pink-500 rounded-lg flex items-center justify-center shadow-lg transition-transform" :class="isAnnihilated ? '-translate-x-12' : ''">
                  <span class="font-black text-3xl text-pink-400">-{{ currentLevel.b }}\u00b2</span>
                </div>
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes explode { 0% { transform: scale(0); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
</style>
