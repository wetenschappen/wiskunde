<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise, PhPaintBrush
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vormen Omzetten: Het 100-Rooster' },
  instruction: {
    type: String,
    default: 'Breuken, kommagetallen en procenten zijn 3 talen voor hetzelfde ding.<br/><br/><strong>Opdracht:</strong> Kleur exact het gevraagde deel van het rooster in. Vul daarna het juiste kommagetal en procent in.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de blokjes om ze in te kleuren, of sleep om er meer tegelijk te kleuren.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  const fractionPool = [
    { fractionDisplay: '1/2', targetSquares: 50, targetDecimal: 0.5, targetPercent: 50,
      hintSquare: 'De helft van 100 is 50. Kleur de helft van het rooster.',
      hintDecimal: '50 honderdsten = 0.50 = 0.5.',
      hintPercent: '50 van de 100 = 50%.' },
    { fractionDisplay: '1/5', targetSquares: 20, targetDecimal: 0.2, targetPercent: 20,
      hintSquare: '100 gedeeld door 5 = 20. Kleur 20 vakjes.',
      hintDecimal: '20 honderdsten = 0.20 = 0.2.',
      hintPercent: '20 van de 100 = 20%.' },
    { fractionDisplay: '2/5', targetSquares: 40, targetDecimal: 0.4, targetPercent: 40,
      hintSquare: '1/5 = 20, dus 2/5 = 40 vakjes.',
      hintDecimal: '40 honderdsten = 0.40 = 0.4.',
      hintPercent: '40 van de 100 = 40%.' },
    { fractionDisplay: '3/5', targetSquares: 60, targetDecimal: 0.6, targetPercent: 60,
      hintSquare: '1/5 = 20, dus 3/5 = 60 vakjes.',
      hintDecimal: '60 honderdsten = 0.60 = 0.6.',
      hintPercent: '60 van de 100 = 60%.' },
    { fractionDisplay: '4/5', targetSquares: 80, targetDecimal: 0.8, targetPercent: 80,
      hintSquare: '1/5 = 20, dus 4/5 = 80 vakjes.',
      hintDecimal: '80 honderdsten = 0.80 = 0.8.',
      hintPercent: '80 van de 100 = 80%.' },
    { fractionDisplay: '1/10', targetSquares: 10, targetDecimal: 0.1, targetPercent: 10,
      hintSquare: 'Hoeveel keer past 10 in 100? Kleur 1 volledige rij of kolom.',
      hintDecimal: 'Één tiende = 0.1 (of 0.10).',
      hintPercent: '10 van de 100 = 10%.' },
    { fractionDisplay: '3/10', targetSquares: 30, targetDecimal: 0.3, targetPercent: 30,
      hintSquare: '1/10 = 10, dus 3/10 = 30 vakjes.',
      hintDecimal: '30 honderdsten = 0.30 = 0.3.',
      hintPercent: '30 van de 100 = 30%.' },
    { fractionDisplay: '7/10', targetSquares: 70, targetDecimal: 0.7, targetPercent: 70,
      hintSquare: '1/10 = 10, dus 7/10 = 70 vakjes.',
      hintDecimal: '70 honderdsten = 0.70 = 0.7.',
      hintPercent: '70 van de 100 = 70%.' },
    { fractionDisplay: '9/10', targetSquares: 90, targetDecimal: 0.9, targetPercent: 90,
      hintSquare: '1/10 = 10, dus 9/10 = 90 vakjes.',
      hintDecimal: '90 honderdsten = 0.90 = 0.9.',
      hintPercent: '90 van de 100 = 90%.' },
    { fractionDisplay: '3/4', targetSquares: 75, targetDecimal: 0.75, targetPercent: 75,
      hintSquare: '1/4 = 25, dus 3/4 = 75 vakjes.',
      hintDecimal: '75 honderdsten = 0.75.',
      hintPercent: '75 van de 100 = 75%.' }
  ]

  const shuffled = [...fractionPool].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 3)
  return picked.map((p, i) => ({
    goalText: 'Opdracht ' + (i + 1) + ': ' + p.fractionDisplay,
    fractionDisplay: p.fractionDisplay,
    targetSquares: p.targetSquares,
    targetDecimal: p.targetDecimal,
    targetPercent: p.targetPercent,
    hintSquare: p.hintSquare,
    hintDecimal: p.hintDecimal,
    hintPercent: p.hintPercent
  }))
}

const levels = ref(generateLevel())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const grid = ref(Array(100).fill(false))
const userDecimal = ref('')
const userPercent = ref(null)

const coloredCount = computed(() => grid.value.filter(b => b).length)

// Drag to color logic
let isDragging = false
let dragMode = true

function startDrag(index) {
    if(isCorrect.value) return;
    isDragging = true
    dragMode = !grid.value[index]
    grid.value[index] = dragMode
}
function onEnter(index) {
    if (isDragging && !isCorrect.value) {
        grid.value[index] = dragMode
    }
}
function endDrag() {
    isDragging = false
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de blokjes om ze in te kleuren, of sleep om er meer tegelijk te kleuren.' };
    grid.value = Array(100).fill(false);
    userDecimal.value = '';
    userPercent.value = null;
    attemptCount.value = 0;
    levels.value = generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++

  const decimalNum = parseFloat(userDecimal.value.toString().replace(',', '.'))
  const data = currentLevelData.value;

  if (coloredCount.value === data.targetSquares && decimalNum === data.targetDecimal && userPercent.value === data.targetPercent) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Prima! Briljant! ' + data.fractionDisplay + ' = ' + data.targetSquares + '/100 = ' + data.targetDecimal + ' = ' + data.targetPercent + '%.'
    }
  } else {
    isCorrect.value = false

    if (attemptCount.value === 1) {
      if (coloredCount.value !== data.targetSquares) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Het aantal gekleurde blokjes klopt niet. ' + data.hintSquare }
      } else if (decimalNum !== data.targetDecimal) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Het rooster klopt! Maar het kommagetal is fout. ' + data.hintDecimal }
      } else {
        feedback.value = { type: 'error', text: 'Niet helemaal... Het rooster en kommagetal kloppen! Maar het percentage is fout. ' + data.hintPercent }
      }
    } else if (attemptCount.value === 2) {
      if (coloredCount.value !== data.targetSquares) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Je hebt ' + coloredCount.value + ' blokjes gekleurd. Het moeten er ' + data.targetSquares + ' zijn (' + data.fractionDisplay + ' van 100).' }
      } else if (decimalNum !== data.targetDecimal) {
        feedback.value = { type: 'error', text: data.fractionDisplay + ' = ' + data.targetSquares + '/100. Hoe schrijf je ' + data.targetSquares + ' honderdsten als kommagetal?' }
      } else {
        feedback.value = { type: 'error', text: data.targetSquares + ' op 100 = ?% Procent betekent letterlijk "per honderd".' }
      }
    } else {
      if (coloredCount.value !== data.targetSquares) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Kleur exact ' + data.targetSquares + ' blokjes voor ' + data.fractionDisplay + '.' }
      } else if (decimalNum !== data.targetDecimal) {
        feedback.value = { type: 'error', text: 'Niet helemaal... Het juiste kommagetal is ' + data.targetDecimal + '.' }
      } else {
        feedback.value = { type: 'error', text: 'Niet helemaal... Het juiste percentage is ' + data.targetPercent + '%.' }
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
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('mouseup', endDrag)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('mouseup', endDrag)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mouseup', endDrag)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit(" @keydown.space.prevent="emit(" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-blue-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-blue-50 p-4 border border-blue-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-blue-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-blue-200 bg-blue-50 rounded-xl shadow-inner relative overflow-visible">
               <h4 class="font-bold text-slate-700 mb-3 border-b border-blue-200 pb-2">De Drievuldigheid</h4>

               <div class="space-y-4">
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Breuk</span>
                       <span class="font-black text-2xl text-blue-700 bg-white px-4 py-1 rounded-lg shadow-sm border border-blue-200">{{ currentLevelData.fractionDisplay }}</span>
                   </div>

                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Kommagetal</span>
                       <input type="text" v-model="userDecimal" placeholder="0..." :disabled="isCorrect"
                              class="w-24 font-bold text-lg p-2 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 text-center" />
                   </div>

                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-600">Procent</span>
                       <div class="flex items-center gap-1">
                           <input type="number" v-model.number="userPercent" placeholder="..." :disabled="isCorrect"
                                  class="w-20 font-bold text-lg p-2 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 text-center" />
                           <span class="font-black text-xl text-slate-500">%</span>
                       </div>
                   </div>
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
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer Alles</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="relative bg-white p-2 rounded-xl shadow-md border-2 border-slate-300">
                  <div class="grid grid-cols-10 grid-rows-10 gap-1"
                       @mouseleave="endDrag">
                      <div v-for="(block, index) in grid" :key="index"
                           @mousedown.prevent="startDrag(index)"
                           @mouseenter.prevent="onEnter(index)"
                           @touchstart.prevent="startDrag(index)"
                           @touchmove.prevent
                           class="w-8 h-8 sm:w-10 sm:h-10 border transition-colors cursor-crosshair rounded-lg"
                           :class="block ? (isCorrect ? 'bg-emerald-500 border-emerald-600 shadow-inner' : 'bg-blue-500 border-blue-600 shadow-inner') : 'bg-slate-100 border-slate-300 hover:bg-slate-200'">
                      </div>
                  </div>

                  <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 font-bold text-slate-600">
                      <PhPaintBrush weight="duotone" class="w-5 h-5 text-blue-500" />
                      <span>{{ coloredCount }} / 100 gekleurd</span>
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
