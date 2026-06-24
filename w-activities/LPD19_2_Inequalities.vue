<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Ongelijkheden Oplossen' },
  instruction: { type: String, default: 'Los de ongelijkheid op en teken de oplossing op de getallenas.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhX }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)

const phase = ref('instructions')
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintIndex = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

// ——— LEVEL GENERATION ———
function generateLevel() {
  const l1_aPool = [2, 3, 4]; const l1_xPool = [2, 3, 4, 5]
  const l1_a = l1_aPool[Math.floor(Math.random() * l1_aPool.length)]
  const l1_x = l1_xPool[Math.floor(Math.random() * l1_xPool.length)]
  const l1_b = l1_a * l1_x

  const l2_aPool = [2, 3, 4]; const l2_xPool = [-5, -4, -3, -2, -1]
  const l2_a = l2_aPool[Math.floor(Math.random() * l2_aPool.length)]
  const l2_x = l2_xPool[Math.floor(Math.random() * l2_xPool.length)]
  const l2_b = -l2_a * l2_x

  const l3_aPool = [2, 3]; const l3_xPool = [2, 3, 4, 5]
  const l3_a = l3_aPool[Math.floor(Math.random() * l3_aPool.length)]
  const l3_x = l3_xPool[Math.floor(Math.random() * l3_xPool.length)]
  const l3_b = 1 + Math.floor(Math.random() * 2)
  const l3_c = l3_a * l3_x + l3_b

  return [
    {
      problem: `${l1_a}x > ${l1_b}`,
      targetVal: l1_x, targetDirection: 'right', targetIncluded: false,
      targetInterval: `]${l1_x}, +∞[`, solutionStr: `x > ${l1_x}`,
      flips: false, multiStep: false, predictFlipAnswer: false, predictFirstOpAnswer: 'divide',
      hints: [
        `<strong>Hint 1:</strong> ${l1_a}x > ${l1_b}. Je wilt x alleen — wat is de bewerking?<br><span class="text-xs text-slate-500">Deel je door een positief getal, dan blijft het teken hetzelfde.</span>`,
        `<strong>Hint 2:</strong> Voorbeeld: 3x > 12 → deel door 3 → x > 4. Het > teken blijft. Pas dit toe op ${l1_a}x > ${l1_b}.`,
        `<strong>Hint 3:</strong> ${l1_a}x > ${l1_b} → deel door ${l1_a} → x > ${l1_b} ÷ ${l1_a} = x > ___`
      ]
    },
    {
      problem: `-${l2_a}x ≤ ${l2_b}`,
      targetVal: l2_x, targetDirection: 'right', targetIncluded: true,
      targetInterval: `[${l2_x}, +∞[`, solutionStr: `x ≥ ${l2_x}`,
      flips: true, multiStep: false, predictFlipAnswer: true, predictFirstOpAnswer: 'divide',
      hints: [
        `<strong>Hint 1:</strong> -${l2_a}x ≤ ${l2_b}. Je deelt door een NEGATIEF getal — wat gebeurt er met het teken?<br><span class="text-xs text-slate-500">Delen door een negatief getal klapt het teken om.</span>`,
        `<strong>Hint 2:</strong> Voorbeeld: -2x < 6 → deel door -2 → x > -3. Het teken klapte om! Nu bij jou: -${l2_a}x ≤ ${l2_b} → x ≥ ___`,
        `<strong>Hint 3:</strong> -${l2_a}x ≤ ${l2_b} → x ≥ ${l2_b} ÷ (${-l2_a}) = x ___ ___`
      ]
    },
    {
      problem: `${l3_c} - ${l3_a}x < ${l3_b}`,
      targetVal: l3_x, targetDirection: 'right', targetIncluded: false,
      targetInterval: `]${l3_x}, +∞[`, solutionStr: `x > ${l3_x}`,
      flips: true, multiStep: true, predictFlipAnswer: true, predictFirstOpAnswer: 'subtract',
      hints: [
        `<strong>Hint 1:</strong> ${l3_c} - ${l3_a}x < ${l3_b}. Eerst de ${l3_c} naar rechts. Dan deel je door een negatief getal.<br><span class="text-xs text-slate-500">Alleen × of ÷ door een negatief getal klapt het teken om — optellen/aftrekken niet.</span>`,
        `<strong>Hint 2:</strong> Voorbeeld: 7 - 2x < 3 → -2x < -4 → deel door -2 → x > 2. Nu bij jou: ${l3_c} - ${l3_a}x < ${l3_b} → -${l3_a}x < ${l3_b - l3_c} → x > ___`,
        `<strong>Hint 3:</strong> -${l3_a}x < ${l3_b - l3_c} → x > (${l3_b - l3_c}) ÷ (${-l3_a}) = x > ___`
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// ——— PREDICTION ———
const predictFlip = ref(null)
const predictFirstOp = ref(null)

const predictFirstOpOptions = computed(() => {
  const lvl = currentLevelData.value
  if (!lvl) return []
  if (lvl.multiStep) {
    return [
      { id: 'subtract', text: `Trek ${lvl.problem.split(' ')[0]} af van beide kanten` },
      { id: 'add', text: `Tel ${lvl.problem.split(' ')[0]} op bij beide kanten` },
      { id: 'divide', text: 'Deel beide kanten door x' }
    ]
  }
  return [
    { id: 'divide', text: 'Deel beide kanten door de coëfficiënt van x' },
    { id: 'multiply', text: 'Vermenigvuldig beide kanten met de coëfficiënt van x' },
    { id: 'subtract', text: 'Trek de coëfficiënt van x af' }
  ]
})

// ——— SOLVE ———
const userSolution = ref('')
const solveDone = ref(false)

// ——— NUMBER LINE ———
const userValue = ref(0)
const userDirection = ref('right')
const userIncluded = ref(false)
const numberlineDone = ref(false)

// ——— QUICK CHECK ———
const qcOptions = ref([])
const qcAnswer = ref(null)
const qcDone = ref(false)
const qcFeedback = ref('')

function generateQuickCheck() {
  const lvl = currentLevelData.value
  qcOptions.value = lvl.flips
    ? [
        { id: 'a', text: 'Het teken klapt niet om — alleen bij delen door een negatief getal', correct: true },
        { id: 'b', text: 'Het teken klapt ook om — optellen is hetzelfde als delen', correct: false },
        { id: 'c', text: 'De ongelijkheid wordt een vergelijking', correct: false }
      ]
    : [
        { id: 'a', text: 'Nee, het blijft > omdat we door een positief getal delen', correct: true },
        { id: 'b', text: 'Ja, delen door 2 klapt het teken altijd om', correct: false },
        { id: 'c', text: 'Ja, het teken klapt om omdat x positief is', correct: false }
      ]
}

// ——— REFLECTION ———
const reflectOptions = ref([])
const reflectAnswer = ref(null)
const reflectDone = ref(false)
const reflectFeedback = ref('')

function generateReflection() {
  const lvl = currentLevelData.value
  reflectOptions.value = lvl.flips
    ? [
        { id: 'a', text: 'Omdat negatieve getallen kleiner zijn dan positieve', correct: false, explanation: 'Niet precies. Het heeft te maken met spiegeling rond 0 op de getallenas.' },
        { id: 'b', text: 'Omdat delen door een negatief getal alle getallen aan weerszijden van 0 laat spiegelen op de as', correct: true, explanation: 'Juist! De getallen keren om op de as, dus het teken klapt.' },
        { id: 'c', text: 'Omdat het ongelijkheidsteken dan moe wordt van het rekenen', correct: false, explanation: 'Haha, leuk! Maar het heeft een wiskundige reden.' }
      ]
    : [
        { id: 'a', text: 'Door de uitkomst in te vullen in de oorspronkelijke ongelijkheid en te controleren', correct: true, explanation: 'Juist! Kies een getal dat voldoet en een dat niet voldoet — check beide.' },
        { id: 'b', text: 'Door de oplossing te tekenen op de getallenas (die klopt altijd)', correct: false, explanation: 'De getallenas is een hulpmiddel, geen controle — je kunt nog een foute oplossing tekenen.' },
        { id: 'c', text: 'Door het door de rekenmachine te halen', correct: false, explanation: 'Een rekenmachine geeft geen ongelijkheidsrelaties.' }
      ]
}

// ——— PHASE MANAGEMENT ———
function startLevel() {
  phase.value = 'predict'
  predictFlip.value = null; predictFirstOp.value = null
  userSolution.value = ''; solveDone.value = false
  userValue.value = 0; userDirection.value = 'right'; userIncluded.value = false; numberlineDone.value = false
  qcAnswer.value = null; qcDone.value = false; qcFeedback.value = ''
  reflectAnswer.value = null; reflectDone.value = false; reflectFeedback.value = ''
  isCorrect.value = false; celebrationDone.value = false; attemptCount.value = 0; hintIndex.value = 0
  feedback.value = { type: 'info', text: '' }
}

function submitPrediction() {
  const lvl = currentLevelData.value
  const flipOk = predictFlip.value === lvl.predictFlipAnswer
  const opOk = predictFirstOp.value === lvl.predictFirstOpAnswer
  if (flipOk && opOk) {
    feedback.value = { type: 'success', text: 'Goed voorspeld! Los nu algebraïsch op.' }
    phase.value = 'solve'
  } else if (!flipOk && !opOk) {
    feedback.value = { type: 'error', text: `Let op: het teken klapt ${lvl.flips ? 'WEL' : 'NIET'} om, en de eerste stap is ${lvl.multiStep ? 'de constante verplaatsen' : 'delen door de coëfficiënt van x'}.` }
  } else if (!flipOk) {
    feedback.value = { type: 'error', text: `Let op het teken! Deel je door een ${lvl.flips ? 'negatief' : 'positief'} getal, dan klapt het teken ${lvl.flips ? 'WEL' : 'NIET'} om.` }
  } else {
    feedback.value = { type: 'error', text: `De eerste stap is niet juist. ${lvl.multiStep ? 'Eerst de constante term verplaatsen.' : 'Je moet delen door de coëfficiënt van x.'}` }
  }
}

function checkSolution() {
  const lvl = currentLevelData.value
  const expected = lvl.solutionStr
  const answer = userSolution.value.trim().replace(/\s+/g, ' ')
  if (answer === expected) {
    solveDone.value = true; phase.value = 'numberline'
    feedback.value = { type: 'success', text: `Correct! Oplossing: ${expected}. Teken dit op de getallenas.` }
    return
  }
  attemptCount.value++
  const dirFlip = (answer.includes('<') && expected.includes('>')) || (answer.includes('>') && expected.includes('<'))
  const inclWrong = (answer.includes('≥') && expected.includes('>')) || (answer.includes('≤') && expected.includes('<')) ||
                   (answer.includes('>') && expected.includes('≥')) || (answer.includes('<') && expected.includes('≤'))
  const valWrong = answer.replace(/[<≥≤>]/g, '').trim() !== expected.replace(/[<≥≤>]/g, '').trim()
  const hints = lvl.hints; const idx = Math.min(hintIndex.value, hints.length - 1); hintIndex.value++

  if ((dirFlip) && !valWrong) {
    feedback.value = { type: 'error', text: `<strong>Bijna!</strong> Juist getal, verkeerde RICHTING. ${lvl.flips ? 'Delen door een negatief getal klapt het teken OM!' : 'Het teken blijft hetzelfde.'}<br><br>${hints[idx]}` }
  } else if (inclWrong && !valWrong) {
    feedback.value = { type: 'error', text: `<strong>Bijna!</strong> Juiste richting, maar let op het verschil tussen < en ≤ (of > en ≥). Moet de grenswaarde erbij horen?<br><br>${hints[idx]}` }
  } else if (valWrong && !dirFlip && !inclWrong) {
    feedback.value = { type: 'error', text: `<strong>De waarde klopt niet.</strong> Controleer je berekening.<br><br>${hints[idx]}` }
  } else {
    feedback.value = { type: 'error', text: hints[idx] }
  }
}

function checkNumberLine() {
  const lvl = currentLevelData.value
  const valOk = userValue.value === lvl.targetVal
  const dirOk = userDirection.value === lvl.targetDirection
  const incOk = userIncluded.value === lvl.targetIncluded
  if (valOk && dirOk && incOk) {
    numberlineDone.value = true; generateQuickCheck(); phase.value = 'quickcheck'
    feedback.value = { type: 'success', text: `Perfect! ${lvl.solutionStr} = ${lvl.targetInterval}.` }
  } else if (!valOk) feedback.value = { type: 'error', text: `De grenswaarde moet x = ${lvl.targetVal} zijn.` }
  else if (!dirOk) feedback.value = { type: 'error', text: `Richting verkeerd. x ${lvl.targetDirection === 'right' ? '>' : '<'} ${lvl.targetVal}, dus pijl naar ${lvl.targetDirection === 'right' ? 'rechts' : 'links'}.` }
  else feedback.value = { type: 'error', text: lvl.targetIncluded ? 'Gesloten bolletje (≤ of ≥) — grenswaarde hoort erbij.' : 'Open bolletje (< of >) — grenswaarde hoort er niet bij.' }
}

function submitQuickCheck() {
  if (qcAnswer.value === null) return
  const correct = qcOptions.value.find(o => o.correct)
  if (qcAnswer.value === correct.id) {
    qcDone.value = true; generateReflection(); phase.value = 'reflection'
    qcFeedback.value = ''; feedback.value = { type: 'success', text: 'Juist! Reflecteer nu op waarom dit werkt.' }
  } else qcFeedback.value = 'Niet helemaal. Denk nog eens na over de regels.'
}

function submitReflection() {
  if (reflectAnswer.value === null) return
  const correct = reflectOptions.value.find(o => o.correct)
  if (reflectAnswer.value === correct.id) {
    reflectDone.value = true; reflectFeedback.value = ''; phase.value = 'done'
    isCorrect.value = true
    feedback.value = { type: 'success', text: `Goed begrepen! ${correct.explanation}` }
  } else {
    const chosen = reflectOptions.value.find(o => o.id === reflectAnswer.value)
    reflectFeedback.value = chosen ? chosen.explanation : 'Niet juist, probeer opnieuw.'
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus())
  } else emit('complete')
}

function resetActivityState() {
  levels.value = generateLevel(); phase.value = 'instructions'; startLevel()
}

function skipInstructions() { if (phase.value === 'instructions') phase.value = 'predict' }

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
  if (e.key === 'Enter') {
    if (phase.value === 'solve' && !solveDone.value) checkSolution()
    if (phase.value === 'numberline' && !numberlineDone.value) checkNumberLine()
  }
}
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleKeydown) })

const exampleLevels = [
  { problem: '2x > 8', solution: 'x > 4', note: 'Deel door 2 (positief) → teken blijft' },
  { problem: '-3x ≤ 12', solution: 'x ≥ -4', note: 'Deel door -3 (NEGATIEF) → teken klapt om!' },
  { problem: '5 - 2x < 3', solution: 'x > 1', note: 'Eerst -5, dan ÷(-2) → teken klapt om!' },
]
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <!-- backdrop -->
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>

  <!-- modal -->
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-xl bg-white">

    <!-- header -->
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-slate-200 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2.5 rounded-xl bg-amber-50 ring-1 ring-amber-200">
          <component :is="props.icon" weight="fill" class="w-5 h-5 text-amber-500" />
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
      <button @click="emit('close')" class="p-2 text-slate-400 transition-colors rounded-xl hover:bg-slate-100 hover:text-slate-600 active:scale-[0.95]"><PhX class="w-5 h-5" weight="bold" /></button>
    </header>

    <main class="flex flex-1 overflow-hidden">

      <!-- ===== SIDEBAR ===== -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r-2 border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]">
          <h3 class="text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="prose prose-sm text-slate-600" />

          <!-- Instructions phase -->
          <div v-if="phase === 'instructions'" class="bg-amber-50 rounded-xl border-2 border-amber-200 overflow-hidden">
            <div class="p-4">
              <p class="font-bold text-amber-800 mb-3">Voorbeelden:</p>
              <div class="space-y-2">
                <div v-for="(ex, i) in exampleLevels" :key="i" class="bg-white p-3 rounded-lg border border-amber-200">
                  <p class="font-mono font-bold text-sm">{{ ex.problem }} <span class="text-emerald-700 font-normal">→ {{ ex.solution }}</span></p>
                  <p class="text-xs text-slate-500 mt-1">{{ ex.note }}</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 mt-3 p-2 bg-amber-100 rounded"><strong>Let op:</strong> Deel/vermenigvuldig je met een NEGATIEF getal? Dan klapt het teken om!</p>
            </div>
            <button @click="skipInstructions" class="w-full py-3 font-bold text-sm text-white bg-amber-600 hover:bg-amber-500 transition-colors">Begrepen, start de opdracht →</button>
          </div>

          <!-- Problem display -->
          <div v-if="phase !== 'instructions' && currentLevelData"
               class="text-center bg-amber-50 rounded-xl border-2 border-amber-200 p-4">
            <p class="font-mono text-xl font-black text-slate-800">{{ currentLevelData.problem }}</p>
            <p v-if="currentLevelData.flips && phase !== 'predict'" class="text-xs text-red-500 mt-1 font-medium">⚠️ Negatieve coëfficiënt — let op het teken!</p>
          </div>

          <!-- === PREDICT === -->
          <div v-if="phase === 'predict'">
            <div class="bg-amber-50 rounded-xl border-2 border-amber-300 p-5">
              <div class="flex items-center gap-2 mb-4">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600 shrink-0" />
                <span class="font-bold text-amber-800">Voorspel</span>
              </div>

              <p class="text-sm font-bold text-amber-800 mb-3">{{ currentLevelData.multiStep
                ? 'Moet het teken OMKLAPPEN in een van de stappen?'
                : 'Moet het ongelijkheidsteken OMKLAPPEN tijdens het oplossen?' }}</p>
              <div class="flex gap-3 mb-5">
                <button @click="predictFlip = true"
                  class="flex-1 py-3 rounded-xl font-bold border-2 text-sm transition-all active:scale-[0.98]"
                  :class="predictFlip === true ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-600 hover:border-amber-300'">Ja, klapt om</button>
                <button @click="predictFlip = false"
                  class="flex-1 py-3 rounded-xl font-bold border-2 text-sm transition-all active:scale-[0.98]"
                  :class="predictFlip === false ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-600 hover:border-amber-300'">Nee, blijft</button>
              </div>

              <p class="text-sm font-bold text-amber-800 mb-3">{{ currentLevelData.multiStep ? 'Wat is de EERSTE stap?' : 'Wat is de juiste bewerking?' }}</p>
              <div class="flex flex-col gap-2 mb-5">
                <button v-for="opt in predictFirstOpOptions" :key="opt.id" @click="predictFirstOp = opt.id"
                  class="w-full text-left py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.98]"
                  :class="predictFirstOp === opt.id ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-600 hover:border-amber-300'">{{ opt.text }}</button>
              </div>

              <button @click="submitPrediction" :disabled="predictFlip === null || predictFirstOp === null"
                class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">Bevestig voorspelling</button>
            </div>
          </div>

          <!-- === SOLVE === -->
          <div v-if="phase === 'solve'">
            <div class="bg-amber-50 rounded-xl border-2 border-amber-300 p-5">
              <p class="font-bold text-amber-800 text-sm mb-3">Los algebraïsch op</p>
              <p class="font-mono text-xl font-black text-slate-800 mb-4 text-center p-3 bg-white rounded-xl border border-amber-200">{{ currentLevelData.problem }}</p>
              <label class="block text-sm font-bold text-slate-700 mb-2">Typ de volledige oplossing:</label>
              <input v-model="userSolution" @keydown.enter="checkSolution" placeholder="b.v. x > 4"
                class="w-full p-3 text-lg font-mono font-bold border-2 border-slate-300 rounded-xl bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-3"
                :disabled="solveDone" />
              <button @click="checkSolution" :disabled="!userSolution.trim()"
                class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">Check oplossing</button>
            </div>
          </div>

          <!-- === NUMBER LINE === -->
          <div v-if="phase === 'numberline'">
            <div class="bg-amber-50 rounded-xl border-2 border-amber-300 p-5">
              <p class="font-bold text-amber-800 text-sm mb-3">Teken op de getallenas</p>
              <p class="font-mono font-bold text-center text-lg text-slate-800 mb-4 p-3 bg-white rounded-xl border border-amber-200">{{ currentLevelData.solutionStr }}</p>

              <div class="space-y-3">
                <div class="p-4 bg-white rounded-xl border border-amber-200">
                  <label class="block text-sm font-bold text-slate-700 mb-2">Grenswaarde: <span class="text-amber-600">{{ userValue }}</span></label>
                  <input type="range" v-model.number="userValue" min="-10" max="10" step="1" class="w-full accent-amber-600 h-2">
                  <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono"><span>-10</span><span>0</span><span>10</span></div>
                </div>

                <div class="p-4 bg-white rounded-xl border border-amber-200">
                  <label class="block text-sm font-bold text-slate-700 mb-2">Richting:</label>
                  <div class="flex gap-3">
                    <button @click="userDirection = 'left'" class="flex-1 py-3 rounded-xl font-bold border-2 text-lg transition-all active:scale-[0.98]"
                      :class="userDirection === 'left' ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-500 hover:border-amber-300'">← (x &lt;)</button>
                    <button @click="userDirection = 'right'" class="flex-1 py-3 rounded-xl font-bold border-2 text-lg transition-all active:scale-[0.98]"
                      :class="userDirection === 'right' ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-500 hover:border-amber-300'">(x &gt;) →</button>
                  </div>
                </div>

                <div class="p-4 bg-white rounded-xl border border-amber-200">
                  <label class="block text-sm font-bold text-slate-700 mb-2">Bolletje:</label>
                  <div class="flex gap-3">
                    <button @click="userIncluded = true" class="flex-1 py-3 rounded-xl font-bold border-2 text-sm transition-all active:scale-[0.98]"
                      :class="userIncluded ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-500 hover:border-amber-300'">Dicht (≤ of ≥)</button>
                    <button @click="userIncluded = false" class="flex-1 py-3 rounded-xl font-bold border-2 text-sm transition-all active:scale-[0.98]"
                      :class="!userIncluded ? 'border-amber-500 bg-amber-100 text-amber-800 shadow-sm' : 'border-slate-300 bg-white text-slate-500 hover:border-amber-300'">Open (&lt; of &gt;)</button>
                  </div>
                </div>

                <button @click="checkNumberLine" class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 transition-all active:scale-[0.98]">Teken op de as</button>
              </div>
            </div>
          </div>

          <!-- === QUICK CHECK === -->
          <div v-if="phase === 'quickcheck'">
            <div class="bg-emerald-50 rounded-xl border-2 border-emerald-300 p-5">
              <div class="flex items-center gap-2 mb-4">
                <PhQuestion weight="fill" class="w-5 h-5 text-emerald-600 shrink-0" />
                <span class="font-bold text-emerald-800">Snap je het?</span>
              </div>
              <p class="text-sm text-emerald-800 mb-4 p-3 bg-white rounded-xl border border-emerald-200">
                {{ currentLevelData.flips
                  ? 'Stel dat dezelfde ongelijkheid zonder het minteken was — zou het teken dan nog klappen?'
                  : 'Stel dat de ongelijkheid een minteken had — zou het teken dan klappen?' }}
              </p>
              <div class="flex flex-col gap-2 mb-4">
                <button v-for="opt in qcOptions" :key="opt.id" @click="qcAnswer = opt.id"
                  class="w-full text-left py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.98]"
                  :class="qcAnswer === opt.id ? 'border-emerald-500 bg-emerald-100 text-emerald-800 shadow-sm' : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-300'">{{ opt.text }}</button>
              </div>
              <p v-if="qcFeedback" class="text-sm text-red-600 mb-3 p-3 bg-red-50 rounded-xl border border-red-200">{{ qcFeedback }}</p>
              <button @click="submitQuickCheck" :disabled="qcAnswer === null"
                class="w-full py-3 font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">Bevestig</button>
            </div>
          </div>

          <!-- === REFLECTION === -->
          <div v-if="phase === 'reflection'">
            <div class="bg-indigo-50 rounded-xl border-2 border-indigo-300 p-5">
              <div class="flex items-center gap-2 mb-4">
                <PhLightbulb weight="fill" class="w-5 h-5 text-indigo-600 shrink-0" />
                <span class="font-bold text-indigo-800">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-800 mb-4 p-3 bg-white rounded-xl border border-indigo-200">{{ currentLevelData.flips
                ? 'Waarom moet het teken omklappen bij delen/vermenigvuldigen met een negatief getal?'
                : 'Hoe controleer je of je een ongelijkheid juist hebt opgelost?' }}</p>
              <div class="flex flex-col gap-2 mb-4">
                <button v-for="opt in reflectOptions" :key="opt.id" @click="reflectAnswer = opt.id"
                  class="w-full text-left py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.98]"
                  :class="reflectAnswer === opt.id ? 'border-indigo-500 bg-indigo-100 text-indigo-800 shadow-sm' : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300'">{{ opt.text }}</button>
              </div>
              <p v-if="reflectFeedback" class="text-sm text-indigo-600 mb-3 p-3 bg-indigo-100 rounded-xl border border-indigo-200 italic">{{ reflectFeedback }}</p>
              <button @click="submitReflection" :disabled="reflectAnswer === null"
                class="w-full py-3 font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">Bevestig</button>
            </div>
          </div>

          <!-- === DONE === -->
          <div v-if="phase === 'done'">
            <div class="bg-indigo-50 rounded-xl border-2 border-indigo-300 p-5">
              <p class="font-bold text-indigo-800 text-sm mb-2">{{ currentLevelData.flips ? 'Waarom klapt het teken om?' : 'Hoe controleer je?' }}</p>
              <p class="text-sm text-indigo-700 leading-relaxed">{{ currentLevelData.flips
                ? '2 < 5 is waar. Deel door -1: -2 < -5 is NIET waar. Maar -2 > -5 is wél waar. Het teken klapt om omdat getallen van plaats wisselen t.o.v. 0 op de getallenas.'
                : 'Kies een getal uit je oplossing (bv. x=5 bij x>4). 2·5 > 8 → 10 > 8 klopt! Kies ook een getal dat er niet in zit (bv. x=3): 2·3 > 8 → 6 > 8 klopt niet — dus je oplossing is correct.' }}</p>
            </div>
          </div>

        </div><!-- /mainArea -->

        <!-- ===== FOOTER ===== -->
        <div class="p-4 bg-slate-50 border-t-2 border-slate-200 shrink-0">
          <div v-if="feedback.text"
               class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-xl border-2 animate-fadeIn"
               :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-300': feedback.type === 'success', 'bg-red-50 text-red-800 border-red-300': feedback.type === 'error', 'bg-blue-50 text-blue-800 border-blue-300': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span v-html="feedback.text"></span>
          </div>
          <div class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 transition-colors rounded-xl text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98]"><PhArrowClockwise weight="bold" class="w-5 h-5" /></button>
            <button v-if="phase === 'done'" @click="handleNext" class="flex-1 py-3 font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
            <div v-else-if="phase !== 'instructions'" class="flex-1 py-3 text-sm font-medium text-slate-400 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
              {{ phase === 'predict' ? 'Beantwoord de vragen' : phase === 'solve' ? 'Type je oplossing' : phase === 'numberline' ? 'Teken op de as' : phase === 'quickcheck' ? 'Beantwoord de vraag' : 'Reflecteer' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT: NUMBER LINE VISUAL ===== -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center pattern-grid">
          <div class="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <div class="text-center mb-6">
              <div v-if="phase === 'done'" class="text-xl font-black text-emerald-700 font-mono">
                {{ currentLevelData.solutionStr }}
                <span class="text-sm text-slate-500 ml-2">({{ currentLevelData.targetInterval }})</span>
              </div>
              <div v-else-if="phase === 'numberline' || phase === 'quickcheck' || phase === 'reflection'" class="text-xl font-black text-amber-600 font-mono">{{ currentLevelData.solutionStr }}</div>
              <div v-else-if="phase === 'solve'" class="text-xl font-black text-slate-500 font-mono">Jouw oplossing: <span class="text-amber-600">{{ userSolution || '?' }}</span></div>
              <div v-else-if="phase === 'predict'" class="text-xl font-black text-slate-400 font-mono">{{ currentLevelData.problem }}</div>
            </div>

            <!-- number line -->
            <div class="relative w-full h-20 flex items-center mt-4">
              <div class="absolute inset-x-0 h-1.5 bg-slate-300 rounded-full"></div>
              <div class="absolute flex justify-between inset-x-4 px-2">
                <div v-for="i in 21" :key="i" class="w-0.5 h-4 bg-slate-400 relative">
                  <span v-if="(i-11) % 2 === 0" class="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">{{ i - 11 }}</span>
                </div>
              </div>
              <div v-if="phase === 'numberline' || phase === 'quickcheck' || phase === 'reflection' || phase === 'done'"
                   class="absolute h-3 bg-amber-500 rounded-full pointer-events-none transition-all duration-300 opacity-70"
                   :class="userDirection === 'left' ? 'rounded-r-none' : 'rounded-l-none'"
                   :style="{ left: userDirection === 'left' ? '0' : `calc(2rem + ${((userValue + 10) / 20) * 100}%)`, right: userDirection === 'right' ? '0' : `calc(2rem + ${((10 - userValue) / 20) * 100}%)` }"></div>
              <div v-if="phase === 'numberline' || phase === 'quickcheck' || phase === 'reflection' || phase === 'done'"
                   class="absolute w-6 h-6 rounded-full border-4 border-amber-600 transition-all duration-300 z-10 shadow-sm bg-white"
                   :style="{ left: `calc(1rem + 8px + ${((userValue + 10) / 20) * 100}%)`, transform: 'translateX(-50%)' }">
                <div v-if="userIncluded" class="w-full h-full bg-amber-600 rounded-full scale-[1.1]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>
<SuccessCelebration :show="phase === 'done' && isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 12px -8px rgba(0,0,0,0.08); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
