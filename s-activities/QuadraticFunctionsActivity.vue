<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhChartLineUp
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' } // 'analysis' or 'derivation'
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0) // For guided analysis mode

// Mathematical parameters
const a = ref(1)
const b = ref(0)
const c = ref(0)
const p = ref(0) // Top x-coordinate
const q = ref(0) // Top y-coordinate

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'top-point', 'roots-point', 'three-points'
const targetA = ref(0)
const targetB = ref(0)
const targetC = ref(0)
const userA = ref(1)
const userB = ref(0)
const userC = ref(0)
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Current function evaluation
const f = (x) => a.value * x * x + b.value * x + c.value

// Calculate top coordinates from a, b, c
const calculatedP = computed(() => {
  if (a.value === 0) return 0
  return -b.value / (2 * a.value)
})

const calculatedQ = computed(() => {
  return f(calculatedP.value)
})

// Discriminant and roots
const discriminant = computed(() => b.value * b.value - 4 * a.value * c.value)
const hasRealRoots = computed(() => discriminant.value >= 0)
const root1 = computed(() => {
  if (!hasRealRoots.value) return null
  return (-b.value - Math.sqrt(discriminant.value)) / (2 * a.value)
})
const root2 = computed(() => {
  if (!hasRealRoots.value) return null
  return (-b.value + Math.sqrt(discriminant.value)) / (2 * a.value)
})

// Equation display
const equationText = computed(() => {
  const formatNum = (n) => n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : ''
  let text = `f(x) = ${a.value}x²`
  if (b.value !== 0) text += ` ${formatNum(b.value)}x`
  if (c.value !== 0) text += ` ${formatNum(c.value)}`
  return text
})

const vertexFormText = computed(() => {
  const formatNum = (n) => n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : ''
  let text = `f(x) = ${a.value}(x`
  text += calculatedP.value >= 0 ? ` - ${calculatedP.value.toFixed(2)})²` : ` + ${Math.abs(calculatedP.value).toFixed(2)})²`
  if (calculatedQ.value !== 0) text += ` ${formatNum(calculatedQ.value.toFixed(2))}`
  return text
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate random parameters for target function
  targetA.value = (Math.random() * 3 + 0.5) * (Math.random() > 0.5 ? 1 : -1)
  targetB.value = (Math.random() * 8 - 4)
  targetC.value = (Math.random() * 8 - 4)
  
  // Reset user inputs
  userA.value = 1
  userB.value = 0
  userC.value = 0
}

function checkChallenge() {
  const tolerance = 0.1
  const aCorrect = Math.abs(userA.value - targetA.value) < tolerance
  const bCorrect = Math.abs(userB.value - targetB.value) < tolerance
  const cCorrect = Math.abs(userC.value - targetC.value) < tolerance
  
  if (aCorrect && bCorrect && cCorrect) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! De parabool komt exact overeen.'
  } else {
    const errors = []
    if (!aCorrect) errors.push('a')
    if (!bCorrect) errors.push('b')
    if (!cCorrect) errors.push('c')
    challengeFeedback.value = `Nog niet juist. Controleer parameter(s): ${errors.join(', ')}`
  }
}

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

function generateParabolaPath(a, b, c) {
  let path = ''
  for (let x = viewBoxX; x <= viewBoxX + viewBoxWidth; x += 0.1) {
    const y = a * x * x + b * x + c
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

const currentParabolaPath = computed(() => generateParabolaPath(a.value, b.value, c.value))
const challengeTargetPath = computed(() => 
  challengeActive.value ? generateParabolaPath(targetA.value, targetB.value, targetC.value) : ''
)
const userParabolaPath = computed(() => generateParabolaPath(userA.value, userB.value, userC.value))

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
    title: 'Invloed van parameter a',
    description: 'Parameter a bepaalt de opening en richting van de parabool.',
    focus: 'a',
    instruction: 'Wijzig de waarde van a en observeer het effect op de grafiek.'
  },
  {
    title: 'Invloed van parameter b',
    description: 'Parameter b beïnvloedt de helling en de x-coördinaat van de top.',
    focus: 'b',
    instruction: 'Wijzig de waarde van b en observeer de verschuiving van de top.'
  },
  {
    title: 'Invloed van parameter c',
    description: 'Parameter c bepaalt het snijpunt met de y-as.',
    focus: 'c',
    instruction: 'Wijzig de waarde van c en observeer het snijpunt met de y-as.'
  },
  {
    title: 'Topvorm analyse',
    description: 'De topvorm f(x) = a(x - p)² + q toont direct de coördinaten van de top.',
    focus: 'vertex',
    instruction: 'Bepaal p (x-coördinaat) en q (y-coördinaat) van de top.'
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
            <h1 class="text-lg font-bold text-slate-800">Tweedegraadsfuncties</h1>
            <p class="text-sm text-slate-500">Analyse en voorschriftbepaling</p>
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
              Voorschriftbepaling
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
              
              <!-- Parameter a -->
              <div v-if="analysisSteps[currentStep].focus === 'a' || analysisSteps[currentStep].focus === 'vertex'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">a (opening)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ a }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="a" 
                  min="-3" 
                  max="3" 
                  step="0.1"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
                <div class="flex justify-between text-xs text-slate-400">
                  <span>Negatief</span>
                  <span>|a| &lt; 1: breed</span>
                  <span>|a| &gt; 1: smal</span>
                </div>
              </div>

              <!-- Parameter b -->
              <div v-if="analysisSteps[currentStep].focus === 'b'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">b (helling)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ b }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="b" 
                  min="-8" 
                  max="8" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Parameter c -->
              <div v-if="analysisSteps[currentStep].focus === 'c'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">c (y-snijpunt)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ c }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="c" 
                  min="-6" 
                  max="6" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Vertex form parameters -->
              <template v-if="analysisSteps[currentStep].focus === 'vertex'">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p class="text-sm font-bold text-slate-700 mb-2">Topvorm: f(x) = a(x - p)² + q</p>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-slate-600">p (top x)</span>
                      <span class="text-sm font-mono">{{ calculatedP.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-slate-600">q (top y)</span>
                      <span class="text-sm font-mono">{{ calculatedQ.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <!-- Mode: Formula Derivation -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Voorschriftbepaling</h2>
              <p class="text-sm text-slate-600">Stel het voorschrift op vanuit de gegeven grafiek.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('top-point')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: top + punt</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal a, p en q vanuit de top en één extra punt.</div>
                </button>
                
                <button @click="generateChallenge('roots-point')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: nulpunten + punt</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal a, x₁ en x₂ vanuit de nulpunten.</div>
                </button>
                
                <button @click="generateChallenge('three-points')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: drie punten</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal a, b en c vanuit drie willekeurige punten.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal het voorschrift:</p>
                  <p class="text-xs text-white/70 mt-1">
                    <span v-if="challengeType === 'top-point'">Gebruik de top (groen) en het extra punt.</span>
                    <span v-if="challengeType === 'roots-point'">Gebruik de nulpunten (oranje) en het extra punt.</span>
                    <span v-if="challengeType === 'three-points'">Gebruik de drie aangegeven punten.</span>
                  </p>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">a</label>
                    <input 
                      type="number" 
                      v-model.number="userA" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">b</label>
                    <input 
                      type="number" 
                      v-model.number="userB" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">c</label>
                    <input 
                      type="number" 
                      v-model.number="userC" 
                      step="0.1"
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
              <div class="flex justify-between">
                <span class="text-slate-600">Domein:</span>
                <span class="font-mono">ℝ</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Bereik:</span>
                <span class="font-mono">{{ a > 0 ? '[' : ']' }}{{ calculatedQ.toFixed(2) }}, {{ a > 0 ? '∞[' : '-∞[' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Top:</span>
                <span class="font-mono">({{ calculatedP.toFixed(2) }}, {{ calculatedQ.toFixed(2) }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Symmetrieas:</span>
                <span class="font-mono">x = {{ calculatedP.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Nulwaarden:</span>
                <span class="font-mono">
                  <span v-if="hasRealRoots">{{ root1?.toFixed(2) }}, {{ root2?.toFixed(2) }}</span>
                  <span v-else class="text-slate-400">Geen reële wortels</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Discriminant:</span>
                <span class="font-mono" :class="discriminant >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ discriminant.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Equation Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Algemene vorm:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">{{ equationText }}</span>
            </div>
            <div class="flex items-center justify-center gap-4 mt-2">
              <span class="text-sm text-slate-500">Topvorm:</span>
              <span class="text-lg font-mono text-slate-600">{{ vertexFormText }}</span>
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

              <!-- Challenge target parabola (in derivation mode) -->
              <path 
                v-if="challengeActive && currentMode === 'derivation'" 
                :d="challengeTargetPath" 
                fill="none" 
                stroke="#CBD5E1" 
                stroke-width="3" 
                stroke-dasharray="8,4"
              />

              <!-- User parabola in challenge mode -->
              <path 
                v-if="challengeActive && currentMode === 'derivation'" 
                :d="userParabolaPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
                opacity="0.7"
              />

              <!-- Current parabola -->
              <path 
                v-else
                :d="currentParabolaPath" 
                fill="none" 
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Top point marker -->
              <circle 
                :cx="toSvgX(calculatedP)" 
                :cy="toSvgY(calculatedQ)" 
                r="5" 
                fill="#10B981" 
                stroke="white" 
                stroke-width="2"
              />
              <text 
                :x="toSvgX(calculatedP)" 
                :y="toSvgY(calculatedQ) - 10" 
                text-anchor="middle" 
                class="fill-emerald-600 text-xs font-bold"
              >
                Top
              </text>

              <!-- Y-intercept marker -->
              <circle 
                :cx="toSvgX(0)" 
                :cy="toSvgY(c)" 
                r="5" 
                fill="#EC4899" 
                stroke="white" 
                stroke-width="2"
              />

              <!-- Root markers -->
              <g v-if="hasRealRoots">
                <circle 
                  v-if="root1 !== null"
                  :cx="toSvgX(root1)" 
                  :cy="toSvgY(0)" 
                  r="5" 
                  fill="#F59E0B" 
                  stroke="white" 
                  stroke-width="2"
                />
                <circle 
                  v-if="root2 !== null"
                  :cx="toSvgX(root2)" 
                  :cy="toSvgY(0)" 
                  r="5" 
                  fill="#F59E0B" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Top</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span class="text-slate-600">Y-snijpunt</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span class="text-slate-600">Nulpunten</span>
                </div>
                <div v-if="challengeActive && currentMode === 'derivation'" class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-slate-300" style="border-top: 2px dashed #CBD5E1;"></div>
                  <span class="text-slate-600">Doelparabool</span>
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
