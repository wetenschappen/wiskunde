<script setup>
/**
 * STARTER ACTIVITY TEMPLATE
 * -------------------------
 * This is a premium, dual-pane activity template featuring:
 * - Immersive fullscreen mode
 * - Step-by-step logic with persistence
 * - Integrated KaTeX math rendering
 * - High-fidelity SVG simulation pane
 * - Responsive design (mobile stack, desktop split)
 */
import { computed, ref, watch, onMounted } from 'vue'
import { useActivityModal } from '../../composables/useActivityModal'
import { renderMath } from '../../composables/useMathRenderer'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, 
  PhFlask, PhWaveSine, PhEye, PhTextColumns, 
  PhCube, PhCheck, PhCornersOut, PhInfo
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Template Activiteit' },
  fullscreen: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'complete'])

// -- STATE MANAGEMENT --
const step = ref(0)
const selectedOption = ref('')
const feedback = ref('')
const feedbackType = ref('')
const finished = ref(false)

// -- MODAL & PERSISTENCE --
const { modalRoot, saveProgress, loadProgress } = useActivityModal(props, emit)
const titleId = `activity-title-${Math.random().toString(36).slice(2)}`
const STORAGE_KEY = `ActivityTemplate-${props.title}`

onMounted(() => {
    const persisted = loadProgress(STORAGE_KEY)
    if (persisted) {
      step.value = persisted.step ?? step.value
      selectedOption.value = persisted.selectedOption ?? selectedOption.value
      finished.value = persisted.finished ?? finished.value
    }
})

watch([step, selectedOption, finished], () => {
  saveProgress(STORAGE_KEY, {
    step: step.value,
    selectedOption: selectedOption.value,
    finished: finished.value
  })
}, { deep: true })

// -- NAVIGATION --
const steps = [
  { label: 'Ontdek', icon: PhEye },
  { label: 'Analyse', icon: PhTextColumns },
  { label: 'Resultaat', icon: PhCheck }
]

function checkStep() {
  // Logic for step validation goes here
  if (step.value < steps.length - 1) {
    feedbackType.value = 'success'
    feedback.value = 'Goed gedaan! Je kunt nu doorgaan naar de volgende stap.'
    setTimeout(() => { 
        step.value++ 
        feedback.value = ''
    }, 1500)
  } else {
    finished.value = true
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function close() { emit('close') }
function complete() { emit('complete') }
</script>

<template>
  <div v-if="isOpen" ref="modalRoot" class="fixed inset-0 z-50 flex items-center justify-center font-sans" role="dialog" aria-modal="true" :aria-labelledby="titleId">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Main Activity Container -->
    <div class="relative w-screen h-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row shadow-2xl">
      
      <!-- LEFT PANE: Interaction -->
      <div class="flex-1 flex flex-col min-w-0 bg-white shadow-xl relative z-10 border-r border-slate-200">
        
        <!-- Header -->
        <div class="bg-slate-900 text-white px-8 py-5 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <PhFlask class="text-2xl text-white" weight="bold" />
            </div>
            <div>
              <h3 :id="titleId" class="font-bold text-lg leading-tight">{{ title }}</h3>
              <p class="text-xs text-slate-400 font-medium tracking-wide">Premium Activity Template</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
             <button class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold" title="Toggle Volledig Scherm" @click="toggleFullscreen">
               <PhCornersOut class="text-xl" weight="bold" />
               <span class="hidden sm:inline uppercase tracking-widest text-[10px]">Fullscreen</span>
             </button>
             <button class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors" @click="close">
               <PhX class="text-xl" weight="bold" />
             </button>
          </div>
        </div>

        <!-- Stepper Navigation -->
        <div class="px-8 py-6 bg-slate-50 border-b border-slate-100 shrink-0">
          <div class="flex items-center justify-between max-w-md mx-auto relative">
            <template v-for="(s, idx) in steps" :key="idx">
              <div class="flex flex-col items-center gap-2 group relative z-10 flex-1">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2"
                  :class="idx === step ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/30' : idx < step ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 text-slate-400'"
                >
                  <component :is="idx < step ? PhCheck : s.icon" :weight="idx <= step ? 'bold' : 'regular'" class="text-lg text-white" />
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest transition-colors" :class="idx === step ? 'text-indigo-600' : idx < step ? 'text-emerald-600' : 'text-slate-400'">
                  {{ s.label }}
                </span>
                <!-- Connector Line -->
                <div v-if="idx < steps.length - 1" class="absolute left-[50%] top-5 w-full h-0.5 bg-slate-200 -z-10">
                   <div class="h-full bg-emerald-500 transition-all duration-700" :style="{ width: idx < step ? '100%' : '0%' }"></div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Scrollable content Area -->
        <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <Transition name="fade-slide" mode="out-in">
            <div :key="step" class="max-w-xl mx-auto space-y-8">
              
              <!-- Content Header -->
              <div class="space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  <PhInfo weight="bold" />
                  Stap {{ step + 1 }}: {{ steps[step].label }}
                </div>
                <h4 class="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  Titel van de stap
                </h4>
                <p class="text-lg text-slate-600 leading-relaxed font-medium">
                  Hier komt de instructie of vraag voor de student. Je kunt <span class="font-bold text-indigo-600">belangrijke woorden</span> benadrukken.
                  Vormules kunnen ook hier: <span v-html="renderMath('\\( E = m \\cdot c^2 \\)')"></span>.
                </p>
              </div>

              <!-- Interactive Options -->
              <div class="grid grid-cols-1 gap-4 pt-4">
                <button 
                  v-for="(opt, key) in { 'opt1': 'Eerste optie met uitleg', 'opt2': 'Tweede optie met uitleg' }"
                  :key="key"
                  @click="selectedOption = key"
                  class="group p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-[0.98]"
                  :class="selectedOption === key ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 bg-white'"
                >
                  <div class="flex items-center gap-5 relative z-10">
                    <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-white" :class="selectedOption === key ? 'border-indigo-600 scale-110' : 'border-slate-300'">
                      <div v-if="selectedOption === key" class="w-3 h-3 rounded-full bg-indigo-600"></div>
                    </div>
                    <span class="font-bold text-lg text-slate-800 tracking-tight transition-colors" :class="selectedOption === key ? 'text-indigo-900' : ''">
                      {{ opt }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Feedback Message -->
              <Transition name="fade-bounce">
                <div v-if="feedback" class="p-6 rounded-2xl border-2 flex items-start gap-5" 
                  :class="feedbackType === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="feedbackType === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'">
                    <component :is="feedbackType === 'success' ? PhCheckCircle : PhWarningCircle" class="text-2xl text-white" weight="fill" />
                  </div>
                  <div class="pt-1">
                    <p class="font-black text-[10px] uppercase tracking-widest mb-1 opacity-60">{{ feedbackType === 'success' ? 'Goed gedaan' : 'Let op' }}</p>
                    <p class="font-bold text-xl leading-tight">{{ feedback }}</p>
                  </div>
                </div>
              </Transition>
            </div>
          </Transition>
        </div>

        <!-- Footer Actions -->
        <div class="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3 text-slate-400">
            <PhWaveSine weight="bold" class="text-xl" />
            <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Module Template</span>
          </div>
          <div class="flex items-center gap-4">
            <button v-if="!finished" 
              class="group px-10 py-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-30 disabled:pointer-events-none"
              :disabled="!selectedOption"
              @click="checkStep"
            >
              <span>Volgende Stap</span>
              <PhArrowRight class="text-xl group-hover:translate-x-1 transition-transform" weight="bold" />
            </button>
            <button v-else 
              class="px-12 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl transition-all transform active:scale-95 shadow-xl shadow-emerald-500/20" 
              @click="complete"
            >
              Activiteit Afronden
            </button>
          </div>
        </div>

      </div>

      <!-- RIGHT PANE: Visual Simulation (SVG) -->
      <div class="hidden md:flex w-[42%] bg-slate-950 flex-col overflow-hidden relative shadow-inner">
        <!-- Background Gradients -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-black z-0"></div>
        <div class="absolute inset-0 opacity-30 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.3),transparent_70%)]"></div>
        
        <div class="relative z-10 h-full flex flex-col p-10 font-sans">
          <!-- Simulation Header -->
          <div class="flex items-center justify-between mb-10">
            <div class="flex flex-col">
              <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-indigo-300 text-[10px] font-black tracking-[0.2em] uppercase mb-1">Visualisatie</span>
              <span class="text-white/40 text-[10px] font-bold uppercase tracking-widest">Real-time model</span>
            </div>
            <div class="flex gap-2">
               <div v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full transition-all duration-500" :class="step >= i-1 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'"></div>
            </div>
          </div>

          <!-- Main SVG Simulation Space -->
          <div class="flex-1 flex items-center justify-center relative">
            <svg viewBox="0 0 400 500" class="w-full h-full max-h-[500px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <defs>
                 <linearGradient id="mainGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
                 </linearGradient>
                 <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                 </linearGradient>
                 <filter id="glow">
                   <feGaussianBlur stdDeviation="3" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
                 <marker id="arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
                 </marker>
               </defs>

               <!-- Main Grid Structure -->
               <g class="opacity-20">
                  <line v-for="i in 10" :key="i" :x1="i*40" y1="0" :x2="i*40" y2="500" stroke="white" stroke-width="0.5" stroke-dasharray="2,5" />
                  <line v-for="i in 12" :key="i" x1="0" :y1="i*40" x2="400" :y2="i*40" stroke="white" stroke-width="0.5" stroke-dasharray="2,5" />
               </g>
               
               <!-- CENTRAL OBJECT -->
               <g transform="translate(200, 250)" class="transition-all duration-1000 ease-in-out">
                  <!-- The 'Glass' Body -->
                  <rect x="-80" y="-80" width="160" height="160" rx="20" fill="url(#mainGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
                  
                  <!-- Internal Glow (reactive to step) -->
                  <circle r="40" fill="url(#glowGrad)" class="transition-all duration-1000" :style="{ transform: `scale(${1 + step * 0.5})` }" />

                  <!-- Icon Component -->
                  <g class="transition-all duration-1000" :style="{ opacity: step >= 1 ? 1 : 0.3 }">
                     <PhCube :size="48" x="-24" y="-24" class="text-white/70" weight="bold" />
                  </g>
                  
                  <!-- Vector Example -->
                  <g v-if="selectedOption" class="animate-pulse">
                     <line x1="0" y1="0" x2="0" y2="-120" stroke="#4ade80" stroke-width="4" marker-end="url(#arrow)" />
                     <text x="15" y="-100" class="fill-emerald-400 font-bold text-lg select-none">Vector</text>
                  </g>
               </g>

               <!-- Animated Particles -->
               <g v-for="i in 15" :key="i" class="animate-ping opacity-20" :style="{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }">
                  <circle :cx="Math.random() * 400" :cy="Math.random() * 500" r="1" fill="white" />
               </g>
            </svg>
          </div>

          <!-- Live Telemetry Card -->
          <div class="mt-8 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-3xl">
            <h5 class="text-indigo-300 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
               <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
               Telemetrie Observatie
            </h5>
            <div class="space-y-5">
              <div v-for="(v, k) in { 'Huidige Status': 'Actief', 'Logic Engine': 'V8', 'Simulatie': 'Live' }" :key="k" class="flex items-center justify-between border-b border-white/5 pb-3">
                <span class="text-white/30 text-[10px] font-black uppercase tracking-widest">{{ k }}</span>
                <span class="text-indigo-100 font-mono text-xs font-bold">{{ v }}</span>
              </div>
              <div class="pt-2 flex items-center justify-between">
                <span class="text-white/80 text-[10px] font-black uppercase tracking-widest">Resulterende Kracht</span>
                <div class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-black text-xs">
                   BEREKEND
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }

/* Transition: Fade + Slide Up */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }

/* Transition: Bounce for Feedback */
.fade-bounce-enter-active {
  animation: bounce-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-bounce-leave-active {
  animation: bounce-in 0.4s reverse;
}
@keyframes bounce-in {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Button Focus & Active States */
button:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 4px;
}

/* Prevent text selection during interaction */
.select-none { user-select: none; }
</style>
