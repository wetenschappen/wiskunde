<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTriangle, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Classificatie: Het Driehoeken-Rooster' },
  instruction: {
    type: String,
    default: 'Elke driehoek heeft twee "namen": eentje voor de <strong>zijden</strong>, eentje voor de <strong>hoeken</strong>.<br/><br/><strong>Opdracht:</strong> Kijk naar de blauwe driehoek. Welke twee namen horen hierbij? Klik op het exacte kruispunt in het rooster.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een vakje in het 3x3 rooster.' })
const attemptCount = ref(0)

// Level Logic — dynamically generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const cols = ['Scherphoekig', 'Rechthoekig', 'Stomphoekig']
const rows = ['Ongelijkbenig', 'Gelijkbenig', 'Gelijkzijdig']

function generateLevel() {
  const trianglePool = [
    {
      targetRow: 0, targetCol: 0, name: 'Ongelijkbenige Scherphoekige',
      svgPoints: '50,30 180,180 20,180',
      hasRightAngle: false, rightAnglePoly: '',
      tick1: null, tick2: null, tick3: null,
      hintSide: 'Kijk naar de zijden. Zijn er twee even lang? Of alle drie? Of geen een?',
      hintAngle: 'Zijn alle hoeken kleiner dan 90°? Of is er een rechte of stompe hoek?',
      hintFinal: 'Verschillende zijden = ongelijkbenig. Alle hoeken < 90° = scherphoekig.',
      successMsg: 'Goed! De driehoek heeft drie verschillende zijden (ongelijkbenig) en alle hoeken zijn scherp (scherphoekig).'
    },
    {
      targetRow: 0, targetCol: 1, name: 'Ongelijkbenige Rechthoekige',
      svgPoints: '20,180 180,180 20,40',
      hasRightAngle: true, rightAnglePoly: '20,180 20,150 50,150 50,180',
      tick1: null, tick2: null, tick3: null,
      hintSide: 'Zijn er twee zijden even lang? Of hebben ze alle drie een andere lengte?',
      hintAngle: 'Let op de rechte hoek-indicator (het vierkantje).',
      hintFinal: 'Geen gelijke zijden = ongelijkbenig. Rechte hoek = rechthoekig.',
      successMsg: 'Correct! De driehoek heeft geen gelijke zijden (ongelijkbenig) en een rechte hoek (rechthoekig).'
    },
    {
      targetRow: 0, targetCol: 2, name: 'Ongelijkbenige Stomphoekige',
      svgPoints: '150,30 25,180 180,180',
      hasRightAngle: false, rightAnglePoly: '',
      tick1: null, tick2: null, tick3: null,
      hintSide: 'Zijn de zijden allemaal even lang? Of twee? Of geen?',
      hintAngle: 'Eén hoek is groter dan 90°. Zie je welke?',
      hintFinal: 'Drie ongelijke zijden = ongelijkbenig. Een hoek > 90° = stomphoekig.',
      successMsg: 'Juist! De driehoek heeft drie ongelijke zijden en een stompe hoek (>90°).'
    },
    {
      targetRow: 1, targetCol: 0, name: 'Gelijkbenige Scherphoekige',
      svgPoints: '100,30 30,180 170,180',
      hasRightAngle: false, rightAnglePoly: '',
      tick1: { x1: 55, y1: 115, x2: 70, y2: 100 },
      tick2: { x1: 130, y1: 100, x2: 145, y2: 115 },
      tick3: null,
      hintSide: 'Let op de streepjes op de zijden. Wat betekenen die?',
      hintAngle: 'Zijn alle hoeken kleiner dan 90°?',
      hintFinal: 'Twee gelijke zijden (streepjes) = gelijkbenig. Alle hoeken < 90° = scherphoekig.',
      successMsg: 'Prima! De streepjes geven aan dat twee zijden even lang zijn (gelijkbenig) en alle hoeken zijn scherp.'
    },
    {
      targetRow: 1, targetCol: 1, name: 'Gelijkbenige Rechthoekige',
      svgPoints: '20,180 180,180 100,40',
      hasRightAngle: true, rightAnglePoly: '20,180 20,130 70,130 70,180',
      tick1: { x1: 60, y1: 110, x2: 75, y2: 125 },
      tick2: { x1: 125, y1: 125, x2: 140, y2: 110 },
      tick3: null,
      hintSide: 'Twee zijden hebben streepjes. Wat wil dat zeggen?',
      hintAngle: 'Let op de rechte hoek-aanduiding.',
      hintFinal: 'Twee gelijke benen = gelijkbenig. Rechte hoek = rechthoekig.',
      successMsg: 'Super! Twee zijden zijn even lang (gelijkbenig) en er is een rechte hoek (rechthoekig).'
    },
    {
      targetRow: 1, targetCol: 2, name: 'Gelijkbenige Stomphoekige',
      svgPoints: '160,40 30,180 180,180',
      hasRightAngle: false, rightAnglePoly: '',
      tick1: { x1: 95, y1: 115, x2: 110, y2: 130 },
      tick2: { x1: 140, y1: 130, x2: 155, y2: 115 },
      tick3: null,
      hintSide: 'De streepjes tonen twee gelijke zijden. Welke naam hoort daarbij?',
      hintAngle: 'Kijk goed: is er een hoek die "open" is, groter dan 90°?',
      hintFinal: 'Twee gelijke zijden = gelijkbenig. Eén hoek > 90° = stomphoekig.',
      successMsg: 'Goed gezien! Twee gelijke zijden (gelijkbenig) met een stompe hoek (stomphoekig).'
    },
    {
      targetRow: 2, targetCol: 0, name: 'Gelijkzijdige Scherphoekige',
      svgPoints: '100,20 30,141.2 170,141.2',
      hasRightAngle: false, rightAnglePoly: '',
      tick1: { x1: 60, y1: 85, x2: 70, y2: 75 },
      tick2: { x1: 130, y1: 75, x2: 140, y2: 85 },
      tick3: { x1: 100, y1: 136.2, x2: 100, y2: 146.2 },
      hintSide: 'Hoeveel streepjes staan er op de zijden? Wat zegt dat?',
      hintAngle: 'Een gelijkzijdige driehoek heeft altijd hoeken van 60°. Wat voor hoeken zijn dat?',
      hintFinal: 'Drie streepjes = alle zijden gelijk = gelijkzijdig. 60° = scherphoekig.',
      successMsg: 'Fantastisch! Alle zijden zijn even lang (gelijkzijdig) en alle hoeken zijn 60° (scherphoekig).'
    }
  ]

  // Pick 3 distinct triangles, ensuring variety
  const shuffled = [...trianglePool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const selectedRow = ref(null)
const selectedCol = ref(null)

function selectCell(r, c) {
    if (isCorrect.value) return;
    selectedRow.value = r;
    selectedCol.value = c;
    checkAnswer();
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op een vakje in het 3x3 rooster.' };
    selectedRow.value = null;
    selectedCol.value = null;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  // Impossible cells check
  if (selectedRow.value === 2 && selectedCol.value === 1) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: 'Onmogelijk! Een gelijkzijdige driehoek heeft altijd 3 hoeken van 60°. Er kan dus nooit een rechte hoek (90°) inzitten!'}
      return
  }
  if (selectedRow.value === 2 && selectedCol.value === 2) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: 'Onmogelijk! Een gelijkzijdige driehoek heeft altijd 3 hoeken van 60°. Hij kan dus nooit stomphoekig zijn!'}
      return
  }

  const data = currentLevelData.value

  if (selectedRow.value === data.targetRow && selectedCol.value === data.targetCol) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    isCorrect.value = false

    if (attemptCount.value <= 1) {
      if (selectedRow.value !== data.targetRow && selectedCol.value === data.targetCol) {
          feedback.value = { type: 'error', text: `De hoekennaam klopt (${cols[selectedCol.value]})! ${data.hintSide}`}
      } else if (selectedRow.value === data.targetRow && selectedCol.value !== data.targetCol) {
          feedback.value = { type: 'error', text: `De zijdennaam klopt (${rows[selectedRow.value]}). ${data.hintAngle}`}
      } else {
          feedback.value = { type: 'error', text: 'Niet juist. Kijk eerst naar de hoeken (scherp, recht, stomp). Vergelijk daarna de lengtes van de zijden.'}
      }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: data.hintSide + ' ' + data.hintAngle }
    } else {
      feedback.value = { type: 'error', text: data.hintFinal }
    }
  }
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
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-indigo-900 mb-2">Jouw Classificatie:</label>

               <div class="flex flex-col gap-2">
                   <div class="bg-white px-3 py-2 rounded border border-slate-300 font-bold text-slate-700 min-h-[40px] flex items-center transition-colors" :class="selectedRow !== null ? 'border-indigo-400 bg-indigo-50' : ''">
                       <span v-if="selectedRow !== null">{{ rows[selectedRow] }}</span>
                       <span v-else class="text-slate-400 italic">Kies de zijden...</span>
                   </div>
                   <div class="bg-white px-3 py-2 rounded border border-slate-300 font-bold text-slate-700 min-h-[40px] flex items-center transition-colors" :class="selectedCol !== null ? 'border-indigo-400 bg-indigo-50' : ''">
                       <span v-if="selectedCol !== null">{{ cols[selectedCol] }}</span>
                       <span v-else class="text-slate-400 italic">Kies de hoeken...</span>
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

              <div class="w-full max-w-4xl flex flex-col items-center gap-8">

                  <!-- The Triangle to Classify -->
                  <div class="relative bg-white p-8 rounded-2xl shadow-md border-2 border-slate-200" :key="'tri'+currentInternalLevel">
                      <h4 class="absolute top-2 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Te classificeren:</h4>
                      <svg width="200" height="200" viewBox="0 0 200 200" class="mt-4">
                          <!-- Right angle indicator -->
                          <polyline v-if="currentLevelData.hasRightAngle" :points="currentLevelData.rightAnglePoly" fill="transparent" stroke="#ef4444" stroke-width="2" class="animate-fadeIn" />

                          <!-- The triangle -->
                          <polygon :points="currentLevelData.svgPoints" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" class="transition-all duration-700" />

                          <!-- Equality tick marks -->
                          <line v-if="currentLevelData.tick1" :x1="currentLevelData.tick1.x1" :y1="currentLevelData.tick1.y1" :x2="currentLevelData.tick1.x2" :y2="currentLevelData.tick1.y2" stroke="#1e293b" stroke-width="3" class="animate-fadeIn" />
                          <line v-if="currentLevelData.tick2" :x1="currentLevelData.tick2.x1" :y1="currentLevelData.tick2.y1" :x2="currentLevelData.tick2.x2" :y2="currentLevelData.tick2.y2" stroke="#1e293b" stroke-width="3" class="animate-fadeIn" />
                          <line v-if="currentLevelData.tick3" :x1="currentLevelData.tick3.x1" :y1="currentLevelData.tick3.y1" :x2="currentLevelData.tick3.x2" :y2="currentLevelData.tick3.y2" stroke="#1e293b" stroke-width="3" class="animate-fadeIn" />
                      </svg>
                  </div>

                  <!-- The Grid -->
                  <div class="bg-white rounded-xl shadow-xl border-4 border-slate-800 p-1 flex flex-col overflow-hidden transition-all duration-500" :class="isCorrect ? 'border-emerald-500 shadow-emerald-200' : ''">

                      <!-- Header Row -->
                      <div class="flex bg-slate-800 text-white font-bold transition-colors" :class="isCorrect ? 'bg-emerald-600' : ''">
                          <div class="w-32 p-3"></div>
                          <div v-for="col in cols" :key="col" class="w-36 p-3 text-center text-sm uppercase tracking-wider border-l border-slate-600/50">
                              {{ col }}
                          </div>
                      </div>

                      <!-- Data Rows -->
                      <div v-for="(rowName, rIdx) in rows" :key="rowName" class="flex border-t border-slate-300">

                          <!-- Row Header -->
                          <div class="w-32 p-3 bg-slate-100 font-bold text-slate-700 flex items-center justify-start text-sm uppercase border-r border-slate-300">
                              {{ rowName }}
                          </div>

                          <!-- Cells -->
                          <div v-for="(colName, cIdx) in cols" :key="colName"
                               @click="selectCell(rIdx, cIdx)"
                               class="w-36 h-20 border-l border-slate-200 cursor-pointer transition-all flex items-center justify-center relative group"
                               :class="{
                                   'bg-emerald-500 hover:bg-emerald-500': isCorrect && selectedRow === rIdx && selectedCol === cIdx,
                                   'bg-red-500 hover:bg-red-500': !isCorrect && selectedRow === rIdx && selectedCol === cIdx,
                                   'hover:bg-slate-50': selectedRow !== rIdx || selectedCol !== cIdx
                               }">

                               <!-- Selected indicator icon -->
                               <PhCheckCircle v-if="isCorrect && selectedRow === rIdx && selectedCol === cIdx" weight="fill" class="w-8 h-8 text-white animate-fadeIn" />
                               <PhX v-if="!isCorrect && selectedRow === rIdx && selectedCol === cIdx" weight="bold" class="w-8 h-8 text-white animate-fadeIn" />

                               <!-- Hover state target ring -->
                               <div v-if="selectedRow !== rIdx || selectedCol !== cIdx" class="w-8 h-8 rounded-full border-2 border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                               <!-- Warning for impossible cells -->
                               <PhWarningCircle v-if="rIdx === 2 && (cIdx === 1 || cIdx === 2)" weight="duotone" class="absolute bottom-1 right-1 w-4 h-4 text-slate-300" />
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
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
</style>