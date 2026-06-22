<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhArrowClockwise,
  PhLightbulb,
  PhBrain,
  PhBookOpen,
  PhChatCircleText,
  PhTarget,
  PhBalloon
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Luchtballon & Goniometrie'
  },
  instruction: {
    type: String,
    default: 'Een luchtballon is met een touw aan de grond verankerd. De hoek tussen het touw en de grond is \u03b1. Je gaat de zijden van deze driehoek benoemen en goniometrische verhoudingen berekenen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhBalloon }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)

// --- 8-element pedagogical state ---
const showWorkedExample = ref(true)
const workedStep = ref(0)
const workedSteps = [
  { label: 'Ballon op 30 m hoogte', detail: 'Touw = 50 m, afstand tot anker = 40 m' },
  { label: 'Overstaand = hoogte = 30 m', detail: 'Recht tegenover hoek \u03b1 (de ballon)' },
  { label: 'Aanliggend = grond = 40 m', detail: 'Langs hoek \u03b1 (de grond)' },
  { label: 'Schuine = touw = 50 m', detail: 'Van anker tot ballon' },
  { label: 'SOS CAS TOA toepassen', detail: 'sin \u03b1 = 30/50 = 0.6' }
]

const showPrediction = ref(true)
const predictionChoice = ref(null)
const predictionMade = ref(false)
const predictionWrongCount = ref(0)

const showWhy = ref(false)
const showErrorAnalysis = ref(false)
const showReflection = ref(false)
const reflectionDone = ref(false)
const showLPDEvidence = ref(false)
const lpdDone = ref(false)
const reflectAns = ref('')

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)

// Level system
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// Pythagorean triples for realistic balloon dimensions
const triples = [
  { O: 3, A: 4, S: 5 },
  { O: 6, A: 8, S: 10 },
  { O: 5, A: 12, S: 13 },
  { O: 9, A: 12, S: 15 },
  { O: 8, A: 15, S: 17 },
  { O: 12, A: 16, S: 20 },
  { O: 7, A: 24, S: 25 },
  { O: 15, A: 20, S: 25 },
  { O: 20, A: 21, S: 29 }
]

function scaleTriple(triple, scale) {
  return {
    O: triple.O * scale,
    A: triple.A * scale,
    S: triple.S * scale
  }
}

function generateLevel(levelIndex) {
  const triple = pick(triples)
  const scaleFactor = pick([1, 2, 3, 5])
  const dim = scaleTriple(triple, scaleFactor)

  // Real-world labels
  const balloonHeight = dim.O
  const groundDist = dim.A
  const stringLength = dim.S

  let levelConfig

  if (levelIndex === 0) {
    // Level 0 (Toepassen): Identify which side is opposite/adjacent/hypotenuse
    // Student is asked: "Wat is de overstaande zijde bij hoek \u03b1?"
    // They click on the correct side in the SVG

    const askType = pick(['opposite', 'adjacent', 'hypotenuse'])
    let correctSide, questionText, correctAnswer, wrongAnswers

    if (askType === 'opposite') {
      correctSide = 'height'
      questionText = 'Wat is de OVERSTAANDE zijde bij hoek \u03b1?'
      correctAnswer = 0 // index of 'height'
      wrongAnswers = ['De schuine zijde (touw)', 'De aanliggende zijde (grond)']
    } else if (askType === 'adjacent') {
      correctSide = 'ground'
      questionText = 'Wat is de AANLIGGENDE zijde bij hoek \u03b1?'
      correctAnswer = 1 // index of 'ground'
      wrongAnswers = ['De overstaande zijde (hoogte)', 'De schuine zijde (touw)']
    } else {
      correctSide = 'string'
      questionText = 'Wat is de SCHUINE zijde (hypotenusa)?'
      correctAnswer = 2 // index of 'string'
      wrongAnswers = ['De overstaande zijde (hoogte)', 'De aanliggende zijde (grond)']
    }

    levelConfig = {
      levelIndex: 0,
      bloomLabel: '(Toepassen)',
      mode: 'identify',
      dim,
      balloonHeight,
      groundDist,
      stringLength,
      askType,
      correctSide,
      questionText,
      correctAnswer,
      wrongAnswers,
      predictionQ: 'In een rechthoekige driehoek: welke zijde ligt tegenover de rechte hoek?',
      predictionOpts: ['Overstaand', 'Aanliggend', 'Schuine (hypotenusa)'],
      predictionCorrect: 2,
      whyText: '<strong>Waarom is dit handig?</strong><br>In de echte wereld kun je de hoogte van een ballon niet altijd direct meten (je kunt er niet met een meetlint naartoe). Maar je kunt wel de afstand op de grond en de hoek van het touw meten. Met goniometrische verhoudingen bereken je dan de hoogte zonder te klimmen!',
      errorText: '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>Overstaand vs aanliggend:</strong> Overstaand ligt TEGENOVER de hoek. Aanliggend is de zijde die de hoek raakt (samen met de schuine). In de balloncontext: de hoogte is overstaand, de grond is aanliggend.</li><li><strong>Schuine zijde herkennen:</strong> De schuine zijde is altijd de LANGSTE zijde. Bij de ballon is het touw de langste zijde.</li><li><strong>Hoek verkeerd plaatsen:</strong> Hoek \u03b1 zit bij het ankerpunt op de grond. Vanuit \u03b1 gezien: overstaand = hoogte (ballon), aanliggend = grond, schuin = touw.</li></ul>',
      reflectQ: 'Waarom is de schuine zijde altijd de langste zijde in een rechthoekige driehoek? Wat zegt dit over de relatie tussen de hoeken en zijden?',
      lpdText: 'Ik kan in een realistische context (ballon, touw, grond) de overstaande, aanliggende en schuine zijde identificeren.'
    }
  } else if (levelIndex === 1) {
    // Level 1 (Analyseren): Drag labels (O, A, H) to the correct sides
    levelConfig = {
      levelIndex: 1,
      bloomLabel: '(Analyseren)',
      mode: 'drag',
      dim,
      balloonHeight,
      groundDist,
      stringLength,
      predictionQ: `De ballon hangt op ${balloonHeight} m, het touw is ${stringLength} m lang. Welke goniometrische verhouding bereken je met ${balloonHeight}/${stringLength}?`,
      predictionOpts: ['Sinus (O/S)', 'Cosinus (A/S)', 'Tangens (O/A)'],
      predictionCorrect: 0,
      whyText: `<strong>Waarom sin \u03b1 = ${balloonHeight}/${stringLength}?</strong><br>De hoogte (${balloonHeight} m) is de overstaande zijde bij hoek \u03b1. Het touw (${stringLength} m) is de schuine zijde. Volgens SOS CAS TOA: Sinus = Overstaand / Schuine. Dus sin \u03b1 = ${balloonHeight}/${stringLength} = ${(balloonHeight / stringLength).toFixed(2)}. Dit vertelt ons hoeveel de ballon stijgt per meter touw.`,
      errorText: '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>O, A, H door elkaar halen:</strong> Het label \u201cO\u201d (overstaand) hoort bij de HOOGTE (ballon). Het label \u201cA\u201d (aanliggend) hoort bij de GROND. Het label \u201cH\u201d (schuine) hoort bij het TOUW.</li><li><strong>Verkeerde combinatie slepen:</strong> Controleer goed welk label bij welke zijde hoort. Denk aan de positie van hoek \u03b1 bij het ankerpunt.</li><li><strong>De schuine zijde is niet de grond:</strong> De schuine zijde is het TOUW, niet de grond. De grond is de aanliggende zijde.</li></ul>',
      reflectQ: 'Je hebt net de sinus van hoek \u03b1 berekend. Wat vertelt sin \u03b1 = 0.6 je eigenlijk over de ballon? Hoe verandert deze waarde als het touw langer wordt maar de hoogte hetzelfde blijft?',
      lpdText: 'Ik kan de goniometrische labels (overstaand, aanliggend, schuine) correct plaatsen in een realistische driehoek en de juiste verhouding bepalen.'
    }
  } else {
    // Level 2 (Evalueren): Given two sides and an angle, compute the third
    const asked = pick(['sin', 'cos', 'tan'])
    let computeQ, computeAnswer, computeAltAnswers, askQ

    if (asked === 'sin') {
      computeQ = `Bereken sin \u03b1 = overstaand / schuin = ${balloonHeight}/${stringLength}`
      computeAnswer = parseFloat((balloonHeight / stringLength).toFixed(2))
      computeAltAnswers = [`${balloonHeight}/${stringLength}`]
      askQ = `Bereken sin \u03b1 (hoogte/touw)`
    } else if (asked === 'cos') {
      computeQ = `Bereken cos \u03b1 = aanliggend / schuin = ${groundDist}/${stringLength}`
      computeAnswer = parseFloat((groundDist / stringLength).toFixed(2))
      computeAltAnswers = [`${groundDist}/${stringLength}`]
      askQ = `Bereken cos \u03b1 (grond/touw)`
    } else {
      computeQ = `Bereken tan \u03b1 = overstaand / aanliggend = ${balloonHeight}/${groundDist}`
      computeAnswer = parseFloat((balloonHeight / groundDist).toFixed(2))
      computeAltAnswers = [`${balloonHeight}/${groundDist}`]
      askQ = `Bereken tan \u03b1 (hoogte/grond)`
    }

    levelConfig = {
      levelIndex: 2,
      bloomLabel: '(Evalueren)',
      mode: 'compute',
      dim,
      balloonHeight,
      groundDist,
      stringLength,
      asked,
      computeQ,
      computeAnswer,
      computeAltAnswers,
      askQ,
      predictionQ: `Voor de ballon: wat is de aanliggende zijde bij hoek \u03b1?`,
      predictionOpts: [`De hoogte (${balloonHeight} m)`, `De grond (${groundDist} m)`, `Het touw (${stringLength} m)`],
      predictionCorrect: 1,
      whyText: `<strong>Waarom is dit nuttig in de praktijk?</strong><br>Stel dat je de hoogte van de ballon wilt weten, maar je kunt alleen de afstand op de grond (${groundDist} m) en de hoek van het touw meten. Met tangens: tan \u03b1 = hoogte / grond. Dus hoogte = tan \u03b1 \u00d7 ${groundDist}. Je hebt geen meter nodig om de ballon te bereiken! Dit is waarom goniometrie zo krachtig is: het laat je meten zonder fysiek toegang te hebben.`,
      errorText: '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>Verkeerde formule kiezen:</strong> Bepaal eerst welke zijden je kent en welke je zoekt. Gebruik dan SOS CAS TOA om de juiste verhouding te kiezen.</li><li><strong>Deling verkeerd om:</strong> Sinus = O/S, niet S/O! Controleer altijd of je getal kleiner dan 1 is (behalve bij tangens).</li><li><strong>Context vergeten:</strong> De getallen hebben betekenis. De hoogte kan nooit langer zijn dan het touw. De grond kan nooit langer zijn dan het touw. Check of je antwoord logisch is in de realiteit.</li></ul>',
      reflectQ: 'Waarom is goniometrie bijzonder nuttig voor situaties zoals deze ballon? Wat kun je berekenen zonder fysiek te meten, en waarom is dat belangrijk in de echte wereld?',
      lpdText: 'Ik kan in een realistische context de juiste goniometrische verhouding kiezen en de waarde berekenen.'
    }
  }

  return levelConfig
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// ===== Level 0: Identify side =====
const sideChoice = ref(null)

// ===== Level 1: Drag labels =====
const labelSlots = ref({ height: null, ground: null, string: null })
let draggedLabel = null

const labelOptions = [
  { id: 'O', label: 'O (overstaand)' },
  { id: 'A', label: 'A (aanliggend)' },
  { id: 'H', label: 'H (schuine)' }
]

// Correct mapping for drag level
const correctDrag = { height: 'O', ground: 'A', string: 'H' }

// ===== Level 2: Compute =====
const computeValue = ref(null)

function getHintText() {
  const d = currentLevelData.value
  const c = hintCount.value

  if (c <= 1) {
    if (d.mode === 'identify') {
      return '<strong>Hint 1:</strong> Kijk naar hoek \u03b1 bij het ankerpunt op de grond. De overstaande zijde is de zijde RECHT TEGENOVER hoek \u03b1 — dat is de verticale lijn (hoogte). De aanliggende zijde is de horizontale lijn (grond). De schuine zijde is het touw.'
    }
    if (d.mode === 'drag') {
      return '<strong>Hint 1:</strong> O = Overstaand (recht tegenover de hoek) = de hoogte. A = Aanliggend (langs de hoek) = de grond. H = Schuine (= hypotenusa) = het touw. Sleep elk label naar de juiste plaats.'
    }
    return '<strong>Hint 1:</strong> Bepaal eerst: welke zijden ken je? SOS CAS TOA helpt je kiezen. Overstaand = hoogte ballon, aanliggend = grond, schuin = touw.'
  } else if (c <= 3) {
    if (d.mode === 'identify') {
      return '<strong>Hint 2:</strong> Voorbeeld: in een ballonsituatie met hoogte 30 m en touw 50 m: Overstaand = 30 m (hoogte), Aanliggend = 40 m (grond). Schuine = 50 m (touw). Kijk naar jouw figuur en bepaal welke zijde gevraagd wordt.'
    }
    if (d.mode === 'drag') {
      return '<strong>Hint 2:</strong> Voorbeeld: een ballon op 30 m hoogte met touw van 50 m en grondafstand 40 m. O = 30 m (hoogte), A = 40 m (grond), H = 50 m (touw). Sleep de labels naar de overeenkomstige zijden.'
    }
    if (d.asked === 'sin') {
      return `<strong>Hint 2:</strong> Voorbeeld: ballon 30 m hoog, touw 50 m. sin \u03b1 = 30/50 = 0.6. Jouw ballon: hoogte = ${d.balloonHeight} m, touw = ${d.stringLength} m. sin \u03b1 = ${d.balloonHeight}/${d.stringLength} = ?`
    } else if (d.asked === 'cos') {
      return `<strong>Hint 2:</strong> Voorbeeld: ballon, grond 40 m, touw 50 m. cos \u03b1 = 40/50 = 0.8. Jouw ballon: grond = ${d.groundDist} m, touw = ${d.stringLength} m. cos \u03b1 = ${d.groundDist}/${d.stringLength} = ?`
    } else {
      return `<strong>Hint 2:</strong> Voorbeeld: ballon 30 m hoog, grond 40 m. tan \u03b1 = 30/40 = 0.75. Jouw ballon: hoogte = ${d.balloonHeight} m, grond = ${d.groundDist} m. tan \u03b1 = ${d.balloonHeight}/${d.groundDist} = ?`
    }
  } else {
    if (d.mode === 'identify') {
      return '<strong>Hint 3:</strong> Methode: bepaal eerst waar hoek \u03b1 zit (bij het anker). De overstaande zijde is de lijn die de hoek niet raakt. De aanliggende zijde is de lijn die de hoek wel raakt (samen met de schuine). De schuine zijde is de langste.'
    }
    if (d.mode === 'drag') {
      return '<strong>Hint 3:</strong> Vul in: De HOOGTE van de ballon is ___ (O overstaand). De GROND is ___ (A aanliggend). Het TOUW is ___ (H schuine).'
    }
    return '<strong>Hint 3:</strong> Methode: SOS CAS TOA. Bepaal O, A en H. Vul de formule in. Deel de getallen. Het antwoord is ___ (vul zelf in).'
  }
}

// ===== Level 0: Side identification =====
function selectSide(side) {
  if (isCorrect.value || showPrediction.value) return
  sideChoice.value = side
  isChecked.value = false
  checkIdentification()
}

function checkIdentification() {
  const d = currentLevelData.value
  if (!sideChoice.value) return

  if (sideChoice.value === d.correctSide) {
    isCorrect.value = true
    showWhy.value = true
    showErrorAnalysis.value = true
    showReflection.value = true
    feedback.value = {
      type: 'success',
      text: `Juist! De ${d.correctSide === 'height' ? 'hoogte (overstaand)' : d.correctSide === 'ground' ? 'grond (aanliggend)' : 'touw (schuine zijde)'} is correct gekozen.`
    }
  } else {
    attemptCount.value++
    const names = { height: 'hoogte', ground: 'grond', string: 'touw' }
    feedback.value = {
      type: 'error',
      text: `Niet helemaal. "${names[sideChoice.value] || sideChoice.value}" is niet de juiste zijde voor deze vraag. Denk aan de positie van hoek \u03b1.`
    }
  }
}

// ===== Level 1: Drag labels =====
function onLabelDragStart(labelId) {
  if (isCorrect.value || showPrediction.value) return
  draggedLabel = labelId
}

function onLabelDrop(targetSide) {
  if (isCorrect.value || !draggedLabel || showPrediction.value) return
  labelSlots.value[targetSide] = draggedLabel
  draggedLabel = null
  isChecked.value = false
  checkDragCorrect()
}

function removeLabel(targetSide) {
  if (isCorrect.value) return
  labelSlots.value[targetSide] = null
  isChecked.value = false
}

function checkDragCorrect() {
  const d = currentLevelData.value
  const correct1 = labelSlots.value.height === correctDrag.height
  const correct2 = labelSlots.value.ground === correctDrag.ground
  const correct3 = labelSlots.value.string === correctDrag.string

  if (labelSlots.value.height && labelSlots.value.ground && labelSlots.value.string) {
    if (correct1 && correct2 && correct3) {
      isCorrect.value = true
      showWhy.value = true
      showErrorAnalysis.value = true
      showReflection.value = true
      feedback.value = {
        type: 'success',
        text: `Perfect! O = hoogte (${d.balloonHeight} m), A = grond (${d.groundDist} m), H = touw (${d.stringLength} m).`
      }
    } else {
      attemptCount.value++
      const wrong = []
      if (!correct1) wrong.push('hoogte')
      if (!correct2) wrong.push('grond')
      if (!correct3) wrong.push('touw')
      feedback.value = {
        type: 'error',
        text: `Niet helemaal. De label(s) voor ${wrong.join(', ')} zijn niet correct.`
      }
    }
  }
}

// ===== Level 2: Compute =====
function submitCompute() {
  const d = currentLevelData.value
  const val = computeValue.value

  if (val === null || val === undefined || val === '') {
    feedback.value = { type: 'error', text: 'Voer eerst een getal in.' }
    return
  }

  const expectedNum = d.computeAnswer
  const inputNum = parseFloat(val)
  const inputStr = String(val).trim()

  const isExactFraction = d.computeAltAnswers.includes(inputStr)
  const isNumericMatch = !isNaN(inputNum) && Math.abs(inputNum - expectedNum) < 0.01

  if (isExactFraction || isNumericMatch) {
    isCorrect.value = true
    showWhy.value = true
    showErrorAnalysis.value = true
    showReflection.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${d.computeQ} = ${inputStr} = ${expectedNum}`
    }
  } else {
    attemptCount.value++
    hintCount.value++
    feedback.value = {
      type: 'error',
      text: `Niet helemaal. ${d.computeQ} = ${expectedNum}, niet ${val}.`
    }
  }
}

// ===== Common functions =====
function submitPrediction() {
  if (predictionChoice.value === null) return
  const d = currentLevelData.value
  if (predictionChoice.value === d.predictionCorrect) {
    showPrediction.value = false
    predictionMade.value = true
    feedback.value = {
      type: 'info',
      text: '<strong>Juist!</strong> Ga nu verder met de opdracht.'
    }
  } else {
    predictionWrongCount.value++
    hintCount.value++
    feedback.value = {
      type: 'error',
      text: `<strong>Niet helemaal.</strong> Denk opnieuw na over de positie van de hoek en de zijden.`
    }
  }
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0

  // Clear level-specific state
  sideChoice.value = null
  labelSlots.value = { height: null, ground: null, string: null }
  computeValue.value = null

  showPrediction.value = true
  predictionChoice.value = null
  predictionMade.value = false
  predictionWrongCount.value = 0
  showWhy.value = false
  showErrorAnalysis.value = false
  showReflection.value = false
  reflectionDone.value = false
  showLPDEvidence.value = false
  lpdDone.value = false
  reflectAns.value = ''
}

function triggerHint() {
  hintCount.value++
  attemptCount.value++
}

function handleReflectionDone() {
  if (reflectAns.value.trim().length > 0) {
    reflectionDone.value = true
  }
}

function handleLPDDone() {
  lpdDone.value = true
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    showWorkedExample.value = false
    workedStep.value = 0
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

function advanceNextCheck() {
  if (!showWhy.value) {
    showWhy.value = true
    showErrorAnalysis.value = true
    return
  }
  if (!showReflection.value) {
    showReflection.value = true
    return
  }
  if (!reflectionDone.value && reflectAns.value.trim().length === 0) {
    return
  }
  if (!reflectionDone.value) {
    reflectionDone.value = true
    return
  }
  if (!showLPDEvidence.value && currentInternalLevel.value === totalInternalLevels - 1) {
    showLPDEvidence.value = true
    return
  }
  if (showLPDEvidence.value && !lpdDone.value) {
    lpdDone.value = true
    return
  }
  handleNext()
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    showWorkedExample.value = true
    workedStep.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      shouldPulse.value = true
      setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
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
         @keydown.enter.prevent="emit('close')"
         @keydown.space.prevent="emit('close')"
         aria-label="Sluiten">
    </div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
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
                <span v-if="currentLevelData" class="ml-1 text-amber-600 font-bold">{{ currentLevelData.bloomLabel }}</span>
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
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <!-- LEFT PANEL -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">

            <!-- WORKED EXAMPLE (Level 0 only) -->
            <div v-if="showWorkedExample && currentInternalLevel === 0"
                 class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" />
                <h4 class="font-bold text-indigo-800">Voorbeeld: balloncontext</h4>
              </div>
              <div class="space-y-1">
                <div v-for="(s, i) in workedSteps" :key="i"
                     @click="workedStep = i"
                     class="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                     :class="workedStep === i ? 'bg-indigo-100' : 'hover:bg-indigo-100/50'">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                       :class="workedStep >= i ? 'bg-indigo-500 text-white' : 'bg-indigo-200 text-indigo-400'">
                    {{ i + 1 }}
                  </div>
                  <div>
                    <p class="text-sm font-medium"
                       :class="workedStep === i ? 'text-indigo-900' : 'text-indigo-600'">
                      {{ s.label }}
                    </p>
                    <p v-if="workedStep === i" class="text-xs text-indigo-500">
                      {{ s.detail }}
                    </p>
                  </div>
                </div>
              </div>
              <button @click="showWorkedExample = false"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction && !showWorkedExample"
                 class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.predictionQ }}
              </p>
              <div class="flex gap-2 mb-3 flex-wrap">
                <button v-for="(opt, idx) in currentLevelData.predictionOpts" :key="idx"
                        @click="predictionChoice = idx"
                        class="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all"
                        :class="predictionChoice === idx
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  {{ opt }}
                </button>
              </div>
              <button @click="submitPrediction"
                      :disabled="predictionChoice === null"
                      class="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- GOAL TEXT -->
            <div v-if="!showWorkedExample && !showPrediction"
                 class="text-center bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm mb-4 animate-fadeIn">
              <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy"
                 class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhCheckCircle weight="fill" class="w-5 h-5 text-indigo-600" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <MathText :content="currentLevelData.whyText"
                        class="text-sm text-indigo-700 leading-relaxed" />
            </div>

            <!-- ERROR ANALYSIS -->
            <div v-if="showErrorAnalysis"
                 class="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle weight="fill" class="w-5 h-5 text-red-500" />
                <span class="font-bold text-red-700 text-sm">Let op! Veelgemaakte fouten</span>
              </div>
              <div class="text-sm text-red-600 leading-relaxed"
                   v-html="currentLevelData.errorText">
              </div>
            </div>

            <!-- ===== LEVEL 0: Side choices ===== -->
            <div v-if="!showWorkedExample && !showPrediction && currentLevelData.mode === 'identify' && !isCorrect"
                 class="mt-4 space-y-3">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Klik op de juiste zijde in de tekening</p>
              <div class="flex gap-2">
                <button @click="selectSide('height')"
                        class="flex-1 p-3 border-2 rounded-xl text-sm font-bold transition-all"
                        :class="sideChoice === 'height'
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  Hoogte (ballon)
                </button>
                <button @click="selectSide('ground')"
                        class="flex-1 p-3 border-2 rounded-xl text-sm font-bold transition-all"
                        :class="sideChoice === 'ground'
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  Grond
                </button>
                <button @click="selectSide('string')"
                        class="flex-1 p-3 border-2 rounded-xl text-sm font-bold transition-all"
                        :class="sideChoice === 'string'
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  Touw
                </button>
              </div>
            </div>

            <!-- ===== LEVEL 1: Drag labels ===== -->
            <div v-if="!showWorkedExample && !showPrediction && currentLevelData.mode === 'drag'"
                 class="mt-4 space-y-4">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Sleep de labels naar de juiste zijde</p>
              <!-- Label pool -->
              <div class="flex gap-3">
                <div v-for="opt in labelOptions" :key="opt.id"
                     draggable="true"
                     @dragstart="onLabelDragStart(opt.id)"
                     class="px-4 py-2 border-2 border-slate-300 bg-white rounded-xl font-bold text-sm cursor-grab active:cursor-grabbing hover:border-amber-500 hover:text-amber-600 transition-colors"
                     :class="{ 'opacity-30 pointer-events-none': labelSlots.height === opt.id || labelSlots.ground === opt.id || labelSlots.string === opt.id }">
                  {{ opt.label }}
                </div>
              </div>
              <!-- Drop zone status -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                <p class="text-xs font-bold text-slate-500 mb-2 text-center">Drop zones:</p>
                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div class="p-2 border-2 border-dashed rounded-lg"
                         :class="labelSlots.height
                           ? (labelSlots.height === 'O' ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50')
                           : 'border-slate-300 bg-white'">
                      <template v-if="labelSlots.height">{{ labelSlots.height }}</template>
                      <template v-else>Hoogte</template>
                    </div>
                  </div>
                  <div>
                    <div class="p-2 border-2 border-dashed rounded-lg"
                         :class="labelSlots.ground
                           ? (labelSlots.ground === 'A' ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50')
                           : 'border-slate-300 bg-white'">
                      <template v-if="labelSlots.ground">{{ labelSlots.ground }}</template>
                      <template v-else>Grond</template>
                    </div>
                  </div>
                  <div>
                    <div class="p-2 border-2 border-dashed rounded-lg"
                         :class="labelSlots.string
                           ? (labelSlots.string === 'H' ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50')
                           : 'border-slate-300 bg-white'">
                      <template v-if="labelSlots.string">{{ labelSlots.string }}</template>
                      <template v-else>Touw</template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== LEVEL 2: Compute input ===== -->
            <div v-if="!showWorkedExample && !showPrediction && currentLevelData.mode === 'compute' && !isCorrect"
                 class="mt-4 p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <label class="block text-sm font-bold text-amber-800 mb-2">
                {{ currentLevelData.askQ }}
              </label>
              <div class="text-xs text-amber-700 mb-3">
                <p>Hoogte (O) = {{ currentLevelData.balloonHeight }} m</p>
                <p>Grond (A) = {{ currentLevelData.groundDist }} m</p>
                <p>Touw (H) = {{ currentLevelData.stringLength }} m</p>
              </div>
              <div class="flex items-center gap-2">
                <input type="text" v-model="computeValue" placeholder="bv. 0.6 of 30/50"
                       class="flex-1 p-3 border-2 border-amber-300 rounded-lg bg-white font-mono font-bold text-lg focus:border-amber-500 focus:outline-none"
                       @keyup.enter="submitCompute" />
                <button @click="submitCompute"
                        class="px-4 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Check
                </button>
              </div>
              <p class="text-xs text-amber-600 mt-2">Antwoord als kommagetal (bv. 0.6) of breuk (bv. 30/50)</p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectionDone && !showWorkedExample && !showPrediction"
                 class="mt-6 p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhChatCircleText class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800">Reflectie</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.reflectQ }}
              </p>
              <textarea v-model="reflectAns" rows="3"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Typ je antwoord...">
              </textarea>
              <button @click="handleReflectionDone"
                      :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <!-- LPD EVIDENCE -->
            <div v-if="showLPDEvidence && !lpdDone"
                 class="mt-6 p-5 border-2 border-emerald-300 bg-emerald-50 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhTarget class="w-5 h-5 text-emerald-600" weight="fill" />
                <span class="font-bold text-emerald-800">LPD-bewijs</span>
              </div>
              <p class="text-sm text-emerald-700 mb-3">
                {{ currentLevelData.lpdText }}
              </p>
              <button @click="handleLPDDone"
                      class="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
                Ik bevestig dat ik dit doel bereikt heb
              </button>
            </div>

          </div>

          <!-- FOOTER -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle"
                          class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="feedback.text"></span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && hintCount > 0 && !showWorkedExample && !showPrediction"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="getHintText()"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showWorkedExample && !showPrediction"
                      @click="triggerHint"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Geef me een hint
              </button>

              <button v-else-if="isCorrect"
                      @click="advanceNextCheck"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>
                  <template v-if="!showWhy">Waarom?</template>
                  <template v-else-if="!showReflection">Reflecteer</template>
                  <template v-else-if="!reflectionDone">Bevestig reflectie</template>
                  <template v-else-if="showLPDEvidence && !lpdDone">LPD-bewijs</template>
                  <template v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</template>
                </span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-else-if="showPrediction" class="flex-1 text-sm text-slate-400 text-center">
                Beantwoord eerst de voorspelling
              </div>
              <div v-else-if="showWorkedExample" class="flex-1 text-sm text-slate-400 text-center">
                Doorloop het voorbeeld
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: Balloon Scene SVG -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-gradient-to-b from-sky-200 to-sky-50 rounded-xl border-2 border-sky-300 pattern-clouds overflow-hidden">

              <div v-if="currentLevelData" class="relative w-[350px] h-[400px]">

                <!-- Sun -->
                <div class="absolute top-4 right-8 w-12 h-12 rounded-full bg-yellow-300 shadow-lg">
                </div>

                <!-- Clouds -->
                <div class="absolute top-8 left-12 w-20 h-8 bg-white/80 rounded-full">
                </div>
                <div class="absolute top-12 left-24 w-16 h-6 bg-white/70 rounded-full">
                </div>

                <!-- Ground (green rectangle at bottom) -->
                <div class="absolute bottom-0 left-0 right-0 h-16 bg-emerald-600 rounded-t-3xl border-t-4 border-emerald-800">
                  <div class="absolute inset-0 bg-emerald-500/30 rounded-t-3xl"></div>
                  <!-- Grass texture -->
                  <div class="absolute top-1 left-4 w-4 h-2 bg-emerald-400 rounded-full"></div>
                  <div class="absolute top-2 left-10 w-3 h-2 bg-emerald-400 rounded-full"></div>
                  <div class="absolute top-0 right-6 w-5 h-3 bg-emerald-400 rounded-full"></div>
                </div>

                <!-- Anchor point (bottom-left) -->
                <div class="absolute bottom-12 left-12 w-4 h-4 bg-slate-700 rounded-full z-10">
                </div>
                <div class="absolute bottom-8 left-10 w-8 h-4 bg-slate-600 rounded-lg z-10">
                </div>

                <!-- SVG overlay for the triangle -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 350 400">
                  <!-- Triangle outline -->
                  <polygon points="50,340 50,60 290,340"
                           fill="none" stroke="#475569" stroke-width="3"
                           stroke-dasharray="8,4" opacity="0.4" />

                  <!-- Solid triangle for interactive areas (Level 0 click targets) -->
                  <polygon points="50,340 50,60 290,340"
                           fill="white" opacity="0.15"
                           class="pointer-events-auto" />
                </svg>

                <!-- Interactive side: height (vertical) -->
                <div v-if="currentLevelData.mode === 'identify'"
                     class="absolute cursor-pointer transition-all duration-200 hover:opacity-80 z-20"
                     :class="sideChoice === 'height' ? 'ring-4 ring-amber-500 rounded-lg' : ''"
                     style="left: 42px; top: 60px; width: 16px; height: 280px;"
                     @click="selectSide('height')">
                  <div class="w-full h-full"
                       :class="sideChoice === 'height' ? 'bg-amber-400' : 'bg-blue-500/60'">
                  </div>
                </div>

                <!-- Interactive side: ground (horizontal) -->
                <div v-if="currentLevelData.mode === 'identify'"
                     class="absolute cursor-pointer transition-all duration-200 hover:opacity-80 z-20"
                     :class="sideChoice === 'ground' ? 'ring-4 ring-amber-500 rounded-lg' : ''"
                     style="left: 50px; bottom: 28px; height: 16px; width: 240px;"
                     @click="selectSide('ground')">
                  <div class="w-full h-full"
                       :class="sideChoice === 'ground' ? 'bg-amber-400' : 'bg-emerald-500/60'">
                  </div>
                </div>

                <!-- Interactive side: string (hypotenuse) -->
                <div v-if="currentLevelData.mode === 'identify'"
                     class="absolute cursor-pointer transition-all duration-200 hover:opacity-80 z-20"
                     :class="sideChoice === 'string' ? 'ring-4 ring-amber-500 rounded-lg' : ''"
                     @click="selectSide('string')"
                     style="left: 44px; top: 52px; width: 244px; height: 292px;">
                  <div class="w-full h-full"
                       style="clip-path: polygon(0 0, 100% 100%, 0 100%);"
                       :class="sideChoice === 'string' ? 'bg-amber-400/60' : 'bg-amber-700/30'">
                  </div>
                </div>

                <!-- The string line (always visible) -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 350 400">
                  <line x1="50" y1="340" x2="50" y2="60"
                        stroke="#3b82f6" stroke-width="5" stroke-linecap="round" opacity="0.6" />
                  <line x1="50" y1="340" x2="290" y2="340"
                        stroke="#10b981" stroke-width="5" stroke-linecap="round" opacity="0.6" />
                  <line x1="50" y1="340" x2="50" y2="60"
                        stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4" />
                </svg>

                <!-- Side labels -->

                <!-- Height label -->
                <div class="absolute font-bold text-sm text-blue-700 bg-white/80 px-1.5 py-0.5 rounded-lg tabular-nums shadow-sm border border-blue-200"
                     style="left: 8px; top: 180px;">
                  <template v-if="currentLevelData.mode === 'drag' && labelSlots.height">
                    <span class="font-mono font-black">{{ labelSlots.height }}</span>
                  </template>
                  <template v-else>
                    H = {{ currentLevelData.balloonHeight }} m
                  </template>
                </div>

                <!-- Ground label -->
                <div class="absolute font-bold text-sm text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded-lg tabular-nums shadow-sm border border-emerald-200"
                     style="left: 140px; bottom: 20px;">
                  <template v-if="currentLevelData.mode === 'drag' && labelSlots.ground">
                    <span class="font-mono font-black">{{ labelSlots.ground }}</span>
                  </template>
                  <template v-else>
                    G = {{ currentLevelData.groundDist }} m
                  </template>
                </div>

                <!-- String label -->
                <div class="absolute font-bold text-sm text-amber-700 bg-white/80 px-1.5 py-0.5 rounded-lg tabular-nums shadow-sm border border-amber-200"
                     style="left: 120px; top: 120px;">
                  <template v-if="currentLevelData.mode === 'drag' && labelSlots.string">
                    <span class="font-mono font-black">{{ labelSlots.string }}</span>
                  </template>
                  <template v-else>
                    T = {{ currentLevelData.stringLength }} m
                  </template>
                </div>

                <!-- Angle alpha at anchor -->
                <div class="absolute text-blue-600 font-black text-xl font-serif"
                     style="left: 60px; bottom: 38px;">
                  \u03b1
                </div>

                <!-- Angle arc -->
                <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 350 400">
                  <path d="M 90 340 A 40 40 0 0 0 63 310"
                        fill="none" stroke="#3b82f6" stroke-width="3" />
                </svg>

                <!-- Right angle marker -->
                <div class="absolute border-t-3 border-l-3 border-slate-800 w-5 h-5"
                     style="left: 42px; top: 56px; transform: rotate(180deg);">
                </div>
                <div class="absolute border-t-3 border-l-3 border-slate-800 w-5 h-5"
                     style="left: 286px; bottom: 40px; transform: rotate(90deg);">
                </div>

                <!-- Balloon -->
                <div class="absolute transition-all duration-500 flex flex-col items-center"
                     style="left: 28px; top: 8px;">
                  <div class="w-20 h-24 bg-gradient-to-b from-red-400 to-red-500 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-inner border-2 border-red-600 relative overflow-hidden">
                    <div class="absolute inset-x-4 top-4 h-2 bg-red-300/40 rounded-full"></div>
                    <div class="absolute inset-x-6 top-8 h-1.5 bg-red-300/30 rounded-full"></div>
                  </div>
                  <div class="w-8 h-4 border-x-2 border-slate-600 mx-auto"></div>
                  <div class="w-10 h-8 bg-amber-800 rounded-b shadow-md border border-amber-900">
                  </div>
                </div>

                <!-- Drag targets for Level 1 -->
                <div v-if="currentLevelData.mode === 'drag' && !isCorrect"
                     @dragover.prevent.stop
                     @drop.prevent.stop="onLabelDrop('height')"
                     @click="removeLabel('height')"
                     class="absolute border-3 border-dashed rounded-xl flex items-center justify-center cursor-pointer z-20"
                     :class="labelSlots.height
                       ? (labelSlots.height === 'O' ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50')
                       : 'border-amber-400 bg-white/40 hover:bg-white/60'"
                     style="left: 8px; top: 150px; width: 60px; height: 40px;">
                  <span v-if="labelSlots.height" class="font-mono font-black text-lg">{{ labelSlots.height }}</span>
                </div>

                <div v-if="currentLevelData.mode === 'drag' && !isCorrect"
                     @dragover.prevent.stop
                     @drop.prevent.stop="onLabelDrop('ground')"
                     @click="removeLabel('ground')"
                     class="absolute border-3 border-dashed rounded-xl flex items-center justify-center cursor-pointer z-20"
                     :class="labelSlots.ground
                       ? (labelSlots.ground === 'A' ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50')
                       : 'border-amber-400 bg-white/40 hover:bg-white/60'"
                     style="left: 120px; bottom: 48px; width: 60px; height: 40px;">
                  <span v-if="labelSlots.ground" class="font-mono font-black text-lg">{{ labelSlots.ground }}</span>
                </div>

                <div v-if="currentLevelData.mode === 'drag' && !isCorrect"
                     @dragover.prevent.stop
                     @drop.prevent.stop="onLabelDrop('string')"
                     @click="removeLabel('string')"
                     class="absolute border-3 border-dashed rounded-xl flex items-center justify-center cursor-pointer z-20"
                     :class="labelSlots.string
                       ? (labelSlots.string === 'H' ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50')
                       : 'border-amber-400 bg-white/40 hover:bg-white/60'"
                     style="left: 100px; top: 80px; width: 60px; height: 40px;">
                  <span v-if="labelSlots.string" class="font-mono font-black text-lg">{{ labelSlots.string }}</span>
                </div>

                <!-- Success overlay: highlight all sides -->
                <div v-if="isCorrect" class="absolute inset-0 z-30 pointer-events-none">
                  <div class="absolute bg-emerald-400/20 rounded-lg border-2 border-emerald-400"
                       style="left: 48px; top: 64px; width: 8px; height: 276px;">
                  </div>
                  <div class="absolute bg-emerald-400/20 rounded-lg border-2 border-emerald-400"
                       style="left: 54px; bottom: 34px; width: 236px; height: 8px;">
                  </div>
                  <div class="absolute bg-emerald-400/20 rounded-lg border-2 border-emerald-400"
                       style="left: 48px; top: 64px; width: 238px; height: 280px; clip-path: polygon(0 0, 100% 100%, 0 100%);">
                  </div>
                </div>

              </div>

            </div>

            <!-- Context summary bar -->
            <div v-if="currentLevelData"
                 class="mt-4 p-3 bg-white border border-slate-200 rounded-xl">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Context</p>
              <div class="flex justify-center gap-6 text-sm">
                <div class="text-center">
                  <p class="font-bold text-blue-600 tabular-nums">{{ currentLevelData.balloonHeight }} m</p>
                  <p class="text-xs text-slate-400">Hoogte (O)</p>
                </div>
                <div class="text-center">
                  <p class="font-bold text-emerald-600 tabular-nums">{{ currentLevelData.groundDist }} m</p>
                  <p class="text-xs text-slate-400">Grond (A)</p>
                </div>
                <div class="text-center">
                  <p class="font-bold text-amber-600 tabular-nums">{{ currentLevelData.stringLength }} m</p>
                  <p class="text-xs text-slate-400">Touw (H)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone"
                    @done="celebrationDone = true"
                    :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root {
  font-family: 'Inter', sans-serif;
}

.shadow-inner-light {
  box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1);
}

.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.pattern-clouds {
    background-image:
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 30%),
        radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4) 0%, transparent 25%),
        radial-gradient(circle at 50% 80%, rgba(255,255,255,0.3) 0%, transparent 35%);
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.ring-pulse-amber {
  animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3;
  z-index: 50;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
