<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhSwap,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Verwante Hoeken'
  },
  instruction: {
    type: String,
    default: 'Draai hoek B naar de juiste positie op de eenheidscirkel om de symmetrie met hoek α te ontdekken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSwap }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const baseAngle = 40 // Constant base angle alpha for all levels

const levels = [
  {
    name: 'Tegengestelde Hoek (-α)',
    goalText: 'Opdracht 1: Draai hoek B naar de tegengestelde hoek (-α).',
    targetAngle: 360 - baseAngle, // -40
    validate: (a) => a === 360 - baseAngle,
    successText: 'Correct! Zoals je ziet blijven de x-waarden (cosinus) gelijk, maar draait de y-waarde (sinus) om van teken!',
    hint: 'De tegengestelde hoek klapt de driehoek omlaag over de x-as.'
  },
  {
    name: 'Supplementaire Hoek (180° - α)',
    goalText: 'Opdracht 2: Draai hoek B naar de supplementaire hoek (180° - α).',
    targetAngle: 180 - baseAngle,
    validate: (a) => a === 180 - baseAngle,
    successText: 'Juist! Nu zie je dat de y-waarden (sinus) perfect gelijk zijn, maar de x-waarde (cosinus) van teken is gewisseld.',
    hint: 'Supplementair betekent dat ze samen 180° zijn. Klap de hoek over de y-as naar het tweede kwadrant.'
  },
  {
    name: 'Anti-Supplementaire Hoek (180° + α)',
    goalText: 'Opdracht 3: Draai hoek B naar (180° + α).',
    targetAngle: 180 + baseAngle,
    validate: (a) => a === 180 + baseAngle,
    successText: 'Perfect! Zowel de sinus als cosinus zijn nu omgewisseld van teken vergeleken met hoek α.',
    hint: 'Tel een halve cirkel (180°) op bij de basishoek α. Waar kom je dan uit?'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Interactive State for Angle B
const userAngle = ref(0)

const alphaRad = computed(() => baseAngle * (Math.PI / 180))
const betaRad = computed(() => userAngle.value * (Math.PI / 180))

const cosAlpha = computed(() => Math.cos(alphaRad.value))
const sinAlpha = computed(() => Math.sin(alphaRad.value))

const cosBeta = computed(() => Math.cos(betaRad.value))
const sinBeta = computed(() => Math.sin(betaRad.value))

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Pas de slider aan om de juiste verwante hoek te vinden.' };
  userAngle.value = 0; // Start at 0 to force interaction
}

function checkAnswer() {
  isChecked.value = true;
  
  if (currentLevelData.value.validate(userAngle.value)) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: currentLevelData.value.successText 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: `Niet helemaal. ${currentLevelData.value.hint}`
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-indigo-50 p-5 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800 text-lg">{{ currentLevelData.name }}</p>
              <p class="text-sm text-indigo-600 mt-2">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner space-y-6">
              
              <!-- Alpha reference -->
              <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span class="font-bold text-slate-600">Referentie hoek α</span>
                <span class="font-mono font-bold text-blue-600">{{ baseAngle }}°</span>
              </div>

              <!-- Interactive Beta slider -->
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verwante hoek B: <span class="text-rose-600 font-mono text-lg">{{ userAngle }}°</span></label>
                <input type="range" v-model.number="userAngle" min="0" max="360" step="5" class="w-full accent-rose-600">
              </div>

              <!-- Live Comparison -->
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(α)</div>
                   <div class="font-mono text-sm text-blue-600">{{ sinAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">sin(B)</div>
                   <div class="font-mono text-sm text-rose-600">{{ sinBeta.toFixed(2) }}</div>
                 </div>

                 <div class="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(α)</div>
                   <div class="font-mono text-sm text-blue-600">{{ cosAlpha.toFixed(2) }}</div>
                   <div class="h-px w-full bg-slate-200 my-2"></div>
                   <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">cos(B)</div>
                   <div class="font-mono text-sm text-rose-600">{{ cosBeta.toFixed(2) }}</div>
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
              
              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white rounded-full shadow-inner border-4 border-slate-200 z-10">
                
                <!-- Inner grid subtle -->
                <g stroke="#f1f5f9" stroke-width="1">
                  <line v-for="i in 11" :key="'v'+i" :x1="(i-6)*20" y1="-100" :x2="(i-6)*20" y2="100" />
                  <line v-for="i in 11" :key="'h'+i" x1="-100" :y1="(i-6)*20" x2="100" :y2="(i-6)*20" />
                </g>

                <!-- Axes -->
                <line x1="-130" y1="0" x2="130" y2="0" stroke="#94a3b8" stroke-width="2" />
                <line x1="0" y1="-130" x2="0" y2="130" stroke="#94a3b8" stroke-width="2" />
                
                <!-- Circle R=100 -->
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />

                <!-- ALPHA (Reference angle, fixed) -->
                <g opacity="0.4">
                   <!-- Radius -->
                   <line x1="0" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="3" />
                   <!-- Projection lines -->
                   <line :x1="100 * cosAlpha" y1="0" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="2" stroke-dasharray="2,2" />
                   <line x1="0" :y1="-100 * sinAlpha" :x2="100 * cosAlpha" :y2="-100 * sinAlpha" stroke="#3b82f6" stroke-width="2" stroke-dasharray="2,2" />
                   <!-- Point -->
                   <circle :cx="100 * cosAlpha" :cy="-100 * sinAlpha" r="5" fill="#3b82f6" />
                   <text :x="100 * cosAlpha + 10" :y="-100 * sinAlpha - 10" font-weight="bold" fill="#3b82f6">α</text>
                </g>

                <!-- BETA (User angle, interactive) -->
                <g class="transition-all duration-100">
                   <!-- Radius -->
                   <line x1="0" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="4" stroke-linecap="round" />
                   <!-- Projection lines -->
                   <line :x1="100 * cosBeta" y1="0" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,4" />
                   <line x1="0" :y1="-100 * sinBeta" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,4" />
                   <!-- Point -->
                   <circle :cx="100 * cosBeta" :cy="-100 * sinBeta" r="8" fill="#f43f5e" stroke="white" stroke-width="2" class="shadow-sm" />
                   <text :x="100 * cosBeta + 12" :y="-100 * sinBeta - 12" font-weight="bold" fill="#f43f5e">B</text>
                </g>
                
                <!-- Highlight Visual Alignment if Correct -->
                <g v-if="isCorrect" class="animate-fadeIn">
                   <!-- Draw a thick connecting line to show the symmetry! -->
                   <line v-if="currentInternalLevel === 0" :x1="100 * cosAlpha" :y1="-100 * sinAlpha" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" />
                   <line v-if="currentInternalLevel === 1" :x1="100 * cosAlpha" :y1="-100 * sinAlpha" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" />
                   <line v-if="currentInternalLevel === 2" :x1="100 * cosAlpha" :y1="-100 * sinAlpha" :x2="100 * cosBeta" :y2="-100 * sinBeta" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,6" />
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