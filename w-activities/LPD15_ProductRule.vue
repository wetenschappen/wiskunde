<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhArrowsLeftRight, PhLightbulb, PhQuestion
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

const mainArea = ref(null)

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
  const b1 = ['a', 'x', 'b'][Math.floor(Math.random() * 3)]
  const exp1_1 = 2 + Math.floor(Math.random() * 2)
  const exp2_1 = 3 + Math.floor(Math.random() * 2)

  const b2 = ['x', 'y', 'p'][Math.floor(Math.random() * 3)]
  const exp1_2 = 2 + Math.floor(Math.random() * 3)
  const exp2_2 = 3 + Math.floor(Math.random() * 3)

  const b3 = ['y', 'z', 'q'][Math.floor(Math.random() * 3)]
  const exp1_3 = 3 + Math.floor(Math.random() * 3)
  const exp2_3 = 4 + Math.floor(Math.random() * 3)

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

// --- 8-element additions ---
const showPrediction = ref(true)
const predictionAns = ref(null)
const predictionDone = ref(false)
const showWorkedExample = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  if (predictionAns.value === null) return
  showPrediction.value = false
  predictionDone.value = true
  const data = currentLevelData.value
  if (predictionAns.value === data.exactAns) {
    feedback.value = { type: 'info', text: `Goed geraden! ${data.base}^${data.exp1} × ${data.base}^${data.exp2} = ${data.base}^${predictionAns.value}. Laten we controleren of dit klopt door de machten open te vouwen.` }
  } else {
    feedback.value = { type: 'info', text: `Jij denkt ${data.base}^${predictionAns.value}. Laten we de machten openvouwen om te ontdekken wat het juiste antwoord is.` }
  }
}

function expandPowers() {
    isExpanded.value = true
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Wat denk jij? Voorspel eerst het antwoord!' };
    isExpanded.value = false;
    userAns.value = null;
    showPrediction.value = true;
    predictionAns.value = null;
    predictionDone.value = false;
    showWorkedExample.value = false;
    showReflection.value = false;
    reflectAns.value = '';
    reflectDone.value = false;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const data = currentLevelData.value;
  const predictionRight = predictionAns.value === data.exactAns;

  if (userAns.value === data.exactAns) {
    if (isExpanded.value) {
        isCorrect.value = true;
        const whyText = predictionRight
          ? 'Je had het juist voorspeld en nu zie je ook waarom! '
          : '';
        feedback.value = {
          type: 'success',
          text: `Uitstekend! Je ziet letterlijk ${data.exp1} ${data.base}'tjes en ${data.exp2} ${data.base}'tjes op een rij staan. In totaal zijn dat er ${data.exactAns}.<br><br><strong>Waarom optellen?</strong> Omdat een macht niets anders is dan herhaaldelijk vermenigvuldigen. ${data.base}^${data.exp1} betekent ${data.exp1} keer ${data.base} en ${data.base}^${data.exp2} betekent ${data.exp2} keer ${data.base}. Zet je ze samen, dan heb je ${data.exp1} + ${data.exp2} = ${data.exactAns} keer ${data.base}. Daarom tel je de exponenten op — je telt hoeveel factoren er in totaal zijn.<br><br>${whyText}`
        };
        showReflection.value = true;
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${data.exactAns} is het juiste antwoord, maar klik eerst op "Vouw Open" om de logica erachter te zien!`}
    }
  } else {
    isCorrect.value = false

    if (predictionAns.value === data.exp1 * data.exp2 || userAns.value === data.exp1 * data.exp2) {
        feedback.value = { type: 'error', text: `Je hebt de exponenten vermenigvuldigd (${data.exp1} × ${data.exp2} = ${data.exp1 * data.exp2}).<br><br>Denk nog eens na: ${data.base}^${data.exp1} betekent ${data.base} × ${data.base} × ... (${data.exp1} keer). En ${data.base}^${data.exp2} betekent ${data.base} × ... (${data.exp2} keer). Zet je ze na elkaar, moet je het totaal aantal ${data.base}'s optellen, niet vermenigvuldigen.<br><br>Klik op "Vouw Open" om het visueel te zien.` }
    } else if (userAns.value === Math.pow(data.exp1, data.exp2)) {
        feedback.value = { type: 'error', text: `Je hebt ${data.exp1}^${data.exp2} berekend. Maar bij machten met hetzelfde grondtal tel je de exponenten op, niet machtsverheffen.` }
    } else if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Tel het aantal blauwe (${data.exp1}) en oranje (${data.exp2}) blokjes zodra ze opengevouwen zijn: ${data.exp1} + ${data.exp2} = ?` }
    } else if (attemptCount.value >= 2) {
        feedback.value = { type: 'error', text: 'Vouw de machten open met de knop en tel dan alle ' + data.base + '-blokjes bij elkaar.' }
    } else {
        feedback.value = { type: 'error', text: 'Niet helemaal... Tel het aantal blauwe en oranje blokjes samen zodra ze opengevouwen zijn.' }
    }
  }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true;
  }
}

function handleNext() {
  if (!reflectDone.value && showReflection.value) {
    feedback.value = { type: 'info', text: 'Beantwoord eerst de vraag hierboven: waarom tellen we exponenten op?' }
    return
  }
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
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE: Voorspel eerst -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel eerst!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Zonder visuele hulp: wat is <strong>{{ currentLevelData.base }}<sup>{{ currentLevelData.exp1 }}</sup> &times; {{ currentLevelData.base }}<sup>{{ currentLevelData.exp2 }}</sup></strong>?
              </p>
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">{{ currentLevelData.base }}<sup class="text-sm"></sup></span>
                <input type="number" v-model.number="predictionAns" placeholder="?"
                       class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none" />
                <button @click="submitPrediction" :disabled="predictionAns === null"
                        class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Voorspel
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE: Voorbeeld met andere getallen -->
            <div v-if="predictionDone && !showPrediction && !showReflection" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                Als we <strong>a<sup>4</sup> &times; a<sup>3</sup></strong> nemen:<br>
                a<sup>4</sup> = a &times; a &times; a &times; a (4 keer a)<br>
                a<sup>3</sup> = a &times; a &times; a (3 keer a)<br>
                Samen = 4 + 3 = 7 keer a = a<sup>7</sup><br>
                <span class="font-bold">Dus: a<sup>4</sup> &times; a<sup>3</sup> = a<sup>4+3</sup> = a<sup>7</sup></span>
              </p>
            </div>

            <!-- REFLECTION: Waarom-vraag voor volgende -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Waarom tel je de exponenten op en vermenigvuldig je ze niet?<br>
                <span class="text-xs text-slate-500">Leg in je eigen woorden uit.</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Bijvoorbeeld: omdat een macht herhaald vermenigvuldigen is..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div v-if="!showPrediction" class="p-4 mt-4 border border-amber-200 bg-amber-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-amber-900 mb-4">Eindantwoord:</label>

               <div class="flex items-center justify-center gap-4 text-4xl font-black text-slate-700 mb-2">
                   <div class="flex items-start">
                       <span>{{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp1 }}</sup></span>
                   </div>
                   <span>&times;</span>
                   <div class="flex items-start">
                       <span>{{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp2 }}</sup></span>
                   </div>
                   <span>=</span>

                   <div class="flex items-start bg-white p-2 rounded-lg border-2 border-amber-300">
                       <span class="text-amber-700">{{ currentLevelData.base }}</span>
                       <input type="number" v-model.number="userAns" placeholder="?" :disabled="isCorrect"
                              class="w-16 font-bold text-2xl p-1 -mt-2 -mr-1 border-b-2 border-amber-200 focus:border-amber-500 focus:outline-none text-center text-amber-600 bg-transparent" />
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-amber-50 text-amber-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect && !showPrediction" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">Controleer</button>
              <button v-else-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <button v-if="predictionDone && !showPrediction && !isExpanded" @click="expandPowers"
                          class="mb-12 px-6 py-4 font-bold bg-slate-800 text-white rounded-full shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                      <PhArrowsLeftRight weight="bold" class="w-5 h-5" /> Vouw Open
                  </button>

                  <!-- Visualisation Area -->
                  <div class="flex items-center justify-center gap-4 relative min-h-[120px] flex-wrap">

                      <!-- Block 1 -->
                      <div class="flex items-center justify-center transition-all duration-700"
                           :class="isExpanded ? 'gap-2' : 'bg-amber-100 border-4 border-amber-400 p-6 rounded-xl shadow-md'">

                          <div v-if="!isExpanded" class="font-black text-4xl text-amber-700">
                              {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp1 }}</sup>
                          </div>

                          <template v-else>
                              <div v-for="i in currentLevelData.exp1" :key="'e1'+i" class="w-16 h-16 bg-amber-100 border-4 border-amber-400 rounded-xl flex items-center justify-center font-black text-3xl text-amber-700 shadow-sm animate-fadeIn" :style="`animation-delay: ${i*0.1}s`">
                                  {{ currentLevelData.base }}
                              </div>
</template>
                      </div>

                      <div class="font-black text-4xl text-slate-400 mx-2">&times;</div>

                      <!-- Block 2 -->
                      <div class="flex items-center justify-center transition-all duration-700"
                           :class="isExpanded ? 'gap-2' : 'bg-slate-200 border-4 border-slate-400 p-6 rounded-xl shadow-md'">

                          <div v-if="!isExpanded" class="font-black text-4xl text-slate-700">
                              {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.exp2 }}</sup>
                          </div>

                          <template v-else>
                              <div v-for="i in currentLevelData.exp2" :key="'e2'+i" class="w-16 h-16 bg-slate-200 border-4 border-slate-400 rounded-xl flex items-center justify-center font-black text-3xl text-slate-700 shadow-sm animate-fadeIn" :style="`animation-delay: ${(i+currentLevelData.exp1)*0.1}s`">
                                  {{ currentLevelData.base }}
                              </div>
</template>
                      </div>

                  </div>

                  <!-- Connector bracket when expanded -->
                  <div v-if="isExpanded" class="mt-8 w-full max-w-2xl flex flex-col items-center animate-fadeIn" style="animation-delay: 1s">
                      <div class="w-[80%] h-4 border-b-4 border-x-4 border-amber-500 rounded-b-xl"></div>
                      <span class="mt-4 font-black text-2xl text-amber-600 bg-amber-50 px-4 py-1 rounded-lg shadow-sm border border-amber-200">
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
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
