<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTriangle, PhArrowClockwise, PhArrowsLeftRight
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Congruentie: De ZZH-Valstrik' },
  instruction: { 
    type: String, 
    default: 'Waarom is <strong>Zijde-Hoek-Zijde (ZHZ)</strong> een zekerheid voor perfecte tweeling-driehoeken (congruentie), maar <strong>Zijde-Zijde-Hoek (ZZH)</strong> NIET?<br/><br/><strong>Opdracht:</strong> Sleep de blauwe zijde heen en weer. Kijk of je één unieke driehoek krijgt, of dat er twee totaal verschillende driehoeken mogelijk zijn!' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om de blauwe zijde te laten slingeren.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: De ZZH Slinger',
    userOpt1: 'uniek', userOpt1Text: 'ZZH maakt altijd 1 unieke driehoek (WAAR)',
    userOpt2: 'twee', userOpt2Text: 'ZZH kan 2 verschillende driehoeken maken (VALS)',
    correctAns: 'twee',
    successMsg: 'Exact! Ondanks dat Zijde-Zijde-Hoek vastliggen, past de blauwe lijn op TWEE verschillende plekken. ZZH is dus géén garantie voor een tweeling (congruentie)!',
    errMsg: 'Fout! Beweeg de slider over de hele breedte. Zie je niet dat de blauwe lijn op TWEE verschillende plekken perfect de basis raakt?'
  },
  {
    goalText: 'Opdracht 2: Een scherpe hoek',
    userOpt1: 'uniek', userOpt1Text: 'ZZH maakt met een scherpe hoek altijd 1 unieke driehoek.',
    userOpt2: 'twee', userOpt2Text: 'Zelfs met een scherpe hoek is ZZH verraderlijk (2 opties).',
    correctAns: 'twee',
    successMsg: 'Klopt! De blauwe zijde kan naar binnen of naar buiten klappen. ZZH blijft een onbetrouwbaar kenmerk.',
    errMsg: 'Kijk goed naar de blauwe stippellijnen. De blauwe zijde kan twee kanten op klappen.'
  },
  {
    goalText: 'Opdracht 3: De ZZ90° Uitzondering',
    userOpt1: 'uniek', userOpt1Text: 'Bij een rechte hoek (90°) maakt ZZH 1 unieke driehoek.',
    userOpt2: 'twee', userOpt2Text: 'Zelfs bij 90° kan de blauwe zijde op 2 plekken landen.',
    correctAns: 'uniek',
    successMsg: 'Briljant! Als de hoek exact 90° is (ZZ90°), dan is er maar 1 wiskundige mogelijkheid dankzij Pythagoras. Dít is de enige uitzondering waarbij ZZH wél werkt!',
    errMsg: 'Probeer de slider! Als de blauwe lijn exact tot aan de bodem reikt bij een 90° hoek, kan hij nergens anders heen zonder te kort of te lang te zijn.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const swingAngle = ref(215) // Slider value 180 to 360
const userAns = ref('') // 'uniek', 'twee'

// Math coordinates
const A = { x: 100, y: 300 }

// Varying based on level
// L1: angle 30, AC 200, CB 130
// L2: angle 45, AC 200, CB 160
// L3: angle 90, AC 200, CB 200 (wait, if angle is 90, AC=200 vertical, base horizontal. CB=hypotenuse. Pythagoras! Say AC=200, CB=250. Base intersection exactly 1 point.)
const C = computed(() => {
    let angleA_rad
    if (currentInternalLevel.value === 0) angleA_rad = 30 * Math.PI / 180
    else if (currentInternalLevel.value === 1) angleA_rad = 45 * Math.PI / 180
    else angleA_rad = 90 * Math.PI / 180
    
    return { 
        x: A.x + 200 * Math.cos(angleA_rad), 
        y: A.y - 200 * Math.sin(angleA_rad) 
    }
})

const CBLength = computed(() => {
    if (currentInternalLevel.value === 0) return 130
    if (currentInternalLevel.value === 1) return 160
    return 250 // for the 90 deg triangle (200, 150, 250)
})

const B_visual = computed(() => {
    const rad = swingAngle.value * Math.PI / 180
    return {
        x: C.value.x + CBLength.value * Math.cos(rad),
        y: C.value.y + CBLength.value * Math.sin(rad) // Positive Y goes DOWN in SVG
    }
})

// Check if it's hitting the baseline (y approx 300)
const isHittingBase = computed(() => {
    return Math.abs(B_visual.value.y - 300) < 5
})

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beweeg de slider om de blauwe zijde te laten slingeren.' };
    userAns.value = '';
    swingAngle.value = 90; // Start pointing straight down
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === currentLevelData.value.correctAns) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: currentLevelData.value.errMsg }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-red-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-red-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-red-50 p-4 border border-red-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-red-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-red-200 bg-red-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-red-900 mb-2">Conclusie over de vorm:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een optie...</option>
                   <option value="uniek">{{ currentLevelData.userOpt1Text }}</option>
                   <option value="twee">{{ currentLevelData.userOpt2Text }}</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Regel</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-2xl flex flex-col items-center">
                  
                  <!-- Slider -->
                  <div class="mb-8 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                      <div class="flex w-full justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsLeftRight weight="bold" /> Slinger (Zijde a)</label>
                      </div>
                      <input type="range" min="10" max="170" step="1" v-model.number="swingAngle" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>

                  <!-- Visualisation -->
                  <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8" :key="'svg'+currentInternalLevel">
                      <svg width="500" height="350" viewBox="0 0 500 350">
                          
                          <!-- Ghost intersections to guide them -->
                          <!-- L1: 190, 356 -->
                          <!-- L2: C is (100 + 141.4, 300 - 141.4) = (241.4, 158.6). CB=160. y=300 -> dy = 141.4. dx = sqrt(160^2 - 141.4^2) = sqrt(25600 - 19994) = sqrt(5606) = 74.8. Intersects at 241.4 +/- 74.8 = 166.6 and 316.2. -->
                          <!-- L3: C is (100, 100). CB=250. Intersect at x = 100 +/- sqrt(250^2 - 200^2) = 100 +/- 150 = 250 (and -50, off screen). -->
                          <g v-if="currentInternalLevel === 0">
                              <circle cx="190" cy="300" r="10" fill="transparent" stroke="rgba(14, 165, 233, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
                              <circle cx="356" cy="300" r="10" fill="transparent" stroke="rgba(14, 165, 233, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
                          </g>
                          <g v-else-if="currentInternalLevel === 1">
                              <circle cx="166.6" cy="300" r="10" fill="transparent" stroke="rgba(14, 165, 233, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
                              <circle cx="316.2" cy="300" r="10" fill="transparent" stroke="rgba(14, 165, 233, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
                          </g>
                          <g v-else-if="currentInternalLevel === 2">
                              <circle cx="250" cy="300" r="10" fill="transparent" stroke="rgba(14, 165, 233, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
                          </g>

                          <!-- Base Line (Unfixed length, extending from A) -->
                          <line x1="50" y1="300" x2="450" y2="300" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8 4" />
                          
                          <!-- Angle A Arc -->
                          <path v-if="currentInternalLevel === 0" d="M 140 300 A 40 40 0 0 0 134.6 280" fill="none" stroke="#ef4444" stroke-width="3" />
                          <text v-if="currentInternalLevel === 0" x="145" y="295" font-weight="bold" fill="#ef4444" font-size="12">30°</text>

                          <path v-if="currentInternalLevel === 1" d="M 140 300 A 40 40 0 0 0 128.2 271.7" fill="none" stroke="#ef4444" stroke-width="3" />
                          <text v-if="currentInternalLevel === 1" x="145" y="285" font-weight="bold" fill="#ef4444" font-size="12">45°</text>

                          <!-- 90 deg box for L3 -->
                          <polyline v-if="currentInternalLevel === 2" points="100,280 120,280 120,300" fill="none" stroke="#ef4444" stroke-width="3" />
                          
                          <!-- Side b (Fixed AC) -->
                          <line x1="100" y1="300" :x2="C.x" :y2="C.y" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />
                          <text :x="(100 + C.x)/2 - 20" :y="(300 + C.y)/2 - 10" font-weight="bold" fill="#f59e0b">Vast</text>
                          
                          <!-- Side a (Swinging CB) -->
                          <line :x1="C.x" :y1="C.y" :x2="B_visual.x" :y2="B_visual.y" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" />
                          <text :x="(C.x + B_visual.x)/2 + 10" :y="(C.y + B_visual.y)/2" font-weight="bold" fill="#0ea5e9">Vast</text>

                          <!-- Intersection Success Fill -->
                          <polygon v-if="isHittingBase" :points="`100,300 ${C.x},${C.y} ${B_visual.x},${B_visual.y}`" 
                                   fill="rgba(16, 185, 129, 0.2)" class="animate-fadeIn pointer-events-none" />

                          <!-- Nodes -->
                          <circle cx="100" cy="300" r="5" fill="#1e293b" />
                          <circle :cx="C.x" :cy="C.y" r="5" fill="#1e293b" />
                          <circle :cx="B_visual.x" :cy="B_visual.y" r="8" fill="#0ea5e9" stroke="white" stroke-width="2" class="transition-colors duration-100" :class="isHittingBase ? '!fill-emerald-500 !stroke-emerald-200' : ''" />

                          <!-- Labels -->
                          <text x="80" y="315" font-weight="bold" fill="#1e293b">A</text>
                          <text :x="C.x - 10" :y="C.y - 15" font-weight="bold" fill="#1e293b">C</text>
                          <text :x="B_visual.x" :y="B_visual.y + 25" font-weight="bold" fill="#0ea5e9">B</text>

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
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #0ea5e9;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -11px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>