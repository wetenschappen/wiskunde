<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhCircleDashed,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Goniometrische Cirkel'
  },
  instruction: {
    type: String,
    default: 'Verander de hoek α om de opdracht te voltooien. De rode lijn toont de cosinus (x), de groene lijn de sinus (y).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCircleDashed }
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
    goal: "Draai de hoek zodat sin(α) = 1. Wat is de cosinus op dit punt?",
    check: (angle) => angle === 90,
    hint: "sin(α) is de projectie op de y-as (groen). Wanneer is deze y-projectie maximaal?"
  },
  {
    goal: "Zoek een hoek in Kwadrant III waarbij sin(α) exact -0.5 is.",
    check: (angle) => angle === 210, // 180 + 30
    hint: "Kwadrant III ligt links onderaan. Daar zijn zowel x als y negatief. Zoek de hoek waarbij de y-waarde precies op de helft (-0.5) van de straal zit."
  },
  {
    goal: "Zoek een hoek in Kwadrant II waarbij cos(α) kleiner (meer negatief) is dan -0.8.",
    check: (angle) => angle >= 143 && angle <= 180, // cos(143) is roughly -0.798
    hint: "Kwadrant II is linksboven. De cosinus (rode lijn) moet héél dicht bij de -1 komen. Trek de stip verder naar links."
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// State
const angleDeg = ref(45)
const angleRad = computed(() => angleDeg.value * (Math.PI / 180))
const cosVal = computed(() => Math.cos(angleRad.value))
const sinVal = computed(() => Math.sin(angleRad.value))

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Draai de slider of sleep de pijl (virtueel) naar de juiste hoek.' };
  angleDeg.value = 45;
}

function checkAnswer() {
  isChecked.value = true;
  if (currentLevelData.value.check(angleDeg.value)) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Super! Je hebt het wiskundige doel visueel bereikt op de eenheidscirkel.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: currentLevelData.value.hint
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
            
            <div class="text-center bg-pink-50 p-5 border border-pink-200 rounded-xl shadow-sm mb-6">
              <p class="font-bold text-pink-800">{{ currentLevelData.goal }}</p>
            </div>
            
            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">
              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Hoek α: <span class="text-pink-600 font-mono text-lg">{{ angleDeg }}°</span></label>
                <input type="range" v-model.number="angleDeg" min="0" max="360" step="1" class="w-full accent-pink-600">
              </div>
              
              <div class="flex gap-4">
                <div class="flex-1 bg-white p-3 rounded-lg border-2 border-rose-200 text-center shadow-sm">
                  <div class="text-xs text-rose-500 font-bold uppercase tracking-wide">cos(α)</div>
                  <div class="font-mono text-xl" :class="cosVal >= 0 ? 'text-slate-700' : 'text-slate-500'">{{ cosVal.toFixed(2) }}</div>
                </div>
                <div class="flex-1 bg-white p-3 rounded-lg border-2 border-emerald-200 text-center shadow-sm">
                  <div class="text-xs text-emerald-500 font-bold uppercase tracking-wide">sin(α)</div>
                  <div class="font-mono text-xl" :class="sinVal >= 0 ? 'text-slate-700' : 'text-slate-500'">{{ sinVal.toFixed(2) }}</div>
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
              
              <!-- SVG Unit Circle -->
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
                <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" stroke-width="2" />
                
                <!-- Quadrant Labels -->
                <text x="60" y="-60" font-size="24" font-weight="bold" fill="#ec4899" opacity="0.1">I</text>
                <text x="-60" y="-60" font-size="24" font-weight="bold" fill="#ec4899" opacity="0.1">II</text>
                <text x="-60" y="60" font-size="24" font-weight="bold" fill="#ec4899" opacity="0.1">III</text>
                <text x="60" y="60" font-size="24" font-weight="bold" fill="#ec4899" opacity="0.1">IV</text>

                <!-- Angle arc -->
                <path v-if="angleDeg > 0"
                      :d="`M 25 0 A 25 25 0 ${angleDeg > 180 ? 1 : 0} 0 ${25 * Math.cos(-angleRad)} ${25 * Math.sin(-angleRad)}`"
                      fill="none" stroke="#ec4899" stroke-width="3" class="transition-all duration-100" />

                <!-- Cosine component (x-axis) -->
                <line x1="0" y1="0" :x2="100 * cosVal" y2="0" stroke="#f43f5e" stroke-width="5" stroke-linecap="round" class="transition-all duration-100" />
                
                <!-- Sine component (y-axis) -->
                <line :x1="100 * cosVal" y1="0" :x2="100 * cosVal" :y2="-100 * sinVal" stroke="#10b981" stroke-width="5" stroke-linecap="round" class="transition-all duration-100" />
                
                <!-- Radius line -->
                <line x1="0" y1="0" :x2="100 * cosVal" :y2="-100 * sinVal" stroke="#1e293b" stroke-width="3" class="transition-all duration-100" />
                
                <!-- The Point -->
                <circle :cx="100 * cosVal" :cy="-100 * sinVal" r="7" fill="#ec4899" stroke="white" stroke-width="2" class="transition-all duration-100 shadow-sm" />
                
                <!-- Labels -->
                <text x="135" y="15" font-size="14" font-weight="bold" fill="#64748b">x</text>
                <text x="-15" y="-135" font-size="14" font-weight="bold" fill="#64748b">y</text>
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