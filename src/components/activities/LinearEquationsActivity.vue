<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhEquals, PhMathOperations,
  PhArrowRight, PhArrowLeft, PhCheckCircle, PhArrowElbowRight,
  PhScales, PhNotepad, PhTrendUp
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' } // 'analysis' or 'derivation'
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const equationMode = ref('solver') // 'solver', 'inequality', 'formula'

// Equation solver state
const eqA = ref(2)      // coefficient of x
const eqB = ref(5)      // constant on left side
const eqC = ref(1)      // coefficient of x on right
const eqD = ref(3)      // constant on right side
const solvingStep = ref(0)
const showSolution = ref(false)

// Inequality state
const ineqA = ref(2)
const ineqB = ref(4)
const ineqOperator = ref('<') // '<', '>', '<=', '>='
const ineqSolved = ref(false)

// Formula rearrangement state
const formulaType = ref('simple') // 'simple', 'geometry'
const formulaProgress = ref(0)
const formulaUserAnswer = ref('')
const formulaFeedback = ref('')

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'solve', 'inequality', 'rearrange'
const challengeSolved = ref(false)
const challengeFeedback = ref('')

// ==================== COMPUTED PROPERTIES ====================
// Equation: ax + b = cx + d
const equationLeft = computed(() => {
  if (eqA.value === 0) return `${eqB.value}`
  if (eqA.value === 1) return eqB.value >= 0 ? `x + ${eqB.value}` : `x - ${Math.abs(eqB.value)}`
  if (eqA.value === -1) return eqB.value >= 0 ? `-x + ${eqB.value}` : `-x - ${Math.abs(eqB.value)}`
  return eqB.value >= 0 ? `${eqA.value}x + ${eqB.value}` : `${eqA.value}x - ${Math.abs(eqB.value)}`
})

const equationRight = computed(() => {
  if (eqC.value === 0) return `${eqD.value}`
  if (eqC.value === 1) return eqD.value >= 0 ? `x + ${eqD.value}` : `x - ${Math.abs(eqD.value)}`
  if (eqC.value === -1) return eqD.value >= 0 ? `-x + ${eqD.value}` : `-x - ${Math.abs(eqD.value)}`
  return eqD.value >= 0 ? `${eqC.value}x + ${eqD.value}` : `${eqC.value}x - ${Math.abs(eqD.value)}`
})

const equationSolution = computed(() => {
  const a = eqA.value - eqC.value // bring all x to left: (a-c)x = d-b
  const b = eqD.value - eqB.value
  if (a === 0) {
    return b === 0 ? 'Oneindig veel oplossingen' : 'Geen oplossing'
  }
  return b / a
})

// Inequality solution
const ineqSolution = computed(() => {
  const a = ineqA.value
  const b = ineqB.value
  // ax ? b -> x ? b/a
  const solution = b / a
  const sign = a > 0 ? ineqOperator.value : flipInequality(ineqOperator.value)
  return { value: solution, operator: sign }
})

function flipInequality(op) {
  const flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }
  return flip[op] || op
}

// ==================== SVG NUMBER LINE ====================
const svgWidth = 800
const svgHeight = 200
const viewBoxX = -10
const viewBoxY = -2
const viewBoxWidth = 20
const viewBoxHeight = 4

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// ==================== BALANCE METHOD STEPS ====================
const balanceSteps = computed(() => {
  const steps = []
  const a = eqA.value
  const b = eqB.value
  const c = eqC.value
  const d = eqD.value
  
  // Step 0: Original equation
  steps.push({
    left: formatSide(a, 'x', b),
    right: formatSide(c, 'x', d),
    action: 'Startvergelijking',
    highlight: 'both'
  })
  
  // Step 1: Move x terms to left (subtract cx from both sides)
  if (c !== 0) {
    steps.push({
      left: formatSide(a - c, 'x', b),
      right: formatSide(0, 'x', d),
      action: `Trek ${formatCoef(c)}x af van beide leden`,
      highlight: 'left'
    })
  }
  
  // Step 2: Move constants to right (subtract b from both sides)
  if (b !== 0) {
    steps.push({
      left: formatSide(a - c, 'x', 0),
      right: formatSide(0, 'x', d - b),
      action: `Trek ${Math.abs(b)} ${b > 0 ? 'af' : 'op'} bij beide leden`,
      highlight: 'right'
    })
  }
  
  // Step 3: Divide by coefficient
  const finalA = a - c
  const finalB = d - b
  if (finalA !== 0 && finalA !== 1 && finalA !== -1) {
    steps.push({
      left: 'x',
      right: formatValue(finalB / finalA),
      action: `Deel beide leden door ${finalA}`,
      highlight: 'both'
    })
  } else if (finalA === 0) {
    steps.push({
      left: '0',
      right: formatValue(finalB),
      action: finalB === 0 ? 'Onbepaald' : 'Onmogelijk',
      highlight: 'both'
    })
  } else {
    steps.push({
      left: 'x',
      right: formatValue(finalB / finalA),
      action: 'Oplossing gevonden',
      highlight: 'both'
    })
  }
  
  return steps
})

function formatSide(a, varName, b) {
  if (a === 0) return `${b}`
  const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`
  if (b === 0) return `${aStr}${varName}`
  const sign = b > 0 ? ' + ' : ' - '
  return `${aStr}${varName}${sign}${Math.abs(b)}`
}

function formatCoef(a) {
  if (a === 1) return ''
  if (a === -1) return '-'
  return a
}

function formatValue(v) {
  if (Number.isInteger(v)) return `${v}`
  return v.toFixed(2)
}

// ==================== FORMULA CHALLENGES ====================
const formulaChallenges = [
  {
    type: 'simple',
    formula: 'y = ax + b',
    solveFor: 'x',
    steps: [
      { instruction: 'Trek b af van beide leden', expression: 'y - b = ax' },
      { instruction: 'Deel beide leden door a', expression: 'x = (y - b) / a' }
    ],
    answer: '(y - b) / a'
  },
  {
    type: 'geometry',
    formula: 'A = πr²',
    solveFor: 'r',
    steps: [
      { instruction: 'Deel beide leden door π', expression: 'A/π = r²' },
      { instruction: 'Neem de vierkantswortel', expression: 'r = √(A/π)' }
    ],
    answer: '√(A/π)'
  }
]

// ==================== CHALLENGE GENERATION ====================
function generateEquationChallenge() {
  challengeType.value = 'solve'
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate equation with nice integer solution
  const solution = Math.floor(Math.random() * 10) - 5
  eqA.value = Math.floor(Math.random() * 5) + 1
  eqB.value = Math.floor(Math.random() * 10) - 5
  eqC.value = Math.floor(Math.random() * 3)
  eqD.value = eqA.value * solution + eqB.value - eqC.value * solution
  
  solvingStep.value = 0
  showSolution.value = false
}

function generateInequalityChallenge() {
  challengeType.value = 'inequality'
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  ineqA.value = Math.floor(Math.random() * 4) + 1
  ineqB.value = Math.floor(Math.random() * 20) - 10
  const ops = ['<', '>', '<=', '>=']
  ineqOperator.value = ops[Math.floor(Math.random() * ops.length)]
  ineqSolved.value = false
}

function generateFormulaChallenge() {
  challengeType.value = 'rearrange'
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  formulaProgress.value = 0
  formulaUserAnswer.value = ''
  
  const types = ['simple', 'geometry']
  formulaType.value = types[Math.floor(Math.random() * types.length)]
}

function checkInequalityAnswer() {
  ineqSolved.value = true
}

function checkFormulaAnswer() {
  const challenge = formulaChallenges.find(c => c.type === formulaType.value)
  if (formulaUserAnswer.value.trim().toLowerCase() === challenge.answer.toLowerCase()) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! De formule is juist herschikt.'
  } else {
    challengeFeedback.value = 'Nog niet juist. Probeer het opnieuw.'
  }
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
    title: 'Balansmethode',
    description: 'Los vergelijkingen op door beide leden gelijk te behandelen.',
    focus: 'balance',
    instruction: 'Wijzig de parameters en volg de stappen van de balansmethode.',
    details: [
      'Werk weg van de x naar buiten toe',
      'Doe aan beide leden hetzelfde',
      'Controleer je oplossing door in te vullen'
    ]
  },
  {
    title: 'Ongelijkheden',
    description: 'Bij ongelijkheden met negatieve getallen teken omkeren.',
    focus: 'inequality',
    instruction: 'Bestudeer het effect van positieve en negatieve coëfficiënten.',
    details: [
      'Vermenigvuldigen met positief getal: teken blijft',
      'Vermenigvuldigen met negatief getal: teken keert om',
      'Dit geldt ook voor delen'
    ]
  },
  {
    title: 'Formule omschrijven',
    description: 'Maak een andere variabele het onderwerp van de formule.',
    focus: 'formula',
    instruction: 'Volg de stappen om de formule om te schrijven.',
    details: [
      'Werk in omgekeerde volgorde van de bewerkingen',
      'Eerst optellen/aftrekken omkeren',
      'Dan vermenigvuldigen/delen omkeren'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    equationMode.value = ['solver', 'inequality', 'formula'][currentStep.value]
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    equationMode.value = ['solver', 'inequality', 'formula'][currentStep.value]
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
            <PhEquals class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Eerstegraadsvergelijkingen</h1>
            <p class="text-sm text-slate-500">Vergelijkingen, ongelijkheden en formules</p>
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
              Oefeningen
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
              
              <!-- Mode: Equation Solver -->
              <template v-if="equationMode === 'solver'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Coëfficiënt links (a)</label>
                    <input 
                      type="range" 
                      v-model.number="eqA" 
                      min="-5" 
                      max="5" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ eqA }}</span>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Constante links (b)</label>
                    <input 
                      type="range" 
                      v-model.number="eqB" 
                      min="-10" 
                      max="10" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ eqB }}</span>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-600">Coëfficiënt rechts (c)</label>
                    <input 
                      type="range" 
                      v-model.number="eqC" 
                      min="-5" 
                      max="5" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ eqC }}</span>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-600">Constante rechts (d)</label>
                    <input 
                      type="range" 
                      v-model.number="eqD" 
                      min="-10" 
                      max="10" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ eqD }}</span>
                  </div>

                  <!-- Step Navigation for Balance Method -->
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Balansmethode stappen</p>
                    <div class="flex gap-2 mb-3">
                      <button 
                        @click="solvingStep = Math.max(0, solvingStep - 1)"
                        :disabled="solvingStep === 0"
                        class="px-3 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                      >
                        ← Vorige
                      </button>
                      <span class="text-xs text-slate-500 py-1">Stap {{ solvingStep + 1 }} / {{ balanceSteps.length }}</span>
                      <button 
                        @click="solvingStep = Math.min(balanceSteps.length - 1, solvingStep + 1)"
                        :disabled="solvingStep >= balanceSteps.length - 1"
                        class="px-3 py-1 text-xs bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                      >
                        Volgende →
                      </button>
                    </div>
                    <div v-if="balanceSteps[solvingStep]" class="text-sm">
                      <p class="text-brand-orange font-medium mb-1">{{ balanceSteps[solvingStep].action }}</p>
                      <p class="font-mono bg-white p-2 rounded border border-slate-200">
                        {{ balanceSteps[solvingStep].left }} = {{ balanceSteps[solvingStep].right }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Mode: Inequality -->
              <template v-if="equationMode === 'inequality'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Coëfficiënt (a)</label>
                    <input 
                      type="range" 
                      v-model.number="ineqA" 
                      min="-5" 
                      max="5" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded" :class="ineqA < 0 ? 'text-rose-600' : 'text-emerald-600'">{{ ineqA }}</span>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Waarde (b)</label>
                    <input 
                      type="range" 
                      v-model.number="ineqB" 
                      min="-20" 
                      max="20" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ ineqB }}</span>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Operator</label>
                    <div class="flex gap-2">
                      <button 
                        v-for="op in ['<', '>', '<=', '>=']" 
                        :key="op"
                        @click="ineqOperator = op"
                        :class="['px-4 py-2 rounded-lg text-sm font-mono border transition-all', 
                          ineqOperator === op ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-slate-700 border-slate-300']"
                      >
                        {{ op }}
                      </button>
                    </div>
                  </div>

                  <div v-if="ineqA < 0" class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800 font-medium">⚠️ Let op: a &lt; 0</p>
                    <p class="text-xs text-amber-700 mt-1">Bij delen door een negatief getal, draait het ongelijkheidsteken om!</p>
                  </div>
                </div>
              </template>

              <!-- Mode: Formula -->
              <template v-if="equationMode === 'formula'">
                <div class="space-y-4">
                  <div class="flex gap-2">
                    <button 
                      v-for="type in ['simple', 'geometry']" 
                      :key="type"
                      @click="formulaType = type; formulaProgress = 0"
                      :class="['px-3 py-2 rounded-lg text-xs font-medium border transition-all flex-1', 
                        formulaType === type ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-slate-700 border-slate-300']"
                    >
                      {{ type === 'simple' ? 'Eenvoudig' : 'Meetkunde' }}
                    </button>
                  </div>

                  <div v-if="formulaChallenges.find(c => c.type === formulaType)" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Formule: {{ formulaChallenges.find(c => c.type === formulaType).formula }}</p>
                    <p class="text-sm text-slate-600">Maak <span class="font-mono font-bold">{{ formulaChallenges.find(c => c.type === formulaType).solveFor }}</span> het onderwerp</p>
                  </div>

                  <div class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Stappen:</p>
                    <div v-for="(step, idx) in formulaChallenges.find(c => c.type === formulaType)?.steps" :key="idx" class="flex items-start gap-2">
                      <span :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', 
                        formulaProgress > idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500']">
                        {{ idx + 1 }}
                      </span>
                      <div class="flex-1">
                        <p class="text-sm text-slate-700">{{ step.instruction }}</p>
                        <p v-if="formulaProgress > idx" class="text-sm font-mono text-brand-orange mt-1">{{ step.expression }}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    @click="formulaProgress = Math.min(formulaChallenges.find(c => c.type === formulaType)?.steps.length || 0, formulaProgress + 1)"
                    :disabled="formulaProgress >= (formulaChallenges.find(c => c.type === formulaType)?.steps.length || 0)"
                    class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {{ formulaProgress === (formulaChallenges.find(c => c.type === formulaType)?.steps.length || 0) ? 'Voltooid' : 'Toon volgende stap' }}
                  </button>
                </div>
              </template>

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

          <!-- Mode: Derivation/Practice -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Oefeningen</h2>
              <p class="text-sm text-slate-600">Kies een uitdaging om je vaardigheden te testen.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateEquationChallenge()" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800 flex items-center gap-2">
                    <PhEquals class="text-brand-orange" />
                    Vergelijking oplossen
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Los een eerstegraadsvergelijking op met de balansmethode.</div>
                </button>
                
                <button @click="generateInequalityChallenge()" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800 flex items-center gap-2">
                    <PhTrendUp class="text-brand-orange" />
                    Ongelijkheid
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Los een ongelijkheid op en teken op een getallenas.</div>
                </button>
                
                <button @click="generateFormulaChallenge()" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800 flex items-center gap-2">
                    <PhArrowElbowRight class="text-brand-orange" />
                    Formule omschrijven
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Maak een andere variabele het onderwerp van een formule.</div>
                </button>
              </div>

              <!-- Active Challenge: Equation -->
              <div v-else-if="challengeType === 'solve'" class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Los op:</p>
                  <p class="text-lg font-mono font-bold">{{ equationLeft }} = {{ equationRight }}</p>
                </div>

                <!-- Balance Steps -->
                <div class="space-y-2">
                  <p class="text-sm font-bold text-slate-700">Stappen:</p>
                  <div v-for="(step, idx) in balanceSteps" :key="idx" class="p-2 bg-slate-50 rounded border border-slate-200">
                    <p class="text-xs text-slate-500">{{ step.action }}</p>
                    <p class="text-sm font-mono">{{ step.left }} = {{ step.right }}</p>
                  </div>
                </div>

                <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p class="text-sm font-bold text-emerald-800">Oplossing: x = {{ typeof equationSolution === 'number' ? equationSolution.toFixed(2) : equationSolution }}</p>
                </div>

                <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                  Nieuwe opgave
                </button>
              </div>

              <!-- Active Challenge: Inequality -->
              <div v-else-if="challengeType === 'inequality'" class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Los op:</p>
                  <p class="text-lg font-mono font-bold">{{ ineqA }}x {{ ineqOperator }} {{ ineqB }}</p>
                </div>

                <div v-if="!ineqSolved" class="space-y-3">
                  <p class="text-sm text-slate-600">Wat is de oplossing?</p>
                  <button @click="checkInequalityAnswer" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
                    Toon oplossing
                  </button>
                </div>

                <div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p class="text-sm font-bold text-emerald-800">Oplossing:</p>
                  <p class="text-lg font-mono mt-1">
                    x {{ ineqSolution.operator }} {{ ineqSolution.value.toFixed(2) }}
                  </p>
                  <p v-if="ineqA < 0" class="text-xs text-amber-700 mt-2">
                    ⚠️ Teken omgedraaid omdat a &lt; 0
                  </p>
                </div>

                <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                  Nieuwe opgave
                </button>
              </div>

              <!-- Active Challenge: Formula -->
              <div v-else-if="challengeType === 'rearrange'" class="space-y-4">
                <div v-if="formulaChallenges.find(c => c.type === formulaType)" class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Maak het onderwerp:</p>
                  <p class="text-lg font-mono font-bold">{{ formulaChallenges.find(c => c.type === formulaType).formula }}</p>
                  <p class="text-sm text-white/80 mt-1">Los op voor: {{ formulaChallenges.find(c => c.type === formulaType).solveFor }}</p>
                </div>

                <div class="space-y-3">
                  <label class="text-sm font-bold text-slate-700">Jouw antwoord:</label>
                  <input 
                    type="text" 
                    v-model="formulaUserAnswer"
                    placeholder="bijv: (y - b) / a"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                  >
                  <p class="text-xs text-slate-500">Gebruik haakjes en spaties zoals in het voorbeeld</p>
                </div>

                <div class="space-y-2">
                  <button @click="checkFormulaAnswer" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
                    Controleer
                  </button>
                  <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
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
              <template v-if="equationMode === 'solver' || (currentMode === 'derivation' && challengeType === 'solve')">
                <div class="flex justify-between">
                  <span class="text-slate-600">Vergelijking:</span>
                  <span class="font-mono text-xs">{{ equationLeft }} = {{ equationRight }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Type:</span>
                  <span class="font-mono">{{ eqA - eqC !== 0 ? 'Eén oplossing' : eqD - eqB === 0 ? 'Onbepaald' : 'Onmogelijk' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Oplossing:</span>
                  <span class="font-mono text-brand-orange">
                    {{ typeof equationSolution === 'number' ? `x = ${equationSolution.toFixed(2)}` : equationSolution }}
                  </span>
                </div>
              </template>

              <template v-if="equationMode === 'inequality' || (currentMode === 'derivation' && challengeType === 'inequality')">
                <div class="flex justify-between">
                  <span class="text-slate-600">Ongelijkheid:</span>
                  <span class="font-mono text-xs">{{ ineqA }}x {{ ineqOperator }} {{ ineqB }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Oplossing:</span>
                  <span class="font-mono text-brand-orange">
                    <span v-if="ineqSolved || currentMode === 'analysis'">
                      x {{ ineqSolution.operator }} {{ ineqSolution.value.toFixed(2) }}
                    </span>
                    <span v-else class="text-slate-400">?</span>
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Tekenomkeer:</span>
                  <span :class="['font-mono', ineqA < 0 ? 'text-rose-600' : 'text-emerald-600']">
                    {{ ineqA < 0 ? 'Ja (a < 0)' : 'Nee (a > 0)' }}
                  </span>
                </div>
              </template>

              <template v-if="equationMode === 'formula' || (currentMode === 'derivation' && challengeType === 'rearrange')">
                <div class="flex justify-between">
                  <span class="text-slate-600">Formule:</span>
                  <span class="font-mono text-xs">{{ formulaChallenges.find(c => c.type === formulaType)?.formula }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Onderwerp:</span>
                  <span class="font-mono text-brand-orange">{{ formulaChallenges.find(c => c.type === formulaType)?.solveFor }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <template v-if="equationMode === 'solver' || (currentMode === 'derivation' && challengeType === 'solve')">
                <span class="text-sm text-slate-500">Te oplossen:</span>
                <span class="text-2xl font-mono font-bold text-brand-dark">{{ equationLeft }} = {{ equationRight }}</span>
              </template>
              <template v-if="equationMode === 'inequality' || (currentMode === 'derivation' && challengeType === 'inequality')">
                <span class="text-sm text-slate-500">Ongelijkheid:</span>
                <span class="text-2xl font-mono font-bold text-brand-dark">{{ ineqA }}x {{ ineqOperator }} {{ ineqB }}</span>
              </template>
              <template v-if="equationMode === 'formula' || (currentMode === 'derivation' && challengeType === 'rearrange')">
                <span class="text-sm text-slate-500">Formule:</span>
                <span class="text-2xl font-mono font-bold text-brand-dark">{{ formulaChallenges.find(c => c.type === formulaType)?.formula }}</span>
              </template>
            </div>
          </div>

          <!-- Visualization Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <!-- Number Line for Inequalities -->
            <template v-if="equationMode === 'inequality' || (currentMode === 'derivation' && challengeType === 'inequality')">
              <svg 
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
                class="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- Number line -->
                <line 
                  :x1="toSvgX(viewBoxX)" 
                  :y1="toSvgY(0)" 
                  :x2="toSvgX(viewBoxX + viewBoxWidth)" 
                  :y2="toSvgY(0)" 
                  stroke="#64748B" 
                  stroke-width="3"
                />
                
                <!-- Arrow heads -->
                <polygon 
                  :points="`${toSvgX(viewBoxX + viewBoxWidth - 0.5)},${toSvgY(0) - 5} ${toSvgX(viewBoxX + viewBoxWidth)},${toSvgY(0)} ${toSvgX(viewBoxX + viewBoxWidth - 0.5)},${toSvgY(0) + 5}`"
                  fill="#64748B"
                />
                <polygon 
                  :points="`${toSvgX(viewBoxX + 0.5)},${toSvgY(0) - 5} ${toSvgX(viewBoxX)},${toSvgY(0)} ${toSvgX(viewBoxX + 0.5)},${toSvgY(0) + 5}`"
                  fill="#64748B"
                />
                
                <!-- Tick marks and labels -->
                <g v-for="i in 21" :key="`tick${i}`">
                  <line 
                    :x1="toSvgX(-10 + i)" 
                    :y1="toSvgY(0) - 5" 
                    :x2="toSvgX(-10 + i)" 
                    :y2="toSvgY(0) + 5" 
                    stroke="#64748B" 
                    stroke-width="1"
                  />
                  <text 
                    :x="toSvgX(-10 + i)" 
                    :y="toSvgY(0) + 25" 
                    text-anchor="middle" 
                    class="fill-slate-500 text-xs"
                  >
                    {{ -10 + i }}
                  </text>
                </g>
                
                <!-- Solution visualization -->
                <template v-if="currentMode === 'analysis' || ineqSolved">
                  <!-- The solution point -->
                  <circle 
                    :cx="toSvgX(ineqSolution.value)" 
                    :cy="toSvgY(0)" 
                    :r="ineqOperator.includes('=') ? 8 : 6" 
                    :fill="ineqOperator.includes('=') ? '#F97316' : 'white'" 
                    :stroke="ineqOperator.includes('=') ? '#F97316' : '#F97316'" 
                    stroke-width="3"
                  />
                  
                  <!-- Shaded region -->
                  <template v-if="ineqSolution.operator === '<' || ineqSolution.operator === '<='">
                    <line 
                      :x1="toSvgX(viewBoxX)" 
                      :y1="toSvgY(0)" 
                      :x2="toSvgX(ineqSolution.value)" 
                      :y2="toSvgY(0)" 
                      stroke="#F97316" 
                      stroke-width="6" 
                      opacity="0.3"
                    />
                    <!-- Arrow indicating direction -->
                    <polygon 
                      :points="`${toSvgX(viewBoxX + 1)},${toSvgY(0) - 8} ${toSvgX(viewBoxX)},${toSvgY(0)} ${toSvgX(viewBoxX + 1)},${toSvgY(0) + 8}`"
                      fill="#F97316"
                    />
                  </template>
                  <template v-else>
                    <line 
                      :x1="toSvgX(ineqSolution.value)" 
                      :y1="toSvgY(0)" 
                      :x2="toSvgX(viewBoxX + viewBoxWidth)" 
                      :y2="toSvgY(0)" 
                      stroke="#F97316" 
                      stroke-width="6" 
                      opacity="0.3"
                    />
                    <!-- Arrow indicating direction -->
                    <polygon 
                      :points="`${toSvgX(viewBoxX + viewBoxWidth - 1)},${toSvgY(0) - 8} ${toSvgX(viewBoxX + viewBoxWidth)},${toSvgY(0)} ${toSvgX(viewBoxX + viewBoxWidth - 1)},${toSvgY(0) + 8}`"
                      fill="#F97316"
                    />
                  </template>
                  
                  <!-- Solution label -->
                  <text 
                    :x="toSvgX(ineqSolution.value)" 
                    :y="toSvgY(0) - 20" 
                    text-anchor="middle" 
                    class="fill-brand-orange text-sm font-bold"
                  >
                    x {{ ineqSolution.operator }} {{ ineqSolution.value.toFixed(2) }}
                  </text>
                </template>
              </svg>
              
              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-orange-500/30"></div>
                    <span class="text-slate-600">Oplossingsgebied</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-slate-600">Inclusief (≤, ≥)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full border-2 border-orange-500 bg-white"></div>
                    <span class="text-slate-600">Exclusief (&lt;, &gt;)</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Balance Method Visualization -->
            <template v-else-if="equationMode === 'solver' || (currentMode === 'derivation' && challengeType === 'solve')">
              <div class="flex flex-col items-center justify-center h-full p-8">
                <!-- Balance scale visualization -->
                <div class="relative w-full max-w-2xl">
                  <!-- Balance beam -->
                  <div class="h-2 bg-slate-300 rounded-full relative mb-16">
                    <!-- Center fulcrum -->
                    <div class="absolute left-1/2 -translate-x-1/2 -top-4 w-8 h-8 bg-slate-400 rounded-full"></div>
                    <div class="absolute left-1/2 -translate-x-1/2 top-4 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-slate-400"></div>
                  </div>
                  
                  <!-- Left pan -->
                  <div class="absolute left-0 top-8 w-1/2 pr-4">
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                      <p class="text-xs text-blue-600 mb-2">Linker lid</p>
                      <p class="text-2xl font-mono font-bold text-blue-800">{{ balanceSteps[solvingStep]?.left || equationLeft }}</p>
                    </div>
                  </div>
                  
                  <!-- Right pan -->
                  <div class="absolute right-0 top-8 w-1/2 pl-4">
                    <div class="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-center">
                      <p class="text-xs text-emerald-600 mb-2">Rechter lid</p>
                      <p class="text-2xl font-mono font-bold text-emerald-800">{{ balanceSteps[solvingStep]?.right || equationRight }}</p>
                    </div>
                  </div>
                  
                  <!-- Equals sign in middle -->
                  <div class="absolute left-1/2 top-16 -translate-x-1/2">
                    <PhEquals class="text-3xl text-slate-400" weight="bold" />
                  </div>
                </div>
                
                <!-- Step indicator -->
                <div class="mt-24 text-center">
                  <p class="text-lg font-medium text-slate-700">{{ balanceSteps[solvingStep]?.action }}</p>
                  <div class="flex items-center justify-center gap-2 mt-4">
                    <span 
                      v-for="(_, idx) in balanceSteps" 
                      :key="idx"
                      :class="['w-3 h-3 rounded-full', idx === solvingStep ? 'bg-brand-orange' : 'bg-slate-300']"
                    ></span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Formula Rearrangement -->
            <template v-else>
              <div class="flex flex-col items-center justify-center h-full p-8">
                <div class="max-w-lg w-full space-y-6">
                  <div class="text-center">
                    <PhNotepad class="text-6xl text-brand-orange mx-auto mb-4" weight="fill" />
                    <h3 class="text-xl font-bold text-slate-800 mb-2">Formule omschrijven</h3>
                    <p class="text-slate-600">Werk stap voor stap naar het doel</p>
                  </div>
                  
                  <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div class="flex items-center justify-center gap-4 text-lg">
                      <div v-if="formulaChallenges.find(c => c.type === formulaType)" class="text-center">
                        <p class="text-sm text-slate-500 mb-2">Oorspronkelijk:</p>
                        <p class="font-mono font-bold text-slate-800">{{ formulaChallenges.find(c => c.type === formulaType).formula }}</p>
                      </div>
                      <PhArrowElbowRight class="text-3xl text-brand-orange" />
                      <div v-if="formulaChallenges.find(c => c.type === formulaType)" class="text-center">
                        <p class="text-sm text-slate-500 mb-2">Doel:</p>
                        <p class="font-mono font-bold text-brand-orange">{{ formulaChallenges.find(c => c.type === formulaType).solveFor }} = ?</p>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="formulaProgress > 0" class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Tussenstappen:</p>
                    <div 
                      v-for="(step, idx) in formulaChallenges.find(c => c.type === formulaType)?.steps.slice(0, formulaProgress)" 
                      :key="idx"
                      class="p-3 bg-white border border-slate-200 rounded-lg"
                    >
                      <p class="text-xs text-slate-500 mb-1">{{ step.instruction }}</p>
                      <p class="font-mono text-brand-orange">{{ step.expression }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
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
