<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhChartBar, PhChartPie, PhChartLine, 
  PhArrowsHorizontal, PhTrendUp, PhCalculator,
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhShuffle, PhTrash, PhPlus, PhSparkle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentVisualization = ref('histogram')

// Dataset state
const dataset = ref([12, 15, 18, 22, 25, 28, 30, 35, 38, 42, 45, 50])
const userInput = ref('')
const datasetName = ref('Willekeurige dataset')

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const targetDataset = ref([])
const userMean = ref(null)
const userMedian = ref(null)
const userMode = ref(null)
const userRange = ref(null)
const userIQR = ref(null)
const userStdDev = ref(null)

// UX State
const tooltip = ref({ visible: false, content: '', x: 0, y: 0 })
const flashes = ref({})

// ==================== COMPUTED PROPERTIES ====================
const sortedData = computed(() => [...dataset.value].sort((a, b) => a - b))
const n = computed(() => dataset.value.length)

// Central measures
const mean = computed(() => {
  if (n.value === 0) return 0
  return dataset.value.reduce((sum, val) => sum + val, 0) / n.value
})

const median = computed(() => {
  if (n.value === 0) return 0
  const sorted = sortedData.value
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
})

const mode = computed(() => {
  if (n.value === 0) return 'Geen'
  const frequency = {}
  let maxFreq = 0
  let modes = []
  
  dataset.value.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val]
    }
  })
  
  if (maxFreq === 1 && n.value > 1) return 'Geen'
  
  Object.keys(frequency).forEach(key => {
    if (frequency[key] === maxFreq) {
      modes.push(parseFloat(key))
    }
  })

  if (modes.length === n.value && n.value > 1) return 'Geen'
  
  return modes.length === 1 ? modes[0] : modes
})

// Spread measures
const range = computed(() => {
  if (n.value < 2) return 0
  return Math.max(...dataset.value) - Math.min(...dataset.value)
})

const q1 = computed(() => {
  if (n.value < 2) return 0
  const sorted = sortedData.value
  const mid = Math.floor(n.value / 2)
  const lowerHalf = sorted.slice(0, mid)
  if (lowerHalf.length === 0) return sorted[0]
  const q1Mid = Math.floor(lowerHalf.length / 2)
  return lowerHalf.length % 2 === 0
    ? (lowerHalf[q1Mid - 1] + lowerHalf[q1Mid]) / 2
    : lowerHalf[q1Mid]
})

const q3 = computed(() => {
  if (n.value < 2) return 0
  const sorted = sortedData.value
  const mid = Math.floor(n.value / 2)
  const upperHalf = sorted.slice(n.value % 2 === 0 ? mid : mid + 1)
  if (upperHalf.length === 0) return sorted[n.value - 1]
  const q3Mid = Math.floor(upperHalf.length / 2)
  return upperHalf.length % 2 === 0
    ? (upperHalf[q3Mid - 1] + upperHalf[q3Mid]) / 2
    : upperHalf[q3Mid]
})

const iqr = computed(() => (n.value < 2 ? 0 : q3.value - q1.value))

const stdDev = computed(() => {
  if (n.value < 2) return 0
  const m = mean.value
  const variance = dataset.value.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (n.value -1) // Sample std dev
  return Math.sqrt(variance)
})

// Histogram bins
const histogramBins = computed(() => {
  if (n.value === 0) return []
  const min = Math.min(...dataset.value)
  const max = Math.max(...dataset.value)
  if (min === max) {
    return [{ start: min, end: min, count: n.value, midpoint: min}]
  }
  const binCount = Math.min(12, Math.max(5, Math.ceil(Math.sqrt(n.value))))
  const binWidth = (max - min) / binCount
  
  const bins = Array.from({ length: binCount }, (_, i) => {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    return { start: binStart, end: binEnd, count: 0, midpoint: (binStart + binEnd) / 2 }
  })

  dataset.value.forEach(val => {
    let binIndex = Math.floor((val - min) / binWidth)
    if (val === max) binIndex = binCount - 1 // Include max in last bin
    if (bins[binIndex]) {
      bins[binIndex].count++
    }
  })
  return bins
})

// Frequency for pie chart
const frequencyData = computed(() => {
  const freq = {}
  dataset.value.forEach(val => {
    freq[val] = (freq[val] || 0) + 1
  })
  return Object.entries(freq).map(([value, count]) => ({ value: parseFloat(value), count }))
})

const pieSlices = computed(() => {
  if (n.value === 0) return []
  let currentAngle = 0
  return frequencyData.value.map(d => {
    const angle = (d.count / n.value) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...d, startAngle, angle }
  })
})


// ==================== DATASET MANAGEMENT ====================
function addValue() {
  const values = userInput.value.split(/[,;\s]+/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
  if (values.length > 0) {
    dataset.value.push(...values)
    userInput.value = ''
  }
}

function removeValue(index) {
  dataset.value.splice(index, 1)
}

function clearDataset() {
  dataset.value = []
  datasetName.value = 'Lege dataset'
}

function generateRandomDataset() {
  const size = Math.floor(Math.random() * 20) + 15
  const newData = []
  const base = Math.floor(Math.random() * 50) + 10
  for (let i = 0; i < size; i++) {
    newData.push(Math.round(base + (Math.random() * 40 - 20) + Math.random() * 5))
  }
  dataset.value = newData
  datasetName.value = 'Willekeurige dataset'
  currentStep.value = 0
}

function loadPresetDataset(type) {
  const presets = {
    exam: { name: 'Examencijfers', data: [52, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95] },
    height: { name: 'Lengtes (cm)', data: [165, 168, 170, 172, 175, 176, 178, 180, 182, 185, 188, 190, 175, 176] },
    age: { name: 'Leeftijden', data: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    income: { name: 'Inkomsten (×100€)', data: [25, 28, 30, 32, 35, 38, 40, 45, 50, 55, 60, 80, 120] }
  }
  if (presets[type]) {
    dataset.value = [...presets[type].data]
    datasetName.value = presets[type].name
  }
  currentStep.value = 0
}

// ==================== CHALLENGE MODE ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  const size = Math.floor(Math.random() * 10) + 8
  targetDataset.value = []
  const base = Math.floor(Math.random() * 40) + 20
  for (let i = 0; i < size; i++) {
    targetDataset.value.push(Math.round(base + (Math.random() * 30 - 15)))
  }
  
  userMean.value = userMedian.value = userMode.value = userRange.value = userIQR.value = userStdDev.value = null;
}

function checkChallenge() {
  const tolerance = 0.5
  let correct = true
  let errors = []
  
  const originalData = dataset.value
  dataset.value = targetDataset.value
  
  if (challengeType.value === 'central') {
    if (Math.abs(userMean.value - mean.value) > tolerance) { correct = false; errors.push('gemiddelde') }
    if (Math.abs(userMedian.value - median.value) > tolerance) { correct = false; errors.push('mediaan') }
    const modeVal = typeof mode.value === 'number' ? mode.value : (Array.isArray(mode.value) ? mode.value[0] : 0)
    if (Math.abs(userMode.value - modeVal) > tolerance && mode.value !== 'Geen') { correct = false; errors.push('modus') }
  } else if (challengeType.value === 'spread') {
    if (Math.abs(userRange.value - range.value) > tolerance) { correct = false; errors.push('bereik') }
    if (Math.abs(userIQR.value - iqr.value) > tolerance) { correct = false; errors.push('IQR') }
    if (Math.abs(userStdDev.value - stdDev.value) > tolerance) { correct = false; errors.push('standaarddev.') }
  }
  
  dataset.value = originalData
  
  if (correct) {
    challengeSolved.value = true
    challengeFeedback.value = 'Uitstekend! Alle waarden zijn correct.'
  } else {
    challengeFeedback.value = `Bijna! Controleer je berekening voor: ${errors.join(', ')}.`
  }
}

// ==================== UX & VISUALS ====================
const svgWidth = 800
const svgHeight = 500

function showTooltip(evt, content) {
  if (!content) return
  tooltip.value = { visible: true, content, x: evt.clientX + 15, y: evt.clientY }
}
function hideTooltip() { tooltip.value.visible = false }
function moveTooltip(evt) {
  if (tooltip.value.visible) {
    tooltip.value.x = evt.clientX + 15
    tooltip.value.y = evt.clientY
  }
}

// Flash effect on stat change
const statsToWatch = { mean, median, stdDev, n, range, iqr, q1, q3 };
Object.entries(statsToWatch).forEach(([key, stat]) => {
  flashes.value[key] = false;
  watch(stat, (newVal, oldVal) => {
    if (newVal !== oldVal && props.isOpen) {
      flashes.value[key] = true;
      setTimeout(() => { flashes.value[key] = false; }, 700);
    }
  });
});

// ==================== LIFECYCLE ====================
watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
    nextTick(() => document.documentElement.requestFullscreen().catch(() => {}))
  } else if (!val && document.fullscreenElement) {
    document.exitFullscreen()
  }
}, { immediate: true })

onUnmounted(() => {
  if (document.fullscreenElement) document.exitFullscreen()
})

// ==================== ANALYSIS STEPS ====================
const analysisSteps = [
  {
    title: 'Centrale maatstaven',
    description: 'Vind het "centrum" van je data: gemiddelde, mediaan, en modus.',
    focus: 'central',
    instruction: 'Voeg een extreem hoge of lage waarde (een uitbijter) toe. Welke maatstaf verandert het meest?',
    details: [
      'Gemiddelde (x̄): De som van alle waarden gedeeld door het aantal. Gevoelig voor uitbijters.',
      'Mediaan: De middelste waarde in een gesorteerde dataset. Robuust tegen uitbijters.',
      'Modus: De waarde die het vaakst voorkomt. Handig voor categorische data.'
    ]
  },
  {
    title: 'Spreidingsmaatstaven',
    description: 'Meet hoe verspreid je data is.',
    focus: 'spread',
    instruction: 'Vergelijk een dataset met veel dezelfde getallen met een met zeer verschillende getallen. Zie het effect op de spreiding.',
    details: [
      'Bereik: Verschil tussen max en min. Simpel, maar gevoelig voor uitbijters.',
      'Interkwartielafstand (IQR): Het bereik van de middelste 50% van de data (Q3 - Q1). Robuuster.',
      'Standaarddeviatie (σ): De gemiddelde afstand tot het gemiddelde. De meest gebruikte spreidingsmaat.'
    ]
  },
  {
    title: 'Histogram: Vorm van de data',
    description: 'Een histogram groepeert data in "klassen" (bakjes) en toont de frequentie.',
    focus: 'visualization',
    visualization: 'histogram',
    instruction: 'Probeer een dataset te maken die symmetrisch is (een "belvorm"). Probeer er daarna een die scheef is.',
    details: [
      'X-as: De waarden van de dataset.',
      'Y-as: Hoe vaak waarden binnen een bepaalde klasse vallen.',
      'Vorm: Kan symmetrisch, scheef naar rechts (staart rechts), of scheef naar links (staart links) zijn.'
    ]
  },
  {
    title: 'Boxplot: 5-getallensamenvatting',
    description: 'Een compacte visualisatie van de belangrijkste statistieken.',
    focus: 'visualization',
    visualization: 'boxplot',
    instruction: 'Zoek de 5 kerngetallen van de boxplot terug in het "Statistische kenmerken" paneel.',
    details: [
      'De "snor" links: Minimum.',
      'Begin van de doos: Eerste kwartiel (Q1, 25%).',
      'Lijn in de doos: Mediaan (Q2, 50%).',
      'Einde van de doos: Derde kwartiel (Q3, 75%).',
      'De "snor" rechts: Maximum.'
    ]
  },
  {
    title: 'Visualisaties Vergelijken',
    description: 'Elke grafiek vertelt een ander deel van het verhaal.',
    focus: 'comparison',
    instruction: 'Schakel tussen de visualisaties. Welke grafiek is het best om uitbijters te zien? Welke voor de algemene vorm?',
    details: [
      'Histogram: Beste voor de vorm en verdeling.',
      'Boxplot: Beste voor een snelle samenvatting en vergelijking van spreiding.',
      'Taartdiagram: Alleen nuttig voor proporties van een paar categorieën.',
      'Lijndiagram: Toont de waarde van elk individueel (gesorteerd) datapunt.'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    const newViz = analysisSteps[currentStep.value].visualization
    if (newViz) currentVisualization.value = newViz
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    const newViz = analysisSteps[currentStep.value].visualization
    if (newViz) currentVisualization.value = newViz
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans" @mousemove="moveTooltip">
      <!-- Tooltip -->
      <div 
        v-if="tooltip.visible"
        class="fixed z-[100] px-3 py-1.5 bg-slate-800 text-white text-sm rounded-md shadow-lg pointer-events-none transition-opacity duration-200"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', whiteSpace: 'pre-line' }"
      >
        {{ tooltip.content }}
      </div>

      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center shadow-sm">
            <PhChartBar class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Beschrijvende Statistiek</h1>
            <p class="text-sm text-slate-500">Interactieve dataset analyse en visualisatie</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'analysis'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300', currentMode === 'analysis' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Analyse
            </button>
            <button 
              @click="currentMode = 'challenge'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300', currentMode === 'challenge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Opdracht
            </button>
          </div>
          
          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <PhX weight="bold" class="text-xl" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left Panel -->
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          
          <Transition name="fade-slide" mode="out-in">
            <!-- Mode: Dataset Analysis -->
            <div v-if="currentMode === 'analysis'" class="flex flex-col flex-1">
              <div class="p-4 border-b border-slate-200">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }}/{{ analysisSteps.length }}</span>
                  <div class="flex gap-1">
                    <button @click="prevStep" :disabled="currentStep === 0" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><PhArrowLeft class="text-lg" /></button>
                    <button @click="nextStep" :disabled="currentStep === analysisSteps.length - 1" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><PhArrowRight class="text-lg" /></button>
                  </div>
                </div>
                <Transition name="fade-slide" mode="out-in">
                  <div :key="currentStep">
                    <h2 class="text-base font-bold text-slate-800 mb-1">{{ analysisSteps[currentStep].title }}</h2>
                    <p class="text-sm text-slate-600">{{ analysisSteps[currentStep].description }}</p>
                  </div>
                </Transition>
              </div>

              <div class="p-4 space-y-4 border-b border-slate-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-700">Dataset: {{ datasetName }}</span>
                  <span class="text-xs text-slate-500">n = {{ n }}</span>
                </div>
                
                <div class="space-y-2">
                  <label class="text-xs font-medium text-slate-500">Nieuwe waarden (komma/spatie gescheiden)</label>
                  <div class="flex gap-2">
                    <input v-model="userInput" type="text" placeholder="Bv: 12, 15.5, 18" class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50 transition-all" @keyup.enter="addValue">
                    <button @click="addValue" class="px-3 py-2 bg-brand-dark text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all">
                      <PhPlus class="text-lg" />
                    </button>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button @click="generateRandomDataset" class="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2"><PhSparkle class="text-lg text-amber-500" /> Willekeurig</button>
                  <button @click="clearDataset" class="py-2 px-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"><PhTrash class="text-lg" /></button>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button @click="loadPresetDataset('exam')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-all transform hover:scale-105">Examencijfers</button>
                  <button @click="loadPresetDataset('height')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-all transform hover:scale-105">Lengtes</button>
                  <button @click="loadPresetDataset('age')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-all transform hover:scale-105">Leeftijden</button>
                  <button @click="loadPresetDataset('income')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-all transform hover:scale-105">Inkomsten</button>
                </div>

                <div v-if="analysisSteps[currentStep].focus === 'comparison'" class="space-y-2 pt-2 border-t border-slate-200">
                  <label class="text-xs font-medium text-slate-500">Kies visualisatie</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button @click="currentVisualization = 'histogram'" :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'histogram' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">Histogram</button>
                    <button @click="currentVisualization = 'boxplot'" :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'boxplot' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">Boxplot</button>
                    <button @click="currentVisualization = 'pie'" :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'pie' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">Taart</button>
                    <button @click="currentVisualization = 'line'" :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'line' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">Lijn</button>
                  </div>
                </div>
              </div>

              <div class="p-4 space-y-4">
                <Transition name="fade-slide" mode="out-in">
                  <div :key="currentStep">
                    <p class="text-sm text-slate-500 italic mb-4">{{ analysisSteps[currentStep].instruction }}</p>
                    <div v-if="analysisSteps[currentStep].details" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <ul class="space-y-2 text-sm text-slate-600">
                          <li v-for="detail in analysisSteps[currentStep].details" :key="detail" class="flex items-start gap-2">
                            <span class="text-brand-orange mt-1.5">•</span>
                            <span v-html="detail.replace(/`([^`]+)`/g, '<code class=\'bg-slate-200 text-slate-800 px-1 rounded\'>$1</code>')"></span>
                          </li>
                      </ul>
                    </div>
                  </div>
                </Transition>
              </div>
              <div class="mt-auto">
                <div class="p-4 bg-slate-50 border-t border-slate-200">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statistische kenmerken</h3>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <template v-for="stat in ['mean', 'median', 'mode', 'range', 'q1', 'q3', 'iqr', 'stdDev']" :key="stat">
                        <div class="text-slate-600 capitalize transition-transform duration-200" :class="{'scale-105 text-emerald-600 font-medium': flashes[stat]}">{{ {mean: 'Gemiddelde (x̄)', median: 'Mediaan', mode: 'Modus', range: 'Bereik', q1: 'Q1', q3: 'Q3', iqr: 'IQR', stdDev: 'Std. dev. (σ)'}[stat] }}:</div>
                        <div class="font-mono font-medium text-right transition-transform duration-200" :class="{'scale-105 text-emerald-600': flashes[stat]}">
                           <span v-if="stat === 'mode'">
                              <span v-if="typeof mode === 'number'">{{ mode.toFixed(2) }}</span>
                              <span v-else-if="Array.isArray(mode)">{{ mode.join(', ') }}</span>
                              <span v-else class="text-slate-400">{{ mode }}</span>
                           </span>
                           <span v-else>{{ {mean, median, range, q1, q3, iqr, stdDev}[stat].toFixed(2) }}</span>
                        </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mode: Challenge -->
            <div v-else class="p-4 space-y-4">
              <div class="border-b border-slate-200 pb-4">
                <h2 class="text-base font-bold text-slate-800 mb-1">Berekeningsopdracht</h2>
                <p class="text-sm text-slate-600">Test je kennis door de statistische maten te berekenen.</p>
              </div>

              <div v-if="!challengeActive" class="space-y-3 pt-4">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                <button @click="generateChallenge('central')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all duration-200 transform hover:scale-102"><div class="flex items-center gap-3 mb-1"><PhTrendUp class="text-brand-orange text-xl" /><span class="font-medium text-sm text-slate-800">Centrale maatstaven</span></div><div class="text-xs text-slate-500 ml-9">Bereken gemiddelde, mediaan en modus.</div></button>
                <button @click="generateChallenge('spread')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all duration-200 transform hover:scale-102"><div class="flex items-center gap-3 mb-1"><PhArrowsHorizontal class="text-brand-orange text-xl" /><span class="font-medium text-sm text-slate-800">Spreidingsmaatstaven</span></div><div class="text-xs text-slate-500 ml-9">Bereken bereik, IQR en standaarddeviatie.</div></button>
              </div>

              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg"><p class="text-sm font-medium mb-2">Jouw dataset ({{ targetDataset.length }} waarden):</p><p class="text-base text-white/90 font-mono break-all">{{ targetDataset.join(', ') }}</p></div>
                <div class="space-y-3">
                  <template v-if="challengeType === 'central'">
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">Gemiddelde</label><input type="number" v-model.number="userMean" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken het gemiddelde..."></div>
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">Mediaan</label><input type="number" v-model.number="userMedian" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken de mediaan..."></div>
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">Modus</label><input type="number" v-model.number="userMode" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken de modus..."></div>
                  </template>
                  <template v-if="challengeType === 'spread'">
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">Bereik</label><input type="number" v-model.number="userRange" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken het bereik..."></div>
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">IQR</label><input type="number" v-model.number="userIQR" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken de interkwartielafstand..."></div>
                    <div class="space-y-1"><label class="text-sm font-medium text-slate-700">Standaarddeviatie</label><input type="number" v-model.number="userStdDev" step="0.1" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/50" placeholder="Bereken de standaarddeviatie..."></div>
                  </template>
                </div>
                <div class="space-y-2 pt-2">
                  <button @click="checkChallenge" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors active:scale-95">Controleer</button>
                  <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">Annuleer</button>
                </div>
                <Transition name="fade-slide">
                  <div v-if="challengeFeedback" :class="['p-3 rounded-lg text-sm flex items-center gap-2', challengeSolved ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200']">
                    <PhCheckCircle v-if="challengeSolved" class="text-lg" weight="fill" />
                    <PhX v-else class="text-lg" weight="bold" />
                    {{ challengeFeedback }}
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-around gap-8 flex-wrap">
                <div v-for="stat in ['mean', 'median', 'stdDev', 'n']" :key="stat" class="text-center transition-transform duration-300" :class="{'scale-110': flashes[stat]}">
                    <span class="text-xs text-slate-500 block capitalize">{{ {mean: 'Gemiddelde', median: 'Mediaan', stdDev: 'Std. Dev. (σ)', n: 'Aantal (n)'}[stat] }}</span>
                    <span class="text-xl font-mono font-bold text-brand-dark transition-colors" :class="{'text-emerald-500': flashes[stat]}">
                        {{ {mean, median, stdDev, n}[stat].value !== undefined ? {mean, median, stdDev, n}[stat].value.toFixed(2) : {mean, median, stdDev, n}[stat].toFixed(2) }}
                    </span>
                </div>
            </div>
          </div>

          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <Transition name="fade-fast" mode="out-in">
              <div v-if="n === 0" class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-slate-400">
                  <PhChartBar class="text-6xl mx-auto mb-4 opacity-50" />
                  <p class="text-lg font-medium">Geen data om te tonen</p>
                  <p class="text-sm">Voeg waarden toe om een visualisatie te zien</p>
                </div>
              </div>
              <div v-else class="w-full h-full">
                <Transition name="fade-fast" mode="out-in">
                  <svg v-if="currentVisualization === 'histogram'" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <g stroke="#E2E8F0" stroke-width="1"><line v-for="i in 5" :key="`h${i}`" x1="60" :y1="50 + i * 80" :x2="svgWidth - 40" :y2="50 + i * 80" /></g>
                    <g v-if="histogramBins.length > 0">
                      <rect v-for="(bin, idx) in histogramBins" :key="bin.midpoint" :x="70 + idx * ((svgWidth - 120) / histogramBins.length)" :y="450 - (bin.count / Math.max(1, ...histogramBins.map(b => b.count))) * 400" :width="((svgWidth - 120) / histogramBins.length) - 2" :height="(bin.count / Math.max(1, ...histogramBins.map(b => b.count))) * 400" fill="#F97316" opacity="0.8" rx="2" class="bar-rect" @mouseover="showTooltip($event, `Klasse: ${bin.start.toFixed(1)} - ${bin.end.toFixed(1)}\nFrequentie: ${bin.count}`)" @mouseleave="hideTooltip"/>
                    </g>
                    <line x1="60" y1="450" :x2="svgWidth - 40" y2="450" stroke="#64748B" stroke-width="2" /><line x1="60" y1="50" x2="60" y2="450" stroke="#64748B" stroke-width="2" />
                    <text x="60" y="475" class="fill-slate-500 text-xs">{{ n > 0 ? Math.min(...dataset).toFixed(0) : 0 }}</text>
                    <text :x="svgWidth - 40" y="475" text-anchor="end" class="fill-slate-500 text-xs">{{ n > 0 ? Math.max(...dataset).toFixed(0) : 100 }}</text>
                    <text x="50" y="455" text-anchor="end" class="fill-slate-500 text-xs">0</text>
                    <text x="50" y="55" text-anchor="end" class="fill-slate-500 text-xs">{{ Math.max(1, ...histogramBins.map(b => b.count)) }}</text>
                    <g v-if="n > 0">
                        <line :x1="70 + ((mean - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 110)" y1="50" :x2="70 + ((mean - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 110)" y2="450" stroke="#10B981" stroke-width="2" stroke-dasharray="6,4"/>
                        <text :x="70 + ((mean - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 110)" y="40" text-anchor="middle" class="fill-emerald-600 text-sm font-bold" @mouseover="showTooltip($event, `Gemiddelde: ${mean.toFixed(2)}`)" @mouseleave="hideTooltip">x̄</text>
                    </g>
                    <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Histogram</text>
                  </svg>
                  <svg v-else-if="currentVisualization === 'boxplot'" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <line x1="50" y1="250" :x2="svgWidth - 50" y2="250" stroke="#94A3B8" stroke-width="2" />
                    <g v-if="n > 0">
                      <line :x1="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y1="250" :x2="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y2="250" stroke="#475569" stroke-width="2"/><line :x1="50 + ((q3 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y1="250" :x2="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y2="250" stroke="#475569" stroke-width="2"/>
                      <line :x1="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y1="230" :x2="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y2="270" stroke="#475569" stroke-width="2" @mouseover="showTooltip($event, `Min: ${Math.min(...dataset).toFixed(2)}`)" @mouseleave="hideTooltip"/>
                      <line :x1="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y1="230" :x2="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y2="270" stroke="#475569" stroke-width="2" @mouseover="showTooltip($event, `Max: ${Math.max(...dataset).toFixed(2)}`)" @mouseleave="hideTooltip"/>
                      <rect :x="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y="200" :width="((q3 - q1) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" height="100" fill="#F97316" opacity="0.6" rx="4" @mouseover="showTooltip($event, `IQR: ${iqr.toFixed(2)}`)" @mouseleave="hideTooltip"/>
                      <line :x1="50 + ((median - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y1="200" :x2="50 + ((median - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y2="300" stroke="#0B1120" stroke-width="3" @mouseover="showTooltip($event, `Mediaan: ${median.toFixed(2)}`)" @mouseleave="hideTooltip"/>
                      <text :x="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y="185" text-anchor="middle" class="fill-slate-600 text-xs font-medium" @mouseover="showTooltip($event, `Q1: ${q1.toFixed(2)}`)" @mouseleave="hideTooltip">Q1</text>
                      <text :x="50 + ((q3 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)" y="185" text-anchor="middle" class="fill-slate-600 text-xs font-medium" @mouseover="showTooltip($event, `Q3: ${q3.toFixed(2)}`)" @mouseleave="hideTooltip">Q3</text>
                    </g>
                    <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Boxplot</text>
                  </svg>
                  <svg v-else-if="currentVisualization === 'pie'" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <g v-if="pieSlices.length > 0" transform="translate(320, 260)">
                      <g v-for="(slice, idx) in pieSlices" :key="slice.value">
                        <path :d="`M 0 0 L ${200 * Math.cos((slice.startAngle - 90) * Math.PI / 180)} ${200 * Math.sin((slice.startAngle - 90) * Math.PI / 180)} A 200 200 0 ${slice.angle > 180 ? 1 : 0} 1 ${200 * Math.cos((slice.startAngle + slice.angle - 90) * Math.PI / 180)} ${200 * Math.sin((slice.startAngle + slice.angle - 90) * Math.PI / 180)} Z`" :fill="['#F97316', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'][idx % 8]" opacity="0.85" stroke="white" stroke-width="2" @mouseover="showTooltip($event, `Waarde: ${slice.value}\nAantal: ${slice.count}`)" @mouseleave="hideTooltip"/>
                        <text v-if="slice.angle > 15" :x="130 * Math.cos((slice.startAngle + slice.angle / 2 - 90) * Math.PI / 180)" :y="130 * Math.sin((slice.startAngle + slice.angle / 2 - 90) * Math.PI / 180)" text-anchor="middle" class="fill-white text-sm font-bold pointer-events-none">{{ slice.value }}</text>
                      </g>
                    </g>
                    <g transform="translate(580, 80)"><g v-for="(item, idx) in frequencyData" :key="idx" :transform="`translate(0, ${idx * 25})`"><rect x="0" y="0" width="15" height="15" :fill="['#F97316', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'][idx % 8]" rx="3" /><text x="25" y="12" class="fill-slate-600 text-sm">{{ item.value }}: {{ item.count }} ({{ ((item.count / n) * 100).toFixed(0) }}%)</text></g></g>
                    <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Taartdiagram (Frequentie)</text>
                  </svg>
                  <svg v-else-if="currentVisualization === 'line'" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <g stroke="#E2E8F0" stroke-width="1"><line v-for="i in 5" :key="`h${i}`" x1="60" :y1="50 + i * 80" :x2="svgWidth - 40" :y2="50 + i * 80" /></g>
                    <polyline v-if="sortedData.length > 0" :points="sortedData.map((val, idx) => `${60 + (idx / (sortedData.length - 1 || 1)) * (svgWidth - 100)},${450 - ((val - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * 400}`).join(' ')" fill="none" stroke="#F97316" stroke-width="3"/>
                    <g v-if="sortedData.length > 0"><circle v-for="(val, idx) in sortedData" :key="idx" :cx="60 + (idx / (sortedData.length - 1 || 1)) * (svgWidth - 100)" :cy="450 - ((val - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * 400" r="5" fill="#F97316" stroke="white" stroke-width="2" @mouseover="showTooltip($event, `Waarde: ${val}`)" @mouseleave="hideTooltip"/></g>
                    <line x1="60" y1="450" :x2="svgWidth - 40" y2="450" stroke="#64748B" stroke-width="2" /><line x1="60" y1="50" x2="60" y2="450" stroke="#64748B" stroke-width="2" />
                    <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Lijndiagram (Gesorteerde data)</text>
                  </svg>
                </Transition>
              </div>
            </Transition>
          </div>

          <div class="mt-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200 max-h-48 overflow-y-auto">
            <h4 class="text-sm font-bold text-slate-700 mb-3">Huidige Dataset ({{n}})</h4>
            <TransitionGroup tag="div" name="list" class="flex flex-wrap gap-2">
              <span v-for="(value, idx) in dataset" :key="`${idx}-${value}`" class="list-item inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-mono group transition-colors">
                <span>{{ value }}</span>
                <button @click="removeValue(idx)" class="text-slate-400 hover:text-rose-600 opacity-50 group-hover:opacity-100 transition-opacity">
                  <PhX weight="bold" class="text-xs" />
                </button>
              </span>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.2s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(10px); }

.list-enter-active, .list-leave-active { transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.5) translateY(-20px); }
.list-leave-active { position: absolute; }

.bar-rect { transition: y 0.5s ease, height 0.5s ease; }
</style>