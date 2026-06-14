<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhTriangle, PhShapes, PhCube,
  PhCalculator, PhArrowRight, PhArrowLeft,
  PhArrowsOutCardinal, PhCheckCircle
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentSubMode = ref('proof') // 'proof', 'calculator', 'spatial'

// Triangle parameters for calculator
const sideA = ref(3)
const sideB = ref(4)
const calculatedC = computed(() => Math.sqrt(sideA.value ** 2 + sideB.value ** 2))

// Spatial geometry
const cubeSide = ref(4)
const pyramidHeight = ref(6)
const pyramidBase = ref(4)

// Interactive proof state
const proofStep = ref(0)
const showProofComplete = ref(false)

// Challenge mode
const challengeActive = ref(false)
const challengeType = ref('') // 'find-hypotenuse', 'find-leg', 'converse', 'space-diagonal'
const challengeInputA = ref(0)
const challengeInputB = ref(0)
const challengeAnswer = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================
const hypotenuse = computed(() => {
  return Math.sqrt(sideA.value ** 2 + sideB.value ** 2).toFixed(2)
})

const squareA = computed(() => sideA.value ** 2)
const squareB = computed(() => sideB.value ** 2)
const squareC = computed(() => (sideA.value ** 2 + sideB.value ** 2).toFixed(2))

// Cube space diagonal
const cubeDiagonal = computed(() => {
  const s = cubeSide.value
  return (s * Math.sqrt(3)).toFixed(2)
})

// Pyramid slant height
const pyramidSlant = computed(() => {
  const halfBase = pyramidBase.value / 2
  const height = pyramidHeight.value
  return Math.sqrt(halfBase ** 2 + height ** 2).toFixed(2)
})

// Pyramid base diagonal
const pyramidBaseDiagonal = computed(() => {
  return (pyramidBase.value * Math.sqrt(2)).toFixed(2)
})

// Pyramid edge length
const pyramidEdge = computed(() => {
  const halfBase = pyramidBase.value / 2
  const height = pyramidHeight.value
  return Math.sqrt(halfBase ** 2 + halfBase ** 2 + height ** 2).toFixed(2)
})

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 600
const viewBoxX = -6
const viewBoxY = -4
const viewBoxWidth = 12
const viewBoxHeight = 9

function toSvgX(x) {
  return ((x - viewBoxX) / viewBoxWidth) * svgWidth
}

function toSvgY(y) {
  return svgHeight - ((y - viewBoxY) / viewBoxHeight) * svgHeight
}

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  challengeAnswer.value = ''
  
  if (type === 'find-hypotenuse') {
    challengeInputA.value = Math.floor(Math.random() * 8) + 3
    challengeInputB.value = Math.floor(Math.random() * 8) + 3
  } else if (type === 'find-leg') {
    const c = Math.floor(Math.random() * 8) + 5
    const a = Math.floor(Math.random() * (c - 2)) + 2
    challengeInputA.value = a
    challengeInputB.value = c // c is the hypotenuse
  } else if (type === 'converse') {
    challengeInputA.value = Math.floor(Math.random() * 8) + 3
    challengeInputB.value = Math.floor(Math.random() * 8) + 3
  } else if (type === 'space-diagonal') {
    challengeInputA.value = Math.floor(Math.random() * 6) + 3
  }
}

function checkChallenge() {
  const userAnswer = parseFloat(challengeAnswer.value)
  let correct = false
  let expected = 0
  
  if (challengeType.value === 'find-hypotenuse') {
    expected = Math.sqrt(challengeInputA.value ** 2 + challengeInputB.value ** 2)
    correct = Math.abs(userAnswer - expected) < 0.1
  } else if (challengeType.value === 'find-leg') {
    expected = Math.sqrt(challengeInputB.value ** 2 - challengeInputA.value ** 2)
    correct = Math.abs(userAnswer - expected) < 0.1
  } else if (challengeType.value === 'converse') {
    expected = Math.sqrt(challengeInputA.value ** 2 + challengeInputB.value ** 2)
    correct = Math.abs(userAnswer - expected) < 0.1
  } else if (challengeType.value === 'space-diagonal') {
    expected = challengeInputA.value * Math.sqrt(3)
    correct = Math.abs(userAnswer - expected) < 0.1
  }
  
  if (correct) {
    challengeSolved.value = true
    challengeFeedback.value = `Correct! Het antwoord is ${expected.toFixed(2)}`
  } else {
    challengeFeedback.value = `Nog niet juist. Probeer opnieuw!`
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
    title: 'De stelling van Pythagoras',
    description: 'In een rechthoekige driehoek geldt: a² + b² = c², waarbij c de schuine zijde is.',
    focus: 'theorem',
    instruction: 'Bestudeer de driehoek en de bijbehorende vierkanten.',
    details: [
      'a en b zijn de rechthoekszijden',
      'c is de schuine zijde (hypotenusa)',
      'c is altijd de langste zijde',
      'De stelling geldt alleen voor rechthoekige driehoeken'
    ]
  },
  {
    title: 'Het bewijs (visualisatie)',
    description: 'Het bewijs toont dat de som van de oppervlakten van de kleinere vierkanten gelijk is aan de oppervlakte van het grote vierkant.',
    focus: 'proof',
    instruction: 'Klik door de stappen om het bewijs te volgen.',
    details: [
      'Stap 1: Teken vierkanten op alle zijden',
      'Stap 2: Verdeel het grote vierkant in stukken',
      'Stap 3: Herschik de stukken',
      'Stap 4: a² + b² = c²'
    ]
  },
  {
    title: 'De omgekeerde stelling',
    description: 'Als a² + b² = c², dan is de driehoek rechthoekig.',
    focus: 'converse',
    instruction: 'Controleer of de driehoek rechthoekig is met behulp van de formule.',
    details: [
      'Bereken a² + b²',
      'Vergelijk met c²',
      'Als gelijk: rechthoekig',
      'Als niet gelijk: niet rechthoekig'
    ]
  },
  {
    title: 'Ruimtelijke toepassingen',
    description: 'De stelling van Pythagoras kan worden uitgebreid naar 3D.',
    focus: 'spatial',
    instruction: 'Bestudeer de ruimtediagonaal van een kubus en piramide.',
    details: [
      'Kubus: diagonaal = zijde × √3',
      'Piramide: slanthoogte berekenen',
      'Bodemdiagonaal als tussenstap',
      'Twee keer Pythagoras toepassen'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    updateSubModeFromStep()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    updateSubModeFromStep()
  }
}

function updateSubModeFromStep() {
  const focus = analysisSteps[currentStep.value].focus
  if (focus === 'proof') currentSubMode.value = 'proof'
  else if (focus === 'spatial') currentSubMode.value = 'spatial'
  else if (focus === 'theorem' || focus === 'converse') currentSubMode.value = 'calculator'
}

function nextProofStep() {
  if (proofStep.value < 4) {
    proofStep.value++
    if (proofStep.value === 4) showProofComplete.value = true
  }
}

function resetProof() {
  proofStep.value = 0
  showProofComplete.value = false
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
            <h1 class="text-lg font-bold text-slate-800">Stelling van Pythagoras</h1>
            <p class="text-sm text-slate-500">LPD MD 06.06 - a² + b² = c²</p>
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

            <!-- Controls based on current step -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Proof Controls -->
              <template v-if="analysisSteps[currentStep].focus === 'proof'">
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span class="text-sm font-medium text-slate-700">Bewijs stap {{ proofStep }} / 4</span>
                    <button 
                      v-if="proofStep < 4"
                      @click="nextProofStep"
                      class="px-3 py-1.5 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Volgende stap
                    </button>
                    <button 
                      v-else
                      @click="resetProof"
                      class="px-3 py-1.5 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
                    >
                      Opnieuw
                    </button>
                  </div>
                  
                  <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p class="text-sm text-emerald-700">
                      <span v-if="proofStep === 0">Start het bewijs door op "Volgende stap" te klikken.</span>
                      <span v-else-if="proofStep === 1">Stap 1: Vierkanten zijn getekend op de zijden a, b en c.</span>
                      <span v-else-if="proofStep === 2">Stap 2: Het grote vierkant (c²) wordt verdeeld in stukken.</span>
                      <span v-else-if="proofStep === 3">Stap 3: De stukken worden herschikt...</span>
                      <span v-else>Stap 4: a² + b² = c² ✓ Het bewijs is compleet!</span>
                    </p>
                  </div>
                </div>
              </template>

              <!-- Calculator Controls -->
              <template v-if="analysisSteps[currentStep].focus === 'theorem' || analysisSteps[currentStep].focus === 'converse'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Zijde a</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sideA }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="sideA" 
                      min="1" 
                      max="10" 
                      step="0.5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Zijde b</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ sideB }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="sideB" 
                      min="1" 
                      max="10" 
                      step="0.5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <div class="p-3 bg-brand-dark text-white rounded-lg">
                    <p class="text-sm font-medium mb-2">Berekening:</p>
                    <div class="text-sm font-mono space-y-1">
                      <p>a² = {{ sideA }}² = {{ squareA }}</p>
                      <p>b² = {{ sideB }}² = {{ squareB }}</p>
                      <p class="border-t border-white/30 pt-1 mt-1">a² + b² = {{ squareA }} + {{ squareB }} = {{ squareC }}</p>
                      <p class="text-brand-orange">c = √{{ squareC }} = {{ hypotenuse }}</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Spatial Controls -->
              <template v-if="analysisSteps[currentStep].focus === 'spatial'">
                <div class="space-y-4">
                  <div class="flex gap-2 mb-3">
                    <button 
                      @click="currentSubMode = 'cube'"
                      :class="['flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors', 
                        currentSubMode === 'cube' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                    >
                      <PhCube class="inline mr-1" /> Kubus
                    </button>
                    <button 
                      @click="currentSubMode = 'pyramid'"
                      :class="['flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors', 
                        currentSubMode === 'pyramid' ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
                    >
                      <PhTriangle class="inline mr-1" /> Piramide
                    </button>
                  </div>

                  <template v-if="currentSubMode === 'cube'">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-brand-dark">Zijde kubus</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ cubeSide }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="cubeSide" 
                        min="2" 
                        max="8" 
                        step="0.5"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      >
                    </div>

                    <div class="p-3 bg-brand-dark text-white rounded-lg">
                      <p class="text-sm font-medium mb-2">Ruimtediagonaal kubus:</p>
                      <div class="text-sm font-mono space-y-1">
                        <p>d² = z² + z² + z²</p>
                        <p>d² = 3 × {{ cubeSide }}²</p>
                        <p>d² = 3 × {{ cubeSide ** 2 }}</p>
                        <p class="text-brand-orange">d = {{ cubeDiagonal }}</p>
                      </div>
                    </div>
                  </template>

                  <template v-if="currentSubMode === 'pyramid'">
                    <div class="space-y-3">
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <label class="text-sm font-bold text-brand-dark">Bodemzijde</label>
                          <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ pyramidBase }}</span>
                        </div>
                        <input 
                          type="range" 
                          v-model.number="pyramidBase" 
                          min="2" 
                          max="8" 
                          step="0.5"
                          class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                        >
                      </div>

                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <label class="text-sm font-bold text-brand-dark">Hoogte</label>
                          <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ pyramidHeight }}</span>
                        </div>
                        <input 
                          type="range" 
                          v-model.number="pyramidHeight" 
                          min="3" 
                          max="10" 
                          step="0.5"
                          class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                        >
                      </div>

                      <div class="p-3 bg-brand-dark text-white rounded-lg">
                        <p class="text-sm font-medium mb-2">Slanthoogte:</p>
                        <div class="text-sm font-mono space-y-1">
                          <p>s² = h² + (b/2)²</p>
                          <p>s² = {{ pyramidHeight }}² + {{ (pyramidBase/2).toFixed(1) }}²</p>
                          <p class="text-brand-orange">s = {{ pyramidSlant }}</p>
                        </div>
                      </div>
                    </div>
                  </template>
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
              <p class="text-sm text-slate-600">Oefen met verschillende types Pythagoras-opgaven.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('find-hypotenuse')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bereken de schuine zijde</div>
                  <div class="text-xs text-slate-500 mt-1">Gegeven: twee rechthoekszijden</div>
                </button>
                
                <button @click="generateChallenge('find-leg')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bereken een rechthoekszijde</div>
                  <div class="text-xs text-slate-500 mt-1">Gegeven: hypotenusa en één zijde</div>
                </button>
                
                <button @click="generateChallenge('converse')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Omgekeerde stelling</div>
                  <div class="text-xs text-slate-500 mt-1">Controleer of een driehoek rechthoekig is</div>
                </button>

                <button @click="generateChallenge('space-diagonal')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Ruimtediagonaal</div>
                  <div class="text-xs text-slate-500 mt-1">Bereken de ruimtediagonaal van een kubus</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">
                    <span v-if="challengeType === 'find-hypotenuse'">Bereken de schuine zijde c:</span>
                    <span v-else-if="challengeType === 'find-leg'">Bereken de ontbrekende zijde:</span>
                    <span v-else-if="challengeType === 'converse'">Controleer of de driehoek rechthoekig is:</span>
                    <span v-else>Bereken de ruimtediagonaal:</span>
                  </p>
                  
                  <div v-if="challengeType === 'find-hypotenuse'" class="text-xs text-white/80 space-y-1">
                    <p>a = {{ challengeInputA }}</p>
                    <p>b = {{ challengeInputB }}</p>
                  </div>
                  
                  <div v-else-if="challengeType === 'find-leg'" class="text-xs text-white/80 space-y-1">
                    <p>a = {{ challengeInputA }} (bekende zijde)</p>
                    <p>c = {{ challengeInputB }} (hypotenusa)</p>
                    <p class="text-white/60">Tip: b² = c² - a²</p>
                  </div>
                  
                  <div v-else-if="challengeType === 'converse'" class="text-xs text-white/80 space-y-1">
                    <p>a = {{ challengeInputA }}</p>
                    <p>b = {{ challengeInputB }}</p>
                    <p>Bereken c en controleer</p>
                  </div>

                  <div v-else class="text-xs text-white/80 space-y-1">
                    <p>Zijde = {{ challengeInputA }}</p>
                    <p class="text-white/60">Tip: d = z × √3</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Jouw antwoord</label>
                    <input 
                      type="number" 
                      v-model="challengeAnswer" 
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="Vul je antwoord in"
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
                <span class="text-slate-600">Formule:</span>
                <span class="font-mono">a² + b² = c²</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Voorwaarde:</span>
                <span class="text-slate-700">Rechthoekige driehoek</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Hypotenusa:</span>
                <span class="text-slate-700">Langste zijde</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Geldig voor:</span>
                <span class="text-slate-700">Alle rechthoekige △</span>
              </div>
              <div class="border-t border-slate-200 pt-2 mt-2">
                <p class="text-xs text-slate-500 mb-1">Voorbeeld (3-4-5):</p>
                <p class="font-mono text-xs">3² + 4² = 9 + 16 = 25 = 5² ✓</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Formula Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Stelling van Pythagoras:</span>
              <span class="text-2xl font-mono font-bold text-brand-dark">a² + b² = c²</span>
            </div>
          </div>

          <!-- Visualization Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 13" :key="`v${i}`" 
                  :x1="toSvgX(-6 + i)" y1="0" 
                  :x2="toSvgX(-6 + i)" :y2="svgHeight" 
                />
                <line v-for="i in 10" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-4 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-4 + i)" 
                />
              </g>

              <!-- Axes -->
              <line :x1="toSvgX(0)" y1="0" :x2="toSvgX(0)" :y2="svgHeight" stroke="#64748B" stroke-width="2" />
              <line x1="0" :y1="toSvgY(0)" :x2="svgWidth" :y2="toSvgY(0)" stroke="#64748B" stroke-width="2" />

              <!-- Proof Visualization -->
              <g v-if="analysisSteps[currentStep]?.focus === 'proof' || currentMode === 'analysis' && currentSubMode === 'proof'">
                <!-- Right triangle -->
                <polygon 
                  :points="`${toSvgX(0)},${toSvgY(0)} ${toSvgX(sideA)},${toSvgY(0)} ${toSvgX(0)},${toSvgY(sideB)}`"
                  fill="#F97316"
                  fill-opacity="0.2"
                  stroke="#F97316"
                  stroke-width="2"
                />
                
                <!-- Right angle marker -->
                <rect 
                  :x="toSvgX(0)" 
                  :y="toSvgY(0) - 10" 
                  width="10" 
                  height="10" 
                  fill="none" 
                  stroke="#64748B" 
                  stroke-width="1"
                />

                <!-- Square on side a -->
                <rect 
                  v-if="proofStep >= 1"
                  :x="toSvgX(0)" 
                  :y="toSvgY(sideB) - toSvgY(0) + toSvgY(sideB)" 
                  :width="toSvgX(sideA) - toSvgX(0)" 
                  :height="toSvgY(0) - toSvgY(sideB)"
                  fill="#10B981"
                  fill-opacity="0.3"
                  stroke="#10B981"
                  stroke-width="2"
                />
                <text 
                  v-if="proofStep >= 1"
                  :x="toSvgX(sideA/2)" 
                  :y="toSvgY(sideB/2)" 
                  text-anchor="middle" 
                  class="fill-emerald-600 text-sm font-bold"
                >
                  a² = {{ squareA }}
                </text>

                <!-- Square on side b -->
                <rect 
                  v-if="proofStep >= 1"
                  :x="toSvgX(sideA)" 
                  :y="toSvgY(0)" 
                  :width="toSvgX(sideB) - toSvgX(0)" 
                  :height="toSvgY(0) - toSvgY(sideB)"
                  fill="#6366F1"
                  fill-opacity="0.3"
                  stroke="#6366F1"
                  stroke-width="2"
                />
                <text 
                  v-if="proofStep >= 1"
                  :x="toSvgX(sideA + sideB/2)" 
                  :y="toSvgY(sideB/2)" 
                  text-anchor="middle" 
                  class="fill-indigo-600 text-sm font-bold"
                >
                  b² = {{ squareB }}
                </text>

                <!-- Square on hypotenuse c -->
                <g v-if="proofStep >= 1">
                  <!-- Simplified representation of square on hypotenuse -->
                  <polygon 
                    :points="`${toSvgX(-2)},${toSvgY(sideB + 2)} ${toSvgX(sideA - 2)},${toSvgY(4)} ${toSvgX(sideA + sideB - 2)},${toSvgY(sideB + 2)} ${toSvgX(0)},${toSvgY(sideB + sideB - 2)}`"
                    fill="#F59E0B"
                    fill-opacity="0.2"
                    stroke="#F59E0B"
                    stroke-width="2"
                  />
                  <text 
                    :x="toSvgX(sideA/2 + 1)" 
                    :y="toSvgY(sideB + 1)" 
                    text-anchor="middle" 
                    class="fill-amber-600 text-sm font-bold"
                  >
                    c² = {{ squareC }}
                  </text>
                </g>

                <!-- Labels -->
                <text :x="toSvgX(sideA/2)" :y="toSvgY(-0.3)" text-anchor="middle" class="fill-slate-700 text-sm font-bold">a</text>
                <text :x="toSvgX(-0.3)" :y="toSvgY(sideB/2)" text-anchor="end" class="fill-slate-700 text-sm font-bold">b</text>
                <text :x="toSvgX(sideA/2)" :y="toSvgY(sideB/2)" text-anchor="middle" class="fill-slate-700 text-sm font-bold">c</text>

                <!-- Completion check -->
                <g v-if="proofStep >= 4">
                  <circle :cx="toSvgX(sideA + 2)" :cy="toSvgY(-2)" r="15" fill="#10B981" />
                  <text :x="toSvgX(sideA + 2)" :y="toSvgY(-1.7)" text-anchor="middle" class="fill-white text-lg">✓</text>
                </g>
              </g>

              <!-- Triangle Calculator Visualization -->
              <g v-if="analysisSteps[currentStep]?.focus === 'theorem' || analysisSteps[currentStep]?.focus === 'converse' || (currentMode === 'derivation' && challengeType !== 'space-diagonal')">
                <!-- Triangle -->
                <polygon 
                  :points="`${toSvgX(0)},${toSvgY(0)} ${toSvgX(sideA * 2)},${toSvgY(0)} ${toSvgX(0)},${toSvgY(sideB * 1.5)}`"
                  fill="#F97316"
                  fill-opacity="0.2"
                  stroke="#F97316"
                  stroke-width="3"
                />

                <!-- Right angle marker -->
                <rect 
                  :x="toSvgX(0)" 
                  :y="toSvgY(0) - 20" 
                  width="20" 
                  height="20" 
                  fill="none" 
                  stroke="#64748B" 
                  stroke-width="2"
                />

                <!-- Side labels -->
                <text :x="toSvgX(sideA)" :y="toSvgY(-0.4)" text-anchor="middle" class="fill-slate-700 text-base font-bold bg-white">a = {{ sideA }}</text>
                <text :x="toSvgX(-0.5)" :y="toSvgY(sideB * 0.75)" text-anchor="end" class="fill-slate-700 text-base font-bold">b = {{ sideB }}</text>
                
                <!-- Hypotenuse label -->
                <text 
                  :x="toSvgX(sideA)" 
                  :y="toSvgY(sideB * 0.6)" 
                  text-anchor="middle" 
                  class="fill-brand-orange text-lg font-bold"
                >
                  c = {{ hypotenuse }}
                </text>

                <!-- Dimension lines -->
                <line :x1="toSvgX(0)" :y1="toSvgY(-0.8)" :x2="toSvgX(sideA * 2)" :y2="toSvgY(-0.8)" stroke="#64748B" stroke-width="1" stroke-dasharray="4,2" />
                <line :x1="toSvgX(-0.8)" :y1="toSvgY(0)" :x2="toSvgX(-0.8)" :y2="toSvgY(sideB * 1.5)" stroke="#64748B" stroke-width="1" stroke-dasharray="4,2" />
              </g>

              <!-- Cube Visualization -->
              <g v-if="analysisSteps[currentStep]?.focus === 'spatial' && currentSubMode === 'cube'">
                <!-- Front face -->
                <rect 
                  :x="toSvgX(-2)" 
                  :y="toSvgY(2)" 
                  :width="(cubeSide * 40)" 
                  :height="(cubeSide * 30)"
                  fill="none"
                  stroke="#64748B"
                  stroke-width="2"
                />

                <!-- Back face (offset) -->
                <rect 
                  :x="toSvgX(-2) + 30" 
                  :y="toSvgY(2) - 25" 
                  :width="(cubeSide * 40)" 
                  :height="(cubeSide * 30)"
                  fill="none"
                  stroke="#94A3B8"
                  stroke-width="2"
                  stroke-dasharray="5,3"
                />

                <!-- Connecting lines -->
                <line :x1="toSvgX(-2)" :y1="toSvgY(2)" :x2="toSvgX(-2) + 30" :y2="toSvgY(2) - 25" stroke="#94A3B8" stroke-width="1" />
                <line :x1="toSvgX(-2) + (cubeSide * 40)" :y1="toSvgY(2)" :x2="toSvgX(-2) + (cubeSide * 40) + 30" :y2="toSvgY(2) - 25" stroke="#94A3B8" stroke-width="1" />
                <line :x1="toSvgX(-2)" :y1="toSvgY(2) - (cubeSide * 30)" :x2="toSvgX(-2) + 30" :y2="toSvgY(2) - 25 - (cubeSide * 30)" stroke="#94A3B8" stroke-width="1" />
                <line :x1="toSvgX(-2) + (cubeSide * 40)" :y1="toSvgY(2) - (cubeSide * 30)" :x2="toSvgX(-2) + (cubeSide * 40) + 30" :y2="toSvgY(2) - 25 - (cubeSide * 30)" stroke="#94A3B8" stroke-width="1" />

                <!-- Space diagonal -->
                <line 
                  :x1="toSvgX(-2)" 
                  :y1="toSvgY(2)" 
                  :x2="toSvgX(-2) + (cubeSide * 40) + 30" 
                  :y2="toSvgY(2) - 25 - (cubeSide * 30)"
                  stroke="#F97316"
                  stroke-width="3"
                />

                <!-- Labels -->
                <text :x="toSvgX(-2) + (cubeSide * 20)" :y="toSvgY(2) + 25" text-anchor="middle" class="fill-slate-600 text-sm">z = {{ cubeSide }}</text>
                <text :x="toSvgX(-2) - 15" :y="toSvgY(2) - (cubeSide * 15)" text-anchor="end" class="fill-slate-600 text-sm">z</text>
                <text 
                  :x="toSvgX(-2) + (cubeSide * 20) + 15" 
                  :y="toSvgY(2) - (cubeSide * 15) - 10" 
                  text-anchor="middle" 
                  class="fill-brand-orange text-base font-bold"
                >
                  d = {{ cubeDiagonal }}
                </text>
              </g>

              <!-- Pyramid Visualization -->
              <g v-if="analysisSteps[currentStep]?.focus === 'spatial' && currentSubMode === 'pyramid'">
                <!-- Base -->
                <polygon 
                  :points="`${toSvgX(-3)},${toSvgY(0)} ${toSvgX(3)},${toSvgY(0)} ${toSvgX(3.5)},${toSvgY(1.5)} ${toSvgX(-2.5)},${toSvgY(1.5)}`"
                  fill="#E2E8F0"
                  stroke="#64748B"
                  stroke-width="2"
                />

                <!-- Apex -->
                <line :x1="toSvgX(-3)" :y1="toSvgY(0)" :x2="toSvgX(0.25)" :y2="toSvgY(pyramidHeight * 0.5)" stroke="#64748B" stroke-width="2" />
                <line :x1="toSvgX(3)" :y1="toSvgY(0)" :x2="toSvgX(0.25)" :y2="toSvgY(pyramidHeight * 0.5)" stroke="#64748B" stroke-width="2" />
                <line :x1="toSvgX(3.5)" :y1="toSvgY(1.5)" :x2="toSvgX(0.25)" :y2="toSvgY(pyramidHeight * 0.5)" stroke="#64748B" stroke-width="2" stroke-dasharray="5,3" />
                <line :x1="toSvgX(-2.5)" :y1="toSvgY(1.5)" :x2="toSvgX(0.25)" :y2="toSvgY(pyramidHeight * 0.5)" stroke="#64748B" stroke-width="2" stroke-dasharray="5,3" />

                <!-- Slant height -->
                <line 
                  :x1="toSvgX(0)" 
                  :y1="toSvgY(0)" 
                  :x2="toSvgX(0.25)" 
                  :y2="toSvgY(pyramidHeight * 0.5)"
                  stroke="#F97316"
                  stroke-width="3"
                />

                <!-- Height line -->
                <line 
                  :x1="toSvgX(0)" 
                  :y1="toSvgY(0)" 
                  :x2="toSvgX(0.25)" 
                  :y2="toSvgY(pyramidHeight * 0.5)"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-dasharray="5,3"
                />

                <!-- Labels -->
                <text :x="toSvgX(0)" :y="toSvgY(0) + 25" text-anchor="middle" class="fill-slate-600 text-sm">b/2 = {{ (pyramidBase/2).toFixed(1) }}</text>
                <text :x="toSvgX(0.5)" :y="toSvgY(pyramidHeight * 0.25)" text-anchor="start" class="fill-emerald-600 text-sm">h = {{ pyramidHeight }}</text>
                <text 
                  :x="toSvgX(1.2)" 
                  :y="toSvgY(pyramidHeight * 0.3)" 
                  text-anchor="start" 
                  class="fill-brand-orange text-base font-bold"
                >
                  s = {{ pyramidSlant }}
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-orange-500/30 border border-orange-500"></div>
                  <span class="text-slate-600">Driehoek</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-emerald-500/30 border border-emerald-500"></div>
                  <span class="text-slate-600">Vierkant a²</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-indigo-500/30 border border-indigo-500"></div>
                  <span class="text-slate-600">Vierkant b²</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-amber-500/30 border border-amber-500"></div>
                  <span class="text-slate-600">Vierkant c²</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-0.5 bg-orange-500"></div>
                  <span class="text-slate-600">Schuine zijde / Diagonaal</span>
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
