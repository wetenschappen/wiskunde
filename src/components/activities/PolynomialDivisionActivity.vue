<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhDivide, PhCalculator, 
  PhArrowRight, PhArrowLeft, PhCheckCircle,
  PhGraph, PhSteps, PhLightning, PhSigma
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentDivisionStep = ref(0)

// Polynomial coefficients for f(x) = ax³ + bx² + cx + d
const dividendCoeffs = ref([1, -5, 8, -4]) // x³ - 5x² + 8x - 4
const divisorCoeffs = ref([1, -2]) // x - 2
const hornerCoefficients = ref([1, -6, 11, -6]) // For (x-1)(x-2)(x-3) = x³ - 6x² + 11x - 6
const hornerPoint = ref(2)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'long-division', 'remainder-theorem', 'horner-method'
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// User inputs for challenges
const userQuotientCoeffs = ref([1, 0, 0])
const userRemainderCoeff = ref(0)
const userRemainderValue = ref(0)
const userHornerCoefficients = ref([0, 0, 0, 0])
const userFactorResult = ref('')

// Target values for challenges
const targetQuotientCoeffs = ref([1, -3, 2])
const targetRemainderCoeff = ref(0)

// Selected polynomial display mode
const polynomialDisplayMode = ref('expanded') // 'expanded', 'factored'

// ==================== COMPUTED PROPERTIES ====================

// Polynomial evaluation
const evaluatePolynomial = (coeffs, x) => {
  return coeffs.reduce((acc, coeff, power) => {
    return acc + coeff * Math.pow(x, coeffs.length - 1 - power)
  }, 0)
}

// Current dividend and divisor as formatted strings
const dividendPoly = computed(() => formatPolynomial(dividendCoeffs.value))
const divisorPoly = computed(() => formatPolynomial(divisorCoeffs.value))

// Long division steps (computed step by step)
const divisionSteps = computed(() => {
  const steps = []
  const dividend = [...dividendCoeffs.value]
  const divisor = divisorCoeffs.value
  const divisorDegree = divisor.length - 1
  
  let current = [...dividend]
  const quotient = []
  
  while (current.length > divisorDegree) {
    const currentDegree = current.length - 1
    const termDegree = currentDegree - divisorDegree
    const termCoeff = current[0] / divisor[0]
    
    quotient.push({ degree: termDegree, coeff: termCoeff })
    
    // Multiply divisor by term and subtract
    const multiplied = divisor.map(c => c * termCoeff)
    for (let i = 0; i < multiplied.length; i++) {
      if (i < current.length) {
        current[i] = current[i] - multiplied[i]
      }
    }
    
    // Remove leading zero
    current.shift()
    
    steps.push({
      quotientTerm: { coeff: termCoeff, degree: termDegree },
      currentDividend: [...current],
      multiplied: [...multiplied],
      partialRemainder: [...current]
    })
  }
  
  return steps
})

// Horner scheme calculation
const hornerResult = computed(() => {
  const coeffs = [...hornerCoefficients.value]
  const result = { values: [], remainders: [] }
  
  let current = coeffs[0]
  result.values.push(current)
  result.remainders.push(coeffs[0])
  
  for (let i = 1; i < coeffs.length; i++) {
    current = current * hornerPoint.value + coeffs[i]
    result.values.push(current)
    result.remainders.push(current)
  }
  
  // The last value is the remainder
  result.remainder = result.values[result.values.length - 1]
  result.quotientCoeffs = result.values.slice(0, -1)
  
  return result
})

// Remainder theorem verification
const remainderTheoremResult = computed(() => {
  const x = -divisorCoeffs.value[1] / divisorCoeffs.value[0]
  return evaluatePolynomial(dividendCoeffs.value, x)
})

// ==================== FORMATTING FUNCTIONS ====================

function formatPolynomial(coeffs) {
  if (!coeffs || coeffs.length === 0) return '0'
  
  const terms = []
  const degree = coeffs.length - 1
  
  for (let i = 0; i < coeffs.length; i++) {
    const coeff = coeffs[i]
    const power = degree - i
    
    if (coeff === 0) continue
    
    let term = ''
    
    if (power === 0) {
      term = Math.abs(coeff).toString()
    } else if (power === 1) {
      term = Math.abs(coeff) === 1 ? 'x' : `${Math.abs(coeff)}x`
    } else {
      term = Math.abs(coeff) === 1 ? `x^${power}` : `${Math.abs(coeff)}x^${power}`
    }
    
    if (coeff < 0) {
      terms.push(`- ${term}`)
    } else {
      terms.push(i === 0 ? term : `+ ${term}`)
    }
  }
  
  return terms.join(' ') || '0'
}

function formatPolynomialWithHTML(coeffs) {
  if (!coeffs || coeffs.length === 0) return '0'
  
  const terms = []
  const degree = coeffs.length - 1
  
  for (let i = 0; i < coeffs.length; i++) {
    const coeff = coeffs[i]
    const power = degree - i
    
    if (coeff === 0) continue
    
    let term = ''
    
    if (power === 0) {
      term = Math.abs(coeff).toString()
    } else if (power === 1) {
      term = Math.abs(coeff) === 1 ? 'x' : `${Math.abs(coeff)}x`
    } else {
      term = Math.abs(coeff) === 1 ? `x<sup>${power}</sup>` : `${Math.abs(coeff)}x<sup>${power}</sup>`
    }
    
    if (coeff < 0) {
      terms.push(`- ${term}`)
    } else {
      terms.push(i === 0 ? term : `+ ${term}`)
    }
  }
  
  return terms.join(' ') || '0'
}

// ==================== CHALLENGE GENERATION ====================

function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'long-division') {
    // Random polynomial division challenge
    const a = Math.floor(Math.random() * 3) + 1
    const b = Math.floor(Math.random() * 6) - 3
    const c = Math.floor(Math.random() * 8) - 4
    const d = Math.floor(Math.random() * 6) - 3
    
    dividendCoeffs.value = [a, b, c, d]
    divisorCoeffs.value = [1, -(Math.floor(Math.random() * 4) + 1)] // (x - k)
    
    // Calculate expected results
    const x = -divisorCoeffs.value[1]
    const remainder = evaluatePolynomial(dividendCoeffs.value, x)
    
    targetQuotientCoeffs.value = [a, b + a * x, c + (b + a * x) * x]
    targetRemainderCoeff.value = remainder
    
    userQuotientCoeffs.value = [0, 0, 0]
    userRemainderCoeff.value = 0
  } else if (type === 'remainder-theorem') {
    // Remainder theorem challenge
    const a = Math.floor(Math.random() * 2) + 1
    const b = Math.floor(Math.random() * 6) - 3
    const c = Math.floor(Math.random() * 6) - 3
    
    dividendCoeffs.value = [a, b, c]
    divisorCoeffs.value = [1, -(Math.floor(Math.random() * 4) + 1)]
    
    userRemainderValue.value = 0
  } else if (type === 'horner-method') {
    // Horner method challenge
    const roots = [1, 2, 3].map(() => Math.floor(Math.random() * 4) + 1)
    hornerCoefficients.value = [
      1,
      -(roots[0] + roots[1] + roots[2]),
      roots[0] * roots[1] + roots[0] * roots[2] + roots[1] * roots[2],
      -roots[0] * roots[1] * roots[2]
    ]
    hornerPoint.value = roots[0]
    
    userHornerCoefficients.value = [0, 0, 0, 0]
  }
}

function checkChallenge() {
  if (challengeType.value === 'long-division') {
    const tolerance = 0.1
    const quotientCorrect = userQuotientCoeffs.value.every((c, i) => 
      Math.abs(c - targetQuotientCoeffs.value[i]) < tolerance
    )
    const remainderCorrect = Math.abs(userRemainderCoeff.value - targetRemainderCoeff.value) < tolerance
    
    if (quotientCorrect && remainderCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De deling is juist uitgevoerd.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Controleer de quotiënt- en resttermen.'
    }
  } else if (challengeType.value === 'remainder-theorem') {
    const correctRemainder = remainderTheoremResult.value
    if (Math.abs(userRemainderValue.value - correctRemainder) < 0.1) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De restterm is juist berekend met de reststelling.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Gebruik f(c) om de rest te berekenen.'
    }
  } else if (challengeType.value === 'horner-method') {
    const tolerance = 0.1
    const correct = hornerResult.value.remainders.every((val, i) => 
      Math.abs(val - userHornerCoefficients.value[i]) < tolerance
    )
    
    if (correct) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Horner-schema is juist toegepast.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Controleer elke stap van het schema.'
    }
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

// Polynomial graph path generator
function generatePolynomialPath(coeffs) {
  let path = ''
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += 0.1) {
    const y = evaluatePolynomial(coeffs, x)
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

const polynomialPath = computed(() => generatePolynomialPath(dividendCoeffs.value))
const divisorRoot = computed(() => -divisorCoeffs.value[1] / divisorCoeffs.value[0])

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
    title: 'Veeltermdeling - Theorie',
    description: 'Euclidische deling van veeltermen: P(x) = D(x) · Q(x) + R(x)',
    focus: 'division-theory',
    instruction: 'Bekijk de theoretische basis van veeltermdeling.',
    details: [
      'P(x): deeltal (dividend)',
      'D(x): deler (divisor)',
      'Q(x): quotiënt',
      'R(x): rest (grad < grad D)'
    ]
  },
  {
    title: 'Stapsgewijze deling',
    description: 'Volg de deling stap voor stap met de staartdelingsmethode.',
    focus: 'long-division',
    instruction: 'Klik op "Volgende stap" om de deling te volgen.',
    details: [
      'Deel de hoogstegraadsterm',
      'Vermenigvuldig met de deler',
      'Trek af en herhaal',
      'Ga door tot rest grad < deler grad'
    ]
  },
  {
    title: 'Reststelling',
    description: 'De rest bij deling door (x - c) is gelijk aan f(c).',
    focus: 'remainder-theorem',
    instruction: 'Verifieer dat f(c) gelijk is aan de restterm.',
    details: [
      'Als f(x) = (x-c)·q(x) + r',
      'Dan is f(c) = r',
      'Gebruik: bereken rest zonder deling',
      'Speciaal geval: f(c) = 0 ↔ (x-c) is factor'
    ]
  },
  {
    title: 'Horner-schema',
    description: 'Efficiënte methode voor deling door (x - c).',
    focus: 'horner-method',
    instruction: 'Pas het Horner-schema toe voor snelle deling.',
    details: [
      'Schrijf coëfficiënten op',
      'Neem c als deler',
      'Breng eerste coef. omlaag',
      'Vermenigvuldig met c en tel op',
      'Laatste getal = rest'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    currentDivisionStep.value = 0
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    currentDivisionStep.value = 0
  }
}

function nextDivisionStep() {
  if (currentDivisionStep.value < divisionSteps.value.length) {
    currentDivisionStep.value++
  }
}

function prevDivisionStep() {
  if (currentDivisionStep.value > 0) {
    currentDivisionStep.value--
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
            <PhDivide class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Veeltermdeling</h1>
            <p class="text-sm text-slate-500">Delen van veeltermen - Reststelling - Horner</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
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
              
              <!-- Division Theory -->
              <div v-if="analysisSteps[currentStep].focus === 'division-theory'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div class="text-center text-lg font-mono space-y-2">
                  <p class="text-brand-dark font-bold" v-html="formatPolynomialWithHTML(dividendCoeffs) + ' = ?'"/>
                  <p class="text-slate-600">deeltal = deler × quotiënt + rest</p>
                </div>
              </div>

              <!-- Long Division Visualization -->
              <div v-if="analysisSteps[currentStep].focus === 'long-division'" class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-700">Delingsstap:</span>
                  <div class="flex gap-1">
                    <button 
                      @click="prevDivisionStep"
                      :disabled="currentDivisionStep === 0"
                      class="px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <span class="text-sm font-mono px-2">{{ currentDivisionStep }} / {{ divisionSteps.length }}</span>
                    <button 
                      @click="nextDivisionStep"
                      :disabled="currentDivisionStep === divisionSteps.length"
                      class="px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </div>

                <!-- Polynomial coefficients selector -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Deeltal P(x)</label>
                  <div class="flex gap-1">
                    <input 
                      v-for="(coef, i) in dividendCoeffs" 
                      :key="i"
                      type="number"
                      v-model.number="dividendCoeffs[i]"
                      class="w-14 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Deler D(x) = (x - c)</label>
                  <div class="flex items-center gap-2">
                    <span class="text-sm">c =</span>
                    <input 
                      type="number"
                      :value="-divisorCoeffs[1]"
                      @input="divisorCoeffs[1] = -$event.target.value"
                      class="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Remainder Theorem -->
              <div v-if="analysisSteps[currentStep].focus === 'remainder-theorem'" class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-bold mb-2">Reststelling:</p>
                  <p class="text-xs">Als P(x) gedeeld wordt door (x - c), dan is de rest gelijk aan P(c).</p>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">P(x) = {{ dividendPoly }}</label>
                  <label class="text-sm font-bold text-slate-700">Deler: {{ divisorPoly }}</label>
                  <label class="text-sm font-bold text-slate-700">c = {{ divisorRoot }}</label>
                </div>

                <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p class="text-sm text-emerald-700">
                    P({{ divisorRoot }}) = <span class="font-bold">{{ remainderTheoremResult }}</span>
                  </p>
                  <p class="text-sm text-emerald-600 mt-1">
                    Rest = {{ remainderTheoremResult }}
                  </p>
                </div>
              </div>

              <!-- Horner Method -->
              <div v-if="analysisSteps[currentStep].focus === 'horner-method'" class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-bold mb-2">Horner-schema:</p>
                  <p class="text-xs">Snelle methode voor deling door (x - c)</p>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">c-waarde</label>
                  <input 
                    type="range"
                    v-model.number="hornerPoint"
                    min="-5"
                    max="5"
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  />
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">c = {{ hornerPoint }}</span>
                </div>

                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
                  <table class="text-sm w-full">
                    <tr>
                      <td class="px-2 py-1 font-bold">Coëff.</td>
                      <td v-for="(coef, i) in hornerCoefficients" :key="i" class="px-2 py-1 text-center">{{ coef }}</td>
                    </tr>
                    <tr class="border-t border-slate-300">
                      <td class="px-2 py-1 font-bold text-brand-orange">c = {{ hornerPoint }}</td>
                      <td class="px-2 py-1 text-center">-</td>
                      <td v-for="(val, i) in hornerResult.values.slice(0, -1)" :key="i" class="px-2 py-1 text-center text-emerald-600">
                        {{ val * hornerPoint }}
                      </td>
                    </tr>
                    <tr class="border-t-2 border-slate-400">
                      <td class="px-2 py-1 font-bold">Result</td>
                      <td v-for="(val, i) in hornerResult.remainders" :key="i" 
                          :class="['px-2 py-1 text-center font-bold', i === hornerResult.remainders.length - 1 ? 'text-brand-orange bg-orange-50' : '']">
                        {{ val }}
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="text-sm">
                  <p><span class="font-bold">Quotiënt:</span> {{ formatPolynomial(hornerResult.quotientCoeffs) }}</p>
                  <p><span class="font-bold">Rest:</span> {{ hornerResult.remainder }}</p>
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
              <p class="text-sm text-slate-600">Oefen met veeltermdeling, reststelling en Horner.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('long-division')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhSteps class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Staartdeling</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Voer de deling uit en bepaal quotiënt en rest.</div>
                </button>
                
                <button @click="generateChallenge('remainder-theorem')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhSigma class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Reststelling</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Bereken de rest zonder deling uit te voeren.</div>
                </button>
                
                <button @click="generateChallenge('horner-method')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhLightning class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Horner-schema</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Pas het Horner-schema toe voor snelle deling.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal de oplossing:</p>
                  <div v-if="challengeType === 'long-division'" class="mt-2 text-xs text-white/80">
                    <p>Deel: <span class="font-mono" v-html="formatPolynomialWithHTML(dividendCoeffs)"/></p>
                    <p>Door: <span class="font-mono">{{ divisorPoly }}</span></p>
                  </div>
                  <div v-if="challengeType === 'remainder-theorem'" class="mt-2 text-xs text-white/80">
                    <p>P(x) = <span class="font-mono" v-html="formatPolynomialWithHTML(dividendCoeffs)"/></p>
                    <p>Bereken de rest bij deling door {{ divisorPoly }}</p>
                  </div>
                  <div v-if="challengeType === 'horner-method'" class="mt-2 text-xs text-white/80">
                    <p>Coëfficiënten: {{ hornerCoefficients.join(', ') }}</p>
                    <p>Deel door (x - {{ hornerPoint }})</p>
                  </div>
                </div>

                <!-- Long Division Input -->
                <div v-if="challengeType === 'long-division'" class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Quotiënt Q(x)</label>
                    <div class="flex gap-1">
                      <input 
                        v-for="(coef, i) in userQuotientCoeffs" 
                        :key="i"
                        type="number"
                        v-model.number="userQuotientCoeffs[i]"
                        step="0.1"
                        class="w-16 px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Rest R</label>
                    <input 
                      type="number"
                      v-model.number="userRemainderCoeff"
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>

                <!-- Remainder Theorem Input -->
                <div v-if="challengeType === 'remainder-theorem'" class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Rest P({{ divisorRoot }})</label>
                    <input 
                      type="number"
                      v-model.number="userRemainderValue"
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>

                <!-- Horner Method Input -->
                <div v-if="challengeType === 'horner-method'" class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Horner-schema resultaat</label>
                    <div class="flex gap-1">
                      <input 
                        v-for="(coef, i) in userHornerCoefficients" 
                        :key="i"
                        type="number"
                        v-model.number="userHornerCoefficients[i]"
                        step="0.1"
                        class="w-14 px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      />
                    </div>
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
                <span class="text-slate-600">Deeltal P(x):</span>
                <span class="font-mono text-xs" v-html="formatPolynomialWithHTML(dividendCoeffs)"/>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Deler D(x):</span>
                <span class="font-mono text-xs">{{ divisorPoly }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Graad P(x):</span>
                <span class="font-mono">{{ dividendCoeffs.length - 1 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Graad D(x):</span>
                <span class="font-mono">{{ divisorCoeffs.length - 1 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">c-waarde:</span>
                <span class="font-mono">{{ divisorRoot }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">P(c) = Rest:</span>
                <span class="font-mono" :class="remainderTheoremResult === 0 ? 'text-emerald-600' : 'text-brand-orange'">
                  {{ remainderTheoremResult }}
                </span>
              </div>
              <div v-if="remainderTheoremResult === 0" class="text-xs text-emerald-600 font-medium">
                ✓ (x - {{ divisorRoot }}) is een factor
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Veelterm:</span>
              <span class="text-xl font-mono font-bold text-brand-dark" v-html="formatPolynomialWithHTML(dividendCoeffs)"/>
            </div>
          </div>

          <!-- Visualization Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <!-- Long Division Visual -->
            <div v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'long-division'" class="h-full flex items-center justify-center p-8">
              <div class="bg-white rounded-lg border-2 border-slate-300 p-6 max-w-2xl w-full">
                <div class="font-mono text-lg space-y-4">
                  <!-- Header -->
                  <div class="flex items-center gap-4 border-b-2 border-slate-300 pb-2">
                    <span class="text-slate-400">Deeltal:</span>
                    <span class="font-bold" v-html="formatPolynomialWithHTML(dividendCoeffs)"/>
                    <span class="text-slate-400">|</span>
                    <span v-html="formatPolynomialWithHTML(divisorCoeffs)"/>
                    <span class="text-slate-400">(deler)</span>
                  </div>

                  <!-- Division steps visualization -->
                  <div v-if="currentDivisionStep > 0" class="space-y-2">
                    <div v-for="(step, idx) in divisionSteps.slice(0, currentDivisionStep)" :key="idx" 
                         class="pl-4 border-l-2 border-brand-orange">
                      <div class="flex items-center gap-2 text-sm">
                        <span class="text-slate-500">Stap {{ idx + 1 }}:</span>
                        <span class="text-brand-orange font-bold">
                          {{ step.quotientTerm.coeff > 0 ? '+' : '' }}{{ step.quotientTerm.coeff }}x<sup>{{ step.quotientTerm.degree }}</sup>
                        </span>
                      </div>
                      <div class="text-slate-600 text-sm mt-1">
                        Rest: <span v-html="formatPolynomialWithHTML(step.partialRemainder)"/>
                      </div>
                    </div>
                  </div>

                  <!-- Current quotient -->
                  <div v-if="currentDivisionStep > 0" class="pt-4 border-t-2 border-slate-300">
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500">Quotiënt Q(x):</span>
                      <span class="text-brand-dark font-bold">
                        {{ divisionSteps.slice(0, currentDivisionStep).map(s => 
                          `${s.quotientTerm.coeff > 0 && divisionSteps.indexOf(s) > 0 ? '+' : ''}${s.quotientTerm.coeff}x^${s.quotientTerm.degree}`
                        ).join(' ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remainder Theorem Visual -->
            <div v-else-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'remainder-theorem'" class="h-full flex flex-col items-center justify-center p-8">
              <div class="bg-white rounded-lg border-2 border-slate-300 p-6 max-w-xl w-full">
                <h3 class="text-lg font-bold text-brand-dark mb-4 text-center">Reststelling</h3>
                <div class="space-y-4 text-center">
                  <div class="p-4 bg-slate-50 rounded-lg">
                    <p class="font-mono text-lg mb-2">
                      P(x) = <span v-html="formatPolynomialWithHTML(dividendCoeffs)"/>
                    </p>
                    <p class="font-mono text-lg">
                      D(x) = <span>{{ divisorPoly }}</span>
                    </p>
                  </div>
                  
                  <div class="text-4xl font-bold text-brand-orange">↓</div>
                  
                  <div class="p-4 bg-brand-dark text-white rounded-lg">
                    <p class="text-sm mb-2">c = {{ divisorRoot }}</p>
                    <p class="font-mono text-2xl">
                      P({{ divisorRoot }}) = {{ remainderTheoremResult }}
                    </p>
                  </div>
                  
                  <div class="p-3 rounded-lg" :class="remainderTheoremResult === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                    <p class="font-bold">
                      {{ remainderTheoremResult === 0 ? '✓ (x - ' + divisorRoot + ') is een factor!' : 'Rest = ' + remainderTheoremResult }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Horner Method Visual -->
            <div v-else-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'horner-method'" class="h-full flex items-center justify-center p-8">
              <div class="bg-white rounded-lg border-2 border-slate-300 p-6 max-w-2xl w-full">
                <h3 class="text-lg font-bold text-brand-dark mb-4 text-center">Horner-schema</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-center">
                    <thead>
                      <tr class="border-b-2 border-slate-300">
                        <th class="px-3 py-2 text-slate-500">c = {{ hornerPoint }}</th>
                        <th v-for="(coef, i) in hornerCoefficients" :key="i" class="px-3 py-2 font-mono">
                          {{ coef }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="border-b border-slate-200">
                        <td class="px-3 py-2 text-brand-orange font-bold">× {{ hornerPoint }}</td>
                        <td class="px-3 py-2 text-slate-400">-</td>
                        <td v-for="(val, i) in hornerResult.values.slice(0, -1)" :key="i" class="px-3 py-2 text-emerald-600">
                          {{ val * hornerPoint }}
                        </td>
                      </tr>
                      <tr class="border-t-2 border-slate-400 bg-slate-50">
                        <td class="px-3 py-2 font-bold">Resultaat</td>
                        <td v-for="(val, i) in hornerResult.remainders" :key="i" 
                            :class="['px-3 py-2 font-bold', i === hornerResult.remainders.length - 1 ? 'text-brand-orange text-lg bg-orange-100' : '']">
                          {{ val }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="mt-4 p-3 bg-slate-50 rounded-lg text-center">
                  <p class="text-sm text-slate-600">Quotiënt: <span class="font-mono font-bold">{{ formatPolynomial(hornerResult.quotientCoeffs) }}</span></p>
                  <p class="text-sm text-slate-600 mt-1">Rest: <span class="font-mono font-bold text-brand-orange">{{ hornerResult.remainder }}</span></p>
                </div>
              </div>
            </div>

            <!-- Polynomial Graph -->
            <svg 
              v-else
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 17" :key="`v${i}`" 
                  :x1="toSvgX(-8 + i)" y1="0" 
                  :x2="toSvgX(-8 + i)" :y2="svgHeight" 
                />
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

              <!-- Polynomial curve -->
              <path 
                :d="polynomialPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Root markers at divisorRoot -->
              <g v-if="remainderTheoremResult === 0">
                <circle 
                  :cx="toSvgX(divisorRoot)" 
                  :cy="toSvgY(0)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(divisorRoot)" 
                  :y="toSvgY(0) - 10" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  (x - {{ divisorRoot }})
                </text>
              </g>

              <!-- Evaluation point marker -->
              <g>
                <circle 
                  :cx="toSvgX(divisorRoot)" 
                  :cy="toSvgY(remainderTheoremResult)" 
                  r="5" 
                  fill="#6366F1" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(divisorRoot) + 10" 
                  :y="toSvgY(remainderTheoremResult)" 
                  class="fill-indigo-600 text-xs font-bold"
                >
                  f({{ divisorRoot }}) = {{ remainderTheoremResult.toFixed(2) }}
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div v-if="currentMode !== 'analysis' || analysisSteps[currentStep].focus === 'horner-method' || analysisSteps[currentStep].focus === 'remainder-theorem' || analysisSteps[currentStep].focus === 'long-division'" 
                 class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Factor (nulwaarde)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span class="text-slate-600">P(c) punt</span>
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

/* Table styling */
table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid #E2E8F0;
}
</style>
