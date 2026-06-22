<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLightning,
  PhArrowClockwise, PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Zoek het Tegenvoorbeeld' },
  instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintCount = ref(0)
const feedback = ref({ type: 'info', text: 'Selecteer een getal op de getallenas.' })

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedCategory = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// ========== LEVEL GENERATION ==========
function generateLevel(index) {
  switch (index) {
    case 0: {
      // Level 1: Apply — perfect squares, two roots
      const perfectSquares = [4, 9, 16, 25, 36, 49, 64]
      const sq = perfectSquares[Math.floor(Math.random() * perfectSquares.length)]
      const posRoot = Math.round(Math.sqrt(sq))
      const negRoot = -posRoot
      return {
        ruleHTML: `\\( x^2 = ${sq} \\) <span class="text-amber-400 font-black">⇒</span> \\( x = ${posRoot} \\)`,
        rulePlain: `x² = ${sq} ⇒ x = ${posRoot}`,
        premiseCheck: (x) => x * x === sq,
        conclusionCheck: (x) => x === posRoot,
        validate: (x) => (x * x === sq) && (x !== posRoot),
        hintCond: `Je getal in het kwadraat is geen ${sq}. Het tegenvoorbeeld moet WEL aan \\( x^2 = ${sq} \\) voldoen!`,
        hintConc: `\\( x = ${posRoot} \\) bevestigt de bewering. Zoek een ANDER getal waarvan het kwadraat ook ${sq} is.`,
        success: `BAM! (\\( ${negRoot}^2 = ${sq} \\)!) De bewering is vals. \\( x \\) hoeft niet per se \\( ${posRoot} \\) te zijn.`,
        worked: {
          premise: `\\( x^2 = 9 \\)`,
          conclusion: `\\( x = 3 \\)`,
          counterexample: `\\( x = -3 \\)`,
          explanation: `\\( (-3)^2 = 9 \\) (voldoet aan voorwaarde) maar \\( -3 \\neq 3 \\) (voldoet NIET aan conclusie). Eén uitzondering = bewering ontkracht!`,
          method: 'Stap 1: Zoek getallen die aan de voorwaarde voldoen (links van ⇒). Stap 2: Controleer of ze aan de conclusie voldoen. Stap 3: Vind er één die WEL aan links voldoet maar NIET aan rechts.'
        },
        whyExplanation: 'De vergelijking \\( x^2 = 9 \\) heeft TWEE oplossingen: \\( x = 3 \\) en \\( x = -3 \\). De bewering zegt alleen \\( x = 3 \\), maar dat is onvolledig. Een tegenvoorbeeld toont aan dat de bewering te sterk (te beperkt) is geformuleerd.'
      }
    }
    case 1: {
      // Level 2: Analyze — divisibility
      const divisors = [[2, 2], [2, 3], [3, 2]]
      const pair = divisors[Math.floor(Math.random() * divisors.length)]
      const d = pair[0]
      const k = pair[1]
      const product = d * k
      return {
        ruleHTML: `x is deelbaar door ${d} <span class="text-amber-400 font-black">⇒</span> x is deelbaar door ${product}`,
        rulePlain: `x is deelbaar door ${d} ⇒ x is deelbaar door ${product}`,
        premiseCheck: (x) => x % d === 0,
        conclusionCheck: (x) => x % product === 0,
        validate: (x) => (x % d === 0) && (x % product !== 0),
        hintCond: `Je hebt een getal gekozen dat niet deelbaar is door ${d}. Een tegenvoorbeeld moet WÉL deelbaar zijn door ${d}.`,
        hintConc: `Dit getal is inderdaad deelbaar door ${product}. Dit is een BEVESTIGING. Zoek een getal dat WÉL deelbaar is door ${d} maar NIET door ${product}.`,
        success: `BAM! Dit getal is deelbaar door ${d}, maar NIET door ${product}. De stelling is vals!`,
        worked: null,
        whyExplanation: `Deelbaarheid door ${d} is een zwakkere eis dan deelbaarheid door ${product}. Niet elk getal dat deelbaar is door ${d} is ook deelbaar door ${product}. Bijv. ${d * 1} en ${d * 3} zijn deelbaar door ${d} maar niet door ${d * k}.`
      }
    }
    case 2: {
      // Level 3: Evaluate — thresholds
      const threshold = Math.floor(Math.random() * 6) // 0 to 5
      const targetNum = threshold + 1
      return {
        ruleHTML: `x > ${threshold} <span class="text-amber-400 font-black">⇒</span> x ≥ ${threshold + 2}`,
        rulePlain: `x > ${threshold} ⇒ x ≥ ${threshold + 2}`,
        premiseCheck: (x) => x > threshold,
        conclusionCheck: (x) => x >= threshold + 2,
        validate: (x) => (x > threshold) && (x < threshold + 2),
        hintCond: `Dit getal is niet groter dan ${threshold}. Het moet WEL > ${threshold} zijn.`,
        hintConc: `Dit getal is ≥ ${threshold + 2}. Dit bevestigt de bewering. Zoek een getal dat WEL > ${threshold} is, maar < ${threshold + 2}.`,
        success: `BAM! Het getal ${targetNum} is > ${threshold} maar NIET ≥ ${threshold + 2}. Stelling ontkracht!`,
        worked: null,
        whyExplanation: `De bewering zegt dat getallen groter dan ${threshold} ook minstens ${threshold + 2} moeten zijn. Maar ${targetNum} zit er tussenin. Dit toont aan dat de conclusie te sterk is — niet elke waarde boven een drempel haalt de volgende drempel.`
      }
    }
  }
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain
const numbers = Array.from({length: 21}, (_, i) => i - 10)
const selectedNumber = ref(null)
const ruleShattered = ref(false)

// ========== PREDICTION ==========
const predictionOptions = computed(() => [
  { id: 'premise-conclusion', label: 'Aan de voorwaarde voldoen, NIET aan de conclusie' },
  { id: 'both', label: 'Aan zowel voorwaarde als conclusie voldoen' },
  { id: 'neither', label: 'Noch aan voorwaarde noch aan conclusie voldoen' }
])

function checkPrediction() {
  if (!predictedCategory.value) return
  if (predictedCategory.value === 'premise-conclusion') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Een tegenvoorbeeld voldoet aan de premisse (links van ⇒) maar NIET aan de conclusie (rechts van ⇒). Zoek nu zo\'n getal.' }
  } else {
    attemptCount.value++
    const hints = [
      'Splits de bewering: links staat de voorwaarde, rechts de conclusie. Het tegenvoorbeeld moet links "waar" geven en rechts "onwaar".',
      'Lees de pijl: ⇒ betekent "ALS ... DAN ...". Het tegenvoorbeeld moet de "ALS" waarmaken maar de "DAN" ontkrachten.',
      'Denk aan een valse belofte: "ALS je goed studeert, DAN krijg je een 10." Het tegenvoorbeeld = goed gestudeerd maar geen 10.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const level = currentInternalLevel.value
  const hints = [
    'Test elk getal: voldoet het aan de voorwaarde (links)? Zo ja, voldoet het dan ook aan de conclusie (rechts)? Zo nee: tegenvoorbeeld!',
    level === 0
      ? 'Welke getallen geven hetzelfde kwadraat als het gegeven getal? Er zijn er altijd twee.'
      : level === 1
        ? 'Welke getallen zijn deelbaar door het getal links? Zijn ze ALLEMAAL ook deelbaar door het product?'
        : 'Tussen welke twee getallen zit de opening? Zoek een getal dat groter is dan de linkerdrempel maar kleiner dan de rechterdrempel.',
    level === 0
      ? 'Denk aan negatieve getallen. \\( (-a)^2 = a^2 \\).'
      : level === 1
        ? 'Probeer getallen die het linkergetal als factor hebben maar het product NIET.'
        : 'Probeer het getal dat exact één groter is dan de linkerdrempel.'
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ANSWER ==========
function selectNumber(num) {
  if (isCorrect.value) return
  selectedNumber.value = num
  checkAnswer(num)
}

function checkAnswer(num) {
  if (currentLevelData.value.validate(num)) {
    isCorrect.value = true
    ruleShattered.value = true
    hintCount.value = 0
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.success + '<br/><br/><strong>LPD 6 bewezen:</strong> Je herkent dat één getal dat voldoet aan de voorwaarde maar niet aan de conclusie een implicatie (⇒) ontkracht.'
    }
    if (currentLevelData.value.whyExplanation) {
      showWhy.value = true
      whyText.value = currentLevelData.value.whyExplanation
    }
  } else {
    attemptCount.value++
    isCorrect.value = false

    const premiseOk = currentLevelData.value.premiseCheck(num)
    const conclusionOk = currentLevelData.value.conclusionCheck(num)

    let errMsg = ''
    if (!premiseOk) {
      errMsg = attemptCount.value <= 1
        ? currentLevelData.value.hintCond
        : 'Dit getal voldoet niet aan de voorwaarde (links van ⇒). Het tegenvoorbeeld moet WEL aan de voorwaarde voldoen.'
    } else if (conclusionOk) {
      errMsg = attemptCount.value <= 1
        ? currentLevelData.value.hintConc
        : 'Dit getal bevestigt de bewering. Zoek een getal dat WEL aan de voorwaarde voldoet maar NIET aan de conclusie.'
    } else {
      errMsg = attemptCount.value >= 3
        ? 'Probeer systematisch: test elk getal en noteer of het aan de voorwaarde en aan de conclusie voldoet.'
        : 'Niet correct. Herinner: voorwaarde (links) = WAAR, conclusie (rechts) = ONWAAR.'
    }
    feedback.value = { type: 'error', text: errMsg }
  }
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasImplicatie = text.includes('implicatie') || text.includes('⇒') || (text.includes('als') && text.includes('dan'))
  const hasVoorwaarde = text.includes('voorwaarde') || text.includes('premisse') || text.includes('links')
  const hasConclusie = text.includes('conclusie') || text.includes('rechts')
  const hasReden = text.length > 15
  if ((hasImplicatie || (hasVoorwaarde && hasConclusie)) && hasReden) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekende reflectie!<br/><br/><strong>LPD 6 bewezen:</strong> Je begrijpt dat een implicatie (⇒) één richting werkt. Een tegenvoorbeeld toont aan dat de conclusie niet automatisch volgt uit de voorwaarde — de pijl is niet altijd geldig.' }
  } else {
    attemptCount.value++
    const hints = [
      'Wat betekent de pijl (⇒) in wiskunde? Hoe verschilt een tegenvoorbeeld van een gewoon voorbeeld?',
      'Leg uit: een implicatie A⇒B is vals als er één geval is waar A waar is maar B onwaar. Wat betekent dat voor de bewering?',
      'Vergelijk: "ALS het regent, DAN is de straat nat." Wat is een tegenvoorbeeld voor de omgekeerde bewering "ALS de straat nat is, DAN heeft het geregend"?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== NAVIGATION ==========
function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Voorspel eerst: wat maakt een getal een tegenvoorbeeld bij een implicatie (⇒)?' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  selectedNumber.value = null
  ruleShattered.value = false
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedCategory.value = null

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel eerst: wat maakt een getal een tegenvoorbeeld?' }
  } else {
    feedback.value = { type: 'info', text: 'Selecteer een getal op de getallenas.' }
  }
}

function handleNext() {
  // Show reflection after level 2
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op wat je geleerd hebt over tegenvoorbeelden en implicaties.' }
    return
  }

  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
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
            <MathText :content="props.instruction || 'Een tegenvoorbeeld ontkracht een implicatie (⇒). Klik het juiste getal aan.'" class="mb-4 prose prose-sm prose-invert text-slate-300" />

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && currentLevelData.worked" class="bg-amber-900/30 p-4 rounded-lg mb-4 border-l-4 border-amber-500 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorbeeld — Ik doe voor</span>
              </div>
              <p class="text-sm text-slate-300 mb-2">
                Bewering: <span class="text-white font-bold"><MathText :content="currentLevelData.worked.premise" class="inline" /> ⇒ <MathText :content="currentLevelData.worked.conclusion" class="inline" /></span>
              </p>
              <p class="text-xs text-slate-400 mb-1">Dit betekent: <span class="text-slate-300">{{ currentLevelData.worked.premise }} impliceert {{ currentLevelData.worked.conclusion }}</span></p>
              <div class="bg-slate-900/50 p-3 rounded-lg border border-amber-700 mb-2">
                <p class="text-sm text-emerald-300 font-bold">Tegenvoorbeeld: <span class="text-emerald-200">{{ currentLevelData.worked.counterexample }}</span></p>
                <p class="text-xs text-slate-400 mt-1">{{ currentLevelData.worked.explanation }}</p>
              </div>
              <p class="text-xs text-slate-500 italic">{{ currentLevelData.worked.method }}</p>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-amber-400 bg-slate-800 border-2 border-amber-600 rounded-lg hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-700 bg-amber-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhLightbulb class="w-5 h-5 text-amber-400" weight="fill" />
                <span class="font-bold text-amber-300 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Wat moet een getal doen om een implictie (⇒) te ontkrachten?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in predictionOptions" :key="opt.id"
                        @click="predictedCategory = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedCategory === opt.id ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-slate-600'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedCategory" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy" class="mt-4 p-4 bg-indigo-900/30 border border-indigo-700 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Waarom is dit waar?</span>
              </div>
              <p class="text-sm text-indigo-200">{{ whyText }}</p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection" class="p-4 border border-indigo-700 bg-indigo-900/20 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-400" weight="fill" />
                <span class="font-bold text-indigo-300 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-300 mb-3">Wat betekent het als we zeggen dat één getal een implicatie (A ⇒ B) kan ontkrachten? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-600 rounded-lg text-sm bg-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-700 outline-none resize-none"
                rows="4" placeholder="Een implicatie betekent..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
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

              <button v-if="!showWorkedExample && !showPrediction && !showReflection && !isCorrect"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-300 rounded-lg border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Afronden</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL — Number Line -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

            <div class="w-full max-w-4xl flex flex-col items-center">

              <!-- The Rule -->
              <div class="relative mb-20 w-full flex flex-col items-center">
                <div :key="currentInternalLevel" class="bg-slate-800 border-2 border-slate-600 px-8 py-6 rounded-xl shadow-md relative z-10 transition-all duration-700 ease-in-out animate-fadeIn"
                     :class="ruleShattered ? 'opacity-30 scale-110 blur-sm rotate-3' : 'opacity-100 scale-100'">
                  <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 text-center">Bewering</p>
                  <h1 class="text-xl md:text-3xl font-black text-center text-white font-mono" v-html="currentLevelData.ruleHTML"></h1>
                </div>

                <!-- Shatter -->
                <div v-if="ruleShattered" class="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                  <div class="w-full max-w-xl h-1.5 bg-amber-500 rotate-12 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]"></div>
                  <div class="absolute w-full max-w-xl h-1.5 bg-amber-500 -rotate-6 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]" style="animation-delay: 0.1s"></div>
                </div>
              </div>

              <!-- Number Line -->
              <div class="w-full max-w-4xl relative px-8 pb-12 transition-opacity" :class="ruleShattered ? 'opacity-50 pointer-events-none' : 'opacity-100'">
                <div class="absolute left-8 right-8 top-8 h-2 bg-slate-600 rounded-full z-0"></div>
                <div class="flex justify-between relative z-10">
                  <button v-for="num in numbers" :key="num"
                          @click="selectNumber(num)"
                          class="relative flex flex-col items-center group outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                    <div class="w-3.5 h-3.5 rounded-full border-4 border-slate-800 transition-all z-20"
                         :class="{
                             'bg-slate-400 group-hover:bg-amber-500 group-hover:scale-150': selectedNumber !== num,
                             'bg-amber-500 border-amber-200 scale-150 shadow-[0_0_15px_rgba(251,191,36,0.6)]': isCorrect && selectedNumber === num,
                             'bg-red-500 border-red-200 scale-150 animate-shake': !isCorrect && selectedNumber === num
                         }">
                    </div>
                    <span class="absolute top-8 font-bold font-mono transition-colors text-sm"
                          :class="selectedNumber === num ? (isCorrect ? 'text-amber-400' : 'text-red-400') : 'text-slate-500 group-hover:text-amber-500'">
                      {{ num }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Legend -->
              <div class="flex gap-6 text-xs text-slate-500 mt-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span>Te kiezen getallen</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Tegenvoorbeeld</span>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

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
    100% { transform: scaleX(1); opacity: 0.8; }
}

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
</style>
