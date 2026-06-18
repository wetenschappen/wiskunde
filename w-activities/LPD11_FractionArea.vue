<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rationale Getallen: Vermenigvuldigen' },
  instruction: {
    type: String,
    default: 'Breuken vermenigvuldigen lijkt op een formule (teller x teller, noemer x noemer), maar visueel is het de oppervlakte van een rechthoek!<br/><br/><strong>Opdracht:</strong> Gebruik de verticale slider om de ene breuk (geel) te selecteren. Gebruik de horizontale slider om de andere (blauw) te selecteren. Kijk naar het groene overlappende deel.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg beide sliders om de breuken te visualiseren.' })
const attemptCount = ref(0)

// Level Logic — generated randomly
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

function generateLevel(levelIndex) {
  let num1, den1, num2, den2, cols, rows

  if (levelIndex === 0) {
    // Simple fractions
    const fractions = [
      [1, 2, 3, 4, 4, 2],   // 1/2 x 3/4
      [2, 3, 1, 2, 2, 3],   // 2/3 x 1/2
      [1, 3, 2, 5, 5, 3],   // 1/3 x 2/5
      [3, 4, 1, 3, 3, 4],   // 3/4 x 1/3
    ]
    const f = pick(fractions)
    num1 = f[0]; den1 = f[1]; num2 = f[2]; den2 = f[3]; cols = f[4]; rows = f[5]
  } else if (levelIndex === 1) {
    // Medium
    const fractions = [
      [2, 3, 4, 5, 5, 3],
      [3, 5, 2, 3, 3, 5],
      [1, 4, 3, 5, 5, 4],
      [2, 5, 3, 4, 4, 5],
    ]
    const f = pick(fractions)
    num1 = f[0]; den1 = f[1]; num2 = f[2]; den2 = f[3]; cols = f[4]; rows = f[5]
  } else {
    // Harder
    const fractions = [
      [1, 4, 2, 3, 3, 4],
      [3, 5, 1, 3, 3, 5],
      [2, 5, 2, 3, 3, 5],
      [3, 4, 2, 5, 5, 4],
    ]
    const f = pick(fractions)
    num1 = f[0]; den1 = f[1]; num2 = f[2]; den2 = f[3]; cols = f[4]; rows = f[5]
  }

  const targetNum = num1 * num2
  const targetDen = den1 * den2
  const g = gcd(targetNum, targetDen)
  const simplifiedNum = targetNum / g
  const simplifiedDen = targetDen / g

  return {
    goalText: `Opdracht ${levelIndex + 1}: Wat is ${num1}/${den1} x ${num2}/${den2}?`,
    num1, den1, num2, den2, cols, rows,
    targetNum, targetDen,
    targetX: num2, targetY: num1
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const selX = ref(0)
const selY = ref(0)

const userNum = ref(null)
const userDen = ref(null)

function getHintText() {
  const d = currentLevelData.value
  if (attemptCount.value === 1) {
    return 'Het hele vierkant stelt 1 geheel voor. Het groene deel is het product van de twee breuken. Hoeveel vakjes zijn groen? Uit hoeveel vakjes bestaat het hele vierkant?'
  }
  if (attemptCount.value === 2) {
    return `Teller: ${d.num1} x ${d.num2} = ?  Noemer: ${d.den1} x ${d.den2} = ?  Het groene gebied in de tekening bevestigt deze berekening.`
  }
  return `Vermenigvuldig de tellers: ${d.num1} x ${d.num2} = ${d.targetNum}. Vermenigvuldig de noemers: ${d.den1} x ${d.den2} = ${d.targetDen}. Het antwoord is ${d.targetNum}/${d.targetDen}.`
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Beweeg beide sliders om de breuken te visualiseren.' }
  attemptCount.value = 0
  selX.value = 0
  selY.value = 0
  userNum.value = null
  userDen.value = null
}

function checkAnswer() {
  isChecked.value = true

  if (userNum.value === null || userDen.value === null || userNum.value === '' || userDen.value === '') {
    feedback.value = { type: 'error', text: 'Niet helemaal... Vul zowel een teller als een noemer in.' }
    return
  }

  const data = currentLevelData.value

  // First check if the visual model is correct
  if (selX.value !== data.targetX || selY.value !== data.targetY) {
    attemptCount.value++
    feedback.value = { type: 'error', text: `De visualisatie klopt nog niet. Zorg dat je horizontaal ${data.num2}/${data.den2} kleurt, en verticaal ${data.num1}/${data.den1}.` }
    return
  }

  // Then check the numerical answer
  if (userNum.value === data.targetNum && userDen.value === data.targetDen) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! Je ziet dat het hele rooster uit ${data.targetDen} stukken bestaat (noemer x noemer). De groene overlap is ${data.targetNum} stukken groot (teller x teller).`
    }
  } else {
    attemptCount.value++

    if (userNum.value !== data.targetNum) {
      feedback.value = { type: 'error', text: 'Niet helemaal... Kijk naar de GROENE (overlappende) vlakjes. Hoeveel zijn het er? Vul dit bovenaan in (de teller).' }
    } else {
      feedback.value = { type: 'error', text: 'Niet helemaal... Uit hoeveel kleine vlakjes bestaat de Grote Vierkant in TOTAAL nu? Vul dit onderaan in (de noemer).' }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// Lifecycle
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

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-math-blue mb-4">Wat is de groene breuk?</label>
               <div class="flex items-center gap-4 justify-center">
                   <div class="font-mono font-black text-2xl text-slate-500">
                       <div class="flex flex-col items-center">
                           <span>{{ currentLevelData.num1 }}</span>
                           <div class="h-1 w-full bg-slate-400 my-1"></div>
                           <span>{{ currentLevelData.den1 }}</span>
                       </div>
                   </div>
                   <span class="font-bold text-lg text-slate-400">&times;</span>
                   <div class="font-mono font-black text-2xl text-slate-500">
                       <div class="flex flex-col items-center">
                           <span>{{ currentLevelData.num2 }}</span>
                           <div class="h-1 w-full bg-slate-400 my-1"></div>
                           <span>{{ currentLevelData.den2 }}</span>
                       </div>
                   </div>
                   <span class="font-bold text-lg text-slate-400">=</span>

                   <div class="flex flex-col items-center gap-1 w-16">
                       <input type="number" v-model.number="userNum" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                       <div class="h-1 w-full bg-slate-700 rounded-full"></div>
                       <input type="number" v-model.number="userDen" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && attemptCount > 0"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-math-blue-bg text-math-blue border border-surface-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ getHintText() }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="relative flex flex-col items-center">

                  <!-- Y Slider (for fraction 1) -->
                  <div class="absolute -left-16 top-0 bottom-0 flex flex-col items-center justify-between pb-8">
                      <span class="font-bold text-blue-600 mb-2">{{ currentLevelData.num1 }}/{{ currentLevelData.den1 }}</span>
                      <input type="range" min="0" :max="currentLevelData.rows" step="1" v-model.number="selY" :disabled="isCorrect"
                             class="h-64 appearance-none cursor-pointer accent-blue-500 slider-vertical"
                             style="width: 8px; writing-mode: vertical-lr; direction: rtl; transform: rotate(180deg);" />
                  </div>

                  <!-- The Grid -->
                  <div class="relative bg-white border-4 border-slate-300 shadow-md" style="width: 400px; height: 300px;">

                      <!-- Grid container dynamic cols/rows -->
                      <div class="absolute inset-0 grid"
                           :style="{ gridTemplateColumns: `repeat(${currentLevelData.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${currentLevelData.rows}, minmax(0, 1fr))` }">
                          <template v-for="y in currentLevelData.rows" :key="'ry'+y">
                              <template v-for="x in currentLevelData.cols" :key="'rx'+x">

                                  <div class="border border-slate-200 transition-colors duration-300"
                                       :class="{
                                           'bg-emerald-400': x <= selX && y <= selY,
                                           'bg-math-blue-light': x <= selX && y > selY,
                                           'bg-blue-300': x > selX && y <= selY,
                                           'bg-transparent': x > selX && y > selY
                                       }">
                                  </div>

</template>
</template>
                      </div>

                  </div>

                  <!-- X Slider (for fraction 2) -->
                  <div class="w-[400px] mt-8 flex flex-col items-center">
                      <input type="range" min="0" :max="currentLevelData.cols" step="1" v-model.number="selX" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                      <span class="font-bold text-math-blue mt-2">{{ currentLevelData.num2 }}/{{ currentLevelData.den2 }}</span>
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


/* Horizontal slider */
input[type=range]:not(.slider-vertical)::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #f59e0b;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-top: -11px;
}
input[type=range]:not(.slider-vertical)::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}

/* Vertical slider */
input[type=range].slider-vertical::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #3b82f6;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-left: -8px;
}
input[type=range].slider-vertical::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
