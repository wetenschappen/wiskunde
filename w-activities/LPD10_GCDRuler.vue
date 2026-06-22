<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'GGD: De Perfecte Tegel' },
  instruction: {
    type: String,
    default: 'De <strong>Grootste Gemeenschappelijke Deler (GGD)</strong> vertelt je wat de grootste tegel is waarmee je een muur perfect kan betegelen zonder rest.<br/><br/><strong>Opdracht:</strong> Voorspel eerst de GGD, controleer dan met de slider.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Bekijk de muur. Wat is de GGD?' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionPassed = ref(false)
const showWorkedExample = ref(true)
const hintCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

function generateLevel(levelIndex) {
  let divisor, m, n, wallW, wallH

  if (levelIndex === 0) {
    divisor = pick([2, 3, 4, 5, 6])
    m = randomInt(2, 4)
    n = randomInt(2, 4)
  } else if (levelIndex === 1) {
    divisor = pick([4, 5, 6, 7, 8])
    m = randomInt(2, 5)
    n = randomInt(2, 5)
  } else {
    divisor = 1
    let attempts = 0
    do {
      wallW = randomInt(4, 9)
      wallH = randomInt(5, 10)
      attempts++
    } while (gcd(wallW, wallH) !== 1 && attempts < 20)
    return {
      goalText: `Opdracht 3: Een muur van ${wallW} bij ${wallH}`,
      wallW, wallH, targetAns: 1, maxTile: Math.min(wallW, wallH),
      levelType: 'relprime'
    }
  }

  wallW = divisor * m
  wallH = divisor * n

  return {
    goalText: `Opdracht ${levelIndex + 1}: Een muur van ${wallW} bij ${wallH}`,
    wallW, wallH, targetAns: gcd(wallW, wallH),
    maxTile: Math.min(wallW, wallH),
    levelType: levelIndex === 0 ? 'divisible' : 'oneIsGCD'
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const tileSize = ref(1)
const showSlider = ref(false)

const showPrediction = ref(true)
const predictedGCD = ref(null)

const tilesX = computed(() => Math.floor(currentLevelData.value.wallW / tileSize.value))
const tilesY = computed(() => Math.floor(currentLevelData.value.wallH / tileSize.value))

const remX = computed(() => currentLevelData.value.wallW % tileSize.value)
const remY = computed(() => currentLevelData.value.wallH % tileSize.value)

const hasRemainder = computed(() => remX.value > 0 || remY.value > 0)

const maxSvgWidth = 500
const maxSvgHeight = 350
const scale = computed(() => Math.min(maxSvgWidth / currentLevelData.value.wallW, maxSvgHeight / currentLevelData.value.wallH))

const svgWidth = computed(() => currentLevelData.value.wallW * scale.value)
const svgHeight = computed(() => currentLevelData.value.wallH * scale.value)

function getHintText() {
  const d = currentLevelData.value
  if (!d) return ''

  if (hintCount.value === 1) {
    if (d.levelType === 'relprime') {
      return `Schrijf de delers van ${d.wallW} op. Schrijf de delers van ${d.wallH} op. Welke getallen komen in beide rijen voor?`
    }
    return `Schrijf alle delers van beide getallen op. De GGD is de grootste deler die in BEIDE rijen voorkomt.`
  }

  if (hintCount.value === 2) {
    if (d.levelType === 'divisible') {
      return `Voorbeeld: GGD(15, 25). Delers van 15: 1,3,5,15. Delers van 25: 1,5,25. Gemeenschappelijk: 1,5. Grootste: 5. Pas dit toe op ${d.wallW} en ${d.wallH}.`
    } else if (d.levelType === 'oneIsGCD') {
      return `Voorbeeld: GGD(8, 32). Delers van 8: 1,2,4,8. Delers van 32: 1,2,4,8,16,32. Grootste gemeenschappelijk: 8. Het kleinste getal IS de GGD. Pas toe op ${d.wallW} en ${d.wallH}.`
    } else {
      return `Voorbeeld: GGD(7, 11). Delers van 7: 1,7. Delers van 11: 1,11. Enige gemeenschappelijke deler: 1. GGD = 1. De getallen zijn 'relatief priem'. Pas toe op ${d.wallW} en ${d.wallH}.`
    }
  }

  if (hintCount.value >= 3) {
    if (d.levelType === 'relprime') {
      return `Delers van ${d.wallW}: 1, __. Delers van ${d.wallH}: 1, __. Enige gemeenschappelijke deler: __`
    }
    return `Delers van ${d.wallW}: schrijf ze op. Delers van ${d.wallH}: schrijf ze op. Grootste getal in beide rijen: __`
  }
  return ''
}

function submitPrediction() {
  const d = currentLevelData.value
  if (predictedGCD.value === null || predictedGCD.value === '' || predictedGCD.value === undefined) {
    feedback.value = { type: 'error', text: 'Vul een getal in voor je voorspelling.' }
    return
  }

  if (predictedGCD.value === d.targetAns) {
    feedback.value = {
      type: 'success',
      text: `Sterke voorspelling! GGD(${d.wallW}, ${d.wallH}) = ${d.targetAns}. Controleer nu met de slider.`
    }
    showPrediction.value = false
    showSlider.value = true
    tileSize.value = 1
    hintCount.value = 0
  } else {
    attemptCount.value++

    if (predictedGCD.value > d.targetAns) {
      if (d.targetAns === 1) {
        feedback.value = {
          type: 'error',
          text: `${predictedGCD.value} is te groot. ${d.wallW} en ${d.wallH} hebben geen gemeenschappelijke deler groter dan 1 — ze zijn 'relatief priem'. De GGD is dan altijd 1.`
        }
      } else {
        feedback.value = {
          type: 'error',
          text: `${predictedGCD.value} is te groot. Dit getal deelt niet beide getallen. De GGD moet beide getallen delen zonder rest.`
        }
      }
    } else if (predictedGCD.value > 0 && d.targetAns % predictedGCD.value === 0) {
      feedback.value = {
        type: 'error',
        text: `Goed opgemerkt: ${predictedGCD.value} is wel een deler van beide, maar het is niet de GROOTSTE. Er is een grotere gemeenschappelijke deler.`
      }
    } else if (predictedGCD.value === 0) {
      feedback.value = {
        type: 'error',
        text: 'GGD is nooit 0 (behalve voor 0 zelf). Elke deler is minstens 1. Wat is een getal dat beide deelt zonder rest?'
      }
    } else {
      feedback.value = {
        type: 'error',
        text: `Let op: ${predictedGCD.value} deelt niet beide getallen. GGD is de GROOTSTE GEMEENSCHAPPELIJKE deler. Soms denken leerlingen aan KGV (kleinste gemeenschappelijk veelvoud) — GGD en KGV worden vaak verward! GGD = grootste deler die beide deelt.`
      }
    }
  }
}

function showHint() {
  hintCount.value++
  feedback.value = { type: 'info', text: getHintText() }
}

function skipWorkedExample() {
  showWorkedExample.value = false
}

function onTileSizeChange(val) {
  if (isCorrect.value) return
  tileSize.value = val

  if (val === currentLevelData.value.targetAns && val > 0) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    reflectionPassed.value = false
    feedback.value = {
      type: 'success',
      text: `Perfect! De ${val}x${val} tegel past zonder rest. GGD(${currentLevelData.value.wallW}, ${currentLevelData.value.wallH}) = ${val}.`
    }
  }
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
  feedback.value = { type: 'info', text: 'Bekijk de muur. Wat is de GGD?' }
  attemptCount.value = 0
  hintCount.value = 0
  tileSize.value = 1
  showSlider.value = false
  showPrediction.value = true
  predictedGCD.value = null
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionPassed.value = false
  showWorkedExample.value = currentInternalLevel.value === 0
}

function checkReflection() {
  const d = currentLevelData.value
  const ans = reflectionAnswer.value.toLowerCase().trim()

  if (d.targetAns === 1) {
    if ((ans.includes('1') || ans.includes('geen') || ans.includes('relatief') || ans.includes('priem') || ans.includes('enige')) && ans.length > 3) {
      reflectionPassed.value = true
      showReflection.value = false
      feedback.value = { type: 'success', text: 'Juist! Relatief prieme getallen hebben geen gemeenschappelijke deler groter dan 1.' }
    } else {
      feedback.value = {
        type: 'info',
        text: `Waarom is de enige gemeenschappelijke deler van ${d.wallW} en ${d.wallH} gelijk aan 1? Wat zegt dit over de getallen?`
      }
    }
  } else {
    if ((ans.includes(String(d.targetAns)) || ans.includes('deler') || ans.includes('gemeenschappelijk') || ans.includes('grootst')) && ans.length > 5) {
      reflectionPassed.value = true
      showReflection.value = false
    } else {
      feedback.value = {
        type: 'info',
        text: `Denk na: ${d.targetAns} deelt beide getallen zonder rest. Is er een groter getal dat beide deelt?`
      }
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

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div
    class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
    @click="emit('close')" role="button" tabindex="0"
    @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')"
    aria-label="Achtergrond"
  ></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">
              Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}
            </p>
            <div class="flex gap-1">
              <div
                v-for="i in totalInternalLevels" :key="i"
                class="w-2 h-2 rounded-full"
                :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <button
        @click="emit('close')"
        class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld:</p>
            <p class="text-sm text-slate-700 mb-2">Wat is GGD(12, 18)?</p>
            <div class="text-xs text-slate-600 space-y-1 mb-2">
              <p><strong>Stap 1:</strong> Schrijf alle delers van 12: 1, 2, 3, 4, 6, 12</p>
              <p><strong>Stap 2:</strong> Schrijf alle delers van 18: 1, 2, 3, 6, 9, 18</p>
              <p><strong>Stap 3:</strong> Welke delers zijn gemeenschappelijk? 1, 2, 3, 6</p>
              <p><strong>Stap 4:</strong> De grootste gemeenschappelijke deler = 6.</p>
            </div>
            <p class="font-mono text-base font-bold text-slate-800">GGD(12, 18) = 6</p>
            <button
              @click="skipWorkedExample"
              class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline"
            >
              Begrepen, start de opdracht &rarr;
            </button>
          </div>

          <!-- Goal -->
          <div
            v-if="!showWorkedExample"
            class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn"
          >
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <!-- Prediction Gate -->
          <div
            v-if="showPrediction && !showWorkedExample"
            class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4"
          >
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel de GGD</p>
            <p class="text-sm text-slate-600 mb-3">
              Wat is de grootste tegel die perfect past in deze muur?
            </p>
            <div class="flex items-center gap-2 justify-center">
              <span class="font-mono font-bold text-slate-700">
                GGD({{ currentLevelData.wallW }}, {{ currentLevelData.wallH }}) =
              </span>
              <input
                type="number" v-model.number="predictedGCD"
                @keyup.enter="submitPrediction"
                class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500"
                placeholder="?"
              />
              <button
                @click="submitPrediction"
                class="py-2 px-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]"
              >
                Voorspel
              </button>
            </div>
            <p
              v-if="predictedGCD === currentLevelData.targetAns && predictedGCD"
              class="text-xs text-amber-700 mt-2 font-medium"
            >
              Nu bevestigen met de slider &rarr;
            </p>
          </div>

          <!-- Slider (after prediction) -->
          <div
            v-if="showSlider && !isCorrect"
            class="mb-4 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200"
          >
            <div class="flex justify-between items-end mb-3">
              <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Grootte Tegel</label>
              <span class="font-black text-2xl text-slate-800">{{ tileSize }} &times; {{ tileSize }}</span>
            </div>
            <input
              type="range" min="1" :max="currentLevelData.maxTile" step="1"
              :value="tileSize"
              @input="onTileSizeChange(Number($event.target.value))"
              class="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div class="flex justify-between mt-2 text-xs font-mono text-slate-400">
              <span>1</span><span>{{ currentLevelData.maxTile }}</span>
            </div>
            <p class="text-xs text-slate-400 mt-2 text-center">
              Sleep de slider. Bij de juiste tegel verdwijnt de rode rand.
            </p>
          </div>

          <!-- Why explanation -->
          <div
            v-if="isCorrect && !showReflection"
            class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn"
          >
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom is GGD belangrijk?</p>
            <p class="text-xs text-amber-700 leading-relaxed">
              GGD staat voor Grootste Gemeenschappelijke Deler &mdash; het grootste getal dat beide
              getallen deelt zonder rest. In de muurvoorstelling zie je dit letterlijk: de grootste
              vierkante tegel die perfect past zonder dat je stukjes moet afsnijden. Bij breuken
              gebruik je de GGD om te vereenvoudigen: als teller en noemer delen door de GGD,
              krijg je de meest eenvoudige vorm.
            </p>
          </div>

          <!-- Reflection -->
          <div
            v-if="showReflection"
            class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn"
          >
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2" v-if="currentLevelData.targetAns === 1">
              Waarom is GGD({{ currentLevelData.wallW }}, {{ currentLevelData.wallH }}) = 1?
              Wat betekent dit over de twee getallen?
            </p>
            <p class="text-xs text-amber-700 mb-2" v-else>
              Waarom is GGD({{ currentLevelData.wallW }}, {{ currentLevelData.wallH }}) =
              {{ currentLevelData.targetAns }}? Leg uit hoe je dit vond.
            </p>
            <textarea
              v-model="reflectionAnswer"
              class="w-full p-2 text-sm border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500 h-16 resize-none"
              placeholder="Typ je uitleg..."
            ></textarea>
            <button
              @click="checkReflection"
              class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98]"
            >
              Bevestig
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div
            v-if="feedback.text"
            class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4"
            role="status" aria-live="polite" aria-atomic="true"
            :class="{
              'bg-amber-50 text-amber-800 border-amber-400': feedback.type === 'success',
              'bg-red-100 text-red-800 border-red-400': feedback.type === 'error',
              'bg-slate-100 text-slate-700 border-slate-400': feedback.type === 'info'
            }"
          >
            <component
              :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)"
              class="w-5 h-5 shrink-0 mt-0.5" weight="fill"
            />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="resetActivityState"
              class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"
            >
              <PhArrowClockwise />
            </button>
            <button
              v-if="showPrediction && !showWorkedExample && attemptCount > 0"
              @click="showHint"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
            >
              <PhLightbulb weight="fill" class="w-4 h-4" />
              Hint {{ hintCount >= 3 ? '3/3' : hintCount + 1 + '/3' }}
            </button>
            <button
              v-if="isCorrect && !showReflection"
              @click="handleNext"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="flex flex-col items-center w-full max-w-3xl">
            <div
              class="relative bg-white p-6 rounded-xl shadow-md border-4 border-slate-300 transition-all duration-300"
              :class="isCorrect ? 'border-amber-400 bg-amber-50' : ''"
            >
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-500 text-lg">
                Breedte: {{ currentLevelData.wallW }}
              </div>
              <div class="absolute top-1/2 -left-8 -translate-y-1/2 font-mono font-bold text-slate-500 text-lg transform -rotate-90 origin-center">
                Hoogte: {{ currentLevelData.wallH }}
              </div>

              <svg :width="svgWidth" :height="svgHeight" class="bg-slate-100 shadow-inner">
                <g>
                  <template v-for="x in tilesX" :key="'tx'+x">
                    <template v-for="y in tilesY" :key="'ty'+y">
                      <rect
                        :x="(x-1) * tileSize * scale" :y="(y-1) * tileSize * scale"
                        :width="tileSize * scale" :height="tileSize * scale"
                        :fill="isCorrect ? '#fef3c7' : '#fde68a'"
                        stroke="#d97706" stroke-width="2"
                        class="transition-all duration-300"
                      />
                    </template>
                  </template>
                </g>
                <rect
                  v-if="remX > 0"
                  :x="tilesX * tileSize * scale" :y="0"
                  :width="remX * scale" :height="svgHeight"
                  fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3"
                />
                <rect
                  v-if="remY > 0"
                  :x="0" :y="tilesY * tileSize * scale"
                  :width="tilesX * tileSize * scale" :height="remY * scale"
                  fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3"
                />
                <defs>
                  <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#fca5a5" stroke-width="4" />
                  </pattern>
                </defs>
              </svg>

              <div v-if="isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="bg-amber-500 text-white font-black text-4xl px-6 py-4 rounded-xl shadow-md transform -rotate-12">
                  GGD = {{ tileSize }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration
  :show="isCorrect && !celebrationDone && !showReflection"
  @done="celebrationDone = true"
  :is-level-complete="currentInternalLevel === totalInternalLevels - 1"
/>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #f59e0b;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
