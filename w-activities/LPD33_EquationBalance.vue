<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Vergelijkingen: De Balansmethode' },
  instruction: { type: String, default: 'Alles wat je links doet, moet je rechts ook doen!<br/><br/><strong>Opdracht:</strong> Isoleer x via de knoppen.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const feedback = ref({ type: 'info', text: 'Kies een actie om toe te passen op BEIDE kanten.' })

const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let xCount, constLeft, constRight, answer

  if (levelIndex === 0) {
    // Simple: ax + b = c where c-b divisible by a
    const pairs = [
      { xCount: 3, constLeft: 2, constRight: 11, answer: 3 },
      { xCount: 2, constLeft: 5, constRight: 13, answer: 4 },
      { xCount: 4, constLeft: 3, constRight: 19, answer: 4 },
      { xCount: 2, constLeft: 7, constRight: 15, answer: 4 },
      { xCount: 5, constLeft: 1, constRight: 11, answer: 2 },
      { xCount: 3, constLeft: 4, constRight: 16, answer: 4 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  } else if (levelIndex === 1) {
    // Medium
    const pairs = [
      { xCount: 6, constLeft: 4, constRight: 22, answer: 3 },
      { xCount: 3, constLeft: 8, constRight: 26, answer: 6 },
      { xCount: 5, constLeft: 7, constRight: 32, answer: 5 },
      { xCount: 4, constLeft: 9, constRight: 29, answer: 5 },
      { xCount: 7, constLeft: 3, constRight: 31, answer: 4 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  } else {
    // Harder
    const pairs = [
      { xCount: 8, constLeft: 6, constRight: 38, answer: 4 },
      { xCount: 5, constLeft: 11, constRight: 46, answer: 7 },
      { xCount: 9, constLeft: 4, constRight: 49, answer: 5 },
      { xCount: 6, constLeft: 10, constRight: 40, answer: 5 },
      { xCount: 7, constLeft: 12, constRight: 54, answer: 6 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  }

  const eq = `${xCount}x+${constLeft}=${constRight}`
  return { eq, xCount, constLeft, constRight, divisor: xCount, answer }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const xCount = ref(3)
const constLeft = ref(2)
const constRight = ref(11)

function getHintText(count) {
  const lvl = currentLevel.value
  if (count >= 5) {
    return { type: 'info', text: `Stap 1: haal ${lvl.constLeft} weg van beide kanten (${lvl.constLeft} - ${lvl.constLeft} = 0, ${lvl.constRight} - ${lvl.constLeft} = ${lvl.constRight - lvl.constLeft}). Stap 2: deel door ${lvl.divisor}.` }
  } else if (count >= 3) {
    return { type: 'info', text: `Probeer eerst "- 1 blokje" tot de losse blokjes weg zijn. Daarna delen door het aantal x-en.` }
  } else if (count >= 1) {
    return { type: 'info', text: 'Wat moet je eerst doen? De losse getallen wegwerken of delen? Herinner: balansmethode = beide kanten hetzelfde.' }
  }
  return { type: 'info', text: 'Kies een actie om toe te passen op BEIDE kanten.' }
}

function performOperation(op) {
  if (isCorrect.value) return
  const lvl = currentLevel.value
  if (op === 'sub') {
    if (constLeft.value >= 1 && constRight.value >= 1) {
      attemptCount.value = 0 // Reset on progress
      constLeft.value -= 1; constRight.value -= 1
      if (xCount.value > 0 && constLeft.value === 0) {
        feedback.value = { type: 'success', text: 'Nu heb je alleen x-en over aan de linkerkant! Deel ze door het aantal x-en.' }
      } else {
        feedback.value = { type: 'success', text: `${constLeft.value > 0 ? 'Nog ' + constLeft.value + ' blokje(s) over...' : 'Geen losse blokjes meer!'}` }
      }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Kan geen blokjes meer weghalen.' }
      if (attemptCount.value >= 2) feedback.value = getHintText(attemptCount.value)
    }
  } else if (op === 'add') {
    attemptCount.value++
    constLeft.value += 1; constRight.value += 1
    feedback.value = { type: 'error', text: 'Je maakt het complexer! We willen x isoleren.' }
    if (attemptCount.value >= 2) feedback.value = getHintText(attemptCount.value)
  } else if (op === 'div') {
    if (constLeft.value === 0) {
      if (xCount.value === lvl.divisor) {
        xCount.value = 1; constRight.value = constRight.value / lvl.divisor
        isCorrect.value = true
        feedback.value = { type: 'success', text: `Perfect! x = ${constRight.value}. Opgelost: ${lvl.eq} \u2192 x = ${constRight.value}.` }
      } else {
        attemptCount.value++
        feedback.value = { type: 'error', text: `Je hebt eerst ${lvl.constLeft} weggehaald, dan moet je delen door ${lvl.divisor}.` }
        if (attemptCount.value >= 2) feedback.value = getHintText(attemptCount.value)
      }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Haal eerst de losse blokjes weg voor je deelt!' }
      if (attemptCount.value >= 2) feedback.value = getHintText(attemptCount.value)
    }
  } else if (op === 'mult') {
    attemptCount.value++
    xCount.value *= 2; constLeft.value *= 2; constRight.value *= 2
    feedback.value = { type: 'error', text: 'Vermenigvuldigen maakt het alleen maar groter!' }
    if (attemptCount.value >= 2) feedback.value = getHintText(attemptCount.value)
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Kies een actie om toe te passen op BEIDE kanten.' }
  xCount.value = currentLevel.value.xCount
  constLeft.value = currentLevel.value.constLeft
  constRight.value = currentLevel.value.constRight
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState() }
  else emit('complete')
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.eq }}</p></div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="props.instruction"></div>
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner">
              <label class="block text-sm font-bold text-orange-900 mb-4">Acties (op beide kanten):</label>
              <div class="flex flex-col gap-3">
                <button @click="performOperation('sub')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600">\u2212 1 blokje</button>
                <button @click="performOperation('add')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600">+ 1 blokje</button>
                <button @click="performOperation('div')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600">\u00f7 {{ currentLevel.divisor }}</button>
                <button @click="performOperation('mult')" :disabled="isCorrect" class="py-2 px-4 rounded border-2 font-bold bg-white border-slate-300 text-slate-600 hover:border-orange-400 hover:text-orange-600">\u00d7 2</button>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">Volgend Level</button>
              <button v-else-if="isCorrect" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500"><span>Afronden</span><PhArrowRight weight="bold" /></button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="font-mono font-black text-4xl text-slate-700 bg-white px-8 py-4 rounded-full shadow border-2 border-slate-200 mb-12 flex gap-4 transition-all">
                <span><span v-if="xCount > 1">{{xCount}}</span>x</span>
                <span v-if="constLeft > 0" class="text-slate-400">+</span><span v-if="constLeft > 0">{{ constLeft }}</span>
                <span class="text-orange-500">=</span><span>{{ constRight }}</span>
              </div>
              <div class="relative w-full max-w-2xl min-h-[300px]">
                <div class="absolute bottom-20 left-0 w-full h-4 bg-slate-700 rounded-full shadow-lg z-10 flex justify-between px-16 transition-transform duration-500">
                  <div class="absolute left-16 bottom-4 w-48 flex-col items-center flex">
                    <div class="flex items-end justify-center gap-2 mb-2 w-full flex-wrap transition-all">
                      <div v-for="i in xCount" :key="'x'+i" class="w-16 h-16 bg-blue-100 border-4 border-blue-500 rounded-xl flex items-center justify-center shadow-sm animate-fadeIn"><span class="font-black text-2xl text-blue-600 font-mono">x</span></div>
                      <div v-for="i in constLeft" :key="'cl'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs animate-fadeIn">1</div>
                    </div>
                    <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                  </div>
                  <div class="absolute right-16 bottom-4 w-48 flex-col items-center flex">
                    <div class="flex items-end justify-center gap-1 mb-2 w-full flex-wrap transition-all">
                      <div v-for="i in constRight" :key="'cr'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-500 text-xs animate-fadeIn">1</div>
                    </div>
                    <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                  </div>
                </div>
                <div class="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[80px] border-b-slate-400 z-0 drop-shadow-md"></div>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>