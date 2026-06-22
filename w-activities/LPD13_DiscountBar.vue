<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPercent, PhArrowClockwise, PhScissors,
  PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten: De Korting' },
  instruction: {
    type: String,
    default: 'Met het strokenmodel (Bar Model) zie je procenten heel duidelijk voor je.<br/><br/><strong>Opdracht:</strong> Gebruik het model om de korting te visualiseren. Verwijder de juiste blokjes korting door op de schaar te klikken. Bereken daarna de nieuwe prijs.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhPercent }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de korting af te knippen.' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedAmount = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const hintCount = ref(0)
const errorDetected = ref('')
const lpdConfirmed = ref(false)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const levels = ref([])

function generateLevel() {
  const newLevels = []
  for (let lvl = 0; lvl < 3; lvl++) {
    let originalPrice, discountPercent, exactAns, pricePerBlock, discountBlocks, remainingBlocks
    const blocksTotal = 10
    if (lvl === 0) {
      discountPercent = [10, 20, 30][Math.floor(Math.random() * 3)]
      originalPrice = [40, 50, 60, 80, 90, 100][Math.floor(Math.random() * 6)]
    } else if (lvl === 1) {
      discountPercent = [20, 30, 40][Math.floor(Math.random() * 3)]
      originalPrice = [80, 100, 120, 150, 180, 200][Math.floor(Math.random() * 6)]
    } else {
      discountPercent = [30, 40, 50][Math.floor(Math.random() * 3)]
      originalPrice = [50, 80, 100, 120, 150, 250][Math.floor(Math.random() * 6)]
    }
    discountBlocks = discountPercent / 10
    remainingBlocks = blocksTotal - discountBlocks
    pricePerBlock = originalPrice / blocksTotal
    exactAns = remainingBlocks * pricePerBlock
    newLevels.push({
      goalText: `Opdracht ${lvl + 1}: ${discountPercent}% korting op €${originalPrice}`,
      originalPrice,
      discountPercent,
      exactAns,
      pricePerBlock,
      discountBlocks,
      remainingBlocks
    })
  }
  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const blocksTotal = 10

const discountApplied = ref(false)
const userAns = ref(null)

const pricePerBlock = computed(() => currentLevelData.value ? currentLevelData.value.originalPrice / blocksTotal : 0)
const discountBlocks = computed(() => currentLevelData.value ? currentLevelData.value.discountPercent / 10 : 0)
const remainingBlocks = computed(() => blocksTotal - discountBlocks.value)

function applyDiscount() {
    discountApplied.value = true
}

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    originalPrice: 60,
    discountPercent: 20,
    steps: [
      'Een broek kost €60. Je krijgt 20% korting.',
      '100% = €60. 1 blokje van 10% = €60 ÷ 10 = €6.',
      '20% korting = 2 blokjes × €6 = €12 korting.',
      'Je betaalt 80% = 8 blokjes × €6 = €48.'
    ],
    answer: 48
  }
]

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: hoeveel moet je betalen na de korting?' }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (predictedAmount.value === null || predictedAmount.value === undefined) return
  const data = currentLevelData.value
  const halfWay = data.originalPrice * ((100 - data.discountPercent * 0.5) / 100)
  if (Math.abs(predictedAmount.value - halfWay) <= data.originalPrice * 0.15) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Goed ingeschat! Laten we het nu exact berekenen met de bar model.' }
  } else {
    attemptCount.value++
    const hints = [
      'Je betaalt minder dan de helft. Denk aan het percentage dat overblijft.',
      `${100 - data.discountPercent}% van de prijs blijf je betalen. Wat is dat ongeveer?`,
      `Probeer: 100% = €${data.originalPrice}, je betaalt ${100 - data.discountPercent}%. Wat is dat ongeveer?`
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
    `Het strokenmodel helpt. 100% = €${data.originalPrice}. Hoeveel is 1 blokje (10%)?`,
    `1 blokje (10%) = €${data.originalPrice} ÷ 10 = €${pricePerBlock.value}. Hoeveel blokjes zijn er nog over na het knippen?`,
    `${remainingBlocks.value} blokjes × €${pricePerBlock.value} per blokje = ... (vul zelf het antwoord in)`
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
function getErrorAnalysis(userValue) {
  const data = currentLevelData.value
  if (!data) return ''
  const discountAmount = pricePerBlock.value * discountBlocks.value

  if (userValue === discountAmount) {
    return 'Verwar korting met nieuwe prijs! €' + discountAmount + ' is de KORTING (de afgeknipte blokjes). De nieuwe prijs is wat je OVERHOUDT.'
  }
  if (userValue === pricePerBlock.value) {
    return 'Let op! €' + pricePerBlock.value + ' is de waarde van 1 blokje (10%). Je moet de totale resterende blokjes bij elkaar optellen.'
  }
  if (userValue === data.originalPrice - discountAmount / 2) {
    return 'Let op! Je hebt de helft van de korting eraf gehaald in plaats van het volledige percentage.'
  }
  if (userValue === data.originalPrice) {
    return 'Vergeet niet: er is korting! Je betaalt minder dan €' + data.originalPrice + '.'
  }
  return ''
}

function checkAnswer() {
  isChecked.value = true
  const data = currentLevelData.value

  if (userAns.value === data.exactAns) {
    if (discountApplied.value) {
      isCorrect.value = true
      hintCount.value = 0
      errorDetected.value = ''
      const whyTexts = [
        'Het strokenmodel verdeelt 100% in 10 gelijke blokjes van 10%. Als je bijvoorbeeld 20% korting krijgt, knip je 2 blokjes weg. 80% blijft over = 8 blokjes. De prijs is dan 8 × (prijs per blokje). Zo zie je procenten letterlijk voor je!',
        'Procenten zijn altijd een verhouding tot 100. In het strokenmodel wordt elke 10% één blokje. Hoe groter de korting, hoe meer blokjes verdwijnen. De nieuwe prijs is altijd (resterende blokjes) × (waarde per blokje).',
        'Dit model toont waarom procentrekenen werkt: 100% is het geheel, elk procentpunt is evenveel waard, en de korting is een deel dat je wegneemt. Het strokenmodel maakt de abstracte procenten concreet.'
      ]
      showWhyExplanation(whyTexts[currentInternalLevel.value])
      feedback.value = {
        type: 'success',
        text: `Super! Nieuwe prijs = €${data.exactAns}. LPD 13: Je berekent de prijs na korting met het strokenmodel.`
      }
    } else {
      attemptCount.value++
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `${data.exactAns} is correct, maar knip eerst de korting af in het visuele model!`}
      } else {
        feedback.value = { type: 'error', text: `Klik eerst op de schaar om ${data.discountPercent}% af te knippen.`}
      }
    }
  } else {
    attemptCount.value++
    const errorAnalysis = getErrorAnalysis(userAns.value)
    const discountAmount = pricePerBlock.value * discountBlocks.value

    if (errorAnalysis) {
      errorDetected.value = errorAnalysis
    }

    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: `Niet juist. Tel de resterende blokjes: ${remainingBlocks.value} × €${pricePerBlock.value}.`}
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: `Reken: ${remainingBlocks.value} × ${pricePerBlock.value} = ? Tip: het is minder dan €${data.originalPrice}.`}
    } else {
      feedback.value = { type: 'error', text: `${data.remainingBlocks} × ${pricePerBlock.value} = ${data.exactAns}.` }
    }
  }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

function removeStamp(item) {
    if (!isCorrect.value) {
        item.selectedUnit = null
        isChecked.value = false
    }
}

function resetActivityState() {
    generateLevel()
    isCorrect.value = false
    celebrationDone.value = false
    isChecked.value = false
    discountApplied.value = false
    userAns.value = null
    attemptCount.value = 0
    hintCount.value = 0
    errorDetected.value = ''
    showWhy.value = false
    whyText.value = ''
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionDone.value = false
    predictedAmount.value = null

    showWorkedExample.value = currentInternalLevel.value === 0
    showPrediction.value = currentInternalLevel.value >= 1

    if (currentInternalLevel.value >= 1) {
      feedback.value = { type: 'info', text: 'Voorspel eerst hoeveel je moet betalen.' }
    } else {
      feedback.value = { type: 'info', text: 'Klik op de knop om de korting af te knippen.' }
    }
}

function handleNext() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op wat je leerde over procenten met het strokenmodel.' }
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
  const hasModel = text.includes('blok') || text.includes('strook') || text.includes('model') || text.includes('10%')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if (hasModel && hasReason && text.length > 15) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekende reflectie! Het strokenmodel maakt procenten visueel.<br/><br/><strong>LPD 13 bewezen:</strong> Je begrijpt hoe procenten werken via het bar model.' }
  } else {
    attemptCount.value++
    const hints = [
      'Waarom helpt het strokenmodel om procenten te snappen? Wat zie je aan de blokjes?',
      'Leg uit hoe de blokjes de 100% voorstellen. Wat gebeurt er als je korting krijgt?',
      'Denk aan de relatie: 1 blokje = 10%. Hoe helpt dit om de nieuwe prijs te vinden?'
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

            <!-- Worked Example (I do) — level 0 only -->
            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">{{ workedExamples[0].discountPercent }}% korting op €{{ workedExamples[0].originalPrice }}</p>
              <div class="space-y-1.5 text-sm text-slate-700">
                <div v-for="(step, si) in workedExamples[0].steps" :key="si" class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="mt-2 p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                Nieuwe prijs: €{{ workedExamples[0].answer }}
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- Prediction Gate (we do) — levels 1+ -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Hoeveel moet je ongeveer betalen na {{ currentLevelData.discountPercent }}% korting?</p>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-600 text-lg">€</span>
                <input v-model.number="predictedAmount" type="number" inputmode="decimal" placeholder="?"
                  class="w-24 p-2 text-center font-bold text-xl border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none tabular-nums" />
              </div>
              <button v-if="predictedAmount !== null && predictedAmount !== undefined && predictedAmount !== ''" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- Input Area — after prediction passed -->
            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 mt-2 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-3">
                 <p class="font-bold text-amber-800 text-sm">{{ currentLevelData.goalText }}</p>
               </div>
               <label class="block text-sm font-bold text-slate-700 mb-2">Nieuwe Prijs:</label>
               <div class="flex items-center gap-2">
                   <span class="font-black text-2xl text-slate-500">€</span>
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border-2 border-slate-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white outline-none" />
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

            <!-- Error analysis notice -->
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
              <p class="text-sm text-slate-700 mb-3">Waarom helpt het strokenmodel om procenten en kortingen te begrijpen? Hoe zie je aan de blokjes wat je moet betalen? Leg uit.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Het strokenmodel verdeelt 100% in 10 blokjes..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM CONTROLS -->
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

        <!-- RIGHT CONTENT PANEL — Bar Model -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl relative">

                  <div class="absolute -top-10 left-0 w-full flex flex-col items-center">
                      <div class="w-full h-4 border-t-2 border-x-2 border-slate-400 rounded-t-lg mb-1 relative">
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-xl text-slate-700 tabular-nums">100% = €{{ currentLevelData ? currentLevelData.originalPrice : 0 }}</span>
                      </div>
                  </div>

                  <div class="flex h-24 border-4 border-slate-700 rounded-xl shadow-md bg-white relative overflow-hidden mt-8">
                      <div v-for="i in blocksTotal" :key="'block'+i" class="flex-1 border-r-2 border-slate-300 last:border-r-0 relative transition-all duration-700"
                           :class="i > remainingBlocks && discountApplied ? 'bg-red-100 translate-y-full opacity-0' : 'bg-blue-500'">

                          <div class="absolute inset-0 flex flex-col items-center justify-center">
                              <span class="font-bold text-white/80 text-sm">10%</span>
                          </div>

                      </div>
                  </div>

                  <div v-if="discountApplied" class="absolute -bottom-16 left-0 flex flex-col items-center animate-fadeIn"
                       :style="{ width: `${remainingBlocks * 10}%` }">
                      <div class="w-full h-4 border-b-2 border-x-2 border-emerald-600 rounded-b-lg mt-1 relative">
                          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-lg text-emerald-600 whitespace-nowrap">{{ remainingBlocks * 10 }}% = Nieuwe Prijs</span>
                      </div>
                  </div>

                  <div v-if="discountApplied" class="absolute -bottom-16 right-0 flex flex-col items-center animate-fadeIn"
                       :style="{ width: `${discountBlocks * 10}%` }">
                      <div class="w-full h-4 border-b-2 border-x-2 border-red-500 rounded-b-lg mt-1 relative">
                          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-lg text-red-600 whitespace-nowrap">{{ currentLevelData ? currentLevelData.discountPercent : 0 }}% = Korting</span>
                      </div>
                  </div>

                  <button v-if="!discountApplied"
                          @click="applyDiscount"
                          class="absolute -bottom-16 bg-white border-2 border-red-500 text-red-600 font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :style="{ left: `${(blocksTotal - discountBlocks / 2) * 10}%`, transform: 'translateX(-50%)' }">
                      <PhScissors weight="fill" class="w-6 h-6" /> Knip {{ currentLevelData ? currentLevelData.discountPercent : 0 }}% af
                  </button>

                  <div v-if="!discountApplied" class="absolute top-0 bottom-0 w-1 bg-red-500 border-x border-white/50 border-dashed pointer-events-none"
                       :style="{ right: `${discountBlocks * 10}%` }"></div>

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
</style>
