<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhCaretDown
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Reële Getallen: Constructie' },
  instruction: {
    type: String,
    default: 'Irrationale getallen (zoals √5) kun je exact tekenen op een getallenas! Bouw een rechthoekige driehoek met basis a en hoogte b zodat de schuine zijde de gevraagde lengte heeft.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stel de basis (a) en hoogte (b) in met de sliders.' })
const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel() {
  // Level pools: each entry is { a, b, c2 } where c2 = a^2 + b^2
  const pools = [
    // Level 1: small numbers
    [{ a: 1, b: 2, c2: 5 }, { a: 1, b: 1, c2: 2 }, { a: 2, b: 1, c2: 5 }, { a: 1, b: 3, c2: 10 }],
    // Level 2: medium
    [{ a: 1, b: 3, c2: 10 }, { a: 2, b: 3, c2: 13 }, { a: 1, b: 4, c2: 17 }, { a: 2, b: 4, c2: 20 }],
    // Level 3: larger
    [{ a: 2, b: 4, c2: 20 }, { a: 3, b: 4, c2: 25 }, { a: 1, b: 5, c2: 26 }, { a: 3, b: 5, c2: 34 }]
  ]

  const hints = [
    'Denk aan Pythagoras: a² + b² = ?. Welke twee kwadraten (1, 4, 9, 16...) vormen samen het doelgetal?',
    'Probeer verschillende combinaties. Het product a² + b² moet exact het doelgetal zijn.',
    'Kijk naar een kwadraat dicht bij het doelgetal. Als één getal een kwadraat geeft dicht bij de target, kun je de rest aanvullen met het andere getal.'
  ]

  const successes = [
    (a, b, c2) => `Wauw! Door een basis van ${a} en hoogte van ${b} te gebruiken, is de schuine zijde exact √${c2}. Neerklappen maar!`,
    (a, b, c2) => `Perfect! ${a}² + ${b}² = ${a*a} + ${b*b} = ${c2}, dus de schuine zijde is exact √${c2}.`,
    (a, b, c2) => `Briljant! ${a}² + ${b}² = ${a*a} + ${b*b} = ${c2}. De schuine zijde is √${c2}.`
  ]

  return pools.map((pool, i) => {
    const ans = pool[randomInt(0, pool.length - 1)]
    return {
      goalText: `Opdracht ${i+1}: Construeer exact √${ans.c2} op de as.`,
      targetC2: ans.c2,
      hintA: hints[i],
      success: successes[i](ans.a, ans.b, ans.c2)
    }
  })
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const baseA = ref(1) // 1 to 5
const heightB = ref(1) // 1 to 5
const step = ref(0) // 0: building, 1: correct triangle, 2: dropped to axis

const currentC2 = computed(() => baseA.value * baseA.value + heightB.value * heightB.value)
const currentC = computed(() => Math.sqrt(currentC2.value))

watch([baseA, heightB], () => {
    if (step.value === 2) return; // locked after drop
    isChecked.value = false;
    isCorrect.value = false;
    step.value = 0;
    feedback.value = { type: 'info', text: 'Stel de basis (a) en hoogte (b) in.' };
})

function checkTriangle() {
    isChecked.value = true;
    if (currentC2.value === currentLevelData.value.targetC2) {
        isCorrect.value = true;
        step.value = 1;
        attemptCount.value = 0;
        feedback.value = { type: 'success', text: currentLevelData.value.success }
    } else {
        attemptCount.value++;
        isCorrect.value = false;

        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `Niet helemaal. Je huidige schuine zijde is √${currentC2.value}. ${currentLevelData.value.hintA}` }
        } else if (attemptCount.value === 2) {
          const diff = Math.abs(currentC2.value - currentLevelData.value.targetC2);
          feedback.value = {
            type: 'error',
            text: `Je zit er ${diff} naast. Denk aan de kwadraten: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25. Welke twee kwadraten sommeren tot ${currentLevelData.value.targetC2}?`
          }
        } else {
          feedback.value = {
            type: 'error',
            text: `Probeer het stapsgewijs: voor √${currentLevelData.value.targetC2} heb je a² + b² = ${currentLevelData.value.targetC2} nodig. Probeer a = ${baseA.value} en varieer b.`
          }
        }
    }
}

function dropToAxis() {
    if (step.value !== 1) return;
    step.value = 2;
    feedback.value = { type: 'success', text: `Het irrationale getal √${currentLevelData.value.targetC2} ligt nu exact op de getallenas!` }
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Stel de basis (a) en hoogte (b) in met de sliders.' };
    attemptCount.value = 0;
    step.value = 0;
    baseA.value = 1;
    heightB.value = 1;
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
    nextTick(() => mainArea.value?.focus())
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
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner flex flex-col gap-6">

               <div class="font-mono font-black text-xl text-slate-700 bg-white p-4 rounded-lg shadow-sm border-2 border-slate-200 text-center">
                   c = √( <span class="text-blue-500">{{ baseA }}²</span> + <span class="text-math-blue">{{ heightB }}²</span> ) = <span class="text-emerald-500">√{{ currentC2 }}</span>
               </div>

               <!-- Slider A -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-blue-700 flex justify-between">
                       <span>Basis (a)</span>
                       <span>{{ baseA }}</span>
                   </label>
                   <input type="range" min="1" max="5" step="1" v-model.number="baseA" :disabled="step === 2" class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
               </div>

               <!-- Slider B -->
               <div class="flex flex-col gap-1">
                   <label class="text-sm font-bold text-math-blue flex justify-between">
                       <span>Hoogte (b)</span>
                       <span>{{ heightB }}</span>
                   </label>
                   <input type="range" min="1" max="5" step="1" v-model.number="heightB" :disabled="step === 2" class="w-full h-2 bg-math-blue-light rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
               </div>

            </div>

            <!-- Contextual Actions -->
            <div class="mt-6 flex flex-col gap-2">
                <button @click="checkTriangle" v-if="step === 0" class="py-4 px-4 bg-math-blue text-white font-bold rounded-lg shadow-sm hover:bg-math-blue active:scale-95 transition-all">
                    1. Valideer Driehoek
                </button>
                <button @click="dropToAxis" v-if="step === 1" class="py-4 px-4 bg-emerald-500 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse">
                    2. Klap Neer <PhCaretDown weight="bold" />
                </button>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>

              <button v-if="!isCorrect || step !== 2" disabled class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 opacity-50">
                Afronden
              </button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-3xl flex flex-col items-center">

                  <!-- Visualisation Area -->
                  <!-- Number Line & Triangle -->
                  <!-- 0 to 5 on axis. 1 unit = 80px. -->
                  <!-- Origin at (100, 350) inside a 600x450 box -->
                  <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8 min-w-[600px] min-h-[450px]">

                      <svg width="600" height="450" viewBox="0 0 600 450" class="block relative z-10">

                          <!-- Definitions -->
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <!-- Grid for guidance -->
                          <g stroke="#f1f5f9" stroke-width="1">
                              <line v-for="i in 6" :key="'vg'+i" :x1="100 + (i-1)*80" y1="50" :x2="100 + (i-1)*80" y2="350" />
                              <line v-for="i in 6" :key="'hg'+i" x1="100" :y1="350 - (i-1)*80" x2="500" :y2="350 - (i-1)*80" />
                          </g>

                          <!-- The Number Line -->
                          <line x1="50" y1="350" x2="550" y2="350" stroke="#475569" stroke-width="4" marker-end="url(#arrow)" />

                          <!-- Ticks -->
                          <!-- 0 at x=100. 1 unit = 80px -->
                          <g stroke="#475569" stroke-width="4">
                              <line v-for="i in 6" :key="'tk'+i" :x1="100 + (i-1)*80" y1="340" :x2="100 + (i-1)*80" y2="360" />
                          </g>
                          <g font-weight="900" font-size="20" fill="#334155" text-anchor="middle">
                              <text v-for="i in 6" :key="'lbl'+i" :x="100 + (i-1)*80" y="385">{{ i-1 }}</text>
                          </g>

                          <!-- Sub-ticks for decimals (every 0.25 -> 20px) -->
                          <g stroke="#94a3b8" stroke-width="2">
                              <line v-for="i in 20" :key="'stk'+i" :x1="100 + i*20" y1="345" :x2="100 + i*20" y2="355" />
                          </g>

                          <!-- The Triangle -->
                          <!-- Origin: (100, 350). Base: baseA * 80. Height: heightB * 80. -->
                          <g class="transition-all duration-300">
                              <!-- Fill -->
                              <polygon :points="`100,350 ${100 + baseA*80},350 ${100 + baseA*80},${350 - heightB*80}`"
                                       fill="rgba(59, 130, 246, 0.1)" stroke="none" />

                              <!-- Base -->
                              <line x1="100" y1="350" :x2="100 + baseA*80" y2="350" stroke="#3b82f6" stroke-width="6" stroke-linecap="round" />
                              <text :x="100 + (baseA*80)/2" y="335" text-anchor="middle" font-weight="bold" fill="#3b82f6" font-size="20">{{ baseA }}</text>

                              <!-- Height -->
                              <line :x1="100 + baseA*80" y1="350" :x2="100 + baseA*80" :y2="350 - heightB*80" stroke="#d946ef" stroke-width="6" stroke-linecap="round" />
                              <text :x="100 + baseA*80 + 15" :y="350 - (heightB*80)/2" font-weight="bold" fill="#d946ef" font-size="20">{{ heightB }}</text>

                              <!-- Right angle -->
                              <polyline :points="`${100 + baseA*80 - 15},350 ${100 + baseA*80 - 15},335 ${100 + baseA*80},335`" fill="none" stroke="#64748b" stroke-width="2" />
                          </g>

                          <!-- The Diagonal (Hypotenuse) -->
                          <!-- In step 0 & 1, it's drawn across. -->
                          <g v-if="step >= 0" class="transition-all duration-300">
                              <line x1="100" y1="350" :x2="100 + baseA*80" :y2="350 - heightB*80" stroke="#10b981" stroke-width="6" stroke-linecap="round" />
                              <!-- Only show label if correct or if exploring -->
                              <text :x="100 + (baseA*80)/2 - 15" :y="350 - (heightB*80)/2 - 15" font-weight="900" font-size="24" fill="#10b981" :transform="`rotate(${-Math.atan2(heightB, baseA) * (180/Math.PI)} ${100 + (baseA*80)/2} ${350 - (heightB*80)/2})`" v-if="step > 0">√{{ currentC2 }}</text>
                          </g>

                          <!-- Dropping the Diagonal (Arc) -->
                          <!-- We rotate the line down around origin (100,350) -->
                          <!-- Length is currentC * 80 px -->
                          <!-- Arc uses dynamic animation using CSS variable or we just use a trick with SVG rotations -->

                          <g v-if="step === 2" class="animate-drop" :style="`transform-origin: 100px 350px; --start-angle: ${-Math.atan2(heightB, baseA) * (180/Math.PI)}deg;`">
                              <!-- Ghost line acting as the dropping hypotenuse -->
                              <line x1="100" y1="350" :x2="100 + currentC*80" y2="350" stroke="#10b981" stroke-width="6" stroke-linecap="round" />
                              <circle :cx="100 + currentC*80" cy="350" r="8" fill="#10b981" stroke="white" stroke-width="3" />
                              <!-- Note on the line -->
                              <text :x="100 + (currentC*80)/2" y="335" font-weight="900" font-size="20" fill="#10b981" text-anchor="middle">√{{ currentC2 }} ≈ {{ currentC.toFixed(2) }}</text>
                          </g>

                          <!-- The ghost arc to show the path -->
                          <!-- Arc from (100+baseA*80, 350-heightB*80) to (100+currentC*80, 350) -->
                          <path v-if="step === 2" :d="`M ${100 + baseA*80} ${350 - heightB*80} A ${currentC*80} ${currentC*80} 0 0 1 ${100 + currentC*80} 350`" fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="10 5" class="animate-fadeIn" style="animation-delay: 0.5s" />

                      </svg>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-drop {
    animation: dropArc 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes dropArc {
    0% { transform: rotate(var(--start-angle)); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: rotate(0deg); opacity: 1; }
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -9px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 3px;
}
</style>
