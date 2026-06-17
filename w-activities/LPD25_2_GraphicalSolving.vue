<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTarget,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Grafisch Oplossen van Stelsels'
  },
  instruction: {
    type: String,
    default: 'Beweeg de verticale scannerlijn naar de x-waarde waar f(x) = g(x). Schuif exact naar het snijpunt of geef aan dat er geen is!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTarget }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)

const levels = ref([])

function generateLevel() {
  const newLevels = []

  // Level 1: simple integer intersection
  let a1, b1, a2, b2, ix
  do {
    a1 = pickRandom([0.5, 1, 1.5, 2, -0.5, -1])
    b1 = pickRandom([-3, -2, -1, 0, 1, 2, 3])
    a2 = pickRandom([-2, -1.5, -1, -0.5, 0.5, 1, 1.5])
    b2 = pickRandom([-3, -2, -1, 0, 1, 2, 3])
    if (a1 !== a2) {
      ix = (b2 - b1) / (a1 - a2)
    }
  } while (a1 === a2 || !Number.isInteger(ix) || ix < -4 || ix > 4)
  newLevels.push(makeFunctionLevel(a1, b1, a2, b2, true, ix, 'Opdracht 1: Vind het exacte snijpunt op de x-as.'))

  // Level 2: intersection at non-integer or wider range
  do {
    a1 = pickRandom([0.5, 1, 2, -1, -2])
    b1 = pickRandom([-4, -3, -2, -1, 0, 1, 2, 3, 4])
    a2 = pickRandom([-2, -1.5, -1, -0.5, 0.5, 1.5, 2])
    b2 = pickRandom([-4, -3, -2, -1, 0, 1, 2, 3, 4])
    if (a1 !== a2) {
      ix = (b2 - b1) / (a1 - a2)
    }
  } while (a1 === a2 || !Number.isInteger(ix) || ix < -4 || ix > 4)
  newLevels.push(makeFunctionLevel(a1, b1, a2, b2, true, ix, 'Opdracht 2: Zoek het snijpunt van deze twee rechten.'))

  // Level 3: parallel lines (no intersection) — always
  const aPar = pickRandom([1, 1.5, 2, -1, -2])
  const b1Par = pickRandom([-3, -2, -1, 0, 1, 2, 3])
  let b2Par
  do { b2Par = pickRandom([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]) } while (b2Par === b1Par)
  newLevels.push(makeFunctionLevel(aPar, b1Par, aPar, b2Par, false, null, 'Opdracht 3: Valstrik! Zoek het snijpunt... als dat er is.'))

  levels.value = newLevels
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeFunctionLevel(a1, b1, a2, b2, hasIntersection, ix, goalText) {
  const fStr = formatFn(a1, b1, 'f')
  const gStr = formatFn(a2, b2, 'g')
  return {
    f_str: fStr,
    f: (x) => a1 * x + b1,
    g_str: gStr,
    g: (x) => a2 * x + b2,
    hasIntersection,
    intersectionX: ix,
    goalText
  }
}

function formatFn(a, b, label) {
  const aPart = a === 1 ? '' : a === -1 ? '-' : a
  const aStr = a === 0 ? '' : aPart + 'x'
  const bStr = b > 0 ? ' + ' + b : b < 0 ? ' - ' + Math.abs(b) : ''
  return label + '(x) = ' + aStr + bStr
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const scanX = ref(-4)
const userClaimsNoIntersection = ref(false)

const y1 = computed(() => currentLevelData.value.f(scanX.value))
const y2 = computed(() => currentLevelData.value.g(scanX.value))
const dist = computed(() => Math.abs(y1.value - y2.value))

function resetActivityState() {
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Gebruik de slider om de rode en blauwe stippen op elkaar te laten vallen.' };
  scanX.value = -4;
  userClaimsNoIntersection.value = false;
  attemptCount.value = 0;
}

function toggleNoIntersection() {
  if (isCorrect.value) return;
  userClaimsNoIntersection.value = !userClaimsNoIntersection.value;
  isChecked.value = false;
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;
  const target = currentLevelData.value;

  if (!target.hasIntersection) {
    if (userClaimsNoIntersection.value) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: 'Geweldig inzicht! De rechten hebben dezelfde richtingscoëfficiënt. Ze zijn evenwijdend, dus het stelsel is strijdig (geen oplossing).' }
    } else {
      isCorrect.value = false
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Kijk naar de richtingscoëfficiënten: ${currentLevelData.value.f_str} en ${currentLevelData.value.g_str}. De a-waarde is gelijk, dus de lijnen zijn evenwijdig. Ze snijden elkaar NOOIT. Geef aan: "Er is géén snijpunt".` }
      } else if (attemptCount.value >= 2) {
        feedback.value = { type: 'error', text: 'Je zoekt een snijpunt, maar kijk eens goed naar de richtingscoëfficiënt van beide functies. Zullen deze rechten elkaar ooit snijden?' }
      } else {
        feedback.value = { type: 'error', text: 'Je zoekt een snijpunt, maar kijk eens goed naar de richtingscoëfficiënt van beide functies. Zullen deze rechten elkaar ooit snijden?' }
      }
    }
    return;
  }

  if (userClaimsNoIntersection.value) {
    isCorrect.value = false
    if (attemptCount.value >= 3) {
      feedback.value = { type: 'error', text: 'De lijnen hebben verschillende richtingscoëfficiënten, dus ze snijden elkaar wél. Blijf de scanner verschuiven tot de stippen overlappen.' }
    } else {
      feedback.value = { type: 'error', text: 'Je zegt dat er geen snijpunt is, maar de lijnen lopen niet perfect evenwijdig! Blijf zoeken met je scanner.' }
    }
    return;
  }

  if (scanX.value === target.intersectionX) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: `Bingo! Het snijpunt ligt perfect bij x = ${target.intersectionX}. Daar is f(x) = g(x).`
    }
  } else {
    isCorrect.value = false

    if (dist.value < 1) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Bijna! Het juiste snijpunt is x = ${target.intersectionX}. Zet de scanner daarop.` }
      } else {
        feedback.value = { type: 'error', text: 'Oeh, heel warm! De stippen zijn bijna samen, maar nog net niet exact.' }
      }
    } else {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'error', text: `Het snijpunt is bij x = ${target.intersectionX}. Gebruik de scanner om daar te komen.` }
      } else {
        feedback.value = { type: 'error', text: `Niet juist. Bij x = ${scanX.value} is het verschil tussen de lijnen ${dist.value.toFixed(1)}. Je zoekt naar een verschil van 0.` }
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
    generateLevel()
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

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner">

              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm space-y-2">
                <p class="text-blue-600 font-bold">{{ currentLevelData.f_str }}</p>
                <p class="text-emerald-600 font-bold">{{ currentLevelData.g_str }}</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verschuif de scanner (x = {{ scanX }}):</label>
                <input type="range" v-model.number="scanX" min="-5" max="5" step="0.5" :disabled="userClaimsNoIntersection" class="w-full accent-orange-600">
                <div class="flex justify-between mt-1 text-xs text-slate-400">
                  <span>-5</span><span>0</span><span>5</span>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-200 text-center">
                 <button @click="toggleNoIntersection"
                         class="px-4 py-2 border-2 rounded-lg font-bold text-sm transition-all shadow-sm"
                         :class="userClaimsNoIntersection ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'">
                   Er is géén snijpunt (Strijdig)
                 </button>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Coordinate System SVG -->
              <svg width="450" height="450" viewBox="-6 -6 12 12" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="0.1">
                  <line v-for="i in 13" :key="'v'+i" :x1="i-7" y1="-6" :x2="i-7" y2="6" />
                  <line v-for="i in 13" :key="'h'+i" x1="-6" :y1="i-7" x2="6" :y2="i-7" />
                </g>

                <!-- Axes -->
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#64748b" stroke-width="0.2" />
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#64748b" stroke-width="0.2" />

                <!-- Graph of f(x) -->
                <line x1="-6" :y1="-currentLevelData.f(-6)" x2="6" :y2="-currentLevelData.f(6)" stroke="#2563eb" stroke-width="0.3" stroke-linecap="round" />

                <!-- Graph of g(x) -->
                <line x1="-6" :y1="-currentLevelData.g(-6)" x2="6" :y2="-currentLevelData.g(6)" stroke="#10b981" stroke-width="0.3" stroke-linecap="round" />

                <!-- Scanner Line -->
                <line v-if="!userClaimsNoIntersection" :x1="scanX" y1="-6" :x2="scanX" y2="6" stroke="#f97316" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-150" />

                <!-- Dot on f(x) -->
                <circle v-if="!userClaimsNoIntersection" :cx="scanX" :cy="-y1" r="0.2" fill="#2563eb" class="transition-all duration-150" />
                <!-- Dot on g(x) -->
                <circle v-if="!userClaimsNoIntersection" :cx="scanX" :cy="-y2" r="0.2" fill="#10b981" class="transition-all duration-150" />

                <!-- Visual Error Connector (Distance between dots) -->
                <line v-if="!userClaimsNoIntersection && !isCorrect" :x1="scanX" :y1="-y1" :x2="scanX" :y2="-y2" stroke="#ef4444" stroke-width="0.1" stroke-dasharray="0.2" class="transition-all duration-150" />

                <!-- Highlight intersection if correct -->
                <circle v-if="isCorrect && currentLevelData.hasIntersection" :cx="currentLevelData.intersectionX" :cy="-currentLevelData.f(currentLevelData.intersectionX)" r="0.4" fill="#f97316" class="animate-pulse" />

              </svg>

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
