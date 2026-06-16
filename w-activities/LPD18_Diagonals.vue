<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhVectorPattern, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Diagonalen-Machine' },
  instruction: { 
    type: String, 
    default: 'De vorm van een vierhoek wordt volledig bepaald door zijn diagonalen (de kruisende lijnen binnenin).<br/><br/><strong>Opdracht:</strong> Stel de diagonalen-machine zo in dat de blauwe vorm klopt met de gevraagde figuur. Let goed op de hints!' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhVectorPattern }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Zet de schakelaars aan of uit om de diagonalen te veranderen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    targetShape: 'Rechthoek',
    goalText: 'Opdracht 1: Maak een pure RECHTHOEK (die geen vierkant is).',
    rules: { perp: false, bisect: true, equal: true },
    hintSuccess: 'Prachtig! Bij een rechthoek zijn de diagonalen even lang en delen ze elkaar middendoor, maar ze staan NIET loodrecht op elkaar.'
  },
  {
    targetShape: 'Ruit',
    goalText: 'Opdracht 2: Maak een pure RUIT (die geen vierkant is).',
    rules: { perp: true, bisect: true, equal: false },
    hintSuccess: 'Super! Een ruit herken je aan diagonalen die loodrecht (90°) op elkaar staan én elkaar perfect middendoor delen.'
  },
  {
    targetShape: 'Vierkant',
    goalText: 'Opdracht 3: Maak een VIERKANT.',
    rules: { perp: true, bisect: true, equal: true },
    hintSuccess: 'Inderdaad! Het vierkant is de "koning" van de vierhoeken: de diagonalen staan loodrecht, delen middendoor én zijn even lang.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const isPerpendicular = ref(false) // Loodrecht op elkaar (90 deg intersection)
const isBisecting = ref(false)     // Delen ze elkaar middendoor? (cross at exact center)
const isEqualLength = ref(false)   // Zijn ze even lang?

// The shape logic
const currentShape = computed(() => {
    if (isPerpendicular.value && isBisecting.value && isEqualLength.value) return 'Vierkant'
    if (isPerpendicular.value && isBisecting.value && !isEqualLength.value) return 'Ruit'
    if (!isPerpendicular.value && isBisecting.value && isEqualLength.value) return 'Rechthoek'
    if (!isPerpendicular.value && isBisecting.value && !isEqualLength.value) return 'Parallellogram'
    if (isPerpendicular.value && !isBisecting.value && !isEqualLength.value) return 'Vlieger'
    return 'Willekeurige Vierhoek'
})

// Visual math calculations
// Center is (250, 200)
// Diag 1 (Horizontalish): length depends on isEqualLength.
// Diag 2 (Verticalish): 
const p1 = computed(() => {
    const len = 200;
    const offset = isBisecting.value ? len/2 : len/3;
    return { x: 250 - offset, y: 200 }
})
const p2 = computed(() => {
    const len = 200;
    const offset = isBisecting.value ? len/2 : (len - len/3);
    return { x: 250 + offset, y: 200 }
})
const p3 = computed(() => {
    const len = isEqualLength.value ? 200 : 300;
    const offset = isBisecting.value ? len/2 : len/4;
    const shear = isPerpendicular.value ? 0 : 50;
    return { x: 250 + shear, y: 200 - offset }
})
const p4 = computed(() => {
    const len = isEqualLength.value ? 200 : 300;
    const offset = isBisecting.value ? len/2 : (len - len/4);
    const shear = isPerpendicular.value ? 0 : -50; 
    return { x: 250 + shear, y: 200 + offset }
})

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Zet de schakelaars aan of uit om de diagonalen te veranderen.' };
    isPerpendicular.value = false;
    isBisecting.value = false;
    isEqualLength.value = false;
}

function checkAnswer() {
  isChecked.value = true;
  
  const target = currentLevelData.value.targetShape;
  
  if (currentShape.value === target) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: currentLevelData.value.hintSuccess }
  } else {
    isCorrect.value = false
    
    // Provide specific scaffolding based on the difference between currentShape and targetShape
    if (currentShape.value === 'Vierkant') {
        feedback.value = { type: 'error', text: `Dit is een vierkant. Dat is inderdaad een speciale soort ${target}, maar je moet de PURE vorm maken. Welke eigenschap is te streng?`}
    } else if (currentShape.value === 'Rechthoek' && target === 'Ruit') {
        feedback.value = { type: 'error', text: 'Dit is een rechthoek. In een ruit moeten de diagonalen loodrecht op elkaar staan.'}
    } else if (currentShape.value === 'Ruit' && target === 'Rechthoek') {
        feedback.value = { type: 'error', text: 'Dit is een ruit. In een rechthoek hoeven de diagonalen niet loodrecht te staan, maar ze moeten wél even lang zijn.'}
    } else if (currentShape.value === 'Parallellogram') {
        if (target === 'Ruit') feedback.value = { type: 'error', text: 'Dit is een parallellogram. Voor een ruit moeten de diagonalen loodrecht staan.'}
        if (target === 'Rechthoek') feedback.value = { type: 'error', text: 'Dit is een parallellogram. Voor een rechthoek moeten de diagonalen even lang zijn.'}
        if (target === 'Vierkant') feedback.value = { type: 'error', text: 'Dit is een parallellogram. Voor een vierkant kom je nog veel eisen te kort!'}
    } else if (currentShape.value === 'Vlieger') {
        feedback.value = { type: 'error', text: 'Dit is een vlieger. De diagonalen moeten ELKAAR middendoor delen (bij een vlieger gebeurt dat maar eenzijdig).'}
    } else {
        feedback.value = { type: 'error', text: `Dit is een ${currentShape.value}. Probeer een combinatie te vinden die exact een ${target} oplevert.`}
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-pink-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-pink-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
            <div class="text-center bg-pink-50 p-4 border border-pink-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-pink-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-4">Diagonalen-Instellingen</h4>
               
               <div class="flex flex-col gap-4">
                   <!-- Toggle 1 -->
                   <label class="flex items-center justify-between cursor-pointer group">
                       <span class="font-bold text-sm text-slate-700 group-hover:text-pink-600 transition-colors">Staan loodrecht op elkaar?</span>
                       <div class="relative">
                           <input type="checkbox" v-model="isPerpendicular" :disabled="isCorrect" class="sr-only" />
                           <div class="block bg-slate-300 w-12 h-7 rounded-full transition-colors" :class="isPerpendicular ? '!bg-pink-500' : ''"></div>
                           <div class="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform" :class="isPerpendicular ? 'transform translate-x-5' : ''"></div>
                       </div>
                   </label>
                   
                   <!-- Toggle 2 -->
                   <label class="flex items-center justify-between cursor-pointer group">
                       <span class="font-bold text-sm text-slate-700 group-hover:text-pink-600 transition-colors">Delen elkaar middendoor?</span>
                       <div class="relative">
                           <input type="checkbox" v-model="isBisecting" :disabled="isCorrect" class="sr-only" />
                           <div class="block bg-slate-300 w-12 h-7 rounded-full transition-colors" :class="isBisecting ? '!bg-pink-500' : ''"></div>
                           <div class="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform" :class="isBisecting ? 'transform translate-x-5' : ''"></div>
                       </div>
                   </label>

                   <!-- Toggle 3 -->
                   <label class="flex items-center justify-between cursor-pointer group">
                       <span class="font-bold text-sm text-slate-700 group-hover:text-pink-600 transition-colors">Zijn even lang?</span>
                       <div class="relative">
                           <input type="checkbox" v-model="isEqualLength" :disabled="isCorrect" class="sr-only" />
                           <div class="block bg-slate-300 w-12 h-7 rounded-full transition-colors" :class="isEqualLength ? '!bg-pink-500' : ''"></div>
                           <div class="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform" :class="isEqualLength ? 'transform translate-x-5' : ''"></div>
                       </div>
                   </label>
               </div>
            </div>

            <!-- Current Shape Label -->
            <div class="mt-6 p-4 rounded-xl border-2 transition-colors" :class="isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'">
                <span class="text-xs font-bold uppercase tracking-widest block mb-1 opacity-50">Huidige Vorm:</span>
                <span class="font-black text-xl">{{ currentShape }}</span>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Vorm</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="relative bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-300 p-4">
                  
                  <svg width="500" height="400" viewBox="0 0 500 400" class="block">
                      
                      <!-- The Outer Quadrilateral -->
                      <polygon :points="`${p1.x},${p1.y} ${p3.x},${p3.y} ${p2.x},${p2.y} ${p4.x},${p4.y}`" 
                               fill="rgba(236, 72, 153, 0.15)" stroke="#ec4899" stroke-width="4" stroke-linejoin="round" class="transition-all duration-700 ease-out" />
                      
                      <!-- Diagonals -->
                      <line :x1="p1.x" :y1="p1.y" :x2="p2.x" :y2="p2.y" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4" class="transition-all duration-700 ease-out" />
                      <line :x1="p3.x" :y1="p3.y" :x2="p4.x" :y2="p4.y" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4" class="transition-all duration-700 ease-out" />
                      
                      <!-- Vertices (Nodes) -->
                      <circle :cx="p1.x" :cy="p1.y" r="6" fill="#334155" class="transition-all duration-700 ease-out" />
                      <circle :cx="p2.x" :cy="p2.y" r="6" fill="#334155" class="transition-all duration-700 ease-out" />
                      <circle :cx="p3.x" :cy="p3.y" r="6" fill="#334155" class="transition-all duration-700 ease-out" />
                      <circle :cx="p4.x" :cy="p4.y" r="6" fill="#334155" class="transition-all duration-700 ease-out" />

                      <!-- Intersection Point -->
                      <circle cx="250" cy="200" r="4" fill="#ef4444" class="transition-all duration-700 ease-out" />
                      
                      <!-- Perpendicular Indicator (Right Angle symbol) -->
                      <!-- Only show if perpendicular is true AND bisecting is true (otherwise it looks weird if not centered, we keep it simple here) -->
                      <path v-if="isPerpendicular" d="M 250 185 L 265 185 L 265 200" fill="none" stroke="#ef4444" stroke-width="2" class="animate-fadeIn transition-all duration-700 ease-out" />

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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>