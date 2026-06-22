<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhTarget, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Reële Getallen: Constructie (Toepassen)' },
  instruction: {
    type: String,
    default: 'Irrationale getallen (zoals √2) kun je exact tekenen op een getallenas!<br/><br/>Bouw een rechthoekige driehoek met basis a en hoogte b zodat de schuine zijde de gevraagde lengte heeft.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stel de basis (a) en hoogte (b) in met de sliders.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionAnswer = ref('')
const predictionSubmitted = ref(false)
const showWorkedExample = ref(true)
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionSubmitted = ref(false)
const showLpdConfirm = ref(false)
const lpdConfirmed = ref(false)

// Bloom label for current level
const bloomLabels = ['(Toepassen)', '(Analyseren)', '(Evalueren)']

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Domain Logic
const baseA = ref(1)
const heightB = ref(1)
const step = ref(0)

const currentC2 = computed(() => baseA.value * baseA.value + heightB.value * heightB.value)
const currentC = computed(() => Math.sqrt(currentC2.value))

const levels = [
  {
    goalText: 'Opdracht 1: Construeer exact √5 op de as. (Toepassen)',
    targetC2: 5,
    predictionQuestion: 'Als a=1 en b=2, wat is dan a² + b²?',
    predictionCorrect: '5',
    predictionExplanation: 'a² + b² = 1² + 2² = 1 + 4 = 5. De schuine zijde is dus √5.',
    workedExample: {
      title: 'Voorbeeld: √5 construeren op de getallenas',
      steps: [
        'Kies basis a = 1 en hoogte b = 2.',
        'Bereken a² + b² = 1² + 2² = 1 + 4 = 5.',
        'De schuine zijde is √5. Klap deze neer op de as.'
      ],
      label: '√5 ≈ 2,236'
    },
    targetA: 1,
    targetB: 2,
    hintLevels: [
      'Denk aan Pythagoras: a² + b² = c². Het doel is c² = 5. Welke kwadraten sommeren tot 5? (1²=1, 2²=4, 3²=9, ...)',
      'Zoek twee getallen a en b waarvoor a² + b² = 5. Voorbeeld: 1² + 2² = 1 + 4 = 5. Probeer zelf a=1 te gebruiken.',
      'Probeer a = 1. Dan moet b² = 5 - 1 = 4, dus b = __. Schuif de slider naar b = __.'
    ],
    whyExplanation: 'Je kunt irrationale getallen zoals √5 exact construeren via de stelling van Pythagoras. De schuine zijde van een rechthoekige driehoek met a=1, b=2 heeft precies lengte √5 - geen benadering, maar exact.',
    errorPatterns: [
      { check: (a, b) => a + b === 3, zone: 'sum', message: 'Let op! a² + b² is niet hetzelfde als (a + b)². 1² + 2² = 1 + 4 = 5, maar (1+2)² = 3² = 9.' },
      { check: (a, b) => Math.abs(a * b - 5) < 0.1, zone: 'product', message: 'Let op! Je zoekt a² + b² = 5, niet a × b = 5. Bij a=1, b=2 is a² + b² = 1 + 4 = 5, maar a × b = 2.' }
    ],
    reflectionQuestion: 'Waarom is √5 irrationaal? Hoe bewijs je dat √2 irrationaal is?',
    reflectionAnswer: '√5 is irrationaal omdat het niet als een breuk te schrijven is. Voor √2 bewijs je dat als het wél een breuk zou zijn, die breuk oneindig te vereenvoudigen is - een contradictie. Dat heet een bewijs uit het ongerijmde.'
  },
  {
    goalText: 'Opdracht 2: Construeer exact √10 op de as. (Analyseren)',
    targetC2: 10,
    predictionQuestion: 'Het doel is c² = 10. Welk koppel (a, b) geeft a² + b² = 10?',
    predictionCorrect: 'a=1,b=3',
    predictionExplanation: '1² + 3² = 1 + 9 = 10. Je kunt ook a=3, b=1 gebruiken - volgorde maakt niet uit.',
    workedExample: {
      title: 'Voorbeeld: √10 construeren',
      steps: [
        'We zoeken a, b zodat a² + b² = 10.',
        'Mogelijke combinaties: 1² + 3² = 1 + 9 = 10 of √10² + 0² = 10 (maar dan is c niet irrationaal).',
        'Kies a=3, b=1 of a=1, b=3. De schuine zijde is √10.'
      ],
      label: 'a=1, b=3 of a=3, b=1'
    },
    targetA: 1,
    targetB: 3,
    hintLevels: [
      'Je zoekt a en b zodat a² + b² = 10. Welke kwadraten ken je: 1²=1, 2²=4, 3²=9, 4²=16... Welke twee sommeren tot 10?',
      'Voor √5 gebruikten we a=1, b=2 (want 1+4=5). Voor √10: welk tweetal kwadraten somt tot 10? Denk aan 1+9, 4+6(geen kwadraat), 9+1.',
      '1² + 3² = 1 + 9 = 10. Kies a = 1, b = __ of a = __, b = 1.'
    ],
    whyExplanation: '√10 kun je construeren via Pythagoras: 1² + 3² = 10, dus de schuine zijde is √10. De stelling van Pythagoras laat zien dat irrationale getallen meetkundig "echt" bestaan - je kunt ze tekenen!',
    errorPatterns: [
      { check: (a, b) => a === 2 && b === 2, zone: 'same', message: 'Let op! 2² + 2² = 4 + 4 = 8, niet 10. Je zoekt a² + b² = 10.' },
      { check: (a, b) => a === 2 && b === 3, zone: 'over', message: 'Let op! 2² + 3² = 4 + 9 = 13, dat is te groot. Je hebt precies a² + b² = 10 nodig.' }
    ],
    reflectionQuestion: 'Waarom kun je met a=3, b=1 dezelfde wortel construeren als met a=1, b=3? Wat zegt dat over de stelling van Pythagoras?',
    reflectionAnswer: 'Omdat optellen commutatief is: a² + b² = b² + a². De volgorde van a en b maakt voor de som niet uit. De driehoek is alleen gespiegeld.'
  },
  {
    goalText: 'Opdracht 3: Construeer exact √13 op de as. (Evalueren)',
    targetC2: 13,
    predictionQuestion: 'Je hoort dat √13 tussen 3 en 4 ligt. Welk koppel (a, b) geeft c² = 13?',
    predictionCorrect: 'a=2,b=3',
    predictionExplanation: '2² + 3² = 4 + 9 = 13. De schuine zijde is √13 ≈ 3,606 - inderdaad tussen 3 en 4.',
    workedExample: {
      title: 'Voorbeeld: √13 construeren',
      steps: [
        'We zoeken a, b zodat a² + b² = 13.',
        'Kwadraten: 1²=1, 2²=4, 3²=9, 4²=16. 13 ligt tussen 9 en 16, dus √13 tussen 3 en 4.',
        'Combinaties: 2² + 3² = 4 + 9 = 13. Kies a=2, b=3.'
      ],
      label: 'a=2, b=3, c=√13 ≈ 3,606'
    },
    targetA: 2,
    targetB: 3,
    hintLevels: [
      '√13 ligt tussen 3 en 4 (want 3²=9, 4²=16). Zoek a² + b² = 13. Welke twee kwadraten sommeren tot 13?',
      'Voor √5: 1²+2². Voor √10: 1²+3². Voor √13: 2²+3² = 4 + 9. Klopt dit?',
      'Probeer a = 2. Dan moet b² = 13 - 4 = 9, dus b = __. Schuif naar a=2, b=__.'
    ],
    whyExplanation: 'Elk positief getal c² dat je kunt schrijven als som van twee kwadraten geeft een irrationele of rationale schuine zijde. Pythagoras is de brug tussen rekenen en meetkunde die irrationale getallen "zichtbaar" maakt.',
    errorPatterns: [
      { check: (a, b) => a === 3 && b === 3, zone: 'same', message: 'Let op! 3² + 3² = 9 + 9 = 18, niet 13. Denk aan de kwadraten van 2, 3, 4: welke som is exact 13?' },
      { check: (a, b) => a === 1 && b === 4, zone: 'onefour', message: 'Let op! 1² + 4² = 1 + 16 = 17, dat is te groot. √17 ≈ 4,12, niet √13.' }
    ],
    reflectionQuestion: 'Hoe zou je √7 construeren? Bestaat er altijd een koppel (a,b) voor elke wortel? Welke wortels kun je niet zo construeren?',
    reflectionAnswer: 'Voor √7 zoek je a² + b² = 7. Er is geen combinatie van kwadraten die exact 7 geeft (behalve √7² + 0², maar dan is het niet-irrationaal). Sommige irrationale getallen kun je niet construeren met Pythagoras, zoals √7.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Computed slider style props
const sliderAStyle = computed(() => {
  return {}
})

const sliderBStyle = computed(() => {
  return {}
})

watch([baseA, heightB], () => {
  if (step.value === 2) return
  isChecked.value = false
  isCorrect.value = false
  step.value = 0
  feedback.value = { type: 'info', text: 'Stel de basis (a) en hoogte (b) in.' }
})

function checkTriangle() {
  isChecked.value = true
  const targetC2 = currentLevelData.value.targetC2
  const data = currentLevelData.value

  if (currentC2.value === targetC2) {
    isCorrect.value = true
    step.value = 1
    attemptCount.value = 0
    showWhy.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! ${baseA.value}² + ${heightB.value}² = ${baseA.value*baseA.value} + ${heightB.value*heightB.value} = ${targetC2}. De schuine zijde is exact √${targetC2}.`
    }
  } else {
    attemptCount.value++

    // Error analysis: check common misconceptions
    let errorFound = false
    for (const pattern of data.errorPatterns) {
      if (pattern.check(baseA.value, heightB.value)) {
        feedback.value = { type: 'error', text: pattern.message }
        errorFound = true
        break
      }
    }

    if (!errorFound) {
      if (currentC2.value < targetC2) {
        if (attemptCount.value <= 2) {
          feedback.value = {
            type: 'error',
            text: `a² + b² = ${currentC2.value}, dat is te klein. Je hebt ${targetC2} nodig. ` + hintLevelForAttempt(data)
          }
        } else {
          feedback.value = {
            type: 'error',
            text: `${currentC2.value} is nog te klein. ${targetC2} = ${data.targetA}² + ${data.targetB}² = ${data.targetA*data.targetA} + ${data.targetB*data.targetB}.`
          }
        }
      } else {
        if (attemptCount.value <= 2) {
          feedback.value = {
            type: 'error',
            text: `a² + b² = ${currentC2.value}, dat is te groot. Je hebt precies ${targetC2} nodig. ` + hintLevelForAttempt(data)
          }
        } else {
          const hintIdx = Math.min(hintCount.value + 1, 2)
          feedback.value = {
            type: 'error',
            text: `Nog niet juist. ${data.hintLevels[hintIdx]}`
          }
        }
      }
    }
  }
}

function hintLevelForAttempt(data) {
  const idx = Math.min(attemptCount.value - 1, 2)
  return data.hintLevels[idx] || ''
}

function dropToAxis() {
  if (step.value !== 1) return
  step.value = 2
  feedback.value = {
    type: 'success',
    text: `Het irrationale getal √${currentLevelData.value.targetC2} ligt nu exact op de getallenas!`
  }
}

// Prediction gate
function submitPrediction() {
  if (predictionAnswer.value.trim()) {
    predictionSubmitted.value = true
    const data = currentLevelData.value
    const isPredCorrect = predictionAnswer.value.trim() === data.predictionCorrect
    if (isPredCorrect) {
      feedback.value = {
        type: 'success',
        text: `Juist! ${data.predictionExplanation}`
      }
    } else {
      feedback.value = {
        type: 'info',
        text: `Bijna, maar niet helemaal. ${data.predictionExplanation}`
      }
    }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Stel de basis (a) en hoogte (b) in met de sliders.' }
}

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: `Hint ${idx + 1}: ${data.hintLevels[idx]}` }
    }
  }
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 3) {
    reflectionSubmitted.value = true
    showLpdConfirm.value = true
  }
}

function confirmLpd() {
  lpdConfirmed.value = true
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Stel de basis (a) en hoogte (b) in met de sliders.' }
  attemptCount.value = 0
  hintCount.value = 0
  step.value = 0
  baseA.value = 1
  heightB.value = 1
  showPrediction.value = true
  predictionAnswer.value = ''
  predictionSubmitted.value = false
  showWorkedExample.value = true
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
  showLpdConfirm.value = false
  lpdConfirmed.value = false
}

function handleNext() {
  if (showWhy.value && !showReflection.value) {
    showReflection.value = true
    return
  }
  if (showReflection.value && !reflectionSubmitted.value) {
    return
  }
  if (showLpdConfirm.value && !lpdConfirmed.value) {
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

// Lifecycle
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')"
         aria-label="Achtergrond sluiten">
    </div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">
                Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}
              </p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'">
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="animate-fadeIn">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-amber-600 uppercase">Voorspelling</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-4">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="font-bold text-slate-800 text-base mb-2">
                      {{ currentLevelData.predictionQuestion }}
                    </p>
                    <p class="text-xs text-slate-500 italic">
                      Denk eerst na voor je antwoordt.
                    </p>
                  </div>
                </div>
                <input v-model="predictionAnswer"
                       placeholder="Typ je antwoord..."
                       @keydown.enter="submitPrediction"
                       class="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 text-slate-800 text-lg font-mono text-center">
                <button @click="submitPrediction"
                        :disabled="!predictionAnswer.trim()"
                        class="mt-3 w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                  Bevestig Voorspelling
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && predictionSubmitted" class="animate-fadeIn">
              <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-indigo-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" />
                  Voorbeeld: {{ currentLevelData.workedExample.title }}
                </h4>
                <div class="space-y-2 mb-3">
                  <div v-for="(step, i) in currentLevelData.workedExample.steps" :key="i"
                       class="flex items-start gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {{ i + 1 }}
                    </span>
                    <span class="text-sm text-slate-700">{{ step }}</span>
                  </div>
                </div>
                <div class="p-2 bg-indigo-100 rounded-lg text-center font-bold text-indigo-800 font-mono text-sm">
                  {{ currentLevelData.workedExample.label }}
                </div>
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- MAIN ACTIVITY -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">
                Instructies
              </h3>
              <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

              <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
                <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
              </div>

              <!-- Hints button -->
              <button @click="showHint" :disabled="isCorrect"
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner flex flex-col gap-4">

                <div class="font-mono font-black text-xl text-slate-700 bg-white p-4 rounded-lg shadow-sm border-2 border-slate-200 text-center">
                  c = √(
                  <span class="text-blue-500">{{ baseA }}²</span>
                  +
                  <span class="text-fuchsia-500">{{ heightB }}²</span>
                  ) =
                  <span class="text-emerald-600">√{{ currentC2 }}</span>
                </div>

                <!-- Slider A -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-bold text-blue-700 flex justify-between">
                    <span>Basis (a)</span>
                    <span>{{ baseA }}</span>
                  </label>
                  <input type="range" min="1" max="5" step="1"
                         v-model.number="baseA" :disabled="step === 2"
                         class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500 slider-thumb" />
                </div>

                <!-- Slider B -->
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-bold text-fuchsia-600 flex justify-between">
                    <span>Hoogte (b)</span>
                    <span>{{ heightB }}</span>
                  </label>
                  <input type="range" min="1" max="5" step="1"
                         v-model.number="heightB" :disabled="step === 2"
                         class="w-full h-2 bg-fuchsia-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 slider-thumb" />
                </div>

              </div>

              <!-- Contextual Actions -->
              <div class="mt-4 flex flex-col gap-2">
                <button @click="checkTriangle" v-if="step === 0"
                        class="py-3 px-4 bg-amber-600 text-white font-bold rounded-lg shadow-sm hover:bg-amber-500 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500">
                  1. Valideer Driehoek
                </button>
                <button @click="dropToAxis" v-if="step === 1"
                        class="py-3 px-4 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse focus-visible:ring-2 focus-visible:ring-amber-500">
                  2. Klap Neer op de Getallenas
                  <PhArrowRight weight="bold" />
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-100 text-amber-800': feedback.type === 'info',
                   'bg-slate-100 text-slate-700': feedback.type === 'default'
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle"
                          class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy" class="p-3 mb-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <PhQuestion weight="fill" class="w-3 h-3" />
                Waarom werkt dit?
              </p>
              <p class="text-sm text-slate-700 leading-relaxed">
                {{ currentLevelData.whyExplanation }}
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-3 mb-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <PhChatCircleText weight="fill" class="w-3 h-3" />
                Reflectie
              </p>
              <p class="text-sm font-medium text-slate-800 mb-2">
                {{ currentLevelData.reflectionQuestion }}
              </p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionSubmitted"
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord...">
              </textarea>
              <button v-if="!reflectionSubmitted" @click="submitReflection"
                      class="mt-2 px-4 py-1.5 text-sm font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig
              </button>
              <p v-if="reflectionSubmitted" class="text-xs text-slate-500 mt-1 italic">
                Goed nagedacht!
              </p>
            </div>

            <!-- LPD CONFIRMATION -->
            <div v-if="showLpdConfirm && !lpdConfirmed" class="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <PhTarget weight="fill" class="w-3 h-3" />
                LPD Doelbereiking
              </p>
              <p class="text-sm text-slate-700 mb-2">
                Ik begrijp nu hoe je irrationale getallen exact kunt construeren via de stelling van Pythagoras.
              </p>
              <button @click="confirmLpd"
                      class="w-full py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Ja, ik heb dit doel bereikt
              </button>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhArrowClockwise />
              </button>
              <button v-if="!isCorrect && !showPrediction && !showWorkedExample" disabled
                      class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60 text-sm">
                Vind de juiste (a, b) combinatie
              </button>
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 text-sm">
                <span v-if="showWhy && !showReflection">Waarom? Bekijk uitleg</span>
                <span v-else-if="showReflection && !reflectionSubmitted">Reflecteer eerst</span>
                <span v-else-if="showLpdConfirm && !lpdConfirmed">Bevestig doelbereiking</span>
                <span v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right panel: SVG visualization -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="w-full max-w-3xl flex flex-col items-center animate-fadeIn">
              <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8 min-w-[600px] min-h-[450px]">
                <svg width="600" height="450" viewBox="0 0 600 450" class="block relative z-10">
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                      <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                    </marker>
                  </defs>
                  <g stroke="#f1f5f9" stroke-width="1">
                    <line v-for="i in 6" :key="'vg'+i"
                          :x1="100 + (i-1)*80" y1="50"
                          :x2="100 + (i-1)*80" y2="350" />
                    <line v-for="i in 6" :key="'hg'+i"
                          x1="100" :y1="350 - (i-1)*80"
                          x2="500" :y2="350 - (i-1)*80" />
                  </g>
                  <line x1="50" y1="350" x2="550" y2="350" stroke="#475569" stroke-width="4" marker-end="url(#arrow)" />
                  <g stroke="#475569" stroke-width="4">
                    <line v-for="i in 6" :key="'tk'+i"
                          :x1="100 + (i-1)*80" y1="340"
                          :x2="100 + (i-1)*80" y2="360" />
                  </g>
                  <g font-weight="900" font-size="20" fill="#334155" text-anchor="middle">
                    <text v-for="i in 6" :key="'lbl'+i" :x="100 + (i-1)*80" y="385">{{ i-1 }}</text>
                  </g>
                  <g stroke="#94a3b8" stroke-width="2">
                    <line v-for="i in 20" :key="'stk'+i"
                          :x1="100 + i*20" y1="345"
                          :x2="100 + i*20" y2="355" />
                  </g>
                  <g class="transition-all duration-300">
                    <polygon :points="`100,350 ${100 + baseA*80},350 ${100 + baseA*80},${350 - heightB*80}`"
                             fill="rgba(245, 158, 11, 0.1)" stroke="none" />
                    <line x1="100" y1="350" :x2="100 + baseA*80" y2="350"
                          stroke="#3b82f6" stroke-width="6" stroke-linecap="round" />
                    <text :x="100 + (baseA*80)/2" y="335" text-anchor="middle"
                          font-weight="bold" fill="#3b82f6" font-size="20">
                      {{ baseA }}
                    </text>
                    <line :x1="100 + baseA*80" y1="350" :x2="100 + baseA*80"
                          :y2="350 - heightB*80" stroke="#d946ef" stroke-width="6" stroke-linecap="round" />
                    <text :x="100 + baseA*80 + 15" :y="350 - (heightB*80)/2"
                          font-weight="bold" fill="#d946ef" font-size="20">
                      {{ heightB }}
                    </text>
                    <polyline :points="`${100 + baseA*80 - 15},350 ${100 + baseA*80 - 15},335 ${100 + baseA*80},335`"
                              fill="none" stroke="#64748b" stroke-width="2" />
                  </g>
                  <g class="transition-all duration-300">
                    <line x1="100" y1="350" :x2="100 + baseA*80"
                          :y2="350 - heightB*80" stroke="#10b981" stroke-width="6" stroke-linecap="round" />
                    <text :x="100 + (baseA*80)/2 - 15"
                          :y="350 - (heightB*80)/2 - 15"
                          font-weight="900" font-size="24" fill="#10b981"
                          v-if="step > 0"
                          :transform="`rotate(${-Math.atan2(heightB, baseA) * (180/Math.PI)} ${100 + (baseA*80)/2} ${350 - (heightB*80)/2})`">
                      √{{ currentC2 }}
                    </text>
                  </g>
                  <g v-if="step === 2"
                     class="animate-drop"
                     :style="`transform-origin: 100px 350px; --start-angle: ${-Math.atan2(heightB, baseA) * (180/Math.PI)}deg;`">
                    <line x1="100" y1="350" :x2="100 + currentC*80"
                          y2="350" stroke="#10b981" stroke-width="6" stroke-linecap="round" />
                    <circle :cx="100 + currentC*80" cy="350" r="8"
                            fill="#10b981" stroke="white" stroke-width="3" />
                    <text :x="100 + (currentC*80)/2" y="335"
                          font-weight="900" font-size="20" fill="#10b981" text-anchor="middle">
                      √{{ currentC2 }} ≈ {{ currentC.toFixed(2) }}
                    </text>
                  </g>
                  <path v-if="step === 2"
                        :d="`M ${100 + baseA*80} ${350 - heightB*80} A ${currentC*80} ${currentC*80} 0 0 1 ${100 + currentC*80} 350`"
                        fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="10 5" class="animate-fadeIn"
                        style="animation-delay: 0.5s" />
                </svg>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showWhy"
                    @done="celebrationDone = true"
                    :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
}

.animate-fadeIn {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-drop {
    animation: dropArc 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes dropArc {
    0% { transform: rotate(var(--start-angle)); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: rotate(0deg); opacity: 1; }
}

.slider-thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    border: 4px solid white;
    cursor: pointer;
    margin-top: -9px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.slider-thumb::-moz-range-thumb {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    border: 4px solid white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
