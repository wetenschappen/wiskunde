<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhArrowsOutLine,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Inproduct (Scalair product) van Vectoren'
  },
  instruction: {
    type: String,
    default: 'Pas de y-coördinaat van vector b aan met de slider zodat vector a en vector b loodrecht op elkaar staan. Tip: Twee vectoren staan loodrecht als hun inproduct gelijk is aan 0.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhArrowsOutLine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Activity State
const vecA = { x: 4, y: 2 }
const vecB_x = -2
const vecB_y = ref(1) // Slider controls this

const dotProduct = computed(() => {
  return vecA.x * vecB_x + vecA.y * vecB_y.value
})

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  vecB_y.value = 1;
}

function checkAnswer() {
  isChecked.value = true;
  if (dotProduct.value === 0) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect! Het inproduct is 0, de vectoren staan loodrecht.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: `Niet helemaal. Het inproduct is nu ${dotProduct.value}. Het moet 0 zijn.`
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
              
              <div class="font-mono text-sm space-y-2">
                <p><span class="text-blue-600 font-bold">a</span> = ({{ vecA.x }}, {{ vecA.y }})</p>
                <p><span class="text-emerald-600 font-bold">b</span> = ({{ vecB_x }}, {{ vecB_y }})</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Pas y-coördinaat van b aan:</label>
                <input type="range" v-model.number="vecB_y" min="-5" max="8" step="1" class="w-full accent-emerald-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400">
                  <span>-5</span><span>8</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded border border-slate-200">
                <p class="text-sm font-bold text-slate-500 mb-2">Inproduct a · b:</p>
                <p class="font-mono text-sm text-slate-600">(x₁ · x₂) + (y₁ · y₂)</p>
                <p class="font-mono text-sm text-slate-600">({{ vecA.x }} · {{ vecB_x }}) + ({{ vecA.y }} · {{ vecB_y }})</p>
                <p class="font-mono font-bold text-lg text-slate-800 mt-2">= {{ dotProduct }}</p>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" 
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <div class="relative w-80 h-80 flex items-center justify-center">
                <!-- SVG Vector Grid -->
                <svg width="320" height="320" viewBox="-160 -160 320 320" class="overflow-visible bg-white/50 rounded shadow-sm border border-slate-300">
                  <defs>
                    <marker id="head-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                    <marker id="head-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                    </marker>
                  </defs>

                  <!-- Axes -->
                  <line x1="-160" y1="0" x2="160" y2="0" stroke="#cbd5e1" stroke-width="2" />
                  <line x1="0" y1="-160" x2="0" y2="160" stroke="#cbd5e1" stroke-width="2" />
                  
                  <!-- Vector A -->
                  <line x1="0" y1="0" :x2="vecA.x * 20" :y2="-vecA.y * 20" stroke="#2563eb" stroke-width="3" marker-end="url(#head-a)" />
                  <text :x="(vecA.x * 20) + 10" :y="(-vecA.y * 20) + 5" fill="#2563eb" font-weight="bold">a</text>
                  
                  <!-- Vector B -->
                  <line x1="0" y1="0" :x2="vecB_x * 20" :y2="-vecB_y * 20" stroke="#059669" stroke-width="3" marker-end="url(#head-b)" />
                  <text :x="(vecB_x * 20) - 20" :y="(-vecB_y * 20) - 5" fill="#059669" font-weight="bold">b</text>

                  <!-- Right Angle indicator when dotProduct === 0 -->
                  <g v-if="dotProduct === 0">
                    <path d="M 12 -6 L 18 6 L 6 12" fill="none" stroke="#ef4444" stroke-width="2" />
                  </g>
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
    background-size: 20px 20px;
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