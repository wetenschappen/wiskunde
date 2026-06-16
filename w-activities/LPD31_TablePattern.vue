<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhPlus
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Patronen: De Groeiende Tafels' },
  instruction: { 
    type: String, 
    default: 'Een restaurant schuift vierkante tafels tegen elkaar om lange rijen te maken.<br/><br/><strong>Opdracht:</strong> Voeg tafels toe. Tel hoeveel stoelen er telkens rond de tafelrij passen. Probeer daarna de algemene formule op te stellen voor het aantal stoelen (S) bij "t" tafels.' 
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Voeg Tafel Toe" om het patroon te ontdekken.' })

// Domain Logic
const tables = ref(1) // 1 to 4
const maxTables = 4

const multValue = ref(null) // Should be 2
const addValue = ref(null) // Should be 2

const chairs = computed(() => {
    // 1 table: 4. 2 tables: 6. 3 tables: 8.
    return (tables.value * 2) + 2
})

function addTable() {
    if (tables.value < maxTables && !isCorrect.value) {
        tables.value++
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op "Voeg Tafel Toe" om het patroon te ontdekken.' };
    tables.value = 1;
    multValue.value = null;
    addValue.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  
  if (multValue.value === 2 && addValue.value === 2) {
    if (tables.value > 1) {
        isCorrect.value = true
        feedback.value = { 
          type: 'success', 
          text: 'Perfect! Elke extra tafel brengt 2 nieuwe stoelen mee (de zijkanten). En de 2 "hoofden" van de tafel zitten er altijd aan het begin en einde (+ 2). De formule is S = 2t + 2.' 
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'Je formule is correct! Maar voeg eerst tafels toe in de animatie om het met je eigen ogen te zien gebeuren.'}
    }
  } else {
    isCorrect.value = false
    
    if (multValue.value === 4) {
        feedback.value = { type: 'error', text: 'Je koos 4t. 1 tafel heeft inderdaad 4 stoelen. Maar hebben 2 tafels samen 8 stoelen? Kijk goed, ze verliezen stoelen waar ze tegen elkaar staan!'}
    } else if (multValue.value === 2 && addValue.value !== 2) {
        feedback.value = { type: 'error', text: 'Je ziet goed dat er telkens 2 stoelen (boven en onder) bijkomen per tafel! Maar wat mis je dan nog? (Kijk naar de zijkanten helemaal links en rechts).'}
    } else {
        feedback.value = { type: 'error', text: 'Kijk naar de toename. Als je van 1 naar 2 tafels gaat, hoeveel stoelen komen er dan ECHT bij? Dat getal hoort voor de t.'}
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
            
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-teal-900 mb-2">Formule voor aantal Stoelen (S):</label>
               
               <div class="flex items-center justify-center gap-2 text-2xl font-black text-slate-700 mb-2">
                   <span>S = </span>
                   <input type="number" v-model.number="multValue" placeholder="?" :disabled="isCorrect"
                          class="w-16 font-bold text-xl p-2 border-2 border-teal-400 rounded focus:border-teal-500 focus:ring-teal-500 text-center bg-white" />
                   <span>· t + </span>
                   <input type="number" v-model.number="addValue" placeholder="?" :disabled="isCorrect"
                          class="w-16 font-bold text-xl p-2 border-2 border-teal-400 rounded focus:border-teal-500 focus:ring-teal-500 text-center bg-white" />
               </div>
               <p class="text-xs text-teal-700 text-center mt-2 italic">(waarbij t = aantal tafels)</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (multValue === null || addValue === null)" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Formule</button>
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
                      <button @click="addTable" :disabled="isCorrect || tables >= maxTables" 
                              class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                          <PhPlus weight="bold" class="w-6 h-6" /> Voeg Tafel Toe
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <!-- Top down view. Table = brown square. Chair = small grey circle/oval. -->
                  <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-12 min-h-[300px] flex items-center justify-center w-full max-w-3xl transition-all">
                      
                      <!-- Container for the tables to keep them centered -->
                      <div class="flex relative items-center justify-center transition-all duration-500" :style="{ width: `${tables * 100}px` }">
                          
                          <!-- Left Head Chair -->
                          <div class="w-6 h-12 bg-slate-300 border-2 border-slate-400 rounded-l-full absolute -left-8 transition-all duration-500 shadow-sm"></div>

                          <!-- Tables and Top/Bottom Chairs -->
                          <div v-for="t in tables" :key="'t'+t" class="relative w-[100px] h-[100px] bg-amber-700 border-x border-amber-900 flex shrink-0 animate-fadeIn" style="box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                              
                              <!-- Top Chair -->
                              <div class="w-12 h-6 bg-blue-300 border-2 border-blue-500 rounded-t-full absolute -top-8 left-1/2 -translate-x-1/2 shadow-sm"></div>
                              
                              <!-- Bottom Chair -->
                              <div class="w-12 h-6 bg-blue-300 border-2 border-blue-500 rounded-b-full absolute -bottom-8 left-1/2 -translate-x-1/2 shadow-sm"></div>
                              
                          </div>

                          <!-- Right Head Chair -->
                          <div class="w-6 h-12 bg-slate-300 border-2 border-slate-400 rounded-r-full absolute -right-8 transition-all duration-500 shadow-sm"></div>

                      </div>

                  </div>

                  <!-- Real-time data table to help them -->
                  <div class="mt-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-8">
                      <div class="flex flex-col items-center">
                          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tafels (t)</span>
                          <span class="font-black text-2xl text-amber-700">{{ tables }}</span>
                      </div>
                      <div class="w-px bg-slate-200"></div>
                      <div class="flex flex-col items-center">
                          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stoelen (S)</span>
                          <span class="font-black text-2xl text-blue-600 animate-pulse" :key="chairs">{{ chairs }}</span>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>