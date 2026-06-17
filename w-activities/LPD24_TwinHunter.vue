<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMagnifyingGlass, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Congruentie: Vind de Tweeling' },
  instruction: {
    type: String,
    default: 'Twee driehoeken zijn congruent (een perfecte tweeling) als ze voldoen aan ZZZ, ZHZ, HZH of ZZ90°.<br/><br/><strong>Opdracht:</strong> Kijk naar de Doel-driehoek. Welke van de 3 opties is de perfecte tweeling? Let op de valstrikken!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMagnifyingGlass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een driehoek en het bijbehorende kenmerk.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levelBlueprints = [
  // Level 1: ZHZ (Zijde-Hoek-Zijde)
  {
    goalText: 'Opdracht 1: Vind de tweeling via ZHZ',
    targetSVG: `
      <polygon points="20,130 180,130 96,65" fill="rgba(14, 165, 233, 0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />
      <path d="M 50 130 A 30 30 0 0 0 42 105" fill="none" stroke="#ef4444" stroke-width="3" />
      <text x="55" y="120" font-weight="bold" font-size="12" fill="#ef4444">40°</text>
      <text x="100" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">8</text>
      <text x="45" y="90" font-weight="bold" fill="#0284c7">5</text>
    `,
    optA: {
      svg: `
        <polygon points="20,130 180,130 96,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <path d="M 150 130 A 30 30 0 0 1 155 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="130" y="120" font-weight="bold" font-size="12" fill="#ef4444">40°</text>
        <text x="100" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">8</text>
        <text x="45" y="90" font-weight="bold" fill="#64748b">5</text>
      `,
      isCorrect: false, errorRule: 'ZZH', errorMsg: 'Kijk goed naar A! De hoek van 40° ligt NIET TUSSEN de zijden van 5 en 8. Dit is ZZH, en dat is géén geldig kenmerk!'
    },
    optB: {
      svg: `
        <polygon points="180,130 20,130 104,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <path d="M 150 130 A 30 30 0 0 1 158 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="130" y="120" font-weight="bold" font-size="12" fill="#ef4444">40°</text>
        <text x="100" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">8</text>
        <text x="145" y="90" font-weight="bold" fill="#64748b">5</text>
      `,
      isCorrect: true, correctRule: 'ZHZ', successMsg: 'Perfect! De hoek (40°) ligt ingesloten tussen de twee bekende zijden (5 en 8). Dit volgt het kenmerk ZHZ (Zijde-Hoek-Zijde).'
    },
    optC: {
      svg: `
        <polygon points="20,130 120,130 70,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <path d="M 50 130 A 30 30 0 0 0 42 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <path d="M 90 130 A 30 30 0 0 1 98 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="45" y="125" font-weight="bold" font-size="10" fill="#ef4444">40°</text>
        <text x="75" y="125" font-weight="bold" font-size="10" fill="#ef4444">40°</text>
        <text x="70" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">5</text>
      `,
      isCorrect: false, errorRule: 'HZH', errorMsg: 'Kijk goed naar C! Je hebt maar 1 zijde gegeven (5). De doeldriehoek eist zijden van 5 én 8. Dit is HZH, maar past niet bij het doel.'
    }
  },
  // Level 2: HZH (Hoek-Zijde-Hoek)
  {
    goalText: 'Opdracht 2: Vind de tweeling via HZH',
    targetSVG: `
      <polygon points="20,130 160,130 70,50" fill="rgba(14, 165, 233, 0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />
      <text x="90" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">10</text>
      <path d="M 45 130 A 25 25 0 0 0 35 105" fill="none" stroke="#ef4444" stroke-width="3" />
      <text x="45" y="120" font-weight="bold" font-size="12" fill="#ef4444">50°</text>
      <path d="M 135 130 A 25 25 0 0 1 145 110" fill="none" stroke="#ef4444" stroke-width="3" />
      <text x="125" y="120" font-weight="bold" font-size="12" fill="#ef4444">30°</text>
    `,
    optA: {
      svg: `
        <polygon points="20,130 160,130 70,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <text x="90" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">10</text>
        <path d="M 60 70 A 15 15 0 0 1 80 70" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="70" y="85" font-weight="bold" font-size="12" fill="#ef4444">50°</text>
        <path d="M 135 130 A 25 25 0 0 1 145 110" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="125" y="120" font-weight="bold" font-size="12" fill="#ef4444">30°</text>
      `,
      isCorrect: false, errorRule: 'ZHH', errorMsg: 'Bij Optie A is één van de hoeken (50°) verplaatst naar de top. Ze liggen niet meer aanlüitend aan de zijde van 10. Dit is ZHH (geen geldig basiskenmerk).'
    },
    optB: {
      svg: `
        <polygon points="20,130 120,130 50,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <text x="70" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">7</text>
        <path d="M 45 130 A 25 25 0 0 0 35 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="45" y="120" font-weight="bold" font-size="12" fill="#ef4444">50°</text>
        <path d="M 95 130 A 25 25 0 0 1 105 110" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="85" y="120" font-weight="bold" font-size="12" fill="#ef4444">30°</text>
      `,
      isCorrect: false, errorRule: 'HZH', errorMsg: 'Optie B gebruikt wél het HZH kenmerk, maar de basis is slechts 7. De doeldriehoek heeft een basis van 10.'
    },
    optC: {
      svg: `
        <polygon points="160,130 20,130 110,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <text x="90" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">10</text>
        <path d="M 45 130 A 25 25 0 0 0 55 110" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="50" y="120" font-weight="bold" font-size="12" fill="#ef4444">30°</text>
        <path d="M 135 130 A 25 25 0 0 1 125 105" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="135" y="120" font-weight="bold" font-size="12" fill="#ef4444">50°</text>
      `,
      isCorrect: true, correctRule: 'HZH', successMsg: 'Uitstekend! De zijde van 10 ligt perfect ingesloten tussen de twee hoeken van 30° en 50°. Zelfs al is hij gespiegeld, HZH bewijst congruentie.'
    }
  },
  // Level 3: ZZ90° (Rechthoekszijde-Schuine Zijde bij 90°)
  {
    goalText: 'Opdracht 3: Vind de tweeling via ZZ90°',
    targetSVG: `
      <polygon points="20,130 150,130 20,30" fill="rgba(14, 165, 233, 0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />
      <polyline points="20,110 40,110 40,130" fill="none" stroke="#ef4444" stroke-width="3" />
      <text x="85" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">4</text>
      <text x="100" y="75" font-weight="bold" fill="#0284c7">5</text>
    `,
    optA: {
      svg: `
        <polygon points="20,130 150,130 20,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <polyline points="20,110 40,110 40,130" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text>
        <text x="5" y="85" font-weight="bold" fill="#64748b">5</text>
      `,
      isCorrect: false, errorRule: 'ZHZ', errorMsg: 'Bij Optie A is de rechthoekszijde 5. Bij de doeldriehoek is de SCHUINE zijde (hypotenusa) 5. Dit is een compleet andere driehoek!'
    },
    optB: {
      svg: `
        <polygon points="150,130 20,130 150,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <polyline points="150,110 130,110 130,130" fill="none" stroke="#ef4444" stroke-width="3" />
        <text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text>
        <text x="60" y="75" font-weight="bold" fill="#64748b">5</text>
      `,
      isCorrect: true, correctRule: 'ZZ90°', successMsg: 'Geniaal! Een zijde, de schuine zijde én een rechte hoek. Dit is ZZ90°. (Dit is de enige uitzondering waar ZZH wél werkt).'
    },
    optC: {
      svg: `
        <polygon points="20,130 150,130 80,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" />
        <text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text>
        <text x="120" y="75" font-weight="bold" fill="#64748b">5</text>
        <path d="M 50 130 A 30 30 0 0 0 45 105" fill="none" stroke="#ef4444" stroke-width="3" />
      `,
      isCorrect: false, errorRule: 'ZZH', errorMsg: 'Optie C heeft geen rechte hoek (90°)! Hierdoor vervalt de ZZ90° garantie, en krijg je de onbetrouwbare ZZH valstrik.'
    }
  }
]

const levels = ref([])

function generateLevel() {
  // Clone blueprints — in a full implementation we could randomize the
  // numeric values (angle sizes, side lengths) displayed in the SVGs.
  // For now, the SVGs use the fixed pedagogically-crafted coordinates.
  levels.value = levelBlueprints.map(bp => ({
    ...bp,
    optA: { ...bp.optA },
    optB: { ...bp.optB },
    optC: { ...bp.optC }
  }))
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const selectedTriangle = ref(null)
const selectedRule = ref('')

function selectTriangle(opt) {
    if (isCorrect.value) return;
    selectedTriangle.value = opt;
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer een driehoek en het bijbehorende kenmerk.' };
    selectedTriangle.value = null;
    selectedRule.value = '';
    attemptCount.value = 0;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  if (selectedTriangle.value === null || selectedRule.value === '') {
      isCorrect.value = false;
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Kies eerst een van de drie opties (A, B of C) door erop te klikken, en selecteer daarna het kenmerk in het keuzemenu.' }
      } else {
        feedback.value = { type: 'error', text: 'Niet helemaal... Kies een driehoek én het overeenkomstige kenmerk uit de lijst.' }
      }
      return;
  }

  const optData = currentLevelData.value['opt' + selectedTriangle.value]

  if (optData.isCorrect && selectedRule.value === optData.correctRule) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: optData.successMsg }
  } else {
    isCorrect.value = false

    if (!optData.isCorrect) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: optData.errorMsg + ' Let op het juiste kenmerk: ' + optData.errorRule + '.' }
      } else {
        feedback.value = { type: 'error', text: optData.errorMsg }
      }
    } else if (optData.isCorrect && selectedRule.value !== optData.correctRule) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Je hebt de juiste tweeling (${selectedTriangle.value}) gekozen! Maar je gaf het foute kenmerk. Het juiste kenmerk is ${optData.correctRule}.` }
      } else {
        feedback.value = { type: 'error', text: `Je hebt de juiste tweeling (${selectedTriangle.value}) gekozen! Maar je gaf het foute kenmerk. Kijk goed wat er in het blauw gemarkeerd stond in het Doel.` }
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
// Success verification placeholder: Prima!
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
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

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-math-blue mb-2">Kenmerk:</label>
               <select v-model="selectedRule" :disabled="isCorrect" class="w-full p-4 border-2 border-surface-200 rounded-lg focus:ring-math-blue focus:border-math-blue font-bold text-slate-700 bg-white">
                   <option value="" disabled>Kies een kenmerk...</option>
                   <option value="ZZZ">ZZZ (Zijde-Zijde-Zijde)</option>
                   <option value="ZHZ">ZHZ (Zijde-Hoek-Zijde)</option>
                   <option value="HZH">HZH (Hoek-Zijde-Hoek)</option>
                   <option value="ZZ90°">ZZ90° (Rechthoekszijde-Schuine Zijde bij 90°)</option>
                   <option value="ZZH">ZZH (Zijde-Zijde-Hoek) - LET OP: geen geldig kenmerk!</option>
               </select>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (selectedTriangle === null || selectedRule === '')" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer Tweeling</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-8 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Target Area -->
              <div class="w-full max-w-sm bg-white p-6 rounded-xl shadow-md border-4 border-slate-300 mb-8 flex flex-col items-center">
                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Doel (Vind de tweeling hiervan)</h4>
                  <svg width="200" height="150" viewBox="0 0 200 150" v-html="currentLevelData.targetSVG"></svg>
              </div>

              <!-- Options Grid -->
              <div class="flex gap-6 w-full max-w-4xl justify-center">

                  <!-- Option A -->
                  <div @click="selectTriangle('A')"
                       class="bg-white p-4 rounded-xl shadow-sm border-4 cursor-pointer transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]"
                       :class="selectedTriangle === 'A' ? (isCorrect && currentLevelData.optA.isCorrect ? 'border-emerald-500 bg-emerald-100' : 'border-math-blue bg-math-blue-bg') : 'border-slate-200'" role="button" tabindex="0" @keydown.enter.prevent="selectTriangle(" @keydown.space.prevent="selectTriangle(" aria-label="Kies optie">
                      <h4 class="font-bold text-slate-400 mb-2">Optie A</h4>
                      <svg width="150" height="120" viewBox="0 0 200 150" v-html="currentLevelData.optA.svg"></svg>
                  </div>

                  <!-- Option B -->
                  <div @click="selectTriangle('B')"
                       class="bg-white p-4 rounded-xl shadow-sm border-4 cursor-pointer transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]"
                       :class="selectedTriangle === 'B' ? (isCorrect && currentLevelData.optB.isCorrect ? 'border-emerald-500 bg-emerald-100' : 'border-math-blue bg-math-blue-bg') : 'border-slate-200'" role="button" tabindex="0" @keydown.enter.prevent="selectTriangle(" @keydown.space.prevent="selectTriangle(" aria-label="Kies optie">
                      <h4 class="font-bold text-slate-400 mb-2">Optie B</h4>
                      <svg width="150" height="120" viewBox="0 0 200 150" v-html="currentLevelData.optB.svg"></svg>
                  </div>

                  <!-- Option C -->
                  <div @click="selectTriangle('C')"
                       class="bg-white p-4 rounded-xl shadow-sm border-4 cursor-pointer transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]"
                       :class="selectedTriangle === 'C' ? (isCorrect && currentLevelData.optC.isCorrect ? 'border-emerald-500 bg-emerald-100' : 'border-math-blue bg-math-blue-bg') : 'border-slate-200'" role="button" tabindex="0" @keydown.enter.prevent="selectTriangle(" @keydown.space.prevent="selectTriangle(" aria-label="Kies optie">
                      <h4 class="font-bold text-slate-400 mb-2">Optie C</h4>
                      <svg width="150" height="120" viewBox="0 0 200 150" v-html="currentLevelData.optC.svg"></svg>
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
