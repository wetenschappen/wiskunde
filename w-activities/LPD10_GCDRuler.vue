<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'GGD: De Perfecte Tegel' },
  instruction: {
    type: String,
    default: 'De <strong>Grootste Gemeenschappelijke Deler (GGD)</strong> vertelt je wat de grootste tegel is waarmee je een muur perfect kan betegelen zonder stukjes te moeten afsnijden (geen "rest").<br/><br/><strong>Opdracht:</strong> Zoek de GGD door de slider te verschuiven naar de <strong>grootste vierkante tegel</strong> die perfect past.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om een tegelformaat te kiezen.' })
const attemptCount = ref(0)

// Level Logic — generated randomly
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }

function generateLevel(levelIndex) {
  let divisor, m, n, wallW, wallH

  if (levelIndex === 0) {
    divisor = pick([2, 3, 4, 5, 6])
    m = randomInt(2, 4)
    n = randomInt(2, 4)
  } else if (levelIndex === 1) {
    divisor = pick([4, 5, 6, 7, 8])
    m = randomInt(2, 5)
    n = randomInt(2, 5)
  } else {
    divisor = pick([5, 6, 7, 8, 9, 10, 12])
    m = randomInt(2, 6)
    n = randomInt(2, 6)
  }

  wallW = divisor * m
  wallH = divisor * n

  return {
    goalText: `Opdracht ${levelIndex + 1}: Een muur van ${wallW} bij ${wallH}`,
    wallW,
    wallH,
    targetAns: gcd(wallW, wallH),
    maxTile: Math.min(wallW, wallH)
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const tileSize = ref(1)

const tilesX = computed(() => Math.floor(currentLevelData.value.wallW / tileSize.value))
const tilesY = computed(() => Math.floor(currentLevelData.value.wallH / tileSize.value))

const remX = computed(() => currentLevelData.value.wallW % tileSize.value)
const remY = computed(() => currentLevelData.value.wallH % tileSize.value)

const hasRemainder = computed(() => remX.value > 0 || remY.value > 0)

// SVG Scaling
const maxSvgWidth = 500
const maxSvgHeight = 350
const scale = computed(() => Math.min(maxSvgWidth / currentLevelData.value.wallW, maxSvgHeight / currentLevelData.value.wallH))

const svgWidth = computed(() => currentLevelData.value.wallW * scale.value)
const svgHeight = computed(() => currentLevelData.value.wallH * scale.value)

function getHintText() {
  const d = currentLevelData.value
  if (attemptCount.value === 1) {
    return `Deel zowel ${d.wallW} als ${d.wallH} door het getal op de slider. Zie je een rest? Dan past de tegel niet perfect.`
  }
  if (attemptCount.value === 2) {
    return `Schrijf alle delers van ${d.wallW} en ${d.wallH} op. Welk getal is de grootste gemeenschappelijke deler?`
  }
  return `De GGD van ${d.wallW} en ${d.wallH} is ${d.targetAns}. Beweeg de slider naar ${d.targetAns} en kijk: de rode rand verdwijnt volledig!`
}

// Auto-correct: when slider matches target
function onTileSizeChange(val) {
  if (isCorrect.value) return
  tileSize.value = val

  if (val === currentLevelData.value.targetAns && val > 0) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! De ${val}x${val} tegel is de grootste die past zonder rest. GGD(${currentLevelData.value.wallW}, ${currentLevelData.value.wallH}) = ${val}.`
    }
  }
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Beweeg de slider om een tegelformaat te kiezen.' }
  attemptCount.value = 0
  tileSize.value = 1
}

function showNextHint() {
  attemptCount.value++
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-orange-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="mb-10 w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div class="flex justify-between items-end mb-4">
                    <label class="font-bold text-slate-500 uppercase tracking-widest text-xs">Grootte Tegel</label>
                    <span class="font-black text-2xl text-orange-600">{{ tileSize }} &times; {{ tileSize }}</span>
                </div>
                <input type="range" min="1" :max="currentLevelData.maxTile" step="1"
                       :value="tileSize" @input="onTileSizeChange(Number($event.target.value))"
                       :disabled="isCorrect"
                       class="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                <div class="flex justify-between mt-2 text-xs font-mono text-slate-400">
                    <span>1</span><span>{{ currentLevelData.maxTile }}</span>
                </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>

            <!-- Progressive hint (shown when slider is at wrong value) -->
            <div v-if="!isCorrect && attemptCount > 0"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ getHintText() }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="showNextHint" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Geef me een hint</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Visualisation -->
              <div class="flex flex-col items-center w-full max-w-3xl">

                  <div class="relative bg-white p-6 rounded-xl shadow-xl border-4 border-slate-300 transition-all duration-300"
                       :class="isCorrect ? 'border-emerald-400 bg-emerald-50' : ''">

                      <!-- Labels -->
                      <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-bold text-slate-500 text-lg">Breedte: {{ currentLevelData.wallW }}</div>
                      <div class="absolute top-1/2 -left-8 -translate-y-1/2 font-mono font-bold text-slate-500 text-lg transform -rotate-90 origin-center">Hoogte: {{ currentLevelData.wallH }}</div>

                      <!-- The Wall -->
                      <svg :width="svgWidth" :height="svgHeight" class="bg-slate-100 shadow-inner">

                          <!-- Grid of perfectly fitted tiles -->
                          <g>
                              <template v-for="x in tilesX" :key="'tx'+x">
                                  <template v-for="y in tilesY" :key="'ty'+y">
                                      <rect :x="(x-1) * tileSize * scale"
                                            :y="(y-1) * tileSize * scale"
                                            :width="tileSize * scale"
                                            :height="tileSize * scale"
                                            fill="#93c5fd" stroke="#2563eb" stroke-width="2" class="transition-all duration-300" />
                                  </template>
                              </template>
                          </g>

                          <!-- Remainder X Area (Red) -->
                          <rect v-if="remX > 0"
                                :x="tilesX * tileSize * scale"
                                :y="0"
                                :width="remX * scale"
                                :height="svgHeight"
                                fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3" />

                          <!-- Remainder Y Area (Red) -->
                          <rect v-if="remY > 0"
                                :x="0"
                                :y="tilesY * tileSize * scale"
                                :width="tilesX * tileSize * scale"
                                :height="remY * scale"
                                fill="url(#diagonalHatch)" stroke="#dc2626" stroke-width="3" />

                          <!-- Definitions for Red Hatching -->
                          <defs>
                              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                  <line x1="0" y1="0" x2="0" y2="10" stroke="#fca5a5" stroke-width="4" />
                              </pattern>
                          </defs>

                      </svg>

                      <!-- Overlay Win Message -->
                      <div v-if="isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div class="bg-emerald-500 text-white font-black text-4xl px-6 py-3 rounded-2xl shadow-xl transform -rotate-12 animate-bounce">
                              GGD = {{ tileSize }}
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

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #f97316;
  border: 4px solid white;
  cursor: pointer;
  margin-top: -12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 3px;
}
</style>