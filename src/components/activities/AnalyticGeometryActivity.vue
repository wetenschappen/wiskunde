<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhArrowsOutCardinal, PhArrowsInLineVertical,
  PhIntersect, PhRuler, PhGitCommit, PhVectorThree
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const derivationSubMode = ref('converter') // 'converter', 'distance-angle', 'intersection'
const currentStep = ref(0)

// Line parameters for Cartesian form: ux + vy + w = 0
const u = ref(1)
const v = ref(-1)
const w = ref(0)

// Second line for intersection mode
const u2 = ref(1)
const v2 = ref(1)
const w2 = ref(-2)

// Point for distance calculation
const px = ref(2)
const py = ref(3)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'cartesian-to-parametric', 'parametric-to-cartesian', 'distance-calc', 'angle-calc'
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// User inputs for challenges
const userA = ref(1)
const userB = ref(0)
const userC = ref(0)
const userD = ref(1)
const userDistance = ref(0)
const userAngle = ref(0)

// Target values for challenges
const targetA = ref(0)
const targetB = ref(0)
const targetC = ref(0)
const targetD = ref(0)
const targetDistance = ref(0)
const targetAngle = ref(0)

// ==================== COMPUTED PROPERTIES ====================
// Line properties from Cartesian form ux + vy + w = 0
// Slope: m = -u/v (when v ≠ 0)
const slope = computed(() => {
  if (v.value === 0) return Infinity
  return -u.value / v.value
})

const slope2 = computed(() => {
  if (v2.value === 0) return Infinity
  return -u2.value / v2.value
})

// Normal vector
const normalVector = computed(() => ({ x: u.value, y: v.value }))
const normalVector2 = computed(() => ({ x: u2.value, y: v2.value }))

// Direction vector (perpendicular to normal)
const directionVector = computed(() => ({ x: v.value, y: -u.value }))
const directionVector2 = computed(() => ({ x: v2.value, y: -u2.value }))

// Y-intercept (when v ≠ 0): y = (-u/v)x - w/v
const yIntercept = computed(() => {
  if (v.value === 0) return null
  return -w.value / v.value
})

const yIntercept2 = computed(() => {
  if (v2.value === 0) return null
  return -w2.value / v2.value
})

// Distance from point P(px, py) to line: d = |u*px + v*py + w| / sqrt(u² + v²)
const pointToLineDistance = computed(() => {
  const numerator = Math.abs(u.value * px.value + v.value * py.value + w.value)
  const denominator = Math.sqrt(u.value * u.value + v.value * v.value)
  if (denominator === 0) return 0
  return numerator / denominator
})

// Angle between two lines: tan(θ) = |(m2 - m1) / (1 + m1*m2)|
const angleBetweenLines = computed(() => {
  const m1 = slope.value
  const m2 = slope2.value
  
  if (m1 === Infinity && m2 === Infinity) return 0
  if (m1 === Infinity || m2 === Infinity) {
    const nonVerticalSlope = m1 === Infinity ? m2 : m1
    const angleWithVertical = Math.atan(Math.abs(1 / nonVerticalSlope))
    return angleWithVertical * (180 / Math.PI)
  }
  
  const tanTheta = Math.abs((m2 - m1) / (1 + m1 * m2))
  return Math.atan(tanTheta) * (180 / Math.PI)
})

// Intersection of two lines (when not parallel)
const intersection = computed(() => {
  const det = u.value * v2.value - u2.value * v.value
  if (Math.abs(det) < 0.0001) return null // Parallel or coincident
  
  const x = (v.value * w2.value - v2.value * w.value) / det
  const y = (u2.value * w.value - u.value * w2.value) / det
  return { x, y }
})

// Equation display
const cartesianEquation = computed(() => {
  const formatNum = (n) => {
    if (n === 0) return ''
    if (n === 1) return '+'
    if (n === -1) return '-'
    return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`
  }
  
  let text = ''
  if (u.value !== 0) {
    text += u.value === 1 ? 'x' : u.value === -1 ? '-x' : `${u.value}x`
  }
  if (v.value !== 0) {
    if (text && v.value > 0) text += ' + '
    else if (text && v.value < 0) text += ' - '
    text += Math.abs(v.value) === 1 ? 'y' : `${Math.abs(v.value)}y`
  }
  if (w.value !== 0) {
    text += w.value > 0 ? ` + ${w.value}` : ` - ${Math.abs(w.value)}`
  }
  text += ' = 0'
  return text || '0 = 0'
})

const cartesianEquation2 = computed(() => {
  const formatNum = (n) => {
    if (n === 0) return ''
    if (n === 1) return '+'
    if (n === -1) return '-'
    return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`
  }
  
  let text = ''
  if (u2.value !== 0) {
    text += u2.value === 1 ? 'x' : u2.value === -1 ? '-x' : `${u2.value}x`
  }
  if (v2.value !== 0) {
    if (text && v2.value > 0) text += ' + '
    else if (text && v2.value < 0) text += ' - '
    text += Math.abs(v2.value) === 1 ? 'y' : `${Math.abs(v2.value)}y`
  }
  if (w2.value !== 0) {
    text += w2.value > 0 ? ` + ${w2.value}` : ` - ${Math.abs(w2.value)}`
  }
  text += ' = 0'
  return text || '0 = 0'
})

// Parametric form: (x, y) = (x0, y0) + t * (dx, dy)
// Using a point on the line and direction vector
const parametricEquation = computed(() => {
  // Find a point on the line: set x=0, solve for y (if v ≠ 0)
  let x0, y0
  if (v.value !== 0) {
    x0 = 0
    y0 = -w.value / v.value
  } else if (u.value !== 0) {
    x0 = -w.value / u.value
    y0 = 0
  } else {
    return 'Ongedefinieerd'
  }
  
  const dx = directionVector.value.x
  const dy = directionVector.value.y
  
  return `(x, y) = (${x0.toFixed(1)}, ${y0.toFixed(1)}) + t(${dx}, ${dy})`
})

const parametricEquation2 = computed(() => {
  let x0, y0
  if (v2.value !== 0) {
    x0 = 0
    y0 = -w2.value / v2.value
  } else if (u2.value !== 0) {
    x0 = -w2.value / u2.value
    y0 = 0
  } else {
    return 'Ongedefinieerd'
  }
  
  const dx = directionVector2.value.x
  const dy = directionVector2.value.y
  
  return `(x, y) = (${x0.toFixed(1)}, ${y0.toFixed(1)}) + t(${dx}, ${dy})`
})

// Slope-intercept form (when v ≠ 0)
const slopeInterceptForm = computed(() => {
  if (v.value === 0) return 'Verticale lijn (x = constant)'
  const m = slope.value
  const b = yIntercept.value
  return `y = ${m.toFixed(2)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}`
})

const slopeInterceptForm2 = computed(() => {
  if (v2.value === 0) return 'Verticale lijn (x = constant)'
  const m = slope2.value
  const b = yIntercept2.value
  return `y = ${m.toFixed(2)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}`
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  if (type === 'cartesian-to-parametric') {
    // Generate random line
    u.value = Math.floor(Math.random() * 5) + 1
    v.value = Math.floor(Math.random() * 5) - 2
    w.value = Math.floor(Math.random() * 10) - 5
    
    // Calculate target parametric form
    targetA.value = v.value
    targetB.value = -u.value
    
    userA.value = 1
    userB.value = 0
  } else if (type === 'distance-calc') {
    // Generate line and point
    u.value = 1
    v.value = -1
    w.value = 0
    px.value = Math.floor(Math.random() * 6) - 3
    py.value = Math.floor(Math.random() * 6) - 3
    
    targetDistance.value = pointToLineDistance.value
    userDistance.value = 0
  } else if (type === 'angle-calc') {
    // Generate two lines with known angle
    u.value = 1
    v.value = 0
    w.value = 0
    u2.value = 1
    v2.value = 1
    w2.value = -2
    
    targetAngle.value = angleBetweenLines.value
    userAngle.value = 0
  }
}

function checkChallenge() {
  const tolerance = 0.1
  
  if (challengeType.value === 'cartesian-to-parametric') {
    // Check if direction vector is correct (proportional)
    const ratioA = userA.value / targetA.value
    const ratioB = userB.value / targetB.value
    const correct = Math.abs(ratioA - ratioB) < 0.01 && ratioA !== 0
    
    if (correct) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De richtingsvector is juist bepaald.'
    } else {
      challengeFeedback.value = 'Nog niet juist. De richtingsvector moet loodrecht staan op de normaalvector (u, v).'
    }
  } else if (challengeType.value === 'distance-calc') {
    if (Math.abs(userDistance.value - targetDistance.value) < tolerance) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! De afstand is ${targetDistance.value.toFixed(2)}.`
    } else {
      challengeFeedback.value = `Nog niet juist. Gebruik de formule: d = |u·px + v·py + w| / √(u² + v²)`
    }
  } else if (challengeType.value === 'angle-calc') {
    if (Math.abs(userAngle.value - targetAngle.value) < tolerance) {
      challengeSolved.value = true
      challengeFeedback.value = `Correct! De hoek is ${targetAngle.value.toFixed(1)}°.`
    } else {
      challengeFeedback.value = 'Nog niet juist. Gebruik de formule voor de hoek tussen twee lijnen.'
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

function generateLinePath(u, v, w) {
  // For line ux + vy + w = 0
  // If v ≠ 0: y = (-ux - w) / v
  // If v = 0: x = -w / u (vertical line)
  
  if (Math.abs(v) < 0.001) {
    // Vertical line
    const x = -w / u
    return {
      x1: toSvgX(x),
      y1: 0,
      x2: toSvgX(x),
      y2: svgHeight
    }
  }
  
  const xMin = viewBoxX
  const xMax = viewBoxX + viewBoxWidth
  const y1 = (-u * xMin - w) / v
  const y2 = (-u * xMax - w) / v
  
  return {
    x1: toSvgX(xMin),
    y1: toSvgY(y1),
    x2: toSvgX(xMax),
    y2: toSvgY(y2)
  }
}

const currentLine = computed(() => generateLinePath(u.value, v.value, w.value))
const secondLine = computed(() => generateLinePath(u2.value, v2.value, w2.value))

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
    title: 'Cartesiaanse vergelijking',
    description: 'De algemene vorm ux + vy + w = 0 beschrijft een rechte lijn.',
    focus: 'cartesian',
    instruction: 'Wijzig u, v en w en observeer het effect op de lijn.',
    details: [
      '(u, v) is de normaalvector (loodrecht op de lijn)',
      'Als v = 0: verticale lijn',
      'Als u = 0: horizontale lijn',
      'w bepaalt de afstand tot de oorsprong'
    ]
  },
  {
    title: 'Richtingsvector en normaalvector',
    description: 'De richtingsvector (v, -u) ligt parallel aan de lijn.',
    focus: 'vectors',
    instruction: 'Bekijk hoe de richtingsvector en normaalvector gerelateerd zijn.',
    details: [
      'Normaalvector n = (u, v)',
      'Richtingsvector d = (v, -u)',
      'n · d = 0 (ze staan loodrecht op elkaar)',
      'De richtingsvector bepaalt de helling'
    ]
  },
  {
    title: 'Parametrische vorm',
    description: 'De parametrische vorm: (x, y) = (x₀, y₀) + t(v, -u)',
    focus: 'parametric',
    instruction: 'Bekijk de relatie tussen cartesiaanse en parametrische vorm.',
    details: [
      '(x₀, y₀) is een punt op de lijn',
      't is de parameter',
      '(v, -u) is de richtingsvector',
      'Elke waarde van t geeft een punt op de lijn'
    ]
  },
  {
    title: 'Afstand van punt tot lijn',
    description: 'De afstand van punt P tot de lijn volgt uit de projectie.',
    focus: 'distance',
    instruction: 'Verplaats het punt P en observeer de afstand.',
    details: [
      'd = |u·px + v·py + w| / √(u² + v²)',
      'Dit is de lengte van de loodlijn',
      'De kleinste afstand van P tot de lijn',
      'Als d = 0: P ligt op de lijn'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    // Enable second line for intersection step
    if (analysisSteps[currentStep.value].focus === 'intersection') {
      derivationSubMode.value = 'intersection'
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    if (analysisSteps[currentStep.value].focus !== 'intersection') {
      derivationSubMode.value = 'converter'
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
            <PhGraph class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Analytische Meetkunde</h1>
            <p class="text-sm text-slate-500">Rechte lijnen in het vlak</p>
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
              
              <!-- Cartesian equation parameters -->
              <div v-if="['cartesian', 'vectors', 'parametric', 'distance'].includes(analysisSteps[currentStep].focus)" class="space-y-3">
                <p class="text-sm font-bold text-brand-dark">Cartesiaanse vorm: ux + vy + w = 0</p>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-700">u (normaal x)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ u }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="u" 
                    min="-5" 
                    max="5" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-700">v (normaal y)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ v }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="v" 
                    min="-5" 
                    max="5" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-700">w (constant term)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ w }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="w" 
                    min="-10" 
                    max="10" 
                    step="1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Point P for distance calculation -->
              <div v-if="analysisSteps[currentStep].focus === 'distance'" class="space-y-3 border-t border-slate-200 pt-4">
                <p class="text-sm font-bold text-slate-700">Punt P(px, py)</p>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">px</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ px }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="px" 
                    min="-6" 
                    max="6" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-600">py</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ py }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="py" 
                    min="-6" 
                    max="6" 
                    step="0.5"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  >
                </div>

                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-1">Afstand berekening</p>
                  <div class="text-sm font-mono space-y-1">
                    <p>d = |u·px + v·py + w| / √(u² + v²)</p>
                    <p>d = |{{ u }}·{{ px }} + {{ v }}·{{ py }} + {{ w }}| / √({{ u }}² + {{ v }}²)</p>
                    <p class="text-brand-orange font-bold">d = {{ pointToLineDistance.toFixed(3) }}</p>
                  </div>
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

          <!-- Mode: Derivation/Toepassing -->
          <template v-if="currentMode === 'derivation'">
            <!-- Sub-mode Selection -->
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassingen</h2>
              <p class="text-sm text-slate-600">Kies een toepassing om te oefenen.</p>
            </div>

            <!-- Sub-mode Tabs -->
            <div class="flex border-b border-slate-200">
              <button 
                @click="derivationSubMode = 'converter'"
                :class="['flex-1 px-3 py-2 text-xs font-medium transition-colors', 
                  derivationSubMode === 'converter' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                Vormen
              </button>
              <button 
                @click="derivationSubMode = 'distance-angle'"
                :class="['flex-1 px-3 py-2 text-xs font-medium transition-colors', 
                  derivationSubMode === 'distance-angle' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                Afstand/Hoek
              </button>
              <button 
                @click="derivationSubMode = 'intersection'"
                :class="['flex-1 px-3 py-2 text-xs font-medium transition-colors', 
                  derivationSubMode === 'intersection' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-700']"
              >
                Snijpunt
              </button>
            </div>

            <div class="p-4 space-y-4">
              <!-- Sub-mode: Equation Converter -->
              <template v-if="derivationSubMode === 'converter'">
                <div v-if="!challengeActive" class="space-y-3">
                  <p class="text-sm text-slate-500">Kies een oefening:</p>
                  
                  <button @click="generateChallenge('cartesian-to-parametric')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                    <div class="font-medium text-sm text-slate-800">Cartesiaans → Parametrisch</div>
                    <div class="text-xs text-slate-500 mt-1">Zet de cartesiaanse vorm om naar parametrische vorm.</div>
                  </button>
                </div>

                <div v-else class="space-y-4">
                  <div class="p-3 bg-brand-dark text-white rounded-lg">
                    <p class="text-sm font-medium">Bepaal de parametrische vorm:</p>
                    <p class="text-lg font-mono mt-2">{{ cartesianEquation }}</p>
                    <p class="text-xs text-white/60 mt-2">Tip: de richtingsvector is (v, -u)</p>
                  </div>

                  <div class="space-y-3">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Richtingsvector x-component (v)</label>
                      <input 
                        type="number" 
                        v-model.number="userA" 
                        step="0.5"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-slate-700">Richtingsvector y-component (-u)</label>
                      <input 
                        type="number" 
                        v-model.number="userB" 
                        step="0.5"
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      >
                    </div>
                  </div>

                  <div class="space-y-2">
                    <button @click="checkChallenge" class="w-full py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
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
              </template>

              <!-- Sub-mode: Distance and Angle -->
              <template v-if="derivationSubMode === 'distance-angle'">
                <div class="space-y-4">
                  <!-- Line parameters -->
                  <div class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Lijn: ux + vy + w = 0</p>
                    
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-600">u</label>
                        <input type="number" v-model.number="u" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">v</label>
                        <input type="number" v-model.number="v" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">w</label>
                        <input type="number" v-model.number="w" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                    </div>
                  </div>

                  <!-- Point for distance -->
                  <div class="space-y-3 border-t border-slate-200 pt-3">
                    <p class="text-sm font-bold text-slate-700">Punt P</p>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="text-xs text-slate-600">px</label>
                        <input type="number" v-model.number="px" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">py</label>
                        <input type="number" v-model.number="py" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                    </div>
                  </div>

                  <!-- Second line for angle -->
                  <div class="space-y-3 border-t border-slate-200 pt-3">
                    <p class="text-sm font-bold text-slate-700">Tweede lijn (voor hoek)</p>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-600">u₂</label>
                        <input type="number" v-model.number="u2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">v₂</label>
                        <input type="number" v-model.number="v2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">w₂</label>
                        <input type="number" v-model.number="w2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Sub-mode: Intersection -->
              <template v-if="derivationSubMode === 'intersection'">
                <div class="space-y-4">
                  <p class="text-sm text-slate-500">Bepaal het snijpunt van twee lijnen.</p>

                  <!-- Line 1 -->
                  <div class="space-y-3">
                    <p class="text-sm font-bold text-slate-700">Lijn 1: u₁x + v₁y + w₁ = 0</p>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-600">u₁</label>
                        <input type="number" v-model.number="u" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">v₁</label>
                        <input type="number" v-model.number="v" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">w₁</label>
                        <input type="number" v-model.number="w" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                    </div>
                  </div>

                  <!-- Line 2 -->
                  <div class="space-y-3 border-t border-slate-200 pt-3">
                    <p class="text-sm font-bold text-slate-700">Lijn 2: u₂x + v₂y + w₂ = 0</p>
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="text-xs text-slate-600">u₂</label>
                        <input type="number" v-model.number="u2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">v₂</label>
                        <input type="number" v-model.number="v2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                      <div>
                        <label class="text-xs text-slate-600">w₂</label>
                        <input type="number" v-model.number="w2" class="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      </div>
                    </div>
                  </div>

                  <!-- Intersection result -->
                  <div v-if="intersection" class="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p class="text-sm font-bold text-emerald-700 mb-1">Snijpunt:</p>
                    <p class="text-sm font-mono text-emerald-600">
                      S = ({{ intersection.x.toFixed(2) }}, {{ intersection.y.toFixed(2) }})
                    </p>
                  </div>
                  <div v-else class="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <p class="text-sm font-bold text-rose-700">Evenwijdig of samenvallend</p>
                    <p class="text-xs text-rose-600 mt-1">De lijnen hebben geen uniek snijpunt.</p>
                  </div>

                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-xs text-slate-600">Oplossing via stelsel:</p>
                    <p class="text-xs font-mono text-slate-500 mt-1">
                      x = (v₁w₂ - v₂w₁) / (u₁v₂ - u₂v₁)<br>
                      y = (u₂w₁ - u₁w₂) / (u₁v₂ - u₂v₁)
                    </p>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- Mathematical Characteristics Panel -->
          <div class="mt-auto p-4 bg-slate-50 border-t border-slate-200">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Wiskundige kenmerken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Cartesiaans:</span>
                <span class="font-mono text-xs">{{ cartesianEquation }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Hellingsvorm:</span>
                <span class="font-mono text-xs">{{ slopeInterceptForm }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Normaalvector:</span>
                <span class="font-mono">({{ u }}, {{ v }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Richtingsvector:</span>
                <span class="font-mono">({{ directionVector.x }}, {{ directionVector.y }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Hellingscoëff:</span>
                <span class="font-mono">{{ slope === Infinity ? '∞' : slope.toFixed(2) }}</span>
              </div>
              <div v-if="derivationSubMode === 'distance-angle' || analysisSteps[currentStep]?.focus === 'distance'" class="flex justify-between border-t border-slate-200 pt-2">
                <span class="text-slate-600">Afstand P tot lijn:</span>
                <span class="font-mono text-brand-orange">{{ pointToLineDistance.toFixed(3) }}</span>
              </div>
              <div v-if="derivationSubMode === 'distance-angle'" class="flex justify-between">
                <span class="text-slate-600">Hoek tussen lijnen:</span>
                <span class="font-mono text-brand-orange">{{ angleBetweenLines.toFixed(1) }}°</span>
              </div>
              <div v-if="derivationSubMode === 'intersection' && intersection" class="flex justify-between border-t border-slate-200 pt-2">
                <span class="text-slate-600">Snijpunt:</span>
                <span class="font-mono text-brand-orange">({{ intersection.x.toFixed(2) }}, {{ intersection.y.toFixed(2) }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-4">
                <span class="text-sm text-slate-500">Cartesiaans:</span>
                <span class="text-xl font-mono font-bold text-brand-dark">{{ cartesianEquation }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-slate-500">Parametrisch:</span>
                <span class="text-lg font-mono text-slate-600">{{ parametricEquation }}</span>
              </div>
              <div v-if="derivationSubMode === 'intersection' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')" class="flex items-center gap-4 border-t border-slate-200 pt-2 mt-2 w-full justify-center">
                <span class="text-sm text-slate-500">Lijn 2:</span>
                <span class="text-lg font-mono text-slate-600">{{ cartesianEquation2 }}</span>
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

              <!-- Second line (for intersection or angle) -->
              <line 
                v-if="derivationSubMode === 'intersection' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')"
                :x1="secondLine.x1" :y1="secondLine.y1" 
                :x2="secondLine.x2" :y2="secondLine.y2"
                stroke="#6366F1" 
                stroke-width="2"
              />

              <!-- Main line -->
              <line 
                :x1="currentLine.x1" :y1="currentLine.y1" 
                :x2="currentLine.x2" :y2="currentLine.y2"
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Point P for distance calculation -->
              <g v-if="analysisSteps[currentStep]?.focus === 'distance' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')">
                <circle 
                  :cx="toSvgX(px)" 
                  :cy="toSvgY(py)" 
                  r="6" 
                  fill="#3B82F6" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(px) + 10" 
                  :y="toSvgY(py) - 10" 
                  class="fill-blue-600 text-xs font-bold"
                >
                  P({{ px }}, {{ py }})
                </text>

                <!-- Perpendicular line from P to main line -->
                <line
                  :x1="toSvgX(px)"
                  :y1="toSvgY(py)"
                  :x2="toSvgX(px - u * pointToLineDistance / Math.sqrt(u*u + v*v))"
                  :y2="toSvgY(py - v * pointToLineDistance / Math.sqrt(u*u + v*v))"
                  stroke="#3B82F6"
                  stroke-width="1"
                  stroke-dasharray="4,4"
                  opacity="0.5"
                />
              </g>

              <!-- Direction vector arrow -->
              <g v-if="analysisSteps[currentStep]?.focus === 'vectors' || analysisSteps[currentStep]?.focus === 'parametric'">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                  </marker>
                </defs>
                <line
                  :x1="toSvgX(0)"
                  :y1="toSvgY(yIntercept || 0)"
                  :x2="toSvgX(directionVector.x * 2)"
                  :y2="toSvgY((yIntercept || 0) + directionVector.y * 2)"
                  stroke="#10B981"
                  stroke-width="2"
                  marker-end="url(#arrowhead)"
                />
                <text
                  :x="toSvgX(directionVector.x)"
                  :y="toSvgY((yIntercept || 0) + directionVector.y * 2) - 5"
                  class="fill-emerald-600 text-xs font-bold"
                >
                  d
                </text>
              </g>

              <!-- Normal vector arrow -->
              <g v-if="analysisSteps[currentStep]?.focus === 'vectors'">
                <defs>
                  <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#EC4899" />
                  </marker>
                </defs>
                <line
                  :x1="toSvgX(0)"
                  :y1="toSvgY(yIntercept || 0)"
                  :x2="toSvgX(u * 2)"
                  :y2="toSvgY((yIntercept || 0) + v * 2)"
                  stroke="#EC4899"
                  stroke-width="2"
                  marker-end="url(#arrowhead-red)"
                />
                <text
                  :x="toSvgX(u * 2) + 5"
                  :y="toSvgY((yIntercept || 0) + v * 2)"
                  class="fill-pink-600 text-xs font-bold"
                >
                  n
                </text>
              </g>

              <!-- Intersection point -->
              <g v-if="(derivationSubMode === 'intersection' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')) && intersection">
                <circle 
                  :cx="toSvgX(intersection.x)" 
                  :cy="toSvgY(intersection.y)" 
                  r="6" 
                  fill="#10B981" 
                  stroke="white" 
                  stroke-width="2"
                />
                <text 
                  :x="toSvgX(intersection.x)" 
                  :y="toSvgY(intersection.y) - 10" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-xs font-bold"
                >
                  S
                </text>
              </g>

              <!-- Y-intercept marker -->
              <circle 
                v-if="v !== 0"
                :cx="toSvgX(0)" 
                :cy="toSvgY(yIntercept)" 
                r="5" 
                fill="#F59E0B" 
                stroke="white" 
                stroke-width="2"
              />
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">Lijn 1</span>
                </div>
                <div v-if="derivationSubMode === 'intersection' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')" class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-indigo-500"></div>
                  <span class="text-slate-600">Lijn 2</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span class="text-slate-600">Y-snijpunt</span>
                </div>
                <div v-if="analysisSteps[currentStep]?.focus === 'distance' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span class="text-slate-600">Punt P</span>
                </div>
                <div v-if="(derivationSubMode === 'intersection' || (currentMode === 'derivation' && derivationSubMode === 'distance-angle')) && intersection" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Snijpunt</span>
                </div>
                <div v-if="analysisSteps[currentStep]?.focus === 'vectors'" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span class="text-slate-600">Normaalvector</span>
                </div>
                <div v-if="analysisSteps[currentStep]?.focus === 'vectors' || analysisSteps[currentStep]?.focus === 'parametric'" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Richtingsvector</span>
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
</style>
