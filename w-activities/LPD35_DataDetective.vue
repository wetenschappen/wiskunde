<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartLineUp, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Data & Statistiek: De Data-Detective' },
  instruction: {
    type: String,
    default: 'Grafieken aflezen is meer dan alleen getallen zoeken. Je moet ze kunnen interpreteren!<br/><br/><strong>Opdracht:</strong> Kijk naar de temperatuurgrafiek van deze week. Iemand beweert: <strong>"Het werd elke dag een beetje warmer, tot de temperatuur op donderdag ineens begon te dalen."</strong> Klopt dit?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartLineUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Lees de grafiek en beoordeel de uitspraak.' })

// Internal level system
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    name: 'Niveau 1',
    chartLabel: 'Temperatuur (°C)',
    claim: '"Het werd elke dag een beetje warmer, tot de temperatuur op donderdag ineens begon te dalen."',
    data: [
      { day: 'Ma', temp: 10 },
      { day: 'Di', temp: 12 },
      { day: 'Wo', temp: 15 },
      { day: 'Do', temp: 15 },
      { day: 'Vr', temp: 11 }
    ],
    correctAnswer: false,
    successFeedback: 'Goed gezien! Het werd inderdaad warmer van Ma tot Wo, maar op Donderdag bleef de temperatuur GELIJK (horizontale lijn) aan Woensdag. Pas op Vrijdag daalde het.',
    errorFeedback: 'Kijk heel goed naar het lijnstukje tussen Woensdag en Donderdag. Gaat dat echt omlaag? Of blijft het horizontaal?'
  },
  {
    name: 'Niveau 2',
    chartLabel: 'Verkoopcijfers (x 100 EUR)',
    claim: '"De verkoopcijfers stegen deze week elke dag zonder uitzondering."',
    data: [
      { day: 'Ma', temp: 5 },
      { day: 'Di', temp: 8 },
      { day: 'Wo', temp: 12 },
      { day: 'Do', temp: 10 },
      { day: 'Vr', temp: 15 }
    ],
    correctAnswer: false,
    successFeedback: 'Juist! De verkoop steeg Ma-Di-Wo, maar Donderdag DAALDE de verkoop (van 12 naar 10). Pas op Vrijdag steeg het weer. De uitspraak klopt dus niet.',
    errorFeedback: 'Bekijk Donderdag nog eens. Is de verkoop toen gestegen of gedaald ten opzichte van Woensdag?'
  },
  {
    name: 'Niveau 3',
    chartLabel: 'Hardloopschema (km)',
    claim: '"Elke week liep ik meer kilometers dan de week ervoor."',
    data: [
      { day: 'Wk 1', temp: 2 },
      { day: 'Wk 2', temp: 4 },
      { day: 'Wk 3', temp: 6 },
      { day: 'Wk 4', temp: 5 },
      { day: 'Wk 5', temp: 8 }
    ],
    correctAnswer: false,
    successFeedback: 'Correct! Week 4 was een dip (6 km vs 5 km). De bewering "elke week meer" klopt dus niet. Soms moet je de data echt goed bekijken!',
    errorFeedback: 'Vergelijk week 3 en week 4. Ging het daadwerkelijk omhoog tussen die twee?'
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const userAns = ref(null) // true (Klopt), false (Onzin)

const points = computed(() => currentLevel.value.data)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Lees de grafiek en beoordeel de uitspraak.' };
    userAns.value = null;
}

function checkAnswer(ans) {
  userAns.value = ans;
  isChecked.value = true;

  if (ans === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevel.value.successFeedback
    }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: currentLevel.value.errorFeedback }
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    emit('complete')
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            {{ currentLevel.name }} ({{ currentInternalLevel + 1 }}/{{ totalInternalLevels }})
          </span>
          <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
            <PhX class="w-6 h-6" />
          </button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="currentLevel.instruction || props.instruction"></div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-3">Uitspraak: {{ currentLevel.claim }}</label>

               <div class="flex gap-2">
                   <button @click="checkAnswer(true)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === true ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       KLOPT
                   </button>
                   <button @click="checkAnswer(false)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === false ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       FOUT (ONZIN)
                   </button>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl bg-white shadow-xl rounded-3xl border-4 border-slate-300 p-8 flex flex-col items-center">

                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6">{{ currentLevel.chartLabel }}</h4>

                  <!-- SVG Graph -->
                  <div class="relative">
                      <svg width="500" height="300" viewBox="0 0 500 300" class="block">
                          <!-- Origin (50, 250) -->

                          <!-- Grid lines (Y: 0 to 20, step 5) -> 200px / 20 = 10px per unit -->
                          <g stroke="#f1f5f9" stroke-width="2">
                              <line v-for="i in 5" :key="'hg'+i" x1="50" :y1="250 - (i-1)*50" x2="450" :y2="250 - (i-1)*50" />
                          </g>

                          <!-- Axes -->
                          <line x1="50" y1="250" x2="480" y2="250" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="50" y1="250" x2="50" y2="20" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />

                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <!-- Y Ticks -->
                          <g font-size="12" fill="#64748b" font-weight="bold" text-anchor="end">
                              <text x="40" y="254">0</text>
                              <text x="40" y="204">5</text>
                              <text x="40" y="154">10</text>
                              <text x="40" y="104">15</text>
                              <text x="40" y="54">20</text>
                          </g>

                          <!-- X Ticks & Labels -->
                          <!-- 5 days, spread over 400px -> 80px per day -->
                          <g font-size="14" fill="#475569" font-weight="bold" text-anchor="middle">
                              <text v-for="(pt, idx) in points" :key="'xt'+idx" :x="50 + idx * 80 + 40" y="275">{{ pt.day }}</text>
                          </g>

                          <!-- The Line Path -->
                          <!-- 10px per degree. Y = 250 - (temp * 10) -->
                          <polyline
                              fill="none"
                              stroke="#0ea5e9"
                              stroke-width="4"
                              stroke-linejoin="round"
                              :points="points.map((pt, idx) => `${50 + idx * 80 + 40},${250 - pt.temp * 10}`).join(' ')"
                              class="animate-draw" />

                          <!-- Data Points -->
                          <g v-for="(pt, idx) in points" :key="'pt'+idx">
                              <circle :cx="50 + idx * 80 + 40" :cy="250 - pt.temp * 10" r="6" fill="#0284c7" stroke="white" stroke-width="2" class="animate-fadeIn shadow-sm" :style="`animation-delay: ${idx * 0.2}s`" />

                              <!-- Tooltips on hover -->
                              <text :x="50 + idx * 80 + 40" :y="250 - pt.temp * 10 - 15" text-anchor="middle" font-weight="bold" fill="#0284c7" font-size="12" class="opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                  {{ pt.temp }}
                              </text>
                          </g>

                          <!-- Highlight the critical part if answered wrong -->
                          <circle v-if="isChecked && !isCorrect"
                                  :cx="50 + 3 * 80 + 40"
                                  :cy="250 - (currentLevel.data[3].temp * 10)"
                                  r="40" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4 4" class="animate-pulse" />

                      </svg>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-draw {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw 2s ease-out forwards;
}
@keyframes draw {
    to { stroke-dashoffset: 0; }
}
</style>