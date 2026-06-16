<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhMathOperations,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Voorschrift van een Tweedegraadsfunctie'
  },
  instruction: {
    type: String,
    default: 'Construeer het voorschrift f(x) = a(x - p)² + q. Pas de parameters aan totdat je parabool precies door de top (T) en het extra punt (P) loopt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
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
    targetA: 1, targetP: 2, targetQ: -3,
    topX: 2, topY: -3,
    pointX: 0, pointY: 1
  },
  {
    targetA: -1, targetP: -1, targetQ: 4,
    topX: -1, topY: 4,
    pointX: 1, pointY: 0
  },
  {
    targetA: -0.5, targetP: 3, targetQ: 2,
    topX: 3, topY: 2,
    pointX: 1, pointY: 0
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// User inputs
const valA = ref(1)
const valP = ref(0)
const valQ = ref(0)

const graphPath = computed(() => {
  const points = [];
  for (let x = -10; x <= 10; x += 0.2) {
    let y = valA.value * Math.pow(x - valP.value, 2) + valQ.value;
    if (y < -12 || y > 12) continue; 
    const svgX = x * 20;
    const svgY = -y * 20;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
})

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Bouw de formule op. De grafiek tekent live mee met jouw parameters.' };
  
  // Start away from the target
  valA.value = 1;
  valP.value = 0;
  valQ.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value;

  if (valA.value === target.targetA && valP.value === target.targetP && valQ.value === target.targetQ) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Bingo! Jouw formule tekent een parabool die perfect door T en P gaat.' 
    }
  } else {
    isCorrect.value = false
    
    if (valP.value !== target.targetP || valQ.value !== target.targetQ) {
      feedback.value = { 
        type: 'error', 
        text: 'Kijk naar je top. Het vertex (p, q) in je formule komt niet overeen met punt T in de grafiek.'
      }
    } else {
      feedback.value = { 
        type: 'error', 
        text: 'Je top klopt! Maar de parabool gaat nog niet door P. Pas de factor a aan om de parabool smaller, breder of omgeklapt te maken.'
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-purple-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-purple-500' : 'bg-slate-200'"></div>
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
            
            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">
              
              <div class="text-center bg-white p-4 border border-purple-200 rounded-xl shadow-sm">
                <p class="font-mono text-xl font-black text-purple-600">
                  f(x) = {{ valA === 1 ? '' : (valA === -1 ? '-' : valA) }}(x {{ valP >= 0 ? '- ' + valP : '+ ' + Math.abs(valP) }})² {{ valQ >= 0 ? '+ ' + valQ : '- ' + Math.abs(valQ) }}
                </p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Factor a (opening): {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-purple-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verschuiving horizontaal (p): {{ valP }}</label>
                <input type="range" v-model.number="valP" min="-5" max="5" step="1" class="w-full accent-blue-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verschuiving verticaal (q): {{ valQ }}</label>
                <input type="range" v-model.number="valQ" min="-5" max="5" step="1" class="w-full accent-emerald-600">
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
              
              <!-- Coordinate System SVG -->
              <svg width="400" height="400" viewBox="-100 -100 200 200" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
                
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*20" y1="-100" :x2="(i-11)*20" y2="100" />
                  <line v-for="i in 21" :key="'h'+i" x1="-100" :y1="(i-11)*20" x2="100" :y2="(i-11)*20" />
                </g>

                <!-- Axes -->
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#64748b" stroke-width="2" />

                <!-- User Graph -->
                <path v-if="valA !== 0" :d="graphPath" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />
                
                <!-- Target Points -->
                <!-- Top T -->
                <circle :cx="currentLevelData.topX * 20" :cy="-currentLevelData.topY * 20" r="5" fill="#334155" />
                <text :x="currentLevelData.topX * 20 + 8" :y="-currentLevelData.topY * 20 - 8" font-size="10" font-weight="bold" fill="#334155">T({{ currentLevelData.topX }}, {{ currentLevelData.topY }})</text>
                
                <!-- Point P -->
                <circle :cx="currentLevelData.pointX * 20" :cy="-currentLevelData.pointY * 20" r="5" fill="#334155" />
                <text :x="currentLevelData.pointX * 20 + 8" :y="-currentLevelData.pointY * 20 - 8" font-size="10" font-weight="bold" fill="#334155">P({{ currentLevelData.pointX }}, {{ currentLevelData.pointY }})</text>

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