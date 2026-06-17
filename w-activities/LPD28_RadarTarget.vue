<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCrosshair, PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Coördinaten: Radar Detectie' },
  instruction: {
    type: String,
    default: 'Een vijandige onderzeeër is gespot! <br/><br/><strong>Opdracht:</strong> Klik op de radar op de juiste coördinaten (x, y) van de onderzeeër om een torpedo af te vuren.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCrosshair }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = computed(() => [
  { targetX: -3, targetY: 2, hint: 'Level 1: Eén stap naar links (x = -1) en twee omhoog (y = 2).' },
  { targetX: randomInt(-5, 5), targetY: randomInt(-5, 5), hint: 'Level 2: Denk aan de volgorde: eerst horizontaal (x), dan verticaal (y).' },
  { targetX: randomInt(-5, 5), targetY: randomInt(-5, 5), hint: 'Level 3: Laatste kans! Let goed op de negatieve getallen.' }
])

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

const userX = ref(null)
const userY = ref(null)
const isFired = ref(false)

function fireTorpedo() {
    if (isCorrect.value || userX.value === null || userY.value === null) return
    isChecked.value = true
    isFired.value = true
    setTimeout(() => { checkAnswer() }, 1000)
}

function clickRadar(x, y) {
    if (isCorrect.value || isFired.value) return
    userX.value = x
    userY.value = y
    fireTorpedo()
}

function resetActivityState() {
    isCorrect.value = false
    isChecked.value = false
    isFired.value = false
    userX.value = null
    userY.value = null
    feedback.value = { type: 'info', text: 'Klik op de radar waar de onderzeeër zich bevindt.' }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    emit('complete')
  }
}

function checkAnswer() {
  const t = currentLevel.value
  if (userX.value === t.targetX && userY.value === t.targetY) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: `BOEM! Voltreffer! (${t.targetX}, ${t.targetY}) — ${t.targetX} stappen ${t.targetX < 0 ? 'links' : 'rechts'}, ${t.targetY} stappen ${t.targetY < 0 ? 'omlaag' : 'omhoog'}.` }
  } else {
    isCorrect.value = false
    if (userX.value === t.targetY && userY.value === t.targetX) {
      feedback.value = { type: 'error', text: `Mis op (${userX.value}, ${userY.value})! Je hebt x en y omgedraaid! Lees eerst horizontaal (x-as), dan verticaal (y-as).` }
    } else if (userX.value === t.targetX && userY.value !== t.targetY) {
      feedback.value = { type: 'error', text: `x klopt (${t.targetX}), maar y is fout. Doel is y = ${t.targetY}.` }
    } else if (userX.value !== t.targetX && userY.value === t.targetY) {
      feedback.value = { type: 'error', text: `y klopt (${t.targetY}), maar x is fout. Doel is x = ${t.targetX}.` }
    } else {
      feedback.value = { type: 'error', text: `Mis! Je schoot op (${userX.value}, ${userY.value}). Doel was (${t.targetX}, ${t.targetY}). Begin bij (0,0).` }
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
    resetActivityState()
    currentInternalLevel.value = 0
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="props.instruction"></div>
            <div class="p-4 mt-6 border border-emerald-900 bg-emerald-900/30 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-emerald-400 mb-2">Jouw schot:</label>
              <div class="flex items-center justify-center gap-2 text-3xl font-black text-slate-300 mb-2">
                <span>(</span>
                <span class="w-16 p-2 rounded bg-slate-900 border" :class="userX !== null ? 'border-emerald-500 text-emerald-400' : 'border-slate-600 text-slate-500'">{{ userX !== null ? userX : 'x' }}</span>
                <span>,</span>
                <span class="w-16 p-2 rounded bg-slate-900 border" :class="userY !== null ? 'border-blue-500 text-blue-400' : 'border-slate-600 text-slate-500'">{{ userY !== null ? userY : 'y' }}</span>
                <span>)</span>
              </div>
              <div class="flex gap-2 mt-3">
                <button @click="fireTorpedo" :disabled="isFired || userX === null || userY === null"
                  class="flex-1 py-3 rounded-lg font-black tracking-widest uppercase transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1"
                  :class="isFired ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-red-500 border-red-700 text-white hover:bg-red-400'">Vuur</button>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-amber-400 hover:bg-amber-300 active:scale-[0.98]">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative">
            <div class="relative bg-slate-800 shadow-2xl rounded-full overflow-hidden border-8 border-slate-700 p-2">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#064e3b_0%,_#020617_100%)]"></div>
              <svg width="400" height="400" viewBox="0 0 400 400" class="block relative z-10">
                <circle cx="200" cy="200" r="200" fill="none" stroke="#10b981" stroke-width="2" opacity="0.3" />
                <circle cx="200" cy="200" r="160" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                <circle cx="200" cy="200" r="120" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                <circle cx="200" cy="200" r="80" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                <circle cx="200" cy="200" r="40" fill="none" stroke="#10b981" stroke-width="1" opacity="0.2" />
                <g stroke="#10b981" stroke-width="1" opacity="0.15">
                  <line v-for="i in 11" :key="'vg'+i" :x1="(i-1) * 40" y1="0" :x2="(i-1) * 40" y2="400" />
                  <line v-for="i in 11" :key="'hg'+i" x1="0" :y1="(i-1) * 40" x2="400" :y2="(i-1) * 40" />
                </g>
                <line x1="0" y1="200" x2="400" y2="200" stroke="#10b981" stroke-width="2" opacity="0.5" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="#10b981" stroke-width="2" opacity="0.5" />
                <text x="380" y="190" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">x</text>
                <text x="210" y="20" font-weight="bold" fill="#10b981" font-size="12" opacity="0.7">y</text>
                <g fill="#10b981" font-size="8" opacity="0.5" font-weight="bold">
                  <text x="360" y="215" text-anchor="middle">5</text>
                  <text x="280" y="215" text-anchor="middle">2</text>
                  <text x="120" y="215" text-anchor="middle">-2</text>
                  <text x="40" y="215" text-anchor="middle">-4</text>
                  <text x="185" y="40" dominant-baseline="middle">4</text>
                  <text x="185" y="120" dominant-baseline="middle">2</text>
                  <text x="180" y="280" dominant-baseline="middle">-2</text>
                </g>

                <!-- Clickable intersections -->
                <g v-for="xi in 11" :key="'cx'+xi">
                  <g v-for="yi in 11" :key="'cy'+yi">
                    <circle :cx="(xi-1)*40" :cy="(yi-1)*40" r="12" fill="transparent"
                      class="cursor-crosshair hover:fill-emerald-500/30 transition-colors"
                      @click="clickRadar(xi-6, 6-yi)" />
                  </g>
                </g>

                <!-- Target submarine marker -->
                <g v-if="!isFired">
                  <circle :cx="200 + currentLevel.targetX * 40" :cy="200 - currentLevel.targetY * 40" r="6" fill="#34d399" class="animate-ping" />
                  <circle :cx="200 + currentLevel.targetX * 40" :cy="200 - currentLevel.targetY * 40" r="3" fill="#ecfdf5" />
                </g>

                <!-- User shot marker -->
                <g v-if="userX !== null && userY !== null && isFired" class="animate-fadeIn pointer-events-none">
                  <circle :cx="200 + userX * 40" :cy="200 - userY * 40" r="20" fill="none" stroke="#ef4444" stroke-width="4" class="animate-pulse" />
                  <circle :cx="200 + userX * 40" :cy="200 - userY * 40" r="4" fill="#ef4444" />
                  <text v-if="isCorrect" :x="200 + userX * 40" :y="200 - userY * 40 - 25" text-anchor="middle" font-weight="900" font-size="16" fill="#f87171" class="animate-fadeIn" style="animation-delay: 0.5s">BOEM!</text>
                </g>

                <!-- Radar sweeper -->
                <g class="animate-spin-radar origin-center">
                  <line x1="200" y1="200" x2="200" y2="0" stroke="#34d399" stroke-width="2" opacity="0.8" />
                  <path d="M 200 200 L 200 0 A 200 200 0 0 1 250 6 Z" fill="rgba(52, 211, 153, 0.2)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
:root { font-family: 'Inter', sans-serif; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
.animate-spin-radar { animation: spin 4s linear infinite; transform-origin: 200px 200px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>