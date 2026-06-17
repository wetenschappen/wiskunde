<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBoundingBox, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Classificatie: De Vierhoeken-Matroesjka' },
  instruction: {
    type: String,
    default: 'Vierhoeken zitten in elkaar genest als Russische matroesjka-poppetjes. Een vorm met heel veel strenge regels (zoals een vierkant) past binnenin een vorm met minder regels.<br/><br/><strong>Opdracht:</strong> Beoordeel de uitspraak. Is ze Waar of Vals? Kijk daarna hoe de dozen zich gedragen om het bewijs te zien!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBoundingBox }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Lees de uitspraak goed en klik op WAAR of VALS.' })
const attemptCount = ref(0)

// Level Logic — dynamically generated
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const statementPool = [
    { text: 'Elk vierkant is ook een rechthoek.', isTrue: true, inner: 'Vierkant', outer: 'Rechthoek',
      hint1: 'Welke regels heeft een rechthoek? (Evenwijdige overstaande zijden, rechte hoeken...) Volgt het vierkant die allemaal?',
      hint2: 'Een vierkant heeft rechte hoeken en evenwijdige zijden, net als een rechthoek. Het enige verschil: vierkant heeft extra regels.' },
    { text: 'Elke rechthoek is ook een vierkant.', isTrue: false, inner: 'Rechthoek', outer: 'Vierkant',
      hint1: 'Om een vierkant te zijn, moeten ALLE vier zijden even lang zijn. Geldt dat voor elke rechthoek?',
      hint2: 'Denk aan een breed, plat rechthoekig veld. Zijn alle zijden even lang?' },
    { text: 'Elke ruit is ook een vierkant.', isTrue: false, inner: 'Ruit', outer: 'Vierkant',
      hint1: 'Een vierkant heeft rechte hoeken (90°). Heeft een ruit dat altijd?',
      hint2: 'Een ruit heeft gelijke zijden, maar de hoeken mogen verschillen van 90°.' },
    { text: 'Elk vierkant is ook een ruit.', isTrue: true, inner: 'Vierkant', outer: 'Ruit',
      hint1: 'Een ruit heeft gelijke zijden en overstaande evenwijdige zijden. Heeft een vierkant dat?',
      hint2: 'Tel de eigenschappen: vierkant heeft alle zijden gelijk (ruit!) plus rechte hoeken.' },
    { text: 'Elke rechthoek is ook een parallellogram.', isTrue: true, inner: 'Rechthoek', outer: 'Parallellogram',
      hint1: 'Een parallellogram heeft overstaande zijden evenwijdig. Heeft een rechthoek dat?',
      hint2: 'Een rechthoek heeft overstaande zijden die evenwijdig zijn, dus het is een speciaal parallellogram.' },
    { text: 'Elk parallellogram is ook een rechthoek.', isTrue: false, inner: 'Parallellogram', outer: 'Rechthoek',
      hint1: 'Een rechthoek vereist rechte hoeken (90°). Heeft een parallellogram dat altijd?',
      hint2: 'Een parallellogram kan scheef staan. De hoeken zijn dan geen 90°.' },
    { text: 'Elke ruit is ook een parallellogram.', isTrue: true, inner: 'Ruit', outer: 'Parallellogram',
      hint1: 'Een parallellogram heeft overstaande zijden evenwijdig. Heeft een ruit dat?',
      hint2: 'Een ruit heeft alle zijden gelijk, dus zeker overstaande zijden evenwijdig. Het is een speciaal parallellogram.' },
    { text: 'Elk parallellogram is ook een ruit.', isTrue: false, inner: 'Parallellogram', outer: 'Ruit',
      hint1: 'Een ruit vereist dat ALLE vier zijden even lang zijn. Geldt dat voor elk parallellogram?',
      hint2: 'Een parallellogram kan verschillende zijdelengtes hebben. Een ruit heeft altijd gelijke zijden.' },
    { text: 'Elk vierkant is ook een parallellogram.', isTrue: true, inner: 'Vierkant', outer: 'Parallellogram',
      hint1: 'Een parallellogram heeft overstaande zijden evenwijdig. Heeft een vierkant dat?',
      hint2: 'Een vierkant heeft alle eigenschappen van een parallellogram, plus nog veel meer!' }
  ]

  // Shuffle and pick 3, ensuring variety
  const shuffled = [...statementPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const userAns = ref(null)
const showNesting = ref(false)

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Lees de uitspraak goed en klik op WAAR of VALS.' };
    userAns.value = null;
    showNesting.value = false;
}

function checkAnswer(ans) {
  if (isCorrect.value) return;

  userAns.value = ans;
  isChecked.value = true;
  showNesting.value = true;

  const data = currentLevelData.value;

  if (userAns.value === data.isTrue) {
      isCorrect.value = true
      attemptCount.value = 0
      if (data.isTrue) {
          feedback.value = { type: 'success', text: `Correct! De ${data.inner} volgt AL de regels van de ${data.outer}, dus hij past er perfect in.` }
      } else {
          feedback.value = { type: 'success', text: `Correct! De ${data.outer} is veel strenger. De ${data.inner} past daar dus niet zomaar in!` }
      }
  } else {
      isCorrect.value = false
      attemptCount.value++

      if (attemptCount.value <= 1) {
          if (data.isTrue) {
              feedback.value = { type: 'error', text: `Fout. Een ${data.outer} eist bepaalde regels. De ${data.inner} volgt AL die regels, en is dus lid van de club!`}
          } else {
              feedback.value = { type: 'error', text: `Fout. Een ${data.outer} is veel strenger (meer regels) dan een ${data.inner}.`}
          }
      } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: data.hint1 }
      } else {
          feedback.value = { type: 'error', text: data.hint2 }
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

            <div class="p-4 mt-6 border border-emerald-200 bg-emerald-50 rounded-xl shadow-inner text-center">
               <span class="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-2">Uitspraak {{ currentInternalLevel + 1 }}</span>

               <p class="font-bold text-lg text-slate-800 mb-6 bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                   "{{ currentLevelData.text }}"
               </p>

               <div class="flex gap-2">
                   <button @click="checkAnswer(true)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === true ? (userAns === currentLevelData.isTrue ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       WAAR
                   </button>
                   <button @click="checkAnswer(false)" :disabled="isCorrect"
                           class="flex-1 py-3 rounded-lg font-bold transition-colors border-2"
                           :class="userAns === false ? (userAns === currentLevelData.isTrue ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white') : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       VALS
                   </button>
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
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <!-- No check button — WAAR/VALS auto-checks -->
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full h-full flex flex-col items-center justify-center relative">

                  <!-- Base Outer Box -->
                  <div class="w-64 h-64 border-4 border-slate-700 bg-white rounded-xl shadow-lg relative flex items-start justify-center pt-4 transition-all duration-1000 z-0"
                       :class="showNesting && currentLevelData.isTrue ? 'scale-110 border-emerald-500' : (showNesting && !currentLevelData.isTrue ? 'border-red-500 animate-shake' : '')">
                      <span class="font-black text-xl text-slate-800 uppercase tracking-widest">{{ currentLevelData.outer }}</span>
                  </div>

                  <!-- Inner Box (Floating initially, then nests) -->
                  <div class="w-48 h-48 border-4 border-blue-500 bg-blue-50 rounded-xl shadow-xl flex items-center justify-center absolute transition-all duration-1000 ease-in-out z-10"
                       :class="showNesting && currentLevelData.isTrue ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]' : 'top-12 -left-12 -translate-y-12'">
                      <span class="font-black text-lg text-blue-700 uppercase tracking-widest">{{ currentLevelData.inner }}</span>

                      <!-- X Mark if it doesn't fit -->
                      <div v-if="showNesting && !currentLevelData.isTrue" class="absolute inset-0 flex items-center justify-center pointer-events-none animate-fadeIn">
                          <PhX weight="bold" class="w-32 h-32 text-red-500/80" />
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
