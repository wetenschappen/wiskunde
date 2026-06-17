<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScan, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Lijnen: Identiteitskaart' },
  instruction: {
    type: String,
    default: 'Een rode lijn snijdt door de blauwe driehoek. Welke lijn is dit?<br/><br/><strong>Opdracht:</strong> Kijk héél goed naar de visuele markeringen op de tekening. Vul de identiteitskaart in met Ja/Nee en kies daarna de juiste naam.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScan }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk naar het rechte-hoek-tekentje en de streepjes op de zijde.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      targetName: 'middelloodlijn',
      targetQ1: false, targetQ2: true, targetQ3: true,
      svgDraw: 'middelloodlijn',
      successMsg: 'Uitstekend! De lijn staat LOODrecht en in het MIDDEN van de zijde, maar trekt zich niets aan van de hoekpunten. Het is de Middelloodlijn.',
      hint1: 'Kijk of de lijn door een hoekpunt gaat. Gaat hij erlangs?',
      hint2: 'Let op het rechte-hoek-tekentje (loodrecht) en de streepjes (midden).',
      hint3: 'Het antwoord is: Middelloodlijn (loodrecht, midden, geen hoekpunt).'
    },
    {
      targetName: 'hoogtelijn',
      targetQ1: true, targetQ2: true, targetQ3: false,
      svgDraw: 'hoogtelijn',
      successMsg: 'Perfect! Hij gaat door de TOP (hoekpunt) en valt recht naar beneden (90°). Waar hij de bodem raakt, maakt niet uit. Het is de Hoogtelijn.',
      hint1: 'Kijk of de lijn door een hoekpunt gaat en loodrecht staat.',
      hint2: 'Hoogtelijn: door hoekpunt (ja), loodrecht (ja), deelt zijde in midden (nee).',
      hint3: 'Het antwoord is: Hoogtelijn (hoekpunt, loodrecht, niet middendoor).'
    },
    {
      targetName: 'zwaartelijn',
      targetQ1: true, targetQ2: false, targetQ3: true,
      svgDraw: 'zwaartelijn',
      successMsg: 'Geweldig! Hij verbindt een hoekpunt met het absolute midden van de overkant. Zwaartelijnen verdelen het gewicht gelijkmatig.',
      hint1: 'Kijk of de lijn door een hoekpunt gaat én de overstaande zijde middendoor deelt.',
      hint2: 'Zwaartelijn: door hoekpunt (ja), loodrecht (nee), deelt zijde in midden (ja).',
      hint3: 'Het antwoord is: Zwaartelijn (hoekpunt, niet loodrecht, wel middendoor).'
    },
    {
      targetName: 'bissectrice',
      targetQ1: true, targetQ2: false, targetQ3: false,
      svgDraw: 'bissectrice',
      successMsg: 'Knap! Een bissectrice vertrekt vanuit een hoekpunt en verdeelt de hoek in twee gelijke delen. Hij staat niet loodrecht en deelt de zijde niet middendoor.',
      hint1: 'Een bissectrice (deellijn) vertrekt vanuit een hoekpunt en verdeelt de hoek.',
      hint2: 'Bissectrice: door hoekpunt (ja), loodrecht (nee), deelt zijde in midden (nee).',
      hint3: 'Het antwoord is: Bissectrice (hoekpunt, niet loodrecht, niet middendoor).'
    }
  ]

  // Shuffle and pick 3
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const q1 = ref(null) // Gaat door een hoekpunt?
const q2 = ref(null) // Loodrecht op de zijde?
const q3 = ref(null) // Deelt de zijde middendoor?
const finalName = ref('')

function getHint(data) {
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Kijk naar het rechte-hoek-tekentje en de streepjes op de zijde.' };
    q1.value = null;
    q2.value = null;
    q3.value = null;
    finalName.value = '';
}

function checkAnswer() {
  isChecked.value = true;

  const allQsAnswered = q1.value !== null && q2.value !== null && q3.value !== null && finalName.value !== ''
  if (!allQsAnswered) {
      isCorrect.value = false
      feedback.value = { type: 'error', text: 'Vul eerst alle Ja/Nee vragen én de naam in.'}
      return
  }

  const data = currentLevelData.value

  if (q1.value === data.targetQ1 && q2.value === data.targetQ2 && q3.value === data.targetQ3 && finalName.value === data.targetName) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: data.successMsg }
  } else {
    isCorrect.value = false
    attemptCount.value++

    // Scaffolding with progressive hints based on mistakes
    const hint = getHint(data)
    if (q1.value !== data.targetQ1) {
        feedback.value = { type: 'error', text: `Kijk naar Vraag 1. Raakt de rode lijn het bovenste hoekpunt van de driehoek? ${data.targetQ1 ? 'Ja, hij vertrekt daar!' : 'Nee, hij gaat er net naast!'} ${hint}`}
    } else if (q2.value !== data.targetQ2) {
        feedback.value = { type: 'error', text: `Kijk naar Vraag 2. Zie je ergens een rood vierkantje (90°)? ${data.targetQ2 ? 'Ja, hij staat loodrecht.' : 'Nee, hij staat een beetje schuin.'} ${hint}`}
    } else if (q3.value !== data.targetQ3) {
        feedback.value = { type: 'error', text: `Kijk naar Vraag 3. Staan er zwarte streepjes op de zijde die tonen dat de helften even lang zijn? ${data.targetQ3 ? 'Ja.' : 'Nee.'} ${hint}`}
    } else {
        feedback.value = { type: 'error', text: `Je eigenschappen kloppen (Ja/Nee), maar de naam van de lijn is fout. Denk logisch na over de combinatie van eigenschappen. ${hint}`}
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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
    levels.value = generateLevel();
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Identiteitskaart</h4>

               <div class="space-y-4">
                   <!-- Q1 -->
                   <div class="flex flex-col gap-2">
                       <span class="text-sm font-bold text-slate-600">Gaat door het hoekpunt?</span>
                       <div class="flex gap-2">
                           <button @click="q1 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q1 === true ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                           <button @click="q1 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q1 === false ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                       </div>
                   </div>

                   <!-- Q2 -->
                   <div class="flex flex-col gap-2">
                       <span class="text-sm font-bold text-slate-600">Loodrecht op de zijde? (90°)</span>
                       <div class="flex gap-2">
                           <button @click="q2 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q2 === true ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                           <button @click="q2 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q2 === false ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                       </div>
                   </div>

                   <!-- Q3 -->
                   <div class="flex flex-col gap-2">
                       <span class="text-sm font-bold text-slate-600">Deelt zijde in het midden?</span>
                       <div class="flex gap-2">
                           <button @click="q3 = true" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q3 === true ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">JA</button>
                           <button @click="q3 = false" :disabled="isCorrect" class="flex-1 py-2 text-sm border-2 rounded-lg transition-colors" :class="q3 === false ? 'bg-teal-500 border-teal-600 text-white font-bold shadow-inner' : 'bg-white border-slate-300 text-slate-500'">NEE</button>
                       </div>
                   </div>

                   <!-- Final Name -->
                   <div class="flex flex-col gap-2 pt-4 border-t border-slate-200">
                       <span class="text-sm font-bold text-slate-800">Naam van de lijn:</span>
                       <select v-model="finalName" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold text-slate-700 bg-white">
                           <option value="" disabled>Kies...</option>
                           <option value="hoogtelijn">Hoogtelijn</option>
                           <option value="zwaartelijn">Zwaartelijn</option>
                           <option value="middelloodlijn">Middelloodlijn</option>
                           <option value="bissectrice">Bissectrice (Deellijn)</option>
                       </select>
                   </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Kaart</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="relative bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-slate-300 p-8">
                  <svg width="400" height="350" viewBox="0 0 400 350" :key="currentInternalLevel">

                      <!-- Scalene Triangle: A(100, 50), B(50, 300), C(350, 300) -->
                      <polygon points="100,50 50,300 350,300" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />

                      <circle cx="100" cy="50" r="6" fill="#1e293b" />
                      <circle cx="50" cy="300" r="6" fill="#1e293b" />
                      <circle cx="350" cy="300" r="6" fill="#1e293b" />

                      <g v-if="currentLevelData.svgDraw === 'middelloodlijn'" class="animate-fadeIn">
                          <!-- Midpoint of base BC is (200, 300) -->
                          <line x1="200" y1="350" x2="200" y2="0" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                          <polyline points="200,285 215,285 215,300" fill="none" stroke="#ef4444" stroke-width="3" />
                          <line x1="125" y1="290" x2="125" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="130" y1="290" x2="130" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="270" y1="290" x2="270" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="275" y1="290" x2="275" y2="310" stroke="#1e293b" stroke-width="3" />
                      </g>

                      <g v-if="currentLevelData.svgDraw === 'hoogtelijn'" class="animate-fadeIn">
                          <!-- From A(100,50) perpendicular to BC (y=300). So down to (100,300) -->
                          <line x1="100" y1="50" x2="100" y2="350" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                          <polyline points="100,285 115,285 115,300" fill="none" stroke="#ef4444" stroke-width="3" />
                      </g>

                      <g v-if="currentLevelData.svgDraw === 'zwaartelijn'" class="animate-fadeIn">
                          <!-- From A(100,50) to midpoint BC(200,300) -->
                          <line x1="100" y1="50" x2="200" y2="300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                          <!-- Ticks only -->
                          <line x1="125" y1="290" x2="125" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="130" y1="290" x2="130" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="270" y1="290" x2="270" y2="310" stroke="#1e293b" stroke-width="3" />
                          <line x1="275" y1="290" x2="275" y2="310" stroke="#1e293b" stroke-width="3" />
                      </g>

                      <g v-if="currentLevelData.svgDraw === 'bissectrice'" class="animate-fadeIn">
                          <!-- From A(100,50) roughly towards interior, no 90°, no midpoint ticks -->
                          <line x1="100" y1="50" x2="220" y2="300" stroke="#ef4444" stroke-width="4" stroke-dasharray="10 5" />
                      </g>

                  </svg>
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
</style>
