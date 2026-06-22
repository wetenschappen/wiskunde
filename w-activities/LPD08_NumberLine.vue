<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSortAscending, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhTarget, PhChatCircleText, PhCaretUp, PhCaretDown
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getallen Plaatsen op de Getallenas (Toepassen)' },
  instruction: {
    type: String,
    default: 'Plaats getallen op de juiste positie op de getallenas.<br/><br/>Gebruik de pijltjesknoppen om getallen naar de juiste positie te verplaatsen. De balk toont visueel hoe groot het getal is.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhSortAscending }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de pijltjes om getallen op de juiste positie te zetten.' })
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

const levels = [
  {
    goalText: 'Opdracht 1: Plaats 3,5 op de getallenas tussen 3 en 4. (Toepassen)',
    items: [
      { id: 'i1', label: '3,5', value: 3.5, displayType: 'decimal', zone: 'between-3-4' },
      { id: 'i2', label: '-1', value: -1, displayType: 'integer', zone: 'negative' },
      { id: 'i3', label: '0', value: 0, displayType: 'integer', zone: 'zero' }
    ],
    predictionQuestion: 'Waar ligt -1 op de getallenas? Links van 0, rechts van 0, of precies op 0?',
    predictionCorrect: 'links',
    predictionExplanation: '-1 is negatief en ligt links van 0 op de getallenas. Alle negatieve getallen liggen links van nul.',
    workedExample: {
      title: 'Voorbeeld: 3,5 plaatsen tussen 3 en 4',
      steps: [
        '3,5 is een kommagetal tussen 3 en 4.',
        'Het ligt precies in het midden van 3 en 4, want 3,5 = 3 + 1/2.',
        'Op de getallenas: ...0...1...2...3...3,5...4...',
        'De balk toont de grootte: 3,5 eenheden vanaf 0.'
      ],
      label: '3,5 ligt tussen 3 en 4 in.'
    },
    targetOrder: ['-1', '0', '3,5'],
    hintLevels: [
      'Negatieve getallen liggen links van 0. Positieve getallen liggen rechts van 0. 3,5 is positief, dus rechts van 0.',
      '3,5 is meer dan 3 maar minder dan 4. Het hoort tussen 3 en 4. -1 is negatief, dus links van 0.',
      'Van klein naar groot: __ < 0 < __'
    ],
    whyExplanation: 'De getallenas is een visuele voorstelling van alle reële getallen. Negatieve getallen links van 0, positieve rechts. Hoe verder van 0, hoe groter de absolute waarde. Door een getal op de as te plaatsen, zie je direct de grootte in verhouding tot andere getallen.',
    errorPatterns: [
      { check: (items) => {
          const neg1Idx = items.findIndex(i => i.label === '-1')
          const zeroIdx = items.findIndex(i => i.label === '0')
          return neg1Idx >= 0 && zeroIdx >= 0 && neg1Idx > zeroIdx
        }, message: 'Let op! -1 is negatief en moet LINKS van 0 staan. Een negatief getal kan nooit rechts van 0 staan.'
      },
      { check: (items) => {
          const valIdx = items.findIndex(i => i.label === '3,5')
          const zeroIdx = items.findIndex(i => i.label === '0')
          return valIdx >= 0 && zeroIdx >= 0 && valIdx < zeroIdx
        }, message: 'Let op! 3,5 is positief en hoort RECHTS van 0! Je hebt het aan de verkeerde kant geplaatst.'
      }
    ],
    reflectionQuestion: 'Waarom staat 0 precies in het midden van de getallenas? Wat is de speciale rol van 0?',
    reflectionAnswer: '0 is het neutrale element en het scheidingspunt tussen positieve en negatieve getallen. Positieve getallen zijn groter dan 0, negatieve getallen zijn kleiner dan 0.'
  },
  {
    goalText: 'Opdracht 2: Plaats -3/4, 1/2 en -1,5 op de getallenas. (Analyseren)',
    items: [
      { id: 'j1', label: '-3/4', value: -0.75, displayType: 'fraction', zone: 'negative' },
      { id: 'j2', label: '1/2', value: 0.5, displayType: 'fraction', zone: 'positive' },
      { id: 'j3', label: '-1,5', value: -1.5, displayType: 'decimal', zone: 'negative' }
    ],
    predictionQuestion: 'Wat is groter: -3/4 of -1,5? Welk getal ligt het verst links van 0?',
    predictionCorrect: '-1.5',
    predictionExplanation: '-1,5 ≈ -1,500 en -3/4 = -0,750. Op de getallenas: -1,5 ligt verder links van 0 dan -0,75, dus -1,5 is kleiner dan -3/4.',
    workedExample: {
      title: 'Voorbeeld: breuken en decimalen op de getallenas',
      steps: [
        'Zet breuken om: -3/4 = -0,75 en 1/2 = 0,5.',
        '-1,5 is het verst van 0 (links), dus het kleinst.',
        '-0,75 ligt tussen -1 en 0. 0,5 ligt tussen 0 en 1.',
        'Volgorde: -1,5 < -0,75 < 0,5'
      ],
      label: '-1,5 < -3/4(-0,75) < 0 < 1/2(0,5)'
    },
    targetOrder: ['-1,5', '-3/4', '1/2'],
    hintLevels: [
      'Zet eerst alle breuken om naar kommagetallen: -3/4 = -0,75 en 1/2 = 0,5. Dan kun je vergelijken.',
      'Negatieve getallen: hoe verder van 0, hoe kleiner. -1,5 ligt verder van 0 dan -0,75, dus -1,5 < -3/4. Positief: 1/2 = 0,5 > 0.',
      'Van klein naar groot: __ < -0,75 < 0 < __'
    ],
    whyExplanation: 'Om getallen op de as te plaatsen, zet je ze eerst in dezelfde vorm (bv. allemaal kommagetallen). Hoe kleiner het getal, hoe verder links op de as. Negatieve getallen staan altijd links van positieve getallen.',
    errorPatterns: [
      { check: (items) => {
          const n15Idx = items.findIndex(i => i.label === '-1,5')
          const n34Idx = items.findIndex(i => i.label === '-3/4')
          return n15Idx >= 0 && n34Idx >= 0 && n15Idx > n34Idx
        }, message: 'Let op! -1,5 = -1,500 is KLEINER dan -3/4 = -0,750. -1,5 moet links van -3/4 staan. Bij negatieve getallen: hoe groter het getal zonder min, hoe kleiner het getal met min.'
      },
      { check: (items) => {
          const n34Idx = items.findIndex(i => i.label === '-3/4')
          const halfIdx = items.findIndex(i => i.label === '1/2')
          return n34Idx >= 0 && halfIdx >= 0 && n34Idx > halfIdx
        }, message: 'Let op! -3/4 is negatief en 1/2 is positief. Negatieve getallen staan ALTIJD links van positieve getallen op de as!'
      }
    ],
    reflectionQuestion: 'Wat gebeurt er met de positie van een getal op de as als je het vermenigvuldigt met -1? Bijvoorbeeld: waar ligt -1,5 en waar ligt 1,5?',
    reflectionAnswer: 'Vermenigvuldigen met -1 spiegelt het getal rond 0 op de getallenas. Als a op een bepaalde afstand rechts van 0 ligt, dan ligt -a op dezelfde afstand links van 0. -1,5 ligt links van 0, 1,5 ligt rechts van 0.'
  },
  {
    goalText: 'Opdracht 3: Plaats -0,2, 4/5 en -3/4 op de getallenas. (Evalueren)',
    items: [
      { id: 'k1', label: '-0,2', value: -0.2, displayType: 'decimal', zone: 'negative-near-zero' },
      { id: 'k2', label: '4/5', value: 0.8, displayType: 'fraction', zone: 'positive' },
      { id: 'k3', label: '-3/4', value: -0.75, displayType: 'fraction', zone: 'negative' }
    ],
    predictionQuestion: 'Waarom is 4/5 groter dan -0,2? Welke van de twee getallen ligt het dichtst bij 0?',
    predictionCorrect: '-0.2',
    predictionExplanation: '-0,2 ligt het dichtst bij 0 (slechts 0,2 naar links). 4/5 = 0,8 ligt 0,8 naar rechts. -3/4 = -0,75 ligt 0,75 naar links. Van dichtst bij 0: -0,2, dan 4/5, dan -3/4.',
    workedExample: {
      title: 'Voorbeeld: gemengde getallen sorteren',
      steps: [
        'Zet alles om: -0,2 blijft -0,2 | 4/5 = 0,8 | -3/4 = -0,75',
        'Negatieve getallen: -0,75 < -0,2 (want -0,75 ligt verder links)',
        'Positieve getallen: 0,8 > 0',
        'Volgorde van klein naar groot: -3/4(-0,75) < -0,2 < 0 < 4/5(0,8)'
      ],
      label: '-0,75 < -0,2 < 0 < 0,8'
    },
    targetOrder: ['-3/4', '-0,2', '4/5'],
    hintLevels: [
      'Zet 4/5 om naar kommagetal: 4 ÷ 5 = 0,8. Dan heb je -0,2, 0,8 en -0,75. Vergelijk de negatieve getallen onderling.',
      '-0,75 en -0,2: welk getal ligt verder van 0? -0,75, dus die is kleiner. 0,8 is positief, dus die is het grootst.',
      'Van klein naar groot: __ < -0,2 < 0 < __'
    ],
    whyExplanation: 'De getallenas maakt zichtbaar hoe getallen zich tot elkaar verhouden. De afstand van een getal tot 0 is de absolute waarde. Het teken (+ of -) bepaalt de richting. Samen bepalen ze de exacte positie op de as.',
    errorPatterns: [
      { check: (items) => {
          const n02Idx = items.findIndex(i => i.label === '-0,2')
          const n34Idx = items.findIndex(i => i.label === '-3/4')
          return n02Idx >= 0 && n34Idx >= 0 && n02Idx > n34Idx
        }, message: 'Let op! -3/4 = -0,75 is KLEINER dan -0,2. -0,75 ligt verder links van 0. Denk aan de grootte zonder min: 0,75 > 0,2, maar met min wordt het omgekeerd.'
      },
      { check: (items) => {
          const n34Idx = items.findIndex(i => i.label === '-3/4')
          const n02Idx = items.findIndex(i => i.label === '-0,2')
          const pctIdx = items.findIndex(i => i.label === '4/5')
          return n34Idx >= 0 && n02Idx >= 0 && pctIdx >= 0 && n34Idx < pctIdx && pctIdx < n02Idx
        }, message: 'Let op! Een negatief getal (-0,2) kan niet rechts van een positief getal (4/5) staan. Alle negatieve getallen staan links van alle positieve getallen.'
      }
    ],
    reflectionQuestion: 'Als je een getal op de getallenas plaatst, wat vertelt de afstand tot 0 je? En wat vertelt de richting (links/rechts) je?',
    reflectionAnswer: 'De afstand tot 0 is de absolute waarde van het getal - hoe groot het is "zonder richting". De richting (links = negatief, rechts = positief) vertelt of het getal kleiner of groter dan 0 is. Samen bepalen ze de exacte positie.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Game state
const items = ref([])

function cloneItems(levelItems) {
  return levelItems.map(item => ({ ...item }))
}

function moveUp(index) {
  if (index > 0 && !isCorrect.value) {
    const temp = items.value[index]
    items.value[index] = items.value[index - 1]
    items.value[index - 1] = temp
    isChecked.value = false
  }
}

function moveDown(index) {
  if (index < items.value.length - 1 && !isCorrect.value) {
    const temp = items.value[index]
    items.value[index] = items.value[index + 1]
    items.value[index + 1] = temp
    isChecked.value = false
  }
}

// Prediction gate
function submitPrediction() {
  if (predictionAnswer.value.trim()) {
    predictionSubmitted.value = true
    const data = currentLevelData.value
    const userAns = predictionAnswer.value.trim().toLowerCase()
    const correctAns = data.predictionCorrect.toLowerCase()
    if (userAns === correctAns || userAns.includes(correctAns)) {
      feedback.value = {
        type: 'success',
        text: `Juist! ${data.predictionExplanation}`
      }
    } else {
      feedback.value = {
        type: 'info',
        text: `Niet helemaal. ${data.predictionExplanation}`
      }
    }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Gebruik de pijltjes om getallen op de juiste positie te zetten.' }
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

// Animation helpers for bar widths
function getBarWidth(item) {
  const absVal = Math.abs(item.value)
  const maxVal = 4
  const pct = Math.min((absVal / maxVal) * 100, 100)
  return pct
}

function getBarColor(item) {
  if (item.value < 0) return 'bg-red-400'
  return 'bg-emerald-400'
}

function getBarPosition(item) {
  if (item.value < 0) {
    return (50 - getBarWidth(item) / 2) + '%'
  }
  return '50%'
}

function checkAnswer() {
  isChecked.value = true
  attemptCount.value++

  let isSorted = true
  for (let i = 0; i < items.value.length - 1; i++) {
    if (items.value[i].value > items.value[i + 1].value) {
      isSorted = false
      break
    }
  }

  if (isSorted) {
    isCorrect.value = true
    showWhy.value = true
    feedback.value = {
      type: 'success',
      text: 'Prima! De getallen staan in de juiste volgorde op de getallenas.'
    }
  } else {
    isCorrect.value = false

    // Error analysis
    let errorFound = false
    for (const pattern of currentLevelData.value.errorPatterns) {
      if (pattern.check(items.value)) {
        feedback.value = { type: 'error', text: pattern.message }
        errorFound = true
        break
      }
    }

    if (!errorFound) {
      const hasNegatives = items.value.some(i => i.value < 0)
      const firstVal = items.value[0].label
      const lastVal = items.value[items.value.length - 1].label

      if (attemptCount.value === 1) {
        if (hasNegatives && items.value[0].value >= 0) {
          feedback.value = {
            type: 'error',
            text: 'Niet helemaal. Het kleinste getal moet bovenaan staan. Een positief getal kan nooit kleiner zijn dan een negatief getal.'
          }
        } else {
          feedback.value = {
            type: 'error',
            text: 'Niet helemaal. De volgorde klopt nog niet. Kijk naar de balkjes: hoe korter de balk, hoe kleiner het getal. ' + currentLevelData.value.hintLevels[0]
          }
        }
      } else if (attemptCount.value === 2) {
        feedback.value = {
          type: 'error',
          text: 'Nog niet juist. ' + currentLevelData.value.hintLevels[1]
        }
      } else {
        const sorted = [...items.value].sort((a, b) => a.value - b.value)
        const hints = sorted.map(i => i.label)
        feedback.value = {
          type: 'error',
          text: `De juiste volgorde is: ${hints.join(' < ')}. ${currentLevelData.value.hintLevels[2]}`
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
  feedback.value = { type: 'info', text: 'Gebruik de pijltjes om getallen op de juiste positie te zetten.' }
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

  if (currentLevelData.value) {
    items.value = cloneItems(currentLevelData.value.items)
  }
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

watch(currentLevelData, () => {
  resetActivityState()
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

              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                <p class="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider text-center">
                  Sorteer van klein naar groot
                </p>
                <div class="space-y-2">
                  <div v-for="(item, index) in items" :key="item.id"
                       class="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl p-2 shadow-sm">
                    <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button @click="moveUp(index)"
                              :disabled="index === 0 || isCorrect"
                              class="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                        <PhCaretUp weight="bold" />
                      </button>
                      <div class="h-px bg-slate-200"></div>
                      <button @click="moveDown(index)"
                              :disabled="index === items.length - 1 || isCorrect"
                              class="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                        <PhCaretDown weight="bold" />
                      </button>
                    </div>
                    <div class="w-16 shrink-0 text-center font-bold text-xl text-slate-700 font-mono">
                      {{ item.label }}
                    </div>
                    <div class="flex-1 h-10 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200">
                      <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>
                      <div class="absolute top-1 bottom-1 rounded-lg z-0 transition-all duration-500 ease-out"
                           :class="getBarColor(item)"
                           :style="{
                             left: getBarPosition(item),
                             width: getBarWidth(item) + '%'
                           }">
                      </div>
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
                Ik kan nu getallen op de juiste positie op de getallenas plaatsen en begrijp de volgorde.
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
                Controleer Volgorde
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

        <!-- Right panel: Number line visualization -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="w-full max-w-3xl flex flex-col gap-4 relative animate-fadeIn">

              <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-16 mb-2">
                <span>Kleinste</span>
                <span class="text-slate-300">Sorteer hieronder</span>
                <span>Grootste</span>
              </div>

              <div class="absolute top-[30px] bottom-0 left-[220px] right-[40px] pointer-events-none">
                <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-300/50"></div>
                <span class="absolute left-1/2 -top-6 -translate-x-1/2 text-xs font-bold text-slate-400">0</span>
                <span class="absolute left-0 -top-6 -translate-x-1/2 text-xs font-bold text-slate-400">-1</span>
                <span class="absolute right-0 -top-6 translate-x-1/2 text-xs font-bold text-slate-400">1</span>
              </div>

              <div class="flex flex-col gap-4 relative z-10 w-full min-h-[200px]">
                <transition-group name="list">
                  <div v-for="(item, index) in items" :key="item.id"
                       class="bg-white/90 backdrop-blur border-2 border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 w-full">

                    <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button @click="moveUp(index)"
                              :disabled="index === 0 || isCorrect"
                              class="p-2 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                        <PhCaretUp weight="bold" />
                      </button>
                      <div class="h-px bg-slate-200"></div>
                      <button @click="moveDown(index)"
                              :disabled="index === items.length - 1 || isCorrect"
                              class="p-2 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                        <PhCaretDown weight="bold" />
                      </button>
                    </div>

                    <div class="w-24 shrink-0 flex justify-center">
                      <div v-if="item.displayType === 'fraction' && item.label.includes('/')"
                           class="font-bold text-2xl text-slate-700">
                        <div v-if="item.value < 0" class="text-center">-</div>
                        <div class="flex flex-col items-center">
                          <span>{{ item.label.split('/')[0].replace('-', '') }}</span>
                          <div class="h-1 w-full bg-slate-700 rounded-full my-1"></div>
                          <span>{{ item.label.split('/')[1] }}</span>
                        </div>
                      </div>
                      <div v-else class="font-bold text-2xl text-slate-700 font-mono">
                        {{ item.label }}
                      </div>
                    </div>

                    <div class="flex-1 h-12 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200">
                      <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>
                      <div class="absolute top-1 bottom-1 rounded-lg z-0 transition-all duration-700 ease-out flex items-center justify-center overflow-hidden"
                           :class="item.value < 0 ? 'bg-red-400' : 'bg-emerald-400'"
                           :style="{
                             left: item.value < 0 ? (50 + (item.value / 2) * 100) + '%' : '50%',
                             width: Math.abs(item.value / 2) * 100 + '%'
                           }">
                        <div v-if="item.displayType === 'fraction'" class="absolute inset-0 flex">
                          <div v-for="part in parseInt(item.label.replace('-', '').split('/')[0])"
                               :key="'p' + part"
                               class="h-full border-r border-white/40 last:border-r-0"
                               :style="{ width: (100 / parseInt(item.label.replace('-', '').split('/')[0])) + '%' }">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition-group>
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

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
