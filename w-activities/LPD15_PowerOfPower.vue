<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhCopy, PhArrowsOutLineHorizontal
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten: Macht van een Macht' },
  instruction: {
    type: String,
    default: 'Bij een macht van een macht nemen we een macht <em>over</em> een andere macht. Moet je hier de kleine getalletjes optellen of vermenigvuldigen?<br/><br/><strong>Opdracht:</strong> Pak dit stap voor stap aan. De buitenste macht vertelt ons dat we de haakjes moeten kopiëren. Gebruik de knoppen om dit visueel te maken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stap 1: Klik op "Kopieer".' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Simple — small exponents (inner 2, outer 2-3)
  const b1 = ['a', 'x', 'p'][Math.floor(Math.random() * 3)]
  const inner1 = 2 + Math.floor(Math.random() * 1) // 2
  const outer1 = 2 + Math.floor(Math.random() * 2) // 2-3

  // Level 2: Medium
  const b2 = ['x', 'y', 'm'][Math.floor(Math.random() * 3)]
  const inner2 = 2 + Math.floor(Math.random() * 2) // 2-3
  const outer2 = 3 + Math.floor(Math.random() * 2) // 3-4

  // Level 3: Larger
  const b3 = ['y', 'z', 't'][Math.floor(Math.random() * 3)]
  const inner3 = 3 + Math.floor(Math.random() * 2) // 3-4
  const outer3 = 2 + Math.floor(Math.random() * 2) // 2-3

  levels.value = [
    { base: b1, innerExp: inner1, outerExp: outer1, exactAns: inner1 * outer1 },
    { base: b2, innerExp: inner2, outerExp: outer2, exactAns: inner2 * outer2 },
    { base: b3, innerExp: inner3, outerExp: outer3, exactAns: inner3 * outer3 }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const step = ref(0) // 0: start, 1: copied, 2: expanded
const userAns = ref(null)

function nextAnimStep() {
    if (step.value < 2) {
        step.value++;
        if (step.value === 1) feedback.value = { type: 'info', text: `Goed! We hebben nu ${currentLevelData.value.outerExp} blokken van ${currentLevelData.value.base}^${currentLevelData.value.innerExp}. Klik nu op "Vouw Open".` }
        if (step.value === 2) feedback.value = { type: 'info', text: `Geweldig! Tel het totaal aantal ${currentLevelData.value.base}'tjes en vul je eindantwoord in.` }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Stap 1: Klik op "Kopieer".' };
    step.value = 0;
    userAns.value = null;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const data = currentLevelData.value;

  if (userAns.value === data.exactAns) {
    if (step.value === 2) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Briljant! Je ziet letterlijk ${data.outerExp} groepjes van ${data.innerExp}. Dat is ${data.outerExp} × ${data.innerExp} = ${data.exactAns} ${data.base}'tjes. Bij een macht van een macht moet je de exponenten VERMENIGVULDIGEN.`
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${data.exactAns} is juist, maar doorloop eerst de animatie met de knoppen om te zien WAAROM het zo is!`}
    }
  } else {
    isCorrect.value = false

    if (userAns.value === data.innerExp + data.outerExp) {
        feedback.value = { type: 'error', text: `Fout! Je hebt de exponenten opgeteld (${data.innerExp} + ${data.outerExp} = ${userAns.value}). Kijk naar de opengevouwen blokjes. Het zijn er meer dan ${userAns.value}.`}
    } else if (userAns.value === Math.pow(data.innerExp, data.outerExp)) {
        feedback.value = { type: 'error', text: `Je hebt ${data.innerExp}^${data.outerExp} berekend. Maar de rekenregel werkt anders. Volg de visuele blokjes.`}
    } else if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Kijk naar de ${currentLevelData.value.outerExp} groepjes. Elk groepje bevat ${currentLevelData.value.innerExp} ${currentLevelData.value.base}'tjes. Hoeveel ${currentLevelData.value.base}'tjes zijn dat in totaal? (${currentLevelData.value.outerExp} × ${currentLevelData.value.innerExp})`}
    } else if (attemptCount.value >= 2) {
        feedback.value = { type: 'error', text: `Vouw de haakjes open (Stap 2) en tel het aantal roze ${data.base}-blokjes.`}
    } else {
        feedback.value = { type: 'error', text: `Tel het aantal roze ${data.base}-blokjes zodra ze allemaal opengevouwen zijn (Stap 2).`}
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-pink-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-pink-500' : 'bg-slate-200'"></div>
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

            <div class="p-4 mt-6 border border-pink-200 bg-pink-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-pink-900 mb-4">Eindantwoord:</label>

               <div class="flex items-center justify-center gap-4 text-4xl font-black text-slate-700 mb-2">
                   <div class="flex items-start">
                       <span>({{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.innerExp }}</sup>)<sup class="text-3xl -ml-1">{{ currentLevelData.outerExp }}</sup></span>
                   </div>
                   <span>=</span>

                   <div class="flex items-start bg-white p-2 rounded border-2 border-pink-300">
                       <span class="text-pink-700">{{ currentLevelData.base }}</span>
                       <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                              class="w-16 font-bold text-2xl p-1 -mt-2 -mr-1 border-b-2 border-pink-200 focus:border-pink-500 focus:outline-none text-center text-pink-600 bg-transparent" />
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

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <div class="mb-12 flex gap-4 h-12">
                      <button v-if="step === 0" @click="nextAnimStep"
                              class="px-6 font-bold bg-slate-800 text-white rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all">
                          <PhCopy weight="bold" class="w-5 h-5" /> Kopieer (Buitenste Macht {{ currentLevelData.outerExp }})
                      </button>
                      <button v-if="step === 1" @click="nextAnimStep"
                              class="px-6 font-bold bg-pink-600 text-white rounded-full shadow-lg flex items-center gap-2 hover:bg-pink-500 active:scale-95 transition-all animate-fadeIn">
                          <PhArrowsOutLineHorizontal weight="bold" class="w-5 h-5" /> Vouw Open (Binnenste Macht {{ currentLevelData.innerExp }})
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="flex items-center justify-center gap-6 relative min-h-[160px] flex-wrap">

                      <!-- INITIAL STATE -->
                      <div v-if="step === 0" class="flex items-start bg-slate-200 border-4 border-slate-400 p-8 rounded-3xl shadow-lg">
                          <span class="font-black text-6xl text-slate-700">({{ currentLevelData.base }}<sup class="text-4xl">{{ currentLevelData.innerExp }}</sup>)</span>
                          <span class="font-black text-4xl text-slate-700 -ml-2"><sup>{{ currentLevelData.outerExp }}</sup></span>
                      </div>

                      <!-- STEP 1: Outer expansion -->
                      <template v-if="step >= 1">
                          <div v-for="group in currentLevelData.outerExp" :key="'g'+group"
                               class="flex items-center justify-center transition-all duration-700"
                               :class="step === 2 ? 'gap-2 bg-transparent p-0' : 'bg-slate-200 border-4 border-slate-400 p-6 rounded-2xl shadow-md animate-fadeIn'">

                              <div v-if="step === 1" class="font-black text-4xl text-slate-700">
                                  {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.innerExp }}</sup>
                              </div>

                              <!-- STEP 2: Inner expansion -->
                              <template v-if="step === 2">
                                  <div v-for="i in currentLevelData.innerExp" :key="'e'+group+'-'+i"
                                       class="w-16 h-16 bg-pink-100 border-4 border-pink-400 rounded-xl flex items-center justify-center font-black text-3xl text-pink-700 shadow-sm animate-fadeIn"
                                       :style="`animation-delay: ${(group * currentLevelData.innerExp + i) * 0.05}s`">
                                      {{ currentLevelData.base }}
                                  </div>
                              </template>

                          </div>
                      </template>

                  </div>

                  <!-- Connector bracket when fully expanded -->
                  <div v-if="step === 2" class="mt-12 w-full max-w-2xl flex flex-col items-center animate-fadeIn" style="animation-delay: 1s">
                      <div class="w-[85%] h-4 border-b-4 border-x-4 border-emerald-500 rounded-b-xl"></div>
                      <span class="mt-4 font-black text-2xl text-emerald-600 bg-emerald-50 px-4 py-1 rounded shadow-sm border border-emerald-200">
                          {{ currentLevelData.outerExp }} groepjes van {{ currentLevelData.innerExp }} = {{ currentLevelData.exactAns }} stuks
                      </span>
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>