<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartLine, PhArrowClockwise, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: De Grafieken-Kraker' },
  instruction: {
    type: String,
    default: 'Voorspel eerst de vergelijking van de rode lijn. Daarna kan je het controleren met de schuifregelaars.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartLine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: '' })
const hintCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectionAnswer = ref('')

// Prediction gate state
const predictionPhase = ref(true)
const predictionM = ref('')
const predictionQ = ref('')
const sliderUnlocked = ref(false)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

// Worked example info
const showWorkedExample = ref(true)

function generateLevel(index) {
  switch (index) {
    case 0: {
      // Level 1: Target given as equation y = ax+b, predict both
      const targetM = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
      const targetQ = Math.floor(Math.random() * 5) - 2
      return {
        mode: 'equation',
        targetM,
        targetQ,
        equation: `y = ${targetM === 1 ? '' : targetM === -1 ? '-' : targetM}x${targetQ >= 0 ? ' + ' : ' - '}${Math.abs(targetQ)}`,
        goalText: `Bepaal m en q van deze rechte: y = ${targetM === 1 ? '' : targetM === -1 ? '-' : targetM}x${targetQ >= 0 ? ' + ' : ' - '}${Math.abs(targetQ)}`,
        hint1: 'm is de richtingsco\u00ebffici\u00ebnt: hoeveel stijgt/daalt de lijn per stap naar rechts? q is het snijpunt met de y-as.',
        hint2: 'Voorbeeld: y = 2x - 1 betekent m = 2, q = -1. De lijn stijgt met 2 per stap en snijdt de y-as in -1.',
        hint3: `De lijn is y = ${Math.abs(targetM) === 1 ? '' : Math.abs(targetM)}x ${targetQ >= 0 ? '+ ' : '- '}${Math.abs(targetQ)}. Vul in: m = __, q = __.`,
        why: 'm is de helling: de verandering in y gedeeld door de verandering in x. q is het startgetal: de y-waarde bij x = 0.',
        reflection: 'Hoe kan je aan de grafiek zien of m positief of negatief is?',
        errorSwap: 'Je hebt m en q omgewisseld. m = richtingsco\u00ebffici\u00ebnt (helling), q = snijpunt met y-as.',
        errorWrongSign: 'Let op het teken! Als de lijn daalt, is m negatief.'
      }
    }
    case 1: {
      // Level 2: Target given as TWO POINTS, student calculates m and q
      const x1 = Math.floor(Math.random() * 3) + 1
      const x2 = x1 + Math.floor(Math.random() * 3) + 2
      const targetM = Math.floor(Math.random() * 5) - 2
      const targetQ = Math.floor(Math.random() * 7) - 3
      const y1 = targetM * x1 + targetQ
      const y2 = targetM * x2 + targetQ
      return {
        mode: 'points',
        targetM,
        targetQ,
        points: { x1, y1, x2, y2 },
        equation: `y = ${targetM === 1 ? '' : targetM === -1 ? '-' : targetM}x${targetQ >= 0 ? ' + ' : ' - '}${Math.abs(targetQ)}`,
        goalText: `Bereken de rechte door (${x1}, ${y1}) en (${x2}, ${y2})`,
        hint1: `Gebruik m = (y2 - y1) / (x2 - x1). Vul in: (${y2} - ${y1}) / (${x2} - ${x1})`,
        hint2: 'Voorbeeld: punten (1, 3) en (3, 7): m = (7 - 3) / (3 - 1) = 4 / 2 = 2. Dan q = y1 - m * x1 = 3 - 2*1 = 1.',
        hint3: `m = (${y2} - ${y1}) / (${x2} - ${x1}) = ${y2 - y1} / ${x2 - x1} = __. q = y - mx = ${y1} - m * ${x1} = __.`,
        why: 'Met twee punten kan je altijd de helling berekenen: deel het verticale verschil door het horizontale verschil.',
        reflection: 'Wat is het verband tussen de helling m en hoe steil de grafiek is?',
        errorSwap: 'Je hebt Δx/Δy berekend in plaats van Δy/Δx. Deel het verticale verschil door het horizontale verschil.',
        errorWrongSign: 'Let op het teken van de helling. Controleer of de lijn stijgt of daalt tussen de twee punten.'
      }
    }
    case 2: {
      // Level 3: Real-world context
      const base = [1.5, 2, 2.5, 3][Math.floor(Math.random() * 4)]
      const perKm = [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2][Math.floor(Math.random() * 7)]
      const targetQ = base * 10
      const targetM = perKm
      const contexts = [
        { text: `Een taxi rekent €${base.toFixed(2)} starttarief + €${perKm.toFixed(2)} per km.`, unit: '€' },
        { text: `Een zwembad heeft al ${(base * 10).toFixed(0)} liter water en vult met ${perKm.toFixed(1)} L/min.`, unit: 'L' }
      ]
      const ctx = contexts[Math.floor(Math.random() * contexts.length)]
      return {
        mode: 'context',
        targetM,
        targetQ,
        equation: `y = ${targetM}x + ${targetQ}`,
        goalText: ctx.text,
        hint1: 'Wat is de waarde bij het begin (x = 0)? Dat is q. Hoeveel komt er per eenheid bij? Dat is m.',
        hint2: `Voorbeeld: "Start €3 + €2 per km": q = 3, m = 2. y = 2x + 3. Pas dit toe op jouw context.`,
        hint3: `Beginwaarde (x=0) = ${targetQ / 10}, dus q = __. Toename per eenheid = ${targetM}, dus m = __.`,
        why: 'In een context is q altijd de startwaarde (bij x=0) en m de verandering per eenheid.',
        reflection: 'Waarom is q altijd de waarde bij het begin (x = 0)?',
        errorSwap: 'Je hebt m en q omgewisseld. q is de startwaarde (bij x=0), m is de verandering per stap.',
        errorWrongSign: 'Deze context heeft een positieve m (het wordt meer). Controleer je berekening.'
      }
    }
    default:
      return { mode: 'equation', targetM: 2, targetQ: -1, equation: 'y = 2x - 1', goalText: 'Bepaal m en q', hint1: 'Kijk naar de helling.', hint2: 'Voorbeeld...', hint3: 'm = __, q = __', why: '...', reflection: '...' }
  }
}

const levels = ref([generateLevel(0), generateLevel(1), generateLevel(2)])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const userM = ref(1)
const userQ = ref(0)

function checkPrediction() {
  const data = currentLevelData.value
  const predM = parseFloat(predictionM.value)
  const predQ = parseFloat(predictionQ.value)

  if (isNaN(predM) || isNaN(predQ)) {
    feedback.value = { type: 'error', text: 'Voer geldige getallen in voor m en q.' }
    return
  }

  if (predM === data.targetM && predQ === data.targetQ) {
    predictionPhase.value = false
    sliderUnlocked.value = true
    userM.value = predM
    userQ.value = predQ
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: data.why
    }
    // Auto-complete
    isCorrect.value = true
    isChecked.value = true
  } else {
    attemptCount.value++
    const hintIdx = Math.min(attemptCount.value - 1, 2)
    const hints = [data.hint1, data.hint2, data.hint3]

    // Specific error analysis
    if (predM === data.targetQ && predQ === data.targetM) {
      feedback.value = { type: 'error', text: data.errorSwap + ' ' + hints[hintIdx] }
    } else if (predM === -data.targetM || predQ === -data.targetQ) {
      feedback.value = { type: 'error', text: data.errorWrongSign + ' ' + hints[hintIdx] }
    } else if (predM === data.targetM && predQ !== data.targetQ) {
      feedback.value = { type: 'error', text: `m = ${predM} is juist! Maar q klopt niet. q is de y-waarde bij x = 0. ` + hints[hintIdx] }
    } else if (predQ === data.targetQ && predM !== data.targetM) {
      feedback.value = { type: 'error', text: `q = ${predQ} is juist! Maar m klopt niet. Hoeveel verandert de lijn per stap? ` + hints[hintIdx] }
    } else {
      feedback.value = { type: 'error', text: hints[hintIdx] }
    }
  }
}

function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [currentLevelData.value.hint1, currentLevelData.value.hint2, currentLevelData.value.hint3]
  feedback.value = { type: 'info', text: `Hint ${idx + 1}: ${hints[idx]}` }
}

function unlockAnyway() {
  // Allow student to skip prediction and use sliders (for struggling students)
  predictionPhase.value = false
  sliderUnlocked.value = true
  feedback.value = { type: 'info', text: 'Gebruik de schuifregelaars om de lijn te vinden.' }
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 2) {
    showReflection.value = false
    reflectionAnswer.value = ''
    handleNextInternal()
  } else {
    feedback.value = { type: 'error', text: 'Schrijf een korte gedachte op om verder te gaan.' }
  }
}

function handleNext() {
  if (isCorrect.value) {
    showReflection.value = true
    feedback.value = {
      type: 'info',
      text: currentLevelData.value.reflection
    }
  }
}

function handleNextInternal() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

function resetActivityState() {
  isCorrect.value = false
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: '' }
  userM.value = 1
  userQ.value = 0
  predictionPhase.value = true
  predictionM.value = ''
  predictionQ.value = ''
  sliderUnlocked.value = false
  showWorkedExample.value = true
  showReflection.value = false
  reflectionAnswer.value = ''
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
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

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
  if (e.key === 'Enter' && predictionPhase.value) checkPrediction()
  if (e.key === 'Enter' && showReflection.value) submitReflection()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Worked example data
const workedExample = {
  points: { x1: 1, y1: 3, x2: 3, y2: 7 },
  calc: 'm = (7 - 3) / (3 - 1) = 4 / 2 = 2',
  qCalc: 'q = y1 - m * x1 = 3 - 2 * 1 = 1',
  result: 'y = 2x + 1'
}
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
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
        <button @click="emit('close')" class="p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98]">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="p-4 mb-4 bg-amber-50 border border-amber-300 rounded-xl">
              <p class="font-bold text-amber-800 mb-2 text-sm uppercase tracking-wider">Voorbeeld</p>
              <p class="font-bold text-amber-900 mb-2">Bepaal de rechte door (1, 3) en (3, 7)</p>
              <div class="bg-white p-3 rounded-lg border border-amber-200 mb-2 space-y-1 text-sm">
                <p class="font-mono text-slate-700">Stap 1: m = (7 - 3) / (3 - 1) = 4 / 2 = <strong class="text-amber-700">2</strong></p>
                <p class="font-mono text-slate-700">Stap 2: q = y1 - m * x1 = 3 - 2 * 1 = <strong class="text-amber-700">1</strong></p>
                <p class="font-mono font-bold text-amber-800 mt-2">y = 2x + 1</p>
              </div>
              <p class="text-sm text-amber-700">m is de helling (Δy/Δx). q is het startgetal (f(0)). Samen bepalen ze de rechte.</p>
            </div>

            <!-- Goal -->
            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl mb-4">
              <p class="font-bold text-slate-800 text-sm">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Prediction Gate -->
            <div v-if="predictionPhase" class="p-4 bg-amber-50 border border-amber-300 rounded-xl mb-4">
              <p class="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <PhQuestion weight="bold" class="w-5 h-5" /> Voorspel!
              </p>
              <p class="text-sm text-amber-700 mb-3">Voer m (helling) en q (startgetal / y-as snijpunt) in.</p>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">m = (richtingsco\u00ebffici\u00ebnt)</label>
                  <input v-model="predictionM" type="text" inputmode="decimal"
                         class="w-full p-3 border-2 border-amber-300 rounded-lg font-mono font-bold text-lg text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                         placeholder="m = ?" @keydown.enter="checkPrediction" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">q = (snijpunt y-as)</label>
                  <input v-model="predictionQ" type="text" inputmode="decimal"
                         class="w-full p-3 border-2 border-amber-300 rounded-lg font-mono font-bold text-lg text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                         placeholder="q = ?" @keydown.enter="checkPrediction" />
                </div>
              </div>

              <p class="text-xs text-slate-500 mt-3 underline cursor-pointer hover:text-slate-700"
                 @click="unlockAnyway">
                Ik weet het niet, laat me de schuifregelaars gebruiken
              </p>
            </div>

            <!-- Sliders (unlocked after prediction) -->
            <div v-if="sliderUnlocked" class="p-4 border border-slate-200 bg-slate-50 rounded-xl">
               <p class="text-xs font-bold text-slate-500 uppercase mb-3">Controleer met schuifregelaars</p>

               <div class="font-mono font-black text-xl text-slate-700 bg-white p-4 rounded-lg border-2 border-slate-200 text-center mb-4">
                   y = <span class="text-amber-600">{{ userM }}</span>x <span class="text-amber-700">{{ userQ >= 0 ? '+' : '' }} {{ userQ }}</span>
               </div>

               <div class="space-y-4">
                 <div>
                   <label class="text-sm font-bold text-slate-700 flex justify-between">
                       <span>m (Richtingsco\u00ebffici\u00ebnt)</span>
                       <span class="text-amber-600">{{ userM }}</span>
                   </label>
                   <input type="range" min="-5" max="5" step="0.5" v-model.number="userM"
                          class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600" />
                 </div>
                 <div>
                   <label class="text-sm font-bold text-slate-700 flex justify-between">
                       <span>q (Startgetal / y-as)</span>
                       <span class="text-amber-700">{{ userQ }}</span>
                   </label>
                   <input type="range" min="-5" max="5" step="1" v-model.number="userQ"
                          class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700" />
                 </div>
               </div>

               <p class="text-xs text-slate-400 mt-3">De lijnen passen exact als jouw voorspelling correct was.</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success' || feedback.type === 'info',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                 }">
               <component :is="feedback.type === 'error' ? PhWarningCircle : PhCheckCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100">
                <PhArrowClockwise />
              </button>

              <button v-if="predictionPhase" @click="showHint"
                      class="p-4 text-lg font-medium rounded-lg text-amber-600 bg-amber-50 border border-amber-300 hover:bg-amber-100">
                 <PhLightbulb class="w-5 h-5" />
              </button>

              <button v-if="predictionPhase" @click="checkPrediction"
                      class="flex-1 py-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500">
                Controleer Voorspelling
              </button>

              <div v-else-if="isCorrect && showReflection" class="flex-1">
                <input v-model="reflectionAnswer"
                       placeholder="Schrijf je antwoord..."
                       class="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 outline-none"
                       @keydown.enter="submitReflection" />
              </div>

              <button v-else-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative"
               style="background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem;">

              <div class="relative bg-white rounded-xl overflow-hidden border-4 border-slate-300 p-8 flex items-center justify-center"
                   style="width: 500px; height: 500px;">

                  <svg width="400" height="400" viewBox="-200 -200 400 400" class="block">

                      <!-- Grid lines -->
                      <g stroke="#e2e8f0" stroke-width="1">
                          <line v-for="i in 21" :key="'vg'+i" :x1="-250 + (i-1)*25" y1="-200" :x2="-250 + (i-1)*25" y2="200" />
                          <line v-for="i in 21" :key="'hg'+i" x1="-200" :y1="-250 + (i-1)*25" x2="200" :y2="-250 + (i-1)*25" />
                      </g>

                      <!-- Axes -->
                      <line x1="-200" y1="0" x2="200" y2="0" stroke="#475569" stroke-width="3" />
                      <line x1="0" y1="-200" x2="0" y2="200" stroke="#475569" stroke-width="3" />

                      <!-- Target Line (Red Dashed) -->
                      <line :x1="-10 * 25" :y1="-1 * (currentLevelData.targetM * -10 + currentLevelData.targetQ) * 25"
                            :x2="10 * 25"  :y2="-1 * (currentLevelData.targetM * 10 + currentLevelData.targetQ) * 25"
                            stroke="#ef4444" stroke-width="4" stroke-dasharray="10 6" />

                      <!-- When level 2, show the two points -->
                      <g v-if="currentLevelData.mode === 'points'">
                        <circle :cx="currentLevelData.points.x1 * 25" :cy="-1 * currentLevelData.points.y1 * 25"
                                r="6" fill="#ef4444" stroke="#fff" stroke-width="2" />
                        <text :x="currentLevelData.points.x1 * 25 + 10" :y="-1 * currentLevelData.points.y1 * 25 + 5"
                              font-size="11" font-weight="bold" fill="#ef4444" font-family="monospace">
                          ({{ currentLevelData.points.x1 }}, {{ currentLevelData.points.y1 }})
                        </text>
                        <circle :cx="currentLevelData.points.x2 * 25" :cy="-1 * currentLevelData.points.y2 * 25"
                                r="6" fill="#ef4444" stroke="#fff" stroke-width="2" />
                        <text :x="currentLevelData.points.x2 * 25 + 10" :y="-1 * currentLevelData.points.y2 * 25 + 5"
                              font-size="11" font-weight="bold" fill="#ef4444" font-family="monospace">
                          ({{ currentLevelData.points.x2 }}, {{ currentLevelData.points.y2 }})
                        </text>
                      </g>

                      <!-- User Line (Blue, only shown when sliders unlocked) -->
                      <line v-if="sliderUnlocked"
                            :x1="-10 * 25" :y1="-1 * (userM * -10 + userQ) * 25"
                            :x2="10 * 25"  :y2="-1 * (userM * 10 + userQ) * 25"
                            stroke="#0ea5e9" stroke-width="4"
                            class="transition-all duration-300"
                            :class="isCorrect ? '!stroke-amber-500' : ''" />

                      <!-- q marker for user -->
                      <circle v-if="sliderUnlocked" cx="0" :cy="-1 * userQ * 25"
                              r="6" fill="#0ea5e9" class="transition-all duration-300" />

                  </svg>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #d97706;
  border: 3px solid white;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #fde68a;
}
</style>
