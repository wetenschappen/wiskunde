<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSteps, PhArrowClockwise, PhCaretDoubleRight
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'KGV: De Springende Kikkers' },
  instruction: { 
    type: String, 
    default: 'Het <strong>Kleinste Gemeenschappelijk Veelvoud (KGV)</strong> is het eerste getal waar twee sprongen elkaar overlappen.<br/><br/><strong>Opdracht:</strong> Laat de twee kikkers springen. Op welk getal ontmoeten ze elkaar voor de eerste keer (groter dan 0)?' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSteps }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knoppen om de kikkers te laten springen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Kikkers 4 en 6',
    jump1: 4, jump2: 6, maxPos: 24, targetAns: 12,
    hintCheck: (ans, meet) => {
        if (ans === 24) return '24 is inderdaad een gemeenschappelijk veelvoud (4x6), maar is het de KLEINSTE? Kijk goed naar de stenen ervoor.'
        if (meet) return `Kijk naar je eigen simulatie. Ze ontmoeten elkaar op steen ${meet}. Dat is het juiste antwoord.`
        return 'Dat klopt niet. Gebruik de kikkers om het antwoord visueel te vinden.'
    }
  },
  {
    goalText: 'Opdracht 2: Kikkers 3 en 5',
    jump1: 3, jump2: 5, maxPos: 20, targetAns: 15,
    hintCheck: (ans, meet) => {
        if (meet) return `Kijk naar je simulatie: de overlapping zit op steen ${meet}.`
        return 'Laat beide kikkers springen tot je een overlapping vindt.'
    }
  },
  {
    goalText: 'Opdracht 3: Kikkers 2 en 7',
    jump1: 2, jump2: 7, maxPos: 16, targetAns: 14,
    hintCheck: (ans, meet) => {
        if (meet) return `De overlappende steen is ${meet}.`
        return 'Spring verder met de kikkers!'
    }
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const frog1 = ref({ pos: 0, history: [0] })
const frog2 = ref({ pos: 0, history: [0] })

const userAns = ref(null)

const meetPoint = computed(() => {
    const set1 = new Set(frog1.value.history.filter(x => x > 0))
    const common = frog2.value.history.filter(x => x > 0 && set1.has(x))
    if (common.length > 0) return Math.min(...common)
    return null
})

function jump(frogRef, jumpSize) {
    if (frogRef.value.pos + jumpSize <= currentLevelData.value.maxPos) {
        frogRef.value.pos += jumpSize
        if (!frogRef.value.history.includes(frogRef.value.pos)) {
            frogRef.value.history.push(frogRef.value.pos)
        }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knoppen om de kikkers te laten springen.' };
    frog1.value = { pos: 0, history: [0] }
    frog2.value = { pos: 0, history: [0] }
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === currentLevelData.value.targetAns) {
    if (meetPoint.value === currentLevelData.value.targetAns) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: `Super! De veelvouden kruisen elkaar voor het eerst op ${userAns.value}. KGV is ${userAns.value}.` 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `Het antwoord ${userAns.value} is wiskundig juist, maar simuleer het eerst met de kikkers om het écht te bewijzen!`}
    }
  } else {
    isCorrect.value = false
    feedback.value = { type: 'error', text: currentLevelData.value.hintCheck(userAns.value, meetPoint.value) }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-sky-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-sky-500' : 'bg-slate-200'"></div>
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
            
            <div class="text-center bg-sky-50 p-4 border border-sky-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-sky-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-2">Conclusie:</label>
               <div class="flex items-center gap-2">
                   <span class="font-mono font-bold text-slate-600">KGV({{ currentLevelData.jump1 }}, {{ currentLevelData.jump2 }}) =</span>
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="flex-1 font-bold text-lg p-2 border border-slate-300 rounded focus:border-sky-500 focus:ring-sky-500" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Visual Simulation -->
              <div class="w-full max-w-4xl">
                  
                  <!-- Controls -->
                  <div class="flex justify-center gap-6 mb-12">
                      <button @click="jump(frog1, currentLevelData.jump1)" :disabled="isCorrect || frog1.pos + currentLevelData.jump1 > currentLevelData.maxPos" 
                              class="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-xl shadow-md transition-all active:scale-95">
                          Blauwe Kikker (+{{ currentLevelData.jump1 }}) <PhCaretDoubleRight weight="bold" />
                      </button>
                      <button @click="jump(frog2, currentLevelData.jump2)" :disabled="isCorrect || frog2.pos + currentLevelData.jump2 > currentLevelData.maxPos" 
                              class="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white font-black rounded-xl shadow-md transition-all active:scale-95">
                          Oranje Kikker (+{{ currentLevelData.jump2 }}) <PhCaretDoubleRight weight="bold" />
                      </button>
                  </div>

                  <!-- Number Line (Stepping Stones) -->
                  <div class="relative w-full h-48 flex items-center pt-8">
                      <!-- Water background -->
                      <div class="absolute inset-x-0 h-16 bg-sky-200/50 rounded-full blur-md"></div>
                      
                      <div class="flex w-full justify-between items-center relative z-10">
                          <div v-for="i in (currentLevelData.maxPos + 1)" :key="i" class="flex flex-col items-center justify-center w-8 relative">
                              
                              <!-- History trails -->
                              <div v-if="frog1.history.includes(i-1)" class="absolute -top-16 w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
                              <div v-if="frog2.history.includes(i-1)" class="absolute -bottom-12 w-3 h-3 bg-orange-400 rounded-full shadow-sm"></div>

                              <!-- Meet point highlight -->
                              <div v-if="meetPoint === i-1" class="absolute -inset-2 bg-emerald-400/30 rounded-full animate-pulse z-0"></div>

                              <!-- The Stone -->
                              <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-white shadow-sm z-10"
                                   :class="meetPoint === i-1 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-500'">
                                  {{ i - 1 }}
                              </div>
                          </div>
                      </div>

                      <!-- The Frogs -->
                      <div class="absolute top-0 bottom-0 left-0 right-0 pointer-events-none transition-all duration-500 ease-out z-20">
                          <!-- Blue Frog -->
                          <div class="absolute transition-all duration-500 ease-out flex items-center justify-center w-8 h-8 -top-8"
                               :style="{ left: `calc(${(frog1.pos / currentLevelData.maxPos) * 100}% - 0px)` }">
                              <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md animate-bounce"></div>
                          </div>

                          <!-- Orange Frog -->
                          <div class="absolute transition-all duration-500 ease-out flex items-center justify-center w-8 h-8 bottom-0"
                               :style="{ left: `calc(${(frog2.pos / currentLevelData.maxPos) * 100}% - 0px)` }">
                              <div class="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md animate-bounce" style="animation-delay: 0.1s"></div>
                          </div>
                      </div>

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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>