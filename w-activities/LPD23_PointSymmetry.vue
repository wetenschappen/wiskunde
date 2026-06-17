<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowsClockwise, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Transformaties: Puntspiegeling = Rotatie' },
  instruction: {
    type: String,
    default: 'Een puntspiegeling klinkt ingewikkeld ("spiegelen doorheen een punt"), maar eigenlijk is het een heel simpele rotatie!<br/><br/><strong>Opdracht:</strong> De gestippelde vorm is de puntspiegeling van de blauwe vorm door punt C. Draai de blauwe vorm met de slider tot hij perfect past. Hoeveel graden heb je gedraaid?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhArrowsClockwise }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de slider om de vorm rond punt C te draaien.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []
  const cx = 250, cy = 200

  // Level 1: simple L-shape (4 points)
  const pts1 = [
    [150, 100], [200, 100], [200, 150], [250, 150],
    [250, 200], [150, 200]
  ]
  newLevels.push(makeLevel(pts1, cx, cy, 1, 'Een L-vorm'))

  // Level 2: asymmetric triangle
  const pts2 = [
    [100, 150], [200, 100], [150, 200]
  ]
  newLevels.push(makeLevel(pts2, cx, cy, 2, 'Een asymmetrische driehoek'))

  // Level 3: quadrilateral
  const pts3 = [
    [200, 100], [250, 50], [300, 150], [200, 150]
  ]
  newLevels.push(makeLevel(pts3, cx, cy, 3, 'Een willekeurige vierhoek'))

  levels.value = newLevels
}

function makeLevel(points, cx, cy, level, label) {
  const shapePts = points.map(p => `${p[0]},${p[1]}`).join(' ')
  const rotatedPts = points.map(p => `${2*cx - p[0]},${2*cy - p[1]}`).join(' ')
  const colors = ['rgba(99, 102, 241, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(16, 185, 129, 0.8)']
  const strokes = ['#4f46e5', '#db2777', '#059669']
  const color = colors[(level - 1) % colors.length]
  const stroke = strokes[(level - 1) % strokes.length]
  return {
    goalText: `Opdracht ${level}: ${label}`,
    centerX: cx,
    centerY: cy,
    shapeSVG: `<polygon points="${shapePts}" fill="${color}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" />`,
    targetSVG: `<polygon points="${rotatedPts}" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="8 4" stroke-linejoin="round" />`
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const rotation = ref(0)
const userAns = ref(null)

const isOverlapping = computed(() => rotation.value === 180)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Gebruik de slider om de vorm rond punt C te draaien.' };
    rotation.value = 0;
    userAns.value = null;
    attemptCount.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  if (userAns.value === 180) {
    if (isOverlapping.value) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: 'Perfect! Een puntspiegeling is wiskundig EXACT hetzelfde als een rotatie van 180 graden (een halve draai). Wat de vorm ook is!'
        }
    } else {
        isCorrect.value = false
        if (attemptCount.value >= 3) {
          feedback.value = { type: 'error', text: '180 is correct! Zet de slider exact op 180° en klik opnieuw op Controleer.' }
        } else if (attemptCount.value >= 2) {
          feedback.value = { type: 'error', text: 'Het antwoord "180" klopt! Maar je moet de slider ook naar 180° zetten om het te bewijzen.' }
        } else {
          feedback.value = { type: 'error', text: '180 is correct! Draai de vorm nu ook fysiek naar 180° met de slider om het te bewijzen.' }
        }
    }
  } else {
    isCorrect.value = false

    if (userAns.value === 360 || userAns.value === 0) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: '0° of 360° betekent geen draaiing. Je moet exact een halve draai maken (180°).' }
      } else {
        feedback.value = { type: 'error', text: 'Bij 360° of 0° doe je niets of draai je helemaal rond. De vorm ligt dan terug op zijn startpositie, niet op het spiegelbeeld.' }
      }
    } else if (userAns.value === 90 || userAns.value === 270) {
      feedback.value = { type: 'error', text: 'Bij 90° of 270° (kwartdraai) staat de vorm haaks. Probeer de slider te slepen en kijk wanneer hij overlapt met het doel.' }
    } else if (isOverlapping.value) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: 'Vorm overlapt! Lees de hoek bovenaan de slider af en typ dat getal in.' }
      } else {
        feedback.value = { type: 'error', text: `Je vorm overlapt perfect! Kijk nu naar de hoekgrootte bovenaan de slider. Vul dat getal in.` }
      }
    } else {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: 'Sleep de slider tot de vormen exact overlappen. Dat gebeurt bij 180°.' }
      } else {
        feedback.value = { type: 'error', text: 'Fout. Sleep de slider tot de vormen overlappen en lees de hoek af.' }
      }
    }
  }
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

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    generateLevel()
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-indigo-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-indigo-900 mb-2">Conclusie:</label>
               <div class="flex items-center gap-2 mb-2 text-slate-700 font-medium text-sm">
                   Een puntspiegeling is gelijk aan een rotatie van:
               </div>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="flex-1 font-bold text-xl p-3 border-2 border-indigo-400 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-center bg-white" />
                   <span class="font-black text-2xl text-slate-500">°</span>
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

              <div class="w-full max-w-2xl flex flex-col items-center">

                  <!-- Control -->
                  <div class="mb-12 w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-200 z-10">
                      <div class="flex justify-between items-end mb-4">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsClockwise weight="bold" /> Rotatie</label>
                          <span class="font-black text-2xl" :class="isOverlapping ? 'text-emerald-600' : 'text-indigo-600'">{{ rotation }}°</span>
                      </div>
                      <input type="range" min="0" max="360" step="1" v-model.number="rotation" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                             :class="isOverlapping ? 'accent-emerald-500' : ''" />
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative bg-white shadow-xl rounded-3xl overflow-hidden border-4 border-slate-200 p-4" :key="currentInternalLevel">
                      <svg width="500" height="400" viewBox="0 0 500 400" class="block">

                          <g v-html="currentLevelData.targetSVG"></g>

                          <circle :cx="currentLevelData.centerX" :cy="currentLevelData.centerY" r="6" fill="#1e293b" />
                          <text :x="currentLevelData.centerX" :y="currentLevelData.centerY - 15" font-weight="bold" fill="#1e293b" text-anchor="middle">C</text>

                          <!-- ORIGINAL SHAPE (Rotatable Group) -->
                          <g :transform="`rotate(${rotation}, ${currentLevelData.centerX}, ${currentLevelData.centerY})`">
                              <g class="transition-colors duration-300"
                                 :class="isOverlapping ? '[&>*]:fill-emerald-500/80 [&>*]:stroke-emerald-600' : ''"
                                 v-html="currentLevelData.shapeSVG"></g>
                          </g>

                      </svg>
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #6366f1;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -13px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: background-color 0.3s;
}
input[type=range]:disabled::-webkit-slider-thumb {
  background: #10b981;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
