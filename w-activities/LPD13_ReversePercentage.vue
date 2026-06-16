<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPercent, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten: Terugrekenen' },
  instruction: { 
    type: String, 
    default: 'Terugrekenen is vaak moeilijk. We gebruiken het strokenmodel (Bar Model) om het visueel op te lossen.<br/><br/><strong>Opdracht:</strong> Los de som op door eerst de waarde van 1 blokje uit te rekenen, en daarna de originele 100% te berekenen.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhPercent }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk naar de strook. Hoeveel blokjes stellen de nieuwe prijs voor?' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Na 25% korting kost een jas nog €60. Wat was de beginprijs?',
    discountPercent: 25,
    newPrice: 60,
    ansBlockExact: 20, // 60 / 3
    ansTotalExact: 80, // 4 * 20
    blocksRemaining: 3, // 75% -> 3 blocks of 25%
    blocksTotal: 4, // 100% -> 4 blocks of 25%
    hintBlock: 'Kijk goed naar de blauwe blokjes. Drie blokjes samen zijn €60. Hoeveel is één blokje dan? (60 ÷ 3)',
    hintTotal: 'Je hebt correct berekend dat 1 blokje €20 is! De originele prijs (100%) bestaat uit 4 blokjes. Wat is 4 × 20?'
  },
  {
    goalText: 'Na 20% korting kost een gsm nog €400. Wat was de beginprijs?',
    discountPercent: 20,
    newPrice: 400,
    ansBlockExact: 100, // 400 / 4
    ansTotalExact: 500, // 5 * 100
    blocksRemaining: 4, // 80% -> 4 blocks of 20%
    blocksTotal: 5, // 100% -> 5 blocks of 20%
    hintBlock: 'Vier blauwe blokjes samen (80%) zijn €400. Hoeveel is één zo\'n blokje (20%) waard? (400 ÷ 4)',
    hintTotal: '1 blokje is €100. Maar in totaal was de prijs 5 blokjes (100%). Wat is 5 × 100?'
  },
  {
    goalText: 'Na 40% korting kost een broek nog €30. Wat was de beginprijs?',
    discountPercent: 40,
    newPrice: 30,
    ansBlockExact: 10, // 30 / 3
    ansTotalExact: 50, // 5 * 10
    blocksRemaining: 3, // 60% -> 3 blocks of 20%
    blocksTotal: 5, // 100% -> 5 blocks of 20%
    hintBlock: 'De overgebleven 60% stellen we hier voor als 3 blauwe blokjes van 20%. Samen zijn ze €30. Hoeveel is 1 blokje (20%)?',
    hintTotal: '1 blokje (20%) is €10. De originele 100% zijn 5 blokjes van 20%. Wat is 5 × 10?'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const ansBlock = ref(null)
const ansTotal = ref(null)

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kijk naar de strook. Hoeveel blokjes stellen de nieuwe prijs voor?' };
    ansBlock.value = null;
    ansTotal.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (ansBlock.value === currentLevelData.value.ansBlockExact && ansTotal.value === currentLevelData.value.ansTotalExact) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: `Briljant! ${currentLevelData.value.blocksRemaining} blokjes = €${currentLevelData.value.newPrice}. Dus 1 blokje = €${currentLevelData.value.ansBlockExact}. De totale 100% is dan ${currentLevelData.value.blocksTotal} × ${currentLevelData.value.ansBlockExact} = €${currentLevelData.value.ansTotalExact}.` 
    }
  } else {
    isCorrect.value = false
    
    if (ansBlock.value !== currentLevelData.value.ansBlockExact) {
        feedback.value = { type: 'error', text: currentLevelData.value.hintBlock }
    } else if (ansTotal.value !== currentLevelData.value.ansTotalExact) {
        feedback.value = { type: 'error', text: currentLevelData.value.hintTotal }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" 
                     class="w-2 h-2 rounded-full" 
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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
            
            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner flex flex-col gap-4">
               
               <p class="font-bold text-indigo-900">{{ currentLevelData.goalText }}</p>

               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-indigo-800">Stap 1: Waarde van 1 blokje</label>
                   <div class="flex items-center gap-2">
                       <span class="font-black text-xl text-slate-500">€</span>
                       <input type="number" v-model.number="ansBlock" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-xl p-2 border border-indigo-300 rounded focus:border-indigo-500 focus:ring-indigo-500 bg-white" />
                   </div>
               </div>

               <div class="flex flex-col gap-2 border-t border-indigo-200 pt-4">
                   <label class="text-sm font-bold text-indigo-800">Stap 2: Originele prijs (100%)</label>
                   <div class="flex items-center gap-2">
                       <span class="font-black text-2xl text-slate-500">€</span>
                       <input type="number" v-model.number="ansTotal" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-2xl p-3 border-2 border-indigo-400 rounded-lg focus:border-indigo-600 focus:ring-indigo-600 bg-white" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (ansBlock === null || ansTotal === null)" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <!-- The Bar Model -->
              <div class="w-full max-w-4xl relative">
                  
                  <!-- Total Label -->
                  <div class="absolute -top-10 left-0 w-full flex flex-col items-center">
                      <div class="w-full h-4 border-t-2 border-x-2 border-slate-400 rounded-t-lg mb-1 relative">
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-xl text-slate-700 whitespace-nowrap">
                              100% = Originele Prijs (?)
                          </span>
                      </div>
                  </div>

                  <!-- The Bar Blocks -->
                  <div class="flex h-24 border-4 border-slate-700 rounded-xl shadow-lg bg-white relative overflow-hidden">
                      
                      <!-- Remaining Blocks (e.g. 3 blocks = 75%) -->
                      <div v-for="i in currentLevelData.blocksRemaining" :key="'b'+i" class="border-r-2 border-slate-700 bg-blue-500 relative flex items-center justify-center"
                           :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                          <span class="font-bold text-white/80 text-lg">{{ 100 / currentLevelData.blocksTotal }}%</span>
                          <span v-if="ansBlock" class="absolute bottom-2 font-black text-white bg-slate-800/30 px-2 rounded-full animate-fadeIn">€{{ ansBlock }}</span>
                      </div>

                      <!-- Discount Blocks (e.g. 1 block = 25%) -->
                      <div v-for="i in (currentLevelData.blocksTotal - currentLevelData.blocksRemaining)" :key="'d'+i" class="border-r-2 border-slate-700 bg-red-100 relative flex items-center justify-center pattern-diagonal"
                           :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                          <span class="font-bold text-red-500 text-lg bg-white/80 px-2 rounded">{{ 100 / currentLevelData.blocksTotal }}% (Korting)</span>
                          <span v-if="ansBlock" class="absolute bottom-2 font-black text-red-500 bg-white/80 px-2 rounded-full animate-fadeIn">€{{ ansBlock }}</span>
                      </div>

                  </div>

                  <!-- Price helper labels below -->
                  <div class="absolute -bottom-16 left-0 flex flex-col items-center" :style="{ width: `${(currentLevelData.blocksRemaining / currentLevelData.blocksTotal) * 100}%` }">
                      <div class="w-full h-4 border-b-4 border-x-4 border-indigo-500 rounded-b-xl mt-1 relative">
                          <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-50 px-4 py-1 rounded-full font-black text-2xl text-indigo-700 shadow-sm border border-indigo-200 whitespace-nowrap">
                              Nieuw = €{{ currentLevelData.newPrice }}
                          </span>
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
.pattern-diagonal { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.2) 10px, rgba(239, 68, 68, 0.2) 20px); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>