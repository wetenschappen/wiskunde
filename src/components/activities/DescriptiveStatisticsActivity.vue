<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhChartBar, PhChartPie, PhChartLine, 
  PhArrowsHorizontal, PhTrendUp, PhCalculator,
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhShuffle, PhTrash, PhPlus
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
const userMean = ref(0)
const userMedian = ref(0)
const userMode = ref(0)
const userRange = ref(0)
const userIQR = ref(0)
const userStdDev = ref(0)

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
  if (n.value === 0) return 0
  const frequency = {}
  let maxFreq = 0
  let modes = []
  
  dataset.value.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val]
    }
  })
  
  if (maxFreq === 1) return 'Geen modus'
  
  Object.keys(frequency).forEach(key => {
    if (frequency[key] === maxFreq) {
      modes.push(parseFloat(key))
    }
  })
  
  return modes.length === 1 ? modes[0] : modes
})

// Spread measures
const range = computed(() => {
  if (n.value === 0) return 0
  return Math.max(...dataset.value) - Math.min(...dataset.value)
})

const q1 = computed(() => {
  if (n.value === 0) return 0
  const sorted = sortedData.value
  const mid = Math.floor(sorted.length / 2)
  const lowerHalf = sorted.slice(0, mid)
  if (lowerHalf.length === 0) return sorted[0]
  const q1Mid = Math.floor(lowerHalf.length / 2)
  if (lowerHalf.length % 2 === 0) {
    return (lowerHalf[q1Mid - 1] + lowerHalf[q1Mid]) / 2
  }
  return lowerHalf[q1Mid]
})

const q3 = computed(() => {
  if (n.value === 0) return 0
  const sorted = sortedData.value
  const mid = Math.floor(sorted.length / 2)
  const upperHalf = sorted.slice(n.value % 2 === 0 ? mid : mid + 1)
  if (upperHalf.length === 0) return sorted[sorted.length - 1]
  const q3Mid = Math.floor(upperHalf.length / 2)
  if (upperHalf.length % 2 === 0) {
    return (upperHalf[q3Mid - 1] + upperHalf[q3Mid]) / 2
  }
  return upperHalf[q3Mid]
})

const iqr = computed(() => q3.value - q1.value)

const stdDev = computed(() => {
  if (n.value === 0) return 0
  const m = mean.value
  const variance = dataset.value.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / n.value
  return Math.sqrt(variance)
})

// Histogram bins
const histogramBins = computed(() => {
  if (n.value === 0) return []
  const min = Math.min(...dataset.value)
  const max = Math.max(...dataset.value)
  const binCount = Math.min(8, Math.ceil(Math.sqrt(n.value)))
  const binWidth = (max - min) / binCount || 1
  
  const bins = []
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    const count = dataset.value.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length
    bins.push({ start: binStart, end: binEnd, count, midpoint: (binStart + binEnd) / 2 })
  }
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
}

function generateRandomDataset() {
  const size = Math.floor(Math.random() * 15) + 10
  const newData = []
  const base = Math.floor(Math.random() * 50) + 10
  for (let i = 0; i < size; i++) {
    newData.push(Math.round(base + (Math.random() * 40 - 20)))
  }
  dataset.value = newData
  datasetName.value = 'Willekeurige dataset'
}

function loadPresetDataset(type) {
  const presets = {
    exam: { name: 'Examencijfers', data: [52, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95] },
    height: { name: 'Lengtes (cm)', data: [165, 168, 170, 172, 175, 176, 178, 180, 182, 185, 188, 190] },
    age: { name: 'Leeftijden', data: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    income: { name: 'Inkomsten (×100€)', data: [25, 28, 30, 32, 35, 38, 40, 45, 50, 55, 60, 80, 120] }
  }
  if (presets[type]) {
    dataset.value = [...presets[type].data]
    datasetName.value = presets[type].name
  }
}

// ==================== CHALLENGE MODE ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate random dataset for challenge
  const size = Math.floor(Math.random() * 10) + 8
  targetDataset.value = []
  const base = Math.floor(Math.random() * 40) + 20
  for (let i = 0; i < size; i++) {
    targetDataset.value.push(Math.round(base + (Math.random() * 30 - 15)))
  }
  
  // Reset user answers
  userMean.value = 0
  userMedian.value = 0
  userMode.value = 0
  userRange.value = 0
  userIQR.value = 0
  userStdDev.value = 0
  
  // Set the dataset for calculation
  const originalData = dataset.value
  dataset.value = targetDataset.value
  
  // Store correct answers
  const correctMean = mean.value
  const correctMedian = median.value
  const correctMode = mode.value
  const correctRange = range.value
  const correctIQR = iqr.value
  const correctStdDev = stdDev.value
  
  // Restore original data
  dataset.value = originalData
}

function checkChallenge() {
  const tolerance = 0.5
  let correct = true
  let errors = []
  
  // Temporarily set dataset to target
  const originalData = dataset.value
  dataset.value = targetDataset.value
  
  if (challengeType.value === 'central') {
    if (Math.abs(userMean.value - mean.value) > tolerance) {
      correct = false
      errors.push('gemiddelde')
    }
    if (Math.abs(userMedian.value - median.value) > tolerance) {
      correct = false
      errors.push('mediaan')
    }
    const modeVal = typeof mode.value === 'number' ? mode.value : 0
    if (Math.abs(userMode.value - modeVal) > tolerance) {
      correct = false
      errors.push('modus')
    }
  } else if (challengeType.value === 'spread') {
    if (Math.abs(userRange.value - range.value) > tolerance) {
      correct = false
      errors.push('bereik')
    }
    if (Math.abs(userIQR.value - iqr.value) > tolerance) {
      correct = false
      errors.push('IQR')
    }
    if (Math.abs(userStdDev.value - stdDev.value) > tolerance) {
      correct = false
      errors.push('standaarddeviatie')
    }
  }
  
  // Restore original data
  dataset.value = originalData
  
  if (correct) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! Alle waarden zijn juist berekend.'
  } else {
    challengeFeedback.value = `Nog niet juist. Controleer: ${errors.join(', ')}.`
  }
}

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 500
const viewBoxX = 0
const viewBoxY = 0
const viewBoxWidth = 800
const viewBoxHeight = 500

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

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
    description: 'Gemiddelde, mediaan en modus geven het centrum van de data weer.',
    focus: 'central',
    instruction: 'Bekijk hoe de centrale waarden veranderen wanneer je de dataset aanpast.',
    details: [
      'Gemiddelde: het rekenkundig gemiddelde van alle waarden',
      'Mediaan: de middelste waarde na sorteren',
      'Modus: de meest voorkomende waarde'
    ]
  },
  {
    title: 'Spreidingsmaatstaven',
    description: 'Bereik, interkwartielafstand (IQR) en standaarddeviatie meten de spreiding.',
    focus: 'spread',
    instruction: 'Observeer hoe uitbijters de spreidingsmaten beïnvloeden.',
    details: [
      'Bereik: verschil tussen maximum en minimum',
      'IQR: bereik van het middelste 50% van de data',
      'Standaarddeviatie: gemiddelde afwijking van het gemiddelde'
    ]
  },
  {
    title: 'Histogram analyse',
    description: 'Een histogram toont de frequentieverdeling van de data.',
    focus: 'visualization',
    visualization: 'histogram',
    instruction: 'Bestudeer de verdeling en identificeer pieken en gaten.',
    details: [
      'X-as: waarden van de dataset (verdeeld in klassen)',
      'Y-as: frequentie (aantal waarden in elke klasse)',
      'Vorm: symmetrisch, scheef naar links of rechts'
    ]
  },
  {
    title: 'Boxplot interpretatie',
    description: 'Een boxplot toont het minimum, Q1, mediaan, Q3 en maximum.',
    focus: 'visualization',
    visualization: 'boxplot',
    instruction: 'Identificeer de vijf-getallensamenvatting op de boxplot.',
    details: [
      'Doos: van Q1 (25%) tot Q3 (75%), bevat middelste 50%',
      'Lijn in doos: mediaan (50%)',
      'Snorren: strekken zich uit naar min en max',
      'Uitbijters: waarden ver buiten de snorren'
    ]
  },
  {
    title: 'Visualisatievergelijking',
    description: 'Verschillende grafieken tonen verschillende aspecten van de data.',
    focus: 'comparison',
    instruction: 'Vergelijk histogram, boxplot, taartdiagram en lijndiagram.',
    details: [
      'Histogram: verdeling en frequentie',
      'Boxplot: samenvatting en spreiding',
      'Taartdiagram: proporties (voor discrete data)',
      'Lijndiagram: trends (voor tijdreeksen)'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    if (analysisSteps[currentStep.value].visualization) {
      currentVisualization.value = analysisSteps[currentStep.value].visualization
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    if (analysisSteps[currentStep.value].visualization) {
      currentVisualization.value = analysisSteps[currentStep.value].visualization
    }
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhChartBar class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Beschrijvende statistiek</h1>
            <p class="text-sm text-slate-500">Dataset analyse en visualisatie</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Mode Switcher -->
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'analysis'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'analysis' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Dataset analyse
            </button>
            <button 
              @click="currentMode = 'challenge'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'challenge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Berekeningsopdracht
            </button>
          </div>
          
          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <PhX weight="bold" class="text-xl" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left Panel: Controls & Analysis -->
        <div class="w-96 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          
          <!-- Mode: Dataset Analysis -->
          <template v-if="currentMode === 'analysis'">
            <!-- Step Navigation -->
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }} van {{ analysisSteps.length }}</span>
                <div class="flex gap-1">
                  <button 
                    @click="prevStep" 
                    :disabled="currentStep === 0"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowLeft class="text-lg" />
                  </button>
                  <button 
                    @click="nextStep"
                    :disabled="currentStep === analysisSteps.length - 1"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowRight class="text-lg" />
                  </button>
                </div>
              </div>
              <h2 class="text-base font-bold text-slate-800 mb-1">{{ analysisSteps[currentStep].title }}</h2>
              <p class="text-sm text-slate-600">{{ analysisSteps[currentStep].description }}</p>
            </div>

            <!-- Dataset Controls -->
            <div class="p-4 space-y-4 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-slate-700">Dataset: {{ datasetName }}</span>
                <span class="text-xs text-slate-500">n = {{ n }}</span>
              </div>
              
              <!-- Data input -->
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-500">Nieuwe waarden (komma, spatie of puntkomma gescheiden)</label>
                <div class="flex gap-2">
                  <input 
                    v-model="userInput"
                    type="text"
                    placeholder="Bijv: 12, 15, 18"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    @keyup.enter="addValue"
                  >
                  <button @click="addValue" class="px-3 py-2 bg-brand-dark text-white rounded-lg hover:bg-slate-800 transition-colors">
                    <PhPlus class="text-lg" />
                  </button>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-2">
                <button @click="generateRandomDataset" class="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <PhShuffle class="text-lg" />
                  Willekeurig
                </button>
                <button @click="clearDataset" class="py-2 px-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">
                  <PhTrash class="text-lg" />
                </button>
              </div>

              <!-- Presets -->
              <div class="grid grid-cols-2 gap-2">
                <button @click="loadPresetDataset('exam')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-colors">
                  Examencijfers
                </button>
                <button @click="loadPresetDataset('height')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-colors">
                  Lengtes
                </button>
                <button @click="loadPresetDataset('age')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-colors">
                  Leeftijden
                </button>
                <button @click="loadPresetDataset('income')" class="py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium hover:border-brand-orange hover:bg-orange-50 transition-colors">
                  Inkomsten
                </button>
              </div>

              <!-- Visualization selector for comparison step -->
              <div v-if="analysisSteps[currentStep].focus === 'comparison'" class="space-y-2 pt-2 border-t border-slate-200">
                <label class="text-xs font-medium text-slate-500">Visualisatie</label>
                <div class="grid grid-cols-4 gap-2">
                  <button 
                    @click="currentVisualization = 'histogram'"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'histogram' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                  >
                    Histogram
                  </button>
                  <button 
                    @click="currentVisualization = 'boxplot'"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'boxplot' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                  >
                    Boxplot
                  </button>
                  <button 
                    @click="currentVisualization = 'pie'"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'pie' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                  >
                    Taart
                  </button>
                  <button 
                    @click="currentVisualization = 'line'"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium transition-colors', currentVisualization === 'line' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                  >
                    Lijn
                  </button>
                </div>
              </div>
            </div>

            <!-- Analysis details -->
            <div class="p-4 space-y-4">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Educational details -->
              <div v-if="analysisSteps[currentStep].details" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ul class="space-y-1 text-sm text-slate-600">
                  <li v-for="(detail, idx) in analysisSteps[currentStep].details" :key="idx" class="flex items-start gap-2">
                    <span class="text-brand-orange mt-1">•</span>
                    <span>{{ detail }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <!-- Mode: Challenge -->
          <template v-if="currentMode === 'challenge'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Berekeningsopdracht</h2>
              <p class="text-sm text-slate-600">Bereken de statistische maten voor de gegeven dataset.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('central')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2 mb-1">
                    <PhTrendUp class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Centrale maatstaven</span>
                  </div>
                  <div class="text-xs text-slate-500">Bereken gemiddelde, mediaan en modus.</div>
                </button>
                
                <button @click="generateChallenge('spread')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2 mb-1">
                    <PhArrowsHorizontal class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Spreidingsmaatstaven</span>
                  </div>
                  <div class="text-xs text-slate-500">Bereken bereik, IQR en standaarddeviatie.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Dataset ({{ targetDataset.length }} waarden):</p>
                  <p class="text-xs text-white/80 font-mono break-all">{{ targetDataset.join(', ') }}</p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <template v-if="challengeType === 'central'">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Gemiddelde</label>
                      <input 
                        type="number" 
                        v-model.number="userMean" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Mediaan</label>
                      <input 
                        type="number" 
                        v-model.number="userMedian" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Modus</label>
                      <input 
                        type="number" 
                        v-model.number="userMode" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </template>

                  <template v-if="challengeType === 'spread'">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Bereik</label>
                      <input 
                        type="number" 
                        v-model.number="userRange" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Interkwartielafstand (IQR)</label>
                      <input 
                        type="number" 
                        v-model.number="userIQR" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Standaarddeviatie</label>
                      <input 
                        type="number" 
                        v-model.number="userStdDev" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </template>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <button @click="checkChallenge" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
                    Controleer
                  </button>
                  <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                    Annuleer
                  </button>
                </div>

                <!-- Feedback -->
                <div v-if="challengeFeedback" :class="['p-3 rounded-lg text-sm', challengeSolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                  {{ challengeFeedback }}
                </div>
              </div>
            </div>
          </template>

          <!-- Mathematical Characteristics Panel -->
          <div class="mt-auto p-4 bg-slate-50 border-t border-slate-200">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statistische kenmerken</h3>
            
            <!-- Central measures -->
            <div class="mb-4">
              <p class="text-xs font-medium text-brand-orange mb-2 uppercase tracking-wide">Centrale maatstaven</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Gemiddelde (x̄):</span>
                  <span class="font-mono font-medium">{{ mean.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Mediaan:</span>
                  <span class="font-mono font-medium">{{ median.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Modus:</span>
                  <span class="font-mono font-medium">
                    <span v-if="typeof mode === 'number'">{{ mode }}</span>
                    <span v-else-if="Array.isArray(mode)">{{ mode.join(', ') }}</span>
                    <span v-else class="text-slate-400">{{ mode }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Spread measures -->
            <div class="mb-4">
              <p class="text-xs font-medium text-brand-orange mb-2 uppercase tracking-wide">Spreidingsmaatstaven</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Bereik:</span>
                  <span class="font-mono">{{ range.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Q1 (25%):</span>
                  <span class="font-mono">{{ q1.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Q3 (75%):</span>
                  <span class="font-mono">{{ q3.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">IQR:</span>
                  <span class="font-mono">{{ iqr.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Standaarddeviatie (σ):</span>
                  <span class="font-mono">{{ stdDev.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Dataset info -->
            <div>
              <p class="text-xs font-medium text-brand-orange mb-2 uppercase tracking-wide">Dataset</p>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Steekproefomvang (n):</span>
                  <span class="font-mono">{{ n }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Minimum:</span>
                  <span class="font-mono">{{ n > 0 ? Math.min(...dataset).toFixed(2) : '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Maximum:</span>
                  <span class="font-mono">{{ n > 0 ? Math.max(...dataset).toFixed(2) : '-' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Som:</span>
                  <span class="font-mono">{{ n > 0 ? dataset.reduce((a, b) => a + b, 0).toFixed(2) : '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Stats Display Bar -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-8 flex-wrap">
              <div class="text-center">
                <span class="text-xs text-slate-500 block">Gemiddelde</span>
                <span class="text-xl font-mono font-bold text-brand-dark">{{ mean.toFixed(2) }}</span>
              </div>
              <div class="text-center">
                <span class="text-xs text-slate-500 block">Mediaan</span>
                <span class="text-xl font-mono font-bold text-brand-dark">{{ median.toFixed(2) }}</span>
              </div>
              <div class="text-center">
                <span class="text-xs text-slate-500 block">σ</span>
                <span class="text-xl font-mono font-bold text-brand-dark">{{ stdDev.toFixed(2) }}</span>
              </div>
              <div class="text-center">
                <span class="text-xs text-slate-500 block">n</span>
                <span class="text-xl font-mono font-bold text-brand-dark">{{ n }}</span>
              </div>
            </div>
          </div>

          <!-- Chart Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <!-- Empty state -->
            <div v-if="n === 0" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center text-slate-400">
                <PhChartBar class="text-6xl mx-auto mb-4 opacity-50" />
                <p class="text-lg font-medium">Geen data</p>
                <p class="text-sm">Voeg waarden toe aan de dataset</p>
              </div>
            </div>

            <!-- Histogram -->
            <svg 
              v-else-if="currentVisualization === 'histogram'"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid lines -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 5" :key="`h${i}`" 
                  x1="60" :y1="50 + i * 80" 
                  :x2="svgWidth - 40" :y2="50 + i * 80" 
                />
              </g>

              <!-- Bars -->
              <g v-if="histogramBins.length > 0">
                <rect
                  v-for="(bin, idx) in histogramBins"
                  :key="idx"
                  :x="70 + idx * ((svgWidth - 120) / histogramBins.length)"
                  :y="450 - (bin.count / Math.max(...histogramBins.map(b => b.count))) * 350"
                  :width="((svgWidth - 120) / histogramBins.length) - 5"
                  :height="(bin.count / Math.max(...histogramBins.map(b => b.count))) * 350"
                  fill="#F97316"
                  opacity="0.8"
                  rx="4"
                />
              </g>

              <!-- X-axis -->
              <line x1="60" y1="450" :x2="svgWidth - 40" y2="450" stroke="#64748B" stroke-width="2" />
              
              <!-- Y-axis -->
              <line x1="60" y1="50" x2="60" y2="450" stroke="#64748B" stroke-width="2" />

              <!-- X-axis labels -->
              <text x="60" y="480" class="fill-slate-500 text-xs">{{ histogramBins[0]?.start.toFixed(0) || 0 }}</text>
              <text :x="svgWidth - 40" y="480" text-anchor="end" class="fill-slate-500 text-xs">{{ histogramBins[histogramBins.length - 1]?.end.toFixed(0) || 100 }}</text>

              <!-- Y-axis labels -->
              <text x="50" y="455" text-anchor="end" class="fill-slate-500 text-xs">0</text>
              <text x="50" y="55" text-anchor="end" class="fill-slate-500 text-xs">{{ Math.max(...histogramBins.map(b => b.count)) }}</text>

              <!-- Mean line -->
              <line 
                :x1="70 + ((mean - histogramBins[0]?.start) / (histogramBins[histogramBins.length - 1]?.end - histogramBins[0]?.start)) * (svgWidth - 120)"
                y1="50"
                :x2="70 + ((mean - histogramBins[0]?.start) / (histogramBins[histogramBins.length - 1]?.end - histogramBins[0]?.start)) * (svgWidth - 120)"
                y2="450"
                stroke="#10B981"
                stroke-width="3"
                stroke-dasharray="8,4"
              />
              <text 
                :x="70 + ((mean - histogramBins[0]?.start) / (histogramBins[histogramBins.length - 1]?.end - histogramBins[0]?.start)) * (svgWidth - 120)"
                y="40"
                text-anchor="middle"
                class="fill-emerald-600 text-sm font-bold"
              >
                Gemiddelde: {{ mean.toFixed(1) }}
              </text>

              <!-- Chart title -->
              <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Histogram</text>
            </svg>

            <!-- Boxplot -->
            <svg 
              v-else-if="currentVisualization === 'boxplot'"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Axis -->
              <line x1="50" y1="250" :x2="svgWidth - 50" y2="250" stroke="#64748B" stroke-width="2" />
              
              <!-- Scale -->
              <g>
                <line x1="50" y1="245" x2="50" y2="255" stroke="#64748B" stroke-width="2" />
                <text x="50" y="280" text-anchor="middle" class="fill-slate-500 text-xs">{{ Math.min(...dataset).toFixed(0) }}</text>
                
                <line :x1="svgWidth - 50" y1="245" :x2="svgWidth - 50" y2="255" stroke="#64748B" stroke-width="2" />
                <text :x="svgWidth - 50" y="280" text-anchor="middle" class="fill-slate-500 text-xs">{{ Math.max(...dataset).toFixed(0) }}</text>
              </g>

              <!-- Boxplot calculations -->
              <g v-if="n > 0">
                <!-- Min to Q1 whisker -->
                <line 
                  :x1="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y1="250"
                  :x2="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y2="250"
                  stroke="#475569"
                  stroke-width="2"
                />
                
                <!-- Q3 to Max whisker -->
                <line 
                  :x1="50 + ((q3 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y1="250"
                  :x2="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y2="250"
                  stroke="#475569"
                  stroke-width="2"
                />

                <!-- Min cap -->
                <line 
                  :x1="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y1="230"
                  :x2="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y2="270"
                  stroke="#475569"
                  stroke-width="2"
                />

                <!-- Max cap -->
                <line 
                  :x1="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y1="230"
                  :x2="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y2="270"
                  stroke="#475569"
                  stroke-width="2"
                />

                <!-- Box (Q1 to Q3) -->
                <rect 
                  :x="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="200"
                  :width="((q3 - q1) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  height="100"
                  fill="#F97316"
                  opacity="0.6"
                  rx="4"
                />

                <!-- Median line -->
                <line 
                  :x1="50 + ((median - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y1="200"
                  :x2="50 + ((median - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y2="300"
                  stroke="#0B1120"
                  stroke-width="3"
                />

                <!-- Labels -->
                <text 
                  :x="50 + ((Math.min(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="330"
                  text-anchor="middle"
                  class="fill-slate-600 text-xs font-medium"
                >Min</text>
                <text 
                  :x="50 + ((q1 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="185"
                  text-anchor="middle"
                  class="fill-slate-600 text-xs font-medium"
                >Q1</text>
                <text 
                  :x="50 + ((median - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="185"
                  text-anchor="middle"
                  class="fill-slate-600 text-xs font-bold"
                >Mediaan</text>
                <text 
                  :x="50 + ((q3 - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="185"
                  text-anchor="middle"
                  class="fill-slate-600 text-xs font-medium"
                >Q3</text>
                <text 
                  :x="50 + ((Math.max(...dataset) - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * (svgWidth - 100)"
                  y="330"
                  text-anchor="middle"
                  class="fill-slate-600 text-xs font-medium"
                >Max</text>
              </g>

              <!-- Chart title -->
              <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Boxplot (Vijf-getallensamenvatting)</text>
            </svg>

            <!-- Pie Chart -->
            <svg 
              v-else-if="currentVisualization === 'pie'"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <g v-if="frequencyData.length > 0" transform="translate(400, 250)">
                <g v-for="(slice, idx) in (() => {
                  let currentAngle = 0
                  return frequencyData.map(d => {
                    const angle = (d.count / n) * 360
                    const startAngle = currentAngle
                    currentAngle += angle
                    return { ...d, startAngle, angle }
                  })
                })()" :key="idx">
                  <path
                    :d="`M 0 0 L ${150 * Math.cos((slice.startAngle - 90) * Math.PI / 180)} ${150 * Math.sin((slice.startAngle - 90) * Math.PI / 180)} A 150 150 0 ${slice.angle > 180 ? 1 : 0} 1 ${150 * Math.cos((slice.startAngle + slice.angle - 90) * Math.PI / 180)} ${150 * Math.sin((slice.startAngle + slice.angle - 90) * Math.PI / 180)} Z`"
                    :fill="['#F97316', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'][idx % 8]"
                    opacity="0.85"
                    stroke="white"
                    stroke-width="2"
                  />
                  <text
                    v-if="slice.angle > 20"
                    :x="100 * Math.cos((slice.startAngle + slice.angle / 2 - 90) * Math.PI / 180)"
                    :y="100 * Math.sin((slice.startAngle + slice.angle / 2 - 90) * Math.PI / 180)"
                    text-anchor="middle"
                    class="fill-white text-xs font-bold"
                  >
                    {{ slice.value }}
                  </text>
                </g>
              </g>

              <!-- Legend -->
              <g v-if="frequencyData.length > 0" transform="translate(600, 100)">
                <g v-for="(item, idx) in frequencyData" :key="idx" :transform="`translate(0, ${idx * 25})`">
                  <rect x="0" y="0" width="15" height="15" :fill="['#F97316', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16'][idx % 8]" rx="3" />
                  <text x="25" y="12" class="fill-slate-600 text-sm">{{ item.value }}: {{ item.count }} ({{ ((item.count / n) * 100).toFixed(1) }}%)</text>
                </g>
              </g>

              <!-- Chart title -->
              <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Taartdiagram (Frequentie)</text>
            </svg>

            <!-- Line Chart -->
            <svg 
              v-else-if="currentVisualization === 'line'"
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 5" :key="`h${i}`" 
                  x1="60" :y1="50 + i * 80" 
                  :x2="svgWidth - 40" :y2="50 + i * 80" 
                />
              </g>

              <!-- Line -->
              <polyline
                v-if="sortedData.length > 0"
                :points="sortedData.map((val, idx) => `${60 + (idx / (sortedData.length - 1 || 1)) * (svgWidth - 100)},${450 - ((val - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * 350}`).join(' ')"
                fill="none"
                stroke="#F97316"
                stroke-width="3"
              />

              <!-- Data points -->
              <g v-if="sortedData.length > 0">
                <circle
                  v-for="(val, idx) in sortedData"
                  :key="idx"
                  :cx="60 + (idx / (sortedData.length - 1 || 1)) * (svgWidth - 100)"
                  :cy="450 - ((val - Math.min(...dataset)) / (Math.max(...dataset) - Math.min(...dataset) || 1)) * 350"
                  r="5"
                  fill="#F97316"
                  stroke="white"
                  stroke-width="2"
                />
              </g>

              <!-- Axes -->
              <line x1="60" y1="450" :x2="svgWidth - 40" y2="450" stroke="#64748B" stroke-width="2" />
              <line x1="60" y1="50" x2="60" y2="450" stroke="#64748B" stroke-width="2" />

              <!-- Chart title -->
              <text x="400" y="30" text-anchor="middle" class="fill-slate-700 text-lg font-bold">Lijndiagram (Gesorteerde data)</text>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div v-if="currentVisualization === 'histogram'" class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded bg-orange-500 opacity-80"></div>
                  <span class="text-slate-600">Frequentie</span>
                </div>
                <div v-if="currentVisualization === 'histogram'" class="flex items-center gap-2">
                  <div class="w-6 h-0.5 bg-emerald-500" style="border-top: 2px dashed #10B981;"></div>
                  <span class="text-slate-600">Gemiddelde</span>
                </div>
                <div v-if="currentVisualization === 'boxplot'" class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded bg-orange-500 opacity-60"></div>
                  <span class="text-slate-600">Doos (Q1-Q3)</span>
                </div>
                <div v-if="currentVisualization === 'boxplot'" class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-slate-800"></div>
                  <span class="text-slate-600">Mediaan</span>
                </div>
                <div v-if="currentVisualization === 'boxplot'" class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-slate-600"></div>
                  <span class="text-slate-600">Snorren (Min-Max)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Data table -->
          <div class="mt-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200 max-h-40 overflow-y-auto">
            <h4 class="text-sm font-bold text-slate-700 mb-2">Dataset waarden</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(value, idx) in dataset" 
                :key="idx"
                class="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-sm font-mono"
              >
                {{ value }}
                <button @click="removeValue(idx)" class="text-slate-400 hover:text-rose-600">
                  <PhX class="text-xs" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #F97316;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #F97316;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
