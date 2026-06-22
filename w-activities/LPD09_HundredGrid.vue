<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise, PhPaintBrush,
  PhLightbulb, PhQuestion, PhTarget, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten op het Honderdveld (Toepassen)' },
  instruction: {
    type: String,
    default: 'Breuken, kommagetallen en procenten zijn 3 talen voor hetzelfde getal.<br/><br/><strong>Opdracht:</strong> Kleur exact het gevraagde aantal hokjes in op het 10×10 rooster. Vul daarna het kommagetal en percentage in.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de blokjes om ze te kleuren, of sleep om er meerdere tegelijk te kleuren.' })
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

// Bloom labels
const bloomLabels = ['(Toepassen)', '(Analyseren)', '(Evalueren)']

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const levelPools = [
  // Level 1: exact percentages (whole numbers)
  [
    { fractionDisplay: '1/2', targetSquares: 50, targetDecimal: 0.5, targetPercent: 50,
      hintSquare: 'De helft van 100 is 50. Kleur de helft van het rooster.' },
    { fractionDisplay: '1/5', targetSquares: 20, targetDecimal: 0.2, targetPercent: 20,
      hintSquare: '100 gedeeld door 5 = 20. Kleur 20 vakjes.' },
    { fractionDisplay: '3/4', targetSquares: 75, targetDecimal: 0.75, targetPercent: 75,
      hintSquare: '1/4 = 25, dus 3/4 = 75 vakjes.' },
    { fractionDisplay: '7/10', targetSquares: 70, targetDecimal: 0.7, targetPercent: 70,
      hintSquare: '1/10 = 10, dus 7/10 = 70 vakjes.' },
    { fractionDisplay: '3/5', targetSquares: 60, targetDecimal: 0.6, targetPercent: 60,
      hintSquare: '1/5 = 20, dus 3/5 = 60 vakjes.' },
    { fractionDisplay: '9/10', targetSquares: 90, targetDecimal: 0.9, targetPercent: 90,
      hintSquare: '1/10 = 10, dus 9/10 = 90 vakjes.' },
    { fractionDisplay: '2/5', targetSquares: 40, targetDecimal: 0.4, targetPercent: 40,
      hintSquare: '1/5 = 20, dus 2/5 = 40 vakjes.' },
    { fractionDisplay: '1/10', targetSquares: 10, targetDecimal: 0.1, targetPercent: 10,
      hintSquare: 'Hoeveel keer past 10 in 100? Kleur 1 volledige rij of kolom.' }
  ],
  // Level 2: decimal percentages
  [
    { fractionDisplay: '1/4', targetSquares: 25, targetDecimal: 0.25, targetPercent: 25,
      hintSquare: '1/4 van 100 = 25 vakjes.' },
    { fractionDisplay: '3/10', targetSquares: 30, targetDecimal: 0.3, targetPercent: 30,
      hintSquare: '1/10 = 10, dus 3/10 = 30 vakjes.' },
    { fractionDisplay: '4/5', targetSquares: 80, targetDecimal: 0.8, targetPercent: 80,
      hintSquare: '1/5 = 20, dus 4/5 = 80 vakjes.' },
    { fractionDisplay: '1/20', targetSquares: 5, targetDecimal: 0.05, targetPercent: 5,
      hintSquare: '100 / 20 = 5 vakjes.' },
    { fractionDisplay: '3/20', targetSquares: 15, targetDecimal: 0.15, targetPercent: 15,
      hintSquare: '1/20 = 5, dus 3/20 = 15 vakjes.' },
    { fractionDisplay: '7/20', targetSquares: 35, targetDecimal: 0.35, targetPercent: 35,
      hintSquare: '1/20 = 5, dus 7/20 = 35 vakjes.' },
    { fractionDisplay: '9/20', targetSquares: 45, targetDecimal: 0.45, targetPercent: 45,
      hintSquare: '1/20 = 5, dus 9/20 = 45 vakjes.' },
    { fractionDisplay: '19/20', targetSquares: 95, targetDecimal: 0.95, targetPercent: 95,
      hintSquare: '1/20 = 5, dus 19/20 = 95 vakjes. Bijna het hele rooster!' }
  ],
  // Level 3: fractional percentages
  [
    { fractionDisplay: '1/3', targetSquares: 33, targetDecimal: 0.33, targetPercent: 33,
      hintSquare: '1/3 van 100 ≈ 33,33. Rond af naar 33 vakjes.' },
    { fractionDisplay: '2/3', targetSquares: 67, targetDecimal: 0.67, targetPercent: 67,
      hintSquare: '2/3 van 100 ≈ 66,67. Rond af naar 67 vakjes.' },
    { fractionDisplay: '1/8', targetSquares: 13, targetDecimal: 0.13, targetPercent: 13,
      hintSquare: '1/8 van 100 = 12,5. Rond af naar 13 of 12?' },
    { fractionDisplay: '3/8', targetSquares: 38, targetDecimal: 0.38, targetPercent: 38,
      hintSquare: '3/8 van 100 = 37,5. Rond af naar 38 of 37?' },
    { fractionDisplay: '5/8', targetSquares: 63, targetDecimal: 0.63, targetPercent: 63,
      hintSquare: '5/8 van 100 = 62,5. Rond af naar 63 of 62?' },
    { fractionDisplay: '7/8', targetSquares: 88, targetDecimal: 0.88, targetPercent: 88,
      hintSquare: '7/8 van 100 = 87,5. Rond af naar 88 of 87?' },
    { fractionDisplay: '1/6', targetSquares: 17, targetDecimal: 0.17, targetPercent: 17,
      hintSquare: '1/6 van 100 ≈ 16,67. Rond af naar 17.' },
    { fractionDisplay: '5/6', targetSquares: 83, targetDecimal: 0.83, targetPercent: 83,
      hintSquare: '5/6 van 100 ≈ 83,33. Rond af naar 83.' }
  ]
]

function generateLevel() {
  const picked = levelPools.map(pool => {
    const shuffled = shuffle([...pool])
    return shuffled[0]
  })
  return picked.map((p, i) => ({
    goalText: 'Opdracht ' + (i + 1) + ': ' + p.fractionDisplay + ' ' + bloomLabels[i],
    fractionDisplay: p.fractionDisplay,
    targetSquares: p.targetSquares,
    targetDecimal: p.targetDecimal,
    targetPercent: p.targetPercent,
    hintSquare: p.hintSquare,
    hintLevels: [
      `Procent betekent "per honderd". Het honderdveld heeft 100 hokjes. Hoeveel hokjes moet je kleuren voor ${p.fractionDisplay}?`,
      `Voorbeeld: 1/2 = 50/100 = 50%. Voor ${p.fractionDisplay}: deel 100 door de noemer en vermenigvuldig met de teller.`,
      `${p.fractionDisplay} van 100 = (100 ÷ __) × __ = __ hokjes`
    ],
    errorPatterns: [
      { check: (count) => count === 50 && p.targetSquares !== 50, zone: 'half',
        message: 'Let op! Je hebt precies de helft gekleurd (50), maar dat klopt niet voor deze opdracht.' },
      { check: (count) => count === 100, zone: 'all',
        message: 'Let op! Je hebt het hele rooster gekleurd (100 hokjes). ' + p.fractionDisplay + ' is niet het hele rooster.' },
      { check: (count) => count === 0, zone: 'none',
        message: 'Je hebt nog niks gekleurd. Klik op de hokjes om ze te kleuren.' },
      { check: (count) => Math.abs(count - p.targetSquares) === 1, zone: 'offByOne',
        message: 'Bijna! Je zit er 1 naast. Tel nog eens goed het aantal gekleurde hokjes.' },
      { check: (count) => count > p.targetSquares && count < p.targetSquares + 5, zone: 'slightlyHigh',
        message: 'Je hebt iets te veel hokjes gekleurd. Het moeten er precies ' + p.targetSquares + ' zijn.' },
      { check: (count) => count < p.targetSquares && count > p.targetSquares - 5, zone: 'slightlyLow',
        message: 'Je hebt iets te weinig hokjes gekleurd. Het moeten er precies ' + p.targetSquares + ' zijn.' }
    ]
  }))
}

const levels = ref(generateLevel())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const grid = ref(Array(100).fill(false))
const userDecimal = ref('')
const userPercent = ref(null)

const coloredCount = computed(() => grid.value.filter(b => b).length)

// Drag to color logic
let isDragging = false
let dragMode = true

function startDrag(index) {
  if (isCorrect.value) return
  isDragging = true
  dragMode = !grid.value[index]
  grid.value[index] = dragMode
}

function onEnter(index) {
  if (isDragging && !isCorrect.value) {
    grid.value[index] = dragMode
  }
}

function endDrag() {
  isDragging = false
}

// Prediction gate
function submitPrediction() {
  if (predictionAnswer.value.trim()) {
    predictionSubmitted.value = true
    const data = currentLevelData.value
    const userAns = parseInt(predictionAnswer.value.trim())
    if (userAns === data.targetSquares) {
      feedback.value = {
        type: 'success',
        text: `Juist! ${data.fractionDisplay} van 100 = ${data.targetSquares} hokjes.`
      }
    } else {
      feedback.value = {
        type: 'info',
        text: `Niet helemaal. ${data.fractionDisplay} van 100 = ${data.targetSquares} hokjes.`
      }
    }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Kleur de juiste hokjes en vul de waarden in.' }
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

function checkAnswer() {
  isChecked.value = true
  attemptCount.value++

  const decimalNum = parseFloat(userDecimal.value.toString().replace(',', '.'))
  const data = currentLevelData.value

  if (coloredCount.value === data.targetSquares && Math.abs(decimalNum - data.targetDecimal) < 0.01 && userPercent.value === data.targetPercent) {
    isCorrect.value = true
    showWhy.value = true
    feedback.value = {
      type: 'success',
      text: `Prima! ${data.fractionDisplay} = ${data.targetSquares}/100 = ${data.targetDecimal} = ${data.targetPercent}%.`
    }
  } else {
    isCorrect.value = false

    // Error analysis
    let errorFound = false
    for (const pattern of data.errorPatterns) {
      if (pattern.check(coloredCount.value)) {
        feedback.value = { type: 'error', text: pattern.message }
        errorFound = true
        break
      }
    }

    if (!errorFound) {
      if (attemptCount.value === 1) {
        if (coloredCount.value !== data.targetSquares) {
          feedback.value = {
            type: 'error',
            text: `Het aantal gekleurde hokjes klopt niet. ${data.hintSquare}.`
          }
        } else if (Math.abs(decimalNum - data.targetDecimal) >= 0.01) {
          feedback.value = {
            type: 'error',
            text: `Het rooster klopt! Maar het kommagetal is fout. ${data.targetSquares} honderdsten = ${data.targetDecimal}.`
          }
        } else {
          feedback.value = {
            type: 'error',
            text: `Het rooster en kommagetal kloppen! Maar het percentage is fout. ${data.targetSquares} op 100 = ${data.targetPercent}%.`
          }
        }
      } else if (attemptCount.value === 2) {
        if (coloredCount.value !== data.targetSquares) {
          feedback.value = {
            type: 'error',
            text: `Je hebt ${coloredCount.value} hokjes gekleurd. Het moeten er ${data.targetSquares} zijn. Deel 100 door de noemer van ${data.fractionDisplay} en vermenigvuldig met de teller.`
          }
        } else if (Math.abs(decimalNum - data.targetDecimal) >= 0.01) {
          feedback.value = {
            type: 'error',
            text: `${data.targetSquares} / 100 = ${data.targetDecimal}. Hoeveel honderdsten zijn ${data.fractionDisplay}?`
          }
        } else {
          feedback.value = {
            type: 'error',
            text: `${data.targetSquares} op 100 = ${data.targetPercent}%. Procent = "per honderd".`
          }
        }
      } else {
        if (coloredCount.value !== data.targetSquares) {
          feedback.value = {
            type: 'error',
            text: `Kleur exact ${data.targetSquares} hokjes voor ${data.fractionDisplay}. Gebruik de hintknop.`
          }
        } else if (Math.abs(decimalNum - data.targetDecimal) >= 0.01) {
          feedback.value = {
            type: 'error',
            text: `Het juiste kommagetal is ${data.targetDecimal}.`
          }
        } else {
          feedback.value = {
            type: 'error',
            text: `Het juiste percentage is ${data.targetPercent}%.`
          }
        }
      }
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
  feedback.value = { type: 'info', text: 'Kleur de juiste hokjes en vul de waarden in.' }
  grid.value = Array(100).fill(false)
  userDecimal.value = ''
  userPercent.value = null
  attemptCount.value = 0
  hintCount.value = 0
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
  levels.value = generateLevel()
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
    window.addEventListener('mouseup', endDrag)
  } else {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('mouseup', endDrag)
  }
}, { immediate: true })

watch(currentLevelData, (val) => {
  if (val) {
    resetActivityState()
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mouseup', endDrag)
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
                      Hoeveel hokjes moet je kleuren voor {{ currentLevelData.fractionDisplay }}?
                    </p>
                    <p class="text-xs text-slate-500 italic">
                      Schat eerst: het rooster heeft 100 hokjes.
                    </p>
                  </div>
                </div>
                <input v-model="predictionAnswer"
                       type="number"
                       placeholder="Aantal hokjes..."
                       @keydown.enter="submitPrediction"
                       class="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 text-slate-800 text-lg font-mono text-center">
                <button @click="submitPrediction"
                        :disabled="!predictionAnswer"
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
                  Voorbeeld: 25% op het honderdveld
                </h4>
                <div class="space-y-2 mb-3">
                  <div class="flex items-start gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span class="text-sm text-slate-700">25% betekent 25 per honderd. Op een honderdveld = 25 hokjes.</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span class="text-sm text-slate-700">25 hokjes = 25/100 = 0,25 = 25%. Kleur 5 rijen van 5.</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span class="text-sm text-slate-700">Vul daarna het kommagetal (0,25) en percentage (25%) in.</span>
                  </div>
                </div>
                <div class="p-2 bg-indigo-100 rounded-lg text-center font-bold text-indigo-800 font-mono text-sm">
                  25% = 25/100 = 0,25
                </div>
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- MAIN ACTIVITY -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
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

              <div class="p-4 mt-3 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
                <h4 class="font-bold text-slate-700 mb-3 border-b border-amber-200 pb-2 text-sm">
                  De Drievuldigheid
                </h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-600">Breuk</span>
                    <span class="font-black text-xl text-amber-700 bg-white px-3 py-1 rounded-lg shadow-sm border border-amber-200">
                      {{ currentLevelData.fractionDisplay }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-600">Kommagetal</span>
                    <input type="text" v-model="userDecimal" placeholder="0..."
                           :disabled="isCorrect"
                           class="w-24 font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center font-mono">
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-600">Procent</span>
                    <div class="flex items-center gap-1">
                      <input type="number" v-model.number="userPercent" placeholder="..."
                             :disabled="isCorrect"
                             class="w-20 font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center font-mono">
                      <span class="font-black text-xl text-slate-500">%</span>
                    </div>
                  </div>
                </div>
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
                Het honderdveld laat zien wat procenten echt betekenen: "per honderd". {{ currentLevelData.fractionDisplay }} van 100 = {{ currentLevelData.targetSquares }} hokjes = {{ currentLevelData.targetDecimal }} = {{ currentLevelData.targetPercent }}%. De drie notaties (breuk, kommagetal, procent) zijn verschillende talen voor hetzelfde getal.
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-3 mb-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <PhChatCircleText weight="fill" class="w-3 h-3" />
                Reflectie
              </p>
              <p class="text-sm font-medium text-slate-800 mb-2">
                Het honderdveld heeft 100 hokjes. Welk getal in procenten, kommagetallen én breuken stelt het hele rooster voor (alle 100 hokjes)? En wat stelt 1 enkel hokje voor in elk van deze drie talen?
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
                Goed nagedacht! 100/100 = 1 = 100%. 1/100 = 0,01 = 1%.
              </p>
            </div>

            <!-- LPD CONFIRMATION -->
            <div v-if="showLpdConfirm && !lpdConfirmed" class="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <PhTarget weight="fill" class="w-3 h-3" />
                LPD Doelbereiking
              </p>
              <p class="text-sm text-slate-700 mb-2">
                Ik kan een breuk, kommagetal en procent aan elkaar koppelen via het honderdveld.
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
              <button v-if="!isCorrect && !showPrediction && !showWorkedExample"
                      @click="checkAnswer"
                      class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 text-sm">
                Controleer Alles
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

        <!-- Right panel: Hundred Grid -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="relative animate-fadeIn">
              <div class="relative bg-white p-2 rounded-xl shadow-md border-2 border-slate-300"
                   @mouseleave="endDrag">
                <div class="grid grid-cols-10 grid-rows-10 gap-1">
                  <div v-for="(block, index) in grid" :key="index"
                       @mousedown.prevent="startDrag(index)"
                       @mouseenter.prevent="onEnter(index)"
                       @touchstart.prevent="startDrag(index)"
                       @touchmove.prevent
                       class="w-8 h-8 sm:w-10 sm:h-10 border transition-colors cursor-crosshair rounded-sm"
                       :class="block ? (isCorrect ? 'bg-emerald-500 border-emerald-600 shadow-inner' : 'bg-amber-500 border-amber-600 shadow-inner') : 'bg-slate-100 border-slate-300 hover:bg-slate-200'">
                  </div>
                </div>

                <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 font-bold text-slate-600 whitespace-nowrap">
                  <PhPaintBrush weight="duotone" class="w-5 h-5 text-amber-500" />
                  <span>{{ coloredCount }} / 100 gekleurd</span>
                </div>
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
</style>
