<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGraph, PhArrowClockwise, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: Dynamische Meetkunde' },
  instruction: {
    type: String,
    default: 'Sleep de blauwe hoekpunten om de driehoek aan te passen. Voldoe aan de opdracht!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhGraph }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Voorspel: wat is de eerste constructiestap voor deze opdracht?' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showHint = ref(false)

// --- Phase management ---
// 'predict' → 'explore' → 'answer' → 'why' → 'reflect' → 'done'
const phase = ref('predict')

// --- Worked example visible on first level ---
const showWorkedExample = ref(true)

// --- Level Logic ---
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel(index) {
  switch (index) {
    case 0: {
      const threshold = 90 + Math.floor(Math.random() * 5) + 1 // 91 to 96
      return {
        goalText: `Opdracht 1: Maak een stomphoekige driehoek.`,
        targetRule: (angles) => Math.max(...angles) > threshold,
        threshold,
        successMsg: `Uitstekend! Een hoek van > ${threshold}° maakt deze driehoek stomphoekig.`,
        whyText: `**Waarom:** Een stomphoekige driehoek heeft een hoek groter dan 90°. De andere twee hoeken moeten kleiner zijn, zodat de som 180° blijft. De grootste hoek bepaalt het type driehoek.`,
        reflectionQuestion: 'Waarom moet de som van de drie hoeken altijd 180° zijn? En waarom is een hoek > 90° onmogelijk als de som 180° is en de andere hoeken positief zijn?',
        hintLevels: [
          'Eén van de hoeken moet groter dan 90° zijn. Sleep een hoekpunt naar binnen, zodat een hoek stomp wordt.',
          `Kijk naar de hoekwaarden links. Je hebt een hoek nodig > ${threshold}°. Bij een stompe hoek is het hoekpunt "ingedrukt" — de andere twee hoeken worden dan scherp.`,
          `Sleep punt B naar links, zodat ∠B > ${threshold}°. De hoekwaarde toont __° als het lukt.`
        ],
        commonMistakeType: 'acute',
        mistakeMsg: 'Deze driehoek is scherphoekig — alle hoeken zijn kleiner dan 90°. Maak een hoekpunt zodanig dat een hoek groter wordt dan 90°.',
        predictionQuestion: 'Wat is de eerste stap om een stomphoekige driehoek te maken?',
        predictionOptions: [
          'Een hoekpunt naar binnen slepen zodat een hoek > 90° wordt',
          'Alle hoeken even groot maken',
          'Een rechte lijn maken'
        ],
        predictionCorrect: 0
      }
    }
    case 1: {
      const tolerance = Math.random() * 1 + 0.8 // 0.8 to 1.8
      return {
        goalText: 'Opdracht 2: Maak een rechthoekige driehoek.',
        targetRule: (angles) => angles.some(a => Math.abs(a - 90) < tolerance),
        tolerance,
        successMsg: `Perfect! Eén hoek is exact 90° (binnen ${tolerance.toFixed(1)}°). Dit is een rechthoekige driehoek.`,
        whyText: `**Waarom:** Een rechthoekige driehoek heeft een rechte hoek (90°). De twee andere hoeken zijn complementair — hun som is 90°. In de constructie gebruik je de hoekwaarden als feedback: blijf slepen tot een hoek 90° aangeeft.`,
        reflectionQuestion: 'Waarom is het moeilijker om exact 90° te maken dan een hoek > 90°? Welke eigenschap van de hoekmeting maakt dat verschil?',
        hintLevels: [
          'Eén hoek moet exact (of heel dichtbij) 90° zijn. Sleep een hoekpunt tot de hoekwaarde 90° aangeeft.',
          `Kijk naar de hoekwaarden. Je hebt een hoek nodig binnen ${tolerance.toFixed(1)}° van 90°. De rechte hoek voelt "vierkant" — de twee zijden staan loodrecht op elkaar.`,
          `Sleep punt C zodat ∠C = 90°. Gebruik de hoekwaarde als gids: streef naar __°.`
        ],
        commonMistakeType: 'obtuse',
        mistakeMsg: 'Deze hoek is te groot (> 95°). Je hebt een stompe hoek, geen rechte. Maak de hoek kleiner tot hij dicht bij 90° is.',
        predictionQuestion: 'Hoe herken je dat een hoek exact 90° is in de tekening?',
        predictionOptions: [
          'De twee zijden staan loodrecht op elkaar (rechte hoek, vierkant gevoel)',
          'De hoek is groter dan 100°',
          'De hoek is kleiner dan 80°'
        ],
        predictionCorrect: 0
      }
    }
    case 2: {
      const maxAngle = 90 - Math.floor(Math.random() * 3) - 1 // 86 to 89
      return {
        goalText: 'Opdracht 3: Maak een scherphoekige driehoek.',
        targetRule: (angles) => Math.max(...angles) < maxAngle,
        maxAngle,
        successMsg: `Goed zo! ALLE hoeken zijn kleiner dan ${maxAngle}°. Dit is een scherphoekige driehoek.`,
        whyText: `**Waarom:** Een scherphoekige driehoek heeft alle hoeken < 90°. Het is de "normale" driehoek — denk aan een gelijkzijdige driehoek (60°-60°-60°) of een willekeurige spitse driehoek. Dit type komt het vaakst voor in de natuur.`,
        reflectionQuestion: 'Waarom kan een driehoek niet twee stompe hoeken (> 90°) hebben? Wat zegt de hoekensom (180°) daarover?',
        hintLevels: [
          'ALLE drie de hoeken moeten kleiner dan 90° zijn. Zorg dat geen enkele hoek te groot wordt.',
          `De maximumhoek moet kleiner dan ${maxAngle}° zijn. Kijk naar de grootste hoek — die is nu te groot. Maak die hoek kleiner.`,
          `De grootste hoek is nu __°. Verklein die tot onder ${maxAngle}° door een hoekpunt te verplaatsen.`
        ],
        commonMistakeType: 'right',
        mistakeMsg: 'Deze driehoek heeft een hoek van ongeveer 90° — dat is een rechthoekige, geen scherphoekige. Alle hoeken moeten KLEINER dan 90° zijn.',
        predictionQuestion: 'Wat betekent "scherphoekig" voor alle hoeken van de driehoek?',
        predictionOptions: [
          'Alle hoeken zijn kleiner dan 90°',
          'Minstens een hoek is kleiner dan 90°',
          'Alle hoeken zijn groter dan 90°'
        ],
        predictionCorrect: 0
      }
    }
    default:
      return { goalText: 'Maak een stomphoekige driehoek.', targetRule: (angles) => Math.max(...angles) > 90.5, hintLevels: ['', '', ''], predictionQuestion: '', predictionOptions: [], predictionCorrect: 0 }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// --- Prediction ---
const prediction = ref('')
const predictionSubmitted = ref(false)

function submitPrediction() {
  if (!prediction.value) return
  predictionSubmitted.value = true
  phase.value = 'explore'
  feedback.value = { type: 'info', text: 'Goed! Sleep nu de hoekpunten om de constructie te maken.' }
}

// --- Domain Logic: Dynamic Geometry ---
const svgWidth = 600
const svgHeight = 400

const pA = ref({ x: 200, y: 300 })
const pB = ref({ x: 400, y: 300 })
const pC = ref({ x: 300, y: 100 })

const draggingPoint = ref(null)

function startDrag(pointName) {
  draggingPoint.value = pointName
  isChecked.value = false
  isCorrect.value = false
}
function endDrag() {
  if (!draggingPoint.value) return
  draggingPoint.value = null
  // Auto-check
  const angles = [angleA.value, angleB.value, angleC.value]
  const passed = currentLevelData.value.targetRule(angles)
  if (passed) {
    isCorrect.value = true
    isChecked.value = true
    attemptCount.value = 0
    phase.value = 'answer'
    feedback.value = {
      type: 'success',
      text: `${currentLevelData.value.successMsg} Hoeken: ∠A=${angleA.value.toFixed(1)}°, ∠B=${angleB.value.toFixed(1)}°, ∠C=${angleC.value.toFixed(1)}°. Som = ${angleSum.value}°.`
    }
  } else {
    attemptCount.value++
    hintCount.value = 0
    showHint.value = false
    const maxA = Math.max(angleA.value, angleB.value, angleC.value)
    const minA = Math.min(angleA.value, angleB.value, angleC.value)

    // Error analysis
    const isRight = angleA.value > 85 && angleA.value < 95 ||
                    angleB.value > 85 && angleB.value < 95 ||
                    angleC.value > 85 && angleC.value < 95
    const isObtuse = maxA > 95

    if (currentInternalLevel.value === 0 && !isObtuse) {
      // Level 0 but no obtuse angle
      if (isRight) {
        feedback.value = { type: 'error', text: 'Dit is een rechthoekige driehoek (90°), geen stomphoekige. Maak de hoek groter dan 90° door een punt naar binnen te slepen.' }
      } else {
        feedback.value = { type: 'error', text: `Alle hoeken zijn kleiner dan 90°. Sleep een hoekpunt naar binnen zodat een hoek > ${currentLevelData.value.threshold}° wordt. Max is nu ${maxA.toFixed(1)}°.` }
      }
    } else if (currentInternalLevel.value === 1 && !isRight) {
      if (isObtuse) {
        feedback.value = { type: 'error', text: 'Deze hoek is stomp (> 95°). Je moet hem verkleinen tot hij dicht bij 90° is. Sleep het hoekpunt voorzichtig.' }
      } else {
        feedback.value = { type: 'error', text: `Geen hoek is dicht bij 90°. Je hebt een hoek nodig binnen ${currentLevelData.value.tolerance.toFixed(1)}° van 90°. Max is ${maxA.toFixed(1)}°.` }
      }
    } else if (currentInternalLevel.value === 2 && maxA >= currentLevelData.value.maxAngle) {
      if (isRight) {
        feedback.value = { type: 'error', text: 'Deze hoek is 90° — dat is een rechte hoek. Voor een scherphoekige driehoek moeten ALLE hoeken kleiner dan 90° zijn.' }
      } else if (isObtuse) {
        feedback.value = { type: 'error', text: 'De grootste hoek is stomp (> 90°). Maak alle hoeken kleiner dan 90° door de punten te verplaatsen.' }
      } else {
        feedback.value = { type: 'error', text: `De grootste hoek is ${maxA.toFixed(1)}°, maar moet kleiner dan ${currentLevelData.value.maxAngle}° zijn. Verklein de grootste hoek.` }
      }
    } else {
      const hints = currentLevelData.value.hintLevels
      const hintText = hints.length > 0 ? hints[Math.min(attemptCount.value - 1, 2)] : ''
      feedback.value = { type: 'error', text: `Niet de gevraagde driehoek. ${hintText}` }
    }
  }
}

function onDrag(e) {
  if (!draggingPoint.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = Math.max(20, Math.min(svgWidth - 20, e.clientX - rect.left))
  const y = Math.max(20, Math.min(svgHeight - 20, e.clientY - rect.top))
  if (draggingPoint.value === 'A') pA.value = { x, y }
  if (draggingPoint.value === 'B') pB.value = { x, y }
  if (draggingPoint.value === 'C') pC.value = { x, y }
}

// Math logic
function calculateAngle(p1, p2, p3) {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  if (mag1 === 0 || mag2 === 0) return 0
  let cosTheta = dot / (mag1 * mag2)
  cosTheta = Math.max(-1, Math.min(1, cosTheta))
  return Math.acos(cosTheta) * (180 / Math.PI)
}

const angleA = computed(() => calculateAngle(pB.value, pA.value, pC.value))
const angleB = computed(() => calculateAngle(pA.value, pB.value, pC.value))
const angleC = computed(() => calculateAngle(pA.value, pC.value, pB.value))
const angleSum = computed(() => Math.round(angleA.value + angleB.value + angleC.value))

// phase: answer -> show success then proceed to why
function goToWhy() {
  phase.value = 'why'
  if (currentLevelData.value?.whyText) {
    feedback.value = { type: 'info', text: currentLevelData.value.whyText }
  }
}

// Show hint
function showHintFn() {
  if (hintCount.value < 3) {
    hintCount.value++
    showHint.value = true
    const data = currentLevelData.value
    if (data && data.hintLevels) {
      const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
      if (idx >= 0) {
        feedback.value = { type: 'info', text: data.hintLevels[idx] }
      }
    }
  }
}

// Reflection
const reflectionAnswer = ref('')
const reflectionDone = ref(false)

function submitReflection() {
  if (!reflectionAnswer.value || reflectionAnswer.value.length < 5) {
    feedback.value = { type: 'error', text: 'Schrijf een volledige zin om verder te gaan.' }
    return
  }
  reflectionDone.value = true
  phase.value = 'done'
  feedback.value = { type: 'success', text: 'Mooie reflectie! Dit helpt je begrijpen waarom wiskundige constructies op deze manier werken.' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  showHint.value = false
  prediction.value = ''
  predictionSubmitted.value = false
  phase.value = 'predict'
  reflectionAnswer.value = ''
  reflectionDone.value = false
  feedback.value = { type: 'info', text: 'Voorspel: wat is de eerste constructiestap voor deze opdracht?' }

  // Reset to a generic shape
  if (currentInternalLevel.value === 0) {
    pA.value = { x: 200, y: 300 }; pB.value = { x: 400, y: 300 }; pC.value = { x: 300, y: 100 }
  } else if (currentInternalLevel.value === 1) {
    pA.value = { x: 250, y: 300 }; pB.value = { x: 350, y: 300 }; pC.value = { x: 100, y: 250 }
  } else {
    pA.value = { x: 200, y: 300 }; pB.value = { x: 400, y: 300 }; pC.value = { x: 200, y: 100 }
  }

  levels.value = [
    generateLevel(0),
    generateLevel(1),
    generateLevel(2)
  ]
}

function handleNext() {
  reflectionDone.value = false
  reflectionAnswer.value = ''
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++
    resetActivityState()
    showWorkedExample.value = true
    setTimeout(() => { showWorkedExample.value = false }, 500)
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// --- Lifecycle ---
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ]
    resetActivityState()
    showWorkedExample.value = true
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 text-slate-800"
     @mouseup="endDrag" @mouseleave="endDrag">
    <div class="absolute inset-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')"
         aria-label="Sluiten"></div>
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
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData?.goalText }}</p>
            </div>

            <!-- Worked Example (level 0 only) -->
            <div v-if="showWorkedExample && currentInternalLevel === 0 && phase === 'predict'" class="p-4 mb-4 border border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <p class="text-sm font-bold text-amber-700 mb-2">Voorbeeld: Gelijkzijdige Driehoek</p>
              <p class="text-xs text-slate-600 leading-relaxed">
                Om een gelijkzijdige driehoek te maken:<br/>
                1. Teken een basislijn AB.<br/>
                2. Teken een cirkel met middelpunt A en straal AB.<br/>
                3. Teken een cirkel met middelpunt B en straal AB.<br/>
                4. Het snijpunt van beide cirkels is C — op gelijke afstand van A en B.<br/><br/>
                <strong>Waarom cirkels?</strong> Een cirkel heeft een vaste straal — alle punten op de cirkel zijn even ver van het middelpunt. Zo weet je zeker dat AC = AB = BC.
              </p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <label class="text-sm font-bold text-slate-700">Voorspel eerst:</label>
              </div>
              <p class="text-xs text-slate-500 mb-4">{{ currentLevelData?.predictionQuestion }}</p>
              <div class="flex flex-col gap-2">
                <button v-for="(opt, idx) in (currentLevelData?.predictionOptions || [])" :key="idx"
                  @click="prediction = String(idx)"
                  class="p-3 border-2 rounded-lg font-medium transition-all text-sm text-left active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  :class="prediction === String(idx) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-amber-300 bg-white text-slate-600'">
                  {{ opt }}
                </button>
              </div>
              <div v-if="prediction && predictionSubmitted" class="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p class="text-xs font-medium text-amber-700" :class="prediction === String(currentLevelData?.predictionCorrect) ? '' : 'line-through text-red-500'">
                  <template v-if="prediction !== String(currentLevelData?.predictionCorrect)">
                    Niet helemaal. Juiste antwoord: {{ currentLevelData?.predictionOptions[currentLevelData?.predictionCorrect] }}
                  </template>
                  <template v-else>Juist!</template>
                </p>
              </div>
              <button v-if="prediction && !predictionSubmitted" @click="submitPrediction"
                      class="w-full mt-4 py-3 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig Voorspelling
              </button>
            </div>

            <!-- Answer Phase (after drag success) -->
            <div v-if="phase === 'answer'" class="p-4 mt-4 border border-amber-200 bg-amber-50 rounded-xl shadow-sm animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhCheckCircle weight="fill" class="w-5 h-5 text-amber-600" />
                <p class="text-sm font-bold text-amber-700">Constructie Gelukt!</p>
              </div>
              <ul class="space-y-1 text-xs text-slate-600">
                <li>∠A: {{ angleA.toFixed(1) }}°</li>
                <li>∠B: {{ angleB.toFixed(1) }}°</li>
                <li>∠C: {{ angleC.toFixed(1) }}°</li>
                <li class="font-bold text-slate-700 pt-1 border-t border-amber-200">Som: {{ angleSum }}°</li>
              </ul>
            </div>

            <!-- Why Phase -->
            <div v-if="phase === 'why'" class="p-4 mt-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <p class="text-sm font-bold text-amber-700 mb-2">Waarom is dit juist?</p>
              <MathText :content="currentLevelData?.whyText || ''" class="text-xs text-slate-700 leading-relaxed" />
            </div>

            <!-- Reflection Phase -->
            <div v-if="phase === 'reflect'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <label class="text-sm font-bold text-slate-700">Reflectievraag</label>
              </div>
              <p class="text-xs text-slate-600 mb-3">{{ currentLevelData?.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:ring-amber-500 focus:border-amber-500 resize-none"
                        rows="3" placeholder="Schrijf je antwoord..."></textarea>
              <button v-if="!reflectionDone" @click="submitReflection"
                      class="w-full mt-3 py-3 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig Reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM BAR -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowRight class="w-5 h-5 rotate-180" />
              </button>

              <!-- Hint button (explore phase) -->
              <button v-if="phase === 'explore' && hintCount < 3"
                      @click="showHintFn"
                      class="flex items-center justify-center gap-2 px-4 py-4 font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhLightbulb weight="fill" class="w-5 h-5" />
                <span v-if="hintCount === 0">Hint</span>
                <span v-else>Hint {{ hintCount + 1 }}</span>
              </button>

              <!-- Why button (answer phase) -->
              <div v-if="phase === 'answer'" class="flex-1 flex justify-center">
                <button @click="goToWhy"
                        class="py-4 px-6 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                  Waarom is dit juist?
                </button>
              </div>

              <!-- Reflect button (why phase) -->
              <div v-if="phase === 'why'" class="flex-1 flex justify-center">
                <button @click="phase = 'reflect'"
                        class="py-4 px-6 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                  Reflectievraag
                </button>
              </div>

              <!-- Continue button -->
              <button v-if="phase === 'done' || (phase === 'reflect' && reflectionDone)"
                      @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-if="phase === 'predict'" class="flex-1 py-4 text-center text-sm font-medium text-slate-400">
                Voorspel eerst hiernaast
              </div>

              <div v-if="phase === 'explore'" class="flex-1 py-4 text-center text-sm font-medium text-slate-400">
                Sleep de blauwe punten
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT MAIN AREA -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <!-- SVG Canvas for Interactive Geometry -->
            <svg :width="svgWidth" :height="svgHeight"
                 class="bg-white rounded-xl shadow-md border-2 border-slate-200 touch-none select-none transition-colors"
                 :class="isCorrect ? 'border-amber-400 bg-amber-50' : ''"
                 @mousemove="onDrag" @touchmove.prevent="onDrag">

              <!-- The Triangle Polygon -->
              <polygon :points="`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`"
                       :fill="isCorrect ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.08)'"
                       :stroke="isCorrect ? '#d97706' : '#d97706'"
                       stroke-width="3" stroke-linejoin="round" class="transition-colors" />

              <!-- Points A, B, C -->
              <g>
                <!-- Point A -->
                <circle :cx="pA.x" :cy="pA.y" r="12" fill="#d97706"
                        class="cursor-grab active:cursor-grabbing hover:fill-amber-500 transition-colors"
                        @mousedown="startDrag('A')" @touchstart.prevent="startDrag('A')" />
                <text :x="pA.x - 20" :y="pA.y + 20" font-family="monospace" font-weight="bold" fill="#475569" font-size="14">A</text>

                <!-- Point B -->
                <circle :cx="pB.x" :cy="pB.y" r="12" fill="#d97706"
                        class="cursor-grab active:cursor-grabbing hover:fill-amber-500 transition-colors"
                        @mousedown="startDrag('B')" @touchstart.prevent="startDrag('B')" />
                <text :x="pB.x + 10" :y="pB.y + 20" font-family="monospace" font-weight="bold" fill="#475569" font-size="14">B</text>

                <!-- Point C -->
                <circle :cx="pC.x" :cy="pC.y" r="12" fill="#d97706"
                        class="cursor-grab active:cursor-grabbing hover:fill-amber-500 transition-colors"
                        @mousedown="startDrag('C')" @touchstart.prevent="startDrag('C')" />
                <text :x="pC.x + 10" :y="pC.y - 10" font-family="monospace" font-weight="bold" fill="#475569" font-size="14">C</text>
              </g>
            </svg>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true"
                    :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
