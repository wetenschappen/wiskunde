<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPercent, PhArrowClockwise, PhScissors
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten: De Korting' },
  instruction: { 
    type: String, 
    default: 'Met het strokenmodel (Bar Model) zie je procenten heel duidelijk voor je.<br/><br/><strong>Opdracht:</strong> Gebruik het model om de korting te visualiseren. Verwijder de juiste blokjes korting door op de schaar te klikken. Bereken daarna de nieuwe prijs.' 
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
const feedback = ref({ type: 'info', text: 'Klik op de knop om de korting af te knippen.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: 20% korting op €80',
    originalPrice: 80,
    discountPercent: 20,
    exactAns: 64,
    hintCut: 'Klik op de knop om 20% (2 blokjes van 10%) af te knippen.',
    hintCalc: '100% is €80. Eén blokje (10%) is dus €8. Je hebt 8 blauwe blokjes over. 8 × 8 = ...'
  },
  {
    goalText: 'Opdracht 2: 30% korting op €150',
    originalPrice: 150,
    discountPercent: 30,
    exactAns: 105,
    hintCut: 'Klik op de schaar om 30% af te knippen.',
    hintCalc: '100% is €150. Eén blokje is €15. Je houdt 7 blokjes over (70%). 7 × 15 = ...'
  },
  {
    goalText: 'Opdracht 3: 40% korting op €50',
    originalPrice: 50,
    discountPercent: 40,
    exactAns: 30,
    hintCut: 'Snijd 40% van de strook af.',
    hintCalc: '100% is €50. Eén blokje is €5. Hoeveel is 60% dan?'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const blocksTotal = 10 // Each block is 10%

const discountApplied = ref(false)
const userAns = ref(null)

const pricePerBlock = computed(() => currentLevelData.value.originalPrice / blocksTotal)
const discountBlocks = computed(() => currentLevelData.value.discountPercent / 10)
const remainingBlocks = computed(() => blocksTotal - discountBlocks.value)

function applyDiscount() {
    discountApplied.value = true
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de korting af te knippen.' };
    discountApplied.value = false;
    userAns.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === currentLevelData.value.exactAns) {
    if (discountApplied.value) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: `Super! 100% was €${currentLevelData.value.originalPrice}. Eén blokje (10%) is €${pricePerBlock.value}. Je betaalt nog ${remainingBlocks.value * 10}% (${remainingBlocks.value} blokjes), dus ${remainingBlocks.value} × ${pricePerBlock.value} = €${currentLevelData.value.exactAns}.` 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${currentLevelData.value.exactAns} is correct, maar knip eerst de korting af in het visuele model!`}
    }
  } else {
    isCorrect.value = false
    
    const discountAmount = pricePerBlock.value * discountBlocks.value;
    
    if (userAns.value === discountAmount) {
        feedback.value = { type: 'error', text: `€${discountAmount} is de KORTING (${discountBlocks.value} blokjes). Maar wat is de NIEUWE PRIJS die je moet betalen (de overgebleven blauwe blokjes)?`}
    } else if (userAns.value === pricePerBlock.value) {
        feedback.value = { type: 'error', text: `€${pricePerBlock.value} is de waarde van slechts 1 blokje (10%). Je moet de resterende ${remainingBlocks.value * 10}% betalen.`}
    } else {
        feedback.value = { type: 'error', text: `Reken het nog eens na. Tel hoeveel blauwe blokjes er nog over zijn. Elk blokje is €${pricePerBlock.value} waard. ${currentLevelData.value.hintCalc}`}
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
            
            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>
            
            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-indigo-900 mb-2">Nieuwe Prijs:</label>
               <div class="flex items-center gap-2">
                   <span class="font-black text-2xl text-slate-500">€</span>
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white" />
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
              
              <!-- The Bar Model -->
              <div class="w-full max-w-4xl relative">
                  
                  <!-- Total Label -->
                  <div class="absolute -top-10 left-0 w-full flex flex-col items-center">
                      <div class="w-full h-4 border-t-2 border-x-2 border-slate-400 rounded-t-lg mb-1 relative">
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-xl text-slate-700">100% = €{{ currentLevelData.originalPrice }}</span>
                      </div>
                  </div>

                  <!-- The Bar Blocks -->
                  <div class="flex h-24 border-4 border-slate-700 rounded-xl shadow-lg bg-white relative overflow-hidden">
                      <div v-for="i in blocksTotal" :key="'block'+i" class="flex-1 border-r-2 border-slate-300 last:border-r-0 relative transition-all duration-700"
                           :class="i > remainingBlocks && discountApplied ? 'bg-red-100 translate-y-full opacity-0' : 'bg-blue-500'">
                          
                          <!-- Inner block label -->
                          <div class="absolute inset-0 flex flex-col items-center justify-center">
                              <span class="font-bold text-white/80 text-sm">10%</span>
                          </div>

                      </div>
                  </div>

                  <!-- Price helper labels below -->
                  <div v-if="discountApplied" class="absolute -bottom-16 left-0 flex flex-col items-center animate-fadeIn"
                       :style="{ width: `${remainingBlocks * 10}%` }">
                      <div class="w-full h-4 border-b-2 border-x-2 border-indigo-500 rounded-b-lg mt-1 relative">
                          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-lg text-indigo-700 whitespace-nowrap">{{ remainingBlocks * 10 }}% = Nieuwe Prijs</span>
                      </div>
                  </div>

                  <div v-if="discountApplied" class="absolute -bottom-16 right-0 flex flex-col items-center animate-fadeIn"
                       :style="{ width: `${discountBlocks * 10}%` }">
                      <div class="w-full h-4 border-b-2 border-x-2 border-red-500 rounded-b-lg mt-1 relative">
                          <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-lg text-red-600 whitespace-nowrap">{{ currentLevelData.discountPercent }}% = Korting</span>
                      </div>
                  </div>

                  <!-- Scissors Button -->
                  <button v-if="!discountApplied" @click="applyDiscount" 
                          class="absolute -bottom-16 bg-white border-2 border-red-500 text-red-600 font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                          :style="{ right: `0`, transform: `translateX(calc(-${(discountBlocks/2)*10}vw + 50%))` }">
                      <PhScissors weight="fill" class="w-6 h-6" /> Knip {{ currentLevelData.discountPercent }}% af
                  </button>

                  <!-- The cut line -->
                  <div v-if="!discountApplied" class="absolute top-0 bottom-0 w-1 bg-red-500 border-x border-white/50 border-dashed pointer-events-none" 
                       :style="{ right: `${discountBlocks * 10}%` }"></div>

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