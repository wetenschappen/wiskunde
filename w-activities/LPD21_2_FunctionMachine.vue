<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhFunction,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Functiemachine Reverse-Engineering'
  },
  instruction: {
    type: String,
    default: 'Sleep getallen in de machine om te ontdekken wat hij doet. Bouw daarna het interne mechanisme f(x) = ax + b na!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhFunction }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showWorkedExample = ref(true)
const showReflection = ref(false)
const reflectionAnswer = ref('')

// Prediction gate state
const predictionPhase = ref(false)
const predictionValue = ref('')
const predictionChecked = ref(false)
const predictionCorrect = ref(false)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const result = []

  // Level 1: Small positive integer a
  const a1 = Math.floor(Math.random() * 4) + 2 // 2..5
  const b1 = Math.floor(Math.random() * 7) - 3 // -3..3
  result.push({
    targetA: a1,
    targetB: b1,
    hint1: 'Bereken het verschil tussen opeenvolgende outputs. Dat verschil is a (de richtingsco\u00ebffici\u00ebnt).',
    hint2: 'Voorbeeld: outputs 2, 5, 8, 14: verschil = 3, dus a = 3. b = f(0). Wat is f(0) bij jou?',
    hint3: `Verschil = __, dus a = __. f(0) = __, dus b = __.`,
    reflection: 'Hoe kan je a en b herkennen in een tabel met inputs en outputs?',
    why: 'Een lineaire functie f(x) = ax + b heeft een constante helling a. Het verschil tussen opeenvolgende outputs is altijd a. Het startgetal b is de output bij x = 0.'
  })

  // Level 2: Negative slope a
  const a2 = -(Math.floor(Math.random() * 4) + 1) // -4..-1
  const b2 = Math.floor(Math.random() * 9) - 4 // -4..4
  result.push({
    targetA: a2,
    targetB: b2,
    hint1: 'Let op of de output groter of kleiner wordt als de input toeneemt. Daalt de output? Dan is a negatief.',
    hint2: 'Voorbeeld: outputs 5, 2, -1, -7: verschil = -3, dus a = -3. Bereken nu het verschil bij jouw tabel.',
    hint3: `Verschil = __, dus a = __. f(0) = __, dus b = __.`,
    reflection: 'Hoe kan je aan de tabel zien of a positief of negatief is?',
    why: 'Een negatieve a betekent dat de functie daalt: hoe groter x, hoe kleiner f(x). Een positieve a betekent stijgen.'
  })

  // Level 3: Fractional a
  const aOptions = [0.5, 1.5, -0.5, -1.5]
  const a3 = aOptions[Math.floor(Math.random() * aOptions.length)]
  const b3 = Math.floor(Math.random() * 5) - 2 // -2..2
  result.push({
    targetA: a3,
    targetB: b3,
    hint1: 'Kijk naar het verschil tussen outputs. Is het geen geheel getal? Dan is a misschien een breuk.',
    hint2: 'Voorbeeld: outputs 1, 2.5, 4, 7: verschil = 1.5, dus a = 1.5. Bereken het verschil en deel door 1.',
    hint3: `Verschil tussen x=0 en x=1: __. Dus a = __. f(0) = __, dus b = __.`,
    reflection: 'Hoe zou de grafiek eruitzien als a een breuk is tussen 0 en 1?',
    why: 'Een fractionele a betekent dat de functie trager stijgt of daalt. Bij a = 0.5 stijgt de output met een halve eenheid per stap.'
  })

  return result
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State
const inputs = [0, 1, 2, 4]
const history = ref([])
const currentOutput = ref('?')
const draggedItem = ref(null)

const userA = ref(1)
const userB = ref(0)
const predictionNeeded = ref(false)
const dragPhase = ref('initial') // 'initial' | 'collecting' | 'prediction' | 'confirming'

function applyFunction(x) {
  return currentLevelData.value.targetA * x + currentLevelData.value.targetB
}

function onDragStart(num) {
  if (isCorrect.value || predictionPhase.value) return
  draggedItem.value = num
}

function onDrop() {
  if (draggedItem.value !== null && !isCorrect.value && !predictionPhase.value) {
    const out = applyFunction(draggedItem.value)
    currentOutput.value = out
    if (!history.value.some(h => h.in === draggedItem.value)) {
      history.value.push({ in: draggedItem.value, out: out })
      history.value.sort((a, b) => a.in - b.in)
    }
    draggedItem.value = null
    isChecked.value = false

    // After 2 data points, trigger prediction
    if (history.value.length >= 2 && !predictionChecked.value) {
      predictionPhase.value = true
      predictionNeeded.value = true
      feedback.value = {
        type: 'info',
        text: 'Je hebt 2 outputs verzameld! Voorspel nu: wat is f(3)? Bereken eerst a en b.'
      }
    }
  }
}

function checkPrediction() {
  const predicted = parseFloat(predictionValue.value)
  const actual = applyFunction(3)
  const targetA = currentLevelData.value.targetA
  const targetB = currentLevelData.value.targetB
  const hintIdx = Math.min(attemptCount.value, 2)
  const hints = [
    `Bereken eerst a = (y2 - y1) / (x2 - x1). Gebruik je twee outputs.`,
    `Voorbeeld: outputs 3 en 5 bij x=0 en x=1: a = (5-3)/(1-0) = 2. b = f(0) = 3.`,
    `Jouw outputs: f(${history.value[0].in}) = ${history.value[0].out}, f(${history.value[1].in}) = ${history.value[1].out}. a = (${history.value[1].out} - ${history.value[0].out}) / (${history.value[1].in} - ${history.value[0].in}) = __. b = f(0) = __.`
  ]

  if (isNaN(predicted)) {
    feedback.value = { type: 'error', text: 'Voer een getal in als voorspelling.' }
    return
  }

  if (Math.abs(predicted - actual) < 0.01) {
    predictionCorrect.value = true
    predictionChecked.value = true
    predictionPhase.value = false
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: `Uitstekend! f(3) = ${actual}. Je hebt a = ${targetA} en b = ${targetB} correct afgeleid. Sleep nu de overige getallen om te bevestigen.`
    }
  } else {
    attemptCount.value++
    const guess = attemptCount.value
    if (guess === 1 && Math.abs(predicted - targetA) < 0.5) {
      feedback.value = { type: 'error', text: `Je a is goed, maar b nog niet. Wat is f(0)? Dat is b. ` + hints[guess > 2 ? 2 : guess] }
    } else if (guess === 1 && Math.abs(predicted - targetB) < 0.5) {
      feedback.value = { type: 'error', text: `Je b is goed, maar a nog niet. Hoeveel verandert de output per stap? ` + hints[guess > 2 ? 2 : guess] }
    } else {
      feedback.value = { type: 'error', text: hints[Math.min(guess - 1, 2)] }
    }
  }
}

function skipPrediction() {
  // If student can't predict, let them continue collecting data (like a hint path)
  predictionPhase.value = false
  predictionChecked.value = true
  predictionNeeded.value = false
  feedback.value = { type: 'info', text: 'Je mag verder experimenteren. Gebruik de hint-knop voor hulp.' }
}

function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [currentLevelData.value.hint1, currentLevelData.value.hint2, currentLevelData.value.hint3]
  feedback.value = { type: 'info', text: `Hint ${idx + 1}: ${hints[idx]}` }
}

function onDrag(e) {
  // No live drag tracking needed for this simple drag-drop
}

function checkAnswer() {
  isChecked.value = true
  if (history.value.length < 2) {
    isCorrect.value = false
    feedback.value = { type: 'error', text: 'Je hebt niet genoeg data verzameld! Test minstens 2 getallen in de machine om een patroon te kunnen zien.' }
    return
  }

  const targetA = currentLevelData.value.targetA
  const targetB = currentLevelData.value.targetB

  if (userA.value === targetA && userB.value === targetB) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.why
    }
  } else {
    attemptCount.value++
    if (userA.value !== targetA) {
      // Specific error analysis
      if (history.value.length >= 2) {
        const dx = history.value[1].in - history.value[0].in
        const dy = history.value[1].out - history.value[0].out
        if (dx !== 0) {
          const actualSlope = dy / dx
          if (Math.abs(actualSlope) > 0) {
            if (Math.abs(actualSlope - targetA) > 0.01 && userA.value === Math.round(actualSlope * 100) / 100) {
              feedback.value = {
                type: 'error',
                text: `Let op! Je hebt a = ${userA.value} ingevuld, maar dat is de helling tussen de twee eerste punten. Klopt die helling voor ALLE paren? Soms is er meer data nodig om het patroon te zien — probeer een derde getal in de machine.`
              }
              return
            }
          }
          // Confusing output with a
          if (history.value[1].out === userA.value) {
            feedback.value = {
              type: 'error',
              text: `Let op! a = ${userA.value} is een output, niet de richtingscoëfficiënt. a is het VERSCHIL tussen opeenvolgende outputs als x met 1 toeneemt. Outputs zijn: ${history.value.map(h => h.out).join(', ')}. Wat is het verschil tussen deze outputs?`
            }
            return
          }
        }
      }
      feedback.value = {
        type: 'error',
        text: `Let op! De richtingscoëfficiënt (a) klopt niet. Het verschil tussen outputs per stap is ${targetA}, niet ${userA.value}. Deel Δy door Δx.`
      }
    } else {
      // a correct but b wrong
      if (history.value.length > 0) {
        const firstInput = history.value[0]
        // Check if they confused b with output at x=0
        const calculatedB = firstInput.out - targetA * firstInput.in
        if (userB.value === firstInput.out) {
          feedback.value = {
            type: 'error',
            text: `Let op! Je hebt een output (f(${firstInput.in}) = ${firstInput.out}) ingevuld voor b, maar b = f(0), niet f(${firstInput.in}). b is de output wanneer x = 0, niet de eerste output die je ziet.`
          }
          return
        }
        if (userB.value === Math.round(calculatedB * 100) / 100) {
          feedback.value = {
            type: 'error',
            text: `Let op! b = ${userB.value} is correct voor x = ${firstInput.in}, maar controleer of je de formule f(x) = ${targetA}x + b correct hebt gebruikt.`
          }
          return
        }
      }
      feedback.value = {
        type: 'error',
        text: `Let op! De toename per eenheid (a = ${targetA}) is juist, maar je startwaarde (b) klopt niet. Wat is de output als x = 0? Gebruik: b = f(x) - ax voor een bekend punt.`
      }
    }
  }
}

function resetActivityState() {
  isCorrect = false
  celebrationDone = false
  isChecked = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: 'Bestudeer eerst het voorbeeld. Sleep dan getallen in de trechter om data te verzamelen.' }
  history.value = []
  currentOutput.value = '?'
  userA.value = 1
  userB.value = 0
  predictionPhase.value = false
  predictionValue.value = ''
  predictionChecked.value = false
  predictionCorrect.value = false
  predictionNeeded.value = false
  showWorkedExample.value = true
  showReflection.value = false
  reflectionAnswer.value = ''
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 2) {
    showReflection.value = false
    reflectionAnswer.value = ''
    handleNextInternal()
  } else {
    feedback.value = { type: 'error', text: 'Schrijf een korte gedachte op om verder te gaan.' }
  }
}

function handleNext() {
  if (isCorrect.value) {
    showReflection.value = true
    feedback.value = {
      type: 'info',
      text: currentLevelData.value.reflection
    }
  }
}

function handleNextInternal() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    levels.value = generateLevel()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
  if (e.key === 'Enter' && predictionPhase.value) {
    checkPrediction()
  }
  if (e.key === 'Enter' && showReflection.value) {
    submitReflection()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Worked example data
const workedExample = {
  title: 'Voorbeeld: f(x) = 2x + 1',
  table: [
    { x: 0, fx: 1 },
    { x: 1, fx: 3 },
    { x: 2, fx: 5 },
    { x: 4, fx: 9 }
  ],
  explanation: 'Verschil tussen outputs = 2, dus a = 2. f(0) = 1, dus b = 1.'
}
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
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
        <button @click="emit('close')"
                class="p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="p-4 mb-4 bg-amber-50 border border-amber-300 rounded-xl">
              <p class="font-bold text-amber-800 mb-2 text-sm uppercase tracking-wider">Voorbeeld</p>
              <p class="font-bold text-amber-900 mb-2">{{ workedExample.title }}</p>
              <div class="bg-white rounded-lg border border-amber-200 overflow-hidden mb-2">
                <div class="flex bg-amber-800 text-white text-sm">
                  <div class="flex-1 p-2 font-bold text-center border-r border-amber-600">Input (x)</div>
                  <div class="flex-1 p-2 font-bold text-center">Output f(x)</div>
                </div>
                <div v-for="row in workedExample.table" :key="row.x" class="flex border-b border-amber-100 last:border-0">
                  <div class="flex-1 p-2 text-center border-r border-amber-100 font-mono font-bold text-slate-700">{{ row.x }}</div>
                  <div class="flex-1 p-2 text-center font-mono font-bold text-amber-600">{{ row.fx }}</div>
                </div>
              </div>
              <p class="text-sm text-amber-700 mt-1">{{ workedExample.explanation }}</p>
            </div>

            <!-- Collected Data Table -->
            <div class="p-4 border-t border-slate-200 bg-slate-50 rounded-xl">
              <p class="font-bold text-slate-800 mb-2">Gelogde Data:</p>
              <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div class="flex bg-slate-800 text-white">
                  <div class="flex-1 p-2 font-bold text-center border-r border-slate-600">Input (x)</div>
                  <div class="flex-1 p-2 font-bold text-center">Output f(x)</div>
                </div>
                <div v-for="h in history" :key="h.in" class="flex border-b border-slate-100 last:border-0">
                  <div class="flex-1 p-2 text-center border-r border-slate-200 font-mono font-bold">{{ h.in }}</div>
                  <div class="flex-1 p-2 text-center font-mono text-amber-600 font-black">{{ h.out }}</div>
                </div>
                <div v-if="history.length === 0" class="p-4 text-center text-sm text-slate-400 italic">
                  Tabel is leeg. Sleep getallen in de machine.
                </div>
              </div>

              <!-- Prediction Gate -->
              <div v-if="predictionPhase" class="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                <p class="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <PhQuestion weight="bold" class="w-5 h-5" /> Voorspel!
                </p>
                <p class="text-sm text-amber-700 mb-3">Gebruik de twee outputs om a en b te berekenen. Wat is f(3)?</p>
                <div class="flex gap-2">
                  <input v-model="predictionValue" type="text" inputmode="decimal"
                         class="flex-1 p-3 border-2 border-amber-300 rounded-lg font-mono font-bold text-lg text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                         placeholder="f(3) = ?" @keydown.enter="checkPrediction" />
                  <button @click="checkPrediction"
                          class="px-4 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors">
                    Check
                  </button>
                </div>
                <button @click="skipPrediction" class="mt-2 text-xs text-slate-500 underline hover:text-slate-700">
                  Ik weet het niet, laat me verder experimenteren
                </button>
              </div>

              <!-- Sliders for a and b -->
              <div class="mt-6 space-y-6">
                <p class="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Bouw de formule</p>

                <div class="text-center bg-white p-4 rounded-lg border-2 border-slate-200 font-mono font-black text-xl text-slate-700">
                  f(x) = <span class="text-amber-600">{{ userA }}</span>x <span class="text-amber-700">{{ userB >= 0 ? '+ ' + userB : '- ' + Math.abs(userB) }}</span>
                </div>

                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700 flex justify-between">
                    <span>Vermenigvuldiger (a)</span>
                    <span class="text-amber-600">{{ userA }}</span>
                  </label>
                  <input type="range" v-model.number="userA" min="-5" max="5" step="0.5"
                         class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600">
                </div>

                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700 flex justify-between">
                    <span>Opteller (b)</span>
                    <span class="text-amber-700">{{ userB }}</span>
                  </label>
                  <input type="range" v-model.number="userB" min="-5" max="5" step="1"
                         class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700">
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success' || feedback.type === 'info',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                 }">
               <component :is="feedback.type === 'error' ? PhWarningCircle : PhCheckCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800">
                 <PhArrowClockwise />
              </button>

              <button @click="showHint"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-amber-600 bg-amber-50 border border-amber-300 hover:bg-amber-100">
                 <PhLightbulb class="w-5 h-5" />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50"
                      :disabled="history.length < 2">
                Controleer
              </button>

              <button v-else-if="showReflection"
                      @click="submitReflection"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg bg-amber-600 hover:bg-amber-500">
                <span>Reflecteer &amp; Verder</span>
                <PhArrowRight weight="bold" />
              </button>

              <button v-else @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg bg-amber-600 hover:bg-amber-500">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-if="showReflection" class="flex-1">
                <input v-model="reflectionAnswer"
                       placeholder="Schrijf je antwoord..."
                       class="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                       @keydown.enter="submitReflection" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 overflow-hidden gap-12"
                 style="background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem;">

              <!-- Inputs Panel -->
              <div class="flex gap-6">
                <div v-for="num in inputs" :key="num"
                     draggable="true"
                     @dragstart="onDragStart(num)"
                     class="w-16 h-16 bg-white border-4 border-slate-300 rounded-xl flex items-center justify-center text-2xl font-black text-slate-700 cursor-grab hover:border-amber-500 hover:text-amber-600 active:cursor-grabbing z-20 relative transition-colors"
                     :class="{ 'opacity-30 pointer-events-none': history.some(h => h.in === num) || predictionPhase }">
                  {{ num }}
                </div>
              </div>

              <!-- Machine -->
              <div class="relative flex flex-col items-center justify-center mt-4">

                <!-- Funnel (Drop zone) -->
                <div @dragover.prevent @drop="onDrop"
                     class="w-40 h-20 bg-slate-300 rounded-t-full border-t-8 border-l-8 border-r-8 border-slate-500 flex items-center justify-center z-10 transition-colors"
                     :class="draggedItem !== null && !predictionPhase ? 'bg-amber-200 border-amber-400' : ''">
                  <span class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-6"
                        :class="draggedItem !== null && !predictionPhase ? 'text-amber-700' : ''">Sleep Hier</span>
                </div>

                <!-- Body -->
                <div class="w-64 h-56 bg-slate-800 rounded-xl flex flex-col items-center justify-center relative z-20 border-b-[12px] border-slate-900 overflow-hidden">
                   <div class="text-5xl font-black text-white tracking-widest z-10 drop-shadow-md">f(x)</div>
                   <div class="absolute top-4 left-4 w-4 h-4 rounded-full"
                        :class="draggedItem !== null ? 'bg-amber-400' : 'bg-red-500'"></div>
                   <div class="absolute top-4 right-4 w-4 h-4 rounded-full"
                        :class="isCorrect ? 'bg-amber-400' : 'bg-amber-700'"></div>
                </div>

                <!-- Output pipe -->
                <div class="w-24 h-16 bg-slate-400 border-l-8 border-r-8 border-slate-500 z-10 relative flex justify-center">
                  <div :key="currentOutput"
                       class="absolute -bottom-8 w-20 h-20 bg-white border-4 border-amber-500 rounded-xl flex items-center justify-center text-3xl font-black text-amber-600 shadow-md z-0">
                    {{ currentOutput }}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #f59e0b;
  border: 3px solid white;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 3px;
  background: #fde68a;
}
input[type=range]::-moz-range-thumb {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #f59e0b;
  border: 3px solid white;
  cursor: pointer;
}
</style>
