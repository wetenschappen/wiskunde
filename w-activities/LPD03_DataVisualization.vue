<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartBar, PhArrowClockwise, PhTable, PhSortAscending, PhLightbulb, PhQuestion, PhTrendUp
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'ICT: Data Visualiseren' },
  instruction: {
    type: String,
    default: 'Gebruik de ICT-knoppen (Staafdiagram, Sorteer) om de dataset te analyseren en beantwoord de vraag.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Bestudeer de data en voorspel het antwoord.' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showHint = ref(false)

// --- Phase management ---
// 'predict' → 'explore' → 'answer' → 'why' → 'reflect' → 'done'
const phase = ref('predict')

// --- Domain Data ---
const rawData = [
  { month: 'Jan', value: 85 }, { month: 'Feb', value: 72 },
  { month: 'Mrt', value: 65 }, { month: 'Apr', value: 50 },
  { month: 'Mei', value: 60 }, { month: 'Jun', value: 75 },
  { month: 'Jul', value: 80 }, { month: 'Aug', value: 95 },
  { month: 'Sep', value: 110 }, { month: 'Okt', value: 130 },
  { month: 'Nov', value: 105 }, { month: 'Dec', value: 90 }
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// --- Level Logic ---
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel(index) {
  const sorted = [...rawData].sort((a, b) => b.value - a.value)
  switch (index) {
    case 0: {
      const highest = sorted[0]
      const others = sorted.slice(1, 5).map(d => d.month)
      const opts = shuffle([highest.month, ...others])
      return {
        goalText: `Opdracht 1: Wat was de natste maand (hoogste neerslag)?`,
        options: opts,
        targetVal: highest.month,
        successMsg: `Juist! ${highest.month} heeft met ${highest.value} mm de meeste neerslag.`,
        whyText: `**Waarom:** Een staafdiagram (bar chart) vergelijkt categorieën door de hoogte van elke staaf. De hoogste staaf = de grootste waarde. Een lijndiagram toont trends over tijd, niet afzonderlijke vergelijkingen.`,
        reflectionQuestion: 'Waarom gebruik je een staafdiagram en geen lijndiagram om de natste maand te vinden?',
        hintLevels: [
          'Kijk naar de hoogste staaf in het staafdiagram. Welke maand hoort daarbij?',
          'Sorteer de data van hoog naar laag met de sorteer-knop. De bovenste is de natste maand.',
          'De natste maand heeft de langste staaf. Kijk naar de maand __ (hoogste waarde = __ mm).'
        ],
        // Level 2: identify trend
        level2: {
          question: 'Is de algemene trend van januari tot december stijgend, dalend of stabiel?',
          options: ['Stijgend', 'Dalend', 'Stabiel'],
          targetVal: 'Stijgend',
          hintLevels: [
            'Bekijk het algemene verloop van links naar rechts in de grafiek.',
            'Van januari (winter) naar december: de lijn gaat eerst omlaag, dan omhoog. Wat is het algemene patroon?',
            'Van jan (85) naar okt (130): de algemene trend is __ (ondanks een dip in april).'
          ]
        },
        // Level 3: choose BEST chart
        level3: {
          question: 'Welk grafiektype is het BESTE om de neerslag per maand te vergelijken?',
          options: ['Staafdiagram', 'Lijndiagram', 'Cirkeldiagram', 'Spreidingsdiagram'],
          targetVal: 'Staafdiagram',
          hintLevels: [
            'Welk type toont afzonderlijke categorieën (maanden) met hun waarde?',
            'Een lijndiagram toont trends, een cirkeldiagram toont delen van een geheel. Wat toont afzonderlijke maanden het best?',
            'Vergelijken van aparte categorieën: __ diagram is het beste.'
          ]
        },
        level2Why: '**Waarom:** De algemene trend is stijgend — ondanks een daling in de lente stijgt de neerslag van ca. 50 mm (april) naar ca. 130 mm (oktober).',
        level3Why: '**Waarom:** Een staafdiagram vergelijkt afzonderlijke categorieën (maanden). Een lijndiagram toont een trend over tijd. Een cirkeldiagram toont verhoudingen van een geheel. Kies het type dat past bij wat je wil tonen.'
      }
    }
    case 1: {
      const lowest = sorted[sorted.length - 1]
      const others = sorted.slice(0, 4).map(d => d.month)
      const opts = shuffle([lowest.month, ...others])
      return {
        goalText: `Opdracht 2: Wat was de droogste maand (laagste neerslag)?`,
        options: opts,
        targetVal: lowest.month,
        successMsg: `Juist! ${lowest.month} heeft met ${lowest.value} mm de minste neerslag.`,
        whyText: `**Waarom:** De kortste staaf in een staafdiagram wijst de laagste waarde aan. Let op de schaal van de y-as — die bepaalt hoe je de hoogte van de staven interpreteert.`,
        reflectionQuestion: 'Waarom is het belangrijk om naar de schaal van de y-as te kijken in een staafdiagram?',
        hintLevels: [
          'Welke staaf is het kortst? Of wat staat onderaan als je sorteert?',
          'Sorteer de data. De onderste heeft de laagste waarde.',
          'De droogste maand is __ met __ mm neerslag.'
        ],
        level2: {
          question: 'Is de neerslag in de zomermaanden (jun-aug) gemiddeld hoger of lager dan in de lente (mrt-mei)?',
          options: ['Hoger', 'Lager', 'Gelijk'],
          targetVal: 'Hoger',
          hintLevels: [
            'Bereken het gemiddelde van mrt-mei en jun-aug of vergelijk de staven.',
            'Lente: 65+50+60 = 175 mm. Zomer: 75+80+95 = 250 mm. Welk gemiddelde is hoger?',
            'Zomer (gem. __ mm) is __ dan lente (gem. 58,3 mm).'
          ]
        },
        level3: {
          question: 'Wil je het verschil in neerslag tussen de droogste en natste maand tonen. Welk grafiektype kies je?',
          options: ['Staafdiagram', 'Lijndiagram', 'Cirkeldiagram'],
          targetVal: 'Staafdiagram',
          hintLevels: [
            'Je moet twee specifieke waarden vergelijken. Welk type toont dat het duidelijkst?',
            'Een lijndiagram toont het verloop, maar accentueert het verschil niet zo goed als een...',
            'Twee aparte staven vergelijken: __ diagram.'
          ]
        },
        level2Why: '**Waarom:** De zomer (jun-aug: gem. 83,3 mm) heeft gemiddeld meer neerslag dan de lente (mrt-mei: gem. 58,3 mm). Het verschil is zichtbaar in de staafhoogtes.',
        level3Why: '**Waarom:** Een staafdiagram laat twee afzonderlijke waarden naast elkaar zien, waardoor het verschil direct opvalt. Een lijndiagram legt de nadruk op het verloop, niet op het verschil.'
      }
    }
    case 2: {
      const thresholds = [75, 85, 95, 105]
      const threshold = thresholds[Math.floor(Math.random() * thresholds.length)]
      const count = rawData.filter(d => d.value > threshold).length
      const opts = [...new Set(shuffle([String(count), String(count + 1), String(Math.max(count - 1, 0)), String(count + 2), String(Math.max(count - 2, 0))].slice(0, 5)))]
      while (opts.length < 4) {
        if (!opts.includes(String(opts.length))) opts.push(String(opts.length))
      }
      return {
        goalText: `Opdracht 3: Hoeveel maanden hadden MEER dan ${threshold} mm neerslag?`,
        options: opts.slice(0, 5),
        targetVal: String(count),
        successMsg: `Juist! ${count} maand(en) hadden meer dan ${threshold} mm neerslag.`,
        whyText: `**Waarom:** Door een drempelwaarde (horizontale lijn) te trekken, kan je in een staafdiagram snel zien welke staven erboven uitsteken. Dat is veel moeilijker in een tabel zonder visuele weergave.`,
        reflectionQuestion: `Welk grafiektype is het beste om te tonen hoeveel maanden boven een bepaalde grens zitten? Waarom?`,
        hintLevels: [
          `Tel het aantal staven dat hoger is dan ${threshold} mm. Je kan een denkbeeldige horizontale lijn trekken.`,
          `Sorteer de data. Hoeveel maanden hebben een waarde > ${threshold}? Bekijk de tabel.`,
          `Maanden > ${threshold} mm: __ (tel het aantal staven boven de grens).`
        ],
        level2: {
          question: 'Zou een lijndiagram of een staafdiagram beter zijn om deze drempelvraag te beantwoorden?',
          options: ['Staafdiagram', 'Lijndiagram', 'Beide even goed'],
          targetVal: 'Staafdiagram',
          hintLevels: [
            'Welk type toont afzonderlijke categorieën het best?',
            'Met een staafdiagram zie je direct welke staven boven de drempel uitsteken. Een lijndiagram toont vooral het verloop.',
            'Voor drempelwaarden: __ diagram werkt het best.'
          ]
        },
        level3: {
          question: 'Een onderzoeker heeft data over temperatuur per uur voor 1 jaar. Welk grafiektype is het BESTE om het patroon te zien?',
          options: ['Lijndiagram', 'Staafdiagram', 'Cirkeldiagram'],
          targetVal: 'Lijndiagram',
          hintLevels: [
            'Het gaat om een patroon over een doorlopende tijdsperiode (uren). Welk type toont verandering over tijd?',
            'Een staafdiagram toont afzonderlijke waarden. Voor een vloeiend verloop over tijd heb je een...',
            'Data over een doorlopende tijdsperiode: __ diagram.'
          ]
        },
        level2Why: '**Waarom:** Bij een staafdiagram kan je een horizontale drempellijn trekken en zie je meteen welke staven erboven uitkomen. Bij een lijndiagram is dat minder overzichtelijk.',
        level3Why: '**Waarom:** Een lijndiagram toont verandering over een continue tijdsas. Bij 8760 uren is een staafdiagram onleesbaar; de lijn vat de trend samen.'
      }
    }
    default:
      return { goalText: 'Opdracht', options: [], targetVal: '', hintLevels: ['', '', ''] }
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
  feedback.value = { type: 'info', text: 'Goed! Verken nu de grafieken om je antwoord te controleren.' }
}

// --- Answer state ---
const userSelection = ref('')
const userSelection2 = ref('')
const userSelection3 = ref('')
const currentSubLevel = ref(0) // 0 = main, 1 = level2, 2 = level3
const subLevelCorrect = ref([false, false, false])

const currentView = ref('table')
const isSorted = ref(false)

const displayData = computed(() => {
  let data = [...rawData]
  if (isSorted.value) data.sort((a, b) => b.value - a.value)
  return data
})

const maxValue = computed(() => Math.max(...rawData.map(d => d.value)))

function selectOption(opt) {
  if (isCorrect.value) return
  userSelection.value = opt
  isChecked.value = true

  if (currentSubLevel.value === 0 && opt === currentLevelData.value.targetVal) {
    subLevelCorrect.value[0] = true
    feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
    phase.value = 'why'
    isCorrect.value = true
    attemptCount.value = 0
  } else if (currentSubLevel.value === 1 && opt === currentLevelData.value.level2.targetVal) {
    subLevelCorrect.value[1] = true
    feedback.value = { type: 'success', text: currentLevelData.value.level2Why || 'Juist!' }
    // Check if level3 already done
    if (subLevelCorrect.value[2]) {
      phase.value = 'why'
      isCorrect.value = true
      showFinalWhy()
    } else {
      currentSubLevel.value = 2
      userSelection3.value = ''
      feedback.value = { type: 'info', text: 'Kies het beste grafiektype voor een nieuwe situatie.' }
    }
    attemptCount.value = 0
    hintCount.value = 0
    showHint.value = false
  } else if (currentSubLevel.value === 2 && opt === currentLevelData.value.level3.targetVal) {
    subLevelCorrect.value[2] = true
    if (subLevelCorrect.value[1]) {
      phase.value = 'why'
      isCorrect.value = true
      showFinalWhy()
    } else {
      feedback.value = { type: 'success', text: currentLevelData.value.level3Why || 'Juist!' }
      currentSubLevel.value = 1
      userSelection2.value = ''
      feedback.value = { type: 'info', text: currentLevelData.value.level2.question }
    }
    attemptCount.value = 0
    hintCount.value = 0
    showHint.value = false
  } else {
    attemptCount.value++
    hintCount.value = 0
    showHint.value = false
    const hints = getCurrentHints()
    const hintText = hints.length > 0 ? hints[Math.min(attemptCount.value - 1, 2)] || hints[0] : ''
    isCorrect.value = false

    // Error analysis
    const lvl = currentSubLevel.value
    const target = lvl === 0 ? currentLevelData.value.targetVal :
                   lvl === 1 ? currentLevelData.value.level2.targetVal :
                   currentLevelData.value.level3.targetVal

    if (lvl === 0 && opt === 'Staafdiagram' && target === 'Lijndiagram') {
      feedback.value = { type: 'error', text: 'Let op: een staafdiagram toont afzonderlijke categorieën. Voor een trend over tijd heb je een lijndiagram nodig. ' + hintText }
    } else if (lvl === 2 && opt === 'Staafdiagram' && target === 'Lijndiagram') {
      feedback.value = { type: 'error', text: 'Bij een doorlopende tijdsas is een lijndiagram vaak beter — de lijn toont het patroon. ' + hintText }
    } else if (lvl === 2 && opt === 'Cirkeldiagram' && target === 'Staafdiagram') {
      feedback.value = { type: 'error', text: 'Een cirkeldiagram toont delen van een geheel (procenten). Voor het vergelijken van waarden gebruik je een staafdiagram. ' + hintText }
    } else if (lvl === 2 && opt === 'Lijndiagram' && target === 'Staafdiagram') {
      feedback.value = { type: 'error', text: 'Een lijndiagram toont een trend. Voor afzonderlijke categorieën vergelijken is een staafdiagram duidelijker. ' + hintText }
    } else {
      feedback.value = { type: 'error', text: 'Niet correct. ' + hintText }
    }
  }
}

function getCurrentHints() {
  const lvl = currentSubLevel.value
  if (lvl === 0) return currentLevelData.value?.hintLevels || []
  if (lvl === 1 && currentLevelData.value?.level2) return currentLevelData.value.level2.hintLevels || []
  if (lvl === 2 && currentLevelData.value?.level3) return currentLevelData.value.level3.hintLevels || []
  return []
}

function showHintFn() {
  if (hintCount.value < 3) {
    hintCount.value++
    showHint.value = true
    const hints = getCurrentHints()
    const idx = Math.min(hintCount.value - 1, hints.length - 1)
    if (idx >= 0 && hints[idx]) {
      feedback.value = { type: 'info', text: hints[idx] }
    }
  }
}

function showFinalWhy() {
  const lvl = currentSubLevel.value
  const whyText = lvl === 2 ? (currentLevelData.value?.level3Why || '') :
                  lvl === 1 ? (currentLevelData.value?.level2Why || '') :
                  (currentLevelData.value?.whyText || '')
  if (whyText) {
    feedback.value = { type: 'success', text: whyText }
  }
  phase.value = 'why'
  isCorrect.value = true
}

// --- Phase handlers ---
const reflectionAnswer = ref('')
const reflectionDone = ref(false)

function submitReflection() {
  if (!reflectionAnswer.value || reflectionAnswer.value.length < 5) {
    feedback.value = { type: 'error', text: 'Schrijf een volledige zin om verder te gaan.' }
    return
  }
  reflectionDone.value = true
  phase.value = 'done'
  feedback.value = { type: 'success', text: 'Sterk! Door te reflecteren onthoud je beter welk grafiektype je wanneer moet gebruiken.' }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  showHint.value = false
  userSelection.value = ''
  userSelection2.value = ''
  userSelection3.value = ''
  currentSubLevel.value = 0
  subLevelCorrect.value = [false, false, false]
  prediction.value = ''
  predictionSubmitted.value = false
  phase.value = 'predict'
  feedback.value = { type: 'info', text: 'Bestudeer de data en voorspel het antwoord.' }
  isSorted.value = false
  reflectionAnswer.value = ''
  reflectionDone.value = false
}

function handleNext() {
  reflectionDone.value = false
  reflectionAnswer.value = ''
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++
    currentView.value = 'table'
    isSorted.value = false
    resetActivityState()
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
    currentView.value = 'table'
    isSorted.value = false
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 text-slate-800">
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
            <div v-if="currentInternalLevel === 0 && phase === 'predict'" class="p-4 mb-4 border border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <p class="text-sm font-bold text-amber-700 mb-2">Voorbeeld: Bar vs Lijndiagram</p>
              <p class="text-xs text-slate-600 leading-relaxed">
                <strong>Staafdiagram:</strong> toont elke maand als aparte staaf — ideaal om te vergelijken.<br/>
                <strong>Lijndiagram:</strong> verbindt de maanden met een lijn — toont de trend over tijd.<br/><br/>
                Beide gebruiken dezelfde data, maar tonen een ander inzicht. Kies het type op basis van je vraag!
              </p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <label class="text-sm font-bold text-slate-700">Voorspel eerst:</label>
              </div>
              <p class="text-xs text-slate-500 mb-4">Voordat je de grafieken bekijkt: wat denk je dat het antwoord is?</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="opt in (currentLevelData?.options || [])" :key="opt"
                  @click="prediction = opt"
                  class="px-4 py-3 border-2 rounded-lg font-medium transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  :class="prediction === opt ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-amber-300 bg-white text-slate-600'">
                  {{ opt }}
                </button>
              </div>
              <button v-if="prediction" @click="submitPrediction"
                      class="w-full mt-4 py-3 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig Voorspelling
              </button>
            </div>

            <!-- Answer Phase (explore + answer) -->
            <div v-if="phase === 'explore'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="flex items-center gap-2 mb-3">
                <label class="text-sm font-bold text-slate-700">
                  <template v-if="currentSubLevel === 0">
                    Jouw Antwoord:
                  </template>
                  <template v-else-if="currentSubLevel === 1">
                    Trendvraag (Level 2):
                  </template>
                  <template v-else>
                    Grafiektype (Level 3):
                  </template>
                </label>
              </div>
              <p v-if="currentSubLevel === 1" class="text-xs text-slate-500 mb-2">{{ currentLevelData?.level2?.question }}</p>
              <p v-if="currentSubLevel === 2" class="text-xs text-slate-500 mb-2">{{ currentLevelData?.level3?.question }}</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in (currentSubLevel === 0 ? currentLevelData?.options :
                                       currentSubLevel === 1 ? currentLevelData?.level2?.options :
                                       currentLevelData?.level3?.options || [])" :key="opt"
                        @click="selectOption(opt)"
                        class="p-3 border-2 rounded-lg font-bold transition-all text-left active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="userSelection === opt && isCorrect ? 'border-amber-500 bg-amber-50 text-amber-700' :
                               userSelection === opt && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' :
                               'border-slate-200 hover:border-amber-300 bg-white text-slate-700'">
                  {{ opt }}
                </button>
              </div>
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

              <!-- Show 'why' button -->
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
            </div>
          </div>
        </div>

        <!-- RIGHT MAIN AREA -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            <div class="flex-1 flex flex-col items-center justify-center w-full min-h-[500px] bg-white rounded-xl border-2 border-slate-200/50 p-6 shadow-sm">

              <!-- ICT Controls -->
              <div class="w-full max-w-4xl flex gap-4 mb-6">
                <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                  <button @click="currentView = 'table'"
                          class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500"
                          :class="currentView === 'table' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    <PhTable weight="bold" /> Ruwe Tabel
                  </button>
                  <button @click="currentView = 'bar'"
                          class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500"
                          :class="currentView === 'bar' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    <PhChartBar weight="bold" /> Staafdiagram
                  </button>
                </div>
                <button @click="isSorted = !isSorted"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm border shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500"
                        :class="isSorted ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'">
                  <PhSortAscending weight="bold" /> {{ isSorted ? 'Sortering Uit' : 'Sorteer Data' }}
                </button>
              </div>

              <!-- Visualisation Area -->
              <div class="w-full max-w-4xl flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col p-6">

                <!-- TABLE VIEW -->
                <div v-if="currentView === 'table'" class="flex-1 overflow-auto animate-fadeIn">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b-2 border-slate-300 text-slate-500 uppercase text-xs tracking-wider">
                        <th class="p-4">Maand</th>
                        <th class="p-4">Neerslag (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="d in displayData" :key="d.month"
                          class="border-b border-slate-200 hover:bg-white transition-colors">
                        <td class="p-4 font-bold text-slate-700">{{ d.month }}</td>
                        <td class="p-4 text-slate-600">{{ d.value }} mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- BAR CHART VIEW -->
                <div v-else-if="currentView === 'bar'" class="flex-1 flex items-end gap-2 px-4 pt-10 pb-6 border-b-2 border-slate-400 relative animate-fadeIn">
                  <!-- Grid lines -->
                  <div class="absolute inset-x-4 inset-y-10 flex flex-col justify-between pointer-events-none z-0">
                    <div v-for="i in 5" :key="i" class="border-t border-slate-200/60 w-full h-0 relative">
                      <div v-if="i===4 && currentInternalLevel===2" class="absolute inset-x-0 border-t-2 border-dashed border-amber-500"></div>
                      <span v-if="i===4 && currentInternalLevel===2" class="absolute -top-4 right-0 text-xs font-bold text-amber-600 bg-white px-1">{{  }}{{ currentLevelData?.goalText?.match(/\d+/)?.[0] || '' }}</span>
                    </div>
                  </div>

                  <div v-for="d in displayData" :key="d.month"
                       class="flex-1 flex flex-col items-center justify-end h-full z-10 group relative transition-all duration-500 ease-out"
                       :style="{ height: `${(d.value / maxValue) * 100}%` }">
                    <div class="w-full bg-amber-500 rounded-t-sm shadow-md group-hover:bg-amber-400 transition-colors h-full flex flex-col items-center justify-start pt-2">
                      <span class="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded-lg -translate-y-8 absolute pointer-events-none transition-opacity">{{ d.value }}mm</span>
                    </div>
                    <span class="absolute -bottom-6 text-xs font-bold text-slate-500">{{ d.month }}</span>
                  </div>
                </div>

              </div>

            </div>
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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
