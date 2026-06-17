<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBrain, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Bewijzen: Het Ongerijmde' },
  instruction: {
    type: String,
    default: 'Een "Bewijs uit het ongerijmde" (Proof by Contradiction) is een briljante techniek. Je neemt exact het <strong>tegenovergestelde</strong> aan van wat je wil bewijzen. Daarna toon je aan dat deze aanname tot totale onzin leidt!<br/><br/><strong>Opdracht:</strong> Kies de juiste start-aanname om te bewijzen dat er oneindig veel priemgetallen bestaan.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBrain }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste aanname om de machine te starten.' })

// --- Level System ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    // Level 1: sqrt(2) is irrational
    instruction: 'Level 1: Een klassiek bewijs uit het ongerijmde.<br/><br/><strong>Vraag:</strong> Hoe bewijzen we dat √2 irrationaal is? Kies de juiste start-aanname!',
    proposition: '"√2 is een irrationaal getal"',
    directLabel: 'Neem aan: "√2 is rationaal na vereenvoudiging..."',
    oppositeLabel: 'Neem aan: "√2 = a/b in vereenvoudigde breuk, met a en b geheel..."',
    step1Text: 'Als √2 = a/b in vereenvoudigde vorm, dan is a² = 2b². Dus a is even. Stel a = 2k. Dan 4k² = 2b², dus b² = 2k². Dan is b ook even. Beide even?',
    step2Text: 'PARADOX! a en b zijn allebei even, dus de breuk a/b kon vereenvoudigd worden. Dit is in tegenspraak met de aanname dat a/b vereenvoudigd was!',
    step1Feedback: 'Briljant. We nemen aan dat √2 wél rationaal is, geschreven als een vereenvoudigde breuk a/b. Laten we dit door de logica-machine halen...',
    step2Feedback: 'PARADOX! De aanname dat √2 rationaal is leidt tot een tegenspraak. Dus √2 is irrationaal. Bewijs geleverd!',
    errorFeedback: 'Nee. Voor een bewijs uit het ongerijmde moet je het TEGENGESTELDE aannemen van wat je wil bewijzen.'
  },
  {
    // Level 2: Infinite primes (original content)
    instruction: 'Level 2: Een "Bewijs uit het ongerijmde" (Proof by Contradiction) is een briljante techniek. Je neemt exact het <strong>tegenovergestelde</strong> aan van wat je wil bewijzen. Daarna toon je aan dat deze aanname tot totale onzin leidt!<br/><br/><strong>Opdracht:</strong> Kies de juiste start-aanname om te bewijzen dat er oneindig veel priemgetallen bestaan.',
    proposition: '"Er bestaan oneindig veel priemgetallen."',
    directLabel: 'Neem aan: "Er bestaan oneindig veel priemgetallen..."',
    oppositeLabel: 'Neem aan: "Er bestaat een ALLERGROOTSTE priemgetal P..."',
    step1Text: 'We bouwen een nieuw getal Q: vermenigvuldig alle priemgetallen tot en met P, en tel er 1 bij op...',
    step2Text: 'ONZIN! Q is groter dan P, maar Q is niet deelbaar door enig priemgetal! Dus Q is zelf priem, of heeft een priemfactor groter dan P!',
    step1Feedback: 'Geniaal. We nemen even aan dat er wél een grootste priemgetal is. Laten we deze theorie door de logica-machine duwen...',
    step2Feedback: 'PARADOX! De theorie ontploft. De aanname kán dus niet kloppen, wat bewijst dat de oorspronkelijke stelling WAAR is.',
    errorFeedback: 'Nee. Als je een bewijs uit het ongerijmde start, moet je exact het TEGENGESTELDE aannemen van wat je eigenlijk wil bewijzen.'
  },
  {
    // Level 3: No smallest positive rational number
    instruction: 'Level 3: Nog een bewijs uit het ongerijmde. Denk goed na over wat het "tegenovergestelde" is.<br/><br/><strong>Vraag:</strong> Hoe bewijzen we dat er geen kleinste positief rationeel getal bestaat?',
    proposition: '"Er bestaat geen kleinste positief rationeel getal."',
    directLabel: 'Neem aan: "Er bestaan oneindig veel rationale getallen..."',
    oppositeLabel: 'Neem aan: "Er bestaat een ALLERKLEINSTE positief rationeel getal R..."',
    step1Text: 'Stel R is het kleinste positieve rationale getal. Dan is R/2 ook positief en rationeel. Maar R/2 is kleiner dan R! Hoe kan R dan het kleinste zijn?',
    step2Text: 'PARADOX! R/2 is een positief rationeel getal dat kleiner is dan R. Dus R kan niet het kleinste zijn. Dit is een tegenspraak met de aanname!',
    step1Feedback: 'Scherpzinnig. We nemen aan dat er wél een kleinste positief rationeel getal is. Laten we deze bewering door de machine halen...',
    step2Feedback: 'PARADOX! De helft van R is ook positief en rationeel, maar kleiner dan R. Tegenspraak! De stelling is dus bewezen.',
    errorFeedback: 'Nee. Voor een bewijs uit het ongerijmde begin je met het TEGENGESTELDE van wat je wil bewijzen.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])

// Domain Logic
const step = ref(0) // 0: select, 1: running logic, 2: paradox!
const selectedAssumption = ref(null)

function runProof(choice) {
    if (isCorrect.value) return;

    selectedAssumption.value = choice
    isChecked.value = true

    if (choice === 'opposite') {
        step.value = 1
        feedback.value = { type: 'success', text: currentLevelData.value.step1Feedback }

        setTimeout(() => {
            step.value = 2
            isCorrect.value = true
            feedback.value = { type: 'success', text: currentLevelData.value.step2Feedback }
        }, 2000)

    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: currentLevelData.value.errorFeedback }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kies de juiste aanname om de machine te starten.' };
    step.value = 0;
    selectedAssumption.value = null;
}

function nextLevel() {
    currentInternalLevel.value++
    resetActivityState()
}

function handleLevelComplete() {
    if (currentInternalLevel.value < totalInternalLevels - 1) {
        nextLevel()
    } else {
        goToNextStep()
    }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">

      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-3 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="font-medium">Level {{ currentInternalLevel + 1 }}/{{ totalInternalLevels }}</span>
                <div class="flex items-center gap-1">
                  <span v-for="lvl in totalInternalLevels" :key="lvl"
                        class="w-2 h-2 rounded-full transition-all duration-300"
                        :class="lvl - 1 <= currentInternalLevel ? 'bg-emerald-400' : 'bg-slate-600'">
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="currentLevelData.instruction"></div>

            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">Te Bewijzen:</label>
               <div class="font-bold text-lg text-emerald-400 bg-emerald-900/30 p-4 rounded-lg border border-emerald-800">
                   "{{ currentLevelData.proposition }}"
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleLevelComplete" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <!-- Step 0: Choose Assumption -->
                  <div class="flex gap-4 mb-12" :class="step > 0 ? 'opacity-30 pointer-events-none' : ''">
                      <button @click="runProof('direct')" class="flex-1 p-6 bg-slate-800 border-4 border-slate-600 rounded-2xl hover:bg-slate-700 transition-all active:scale-95 shadow-lg text-left group">
                          <span class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rechtstreeks (Fout)</span>
                          <span class="font-bold text-slate-200 group-hover:text-white">{{ currentLevelData.directLabel }}</span>
                      </button>
                      <button @click="runProof('opposite')" class="flex-1 p-6 bg-slate-800 border-4 border-emerald-600 rounded-2xl hover:bg-slate-700 transition-all active:scale-95 shadow-lg text-left group">
                          <span class="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Ongerijmde (Correct)</span>
                          <span class="font-bold text-slate-200 group-hover:text-white">{{ currentLevelData.oppositeLabel }}</span>
                      </button>
                  </div>

                  <!-- The Logic Machine -->
                  <div class="relative w-full max-w-2xl min-h-[300px] flex flex-col items-center" :class="step === 0 ? 'opacity-0' : 'animate-fadeIn'">

                      <!-- Conveyor Belt -->
                      <div class="w-8 h-20 bg-slate-700 border-x-4 border-slate-500 rounded flex items-center justify-center relative overflow-hidden z-0">
                          <div class="absolute inset-0 bg-slate-600 opacity-50" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 10px, #94a3b8 10px, #94a3b8 20px); animation: belt 1s linear infinite;"></div>
                      </div>

                      <!-- The Box (Theory) -->
                      <div class="w-64 bg-slate-800 border-4 border-emerald-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10 relative mt-[-10px] transition-all duration-700"
                           :class="step === 2 ? 'border-red-500 bg-red-900/30 animate-shake shadow-[0_0_50px_rgba(239,68,68,0.8)]' : ''">

                          <p v-if="step === 1" class="font-bold text-center text-emerald-400 animate-pulse">
                              {{ currentLevelData.step1Text }}
                          </p>

                          <p v-if="step === 2" class="font-black text-center text-red-400 text-xl">
                              {{ currentLevelData.step2Text }}
                          </p>

                          <!-- Explosion FX -->
                          <div v-if="step === 2" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <div class="w-full h-2 bg-amber-400 rotate-12 transform scale-150 animate-slash"></div>
                              <div class="w-full h-2 bg-red-500 -rotate-12 transform scale-150 animate-slash" style="animation-delay: 0.1s"></div>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@keyframes belt {
    from { background-position: 0 0; }
    to { background-position: 0 20px; }
}

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash {
    animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    transform-origin: center;
}
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1;}
    100% { transform: scaleX(1.5); opacity: 0.8;}
}
</style>