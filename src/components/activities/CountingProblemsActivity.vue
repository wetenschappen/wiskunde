<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhTreeStructure, PhSelection, PhCards, PhDiceFive,
  PhArrowRight, PhArrowLeft, PhCheckCircle, PhCalculator,
  PhIntersect, PhMinus, PhPlus
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentProblemType = ref('tree') // 'tree', 'venn', 'counting'

// Tree Diagram State
const treeLevels = ref(2)
const treeBranchesPerNode = ref(2)
const treeLabels = ref([['A', 'B'], ['1', '2']])
const treeProbabilities = ref([[0.5, 0.5], [0.3, 0.7]])

// Venn Diagram State
const vennSetA = ref(30)
const vennSetB = ref(25)
const vennIntersection = ref(10)
const vennUniversal = ref(100)

// Counting Problems State
const countingType = ref('cards') // 'cards', 'dice', 'lottery', 'replacement'
const cardsDrawn = ref(2)
const cardsWithReplacement = ref(false)
const diceCount = ref(2)
const lotteryNumbers = ref(6)
const lotteryMax = ref(45)

// Challenge Mode State
const challengeActive = ref(false)
const challengeType = ref('')
const challengeQuestion = ref('')
const challengeAnswer = ref(0)
const userAnswer = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================

// Tree Computations
const totalTreeOutcomes = computed(() => {
  return Math.pow(treeBranchesPerNode.value, treeLevels.value)
})

const treeLevelOutcomes = computed(() => {
  return treeLevels.value * treeBranchesPerNode.value
})

// Venn Computations
const vennOnlyA = computed(() => Math.max(0, vennSetA.value - vennIntersection.value))
const vennOnlyB = computed(() => Math.max(0, vennSetB.value - vennIntersection.value))
const vennUnion = computed(() => vennSetA.value + vennSetB.value - vennIntersection.value)
const vennNeither = computed(() => Math.max(0, vennUniversal.value - vennUnion.value))

// Counting Computations
const factorial = (n) => {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const combinations = (n, k) => {
  if (k > n) return 0
  return factorial(n) / (factorial(k) * factorial(n - k))
}

const permutations = (n, k) => {
  if (k > n) return 0
  return factorial(n) / factorial(n - k)
}

const cardsResult = computed(() => {
  if (cardsWithReplacement.value) {
    return Math.pow(52, cardsDrawn.value)
  } else {
    return permutations(52, cardsDrawn.value)
  }
})

const diceResult = computed(() => {
  return Math.pow(6, diceCount.value)
})

const lotteryResult = computed(() => {
  return combinations(lotteryMax.value, lotteryNumbers.value)
})

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

// Tree SVG Generation
const treeNodes = computed(() => {
  const nodes = []
  const startY = 6
  const levelHeight = 4
  
  // Root node
  nodes.push({
    id: 'root',
    x: 0,
    y: startY,
    level: 0,
    label: 'Start',
    parent: null
  })
  
  // Generate nodes level by level
  let nodeId = 1
  for (let level = 0; level < treeLevels.value; level++) {
    const levelNodes = nodes.filter(n => n.level === level)
    const branchWidth = 18 / Math.pow(treeBranchesPerNode.value, level + 1)
    
    levelNodes.forEach((parent, parentIdx) => {
      const startX = parent.x - ((treeBranchesPerNode.value - 1) * branchWidth) / 2
      
      for (let branch = 0; branch < treeBranchesPerNode.value; branch++) {
        const label = treeLabels.value[level]?.[branch] || String.fromCharCode(65 + branch)
        nodes.push({
          id: `node-${nodeId++}`,
          x: startX + branch * branchWidth,
          y: startY - (level + 1) * levelHeight,
          level: level + 1,
          label: label,
          parent: parent.id,
          prob: treeProbabilities.value[level]?.[branch] || (1 / treeBranchesPerNode.value)
        })
      }
    })
  }
  
  return nodes
})

const treeEdges = computed(() => {
  const edges = []
  const nodes = treeNodes.value
  
  nodes.forEach(node => {
    if (node.parent) {
      const parent = nodes.find(n => n.id === node.parent)
      if (parent) {
        edges.push({
          from: parent,
          to: node,
          label: node.label,
          prob: node.prob
        })
      }
    }
  })
  
  return edges
})

// Venn Circle Centers
const vennCenterA = computed(() => ({ x: -2.5, y: 0 }))
const vennCenterB = computed(() => ({ x: 2.5, y: 0 }))
const vennRadius = 4

// ==================== CHALLENGE GENERATION ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  
  if (type === 'tree') {
    const levels = randomInt(2, 3)
    const branches = randomInt(2, 3)
    challengeQuestion.value = `Hoeveel uitkomsten heeft een boomdiagram met ${levels} niveaus en ${branches} takken per niveau?`
    challengeAnswer.value = Math.pow(branches, levels)
  } else if (type === 'venn') {
    const setA = randomInt(20, 50)
    const setB = randomInt(15, 40)
    const intersection = randomInt(5, Math.min(setA, setB) - 5)
    const operation = Math.random() > 0.5 ? 'union' : 'intersection'
    
    if (operation === 'union') {
      challengeQuestion.value = `Gegeven: |A| = ${setA}, |B| = ${setB}, |A ∩ B| = ${intersection}. Bereken |A ∪ B|.`
      challengeAnswer.value = setA + setB - intersection
    } else {
      challengeQuestion.value = `Gegeven: |A ∪ B| = ${setA + setB - intersection}, |A| = ${setA}, |B| = ${setB}. Bereken |A ∩ B|.`
      challengeAnswer.value = intersection
    }
  } else if (type === 'counting') {
    const dice = randomInt(1, 3)
    challengeQuestion.value = `Hoeveel uitkomsten zijn er bij het gooien van ${dice} dobbelsteen${dice > 1 ? 's' : ''}?`
    challengeAnswer.value = Math.pow(6, dice)
  }
}

function checkChallenge() {
  const tolerance = 0.01
  const userVal = parseFloat(userAnswer.value)
  
  if (isNaN(userVal)) {
    challengeFeedback.value = 'Voer een geldig getal in.'
    return
  }
  
  if (Math.abs(userVal - challengeAnswer.value) < tolerance) {
    challengeSolved.value = true
    challengeFeedback.value = 'Correct! Je hebt het juiste antwoord gevonden.'
    emit('complete')
  } else {
    challengeFeedback.value = `Nog niet juist. Het juiste antwoord is ${challengeAnswer.value}.`
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
    title: 'Boomdiagrammen',
    description: 'Visualiseer mogelijke uitkomsten stap voor stap.',
    focus: 'tree',
    instruction: 'Bouw een boomdiagram en tel het aantal paden.',
    details: [
      'Elk pad van de wortel naar een blad is één uitkomst',
      'Productregel: vermenigvuldig aantal keuzes per niveau',
      'Gebruik boomdiagrammen voor sequentiële keuzes'
    ]
  },
  {
    title: 'Venn-diagrammen',
    description: 'Visualiseer verzamelingen en hun relaties.',
    focus: 'venn',
    instruction: 'Pas de grootte van de verzamelingen aan en observeer.',
    details: [
      '|A ∪ B| = |A| + |B| - |A ∩ B| (somregel)',
      '|A ∩ B| = aantal elementen in beide verzamelingen',
      'Complementregel: |A\'| = |U| - |A|'
    ]
  },
  {
    title: 'Telproblemen',
    description: 'Los problemen op met kaarten, dobbelstenen en loterijen.',
    focus: 'counting',
    instruction: 'Kies een probleemtype en bereken het aantal mogelijkheden.',
    details: [
      'Met terugleggen: elke keuze is onafhankelijk',
      'Zonder terugleggen: volgorde speelt een rol (permutaties)',
      'Combinaties: volgorde maakt niet uit'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    updateProblemType()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    updateProblemType()
  }
}

function updateProblemType() {
  const focus = analysisSteps[currentStep.value].focus
  if (focus === 'tree') currentProblemType.value = 'tree'
  else if (focus === 'venn') currentProblemType.value = 'venn'
  else if (focus === 'counting') currentProblemType.value = 'counting'
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans">
      <!-- Header -->
      <div class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center">
            <PhTreeStructure class="text-xl text-brand-orange" weight="fill" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-800">Telproblemen</h1>
            <p class="text-sm text-slate-500">Boomdiagrammen, Venn-diagrammen en combinatoriek</p>
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

            <!-- Problem Type Selection -->
            <div class="p-4 border-b border-slate-200">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visualisatie</p>
              <div class="flex gap-2">
                <button 
                  @click="currentProblemType = 'tree'"
                  :class="['flex-1 p-3 rounded-lg border transition-all', 
                    currentProblemType === 'tree' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhTreeStructure class="text-xl mx-auto mb-1" :class="currentProblemType === 'tree' ? 'text-brand-orange' : 'text-slate-400'" />
                  <span class="text-xs font-medium" :class="currentProblemType === 'tree' ? 'text-brand-dark' : 'text-slate-600'">Boom</span>
                </button>
                <button 
                  @click="currentProblemType = 'venn'"
                  :class="['flex-1 p-3 rounded-lg border transition-all', 
                    currentProblemType === 'venn' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhIntersect class="text-xl mx-auto mb-1" :class="currentProblemType === 'venn' ? 'text-brand-orange' : 'text-slate-400'" />
                  <span class="text-xs font-medium" :class="currentProblemType === 'venn' ? 'text-brand-dark' : 'text-slate-600'">Venn</span>
                </button>
                <button 
                  @click="currentProblemType = 'counting'"
                  :class="['flex-1 p-3 rounded-lg border transition-all', 
                    currentProblemType === 'counting' ? 'border-brand-orange bg-orange-50' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhCalculator class="text-xl mx-auto mb-1" :class="currentProblemType === 'counting' ? 'text-brand-orange' : 'text-slate-400'" />
                  <span class="text-xs font-medium" :class="currentProblemType === 'counting' ? 'text-brand-dark' : 'text-slate-600'">Tel</span>
                </button>
              </div>
            </div>

            <!-- Parameter Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Tree Controls -->
              <template v-if="currentProblemType === 'tree'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Aantal niveaus</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ treeLevels }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="treeLevels" 
                      min="1" 
                      max="4" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">Takken per niveau</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ treeBranchesPerNode }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="treeBranchesPerNode" 
                      min="2" 
                      max="4" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-2">Productregel</p>
                    <p class="text-sm font-mono">{{ treeBranchesPerNode }}^{{ treeLevels }} = {{ totalTreeOutcomes }}</p>
                    <p class="text-xs text-slate-500 mt-1">Totaal aantal mogelijke uitkomsten</p>
                  </div>
                </div>
              </template>

              <!-- Venn Controls -->
              <template v-if="currentProblemType === 'venn'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">|A| (verzameling A)</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ vennSetA }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="vennSetA" 
                      min="5" 
                      max="50" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">|B| (verzameling B)</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ vennSetB }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="vennSetB" 
                      min="5" 
                      max="50" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">|A ∩ B| (doorsnede)</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ vennIntersection }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="vennIntersection" 
                      min="0" 
                      :max="Math.min(vennSetA, vennSetB)" 
                      step="1"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-sm font-bold text-brand-dark">|U| (universum)</label>
                      <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ vennUniversal }}</span>
                    </div>
                    <input 
                      type="range" 
                      v-model.number="vennUniversal" 
                      min="50" 
                      max="100" 
                      step="5"
                      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    >
                  </div>

                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <p class="text-sm font-bold text-slate-700">Somregel (inclusie-exclusie)</p>
                    <p class="text-sm font-mono">|A ∪ B| = {{ vennSetA }} + {{ vennSetB }} - {{ vennIntersection }}</p>
                    <p class="text-sm font-mono text-brand-orange">|A ∪ B| = {{ vennUnion }}</p>
                  </div>
                </div>
              </template>

              <!-- Counting Controls -->
              <template v-if="currentProblemType === 'counting'">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Probleemtype</label>
                    <select 
                      v-model="countingType"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    >
                      <option value="cards">Kaarten trekken</option>
                      <option value="dice">Dobbelstenen</option>
                      <option value="lottery">Loterij</option>
                    </select>
                  </div>

                  <!-- Cards Options -->
                  <template v-if="countingType === 'cards'">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">Aantal kaarten</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ cardsDrawn }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="cardsDrawn" 
                        min="1" 
                        max="5" 
                        step="1"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                    <div class="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="withReplacement"
                        v-model="cardsWithReplacement"
                        class="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange"
                      >
                      <label for="withReplacement" class="text-sm text-slate-600">Met terugleggen</label>
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p class="text-sm font-bold text-slate-700">Resultaat</p>
                      <p class="text-sm font-mono mt-1">
                        <span v-if="cardsWithReplacement">52^{{ cardsDrawn }} = {{ cardsResult.toLocaleString() }}</span>
                        <span v-else>P(52,{{ cardsDrawn }}) = {{ cardsResult.toLocaleString() }}</span>
                      </p>
                    </div>
                  </template>

                  <!-- Dice Options -->
                  <template v-if="countingType === 'dice'">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">Aantal dobbelstenen</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ diceCount }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="diceCount" 
                        min="1" 
                        max="4" 
                        step="1"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p class="text-sm font-bold text-slate-700">Resultaat</p>
                      <p class="text-sm font-mono mt-1">6^{{ diceCount }} = {{ diceResult.toLocaleString() }}</p>
                    </div>
                  </template>

                  <!-- Lottery Options -->
                  <template v-if="countingType === 'lottery'">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">Aantal getallen</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ lotteryNumbers }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="lotteryNumbers" 
                        min="3" 
                        max="10" 
                        step="1"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-sm font-bold text-slate-600">Maximaal getal</label>
                        <span class="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{{ lotteryMax }}</span>
                      </div>
                      <input 
                        type="range" 
                        v-model.number="lotteryMax" 
                        min="20" 
                        max="90" 
                        step="5"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      >
                    </div>
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p class="text-sm font-bold text-slate-700">Resultaat (combinatie)</p>
                      <p class="text-sm font-mono mt-1">C({{ lotteryMax }},{{ lotteryNumbers }}) = {{ Math.round(lotteryResult).toLocaleString() }}</p>
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

          <!-- Mode: Derivation / Challenge -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Telopdrachten</h2>
              <p class="text-sm text-slate-600">Los telproblemen op met behulp van de juiste techniek.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('tree')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2 mb-1">
                    <PhTreeStructure class="text-brand-dark" />
                    <span class="font-medium text-sm text-slate-800">Boomdiagram</span>
                  </div>
                  <div class="text-xs text-slate-500">Tel het aantal mogelijke uitkomsten.</div>
                </button>
                
                <button @click="generateChallenge('venn')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2 mb-1">
                    <PhIntersect class="text-brand-dark" />
                    <span class="font-medium text-sm text-slate-800">Venn-diagram</span>
                  </div>
                  <div class="text-xs text-slate-500">Gebruik de somregel en inclusie-exclusie.</div>
                </button>
                
                <button @click="generateChallenge('counting')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="flex items-center gap-2 mb-1">
                    <PhDiceFive class="text-brand-dark" />
                    <span class="font-medium text-sm text-slate-800">Telprobleem</span>
                  </div>
                  <div class="text-xs text-slate-500">Bereken het aantal mogelijkheden.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium mb-2">Bereken:</p>
                  <p class="text-sm text-white/90">{{ challengeQuestion }}</p>
                </div>

                <!-- User Input -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Jouw antwoord</label>
                  <input 
                    type="number" 
                    v-model="userAnswer" 
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                    placeholder="Voer een getal in"
                  >
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
            
            <!-- Tree Characteristics -->
            <template v-if="currentProblemType === 'tree'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Aantal niveaus:</span>
                  <span class="font-mono">{{ treeLevels }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Takken per niveau:</span>
                  <span class="font-mono">{{ treeBranchesPerNode }}</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span class="text-slate-600">Totale uitkomsten:</span>
                  <span class="font-mono text-brand-orange">{{ totalTreeOutcomes }}</span>
                </div>
              </div>
            </template>

            <!-- Venn Characteristics -->
            <template v-if="currentProblemType === 'venn'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Alleen A:</span>
                  <span class="font-mono">{{ vennOnlyA }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">A ∩ B:</span>
                  <span class="font-mono">{{ vennIntersection }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Alleen B:</span>
                  <span class="font-mono">{{ vennOnlyB }}</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span class="text-slate-600">A ∪ B:</span>
                  <span class="font-mono text-brand-orange">{{ vennUnion }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Geen van beide:</span>
                  <span class="font-mono">{{ vennNeither }}</span>
                </div>
              </div>
            </template>

            <!-- Counting Characteristics -->
            <template v-if="currentProblemType === 'counting'">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Type:</span>
                  <span class="font-medium capitalize">{{ countingType }}</span>
                </div>
                <div v-if="countingType === 'cards'" class="flex justify-between">
                  <span class="text-slate-600">Methode:</span>
                  <span class="font-mono">{{ cardsWithReplacement ? 'Met terugleggen' : 'Zonder terugleggen' }}</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span class="text-slate-600">Resultaat:</span>
                  <span class="font-mono text-brand-orange">
                    <span v-if="countingType === 'cards'">{{ cardsResult.toLocaleString() }}</span>
                    <span v-else-if="countingType === 'dice'">{{ diceResult.toLocaleString() }}</span>
                    <span v-else-if="countingType === 'lottery'">{{ Math.round(lotteryResult).toLocaleString() }}</span>
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Right Panel: Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Title Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Visualisatie:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">
                <span v-if="currentProblemType === 'tree'">Boomdiagram</span>
                <span v-if="currentProblemType === 'venn'">Venn-diagram</span>
                <span v-if="currentProblemType === 'counting'">
                  <span v-if="countingType === 'cards'">Kaarten trekken</span>
                  <span v-if="countingType === 'dice'">Dobbelstenen</span>
                  <span v-if="countingType === 'lottery'">Loterij</span>
                </span>
              </span>
            </div>
          </div>

          <!-- Visualization Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid (subtle) -->
              <g stroke="#E2E8F0" stroke-width="0.5" opacity="0.5">
                <line v-for="i in 21" :key="`v${i}`" 
                  :x1="toSvgX(-10 + i)" y1="0" 
                  :x2="toSvgX(-10 + i)" :y2="svgHeight" 
                />
                <line v-for="i in 17" :key="`h${i}`" 
                  x1="0" :y1="toSvgY(-8 + i)" 
                  :x2="svgWidth" :y2="toSvgY(-8 + i)" 
                />
              </g>

              <!-- Tree Diagram -->
              <g v-if="currentProblemType === 'tree'">
                <!-- Edges -->
                <g v-for="(edge, idx) in treeEdges" :key="`edge-${idx}`">
                  <line 
                    :x1="toSvgX(edge.from.x)" 
                    :y1="toSvgY(edge.from.y)" 
                    :x2="toSvgX(edge.to.x)" 
                    :y2="toSvgY(edge.to.y)"
                    stroke="#94A3B8" 
                    stroke-width="2"
                  />
                  <!-- Edge label -->
                  <text 
                    :x="toSvgX((edge.from.x + edge.to.x) / 2) + 10"
                    :y="toSvgY((edge.from.y + edge.to.y) / 2)"
                    class="fill-slate-400 text-xs"
                  >
                    {{ edge.label }}
                  </text>
                </g>
                
                <!-- Nodes -->
                <g v-for="(node, idx) in treeNodes" :key="`node-${idx}`">
                  <circle 
                    :cx="toSvgX(node.x)" 
                    :cy="toSvgY(node.y)" 
                    :r="node.level === 0 ? 8 : 6" 
                    :fill="node.level === 0 ? '#F97316' : '#3B82F6'"
                    stroke="white" 
                    stroke-width="2"
                  />
                  <text 
                    :x="toSvgX(node.x)" 
                    :y="toSvgY(node.y) + (node.level === 0 ? -12 : 12)" 
                    text-anchor="middle" 
                    class="fill-slate-700 text-xs font-bold"
                  >
                    {{ node.label }}
                  </text>
                </g>
              </g>

              <!-- Venn Diagram -->
              <g v-if="currentProblemType === 'venn'">
                <!-- Universal set background -->
                <rect 
                  :x="toSvgX(-8)" 
                  :y="toSvgY(5)" 
                  :width="toSvgX(8) - toSvgX(-8)" 
                  :height="toSvgY(-5) - toSvgY(5)"
                  fill="#F8FAFC" 
                  stroke="#CBD5E1" 
                  stroke-width="2"
                  stroke-dasharray="5,5"
                />
                <text :x="toSvgX(7.5)" :y="toSvgY(4.5)" class="fill-slate-400 text-sm">U</text>

                <!-- Set A Circle -->
                <circle 
                  :cx="toSvgX(vennCenterA.x)" 
                  :cy="toSvgY(vennCenterA.y)" 
                  :r="toSvgX(vennRadius) - toSvgX(0)"
                  fill="rgba(59, 130, 246, 0.3)" 
                  stroke="#3B82F6" 
                  stroke-width="2"
                />
                
                <!-- Set B Circle -->
                <circle 
                  :cx="toSvgX(vennCenterB.x)" 
                  :cy="toSvgY(vennCenterB.y)" 
                  :r="toSvgX(vennRadius) - toSvgX(0)"
                  fill="rgba(249, 115, 22, 0.3)" 
                  stroke="#F97316" 
                  stroke-width="2"
                />

                <!-- Labels -->
                <text :x="toSvgX(vennCenterA.x - 2.5)" :y="toSvgY(vennCenterA.y + 3.5)" class="fill-blue-600 text-sm font-bold">A</text>
                <text :x="toSvgX(vennCenterB.x + 2.5)" :y="toSvgY(vennCenterB.y + 3.5)" class="fill-orange-600 text-sm font-bold">B</text>

                <!-- Region counts -->
                <text :x="toSvgX(-3.5)" :y="toSvgY(0)" text-anchor="middle" class="fill-blue-700 text-lg font-bold">{{ vennOnlyA }}</text>
                <text :x="toSvgX(0)" :y="toSvgY(0)" text-anchor="middle" class="fill-purple-700 text-lg font-bold">{{ vennIntersection }}</text>
                <text :x="toSvgX(3.5)" :y="toSvgY(0)" text-anchor="middle" class="fill-orange-700 text-lg font-bold">{{ vennOnlyB }}</text>
                <text :x="toSvgX(6.5)" :y="toSvgY(-3)" text-anchor="middle" class="fill-slate-500 text-sm">{{ vennNeither }}</text>
              </g>

              <!-- Counting Visualization -->
              <g v-if="currentProblemType === 'counting'">
                <!-- Cards Visualization -->
                <template v-if="countingType === 'cards'">
                  <text :x="svgWidth/2" :y="40" text-anchor="middle" class="fill-slate-700 text-lg font-bold">
                    Kaarten trekken: {{ cardsDrawn }} kaart{{ cardsDrawn > 1 ? 'en' : '' }}
                  </text>
                  <g transform="translate(0, 60)">
                    <rect v-for="i in Math.min(cardsDrawn, 5)" :key="`card-${i}`"
                      :x="svgWidth/2 - (cardsDrawn * 35)/2 + (i-1) * 70"
                      y="0"
                      width="60" 
                      height="90" 
                      rx="5"
                      fill="white" 
                      stroke="#0B1120" 
                      stroke-width="2"
                    />
                    <text v-for="i in Math.min(cardsDrawn, 5)" :key="`card-label-${i}`"
                      :x="svgWidth/2 - (cardsDrawn * 35)/2 + (i-1) * 70 + 30"
                      y="55"
                      text-anchor="middle" 
                      class="fill-brand-dark text-2xl"
                    >
                      {{ String.fromCharCode(65 + i - 1) }}
                    </text>
                  </g>
                  <text :x="svgWidth/2" :y="200" text-anchor="middle" class="fill-slate-600 text-base">
                    {{ cardsWithReplacement ? 'Met terugleggen' : 'Zonder terugleggen (volgorde telt)' }}
                  </text>
                  <text :x="svgWidth/2" :y="240" text-anchor="middle" class="fill-brand-orange text-2xl font-bold font-mono">
                    {{ cardsResult.toLocaleString() }} mogelijkheden
                  </text>
                </template>

                <!-- Dice Visualization -->
                <template v-if="countingType === 'dice'">
                  <text :x="svgWidth/2" :y="40" text-anchor="middle" class="fill-slate-700 text-lg font-bold">
                    {{ diceCount }} dobbelsteen{{ diceCount > 1 ? 's' : '' }}
                  </text>
                  <g transform="translate(0, 80)">
                    <g v-for="i in Math.min(diceCount, 4)" :key="`die-${i}`"
                      :transform="`translate(${svgWidth/2 - (Math.min(diceCount, 4) * 55)/2 + (i-1) * 110}, 0)`"
                    >
                      <rect 
                        width="80" 
                        height="80" 
                        rx="10"
                        fill="white" 
                        stroke="#0B1120" 
                        stroke-width="2"
                      />
                      <!-- Die dots pattern (simplified) -->
                      <circle cx="40" cy="40" r="8" fill="#0B1120" />
                      <circle cx="20" cy="20" r="6" fill="#0B1120" />
                      <circle cx="60" cy="60" r="6" fill="#0B1120" />
                    </g>
                  </g>
                  <text :x="svgWidth/2" :y="220" text-anchor="middle" class="fill-slate-600 text-base">
                    Elke dobbelsteen heeft 6 mogelijkheden
                  </text>
                  <text :x="svgWidth/2" :y="260" text-anchor="middle" class="fill-brand-orange text-2xl font-bold font-mono">
                    6^{{ diceCount }} = {{ diceResult.toLocaleString() }}
                  </text>
                </template>

                <!-- Lottery Visualization -->
                <template v-if="countingType === 'lottery'">
                  <text :x="svgWidth/2" :y="40" text-anchor="middle" class="fill-slate-700 text-lg font-bold">
                    Loterij: {{ lotteryNumbers }} uit {{ lotteryMax }}
                  </text>
                  <g transform="translate(0, 80)">
                    <!-- Draw balls -->
                    <g v-for="i in Math.min(lotteryNumbers, 6)" :key="`ball-${i}`"
                      :transform="`translate(${svgWidth/2 - (Math.min(lotteryNumbers, 6) * 50)/2 + (i-1) * 100}, 0)`"
                    >
                      <circle 
                        cx="30" 
                        cy="30" 
                        r="30"
                        :fill="i % 2 === 0 ? '#F97316' : '#3B82F6'" 
                        stroke="white" 
                        stroke-width="3"
                      />
                      <text 
                        x="30" 
                        y="38" 
                        text-anchor="middle" 
                        class="fill-white text-lg font-bold"
                      >
                        {{ i }}
                      </text>
                    </g>
                  </g>
                  <text :x="svgWidth/2" :y="200" text-anchor="middle" class="fill-slate-600 text-base">
                    Volgorde maakt niet uit (combinatie)
                  </text>
                  <text :x="svgWidth/2" :y="240" text-anchor="middle" class="fill-brand-orange text-2xl font-bold font-mono">
                    C({{ lotteryMax }},{{ lotteryNumbers }}) = {{ Math.round(lotteryResult).toLocaleString() }}
                  </text>
                </template>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <template v-if="currentProblemType === 'tree'">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-slate-600">Wortel</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-slate-600">Knoop</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-0.5 bg-slate-400"></div>
                    <span class="text-slate-600">Tak</span>
                  </div>
                </template>
                
                <template v-if="currentProblemType === 'venn'">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-slate-600">Verzameling A</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-slate-600">Verzameling B</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span class="text-slate-600">A ∩ B</span>
                  </div>
                </template>
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
