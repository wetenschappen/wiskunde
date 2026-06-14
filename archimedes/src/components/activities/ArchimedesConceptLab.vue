<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useActivityModal } from '../../composables/useActivityModal'
import { renderMath } from '../../composables/useMathRenderer'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, 
  PhFlask, PhWaveSine, PhEye, PhTextColumns, 
  PhCube, PhArrowDown, PhArrowUp, PhCheck, PhCornersOut,
  PhArrowsCounterClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Conceptlab Archimedeskracht' },
  fullscreen: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'complete'])

const step = ref(0)
const prediction = ref('')
const blanks = ref({ factor1: '', factor2: '', factor3: '' })
const scenario = ref('')
const feedback = ref('')
const feedbackType = ref('')
const finished = ref(false)
const showSimulation = ref(true)

const { shouldPulse, modalRoot, saveProgress, loadProgress } = useActivityModal(props, emit)
const titleId = `activity-title-${Math.random().toString(36).slice(2)}`

const steps = [
  { label: 'Intro', icon: PhEye },
  { label: 'Formule', icon: PhTextColumns },
  { label: 'Pas toe', icon: PhCheck }
]

const scenarioText = computed(() => {
  return 'Twee blokjes hebben hetzelfde ondergedompelde volume in water. Blok A is kurk, blok B is lood.'
})

function resetFeedback() {
  feedback.value = ''
  feedbackType.value = ''
}

watch([prediction, () => blanks.value.factor1, () => blanks.value.factor2, () => blanks.value.factor3, scenario], resetFeedback)

// Persistence
const STORAGE_KEY = `ConceptLab-${props.title || 'conceptlab'}`
onMounted(() => {
    const persisted = loadProgress(STORAGE_KEY)
    if (persisted) {
      step.value = persisted.step ?? step.value
      prediction.value = persisted.prediction ?? prediction.value
      blanks.value = persisted.blanks ?? blanks.value
      scenario.value = persisted.scenario ?? scenario.value
      finished.value = persisted.finished ?? finished.value
    }
})

watch([step, prediction, () => blanks.value.factor1, () => blanks.value.factor2, () => blanks.value.factor3, scenario, finished], () => {
  saveProgress(STORAGE_KEY, {
    step: step.value,
    prediction: prediction.value,
    blanks: blanks.value,
    scenario: scenario.value,
    finished: finished.value
  })
}, { deep: true })

function checkStep() {
  if (step.value === 0) {
    if (prediction.value === 'zelfde') {
      feedbackType.value = 'success'
      feedback.value = 'Correct! De archimedeskracht hangt alleen af van de vloeistof en het ondergedompelde volume. Omdat beide gelijk zijn, is F_A hetzelfde.'
      setTimeout(() => { step.value = 1 }, 2000)
      return
    }
    feedbackType.value = 'error'
    feedback.value = 'Nog niet juist. Kijk goed naar de formule: F_A = rho_vl . g . V_vwp. Staat daar iets over het materiaal van het voorwerp?'
    return
  }

  if (step.value === 1) {
    const f1 = blanks.value.factor1.toLowerCase().trim()
    const f2 = blanks.value.factor2.toLowerCase().trim()
    const f3 = blanks.value.factor3.toLowerCase().trim()
    
    // Check if the factors contain the right concepts
    const hasRho = [f1, f2, f3].some(f => f.includes('rho') || f.includes('dichtheid'))
    const hasG = [f1, f2, f3].some(f => f === 'g' || f.includes('zwaarteveld'))
    const hasV = [f1, f2, f3].some(f => f.includes('v') || f.includes('volume'))

    if (hasRho && hasG && hasV) {
      feedbackType.value = 'success'
      feedback.value = 'Uitstekend! De drie factoren zijn de massadichtheid van de vloeistof, de zwaarteveldsterkte en het ondergedompelde volume.'
      setTimeout(() => { step.value = 2 }, 2000)
      return
    }
    feedbackType.value = 'error'
    feedback.value = 'Controleer de drie factoren. Denk aan de formule: rho_vl , g en V_vwp.'
    return
  }

  if (step.value === 2) {
    if (scenario.value === 'zelfde-fa') {
      feedbackType.value = 'success'
      feedback.value = 'Perfect! Hoewel lood veel zwaarder is, ondervinden beide blokjes exact dezelfde archimedeskracht omdat ze evenveel water verplaatsen.'
      finished.value = true
      return
    }
    feedbackType.value = 'error'
    feedback.value = 'Nog niet juist. De zwaartekracht op het lood is wel groter, maar de archimedeskracht hangt enkel af van het verplaatste water.'
  }
}

function resetActivity() {
  step.value = 0
  prediction.value = ''
  blanks.value = { factor1: '', factor2: '', factor3: '' }
  scenario.value = ''
  feedback.value = ''
  feedbackType.value = ''
  finished.value = false
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function close() {
  emit('close')
}

function complete() {
  emit('complete')
}
</script>

<template>
  <div v-if="isOpen" ref="modalRoot" class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" :aria-labelledby="titleId">
    <!-- Backdrop with blur -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal Container (Full Screen) -->
    <div class="relative w-screen h-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row shadow-2xl">
      
      <!-- Left side: Interaction Panle -->
      <div class="flex-1 flex flex-col min-w-0 bg-white shadow-xl relative z-10">
        <!-- Header -->
        <div class="bg-indigo-950 text-white px-8 py-5 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <PhFlask class="text-2xl text-white" weight="bold" />
            </div>
            <div>
              <h3 :id="titleId" class="font-bold text-lg leading-tight">{{ title }}</h3>
              <p class="text-xs text-indigo-300/70 font-medium">Interactieve conceptverankering • Les 1</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
             <button class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold" title="Toggle Volledig Scherm" @click="toggleFullscreen">
               <PhCornersOut class="text-xl" weight="bold" />
               <span class="hidden sm:inline">Fullscreen</span>
             </button>
             <button class="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors" @click="close">
               <PhX class="text-xl" weight="bold" />
             </button>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="px-8 py-6 bg-slate-50 border-b border-slate-100 shrink-0">
          <div class="flex items-center justify-between max-w-md mx-auto">
            <template v-for="(s, idx) in steps" :key="idx">
              <div class="flex flex-col items-center gap-2 group relative flex-1">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 z-10"
                  :class="idx === step ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/30' : idx < step ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 text-slate-400'"
                >
                  <component :is="idx < step ? PhCheck : s.icon" :weight="idx <= step ? 'bold' : 'regular'" class="text-lg" :class="idx <= step ? 'text-white' : ''" />
                </div>
                <span class="text-[10px] font-bold uppercase tracking-widest transition-colors" :class="idx === step ? 'text-indigo-600' : idx < step ? 'text-emerald-600' : 'text-slate-400'">
                  {{ s.label }}
                </span>
                <!-- Connector Line -->
                <div v-if="idx < steps.length - 1" class="absolute left-[50%] top-5 w-full h-0.5 bg-slate-200 -z-0">
                   <div class="h-full bg-emerald-500 transition-all duration-700" :style="{ width: idx < step ? '100%' : '0%' }"></div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Transition name="fade-slide" mode="out-in">
            <!-- Step 0: Voorspel -->
            <div v-if="step === 0" key="step0" class="space-y-6">
              <div class="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-2">Stap 1: Hypothese</div>
              <h4 class="text-3xl font-black text-slate-800 leading-tight">Gelijk of verschillend?</h4>
              <p class="text-lg text-slate-600 leading-relaxed">
                Stel: we hebben twee blokjes met <strong>exact hetzelfde</strong> ondergedompelde volume. Ze zitten volledig in dezelfde vloeistof. 
                <br><br>
                Is de archimedeskracht (<span v-html="renderMath('\\( F_A \\)')"></span>) op beide voorwerpen gelijk?
              </p>
              
              <div class="grid grid-cols-1 gap-3 pt-4">
                <button 
                  v-for="(opt, key) in { 'zelfde': 'Ja, ze zijn gelijk', 'anders': 'Nee, ze zijn verschillend', 'hangt-af': 'Dat hangt af van het materiaal' }"
                  :key="key"
                  @click="prediction = key"
                  class="group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-95"
                  :class="prediction === key ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'"
                >
                  <div class="flex items-center gap-4 relative z-10">
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors" :class="prediction === key ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'">
                      <div v-if="prediction === key" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <span class="font-bold text-slate-800 tracking-tight transition-colors" :class="prediction === key ? 'text-indigo-900' : ''">{{ opt }}</span>
                  </div>
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PhArrowRight class="text-indigo-400" />
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 1: Vul aan -->
            <div v-else-if="step === 1" key="step1" class="space-y-6">
              <div class="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-2">Stap 2: Analyse</div>
              <h4 class="text-3xl font-black text-slate-800 leading-tight">De wet van Archimedes</h4>
              <p class="text-lg text-slate-600 leading-relaxed italic border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/30 rounded-r-xl">
                 "De opwaartse kracht is gelijk aan het gewicht van de verplaatste vloeistof."
              </p>
              
              <div class="space-y-6 pt-4">
                <p class="font-bold text-slate-700 mb-2">Vul de drie factoren van de formule aan:</p>
                <div class="flex flex-col gap-4">
                   <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-mono font-bold text-slate-600" v-html="renderMath('\\( \\rho_{vl} \\)')"></div>
                      <input v-model="blanks.factor1" class="flex-1 p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 outline-none font-bold" placeholder="Naam factor 1..." />
                   </div>
                   <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-mono font-bold text-slate-600" v-html="renderMath('\\( g \\)')"></div>
                      <input v-model="blanks.factor2" class="flex-1 p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 outline-none font-bold" placeholder="Naam factor 2..." />
                   </div>
                   <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-mono font-bold text-slate-600" v-html="renderMath('\\( V_{vwp} \\)')"></div>
                      <input v-model="blanks.factor3" class="flex-1 p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all bg-slate-50 outline-none font-bold" placeholder="Naam factor 3..." />
                   </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Pas toe -->
            <div v-else key="step2" class="space-y-6">
              <div class="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-2">Stap 3: Transfer</div>
              <h4 class="text-3xl font-black text-slate-800 leading-tight">Kurk vs. Lood</h4>
              <p class="text-lg text-slate-600 leading-relaxed">
                Twee blokjes hebben hetzelfde volume en zitten volledig onder water. 
                <br><br>
                <strong>Blok A</strong> is kurk (licht materiaal).<br>
                <strong>Blok B</strong> is lood (zwaar materiaal).
                <br><br>
                Wie ondervindt de grootste archimedeskracht?
              </p>
              
              <div class="grid grid-cols-1 gap-3 pt-4">
                <button 
                  v-for="(opt, key) in { 'zelfde-fa': 'Beide krijgen dezelfde F_A', 'lood-groter': 'Lood krijgt een grotere F_A' }"
                  :key="key"
                  @click="scenario = key"
                  class="group p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-95"
                  :class="scenario === key ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'"
                >
                  <div class="flex items-center gap-4 relative z-10">
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors" :class="scenario === key ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'">
                      <div v-if="scenario === key" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <span class="font-bold text-slate-800 tracking-tight transform group-hover:translate-x-1 transition-transform" :class="scenario === key ? 'text-indigo-900 font-black' : ''">{{ opt }}</span>
                  </div>
                </button>
              </div>
            </div>
          </Transition>

          <!-- Feedback Toast -->
          <Transition name="fade-bounce">
            <div v-if="feedback" class="mt-8 p-6 rounded-2xl border-2 flex items-start gap-4 animate-in fade-in zoom-in" :class="feedbackType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="feedbackType === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'">
                <component :is="feedbackType === 'success' ? PhCheckCircle : PhWarningCircle" class="text-2xl text-white" weight="fill" />
              </div>
              <div>
                <p class="font-black text-[10px] uppercase tracking-widest mb-1">{{ feedbackType === 'success' ? 'Uitstekend' : 'Let op' }}</p>
                <p class="font-bold text-lg leading-snug">{{ feedback }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3 text-slate-400">
            <PhWaveSine class="text-xl" />
            <span class="text-[10px] font-bold uppercase tracking-widest">Conceptuele Verankering</span>
          </div>
          <div class="flex items-center gap-3">
            <button v-if="!finished" 
              class="group px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:pointer-events-none"
              :disabled="step === 0 && !prediction || step === 1 && (!blanks.factor1 || !blanks.factor2 || !blanks.factor3) || step === 2 && !scenario"
              @click="checkStep"
            >
              <span>Controleer Stap</span>
              <PhArrowRight class="text-xl group-hover:translate-x-1 transition-transform" weight="bold" />
            </button>
            <div v-else class="flex items-center gap-3">
              <button 
                class="px-6 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-2 transition-all transform active:scale-95"
                @click="resetActivity"
              >
                <PhArrowsCounterClockwise class="text-xl" weight="bold" />
                <span>Opnieuw</span>
              </button>
              <button 
                class="px-10 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition-all transform active:scale-95 shadow-xl shadow-emerald-600/20" 
                @click="complete"
              >
                Activiteit Afronden
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Visual Simulation Pane -->
      <div class="hidden md:flex w-[40%] bg-indigo-950 flex-col overflow-hidden relative border-l border-white/10">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 to-indigo-950 z-0"></div>
        <div class="absolute inset-0 opacity-20 z-0 bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)]"></div>
        
        <!-- Simulation Content -->
        <div class="relative z-10 h-full flex flex-col p-8">
          <div class="flex items-center justify-between mb-10">
            <span class="px-3 py-1 bg-white/10 rounded-lg text-indigo-200 text-[10px] font-black tracking-widest uppercase border border-white/10">Labo Simulatie</span>
            <div class="flex gap-2">
               <div class="w-2.5 h-1 rounded-full transition-all duration-500" :class="step >= 0 ? 'bg-amber-400 w-6' : 'bg-white/20'"></div>
               <div class="w-2.5 h-1 rounded-full transition-all duration-500" :class="step >= 1 ? 'bg-amber-400 w-6' : 'bg-white/20'"></div>
               <div class="w-2.5 h-1 rounded-full transition-all duration-500" :class="step >= 2 ? 'bg-amber-400 w-6' : 'bg-white/20'"></div>
            </div>
          </div>

          <!-- Dynamic SVG Canvas -->
          <div class="flex-1 flex items-center justify-center">
            <svg viewBox="0 0 300 400" class="w-full h-full max-h-[400px] drop-shadow-2xl overflow-visible">
               <defs>
                 <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0.1)" />
                 </linearGradient>
                 <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.5" />
                 </linearGradient>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
                 </marker>
                 <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
                 </marker>
               </defs>

               <!-- Tank Structure -->
               <rect x="50" y="50" width="200" height="300" rx="4" fill="url(#tankGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
               
               <!-- Water Level -->
               <rect x="52" y="100" width="196" height="248" rx="2" fill="url(#waterGrad)" />
               <path d="M 52 100 Q 101 92, 150 100 T 248 100 L 248 105 L 52 105 Z" fill="#7dd3fc" fill-opacity="0.4" />
               
               <!-- Objects Group -->
               <g class="transition-all duration-1000">
                  <!-- Block A -->
                  <g :transform="`translate(${step === 1 ? 150 : 100}, 210)`" class="transition-all duration-1000">
                     <rect x="-30" y="-30" width="60" height="60" rx="8" 
                        :fill="step === 2 ? 'rgba(217,119,6,0.85)' : 'rgba(255,255,255,0.2)'" 
                        :stroke="step === 2 ? '#fbbf24' : 'rgba(255,255,255,0.4)'" 
                        stroke-width="2" />
                     <text v-if="step === 2" y="50" text-anchor="middle" class="fill-white/80 font-black text-[10px] uppercase tracking-widest">Kurk</text>
                     <PhCube v-else x="-10" y="-10" class="text-white/20" weight="bold" />
                     
                     <!-- Archimedes Force Vector -->
                     <g v-if="prediction || step > 0" class="animate-pulse">
                        <line x1="0" y1="0" x2="0" y2="-90" stroke="#4ade80" stroke-width="4" marker-end="url(#arrowhead)" />
                        <text x="15" y="-65" class="fill-emerald-400 font-black text-[14px]">F<tspan dy="5" font-size="10">A</tspan></text>
                     </g>
                     
                     <!-- Weight Vector -->
                     <g v-if="step === 2">
                        <line x1="0" y1="0" x2="0" y2="60" stroke="#f87171" stroke-width="4" marker-end="url(#arrowhead-red)" />
                        <text x="15" y="55" class="fill-rose-400 font-black text-[14px]">F<tspan dy="5" font-size="10">z</tspan></text>
                     </g>
                  </g>

                  <!-- Block B (only in step 0 and 2) -->
                  <g v-if="step !== 1" transform="translate(200, 210)" class="transition-all duration-1000">
                     <rect x="-30" y="-30" width="60" height="60" rx="8" 
                        :fill="step === 2 ? 'rgba(71,85,105,0.95)' : 'rgba(255,255,255,0.2)'" 
                        :stroke="step === 2 ? '#cbd5e1' : 'rgba(255,255,255,0.4)'" 
                        stroke-width="2" />
                     <text v-if="step === 2" y="50" text-anchor="middle" class="fill-white/80 font-black text-[10px] uppercase tracking-widest">Lood</text>
                     
                     <!-- Archimedes Force Vector -->
                     <g v-if="prediction || step > 0" class="animate-pulse">
                        <line x1="0" y1="0" x2="0" y2="-90" stroke="#4ade80" stroke-width="4" marker-end="url(#arrowhead)" />
                        <text x="15" y="-65" class="fill-emerald-400 font-black text-[14px]">F<tspan dy="5" font-size="10">A</tspan></text>
                     </g>
                     
                     <!-- Weight Vector (much larger for lead) -->
                     <g v-if="step === 2">
                        <line x1="0" y1="0" x2="0" y2="120" stroke="#f87171" stroke-width="4" marker-end="url(#arrowhead-red)" />
                        <text x="15" y="115" class="fill-rose-400 font-black text-[14px]">F<tspan dy="5" font-size="10">z</tspan></text>
                     </g>
                  </g>
               </g>
            </svg>
          </div>

          <!-- Simulation Info Card -->
          <div class="mt-8 bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
            <h5 class="text-indigo-200 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
               <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
               Live Observatie
            </h5>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-indigo-300/60 text-[10px] font-bold uppercase">Volume (<span v-html="renderMath('\\( V_{vwp} \\)')"></span>)</span>
                <span class="text-white font-mono text-xs">{{ step === 2 ? '60 cm³' : 'Identiek' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-indigo-300/60 text-[10px] font-bold uppercase">Fluïdum (<span v-html="renderMath('\\( \\rho_{vl} \\)')"></span>)</span>
                <span class="text-white font-mono text-xs">Water (1000 kg/m³)</span>
              </div>
              <div class="pt-4 border-t border-white/5 flex items-center justify-between">
                <span class="text-indigo-100 text-[10px] font-black uppercase tracking-wider underline decoration-indigo-500/50 underline-offset-4">Conclusie F<sub>A</sub></span>
                <span class="text-emerald-400 font-black text-xs px-2 py-0.5 bg-emerald-400/10 rounded border border-emerald-400/20">IDENTIEK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-bounce-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-bounce-leave-active {
  animation: bounce-in 0.4s reverse;
}

@keyframes bounce-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

input::placeholder {
  font-weight: 500;
  color: #94a3b8;
  opacity: 0.4;
}

button {
  -webkit-tap-highlight-color: transparent;
}
</style>
