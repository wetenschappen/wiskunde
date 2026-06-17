<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartLineUp, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Data & Statistiek: De Data-Detective' },
  instruction: {
    type: String,
    default: 'Grafieken aflezen is meer dan alleen getallen zoeken. Je moet ze kunnen interpreteren!<br/><br/><strong>Opdracht:</strong> Kijk naar de grafiek. Klopt de uitspraak?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartLineUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Lees de grafiek en beoordeel de uitspraak.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  // Generate 5 data points
  const base = levelNum === 0 ? r(5, 12) : levelNum === 1 ? r(8, 20) : r(3, 15)
  const data = []
  for (let i = 0; i < 5; i++) {
    // Each value varies by -3 to +5 from previous, min 1
    const prev = i === 0 ? base : data[i - 1].temp
    const delta = r(-3, 5)
    data.push({ day: ['Ma', 'Di', 'Wo', 'Do', 'Vr'][i], temp: Math.max(1, prev + delta) })
  }

  // Generate a claim (sometimes true, sometimes false)
  const claimTypes = [
    // The claim will always be about whether "it keeps rising" or "it always goes up"
    { text: 'steeg elke dag zonder uitzondering.', check: (d) => d.every((v, i) => i === 0 || v.temp > d[i-1].temp) },
    { text: 'daalde nooit gedurende de week.', check: (d) => d.every((v, i) => i === 0 || v.temp >= d[i-1].temp) },
    { text: 'werd het elke dag kouder.', check: (d) => d.every((v, i) => i === 0 || v.temp < d[i-1].temp) },
  ]

  const ct = claimTypes[r(0, claimTypes.length - 1)]
  const actuallyTrue = ct.check(data)
  // Flip some to make them false
  const correctAnswer = r(0, 2) === 0 ? actuallyTrue : !actuallyTrue
  const claim = `"De temperatuur ${ct.text}"`

  const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag']
  const highlightIdx = (() => {
    for (let i = 1; i < data.length; i++) {
      if (!correctAnswer && ((ct.text.includes('steeg') || ct.text.includes('kouder')) && data[i].temp <= data[i-1].temp)) return i
      if (!correctAnswer && ct.text.includes('daalde') && data[i].temp < data[i-1].temp) return i
    }
    return 3
  })()

  const labels = ['Temperatuur (°C)', 'Verkoopcijfers (x 100 EUR)', 'Hardloopschema (km)',
                  'Website bezoekers', 'Productie (eenheden)']
  const chartLabel = levelNum === 0 ? labels[0] : levelNum === 1 ? labels[1] : labels[r(0, labels.length - 1)]

  const successText = correctAnswer
    ? `Juist! De bewering klopt. Je hebt de grafiek correct geïnterpreteerd!`
    : `Goed gezien! De bewering klopt niet. Je hebt de uitzondering in de data gevonden.`
  const errorText = correctAnswer
    ? `Kijk nog eens goed naar de grafiek. De bewering is wél correct — kun je zien waarom?`
    : `Kijk nog eens goed. Ergensis in de grafiek wijkt af van de bewering.`

  return {
    name: `Niveau ${levelNum + 1}`,
    chartLabel,
    claim,
    data,
    correctAnswer,
    successFeedback: successText,
    errorFeedback: errorText,
    highlightIdx
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const points = computed(() => currentLevel.value ? currentLevel.value.data : [])

const userAns = ref(null)

function getHint() {
  if (attemptCount.value === 1) return 'Vergelijk elke dag met de vorige. Is de trend overal hetzelfde?'
  if (attemptCount.value === 2) return 'Zoek naar een dag waar de richting verandert (stijging wordt daling of andersom).'
  return `Kijk naar dag ${['Ma', 'Di', 'Wo', 'Do', 'Vr'][currentLevel.value.highlightIdx]}. Wat gebeurt daar?`
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    isCorrect.value = false
celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    feedback.value = { type: 'info', text: 'Lees de grafiek en beoordeel de uitspraak.' }
    userAns.value = null
}

function checkAnswer(ans) {
  userAns.value = ans
  isChecked.value = true

  if (ans === currentLevel.value.correctAnswer) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: currentLevel.value.successFeedback }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: `${currentLevel.value.errorFeedback} ${getHint()}` }
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            {{ currentLevel.name }} ({{ currentInternalLevel + 1 }}/{{ totalInternalLevels }})
          </span>
          <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
            <PhX class="w-6 h-6" />
          </button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentLevel.instruction || props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-3">Uitspraak: {{ currentLevel.claim }}</label>

               <div class="flex gap-2">
                   <button @click="checkAnswer(true)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === true ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       KLOPT
                   </button>
                   <button @click="checkAnswer(false)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === false ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       FOUT (ONZIN)
                   </button>
               </div>
            </div>

            <div v-if="attemptCount > 0 && !isCorrect" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <p><strong>Poging {{ attemptCount }}:</strong> {{ getHint() }}</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl bg-white shadow-xl rounded-3xl border-4 border-slate-300 p-8 flex flex-col items-center">

                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6">{{ currentLevel.chartLabel }}</h4>

                  <div class="relative">
                      <svg width="500" height="300" viewBox="0 0 500 300" class="block">
                          <g stroke="#f1f5f9" stroke-width="2">
                              <line v-for="i in 5" :key="'hg'+i" x1="50" :y1="250 - (i-1)*50" x2="450" :y2="250 - (i-1)*50" />
                          </g>

                          <line x1="50" y1="250" x2="480" y2="250" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="50" y1="250" x2="50" y2="20" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />

                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <g font-size="12" fill="#64748b" font-weight="bold" text-anchor="end">
                              <text x="40" y="254">0</text>
                              <text x="40" y="204">5</text>
                              <text x="40" y="154">10</text>
                              <text x="40" y="104">15</text>
                              <text x="40" y="54">20</text>
                          </g>

                          <g font-size="14" fill="#475569" font-weight="bold" text-anchor="middle">
                              <text v-for="(pt, idx) in points" :key="'xt'+idx" :x="50 + idx * 80 + 40" y="275">{{ pt.day }}</text>
                          </g>

                          <polyline
                              fill="none"
                              stroke="#0ea5e9"
                              stroke-width="4"
                              stroke-linejoin="round"
                              :points="points.map((pt, idx) => `${50 + idx * 80 + 40},${250 - pt.temp * 10}`).join(' ')"
                              class="animate-draw" />

                          <g v-for="(pt, idx) in points" :key="'pt'+idx">
                              <circle :cx="50 + idx * 80 + 40" :cy="250 - pt.temp * 10" r="6" fill="#0284c7" stroke="white" stroke-width="2" class="animate-fadeIn shadow-sm" :style="`animation-delay: ${idx * 0.2}s`" />
                              <text :x="50 + idx * 80 + 40" :y="250 - pt.temp * 10 - 15" text-anchor="middle" font-weight="bold" fill="#0284c7" font-size="12" class="opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                  {{ pt.temp }}
                              </text>
                          </g>

                          <circle v-if="isChecked && !isCorrect"
                                  :cx="50 + currentLevel.highlightIdx * 80 + 40"
                                  :cy="250 - (currentLevel.data[currentLevel.highlightIdx].temp * 10)"
                                  r="40" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="4 4" class="animate-pulse" />
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-draw {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: draw 2s ease-out forwards;
}
@keyframes draw {
    to { stroke-dashoffset: 0; }
}
</style>
