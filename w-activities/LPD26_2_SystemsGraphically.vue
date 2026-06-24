<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair,
  PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Stelsels Grafisch Oplossen' },
  instruction: { type: String, default: 'Bepaal het type stelsel en vind de oplossing via de grafiek.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(true)
const predictedType = ref('')
const userPoint = ref(null)
const userTypeAnswer = ref('')
const graphRevealed = ref(false)
const hintLevel = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

// Grid constants
const gridSize = 40
const originX = 200
const originY = 200

// Helpers
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function formatEq(m, b) {
  let r = 'y = '
  if (m === 1) r += 'x'
  else if (m === -1) r += '-x'
  else if (Number.isInteger(m)) r += `${m}x`
  else r += `${m}x`
  if (b > 0) r += ` + ${b}`
  else if (b < 0) r += ` - ${Math.abs(b)}`
  return r
}

function formatEqMultiple(m, b, factor) {
  const left = factor === 1 ? 'y' : `${factor}y`
  const ms = m * factor
  let right = ''
  if (ms === 1) right += 'x'
  else if (ms === -1) right += '-x'
  else if (Number.isInteger(ms)) right += `${ms}x`
  else right += `${ms}x`
  const bs = b * factor
  if (bs > 0) right += ` + ${bs}`
  else if (bs < 0) right += ` - ${Math.abs(bs)}`
  return `${left} = ${right}`
}

// Worked example data
const WORKED_EXAMPLE = {
  f_str: 'y = 2x + 1',
  g_str: 'y = -x + 4',
  f: (x) => 2 * x + 1,
  g: (x) => -x + 4,
  point: { x: 1, y: 3 },
  lines: [
    { x1: -5, y1: 2*(-5)+1, x2: 5, y2: 2*5+1 },
    { x1: -5, y1: -(-5)+4, x2: 5, y2: -5+4 }
  ]
}

function generateLevel(levelIndex) {
  if (levelIndex === 0) {
    // Level 1: Intersecting lines (bepaald), predict then click
    const x0 = randomInt(-3, 3)
    const y0 = randomInt(-3, 3)
    const slopes = [0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2]
    let m1 = randomChoice(slopes)
    let m2
    do { m2 = randomChoice(slopes) } while (m2 === m1)
    const b1 = y0 - m1 * x0
    const b2 = y0 - m2 * x0
    return {
      type: 'bepaald',
      f_str: formatEq(m1, b1),
      f: (x) => m1 * x + b1,
      g_str: formatEq(m2, b2),
      g: (x) => m2 * x + b2,
      correctPoint: { x: x0, y: y0 },
      scenario: 'bepaald',
      hintLevels: [
        'Het snijpunt is waar beide lijnen elkaar kruisen. Kijk naar de richtingscoëfficiënten.',
        'Bij y=2x+1 en y=-x+4 snijden de lijnen in (1,3). Bij deze: vind waar beide lijnen elkaar snijden.',
        'Lijn 1 heeft rico ___ en lijn 2 rico ___. Het snijpunt is (x, y) = (___, ___)'
      ],
      lines: [
        { x1: -5, y1: m1*(-5)+b1, x2: 5, y2: m1*5+b1 },
        { x1: -5, y1: m2*(-5)+b2, x2: 5, y2: m2*5+b2 }
      ]
    }
  } else if (levelIndex === 1) {
    // Level 2: Identify scenario from graph
    const scenarios = ['bepaald', 'strijdig', 'onbepaald']
    const chosen = randomChoice(scenarios)
    if (chosen === 'bepaald') {
      const x0 = randomInt(-2, 2)
      const y0 = randomInt(-2, 2)
      const slopes = [0.5, 1, 1.5, 2, -0.5, -1]
      let m1 = randomChoice(slopes)
      let m2
      do { m2 = randomChoice(slopes) } while (m2 === m1)
      const b1 = y0 - m1 * x0
      const b2 = y0 - m2 * x0
      return {
        type: 'bepaald', scenario: 'bepaald',
        f_str: formatEq(m1, b1), f: (x) => m1*x+b1,
        g_str: formatEq(m2, b2), g: (x) => m2*x+b2,
        correctPoint: { x: x0, y: y0 },
        hintLevels: [
          'Kijk naar de lijnen: snijden ze? Zo ja: 1 oplossing (bepaald).',
          'Twee lijnen met verschillende richting snijden altijd in een punt.',
          'Rico\'s ___ en ___ zijn verschillend, dus ___ oplossing(en).'
        ],
        lines: [
          { x1: -5, y1: m1*(-5)+b1, x2: 5, y2: m1*5+b1 },
          { x1: -5, y1: m2*(-5)+b2, x2: 5, y2: m2*5+b2 }
        ]
      }
    } else if (chosen === 'strijdig') {
      const m = randomChoice([0.5, 1, 1.5, 2, -0.5, -1])
      let b1, b2; b1 = randomInt(-4, 4)
      do { b2 = randomInt(-4, 4) } while (b2 === b1)
      return {
        type: 'strijdig', scenario: 'strijdig',
        f_str: formatEq(m, b1), f: (x) => m*x+b1,
        g_str: formatEq(m, b2), g: (x) => m*x+b2,
        correctPoint: null,
        hintLevels: [
          'Kijk naar de richting van de lijnen. Zijn ze evenwijdig?',
          'y=2x+1 en y=2x-3: zelfde rico (2), ander intercept. Geen snijpunt = strijdig.',
          'Beide rico\'s = ___. Intercept 1 = ___, intercept 2 = ___. Dit is ___ (strijdig/onbepaald).'
        ],
        lines: [
          { x1: -5, y1: m*(-5)+b1, x2: 5, y2: m*5+b1 },
          { x1: -5, y1: m*(-5)+b2, x2: 5, y2: m*5+b2 }
        ]
      }
    } else {
      const m = randomChoice([0.5, 1, 1.5, 2, -0.5, -1])
      const b = randomInt(-4, 4)
      const factor = randomChoice([2, 3])
      return {
        type: 'onbepaald', scenario: 'onbepaald',
        f_str: formatEq(m, b), f: (x) => m*x+b,
        g_str: formatEqMultiple(m, b, factor), g: (x) => m*x+b,
        correctPoint: null,
        hintLevels: [
          'De lijnen vallen samen. Dat betekent dat de vergelijkingen equivalent zijn.',
          'y=2x+1 en 2y=4x+2: tweede is 2× eerste. Zelfde lijn = oneindig veel oplossingen.',
          'De vergelijkingen zijn ___ van elkaar. Dus ___ oplossing(en).'
        ],
        lines: [
          { x1: -5, y1: m*(-5)+b, x2: 5, y2: m*5+b },
          { x1: -5, y1: m*(-5)+b, x2: 5, y2: m*5+b }
        ]
      }
    }
  } else {
    // Level 3: Determine type from equations alone, then verify
    const scenarios = ['bepaald', 'strijdig', 'onbepaald']
    const chosen = randomChoice(scenarios)
    if (chosen === 'bepaald') {
      const x0 = randomInt(-2, 2)
      const y0 = randomInt(-2, 2)
      const slopes = [0.5, 1, 1.5, 2, -0.5, -1]
      let m1 = randomChoice(slopes)
      let m2
      do { m2 = randomChoice(slopes) } while (m2 === m1)
      const b1 = y0 - m1 * x0; const b2 = y0 - m2 * x0
      return {
        type: 'bepaald', scenario: 'bepaald',
        f_str: formatEq(m1, b1), f: (x) => m1*x+b1,
        g_str: formatEq(m2, b2), g: (x) => m2*x+b2,
        correctPoint: { x: x0, y: y0 },
        hintLevels: [
          'Vergelijk de richtingscoëfficiënten. Zijn ze gelijk of verschillend?',
          'Verschillende rico → 1 snijpunt. Zelfde rico, ander intercept → 0. Zelfde rico, zelfde intercept → oneindig veel.',
          'y = __x + __ en y = __x + __. Rico\'s: ___ en ___. Conclusie: ___ oplossing(en).'
        ],
        lines: [
          { x1: -5, y1: m1*(-5)+b1, x2: 5, y2: m1*5+b1 },
          { x1: -5, y1: m2*(-5)+b2, x2: 5, y2: m2*5+b2 }
        ]
      }
    } else if (chosen === 'strijdig') {
      const m = randomChoice([0.5, 1, 1.5, 2, -0.5, -1])
      let b1, b2; b1 = randomInt(-4, 4)
      do { b2 = randomInt(-4, 4) } while (b2 === b1)
      return {
        type: 'strijdig', scenario: 'strijdig',
        f_str: formatEq(m, b1), f: (x) => m*x+b1,
        g_str: formatEq(m, b2), g: (x) => m*x+b2,
        correctPoint: null,
        hintLevels: [
          'Schrijf beide als y = ... Vergelijk de rico. Als ze gelijk zijn: check de intercepten.',
          'Zelfde rico → evenwijdig. Zelfde rico + zelfde intercept → samenvallend (oneindig veel).',
          'y = __x + __ en y = __x + __. Rico 1 = rico 2 = ___. Intercept 1 = ___, intercept 2 = ___. Dit is ___.'
        ],
        lines: [
          { x1: -5, y1: m*(-5)+b1, x2: 5, y2: m*5+b1 },
          { x1: -5, y1: m*(-5)+b2, x2: 5, y2: m*5+b2 }
        ]
      }
    } else {
      const m = randomChoice([0.5, 1, 1.5, 2, -0.5, -1])
      const b = randomInt(-4, 4)
      const factor = randomChoice([2, 3])
      return {
        type: 'onbepaald', scenario: 'onbepaald',
        f_str: formatEq(m, b), f: (x) => m*x+b,
        g_str: formatEqMultiple(m, b, factor), g: (x) => m*x+b,
        correctPoint: null,
        hintLevels: [
          'Zijn de vergelijkingen veelvouden van elkaar? Deel de tweede door de factor.',
          'y=2x+1 en 2y=4x+2: deel tweede door 2 → y=2x+1. Zelfde vergelijking = oneindig veel.',
          'y = __x + __. Tweede vergelijking is ___ keer de eerste. Dus ___ oplossing(en).'
        ],
        lines: [
          { x1: -5, y1: m*(-5)+b, x2: 5, y2: m*5+b },
          { x1: -5, y1: m*(-5)+b, x2: 5, y2: m*5+b }
        ]
      }
    }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const showGraph = computed(() => {
  if (showWorkedExample.value) return true
  if (currentInternalLevel.value === 0) return !showPrediction.value
  if (currentInternalLevel.value === 2) return graphRevealed.value
  return true
})

function resetActivityState() {
  if (levels.value.length === 0) {
    levels.value = [0, 1, 2].map(i => generateLevel(i))
  }
  isCorrect.value = false
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  celebrationDone.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  attemptCount.value = 0
  hintLevel.value = 0
  userPoint.value = null
  userTypeAnswer.value = ''
  graphRevealed.value = false
  predictedType.value = ''
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value === 0
  if (currentInternalLevel.value !== 0) {
    showPrediction.value = false
  }
  if (showWorkedExample.value) {
    feedback.value = { type: 'info', text: '' }
  } else if (showPrediction.value) {
    const d = currentLevelData.value
    const typeLabel = d.type === 'bepaald' ? '1' : d.type === 'strijdig' ? '0' : 'oneindig veel'
    if (currentInternalLevel.value === 0) {
      feedback.value = { type: 'info', text: `Voorspel eerst: hoeveel oplossingen heeft dit stelsel? (1, 0, of oneindig veel?)` }
    } else if (currentInternalLevel.value === 1) {
      feedback.value = { type: 'info', text: 'Bekijk de grafiek en bepaal het type stelsel.' }
    } else {
      feedback.value = { type: 'info', text: 'Bepaal het type stelsel aan de hand van de vergelijkingen.' }
    }
  } else {
    feedback.value = { type: 'info', text: 'Interageer met de grafiek.' }
  }
  nextTick(() => mainArea.value?.focus())
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) {
    showPrediction.value = true
    feedback.value = { type: 'info', text: 'Voorspel: hoeveel oplossingen heeft dit stelsel?' }
  } else {
    showPrediction.value = false
    feedback.value = { type: 'info', text: 'Interageer met de grafiek.' }
  }
}

function checkPrediction() {
  const d = currentLevelData.value
  // --- Error detection ---
  // Confusing strijdig (parallel) vs onbepaald (same line)
  if (predictedType.value === 'strijdig' && d.type === 'onbepaald') {
    attemptCount.value++
    feedback.value = {
      type: 'error',
      text: 'Let op! Je verwart "strijdig" (evenwijdig, geen oplossing) met "onbepaald" (samenvallend, oneindig veel oplossingen). Bij evenwijdige lijnen hebben de vergelijkingen een verschillende constante term. Bij samenvallende lijnen is de tweede vergelijking een veelvoud van de eerste.'
    }
    return
  }
  if (predictedType.value === 'onbepaald' && d.type === 'strijdig') {
    attemptCount.value++
    feedback.value = {
      type: 'error',
      text: 'Let op! Je verwart "onbepaald" (samenvallend, oneindig veel oplossingen) met "strijdig" (evenwijdig, geen oplossing). Bij samenvallend is de tweede vergelijking een veelvoud van de eerste. Hier zijn de constanten niet evenredig, dus strijdig.'
    }
    return
  }
  // Confusing strijdig with bepaald — thinking parallel lines still intersect
  if (predictedType.value === 'bepaald' && (d.type === 'strijdig' || d.type === 'onbepaald')) {
    const rico1 = d.f_str.match(/(-?\d*\.?\d*)x/)
    const rico2 = d.g_str.match(/(-?\d*\.?\d*)x/)
    if (rico1 && rico2 && rico1[1] === rico2[1]) {
      attemptCount.value++
      feedback.value = {
        type: 'error',
        text: `Let op! Beide lijnen hebben dezelfde richtingscoëfficiënt (${rico1[1]}). Ze zijn dus evenwijdig of samenvallend — ze hebben geen uniek snijpunt. Een stelsel met dezelfde rico kan nooit "bepaald" (1 oplossing) zijn.`
      }
      return
    }
  }
  const correct = (d.type === 'bepaald' && predictedType.value === 'bepaald') ||
                  (d.type === 'strijdig' && predictedType.value === 'strijdig') ||
                  (d.type === 'onbepaald' && predictedType.value === 'onbepaald')
  if (correct) {
    showPrediction.value = false
    if (currentInternalLevel.value === 0) {
      feedback.value = { type: 'success', text: 'Juist! Klik nu op het exacte snijpunt in de grafiek.' }
    } else if (currentInternalLevel.value === 1) {
      feedback.value = { type: 'success', text: 'Juist! Bevestig je antwoord hieronder.' }
    } else {
      graphRevealed.value = true
      feedback.value = { type: 'success', text: 'Correct! Bekijk de grafiek ter verificatie.' }
    }
  } else {
    attemptCount.value++
    const d2 = currentLevelData.value
    const idx = Math.min(attemptCount.value - 1, 2)
    const hint = d2.hintLevels[idx]
    const typeLabel = predictedType.value === 'bepaald' ? '1 oplossing' : predictedType.value === 'strijdig' ? 'geen oplossing' : 'oneindig veel'
    feedback.value = { type: 'error', text: `Niet juist. Je koos "${typeLabel}". Hint: ${hint}` }
  }
}

function handleGridClick(e) {
  if (isCorrect.value || showPrediction.value || showWorkedExample.value) return
  const d = currentLevelData.value
  if (d.type !== 'bepaald') {
    feedback.value = { type: 'error', text: 'Dit stelsel heeft geen snijpunt. Gebruik de knoppen onderaan.' }
    return
  }

  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top
  let gridX = Math.round((clickX - originX) / gridSize)
  let gridY = Math.round((originY - clickY) / gridSize)
  gridX = Math.max(-5, Math.min(gridX, 5))
  gridY = Math.max(-5, Math.min(gridY, 5))

  userPoint.value = { x: gridX, y: gridY }

  if (gridX === d.correctPoint.x && gridY === d.correctPoint.y) {
    isCorrect.value = true
    showReflection.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! Het snijpunt (${d.correctPoint.x}, ${d.correctPoint.y}) is de unieke oplossing van dit stelsel.`
    }
  } else {
    attemptCount.value++
    const idx = Math.min(attemptCount.value - 1, 2)
    feedback.value = { type: 'error', text: `(${gridX}, ${gridY}) is niet het snijpunt. Hint: ${d.hintLevels[idx]}` }
  }
}

function setTypeAnswer(type) {
  if (isCorrect.value) return
  const d = currentLevelData.value
  userTypeAnswer.value = type

  const correct = (d.type === 'bepaald' && type === 'bepaald') ||
                  (d.type === 'strijdig' && type === 'strijdig') ||
                  (d.type === 'onbepaald' && type === 'onbepaald')

  if (correct) {
    isCorrect.value = true
    showReflection.value = true
    const msg = d.type === 'bepaald' ? '1 oplossing' : d.type === 'strijdig' ? 'geen oplossing (strijdig stelsel)' : 'oneindig veel oplossingen (onbepaald stelsel)'
    const why = d.type === 'bepaald' ? 'De lijnen hebben verschillende richtingscoëfficiënten, dus snijden ze in een uniek punt.' :
                d.type === 'strijdig' ? 'De lijnen hebben dezelfde richting (evenwijdig) maar een ander startpunt, dus snijden ze nooit.' :
                'De vergelijkingen zijn equivalent: de tweede is een veelvoud van de eerste. Het zijn dezelfde lijn.'
    feedback.value = {
      type: 'success',
      text: `Juist! Dit stelsel heeft ${msg}. ${why}`
    }
  } else {
    attemptCount.value++
    const idx = Math.min(attemptCount.value - 1, 2)
    feedback.value = { type: 'error', text: `Niet juist. Hint: ${d.hintLevels[idx]}` }
  }
}

function getWhyExplanation() {
  const d = currentLevelData.value
  if (d.type === 'bepaald') {
    return 'Twee rechten met een verschillende richtingscoëfficiënt snijden elkaar altijd in precies een punt. Dat punt voldoet aan beide vergelijkingen en is dus de unieke oplossing van het stelsel.'
  } else if (d.type === 'strijdig') {
    return 'Evenwijdige rechten (zelfde richtingscoëfficiënt) hebben geen gemeenschappelijk punt, want ze lopen op constante afstand van elkaar. Zonder snijpunt is er geen oplossing. Dit noemen we een strijdig stelsel.'
  } else {
    return 'Wanneer een vergelijking een veelvoud is van de andere, stellen ze exact dezelfde rechte voor. Elke punt op die rechte is een oplossing, dus zijn er oneindig veel oplossingen. Dit noemen we een onbepaald stelsel.'
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const goodWords = ['rico', 'richting', 'helling', 'evenwijdig', 'parallel', 'snij', 'oplossing', 'intercept', 'vergelijk']
  if (goodWords.some(w => ans.includes(w)) && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Denk na over de richtingscoëfficiënt (rico) en wat die zegt over het aantal oplossingen.' }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    levels.value[0] = generateLevel(0)
    levels.value[1] = generateLevel(1)
    levels.value[2] = generateLevel(2)
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    levels.value = [0, 1, 2].map(i => generateLevel(i))
    resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => mainArea.value?.focus())
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Stelsel y = 2x + 1 en y = -x + 4</p>
            <p class="text-sm text-slate-700 mb-1">We lossen dit algebraisch op en controleren grafisch.</p>
            <p class="text-sm font-mono font-bold text-slate-800 mb-1">Stap 1: Gelijkstellen: 2x + 1 = -x + 4</p>
            <p class="text-sm font-mono font-bold text-slate-800 mb-1">Stap 2: Oplossen: 3x = 3, dus x = 1</p>
            <p class="text-sm font-mono font-bold text-slate-800 mb-1">Stap 3: Invullen: y = 2(1) + 1 = 3</p>
            <p class="text-sm font-bold text-slate-700 mb-1">Oplossing: (1, 3)</p>
            <p class="text-xs text-slate-500 mb-2">In de grafiek snijden beide lijnen in (1, 3).</p>
            <div class="relative bg-white rounded-lg border border-slate-300 overflow-hidden mb-2" style="width: 200px; height: 200px; margin: 0 auto;">
              <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g stroke="#e2e8f0" stroke-width="0.5">
                  <line v-for="i in 11" :key="'v'+i" :x1="(i-1)*20" y1="0" :x2="(i-1)*20" y2="200" />
                  <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*20" x2="200" :y2="(i-1)*20" />
                </g>
                <line x1="100" y1="0" x2="100" y2="200" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="100+(-5)*20" :y1="100-(2*(-5)+1)*20" x2="100+5*20" :y2="100-(2*5+1)*20" stroke="#d97706" stroke-width="2" stroke-linecap="round" />
                <line x1="100+(-5)*20" :y1="100-(-(-5)+4)*20" x2="100+5*20" :y2="100-(-5+4)*20" stroke="#475569" stroke-width="2" stroke-linecap="round" />
                <circle cx="100+1*20" cy="100-3*20" r="5" fill="#d97706" stroke="#fff" stroke-width="2" />
                <text x="100+1*20+8" y="100-3*20-4" font-size="8" fill="#d97706" font-weight="bold">(1,3)</text>
              </svg>
            </div>
            <button @click="skipWorkedExample" class="mt-2 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdrachten →</button>
          </div>

          <!-- System display -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-1">{{ currentInternalLevel === 0 ? 'Klik op het snijpunt' : currentInternalLevel === 1 ? 'Identificeer het type stelsel' : 'Bepaal het type uit de vergelijkingen' }}</p>
            <div class="relative bg-white p-4 border border-slate-200 rounded-lg font-mono text-lg shadow-sm mt-2 border-l-4 border-l-amber-500">
              <span class="absolute left-[-18px] top-1/2 -translate-y-1/2 text-4xl font-light text-slate-400">{</span>
              <p class="text-amber-600 font-bold ml-4">{{ currentLevelData.f_str }}</p>
              <p class="text-slate-700 font-bold ml-4">{{ currentLevelData.g_str }}</p>
            </div>
          </div>

          <!-- Prediction gate -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel: Hoeveel oplossingen heeft dit stelsel?</p>
            <div class="flex flex-col gap-2">
              <button @click="predictedType = 'bepaald'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                :class="predictedType === 'bepaald' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                1 oplossing (snijdend)
              </button>
              <button @click="predictedType = 'strijdig'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                :class="predictedType === 'strijdig' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                Geen oplossing (evenwijdig)
              </button>
              <button @click="predictedType = 'onbepaald'" class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                :class="predictedType === 'onbepaald' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                Oneindig veel (samenvallend)
              </button>
            </div>
            <button v-if="predictedType" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">Bevestig</button>
          </div>

          <!-- Type identification (Levels 2-3 after prediction) -->
          <div v-if="!showPrediction && !showWorkedExample && (currentInternalLevel >= 1)" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner">
            <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Kies het type stelsel:</p>
            <button @click="setTypeAnswer('bepaald')" class="w-full py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all"
              :class="isCorrect && currentLevelData.type === 'bepaald' ? 'border-amber-500 bg-amber-100 text-amber-800' : userTypeAnswer === 'bepaald' && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
              1 oplossing (bepaald)
            </button>
            <button @click="setTypeAnswer('strijdig')" class="w-full py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all"
              :class="isCorrect && currentLevelData.type === 'strijdig' ? 'border-amber-500 bg-amber-100 text-amber-800' : userTypeAnswer === 'strijdig' && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
              Geen oplossing (strijdig)
            </button>
            <button @click="setTypeAnswer('onbepaald')" class="w-full py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all"
              :class="isCorrect && currentLevelData.type === 'onbepaald' ? 'border-amber-500 bg-amber-100 text-amber-800' : userTypeAnswer === 'onbepaald' && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
              Oneindig veel (onbepaald)
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom?</p>
            <p class="text-xs text-amber-700 leading-relaxed">{{ getWhyExplanation() }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2">{{ currentInternalLevel >= 2 ? 'Hoe kun je zonder grafiek bepalen of een stelsel 0, 1 of oneindig veel oplossingen heeft?' : 'Hoe bepaal je het aantal oplossingen aan de hand van de grafiek?' }}</p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4" role="status" aria-live="polite" aria-atomic="true"
            :class="{ 'bg-amber-100 text-amber-800 border-amber-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-slate-100 text-slate-800 border-slate-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="resetActivityState" class="p-3 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-3 px-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" class="inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right panel: Graph -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <!-- Worked example graph -->
          <div v-if="showWorkedExample" class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden" style="width: 400px; height: 400px;">
            <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#e2e8f0" stroke-width="1">
                <line v-for="i in 11" :key="'v'+i" :x1="(i-1)*40" y1="0" :x2="(i-1)*40" y2="400" />
                <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*40" x2="400" :y2="(i-1)*40" />
              </g>
              <line x1="200" y1="0" x2="200" y2="400" stroke="#94a3b8" stroke-width="2" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" stroke-width="2" />
              <line :x1="200+(-5)*40" :y1="200-(2*(-5)+1)*40" :x2="200+5*40" :y2="200-(2*5+1)*40" stroke="#d97706" stroke-width="3" stroke-linecap="round" />
              <line :x1="200+(-5)*40" :y1="200-(-(-5)+4)*40" :x2="200+5*40" :y2="200-(-5+4)*40" stroke="#475569" stroke-width="3" stroke-linecap="round" />
              <circle cx="200+1*40" cy="200-3*40" r="8" fill="#d97706" stroke="#fff" stroke-width="3" />
              <text x="200+1*40+12" y="200-3*40-6" font-size="14" fill="#d97706" font-weight="bold">(1, 3)</text>
            </svg>
          </div>

          <!-- Placeholder: prediction first -->
          <div v-else-if="!showGraph" class="flex items-center justify-center w-full h-full">
            <div class="text-center p-8 bg-white rounded-xl border-2 border-dashed border-slate-300 shadow-sm">
              <PhCrosshair weight="duotone" class="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p class="text-slate-500 font-medium">Beantwoord eerst de voorspelling</p>
              <p class="text-slate-400 text-sm">Daarna wordt de grafiek getoond.</p>
            </div>
          </div>

          <!-- Interactive graph -->
          <div v-else class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden"
               style="width: 400px; height: 400px;"
               @click="handleGridClick"
               :class="{ 'cursor-crosshair': !isCorrect && !showPrediction && !showWorkedExample, 'cursor-default': isCorrect }">
            <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#e2e8f0" stroke-width="1">
                <line v-for="i in 11" :key="'v'+i" :x1="(i-1)*40" y1="0" :x2="(i-1)*40" y2="400" />
                <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*40" x2="400" :y2="(i-1)*40" />
              </g>
              <line x1="200" y1="0" x2="200" y2="400" stroke="#94a3b8" stroke-width="2" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" stroke-width="2" />

              <!-- Graph lines -->
              <line :x1="200 + currentLevelData.lines[0].x1 * 40" :y1="200 - currentLevelData.lines[0].y1 * 40"
                    :x2="200 + currentLevelData.lines[0].x2 * 40" :y2="200 - currentLevelData.lines[0].y2 * 40"
                    stroke="#d97706" stroke-width="3" stroke-linecap="round" class="transition-all duration-300"
                    :stroke-dasharray="currentLevelData.type === 'onbepaald' && currentLevelData.lines[1].x1 === currentLevelData.lines[0].x1 ? '0' : 'none'" />

              <line :x1="200 + currentLevelData.lines[1].x1 * 40" :y1="200 - currentLevelData.lines[1].y1 * 40"
                    :x2="200 + currentLevelData.lines[1].x2 * 40" :y2="200 - currentLevelData.lines[1].y2 * 40"
                    stroke="#475569" stroke-width="3" stroke-linecap="round" class="transition-all duration-300"
                    :stroke-dasharray="currentLevelData.type === 'onbepaald' ? '8,8' : 'none'" />

              <!-- User clicked point -->
              <circle v-if="userPoint && !isCorrect"
                      :cx="originX + userPoint.x * gridSize"
                      :cy="originY - userPoint.y * gridSize"
                      r="6" fill="#ef4444" stroke="#fff" stroke-width="2" opacity="0.7" />

              <!-- Correct intersection point -->
              <circle v-if="isCorrect && currentLevelData.correctPoint"
                      :cx="originX + currentLevelData.correctPoint.x * gridSize"
                      :cy="originY - currentLevelData.correctPoint.y * gridSize"
                      r="8" fill="#d97706" stroke="#fff" stroke-width="3" class="animate-fadeIn" />
            </svg>
          </div>

          <!-- Graph legend -->
          <div v-if="showGraph && !showWorkedExample" class="flex items-center gap-6 mt-3 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <span class="inline-block w-4 h-1 rounded bg-amber-500"></span>
              <span>{{ currentLevelData.f_str }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-4 h-1 rounded bg-slate-600"></span>
              <span>{{ currentLevelData.g_str }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showReflection" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.cursor-crosshair { cursor: crosshair; }
.cursor-default { cursor: default; }
</style>
