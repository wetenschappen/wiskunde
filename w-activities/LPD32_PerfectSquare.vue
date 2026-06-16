<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhHandGrabbing
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Producten: (a+b)²' },
  instruction: { 
    type: String, 
    default: 'Een van de meest gemaakte fouten in de wiskunde is denken dat <strong>(a + b)²</strong> gelijk is aan <strong>a² + b²</strong>. Dat is pertinent FOUT!<br/><br/><strong>Opdracht:</strong> We berekenen (a+b)² door een vierkant met zijde (a+b) te tekenen. Schuif de stukken uit elkaar om de ECHTE formule te ontdekken.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om het grote vierkant te splitsen in zijn kleine onderdelen.' })

// Domain Logic
const isSplit = ref(false)
const userAns = ref('')

function splitSquare() {
    if (isCorrect.value) return;
    isSplit.value = true
    feedback.value = { type: 'success', text: 'Kijk! Als je (a+b)² opdeelt, zie je inderdaad a² (blauw) en b² (roze). Maar je ziet ook nog twee extra blokken (oranje). Welke formule klopt?' }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om het grote vierkant te splitsen in zijn kleine onderdelen.' };
    isSplit.value = false;
    userAns.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  
  if (userAns.value === 'correct') {
    if (isSplit.value) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: 'Briljant! Je ziet visueel dat je TWEE rechthoeken van (a × b) krijgt. Dus (a+b)² = a² + 2ab + b².' 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'Het antwoord is juist! Maar klik eerst op de knop "Splits Vierkant" om het visueel te bewijzen.'}
    }
  } else {
    isCorrect.value = false
    
    if (userAns.value === 'wrong1') {
        feedback.value = { type: 'error', text: 'Kijk goed naar de puzzelstukken. Naast a² en b² heb je niet 1, maar 2 oranje rechthoeken!'}
    } else if (userAns.value === 'wrong2') {
        feedback.value = { type: 'error', text: 'Dat is precies de fout die we wilden aantonen! Als je a² + b² doet, mis je de twee oranje rechthoeken (ab) compleet.'}
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">
      
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
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
            
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-teal-900 mb-2">Conclusie: (a + b)² = ...</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies de juiste formule...</option>
                   <option value="wrong2">a² + b²</option>
                   <option value="wrong1">a² + ab + b²</option>
                   <option value="correct">a² + 2ab + b²</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Formule</button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex flex-col items-center">
                  
                  <div class="mb-12">
                      <button @click="splitSquare" :disabled="isCorrect || isSplit" 
                              class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                          <PhHandGrabbing weight="bold" class="w-6 h-6" /> Splits Vierkant
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <!-- A square of size a+b by a+b. Let a=200px, b=100px. -->
                  <div class="relative bg-white shadow-xl rounded-2xl border-4 border-slate-300 p-12 flex items-center justify-center">
                      
                      <div class="relative w-[300px] h-[300px]">
                          
                          <!-- Top Left: a * a (200x200) -->
                          <div class="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-100 border-4 border-blue-500 flex items-center justify-center transition-all duration-700 ease-in-out shadow-sm"
                               :class="isSplit ? '-translate-x-4 -translate-y-4' : ''">
                              <span class="font-black text-4xl text-blue-600">a²</span>
                          </div>

                          <!-- Top Right: b * a (100x200) -->
                          <div class="absolute top-0 left-[200px] w-[100px] h-[200px] bg-orange-100 border-4 border-orange-500 flex items-center justify-center transition-all duration-700 ease-in-out shadow-sm"
                               :class="isSplit ? 'translate-x-4 -translate-y-4' : ''">
                              <span class="font-black text-2xl text-orange-600">ab</span>
                          </div>

                          <!-- Bottom Left: a * b (200x100) -->
                          <div class="absolute top-[200px] left-0 w-[200px] h-[100px] bg-orange-100 border-4 border-orange-500 flex items-center justify-center transition-all duration-700 ease-in-out shadow-sm"
                               :class="isSplit ? '-translate-x-4 translate-y-4' : ''">
                              <span class="font-black text-2xl text-orange-600">ab</span>
                          </div>

                          <!-- Bottom Right: b * b (100x100) -->
                          <div class="absolute top-[200px] left-[200px] w-[100px] h-[100px] bg-pink-100 border-4 border-pink-500 flex items-center justify-center transition-all duration-700 ease-in-out shadow-sm"
                               :class="isSplit ? 'translate-x-4 translate-y-4' : ''">
                              <span class="font-black text-2xl text-pink-600">b²</span>
                          </div>

                          <!-- Exterior Labels (Only visible when NOT split) -->
                          <div class="absolute -top-8 left-[100px] font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'">a</div>
                          <div class="absolute -top-8 left-[250px] font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'">b</div>
                          
                          <div class="absolute top-[100px] -left-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'">a</div>
                          <div class="absolute top-[250px] -left-8 font-black text-xl text-slate-500 transition-opacity" :class="isSplit ? 'opacity-0' : 'opacity-100'">b</div>

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