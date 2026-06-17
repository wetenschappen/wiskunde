<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScissors, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Handig Rekenen: Distributiviteit' },
  instruction: {
    type: String,
    default: 'Grote vermenigvuldigingen uit je hoofd rekenen is lastig. Maar wat als je de wiskundige eigenschap "distributiviteit" gebruikt om de rechthoek door te snijden in twee makkelijke stukken?<br/><br/><strong>Opdracht:</strong> Sleep de rode snijlijn naar een handige plaats (bijv. bij de tientallen) om de berekening te splitsen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScissors }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de rode snijlijn over het rooster.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []
  for (let lvl = 0; lvl < 3; lvl++) {
    let height, totalWidth, bestCut, exactAns
    if (lvl === 0) {
      height = Math.floor(Math.random() * 3) + 3 // 3-5
      totalWidth = Math.floor(Math.random() * 6) + 10 // 10-15
    } else if (lvl === 1) {
      height = Math.floor(Math.random() * 4) + 5 // 5-8
      totalWidth = Math.floor(Math.random() * 8) + 14 // 14-21
    } else {
      height = Math.floor(Math.random() * 5) + 5 // 5-9
      totalWidth = Math.floor(Math.random() * 10) + 18 // 18-27
    }
    // Best cut is the largest multiple of 10 less than totalWidth
    bestCut = Math.floor(totalWidth / 10) * 10
    if (bestCut === 0 || bestCut >= totalWidth) bestCut = Math.max(5, Math.floor(totalWidth / 5) * 5)
    exactAns = height * totalWidth
    newLevels.push({
      goalText: `Opdracht ${lvl + 1}: ${height} × ${totalWidth} splitsen`,
      height,
      totalWidth,
      bestCut,
      exactAns,
      hint: bestCut >= 10
        ? `Splits ${totalWidth} in een TIENTAL (${bestCut}) en de rest. Waar leg je de lijn het best?`
        : `Splits ${totalWidth} op in ${bestCut} en ${totalWidth - bestCut}.`
    })
  }
  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const cutPosition = ref(0) // 0 to totalWidth
const userAns = ref(null)

const part1 = computed(() => cutPosition.value)
const part2 = computed(() => currentLevelData.value.totalWidth - cutPosition.value)

const calculationString = computed(() => {
    if (cutPosition.value === 0 || cutPosition.value === currentLevelData.value.totalWidth) {
        return `${currentLevelData.value.height} × ${currentLevelData.value.totalWidth}`
    }
    return `${currentLevelData.value.height} × (${part1.value} + ${part2.value}) = (${currentLevelData.value.height} × ${part1.value}) + (${currentLevelData.value.height} × ${part2.value})`
})

const calculationResult = computed(() => {
    if (cutPosition.value === 0 || cutPosition.value === currentLevelData.value.totalWidth) {
        return `?`
    }
    return `${currentLevelData.value.height * part1.value} + ${currentLevelData.value.height * part2.value} = ${currentLevelData.value.height * currentLevelData.value.totalWidth}`
})

// Visual constraints
const svgWidth = 520
const svgHeight = 200
const unitWidth = computed(() => svgWidth / currentLevelData.value.totalWidth)
const unitHeight = computed(() => svgHeight / currentLevelData.value.height)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de rode snijlijn over het rooster.' };
    cutPosition.value = 0;
    userAns.value = null;
    attemptCount.value = 0;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  const data = currentLevelData.value;

  if (userAns.value === data.exactAns) {
    if (cutPosition.value === data.bestCut) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Perfect! Door te snijden bij ${data.bestCut} pas je distributiviteit toe en wordt het makkelijk hoofdrekenen!`
        }
    } else if (cutPosition.value > 0 && cutPosition.value < data.totalWidth) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Juist! ${data.exactAns}. Maar de meest "handige" snijlijn is eigenlijk bij ${data.bestCut}. Probeer het de volgende keer!`
        }
    } else {
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: 'Het antwoord is juist, maar je hebt de snijlijn niet gebruikt om het jezelf makkelijk te maken! Verplaats de slider.'}
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `Sleep de rode lijn naar een handige splitsing, bijvoorbeeld ${data.bestCut}.`}
        } else {
          feedback.value = { type: 'error', text: `Zet de snijlijn op ${data.bestCut} en kijk hoe de berekening wordt opgesplitst.`}
        }
    }
  } else {
    attemptCount.value++
    if (cutPosition.value > 0 && cutPosition.value < data.totalWidth) {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `Rekenfout. Kijk naar je eigen snijlijn. Wat is ${calculationResult.value.split('=')[0]}?`}
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `Tel de twee delen op: ${data.height * part1.value} + ${data.height * part2.value}.`}
        } else {
          feedback.value = { type: 'error', text: `Het juiste antwoord is ${data.exactAns}. (${data.height} × ${part1.value}) + (${data.height} × ${part2.value}) = ${data.height * part1.value} + ${data.height * part2.value} = ${data.exactAns}.`}
        }
    } else {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `Fout antwoord. Gebruik de schaar om de berekening te splitsen!` }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `Sleep de snijlijn naar ${data.bestCut} om te splitsen, reken dan de twee delen op.` }
        } else {
          feedback.value = { type: 'error', text: `Zet de lijn op ${data.bestCut}. ${data.height} × ${data.bestCut} = ${data.height * data.bestCut} en ${data.height} × ${data.totalWidth - data.bestCut} = ${data.height * (data.totalWidth - data.bestCut)}. Tel op: ${data.exactAns}.` }
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
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-math-blue mb-2">Totaal (Oppervlakte):</label>
               <div class="flex flex-col gap-2">
                   <div class="font-mono text-xs md:text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-300 overflow-hidden text-ellipsis whitespace-nowrap" :title="calculationString">
                       {{ calculationString }}
                   </div>
                   <div class="font-mono font-bold text-math-blue bg-math-blue-bg p-2 rounded-lg border border-surface-200">
                       {{ calculationResult }}
                   </div>
                   <div class="flex items-center gap-2 mt-2">
                       <span class="font-bold">Eindantwoord:</span>
                       <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border-2 border-math-blue rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                   </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-3xl flex flex-col items-center relative">

                  <!-- The Slider (Cutting Laser) -->
                  <div class="w-full max-w-[520px] mb-4 z-20">
                      <input type="range" min="0" :max="currentLevelData.totalWidth" step="1" v-model.number="cutPosition" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500 slider-scissors" />
                  </div>

                  <!-- The Grid -->
                  <div class="relative shadow-md rounded-lg overflow-hidden border-4 border-slate-700 bg-white transition-all duration-300">

                      <!-- Labels outside -->
                      <div class="absolute -left-8 top-1/2 -translate-y-1/2 font-black text-xl text-slate-600">{{ currentLevelData.height }}</div>
                      <div v-if="cutPosition === 0 || cutPosition === currentLevelData.totalWidth" class="absolute -top-8 left-1/2 -translate-x-1/2 font-black text-xl text-slate-600">{{ currentLevelData.totalWidth }}</div>
                      <div v-else class="absolute -top-8 w-full flex text-center font-black text-xl text-slate-600">
                          <span :style="{ width: `${(cutPosition / currentLevelData.totalWidth) * 100}%` }">{{ cutPosition }}</span>
                          <span :style="{ width: `${((currentLevelData.totalWidth - cutPosition) / currentLevelData.totalWidth) * 100}%` }">{{ currentLevelData.totalWidth - cutPosition }}</span>
                      </div>

                      <svg :width="svgWidth" :height="svgHeight" class="block">
                          <!-- Base grid lines -->
                          <g stroke="#cbd5e1" stroke-width="1">
                              <line v-for="i in (currentLevelData.totalWidth-1)" :key="'vx'+i" :x1="i * unitWidth" y1="0" :x2="i * unitWidth" :y2="svgHeight" />
                              <line v-for="i in (currentLevelData.height-1)" :key="'hy'+i" x1="0" :y1="i * unitHeight" :x2="svgWidth" :y2="i * unitHeight" />
                          </g>

                          <!-- Background fills for split areas -->
                          <rect v-if="cutPosition > 0" x="0" y="0" :width="cutPosition * unitWidth" :height="svgHeight" fill="rgba(59, 130, 246, 0.2)" class="transition-all duration-300" />
                          <rect v-if="cutPosition < currentLevelData.totalWidth" :x="cutPosition * unitWidth" y="0" :width="(currentLevelData.totalWidth - cutPosition) * unitWidth" :height="svgHeight" fill="rgba(245, 158, 11, 0.2)" class="transition-all duration-300" />

                          <!-- Area Numbers inside -->
                          <text v-if="cutPosition > 0" :x="(cutPosition * unitWidth) / 2" :y="svgHeight / 2 + 8" text-anchor="middle" font-weight="900" font-size="24" fill="#2563eb" class="transition-all duration-300">
                              {{ currentLevelData.height * cutPosition }}
                          </text>
                          <text v-if="cutPosition < currentLevelData.totalWidth" :x="cutPosition * unitWidth + ((currentLevelData.totalWidth - cutPosition) * unitWidth) / 2" :y="svgHeight / 2 + 8" text-anchor="middle" font-weight="900" font-size="24" fill="#d97706" class="transition-all duration-300">
                              {{ currentLevelData.height * (currentLevelData.totalWidth - cutPosition) }}
                          </text>

                          <!-- The Cut Line -->
                          <line v-if="cutPosition > 0 && cutPosition < currentLevelData.totalWidth"
                                :x1="cutPosition * unitWidth" y1="0" :x2="cutPosition * unitWidth" :y2="svgHeight"
                                stroke="#ef4444" stroke-width="4" stroke-dasharray="8 4" class="transition-all duration-300" />
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

/* The Scissors slider */
input[type=range].slider-scissors::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background: #ef4444;
  border: 4px solid white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  margin-top: -14px;
}
input[type=range].slider-scissors::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
