<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRuler, PhArrowClockwise, PhLightbulb, PhChatCircleText
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
const hintCount = ref(0)

// Phases: 'predict' → 'measure' → 'reflect'
const phase = ref('predict')
const predictionValue = ref(null)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

const colorPairs = [
  { color: 'bg-amber-500', dotColor: 'bg-amber-600', label: 'ORANJE' },
  { color: 'bg-amber-700', dotColor: 'bg-amber-800', label: 'DONKER ORANJE' },
  { color: 'bg-slate-500', dotColor: 'bg-slate-600', label: 'GRIJZE' },
  { color: 'bg-slate-600', dotColor: 'bg-slate-700', label: 'DONKER GRIJZE' },
  { color: 'bg-amber-400', dotColor: 'bg-amber-500', label: 'LICHT ORANJE' }
]

function generateLevel(index) {
  let targetLength, colorPair, yOffset, xOffset
  let hintLevels
  switch (index) {
    case 0:
      targetLength = Math.floor(Math.random() * 31) + 20 // 20-50mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [100, 150, 200, 250][Math.floor(Math.random() * 4)]
      xOffset = Math.floor(Math.random() * 41) + 40 // 40-80
      hintLevels = [
        'Elk klein streepje op de meetlat is 1 mm. De getallen zijn in cm (1 cm = 10 mm).',
        'Stel dat de lijn begint bij 0 en eindigt bij 3,5 cm. Dat is 35 mm. Nu bij jou: tel het aantal mm tussen de twee eindpunten.',
        'De lijn eindigt bij __ cm. Hoeveel mm is dat? 1 cm = 10 mm, dus __ cm = __ mm.'
      ]
      return { goalText: `Opdracht 1: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hintLevels, workedExample: { question: 'Voorbeeld: Meet de lengte van een lijn van 3,2 cm.', steps: ['Zet het nulpunt (0) van de meetlat exact gelijk met het begin van de lijn.', 'Kijk waar de lijn eindigt op de meetlat.', 'Lees af: 3,2 cm = 32 mm.' ], result: '32 mm' } }
    case 1:
      targetLength = Math.floor(Math.random() * 31) + 60 // 60-90mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [100, 200, 300][Math.floor(Math.random() * 3)]
      xOffset = Math.floor(Math.random() * 61) + 80 // 80-140
      hintLevels = [
        'Vergeet niet het nulpunt (0) exact gelijk te leggen met het linker begin van de lijn!',
        'Stel: een lijn van 7,5 cm. Je zet 0 bij het begin, het einde ligt bij 7,5 cm. 7,5 cm = 75 mm. Nu bij jou: lees af waar de lijn eindigt.',
        'De lijn eindigt bij __ cm. Reken om: __ cm x 10 = __ mm.'
      ]
      return { goalText: `Opdracht 2: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hintLevels, workedExample: { question: 'Voorbeeld: Meet een lijn van 6,8 cm.', steps: ['Plaats 0 exact aan het begin van de lijn.', 'Lees af: de lijn eindigt tussen 6 en 7 cm, bij het 8e kleine streepje na 6.', '6 cm + 8 mm = 68 mm.'], result: '68 mm' } }
    case 2:
      targetLength = Math.floor(Math.random() * 41) + 100 // 100-140mm
      colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      yOffset = [80, 120, 180, 220][Math.floor(Math.random() * 4)]
      xOffset = Math.floor(Math.random() * 41) + 60 // 60-100
      hintLevels = [
        'Dit is een langere lijn. Controleer zorgvuldig de millimeters voorbij de laatste cm.',
        'Een lijn van 12,4 cm = 124 mm. Tel eerst de hele cm (12 x 10 = 120 mm) en dan de extra mm (4 mm). Nu bij jou: hoeveel hele cm? Hoeveel extra mm?',
        'Hele cm = __. Extra mm = __. Dus __ x 10 + __ = __ mm.'
      ]
      return { goalText: `Opdracht 3: Meet de lengte van de ${colorPair.label} lijn in millimeter.`, targetLength, color: colorPair.color, dotColor: colorPair.dotColor, yOffset, xOffset, hintLevels, workedExample: { question: 'Voorbeeld: Meet een lijn van 10,3 cm.', steps: ['Leg de meetlat met 0 aan het begin.', 'Lees de cm af: 10 hele cm = 100 mm.', 'Tel de extra mm: 3 kleine streepjes = 3 mm. Totaal = 103 mm.'], result: '103 mm' } }
    default:
      return { goalText: 'Opdracht 1: Meet de lengte.', targetLength: 42, color: 'bg-amber-500', dotColor: 'bg-amber-600', yOffset: 150, xOffset: 60, hintLevels: ['1 cm = 10 mm.', 'Stel: 4,2 cm = 42 mm.', '__ cm = __ mm.'], workedExample: { question: 'Voorbeeld', steps: ['Zet 0 aan het begin.', 'Lees af.'], result: '42 mm' } }
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

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitPrediction() {
  if (predictionValue.value === null || predictionValue.value === '') return
  phase.value = 'measure'
  feedback.value = { type: 'info', text: `Je schatting: ${predictionValue.value} mm. Sleep nu de meetlat en meet exact.` }
}

function resetActivityState() {
    isCorrect.value = false
    celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    hintCount.value = 0
    feedback.value = { type: 'info', text: 'Tip: Je kan de meetlat slepen met je muis.' }
    userLength.value = null
    predictionValue.value = null
    phase.value = 'predict'
    reflectionAnswer.value = ''
    showWorkedExample.value = true
    rulerX.value = 100
    rulerY.value = 350
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ]
}

function checkAnswer() {
  isChecked.value = true
  attemptCount.value++
  const target = currentLevelData.value.targetLength

  if (userLength.value === target) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: `Prima! Gemeten! De lijn is exact ${target} mm lang.`
    }
  } else {
    isCorrect.value = false

    // Error analysis: common misconception checks
    if (userLength.value !== null && userLength.value >= target + 3 && userLength.value <= target + 8) {
      feedback.value = {
        type: 'error',
        text: 'Let goed op! Je bent beginnen meten vanaf de fysieke RAND van de meetlat. Je moet beginnen bij het lange streepje van de 0 — niet aan de uiterste rand van het plastic.'
      }
    } else if (userLength.value !== null && userLength.value * 10 === target || (userLength.value !== null && userLength.value * 10 >= target - 1 && userLength.value * 10 <= target + 1)) {
      feedback.value = {
        type: 'error',
        text: `Je hebt ${userLength.value} mm ingevuld. Dat getal lijkt in centimeter (cm) te staan. We vragen het specifiek in millimeter (mm). 1 cm = 10 mm.`
      }
    } else {
      const hintIdx = Math.min(attemptCount.value - 1, 2)
      const hints = [
        `Niet helemaal juist. ${currentLevelData.value.hintLevels[0]}`,
        currentLevelData.value.hintLevels[1] || `De lijn is ongeveer ${target} mm lang. Kijk nog eens goed naar de streepjes.`,
        currentLevelData.value.hintLevels[2] || `De juiste lengte is ${target} mm.`
      ]
      feedback.value = { type: 'error', text: hints[hintIdx] }
    }
  }
}

function submitReflection() {
  phase.value = 'done'
}

function handleNext() {
  if (phase.value === 'reflect') {
    submitReflection()
    return
  }
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

function proceedAfterSuccess() {
  phase.value = 'reflect'
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-slate-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                <PhLightbulb weight="fill" class="w-4 h-4" />
                {{ currentLevelData.workedExample.question }}
              </h4>
              <ol class="text-sm text-slate-700 space-y-1 ml-4 list-decimal">
                <li v-for="(step, si) in currentLevelData.workedExample.steps" :key="si">{{ step }}</li>
              </ol>
              <p class="mt-2 text-sm font-bold text-amber-700">Antwoord: {{ currentLevelData.workedExample.result }}</p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-2 border border-amber-200 bg-amber-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-2">Schat eerst: Hoe lang denk je dat de lijn is?</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="predictionValue" placeholder="Schatting in mm..."
                          class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center" />
                   <span class="text-slate-600 font-bold whitespace-nowrap">mm</span>
               </div>
            </div>

            <!-- Measurement Phase -->
            <div v-if="phase === 'measure'" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-2">Lengte lijnstuk:</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userLength" placeholder="..." :disabled="isCorrect"
                          class="w-24 font-bold text-lg p-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center" />
                   <span class="text-slate-600 font-bold">mm</span>
               </div>
               <div v-if="predictionValue !== null && isChecked" class="mt-2 text-xs text-slate-500">
                 Jouw schatting: {{ predictionValue }} mm
               </div>
            </div>

            <!-- Why Explanation (after success) -->
            <div v-if="isCorrect && phase === 'measure'" class="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-1">
                <PhChatCircleText weight="fill" class="w-4 h-4" />
                Waarom is dit belangrijk?
              </h4>
              <p class="text-sm text-slate-700">
                Het nulpunt (0) van de meetlat moet exact samenvallen met het begin van het lijnstuk. Als je vanaf de rand van de meetlat begint, meet je steeds een paar mm te veel. Dit geldt voor alle meetinstrumenten: de nulmarkering is altijd het echte beginpunt, niet de fysieke rand van het toestel.
              </p>
            </div>

            <!-- Reflection Phase -->
            <div v-if="phase === 'reflect'" class="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                Reflectie
              </h4>
              <p class="text-sm text-slate-600 mb-3">Waar moet de 0-markering van de meetlat staan bij het meten van een lijnstuk?</p>
              <textarea v-model="reflectionAnswer" placeholder="Typ je antwoord..."
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-amber-500 focus:ring-amber-500 resize-none" rows="2"></textarea>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-slate-100 text-slate-700': feedback.type === 'error', 'bg-slate-100 text-slate-600': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>

              <!-- Prediction: submit button -->
              <button v-if="phase === 'predict'" @click="submitPrediction" :disabled="predictionValue === null || predictionValue === ''"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig schatting en meet
              </button>

              <!-- Measure: check or hint or next -->
              <button v-if="phase === 'measure' && !isCorrect" @click="checkAnswer" :disabled="userLength === null"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>
              <button v-if="phase === 'measure' && !isCorrect" @click="showHint"
                      class="py-4 px-4 text-lg font-medium transition-colors rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhLightbulb weight="fill" class="w-5 h-5" />
              </button>

              <!-- After success: show proceed button -->
              <button v-if="isCorrect && phase === 'measure'" @click="proceedAfterSuccess"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>Waarom?</span>
                <PhArrowRight weight="bold" />
              </button>

              <!-- Reflection: submit -->
              <button v-if="phase === 'reflect'" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :disabled="reflectionAnswer.trim().length < 3">
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

                  <!-- Dynamic Target Line Segment (hidden during prediction) -->
                  <div v-if="phase !== 'predict'" class="absolute h-2 rounded-full z-0 flex items-center justify-between transition-all duration-500"
                       :class="currentLevelData.color"
                       :style="{
                         top: `${currentLevelData.yOffset}px`,
                         left: `${currentLevelData.xOffset}px`,
                         width: `${currentLevelData.targetLength * 10}px`
                       }">
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                      <div class="w-1 h-6 rounded-full" :class="currentLevelData.dotColor"></div>
                  </div>

                  <!-- Prediction overlay -->
                  <div v-if="phase === 'predict'" class="absolute inset-0 flex items-center justify-center z-20">
                    <div class="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-amber-200 shadow-lg">
                      <PhRuler weight="duotone" class="w-16 h-16 text-amber-500 mx-auto mb-3" />
                      <h3 class="text-xl font-bold text-slate-800 mb-2">Schat de lengte</h3>
                      <p class="text-slate-600">Schat eerst hoe lang de lijn is,<br>daarna kan je de meetlat gebruiken.</p>
                    </div>
                  </div>

                  <!-- The Draggable Ruler (hidden during prediction and reflection) -->
                  <div v-if="phase === 'measure'" class="absolute cursor-move select-none z-10 drop-shadow-md"
                       :style="{ left: `${rulerX}px`, top: `${rulerY}px` }"
                       @mousedown="startDrag" @touchstart.prevent="startDrag">

                       <div class="bg-[#f0f9ff]/90 backdrop-blur-sm border-2 border-slate-400/50 rounded-lg flex flex-col justify-between"
                            style="width: 700px; height: 80px;">

                            <div class="relative w-full h-8 border-b border-slate-300/50">
                                <div class="absolute left-[30px] bottom-0 w-[600px] h-full pointer-events-none">
                                    <div v-for="mm in 61" :key="mm" class="absolute bottom-0 bg-slate-700"
                                         :style="{
                                            left: `${(mm-1) * 10}px`,
                                            width: '2px',
                                            height: (mm-1) % 10 === 0 ? '20px' : ((mm-1) % 5 === 0 ? '14px' : '8px')
                                         }">
                                         <span v-if="(mm-1) % 10 === 0" class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800">
                                             {{ (mm-1)/10 }}
                                         </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex-1 flex items-center justify-center pointer-events-none opacity-20">
                                <PhRuler weight="duotone" class="w-12 h-12 text-amber-500" />
                            </div>
                       </div>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && phase === 'measure'" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
