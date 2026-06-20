<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhTriangle, PhArrowRight, PhArrowLeft,
  PhCalculator, PhArrowsClockwise, PhCheckCircle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Triangle vertices (right triangle with right angle at origin)
const vertexA = ref({ x: 0, y: 0 })   // Right angle vertex
const vertexB = ref({ x: 5, y: 0 })   // On x-axis
const vertexC = ref({ x: 0, y: 4 })   // On y-axis

// Current angle at vertex B (β) - the acute angle we calculate trig functions for
const angleBeta = computed(() => {
  const adjacent = vertexB.value.x - vertexA.value.x
  const opposite = vertexC.value.y - vertexA.value.y
  return Math.atan(opposite / adjacent)
})

const angleAlpha = computed(() => {
  return Math.PI / 2 - angleBeta.value
})

// Side lengths
const sideA = computed(() => {
  // Side opposite angle α (BC)
  return Math.sqrt(
    Math.pow(vertexB.value.x - vertexC.value.x, 2) + 
    Math.pow(vertexB.value.y - vertexC.value.y, 2)
  )
})

const sideB = computed(() => {
  // Side opposite angle β (AC) - always along y-axis
  return vertexC.value.y - vertexA.value.y
})

const sideC = computed(() => {
  // Hypotenuse (AB)
  return Math.sqrt(
    Math.pow(vertexB.value.x - vertexA.value.x, 2) + 
    Math.pow(vertexB.value.y - vertexA.value.y, 2)
  )
})

// Trigonometric values for angle β
const sinBeta = computed(() => sideB.value / sideC.value)
const cosBeta = computed(() => Math.abs(vertexB.value.x - vertexA.value.x) / sideC.value)
const tanBeta = computed(() => sinBeta.value / cosBeta.value)

// Pythagorean check
const pythagoreanCheck = computed(() => {
  return Math.abs(Math.pow(sideA.value, 2) + Math.pow(sideB.value, 2) - Math.pow(sideC.value, 2)) < 0.001
})

// Draggable point tracking
const isDragging = ref(false)
const dragPoint = ref('')

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'find-angle', 'find-side', 'sohcahtoa'
const challengeDifficulty = ref('easy')
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// Challenge specific state
const challengeGivenAngle = ref(0)
const challengeGivenSide = ref(0)
const challengeTargetSide = ref(0)
const challengeGivenSideLabel = ref('')
const challengeTargetSideLabel = ref('')
const userAnswer = ref(0)

// Calculator mode
const showCalculator = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Triangle paths for SVG
const trianglePath = computed(() => {
  return `M ${toSvgX(vertexA.value.x)} ${toSvgY(vertexA.value.y)} L ${toSvgX(vertexB.value.x)} ${toSvgY(vertexB.value.y)} L ${toSvgX(vertexC.value.x)} ${toSvgY(vertexC.value.y)} Z`
})

// SOH CAH TOA visualization
const sohPath = computed(() => {
  const midBC = {
    x: (vertexB.value.x + vertexC.value.x) / 2,
    y: (vertexB.value.y + vertexC.value.y) / 2
  }
  return `M ${toSvgX(vertexA.value.x)} ${toSvgY(vertexA.value.y)} L ${toSvgX(midBC.x)} ${toSvgY(midBC.y)}`
})

const cahPath = computed(() => {
  const midAC = {
    x: vertexA.value.x,
    y: vertexC.value.y / 2
  }
  return `M ${toSvgX(vertexB.value.x)} ${toSvgY(vertexB.value.y)} L ${toSvgX(midAC.x)} ${toSvgY(midAC.y)}`
})

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -1
const viewBoxY = -1
const viewBoxWidth = 12
const viewBoxHeight = 9

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// ==================== DRAG HANDLING ====================
function startDrag(point, event) {
  isDragging.value = true
  dragPoint.value = point
  event.preventDefault()
}

function handleDrag(event) {
  if (!isDragging.value) return
  
  const svg = event.target.closest('svg')
  if (!svg) return
  
  const rect = svg.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / svgWidth) * viewBoxWidth + viewBoxX
  const y = viewBoxY + viewBoxHeight - ((event.clientY - rect.top) / svgHeight) * viewBoxHeight
  
  // Constrain to maintain right triangle
  if (dragPoint.value === 'B') {
    // Move B along x-axis, keep A at origin
    const newX = Math.max(0.5, Math.min(10, x))
    vertexB.value = { x: newX, y: 0 }
  } else if (dragPoint.value === 'C') {
    // Move C along y-axis
    const newY = Math.max(0.5, Math.min(7, y))
    vertexC.value = { x: 0, y: newY }
  }
}

function stopDrag() {
  isDragging.value = false
  dragPoint.value = ''
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = 0
  
  // Generate a reasonable triangle
  const base = Math.random() * 6 + 2 // 2 to 8
  const height = Math.random() * 5 + 2 // 2 to 7
  vertexB.value = { x: base, y: 0 }
  vertexC.value = { x: 0, y: height }
  
  if (type === 'find-angle') {
    challengeGivenSideLabel.value = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    challengeTargetSideLabel.value = 'angle β'
    challengeGivenSide.value = challengeGivenSideLabel.value === 'A' ? sideA.value : 
                               challengeGivenSideLabel.value === 'B' ? sideB.value : sideC.value
    challengeTargetSide.value = angleBeta.value * (180 / Math.PI) // in degrees
  } else if (type === 'find-side') {
    const sides = ['A', 'B', 'C']
    const indices = [0, 1, 2].sort(() => Math.random() - 0.5)
    challengeGivenSideLabel.value = sides[indices[0]]
    challengeTargetSideLabel.value = sides[indices[1]]
    challengeGivenSide.value = challengeGivenSideLabel.value === 'A' ? sideA.value : 
                               challengeGivenSideLabel.value === 'B' ? sideB.value : sideC.value
    challengeTargetSide.value = challengeTargetSideLabel.value === 'A' ? sideA.value : 
                               challengeTargetSideLabel.value === 'B' ? sideB.value : sideC.value
  } else if (type === 'sohcahtoa') {
    challengeGivenAngle.value = Math.round(angleBeta.value * (180 / Math.PI))
    challengeTargetSideLabel.value = ['sin β', 'cos β', 'tan β'][Math.floor(Math.random() * 3)]
    challengeTargetSide.value = challengeTargetSideLabel.value === 'sin β' ? sinBeta.value :
                               challengeTargetSideLabel.value === 'cos β' ? cosBeta.value : tanBeta.value
  }
}

function checkChallenge() {
  const tolerance = 0.1
  let correct = false
  
  if (challengeType.value === 'find-angle') {
    correct = Math.abs(userAnswer.value - (angleBeta.value * 180 / Math.PI)) < tolerance
  } else if (challengeType.value === 'find-side') {
    const target = challengeTargetSideLabel.value === 'A' ? sideA.value :
                   challengeTargetSideLabel.value === 'B' ? sideB.value : sideC.value
    correct = Math.abs(userAnswer.value - target) < tolerance
  } else if (challengeType.value === 'sohcahtoa') {
    let targetValue = 0
    if (challengeTargetSideLabel.value === 'sin β') targetValue = sinBeta.value
    else if (challengeTargetSideLabel.value === 'cos β') targetValue = cosBeta.value
    else targetValue = tanBeta.value
    correct = Math.abs(userAnswer.value - targetValue) < tolerance
  }
  
  if (correct) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! Uitstekend werk.'
  } else {
    challengeFeedback.value = 'Nog niet juist. Controleer je berekening.'
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
    title: 'Goniometrische getallen introduceren',
    description: 'In een rechthoekige driehoek definiëren we sin, cos en tan als verhoudingen tussen zijden.',
    focus: 'intro',
    instruction: 'Bestudeer de driehoek en zie hoe de verhoudingen veranderen.',
    details: [
      'sin(β) = overstaande zijde / schuine zijde',
      'cos(β) = aanliggende zijde / schuine zijde', 
      'tan(β) = overstaande zijde / aanliggende zijde'
    ]
  },
  {
    title: 'SOH CAH TOA',
    description: 'De bekende ezelsbruggetje om de verhoudingen te onthouden.',
    focus: 'sohcahtoa',
    instruction: 'Verplaats de punten B en C om de verhoudingen te zien veranderen.',
    details: [
      'SOH: Sinus = Overstaand / Hypothenusa',
      'CAH: Cosinus = Aanliggend / Hypothenusa',
      'TOA: Tangens = Overstaand / Aanliggend'
    ]
  },
  {
    title: 'Hoeken vinden met inverse functies',
    description: 'Gebruik arcsin, arccos of arctan om een hoek te berekenen uit verhoudingen.',
    focus: 'inverse',
    instruction: 'Gebruik de waarden om de hoek β te berekenen.',
    details: [
      'β = arcsin(sin β) = arcsin(b/c)',
      'β = arccos(cos β) = arccos(a/c)',
      'β = arctan(tan β) = arctan(b/a)'
    ]
  },
  {
    title: 'De grondformule',
    description: 'Het verband sin²α + cos²α = 1 geldt voor elke hoek α.',
    focus: 'identity',
    instruction: 'Controleer dat sin²β + cos²β = 1.',
    details: [
      'sin²β + cos²β = (b/c)² + (a/c)²',
      '= (b² + a²)/c² = c²/c² = 1',
      'Dit volgt direct uit de stelling van Pythagoras'
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

function resetTriangle() {
  vertexA.value = { x: 0, y: 0 }
  vertexB.value = { x: 5, y: 0 }
  vertexC.value = { x: 0, y: 4 }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhTriangle class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Goniometrische getallen</h1>
            <p class="text-sm text-slate-500">Rechthoekige driehoeken</p>
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

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Triangle Controls -->
              <div v-if="analysisSteps[currentStep].focus !== 'identity'" class="space-y-4">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-2">Driehoek aanpassen</p>
                  <p class="text-xs text-slate-500 mb-3">Sleep de punten B en C in de grafiek</p>
                  <button @click="resetTriangle" class="flex items-center gap-2 text-sm text-brand-orange hover:text-orange-700">
                    <PhArrowsClockwise class="text-lg" />
                    <span>Reset driehoek</span>
                  </button>
                </div>
              </div>

              <!-- SOH CAH TOA Display -->
              <div v-if="analysisSteps[currentStep].focus === 'sohcahtoa'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-3">SOH CAH TOA</p>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-brand-orange font-bold">SOH:</span>
                    <span class="text-slate-600">sin β = {{ sinBeta.toFixed(3) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-brand-orange font-bold">CAH:</span>
                    <span class="text-slate-600">cos β = {{ cosBeta.toFixed(3) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-brand-orange font-bold">TOA:</span>
                    <span class="text-slate-600">tan β = {{ tanBeta.toFixed(3) }}</span>
                  </div>
                </div>
              </div>

              <!-- Inverse functions -->
              <div v-if="analysisSteps[currentStep].focus === 'inverse'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Inverse berekeningen</p>
                <div class="space-y-1 text-sm font-mono">
                  <p>β = arcsin({{ sinBeta.toFixed(3) }})</p>
                  <p>β = {{ (Math.asin(sinBeta) * 180 / Math.PI).toFixed(2) }}°</p>
                  <p class="text-slate-400 text-xs mt-2">arccos en arctan geven zelfde resultaat</p>
                </div>
              </div>

              <!-- Identity verification -->
              <div v-if="analysisSteps[currentStep].focus === 'identity'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">sin²β + cos²β = 1</p>
                <div class="text-sm font-mono space-y-1">
                  <p>sin²β = {{ (sinBeta * sinBeta).toFixed(4) }}</p>
                  <p>cos²β = {{ (cosBeta * cosBeta).toFixed(4) }}</p>
                  <p class="text-brand-orange font-bold">som = {{ (sinBeta * sinBeta + cosBeta * cosBeta).toFixed(4) }}</p>
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

          <!-- Mode: Challenge/Derivation -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassingsopdrachten</h2>
              <p class="text-sm text-slate-600">Bereken ontbrekende zijden en hoeken.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('find-angle')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bereken een hoek</div>
                  <div class="text-xs text-slate-500 mt-1">Gebruik inverse goniometrische functies.</div>
                </button>
                
                <button @click="generateChallenge('find-side')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bereken een zijde</div>
                  <div class="text-xs text-slate-500 mt-1">Gebruik sin, cos of tan met een gegeven hoek.</div>
                </button>
                
                <button @click="generateChallenge('sohcahtoa')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">SOH CAH TOA oefening</div>
                  <div class="text-xs text-slate-500 mt-1">Bereken een goniometrisch getal.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bereken de gevraagde waarde:</p>
                  <div v-if="challengeType === 'find-angle'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Gegeven: zijde {{ challengeGivenSideLabel }} = {{ challengeGivenSide.toFixed(2) }}</p>
                    <p>Gevraagd: hoek β</p>
                    <p class="mt-2 text-white/60">Tip: gebruik arcsin, arccos of arctan</p>
                  </div>
                  <div v-if="challengeType === 'find-side'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Gegeven: zijde {{ challengeGivenSideLabel }} = {{ challengeGivenSide.toFixed(2) }}</p>
                    <p>Gevraagd: zijde {{ challengeTargetSideLabel }}</p>
                    <p class="mt-2 text-white/60">Tip: gebruik sin, cos of tan</p>
                  </div>
                  <div v-if="challengeType === 'sohcahtoa'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Gegeven: hoek β = {{ (angleBeta * 180 / Math.PI).toFixed(1) }}°</p>
                    <p>Gevraagd: {{ challengeTargetSideLabel }}</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">
                      Jouw antwoord
                      <span v-if="challengeType === 'find-angle'" class="text-slate-400 font-normal"> (in graden)</span>
                    </label>
                    <input 
                      type="number" 
                      v-model.number="userAnswer" 
                      step="0.01"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                  <button @click="checkChallenge" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                    <PhCheckCircle weight="bold" />
                    <span>Controleer</span>
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
                <span class="text-slate-600">Zijde a (BC):</span>
                <span class="font-mono">{{ sideA.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Zijde b (AC):</span>
                <span class="font-mono">{{ sideB.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Zijde c (AB):</span>
                <span class="font-mono">{{ sideC.toFixed(2) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-2 mt-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Hoek α:</span>
                  <span class="font-mono">{{ (angleAlpha * 180 / Math.PI).toFixed(1) }}°</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Hoek β:</span>
                  <span class="font-mono text-brand-orange">{{ (angleBeta * 180 / Math.PI).toFixed(1) }}°</span>
                </div>
              </div>
              <div class="border-t border-slate-200 pt-2 mt-2 space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-600">sin β:</span>
                  <span class="font-mono">{{ sinBeta.toFixed(4) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">cos β:</span>
                  <span class="font-mono">{{ cosBeta.toFixed(4) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">tan β:</span>
                  <span class="font-mono">{{ tanBeta.toFixed(4) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Triangle Info -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-6 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">∠β =</span>
                <span class="text-lg font-mono font-bold text-brand-dark">{{ (angleBeta * 180 / Math.PI).toFixed(1) }}°</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">sin β =</span>
                <span class="text-lg font-mono font-bold text-brand-orange">{{ sinBeta.toFixed(3) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">cos β =</span>
                <span class="text-lg font-mono font-bold text-slate-600">{{ cosBeta.toFixed(3) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">tan β =</span>
                <span class="text-lg font-mono font-bold text-slate-600">{{ tanBeta.toFixed(3) }}</span>
              </div>
            </div>
          </div>

          <!-- Graph Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full cursor-crosshair"
              preserveAspectRatio="xMidYMid meet"
              @mousemove="handleDrag"
              @mouseup="stopDrag"
              @mouseleave="stopDrag"
            >
              <!-- Grid -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 13" :key="`v${i}`" 
                  :x1="toSvgX(-1 + i)" y1="0" 
                  :x2="toSvgX(-1 + i)" :y2="svgHeight" 
                />
                <line v-for="i in 10" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-1 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-1 + i)" 
                />
              </g>

              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

              <!-- Triangle -->
              <path 
                :d="trianglePath" 
                fill="rgba(249, 115, 22, 0.1)" 
                stroke="#F97316" 
                stroke-width="2"
              />

              <!-- Side labels -->
              <text :x="toSvgX((vertexA.value.x + vertexB.value.x) / 2)" :y="toSvgY(vertexA.value.y) + 20" 
                text-anchor="middle" class="fill-slate-600 text-sm font-mono">a</text>
              <text :x="toSvgX(vertexA.value.x) - 15" :y="toSvgY((vertexA.value.y + vertexC.value.y) / 2)" 
                text-anchor="end" class="fill-slate-600 text-sm font-mono">b</text>
              <text :x="toSvgX((vertexB.value.x + vertexC.value.x) / 2)" :y="toSvgY((vertexB.value.y + vertexC.value.y) / 2) - 10" 
                text-anchor="middle" class="fill-slate-600 text-sm font-mono">c</text>

              <!-- Angle arc at vertex B -->
              <path 
                :d="`M ${toSvgX(vertexB.value.x - 1)} ${toSvgY(vertexB.value.y)} A 30 30 0 0 1 ${toSvgX(vertexB.value.x - Math.cos(angleBeta) * 1)} ${toSvgY(Math.sin(angleBeta) * 1)}`"
                fill="none" stroke="#10B981" stroke-width="2"
              />
              <text 
                :x="toSvgX(vertexB.value.x - 1.3)" 
                :y="toSvgY(0.3)" 
                class="fill-emerald-600 text-sm font-bold"
              >β</text>

              <!-- Angle arc at vertex C (α) -->
              <path 
                :d="`M ${toSvgX(vertexC.value.x + 0.5)} ${toSvgY(vertexC.value.y - 0.5)} A 25 25 0 0 0 ${toSvgX(Math.sin(angleAlpha) * 0.5)} ${toSvgY(vertexC.value.y - Math.cos(angleAlpha) * 0.5)}`"
                fill="none" stroke="#6366F1" stroke-width="2"
              />
              <text 
                :x="toSvgX(0.4)" 
                :y="toSvgY(vertexC.value.y - 0.6)" 
                class="fill-indigo-600 text-sm font-bold"
              >α</text>

              <!-- Right angle marker at A -->
              <rect 
                :x="toSvgX(0)" 
                :y="toSvgY(0.3)" 
                width="20" height="20" 
                fill="none" stroke="#64748B" stroke-width="1"
                transform="translate(0, -20)"
              />

              <!-- Vertex markers -->
              <!-- Vertex A (fixed, right angle) -->
              <circle 
                :cx="toSvgX(vertexA.x)" 
                :cy="toSvgY(vertexA.y)" 
                r="6" 
                fill="#EC4899" 
                stroke="white" 
                stroke-width="2"
              />
              <text :x="toSvgX(vertexA.x) - 12" :y="toSvgY(vertexA.y) + 20" class="fill-pink-600 text-sm font-bold">A</text>

              <!-- Vertex B (draggable, on x-axis) -->
              <circle 
                :cx="toSvgX(vertexB.x)" 
                :cy="toSvgY(vertexB.y)" 
                r="8" 
                fill="#3B82F6" 
                stroke="white" 
                stroke-width="2"
                class="cursor-move hover:scale-110 transition-transform"
                @mousedown="startDrag('B', $event)"
              />
              <text :x="toSvgX(vertexB.x)" :y="toSvgY(vertexB.y) + 25" text-anchor="middle" class="fill-blue-600 text-sm font-bold">B</text>

              <!-- Vertex C (draggable, on y-axis) -->
              <circle 
                :cx="toSvgX(vertexC.x)" 
                :cy="toSvgY(vertexC.y)" 
                r="8" 
                fill="#3B82F6" 
                stroke="white" 
                stroke-width="2"
                class="cursor-move hover:scale-110 transition-transform"
                @mousedown="startDrag('C', $event)"
              />
              <text :x="toSvgX(vertexC.x) - 12" :y="toSvgY(vertexC.y)" class="fill-blue-600 text-sm font-bold">C</text>

              <!-- SOH visualization (when active) -->
              <g v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'sohcahtoa'">
                <!-- Highlight opposite side -->
                <line 
                  :x1="toSvgX(vertexA.x)" 
                  :y1="toSvgY(vertexA.y)" 
                  :x2="toSvgX(vertexC.x)" 
                  :y2="toSvgY(vertexC.y)"
                  stroke="#F97316" stroke-width="4" stroke-dasharray="8,4" opacity="0.5"
                />
                <!-- Highlight adjacent side -->
                <line 
                  :x1="toSvgX(vertexA.x)" 
                  :y1="toSvgY(vertexA.y)" 
                  :x2="toSvgX(vertexB.x)" 
                  :y2="toSvgY(vertexB.y)"
                  stroke="#10B981" stroke-width="4" stroke-dasharray="8,4" opacity="0.5"
                />
              </g>

              <!-- Challenge markings -->
              <g v-if="challengeActive">
                <text 
                  :x="svgWidth / 2" 
                  :y="30" 
                  text-anchor="middle" 
                  class="fill-brand-orange text-base font-bold"
                >{{ challengeType === 'find-angle' ? 'Bereken hoek β' : challengeType === 'find-side' ? `Bereken zijde ${challengeTargetSideLabel}` : `Bereken ${challengeTargetSideLabel}` }}</text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span class="text-slate-600">Hoek A (90°)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span class="text-slate-600">Hoekpunten B, C (sleepbaar)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-emerald-500"></div>
                  <span class="text-slate-600">Hoek β</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-indigo-500"></div>
                  <span class="text-slate-600">Hoek α</span>
                </div>
              </div>
            </div>

            <!-- Instructions overlay -->
            <div v-if="currentMode === 'analysis'" class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <p class="text-xs text-slate-600">
                <span class="font-bold">Tip:</span> Sleep de blauwe punten B en C om de driehoek aan te passen.
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

.cursor-move {
  cursor: move;
}

.cursor-crosshair {
  cursor: crosshair;
}
</style>
