<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCompass, PhArrowClockwise,
  PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Goniometrische Getallen (SOS CAS TOA)' },
  instruction: { type: String, default: 'Klik in de driehoek de twee zijden aan die samen de gevraagde goniometrische verhouding vormen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedRatio = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const hintCount = ref(0)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

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

function generateLevel(levelIndex) {
  const ratios = ['sin', 'cos', 'tan']
  const angles = ['alpha', 'beta']
  let targetRatio, targetAngle, correctSides, goalText, transform

  if (levelIndex === 0) {
    targetRatio = pick(['sin', 'cos'])
    targetAngle = 'alpha'
    if (targetRatio === 'sin') {
      correctSides = ['overstaand_alpha', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    } else {
      correctSides = ['aanliggend_alpha', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    }
    transform = 'scale(1, 1)'
  } else if (levelIndex === 1) {
    targetAngle = 'alpha'
    const used = ['sin', 'cos']
    targetRatio = pick(used)
    if (targetRatio === 'sin') {
      correctSides = ['overstaand_alpha', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    } else {
      correctSides = ['aanliggend_alpha', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b1? Selecteer de twee benodigde zijden.'
    }
    transform = pick(['scale(-1, 1) translate(-200, 0)', 'scale(1, 1)'])
  } else {
    targetRatio = pick(['tan', ...ratios])
    targetAngle = pick(angles)
    if (targetRatio === 'tan') {
      if (targetAngle === 'alpha') {
        correctSides = ['overstaand_alpha', 'aanliggend_alpha']
        goalText = 'Wat is de tangens van hoek \u03b1? Selecteer de twee benodigde zijden.'
      } else {
        correctSides = ['overstaand_beta', 'aanliggend_beta']
        goalText = 'Let op! Wat is de tangens van hoek \u03b2 (bovenaan)? Selecteer de twee benodigde zijden.'
      }
      transform = pick(['rotate(180 100 75)', 'scale(1, 1)'])
    } else if (targetRatio === 'sin') {
      targetAngle = 'beta'
      correctSides = ['overstaand_beta', 'schuin']
      goalText = 'Wat is de sinus van hoek \u03b2? Selecteer de twee benodigde zijden.'
      transform = 'rotate(180 100 75)'
    } else {
      targetAngle = 'beta'
      correctSides = ['aanliggend_beta', 'schuin']
      goalText = 'Wat is de cosinus van hoek \u03b2? Selecteer de twee benodigde zijden.'
      transform = 'rotate(180 100 75)'
    }
  }

  return { goalText, targetRatio, targetAngle, correctSides, transform }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const selectedSides = ref([])

const sideMap = {
  'verticaal': { alpha: 'overstaand_alpha', beta: 'aanliggend_beta' },
  'horizontaal': { alpha: 'aanliggend_alpha', beta: 'overstaand_beta' },
  'schuin': { alpha: 'schuin', beta: 'schuin' }
}

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    ratio: 'sin',
    angle: '\u03b1',
    sides: ['overstaand_alpha', 'schuin'],
    text: 'SOS: Sinus = Overstaand / Schuine zijde'
  }
]

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: welk ezelsbruggetje gebruik je?' }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (!predictedRatio.value) return
  const data = currentLevelData.value
  if (predictedRatio.value === data.targetRatio) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: `Juist! We gebruiken ${data.targetRatio.toUpperCase()}. Klik nu op de juiste zijden.` }
  } else {
    attemptCount.value++
    const hints = [
      `SOS CAS TOA: welke letter staat voor ${data.targetRatio}?`,
      `${data.targetRatio} heeft een ezelsbruggetje. Denk aan S-O-S of C-A-S of T-O-A.`,
      `Het juiste ezelsbruggetje is: ${data.targetRatio === 'sin' ? 'SOS' : data.targetRatio === 'cos' ? 'CAS' : 'TOA'}.`
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const d = currentLevelData.value
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = []
  if (d.targetRatio === 'sin') {
    hints = [
      'SOS: Sinus = Overstaand / Schuin. Welke zijden zijn overstaand en schuin?',
      'De overstaande zijde ligt tegenover de hoek. De schuine zijde is de langste (hypotenusa).',
      `Juiste zijden zijn: ${d.correctSides[0]} en ${d.correctSides[1]}.`
    ]
  } else if (d.targetRatio === 'cos') {
    hints = [
      'CAS: Cosinus = Aanliggend / Schuin. Welke zijden zijn aanliggend en schuin?',
      'De aanliggende zijde grenst aan de hoek (en is geen schuine). De schuine zijde is de langste.',
      `Juiste zijden zijn: ${d.correctSides[0]} en ${d.correctSides[1]}.`
    ]
  } else {
    hints = [
      'TOA: Tangens = Overstaand / Aanliggend. De schuine zijde wordt niet gebruikt!',
      'Tangens gebruikt enkel de twee rechthoekszijden. Overstaand ligt tegenover de hoek, aanliggend grenst eraan.',
      `Juiste zijden zijn: ${d.correctSides[0]} en ${d.correctSides[1]}.`
    ]
  }
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
function getErrorAnalysis() {
  const d = currentLevelData.value
  if (!d || selectedSides.value.length !== 2) return ''
  const c1 = d.correctSides[0]
  const c2 = d.correctSides[1]
  const has1 = selectedSides.value.includes(c1)
  const has2 = selectedSides.value.includes(c2)

  if (has1 && !has2) {
    const wrong = selectedSides.value.find(s => s !== c1)
    if (wrong === 'schuin' && d.targetRatio !== 'tan') {
      return 'Bijna! Je hebt de juiste teller, maar de schuine zijde als noemer. Dat klopt voor sin/cos, maar selecteer de juiste combinatie.'
    }
    if (wrong === 'aanliggend_alpha' && d.targetRatio === 'sin') {
      return 'Let op! Je hebt de aanliggende i.p.v. overstaande zijde geselecteerd. Voor sinus heb je de OVERSTAANDE nodig.'
    }
    if (wrong === 'overstaand_alpha' && d.targetRatio === 'cos') {
      return 'Let op! Je hebt de overstaande i.p.v. aanliggende zijde geselecteerd. Voor cosinus heb je de AANLIGGENDE nodig.'
    }
  }
  if (!has1 && has2) {
    const wrong = selectedSides.value.find(s => s !== c2)
    if (wrong === 'schuin' && d.targetRatio === 'tan') {
      return 'Verwar niet! Tangens gebruikt NIET de schuine zijde. Enkel overstaand en aanliggend.'
    }
  }
  return ''
}

function toggleSide(physicalSide) {
  if (isCorrect.value) return
  const logicalSide = sideMap[physicalSide][currentLevelData.value.targetAngle]

  const index = selectedSides.value.indexOf(logicalSide)
  if (index > -1) {
    selectedSides.value.splice(index, 1)
  } else {
    if (selectedSides.value.length < 2) {
      selectedSides.value.push(logicalSide)
    } else {
      selectedSides.value.shift()
      selectedSides.value.push(logicalSide)
    }
  }
  isChecked.value = false

  if (selectedSides.value.length === 2) {
    tryAutoCorrect()
  }
}

function tryAutoCorrect() {
  const target = currentLevelData.value
  const correct1 = target.correctSides[0]
  const correct2 = target.correctSides[1]

  const hasCorrect1 = selectedSides.value.includes(correct1)
  const hasCorrect2 = selectedSides.value.includes(correct2)

  if (hasCorrect1 && hasCorrect2) {
    isCorrect.value = true
    hintCount.value = 0
    errorDetected.value = ''

    const whyTexts = [
      'SOS CAS TOA is een ezelsbruggetje. Sinus = Overstaand / Schuin, Cosinus = Aanliggend / Schuin, Tangens = Overstaand / Aanliggend. De letters komen van: Sinus = Overstaand/Schuin, Cosinus = Aanliggend/Schuin, Tangens = Overstaand/Aanliggend.',
      'Elke goniometrische verhouding koppelt een hoek aan een verhouding van twee zijden. Door de juiste zijden te selecteren, herken je fysiek wat SOS CAS TOA betekent.',
      'De keuze hangt af van de hoek: bij hoek β (bovenaan) wisselen overstaand en aanliggend. Daarom is het belangrijk om eerst de hoek te identificeren, dan SOS CAS TOA toe te passen.'
    ]
    showWhyExplanation(whyTexts[currentInternalLevel.value])
    feedback.value = {
      type: 'success',
      text: `Perfect! Je herkent ${target.targetRatio.toUpperCase()} = ${target.correctSides[0]} / ${target.correctSides[1]}. LPD 11: Je past goniometrische verhoudingen correct toe.`
    }
  }
}

function isSelected(physicalSide) {
  return selectedSides.value.includes(sideMap[physicalSide][currentLevelData.value.targetAngle])
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
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
  attemptCount.value = 0
  hintCount.value = 0
  errorDetected.value = ''
  showWhy.value = false
  whyText.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
  predictedRatio.value = null
  selectedSides.value = []

  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value >= 1

  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: welk ezelsbruggetje (SOS/CAS/TOA) gebruik je?' }
  } else {
    feedback.value = { type: 'info', text: 'Klik op twee zijden in de driehoek.' }
  }
}

function handleNext() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op wat je leerde over goniometrische verhoudingen.' }
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
  const hasSosCasToa = text.includes('sos') || text.includes('cas') || text.includes('toa') || text.includes('ezelsbrug')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if ((hasSosCasToa || text.length > 20) && hasReason) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekend! Je begrijpt SOS CAS TOA.<br/><br/><strong>LPD 11 bewezen:</strong> Je herkent goniometrische verhoudingen in een rechthoekige driehoek.' }
  } else {
    attemptCount.value++
    const hints = [
      'Waarom helpen ezelsbruggetjes zoals SOS CAS TOA? Hoe onthoud je welke zijden bij sinus horen?',
      'Leg uit: "SOS betekent Sinus = Overstaand / Schuin. Dit helpt omdat..."',
      'Wat is het verschil tussen sinus, cosinus en tangens? Wanneer gebruik je welk ezelsbruggetje?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== LIFECYCLE ==========
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

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">Wat is de sinus van hoek \u03b1?</p>
              <div class="space-y-1 text-sm text-slate-700 mb-2">
                <div class="flex items-start gap-2"><span class="text-indigo-500 font-bold shrink-0">1.</span><span>SOS CAS TOA: S = O / S → sinus gebruikt Overstaand en Schuin.</span></div>
                <div class="flex items-start gap-2"><span class="text-indigo-500 font-bold shrink-0">2.</span><span>Bij hoek \u03b1 (linksonder) is de overstaande zijde de verticale, de schuine de diagonaal.</span></div>
                <div class="flex items-start gap-2"><span class="text-indigo-500 font-bold shrink-0">3.</span><span>Antwoord: sinus = overstaande / schuine zijde.</span></div>
              </div>
              <div class="p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                SOS: Sinus = Overstaand / Schuin
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <!-- Prediction Gate -->
            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Welk ezelsbruggetje gebruik je? (SOS, CAS of TOA)</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [{id:'sin',label:'SOS — Sinus = Overstaand/Schuin'},{id:'cos',label:'CAS — Cosinus = Aanliggend/Schuin'},{id:'tan',label:'TOA — Tangens = Overstaand/Aanliggend'}]" :key="opt.id"
                        @click="predictedRatio = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedRatio === opt.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedRatio" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- Goal + Status -->
            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="mb-4">
              <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-3">
                <p class="font-bold text-amber-800 text-sm">{{ currentLevelData ? currentLevelData.goalText : '' }}</p>
              </div>
              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                <p class="text-sm text-slate-500 font-bold mb-3 uppercase tracking-wider text-center">Geselecteerde Zijden ({{ selectedSides.length }}/2)</p>
                <div class="flex gap-2 justify-center">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                       :class="selectedSides.length >= 1 ? 'bg-amber-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">1</div>
                  <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                       :class="selectedSides.length >= 2 ? 'bg-amber-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">2</div>
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

            <!-- Error analysis -->
            <div v-if="errorDetected && !isCorrect && selectedSides.length === 2" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
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
              <p class="text-sm text-slate-700 mb-3">Waarom werkt SOS CAS TOA? Hoe helpt dit ezelsbruggetje om de juiste zijden te kiezen? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="SOS CAS TOA helpt omdat..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM -->
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

        <!-- RIGHT PANEL — Triangle -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              <div class="relative w-80 h-64">
                <svg width="100%" height="100%" viewBox="0 0 200 150" class="overflow-visible transition-transform duration-700 ease-in-out" :transform="currentLevelData ? currentLevelData.transform : 'scale(1,1)'">
                  <polygon points="10,140 190,140 190,10" fill="white" stroke="none" />
                  <polyline points="170,140 170,120 190,120" fill="none" stroke="#64748b" stroke-width="2"/>
                  <path d="M 40 140 A 30 30 0 0 0 35 122" fill="none" stroke="#3b82f6" stroke-width="4"/>
                  <path d="M 190 40 A 30 30 0 0 0 172 35" fill="none" stroke="#f43f5e" stroke-width="4"/>
                  <line x1="10" y1="140" x2="190" y2="140" stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('horizontaal') ? '#f59e0b' : '#1e293b'" @click="toggleSide('horizontaal')" />
                  <line x1="190" y1="140" x2="190" y2="10" stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('verticaal') ? '#f59e0b' : '#1e293b'" @click="toggleSide('verticaal')" />
                  <line x1="10" y1="140" x2="190" y2="10" stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('schuin') ? '#f59e0b' : '#1e293b'" @click="toggleSide('schuin')" />
                  <line x1="10" y1="140" x2="190" y2="140" stroke="transparent" stroke-width="24" @click="toggleSide('horizontaal')" class="cursor-pointer" />
                  <line x1="190" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('verticaal')" class="cursor-pointer" />
                  <line x1="10" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('schuin')" class="cursor-pointer" />
                </svg>
                <div class="absolute inset-0 pointer-events-none">
                  <div v-if="currentLevelData && (currentLevelData.targetAngle === 'alpha' || currentInternalLevel === 0)"
                       class="text-blue-600 font-black text-2xl font-serif"
                       :class="{'absolute bottom-1 left-8': currentLevelData.transform === 'scale(1, 1)', 'absolute bottom-1 right-8': currentLevelData.transform.includes('scale(-1'), 'absolute top-1 right-8': currentLevelData.transform.includes('rotate(180')}">\u03b1</div>
                  <div v-if="currentLevelData"
                       class="text-red-600 font-black text-2xl font-serif"
                       :class="{'absolute top-8 right-6': currentLevelData.transform === 'scale(1, 1)', 'absolute top-8 left-6': currentLevelData.transform.includes('scale(-1'), 'absolute bottom-8 left-6': currentLevelData.transform.includes('rotate(180')}">\u03b2</div>
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
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
</style>
