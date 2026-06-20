<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhArrowRight, PhArrowLeft, PhCheckCircle,
  PhTable, PhGraph, PhMathOperations, PhTextT, PhArrowsLeftRight,
  PhCircle, PhXCircle, PhQuestion, PhInfinity
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const activeTab = ref('machine')

// Function machine state
const machineInput = ref(2)
const machineFunction = ref('double') // 'double', 'square', 'plus3', 'times2plus1'
const isProcessing = ref(false)
const showOutput = ref(true)

// Representation converter state
const converterFunction = ref({
  type: 'linear',
  a: 2,
  b: 1
})
const selectedRepresentation = ref('all')

// Function recognition state
const recognitionQuestion = ref(0)
const recognitionAnswer = ref(null)
const recognitionFeedback = ref('')
const showVerticalLine = ref(false)

// Domain finder state
const domainFunction = ref('sqrt') // 'sqrt', 'fraction', 'linear'
const userDomainStart = ref(-5)
const userDomainEnd = ref(5)
const domainFeedback = ref('')
const domainSolved = ref(false)

// Challenge mode
const challengeActive = ref(false)
const challengeType = ref('') // 'table-to-formula', 'verbal-to-graph', 'domain-identify'
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Function machine output
const machineOutput = computed(() => {
  const x = machineInput.value
  switch (machineFunction.value) {
    case 'double': return x * 2
    case 'square': return x * x
    case 'plus3': return x + 3
    case 'times2plus1': return 2 * x + 1
    case 'inverse': return x === 0 ? 'ongedefinieerd' : (1 / x).toFixed(2)
    default: return x * 2
  }
})

const machineFormula = computed(() => {
  switch (machineFunction.value) {
    case 'double': return 'f(x) = 2x'
    case 'square': return 'f(x) = x²'
    case 'plus3': return 'f(x) = x + 3'
    case 'times2plus1': return 'f(x) = 2x + 1'
    case 'inverse': return 'f(x) = 1/x'
    default: return 'f(x) = 2x'
  }
})

const machineVerbal = computed(() => {
  switch (machineFunction.value) {
    case 'double': return 'Het dubbele van het invoergetal'
    case 'square': return 'Het kwadraat van het invoergetal'
    case 'plus3': return 'Het invoergetal vermeerderd met 3'
    case 'times2plus1': return 'Het dubbele van het invoergetal, vermeerderd met 1'
    case 'inverse': return 'Het omgekeerde van het invoergetal'
    default: return 'Het dubbele van het invoergetal'
  }
})

// Generate table for converter
const converterTable = computed(() => {
  const table = []
  const { a, b } = converterFunction.value
  for (let x = -3; x <= 3; x++) {
    table.push({ x, y: a * x + b })
  }
  return table
})

const converterFormula = computed(() => {
  const { a, b } = converterFunction.value
  if (b === 0) return `f(x) = ${a}x`
  if (b > 0) return `f(x) = ${a}x + ${b}`
  return `f(x) = ${a}x - ${Math.abs(b)}`
})

// Domain functions
const domainFunctions = {
  linear: { domain: 'ℝ', formula: 'f(x) = 2x + 1', restrictions: 'Geen beperkingen' },
  sqrt: { domain: '[0, ∞[', formula: 'f(x) = √x', restrictions: 'x ≥ 0 (wortel van negatief getal is niet reëel)' },
  fraction: { domain: 'ℝ \\ {0}', formula: 'f(x) = 1/x', restrictions: 'x ≠ 0 (delen door nul is onmogelijk)' },
  quadratic: { domain: 'ℝ', formula: 'f(x) = x²', restrictions: 'Geen beperkingen' },
  sqrtShifted: { domain: '[2, ∞[', formula: 'f(x) = √(x - 2)', restrictions: 'x ≥ 2' }
}

const currentDomainInfo = computed(() => domainFunctions[domainFunction.value])

// Recognition questions
const recognitionQuestions = [
  {
    id: 1,
    type: 'graph',
    isFunction: true,
    description: 'Parabool',
    explanation: 'Dit is een functie. Elke x-waarde heeft exact één y-waarde.'
  },
  {
    id: 2,
    type: 'graph',
    isFunction: false,
    description: 'Cirkel',
    explanation: 'Dit is geen functie. Sommige x-waarden hebben twee y-waarden (bijv. x=0 heeft y=±r).'
  },
  {
    id: 3,
    type: 'table',
    isFunction: true,
    table: [{x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 6}, {x: 4, y: 8}],
    explanation: 'Dit is een functie. Elke x-waarde komt slechts één keer voor met één y-waarde.'
  },
  {
    id: 4,
    type: 'table',
    isFunction: false,
    table: [{x: 1, y: 2}, {x: 2, y: 4}, {x: 1, y: 5}, {x: 3, y: 6}],
    explanation: 'Dit is geen functie. De x-waarde 1 heeft twee verschillende y-waarden (2 en 5).'
  }
]

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

// Generate parabola path
function generateParabolaPath() {
  let path = ''
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += 0.1) {
    const y = 0.3 * x * x - 2
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

// Generate circle path (not a function)
function generateCirclePath() {
  const cx = toSvgX(0)
  const cy = toSvgY(0)
  const r = 80
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`
}

// Generate line path
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

// Generate square root path
function generateSqrtPath() {
  let path = ''
  for (let x = 0; x <= viewBoxX + viewBoxWidth; x += 0.1) {
    if (x < 0) continue
    const y = Math.sqrt(x) * 1.5 - 3
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

// Generate hyperbola path (1/x)
function generateHyperbolaPath() {
  let path1 = ''
  let path2 = ''
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += 0.1) {
    if (Math.abs(x) < 0.3) continue
    const y = 3 / x
    const svgX = toSvgX(x)
    const svgY = toSvgY(y)
    if (x < 0) {
      if (path1 === '') {
        path1 = `M ${svgX} ${svgY}`
      } else {
        path1 += ` L ${svgX} ${svgY}`
      }
    } else {
      if (path2 === '') {
        path2 = `M ${svgX} ${svgY}`
      } else {
        path2 += ` L ${svgX} ${svgY}`
      }
    }
  }
  return [path1, path2]
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'table-to-formula') {
    converterFunction.value.a = Math.floor(Math.random() * 4) + 1
    converterFunction.value.b = Math.floor(Math.random() * 5) - 2
  }
}

function checkDomainChallenge() {
  const correctStart = currentDomainInfo.value.domain === 'ℝ' ? -5 : 0
  const correctEnd = currentDomainInfo.value.domain === 'ℝ' ? 5 : 8
  
  if (domainFunction.value === 'fraction') {
    domainFeedback.value = 'Correct! De functie f(x) = 1/x is gedefinieerd voor alle reële getallen behalve x = 0.'
    domainSolved.value = true
  } else if (Math.abs(userDomainStart.value - correctStart) < 0.5 && Math.abs(userDomainEnd.value - correctEnd) < 0.5) {
    domainFeedback.value = `Correct! Het domein is ${currentDomainInfo.value.domain}.`
    domainSolved.value = true
  } else {
    domainFeedback.value = 'Nog niet juist. Denk aan de beperkingen van deze functie.'
    domainSolved.value = false
  }
}

function checkRecognition(answer) {
  recognitionAnswer.value = answer
  const current = recognitionQuestions[recognitionQuestion.value]
  if (answer === current.isFunction) {
    recognitionFeedback.value = `Correct! ${current.explanation}`
  } else {
    recognitionFeedback.value = `Niet correct. ${current.explanation}`
  }
}

function nextRecognitionQuestion() {
  recognitionQuestion.value = (recognitionQuestion.value + 1) % recognitionQuestions.length
  recognitionAnswer.value = null
  recognitionFeedback.value = ''
  showVerticalLine.value = false
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
    title: 'Wat is een functie?',
    description: 'Een functie is een regel die aan elk element van het domein precies één element van het codomein toevoegt.',
    focus: 'concept',
    instruction: 'Bekijk de functiemachine. Experimenteer met verschillende invoerwaarden en functies.',
    details: [
      'Input (x) → Verwerking → Output (y)',
      'Notatie: f(x) = y',
      'Elke input heeft exact één output',
      'De machine verwerkt volgens een vaste regel'
    ]
  },
  {
    title: 'Representaties van functies',
    description: 'Een functie kan op verschillende manieren worden voorgesteld.',
    focus: 'representations',
    instruction: 'Bekijk hoe dezelfde functie wordt weergegeven als tabel, grafiek, formule en tekst.',
    details: [
      'Tabel: x- en y-waarden in een overzicht',
      'Grafiek: visuele voorstelling in een assenstelsel',
      'Formule: wiskundige uitdrukking f(x) = ...',
      'Tekst: beschrijving in woorden'
    ]
  },
  {
    title: 'Domein en codomein',
    description: 'Het domein zijn alle toegelaten invoerwaarden. Het codomein zijn alle mogelijke uitvoerwaarden.',
    focus: 'domain',
    instruction: 'Onderzoek welke beperkingen er zijn op het domein van verschillende functies.',
    details: [
      'Domein: alle x-waarden waarvoor f(x) bestaat',
      'Codomein (beeld): alle y-waarden die voorkomen',
      'Bij √x: domein is x ≥ 0',
      'Bij 1/x: domein is x ≠ 0'
    ]
  },
  {
    title: 'Functie of niet?',
    description: 'Niet elke relatie is een functie. Gebruik de verticale lijn test.',
    focus: 'recognition',
    instruction: 'Bepaal of de gegeven relaties functies zijn. Gebruik de verticale lijn test.',
    details: [
      'Verticale lijn test: trek verticale lijnen',
      'Als een lijn de grafiek op meer dan één punt snijdt: geen functie',
      'Cirkel: geen functie',
      'Parabool: wel een functie'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    updateTabFromStep()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    updateTabFromStep()
  }
}

function updateTabFromStep() {
  const focus = analysisSteps[currentStep.value].focus
  if (focus === 'concept') activeTab.value = 'machine'
  else if (focus === 'representations') activeTab.value = 'converter'
  else if (focus === 'domain') activeTab.value = 'domain'
  else if (focus === 'recognition') activeTab.value = 'recognition'
}

function processMachine() {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
  }, 600)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhFunction class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Inleiding Functies</h1>
            <p class="text-sm text-slate-500">Concept, representaties en herkenning</p>
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

            <!-- Tab Navigation -->
            <div class="flex border-b border-slate-200">
              <button 
                @click="activeTab = 'machine'"
                :class="['flex-1 py-2 px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1',
                  activeTab === 'machine' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <PhArrowsLeftRight class="text-sm" />
                Machine
              </button>
              <button 
                @click="activeTab = 'converter'"
                :class="['flex-1 py-2 px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1',
                  activeTab === 'converter' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <PhTable class="text-sm" />
                Converter
              </button>
              <button 
                @click="activeTab = 'domain'"
                :class="['flex-1 py-2 px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1',
                  activeTab === 'domain' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <PhInfinity class="text-sm" />
                Domein
              </button>
              <button 
                @click="activeTab = 'recognition'"
                :class="['flex-1 py-2 px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1',
                  activeTab === 'recognition' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <PhQuestion class="text-sm" />
                Test
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Function Machine Tab -->
              <template v-if="activeTab === 'machine'">
                <div class="space-y-4">
                  <!-- Function selector -->
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Kies een functie</label>
                    <select 
                      v-model="machineFunction"
                      @change="processMachine"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                      <option value="double">f(x) = 2x (dubbele)</option>
                      <option value="square">f(x) = x² (kwadraat)</option>
                      <option value="plus3">f(x) = x + 3 (plus 3)</option>
                      <option value="times2plus1">f(x) = 2x + 1</option>
                      <option value="inverse">f(x) = 1/x (omgekeerde)</option>
                    </select>
                  </div>

                  <!-- Input slider -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Input (x)</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ machineInput }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="machineInput" 
                      min="-5" 
                      max="5" 
                      step="0.5"
                      @input="processMachine"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <!-- Formula display -->
                  <div class="p-3 bg-brand-dark text-white rounded-lg text-center">
                    <p class="text-lg font-mono font-bold">{{ machineFormula }}</p>
                  </div>

                  <!-- Verbal description -->
                  <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p class="text-sm text-slate-700">
                      <span class="font-bold text-brand-orange">Beschrijving:</span> {{ machineVerbal }}
                    </p>
                  </div>
                </div>
              </template>

              <!-- Converter Tab -->
              <template v-if="activeTab === 'converter'">
                <div class="space-y-4">
                  <!-- Function parameters -->
                  <div class="space-y-3">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-brand-dark">a (helling)</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ converterFunction.a }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="converterFunction.a" 
                        min="-3" 
                        max="3" 
                        step="0.5"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-brand-dark">b (startwaarde)</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ converterFunction.b }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="converterFunction.b" 
                        min="-3" 
                        max="3" 
                        step="0.5"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      >
                    </div>
                  </div>

                  <!-- Representations -->
                  <div class="space-y-3">
                    <!-- Formula -->
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div class="flex items-center gap-2 mb-2">
                        <PhMathOperations class="text-brand-orange" />
                        <span class="text-sm font-bold text-slate-700">Formule</span>
                      </div>
                      <p class="text-lg font-mono text-brand-dark">{{ converterFormula }}</p>
                    </div>

                    <!-- Table -->
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div class="flex items-center gap-2 mb-2">
                        <PhTable class="text-brand-orange" />
                        <span class="text-sm font-bold text-slate-700">Tabel</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="font-bold text-slate-600 border-b border-slate-300 pb-1">x</div>
                        <div class="font-bold text-slate-600 border-b border-slate-300 pb-1">f(x)</div>
                        <template v-for="(row, idx) in converterTable" :key="idx">
                          <div class="font-mono">{{ row.x }}</div>
                          <div class="font-mono text-brand-orange">{{ row.y }}</div>
                        </template>
                      </div>
                    </div>

                    <!-- Text -->
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div class="flex items-center gap-2 mb-2">
                        <PhTextT class="text-brand-orange" />
                        <span class="text-sm font-bold text-slate-700">Tekst</span>
                      </div>
                      <p class="text-sm text-slate-700">
                        Vermenigvuldig de input met {{ converterFunction.a }} 
                        <span v-if="converterFunction.b > 0">en tel er {{ converterFunction.b }} bij op</span>
                        <span v-else-if="converterFunction.b < 0">en trek er {{ Math.abs(converterFunction.b) }} van af</span>
                        <span v-else">(geen verschuiving)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Domain Tab -->
              <template v-if="activeTab === 'domain'">
                <div class="space-y-4">
                  <!-- Function selector -->
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Kies een functie</label>
                    <select 
                      v-model="domainFunction"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                      <option value="linear">Lineair: f(x) = 2x + 1</option>
                      <option value="sqrt">Wortel: f(x) = √x</option>
                      <option value="fraction">Breuk: f(x) = 1/x</option>
                      <option value="quadratic">Kwadratisch: f(x) = x²</option>
                      <option value="sqrtShifted">Wortel verschoven: f(x) = √(x - 2)</option>
                    </select>
                  </div>

                  <!-- Domain info -->
                  <div class="p-3 bg-brand-dark text-white rounded-lg">
                    <p class="text-sm font-bold mb-2">Formule: {{ currentDomainInfo.formula }}</p>
                    <p class="text-sm">
                      <span class="text-white/70">Domein:</span> 
                      <span class="font-mono font-bold">{{ currentDomainInfo.domain }}</span>
                    </p>
                  </div>

                  <!-- Restrictions -->
                  <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800">
                      <span class="font-bold">Beperking:</span> {{ currentDomainInfo.restrictions }}
                    </p>
                  </div>
                </div>
              </template>

              <!-- Recognition Tab -->
              <template v-if="activeTab === 'recognition'">
                <div class="space-y-4">
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-medium text-slate-700 mb-3">
                      Is dit een functie?
                      <span v-if="recognitionQuestions[recognitionQuestion].type === 'table'" class="text-slate-500">(Tabel)</span>
                      <span v-else class="text-slate-500">(Grafiek)</span>
                    </p>

                    <!-- Table display -->
                    <div v-if="recognitionQuestions[recognitionQuestion].type === 'table'" class="mb-4">
                      <div class="grid grid-cols-2 gap-2 text-sm bg-white p-3 rounded border">
                        <div class="font-bold text-slate-600 border-b pb-1">x</div>
                        <div class="font-bold text-slate-600 border-b pb-1">y</div>
                        <template v-for="(row, idx) in recognitionQuestions[recognitionQuestion].table" :key="idx">
                          <div class="font-mono">{{ row.x }}</div>
                          <div class="font-mono">{{ row.y }}</div>
                        </template>
                      </div>
                    </div>

                    <!-- Answer buttons -->
                    <div class="flex gap-2">
                      <button 
                        @click="checkRecognition(true)"
                        :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                          recognitionAnswer === true 
                            ? (recognitionQuestions[recognitionQuestion].isFunction ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300']"
                      >
                        <PhCheckCircle v-if="recognitionAnswer === true && recognitionQuestions[recognitionQuestion].isFunction" />
                        <PhXCircle v-if="recognitionAnswer === true && !recognitionQuestions[recognitionQuestion].isFunction" />
                        Ja, functie
                      </button>
                      <button 
                        @click="checkRecognition(false)"
                        :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                          recognitionAnswer === false 
                            ? (!recognitionQuestions[recognitionQuestion].isFunction ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300']"
                      >
                        <PhCheckCircle v-if="recognitionAnswer === false && !recognitionQuestions[recognitionQuestion].isFunction" />
                        <PhXCircle v-if="recognitionAnswer === false && recognitionQuestions[recognitionQuestion].isFunction" />
                        Nee, geen functie
                      </button>
                    </div>

                    <!-- Vertical line toggle for graphs -->
                    <button 
                      v-if="recognitionQuestions[recognitionQuestion].type === 'graph'"
                      @click="showVerticalLine = !showVerticalLine"
                      class="mt-3 w-full py-2 text-sm text-brand-orange hover:text-orange-700 font-medium"
                    >
                      {{ showVerticalLine ? 'Verberg' : 'Toon' }} verticale lijn test
                    </button>
                  </div>

                  <!-- Feedback -->
                  <div v-if="recognitionFeedback" 
                    :class="['p-3 rounded-lg text-sm',
                      recognitionAnswer === recognitionQuestions[recognitionQuestion].isFunction 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200']"
                  >
                    {{ recognitionFeedback }}
                  </div>

                  <!-- Next button -->
                  <button 
                    @click="nextRecognitionQuestion"
                    class="w-full py-2 bg-brand-dark text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors"
                  >
                    Volgende vraag
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

          <!-- Mode: Exercises -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Oefeningen</h2>
              <p class="text-sm text-slate-600">Test je kennis over functies.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('domain-identify')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Domein bepalen</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal het domein van verschillende functies.</div>
                </button>
                
                <button @click="generateChallenge('table-to-formula')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Tabel naar formule</div>
                  <div class="text-xs text-slate-500 mt-1">Leid het functievoorschrift af uit een tabel.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">
                    <span v-if="challengeType === 'domain-identify'">Bepaal het domein:</span>
                    <span v-if="challengeType === 'table-to-formula'">Bepaal het voorschrift:</span>
                  </p>
                  <p class="text-xs text-white/70 mt-1">
                    <span v-if="challengeType === 'domain-identify'">Analyseer de functie en bepaal alle toegelaten x-waarden.</span>
                    <span v-if="challengeType === 'table-to-formula'">Zoek het patroon in de tabel en druk het uit als f(x) = ax + b.</span>
                  </p>
                </div>

                <!-- Domain Challenge -->
                <div v-if="challengeType === 'domain-identify'" class="space-y-3">
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">{{ currentDomainInfo.formula }}</p>
                    <p class="text-xs text-slate-500">Stel het domein in met de sliders:</p>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-slate-700">Start domein</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ userDomainStart }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="userDomainStart" 
                      min="-5" 
                      max="5" 
                      step="0.5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-slate-700">Einde domein</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ userDomainEnd }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="userDomainEnd" 
                      min="-5" 
                      max="8" 
                      step="0.5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <button @click="checkDomainChallenge" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
                    Controleer
                  </button>
                </div>

                <!-- Table Challenge -->
                <div v-if="challengeType === 'table-to-formula'" class="space-y-3">
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Gegeven tabel:</p>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div class="font-bold text-slate-600 border-b border-slate-300 pb-1">x</div>
                      <div class="font-bold text-slate-600 border-b border-slate-300 pb-1">f(x)</div>
                      <template v-for="(row, idx) in converterTable" :key="idx">
                        <div class="font-mono">{{ row.x }}</div>
                        <div class="font-mono">{{ row.y }}</div>
                      </template>
                    </div>
                  </div>
                  
                  <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p class="text-sm text-emerald-800 font-medium">
                      Het voorschrift is: {{ converterFormula }}
                    </p>
                    <p class="text-xs text-emerald-600 mt-1">
                      Tip: a = richtingscoëfficiënt (verschil in y / verschil in x), b = startwaarde (waarde bij x=0)
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <button @click="challengeActive = false" class="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                    Terug naar opdrachten
                  </button>
                </div>

                <!-- Feedback -->
                <div v-if="domainFeedback" :class="['p-3 rounded-lg text-sm', domainSolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                  {{ domainFeedback }}
                </div>
              </div>
            </div>
          </template>

          <!-- Mathematical Characteristics Panel -->
          <div class="mt-auto p-4 bg-slate-50 border-t border-slate-200">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wiskundige kenmerken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Notatie:</span>
                <span class="font-mono">f: x ↦ f(x)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Definitie:</span>
                <span class="text-xs text-slate-500">Elke input heeft één output</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Domein:</span>
                <span class="font-mono">dom(f)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Beeld:</span>
                <span class="font-mono">Im(f) of B(f)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Test:</span>
                <span class="text-xs text-slate-500">Verticale lijn test</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Function Machine Visualization -->
          <div v-if="activeTab === 'machine' || currentMode === 'derivation'" class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center">
                <span class="text-sm text-slate-500 mb-1">Input (x)</span>
                <div class="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                  <span class="text-2xl font-mono font-bold text-brand-dark">{{ machineInput }}</span>
                </div>
              </div>
              
              <div class="flex flex-col items-center">
                <PhArrowRight 
                  class="text-3xl transition-all duration-300"
                  :class="isProcessing ? 'text-brand-orange translate-x-2' : 'text-slate-400'"
                />
              </div>
              
              <div class="flex flex-col items-center">
                <span class="text-sm text-slate-500 mb-1">Functie</span>
                <div 
                  class="w-24 h-20 bg-brand-dark rounded-xl flex items-center justify-center border-4 transition-all duration-300"
                  :class="isProcessing ? 'border-brand-orange scale-105' : 'border-slate-600'"
                >
                  <span class="text-white font-mono text-sm font-bold">f(x)</span>
                </div>
              </div>
              
              <div class="flex flex-col items-center">
                <PhArrowRight 
                  class="text-3xl transition-all duration-300"
                  :class="isProcessing ? 'text-brand-orange translate-x-2' : 'text-slate-400'"
                />
              </div>
              
              <div class="flex flex-col items-center">
                <span class="text-sm text-slate-500 mb-1">Output (y)</span>
                <div 
                  class="w-20 h-16 bg-emerald-100 rounded-lg flex items-center justify-center border-2 transition-all duration-500"
                  :class="isProcessing ? 'border-slate-300 opacity-50' : 'border-emerald-500 opacity-100'"
                >
                  <span class="text-xl font-mono font-bold text-emerald-700">{{ machineOutput }}</span>
                </div>
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

              <!-- Recognition graphs -->
              <template v-if="activeTab === 'recognition' && recognitionQuestions[recognitionQuestion].type === 'graph'">
                <!-- Parabola (is a function) -->
                <path 
                  v-if="recognitionQuestions[recognitionQuestion].isFunction"
                  :d="generateParabolaPath()" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
                <!-- Circle (not a function) -->
                <path 
                  v-else
                  :d="generateCirclePath()" 
                  fill="none" 
                  stroke="#6366F1" 
                  stroke-width="3"
                />
                <!-- Vertical line test -->
                <line 
                  v-if="showVerticalLine"
                  :x1="toSvgX(0)" y1="0" 
                  :x2="toSvgX(0)" :y2="svgHeight"
                  stroke="#EF4444" 
                  stroke-width="2"
                  stroke-dasharray="5,5"
                  class="animate-pulse"
                />
              </template>

              <!-- Domain function graphs -->
              <template v-if="activeTab === 'domain' || currentMode === 'derivation'">
                <!-- Square root -->
                <path 
                  v-if="domainFunction === 'sqrt' || domainFunction === 'sqrtShifted'"
                  :d="generateSqrtPath()" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
                <!-- Linear -->
                <line 
                  v-if="domainFunction === 'linear'"
                  :x1="generateLinePath(2, 1).x1" 
                  :y1="generateLinePath(2, 1).y1"
                  :x2="generateLinePath(2, 1).x2" 
                  :y2="generateLinePath(2, 1).y2"
                  stroke="#F97316" 
                  stroke-width="3"
                />
                <!-- Hyperbola -->
                <g v-if="domainFunction === 'fraction'">
                  <path :d="generateHyperbolaPath()[0]" fill="none" stroke="#F97316" stroke-width="3" />
                  <path :d="generateHyperbolaPath()[1]" fill="none" stroke="#F97316" stroke-width="3" />
                  <!-- Asymptotes -->
                  <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#94A3B8" stroke-width="1" stroke-dasharray="5,5" />
                  <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#94A3B8" stroke-width="1" stroke-dasharray="5,5" />
                </g>
                <!-- Quadratic -->
                <path 
                  v-if="domainFunction === 'quadratic'"
                  :d="generateParabolaPath()" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
              </template>

              <!-- Converter graph -->
              <template v-if="activeTab === 'converter'">
                <line 
                  :x1="generateLinePath(converterFunction.a, converterFunction.b).x1" 
                  :y1="generateLinePath(converterFunction.a, converterFunction.b).y1"
                  :x2="generateLinePath(converterFunction.a, converterFunction.b).x2" 
                  :y2="generateLinePath(converterFunction.a, converterFunction.b).y2"
                  stroke="#F97316" 
                  stroke-width="3"
                />
                <!-- Table points -->
                <circle 
                  v-for="(row, idx) in converterTable" 
                  :key="idx"
                  :cx="toSvgX(row.x)" 
                  :cy="toSvgY(row.y)" 
                  r="4" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
              </template>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div v-if="activeTab === 'converter'" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Tabelpunten</span>
                </div>
                <div v-if="activeTab === 'recognition'" class="flex items-center gap-2">
                  <div class="w-3 h-0.5" :class="recognitionQuestions[recognitionQuestion].isFunction ? 'bg-orange-500' : 'bg-indigo-500'"></div>
                  <span class="text-slate-600">{{ recognitionQuestions[recognitionQuestion].description }}</span>
                </div>
                <div v-if="showVerticalLine" class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-red-500" style="border-top: 2px dashed #EF4444;"></div>
                  <span class="text-slate-600">Verticale lijn test</span>
                </div>
                <div v-if="domainFunction === 'fraction'" class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-slate-400" style="border-top: 1px dashed #94A3B8;"></div>
                  <span class="text-slate-600">Asymptoten</span>
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

/* Animation for function machine */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>