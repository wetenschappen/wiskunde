<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGhost, PhArrowClockwise, PhArrowsInLineHorizontal
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Producten: (a+b)(a-b)' },
  instruction: { 
    type: String, 
    default: 'Als we de haakjes van <strong>(a+b)(a-b)</strong> uitvermenigvuldigen, krijgen we 4 termen: <strong>a² - ab + ba - b²</strong>. Omdat ab hetzelfde is als ba, kunnen we dit korter schrijven!<br/><br/><strong>Opdracht:</strong> Wat gebeurt er met de termen -ab en +ab? Laat ze met elkaar botsen om het eindresultaat (verschil van twee kwadraten) over te houden.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGhost }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de tegengestelde termen te vernietigen.' })

// Domain Logic
const isAnnihilated = ref(false)
const userAns = ref('')

function annihilateTerms() {
    if (isCorrect.value) return;
    isAnnihilated.value = true
    feedback.value = { type: 'success', text: 'BAM! Omdat -ab en +ab elkaars tegengestelde zijn, heffen ze elkaar perfect op (het wordt 0). Welke formule blijft er over?' }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de tegengestelde termen te vernietigen.' };
    isAnnihilated.value = false;
    userAns.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === 'correct') {
    if (isAnnihilated.value) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: 'Super! Je houdt enkel a² - b² over. Dit noemen we het "verschil van twee kwadraten". Dit is de snelste manier om (a+b)(a-b) op te lossen!' 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'De formule klopt, maar voer eerst de botsing uit met de knop!'}
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 'wrong1') {
        feedback.value = { type: 'error', text: 'Kijk naar de blokken die overblijven. Waar staat het minteken?'}
    } else if (userAns.value === 'wrong2') {
        feedback.value = { type: 'error', text: 'Je hebt de middelste termen vermenigvuldigd i.p.v. opgeteld. -ab + ab is gewoon NUL! Ze verdwijnen compleet.'}
    } else {
        feedback.value = { type: 'error', text: 'Kies een formule uit de lijst.'}
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-slate-300 mb-2">Conclusie: (a+b)(a-b) = ...</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-500 bg-slate-900 text-white rounded-lg focus:ring-orange-500 focus:border-orange-500 font-bold">
                   <option value="" disabled>Kies de juiste formule...</option>
                   <option value="wrong1">a² + b²</option>
                   <option value="correct">a² - b²</option>
                   <option value="wrong2">a² - a²b² - b²</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 rounded-lg" :class="(isChecked && !isCorrect && userAns === '') ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-orange-500 border-orange-700 text-white hover:bg-orange-400'">Controleer Formule</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
              
              <div class="w-full max-w-4xl flex flex-col items-center">
                  
                  <div class="mb-12">
                      <button @click="annihilateTerms" :disabled="isCorrect || isAnnihilated" 
                              class="px-6 py-3 font-bold bg-white text-orange-600 border-2 border-orange-500 rounded-xl shadow-lg flex items-center gap-2 hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600">
                          <PhArrowsInLineHorizontal weight="bold" class="w-6 h-6" /> Botsing: Vernietig Tegengestelden
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <!-- 4 blocks representing the terms. -->
                  <!-- [a2]  [-ab]  [+ab]  [-b2] -->
                  <div class="relative w-full max-w-2xl h-48 bg-slate-800 border-4 border-slate-700 rounded-2xl shadow-xl flex items-center justify-between px-8 overflow-hidden">
                      
                      <!-- Block 1: a^2 -->
                      <div class="w-24 h-24 bg-blue-500/20 border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-lg transition-transform" :class="isAnnihilated ? 'translate-x-12' : ''">
                          <span class="font-black text-3xl text-blue-400">a²</span>
                      </div>

                      <!-- Block 2: -ab -->
                      <!-- Moves right when annihilated -->
                      <div class="absolute left-[30%] w-24 h-24 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-700 ease-in"
                           :class="isAnnihilated ? 'translate-x-[150px] opacity-0 scale-50 rotate-45' : ''">
                          <span class="font-black text-3xl text-red-400">-ab</span>
                      </div>

                      <!-- Block 3: +ab -->
                      <!-- Moves left when annihilated -->
                      <div class="absolute right-[30%] w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-700 ease-in"
                           :class="isAnnihilated ? '-translate-x-[150px] opacity-0 scale-50 -rotate-45' : ''">
                          <span class="font-black text-3xl text-emerald-400">+ab</span>
                      </div>

                      <!-- Explosion effect -->
                      <div v-if="isAnnihilated" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div class="w-32 h-32 bg-orange-500 rounded-full mix-blend-screen filter blur-xl animate-pulse opacity-0" style="animation: explode 1s ease-out forwards;"></div>
                      </div>

                      <!-- Block 4: -b^2 -->
                      <div class="w-24 h-24 bg-pink-500/20 border-2 border-pink-500 rounded-lg flex items-center justify-center shadow-lg transition-transform" :class="isAnnihilated ? '-translate-x-12' : ''">
                          <span class="font-black text-3xl text-pink-400">-b²</span>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@keyframes explode {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.8; }
    100% { transform: scale(2); opacity: 0; }
}
</style>