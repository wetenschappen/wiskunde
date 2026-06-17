<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhEye,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Misleidende Grafieken Herstellen'
  },
  instruction: {
    type: String,
    default: 'Deze grafieken wekken een verkeerde indruk door een visuele truc. Gebruik de slider om de grafiek te "herstellen" naar een eerlijke, wiskundig correcte weergave!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhEye }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  const l1valA = 40 + Math.floor(Math.random() * 20)   // 40-59
  const l1valB = l1valA + Math.floor(Math.random() * 10) + 3 // 3-12 more than A
  const l1Max = Math.max(l1valA, l1valB) + 15

  const l2valA = 8 + Math.floor(Math.random() * 8)    // 8-15
  const l2valB = l2valA * 2 + Math.floor(Math.random() * 4) - 2  // roughly 2x A

  return [
    {
      goalText: 'Opdracht 1: De y-as afsnijding.',
      trickDesc: `Groep B lijkt veel groter dan Groep A! Herstel de startwaarde van de y-as.`,
      valA: l1valA, valB: l1valB,
      sliderMin: 0, sliderMax: l1valA - 5, sliderStep: 5,
      sliderLabel: 'Startwaarde y-as',
      targetVal: 0,
      initVal: l1valA - 10,
      yMax: l1Max,
      success: `Juist! Door de y-as bij 0 te laten beginnen, zie je dat het verschil (${l1valA} vs ${l1valB}) eigenlijk klein is.`
    },
    {
      goalText: 'Opdracht 2: Oppervlakte vs Hoogte.',
      trickDesc: `Merk B verkoopt 2x zoveel als Merk A (${l2valB} vs ${l2valA}). Maar de staaf van B ziet er 4x zo groot uit! Waarom?`,
      valA: l2valA, valB: l2valB,
      sliderMin: 1, sliderMax: 2, sliderStep: 0.1,
      sliderLabel: 'Breedte-factor Merk B',
      targetVal: 1,
      initVal: 2,
      success: 'Correct! Als de waarde 2x groter wordt, mag je alleen de HOOGTE 2x groter maken. Als je ook de breedte verdubbelt, wordt de oppervlakte 4x zo groot.'
    },
    {
      goalText: 'Opdracht 3: De Inverteerde Y-as.',
      trickDesc: 'Het aantal misdaden lijkt spectaculair te dalen... of toch niet? Bekijk de y-as heel goed!',
      valA: 100, valB: 200, valC: 300,
      sliderMin: -1, sliderMax: 1, sliderStep: 2,
      sliderLabel: 'Richting y-as (Flip)',
      targetVal: 1,
      initVal: -1,
      success: 'BAM! Door de y-as ondersteboven te zetten (hoog naar laag), leek een stijging op een daling. Een beruchte truc in de media!'
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const sliderVal = ref(0)

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: 'Beweeg de slider om de grafiek te herstellen.' };
  sliderVal.value = currentLevelData.value.initVal;
  attemptCount.value = 0;
}

// Auto-correct on slider change
watch(sliderVal, (newVal) => {
  if (isCorrect.value || !currentLevelData.value) return
  if (newVal === currentLevelData.value.targetVal) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevelData.value.success
    }
  }
})

function showHint() {
  if (isCorrect.value || !currentLevelData.value) return
  attemptCount.value++
  if (attemptCount.value === 1) {
    feedback.value = { type: 'error', text: 'Blijf schuiven tot de grafiek een volkomen neutrale en eerlijke weergave toont.' }
  } else if (attemptCount.value === 2) {
    feedback.value = { type: 'error', text: 'De truc is dat de visuele schaal niet klopt. Zoek de instelling die de grafiek niet langer misleidt.' }
  } else {
    feedback.value = { type: 'error', text: `De juiste waarde is ${currentLevelData.value.targetVal}.` }
  }
}

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
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close')
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

            <div class="text-center bg-orange-50 p-4 border border-orange-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-orange-800 mb-1">{{ currentLevelData.goalText }}</p>
              <p class="text-xs text-orange-700">{{ currentLevelData.trickDesc }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <label class="block mb-2 text-sm font-bold text-slate-700">{{ currentLevelData.sliderLabel }}</label>

              <input v-if="currentInternalLevel < 2" type="range" v-model.number="sliderVal" :min="currentLevelData.sliderMin" :max="currentLevelData.sliderMax" :step="currentLevelData.sliderStep" :disabled="isCorrect" class="w-full accent-orange-600">

              <div v-else class="flex gap-2">
                <button @click="sliderVal = -1" class="flex-1 py-2 rounded-lg font-bold border-2 transition-all" :class="sliderVal === -1 ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500'">Misleidend</button>
                <button @click="sliderVal = 1" class="flex-1 py-2 rounded-lg font-bold border-2 transition-all" :class="sliderVal === 1 ? 'border-orange-500 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-slate-500'">Eerlijk</button>
              </div>

              <button @click="showHint" :disabled="isCorrect" class="w-full py-2 text-sm font-bold text-slate-600 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">
                Hint nodig?
              </button>
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

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 font-bold text-slate-400 transition-all rounded-lg shadow-md bg-slate-200 text-center select-none">
                Sleep om te herstellen
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Level 1: Y-axis Truncation -->
              <div v-if="currentInternalLevel === 0" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-slate-500 text-sm py-4 transition-all">
                  <span>{{ currentLevelData.yMax }}</span>
                  <span>{{ Math.round(currentLevelData.yMax - (currentLevelData.yMax - sliderVal) * 0.33) }}</span>
                  <span>{{ Math.round(currentLevelData.yMax - (currentLevelData.yMax - sliderVal) * 0.66) }}</span>
                  <span :class="sliderVal > 0 ? 'text-red-500' : 'text-emerald-500'">{{ sliderVal }}</span>
                </div>
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <div class="relative w-full h-full flex justify-around items-end z-10 px-8">
                  <div class="flex flex-col items-center w-24 group">
                    <div class="w-full bg-blue-500 transition-all duration-300 shadow-sm" :style="{ height: `${((currentLevelData.valA - sliderVal) / (currentLevelData.yMax - sliderVal)) * 100}%` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600">Groep A ({{ currentLevelData.valA }})</span>
                  </div>
                  <div class="flex flex-col items-center w-24 group">
                    <div class="w-full bg-emerald-500 transition-all duration-300 shadow-sm" :style="{ height: `${((currentLevelData.valB - sliderVal) / (currentLevelData.yMax - sliderVal)) * 100}%` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600">Groep B ({{ currentLevelData.valB }})</span>
                  </div>
                </div>
              </div>

              <!-- Level 2: Area Distortion -->
              <div v-if="currentInternalLevel === 1" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-slate-500 text-sm py-4">
                  <span>{{ currentLevelData.valB }}</span>
                  <span>{{ Math.round(currentLevelData.valB * 0.75) }}</span>
                  <span>{{ Math.round(currentLevelData.valB * 0.5) }}</span>
                  <span>{{ Math.round(currentLevelData.valB * 0.25) }}</span>
                  <span>0</span>
                </div>
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <div class="relative w-full h-full flex justify-around items-end z-10 px-8 gap-8">
                  <div class="flex flex-col items-center justify-end h-full">
                    <div class="bg-blue-500 transition-all duration-300 shadow-sm w-[40px]" :style="{ height: `${(currentLevelData.valA / currentLevelData.valB) * 100}%` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600 whitespace-nowrap">Merk A ({{ currentLevelData.valA }})</span>
                  </div>
                  <div class="flex flex-col items-center justify-end h-full">
                    <div class="bg-emerald-500 transition-all duration-300 shadow-sm" :style="{ height: '100%', width: `${40 * sliderVal}px` }"></div>
                    <span class="absolute -bottom-8 font-bold text-slate-600 whitespace-nowrap">Merk B ({{ currentLevelData.valB }})</span>
                  </div>
                </div>
              </div>

              <!-- Level 3: Inverted Y-axis -->
              <div v-if="currentInternalLevel === 2" class="relative bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[300px] flex items-end px-12 pb-10 pt-10">
                <div class="absolute left-2 top-0 bottom-10 w-8 flex flex-col justify-between items-end font-bold text-sm py-4 transition-all" :class="sliderVal === -1 ? 'text-red-500' : 'text-slate-500'">
                  <span>{{ sliderVal === -1 ? '0' : '400' }}</span>
                  <span>{{ sliderVal === -1 ? '100' : '300' }}</span>
                  <span>{{ sliderVal === -1 ? '200' : '200' }}</span>
                  <span>{{ sliderVal === -1 ? '300' : '100' }}</span>
                  <span>{{ sliderVal === -1 ? '400' : '0' }}</span>
                </div>
                <div class="absolute inset-x-12 top-4 bottom-10 flex flex-col justify-between">
                  <div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-200"></div><div class="w-full h-px bg-slate-300"></div>
                </div>
                <svg class="absolute inset-x-12 top-4 bottom-10 w-full h-full overflow-visible z-10">
                   <polyline fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
                             class="transition-all duration-700"
                             :points="`
                               50,${sliderVal === 1 ? 100 - (100/400)*100 : (100/400)*100}%
                               150,${sliderVal === 1 ? 100 - (200/400)*100 : (200/400)*100}%
                               250,${sliderVal === 1 ? 100 - (300/400)*100 : (300/400)*100}%`" />
                   <circle cx="50" :cy="`${sliderVal === 1 ? 100 - (100/400)*100 : (100/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                   <circle cx="150" :cy="`${sliderVal === 1 ? 100 - (200/400)*100 : (200/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                   <circle cx="250" :cy="`${sliderVal === 1 ? 100 - (300/400)*100 : (300/400)*100}%`" r="6" fill="#0ea5e9" class="transition-all duration-700" />
                </svg>
                <div class="absolute -bottom-8 w-full flex justify-around px-8 font-bold text-slate-600">
                   <span>2023</span><span>2024</span><span>2025</span>
                </div>
              </div>

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