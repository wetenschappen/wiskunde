<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCube, PhArrowClockwise, PhCornersOut
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Oppervlakte: De Kubus Ontvouwen' },
  instruction: {
    type: String,
    default: 'Formules blokken is saai. Als je de <strong>oppervlakte</strong> (al het "verfwerk" aan de buitenkant) van een 3D-vorm zoekt, vouw hem dan gewoon plat!<br/><br/><strong>Opdracht:</strong> Ontvouw de kubus. Uit hoeveel gelijke vierkanten bestaat hij? Bereken de totale oppervlakte.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de kubus uit te vouwen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(levelIndex) {
  switch (levelIndex) {
    case 0: return { side: randomInt(2, 4) }
    case 1: return { side: randomInt(3, 5) }
    case 2: return { side: randomInt(4, 6) }
    default: return { side: 4 }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const singleArea = computed(() => currentLevelData.value.side * currentLevelData.value.side)
const totalArea = computed(() => singleArea.value * 6)

// Domain Logic
const userAns = ref(null)
const isUnfolded = ref(false)

function getHint() {
  if (attemptCount.value <= 1) {
    return 'Ontvouw eerst de kubus. Hoeveel vierkanten zie je?'
  } else if (attemptCount.value === 2) {
    return `Eén vierkantje heeft zijde ${currentLevelData.value.side}. De oppervlakte van één vlak is dus ${currentLevelData.value.side} × ${currentLevelData.value.side}.`
  }
  return `Berekening: één vlak = ${currentLevelData.value.side} × ${currentLevelData.value.side} = ${singleArea.value}. Totaal = ${singleArea.value} × 6 = ?`
}

function unfoldCube() {
    if (isCorrect.value) return;
    isUnfolded.value = true
    feedback.value = { type: 'success', text: `Kijk! Een 3D-kubus is gewoon een verzameling van 6 platte 2D-vierkanten (de "ontwikkeling"). Bereken nu de totale oppervlakte.` }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de knop om de kubus uit te vouwen.' };
    isUnfolded.value = false;
    userAns.value = null;
    attemptCount.value = 0;
    if (levels.value.length === 0) {
      levels.value = [0, 1, 2].map(i => generateLevel(i))
    }
}

function checkAnswer() {
  isChecked.value = true;

  if (userAns.value === totalArea.value) {
    if (isUnfolded.value) {
        isCorrect.value = true
        feedback.value = {
          type: 'success',
          text: `Perfect! Eén vierkantje is ${currentLevelData.value.side}×${currentLevelData.value.side} = ${singleArea.value}. Er zijn er 6, dus ${singleArea.value} × 6 = ${totalArea.value}.`
        }
    } else {
        isCorrect.value = false
        attemptCount.value++
        feedback.value = { type: 'error', text: `${totalArea.value} is correct! Maar ontvouw eerst de kubus om visueel te zien WAAROM de formule 6 × z² is.`}
    }
  } else {
    isCorrect.value = false
    attemptCount.value++

    if (userAns.value === currentLevelData.value.side * currentLevelData.value.side * currentLevelData.value.side) {
        feedback.value = { type: 'error', text: `Je hebt het VOLUME (Inhoud) berekend: ${currentLevelData.value.side}×${currentLevelData.value.side}×${currentLevelData.value.side}. Maar we zoeken de OPPERVLAKTE (verf nodig voor de buitenkant). Ontvouw hem!`}
    } else if (userAns.value === singleArea.value) {
        feedback.value = { type: 'error', text: `${singleArea.value} is de oppervlakte van slechts EEN van de zijvlakken. Uit hoeveel van die vierkanten bestaat de kubus?`}
    } else {
        feedback.value = { type: 'error', text: getHint() }
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
    levels.value = [0, 1, 2].map(i => generateLevel(i))
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
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
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner text-center">
               <label class="block text-sm font-bold text-teal-900 mb-2">Totale Oppervlakte:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-2xl p-3 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-teal-500 text-center bg-white" />
                   <span class="font-black text-2xl text-slate-500">cm²</span>
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

              <div class="w-full max-w-2xl flex flex-col items-center">

                  <div class="mb-12">
                      <button @click="unfoldCube" :disabled="isCorrect || isUnfolded"
                              class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                          <PhCornersOut weight="bold" class="w-6 h-6" /> Ontvouw Kubus
                      </button>
                  </div>

                  <!-- Visualisation Area -->
                  <div class="relative w-[500px] h-[400px] perspective-container flex items-center justify-center" :key="currentInternalLevel">

                      <!-- 3D Cube Container (rotates slightly when solid, flattens when unfolded) -->
                      <div class="cube-assembly preserve-3d transition-transform duration-1000 ease-in-out w-32 h-32 relative"
                           :style="{ transform: isUnfolded ? 'rotateX(0deg) rotateY(0deg) scale(1.2)' : 'rotateX(-20deg) rotateY(-30deg)' }">

                           <!-- Face dimensions: 128x128. Translate Z is 64px. -->

                           <!-- Front -->
                           <div class="face front bg-blue-500 border-2 border-blue-700 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px)' : 'rotateY(0deg) translateZ(64px)' }">
                                <span class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Back -->
                           <div class="face back bg-indigo-500 border-2 border-indigo-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(180deg) translateZ(0px) translateY(256px)' : 'rotateY(180deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80" style="transform: rotate(180deg)">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Top -->
                           <div class="face top bg-sky-400 border-2 border-sky-600 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(-128px)' : 'rotateX(90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Bottom -->
                           <div class="face bottom bg-cyan-600 border-2 border-cyan-800 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(128px)' : 'rotateX(-90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Left -->
                           <div class="face left bg-teal-500 border-2 border-teal-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(-128px)' : 'rotateY(-90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
                           </div>

                           <!-- Right -->
                           <div class="face right bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                                :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(128px)' : 'rotateY(90deg) translateZ(64px)' }">
                                <span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}×{{ currentLevelData.side }}</span>
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
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* 3D Cube Logic */
.perspective-container {
    perspective: 1000px;
}
.preserve-3d {
    transform-style: preserve-3d;
}
.face {
    position: absolute;
    width: 128px;
    height: 128px;
    transition: transform 1s cubic-bezier(0.25, 0.1, 0.25, 1);
    backface-visibility: visible;
}
</style>