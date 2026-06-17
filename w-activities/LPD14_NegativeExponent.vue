<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhCaretUp, PhCaretDown
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten: Negatieve Exponenten' },
  instruction: {
    type: String,
    default: 'Een macht vertelt je hoeveel keer je moet <strong>vermenigvuldigen</strong> met het grondtal (startend bij 1).<br/>Een NEGATIEVE macht betekent precies het omgekeerde: <strong>delen</strong>!<br/><br/><strong>Opdracht:</strong> Los de berekening op. Gebruik de machine om de exponent in te stellen en kijk wat er gebeurt. Vul daarna de breuk in.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de pijltjes om de exponent (het kleine getal) in te stellen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: base 2-5, exponent -2 or -3
  const bases1 = [2, 3, 4, 5]
  const b1 = bases1[Math.floor(Math.random() * bases1.length)]
  const exp1 = -2
  const den1 = Math.pow(b1, Math.abs(exp1))
  newLevels.push({
    goalText: 'Opdracht 1: De basis',
    base: b1,
    targetExponent: exp1,
    targetNum: 1,
    targetDen: den1,
    hintError: `Kijk naar de machine als je hem op ${b1}^(${exp1}) zet. Je begint met 1, en deelt ${Math.abs(exp1)} keer door ${b1}. Vul dit in als breuk.`
  })

  // Level 2: base 2-6, exponent -3
  const bases2 = [2, 3, 5, 6]
  const b2 = bases2[Math.floor(Math.random() * bases2.length)]
  const exp2 = -3
  const den2 = Math.pow(b2, Math.abs(exp2))
  newLevels.push({
    goalText: 'Opdracht 2: Een ander grondtal',
    base: b2,
    targetExponent: exp2,
    targetNum: 1,
    targetDen: den2,
    hintError: `Kijk naar de machine op ${b2}^(${exp2}). Je deelt ${Math.abs(exp2)} keer door ${b2}. Dat is 1 gedeeld door (${b2}×${b2}×${b2}).`
  })

  // Level 3: base 4-10, exponent -2
  const bases3 = [4, 5, 7, 8, 9, 10]
  const b3 = bases3[Math.floor(Math.random() * bases3.length)]
  const exp3 = -2
  const den3 = Math.pow(b3, Math.abs(exp3))
  newLevels.push({
    goalText: 'Opdracht 3: Exponent negatief',
    base: b3,
    targetExponent: exp3,
    targetNum: 1,
    targetDen: den3,
    hintError: `${b3}^(${exp3}) betekent: deel 1 twee keer door ${b3}. Dus 1 gedeeld door ${b3 * b3}.`
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const exponent = ref(0) // Start at 0

const userNum = ref(null)
const userDen = ref(null)

const operationList = computed(() => {
    let ops = []
    const base = currentLevelData.value.base
    if (exponent.value > 0) {
        for(let i=0; i<exponent.value; i++) ops.push(`× ${base}`)
    } else if (exponent.value < 0) {
        for(let i=0; i<Math.abs(exponent.value); i++) ops.push(`÷ ${base}`)
    }
    return ops
})

const currentResultStr = computed(() => {
    const base = currentLevelData.value.base
    if (exponent.value >= 0) return Math.pow(base, exponent.value).toString()
    return `1 / ${Math.pow(base, Math.abs(exponent.value))}`
})

function increaseExponent() {
    if (exponent.value < 3 && !isCorrect.value) exponent.value++
}
function decreaseExponent() {
    if (exponent.value > -3 && !isCorrect.value) exponent.value--
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Gebruik de pijltjes om de exponent (het kleine getal) in te stellen.' };
    exponent.value = 0;
    userNum.value = null;
    userDen.value = null;
    attemptCount.value = 0;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  const data = currentLevelData.value;

  if (userNum.value === data.targetNum && userDen.value === data.targetDen) {
    if (exponent.value === data.targetExponent) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Perfect! Een negatieve exponent levert een breuk op, geen negatief getal. ${data.base} tot de macht ${data.targetExponent} is ${data.targetNum}/${data.targetDen}.`
        }
    } else {
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: `Jouw breuk is wiskundig correct! Maar stel eerst de exponentiemachine in op de gevraagde macht (${data.targetExponent}) om de werking te zien.`}
        } else {
          feedback.value = { type: 'error', text: `Zet de exponent op ${data.targetExponent} met de pijltjes.`}
        }
    }
  } else {
    attemptCount.value++

    if (userNum.value === -(data.targetDen)) {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: 'Niet helemaal... Fout! Een negatieve exponent maakt het getal NIET negatief. Het betekent DELEN. Kijk naar de output van de machine.'}
        } else {
          feedback.value = { type: 'error', text: `Een negatieve exponent = 1 / (grondtal^|exponent|). Dus ${data.base}^(${data.targetExponent}) = 1 / ${data.base}^${Math.abs(data.targetExponent)} = 1/${data.targetDen}.`}
        }
    } else if (userNum.value === data.base * data.targetExponent) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Een macht is niet gewoon grondtal maal exponent. Een macht is herhaald vermenigvuldigen (of delen) met ZICHZELF.'}
    } else {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: data.hintError }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `${data.base}^(${data.targetExponent}) = 1 / ${data.base}^${Math.abs(data.targetExponent)} = 1 / ${Math.pow(data.base, Math.abs(data.targetExponent))}` }
        } else {
          feedback.value = { type: 'error', text: `Het antwoord is 1/${data.targetDen}.` }
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
    generateLevel();
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue-bg">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-math-blue mb-4">Mijn Antwoord:</label>

               <div class="flex items-center justify-center gap-4 text-3xl font-black text-slate-700 mb-2">
                   <div class="flex items-start">
                       <span>{{ currentLevelData.base }}</span>
                       <span class="text-xl -mt-1">{{ currentLevelData.targetExponent }}</span>
                   </div>
                   <span>=</span>

                   <div class="flex flex-col items-center gap-1 w-16">
                       <input type="number" v-model.number="userNum" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-xl p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center bg-white" />
                       <div class="h-1 w-full bg-slate-700 rounded-full"></div>
                       <input type="number" v-model.number="userDen" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-xl p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center bg-white" />
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (userNum === null || userDen === null)" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer Breuk</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- The Factory Machine -->
              <div class="w-full max-w-3xl bg-slate-800 p-8 rounded-xl shadow-md border-b-8 border-slate-900 flex flex-col items-center relative overflow-hidden">

                  <h3 class="text-slate-400 font-bold tracking-widest text-sm mb-8 uppercase">De Exponenten Machine</h3>

                  <!-- Machine Pipeline -->
                  <div class="flex items-center w-full justify-between relative z-10 px-8">

                      <!-- Input (Always 1) -->
                      <div class="w-20 h-20 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-inner shrink-0">
                          <span class="font-black text-3xl text-white">1</span>
                      </div>

                      <div class="h-2 flex-1 bg-slate-700 mx-2 relative flex items-center justify-center">
                          <!-- Arrows/Operations dynamically rendered -->
                          <div v-if="operationList.length === 0" class="bg-slate-800 px-2 text-slate-500 font-bold">Geen Actie (macht = 0)</div>
                          <div v-else class="flex gap-2 bg-slate-800 px-4 py-2 rounded-full border-2 border-slate-600">
                              <span v-for="(op, idx) in operationList" :key="idx" class="font-bold whitespace-nowrap animate-fadeIn"
                                    :class="exponent > 0 ? 'text-emerald-400' : 'text-math-blue'">
                                  {{ op }}
                              </span>
                          </div>
                      </div>

                      <!-- Output -->
                      <div class="w-24 h-24 rounded-xl bg-white border-4 border-slate-300 flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
                          <div class="absolute inset-0 bg-blue-500 opacity-10"></div>
                          <span class="font-black text-2xl text-slate-800 transition-all duration-300" :key="currentResultStr">{{ currentResultStr }}</span>
                      </div>

                  </div>

                  <!-- Machine Control Panel -->
                  <div class="mt-12 bg-slate-200 p-6 rounded-xl flex items-center gap-8 shadow-inner border-t border-white/50 w-full max-w-sm">

                      <div class="flex flex-col items-center">
                          <span class="text-xs font-bold text-slate-500 uppercase mb-2">Basis</span>
                          <div class="w-16 h-16 bg-white rounded-lg shadow-sm border border-slate-300 flex items-center justify-center">
                              <span class="font-black text-4xl text-slate-700">{{ currentLevelData.base }}</span>
                          </div>
                      </div>

                      <div class="flex-1 flex flex-col items-center">
                          <span class="text-xs font-bold text-slate-500 uppercase mb-2">Exponent</span>
                          <div class="flex items-center bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden w-full">
                              <button @click="decreaseExponent" :disabled="isCorrect" class="p-4 hover:bg-slate-100 active:bg-slate-200 transition-colors border-r border-slate-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhCaretDown weight="bold" class="text-slate-600" /></button>
                              <div class="flex-1 flex items-center justify-center font-black text-2xl" :class="exponent < 0 ? 'text-math-blue' : (exponent > 0 ? 'text-emerald-600' : 'text-slate-700')">
                                  {{ exponent }}
                              </div>
                              <button @click="increaseExponent" :disabled="isCorrect" class="p-4 hover:bg-slate-100 active:bg-slate-200 transition-colors border-l border-slate-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhCaretUp weight="bold" class="text-slate-600" /></button>
                          </div>
                      </div>

                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

</style>
