<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhListNumbers, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhTarget, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Ordenen van Reële Getallen (Toepassen)' },
  instruction: {
    type: String,
    default: 'Plaats de reële getallen in de juiste volgorde van KLEIN (links) naar GROOT (rechts).<br/><br/>Sleep de kaarten naar de juiste vakjes op de getallenas.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Plaats alle getallen in de juiste volgorde.' })
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

const levels = [
  {
    goalText: 'Opdracht 1: Orden breuken en decimale getallen. (Toepassen)',
    numbers: [
      { label: '1/2', value: 0.5 },
      { label: '0.4', value: 0.4 },
      { label: '-1.5', value: -1.5 },
      { label: '0', value: 0 },
      { label: '-3/4', value: -0.75 },
      { label: '1/4', value: 0.25 },
      { label: '-0.2', value: -0.2 },
      { label: '4/5', value: 0.8 }
    ],
    predictionQuestion: 'Hoe schrijf je -3/4 als een kommagetal?',
    predictionCorrect: '-0.75',
    predictionExplanation: '-3/4 = -3 ÷ 4 = -0,75. Een breuk omzetten naar decimaal doe je door de teller te delen door de noemer.',
    workedExample: {
      title: 'Voorbeeld: -1.5, -3/4, 0, 1/2, 4/5 ordenen',
      steps: [
        'Zet alle breuken om naar kommagetallen: 1/2 = 0,5 | -3/4 = -0,75 | 4/5 = 0,8',
        'Vergelijk de negatieve getallen: -1,5 < -0,75 (negatiever = kleiner)',
        'Vergelijk de positieve getallen: 0 < 0,5 < 0,8',
        'Juiste volgorde: -1,5 < -0,75 < 0 < 0,5 < 0,8'
      ],
      label: '-1.5 < -0.75 < 0 < 0.5 < 0.8'
    },
    hintLevels: [
      'Zet alle breuken om naar kommagetallen: 1/2 = 0,5 en -3/4 = -0,75. Vergelijk dan de waarden.',
      'Negatieve getallen: -1,5 is kleiner dan -0,75, want -1,5 ligt verder links op de getallenas. Positieve: 0,5 < 0,8.',
      'Van klein naar groot: __ < -0,75 < __ < 0,5 < __'
    ],
    whyExplanation: 'Door alle getallen om te zetten naar kommagetallen kun je ze makkelijk vergelijken. Een breuk zoals 1/2 betekent 1 ÷ 2 = 0,5. Kommagetallen met dezelfde noemer (tientallen, honderdtallen) kun je direct vergelijken.',
    errorPatterns: [
      { check: (items) => {
          const vals = items.map(i => i.value)
          const negIdx = vals.findIndex((v, i) => v < 0 && i > 0 && vals[i-1] >= 0)
          return negIdx >= 0
        }, message: 'Let op: negatieve getallen zijn ALTIJD kleiner dan positieve getallen! Een positief getal bovenaan betekent dat een negatief getal nog onderaan moet staan.'
      },
      { check: (items) => {
          const vals = items.map(i => i.value)
          return vals.some((v, i) => i > 0 && v < 0 && vals[i-1] < 0 && v > vals[i-1])
        }, message: 'Let op met negatieve getallen: -3/4 = -0,75 is GROTER dan -1,5. Bij negatieve getallen is het getal met de grootste absolute waarde (zonder minteken) het KLEINSTE!'
      }
    ],
    reflectionQuestion: 'Waarom past √2 ≈ 1,414 precies tussen 1 en 2 op de getallenas? Wat betekent dat voor de dichtheid van reële getallen?',
    reflectionAnswer: '√2 ≈ 1,414 ligt tussen 1 en 2 omdat 1,414 > 1 en 1,414 < 2. Reële getallen zijn "dicht": tussen elke twee reële getallen zit altijd nog een ander reëel getal. Er zitten zelfs oneindig veel irrationale getallen tussen 1 en 2.'
  },
  {
    goalText: 'Opdracht 2: Orden met irrationale getallen. (Analyseren)',
    numbers: [
      { label: 'π', value: 3.1415 },
      { label: '√2', value: 1.414 },
      { label: '3', value: 3 },
      { label: '√5', value: 2.236 },
      { label: '1', value: 1 },
      { label: '√3', value: 1.732 },
      { label: '2', value: 2 },
      { label: '4', value: 4 }
    ],
    predictionQuestion: 'Zonder te rekenen: wat is √2 ongeveer? Tussen welke twee gehele getallen ligt het?',
    predictionCorrect: 'tussen 1 en 2',
    predictionExplanation: '√2 ≈ 1,414. Omdat 1² = 1 en 2² = 4, en 2 ligt tussen 1 en 4, ligt √2 tussen 1 en 2.',
    workedExample: {
      title: 'Voorbeeld: π, √2, √5, √3 ordenen',
      steps: [
        'Zoek de decimale benaderingen: √2 ≈ 1,414 | √3 ≈ 1,732 | √5 ≈ 2,236 | π ≈ 3,142',
        'Orden de eenvoudige getallen: 1 < 2 < 3 < 4',
        'Voeg de irrationale in: 1 < √2(1,414) < √3(1,732) < 2 < √5(2,236) < 3 < π(3,142) < 4',
        'Tip: gebruik de benadering om te vergelijken, maar onthoud dat het exacte getal irrationaal is.'
      ],
      label: '1 < √2 < √3 < 2 < √5 < 3 < π < 4'
    },
    hintLevels: [
      'Irrationale getallen zoals √2 en π hebben geen exacte decimale vorm. Gebruik benaderingen: √2 ≈ 1,414, π ≈ 3,142.',
      'Tussen welke twee gehele getallen ligt √5? 2²=4 en 3²=9, dus √5 ligt tussen 2 en 3. Zelfde voor √2 (tussen 1 en 2) en √3 (tussen 1 en 2, maar groter dan √2).',
      '1 < √2(1,414) < √3(1,732) < __ < √5(2,236) < __ < π(3,142) < __'
    ],
    whyExplanation: 'Je kunt irrationale getallen ordenen door hun decimale benadering te gebruiken. Onthoud dat deze benaderingen nooit exact zijn, maar wel nauwkeurig genoeg om de volgorde te bepalen. Het echte getal √2 is exact 1,414213... - oneindig doorlopend zonder patroon.',
    errorPatterns: [
      { check: (items) => {
          const vals = items.map(i => i.value)
          const piIdx = items.findIndex(i => i.label === 'π')
          const threeIdx = items.findIndex(i => i.label === '3')
          return piIdx >= 0 && threeIdx >= 0 && piIdx < threeIdx
        }, message: 'Let op: denk aan de waarde van π. π ≈ 3,142 en 3 = 3,000. Dus 3 < π, niet andersom!'
      },
      { check: (items) => {
          const vals = items.map(i => i.value)
          const r2idx = items.findIndex(i => i.label === '√2')
          const r3idx = items.findIndex(i => i.label === '√3')
          return r2idx >= 0 && r3idx >= 0 && r2idx > r3idx
        }, message: 'Let op: √2 ≈ 1,414 en √3 ≈ 1,732. Omdat 3 > 2 is √3 > √2. De volgorde is 1 < √2 < √3 < 2.'
      }
    ],
    reflectionQuestion: 'Hoe weet je of een wortel tussen twee bepaalde gehele getallen ligt zonder te rekenen?',
    reflectionAnswer: 'Als 1² < 2 < 2², dan ligt √2 tussen 1 en 2. Algemeen: als n² < x < (n+1)², dan ligt √x tussen n en n+1. Je gebruikt de kwadraten van gehele getallen als grenzen.'
  },
  {
    goalText: 'Opdracht 3: Orden negatieve irrationale getallen. (Evalueren)',
    numbers: [
      { label: '-√5', value: -2.236 },
      { label: '-2', value: -2 },
      { label: '-π', value: -3.1415 },
      { label: '-√2', value: -1.414 },
      { label: '-3', value: -3 },
      { label: '-2.5', value: -2.5 },
      { label: '-√3', value: -1.732 },
      { label: '-1', value: -1 }
    ],
    predictionQuestion: 'Wat is groter: -√2 of -1,5? Leg uit waarom.',
    predictionCorrect: '-1.5',
    predictionExplanation: '-√2 ≈ -1,414. -1,5 = -1,500. Op de getallenas: -1,414 ligt rechts van -1,500, dus -√2 > -1,5. Het getal dat het dichtst bij 0 ligt is het grootst.',
    workedExample: {
      title: 'Voorbeeld: -π, -√5, -√2, -2.5 ordenen',
      steps: [
        'Bepaal de benaderingen: -π ≈ -3,142 | -√5 ≈ -2,236 | -√2 ≈ -1,414 | -2,5 blijft -2,5',
        'Bij negatieve getallen is "groter" = dichter bij 0. De volgorde van klein naar groot:',
        '-3 < -π(-3,142) < -2,5 < -√5(-2,236) < -2 < -√3(-1,732) < -√2(-1,414) < -1',
        'Controle: -3 is het verst van 0 (kleinst), -1 is het dichtst bij 0 (grootst).'
      ],
      label: '-3 < -π < -2.5 < -√5 < -2 < -√3 < -√2 < -1'
    },
    hintLevels: [
      'Bij negatieve getallen: hoe groter het getal zonder minteken, hoe KLEINER het negatieve getal. Bijv. -5 is kleiner dan -2, ook al is 5 > 2.',
      'Benader: -π ≈ -3,142, -√5 ≈ -2,236, -√3 ≈ -1,732, -√2 ≈ -1,414. Welke is het kleinst? Degene die het verst van 0 ligt.',
      '-3 < -π(-3,142) < -2,5 < -√5(-2,236) < __ < -√3(-1,732) < -√2(-1,414) < __'
    ],
    whyExplanation: 'Bij het ordenen van negatieve getallen keert de logica om: het getal met de grootste absolute waarde is het KLEINST. Denk aan de getallenas: hoe verder links van 0, hoe kleiner het getal.',
    errorPatterns: [
      { check: (items) => {
          const vals = items.map(i => i.value)
          // Check if -π comes before -3 (should be -3 < -π)
          const neg3Idx = items.findIndex(i => i.label === '-3')
          const negPiIdx = items.findIndex(i => i.label === '-π')
          return neg3Idx >= 0 && negPiIdx >= 0 && negPiIdx < neg3Idx
        }, message: 'Let op! -3 ≈ -3,000 en -π ≈ -3,142. Omdat 3,142 > 3,000 is -π KLEINER dan -3. -3 moet links van -π staan!'
      },
      { check: (items) => {
          const vals = items.map(i => i.value)
          return vals.some((v, i) => i > 0 && v < 0 && vals[i-1] < 0 && v > vals[i-1] && Math.abs(v) < Math.abs(vals[i-1]))
        }, message: 'Let op met negatieve getallen! Je sorteert op wie het KLEINST is (meest negatief), niet op absolute grootte. -3/4 = -0,75 is GROTER dan -1,5. Denk aan de getallenas: links = kleiner.'
      }
    ],
    reflectionQuestion: 'Als a > b > 0, wat weet je dan over -a en -b? Vergelijk -a en -b. Is -a groter of kleiner dan -b? Bewijs je antwoord.',
    reflectionAnswer: 'Als a > b > 0, dan is -a < -b. Want vermenigvuldigen met -1 keert het teken om. Voorbeeld: 5 > 3, dus -5 < -3. Het grotere positieve getal wordt het kleinere negatieve getal.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Game state
const availableNumbers = ref([])
const slots = ref([])

let draggedItem = null
let draggedFrom = null

function onDragStart(item, source) {
  if (isCorrect.value) return
  draggedItem = item
  draggedFrom = source
}

function onDrop(targetIndex) {
  if (!draggedItem || isCorrect.value) return

  const existing = slots.value[targetIndex]

  if (draggedFrom === 'available') {
    availableNumbers.value = availableNumbers.value.filter(n => n.id !== draggedItem.id)
    if (existing) availableNumbers.value.push(existing)
  } else {
    slots.value[draggedFrom] = existing
  }

  slots.value[targetIndex] = draggedItem
  draggedItem = null
  draggedFrom = null
  isChecked.value = false

  if (slots.value.every(s => s !== null)) {
    autoValidate()
  }
}

function autoValidate() {
  const slotValues = slots.value.map(s => s.value)
  let isSorted = true
  let errorIndex = -1
  for (let i = 0; i < slotValues.length - 1; i++) {
    if (slotValues[i] > slotValues[i + 1]) {
      isSorted = false
      errorIndex = i
      break
    }
  }

  if (isSorted) {
    isCorrect.value = true
    isChecked.value = true
    showWhy.value = true
    feedback.value = {
      type: 'success',
      text: 'Prima! Je hebt alle reële getallen correct van klein naar groot geordend.'
    }
  } else {
    attemptCount.value++
    isChecked.value = true

    const val1 = slots.value[errorIndex].label
    const val2 = slots.value[errorIndex + 1].label

    // Check error patterns first
    let errorFound = false
    for (const pattern of currentLevelData.value.errorPatterns) {
      if (pattern.check(slots.value)) {
        feedback.value = { type: 'error', text: pattern.message }
        errorFound = true
        break
      }
    }

    if (!errorFound) {
      const isNeg = slotValues[errorIndex] < 0 && slotValues[errorIndex + 1] < 0
      if (attemptCount.value <= 2) {
        const baseHint = `Foutje: ${val1} is groter dan ${val2}. `
        if (isNeg) {
          feedback.value = {
            type: 'error',
            text: baseHint + `Bij negatieve getallen is het getal met de grootste absolute waarde (zonder min) juist het kleinst! (${val1} vs ${val2})`
          }
        } else {
          feedback.value = {
            type: 'error',
            text: baseHint + 'Zet alles om naar kommagetallen en vergelijk opnieuw. ' + currentLevelData.value.hintLevels[0]
          }
        }
      } else {
        const sorted = [...slots.value].sort((a, b) => a.value - b.value)
        feedback.value = {
          type: 'error',
          text: `De juiste volgorde is: ${sorted.map(n => n.label).join(' < ')}. ` + currentLevelData.value.hintLevels[Math.min(hintCount.value, 2)]
        }
      }
    }
  }
}

function returnToAvailable(index) {
  if (isCorrect.value) return
  const item = slots.value[index]
  if (item) {
    slots.value[index] = null
    availableNumbers.value.push(item)
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
    if (userAns === correctAns) {
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
  feedback.value = { type: 'info', text: 'Plaats alle getallen in de juiste volgorde.' }
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
  feedback.value = { type: 'info', text: 'Plaats alle getallen in de juiste volgorde.' }
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
    const numList = shuffle([...currentLevelData.value.numbers]).map((n, idx) => ({ ...n, id: `n${idx}` }))
    availableNumbers.value = numList
    const slotCount = numList.length
    slots.value = new Array(slotCount).fill(null)
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
                  Beschikbare getallen
                </p>
                <div class="flex flex-wrap gap-2 justify-center">
                  <div v-for="num in availableNumbers" :key="num.id"
                       draggable="true"
                       @dragstart="onDragStart(num, 'available')"
                       class="flex items-center justify-center w-14 h-14 bg-white border-2 border-slate-300 rounded-xl shadow-sm text-lg font-bold text-slate-700 cursor-grab hover:border-amber-500 hover:text-amber-600 active:cursor-grabbing transition-colors font-mono">
                    {{ num.label }}
                  </div>
                  <div v-if="availableNumbers.length === 0" class="text-sm text-slate-400 italic py-4">
                    Alle getallen zijn geplaatst.
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
                Ik kan nu reële getallen (breuken, decimalen, irrationale getallen) correct ordenen van klein naar groot.
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
                Sleep de getallen naar de juiste volgorde
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

        <!-- Right panel: Drop zones -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-x-auto animate-fadeIn">

              <div class="relative flex items-center min-w-max px-12 py-24">
                <div class="absolute h-3 bg-slate-800 rounded-full left-0 right-0 top-1/2 -translate-y-1/2 z-0 shadow-sm"></div>
                <div class="absolute w-6 h-6 bg-slate-800 rounded-full -left-2 top-1/2 -translate-y-1/2 clip-triangle-left"></div>
                <div class="absolute w-6 h-6 bg-slate-800 rounded-full -right-2 top-1/2 -translate-y-1/2 clip-triangle-right"></div>

                <div class="absolute left-8 -top-8 text-slate-500 font-bold tracking-widest uppercase text-sm">Klein</div>
                <div class="absolute right-8 -top-8 text-slate-500 font-bold tracking-widest uppercase text-sm">Groot</div>

                <div class="relative z-10 flex gap-8 px-12">
                  <div v-for="(slot, index) in slots" :key="index"
                       class="relative flex flex-col items-center">

                    <div class="w-2 h-6 bg-slate-800 mb-3 rounded-full z-10"></div>

                    <div @dragover.prevent
                         @drop="onDrop(index)"
                         class="w-20 h-20 rounded-xl flex items-center justify-center border-4 transition-all relative"
                         :class="slot ? (isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_15px_#10b981]' : 'border-amber-500 bg-white shadow-md') : 'border-dashed border-slate-400 bg-slate-200/50'">

                      <div v-if="slot"
                           draggable="true"
                           @dragstart="onDragStart(slot, index)"
                           class="w-full h-full flex items-center justify-center text-xl font-black text-slate-800 cursor-grab active:cursor-grabbing font-mono select-none">
                        {{ slot.label }}
                      </div>

                      <button v-if="slot && !isCorrect"
                              @click="returnToAvailable(index)"
                              class="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-red-200 hover:text-red-700 shadow-md border-2 border-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                        <PhX class="w-3 h-3" weight="bold" />
                      </button>
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
    background-position: center center;
}

.clip-triangle-left { clip-path: polygon(100% 0, 0 50%, 100% 100%); }
.clip-triangle-right { clip-path: polygon(0 0, 100% 50%, 0 100%); }

.animate-fadeIn {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
