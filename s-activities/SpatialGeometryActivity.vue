<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhCube, PhSelection, PhIntersect, PhEye,
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhArrowsOutCardinal, PhLineSegments, PhSquare
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const visualizationMode = ref('positions') // 'positions', 'cross-section', 'explorer'

// Line and plane positions
const lineDirection = ref({ x: 1, y: 0.5, z: 0.3 })
const planeNormal = ref({ x: 0, y: 1, z: 0 })
const planeOffset = ref(0)
const showIntersection = ref(false)

// Cross-section mode
const solidType = ref('cube') // 'cube', 'pyramid'
const sectionPlane = ref({ a: 0.5, b: 0.5, c: 0.5, d: 0 })
const showHiddenEdges = ref(true)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('')
const challengeSolved = ref(false)
const challengeFeedback = ref('')
const userAnswer = ref('')

// ==================== COMPUTED PROPERTIES ====================
// 3D to 2D isometric projection
const isoScale = 80
const isoOffset = { x: 400, y: 300 }

function toIso(x, y, z) {
  // Isometric projection
  const isoX = (x - z) * Math.cos(Math.PI / 6) * isoScale + isoOffset.x
  const isoY = (x + z) * Math.sin(Math.PI / 6) * isoScale - y * isoScale * 0.8 + isoOffset.y
  return { x: isoX, y: isoY }
}

// Line-plane relationship classification
const linePlaneRelation = computed(() => {
  const dot = lineDirection.value.x * planeNormal.value.x + 
              lineDirection.value.y * planeNormal.value.y + 
              lineDirection.value.z * planeNormal.value.z
  
  if (Math.abs(dot) < 0.1) {
    // Check if line lies in plane
    const dist = Math.abs(planeOffset.value)
    if (dist < 0.1) return 'ligt in het vlak'
    return 'evenwijdig aan het vlak'
  }
  return 'snijdt het vlak'
})

// Calculate intersection point
const intersectionPoint = computed(() => {
  const dot = lineDirection.value.x * planeNormal.value.x + 
              lineDirection.value.y * planeNormal.value.y + 
              lineDirection.value.z * planeNormal.value.z
  
  if (Math.abs(dot) < 0.1) return null
  
  const t = -planeOffset.value / dot
  return {
    x: lineDirection.value.x * t,
    y: lineDirection.value.y * t,
    z: lineDirection.value.z * t
  }
})

// ==================== CUBE GEOMETRY ====================
const cubeVertices = [
  { x: -1.5, y: -1.5, z: -1.5 }, // 0: bottom-back-left
  { x: 1.5, y: -1.5, z: -1.5 },  // 1: bottom-back-right
  { x: 1.5, y: -1.5, z: 1.5 },   // 2: bottom-front-right
  { x: -1.5, y: -1.5, z: 1.5 },  // 3: bottom-front-left
  { x: -1.5, y: 1.5, z: -1.5 },  // 4: top-back-left
  { x: 1.5, y: 1.5, z: -1.5 },   // 5: top-back-right
  { x: 1.5, y: 1.5, z: 1.5 },    // 6: top-front-right
  { x: -1.5, y: 1.5, z: 1.5 }    // 7: top-front-left
]

const cubeEdges = [
  [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
  [4, 5], [5, 6], [6, 7], [7, 4], // top face
  [0, 4], [1, 5], [2, 6], [3, 7]  // vertical edges
]

// ==================== PYRAMID GEOMETRY ====================
const pyramidVertices = [
  { x: -1.5, y: -1.5, z: -1.5 }, // 0: base back-left
  { x: 1.5, y: -1.5, z: -1.5 },  // 1: base back-right
  { x: 1.5, y: -1.5, z: 1.5 },   // 2: base front-right
  { x: -1.5, y: -1.5, z: 1.5 },  // 3: base front-left
  { x: 0, y: 1.5, z: 0 }         // 4: apex
]

const pyramidEdges = [
  [0, 1], [1, 2], [2, 3], [3, 0], // base
  [0, 4], [1, 4], [2, 4], [3, 4]  // sides
]

// ==================== CROSS SECTION ====================
const crossSectionPoints = computed(() => {
  const vertices = solidType.value === 'cube' ? cubeVertices : pyramidVertices
  const edges = solidType.value === 'cube' ? cubeEdges : pyramidEdges
  const points = []
  
  for (const [i, j] of edges) {
    const p1 = vertices[i]
    const p2 = vertices[j]
    
    // Calculate intersection of edge with plane
    const t = findPlaneIntersection(p1, p2)
    if (t !== null && t >= 0 && t <= 1) {
      points.push({
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
        z: p1.z + t * (p2.z - p1.z)
      })
    }
  }
  
  return points
})

function findPlaneIntersection(p1, p2) {
  const { a, b, c, d } = sectionPlane.value
  const num = -(a * p1.x + b * p1.y + c * p1.z + d)
  const den = a * (p2.x - p1.x) + b * (p2.y - p1.y) + c * (p2.z - p1.z)
  
  if (Math.abs(den) < 0.001) return null
  return num / den
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  if (type === 'relation-identify') {
    // Randomize line direction and plane normal
    const directions = [
      { x: 1, y: 0, z: 0, rel: 'evenwijdig' },
      { x: 0, y: 1, z: 0, rel: 'loodrecht' },
      { x: 1, y: 1, z: 0, rel: 'snijdend' }
    ]
    const dir = directions[Math.floor(Math.random() * directions.length)]
    lineDirection.value = { x: dir.x, y: dir.y, z: dir.z }
    planeNormal.value = { x: 0, y: 1, z: 0 }
  } else if (type === 'section-shape') {
    sectionPlane.value = { 
      a: Math.random() > 0.5 ? 1 : 0, 
      b: Math.random() * 0.5, 
      c: Math.random() > 0.5 ? 1 : 0, 
      d: 0 
    }
  }
}

function checkChallenge() {
  if (challengeType.value === 'relation-identify') {
    const correct = userAnswer.value.toLowerCase().includes(linePlaneRelation.value.split(' ')[0])
    if (correct) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! De lijn ' + linePlaneRelation.value + '.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Kijk naar de hoek tussen de lijn en het vlak.'
    }
  }
}

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600

function getVisibleEdges() {
  const vertices = solidType.value === 'cube' ? cubeVertices : pyramidVertices
  const edges = solidType.value === 'cube' ? cubeEdges : pyramidEdges
  
  return edges.map(([i, j]) => ({
    p1: toIso(vertices[i].x, vertices[i].y, vertices[i].z),
    p2: toIso(vertices[j].x, vertices[j].y, vertices[j].z),
    hidden: false // Simplified visibility check
  }))
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
    title: 'Lijnen in de ruimte',
    description: 'Een lijn in de ruimte wordt bepaald door een richtingsvector.',
    focus: 'line-direction',
    instruction: 'Wijzig de richting van de lijn en observeer hoe deze door de ruimte loopt.',
    details: [
      'Een lijn heeft een richtingsvector (a, b, c)',
      'Lijnen kunnen evenwijdig, snijdend of kruisend zijn',
      'Richtingscoëfficiënten bepalen de helling'
    ]
  },
  {
    title: 'Vlakken in de ruimte',
    description: 'Een vlak wordt bepaald door een normaalvector en een punt.',
    focus: 'plane-normal',
    instruction: 'Wijzig de normaalvector van het vlak en observeer de oriëntatie.',
    details: [
      'Vergelijking: ax + by + cz + d = 0',
      '(a, b, c) is de normaalvector loodrecht op het vlak',
      'd bepaalt de afstand tot de oorsprong'
    ]
  },
  {
    title: 'Onderlinge ligging',
    description: 'Een lijn kan een vlak snijden, evenwijdig lopen of erin liggen.',
    focus: 'relation',
    instruction: 'Pas de lijn en het vlak aan en bepaal hun onderlinge ligging.',
    details: [
      'Snijdend: lijn en vlak hebben één punt gemeenschappelijk',
      'Evenwijdig: geen snijpunt, lijn staat niet loodrecht op normaal',
      'Liggen in: oneindig veel snijpunten'
    ]
  },
  {
    title: 'Doorsnede van een ruimtelichaam',
    description: 'Een vlak snijdt een kubus of piramide in een vlakke figuur.',
    focus: 'cross-section',
    instruction: 'Wijzig het snijdende vlak en observeer de doorsnede.',
    details: [
      'De doorsnede is een veelhoek',
      'Aantal zijden hangt af van het snijvlak',
      'Driehoek, vierhoek, vijfhoek of zeshoek mogelijk'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    updateModeFromStep()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    updateModeFromStep()
  }
}

function updateModeFromStep() {
  const focus = analysisSteps[currentStep.value].focus
  if (focus === 'cross-section') {
    visualizationMode.value = 'cross-section'
  } else {
    visualizationMode.value = 'positions'
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
            <PhCube class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Ruimtemeetkunde</h1>
            <p class="text-sm text-slate-500">Lijnen, vlakken en ruimtelichamen</p>
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
              
              <!-- Visualization Mode Switcher for Analysis -->
              <div v-if="currentStep >= 3" class="flex gap-2 mb-4">
                <button 
                  @click="visualizationMode = 'positions'"
                  :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', 
                    visualizationMode === 'positions' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhLineSegments class="inline mr-1" />
                  Posities
                </button>
                <button 
                  @click="visualizationMode = 'cross-section'"
                  :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', 
                    visualizationMode === 'cross-section' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhIntersect class="inline mr-1" />
                  Doorsnede
                </button>
                <button 
                  @click="visualizationMode = 'explorer'"
                  :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', 
                    visualizationMode === 'explorer' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                >
                  <PhEye class="inline mr-1" />
                  Verkenner
                </button>
              </div>

              <!-- Line Direction Controls -->
              <div v-if="analysisSteps[currentStep].focus === 'line-direction' || analysisSteps[currentStep].focus === 'relation'" class="space-y-3">
                <p class="text-sm font-bold text-brand-dark">Richtingsvector lijn</p>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">x-component</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ lineDirection.x.toFixed(1) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="lineDirection.x" 
                    min="-2" 
                    max="2" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">y-component</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ lineDirection.y.toFixed(1) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="lineDirection.y" 
                    min="-2" 
                    max="2" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">z-component</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ lineDirection.z.toFixed(1) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="lineDirection.z" 
                    min="-2" 
                    max="2" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Plane Normal Controls -->
              <div v-if="analysisSteps[currentStep].focus === 'plane-normal' || analysisSteps[currentStep].focus === 'relation'" class="space-y-3">
                <p class="text-sm font-bold text-brand-dark">Normaalvector vlak</p>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    @click="planeNormal = { x: 0, y: 1, z: 0 }"
                    :class="['py-2 rounded-lg text-xs font-medium transition-all', 
                      planeNormal.y === 1 && planeNormal.x === 0 ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                  >
                    Horizontaal
                  </button>
                  <button 
                    @click="planeNormal = { x: 1, y: 0, z: 0 }"
                    :class="['py-2 rounded-lg text-xs font-medium transition-all', 
                      planeNormal.x === 1 ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                  >
                    Verticaal X
                  </button>
                  <button 
                    @click="planeNormal = { x: 0, y: 0, z: 1 }"
                    :class="['py-2 rounded-lg text-xs font-medium transition-all', 
                      planeNormal.z === 1 ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                  >
                    Verticaal Z
                  </button>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">Afstand tot oorsprong (d)</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ planeOffset.toFixed(1) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="planeOffset" 
                    min="-2" 
                    max="2" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
              </div>

              <!-- Relation Display -->
              <div v-if="analysisSteps[currentStep].focus === 'relation'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Onderlinge ligging</p>
                <p class="text-sm text-brand-orange font-medium">
                  De lijn {{ linePlaneRelation }}
                </p>
                <div v-if="intersectionPoint" class="mt-2 text-xs font-mono text-slate-600">
                  Snijpunt: ({{ intersectionPoint.x.toFixed(2) }}, {{ intersectionPoint.y.toFixed(2) }}, {{ intersectionPoint.z.toFixed(2) }})
                </div>
              </div>

              <!-- Cross Section Controls -->
              <div v-if="visualizationMode === 'cross-section' || analysisSteps[currentStep].focus === 'cross-section'" class="space-y-4">
                <div class="flex gap-2">
                  <button 
                    @click="solidType = 'cube'"
                    :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', 
                      solidType === 'cube' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                  >
                    <PhCube class="inline mr-1" />
                    Kubus
                  </button>
                  <button 
                    @click="solidType = 'pyramid'"
                    :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', 
                      solidType === 'pyramid' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600']"
                  >
                    Piramide
                  </button>
                </div>
                
                <p class="text-sm font-bold text-brand-dark">Snijvlak oriëntatie</p>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">Hellingshoek X</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sectionPlane.a.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="sectionPlane.a" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">Hellingshoek Y</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sectionPlane.b.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="sectionPlane.b" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm text-slate-600">Hellingshoek Z</label>
                    <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sectionPlane.c.toFixed(2) }}</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="sectionPlane.c" 
                    min="-1" 
                    max="1" 
                    step="0.1"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                </div>
                
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    v-model="showHiddenEdges"
                    id="hidden-edges"
                    class="rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
                  >
                  <label for="hidden-edges" class="text-sm text-slate-600">Toon verborgen ribben</label>
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
              <h2 class="text-base font-bold text-slate-800 mb-1">Toepassingsopdrachten</h2>
              <p class="text-sm text-slate-600">Oefen met ruimtemeetkundige problemen.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('relation-identify')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Lijn-vlak relaties</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal of een lijn een vlak snijdt, evenwijdig loopt of erin ligt.</div>
                </button>
                
                <button @click="generateChallenge('section-shape')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Doorsnedevormen</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal de vorm van de doorsnede van een ruimtelichaam.</div>
                </button>
                
                <button @click="generateChallenge('construct-section')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Constructie-oefening</div>
                  <div class="text-xs text-slate-500 mt-1">Construeer een doorsnede door drie punten.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium" v-if="challengeType === 'relation-identify'">
                    Bepaal de onderlinge ligging van de lijn en het vlak.
                  </p>
                  <p class="text-sm font-medium" v-else-if="challengeType === 'section-shape'">
                    Wat is de vorm van de doorsnede?
                  </p>
                  <p class="text-sm font-medium" v-else>
                    Construeer de doorsnede door de drie aangegeven punten.
                  </p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2" v-if="challengeType === 'relation-identify'">
                    <label class="text-sm font-bold text-slate-700">Onderlinge ligging</label>
                    <select 
                      v-model="userAnswer"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                      <option value="">Kies een antwoord...</option>
                      <option value="snijdend">Snijdt het vlak</option>
                      <option value="evenwijdig">Evenwijdig aan het vlak</option>
                      <option value="ligt in">Ligt in het vlak</option>
                      <option value="loodrecht">Loodrecht op het vlak</option>
                    </select>
                  </div>
                  <div class="space-y-2" v-else-if="challengeType === 'section-shape'">
                    <label class="text-sm font-bold text-slate-700">Vorm van de doorsnede</label>
                    <select 
                      v-model="userAnswer"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                      <option value="">Kies een antwoord...</option>
                      <option value="driehoek">Driehoek</option>
                      <option value="vierhoek">Vierhoek (rechthoek/trapezium)</option>
                      <option value="vijfhoek">Vijfhoek</option>
                      <option value="zeshoek">Zeshoek</option>
                    </select>
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
              <div v-if="visualizationMode !== 'cross-section'" class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Richtingsvector:</span>
                  <span class="font-mono">({{ lineDirection.x.toFixed(1) }}, {{ lineDirection.y.toFixed(1) }}, {{ lineDirection.z.toFixed(1) }})</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Normaalvector:</span>
                  <span class="font-mono">({{ planeNormal.x.toFixed(1) }}, {{ planeNormal.y.toFixed(1) }}, {{ planeNormal.z.toFixed(1) }})</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Relatie:</span>
                  <span :class="['font-medium', intersectionPoint ? 'text-emerald-600' : 'text-amber-600']">{{ linePlaneRelation }}</span>
                </div>
                <div v-if="intersectionPoint" class="flex justify-between">
                  <span class="text-slate-600">Snijpunt:</span>
                  <span class="font-mono text-brand-orange">({{ intersectionPoint.x.toFixed(2) }}, {{ intersectionPoint.y.toFixed(2) }})</span>
                </div>
              </div>
              <div v-else class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-600">Ruimtelichaam:</span>
                  <span class="font-medium">{{ solidType === 'cube' ? 'Kubus' : 'Piramide' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Aantal snijpunten:</span>
                  <span class="font-mono text-brand-orange">{{ crossSectionPoints.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Doorsnedevorm:</span>
                  <span class="font-medium">{{ crossSectionPoints.length <= 2 ? 'lijnstuk' : crossSectionPoints.length + '-hoek' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: 3D Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Title Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">
                {{ visualizationMode === 'positions' ? 'Lijn en vlak in de ruimte' : 
                   visualizationMode === 'cross-section' ? 'Doorsnede van ' + (solidType === 'cube' ? 'een kubus' : 'een piramide') :
                   '3D Verkenner' }}
              </span>
            </div>
          </div>

          <!-- 3D Visualization Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Background grid -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <!-- Coordinate axes -->
              <line 
                :x1="toIso(-4, 0, 0).x" :y1="toIso(-4, 0, 0).y"
                :x2="toIso(4, 0, 0).x" :y2="toIso(4, 0, 0).y"
                stroke="#94A3B8" stroke-width="2"
              />
              <line 
                :x1="toIso(0, -3, 0).x" :y1="toIso(0, -3, 0).y"
                :x2="toIso(0, 3, 0).x" :y2="toIso(0, 3, 0).y"
                stroke="#94A3B8" stroke-width="2"
              />
              <line 
                :x1="toIso(0, 0, -4).x" :y1="toIso(0, 0, -4).y"
                :x2="toIso(0, 0, 4).x" :y2="toIso(0, 0, 4).y"
                stroke="#94A3B8" stroke-width="2"
              />
              
              <!-- Axis labels -->
              <text :x="toIso(4.2, 0, 0).x" :y="toIso(4.2, 0, 0).y" class="fill-slate-500 text-sm font-bold">X</text>
              <text :x="toIso(0, 3.2, 0).x" :y="toIso(0, 3.2, 0).y" class="fill-slate-500 text-sm font-bold">Y</text>
              <text :x="toIso(0, 0, 4.2).x" :y="toIso(0, 0, 4.2).y" class="fill-slate-500 text-sm font-bold">Z</text>

              <!-- Mode: Line and Plane Positions -->
              <g v-if="visualizationMode === 'positions'">
                <!-- Plane visualization -->
                <polygon 
                  :points="`
                    ${toIso(-3, -planeOffset, -3).x},${toIso(-3, -planeOffset, -3).y} 
                    ${toIso(3, -planeOffset, -3).x},${toIso(3, -planeOffset, -3).y} 
                    ${toIso(3, -planeOffset, 3).x},${toIso(3, -planeOffset, 3).y} 
                    ${toIso(-3, -planeOffset, 3).x},${toIso(-3, -planeOffset, 3).y}
                  `" 
                  fill="rgba(249, 115, 22, 0.2)" 
                  stroke="#F97316" 
                  stroke-width="2"
                />
                
                <!-- Normal vector -->
                <line 
                  :x1="toIso(0, -planeOffset, 0).x" :y1="toIso(0, -planeOffset, 0).y"
                  :x2="toIso(planeNormal.x * 2, -planeOffset + planeNormal.y * 2, planeNormal.z * 2).x" 
                  :y2="toIso(planeNormal.x * 2, -planeOffset + planeNormal.y * 2, planeNormal.z * 2).y"
                  stroke="#F97316" stroke-width="3" marker-end="url(#arrowhead)"
                />
                
                <!-- Line visualization -->
                <line 
                  :x1="toIso(-lineDirection.x * 3, -lineDirection.y * 3, -lineDirection.z * 3).x" 
                  :y1="toIso(-lineDirection.x * 3, -lineDirection.y * 3, -lineDirection.z * 3).y"
                  :x2="toIso(lineDirection.x * 3, lineDirection.y * 3, lineDirection.z * 3).x" 
                  :y2="toIso(lineDirection.x * 3, lineDirection.y * 3, lineDirection.z * 3).y"
                  stroke="#3B82F6" stroke-width="3"
                />
                
                <!-- Intersection point -->
                <circle 
                  v-if="intersectionPoint"
                  :cx="toIso(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z).x"
                  :cy="toIso(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z).y"
                  r="6" fill="#10B981" stroke="white" stroke-width="2"
                />
              </g>

              <!-- Mode: Cross Section -->
              <g v-if="visualizationMode === 'cross-section'">
                <!-- Solid edges -->
                <g v-for="(edge, idx) in getVisibleEdges()" :key="idx">
                  <line 
                    :x1="edge.p1.x" :y1="edge.p1.y"
                    :x2="edge.p2.x" :y2="edge.p2.y"
                    :stroke="edge.hidden && !showHiddenEdges ? 'none' : '#64748B'"
                    :stroke-width="edge.hidden ? 1 : 2"
                    :stroke-dasharray="edge.hidden ? '4,4' : 'none'"
                    :opacity="edge.hidden ? 0.5 : 1"
                  />
                </g>
                
                <!-- Cross section polygon -->
                <polygon 
                  v-if="crossSectionPoints.length >= 3"
                  :points="crossSectionPoints.map(p => `${toIso(p.x, p.y, p.z).x},${toIso(p.x, p.y, p.z).y}`).join(' ')"
                  fill="rgba(249, 115, 22, 0.4)" 
                  stroke="#F97316" 
                  stroke-width="3"
                />
                
                <!-- Cross section points -->
                <circle 
                  v-for="(point, idx) in crossSectionPoints" 
                  :key="idx"
                  :cx="toIso(point.x, point.y, point.z).x"
                  :cy="toIso(point.x, point.y, point.z).y"
                  r="5" fill="#F97316" stroke="white" stroke-width="2"
                />
                
                <!-- Cutting plane indicator -->
                <polygon 
                  :points="`
                    ${toIso(-4, 0, -4).x},${toIso(-4, 0, -4).y} 
                    ${toIso(4, 0, -4).x},${toIso(4, 0, -4).y} 
                    ${toIso(4, 0, 4).x},${toIso(4, 0, 4).y} 
                    ${toIso(-4, 0, 4).x},${toIso(-4, 0, 4).y}
                  `" 
                  fill="rgba(100, 116, 139, 0.1)" 
                  stroke="#64748B" 
                  stroke-width="1"
                  stroke-dasharray="5,5"
                  opacity="0.5"
                />
              </g>

              <!-- Mode: 3D Explorer -->
              <g v-if="visualizationMode === 'explorer'">
                <!-- Multiple solids preview -->
                <g v-for="offset in [-3, 0, 3]" :key="offset" :transform="`translate(${offset * 50}, 0)`">
                  <!-- Small cube -->
                  <polygon 
                    :points="`
                      ${toIso(offset - 0.5, -0.5, -0.5).x},${toIso(offset - 0.5, -0.5, -0.5).y} 
                      ${toIso(offset + 0.5, -0.5, -0.5).x},${toIso(offset + 0.5, -0.5, -0.5).y} 
                      ${toIso(offset + 0.5, 0.5, -0.5).x},${toIso(offset + 0.5, 0.5, -0.5).y} 
                      ${toIso(offset - 0.5, 0.5, -0.5).x},${toIso(offset - 0.5, 0.5, -0.5).y}
                    `" 
                    fill="rgba(59, 130, 246, 0.3)" 
                    stroke="#3B82F6" 
                    stroke-width="1"
                  />
                </g>
              </g>

              <!-- Arrow marker definition -->
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#F97316" />
                </marker>
              </defs>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div v-if="visualizationMode === 'positions'" class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-blue-500"></div>
                    <span class="text-slate-600">Lijn</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-orange-500/20 border border-orange-500"></div>
                    <span class="text-slate-600">Vlak</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-slate-600">Snijpunt</span>
                  </div>
                </div>
                <div v-else-if="visualizationMode === 'cross-section'" class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-orange-500/40 border-2 border-orange-500"></div>
                    <span class="text-slate-600">Doorsnede</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-slate-500"></div>
                    <span class="text-slate-600">Zichtbare ribben</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-slate-400" style="border-top: 2px dashed #94A3B8;"></div>
                    <span class="text-slate-600">Verborgen ribben</span>
                  </div>
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
