<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRectangle, PhArrowClockwise, PhArrowsLeftRight
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Evenredigheden: Omgekeerd Evenredig' },
  instruction: {
    type: String,
    default: 'Bij een <strong>omgekeerd evenredig</strong> verband is het product van twee getallen (x en y) altijd hetzelfde: <strong>x × y = c</strong>. Als de ene stijgt, moet de andere dalen!<br/><br/><strong>Opdracht:</strong> Kneed de rechthoek door de breedte te veranderen. De oppervlakte (het product) moet altijd hetzelfde blijven. Welke formule past hierbij?'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRectangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider (Breedte x) en observeer de curve.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  let area
  if (levelNum === 0) area = r(20, 28)
  else if (levelNum === 1) area = r(30, 42)
  else area = r(44, 56)
  return {
    label: `Opp = ${area}`,
    area,
    sliderMax: Math.max(Math.ceil(area / 2), 12),
    initWidth: Math.max(Math.floor(area / 6), 4),
    instruction: `Bij een <strong>omgekeerd evenredig</strong> verband is het product van twee getallen (x en y) altijd hetzelfde: <strong>x × y = c</strong>. Als de ene stijgt, moet de andere dalen!<br/><br/><strong>Opdracht:</strong> Kneed de rechthoek door de breedte te veranderen. De oppervlakte (het product) moet altijd <strong>${area}</strong> blijven. Welke formule past hierbij?`,
    successFeedback: `Magistraal! x × y = ${area}. Bij een omgekeerd evenredig verband is het product altijd constant. De grafiek is een hyperbool!`
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const displayInstruction = computed(() => currentLevel.value ? currentLevel.value.instruction : props.instruction)

const userAns = ref('')
const widthX = ref(4)

const heightY = computed(() => currentLevel.value ? currentLevel.value.area / widthX.value : 0)

const history = ref([])

watch(widthX, (newVal) => {
    if (currentLevel.value && !history.value.some(pt => pt.x === newVal)) {
        history.value.push({ x: newVal, y: currentLevel.value.area / newVal })
    }
})

const graphConfig = computed(() => {
  if (!currentLevel.value) return { maxX: 12, maxY: 30, xScale: 20, yScale: 8, xTicks: [0,2,4,6,8,10,12], yTicks: [0,5,10,15,20,25,30] }
  const area = currentLevel.value.area
  const sliderMax = currentLevel.value.sliderMax
  const plotW = 260
  const plotH = 260

  const maxX = Math.ceil(sliderMax / 2) * 2 + 2
  const maxY = Math.ceil(Math.max(area, 24) / 5) * 5 + 5
  const xScale = plotW / maxX
  const yScale = plotH / maxY

  const xTickStep = maxX <= 14 ? 2 : 2
  const yTickStep = maxY <= 30 ? 5 : 5
  const xTicks = []
  for (let v = 0; v <= maxX; v += xTickStep) xTicks.push(v)
  const yTicks = []
  for (let v = 0; v <= maxY; v += yTickStep) yTicks.push(v)

  return { maxX, maxY, xScale, yScale, xTicks, yTicks }
})

function getHint() {
  if (attemptCount.value === 1) return 'Wat gebeurt er met het product x × y als y verandert?'
  if (attemptCount.value === 2) return `De oppervlakte is altijd ${currentLevel.value.area}. Dus x × y = ?`
  return `De formule is x · y = ${currentLevel.value.area}. Kies "Omgekeerd evenredig".`
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    isCorrect.value = false
celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    feedback.value = { type: 'info', text: `Oppervlakte = ${currentLevel.value.area}. Beweeg de slider (Breedte x) en observeer de curve.` }
    widthX.value = currentLevel.value.initWidth
    userAns.value = ''
    history.value = [ { x: currentLevel.value.initWidth, y: currentLevel.value.area / currentLevel.value.initWidth } ]
}

function checkAnswer() {
  isChecked.value = true

  if (userAns.value === 'inverse') {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: currentLevel.value.successFeedback }
  } else {
    attemptCount.value++
    if (userAns.value === 'direct') {
        feedback.value = { type: 'error', text: `Fout! y/x = c hoort bij een recht evenredig verband (een rechte lijn door de oorsprong). Onze grafiek is krom en daalt! ${getHint()}`}
    } else {
        feedback.value = { type: 'error', text: `Kies een formule uit de lijst. ${getHint()}`}
    }
  }
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

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">
              Level {{ currentInternalLevel + 1 }} / {{ totalInternalLevels }}
              <span v-if="totalSteps > 1" class="ml-1">| Stap {{ currentStep }} van {{ totalSteps }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            {{ currentLevel.label }}
          </span>
          <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
            <PhX class="w-6 h-6" />
          </button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="displayInstruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-math-blue mb-2">Conclusie Formule:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een formule...</option>
                   <option value="direct">y / x = c (Recht evenredig)</option>
                   <option value="inverse">x · y = c (Omgekeerd evenredig)</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer</button>
              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex items-center justify-center gap-12">

                  <div class="flex flex-col items-center">
                      <div class="mb-4 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                          <div class="flex w-full justify-between items-end mb-2">
                              <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsLeftRight weight="bold" /> Breedte x</label>
                              <span class="font-black text-xl text-math-blue">{{ widthX }}</span>
                          </div>
                          <input type="range" min="1" :max="currentLevel.sliderMax" step="1" v-model.number="widthX" :disabled="isCorrect"
                                 class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                      </div>

                      <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8 flex items-end justify-start min-w-[300px] min-h-[350px]">
                          <div class="absolute bottom-8 left-8 bg-math-blue/20 border-4 border-math-blue transition-all duration-300 ease-out flex items-center justify-center shadow-inner"
                               :style="{ width: `${Math.min(widthX * 20, 250)}px`, height: `${Math.min(heightY * 10, 250)}px` }">
                              <span class="font-black text-math-blue text-lg whitespace-nowrap">Opp = {{ currentLevel.area }}</span>
                          </div>
                          <div class="absolute bottom-2 left-8 font-bold text-math-blue">x = {{ widthX }}</div>
                          <div class="absolute bottom-8 left-0 -translate-x-full font-bold text-math-blue pr-2 pb-2 -rotate-90 origin-bottom-right" :style="{ bottom: `${8 + Math.min((heightY*10)/2, 125)}px` }">y = {{ heightY.toFixed(1) }}</div>
                      </div>
                  </div>

                  <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-6 flex items-center justify-center min-w-[350px]">
                      <h4 class="absolute top-4 left-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Grafiek (Hyperbool) — {{ currentLevel.label }}</h4>
                      <svg width="300" height="300" viewBox="0 0 300 300" class="mt-8">
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="(tick, i) in graphConfig.xTicks" :key="'vg'+i"
                                    :x1="20 + tick * graphConfig.xScale" y1="20"
                                    :x2="20 + tick * graphConfig.xScale" y2="280" />
                              <line v-for="(tick, i) in graphConfig.yTicks" :key="'hg'+i"
                                    x1="20" :y1="280 - tick * graphConfig.yScale"
                                    x2="280" :y2="280 - tick * graphConfig.yScale" />
                          </g>
                          <line x1="20" y1="280" x2="290" y2="280" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="20" y1="280" x2="20" y2="10" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>
                          <text x="280" y="295" font-weight="bold" fill="#64748b" font-size="10">x</text>
                          <text x="10" y="20" font-weight="bold" fill="#64748b" font-size="10">y</text>
                          <circle v-for="pt in history" :key="pt.x"
                                  :cx="20 + pt.x * graphConfig.xScale"
                                  :cy="280 - pt.y * graphConfig.yScale"
                                  r="4" fill="#f43f5e" class="animate-fadeIn" />
                          <circle :cx="20 + widthX * graphConfig.xScale"
                                  :cy="280 - heightY * graphConfig.yScale"
                                  r="6" fill="#be123c" stroke="white" stroke-width="2" class="transition-all duration-300 shadow-sm" />
                      </svg>
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
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #ec4899;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -13px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: background-color 0.3s;
}
input[type=range]:disabled::-webkit-slider-thumb {
  background: #10b981;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
