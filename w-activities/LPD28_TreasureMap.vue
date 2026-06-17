<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMapPin, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Coördinaten: De Schatkaart' },
  instruction: {
    type: String,
    default: 'Een coördinaat (x, y) werkt altijd in deze volgorde: éérst horizontaal (x-as), dan verticaal (y-as).<br/><br/><strong>Opdracht:</strong> Klik op de juiste coördinaten om de schat te graven!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMapPin }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const attemptCount = ref(0)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel() {
  const l = []
  // Level 1: constrained range, easy coordinates
  let x1, y1
  do { x1 = randomInt(-3, 3); y1 = randomInt(-3, 3) } while (x1 === 0 || y1 === 0 || x1 === y1)
  l.push({ targetX: x1, targetY: y1 })
  // Level 2: medium range
  let x2, y2
  do { x2 = randomInt(-4, 4); y2 = randomInt(-4, 4) } while (x2 === 0 || y2 === 0 || x2 === y2)
  l.push({ targetX: x2, targetY: y2 })
  // Level 3: full range
  let x3, y3
  do { x3 = randomInt(-4, 4); y3 = randomInt(-4, 4) } while (x3 === 0 || y3 === 0 || x3 === y3)
  l.push({ targetX: x3, targetY: y3 })
  levels.value = l
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value] || { targetX: 0, targetY: 0 })

const userX = ref(null)
const userY = ref(null)

function clickGrid(x, y) {
  if (isCorrect.value) return
  userX.value = x
  userY.value = y
  checkAnswer()
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op een kruispunt in het assenstelsel.' }
  userX.value = null
  userY.value = null
}

function getHintText(t) {
  const count = attemptCount.value
  if (count === 1) {
    return `Hint: de schat ligt in het ${t.targetX > 0 ? (t.targetY > 0 ? 'Kwadrant I (x>0, y>0)' : 'Kwadrant IV (x>0, y<0)') : (t.targetY > 0 ? 'Kwadrant II (x<0, y>0)' : 'Kwadrant III (x<0, y<0)')}.`
  } else if (count === 2) {
    return `Hint: de x-coördinaat is ${t.targetX}. Tel ${Math.abs(t.targetX)} stap${Math.abs(t.targetX) !== 1 ? 'pen' : ''} ${t.targetX > 0 ? 'rechts' : 'links'} vanaf 0.`
  } else {
    return `Het juiste antwoord is (${t.targetX}, ${t.targetY}). Eerst ${Math.abs(t.targetX)} ${t.targetX > 0 ? 'rechts' : 'links'}, dan ${Math.abs(t.targetY)} ${t.targetY > 0 ? 'omhoog' : 'omlaag'}.`
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

function checkAnswer() {
  isChecked.value = true
  const t = currentLevel.value
  if (userX.value === t.targetX && userY.value === t.targetY) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: `Schat gevonden op (${t.targetX}, ${t.targetY})! Eerst ${Math.abs(t.targetX)} stap${Math.abs(t.targetX) > 1 ? 'pen' : ''} ${t.targetX > 0 ? 'rechts' : 'links'}, dan ${Math.abs(t.targetY)} ${Math.abs(t.targetY) > 1 ? 'stappen' : 'stap'} ${t.targetY > 0 ? 'omhoog' : 'omlaag'}.` }
  } else {
    attemptCount.value++
    if (userX.value === t.targetY && userY.value === t.targetX) {
      feedback.value = { type: 'error', text: `Oeps! Je klikte (${userX.value}, ${userY.value}) — je hebt x en y omgedraaid! Het eerste getal is altijd horizontaal. ${getHintText(t)}` }
    } else if (userX.value !== t.targetX && userY.value === t.targetY) {
      feedback.value = { type: 'error', text: `y klopt (${t.targetY}), maar x is fout. Doel x = ${t.targetX}. ${getHintText(t)}` }
    } else if (userX.value === t.targetX && userY.value !== t.targetY) {
      feedback.value = { type: 'error', text: `x klopt (${t.targetX}), maar y is fout. Doel y = ${t.targetY}. Let op het teken! ${getHintText(t)}` }
    } else {
      feedback.value = { type: 'error', text: `Hier ligt geen schat! (${userX.value}, ${userY.value}) is fout. Doel was (${t.targetX}, ${t.targetY}). ${getHintText(t)}` }
    }
  }
}

function goToNextStep() {
  if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
  else emit('complete')
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    generateLevel()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
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
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
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
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="p-4 mt-6 border border-orange-200 bg-orange-50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-orange-900 mb-2">Jouw klik:</label>
              <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-700">
                <span>(</span>
                <div class="w-16 p-2 rounded shadow-sm border" :class="userX !== null ? 'border-orange-300 bg-white text-orange-600' : 'border-slate-200 bg-slate-50 text-slate-300'">{{ userX !== null ? userX : 'x' }}</div>
                <span>,</span>
                <div class="w-16 p-2 rounded shadow-sm border" :class="userY !== null ? 'border-blue-300 bg-white text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-300'">{{ userY !== null ? userY : 'y' }}</div>
                <span>)</span>
              </div>
              <p v-if="currentLevel.targetX > 0 && currentLevel.targetY > 0" class="mt-3 text-xs text-orange-700 font-medium">Tip: de schat ligt in Kwadrant I (x>0, y>0)</p>
              <p v-else-if="currentLevel.targetX < 0 && currentLevel.targetY > 0" class="mt-3 text-xs text-orange-700 font-medium">Tip: de schat ligt in Kwadrant II (x&lt;0, y>0)</p>
              <p v-else-if="currentLevel.targetX < 0 && currentLevel.targetY < 0" class="mt-3 text-xs text-orange-700 font-medium">Tip: de schat ligt in Kwadrant III (x&lt;0, y&lt;0)</p>
              <p v-else class="mt-3 text-xs text-orange-700 font-medium">Tip: de schat ligt in Kwadrant IV (x>0, y&lt;0)</p>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
              <div v-if="!isCorrect" class="flex-1 py-3"></div>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-map">
            <div class="relative bg-[#fdfbf7] shadow-xl rounded-2xl overflow-hidden border-4 border-slate-800 p-4">
              <svg width="500" height="500" viewBox="0 0 500 500" class="block">
                <g stroke="#cbd5e1" stroke-width="1">
                  <line v-for="i in 11" :key="'vg'+i" :x1="(i-1) * 50" y1="0" :x2="(i-1) * 50" y2="500" />
                  <line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1) * 50" x2="500" :y2="(i-1) * 50" />
                </g>
                <line x1="0" y1="250" x2="500" y2="250" stroke="#0ea5e9" stroke-width="4" />
                <line x1="250" y1="0" x2="250" y2="500" stroke="#f97316" stroke-width="4" />
                <text x="480" y="240" font-weight="bold" fill="#0ea5e9" font-size="16">x</text>
                <text x="260" y="20" font-weight="bold" fill="#f97316" font-size="16">y</text>
                <text x="260" y="240" font-weight="bold" fill="#334155" font-size="12">0</text>
                <text x="500" y="240" font-weight="bold" fill="#0ea5e9" font-size="12" text-anchor="end">5</text>
                <text x="490" y="245" font-weight="bold" fill="#0ea5e9" font-size="10" text-anchor="end">x→</text>
                <text x="260" y="20" font-weight="bold" fill="#f97316" font-size="10">↑y</text>
                <!-- Quadrant labels -->
                <text x="440" y="40" fill="#e2e8f0" font-size="20" font-weight="900">I</text>
                <text x="40" y="40" fill="#e2e8f0" font-size="20" font-weight="900">II</text>
                <text x="40" y="480" fill="#e2e8f0" font-size="20" font-weight="900">III</text>
                <text x="440" y="480" fill="#e2e8f0" font-size="20" font-weight="900">IV</text>
                <!-- Interactive Click Zones -->
                <g v-for="x in 11" :key="'ix'+x">
                  <g v-for="y in 11" :key="'iy'+y">
                    <circle :cx="(x-1)*50" :cy="(y-1)*50" r="15" fill="transparent" class="cursor-crosshair hover:fill-amber-500/30 transition-colors" @click="clickGrid(x - 6, 6 - y)" />
                  </g>
                </g>
                <!-- User marker -->
                <g v-if="userX !== null && userY !== null" class="animate-fadeIn pointer-events-none">
                  <circle :cx="(userX + 5) * 50" :cy="(5 - userY) * 50" r="12" :fill="isCorrect ? 'none' : 'none'" :stroke="isCorrect ? '#10b981' : '#ef4444'" stroke-width="4" />
                  <circle :cx="(userX + 5) * 50" :cy="(5 - userY) * 50" r="4" :fill="isCorrect ? '#10b981' : '#ef4444'" />
                  <text v-if="isCorrect" :x="(userX + 5) * 50" :y="(5 - userY) * 50 - 20" text-anchor="middle" font-size="28">💎</text>
                </g>
              </svg>
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
.pattern-map { background-color: #f8fafc; background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 100 100 M 100 0 L 0 100" stroke="rgba(0,0,0,0.03)" stroke-width="1"/></svg>'); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(0.5); } }
</style>
