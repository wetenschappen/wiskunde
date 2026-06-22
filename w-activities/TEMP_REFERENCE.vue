<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMathOperations,
  PhArrowClockwise,
  PhLightbulb,
  PhBrain,
  PhBookOpen,
  PhTarget,
  PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Discriminant en Oplossingen'
  },
  instruction: {
    type: String,
    default: 'Verander a, b en c en let op de snijpunten met de x-as.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const wrongCounters = ref({ halfB: 0, signFlip: 0, productMix: 0 })

// === PHASE 0: WORKED EXAMPLE ===
const showWorkedExample = ref(true)
const workedStep = ref(0)
const workedSteps = [
  { label: 'We hebben: 2x\u00b2 + 5x + 3 = 0', detail: 'Standaardvorm ax\u00b2 + bx + c = 0' },
  { label: 'a = 2, b = 5, c = 3', detail: 'Identificeer a, b en c' },
  { label: 'D = b\u00b2 \u2212 4ac = 5\u00b2 \u2212 4\u00b72\u00b73', detail: 'Vul in de formule in' },
  { label: 'D = 25 \u2212 24 = 1', detail: 'Bereken: D > 0, dus 2 oplossingen' },
  { label: 'x = (\u22125 \u00b1 \u221a1) / (2\u00b72)', detail: 'Gebruik de abc-formule: x = (\u2212b \u00b1 \u221aD)/(2a)' },
  { label: 'x\u2081 = \u22121 en x\u2082 = \u22121.5', detail: 'Twee oplossingen omdat D = 1 > 0' }
]

// === Levels Definition ===
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const targets = [
    {
      targetSnijpunten: 2,
      goalText: 'Opdracht: Maak een parabool met exact 2 snijpunten met de x-as. Welk teken heeft de discriminant (D)?',
      successText: 'Correct! Als de grafiek 2 nulwaarden heeft, is de discriminant altijd strikt positief (D > 0).',
      // === PREDICTION GATE ===
      predictionQuestion: 'Voorspel: Hoeveel snijpunten verwacht je als D > 0?',
      predictionOptions: [0, 1, 2],
      predictionCorrect: 2,
      // === ERROR ANALYSIS ===
      commonErrors: [
        { condition: (a,b,c,d) => a === 0, 
          message: 'Let op! a = 0 maakt dit een rechte lijn, geen parabool. De discriminant-formule D = b\u00b2 \u2212 4ac geldt alleen voor kwadratische functies (a \u2260 0).' },
        { condition: (a,b,c,d) => d > 0 && d < 0.01,
          message: 'Bijna! D is heel klein positief. Herinner: D = b\u00b2 \u2212 4ac. Kijk of je c iets kunt aanpassen om D precies de juiste grootte te geven.' }
      ]
    },
    {
      targetSnijpunten: 1,
      goalText: 'Opdracht: Zorg dat de parabool de x-as op exact 1 punt raakt. Wat is D nu?',
      successText: 'Super! Bij 1 raakpunt / nulwaarde is de discriminant altijd exact nul (D = 0).',
      predictionQuestion: 'Voorspel: Wat is de discriminant als de parabool precies 1 raakpunt heeft?',
      predictionOptions: ['D > 0', 'D = 0', 'D < 0'],
      predictionCorrect: 'D = 0',
      commonErrors: [
        { condition: (a,b,c,d) => d > 0,
          message: 'Let op! D > 0 betekent 2 snijpunten. Voor 1 raakpunt moet D precies 0 zijn. Probeer b\u00b2 = 4ac te maken.' },
        { condition: (a,b,c,d) => d < 0,
          message: 'Let op! D < 0 betekent geen snijpunten. We zoeken exact 1 raakpunt. De discriminant moet precies 0 worden.' }
      ]
    },
    {
      targetSnijpunten: 0,
      goalText: 'Opdracht: Cre\u00eber een \u201czwevende\u201d parabool zonder nulwaarden (raakt de x-as nergens).',
      successText: 'Briljant! Geen snijpunten betekent dat de discriminant altijd strikt negatief is (D < 0).',
      predictionQuestion: 'Voorspel: Wat is het teken van D als de parabool de x-as nergens raakt?',
      predictionOptions: ['Positief (D > 0)', 'Nul (D = 0)', 'Negatief (D < 0)'],
      predictionCorrect: 'Negatief (D < 0)',
      commonErrors: [
        { condition: (a,b,c,d) => d >= 0,
          message: 'Let op! D = ' + d + ' is niet negatief. Voor een zwevende parabool moet D < 0. Probeer c groter te maken zodat b\u00b2 \u2212 4ac negatief wordt.' },
        { condition: (a,b,c,d) => d < 0 && Math.abs(c) > Math.abs(b),
          message: 'Goede richting! D is negatief. Zie je hoe een grote c-waarde D negatief maakt? b\u00b2 \u2212 4ac wordt negatief als ac groot genoeg is.' }
      ]
    }
  ]
  return targets[levelIndex]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// === PREDICTION GATE ===
const showPrediction = ref(true)
const predictionAnswer = ref(null)
const predictionRevealed = ref(false)
const predictionCorrect = ref(false)

function submitPrediction() {
  const correct = currentLevelData.value.predictionCorrect
  if (Array.isArray(correct)) {
    predictionCorrect.value = predictionAnswer.value === correct[currentInternalLevel.value]
  } else {
    predictionCorrect.value = predictionAnswer.value === correct
  }
  predictionRevealed.value = true
  showPrediction.value = false
}

// === User State ===
const valA = ref(1)
const valB = ref(0)
const valC = ref(0)

const discriminant = computed(() => {
  return (valB.value * valB.value) - (4 * valA.value * valC.value)
})

const graphPath = computed(() => {
  const points = [];
  for (let x = -10; x <= 10; x += 0.2) {
    let y = valA.value * x * x + valB.value * x + valC.value;
    if (y < -12 || y > 12) continue;
    const svgX = x * 20;
    const svgY = -y * 20;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
})

const roots = computed(() => {
  const d = discriminant.value;
  if (valA.value === 0) return [];
  if (d < 0) return [];
  if (d === 0) {
    return [ -valB.value / (2 * valA.value) ];
  }
  return [
    (-valB.value - Math.sqrt(d)) / (2 * valA.value),
    (-valB.value + Math.sqrt(d)) / (2 * valA.value)
  ];
})

// === METHOD-TEACHING HINTS (3 levels: concept, worked ex diff numbers, method with blank) ===
function getHintText(count) {
  const target = currentLevelData.value.targetSnijpunten
  if (count >= 8) {
    if (target === 2) return { type: 'info', text: 'Methode: D = b\u00b2 \u2212 4ac > 0. Probeer a = 1, b = 0, c = \u22124 zodat D = 0\u00b2 \u2212 4(1)(\u22124) = _ > 0.' }
    if (target === 1) return { type: 'info', text: 'Methode: D = b\u00b2 \u2212 4ac = 0. Probeer a = 1, b = 4, c = 4 zodat D = 4\u00b2 \u2212 4(1)(4) = _.' }
    return { type: 'info', text: 'Methode: D = b\u00b2 \u2212 4ac < 0. Probeer a = 1, b = 0, c = 4 zodat D = 0\u00b2 \u2212 4(1)(4) = _ < 0.' }
  } else if (count >= 5) {
    const d = discriminant.value
    if (target === 2) return { type: 'info', text: 'Je hebt D = ' + d + '. We zoeken D > 0. F(x) = ax\u00b2 + bx + c. In het voorbeeld was a=2,b=5,c=3 en D=1. Kun je c iets kleiner maken dan nu?' }
    if (target === 1) return { type: 'info', text: 'Je hebt D = ' + d + '. We zoeken D = 0. Probeer b\u00b2 gelijk te maken aan 4ac. Als a=1 en b=4, wat moet c dan zijn zodat 4\u00b2 = 4(1)(c)?' }
    return { type: 'info', text: 'Je hebt D = ' + d + '. We zoeken D < 0. Als je a=1, b=0 houdt, moet c > 0 zijn zodat \u22124(1)(c) < 0.' }
  } else if (count >= 2) {
    return { type: 'info', text: 'Concept: D = b\u00b2 \u2212 4ac vertelt ons hoeveel snijpunten de parabool heeft met de x-as. Gebruik de schuifregelaars om a, b, c aan te passen.' }
  }
  return { type: 'info', text: 'Verschuif de sliders a, b en c tot je het juiste aantal snijpunten hebt.' }
}

// === ERROR ANALYSIS ===
function checkErrorConditions(a, b, c, d) {
  const errors = currentLevelData.value.commonErrors
  for (const err of errors) {
    if (err.condition(a, b, c, d)) {
      // Track which error was triggered
      if (err.message.includes('a = 0')) wrongCounters.value.signFlip++
      else if (err.message.includes('D > 0')) wrongCounters.value.halfB++
      else if (err.message.includes('D < 0')) wrongCounters.value.productMix++
      return err.message
    }
  }
  return null
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false;
celebrationDone.value = false
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Verschuif de sliders a, b en c.' }
  showPrediction.value = true
  predictionAnswer.value = null
  predictionRevealed.value = false
  predictionCorrect.value = false
  showWorkedExample.value = currentInternalLevel.value === 0
  workedStep.value = 0
  if (currentInternalLevel.value === 0) {
    valA.value = 1; valB.value = 0; valC.value = 2;
  } else if (currentInternalLevel.value === 1) {
    valA.value = 1; valB.value = 0; valC.value = -2;
  } else {
    valA.value = 1; valB.value = 0; valC.value = 0;
  }
}

function onSliderChanged() {
  if (isCorrect.value || showPrediction.value) return
  if (valA.value === 0) {
    feedback.value = { type: 'error', text: 'Let op! a = 0 maakt dit een rechte lijn, geen parabool. De discriminant bestaat niet voor rechten. Zet a op een andere waarde.' }
    return
  }
  attemptCount.value++

  const target = currentLevelData.value.targetSnijpunten
  const currentSnijpunten = roots.value.length

  if (currentSnijpunten === target) {
    isCorrect.value = true
    const d = discriminant.value
    const dText = d > 0 ? 'D > 0' : d < 0 ? 'D < 0' : 'D = 0'
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.successText + ' (Huidige waarden: a=' + valA.value + ', b=' + valB.value + ', c=' + valC.value + ', ' + dText + ')'
    }
  } else {
    // Check for specific error patterns first
    const errorMsg = checkErrorConditions(valA.value, valB.value, valC.value, discriminant.value)
    if (errorMsg) {
      feedback.value = { type: 'error', text: errorMsg }
    } else {
      feedback.value = getHintText(attemptCount.value)
    }
  }
}

// Debounced watch on sliders
const debounceTimer = ref(null)
watch([valA, valB, valC], () => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(onSliderChanged, 400)
})

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

// === LIFE CYCLE ===
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- === WORKED EXAMPLE (Phase 0) === -->
            <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 border border-indigo-200 bg-indigo-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" />
                <h4 class="font-bold text-indigo-800">Voorbeeld: D berekenen</h4>
              </div>
              <div class="space-y-2">
                <div v-for="(step, si) in workedSteps" :key="si"
                     @click="workedStep = si"
                     class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                     :class="workedStep === si ? 'bg-indigo-100' : 'hover:bg-indigo-100/50'">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                       :class="workedStep >= si ? 'bg-indigo-500 text-white' : 'bg-indigo-200 text-indigo-400'">
                    {{ si + 1 }}
                  </div>
                  <div>
                    <p class="text-sm font-medium" :class="workedStep === si ? 'text-indigo-900' : 'text-indigo-600'">{{ step.label }}</p>
                    <p v-if="workedStep === si" class="text-xs text-indigo-500 mt-0.5">{{ step.detail }}</p>
                  </div>
                </div>
              </div>
              <button @click="showWorkedExample = false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                Ik begrijp het. Start de oefening!
              </button>
            </div>

            <!-- === GOAL TEXT === -->
            <div v-if="!showWorkedExample" class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- === PREDICTION GATE === -->
            <div v-if="showPrediction && !showWorkedExample" class="mb-6 border border-amber-200 bg-amber-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <h4 class="font-bold text-amber-800">Voorspel eerst!</h4>
              </div>
              <p class="text-sm text-amber-700 mb-3">{{ currentLevelData.predictionQuestion }}</p>
              <div class="flex gap-2 flex-wrap">
                <button v-for="opt in currentLevelData.predictionOptions" :key="opt"
                        @click="predictionAnswer = opt"
                        class="px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all"
                        :class="predictionAnswer === opt ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-amber-200 bg-white text-amber-600 hover:border-amber-300'">
                  {{ opt }}
                </button>
              </div>
              <button v-if="predictionAnswer !== null && !predictionRevealed"
                      @click="submitPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors">
                Bevestig voorspelling
              </button>
              <div v-if="predictionRevealed" class="mt-3 p-3 rounded-lg text-sm font-medium"
                   :class="predictionCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                <span v-if="predictionCorrect">Juist! Ga nu verder met de schuifregelaars.</span>
                <span v-else>Let op: denk nog eens na. Probeer de slider en ontdek het zelf!</span>
              </div>
            </div>

            <!-- === SLIDERS === -->
            <div v-if="!showWorkedExample && !showPrediction" class="space-y-6">

              <div class="text-center bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex flex-col gap-2">
                <p class="font-mono text-xl font-black text-slate-700">
                  f(x) = {{ valA }}x\u00b2 {{ valB >= 0 ? '+ ' + valB : '- ' + Math.abs(valB) }}x {{ valC >= 0 ? '+ ' + valC : '- ' + Math.abs(valC) }}
                </p>
                <div class="bg-slate-100 p-2 rounded-lg">
                  <p class="text-xs text-slate-500 mb-1">D = b\u00b2 - 4ac</p>
                  <p class="font-mono text-lg font-bold" :class="discriminant > 0 ? 'text-emerald-600' : (discriminant < 0 ? 'text-red-500' : 'text-blue-600')">
                    D = {{ discriminant }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter a: {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-teal-600">
              </div>
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter b: {{ valB }}</label>
                <input type="range" v-model.number="valB" min="-6" max="6" step="1" class="w-full accent-teal-600">
              </div>
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter c: {{ valC }}</label>
                <input type="range" v-model.number="valC" min="-6" max="6" step="1" class="w-full accent-teal-600">
              </div>
            </div>
          </div>

          <!-- === FOOTER === -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <!-- === CONCEPTUAL WHY EXPLANATION (after success) === -->
            <div v-if="isCorrect && !showWorkedExample"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-indigo-100 text-indigo-800 border border-indigo-200">
              <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <div>
                <p class="font-bold mb-1">Waarom werkt dit?</p>
                <p class="leading-relaxed">De discriminant D = b\u00b2 \u2212 4ac komt uit de abc-formule: x = (\u2212b \u00b1 \u221aD)/(2a). De \u221aD bepaalt of we 0, 1 of 2 oplossingen krijgen. D > 0 geeft een positieve \u221aD (2 opl.), D = 0 geeft \u221a0 = 0 (1 opl.), D < 0 geeft geen re\u00eble \u221aD (geen opl.).</p>
              </div>
            </div>

            <!-- === DEEP REFLECTION === -->
            <div v-if="isCorrect && currentInternalLevel === totalInternalLevels - 1"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-purple-100 text-purple-800 border border-purple-200">
              <PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <div>
                <p class="font-bold mb-1">Reflectie</p>
                <p class="leading-relaxed">Waarom vertelt D ons hoeveel snijpunten een parabool heeft, zonder dat we de hele abc-formule moeten uitrekenen? Omdat D = b\u00b2 \u2212 4ac de \u201cwortel-inhoud\u201d is: als die inhoud negatief is, kun je in \u211d geen wortel trekken. D vat dus in 1 getal het belangrijkste samen over de oplossingen.</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showPrediction && !showWorkedExample" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60" disabled>
                Pas a, b, c aan
              </button>

              <button v-else-if="isCorrect && !showWorkedExample" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- === RIGHT PANEL: GRAPH === -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="400" height="400" viewBox="-120 -120 240 240" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 13" :key="'v'+i" :x1="(i-7)*20" y1="-120" :x2="(i-7)*20" y2="120" />
                  <line v-for="i in 13" :key="'h'+i" x1="-120" :y1="(i-7)*20" x2="120" :y2="(i-7)*20" />
                </g>

                <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-120" x2="0" y2="120" stroke="#64748b" stroke-width="2" />

                <path v-if="valA !== 0" :d="graphPath" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-150" />
                <path v-else :d="graphPath" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8,4" class="transition-all duration-150" />

                <circle v-for="(root, index) in roots" :key="index" :cx="root*20" cy="0" r="6" fill="#f59e0b" stroke="white" stroke-width="2" class="transition-all duration-300 shadow-sm" />

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
