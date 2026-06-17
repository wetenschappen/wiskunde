<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhHandGrabbing } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Merkwaardige Producten: (a+b)\u00b2' },
  instruction: { type: String, default: '(a+b)\u00b2 is NIET a\u00b2+b\u00b2!<br/><br/><strong>Opdracht:</strong> Splits het vierkant en ontdek de formule.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Splits Vierkant" om de formule te ontdekken.' })

const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, b

  if (levelIndex === 0) {
    const pairs = [[3, 1], [2, 1], [4, 1], [3, 2], [5, 2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else if (levelIndex === 1) {
    const pairs = [[4, 2], [5, 3], [6, 2], [5, 4], [7, 3], [6, 5]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else {
    const pairs = [[6, 4], [7, 5], [8, 3], [9, 5], [8, 6], [10, 4]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  }

  // Compute pixel sizes for visual representation
  const totalPx = 300
  const aPx = Math.round(totalPx * a / (a + b))
  const bPx = totalPx - aPx

  const label = `(${a}+${b})\u00b2`
  return { a, b, label, aPx, bPx }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const isSplit = ref(false)
const userAns = ref('')

function splitSquare() { if (!isCorrect.value) { isSplit.value = true; feedback.value = { type: 'success', text: `Kijk! a\u00b2 (blauw) + b\u00b2 (roze) + 2\u00d7 ab (oranje). Dus (a+b)\u00b2 = a\u00b2 + 2ab + b\u00b2` } } }

function getHintText(count) {
  if (count >= 3) {
    return { type: 'info', text: 'De formule is a\u00b2 + 2ab + b\u00b2. Er zijn TWEE oranje rechthoeken (ab + ab).' }
  } else if (count >= 2) {
    return { type: 'info', text: 'Het vierkant bestaat uit a\u00b2, b\u00b2 en TWEE oranje ab-rechthoeken.' }
  } else {
    return { type: 'info', text: 'Tel alle delen van het vierkant bij elkaar op. Wat zie je?' }
  }
}

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === 'correct') {
    if (isSplit.value) { isCorrect.value = true; feedback.value = { type: 'success', text: `Briljant! (${currentLevel.value.a}+${currentLevel.value.b})\u00b2 = ${currentLevel.value.a}\u00b2 + 2(${currentLevel.value.a}\u00b7${currentLevel.value.b}) + ${currentLevel.value.b}\u00b2 = ${currentLevel.value.a * currentLevel.value.a} + ${2*currentLevel.value.a*currentLevel.value.b} + ${currentLevel.value.b * currentLevel.value.b} = ${(currentLevel.value.a+currentLevel.value.b)**2}.` } }
    else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Splits eerst het vierkant!' }
    }
  } else {
    attemptCount.value++
    if (userAns.value === 'wrong1') feedback.value = { type: 'error', text: 'Je mist 1 ab-rechthoek! Er zijn TWEE oranje rechthoeken (ab + ab = 2ab).' }
    else if (userAns.value === 'wrong2') feedback.value = { type: 'error', text: 'Dat is net de fout die we willen aantonen! De twee oranje ab-rechthoeken ontbreken.' }
    else feedback.value = { type: 'error', text: 'Kies een formule.' }
    if (attemptCount.value >= 2) {
      feedback.value = getHintText(attemptCount.value)
    }
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false; isChecked.value = false; isSplit.value = false
celebrationDone.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op "Splits Vierkant" om de formule te ontdekken.' }
  userAns.value = ''
}

function nextLevel() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState() } else emit('complete') }

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown); if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) }); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) }); nextTick(() => mainArea.value?.focus()) } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false } }, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleFullscreenChange); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) })
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg"><component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p></div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-math-blue mb-2">Conclusie: (a + b)\u00b2 = ...</label>
              <select v-model="userAns" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                <option value="" disabled>Kies de formule...</option>
                <option value="wrong2">a\u00b2 + b\u00b2</option>
                <option value="wrong1">a\u00b2 + ab + b\u00b2</option>
                <option value="correct">a\u00b2 + 2ab + b\u00b2</option>
              </select>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]" :disabled="userAns === ''">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white rounded-lg shadow-md bg-math-blue hover:bg-math-blue"><span>Afronden</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="font-mono font-black text-2xl text-slate-600 mb-4">(a + b)\u00b2 = ({{currentLevel.a}} + {{currentLevel.b}})\u00b2</div>
              <div class="mb-8">
                <button @click="splitSquare" :disabled="isCorrect || isSplit" class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                  <PhHandGrabbing weight="bold" class="w-6 h-6" /> Splits Vierkant
                </button>
              </div>
              <div class="relative bg-white shadow-md rounded-xl border-4 border-slate-300 p-12 flex items-center justify-center">
                <div class="relative" :style="{ width: (currentLevel.aPx + currentLevel.bPx) + 'px', height: (currentLevel.aPx + currentLevel.bPx) + 'px' }">
                  <div class="absolute top-0 left-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ width: currentLevel.aPx + 'px', height: currentLevel.aPx + 'px' }" :class="isSplit ? '-translate-x-4 -translate-y-4' : ''" style="background: rgba(59,130,246,0.15); border: 4px solid #3b82f6;">
                    <span class="font-black text-4xl text-blue-600">a\u00b2</span>
                  </div>
                  <div class="absolute top-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.aPx + 'px' }" :class="isSplit ? 'translate-x-4 -translate-y-4' : ''" style="background: rgba(251,146,60,0.15); border: 4px solid #f97316;">
                    <span class="font-black text-2xl text-math-blue">ab</span>
                  </div>
                  <div class="absolute left-0 flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ top: currentLevel.aPx + 'px', width: currentLevel.aPx + 'px', height: currentLevel.bPx + 'px' }" :class="isSplit ? '-translate-x-4 translate-y-4' : ''" style="background: rgba(251,146,60,0.15); border: 4px solid #f97316;">
                    <span class="font-black text-2xl text-math-blue">ab</span>
                  </div>
                  <div class="absolute flex items-center justify-center shadow-sm transition-all duration-700 ease-in-out" :style="{ top: currentLevel.aPx + 'px', left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.bPx + 'px' }" :class="isSplit ? 'translate-x-4 translate-y-4' : ''" style="background: rgba(236,72,153,0.15); border: 4px solid #ec4899;">
                    <span class="font-black text-2xl text-math-blue">b\u00b2</span>
                  </div>
                  <div class="absolute -top-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'" :style="{ left: (currentLevel.aPx / 2 - 10) + 'px' }">a</div>
                  <div class="absolute -top-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'" :style="{ left: (currentLevel.aPx + currentLevel.bPx / 2) + 'px' }">b</div>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
