<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhCopy, PhArrowsLeftRight, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

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

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Wat denk jij? Voorspel eerst het antwoord!' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  const b1 = ['a', 'x', 'p'][Math.floor(Math.random() * 3)]
  const inner1 = 2 + Math.floor(Math.random() * 1)
  const outer1 = 2 + Math.floor(Math.random() * 2)

  const b2 = ['x', 'y', 'm'][Math.floor(Math.random() * 3)]
  const inner2 = 2 + Math.floor(Math.random() * 2)
  const outer2 = 3 + Math.floor(Math.random() * 2)

  const b3 = ['y', 'z', 't'][Math.floor(Math.random() * 3)]
  const inner3 = 3 + Math.floor(Math.random() * 2)
  const outer3 = 2 + Math.floor(Math.random() * 2)

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

// --- 8-element additions ---
const showPrediction = ref(true)
const predictionAns = ref(null)
const predictionDone = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  if (predictionAns.value === null) return
  showPrediction.value = false
  predictionDone.value = true
  const data = currentLevelData.value
  if (predictionAns.value === data.exactAns) {
    feedback.value = { type: 'info', text: `Goed zo! (${data.base}^${data.innerExp})^${data.outerExp} = ${data.base}^${predictionAns.value}. Laten we controleren met de visuele stappen.` }
  } else {
    feedback.value = { type: 'info', text: `Jij denkt ${data.base}^${predictionAns.value}. Klik op "Kopieer" om stap voor stap te ontdekken wat het juiste antwoord is.` }
  }
}

function nextAnimStep() {
    if (step.value < 2) {
        step.value++;
        if (step.value === 1) feedback.value = { type: 'info', text: `Goed! We hebben nu ${currentLevelData.value.outerExp} blokken van ${currentLevelData.value.base}^${currentLevelData.value.innerExp}. Klik nu op "Vouw Open".` }
        if (step.value === 2) feedback.value = { type: 'info', text: `Geweldig! Tel het totaal aantal ${currentLevelData.value.base}'tjes en vul je eindantwoord in.` }
    }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Wat denk jij? Voorspel eerst het antwoord!' };
    step.value = 0;
    userAns.value = null;
    showPrediction.value = true;
    predictionAns.value = null;
    predictionDone.value = false;
    showReflection.value = false;
    reflectAns.value = '';
    reflectDone.value = false;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const data = currentLevelData.value;

  if (userAns.value === data.exactAns) {
    if (step.value === 2) {
        isCorrect.value = true;
        const predictionRight = predictionAns.value === data.exactAns;
        const whyText = predictionRight
          ? 'Je voorspelling klopte! '
          : '';
        feedback.value = {
          type: 'success',
          text: `Briljant! Je ziet letterlijk ${data.outerExp} groepjes van ${data.innerExp}. Dat is ${data.outerExp} &times; ${data.innerExp} = ${data.exactAns} ${data.base}'tjes.<br><br><strong>Waarom vermenigvuldigen?</strong> (${data.base}^${data.innerExp})^${data.outerExp} betekent dat we ${data.base}^${data.innerExp} nemen en dit ${data.outerExp} keer met zichzelf vermenigvuldigen. Elke keer herhalen we de ${data.innerExp} factoren. Dus in totaal hebben we ${data.outerExp} groepen van elk ${data.innerExp} factoren — dat is ${data.outerExp} &times; ${data.innerExp} = ${data.exactAns} keer de basis. Daarom vermenigvuldig je de exponenten, je telt niet op.<br><br>${whyText}`
        };
        showReflection.value = true;
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${data.exactAns} is juist, maar doorloop eerst de animatie met de knoppen om te zien WAAROM het zo is!`}
    }
  } else {
    isCorrect.value = false

    if (userAns.value === data.innerExp + data.outerExp) {
        feedback.value = { type: 'error', text: `Je hebt de exponenten opgeteld (${data.innerExp} + ${data.outerExp} = ${userAns.value}).<br><br>Let op: bij een macht van een macht (${data.base}^${data.innerExp})^${data.outerExp} herhalen we de hele groep ${data.outerExp} keer. Elk groepje bevat ${data.innerExp} factoren. In totaal zijn dat ${data.outerExp} groepen van ${data.innerExp} — dat is een vermenigvuldiging, geen optelling.<br><br>Klik op "Kopieer" en daarna "Vouw Open" om het visueel te zien.` }
    } else if (userAns.value === Math.pow(data.innerExp, data.outerExp)) {
        feedback.value = { type: 'error', text: `Je hebt ${data.innerExp}^${data.outerExp} berekend. De rekenregel werkt anders. Volg de visuele blokjes.` }
    } else if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Kijk naar de ${data.outerExp} groepjes. Elk groepje bevat ${data.innerExp} ${data.base}'tjes. Hoeveel ${data.base}'tjes zijn dat in totaal? (${data.outerExp} &times; ${data.innerExp})` }
    } else if (attemptCount.value >= 2) {
        feedback.value = { type: 'error', text: `Vouw de haakjes open (Stap 2) en tel het aantal ${data.base}-blokjes.` }
    } else {
        feedback.value = { type: 'error', text: `Tel het aantal ${data.base}-blokjes zodra ze allemaal opengevouwen zijn (Stap 2).` }
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
    feedback.value = { type: 'info', text: 'Beantwoord eerst de vraag: waarom vermenigvuldig je de exponenten?' }
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

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel eerst!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Wat is <strong>({{ currentLevelData.base }}<sup>{{ currentLevelData.innerExp }}</sup>)<sup>{{ currentLevelData.outerExp }}</sup></strong>?
                Moet je de exponenten optellen of vermenigvuldigen?
              </p>
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">({{ currentLevelData.base }}<sup>{{ currentLevelData.innerExp }}</sup>)<sup>{{ currentLevelData.outerExp }}</sup> = {{ currentLevelData.base }}</span>
                <input type="number" v-model.number="predictionAns" placeholder="?"
                       class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none" />
                <button @click="submitPrediction" :disabled="predictionAns === null"
                        class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Voorspel
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="predictionDone && !showPrediction && !showReflection" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                Bij <strong>(a<sup>3</sup>)<sup>2</sup></strong>:<br>
                Stap 1: Kopieer de binnenste macht 2 keer:<br>
                a<sup>3</sup> &times; a<sup>3</sup><br>
                Stap 2: Vouw open: (a&times;a&times;a) &times; (a&times;a&times;a)<br>
                = 6 keer a = a<sup>6</sup><br>
                <span class="font-bold">Dus: (a<sup>3</sup>)<sup>2</sup> = a<sup>3&times;2</sup> = a<sup>6</sup></span>
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Waarom vermenigvuldig je de exponenten bij een macht van een macht?<br>
                <span class="text-xs text-slate-500">Leg uit in je eigen woorden, gebruik de visuele groepen als hulp.</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Bijvoorbeeld: elke buitenste macht betekent een nieuwe groep..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div v-if="!showPrediction" class="p-4 mt-4 border border-amber-200 bg-amber-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-amber-900 mb-4">Eindantwoord:</label>

               <div class="flex items-center justify-center gap-4 text-4xl font-black text-slate-700 mb-2">
                   <div class="flex items-start">
                       <span>({{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.innerExp }}</sup>)<sup class="text-3xl -ml-1">{{ currentLevelData.outerExp }}</sup></span>
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

                  <div v-if="predictionDone && !showPrediction" class="mb-12 flex gap-4 h-12">
                      <button v-if="step === 0" @click="nextAnimStep"
                              class="px-6 font-bold bg-slate-800 text-white rounded-full shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                          <PhCopy weight="bold" class="w-5 h-5" /> Kopieer (Buitenste Macht {{ currentLevelData.outerExp }})
                      </button>
                      <button v-if="step === 1" @click="nextAnimStep"
                              class="px-6 font-bold bg-amber-600 text-white rounded-full shadow-md flex items-center gap-2 hover:bg-amber-500 active:scale-95 transition-all animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                          <PhArrowsLeftRight weight="bold" class="w-5 h-5" /> Vouw Open (Binnenste Macht {{ currentLevelData.innerExp }})
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="flex items-center justify-center gap-6 relative min-h-[160px] flex-wrap">

                      <!-- INITIAL STATE -->
                      <div v-if="step === 0 && predictionDone" class="flex items-start bg-slate-200 border-4 border-slate-400 p-8 rounded-xl shadow-md animate-fadeIn">
                          <span class="font-black text-6xl text-slate-700">({{ currentLevelData.base }}<sup class="text-4xl">{{ currentLevelData.innerExp }}</sup>)</span>
                          <span class="font-black text-4xl text-slate-700 -ml-2"><sup>{{ currentLevelData.outerExp }}</sup></span>
                      </div>

                      <!-- STEP 1: Outer expansion -->
                      <template v-if="step >= 1">
                          <div v-for="group in currentLevelData.outerExp" :key="'g'+group"
                               class="flex items-center justify-center transition-all duration-700"
                               :class="step === 2 ? 'gap-2 bg-transparent p-0' : 'bg-slate-200 border-4 border-slate-400 p-6 rounded-xl shadow-md animate-fadeIn'">

                              <div v-if="step === 1" class="font-black text-4xl text-slate-700">
                                  {{ currentLevelData.base }}<sup class="text-2xl">{{ currentLevelData.innerExp }}</sup>
                              </div>

                              <!-- STEP 2: Inner expansion -->
                              <template v-if="step === 2">
                                  <div v-for="i in currentLevelData.innerExp" :key="'e'+group+'-'+i"
                                       class="w-16 h-16 bg-amber-100 border-4 border-amber-400 rounded-xl flex items-center justify-center font-black text-3xl text-amber-700 shadow-sm animate-fadeIn"
                                       :style="`animation-delay: ${(group * currentLevelData.innerExp + i) * 0.05}s`">
                                      {{ currentLevelData.base }}
                                  </div>
</template>

                          </div>
</template>

                  </div>

                  <!-- Connector bracket when fully expanded -->
                  <div v-if="step === 2" class="mt-12 w-full max-w-2xl flex flex-col items-center animate-fadeIn" style="animation-delay: 1s">
                      <div class="w-[85%] h-4 border-b-4 border-x-4 border-amber-500 rounded-b-xl"></div>
                      <span class="mt-4 font-black text-2xl text-amber-600 bg-amber-50 px-4 py-1 rounded-lg shadow-sm border border-amber-200">
                          {{ currentLevelData.outerExp }} groepjes van {{ currentLevelData.innerExp }} = {{ currentLevelData.exactAns }} stuks
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
