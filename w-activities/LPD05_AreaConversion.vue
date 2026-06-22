<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhMagnifyingGlassPlus, PhLightbulb, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Eenheden Herleiden: Oppervlakte' },
  instruction: {
    type: String,
    default: 'Bij lengte (1D) verschuift de komma per stap 1 plaats. Bij oppervlakte (2D) gaat dat anders!<br/><br/><strong>Opdracht:</strong> Sleep het juiste blokje naar het lege vak om de vergelijking kloppend te maken. Gebruik de vergrootglazen om de grid te splitsen en het antwoord te visualiseren.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep een antwoordblokje naar de vergelijking.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// Phases: 'predict' → 'answer' → 'why' (why explanation)
const phase = ref('predict')
const predictionValue = ref(null)
const showWorkedExample = ref(true)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

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
      hintLevels: [
        'Verdeel het vlak in dm². Hoeveel rijen en kolommen krijg je? 10 x 10 = ?',
        'Stel dat je een vierkant van 2 m x 2 m hebt. Dat is 4 m². In dm²: 20 dm x 20 dm = 400 dm². De factor is 100 (x10 voor lengte en x10 voor breedte). Wat is 1 m² in dm²?',
        '1 m = 10 dm. Dus 1 m² = 10 x 10 = __ dm².'
      ]
    },
    {
      baseUnit: '1 dm²',
      targetUnit: 'cm²',
      targetVal: 100,
      visTarget: 'dm',
      options: [10, 100, 1000, 10000],
      hintLevels: [
        'De sprong van dm² naar cm² is exact hetzelfde als van m² naar dm². De eenheid wordt 1 stapje kleiner.',
        'Stel: 1 dm = 10 cm. Dus een vierkant van 1 dm x 1 dm = 10 cm x 10 cm = 100 cm². Pas dit toe op de opgave.',
        '1 dm = 10 cm. Dus 1 dm² = 10 x 10 = __ cm².'
      ]
    },
    {
      baseUnit: '1 m²',
      targetUnit: 'cm²',
      targetVal: 10000,
      visTarget: 'cm',
      options: [100, 1000, 10000, 100000],
      hintLevels: [
        'Je neemt nu 2 stappen in lengte (m -> dm -> cm). Dat betekent 2 stappen voor lengte én 2 voor breedte!',
        'Stel: 1 m = 100 cm. Dus 1 m² = 100 cm x 100 cm = 10 000 cm². De factor is 100 x 100 = 10 000. Wat is jouw antwoord?',
        '1 m = 100 cm. Dus 1 m² = 100 x 100 = __ cm².'
      ]
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

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitPrediction() {
  if (predictionValue.value === null || predictionValue.value === '') return
  phase.value = 'answer'
  feedback.value = { type: 'info', text: `Je schatting: ${predictionValue.value}. Sleep nu het juiste getal naar de vergelijking.` }
}

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
            text: `Prima! ${currentLevelData.value.baseUnit} = ${currentLevelData.value.targetVal} ${currentLevelData.value.targetUnit}.`
          }
        } else {
          attemptCount.value++;
          isChecked.value = true;

          // Error analysis: common misconception — confusing length (10) with area (100)
          if (droppedAns.value === 10) {
            feedback.value = {
              type: 'error',
              text: 'Niet helemaal... Let op: 10 is de sprong voor LENGTE (bijv. 1 m = 10 dm). We zoeken OPPERVLAKTE (lengte x breedte). Omdat je de eenheid in twee richtingen verkleint, is de factor 10 x 10 = 100, niet 10.'
            }
          } else if (droppedAns.value === 1000) {
            feedback.value = {
              type: 'error',
              text: '1000 is voor INHOUD (3D): 1 m³ = 1000 dm³. Voor oppervlakte (2D) is de factor 100 per stap, niet 1000.'
            }
          } else if (attemptCount.value === 1) {
            feedback.value = { type: 'error', text: `Niet helemaal juist. Gebruik de vergrootglazen in de figuur om het na te tellen. ${currentLevelData.value.hintLevels[0]}` }
          } else {
            const idx = Math.min(attemptCount.value - 1, 2)
            feedback.value = { type: 'error', text: currentLevelData.value.hintLevels[idx] || `Het juiste antwoord is ${currentLevelData.value.targetVal}.` }
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
    celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Sleep een antwoordblokje naar de vergelijking.' };
    attemptCount.value = 0;
    hintCount.value = 0;
    droppedAns.value = null;
    visualState.value = 'm';
    predictionValue.value = null;
    phase.value = 'predict';
    showWorkedExample.value = true;
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

function proceedAfterSuccess() {
  phase.value = 'why'
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-slate-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                <PhLightbulb weight="fill" class="w-4 h-4" />
                Voorbeeld: 1 m&sup2; omrekenen naar dm&sup2;
              </h4>
              <ol class="text-sm text-slate-700 space-y-1 ml-4 list-decimal">
                <li>1 m = 10 dm (lengte-eenheid, factor 10).</li>
                <li>Oppervlakte is lengte x breedte: beide kanten worden 10x kleiner in dm.</li>
                <li>Dus: 1 m&sup2; = 10 dm x 10 dm = <strong>100 dm&sup2;</strong></li>
                <li>Bij lengte-eenheden is de factor 10 per stap; bij oppervlakte is de factor 10 x 10 = <strong>100</strong> per stap.</li>
              </ol>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-2 border border-amber-200 bg-amber-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-2">Schat eerst: Wat is het juiste getal?</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="predictionValue" placeholder="Jouw schatting..."
                          class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center" />
               </div>
            </div>

            <!-- Answer Phase: Drag and Drop -->
            <div v-if="phase === 'answer'" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-3">Antwoordblokken:</label>
               <div class="flex flex-wrap gap-2">
                   <div v-for="opt in currentLevelData.options" :key="opt"
                        draggable="true" @dragstart="onDragStart(opt)"
                        class="px-4 py-2 border-2 border-slate-300 bg-white rounded-lg font-bold text-lg text-slate-700 cursor-grab hover:border-amber-500 hover:text-amber-700 transition-colors shadow-sm"
                        :class="{'opacity-30 pointer-events-none': droppedAns === opt || isCorrect}">
                       {{ opt }}
                   </div>
               </div>
               <div v-if="predictionValue !== null && isChecked && !isCorrect" class="mt-3 text-xs text-slate-500">
                 Jouw schatting: {{ predictionValue }}
               </div>
            </div>

            <!-- Why Explanation -->
            <div v-if="phase === 'why'" class="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-1">
                <PhChatCircleText weight="fill" class="w-4 h-4" />
                Waarom is de factor 100 en niet 10?
              </h4>
              <p class="text-sm text-slate-700">
                Bij lengte-eenheden (1D) verschuif je de komma 1 plaats per stap (x10): 1 m = 10 dm. Bij oppervlakte (2D) moet je de omrekening in twee richtingen doen: de lengte én de breedte worden elk 10x kleiner. Daarom is de factor 10 x 10 = 100 per stap. Als je van m&sup2; naar cm&sup2; gaat (2 stappen), is de factor 100 x 100 = 10.000.
              </p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-slate-100 text-slate-700': feedback.type === 'error', 'bg-slate-100 text-slate-600': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>

              <!-- Prediction: submit -->
              <button v-if="phase === 'predict'" @click="submitPrediction" :disabled="predictionValue === null || predictionValue === ''"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig schatting
              </button>

              <!-- Answer: hint button -->
              <button v-if="phase === 'answer' && !isCorrect" @click="showHint"
                      class="py-4 px-4 text-lg font-medium transition-colors rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhLightbulb weight="fill" class="w-5 h-5" />
              </button>

              <!-- After success: why button -->
              <button v-if="isCorrect && phase === 'answer'" @click="proceedAfterSuccess"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Waarom?</span>
                <PhArrowRight weight="bold" />
              </button>

              <!-- Why / done: next -->
              <button v-if="phase === 'why'" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid gap-10">

              <!-- Vergelijking Drop Zone (only in answer phase) -->
              <div v-if="phase !== 'predict'" class="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.baseUnit }}</span>
                  <span class="font-bold text-2xl text-slate-400">=</span>

                  <div @dragover.prevent @drop="onDrop"
                       class="w-32 h-16 border-4 border-dashed rounded-xl flex items-center justify-center relative transition-all"
                       :class="droppedAns ? (isCorrect ? 'border-amber-400 bg-amber-50' : 'border-slate-800 bg-slate-100') : 'border-slate-200 bg-amber-50 hover:bg-amber-100'">
                       <span v-if="!droppedAns" class="text-xs font-bold text-amber-700 uppercase tracking-widest">Sleep hier</span>
                       <span v-else class="text-2xl font-black text-slate-800">{{ droppedAns }}</span>
                       <button v-if="droppedAns && !isCorrect" @click="removeDrop" class="absolute -top-3 -right-3 bg-slate-200 rounded-full p-1 hover:bg-red-200 hover:text-red-700 border-2 border-white shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                           <PhX weight="bold" class="w-3 h-3" />
                       </button>
                  </div>

                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.targetUnit }}</span>
              </div>

              <!-- Prediction overlay -->
              <div v-if="phase === 'predict'" class="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.baseUnit }}</span>
                  <span class="font-bold text-2xl text-slate-400">=</span>
                  <div class="w-32 h-16 flex items-center justify-center bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <span class="text-lg font-bold text-slate-400">?</span>
                  </div>
                  <span class="font-black text-3xl text-slate-800">{{ currentLevelData.targetUnit }}</span>
              </div>

              <!-- Interactive Visual Controls (only in answer/why phase) -->
              <div v-if="phase !== 'predict'" class="flex bg-white p-2 rounded-xl shadow-sm border border-slate-200 z-20">
                  <button @click="visualState = 'm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="visualState === 'm' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'">Toon Geheel</button>
                  <button @click="visualState = 'dm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-1 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="visualState === 'dm' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'"><PhMagnifyingGlassPlus weight="bold" /> Verdeel per 10</button>
                  <button @click="visualState = 'cm'" class="px-4 py-2 font-bold rounded-lg transition-colors text-sm flex items-center gap-1 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="visualState === 'cm' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'"><PhMagnifyingGlassPlus weight="bold" /> Verdeel per 100</button>
              </div>

              <!-- The Square (1m^2 representation) -->
              <div class="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-amber-50 border-4 border-amber-600 shadow-md relative transition-all duration-700">

                  <!-- Labels -->
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-amber-700 whitespace-nowrap text-sm">
                      Lengte x {{ visualState === 'dm' ? '10' : (visualState === 'cm' ? '100' : '1') }}
                  </div>
                  <div class="absolute -left-12 top-1/2 -translate-y-1/2 font-bold text-amber-700 whitespace-nowrap transform -rotate-90 origin-center text-sm">
                      Breedte x {{ visualState === 'dm' ? '10' : (visualState === 'cm' ? '100' : '1') }}
                  </div>

                  <!-- The Grid -->
                  <!-- Decimeter grid (10x10 = 100 squares) -->
                  <div v-if="visualState === 'dm' || visualState === 'cm'" class="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-60">
                      <div v-for="i in 100" :key="'dm'+i" class="border border-amber-600/40"></div>
                  </div>

                  <!-- Centimeter grid (100x100 = 10000 squares) - Simulated for performance -->
                  <div v-if="visualState === 'cm'" class="absolute inset-0"
                       style="background-image: linear-gradient(to right, rgba(217, 119, 6, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(217, 119, 6, 0.2) 1px, transparent 1px); background-size: 4px 4px;">
                  </div>

                  <!-- Central info box -->
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur p-4 rounded-xl shadow-md border border-slate-200 text-center animate-fadeIn">
                      <h3 class="text-2xl font-black text-amber-700 mb-1">Oppervlakte</h3>
                      <p v-if="visualState === 'm'" class="font-bold text-slate-600 text-sm">Geen deling</p>
                      <p v-if="visualState === 'dm'" class="font-bold text-slate-600 text-sm">10 x 10 = <span class="text-amber-700">100 blokjes</span></p>
                      <p v-if="visualState === 'cm'" class="font-bold text-slate-600 text-sm">100 x 100 = <span class="text-amber-700">10.000 blokjes</span></p>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && phase === 'answer'" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
