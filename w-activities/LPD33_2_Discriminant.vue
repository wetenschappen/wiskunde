<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMathOperations,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Discriminant en Oplossingen'
  },
  instruction: {
    type: String,
    default: 'Verander a, b en c en let op de snijpunten met de x-as.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const feedback = ref({ type: 'info', text: '' })

const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel(levelIndex) {
  const targets = [
    {
      targetSnijpunten: 2,
      goalText: 'Opdracht: Maak een parabool met exact 2 snijpunten met de x-as. Welk teken heeft de discriminant (D)?',
      successText: 'Correct! Als de grafiek 2 nulwaarden heeft, is de discriminant altijd strikt positief (D > 0).'
    },
    {
      targetSnijpunten: 1,
      goalText: 'Opdracht: Zorg dat de parabool de x-as op exact 1 punt raakt. Wat is D nu?',
      successText: 'Super! Bij 1 raakpunt / nulwaarde is de discriminant altijd exact nul (D = 0).'
    },
    {
      targetSnijpunten: 0,
      goalText: 'Opdracht: Cre-eer een "zwevende" parabool zonder nulwaarden (raakt de x-as nergens).',
      successText: 'Briljant! Geen snijpunten betekent dat de discriminant altijd strikt negatief is (D < 0).'
    }
  ]
  return targets[levelIndex]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// User State
const valA = ref(1)
const valB = ref(0)
const valC = ref(0)

const discriminant = computed(() => {
  return (valB.value * valB.value) - (4 * valA.value * valC.value)
})

const graphPath = computed(() => {
  const points = [];
  for (let x = -10; x <= 10; x += 0.2) {
    let y = valA.value * x * x + valB.value * x + valC.value;
    if (y < -12 || y > 12) continue;
    const svgX = x * 20;
    const svgY = -y * 20;
    points.push(`${svgX},${svgY}`);
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : '';
})

const roots = computed(() => {
  const d = discriminant.value;
  if (valA.value === 0) return []; // Not a parabola
  if (d < 0) return [];
  if (d === 0) {
    return [ -valB.value / (2 * valA.value) ];
  }
  return [
    (-valB.value - Math.sqrt(d)) / (2 * valA.value),
    (-valB.value + Math.sqrt(d)) / (2 * valA.value)
  ];
})

function getHintText(count) {
  if (count >= 8) {
    const target = currentLevelData.value.targetSnijpunten
    if (target === 2) return { type: 'info', text: 'Probeer a=1, b=0, c=-4 voor D=16>0, dus 2 snijpunten.' }
    if (target === 1) return { type: 'info', text: 'Probeer a=1, b=4, c=4 voor D=0, dus 1 raakpunt.' }
    return { type: 'info', text: 'Probeer a=1, b=0, c=4 voor D=-16<0, dus 0 snijpunten.' }
  } else if (count >= 5) {
    const d = discriminant.value
    return { type: 'info', text: `D = ${d}. ${d > 0 ? 'D>0 betekent 2 snijpunten.' : d < 0 ? 'D<0 betekent 0 snijpunten.' : 'D=0 betekent 1 raakpunt.'} Pas a, b, c aan om het doel te bereiken.` }
  } else if (count >= 2) {
    return { type: 'info', text: 'Gebruik de schuifregelaars om a, b, c aan te passen. Kijk naar D = b\u00b2 - 4ac.' }
  }
  return { type: 'info', text: 'Verschuif de sliders a, b en c tot je het juiste aantal snijpunten hebt.' }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Verschuif de sliders a, b en c.' };

  // Start away from the goal
  if (currentLevelData.value.targetSnijpunten === 2) {
    valA.value = 1; valB.value = 0; valC.value = 2; // D < 0
  } else if (currentLevelData.value.targetSnijpunten === 1) {
    valA.value = 1; valB.value = 0; valC.value = -2; // D > 0
  } else {
    valA.value = 1; valB.value = 0; valC.value = 0; // D = 0
  }
}

function onSliderChanged() {
  if (isCorrect.value) return
  if (valA.value === 0) {
    feedback.value = { type: 'error', text: 'Als a=0 is het een rechte lijn, geen parabool! Zet a op een andere waarde.' }
    return
  }
  attemptCount.value++

  const target = currentLevelData.value.targetSnijpunten
  const currentSnijpunten = roots.value.length

  if (currentSnijpunten === target) {
    isCorrect.value = true
    const d = discriminant.value
    const dText = d > 0 ? 'D > 0' : d < 0 ? 'D < 0' : 'D = 0'
    feedback.value = {
      type: 'success',
      text: `${currentLevelData.value.successText} (Huidige waarden: a=${valA.value}, b=${valB.value}, c=${valC.value}, ${dText})`
    }
  } else {
    feedback.value = getHintText(attemptCount.value)
  }
}

// Debounced watch on sliders
const debounceTimer = ref(null)
watch([valA, valB, valC], () => {
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>

            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="space-y-6">

              <!-- Live Formula -->
              <div class="text-center bg-white p-4 border border-slate-200 rounded shadow-sm flex flex-col gap-2">
                <p class="font-mono text-xl font-black text-slate-700">
                  f(x) = {{ valA }}x\u00b2 {{ valB >= 0 ? '+ ' + valB : '- ' + Math.abs(valB) }}x {{ valC >= 0 ? '+ ' + valC : '- ' + Math.abs(valC) }}
                </p>
                <div class="bg-slate-100 p-2 rounded">
                  <p class="text-xs text-slate-500 mb-1">D = b\u00b2 - 4ac</p>
                  <p class="font-mono text-lg font-bold" :class="discriminant > 0 ? 'text-emerald-600' : (discriminant < 0 ? 'text-red-500' : 'text-blue-600')">
                    D = {{ discriminant }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter a: {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-teal-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter b: {{ valB }}</label>
                <input type="range" v-model.number="valB" min="-6" max="6" step="1" class="w-full accent-teal-600">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter c: {{ valC }}</label>
                <input type="range" v-model.number="valC" min="-6" max="6" step="1" class="w-full accent-teal-600">
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
                Pas a, b, c aan
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

                <!-- Axes -->
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-120" x2="0" y2="120" stroke="#64748b" stroke-width="2" />

                <!-- Graph -->
                <path v-if="valA !== 0" :d="graphPath" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-150" />
                <path v-else :d="graphPath" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8,4" class="transition-all duration-150" />

                <!-- Root Markers -->
                <circle v-for="(root, index) in roots" :key="index" :cx="root*20" cy="0" r="6" fill="#f59e0b" stroke="white" stroke-width="2" class="transition-all duration-300 shadow-sm" />

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
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