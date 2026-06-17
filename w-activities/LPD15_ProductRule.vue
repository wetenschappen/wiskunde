<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhArrowsOutLineHorizontal
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Machten: Productregel' },
  instruction: {
    type: String,
    default: 'Moet je bij het vermenigvuldigen van machten (met hetzelfde grondtal) de kleine getalletjes optellen of vermenigvuldigen?<br/><br/><strong>Opdracht:</strong> Raad niet zomaar. Gebruik de knop "Vouw Open" om de machten voluit te schrijven. Tel daarna hoeveel letters je in totaal hebt om je eindantwoord te vormen.'
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
const feedback = ref({ type: 'info', text: 'Klik op "Vouw Open" om het bewijs te zien.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Small exponents summing to <= 7
  const b1 = ['a', 'x', 'b'][Math.floor(Math.random() * 3)]
  const exp1_1 = 2 + Math.floor(Math.random() * 2) // 2-3
  const exp2_1 = 3 + Math.floor(Math.random() * 2) // 3-4

  // Level 2: Medium exponents
  const b2 = ['x', 'y', 'p'][Math.floor(Math.random() * 3)]
  const exp1_2 = 2 + Math.floor(Math.random() * 3) // 2-4
  const exp2_2 = 3 + Math.floor(Math.random() * 3) // 3-5

  // Level 3: Larger / equal exponents
  const b3 = ['y', 'z', 'q'][Math.floor(Math.random() * 3)]
  const exp1_3 = 3 + Math.floor(Math.random() * 3) // 3-5
  const exp2_3 = 4 + Math.floor(Math.random() * 3) // 4-6

  levels.value = [
    { base: b1, exp1: exp1_1, exp2: exp2_1, exactAns: exp1_1 + exp2_1 },
    { base: b2, exp1: exp1_2, exp2: exp2_2, exactAns: exp1_2 + exp2_2 },
    { base: b3, exp1: exp1_3, exp2: exp2_3, exactAns: exp1_3 + exp2_3 }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const isExpanded = ref(false)
const userAns = ref(null)

function expandPowers() {
    isExpanded.value = true
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op "Vouw Open" om het bewijs te zien.' };
    isExpanded.value = false;
    userAns.value = null;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const data = currentLevelData.value;

  if (userAns.value === data.exactAns) {
    if (isExpanded.value) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Uitstekend! Je ziet letterlijk ${data.exp1} ${data.base}'tjes en ${data.exp2} ${data.base}'tjes op een rij staan. In totaal zijn dat er ${data.exactAns}. Daarom moet je bij een vermenigvuldiging de exponenten OPTELLEN (${data.exp1} + ${data.exp2} = ${data.exactAns}).`
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${data.exactAns} is het juiste antwoord, maar klik eerst op "Vouw Open" om de logica erachter te zien!`}
    }
  } else {
    isCorrect.value = false

    if (userAns.value === data.exp1 * data.exp2) {
        feedback.value = { type: 'error', text: `Je hebt ${data.exp1} en ${data.exp2} vermenigvuldigd (${data.exp1} × ${data.exp2} = ${userAns.value}). Klik op "Vouw Open" om te zien waarom dat FOUT is.`}
    } else if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Tel het aantal blauwe (${data.exp1}) en oranje (${data.exp2}) blokjes zodra ze opengevouwen zijn: ${data.exp1} + ${data.exp2} = ?`}
    } else if (attemptCount.value >= 2) {
        feedback.value = { type: 'error', text: `Vouw de machten open met de knop en tel dan alle ${data.base}-blokjes bij elkaar.`}
    } else {
        feedback.value = { type: 'error', text: 'Tel het aantal blauwe en oranje blokjes samen zodra ze opengevouwen zijn.'}
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
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

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
               <label class="block text-sm font-bold text-emerald-900 mb-4">Eindantwoord:</label>

               <div class="flex items-center justify-center gap-4 text-4xl font-black text-slate-700 mb-2">
                   <div class="flex items-start">
                       <span>{{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp1 }}</sup></span>
                   </div>
                   <span>×</span>
                   <div class="flex items-start">
                       <span>{{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp2 }}</sup></span>
                   </div>
                   <span>=</span>

                   <div class="flex items-start bg-white p-2 rounded-lg border-2 border-emerald-300">
                       <span class="text-emerald-700">{{ currentLevelData.base }}</span>
                       <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                              class="w-16 font-bold text-2xl p-1 -mt-2 -mr-1 border-b-2 border-emerald-200 focus:border-emerald-500 focus:outline-none text-center text-emerald-600 bg-transparent" />
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
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <button v-if="!isExpanded" @click="expandPowers"
                          class="mb-12 px-6 py-4 font-bold bg-slate-800 text-white rounded-full shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all">
                      <PhArrowsOutLineHorizontal weight="bold" class="w-5 h-5" /> Vouw Open
                  </button>

                  <!-- Visualisation Area -->
                  <div class="flex items-center justify-center gap-4 relative min-h-[120px] flex-wrap">

                      <!-- Block 1 -->
                      <div class="flex items-center justify-center transition-all duration-700"
                           :class="isExpanded ? 'gap-2' : 'bg-blue-100 border-4 border-blue-400 p-6 rounded-xl shadow-md'">

                          <div v-if="!isExpanded" class="font-black text-4xl text-blue-700">
                              {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp1 }}</sup>
                          </div>

                          <!-- Expanded -->
                          <template v-else>
                              <div v-for="i in currentLevelData.exp1" :key="'e1'+i" class="w-16 h-16 bg-blue-100 border-4 border-blue-400 rounded-xl flex items-center justify-center font-black text-3xl text-blue-700 shadow-sm animate-fadeIn" :style="`animation-delay: ${i*0.1}s`">
                                  {{ currentLevelData.base }}
                              </div>
</template>
                      </div>

                      <div class="font-black text-4xl text-slate-400 mx-2">×</div>

                      <!-- Block 2 -->
                      <div class="flex items-center justify-center transition-all duration-700"
                           :class="isExpanded ? 'gap-2' : 'bg-math-blue-bg border-4 border-math-blue p-6 rounded-xl shadow-md'">

                          <div v-if="!isExpanded" class="font-black text-4xl text-math-blue">
                              {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp2 }}</sup>
                          </div>

                          <!-- Expanded -->
                          <template v-else>
                              <div v-for="i in currentLevelData.exp2" :key="'e2'+i" class="w-16 h-16 bg-math-blue-bg border-4 border-math-blue rounded-xl flex items-center justify-center font-black text-3xl text-math-blue shadow-sm animate-fadeIn" :style="`animation-delay: ${(i+currentLevelData.exp1)*0.1}s`">
                                  {{ currentLevelData.base }}
                              </div>
</template>
                      </div>

                  </div>

                  <!-- Connector bracket when expanded -->
                  <div v-if="isExpanded" class="mt-8 w-full max-w-2xl flex flex-col items-center animate-fadeIn" style="animation-delay: 1s">
                      <div class="w-[80%] h-4 border-b-4 border-x-4 border-emerald-500 rounded-b-xl"></div>
                      <span class="mt-4 font-black text-2xl text-emerald-600 bg-emerald-50 px-4 py-1 rounded-lg shadow-sm border border-emerald-200">
                          {{ currentLevelData.exp1 }} + {{ currentLevelData.exp2 }} = {{ currentLevelData.exactAns }} stuks
                      </span>
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
