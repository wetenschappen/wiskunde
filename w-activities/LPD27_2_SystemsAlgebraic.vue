<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBracketsCurly,
  PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Stelsels Algebraisch Oplossen (Substitutie)' },
  instruction: { type: String, default: 'Los het stelsel op via de substitutiemethode.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBracketsCurly }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(true)
const predictedSubstitution = ref('')
const substituted = ref(false)
const answeredVar = ref('')
const showVerification = ref(false)
const hintCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

// Helpers
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// Worked example
const WORKED_EXAMPLE = {
  eq1: 'y = 3x + 2',
  eq2: '2x + y = 12',
  steps: [
    'Stap 1: y is al geisoleerd: y = 3x + 2',
    'Stap 2: Vervang y in de tweede vergelijking: 2x + (3x + 2) = 12',
    'Stap 3: Los op: 5x + 2 = 12, dus 5x = 10, dus x = 2',
    'Stap 4: Vul x = 2 in in y = 3x + 2: y = 3(2) + 2 = 8'
  ],
  solution: 'Oplossing: (2, 8)'
}

// Helper: format y = mx + b
function formatYeq(m, b) {
  let r = 'y = '
  if (m === 1) r += 'x'
  else if (m === -1) r += '-x'
  else if (Number.isInteger(m)) r += `${m}x`
  else r += `${m}x`
  if (b > 0) r += ` + ${b}`
  else if (b < 0) r += ` - ${Math.abs(b)}`
  return r
}

// Helper: format expression like y = mx + b as right side only
function formatRightSide(m, b) {
  let r = ''
  if (m === 1) r += 'x'
  else if (m === -1) r += '-x'
  else if (Number.isInteger(m)) r += `${m}x`
  else r += `${m}x`
  if (b > 0) r += ` + ${b}`
  else if (b < 0) r += ` - ${Math.abs(b)}`
  return r
}

function generateLevel(levelIndex) {
  if (levelIndex === 0) {
    // y = mx + b,  ax + y = c
    const m = randomChoice([1, 2, 3, -1, -2])
    const b = randomInt(-3, 5)
    const a = randomInt(2, 4)
    const xVal = randomInt(-2, 4)
    const yVal = m * xVal + b
    const c = a * xVal + yVal

    const rightStr = formatRightSide(m, b)
    const subHtml = `<span class="text-amber-600">${a}x</span> + <span class="text-slate-700 font-bold bg-amber-50 px-2 rounded">(${rightStr})</span> = ${c}`

    return {
      goalText: 'Substitueer y in de tweede vergelijking.',
      eq1Left: 'y', eq1Right: rightStr,
      eq2LeftPre: `${a}x + `, eq2Var: 'y', eq2LeftPost: '', eq2Right: `${c}`,
      dragTarget: rightStr,
      substitutedStringHTML: subHtml,
      questionVar: 'x', answer: xVal,
      otherVar: 'y', otherVal: yVal,
      solution: `(${xVal}, ${yVal})`,
      f_str: formatYeq(m, b),
      g_str: `${a}x + y = ${c}`,
      m1: m, b1: b, m2: null, b2: null, a_coeff: a, c_const: c,
      hintLevels: [
        'y is al alleen (y = ...). Vervang y in de andere vergelijking door de uitdrukking rechts van het = teken.',
        `Voorbeeld: als y = 2x + 3 en 4x + y = 9, dan wordt 4x + (2x + 3) = 9. Doe hetzelfde.`,
        `${a}x + (${rightStr}) = ${c} → ${a + m}x + ${b} = ${c} → ${a + m}x = ${c - b} → x = __`
      ]
    }
  } else if (levelIndex === 1) {
    // x = y + b,  px + qy = s
    const b = randomInt(-4, 4)
    const p = randomChoice([2, 3])
    const qOptions = [1, 3, 4, 5].filter(n => n !== p)
    const q = randomChoice(qOptions)
    const yVal = randomInt(-2, 4)
    const xVal = yVal + b
    const s = p * xVal + q * yVal

    let rightStr
    if (b >= 0) rightStr = `y + ${b}`
    else rightStr = `y - ${Math.abs(b)}`

    const subHtml = `<span class="text-amber-600">${p}</span><span class="text-slate-700 font-bold bg-amber-50 px-2 rounded">(${rightStr})</span> + <span class="text-amber-600">${q}y</span> = ${s}`

    return {
      goalText: 'Substitueer x in de tweede vergelijking. Let op de haakjes!',
      eq1Left: 'x', eq1Right: rightStr,
      eq2LeftPre: `${p}`, eq2Var: 'x', eq2LeftPost: ` + ${q}y`, eq2Right: `${s}`,
      dragTarget: rightStr,
      substitutedStringHTML: subHtml,
      questionVar: 'y', answer: yVal,
      otherVar: 'x', otherVal: xVal,
      solution: `(${xVal}, ${yVal})`,
      f_str: `x = y ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`,
      g_str: `${p}x + ${q}y = ${s}`,
      m1: null, b1: null, m2: null, b2: null, a_coeff: null, c_const: null,
      hintLevels: [
        'x is al alleen (x = ...). Vervang x in de andere vergelijking. Plaats haakjes om de uitdrukking!',
        `Voorbeeld: als x = y + 1 en 2x + 3y = 17, dan 2(y + 1) + 3y = 17. Werk uit.`,
        `${p}(${rightStr}) + ${q}y = ${s} → ${p}y${b >= 0 ? ' + ' + p*b : ' - ' + Math.abs(p*b)} + ${q}y = ${s} → (${p + q})y = ${s - p*b} → y = __`
      ]
    }
  } else {
    // Level 3: y = -mx + b, x - y = s (mixed types, keeping existing structure)
    const m = randomChoice([1, 2])
    const b = randomInt(-3, 5)
    const xVal = randomInt(-2, 4)
    const yVal = -m * xVal + b
    const s = xVal - yVal

    const mxPart = m === 1 ? '-x' : `-${m}x`
    const rightStr = b >= 0 ? `${mxPart} + ${b}` : `${mxPart} - ${Math.abs(b)}`
    const subHtml = `<span class="text-amber-600">x</span> - <span class="text-slate-700 font-bold bg-amber-50 px-2 rounded">(${rightStr})</span> = ${s}`

    return {
      goalText: 'Substitueer y. Let extra op de haakjes en het minteken!',
      eq1Left: 'y', eq1Right: rightStr,
      eq2LeftPre: 'x - ', eq2Var: 'y', eq2LeftPost: '', eq2Right: `${s}`,
      dragTarget: rightStr,
      substitutedStringHTML: subHtml,
      questionVar: 'x', answer: xVal,
      otherVar: 'y', otherVal: yVal,
      solution: `(${xVal}, ${yVal})`,
      f_str: formatYeq(-m, b),
      g_str: `x - y = ${s}`,
      m1: -m, b1: b, m2: null, b2: null, a_coeff: null, c_const: null,
      hintLevels: [
        'y is geisoleerd. Vervang y in x - y = s. Het minteken voor y betekent: haakjes gebruiken!',
        `Voorbeeld: y = -2x + 3 en x - y = 6 → x - (-2x + 3) = 6 → x + 2x - 3 = 6 → 3x = 9 → x = 3.`,
        `x - (${rightStr}) = ${s} → x ${mxPart === '-x' ? '+' : '+'} ${Math.abs(m)}x - ${b} = ${s} → ${m + 1}x = ${s + b} → x = __`
      ]
    }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

let draggedItem = null

function onDragStart(item) {
  if (isCorrect.value || substituted.value) return
  draggedItem = item
}

function onDrop() {
  if (isCorrect.value) return
  if (draggedItem === currentLevelData.value.dragTarget) {
    substituted.value = true
    draggedItem = null
    feedback.value = { type: 'success', text: 'Prima! Mooi gesubstitueerd! Reken nu de resulterende vergelijking uit.' }
  } else {
    attemptCount.value++
    draggedItem = null
    feedback.value = { type: 'error', text: 'Niet juist. Sleep de uitdrukking rechts van het = teken naar de variabele in de andere vergelijking.' }
  }
}

function resetActivityState() {
  if (levels.value.length === 0) {
    levels.value = [0, 1, 2].map(i => generateLevel(i))
  }
  isCorrect.value = false
  celebrationDone.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  substituted.value = false
  answeredVar.value = ''
  showVerification.value = false
  attemptCount.value = 0
  hintCount.value = 0
  predictedSubstitution.value = ''
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value === 0
  if (currentInternalLevel.value !== 0) {
    showPrediction.value = false
  }
  if (showWorkedExample.value) {
    feedback.value = { type: 'info', text: '' }
  } else if (showPrediction.value) {
    feedback.value = { type: 'info', text: 'Voorspel: wat ga je substitueren en waar?' }
  } else {
    feedback.value = { type: 'info', text: 'Sleep de uitdrukking naar de juiste plaats.' }
  }
  nextTick(() => mainArea.value?.focus())
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) {
    showPrediction.value = true
    feedback.value = { type: 'info', text: 'Voorspel: wat ga je substitueren en waar?' }
  } else {
    showPrediction.value = false
    feedback.value = { type: 'info', text: 'Sleep de uitdrukking naar de juiste plaats.' }
  }
}

function getPredictionOptions() {
  const d = currentLevelData.value
  if (d.eq1Left === 'y') {
    return [
      { value: 'sub_y_correct', label: `${d.eq1Right} substitueren voor y in de andere vergelijking` },
      { value: 'sub_y_wrong', label: `x substitueren voor y` },
      { value: 'sub_other', label: `y substitueren voor x` }
    ]
  } else {
    return [
      { value: 'sub_x_correct', label: `${d.eq1Right} substitueren voor x in de andere vergelijking` },
      { value: 'sub_x_wrong', label: `y substitueren voor x` },
      { value: 'sub_other', label: `x substitueren voor y` }
    ]
  }
}

function checkPrediction() {
  const d = currentLevelData.value
  const correct = (d.eq1Left === 'y' && predictedSubstitution.value === 'sub_y_correct') ||
                  (d.eq1Left === 'x' && predictedSubstitution.value === 'sub_x_correct')

  if (correct) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Sleep nu de uitdrukking naar de juiste plaats.' }
  } else {
    const correctOption = d.eq1Left === 'y'
      ? `${d.eq1Right} substitueren voor y`
      : `${d.eq1Right} substitueren voor x`
    feedback.value = { type: 'error', text: `Niet juist. ${d.eq1Left} is al geisoleerd. Wat wil dat zeggen? Denk: "${correctOption}"` }
  }
}

function getHint() {
  hintCount.value++
  const d = currentLevelData.value
  const idx = Math.min(hintCount.value - 1, 2)
  return d.hintLevels[idx]
}

function checkAnswer() {
  if (!substituted.value) {
    feedback.value = { type: 'error', text: 'Niet juist. Je moet eerst de substitutie uitvoeren door te slepen.' }
    return
  }

  const parsed = parseFloat(answeredVar.value)
  if (isNaN(parsed)) {
    feedback.value = { type: 'error', text: 'Voer een geldig getal in.' }
    return
  }

  if (parsed === currentLevelData.value.answer) {
    isCorrect.value = true
    showVerification.value = true
    const d = currentLevelData.value
    feedback.value = {
      type: 'success',
      text: `Perfect! ${d.questionVar} = ${d.answer}. Dan is ${d.otherVar} = ${d.otherVal}. De oplossing is ${d.solution}.`
    }
  } else {
    attemptCount.value++
    const hint = getHint()
    // Error analysis: detect common mistakes
    const d = currentLevelData.value
    const specificErrors = []

    // Not checking the substitution back (forgetting to verify)
    if (parsed !== 0 && d.otherVal !== undefined && Math.abs(d.answer) > 0) {
      if (parsed === d.answer + 1 || parsed === d.answer - 1) {
        specificErrors.push('Bijna! Je zit er 1 naast. Controleer of je de bewerkingen in de juiste volgorde hebt uitgevoerd (eerst vermenigvuldigen, dan optellen/aftrekken).')
      }
    }

    // Did they forget parentheses? Check if answer is off by sign or operation
    if (d.eq1Left === 'y' && d.questionVar === 'x') {
      const withoutParens = (d.m1 !== undefined && d.m1 !== null) ? (d.c_const - d.b1) / d.a_coeff : null
      if (withoutParens !== null && Math.abs(parsed - withoutParens) < 0.01) {
        specificErrors.push('Let op! Je hebt de haakjes vergeten bij de substitutie. De uitdrukking "' + d.eq1Right + '" moet tussen haakjes wanneer je ze invult. De haakjes zijn essentieel om het teken correct te houden. Bijvoorbeeld: 2x + (3x + 2) = 12, niet 2x + 3x + 2 = 12.')
      }
    }

    // Error: confusing x and y answer
    if (d.otherVal !== undefined && parsed === d.otherVal) {
      specificErrors.push(`Let op! Je hebt de waarde voor ${d.otherVar} ingevuld in plaats van voor ${d.questionVar}. ${d.questionVar} = ${d.answer} en ${d.otherVar} = ${d.otherVal}. Verwar de variabelen niet!`)
    }

    // Sign error check
    if (parsed === -d.answer) {
      specificErrors.push('Let op! Je antwoord heeft het verkeerde teken. Controleer of je de mintekens correct hebt overgenomen bij het oplossen. Vaak gaat het mis bij: negatief getal min iets, of bij het overbrengen naar de andere kant van het = teken.')
    }

    const errorMsg = specificErrors.length > 0
      ? specificErrors[0]
      : `Let op! Dit klopt niet. ${hint}`

    feedback.value = { type: 'error', text: errorMsg }
  }
}

function getWhyExplanation() {
  return 'De substitutiemethode vervangt een onbekende (bv. y) door een equivalente uitdrukking (bv. 3x + 2). Omdat y = 3x + 2 gelijk is, mogen we y overal vervangen door (3x + 2). Zo krijgen we een vergelijking met een onbekende, die we eenvoudig kunnen oplossen. Dit is krachtiger dan grafisch oplossen, want de algebraische methode geeft exacte antwoorden, ook bij breuken.'
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const goodWords = ['exact', 'nauwkeurig', 'breuk', 'algebra', 'substituti', 'vervang', 'precies', 'moeilijk']
  if (goodWords.some(w => ans.includes(w)) && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Denk aan: een grafiek geeft een benadering, algebra geeft een exact antwoord. Ook bij breuken of kommagetallen.' }
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Substitutiemethode</p>
            <div class="bg-white p-3 rounded border border-amber-200 mb-2 font-mono font-bold text-sm">
              <p class="text-slate-700">y = 3x + 2</p>
              <p class="text-slate-700">2x + y = 12</p>
            </div>
            <div class="text-sm text-slate-700 space-y-1">
              <p><strong>Stap 1:</strong> y is al geisoleerd (y = 3x + 2).</p>
              <p><strong>Stap 2:</strong> Vervang y in de 2e vergelijking: <span class="font-mono font-bold">2x + (3x + 2) = 12</span></p>
              <p><strong>Stap 3:</strong> Los op: 5x + 2 = 12, dus 5x = 10, dus x = <strong>2</strong></p>
              <p><strong>Stap 4:</strong> Vul x = 2 in: y = 3(2) + 2 = <strong>8</strong></p>
            </div>
            <p class="font-bold text-amber-700 text-sm mt-2">Oplossing: (2, 8)</p>
            <p class="text-xs text-slate-500 mt-1">We vervangen y door een gelijkwaardige uitdrukking (3x + 2) zodat er een vergelijking overblijft met alleen x.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdrachten →</button>
          </div>

          <!-- Goal -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
            <div class="relative bg-white p-3 border border-slate-200 rounded-lg font-mono text-base shadow-sm mt-2 border-l-4 border-l-amber-500">
              <span class="absolute left-[-18px] top-1/2 -translate-y-1/2 text-4xl font-light text-slate-400">{</span>
              <p class="text-amber-600 font-bold ml-4">{{ currentLevelData.f_str }}</p>
              <p class="text-slate-700 font-bold ml-4">{{ currentLevelData.g_str }}</p>
            </div>
          </div>

          <!-- Prediction gate -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel: wat ga je substitueren en waar?</p>
            <div class="flex flex-col gap-2">
              <button v-for="opt in getPredictionOptions()" :key="opt.value"
                      @click="predictedSubstitution = opt.value"
                      class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                      :class="predictedSubstitution === opt.value ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">
                {{ opt.label }}
              </button>
            </div>
            <button v-if="predictedSubstitution" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">Bevestig</button>
          </div>

          <!-- Substituted equation + answer input -->
          <div v-if="substituted && !showPrediction && !showWorkedExample" class="p-4 border-t border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner animate-fadeIn">
            <p class="font-bold text-slate-800 text-xs uppercase tracking-wider">Vergelijking met 1 onbekende:</p>
            <div class="bg-white p-3 border border-slate-200 rounded-lg font-mono text-base shadow-sm text-center" v-html="currentLevelData.substitutedStringHTML">
            </div>
            <div class="mt-2">
              <label class="block mb-2 text-sm font-bold text-slate-700">Wat is de waarde van {{ currentLevelData.questionVar }}?</label>
              <div class="flex items-center gap-3">
                <span class="font-mono text-lg font-bold">{{ currentLevelData.questionVar }} =</span>
                <input type="number" v-model="answeredVar"
                       @keyup.enter="checkAnswer"
                       class="flex-1 p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors"
                       placeholder="?">
              </div>
            </div>
          </div>

          <!-- Graphical verification -->
          <div v-if="showVerification && isCorrect" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Grafische verificatie</p>
            <p class="text-xs text-amber-700 mb-2">De oplossing {{ currentLevelData.solution }} is het snijpunt van de twee rechten.</p>
            <div class="bg-white rounded border border-slate-300 overflow-hidden mx-auto" style="width: 160px; height: 160px;">
              <svg width="100%" height="100%" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <g stroke="#e2e8f0" stroke-width="0.5">
                  <line v-for="i in 9" :key="'v'+i" :x1="(i-1)*20" y1="0" :x2="(i-1)*20" y2="160" />
                  <line v-for="i in 9" :key="'h'+i" x1="0" :y1="(i-1)*20" x2="160" :y2="(i-1)*20" />
                </g>
                <line x1="80" y1="0" x2="80" y2="160" stroke="#94a3b8" stroke-width="1" />
                <line x1="0" y1="80" x2="160" y2="80" stroke="#94a3b8" stroke-width="1" />
                <!-- First equation line -->
                <line v-if="currentLevelData.m1 !== null && currentLevelData.m1 !== undefined"
                      :x1="80 + (-4)*20" :y1="80 - (currentLevelData.m1 * (-4) + currentLevelData.b1)*20"
                      :x2="80 + 4*20" :y2="80 - (currentLevelData.m1 * 4 + currentLevelData.b1)*20"
                      stroke="#d97706" stroke-width="2" stroke-linecap="round" />
                <!-- Second equation line if in y = mx + b form, otherwise draw from points -->
                <line v-if="currentLevelData.m1 !== null && currentLevelData.m1 !== undefined && currentLevelData.m2 !== null"
                      :x1="80 + (-4)*20" :y1="80 - (currentLevelData.m2 * (-4) + currentLevelData.b2)*20"
                      :x2="80 + 4*20" :y2="80 - (currentLevelData.m2 * 4 + currentLevelData.b2)*20"
                      stroke="#475569" stroke-width="2" stroke-linecap="round" />
                <!-- Intersection point -->
                <circle :cx="80 + currentLevelData.answer * 20"
                        :cy="80 - currentLevelData.otherVal * 20"
                        r="4" fill="#d97706" stroke="#fff" stroke-width="2" />
              </svg>
            </div>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom werkt substitutie?</p>
            <p class="text-xs text-amber-700 leading-relaxed">{{ getWhyExplanation() }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2">Waarom is de substitutiemethode beter dan grafisch oplossen als de oplossing breuken bevat?</p>
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
            <button v-if="!substituted && !showPrediction && !showWorkedExample"
                    @click="checkAnswer"
                    :disabled="false"
                    class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-slate-600 hover:bg-slate-500 active:scale-[0.98]">
              Slepen...
            </button>
            <button v-if="substituted && !isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              Controleer
            </button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-3 px-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" class="inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right panel: visual drag-and-drop area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <!-- Worked example visual -->
          <div v-if="showWorkedExample" class="bg-white p-8 rounded-xl shadow-md border-2 border-amber-200 flex flex-col items-center gap-6">
            <p class="text-lg font-bold text-slate-700">Substitutiemethode: y = 3x + 2</p>
            <div class="text-3xl font-mono font-bold text-slate-700 flex items-center gap-4 bg-amber-50 p-4 rounded-lg">
              <span class="text-amber-600">y</span>
              <span class="text-slate-400">=</span>
              <span class="text-slate-700">3x + 2</span>
            </div>
            <div class="text-3xl font-mono font-bold text-slate-700 flex items-center gap-4 bg-white p-4 rounded-lg border-2 border-slate-200">
              <span class="text-amber-600">2x</span>
              <span>+</span>
              <span class="text-amber-600">y</span>
              <span class="text-slate-400">=</span>
              <span class="text-slate-700">12</span>
            </div>
            <div class="text-lg text-amber-700 font-bold p-3 bg-amber-50 rounded-lg border border-amber-300">
              <span class="font-mono">2x + (3x + 2) = 12</span>
            </div>
          </div>

          <!-- Drag and drop zone -->
          <div v-else class="flex flex-col items-center justify-center w-full gap-8">
            <!-- Equation 1 (source) -->
            <div class="bg-white p-6 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all"
                 :class="{ 'opacity-40 grayscale': substituted }">
              <span class="text-slate-700">{{ currentLevelData.eq1Left }}</span>
              <span class="text-slate-400">=</span>
              <div v-if="!substituted"
                   draggable="true"
                   @dragstart="onDragStart(currentLevelData.dragTarget)"
                   class="px-4 py-2 bg-amber-50 text-amber-700 border-2 border-amber-400 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none">
                {{ currentLevelData.eq1Right }}
              </div>
              <div v-else class="px-4 py-2 text-slate-500 line-through">
                {{ currentLevelData.eq1Right }}
              </div>
            </div>

            <div v-if="!substituted" class="text-sm text-slate-400 animate-fadeIn">
              <PhArrowDown weight="bold" class="inline w-5 h-5" /> Sleep de oranje uitdrukking naar de stippellijn
            </div>

            <!-- Equation 2 (drop target) -->
            <div class="bg-white p-6 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all"
                 :class="{ 'scale-105 shadow-lg border-amber-300': substituted }">
              <span class="text-amber-600">{{ currentLevelData.eq2LeftPre }}</span>

              <!-- Drop zone -->
              <div v-if="!substituted"
                   @dragover.prevent
                   @drop="onDrop"
                   class="w-24 h-16 border-4 border-dashed rounded-xl flex items-center justify-center transition-colors"
                   :class="draggedItem ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-slate-50'">
                <span class="text-slate-400 text-xl">{{ currentLevelData.eq2Var }}</span>
              </div>

              <div v-else class="px-4 py-2 bg-amber-50 text-amber-700 border-2 border-amber-400 rounded-xl animate-fadeIn whitespace-nowrap">
                ({{ currentLevelData.dragTarget }})
              </div>

              <span class="text-amber-600">{{ currentLevelData.eq2LeftPost }}</span>
              <span class="text-slate-400">=</span>
              <span class="text-slate-700">{{ currentLevelData.eq2Right }}</span>
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
.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }
.select-none { user-select: none; }
.line-through { text-decoration: line-through; }
</style>
