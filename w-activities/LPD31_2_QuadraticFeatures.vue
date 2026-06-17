<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMagnifyingGlassPlus,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Kenmerken Tweedegraadsfuncties'
  },
  instruction: {
    type: String,
    default: 'Plaats de wiskundige kenmerken fysiek op de juiste locatie in de grafiek met behulp van de schuifregelaars.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMagnifyingGlassPlus }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const feedback = ref({ type: 'info', text: '' })

const attemptCount = ref(0)
const interacted = ref(false)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

// Generate random level data with progressive difficulty
function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, p, q, roots

  if (levelIndex === 0) {
    // Level 1: a=1, symmetric about y-axis (p=0), integer q ≤ 0
    a = 1
    const qValues = [-1, -4, -9, -16, -25]
    q = qValues[rng(0, qValues.length - 1)]
    p = 0
    const rootVal = Math.sqrt(-q)
    roots = [-rootVal, rootVal]
  } else if (levelIndex === 1) {
    // Level 2: a in {-1, 1}, shifted vertex, varied roots
    a = Math.random() < 0.5 ? 1 : -1
    const pairs = [[-1, 3], [-3, 1], [0, 4], [-4, 0], [-2, 2], [-5, -1], [1, 5], [-3, 3]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    roots = pair
  } else {
    // Level 3: a in {-2, -1, -0.5, 0.5, 1, 2}, wider root ranges
    const aOptions = [-2, -1, -0.5, 0.5, 1, 2]
    a = aOptions[rng(0, aOptions.length - 1)]
    const pairs = [[-5, 1], [-3, 3], [-1, 5], [-6, 0], [-4, 2], [-2, 4], [-7, -1], [0, 6], [-4, 4], [-8, -2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    roots = pair
  }

  return {
    formula: formatQuadratic(a, p, q),
    a, p, q,
    targets: { axis: p, vertex: { x: p, y: q }, roots }
  }
}

function formatQuadratic(a, p, q) {
  const aStr = a === 1 ? '' : a === -1 ? '-' : a
  if (p === 0 && q === 0) return `f(x) = ${aStr}x²`
  const pPart = p === 0 ? '' : p < 0 ? `(x + ${Math.abs(p)})` : `(x - ${p})`
  const squared = pPart ? `${aStr}${pPart}²` : `${aStr}x²`
  if (q === 0) return `f(x) = ${squared}`
  const qSign = q > 0 ? '+ ' : '- '
  return `f(x) = ${squared} ${qSign}${Math.abs(q)}`
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// User placements
const userAxis = ref(0)
const userVertexX = ref(0)
const userVertexY = ref(0)
const userRoot1 = ref(-1)
const userRoot2 = ref(1)

const graphPath = computed(() => {
  const { a, p, q } = currentLevelData.value
  const points = [];
  for (let x = -10; x <= 10; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q;
    if (y < -12 || y > 12) continue;
    const svgX = x * 15;
    const svgY = -y * 15;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
})

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false;
  attemptCount.value = 0;
  interacted.value = false;
  feedback.value = { type: 'info', text: 'Plaats de symmetrieas, de top en de twee nulwaarden op de juiste coördinaten.' };

  // Randomize initial positions slightly away from target to force interaction
  userAxis.value = -4;
  userVertexX.value = 4;
  userVertexY.value = 4;
  userRoot1.value = -4;
  userRoot2.value = 4;
}

function getHintText() {
  if (attemptCount.value >= 5) {
    const t = currentLevelData.value.targets
    return { type: 'info', text: `Tip: symmetrieas x = ${t.axis}, top (${t.vertex.x}, ${t.vertex.y}), nulwaarden x = ${t.roots[0]} en x = ${t.roots[1]}. Plaats de schuifregelaars op deze waarden.` }
  } else if (attemptCount.value >= 3) {
    const t = currentLevelData.value.targets
    return { type: 'info', text: `De symmetrieas is x = ${t.axis}. De top heeft dezelfde x-coordinaat. De nulwaarden zijn de x-waarden waar y=0.` }
  } else if (attemptCount.value >= 1) {
    return { type: 'info', text: 'Kijk naar de formule. De symmetrieas is de x-waarde van de top (x = p). De nulwaarden zijn waar de parabool de x-as snijdt.' }
  }
  return { type: 'info', text: 'Plaats de symmetrieas, de top en de twee nulwaarden op de juiste coördinaten.' }
}

function onSliderChanged() {
  if (isCorrect.value) return
  if (!interacted.value) interacted.value = true
  attemptCount.value++

  // Auto-correct check: all sliders at target?
  const t = currentLevelData.value.targets
  const axisCorrect = userAxis.value === t.axis
  const vertexCorrect = userVertexX.value === t.vertex.x && userVertexY.value === t.vertex.y
  const userRoots = [userRoot1.value, userRoot2.value].sort((a,b) => a-b)
  const targetRoots = [...t.roots].sort((a,b) => a-b)
  const rootsCorrect = userRoots[0] === targetRoots[0] && userRoots[1] === targetRoots[1]

  if (axisCorrect && vertexCorrect && rootsCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Uitstekend! Je hebt alle kenmerken fysiek correct geplaatst op de grafiek.'
    }
  } else {
    feedback.value = getHintText()
  }
}

const debounceTimer = ref(null)
watch([userAxis, userVertexX, userVertexY, userRoot1, userRoot2], () => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(onSliderChanged, 400)
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-indigo-50 p-4 border border-indigo-200 rounded-xl shadow-sm mb-6">
              <p class="text-sm font-bold text-indigo-800 mb-1">Actieve Functie:</p>
              <p class="font-mono text-xl font-black text-indigo-600">{{ currentLevelData.formula }}</p>
            </div>

            <div class="space-y-6">

              <!-- Symmetrieas -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <label class="font-bold text-slate-700">Symmetrieas: x = {{ userAxis }}</label>
                </div>
                <input type="range" v-model.number="userAxis" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
              </div>

              <!-- Top -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                  <label class="font-bold text-slate-700">Top (Vertex): ({{ userVertexX }}, {{ userVertexY }})</label>
                </div>
                <div class="space-y-3">
                  <div>
                    <span class="text-xs text-slate-500">X-coördinaat</span>
                    <input type="range" v-model.number="userVertexX" min="-6" max="6" step="0.5" class="w-full accent-pink-500">
                  </div>
                  <div>
                    <span class="text-xs text-slate-500">Y-coördinaat</span>
                    <input type="range" v-model.number="userVertexY" min="-6" max="6" step="0.5" class="w-full accent-pink-500">
                  </div>
                </div>
              </div>

              <!-- Nulwaarden -->
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <label class="font-bold text-slate-700">Nulwaarden op de x-as</label>
                </div>
                <div class="space-y-3">
                  <div>
                    <span class="text-xs text-slate-500">Nulwaarde 1: x = {{ userRoot1 }}</span>
                    <input type="range" v-model.number="userRoot1" min="-6" max="6" step="0.5" class="w-full accent-emerald-500">
                  </div>
                  <div>
                    <span class="text-xs text-slate-500">Nulwaarde 2: x = {{ userRoot2 }}</span>
                    <input type="range" v-model.number="userRoot2" min="-6" max="6" step="0.5" class="w-full accent-emerald-500">
                  </div>
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
                Plaats alles correct
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
              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*15" y1="-150" :x2="(i-11)*15" y2="150" />
                  <line v-for="i in 21" :key="'h'+i" x1="-150" :y1="(i-11)*15" x2="150" :y2="(i-11)*15" />
                </g>

                <!-- Axes -->
                <line x1="-150" y1="0" x2="150" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-150" x2="0" y2="150" stroke="#64748b" stroke-width="2" />

                <!-- The Parabola -->
                <path :d="graphPath" fill="none" stroke="#4f46e5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />

                <!-- Interactive Elements Placed by User -->

                <!-- Symmetrieas -->
                <line :x1="userAxis * 15" y1="-150" :x2="userAxis * 15" y2="150" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8,4" class="transition-all duration-150" />

                <!-- Nulwaarden (Roots) -->
                <circle :cx="userRoot1 * 15" cy="0" r="6" fill="#10b981" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />
                <circle :cx="userRoot2 * 15" cy="0" r="6" fill="#10b981" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />

                <!-- Top (Vertex) -->
                <circle :cx="userVertexX * 15" :cy="-userVertexY * 15" r="7" fill="#ec4899" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
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