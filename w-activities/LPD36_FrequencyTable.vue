<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { 
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhChartBar
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Statistiek: Van Ruwe Data naar Grafiek' },
  instruction: { 
    type: String, 
    default: 'Een tabel met <strong>absolute frequenties</strong> is gewoon een chique woord voor "hoeveel keer komt het voor?". Dit is de eerste stap naar een staafdiagram.<br/><br/><strong>Opdracht:</strong> Tel de huisdieren in de lijst en vul de tabel (absolute frequentie) correct in. Teken daarna de grafiek.' 
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Tel de huisdieren en vul de frequentietabel in.' })

// Domain Logic
const rawData = ['Hond', 'Kat', 'Hond', 'Vis', 'Hond', 'Kat', 'Vogel', 'Kat', 'Kat', 'Vis']
// Counts: Hond:3, Kat:4, Vis:2, Vogel:1

const freqDog = ref(null)
const freqCat = ref(null)
const freqFish = ref(null)
const freqBird = ref(null)

const showGraph = ref(false)

function drawGraph() {
    isChecked.value = true;
    
    if (freqDog.value === 3 && freqCat.value === 4 && freqFish.value === 2 && freqBird.value === 1) {
        isCorrect.value = true
        showGraph.value = true
        feedback.value = { 
          type: 'success', 
          text: 'Uitstekend geteld! De tabel met absolute frequenties is klaar, en het staafdiagram wordt nu automatisch perfect voor jou getekend.' 
        }
    } else {
        isCorrect.value = false
        if (freqDog.value !== 3) feedback.value = { type: 'error', text: 'Tel de Honden nog eens. Streep ze af in je hoofd.'}
        else if (freqCat.value !== 4) feedback.value = { type: 'error', text: 'Tel de Katten nog eens. Het zijn er meer dan je denkt.'}
        else if (freqFish.value !== 2) feedback.value = { type: 'error', text: 'Tel de Vissen nog eens.'}
        else if (freqBird.value !== 1) feedback.value = { type: 'error', text: 'Tel de Vogels nog eens.'}
        else feedback.value = { type: 'error', text: 'Vul alle vakjes in de tabel in.'}
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Tel de huisdieren en vul de frequentietabel in.' };
    freqDog.value = null;
    freqCat.value = null;
    freqFish.value = null;
    freqBird.value = null;
    showGraph.value = false;
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
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
            
            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-indigo-900 mb-4">Tabel (Absolute Freq.):</h4>
               
               <div class="flex flex-col gap-3">
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Hond</span>
                       <input type="number" v-model.number="freqDog" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqDog === 3 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Kat</span>
                       <input type="number" v-model.number="freqCat" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqCat === 4 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Vis</span>
                       <input type="number" v-model.number="freqFish" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqFish === 2 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Vogel</span>
                       <input type="number" v-model.number="freqBird" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqBird === 1 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
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
              <button v-if="!isCorrect" @click="drawGraph" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] flex items-center justify-center gap-2">
                  <PhChartBar weight="bold" /> Teken Grafiek
              </button>
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              
              <div class="w-full max-w-4xl flex items-start justify-center gap-12">
                  
                  <!-- Left: Raw Data Box -->
                  <div class="w-64 bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200 shrink-0">
                      <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Ruwe Data (Enquête)</h4>
                      <div class="flex flex-wrap gap-2">
                          <span v-for="(item, idx) in rawData" :key="idx" class="bg-slate-100 px-3 py-1 rounded font-mono text-sm font-bold text-slate-600 border border-slate-300">{{ item }}</span>
                      </div>
                  </div>

                  <!-- Right: Dynamic Bar Chart -->
                  <div class="flex-1 bg-white p-8 rounded-3xl shadow-xl border-4 border-slate-200 min-h-[400px] relative flex flex-col justify-end"
                       :class="!showGraph ? 'opacity-30 filter blur-sm pointer-events-none' : 'opacity-100'">
                      
                      <div v-if="!showGraph" class="absolute inset-0 flex items-center justify-center z-20">
                          <span class="bg-white/80 backdrop-blur px-6 py-2 rounded-full font-bold text-slate-500 shadow-sm border border-slate-300">Grafiek wordt gegenereerd...</span>
                      </div>

                      <h4 class="absolute top-6 left-8 font-bold text-slate-500 uppercase tracking-widest text-xs">Staafdiagram (Huisdieren)</h4>

                      <!-- Chart Area -->
                      <div class="w-full h-64 border-b-4 border-l-4 border-slate-600 relative flex items-end justify-around px-4 pb-0">
                          
                          <!-- Y-axis Ticks (0 to 5) -->
                          <div class="absolute left-[-20px] top-0 bottom-0 w-4 flex flex-col justify-between items-end font-bold text-xs text-slate-400">
                              <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span>
                          </div>
                          
                          <!-- Grid Lines -->
                          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                              <div v-for="i in 5" :key="i" class="w-full h-0 border-t border-slate-200"></div>
                              <div class="w-full h-0"></div> <!-- Bottom 0 line covered by axis -->
                          </div>

                          <!-- Bars (Height is max 5, so each unit is 20% height) -->
                          <div class="w-16 bg-blue-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-blue-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               :style="{ height: showGraph ? `${(freqDog / 5) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqDog }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Hond</span>
                          </div>

                          <div class="w-16 bg-fuchsia-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-fuchsia-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.2s"
                               :style="{ height: showGraph ? `${(freqCat / 5) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqCat }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Kat</span>
                          </div>

                          <div class="w-16 bg-teal-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-teal-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.4s"
                               :style="{ height: showGraph ? `${(freqFish / 5) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqFish }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Vis</span>
                          </div>

                          <div class="w-16 bg-amber-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-amber-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.6s"
                               :style="{ height: showGraph ? `${(freqBird / 5) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqBird }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Vogel</span>
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