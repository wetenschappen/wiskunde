<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhList, PhArrowClockwise,
  PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Evenwijdige Rechten' },
  instruction: {
    type: String,
    default: 'Als een snijlijn door twee <strong>evenwijdige</strong> rechten snijdt, ontstaan er speciale hoekenparen (Z-hoeken, F-hoeken, X-hoeken) die altijd even groot zijn.<br/><br/><strong>Opdracht:</strong> Klik de twee hoeken aan die het gevraagde hoekenpaar vormen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhList }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de twee hoeken die het gevraagde paar vormen.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionAnswer = ref(null)
const predictionSubmitted = ref(false)
const predictionAngle = ref(null)
const showWorkedExample = ref(true)
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionSubmitted = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Zoek een Z-hoek (Verwisselende Binnenhoeken)',
    type: 'Z',
    targetA: 3, targetB: 6,
    predictionQuestion: 'Wat is de "missing angle"? Als hoek 3 = 55°, wat is hoek 6?',
    predictionExplanation: 'Hoek 3 en 6 zijn Z-hoeken (verwisselende binnenhoeken). Bij evenwijdige lijnen zijn Z-hoeken gelijk. Dus hoek 6 = 55°.',
    workedExample: {
      title: 'Z-hoeken (Verwisselende Binnenhoeken)',
      content: 'Z-hoeken liggen aan de binnenkant van de evenwijdige lijnen, maar aan weerszijden van de snijlijn. Ze vormen een Z-patroon.<br/><br/>Voorbeeld: hoek 3 en hoek 6 zijn Z-hoeken = 55°. Hoek 4 en hoek 5 zijn ook Z-hoeken.',
      diagram: 'Z'
    },
    hintLevels: [
      'Z-hoeken zijn verwisselende binnenhoeken: ze liggen tussen de evenwijdige lijnen, aan weerszijden van de snijlijn. Vormen ze een Z-patroon?',
      'Voorbeeld: bij een Z-hoek kijk je naar de binnenkant. Start bij hoek 3 (boven, links-onder) en ga naar hoek 6 (onder, rechts-boven). Dat is een Z-vorm.',
      'De Z-hoek in deze opdracht: hoek __ (boven, links-onder) en hoek __ (onder, rechts-boven).'
    ],
    whyExplanation: 'F-hoeken (overeenkomstige hoeken) staan op dezelfde relatieve positie bij elk snijpunt. Bijvoorbeeld: hoek 1 (boven-links bovenaan) en hoek 5 (boven-links onderaan) zijn F-hoeken. Z-hoeken (verwisselende binnenhoeken) liggen aan de binnenkant maar aan weerszijden van de snijlijn, ze vormen een Z-patroon. Beide zijn gelijk omdat de evenwijdige lijnen dezelfde richting hebben.',
    reflectionQuestion: 'Waarom zijn Z-hoeken gelijk wanneer de twee lijnen evenwijdig zijn?',
    reflectionAnswer: 'Omdat de evenwijdige lijnen dezelfde richting hebben. De afstand tussen de lijnen is constant, waardoor de binnenhoeken aan weerszijden van de snijlijn even groot zijn.',
    errorAnalysis: {
      'F': 'Je koos een F-hoek (overeenkomstige hoeken). F-hoeken staan op dezelfde positie bij elk snijpunt, maar deze opdracht vraagt een Z-hoek (verwisselende binnenhoeken).',
      'X': 'Je koos overstaande hoeken (X-hoeken). Die liggen op hetzelfde snijpunt, maar deze opdracht vraagt een hoekenpaar tussen de twee snijpunten.'
    }
  },
  {
    goalText: 'Opdracht 2: Zoek een F-hoek (Overeenkomstige Hoeken)',
    type: 'F',
    targetA: 1, targetB: 5,
    predictionQuestion: 'Wat is de "missing angle"? Als hoek 1 = 70°, wat is hoek 5?',
    predictionExplanation: 'Hoek 1 en 5 zijn F-hoeken (overeenkomstige hoeken). Ze staan op dezelfde positie bij elk snijpunt. Bij evenwijdige lijnen zijn F-hoeken gelijk. Dus hoek 5 = 70°.',
    workedExample: {
      title: 'F-hoeken (Overeenkomstige Hoeken)',
      content: 'F-hoeken staan op dezelfde relatieve positie bij elk snijpunt. Stel je voor dat je de 4 hoeken bovenaan naar beneden schuift: ze vallen precies op dezelfde posities onderaan.<br/><br/>Voorbeeld: hoek 1 (boven-links) en hoek 5 (onder-links) zijn F-hoeken. Hoek 3 (boven-rechts) en hoek 7 (onder-rechts) ook.',
      diagram: 'F'
    },
    hintLevels: [
      'F-hoeken zijn overeenkomstige hoeken: ze staan op dezelfde relatieve plaats bij elk snijpunt. Stel je voor dat je de bovenste vier hoeken naar beneden schuift.',
      'Voorbeeld: hoek 1 zit links-boven aan het bovenste snijpunt. Welke hoek zit links-boven aan het onderste snijpunt? Dat is hoek 5.',
      'De F-hoek in deze opdracht: hoek __ (boven, links-boven) en hoek __ (onder, links-boven).'
    ],
    whyExplanation: 'F-hoeken zijn gelijk omdat evenwijdige lijnen dezelfde "richting" hebben. Het bovenste snijpunt en het onderste snijpunt zijn kopieën van elkaar, verschoven langs de evenwijdige lijnen. Daarom staan F-hoeken op "dezelfde plek" en zijn ze even groot.',
    reflectionQuestion: 'Wat is het verschil tussen F-hoeken en Z-hoeken?',
    reflectionAnswer: 'F-hoeken (overeenkomstig) staan op dezelfde relatieve positie bij elk snijpunt. Z-hoeken (verwisselende binnenhoeken) liggen aan de binnenkant tussen de lijnen maar aan weerszijden van de snijlijn.',
    errorAnalysis: {
      'Z': 'Je koos een Z-hoek (verwisselende binnenhoeken). Die liggen aan de binnenkant tussen de lijnen, maar deze opdracht vraagt een F-hoek (overeenkomstige hoeken op dezelfde positie).',
      'X': 'Je koos overstaande hoeken (X-hoeken). Die liggen op hetzelfde snijpunt tegenover elkaar, niet verspreid over twee snijpunten.'
    }
  },
  {
    goalText: 'Opdracht 3: Zoek een X-hoek (Overstaande Hoeken)',
    type: 'X',
    targetA: 1, targetB: 4,
    predictionQuestion: 'Wat is de "missing angle"? Als hoek 1 = 120°, wat is hoek 4?',
    predictionExplanation: 'Hoek 1 en 4 zijn X-hoeken (overstaande hoeken). Ze liggen tegenover elkaar op hetzelfde snijpunt. Overstaande hoeken zijn altijd gelijk, ongeacht of de lijnen evenwijdig zijn. Dus hoek 4 = 120°.',
    workedExample: {
      title: 'X-hoeken (Overstaande Hoeken)',
      content: 'X-hoeken (overstaande hoeken) liggen kruiselings tegenover elkaar op hetzelfde snijpunt. Ze zijn ALTIJD gelijk, ook als de lijnen NIET evenwijdig zijn.<br/><br/>Voorbeeld: hoek 1 en hoek 4 zijn overstaand. Hoek 2 en hoek 3 ook. Op het onderste snijpunt: hoek 5 en 8, en hoek 6 en 7.',
      diagram: 'X'
    },
    hintLevels: [
      'X-hoeken zijn overstaande hoeken: ze liggen tegenover elkaar op hetzelfde snijpunt. Ze zijn altijd gelijk, ongeacht de stand van de lijnen.',
      'Voorbeeld: op het bovenste snijpunt: hoek 1 (links-boven) en hoek 4 (rechts-onder) zijn overstaand. Hoek 2 (rechts-boven) en hoek 3 (links-onder) ook.',
      'Op het bovenste snijpunt, overstaande hoeken: hoek 1 en hoek __, hoek 2 en hoek __.'
    ],
    whyExplanation: 'Overstaande hoeken (X-hoeken) zijn altijd gelijk omdat de twee lijnen die elkaar snijden een rechte lijn vormen. Aan de ene kant van de rechte lijn is de som 180° (gestrekte hoek). Hoek 1 + hoek 2 = 180° en ook hoek 4 + hoek 2 = 180°, dus hoek 1 = hoek 4.',
    reflectionQuestion: 'Als lijnen NIET evenwijdig zijn, welke hoeken blijven dan nog gelijk?',
    reflectionAnswer: 'X-hoeken (overstaande hoeken) blijven altijd gelijk omdat ze op hetzelfde snijpunt liggen. F- en Z-hoeken zijn alleen gelijk bij evenwijdige lijnen.',
    errorAnalysis: {
      'F': 'Je koos een F-hoek (overeenkomstige hoeken). Dat zijn hoeken op dezelfde positie bij verschillende snijpunten, maar deze opdracht vraagt overstaande hoeken op hetzelfde snijpunt.',
      'Z': 'Je koos een Z-hoek (verwisselende binnenhoeken). Die liggen tussen de lijnen aan weerszijden van de snijlijn, maar deze opdracht vraagt overstaande hoeken op hetzelfde snijpunt.'
    }
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

const transversalAngle = ref(60)
const selectedAngles = ref([])

function toggleAngle(id) {
  if (isCorrect.value) return

  const idx = selectedAngles.value.indexOf(id)
  if (idx > -1) {
    selectedAngles.value.splice(idx, 1)
  } else {
    if (selectedAngles.value.length < 2) {
      selectedAngles.value.push(id)
    } else {
      selectedAngles.value[1] = id
    }
  }
  if (selectedAngles.value.length === 2) {
    checkMatch()
  }
}

function checkMatch() {
  isChecked.value = true
  if (selectedAngles.value.length !== 2) return

  const [a, b] = selectedAngles.value.slice().sort((x, y) => x - y)
  const data = currentLevelData.value
  const targets = [data.targetA, data.targetB].sort((x, y) => x - y)
  const isMatch = a === targets[0] && b === targets[1]

  if (isMatch) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: 'Correct! ' + (data.type === 'Z' ? 'Dit zijn de verwisselende binnenhoeken (Z-hoek).' : data.type === 'F' ? 'Dit zijn de overeenkomstige hoeken (F-hoek).' : 'Dit zijn de overstaande hoeken (X-hoek).') }
    showWhy.value = true
  } else {
    attemptCount.value++

    // Error analysis: detect what type they DID select
    const sorted = [a, b]
    const isZ = (sorted[0] === 3 && sorted[1] === 6) || (sorted[0] === 4 && sorted[1] === 5)
    const isF = (sorted[0] === 1 && sorted[1] === 5) || (sorted[0] === 2 && sorted[1] === 6) || (sorted[0] === 3 && sorted[1] === 7) || (sorted[0] === 4 && sorted[1] === 8)
    const isX = (sorted[0] === 1 && sorted[1] === 4) || (sorted[0] === 2 && sorted[1] === 3) || (sorted[0] === 5 && sorted[1] === 8) || (sorted[0] === 6 && sorted[1] === 7)

    let errorType = null
    if (data.type === 'Z' && isF) errorType = 'F'
    else if (data.type === 'Z' && isX) errorType = 'X'
    else if (data.type === 'F' && isZ) errorType = 'Z'
    else if (data.type === 'F' && isX) errorType = 'X'
    else if (data.type === 'X' && isF) errorType = 'F'
    else if (data.type === 'X' && isZ) errorType = 'Z'

    const idx = Math.min(attemptCount.value - 1, 2)

    if (attemptCount.value === 1 && errorType) {
      feedback.value = { type: 'error', text: data.errorAnalysis[errorType] }
    } else if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: data.hintLevels[0] }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: data.hintLevels[1] }
    } else {
      feedback.value = { type: 'error', text: data.hintLevels[2] }
    }
  }

  // Reset selection for retry
  if (!isCorrect.value) {
    selectedAngles.value = []
  }
}

function getAngleClass(id) {
  return {
    'ring-2 ring-amber-500 bg-amber-500/40': selectedAngles.value.includes(id),
    'bg-amber-500/20 hover:bg-amber-500/30': !selectedAngles.value.includes(id)
  }
}

function answerPrediction(val) {
  predictionAnswer.value = val
  predictionSubmitted.value = true
  if (val === true) {
    feedback.value = { type: 'info', text: 'Correct! ' + currentLevelData.value.predictionExplanation }
  } else {
    feedback.value = { type: 'error', text: 'Niet helemaal. ' + currentLevelData.value.predictionExplanation }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Klik op de twee hoeken die het gevraagde paar vormen.' }
}

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 3) {
    reflectionSubmitted.value = true
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op de twee hoeken die het gevraagde paar vormen.' }
  transversalAngle.value = 60
  selectedAngles.value = []
  showPrediction.value = true
  predictionAnswer.value = null
  predictionSubmitted.value = false
  showWorkedExample.value = true
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
}

const xHalf = computed(() => {
  return 50 / Math.tan(transversalAngle.value * Math.PI / 180)
})

const topIntersectLeft = computed(() => {
  return `calc(2rem + ${250 - xHalf.value}px)`
})

const botIntersectLeft = computed(() => {
  return `calc(2rem + ${250 + xHalf.value}px)`
})

function handleNext() {
  if (showWhy.value && !showReflection.value) {
    showReflection.value = true
    return
  }
  if (showReflection.value && !reflectionSubmitted.value) {
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

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
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
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="animate-fadeIn">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Voorspelling</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="font-bold text-slate-800 text-base">{{ currentLevelData.predictionQuestion }}</p>
                    <p class="text-xs text-slate-500 mt-1">Bij evenwijdige lijnen zijn bepaalde hoeken gelijk.</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <input v-model="predictionAnswer" type="number" placeholder="bv. 55"
                         class="w-24 p-2 border border-slate-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  <span class="flex items-center text-lg font-bold text-slate-500">&deg;</span>
                </div>
                <button @click="answerPrediction(predictionAnswer)"
                        class="mt-3 px-5 py-2 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
                        :disabled="predictionAnswer === null || predictionAnswer === ''">
                  Bevestig
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && predictionSubmitted" class="animate-fadeIn">
              <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" /> {{ currentLevelData.workedExample.title }}
                </h4>
                <MathText :content="currentLevelData.workedExample.content" class="text-sm text-slate-700 prose prose-sm" />
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- MAIN ACTIVITY -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
              <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

              <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
                <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
              </div>

              <button @click="showHint" :disabled="isCorrect"
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                 <label class="block text-sm font-bold text-slate-700 mb-2">Jouw selectie:</label>
                 <div class="flex gap-2">
                     <div v-for="i in 2" :key="i" class="flex-1 h-12 rounded-lg border-2 border-dashed flex items-center justify-center font-bold text-xl transition-all"
                          :class="selectedAngles[i-1] ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white text-slate-400'">
                         {{ selectedAngles[i-1] ? `Hoek ${selectedAngles[i-1]}` : '?' }}
                     </div>
                 </div>
                 <p class="text-xs text-slate-400 mt-2">Selecteer 2 hoeken door erop te klikken in de tekening.</p>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div v-if="showWhy" class="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Waarom is dit zo?</p>
              <p class="text-sm text-slate-700 leading-relaxed">{{ currentLevelData.whyExplanation }}</p>
            </div>

            <div v-if="showReflection" class="p-3 mb-3 bg-slate-100 border border-slate-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reflectie</p>
              <p class="text-sm font-medium text-slate-800 mb-2">{{ currentLevelData.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionSubmitted"
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionSubmitted" @click="submitReflection"
                      class="mt-2 px-4 py-1.5 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig
              </button>
              <p v-if="reflectionSubmitted" class="text-xs text-slate-500 mt-1 italic">Goed nagedacht!</p>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhArrowClockwise />
              </button>
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 text-sm">
                <span v-if="showWhy && !showReflection">Bekijk uitleg</span>
                <span v-else-if="showReflection && !reflectionSubmitted">Reflecteer eerst</span>
                <span v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right panel: Angle diagram -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="w-full max-w-3xl flex flex-col items-center animate-fadeIn">

                <!-- Transversal angle slider -->
                <div class="mb-6 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <div class="flex w-full justify-between items-end mb-2">
                        <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Draai de snijlijn</label>
                        <span class="font-black text-xl text-amber-600">{{ transversalAngle }}°</span>
                    </div>
                    <input type="range" min="30" max="150" step="1" v-model.number="transversalAngle" :disabled="isCorrect"
                           class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>

                <!-- Visualisation -->
                <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8">
                    <svg width="500" height="300" viewBox="0 0 500 300" class="block">

                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                            </marker>
                        </defs>

                        <!-- Top parallel line -->
                        <line x1="50" y1="100" x2="450" y2="100" stroke="#475569" stroke-width="4" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" />
                        <text x="30" y="105" font-weight="bold" fill="#64748b" font-family="Inter, sans-serif">a</text>

                        <!-- Bottom parallel line -->
                        <line x1="50" y1="200" x2="450" y2="200" stroke="#475569" stroke-width="4" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" />
                        <text x="30" y="205" font-weight="bold" fill="#64748b" font-family="Inter, sans-serif">b</text>

                        <!-- Transversal line (rotating) -->
                        <g :transform="`rotate(${transversalAngle - 90}, 250, 150)`">
                            <line x1="250" y1="0" x2="250" y2="300" stroke="rgb(245 158 11)" stroke-width="4" />
                        </g>

                        <!-- Type label (Z, F, or X) -->
                        <text x="250" y="280" text-anchor="middle" font-weight="900" font-size="36"
                              fill="rgba(245, 158, 11, 0.15)" font-family="Inter, sans-serif">
                            {{ currentLevelData.type }}-hoeken
                        </text>
                    </svg>
                </div>

                <!-- Angle buttons overlay -->
                <div class="absolute inset-0 pointer-events-none">
                    <!-- Top intersection angle buttons -->
                    <div class="pointer-events-auto absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2"
                         :style="{ left: `calc(2rem + ${250 - 50/Math.tan(transversalAngle*Math.PI/180)}px)`, top: 'calc(2rem + 100px)' }">
                        <div v-for="angle in [1,2,3,4]" :key="angle"
                             @click="toggleAngle(angle)"
                             class="cursor-pointer flex items-center justify-center font-bold text-base transition-all rounded-full focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                             :class="[getAngleClass(angle),
                               angle === 1 ? 'items-end justify-end rounded-tl-lg' : '',
                               angle === 2 ? 'items-end justify-start rounded-tr-lg' : '',
                               angle === 3 ? 'items-start justify-end rounded-bl-lg' : '',
                               angle === 4 ? 'items-start justify-start rounded-br-lg' : '',
                               selectedAngles.includes(angle) ? 'text-white font-black scale-110 z-10' : 'text-slate-600']"
                             :style="isCorrect ? { pointerEvents: 'none' } : {}"
                             role="button" tabindex="0"
                             @keydown.enter.prevent="toggleAngle(angle)" @keydown.space.prevent="toggleAngle(angle)">
                            {{ angle }}
                        </div>
                    </div>

                    <!-- Bottom intersection angle buttons -->
                    <div class="pointer-events-auto absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2"
                         :style="{ left: `calc(2rem + ${250 + 50/Math.tan(transversalAngle*Math.PI/180)}px)`, top: 'calc(2rem + 200px)' }">
                        <div v-for="angle in [5,6,7,8]" :key="angle"
                             @click="toggleAngle(angle)"
                             class="cursor-pointer flex items-center justify-center font-bold text-base transition-all rounded-full focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                             :class="[getAngleClass(angle),
                               angle === 5 ? 'items-end justify-end rounded-tl-lg' : '',
                               angle === 6 ? 'items-end justify-start rounded-tr-lg' : '',
                               angle === 7 ? 'items-start justify-end rounded-bl-lg' : '',
                               angle === 8 ? 'items-start justify-start rounded-br-lg' : '',
                               selectedAngles.includes(angle) ? 'text-white font-black scale-110 z-10' : 'text-slate-600']"
                             :style="isCorrect ? { pointerEvents: 'none' } : {}"
                             role="button" tabindex="0"
                             @keydown.enter.prevent="toggleAngle(angle)" @keydown.space.prevent="toggleAngle(angle)">
                            {{ angle }}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showWhy" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #f59e0b;
  cursor: pointer;
  margin-top: -9px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
