<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhCircle, PhRuler, PhCompass,
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhLineSegment, PhAngle, PhIntersect
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' } // 'analysis' or 'derivation'
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0) // For guided analysis mode

// Circle properties
const radius = ref(5)
const chordAngle = ref(45) // Angle for chord endpoints
const tangentAngle = ref(30) // Angle for tangent point
const showInscribedAngle = ref(true)
const showCentralAngle = ref(true)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'chord-length', 'tangent-angle', 'inscribed-angle'
const targetRadius = ref(0)
const targetChordAngle = ref(0)
const userRadius = ref(5)
const userChordAngle = ref(45)
const challengeFeedback = ref('')
const challengeSolved = ref(false)
const challengeQuestion = ref('')
const correctAnswer = ref(0)
const userAnswer = ref('')

// ==================== COMPUTED PROPERTIES ====================
// Circle center (always at origin)
const centerX = 0
const centerY = 0

// Chord endpoints
const chordPoint1 = computed(() => {
  const angleRad = (chordAngle.value * Math.PI) / 180
  return {
    x: radius.value * Math.cos(angleRad),
    y: radius.value * Math.sin(angleRad)
  }
})

const chordPoint2 = computed(() => {
  const angleRad = ((-chordAngle.value) * Math.PI) / 180
  return {
    x: radius.value * Math.cos(angleRad),
    y: radius.value * Math.sin(angleRad)
  }
})

// Chord length
const chordLength = computed(() => {
  const dx = chordPoint1.value.x - chordPoint2.value.x
  const dy = chordPoint1.value.y - chordPoint2.value.y
  return Math.sqrt(dx * dx + dy * dy)
})

// Apothem (distance from center to chord)
const apothem = computed(() => {
  return Math.sqrt(radius.value ** 2 - (chordLength.value / 2) ** 2)
})

// Central angle for chord
const centralAngleValue = computed(() => {
  return chordAngle.value * 2
})

// Inscribed angle
const inscribedAngleValue = computed(() => {
  return centralAngleValue.value / 2
})

// Tangent point
const tangentPoint = computed(() => {
  const angleRad = (tangentAngle.value * Math.PI) / 180
  return {
    x: radius.value * Math.cos(angleRad),
    y: radius.value * Math.sin(angleRad)
  }
})

// Tangent slope (perpendicular to radius)
const tangentSlope = computed(() => {
  const angleRad = (tangentAngle.value * Math.PI) / 180
  // Tangent is perpendicular to radius, so slope is -1/(slope of radius)
  const radiusSlope = Math.tan(angleRad)
  return -1 / radiusSlope
})

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -10
const viewBoxY = -7.5
const viewBoxWidth = 20
const viewBoxHeight = 15

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// Generate points for inscribed angle triangle
const inscribedPoint = computed(() => {
  // Point on circle at 180 degrees from midpoint of chord arc
  const midAngle = 0 // midpoint of the chord arc
  const inscribedAngle = midAngle + 180
  const angleRad = (inscribedAngle * Math.PI) / 180
  return {
    x: radius.value * Math.cos(angleRad),
    y: radius.value * Math.sin(angleRad)
  }
})

// Tangent line endpoints
const tangentLine = computed(() => {
  const point = tangentPoint.value
  const slope = tangentSlope.value
  
  // Create line segment centered on tangent point
  const length = 4
  const dx = length / Math.sqrt(1 + slope * slope)
  const dy = slope * dx
  
  return {
    x1: point.x - dx,
    y1: point.y - dy,
    x2: point.x + dx,
    y2: point.y + dy
  }
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  // Generate random parameters
  targetRadius.value = Math.round(Math.random() * 4 + 3) // 3 to 7
  targetChordAngle.value = Math.round(Math.random() * 60 + 15) // 15 to 75 degrees
  
  // Reset user inputs
  userRadius.value = 5
  userChordAngle.value = 45
  
  // Set challenge question
  if (type === 'chord-length') {
    challengeQuestion.value = `Bereken de lengte van de koorde bij r = ${targetRadius.value} en centrale hoek = ${targetChordAngle.value * 2}°`
    correctAnswer.value = 2 * targetRadius.value * Math.sin((targetChordAngle.value * Math.PI) / 180)
  } else if (type === 'tangent-angle') {
    challengeQuestion.value = `Wat is de hoek tussen de raaklijn en de koorde als de centrale hoek ${targetChordAngle.value * 2}° is?`
    correctAnswer.value = (180 - targetChordAngle.value * 2) / 2
  } else if (type === 'inscribed-angle') {
    challengeQuestion.value = `Bereken de omtrekshoek die hoort bij een centrale hoek van ${targetChordAngle.value * 2}°`
    correctAnswer.value = targetChordAngle.value
  }
}

function checkChallenge() {
  const tolerance = 0.5
  const userVal = parseFloat(userAnswer.value)
  
  if (isNaN(userVal)) {
    challengeFeedback.value = 'Voer een geldig getal in.'
    return
  }
  
  if (Math.abs(userVal - correctAnswer.value) < tolerance) {
    challengeSolved.value = true
    challengeFeedback.value = `Correct! Het antwoord is ${correctAnswer.value.toFixed(2)}`
  } else {
    challengeFeedback.value = `Nog niet juist. Probeer het opnieuw. Tip: gebruik de formules in het rechterpaneel.`
  }
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
  {
    title: 'Cirkel en straal',
    description: 'De straal (r) is de afstand van het middelpunt naar elk punt op de cirkel.',
    focus: 'radius',
    instruction: 'Wijzig de straal en observeer de cirkel.',
    details: [
      'Alle punten op de cirkel liggen op gelijke afstand van het middelpunt',
      'De straal bepaalt de grootte van de cirkel',
      'Omtrek = 2πr, Oppervlakte = πr²'
    ]
  },
  {
    title: 'Koorde en middellijn',
    description: 'Een koorde is een lijnstuk tussen twee punten op de cirkel.',
    focus: 'chord',
    instruction: 'Wijzig de hoek en observeer de koorde.',
    details: [
      'De middellijn is de langste koorde (hoek = 180°)',
      'De loodlijn vanuit het middelpunt op een koorde halveert de koorde',
      'Koorde lengte = 2r·sin(θ/2) waarbij θ de centrale hoek is'
    ]
  },
  {
    title: 'Apothema',
    description: 'Het apothema is de afstand van het middelpunt naar het midden van een koorde.',
    focus: 'apothem',
    instruction: 'Observeer hoe het apothema verandert met de koorde.',
    details: [
      'Apothema = r·cos(θ/2) waarbij θ de centrale hoek is',
      'Voor een middellijn is het apothema 0',
      'Het apothema is altijd kleiner dan of gelijk aan de straal'
    ]
  },
  {
    title: 'Centrale en omtrekshoek',
    description: 'De omtrekshoek is de helft van de centrale hoek die dezelfde boog afsluit.',
    focus: 'angles',
    instruction: 'Vergelijk de centrale hoek (roze) met de omtrekshoek (geel).',
    details: [
      'Omtrekshoek = ½ × Centrale hoek',
      'De hoekpunt van de omtrekshoek ligt op de cirkel',
      'De hoekpunt van de centrale hoek is het middelpunt'
    ]
  },
  {
    title: 'Raaklijn eigenschappen',
    description: 'Een raaklijn raakt de cirkel in exact één punt en staat loodrecht op de straal.',
    focus: 'tangent',
    instruction: 'Wijzig de positie van het raakpunt.',
    details: [
      'De raaklijn staat loodrecht op de straal naar het raakpunt',
      'De hoek tussen raaklijn en koorde = ½ × (hoek op de overstaande boog)',
      'Twee raaklijnen uit een punt buiten de cirkel zijn even lang'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    // Update visibility based on step
    if (analysisSteps[currentStep.value].focus === 'angles') {
      showInscribedAngle.value = true
      showCentralAngle.value = true
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
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
            <h1 class="text-lg font-bold text-slate-800">Cirkelmeetkunde</h1>
            <p class="text-sm text-slate-500">Eigenschappen en hoekrelaties</p>
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
              Berekeningen
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
          
          <!-- Mode: Parameter Analysis -->
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
              
              <!-- Radius control -->
              <div v-if="['radius', 'chord', 'apothem', 'angles', 'tangent'].includes(analysisSteps[currentStep].focus)" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">Straal (r)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ radius }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="radius" 
                  min="2" 
                  max="8" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Chord angle control -->
              <div v-if="['chord', 'apothem', 'angles'].includes(analysisSteps[currentStep].focus)" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">Koorde hoek (θ/2)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ chordAngle }}°</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="chordAngle" 
                  min="5" 
                  max="85" 
                  step="5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="flex justify-between text-xs text-slate-400">
                  <span>Kleine koorde</span>
                  <span>Grote koorde</span>
                </div>
              </div>

              <!-- Tangent angle control -->
              <div v-if="analysisSteps[currentStep].focus === 'tangent'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">Raakpunt hoek</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ tangentAngle }}°</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="tangentAngle" 
                  min="0" 
                  max="360" 
                  step="5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Angle visibility toggles -->
              <div v-if="analysisSteps[currentStep].focus === 'angles'" class="space-y-2">
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" v-model="showCentralAngle" class="rounded text-brand-orange">
                  Toon centrale hoek
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" v-model="showInscribedAngle" class="rounded text-brand-orange">
                  Toon omtrekshoek
                </label>
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

          <!-- Mode: Formula Derivation / Calculations -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Berekeningen</h2>
              <p class="text-sm text-slate-600">Los cirkelmeetkunde problemen op.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('chord-length')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhLineSegment class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Koorde lengte berekenen</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1 ml-6">Gebruik de formule: l = 2r·sin(θ/2)</div>
                </button>
                
                <button @click="generateChallenge('tangent-angle')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhIntersect class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Raaklijn hoek</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1 ml-6">Bereken de hoek tussen raaklijn en koorde</div>
                </button>
                
                <button @click="generateChallenge('inscribed-angle')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2">
                    <PhAngle class="text-brand-orange" />
                    <span class="font-medium text-sm text-slate-800">Omtrekshoek</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1 ml-6">Centrale hoek → Omtrekshoek</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Opgave:</p>
                  <p class="text-sm text-white/90">{{ challengeQuestion }}</p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Jouw antwoord</label>
                    <input 
                      type="number" 
                      v-model="userAnswer" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="Voer je antwoord in"
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
              <div class="flex justify-between">
                <span class="text-slate-600">Straal (r):</span>
                <span class="font-mono">{{ radius }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Koorde lengte:</span>
                <span class="font-mono">{{ chordLength.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Apothema:</span>
                <span class="font-mono">{{ apothem.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Centrale hoek:</span>
                <span class="font-mono">{{ centralAngleValue }}°</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Omtrekshoek:</span>
                <span class="font-mono text-brand-orange">{{ inscribedAngleValue }}°</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Omtrek:</span>
                <span class="font-mono">{{ (2 * Math.PI * radius).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Oppervlakte:</span>
                <span class="font-mono">{{ (Math.PI * radius * radius).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Title Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Huidige configuratie:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">r = {{ radius }}</span>
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
                <line v-for="i in 21" :key="`v${i}`" 
                  :x1="toSvgX(-10 + i)" y1="0" 
                  :x2="toSvgX(-10 + i)" :y2="svgHeight" 
                />
                <!-- Horizontal lines -->
                <line v-for="i in 15" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-7 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-7 + i)" 
                />
              </g>

              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

              <!-- Axis labels -->
              <text :x="toSvgX(9.5)" :y="toSvgY(0) + 20" class="fill-slate-400 text-sm">x</text>
              <text :x="toSvgX(0) + 10" :y="toSvgY(7) + 15" class="fill-slate-400 text-sm">y</text>

              <!-- Main Circle -->
              <circle 
                :cx="toSvgX(centerX)" 
                :cy="toSvgY(centerY)" 
                :r="(radius / viewBoxWidth) * svgWidth"
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Center point -->
              <circle 
                :cx="toSvgX(centerX)" 
                :cy="toSvgY(centerY)" 
                r="5" 
                fill="#0B1120" 
                stroke="white" 
                stroke-width="2"
              />
              <text 
                :x="toSvgX(centerX) - 10" 
                :y="toSvgY(centerY) - 10" 
                text-anchor="end" 
                class="fill-slate-600 text-xs font-bold"
              >
                M
              </text>

              <!-- Radius line -->
              <line 
                :x1="toSvgX(centerX)" 
                :y1="toSvgY(centerY)" 
                :x2="toSvgX(chordPoint1.x)" 
                :y2="toSvgY(chordPoint1.y)"
                stroke="#64748B" 
                stroke-width="2"
                stroke-dasharray="4,4"
              />

              <!-- Chord -->
              <line 
                v-if="currentMode === 'analysis' && ['chord', 'apothem', 'angles'].includes(analysisSteps[currentStep].focus)"
                :x1="toSvgX(chordPoint1.x)" 
                :y1="toSvgY(chordPoint1.y)" 
                :x2="toSvgX(chordPoint2.x)" 
                :y2="toSvgY(chordPoint2.y)"
                stroke="#3B82F6" 
                stroke-width="3"
              />

              <!-- Chord endpoints -->
              <circle 
                v-if="currentMode === 'analysis' && ['chord', 'apothem', 'angles'].includes(analysisSteps[currentStep].focus)"
                :cx="toSvgX(chordPoint1.x)" 
                :cy="toSvgY(chordPoint1.y)" 
                r="5" 
                fill="#3B82F6" 
                stroke="white" 
                stroke-width="2"
              />
              <circle 
                v-if="currentMode === 'analysis' && ['chord', 'apothem', 'angles'].includes(analysisSteps[currentStep].focus)"
                :cx="toSvgX(chordPoint2.x)" 
                :cy="toSvgY(chordPoint2.y)" 
                r="5" 
                fill="#3B82F6" 
                stroke="white" 
                stroke-width="2"
              />

              <!-- Apothem -->
              <line 
                v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'apothem'"
                :x1="toSvgX(centerX)" 
                :y1="toSvgY(centerY)" 
                :x2="toSvgX((chordPoint1.x + chordPoint2.x) / 2)" 
                :y2="toSvgY((chordPoint1.y + chordPoint2.y) / 2)"
                stroke="#10B981" 
                stroke-width="2"
              />

              <!-- Central angle arc -->
              <path 
                v-if="currentMode === 'analysis' && showCentralAngle && ['angles'].includes(analysisSteps[currentStep].focus)"
                :d="`M ${toSvgX(radius * 0.3)} ${toSvgY(0)} A ${(radius * 0.3 / viewBoxWidth) * svgWidth} ${(radius * 0.3 / viewBoxWidth) * svgWidth} 0 0 1 ${toSvgX(radius * 0.3 * Math.cos((chordAngle.value * Math.PI) / 180))} ${toSvgY(radius * 0.3 * Math.sin((chordAngle.value * Math.PI) / 180))}`"
                fill="none" 
                stroke="#EC4899" 
                stroke-width="2"
              />

              <!-- Inscribed angle visualization -->
              <g v-if="currentMode === 'analysis' && showInscribedAngle && ['angles'].includes(analysisSteps[currentStep].focus)">
                <!-- Point on circle -->
                <circle 
                  :cx="toSvgX(inscribedPoint.x)" 
                  :cy="toSvgY(inscribedPoint.y)" 
                  r="5" 
                  fill="#F59E0B" 
                  stroke="white" 
                  stroke-width="2"
                />
                <!-- Lines to chord endpoints -->
                <line 
                  :x1="toSvgX(inscribedPoint.x)" 
                  :y1="toSvgY(inscribedPoint.y)" 
                  :x2="toSvgX(chordPoint1.x)" 
                  :y2="toSvgY(chordPoint1.y)"
                  stroke="#F59E0B" 
                  stroke-width="2"
                  stroke-dasharray="4,4"
                />
                <line 
                  :x1="toSvgX(inscribedPoint.x)" 
                  :y1="toSvgY(inscribedPoint.y)" 
                  :x2="toSvgX(chordPoint2.x)" 
                  :y2="toSvgY(chordPoint2.y)"
                  stroke="#F59E0B" 
                  stroke-width="2"
                  stroke-dasharray="4,4"
                />
              </g>

              <!-- Tangent line -->
              <g v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'tangent'">
                <line 
                  :x1="toSvgX(tangentLine.x1)" 
                  :y1="toSvgY(tangentLine.y1)" 
                  :x2="toSvgX(tangentLine.x2)" 
                  :y2="toSvgY(tangentLine.y2)"
                  stroke="#8B5CF6" 
                  stroke-width="3"
                />
                <!-- Radius to tangent point -->
                <line 
                  :x1="toSvgX(centerX)" 
                  :y1="toSvgY(centerY)" 
                  :x2="toSvgX(tangentPoint.x)" 
                  :y2="toSvgY(tangentPoint.y)"
                  stroke="#8B5CF6" 
                  stroke-width="2"
                  stroke-dasharray="4,4"
                />
                <!-- Tangent point -->
                <circle 
                  :cx="toSvgX(tangentPoint.x)" 
                  :cy="toSvgY(tangentPoint.y)" 
                  r="5" 
                  fill="#8B5CF6" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>

              <!-- Challenge target circle (in derivation mode) -->
              <circle 
                v-if="challengeActive && currentMode === 'derivation'"
                :cx="toSvgX(centerX)" 
                :cy="toSvgY(centerY)" 
                :r="(targetRadius / viewBoxWidth) * svgWidth"
                fill="none" 
                stroke="#CBD5E1" 
                stroke-width="3"
                stroke-dasharray="8,4"
              />
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-0.5 bg-orange-500 rounded"></div>
                  <span class="text-slate-600">Cirkel</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-slate-800"></div>
                  <span class="text-slate-600">Middelpunt (M)</span>
                </div>
                <div v-if="currentMode === 'analysis' && ['chord', 'apothem', 'angles'].includes(analysisSteps[currentStep].focus)" class="flex items-center gap-2">
                  <div class="w-8 h-1 bg-blue-500 rounded"></div>
                  <span class="text-slate-600">Koorde</span>
                </div>
                <div v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'apothem'" class="flex items-center gap-2">
                  <div class="w-8 h-1 bg-emerald-500 rounded"></div>
                  <span class="text-slate-600">Apothema</span>
                </div>
                <div v-if="currentMode === 'analysis' && showInscribedAngle && analysisSteps[currentStep].focus === 'angles'" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span class="text-slate-600">Omtrekshoek</span>
                </div>
                <div v-if="currentMode === 'analysis' && analysisSteps[currentStep].focus === 'tangent'" class="flex items-center gap-2">
                  <div class="w-8 h-1 bg-purple-500 rounded"></div>
                  <span class="text-slate-600">Raaklijn</span>
                </div>
                <div v-if="challengeActive && currentMode === 'derivation'" class="flex items-center gap-2">
                  <div class="w-8 h-0.5 bg-slate-300" style="border-top: 2px dashed #CBD5E1;"></div>
                  <span class="text-slate-600">Doelcirkel</span>
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
