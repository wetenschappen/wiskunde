<script setup>
/**
 * TOEVOEGEN AAN EXTERNE CHATBOT PROMPT:
 * "Gebruik dit Vue 3 template als basis voor de nieuwe activiteit."
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRobot } from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  instruction: String,
  fullscreen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'complete'])

// --- STATE ---
const feedback = ref(null)
const isCorrect = ref(false)
const userSelection = ref(null)

// --- LOGIC ---
const shouldPulse = ref(false)

watch(() => props.isOpen, (val) => {
    if (!val) {
        window.removeEventListener('keydown', handleKeydown)
        shouldPulse.value = false
    } else {
        window.addEventListener('keydown', handleKeydown)
        
        // Trigger closing hint pulse with nextTick
        nextTick(() => {
            shouldPulse.value = true
            setTimeout(() => { shouldPulse.value = false }, 3000)
        })

        if (props.fullscreen) {
            nextTick(() => {
                if (!document.fullscreenElement) {
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

onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (document.fullscreenElement) {
    }
})

function checkAnswer() {
  if (!userSelection.value) {
    feedback.value = { type: 'error', text: 'Maak eerst een keuze!' }
    return
  }
  
  // VOORBEELD LOGICA
  isCorrect.value = true
  feedback.value = { 
    type: 'success', 
    text: 'Perfect uitgelegd! Je hebt het concept begrepen.' 
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-0">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <div class="relative bg-slate-100 shadow-2xl overflow-hidden flex flex-col w-screen h-screen rounded-none">
      <!-- HEADER -->
      <div class="p-4 border-b bg-white flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="bg-amber-100 p-2 rounded-xl">
            <PhRobot weight="fill" class="text-amber-600 text-xl" />
          </div>
          <h2 class="text-xl font-extrabold text-slate-800 tracking-tight">{{ title }}</h2>
        </div>
        <button @click="emit('close')" 
                class="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all relative"
                :class="{ 'ring-pulse-red': shouldPulse }">
          <PhX class="text-xl font-bold" />
        </button>
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <!-- 📄 Instructie -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <p class="text-slate-600 leading-relaxed font-medium" v-html="instruction"></p>
        </div>

        <!-- 🧪 Interactieve Sectie (HIER KOMT DE MAGIE) -->
        <div class="min-h-[300px] flex items-center justify-center bg-white rounded-[2rem] border-4 border-slate-200 shadow-inner relative overflow-hidden">
           <p class="text-slate-400 italic">Hier komt de visualisatie (SVG of interactieve grid)...</p>
        </div>
      </div>

      <!-- FOOTER: FEEDBACK & ACTIE -->
      <div class="p-6 border-t bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div v-if="feedback" 
             class="mb-4 p-4 rounded-2xl flex items-start gap-4 animate-fadeIn border"
             :class="feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'">
           <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="text-2xl shrink-0 mt-0.5" weight="fill" />
           <p class="font-bold text-sm md:text-base leading-snug">{{ feedback.text }}</p>
        </div>

        <div class="flex gap-4">
          <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-4 rounded-2xl shadow-lg transition-all active:scale-95">
            Controleer Antwoord
          </button>
          <button v-else @click="emit('complete')" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
            Volgende Stap <PhArrowRight weight="bold" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ring-pulse-red {
    animation: ring-pulse 0.8s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}

@keyframes ring-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 1);
        background-color: rgba(239, 68, 68, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0.8);
        background-color: rgba(239, 68, 68, 0.6);
        transform: scale(1.1);
    }
    100% {
        box-shadow: 0 0 0 40px rgba(239, 68, 68, 0);
        background-color: transparent;
        transform: scale(1);
    }
}
</style>
