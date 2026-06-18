<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRuler, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetinstrumenten: De Digitale Meetlat' },
  instruction: {
    type: String,
    default: 'Sleep de meetlat over het lijnstuk. Meet de lengte exact in millimeter (mm) en vul dit in.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRuler }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Tip: Je kan de meetlat slepen met je muis.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const colorPairs = [
  { color: 'bg-red-500', dotColor: 'bg-red-600', label: 'RODE' },
  { color: 'bg-blue-500', dotColor: 'bg-blue-600', label: 'BLAUWE' },
  { color: 'bg-emerald-500', dotColor: 'bg-emerald-600', label: 'GROENE' },
  { color: 'bg-purple-500', dotColor: 'bg-purple-600', label: 'PAARSE' },
  { color: 'bg-orange-500', dotColor: 'bg-orange-600', label: 'ORANJE' }
]

function generateLevel(index) {
  let targetLength, colorPair, yOffset, xOffset, hint
  switch (index) {
    case 0:
      targetLength = Math.floor(Math.random() * 31) + 20 // 20-50mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [100, 150, 200, 250][Math.floor(Math.random() * 4)]
      xOffset = Math.floor(Math.random() * 41) + 40 // 40-80
      hint = `Elk klein streepje op de meetlat is 1 mm. De getallen zijn in cm (1 cm = 10 mm).`
      return { goalText: `Opdracht 1: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hint }
    case 1:
      targetLength = Math.floor(Math.random() * 31) + 60 // 60-90mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [100, 200, 300][Math.floor(Math.random() * 3)]
      xOffset = Math.floor(Math.random() * 61) + 80 // 80-140
      hint = `Vergeet niet het nulpunt (0) exact gelijk te leggen met het linker begin van de lijn!`
      return { goalText: `Opdracht 2: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hint }
    case 2:
      targetLength = Math.floor(Math.random() * 41) + 100 // 100-140mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [80, 120, 180, 220][Math.floor(Math.random() * 4)]
      xOffset = Math.floor(Math.random() * 41) + 60 // 60-100
      hint = `Dit is een langere lijn. Controleer zorgvuldig de millimeters voorbij de laatste cm.`
      return { goalText: `Opdracht 3: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hint }
    default:
      return { goalText: 'Opdracht 1: Meet de lengte.', targetLength: 42, color: 'bg-red-500', dotColor: 'bg-red-600', yOffset: 150, xOffset: 60, hint: '1 cm = 10 mm.' }
  }
}

const levels = ref([
  generateLevel(0),
  generateLevel(1),
  generateLevel(2)
])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userLength = ref(null)

// Dragging logic for the ruler
const rulerX = ref(100)
const rulerY = ref(200)
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0

function startDrag(e) {
    isDragging = true
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0)
    dragOffsetX = clientX - rulerX.value
    dragOffsetY = clientY - rulerY.value
}

function onDrag(e) {
    if (!isDragging) return
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0)
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0)
    rulerX.value = Math.max(10, Math.min(800, clientX - dragOffsetX))
    rulerY.value = Math.max(10, Math.min(600, clientY - dragOffsetY))
}

function endDrag() {
    isDragging = false
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Tip: Je kan de meetlat slepen met je muis.' };
    userLength.value = null;
    rulerX.value = 100;
    rulerY.value = 350;
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ];
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;
  const target = currentLevelData.value.targetLength;

  if (userLength.value === target) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Prima! gemeten! Je hebt het nulpunt goed gepositioneerd.'
    }
  } else {
    isCorrect.value = false

    const hintIdx = Math.min(attemptCount.value - 1, 2)
    const commonErrorHint = userLength.value !== null && userLength.value >= target + 3 && userLength.value <= target + 5
        ? 'Let goed op! Je bent beginnen meten vanaf de fysieke RAND van de meetlat. Je moet beginnen bij het lange streepje van de 0.'
        : (userLength.value !== null && userLength.value * 10 === target
            ? 'Dat getal lijkt in centimeter (cm) te staan. We vragen het specifiek in millimeter (mm).'
            : null)

    const hints = [
      commonErrorHint || `Niet helemaal juist. ${currentLevelData.value.hint}`,
      commonErrorHint || `De lijn is ongeveer ${target} mm lang. Kijk nog eens goed naar de streepjes.`,
      `De juiste lengte is ${target} mm.`
    ]

    feedback.value = { type: 'error', text: hints[hintIdx] }
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800"
     @mouseup="endDrag" @mouseleave="endDrag" @touchend="endDrag">
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
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

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-2">Lengte lijnstuk:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userLength" placeholder="..." :disabled="isCorrect"
                          class="w-24 font-bold text-lg p-2 border border-slate-300 rounded-lg focus:border-math-blue focus:ring-math-blue text-center" />
                   <span class="text-slate-600 font-bold">mm</span>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect && userLength === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-3xl min-h-[500px] bg-white rounded-xl border-2 border-slate-200/50 shadow-sm relative overflow-hidden"
                   @mousemove="onDrag" @touchmove.prevent="onDrag">

                  <!-- Dynamic Target Line Segment -->
                  <!-- Scale: 1mm = 10px. -->
                  <div class="absolute h-2 rounded-full z-0 flex items-center justify-between transition-all duration-500"
                       :class="currentLevelData.color"
                       :style="{
                         top: `${currentLevelData.yOffset}px`,
                         left: `${currentLevelData.xOffset}px`,
                         width: `${currentLevelData.targetLength * 10}px`
                       }">
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                  </div>

                  <!-- The Draggable Ruler -->
                  <div class="absolute cursor-move select-none z-10 drop-shadow-md"
                       :style="{ left: `${rulerX}px`, top: `${rulerY}px` }"
                       @mousedown="startDrag" @touchstart.prevent="startDrag">

                       <!-- Ruler Body (Plastic) -->
                       <div class="bg-[#f0f9ff]/90 backdrop-blur-sm border-2 border-slate-400/50 rounded-lg flex flex-col justify-between"
                            style="width: 700px; height: 80px;">

                            <!-- Markings Top Edge -->
                            <div class="relative w-full h-8 border-b border-slate-300/50">
                                <!-- Edge offset is 30px. -->
                                <div class="absolute left-[30px] bottom-0 w-[600px] h-full pointer-events-none">
                                    <div v-for="mm in 61" :key="mm" class="absolute bottom-0 bg-slate-700"
                                         :style="{
                                            left: `${(mm-1) * 10}px`,
                                            width: '2px',
                                            height: (mm-1) % 10 === 0 ? '20px' : ((mm-1) % 5 === 0 ? '14px' : '8px')
                                         }">
                                         <!-- Numbers -->
                                         <span v-if="(mm-1) % 10 === 0" class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800">
                                             {{ (mm-1)/10 }}
                                         </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex-1 flex items-center justify-center pointer-events-none opacity-20">
                                <PhRuler weight="duotone" class="w-12 h-12 text-math-blue" />
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
