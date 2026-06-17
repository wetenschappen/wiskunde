<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTriangle,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Gelijkvormigheidskenmerken'
  },
  instruction: {
    type: String,
    default: 'Bewijs dat deze driehoeken gelijkvormig zijn. Welke theorie rechtvaardigt dit? Sleep de juiste stempel naar de driehoeken.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  // Level 1: ZZZ — pick random scale factor and base sides
  const zzzScale = randInt(2, 4)
  const zzzS1 = randInt(2, 5)
  const zzzS2 = randInt(zzzS1 + 1, zzzS1 + 3)
  const zzzS3 = randInt(zzzS2 + 1, zzzS2 + 3)
  // Level 2: ZHZ
  const zhzScale = randInt(2, 3)
  const zhzS1 = randInt(2, 5)
  const zhzS2 = randInt(3, 6)
  const zhzAngle = [30, 45, 50, 60][randInt(0, 3)]
  // Level 3: HH
  const hhA1 = [30, 40, 50, 60][randInt(0, 3)]
  const hhA2 = [50, 60, 70, 80].filter(a => a !== hhA1 && (180 - hhA1 - a) > 0)[0]
  const hhA1b = hhA1
  const hhA2b = 180 - hhA1 - hhA2

  return [
    {
      goalText: 'Opdracht 1: Sleep het juiste kenmerk naar het testgebied.',
      targetType: 'ZZZ',
      t1: { sides: [zzzS1, zzzS2, zzzS3], angles: ['?', '?', '?'] },
      t2: { sides: [zzzS1 * zzzScale, zzzS2 * zzzScale, zzzS3 * zzzScale], angles: ['?', '?', '?'] },
      success: 'Juist! Omdat alle zijden evenredig zijn (x' + zzzScale + '), is dit ZZZ.',
      hints: { vague: 'Kijk naar de gegevens. We weten NIETS over de hoeken, alleen over de drie zijden!', specific: 'Zijn alle drie de zijden evenredig? Vergelijk de verhoudingen.', direct: 'De zijden zijn allemaal x' + zzzScale + ' vergroot. Dat past bij ZZZ (Zijde-Zijde-Zijde).' }
    },
    {
      goalText: 'Opdracht 2: Een hoek is gegeven. Welk kenmerk is toepasbaar?',
      targetType: 'ZHZ',
      t1: { sides: [zhzS1, '?', zhzS2], angles: ['?', zhzAngle, '?'] },
      t2: { sides: [zhzS1 * zhzScale, '?', zhzS2 * zhzScale], angles: ['?', zhzAngle, '?'] },
      success: 'Perfect! De ingesloten hoek (' + zhzAngle + '°) is gelijk, en de aanliggende zijden zijn evenredig (x' + zhzScale + '). Dit is ZHZ.',
      hints: { vague: 'Er zijn twee paar zijden gegeven (evenredig) én hun ingesloten hoek is gelijk.', specific: 'De hoek tussen de twee bekende zijden is gelijk. Dat duidt op ZHZ (Zijde-Hoek-Zijde).', direct: 'ZHZ: twee paren evenredige zijden met dezelfde ingesloten hoek.' }
    },
    {
      goalText: 'Opdracht 3: Wat als we amper zijden kennen?',
      targetType: 'HH',
      t1: { sides: ['?', '?', '?'], angles: [hhA1, hhA2, '?'] },
      t2: { sides: ['?', '?', '?'], angles: [hhA1b, '?', hhA2b] },
      success: 'Helemaal goed! Omdat twee hoeken al overeenkomen (de 3e volgt vanzelf want de som is 180°), weten we genoeg. Dit is HH.',
      hints: { vague: 'Denk aan de som van de hoeken in een driehoek (180°). Als er twee gelijk zijn, is de derde dat ook.', specific: 'Er zijn geen zijden gegeven, alleen hoeken. Welk kenmerk gebruikt ALLEEN hoeken?', direct: 'HH (Hoek-Hoek): als twee hoeken gelijk zijn, is de derde dat ook (180° - som).' }
    }
  ]
}

const scenarios = ref(generateLevel())
const currentLevelData = computed(() => scenarios.value[currentInternalLevel.value])

// Drag and drop state
const stamps = ['ZZZ', 'ZHZ', 'HH']
let draggedStamp = null
const droppedStamp = ref(null)

function onDragStart(stamp) {
  if (isCorrect.value) return;
  draggedStamp = stamp;
}

function onDrop() {
  if (isCorrect.value) return;
  if (draggedStamp) {
    droppedStamp.value = draggedStamp;
    draggedStamp = null;

    // Auto-correct: check immediately
    if (droppedStamp.value === currentLevelData.value.targetType) {
      isCorrect.value = true
      feedback.value = {
        type: 'success',
        text: currentLevelData.value.success
      }
    } else {
      attemptCount.value++
      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: currentLevelData.value.hints.vague }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: currentLevelData.value.hints.specific }
      } else {
        feedback.value = { type: 'error', text: currentLevelData.value.hints.direct }
      }
    }
  }
}

function removeStamp() {
  if (isCorrect.value) return;
  droppedStamp.value = null;
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Sleep de juiste stempel.' };
  droppedStamp.value = null;
  attemptCount.value = 0;
  scenarios.value = generateLevel();
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

            <div class="mt-8 space-y-4">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Jouw Stempels</p>

              <div class="flex flex-col gap-4">
                <div v-for="stamp in stamps" :key="stamp"
                     draggable="true"
                     @dragstart="onDragStart(stamp)"
                     class="p-4 border-2 border-slate-300 bg-white rounded-xl text-center font-bold text-2xl font-mono text-slate-700 cursor-grab active:cursor-grabbing hover:border-math-blue hover:text-math-blue transition-colors shadow-sm"
                     :class="{ 'opacity-30 pointer-events-none': droppedStamp === stamp }">
                  {{ stamp }}
                </div>
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

              <button v-if="!isCorrect" disabled class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60">Auto-controle actief</button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <div class="flex flex-col md:flex-row items-center justify-center gap-16 w-full relative z-0">

                <div class="relative w-48 h-48 bg-white border-4 border-slate-300 rounded-lg flex items-center justify-center shadow-sm" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);">
                  <div class="absolute top-2 text-xs font-bold text-slate-400">
                    H1: {{ currentLevelData.t1.angles[0] }}°
                  </div>
                  <div class="absolute bottom-2 left-2 text-xs font-bold text-slate-400">
                    H2: {{ currentLevelData.t1.angles[1] }}°
                  </div>
                  <div class="absolute bottom-2 right-2 text-xs font-bold text-slate-400">
                    H3: {{ currentLevelData.t1.angles[2] }}°
                  </div>

                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t1.sides[0] }}
                  </div>
                  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t1.sides[1] }}
                  </div>
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t1.sides[2] }}
                  </div>
                </div>

                <div class="text-3xl font-bold text-slate-300">~</div>

                <div class="relative w-64 h-64 bg-white border-4 border-slate-300 rounded-lg flex items-center justify-center shadow-sm" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);">
                  <div class="absolute top-4 text-xs font-bold text-slate-400">
                    H1: {{ currentLevelData.t2.angles[0] }}°
                  </div>
                  <div class="absolute bottom-4 left-4 text-xs font-bold text-slate-400">
                    H2: {{ currentLevelData.t2.angles[1] }}°
                  </div>
                  <div class="absolute bottom-4 right-4 text-xs font-bold text-slate-400">
                    H3: {{ currentLevelData.t2.angles[2] }}°
                  </div>

                  <div class="absolute left-8 top-1/2 -translate-y-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t2.sides[0] }}
                  </div>
                  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t2.sides[1] }}
                  </div>
                  <div class="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-bold text-math-blue">
                    Z: {{ currentLevelData.t2.sides[2] }}
                  </div>
                </div>

              </div>

              <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                 <div @dragover.prevent.stop
                      @drop.prevent.stop="onDrop"
                      class="pointer-events-auto w-48 h-32 border-4 border-dashed rounded-xl flex flex-col items-center justify-center bg-white/80 backdrop-blur transition-all shadow-md"
                      :class="droppedStamp ? (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-800') : 'border-surface-200 hover:bg-math-blue-bg'">

                   <p v-if="!droppedStamp" class="text-math-blue font-bold uppercase tracking-widest text-sm text-center">Sleep Stempel Hier</p>

                   <div v-else class="relative animate-fadeIn text-4xl font-mono font-black transform -rotate-12" :class="isCorrect ? 'text-emerald-600' : 'text-slate-800'">
                     {{ droppedStamp }}
                     <button v-if="!isCorrect" @click="removeStamp" class="absolute -top-6 -right-6 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-red-200 hover:text-red-700 shadow-md border-2 border-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                        <PhX class="w-4 h-4" weight="bold" />
                     </button>
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

.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }


.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
