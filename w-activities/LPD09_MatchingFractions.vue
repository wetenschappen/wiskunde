<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLink, PhArrowClockwise, PhCaretUp, PhCaretDown
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vormen Omzetten: De Slotmachine' },
  instruction: {
    type: String,
    default: 'Breuken, decimalen en procenten horen bij elkaar.<br/><br/><strong>Opdracht:</strong> Draai aan de wielen (pijltjes omhoog/omlaag) totdat elke rij horizontaal een perfecte match vormt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLink }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de pijltjes boven en onder de kolommen om ze te draaien.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  const pools = [
    {
      col1: [ { id: 'A', val: '1/2' }, { id: 'B', val: '1/4' }, { id: 'C', val: '3/4' } ],
      col2: [ { id: 'B', val: '0.25' }, { id: 'C', val: '0.75' }, { id: 'A', val: '0.50' } ],
      col3: [ { id: 'C', val: '75%' }, { id: 'A', val: '50%' }, { id: 'B', val: '25%' } ]
    },
    {
      col1: [ { id: 'A', val: '1/5' }, { id: 'B', val: '2/5' }, { id: 'C', val: '4/5' } ],
      col2: [ { id: 'C', val: '0.80' }, { id: 'A', val: '0.20' }, { id: 'B', val: '0.40' } ],
      col3: [ { id: 'B', val: '40%' }, { id: 'C', val: '80%' }, { id: 'A', val: '20%' } ]
    },
    {
      col1: [ { id: 'A', val: '1/3' }, { id: 'B', val: '2/3' }, { id: 'C', val: '1/8' } ],
      col2: [ { id: 'B', val: '0.67' }, { id: 'C', val: '0.125' }, { id: 'A', val: '0.33' } ],
      col3: [ { id: 'C', val: '12.5%' }, { id: 'A', val: '33.3%' }, { id: 'B', val: '66.7%' } ]
    },
    {
      col1: [ { id: 'A', val: '1/10' }, { id: 'B', val: '3/10' }, { id: 'C', val: '9/10' } ],
      col2: [ { id: 'C', val: '0.90' }, { id: 'A', val: '0.10' }, { id: 'B', val: '0.30' } ],
      col3: [ { id: 'B', val: '30%' }, { id: 'C', val: '90%' }, { id: 'A', val: '10%' } ]
    },
    {
      col1: [ { id: 'A', val: '1/2' }, { id: 'B', val: '3/5' }, { id: 'C', val: '1/20' } ],
      col2: [ { id: 'B', val: '0.60' }, { id: 'C', val: '0.05' }, { id: 'A', val: '0.50' } ],
      col3: [ { id: 'C', val: '5%' }, { id: 'A', val: '50%' }, { id: 'B', val: '60%' } ]
    },
    {
      col1: [ { id: 'A', val: '2/3' }, { id: 'B', val: '3/4' }, { id: 'C', val: '1/4' } ],
      col2: [ { id: 'C', val: '0.25' }, { id: 'A', val: '0.67' }, { id: 'B', val: '0.75' } ],
      col3: [ { id: 'B', val: '75%' }, { id: 'C', val: '25%' }, { id: 'A', val: '66.7%' } ]
    }
  ]

  const shuffled = [...pools].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 3)
  return picked.map((p, i) => ({
    goalText: i === 0 ? 'Opdracht 1: Bekende breuken' : i === 1 ? 'Opdracht 2: Vijfden' : 'Opdracht 3: Speciale breuken',
    col1: p.col1,
    col2Start: p.col2,
    col3Start: p.col3
  }))
}

const levels = ref(generateLevel())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Active Columns State
const col1 = ref([])
const col2 = ref([])
const col3 = ref([])

function shiftUp(colRef) {
    if (isCorrect.value) return;
    const first = colRef.value.shift()
    colRef.value.push(first)
    isChecked.value = false;
}

function shiftDown(colRef) {
    if (isCorrect.value) return;
    const last = colRef.value.pop()
    colRef.value.unshift(last)
    isChecked.value = false;
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de pijltjes boven en onder de kolommen om ze te draaien.' };
    attemptCount.value = 0;
    levels.value = generateLevel();

    const data = currentLevelData.value
    col1.value = data.col1.map(item => ({ ...item }))
    col2.value = data.col2Start.map(item => ({ ...item }))
    col3.value = data.col3Start.map(item => ({ ...item }))
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++

  let allMatch = true;
  let errorRow = -1;

  for (let i = 0; i < 3; i++) {
      if (col1.value[i].id !== col2.value[i].id || col1.value[i].id !== col3.value[i].id) {
          allMatch = false;
          errorRow = i;
          break;
      }
  }

  if (allMatch) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Jackpot! Je hebt alle representaties correct aan elkaar gekoppeld.'
    }
  } else {
    isCorrect.value = false

    const rowFrac = col1.value[errorRow].val
    const rowDec = col2.value[errorRow].val
    const rowPct = col3.value[errorRow].val

    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: 'Kijk naar de rij met breuk ' + rowFrac + '. De combinatie (' + rowDec + ', ' + rowPct + ') klopt niet. Draai aan de andere wielen.' }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: 'Denk aan de omzettingen. Bijvoorbeeld: 0.25 = 25% = 1/4. Welke wielen moet je verschuiven om de juiste combinatie te maken?' }
    } else {
      // Find which columns need adjustment
      const matchA = col1.value[0].id
      const matchB = col1.value[1].id
      const matchC = col1.value[2].id
      feedback.value = { type: 'error', text: 'De juiste stand is: rij 1 = ' + matchA + ', rij 2 = ' + matchB + ', rij 3 = ' + matchC + '. Verschuif de kolommen tot ze overeenkomen.' }
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-2">Tip</h4>
               <p class="text-sm text-slate-500">Als je een match hebt gevonden in een rij, controleer dan of de andere rijen ook kloppen!</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Trek aan hendel</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="bg-slate-800 p-8 rounded-3xl shadow-2xl border-b-8 border-slate-900 flex gap-6 relative">

                  <div class="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-32 bg-slate-700 rounded-l-lg border-y-4 border-slate-900"></div>

                  <div class="flex flex-col gap-2 relative">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Breuk</div>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2">
                          <div v-for="item in col1" :key="item.id" class="w-32 h-20 bg-slate-100 rounded-lg flex items-center justify-center font-black text-3xl text-slate-800 border-2 border-slate-300">
                              {{ item.val }}
                          </div>
                      </div>
                  </div>

                  <div class="flex flex-col gap-2 relative group">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Decimaal</div>
                      <button @click="shiftDown(col2)" :disabled="isCorrect" class="absolute -top-8 left-1/2 -translate-x-1/2 text-orange-400 hover:text-orange-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"><PhCaretUp weight="fill" class="w-8 h-8" /></button>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2 relative overflow-hidden">
                          <transition-group name="spin">
                              <div v-for="item in col2" :key="item.val" class="w-32 h-20 bg-orange-100 rounded-lg flex items-center justify-center font-black text-3xl text-orange-800 border-2 border-orange-300">
                                  {{ item.val }}
                              </div>
                          </transition-group>
                      </div>

                      <button @click="shiftUp(col2)" :disabled="isCorrect" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-orange-400 hover:text-orange-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"><PhCaretDown weight="fill" class="w-8 h-8" /></button>
                  </div>

                  <div class="flex flex-col gap-2 relative group">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Procent</div>
                      <button @click="shiftDown(col3)" :disabled="isCorrect" class="absolute -top-8 left-1/2 -translate-x-1/2 text-sky-400 hover:text-sky-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"><PhCaretUp weight="fill" class="w-8 h-8" /></button>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2 relative overflow-hidden">
                          <transition-group name="spin">
                              <div v-for="item in col3" :key="item.val" class="w-32 h-20 bg-sky-100 rounded-lg flex items-center justify-center font-black text-3xl text-sky-800 border-2 border-sky-300">
                                  {{ item.val }}
                              </div>
                          </transition-group>
                      </div>

                      <button @click="shiftUp(col3)" :disabled="isCorrect" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sky-400 hover:text-sky-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"><PhCaretDown weight="fill" class="w-8 h-8" /></button>
                  </div>

                  <div v-if="isCorrect" class="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center gap-[4.5rem] pt-8 px-6">
                      <div class="w-full h-2 bg-emerald-400/80 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse"></div>
                      <div class="w-full h-2 bg-emerald-400/80 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse"></div>
                      <div class="w-full h-2 bg-emerald-400/80 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse"></div>
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

.spin-move,
.spin-enter-active,
.spin-leave-active {
  transition: all 0.3s ease;
}
.spin-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.spin-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.spin-leave-active {
  position: absolute;
}
</style>
