<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhChartBar,
  PhArrowClockwise,
  PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Soorten Diagrammen'
  },
  instruction: {
    type: String,
    default: 'Kies voor elke dataset het juiste diagramtype.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const currentInternalLevel = ref(0)
const totalInternalLevels = 5

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionChecked = ref(false)
const showWhy = ref(false)
const whyText = ref('')
const errorDetected = ref('')
const showPrediction = ref(true)
const predictedType = ref('')
const showData = ref(false)
const showWorkedExample = ref(true)

const options = [
  'Staafdiagram',
  'Cirkeldiagram',
  'Histogram',
  'Lijndiagram',
  'Spreidingsdiagram'
]

const hintLevels = [
  'Bedenk of de data categorisch, continu of discreet is. Kijk naar het type variabele.',
  'Voorbeeld: "Favoriete kleur" is categorisch. "Lengte in cm" is continu. "Aantal kinderen" is discreet.',
  'Kijk naar het gegevenstype: categorieën = staaf/cirkel, trends over tijd = lijn, verband = spreiding, groepen = histogram.'
]

const levels = [
  {
    id: 1,
    context: 'Je onderzoekt de scores per leerling per vak (wiskunde, Nederlands, Engels).',
    predictionPrompt: 'Je hoort: "Ik ga de scores van 20 leerlingen vergelijken per vak." Welk diagram gebruik je?',
    data: 'Leerling A: wiskunde=72, Nederlands=68, Engels=85\nLeerling B: wiskunde=91, Nederlands=74, Engels=79',
    correctAnswer: 'Staafdiagram',
    whyExplanation: 'Een staafdiagram vergelijkt categorieën (vakken). Elke staaf toont een duidelijke, aparte categorie. Omdat de vakken losse categorieën zijn (geen doorlopende getallen), is een staafdiagram ideaal. Een lijndiagram suggereert een verloop tussen de punten, maar dat is er niet tussen wiskunde en Nederlands.',
    errorAnalysis: {
      'Lijndiagram': 'Een lijndiagram is voor trends over een continue schaal (bv. tijd). Wiskunde en Nederlands zijn losse categorieën, geen continue waarden.',
      'Histogram': 'Een histogram is voor gegroepeerde continue data. Vakken zijn geen continue getallen.',
      'Cirkeldiagram': 'Een cirkeldiagram toont delen van een geheel. Hier vergelijk je scores, geen samenstelling van een totaal.',
      'Spreidingsdiagram': 'Een spreidingsdiagram toont verband tussen twee variabelen. Hier is maar een variabele (score per vak).'
    },
    workedExample: {
      scenario: 'Je hebt de gemiddelde temperatuur per maand (januari t/m december).',
      solution: 'Lijndiagram — de maanden volgen een continue volgorde (tijd). Een lijn toont de trend.',
      why: 'Lijndiagrammen zijn perfect voor tijdreeksen omdat de punten een natuurlijke volgorde hebben en je trends wilt zien (stijgen/dalen).'
    }
  },
  {
    id: 2,
    context: 'Een marktonderzoek naar de verdeling van €500 uitgaven over 5 categorieën.',
    predictionPrompt: 'Je hoort: "Ik wil zien welk deel van het budget naar elke categorie gaat." Welk diagram?',
    data: 'Huur: €200, Eten: €150, Vervoer: €75, Ontspanning: €50, Overig: €25',
    correctAnswer: 'Cirkeldiagram',
    whyExplanation: 'Een cirkeldiagram toont de samenstelling van een geheel. Elke sector is een deel (percentage) van de total €500. Als je wilt weten "hoeveel procent gaat naar huur?" is een cirkeldiagram het duidelijkst.',
    errorAnalysis: {
      'Staafdiagram': 'Een staafdiagram kan ook, maar een cirkeldiagram toont beter de verhouding tot het geheel. Bij 5 of minder categorieën is een cirkel uitstekend.',
      'Histogram': 'Histogrammen zijn voor continue data ingedeeld in klassen. Uitgavecategorieën zijn geen continue getallen.',
      'Lijndiagram': 'Lijndiagrammen zijn voor trends. Dit is een momentopname van de verdeling.',
      'Spreidingsdiagram': 'Spreidingsdiagrammen tonen verbanden tussen twee variabelen, niet de samenstelling van een totaal.'
    }
  },
  {
    id: 3,
    context: 'Een sportcoach meet de rustpols van 30 sporters, ingedeeld in categorieën: 40-50, 50-60, 60-70, 70-80, 80-100 slagen/min.',
    predictionPrompt: 'Je hoort: "Ik wil zien hoe de rustpols verdeeld is over de groep." Welk diagram?',
    data: '40-50 sl/min: 2 sporters\n50-60 sl/min: 8 sporters\n60-70 sl/min: 12 sporters\n70-80 sl/min: 5 sporters\n80-100 sl/min: 3 sporters',
    correctAnswer: 'Histogram',
    whyExplanation: 'Een histogram groepeert continue data in klassen (bv. 50-60 slagen/min). De staven raken elkaar omdat de klassen aansluitend zijn. Het toont de verdeling: waar liggen de meeste waarden?',
    errorAnalysis: {
      'Staafdiagram': 'Staafdiagrammen zijn voor losse categorieën, niet voor gegroepeerde continue data. De staven mogen elkaar niet raken.',
      'Cirkeldiagram': 'Bij 5 of meer klassen wordt een cirkeldiagram onoverzichtelijk. Een histogram toont de vorm van de verdeling beter.',
      'Lijndiagram': 'Een lijndiagram suggereert dat de waarden tussen de klassen een betekenis hebben, maar dat is niet zo.',
      'Spreidingsdiagram': 'Spreidingsdiagrammen zijn voor het verband tussen twee variabelen, niet voor een frequentieverdeling.'
    }
  },
  {
    id: 4,
    context: 'Een school registreert het aantal leerlingen per jaar: 2019: 850, 2020: 920, 2021: 980, 2022: 1010, 2023: 1050.',
    predictionPrompt: 'Je hoort: "Ik wil de groei van het leerlingenaantal over de jaren laten zien." Welk diagram?',
    data: '2019: 850 | 2020: 920 | 2021: 980 | 2022: 1010 | 2023: 1050',
    correctAnswer: 'Lijndiagram',
    whyExplanation: 'Een lijndiagram toont verandering over een continue as (tijd). De stijgende lijn maakt de groei direct zichtbaar. Je ziet meteen dat het aantal elk jaar stijgt, en hoe snel.',
    errorAnalysis: {
      'Staafdiagram': 'Een staafdiagram toont aparte categorieën. Jaren hebben een natuurlijke volgorde — een lijn toont de trend beter.',
      'Cirkeldiagram': 'Een cirkeldiagram toont delen van een geheel op een moment. Hier gaat het om verandering over de tijd.',
      'Histogram': 'Een histogram toont frequentie van een variabele, niet verandering over de tijd.',
      'Spreidingsdiagram': 'Spreidingsdiagrammen zijn voor het verband tussen twee variabelen. Hier is maar een variabele (aantal) over de tijd.'
    }
  },
  {
    id: 5,
    context: 'Een onderzoek naar het verband tussen studietijd (uren/week) en examenscore (%).',
    predictionPrompt: 'Je hoort: "Ik wil zien of er een verband is tussen studietijd en score." Welk diagram?',
    data: '2u → 45%, 4u → 55%, 5u → 62%, 6u → 70%, 8u → 78%, 10u → 85%, 12u → 88%',
    correctAnswer: 'Spreidingsdiagram',
    whyExplanation: 'Een spreidingsdiagram toont het verband tussen twee numerieke variabelen. Elke punt = een student (studietijd, score). Je ziet meteen of er een verband is (ja, positief) en hoe sterk.',
    errorAnalysis: {
      'Lijndiagram': 'Een lijndiagram verbindt de punten alsof de x-waarden een vaste volgorde hebben. Bij verbanden toon je net de spreiding, niet een lijn.',
      'Staafdiagram': 'Staafdiagrammen zijn voor aparte categorieën. Studietijd is een continue variabele.',
      'Histogram': 'Een histogram toont de verdeling van een variabele, niet het verband tussen twee variabelen.',
      'Cirkeldiagram': 'Een cirkeldiagram toont delen van een geheel. Hier gaat het om een verband tussen twee variabelen.'
    }
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

function resetActivityState() {
  currentInternalLevel.value = 0
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedType.value = ''
  showData.value = false
  showWorkedExample.value = true
}

function commitPrediction() {
  if (!predictedType.value) return
  showPrediction.value = false
  showData.value = true
  feedback.value = { type: 'info', text: `Jouw voorspelling: ${predictedType.value}. Bekijk nu de data en controleer.` }
}

function selectAnswer(answer) {
  if (isCorrect.value || showPrediction.value) return
  attemptCount.value++

  if (answer === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    errorDetected.value = ''
    showWhy.value = true
    whyText.value = currentLevel.value.whyExplanation
    const matched = attemptCount.value === 1 ? 'direct' : 'na enkele pogingen'
    feedback.value = {
      type: 'success',
      text: `Correct ${matched}! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    const errorFeedback = currentLevel.value.errorAnalysis[answer]
    if (errorFeedback) {
      errorDetected.value = errorFeedback
      feedback.value = { type: 'error', text: errorFeedback }
    } else if (attemptCount.value < 3) {
      errorDetected.value = 'Denk na: is de data categorisch, continu, discreet, of gaat het over tijd of een verband?'
      feedback.value = { type: 'error', text: 'Dat is niet het beste diagram voor deze data. Denk aan wat voor soort variabele je hebt (categorisch, continu, discreet, tijd, verband).' }
    } else {
      errorDetected.value = `Het juiste diagram is ${currentLevel.value.correctAnswer}. Kijk naar het datatype.`
      feedback.value = { type: 'error', text: `Het juiste diagram is: ${currentLevel.value.correctAnswer}. Bekijk de uitleg waarom.` }
    }
    hintCount.value++
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Wat maakt dit diagramtype geschikt voor deze data?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Goede reflectie! Dit helpt je het juiste diagram te kiezen in de toekomst.' }
}

function handleNext() {
  if (showReflection.value && !reflectionChecked.value) {
    feedback.value = { type: 'error', text: 'Beantwoord eerst de reflectievraag voor je verder gaat.' }
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    isCorrect.value = false
    celebrationDone.value = false
    feedback.value = { type: 'info', text: '' }
    attemptCount.value = 0
    hintCount.value = 0
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionChecked.value = false
    showPrediction.value = true
    predictedType.value = ''
    showData.value = false
    showWhy.value = false
    whyText.value = ''
    errorDetected.value = ''
    showWorkedExample.value = currentInternalLevel.value > 0
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
  if (isCorrect.value || !currentLevel.value) return
  const idx = Math.min(hintCount.value, hintLevels.length - 1)
  hintCount.value++
  if (idx >= 0 && idx < hintLevels.length) {
    feedback.value = { type: 'info', text: hintLevels[idx] }
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
  predictedType.value = ''
  showData.value = false
  showWhy.value = false
  whyText.value = ''
  errorDetected.value = ''
  nextTick(() => mainArea.value?.focus())
}

watch(() => props.isOpen, (val) => {
  if (val) {
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
            <p class="text-xs font-medium text-slate-500">Vraag {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
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
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Diagram Kiezen</h3>
          <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorbeeld</p>
            <p class="text-xs text-amber-700 mb-2"><strong>Scenario:</strong> Je hebt de scores per leerling per vak. Welk diagram?</p>
            <p class="text-xs text-amber-700 mb-2"><strong>Data:</strong> Leerling A: wiskunde=72, Nederlands=68, Engels=85</p>
            <p class="text-xs text-amber-700 font-bold">Antwoord: Staafdiagram</p>
            <p class="text-xs text-amber-700 mt-1">Waarom? Een staafdiagram vergelijkt categorieën. Vakken zijn losse categorieën, dus staven zijn ideaal. Lijndiagram zou een verband suggereren waar dat niet is.</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-4">{{ currentLevel.predictionPrompt }}</p>
            <div class="flex flex-col gap-2 mb-4">
              <button v-for="opt in options" :key="opt"
                      @click="predictedType = opt"
                      class="p-3 text-sm rounded-lg transition-all border-2 text-left"
                      :class="predictedType === opt ? 'border-amber-500 bg-amber-100 text-amber-800 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                {{ opt }}
              </button>
            </div>
            <button @click="commitPrediction"
                    :disabled="!predictedType"
                    class="w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Voorspelling
            </button>
          </div>

          <!-- Data + Answer Selection -->
          <div v-if="showData" class="space-y-4">
            <div class="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 mb-2">Context:</p>
              <p class="text-sm text-slate-600">{{ currentLevel.context }}</p>
              <div class="mt-3 bg-white p-3 border border-slate-200 rounded-lg">
                <p class="font-mono text-sm whitespace-pre-line text-slate-700">{{ currentLevel.data }}</p>
              </div>
              <div class="mt-2 p-2 bg-amber-50 rounded-lg">
                <p class="text-xs text-amber-700">Jouw voorspelling: <strong>{{ predictedType }}</strong></p>
              </div>
            </div>

            <div>
              <p class="font-bold text-slate-700 mb-2">Kies het juiste diagram:</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in options" :key="opt"
                        @click="selectAnswer(opt)"
                        :disabled="isCorrect || showPrediction"
                        class="p-4 border-2 rounded-lg font-bold transition-all text-left active:scale-[0.98]"
                        :class="isCorrect && opt === currentLevel.correctAnswer ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  {{ opt }}
                  <span v-if="isCorrect && opt === currentLevel.correctAnswer" class="ml-2 text-amber-600">&#10003;</span>
                </button>
              </div>
            </div>

            <!-- Error Analysis -->
            <div v-if="errorDetected && !isCorrect" class="p-4 border border-red-200 bg-red-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-red-800 mb-1">
                <PhWarningCircle weight="fill" class="w-4 h-4" />
                Let op!
              </h4>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <!-- Why Explanation -->
            <div v-if="showWhy && isCorrect" class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt dit?</p>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">Waarom is <strong>{{ currentLevel.correctAnswer }}</strong> beter dan de andere opties voor deze data?</p>
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

            <button v-if="!isCorrect && !showPrediction"
                    @click="showHint"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98]">
              Hint nodig?
            </button>

            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgende Vraag' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">
            <!-- Visual examples of chart types -->
            <div class="flex flex-col gap-6">
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-end gap-2 h-32 w-48 relative overflow-hidden">
                <div class="w-8 bg-amber-400 rounded-t h-16 mx-auto"></div>
                <div class="w-8 bg-amber-500 rounded-t h-24 mx-auto"></div>
                <div class="w-8 bg-amber-600 rounded-t h-12 mx-auto"></div>
                <div class="absolute bottom-1 left-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Staafdiagram</div>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-end h-32 w-48 relative overflow-hidden">
                <div class="flex-1 bg-amber-400 h-10 border-r border-white"></div>
                <div class="flex-1 bg-amber-500 h-20 border-r border-white"></div>
                <div class="flex-1 bg-amber-500 h-24 border-r border-white"></div>
                <div class="flex-1 bg-amber-500 h-16 border-r border-white"></div>
                <div class="flex-1 bg-amber-400 h-8"></div>
                <div class="absolute bottom-1 left-2 text-xs font-bold text-slate-400 uppercase tracking-widest z-10">Histogram</div>
              </div>
            </div>
            <div class="flex flex-col gap-6">
              <div class="bg-white p-8 rounded-xl shadow-md border border-slate-200 flex items-center justify-center relative overflow-hidden h-48 w-48">
                <svg viewBox="0 0 32 32" class="w-36 h-36 rounded-full transform -rotate-90">
                  <circle r="16" cx="16" cy="16" fill="#fbbf24" stroke="white" stroke-width="1" stroke-dasharray="100 100" />
                  <circle r="16" cx="16" cy="16" fill="#fcd34d" stroke="white" stroke-width="1" stroke-dasharray="60 100" />
                  <circle r="16" cx="16" cy="16" fill="#fde68a" stroke="white" stroke-width="1" stroke-dasharray="20 100" />
                </svg>
                <div class="absolute bottom-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Cirkeldiagram</div>
              </div>
              <div class="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-center h-32 w-48 relative">
                <svg width="120" height="60" viewBox="0 0 120 60">
                  <polyline fill="none" stroke="#d97706" stroke-width="2" points="10,50 30,40 50,35 70,25 90,20 110,15" />
                </svg>
                <div class="absolute bottom-1 left-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Lijndiagram</div>
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
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
