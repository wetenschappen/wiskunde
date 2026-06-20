<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhChartScatter, PhTrendUp, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhGraph
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Scatter plot parameters
const slope = ref(1)
const intercept = ref(0)
const spread = ref(1.5)
const correlationStrength = ref(0.8)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'estimate-correlation', 'fit-trendline', 'predict-value'
const targetSlope = ref(0)
const targetIntercept = ref(0)
const targetCorrelation = ref(0)
const userSlope = ref(1)
const userIntercept = ref(0)
const userCorrelation = ref(0)
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const userPrediction = ref(0)
const predictionTarget = ref({ x: 0, y: 0 })

// Generated data points for scatter plot
const dataPoints = ref([])
const challengeDataPoints = ref([])

// Number of data points
const numPoints = 30

// ==================== COMPUTED PROPERTIES ====================
// Generate random data points based on correlation
function generateScatterData(n, a, b, correlation, spreadVal) {
  const points = []
  for (let i = 0; i < n; i++) {
    const x = (Math.random() * 16 - 8) * 0.8
    // Generate y with correlation: y = ax + b + noise
    const idealY = a * x + b
    const noise = (Math.random() * 2 - 1) * spreadVal * (1 - correlation) * 3
    const y = idealY + noise
    points.push({ x, y })
  }
  return points
}

// Calculate actual correlation coefficient from data
function calculateCorrelation(points) {
  if (points.length < 2) return 0
  
  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
  const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  return denominator === 0 ? 0 : numerator / denominator
}

// Calculate linear regression line from points
function calculateRegression(points) {
  if (points.length < 2) return { a: 0, b: 0 }
  
  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)
  
  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - a * sumX) / n
  
  return { a, b }
}

// Current calculated correlation
const calculatedCorrelation = computed(() => {
  if (challengeActive.value && currentMode.value === 'derivation') {
    return calculateCorrelation(challengeDataPoints.value)
  }
  return calculateCorrelation(dataPoints.value)
})

// Current regression line
const regressionLine = computed(() => {
  const points = (challengeActive.value && currentMode.value === 'derivation') 
    ? challengeDataPoints.value 
    : dataPoints.value
  return calculateRegression(points)
})

// Trend line from user input
const userTrendLine = computed(() => {
  return {
    a: userSlope.value,
    b: userIntercept.value
  }
})

// Correlation strength description
const correlationDescription = computed(() => {
  const r = Math.abs(calculatedCorrelation.value)
  if (r >= 0.9) return 'Zeer sterk'
  if (r >= 0.7) return 'Sterk'
  if (r >= 0.5) return 'Matig'
  if (r >= 0.3) return 'Zwak'
  return 'Zeer zwak / geen'
})

// Direction of correlation
const correlationDirection = computed(() => {
  const r = calculatedCorrelation.value
  if (r > 0.1) return 'Positieve correlatie'
  if (r < -0.1) return 'Negatieve correlatie'
  return 'Geen correlatie'
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate random parameters for challenge
  targetSlope.value = (Math.random() * 3 - 1.5)
  targetIntercept.value = (Math.random() * 6 - 3)
  targetCorrelation.value = 0.4 + Math.random() * 0.5
  
  // Reset user inputs
  userSlope.value = 1
  userIntercept.value = 0
  userCorrelation.value = 0.5
  userPrediction.value = 0
  
  // Generate challenge data
  challengeDataPoints.value = generateScatterData(
    numPoints, 
    targetSlope.value, 
    targetIntercept.value, 
    targetCorrelation.value,
    2
  )
  
  // Generate prediction target for prediction challenge
  if (type === 'predict-value') {
    predictionTarget.value = {
      x: Math.round((Math.random() * 10 - 5) * 10) / 10,
      y: targetSlope.value * (Math.random() * 10 - 5) + targetIntercept.value + (Math.random() * 2 - 1)
    }
  }
}

function checkChallenge() {
  let success = false
  
  if (challengeType.value === 'estimate-correlation') {
    const tolerance = 0.15
    const diff = Math.abs(userCorrelation.value - Math.abs(calculatedCorrelation.value))
    if (diff < tolerance) {
      success = true
      challengeFeedback.value = `Correct! De correlatiecoëfficiënt is ${calculatedCorrelation.value.toFixed(2)}.`
    } else {
      challengeFeedback.value = 'Nog niet juist. Kijk goed naar de spreiding van de punten.'
    }
  } else if (challengeType.value === 'fit-trendline') {
    const tolerance = 0.2
    const aDiff = Math.abs(userSlope.value - regressionLine.value.a)
    const bDiff = Math.abs(userIntercept.value - regressionLine.value.b)
    if (aDiff < tolerance && bDiff < tolerance) {
      success = true
      challengeFeedback.value = 'Correct! De trendlijn past goed bij de data.'
    } else {
      const errors = []
      if (aDiff >= tolerance) errors.push('richtingscoëfficiënt')
      if (bDiff >= tolerance) errors.push('snijpunt met y-as')
      challengeFeedback.value = `Nog niet juist. Controleer de ${errors.join(' en ')}.`
    }
  } else if (challengeType.value === 'predict-value') {
    const predictedY = userSlope.value * predictionTarget.value.x + userIntercept.value
    const tolerance = 1.0
    const diff = Math.abs(userPrediction.value - predictedY)
    if (diff < tolerance) {
      success = true
      challengeFeedback.value = 'Correct! De voorspelling klopt.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Gebruik de trendlijn om de voorspelling te doen.'
    }
  }
  
  challengeSolved.value = success
}

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -8
const viewBoxY = -6
const viewBoxWidth = 16
const viewBoxHeight = 12

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

function generateLinePath(a, b) {
  const xMin = viewBoxX
  const xMax = viewBoxX + viewBoxWidth
  const y1 = a * xMin + b
  const y2 = a * xMax + b
  
  return {
    x1: toSvgX(xMin),
    y1: toSvgY(y1),
    x2: toSvgX(xMax),
    y2: toSvgY(y2)
  }
}

// User trend line
const userLine = computed(() => generateLinePath(userSlope.value, userIntercept.value))

// Regression trend line
const regressionLinePath = computed(() => {
  const { a, b } = regressionLine.value
  return generateLinePath(a, b)
})

// Target line for some challenges
const targetLine = computed(() => generateLinePath(targetSlope.value, targetIntercept.value))

// ==================== LIFECYCLE ====================
watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
  } else if (!val && document.fullscreenElement) {
  }
  
  // Generate initial data when opened
  if (val) {
    dataPoints.value = generateScatterData(numPoints, slope.value, intercept.value, correlationStrength.value, spread.value)
  }
}, { immediate: true })

onUnmounted(() => {
})

// Regenerate data when parameters change in analysis mode
watch([slope, intercept, correlationStrength, spread], () => {
  if (currentMode.value === 'analysis') {
    dataPoints.value = generateScatterData(numPoints, slope.value, intercept.value, correlationStrength.value, spread.value)
  }
})

// ==================== ANALYSIS STEPS ====================
const analysisSteps = [
  {
    title: 'Spreidingsdiagram (Scatter Plot)',
    description: 'Een spreidingsdiagram toont de relatie tussen twee variabelen.',
    focus: 'scatter',
    instruction: 'Observeer hoe de punten zijn verdeeld in het vlak.',
    details: [
      'Elk punt staat voor een (x, y)-paar',
      'De x-as toont de onafhankelijke variabele',
      'De y-as toont de afhankelijke variabele',
      'Punten dicht bij een lijn = sterke relatie'
    ]
  },
  {
    title: 'Trendlijn (Regressierechte)',
    description: 'De trendlijn is de beste rechte lijn door de puntenwolk.',
    focus: 'trend',
    instruction: 'Pas de parameters aan en zie hoe de trendlijn verandert.',
    details: [
      'De trendlijn volgt de methode van kleinste kwadraten',
      'Richtingscoëfficiënt a geeft de richting',
      'Snijpunt b geeft de hoogte op de y-as',
      'De lijn minimaliseert de afwijkingen'
    ]
  },
  {
    title: 'Correlatiecoëfficiënt r',
    description: 'De correlatiecoëfficiënt geeft de sterkte van het verband.',
    focus: 'correlation',
    instruction: 'Wijzig de spreiding en observeer het effect op r.',
    details: [
      'r = +1: perfect positief verband',
      'r = -1: perfect negatief verband',
      'r = 0: geen lineair verband',
      '|r| > 0.7: sterk verband'
    ]
  },
  {
    title: 'Spreiding en Ruis',
    description: 'De spreiding bepaalt hoe ver de punten van de lijn liggen.',
    focus: 'spread',
    instruction: 'Verander de spreiding en zie wat er gebeurt.',
    details: [
      'Lage spreiding: punten dicht bij de lijn',
      'Hoge spreiding: punten ver van de lijn',
      'Spreiding beïnvloedt de voorspellingen',
      'R² (determinatiecoëfficiënt) = r²'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
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
            <PhChartScatter class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Spreidingsdiagrammen</h1>
            <p class="text-sm text-slate-500">Correlatie en lineaire regressie</p>
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
              Analyse
            </button>
            <button 
              @click="currentMode = 'derivation'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Toepassing
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
          
          <!-- Mode: Analysis -->
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

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Trend line parameters -->
              <div v-if="analysisSteps[currentStep].focus === 'trend' || analysisSteps[currentStep].focus === 'scatter'" class="space-y-4">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">a (richtingscoëfficiënt)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ slope.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="slope" 
                    min="-2" 
                    max="2" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">b (snijpunt y-as)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ intercept.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="intercept" 
                    min="-4" 
                    max="4" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Correlation strength -->
              <div v-if="analysisSteps[currentStep].focus === 'correlation' || analysisSteps[currentStep].focus === 'spread'" class="space-y-4">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Correlatie r</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ correlationStrength.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="correlationStrength" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>Geen (0)</span>
                    <span>Matig</span>
                    <span>Perfect (1)</span>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Spreiding</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ spread.toFixed(1) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="spread" 
                    min="0.5" 
                    max="3" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Correlation info -->
              <div v-if="analysisSteps[currentStep].focus === 'correlation'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Berekende correlatie</p>
                <div class="text-2xl font-mono font-bold" :class="calculatedCorrelation > 0 ? 'text-emerald-600' : 'text-rose-600'">
                  r = {{ calculatedCorrelation.toFixed(3) }}
                </div>
                <div class="text-sm text-slate-600 mt-1">
                  {{ correlationDescription }}
                </div>
              </div>

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

          <!-- Mode: Derivation/Challenge -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassingen</h2>
              <p class="text-sm text-slate-600">Oefen met het analyseren van spreidingsdiagrammen.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('estimate-correlation')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Schat de correlatie</div>
                  <div class="text-xs text-slate-500 mt-1">Geef een schatting van de correlatiecoëfficiënt r.</div>
                </button>
                
                <button @click="generateChallenge('fit-trendline')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Pas de trendlijn aan</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal de beste trendlijn door de puntenwolk.</div>
                </button>
                
                <button @click="generateChallenge('predict-value')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Voorspel een waarde</div>
                  <div class="text-xs text-slate-500 mt-1">Gebruik de trendlijn om een y-waarde te voorspellen.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Opdracht:</p>
                  <div v-if="challengeType === 'estimate-correlation'" class="mt-2 text-xs text-white/80">
                    <p>Schat de correlatiecoëfficiënt r (tussen -1 en 1).</p>
                    <p class="mt-1 text-white/60">Tip: kijk naar de richting en spreiding.</p>
                  </div>
                  <div v-if="challengeType === 'fit-trendline'" class="mt-2 text-xs text-white/80">
                    <p>Pas a en b zo aan dat de trendlijn het beste past.</p>
                    <p class="mt-1 text-white/60">Tip: de lijn moet door het midden van de punten gaan.</p>
                  </div>
                  <div v-if="challengeType === 'predict-value'" class="mt-2 text-xs text-white/80">
                    <p>Voorspel y voor x = {{ predictionTarget.x }}</p>
                    <p class="mt-1 text-white/60">Tip: gebruik eerst de trendlijn om a en b te bepalen.</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <!-- Correlation estimation -->
                  <div v-if="challengeType === 'estimate-correlation'" class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Jouw schatting van r</label>
                    <input 
                      type="range" 
                      v-model.number="userCorrelation" 
                      min="-1" 
                      max="1" 
                      step="0.05"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <div class="flex justify-between text-xs text-slate-400">
                      <span>-1</span>
                      <span class="font-mono font-bold">{{ userCorrelation.toFixed(2) }}</span>
                      <span>+1</span>
                    </div>
                  </div>
                  
                  <!-- Trend line fitting -->
                  <template v-if="challengeType === 'fit-trendline' || challengeType === 'predict-value'">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">a (richtingscoëfficiënt)</label>
                      <input 
                        type="number" 
                        v-model.number="userSlope" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">b (snijpunt y-as)</label>
                      <input 
                        type="number" 
                        v-model.number="userIntercept" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus-brand-orange"
                      >
                    </div>
                  </template>
                  
                  <!-- Value prediction -->
                  <div v-if="challengeType === 'predict-value'" class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Voorspelde y-waarde</label>
                    <input 
                      type="number" 
                      v-model.number="userPrediction" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
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
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wiskundige kenmerken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Aantal punten:</span>
                <span class="font-mono">
                  {{ challengeActive ? challengeDataPoints.length : dataPoints.length }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Correlatie r:</span>
                <span class="font-mono" :class="Math.abs(calculatedCorrelation) > 0.7 ? 'text-emerald-600 font-bold' : 'text-slate-700'">
                  {{ calculatedCorrelation.toFixed(3) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Sterkte:</span>
                <span :class="['font-medium', 
                  Math.abs(calculatedCorrelation) >= 0.7 ? 'text-emerald-600' : 
                  Math.abs(calculatedCorrelation) >= 0.4 ? 'text-amber-600' : 'text-rose-600']">
                  {{ correlationDescription }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Richting:</span>
                <span :class="['font-medium',
                  calculatedCorrelation > 0.1 ? 'text-emerald-600' : 
                  calculatedCorrelation < -0.1 ? 'text-rose-600' : 'text-slate-500']">
                  {{ correlationDirection }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Trendlijn:</span>
                <span class="font-mono text-xs">
                  y = {{ regressionLine.a.toFixed(2) }}x + {{ regressionLine.b.toFixed(2) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">R² (determinatie):</span>
                <span class="font-mono">
                  {{ (calculatedCorrelation * calculatedCorrelation).toFixed(3) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Title Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Spreidingsdiagram:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">y = {{ slope.toFixed(1) }}x + {{ intercept.toFixed(1) }}</span>
              <span class="text-sm text-slate-400">met r ≈ {{ correlationStrength.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Graph Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid -->
              <g stroke="#E2E8F0" stroke-width="1">
                <!-- Vertical lines -->
                <line v-for="i in 17" :key="`v${i}`" 
                  :x1="toSvgX(-8 + i)" y1="0" 
                  :x2="toSvgX(-8 + i)" :y2="svgHeight" 
                />
                <!-- Horizontal lines -->
                <line v-for="i in 13" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-6 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-6 + i)" 
                />
              </g>

              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

              <!-- Axis labels -->
              <text :x="toSvgX(7.5)" :y="toSvgY(0) + 20" class="fill-slate-400 text-sm">x</text>
              <text :x="toSvgX(0) + 10" :y="toSvgY(5.5) + 15" class="fill-slate-400 text-sm">y</text>

              <!-- Data points -->
              <g v-if="!challengeActive">
                <circle 
                  v-for="(point, idx) in dataPoints" 
                  :key="`p${idx}`"
                  :cx="toSvgX(point.x)" 
                  :cy="toSvgY(point.y)" 
                  r="5" 
                  fill="#3B82F6" 
                  fill-opacity="0.7"
                  stroke="white" 
                  stroke-width="1"
                />
              </g>
              
              <!-- Challenge data points -->
              <g v-else>
                <circle 
                  v-for="(point, idx) in challengeDataPoints" 
                  :key="`cp${idx}`"
                  :cx="toSvgX(point.x)" 
                  :cy="toSvgY(point.y)" 
                  r="5" 
                  fill="#3B82F6" 
                  fill-opacity="0.7"
                  stroke="white" 
                  stroke-width="1"
                />
              </g>

              <!-- Target trend line (in challenge mode) -->
              <line 
                v-if="challengeActive && challengeType === 'fit-trendline'" 
                :x1="targetLine.x1" :y1="targetLine.y1" 
                :x2="targetLine.x2" :y2="targetLine.y2"
                stroke="#CBD5E1" 
                stroke-width="3" 
                stroke-dasharray="8,4"
                opacity="0.5"
              />

              <!-- User trend line in challenge mode -->
              <line 
                v-if="challengeActive && (challengeType === 'fit-trendline' || challengeType === 'predict-value')" 
                :x1="userLine.x1" :y1="userLine.y1" 
                :x2="userLine.x2" :y2="userLine.y2"
                stroke="#F97316" 
                stroke-width="3"
                opacity="0.7"
              />

              <!-- Calculated regression line (shown in analysis mode) -->
              <line 
                v-if="!challengeActive"
                :x1="regressionLinePath.x1" :y1="regressionLinePath.y1" 
                :x2="regressionLinePath.x2" :y2="regressionLinePath.y2"
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Prediction point -->
              <g v-if="challengeActive && challengeType === 'predict-value'">
                <circle 
                  :cx="toSvgX(predictionTarget.x)" 
                  :cy="toSvgY(userSlope * predictionTarget.x + userIntercept)" 
                  r="7" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(predictionTarget.x)" 
                  :y="toSvgY(userSlope * predictionTarget.x + userIntercept) - 12" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  Voorspelling
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span class="text-slate-600">Data punten</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">Trendlijn</span>
                </div>
                <div v-if="challengeActive && challengeType === 'fit-trendline'" class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-slate-300" style="border-top: 2px dashed #CBD5E1;"></div>
                  <span class="text-slate-600">Doellijn</span>
                </div>
                <div v-if="challengeActive && challengeType === 'predict-value'" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Voorspelling</span>
                </div>
              </div>
            </div>

            <!-- Correlation badge -->
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <div class="text-xs text-slate-500">Correlatie r</div>
              <div class="text-lg font-mono font-bold" :class="calculatedCorrelation > 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ calculatedCorrelation.toFixed(3) }}
              </div>
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