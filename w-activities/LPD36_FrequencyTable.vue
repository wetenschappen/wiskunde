<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTable, PhArrowClockwise, PhChartBar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Statistiek: Van Ruwe Data naar Grafiek' },
  instruction: {
    type: String,
    default: 'Een tabel met <strong>absolute frequenties</strong> is gewoon een chique woord voor "hoeveel keer komt het voor?". Dit is de eerste stap naar een staafdiagram.<br/><br/><strong>Opdracht:</strong> Tel de huisdieren in de lijst en vul de tabel (absolute frequentie) correct in. Teken daarna de grafiek.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Tel de huisdieren en vul de frequentietabel in.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const animalNames = ['Hond', 'Kat', 'Vis', 'Vogel']

function generateLevel(levelNum) {
  let dogCount, catCount, fishCount, birdCount
  if (levelNum === 0) {
    dogCount = r(2, 4); catCount = r(2, 5); fishCount = r(1, 3); birdCount = r(1, 3)
  } else if (levelNum === 1) {
    dogCount = r(4, 7); catCount = r(3, 6); fishCount = r(2, 5); birdCount = r(3, 5)
  } else {
    dogCount = r(6, 9); catCount = r(5, 8); fishCount = r(3, 6); birdCount = r(2, 5)
  }
  const rawData = shuffle([
    ...Array(dogCount).fill('Hond'),
    ...Array(catCount).fill('Kat'),
    ...Array(fishCount).fill('Vis'),
    ...Array(birdCount).fill('Vogel')
  ])
  return {
    name: `Niveau ${levelNum + 1}`,
    rawData,
    dogCount, catCount, fishCount, birdCount,
    instruction: levelNum === 0
      ? `Een tabel met <strong>absolute frequenties</strong> is gewoon een chique woord voor "hoeveel keer komt het voor?".<br/><br/><strong>Opdracht:</strong> Tel de huisdieren in de lijst en vul de tabel in.`
      : levelNum === 1
      ? `Er zijn meer huisdieren in deze lijst!<br/><br/><strong>Opdracht:</strong> Tel opnieuw de absolute frequenties. Gebruik een streepjes-telling om het overzichtelijk te houden.`
      : `Nu een nog grotere enquete!<br/><br/><strong>Opdracht:</strong> Tel alle huisdieren. Maak een turftabel op papier als dat helpt.`,
    successFeedback: levelNum === 0
      ? 'Uitstekend geteld! De tabel met absolute frequenties is klaar, en het staafdiagram wordt nu automatisch perfect voor jou getekend.'
      : levelNum === 1
      ? 'Prima! Met een grotere dataset wordt tellen lastiger, maar je hebt het helemaal correct. Een frequentietabel helpt om grote hoeveelheden data te ordenen.'
      : 'Geweldig! Zelfs met veel huisdieren heb je de frequenties correct geteld. Absolute frequenties zijn de bouwstenen van alle statistiek!'
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const rawData = computed(() => currentLevel.value ? currentLevel.value.rawData : [])

const yMax = computed(() => {
    if (!currentLevel.value) return 8
    return Math.max(currentLevel.value.dogCount, currentLevel.value.catCount, currentLevel.value.fishCount, currentLevel.value.birdCount) + 1
})

const freqDog = ref(null)
const freqCat = ref(null)
const freqFish = ref(null)
const freqBird = ref(null)

const showGraph = ref(false)

function getHint() {
  if (attemptCount.value === 1) return 'Maak een turftelling: zet een streepje voor elk dier in de lijst.'
  if (attemptCount.value === 2) return 'Tel systematisch. Kijk naar één diersoort tegelijk en streep af in de lijst.'
  return `Tip: Hond = ${currentLevel.value.dogCount}, Kat = ${currentLevel.value.catCount}, Vis = ${currentLevel.value.fishCount}, Vogel = ${currentLevel.value.birdCount}.`
}

function drawGraph() {
    isChecked.value = true
    const lv = currentLevel.value

    if (freqDog.value === lv.dogCount && freqCat.value === lv.catCount && freqFish.value === lv.fishCount && freqBird.value === lv.birdCount) {
        isCorrect.value = true
        attemptCount.value = 0
        showGraph.value = true
        feedback.value = { type: 'success', text: lv.successFeedback }
    } else {
        attemptCount.value++
        if (freqDog.value !== lv.dogCount) feedback.value = { type: 'error', text: `Tel de Honden nog eens. ${getHint()}`}
        else if (freqCat.value !== lv.catCount) feedback.value = { type: 'error', text: `Tel de Katten nog eens. ${getHint()}`}
        else if (freqFish.value !== lv.fishCount) feedback.value = { type: 'error', text: `Tel de Vissen nog eens. ${getHint()}`}
        else if (freqBird.value !== lv.birdCount) feedback.value = { type: 'error', text: `Tel de Vogels nog eens. ${getHint()}`}
        else feedback.value = { type: 'error', text: `Vul alle vakjes in de tabel in. ${getHint()}`}
    }
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    isCorrect.value = false
celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    feedback.value = { type: 'info', text: 'Tel de huisdieren en vul de frequentietabel in.' }
    freqDog.value = null
    freqCat.value = null
    freqFish.value = null
    freqBird.value = null
    showGraph.value = false
}

function nextLevel() {
    if (currentInternalLevel.value < totalInternalLevels.value - 1) {
        currentInternalLevel.value++
        resetActivityState()
    nextTick(() => mainArea.value?.focus())
    } else {
        emit('complete')
    }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            {{ currentLevel.name }} ({{ currentInternalLevel + 1 }}/{{ totalInternalLevels }})
          </span>
          <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
            <PhX class="w-6 h-6" />
          </button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentLevel.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-indigo-200 bg-indigo-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-indigo-900 mb-4">Tabel (Absolute Freq.):</h4>

               <div class="flex flex-col gap-3">
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Hond</span>
                       <input type="number" v-model.number="freqDog" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqDog === currentLevel.dogCount && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Kat</span>
                       <input type="number" v-model.number="freqCat" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqCat === currentLevel.catCount && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Vis</span>
                       <input type="number" v-model.number="freqFish" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqFish === currentLevel.fishCount && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
                   <div class="flex items-center justify-between">
                       <span class="font-bold text-slate-700 w-20">Vogel</span>
                       <input type="number" v-model.number="freqBird" :disabled="isCorrect" class="w-20 p-2 border-2 rounded focus:border-indigo-500 outline-none text-center font-bold" :class="freqBird === currentLevel.birdCount && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-indigo-300'" />
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="drawGraph" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] flex items-center justify-center gap-2">
                  <PhChartBar weight="bold" /> Teken Grafiek
              </button>
              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-4xl flex items-start justify-center gap-12">

                  <div class="w-64 bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200 shrink-0">
                      <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Ruwe Data (Enquete)</h4>
                      <div class="flex flex-wrap gap-2">
                          <span v-for="(item, idx) in rawData" :key="idx" class="bg-slate-100 px-3 py-1 rounded font-mono text-sm font-bold text-slate-600 border border-slate-300">{{ item }}</span>
                      </div>
                  </div>

                  <div class="flex-1 bg-white p-8 rounded-3xl shadow-xl border-4 border-slate-200 min-h-[400px] relative flex flex-col justify-end"
                       :class="!showGraph ? 'opacity-30 filter blur-sm pointer-events-none' : 'opacity-100'">

                      <div v-if="!showGraph" class="absolute inset-0 flex items-center justify-center z-20">
                          <span class="bg-white/80 backdrop-blur px-6 py-2 rounded-full font-bold text-slate-500 shadow-sm border border-slate-300">Grafiek wordt gegenereerd...</span>
                      </div>

                      <h4 class="absolute top-6 left-8 font-bold text-slate-500 uppercase tracking-widest text-xs">Staafdiagram (Huisdieren)</h4>

                      <div class="w-full h-64 border-b-4 border-l-4 border-slate-600 relative flex items-end justify-around px-4 pb-0">

                          <div class="absolute left-[-24px] top-0 bottom-0 w-6 flex flex-col justify-between items-end font-bold text-xs text-slate-400">
                              <template v-for="i in yMax" :key="'tick'+i">
                                  <span>{{ yMax - i + 1 }}</span>
</template>
                              <span>0</span>
                          </div>

                          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                              <div v-for="i in yMax" :key="i" class="w-full h-0 border-t border-slate-200"></div>
                              <div class="w-full h-0"></div>
                          </div>

                          <div class="w-16 bg-blue-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-blue-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               :style="{ height: showGraph ? `${(freqDog / yMax) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqDog }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Hond</span>
                          </div>

                          <div class="w-16 bg-fuchsia-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-fuchsia-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.2s"
                               :style="{ height: showGraph ? `${(freqCat / yMax) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqCat }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Kat</span>
                          </div>

                          <div class="w-16 bg-teal-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-teal-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.4s"
                               :style="{ height: showGraph ? `${(freqFish / yMax) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqFish }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Vis</span>
                          </div>

                          <div class="w-16 bg-amber-500 rounded-t-sm shadow-md border-x-2 border-t-2 border-amber-600 relative z-10 transition-all duration-1000 ease-out flex justify-center items-end pb-2"
                               style="transition-delay: 0.6s"
                               :style="{ height: showGraph ? `${(freqBird / yMax) * 100}%` : '0%' }">
                               <span v-if="showGraph" class="text-white font-black drop-shadow-md">{{ freqBird }}</span>
                               <span class="absolute -bottom-8 font-bold text-slate-600 text-sm">Vogel</span>
                          </div>

                      </div>

                  </div>

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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
