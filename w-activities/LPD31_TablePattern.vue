<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhPlus
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Patronen: De Groeiende Tafels' },
  instruction: { type: String, default: 'Een restaurant schuift tafels tegen elkaar. Ontdek het patroon!<br/><br/><strong>Opdracht:</strong> Voeg tafels toe en stel de formule op.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Voeg Tafel Toe" om het patroon te ontdekken.' })

const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let name, multTarget, addTarget, chairsFn, maxT, desc

  if (levelIndex === 0) {
    // Linear: S = mt + b. Vary m and b.
    // Types: tables in a row: 2t+2, 3t+1, 4t+0, 3t+2, etc.
    const configs = [
      { name: 'Tafels in een rij', multTarget: 2, addTarget: 2 },
      { name: 'Tafels met banken', multTarget: 3, addTarget: 1 },
      { name: 'Rechte opstelling', multTarget: 4, addTarget: 0 },
      { name: 'Alternatieve rij', multTarget: 3, addTarget: 2 },
    ]
    const cfg = configs[rng(0, configs.length - 1)]
    name = cfg.name
    multTarget = cfg.multTarget
    addTarget = cfg.addTarget
  } else if (levelIndex === 1) {
    const configs = [
      { name: 'Brede tafels', multTarget: 4, addTarget: 2 },
      { name: 'Lange banken', multTarget: 5, addTarget: 1 },
      { name: 'Zitplaatsen vierkant', multTarget: 4, addTarget: 0 },
      { name: 'Smalle tafels', multTarget: 3, addTarget: 3 },
    ]
    const cfg = configs[rng(0, configs.length - 1)]
    name = cfg.name
    multTarget = cfg.multTarget
    addTarget = cfg.addTarget
  } else {
    const configs = [
      { name: 'Grote zaalopstelling', multTarget: 6, addTarget: 2 },
      { name: 'Feesttafels', multTarget: 5, addTarget: 3 },
      { name: 'U-vormige tafels', multTarget: 7, addTarget: 1 },
      { name: 'Compacte opstelling', multTarget: 4, addTarget: 4 },
    ]
    const cfg = configs[rng(0, configs.length - 1)]
    name = cfg.name
    multTarget = cfg.multTarget
    addTarget = cfg.addTarget
  }

  chairsFn = (t) => multTarget * t + addTarget
  maxT = 5
  desc = 'S = ?t + ?'

  return { name, multTarget, addTarget, chairsFn, maxT, desc }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const tables = ref(1)
const multValue = ref(null)
const addValue = ref(null)

const chairs = computed(() => currentLevel.value.chairsFn(tables.value))

function addTable() { if (tables.value < currentLevel.value.maxT && !isCorrect.value) tables.value++ }

function getHintText(count) {
  const lvl = currentLevel.value
  if (count >= 3) {
    const chairs1 = lvl.chairsFn(1)
    const chairs2 = lvl.chairsFn(2)
    const diff = chairs2 - chairs1
    return { type: 'info', text: `Bij 1 tafel: ${chairs1} stoelen. Bij 2 tafels: ${chairs2} stoelen. De toename is ${diff} per tafel. S = ${diff}t + ?` }
  } else if (count >= 2) {
    const chairs1 = lvl.chairsFn(1)
    const chairs2 = lvl.chairsFn(2)
    return { type: 'info', text: `Kijk naar het aantal stoelen: ${lvl.chairsFn(1)} → ${lvl.chairsFn(2)} → ${lvl.chairsFn(3)}. Hoeveel komen er per tafel bij?` }
  } else {
    return { type: 'info', text: `Vergelijk ${lvl.chairsFn(1)} stoelen bij 1 tafel met ${lvl.chairsFn(2)} stoelen bij 2 tafels.` }
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false; isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op "Voeg Tafel Toe" om het patroon te ontdekken.' }
  tables.value = 1; multValue.value = null; addValue.value = null
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState() }
  else { emit('complete') }
}

function checkAnswer() {
  isChecked.value = true
  const lvl = currentLevel.value
  if (multValue.value === lvl.multTarget && addValue.value === lvl.addTarget) {
    if (tables.value > 1) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: `Perfect! ${lvl.name}: S = ${lvl.multTarget}t + ${lvl.addTarget === 0 ? '' : lvl.addTarget}. Dat is ${lvl.chairsFn(1)} stoel${lvl.chairsFn(1)>1?'en':''} bij 1 tafel, ${lvl.chairsFn(2)} bij 2, etc.` }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Formule klopt! Maar voeg eerst tafels toe om het patroon te zien.' }
    }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: `Kijk naar de toename: ${lvl.chairsFn(1)} → ${lvl.chairsFn(2)} → ${lvl.chairsFn(3)}... Hoeveel komen er bij per tafel?` }
    if (attemptCount.value >= 2) {
      feedback.value = getHintText(attemptCount.value)
    }
  }
}

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleFullscreenChange); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) })
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
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} — {{ currentLevel.name }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="p-4 mt-6 border border-teal-200 bg-teal-50 rounded-xl shadow-inner">
              <label class="block text-sm font-bold text-teal-900 mb-2">Formule (S = ? t + ?):</label>
              <div class="flex items-center justify-center gap-2 text-2xl font-black text-slate-700 mb-2">
                <span>S = </span>
                <input type="number" v-model.number="multValue" placeholder="?" :disabled="isCorrect" class="w-16 font-bold text-xl p-2 border-2 border-teal-400 rounded focus:border-teal-500 text-center bg-white" />
                <span> t + </span>
                <input type="number" v-model.number="addValue" placeholder="?" :disabled="isCorrect" class="w-16 font-bold text-xl p-2 border-2 border-teal-400 rounded focus:border-teal-500 text-center bg-white" />
              </div>
              <p class="text-xs text-teal-700 text-center mt-2 italic">(t = aantal tafels)</p>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]" :disabled="multValue === null || addValue === null">Controleer</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500">
                <span>Afronden</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex flex-col items-center">
              <div class="mb-6">
                <button @click="addTable" :disabled="isCorrect || tables >= currentLevel.maxT"
                  class="px-6 py-3 font-bold bg-slate-800 text-white rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50">
                  <PhPlus weight="bold" class="w-6 h-6" /> Voeg Tafel Toe
                </button>
              </div>
              <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-12 min-h-[280px] flex items-center justify-center w-full max-w-3xl transition-all">
                <div class="flex relative items-center justify-center transition-all duration-500" :style="{ width: `${tables * 100}px` }">
                  <div v-if="currentLevel.addTarget === 0" class="w-6 h-12 bg-slate-300 border-2 border-slate-400 rounded-l-full absolute -left-8 transition-all shadow-sm"></div>
                  <div v-for="t in tables" :key="'t'+t" class="relative w-[100px] h-[100px] bg-amber-700 border-x border-amber-900 flex shrink-0 animate-fadeIn shadow-inner">
                    <div class="w-12 h-6 bg-blue-300 border-2 border-blue-500 rounded-t-full absolute -top-8 left-1/2 -translate-x-1/2 shadow-sm"></div>
                    <div class="w-12 h-6 bg-blue-300 border-2 border-blue-500 rounded-b-full absolute -bottom-8 left-1/2 -translate-x-1/2 shadow-sm"></div>
                  </div>
                  <div v-if="currentLevel.addTarget === 0" class="w-6 h-12 bg-slate-300 border-2 border-slate-400 rounded-r-full absolute -right-8 transition-all shadow-sm"></div>
                </div>
              </div>
              <div class="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-8">
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tafels (t)</span>
                  <span class="font-black text-2xl text-amber-700">{{ tables }}</span>
                </div>
                <div class="w-px bg-slate-200"></div>
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stoelen (S)</span>
                  <span class="font-black text-2xl text-blue-600" :key="chairs">{{ chairs }}</span>
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
@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>