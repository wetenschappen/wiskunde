<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCircleHalf, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetinstrumenten: De Geodriehoek' },
  instruction: {
    type: String,
    default: 'Teken de juiste hoek door de slider te verslepen. Kijk goed naar de geodriehoek om de hoek exact af te meten. Let op de binnenste én buitenste boog!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCircleHalf }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om de hoek te tekenen.' })

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
    hint: i === 0
      ? 'Een scherpe hoek is kleiner dan 90°.'
      : i === 1
        ? 'Een stompe hoek is groter dan 90°.'
        : 'Kijk naar de kleine streepjes tussen de tientallen.'
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

// Auto-correct: instant feedback when slider reaches exact target
watch(userAngle, (newAngle) => {
  if (isCorrect.value || !currentLevelData.value) return
  const target = currentLevelData.value.targetAngle
  if (newAngle === target) {
    isCorrect.value = true
    isChecked.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Uitstekend! Je hebt de geodriehoek correct afgelezen en de hoek perfect getekend.'
    }
  }
})

function onSliderRelease() {
  if (isCorrect.value || !currentLevelData.value) return;

  const target = currentLevelData.value.targetAngle;

  if (userAngle.value === target) {
    isCorrect.value = true;
    attemptCount.value = 0;
    feedback.value = {
      type: 'success',
      text: 'Uitstekend! Je hebt de geodriehoek correct afgelezen en de hoek perfect getekend.'
    };
    return;
  }

  attemptCount.value++;

  if (userAngle.value === 180 - target) {
    feedback.value = {
      type: 'error',
      text: `Let op de schaal! Je leest de verkeerde boog af. Je hebt nu een hoek van ${userAngle.value}° getekend.`
    };
    return;
  }

  const diff = Math.abs(userAngle.value - target);

  if (attemptCount.value === 1) {
    feedback.value = {
      type: 'error',
      text: `Je huidige hoek is ${userAngle.value}°. ${currentLevelData.value.hint}`
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
      text: `Probeer de slider precies op ${target}° te zetten. Kijk naar de streepjes — elk groot streepje is 10°, elk klein streepje is 5°.`
    };
  }
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Beweeg de slider om de hoek te tekenen.' };
    userAngle.value = 0;
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

            <div class="text-center bg-pink-50 p-4 border border-pink-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-pink-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-4">Grootte: <span class="text-pink-600 font-mono text-xl ml-2">{{ userAngle }}°</span></label>
               <input type="range" v-model.number="userAngle" min="0" max="180" step="1" :disabled="isCorrect"
                      @change="onSliderRelease"
                      class="w-full accent-pink-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
               <div class="flex justify-between mt-2 text-xs font-mono text-slate-400">
                   <span>0°</span><span>90°</span><span>180°</span>
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
              <button @click="handleNext" v-if="isCorrect" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 px-4 text-center text-sm font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
                Versleep de slider naar de juiste hoek
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- SVG Visualisation of Angle and Protractor -->
              <svg width="600" height="400" class="bg-white rounded-xl shadow-md border-2 border-slate-200">

                  <!-- The Protractor (Geodriehoek) - In background -->
                  <g transform="translate(300, 300) scale(1.5)" opacity="0.6">
                      <!-- Main triangle body -->
                      <polygon points="-150,0 150,0 0,-150" fill="rgba(241, 245, 249, 0.8)" stroke="#94a3b8" stroke-width="2" />

                      <!-- Inner protractor arc -->
                      <path d="M -100 0 A 100 100 0 0 1 100 0" fill="none" stroke="#94a3b8" stroke-width="2" />

                      <!-- Zero mark / Origin -->
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#334155" stroke-width="2" />
                      <circle cx="0" cy="0" r="3" fill="#ef4444" />
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

                  <!-- The Angle (Blue) - In foreground -->
                  <!-- Base leg: to the right -->
                  <line x1="300" y1="300" x2="550" y2="300" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" />

                  <!-- Dynamic leg -->
                  <line x1="300" y1="300" :x2="endX" :y2="endY" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" class="transition-all duration-300 ease-out" />

                  <!-- Angle arc indicator -->
                  <path :d="arcPath" fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" stroke-width="2" class="transition-all duration-300 ease-out" />

              </svg>

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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
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
