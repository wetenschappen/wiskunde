<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScissors, PhArrowClockwise, PhArrowsLeftRight
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Oppervlakte: Parallellogram' },
  instruction: {
    type: String,
    default: 'Je mag geen formuleblad gebruiken! Gelukkig kan je elke formule zelf ontdekken. Een parallellogram is stiekem gewoon een bekende vorm in vermomming.<br/><br/><strong>Opdracht:</strong> Gebruik de schaar om het uitstekende stukje af te knippen en naar de andere kant te verplaatsen. Bereken daarna de oppervlakte.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScissors }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de vorm te transformeren.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: small numbers
  const b1 = pickRandom([4, 5, 6])
  const h1 = pickRandom([3, 4, 5])
  const s1 = pickRandom([2, 3])
  newLevels.push({ base: b1, height: h1, shear: s1 })

  // Level 2: medium
  const b2 = pickRandom([6, 7, 8, 9])
  const h2 = pickRandom([4, 5, 6])
  const s2 = pickRandom([3, 4])
  newLevels.push({ base: b2, height: h2, shear: s2 })

  // Level 3: larger numbers
  const b3 = pickRandom([5, 6, 7, 8, 9, 10])
  const h3 = pickRandom([5, 6, 7])
  const s3 = pickRandom([2, 3, 4])
  newLevels.push({ base: b3, height: h3, shear: s3 })

  levels.value = newLevels
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const targetArea = computed(() => currentLevelData.value.base * currentLevelData.value.height)

// Domain Logic
const step = ref(0) // 0: initial, 1: cut & moved
const userAns = ref(null)

function transformShape() {
    if (isCorrect.value) return;
    step.value = 1
    feedback.value = { type: 'success', text: 'Prima! Kijk! Een parallellogram kan je verknippen tot een perfecte RECHTHOEK. De basis en de hoogte blijven exact hetzelfde.' }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de vorm te transformeren.' };
    step.value = 0;
    userAns.value = null;
    attemptCount.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  if (userAns.value === targetArea.value) {
    if (step.value === 1) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: 'Prima! Briljant! Je hoeft de formule voor een parallellogram dus niet te blokken. Het is gewoon basis × hoogte, net als bij de rechthoek!'
        }
    } else {
        isCorrect.value = false
        feedback.value = { type: 'error', text: `${targetArea.value} is correct! Maar klik eerst op de knop "Snij en Verplaats" om met je eigen ogen te zien WAAROM dit klopt.`}
    }
  } else {
    isCorrect.value = false

    const data = currentLevelData.value;
    if (attemptCount.value >= 3) {
      feedback.value = { type: 'error', text: `De rechthoek na het knippen is ${data.base} bij ${data.height}. Oppervlakte = ${data.base} × ${data.height} = ${targetArea.value} cm².` }
    } else if (attemptCount.value >= 2) {
      feedback.value = { type: 'error', text: `Kijk naar de getransformeerde vorm. Het is een rechthoek van ${data.base} bij ${data.height}. Wat is de oppervlakte van een rechthoek? (lengte × breedte)` }
    } else {
      const hypotenuse = Math.sqrt(data.height * data.height + data.shear * data.shear);
      if (Math.abs(userAns.value - (data.base * hypotenuse)) < 2) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Je hebt de basis vermenigvuldigd met de schuine zijde. Fout! Kijk naar de getransformeerde vorm (de rechthoek). Je hebt de loodrechte HOOGTE nodig.' }
      } else {
        feedback.value = { type: 'error', text: `Kijk naar de getransformeerde vorm. Het is een rechthoek van ${data.base} bij ${data.height}. Wat is de oppervlakte daarvan? (L × B)` }
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
    currentInternalLevel.value = 0;
    generateLevel()
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
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

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-math-blue mb-2">Oppervlakte Parallellogram:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-xl p-4 border-2 border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                   <span class="font-black text-2xl text-slate-500">cm²</span>
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
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userAns === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer Oppervlakte</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex flex-col items-center">

                  <div class="mb-12">
                      <button @click="transformShape" :disabled="isCorrect || step === 1"
                              class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                          <PhScissors weight="bold" class="w-6 h-6" /> Snij en Verplaats
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-12" :key="currentInternalLevel">
                      <svg width="600" height="300" viewBox="0 0 600 300" class="block">

                          <!-- Grid lines -->
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 19" :key="'v'+i" :x1="i * 30" y1="0" :x2="i * 30" y2="300" />
                              <line v-for="i in 9" :key="'h'+i" x1="0" :y1="i * 30" x2="600" :y2="i * 30" />
                          </g>

                          <!-- Origin: x=120, y=240 (bottom left) -->
                          <g :transform="`translate(120, 240)`">
                              <polygon :points="`${currentLevelData.shear*30},0 ${currentLevelData.base*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},${-currentLevelData.height*30} ${currentLevelData.shear*30},${-currentLevelData.height*30}`"
                                       fill="rgba(249, 115, 22, 0.5)" stroke="#ea580c" stroke-width="3" stroke-linejoin="round" />

                              <!-- The Moving Triangle (Left side originally) -->
                              <g class="transition-all duration-1000 ease-in-out" :style="{ transform: step === 1 ? `translateX(${currentLevelData.base*30}px)` : 'translateX(0)' }">
                                  <polygon :points="`0,0 ${currentLevelData.shear*30},0 ${currentLevelData.shear*30},${-currentLevelData.height*30}`"
                                           fill="rgba(249, 115, 22, 0.8)" stroke="#ea580c" stroke-width="3" stroke-linejoin="round" />
                              </g>

                              <!-- Dimensions Labels -->
                              <!-- Height -->
                              <line :x1="-20" y1="0" :x2="-20" :y2="-currentLevelData.height*30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                              <text :x="-30" :y="-currentLevelData.height*15" font-weight="bold" fill="#64748b" text-anchor="end" alignment-baseline="middle">{{ currentLevelData.height }}</text>

                              <!-- Base -->
                              <line x1="0" y1="20" :x2="currentLevelData.base*30" y2="20" stroke="#64748b" stroke-width="2" />
                              <text :x="currentLevelData.base*15" y="40" font-weight="bold" fill="#64748b" text-anchor="middle">{{ currentLevelData.base }}</text>

                              <!-- Target ghost -->
                              <polygon v-if="step === 0" :points="`${currentLevelData.base*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},${-currentLevelData.height*30}`" fill="transparent" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
                          </g>
                      </svg>
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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

</style>
