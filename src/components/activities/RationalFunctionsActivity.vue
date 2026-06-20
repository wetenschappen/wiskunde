<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhArrowsOutCardinal, PhArrowsHorizontal, PhArrowsVertical,
  PhScales, PhTarget
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Basic function f(x) = c/x
const c = ref(4)

// Transformation parameters
const kMultiplier = ref(1)  // k·f(x)
const kVertical = ref(0)    // f(x) + k
const kHorizontal = ref(0)  // f(x - k)

// Transform mode active
const showTransformations = ref(false)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'formula-to-graph', 'graph-to-formula'
const targetC = ref(1)
const targetKMult = ref(1)
const targetKVert = ref(0)
const targetKHoriz = ref(0)
const userC = ref(1)
const userKMult = ref(1)
const userKVert = ref(0)
const userKHoriz = ref(0)
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Current transformed function: f(x) = k·c/(x-h) + v
// where k = kMultiplier, h = kHorizontal, v = kVertical

const effectiveC = computed(() => c.value * kMultiplier.value)

const f = (x) => {
  const denominator = x - kHorizontal.value
  if (Math.abs(denominator) < 0.01) return null // Avoid division by zero
  return effectiveC.value / denominator + kVertical.value
}

// Asymptotes
const verticalAsymptote = computed(() => kHorizontal.value)
const horizontalAsymptote = computed(() => kVertical.value)

// Domain: all real numbers except vertical asymptote
const domain = computed(() => {
  return `ℝ \\ {${kHorizontal.value}}`
})

// Range: all real numbers except horizontal asymptote
const range = computed(() => {
  if (kMultiplier.value > 0) {
    return `]-∞, ${kVertical.value}[ ∪ ]${kVertical.value}, +∞[`
  } else {
    return `]-∞, ${kVertical.value}[ ∪ ]${kVertical.value}, +∞[`
  }
})

// Equation display
const equationText = computed(() => {
  const cVal = effectiveC.value
  const hVal = kHorizontal.value
  const vVal = kVertical.value
  
  let text = 'f(x) = '
  
  // Multiplier
  if (Math.abs(kMultiplier.value) !== 1 || cVal < 0) {
    if (kMultiplier.value === -1) {
      text += '-'
    } else if (kMultiplier.value !== 1) {
      text += `${kMultiplier.value.toFixed(1)}·`
    }
  }
  
  // Fraction
  text += `${Math.abs(c.value)}/`
  
  // Denominator
  if (hVal === 0) {
    text += 'x'
  } else if (hVal > 0) {
    text += `(x - ${hVal})`
  } else {
    text += `(x + ${Math.abs(hVal)})`
  }
  
  // Vertical shift
  if (vVal > 0) {
    text += ` + ${vVal}`
  } else if (vVal < 0) {
    text += ` - ${Math.abs(vVal)}`
  }
  
  return text
})

// Basic equation without transformations
const basicEquationText = computed(() => {
  return `f(x) = ${c.value}/x`
})

// Symmetry check - symmetric about origin if no transformations
const isSymmetricAboutOrigin = computed(() => {
  return kVertical.value === 0 && kHorizontal.value === 0
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate random parameters
  targetC.value = [2, 3, 4, 6, 8][Math.floor(Math.random() * 5)]
  targetKMult.value = [1, 2, 0.5, -1, -2][Math.floor(Math.random() * 5)]
  targetKVert.value = Math.floor(Math.random() * 7) - 3 // -3 to 3
  targetKHoriz.value = Math.floor(Math.random() * 7) - 3 // -3 to 3
  
  // Reset user inputs
  userC.value = 2
  userKMult.value = 1
  userKVert.value = 0
  userKHoriz.value = 0
}

function checkChallenge() {
  const toleranceC = 0.1
  const tolerance = 0.1
  
  const cCorrect = Math.abs(userC.value - targetC.value) < toleranceC
  const multCorrect = Math.abs(userKMult.value - targetKMult.value) < tolerance
  const vertCorrect = Math.abs(userKVert.value - targetKVert.value) < tolerance
  const horizCorrect = Math.abs(userKHoriz.value - targetKHoriz.value) < tolerance
  
  if (cCorrect && multCorrect && vertCorrect && horizCorrect) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! De hyperbool komt exact overeen met de gegeven grafiek.'
    emit('complete')
  } else {
    const errors = []
    if (!cCorrect) errors.push('c')
    if (!multCorrect) errors.push('k (vermenigvuldiging)')
    if (!vertCorrect) errors.push('verticale verschuiving')
    if (!horizCorrect) errors.push('horizontale verschuiving')
    challengeFeedback.value = `Nog niet juist. Controleer: ${errors.join(', ')}.`
  }
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

function generateHyperbolaPath(cVal, kMult, kHoriz, kVert) {
  const effectiveCValue = cVal * kMult
  const paths = { right: '', left: '' }
  
  // Right branch (x > h)
  const rightPoints = []
  for (let x = kHoriz + 0.05; x <= viewBoxX + viewBoxWidth; x += 0.05) {
    const y = effectiveCValue / (x - kHoriz) + kVert
    if (y >= viewBoxY - 1 && y <= viewBoxY + viewBoxHeight + 1) {
      rightPoints.push({ x: toSvgX(x), y: toSvgY(y) })
    }
  }
  
  // Left branch (x < h)
  const leftPoints = []
  for (let x = kHoriz - 0.05; x >= viewBoxX; x -= 0.05) {
    const y = effectiveCValue / (x - kHoriz) + kVert
    if (y >= viewBoxY - 1 && y <= viewBoxY + viewBoxHeight + 1) {
      leftPoints.push({ x: toSvgX(x), y: toSvgY(y) })
    }
  }
  
  // Build paths
  if (rightPoints.length > 1) {
    paths.right = `M ${rightPoints[0].x} ${rightPoints[0].y}` +
      rightPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('')
  }
  
  if (leftPoints.length > 1) {
    paths.left = `M ${leftPoints[0].x} ${leftPoints[0].y}` +
      leftPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('')
  }
  
  return paths
}

const currentHyperbolaPaths = computed(() => 
  generateHyperbolaPaths(c.value, kMultiplier.value, kHorizontal.value, kVertical.value)
)

const challengeTargetPaths = computed(() => 
  challengeActive.value ? generateHyperbolaPaths(targetC.value, targetKMult.value, targetKHoriz.value, targetKVert.value) : { right: '', left: '' }
)

const userHyperbolaPaths = computed(() => 
  generateHyperbolaPaths(userC.value, userKMult.value, userKHoriz.value, userKVert.value)
)

function generateHyperbolaPaths(cVal, kMult, kHoriz, kVert) {
  const effectiveCValue = cVal * kMult
  const paths = { right: '', left: '' }
  
  // Right branch (x > h)
  const rightPoints = []
  for (let x = kHoriz + 0.05; x <= viewBoxX + viewBoxWidth; x += 0.05) {
    const y = effectiveCValue / (x - kHoriz) + kVert
    if (y >= viewBoxY - 1 && y <= viewBoxY + viewBoxHeight + 1) {
      rightPoints.push({ x: toSvgX(x), y: toSvgY(y) })
    }
  }
  
  // Left branch (x < h)
  const leftPoints = []
  for (let x = kHoriz - 0.05; x >= viewBoxX; x -= 0.05) {
    const y = effectiveCValue / (x - kHoriz) + kVert
    if (y >= viewBoxY - 1 && y <= viewBoxY + viewBoxHeight + 1) {
      leftPoints.push({ x: toSvgX(x), y: toSvgY(y) })
    }
  }
  
  // Build paths
  if (rightPoints.length > 1) {
    paths.right = `M ${rightPoints[0].x} ${rightPoints[0].y}` +
      rightPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('')
  }
  
  if (leftPoints.length > 1) {
    paths.left = `M ${leftPoints[0].x} ${leftPoints[0].y}` +
      leftPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('')
  }
  
  return paths
}

// ==================== LIFECYCLE ====================
watch(() => props.isOpen, (val) => {
  if (val && !document.fullscreenElement) {
  } else if (!val && document.fullscreenElement) {
  }
}, { immediate: true })

onUnmounted(() => {
})

// ==================== ANALYSIS STEPS ====================
const analysisSteps = [
  {
    title: 'Invloed van parameter c',
    description: 'Parameter c bepaalt de vorm en positie van de hyperbool.',
    focus: 'c',
    instruction: 'Wijzig de waarde van c en observeer het effect op de grafiek.',
    details: [
      'c > 0: hyperbool in 1e en 3e kwadrant',
      'c < 0: hyperbool in 2e en 4e kwadrant',
      '|c| groter: grafiek verder van oorsprong',
      '|c| kleiner: grafiek dichter bij oorsprong'
    ]
  },
  {
    title: 'Verticale asymptoot',
    description: 'De verticale asymptoot is de lijn waar de functie niet gedefinieerd is.',
    focus: 'asymptote-vertical',
    instruction: 'Wijzig de horizontale verschuiving en observeer de verticale asymptoot.',
    details: [
      'Basis: x = 0 (y-as)',
      'Verschuiving met h: x = h',
      'Functie niet gedefinieerd bij x = h',
      'Domein: ℝ \\ {h}'
    ]
  },
  {
    title: 'Horizontale asymptoot',
    description: 'De horizontale asymptoot toont het grensgedrag voor grote |x|.',
    focus: 'asymptote-horizontal',
    instruction: 'Wijzig de verticale verschuiving en observeer de horizontale asymptoot.',
    details: [
      'Basis: y = 0 (x-as)',
      'Verschuiving met k: y = k',
      'lim f(x) = k voor x → ±∞',
      'Bereik: ℝ \\ {k}'
    ]
  },
  {
    title: 'Symmetrie',
    description: 'De hyperbool f(x) = c/x is symmetrisch ten opzichte van de oorsprong.',
    focus: 'symmetry',
    instruction: 'Controleer: als (a,b) op de grafiek ligt, dan ook (-a,-b).',
    details: [
      'Puntsymmetrie t.o.v. (0,0)',
      'f(-x) = -f(x) (oneven functie)',
      'Snijpunt asymptoten is symmetriecentrum',
      'Bij transformaties: symmetrie t.o.v. (h,k)'
    ]
  },
  {
    title: 'Transformaties',
    description: 'Onderzoek de drie typen transformaties van de hyperbool.',
    focus: 'transformations',
    instruction: 'Experimenteer met vermenigvuldiging, verticale en horizontale verschuiving.',
    details: [
      'k·f(x): verticale uitrekking/reflectie',
      'f(x) + k: verticale verschuiving',
      'f(x - k): horizontale verschuiving',
      'Combinatie geeft algemene vorm'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    if (analysisSteps[currentStep.value].focus === 'transformations') {
      showTransformations.value = true
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    if (analysisSteps[currentStep.value].focus !== 'transformations') {
      showTransformations.value = false
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
            <PhArrowsOutCardinal class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Hyperbool f(x) = c/x</h1>
            <p class="text-sm text-slate-500">Asymptoten, transformaties en symmetrie</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Mode Switcher -->
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'analysis'; showTransformations = false"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'analysis' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Parameteranalyse
            </button>
            <button 
              @click="currentMode = 'derivation'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Voorschriftbepaling
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
          
          <!-- Mode: Parameter Analysis -->
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
              
              <!-- Parameter c -->
              <div v-if="analysisSteps[currentStep].focus === 'c' || analysisSteps[currentStep].focus === 'transformations'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">c (basisparameter)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ c }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="c" 
                  min="-8" 
                  max="8" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="flex justify-between text-xs text-slate-400">
                  <span>Negatief</span>
                  <span>Nul</span>
                  <span>Positief</span>
                </div>
              </div>

              <!-- Vertical Asymptote / Horizontal Shift -->
              <div v-if="analysisSteps[currentStep].focus === 'asymptote-vertical' || analysisSteps[currentStep].focus === 'transformations'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">h (horizontale verschuiving)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ kHorizontal }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="kHorizontal" 
                  min="-5" 
                  max="5" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="p-2 bg-slate-50 rounded border border-slate-200">
                  <p class="text-xs text-slate-600">Verticale asymptoot: <span class="font-mono font-bold text-brand-orange">x = {{ kHorizontal }}</span></p>
                </div>
              </div>

              <!-- Horizontal Asymptote / Vertical Shift -->
              <div v-if="analysisSteps[currentStep].focus === 'asymptote-horizontal' || analysisSteps[currentStep].focus === 'transformations'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">k (verticale verschuiving)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ kVertical }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="kVertical" 
                  min="-4" 
                  max="4" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="p-2 bg-slate-50 rounded border border-slate-200">
                  <p class="text-xs text-slate-600">Horizontale asymptoot: <span class="font-mono font-bold text-brand-orange">y = {{ kVertical }}</span></p>
                </div>
              </div>

              <!-- Symmetry visualization -->
              <div v-if="analysisSteps[currentStep].focus === 'symmetry'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Symmetrie-eigenschap</p>
                <p class="text-xs text-slate-600 mb-2">Voor f(x) = {{ c }}/x geldt:</p>
                <div class="text-sm font-mono space-y-1">
                  <p>f(-x) = {{ c }}/(-x) = -{{ c }}/x = -f(x)</p>
                  <p class="text-brand-orange">⇒ Oneven functie</p>
                </div>
              </div>

              <!-- Multiplier for transformations -->
              <div v-if="analysisSteps[currentStep].focus === 'transformations'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">a (vermenigvuldigingsfactor)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ kMultiplier }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="kMultiplier" 
                  min="-3" 
                  max="3" 
                  step="0.25"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="flex justify-between text-xs text-slate-400">
                  <span>Negatief</span>
                  <span>|a| &lt; 1: smaller</span>
                  <span>|a| &gt; 1: breder</span>
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

          <!-- Mode: Formula Derivation / Challenge -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Voorschriftbepaling</h2>
              <p class="text-sm text-slate-600">Stel het voorschrift op vanuit de gegeven asymptoten en punten.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('formula-to-graph')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: asymptoten + punt</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal c en de transformaties vanuit de asymptoten.</div>
                </button>
                
                <button @click="generateChallenge('graph-to-formula')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: grafiek</div>
                  <div class="text-xs text-slate-500 mt-1">Lees de asymptoten af en bepaal het voorschrift.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal het voorschrift:</p>
                  <p class="text-xs text-white/70 mt-1">
                    Gebruik de asymptoten (gestippeld) en de vorm van de hyperbool.
                  </p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">c (basis)</label>
                    <input 
                      type="number" 
                      v-model.number="userC" 
                      step="0.5"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">a (vermenigvuldiging)</label>
                    <input 
                      type="number" 
                      v-model.number="userKMult" 
                      step="0.25"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">h (horizontale verschuiving)</label>
                    <input 
                      type="number" 
                      v-model.number="userKHoriz" 
                      step="0.5"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">k (verticale verschuiving)</label>
                    <input 
                      type="number" 
                      v-model.number="userKVert" 
                      step="0.5"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus-brand-orange"
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
                <span class="text-slate-600">Domein:</span>
                <span class="font-mono">{{ domain }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Bereik:</span>
                <span class="font-mono">{{ range }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Verticale asymptoot:</span>
                <span class="font-mono text-brand-orange">x = {{ verticalAsymptote }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Horizontale asymptoot:</span>
                <span class="font-mono text-brand-orange">y = {{ horizontalAsymptote }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Symmetrie:</span>
                <span :class="['font-medium', isSymmetricAboutOrigin ? 'text-emerald-600' : 'text-slate-500']">
                  {{ isSymmetricAboutOrigin ? 't.o.v. oorsprong' : 't.o.v. (' + kHorizontal + ',' + kVertical + ')' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Functievoorschrift:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">{{ challengeActive ? basicEquationText : equationText }}</span>
            </div>
            <div v-if="!challengeActive && showTransformations" class="flex items-center justify-center gap-4 mt-2">
              <span class="text-sm text-slate-500">Getransformeerde vorm:</span>
              <span class="text-lg font-mono text-slate-600">f(x) = {{ kMultiplier !== 1 ? kMultiplier + '·' : '' }}{{ c }}/(x{{ kHorizontal !== 0 ? (kHorizontal > 0 ? '-' + kHorizontal : '+' + Math.abs(kHorizontal)) : '' }}){{ kVertical !== 0 ? (kVertical > 0 ? '+' + kVertical : kVertical) : '' }}</span>
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

              <!-- Asymptotes -->
              <!-- Vertical asymptote -->
              <line 
                :x1="toSvgX(verticalAsymptote)" y1="0" 
                :x2="toSvgX(verticalAsymptote)" :y2="svgHeight"
                stroke="#94A3B8" 
                stroke-width="2" 
                stroke-dasharray="6,4"
              />
              
              <!-- Horizontal asymptote -->
              <line 
                x1="0" :y1="toSvgY(horizontalAsymptote)" 
                :x2="svgWidth" :y2="toSvgY(horizontalAsymptote)"
                stroke="#94A3B8" 
                stroke-width="2" 
                stroke-dasharray="6,4"
              />

              <!-- Asymptote labels -->
              <text 
                :x="toSvgX(verticalAsymptote) + 5" 
                y="20" 
                class="fill-slate-400 text-xs font-bold"
              >
                x = {{ verticalAsymptote }}
              </text>
              <text 
                :x="svgWidth - 60" 
                :y="toSvgY(horizontalAsymptote) - 5" 
                class="fill-slate-400 text-xs font-bold"
              >
                y = {{ horizontalAsymptote }}
              </text>

              <!-- Challenge target hyperbola (in derivation mode) -->
              <template v-if="challengeActive && currentMode === 'derivation'">
                <path 
                  v-if="challengeTargetPaths.right" 
                  :d="challengeTargetPaths.right" 
                  fill="none" 
                  stroke="#CBD5E1" 
                  stroke-width="3" 
                  stroke-dasharray="8,4"
                />
                <path 
                  v-if="challengeTargetPaths.left" 
                  :d="challengeTargetPaths.left" 
                  fill="none" 
                  stroke="#CBD5E1" 
                  stroke-width="3" 
                  stroke-dasharray="8,4"
                />
                
                <!-- Target asymptotes -->
                <line 
                  :x1="toSvgX(targetKHoriz)" y1="0" 
                  :x2="toSvgX(targetKHoriz)" :y2="svgHeight"
                  stroke="#CBD5E1" 
                  stroke-width="2" 
                  stroke-dasharray="4,2"
                />
                <line 
                  x1="0" :y1="toSvgY(targetKVert)" 
                  :x2="svgWidth" :y2="toSvgY(targetKVert)"
                  stroke="#CBD5E1" 
                  stroke-width="2" 
                  stroke-dasharray="4,2"
                />
              </template>

              <!-- User hyperbola in challenge mode -->
              <template v-if="challengeActive && currentMode === 'derivation'">
                <path 
                  v-if="userHyperbolaPaths.right" 
                  :d="userHyperbolaPaths.right" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                  opacity="0.7"
                />
                <path 
                  v-if="userHyperbolaPaths.left" 
                  :d="userHyperbolaPaths.left" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                  opacity="0.7"
                />
              </template>

              <!-- Current hyperbola -->
              <template v-else>
                <path 
                  v-if="currentHyperbolaPaths.right" 
                  :d="currentHyperbolaPaths.right" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
                <path 
                  v-if="currentHyperbolaPaths.left" 
                  :d="currentHyperbolaPaths.left" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
              </template>

              <!-- Symmetry center point (intersection of asymptotes) -->
              <circle 
                :cx="toSvgX(verticalAsymptote)" 
                :cy="toSvgY(horizontalAsymptote)" 
                r="4" 
                fill="#10B981" 
                stroke="white" 
                stroke-width="2"
              />
              <text 
                :x="toSvgX(verticalAsymptote) + 8" 
                :y="toSvgY(horizontalAsymptote) - 8" 
                class="fill-emerald-600 text-xs font-bold"
              >
                Symmetriecentrum
              </text>

              <!-- Sample points for demonstration -->
              <g v-if="!challengeActive && currentMode === 'analysis'">
                <circle 
                  :cx="toSvgX(1 + kHorizontal)" 
                  :cy="toSvgY(effectiveC + kVertical)" 
                  r="4" 
                  fill="#3B82F6" 
                  stroke="white" 
                  stroke-width="2"
                />
                <circle 
                  :cx="toSvgX(-1 + kHorizontal)" 
                  :cy="toSvgY(-effectiveC + kVertical)" 
                  r="4" 
                  fill="#3B82F6" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(1 + kHorizontal) + 8" 
                  :y="toSvgY(effectiveC + kVertical)" 
                  class="fill-blue-600 text-xs"
                >
                  ({{ 1 + kHorizontal }}, {{ Math.round((effectiveC + kVertical) * 100) / 100 }})
                </text>
                <text 
                  :x="toSvgX(-1 + kHorizontal) + 8" 
                  :y="toSvgY(-effectiveC + kVertical)" 
                  class="fill-blue-600 text-xs"
                >
                  ({{ -1 + kHorizontal }}, {{ Math.round((-effectiveC + kVertical) * 100) / 100 }})
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">f(x) = {{ c }}/x</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Symmetriecentrum</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-0.5 border-t-2 border-dashed border-slate-400"></div>
                  <span class="text-slate-600">Asymptoten</span>
                </div>
                <div v-if="challengeActive && currentMode === 'derivation'" class="flex items-center gap-2">
                  <div class="w-6 h-0.5 border-t-2 border-dashed border-slate-300"></div>
                  <span class="text-slate-600">Doelgrafiek</span>
                </div>
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

input[type="range"] {
  accent-color: #F97316;
}
</style>