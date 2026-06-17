<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhChartBar, PhArrowClockwise, PhMoney
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Statistiek: De Uitschieter' },
  instruction: {
    type: String,
    default: 'We vergelijken het <strong>Gemiddelde</strong> (alles optellen en delen door aantal) met de <strong>Mediaan</strong> (het exacte midden van de geordende rij).<br/><br/><strong>Opdracht:</strong> Kijk naar het normale zakgeld van 5 leerlingen. Voeg dan ineens een "Uitschieter" toe (iemand die belachelijk veel krijgt). Welke centrummaat wordt het meest beïnvloed?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartBar }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de uitschieter toe te voegen.' })
const attemptCount = ref(0)

// Internal level system
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)

const levels = ref([])

function generateLevel() {
  const generated = []

  // Level 1 — constrained ranges
  const l1Normal = [8 + Math.floor(Math.random() * 4), 12 + Math.floor(Math.random() * 4), 15 + Math.floor(Math.random() * 4), 18 + Math.floor(Math.random() * 4), 22 + Math.floor(Math.random() * 4)]
  l1Normal.sort((a, b) => a - b)
  const l1Outlier = 150 + Math.floor(Math.random() * 100) // 150-250
  generated.push({
    name: 'Niveau 1',
    normalData: l1Normal,
    outlier: l1Outlier,
    scaleMax: Math.max(...l1Normal) + l1Outlier + 20,
    instruction: `We vergelijken het <strong>Gemiddelde</strong> (alles optellen en delen door aantal) met de <strong>Mediaan</strong> (het exacte midden van de geordende rij).<br/><br/><strong>Opdracht:</strong> Kijk naar het normale zakgeld van 5 leerlingen. Voeg dan ineens een "Uitschieter" toe (&euro;${l1Outlier}). Welke centrummaat wordt het meest beïnvloed?`,
    feedbackAfter: `Wow! De uitschieter (&euro;${l1Outlier}) is toegevoegd. Kijk wat er met het gemiddelde en de mediaan is gebeurd. Geef je conclusie.`
  })

  // Level 2 — wider ranges
  const l2Normal = Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 2).sort((a, b) => a - b)
  const l2Outlier = 60 + Math.floor(Math.random() * 60) // 60-120
  generated.push({
    name: 'Niveau 2',
    normalData: l2Normal,
    outlier: l2Outlier,
    scaleMax: Math.max(...l2Normal) + l2Outlier + 20,
    instruction: `Vijf vrienden vergelijken hun spaargeld: &euro;${l2Normal.join(', &euro;')}.<br/><br/><strong>Opdracht:</strong> Voeg een uitschieter toe van <strong>&euro;${l2Outlier}</strong>. Vergelijk hoe het gemiddelde en de mediaan reageren.`,
    feedbackAfter: `Kijk! De uitschieter (&euro;${l2Outlier}) trekt het gemiddelde omhoog, maar de mediaan verandert maar weinig. Welke maat is het bestand tegen uitschieters?`
  })

  // Level 3 — widest ranges
  const l3Normal = Array.from({ length: 5 }, () => Math.floor(Math.random() * 35) + 15).sort((a, b) => a - b)
  const l3Outlier = 150 + Math.floor(Math.random() * 160) // 150-310
  generated.push({
    name: 'Niveau 3',
    normalData: l3Normal,
    outlier: l3Outlier,
    scaleMax: Math.max(...l3Normal) + l3Outlier + 30,
    instruction: `Een groep verdient per week: &euro;${l3Normal.join(', &euro;')}.<br/><br/><strong>Opdracht:</strong> Voeg een uitschieter toe van <strong>&euro;${l3Outlier}</strong> (iemand die veel meer verdient). Observeer wat er met het gemiddelde en de mediaan gebeurt.`,
    feedbackAfter: `Ongelooflijk! De uitschieter (&euro;${l3Outlier}) laat het gemiddelde exploderen, maar de mediaan verandert amper. De mediaan is de "robuste" maat!`
  })

  return generated
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const hasOutlier = ref(false)
const userAns = ref('')

const currentData = computed(() => {
    return hasOutlier.value
        ? [...currentLevel.value.normalData, currentLevel.value.outlier].sort((a,b) => a-b)
        : [...currentLevel.value.normalData]
})

const mean = computed(() => {
    const sum = currentData.value.reduce((a, b) => a + b, 0)
    return Math.round(sum / currentData.value.length)
})

const median = computed(() => {
    const data = currentData.value
    const mid = Math.floor(data.length / 2)
    if (data.length % 2 === 0) {
        return (data[mid - 1] + data[mid]) / 2
    }
    return data[mid]
})

function addOutlier() {
    if (isCorrect.value) return;
    hasOutlier.value = true
    feedback.value = { type: 'success', text: currentLevel.value.feedbackAfter }
}

function resetActivityState() {
    levels.value = generateLevel()
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de uitschieter toe te voegen.' };
    hasOutlier.value = false;
    userAns.value = '';
    attemptCount.value = 0;
}

function checkAnswer() {
  isChecked.value = true;

  if (userAns.value === 'mean') {
    if (hasOutlier.value) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: 'Uitstekend! Het gemiddelde wordt veel meer beïnvloed door een uitschieter dan de mediaan. De mediaan is veel "robuuster". Dit geldt voor alle datasets!'
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: 'Je antwoord klopt! Maar voeg eerst de uitschieter toe in de grafiek om het visueel te bewijzen.'}
    }
  } else if (userAns.value === 'median') {
    isCorrect.value = false
    attemptCount.value++
    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: 'Kijk naar de getallen in het blauw. De mediaan verandert veel minder dan het gemiddelde. Welke is het meest beïnvloed?'}
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: 'Let op de oranje lijn (gemiddelde) versus de blauwe lijn (mediaan). Welke schiet omhoog?'}
    } else {
      feedback.value = { type: 'error', text: 'Het antwoord is "Gemiddelde". De uitschieter heeft een grote invloed op het gemiddelde omdat alle getallen worden opgeteld.'}
    }
  } else if (userAns.value === 'none') {
    isCorrect.value = false
    attemptCount.value++
    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: 'Kijk nog eens goed: een van de twee maten verandert wél.'}
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: 'Het gemiddelde of de mediaan? Sleep met je ogen de oranje en blauwe lijn.'}
    } else {
      feedback.value = { type: 'error', text: 'Het gemiddelde verandert wél. De mediaan blijft bijna gelijk. Kies "Gemiddelde".'}
    }
  } else {
    isCorrect.value = false
    attemptCount.value++
    feedback.value = { type: 'error', text: 'Kies een conclusie uit de lijst.'}
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    emit('complete')
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
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
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm text-slate-600" v-html="currentLevel.instruction"></div>

            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-teal-900 mb-2">Conclusie:</label>
               <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-teal-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-700 bg-white">
                   <option value="" disabled>Wat verandert het hardst?</option>
                   <option value="mean">Het gemiddelde schiet omhoog!</option>
                   <option value="median">De mediaan schiet omhoog!</option>
                   <option value="none">Beide blijven exact hetzelfde.</option>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === ''" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer Conclusie</button>
              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <div class="mb-12">
                      <button @click="addOutlier" :disabled="isCorrect || hasOutlier"
                              class="px-6 py-3 font-bold bg-white text-orange-600 border-2 border-orange-500 rounded-xl shadow-lg flex items-center gap-2 hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-50">
                          <PhMoney weight="bold" class="w-6 h-6" /> Voeg Uitschieter Toe (&euro;{{ currentLevel.outlier }})
                      </button>
                  </div>

                  <div class="flex w-full gap-8">
                      <!-- Left Panel: Data and Stats -->
                      <div class="flex-1 bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200 flex flex-col items-center justify-center">
                          <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Centrummaten</h4>

                          <div class="flex items-center gap-2 mb-8 flex-wrap justify-center font-mono font-bold text-slate-600">
                              <span v-for="(val, idx) in currentData" :key="idx" class="bg-slate-100 px-3 py-1 rounded border border-slate-300 shadow-sm animate-fadeIn" :class="val > currentLevel.normalData[4] ? 'bg-orange-100 border-orange-300 text-orange-700' : ''">
                                  {{ val }}
                              </span>
                          </div>

                          <div class="w-full space-y-4">
                              <div class="flex items-center justify-between p-3 rounded-lg border-2 border-blue-200 bg-blue-50 transition-all duration-500">
                                  <span class="font-bold text-blue-800">Mediaan (Middelste)</span>
                                  <span class="font-black text-2xl text-blue-600" :key="median">{{ median }}</span>
                              </div>

                              <div class="flex items-center justify-between p-3 rounded-lg border-2 border-fuchsia-200 bg-fuchsia-50 transition-all duration-500" :class="hasOutlier ? 'border-red-400 bg-red-100 ring-2 ring-red-200' : ''">
                                  <span class="font-bold" :class="hasOutlier ? 'text-red-800' : 'text-fuchsia-800'">Gemiddelde (Som / Aantal)</span>
                                  <span class="font-black text-2xl" :class="hasOutlier ? 'text-red-600 animate-pulse' : 'text-fuchsia-600'" :key="mean">{{ mean }}</span>
                              </div>
                          </div>
                      </div>

                      <!-- Right Panel: Visual Number Line -->
                      <div class="flex-1 bg-slate-800 p-6 rounded-2xl shadow-xl border-4 border-slate-900 flex items-center justify-center relative min-h-[300px] overflow-hidden">

                          <!-- Number Line -->
                          <div class="absolute left-10 right-10 bottom-20 h-2 bg-slate-600 rounded-full"></div>

                          <!-- Scale ticks: 0 and scaleMax -->
                          <div class="absolute left-10 bottom-14 font-mono text-slate-400 text-xs font-bold">0</div>
                          <div class="absolute left-[calc(10px+200*1.5px)] bottom-14 font-mono text-slate-400 text-xs font-bold">{{ currentLevel.scaleMax }}</div>

                          <!-- Scale: 1 unit = 1.5px per unit * scaleMax/200 adjustment factor. -->
                          <!-- For simplicity we keep 1 unit = 1.5px and let the scaleMax label track it -->
                          <!-- Dots for data -->
                          <div v-for="(val, idx) in currentData" :key="'d'+idx"
                               class="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
                               :class="val > currentLevel.normalData[4] ? 'bg-orange-500' : 'bg-slate-300'"
                               :style="{ left: `calc(10px + ${val * 1.5}px)`, bottom: 'calc(5rem - 2px)' }">
                          </div>

                          <!-- Median Line (Blue) -->
                          <div class="absolute w-1 h-32 bg-blue-500 transform -translate-x-1/2 bottom-20 transition-all duration-700 ease-in-out shadow-[0_0_10px_#3b82f6]"
                               :style="{ left: `calc(10px + ${median * 1.5}px)` }">
                               <span class="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-blue-400 text-xs uppercase tracking-widest bg-slate-800 px-1">Med</span>
                          </div>

                          <!-- Mean Line (Fuchsia/Red) -->
                          <div class="absolute w-1 h-40 transform -translate-x-1/2 bottom-20 transition-all duration-1000 ease-in-out shadow-[0_0_15px_currentColor]"
                               :class="hasOutlier ? 'bg-red-500 text-red-500' : 'bg-fuchsia-500 text-fuchsia-500'"
                               :style="{ left: `calc(10px + ${mean * 1.5}px)` }">
                               <span class="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xs uppercase tracking-widest bg-slate-800 px-1" :class="hasOutlier ? 'text-red-400' : 'text-fuchsia-400'">Gem</span>
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>