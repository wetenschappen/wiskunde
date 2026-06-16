<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhCrosshair,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelsels Grafisch Oplossen'
  },
  instruction: {
    type: String,
    default: 'Onderzoek het stelsel in de grafiek. Klik op het snijpunt, of geef aan dat het stelsel een speciaal geval is.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
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
    type: 'bepaald',
    f_str: 'y = x + 1', f: (x) => x + 1,
    g_str: 'y = -2x + 4', g: (x) => -2 * x + 4,
    correctPoint: { x: 1, y: 2 },
    goalText: 'Opdracht 1: Klik exact op het snijpunt van deze twee rechten.',
    lines: [{ x1: -5, y1: -4, x2: 5, y2: 6 }, { x1: -1, y1: 6, x2: 4.5, y2: -5 }]
  },
  {
    type: 'strijdig',
    f_str: 'y = 0.5x + 3', f: (x) => 0.5 * x + 3,
    g_str: 'y = 0.5x - 2', g: (x) => 0.5 * x - 2,
    correctPoint: null,
    goalText: 'Opdracht 2: Zoek het snijpunt in de grafiek. Als er geen is, gebruik de knop.',
    lines: [{ x1: -5, y1: 0.5, x2: 5, y2: 5.5 }, { x1: -5, y1: -4.5, x2: 5, y2: 0.5 }]
  },
  {
    type: 'onbepaald',
    f_str: 'y = 2x - 3', f: (x) => 2 * x - 3,
    g_str: '2y = 4x - 6', g: (x) => 2 * x - 3,
    correctPoint: null,
    goalText: 'Opdracht 3: Bekijk de vergelijkingen en de lijnen. Wat is hier aan de hand?',
    lines: [{ x1: -1, y1: -5, x2: 4, y2: 5 }, { x1: -1, y1: -5, x2: 4, y2: 5 }] // visually overlap
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

const userPoint = ref(null)
const userSpecialChoice = ref(null) // 'strijdig', 'onbepaald'

const gridSize = 40 // px
const originX = 200 // px
const originY = 200 // px

function handleGridClick(e) {
  if (isChecked.value && isCorrect.value) return;
  
  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  let gridX = Math.round((clickX - originX) / gridSize)
  let gridY = Math.round((originY - clickY) / gridSize)

  gridX = Math.max(-5, Math.min(gridX, 5))
  gridY = Math.max(-5, Math.min(gridY, 5))

  userPoint.value = { x: gridX, y: gridY }
  userSpecialChoice.value = null; // reset special choice if they clicked the grid
  isChecked.value = false
}

function setSpecialChoice(type) {
  if (isCorrect.value) return;
  userSpecialChoice.value = type;
  userPoint.value = null; // clear point if they pick a special option
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Analyseer het stelsel.' };
  userPoint.value = null;
  userSpecialChoice.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  const target = currentLevelData.value;

  if (target.type === 'bepaald') {
    if (!userPoint.value) {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: 'Dit stelsel heeft een snijpunt (een bepaalde oplossing). Klik erop in het assenstelsel.' };
      return;
    }
    if (userPoint.value.x === target.correctPoint.x && userPoint.value.y === target.correctPoint.y) {
      isCorrect.value = true;
      feedback.value = { type: 'success', text: `Perfect! Het snijpunt (${target.correctPoint.x}, ${target.correctPoint.y}) is de unieke oplossing van dit stelsel.` };
    } else {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: `Je koos (${userPoint.value.x}, ${userPoint.value.y}). Dat is niet het snijpunt waar beide lijnen exact kruisen.` };
    }
  } else if (target.type === 'strijdig') {
    if (userSpecialChoice.value === 'strijdig') {
      isCorrect.value = true;
      feedback.value = { type: 'success', text: 'Geweldig! De lijnen zijn evenwijdig. Ze snijden nooit, dus er is geen oplossing (strijdig stelsel).' };
    } else {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: 'Kijk naar de lijnen (en hun richtingscoëfficiënt). Gaan deze ooit snijden? Zoek de juiste speciale knop.' };
    }
  } else if (target.type === 'onbepaald') {
    if (userSpecialChoice.value === 'onbepaald') {
      isCorrect.value = true;
      feedback.value = { type: 'success', text: 'Zeer scherp! De tweede vergelijking is een veelvoud van de eerste. Het is dezelfde lijn, dus er zijn oneindig veel oplossingen (onbepaald).' };
    } else {
      isCorrect.value = false;
      feedback.value = { type: 'error', text: 'Heb je het snijpunt gezocht? Let op: beide vergelijkingen tekenen éxact dezelfde rechte! Wat betekent dat voor het aantal snijpunten?' };
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800">Stelsel:</p>
              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm space-y-2 border-l-4 border-l-slate-800 relative">
                <span class="absolute left-[-18px] top-1/2 -translate-y-1/2 text-4xl font-light text-slate-400">{</span>
                <p class="text-blue-600 font-bold ml-4">{{ currentLevelData.f_str }}</p>
                <p class="text-emerald-600 font-bold ml-4">{{ currentLevelData.g_str }}</p>
              </div>

              <!-- Options -->
              <div class="pt-4 flex flex-col gap-2">
                <div v-if="userPoint" class="p-3 border-2 border-orange-500 bg-orange-50 rounded-lg text-center shadow-sm cursor-pointer" @click="userPoint = null">
                  <p class="text-xs font-bold text-orange-700 uppercase">Gekozen Snijpunt:</p>
                  <p class="text-xl font-mono font-black text-orange-600">({{ userPoint.x }}, {{ userPoint.y }})</p>
                  <p class="text-[10px] text-orange-500 mt-1">(Klik om te wissen)</p>
                </div>
                <div v-else class="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400 font-medium text-sm">
                   Klik in de grafiek voor een snijpunt
                </div>

                <div class="h-px bg-slate-200 my-2"></div>
                <p class="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-1">Of kies een speciaal geval:</p>

                <button @click="setSpecialChoice('strijdig')" 
                        class="p-3 border-2 rounded-lg font-bold transition-all shadow-sm"
                        :class="userSpecialChoice === 'strijdig' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'">
                  Geen snijpunt (Strijdig stelsel)
                </button>
                <button @click="setSpecialChoice('onbepaald')" 
                        class="p-3 border-2 rounded-lg font-bold transition-all shadow-sm"
                        :class="userSpecialChoice === 'onbepaald' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'">
                  Oneindig veel snijpunten (Onbepaald stelsel)
                </button>

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
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || (!userPoint && !userSpecialChoice)" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
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
              
              <div class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair"
                   style="width: 400px; height: 400px;"
                   @click="handleGridClick">
                
                <!-- SVG Coordinate System (-5 to 5, origin at 200,200, grid 40px) -->
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <!-- Grid Lines -->
                  <g stroke="#e2e8f0" stroke-width="1">
                    <line v-for="i in 11" :key="'v'+i" :x1="(i-1)*40" y1="0" :x2="(i-1)*40" y2="400" />
                    <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*40" x2="400" :y2="(i-1)*40" />
                  </g>
                  
                  <!-- Axes -->
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#94a3b8" stroke-width="2" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" stroke-width="2" />

                  <!-- Graph lines mapped -->
                  <!-- origin 200,200, scale 40 -->
                  <line :x1="200 + currentLevelData.lines[0].x1 * 40" :y1="200 - currentLevelData.lines[0].y1 * 40"
                        :x2="200 + currentLevelData.lines[0].x2 * 40" :y2="200 - currentLevelData.lines[0].y2 * 40"
                        stroke="#2563eb" stroke-width="3" stroke-linecap="round" class="transition-all duration-300" />
                        
                  <line :x1="200 + currentLevelData.lines[1].x1 * 40" :y1="200 - currentLevelData.lines[1].y1 * 40"
                        :x2="200 + currentLevelData.lines[1].x2 * 40" :y2="200 - currentLevelData.lines[1].y2 * 40"
                        stroke="#10b981" stroke-width="3" stroke-linecap="round" class="transition-all duration-300"
                        :stroke-dasharray="currentLevelData.type === 'onbepaald' ? '8,8' : 'none'" />

                  <!-- User Point -->
                  <circle v-if="userPoint"
                          :cx="originX + userPoint.x * gridSize" 
                          :cy="originY - userPoint.y * gridSize" 
                          r="6" fill="#f97316" stroke="#fff" stroke-width="2" />

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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>