<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhCalculator, PhSquaresFour, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhSigma, PhSquare, 
  PhMathOperations, PhTarget, PhMinusCircle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'factoring' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Equation parameters: ax² + bx + c = 0
const a = ref(1)
const b = ref(-5)
const c = ref(6)

// Factoring mode state
const factorA = ref(1)
const factorB = ref(2)
const factorC = ref(1)
const factorD = ref(3)
const showFactoringSteps = ref(false)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'solve-by-formula', 'solve-by-factoring', 'discriminant'
const challengeA = ref(1)
const challengeB = ref(-5)
const challengeC = ref(6)
const userAnswer = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const showHint = ref(false)

// Discriminant explorer
const discA = ref(1)
const discB = ref(-4)
const discC = ref(4)

// Incomplete equations
const incompleteType = ref('bx+c') // 'ax2+bx', 'ax2+c', 'ax2'

// ==================== COMPUTED PROPERTIES ====================
// Current discriminant
const discriminant = computed(() => b.value * b.value - 4 * a.value * c.value)
const discriminantValue = computed(() => discB.value * discB.value - 4 * discA.value * discC.value)
const challengeDiscriminant = computed(() => challengeB.value * challengeB.value - 4 * challengeA.value * challengeC.value)

// Number of solutions
const solutionCount = (disc) => {
  if (disc > 0) return 2
  if (disc === 0) return 1
  return 0
}

const solutionText = (disc) => {
  if (disc > 0) return '2 reële oplossingen'
  if (disc === 0) return '1 reële oplossing (dubbele wortel)'
  return 'Geen reële oplossingen'
}

// Roots using quadratic formula
const root1 = computed(() => {
  if (discriminant.value < 0) return null
  return (-b.value - Math.sqrt(discriminant.value)) / (2 * a.value)
})

const root2 = computed(() => {
  if (discriminant.value < 0) return null
  return (-b.value + Math.sqrt(discriminant.value)) / (2 * a.value)
})

const discRoot1 = computed(() => {
  if (discriminantValue.value < 0) return null
  return (-discB.value - Math.sqrt(discriminantValue.value)) / (2 * discA.value)
})

const discRoot2 = computed(() => {
  if (discriminantValue.value < 0) return null
  return (-discB.value + Math.sqrt(discriminantValue.value)) / (2 * discA.value)
})

// Sum and product of roots
const sumOfRoots = computed(() => -b.value / a.value)
const productOfRoots = computed(() => c.value / a.value)
const discSumOfRoots = computed(() => -discB.value / discA.value)
const discProductOfRoots = computed(() => discC.value / discA.value)

// Expanded factored form
const expandedA = computed(() => factorA.value * factorC.value)
const expandedB = computed(() => factorA.value * factorD.value + factorB.value * factorC.value)
const expandedC = computed(() => factorB.value * factorD.value)

// Equation display
const equationText = computed(() => {
  const formatNum = (n) => {
    if (n === 0) return ''
    return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`
  }
  
  let text = ''
  if (a.value === 1) text += 'x²'
  else if (a.value === -1) text += '-x²'
  else text += `${a.value}x²`
  
  if (b.value !== 0) text += ` ${formatNum(b.value)}x`
  if (c.value !== 0) text += ` ${formatNum(c.value)}`
  text += ' = 0'
  return text
})

const factoredEquation = computed(() => {
  const formatFactor = (a, b) => {
    if (a === 1) return b >= 0 ? `(x + ${b})` : `(x - ${Math.abs(b)})`
    if (a === -1) return b >= 0 ? `(-x + ${b})` : `(-x - ${Math.abs(b)})`
    return b >= 0 ? `(${a}x + ${b})` : `(${a}x - ${Math.abs(b)})`
  }
  return `${formatFactor(factorA.value, factorB.value)} ${formatFactor(factorC.value, factorD.value)} = 0`
})

const expandedEquation = computed(() => {
  const formatNum = (n) => n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : ''
  let text = ''
  if (expandedA.value === 1) text += 'x²'
  else if (expandedA.value === -1) text += '-x²'
  else text += `${expandedA.value}x²`
  
  if (expandedB.value !== 0) text += ` ${formatNum(expandedB.value)}x`
  if (expandedC.value !== 0) text += ` ${formatNum(expandedC.value)}`
  text += ' = 0'
  return text
})

const discEquationText = computed(() => {
  const formatNum = (n) => n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : ''
  let text = ''
  if (discA.value === 1) text += 'x²'
  else if (discA.value === -1) text += '-x²'
  else text += `${discA.value}x²`
  
  if (discB.value !== 0) text += ` ${formatNum(discB.value)}x`
  if (discC.value !== 0) text += ` ${formatNum(discC.value)}`
  text += ' = 0'
  return text
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  showHint.value = false
  
  // Generate random parameters with real solutions
  challengeA.value = Math.floor(Math.random() * 3) + 1 // 1 to 3
  
  if (type === 'solve-by-formula') {
    // Generate equation with integer roots
    const r1 = Math.floor(Math.random() * 10) - 5
    const r2 = Math.floor(Math.random() * 10) - 5
    challengeB.value = -challengeA.value * (r1 + r2)
    challengeC.value = challengeA.value * r1 * r2
  } else if (type === 'solve-by-factoring') {
    // Generate factorable equation
    const m = Math.floor(Math.random() * 3) + 1
    const n = Math.floor(Math.random() * 5) - 2
    const p = Math.floor(Math.random() * 3) + 1
    const q = Math.floor(Math.random() * 5) - 2
    challengeB.value = m * q + n * p
    challengeC.value = n * q
  } else if (type === 'discriminant') {
    // Random parameters
    challengeB.value = Math.floor(Math.random() * 10) - 5
    challengeC.value = Math.floor(Math.random() * 10) - 5
  }
}

function checkChallenge() {
  if (challengeType.value === 'discriminant') {
    const userDisc = parseFloat(userAnswer.value)
    if (userDisc === challengeDiscriminant.value) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De discriminant is b² - 4ac = ' + challengeDiscriminant.value
    } else {
      challengeFeedback.value = `Nog niet juist. Hint: D = ${challengeB.value}² - 4(${challengeA.value})(${challengeC.value})`
    }
    return
  }
  
  // Parse user answers for root values
  const answers = userAnswer.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
  
  const d = challengeDiscriminant.value
  if (d < 0) {
    if (userAnswer.value.toLowerCase().includes('geen') || userAnswer.value === '') {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Er zijn geen reële oplossingen.'
    } else {
      challengeFeedback.value = 'Nog niet juist. De discriminant is negatief, dus er zijn geen reële oplossingen.'
    }
    return
  }
  
  const r1 = (-challengeB.value - Math.sqrt(d)) / (2 * challengeA.value)
  const r2 = (-challengeB.value + Math.sqrt(d)) / (2 * challengeA.value)
  const tolerance = 0.1
  
  const hasR1 = answers.some(a => Math.abs(a - r1) < tolerance)
  const hasR2 = answers.some(a => Math.abs(a - r2) < tolerance)
  
  if ((hasR1 && hasR2) || (d === 0 && hasR1)) {
    challengeSolved.value = true
    challengeFeedback.value = d === 0 
      ? `Correct! x = ${r1.toFixed(2)} (dubbele wortel)`
      : `Correct! x₁ = ${r1.toFixed(2)}, x₂ = ${r2.toFixed(2)}`
  } else {
    challengeFeedback.value = 'Nog niet juist. Gebruik de abc-formule of ontbind in factoren.'
  }
}

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 400
const viewBoxX = -8
const viewBoxY = -4
const viewBoxWidth = 16
const viewBoxHeight = 8

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

function generateParabolaPath(a, b, c) {
  let path = ''
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += 0.05) {
    const y = a * x * x + b * x + c
    const svgX = toSvgX(x)
    const svgY = toSvgY(y)
    if (path === '') {
      path = `M ${svgX} ${svgY}`
    } else {
      path += ` L ${svgX} ${svgY}`
    }
  }
  return path
}

const currentParabolaPath = computed(() => generateParabolaPath(a.value, b.value, c.value))
const discParabolaPath = computed(() => generateParabolaPath(discA.value, discB.value, discC.value))
const challengeParabolaPath = computed(() => challengeActive.value ? generateParabolaPath(challengeA.value, challengeB.value, challengeC.value) : '')

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

// ==================== MODE DESCRIPTIONS ====================
const modeDescriptions = {
  factoring: {
    title: 'Ontbinden in factoren',
    description: 'Leer vergelijkingen oplossen door ontbinden in factoren',
    icon: PhSigma
  },
  discriminant: {
    title: 'Discriminant onderzoek',
    description: 'Verken hoe de discriminant het aantal oplossingen bepaalt',
    icon: PhSquare
  },
  challenge: {
    title: 'Opgaven',
    description: 'Oefen met verschillende types vergelijkingen',
    icon: PhTarget
  }
}

// ==================== ANALYSIS STEPS ====================
const factoringSteps = [
  {
    title: 'Factorisatie',
    description: 'Schrijf ax² + bx + c als (mx + p)(nx + q)',
    focus: 'factors',
    instruction: 'Wijzig de factoren en observeer het resultaat.'
  },
    {
    title: 'Nulproductregel',
    description: 'Als (mx + p)(nx + q) = 0, dan mx + p = 0 of nx + q = 0',
    focus: 'solutions',
    instruction: 'Bereken de oplossingen uit de factoren.'
  },
  {
    title: 'Som en product',
    description: 'Gebruik som en product van de wortels',
    focus: 'sum-product',
    instruction: 'Controleer: som = -b/a, product = c/a'
  }
]

const discriminantSteps = [
  {
    title: 'Discriminant D > 0',
    description: 'Twee verschillende reële wortels',
    focus: 'positive',
    instruction: 'Wijzig de parameters zodat D > 0'
  },
  {
    title: 'Discriminant D = 0',
    description: 'Eén reële wortel (dubbele wortel)',
    focus: 'zero',
    instruction: 'Wijzig de parameters zodat D = 0'
  },
  {
    title: 'Discriminant D < 0',
    description: 'Geen reële wortels',
    focus: 'negative',
    instruction: 'Wijzig de parameters zodat D < 0'
  }
]

function nextStep() {
  const steps = currentMode.value === 'factoring' ? factoringSteps : discriminantSteps
  if (currentStep.value < steps.length - 1) {
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
            <PhMathOperations class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Tweedegraadsvergelijkingen</h1>
            <p class="text-sm text-slate-500">Oplossingsmethoden en abc-formule</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Mode Switcher -->
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'factoring'; currentStep = 0"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'factoring' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              <div class="flex items-center gap-2">
                <PhSigma class="text-lg" />
                <span>Ontbinden</span>
              </div>
            </button>
            <button 
              @click="currentMode = 'discriminant'; currentStep = 0"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'discriminant' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              <div class="flex items-center gap-2">
                <PhSquare class="text-lg" />
                <span>Discriminant</span>
              </div>
            </button>
            <button 
              @click="currentMode = 'challenge'; currentStep = 0"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'challenge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              <div class="flex items-center gap-2">
                <PhTarget class="text-lg" />
                <span>Opgaven</span>
              </div>
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
          
          <!-- Mode: Factoring -->
          <template v-if="currentMode === 'factoring'">
            <!-- Step Navigation -->
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }} van {{ factoringSteps.length }}</span>
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
                    :disabled="currentStep === factoringSteps.length - 1"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowRight class="text-lg" />
                  </button>
                </div>
              </div>
              <h2 class="text-base font-bold text-slate-800 mb-1">{{ factoringSteps[currentStep].title }}</h2>
              <p class="text-sm text-slate-600">{{ factoringSteps[currentStep].description }}</p>
            </div>

            <!-- Factor Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ factoringSteps[currentStep].instruction }}</p>
              
              <!-- First factor (mx + p) -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-3">Eerste factor: (mx + p)</p>
                <div class="space-y-3">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm text-slate-600">m</label>
                      <span class="text-sm font-mono bg-white px-2 py-0.5 rounded border">{{ factorA }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="factorA" 
                      min="-5" 
                      max="5" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm text-slate-600">p</label>
                      <span class="text-sm font-mono bg-white px-2 py-0.5 rounded border">{{ factorB }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="factorB" 
                      min="-10" 
                      max="10" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                </div>
              </div>

              <!-- Second factor (nx + q) -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-3">Tweede factor: (nx + q)</p>
                <div class="space-y-3">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm text-slate-600">n</label>
                      <span class="text-sm font-mono bg-white px-2 py-0.5 rounded border">{{ factorC }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="factorC" 
                      min="-5" 
                      max="5" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm text-slate-600">q</label>
                      <span class="text-sm font-mono bg-white px-2 py-0.5 rounded border">{{ factorD }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="factorD" 
                      min="-10" 
                      max="10" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                </div>
              </div>

              <!-- Factoring steps -->
              <div v-if="currentStep >= 1" class="p-3 bg-brand-dark text-white rounded-lg">
                <p class="text-sm font-bold mb-2">Oplossingen via nulproductregel:</p>
                <div class="text-sm space-y-1">
                  <p>{{ factorA }}x + {{ factorB }} = 0 → x = {{ factorB !== 0 ? (-factorB/factorA).toFixed(2) : 'ongedefinieerd' }}</p>
                  <p>{{ factorC }}x + {{ factorD }} = 0 → x = {{ factorD !== 0 ? (-factorD/factorC).toFixed(2) : 'ongedefinieerd' }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode: Discriminant Explorer -->
          <template v-if="currentMode === 'discriminant'">
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ontdekking</span>
              </div>
              <h2 class="text-base font-bold text-slate-800 mb-1">Discriminant onderzoek</h2>
              <p class="text-sm text-slate-600">Verken hoe de discriminant het aantal oplossingen bepaalt.</p>
            </div>

            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">Wijzig de parameters a, b, c en observeer de grafiek.</p>
              
              <!-- Parameter controls -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">a</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ discA }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="discA" 
                  min="-3" 
                  max="3" 
                  step="0.1"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">b</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ discB }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="discB" 
                  min="-10" 
                  max="10" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">c</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ discC }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="discC" 
                  min="-10" 
                  max="10" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Discriminant display -->
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Aantal oplossingen:</p>
                <div class="text-sm space-y-1">
                  <p>D = b² - 4ac = {{ discB }}² - 4({{ discA }})({{ discC }}) = <span class="font-bold text-brand-orange">{{ discriminantValue.toFixed(2) }}</span></p>
                  <p class="mt-2">
                    <span :class="{
                      'text-emerald-600 font-bold': discriminantValue > 0,
                      'text-amber-600 font-bold': discriminantValue === 0,
                      'text-rose-600 font-bold': discriminantValue < 0
                    }">{{ solutionText(discriminantValue) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode: Challenge -->
          <template v-if="currentMode === 'challenge'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Opgaven</h2>
              <p class="text-sm text-slate-600">Los de vergelijkingen op.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('solve-by-formula')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Los op met abc-formule</div>
                  <div class="text-xs text-slate-500 mt-1">Gebruik de formule om de oplossingen te vinden.</div>
                </button>
                
                <button @click="generateChallenge('solve-by-factoring')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Los op door ontbinden</div>
                  <div class="text-xs text-slate-500 mt-1">Ontbind in factoren en gebruik de nulproductregel.</div>
                </button>
                
                <button @click="generateChallenge('discriminant')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bereken de discriminant</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal D = b² - 4ac.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Los op:</p>
                  <p class="text-lg font-mono font-bold">{{ challengeA }}x² + {{ challengeB }}x + {{ challengeC }} = 0</p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">
                      <span v-if="challengeType === 'discriminant'">Discriminant (D)</span>
                      <span v-else>Oplossingen (komma-gescheiden)</span>
                    </label>
                    <input 
                      type="text" 
                      v-model="userAnswer" 
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      :placeholder="challengeType === 'discriminant' ? 'bijv. 25' : 'bijv. 2, 3'"
                    >
                  </div>
                  
                  <button @click="showHint = !showHint" v-if="!showHint" class="text-xs text-slate-500 hover:text-brand-orange transition-colors">
                    Toon hint
                  </button>
                  
                  <div v-if="showHint" class="p-2 bg-slate-50 rounded text-xs text-slate-600">
                    <span v-if="challengeType === 'discriminant'">D = b² - 4ac</span>
                    <span v-else>x = (-b ± √D) / 2a</span>
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
            
            <!-- Factoring mode info -->
            <div v-if="currentMode === 'factoring'" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Uitgewerkte vorm:</span>
                <span class="font-mono text-brand-dark">{{ expandedEquation }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">a:</span>
                <span class="font-mono">{{ expandedA }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">b:</span>
                <span class="font-mono">{{ expandedB }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">c:</span>
                <span class="font-mono">{{ expandedC }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Som wortels:</span>
                <span class="font-mono">{{ sumOfRoots.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Product wortels:</span>
                <span class="font-mono">{{ productOfRoots.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Discriminant mode info -->
            <div v-if="currentMode === 'discriminant'" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Vergelijking:</span>
                <span class="font-mono text-brand-dark">{{ discEquationText }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Discriminant:</span>
                <span class="font-mono" :class="discriminantValue >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ discriminantValue.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Oplossingen:</span>
                <span class="font-mono" :class="discriminantValue >= 0 ? 'text-emerald-600' : 'text-slate-400'">
                  <span v-if="discriminantValue >= 0 && discRoot1 !== null">
                    x₁={{ discRoot1.toFixed(2) }}<span v-if="discriminantValue > 0">, x₂={{ discRoot2.toFixed(2) }}</span>
                  </span>
                  <span v-else>Geen reële oplossingen</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Som wortels:</span>
                <span class="font-mono">{{ discSumOfRoots.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Product wortels:</span>
                <span class="font-mono">{{ discProductOfRoots.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Challenge mode info -->
            <div v-if="currentMode === 'challenge' && challengeActive" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Discriminant:</span>
                <span class="font-mono" :class="challengeDiscriminant >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ challengeDiscriminant.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Aantal oplossingen:</span>
                <span class="font-mono">{{ solutionCount(challengeDiscriminant) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div v-if="currentMode === 'factoring'" class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Geontbinden vorm:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">{{ factoredEquation }}</span>
            </div>
            <div v-if="currentMode === 'discriminant'" class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Vergelijking:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">{{ discEquationText }}</span>
            </div>
            <div v-if="currentMode === 'challenge' && challengeActive" class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Vergelijking:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">{{ challengeA }}x² + {{ challengeB }}x + {{ challengeC }} = 0</span>
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
                <line v-for="i in 9" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-4 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-4 + i)" 
                />
              </g>

              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

              <!-- Axis labels -->
              <text :x="toSvgX(7.5)" :y="toSvgY(0) + 20" class="fill-slate-400 text-sm">x</text>
              <text :x="toSvgX(0) + 10" :y="toSvgY(3.5) + 15" class="fill-slate-400 text-sm">y</text>

              <!-- Parabola (Factoring mode) -->
              <path 
                v-if="currentMode === 'factoring'"
                :d="currentParabolaPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Parabola (Discriminant mode) -->
              <path 
                v-if="currentMode === 'discriminant'"
                :d="discParabolaPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Parabola (Challenge mode) -->
              <path 
                v-if="currentMode === 'challenge' && challengeActive"
                :d="challengeParabolaPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- X-intercepts (roots) - Factoring mode -->
              <g v-if="currentMode === 'factoring' && discriminant >= 0">
                <circle 
                  v-if="root1 !== null"
                  :cx="toSvgX(root1)" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <circle 
                  v-if="root2 !== null && discriminant > 0"
                  :cx="toSvgX(root2)" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>

              <!-- X-intercepts (roots) - Discriminant mode -->
              <g v-if="currentMode === 'discriminant' && discriminantValue >= 0">
                <circle 
                  v-if="discRoot1 !== null"
                  :cx="toSvgX(discRoot1)" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  :fill="discriminantValue > 0 ? '#10B981' : '#F59E0B'"
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  v-if="discRoot1 !== null"
                  :x="toSvgX(discRoot1)" 
                  :y="toSvgY(0) - 10" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  {{ discriminantValue === 0 ? 'Dubbele wortel' : 'x₁' }}
                </text>
                <circle 
                  v-if="discRoot2 !== null && discriminantValue > 0"
                  :cx="toSvgX(discRoot2)" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  v-if="discRoot2 !== null && discriminantValue > 0"
                  :x="toSvgX(discRoot2)" 
                  :y="toSvgY(0) - 10" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  x₂
                </text>
              </g>

              <!-- X-intercepts (roots) - Challenge mode -->
              <g v-if="currentMode === 'challenge' && challengeActive">
                <circle 
                  v-if="challengeDiscriminant >= 0"
                  :cx="toSvgX((-challengeB - Math.sqrt(challengeDiscriminant)) / (2 * challengeA))" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  :fill="challengeDiscriminant > 0 ? '#10B981' : '#F59E0B'"
                  stroke="white" 
                  stroke-width="2"
                />
                <circle 
                  v-if="challengeDiscriminant > 0"
                  :cx="toSvgX((-challengeB + Math.sqrt(challengeDiscriminant)) / (2 * challengeA))" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">Parabool</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Nulpunten (x₁, x₂)</span>
                </div>
                <div v-if="currentMode === 'discriminant' && discriminantValue === 0" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span class="text-slate-600">Dubbele wortel</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formula Reference -->
          <div class="mt-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h4 class="text-sm font-bold text-slate-700 mb-2">ABC-formule</h4>
            <div class="font-mono text-sm text-slate-600 space-y-1">
              <p>ax² + bx + c = 0</p>
              <p class="text-brand-orange font-bold">x = (-b ± √D) / 2a</p>
              <p>waarbij D = b² - 4ac</p>
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
