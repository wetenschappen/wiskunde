<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCalculator, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Schatten: De Kapotte Rekenmachine' },
  instruction: { 
    type: String, 
    default: 'Een rekenmachine kan kapot zijn, of je kan zélf per ongeluk een getal verkeerd intypen. Schatten helpt je om <strong>onzin-antwoorden</strong> eruit te filteren!<br/><br/><strong>Opdracht:</strong> Rond de getallen af naar makkelijke tientallen om snel te schatten. Beoordeel daarna of het antwoord van de rekenmachine klopt of pure onzin is.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCalculator }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Rond eerst de getallen af en beslis dan of de rekenmachine de waarheid spreekt.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Optellen',
    num1: 48.2, num2: 21.9, op: '+', calcAns: 701.1, // Nonsense (missing decimal in typist's input: 48.2 + 219 = ...)
    targetRound1: 50, targetRound2: 20, targetVerdict: 'nonsense',
    hint1: 'Kijk naar 48.2. Welk "tiental" ligt het dichtstbij?',
    hint2: 'Kijk naar 21.9. Rond dit ook af naar een makkelijk tiental.',
    successMsg: 'Geweldig! 50 + 20 is ongeveer 70. Het antwoord 701.1 is dus zware ONZIN (waarschijnlijk een typfout). Schatten heeft je gered!'
  },
  {
    goalText: 'Opdracht 2: Aftrekken',
    num1: 102.5, num2: 48.8, op: '-', calcAns: 53.7, // Correct
    targetRound1: 100, targetRound2: 50, targetVerdict: 'correct',
    hint1: 'Rond 102.5 af naar het dichtstbijzijnde honderdtal.',
    hint2: 'Rond 48.8 af naar een makkelijk tiental.',
    successMsg: 'Goed zo! 100 - 50 = 50. Het antwoord 53.7 ligt heel dicht bij je schatting, dus de rekenmachine klopt.'
  },
  {
    goalText: 'Opdracht 3: Vermenigvuldigen',
    num1: 19.8, num2: 5.1, op: '×', calcAns: 1009.8, // Nonsense
    targetRound1: 20, targetRound2: 5, targetVerdict: 'nonsense',
    hint1: 'Rond 19.8 af naar een mooi tiental.',
    hint2: 'Rond 5.1 af naar het dichtstbijzijnde gehele getal.',
    successMsg: 'Perfect! 20 × 5 = 100. Het antwoord 1009.8 is veel te groot (komma vergeten in antwoord?). Onzin dus!'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const userRound1 = ref(null)
const userRound2 = ref(null)
const userVerdict = ref('') // 'correct', 'nonsense'

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Rond eerst de getallen af en beslis dan of de rekenmachine de waarheid spreekt.' };
    userRound1.value = null;
    userRound2.value = null;
    userVerdict.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  
  const data = currentLevelData.value;
  
  if (userRound1.value === data.targetRound1 && userRound2.value === data.targetRound2 && userVerdict.value === data.targetVerdict) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    isCorrect.value = false
    
    if (userRound1.value !== data.targetRound1) {
        feedback.value = { type: 'error', text: data.hint1 }
    } else if (userRound2.value !== data.targetRound2) {
        feedback.value = { type: 'error', text: data.hint2 }
    } else if (userVerdict.value === '') {
        feedback.value = { type: 'error', text: 'Vergeet niet je eindoordeel te geven over de rekenmachine (Klopt / Onzin).'}
    } else {
        feedback.value = { type: 'error', text: `Je afrondingen kloppen (${data.targetRound1} en ${data.targetRound2}). Reken dit uit in je hoofd. Is ${data.calcAns} dan realistisch of niet?`}
    }
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
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
            
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner flex flex-col gap-4">
               
               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-orange-900">Stap 1: Schatting maken</label>
                   <div class="flex items-center gap-2">
                       <input type="number" v-model.number="userRound1" :placeholder="currentLevelData.num1" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-orange-300 rounded focus:border-orange-500 focus:ring-orange-500 text-center" />
                       <span class="font-black text-slate-400">{{ currentLevelData.op }}</span>
                       <input type="number" v-model.number="userRound2" :placeholder="currentLevelData.num2" :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border border-orange-300 rounded focus:border-orange-500 focus:ring-orange-500 text-center" />
                   </div>
               </div>

               <div class="flex flex-col gap-2 border-t border-orange-200 pt-4">
                   <label class="text-sm font-bold text-orange-900">Stap 2: Beoordeling Rekenmachine</label>
                   <div class="flex gap-2">
                       <button @click="userVerdict = 'correct'" :disabled="isCorrect"
                               class="flex-1 py-2 rounded-lg font-bold transition-colors border-2"
                               :class="userVerdict === 'correct' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                           KLOPT
                       </button>
                       <button @click="userVerdict = 'nonsense'" :disabled="isCorrect"
                               class="flex-1 py-2 rounded-lg font-bold transition-colors border-2"
                               :class="userVerdict === 'nonsense' ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                           ONZIN
                       </button>
                   </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (userRound1 === null || userRound2 === null || userVerdict === '')" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- Calculator Visual -->
              <div class="w-72 bg-slate-800 rounded-3xl p-6 shadow-2xl border-b-8 border-slate-900 flex flex-col relative" :class="isCorrect && userVerdict === 'nonsense' ? 'animate-shake' : ''">
                  
                  <div v-if="isCorrect && userVerdict === 'nonsense'" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white font-black px-6 py-2 rounded-full shadow border-4 border-white rotate-12 z-20 whitespace-nowrap text-xl">
                      GEBUISD!
                  </div>
                  
                  <div v-if="isCorrect && userVerdict === 'correct'" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black px-6 py-2 rounded-full shadow border-4 border-white -rotate-6 z-20 whitespace-nowrap text-xl">
                      GOEDGEKEURD!
                  </div>

                  <!-- Screen -->
                  <div class="h-28 bg-[#a3c2b8] rounded-xl border-4 border-slate-700 shadow-inner flex flex-col p-3 mb-6 relative overflow-hidden">
                      <div class="absolute inset-0 opacity-10 bg-stripes pointer-events-none"></div>
                      <span class="text-[10px] font-mono text-slate-600 font-bold">MATH</span>
                      <span class="text-right text-base font-mono text-slate-600 mb-1" :key="currentInternalLevel + 'eq'">{{ currentLevelData.num1 }} {{ currentLevelData.op }} {{ currentLevelData.num2 }}</span>
                      <span class="text-right text-4xl font-mono text-slate-800 font-black mt-auto tracking-widest" :key="currentInternalLevel + 'ans'">{{ currentLevelData.calcAns }}</span>
                  </div>

                  <!-- Buttons Grid -->
                  <div class="grid grid-cols-4 gap-3">
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-slate-600 rounded-lg shadow border-b-4 border-slate-700"></div>
                      <div class="w-full aspect-square bg-orange-500 rounded-lg shadow border-b-4 border-orange-600"></div>

                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-blue-500 rounded-lg shadow border-b-4 border-blue-600"></div>
                      
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-blue-500 rounded-lg shadow border-b-4 border-blue-600"></div>
                      
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-300 rounded-lg shadow border-b-4 border-slate-400"></div>
                      <div class="w-full aspect-square bg-slate-700 rounded-lg shadow border-b-4 border-slate-900 flex items-center justify-center font-black text-white text-2xl">=</div>
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
.bg-stripes { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-2deg); }
  20%, 80% { transform: translate3d(2px, 0, 0) rotate(2deg); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-4deg); }
  40%, 60% { transform: translate3d(4px, 0, 0) rotate(4deg); }
}
</style>