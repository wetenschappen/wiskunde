<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhCompass,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Goniometrische Getallen (SOS CAS TOA)'
  },
  instruction: {
    type: String,
    default: 'Klik in de driehoek de twéé zijden aan die samen de gevraagde goniometrische verhouding vormen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Wat is de sinus van hoek α? Selecteer de twee benodigde zijden.',
    targetRatio: 'sin',
    targetAngle: 'alpha',
    correctSides: ['overstaand_alpha', 'schuin'],
    transform: 'scale(1, 1)' // Normal
  },
  {
    goalText: 'Wat is de cosinus van hoek α? Selecteer de twee benodigde zijden.',
    targetRatio: 'cos',
    targetAngle: 'alpha',
    correctSides: ['aanliggend_alpha', 'schuin'],
    transform: 'scale(-1, 1) translate(-200, 0)' // Mirrored horizontally
  },
  {
    goalText: 'Let op! Wat is de tangens van hoek β (bovenaan)? Selecteer de twee benodigde zijden.',
    targetRatio: 'tan',
    targetAngle: 'beta',
    correctSides: ['overstaand_beta', 'aanliggend_beta'],
    transform: 'rotate(180 100 75)' // Upside down
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// User State
const selectedSides = ref([]) // Kan maximaal 2 bevatten (strings: 'overstaand_alpha', 'aanliggend_alpha', 'schuin')
// Omdat overstaand_alpha = aanliggend_beta, definiëren we ze fysiek als:
// zijde 1: verticaal (overstaand_alpha / aanliggend_beta)
// zijde 2: horizontaal (aanliggend_alpha / overstaand_beta)
// zijde 3: schuin (schuin)

const sideMap = {
  'verticaal': {
    alpha: 'overstaand_alpha',
    beta: 'aanliggend_beta'
  },
  'horizontaal': {
    alpha: 'aanliggend_alpha',
    beta: 'overstaand_beta'
  },
  'schuin': {
    alpha: 'schuin',
    beta: 'schuin'
  }
}

function toggleSide(physicalSide) {
  if (isCorrect.value) return;
  const logicalSide = sideMap[physicalSide][currentLevelData.value.targetAngle];
  
  const index = selectedSides.value.indexOf(logicalSide);
  if (index > -1) {
    selectedSides.value.splice(index, 1);
  } else {
    if (selectedSides.value.length < 2) {
      selectedSides.value.push(logicalSide);
    } else {
      // Replace the oldest
      selectedSides.value.shift();
      selectedSides.value.push(logicalSide);
    }
  }
  isChecked.value = false;
}

function isSelected(physicalSide) {
  return selectedSides.value.includes(sideMap[physicalSide][currentLevelData.value.targetAngle]);
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Klik op twee zijden in de driehoek.' };
  selectedSides.value = [];
}

function checkAnswer() {
  isChecked.value = true;
  
  if (selectedSides.value.length < 2) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Je moet exact twee zijden selecteren. Een verhouding bestaat uit een breuk van 2 zijden.' };
    return;
  }

  const target = currentLevelData.value;
  const correct1 = target.correctSides[0];
  const correct2 = target.correctSides[1];

  const hasCorrect1 = selectedSides.value.includes(correct1);
  const hasCorrect2 = selectedSides.value.includes(correct2);

  if (hasCorrect1 && hasCorrect2) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Perfect! Je hebt de ${target.targetRatio} verhouding fysiek correct aangeduid.` 
    }
  } else {
    isCorrect.value = false
    
    // Scaffolding hints
    if (target.targetRatio === 'sin') {
      if (selectedSides.value.includes('aanliggend_' + target.targetAngle)) {
        feedback.value = { type: 'error', text: 'Oeps! Je hebt de aanliggende rechthoekszijde geselecteerd. Voor de sinus (SOS) hebben we de OVERSTAANDE zijde nodig.' }
      } else {
        feedback.value = { type: 'error', text: 'Voor de sinus gebruiken we de regel SOS: Sinus = Overstaand gedeeld door Schuin.' }
      }
    } else if (target.targetRatio === 'cos') {
      if (selectedSides.value.includes('overstaand_' + target.targetAngle)) {
        feedback.value = { type: 'error', text: 'Oeps! Je hebt de overstaande zijde geselecteerd. Voor de cosinus (CAS) hebben we de AANLIGGENDE zijde nodig.' }
      } else {
        feedback.value = { type: 'error', text: 'Voor de cosinus gebruiken we de regel CAS: Cosinus = Aanliggend gedeeld door Schuin.' }
      }
    } else if (target.targetRatio === 'tan') {
      if (selectedSides.value.includes('schuin')) {
        feedback.value = { type: 'error', text: 'Fout! De tangens is de enige verhouding (TOA) die de schuine zijde (hypotenusa) NIET gebruikt.' }
      } else {
        feedback.value = { type: 'error', text: 'Voor de tangens gebruiken we de regel TOA: Tangens = Overstaand gedeeld door Aanliggend.' }
      }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-teal-50 p-5 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <p class="text-sm text-slate-500 font-bold mb-4 uppercase tracking-wider text-center">Geselecteerde Zijden ({{ selectedSides.length }}/2)</p>
              
              <div class="flex gap-2 justify-center">
                 <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold" 
                      :class="selectedSides.length >= 1 ? 'bg-teal-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">
                   1
                 </div>
                 <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold" 
                      :class="selectedSides.length >= 2 ? 'bg-teal-500 text-white' : 'bg-white border-2 border-dashed border-slate-300 text-slate-300'">
                   2
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
              
              <div class="relative w-80 h-64">
                <!-- Transform container for rotation/mirroring based on level -->
                <svg width="100%" height="100%" viewBox="0 0 200 150" class="overflow-visible transition-transform duration-700 ease-in-out" :transform="currentLevelData.transform">
                  
                  <!-- Base triangle fill -->
                  <polygon points="10,140 190,140 190,10" fill="white" stroke="none" />
                  
                  <!-- Right angle marker -->
                  <polyline points="170,140 170,120 190,120" fill="none" stroke="#64748b" stroke-width="2"/>
                  
                  <!-- Angle alpha arc -->
                  <path d="M 40 140 A 30 30 0 0 0 35 122" fill="none" stroke="#3b82f6" stroke-width="4"/>
                  
                  <!-- Angle beta arc (top) -->
                  <path d="M 190 40 A 30 30 0 0 0 172 35" fill="none" stroke="#f43f5e" stroke-width="4"/>
                  
                  <!-- Interactive Sides -->
                  <!-- Horizontaal (bottom) -->
                  <line x1="10" y1="140" x2="190" y2="140" 
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('horizontaal') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('horizontaal')" />
                  
                  <!-- Verticaal (right) -->
                  <line x1="190" y1="140" x2="190" y2="10" 
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('verticaal') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('verticaal')" />

                  <!-- Schuin (hypotenuse) -->
                  <line x1="10" y1="140" x2="190" y2="10" 
                        stroke-width="12" stroke-linecap="round" class="cursor-pointer transition-all duration-200 hover:opacity-80"
                        :stroke="isSelected('schuin') ? '#f59e0b' : '#1e293b'"
                        @click="toggleSide('schuin')" />
                        
                  <!-- Invisible hitboxes to make clicking easier -->
                  <line x1="10" y1="140" x2="190" y2="140" stroke="transparent" stroke-width="24" @click="toggleSide('horizontaal')" class="cursor-pointer" />
                  <line x1="190" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('verticaal')" class="cursor-pointer" />
                  <line x1="10" y1="140" x2="190" y2="10" stroke="transparent" stroke-width="24" @click="toggleSide('schuin')" class="cursor-pointer" />
                </svg>

                <!-- Static labels overlay (absolute positioned so they don't flip upside down with the SVG) -->
                <!-- We hide these text elements inside the SVG so they don't mirror, and instead place them absolutely via CSS -->
                
                <!-- If level 1 (normal) -->
                <div v-if="currentInternalLevel === 0" class="absolute inset-0 pointer-events-none">
                   <div class="absolute bottom-1 left-8 text-blue-600 font-black text-2xl font-serif">α</div>
                   <div class="absolute top-8 right-6 text-rose-500 font-black text-2xl font-serif">β</div>
                </div>

                <!-- If level 2 (mirrored horizontally) -->
                <div v-if="currentInternalLevel === 1" class="absolute inset-0 pointer-events-none">
                   <div class="absolute bottom-1 right-8 text-blue-600 font-black text-2xl font-serif">α</div>
                   <div class="absolute top-8 left-6 text-rose-500 font-black text-2xl font-serif">β</div>
                </div>

                <!-- If level 3 (rotated 180) -->
                <div v-if="currentInternalLevel === 2" class="absolute inset-0 pointer-events-none">
                   <div class="absolute top-1 right-8 text-blue-600 font-black text-2xl font-serif">α</div>
                   <div class="absolute bottom-8 left-6 text-rose-500 font-black text-2xl font-serif">β</div>
                </div>

              </div>

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