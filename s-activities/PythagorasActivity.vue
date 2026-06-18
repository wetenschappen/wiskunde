<script setup>
import { ref, computed, watch } from 'vue'
import { 
  PhX, PhTriangle, PhCheckCircle, PhWarningCircle, PhArrowRight, 
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelling van Pythagoras'
  },
  instruction: {
    type: String,
    default: 'De stelling van Pythagoras stelt dat in een rechthoekige driehoek het kwadraat van de schuine zijde gelijk is aan de som van de kwadraten van de rechthoekszijden.'
  },
  totalSteps: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['close', 'complete'])

const PHASES = Object.freeze({
  EXPLORATION: 'exploration',
  FORMULATION: 'formulation',
  APPLICATION: 'application',
  PROOF: 'proof'
});

const phaseOrder = [PHASES.EXPLORATION, PHASES.FORMULATION, PHASES.APPLICATION, PHASES.PROOF];

// --- 1. UI STATE ---
const shouldPulse = ref(false)

// --- 2. ACTIVITY STATE ---
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// --- 3. PHASE SYSTEM ---
const currentPhase = ref(PHASES.EXPLORATION)
const progress = ref({
  [PHASES.EXPLORATION]: { completed: false, attempts: 0 },
  [PHASES.FORMULATION]: { completed: false, attempts: 0 },
  [PHASES.APPLICATION]: { completed: false, attempts: 0 },
  [PHASES.PROOF]: { completed: false, attempts: 0 }
})

// --- 4. DOMAIN LOGIC ---
const difficulty = ref('easy')
const currentProblem = ref({ a: 3, b: 4, answer: 5 })

function checkAnswer() {
  isChecked.value = true
  
  if (currentPhase.value === PHASES.APPLICATION) {
    const correctAnswer = currentProblem.value.answer
    const userNum = parseFloat(userAnswer.value)
    
    if (!isNaN(userNum) && Math.abs(userNum - correctAnswer) < 0.1) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: `Correct!` }
      progress.value[PHASES.APPLICATION].completed = true
    } else {
      isCorrect.value = false
      feedback.value = { type: 'error', text: 'Fout.' }
    }
  }
}

function goToNextPhase() {
  const currentIndex = phaseOrder.indexOf(currentPhase.value)
  
  if (currentIndex < phaseOrder.length - 1) {
    currentPhase.value = phaseOrder[currentIndex + 1]
  }
}

function gcd(a, b) {
    if (b === 0) return a;
    return gcd(b, a % b);
}

function generateRandomProblem() {
  // Using Euclid's formula to generate a Pythagorean triple
  let m, n;
  do {
    m = Math.floor(Math.random() * 7) + 2; // m > 1
    n = Math.floor(Math.random() * (m - 1)) + 1; // 0 < n < m
  } while (
    (m - n) % 2 === 0 || // m and n must have opposite parity
    gcd(m, n) !== 1 // m and n must be coprime
  );
  
  const a = m*m - n*n;
  const b = 2*m*n;
  const c = m*m + n*n;

  // Randomly swap a and b for variety
  if (Math.random() > 0.5) {
      currentProblem.value = { a: b, b: a, answer: c };
  } else {
      currentProblem.value = { a: a, b: b, answer: c };
  }

  // Reset answer state for new problem
  userAnswer.value = '';
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
}

// --- 5. ACTIVITY STATE MANAGEMENT ---
function resetActivityState() {
  isCorrect.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  currentProblem.value = { a: 3, b: 4, answer: 5 } // Reset to default problem
  progress.value = {
    [PHASES.EXPLORATION]: { completed: false, attempts: 0 },
    [PHASES.FORMULATION]: { completed: false, attempts: 0 },
    [PHASES.APPLICATION]: { completed: false, attempts: 0 },
    [PHASES.PROOF]: { completed: false, attempts: 0 }
  }
}

// --- 6. USER INPUT ---
const userAnswer = ref('')
const vertices = ref([
  { id: 0, x: 100, y: 100, label: 'A', dragging: false },
  { id: 1, x: 300, y: 100, label: 'B', dragging: false },
  { id: 2, x: 100, y: 300, label: 'C', dragging: false }
])

const sideLengths = computed(() => {
  const a = Math.sqrt(Math.pow(vertices.value[1].x - vertices.value[2].x, 2) + Math.pow(vertices.value[1].y - vertices.value[2].y, 2)) / 10
  const b = Math.sqrt(Math.pow(vertices.value[0].x - vertices.value[2].x, 2) + Math.pow(vertices.value[0].y - vertices.value[2].y, 2)) / 10
  const c = Math.sqrt(Math.pow(vertices.value[0].x - vertices.value[1].x, 2) + Math.pow(vertices.value[0].y - vertices.value[1].y, 2)) / 10
  return { a, b, c }
})

const isRightTriangle = computed(() => {
  const sides = sideLengths.value
  const a2 = Math.pow(sides.a, 2)
  const b2 = Math.pow(sides.b, 2)
  const c2 = Math.pow(sides.c, 2)
  return Math.abs(a2 + b2 - c2) < 0.01
})

function startDrag(vertexId) {
  const vertex = vertices.value.find(v => v.id === vertexId)
  if (vertex) {
    vertex.dragging = true
  }
}

function stopDrag() {
  vertices.value.forEach(v => {
    v.dragging = false
  })
}

function doDrag(event, vertexId) {
  const vertex = vertices.value.find(v => v.id === vertexId)
  if (vertex && vertex.dragging) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    vertex.x = Math.max(0, Math.min(400, x))
    vertex.y = Math.max(0, Math.min(300, y))
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    vertices.value.forEach(v => {
      v.dragging = false
    })
  }
})

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <PhTriangle weight="fill" class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ phaseOrder.indexOf(currentPhase) + 1 }} van {{ totalSteps }}</p>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600">
              {{ instruction }}
            </div>

            <div v-if="currentPhase === PHASES.EXPLORATION" class="p-4 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium">Ontdek de relatie tussen de zijden van de driehoek door te experimenteren.</p>
            </div>
            <div v-else-if="currentPhase === PHASES.FORMULATION" class="p-4 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium">Formuleer de stelling in eigen woorden.</p>
            </div>
            <div v-else-if="currentPhase === PHASES.APPLICATION" class="p-4 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium">Bereken de schuine zijde van een driehoek met rechthoekszijden 3 en 4.</p>
            </div>
            <div v-else-if="currentPhase === PHASES.PROOF" class="p-4 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium">Volg de stappen om het bewijs te begrijpen.</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
              <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="goToNextPhase" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>Volgende</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            <div class="p-4 mb-4 bg-white rounded-lg shadow-sm md:hidden shrink-0">
              <h3 class="mb-1 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
              <div class="prose prose-sm text-slate-600">
                {{ instruction }}
              </div>
            </div>

            <!-- Exploration Phase -->
            <div v-if="currentPhase === PHASES.EXPLORATION" class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid">
              <div class="relative w-full max-w-md">
                <svg viewBox="0 0 400 300" class="w-full select-none"
                     @mousemove="(e) => { const dragging = vertices.find(v => v.dragging); if (dragging) doDrag(e, dragging.id); }"
                     @mouseup="stopDrag"
                     @mouseleave="stopDrag">
                  <polygon :points="vertices.map(v => `${v.x},${v.y}`).join(' ')" class="fill-blue-200 stroke-blue-500 stroke-2" />
                  
                  <line :x1="vertices[1].x" :y1="vertices[1].y" :x2="vertices[2].x" :y2="vertices[2].y" class="stroke-slate-400 stroke-2" />
                  <line :x1="vertices[0].x" :y1="vertices[0].y" :x2="vertices[2].x" :y2="vertices[2].y" class="stroke-slate-400 stroke-2" />
                  <line :x1="vertices[0].x" :y1="vertices[0].y" :x2="vertices[1].x" :y2="vertices[1].y" class="stroke-red-500 stroke-2" />
                  
                  <text :x="(vertices[1].x + vertices[2].x) / 2" :y="(vertices[1].y + vertices[2].y) / 2 + 20" text-anchor="middle" class="text-sm font-bold fill-slate-600">a</text>
                  <text :x="vertices[0].x - 15" :y="(vertices[0].y + vertices[2].y) / 2" text-anchor="middle" class="text-sm font-bold fill-slate-600">b</text>
                  <text :x="(vertices[0].x + vertices[1].x) / 2 - 10" :y="(vertices[0].y + vertices[1].y) / 2 - 10" text-anchor="middle" class="text-sm font-bold fill-red-600">c</text>
                  
                  <circle v-for="v in vertices" :key="v.id" :cx="v.x" :cy="v.y" r="12"
                          class="cursor-grab fill-white stroke-blue-500 stroke-2 hover:fill-blue-100 transition-colors"
                          :class="{ 'fill-blue-300 cursor-grabbing': v.dragging }"
                          @mousedown.stop="startDrag(v.id)" />
                  
                  <text v-for="v in vertices" :key="'label-' + v.id" :x="v.x" :y="v.y + 4" text-anchor="middle" class="text-xs font-bold fill-blue-700 pointer-events-none select-none">{{ v.label }}</text>
                </svg>
                
                <div class="mt-6 p-4 bg-white rounded-lg shadow-sm">
                  <div class="flex justify-center gap-8 mb-3">
                    <div class="text-center">
                      <span class="text-xs font-medium text-slate-500">Zijde a</span>
                      <p class="text-lg font-bold text-slate-700">{{ sideLengths.a.toFixed(1) }}</p>
                    </div>
                    <div class="text-center">
                      <span class="text-xs font-medium text-slate-500">Zijde b</span>
                      <p class="text-lg font-bold text-slate-700">{{ sideLengths.b.toFixed(1) }}</p>
                    </div>
                    <div class="text-center">
                      <span class="text-xs font-medium text-slate-500">Zijde c</span>
                      <p class="text-lg font-bold text-red-600">{{ sideLengths.c.toFixed(1) }}</p>
                    </div>
                  </div>
                  <p class="text-center text-sm text-slate-600">Rechthoekige driehoek met zijden a, b en c</p>
                  <div v-if="isRightTriangle" class="mt-3 p-2 bg-emerald-100 rounded-lg text-center">
                    <p class="text-sm font-bold text-emerald-700">Dit is een rechthoekige driehoek! a² + b² = c²</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulation Phase -->
            <div v-else-if="currentPhase === PHASES.FORMULATION" class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50">
              <div class="w-full max-w-md">
                <h3 class="mb-4 text-lg font-bold text-center">Formuleer de stelling</h3>
                <textarea v-model="formulationText" 
                         class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         rows="4"
                         placeholder="Beschrijf in eigen woorden de relatie tussen a, b en c..."></textarea>
              </div>
            </div>

            <!-- Application Phase -->
            <div v-else-if="currentPhase === PHASES.APPLICATION" class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50">
              <div class="w-full max-w-md">
                <h3 class="mb-4 text-lg font-bold text-center">Pas de stelling toe</h3>
                <div class="p-4 mb-4 bg-white rounded-lg">
                  <p class="text-center">Gegeven een rechthoekige driehoek met zijden a={{ currentProblem.a }} en b={{ currentProblem.b }}.</p>
                  <p class="mt-2 text-center">Wat is de lengte van de schuine zijde c?</p>
                  <svg viewBox="0 0 200 150" class="w-full mt-4">
                    <polygon points="20,120 100,120 20,20" class="fill-blue-100 stroke-blue-500 stroke-2" />
                    <text x="60" y="130" text-anchor="middle" class="text-xs">{{ currentProblem.a }}</text>
                    <text x="10" y="70" text-anchor="middle" class="text-xs">{{ currentProblem.b }}</text>
                  </svg>
                </div>
                <div class="flex items-center gap-2 mb-3">
                  <input v-model="userAnswer"
                        type="number"
                        class="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Bereken c...">
                  <button @click="generateRandomProblem" class="px-4 py-3 font-bold text-white transition-all rounded-lg bg-slate-600 hover:bg-slate-700 active:scale-[0.98]">
                    Nieuwe Opgave
                  </button>
                </div>
              </div>
            </div>

            <!-- Proof Phase -->
            <div v-else-if="currentPhase === PHASES.PROOF" class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50">
              <div class="w-full max-w-2xl">
                <h3 class="mb-4 text-lg font-bold text-center">Bewijs de stelling</h3>
                <div class="p-6 bg-white rounded-lg">
                  <p class="mb-4">Het bewijs gebruikt vier identieke rechthoekige driehoeken en een groot vierkant:</p>
                  <div class="flex justify-center mb-4">
                    <svg viewBox="0 0 220 220" class="w-48 h-48">
                      <rect x="20" y="20" width="180" height="180" fill="white" stroke="black" stroke-width="1" />
                      <polygon points="20,20 120,20 20,120" fill="#d4f2e7" stroke="#2d7d5b" stroke-width="2" />
                      <polygon points="120,20 200,20 200,120" fill="#d4f2e7" stroke="#2d7d5b" stroke-width="2" />
                      <polygon points="200,120 200,200 100,200" fill="#d4f2e7" stroke="#2d7d5b" stroke-width="2" />
                      <polygon points="20,120 100,200 20,200" fill="#d4f2e7" stroke="#2d7d5b" stroke-width="2" />
                      <rect x="100" y="100" width="20" height="20" fill="#fce8e8" stroke="#d63535" stroke-width="2" />
                      
                      <text x="70" y="15" text-anchor="middle" class="text-xs">a</text>
                      <text x="205" y="70" text-anchor="middle" class="text-xs">a</text>
                      <text x="150" y="210" text-anchor="middle" class="text-xs">a</text>
                      <text x="15" y="150" text-anchor="middle" class="text-xs">a</text>
                      
                      <text x="130" y="45" text-anchor="middle" class="text-xs">b</text>
                      <text x="215" y="130" text-anchor="middle" class="text-xs">b</text>
                      <text x="90" y="215" text-anchor="middle" class="text-xs">b</text>
                      <text x="45" y="90" text-anchor="middle" class="text-xs">b</text>
                      
                      <text x="110" y="85" text-anchor="middle" class="text-xs font-bold">c²</text>
                    </svg>
                  </div>
                  <ol class="space-y-2 text-sm">
                    <li class="p-2 bg-blue-50 rounded">1. Het totale oppervlak van het grote vierkant is (a + b)²</li>
                    <li class="p-2 bg-blue-50 rounded">2. Het oppervlak van de vier driehoeken is 4 × (½ab) = 2ab</li>
                    <li class="p-2 bg-blue-50 rounded">3. Het overgebleven oppervlak (klein vierkant) is c²</li>
                    <li class="p-2 bg-blue-50 rounded">4. Dus: (a + b)² = 2ab + c²</li>
                    <li class="p-2 bg-blue-50 rounded">5. Uitwerken: a² + 2ab + b² = 2ab + c² → a² + b² = c²</li>
                  </ol>
                </div>
              </div>
            </div>

            <div class="mt-6 md:hidden shrink-0">
              <div v-if="feedback.text" class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
                <span>{{ feedback.text }}</span>
              </div>
              <div class="flex items-center gap-3">
                <button @click="resetActivityState" class="p-3 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200"><PhArrowClockwise /></button>
                <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white rounded-lg bg-slate-800 disabled:opacity-50">Controleer</button>
                <button v-else @click="goToNextPhase" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600">Volgende</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.shadow-inner-light {
  box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1);
}

.pattern-grid {
  background-image: 
    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  background-size: 2rem 2rem;
  background-position: center center;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ring-pulse-amber {
  animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3;
  z-index: 50;
}
@keyframes ring-pulse-amber {
  0% { box-shadow: 0 0 0 0 #fbbf24; }
  70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
  100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>