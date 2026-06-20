<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhVectorTwo, PhArrowsOutCardinal, PhArrowsInLineVertical,
  PhCheckCircle, PhArrowRight, PhArrowLeft, PhPlus, PhMinus,
  PhCrosshair, PhRuler, PhMathOperations, PhGridFour
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const analysisSubMode = ref('addition') // 'addition', 'scalar', 'components'

// Vector definitions
const vectorA = ref({ x: 3, y: 2 })
const vectorB = ref({ x: 2, y: -1 })
const vectorC = ref({ x: 0, y: 0 }) // For addition result

// Scalar multiplication
const scalarK = ref(2)
const vectorV = ref({ x: 2, y: 1 })

// Component decomposition mode
const vectorD = ref({ x: 4, y: 3 })

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'addition', 'scalar', 'decompose'
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// Challenge targets
const targetVectorA = ref({ x: 0, y: 0 })
const targetVectorB = ref({ x: 0, y: 0 })
const targetResult = ref({ x: 0, y: 0 })
const targetScalar = ref(1)

// User inputs for challenge
const userVectorA = ref({ x: 0, y: 0 })
const userVectorB = ref({ x: 0, y: 0 })
const userScalar = ref(1)

// Drag state
const isDragging = ref(false)
const dragTarget = ref(null) // 'A', 'B', or 'V'

// ==================== COMPUTED PROPERTIES ====================
// Vector addition: C = A + B
const vectorSum = computed(() => ({
  x: vectorA.value.x + vectorB.value.x,
  y: vectorA.value.y + vectorB.value.y
}))

// Scalar multiplication result
const scaledVector = computed(() => ({
  x: scalarK.value * vectorV.value.x,
  y: scalarK.value * vectorV.value.y
}))

// Vector norms (lengths)
const normA = computed(() => Math.sqrt(vectorA.value.x ** 2 + vectorA.value.y ** 2))
const normB = computed(() => Math.sqrt(vectorB.value.x ** 2 + vectorB.value.y ** 2))
const normSum = computed(() => Math.sqrt(vectorSum.value.x ** 2 + vectorSum.value.y ** 2))
const normV = computed(() => Math.sqrt(vectorV.value.x ** 2 + vectorV.value.y ** 2))
const normScaled = computed(() => Math.sqrt(scaledVector.value.x ** 2 + scaledVector.value.y ** 2))
const normD = computed(() => Math.sqrt(vectorD.value.x ** 2 + vectorD.value.y ** 2))

// Angle of vector D (in degrees)
const angleD = computed(() => {
  const rad = Math.atan2(vectorD.value.y, vectorD.value.x)
  return (rad * 180 / Math.PI).toFixed(1)
})

// Parallelogram completion point
const parallelogramPoint = computed(() => ({
  x: vectorA.value.x + vectorB.value.x,
  y: vectorA.value.y + vectorB.value.y
}))

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

// Generate arrow path for a vector
function generateArrowPath(startX, startY, endX, endY, color = '#F97316') {
  const dx = endX - startX
  const dy = endY - startY
  const angle = Math.atan2(dy, dx)
  const arrowLength = 12
  const arrowAngle = Math.PI / 6
  
  const x1 = endX - arrowLength * Math.cos(angle - arrowAngle)
  const y1 = endY - arrowLength * Math.sin(angle - arrowAngle)
  const x2 = endX - arrowLength * Math.cos(angle + arrowAngle)
  const y2 = endY - arrowLength * Math.sin(angle + arrowAngle)
  
  return {
    line: `M ${startX} ${startY} L ${endX} ${endY}`,
    arrowhead: `M ${endX} ${endY} L ${x1} ${y1} M ${endX} ${endY} L ${x2} ${y2}`
  }
}

// ==================== DRAG HANDLING ====================
function startDrag(event, target) {
  isDragging.value = true
  dragTarget.value = target
}

function handleDrag(event) {
  if (!isDragging.value) return
  
  const svg = event.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * viewBoxWidth + viewBoxX
  const y = viewBoxY + viewBoxHeight - ((event.clientY - rect.top) / rect.height) * viewBoxHeight
  
  // Snap to grid (0.5 increments)
  const snappedX = Math.round(x * 2) / 2
  const snappedY = Math.round(y * 2) / 2
  
  // Limit to view bounds
  const limitedX = Math.max(-7, Math.min(7, snappedX))
  const limitedY = Math.max(-5, Math.min(5, snappedY))
  
  if (dragTarget.value === 'A') {
    vectorA.value = { x: limitedX, y: limitedY }
  } else if (dragTarget.value === 'B') {
    vectorB.value = { x: limitedX, y: limitedY }
  } else if (dragTarget.value === 'V') {
    vectorV.value = { x: limitedX, y: limitedY }
  } else if (dragTarget.value === 'D') {
    vectorD.value = { x: limitedX, y: limitedY }
  }
}

function endDrag() {
  isDragging.value = false
  dragTarget.value = null
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'addition') {
    // Generate two random vectors
    targetVectorA.value = {
      x: Math.round((Math.random() * 6 - 3) * 2) / 2,
      y: Math.round((Math.random() * 6 - 3) * 2) / 2
    }
    targetVectorB.value = {
      x: Math.round((Math.random() * 6 - 3) * 2) / 2,
      y: Math.round((Math.random() * 6 - 3) * 2) / 2
    }
    targetResult.value = {
      x: targetVectorA.value.x + targetVectorB.value.x,
      y: targetVectorA.value.y + targetVectorB.value.y
    }
    
    // Reset user vectors
    userVectorA.value = { x: 1, y: 1 }
    userVectorB.value = { x: 1, y: 1 }
  } else if (type === 'scalar') {
    // Generate target scalar and vector
    targetScalar.value = Math.round((Math.random() * 3 + 0.5) * 2) / 2 * (Math.random() > 0.5 ? 1 : -1)
    const vx = Math.round((Math.random() * 3 + 1) * 2) / 2
    const vy = Math.round((Math.random() * 3 + 1) * 2) / 2
    vectorV.value = { x: vx, y: vy }
    
    userScalar.value = 1
  } else if (type === 'decompose') {
    // Generate target vector for decomposition
    const tx = Math.round((Math.random() * 6 - 3) * 2) / 2
    const ty = Math.round((Math.random() * 6 - 3) * 2) / 2
    vectorD.value = { x: tx, y: ty }
  }
}

function checkChallenge() {
  const tolerance = 0.2
  
  if (challengeType.value === 'addition') {
    const userSum = {
      x: userVectorA.value.x + userVectorB.value.x,
      y: userVectorA.value.y + userVectorB.value.y
    }
    const xCorrect = Math.abs(userSum.x - targetResult.value.x) < tolerance
    const yCorrect = Math.abs(userSum.y - targetResult.value.y) < tolerance
    
    if (xCorrect && yCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De vector som komt overeen met het doel.'
      vectorA.value = { ...userVectorA.value }
      vectorB.value = { ...userVectorB.value }
    } else {
      challengeFeedback.value = `Nog niet juist. Controleer de som van de vectoren.`
    }
  } else if (challengeType.value === 'scalar') {
    const expected = {
      x: targetScalar.value * vectorV.value.x,
      y: targetScalar.value * vectorV.value.y
    }
    const actual = {
      x: userScalar.value * vectorV.value.x,
      y: userScalar.value * vectorV.value.y
    }
    
    if (Math.abs(userScalar.value - targetScalar.value) < tolerance) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De schaalfactor is juist.'
      scalarK.value = targetScalar.value
    } else {
      challengeFeedback.value = 'Nog niet juist. Controleer de schaalfactor.'
    }
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
    title: 'Vector optelling (parallellogrammethode)',
    description: 'Tel twee vectoren op door het parallellogram te voltooien.',
    focus: 'addition',
    instruction: 'Sleep vector A en B. Observeer hoe de somvector C ontstaat.',
    details: [
      'Plaats de vectoren staart-aan-staart',
      'Voltooi het parallellogram',
      'De diagonal is de somvector C = A + B',
      'Cₓ = Aₓ + Bₓ en Cᵧ = Aᵧ + Bᵧ'
    ]
  },
  {
    title: 'Scalaire vermenigvuldiging',
    description: 'Vermenigvuldig een vector met een scalair om lengte en richting te wijzigen.',
    focus: 'scalar',
    instruction: 'Wijzig de schaalfactor k en observeer het effect op vector v.',
    details: [
      'k > 1: vector wordt langer',
      '0 < k < 1: vector wordt korter',
      'k < 0: vector keert richting om',
      '||kv|| = |k| · ||v||'
    ]
  },
  {
    title: 'Vectorcomponenten',
    description: 'Een vector kan worden ontbonden in x- en y-componenten.',
    focus: 'components',
    instruction: 'Beweeg vector D en observeer de componenten en lengte.',
    details: [
      'vₓ = horizontale component',
      'vᵧ = verticale component',
      '||v|| = √(vₓ² + vᵧ²)',
      'θ = arctan(vᵧ/vₓ)'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    analysisSubMode.value = analysisSteps[currentStep.value].focus
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    analysisSubMode.value = analysisSteps[currentStep.value].focus
  }
}

// Watch analysisSubMode to sync with steps
watch(analysisSubMode, (newMode) => {
  const stepIndex = analysisSteps.findIndex(s => s.focus === newMode)
  if (stepIndex !== -1) {
    currentStep.value = stepIndex
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhVectorTwo class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Vectoren</h1>
            <p class="text-sm text-slate-500">Optellen, vermenigvuldigen en ontbinden</p>
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

            <!-- Sub-mode tabs -->
            <div class="flex border-b border-slate-200">
              <button 
                @click="analysisSubMode = 'addition'"
                :class="['flex-1 py-2 text-sm font-medium transition-colors', 
                  analysisSubMode === 'addition' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <div class="flex items-center justify-center gap-1">
                  <PhPlus class="text-base" />
                  <span>Optelling</span>
                </div>
              </button>
              <button 
                @click="analysisSubMode = 'scalar'"
                :class="['flex-1 py-2 text-sm font-medium transition-colors', 
                  analysisSubMode === 'scalar' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <div class="flex items-center justify-center gap-1">
                  <PhArrowsOutCardinal class="text-base" />
                  <span>Scalaire vermenigvuldiging</span>
                </div>
              </button>
              <button 
                @click="analysisSubMode = 'components'"
                :class="['flex-1 py-2 text-sm font-medium transition-colors', 
                  analysisSubMode === 'components' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                <div class="flex items-center justify-center gap-1">
                  <PhGridFour class="text-base" />
                  <span>Componenten</span>
                </div>
              </button>
            </div>

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Vector Addition Controls -->
              <template v-if="analysisSubMode === 'addition'">
                <div class="space-y-4">
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p class="text-sm font-bold text-blue-800 mb-2">Vector A</p>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm text-blue-700">Aₓ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorA.x }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorA.x" 
                        min="-5" 
                        max="5" 
                        step="0.5"
                        class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <div class="flex justify-between items-center mt-2">
                        <label class="text-sm text-blue-700">Aᵧ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorA.y }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorA.y" 
                        min="-5" 
                        max="5" 
                        step="0.5"
                        class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                  </div>

                  <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p class="text-sm font-bold text-emerald-800 mb-2">Vector B</p>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm text-emerald-700">Bₓ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorB.x }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorB.x" 
                        min="-5" 
                        max="5" 
                        step="0.5"
                        class="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <div class="flex justify-between items-center mt-2">
                        <label class="text-sm text-emerald-700">Bᵧ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorB.y }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorB.y" 
                        min="-5" 
                        max="5" 
                        step="0.5"
                        class="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                  </div>

                  <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p class="text-sm font-bold text-orange-800 mb-2">Somvector C = A + B</p>
                    <div class="text-sm font-mono space-y-1">
                      <p>Cₓ = {{ vectorA.x }} + {{ vectorB.x }} = <span class="text-brand-orange font-bold">{{ vectorSum.x }}</span></p>
                      <p>Cᵧ = {{ vectorA.y }} + {{ vectorB.y }} = <span class="text-brand-orange font-bold">{{ vectorSum.y }}</span></p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Scalar Multiplication Controls -->
              <template v-if="analysisSubMode === 'scalar'">
                <div class="space-y-4">
                  <div class="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p class="text-sm font-bold text-purple-800 mb-2">Vector v</p>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm text-purple-700">vₓ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorV.x }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorV.x" 
                        min="-4" 
                        max="4" 
                        step="0.5"
                        class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <div class="flex justify-between items-center mt-2">
                        <label class="text-sm text-purple-700">vᵧ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorV.y }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorV.y" 
                        min="-4" 
                        max="4" 
                        step="0.5"
                        class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Schaalfactor k</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ scalarK }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="scalarK" 
                      min="-3" 
                      max="3" 
                      step="0.25"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <div class="flex justify-between text-xs text-slate-400">
                      <span>-3 (omgekeerd)</span>
                      <span>0 (nulvector)</span>
                      <span>+3</span>
                    </div>
                  </div>

                  <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p class="text-sm font-bold text-orange-800 mb-2">Resultaat: kv</p>
                    <div class="text-sm font-mono space-y-1">
                      <p>(kv)ₓ = {{ scalarK }} × {{ vectorV.x }} = <span class="text-brand-orange font-bold">{{ scaledVector.x }}</span></p>
                      <p>(kv)ᵧ = {{ scalarK }} × {{ vectorV.y }} = <span class="text-brand-orange font-bold">{{ scaledVector.y }}</span></p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Component Decomposition Controls -->
              <template v-if="analysisSubMode === 'components'">
                <div class="space-y-4">
                  <div class="p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <p class="text-sm font-bold text-pink-800 mb-2">Vector D</p>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm text-pink-700">Dₓ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorD.x }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorD.x" 
                        min="-6" 
                        max="6" 
                        step="0.5"
                        class="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <div class="flex justify-between items-center mt-2">
                        <label class="text-sm text-pink-700">Dᵧ</label>
                        <span class="text-sm font-mono bg-white px-2 py-0.5 rounded">{{ vectorD.y }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="vectorD.y" 
                        min="-6" 
                        max="6" 
                        step="0.5"
                        class="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                  </div>

                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Berekeningen</p>
                    <div class="text-sm space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Lengte ||D||:</span>
                        <span class="font-mono">√({{ vectorD.x }}² + {{ vectorD.y }}²) = {{ normD.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Hoek θ:</span>
                        <span class="font-mono">{{ angleD }}°</span>
                      </div>
                    </div>
                  </div>
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

          <!-- Mode: Derivation/Challenge -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassingen</h2>
              <p class="text-sm text-slate-600">Oefen met vectorberekeningen.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('addition')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Vector optelling</div>
                  <div class="text-xs text-slate-500 mt-1">Stel vectoren A en B zo in dat A + B gelijk is aan het doel.</div>
                </button>
                
                <button @click="generateChallenge('scalar')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Scalaire vermenigvuldiging</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal de juiste schaalfactor k.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Opdracht:</p>
                  <p v-if="challengeType === 'addition'" class="text-xs text-white/80 mt-1">
                    Stel vector A en B zo in dat de som gelijk is aan het doel (paars).
                  </p>
                  <p v-if="challengeType === 'scalar'" class="text-xs text-white/80 mt-1">
                    Bepaal de schaalfactor k zodat kv overeenkomt met het doel.
                  </p>
                </div>

                <!-- User Input for Addition Challenge -->
                <div v-if="challengeType === 'addition'" class="space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-blue-700">Aₓ</label>
                      <input 
                        type="number" 
                        v-model.number="userVectorA.x" 
                        step="0.5"
                        class="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-blue-700">Aᵧ</label>
                      <input 
                        type="number" 
                        v-model.number="userVectorA.y" 
                        step="0.5"
                        class="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-emerald-700">Bₓ</label>
                      <input 
                        type="number" 
                        v-model.number="userVectorB.x" 
                        step="0.5"
                        class="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-bold text-emerald-700">Bᵧ</label>
                      <input 
                        type="number" 
                        v-model.number="userVectorB.y" 
                        step="0.5"
                        class="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </div>
                </div>

                <!-- User Input for Scalar Challenge -->
                <div v-if="challengeType === 'scalar'" class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Schaalfactor k</label>
                    <input 
                      type="number" 
                      v-model.number="userScalar" 
                      step="0.25"
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
            
            <!-- Addition mode characteristics -->
            <div v-if="analysisSubMode === 'addition' || (currentMode === 'derivation' && challengeType === 'addition')" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">||A||:</span>
                <span class="font-mono">{{ normA.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">||B||:</span>
                <span class="font-mono">{{ normB.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">||A + B||:</span>
                <span class="font-mono text-brand-orange">{{ normSum.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span class="text-slate-600">C = A + B:</span>
                <span class="font-mono">({{ vectorSum.x }}, {{ vectorSum.y }})</span>
              </div>
            </div>

            <!-- Scalar mode characteristics -->
            <div v-if="analysisSubMode === 'scalar' || (currentMode === 'derivation' && challengeType === 'scalar')" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">||v||:</span>
                <span class="font-mono">{{ normV.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Schaalfactor k:</span>
                <span class="font-mono">{{ scalarK }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">||kv||:</span>
                <span class="font-mono text-brand-orange">{{ normScaled.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span class="text-slate-600">kv = ({{ scaledVector.x }}, {{ scaledVector.y }})</span>
              </div>
            </div>

            <!-- Components mode characteristics -->
            <div v-if="analysisSubMode === 'components'" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">D = (Dₓ, Dᵧ):</span>
                <span class="font-mono">({{ vectorD.x }}, {{ vectorD.y }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">||D||:</span>
                <span class="font-mono text-brand-orange">{{ normD.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Hoek θ:</span>
                <span class="font-mono">{{ angleD }}°</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <template v-if="analysisSubMode === 'addition' || (currentMode === 'derivation' && challengeType === 'addition')">
                <span class="text-sm text-slate-500">Vector optelling:</span>
                <span class="text-xl font-mono font-bold text-brand-dark">
                  C = A + B = ({{ vectorSum.x }}, {{ vectorSum.y }})
                </span>
              </template>
              <template v-if="analysisSubMode === 'scalar' || (currentMode === 'derivation' && challengeType === 'scalar')">
                <span class="text-sm text-slate-500">Scalaire vermenigvuldiging:</span>
                <span class="text-xl font-mono font-bold text-brand-dark">
                  {{ scalarK }}v = ({{ scaledVector.x }}, {{ scaledVector.y }})
                </span>
              </template>
              <template v-if="analysisSubMode === 'components'">
                <span class="text-sm text-slate-500">Vectorcomponenten:</span>
                <span class="text-xl font-mono font-bold text-brand-dark">
                  D = ({{ vectorD.x }}, {{ vectorD.y }}), ||D|| = {{ normD.toFixed(2) }}
                </span>
              </template>
            </div>
          </div>

          <!-- Graph Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full cursor-crosshair"
              preserveAspectRatio="xMidYMid meet"
              @mousemove="handleDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
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

              <!-- Grid numbers -->
              <g class="fill-slate-300 text-xs">
                <text v-for="i in 15" :key="`nx${i}`" :x="toSvgX(-7 + i)" :y="toSvgY(0) + 15" text-anchor="middle">{{ -7 + i }}</text>
                <text v-for="i in 11" :key="`ny${i}`" :x="toSvgX(0) - 10" :y="toSvgY(-5 + i) + 4" text-anchor="end">{{ -5 + i }}</text>
              </g>

              <!-- VECTOR ADDITION VISUALIZATION -->
              <g v-if="analysisSubMode === 'addition' || (currentMode === 'derivation' && challengeType === 'addition')">
                <!-- Parallelogram construction lines (dashed) -->
                <line 
                  :x1="toSvgX(vectorA.x)" :y1="toSvgY(vectorA.y)"
                  :x2="toSvgX(parallelogramPoint.x)" :y2="toSvgY(parallelogramPoint.y)"
                  stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,4"
                />
                <line 
                  :x1="toSvgX(vectorB.x)" :y1="toSvgY(vectorB.y)"
                  :x2="toSvgX(parallelogramPoint.x)" :y2="toSvgY(parallelogramPoint.y)"
                  stroke="#94A3B8" stroke-width="1" stroke-dasharray="4,4"
                />

                <!-- Vector B (green) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorB.x), toSvgY(vectorB.y)).line" 
                    stroke="#10B981" stroke-width="3" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorB.x), toSvgY(vectorB.y)).arrowhead" 
                    stroke="#10B981" stroke-width="3" fill="none" />
                  <!-- Drag handle -->
                  <circle 
                    :cx="toSvgX(vectorB.x)" :cy="toSvgY(vectorB.y)" r="8"
                    fill="#10B981" stroke="white" stroke-width="2"
                    class="cursor-move hover:r-10"
                    @mousedown="startDrag($event, 'B')"
                  />
                  <text :x="toSvgX(vectorB.x) + 12" :y="toSvgY(vectorB.y)" class="fill-emerald-600 text-sm font-bold">B</text>
                </g>

                <!-- Vector A (blue) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorA.x), toSvgY(vectorA.y)).line" 
                    stroke="#3B82F6" stroke-width="3" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorA.x), toSvgY(vectorA.y)).arrowhead" 
                    stroke="#3B82F6" stroke-width="3" fill="none" />
                  <!-- Drag handle -->
                  <circle 
                    :cx="toSvgX(vectorA.x)" :cy="toSvgY(vectorA.y)" r="8"
                    fill="#3B82F6" stroke="white" stroke-width="2"
                    class="cursor-move"
                    @mousedown="startDrag($event, 'A')"
                  />
                  <text :x="toSvgX(vectorA.x) + 12" :y="toSvgY(vectorA.y)" class="fill-blue-600 text-sm font-bold">A</text>
                </g>

                <!-- Sum vector C (orange) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorSum.x), toSvgY(vectorSum.y)).line" 
                    stroke="#F97316" stroke-width="4" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorSum.x), toSvgY(vectorSum.y)).arrowhead" 
                    stroke="#F97316" stroke-width="4" fill="none" />
                  <circle 
                    :cx="toSvgX(vectorSum.x)" :cy="toSvgY(vectorSum.y)" r="6"
                    fill="#F97316" stroke="white" stroke-width="2"
                  />
                  <text :x="toSvgX(vectorSum.x) + 15" :y="toSvgY(vectorSum.y)" class="fill-brand-orange text-sm font-bold">C = A + B</text>
                </g>

                <!-- Origin marker -->
                <circle :cx="toSvgX(0)" :cy="toSvgY(0)" r="4" fill="#64748B" />
                <text :x="toSvgX(0) - 10" :y="toSvgY(0) + 15" class="fill-slate-500 text-xs">O</text>

                <!-- Challenge target vector (purple, dashed) -->
                <g v-if="challengeActive && challengeType === 'addition'">
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(targetResult.x), toSvgY(targetResult.y)).line" 
                    stroke="#A855F7" stroke-width="3" fill="none" stroke-dasharray="8,4" opacity="0.6" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(targetResult.x), toSvgY(targetResult.y)).arrowhead" 
                    stroke="#A855F7" stroke-width="3" fill="none" stroke-dasharray="8,4" opacity="0.6" />
                  <text :x="toSvgX(targetResult.x) + 15" :y="toSvgY(targetResult.y)" class="fill-purple-500 text-sm font-bold">Doel</text>
                </g>
              </g>

              <!-- SCALAR MULTIPLICATION VISUALIZATION -->
              <g v-if="analysisSubMode === 'scalar' || (currentMode === 'derivation' && challengeType === 'scalar')">
                <!-- Original vector v (purple) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorV.x), toSvgY(vectorV.y)).line" 
                    stroke="#A855F7" stroke-width="3" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorV.x), toSvgY(vectorV.y)).arrowhead" 
                    stroke="#A855F7" stroke-width="3" fill="none" />
                  <circle 
                    :cx="toSvgX(vectorV.x)" :cy="toSvgY(vectorV.y)" r="8"
                    fill="#A855F7" stroke="white" stroke-width="2"
                    class="cursor-move"
                    @mousedown="startDrag($event, 'V')"
                  />
                  <text :x="toSvgX(vectorV.x) + 12" :y="toSvgY(vectorV.y)" class="fill-purple-600 text-sm font-bold">v</text>
                </g>

                <!-- Scaled vector kv (orange) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(scaledVector.x), toSvgY(scaledVector.y)).line" 
                    stroke="#F97316" stroke-width="4" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(scaledVector.x), toSvgY(scaledVector.y)).arrowhead" 
                    stroke="#F97316" stroke-width="4" fill="none" />
                  <text :x="toSvgX(scaledVector.x) + 15" :y="toSvgY(scaledVector.y)" class="fill-brand-orange text-sm font-bold">kv</text>
                </g>

                <!-- Challenge target (dashed purple) -->
                <g v-if="challengeActive && challengeType === 'scalar'">
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(targetScalar * vectorV.x), toSvgY(targetScalar * vectorV.y)).line" 
                    stroke="#A855F7" stroke-width="3" fill="none" stroke-dasharray="8,4" opacity="0.5" />
                  <text :x="toSvgX(targetScalar * vectorV.x) + 15" :y="toSvgY(targetScalar * vectorV.y)" class="fill-purple-500 text-sm font-bold">Doel</text>
                </g>

                <!-- Origin marker -->
                <circle :cx="toSvgX(0)" :cy="toSvgY(0)" r="4" fill="#64748B" />
              </g>

              <!-- COMPONENT DECOMPOSITION VISUALIZATION -->
              <g v-if="analysisSubMode === 'components'">
                <!-- X-component (horizontal) -->
                <line 
                  :x1="toSvgX(0)" :y1="toSvgY(0)"
                  :x2="toSvgX(vectorD.x)" :y2="toSvgY(0)"
                  stroke="#EC4899" stroke-width="3" stroke-dasharray="4,2"
                />
                <text :x="toSvgX(vectorD.x / 2)" :y="toSvgY(0) - 10" class="fill-pink-500 text-sm font-bold" text-anchor="middle">Dₓ = {{ vectorD.x }}</text>

                <!-- Y-component (vertical) -->
                <line 
                  :x1="toSvgX(vectorD.x)" :y1="toSvgY(0)"
                  :x2="toSvgX(vectorD.x)" :y2="toSvgY(vectorD.y)"
                  stroke="#EC4899" stroke-width="3" stroke-dasharray="4,2"
                />
                <text :x="toSvgX(vectorD.x) + 10" :y="toSvgY(vectorD.y / 2)" class="fill-pink-500 text-sm font-bold">Dᵧ = {{ vectorD.y }}</text>

                <!-- Vector D (pink) -->
                <g>
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorD.x), toSvgY(vectorD.y)).line" 
                    stroke="#EC4899" stroke-width="4" fill="none" />
                  <path :d="generateArrowPath(toSvgX(0), toSvgY(0), toSvgX(vectorD.x), toSvgY(vectorD.y)).arrowhead" 
                    stroke="#EC4899" stroke-width="4" fill="none" />
                  <circle 
                    :cx="toSvgX(vectorD.x)" :cy="toSvgY(vectorD.y)" r="8"
                    fill="#EC4899" stroke="white" stroke-width="2"
                    class="cursor-move"
                    @mousedown="startDrag($event, 'D')"
                  />
                  <text :x="toSvgX(vectorD.x) + 15" :y="toSvgY(vectorD.y)" class="fill-pink-600 text-sm font-bold">D</text>
                </g>

                <!-- Component box -->
                <rect 
                  :x="toSvgX(Math.min(0, vectorD.x))" :y="toSvgY(Math.max(0, vectorD.y))"
                  :width="Math.abs(toSvgX(vectorD.x) - toSvgX(0))" :height="Math.abs(toSvgY(vectorD.y) - toSvgY(0))"
                  fill="none" stroke="#FBCFE8" stroke-width="1" stroke-dasharray="2,2"
                />

                <!-- Angle arc -->
                <path 
                  :d="`M ${toSvgX(1)} ${toSvgY(0)} A ${toSvgX(1) - toSvgX(0)} ${toSvgY(0) - toSvgY(1)} 0 0 0 ${toSvgX(vectorD.x / normD * 1.5)} ${toSvgY(vectorD.y / normD * 1.5)}`"
                  fill="none" stroke="#F97316" stroke-width="2"
                />
                <text :x="toSvgX(1.2)" :y="toSvgY(0.3)" class="fill-brand-orange text-xs font-bold">θ</text>

                <!-- Origin marker -->
                <circle :cx="toSvgX(0)" :cy="toSvgY(0)" r="4" fill="#64748B" />
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div v-if="analysisSubMode === 'addition'" class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-blue-500"></div>
                    <span class="text-slate-600">Vector A (sleepbaar)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-emerald-500"></div>
                    <span class="text-slate-600">Vector B (sleepbaar)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-orange-500"></div>
                    <span class="text-slate-600">Somvector C = A + B</span>
                  </div>
                </div>
                <div v-if="analysisSubMode === 'scalar'" class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-purple-500"></div>
                    <span class="text-slate-600">Vector v (sleepbaar)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-orange-500"></div>
                    <span class="text-slate-600">Geschaalde vector kv</span>
                  </div>
                </div>
                <div v-if="analysisSubMode === 'components'" class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-pink-500"></div>
                    <span class="text-slate-600">Vector D (sleepbaar)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-pink-400" style="border-top: 2px dashed #EC4899;"></div>
                    <span class="text-slate-600">Componenten Dₓ, Dᵧ</span>
                  </div>
                </div>
                <div v-if="challengeActive" class="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <div class="w-4 h-0.5 bg-purple-400" style="border-top: 2px dashed #A855F7;"></div>
                  <span class="text-slate-600">Doelvector</span>
                </div>
              </div>
            </div>

            <!-- Drag instruction -->
            <div v-if="analysisSubMode !== 'scalar' || challengeActive" class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <p class="text-xs text-slate-500 flex items-center gap-1">
                <PhArrowsOutCardinal class="text-sm" />
                Sleep de gekleurde punten om vectoren te verplaatsen
              </p>
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
