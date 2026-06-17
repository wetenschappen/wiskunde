<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPercent, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten: Terugrekenen' },
  instruction: {
    type: String,
    default: 'Terugrekenen is vaak moeilijk. We gebruiken het strokenmodel (Bar Model) om het visueel op te lossen.<br/><br/><strong>Opdracht:</strong> Los de som op door eerst de waarde van 1 blokje uit te rekenen, en daarna de originele 100% te berekenen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhPercent }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kijk naar de strook. Hoeveel blokjes stellen de nieuwe prijs voor?' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const newLevels = []
  // Level 1: 25% discount (4 blocks of 25%, 3 remaining)
  const blockPct1 = 25
  const blocksTotal1 = 100 / blockPct1 // 4
  const discountBlocks1 = 1
  const blocksRemaining1 = blocksTotal1 - discountBlocks1
  const pricePerBlock1 = [15, 20, 25, 30][Math.floor(Math.random() * 4)]
  const newPrice1 = blocksRemaining1 * pricePerBlock1
  const total1 = blocksTotal1 * pricePerBlock1
  newLevels.push({
    goalText: `Na ${discountBlocks1 * blockPct1}% korting kost een artikel nog €${newPrice1}. Wat was de beginprijs?`,
    discountPercent: discountBlocks1 * blockPct1,
    newPrice: newPrice1,
    ansBlockExact: pricePerBlock1,
    ansTotalExact: total1,
    blocksRemaining: blocksRemaining1,
    blocksTotal: blocksTotal1,
    hintBlock: `Kijk naar de blauwe blokjes. ${blocksRemaining1} blokjes samen zijn €${newPrice1}. Hoeveel is 1 blokje dan? (${newPrice1} ÷ ${blocksRemaining1})`,
    hintTotal: `1 blokje is €${pricePerBlock1}! De originele prijs (100%) bestaat uit ${blocksTotal1} blokjes. Wat is ${blocksTotal1} × ${pricePerBlock1}?`
  })

  // Level 2: 20% discount (5 blocks of 20%, 4 remaining)
  const blockPct2 = 20
  const blocksTotal2 = 100 / blockPct2 // 5
  const discountBlocks2 = 1
  const blocksRemaining2 = blocksTotal2 - discountBlocks2
  const pricePerBlock2 = [40, 50, 75, 100][Math.floor(Math.random() * 4)]
  const newPrice2 = blocksRemaining2 * pricePerBlock2
  const total2 = blocksTotal2 * pricePerBlock2
  newLevels.push({
    goalText: `Na ${discountBlocks2 * blockPct2}% korting kost een artikel nog €${newPrice2}. Wat was de beginprijs?`,
    discountPercent: discountBlocks2 * blockPct2,
    newPrice: newPrice2,
    ansBlockExact: pricePerBlock2,
    ansTotalExact: total2,
    blocksRemaining: blocksRemaining2,
    blocksTotal: blocksTotal2,
    hintBlock: `${blocksRemaining2} blauwe blokjes samen (${blocksRemaining2 * blockPct2}%) zijn €${newPrice2}. Hoeveel is 1 blokje (${blockPct2}%)? (${newPrice2} ÷ ${blocksRemaining2})`,
    hintTotal: `1 blokje is €${pricePerBlock2}. De originele prijs is ${blocksTotal2} blokjes (100%). Wat is ${blocksTotal2} × ${pricePerBlock2}?`
  })

  // Level 3: 40% discount (5 blocks of 20%, 3 remaining)
  const blockPct3 = 20
  const blocksTotal3 = 100 / blockPct3 // 5
  const discountBlocks3 = 2
  const blocksRemaining3 = blocksTotal3 - discountBlocks3
  const pricePerBlock3 = [8, 10, 12, 15][Math.floor(Math.random() * 4)]
  const newPrice3 = blocksRemaining3 * pricePerBlock3
  const total3 = blocksTotal3 * pricePerBlock3
  newLevels.push({
    goalText: `Na ${discountBlocks3 * blockPct3}% korting kost een artikel nog €${newPrice3}. Wat was de beginprijs?`,
    discountPercent: discountBlocks3 * blockPct3,
    newPrice: newPrice3,
    ansBlockExact: pricePerBlock3,
    ansTotalExact: total3,
    blocksRemaining: blocksRemaining3,
    blocksTotal: blocksTotal3,
    hintBlock: `De overgebleven ${blocksRemaining3 * blockPct3}% stellen we voor als ${blocksRemaining3} blauwe blokjes van ${blockPct3}%. Samen zijn ze €${newPrice3}. Hoeveel is 1 blokje?`,
    hintTotal: `1 blokje (${blockPct3}%) is €${pricePerBlock3}. De originele 100% is ${blocksTotal3} blokjes. Wat is ${blocksTotal3} × ${pricePerBlock3}?`
  })

  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const ansBlock = ref(null)
const ansTotal = ref(null)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Kijk naar de strook. Hoeveel blokjes stellen de nieuwe prijs voor?' };
    ansBlock.value = null;
    ansTotal.value = null;
    attemptCount.value = 0;
    generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  const data = currentLevelData.value;

  if (ansBlock.value === data.ansBlockExact && ansTotal.value === data.ansTotalExact) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Briljant! ${data.blocksRemaining} blokjes = €${data.newPrice}. Dus 1 blokje = €${data.ansBlockExact}. De totale 100% is dan ${data.blocksTotal} × ${data.ansBlockExact} = €${data.ansTotalExact}.`
    }
  } else {
    attemptCount.value++

    if (ansBlock.value !== data.ansBlockExact) {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: data.hintBlock }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `${data.blocksRemaining} blokjes = €${data.newPrice}. Deel €${data.newPrice} door ${data.blocksRemaining}.` }
        } else {
          feedback.value = { type: 'error', text: `1 blokje = €${data.ansBlockExact}. (€${data.newPrice} ÷ ${data.blocksRemaining} = ${data.ansBlockExact})` }
        }
    } else if (ansTotal.value !== data.ansTotalExact) {
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: data.hintTotal }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: `1 blokje is €${data.ansBlockExact}. De totale prijs (100%) is ${data.blocksTotal} blokjes. Wat is ${data.blocksTotal} × ${data.ansBlockExact}?` }
        } else {
          feedback.value = { type: 'error', text: `Originele prijs = ${data.blocksTotal} × ${data.ansBlockExact} = €${data.ansTotalExact}.` }
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
    generateLevel();
    currentInternalLevel.value = 0;
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
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-surface-200 bg-math-blue-bg rounded-xl shadow-inner flex flex-col gap-4">

               <p class="font-bold text-math-blue">{{ currentLevelData.goalText }}</p>

               <div class="flex flex-col gap-2">
                   <label class="text-sm font-bold text-math-blue">Stap 1: Waarde van 1 blokje</label>
                   <div class="flex items-center gap-2">
                       <span class="font-black text-xl text-slate-500">€</span>
                       <input type="number" v-model.number="ansBlock" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-xl p-2 border border-surface-200 rounded-lg focus:border-math-blue focus:ring-math-blue bg-white" />
                   </div>
               </div>

               <div class="flex flex-col gap-2 border-t border-surface-200 pt-4">
                   <label class="text-sm font-bold text-math-blue">Stap 2: Originele prijs (100%)</label>
                   <div class="flex items-center gap-2">
                       <span class="font-black text-2xl text-slate-500">€</span>
                       <input type="number" v-model.number="ansTotal" placeholder="?" :disabled="isCorrect"
                              class="w-full font-bold text-2xl p-4 border-2 border-math-blue rounded-lg focus:border-math-blue focus:ring-math-blue bg-white" />
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
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && (ansBlock === null || ansTotal === null)" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- The Bar Model -->
              <div class="w-full max-w-4xl relative">

                  <!-- Total Label -->
                  <div class="absolute -top-10 left-0 w-full flex flex-col items-center">
                      <div class="w-full h-4 border-t-2 border-x-2 border-slate-400 rounded-t-lg mb-1 relative">
                          <span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-50 px-2 font-black text-xl text-slate-700 whitespace-nowrap">
                              100% = Originele Prijs (?)
                          </span>
                      </div>
                  </div>

                  <!-- The Bar Blocks -->
                  <div class="flex h-24 border-4 border-slate-700 rounded-xl shadow-md bg-white relative overflow-hidden">

                      <!-- Remaining Blocks (e.g. 3 blocks = 75%) -->
                      <div v-for="i in currentLevelData.blocksRemaining" :key="'b'+i" class="border-r-2 border-slate-700 bg-blue-500 relative flex items-center justify-center"
                           :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                          <span class="font-bold text-white/80 text-lg">{{ 100 / currentLevelData.blocksTotal }}%</span>
                          <span v-if="ansBlock" class="absolute bottom-2 font-black text-white bg-slate-800/30 px-2 rounded-full animate-fadeIn">€{{ ansBlock }}</span>
                      </div>

                      <!-- Discount Blocks (e.g. 1 block = 25%) -->
                      <div v-for="i in (currentLevelData.blocksTotal - currentLevelData.blocksRemaining)" :key="'d'+i" class="border-r-2 border-slate-700 bg-red-100 relative flex items-center justify-center pattern-diagonal"
                           :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                          <span class="font-bold text-red-500 text-lg bg-white/80 px-2 rounded-lg">{{ 100 / currentLevelData.blocksTotal }}% (Korting)</span>
                          <span v-if="ansBlock" class="absolute bottom-2 font-black text-red-500 bg-white/80 px-2 rounded-full animate-fadeIn">€{{ ansBlock }}</span>
                      </div>

                  </div>

                  <!-- Price helper labels below -->
                  <div class="absolute -bottom-16 left-0 flex flex-col items-center" :style="{ width: `${(currentLevelData.blocksRemaining / currentLevelData.blocksTotal) * 100}%` }">
                      <div class="w-full h-4 border-b-4 border-x-4 border-math-blue rounded-b-xl mt-1 relative">
                          <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-50 px-4 py-1 rounded-full font-black text-2xl text-math-blue shadow-sm border border-surface-200 whitespace-nowrap">
                              Nieuw = €{{ currentLevelData.newPrice }}
                          </span>
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
.pattern-diagonal { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.2) 10px, rgba(239, 68, 68, 0.2) 20px); }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
