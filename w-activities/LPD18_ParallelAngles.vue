<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLines, PhArrowClockwise, PhHandPointing
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Evenwijdige Rechten' },
  instruction: {
    type: String,
    default: 'Als een snijlijn door twee <strong>evenwijdige</strong> rechten snijdt, ontstaan er speciale hoeken (Z-hoeken en F-hoeken) die altijd even groot zijn.<br/><br/><strong>Opdracht:</strong> Draai de snijlijn met de slider. Zoek het gevraagde hoekenpaar en klik de twee juiste hoeken aan.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLines }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer exact twee hoeken die het gevraagde hoekenpaar vormen.' })
const attemptCount = ref(0)

// Level Logic — dynamically generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const zPairs = [[3, 6], [4, 5]]
  const fPairs = [[1, 5], [2, 6], [3, 7], [4, 8]]
  const xPairs = [[1, 4], [2, 3], [5, 8], [6, 7]]

  const zPick = zPairs[Math.floor(Math.random() * zPairs.length)]
  const fPick = fPairs[Math.floor(Math.random() * fPairs.length)]
  const xPick = xPairs[Math.floor(Math.random() * xPairs.length)]

  const zA = zPick[0], zB = zPick[1]
  const fA = fPick[0], fB = fPick[1]
  const xA = xPick[0], xB = xPick[1]

  return [
    {
      goalText: 'Opdracht 1: Zoek een Z-hoek (Verwisselende Binnenhoeken)',
      targetA: zA, targetB: zB,
      hint: 'Kijk naar de binnenkant tussen de twee evenwijdige lijnen. Vormen de hoeken een Z-patroon over de snijlijn?',
      hint2: 'Een Z-hoek verbindt het ene snijpunt met het andere via de "binnenkant". Hoek ' + zA + ' en hoek ' + zB + ' vormen samen een Z.',
      hint3: 'Klik op hoek ' + zA + ' en hoek ' + zB + '.',
      successMsg: 'Perfect! Een Z-hoek (verwisselende binnenhoeken). Hoe je de snijlijn ook draait, ze blijven gelijk.'
    },
    {
      goalText: 'Opdracht 2: Zoek een F-hoek (Overeenkomstige Hoeken)',
      targetA: fA, targetB: fB,
      hint: 'Stel je voor dat je de 4 hoeken bovenaan oppakt en naar onderen schuift. Welke vallen dan perfect op elkaar? Dat zijn F-hoeken.',
      hint2: 'F-hoeken staan op dezelfde positie bij elk snijpunt. Hoek ' + fA + ' en hoek ' + fB + ' zijn een F-hoek.',
      hint3: 'Klik op hoek ' + fA + ' en hoek ' + fB + '.',
      successMsg: 'Uitstekend! F-hoeken liggen op precies dezelfde relatieve positie bij hun snijpunt.'
    },
    {
      goalText: 'Opdracht 3: Zoek een X-hoek (Overstaande Hoeken)',
      targetA: xA, targetB: xB,
      hint: 'X-hoeken (overstaande) liggen kruiselings tegenover elkaar op 1 enkel snijpunt.',
      hint2: 'Overstaande hoeken liggen aan hetzelfde snijpunt, kruiselings. Hoek ' + xA + ' en hoek ' + xB + ' zijn een X-hoek.',
      hint3: 'Klik op hoek ' + xA + ' en hoek ' + xB + '.',
      successMsg: 'Heel goed. Overstaande hoeken zijn een basisgegeven bij elk snijpunt van twee lijnen.'
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const transversalAngle = ref(60)
const selectedAngles = ref([])

function toggleAngle(id) {
    if (isCorrect.value) return;

    const idx = selectedAngles.value.indexOf(id)
    if (idx > -1) {
        selectedAngles.value.splice(idx, 1)
    } else {
        if (selectedAngles.value.length < 2) {
            selectedAngles.value.push(id)
        } else {
            selectedAngles.value[1] = id
        }
    }

    // Auto-check when 2 angles selected
    if (selectedAngles.value.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
  isChecked.value = true;

  if (selectedAngles.value.length !== 2) return;

  const [a, b] = selectedAngles.value.sort()
  const data = currentLevelData.value

  const isMatch = (a === data.targetA && b === data.targetB);

  if (isMatch) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    attemptCount.value++

    const isZAngle = (a === 3 && b === 6) || (a === 4 && b === 5)
    const isFAngle = (a === 1 && b === 5) || (a === 2 && b === 6) || (a === 3 && b === 7) || (a === 4 && b === 8)
    const isXAngle = (a === 1 && b === 4) || (a === 2 && b === 3) || (a === 5 && b === 8) || (a === 6 && b === 7)

    if (attemptCount.value <= 1) {
      if (isZAngle) feedback.value = { type: 'error', text: 'Je hebt een Z-hoek gevonden, maar deze opdracht vraagt iets anders.' }
      else if (isFAngle) feedback.value = { type: 'error', text: 'Je hebt een F-hoek (overeenkomstig) gevonden, maar deze opdracht vraagt iets anders.' }
      else if (isXAngle) feedback.value = { type: 'error', text: 'Dit zijn overstaande hoeken (X-hoeken). Ze liggen op hetzelfde snijpunt, maar de opdracht vraagt iets anders.' }
      else feedback.value = { type: 'error', text: data.hint }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: data.hint2 }
    } else {
      feedback.value = { type: 'error', text: data.hint3 }
    }
  }
}

function getAngleType(a, b) {
  const s = [a, b].sort()
  if ((s[0] === 3 && s[1] === 6) || (s[0] === 4 && s[1] === 5)) return 'Z'
  if ((s[0] === 1 && s[1] === 5) || (s[0] === 2 && s[1] === 6) || (s[0] === 3 && s[1] === 7) || (s[0] === 4 && s[1] === 8)) return 'F'
  if ((s[0] === 1 && s[1] === 4) || (s[0] === 2 && s[1] === 3) || (s[0] === 5 && s[1] === 8) || (s[0] === 6 && s[1] === 7)) return 'X'
  return null
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Selecteer exact twee hoeken die het gevraagde hoekenpaar vormen.' };
    transversalAngle.value = 60;
    selectedAngles.value = [];
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
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
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-2">Hoekgrootte (Snijlijn):</label>
               <div class="font-black text-3xl text-teal-600 mb-4 bg-white px-4 py-2 rounded shadow-sm inline-block border border-teal-200">
                   {{ transversalAngle }}°
               </div>

               <div class="flex gap-2">
                   <div v-for="i in 2" :key="i" class="flex-1 h-12 rounded-lg border-2 border-dashed flex items-center justify-center font-bold text-xl transition-all"
                        :class="selectedAngles[i-1] ? 'border-teal-500 bg-teal-100 text-teal-800' : 'border-slate-300 bg-white text-slate-400'">
                       {{ selectedAngles[i-1] ? `Hoek ${selectedAngles[i-1]}` : '?' }}
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
              <!-- Auto-correct on 2-angle selection — no check button -->
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-3xl flex flex-col items-center">

                  <div class="mb-12 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                      <div class="flex w-full justify-between items-end mb-2">
                          <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Draai de snijlijn</label>
                          <span class="font-black text-xl text-teal-600">{{ transversalAngle }}°</span>
                      </div>
                      <input type="range" min="30" max="150" step="1" v-model.number="transversalAngle" :disabled="isCorrect"
                             class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8">
                      <svg width="500" height="300" viewBox="0 0 500 300">

                          <!-- Definitions for arrow heads -->
                          <defs>
                              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                  <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                              </marker>
                          </defs>

                          <!-- Parallel Line 1 (Top) -->
                          <line x1="50" y1="100" x2="450" y2="100" stroke="#475569" stroke-width="4" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" />
                          <text x="30" y="105" font-weight="bold" fill="#64748b">a</text>

                          <!-- Parallel Line 2 (Bottom) -->
                          <line x1="50" y1="200" x2="450" y2="200" stroke="#475569" stroke-width="4" marker-end="url(#arrowhead)" marker-start="url(#arrowhead)" />
                          <text x="30" y="205" font-weight="bold" fill="#64748b">b</text>

                          <!-- Group for the Transversal -->
                          <g :transform="`rotate(${transversalAngle - 90}, 250, 150)`">
                              <line x1="250" y1="0" x2="250" y2="300" stroke="#0ea5e9" stroke-width="4" />
                          </g>

                      </svg>

                      <!-- Overlay HTML buttons for angles -->
                      <!-- Intersection Top -->
                      <div class="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2"
                           :style="{ left: `calc(2rem + ${250 - 50/Math.tan(transversalAngle*Math.PI/180)}px)`, top: 'calc(2rem + 100px)' }">
                          <div @click="toggleAngle(1)" class="cursor-pointer flex items-end justify-end p-2 rounded-tl-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(1) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">1</div>
                          <div @click="toggleAngle(2)" class="cursor-pointer flex items-end justify-start p-2 rounded-tr-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(2) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">2</div>
                          <div @click="toggleAngle(3)" class="cursor-pointer flex items-start justify-end p-2 rounded-bl-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(3) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">3</div>
                          <div @click="toggleAngle(4)" class="cursor-pointer flex items-start justify-start p-2 rounded-br-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(4) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">4</div>
                      </div>

                      <!-- Intersection Bottom -->
                      <div class="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 grid-rows-2"
                           :style="{ left: `calc(2rem + ${250 + 50/Math.tan(transversalAngle*Math.PI/180)}px)`, top: 'calc(2rem + 200px)' }">
                          <div @click="toggleAngle(5)" class="cursor-pointer flex items-end justify-end p-2 rounded-tl-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(5) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">5</div>
                          <div @click="toggleAngle(6)" class="cursor-pointer flex items-end justify-start p-2 rounded-tr-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(6) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">6</div>
                          <div @click="toggleAngle(7)" class="cursor-pointer flex items-start justify-end p-2 rounded-bl-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(7) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">7</div>
                          <div @click="toggleAngle(8)" class="cursor-pointer flex items-start justify-start p-2 rounded-br-full hover:bg-teal-500/20 transition-colors" :class="selectedAngles.includes(8) ? 'bg-teal-500/40 text-teal-800' : 'text-slate-500'">8</div>
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
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #14b8a6;
  cursor: pointer;
  margin-top: -10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>