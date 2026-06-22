<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhListNumbers,
  PhArrowClockwise, PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Volgorde van Bewerkingen' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedParentOp = ref(null) // 'parens', 'power', 'muldiv', 'addsub'
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

const feedback = ref({ type: 'info', text: 'Klik op de bewerking die je als EERSTE moet uitvoeren.' })

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// ========== LEVEL GENERATION ==========
const levels = ref([])
const currentStepIdx = ref(0)

function generateLevel(index) {
  switch (index) {
    case 0: {
      // Level 1: Apply — basic precedence (powers > ×÷ > +-)
      const base = 2 + Math.floor(Math.random() * 6) // 2-7
      const pow = 2 + Math.floor(Math.random() * 2) // 2-3
      const mul = 2 + Math.floor(Math.random() * 4) // 2-5
      const result = base + mul * Math.pow(base, pow)
      return {
        goalText: 'Bereken: \( ' + base + ' + ' + mul + ' \\times ' + base + '^{' + pow + '} \)',
        answer: String(result),
        steps: [
          { label: 'Macht', highlight: base + '^' + pow, rule: 'Machten hebben voorrang op optellen en vermenigvuldigen.' },
          { label: 'Vermenigvuldiging', highlight: mul + ' × ' + Math.pow(base, pow), rule: 'Vermenigvuldigen gaat voor optellen.' },
          { label: 'Optelling', highlight: base + ' + ' + (mul * Math.pow(base, pow)), rule: 'Optellen als laatste.' }
        ],
        worked: {
          problem: base + ' + ' + mul + ' × ' + base + '^' + pow,
          steps: [
            'Stap 1: Macht eerst: \( ' + base + '^{' + pow + '} = ' + Math.pow(base, pow) + ' \)',
            'Stap 2: Vermenigvuldigen: \( ' + mul + ' \\times ' + Math.pow(base, pow) + ' = ' + (mul * Math.pow(base, pow)) + ' \)',
            'Stap 3: Optellen: \( ' + base + ' + ' + (mul * Math.pow(base, pow)) + ' = ' + result + ' \)'
          ],
          answer: result
        },
        correctFirstOp: 'power'
      }
    }
    case 1: {
      // Level 2: Analyze — multiple operations including parentheses
      const a = 3 + Math.floor(Math.random() * 8) // 3-10
      const b = 2 + Math.floor(Math.random() * 4) // 2-5
      const c = 2 + Math.floor(Math.random() * 4) // 2-5
      const paren = a + b
      const result = paren - Math.floor(paren / c)
      return {
        goalText: 'Bereken: \( ' + a + ' + ' + b + ' - (' + a + ' + ' + b + ') \\div ' + c + ' \)',
        answer: String(result),
        steps: [
          { label: 'Haakjes', highlight: '(' + a + ' + ' + b + ')', rule: 'Haakjes hebben ALTIJD voorrang.' },
          { label: 'Deling', highlight: (a + b) + ' ÷ ' + c, rule: 'Delen gaat voor aftrekken.' },
          { label: 'Aftrekking', highlight: (a + b) + ' - ' + Math.floor((a + b) / c), rule: 'Aftrekken als laatste.' }
        ],
        worked: {
          problem: a + ' + ' + b + ' - (' + a + ' + ' + b + ') ÷ ' + c,
          steps: [
            'Stap 1: Haakjes eerst: \( ' + a + ' + ' + b + ' = ' + (a + b) + ' \)',
            'Stap 2: Delen: \( ' + (a + b) + ' \\div ' + c + ' = ' + Math.floor((a + b) / c) + ' \)',
            'Stap 3: Aftrekken: \( ' + (a + b) + ' - ' + Math.floor((a + b) / c) + ' = ' + result + ' \)'
          ],
          answer: result
        },
        correctFirstOp: 'parens'
      }
    }
    case 2: {
      // Level 3: Evaluate — mixed precedence, equal-precedence L→R
      const d = 8 + Math.floor(Math.random() * 8) // 8-15
      const e = 2 + Math.floor(Math.random() * 2) // 2-3
      const f = 2 + Math.floor(Math.random() * 2) // 2-3
      const tmp = Math.floor(d / e)
      const result = tmp * f
      return {
        goalText: 'Bereken: \( ' + d + ' \\div ' + e + ' \\times ' + f + ' \)',
        answer: String(result),
        steps: [
          { label: 'Deling', highlight: d + ' ÷ ' + e, rule: 'Delen en × zijn even sterk: van LINKS naar RECHTS.' },
          { label: 'Vermenigvuldiging', highlight: Math.floor(d / e) + ' × ' + f, rule: 'Daarna vermenigvuldigen.' }
        ],
        worked: {
          problem: d + ' ÷ ' + e + ' × ' + f,
          steps: [
            'Stap 1: Delen eerst (links): \( ' + d + ' \\div ' + e + ' = ' + Math.floor(d / e) + ' \)',
            'Stap 2: Vermenigvuldigen: \( ' + Math.floor(d / e) + ' \\times ' + f + ' = ' + result + ' \)'
          ],
          answer: result
        },
        correctFirstOp: 'left'
      }
    }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// ========== HINTS (3-level, never give answer) ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    'Denk aan de voorrangsregels: eerst haakjes, dan machten, dan × en ÷, dan + en - . Welke bewerking heeft de hoogste prioriteit in deze opgave?',
    'Bekijk de formule aandachtig. Zoek de bewerking met de hoogste prioriteit. Laat de andere bewerkingen nog even staan en voer enkel de eerste stap uit.',
    'Teken de voorrangsregels erbij: schrijf boven elke operator zijn rangnummer (1=haakjes, 2=macht, 3=×/÷, 4=+/-). Klik op de operator met het laagste nummer.'
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== PREDICTION GATE ==========
const predictionOptions = computed(() => {
  const valid = ['parens', 'power', 'muldiv', 'addsub']
  // Only show options relevant to this level
  if (currentInternalLevel.value === 0) return [
    { id: 'addsub', label: 'Optellen of Aftrekken' },
    { id: 'muldiv', label: 'Vermenigvuldigen of Delen' },
    { id: 'power', label: 'Machten' }
  ]
  if (currentInternalLevel.value === 1) return [
    { id: 'addsub', label: 'Optellen of Aftrekken' },
    { id: 'muldiv', label: 'Vermenigvuldigen of Delen' },
    { id: 'parens', label: 'Haakjes' }
  ]
  return [
    { id: 'addsub', label: 'Optellen of Aftrekken' },
    { id: 'muldiv', label: 'Vermenigvuldigen of Delen' },
    { id: 'left', label: 'Van links naar rechts' }
  ]
})

function checkPrediction() {
  if (!predictedParentOp.value) return
  const corr = currentLevelData.value.correctFirstOp
  if (predictedParentOp.value === corr) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist ingeschat! Laten we het nu berekenen.' }
  } else {
    attemptCount.value++
    const hints = [
      'Welke operator heeft de hoogste prioriteit volgens de voorrangsregels?',
      'Beantwoord de vraag: welke bewerking moet je als EERSTE uitvoeren?',
      'Denk aan: haakjes > machten > ×÷ > +- . Kies de bewerking met de hoogste prioriteit.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== USER INPUT ==========
const userAnswer = ref('')

function checkAnswer() {
  if (!userAnswer.value.trim() || isCorrect.value) return
  isChecked.value = true

  const isNum = !isNaN(parseFloat(userAnswer.value)) && isFinite(Number(userAnswer.value))

  if (isNum && Number(userAnswer.value) === Number(currentLevelData.value.answer)) {
    isCorrect.value = true
    hintCount.value = 0
    errorDetected.value = ''
    const why = currentInternalLevel.value === 0
      ? 'Machten hebben voorrang boven vermenigvuldigen, en vermenigvuldigen boven optellen. Je past de hiërarchie in de juiste volgorde toe. Dit is de kern van wiskundige precisie.'
      : currentInternalLevel.value === 1
        ? 'Haakjes dwingen een bepaalde volgorde af. Zelfs al staat er een deling naast, de haakjes gaan eerst. Daarna bepaalt de hiërarchie tussen ÷ en - de verdere volgorde.'
        : 'Delen en vermenigvuldigen hebben dezelfde prioriteit. Daarom lees je van links naar rechts. Als je van rechts naar links was begonnen, had je een ander (fout) antwoord gekregen.'
    showWhyExplanation(why)

    // LPD evidence
    const lpdText = currentInternalLevel.value === 0
      ? 'LPD 16: Je past de voorrangsregels correct toe op een eenvoudige bewerking met machten, vermenigvuldiging en optelling.'
      : currentInternalLevel.value === 1
        ? 'LPD 16: Je analyseert een formule met haakjes, deling en aftrekking, en past de voorrangsregels in de juiste volgorde toe.'
        : 'LPD 16: Je evalueert een formule met gelijkwaardige bewerkingen (÷ en ×) en past de links-naar-rechts regel correct toe.'
    feedback.value = { type: 'success', text: lpdText }
  } else {
    attemptCount.value++
    isCorrect.value = false

    // Error analysis
    const userNum = Number(userAnswer.value)
    const correctNum = Number(currentLevelData.value.answer)
    let errMsg = ''

    if (currentInternalLevel.value === 0) {
      // Common errors: left-to-right (base+mul then * pow), or add before mul
      const leftToRight = (2 + Math.floor(Math.random() * 6) + 2) * 4 // rough
      if (userNum === (currentLevelData.value.answer * 2)) {
        errMsg = 'Je hebt de macht overslagen. Typische fout! Herinner: machten gaan ALTIJD voor ×, ÷, + en -.'
      } else if (attemptCount.value >= 3) {
        errMsg = 'Blijf de formule stap voor stap ontleden. Welke operator heeft de hoogste prioriteit? Werk van hoog naar laag.'
      } else {
        errMsg = 'Niet correct. De bewerkingen moeten in een specifieke volgorde gebeuren. Gebruik de hintknop voor een aanwijzing.'
      }
    } else if (currentInternalLevel.value === 1) {
      if (userNum === (currentLevelData.value.answer * 2)) {
        errMsg = 'Je hebt de haakjes overgeslagen. Herinner: haakjes ( ) hebben absolute voorrang, nog vóór machten!'
      } else {
        errMsg = 'Niet correct. Werk stap voor stap: eerst de haakjes, dan ×/÷ (L→R), dan +/- (L→R).'
      }
    } else {
      if (attemptCount.value >= 2) {
        errMsg = 'Let op: ÷ en × zijn even sterk. Je moet van LINKS naar RECHTS werken, niet vermenigvuldigen voor delen.'
      } else {
        errMsg = 'Niet correct. Herinner: ÷ en × hebben dezelfde prioriteit. Wat betekent dat voor de volgorde?'
      }
    }

    feedback.value = { type: 'error', text: attemptCount.value >= 3
      ? 'Kijk naar de uitgewerkte voorbeelden in de instructies. Volg de stappen één voor één.'
      : errMsg }
  }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasHierarchy = text.includes('hiërarchie') || text.includes('voorrang') || text.includes('volgorde')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if (hasHierarchy && hasReason && text.length > 15) {
    reflectionDone.value = true
    feedback.value = { type: 'success', text: 'Uitstekende reflectie! Je begrijpt waarom de volgorde van bewerkingen logisch is.<br/><br/><strong>LPD 16 bewezen:</strong> Je kan niet alleen de regels toepassen, maar ook verklaren waarom ze bestaan. Dit is wiskundige geletterdheid op niveau.' }
    isCorrect.value = true
  } else {
    attemptCount.value++
    const hints = [
      'Waarom moeten machten vóór optellen? Stel je voor: \( 2 + 3^2 = 2 + 9 \) of \( 5^2 = 25 \)? Welke is wiskundig correct?',
      'Leg uit in termen van hiërarchie. Bijvoorbeeld: "Machten gaan voor optellen omdat..."',
      'Denk aan de analogie met haakjes: machten zijn als "onzichtbare haakjes". Wat betekent dat voor de volgorde?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HANDLERS ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: welke bewerking voer je als EERSTE uit?' }
  } else {
    feedback.value = { type: 'info', text: 'Voer het juiste antwoord in.' }
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  userAnswer.value = ''
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedParentOp.value = null
  currentStepIdx.value = 0

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: welke bewerking voer je als EERSTE uit?' }
  } else {
    feedback.value = { type: 'info', text: 'Bereken de formule en vul het antwoord in.' }
  }
}

function handleNext() {
  // Show reflection after level 2
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op wat je geleerd hebt over de volgorde van bewerkingen.' }
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

// ========== LIFECYCLE ==========
watch(() => props.isOpen, (val) => {
  if (val) {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
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
    <div ref="mainArea" tabindex="-1" class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

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
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction || 'Pas de voorrangsregels toe om de formule correct te berekenen.'" class="mb-4 prose prose-sm text-slate-600" />

            <!-- Worked Example (I do) — shown only on level 0 -->
            <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <MathText :content="'Bereken: \( ' + currentLevelData.worked.problem.replace(/\^/g, '^').replace(/\\div/g, '÷') + ' \)'" class="text-sm font-mono font-bold text-slate-800 mb-3" />
              <div class="space-y-1.5 text-sm text-slate-700">
                <div v-for="(step, si) in currentLevelData.worked.steps" :key="si" class="flex items-start gap-2">
                  <span class="text-amber-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span v-html="step"></span>
                </div>
              </div>
              <div class="mt-2 p-2 bg-white rounded-lg text-center font-bold text-amber-700 border border-amber-200">
                Antwoord: {{ currentLevelData.worked.answer }}
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-700 bg-white border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf proberen →
              </button>
            </div>

            <!-- Prediction Gate (we do) — levels 1+ -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Welke bewerking voer je als <strong>EERSTE</strong> uit?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in predictionOptions" :key="opt.id"
                        @click="predictedParentOp = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedParentOp === opt.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedParentOp" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- Task Area (you do) -->
            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <div class="text-center">
                <p class="font-bold text-slate-700 mb-3 text-sm">Voer het antwoord in:</p>
                <MathText :content="currentLevelData.goalText" class="text-lg font-mono font-bold text-slate-800 mb-4" />
                <div class="flex items-center justify-center gap-3">
                  <input v-model="userAnswer"
                         type="text" inputmode="numeric"
                         :disabled="isCorrect"
                         placeholder="?"
                         class="w-24 p-3 text-center font-mono font-bold text-2xl border-2 border-slate-300 rounded-xl bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-colors tabular-nums"
                         @keyup.enter="checkAnswer" />
                  <button @click="checkAnswer"
                          :disabled="isCorrect || !userAnswer.trim()"
                          class="px-6 py-3 font-bold text-white rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                    Controleer
                  </button>
                </div>
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Waarom moeten machten vóór optellen, en waarom lezen we × en ÷ van links naar rechts? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Machten gaan voor optellen omdat..."></textarea>
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

              <!-- Hint button — only when working on task -->
              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-600 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
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

        <!-- RIGHT CONTENT PANEL — visual math area -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-3xl space-y-6">
              <!-- Formula Display -->
              <div class="bg-white px-10 py-8 rounded-xl shadow-md border-2 border-slate-200 flex items-center justify-center min-h-[120px]">
                <div v-if="showWorkedExample" class="text-center">
                  <p class="text-sm text-amber-600 font-bold mb-2">VOORBEELD</p>
                  <MathText :content="'\( ' + currentLevelData.worked.problem.replace(/\^/g, '^').replace(/\\div/g, '÷') + ' \)'" class="text-4xl font-mono font-black text-amber-700" />
                </div>
                <div v-else-if="showPrediction" class="text-center">
                  <p class="text-sm text-amber-600 font-bold mb-2">JOUW BEURT — Voorspel eerst</p>
                  <MathText :content="currentLevelData.goalText" class="text-4xl font-mono font-black text-slate-700 opacity-60" />
                </div>
                <div v-else-if="showReflection" class="text-center">
                  <p class="text-sm text-indigo-600 font-bold mb-2">REFLECTIE</p>
                  <p class="text-3xl font-bold text-indigo-700">Reflecteer op wat je leerde</p>
                </div>
                <div v-else class="text-center">
                  <p class="text-sm text-amber-600 font-bold mb-2">JOUW BEURT</p>
                  <MathText :content="currentLevelData.goalText" class="text-4xl font-mono font-black text-slate-800" />
                </div>
              </div>

              <!-- Step-by-step breakdown (shown after correct answer, before reflection) -->
              <div v-if="isCorrect && showWhy && !showReflection" class="bg-white p-6 rounded-xl border-2 border-emerald-200 shadow-md animate-fadeIn">
                <div class="flex items-center gap-2 mb-4">
                  <PhCheckCircle class="w-6 h-6 text-emerald-500" weight="fill" />
                  <span class="font-bold text-emerald-700">Juist! Stappenplan:</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div v-for="(step, si) in currentLevelData.steps" :key="si"
                       class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div class="text-xs font-bold text-amber-600 uppercase mb-1">{{ step.label }}</div>
                    <div class="text-sm font-mono font-bold text-slate-700">{{ step.highlight }}</div>
                    <div class="text-xs text-slate-500 mt-1">{{ step.rule }}</div>
                  </div>
                </div>
              </div>

              <!-- Voorrangsregels always visible -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <p class="font-bold text-slate-700 text-sm mb-2">Voorrangsregels</p>
                <div class="grid grid-cols-4 gap-2 text-center">
                  <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div class="font-bold text-amber-700 text-lg">1</div>
                    <div class="text-xs text-slate-600">Haakjes</div>
                  </div>
                  <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div class="font-bold text-amber-700 text-lg">2</div>
                    <div class="text-xs text-slate-600">Machten</div>
                  </div>
                  <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div class="font-bold text-amber-700 text-lg">3</div>
                    <div class="text-xs text-slate-600">× en ÷</div>
                  </div>
                  <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div class="font-bold text-amber-700 text-lg">4</div>
                    <div class="text-xs text-slate-600">+ en -</div>
                  </div>
                </div>
              </div>
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
