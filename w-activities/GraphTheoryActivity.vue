<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  PhX, PhGraph, PhCirclesThree, PhPath, 
  PhCheckCircle, PhArrowRight, PhArrowLeft,
  PhPlay, PhPause, PhSteps, PhTreeStructure,
  PhCircuitry, PhGitMerge
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'analysis' }
})

const emit = defineEmits(['close', 'complete'])

// ==================== STATE MANAGEMENT ====================
const currentMode = ref(props.initialMode)
const currentStep = ref(0)
const currentSubMode = ref('explorer') // explorer, euler, dijkstra, mst

// Graph data structure
const nodes = ref([
  { id: 'A', x: 100, y: 100, label: 'A' },
  { id: 'B', x: 300, y: 80, label: 'B' },
  { id: 'C', x: 200, y: 250, label: 'C' },
  { id: 'D', x: 450, y: 150, label: 'D' },
  { id: 'E', x: 350, y: 300, label: 'E' },
  { id: 'F', x: 500, y: 280, label: 'F' }
])

const edges = ref([
  { from: 'A', to: 'B', weight: 4, id: 'e1' },
  { from: 'A', to: 'C', weight: 2, id: 'e2' },
  { from: 'B', to: 'C', weight: 1, id: 'e3' },
  { from: 'B', to: 'D', weight: 5, id: 'e4' },
  { from: 'C', to: 'D', weight: 8, id: 'e5' },
  { from: 'C', to: 'E', weight: 10, id: 'e6' },
  { from: 'D', to: 'E', weight: 2, id: 'e7' },
  { from: 'D', to: 'F', weight: 6, id: 'e8' },
  { from: 'E', to: 'F', weight: 3, id: 'e9' }
])

// Selected nodes for various algorithms
const selectedStartNode = ref('A')
const selectedEndNode = ref('F')
const selectedAlgorithm = ref('dijkstra') // dijkstra, prim, kruskal

// Animation state
const isAnimating = ref(false)
const animationStep = ref(0)
const animationSpeed = ref(1000)

// Highlighted elements for visualization
const highlightedNodes = ref(new Set())
const highlightedEdges = ref(new Set())
const visitedNodes = ref(new Set())
const visitedEdges = ref(new Set())
const pathEdges = ref(new Set())

// Challenge mode state
const challengeActive = ref(false)
const challengeType = ref('') // euler-check, shortest-path, build-mst
const challengeGraph = ref({ nodes: [], edges: [] })
const userAnswer = ref('')
const challengeFeedback = ref('')
const challengeSolved = ref(false)

// ==================== COMPUTED PROPERTIES ====================
// Calculate degree of each node
const nodeDegrees = computed(() => {
  const degrees = {}
  nodes.value.forEach(node => {
    degrees[node.id] = 0
  })
  edges.value.forEach(edge => {
    degrees[edge.from]++
    degrees[edge.to]++
  })
  return degrees
})

// Check for Euler path/circuit
const eulerAnalysis = computed(() => {
  const degrees = nodeDegrees.value
  const oddDegreeNodes = Object.entries(degrees).filter(([_, deg]) => deg % 2 === 1)
  
  if (oddDegreeNodes.length === 0) {
    return { type: 'circuit', message: 'Euler-circuit mogelijk (alle knopen hebben even graad)', possible: true }
  } else if (oddDegreeNodes.length === 2) {
    return { 
      type: 'path', 
      message: `Euler-pad mogelijk (knopen ${oddDegreeNodes.map(([id]) => id).join(' en ')} hebben oneven graad)`,
      possible: true,
      startNodes: oddDegreeNodes.map(([id]) => id)
    }
  } else {
    return { 
      type: 'none', 
      message: `Geen Euler-pad mogelijk (${oddDegreeNodes.length} knopen met oneven graad)`,
      possible: false 
    }
  }
})

// Total number of edges
const totalEdges = computed(() => edges.value.length)
const totalNodes = computed(() => nodes.value.length)

// Calculate shortest path using Dijkstra's algorithm
const dijkstraResult = computed(() => {
  const distances = {}
  const previous = {}
  const unvisited = new Set()
  
  nodes.value.forEach(node => {
    distances[node.id] = Infinity
    previous[node.id] = null
    unvisited.add(node.id)
  })
  
  distances[selectedStartNode.value] = 0
  
  while (unvisited.size > 0) {
    // Find minimum distance node
    let current = null
    let minDist = Infinity
    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDist) {
        minDist = distances[nodeId]
        current = nodeId
      }
    })
    
    if (current === null || distances[current] === Infinity) break
    
    unvisited.delete(current)
    
    // Find neighbors
    edges.value.forEach(edge => {
      let neighbor = null
      if (edge.from === current) neighbor = edge.to
      else if (edge.to === current) neighbor = edge.from
      
      if (neighbor && unvisited.has(neighbor)) {
        const alt = distances[current] + edge.weight
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt
          previous[neighbor] = current
        }
      }
    })
  }
  
  // Build path to target
  const path = []
  let current = selectedEndNode.value
  while (current !== null) {
    path.unshift(current)
    current = previous[current]
  }
  
  return { distances, path, totalDistance: distances[selectedEndNode.value] }
})

// Calculate MST using Prim's algorithm
const primResult = computed(() => {
  const mstEdges = []
  const visited = new Set()
  const startNode = nodes.value[0].id
  
  visited.add(startNode)
  
  while (visited.size < nodes.value.length) {
    let minEdge = null
    let minWeight = Infinity
    
    edges.value.forEach(edge => {
      const inMST = visited.has(edge.from) && !visited.has(edge.to)
      const inMSTReverse = visited.has(edge.to) && !visited.has(edge.from)
      
      if ((inMST || inMSTReverse) && edge.weight < minWeight) {
        minWeight = edge.weight
        minEdge = edge
      }
    })
    
    if (!minEdge) break
    
    mstEdges.push(minEdge)
    if (!visited.has(minEdge.from)) visited.add(minEdge.from)
    if (!visited.has(minEdge.to)) visited.add(minEdge.to)
  }
  
  const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0)
  return { edges: mstEdges, totalWeight }
})

// Calculate MST using Kruskal's algorithm
const kruskalResult = computed(() => {
  const sortedEdges = [...edges.value].sort((a, b) => a.weight - b.weight)
  const parent = {}
  
  nodes.value.forEach(node => {
    parent[node.id] = node.id
  })
  
  function find(nodeId) {
    if (parent[nodeId] !== nodeId) {
      parent[nodeId] = find(parent[nodeId])
    }
    return parent[nodeId]
  }
  
  function union(a, b) {
    parent[find(a)] = find(b)
  }
  
  const mstEdges = []
  sortedEdges.forEach(edge => {
    if (find(edge.from) !== find(edge.to)) {
      mstEdges.push(edge)
      union(edge.from, edge.to)
    }
  })
  
  const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0)
  return { edges: mstEdges, totalWeight }
})

// ==================== SVG GRAPHICS ====================
const svgWidth = 800
const svgHeight = 500

function getNodeById(id) {
  return nodes.value.find(n => n.id === id)
}

function getEdgeMidpoint(edge) {
  const fromNode = getNodeById(edge.from)
  const toNode = getNodeById(edge.to)
  return {
    x: (fromNode.x + toNode.x) / 2,
    y: (fromNode.y + toNode.y) / 2
  }
}

// ==================== ANIMATION FUNCTIONS ====================
async function startAnimation() {
  if (isAnimating.value) return
  isAnimating.value = true
  animationStep.value = 0
  highlightedNodes.value.clear()
  highlightedEdges.value.clear()
  visitedNodes.value.clear()
  visitedEdges.value.clear()
  pathEdges.value.clear()
  
  if (currentSubMode.value === 'dijkstra') {
    await animateDijkstra()
  } else if (currentSubMode.value === 'mst') {
    await animateMST()
  } else if (currentSubMode.value === 'euler') {
    await animateEuler()
  }
  
  isAnimating.value = false
}

async function animateDijkstra() {
  const result = dijkstraResult.value
  
  // Animate visiting nodes
  for (const nodeId of result.path) {
    highlightedNodes.value.add(nodeId)
    visitedNodes.value.add(nodeId)
    animationStep.value++
    await new Promise(resolve => setTimeout(resolve, animationSpeed.value))
  }
  
  // Highlight path edges
  for (let i = 0; i < result.path.length - 1; i++) {
    const from = result.path[i]
    const to = result.path[i + 1]
    const edge = edges.value.find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    )
    if (edge) {
      pathEdges.value.add(edge.id)
    }
  }
}

async function animateMST() {
  const result = selectedAlgorithm.value === 'prim' ? primResult.value : kruskalResult.value
  
  for (const edge of result.edges) {
    visitedEdges.value.add(edge.id)
    highlightedEdges.value.add(edge.id)
    highlightedNodes.value.add(edge.from)
    highlightedNodes.value.add(edge.to)
    animationStep.value++
    await new Promise(resolve => setTimeout(resolve, animationSpeed.value))
  }
}

async function animateEuler() {
  if (!eulerAnalysis.value.possible) return
  
  // Simple visualization of node degrees
  nodes.value.forEach(node => {
    if (nodeDegrees.value[node.id] % 2 === 1) {
      highlightedNodes.value.add(node.id)
    }
  })
}

function resetAnimation() {
  isAnimating.value = false
  animationStep.value = 0
  highlightedNodes.value.clear()
  highlightedEdges.value.clear()
  visitedNodes.value.clear()
  visitedEdges.value.clear()
  pathEdges.value.clear()
}

// ==================== CHALLENGE FUNCTIONS ====================
function generateChallenge(type) {
  challengeType.value = type
  challengeActive.value = true
  challengeSolved.value = false
  challengeFeedback.value = ''
  userAnswer.value = ''
  
  // Generate random graph for challenge
  const numNodes = 4 + Math.floor(Math.random() * 3) // 4-6 nodes
  const newNodes = []
  const newEdges = []
  
  // Create nodes in a grid pattern
  for (let i = 0; i < numNodes; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    newNodes.push({
      id: String.fromCharCode(65 + i),
      x: 150 + col * 200,
      y: 100 + row * 150,
      label: String.fromCharCode(65 + i)
    })
  }
  
  // Create random edges
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      if (Math.random() > 0.5) {
        newEdges.push({
          from: newNodes[i].id,
          to: newNodes[j].id,
          weight: Math.floor(Math.random() * 10) + 1,
          id: `e${i}${j}`
        })
      }
    }
  }
  
  challengeGraph.value = { nodes: newNodes, edges: newEdges }
}

function checkChallenge() {
  if (challengeType.value === 'euler-check') {
    const userAnswerLower = userAnswer.value.toLowerCase().trim()
    const isCircuit = eulerAnalysis.value.type === 'circuit'
    const isPath = eulerAnalysis.value.type === 'path'
    
    if ((userAnswerLower === 'circuit' && isCircuit) || 
        (userAnswerLower === 'pad' && isPath) ||
        (userAnswerLower === 'geen' && !isCircuit && !isPath)) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Je hebt de Euler-eigenschap correct geïdentificeerd.'
    } else {
      challengeFeedback.value = 'Nog niet juist. Tel het aantal knopen met oneven graad.'
    }
  } else if (challengeType.value === 'shortest-path') {
    const userDistance = parseInt(userAnswer.value)
    const correctDistance = dijkstraResult.value.totalDistance
    
    if (userDistance === correctDistance) {
      challengeSolved.value = true
      challengeFeedback.value = 'Correct! Dat is inderdaad de kortste afstand.'
    } else {
      challengeFeedback.value = `Nog niet juist. De kortste afstand is ${correctDistance}.`
    }
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
    title: 'Grafen: Basisbegrippen',
    description: 'Een graaf bestaat uit knopen (nodes) en verbindingen (edges).',
    focus: 'basics',
    instruction: 'Bekijk de graaf en identificeer de knopen en takken.',
    details: [
      'Knoop (node): een punt in de graaf',
      'Tak (edge): een verbinding tussen twee knopen',
      'Graad van een knoop: aantal verbindingen',
      'Gewogen graaf: takken hebben een gewicht/waarde'
    ]
  },
  {
    title: 'Euler-paden en -circuits',
    description: 'Een Euler-pad bezoekt elke tak exact één keer.',
    focus: 'euler',
    instruction: 'Controleer of de graaf een Euler-pad of -circuit heeft.',
    details: [
      'Euler-circuit: pad start en eindigt in zelfde knoop',
      'Euler-pad: start en eindigt in verschillende knopen',
      'Conditie circuit: alle knopen even graad',
      'Conditie pad: precies 2 knopen oneven graad'
    ]
  },
  {
    title: 'Kortste pad (Dijkstra)',
    description: 'Vind het kortste pad tussen twee knopen.',
    focus: 'dijkstra',
    instruction: 'Selecteer start- en eindknoop en start de animatie.',
    details: [
      'Dijkstra algoritme: systematisch zoeken',
      'Bij elke stap: bezoek dichtstbijzijnde onbezochte knoop',
      'Update afstanden naar buren',
      'Pad terugvinden via voorgangers'
    ]
  },
  {
    title: 'Minimum Spanning Tree',
    description: 'Vind een boom die alle knopen verbindt met minimale totale lengte.',
    focus: 'mst',
    instruction: 'Kies Prim of Kruskal en start de animatie.',
    details: [
      'Prim: start bij één knoop, groei stapsgewijs',
      'Kruskal: sorteer takken op gewicht, voeg toe als geen cyclus',
      'Resultaat: boom met n-1 takken',
      'Minimale totale lengte van alle verbindingen'
    ]
  }
]

function nextStep() {
  if (currentStep.value < analysisSteps.length - 1) {
    currentStep.value++
    updateSubMode()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    updateSubMode()
  }
}

function updateSubMode() {
  const focus = analysisSteps[currentStep.value].focus
  if (focus === 'basics') currentSubMode.value = 'explorer'
  else if (focus === 'euler') currentSubMode.value = 'euler'
  else if (focus === 'dijkstra') currentSubMode.value = 'dijkstra'
  else if (focus === 'mst') currentSubMode.value = 'mst'
  resetAnimation()
}

function setSubMode(mode) {
  currentSubMode.value = mode
  resetAnimation()
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
            <h1 class="text-lg font-bold text-slate-800">Grafentheorie</h1>
            <p class="text-sm text-slate-500">Euler, Dijkstra en MST</p>
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
              Algoritmes
            </button>
            <button 
              @click="currentMode = 'derivation'"
              :class="['px-4 py-1.5 rounded-md text-sm font-medium transition-all', 
                currentMode === 'derivation' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              Opgaven
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
          
          <!-- Mode: Algorithm Analysis -->
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

            <!-- Algorithm Controls -->
            <div class="p-4 space-y-5">
              <p class="text-sm text-slate-500 italic">{{ analysisSteps[currentStep].instruction }}</p>
              
              <!-- Sub-mode selector -->
              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="setSubMode('explorer')"
                  :class="['p-2 text-xs rounded-lg border transition-all flex flex-col items-center gap-1',
                    currentSubMode === 'explorer' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhCirclesThree class="text-lg" />
                  <span>Verkenner</span>
                </button>
                <button 
                  @click="setSubMode('euler')"
                  :class="['p-2 text-xs rounded-lg border transition-all flex flex-col items-center gap-1',
                    currentSubMode === 'euler' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhCircuitry class="text-lg" />
                  <span>Euler</span>
                </button>
                <button 
                  @click="setSubMode('dijkstra')"
                  :class="['p-2 text-xs rounded-lg border transition-all flex flex-col items-center gap-1',
                    currentSubMode === 'dijkstra' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhPath class="text-lg" />
                  <span>Dijkstra</span>
                </button>
                <button 
                  @click="setSubMode('mst')"
                  :class="['p-2 text-xs rounded-lg border transition-all flex flex-col items-center gap-1',
                    currentSubMode === 'mst' ? 'border-brand-orange bg-orange-50 text-brand-dark' : 'border-slate-200 hover:border-slate-300']"
                >
                  <PhTreeStructure class="text-lg" />
                  <span>MST</span>
                </button>
              </div>

              <!-- Node and Edge statistics -->
              <div v-if="currentSubMode === 'explorer' || currentSubMode === 'euler'" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-700 mb-2">Graaf eigenschappen</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Aantal knopen:</span>
                    <span class="font-mono font-bold">{{ totalNodes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">Aantal takken:</span>
                    <span class="font-mono font-bold">{{ totalEdges }}</span>
                  </div>
                  <div class="border-t border-slate-200 pt-2 mt-2">
                    <p class="text-xs font-bold text-slate-500 mb-1">Graden per knoop:</p>
                    <div class="grid grid-cols-3 gap-1 text-xs">
                      <div v-for="(degree, nodeId) in nodeDegrees" :key="nodeId" class="flex justify-between">
                        <span class="text-slate-500">{{ nodeId }}:</span>
                        <span 
                          class="font-mono font-bold"
                          :class="degree % 2 === 1 ? 'text-rose-600' : 'text-emerald-600'"
                        >
                          {{ degree }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Euler Analysis -->
              <div v-if="currentSubMode === 'euler'" class="p-3 bg-brand-dark text-white rounded-lg">
                <p class="text-sm font-bold mb-2">Euler analyse</p>
                <p class="text-xs text-white/80">{{ eulerAnalysis.message }}</p>
                <div v-if="eulerAnalysis.possible" class="mt-2 text-xs">
                  <p v-if="eulerAnalysis.type === 'circuit'" class="text-emerald-400">
                    Start in willekeurige knoop
                  </p>
                  <p v-else class="text-emerald-400">
                    Start in knoop {{ eulerAnalysis.startNodes?.[0] }}
                  </p>
                </div>
              </div>

              <!-- Dijkstra Controls -->
              <template v-if="currentSubMode === 'dijkstra'">
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Startknoop</label>
                    <select v-model="selectedStartNode" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange">
                      <option v-for="node in nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-brand-dark">Eindknoop</label>
                    <select v-model="selectedEndNode" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange">
                      <option v-for="node in nodes" :key="node.id" :value="node.id">{{ node.label }}</option>
                    </select>
                  </div>
                  <div v-if="dijkstraResult.totalDistance < Infinity" class="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p class="text-sm text-emerald-700">
                      Kortste afstand: <span class="font-bold font-mono">{{ dijkstraResult.totalDistance }}</span>
                    </p>
                    <p class="text-xs text-emerald-600 mt-1">
                      Pad: {{ dijkstraResult.path.join(' → ') }}
                    </p>
                  </div>
                </div>
              </template>

              <!-- MST Controls -->
              <template v-if="currentSubMode === 'mst'">
                <div class="space-y-3">
                  <div class="flex bg-slate-100 rounded-lg p-1">
                    <button 
                      @click="selectedAlgorithm = 'prim'"
                      :class="['flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all', 
                        selectedAlgorithm === 'prim' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']"
                    >
                      Prim
                    </button>
                    <button 
                      @click="selectedAlgorithm = 'kruskal'"
                      :class="['flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all', 
                        selectedAlgorithm === 'kruskal' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500']"
                    >
                      Kruskal
                    </button>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-sm font-bold text-slate-700 mb-1">
                      {{ selectedAlgorithm === 'prim' ? 'Prim Algoritme' : 'Kruskal Algoritme' }}
                    </p>
                    <p class="text-xs text-slate-600">
                      {{ selectedAlgorithm === 'prim' 
                        ? 'Start bij een knoop en voeg steeds de goedkoopste tak toe die een nieuwe knoop verbindt.' 
                        : 'Sorteer alle takken op gewicht en voeg toe als geen cyclus ontstaat.' }}
                    </p>
                  </div>
                  <div v-if="!isAnimating && animationStep > 0" class="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p class="text-sm text-emerald-700">
                      Totale lengte MST: <span class="font-bold font-mono">
                        {{ selectedAlgorithm === 'prim' ? primResult.totalWeight : kruskalResult.totalWeight }}
                      </span>
                    </p>
                  </div>
                </div>
              </template>

              <!-- Animation Controls -->
              <div v-if="currentSubMode === 'dijkstra' || currentSubMode === 'mst' || currentSubMode === 'euler'" class="space-y-3">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Animatiesnelheid</label>
                  <input 
                    type="range" 
                    v-model.number="animationSpeed" 
                    min="200" 
                    max="2000" 
                    step="200"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                  >
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>Snel</span>
                    <span>Langzaam</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="startAnimation" 
                    :disabled="isAnimating"
                    class="flex-1 py-2 bg-brand-orange text-white rounded-lg font-medium text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <PhPlay class="text-lg" />
                    {{ isAnimating ? 'Bezig...' : 'Start' }}
                  </button>
                  <button 
                    @click="resetAnimation"
                    class="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    <PhPause class="text-lg" />
                  </button>
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

          <!-- Mode: Challenges -->
          <template v-if="currentMode === 'derivation'">
            <div class="p-4 border-b border-slate-200">
              <h2 class="text-base font-bold text-slate-800 mb-1">Opgaven</h2>
              <p class="text-sm text-slate-600">Test je kennis van grafentheorie.</p>
            </div>

            <div class="p-4 space-y-4">
              <!-- Challenge Selection -->
              <div v-if="!challengeActive" class="space-y-3">
                <p class="text-sm text-slate-500">Kies een opdracht:</p>
                
                <button @click="generateChallenge('euler-check')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Euler analyse</div>
                  <div class="text-xs text-slate-500 mt-1">Bepaal of een graaf een Euler-pad of -circuit heeft.</div>
                </button>
                
                <button @click="generateChallenge('shortest-path')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Kortste pad</div>
                  <div class="text-xs text-slate-500 mt-1">Bereken de kortste afstand tussen twee knopen.</div>
                </button>
                
                <button @click="generateChallenge('build-mst')" class="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all">
                  <div class="font-medium text-sm text-slate-800">Bouw een MST</div>
                  <div class="text-xs text-slate-500 mt-1">Selecteer takken om een MST te bouwen.</div>
                </button>
              </div>

              <!-- Active Challenge -->
              <div v-else class="space-y-4">
                <div class="p-3 bg-brand-dark text-white rounded-lg">
                  <p class="text-sm font-medium">Opgave:</p>
                  <div v-if="challengeType === 'euler-check'" class="mt-2 text-xs text-white/80">
                    <p>Beantwoord: Heeft deze graaf een Euler-circuit, Euler-pad, of geen van beide?</p>
                    <p class="mt-1 text-white/60">Tip: tel de knopen met oneven graad.</p>
                  </div>
                  <div v-if="challengeType === 'shortest-path'" class="mt-2 text-xs text-white/80">
                    <p>Wat is de kortste afstand van {{ selectedStartNode }} naar {{ selectedEndNode }}?</p>
                  </div>
                  <div v-if="challengeType === 'build-mst'" class="mt-2 text-xs text-white/80">
                    <p>Selecteer takken om alle knopen te verbinden met minimale totale lengte.</p>
                  </div>
                </div>

                <!-- User Input -->
                <div class="space-y-3">
                  <div v-if="challengeType === 'euler-check'" class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Antwoord</label>
                    <select v-model="userAnswer" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange">
                      <option value="">Kies...</option>
                      <option value="circuit">Euler-circuit</option>
                      <option value="pad">Euler-pad</option>
                      <option value="geen">Geen van beide</option>
                    </select>
                  </div>
                  <div v-if="challengeType === 'shortest-path'" class="space-y-2">
                    <label class="text-sm font-bold text-slate-700">Afstand</label>
                    <input 
                      type="number" 
                      v-model.number="userAnswer" 
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
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Graaf kenmerken</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Orde (|V|):</span>
                <span class="font-mono">{{ totalNodes }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Grootte (|E|):</span>
                <span class="font-mono">{{ totalEdges }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Type:</span>
                <span class="text-slate-500">Gewogen, ongericht</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Euler:</span>
                <span :class="['font-medium', eulerAnalysis.possible ? 'text-emerald-600' : 'text-rose-600']">
                  {{ eulerAnalysis.type === 'circuit' ? 'Circuit' : eulerAnalysis.type === 'path' ? 'Pad' : 'Onmogelijk' }}
                </span>
              </div>
              <div v-if="currentSubMode === 'dijkstra' && dijkstraResult.totalDistance < Infinity" class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span class="text-slate-600">Afstand ({{ selectedStartNode }}→{{ selectedEndNode }}):</span>
                <span class="font-mono text-brand-orange">{{ dijkstraResult.totalDistance }}</span>
              </div>
              <div v-if="currentSubMode === 'mst' && (primResult.totalWeight > 0 || kruskalResult.totalWeight > 0)" class="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span class="text-slate-600">MST gewicht:</span>
                <span class="font-mono text-brand-orange">
                  {{ selectedAlgorithm === 'prim' ? primResult.totalWeight : kruskalResult.totalWeight }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Graph Visualization -->
        <div class="flex-1 bg-slate-100 p-6 flex flex-col">
          <!-- Info Display -->
          <div class="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-200">
            <div class="flex items-center justify-center gap-4">
              <span class="text-sm text-slate-500">Huidige modus:</span>
              <span class="text-xl font-mono font-bold text-brand-dark">
                {{ currentSubMode === 'explorer' ? 'Graaf Verkenner' : 
                   currentSubMode === 'euler' ? 'Euler Analyse' :
                   currentSubMode === 'dijkstra' ? `Dijkstra (${selectedStartNode} → ${selectedEndNode})` :
                   `MST (${selectedAlgorithm === 'prim' ? 'Prim' : 'Kruskal'})` }}
              </span>
            </div>
          </div>

          <!-- Graph Container -->
          <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <svg 
              :viewBox="`0 0 ${svgWidth} ${svgHeight}`" 
              class="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Grid background -->
              <g stroke="#E2E8F0" stroke-width="1">
                <line v-for="i in 9" :key="`v${i}`" 
                  :x1="i * 100" y1="0" 
                  :x2="i * 100" :y2="svgHeight" 
                />
                <line v-for="i in 5" :key="`h${i}`" 
                  x1="0" :y1="i * 100" 
                  :x2="svgWidth" :y2="i * 100" 
                />
              </g>

              <!-- Edges -->
              <g>
                <line 
                  v-for="edge in edges" 
                  :key="edge.id"
                  :x1="getNodeById(edge.from).x"
                  :y1="getNodeById(edge.from).y"
                  :x2="getNodeById(edge.to).x"
                  :y2="getNodeById(edge.to).y"
                  :stroke="pathEdges.has(edge.id) ? '#F97316' : visitedEdges.has(edge.id) ? '#10B981' : '#CBD5E1'"
                  :stroke-width="pathEdges.has(edge.id) || visitedEdges.has(edge.id) ? 4 : 2"
                  :opacity="highlightedEdges.size > 0 && !highlightedEdges.has(edge.id) && !visitedEdges.has(edge.id) ? 0.3 : 1"
                />
                
                <!-- Edge weights -->
                <text 
                  v-for="edge in edges" 
                  :key="`w${edge.id}`"
                  :x="getEdgeMidpoint(edge).x"
                  :y="getEdgeMidpoint(edge).y"
                  text-anchor="middle"
                  class="text-xs font-bold"
                  :fill="pathEdges.has(edge.id) ? '#F97316' : '#64748B'"
                  :class="pathEdges.has(edge.id) ? 'font-bold' : ''"
                >
                  {{ edge.weight }}
                </text>
              </g>

              <!-- Nodes -->
              <g>
                <circle 
                  v-for="node in nodes"
                  :key="node.id"
                  :cx="node.x"
                  :cy="node.y"
                  :r="highlightedNodes.has(node.id) ? 25 : 20"
                  :fill="highlightedNodes.has(node.id) ? '#F97316' : visitedNodes.has(node.id) ? '#10B981' : '#0B1120'"
                  stroke="white"
                  stroke-width="3"
                  :opacity="highlightedNodes.size > 0 && !highlightedNodes.has(node.id) && !visitedNodes.has(node.id) ? 0.5 : 1"
                  class="transition-all duration-300"
                />
                <text 
                  v-for="node in nodes"
                  :key="`l${node.id}`"
                  :x="node.x"
                  :y="node.y"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="fill-white text-sm font-bold"
                >
                  {{ node.label }}
                </text>
                
                <!-- Degree labels -->
                <text 
                  v-for="node in nodes"
                  :key="`d${node.id}`"
                  :x="node.x"
                  :y="node.y + 35"
                  text-anchor="middle"
                  class="text-xs font-mono"
                  :class="nodeDegrees[node.id] % 2 === 1 ? 'fill-rose-600' : 'fill-slate-400'"
                >
                  deg: {{ nodeDegrees[node.id] }}
                </text>
              </g>

              <!-- Start/End markers for Dijkstra -->
              <g v-if="currentSubMode === 'dijkstra'">
                <text 
                  :x="getNodeById(selectedStartNode).x"
                  :y="getNodeById(selectedStartNode).y - 30"
                  text-anchor="middle"
                  class="fill-emerald-600 text-xs font-bold"
                >
                  START
                </text>
                <text 
                  :x="getNodeById(selectedEndNode).x"
                  :y="getNodeById(selectedEndNode).y - 30"
                  text-anchor="middle"
                  class="fill-rose-600 text-xs font-bold"
                >
                  EIND
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-slate-900"></div>
                  <span class="text-slate-600">Knoop</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span class="text-slate-600">Bezocht</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span class="text-slate-600">Huidige</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-0.5 bg-slate-300"></div>
                  <span class="text-slate-600">Tak (gewicht)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-1 bg-orange-500"></div>
                  <span class="text-slate-600">Pad/MST</span>
                </div>
              </div>
            </div>

            <!-- Animation progress -->
            <div v-if="isAnimating || animationStep > 0" class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span class="text-xs text-slate-600">Stap: {{ animationStep }}</span>
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
