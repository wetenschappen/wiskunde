<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhBracketsCurly,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelsels Algebraïsch Oplossen (Substitutie)'
  },
  instruction: {
    type: String,
    default: 'Sleep de reeds afgezonderde onbekende (x of y) uit de ene vergelijking en laat deze los in de andere vergelijking om te substitueren.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBracketsCurly }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// Randomization helpers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateLevel(levelIndex) {
  const answer = randomInt(-2, 4)

  if (levelIndex === 0) {
    // y = m*x + b,   a*x + y = c
    const m = randomChoice([1, 2, 3, -1, -2])
    const b = randomInt(-3, 5)
    const a = randomInt(2, 4)
    const c = (a + m) * answer + b

    const mxPart = m === 1 ? 'x' : m === -1 ? '-x' : `${m}x`
    const rightStr = b >= 0 ? `${mxPart} + ${b}` : `${mxPart} - ${Math.abs(b)}`
    const subHtml = `<span class="text-blue-600">${a}x</span> + <span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(${rightStr})</span> = ${c}`

    return {
      goalText: `Opdracht ${levelIndex + 1}: Substitueer y.`,
      eq1Left: 'y', eq1Right: rightStr,
      eq2LeftPre: `${a}x + `, eq2Var: 'y', eq2LeftPost: '', eq2Right: `${c}`,
      dragTarget: rightStr,
      substitutedStringHTML: subHtml,
      questionVar: 'x', answer
    }
  }

  if (levelIndex === 1) {
    // x = y + b,   p*x + q*y = s
    const b = randomInt(-4, 4)
    const p = randomChoice([2, 3])
    const qOptions = [1, 3, 4, 5].filter(n => n !== p)
    const q = randomChoice(qOptions)
    const s = (p + q) * answer + p * b

    const rightStr = b >= 0 ? `y + ${b}` : `y - ${Math.abs(b)}`
    const subHtml = `${p}<span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(${rightStr})</span> + <span class="text-blue-600">${q}y</span> = ${s}`

    return {
      goalText: `Opdracht ${levelIndex + 1}: Substitueer x.`,
      eq1Left: 'x', eq1Right: rightStr,
      eq2LeftPre: `${p}`, eq2Var: 'x', eq2LeftPost: ` + ${q}y`, eq2Right: `${s}`,
      dragTarget: rightStr,
      substitutedStringHTML: subHtml,
      questionVar: 'y', answer
    }
  }

  // levelIndex === 2
  // y = -m*x + b,   x - y = s
  const m = randomChoice([1, 2])
  const b = randomInt(-3, 5)
  const s = (1 + m) * answer - b

  const mxPart = m === 1 ? '-x' : `-${m}x`
  const rightStr = b >= 0 ? `${mxPart} + ${b}` : `${mxPart} - ${Math.abs(b)}`
  const subHtml = `<span class="text-blue-600">x</span> - <span class="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">(${rightStr})</span> = ${s}`

  return {
    goalText: `Opdracht ${levelIndex + 1}: Let op de haakjes!`,
    eq1Left: 'y', eq1Right: rightStr,
    eq2LeftPre: 'x - ', eq2Var: 'y', eq2LeftPost: '', eq2Right: `${s}`,
    dragTarget: rightStr,
    substitutedStringHTML: subHtml,
    questionVar: 'x', answer
  }
}

const levels = ref([])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const substituted = ref(false)
const answeredVar = ref('')

let draggedItem = null

function onDragStart(item) {
  if (isCorrect.value) return;
  draggedItem = item
}

function onDrop() {
  if (draggedItem === currentLevelData.value.dragTarget) {
    substituted.value = true
    draggedItem = null
    feedback.value = { type: 'success', text: 'Mooi gesubstitueerd! Reken nu de resulterende vergelijking uit.' }
  } else {
    feedback.value = { type: 'error', text: 'Je sleept het verkeerde stuk. Sleep het expressiegedeelte (rechts) naar de variabele in de andere vergelijking.' }
    draggedItem = null
  }
}

function getHint() {
  if (attemptCount.value <= 1) {
    return 'Controleer je haakjes en of je de juiste bewerkingen hebt uitgevoerd.'
  } else if (attemptCount.value === 2) {
    return 'Werk stap voor stap: werk de haakjes uit, breng alle termen met de onbekende naar links en de constanten naar rechts.'
  }
  const d = currentLevelData.value
  return `De vergelijking na substitutie oplossen: ${d.questionVar} = ? (Het antwoord is een geheel getal.)`
}

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Voer de substitutie uit door te slepen.' };
  substituted.value = false;
  answeredVar.value = '';
  attemptCount.value = 0;
  if (levels.value.length === 0) {
    levels.value = [0, 1, 2].map(i => generateLevel(i))
  }
}

function checkAnswer() {
  isChecked.value = true;
  if (!substituted.value) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Je moet eerst de substitutie uitvoeren door te slepen.' }
    return;
  }

  if (parseFloat(answeredVar.value) === currentLevelData.value.answer) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Perfect! Als ${currentLevelData.value.questionVar} = ${currentLevelData.value.answer}, dan is je stelsel correct opgelost!`
    }
  } else {
    isCorrect.value = false
    attemptCount.value++
    feedback.value = { type: 'error', text: getHint() }
  }
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
    levels.value = [0, 1, 2].map(i => generateLevel(i))
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
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
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

            <div v-if="substituted" class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner animate-fadeIn">
              <p class="font-bold text-slate-800">Vergelijking met 1 onbekende:</p>
              <div class="bg-white p-4 border border-slate-200 rounded-lg font-mono text-lg shadow-sm text-center" v-html="currentLevelData.substitutedStringHTML">
              </div>

              <div class="mt-4">
                <label class="block mb-2 text-sm font-bold text-slate-700">Wat is de waarde voor {{ currentLevelData.questionVar }}?</label>
                <div class="flex items-center gap-4">
                  <span class="font-mono text-xl font-bold">{{ currentLevelData.questionVar }} = </span>
                  <input type="number" v-model="answeredVar"
                         @keyup.enter="checkAnswer"
                         class="flex-1 p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-math-blue transition-colors"
                         placeholder="?">
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
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !substituted || !answeredVar" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-8">

              <div class="text-4xl font-light text-slate-400 absolute left-[25%] top-1/2 -translate-y-1/2 scale-[5] opacity-30 pointer-events-none">
                {
              </div>

              <!-- Equation 1 -->
              <div class="bg-white p-6 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all duration-300" :class="{ 'opacity-40 grayscale': substituted }">
                <span class="text-slate-700">{{ currentLevelData.eq1Left }}</span>
                <span class="text-slate-400">=</span>
                <!-- Draggable part -->
                <div v-if="!substituted"
                     draggable="true"
                     @dragstart="onDragStart(currentLevelData.dragTarget)"
                     class="px-4 py-2 bg-emerald-50 text-emerald-600 border-2 border-emerald-400 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                  {{ currentLevelData.eq1Right }}
                </div>
                <div v-else class="px-4 py-2 text-emerald-600">
                  {{ currentLevelData.eq1Right }}
                </div>
              </div>

              <!-- Equation 2 -->
              <div class="bg-white p-6 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-4 text-3xl font-mono font-bold z-10 min-w-[300px] justify-center transition-all duration-300" :class="{ 'scale-110 shadow-md border-blue-300': substituted }">

                <span class="text-blue-600">{{ currentLevelData.eq2LeftPre }}</span>

                <!-- Drop zone -->
                <div v-if="!substituted"
                     @dragover.prevent
                     @drop="onDrop"
                     class="w-20 h-16 border-4 border-dashed rounded-xl flex items-center justify-center transition-colors"
                     :class="draggedItem ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'">
                  <span class="text-slate-400">{{ currentLevelData.eq2Var }}</span>
                </div>

                <div v-else class="px-4 py-2 bg-emerald-50 text-emerald-600 border-2 border-emerald-400 rounded-xl animate-fadeIn whitespace-nowrap">
                  ({{ currentLevelData.dragTarget }})
                </div>

                <span class="text-blue-600">{{ currentLevelData.eq2LeftPost }}</span>
                <span class="text-slate-400">=</span>
                <span class="text-slate-700">{{ currentLevelData.eq2Right }}</span>
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

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
