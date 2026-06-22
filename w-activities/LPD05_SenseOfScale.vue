<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise,
  PhBugBeetle, PhDrop, PhHouse, PhCar, PhPencilSimple, PhCoffee, PhPill, PhUser, PhHamburger, PhBathtub,
  PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Grootheden en Eenheden: Maatbesef' },
  instruction: {
    type: String,
    default: 'Wiskunde gaat over de realiteit. Koppel de juiste eenheid aan elk object door het stempel naar het object te slepen!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep voor elk object de juiste eenheid-stempel.' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedUnit = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const hintCount = ref(0)
const errorDetected = ref('')
const lpdConfirmed = ref(false)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const levelTemplates = [
  {
    stamps: ['mm', 'cm', 'm', 'km'],
    items: [
      { id: 'l1', name: 'Een huisvlieg', val: 8, correctUnit: 'mm', selectedUnit: null, icon: PhBugBeetle, color: 'text-slate-600', bg: 'bg-slate-100' },
      { id: 'l2', name: 'Een potlood', val: 15, correctUnit: 'cm', selectedUnit: null, icon: PhPencilSimple, color: 'text-orange-500', bg: 'bg-orange-50' },
      { id: 'l3', name: 'Een klaslokaal', val: 10, correctUnit: 'm', selectedUnit: null, icon: PhHouse, color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 'l4', name: 'Afstand tot de zee', val: 45, correctUnit: 'km', selectedUnit: null, icon: PhCar, color: 'text-emerald-500', bg: 'bg-emerald-50' }
    ]
  },
  {
    stamps: ['ml', 'cl', 'l', 'm³'],
    items: [
      { id: 'v1', name: 'Medicijnspuitje', val: 5, correctUnit: 'ml', selectedUnit: null, icon: PhDrop, color: 'text-red-500', bg: 'bg-red-50' },
      { id: 'v2', name: 'Kopje koffie', val: 25, correctUnit: 'cl', selectedUnit: null, icon: PhCoffee, color: 'text-amber-700', bg: 'bg-amber-100' },
      { id: 'v3', name: 'Fles water', val: 1.5, correctUnit: 'l', selectedUnit: null, icon: PhDrop, color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 'v4', name: 'Zwembad', val: 50, correctUnit: 'm³', selectedUnit: null, icon: PhBathtub, color: 'text-cyan-500', bg: 'bg-cyan-50' }
    ]
  },
  {
    stamps: ['mg', 'g', 'kg', 'ton'],
    items: [
      { id: 'm1', name: 'Medicijnpil', val: 500, correctUnit: 'mg', selectedUnit: null, icon: PhPill, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
      { id: 'm2', name: 'Hamburger', val: 200, correctUnit: 'g', selectedUnit: null, icon: PhHamburger, color: 'text-amber-500', bg: 'bg-amber-50' },
      { id: 'm3', name: 'Volwassen man', val: 80, correctUnit: 'kg', selectedUnit: null, icon: PhUser, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { id: 'm4', name: 'Vrachtwagen', val: 2.5, correctUnit: 'ton', selectedUnit: null, icon: PhCar, color: 'text-slate-700', bg: 'bg-slate-200' }
    ]
  }
]

function generateLevel() {
  return levelTemplates.map((tmpl, i) => ({
    goalText: i === 0 ? 'Opdracht 1: Lengtematen' : i === 1 ? 'Opdracht 2: Inhoudsmaten' : 'Opdracht 3: Massamaten (Gewicht)',
    stamps: shuffle(tmpl.stamps),
    items: shuffle(tmpl.items.map(item => ({
      ...item,
      selectedUnit: null
    })))
  }))
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const currentItems = ref([])
const currentStamps = computed(() => currentLevelData.value?.stamps || [])
const currentGoal = computed(() => currentLevelData.value?.goalText || '')

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    object: 'Kredietkaart',
    size: '8.5 cm × 5.4 cm',
    correct: 'cm',
    steps: [
      'Een kredietkaart past in je portemonnee, dus mm is te klein, m is te groot.',
      'Centimeter (cm) is de standaard kleine lengtemaat voor voorwerpen op tafel.',
      'Antwoord: cm'
    ]
  },
  {
    object: 'Theelepel',
    size: '5 ml',
    correct: 'ml',
    steps: [
      'Een theelepel bevat maar een klein beetje vloeistof.',
      'Milliliter (ml) is de kleinste inhoudsmaat, geschikt voor kleine hoeveelheden.',
      'Antwoord: ml'
    ]
  },
  {
    object: 'Brief',
    size: '20 g',
    correct: 'g',
    steps: [
      'Een standaard brief weegt ongeveer 20 gram.',
      'Gram (g) is de juiste maat voor lichte voorwerpen zoals een brief.',
      'Antwoord: g'
    ]
  }
]

const workedExampleData = computed(() => workedExamples[currentInternalLevel.value])

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: welke eenheden zijn logisch voor deze objecten?' }
  }
}

// ========== PREDICTION GATE ==========
const predictionUnits = computed(() => {
  if (!currentLevelData.value) return []
  return currentLevelData.value.stamps
})

function checkPrediction() {
  if (!predictedUnit.value) return
  const stamps = currentLevelData.value.stamps
  const smallest = stamps[0]
  if (predictedUnit.value === smallest) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Goed! Je voorspelt dat de kleinste eenheid past bij het kleinste object. Laten we het testen!' }
  } else {
    attemptCount.value++
    const hints = [
      'Kijk naar de grootte-orde. Het kleinste object heeft de kleinste eenheid.',
      'Vergelijk de objecten: wat is het kleinste? Welke eenheid hoort daarbij?',
      'De eenheden zijn geordend van klein naar groot. Kies de kleinste.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    'Kijk naar de grootte van elk object. Kleine objecten hebben kleine eenheden, grote objecten grote eenheden.',
    'Vergelijk met voorbeelden uit het dagelijks leven: een vlieg is klein (mm), een auto-afstand is groot (km).',
    'Sleep de stempels en denk: "Is deze eenheid logisch voor dit object?" Voor het laatste foute object: probeer de eenheid die één stap groter/kleiner is.'
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
const commonErrors = [
  { expected: 'mm', wrong: 'cm', msg: 'Let op! 8 mm ≈ 1 cm, maar een vlieg is kleiner dan 1 cm. mm is de juiste maat.' },
  { expected: 'm', wrong: 'km', msg: 'Let op! 10 m is de lengte van een klaslokaal. km is voor afstanden tussen steden, dat is véél te groot!' },
  { expected: 'ml', wrong: 'cl', msg: 'Let op! 5 ml is een klein medicijnspuitje. cl (centiliter) is 10× groter — te groot voor een spuitje.' },
  { expected: 'm³', wrong: 'l', msg: 'Verwar niet! Een zwembad van 50 m³ is een groot zwembad. 50 liter is maar een paar emmers.' },
  { expected: 'mg', wrong: 'g', msg: 'Let op! 500 mg = 0,5 g. Een pil weegt een halve gram, niet 500 gram!' },
  { expected: 'ton', wrong: 'kg', msg: 'Verwar niet! 2,5 ton = 2500 kg. Een vrachtwagen is véél zwaarder dan 2,5 kg.' }
]

function getSpecificError(item) {
  if (!item) return ''
  const found = commonErrors.find(e => e.expected === item.correctUnit && e.wrong === item.selectedUnit)
  return found ? found.msg : ''
}

let draggedStamp = null

function onDragStart(stamp) { if(!isCorrect.value) draggedStamp = stamp }

function onDrop(item) {
    if (!isCorrect.value && draggedStamp !== null) {
        item.selectedUnit = draggedStamp
        draggedStamp = null
        isChecked.value = false
        autoValidate()
    }
}

function autoValidate() {
  const allFilled = currentItems.value.every(item => item.selectedUnit !== null)
  if (!allFilled) {
    const filledCount = currentItems.value.filter(item => item.selectedUnit !== null).length
    if (filledCount > 0) {
      feedback.value = { type: 'info', text: `Goed bezig! Nog ${currentItems.value.length - filledCount} object${currentItems.value.length - filledCount === 1 ? '' : 'en'} te gaan.` }
    }
    return
  }

  const allCorrect = currentItems.value.every(item => item.selectedUnit === item.correctUnit)

  if (allCorrect) {
    isCorrect.value = true
    isChecked.value = true
    hintCount.value = 0
    errorDetected.value = ''
    const whyTexts = [
      'Lengtematen zijn geordend van klein naar groot: mm, cm, m, km. Elke stap is 10× groter. Door objecten in de echte wereld te vergelijken, leer je welke eenheid bij welke grootte past — dit noemen we maatbesef.',
      'Inhoudsmaten volgen dezelfde logica: ml, cl, l, m³. Ook hier is elke stap 10×. Een druppel is ml, een zwembad is m³ — het verschil zit in de grootte-orde van het object.',
      'Massa (gewicht) gebruik je in mg, g, kg, ton. Een pil is mg, een vrachtwagen is ton. Dit leer je door te vergelijken met wat je kent uit de supermarkt, de apotheek of het verkeer.'
    ]
    showWhyExplanation(whyTexts[currentInternalLevel.value])
    feedback.value = {
      type: 'success',
      text: `Perfect! Alle stempels kloppen. ${currentInternalLevel.value === 0 ? 'LPD 5: Je toont maatbesef voor lengtematen.' : currentInternalLevel.value === 1 ? 'LPD 5: Je toont maatbesef voor inhoudsmaten.' : 'LPD 5: Je toont maatbesef voor massamaten.'}`
    }
  } else {
    attemptCount.value++
    isChecked.value = true

    const wrongItem = currentItems.value.find(item => item.selectedUnit !== item.correctUnit)
    const specificErr = getSpecificError(wrongItem)

    if (specificErr) {
      errorDetected.value = specificErr
    }

    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: `Niet helemaal... Kijk nog eens goed naar '${wrongItem.name}'. ${wrongItem.val} ${wrongItem.selectedUnit} is niet logisch.` }
    } else if (attemptCount.value >= 3) {
      // Reveal correct mapping
      const hints = currentItems.value
        .filter(item => item.selectedUnit !== item.correctUnit)
        .map(item => `'${item.name}': ${item.val} ${item.correctUnit}`)
      feedback.value = { type: 'error', text: `Probeer deze juiste combinaties: ${hints.join('; ')}` }
    } else {
      feedback.value = { type: 'error', text: `${specificErr ? specificErr + ' ' : ''}Kijk naar de grootte van '${wrongItem.name}' en probeer opnieuw.` }
    }
  }
}

function removeStamp(item) {
    if (!isCorrect.value) {
        item.selectedUnit = null
        isChecked.value = false
    }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

function resetActivityState() {
    levels.value = generateLevel()
    isCorrect.value = false
    celebrationDone.value = false
    isChecked.value = false
    feedback.value = { type: 'info', text: 'Sleep voor elk object de juiste eenheid-stempel.' }
    attemptCount.value = 0
    hintCount.value = 0
    errorDetected.value = ''
    showWhy.value = false
    whyText.value = ''
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionDone.value = false
    predictedUnit.value = null

    showWorkedExample.value = currentInternalLevel.value === 0
    showPrediction.value = currentInternalLevel.value >= 1

    if (currentLevelData.value) {
      currentItems.value = currentLevelData.value.items.map(item => ({ ...item, selectedUnit: null }))
    }
}

watch(currentLevelData, (val) => {
  if (val) {
    currentItems.value = val.items.map(item => ({ ...item, selectedUnit: null }))
  }
}, { immediate: true })

function handleNext() {
  // Show reflection after last level
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Denk na over wat je leerde over eenheden en maatbesef.' }
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

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasCompare = text.includes('vergelijk') || text.includes('grootte') || text.includes('passen')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.length > 20
  if (hasCompare && hasReason) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekend! Je begrijpt dat maatbesef draait om vergelijken met de echte wereld.<br/><br/><strong>LPD 5 bewezen:</strong> Je kent de juiste eenheden voor alledaagse objecten.' }
  } else {
    attemptCount.value++
    const hints = [
      'Hoe weet je of je mm of km moet gebruiken? Wat zegt de grootte van het object?',
      'Leg uit: "Bij een groot getal (bv. 45 km) gebruik ik een kleine eenheid voor..."',
      'Denk aan de logica: hoe verhoudt de eenheid zich tot de grootte van het object?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
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
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

            <!-- Worked Example (I do) — level 0 only -->
            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">Object: {{ workedExampleData.object }} ({{ workedExampleData.size }})</p>
              <div class="space-y-1.5 text-sm text-slate-700 mb-2">
                <div v-for="(step, si) in workedExampleData.steps" :key="si" class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                Juiste eenheid: {{ workedExampleData.correct }}
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- Prediction Gate (we do) — levels 1+ -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Welke eenheid past bij het <strong>kleinste</strong> object?</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="unit in predictionUnits" :key="unit"
                        @click="predictedUnit = unit"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-colors border-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedUnit === unit ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ unit }}
                </button>
              </div>
              <button v-if="predictedUnit" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- Stamps area — after prediction passed -->
            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-4">
                 <p class="font-bold text-amber-800 text-sm">{{ currentGoal }}</p>
               </div>
               <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest text-center">Stempels</label>
               <div class="flex flex-wrap justify-center gap-2">
                   <div v-for="stamp in currentStamps" :key="stamp"
                        draggable="true" @dragstart="onDragStart(stamp)"
                        class="px-4 py-2 border-2 border-slate-300 bg-white rounded-lg font-bold text-lg text-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-400 hover:text-amber-600 transition-colors shadow-sm"
                        :class="{'opacity-30 pointer-events-none': currentItems.some(i => i.selectedUnit === stamp) || isCorrect}">
                       {{ stamp }}
                   </div>
               </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <!-- Error analysis notice -->
            <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle class="w-5 h-5 text-red-600" weight="fill" />
                <span class="font-bold text-red-800 text-sm">Let op!</span>
              </div>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Waarom is het belangrijk om de juiste eenheid te kiezen? Hoe bepaal je of je mm, m of km moet gebruiken? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Ik kies de eenheid op basis van de grootte van het object..."></textarea>
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

              <button v-if="!isCorrect && !showWorkedExample && !showPrediction && !showReflection"
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

        <!-- RIGHT CONTENT PANEL -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-8 overflow-y-auto items-center justify-center relative pattern-grid">

              <div v-if="showWorkedExample" class="w-full max-w-3xl bg-white px-10 py-8 rounded-xl shadow-md border-2 border-indigo-200 flex items-center justify-center mb-6">
                <div class="text-center">
                  <p class="text-sm text-indigo-600 font-bold mb-2">VOORBEELD</p>
                  <p class="text-2xl font-bold text-slate-700">Object: {{ workedExampleData.object }}</p>
                  <p class="text-lg text-indigo-600 mt-2">Welke eenheid kies je?</p>
                </div>
              </div>

              <div class="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div v-for="item in currentItems" :key="item.id" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center animate-fadeIn transform transition-transform">

                      <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4" :class="item.bg">
                          <component :is="item.icon" weight="duotone" class="w-10 h-10" :class="item.color" />
                      </div>

                      <h3 class="font-bold text-slate-800 text-lg mb-1 text-center h-14 flex items-center">{{ item.name }}</h3>

                      <div class="mt-2 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full justify-center">
                          <span class="text-3xl font-black text-slate-700 tabular-nums">{{ item.val }}</span>

                          <div @dragover.prevent @drop="onDrop(item)"
                               class="w-20 h-12 border-2 border-dashed rounded-lg flex items-center justify-center relative transition-all"
                               :class="item.selectedUnit ? (isCorrect ? 'border-emerald-400 bg-emerald-50' : (isChecked && item.selectedUnit !== item.correctUnit ? 'border-red-400 bg-red-50' : 'border-slate-800 bg-slate-100')) : 'border-amber-300 bg-amber-50/50 hover:bg-amber-100'">

                               <span v-if="!item.selectedUnit" class="text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">Sleep<br>Hier</span>
                               <span v-else class="text-xl font-black" :class="isChecked && !isCorrect && item.selectedUnit !== item.correctUnit ? 'text-red-600' : 'text-slate-800'">{{ item.selectedUnit }}</span>

                               <button v-if="item.selectedUnit && !isCorrect" @click="removeStamp(item)" class="absolute -top-3 -right-3 bg-slate-200 rounded-full p-1 hover:bg-red-200 hover:text-red-700 border-2 border-white shadow-sm z-10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                                   <PhX weight="bold" class="w-3 h-3" />
                               </button>
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
