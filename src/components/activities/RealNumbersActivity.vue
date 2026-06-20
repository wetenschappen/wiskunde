<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhSquaresFour, PhMathOperations, PhCalculator,
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhPi
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Mode selector for analysis
const analysisSubMode = ref('numberline') // 'numberline', 'simplify', 'operations'

// Number line mode state
const selectedNumber = ref(null)
const numberTypes = {
  rational: ['-3', '-2', '-1/2', '0', '1/3', '2', '22/7', '3.75'],
  irrational: ['√2', '√3', '√5', 'π', '-√2', '√7', 'e', '√12']
}

// Simplify mode state
const sqrtRadicand = ref(12)
const showSimplification = ref(true)

// Operations mode state
const op1 = ref(25)
const op2 = ref(9)
const operation = ref('add') // 'add', 'subtract', 'multiply', 'divide'
const showRationalizing = ref(false)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'classify', 'simplify', 'rationalize'
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const userAnswer = ref('')
const targetNumber = ref('')
const targetRadicand = ref(8)
const targetDenominator = ref('')

// Scientific notation state
const sciBase = ref(6.02)
const sciExponent = ref(23)
const showSciConversion = ref(true)

// ==================== COMPUTED PROPERTIES ====================
// Simplified square root
const simplifiedSqrt = computed(() => {
  const n = sqrtRadicand.value
  if (n < 0) return { coefficient: 0, radicand: 0, text: 'Ongedefinieerd' }
  
  let remaining = n
  let coefficient = 1
  
  // Find perfect square factors
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    const square = i * i
    while (remaining % square === 0) {
      coefficient *= i
      remaining /= square
    }
  }
  
  return { coefficient, radicand: remaining, text: formatSqrt(coefficient, remaining) }
})

// Operation result
const operationResult = computed(() => {
  const r1 = Math.sqrt(op1.value)
  const r2 = Math.sqrt(op2.value)
  
  switch (operation.value) {
    case 'add': return { value: r1 + r2, symbol: '+', exact: `√${op1.value} + √${op2.value}` }
    case 'subtract': return { value: r1 - r2, symbol: '-', exact: `√${op1.value} - √${op2.value}` }
    case 'multiply': return { value: r1 * r2, exact: `√${op1.value * op2.value} = ${Math.sqrt(op1.value * op2.value).toFixed(4)}` }
    case 'divide': return { value: r1 / r2, exact: `√${op1.value}/${op2.value} = √${(op1.value / op2.value).toFixed(4)}` }
    default: return { value: 0, exact: '' }
  }
})

// Scientific notation conversion
const sciNotation = computed(() => {
  return {
    full: `${sciBase.value} × 10^${sciExponent.value}`,
    decimal: (sciBase.value * Math.pow(10, sciExponent.value)).toExponential(3),
    standard: formatScientific(sciBase.value, sciExponent.value)
  }
})

// ==================== HELPER FUNCTIONS ====================
function formatSqrt(coeff, radicand) {
  if (radicand === 0) return '0'
  if (radicand === 1) return coeff.toString()
  if (coeff === 1) return `√${radicand}`
  return `${coeff}√${radicand}`
}

function formatScientific(base, exp) {
  if (exp >= -3 && exp <= 3) {
    return (base * Math.pow(10, exp)).toString()
  }
  return `${base} × 10^${exp}`
}

function isRational(num) {
  return numberTypes.rational.includes(num)
}

function getNumberInfo(num) {
  const info = {
    '-3': { type: 'Geheel getal', desc: 'Negatief geheel getal', decimal: '-3.000...' },
    '-2': { type: 'Geheel getal', desc: 'Negatief geheel getal', decimal: '-2.000...' },
    '-1/2': { type: 'Rationaal', desc: 'Breuk - eindige decimalen', decimal: '-0.5' },
    '0': { type: 'Geheel getal', desc: 'Nul - neutraal element', decimal: '0.000...' },
    '1/3': { type: 'Rationaal', desc: 'Periodieke breuk', decimal: '0.333...' },
    '2': { type: 'Geheel getal', desc: 'Positief geheel getal', decimal: '2.000...' },
    '22/7': { type: 'Rationaal', desc: 'Benadering van π', decimal: '3.142857...' },
    '3.75': { type: 'Rationaal', desc: 'Eindige decimale breuk', decimal: '3.75' },
    '√2': { type: 'Irrationaal', desc: 'Diagonaal van een vierkant', decimal: '1.414213...', algebraic: 'Geen oplossing in ℚ' },
    '√3': { type: 'Irrationaal', desc: 'Hoogte gelijkzijdige driehoek', decimal: '1.732050...', algebraic: 'Geen oplossing in ℚ' },
    '√5': { type: 'Irrationaal', desc: 'Gulden snede verwant', decimal: '2.236067...', algebraic: 'Geen oplossing in ℚ' },
    'π': { type: 'Irrationaal', desc: 'Verhouding omtrek/diameter', decimal: '3.141592...', algebraic: 'Transcendent' },
    '-√2': { type: 'Irrationaal', desc: 'Negatieve wortel', decimal: '-1.414213...', algebraic: 'Geen oplossing in ℚ' },
    '√7': { type: 'Irrationaal', desc: 'Irrationale wortel', decimal: '2.645751...', algebraic: 'Geen oplossing in ℚ' },
    'e': { type: 'Irrationaal', desc: 'Natuurlijk logaritme grondtal', decimal: '2.718281...', algebraic: 'Transcendent' },
    '√12': { type: 'Irrationaal', desc: '2√3 (vereenvoudigbaar)', decimal: '3.464101...', algebraic: 'Vereenvoudigt naar 2√3' }
  }
  return info[num] || { type: 'Onbekend', desc: '', decimal: '' }
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  if (type === 'classify') {
    const allNumbers = [...numberTypes.rational, ...numberTypes.irrational]
    targetNumber.value = allNumbers[Math.floor(Math.random() * allNumbers.length)]
  } else if (type === 'simplify') {
    // Generate number with perfect square factor
    const perfectSquares = [4, 9, 16, 25, 36, 49, 64]
    const others = [2, 3, 5, 6, 7, 10, 11, 13]
    const ps = perfectSquares[Math.floor(Math.random() * perfectSquares.length)]
    const o = others[Math.floor(Math.random() * others.length)]
    targetRadicand.value = ps * o
  } else if (type === 'rationalize') {
    const denominators = ['√2', '√3', '√5', '√7']
    targetDenominator.value = denominators[Math.floor(Math.random() * denominators.length)]
  }
}

function checkChallenge() {
  if (challengeType.value === 'classify') {
    const isRat = isRational(targetNumber.value)
    const userIsRational = userAnswer.value === 'rational'
    if (isRat === userIsRational) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! ${targetNumber.value} is ${isRat ? 'rationaal' : 'irrationaal'}.`
    } else {
      challengeFeedback.value = `Niet juist. ${targetNumber.value} is ${isRat ? 'rationaal' : 'irrationaal'}.`
    }
  } else if (challengeType.value === 'simplify') {
    const correct = simplifiedSqrt.value.text.replace(/\s/g, '')
    const user = userAnswer.value.replace(/\s/g, '')
    if (user === correct || (user.includes('√') && user.replace('√', '') == targetRadicand.value)) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! √${targetRadicand.value} = ${simplifiedSqrt.value.text}`
    } else {
      challengeFeedback.value = `Nog niet juist. Probeer te factoreren.`
    }
  } else if (challengeType.value === 'rationalize') {
    const den = targetDenominator.value.replace('√', '')
    const expected = `√${den}/${den}`
    if (userAnswer.value.replace(/\s/g, '').includes(den)) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! 1/${targetDenominator.value} = √${den}/${den}`
    } else {
      challengeFeedback.value = `Nog niet juist. Vermenigvuldig teller en noemer met ${targetDenominator.value}.`
    }
  }
}

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -10
const viewBoxY = -5
const viewBoxWidth = 20
const viewBoxHeight = 10

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
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
    title: 'Reële getallen op de getallenas',
    description: 'Visualiseer de positie van verschillende soorten reële getallen.',
    mode: 'numberline',
    instruction: 'Klik op een getal om eigenschappen te bekijken.'
  },
  {
    title: 'Wortels vereenvoudigen',
    description: 'Haal perfecte kwadraten uit de wortel.',
    mode: 'simplify',
    instruction: 'Wijzig het getal onder de wortel en bekijk de vereenvoudiging.'
  },
  {
    title: 'Bewerkingen met wortels',
    description: 'Tel, trek af, vermenigvuldig en deel worteluitdrukkingen.',
    mode: 'operations',
    instruction: 'Kies de bewerking en waarden om het resultaat te zien.'
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    analysisSubMode.value = analysisSteps[currentStep.value].mode
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    analysisSubMode.value = analysisSteps[currentStep.value].mode
  }
}

// Watch for submode changes
watch(analysisSubMode, (newMode) => {
  const stepIndex = analysisSteps.findIndex(s => s.mode === newMode)
  if (stepIndex !== -1) currentStep.value = stepIndex
})
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
            <h1 class="text-lg font-bold text-slate-800">Reële Getallen & Vierkantswortels</h1>
            <p class="text-sm text-slate-500">LPD MD 06.01-06.03 - Analyse en bewerkingen</p>
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

            <!-- Sub-mode Tabs -->
            <div class="px-4 pt-4">
              <div class="flex bg-slate-100 rounded-lg p-1">
                <button 
                  @click="analysisSubMode = 'numberline'"
                  :class="['px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1', 
                    analysisSubMode === 'numberline' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']"
                >
                  Getallenas
                </button>
                <button 
                  @click="analysisSubMode = 'simplify'"
                  :class="['px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1', 
                    analysisSubMode === 'simplify' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']"
                >
                  Vereenvoudigen
                </button>
                <button 
                  @click="analysisSubMode = 'operations'"
                  :class="['px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1', 
                    analysisSubMode === 'operations' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']"
                >
                  Bewerkingen
                </button>
              </div>
            </div>

            <!-- Content based on submode -->
            <div class="p-4 space-y-4">
              <!-- Number Line Mode -->
              <template v-if="analysisSubMode === 'numberline'">
                <p class="text-sm text-slate-500 italic">{{ analysisSteps[0].instruction }}</p>
                
                <div class="space-y-3">
                  <p class="text-sm font-bold text-slate-700">Rationale getallen (ℚ)</p>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="num in numberTypes.rational" 
                      :key="num"
                      @click="selectedNumber = num"
                      :class="['px-3 py-1.5 rounded-lg text-sm font-mono border transition-all',
                        selectedNumber === num ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 hover:border-emerald-300']"
                    >
                      {{ num }}
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <p class="text-sm font-bold text-slate-700">Irrationale getallen (ℝ\ℚ)</p>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="num in numberTypes.irrational" 
                      :key="num"
                      @click="selectedNumber = num"
                      :class="['px-3 py-1.5 rounded-lg text-sm font-mono border transition-all',
                        selectedNumber === num ? 'bg-brand-orange/20 border-brand-orange text-brand-dark' : 'bg-slate-50 border-slate-200 hover:border-brand-orange']"
                    >
                      {{ num }}
                    </button>
                  </div>
                </div>

                <!-- Selected number info -->
                <div v-if="selectedNumber" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-2">{{ selectedNumber }}</p>
                  <div class="space-y-1 text-sm">
                    <p><span class="text-slate-500">Type:</span> <span class="font-medium" :class="isRational(selectedNumber) ? 'text-emerald-600' : 'text-brand-orange'">{{ getNumberInfo(selectedNumber).type }}</span></p>
                    <p><span class="text-slate-500">Beschrijving:</span> {{ getNumberInfo(selectedNumber).desc }}</p>
                    <p><span class="text-slate-500">Decimaal:</span> <span class="font-mono">{{ getNumberInfo(selectedNumber).decimal }}</span></p>
                    <p v-if="getNumberInfo(selectedNumber).algebraic"><span class="text-slate-500">Algebraïsch:</span> {{ getNumberInfo(selectedNumber).algebraic }}</p>
                  </div>
                </div>
              </template>

              <!-- Simplify Mode -->
              <template v-if="analysisSubMode === 'simplify'">
                <p class="text-sm text-slate-500 italic">{{ analysisSteps[1].instruction }}</p>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Getal onder wortel</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sqrtRadicand }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="sqrtRadicand" 
                    min="1" 
                    max="100" 
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>

                <div v-if="showSimplification" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-2">Vereenvoudiging</p>
                  <div class="text-sm font-mono space-y-1">
                    <p>√{{ sqrtRadicand }} = √{{ simplifiedSqrt.coefficient * simplifiedSqrt.coefficient }} × {{ simplifiedSqrt.radicand }}</p>
                    <p>= {{ simplifiedSqrt.coefficient }}√{{ simplifiedSqrt.radicand }}</p>
                  </div>
                </div>

                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-bold mb-1">Regel:</p>
                  <p class="text-xs text-white/80">√(a² × b) = a√b, waarbij a het grootste perfecte kwadraat is dat b deelt.</p>
                </div>
              </template>

              <!-- Operations Mode -->
              <template v-if="analysisSubMode === 'operations'">
                <p class="text-sm text-slate-500 italic">{{ analysisSteps[2].instruction }}</p>
                
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <button 
                      v-for="op in ['add', 'subtract', 'multiply', 'divide']" 
                      :key="op"
                      @click="operation = op"
                      :class="['px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex-1',
                        operation === op ? 'bg-brand-orange text-white border-brand-orange' : 'bg-slate-50 border-slate-200']"
                    >
                      {{ op === 'add' ? '+' : op === 'subtract' ? '-' : op === 'multiply' ? '×' : '÷' }}
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">√a</label>
                      <input 
                        type="number" 
                        v-model.number="op1" 
                        min="1" max="100"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">√b</label>
                      <input 
                        type="number" 
                        v-model.number="op2" 
                        min="1" max="100"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </div>

                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Resultaat</p>
                    <p class="text-lg font-mono text-brand-dark">{{ operationResult.exact }}</p>
                    <p class="text-sm text-slate-500 mt-1">≈ {{ operationResult.value.toFixed(4) }}</p>
                  </div>

                  <div class="p-3 bg-brand-dark text-white rounded-lg">
                    <p class="text-sm font-bold mb-1">Regels:</p>
                    <ul class="text-xs text-white/80 space-y-1">
                      <li>√a × √b = √(a×b)</li>
                      <li>√a / √b = √(a/b)</li>
                      <li>√a + √b ≠ √(a+b) (pas op!)</li>
                    </ul>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- Mode: Derivation/Challenge -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassing & Oefeningen</h2>
              <p class="text-sm text-slate-600">Test je kennis met interactieve uitdagingen.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('classify')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Classificeer het getal</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal of een getal rationaal of irrationaal is.</div>
                </button>
                
                <button @click="generateChallenge('simplify')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Vereenvoudig de wortel</div>
                  <div class="text-xs text-slate-500 mt-1">Haal perfecte kwadraten uit de wortel.</div>
                </button>
                
                <button @click="generateChallenge('rationalize')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Maak de noemer rationaal</div>
                  <div class="text-xs text-slate-500 mt-1">Vermenigvuldig teller en noemer met de wortel.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal het antwoord:</p>
                  <div v-if="challengeType === 'classify'" class="mt-2 text-xs text-white/80">
                    <p class="text-lg font-mono">{{ targetNumber }}</p>
                    <p class="mt-2">Is dit getal rationaal of irrationaal?</p>
                  </div>
                  <div v-if="challengeType === 'simplify'" class="mt-2 text-xs text-white/80">
                    <p class="text-lg font-mono">√{{ targetRadicand }}</p>
                    <p class="mt-2">Vereenvoudig deze wortel.</p>
                  </div>
                  <div v-if="challengeType === 'rationalize'" class="mt-2 text-xs text-white/80">
                    <p class="text-lg font-mono">1/{{ targetDenominator }}</p>
                    <p class="mt-2">Maak de noemer rationaal.</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div v-if="challengeType === 'classify'" class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Kies het type:</label>
                    <div class="flex gap-2">
                      <button 
                        @click="userAnswer = 'rational'"
                        :class="['flex-1 py-2 rounded-lg text-sm border transition-all',
                          userAnswer === 'rational' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200']"
                      >
                        Rationaal
                      </button>
                      <button 
                        @click="userAnswer = 'irrational'"
                        :class="['flex-1 py-2 rounded-lg text-sm border transition-all',
                          userAnswer === 'irrational' ? 'bg-brand-orange/20 border-brand-orange text-brand-dark' : 'bg-slate-50 border-slate-200']"
                      >
                        Irrationaal
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Je antwoord:</label>
                    <input 
                      type="text" 
                      v-model="userAnswer" 
                      placeholder="Bijv. 2√3"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
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
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wiskundige eigenschappen</h3>
            
            <!-- Show different info based on submode -->
            <template v-if="analysisSubMode === 'numberline' && selectedNumber">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Getal:</span>
                  <span class="font-mono font-bold">{{ selectedNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Type:</span>
                  <span :class="['font-medium', isRational(selectedNumber) ? 'text-emerald-600' : 'text-brand-orange']">
                    {{ isRational(selectedNumber) ? 'Rationaal' : 'Irrationaal' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Verzameling:</span>
                  <span class="font-mono">{{ isRational(selectedNumber) ? 'ℚ' : 'ℝ \\ ℚ' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Decimaal:</span>
                  <span class="font-mono text-xs">{{ getNumberInfo(selectedNumber).decimal }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="analysisSubMode === 'simplify'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Origineel:</span>
                  <span class="font-mono">√{{ sqrtRadicand }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Vereenvoudigd:</span>
                  <span class="font-mono text-brand-orange font-bold">{{ simplifiedSqrt.text }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Decimale waarde:</span>
                  <span class="font-mono">{{ Math.sqrt(sqrtRadicand).toFixed(4) }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="analysisSubMode === 'operations'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Bewerking:</span>
                  <span class="font-mono">√{{ op1 }} {{ operationResult.symbol }} √{{ op2 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Resultaat:</span>
                  <span class="font-mono text-brand-orange font-bold">≈ {{ operationResult.value.toFixed(4) }}</span>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">ℕ:</span>
                  <span class="text-slate-500">Natuurlijke getallen</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">ℤ:</span>
                  <span class="text-slate-500">Gehele getallen</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">ℚ:</span>
                  <span class="text-slate-500">Rationale getallen</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">ℝ:</span>
                  <span class="text-slate-500">Reële getallen</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Visualization based on mode -->
          <template v-if="analysisSubMode === 'numberline' || currentMode === 'derivation'">
            <!-- Number Line Display -->
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Reële getallenas</span>
                <span v-if="selectedNumber" class="text-lg font-mono font-bold text-brand-dark">{{ selectedNumber }}</span>
              </div>
            </div>

            <!-- Number Line SVG -->
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <svg 
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
                class="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- Grid -->
                <g stroke="#E2E8F0" stroke-width="1">
                  <line v-for="i in 21" :key="`v${i}`" 
                    :x1="toSvgX(-10 + i)" y1="0" 
                    :x2="toSvgX(-10 + i)" :y2="svgHeight" 
                  />
                </g>

                <!-- Main number line -->
                <line :x1="toSvgX(-9)" :y1="toSvgY(0)" :x2="toSvgX(9)" :y2="toSvgY(0)" 
                  stroke="#0B1120" stroke-width="3" />
                
                <!-- Arrow heads -->
                <polygon :points="`${toSvgX(9)},${toSvgY(0)} ${toSvgX(8.5)},${toSvgY(0.3)} ${toSvgX(8.5)},${toSvgY(-0.3)}`" 
                  fill="#0B1120" />
                <polygon :points="`${toSvgX(-9)},${toSvgY(0)} ${toSvgX(-8.5)},${toSvgY(0.3)} ${toSvgX(-8.5)},${toSvgY(-0.3)}`" 
                  fill="#0B1120" />

                <!-- Tick marks and labels -->
                <g v-for="i in 19" :key="`tick${i}`">
                  <line 
                    :x1="toSvgX(-9 + i)" :y1="toSvgY(0) - 8" 
                    :x2="toSvgX(-9 + i)" :y2="toSvgY(0) + 8" 
                    stroke="#0B1120" stroke-width="2" 
                  />
                  <text 
                    :x="toSvgX(-9 + i)" :y="toSvgY(0) + 25" 
                    text-anchor="middle" 
                    class="fill-slate-600 text-sm font-mono"
                  >
                    {{ -9 + i }}
                  </text>
                </g>

                <!-- Rational numbers (green) -->
                <g v-for="num in numberTypes.rational" :key="`rat-${num}`">
                  <circle 
                    :cx="toSvgX(parseFloat(num) || 0)" 
                    :cy="toSvgY(0.8)" 
                    r="6" 
                    fill="#10B981" 
                    stroke="white" 
                    stroke-width="2"
                    class="cursor-pointer hover:r-8"
                    @click="selectedNumber = num"
                  />
                  <text 
                    :x="toSvgX(parseFloat(num) || 0)" 
                    :y="toSvgY(1.5)" 
                    text-anchor="middle" 
                    class="fill-emerald-600 text-xs font-mono font-bold"
                  >
                    {{ num }}
                  </text>
                </g>

                <!-- Irrational numbers (orange) -->
                <g v-for="num in numberTypes.irrational" :key="`irr-${num}`">
                  <circle 
                    :cx="toSvgX(
                      num === '√2' ? 1.414 :
                      num === '√3' ? 1.732 :
                      num === '√5' ? 2.236 :
                      num === 'π' ? 3.14159 :
                      num === '-√2' ? -1.414 :
                      num === '√7' ? 2.646 :
                      num === 'e' ? 2.718 :
                      num === '√12' ? 3.464 : 0
                    )" 
                    :cy="toSvgY(-0.8)" 
                    r="6" 
                    fill="#F97316" 
                    stroke="white" 
                    stroke-width="2"
                    class="cursor-pointer"
                    @click="selectedNumber = num"
                  />
                  <text 
                    :x="toSvgX(
                      num === '√2' ? 1.414 :
                      num === '√3' ? 1.732 :
                      num === '√5' ? 2.236 :
                      num === 'π' ? 3.14159 :
                      num === '-√2' ? -1.414 :
                      num === '√7' ? 2.646 :
                      num === 'e' ? 2.718 :
                      num === '√12' ? 3.464 : 0
                    )" 
                    :y="toSvgY(-1.5)" 
                    text-anchor="middle" 
                    class="fill-brand-orange text-xs font-mono font-bold"
                  >
                    {{ num }}
                  </text>
                </g>

                <!-- Selected number highlight -->
                <g v-if="selectedNumber">
                  <circle 
                    :cx="toSvgX(
                      selectedNumber === '√2' ? 1.414 :
                      selectedNumber === '√3' ? 1.732 :
                      selectedNumber === '√5' ? 2.236 :
                      selectedNumber === 'π' ? 3.14159 :
                      selectedNumber === '-√2' ? -1.414 :
                      selectedNumber === '√7' ? 2.646 :
                      selectedNumber === 'e' ? 2.718 :
                      selectedNumber === '√12' ? 3.464 :
                      parseFloat(selectedNumber) || 0
                    )" 
                    :cy="toSvgY(isRational(selectedNumber) ? 0.8 : -0.8)" 
                    r="10" 
                    fill="none" 
                    stroke="#0B1120" 
                    stroke-width="3"
                  />
                </g>
              </svg>

              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-slate-600">Rationaal (ℚ)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-slate-600">Irrationaal (ℝ\ℚ)</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="analysisSubMode === 'simplify'">
            <!-- Square Root Visualization -->
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-4">
                <span class="text-sm text-slate-500">Vereenvoudiging:</span>
                <span class="text-2xl font-mono font-bold text-brand-dark">√{{ sqrtRadicand }} = {{ simplifiedSqrt.text }}</span>
              </div>
            </div>

            <!-- Square visualization -->
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center">
              <div class="grid grid-cols-2 gap-8">
                <!-- Visual representation -->
                <div class="text-center">
                  <p class="text-sm text-slate-500 mb-4">Origineel: √{{ sqrtRadicand }}</p>
                  <div class="relative inline-block">
                    <svg width="200" height="200" class="mx-auto">
                      <!-- Square representing the area -->
                      <rect x="10" y="10" width="180" height="180" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
                      <!-- Grid lines to show the square -->
                      <line v-if="sqrtRadicand >= 4" 
                        v-for="i in Math.floor(Math.sqrt(sqrtRadicand)) - 1" 
                        :key="`v${i}`"
                        :x1="10 + (180 / Math.floor(Math.sqrt(sqrtRadicand))) * i" y1="10" 
                        :x2="10 + (180 / Math.floor(Math.sqrt(sqrtRadicand))) * i" y2="190" 
                        stroke="#CBD5E1" stroke-width="1" />
                      <line v-if="sqrtRadicand >= 4" 
                        v-for="i in Math.floor(Math.sqrt(sqrtRadicand)) - 1" 
                        :key="`h${i}`"
                        x1="10" :y1="10 + (180 / Math.floor(Math.sqrt(sqrtRadicand))) * i" 
                        x2="190" :y2="10 + (180 / Math.floor(Math.sqrt(sqrtRadicand))) * i" 
                        stroke="#CBD5E1" stroke-width="1" />
                    </svg>
                    <p class="text-xs text-slate-400 mt-2">Oppervlakte = {{ sqrtRadicand }}</p>
                  </div>
                </div>

                <!-- Simplified representation -->
                <div class="text-center">
                  <p class="text-sm text-slate-500 mb-4">Vereenvoudigd: {{ simplifiedSqrt.text }}</p>
                  <div class="relative inline-block">
                    <div v-if="simplifiedSqrt.coefficient > 1" class="space-y-2">
                      <div class="flex items-center justify-center gap-2">
                        <span class="text-3xl font-mono text-brand-orange">{{ simplifiedSqrt.coefficient }}</span>
                        <span class="text-2xl text-slate-400">×</span>
                        <span class="text-3xl font-mono">√{{ simplifiedSqrt.radicand }}</span>
                      </div>
                      <div class="p-3 bg-slate-50 rounded-lg">
                        <p class="text-xs text-slate-600">{{ simplifiedSqrt.coefficient }}² × {{ simplifiedSqrt.radicand }} = {{ sqrtRadicand }}</p>
                      </div>
                    </div>
                    <div v-else class="p-4 bg-slate-50 rounded-lg">
                      <p class="text-lg font-mono">√{{ simplifiedSqrt.radicand }}</p>
                      <p class="text-xs text-slate-500 mt-2">Geen perfecte kwadraten</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="analysisSubMode === 'operations'">
            <!-- Operations Visualization -->
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-4">
                <span class="text-sm text-slate-500">Bewerking:</span>
                <span class="text-2xl font-mono font-bold text-brand-dark">
                  √{{ op1 }} {{ operationResult.symbol }} √{{ op2 }}
                </span>
              </div>
            </div>

            <!-- Operation visualization -->
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="grid grid-cols-2 gap-8 h-full">
                <!-- Left: Values -->
                <div class="space-y-6">
                  <div class="p-4 bg-slate-50 rounded-lg">
                    <p class="text-sm text-slate-500 mb-2">√{{ op1 }}</p>
                    <p class="text-3xl font-mono text-brand-dark">{{ Math.sqrt(op1).toFixed(4) }}</p>
                  </div>
                  <div class="flex items-center justify-center">
                    <span class="text-4xl font-bold text-slate-400">{{ operationResult.symbol }}</span>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-lg">
                    <p class="text-sm text-slate-500 mb-2">√{{ op2 }}</p>
                    <p class="text-3xl font-mono text-brand-dark">{{ Math.sqrt(op2).toFixed(4) }}</p>
                  </div>
                </div>

                <!-- Right: Result -->
                <div class="flex flex-col justify-center">
                  <div class="p-6 bg-brand-orange/10 rounded-xl border-2 border-brand-orange">
                    <p class="text-sm text-slate-600 mb-2">Resultaat</p>
                    <p class="text-4xl font-mono font-bold text-brand-dark">{{ operationResult.value.toFixed(4) }}</p>
                    <p class="text-sm text-slate-500 mt-2 font-mono">{{ operationResult.exact }}</p>
                  </div>
                  
                  <div class="mt-6 p-4 bg-slate-50 rounded-lg">
                    <p class="text-xs text-slate-500 mb-2">Belangrijk:</p>
                    <p class="text-sm text-slate-700">
                      <span v-if="operation === 'add' || operation === 'subtract'" class="text-rose-600 font-medium">
                        Wortels kun je alleen optellen/aftrekken als ze hetzelfde zijn!
                      </span>
                      <span v-else class="text-emerald-600 font-medium">
                        Vermenigvuldigen en delen werkt direct met wortels.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
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