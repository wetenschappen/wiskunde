<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCircleHalf, PhArrowClockwise, PhLightbulb, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetinstrumenten: De Geodriehoek' },
  instruction: {
    type: String,
    default: 'Teken de juiste hoek door de slider te verslepen. Kijk goed naar de geodriehoek om de hoek exact af te meten. Let op de binnenste én buitenste boog!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  icon: { type: Object, default: () => PhCircleHalf }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om de hoek te tekenen.' })
const hintCount = ref(0)

// Phases: 'predict' → 'measure' → 'reflect'
const phase = ref('predict')
const predictionValue = ref(null)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel() {
  const angles = [
    randomInt(20, 70),     // Level 1: acute angle
    randomInt(100, 170),   // Level 2: obtuse angle
    randomInt(5, 20)       // Level 3: very acute angle
  ]
  return angles.map((angle, i) => ({
    goalText: `Opdracht ${i+1}: Teken een ${i === 0 ? 'scherpe' : i === 1 ? 'stompe' : 'zeer scherpe'} hoek van exact ${angle}°.`,
    targetAngle: angle,
    hintLevels: i === 0
      ? [
          'Een scherpe hoek is kleiner dan 90°. Welke boog lees je af? De binnenste of de buitenste?',
          'Stel: je moet 35° tekenen. De rechterbeen ligt op 0° aan de binnenkant. Je draait naar links tot 35° op de binnenste boog. Nu bij jou: welke boog toont hoeken tot 90°?',
          'Gebruik de BINNENSTE boog. Lees af van 0 naar rechts tot __°.'
        ]
      : i === 1
        ? [
            'Een stompe hoek is groter dan 90°. De buitenste boog begint aan de LINKERKANT met 0°.',
            'Stel: 120° tekenen. De rechterbeen ligt op 0° van de buitenste boog (aan de linkerkant). Je draait naar links tot 120° op de buitenste boog. Nu bij jou: vanwaar start de buitenste boog?',
            'Gebruik de BUITENSTE boog. Start aan de linkerkant bij 0° en draai tot __°.'
          ]
        : [
            'Een zeer scherpe hoek. Kijk naar de kleine streepjes tussen de tientallen op de binnenste boog.',
            'Stel: 12° tekenen. Op de binnenste boog: het eerste grote streepje na 0° is 10°, dan twee kleine streepjes = 12°. Nu bij jou: hoeveel graden is elk klein streepje?',
            'Elk klein streepje is 1°. Vanaf 0° tot __ kleine streepjes = __°.'
          ]
  }))
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const userAngle = ref(0)

const endX = computed(() => 300 + 250 * Math.cos(userAngle.value * Math.PI / 180))
const endY = computed(() => 300 - 250 * Math.sin(userAngle.value * Math.PI / 180))

const arcPath = computed(() => {
    if (userAngle.value === 0) return '';
    const rad = userAngle.value * Math.PI / 180;
    const x = 300 + 50 * Math.cos(rad);
    const y = 300 - 50 * Math.sin(rad);
    const largeArc = userAngle.value > 180 ? 1 : 0;
    return `M 350 300 A 50 50 0 ${largeArc} 0 ${x} ${y}`;
})

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitPrediction() {
  if (predictionValue.value === null || predictionValue.value === '') return
  phase.value = 'measure'
  feedback.value = { type: 'info', text: `Je schatting: ${predictionValue.value}°. Verschuif nu de slider naar de juiste hoek.` }
}

function onSliderRelease() {
  if (isCorrect.value || !currentLevelData.value) return;

  const target = currentLevelData.value.targetAngle;

  if (userAngle.value === target) {
    isCorrect.value = true;
    attemptCount.value = 0;
    feedback.value = {
      type: 'success',
      text: 'Prima! Je hebt de geodriehoek correct afgelezen en de hoek perfect getekend.'
    };
    return;
  }

  attemptCount.value++;

  // Error analysis: inner vs outer scale confusion
  if (userAngle.value === 180 - target) {
    feedback.value = {
      type: 'error',
      text: `Let op de schaal! Je leest de verkeerde boog af. Je hebt nu een hoek van ${userAngle.value}° getekend — dat is ${180 - userAngle.value}° op de andere boog. Gebruik de ${target > 90 ? 'BUITENSTE' : 'BINNENSTE'} boog.`
    };
    return;
  }

  const diff = Math.abs(userAngle.value - target);

  if (attemptCount.value === 1) {
    feedback.value = {
      type: 'error',
      text: `Je huidige hoek is ${userAngle.value}°. ${currentLevelData.value.hintLevels[0]}`
    };
  } else if (attemptCount.value === 2) {
    if (target > 90) {
      feedback.value = {
        type: 'error',
        text: `Je zit er ${diff}° naast. Probeer de BUITENSTE boog af te lezen — begin aan de linkerkant van de geodriehoek.`
      };
    } else {
      feedback.value = {
        type: 'error',
        text: `Je zit er ${diff}° naast. Gebruik de BINNENSTE boog en tel vanaf 0 naar rechts.`
      };
    }
  } else {
    feedback.value = {
      type: 'error',
      text: `Probeer de slider precies op ${target}° te zetten. Kijk naar de streepjes — elk groot streepje is 10°, elk klein streepje is 1° (of 5° op sommige geodriehoeken).`
    };
  }
}

function submitReflection() {
  phase.value = 'done'
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
    celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    hintCount.value = 0;
    feedback.value = { type: 'info', text: 'Beweeg de slider om de hoek te tekenen.' };
    userAngle.value = 0;
    predictionValue.value = null;
    phase.value = 'predict';
    reflectionAnswer.value = '';
    showWorkedExample.value = true;
}

function proceedAfterSuccess() {
  phase.value = 'reflect'
}

function handleNext() {
  if (phase.value === 'reflect') {
    submitReflection()
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
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
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

            <div class="text-center bg-amber-50 p-4 border border-slate-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                <PhLightbulb weight="fill" class="w-4 h-4" />
                Voorbeeld: Een hoek van 50° tekenen
              </h4>
              <ol class="text-sm text-slate-700 space-y-1 ml-4 list-decimal">
                <li>Leg het middelpunt van de geodriehoek op het hoekpunt.</li>
                <li>Lijn de 0°-markering van de binnenste boog uit met het rechterbeen.</li>
                <li>Draai naar links tot je bij 50° op de binnenste boog komt.</li>
                <li>Zet een punt en teken het tweede been.</li>
              </ol>
              <p class="mt-2 text-sm text-slate-600">Voor een <strong>stompe</strong> hoek (&gt;90°) gebruik je de <strong>buitenste</strong> boog. Die start aan de linkerkant met 0°.</p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-2 border border-amber-200 bg-amber-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-2">Schat eerst: Hoe groot is de gevraagde hoek?</label>
               <p class="text-xs text-slate-500 mb-2">Is de hoek scherp (&lt;90°) of stomp (&gt;90°)?</p>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="predictionValue" placeholder="Schatting in graden..."
                          class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center" />
                   <span class="text-slate-600 font-bold">°</span>
               </div>
            </div>

            <!-- Measurement Phase -->
            <div v-if="phase === 'measure'" class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-4">Grootte: <span class="text-amber-600 font-mono text-xl ml-2">{{ userAngle }}°</span></label>
               <p class="text-xs text-slate-500 mb-2">Doel: {{ currentLevelData.targetAngle }}°</p>
               <input type="range" v-model.number="userAngle" min="0" max="180" step="1" :disabled="isCorrect"
                      @change="onSliderRelease"
                      class="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
               <div class="flex justify-between mt-2 text-xs font-mono text-slate-400">
                   <span>0°</span><span>90°</span><span>180°</span>
               </div>
               <div v-if="predictionValue !== null && isChecked && !isCorrect" class="mt-3 text-xs text-slate-500">
                 Jouw schatting: {{ predictionValue }}°
               </div>
            </div>

            <!-- Why Explanation (after success) -->
            <div v-if="isCorrect && phase === 'measure'" class="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-1">
                <PhChatCircleText weight="fill" class="w-4 h-4" />
                Waarom zijn er twee schalen?
              </h4>
              <p class="text-sm text-slate-700">
                Een geodriehoek heeft een binnenste en een buitenste boog zodat je hoeken in beide richtingen kan meten. Voor een scherpe hoek (&lt;90°) gebruik je de binnenste boog (start rechts). Voor een stompe hoek (&gt;90°) gebruik je de buitenste boog (start links). De som van beide aflezingen is altijd 180°.
              </p>
            </div>

            <!-- Reflection Phase -->
            <div v-if="phase === 'reflect'" class="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                Reflectie
              </h4>
              <p class="text-sm text-slate-600 mb-3">Hoe weet je of je de binnenste of de buitenste boog moet gebruiken bij het meten van een hoek?</p>
              <textarea v-model="reflectionAnswer" placeholder="Typ je antwoord..."
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-amber-500 focus:ring-amber-500 resize-none" rows="2"></textarea>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-slate-100 text-slate-700': feedback.type === 'error', 'bg-slate-100 text-slate-600': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>

              <!-- Prediction: submit button -->
              <button v-if="phase === 'predict'" @click="submitPrediction" :disabled="predictionValue === null || predictionValue === ''"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig schatting en meet
              </button>

              <!-- After success in measure: show proceed -->
              <button v-if="isCorrect && phase === 'measure'" @click="proceedAfterSuccess"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Waarom?</span>
                <PhArrowRight weight="bold" />
              </button>

              <!-- Measure: hint button only when slider has been moved -->
              <button v-if="phase === 'measure' && !isCorrect" @click="showHint"
                      class="py-4 px-4 text-lg font-medium transition-colors rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhLightbulb weight="fill" class="w-5 h-5" />
              </button>

              <!-- Reflection: next -->
              <button v-if="phase === 'reflect'" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :disabled="reflectionAnswer.trim().length < 3">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- SVG Visualisation of Angle and Protractor -->
              <svg viewBox="0 0 600 400" class="w-full max-w-lg h-auto bg-white rounded-xl shadow-md border-2 border-slate-200">

                  <!-- The Protractor (Geodriehoek) - In background -->
                  <g transform="translate(300, 300) scale(1.5)" opacity="0.6">
                      <!-- Main triangle body -->
                      <polygon points="-150,0 150,0 0,-150" fill="rgba(241, 245, 249, 0.8)" stroke="#94a3b8" stroke-width="2" />

                      <!-- Inner protractor arc -->
                      <path d="M -100 0 A 100 100 0 0 1 100 0" fill="none" stroke="#94a3b8" stroke-width="2" />

                      <!-- Zero mark / Origin -->
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#334155" stroke-width="2" />
                      <circle cx="0" cy="0" r="3" fill="#d97706" />
                      <text x="-4" y="15" font-size="10" font-weight="bold" fill="#334155">0</text>

                      <!-- Markings and numbers on the arc -->
                      <line x1="100" y1="0" x2="110" y2="0" stroke="#334155" stroke-width="2" />
                      <text x="115" y="4" font-size="8" fill="#334155" font-weight="bold">0</text>

                      <line x1="-100" y1="0" x2="-110" y2="0" stroke="#334155" stroke-width="2" />
                      <text x="-125" y="4" font-size="8" fill="#334155" font-weight="bold">180</text>

                      <line x1="0" y1="-100" x2="0" y2="-110" stroke="#334155" stroke-width="2" />
                      <text x="-6" y="-115" font-size="8" fill="#334155" font-weight="bold">90</text>

                      <!-- Tick marks for every 10 degrees -->
                      <g v-for="deg in 17" :key="deg">
                          <line :x1="100 * Math.cos(deg * 10 * Math.PI / 180)"
                                :y1="-100 * Math.sin(deg * 10 * Math.PI / 180)"
                                :x2="105 * Math.cos(deg * 10 * Math.PI / 180)"
                                :y2="-105 * Math.sin(deg * 10 * Math.PI / 180)"
                                stroke="#64748b" stroke-width="1.5" />
                          <text :x="112 * Math.cos(deg * 10 * Math.PI / 180) - 5"
                                :y="-112 * Math.sin(deg * 10 * Math.PI / 180) + 3"
                                font-size="6" fill="#64748b" font-weight="bold">
                              {{ deg * 10 }}
                          </text>
                      </g>
                  </g>

                  <!-- The Angle (Amber) - In foreground -->
                  <!-- Base leg: to the right -->
                  <line x1="300" y1="300" x2="550" y2="300" stroke="#d97706" stroke-width="6" stroke-linecap="round" />

                  <!-- Dynamic leg -->
                  <line x1="300" y1="300" :x2="endX" :y2="endY" stroke="#d97706" stroke-width="6" stroke-linecap="round" class="transition-all duration-300 ease-out" />

                  <!-- Angle arc indicator -->
                  <path :d="arcPath" fill="rgba(217, 119, 6, 0.2)" stroke="#d97706" stroke-width="2" class="transition-all duration-300 ease-out" />

              </svg>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && phase === 'measure'" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
