<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhCube,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Onderlinge ligging in de ruimte'
  },
  instruction: {
    type: String,
    default: 'Klik op twee lijnen in de kubus om aan de opdracht te voldoen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Definition of all lines
// Cube: Bottom A,B,C,D. Top E,F,G,H.
// format: 'AB' always sorted alphabetically to make comparison easy
const allLines = [
  'AB', 'BC', 'CD', 'AD', // bottom edges
  'EF', 'FG', 'GH', 'EH', // top edges
  'AE', 'BF', 'CG', 'DH', // vertical edges
  'AG', 'BH', 'CE', 'DF'  // internal diagonals (cross entire cube)
]

// Parallel groups
const parallelGroups = [
  ['AB', 'CD', 'EF', 'GH'], // x-axis
  ['AD', 'BC', 'EH', 'FG'], // z-axis (depth)
  ['AE', 'BF', 'CG', 'DH']  // y-axis
]

// Helper to check relationship
function getRelationship(l1, l2) {
  if (l1 === l2) return 'identical';
  
  // Check parallel
  for (let group of parallelGroups) {
    if (group.includes(l1) && group.includes(l2)) return 'evenwijdig';
  }

  // Check intersecting (share exactly 1 letter)
  const set1 = new Set(l1.split(''));
  const set2 = new Set(l2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  
  if (intersection.size === 1) {
    return 'snijdend';
  }

  // Special case: Internal diagonals intersect in the center, though they share no letters
  const diagonals = ['AG', 'BH', 'CE', 'DF'];
  if (diagonals.includes(l1) && diagonals.includes(l2)) {
    return 'snijdend'; // They all intersect in the center of the cube
  }

  // If not parallel and not intersecting, they are skew
  return 'kruisend';
}

const levels = [
  {
    goalText: 'Opdracht 1: Selecteer twee lijnen die elkaar snijden.',
    targetRel: 'snijdend'
  },
  {
    goalText: 'Opdracht 2: Selecteer twee lijnen die evenwijdig zijn.',
    targetRel: 'evenwijdig'
  },
  {
    goalText: 'Opdracht 3: Selecteer twee lijnen die kruisend zijn (niet evenwijdig én niet snijdend).',
    targetRel: 'kruisend'
  }
]

const currentInternalLevel = ref(0)
const currentLevelData = computed(() => levels[currentInternalLevel.value])

const selectedLines = ref([])

function toggleLine(lineName) {
  if (isCorrect.value) return;
  
  if (selectedLines.value.includes(lineName)) {
    selectedLines.value = selectedLines.value.filter(l => l !== lineName);
  } else {
    if (selectedLines.value.length < 2) {
      selectedLines.value.push(lineName);
    } else {
      selectedLines.value.shift();
      selectedLines.value.push(lineName);
    }
  }
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Selecteer exact 2 lijnen.' };
  selectedLines.value = [];
}

function checkAnswer() {
  isChecked.value = true;
  if (selectedLines.value.length !== 2) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Selecteer precies 2 lijnen door erop te klikken.' };
    return;
  }

  const rel = getRelationship(selectedLines.value[0], selectedLines.value[1]);
  const targetRel = currentLevelData.value.targetRel;

  if (rel === targetRel) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! De lijnen ${selectedLines.value[0]} en ${selectedLines.value[1]} zijn inderdaad ${rel}.` 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: `Niet juist. De lijnen die je selecteerde (${selectedLines.value[0]} en ${selectedLines.value[1]}) zijn ${rel}, maar je moest op zoek naar ${targetRel}.`
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
              </div>
            </div>
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
            <div class="text-center bg-orange-50 p-5 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner text-center">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Geselecteerde Lijnen</p>
              <div class="flex gap-4 justify-center">
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all"
                     :class="selectedLines[0] ? 'border-orange-500 text-orange-600 bg-orange-50 ring-4 ring-orange-100' : 'border-slate-300 text-slate-300'">
                  {{ selectedLines[0] || '?' }}
                </div>
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all"
                     :class="selectedLines[1] ? 'border-orange-500 text-orange-600 bg-orange-50 ring-4 ring-orange-100' : 'border-slate-300 text-slate-300'">
                  {{ selectedLines[1] || '?' }}
                </div>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <!-- Isometric Cube SVG -->
              <!-- To make it interactive and precise, we use distinct clickable lines -->
              <svg width="400" height="400" viewBox="-20 -20 240 240" class="overflow-visible stroke-slate-800 stroke-2 fill-none" stroke-linejoin="round" stroke-linecap="round">
                
                <!-- Definition of points 
                     A: 50,150 | B: 150,150 | C: 180,110 | D: 80,110 
                     E: 50,50  | F: 150,50  | G: 180,10  | H: 80,10  -->

                <!-- Background transparent faces to give context without blocking clicks -->
                <polygon points="50,150 150,150 150,50 50,50" fill="white" opacity="0.6"/> 
                <polygon points="150,150 180,110 180,10 150,50" fill="#f8fafc" opacity="0.6"/> 
                <polygon points="50,50 150,50 180,10 80,10" fill="#f1f5f9" opacity="0.6"/>

                <!-- Helpers for creating clickable lines -->
                <!-- Bottom Edges -->
                <line x1="50" y1="150" x2="150" y2="150" :stroke="selectedLines.includes('AB') ? '#f97316' : '#cbd5e1'" :stroke-width="selectedLines.includes('AB') ? 8 : 4" @click="toggleLine('AB')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="150" x2="180" y2="110" :stroke="selectedLines.includes('BC') ? '#f97316' : '#cbd5e1'" :stroke-width="selectedLines.includes('BC') ? 8 : 4" @click="toggleLine('BC')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="110" x2="80" y2="110" :stroke="selectedLines.includes('CD') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('CD') ? 8 : 4" @click="toggleLine('CD')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="50" y1="150" x2="80" y2="110" :stroke="selectedLines.includes('AD') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('AD') ? 8 : 4" @click="toggleLine('AD')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Top Edges -->
                <line x1="50" y1="50" x2="150" y2="50" :stroke="selectedLines.includes('EF') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('EF') ? 8 : 4" @click="toggleLine('EF')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="50" x2="180" y2="10" :stroke="selectedLines.includes('FG') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('FG') ? 8 : 4" @click="toggleLine('FG')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="10" x2="80" y2="10" :stroke="selectedLines.includes('GH') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('GH') ? 8 : 4" @click="toggleLine('GH')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="50" y1="50" x2="80" y2="10" :stroke="selectedLines.includes('EH') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('EH') ? 8 : 4" @click="toggleLine('EH')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Vertical Edges -->
                <line x1="50" y1="150" x2="50" y2="50" :stroke="selectedLines.includes('AE') ? '#f97316' : '#94a3b8'" :stroke-width="selectedLines.includes('AE') ? 8 : 4" @click="toggleLine('AE')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="150" y1="150" x2="150" y2="50" :stroke="selectedLines.includes('BF') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('BF') ? 8 : 4" @click="toggleLine('BF')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="180" y1="110" x2="180" y2="10" :stroke="selectedLines.includes('CG') ? '#f97316' : '#64748b'" :stroke-width="selectedLines.includes('CG') ? 8 : 4" @click="toggleLine('CG')" class="cursor-pointer transition-all hover:stroke-orange-300" />
                <line x1="80" y1="110" x2="80" y2="10" :stroke="selectedLines.includes('DH') ? '#f97316' : '#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('DH') ? 8 : 4" @click="toggleLine('DH')" class="cursor-pointer transition-all hover:stroke-orange-300" />

                <!-- Internal Diagonals (only visible if selected, to avoid clutter) -->
                <!-- Use invisible hitboxes for clicking them -->
                <line v-if="selectedLines.includes('AG')" x1="50" y1="150" x2="180" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('BH')" x1="150" y1="150" x2="80" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('CE')" x1="180" y1="110" x2="50" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
                <line v-if="selectedLines.includes('DF')" x1="80" y1="110" x2="150" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />

                <!-- Ghost hitboxes for diagonals to make them clickable even when invisible -->
                <line x1="50" y1="150" x2="180" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('AG')" class="cursor-pointer hover:stroke-orange-100 hover:stroke-width="4"" />
                <line x1="150" y1="150" x2="80" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('BH')" class="cursor-pointer hover:stroke-orange-100 hover:stroke-width="4"" />
                <line x1="180" y1="110" x2="50" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('CE')" class="cursor-pointer hover:stroke-orange-100 hover:stroke-width="4"" />
                <line x1="80" y1="110" x2="150" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('DF')" class="cursor-pointer hover:stroke-orange-100 hover:stroke-width="4"" />

                <!-- Labels -->
                <g fill="#1e293b" font-weight="bold" font-size="16" stroke="none">
                  <text x="35" y="165">A</text>
                  <text x="155" y="165">B</text>
                  <text x="185" y="125">C</text>
                  <text x="65" y="125">D</text>
                  
                  <text x="35" y="45">E</text>
                  <text x="155" y="45">F</text>
                  <text x="185" y="5">G</text>
                  <text x="65" y="5">H</text>
                </g>
                
              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
:root { font-family: 'Inter', sans-serif; }

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>