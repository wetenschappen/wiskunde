<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhBrain, PhTable, PhCheckCircle, 
  PhArrowRight, PhArrowLeft, PhEquals, PhNotEquals,
  PhChecks, PhProhibit, PhShuffle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Truth Table Builder Mode
const truthTableVars = ref(['p', 'q']) // Variables to use
const currentExpression = ref('p ∧ q')
const userTruthTable = ref([])
const showSolutionTable = ref(false)

// Equivalence Checker Mode
const leftExpression = ref('p → q')
const rightExpression = ref('¬p ∨ q')
const equivalenceChecked = ref(false)
const isEquivalent = ref(false)

// Tautology/Contradiction Mode
const tautologyExpression = ref('p ∨ ¬p')
const tautologyChecked = ref(false)
const isTautology = ref(false)
const isContradiction = ref(false)

// Challenge Mode
const challengeActive = ref(false)
const challengeType = ref('') // 'truth-table', 'equivalence', 'tautology'
const challengeQuestion = ref('')
const challengeAnswer = ref('')
const userAnswer = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== LOGICAL OPERATORS ====================
const operators = [
  { symbol: '¬', name: 'NOT', description: 'Negatie', precedence: 5 },
  { symbol: '∧', name: 'AND', description: 'Conjunctie', precedence: 4 },
  { symbol: '∨', name: 'OR', description: 'Disjunctie', precedence: 3 },
  { symbol: '→', name: 'IMPLIES', description: 'Implicatie', precedence: 2 },
  { symbol: '↔', name: 'IFF', description: 'Equivalentie', precedence: 1 }
]

// ==================== COMPUTED PROPERTIES ====================

// Generate all possible truth value combinations for given variables
function generateCombinations(variables) {
  const n = variables.length
  const combinations = []
  for (let i = 0; i < Math.pow(2, n); i++) {
    const combo = {}
    for (let j = 0; j < n; j++) {
      combo[variables[j]] = Boolean(i & (1 << (n - 1 - j)))
    }
    combinations.push(combo)
  }
  return combinations
}

// Parse and evaluate a logical expression
function evaluateExpression(expr, values) {
  // Replace variables with their values
  let processedExpr = expr
  for (const [varName, varValue] of Object.entries(values)) {
    processedExpr = processedExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), varValue)
  }
  
  // Evaluate the expression step by step
  // Handle parentheses first
  while (processedExpr.includes('(')) {
    const match = processedExpr.match(/\(([^()]+)\)/)
    if (match) {
      const inner = match[1]
      const result = evaluateSimpleExpression(inner)
      processedExpr = processedExpr.replace(`(${inner})`, result)
    } else {
      break
    }
  }
  
  return evaluateSimpleExpression(processedExpr)
}

function evaluateSimpleExpression(expr) {
  // Replace logical operators with JavaScript equivalents
  let jsExpr = expr
    .replace(/¬\s*true/g, 'false')
    .replace(/¬\s*false/g, 'true')
    .replace(/¬\s*([^&|])/g, '!$1')
    .replace(/∧/g, '&&')
    .replace(/∨/g, '||')
    .replace(/→/g, '<=') // p → q is equivalent to !p || q
    .replace(/↔/g, '===') // p ↔ q is equivalent to p === q
    .replace(/true/g, '1')
    .replace(/false/g, '0')
  
  try {
    // Handle implication specially
    if (jsExpr.includes('<=')) {
      const parts = jsExpr.split('<=').map(s => s.trim())
      if (parts.length === 2) {
        const left = parts[0] === '1' ? 1 : (parts[0] === '0' ? 0 : eval(parts[0]))
        const right = parts[1] === '1' ? 1 : (parts[1] === '0' ? 0 : eval(parts[1]))
        return (!left || right) ? true : false
      }
    }
    
    const result = eval(jsExpr)
    return result === 1 || result === true
  } catch (e) {
    return false
  }
}

// Generate truth table for current expression
const truthTableData = computed(() => {
  const variables = [...new Set(currentExpression.value.match(/\b[pqrs]\b/g) || [])].sort()
  const combinations = generateCombinations(variables)
  
  return combinations.map(combo => ({
    values: combo,
    result: evaluateExpression(currentExpression.value, combo)
  }))
})

// Check if current expression is a tautology (always true)
const expressionIsTautology = computed(() => {
  const data = truthTableData.value
  return data.length > 0 && data.every(row => row.result)
})

// Check if current expression is a contradiction (always false)
const expressionIsContradiction = computed(() => {
  const data = truthTableData.value
  return data.length > 0 && data.every(row => !row.result)
})

// Check logical equivalence between two expressions
function checkEquivalence() {
  const vars1 = [...new Set(leftExpression.value.match(/\b[pqrs]\b/g) || [])]
  const vars2 = [...new Set(rightExpression.value.match(/\b[pqrs]\b/g) || [])]
  const allVars = [...new Set([...vars1, ...vars2])].sort()
  
  const combinations = generateCombinations(allVars)
  equivalenceChecked.value = true
  
  isEquivalent.value = combinations.every(combo => {
    const leftResult = evaluateExpression(leftExpression.value, combo)
    const rightResult = evaluateExpression(rightExpression.value, combo)
    return leftResult === rightResult
  })
}

// Check if expression is tautology or contradiction
function checkTautology() {
  const vars = [...new Set(tautologyExpression.value.match(/\b[pqrs]\b/g) || [])]
  const combinations = generateCombinations(vars)
  
  tautologyChecked.value = true
  
  const allTrue = combinations.every(combo => evaluateExpression(tautologyExpression.value, combo))
  const allFalse = combinations.every(combo => !evaluateExpression(tautologyExpression.value, combo))
  
  isTautology.value = allTrue
  isContradiction.value = allFalse
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  if (type === 'truth-table') {
    const expressions = [
      { expr: 'p ∧ q', result: 'conjunctie' },
      { expr: 'p ∨ q', result: 'disjunctie' },
      { expr: 'p → q', result: 'implicatie' },
      { expr: '¬p ∨ q', result: 'equivalentie' }
    ]
    const random = expressions[Math.floor(Math.random() * expressions.length)]
    currentExpression.value = random.expr
    challengeQuestion.value = `Maak de waarheidstabel voor: ${random.expr}`
    challengeAnswer.value = 'voltooid'
  } else if (type === 'equivalence') {
    const pairs = [
      { left: 'p → q', right: '¬p ∨ q' },
      { left: 'p ∧ q', right: 'q ∧ p' },
      { left: 'p ∨ q', right: 'q ∨ p' },
      { left: '¬(p ∧ q)', right: '¬p ∨ ¬q' }
    ]
    const random = pairs[Math.floor(Math.random() * pairs.length)]
    leftExpression.value = random.left
    rightExpression.value = random.right
    challengeQuestion.value = `Zijn deze expressies equivalent? ${random.left} en ${random.right}`
    challengeAnswer.value = 'ja'
  } else if (type === 'tautology') {
    const expressions = [
      { expr: 'p ∨ ¬p', isTaut: true },
      { expr: 'p ∧ ¬p', isTaut: false },
      { expr: 'p → p', isTaut: true },
      { expr: 'p ↔ p', isTaut: true }
    ]
    const random = expressions[Math.floor(Math.random() * expressions.length)]
    tautologyExpression.value = random.expr
    challengeQuestion.value = `Is dit een tautologie? ${random.expr}`
    challengeAnswer.value = random.isTaut ? 'ja' : 'nee'
  }
}

function checkChallenge() {
  const answer = userAnswer.value.toLowerCase().trim()
  
  if (challengeType.value === 'truth-table') {
    challengeSolved.value = true
    challengeFeedback.value = 'Goed! De waarheidstabel is correct geconstrueerd.'
  } else if (challengeType.value === 'equivalence') {
    checkEquivalence()
    const correct = (answer === 'ja' && isEquivalent.value) || (answer === 'nee' && !isEquivalent.value)
    challengeSolved.value = correct
    challengeFeedback.value = correct 
      ? 'Correct! Je hebt de equivalentie correct bepaald.'
      : 'Niet correct. Controleer de waarheidstabellen van beide expressies.'
  } else if (challengeType.value === 'tautology') {
    checkTautology()
    const expectedAnswer = isTautology.value ? 'ja' : 'nee'
    challengeSolved.value = answer === expectedAnswer
    challengeFeedback.value = answer === expectedAnswer
      ? 'Correct! Je hebt correct bepaald of dit een tautologie is.'
      : 'Niet correct. Analyseer de waarheidstabel zorgvuldig.'
  }
}

// ==================== SVG VISUALIZATION ====================
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

// Generate Venn diagram positions
function getVennCirclePosition(circleIndex) {
  if (circleIndex === 0) return { cx: -2, cy: 0, r: 3 }
  if (circleIndex === 1) return { cx: 2, cy: 0, r: 3 }
  return { cx: 0, cy: 3, r: 2 }
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
    title: 'Logische operatoren',
    description: 'Leer de basisoperatoren kennen: NOT (¬), AND (∧), OR (∨), IMPLIES (→).',
    focus: 'operators',
    instruction: 'Bestudeer de definities van de logische operatoren.',
    details: [
      '¬p (NOT): waar als p onwaar is',
      'p ∧ q (AND): waar als p en q beiden waar zijn',
      'p ∨ q (OR): waar als p of q (of beiden) waar zijn',
      'p → q (IMPLIES): onwaar alleen als p waar en q onwaar is'
    ]
  },
  {
    title: 'Waarheidstabellen',
    description: 'Een waarheidstabel toont alle mogelijke waarheidswaarden voor een expressie.',
    focus: 'truth-table',
    instruction: 'Bouw de waarheidstabel voor de gegeven expressie.',
    details: [
      'Met n variabelen zijn er 2ⁿ rijen',
      'Elke rij toont één combinatie van waarheidswaarden',
      'De laatste kolom toont het resultaat van de expressie'
    ]
  },
  {
    title: 'Tautologie en contradictie',
    description: 'Een tautologie is altijd waar, een contradictie altijd onwaar.',
    focus: 'tautology',
    instruction: 'Onderzoek of de expressie een tautologie of contradictie is.',
    details: [
      'Tautologie: alle uitkomsten in de tabel zijn WAAR',
      'Contradictie: alle uitkomsten in de tabel zijn ONWAAR',
      'Contingentie: mix van waar en onwaar uitkomsten'
    ]
  },
  {
    title: 'Logische equivalentie',
    description: 'Twee expressies zijn equivalent als ze dezelfde waarheidstabel hebben.',
    focus: 'equivalence',
    instruction: 'Vergelijk de waarheidstabellen van twee expressies.',
    details: [
      'Equivalente expressies hebben identieke waarheidstabellen',
      'De Wetten van De Morgan zijn belangrijke equivalenties',
      'p → q is equivalent met ¬p ∨ q'
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

// Initialize truth table for challenge
function initUserTruthTable() {
  const variables = [...new Set(currentExpression.value.match(/\b[pqrs]\b/g) || [])].sort()
  const combinations = generateCombinations(variables)
  userTruthTable.value = combinations.map(() => null)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhBrain class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Logica en Waarheidstabellen</h1>
            <p class="text-sm text-slate-500">LPD MD 06.19 - Logische operatoren en equivalenties</p>
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
              
              <!-- Operators Reference -->
              <div v-if="analysisSteps[currentStep].focus === 'operators'" class="space-y-3">
                <div v-for="op in operators" :key="op.symbol" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-lg font-bold text-brand-dark">{{ op.symbol }}</span>
                    <span class="text-sm font-medium text-slate-600">{{ op.name }}</span>
                  </div>
                  <p class="text-xs text-slate-500">{{ op.description }}</p>
                </div>
              </div>

              <!-- Truth Table Builder -->
              <div v-if="analysisSteps[currentStep].focus === 'truth-table'" class="space-y-3">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-brand-dark">Expressie</label>
                  <input 
                    v-model="currentExpression"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                    placeholder="bijv. p ∧ q"
                  >
                </div>
                <div class="flex gap-2">
                  <button 
                    v-for="op in operators" 
                    :key="op.symbol"
                    @click="currentExpression += op.symbol"
                    class="px-2 py-1 bg-slate-100 rounded text-sm font-mono hover:bg-slate-200 transition-colors"
                  >
                    {{ op.symbol }}
                  </button>
                </div>
                <button 
                  @click="showSolutionTable = !showSolutionTable"
                  class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                  {{ showSolutionTable ? 'Verberg' : 'Toon' }} waarheidstabel
                </button>
              </div>

              <!-- Tautology/Contradiction Checker -->
              <div v-if="analysisSteps[currentStep].focus === 'tautology'" class="space-y-3">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-brand-dark">Expressie</label>
                  <input 
                    v-model="tautologyExpression"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                  >
                </div>
                <button 
                  @click="checkTautology"
                  class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                  Analyseer
                </button>
                <div v-if="tautologyChecked" class="p-3 rounded-lg text-sm" :class="isTautology ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isContradiction ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-700 border border-slate-200'">
                  <p v-if="isTautology" class="font-medium">Tautologie!</p>
                  <p v-else-if="isContradiction" class="font-medium">Contradictie!</p>
                  <p v-else>Geen tautologie of contradictie (contingentie)</p>
                </div>
              </div>

              <!-- Equivalence Checker -->
              <div v-if="analysisSteps[currentStep].focus === 'equivalence'" class="space-y-3">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-brand-dark">Expressie 1</label>
                  <input 
                    v-model="leftExpression"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                  >
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-brand-dark">Expressie 2</label>
                  <input 
                    v-model="rightExpression"
                    type="text"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-orange"
                  >
                </div>
                <button 
                  @click="checkEquivalence"
                  class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                >
                  Vergelijk
                </button>
                <div v-if="equivalenceChecked" class="p-3 rounded-lg text-sm" :class="isEquivalent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                  <p v-if="isEquivalent" class="font-medium flex items-center gap-2">
                    <PhChecks class="text-lg" />
                    Equivalent!
                  </p>
                  <p v-else class="font-medium flex items-center gap-2">
                    <PhNotEquals class="text-lg" />
                    Niet equivalent
                  </p>
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
              <h2 class="text-base font-bold text-slate-800 mb-1">Oefeningen</h2>
              <p class="text-sm text-slate-600">Test je kennis van logische operatoren.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('truth-table'); initUserTruthTable()" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Waarheidstabel maken</div>
                  <div class="text-xs text-slate-500 mt-1">Construeer een volledige waarheidstabel.</div>
                </button>
                
                <button @click="generateChallenge('equivalence')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Equivalentie bepalen</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal of twee expressies equivalent zijn.</div>
                </button>
                
                <button @click="generateChallenge('tautology')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Tautologie herkennen</div>
                  <div class="text-xs text-slate-500 mt-1">Identificeer of een expressie een tautologie is.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">{{ challengeQuestion }}</p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div v-if="challengeType === 'truth-table'">
                    <p class="text-sm text-slate-600 mb-2">Vul de waarheidstabel in:</p>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm border-collapse">
                        <thead>
                          <tr class="bg-slate-100">
                            <th v-for="(value, varName) in truthTableData[0]?.values" :key="varName" class="border border-slate-300 px-2 py-1 font-mono">{{ varName }}</th>
                            <th class="border border-slate-300 px-2 py-1 font-mono">{{ currentExpression }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(row, idx) in truthTableData" :key="idx">
                            <td v-for="(value, varName) in row.values" :key="varName" class="border border-slate-300 px-2 py-1 text-center font-mono">
                              {{ value ? 'T' : 'F' }}
                            </td>
                            <td class="border border-slate-300 px-2 py-1">
                              <select 
                                v-model="userTruthTable[idx]"
                                class="w-full text-center bg-transparent"
                              >
                                <option :value="null">?</option>
                                <option :value="true">T</option>
                                <option :value="false">F</option>
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div v-else class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Antwoord (ja/nee)</label>
                    <input 
                      v-model="userAnswer"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="Typ 'ja' of 'nee'"
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
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Logische kenmerken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Huidige expressie:</span>
                <span class="font-mono text-brand-orange">{{ currentExpression }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Aantal variabelen:</span>
                <span class="font-mono">{{ [...new Set(currentExpression.match(/\b[pqrs]\b/g) || [])].length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Rijen in tabel:</span>
                <span class="font-mono">{{ Math.pow(2, [...new Set(currentExpression.match(/\b[pqrs]\b/g) || [])].length) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Type:</span>
                <span class="font-mono" :class="expressionIsTautology ? 'text-emerald-600' : expressionIsContradiction ? 'text-rose-600' : 'text-slate-600'">
                  {{ expressionIsTautology ? 'Tautologie' : expressionIsContradiction ? 'Contradictie' : 'Contingentie' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Expression Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Expressie:</span>
              <span class="text-2xl font-mono font-bold text-brand-dark">{{ currentMode === 'analysis' && analysisSteps[currentStep].focus === 'tautology' ? tautologyExpression : currentExpression }}</span>
            </div>
          </div>

          <!-- Truth Table Display -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PhTable class="text-brand-orange" />
              Waarheidstabel
            </h3>
            
            <div class="overflow-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-brand-dark text-white">
                    <th 
                      v-for="(value, varName) in truthTableData[0]?.values" 
                      :key="varName" 
                      class="border border-slate-600 px-4 py-2 font-mono font-bold"
                    >
                      {{ varName }}
                    </th>
                    <th class="border border-slate-600 px-4 py-2 font-mono font-bold bg-brand-orange">
                      {{ currentMode === 'analysis' && analysisSteps[currentStep].focus === 'tautology' ? tautologyExpression : currentExpression }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(row, idx) in truthTableData" 
                    :key="idx"
                    :class="idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'"
                  >
                    <td 
                      v-for="(value, varName) in row.values" 
                      :key="varName" 
                      class="border border-slate-300 px-4 py-2 text-center font-mono"
                    >
                      <span :class="value ? 'text-emerald-600 font-bold' : 'text-rose-600'">
                        {{ value ? 'T' : 'F' }}
                      </span>
                    </td>
                    <td class="border border-slate-300 px-4 py-2 text-center font-bold">
                      <span :class="row.result ? 'text-emerald-600' : 'text-rose-600'">
                        {{ row.result ? 'T' : 'F' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Legend -->
            <div class="mt-6 flex gap-6 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">T</span>
                <span class="text-slate-600">Waar (True)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">F</span>
                <span class="text-slate-600">Onwaar (False)</span>
              </div>
            </div>

            <!-- Equivalence Comparison -->
            <div v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'equivalence' && equivalenceChecked" class="mt-6 pt-6 border-t border-slate-200">
              <h4 class="text-sm font-bold text-slate-700 mb-3">Vergelijking</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-xs text-slate-500 mb-1">Expressie 1</p>
                  <p class="font-mono font-bold text-slate-800">{{ leftExpression }}</p>
                </div>
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-xs text-slate-500 mb-1">Expressie 2</p>
                  <p class="font-mono font-bold text-slate-800">{{ rightExpression }}</p>
                </div>
              </div>
            </div>

            <!-- Venn Diagram Visualization (for simple expressions) -->
            <div v-if="['p ∧ q', 'p ∨ q'].includes(currentExpression)" class="mt-6 pt-6 border-t border-slate-200">
              <h4 class="text-sm font-bold text-slate-700 mb-3">Venn Diagram</h4>
              <svg viewBox="0 0 400 200" class="w-full h-48">
                <!-- Circle A -->
                <circle 
                  :cx="toSvgX(-2) * 25" 
                  :cy="toSvgY(0) * 16.67" 
                  :r="3 * 25" 
                  fill="rgba(249, 115, 22, 0.2)" 
                  stroke="#F97316" 
                  stroke-width="2"
                />
                <!-- Circle B -->
                <circle 
                  :cx="toSvgX(2) * 25" 
                  :cy="toSvgY(0) * 16.67" 
                  :r="3 * 25" 
                  fill="rgba(59, 130, 246, 0.2)" 
                  stroke="#3B82F6" 
                  stroke-width="2"
                />
                <!-- Labels -->
                <text :x="toSvgX(-3.5) * 25" :y="toSvgY(0) * 16.67" class="fill-slate-700 font-bold text-sm">p</text>
                <text :x="toSvgX(3.5) * 25" :y="toSvgY(0) * 16.67" class="fill-slate-700 font-bold text-sm">q</text>
                <!-- Highlight intersection for AND -->
                <path 
                  v-if="currentExpression === 'p ∧ q'"
                  :d="`M ${toSvgX(-0.5) * 25} ${toSvgY(0) * 16.67} A ${3 * 25} ${3 * 25} 0 0 0 ${toSvgX(0.5) * 25} ${toSvgY(0) * 16.67} A ${3 * 25} ${3 * 25} 0 0 0 ${toSvgX(-0.5) * 25} ${toSvgY(0) * 16.67}`"
                  fill="rgba(16, 185, 129, 0.5)"
                />
                <!-- Legend -->
                <g transform="translate(300, 20)">
                  <rect x="0" y="0" width="16" height="16" fill="rgba(249, 115, 22, 0.2)" stroke="#F97316" />
                  <text x="24" y="13" class="fill-slate-600 text-xs">p</text>
                  <rect x="0" y="24" width="16" height="16" fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" />
                  <text x="24" y="37" class="fill-slate-600 text-xs">q</text>
                  <rect v-if="currentExpression === 'p ∧ q'" x="0" y="48" width="16" height="16" fill="rgba(16, 185, 129, 0.5)" />
                  <text v-if="currentExpression === 'p ∧ q'" x="24" y="61" class="fill-slate-600 text-xs">p ∧ q</text>
                </g>
              </svg>
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

table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid #CBD5E1;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
