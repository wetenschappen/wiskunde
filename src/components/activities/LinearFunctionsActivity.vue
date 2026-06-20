<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhFunction, PhGraph, PhCalculator, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhEquals, PhChartLineUp, PhTable, PhIntersect
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' } // 'analysis' or 'derivation'
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)

// Mathematical parameters for linear function f(x) = ax + b
const a = ref(1) // Slope (richtingscoëfficiënt)
const b = ref(0) // Y-intercept

// Second line for system of equations mode
const showSecondLine = ref(false)
const a2 = ref(-0.5)
const b2 = ref(3)

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // 'two-points', 'point-slope', 'graph-reading'
const targetA = ref(0)
const targetB = ref(0)
const userA = ref(1)
const userB = ref(0)
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// Points for challenge mode
const point1 = ref({ x: 0, y: 0 })
const point2 = ref({ x: 0, y: 0 })

// ==================== COMPUTED PROPERTIES ====================
// Current function evaluation
const f = (x) => a.value * x + b.value
const f2 = (x) => a2.value * x + b2.value

// Zero of the function (x when f(x) = 0)
const zero = computed(() => {
  if (a.value === 0) return null // Constant function, no zero or infinite zeros
  return -b.value / a.value
})

// Intersection of two lines
const intersection = computed(() => {
  if (a.value === a2.value) return null // Parallel lines
  const x = (b2.value - b.value) / (a.value - a2.value)
  const y = f(x)
  return { x, y }
})

// Equation display
const equationText = computed(() => {
  const formatNum = (n) => {
    if (n === 0) return ''
    return n > 0 ? `+ ${n}` : `- ${Math.abs(n)}`
  }
  
  if (a.value === 0) {
    return `f(x) = ${b.value}`
  }
  
  let text = 'f(x) = '
  if (a.value === 1) {
    text += 'x'
  } else if (a.value === -1) {
    text += '-x'
  } else {
    text += `${a.value}x`
  }
  
  if (b.value !== 0) {
    text += ` ${formatNum(b.value)}`
  }
  
  return text
})

// Slope interpretation
const slopeInterpretation = computed(() => {
  if (a.value > 0) return 'Stijgende rechte'
  if (a.value < 0) return 'Dalende rechte'
  return 'Constante functie (horizontaal)'
})

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  
  // Generate random but reasonable parameters
  targetA.value = Math.round((Math.random() * 4 - 2) * 2) / 2 // -2 to 2 in steps of 0.5
  if (targetA.value === 0) targetA.value = 0.5
  targetB.value = Math.round((Math.random() * 6 - 3) * 2) / 2 // -3 to 3
  
  // Reset user inputs
  userA.value = 1
  userB.value = 0
  
  // Generate points based on challenge type
  if (type === 'two-points') {
    point1.value = { x: 0, y: targetB.value }
    point2.value = { x: 2, y: targetA.value * 2 + targetB.value }
  } else if (type === 'point-slope') {
    point1.value = { x: 1, y: targetA.value + targetB.value }
  }
}

function checkChallenge() {
  const tolerance = 0.1
  const aCorrect = Math.abs(userA.value - targetA.value) < tolerance
  const bCorrect = Math.abs(userB.value - targetB.value) < tolerance
  
  if (aCorrect && bCorrect) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! Het voorschrift komt exact overeen met de gegeven informatie.'
  } else {
    const errors = []
    if (!aCorrect) errors.push('richtingscoëfficiënt (a)')
    if (!bCorrect) errors.push('snijpunt met y-as (b)')
    challengeFeedback.value = `Nog niet juist. Controleer de ${errors.join(' en ')}.`
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

function generateLinePath(a, b) {
  // Generate points for the line across the entire view
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

const currentLine = computed(() => generateLinePath(a.value, b.value))
const secondLine = computed(() => generateLinePath(a2.value, b2.value))
const userLine = computed(() => generateLinePath(userA.value, userB.value))
const targetLine = computed(() => generateLinePath(targetA.value, targetB.value))

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
    title: 'Invloed van de richtingscoëfficiënt',
    description: 'De parameter a bepaalt de richting en steilheid van de rechte.',
    focus: 'a',
    instruction: 'Wijzig de waarde van a en observeer het effect op de grafiek.',
    details: [
      'a > 0: stijgende rechte',
      'a < 0: dalende rechte', 
      'a = 0: constante functie',
      '|a| > 1: steile rechte',
      '|a| < 1: vlakke rechte'
    ]
  },
  {
    title: 'Invloed van het snijpunt met de y-as',
    description: 'De parameter b bepaalt waar de rechte de y-as snijdt.',
    focus: 'b',
    instruction: 'Wijzig de waarde van b en observeer de verschuiving.',
    details: [
      'b > 0: snijpunt boven de oorsprong',
      'b < 0: snijpunt onder de oorsprong',
      'b = 0: rechte door de oorsprong (f(x) = ax)'
    ]
  },
  {
    title: 'Nulwaarde bepalen',
    description: 'De nulwaarde is het x-coördinaat waar de grafiek de x-as snijdt.',
    focus: 'zero',
    instruction: 'Bepaal grafisch de nulwaarde en controleer met de formule x = -b/a.',
    details: [
      'Als a ≠ 0: één nulwaarde',
      'Als a = 0 en b ≠ 0: geen nulwaarde',
      'Als a = 0 en b = 0: oneindig veel nulwaarden'
    ]
  },
  {
    title: 'Stelsel van vergelijkingen',
    description: 'Beschouw twee eerstegraadsfuncties en hun snijpunt.',
    focus: 'system',
    instruction: 'Wijzig de parameters van beide rechten en observeer het snijpunt.',
    details: [
      'Verschillende richtingscoëfficiënt: één snijpunt',
      'Gelijke richtingscoëfficiënt, verschillend snijpunt: geen snijpunt (evenwijdig)',
      'Gelijke richtingscoëfficiënt, gelijk snijpunt: oneindig veel snijpunten (samenvallend)'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    if (analysisSteps[currentStep.value].focus === 'system') {
      showSecondLine.value = true
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    if (analysisSteps[currentStep.value].focus !== 'system') {
      showSecondLine.value = false
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
            <PhChartLineUp class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Eerstegraadsfuncties</h1>
            <p class="text-sm text-slate-500">Analyse en voorschriftbepaling</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Mode Switcher -->
          <div class="flex bg-slate-100 rounded-lg p-1">
            <button 
              @click="currentMode = 'analysis'; showSecondLine = false"
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
              
              <!-- Parameter a (slope) -->
              <div v-if="analysisSteps[currentStep].focus === 'a' || analysisSteps[currentStep].focus === 'system'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">a (richtingscoëfficiënt)</label>
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
                  <span>Nul</span>
                  <span>Positief</span>
                </div>
              </div>

              <!-- Parameter b (intercept) -->
              <div v-if="analysisSteps[currentStep].focus === 'b' || analysisSteps[currentStep].focus === 'system'" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-bold text-brand-dark">b (snijpunt y-as)</label>
                  <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ b }}</span>
                </div>
                <input 
                  type="range" 
                  v-model.number="b" 
                  min="-5" 
                  max="5" 
                  step="0.5"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                >
              </div>

              <!-- Zero point visualization -->
              <div v-if="analysisSteps[currentStep].focus === 'zero'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Nulwaarde berekening</p>
                <div class="text-sm font-mono space-y-1">
                  <p>f(x) = 0</p>
                  <p>{{ a }}x + {{ b }} = 0</p>
                  <p>{{ a }}x = {{ -b }}</p>
                  <p v-if="a !== 0" class="text-brand-orange">x = {{ zero?.toFixed(2) }}</p>
                  <p v-else class="text-rose-600">Ongedefinieerd (a = 0)</p>
                </div>
              </div>

              <!-- Second line controls for system -->
              <template v-if="analysisSteps[currentStep].focus === 'system'">
                <div class="border-t border-slate-200 pt-4 mt-4">
                  <p class="text-sm font-bold text-slate-700 mb-3">Tweede functie: g(x) = a₂x + b₂</p>
                  
                  <div class="space-y-3">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">a₂</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ a2 }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="a2" 
                        min="-3" 
                        max="3" 
                        step="0.1"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                    
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">b₂</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ b2 }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="b2" 
                        min="-5" 
                        max="5" 
                        step="0.5"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
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

          <!-- Mode: Formula Derivation -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Voorschriftbepaling</h2>
              <p class="text-sm text-slate-600">Stel het voorschrift op vanuit de gegeven informatie.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('two-points')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: twee punten</div>
                  <div class="text-xs text-slate-500 mt-1">Bereken eerst de richtingscoëfficiënt, dan het snijpunt.</div>
                </button>
                
                <button @click="generateChallenge('point-slope')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: punt en richtingscoëfficiënt</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal b door het punt in te vullen.</div>
                </button>
                
                <button @click="generateChallenge('graph-reading')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Gegeven: grafiek</div>
                  <div class="text-xs text-slate-500 mt-1">Lees de richtingscoëfficiënt en het snijpunt af.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Bepaal het voorschrift f(x) = ax + b:</p>
                  <div v-if="challengeType === 'two-points'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Punt 1: ({{ point1.x }}, {{ point1.y }})</p>
                    <p>Punt 2: ({{ point2.x }}, {{ point2.y }})</p>
                    <p class="mt-2 text-white/60">Tip: a = (y₂-y₁)/(x₂-x₁)</p>
                  </div>
                  <div v-if="challengeType === 'point-slope'" class="mt-2 text-xs text-white/80 space-y-1">
                    <p>Punt: ({{ point1.x }}, {{ point1.y }})</p>
                    <p>Richtingscoëfficiënt: {{ targetA }}</p>
                    <p class="mt-2 text-white/60">Tip: vul het punt in om b te vinden</p>
                  </div>
                  <div v-if="challengeType === 'graph-reading'" class="mt-2 text-xs text-white/80">
                    <p>Lees de waarden af uit de getekende grafiek.</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">a (richtingscoëfficiënt)</label>
                    <input 
                      type="number" 
                      v-model.number="userA" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">b (snijpunt y-as)</label>
                    <input 
                      type="number" 
                      v-model.number="userB" 
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
                <span class="font-mono">
                  <span v-if="a === 0">&#123; {{ b }} &#125;</span>
                  <span v-else>ℝ</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Richting:</span>
                <span :class="['font-medium', a > 0 ? 'text-emerald-600' : a < 0 ? 'text-rose-600' : 'text-slate-500']">{{ slopeInterpretation }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Nulwaarde:</span>
                <span class="font-mono">
                  <span v-if="a !== 0">x = {{ zero?.toFixed(2) }}</span>
                  <span v-else-if="b === 0">alle x ∈ ℝ</span>
                  <span v-else class="text-slate-400">geen</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Snijpunt y-as:</span>
                <span class="font-mono">(0, {{ b }})</span>
              </div>
              <div v-if="showSecondLine && intersection" class="flex justify-between border-t border-slate-200 pt-2 mt-2">
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
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Functievoorschrift:</span>
              <span class="text-2xl font-mono font-bold text-brand-dark">{{ equationText }}</span>
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

              <!-- Challenge target line (in derivation mode) -->
              <line 
                v-if="challengeActive && currentMode === 'derivation'" 
                :x1="targetLine.x1" :y1="targetLine.y1" 
                :x2="targetLine.x2" :y2="targetLine.y2"
                stroke="#CBD5E1" 
                stroke-width="3" 
                stroke-dasharray="8,4"
              />

              <!-- User line in challenge mode -->
              <line 
                v-if="challengeActive && currentMode === 'derivation'" 
                :x1="userLine.x1" :y1="userLine.y1" 
                :x2="userLine.x2" :y2="userLine.y2"
                stroke="#F97316" 
                stroke-width="3"
                opacity="0.7"
              />

              <!-- Current line -->
              <line 
                v-else
                :x1="currentLine.x1" :y1="currentLine.y1" 
                :x2="currentLine.x2" :y2="currentLine.y2"
                stroke="#F97316" 
                stroke-width="3"
              />

              <!-- Second line for system mode -->
              <line 
                v-if="showSecondLine"
                :x1="secondLine.x1" :y1="secondLine.y1" 
                :x2="secondLine.x2" :y2="secondLine.y2"
                stroke="#6366F1" 
                stroke-width="3"
              />

              <!-- Y-intercept marker -->
              <circle 
                :cx="toSvgX(0)" 
                :cy="toSvgY(b)" 
                r="5" 
                fill="#EC4899" 
                stroke="white" 
                stroke-width="2"
              />
              <text 
                :x="toSvgX(0) - 10" 
                :y="toSvgY(b)" 
                text-anchor="end" 
                class="fill-pink-600 text-xs font-bold"
              >
                (0, {{ b }})
              </text>

              <!-- Zero point marker -->
              <circle 
                v-if="a !== 0"
                :cx="toSvgX(zero)" 
                :cy="toSvgY(0)" 
                r="5" 
                fill="#F59E0B" 
                stroke="white" 
                stroke-width="2"
              />

              <!-- Second line intercept -->
              <circle 
                v-if="showSecondLine"
                :cx="toSvgX(0)" 
                :cy="toSvgY(b2)" 
                r="5" 
                fill="#6366F1" 
                stroke="white" 
                stroke-width="2"
              />

              <!-- Intersection point -->
              <g v-if="showSecondLine && intersection">
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
                  Snijpunt
                </text>
              </g>

              <!-- Challenge points -->
              <g v-if="challengeActive">
                <circle 
                  :cx="toSvgX(point1.x)" 
                  :cy="toSvgY(point1.y)" 
                  r="5" 
                  fill="#3B82F6" 
                  stroke="white" 
                  stroke-width="2"
                />
                <circle 
                  v-if="challengeType === 'two-points'"
                  :cx="toSvgX(point2.x)" 
                  :cy="toSvgY(point2.y)" 
                  r="5" 
                  fill="#3B82F6" 
                  stroke="white" 
                  stroke-width="2"
                />
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">f(x)</span>
                </div>
                <div v-if="showSecondLine" class="flex items-center gap-2">
                  <div class="w-3 h-0.5 bg-indigo-500"></div>
                  <span class="text-slate-600">g(x)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span class="text-slate-600">Y-snijpunt</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span class="text-slate-600">Nulwaarde</span>
                </div>
                <div v-if="showSecondLine && intersection" class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Snijpunt</span>
                </div>
                <div v-if="challengeActive && currentMode === 'derivation'" class="flex items-center gap-2">
                  <div class="w-4 h-0.5 bg-slate-300" style="border-top: 2px dashed #CBD5E1;"></div>
                  <span class="text-slate-600">Doelgrafiek</span>
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
