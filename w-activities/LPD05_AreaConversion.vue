<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhMagnifyingGlassPlus
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Eenheden Herleiden: Oppervlakte' },
  instruction: {
    type: String,
    default: 'Bij lengte (1D) verschuift de komma per stap 1 plaats. Bij oppervlakte (2D) gaat dat anders!<br/><br/><strong>Opdracht:</strong> Sleep het juiste blokje naar het lege vak om de vergelijking kloppend te maken. Gebruik de vergrootglazen om de grid te splitsen en het antwoord te visualiseren.'
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
const feedback = ref({ type: 'info', text: 'Sleep een antwoordblokje naar de vergelijking.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevel() {
  const configs = [
    {
      baseUnit: '1 m²',
      targetUnit: 'dm²',
      targetVal: 100,
      visTarget: 'dm',
      options: [10, 100, 1000, 10000],
      hint: 'Verdeel het vlak in dm². Hoeveel rijen en kolommen krijg je? 10 x 10 = ?'
    },
    {
      baseUnit: '1 dm²',
      targetUnit: 'cm²',
      targetVal: 100,
      visTarget: 'dm',
      options: [10, 100, 1000, 10000],
      hint: 'De sprong van dm² naar cm² is exact hetzelfde als van m² naar dm². De eenheid wordt 1 stapje kleiner.'
    },
    {
      baseUnit: '1 m²',
      targetUnit: 'cm²',
      targetVal: 10000,
      visTarget: 'cm',
      options: [100, 1000, 10000, 100000],
      hint: 'Je neemt nu 2 stappen in lengte (m -> dm -> cm). Dat betekent 2 stappen voor lengte én 2 voor breedte!'
    }
  ]

  return configs.map((cfg, i) => ({
    ...cfg,
    goalText: `Opdracht ${i+1}: ${cfg.baseUnit} = ? ${cfg.targetUnit}`,
    options: shuffle(cfg.options)
  }))
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const droppedAns = ref(null)

const visualState = ref('m') // 'm', 'dm', 'cm'

// Drag and drop logic
let draggedItem = null
function onDragStart(val) { if(!isCorrect.value) draggedItem = val }
function onDrop() {
    if (!isCorrect.value && draggedItem !== null) {
        droppedAns.value = draggedItem
        draggedItem = null
        // Auto-correct: immediately validate
        if (droppedAns.value === currentLevelData.value.targetVal) {
          isCorrect.value = true;
          isChecked.value = true;
          visualState.value = currentLevelData.value.visTarget;
          feedback.value = {
            type: 'success',
            text: 'Perfect! Elke stap in oppervlakte is een factor 100 (x10 in lengte, x10 in breedte).'
          }
        } else {
          attemptCount.value++;
          isChecked.value = true;
          if (droppedAns.value === 10) {
            feedback.value = { type: 'error', text: 'Let op: 10 is de sprong voor LENGTE (bijv. 1 m = 10 dm). We zoeken OPPERVLAKTE (lengte x breedte).'}
          } else if (attemptCount.value === 1) {
            feedback.value = { type: 'error', text: `Niet helemaal juist. Gebruik de vergrootglazen in de figuur om het na te tellen. ${currentLevelData.value.hint}`}
          } else if (attemptCount.value === 2) {
            feedback.value = { type: 'error', text: `Denk eraan: in de lengte EN de breedte wordt de eenheid 10x kleiner. Dus 10 x 10 = ...?`}
          } else {
            feedback.value = { type: 'error', text: `Het juiste antwoord is ${currentLevelData.value.targetVal}. Kijk naar de figuur: het aantal kleine hokjes in het grote vierkant.`}
          }
        }
    }
}
function removeDrop() {
    if (!isCorrect.value) {
        droppedAns.value = null
        isChecked.value = false
    }
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Sleep een antwoordblokje naar de vergelijking.' };
    attemptCount.value = 0;
    droppedAns.value = null;
    visualState.value = 'm';
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

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-3">Antwoordblokken:</label>
               <div class="flex flex-wrap gap-2">
                   <div v-for="opt in currentLevelData.options" :key="opt"
                        draggable="true" @dragstart="onDragStart(opt)"
                        class="px-4 py-2 border-2 border-slate-300 bg-white rounded-lg font-bold text-lg text-slate-700 cursor-grab hover:border-orange-400 hover:text-orange-600 transition-colors shadow-sm"
                        :class="{'opacity-30 pointer-events-none': droppedAns === opt || isCorrect}">
                       {{ opt }}
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
              <button @click="handleNext" v-if="isCorrect" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 px-4 text-center text-sm font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
                Sleep het juiste getal naar de vergelijking
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid gap-10">

              <!-- Vergelijking Drop Zone -->
              <div class="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.baseUnit }}</span>
                  <span class="font-bold text-2xl text-slate-400">=</span>

                  <div @dragover.prevent @drop="onDrop"
                       class="w-32 h-16 border-4 border-dashed rounded-xl flex items-center justify-center relative transition-all"
                       :class="droppedAns ? (isCorrect ? 'border-emerald-400 bg-emerald-50' : 'border-slate-800 bg-slate-100') : 'border-orange-300 bg-orange-50 hover:bg-orange-100'">
                       <span v-if="!droppedAns" class="text-xs font-bold text-orange-400 uppercase tracking-widest">Sleep hier</span>
                       <span v-else class="text-2xl font-black text-slate-800">{{ droppedAns }}</span>
                       <button v-if="droppedAns && !isCorrect" @click="removeDrop" class="absolute -top-3 -right-3 bg-slate-200 rounded-full p-1 hover:bg-red-200 hover:text-red-700 border-2 border-white shadow-sm">
                           <PhX weight="bold" class="w-3 h-3" />
                       </button>
                  </div>

                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.targetUnit }}</span>
              </div>

              <!-- Interactive Visual Controls -->
              <div class="flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 z-20">
                  <button @click="visualState = 'm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm" :class="visualState === 'm' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'">Toon Geheel</button>
                  <button @click="visualState = 'dm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-1" :class="visualState === 'dm' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'"><PhMagnifyingGlassPlus weight="bold" /> Verdeel per 10</button>
                  <button @click="visualState = 'cm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-1" :class="visualState === 'cm' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'"><PhMagnifyingGlassPlus weight="bold" /> Verdeel per 100</button>
              </div>

              <!-- The Square (1m^2 representation) -->
              <div class="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-orange-100 border-4 border-orange-500 shadow-xl relative transition-all duration-700">

                  <!-- Labels -->
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-orange-700 whitespace-nowrap text-sm">
                      Lengte x {{ visualState === 'dm' ? '10' : (visualState === 'cm' ? '100' : '1') }}
                  </div>
                  <div class="absolute -left-12 top-1/2 -translate-y-1/2 font-bold text-orange-700 whitespace-nowrap transform -rotate-90 origin-center text-sm">
                      Breedte x {{ visualState === 'dm' ? '10' : (visualState === 'cm' ? '100' : '1') }}
                  </div>

                  <!-- The Grid -->
                  <!-- Decimeter grid (10x10 = 100 squares) -->
                  <div v-if="visualState === 'dm' || visualState === 'cm'" class="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-60">
                      <div v-for="i in 100" :key="'dm'+i" class="border border-orange-500/40"></div>
                  </div>

                  <!-- Centimeter grid (100x100 = 10000 squares) - Simulated for performance -->
                  <div v-if="visualState === 'cm'" class="absolute inset-0"
                       style="background-image: linear-gradient(to right, rgba(249, 115, 22, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 115, 22, 0.2) 1px, transparent 1px); background-size: 4px 4px;">
                  </div>

                  <!-- Central info box -->
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-orange-200 text-center animate-fadeIn">
                      <h3 class="text-2xl font-black text-orange-600 mb-1">Oppervlakte</h3>
                      <p v-if="visualState === 'm'" class="font-bold text-slate-600 text-sm">Geen deling</p>
                      <p v-if="visualState === 'dm'" class="font-bold text-slate-600 text-sm">10 x 10 = <span class="text-orange-500">100 blokjes</span></p>
                      <p v-if="visualState === 'cm'" class="font-bold text-slate-600 text-sm">100 x 100 = <span class="text-orange-500">10.000 blokjes</span></p>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>