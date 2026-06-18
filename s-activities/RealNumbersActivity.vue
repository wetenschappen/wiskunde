<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  PhX, PhMathOperations,
  PhArrowRight, PhArrowLeft,
  PhCheckCircle, PhXCircle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const analysisSubMode = ref('numberline') // 'numberline', 'simplify', 'operations'

// Animation state
const animationState = ref({
  feedback: '', // 'correct', 'incorrect'
  key: Date.now() // to re-trigger animations
})

// Number line mode state
const selectedNumber = ref(null)
const numberTypes = {
  rational: ['-3', '-2', '-1/2', '0', '1/3', '2', '22/7', '3.75'],
  irrational: ['√2', '√3', '√5', 'π', '-√2', '√7', 'e', '√12']
}

// Simplify mode state
const sqrtRadicand = ref(12)

// Operations mode state
const op1 = ref(25)
const op2 = ref(9)
const operation = ref('add')

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const userAnswer = ref('')
const targetNumber = ref('')
const targetRadicand = ref(8)
const targetDenominator = ref('')

// ==================== COMPUTED PROPERTIES ====================
const simplifiedSqrt = computed(() => {
  const n = sqrtRadicand.value
  if (n < 0) return { final: 'Ongedefinieerd', steps: [] }
  if (n === 0) return { final: '0', steps: [] }
  if (n === 1) return { final: '1', steps: [] }

  let remaining = n
  let coefficient = 1
  let perfectSquare = 1
  
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    const square = i * i
    if (n % square === 0) {
      coefficient = i
      remaining = n / square
      perfectSquare = square
      break; 
    }
  }

  const steps = [];
  if (coefficient > 1) {
    steps.push({ text: `Factoriseer het getal`, formula: `√(${perfectSquare} × ${remaining})` });
    steps.push({ text: `Splits de wortels`, formula: `√${perfectSquare} × √${remaining}` });
    steps.push({ text: `Bereken de vierkantswortel`, formula: `${coefficient}√${remaining}` });
  }

  return {
    coefficient,
    radicand: remaining,
    final: formatSqrt(coefficient, remaining),
    steps
  }
})


const operationResult = computed(() => {
  const r1 = Math.sqrt(op1.value)
  const r2 = Math.sqrt(op2.value)
  
  switch (operation.value) {
    case 'add': return { value: r1 + r2, symbol: '+', exact: `√${op1.value} + √${op2.value}` }
    case 'subtract': return { value: r1 - r2, symbol: '-', exact: `√${op1.value} - √${op2.value}` }
    case 'multiply': return { value: r1 * r2, symbol: '×', exact: `√(${op1.value} × ${op2.value}) = √${op1.value * op2.value}` }
    case 'divide': return { value: r1 / r2, symbol: '÷', exact: `√${op1.value} / √${op2.value} = √( ${op1.value / op2.value} )` }
    default: return { value: 0, exact: '' }
  }
})

// ==================== HELPER FUNCTIONS ====================
function formatSqrt(coeff, radicand) {
  if (radicand === 0) return '0'
  if (radicand === 1) return coeff.toString()
  if (coeff === 1) return `√${radicand}`
  return `${coeff}√${radicand}`
}

function isRational(num) {
  return numberTypes.rational.includes(num)
}

function getNumberInfo(num) {
  const info = {
    '-3': { type: 'Geheel getal', set: 'ℤ', desc: 'Negatief geheel getal', decimal: '-3.000...' },
    '-2': { type: 'Geheel getal', set: 'ℤ', desc: 'Negatief geheel getal', decimal: '-2.000...' },
    '-1/2': { type: 'Rationaal', set: 'ℚ', desc: 'Breuk - eindige decimalen', decimal: '-0.5' },
    '0': { type: 'Geheel getal', set: 'ℤ', desc: 'Nul - neutraal element', decimal: '0.000...' },
    '1/3': { type: 'Rationaal', set: 'ℚ', desc: 'Periodieke breuk', decimal: '0.333...' },
    '2': { type: 'Geheel getal', set: 'ℤ', desc: 'Positief geheel getal', decimal: '2.000...' },
    '22/7': { type: 'Rationaal', set: 'ℚ', desc: 'Benadering van π', decimal: '3.142857...' },
    '3.75': { type: 'Rationaal', set: 'ℚ', desc: 'Eindige decimale breuk', decimal: '3.75' },
    '√2': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Diagonaal van een vierkant', decimal: '1.414213...', algebraic: 'Geen oplossing in ℚ' },
    '√3': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Hoogte gelijkzijdige driehoek', decimal: '1.732050...', algebraic: 'Geen oplossing in ℚ' },
    '√5': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Gulden snede verwant', decimal: '2.236067...', algebraic: 'Geen oplossing in ℚ' },
    'π': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Verhouding omtrek/diameter', decimal: '3.141592...', algebraic: 'Transcendent' },
    '-√2': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Negatieve wortel', decimal: '-1.414213...', algebraic: 'Geen oplossing in ℚ' },
    '√7': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Irrationale wortel', decimal: '2.645751...', algebraic: 'Geen oplossing in ℚ' },
    'e': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: 'Natuurlijk logaritme grondtal', decimal: '2.718281...', algebraic: 'Transcendent' },
    '√12': { type: 'Irrationaal', set: 'ℝ\\ℚ', desc: '2√3 (vereenvoudigbaar)', decimal: '3.464101...', algebraic: 'Vereenvoudigt naar 2√3' }
  }
  return info[num] || { type: 'Onbekend', desc: '', decimal: '' }
}

// ==================== VISUALIZATION HELPERS ====================
function getNumValue(num) {
  if (!num) return 0
  const map = {
    '√2': 1.4142, '√3': 1.7321, '√5': 2.2361, 'π': 3.1416, 
    '-√2': -1.4142, '√7': 2.6458, 'e': 2.7183, '√12': 3.4641,
    '22/7': 3.1429, '1/3': 0.3333, '-1/2': -0.5
  }
  return map[num] !== undefined ? map[num] : parseFloat(num) || 0
}

function getNumOffset(num) {
  const isRat = isRational(num)
  const base = isRat ? 0.8 : -0.8
  const offsets = { '√3': -2.2, '√7': -2.2, 'e': -3.6, '√12': -2.2, '1/3': 2.2, '22/7': 2.2 }
  return offsets[num] !== undefined ? offsets[num] : base
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  animationState.value.feedback = ''
  
  if (type === 'classify') {
    const allNumbers = [...numberTypes.rational, ...numberTypes.irrational]
    targetNumber.value = allNumbers[Math.floor(Math.random() * allNumbers.length)]
  } else if (type === 'simplify') {
    const perfectSquares = [4, 9, 16, 25, 36]
    const others = [2, 3, 5, 6, 7]
    const ps = perfectSquares[Math.floor(Math.random() * perfectSquares.length)]
    const o = others[Math.floor(Math.random() * others.length)]
    targetRadicand.value = ps * o
  } else if (type === 'rationalize') {
    const denominators = ['√2', '√3', '√5', '√7']
    targetDenominator.value = denominators[Math.floor(Math.random() * denominators.length)]
  }
}

function checkChallenge() {
  let isCorrect = false
  if (challengeType.value === 'classify') {
    const correctIsRational = isRational(targetNumber.value)
    const userIsRational = userAnswer.value === 'rational'
    isCorrect = correctIsRational === userIsRational
    challengeFeedback.value = isCorrect 
      ? `Correct! ${targetNumber.value} is inderdaad ${correctIsRational ? 'rationaal' : 'irrationaal'}.`
      : `Niet juist. ${targetNumber.value} is ${correctIsRational ? 'rationaal' : 'irrationaal'}.`
  } else if (challengeType.value === 'simplify') {
    const tempSqrt = computed(() => {
        let n = targetRadicand.value, c = 1, r = n;
        for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) { const sq = i * i; if (n % sq === 0) { c = i; r = n / sq; break; }}
        return formatSqrt(c, r);
    });
    const correct = tempSqrt.value.replace(/\s/g, '');
    const user = userAnswer.value.replace(/\s/g, '');
    isCorrect = user === correct
    challengeFeedback.value = isCorrect 
      ? `Inderdaad! √${targetRadicand.value} = ${correct}`
      : `Nog niet juist. De vereenvoudiging is ${correct}.`
  } else if (challengeType.value === 'rationalize') {
    const den = targetDenominator.value.replace('√', '')
    const expected = `√${den}/${den}`
    isCorrect = userAnswer.value.replace(/\s/g, '').includes(den)
    challengeFeedback.value = isCorrect 
      ? `Perfect! 1/${targetDenominator.value} = ${expected}`
      : `Bijna! Vermenigvuldig teller en noemer met ${targetDenominator.value} om ${expected} te krijgen.`
  }
  challengeSolved.value = isCorrect
  animationState.value.feedback = isCorrect ? 'correct' : 'incorrect'
  setTimeout(() => animationState.value.feedback = '', 1000)
}


// ==================== SVG GRAPHICS ====================
const svgWidth = 800, svgHeight = 250

function toSvgX(x) {
  const viewX = -5, viewWidth = 10;
  return ((x - viewX) / viewWidth) * svgWidth
}

function toSvgY(y) {
  const viewY = -5, viewHeight = 10;
  return svgHeight - ((y - viewY) / viewHeight) * svgHeight
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
  { title: 'Reële Getallen op de Getallenas', description: 'Visualiseer de positie van verschillende soorten reële getallen.', mode: 'numberline' },
  { title: 'Wortels Vereenvoudigen', description: 'Haal perfecte kwadraten uit de wortel.', mode: 'simplify' },
  { title: 'Bewerkingen met Wortels', description: 'Verken bewerkingen met worteluitdrukkingen.', mode: 'operations' },
]

function navigateStep(direction) {
  const newStep = currentStep.value + direction
  if (newStep >= 0 && newStep < analysisSteps.length) {
    currentStep.value = newStep
    analysisSubMode.value = analysisSteps[newStep].mode
  }
}

watch(analysisSubMode, (newMode) => {
  const stepIndex = analysisSteps.findIndex(s => s.mode === newMode)
  if (stepIndex !== -1) currentStep.value = stepIndex
  animationState.value.key = Date.now()
})
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-100 font-sans">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhMathOperations class="text-2xl text-brand-orange" weight="light" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Verkenning: Reële Getallen</h1>
            <p class="text-sm text-slate-500">Analyse van rationale en irrationale getallen</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button @click="currentMode = 'analysis'" :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', currentMode === 'analysis' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']">Analyse</button>
            <button @click="currentMode = 'derivation'" :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']">Oefenen</button>
          </div>
          <button @click="emit('close')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><PhX weight="bold" class="text-xl" /></button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex overflow-hidden">
        
        <!-- Left Panel -->
        <aside class="w-[420px] bg-white border-r border-slate-200 flex flex-col">
          <Transition name="fade" mode="out-in">
            <div :key="currentMode" class="flex flex-col flex-1">
              <!-- Analysis Mode -->
              <div v-if="currentMode === 'analysis'" class="flex flex-col flex-1">
                <div class="p-4 border-b border-slate-200">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }}/{{ analysisSteps.length }}</span>
                    <div class="flex gap-1">
                      <button @click="navigateStep(-1)" :disabled="currentStep === 0" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30"><PhArrowLeft /></button>
                      <button @click="navigateStep(1)" :disabled="currentStep === analysisSteps.length - 1" class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30"><PhArrowRight /></button>
                    </div>
                  </div>
                  <h2 class="text-base font-bold text-slate-800 mb-1">{{ analysisSteps[currentStep].title }}</h2>
                  <p class="text-sm text-slate-600">{{ analysisSteps[currentStep].description }}</p>
                </div>
                <div class="px-4 pt-4"><div class="flex bg-slate-100 rounded-lg p-1">
                  <button @click="analysisSubMode = 'numberline'" :class="['px-3 py-1.5 rounded-md text-xs font-medium flex-1', analysisSubMode === 'numberline' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']">Getallenas</button>
                  <button @click="analysisSubMode = 'simplify'" :class="['px-3 py-1.5 rounded-md text-xs font-medium flex-1', analysisSubMode === 'simplify' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']">Vereenvoudigen</button>
                  <button @click="analysisSubMode = 'operations'" :class="['px-3 py-1.5 rounded-md text-xs font-medium flex-1', analysisSubMode === 'operations' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']">Bewerkingen</button>
                </div></div>
                <div class="p-4 space-y-4 overflow-y-auto flex-1">
                  <Transition name="fade" mode="out-in">
                    <div :key="analysisSubMode">
                      <template v-if="analysisSubMode === 'numberline'"><div class="space-y-3">
                        <p class="text-sm font-bold text-slate-700">Rationale getallen (ℚ)</p>
                        <div class="flex flex-wrap gap-2"><button v-for="num in numberTypes.rational" :key="num" @click="selectedNumber = num" :class="['px-3 py-1.5 rounded-lg text-sm font-mono border transition-all', selectedNumber === num ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300']">{{ num }}</button></div>
                        <p class="text-sm font-bold text-slate-700">Irrationale getallen (ℝ\ℚ)</p>
                        <div class="flex flex-wrap gap-2"><button v-for="num in numberTypes.irrational" :key="num" @click="selectedNumber = num" :class="['px-3 py-1.5 rounded-lg text-sm font-mono border transition-all', selectedNumber === num ? 'bg-brand-orange/20 border-brand-orange text-brand-dark shadow-sm' : 'bg-white border-slate-200 hover:border-brand-orange']">{{ num }}</button></div>
                      </div></template>
                      <template v-if="analysisSubMode === 'simplify'"><div class="space-y-3">
                        <label class="text-sm font-bold text-brand-dark">Getal onder wortel: <span class="font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sqrtRadicand }}</span></label>
                        <input type="range" v-model.number="sqrtRadicand" min="1" max="150" step="1" class="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-brand-orange">
                      </div></template>
                      <template v-if="analysisSubMode === 'operations'"><div class="space-y-3">
                          <div class="grid grid-cols-4 gap-2"><button v-for="op in [{id:'add',s:'+'},{id:'subtract',s:'-'},{id:'multiply',s:'×'},{id:'divide',s:'÷'}]" :key="op.id" @click="operation = op.id" :class="['py-2 rounded-lg text-xl font-medium border transition-all flex-1', operation === op.id ? 'bg-brand-orange text-white border-brand-orange' : 'bg-slate-50 border-slate-200']">{{op.s}}</button></div>
                          <div class="grid grid-cols-2 gap-3">
                            <div><label class="text-sm font-bold text-slate-700">√a</label><input type="number" v-model.number="op1" min="1" max="100" class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"></div>
                            <div><label class="text-sm font-bold text-slate-700">√b</label><input type="number" v-model.number="op2" min="1" max="100" class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"></div>
                          </div>
                      </div></template>
                    </div>
                  </Transition>
                </div>
                <div class="mt-auto p-4 bg-slate-50 border-t border-slate-200">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Eigenschappen</h3>
                  <Transition name="fade" mode="out-in">
                    <div :key="analysisSubMode" class="space-y-2 text-sm">
                        <template v-if="analysisSubMode === 'numberline' && selectedNumber"><div class="flex justify-between" v-for="item in [['Getal', selectedNumber],['Type', getNumberInfo(selectedNumber).type],['Verzameling', getNumberInfo(selectedNumber).set],['Decimaal', getNumberInfo(selectedNumber).decimal]]" :key="item[0]"><span class="text-slate-600">{{item[0]}}:</span><span class="font-mono font-bold" :class="{'text-emerald-600': item[1] === 'Rationaal', 'text-brand-orange': item[1] === 'Irrationaal'}">{{ item[1] }}</span></div></template>
                        <template v-else-if="analysisSubMode === 'simplify'"><div class="flex justify-between" v-for="item in [['Origineel', `√${sqrtRadicand}`],['Vereenvoudigd', simplifiedSqrt.final],['Waarde', Math.sqrt(sqrtRadicand).toFixed(4)]]" :key="item[0]"><span class="text-slate-600">{{item[0]}}:</span><span class="font-mono font-bold text-brand-dark">{{ item[1] }}</span></div></template>
                        <template v-else-if="analysisSubMode === 'operations'"><div class="flex justify-between" v-for="item in [['Bewerking', `√${op1} ${operationResult.symbol} √${op2}`],['Exact', operationResult.exact],['Benadering', operationResult.value.toFixed(4)]]" :key="item[0]"><span class="text-slate-600">{{item[0]}}:</span><span class="font-mono font-bold text-brand-dark">{{ item[1] }}</span></div></template>
                        <template v-else><div class="text-center text-slate-400 italic">Selecteer een onderdeel voor details.</div></template>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Derivation Mode -->
              <div v-if="currentMode === 'derivation'" class="p-6 space-y-4 flex-1 flex flex-col">
                <div class="border-b border-slate-200 pb-4">
                  <h2 class="text-base font-bold text-slate-800 mb-1">Test je Kennis</h2>
                  <p class="text-sm text-slate-600">Kies een opdracht en los de uitdaging op.</p>
                </div>
                <Transition name="fade" mode="out-in">
                  <div v-if="!challengeActive" class="space-y-3">
                    <button v-for="c in [['classify','Classificeer','Rationaal of irrationaal?'],['simplify','Vereenvoudig','Haal kwadraten uit de wortel'],['rationalize','Maak noemer rationaal','Werk de wortel in de noemer weg']]" :key="c[0]" @click="generateChallenge(c[0])" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50/50 transition-all group">
                      <div class="font-semibold text-sm text-slate-800 group-hover:text-brand-orange">{{c[1]}}</div><div class="text-xs text-slate-500 mt-1">{{c[2]}}</div>
                    </button>
                  </div>
                  <div v-else class="space-y-4 flex-1 flex flex-col">
                    <div class="p-4 bg-brand-dark text-white rounded-lg">
                      <p class="text-sm font-medium mb-2">Jouw opdracht:</p>
                      <div class="text-2xl font-mono text-center bg-black/20 py-3 rounded-md">
                        <span v-if="challengeType === 'classify'">{{ targetNumber }}</span>
                        <span v-if="challengeType === 'simplify'">√{{ targetRadicand }}</span>
                        <span v-if="challengeType === 'rationalize'">1 / {{ targetDenominator }}</span>
                      </div>
                    </div>
                    <div v-if="challengeType === 'classify'" class="flex gap-2">
                        <button @click="userAnswer = 'rational'" :class="['flex-1 py-2.5 rounded-lg text-sm border transition-all', userAnswer === 'rational' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200']">Rationaal</button>
                        <button @click="userAnswer = 'irrational'" :class="['flex-1 py-2.5 rounded-lg text-sm border transition-all', userAnswer === 'irrational' ? 'bg-brand-orange/20 border-brand-orange text-brand-dark' : 'bg-slate-50 border-slate-200']">Irrationaal</button>
                    </div>
                    <input v-else v-model="userAnswer" placeholder="Jouw antwoord, bv: 2√3" class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange text-center">
                    <Transition name="pop"><div v-if="challengeFeedback" :class="['p-3 rounded-lg text-sm flex items-center gap-3', challengeSolved ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200']"><component :is="challengeSolved ? PhCheckCircle : PhXCircle" class="text-xl shrink-0"/><span>{{ challengeFeedback }}</span></div></Transition>
                    <div class="mt-auto space-y-2 pt-4">
                      <button @click="checkChallenge" :class="['w-full py-2.5 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-transform active:scale-[0.98]', animationState.feedback === 'incorrect' ? 'animate-shake' : '']">Controleer</button>
                      <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm">Andere opdracht</button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </aside>

        <!-- Right Panel: Visualization -->
        <section class="flex-1 bg-slate-100 p-6 flex items-center justify-center">
          <Transition name="slide-up" mode="out-in">
            <div :key="animationState.key" class="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col justify-center items-center">
              <template v-if="analysisSubMode === 'numberline' || currentMode === 'derivation'">
                <div class="w-full">
                  <div class="flex items-baseline justify-center gap-4 mb-4">
                    <span class="text-lg text-slate-500">Geselecteerd:</span>
                    <span class="text-4xl font-mono font-bold text-brand-dark transition-all duration-300">{{ selectedNumber || '...' }}</span>
                  </div>
                  <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    <line :x1="toSvgX(-4.5)" :y1="toSvgY(0)" :x2="toSvgX(4.5)" :y2="toSvgY(0)" stroke="#0B1120" stroke-width="2" />
                    <g v-for="i in 9" :key="`tick${i}`"><line :x1="toSvgX(-4.5 + i)" :y1="toSvgY(-0.2)" :x2="toSvgX(-4.5 + i)" :y2="toSvgY(0.2)" stroke="#0B1120" stroke-width="1.5" /><text :x="toSvgX(-4.5 + i)" :y="toSvgY(-0.6)" text-anchor="middle" class="fill-slate-600 text-[10px] font-mono">{{ -4.5 + i }}</text></g>
                    <g v-for="numSet in [numberTypes.rational, numberTypes.irrational]" :key="numSet[0]">
                      <g v-for="num in numSet" :key="num">
                        <line :x1="toSvgX(getNumValue(num))" :y1="toSvgY(0)" :x2="toSvgX(getNumValue(num))" :y2="toSvgY(getNumOffset(num))" :stroke="isRational(num) ? '#10B981':'#F97316'" stroke-width="1" stroke-dasharray="2,2" />
                        <circle @click="selectedNumber = num" :cx="toSvgX(getNumValue(num))" :cy="toSvgY(getNumOffset(num))" :fill="isRational(num) ? '#10B981':'#F97316'" stroke="white" class="cursor-pointer transition-all duration-300" :r="selectedNumber === num ? 10 : 6" :stroke-width="selectedNumber === num ? 3: 2" />
                        <text :x="toSvgX(getNumValue(num))" :y="toSvgY(getNumOffset(num) + (isRational(num) ? 0.7 : -0.7))" text-anchor="middle" :class="['text-[10px] font-mono font-bold select-none', isRational(num)?'fill-emerald-700':'fill-brand-orange']">{{ num }}</text>
                      </g>
                    </g>
                  </svg>
                </div>
              </template>
              <template v-if="analysisSubMode === 'simplify'">
                <div class="w-full max-w-md mx-auto">
                    <div class="text-center text-4xl font-mono text-slate-800">√{{ sqrtRadicand }}</div>
                    <TransitionGroup tag="div" name="list" class="mt-6 space-y-4">
                      <div v-if="simplifiedSqrt.steps.length > 0" key="arrow1" class="text-center text-2xl text-slate-400">↓</div>
                      <div v-for="(step, i) in simplifiedSqrt.steps" :key="i" class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div class="text-sm text-slate-500">{{ step.text }}</div>
                        <div class="text-center text-3xl font-mono mt-1" :class="i === simplifiedSqrt.steps.length - 1 ? 'text-brand-orange font-bold' : 'text-slate-800'">{{ step.formula }}</div>
                        <div v-if="i < simplifiedSqrt.steps.length - 1" key="arrow" class="text-center text-2xl text-slate-400 mt-2">↓</div>
                      </div>
                      <div v-if="simplifiedSqrt.steps.length === 0 && sqrtRadicand > 1" key="no-simplify" class="p-4 text-center bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                        <p class="font-semibold">Niet verder te vereenvoudigen</p>
                        <p class="text-sm mt-1">Dit getal bevat geen perfecte kwadraten als factor.</p>
                      </div>
                    </TransitionGroup>
                </div>
              </template>
              <template v-if="analysisSubMode === 'operations'">
                <div class="flex items-center justify-center gap-6 text-3xl sm:text-4xl md:text-5xl font-mono text-slate-700">
                  <div class="text-center"><p>√{{ op1 }}</p><p class="text-lg text-slate-500">≈{{ Math.sqrt(op1).toFixed(3) }}</p></div>
                  <div class="text-brand-orange font-bold">{{ operationResult.symbol }}</div>
                  <div class="text-center"><p>√{{ op2 }}</p><p class="text-lg text-slate-500">≈{{ Math.sqrt(op2).toFixed(3) }}</p></div>
                  <div class="text-slate-400">=</div>
                  <div class="text-center text-brand-dark"><p>{{ operationResult.value.toFixed(3) }}</p><p class="text-lg text-slate-500">{{ operationResult.exact }}</p></div>
                </div>
              </template>
            </div>
          </Transition>
        </section>
      </main>
    </div>
  </Transition>
</template>

<style>
/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.8); }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }

/* Shake Animation */
@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }}
.animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; transform: translate3d(0, 0, 0); }

/* Custom range slider */
input[type="range"]::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #FFF; border-radius: 50%; cursor: pointer; border: 4px solid #F97316; transition: background 0.2s; }
input[type="range"]::-webkit-slider-thumb:hover { background: #FDE6D5; }
input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; background: #FFF; border-radius: 50%; cursor: pointer; border: 4px solid #F97316; transition: background 0.2s; }
input[type="range"]::-moz-range-thumb:hover { background: #FDE6D5; }
</style>