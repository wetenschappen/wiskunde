<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartBar, PhArrowClockwise, PhMoney, PhGraph
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Statistiek: De Uitschieter' },
  instruction: {
    type: String,
    default: 'We vergelijken het <strong>Gemiddelde</strong> (alles optellen en delen door aantal) met de <strong>Mediaan</strong> (het exacte midden van de geordende rij).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionChecked = ref(false)
const showPrediction = ref(true)
const predictedDirection = ref(null)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// Hint Level 1 — Observe effect
const hintLevels1 = [
  'Kijk naar het verschil tussen gemiddelde en mediaan. Vergelijk de situatie zonder en met uitschieter.',
  'Voorbeeld: zonder uitschieter [3,5,7,9,11]: gem=7, med=7. Met uitschieter [3,5,7,9,11,100]: gem=22.5, med=8.',
  'Zonder uitschieter: gemiddelde = __, mediaan = __. Met uitschieter: gemiddelde = __, mediaan = __. Welke verandert meer?'
]

// Hint Level 2 — Predict direction
const hintLevels2 = [
  'Een uitschieter die veel groter is dan de rest, trekt het gemiddelde in die richting. De mediaan verandert amper.',
  'Voorbeeld: data [2,4,6,8] gem=5, med=5. Voeg 100 toe: gem=24, med=6. Het gemiddelde schiet omhoog.',
  'De uitschieter is __. Het oude gemiddelde is __. Het nieuwe gemiddelde wordt __ (hoger/lager).'
]

// Hint Level 3 — Calculate new mean
const hintLevels3 = [
  'Gemiddelde = som van alle waarden / aantal. Bereken de som zonder de uitschieter, deel door het nieuwe aantal.',
  'Voorbeeld: [3,5,7,9,11,100]. Zonder 100: som=35, 5 getallen, gem=7. Met 100: som=135, 6 getallen, gem=22.5.',
  'Som zonder uitschieter = __. Aantal zonder uitschieter = __. Nieuw gemiddelde = __ / __ = __.'
]

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const levels = ref([])

function generateLevel() {
  const generated = []

  // Level 1 — Observe effect (constrained ranges)
  const l1Normal = [r(8, 12), r(10, 15), r(12, 18), r(14, 20), r(16, 25)].sort((a, b) => a - b)
  const l1Outlier = 150 + r(0, 100)
  const l1MeanWithout = Math.round(l1Normal.reduce((a, b) => a + b, 0) / l1Normal.length)
  const l1DataWith = [...l1Normal, l1Outlier].sort((a, b) => a - b)
  const l1MeanWith = Math.round(l1DataWith.reduce((a, b) => a + b, 0) / l1DataWith.length)
  const l1MedianWithout = l1Normal[2]
  const l1MedianWith = l1DataWith[3]

  generated.push({
    name: 'Niveau 1',
    normalData: l1Normal,
    outlier: l1Outlier,
    scaleMax: Math.max(...l1Normal) + l1Outlier + 20,
    meanWithout: l1MeanWithout,
    meanWith: l1MeanWith,
    medianWithout: l1MedianWithout,
    medianWith: l1MedianWith,
    task: 'Observeer: voeg de uitschieter toe en kijk wat er gebeurt met gemiddelde en mediaan.',
    instruction: `Vijf leerlingen krijgen zakgeld: €${l1Normal.join(', €')}. Voeg een uitschieter toe van €${l1Outlier}. Wat gebeurt er?`,
    whyExplanation: `Gemiddelde = alle waarden tellen mee, dus de uitschieter (€${l1Outlier}) trekt het gemiddelde omhoog van €${l1MeanWithout} naar €${l1MeanWith}. Mediaan = alleen de positie telt, dus die verandert veel minder (van €${l1MedianWithout} naar €${l1MedianWith}). De mediaan is robuust tegen uitschieters.`,
    errorAnalysis: `De mediaan verandert wel, maar veel minder dan het gemiddelde. Het is een misverstand dat de mediaan helemaal niet verandert — hij verandert alleen veel minder omdat hij alleen naar de middelste positie kijkt, niet naar alle waarden.`,
    rootQuestion: 'Welke centrummaat wordt het meest beïnvloed door de uitschieter?'
  })

  // Level 2 — Predict direction
  const l2Normal = Array.from({ length: 5 }, () => r(2, 15)).sort((a, b) => a - b)
  const l2Outlier = 60 + r(0, 60)
  const l2MeanWithout = Math.round(l2Normal.reduce((a, b) => a + b, 0) / l2Normal.length)
  const l2DataWith = [...l2Normal, l2Outlier].sort((a, b) => a - b)
  const l2MeanWith = Math.round(l2DataWith.reduce((a, b) => a + b, 0) / l2DataWith.length)
  const l2MedianWithout = l2Normal[2]
  const l2MedianWith = l2DataWith[3]

  generated.push({
    name: 'Niveau 2',
    normalData: l2Normal,
    outlier: l2Outlier,
    scaleMax: Math.max(...l2Normal) + l2Outlier + 20,
    meanWithout: l2MeanWithout,
    meanWith: l2MeanWith,
    medianWithout: l2MedianWithout,
    medianWith: l2MedianWith,
    task: 'Voorspel: zal het gemiddelde stijgen of dalen?',
    instruction: `Vijf vrienden hebben spaargeld: €${l2Normal.join(', €')}. Voeg een uitschieter toe van €${l2Outlier}. ${l2Outlier > l2MeanWithout ? 'Zal het gemiddelde stijgen of dalen?' : 'Zal het gemiddelde stijgen of dalen?'}`,
    whyExplanation: `Het gemiddelde stijgt ${l2Outlier > l2MeanWithout ? '' : 'niet omdat de uitschieter kleiner is dan het gemiddelde niet; het daalt omdat de uitschieter kleiner is. '}Gemiddelde = alle waarden tellen mee, dus een extreme waarde trekt het gemiddelde in zijn richting. Mediaan = alleen positie, dus robuust.`,
    errorAnalysis: l2Outlier > l2MeanWithout
      ? 'Sommige leerlingen denken dat de mediaan even hard verandert. Maar de mediaan kijkt alleen naar de middelste positie, niet naar de grootte van de uitschieter.'
      : 'Let op: een uitschieter kan ook kleiner zijn dan de rest! Dan daalt het gemiddelde. De mediaan blijft ook dan stabiel.',
    rootQuestion: 'Waarom verandert het gemiddelde meer dan de mediaan?'
  })

  // Level 3 — Calculate new mean after removing outlier
  const l3Normal = Array.from({ length: 5 }, () => r(15, 45)).sort((a, b) => a - b)
  const l3Outlier = 150 + r(0, 160)
  const l3TotalWith = l3Normal.reduce((a, b) => a + b, 0) + l3Outlier
  const l3MeanWith = Math.round(l3TotalWith / 6)
  const l3TotalWithout = l3Normal.reduce((a, b) => a + b, 0)
  const l3MeanWithout = Math.round(l3TotalWithout / 5)

  generated.push({
    name: 'Niveau 3',
    normalData: l3Normal,
    outlier: l3Outlier,
    scaleMax: l3MeanWith + 30,
    meanWithout: l3MeanWithout,
    meanWith: l3MeanWith,
    totalWith: l3TotalWith,
    totalWithout: l3TotalWithout,
    task: `Bereken: wat is het nieuwe gemiddelde als we de uitschieter (€${l3Outlier}) verwijderen?`,
    instruction: `Een groep verdient per week: €${l3Normal.join(', €')} plus één uitschieter (€${l3Outlier}). Het gemiddelde met uitschieter is €${l3MeanWith}. Bereken het gemiddelde zonder de uitschieter.`,
    whyExplanation: `Zonder de uitschieter is de som €${l3TotalWithout} en zijn er 5 waarden. Gemiddelde = €${l3TotalWithout} / 5 = €${l3MeanWithout}. De uitschieter had het gemiddelde opgetrokken van €${l3MeanWithout} naar €${l3MeanWith}. Dit laat zien waarom de mediaan vaak een beter beeld geeft bij scheve verdelingen.`,
    errorAnalysis: 'Een veelgemaakte fout is vergeten dat het aantal waarden ook verandert. Als je de uitschieter verwijdert, deel je door 5 in plaats van 6.',
    rootQuestion: 'Wanneer is de mediaan beter dan het gemiddelde?'
  })

  return generated
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

// State
const hasOutlier = ref(false)
const userAns = ref('')
const userCalculation = ref('')
const showBarChart = ref(false)

const currentData = computed(() => {
  if (!currentLevel.value) return []
  return hasOutlier.value
    ? [...currentLevel.value.normalData, currentLevel.value.outlier].sort((a, b) => a - b)
    : [...currentLevel.value.normalData]
})

const meanValue = computed(() => {
  if (!currentData.value.length) return 0
  const sum = currentData.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / currentData.value.length)
})

const medianValue = computed(() => {
  const data = currentData.value
  if (!data.length) return 0
  const mid = Math.floor(data.length / 2)
  if (data.length % 2 === 0) {
    return Math.round((data[mid - 1] + data[mid]) / 2)
  }
  return data[mid]
})

function addOutlier() {
  if (isCorrect.value || hasOutlier.value) return
  hasOutlier.value = true
  showBarChart.value = true
  feedback.value = {
    type: 'info',
    text: `De uitschieter (€${currentLevel.value.outlier}) is toegevoegd. Kijk hoe het gemiddelde en de mediaan veranderen.`
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  hasOutlier.value = false
  userAns.value = ''
  userCalculation.value = ''
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedDirection.value = null
  showBarChart.value = false
  showWorkedExample.value = true
}

function commitPrediction() {
  if (currentInternalLevel.value === 1 && predictedDirection.value === null) return
  showPrediction.value = false
  if (currentInternalLevel.value === 1) {
    const dirLabel = predictedDirection.value === 'increase' ? 'stijgen' : predictedDirection.value === 'decrease' ? 'dalen' : 'gelijk blijven'
    feedback.value = {
      type: 'info',
      text: `Jouw voorspelling: het gemiddelde zal ${dirLabel}. Voeg de uitschieter toe en kijk of je gelijk hebt.`
    }
  } else {
    feedback.value = { type: 'info', text: currentLevel.value.instruction }
  }
}

function checkObservation() {
  if (isCorrect.value) return
  attemptCount.value++

  if (userAns.value === 'mean') {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    if (attemptCount.value < 3) {
      let msg = ''
      if (userAns.value === 'median') {
        msg = `De mediaan verandert van ${currentLevel.value.medianWithout} naar ${currentLevel.value.medianWith}. Het gemiddelde van ${currentLevel.value.meanWithout} naar ${currentLevel.value.meanWith}. ${currentLevel.value.errorAnalysis}`
      } else if (userAns.value === 'both') {
        msg = `Beide veranderen, maar niet evenveel. Het gemiddelde gaat van ${currentLevel.value.meanWithout} naar ${currentLevel.value.meanWith} (verschil: ${Math.abs(currentLevel.value.meanWith - currentLevel.value.meanWithout)}). De mediaan van ${currentLevel.value.medianWithout} naar ${currentLevel.value.medianWith} (verschil: ${Math.abs(currentLevel.value.medianWith - currentLevel.value.medianWithout)}). Welke verandert het meest?`
      } else {
        msg = `Kijk naar de getallen. Het gemiddelde was ${currentLevel.value.meanWithout} en wordt ${currentLevel.value.meanWith}. De mediaan was ${currentLevel.value.medianWithout} en wordt ${currentLevel.value.medianWith}. Welke is harder veranderd?`
      }
      feedback.value = { type: 'error', text: msg }
    } else {
      feedback.value = {
        type: 'error',
        text: `Het gemiddelde wordt het meest beïnvloed. Het ging van ${currentLevel.value.meanWithout} naar ${currentLevel.value.meanWith}. De mediaan veranderde amper (${currentLevel.value.medianWithout} naar ${currentLevel.value.medianWith}). De mediaan is robuust tegen uitschieters.`
      }
    }
    hintCount.value++
  }
}

function checkCalculation() {
  if (isCorrect.value) return
  attemptCount.value++

  const val = Number(userCalculation.value)
  const expected = currentLevel.value.meanWithout

  if (Math.abs(val - expected) <= 0.5) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    if (attemptCount.value < 3) {
      // Error analysis: check if they forgot to change the count
      const asMeanOf6 = Math.round(currentLevel.value.totalWithout / 6)
      if (Math.abs(val - asMeanOf6) <= 0.5) {
        feedback.value = {
          type: 'error',
          text: `Je hebt gedeeld door 6, maar we hebben de uitschieter verwijderd. Er zijn nog maar 5 waarden over. De som is ${currentLevel.value.totalWithout}. Deel door 5 in plaats van 6.`
        }
      } else {
        feedback.value = {
          type: 'error',
          text: `Niet helemaal. De som zonder uitschieter is ${currentLevel.value.totalWithout}. Deel dit door het nieuwe aantal (5). ${hintLevels3[Math.min(attemptCount.value - 1, 2)]}`
        }
      }
    } else {
      feedback.value = {
        type: 'error',
        text: `Som = ${currentLevel.value.totalWithout}, aantal = 5. Gemiddelde = ${currentLevel.value.meanWithout}.`
      }
    }
    hintCount.value++
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Wat maakt de mediaan beter bij uitschieters?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Goed nagedacht! De mediaan is een robuuste maat die niet wordt vertekend door extreme waarden.' }
}

function handleNext() {
  if (showReflection.value && !reflectionChecked.value) {
    feedback.value = { type: 'error', text: 'Beantwoord eerst de reflectievraag.' }
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function showHint() {
  if (isCorrect.value || !currentLevel.value || hintCount.value >= 3) return
  const hints = currentInternalLevel.value === 0 ? hintLevels1
    : currentInternalLevel.value === 1 ? hintLevels2
    : hintLevels3
  const idx = hintCount.value
  hintCount.value++
  if (idx >= 0 && idx < hints.length) {
    feedback.value = { type: 'info', text: hints[idx] }
  }
}

function resetLevel() {
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedDirection.value = null
  hasOutlier.value = false
  userAns.value = ''
  userCalculation.value = ''
  showBarChart.value = false
  nextTick(() => mainArea.value?.focus())
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
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">{{ currentLevel ? currentLevel.name : '' }} ({{ currentInternalLevel + 1 }}/{{ totalInternalLevels }})</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i"
                   class="w-2 h-2 rounded-full"
                   :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')"
              class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]">
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Left Panel: Instructions + Controls -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Uitgewerkt Voorbeeld</p>
            <p class="text-xs text-amber-700 mb-1">Data zonder uitschieter: [3, 5, 7, 9, 11]</p>
            <p class="text-xs text-amber-700 mb-1">Gemiddelde = (3+5+7+9+11)/5 = 7</p>
            <p class="text-xs text-amber-700 mb-1">Mediaan = 7 (middelste waarde)</p>
            <p class="text-xs text-amber-700 mb-1">Data met uitschieter: [3, 5, 7, 9, 11, 100]</p>
            <p class="text-xs text-amber-700 mb-1">Gemiddelde = (3+5+7+9+11+100)/6 = 22,5</p>
            <p class="text-xs text-amber-700 mb-1">Mediaan = (7+9)/2 = 8</p>
            <p class="text-xs text-amber-700"><strong>Conclusie:</strong> Gemiddelde schiet omhoog (7 naar 22,5). Mediaan amper (7 naar 8).</p>
          </div>

          <!-- Worked Example for Level 3 -->
          <div v-if="showWorkedExample && currentInternalLevel === 2" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Uitgewerkt Voorbeeld</p>
            <p class="text-xs text-amber-700 mb-1">Data: [3, 5, 7, 9, 11, 100]</p>
            <p class="text-xs text-amber-700 mb-1">Som zonder uitschieter: 3+5+7+9+11 = 35</p>
            <p class="text-xs text-amber-700 mb-1">Aantal zonder uitschieter: 5</p>
            <p class="text-xs text-amber-700 mb-1">Nieuw gemiddelde: 35 / 5 = 7</p>
            <p class="text-xs text-amber-700"><strong>Opgelet:</strong> Het aantal verandert ook als je de uitschieter verwijdert!</p>
          </div>

          <!-- Prediction Gate: Level 2 only -->
          <div v-if="showPrediction && currentInternalLevel === 1" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-2">Het huidige gemiddelde is <strong>€{{ currentLevel.meanWithout }}</strong>.</p>
            <p class="text-sm text-amber-700 mb-4">We gaan een uitschieter toevoegen van <strong>€{{ currentLevel.outlier }}</strong>. Zal het gemiddelde stijgen, dalen of gelijk blijven?</p>
            <div class="flex flex-col gap-2">
              <button @click="predictedDirection = 'increase'"
                      class="w-full p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedDirection === 'increase' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Stijgen (hoger)
              </button>
              <button @click="predictedDirection = 'decrease'"
                      class="w-full p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedDirection === 'decrease' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Dalen (lager)
              </button>
              <button @click="predictedDirection = 'same'"
                      class="w-full p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedDirection === 'same' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Blijft gelijk
              </button>
            </div>
            <button @click="commitPrediction"
                    :disabled="predictedDirection === null"
                    class="mt-3 w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Voorspelling
            </button>
          </div>

          <!-- Simple start for level 1 and 3 -->
          <div v-if="showPrediction && (currentInternalLevel === 0 || currentInternalLevel === 2)" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">{{ currentInternalLevel === 0 ? 'Start met observeren' : 'Start met berekenen' }}</p>
            <p class="text-sm text-amber-700 mb-4">{{ currentInternalLevel === 0 ? 'Voeg de uitschieter toe en observeer wat er gebeurt.' : 'Bereken het gemiddelde nadat we de uitschieter verwijderen.' }}</p>
            <button @click="commitPrediction"
                    class="w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-[0.98]">
              Start Level {{ currentInternalLevel + 1 }}
            </button>
          </div>

          <!-- Main content after prediction -->
          <div v-if="!showPrediction" class="space-y-4">
            <p class="text-sm text-slate-600"><MathText :content="currentLevel.instruction" /></p>

            <!-- Level 1 & 2: Add outlier button -->
            <div v-if="currentInternalLevel < 2">
              <button @click="addOutlier"
                      :disabled="isCorrect || hasOutlier"
                      class="w-full py-4 font-bold bg-white text-amber-600 border-2 border-amber-400 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-amber-50 active:scale-[0.98] transition-all disabled:opacity-50">
                <PhMoney weight="bold" class="w-6 h-6" /> Voeg Uitschieter Toe (€{{ currentLevel.outlier }})
              </button>
            </div>

            <!-- Data display -->
            <div v-if="hasOutlier || currentInternalLevel === 2" class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 text-sm mb-2">Data:</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="(val, idx) in currentData" :key="idx"
                      class="bg-white px-3 py-1 rounded-lg font-mono text-sm font-bold border shadow-sm"
                      :class="val === currentLevel.outlier ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-slate-300 text-slate-600'">
                  €{{ val }}
                </span>
              </div>
            </div>

            <!-- Stats boxes -->
            <div v-if="hasOutlier || currentInternalLevel === 2" class="space-y-3 animate-fadeIn">
              <div class="flex items-center justify-between p-4 rounded-lg border-2 border-amber-200 bg-amber-50 transition-all duration-500">
                <span class="font-bold text-amber-800">Gemiddelde (Som / Aantal)</span>
                <span class="font-black text-2xl text-amber-600" :key="'m'+meanValue">{{ meanValue }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-lg border-2 border-slate-300 bg-white transition-all duration-500">
                <span class="font-bold text-slate-700">Mediaan (Middelste)</span>
                <span class="font-black text-2xl text-slate-600" :key="'med'+medianValue">{{ medianValue }}</span>
              </div>
            </div>

            <!-- Level 1: Observation question -->
            <div v-if="currentInternalLevel === 0 && hasOutlier && !isCorrect" class="p-4 border-2 border-amber-200 bg-amber-50 rounded-xl">
              <p class="font-bold text-amber-800 mb-3">{{ currentLevel.rootQuestion }}</p>
              <div class="flex flex-col gap-2">
                <button @click="userAns = 'mean'"
                        class="w-full p-4 rounded-lg font-bold border-2 transition-all text-left"
                        :class="userAns === 'mean' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                  Het gemiddelde
                </button>
                <button @click="userAns = 'median'"
                        class="w-full p-4 rounded-lg font-bold border-2 transition-all text-left"
                        :class="userAns === 'median' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                  De mediaan
                </button>
                <button @click="userAns = 'both'"
                        class="w-full p-4 rounded-lg font-bold border-2 transition-all text-left"
                        :class="userAns === 'both' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                  Allebei evenveel
                </button>
              </div>
            </div>

            <!-- Level 3: Calculation input -->
            <div v-if="currentInternalLevel === 2 && !showPrediction && !isCorrect" class="p-4 border-2 border-amber-200 bg-amber-50 rounded-xl">
              <p class="font-bold text-amber-800 mb-2">Bereken het nieuwe gemiddelde:</p>
              <p class="text-sm text-amber-700 mb-3">Som zonder uitschieter = €{{ currentLevel.totalWithout }}, aantal = 5</p>
              <div class="flex items-center gap-3">
                <span class="font-bold text-amber-800">Gemiddelde = €</span>
                <input type="number" v-model.number="userCalculation" step="0.1"
                       class="flex-1 p-3 border-2 border-amber-200 rounded-lg font-bold text-lg text-center focus:border-amber-500 outline-none"
                       placeholder="...">
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="isCorrect" class="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-amber-800 text-sm mb-1">Waarom?</p>
              <p class="text-sm text-amber-700">{{ currentLevel.whyExplanation }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">{{ currentLevel.rootQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionChecked"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionChecked" @click="checkReflection"
                      class="mt-2 w-full py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-[0.98]">
                Bevestig Reflectie
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text"
               class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
               role="status" aria-live="polite" aria-atomic="true"
               :class="{
                 'bg-amber-100 text-amber-800': feedback.type === 'success',
                 'bg-red-100 text-red-800': feedback.type === 'error',
                 'bg-slate-100 text-slate-800': feedback.type === 'info',
               }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-relaxed">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetLevel" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]">
              <PhArrowClockwise />
            </button>
            <button v-if="!isCorrect && !showPrediction && currentInternalLevel === 0 && hasOutlier"
                    @click="showHint"
                    :disabled="hintCount >= 3"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50">
              {{ hintCount >= 3 ? 'Geen hints meer' : 'Hint nodig?' }}
            </button>
            <button v-if="!isCorrect && currentInternalLevel < 2 && !showPrediction && hasOutlier"
                    @click="checkObservation"
                    class="flex-1 py-4 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2">
              Controleer
            </button>
            <button v-if="!isCorrect && currentInternalLevel === 2 && !showPrediction"
                    @click="checkCalculation"
                    class="flex-1 py-4 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2">
              Controleer
            </button>
            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Visualisation -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex flex-col items-center gap-8">

            <!-- Number Line -->
            <div class="w-full bg-slate-800 p-6 rounded-xl shadow-md border-4 border-slate-900 flex items-center justify-center relative min-h-[300px] overflow-hidden">
              <div class="absolute left-10 right-10 bottom-20 h-2 bg-slate-600 rounded-full"></div>
              <div class="absolute left-10 bottom-14 font-mono text-slate-400 text-xs font-bold">0</div>
              <div class="absolute right-10 bottom-14 font-mono text-slate-400 text-xs font-bold">{{ currentLevel.scaleMax }}</div>

              <!-- Dots for data -->
              <div v-for="(val, idx) in currentData" :key="'d'+idx"
                   class="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
                   :class="val === currentLevel.outlier ? 'bg-amber-500' : 'bg-slate-300'"
                   :style="{ left: `calc(10px + ${(val / currentLevel.scaleMax) * 380}px)`, bottom: 'calc(5rem - 2px)' }">
              </div>

              <!-- Median Line -->
              <div v-if="hasOutlier || currentInternalLevel === 2"
                   class="absolute w-1 h-32 bg-amber-500 transform -translate-x-1/2 bottom-20 transition-all duration-700 ease-in-out shadow-[0_0_10px_#d97706]"
                   :style="{ left: `calc(10px + ${(medianValue / currentLevel.scaleMax) * 380}px)` }">
                <span class="absolute -top-6 left-0 font-bold text-amber-400 text-xs uppercase tracking-widest bg-slate-800 px-1">Med</span>
              </div>

              <!-- Mean Line -->
              <div v-if="hasOutlier || currentInternalLevel === 2"
                   class="absolute w-1 h-40 transform -translate-x-1/2 bottom-20 transition-all duration-1000 ease-in-out shadow-[0_0_15px_currentColor] bg-red-500 text-red-500"
                   :style="{ left: `calc(10px + ${(meanValue / currentLevel.scaleMax) * 380}px)` }">
                <span class="absolute -top-6 left-0 font-bold text-xs uppercase tracking-widest bg-slate-800 px-1 text-red-400">Gem</span>
              </div>

              <!-- Labels for initial state -->
              <div v-if="!hasOutlier && currentInternalLevel < 2"
                   class="absolute w-1 h-32 bg-slate-500 transform -translate-x-1/2 bottom-20 transition-all duration-700 ease-in-out"
                   :style="{ left: `calc(10px + ${(meanValue / currentLevel.scaleMax) * 380}px)` }">
                <span class="absolute -top-6 left-0 font-bold text-slate-400 text-xs uppercase tracking-widest bg-slate-800 px-1">Gem/Med</span>
              </div>
            </div>

            <!-- Bar Chart (Level 3) -->
            <div v-if="showBarChart || currentInternalLevel === 2" class="w-full bg-white p-6 rounded-xl shadow-md border-2 border-slate-200">
              <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4 text-center">Verdeling van de data</h4>
              <div class="flex items-end justify-around h-48 border-b-2 border-l-2 border-slate-300 px-2">
                <div v-for="(val, idx) in currentData" :key="'b'+idx"
                     class="flex flex-col items-center w-12 transition-all duration-500"
                     :class="val === currentLevel.outlier ? 'order-last' : ''">
                  <span class="text-[10px] font-bold text-slate-500 mb-1">{{ val }}</span>
                  <div class="w-8 rounded-t-sm transition-all duration-500"
                       :style="{ height: `${(val / currentLevel.scaleMax) * 160}px` }"
                       :class="val === currentLevel.outlier ? 'bg-amber-500' : 'bg-slate-400'">
                  </div>
                </div>
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
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
