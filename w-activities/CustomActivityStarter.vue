<script setup>
/**
 * Gold Standard Educational Activity Template (Vue 3, Composition API, TailwindCSS)
 * Version: 1.0
 * * Dit is de basis voor alle nieuwe, interactieve leeractiviteiten.
 * Het is ontworpen voor maximale duidelijkheid, onderhoudbaarheid en eenvoudige aanpassing door AI-agenten.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhStar, // Standaard icoon, kan worden overschreven door props
  PhArrowClockwise 
} from '@phosphor-icons/vue'

// --- Props & Emits ---
const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Interactieve Activiteit' // TODO AI: Provide a specific title
  },
  instruction: {
    type: String,
    default: 'Volg de instructies op het scherm om de activiteit te voltooien.' // TODO AI: Provide a clear, concise instruction
  },
  // TODO AI: For multi-step activities, manage currentStep and totalSteps from the parent lesson
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhStar } // Allow overriding the header icon
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])


// --- 1. UI STATE ---
// Handles the visual state of the component, not the activity logic itself.
const shouldPulse = ref(false) // For hinting the close button


// --- 2. ACTIVITY STATE ---
// Core state for the educational logic: feedback, correctness, user input.
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' }) // { type: 'success'|'error'|'info', text: '...' }
// TODO AI: Add refs for user input, e.g., `const userSelection = ref(null)`

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: '' };
    // TODO AI: Reset any user input refs here, e.g., `userSelection.value = null`
}


// --- 3. DOMAIN LOGIC (TODO: Inject specific math/physics here) ---
// This is where the unique logic for the activity lives.

function checkAnswer() {
  isChecked.value = true;
  // TODO AI: Implement specific win-condition logic here.
  // This is a placeholder example.
  // 1. Get user input from your refs.
  // 2. Compare it to the correct answer.
  // 3. Set `isCorrect.value`.
  // 4. Provide meaningful feedback.

  // Example Logic:
  if (true) { // Replace `true` with your win condition, e.g., `userSelection.value === correctAnswer`
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Uitstekend! Je hebt de juiste analyse gemaakt. Ga door naar de volgende stap.' 
    }
    // Optionally emit complete right away if it's a single-check activity
    // emit('complete');
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Nog niet helemaal. Probeer het opnieuw. Tip: let op de eenheden.'
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete'); // Emit complete on the last step
    }
}


// --- Lifecycle & Event Handlers ---

// MOVED THE WATCHER DOWN HERE: safely below resetActivityState and state variables
watch(() => props.isOpen, (val) => {
  if (val) {
    // Reset activity state when opening
    resetActivityState();
    
    // Set up fullscreen and keyboard listeners
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen request failed:", e))
        }
      })
    }
    
    // Hint to the user how to close
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    // Cleanup when closing
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

const handleFullscreenChange = () => {
  // Auto-close if the user exits fullscreen manually
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  // Ensure fullscreen is exited on component unmount
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(e => {})
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
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border-t border-slate-200">
              <p class="text-xs text-center text-slate-400">Plaats hier extra bedieningselementen.</p>
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
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="p-4 mb-4 bg-white rounded-lg shadow-sm md:hidden shrink-0">
                <h3 class="mb-1 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
                <div class="prose prose-sm text-slate-600" v-html="instruction"></div>
            </div>
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid">
              <p class="text-sm italic text-slate-400">Interactief Gebied</p>
            </div>

            <div class="mt-6 md:hidden shrink-0">
               <div v-if="feedback.text" class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                 <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
                 <span>{{ feedback.text }}</span>
               </div>
               <div class="flex items-center gap-3">
                 <button @click="resetActivityState" class="p-3 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200"><PhArrowClockwise /></button>
                 <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white rounded-lg bg-slate-800 disabled:opacity-50">Controleer</button>
                 <button v-else @click="goToNextStep" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600">Volgende</button>
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

.shadow-top {
  box-shadow: 0 -4px 15px -5px rgba(0, 0, 0, 0.07);
}
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

/* Basic prose styles for instructions if not using Tailwind Typography plugin */
.prose p { margin-bottom: 1em; }
.prose code { 
    background-color: #f1f5f9; 
    padding: 0.2em 0.4em; 
    border-radius: 4px; 
    font-size: 0.9em;
    font-weight: 600;
}
</style>