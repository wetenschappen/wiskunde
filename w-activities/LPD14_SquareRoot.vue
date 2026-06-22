<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquareHalf, PhArrowClockwise,
  PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten en Wortels: De Vierkantswortel' },
  instruction: {
    type: String,
    default: 'Het woord "vierkantswortel" zegt letterlijk wat het is: de <strong>wortel (de basis, de zijde) van een vierkant</strong>!<br/><br/><strong>Opdracht:</strong> Bereken de vierkantswortel door met de slider een vierkant te maken dat exact het gevraagde aantal tegeltjes (oppervlakte) bevat.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhSquareHalf }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de slider om de grootte van het vierkant te veranderen.' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedSide = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const hintCount = ref(0)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const levels = ref([])

function generateLevel() {
  const newLevels = []

  const smallSquares = [16, 25, 36, 49]
  const t1 = smallSquares[Math.floor(Math.random() * smallSquares.length)]
  const r1 = Math.round(Math.sqrt(t1))
  newLevels.push({
    goalText: `Opdracht 1: Wat is √${t1}?`,
    targetArea: t1,
    exactAns: r1
  })

  const mediumSquares = [49, 64, 81, 100]
  const t2 = mediumSquares[Math.floor(Math.random() * mediumSquares.length)]
  const r2 = Math.round(Math.sqrt(t2))
  newLevels.push({
    goalText: `Opdracht 2: Wat is √${t2}?`,
    targetArea: t2,
    exactAns: r2
  })

  const largeSquares = [64, 81, 100]
  const t3 = largeSquares[Math.floor(Math.random() * largeSquares.length)]
  const r3 = Math.round(Math.sqrt(t3))
  newLevels.push({
    goalText: `Opdracht 3: Wat is √${t3}?`,
    targetArea: t3,
    exactAns: r3
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const sideLength = ref(1)
const userAns = ref(null)

const currentArea = computed(() => sideLength.value * sideLength.value)

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    area: 36,
    side: 6,
    steps: [
      'We willen √36 weten. We maken een vierkant van 36 tegeltjes.',
      'Zet de slider op 6 — het vierkant heeft dan 6 × 6 = 36 tegeltjes.',
      'De zijde is 6, dus √36 = 6.'
    ]
  }
]

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: hoe lang is de zijde van het vierkant?' }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (predictedSide.value === null || predictedSide.value === undefined) return
  const data = currentLevelData.value
  const threshold = Math.sqrt(data.targetArea)
  if (Math.abs(predictedSide.value - threshold) <= 2) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Goed ingeschat! Laten we het visueel controleren met de slider.' }
  } else {
    attemptCount.value++
    const hints = [
      'De zijde is veel kleiner dan het aantal tegeltjes. Denk aan een vierkant!',
      `Bij een oppervlakte van ${data.targetArea} zoek je een getal dat met zichzelf vermenigvuldigd ${data.targetArea} geeft.`,
      `Probeer een getal tussen ${Math.floor(Math.sqrt(data.targetArea)) - 1} en ${Math.ceil(Math.sqrt(data.targetArea)) + 1}.`
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const data = currentLevelData.value
  const hints = [
    'De vierkantswortel is de zijde van een vierkant. Bij welke zijde heeft het vierkant exact ' + data.targetArea + ' tegeltjes?',
    'Probeer: zet de slider op een getal. Zie je het aantal tegeltjes veranderen? Zoek de juiste.', 
    `Je zoekt √${data.targetArea}. Dat is een getal tussen ${Math.floor(Math.sqrt(data.targetArea)) - 1} en ${Math.ceil(Math.sqrt(data.targetArea)) + 1}. Wat is de juiste waarde? ___`
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
function getErrorAnalysis(userValue) {
  const data = currentLevelData.value
  if (!data) return ''
  if (userValue === data.targetArea) {
    return 'Let op! ' + data.targetArea + ' is de OPPERVLAKTE (het aantal tegeltjes). De vierkantswortel is de ZIJDE van het vierkant.'
  }
  if (userValue === data.targetArea / 2) {
    return 'Verwar niet! Een vierkantswortel is NIET de helft van de oppervlakte. De zijde is het getal dat met zichzelf vermenigvuldigd de oppervlakte geeft.'
  }
  return ''
}

function checkAnswer() {
  isChecked.value = true
  const data = currentLevelData.value

  if (userAns.value === data.exactAns) {
    if (sideLength.value === data.exactAns) {
      isCorrect.value = true
      hintCount.value = 0
      errorDetected.value = ''
      const whyTexts = [
        '√36 = 6 omdat 6 × 6 = 36. De vierkantswortel is letterlijk de "wortel" (zijde) van het vierkant. Elk vierkant met oppervlakte A heeft een zijde van √A. Het is de omgekeerde bewerking van kwadrateren.',
        '√' + data.targetArea + ' = ' + data.exactAns + ' omdat ' + data.exactAns + ' × ' + data.exactAns + ' = ' + data.targetArea + '. De vierkantswortel vraagt: "Welk getal moet ik met zichzelf vermenigvuldigen om deze oppervlakte te krijgen?"',
        'De vierkantswortel is de inverse van kwadrateren. Als x² = A, dan is x = √A. In het visuele model: de zijde is de wortel, het vierkant is de macht.'
      ]
      showWhyExplanation(whyTexts[currentInternalLevel.value])
      feedback.value = {
        type: 'success',
        text: `Uitstekend! √${data.targetArea} = ${data.exactAns}. LPD 14: Je berekent vierkantswortels van volkomen kwadraten.`
      }
    } else {
      attemptCount.value++
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `${data.exactAns} is correct! Maar zet je visuele vierkant eerst ook op ${data.targetArea} tegeltjes.`}
      } else {
        feedback.value = { type: 'error', text: `Schuif de slider naar ${data.exactAns}.`}
      }
    }
  } else {
    attemptCount.value++
    const errAnalysis = getErrorAnalysis(userAns.value)
    if (errAnalysis) {
      errorDetected.value = errAnalysis
    }

    if (currentArea.value !== data.targetArea) {
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `Je vierkant heeft nu ${currentArea.value} tegeltjes. Pas de slider aan tot je er ${data.targetArea} hebt.`}
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: `Zet de slider op de juiste zijde. √${data.targetArea} = ?` }
      } else {
        feedback.value = { type: 'error', text: `Schuif naar ${data.exactAns} en typ dat getal in.` }
      }
    } else {
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `Het vierkant heeft ${data.targetArea} tegeltjes. De zijde is de vierkantswortel.` }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: `De zijde van het ${data.targetArea}-tegeltjes vierkant is √${data.targetArea} = ...` }
      } else {
        feedback.value = { type: 'error', text: `√${data.targetArea} = ${data.exactAns}.` }
      }
    }
  }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

function resetActivityState() {
  generateLevel()
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Gebruik de slider om de grootte van het vierkant te veranderen.' }
  sideLength.value = 1
  userAns.value = null
  attemptCount.value = 0
  hintCount.value = 0
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedSide.value = null

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: hoe lang is de zijde van het vierkant?' }
  }
}

function handleNext() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op wat je leerde over vierkantswortels.' }
    return
  }

  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasInverse = text.includes('omgekeerd') || text.includes('tegenovergesteld') || text.includes('kwadrateer')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if ((hasInverse || text.length > 20) && hasReason) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekende reflectie! Je begrijpt het verband tussen kwadrateren en worteltrekken.<br/><br/><strong>LPD 14 bewezen:</strong> Je kunt vierkantswortels berekenen en uitleggen waarom.' }
  } else {
    attemptCount.value++
    const hints = [
      'Waarom is √36 = 6? Wat is het verband tussen kwadrateren en worteltrekken?',
      'Leg uit: "Een vierkantswortel is het omgekeerde van..."',
      'Denk aan het visuele model: wat stelt de zijde voor? Wat stelt de oppervlakte voor?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    generateLevel()
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-600' : 'bg-slate-200 border-slate-300'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-500">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-400 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <!-- MAIN -->
      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">Wat is √36?</p>
              <div class="space-y-1.5 text-sm text-slate-700">
                <div v-for="(step, si) in workedExamples[0].steps" :key="si" class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="mt-2 p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                √36 = 6
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- Prediction Gate -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Hoe lang is ongeveer de zijde van een vierkant met {{ currentLevelData.targetArea }} tegeltjes?</p>
              <div class="flex items-center justify-center gap-2">
                <input v-model.number="predictedSide" type="number" inputmode="numeric" placeholder="?"
                  class="w-20 p-2 text-center font-bold text-xl border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none tabular-nums" />
              </div>
              <button v-if="predictedSide !== null && predictedSide !== undefined && predictedSide !== ''" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- Goal + Input -->
            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-3">
                <p class="font-bold text-amber-800 text-sm">{{ currentLevelData.goalText }}</p>
              </div>
              <div class="text-center">
                <label class="block text-sm font-bold text-slate-700 mb-2">Wat is de vierkantswortel?</label>
                <div class="flex items-center justify-center gap-2">
                  <span class="font-black text-3xl text-slate-400">√</span>
                  <span class="font-black text-2xl text-slate-700 border-t-4 border-slate-400 pt-1">{{ currentLevelData.targetArea }}</span>
                  <span class="font-black text-2xl text-slate-400">=</span>
                  <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                         class="w-20 font-bold text-2xl p-2 border-2 border-slate-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-center bg-white outline-none" />
                </div>
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <!-- Error analysis -->
            <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle class="w-5 h-5 text-red-600" weight="fill" />
                <span class="font-bold text-red-800 text-sm">Let op!</span>
              </div>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Waarom is √49 = 7? Wat is het verband tussen kwadrateren en worteltrekken? Leg uit met het visuele model.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="√49 = 7 omdat 7 × 7 = 49..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'success',
                          'bg-red-50 text-red-800 border border-red-200': feedback.type === 'error',
                          'bg-blue-50 text-blue-800 border border-blue-200': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showWorkedExample && !showPrediction && !showReflection"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-600 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <button v-if="!isCorrect && !showReflection && !showWorkedExample && !showPrediction" @click="checkAnswer" :disabled="userAns === null || userAns === undefined || userAns === ''"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Grid -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl flex flex-col items-center">

                  <div class="mb-8 w-full max-w-sm bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                      <div class="flex justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Zijde Vierkant</label>
                          <span class="font-black text-xl text-amber-600 tabular-nums">{{ sideLength }}</span>
                      </div>
                      <input type="range" min="1" max="10" step="1" v-model.number="sideLength" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                  </div>

                  <div class="relative bg-white border-4 border-slate-700 shadow-md rounded-lg overflow-hidden">
                      <div class="absolute -left-6 top-1/2 -translate-y-1/2 font-black text-slate-600 transform -rotate-90 tabular-nums">{{ sideLength }}</div>
                      <div class="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-slate-600 tabular-nums">{{ sideLength }}</div>

                      <svg viewBox="0 0 300 300" class="w-full max-w-sm h-auto block">
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 9" :key="'v'+i" :x1="i * 30" y1="0" :x2="i * 30" y2="300" />
                              <line v-for="i in 9" :key="'h'+i" x1="0" :y1="i * 30" x2="300" :y2="i * 30" />
                          </g>

                          <rect x="0" y="0" :width="sideLength * 30" :height="sideLength * 30" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="3" class="transition-all duration-300" />

                          <g class="transition-all duration-300">
                              <template v-for="x in sideLength" :key="'tx'+x">
                                  <template v-for="y in sideLength" :key="'ty'+y">
                                      <rect :x="(x-1)*30" :y="(y-1)*30" width="30" height="30" fill="transparent" stroke="#10b981" stroke-width="1" />
                                  </template>
                              </template>
                          </g>

                          <text :x="(sideLength * 30) / 2" :y="(sideLength * 30) / 2" text-anchor="middle" dominant-baseline="central" font-weight="900" font-size="28" fill="#047857" class="transition-all duration-300">
                              {{ currentArea }}
                          </text>
                      </svg>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel >= totalInternalLevels - 1 && reflectionDone" />
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #f59e0b;
  cursor: pointer;
  margin-top: -11px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
