<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhCircle, PhArrowsIn, PhArrowsOut, 
  PhTriangle, PhTable, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhAngle, PhMathOperations, PhFunction
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentSubMode = ref('circle') // 'circle', 'table', 'triangles'

// Unit circle parameters
const angle = ref(45) // Angle in degrees
const showSinProjection = ref(true)
const showCosProjection = ref(true)
const showAngleArc = ref(true)
const showTangent = ref(false)

// Triangle calculator state
const triangleMode = ref('sides') // 'sides', 'angles'
const sideA = ref(5)
const sideB = ref(4)
const sideC = ref(6)
const angleA = ref(60)
const angleB = ref(45)
const angleC = ref(75)

// Special angles table
const specialAngles = [
  { angle: 0, sin: '0', cos: '1', tan: '0' },
  { angle: 30, sin: '1/2', cos: '√3/2', tan: '1/√3' },
  { angle: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
  { angle: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
  { angle: 90, sin: '1', cos: '0', tan: '∞' },
  { angle: 120, sin: '√3/2', cos: '-1/2', tan: '-√3' },
  { angle: 135, sin: '√2/2', cos: '-√2/2', tan: '-1' },
  { angle: 150, sin: '1/2', cos: '-√3/2', tan: '-1/√3' },
  { angle: 180, sin: '0', cos: '-1', tan: '0' },
  { angle: 210, sin: '-1/2', cos: '-√3/2', tan: '1/√3' },
  { angle: 225, sin: '-√2/2', cos: '-√2/2', tan: '1' },
  { angle: 240, sin: '-√3/2', cos: '-1/2', tan: '√3' },
  { angle: 270, sin: '-1', cos: '0', tan: '∞' },
  { angle: 300, sin: '-√3/2', cos: '1/2', tan: '-√3' },
  { angle: 330, sin: '-1/2', cos: '√3/2', tan: '-1/√3' },
  { angle: 360, sin: '0', cos: '1', tan: '0' }
]

// ==================== COMPUTED PROPERTIES ====================
const angleRad = computed(() => (angle.value * Math.PI) / 180)

// Unit circle coordinates
const unitX = computed(() => Math.cos(angleRad.value))
const unitY = computed(() => Math.sin(angleRad.value))

// Exact values for special angles
const exactValues = computed(() => {
  const special = specialAngles.find(s => s.angle === angle.value)
  if (special) {
    return {
      sin: special.sin,
      cos: special.cos,
      tan: special.tan,
      isSpecial: true
    }
  }
  return {
    sin: Math.sin(angleRad.value).toFixed(3),
    cos: Math.cos(angleRad.value).toFixed(3),
    tan: Math.abs(Math.cos(angleRad.value)) < 0.001 ? '∞' : Math.tan(angleRad.value).toFixed(3),
    isSpecial: false
  }
})

// Related angles
const relatedAngles = computed(() => {
  const a = angle.value % 360
  return [
    { label: 'θ', value: a, formula: `sin(${a}°), cos(${a}°)` },
    { label: '180° - θ', value: 180 - a, formula: `sin(${a}°), -cos(${a}°)` },
    { label: '180° + θ', value: 180 + a, formula: `-sin(${a}°), -cos(${a}°)` },
    { label: '360° - θ', value: 360 - a, formula: `-sin(${a}°), cos(${a}°)` },
    { label: '-θ', value: -a, formula: `-sin(${a}°), cos(${a}°)` }
  ]
})

// Sinus rule calculator
const sinRuleResult = computed(() => {
  // Using law of sines: a/sin(A) = b/sin(B) = c/sin(C)
  const ar = (angleA.value * Math.PI) / 180
  const br = (angleB.value * Math.PI) / 180
  const cr = (angleC.value * Math.PI) / 180
  
  if (triangleMode.value === 'sides') {
    // Given sides, calculate angles
    const ratioA = sideA.value / Math.sin(ar)
    const ratioB = sideB.value / Math.sin(br)
    const ratioC = sideC.value / Math.sin(cr)
    const avgRatio = (ratioA + ratioB + ratioC) / 3
    
    return {
      ratios: { a: ratioA.toFixed(2), b: ratioB.toFixed(2), c: ratioC.toFixed(2) },
      diameter: avgRatio.toFixed(2),
      valid: Math.abs(angleA.value + angleB.value + angleC.value - 180) < 0.1
    }
  } else {
    // Given angles and one side, calculate others
    return {
      message: 'Gebruik de sinusregel: a/sin(A) = b/sin(B) = c/sin(C)',
      valid: Math.abs(angleA.value + angleB.value + angleC.value - 180) < 0.1
    }
  }
})

// Cosinus rule calculator
const cosRuleResult = computed(() => {
  // c² = a² + b² - 2ab·cos(C)
  const cr = (angleC.value * Math.PI) / 180
  const calculatedC = Math.sqrt(
    sideA.value ** 2 + sideB.value ** 2 - 2 * sideA.value * sideB.value * Math.cos(cr)
  )
  
  const ar = (angleA.value * Math.PI) / 180
  const calculatedA = Math.acos(
    (sideB.value ** 2 + sideC.value ** 2 - sideA.value ** 2) / (2 * sideB.value * sideC.value)
  ) * 180 / Math.PI
  
  return {
    sideC: calculatedC.toFixed(2),
    angleA: calculatedA.toFixed(1),
    originalC: sideC.value.toFixed(2)
  }
})

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -1.5
const viewBoxY = -1.5
const viewBoxWidth = 3
const viewBoxHeight = 3

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// Generate angle arc path
const angleArcPath = computed(() => {
  const radius = 0.3
  const startX = toSvgX(radius)
  const startY = toSvgY(0)
  const endX = toSvgX(radius * Math.cos(angleRad.value))
  const endY = toSvgY(radius * Math.sin(angleRad.value))
  const largeArc = angle.value > 180 ? 1 : 0
  
  return `M ${toSvgX(0)} ${toSvgY(0)} L ${startX} ${startY} A ${toSvgX(radius) - toSvgX(0)} ${toSvgY(0) - toSvgY(radius)} 0 ${largeArc} 1 ${endX} ${endY} Z`
})

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
    title: 'De goniometrische cirkel',
    description: 'Een cirkel met straal 1 waarbij sin(θ) en cos(θ) als coördinaten worden weergegeven.',
    focus: 'circle',
    subMode: 'circle',
    instruction: 'Wijzig de hoek θ en observeer de coördinaten op de cirkel.',
    details: [
      'De x-coördinaat = cos(θ)',
      'De y-coördinaat = sin(θ)',
      'De straal is altijd 1'
    ]
  },
  {
    title: 'Projecties op de assen',
    description: 'Sin(θ) en cos(θ) zijn de projecties van het punt op de y-as en x-as.',
    focus: 'projections',
    subMode: 'circle',
    instruction: 'Bekijk de projecties en hun relatieve lengtes.',
    details: [
      'Cosinus: projectie op x-as (horizontaal)',
      'Sinus: projectie op y-as (verticaal)',
      'Beide liggen tussen -1 en 1'
    ]
  },
  {
    title: 'Speciale hoeken',
    description: 'Bekende waarden voor hoeken van 30°, 45°, 60°, en hun verwante hoeken.',
    focus: 'special',
    subMode: 'table',
    instruction: 'Bestudeer de tabel met exacte waarden.',
    details: [
      '30°: sin = 1/2, cos = √3/2',
      '45°: sin = cos = √2/2',
      '60°: sin = √3/2, cos = 1/2'
    ]
  },
  {
    title: 'Verwante hoeken',
    description: 'Formules om goniometrische waarden van verwante hoeken te bepalen.',
    focus: 'related',
    subMode: 'circle',
    instruction: 'Verkijk hoe de tekens veranderen per kwadrant.',
    details: [
      'Kwadrant I: sin +, cos +',
      'Kwadrant II: sin +, cos -',
      'Kwadrant III: sin -, cos -',
      'Kwadrant IV: sin -, cos +'
    ]
  },
  {
    title: 'Sinus- en cosinusregel',
    description: 'Toepassing op willekeurige driehoeken.',
    focus: 'triangles',
    subMode: 'triangles',
    instruction: 'Experimenteer met zijden en hoeken van een driehoek.',
    details: [
      'Sinusregel: a/sin(A) = b/sin(B) = c/sin(C)',
      'Cosinusregel: c² = a² + b² - 2ab·cos(C)',
      'Som hoeken: A + B + C = 180°'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    currentSubMode.value = analysisSteps[currentStep.value].subMode
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    currentSubMode.value = analysisSteps[currentStep.value].subMode
  }
}

// Challenge mode
const challengeActive = ref(false)
const challengeSolved = ref(false)
const challengeFeedback = ref('')
const challengeType = ref('') // 'unit-circle', 'special-angle', 'triangle'
const targetAngle = ref(0)
const userSin = ref(0)
const userCos = ref(0)

function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'unit-circle') {
    targetAngle.value = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330][Math.floor(Math.random() * 12)]
    userSin.value = 0
    userCos.value = 0
  } else if (type === 'special-angle') {
    targetAngle.value = [30, 45, 60][Math.floor(Math.random() * 3)]
  }
}

function checkChallenge() {
  const tolerance = 0.05
  const targetRad = (targetAngle.value * Math.PI) / 180
  const targetSin = Math.sin(targetRad)
  const targetCos = Math.cos(targetRad)
  
  if (challengeType.value === 'unit-circle') {
    const sinCorrect = Math.abs(userSin.value - targetSin) < tolerance
    const cosCorrect = Math.abs(userCos.value - targetCos) < tolerance
    
    if (sinCorrect && cosCorrect) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! sin(${targetAngle.value}°) = ${targetSin.toFixed(3)}, cos(${targetAngle.value}°) = ${targetCos.toFixed(3)}`
    } else {
      challengeFeedback.value = `Nog niet juist. Controleer de coördinaten voor ${targetAngle.value}°.`
    }
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
            <PhCircle class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">De Goniometrische Cirkel</h1>
            <p class="text-sm text-slate-500">LPD CD 06.04.05, 06.04.06 - Sinus, cosinus en verwante hoeken</p>
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
              Parameteranalyse
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

            <!-- Sub-mode Navigation -->
            <div class="px-4 py-3 border-b border-slate-200">
              <div class="flex gap-2">
                <button 
                  @click="currentSubMode = 'circle'"
                  :class="['flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all', 
                    currentSubMode === 'circle' ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhCircle weight="fill" />
                  <span>Cirkel</span>
                </button>
                <button 
                  @click="currentSubMode = 'table'"
                  :class="['flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all', 
                    currentSubMode === 'table' ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhTable weight="fill" />
                  <span>Tabel</span>
                </button>
                <button 
                  @click="currentSubMode = 'triangles'"
                  :class="['flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all', 
                    currentSubMode === 'triangles' ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhTriangle weight="fill" />
                  <span>Driehoek</span>
                </button>
              </div>
            </div>

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <!-- Unit Circle Controls -->
              <template v-if="currentSubMode === 'circle'">
                <div class="space-y-4">
                  <!-- Angle Slider -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark flex items-center gap-2">
                        <PhAngle weight="fill" />
                        Hoek θ
                      </label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ angle }}°</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="angle" 
                      min="0" 
                      max="360" 
                      step="5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                    <div class="flex justify-between text-xs text-slate-400">
                      <span>0°</span>
                      <span>90°</span>
                      <span>180°</span>
                      <span>270°</span>
                      <span>360°</span>
                    </div>
                  </div>

                  <!-- Toggle Options -->
                  <div class="space-y-2">
                    <p class="text-sm font-bold text-slate-700">Weergave opties</p>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="showSinProjection" class="rounded text-brand-orange">
                      <span class="text-sm text-slate-600">Sinus projectie</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="showCosProjection" class="rounded text-brand-orange">
                      <span class="text-sm text-slate-600">Cosinus projectie</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="showAngleArc" class="rounded text-brand-orange">
                      <span class="text-sm text-slate-600">Hoekboog</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" v-model="showTangent" class="rounded text-brand-orange">
                      <span class="text-sm text-slate-600">Tangenslijn</span>
                    </label>
                  </div>
                </div>
              </template>

              <!-- Triangle Calculator Controls -->
              <template v-if="currentSubMode === 'triangles'">
                <div class="space-y-4">
                  <div class="flex gap-2">
                    <button 
                      @click="triangleMode = 'sides'"
                      :class="['flex-1 py-1.5 text-sm rounded-md transition-all', 
                        triangleMode === 'sides' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                    >
                      Zijden gegeven
                    </button>
                    <button 
                      @click="triangleMode = 'angles'"
                      :class="['flex-1 py-1.5 text-sm rounded-md transition-all', 
                        triangleMode === 'angles' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                    >
                      Hoeken gegeven
                    </button>
                  </div>

                  <!-- Side Inputs -->
                  <div class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Zijden</p>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">a</label>
                        <input 
                          type="number" 
                          v-model.number="sideA" 
                          step="0.1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">b</label>
                        <input 
                          type="number" 
                          v-model.number="sideB" 
                          step="0.1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">c</label>
                        <input 
                          type="number" 
                          v-model.number="sideC" 
                          step="0.1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Angle Inputs -->
                  <div class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Hoeken</p>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">A (°)</label>
                        <input 
                          type="number" 
                          v-model.number="angleA" 
                          step="1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">B (°)</label>
                        <input 
                          type="number" 
                          v-model.number="angleB" 
                          step="1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                      <div>
                        <label class="text-xs text-slate-500 block mb-1">C (°)</label>
                        <input 
                          type="number" 
                          v-model.number="angleC" 
                          step="1"
                          class="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Calculated Results -->
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <p class="text-sm font-bold text-slate-700">Sinusregel controle</p>
                    <div class="text-sm font-mono space-y-1">
                      <p>a/sin(A) = {{ sinRuleResult.ratios.a }}</p>
                      <p>b/sin(B) = {{ sinRuleResult.ratios.b }}</p>
                      <p>c/sin(C) = {{ sinRuleResult.ratios.c }}</p>
                    </div>
                    <div class="border-t border-slate-200 pt-2 mt-2">
                      <p class="text-sm font-bold text-slate-700">Cosinusregel: berekende c</p>
                      <p class="text-sm font-mono">c = {{ cosRuleResult.sideC }} (ingevoerd: {{ cosRuleResult.originalC }})</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Instruction -->
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>

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
              <p class="text-sm text-slate-600">Test je kennis van de goniometrische cirkel.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('unit-circle')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Eenheidscirkel coördinaten</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal sin(θ) en cos(θ) voor een gegeven hoek.</div>
                </button>
                
                <button @click="generateChallenge('special-angle')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Speciale hoeken</div>
                  <div class="text-xs text-slate-500 mt-1">Geef de exacte waarden voor 30°, 45° of 60°.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal de waarden:</p>
                  <div v-if="challengeType === 'unit-circle'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Gegeven hoek: {{ targetAngle }}°</p>
                    <p class="mt-2 text-white/60">Vul sin(θ) en cos(θ) in</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">sin(θ)</label>
                    <input 
                      type="number" 
                      v-model.number="userSin" 
                      step="0.01"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">cos(θ)</label>
                    <input 
                      type="number" 
                      v-model.number="userCos" 
                      step="0.01"
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
            <div class="space-y-2 text-sm">
              <template v-if="currentSubMode === 'circle' || currentSubMode === 'table'">
                <div class="flex justify-between">
                  <span class="text-slate-600">Hoek:</span>
                  <span class="font-mono">{{ angle }}° = {{ (angleRad).toFixed(3) }} rad</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">sin(θ):</span>
                  <span :class="['font-mono', exactValues.isSpecial ? 'text-brand-orange font-bold' : '']">{{ exactValues.sin }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">cos(θ):</span>
                  <span :class="['font-mono', exactValues.isSpecial ? 'text-brand-orange font-bold' : '']">{{ exactValues.cos }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">tan(θ):</span>
                  <span class="font-mono">{{ exactValues.tan }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Coördinaten:</span>
                  <span class="font-mono">({{ unitX.toFixed(3) }}, {{ unitY.toFixed(3) }})</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Kwadrant:</span>
                  <span class="font-mono">
                    <span v-if="angle % 360 <= 90">I (sin+, cos+)</span>
                    <span v-else-if="angle % 360 <= 180">II (sin+, cos-)</span>
                    <span v-else-if="angle % 360 <= 270">III (sin-, cos-)</span>
                    <span v-else>IV (sin-, cos+)</span>
                  </span>
                </div>
              </template>

              <template v-if="currentSubMode === 'triangles'">
                <div class="flex justify-between">
                  <span class="text-slate-600">Som hoeken:</span>
                  <span :class="['font-mono', Math.abs(angleA + angleB + angleC - 180) < 0.1 ? 'text-emerald-600' : 'text-rose-600']">
                    {{ angleA + angleB + angleC }}°
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">2R (omgeschreven cirkel):</span>
                  <span class="font-mono">{{ sinRuleResult.diameter }}</span>
                </div>
                <div class="border-t border-slate-200 pt-2 mt-2 text-xs text-slate-500">
                  <p>Sinusregel: a/sin(A) = b/sin(B) = c/sin(C)</p>
                  <p class="mt-1">Cosinusregel: c² = a² + b² - 2ab·cos(C)</p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Mode: Unit Circle -->
          <template v-if="currentSubMode === 'circle'">
            <!-- Equation Display -->
            <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
              <div class="flex items-center justify-center gap-8">
                <div class="text-center">
                  <span class="text-xs text-slate-500 block mb-1">sin({{ angle }}°)</span>
                  <span class="text-2xl font-mono font-bold text-brand-orange">{{ Math.sin(angleRad).toFixed(3) }}</span>
                </div>
                <div class="text-slate-300">|</div>
                <div class="text-center">
                  <span class="text-xs text-slate-500 block mb-1">cos({{ angle }}°)</span>
                  <span class="text-2xl font-mono font-bold text-brand-orange">{{ Math.cos(angleRad).toFixed(3) }}</span>
                </div>
                <div class="text-slate-300">|</div>
                <div class="text-center">
                  <span class="text-xs text-slate-500 block mb-1">Punt P</span>
                  <span class="text-xl font-mono text-brand-dark">({{ unitX.toFixed(3) }}, {{ unitY.toFixed(3) }})</span>
                </div>
              </div>
            </div>

            <!-- Unit Circle SVG -->
            <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <svg 
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
                class="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- Grid -->
                <g stroke="#E2E8F0" stroke-width="1">
                  <!-- Vertical lines -->
                  <line :x1="toSvgX(-1)" :y1="toSvgY(-1)" :x2="toSvgX(-1)" :y2="toSvgY(1)" />
                  <line :x1="toSvgX(1)" :y1="toSvgY(-1)" :x2="toSvgX(1)" :y2="toSvgY(1)" />
                  <!-- Horizontal lines -->
                  <line :x1="toSvgX(-1)" :y1="toSvgY(-1)" :x2="toSvgX(1)" :y2="toSvgY(-1)" />
                  <line :x1="toSvgX(-1)" :y1="toSvgY(1)" :x2="toSvgX(1)" :y2="toSvgY(1)" />
                </g>

                <!-- Axes -->
                <line :x1="toSvgX(-1.2)" :y1="toSvgY(0)" :x2="toSvgX(1.2)" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />
                <line :x1="toSvgX(0)" :y1="toSvgY(-1.2)" :x2="toSvgX(0)" :y2="toSvgY(1.2)" stroke="#64748B" stroke-width="2" />

                <!-- Axis labels -->
                <text :x="toSvgX(1.1)" :y="toSvgY(0) + 20" class="fill-slate-400 text-sm">cos</text>
                <text :x="toSvgX(0) + 10" :y="toSvgY(1.1) - 5" class="fill-slate-400 text-sm">sin</text>

                <!-- Unit Circle -->
                <circle 
                  :cx="toSvgX(0)" 
                  :cy="toSvgY(0)" 
                  :r="toSvgX(1) - toSvgX(0)" 
                  fill="none" 
                  stroke="#F97316" 
                  stroke-width="3"
                />

                <!-- Angle Arc -->
                <path 
                  v-if="showAngleArc"
                  :d="angleArcPath" 
                  fill="#F97316" 
                  fill-opacity="0.2" 
                  stroke="#F97316" 
                  stroke-width="1"
                />

                <!-- Radius Line -->
                <line 
                  :x1="toSvgX(0)" 
                  :y1="toSvgY(0)" 
                  :x2="toSvgX(unitX)" 
                  :y2="toSvgY(unitY)"
                  stroke="#0B1120" 
                  stroke-width="2"
                />

                <!-- Sine Projection -->
                <g v-if="showSinProjection">
                  <line 
                    :x1="toSvgX(unitX)" 
                    :y1="toSvgY(unitY)" 
                    :x2="toSvgX(0)" 
                    :y2="toSvgY(unitY)"
                    stroke="#10B981" 
                    stroke-width="3"
                    stroke-dasharray="5,3"
                  />
                  <text 
                    :x="toSvgX(0) - 10" 
                    :y="toSvgY(unitY)" 
                    text-anchor="end" 
                    dominant-baseline="middle"
                    class="fill-emerald-600 text-sm font-bold"
                  >
                    sin
                  </text>
                </g>

                <!-- Cosine Projection -->
                <g v-if="showCosProjection">
                  <line 
                    :x1="toSvgX(unitX)" 
                    :y1="toSvgY(unitY)" 
                    :x2="toSvgX(unitX)" 
                    :y2="toSvgY(0)"
                    stroke="#3B82F6" 
                    stroke-width="3"
                    stroke-dasharray="5,3"
                  />
                  <text 
                    :x="toSvgX(unitX)" 
                    :y="toSvgY(0) + 20" 
                    text-anchor="middle"
                    class="fill-blue-600 text-sm font-bold"
                  >
                    cos
                  </text>
                </g>

                <!-- Point on Circle -->
                <circle 
                  :cx="toSvgX(unitX)" 
                  :cy="toSvgY(unitY)" 
                  r="6" 
                  fill="#F97316" 
                  stroke="white" 
                  stroke-width="2"
                />

                <!-- Angle Label -->
                <text 
                  :x="toSvgX(0.4 * Math.cos(angleRad / 2))" 
                  :y="toSvgY(0.4 * Math.sin(angleRad / 2))" 
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="fill-brand-dark text-sm font-bold"
                >
                  {{ angle }}°
                </text>
              </svg>

              <!-- Legend -->
              <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-slate-600">Eenheidscirkel</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-0.5 bg-emerald-500"></div>
                    <span class="text-slate-600">Sinus (y)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-0.5 bg-blue-500"></div>
                    <span class="text-slate-600">Cosinus (x)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-slate-800"></div>
                    <span class="text-slate-600">Straal = 1</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode: Special Angles Table -->
          <template v-if="currentSubMode === 'table'">
            <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-1 overflow-auto">
              <h3 class="text-lg font-bold text-slate-800 mb-4">Tabel met speciale hoeken</h3>
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-slate-200">
                    <th class="text-left py-2 px-3 font-bold text-slate-700">Hoek</th>
                    <th class="text-center py-2 px-3 font-bold text-slate-700">sin</th>
                    <th class="text-center py-2 px-3 font-bold text-slate-700">cos</th>
                    <th class="text-center py-2 px-3 font-bold text-slate-700">tan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(row, idx) in specialAngles" 
                    :key="idx" 
                    :class="['border-b border-slate-100 hover:bg-slate-50', angle === row.angle ? 'bg-orange-50' : '']"
                  >
                    <td class="py-2 px-3 font-mono">{{ row.angle }}°</td>
                    <td class="py-2 px-3 text-center font-mono">{{ row.sin }}</td>
                    <td class="py-2 px-3 text-center font-mono">{{ row.cos }}</td>
                    <td class="py-2 px-3 text-center font-mono">{{ row.tan }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Related Angles Section -->
              <div class="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 class="font-bold text-slate-800 mb-3">Verwante hoeken voor {{ angle }}°</h4>
                <div class="grid grid-cols-2 gap-3">
                  <div 
                    v-for="(rel, idx) in relatedAngles" 
                    :key="idx"
                    class="p-2 bg-white rounded border border-slate-200"
                  >
                    <p class="text-xs text-slate-500">{{ rel.label }}</p>
                    <p class="font-mono text-sm">{{ rel.value }}°</p>
                    <p class="text-xs text-slate-400">{{ rel.formula }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Mode: Triangle Visualization -->
          <template v-if="currentSubMode === 'triangles'">
            <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
              <h3 class="text-lg font-bold text-slate-800 mb-4">Driehoek met sinus- en cosinusregel</h3>
              
              <!-- Triangle SVG -->
              <div class="flex-1 relative">
                <svg 
                  viewBox="0 0 400 300" 
                  class="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <!-- Grid background -->
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" stroke-width="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="300" fill="url(#grid)" />

                  <!-- Triangle -->
                  <polygon 
                    points="50,250 350,250 200,50" 
                    fill="#FEF3C7" 
                    stroke="#F97316" 
                    stroke-width="2"
                  />

                  <!-- Side Labels -->
                  <text x="200" y="270" text-anchor="middle" class="fill-slate-700 font-bold text-sm">a = {{ sideA }}</text>
                  <text x="40" y="150" text-anchor="end" class="fill-slate-700 font-bold text-sm">b = {{ sideB }}</text>
                  <text x="280" y="140" text-anchor="start" class="fill-slate-700 font-bold text-sm">c = {{ sideC }}</text>

                  <!-- Angle Labels -->
                  <text x="65" y="235" text-anchor="middle" class="fill-slate-500 text-xs">A = {{ angleA }}°</text>
                  <text x="335" y="235" text-anchor="middle" class="fill-slate-500 text-xs">B = {{ angleB }}°</text>
                  <text x="200" y="75" text-anchor="middle" class="fill-slate-500 text-xs">C = {{ angleC }}°</text>

                  <!-- Vertex Points -->
                  <circle cx="50" cy="250" r="4" fill="#0B1120" />
                  <circle cx="350" cy="250" r="4" fill="#0B1120" />
                  <circle cx="200" cy="50" r="4" fill="#0B1120" />
                </svg>
              </div>

              <!-- Formula Display -->
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="p-3 bg-slate-50 rounded-lg">
                  <p class="text-xs font-bold text-slate-500 mb-1">Sinusregel</p>
                  <p class="font-mono text-sm">a/sin(A) = b/sin(B) = c/sin(C) = 2R</p>
                </div>
                <div class="p-3 bg-slate-50 rounded-lg">
                  <p class="text-xs font-bold text-slate-500 mb-1">Cosinusregel</p>
                  <p class="font-mono text-sm">c² = a² + b² - 2ab·cos(C)</p>
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

/* Checkbox styling */
input[type="checkbox"] {
  accent-color: #F97316;
}
</style>
