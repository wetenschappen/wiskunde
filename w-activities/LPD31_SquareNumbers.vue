<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhPlus
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Patronen: De Vierhoeksgetallen' },
  instruction: { 
    type: String, 
    default: 'Niet elk patroon is een simpele rechte lijn (linear). Soms groeit iets véél sneller!<br/><br/><strong>Opdracht:</strong> Kijk naar de eerste drie figuren. Hoeveel blokjes zitten er in Figuur 4? En wat is de algemene formule voor Figuur n?' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beantwoord beide vragen om de uitdaging te voltooien.' })

// Domain Logic
const ansFig4 = ref(null)
const ansExp = ref(null)

const showFig4 = ref(false)

function checkAnswer() {
  isChecked.value = true;
  
  if (ansFig4.value === 16 && ansExp.value === 2) {
    isCorrect.value = true
    showFig4.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Magistraal! Dit zijn de "vierkantsgetallen" (1, 4, 9, 16...). Ze groeien kwadratisch. De formule voor Figuur n is n².' 
    }
  } else {
    isCorrect.value = false
    
    if (ansFig4.value !== 16) {
        if (ansFig4.value === 12) {
            feedback.value = { type: 'error', text: 'Je hebt bij Figuur 3 (9) waarschijnlijk 3 geteld en op 12 uitgekomen. Maar bedenk: Figuur 1 is 1x1, Fig 2 is 2x2, Fig 3 is 3x3. Wat wordt Figuur 4?'}
        } else {
            feedback.value = { type: 'error', text: 'Het aantal blokjes in Figuur 4 klopt niet. Welke vierkante vorm (LxB) krijgt figuur 4?'}
        }
    } else if (ansExp.value !== 2) {
        feedback.value = { type: 'error', text: 'Figuur 4 (16) is correct! Maar wat is de exponent in de algemene formule? Wat doe je met het figuurnummer (n) om het aantal blokjes te krijgen? n tot de macht...'}
    }
  }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Beantwoord beide vragen om de uitdaging te voltooien.' };
    ansFig4.value = null;
    ansExp.value = null;
    showFig4.value = false;
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
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
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
            
            <div class="p-4 mt-6 border border-pink-200 bg-pink-50 rounded-xl shadow-inner flex flex-col gap-6">
               
               <!-- Q1 -->
               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-pink-900">1. Hoeveel blokjes in Figuur 4?</label>
                   <div class="flex items-center gap-2">
                       <input type="number" v-model.number="ansFig4" placeholder="..." :disabled="isCorrect"
                              class="w-full font-bold text-lg p-2 border-2 border-pink-300 rounded focus:border-pink-500 text-center" />
                   </div>
               </div>

               <!-- Q2 -->
               <div class="flex flex-col gap-2 border-t border-pink-200 pt-4">
                   <label class="text-sm font-bold text-pink-900">2. Algemene Formule (Figuur n):</label>
                   <div class="flex items-center justify-center gap-2 font-black text-3xl text-slate-700 bg-white p-3 rounded-lg border border-pink-200">
                       <span>A = n</span>
                       <input type="number" v-model.number="ansExp" placeholder="?" :disabled="isCorrect"
                              class="w-16 font-bold text-xl p-1 -mt-4 border-b-2 border-pink-300 focus:border-pink-500 focus:outline-none text-center text-pink-600" />
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (ansFig4 === null || ansExp === null)" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Patroon</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex items-end justify-center gap-8 min-h-[300px]">
                  
                  <!-- Figure 1 -->
                  <div class="flex flex-col items-center gap-4">
                      <div class="grid grid-cols-1 gap-1">
                          <div class="w-10 h-10 bg-pink-500 border-2 border-pink-700 rounded-sm shadow-sm"></div>
                      </div>
                      <span class="font-bold text-slate-500 uppercase text-xs tracking-widest">Fig 1</span>
                  </div>

                  <!-- Figure 2 -->
                  <div class="flex flex-col items-center gap-4">
                      <div class="grid grid-cols-2 gap-1">
                          <div v-for="i in 4" :key="'f2'+i" class="w-10 h-10 bg-pink-500 border-2 border-pink-700 rounded-sm shadow-sm"></div>
                      </div>
                      <span class="font-bold text-slate-500 uppercase text-xs tracking-widest">Fig 2</span>
                  </div>

                  <!-- Figure 3 -->
                  <div class="flex flex-col items-center gap-4">
                      <div class="grid grid-cols-3 gap-1">
                          <div v-for="i in 9" :key="'f3'+i" class="w-10 h-10 bg-pink-500 border-2 border-pink-700 rounded-sm shadow-sm"></div>
                      </div>
                      <span class="font-bold text-slate-500 uppercase text-xs tracking-widest">Fig 3</span>
                  </div>

                  <!-- Figure 4 (Hidden or Revealed) -->
                  <div class="flex flex-col items-center gap-4 transition-all duration-1000" :class="showFig4 ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4 filter blur-sm'">
                      <div v-if="!showFig4" class="w-[176px] h-[176px] border-4 border-dashed border-pink-300 rounded-xl flex items-center justify-center bg-pink-50">
                          <span class="font-black text-4xl text-pink-300">?</span>
                      </div>
                      <div v-else class="grid grid-cols-4 gap-1 animate-fadeIn">
                          <div v-for="i in 16" :key="'f4'+i" class="w-10 h-10 bg-emerald-500 border-2 border-emerald-700 rounded-sm shadow-sm" :style="`animation-delay: ${i*0.05}s`"></div>
                      </div>
                      <span class="font-bold text-slate-500 uppercase text-xs tracking-widest" :class="showFig4 ? '!text-emerald-600' : ''">Fig 4</span>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>