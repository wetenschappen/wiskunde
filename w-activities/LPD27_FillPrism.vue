<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBoundingBox, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Volume: De Balk Vullen' },
  instruction: {
    type: String,
    default: 'Het volume (inhoud) van een rechte vorm is altijd: <strong>Oppervlakte Grondvlak × Hoogte</strong>. We stapelen eigenlijk gewoon laagjes op elkaar!<br/><br/><strong>Opdracht:</strong> Vul de lege doos. Bereken eerst de oppervlakte van één laagje (het grondvlak). Bereken daarna het totale volume.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBoundingBox }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stap 1: Bereken het Grondvlak en klik op "Vul Bodemlaag".' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(levelIndex) {
  switch (levelIndex) {
    case 0: return { w: randomInt(3, 5), d: randomInt(2, 4), h: randomInt(3, 5) }
    case 1: return { w: randomInt(4, 6), d: randomInt(3, 5), h: randomInt(4, 6) }
    case 2: return { w: randomInt(5, 7), d: randomInt(3, 5), h: randomInt(5, 7) }
    default: return { w: 5, d: 3, h: 4 }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const baseArea = computed(() => currentLevelData.value.w * currentLevelData.value.d)
const totalVol = computed(() => baseArea.value * currentLevelData.value.h)

// Domain Logic
const step = ref(0) // 0: empty, 1: base layer, 2: full
const ansBase = ref(null)
const ansVol = ref(null)

function getHint(phase) {
  if (phase === 'base') {
    if (attemptCount.value <= 1) {
      return `Kijk naar de bodem van de doos. Het is een rechthoek van ${currentLevelData.value.w} bij ${currentLevelData.value.d}. Wat is de oppervlakte daarvan?`
    } else if (attemptCount.value === 2) {
      return `De oppervlakte van een rechthoek is lengte × breedte. Dus ${currentLevelData.value.w} × ${currentLevelData.value.d} = ?`
    }
    return `Berekening: ${currentLevelData.value.w} × ${currentLevelData.value.d} = ${baseArea.value}`
  }
  // phase === 'volume'
  if (attemptCount.value <= 1) {
    return `Je vult de doos laag per laag. Elke laag heeft oppervlakte ${baseArea.value}. Hoeveel van die lagen passen erin (kijk naar de hoogte)?`
  } else if (attemptCount.value === 2) {
    return `Volume = Oppervlakte Grondvlak × Hoogte = ${baseArea.value} × ${currentLevelData.value.h} = ?`
  }
  return `Berekening: ${baseArea.value} × ${currentLevelData.value.h} = ${totalVol.value}`
}

function fillBase() {
    if (ansBase.value === baseArea.value) {
        step.value = 1
        attemptCount.value = 0
        feedback.value = { type: 'success', text: `Correct! Het grondvlak is ${currentLevelData.value.w} × ${currentLevelData.value.d} = ${baseArea.value}. Eén laagje bevat dus ${baseArea.value} blokjes. Hoeveel van deze laagjes passen erin?` }
    } else {
        attemptCount.value++
        feedback.value = { type: 'error', text: getHint('base') }
    }
}

function fillAll() {
    isChecked.value = true
    if (ansVol.value === totalVol.value) {
        step.value = 2
        isCorrect.value = true
        feedback.value = { type: 'success', text: `Briljant! Je hebt het grondvlak (${baseArea.value}) vermenigvuldigd met de hoogte (${currentLevelData.value.h}). In totaal zijn dat ${totalVol.value} blokjes!` }
    } else {
        isCorrect.value = false
        attemptCount.value++

        if (ansVol.value === baseArea.value) {
            feedback.value = { type: 'error', text: `${baseArea.value} is maar één laagje. Hoeveel laagjes passen erin (kijk naar de hoogte)?`}
        } else {
            feedback.value = { type: 'error', text: getHint('volume') }
        }
    }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Stap 1: Bereken het Grondvlak en klik op "Vul Bodemlaag".' };
    step.value = 0;
    ansBase.value = null;
    ansVol.value = null;
    attemptCount.value = 0;
    if (levels.value.length === 0) {
      levels.value = [0, 1, 2].map(i => generateLevel(i))
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner flex flex-col gap-6">

               <!-- Step 1 -->
               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-indigo-900">1. Oppervlakte Grondvlak (G):</label>
                   <div class="flex items-center gap-2">
                       <input type="number" v-model.number="ansBase" placeholder="L × B" :disabled="step > 0"
                              class="w-full font-bold text-lg p-2 border-2 border-indigo-300 rounded focus:border-indigo-500 text-center bg-white" />
                       <button @click="fillBase" v-if="step === 0" class="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 shadow-sm active:scale-95 transition-transform">Vul Laag</button>
                       <PhCheckCircle v-if="step > 0" weight="fill" class="w-8 h-8 text-emerald-500 shrink-0 animate-fadeIn" />
                   </div>
               </div>

               <!-- Step 2 -->
               <div class="flex flex-col gap-2 pt-4 border-t border-indigo-200" :class="step === 0 ? 'opacity-50 pointer-events-none' : ''">
                   <label class="text-sm font-bold text-indigo-900">2. Totaal Volume (G × h):</label>
                   <div class="flex items-center gap-2">
                       <input type="number" v-model.number="ansVol" placeholder="Grondvlak × Hoogte" :disabled="isCorrect"
                              class="w-full font-bold text-xl p-3 border-2 border-indigo-400 rounded-lg focus:border-indigo-600 text-center bg-white" />
                       <span class="font-black text-slate-500">cm³</span>
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
              <button v-if="!isCorrect" @click="fillAll" :disabled="step === 0 || ansVol === null" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Vul Volledig Doos</button>
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

                  <div class="relative bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-slate-200 p-8 flex items-center justify-center" style="width: 500px; height: 500px;" :key="currentInternalLevel">
                      <svg width="400" height="400" viewBox="-200 -250 400 400">

                          <!-- Isometric definitions -->
                          <!-- dx_x = 26, dy_x = 15 -->
                          <!-- dx_z = -26, dy_z = 15 -->
                          <!-- dx_y = 0, dy_y = -30 -->

                          <!-- Wireframe Back/Bottom -->
                          <g stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" fill="none">
                              <!-- Back left edge (height) -->
                              <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                              <!-- Bottom back edge (width) -->
                              <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15" />
                          </g>

                          <!-- Filled Layers -->
                          <g v-if="step >= 1">
                              <template v-for="h in (step === 2 ? currentLevelData.h : 1)" :key="'h'+h">
                                  <template v-for="z in currentLevelData.d" :key="'z'+z">
                                      <template v-for="x in currentLevelData.w" :key="'x'+x">
                                          <!-- A single isometric cube at (x-1, h-1, z-1) -->
                                          <g :transform="`translate(${ (x-1)*26 - (z-1)*26 }, ${ (x-1)*15 + (z-1)*15 - (h-1)*30 })`" class="animate-fadeIn" :style="`animation-delay: ${(h-1)*0.1 + (z-1)*0.02 + (x-1)*0.02}s`">
                                              <!-- Top face -->
                                              <polygon points="0,-30 26,-15 0,0 -26,-15" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1" />
                                              <!-- Left face -->
                                              <polygon points="-26,-15 0,0 0,30 -26,15" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1" />
                                              <!-- Right face -->
                                              <polygon points="0,0 26,-15 26,15 0,30" fill="#2563eb" stroke="#1d4ed8" stroke-width="1" />
                                          </g>
                                      </template>
                                  </template>
                              </template>
                          </g>

                          <!-- Wireframe Front/Top Edges -->
                          <g stroke="#334155" stroke-width="3" fill="none">
                              <!-- Bottom Front -->
                              <line x1="0" y1="0" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15" />
                              <line x1="0" y1="0" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15" />
                              <!-- Top Edges -->
                              <line x1="0" :y1="-currentLevelData.h*30" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15 - currentLevelData.h*30" />
                              <line x1="0" :y1="-currentLevelData.h*30" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                              <line :x1="currentLevelData.w*26" :y1="currentLevelData.w*15 - currentLevelData.h*30" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15 - currentLevelData.h*30" />
                              <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15 - currentLevelData.h*30" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15 - currentLevelData.h*30" />
                              <!-- Front Verticals -->
                              <line x1="0" y1="0" x2="0" :y2="-currentLevelData.h*30" />
                              <line :x1="currentLevelData.w*26" :y1="currentLevelData.w*15" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15 - currentLevelData.h*30" />
                              <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                          </g>

                          <!-- Dimensions Labels -->
                          <!-- Width -->
                          <text :x="(currentLevelData.w*26)/2 + 15" :y="(currentLevelData.w*15)/2 + 15" font-weight="bold" fill="#1e293b" transform="rotate(30 ${(currentLevelData.w*26)/2} ${(currentLevelData.w*15)/2})">Breedte = {{ currentLevelData.w }}</text>
                          <!-- Depth -->
                          <text :x="-(currentLevelData.d*26)/2 - 25" :y="(currentLevelData.d*15)/2 - 5" font-weight="bold" fill="#1e293b" transform="rotate(-30 ${-(currentLevelData.d*26)/2} ${(currentLevelData.d*15)/2})">Diepte = {{ currentLevelData.d }}</text>
                          <!-- Height -->
                          <text :x="currentLevelData.w*26 + 15" :y="currentLevelData.w*15 - (currentLevelData.h*30)/2 + 5" font-weight="bold" fill="#1e293b">Hoogte = {{ currentLevelData.h }}</text>

                      </svg>
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
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
</style>