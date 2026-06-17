<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhChartLineUp,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Grafisch Oplossen: Tweedegraadsongelijkheden'
  },
  instruction: {
    type: String,
    default: 'Construeer het juiste oplossingsinterval voor de gegeven ongelijkheid. Pas de grenzen aan en geef aan of de grenzen erbij horen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhChartLineUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })

const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let formulaLabel, inequality, a, p, q, targetType, targetRoots, targetIncluded

  if (levelIndex === 0) {
    // Level 1: simple
    a = 1; p = 0
    const qValues = [-1, -4, -9, -16]
    q = qValues[rng(0, qValues.length - 1)]
    const rootVal = Math.sqrt(-q)
    targetRoots = [-rootVal, rootVal].sort((a,b) => a-b)
    // Alternate between < and >, between inclusive/exclusive
    targetType = Math.random() < 0.5 ? 'tussen' : 'buiten'
    targetIncluded = Math.random() < 0.4
    if (targetType === 'tussen') {
      inequality = targetIncluded ? `f(x) \u2264 0` : `f(x) < 0`
    } else {
      inequality = targetIncluded ? `f(x) \u2265 0` : `f(x) > 0`
    }
  } else if (levelIndex === 1) {
    // Level 2: a can be -1 or 1, shifted
    a = Math.random() < 0.5 ? 1 : -1
    const pairs = [[-1, 3], [0, 4], [-3, 1], [-4, 0], [-2, 2], [-5, -1]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    targetRoots = pair.sort((a,b) => a-b)
    targetType = Math.random() < 0.5 ? 'tussen' : 'buiten'
    targetIncluded = Math.random() < 0.5
    if (targetType === 'tussen') {
      inequality = targetIncluded ? `f(x) \u2264 0` : `f(x) < 0`
    } else {
      inequality = targetIncluded ? `f(x) \u2265 0` : `f(x) > 0`
    }
  } else {
    // Level 3: wider variety
    const aOptions = [-2, -1, -0.5, 0.5, 1, 2]
    a = aOptions[rng(0, aOptions.length - 1)]
    const pairs = [[-5, 1], [-3, 3], [-1, 5], [-6, 0], [-4, 2], [-2, 4], [-7, -1], [0, 6]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    targetRoots = pair.sort((a,b) => a-b)
    targetType = Math.random() < 0.5 ? 'tussen' : 'buiten'
    targetIncluded = Math.random() < 0.5
    if (targetType === 'tussen') {
      inequality = targetIncluded ? `f(x) \u2264 0` : `f(x) < 0`
    } else {
      inequality = targetIncluded ? `f(x) \u2265 0` : `f(x) > 0`
    }
  }

  formulaLabel = formatQuadratic(a, p, q)

  return { formula: formulaLabel, inequality, a, p, q, targetType, targetRoots, targetIncluded }
}

function formatQuadratic(a, p, q) {
  const aStr = a === 1 ? '' : a === -1 ? '-' : a
  if (p === 0) {
    const qStr = q === 0 ? '' : (q < 0 ? ` - ${Math.abs(q)}` : ` + ${q}`)
    return `f(x) = ${aStr}x²${qStr}`
  }
  const pPart = p < 0 ? `(x + ${Math.abs(p)})` : `(x - ${p})`
  const qStr = q === 0 ? '' : (q < 0 ? ` - ${Math.abs(q)}` : ` + ${q}`)
  return `f(x) = ${aStr}${pPart}²${qStr}`
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// User State for Interval
const userType = ref('tussen') // 'tussen' of 'buiten'
const userRoot1 = ref(-1)
const userRoot2 = ref(1)
const userIncluded = ref(true)

const sortedUserRoots = computed(() => {
  return [userRoot1.value, userRoot2.value].sort((a,b) => a-b)
})

const graphPath = computed(() => {
  const { a, p, q } = currentLevelData.value
  const points = [];
  for (let x = -6; x <= 6; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q;
    if (y < -8 || y > 8) continue;
    const svgX = x * 20;
    const svgY = -y * 20;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
})

function getHintText(count) {
  if (count >= 5) {
    const t = currentLevelData.value
    return { type: 'info', text: `Oplossing: ${t.targetType === 'tussen' ? 'tussen' : 'buiten'} [${t.targetRoots[0]}, ${t.targetRoots[1]}]${t.targetIncluded ? ' (inbegrepen)' : ' (niet inbegrepen)'}. Pas de schuifregelaars aan.` }
  } else if (count >= 3) {
    const t = currentLevelData.value
    return { type: 'info', text: `De nulwaarden zijn x = ${t.targetRoots[0]} en x = ${t.targetRoots[1]}. Bepaal of de grafiek ${t.targetType === 'tussen' ? 'tussen' : 'buiten'} deze waarden aan de ongelijkheid voldoet.` }
  } else if (count >= 1) {
    return { type: 'info', text: 'Zoek de nulwaarden (snijpunten met de x-as). Kijk naar het teken van de ongelijkheid om te bepalen of de oplossing tussen of buiten de nulwaarden ligt.' }
  }
  return { type: 'info', text: 'Stel het juiste interval op de x-as in.' }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false;
celebrationDone.value = false
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Stel het juiste interval op de x-as in.' };

  userType.value = 'tussen';
  userRoot1.value = -1;
  userRoot2.value = 1;
  userIncluded.value = true;
}

function onInteraction() {
  if (isCorrect.value) return
  attemptCount.value++

  const target = currentLevelData.value
  const rootsCorrect = sortedUserRoots.value[0] === target.targetRoots[0] && sortedUserRoots.value[1] === target.targetRoots[1]
  const typeCorrect = userType.value === target.targetType
  const includedCorrect = userIncluded.value === target.targetIncluded

  if (rootsCorrect && typeCorrect && includedCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Fantastisch! Je hebt het oplossingsgebied perfect visueel afgebakend.'
    }
  } else {
    feedback.value = getHintText(attemptCount.value)
  }
}

// Watch all user interaction values
watch([userType, userRoot1, userRoot2, userIncluded], () => {
  onInteraction()
})

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
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
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6">
              <p class="text-sm font-bold text-orange-800 mb-1">Los op:</p>
              <p class="font-mono text-2xl font-black text-orange-600">{{ currentLevelData.inequality }}</p>
              <p class="text-xs text-orange-700 mt-2 opacity-80">(met {{ currentLevelData.formula }})</p>
            </div>

            <div class="space-y-6">

              <!-- Interval Type -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Waar ligt de oplossing?</label>
                <div class="flex gap-2">
                  <button @click="userType = 'tussen'"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all"
                          :class="userType === 'tussen' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Tussen grenzen
                  </button>
                  <button @click="userType = 'buiten'"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all"
                          :class="userType === 'buiten' ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Buiten grenzen
                  </button>
                </div>
              </div>

              <!-- Boundaries -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Grenzen instellen (Nulwaarden)</label>
                <div class="space-y-4">
                  <div>
                    <span class="text-xs font-bold text-slate-500">Grens 1 (x) = {{ sortedUserRoots[0] }}</span>
                    <input type="range" v-model.number="userRoot1" min="-5" max="5" step="0.5" class="w-full accent-blue-500">
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-500">Grens 2 (x) = {{ sortedUserRoots[1] }}</span>
                    <input type="range" v-model.number="userRoot2" min="-5" max="5" step="0.5" class="w-full accent-blue-500">
                  </div>
                </div>
              </div>

              <!-- Included/Excluded -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Zijn de grenzen inbegrepen?</label>
                <div class="flex gap-2">
                  <button @click="userIncluded = true"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Ja (\u2264, \u2265)
                  </button>
                  <button @click="userIncluded = false"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm"
                          :class="!userIncluded ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Nee (<, >)
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
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

              <button v-if="!isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60" disabled>
                Pas de instellingen aan
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
              <svg width="400" height="400" viewBox="-120 -120 240 240" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 13" :key="'v'+i" :x1="(i-7)*20" y1="-120" :x2="(i-7)*20" y2="120" />
                  <line v-for="i in 13" :key="'h'+i" x1="-120" :y1="(i-7)*20" x2="120" :y2="(i-7)*20" />
                </g>

                <!-- User Selected Interval Visualization -->
                <g v-if="userType === 'tussen'">
                  <rect :x="sortedUserRoots[0]*20" y="-120" :width="(sortedUserRoots[1] - sortedUserRoots[0])*20" height="240" fill="#f97316" opacity="0.15" class="transition-all duration-300" />
                </g>
                <g v-else>
                  <rect x="-120" y="-120" :width="120 + sortedUserRoots[0]*20" height="240" fill="#f97316" opacity="0.15" class="transition-all duration-300" />
                  <rect :x="sortedUserRoots[1]*20" y="-120" :width="120 - sortedUserRoots[1]*20" height="240" fill="#f97316" opacity="0.15" class="transition-all duration-300" />
                </g>

                <!-- Axes -->
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-120" x2="0" y2="120" stroke="#64748b" stroke-width="2" />

                <!-- Graph -->
                <path :d="graphPath" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-500" />

                <!-- Boundary Markers -->
                <circle :cx="sortedUserRoots[0]*20" cy="0" r="6" :fill="userIncluded ? '#f97316' : 'white'" :stroke="userIncluded ? 'none' : '#f97316'" stroke-width="3" class="transition-all duration-300 shadow-sm" />
                <circle :cx="sortedUserRoots[1]*20" cy="0" r="6" :fill="userIncluded ? '#f97316' : 'white'" :stroke="userIncluded ? 'none' : '#f97316'" stroke-width="3" class="transition-all duration-300 shadow-sm" />

                <text :x="sortedUserRoots[0]*20 - 4" y="-12" font-size="12" font-weight="bold" fill="#f97316">{{ sortedUserRoots[0] }}</text>
                <text :x="sortedUserRoots[1]*20 - 4" y="-12" font-size="12" font-weight="bold" fill="#f97316">{{ sortedUserRoots[1] }}</text>

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
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
