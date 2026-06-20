<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhArrowsOut, PhArrowsIn, PhTriangle, PhIntersect,
  PhChartLineUp, PhArrowRight, PhArrowLeft, PhCalculator,
  PhCheckCircle, PhRuler, PhSquare, PhCube
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const analysisSubMode = ref('scale') // 'scale', 'triangles', 'thales'

// Scale factor parameters
const scaleFactor = ref(2)
const baseShape = ref('triangle') // 'triangle', 'rectangle', 'cube'
const baseLength = ref(3)
const baseWidth = ref(2)

// Similar triangles parameters
const triangleA = ref({ a: 3, b: 4, c: 5 })
const triangleScale = ref(1.5)
const showAngles = ref(true)
const showRatios = ref(true)

// Thales theorem parameters
const thalesRatio = ref(0.6)
const thalesBase = ref(6)
const thalesHeight = ref(4)
const showParallel = ref(true)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'scale-calc', 'triangle-check', 'thales-calc'
const challengeSolved = ref(false)
const challengeFeedback = ref('')

// Challenge targets
const targetScale = ref(1)
const targetLength = ref(0)
const targetArea = ref(0)
const userScaleAnswer = ref(1)
const userLengthAnswer = ref(0)
const userAreaAnswer = ref(0)

// ==================== COMPUTED PROPERTIES ====================
// Scale calculations
const scaledLength = computed(() => baseLength.value * scaleFactor.value)
const scaledWidth = computed(() => baseWidth.value * scaleFactor.value)
const areaScale = computed(() => scaleFactor.value ** 2)
const volumeScale = computed(() => scaleFactor.value ** 3)

const baseArea = computed(() => {
  if (baseShape.value === 'triangle') return (baseLength.value * baseWidth.value) / 2
  if (baseShape.value === 'rectangle') return baseLength.value * baseWidth.value
  if (baseShape.value === 'cube') return baseLength.value ** 2
  return 0
})

const scaledArea = computed(() => baseArea.value * areaScale.value)

// Similar triangle calculations
const triangleB = computed(() => ({
  a: triangleA.value.a * triangleScale.value,
  b: triangleA.value.b * triangleScale.value,
  c: triangleA.value.c * triangleScale.value
}))

const sideRatios = computed(() => [
  triangleB.value.a / triangleA.value.a,
  triangleB.value.b / triangleA.value.b,
  triangleB.value.c / triangleA.value.c
])

// Thales theorem calculations
const thalesSegment1 = computed(() => thalesBase.value * thalesRatio.value)
const thalesSegment2 = computed(() => thalesBase.value * (1 - thalesRatio.value))
const parallelY = computed(() => thalesHeight.value * (1 - thalesRatio.value))

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -10
const viewBoxY = -8
const viewBoxWidth = 20
const viewBoxHeight = 16

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// Triangle path generator
function generateTrianglePath(triangle, offsetX = 0, offsetY = 0) {
  const A = { x: offsetX, y: offsetY }
  const B = { x: offsetX + triangle.b, y: offsetY }
  const C = { x: offsetX, y: offsetY + triangle.a }
  
  return `M ${toSvgX(A.x)} ${toSvgY(A.y)} L ${toSvgX(B.x)} ${toSvgY(B.y)} L ${toSvgX(C.x)} ${toSvgY(C.y)} Z`
}

// Rectangle path generator
function generateRectanglePath(width, height, offsetX = 0, offsetY = 0) {
  const x1 = offsetX
  const y1 = offsetY
  const x2 = offsetX + width
  const y2 = offsetY + height
  
  return `M ${toSvgX(x1)} ${toSvgY(y1)} L ${toSvgX(x2)} ${toSvgY(y1)} L ${toSvgX(x2)} ${toSvgY(y2)} L ${toSvgX(x1)} ${toSvgY(y2)} Z`
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'scale-calc') {
    targetScale.value = Math.round((Math.random() * 3 + 0.5) * 10) / 10
    const baseL = Math.round(Math.random() * 5 + 2)
    targetLength.value = baseL
    targetArea.value = baseL * baseL
    userScaleAnswer.value = 1
    userLengthAnswer.value = baseL
    userAreaAnswer.value = baseL * baseL
  } else if (type === 'triangle-check') {
    targetScale.value = Math.round((Math.random() * 2 + 0.5) * 10) / 10
    triangleScale.value = targetScale.value
    userScaleAnswer.value = 1
  } else if (type === 'thales-calc') {
    thalesRatio.value = Math.round(Math.random() * 6 + 2) / 10
    thalesBase.value = Math.round(Math.random() * 4 + 6)
    targetScale.value = 1 - thalesRatio.value
    userScaleAnswer.value = 0.5
  }
}

function checkChallenge() {
  const tolerance = 0.1
  
  if (challengeType.value === 'scale-calc') {
    const scaleCorrect = Math.abs(userScaleAnswer.value - targetScale.value) < tolerance
    const lengthCorrect = Math.abs(userLengthAnswer.value - targetLength.value * targetScale.value) < tolerance
    const areaCorrect = Math.abs(userAreaAnswer.value - targetArea.value * targetScale.value ** 2) < tolerance
    
    if (scaleCorrect && lengthCorrect && areaCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Je hebt de schaalfactor correct toegepast op lengte en oppervlakte.'
    } else {
      const errors = []
      if (!scaleCorrect) errors.push('schaalfactor')
      if (!lengthCorrect) errors.push('lengte')
      if (!areaCorrect) errors.push('oppervlakte')
      challengeFeedback.value = `Nog niet juist. Controleer: ${errors.join(', ')}.`
    }
  } else if (challengeType.value === 'triangle-check') {
    const scaleCorrect = Math.abs(userScaleAnswer.value - targetScale.value) < tolerance
    if (scaleCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De driehoeken zijn gelijkvormig met deze schaalfactor.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Vergelijk de overeenkomstige zijden.'
    }
  } else if (challengeType.value === 'thales-calc') {
    const ratioCorrect = Math.abs(userScaleAnswer.value - targetScale.value) < tolerance
    if (ratioCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Je hebt de stelling van Thales correct toegepast.'
    } else {
      challengeFeedback.value = 'Nog niet juist. De verhoudingen moeten gelijk zijn.'
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
const scaleSteps = [
  {
    title: 'De schaalfactor',
    description: 'De schaalfactor k geeft aan met welke factor alle lengtes vermenigvuldigd worden.',
    focus: 'scale-factor',
    instruction: 'Wijzig de schaalfactor en observeer het effect op de figuur.',
    details: [
      'k > 1: vergroting',
      '0 < k < 1: verkleining',
      'k = 1: origineel formaat'
    ]
  },
  {
    title: 'Effect op omtrek en oppervlakte',
    description: 'Bij schaling verandert niet alleen de vorm, maar ook de omtrek en het oppervlakte.',
    focus: 'area-effect',
    instruction: 'Observeer hoe omtrek en oppervlakte veranderen.',
    details: [
      'Omtrek × k',
      'Oppervlakte × k²',
      'Volume × k³ (bij 3D)'
    ]
  },
  {
    title: 'Vergelijking van figuren',
    description: 'Gelijkvormige figuren hebben dezelfde vorm, maar verschillende afmetingen.',
    focus: 'comparison',
    instruction: 'Vergelijk de hoeken en zijdeverhoudingen.',
    details: [
      'Hoeken blijven gelijk',
      'Zijden zijn evenredig',
      'Vorm blijft behouden'
    ]
  }
]

const triangleSteps = [
  {
    title: 'Kenmerken van gelijkvormige driehoeken',
    description: 'Twee driehoeken zijn gelijkvormig als ze aan bepaalde voorwaarden voldoen.',
    focus: 'characteristics',
    instruction: 'Bestudeer de hoeken en zijdeverhoudingen.',
    details: [
      'Hoek-hoek-hoek (HHH): alle hoeken gelijk',
      'Zijde-hoek-zijde (ZHZ): 2 zijden evenredig + inclusieve hoek',
      'Zijde-zijde-zijde (ZZZ): alle zijden evenredig'
    ]
  },
  {
    title: 'Zijdeverhoudingen',
    description: 'Bij gelijkvormige driehoeken zijn de overeenkomstige zijden evenredig.',
    focus: 'ratios',
    instruction: 'Controleer dat alle zijdeverhoudingen gelijk zijn.',
    details: [
      'a₁/a₂ = b₁/b₂ = c₁/c₂ = k',
      'Deze verhouding is de schaalfactor',
      'Omgekeerd: a₂/a₁ = 1/k'
    ]
  }
]

const thalesSteps = [
  {
    title: 'Stelling van Thales',
    description: 'Als een lijn evenwijdig is aan één zijde van een driehoek, ontstaan gelijkvormige driehoeken.',
    focus: 'theorem',
    instruction: 'Verplaats de evenwijdige lijn en observeer de verhoudingen.',
    details: [
      'Een lijn evenwijdig aan BC',
      'Snijdt AB in D en AC in E',
      'Dan is ΔADE ~ ΔABC'
    ]
  },
  {
    title: 'Verhoudingen bij Thales',
    description: 'De snijpunten verdelen de zijden in dezelfde verhouding.',
    focus: 'ratios',
    instruction: 'Controleer de verhoudingen AD/AB en AE/AC.',
    details: [
      'AD/AB = AE/AC = DE/BC',
      'De kleine driehoek is een verkleining',
      'Schaalfactor = AD/AB'
    ]
  }
]

const currentSteps = computed(() => {
  if (analysisSubMode.value === 'scale') return scaleSteps
  if (analysisSubMode.value === 'triangles') return triangleSteps
  return thalesSteps
})

function nextStep() {
  if (currentStep.value < currentSteps.value.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function setSubMode(mode) {
  analysisSubMode.value = mode
  currentStep.value = 0
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhArrowsOut class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Gelijkvormigheid</h1>
            <p class="text-sm text-slate-500">Schaal, gelijkvormige driehoeken en stelling van Thales</p>
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
            <!-- Sub Mode Selection -->
            <div class="p-4 border-b border-slate-200">
              <div class="flex gap-2">
                <button 
                  @click="setSubMode('scale')"
                  :class="['flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all', 
                    analysisSubMode === 'scale' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  Schaal
                </button>
                <button 
                  @click="setSubMode('triangles')"
                  :class="['flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all', 
                    analysisSubMode === 'triangles' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  Driehoeken
                </button>
                <button 
                  @click="setSubMode('thales')"
                  :class="['flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all', 
                    analysisSubMode === 'thales' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  Thales
                </button>
              </div>
            </div>

            <!-- Step Navigation -->
            <div class="p-4 border-b border-slate-200">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stap {{ currentStep + 1 }} van {{ currentSteps.length }}</span>
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
                    :disabled="currentStep === currentSteps.length - 1"
                    class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhArrowRight class="text-lg" />
                  </button>
                </div>
              </div>
              <h2 class="text-base font-bold text-slate-800 mb-1">{{ currentSteps[currentStep].title }}</h2>
              <p class="text-sm text-slate-600">{{ currentSteps[currentStep].description }}</p>
            </div>

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ currentSteps[currentStep].instruction }}</p>
              
              <!-- Scale Factor Mode -->
              <template v-if="analysisSubMode === 'scale'">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Schaalfactor k</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ scaleFactor }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="scaleFactor" 
                    min="0.25" 
                    max="4" 
                    step="0.25"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>0.25×</span>
                    <span>1×</span>
                    <span>4×</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Figuur</label>
                  <div class="flex gap-2">
                    <button 
                      @click="baseShape = 'triangle'"
                      :class="['flex-1 py-2 px-3 text-sm rounded-lg border transition-all', 
                        baseShape === 'triangle' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 text-slate-600 hover:border-slate-300']"
                    >
                      Driehoek
                    </button>
                    <button 
                      @click="baseShape = 'rectangle'"
                      :class="['flex-1 py-2 px-3 text-sm rounded-lg border transition-all', 
                        baseShape === 'rectangle' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 text-slate-600 hover:border-slate-300']"
                    >
                      Rechthoek
                    </button>
                    <button 
                      @click="baseShape = 'cube'"
                      :class="['flex-1 py-2 px-3 text-sm rounded-lg border transition-all', 
                        baseShape === 'cube' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 text-slate-600 hover:border-slate-300']"
                    >
                      Vierkant
                    </button>
                  </div>
                </div>

                <div v-if="currentSteps[currentStep].focus === 'area-effect' || currentSteps[currentStep].focus === 'comparison'" 
                     class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">Basis lengte:</span>
                    <span class="font-mono">{{ baseLength }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-600">Geschaalde lengte:</span>
                    <span class="font-mono text-brand-orange">{{ scaledLength.toFixed(2) }}</span>
                  </div>
                  <div class="border-t border-slate-200 pt-2 mt-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600">Basis oppervlakte:</span>
                      <span class="font-mono">{{ baseArea.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600">Geschaalde opp.:</span>
                      <span class="font-mono text-brand-orange">{{ scaledArea.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                      <span class="text-slate-600">Verhouding opp.:</span>
                      <span class="font-mono text-emerald-600">×{{ areaScale.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Similar Triangles Mode -->
              <template v-if="analysisSubMode === 'triangles'">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Schaalfactor k</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ triangleScale }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="triangleScale" 
                    min="0.5" 
                    max="2.5" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" v-model="showAngles" class="rounded text-brand-orange focus:ring-brand-orange">
                    <span>Toon hoeken</span>
                  </label>
                  <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" v-model="showRatios" class="rounded text-brand-orange focus:ring-brand-orange">
                    <span>Toon verhoudingen</span>
                  </label>
                </div>

                <div v-if="currentSteps[currentStep].focus === 'ratios'" 
                     class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-2">Zijdeverhoudingen:</p>
                  <div class="space-y-1 text-sm font-mono">
                    <div class="flex justify-between">
                      <span class="text-slate-600">a₂/a₁ =</span>
                      <span class="text-brand-orange">{{ sideRatios[0].toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">b₂/b₁ =</span>
                      <span class="text-brand-orange">{{ sideRatios[1].toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">c₂/c₁ =</span>
                      <span class="text-brand-orange">{{ sideRatios[2].toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Thales Mode -->
              <template v-if="analysisSubMode === 'thales'">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-brand-dark">Verhouding AD/AB</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ thalesRatio.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="thalesRatio" 
                    min="0.2" 
                    max="0.8" 
                    step="0.05"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-bold text-slate-700">Basis (AB)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ thalesBase }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="thalesBase" 
                    min="4" 
                    max="10" 
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
                </div>

                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" v-model="showParallel" class="rounded text-brand-orange focus:ring-brand-orange">
                  <span>Toon evenwijdige lijn</span>
                </label>

                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">AD =</span>
                    <span class="font-mono">{{ thalesSegment1.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">DB =</span>
                    <span class="font-mono">{{ thalesSegment2.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span class="text-slate-600">Verhouding:</span>
                    <span class="font-mono text-brand-orange">{{ thalesRatio.toFixed(2) }}</span>
                  </div>
                </div>
              </template>

              <!-- Educational details -->
              <div v-if="currentSteps[currentStep].details" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <ul class="space-y-1 text-sm text-slate-600">
                  <li v-for="(detail, idx) in currentSteps[currentStep].details" :key="idx" class="flex items-start gap-2">
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
              <p class="text-sm text-slate-600">Test je kennis van gelijkvormigheid.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een oefening:</p>
                
                <button @click="generateChallenge('scale-calc')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Schaal berekenen</div>
                  <div class="text-xs text-slate-500 mt-1">Bereken de nieuwe lengte en oppervlakte.</div>
                </button>
                
                <button @click="generateChallenge('triangle-check')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gelijkvormigheid controleren</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal de schaalfactor van twee driehoeken.</div>
                </button>
                
                <button @click="generateChallenge('thales-calc')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Stelling van Thales toepassen</div>
                  <div class="text-xs text-slate-500 mt-1">Gebruik de stelling om de verhouding te vinden.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-1">Bepaal de juiste waarden:</p>
                  
                  <div v-if="challengeType === 'scale-calc'" class="text-xs text-white/80 space-y-1">
                    <p>Een figuur wordt vergroot met schaalfactor k = {{ targetScale }}</p>
                    <p>Basis lengte: {{ targetLength }}, basis oppervlakte: {{ targetArea }}</p>
                    <p class="text-white/60 mt-2">Tip: lengte × k, oppervlakte × k²</p>
                  </div>
                  
                  <div v-if="challengeType === 'triangle-check'" class="text-xs text-white/80 space-y-1">
                    <p>Twee driehoeken zijn gelijkvormig.</p>
                    <p>Bepaal de schaalfactor k.</p>
                    <p class="text-white/60 mt-2">Tip: vergelijk overeenkomstige zijden</p>
                  </div>
                  
                  <div v-if="challengeType === 'thales-calc'" class="text-xs text-white/80 space-y-1">
                    <p>In driehoek ABC is DE evenwijdig aan BC.</p>
                    <p>AD/AB = {{ thalesRatio.toFixed(2) }}</p>
                    <p class="text-white/60 mt-2">Tip: DE/BC = AD/AB</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div v-if="challengeType === 'scale-calc'" class="space-y-3">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Nieuwe lengte</label>
                      <input 
                        type="number" 
                        v-model.number="userLengthAnswer" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Nieuwe oppervlakte</label>
                      <input 
                        type="number" 
                        v-model.number="userAreaAnswer" 
                        step="0.1"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </div>

                  <div v-else class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Schaalfactor / Verhouding</label>
                    <input 
                      type="number" 
                      v-model.number="userScaleAnswer" 
                      step="0.05"
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
            
            <template v-if="analysisSubMode === 'scale' || currentMode === 'derivation'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Schaalfactor:</span>
                  <span class="font-mono text-brand-orange">k = {{ scaleFactor }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Lengte factor:</span>
                  <span class="font-mono">× k</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Oppervlakte factor:</span>
                  <span class="font-mono">× k² = {{ areaScale.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Volume factor:</span>
                  <span class="font-mono">× k³ = {{ volumeScale.toFixed(2) }}</span>
                </div>
              </div>
            </template>

            <template v-if="analysisSubMode === 'triangles'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Schaalfactor:</span>
                  <span class="font-mono text-brand-orange">k = {{ triangleScale }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Zijdeverhouding:</span>
                  <span class="font-mono">{{ sideRatios[0].toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Omtrek Δ₂:</span>
                  <span class="font-mono">{{ (triangleScale * (triangleA.a + triangleA.b + triangleA.c)).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Oppervlakte Δ₂:</span>
                  <span class="font-mono">{{ (triangleScale ** 2 * (triangleA.a * triangleA.b / 2)).toFixed(2) }}</span>
                </div>
              </div>
            </template>

            <template v-if="analysisSubMode === 'thales'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">AD/AB =</span>
                  <span class="font-mono text-brand-orange">{{ thalesRatio.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">AE/AC =</span>
                  <span class="font-mono">{{ thalesRatio.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">DE/BC =</span>
                  <span class="font-mono">{{ thalesRatio.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Kleine Δ schaal:</span>
                  <span class="font-mono">{{ (1 - thalesRatio).toFixed(2) }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Scale Mode Visualization -->
          <template v-if="analysisSubMode === 'scale' || (currentMode === 'derivation' && challengeType === 'scale-calc')">
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-6">
                <div class="text-center">
                  <span class="text-xs text-slate-500 block mb-1">Schaalfactor</span>
                  <span class="text-2xl font-mono font-bold text-brand-orange">k = {{ scaleFactor }}</span>
                </div>
                <div class="h-8 w-px bg-slate-200"></div>
                <div class="text-center">
                  <span class="text-xs text-slate-500 block mb-1">Oppervlakte factor</span>
                  <span class="text-lg font-mono text-slate-700">k² = {{ areaScale.toFixed(2) }}</span>
                </div>
              </div>
            </div>

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
                  <line v-for="i in 17" :key="`h${i}`" 
                    x1="0" :y1="toSvgY(-8 + i)" 
                    :x2="svgWidth" :y2="toSvgY(-8 + i)" 
                  />
                </g>

                <!-- Axes -->
                <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
                <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

                <!-- Base shape -->
                <g v-if="baseShape === 'triangle'">
                  <path 
                    :d="generateTrianglePath({a: baseLength, b: baseWidth, c: Math.sqrt(baseLength**2 + baseWidth**2)}, -6, -3)"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(-6 + baseWidth/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-blue-600 text-sm font-bold">Origineel</text>
                </g>

                <g v-if="baseShape === 'rectangle'">
                  <path 
                    :d="generateRectanglePath(baseWidth, baseLength, -6, -3)"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(-6 + baseWidth/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-blue-600 text-sm font-bold">Origineel</text>
                </g>

                <g v-if="baseShape === 'cube'">
                  <path 
                    :d="generateRectanglePath(baseLength, baseLength, -6, -3)"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(-6 + baseLength/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-blue-600 text-sm font-bold">Origineel</text>
                </g>

                <!-- Scaled shape -->
                <g v-if="baseShape === 'triangle'">
                  <path 
                    :d="generateTrianglePath({a: scaledLength, b: scaledWidth, c: Math.sqrt(scaledLength**2 + scaledWidth**2)}, 1, -3)"
                    fill="rgba(249, 115, 22, 0.1)"
                    stroke="#F97316"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(1 + scaledWidth/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-orange-600 text-sm font-bold">Geschaald</text>
                </g>

                <g v-if="baseShape === 'rectangle'">
                  <path 
                    :d="generateRectanglePath(scaledWidth, scaledLength, 1, -3)"
                    fill="rgba(249, 115, 22, 0.1)"
                    stroke="#F97316"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(1 + scaledWidth/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-orange-600 text-sm font-bold">Geschaald</text>
                </g>

                <g v-if="baseShape === 'cube'">
                  <path 
                    :d="generateRectanglePath(scaledLength, scaledLength, 1, -3)"
                    fill="rgba(249, 115, 22, 0.1)"
                    stroke="#F97316"
                    stroke-width="3"
                  />
                  <text :x="toSvgX(1 + scaledLength/2)" :y="toSvgY(-3 - 0.5)" text-anchor="middle" class="fill-orange-600 text-sm font-bold">Geschaald</text>
                </g>

                <!-- Dimension labels -->
                <text :x="toSvgX(-6 + baseWidth/2)" :y="toSvgY(-3 + baseLength + 1)" text-anchor="middle" class="fill-slate-500 text-xs">lengte: {{ baseLength }}</text>
                <text :x="toSvgX(1 + scaledWidth/2)" :y="toSvgY(-3 + scaledLength + 1)" text-anchor="middle" class="fill-orange-500 text-xs">lengte: {{ scaledLength.toFixed(2) }}</text>
              </svg>

              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-blue-500"></div>
                    <span class="text-slate-600">Origineel</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-orange-500"></div>
                    <span class="text-slate-600">Geschaald (k = {{ scaleFactor }})</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Similar Triangles Visualization -->
          <template v-if="analysisSubMode === 'triangles' || (currentMode === 'derivation' && challengeType === 'triangle-check')">
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-6">
                <span class="text-sm text-slate-500">Gelijkvormige driehoeken:</span>
                <span class="text-xl font-mono font-bold text-brand-orange">ΔABC ~ ΔA'B'C'</span>
              </div>
            </div>

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
                  <line v-for="i in 17" :key="`h${i}`" 
                    x1="0" :y1="toSvgY(-8 + i)" 
                    :x2="svgWidth" :y2="toSvgY(-8 + i)" 
                  />
                </g>

                <!-- Axes -->
                <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
                <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

                <!-- Triangle A (original) -->
                <path 
                  :d="generateTrianglePath(triangleA, -6, -4)"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="3"
                />

                <!-- Triangle B (scaled) -->
                <path 
                  :d="generateTrianglePath(triangleB, 2, -4)"
                  fill="rgba(249, 115, 22, 0.1)"
                  stroke="#F97316"
                  stroke-width="3"
                />

                <!-- Vertex labels Triangle A -->
                <text :x="toSvgX(-6) - 15" :y="toSvgY(-4)" text-anchor="end" class="fill-blue-600 text-sm font-bold">A</text>
                <text :x="toSvgX(-6 + triangleA.b) + 10" :y="toSvgY(-4)" text-anchor="start" class="fill-blue-600 text-sm font-bold">B</text>
                <text :x="toSvgX(-6) - 15" :y="toSvgY(-4 + triangleA.a)" text-anchor="end" class="fill-blue-600 text-sm font-bold">C</text>

                <!-- Vertex labels Triangle B -->
                <text :x="toSvgX(2) - 15" :y="toSvgY(-4)" text-anchor="end" class="fill-orange-600 text-sm font-bold">A'</text>
                <text :x="toSvgX(2 + triangleB.b) + 10" :y="toSvgY(-4)" text-anchor="start" class="fill-orange-600 text-sm font-bold">B'</text>
                <text :x="toSvgX(2) - 15" :y="toSvgY(-4 + triangleB.a)" text-anchor="end" class="fill-orange-600 text-sm font-bold">C'</text>

                <!-- Side labels -->
                <text :x="toSvgX(-6 + triangleA.b/2)" :y="toSvgY(-4) - 10" text-anchor="middle" class="fill-blue-500 text-xs">{{ triangleA.b }}</text>
                <text :x="toSvgX(-6) - 20" :y="toSvgY(-4 + triangleA.a/2)" text-anchor="middle" class="fill-blue-500 text-xs">{{ triangleA.a }}</text>
                
                <text :x="toSvgX(2 + triangleB.b/2)" :y="toSvgY(-4) - 10" text-anchor="middle" class="fill-orange-500 text-xs">{{ triangleB.b.toFixed(1) }}</text>
                <text :x="toSvgX(2) - 25" :y="toSvgY(-4 + triangleB.a/2)" text-anchor="middle" class="fill-orange-500 text-xs">{{ triangleB.a.toFixed(1) }}</text>

                <!-- Ratio annotations -->
                <g v-if="showRatios">
                  <text :x="toSvgX(-2)" :y="toSvgY(-5)" text-anchor="middle" class="fill-slate-500 text-xs">k = {{ triangleScale }}</text>
                  <line :x1="toSvgX(-3.5)" :y1="toSvgY(-4.5)" :x2="toSvgX(-0.5)" :y2="toSvgY(-4.5)" stroke="#94A3B8" stroke-width="1" marker-end="url(#arrow)"/>
                </g>

                <!-- Angle markers (simplified) -->
                <g v-if="showAngles">
                  <path :d="`M ${toSvgX(-6 + 0.5)} ${toSvgY(-4)} A 20 20 0 0 1 ${toSvgX(-6)} ${toSvgY(-4 + 0.5)}`" fill="none" stroke="#3B82F6" stroke-width="1"/>
                  <path :d="`M ${toSvgX(2 + 0.5 * triangleScale)} ${toSvgY(-4)} A ${20 * triangleScale} ${20 * triangleScale} 0 0 1 ${toSvgX(2)} ${toSvgY(-4 + 0.5 * triangleScale)}`" fill="none" stroke="#F97316" stroke-width="1"/>
                </g>

                <!-- Arrow marker definition -->
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
                  </marker>
                </defs>
              </svg>

              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-blue-500"></div>
                    <span class="text-slate-600">ΔABC (origineel)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-orange-500"></div>
                    <span class="text-slate-600">ΔA'B'C' (geschaald)</span>
                  </div>
                  <div class="pt-1 border-t border-slate-200">
                    <span class="text-slate-500">Schaalfactor: k = {{ triangleScale }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Thales Theorem Visualization -->
          <template v-if="analysisSubMode === 'thales' || (currentMode === 'derivation' && challengeType === 'thales-calc')">
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-6">
                <span class="text-sm text-slate-500">Stelling van Thales:</span>
                <span class="text-lg font-mono text-brand-orange">DE ∥ BC ⇒ ΔADE ~ ΔABC</span>
              </div>
            </div>

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
                  <line v-for="i in 17" :key="`h${i}`" 
                    x1="0" :y1="toSvgY(-8 + i)" 
                    :x2="svgWidth" :y2="toSvgY(-8 + i)" 
                  />
                </g>

                <!-- Axes -->
                <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
                <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

                <!-- Main triangle ABC -->
                <path 
                  :d="`M ${toSvgX(-5)} ${toSvgY(-4)} L ${toSvgX(-5 + thalesBase)} ${toSvgY(-4)} L ${toSvgX(-5)} ${toSvgY(-4 + thalesHeight)} Z`"
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="#3B82F6"
                  stroke-width="3"
                />

                <!-- Parallel line DE -->
                <g v-if="showParallel">
                  <line 
                    :x1="toSvgX(-5)" 
                    :y1="toSvgY(-4 + parallelY)" 
                    :x2="toSvgX(-5 + thalesBase * (1 - thalesRatio))" 
                    :y2="toSvgY(-4 + parallelY)"
                    stroke="#F97316"
                    stroke-width="3"
                    stroke-dasharray="5,3"
                  />
                  <line 
                    :x1="toSvgX(-5)" 
                    :y1="toSvgY(-4 + parallelY)" 
                    :x2="toSvgX(-5)" 
                    :y2="toSvgY(-4 + thalesHeight)"
                    stroke="#F97316"
                    stroke-width="2"
                  />
                </g>

                <!-- Vertex labels -->
                <text :x="toSvgX(-5) - 15" :y="toSvgY(-4)" text-anchor="end" class="fill-blue-600 text-lg font-bold">A</text>
                <text :x="toSvgX(-5 + thalesBase) + 10" :y="toSvgY(-4)" text-anchor="start" class="fill-blue-600 text-lg font-bold">B</text>
                <text :x="toSvgX(-5) - 15" :y="toSvgY(-4 + thalesHeight)" text-anchor="end" class="fill-blue-600 text-lg font-bold">C</text>

                <g v-if="showParallel">
                  <text :x="toSvgX(-5) - 15" :y="toSvgY(-4 + parallelY)" text-anchor="end" class="fill-orange-600 text-sm font-bold">D</text>
                  <text :x="toSvgX(-5 + thalesBase * (1 - thalesRatio)) + 10" :y="toSvgY(-4 + parallelY)" text-anchor="start" class="fill-orange-600 text-sm font-bold">E</text>
                </g>

                <!-- Measurements -->
                <text :x="toSvgX(-5 + thalesBase/2)" :y="toSvgY(-4) - 15" text-anchor="middle" class="fill-blue-500 text-sm font-bold">AB = {{ thalesBase }}</text>
                <text :x="toSvgX(-5) - 25" :y="toSvgY(-4 + thalesHeight/2)" text-anchor="middle" class="fill-blue-500 text-xs">AC = {{ thalesHeight }}</text>

                <g v-if="showParallel">
                  <text :x="toSvgX(-5 + thalesSegment1/2)" :y="toSvgY(-4) + 20" text-anchor="middle" class="fill-orange-500 text-xs">AD = {{ thalesSegment1.toFixed(2) }}</text>
                  <text :x="toSvgX(-5 + thalesBase - thalesSegment2/2)" :y="toSvgY(-4) + 20" text-anchor="middle" class="fill-slate-500 text-xs">DB = {{ thalesSegment2.toFixed(2) }}</text>
                  <text :x="toSvgX(-5) - 25" :y="toSvgY(-4 + thalesHeight - parallelY/2)" text-anchor="middle" class="fill-orange-500 text-xs">AE</text>
                  <text :x="toSvgX(-5 + thalesBase * (1 - thalesRatio)/2)" :y="toSvgY(-4 + parallelY) - 10" text-anchor="middle" class="fill-orange-500 text-xs">DE</text>
                </g>

                <!-- Ratio annotation -->
                <g v-if="showParallel">
                  <rect :x="toSvgX(3) - 5" :y="toSvgY(-2) - 60" width="140" height="100" fill="white" stroke="#E2E8F0" rx="8"/>
                  <text :x="toSvgX(3) + 65" :y="toSvgY(-2) - 40" text-anchor="middle" class="fill-slate-700 text-sm font-bold">Verhoudingen:</text>
                  <text :x="toSvgX(3) + 65" :y="toSvgY(-2) - 20" text-anchor="middle" class="fill-slate-600 text-xs">AD/AB = {{ thalesRatio.toFixed(2) }}</text>
                  <text :x="toSvgX(3) + 65" :y="toSvgY(-2)" text-anchor="middle" class="fill-slate-600 text-xs">AE/AC = {{ thalesRatio.toFixed(2) }}</text>
                  <text :x="toSvgX(3) + 65" :y="toSvgY(-2) + 20" text-anchor="middle" class="fill-slate-600 text-xs">DE/BC = {{ thalesRatio.toFixed(2) }}</text>
                </g>

                <!-- Parallel symbol -->
                <g v-if="showParallel">
                  <line :x1="toSvgX(-5 + 0.5)" :y1="toSvgY(-4 + parallelY - 0.3)" :x2="toSvgX(-5 + 0.5)" :y2="toSvgY(-4 + parallelY + 0.3)" stroke="#64748B" stroke-width="1"/>
                  <line :x1="toSvgX(-5 + 0.8)" :y1="toSvgY(-4 + parallelY - 0.3)" :x2="toSvgX(-5 + 0.8)" :y2="toSvgY(-4 + parallelY + 0.3)" stroke="#64748B" stroke-width="1"/>
                </g>
              </svg>

              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-sm bg-blue-500/20 border-2 border-blue-500"></div>
                    <span class="text-slate-600">ΔABC</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-orange-500" style="border-top: 2px dashed #F97316; height: 0;"></div>
                    <span class="text-slate-600">DE ∥ BC</span>
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

/* Custom checkbox styling */
input[type="checkbox"] {
  accent-color: #F97316;
}
</style>