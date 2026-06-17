<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhArrowsLeftRight
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Heuristieken: De Boer en de Rivier' },
  instruction: {
    type: String,
    default: 'Soms moet je in wiskunde geen direct antwoord berekenen, maar een probleem oplossen door eerst wat te proberen. Schuif het hek heen en weer om de <strong>maximale oppervlakte</strong> te vinden!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om te testen. Vul daarna je maximale oppervlakte in.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel(index) {
  let totalFence, hasRiver, maxArea, minX, maxX
  switch (index) {
    case 0:
      totalFence = Math.floor(Math.random() * 7) * 2 + 16 // 16, 18, 20, 22, 24, 26, 28
      hasRiver = true
      // For river: area = x * (total - 2x). Max at x = total/4.
      // maxArea = (total/4) * (total - total/2) = total/4 * total/2 = total^2/8
      maxArea = Math.round(totalFence * totalFence / 8)
      minX = 1
      maxX = Math.floor(totalFence / 2) - 1
      return { goalText: `Opdracht 1: Een boer heeft ${totalFence}m hek. De rivier vormt 1 zijde (hij heeft dus maar 3 zijden hek nodig). Wat is de MAXIMALE oppervlakte?`, totalFence, hasRiver, maxArea, minX, maxX }
    case 1:
      totalFence = Math.floor(Math.random() * 9) * 4 + 32 // 32, 36, 40, 44, 48, 52, 56, 60, 64
      hasRiver = true
      maxArea = Math.round(totalFence * totalFence / 8)
      minX = 1
      maxX = Math.floor(totalFence / 2) - 1
      return { goalText: `Opdracht 2: De boer koopt extra hek. Hij heeft nu ${totalFence}m hek voor 3 zijden tegen de rivier. Wat is nu het maximum?`, totalFence, hasRiver, maxArea, minX, maxX }
    case 2:
      totalFence = Math.floor(Math.random() * 5) * 4 + 24 // 24, 28, 32, 36, 40
      hasRiver = false
      // Without river: area = x * (total - 2x)/2. Max at x = total/4.
      // maxArea = (total/4) * (total - total/2)/2 = total/4 * total/4 = total^2/16
      maxArea = Math.round(totalFence * totalFence / 16)
      minX = 1
      maxX = Math.floor(totalFence / 2) - 1
      return { goalText: `Opdracht 3: Let op! De boer bouwt nu ergens in het veld ZONDER rivier. Hij moet alle 4 de zijden omheinen met ${totalFence}m hek. Maximum?`, totalFence, hasRiver, maxArea, minX, maxX }
    default:
      return { goalText: 'Opdracht 1: Een boer heeft 20m hek...', totalFence: 20, hasRiver: true, maxArea: 50, minX: 1, maxX: 9 }
  }
}

const levels = ref([
  generateLevel(0),
  generateLevel(1),
  generateLevel(2)
])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const widthX = ref(2)
const userMaxArea = ref(null)

const lengthY = computed(() => {
  if (currentLevelData.value.hasRiver) {
    return currentLevelData.value.totalFence - (2 * widthX.value);
  } else {
    return (currentLevelData.value.totalFence - (2 * widthX.value)) / 2;
  }
})

const currentArea = computed(() => widthX.value * lengthY.value)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Beweeg de slider (Breedte x) om te testen. Vul daarna je maximale oppervlakte in.' };
    widthX.value = currentLevelData.value.minX + 1;
    userMaxArea.value = null;
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ];
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  if (userMaxArea.value === currentLevelData.value.maxArea) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Magistraal! Je hebt het absolute maximum gevonden door systematisch te proberen (heuristiek).'
    }
  } else {
    isCorrect.value = false

    const hints = [
      `Niet correct. Probeer de schuifregelaar heen en weer te bewegen en kijk wanneer de oppervlakte het grootst is.`,
      `Kijk goed naar het getal "Oppervlakte" boven het veld. Beweeg de slider langzaam en zoek de hoogste waarde. Het antwoord is ${currentLevelData.value.maxArea} m².`,
      `De maximale oppervlakte is ${currentLevelData.value.maxArea} m². Vul dit getal in om verder te gaan.`
    ]

    if (userMaxArea.value === null || userMaxArea.value === undefined) {
      feedback.value = { type: 'error', text: 'Vul eerst een getal in het veld in.' }
    } else if (userMaxArea.value === currentArea.value && currentArea.value !== currentLevelData.value.maxArea) {
      feedback.value = { type: 'error', text: `Klopt, bij de huidige breedte is de oppervlakte ${currentArea.value}. Maar is dit écht het absolute MAXIMUM? ${hints[Math.min(attemptCount.value - 1, hints.length - 1)]}` }
    } else {
      const hintIdx = Math.min(attemptCount.value - 1, hints.length - 1)
      feedback.value = { type: 'error', text: hints[hintIdx] }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-emerald-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-emerald-200 bg-white rounded-xl shadow-sm text-center">
               <label class="block text-sm font-bold text-emerald-900 mb-2">Conclusie: De maximale oppervlakte is:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userMaxArea" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 text-center" />
                   <span class="font-black text-2xl text-slate-500">m²</span>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userMaxArea === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Maximum</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex items-center justify-center gap-12">

                  <div class="flex flex-col items-center w-full max-w-lg">

                      <!-- Controller -->
                      <div class="mb-4 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center z-20">
                          <div class="flex w-full justify-between items-end mb-2">
                              <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsLeftRight weight="bold" /> Breedte Hek (x)</label>
                              <span class="font-black text-xl text-emerald-600">{{ widthX }} m</span>
                          </div>
                          <input type="range" :min="currentLevelData.minX" :max="currentLevelData.maxX" step="1" v-model.number="widthX" :disabled="isCorrect"
                                 class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                      </div>

                      <!-- Visualisation Area -->
                      <div class="relative bg-[#f8fafc] shadow-2xl rounded-2xl overflow-hidden border-4 border-slate-800 w-[500px] h-[400px] flex items-end justify-center">

                          <!-- The River (Top) ONLY IF hasRiver is true -->
                          <div v-if="currentLevelData.hasRiver" class="absolute top-0 inset-x-0 h-16 bg-blue-400 opacity-80 flex flex-col items-center justify-center z-0 overflow-hidden">
                              <span class="font-black text-blue-900/30 uppercase tracking-[0.5em] text-3xl">Rivier</span>
                              <!-- Water waves -->
                              <div class="absolute bottom-2 left-10 w-24 h-2 rounded-full bg-blue-300 opacity-50"></div>
                              <div class="absolute bottom-6 right-20 w-32 h-2 rounded-full bg-blue-300 opacity-50"></div>
                          </div>

                          <!-- The Field (Green) -->
                          <div class="absolute bg-emerald-400/30 transition-all duration-300 ease-out flex items-center justify-center z-10 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]"
                               :class="currentLevelData.hasRiver ? 'border-b-4 border-x-4 border-slate-800' : 'border-4 border-slate-800 rounded-lg'"
                               :style="{
                                   top: currentLevelData.hasRiver ? '64px' : '50%',
                                   transform: currentLevelData.hasRiver ? 'translateX(0)' : 'translate(-50%, -50%)',
                                   left: currentLevelData.hasRiver ? 'auto' : '50%',
                                   width: `${lengthY * 12}px`,
                                   height: `${widthX * 12}px`
                               }">

                               <!-- Grass pattern -->
                               <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#047857 2px, transparent 2px); background-size: 15px 15px;"></div>

                               <!-- Internal Label -->
                               <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow border border-slate-300 flex flex-col items-center"
                                    :class="currentArea === currentLevelData.maxArea ? 'border-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''">
                                   <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oppervlakte</span>
                                   <span class="font-black text-3xl" :class="currentArea === currentLevelData.maxArea ? 'text-emerald-600' : 'text-slate-700'">{{ currentArea }} m²</span>
                               </div>
                          </div>

                      </div>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #10b981;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
