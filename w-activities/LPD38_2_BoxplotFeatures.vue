<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhChartBar,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Centrum- en Spreidingsmaten (Boxplot)'
  },
  instruction: {
    type: String,
    default: 'Sleep de 5 grenzen naar de juiste posities. Elke level heeft een realistische context.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionChecked = ref(false)
const showPrediction = ref(true)
const predictedMedian = ref(null)
const showRealData = ref(false)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const hintLevels = [
  'De lijn in de box is de mediaan. De boxranden zijn Q1 en Q3. De uiteinden zijn min en max. Sorteer de data eerst.',
  'Voorbeeld: data = [2, 4, 6, 8, 10]: min=2, Q1=4, med=6, Q3=8, max=10. Pas dit toe op jouw data.',
  'Sorteer de data. Deel in twee helften. Mediaan = middenste. Q1 = midden van linkerhelft. Q3 = midden van rechterhelft. Min en max = uitersten.'
]

const levels = [
  {
    name: 'Niveau 1',
    context: 'Toetsresultaten (op 20) van 11 leerlingen in een klas.',
    data: [6, 8, 10, 12, 12, 14, 15, 16, 18, 19, 20],
    sortedData: [6, 8, 10, 12, 12, 14, 15, 16, 18, 19, 20],
    targets: { min: 6, q1: 10, med: 14, q3: 18, max: 20 },
    predictionQuestion: 'Bekijk de data. Wat denk je dat de mediaan (het midden) ongeveer is?',
    whyExplanation: 'De boxplot toont de spreiding. 50% van de data zit in de box (tussen Q1=10 en Q3=18). De mediaan=14 ligt mooi in het midden. De IQR=8 (Q3-Q1) vertelt hoe breed het middenstuk is. Hoe breder de box, hoe groter de spreiding van de middelste helft.',
    workedExample: {
      data: [3, 5, 7, 9, 11],
      targets: { min: 3, q1: 5, med: 7, q3: 9, max: 11 },
      datasetText: 'Scores: 3, 5, 7, 9, 11',
      explanation: 'De data is al gesorteerd. min=3, max=11. Mediaan=7 (middenste). Linkerhelft=[3,5] dus Q1=5. Rechterhelft=[9,11] dus Q3=9.'
    },
    axisMin: 0, axisMax: 25
  },
  {
    name: 'Niveau 2',
    context: 'Maandelijkse energiefactuur (EUR) van 10 gezinnen.',
    data: [45, 48, 52, 55, 58, 62, 65, 70, 78, 120],
    sortedData: [45, 48, 52, 55, 58, 62, 65, 70, 78, 120],
    targets: { min: 45, q1: 52, med: 60, q3: 70, max: 120 },
    predictionQuestion: 'Deze data heeft een uitschieter (EUR 120). Hoe beïnvloedt die de mediaan?',
    whyExplanation: 'Bij 10 waarden is de mediaan het gemiddelde van de 5e en 6e waarde: (58+62)/2=60. De uitschieter=120 trekt het gemiddelde omhoog, maar de mediaan blijft robuust. De box (IQR=18) toont waar de "normale" gezinnen zitten.',
    axisMin: 30, axisMax: 130,
    isEven: true
  },
  {
    name: 'Niveau 3',
    context: 'Temperaturen (graden Celsius) gemeten op 9 dagen in juli.',
    data: [18, 20, 22, 23, 25, 26, 27, 29, 31],
    sortedData: [18, 20, 22, 23, 25, 26, 27, 29, 31],
    targets: { min: 18, q1: 22, med: 25, q3: 29, max: 31 },
    predictionQuestion: 'Deze temperaturen stijgen regelmatig. Hoe breed zal de IQR ongeveer zijn?',
    whyExplanation: 'De IQR = Q3 - Q1 = 29 - 22 = 7 graden. Dit betekent dat de middelste 50% van de temperaturen binnen een bereik van 7 graden valt. De box is relatief breed, wat wijst op een gematigde spreiding. De mediaan=25 is de typische julitemperatuur.',
    axisMin: 10, axisMax: 40
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

// Slider state
const valMin = ref(0)
const valQ1 = ref(0)
const valMed = ref(0)
const valQ3 = ref(0)
const valMax = ref(0)

function resetActivityState() {
  isCorrect.value = false
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedMedian.value = null
  showRealData.value = false
  showWorkedExample.value = true

  const lvl = currentLevel.value
  const mid = (lvl.axisMax + lvl.axisMin) / 2
  valMin.value = mid - 10
  valQ1.value = mid - 5
  valMed.value = mid
  valQ3.value = mid + 5
  valMax.value = mid + 10
}

function commitPrediction() {
  if (predictedMedian.value === null || predictedMedian.value === '') return
  showPrediction.value = false
  showRealData.value = true
  feedback.value = { type: 'info', text: `Jouw schatting: mediaan ≈ ${predictedMedian.value}. Bekijk nu de echte data en stel de boxplot in.` }
}

// Auto-check on slider changes
watch([valMin, valQ1, valMed, valQ3, valMax], () => {
  if (isCorrect.value || !currentLevel.value || showPrediction.value) return
  const t = currentLevel.value.targets

  // Check ordering
  if (!(valMin.value <= valQ1.value && valQ1.value <= valMed.value && valMed.value <= valQ3.value && valQ3.value <= valMax.value)) {
    if (!feedback.value.text.includes('volgorde')) {
      feedback.value = { type: 'error', text: 'Let op de volgorde: Minimum ≤ Q1 ≤ Mediaan ≤ Q3 ≤ Maximum.' }
    }
    return
  }

  const allCorrect = (
    Math.abs(valMin.value - t.min) < 0.5 &&
    Math.abs(valQ1.value - t.q1) < 0.5 &&
    Math.abs(valMed.value - t.med) < 0.5 &&
    Math.abs(valQ3.value - t.q3) < 0.5 &&
    Math.abs(valMax.value - t.max) < 0.5
  )

  if (allCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  }
})

function showHint() {
  if (isCorrect.value || !currentLevel.value) return
  const idx = Math.min(hintCount.value, hintLevels.length - 1)
  hintCount.value++
  if (idx >= 0 && idx < hintLevels.length) {
    feedback.value = { type: 'info', text: hintLevels[idx] }
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Wat zegt de breedte van de box over de data?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Mooie reflectie! De IQR is een krachtige maat voor spreiding.' }
}

function handleNext() {
  if (showReflection.value && !reflectionChecked.value) {
    feedback.value = { type: 'error', text: 'Beantwoord eerst de reflectievraag.' }
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    isCorrect.value = false
    celebrationDone.value = false
    feedback.value = { type: 'info', text: '' }
    attemptCount.value = 0
    hintCount.value = 0
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionChecked.value = false
    showPrediction.value = true
    predictedMedian.value = null
    showRealData.value = false
    showWorkedExample.value = true
    const lvl = currentLevel.value
    const mid = (lvl.axisMax + lvl.axisMin) / 2
    valMin.value = mid - 10
    valQ1.value = mid - 5
    valMed.value = mid
    valQ3.value = mid + 5
    valMax.value = mid + 10
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function resetLevel() {
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedMedian.value = null
  showRealData.value = false
  const lvl = currentLevel.value
  const mid = (lvl.axisMax + lvl.axisMin) / 2
  valMin.value = mid - 10
  valQ1.value = mid - 5
  valMed.value = mid
  valQ3.value = mid + 5
  valMax.value = mid + 10
  nextTick(() => mainArea.value?.focus())
}

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
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
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
      <button @click="emit('close')"
              class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]">
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Boxplot Bouwen</h3>
          <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorbeeld Boxplot</p>
            <p class="text-xs text-amber-700 mb-1">{{ currentLevel.workedExample.datasetText }}</p>
            <div class="bg-white p-2 rounded mt-1">
              <p class="text-xs font-mono text-slate-700">min=3 | Q1=5 | med=7 | Q3=9 | max=11</p>
              <p class="text-xs text-slate-600 mt-1">IQR = 9-5 = 4. De box toont 50% van de data.</p>
            </div>
          </div>

          <!-- Context -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <p class="font-bold text-slate-700 text-sm">{{ currentLevel.context }}</p>
            <div v-if="showRealData" class="mt-3 bg-white p-3 border border-slate-200 rounded-lg">
              <p class="font-mono text-sm text-slate-700">{{ currentLevel.sortedData.join(', ') }}</p>
            </div>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Schat eerst!</p>
            <p class="text-sm text-amber-700 mb-4">{{ currentLevel.predictionQuestion }}</p>
            <input type="number" v-model.number="predictedMedian"
                   class="w-full p-4 border-2 border-amber-200 rounded-lg text-center font-bold text-lg focus:border-amber-500 outline-none"
                   placeholder="Typ je schatting...">
            <button @click="commitPrediction"
                    :disabled="predictedMedian === null || predictedMedian === ''"
                    class="mt-3 w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Schatting
            </button>
          </div>

          <!-- Sliders -->
          <div v-if="showRealData" class="space-y-4">
            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner">
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Minimum: <span class="font-mono text-amber-600">{{ valMin }}</span></label>
                <input type="range" v-model.number="valMin" :min="currentLevel.axisMin" :max="currentLevel.axisMax" step="0.5" class="w-full accent-amber-500">
              </div>
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Q1 (1e kwartiel): <span class="font-mono text-amber-600">{{ valQ1 }}</span></label>
                <input type="range" v-model.number="valQ1" :min="currentLevel.axisMin" :max="currentLevel.axisMax" step="0.5" class="w-full accent-amber-500">
              </div>
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Mediaan: <span class="font-mono text-amber-600">{{ valMed }}</span></label>
                <input type="range" v-model.number="valMed" :min="currentLevel.axisMin" :max="currentLevel.axisMax" step="0.5" class="w-full accent-amber-600">
              </div>
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Q3 (3e kwartiel): <span class="font-mono text-amber-600">{{ valQ3 }}</span></label>
                <input type="range" v-model.number="valQ3" :min="currentLevel.axisMin" :max="currentLevel.axisMax" step="0.5" class="w-full accent-amber-500">
              </div>
              <div>
                <label class="block mb-1 text-sm font-bold text-slate-700">Maximum: <span class="font-mono text-amber-600">{{ valMax }}</span></label>
                <input type="range" v-model.number="valMax" :min="currentLevel.axisMin" :max="currentLevel.axisMax" step="0.5" class="w-full accent-amber-500">
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="isCorrect" class="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-amber-800 text-sm mb-1">Waarom is dit belangrijk?</p>
              <p class="text-sm text-amber-700">{{ currentLevel.whyExplanation }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">Wat zegt een brede (grote) IQR over de data?</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionChecked"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionChecked" @click="checkReflection"
                      class="mt-2 w-full py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-[0.98]">
                Bevestig Reflectie
              </button>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text"
               class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
               role="status" aria-live="polite" aria-atomic="true"
               :class="{
                 'bg-amber-100 text-amber-800': feedback.type === 'success',
                 'bg-red-100 text-red-800': feedback.type === 'error',
                 'bg-slate-100 text-slate-800': feedback.type === 'info',
               }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-relaxed">{{ feedback.text }}</span>
          </div>

          <div class="flex items-center gap-4">
            <button @click="resetLevel" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]">
              <PhArrowClockwise />
            </button>

            <button v-if="!isCorrect && showRealData"
                    @click="showHint"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98]">
              Hint nodig?
            </button>

            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
            <div class="relative w-full max-w-2xl h-64 bg-white rounded-lg border border-slate-300 shadow-md flex flex-col items-center justify-center px-12">
              <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none" class="overflow-visible mt-10">
                <line x1="5" y1="80" x2="95" y2="80" stroke="#94a3b8" stroke-width="0.5" />
                <g :transform="`scale(${80 / (currentLevel.axisMax - currentLevel.axisMin)}, 1) translate(${-currentLevel.axisMin + 10}, 0)`">
                  <line v-for="i in 9" :key="i"
                        :x1="currentLevel.axisMin + ((currentLevel.axisMax - currentLevel.axisMin) / 8) * (i-1)" y1="78"
                        :x2="currentLevel.axisMin + ((currentLevel.axisMax - currentLevel.axisMin) / 8) * (i-1)" y2="82"
                        stroke="#94a3b8" stroke-width="0.3" />
                  <text v-for="i in 9" :key="'t'+i"
                        :x="currentLevel.axisMin + ((currentLevel.axisMax - currentLevel.axisMin) / 8) * (i-1)" y="95"
                        font-size="3.5" fill="#64748b" text-anchor="middle"
                        :transform="`scale(${0.0125 * (currentLevel.axisMax - currentLevel.axisMin)}, 1) translate(0, 0)`">
                    {{ Math.round(currentLevel.axisMin + ((currentLevel.axisMax - currentLevel.axisMin) / 8) * (i-1)) }}
                  </text>

                  <g class="transition-all duration-200">
                    <line v-if="valMin <= valQ1" :x1="valMin" y1="40" :x2="valQ1" y2="40" stroke="#d97706" stroke-width="1" />
                    <line v-if="valQ3 <= valMax" :x1="valQ3" y1="40" :x2="valMax" y2="40" stroke="#d97706" stroke-width="1" />
                    <line :x1="valMin" y1="30" :x2="valMin" y2="50" stroke="#d97706" stroke-width="1" />
                    <line :x1="valMax" y1="30" :x2="valMax" y2="50" stroke="#d97706" stroke-width="1" />
                    <rect v-if="valQ1 <= valQ3" :x="valQ1" y="20" :width="valQ3 - valQ1" height="40" fill="#fde68a" stroke="#d97706" stroke-width="1" opacity="0.8" />
                    <line v-if="valMed >= valQ1 && valMed <= valQ3" :x1="valMed" y1="18" :x2="valMed" y2="62" stroke="#b45309" stroke-width="2" />
                  </g>

                  <g v-if="isCorrect">
                    <circle :cx="currentLevel.targets.min" cy="40" r="1.5" fill="#d97706" />
                    <circle :cx="currentLevel.targets.q1" cy="40" r="1.5" fill="#d97706" />
                    <circle :cx="currentLevel.targets.med" cy="40" r="1.5" fill="#d97706" />
                    <circle :cx="currentLevel.targets.q3" cy="40" r="1.5" fill="#d97706" />
                    <circle :cx="currentLevel.targets.max" cy="40" r="1.5" fill="#d97706" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
