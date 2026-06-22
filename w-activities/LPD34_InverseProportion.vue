<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRectangle, PhArrowClockwise, PhArrowsLeftRight,
  PhLightbulb, PhBrain, PhPencilSimpleLine
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
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhRectangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider (Breedte x) en observeer de curve.' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedProduct = ref(null)
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
    initWidth: Math.max(Math.floor(area / 6), 4)
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])

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
  const xTickStep = 2
  const yTickStep = 5
  const xTicks = []
  for (let v = 0; v <= maxX; v += xTickStep) xTicks.push(v)
  const yTicks = []
  for (let v = 0; v <= maxY; v += yTickStep) yTicks.push(v)
  return { maxX, maxY, xScale, yScale, xTicks, yTicks }
})

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    area: 24,
    rows: [
      { x: 3, y: 8 },
      { x: 4, y: 6 },
      { x: 6, y: 4 },
      { x: 8, y: 3 }
    ],
    steps: [
      'Een rechthoek heeft oppervlakte 24. Lengte × Breedte = 24.',
      'Als de breedte 3 is, is de lengte 24 ÷ 3 = 8.',
      'Als de breedte verdubbelt naar 6, halveert de lengte naar 4.',
      'Het product blijft constant: x · y = 24. Dit is omgekeerd evenredig.'
    ]
  }
]

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: wat gebeurt er met y als x verdubbelt?' }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (!predictedProduct.value) return
  if (predictedProduct.value === 'halveert') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Bij omgekeerd evenredigheid halveert y als x verdubbelt.' }
  } else {
    attemptCount.value++
    const hints = [
      'Het product x · y is constant. Wat gebeurt er met y als x verdubbelt?',
      'Als 3 × 8 = 24, wat is dan 6 × ? = 24?',
      'Verdubbeling van x = halvering van y. De andere opties zijn fout.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const area = currentLevel.value ? currentLevel.value.area : 0
  const hints = [
    'Let op: x en y zijn omgekeerd evenredig. Als x groter wordt, wordt y...? Het product x × y is constant.',
    `De oppervlakte is ${area}. Dus x × y = ${area}. Probeer: als x = ${Math.floor(area / 4)}, wat is y dan?`,
    `x × y = ${area}. Met andere woorden: y = ${area} / x. Of: kies "Omgekeerd evenredig".`
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
function getErrorAnalysis(value) {
  if (!currentLevel.value) return ''
  if (value === 'direct') {
    return 'Verwar niet! Bij recht evenredig is y/x constant. Bij omgekeerd evenredig is x × y constant. Kijk naar de grafiek: daalt of stijgt de lijn?'
  }
  if (value === 'linear') {
    return 'Let op! x × y = c geeft geen rechte lijn. Het is een hyperbool — de grafiek daalt en wordt steeds vlakker.'
  }
  return ''
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    currentInternalLevel.value = 0
    isCorrect.value = false
    celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    hintCount.value = 0
    errorDetected.value = ''
    showWhy.value = false
    whyText.value = ''
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionDone.value = false
    predictedProduct.value = null
    feedback.value = { type: 'info', text: `Oppervlakte = ${currentLevel.value ? currentLevel.value.area : '...'}. Beweeg de slider (Breedte x) en observeer de curve.` }
    widthX.value = currentLevel.value ? currentLevel.value.initWidth : 4
    userAns.value = ''
    history.value = currentLevel.value ? [{ x: currentLevel.value.initWidth, y: currentLevel.value.area / currentLevel.value.initWidth }] : []

    showWorkedExample.value = currentInternalLevel.value === 0
    showPrediction.value = currentInternalLevel.value >= 1
    if (currentInternalLevel.value >= 1) {
      feedback.value = { type: 'info', text: 'Voorspel: wat gebeurt er met y als x verdubbelt?' }
    }
}

function checkAnswer() {
  isChecked.value = true
  const errAnalysis = getErrorAnalysis(userAns.value)
  if (errAnalysis) {
    errorDetected.value = errAnalysis
  }

  if (userAns.value === 'inverse') {
    isCorrect.value = true
    hintCount.value = 0
    errorDetected.value = ''
    const whyTexts = [
      'Bij omgekeerd evenredigheid is het product x × y constant. Als x verdubbelt, halveert y. De grafiek is een hyperbool. Dit zie je in het rechthoekmodel: de oppervlakte blijft gelijk terwijl lengte en breedte veranderen.',
      'x × y = c betekent: y = c/x. Dit is geen rechte lijn maar een hyperbool. Hoe groter x, hoe kleiner y. De constante c (hier de oppervlakte) bepaalt de vorm van de curve.',
      'Omgekeerd evenredig herken je aan: product is constant, grafiek daalt, als x stijgt daalt y. Het tegenovergestelde van recht evenredig (waar y stijgt als x stijgt).'
    ]
    showWhyExplanation(whyTexts[currentInternalLevel.value])
    feedback.value = {
      type: 'success',
      text: `${currentLevel.value ? currentLevel.value.label : ''} — Perfect! x·y = c.<br/><br/>LPD 34: Je herkent omgekeerd evenredige verbanden.`
    }
  } else {
    attemptCount.value++
    if (userAns.value === 'direct') {
        feedback.value = { type: 'error', text: `Fout! y/x = c hoort bij recht evenredig. Onze grafiek is krom en daalt!`}
    } else {
        feedback.value = { type: 'error', text: `Kies een formule uit de lijst.`}
    }
  }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

function nextLevel() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op omgekeerd evenredige verbanden.' }
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
  const hasProduct = text.includes('product') || text.includes('constant') || text.includes('keer') || text.includes('×')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if (hasProduct && hasReason && text.length > 15) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekend! Het constante product is de kern.<br/><br/><strong>LPD 34 bewezen:</strong> Je begrijpt omgekeerd evenredige verbanden.' }
  } else {
    attemptCount.value++
    const hints = [
      'Wat blijft er altijd hetzelfde bij een omgekeerd evenredig verband?',
      'Leg uit: "Bij omgekeerd evenredigheid is x × y altijd..."',
      'Hoe zie je het verschil tussen recht en omgekeerd evenredig?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
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

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentLevel ? ('Bij een <strong>omgekeerd evenredig</strong> verband is het product van twee getallen (x en y) altijd hetzelfde: <strong>x × y = c</strong>. Als de ene stijgt, moet de andere dalen!<br/><br/><strong>Opdracht:</strong> Kneed de rechthoek door de breedte te veranderen. De oppervlakte (het product) moet altijd <strong>' + currentLevel.area + '</strong> blijven. Welke formule past hierbij?') : props.instruction" class="mb-4 prose prose-sm text-slate-600" />

            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">Oppervlakte = {{ workedExamples[0].area }}</p>
              <div class="overflow-x-auto mb-2">
                <table class="w-full text-sm border-collapse bg-white rounded"><thead><tr class="bg-indigo-100"><th class="p-1 border">Breedte (x)</th><th class="p-1 border">Lengte (y)</th><th class="p-1 border">x × y</th></tr></thead>
                  <tbody>
                    <tr v-for="row in workedExamples[0].rows" :key="row.x"><td class="p-1 border text-center font-bold">{{ row.x }}</td><td class="p-1 border text-center font-bold">{{ row.y }}</td><td class="p-1 border text-center font-bold text-indigo-600">{{ row.x * row.y }}</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="space-y-1 text-sm text-slate-700">
                <div v-for="(step, si) in workedExamples[0].steps" :key="si" class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="mt-2 p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                x × y = {{ workedExamples[0].area }} → omgekeerd evenredig
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Wat gebeurt er met y (lengte) als x (breedte) verdubbelt?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [{id:'verdubbelt',label:'y verdubbelt ook'},{id:'halveert',label:'y halveert'},{id:'blijft',label:'y blijft gelijk'}]" :key="opt.id"
                        @click="predictedProduct = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedProduct === opt.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedProduct" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-3">
                <p class="font-bold text-amber-800 text-sm">{{ currentLevel ? currentLevel.label : '' }}</p>
              </div>
              <div class="text-center">
                <label class="block text-sm font-bold text-slate-700 mb-2">Conclusie Formule:</label>
                <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-bold text-slate-700 bg-white outline-none">
                  <option value="" disabled>Kies een formule...</option>
                  <option value="direct">y / x = c (Recht evenredig)</option>
                  <option value="inverse">x · y = c (Omgekeerd evenredig)</option>
                </select>
              </div>
            </div>

            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle class="w-5 h-5 text-red-600" weight="fill" />
                <span class="font-bold text-red-800 text-sm">Let op!</span>
              </div>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Wat is het verschil tussen recht evenredig en omgekeerd evenredig? Hoe herken je ze in een grafiek? Leg uit.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Bij recht evenredig is y/x constant..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

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

              <button v-if="!isCorrect && !showReflection && !showWorkedExample && !showPrediction" @click="checkAnswer"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-if="isCorrect && !showReflection" @click="nextLevel"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="nextLevel"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              <div class="w-full max-w-4xl flex items-center justify-center gap-12 flex-wrap">
                <div class="flex flex-col items-center">
                  <div class="mb-4 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <div class="flex w-full justify-between items-end mb-2">
                      <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsLeftRight weight="bold" /> Breedte x</label>
                      <span class="font-black text-xl text-amber-600 tabular-nums">{{ widthX }}</span>
                    </div>
                    <input type="range" min="1" :max="currentLevel ? currentLevel.sliderMax : 12" step="1" v-model.number="widthX" :disabled="isCorrect"
                           class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                  </div>
                  <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8 flex items-end justify-start min-w-[300px] min-h-[350px]">
                    <div class="absolute bottom-8 left-8 bg-amber-500/20 border-4 border-amber-500 transition-all duration-300 ease-out flex items-center justify-center shadow-inner"
                         :style="{ width: `${Math.min(widthX * 20, 250)}px`, height: `${Math.min(heightY * 10, 250)}px` }">
                      <span class="font-black text-amber-600 text-lg tabular-nums">Opp = {{ currentLevel ? currentLevel.area : 0 }}</span>
                    </div>
                    <div class="absolute bottom-2 left-8 font-bold text-amber-600 tabular-nums">x = {{ widthX }}</div>
                    <div class="absolute bottom-8 left-0 -translate-x-full font-bold text-amber-600 pr-2 pb-2 -rotate-90 origin-bottom-right" :style="{ bottom: `${8 + Math.min((heightY*10)/2, 125)}px` }">y = {{ heightY.toFixed(1) }}</div>
                  </div>
                </div>
                <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-6 flex items-center justify-center min-w-[350px]">
                  <h4 class="absolute top-4 left-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Grafiek (Hyperbool) — {{ currentLevel ? currentLevel.label : '' }}</h4>
                  <svg width="300" height="300" viewBox="0 0 300 300" class="mt-8">
                    <g stroke="#e2e8f0" stroke-width="1">
                      <line v-for="(tick, i) in graphConfig.xTicks" :key="'vg'+i" :x1="20 + tick * graphConfig.xScale" y1="20" :x2="20 + tick * graphConfig.xScale" y2="280" />
                      <line v-for="(tick, i) in graphConfig.yTicks" :key="'hg'+i" x1="20" :y1="280 - tick * graphConfig.yScale" x2="280" :y2="280 - tick * graphConfig.yScale" />
                    </g>
                    <line x1="20" y1="280" x2="290" y2="280" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                    <line x1="20" y1="280" x2="20" y2="10" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                    <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><polygon points="0 0, 10 5, 0 10" fill="#475569" /></marker></defs>
                    <text x="280" y="295" font-weight="bold" fill="#64748b" font-size="10">x</text>
                    <text x="10" y="20" font-weight="bold" fill="#64748b" font-size="10">y</text>
                    <circle v-for="pt in history" :key="pt.x" :cx="20 + pt.x * graphConfig.xScale" :cy="280 - pt.y * graphConfig.yScale" r="4" fill="#f59e0b" class="animate-fadeIn" />
                    <circle :cx="20 + widthX * graphConfig.xScale" :cy="280 - heightY * graphConfig.yScale" r="6" fill="#d97706" stroke="white" stroke-width="2" class="transition-all duration-300 shadow-sm" />
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
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #f59e0b;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -13px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
input[type=range]:disabled::-webkit-slider-thumb { background: #10b981; }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; border-radius: 3px; }
</style>
