<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhListDashes, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Sinus- en Cosinusregel' },
  instruction: { type: String, default: 'Bepaal welke regel past, voer de juiste waarden in en bereken het gevraagde.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhListDashes }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showWorkedExample = ref(true)
const showPredictionGate = ref(false)
const predictionChoice = ref(null)
const predictionMade = ref(false)
const showReflection = ref(false)
const reflectionDone = ref(false)
const showLPDEvidence = ref(false)
const lpdDone = ref(false)
const showWhySection = ref(false)
const showErrorAnalysis = ref(false)
const identifiedAmbiguousCase = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const newLevels = []
  // Level 1: Z-H-Z (cosinusregel, straightforward)
  const sides1 = [3+Math.floor(Math.random()*6), 4+Math.floor(Math.random()*8)]
  const angle1 = [30,45,60,75][Math.floor(Math.random()*4)]
  const angle1Rad = angle1 * Math.PI / 180
  const r1 = Math.sqrt(sides1[0]*sides1[0] + sides1[1]*sides1[1] - 2*sides1[0]*sides1[1]*Math.cos(angle1Rad))
  newLevels.push({
    name: 'Z-H-Z met cosinusregel', targetRule: 'cosinus',
    scenario: `Zijde b = ${sides1[0]}, zijde c = ${sides1[1]}, ingesloten hoek α = ${angle1}°`,
    given: [
      { label: 'Zijde b', val: `${sides1[0]}`, type: 'zijde' },
      { label: 'Hoek α', val: `${angle1}°`, type: 'hoek' },
      { label: 'Zijde c', val: `${sides1[1]}`, type: 'zijde' }
    ],
    question: `Bereken zijde a via de cosinusregel. Rond af op 1 decimaal.`,
    formula: `a² = ${sides1[0]}² + ${sides1[1]}² - 2·${sides1[0]}·${sides1[1]}·cos(${angle1}°)`,
    correctAnswer: Math.round(r1 * 10) / 10,
    tolerance: 0.05,
    hints: [
      'Cosinusregel: a² = b² + c² - 2bc·cos(α). Vul in: a² = ...',
      `a² = ${sides1[0]}² + ${sides1[1]}² - 2·${sides1[0]}·${sides1[1]}·cos(${angle1}°). Bereken eerst cos(${angle1}°).`,
      `Methode: 1) Bereken b² = ${sides1[0]*sides1[0]}, c² = ${sides1[1]*sides1[1]}. 2) Bereken 2bc·cos(α). 3) Trek af. 4) Neem √. De laatste stap... (vul zelf in: rond af).`
    ]
  })

  // Level 2: H-H-Z (sinusregel)
  const angle2a = [30,35,40,45,50,55,60][Math.floor(Math.random()*7)]
  const angle2b = angle2a + 30 + Math.floor(Math.random()*4)*10
  const side2 = 8 + Math.floor(Math.random()*10)
  const angle2c = 180 - angle2a - angle2b
  const angle2bRad = angle2b * Math.PI / 180
  const angle2cRad = angle2c * Math.PI / 180
  const sideTarget = side2 * Math.sin(angle2cRad) / Math.sin(angle2bRad)
  // known: angleB = angle2b, sideB = side2 (overstaand paar). Find sideC (overstaand aan angleC)
  newLevels.push({
    name: 'H-H-Z met sinusregel', targetRule: 'sinus',
    scenario: `Hoek β = ${angle2b}°, zijde b = ${side2} (overstaand), hoek γ = ${angle2c}°`,
    given: [
      { label: 'Hoek β', val: `${angle2b}°`, type: 'hoek' },
      { label: 'Zijde b (overstaand)', val: `${side2}`, type: 'zijde' },
      { label: `Hoek γ`, val: `${angle2c}°`, type: 'hoek' }
    ],
    question: `Bereken zijde c (overstaand aan γ) via de sinusregel. Rond af op 1 decimaal.`,
    formula: `c = ${side2} · sin(${angle2c}°) / sin(${angle2b}°)`,
    correctAnswer: Math.round(sideTarget * 10) / 10,
    tolerance: 0.15,
    hints: [
      'Sinusregel: a/sin(α) = b/sin(β) = c/sin(γ). Je hebt b, β, en γ → c = b·sin(γ)/sin(β)',
      `c = ${side2} · sin(${angle2c}°) / sin(${angle2b}°). Bereken eerst de sinussen.`,
      'Methode: 1) Bereken sin(γ) en sin(β). 2) Vermenigvuldig b met sin(γ). 3) Deel door sin(β). De laatste stap... (vul zelf in: rond af op 1 decimaal).'
    ]
  })

  // Level 3: Z-Z-H met sinusregel (mogelijk dubbelzinnig geval!)
  // Use known: sides around an angle (the ambiguous case)
  // SSA: given b, c, and angle β (not included). Could have 0, 1, or 2 solutions
  const c3 = 10; const b3_choices = [6, 12, 18]
  const b3 = b3_choices[Math.floor(Math.random()*b3_choices.length)]
  const beta3 = 30
  const beta3Rad = beta3 * Math.PI / 180
  const h3 = c3 * Math.sin(beta3Rad) // height = c*sin(beta)
  // Here b3, c3, beta3 given. Find gamma.
  // sin(gamma) = c3 * sin(beta3) / b3
  const sinGamma3 = c3 * Math.sin(beta3Rad) / b3
  let gammaPossible, gammaText, check
  let isAmbiguous = false
  if (sinGamma3 > 1) { gammaPossible = []; gammaText = 'geen (b te klein)' }
  else if (sinGamma3 < 1 && b3 < c3 && sinGamma3 < 1) {
    isAmbiguous = true
    const gamma1 = Math.asin(sinGamma3) * 180 / Math.PI
    const gamma2 = 180 - gamma1
    gammaPossible = [gamma1, gamma2]
    gammaText = `twee mogelijkheden: ${gamma1.toFixed(1)}° of ${gamma2.toFixed(1)}°`
    check = (ans) => Math.abs(parseFloat(ans)-Math.min(...gammaPossible)) < 1.5 || Math.abs(parseFloat(ans)-Math.max(...gammaPossible)) < 1.5
  } else {
    const gamma = Math.asin(sinGamma3) * 180 / Math.PI
    gammaPossible = [gamma]
    gammaText = `${gamma.toFixed(1)}°`
    check = (ans) => Math.abs(parseFloat(ans)-gamma) < 1.5
  }
  newLevels.push({
    name: `Z-Z-H: ${isAmbiguous ? 'Dubbelzinnig geval!' : 'Eenduidig'}`, targetRule: 'sinus',
    scenario: `Zijde b = ${b3}, zijde c = ${c3}, hoek β = ${beta3}° (niet ingesloten)`,
    given: [
      { label: 'Zijde b', val: `${b3}`, type: 'zijde' },
      { label: 'Zijde c', val: `${c3}`, type: 'zijde' },
      { label: 'Hoek β', val: `${beta3}°`, type: 'hoek' }
    ],
    question: `Bereken hoek γ via de sinusregel. Let op: dit is Z-Z-H (SSA). Wat is γ?`,
    formula: `sin(γ) = ${c3} · sin(${beta3}°) / ${b3} = ${sinGamma3.toFixed(4)}`,
    correctAnswer: gammaPossible.length > 0 ? gammaPossible[0] : -1,
    gammaPossible, isAmbiguous, gammaText,
    validate: isAmbiguous ? check : (ans) => {
      const g = parseFloat(ans)
      return gammaPossible.length > 0 && Math.abs(g - gammaPossible[0]) < 1.5
    },
    tolerance: 0.2,
    hints: [
      'Sinusregel: b/sin(β) = c/sin(γ) → sin(γ) = c·sin(β)/b',
      `sin(γ) = ${c3} · sin(${beta3}°) / ${b3} = ${sinGamma3.toFixed(4)}. Hoeveel hoeken hebben deze sinus?`,
      'Methode: 1) Bereken sin(γ). 2) Als sin(γ) < 1, zijn er TWEE mogelijke hoeken: γ₁ = arcsin(...) en γ₂ = 180° - γ₁. Beide kunnen correct zijn. De laatste stap... (vul zelf in: controleer welke passen bij de gegeven zijden).'
    ]
  })
  levels.value = newLevels
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const userAnswer = ref('')
const ambiguousAnswer2 = ref('')
const showAmbiguousInput = ref(false)

function checkAnswer() {
  isChecked.value = true
  const level = currentLevel.value
  const answer = parseFloat(userAnswer.value)

  if (level.isAmbiguous) {
    // Student must identify ambiguous case first
    if (!identifiedAmbiguousCase.value) {
      if (answer > 0 && answer <= 180) {
        const g1 = level.gammaPossible[0]
        const g2 = level.gammaPossible[1]
        if (Math.abs(answer - g1) < 1.5 || Math.abs(answer - g2) < 1.5) {
          identifiedAmbiguousCase.value = true
          showAmbiguousInput.value = true
          feedback.value = { type: 'info', text: `Correct! γ = ${answer.toFixed(1)}° is een oplossing. Maar er is nog een tweede mogelijkheid. Vul de andere hoek in.` }
          return
        }
      }
      attemptCount.value++
    } else {
      // Check second answer
      const a1 = parseFloat(userAnswer.value), a2 = parseFloat(ambiguousAnswer2.value)
      const valid1 = Math.abs(a1 - level.gammaPossible[0]) < 1.5 || Math.abs(a1 - level.gammaPossible[1]) < 1.5
      const valid2 = Math.abs(a2 - level.gammaPossible[0]) < 1.5 || Math.abs(a2 - level.gammaPossible[1]) < 1.5
      if (valid1 && valid2 && a1 !== a2) {
        isCorrect.value = true
        showWhySection.value = true; showErrorAnalysis.value = true; showReflection.value = true
        feedback.value = { type: 'success', text: `Uitstekend! γ kan zowel ${a1.toFixed(1)}° als ${a2.toFixed(1)}° zijn. Dit is het dubbelzinnige geval van de sinusregel!` }
      } else if (a1 === a2) {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'De twee hoeken moeten verschillend zijn. Onthoud: γ₂ = 180° - γ₁.' }
      } else {
        attemptCount.value++
        feedback.value = { type: 'error', text: `Eén van de hoeken klopt niet. De twee mogelijke hoeken zijn ${level.gammaPossible[0].toFixed(1)}° en ${level.gammaPossible[1].toFixed(1)}°.` }
      }
      return
    }
  }

  // Standard check (levels 1-2, or level 3 if not ambiguous)
  let correct = false
  if (level.validate) {
    if (level.isAmbiguous) correct = level.validate(answer)
    else correct = level.validate(answer)
  } else {
    correct = Math.abs(answer - level.correctAnswer) <= level.tolerance
  }

  if (correct) {
    isCorrect.value = true
    showWhySection.value = true; showErrorAnalysis.value = true; showReflection.value = true
    feedback.value = { type: 'success', text: `Prima! Het antwoord is ${answer.toFixed(1)}.` }
  } else {
    attemptCount.value++
    isCorrect.value = false
    // Error analysis: detect common sine/cosine rule errors
    const level = currentLevelData.value
    const hints = level.hints
    const idx = Math.min(attemptCount.value - 1, hints.length - 1)
    // Check for confusing sine with cosine rule
    if (Math.abs(answer) > 0 && level.angleMode === 'sine') {
      const cosineCheck = Math.sqrt(level.sideA**2 + level.sideB**2 - 2*level.sideA*level.sideB*Math.cos(level.angleC * Math.PI / 180))
      if (Math.abs(answer - cosineCheck) < 0.5) {
        feedback.value = { type: 'error', text: `Let op! Je hebt de cosinusregel gebruikt in plaats van de sinusregel. De sinusregel gebruik je wanneer je een zijde en de overstaande hoek kent of zoekt. De cosinusregel is voor zijde-hoek-zijde situaties. ${hints[idx]}` }
        return
      }
    }
    // Check for confusing degrees vs radians
    const radAns = level.correctAnswer * 180 / Math.PI
    if (Math.abs(answer - radAns) < 0.5 && Math.abs(answer - level.correctAnswer) > 0.5) {
      feedback.value = { type: 'error', text: `Let op! Je hebt met radialen gerekend in plaats van graden. De sinusregel werkt met graden (0°-180°). Zet je rekenmachine in DEG (degrees) modus. ${hints[idx]}` }
      return
    }
    // Check if they forgot the ambiguous case
    if (level.isAmbiguous && answer > 90 && answer < 180 && level.correctAnswer < 90) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de stompe hoek gekozen, maar voor dit SSA-geval is de scherpe hoek de juiste oplossing. Bij de sinusregel met SSA (zijde-zijde-hoek) kunnen er 0, 1 of 2 oplossingen zijn — dit noemen we het "ambigue geval". De sinus van een stompe hoek is gelijk aan de sinus van de supplementaire scherpe hoek: sin(${Math.round(180 - answer)}) = sin(${Math.round(answer)}). Controleer of de som van de hoeken 180° niet overschrijdt.` }
      return
    }
    feedback.value = { type: 'error', text: hints[idx] }
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Voer je berekening in en klik op Controleer.'}
  attemptCount.value=0; userAnswer.value=''; ambiguousAnswer2.value=''
  identifiedAmbiguousCase.value=false; showAmbiguousInput.value=false
  showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false; generateLevel()
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    if (!showReflection.value) { showReflection.value=true; return }
    if (!reflectionDone.value) { reflectionDone.value=true; return }
    if (currentInternalLevel.value===totalInternalLevels-2&&!showLPDEvidence.value) { showLPDEvidence.value=true; return }
    if (showLPDEvidence.value&&!lpdDone.value) { lpdDone.value=true; return }
    currentInternalLevel.value++; resetActivityState()
    showWorkedExample.value=currentInternalLevel.value===0
    nextTick(()=>mainArea.value?.focus())
  } else {
    if (!showLPDEvidence.value) { showLPDEvidence.value=true; return }
    if (!lpdDone.value) { lpdDone.value=true; return }
    if (props.currentStep<props.totalSteps) emit('update:currentStep',props.currentStep+1); else emit('complete')
  }
}

watch(()=>props.isOpen,(val)=>{
  if (val) {
    currentInternalLevel.value=0; resetActivityState()
    showWorkedExample.value=true; showPredictionGate.value=false
    predictionMade.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
    nextTick(()=>mainArea.value?.focus())
    window.addEventListener('keydown',handleKeydown)
  } else { window.removeEventListener('keydown',handleKeydown); shouldPulse.value=false }
},{immediate:true})
function handleKeydown(e){if(e.key==='Escape'&&props.isOpen)emit('close')}
onMounted(()=>{})
onUnmounted(()=>{window.removeEventListener('keydown',handleKeydown)})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
  <div class="relative flex w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

    <div v-if="showWorkedExample" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: sinus- en cosinusregel</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Wanneer gebruik je welke regel?</p>
          <div class="space-y-4 text-slate-700">
            <div class="p-3 bg-white rounded-lg border border-amber-100">
              <p class="font-bold text-blue-700">Cosinusregel (Z-H-Z of Z-Z-Z):</p>
              <p class="mt-1 font-mono">a² = b² + c² - 2bc·cos(α)</p>
              <p class="mt-1 text-sm">Gebruik bij: 2 zijden + ingesloten hoek (Z-H-Z) of 3 zijden (Z-Z-Z).</p>
            </div>
            <div class="p-3 bg-white rounded-lg border border-amber-100">
              <p class="font-bold text-emerald-700">Sinusregel (H-H-Z of Z-H-H):</p>
              <p class="mt-1 font-mono">a/sin(α) = b/sin(β) = c/sin(γ)</p>
              <p class="mt-1 text-sm">Gebruik bij: overstaand paar (zijde+hoek) + nog een hoek of zijde.</p>
              <p class="mt-1 text-sm text-red-600"><strong>Let op!</strong> Bij Z-Z-H (SSA) kan het dubbelzinnige geval optreden: 0, 1 of 2 oplossingen!</p>
            </div>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: b=8, c=6, α=60° (Z-H-Z)</p>
            <p class="text-slate-600 font-mono">a² = 8² + 6² - 2·8·6·cos(60°)</p>
            <p class="text-slate-600 font-mono">a² = 64 + 36 - 96·0,5 = 100 - 48 = 52</p>
            <p class="text-slate-600 font-mono">a = √52 ≈ 7,2</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het, start de oefening</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Welke regel gebruik je?</h3>
        <p class="text-slate-600 mb-6">Je krijgt een driehoek met zijden b=8, c=6 en ingesloten hoek α=60°. Welke regel gebruik je om a te berekenen?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('cosinus')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Cosinusregel (Z-H-Z)</button>
          <button @click="handlePrediction('sinus')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Sinusregel (H-H-Z)</button>
          <button @click="handlePrediction('pythagoras')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Stelling van Pythagoras</button>
        </div>
      </div>
    </div>

    <template v-if="!showWorkedExample&&!(showPredictionGate&&!predictionMade)">
      <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><div class="flex items-center gap-2"><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel+1 }} van {{ totalInternalLevels }}</p><div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i<=currentInternalLevel+1?'bg-amber-500':'bg-slate-200'"></div></div></div></div>
          <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"><PhX class="w-6 h-6" /></button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl mb-4"><p class="font-bold text-amber-800 text-sm">{{ currentLevel.name }}</p></div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4"><p class="font-mono text-sm font-bold text-slate-700">{{ currentLevel.scenario }}</p></div>
            <p class="font-bold text-slate-700 mb-4">{{ currentLevel.question }}</p>

            <div class="bg-white p-4 rounded-xl border border-slate-200 font-mono text-sm mb-4"><p class="text-slate-600">{{ currentLevel.formula }}</p></div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div><label class="block mb-2 text-sm font-bold text-slate-700">Jouw antwoord:</label>
                <div class="flex items-center gap-2">
                  <input type="number" step="any" v-model="userAnswer" @keyup.enter="checkAnswer" class="flex-1 p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="Bv. 7,2" />
                </div>
              </div>
              <div v-if="showAmbiguousInput && currentLevel.isAmbiguous">
                <label class="block mb-2 text-sm font-bold text-indigo-700">Tweede mogelijke hoek γ₂:</label>
                <input type="number" step="any" v-model="ambiguousAnswer2" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-indigo-300 rounded-lg outline-none focus:border-indigo-500 transition-colors" placeholder="Bv. 149,0" />
              </div>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">De sinus- en cosinusregel zijn afgeleid uit de eigenschappen van willekeurige (niet-rechthoekige) driehoeken. De cosinusregel is een veralgemening van Pythagoras: als de hoek 90° is, valt de term -2bc·cos(α) weg en krijg je a² = b² + c². De sinusregel volgt uit de hoogtelijnen van een driehoek.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Dubbelzinnig geval (SSA):</strong> Bij Z-Z-H kan de sinusregel 0, 1 of 2 oplossingen geven. Controleer altijd of sin(hoek) &le; 1 en of beide hoeken < 180° passen.</li>
                <li><strong>Verkeerde regel:</strong> Cosinusregel heeft een ingesloten hoek nodig. Sinusregel heeft een overstaand paar nodig. Kies de verkeerde en je hebt 2 onbekenden.</li>
                <li><strong>Rekenfouten:</strong> Vergeet de volgorde niet: eerst bc·cos(α), dan vermenigvuldigen met 2, dan aftrekken van (b²+c²).</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> kan de sinusregel bij Z-Z-H twee oplossingen geven terwijl de cosinusregel bij Z-H-Z altijd een uniek antwoord geeft?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht, ga verder</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 17: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je sinus- en cosinusregel kan toepassen. Leg uit: "Ik gebruik de _____ regel als ik twee zijden en de ingesloten hoek ken. Ik gebruik de _____ regel als ik een overstaand paar (zijde+hoek) en nog een waarde ken."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="!userAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white p-8 rounded-xl shadow-md border-2 border-slate-200 text-center max-w-md">
              <h4 class="font-bold text-slate-500 mb-4 uppercase tracking-wider text-xs">Wanneer gebruik ik welke regel?</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p class="font-bold text-blue-700 mb-2">Cosinusregel</p>
                  <p class="text-blue-600 text-xs">a² = b² + c² - 2bc·cos(α)</p>
                  <div class="mt-2 text-xs text-blue-600"><span class="font-bold">Z-H-Z</span> of <span class="font-bold">Z-Z-Z</span></div>
                </div>
                <div class="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p class="font-bold text-emerald-700 mb-2">Sinusregel</p>
                  <p class="text-emerald-600 text-xs">a/sin(α) = b/sin(β)</p>
                  <div class="mt-2 text-xs text-emerald-600"><span class="font-bold">H-H-Z</span> of <span class="font-bold">Z-H-H</span></div>
                </div>
              </div>
              <div class="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p class="text-xs font-bold text-amber-700">Dubbelzinnig geval (SSA / Z-Z-H)</p>
                <p class="text-xs text-amber-600 mt-1">Bij Z-Z-H kan sin(γ) = c·sin(β)/b &gt; 1 (geen opl), = 1 (1 opl), of &lt; 1 (2 opl: γ₁ en 180°-γ₁).</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
  <SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</div>
</template>

<style scoped>
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right,#e2e8f0 1px,transparent 1px), linear-gradient(to bottom,#e2e8f0 1px,transparent 1px); background-size: 2rem 2rem; background-position: center center; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
</style>
