<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCrosshair,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelsels Grafisch Oplossen'
  },
  instruction: {
    type: String,
    default: 'Onderzoek het stelsel in de grafiek. Klik op het snijpunt, of geef aan dat het stelsel een speciaal geval is.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Randomization helpers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatEq(slope, intercept) {
  let result = 'y = '
  if (slope === 1) result += 'x'
  else if (slope === -1) result += '-x'
  else if (Number.isInteger(slope)) result += `${slope}x`
  else result += `${slope}x`
  if (intercept > 0) result += ` + ${intercept}`
  else if (intercept < 0) result += ` - ${Math.abs(intercept)}`
  return result
}

function formatEqMultiple(slope, intercept, factor) {
  const left = factor === 1 ? 'y' : `${factor}y`
  let right = ''
  const ms = slope * factor
  if (ms === 1) right += 'x'
  else if (ms === -1) right += '-x'
  else if (Number.isInteger(ms)) right += `${ms}x`
  else right += `${ms}x`
  const bs = intercept * factor
  if (bs > 0) right += ` + ${bs}`
  else if (bs < 0) right += ` - ${Math.abs(bs)}`
  return `${left} = ${right}`
}

function generateLevel(levelIndex) {
  if (levelIndex === 0) {
    // Bepaald (intersecting): random intersection point, random slopes
    const x0 = randomInt(-3, 3)
    const y0 = randomInt(-3, 3)
    const slopes = [0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2]
    let m1 = randomChoice(slopes)
    let m2
    do { m2 = randomChoice(slopes) } while (m2 === m1)
    const b1 = y0 - m1 * x0
    const b2 = y0 - m2 * x0
    return {
      type: 'bepaald',
      f_str: formatEq(m1, b1),
      f: (x) => m1 * x + b1,
      g_str: formatEq(m2, b2),
      g: (x) => m2 * x + b2,
      correctPoint: { x: x0, y: y0 },
      goalText: 'Opdracht 1: Klik exact op het snijpunt van deze twee rechten.',
      lines: [
        { x1: -5, y1: m1 * (-5) + b1, x2: 5, y2: m1 * 5 + b1 },
        { x1: -5, y1: m2 * (-5) + b2, x2: 5, y2: m2 * 5 + b2 }
      ]
    }
  } else if (levelIndex === 1) {
    // Strijdig (parallel): same slope, different intercept
    const slopes = [0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2]
    const m = randomChoice(slopes)
    let b1, b2
    b1 = randomInt(-4, 4)
    do { b2 = randomInt(-4, 4) } while (b2 === b1)
    return {
      type: 'strijdig',
      f_str: formatEq(m, b1),
      f: (x) => m * x + b1,
      g_str: formatEq(m, b2),
      g: (x) => m * x + b2,
      correctPoint: null,
      goalText: 'Opdracht 2: Zoek het snijpunt in de grafiek. Als er geen is, gebruik de knop.',
      lines: [
        { x1: -5, y1: m * (-5) + b1, x2: 5, y2: m * 5 + b1 },
        { x1: -5, y1: m * (-5) + b2, x2: 5, y2: m * 5 + b2 }
      ]
    }
  } else {
    // Onbepaald (coincident): same line in two different forms
    const slopes = [0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2]
    const m = randomChoice(slopes)
    const b = randomInt(-4, 4)
    const factor = randomChoice([2, 3])
    return {
      type: 'onbepaald',
      f_str: formatEq(m, b),
      f: (x) => m * x + b,
      g_str: formatEqMultiple(m, b, factor),
      g: (x) => m * x + b,
      correctPoint: null,
      goalText: 'Opdracht 3: Bekijk de vergelijkingen en de lijnen. Wat is hier aan de hand?',
      lines: [
        { x1: -5, y1: m * (-5) + b, x2: 5, y2: m * 5 + b },
        { x1: -5, y1: m * (-5) + b, x2: 5, y2: m * 5 + b }
      ]
    }
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const userPoint = ref(null)
const userSpecialChoice = ref(null)

const gridSize = 40 // px
const originX = 200 // px
const originY = 200 // px

function handleGridClick(e) {
  if (isChecked.value && isCorrect.value) return;

  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  let gridX = Math.round((clickX - originX) / gridSize)
  let gridY = Math.round((originY - clickY) / gridSize)

  gridX = Math.max(-5, Math.min(gridX, 5))
  gridY = Math.max(-5, Math.min(gridY, 5))

  const target = currentLevelData.value

  // Auto-correct for bepaald: correct click = correct answer
  if (target.type === 'bepaald') {
    if (gridX === target.correctPoint.x && gridY === target.correctPoint.y) {
      isCorrect.value = true
      userPoint.value = { x: gridX, y: gridY }
      feedback.value = { type: 'success', text: `Perfect! Het snijpunt (${target.correctPoint.x}, ${target.correctPoint.y}) is de unieke oplossing van dit stelsel.` }
      return
    }
    // Wrong click: give feedback
    userPoint.value = { x: gridX, y: gridY }
    userSpecialChoice.value = null
    isChecked.value = false
    feedback.value = { type: 'error', text: `Je koos (${gridX}, ${gridY}). Dat is niet het snijpunt waar beide lijnen exact kruisen.` }
    return
  }

  // For strijdig/onbepaald: let user click grid but guide them
  userPoint.value = { x: gridX, y: gridY }
  userSpecialChoice.value = null
  isChecked.value = false

  if (target.type === 'strijdig') {
    feedback.value = { type: 'error', text: 'Niet helemaal... Kijk naar de richting van de lijnen. Ze zijn evenwijdig! Gebruik de speciale knoppen onderaan.' }
  } else {
    feedback.value = { type: 'error', text: 'Niet helemaal... Let op! De twee vergelijkingen stellen exact dezelfde rechte voor. Gebruik de speciale knoppen.' }
  }
}

function setSpecialChoice(type) {
  if (isCorrect.value) return;

  const target = currentLevelData.value

  // Auto-correct: correct special choice = correct answer
  if ((target.type === 'strijdig' && type === 'strijdig') ||
      (target.type === 'onbepaald' && type === 'onbepaald')) {
    isCorrect.value = true
    userSpecialChoice.value = type
    userPoint.value = null
    if (target.type === 'strijdig') {
      feedback.value = { type: 'success', text: 'Prima!! De lijnen zijn evenwijdig. Ze snijden nooit, dus er is geen oplossing (strijdig stelsel).' }
    } else {
      feedback.value = { type: 'success', text: 'Prima! Zeer scherp! De tweede vergelijking is een veelvoud van de eerste. Het is dezelfde lijn, dus er zijn oneindig veel oplossingen (onbepaald).' }
    }
    return
  }

  // Wrong special choice
  userSpecialChoice.value = type
  userPoint.value = null
  isChecked.value = false

  if (target.type === 'strijdig') {
    feedback.value = { type: 'error', text: 'Niet helemaal... Kijk naar de lijnen (en hun richtingscoëfficiënt). Gaan deze ooit snijden? Zoek de juiste speciale knop.' }
  } else {
    feedback.value = { type: 'error', text: 'Niet helemaal... Heb je het snijpunt gezocht? Let op: beide vergelijkingen tekenen éxact dezelfde rechte! Wat betekent dat voor het aantal snijpunten?' }
  }
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Analyseer het stelsel.' };
  userPoint.value = null;
  userSpecialChoice.value = null;
  attemptCount.value = 0;
  if (levels.value.length === 0) {
    levels.value = [0, 1, 2].map(i => generateLevel(i))
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    levels.value = [0, 1, 2].map(i => generateLevel(i))
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
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

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800">Stelsel:</p>
              <div class="bg-white p-4 border border-slate-200 rounded-lg font-mono text-lg shadow-sm space-y-2 border-l-4 border-l-slate-800 relative">
                <span class="absolute left-[-18px] top-1/2 -translate-y-1/2 text-4xl font-light text-slate-400">{</span>
                <p class="text-blue-600 font-bold ml-4">{{ currentLevelData.f_str }}</p>
                <p class="text-emerald-600 font-bold ml-4">{{ currentLevelData.g_str }}</p>
              </div>

              <!-- Options -->
              <div class="pt-4 flex flex-col gap-2">
                <div v-if="userPoint" class="p-4 border-2 border-math-blue bg-math-blue-bg rounded-lg text-center shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="userPoint = null" role="button" tabindex="0" @keydown.enter.prevent="userPoint = null" @keydown.space.prevent="userPoint = null" aria-label="Selecteer punt">
                  <p class="text-xs font-bold text-math-blue uppercase">Gekozen Snijpunt:</p>
                  <p class="text-xl font-mono font-black text-math-blue">({{ userPoint.x }}, {{ userPoint.y }})</p>
                  <p class="text-[10px] text-math-blue mt-1">(Klik om te wissen)</p>
                </div>
                <div v-else class="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-400 font-medium text-sm">
                   Klik in de grafiek voor een snijpunt
                </div>

                <div class="h-px bg-slate-200 my-2"></div>
                <p class="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-1">Of kies een speciaal geval:</p>

                <button @click="setSpecialChoice('strijdig')"
                        class="p-4 border-2 rounded-lg font-bold transition-all shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                        :class="isCorrect && currentLevelData.type === 'strijdig' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : userSpecialChoice === 'strijdig' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'">
                  Geen snijpunt (Strijdig stelsel)
                </button>
                <button @click="setSpecialChoice('onbepaald')"
                        class="p-4 border-2 rounded-lg font-bold transition-all shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"
                        :class="isCorrect && currentLevelData.type === 'onbepaald' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : userSpecialChoice === 'onbepaald' ? 'border-math-blue bg-math-blue-bg text-math-blue' : 'border-slate-200 bg-white text-slate-600 hover:border-surface-200'">
                  Oneindig veel snijpunten (Onbepaald stelsel)
                </button>

              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <!-- Auto-correct: no Controleer button needed -->
              <button v-if="!isCorrect" disabled class="flex-1 py-4 font-bold text-slate-400 transition-all rounded-lg shadow-md bg-slate-100 cursor-default">
                Klik in grafiek of kies speciaal geval
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]"
                   style="width: 400px; height: 400px;"
                   @click="handleGridClick" role="button" tabindex="0" @keydown.enter.prevent="handleGridClick" @keydown.space.prevent="handleGridClick" aria-label="Selecteer vak op het rooster">

                <!-- SVG Coordinate System (-5 to 5, origin at 200,200, grid 40px) -->
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <!-- Grid Lines -->
                  <g stroke="#e2e8f0" stroke-width="1">
                    <line v-for="i in 11" :key="'v'+i" :x1="(i-1)*40" y1="0" :x2="(i-1)*40" y2="400" />
                    <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*40" x2="400" :y2="(i-1)*40" />
                  </g>

                  <!-- Axes -->
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#94a3b8" stroke-width="2" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" stroke-width="2" />

                  <!-- Graph lines mapped -->
                  <line :x1="200 + currentLevelData.lines[0].x1 * 40" :y1="200 - currentLevelData.lines[0].y1 * 40"
                        :x2="200 + currentLevelData.lines[0].x2 * 40" :y2="200 - currentLevelData.lines[0].y2 * 40"
                        stroke="#2563eb" stroke-width="3" stroke-linecap="round" class="transition-all duration-300" />

                  <line :x1="200 + currentLevelData.lines[1].x1 * 40" :y1="200 - currentLevelData.lines[1].y1 * 40"
                        :x2="200 + currentLevelData.lines[1].x2 * 40" :y2="200 - currentLevelData.lines[1].y2 * 40"
                        stroke="#10b981" stroke-width="3" stroke-linecap="round" class="transition-all duration-300"
                        :stroke-dasharray="currentLevelData.type === 'onbepaald' ? '8,8' : 'none'" />

                  <!-- User Point -->
                  <circle v-if="userPoint"
                          :cx="originX + userPoint.x * gridSize"
                          :cy="originY - userPoint.y * gridSize"
                          r="6" fill="#f97316" stroke="#fff" stroke-width="2" />

                  <!-- Correct Point indicator when correct -->
                  <circle v-if="isCorrect && currentLevelData.type === 'bepaald'"
                          :cx="originX + currentLevelData.correctPoint.x * gridSize"
                          :cy="originY - currentLevelData.correctPoint.y * gridSize"
                          r="8" fill="#10b981" stroke="#fff" stroke-width="3" class="animate-fadeIn" />

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

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
