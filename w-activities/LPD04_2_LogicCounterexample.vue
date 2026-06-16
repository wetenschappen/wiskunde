<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLightning, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Zoek het Tegenvoorbeeld' },
  instruction: { 
    type: String, 
    default: 'Bewijs dat de bewering VALS is. Zoek een getal dat wél voldoet aan de voorwaarde (links van de pijl), maar NIET aan de conclusie (rechts van de pijl). Klik op dat getal.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een getal op de getallenas.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    ruleHTML: 'x² = 36 <span class="text-amber-400">⇒</span> x = 6',
    validate: (x) => (x * x === 36) && (x !== 6),
    hintCond: 'Je getal in het kwadraat is geen 36. Het tegenvoorbeeld moet wél aan x² = 36 voldoen!',
    hintConc: 'Klopt, dat is 6. Maar dit BEVESTIGT zijn theorie! Zoek een ANDER getal waarvan het kwadraat ook 36 is.',
    success: 'BAM! (-6)² is OOK 36! De uitspraak was dus vals, x hoeft niet per se 6 te zijn.'
  },
  {
    ruleHTML: 'x is even <span class="text-amber-400">⇒</span> x is deelbaar door 4',
    validate: (x) => (x % 2 === 0) && (x % 4 !== 0),
    hintCond: 'Je hebt een oneven getal gekozen. Een tegenvoorbeeld moet wel EVEN zijn (om aan de voorwaarde te voldoen).',
    hintConc: 'Dit getal is inderdaad deelbaar door 4. Dit is een BEVESTIGING, geen tegenvoorbeeld. Zoek een even getal dat NIET deelbaar is door 4.',
    success: 'BAM! Dit getal is even, maar NIET deelbaar door 4 (bv. 2, 6, 10). De stelling is vals.'
  },
  {
    ruleHTML: 'x > 0 <span class="text-amber-400">⇒</span> x ≥ 2',
    validate: (x) => (x > 0) && (x < 2),
    hintCond: 'Dit getal is niet groter dan 0. Het moet wel positief zijn om te beginnen.',
    hintConc: 'Dit getal is groter of gelijk aan 2. Dit is een BEVESTIGING. Zoek een getal dat wél > 0 is, maar KLEINER dan 2.',
    success: 'BAM! Het getal 1 is strikt positief, maar is NIET groter of gelijk aan 2. Stelling ontkracht!'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const numbers = Array.from({length: 21}, (_, i) => i - 10) // -10 to 10
const selectedNumber = ref(null)

const ruleShattered = ref(false)

function selectNumber(num) {
    if (isCorrect.value) return;
    selectedNumber.value = num;
    checkAnswer();
}

function checkAnswer() {
  isChecked.value = true;
  const num = selectedNumber.value;
  const target = currentLevelData.value;
  
  if (target.validate(num)) {
    isCorrect.value = true
    ruleShattered.value = true
    feedback.value = { 
      type: 'success', 
      text: target.success
    }
  } else {
    isCorrect.value = false
    
    // Custom hints based on logic error
    // Did they fail the premise?
    let passesPremise = false;
    if (currentInternalLevel.value === 0) passesPremise = (num * num === 36);
    if (currentInternalLevel.value === 1) passesPremise = (num % 2 === 0);
    if (currentInternalLevel.value === 2) passesPremise = (num > 0);

    if (!passesPremise) {
        feedback.value = { type: 'error', text: target.hintCond }
    } else {
        feedback.value = { type: 'error', text: target.hintConc }
    }
  }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer een getal op de getallenas.' };
    selectedNumber.value = null;
    ruleShattered.value = false;
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-600'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="instruction"></div>
            
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
              
              <!-- The Rule to Shatter -->
              <div class="relative mb-24 w-full flex flex-col items-center">
                  
                  <div :key="currentInternalLevel" class="bg-slate-800 border-2 border-slate-600 px-8 py-6 rounded-3xl shadow-2xl relative z-10 transition-all duration-700 ease-in-out animate-fadeIn"
                       :class="ruleShattered ? 'opacity-30 scale-110 filter blur-sm rotate-3' : 'opacity-100 scale-100'">
                      <p class="text-xl text-slate-400 font-bold uppercase tracking-widest mb-2 text-center">Bewering</p>
                      <h1 class="text-2xl md:text-4xl font-black text-center text-white font-mono" v-html="currentLevelData.ruleHTML">
                      </h1>
                  </div>
                  
                  <!-- Shatter lines when rule is broken -->
                  <div v-if="ruleShattered" class="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                      <div class="w-full max-w-xl h-2 bg-amber-400 rotate-12 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]"></div>
                      <div class="absolute w-full max-w-xl h-2 bg-amber-400 -rotate-6 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]" style="animation-delay: 0.1s"></div>
                  </div>
              </div>

              <!-- Interactive Number Line -->
              <div class="w-full max-w-4xl relative px-8 pb-12 transition-opacity" :class="ruleShattered ? 'opacity-50 pointer-events-none' : 'opacity-100'">
                  
                  <div class="absolute left-8 right-8 top-8 h-2 bg-slate-600 rounded-full z-0"></div>

                  <div class="flex justify-between relative z-10">
                      <button v-for="num in numbers" :key="num" 
                              @click="selectNumber(num)"
                              class="relative flex flex-col items-center group outline-none">
                          
                          <!-- The Tick Point -->
                          <div class="w-4 h-4 rounded-full border-4 border-slate-800 transition-all z-20"
                               :class="{
                                   'bg-slate-400 group-hover:bg-amber-400 group-hover:scale-150': selectedNumber !== num,
                                   'bg-emerald-500 border-emerald-200 scale-150 shadow-[0_0_15px_#10b981]': isCorrect && selectedNumber === num,
                                   'bg-red-500 border-red-200 scale-150 shadow-[0_0_15px_#ef4444] animate-shake': !isCorrect && selectedNumber === num
                               }">
                          </div>

                          <!-- The Number Label -->
                          <span class="absolute top-8 font-bold font-mono transition-colors text-sm"
                                :class="selectedNumber === num ? (isCorrect ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500 group-hover:text-amber-400'">
                              {{ num }}
                          </span>

                      </button>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash {
    animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    transform-origin: center;
}
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1;}
    100% { transform: scaleX(1); opacity: 0.8;}
}
</style>