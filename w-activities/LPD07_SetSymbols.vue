<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTextT, PhArrowClockwise,
  PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Getallenclassificatie: N, Z, Q' },
  instruction: {
    type: String,
    default: 'Getallen kun je indelen in verzamelingen: N (natuurlijk), Z (geheel), Q (rationaal).<br/><br/><strong>Opdracht:</strong> Sleep de getallen naar de juiste zone in het Venndiagram.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhTextT }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep de getallen naar de juiste cirkelzone.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionAnswer = ref(null)
const showWorkedExample = ref(false)
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionSubmitted = ref(false)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const levels = [
  {
    goalText: 'Opdracht 1: Natuurlijke getallen (N) versus Gehele getallen (Z)',
    setALabel: 'N (natuurlijk)',
    setBLabel: 'Z (geheel)',
    predictionQuestion: 'Is -3 een natuurlijk getal (N)?',
    predictionCorrect: false,
    predictionExplanation: '-3 is geen natuurlijk getal. N = {0, 1, 2, 3, ...} bevat alleen niet-negatieve gehele getallen.',
    workedExample: {
      title: 'Voorbeeld: N en Z',
      content: 'N = {0, 1, 2, 3, ...} (natuurlijke getallen)<br/>Z = {..., -3, -2, -1, 0, 1, 2, 3, ...} (gehele getallen)<br/><br/>Alle natuurlijke getallen zitten ook in Z. Getallen zoals -3 zitten in Z maar niet in N.',
      numbers: ['0', '3', '-1', '-5', '2']
    },
    hintLevels: [
      'Natuurlijke getallen (N) zijn de telgetallen: 0, 1, 2, 3, ... Gehele getallen (Z) zijn N plus de negatieve getallen: ..., -3, -2, -1.',
      'Voorbeeld: 5 is natuurlijk (N). -5 is geheel (Z) maar niet natuurlijk. Waar zou je 0 plaatsen?',
      'Getallen die alleen in Z zitten (niet in N): __, -2, __, ... Wat hebben ze gemeen?'
    ],
    whyExplanation: 'N ⊂ Z ⊂ Q: elke verzameling breidt de vorige uit. N heeft alleen niet-negatieve gehele getallen. Z voegt de negatieve gehele getallen toe. Q voegt alle breuken toe. Zo krijg je een "wiskundige nesting" waarbij elke stap nieuwe getallen toelaat.',
    reflectionQuestion: 'Waarom zit -3 in Z maar niet in N?',
    reflectionAnswer: 'Omdat N alleen niet-negatieve getallen bevat (0, 1, 2, ...). Z bevat ook negatieve getallen zoals -3.',
    errorPatterns: [
      { check: (n) => n < 0 && n % 1 === 0, zone: 'aOnly', message: 'Een negatief getal hoort niet in N. N bevat alleen niet-negatieve getallen.' }
    ],
    targetPlacements: { '0': 'intersect', '3': 'intersect', '-1': 'bOnly', '-5': 'bOnly', '2': 'intersect' }
  },
  {
    goalText: 'Opdracht 2: Gehele getallen (Z) versus Rationale getallen (Q)',
    setALabel: 'Z (geheel)',
    setBLabel: 'Q (rationaal)',
    predictionQuestion: 'Is 1/2 een geheel getal (Z)?',
    predictionCorrect: false,
    predictionExplanation: 'Nee, 1/2 = 0,5 is geen geheel getal. Z bevat alleen ... -2, -1, 0, 1, 2, ... zonder komma.',
    workedExample: {
      title: 'Voorbeeld: Z en Q',
      content: 'Z = {..., -2, -1, 0, 1, 2, ...} (gehele getallen)<br/>Q = {a/b | a, b in Z en b ≠ 0} (rationale getallen = breuken)<br/><br/>Alle gehele getallen zijn ook rationaal (bv. 3 = 3/1). Breuken zoals 1/2 zijn rationaal maar niet geheel.',
      numbers: ['4', '-2', '1/2', '0,75', '-3']
    },
    hintLevels: [
      'Gehele getallen (Z) zijn ... -3, -2, -1, 0, 1, 2, 3, ... Rationale getallen (Q) zijn alle getallen die je als breuk kunt schrijven.',
      'Voorbeeld: -2 = -2/1, dus het is zowel in Z als in Q. 0,75 = 3/4 dus het is in Q maar niet in Z.',
      'Getallen die in Q zitten maar niet in Z: __ , 0,75 , __ . Ze hebben allemaal een komma of breukstreep.'
    ],
    whyExplanation: 'Z ⊂ Q: elk geheel getal kun je schrijven als een breuk met noemer 1 (bv. 3 = 3/1). Breuken en decimale getallen zoals 0,5 of 2/3 zitten in Q maar niet in Z omdat ze geen geheel getal voorstellen.',
    reflectionQuestion: 'Waarom zit 1/2 wel in Q maar niet in Z?',
    reflectionAnswer: 'Omdat 1/2 een breuk is en geen geheel getal. Z bevat alleen getallen zonder komma.',
    errorPatterns: [
      { check: (n) => typeof n === 'string' && (n.includes('/') || n.includes(',')), zone: 'aOnly', message: 'Een getal met een breuk of komma is niet geheel. Het hoort in Q (maar niet in Z).' }
    ],
    targetPlacements: { '4': 'intersect', '-2': 'intersect', '1/2': 'bOnly', '0,75': 'bOnly', '-3': 'intersect' }
  },
  {
    goalText: 'Opdracht 3: Rationale (Q) versus Irrationale getallen',
    setALabel: 'Q (rationaal)',
    setBLabel: 'R \\ Q (irrationaal)',
    predictionQuestion: 'Is π een rationaal getal (Q)?',
    predictionCorrect: false,
    predictionExplanation: 'Nee, π is irrationaal. Het is niet als breuk te schrijven. Het heeft oneindig veel decimalen zonder patroon.',
    workedExample: {
      title: 'Voorbeeld: Rationaal en Irrationaal',
      content: 'Q = {a/b | a, b in Z en b ≠ 0}<br/>Irrationaal = getallen die NIET als breuk te schrijven zijn<br/><br/>Rationaal: 0,5 (= 1/2), 0,333... (= 1/3), 0,75 (= 3/4)<br/>Irrationaal: π, √2, √3',
      numbers: ['π', '√2', '1/3', '0,25', '√4']
    },
    hintLevels: [
      'Rationaal = als breuk te schrijven. Irrationaal = niet als breuk te schrijven (oneindig niet-herhalende decimalen).',
      'Voorbeeld: 0,333... = 1/3 is rationaal. π ≈ 3,14159... is irrationaal (geen herhaling). √4 = 2 is rationaal.',
      'Getallen die irrationaal zijn: π, √__, √3, ... Wat hebben vierkantswortels zonder mooie uitkomst gemeen?'
    ],
    whyExplanation: 'Een rationaal getal is te schrijven als a/b met a, b geheel. Irrationale getallen zoals π en √2 hebben oneindig veel decimalen zonder patroon - ze zijn niet als breuk te schrijven. Daarom vallen ze buiten Q.',
    reflectionQuestion: 'Hoe weet je of een getal rationaal of irrationaal is?',
    reflectionAnswer: 'Een getal is rationaal als je het als een breuk van twee gehele getallen kunt schrijven. Als dat niet kan (zoals bij π of √2), is het irrationaal.',
    errorPatterns: [
      { check: (n) => n === '√4', zone: 'bOnly', message: '√4 = 2, en 2 is een geheel getal. Het is dus rationaal, niet irrationaal.' }
    ],
    targetPlacements: { 'π': 'bOnly', '√2': 'bOnly', '1/3': 'aOnly', '0,25': 'aOnly', '√4': 'aOnly' }
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const numbersAvailable = computed(() => Object.keys(currentLevelData.value.targetPlacements))

// State for placements: { number: 'zone' }
const placements = ref({})
let draggedNumber = null

function onDragStart(num) {
  if (!isCorrect.value) draggedNumber = num
}

function onDrop(zone) {
  if (!isCorrect.value && draggedNumber !== null) {
    placements.value[draggedNumber] = zone
    draggedNumber = null
    autoCheck()
  }
}

function removePlacement(num) {
  if (!isCorrect.value) {
    delete placements.value[num]
  }
}

function autoCheck() {
  const targets = currentLevelData.value.targetPlacements
  const required = Object.keys(targets)
  const placed = Object.keys(placements.value)
  const allPlaced = required.every(n => placed.includes(n))

  if (allPlaced) {
    const allCorrect = required.every(n => placements.value[n] === targets[n])
    if (allCorrect) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: 'Perfect! Je plaatste alle getallen correct.' }
      showWhy.value = true
    } else {
      attemptCount.value++
      const wrongNum = required.find(n => placements.value[n] !== targets[n])
      const data = currentLevelData.value
      const idx = Math.min(attemptCount.value - 1, 2)

      // Error analysis: check for common misconceptions
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: data.hintLevels[0] }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: data.hintLevels[1] }
      } else {
        feedback.value = { type: 'error', text: data.hintLevels[2] }
      }
    }
  }
}

function answerPrediction(val) {
  predictionAnswer.value = val
  showPrediction.value = false
  showWorkedExample.value = true
  const correct = val === currentLevelData.value.predictionCorrect
  if (correct) {
    feedback.value = { type: 'info', text: 'Juist! ' + currentLevelData.value.predictionExplanation }
  } else {
    feedback.value = { type: 'error', text: 'Niet helemaal. ' + currentLevelData.value.predictionExplanation }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Sleep de getallen naar de juiste zone.' }
}

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 3) {
    reflectionSubmitted.value = true
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Sleep de getallen naar de juiste zone.' }
  placements.value = {}
  attemptCount.value = 0
  hintCount.value = 0
  showPrediction.value = true
  predictionAnswer.value = null
  showWorkedExample.value = false
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
}

function handleNext() {
  if (showWhy.value && !showReflection.value) {
    showReflection.value = true
    return
  }
  if (showReflection.value && !reflectionSubmitted.value) {
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

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="animate-fadeIn">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Voorspelling</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-4">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <p class="font-bold text-slate-800 text-base">{{ currentLevelData.predictionQuestion }}</p>
                </div>
                <div class="flex gap-3 mt-3">
                  <button @click="answerPrediction(true)"
                          class="flex-1 py-3 rounded-lg font-bold border-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="predictionAnswer === true ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    Ja
                  </button>
                  <button @click="answerPrediction(false)"
                          class="flex-1 py-3 rounded-lg font-bold border-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="predictionAnswer === false ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300'">
                    Nee
                  </button>
                </div>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample" class="animate-fadeIn">
              <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld
                </h4>
                <MathText :content="currentLevelData.workedExample.content" class="text-sm text-slate-700 prose prose-sm" />
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span v-for="n in currentLevelData.workedExample.numbers" :key="n"
                        class="px-3 py-1 bg-white border border-amber-200 rounded-full text-sm font-bold text-amber-800">
                    {{ n }}
                  </span>
                </div>
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- MAIN ACTIVITY (visible when prediction answered + example dismissed) -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
              <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

              <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
                <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
              </div>

              <!-- Hints button -->
              <button @click="showHint" :disabled="isCorrect"
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                 <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest text-center">Getallen</label>
                 <div class="flex flex-wrap justify-center gap-2">
                     <div v-for="num in numbersAvailable" :key="num"
                          draggable="true" @dragstart="onDragStart(num)"
                          class="w-12 h-12 flex items-center justify-center border-2 border-slate-300 bg-white rounded-full font-bold text-xl text-slate-700 cursor-grab hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm"
                          :class="{ 'opacity-30 pointer-events-none': placements[num], 'border-amber-500 text-amber-600': draggedNumber === num }">
                         <MathText :content="num" class="text-xl font-bold leading-none" />
                     </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy" class="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Waarom is dit zo?</p>
              <p class="text-sm text-slate-700 leading-relaxed">{{ currentLevelData.whyExplanation }}</p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-3 mb-3 bg-slate-100 border border-slate-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reflectie</p>
              <p class="text-sm font-medium text-slate-800 mb-2">{{ currentLevelData.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionSubmitted"
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionSubmitted" @click="submitReflection"
                      class="mt-2 px-4 py-1.5 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig
              </button>
              <p v-if="reflectionSubmitted" class="text-xs text-slate-500 mt-1 italic">Goed nagedacht!</p>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>
              <button v-if="!isCorrect && !showPrediction && !showWorkedExample" disabled
                      class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60 text-sm">
                Sleep en plaats automatisch
              </button>
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none text-sm">
                <span v-if="showWhy && !showReflection">Waarom? Bekijk uitleg</span>
                <span v-else-if="showReflection && !reflectionSubmitted">Reflecteer eerst</span>
                <span v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right panel: Venn diagram -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="relative w-[600px] h-[400px] flex items-center justify-center bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200/50 animate-fadeIn">

              <div class="relative w-[500px] h-[300px] flex">
                <!-- CIRCLE A (Left) / a-only drop zone -->
                <div @dragover.prevent @drop.prevent.stop="onDrop('aOnly')"
                     class="absolute left-0 w-[300px] h-[300px] rounded-full border-[6px] border-amber-500 bg-amber-500/10 flex flex-col p-8 transition-colors"
                     :class="draggedNumber ? 'bg-amber-500/30' : ''">
                     <span class="font-black text-2xl text-amber-700 pointer-events-none">A</span>
                     <span class="text-xs font-bold text-amber-600 pointer-events-none">{{ currentLevelData.setALabel }}</span>
                     <div class="absolute inset-0 flex flex-wrap items-center justify-center gap-2 pr-[100px] pointer-events-none">
                         <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'aOnly')" :key="num"
                              class="w-10 h-10 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center font-bold text-lg text-amber-800 shadow-sm pointer-events-auto cursor-pointer"
                              @click="removePlacement(num)">
                             <MathText v-if="num.includes('/') || num.includes(',') || num.includes('π') || num.includes('√')" :content="num" class="text-lg font-bold" />
                             <span v-else>{{ num }}</span>
                         </div>
                     </div>
                </div>

                <!-- CIRCLE B (Right) / b-only drop zone -->
                <div @dragover.prevent @drop.prevent.stop="onDrop('bOnly')"
                     class="absolute right-0 w-[300px] h-[300px] rounded-full border-[6px] border-slate-500 bg-slate-500/10 flex flex-col p-8 items-end transition-colors"
                     :class="draggedNumber ? 'bg-slate-500/30' : ''">
                     <span class="font-black text-2xl text-slate-700 pointer-events-none">B</span>
                     <span class="text-xs font-bold text-slate-600 pointer-events-none">{{ currentLevelData.setBLabel }}</span>
                     <div class="absolute inset-0 flex flex-wrap items-center justify-center gap-2 pl-[100px] pointer-events-none">
                         <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'bOnly')" :key="num"
                              class="w-10 h-10 bg-white border-2 border-slate-500 rounded-full flex items-center justify-center font-bold text-lg text-slate-700 shadow-sm pointer-events-auto cursor-pointer"
                              @click="removePlacement(num)">
                             <MathText v-if="num.includes('/') || num.includes(',') || num.includes('π') || num.includes('√')" :content="num" class="text-lg font-bold" />
                             <span v-else>{{ num }}</span>
                         </div>
                     </div>
                </div>

                <!-- INTERSECTION drop zone -->
                <div @dragover.prevent @drop.prevent.stop="onDrop('intersect')"
                     class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[200px] rounded-full z-20 flex flex-col items-center justify-center gap-2 transition-colors cursor-crosshair"
                     :class="draggedNumber ? 'bg-amber-500/20' : ''">
                     <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'intersect')" :key="num"
                          class="w-10 h-10 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center font-bold text-lg text-amber-800 shadow-sm cursor-pointer"
                          @click="removePlacement(num)">
                         <MathText v-if="num.includes('/') || num.includes(',') || num.includes('π') || num.includes('√')" :content="num" class="text-lg font-bold" />
                         <span v-else>{{ num }}</span>
                     </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showWhy" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
