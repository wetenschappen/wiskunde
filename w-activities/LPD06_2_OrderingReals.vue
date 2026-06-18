<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhListNumbers,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Ordenen van reële getallen'
  },
  instruction: {
    type: String,
    default: 'Plaats de reële getallen in de juiste volgorde van KLEIN (links) naar GROOT (rechts). Sleep de kaarten naar de juiste vakjes.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Plaats alle kaarten.' })
const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const numberPools = [
  // Level 1: fractions and decimals
  [
    { label: '1/2', value: 0.5 },
    { label: '0.4', value: 0.4 },
    { label: '-1.5', value: -1.5 },
    { label: '0', value: 0 },
    { label: '-3/4', value: -0.75 },
    { label: '1/4', value: 0.25 },
    { label: '-0.2', value: -0.2 },
    { label: '4/5', value: 0.8 }
  ],
  // Level 2: irrationals
  [
    { label: '\u03C0', value: 3.1415 },
    { label: '\u221A2', value: 1.414 },
    { label: '3', value: 3 },
    { label: '\u221A5', value: 2.236 },
    { label: '1', value: 1 },
    { label: '\u221A3', value: 1.732 },
    { label: '2', value: 2 },
    { label: '4', value: 4 }
  ],
  // Level 3: negative irrationals
  [
    { label: '-\u221A5', value: -2.236 },
    { label: '-2', value: -2 },
    { label: '-\u03C0', value: -3.1415 },
    { label: '-\u221A2', value: -1.414 },
    { label: '-3', value: -3 },
    { label: '-2.5', value: -2.5 },
    { label: '-\u221A3', value: -1.732 },
    { label: '-1', value: -1 }
  ]
]

function generateLevel() {
  const sizes = [5, 5, 5] // 5 numbers per level
  return numberPools.map((pool, i) => {
    const selected = shuffle(pool).slice(0, sizes[i])
    return {
      goalText: i === 0
        ? 'Opdracht 1: Orden breuken en decimale getallen.'
        : i === 1
          ? 'Opdracht 2: Let op de irrationale getallen (wortels en pi).'
          : 'Opdracht 3: De ultieme test met negatieve irrationale getallen!',
      numbers: selected.map((n, idx) => ({ ...n, id: `n${idx}` }))
    }
  })
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const availableNumbers = ref([])
const slots = ref([])

let draggedItem = null
let draggedFrom = null

function onDragStart(item, source) {
  if (isCorrect.value) return;
  draggedItem = item
  draggedFrom = source
}

function onDrop(targetIndex) {
  if (!draggedItem || isCorrect.value) return;

  const existing = slots.value[targetIndex]

  if (draggedFrom === 'available') {
    availableNumbers.value = availableNumbers.value.filter(n => n.id !== draggedItem.id)
    if (existing) availableNumbers.value.push(existing)
  } else {
    slots.value[draggedFrom] = existing
  }

  slots.value[targetIndex] = draggedItem
  draggedItem = null
  draggedFrom = null
  isChecked.value = false

  // Auto-validate when all slots are filled
  if (slots.value.every(s => s !== null)) {
    autoValidate()
  }
}

function autoValidate() {
  const slotValues = slots.value.map(s => s.value)

  // Check if sorted correctly
  let isSorted = true
  let errorIndex = -1
  for (let i = 0; i < slotValues.length - 1; i++) {
    if (slotValues[i] > slotValues[i+1]) {
      isSorted = false
      errorIndex = i
      break
    }
  }

  if (isSorted) {
    isCorrect.value = true
    isChecked.value = true
    feedback.value = {
      type: 'success',
      text: 'Prima!! Je hebt een meesterlijk inzicht in de grootte van reële getallen.'
    }
  } else {
    attemptCount.value++
    isChecked.value = true

    const val1 = slots.value[errorIndex].label
    const val2 = slots.value[errorIndex+1].label

    if (attemptCount.value === 1) {
      if (slotValues[errorIndex] < 0 && slotValues[errorIndex+1] < 0) {
        feedback.value = {
          type: 'error',
          text: `Foutje: ${val1} is GROTER dan ${val2}. Bij negatieve getallen is het getal met de grootste absolute waarde (zonder min) juist het kleinst! (-5 is kleiner dan -2).`
        }
      } else {
        feedback.value = {
          type: 'error',
          text: `Foutje: ${val1} is stiekem groter dan ${val2}. Denk na over de decimale waarde van breuken en wortels!`
        }
      }
    } else if (attemptCount.value === 2) {
      feedback.value = {
        type: 'error',
        text: `Let op de volgorde bij ${val1} en ${val2}. Tip: zet alle getallen om naar een kommagetal (decimaal) en vergelijk ze dan.`
      }
    } else {
      const correctOrder = [...slots.value].sort((a, b) => a.value - b.value)
        .map(n => n.label).join(' < ')
      feedback.value = {
        type: 'error',
        text: `De juiste volgorde is: ${correctOrder}. Sleep de kaarten naar de juiste positie.`
      }
    }
  }
}

function returnToAvailable(index) {
  if (isCorrect.value) return;
  const item = slots.value[index]
  if (item) {
    slots.value[index] = null
    availableNumbers.value.push(item)
    isChecked.value = false
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Plaats alle kaarten.' };
  attemptCount.value = 0;

  if (currentLevelData.value) {
    const numList = shuffle([...currentLevelData.value.numbers])
    availableNumbers.value = numList
    slots.value = new Array(5).fill(null)
  }
}

watch(currentLevelData, (val) => {
  if (val) {
    const numList = shuffle([...val.numbers])
    availableNumbers.value = numList
    slots.value = new Array(5).fill(null)
  }
}, { immediate: true })

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
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen request failed:", e))
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

const handleFullscreenChange = () => {
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(e => {})
  }
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

            <div class="p-6 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <p class="text-sm font-medium text-slate-700 mb-4 uppercase tracking-wider text-center">Beschikbare getallen</p>
              <div class="flex flex-wrap gap-4 justify-center">
                <div v-for="num in availableNumbers" :key="num.id"
                     draggable="true"
                     @dragstart="onDragStart(num, 'available')"
                     class="flex items-center justify-center w-16 h-16 bg-white border-2 border-slate-300 rounded-xl shadow-sm text-xl font-bold text-slate-700 cursor-grab hover:border-math-blue active:cursor-grabbing transition-colors">
                  {{ num.label }}
                </div>
                <div v-if="availableNumbers.length === 0" class="text-sm text-slate-400 italic py-6">
                  Alle getallen zijn geplaatst.
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-center gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button @click="handleNext" v-if="isCorrect" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-4 px-4 text-center text-sm font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
                Plaats alle getallen in de juiste volgorde
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-x-auto">

              <div class="relative flex items-center min-w-max px-12 py-24">
                <!-- The Number line graphic -->
                <div class="absolute h-3 bg-slate-800 rounded-full left-0 right-0 top-1/2 -translate-y-1/2 z-0 shadow-sm"></div>
                <div class="absolute w-6 h-6 bg-slate-800 rounded-full -left-2 top-1/2 -translate-y-1/2 clip-triangle-left"></div>
                <div class="absolute w-6 h-6 bg-slate-800 rounded-full -right-2 top-1/2 -translate-y-1/2 clip-triangle-right"></div>

                <div class="absolute left-8 -top-8 text-slate-500 font-bold tracking-widest uppercase">Klein</div>
                <div class="absolute right-8 -top-8 text-slate-500 font-bold tracking-widest uppercase">Groot</div>

                <!-- The Drop Zones -->
                <div class="relative z-10 flex gap-12 px-12">
                  <div v-for="(slot, index) in slots" :key="index"
                       class="relative flex flex-col items-center">

                    <div class="w-2 h-8 bg-slate-800 mb-4 rounded-full z-10"></div>

                    <div @dragover.prevent
                         @drop="onDrop(index)"
                         class="w-20 h-20 rounded-xl flex items-center justify-center border-4 transition-all relative"
                         :class="slot ? (isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_15px_#10b981]' : 'border-math-blue bg-white shadow-md scale-110') : 'border-dashed border-slate-400 bg-slate-200/50'">

                      <div v-if="slot"
                           draggable="true"
                           @dragstart="onDragStart(slot, index)"
                           class="w-full h-full flex items-center justify-center text-2xl font-black text-slate-800 cursor-grab active:cursor-grabbing font-mono">
                        {{ slot.label }}
                      </div>

                      <button v-if="slot && !isCorrect" @click="returnToAvailable(index)" class="absolute -top-3 -right-3 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-red-200 hover:text-red-700 shadow-md border-2 border-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                        <PhX class="w-4 h-4" weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>

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

.clip-triangle-left { clip-path: polygon(100% 0, 0 50%, 100% 100%); }
.clip-triangle-right { clip-path: polygon(0 0, 100% 50%, 0 100%); }

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }


.ring-pulse-amber {
    animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3;
    z-index: 50;
}
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
