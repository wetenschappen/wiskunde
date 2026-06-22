<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhChartBar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Statistiek: Frequentietabellen' },
  instruction: { type: String, default: 'Bouw en interpreteer frequentietabellen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhTable }
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
const predictedCount = ref(null)
const showRawData = ref(false)
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Hint Level 1 — Absolute frequency
const hintLevels1 = [
  'Maak een turftelling: zet een streepje voor elke keer dat een waarde voorkomt in de lijst. Begin bij de eerste categorie.',
  'Voorbeeld: data = [A, B, A, C, A, B]. Turf: A: ||| = 3, B: || = 2, C: | = 1.',
  'Tel systematisch. Begin met de eerste categorie en ga door de lijst. Aantal __ = __, aantal __ = __.'
]

// Hint Level 2 — Relative frequency
const hintLevels2 = [
  'Relatieve frequentie = absolute frequentie / totaal aantal. Deel elke frequentie door het totaal.',
  'Voorbeeld: 3 van 7 = 3/7 = 0,43. Bij jou: deel elke absolute frequentie door het totaal (___ ).',
  'Deel de frequentie van elke categorie door het totaal (___ ). Rond af op 2 decimalen.'
]

// Hint Level 3 — Cumulative frequency + median
const hintLevels3 = [
  'Cumulatieve frequentie = optellen van frequenties van laag naar hoog. De mediaan is de waarde op de middelste positie.',
  'Voorbeeld: cumulatief = [2, 5, 9, 12]. Bij 12 waarden is mediaan tussen 6e en 7e = categorie 3.',
  'Tel op: __ + __ = __, ... De helft van het totaal is __. In welke categorie valt de __e positie?'
]

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const categories = ['Hond', 'Kat', 'Vis', 'Vogel', 'Konijn']

function generateLevel(levelNum) {
  const counts = levelNum === 0
    ? [r(2, 4), r(2, 5), r(1, 3), r(1, 3)]
    : levelNum === 1
    ? [r(4, 7), r(3, 6), r(2, 5), r(3, 5)]
    : [r(6, 10), r(5, 8), r(3, 6), r(2, 5), r(2, 4)]

  const cats = levelNum === 2 ? categories : categories.slice(0, 4)
  const raw = shuffle(
    cats.flatMap((c, i) => Array(counts[i]).fill(c))
  )

  const freq = cats.map((c, i) => ({ category: c, count: counts[i] }))
  const total = counts.reduce((a, b) => a + b, 0)

  let cumSum = 0
  const cumFreq = freq.map(f => { cumSum += f.count; return { ...f, cum: cumSum } })

  const medianPos = total / 2
  let medianCat = ''
  for (const f of cumFreq) {
    if (f.cum >= Math.ceil(medianPos)) {
      medianCat = f.category
      break
    }
  }

  const relFreq = freq.map(f => ({ ...f, rel: Math.round((f.count / total) * 100) / 100 }))

  return {
    name: `Niveau ${levelNum + 1}`,
    raw,
    freq,
    cumFreq,
    relFreq,
    cats,
    total,
    medianCat,
    predictionQuestion: levelNum === 0
      ? `Hoeveel keer denk je dat "${cats[0]}" voorkomt in de data?`
      : levelNum === 1
      ? `Welke diersoort heeft de hoogste relatieve frequentie (in %)?`
      : `Wat is de mediaan van deze data (de middelste waarde)?`,
    whyExplanation: levelNum === 0
      ? 'Absolute frequentie = hoeveelheid. Het vertelt hoe vaak een waarde voorkomt. Dit is de basis voor alle statistiek. Door systematisch te tellen en een turftabel te gebruiken, voorkom je fouten zoals dubbel tellen.'
      : levelNum === 1
      ? 'Relatieve frequentie = deel van het geheel. Relatieve frequentie (fractie of procent) maakt het mogelijk om datasets van verschillende groottes te vergelijken. Percentages zijn vaak duidelijker dan absolute aantallen.'
      : 'Cumulatieve frequentie = opgeteld. Het telt alle waarden tot en met een categorie op. De mediaan is de waarde op de middelste positie. Bij een cumulatieve tabel zoek je de categorie waar de helft van de data zit.',
    errorAnalysis: levelNum === 0
      ? 'Dubbel tellen of een waarde overslaan zijn veelgemaakte fouten. Werk systematisch: ga de lijst van boven naar beneden en turf elke waarde.'
      : levelNum === 1
      ? 'Verwar absolute en relatieve frequentie niet. 3 van de 10 is niet hetzelfde als 3%: het is 3/10 = 30%. Deel altijd door het totaal!'
      : 'De mediaan is niet de middelste waarde in de tabel, maar de waarde op de middelste POSITIE in de geordende data. De cumulatieve frequentie helpt je die positie te vinden.',
    workedExample: {
      raw: ['Hond', 'Kat', 'Hond', 'Vis', 'Kat', 'Kat', 'Hond'],
      absTable: 'Hond: 3, Kat: 3, Vis: 1',
      relTable: 'Hond: 3/7 = 43%, Kat: 3/7 = 43%, Vis: 1/7 = 14%',
      cumTable: 'Hond: 3, Kat: 6, Vis: 7, Mediaan (4e) = Kat'
    }
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const rawData = computed(() => currentLevel.value ? currentLevel.value.raw : [])

const userFreqs = ref([])
const userRelFreqs = ref([])
const userCumFreqs = ref([])
const userMedian = ref('')

function resetActivityState() {
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
  isCorrect.value = false
  celebrationDone.value = false
  feedback.value = { type: 'info', text: 'Tel de data en vul de tabel in.' }
  attemptCount.value = 0
  hintCount.value = 0
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionChecked.value = false
  showPrediction.value = true
  predictedCount.value = null
  showRawData.value = false
  showWorkedExample.value = true
  userFreqs.value = []
  userRelFreqs.value = []
  userCumFreqs.value = []
  userMedian.value = ''
}

function commitPrediction() {
  if (currentInternalLevel.value === 0 && (predictedCount.value === null || predictedCount.value === '')) return
  showPrediction.value = false
  showRawData.value = true
  if (currentInternalLevel.value === 0) {
    feedback.value = { type: 'info', text: `Jouw schatting: ${predictedCount.value}. Tel nu de data en vul de tabel in.` }
  } else {
    feedback.value = { type: 'info', text: `Vul de tabel in op basis van de data.` }
  }
}

function checkAbsoluteFreqs() {
  if (isCorrect.value) return
  attemptCount.value++

  const lvl = currentLevel.value
  let allFilled = true
  let allCorrect = true
  let totalEntered = 0

  for (let i = 0; i < lvl.cats.length; i++) {
    const val = userFreqs.value[i]
    if (val === undefined || val === null || val === '') {
      allFilled = false
      continue
    }
    totalEntered += Number(val)
    if (Number(val) !== lvl.freq[i].count) {
      allCorrect = false
    }
  }

  if (!allFilled) {
    feedback.value = { type: 'error', text: `Vul alle velden in de tabel in. ${hintLevels1[Math.min(attemptCount.value - 1, 2)]}` }
    return
  }

  // Error analysis: check if total is wrong (double counting)
  if (totalEntered !== lvl.total) {
    feedback.value = {
      type: 'error',
      text: `Let op: de som van je frequenties is ${totalEntered}, maar de totale data heeft ${lvl.total} items. Je hebt waarschijnlijk dubbel geteld of iets overgeslagen. ${hintLevels1[Math.min(attemptCount.value - 1, 2)]}`
    }
    hintCount.value++
    return
  }

  if (allCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    const errorText = attemptCount.value < 3
      ? `Niet alle frequenties kloppen. ${hintLevels1[Math.min(attemptCount.value - 1, 2)]}`
      : `De juiste frequenties: ${lvl.freq.map(f => `${f.category}: ${f.count}`).join(', ')}.`
    feedback.value = { type: 'error', text: errorText }
    hintCount.value++
  }
}

function checkRelativeFreqs() {
  if (isCorrect.value) return
  attemptCount.value++

  const lvl = currentLevel.value
  let allFilled = true
  let allCorrect = true
  let totalRel = 0

  for (let i = 0; i < lvl.cats.length; i++) {
    const val = userRelFreqs.value[i]
    if (val === undefined || val === null || val === '') {
      allFilled = false
      continue
    }
    totalRel += Number(val)
    if (Math.abs(Number(val) - lvl.relFreq[i].rel) > 0.01) {
      allCorrect = false
    }
  }

  if (!allFilled) {
    feedback.value = { type: 'error', text: `Vul alle relatieve frequenties in. ${hintLevels2[Math.min(attemptCount.value - 1, 2)]}` }
    return
  }

  // Error analysis: check if they add to ~1
  if (Math.abs(totalRel - 1) > 0.05) {
    feedback.value = {
      type: 'error',
      text: `De som van relatieve frequenties moet 1 (of 100%) zijn, maar jouw som is ${totalRel.toFixed(2)}. Relatieve frequenties geven het deel van het geheel aan, dus samen moeten ze het geheel vormen. ${hintLevels2[Math.min(attemptCount.value - 1, 2)]}`
    }
    hintCount.value++
    return
  }

  if (allCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else {
    const errorText = attemptCount.value < 3
      ? `Niet alle relatieve frequenties kloppen. ${hintLevels2[Math.min(attemptCount.value - 1, 2)]}`
      : `Relatieve frequenties: ${lvl.relFreq.map(f => `${f.category}: ${(f.rel * 100).toFixed(0)}%`).join(', ')}.`
    feedback.value = { type: 'error', text: errorText }
    hintCount.value++
  }
}

function checkCumulativeFreqs() {
  if (isCorrect.value) return
  attemptCount.value++

  const lvl = currentLevel.value
  let allFilled = true
  let allCorrect = true

  for (let i = 0; i < lvl.cats.length; i++) {
    const val = userCumFreqs.value[i]
    if (val === undefined || val === null || val === '') {
      allFilled = false
      continue
    }
    if (Number(val) !== lvl.cumFreq[i].cum) {
      allCorrect = false
    }
  }

  if (!allFilled) {
    feedback.value = { type: 'error', text: `Vul alle cumulatieve frequenties in. ${hintLevels3[Math.min(attemptCount.value - 1, 2)]}` }
    return
  }

  // Check if cumulatives are increasing
  let notIncreasing = false
  for (let i = 1; i < userCumFreqs.value.length; i++) {
    if (Number(userCumFreqs.value[i]) < Number(userCumFreqs.value[i - 1])) {
      notIncreasing = true
    }
  }
  if (notIncreasing) {
    feedback.value = {
      type: 'error',
      text: `Cumulatieve frequenties moeten steeds groter worden (of gelijk blijven). Ze zijn de optelsom van alle voorgaande frequenties. ${hintLevels3[0]}`
    }
    hintCount.value++
    return
  }

  const medianCorrect = userMedian.value.toLowerCase().trim() === lvl.medianCat.toLowerCase()

  if (allCorrect && medianCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Correct! ${currentLevel.value.whyExplanation}`
    }
    showReflection.value = true
  } else if (!medianCorrect && allCorrect) {
    const half = lvl.total / 2
    if (attemptCount.value < 3) {
      feedback.value = {
        type: 'error',
        text: `De cumulatieve frequenties kloppen, maar de mediaan niet. De mediaan is de waarde op de ${Math.ceil(half)}e positie van ${lvl.total}. In welke categorie valt die positie?`
      }
    } else {
      feedback.value = {
        type: 'error',
        text: `Mediaan = ${lvl.medianCat}. Total = ${lvl.total}, helft = ${half}. De categorie waar de ${Math.ceil(half)}e waarde valt is de mediaan.`
      }
    }
    hintCount.value++
  } else {
    const errorText = attemptCount.value < 3
      ? `Niet alle cumulatieve frequenties kloppen. ${hintLevels3[Math.min(attemptCount.value - 1, 2)]}`
      : `Cumulatieve frequenties: ${lvl.cumFreq.map(f => `${f.category}: ${f.cum}`).join(', ')}.`
    feedback.value = { type: 'error', text: errorText }
    hintCount.value++
  }
}

function checkLevel() {
  if (currentInternalLevel.value === 0) checkAbsoluteFreqs()
  else if (currentInternalLevel.value === 1) checkRelativeFreqs()
  else checkCumulativeFreqs()
}

function checkReflection() {
  reflectionChecked.value = true
  if (reflectionAnswer.value.trim().length < 5) {
    const q = currentInternalLevel.value === 0
      ? 'Wat is het verschil tussen absolute en relatieve frequentie?'
      : currentInternalLevel.value === 1
      ? 'Waarom is relatieve frequentie nuttig bij het vergelijken van datasets van verschillende groottes?'
      : 'Hoe helpt cumulatieve frequentie bij het vinden van de mediaan?'
    feedback.value = { type: 'error', text: `Probeer wat uitgebreider te antwoorden. ${q}` }
    reflectionChecked.value = false
    return
  }
  feedback.value = { type: 'success', text: 'Mooie reflectie! Frequentietabellen zijn de basis van data-analyse.' }
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
    feedback.value = { type: 'info', text: 'Tel de data en vul de tabel in.' }
    attemptCount.value = 0
    hintCount.value = 0
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionChecked.value = false
    showPrediction.value = true
    predictedCount.value = null
    showRawData.value = false
    showWorkedExample.value = true
    userFreqs.value = []
    userRelFreqs.value = []
    userCumFreqs.value = []
    userMedian.value = ''
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
  if (isCorrect.value || !currentLevel.value || hintCount.value >= 3) return
  const hints = currentInternalLevel.value === 0 ? hintLevels1
    : currentInternalLevel.value === 1 ? hintLevels2
    : hintLevels3
  const idx = hintCount.value
  hintCount.value++
  if (idx >= 0 && idx < hints.length) {
    feedback.value = { type: 'info', text: hints[idx] }
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
  predictedCount.value = null
  showRawData.value = false
  userFreqs.value = []
  userRelFreqs.value = []
  userCumFreqs.value = []
  userMedian.value = ''
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
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">
            {{ currentInternalLevel === 0 ? 'Absolute Frequentie' : currentInternalLevel === 1 ? 'Relatieve Frequentie' : 'Cumulatieve Frequentie' }}
          </h3>

          <!-- Worked Example -->
          <div v-if="showWorkedExample && currentInternalLevel === 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="font-bold text-amber-800 text-sm mb-2">Uitgewerkt Voorbeeld</p>
            <p class="text-xs text-amber-700 mb-1">Ruwe data: [Hond, Kat, Hond, Vis, Kat, Kat, Hond]</p>
            <p class="text-xs text-amber-700"><strong>Absolute frequenties:</strong> Hond: 3, Kat: 3, Vis: 1</p>
            <p class="text-xs text-amber-700"><strong>Relatieve frequenties:</strong> Hond: 3/7=43%, Kat: 3/7=43%, Vis: 1/7=14%</p>
            <p class="text-xs text-amber-700"><strong>Cumulatieve frequenties:</strong> Hond: 3, Kat: 6, Vis: 7. Mediaan (4e) = Kat</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction && currentInternalLevel === 0" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">Voorspel eerst!</p>
            <p class="text-sm text-amber-700 mb-2">Schat hoeveel keer <strong>"{{ currentLevel.cats[0] }}"</strong> voorkomt in de data, voordat je gaat tellen.</p>
            <p class="text-xs text-amber-600 mb-4">Denk na: is het een veel voorkomende of zeldzame categorie in deze dataset?</p>
            <input type="number" v-model.number="predictedCount"
                   class="w-full p-4 border-2 border-amber-200 rounded-lg text-center font-bold text-lg focus:border-amber-500 outline-none"
                   placeholder="Typ je schatting...">
            <button @click="commitPrediction"
                    :disabled="predictedCount === null || predictedCount === ''"
                    class="mt-3 w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 disabled:opacity-50 active:scale-[0.98]">
              Bevestig Schatting
            </button>
          </div>

          <!-- Level 2 and 3: Simple start button -->
          <div v-if="showPrediction && currentInternalLevel > 0" class="p-6 border border-amber-200 bg-amber-50 rounded-xl shadow-inner">
            <p class="font-bold text-amber-800 mb-3">{{ currentLevel.predictionQuestion }}</p>
            <button @click="commitPrediction"
                    class="w-full py-3 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 active:scale-[0.98]">
              Start Level {{ currentInternalLevel + 1 }}
            </button>
          </div>

          <!-- Data + Table -->
          <div v-if="showRawData" class="space-y-4">
            <div class="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 text-sm mb-2">Ruwe Data:</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="(item, idx) in rawData" :key="idx"
                      class="bg-white px-3 py-1 rounded-lg font-mono text-sm font-bold text-slate-600 border border-slate-300">
                  {{ item }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-2">Totaal: {{ currentLevel.total }}</p>
            </div>

            <!-- Level 1: Absolute Frequency Table -->
            <div v-if="currentInternalLevel === 0" class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 mb-3">Absolute Frequentietabel:</p>
              <div class="flex flex-col gap-3">
                <div v-for="(cat, idx) in currentLevel.cats" :key="cat"
                     class="flex items-center justify-between">
                  <span class="font-bold text-slate-700">{{ cat }}</span>
                  <input type="number" v-model.number="userFreqs[idx]"
                         :disabled="isCorrect"
                         class="w-20 p-2 border-2 rounded-lg focus:border-amber-500 outline-none text-center font-bold"
                         :class="isCorrect && userFreqs[idx] === currentLevel.freq[idx].count ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-slate-200'">
                </div>
              </div>
            </div>

            <!-- Level 2: Relative Frequency -->
            <div v-if="currentInternalLevel === 1" class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 mb-3">Relatieve Frequentie (als decimaal, bv. 0.43):</p>
              <div class="flex flex-col gap-3">
                <div v-for="(cat, idx) in currentLevel.cats" :key="cat"
                     class="flex items-center justify-between">
                  <span class="font-bold text-slate-700">{{ cat }} ({{ currentLevel.freq[idx].count }}/{{ currentLevel.total }})</span>
                  <input type="number" v-model.number="userRelFreqs[idx]" step="0.01"
                         :disabled="isCorrect"
                         class="w-24 p-2 border-2 rounded-lg focus:border-amber-500 outline-none text-center font-bold"
                         :class="isCorrect && Math.abs(Number(userRelFreqs[idx]) - currentLevel.relFreq[idx].rel) < 0.01 ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-slate-200'">
                </div>
              </div>
            </div>

            <!-- Level 3: Cumulative Frequency + Median -->
            <div v-if="currentInternalLevel === 2" class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="font-bold text-slate-700 mb-3">Cumulatieve Frequentietabel:</p>
              <div class="flex flex-col gap-3">
                <div v-for="(cat, idx) in currentLevel.cats" :key="cat"
                     class="flex items-center justify-between">
                  <span class="font-bold text-slate-700">{{ cat }} (cumulatief)</span>
                  <input type="number" v-model.number="userCumFreqs[idx]"
                         :disabled="isCorrect"
                         class="w-20 p-2 border-2 rounded-lg focus:border-amber-500 outline-none text-center font-bold"
                         :class="isCorrect && Number(userCumFreqs[idx]) === currentLevel.cumFreq[idx].cum ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-slate-200'">
                </div>
              </div>
              <div class="mt-4">
                <p class="font-bold text-slate-700 mb-2">Mediaan (welke categorie?):</p>
                <select v-model="userMedian" :disabled="isCorrect"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg font-bold focus:border-amber-500 outline-none bg-white">
                  <option value="" disabled>Kies categorie</option>
                  <option v-for="cat in currentLevel.cats" :key="cat" :value="cat">{{ cat }}</option>
                </select>
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
              <p class="text-sm text-slate-600 mb-3">
                {{ currentInternalLevel === 0 ? 'Wat is het verschil tussen absolute en relatieve frequentie?'
                : currentInternalLevel === 1 ? 'Waarom is relatieve frequentie nuttig bij het vergelijken van datasets van verschillende groottes?'
                : 'Hoe helpt cumulatieve frequentie bij het vinden van de mediaan?' }}
              </p>
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
            <button v-if="!isCorrect && showRawData"
                    @click="showHint"
                    :disabled="hintCount >= 3"
                    class="px-4 py-4 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50">
              {{ hintCount >= 3 ? 'Geen hints meer' : 'Hint nodig?' }}
            </button>
            <button v-if="!isCorrect && showRawData"
                    @click="checkLevel"
                    class="flex-1 py-4 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2">
              <PhChartBar weight="bold" /> Controleer
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
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-lg bg-white p-8 rounded-xl shadow-md border-4 border-slate-200 min-h-[300px]">
            <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6 text-center">
              {{ currentInternalLevel === 0 ? 'Staafdiagram' : currentInternalLevel === 1 ? 'Relatieve Frequentiestaven' : 'Cumulatief Frequentiepolygoon' }}
            </h4>
            <div class="w-full h-64 border-b-4 border-l-4 border-slate-600 relative flex items-end justify-around px-4 pb-0">
              <div class="absolute left-[-24px] top-0 bottom-0 w-6 flex flex-col justify-between items-end font-bold text-xs text-slate-400">
                <span>{{ currentLevel.total }}</span>
                <span>{{ Math.round(currentLevel.total * 2/3) }}</span>
                <span>{{ Math.round(currentLevel.total * 1/3) }}</span>
                <span>0</span>
              </div>
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                <div v-for="i in 3" :key="i" class="w-full h-0 border-t border-slate-200"></div>
              </div>
              <div v-for="(cat, idx) in currentLevel.cats" :key="cat"
                   class="w-12 bg-amber-400 rounded-t-sm shadow-md border-x-2 border-t-2 border-amber-500 relative z-10 transition-all duration-700 ease-out flex justify-center items-end pb-2"
                   :style="{ height: isCorrect ? `${(currentLevel.freq[idx].count / currentLevel.total) * 100}%` : '0%' }">
                <span v-if="isCorrect" class="text-white font-black drop-shadow-md text-sm">{{ currentLevel.freq[idx].count }}</span>
                <span class="absolute -bottom-8 font-bold text-slate-600 text-xs whitespace-nowrap">{{ cat }}</span>
              </div>
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
