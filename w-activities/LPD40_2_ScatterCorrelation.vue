<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTrendUp,
  PhArrowClockwise,
  PhDetective
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Spreidingsdiagram en Correlatie'
  },
  instruction: {
    type: String,
    default: 'Leer correlaties herkennen, verbanden beoordelen en uitschieters vinden.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhTrendUp }
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
const predictedType = ref('')
const showData = ref(false)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 5

const hintLevels = [
  'Correlatie gaat over de richting (positief/negatief) en sterkte (sterk/zwak). Sterk = punten liggen dicht bij een lijn.',
  'Voorbeeld: lengte en gewicht hebben een positieve, matige correlatie (r ~ 0.7). Schoenmaat en intelligentie hebben geen correlatie (r ~ 0.0).',
  'Positief = stijgende lijn (beide stijgen). Negatief = dalende lijn (een stijgt, ander daalt). Geen = willekeurige wolk (r ~ 0).'
]

const correlationOptions = [
  'Sterk positief (r ~ 0.9)',
  'Matig positief (r ~ 0.5)',
  'Geen correlatie (r ~ 0)',
  'Matig negatief (r ~ -0.5)',
  'Sterk negatief (r ~ -0.9)'
]

// Helper: generate scatter points
function generateScatter(targetR, count = 30) {
  const points = []
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 80 + 10
    const noise = (Math.random() - 0.5) * (1 - Math.abs(targetR)) * 120
    let y
    if (targetR >= 0) {
      y = x + noise * 0.5 + (1 - Math.abs(targetR)) * 20
    } else {
      y = (100 - x) + noise * 0.5 + (1 - Math.abs(targetR)) * 20
    }
    y = Math.max(5, Math.min(95, y))
    points.push({ x, y })
  }
  return points
}

const levels = [
  {
    id: 1,
    name: 'Correlatie Herkennen',
    context: 'Onderzoek naar de relatie tussen aantal uren studie per week en examenscore (%).',
    predictionPrompt: 'Wat voor verband verwacht je tussen studietijd en examenscore?',
    dataDescription: '20 studenten: hun studietijd (uren/week) en examenscore (%).',
    targetCategory: 'Sterk positief (r ~ 0.9)',
    targetR: 0.85,
    whyExplanation: 'Hoe meer uren studie, hoe hoger de score. Dit is een sterk positief verband: beide variabelen stijgen samen. Maar let op: correlatie is niet hetzelfde als causaliteit. Misschien studeren gemotiveerde studenten meer en scoren ze ook hoger door hun motivatie, niet alleen door de uren.',
    errorAnalysis: 'Een positieve correlatie betekent niet dat studeren de score veroorzaakt. Er kan een derde factor zijn (motivatie, intelligentie). Correlatie =/= causaliteit.',
    hasOutlier: false,
    workedExample: {
      description: 'Studietijd (x) vs Score (y): punten liggen dicht langs een stijgende lijn.',
      correct: 'Sterk positief (r ~ 0.9)',
      why: 'De punten volgen een duidelijke stijgende lijn. Hoe meer uren, hoe hoger de score.'
    }
  },
  {
    id: 2,
    name: 'Negatieve Correlatie',
    context: 'Verband tussen buitentemperatuur (graden) en verkoop van warme chocolademelk (bekers/dag).',
    predictionPrompt: 'Wat gebeurt er met de verkoop van warme chocola als de temperatuur stijgt?',
    dataDescription: '15 dagen: temperatuur vs verkochte bekers warme chocola.',
    targetCategory: 'Sterk negatief (r ~ -0.9)',
    targetR: -0.85,
    whyExplanation: 'Hoe warmer het buiten is, hoe minder warme chocola wordt verkocht. Negatieve correlatie: een variabele stijgt, de ander daalt. Dit is een logisch verband (mensen drinken warme dranken bij koud weer).',
    errorAnalysis: 'Negatieve correlatie betekent NIET "geen correlatie". Het is een duidelijk verband, alleen in dalende richting. Een sterke negatieve correlatie (r = -0.9) is even sterk als een sterke positieve (r = 0.9).',
    hasOutlier: false
  },
  {
    id: 3,
    name: 'Geen Correlatie',
    context: 'Verband tussen schoenmaat en IQ-score.',
    predictionPrompt: 'Is er een verband tussen schoenmaat en intelligentie?',
    dataDescription: '25 personen: schoenmaat vs IQ-score.',
    targetCategory: 'Geen correlatie (r ~ 0)',
    targetR: 0.0,
    whyExplanation: 'Schoenmaat en IQ hebben geen verband. De punten vormen een willekeurige wolk zonder duidelijke richting. Dit is een klassiek voorbeeld van twee variabelen die niets met elkaar te maken hebben. Het is belangrijk om te herkennen wanneer er gewoon GEEN verband is.',
    errorAnalysis: 'Sommige mensen denken dat grotere schoenmaat = slimmer (of dommer), maar dat is bijgeloof. De data toont geen enkel verband (r ≈ 0).',
    hasOutlier: false
  },
  {
    id: 4,
    name: 'Uitschieters Detecteren',
    context: 'Onderzoek naar de relatie tussen leeftijd (jaren) en jaarlijks inkomen (x EUR 1000).',
    predictionPrompt: 'Bekijk de puntenwolk. Zie je een uitschieter — een punt dat niet past bij het patroon?',
    dataDescription: '20 personen: leeftijd vs inkomen. Let op: een punt wijkt sterk af.',
    targetCategory: 'Matig positief (r ~ 0.5)',
    targetR: 0.45,
    whyExplanation: 'Over het algemeen stijgt inkomen met leeftijd (tot een bepaalde leeftijd). Er is een uitschieter: een 22-jarige met een zeer hoog inkomen (bv. een topatleet of ondernemer). Deze uitschieter trekt de correlatie omhoog en verstoort het algemene patroon. Uitschieters herkennen is essentieel voor een correcte interpretatie.',
    errorAnalysis: 'Een uitschieter kan de correlatie sterk beinvloeden. Het is belangrijk om uitschieters te herkennen en te beslissen of ze meetellen of een speciaal geval zijn.',
    hasOutlier: true,
    outlierHint: 'Zoek naar een punt dat ver van de anderen ligt — bijvoorbeeld een jonge persoon met een hoog inkomen.'
  },
  {
    id: 5,
    name: 'Correlatie vs Causaliteit',
    context: 'Uit een onderzoek blijkt: hoe meer ijsjes worden verkocht, hoe meer verdrinkingen er zijn.',
    predictionPrompt: 'Betekent dit dat ijsjes eten leidt tot verdrinking?',
    dataDescription: 'Zomermaanden: ijsverkoop (x 1000 stuks) vs aantal verdrinkingen per maand.',
    targetCategory: 'Sterk positief (r ~ 0.9)',
    targetR: 0.8,
    whyExplanation: 'Dit is een klassiek voorbeeld: ijsverkoop en verdrinkingen hebben een positieve correlatie, maar ijsjes veroorzaken geen verdrinkingen. De oorzaak is een derde factor: warm weer! Bij warm weer eten mensen meer ijs en gaan ze vaker zwemmen, waardoor er meer verdrinkingen zijn. Correlatie is NIET hetzelfde als causaliteit.',
    errorAnalysis: 'Altagdroom niet in de val dat correlatie = causaliteit. Zoek altijd naar een "derde variabele" die beide kan verklaren.',
    hasOutlier: false
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])
const scatterPoints = ref([])

function generateScatterForLevel() {
  const lvl = currentLevel.value
  if (!lvl) return
  scatterPoints.value = generateScatter(lvl.targetR, 20)
  if (lvl.hasOutlier) {
    // Replace one point with an outlier
    scatterPoints.value[3] = { x: 15, y: 85 } // young person with high income
  }
}

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
  predictedType.value = ''
  showData.value = false
  showWorkedExample.value = true
  generateScatterForLevel()
}

function commitPrediction() {
  if (!predictedType.value) return
  showPrediction.value = false
  showData.value = true
  feedback.value = { type: 'info', text: `Jouw voorspelling: ${predictedType.value}. Bekijk de puntenwolk en controleer.` }
}

function selectAnswer(answer) {
  if (isCorrect.value || showPrediction.value) return
  attemptCount.value++

  if (answer === currentLevel.value.targetCategory) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    // Error analysis
    if (attemptCount.value < 3) {
      let errorMsg = 'Dat is niet de juiste correlatie. '
      const answerIsPos = answer.includes('positief')
      const targetIsPos = currentLevel.value.targetCategory.includes('positief')
      const answerIsNeg = answer.includes('negatief')
      const targetIsNeg = currentLevel.value.targetCategory.includes('negatief')

      if (currentLevel.value.targetCategory.includes('Geen') && !answer.includes('Geen')) {
        errorMsg += 'De punten vormen geen duidelijke lijn. Ze zijn willekeurig verspreid. Kijk naar willekeur (r ≈ 0).'
      } else if (answerIsNeg && targetIsPos) {
        errorMsg += 'Het verband is stijgend (positief), niet dalend. Bij een hogere x hoort een hogere y.'
      } else if (answerIsPos && targetIsNeg) {
        errorMsg += 'Het verband is dalend (negatief), niet stijgend. Bij een hogere x hoort een lagere y.'
      } else if (currentLevel.value.hasOutlier) {
        errorMsg += 'Let op de uitschieter! Een punt wijkt sterk af. Hoe beinvloedt dit het algemene patroon?'
      } else {
        errorMsg += 'Kijk naar de richting (stijgend/dalend) en hoe dicht de punten bij een lijn liggen.'
      }
      feedback.value = { type: 'error', text: errorMsg }
    } else {
      feedback.value = { type: 'error', text: `Het juiste antwoord is: ${currentLevel.value.targetCategory}. ${currentLevel.value.whyExplanation.substring(0, 120)}...` }
    }
    hintCount.value++
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Kun je een conclusie trekken uit een positieve correlatie?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Mooie reflectie! Correlatie is een krachtig maar vaak verkeerd begrepen concept.' }
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
    predictedType.value = ''
    showData.value = false
    showWorkedExample.value = true
    nextTick(() => mainArea.value?.focus())
    generateScatterForLevel()
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function showHint() {
  if (isCorrect.value || !currentLevel.value) return
  const idx = Math.min(hintCount.value, hintLevels.length - 1)
  hintCount.value++
  if (idx >= 0 && idx < hintLevels.length) {
    let msg = hintLevels[idx]
    if (currentLevel.value.hasOutlier && idx === 0) {
      msg = currentLevel.value.outlierHint
    }
    feedback.value = { type: 'info', text: msg }
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
  predictedType.value = ''
  showData.value = false
  generateScatterForLevel()
  nextTick(() => mainArea.value?.focus())
}

watch(() => currentInternalLevel.value, () => {
  generateScatterForLevel()
})

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
            <p class="text-xs font-medium text-slate-500">Niveau {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
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
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">{{ currentLevel.name }}</h3>

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorbeeld Correlatie</p>
            <p class="text-xs text-amber-700 mb-2">{{ levels[0].workedExample.description }}</p>
            <p class="text-xs text-amber-700"><strong>Antwoord:</strong> {{ levels[0].workedExample.correct }}</p>
            <p class="text-xs text-amber-700">{{ levels[0].workedExample.why }}</p>
            <p class="text-xs text-amber-700 mt-1">De stippellijn toont de best passende lijn (trendlijn).</p>
          </div>

          <!-- Context -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <p class="text-sm text-slate-700">{{ currentLevel.context }}</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-4">{{ currentLevel.predictionPrompt }}</p>
            <div class="flex flex-col gap-2 mb-4">
              <button v-for="opt in correlationOptions" :key="opt"
                      @click="predictedType = opt"
                      class="p-3 text-sm rounded-lg transition-all border-2 text-left"
                      :class="predictedType === opt ? 'border-amber-500 bg-amber-100 text-amber-800 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                {{ opt }}
              </button>
            </div>
            <button @click="commitPrediction"
                    :disabled="!predictedType"
                    class="w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Voorspelling
            </button>
          </div>

          <!-- Answer Selection -->
          <div v-if="showData" class="space-y-4">
            <p class="text-sm text-slate-600">{{ currentLevel.dataDescription }}</p>

            <div v-if="currentLevel.hasOutlier" class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-xs font-bold text-amber-800">Let op: een uitschieter!</p>
              <p class="text-xs text-amber-700">Een punt wijkt sterk af van het patroon. Kun je het vinden in de grafiek?</p>
            </div>

            <div>
              <p class="font-bold text-slate-700 mb-2">Welke correlatie zie je?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in correlationOptions" :key="opt"
                        @click="selectAnswer(opt)"
                        :disabled="isCorrect"
                        class="p-3 border-2 rounded-lg font-bold transition-all text-left text-sm active:scale-[0.98]"
                        :class="isCorrect && opt === currentLevel.targetCategory ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  {{ opt }}
                  <span v-if="isCorrect && opt === currentLevel.targetCategory" class="ml-2 text-amber-600">&#10003;</span>
                </button>
              </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="isCorrect" class="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-amber-800 text-sm mb-1">Waarom?</p>
              <p class="text-sm text-amber-700">{{ currentLevel.whyExplanation }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">Kun je een conclusie trekken uit een positieve correlatie? Waarom wel of niet?</p>
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

            <button v-if="!isCorrect && showData"
                    @click="showHint"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98]">
              Hint nodig?
            </button>

            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Niveau' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
            <div class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[420px] h-[420px] p-8">
              <svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible">
                <line x1="5" y1="95" x2="95" y2="95" stroke="#94a3b8" stroke-width="0.8" />
                <line x1="5" y1="5" x2="5" y2="95" stroke="#94a3b8" stroke-width="0.8" />

                <!-- Trend line when correct -->
                <line v-if="isCorrect && currentLevel.targetR !== 0"
                      :x1="10"
                      :y1="currentLevel.targetR > 0 ? 12 : 88"
                      :x2="90"
                      :y2="currentLevel.targetR > 0 ? 88 : 12"
                      stroke="#d97706" stroke-width="1" stroke-dasharray="3,2" />

                <!-- Scatter points -->
                <circle v-for="(pt, idx) in scatterPoints" :key="idx"
                        :cx="pt.x" :cy="100 - pt.y" r="2.8"
                        :class="currentLevel.hasOutlier && idx === 3 ? 'fill-red-500' : 'fill-amber-500'"
                        class="transition-all duration-200" />

                <!-- Highlight outlier -->
                <circle v-if="currentLevel.hasOutlier"
                        cx="15" cy="15" r="8" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2" class="animate-pulse" />
              </svg>
              <div class="absolute bottom-2 right-2 text-xs font-bold text-slate-400">Variabele X</div>
              <div class="absolute top-4 left-1 text-xs font-bold text-slate-400" style="writing-mode: vertical-rl;">Variabele Y</div>
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
