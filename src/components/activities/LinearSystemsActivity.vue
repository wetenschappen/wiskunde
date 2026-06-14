<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhIntersect, PhArrowsInLineHorizontal, PhArrowsHorizontal
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' } // 'analysis' or 'derivation'
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentAlgebraicStep = ref(0)
const selectedMethod = ref('substitution') // 'substitution', 'equalization', 'elimination'

// Mathematical parameters for two linear equations
// Equation 1: a1*x + b1*y = c1
// Equation 2: a2*x + b2*y = c2
const a1 = ref(2)
const b1 = ref(1)
const c1 = ref(6)

const a2 = ref(1)
const b2 = ref(-1)
const c2 = ref(0)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'graphical', 'substitution', 'equalization', 'elimination'
const userX = ref(0)
const userY = ref(0)
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const showSolution = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Convert to slope-intercept form for graphing
// y = (-a/b)x + (c/b)
const slope1 = computed(() => -a1.value / b1.value)
const intercept1 = computed(() => c1.value / b1.value)

const slope2 = computed(() => -a2.value / b2.value)
const intercept2 = computed(() => c2.value / b2.value)

// Calculate intersection point (solution)
const solution = computed(() => {
  const determinant = a1.value * b2.value - a2.value * b1.value
  if (determinant === 0) return null // Parallel or coincident lines
  
  const x = (c1.value * b2.value - c2.value * b1.value) / determinant
  const y = (a1.value * c2.value - a2.value * c1.value) / determinant
  return { x, y }
})

// Equation display in standard form
const equation1Text = computed(() => {
  const formatCoef = (n, first) => {
    if (n === 0) return ''
    if (first) return n === 1 ? '' : n === -1 ? '-' : n
    return n > 0 ? ` + ${n === 1 ? '' : n}` : ` - ${Math.abs(n) === 1 ? '' : Math.abs(n)}`
  }
  
  let text = ''
  if (a1.value !== 0) text += `${formatCoef(a1.value, true)}x`
  if (b1.value !== 0) text += `${formatCoef(b1.value, a1.value === 0)}y`
  text += ` = ${c1.value}`
  return text
})

const equation2Text = computed(() => {
  const formatCoef = (n, first) => {
    if (n === 0) return ''
    if (first) return n === 1 ? '' : n === -1 ? '-' : n
    return n > 0 ? ` + ${n === 1 ? '' : n}` : ` - ${Math.abs(n) === 1 ? '' : Math.abs(n)}`
  }
  
  let text = ''
  if (a2.value !== 0) text += `${formatCoef(a2.value, true)}x`
  if (b2.value !== 0) text += `${formatCoef(b2.value, a2.value === 0)}y`
  text += ` = ${c2.value}`
  return text
})

// Slope-intercept form for display
const slopeIntercept1 = computed(() => {
  const m = slope1.value
  const b = intercept1.value
  const sign = b >= 0 ? '+' : '-'
  return `y = ${m.toFixed(2)}x ${sign} ${Math.abs(b).toFixed(2)}`
})

const slopeIntercept2 = computed(() => {
  const m = slope2.value
  const b = intercept2.value
  const sign = b >= 0 ? '+' : '-'
  return `y = ${m.toFixed(2)}x ${sign} ${Math.abs(b).toFixed(2)}`
})

// System type description
const systemType = computed(() => {
  const det = a1.value * b2.value - a2.value * b1.value
  if (det !== 0) return 'Eén unieke oplossing (snijdende rechten)'
  
  // Check if equations are proportional
  const ratio = a1.value / a2.value
  if (Math.abs(b1.value / b2.value - ratio) < 0.001 && Math.abs(c1.value / c2.value - ratio) < 0.001) {
    return 'Oneindig veel oplossingen (samenvallende rechten)'
  }
  return 'Geen oplossing (evenwijdige rechten)'
})

// ==================== ALGEBRAIC METHODS STEPS ====================
const algebraicSteps = {
  substitution: [
    {
      title: 'Isoleren van x uit vergelijking 1',
      description: 'Druk x uit in functie van y',
      formula: computed(() => `x = (${c1.value} - ${b1.value}y) / ${a1.value}`),
      explanation: 'Herleid de eerste vergelijking naar x = ...'
    },
    {
      title: 'Substitutie in vergelijking 2',
      description: 'Vervang x in de tweede vergelijking',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `${a2.value} × (${solution.value.x.toFixed(2)}) + ${b2.value}y = ${c2.value}`
      }),
      explanation: 'Vervang x door de uitdrukking uit stap 1'
    },
    {
      title: 'Oplossen voor y',
      description: 'Bereken de waarde van y',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `y = ${solution.value.y.toFixed(2)}`
      }),
      explanation: 'Los de vergelijking op naar y'
    },
    {
      title: 'Terugsubstitutie voor x',
      description: 'Bereken x met de gevonden y-waarde',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `x = ${solution.value.x.toFixed(2)}`
      }),
      explanation: 'Vul y in in de uitdrukking voor x'
    }
  ],
  equalization: [
    {
      title: 'Isoleren van y in beide vergelijkingen',
      description: 'Druk y uit in functie van x',
      formula: computed(() => `y = (${c1.value} - ${a1.value}x) / ${b1.value}`),
      explanation: 'Herleid beide vergelijkingen naar y = ...'
    },
    {
      title: 'Gelijkstellen',
      description: 'Stel beide uitdrukkingen voor y gelijk aan elkaar',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `(${c1.value} - ${a1.value}x) / ${b1.value} = (${c2.value} - ${a2.value}x) / ${b2.value}`
      }),
      explanation: 'Omdat beide y\'s gelijk zijn, kun je de rechterleden gelijk stellen'
    },
    {
      title: 'Oplossen voor x',
      description: 'Bereken de waarde van x',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `x = ${solution.value.x.toFixed(2)}`
      }),
      explanation: 'Vereenvoudig en los op naar x'
    },
    {
      title: 'Berekenen van y',
      description: 'Vul x in om y te vinden',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `y = ${solution.value.y.toFixed(2)}`
      }),
      explanation: 'Gebruik een van de uitdrukkingen voor y'
    }
  ],
  elimination: [
    {
      title: 'Voorbereiden',
      description: 'Maak coëfficiënten van x of y gelijk',
      formula: computed(() => {
        const factor1 = a2.value
        const factor2 = a1.value
        return `${factor1}×(V1) en ${factor2}×(V2) om x te elimineren`
      }),
      explanation: 'Vermenigvuldig zodat a1 en a2 gelijk worden (met tegengesteld teken)'
    },
    {
      title: 'Optellen/Aftrekken',
      description: 'Tel de vergelijkingen op om x te elimineren',
      formula: computed(() => {
        const newB = a2.value * b1.value - a1.value * b2.value
        const newC = a2.value * c1.value - a1.value * c2.value
        return `${newB}y = ${newC}`
      }),
      explanation: 'Tel de vergelijkingen op; de x-termen vallen weg'
    },
    {
      title: 'Oplossen voor y',
      description: 'Bereken de waarde van y',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `y = ${solution.value.y.toFixed(2)}`
      }),
      explanation: 'Deel beide zijden door de coëfficiënt van y'
    },
    {
      title: 'Terugsubstitutie',
      description: 'Vul y in om x te vinden',
      formula: computed(() => {
        if (!solution.value) return 'Geen oplossing'
        return `${a1.value}x + ${b1.value}×(${solution.value.y.toFixed(2)}) = ${c1.value}`
      }),
      explanation: 'Vul de gevonden y-waarde in een van de oorspronkelijke vergelijkingen'
    }
  ]
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  showSolution.value = false
  
  // Generate random integer coefficients for clean solutions
  const solX = Math.floor(Math.random() * 8) - 4 // -4 to 4
  const solY = Math.floor(Math.random() * 8) - 4 // -4 to 4
  
  // Generate coefficients such that (solX, solY) is the solution
  a1.value = Math.floor(Math.random() * 4) + 1 // 1 to 4
  b1.value = Math.floor(Math.random() * 4) - 2 // -2 to 2
  c1.value = a1.value * solX + b1.value * solY
  
  a2.value = Math.floor(Math.random() * 4) - 2 // -2 to 2
  b2.value = Math.floor(Math.random() * 4) + 1 // 1 to 4
  c2.value = a2.value * solX + b2.value * solY
  
  // Reset user inputs
  userX.value = 0
  userY.value = 0
}

function checkChallenge() {
  if (!solution.value) {
    challengeFeedback.value = 'Dit stelsel heeft geen unieke oplossing.'
    return
  }
  
  const tolerance = 0.1
  const xCorrect = Math.abs(userX.value - solution.value.x) < tolerance
  const yCorrect = Math.abs(userY.value - solution.value.y) < tolerance
  
  if (xCorrect && yCorrect) {
    challengeSolved.value = true
    challengeFeedback.value = `Correct! De oplossing is (${solution.value.x.toFixed(1)}, ${solution.value.y.toFixed(1)})`
  } else {
    const errors = []
    if (!xCorrect) errors.push('x')
    if (!yCorrect) errors.push('y')
    challengeFeedback.value = `Nog niet juist. Controleer de waarde(n) voor ${errors.join(' en ')}.`
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

function generateLinePath(a, b, c) {
  // Line: ax + by = c => y = (-a/b)x + (c/b)
  if (b === 0) {
    // Vertical line x = c/a
    const x = c / a
    return {
      x1: toSvgX(x),
      y1: 0,
      x2: toSvgX(x),
      y2: svgHeight
    }
  }
  
  const m = -a / b
  const yInt = c / b
  
  const xMin = viewBoxX
  const xMax = viewBoxX + viewBoxWidth
  const y1 = m * xMin + yInt
  const y2 = m * xMax + yInt
  
  return {
    x1: toSvgX(xMin),
    y1: toSvgY(y1),
    x2: toSvgX(xMax),
    y2: toSvgY(y2)
  }
}

const line1Path = computed(() => generateLinePath(a1.value, b1.value, c1.value))
const line2Path = computed(() => generateLinePath(a2.value, b2.value, c2.value))

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
    title: 'Grafische oplossing',
    description: 'Het snijpunt van twee rechten geeft de oplossing van het stelsel.',
    focus: 'graphical',
    instruction: 'Wijzig de vergelijkingen en observeer het snijpunt.',
    details: [
      'Snijdende rechten: één unieke oplossing',
      'Evenwijdige rechten: geen oplossing',
      'Samenvallende rechten: oneindig veel oplossingen'
    ]
  },
  {
    title: 'Invloed van coëfficiënten',
    description: 'De coëfficiënten bepalen de richting en positie van elke rechte.',
    focus: 'coefficients',
    instruction: 'Experimenteer met verschillende waarden voor a, b en c.',
    details: [
      'a en b bepalen de richting van de rechte',
      'c bepaalt de verschuiving',
      'Het quotiënt a/b bepaalt de richtingscoëfficiënt'
    ]
  },
  {
    title: 'Determinant en oplosbaarheid',
    description: 'De determinant D = a₁b₂ - a₂b₁ bepaalt of er een oplossing is.',
    focus: 'determinant',
    instruction: 'Maak de determinant nul om evenwijdige rechten te bekomen.',
    details: [
      'D ≠ 0: één unieke oplossing',
      'D = 0 en evenredige c: oneindig veel oplossingen',
      'D = 0 en niet evenredige c: geen oplossing'
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

function nextAlgebraicStep() {
  const steps = algebraicSteps[selectedMethod.value]
  if (currentAlgebraicStep.value < steps.length - 1) {
    currentAlgebraicStep.value++
  }
}

function prevAlgebraicStep() {
  if (currentAlgebraicStep.value > 0) {
    currentAlgebraicStep.value--
  }
}

function resetAlgebraicSteps() {
  currentAlgebraicStep.value = 0
}

// Watch for method changes to reset steps
watch(selectedMethod, () => {
  resetAlgebraicSteps()
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhIntersect class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Stelsels van eerstegraadsvergelijkingen</h1>
            <p class="text-sm text-slate-500">Grafische en algebraïsche oplossingsmethoden</p>
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
              Grafische oplossing
            </button>
            <button 
              @click="currentMode = 'derivation'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Algebraïsche methoden
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
          
          <!-- Mode: Graphical Analysis -->
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

            <!-- Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Equation 1 controls -->
              <div class="space-y-3">
                <p class="text-sm font-bold text-brand-dark border-b border-slate-200 pb-1">Vergelijking 1</p>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">a₁ (coëff. x)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ a1 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="a1" 
                    min="-4" 
                    max="4" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">b₁ (coëff. y)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ b1 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="b1" 
                    min="-4" 
                    max="4" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">c₁ (constante)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ c1 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="c1" 
                    min="-8" 
                    max="8" 
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Equation 2 controls -->
              <div class="space-y-3 border-t border-slate-200 pt-4">
                <p class="text-sm font-bold text-brand-dark border-b border-slate-200 pb-1">Vergelijking 2</p>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">a₂ (coëff. x)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ a2 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="a2" 
                    min="-4" 
                    max="4" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">b₂ (coëff. y)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ b2 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="b2" 
                    min="-4" 
                    max="4" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">c₂ (constante)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ c2 }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="c2" 
                    min="-8" 
                    max="8" 
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
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

          <!-- Mode: Algebraic Methods -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Algebraïsche methoden</h2>
              <p class="text-sm text-slate-600">Leer de drie klassieke oplossingsmethoden.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Method Selection -->
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">Kies een methode:</label>
                <div class="grid grid-cols-1 gap-2">
                  <button 
                    @click="selectedMethod = 'substitution'"
                    :class="['p-3 text-left border rounded-lg transition-all', selectedMethod === 'substitution' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-brand-orange']"
                  >
                    <div class="font-medium text-sm text-slate-800">Substitutiemethode</div>
                    <div class="text-xs text-slate-500 mt-1">Isoleren en substitueren</div>
                  </button>
                  
                  <button 
                    @click="selectedMethod = 'equalization'"
                    :class="['p-3 text-left border rounded-lg transition-all', selectedMethod === 'equalization' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-brand-orange']"
                  >
                    <div class="font-medium text-sm text-slate-800">Gelijkstellingsmethode</div>
                    <div class="text-xs text-slate-500 mt-1">Beide naar zelfde variabele</div>
                  </button>
                  
                  <button 
                    @click="selectedMethod = 'elimination'"
                    :class="['p-3 text-left border rounded-lg transition-all', selectedMethod === 'elimination' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-brand-orange']"
                  >
                    <div class="font-medium text-sm text-slate-800">Combinatiemethode</div>
                    <div class="text-xs text-slate-500 mt-1">Optellen/aftrekken</div>
                  </button>
                </div>
              </div>

              <!-- Step Navigation -->
              <div class="border-t border-slate-200 pt-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stap {{ currentAlgebraicStep + 1 }} van {{ algebraicSteps[selectedMethod].length }}
                  </span>
                  <div class="flex gap-1">
                    <button 
                      @click="prevAlgebraicStep" 
                      :disabled="currentAlgebraicStep === 0"
                      class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <PhArrowLeft class="text-lg" />
                    </button>
                    <button 
                      @click="nextAlgebraicStep"
                      :disabled="currentAlgebraicStep === algebraicSteps[selectedMethod].length - 1"
                      class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <PhArrowRight class="text-lg" />
                    </button>
                  </div>
                </div>

                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-bold mb-1">
                    {{ algebraicSteps[selectedMethod][currentAlgebraicStep].title }}
                  </p>
                  <p class="text-xs text-white/80 mb-2">
                    {{ algebraicSteps[selectedMethod][currentAlgebraicStep].description }}
                  </p>
                  <div class="font-mono text-sm bg-white/10 rounded p-2 mt-2">
                    {{ algebraicSteps[selectedMethod][currentAlgebraicStep].formula }}
                  </div>
                </div>

                <p class="text-sm text-slate-600 mt-3">
                  {{ algebraicSteps[selectedMethod][currentAlgebraicStep].explanation }}
                </p>
              </div>

              <!-- Challenge Button -->
              <button 
                @click="generateChallenge(selectedMethod)"
                class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
              >
                Oefenopdracht starten
              </button>

              <!-- Active Challenge -->
              <div v-if="challengeActive" class="border-t border-slate-200 pt-4 space-y-3">
                <div class="p-3 bg-slate-100 rounded-lg">
                  <p class="text-sm font-bold text-slate-700 mb-2">Bepaal de oplossing (x, y):</p>
                  <div class="font-mono text-sm space-y-1">
                    <p>{{ equation1Text }}</p>
                    <p>{{ equation2Text }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-xs font-medium text-slate-600">x-waarde</label>
                    <input 
                      type="number" 
                      v-model.number="userX" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-medium text-slate-600">y-waarde</label>
                    <input 
                      type="number" 
                      v-model.number="userY" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                </div>

                <div class="flex gap-2">
                  <button @click="checkChallenge" class="flex-1 py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
                    Controleer
                  </button>
                  <button @click="challengeActive = false" class="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                    Annuleer
                  </button>
                </div>

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
                <span class="text-slate-600">Type stelsel:</span>
                <span :class="['font-medium text-xs', solution ? 'text-emerald-600' : 'text-rose-600']">{{ systemType }}</span>
              </div>
              <div v-if="solution" class="flex justify-between">
                <span class="text-slate-600">Oplossing:</span>
                <span class="font-mono text-brand-orange">({{ solution.x.toFixed(2) }}, {{ solution.y.toFixed(2) }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Determinant:</span>
                <span class="font-mono">{{ (a1 * b2 - a2 * b1).toFixed(2) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-2 mt-2">
                <p class="text-xs font-medium text-slate-500 mb-1">Richtingscoëfficiënten:</p>
                <div class="flex justify-between">
                  <span class="text-slate-600">m₁:</span>
                  <span class="font-mono">{{ slope1.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">m₂:</span>
                  <span class="font-mono">{{ slope2.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-8">
              <div class="text-center">
                <span class="text-xs text-slate-500 block mb-1">Vergelijking 1</span>
                <span class="text-lg font-mono font-bold text-brand-dark">{{ equation1Text }}</span>
                <span class="text-xs text-slate-400 block mt-1">{{ slopeIntercept1 }}</span>
              </div>
              <div class="text-slate-300">
                <PhIntersect class="text-2xl" />
              </div>
              <div class="text-center">
                <span class="text-xs text-slate-500 block mb-1">Vergelijking 2</span>
                <span class="text-lg font-mono font-bold text-brand-dark">{{ equation2Text }}</span>
                <span class="text-xs text-slate-400 block mt-1">{{ slopeIntercept2 }}</span>
              </div>
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

              <!-- Line 1 -->
              <line 
                :x1="line1Path.x1" :y1="line1Path.y1" 
                :x2="line1Path.x2" :y2="line1Path.y2"
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Line 2 -->
              <line 
                :x1="line2Path.x1" :y1="line2Path.y1" 
                :x2="line2Path.x2" :y2="line2Path.y2"
                stroke="#6366F1" 
                stroke-width="3"
              />

              <!-- Intersection point -->
              <g v-if="solution">
                <circle 
                  :cx="toSvgX(solution.x)" 
                  :cy="toSvgY(solution.y)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(solution.x)" 
                  :y="toSvgY(solution.y) - 12" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  ({{ solution.x.toFixed(1) }}, {{ solution.y.toFixed(1) }})
                </text>
              </g>

              <!-- No solution indicator for parallel lines -->
              <g v-if="!solution && a1 * b2 === a2 * b1">
                <text 
                  :x="svgWidth / 2" 
                  :y="svgHeight / 2" 
                  text-anchor="middle" 
                  class="fill-rose-500 text-lg font-bold"
                >
                  {{ c1 / a1 === c2 / a2 ? 'Oneindig veel oplossingen' : 'Geen oplossing' }}
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">Vergelijking 1</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-indigo-500"></div>
                  <span class="text-slate-600">Vergelijking 2</span>
                </div>
                <div v-if="solution" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Snijpunt (oplossing)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Method Comparison (only in derivation mode) -->
          <div v-if="currentMode === 'derivation'" class="mt-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 class="text-sm font-bold text-slate-700 mb-3">Methodenvergelijking</h3>
            <div class="grid grid-cols-3 gap-4 text-xs">
              <div class="p-2 bg-slate-50 rounded border border-slate-200">
                <p class="font-bold text-brand-orange mb-1">Substitutie</p>
                <p class="text-slate-600">Geschikt als één variabele gemakkelijk te isoleren is.</p>
              </div>
              <div class="p-2 bg-slate-50 rounded border border-slate-200">
                <p class="font-bold text-brand-orange mb-1">Gelijkstelling</p>
                <p class="text-slate-600">Handig als beide vergelijkingen naar zelfde variabele kunnen.</p>
              </div>
              <div class="p-2 bg-slate-50 rounded border border-slate-200">
                <p class="font-bold text-brand-orange mb-1">Combinatie</p>
                <p class="text-slate-600">Efficiënt als coëfficiënten gemakkelijk gelijk te maken zijn.</p>
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