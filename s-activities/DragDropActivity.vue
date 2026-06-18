<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhXCircle, PhArrowsLeftRight, PhStar, PhTrophy, PhArrowClockwise } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Drag & Drop Oefening'
  },
  instruction: {
    type: String,
    default: 'Sleep elk begrip naar de juiste definitie'
  },
  // Array of { term: string, definition: string }
  pairs: {
    type: Array,
    default: () => [
      { term: 'Kracht (F)', definition: 'Eenheid: Newton (N)' },
      { term: 'Massa (m)', definition: 'Eenheid: Kilogram (kg)' },
      { term: 'Versnelling (a)', definition: 'Eenheid: m/s²' },
      { term: 'Snelheid (v)', definition: 'Eenheid: m/s' }
    ]
  },
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// STATE
const draggedItem = ref(null)
const matches = ref({}) // { definitionIndex: termIndex }
const feedback = ref({}) // { definitionIndex: 'correct' | 'incorrect' | null }
const isComplete = ref(false)
const attempts = ref(0)

// Shuffle terms for display (so they're not in order)
const shuffledTerms = ref([])

onMounted(() => {
  resetActivity()
})

function resetActivity() {
  // Create shuffled indices
  const indices = props.pairs.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  shuffledTerms.value = indices
  matches.value = {}
  feedback.value = {}
  isComplete.value = false
  attempts.value = 0
}

// Check if a term has been placed
function isTermPlaced(termIndex) {
  return Object.values(matches.value).includes(termIndex)
}

// Get which term is in a drop zone
function getTermInZone(defIndex) {
  return matches.value[defIndex] !== undefined ? matches.value[defIndex] : null
}

// DRAG HANDLERS
function onDragStart(termIndex, e) {
  draggedItem.value = termIndex
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', termIndex)
}

function onDragEnd() {
  draggedItem.value = null
}

function onDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function onDrop(defIndex, e) {
  e.preventDefault()
  let termIndex = draggedItem.value
  
  // Fallback to dataTransfer if draggedItem.value is somehow lost or we're dropping from an external context (unlikely, but safe)
  if (termIndex === null) {
      const data = e.dataTransfer.getData('text/plain')
      if (data !== '') termIndex = Number(data)
  }
  
  if (termIndex === null || termIndex === undefined) return
  
  // Ensure it's a number, because draggedItem or event data might hold it as string
  termIndex = Number(termIndex)
  
  // Remove from old position if exists
  Object.keys(matches.value).forEach(key => {
    if (matches.value[key] === termIndex) {
      delete matches.value[key]
      delete feedback.value[key]
    }
  })
  
  // Place in new position
  matches.value[defIndex] = termIndex
  
  // Check if correct
  const isCorrect = termIndex === defIndex
  feedback.value[defIndex] = isCorrect ? 'correct' : 'incorrect'
  
  attempts.value++
  
  // Check completion
  checkCompletion()
  
  draggedItem.value = null
}

function removeFromZone(defIndex) {
  delete matches.value[defIndex]
  delete feedback.value[defIndex]
}

function checkCompletion() {
  // Complete when all zones filled AND all correct
  const allFilled = Object.keys(matches.value).length === props.pairs.length
  const allCorrect = Object.values(feedback.value).every(f => f === 'correct')
  
  if (allFilled && allCorrect) {
    isComplete.value = true
    emit('complete')
  }
}

const correctCount = computed(() => {
  return Object.values(feedback.value).filter(f => f === 'correct').length
})

const progressPercent = computed(() => {
  return Math.round((correctCount.value / props.pairs.length) * 100)
})

function close() {
  emit('close')
}

// FULLSCREEN & PULSE
const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
        window.removeEventListener('keydown', handleKeydown)
        shouldPulse.value = false
    } else {
        window.addEventListener('keydown', handleKeydown)
        
        nextTick(() => {
            shouldPulse.value = true
            setTimeout(() => { shouldPulse.value = false }, 3000)
        })

        if (props.fullscreen) {
            nextTick(() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => {})
                }
            })
        }
    }
}, { immediate: true })


function handleKeydown(e) {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close')
    }
}

const handleFullscreenChange = () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
        emit('close')
    }
}

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {})
    }
})

// Add listener in onMounted (keeping existing mounted logic)
const originalOnMounted = onMounted
onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    // original onMounted content (resetActivity is already there in the file, but I'll make sure it runs)
    resetActivity()
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>
    <div class="relative bg-white shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none"
         @click.stop>
      
      <!-- Header -->
      <div class="bg-amber-500 px-6 py-5 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg text-white">
            <PhArrowsLeftRight weight="bold" class="text-xl"/>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white m-0">{{ title }}</h3>
            <p class="text-xs text-white/70 m-0">Extra Oefening</p>
          </div>
        </div>
        <button @click="close" 
                class="text-white/70 hover:text-white p-2 rounded-full transition-all relative"
                :class="{ 'ring-pulse-white': shouldPulse }">
          <PhX class="text-2xl" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="h-1 bg-slate-200 shrink-0">
        <div 
          class="h-full bg-emerald-500 transition-all duration-500 ease-out" 
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1">
        
        <!-- Instruction -->
        <p class="text-slate-600 text-center mb-6">{{ instruction }}</p>

        <!-- Completion State -->
        <div v-if="isComplete" class="text-center py-8">
          <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_0.6s_ease-out]">
            <PhTrophy weight="fill" class="text-4xl text-emerald-500"/>
          </div>
          <h4 class="text-2xl font-bold text-slate-900 mb-2">Uitstekend!</h4>
          <p class="text-slate-500 mb-1">Alle {{ pairs.length }} begrippen correct gekoppeld</p>
          <p class="text-slate-400 text-sm">Pogingen: {{ attempts }}</p>
          
          <div class="flex justify-center gap-3 mt-6">
            <button @click="resetActivity" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <PhArrowClockwise weight="bold"/>
              Opnieuw
            </button>
            <button @click="close" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">
              Sluiten
            </button>
          </div>
        </div>

        <!-- Activity Grid -->
        <div v-else class="grid grid-cols-2 gap-6">
          
          <!-- LEFT: Draggable Terms -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Begrippen</h4>
            
            <div 
              v-for="termIndex in shuffledTerms" 
              :key="'term-' + termIndex"
              :draggable="!isTermPlaced(termIndex)"
              @dragstart="onDragStart(termIndex, $event)"
              @dragend="onDragEnd"
              class="p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none"
              :class="[
                isTermPlaced(termIndex) 
                  ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed' 
                  : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md',
                draggedItem === termIndex ? 'opacity-50 scale-95' : ''
              ]"
            >
              <span class="font-semibold text-slate-800">{{ pairs[termIndex].term }}</span>
            </div>
          </div>

          <!-- RIGHT: Drop Zones (Definitions) -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Definities</h4>
            
            <div 
              v-for="(pair, defIndex) in pairs" 
              :key="'def-' + defIndex"
              @dragover="onDragOver"
              @drop="onDrop(defIndex, $event)"
              class="p-4 rounded-xl border-2 border-dashed transition-all min-h-[72px]"
              :class="[
                feedback[defIndex] === 'correct' ? 'bg-emerald-50 border-emerald-300' : '',
                feedback[defIndex] === 'incorrect' ? 'bg-red-50 border-red-300' : '',
                !feedback[defIndex] && getTermInZone(defIndex) === null ? 'bg-slate-50 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50' : '',
                !feedback[defIndex] && getTermInZone(defIndex) !== null ? 'bg-white border-slate-300' : ''
              ]"
            >
              <!-- Definition Label -->
              <p class="text-sm text-slate-500 mb-2">{{ pair.definition }}</p>
              
              <!-- Dropped Term (if any) -->
              <div v-if="getTermInZone(defIndex) !== null" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <PhCheckCircle v-if="feedback[defIndex] === 'correct'" weight="fill" class="text-emerald-500"/>
                  <PhXCircle v-else-if="feedback[defIndex] === 'incorrect'" weight="fill" class="text-red-500"/>
                  <span 
                    class="font-semibold"
                    :class="feedback[defIndex] === 'correct' ? 'text-emerald-700' : feedback[defIndex] === 'incorrect' ? 'text-red-700' : 'text-slate-700'"
                  >
                    {{ pairs[getTermInZone(defIndex)].term }}
                  </span>
                </div>
                <button 
                  @click="removeFromZone(defIndex)" 
                  class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Verwijderen"
                >
                  <PhX class="text-sm"/>
                </button>
              </div>
              
              <!-- Empty State -->
              <div v-else class="text-slate-400 text-sm italic">
                Sleep hier...
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Stats -->
        <div v-if="!isComplete" class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
          <div class="flex items-center gap-4">
            <span class="text-slate-400">
              <PhStar weight="fill" class="inline text-amber-400 mr-1"/>
              {{ correctCount }}/{{ pairs.length }} correct
            </span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-400">Pogingen: {{ attempts }}</span>
          </div>
          <button @click="resetActivity" class="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
            <PhArrowClockwise class="text-sm"/>
            Reset
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-pulse-white {
    animation: ring-pulse-white 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse-white {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(255, 255, 255, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
