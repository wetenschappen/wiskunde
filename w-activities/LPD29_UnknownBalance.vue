<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Onbekenden' },
  instruction: {
    type: String,
    default: 'Soms gebruiken we een letter (zoals <strong>x</strong>) als tijdelijke vervanger voor een getal dat we nog moeten ontdekken. <br/><br/><strong>Opdracht:</strong> Pas het aantal blokjes in doos x aan tot de weegschaal in evenwicht is.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: 'Pas het aantal blokjes in doos x aan met + en - tot de weegschaal in evenwicht is.' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const attemptCount = ref(0)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel() {
  const l = [];
  // Level 1: small numbers
  let x1 = randomInt(2, 5);
  let l1 = randomInt(1, 4);
  l.push({ leftLoose: l1, rightLoose: x1 + l1, xValue: x1 });
  // Level 2: medium numbers
  let x2 = randomInt(3, 7);
  let l2 = randomInt(2, 6);
  l.push({ leftLoose: l2, rightLoose: x2 + l2, xValue: x2 });
  // Level 3: larger numbers
  let x3 = randomInt(4, 9);
  let l3 = randomInt(3, 7);
  l.push({ leftLoose: l3, rightLoose: x3 + l3, xValue: x3 });
  levels.value = l;
}

const equation = computed(() => levels.value[currentInternalLevel.value] || { leftLoose: 3, rightLoose: 8, xValue: 5 })

const xValue = ref(1)

const totalLeft = computed(() => xValue.value + equation.value.leftLoose)
const totalRight = computed(() => equation.value.rightLoose)

const tiltValue = computed(() => {
  if (totalLeft.value > totalRight.value) return -1
  if (totalLeft.value < totalRight.value) return 1
  return 0
})

function getHintText(count, eq) {
  if (count <= 4) {
    return `Hint: de weegschaal moet in evenwicht zijn. x + ${eq.leftLoose} = ${eq.rightLoose}.`
  } else if (count <= 8) {
    return `Hint: wat moet x zijn zodat x + ${eq.leftLoose} = ${eq.rightLoose}? Trek ${eq.leftLoose} af van ${eq.rightLoose}.`
  } else {
    return `Het juiste antwoord is x = ${eq.rightLoose - eq.leftLoose}.`
  }
}

function increaseX() {
  if (isCorrect.value || xValue.value >= 15) return
  xValue.value++
  attemptCount.value++
  onValueChange()
}

function decreaseX() {
  if (isCorrect.value || xValue.value <= 0) return
  xValue.value--
  attemptCount.value++
  onValueChange()
}

function onValueChange() {
  const tv = tiltValue.value
  if (tv === 0) {
    isCorrect.value = true
    const eq = equation.value
    feedback.value = {
      type: 'success',
      text: `Magisch! De doos gaat open. Omdat de weegschaal in evenwicht is, is x = ${eq.xValue}. x + ${eq.leftLoose} = ${eq.rightLoose}.`
    }
  } else {
    isCorrect.value = false
    if (attemptCount.value % 3 === 0) {
      const eq = equation.value
      feedback.value = {
        type: 'error',
        text: getHintText(attemptCount.value, eq)
      }
    }
  }
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Pas het aantal blokjes in doos x aan met + en - tot de weegschaal in evenwicht is.' }
  xValue.value = 1
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

function goToNextStep() {
  if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
  else emit('complete')
}

// Lifecycle
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-math-blue mb-2">Vergelijking:</label>
              <div class="font-mono font-black text-2xl text-slate-800 flex items-center justify-center gap-4">
                <span class="bg-white px-4 py-1 rounded-lg shadow-sm border border-slate-200">x + {{ equation.leftLoose }}</span>
                <span class="text-math-blue">=</span>
                <span class="bg-white px-4 py-1 rounded-lg shadow-sm border border-slate-200">{{ equation.rightLoose }}</span>
              </div>
              <div class="mt-6 flex items-center justify-center gap-4">
                <button @click="decreaseX" :disabled="isCorrect || xValue <= 0" class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">-</button>
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase">Doos x</span>
                  <span class="text-3xl font-black text-math-blue w-12">{{ xValue }}</span>
                </div>
                <button @click="increaseX" :disabled="isCorrect || xValue class="active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">= 15" class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30">+</button>
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
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-math-blue hover:bg-math-blue active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-2xl min-h-[500px] flex items-center justify-center relative">
              <div class="relative w-full max-w-lg transition-transform duration-700 ease-in-out origin-bottom" :style="{ transform: `rotate(${tiltValue * 8}deg)` }">
                <div class="w-full h-4 bg-slate-700 rounded-full shadow-md relative z-10 flex justify-between px-8">
                  <!-- Left Pan (x + leftLoose) -->
                  <div class="absolute left-8 bottom-4 w-40 flex flex-col items-center transform origin-bottom transition-transform duration-700" :style="{ transform: `rotate(${-tiltValue * 8}deg)` }">
                    <div class="flex items-end justify-center gap-2 mb-2 w-full px-2">
                      <div class="w-20 h-20 bg-math-blue-light border-4 border-math-blue rounded-xl flex items-center justify-center shadow-md relative overflow-hidden transition-all duration-500"
                        :class="isCorrect ? 'bg-transparent border-dashed border-surface-200' : ''">
                        <div v-if="!isCorrect" class="flex flex-col items-center">
                          <svg class="w-6 h-6 text-math-blue mb-1" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                          <span class="font-black text-2xl text-math-blue font-mono">x</span>
                        </div>
                        <div v-else class="flex flex-wrap gap-1 p-1 justify-center items-center h-full w-full">
                          <div v-for="i in xValue" :key="'xb'+i" class="w-5 h-5 bg-math-blue border border-math-blue rounded-lg shadow-sm animate-fadeIn" :style="`animation-delay: ${i*0.05}s`"></div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-1 justify-end h-full mb-1">
                        <div v-for="i in equation.leftLoose" :key="'ll'+i" class="w-6 h-6 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-[10px]">1</div>
                      </div>
                    </div>
                    <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                  </div>
                  <!-- Right Pan -->
                  <div class="absolute right-8 bottom-4 w-40 flex flex-col items-center transform origin-bottom transition-transform duration-700" :style="{ transform: `rotate(${-tiltValue * 8}deg)` }">
                    <div class="flex items-end justify-center gap-1 mb-2 w-full px-2 flex-wrap">
                      <div v-for="i in equation.rightLoose" :key="'rl'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs">1</div>
                    </div>
                    <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                  </div>
                </div>
                <div class="absolute left-1/2 bottom-[-80px] -translate-x-1/2 w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[80px] border-b-slate-400 z-0 drop-shadow-md"></div>
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

</style>
