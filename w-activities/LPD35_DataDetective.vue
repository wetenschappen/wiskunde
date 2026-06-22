<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartLineUp, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Data & Statistiek: De Data-Detective' },
  instruction: {
    type: String,
    default: 'Grafieken aflezen is meer dan alleen getallen zoeken. Je moet ze kunnen interpreteren!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartLineUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionChecked = ref(false)
const showPrediction = ref(true)
const predictedCorrect = ref(null)
const showFullData = ref(false)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const hintLevels = [
  'Vergelijk elke dag met de vorige. Is de trend overal hetzelfde? Zoek naar een uitzondering.',
  'Voorbeeld: data = [10, 12, 15, 14, 18]. De stijging wordt onderbroken op dag 4 (14 < 15).',
  'Kijk naar de dag waar de richting verandert. Op dag __ is de temperatuur lager dan de dag ervoor.'
]

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const levels = ref([])

function generateLevel(levelNum) {
  const base = levelNum === 0 ? r(8, 15) : levelNum === 1 ? r(12, 25) : r(5, 12)
  const data = []
  for (let i = 0; i < 5; i++) {
    const prev = i === 0 ? base : data[i - 1].temp
    const delta = r(-3, 5)
    data.push({ day: ['Ma', 'Di', 'Wo', 'Do', 'Vr'][i], temp: Math.max(1, prev + delta) })
  }

  const alwaysRising = data.every((v, i) => i === 0 || v.temp > data[i - 1].temp)
  const alwaysNonDecreasing = data.every((v, i) => i === 0 || v.temp >= data[i - 1].temp)
  const alwaysFalling = data.every((v, i) => i === 0 || v.temp < data[i - 1].temp)

  const claimTypes = [
    { text: 'steeg elke dag', check: alwaysRising },
    { text: 'daalde nooit', check: alwaysNonDecreasing },
    { text: 'werd elke dag kouder', check: alwaysFalling },
  ]

  const ct = claimTypes[r(0, claimTypes.length - 1)]
  const correctAnswer = !ct.check
  const claim = `"De temperatuur ${ct.text}."`

  const violationIdx = (() => {
    for (let i = 1; i < data.length; i++) {
      if (ct.text.includes('steeg') && data[i].temp <= data[i - 1].temp) return i
      if (ct.text.includes('daalde') && data[i].temp < data[i - 1].temp) return i
      if (ct.text.includes('kouder') && data[i].temp >= data[i - 1].temp) return i
    }
    return 0
  })()

  const chartLabel = levelNum === 0 ? 'Temperatuur (graden Celsius)' : levelNum === 1 ? 'Uitgaven (EUR)' : 'Bezoekersaantal (personen)'

  return {
    name: `Niveau ${levelNum + 1}`,
    chartLabel,
    claim,
    data,
    correctAnswer,
    violationIdx,
    whyExplanation: correctAnswer
      ? `De bewering klopt niet. De grafiek toont een algemene stijging, maar er zit een uitzondering. Op ${['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag'][violationIdx]} is de richting anders. Het is belangrijk om niet alleen naar het algemene patroon te kijken, maar ook naar elke dag afzonderlijk. Algemene trends vertellen niet het volledige verhaal.`
      : `De bewering klopt! De data toont geen enkele uitzondering. Je hebt de grafiek correct geinterpreteerd door systematisch elke dag te controleren. Dit is de juiste aanpak: niet naar het geheel kijken, maar naar elk datapunt.`,
    errorAnalysis: correctAnswer
      ? 'Let op: de algemene trend is stijgend, maar er is een dag waar het tijdelijk daalt. Een bewering als "steeg elke dag" betekent dat ALLE dagen een stijging tonen. Het is een veelgemaakte fout om een algemene trend te verwarren met "elke dag".'
      : 'De bewering is correct! Soms is de verleiding groot om een uitzondering te zoeken die er niet is. Vertrouw op wat de data zegt, niet op je vooroordeel.',
    workedExample: {
      data: [5, 8, 12, 11, 15],
      claim: '"De temperatuur steeg elke dag."',
      correct: false,
      why: 'Van woensdag (12) naar donderdag (11) daalt de temperatuur. De bewering "elke dag" betekent dat ALLE dagen een stijging tonen. Eén dalende dag is genoeg om de bewering onjuist te maken.'
    }
  }
}

const currentLevel = computed(() => {
  if (!levels.value[currentInternalLevel.value]) return null
  return levels.value[currentInternalLevel.value]
})
const points = computed(() => currentLevel.value ? currentLevel.value.data : [])

function resetActivityState() {
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: 'Analyseer de grafiek en beoordeel de uitspraak.' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedCorrect.value = null
  showFullData.value = false
  showWorkedExample.value = true
}

function commitPrediction() {
  if (predictedCorrect.value === null) return
  showPrediction.value = false
  showFullData.value = true
  const pred = predictedCorrect.value ? 'Klopt' : 'Klopt niet'
  feedback.value = { type: 'info', text: `Jouw voorspelling: "${pred}". Bekijk nu de grafiek in detail en controleer of je voorspelling klopt.` }
}

function checkAnswer(ans) {
  if (isCorrect.value) return
  attemptCount.value++

  if (ans === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    // Error analysis: detect jumping to conclusions
    if (attemptCount.value === 1) {
      const misdirection = ans === true
        ? 'Je denkt dat de bewering klopt, maar kijk nog eens naar elke dag afzonderlijk. ' + currentLevel.value.errorAnalysis
        : 'Je denkt dat de bewering niet klopt, maar kijk nog eens goed. ' + currentLevel.value.errorAnalysis
      feedback.value = { type: 'error', text: misdirection }
    } else if (attemptCount.value === 2) {
      feedback.value = {
        type: 'error',
        text: `Let op het verschil tussen "algemene trend" en "elke dag". ${currentLevel.value.errorAnalysis}`
      }
    } else {
      const correctLabel = currentLevel.value.correctAnswer ? 'klopt NIET' : 'KLOPT wel'
      feedback.value = {
        type: 'error',
        text: `Het juiste antwoord is: de bewering ${correctLabel}. ${currentLevel.value.whyExplanation}`
      }
    }
    hintCount.value++
  }
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    feedback.value = { type: 'error', text: 'Probeer wat uitgebreider te antwoorden. Hoe weet je zeker dat je conclusie juist is? Wat zou je doen als je twijfelt?' }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Goede reflectie! Kritisch denken over data is een belangrijke vaardigheid.' }
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
    predictedCorrect.value = null
    showFullData.value = false
    showWorkedExample.value = true
    nextTick(() => mainArea.value?.focus())
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
  if (hintCount.value >= 3) return
  const idx = hintCount.value
  hintCount.value++
  if (idx >= 0 && idx < hintLevels.length) {
    feedback.value = { type: 'info', text: hintLevels[idx] }
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
  predictedCorrect.value = null
  showFullData.value = false
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
            <p class="text-xs font-medium text-slate-500">Zaak {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
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
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Data Detective</h3>

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Uitgewerkt Voorbeeld</p>
            <p class="text-xs text-amber-700 mb-1">Data: [5, 8, 12, 11, 15]</p>
            <p class="text-xs text-amber-700 mb-1">Claim: "De temperatuur steeg elke dag."</p>
            <p class="text-xs text-amber-700"><strong>Antwoord:</strong> Klopt niet.</p>
            <p class="text-xs text-amber-700"><strong>Waarom:</strong> Van woensdag (12) naar donderdag (11) daalt de temperatuur. De bewering "elke dag" betekent dat ALLE dagen een stijging tonen. Het weglaten van een daling is een veelgemaakte fout: de algemene trend is stijgend, maar de claim geldt voor elke dag afzonderlijk.</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-2">De uitspraak: <strong>{{ currentLevel.claim }}</strong></p>
            <p class="text-xs text-amber-600 mb-4">Denk na over wat de uitspraak precies betekent voordat je de grafiek ziet. Wat voorspel je?</p>
            <div class="flex gap-2">
              <button @click="predictedCorrect = true"
                      class="flex-1 p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedCorrect === true ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Klopt
              </button>
              <button @click="predictedCorrect = false"
                      class="flex-1 p-4 rounded-lg font-bold transition-all border-2"
                      :class="predictedCorrect === false ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'">
                Klopt Niet
              </button>
            </div>
            <button @click="commitPrediction"
                    :disabled="predictedCorrect === null"
                    class="mt-3 w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Voorspelling
            </button>
          </div>

          <!-- Data + Answer -->
          <div v-if="showFullData" class="space-y-4">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-sm font-bold text-slate-700 mb-2">Uitspraak:</p>
              <p class="text-sm text-slate-600 mb-3">{{ currentLevel.claim }}</p>
              <div class="p-2 bg-amber-50 rounded-lg">
                <p class="text-xs text-amber-700">Jouw voorspelling: <strong>{{ predictedCorrect ? 'Klopt' : 'Klopt Niet' }}</strong></p>
              </div>
            </div>

            <div>
              <p class="font-bold text-slate-700 mb-2">Wat is je eindoordeel?</p>
              <div class="flex gap-2">
                <button @click="checkAnswer(true)"
                        :disabled="isCorrect"
                        class="flex-1 p-4 border-2 rounded-lg font-bold transition-all active:scale-[0.98]"
                        :class="isCorrect && currentLevel.correctAnswer === true ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  Klopt
                </button>
                <button @click="checkAnswer(false)"
                        :disabled="isCorrect"
                        class="flex-1 p-4 border-2 rounded-lg font-bold transition-all active:scale-[0.98]"
                        :class="isCorrect && currentLevel.correctAnswer === false ? 'border-amber-500 bg-amber-100 text-amber-800' : (!isCorrect ? 'border-slate-200 hover:border-slate-300 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400')">
                  Klopt Niet
                </button>
              </div>
            </div>

            <!-- Why -->
            <div v-if="isCorrect" class="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-amber-800 text-sm mb-1">Waarom?</p>
              <p class="text-sm text-amber-700">{{ currentLevel.whyExplanation }}</p>
            </div>

            <!-- Reflection -->
            <div v-if="showReflection" class="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
              <p class="font-bold text-slate-700 mb-2">Reflecteer:</p>
              <p class="text-sm text-slate-600 mb-3">Hoe weet je zeker dat je conclusie juist is? Wat zou je doen als je twijfelt over een bewering bij een grafiek?</p>
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
            <button v-if="!isCorrect && showFullData"
                    @click="showHint"
                    :disabled="hintCount >= 3"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50">
              {{ hintCount >= 3 ? 'Geen hints meer' : 'Hint nodig?' }}
            </button>
            <button v-if="isCorrect" @click="handleNext"
                    class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgende Zaak' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl bg-white shadow-md rounded-xl border-4 border-slate-300 p-8 flex flex-col items-center">
            <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6">{{ currentLevel.chartLabel }}</h4>
            <div class="relative">
              <svg width="480" height="280" viewBox="0 0 480 280" class="block">
                <g stroke="#f1f5f9" stroke-width="2">
                  <line v-for="i in 5" :key="'hg'+i" x1="50" :y1="230 - (i-1)*40" x2="430" :y2="230 - (i-1)*40" />
                </g>
                <line x1="50" y1="230" x2="460" y2="230" stroke="#475569" stroke-width="3" />
                <line x1="50" y1="230" x2="50" y2="30" stroke="#475569" stroke-width="3" />
                <g font-size="12" fill="#64748b" font-weight="bold" text-anchor="end">
                  <text x="40" y="234">0</text>
                  <text x="40" y="194">5</text>
                  <text x="40" y="154">10</text>
                  <text x="40" y="114">15</text>
                  <text x="40" y="74">20</text>
                </g>
                <g font-size="14" fill="#475569" font-weight="bold" text-anchor="middle">
                  <text v-for="(pt, idx) in points" :key="'xt'+idx" :x="50 + idx * 80 + 40" y="250">{{ pt.day }}</text>
                </g>
                <polyline
                  fill="none" stroke="#d97706" stroke-width="4" stroke-linejoin="round"
                  :points="points.map((pt, idx) => `${50 + idx * 80 + 40},${230 - pt.temp * 10}`).join(' ')" />
                <g v-for="(pt, idx) in points" :key="'pt'+idx">
                  <circle :cx="50 + idx * 80 + 40" :cy="230 - pt.temp * 10" r="6" fill="#92400e" stroke="white" stroke-width="2" />
                  <text :x="50 + idx * 80 + 40" :y="230 - pt.temp * 10 - 15" text-anchor="middle" font-weight="bold" fill="#92400e" font-size="12">{{ pt.temp }}</text>
                </g>
                <circle v-if="isCorrect && !currentLevel.correctAnswer"
                        :cx="50 + (currentLevel.violationIdx === 0 ? 1 : currentLevel.violationIdx) * 80 + 40"
                        :cy="230 - (currentLevel.data[currentLevel.violationIdx === 0 ? 1 : currentLevel.violationIdx].temp * 10)"
                        r="35" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="4 4" class="animate-pulse" />
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
