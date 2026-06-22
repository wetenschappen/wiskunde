<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBrain,
  PhArrowClockwise, PhLightbulb, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Bewijzen: Het Ongerijmde' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBrain }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)
const feedback = ref({ type: 'info', text: 'Kies de juiste aanname om de machine te starten.' })

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedStep = ref(null) // which step should come next
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

// ========== LEVEL SYSTEM ==========
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const levels = ref([])
const step = ref(0) // 0: select, 1: logic running, 2: paradox!
const selectedAssumption = ref(null)

const workedExample = {
  problem: 'Bewijs dat √2 irrationaal is.',
  method: 'Proof by contradiction (bewijs uit het ongerijmde)',
  steps: [
    'Stap 1: Neem het TEGENGESTELDE aan van wat je wil bewijzen.',
    'Stap 2: Leid hieruit logisch een contradictie af (iets dat onmogelijk is).',
    'Stap 3: Concludeer dat de aanname fout moet zijn, dus het origineel is waar.'
  ],
  fullExample: 'Stelling: "√2 is irrationaal."\nAanname (tegenovergestelde): "√2 is rationaal → √2 = a/b in vereenvoudigde breuk."\nContradictie: a en b blijken allebei even → breuk was niet vereenvoudigd!\nConclusie: De aanname klopt niet → √2 is irrationaal.',
  keyInsight: 'Het geniale: je bewijst iets door aan te tonen dat het TEGENGESTELDE tot onzin leidt. De wiskunde dwingt je tot de waarheid!'
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const proofPool = [
  // Level 1 — sqrt(2) is irrational
  {
    instruction: 'Level 1: Een klassiek bewijs uit het ongerijmde.<br/><br/><strong>Vraag:</strong> Hoe bewijzen we dat √2 irrationaal is? Kies de juiste start-aanname!',
    proposition: '"√2 is een irrationaal getal"',
    directLabel: 'Neem aan: "√2 is rationaal na vereenvoudiging..."',
    oppositeLabel: 'Neem aan: "√2 = a/b in vereenvoudigde breuk, met a en b geheel..."',
    step1Text: 'Als √2 = a/b in vereenvoudigde vorm, dan is a² = 2b². Dus a is even. Stel a = 2k. Dan 4k² = 2b², dus b² = 2k². Dan is b ook even. Beide even?',
    step2Text: 'PARADOX! a en b zijn allebei even, dus de breuk a/b kon vereenvoudigd worden. Dit is in tegenspraak met de aanname dat a/b vereenvoudigd was!',
    step1Feedback: 'Briljant. We nemen aan dat √2 wél rationaal is, geschreven als een vereenvoudigde breuk a/b. Laten we dit door de logica-machine halen...',
    step2Feedback: 'PARADOX! De aanname dat √2 rationaal is leidt tot een tegenspraak. Dus √2 is irrationaal. Bewijs geleverd!',
    errorFeedback: 'Nee. Voor een bewijs uit het ongerijmde moet je het TEGENGESTELDE aannemen van wat je wil bewijzen.',
    whyExplanation: 'Dit is het beroemdste bewijs uit het ongerijmde. Het mooie: we hoeven niet te controleren of √2 wel bestaat of niet — we tonen aan dat "rationaal" onmogelijk is, dus moet het irrationaal zijn. De wiskunde geeft geen derde optie.',
    workedSteps: [
      'Stelling: "√2 is irrationaal."',
      'Tegenovergestelde aanname: "√2 = a/b" (vereenvoudigde breuk)',
      'Gevolg 1: a² = 2b² → a is even → a = 2k',
      'Gevolg 2: b² = 2k² → b is ook even',
      'Contradictie: a en b zijn allebei even → breuk NIET vereenvoudigd',
      'Conclusie: Aanname fout → √2 is irrationaal!'
    ]
  },
  // Level 2 — Infinite primes
  {
    instruction: 'Level 2: Bewijs dat er oneindig veel priemgetallen bestaan.<br/><br/>Kies de juiste start-aanname voor een bewijs uit het ongerijmde.',
    proposition: '"Er bestaan oneindig veel priemgetallen."',
    directLabel: 'Neem aan: "Er bestaan oneindig veel priemgetallen..."',
    oppositeLabel: 'Neem aan: "Er bestaat een ALLERGROOTSTE priemgetal P..."',
    step1Text: 'We bouwen een nieuw getal Q: vermenigvuldig ALLE priemgetallen tot en met P, en tel er 1 bij op: Q = (2×3×5×...×P) + 1',
    step2Text: 'ONZIN! Q is groter dan P, maar Q is niet deelbaar door enig priemgetal (want steeds rest 1)! Dus Q is zelf priem, of heeft een priemfactor groter dan P — beide tegenspraken met "P is het grootste"!',
    step1Feedback: 'Geniaal. We nemen even aan dat er wél een grootste priemgetal is. Laten we deze theorie door de logica-machine duwen...',
    step2Feedback: 'PARADOX! De theorie ontploft. De aanname kán dus niet kloppen, wat bewijst dat de oorspronkelijke stelling WAAR is.',
    errorFeedback: 'Nee. Als je een bewijs uit het ongerijmde start, moet je exact het TEGENGESTELDE aannemen van wat je eigenlijk wil bewijzen.',
    whyExplanation: 'Euclides bedacht dit bewijs ~300 v.Chr. Het is nog steeds geldig! Het toont aan dat de priemgetallen nooit ophouden — een prachtig voorbeeld van hoe een bewijs uit het ongerijmde een oneindige waarheid kan aantonen zonder alle getallen te controleren.',
    workedSteps: null
  },
  // Level 3 — No smallest positive rational
  {
    instruction: 'Level 3: Bewijs dat er geen kleinste positief rationeel getal bestaat.<br/><br/>Kies de juiste aanname.',
    proposition: '"Er bestaat geen kleinste positief rationeel getal."',
    directLabel: 'Neem aan: "Er bestaan oneindig veel rationale getallen..."',
    oppositeLabel: 'Neem aan: "Er bestaat een ALLERKLEINSTE positief rationeel getal R..."',
    step1Text: 'Stel R is het kleinste positieve rationale getal. Dan is R/2 ook positief en rationeel. Maar R/2 is kleiner dan R! Hoe kan R dan het kleinste zijn?',
    step2Text: 'PARADOX! R/2 is een positief rationeel getal dat kleiner is dan R. R kan dus niet het kleinste zijn. Dit is een tegenspraak met de aanname!',
    step1Feedback: 'Scherpzinnig. We nemen aan dat er wél een kleinste positief rationeel getal is. Laten we deze bewering door de machine halen...',
    step2Feedback: 'PARADOX! De helft van R is ook positief en rationeel, maar kleiner dan R. Tegenspraak! De stelling is dus bewezen.',
    errorFeedback: 'Nee. Voor een bewijs uit het ongerijmde begin je met het TEGENGESTELDE van wat je wil bewijzen.',
    whyExplanation: 'Dit bewijs toont aan dat "kleinste positieve rationale getal" een onmogelijk concept is — je kan altijd de helft nemen. Dit illustreert de dichtheid van rationale getallen: tussen elke twee rationale getallen zit er nog een.',
    workedSteps: null
  }
]

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (!predictedStep.value) return
  if (predictedStep.value === 'opposite') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Het tegenovergestelde aannemen is de kern. Kies nu de juiste aanname in de stelling.' }
  } else {
    attemptCount.value++
    const hints = [
      'Proof by contradiction begint altijd met het TEGENGESTELDE van wat je wil bewijzen.',
      'Als je wil bewijzen dat P waar is, neem dan aan dat P NIET waar is.',
      'Denk aan de naam: "bewijs uit het ongerijmde" — het "ongerijmde" is het tegenovergestelde van de stelling.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    'Bij een bewijs uit het ongerijmde begin je met het TEGENGESTELDE van wat je wil bewijzen. Zoek de knop die het tegenovergestelde zegt.',
    'Als de stelling zegt "X is waar", begin je met "X is NIET waar" (of het praktische equivalent daarvan).',
    'Lees de stelling aandachtig. Denk: "Wat is het tegenovergestelde van deze bewering?" Dat is de aanname die je moet kiezen.'
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ANSWER ==========
function runProof(choice) {
  if (isCorrect.value) return
  selectedAssumption.value = choice
  isChecked.value = true

  if (choice === 'opposite') {
    step.value = 1
    hintCount.value = 0
    feedback.value = { type: 'success', text: currentLevelData.value.step1Feedback }

    setTimeout(() => {
      step.value = 2
      isCorrect.value = true
      showWhy.value = true
      whyText.value = (currentLevelData.value.whyExplanation || 'Een bewijs uit het ongerijmde toont aan dat de aanname van het tegenovergestelde tot een contradictie leidt.') +
        '<br/><br/><strong>LPD B1 bewezen:</strong> Je begrijpt de structuur van een bewijs uit het ongerijmde: neem het tegenovergestelde aan, leid een contradictie af, concludeer dat het origineel waar is.'
      feedback.value = { type: 'success', text: currentLevelData.value.step2Feedback }
    }, 2000)
  } else {
    attemptCount.value++
    isCorrect.value = false
    errorDetected.value = 'direct-assumption'

    const errorMsgs = [
      currentLevelData.value.errorFeedback,
      'Denk na: de stelling zegt "' + currentLevelData.value.proposition + '". Het tegenovergestelde daarvan is...',
      'Bij een bewijs uit het ongerijmde (reductio ad absurdum) begin je met wat je probeert te ontkrachten. De correcte knop zegt het TEGENOVERSTELDE van "direct".'
    ]
    feedback.value = {
      type: 'error',
      text: errorMsgs[Math.min(attemptCount.value - 1, 2)]
    }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function generateLevel(lvl) {
  const p = proofPool[lvl]
  const buttons = [
    { role: 'direct', label: p.directLabel },
    { role: 'opposite', label: p.oppositeLabel }
  ]
  // Shuffle for levels 1+
  if (lvl >= 1 && Math.random() > 0.5) {
    [buttons[0], buttons[1]] = [buttons[1], buttons[0]]
  }
  return { ...p, shuffledButtons: buttons }
}

function generateLevels() {
  return Array.from({length: totalInternalLevels}, (_, i) => generateLevel(i))
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasTegenover = text.includes('tegenovergestelde') || text.includes('aanname') || text.includes('ongerijmde')
  const hasContradictie = text.includes('contradictie') || text.includes('tegenspraak') || text.includes('onzin') || text.includes('paradox')
  const hasConclusie = text.includes('conclusie') || text.includes('dus') || text.includes('daarom') || text.includes('bewezen')
  const hasReden = text.length > 20

  if ((hasTegenover || hasContradictie) && hasReden) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Uitstekend!<br/><br/><strong>LPD B1 bewezen:</strong> Je begrijpt de drie stappen van een bewijs uit het ongerijmde: (1) neem het tegenovergestelde aan, (2) leid een contradictie af, (3) concludeer dat de originele stelling waar is.'
    }
  } else {
    attemptCount.value++
    const hints = [
      'Beschrijf de drie stappen van een bewijs uit het ongerijmde in je eigen woorden.',
      'Waarom is het logisch geldig om uit een contradictie te concluderen dat de aanname fout was?',
      'Vergelijk het met een rechtszaak: "bewijs uit het ongerijmde" is als aantonen dat de verdachte onmogelijk onschuldig kan zijn.'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== NAVIGATION ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  feedback.value = {
    type: 'info',
    text: currentInternalLevel.value >= 1
      ? 'Voorspel: hoe begin je een bewijs uit het ongerijmde?'
      : 'Kies de juiste aanname om het bewijs te starten.'
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  step.value = 0
  selectedAssumption.value = null
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedStep.value = null

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: hoe start je een bewijs uit het ongerijmde?' }
  } else {
    feedback.value = { type: 'info', text: 'Kies de juiste aanname om de machine te starten.' }
  }
}

function nextLevel() {
  currentInternalLevel.value++
  levels.value = generateLevels()
  resetActivityState()
  nextTick(() => mainArea.value?.focus())
}

function handleLevelComplete() {
  // Show reflection at end
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer: wat is de structuur van een bewijs uit het ongerijmde?' }
    return
  }

  if (currentInternalLevel.value < totalInternalLevels - 1) {
    nextLevel()
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// ========== LIFECYCLE ==========
watch(() => props.isOpen, (val) => {
  if (val) {
    levels.value = generateLevels()
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-400' : 'bg-slate-600 border-slate-500'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-400">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-500 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <!-- MAIN -->
      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="props.instruction || 'Kies de juiste aanname voor een bewijs uit het ongerijmde (proof by contradiction).'" class="mb-4 prose prose-sm prose-invert text-slate-300" />

            <!-- WORKED EXAMPLE (Level 0) -->
            <div v-if="showWorkedExample" class="bg-amber-900/30 p-4 rounded-lg mb-4 border-l-4 border-amber-500 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorbeeld — Ik doe voor</span>
              </div>
              <p class="text-sm font-bold text-amber-200 mb-2">{{ workedExample.problem }}</p>
              <p class="text-xs text-slate-400 mb-2">Methode: {{ workedExample.method }}</p>
              <div class="space-y-1.5 text-sm text-slate-300 mb-2">
                <div v-for="(s, si) in workedExample.steps" :key="si" class="flex items-start gap-2">
                  <span class="text-amber-400 font-bold shrink-0">{{ si + 1 }}.</span>
                  <span>{{ s }}</span>
                </div>
              </div>

              <!-- Worked steps for level 0 -->
              <div v-if="currentLevelData.workedSteps" class="bg-slate-900/50 p-3 rounded-lg border border-amber-700 mt-2">
                <p class="text-xs text-amber-300 font-bold mb-1">Uitwerking √2:</p>
                <div class="text-xs text-slate-300 space-y-0.5">
                  <div v-for="(ws, wsi) in currentLevelData.workedSteps" :key="wsi" class="flex items-start gap-1.5">
                    <span class="text-amber-500 shrink-0">{{ wsi + 1 }}.</span>
                    <span>{{ ws }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-slate-800 p-2 rounded-lg text-xs text-amber-300 italic mt-2 border border-slate-600">
                {{ workedExample.keyInsight }}
              </div>

              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-400 bg-slate-800 border-2 border-amber-600 rounded-lg hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- PREDICTION GATE (levels 1+) -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-700 bg-amber-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Wat is de EERSTE stap van een bewijs uit het ongerijmde?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [
                  { id: 'opposite', label: 'Neem het tegenovergestelde aan van wat je wil bewijzen' },
                  { id: 'direct', label: 'Bewijs de stelling rechtstreeks met formules' },
                  { id: 'example', label: 'Geef een voorbeeld van de stelling' }
                ]" :key="opt.id"
                        @click="predictedStep = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedStep === opt.id ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-slate-600'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedStep" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-900/30 border border-indigo-700 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-200" v-html="whyText"></p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-4 border border-indigo-700 bg-indigo-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Beschrijf de structuur van een bewijs uit het ongerijmde (proof by contradiction) in je eigen woorden. Wat zijn de drie stappen en waarom is het logisch geldig?</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-600 rounded-lg text-sm bg-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-700 outline-none resize-none"
                rows="4" placeholder="Bij een bewijs uit het ongerijmde begin je met..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>

            <!-- Proposition display (always) -->
            <div v-if="!showWorkedExample && !showReflection" class="p-4 mt-2 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">Te Bewijzen:</label>
              <div class="font-bold text-base text-amber-400 bg-amber-900/30 p-3 rounded-lg border border-amber-800">
                "{{ currentLevelData.proposition }}"
              </div>
            </div>

            <!-- Error Analysis hint -->
            <div v-if="errorDetected === 'direct-assumption' && attemptCount >= 2" class="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300 animate-fadeIn">
              <p class="font-bold mb-1">Veelgemaakte fout:</p>
              <p>De "directe" aanpak (rechtstreeks bewijzen) is niet hetzelfde als een bewijs uit het ongerijmde. Bij "bewijs uit het ongerijmde" begin je met het <strong>tegenovergestelde</strong> van wat je wil bewijzen.</p>
            </div>
          </div>

          <!-- BOTTOM CONTROLS -->
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-900/50 text-amber-300 border border-amber-700': feedback.type === 'success',
                          'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error',
                          'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <!-- Hint -->
              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect && step === 0"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-300 rounded-lg border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleLevelComplete"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleLevelComplete"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Afronden</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Logic Machine -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

            <div class="w-full max-w-4xl flex flex-col items-center">

              <!-- Step 0: Choose Assumption -->
              <div v-if="step === 0" class="relative mb-12 w-full max-w-3xl px-4">
                <div class="bg-slate-800 border-2 border-slate-600 px-8 py-6 rounded-xl shadow-md mb-8">
                  <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 text-center">Te bewijzen stelling</p>
                  <h1 class="text-xl md:text-3xl font-black text-center text-white">
                    {{ currentLevelData.proposition }}
                  </h1>
                </div>

                <div class="flex gap-4" :class="step > 0 ? 'opacity-30 pointer-events-none' : ''">
                  <button v-for="(btn, idx) in currentLevelData.shuffledButtons" :key="idx"
                          @click="runProof(btn.role)"
                          class="flex-1 p-5 bg-slate-800 border-4 rounded-xl hover:bg-slate-700 transition-all active:scale-95 shadow-md text-left group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="btn.role === 'opposite' ? 'border-amber-600' : 'border-slate-600'">
                    <span class="block text-xs font-bold uppercase tracking-widest mb-2"
                          :class="btn.role === 'opposite' ? 'text-amber-500' : 'text-slate-400'">
                      {{ btn.role === 'opposite' ? 'Ongerijmde (Correct)' : 'Rechtstreeks' }}
                    </span>
                    <span class="font-bold text-sm text-slate-200 group-hover:text-white">{{ btn.label }}</span>
                  </button>
                </div>
              </div>

              <!-- The Logic Machine (steps 1-2) -->
              <div v-if="step > 0" class="relative w-full max-w-2xl min-h-[300px] flex flex-col items-center animate-fadeIn">
                <!-- Conveyor Belt -->
                <div class="w-8 h-16 bg-slate-700 border-x-4 border-slate-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div class="absolute inset-0 bg-slate-600 opacity-50" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 8px, #94a3b8 8px, #94a3b8 16px); animation: belt 0.8s linear infinite;"></div>
                </div>

                <!-- The Box -->
                <div class="w-72 bg-slate-800 border-4 border-amber-500 rounded-xl p-6 shadow-[0_0_30px_rgba(251,191,36,0.2)] z-10 relative mt-[-8px] transition-all duration-700"
                     :class="step === 2 ? 'border-red-500 bg-red-900/30 animate-shake shadow-[0_0_50px_rgba(239,68,68,0.6)]' : ''">

                  <p v-if="step === 1" class="font-bold text-center text-amber-400 animate-pulse text-sm">
                    {{ currentLevelData.step1Text }}
                  </p>

                  <p v-if="step === 2" class="font-black text-center text-red-400 text-lg">
                    {{ currentLevelData.step2Text }}
                  </p>

                  <!-- Explosion FX -->
                  <div v-if="step === 2" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div class="w-full h-1.5 bg-amber-500 rotate-12 transform scale-150 animate-slash"></div>
                    <div class="w-full h-1.5 bg-red-500 -rotate-12 transform scale-150 animate-slash" style="animation-delay: 0.1s"></div>
                  </div>
                </div>

                <p v-if="step === 2" class="mt-6 text-lg font-bold text-emerald-400 animate-fadeIn text-center">
                Bewijs geleverd! {{ currentLevelData.proposition }}
              </p>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

@keyframes belt {
    from { background-position: 0 0; }
    to { background-position: 0 16px; }
}

.animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash { animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: center; }
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1; }
    100% { transform: scaleX(1.5); opacity: 0.8; }
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
</style>
