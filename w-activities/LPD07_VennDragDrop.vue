<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCirclesThree, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhHandGrabbing
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Verzamelingen: Het Venndiagram' },
  instruction: {
    type: String,
    default: 'Plaats getallen in de juiste zone van het Venndiagram op basis van hun eigenschappen.<br/><br/><strong>Opdracht:</strong> Klik een getal in de bank om het te selecteren, klik daarna op de juiste zone in het diagram.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCirclesThree }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een getal uit de bank, klik dan in het diagram.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionAnswer = ref(null)
const predictionText = ref('')
const predictionSubmitted = ref(false)
const showWorkedExample = ref(true)
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionSubmitted = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    goalText: 'Opdracht 1: Even getallen (A) en Veelvouden van 3 (B)',
    labelA: 'Even Getallen',
    labelB: 'Veelvouden van 3',
    predictionQuestion: 'Waar hoort het getal 6 in het diagram? (Even EN veelvoud van 3)',
    predictionHint: 'Denk na: is 6 even? Is 6 deelbaar door 3?',
    workedExample: {
      title: 'Voorbeeld',
      content: 'A = {even getallen} = {2, 4, 6, 8, 10, ...}<br/>B = {veelvouden van 3} = {3, 6, 9, 12, ...}<br/><br/>6 is even EN een veelvoud van 3 -> A ∩ B (doorsnede).<br/>4 is alleen even -> A-only.<br/>9 is alleen veelvoud van 3 -> B-only.<br/>5 is geen van beide -> buiten.'
    },
    hintLevels: [
      'Kijk naar de eigenschappen van elk getal. Is het even? Is het een veelvoud van 3? Of allebei? Of geen van beide?',
      'Voorbeeld: 9 is oneven maar wel een veelvoud van 3 (want 3 × 3 = 9). 4 is even maar geen veelvoud van 3.',
      'Welke getallen zijn even? 2, __, 6, 8, ... Welke zijn veelvouden van 3? 3, 6, __, 12, ...'
    ],
    whyExplanation: 'De doorsnede (A ∩ B) bevat getallen die aan BEIDE voorwaarden voldoen. 6 is tegelijk even en een veelvoud van 3, dus hoort het in de overlap.',
    reflectionQuestion: 'Welke getallen zitten in de doorsnede van "even getallen" en "veelvouden van 3"?',
    reflectionAnswer: 'Getallen die zowel even als een veelvoud van 3 zijn, dus veelvouden van 6: 6, 12, 18, ...',
    targetItems: [
      { id: 1, value: 4, targetRegion: 'aOnly' },
      { id: 2, value: 9, targetRegion: 'bOnly' },
      { id: 3, value: 6, targetRegion: 'intersection' },
      { id: 4, value: 5, targetRegion: 'outside' }
    ]
  },
  {
    goalText: 'Opdracht 2: Priemgetallen (A) en Oneven getallen (B)',
    labelA: 'Priemgetallen',
    labelB: 'Oneven Getallen',
    predictionQuestion: 'Waar hoort het getal 2 in het diagram? (Priemgetal EN even)',
    predictionHint: '2 is het enige even priemgetal. Is het oneven? Nee.',
    workedExample: {
      title: 'Voorbeeld',
      content: 'A = {priemgetallen} = {2, 3, 5, 7, 11, ...}<br/>B = {oneven getallen} = {1, 3, 5, 7, 9, ...}<br/><br/>3 is priem EN oneven -> A ∩ B.<br/>2 is priem maar EVEN -> A-only (want niet oneven).<br/>9 is oneven maar geen priem -> B-only.<br/>4 is geen van beide -> buiten.'
    },
    hintLevels: [
      'Een priemgetal heeft precies twee delers: 1 en zichzelf. Oneven = niet deelbaar door 2. Let op 2: het is het enige EVEN priemgetal.',
      'Voorbeeld: 3 is priem (delers: 1 en 3) en oneven -> overlap. 9 is oneven maar 9 = 3 × 3, dus geen priem -> B-only.',
      'Priem én oneven: 3, 5, __, 11, ... Alleen priem (even): __. Alleen oneven (geen priem): 1, 9, __, ...'
    ],
    whyExplanation: 'De meeste priemgetallen (behalve 2) zijn oneven, want een even getal groter dan 2 is altijd deelbaar door 2. Daarom valt 2 apart: het is priem maar niet oneven.',
    reflectionQuestion: 'Waarom is 2 het enige even priemgetal?',
    reflectionAnswer: 'Omdat elk ander even getal deelbaar is door 2 (naast 1 en zichzelf), dus het heeft minstens 3 delers.',
    targetItems: [
      { id: 5, value: 2, targetRegion: 'aOnly' },
      { id: 6, value: 3, targetRegion: 'intersection' },
      { id: 7, value: 9, targetRegion: 'bOnly' },
      { id: 8, value: 4, targetRegion: 'outside' }
    ]
  },
  {
    goalText: 'Opdracht 3: Deelbaar door 2 (A) en Deelbaar door 4 (B)',
    labelA: 'Deelbaar door 2',
    labelB: 'Deelbaar door 4',
    predictionQuestion: 'Bestaat er een getal dat deelbaar is door 4 maar NIET door 2?',
    predictionHint: 'Als een getal deelbaar is door 4, wat weet je dan over deelbaarheid door 2?',
    workedExample: {
      title: 'Voorbeeld',
      content: 'A = {getallen deelbaar door 2} = {2, 4, 6, 8, 10, 12, ...}<br/>B = {getallen deelbaar door 4} = {4, 8, 12, 16, ...}<br/><br/>Let op: ALLES wat deelbaar is door 4, is ook deelbaar door 2. Er is dus geen B-only!<br/>6 is deelbaar door 2 maar niet door 4 -> A-only.<br/>8 is deelbaar door beide -> A ∩ B.'
    },
    hintLevels: [
      'Alles wat deelbaar is door 4, is ook deelbaar door 2 (want 4 = 2 × 2). Kan iets deelbaar zijn door 4 zonder deelbaar te zijn door 2?',
      'Voorbeeld: 6 ÷ 2 = 3 maar 6 ÷ 4 = 1,5 -> A-only. 8 ÷ 2 = 4 en 8 ÷ 4 = 2 -> overlap.',
      'A-only: 2, 6, __, 14, ... Overlap (A en B): 4, 8, __, 16, ... B-only bestaat __.'
    ],
    whyExplanation: 'Als een getal deelbaar is door 4, dan is het ook deelbaar door 2 (want 4 = 2 × 2). Daarom kan een getal nooit "alleen in B" zitten. Dit toont aan dat B een deelverzameling is van A.',
    reflectionQuestion: 'Bestaat er een getal dat deelbaar is door 4 maar niet door 2? Waarom wel of niet?',
    reflectionAnswer: 'Nee, want als een getal deelbaar is door 4, dan is het ook deelbaar door 2 (4 = 2 × 2).',
    targetItems: [
      { id: 9, value: 6, targetRegion: 'aOnly' },
      { id: 10, value: 8, targetRegion: 'intersection' },
      { id: 11, value: 10, targetRegion: 'aOnly' },
      { id: 12, value: 12, targetRegion: 'intersection' },
      { id: 13, value: 5, targetRegion: 'outside' }
    ]
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const items = ref([])
const selectedItemId = ref(null)

const bankItems = computed(() => items.value.filter(i => i.currentRegion === 'bank'))
const aOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'aOnly'))
const bOnlyItems = computed(() => items.value.filter(i => i.currentRegion === 'bOnly'))
const intersectionItems = computed(() => items.value.filter(i => i.currentRegion === 'intersection'))
const outsideItems = computed(() => items.value.filter(i => i.currentRegion === 'outside'))

function cloneItems(levelItems) {
  return levelItems.map(item => ({ ...item, currentRegion: 'bank' }))
}

function selectItem(id) {
  if (isCorrect.value) return
  const item = items.value.find(i => i.id === id)
  if (!item) return
  if (item.currentRegion !== 'bank') {
    item.currentRegion = 'bank'
    selectedItemId.value = null
  } else {
    selectedItemId.value = selectedItemId.value === id ? null : id
  }
}

function placeInRegion(region) {
  if (!selectedItemId.value || isCorrect.value) return
  const item = items.value.find(i => i.id === selectedItemId.value)
  if (item) {
    item.currentRegion = region
    selectedItemId.value = null
    autoCheck()
  }
}

function autoCheck() {
  const allPlaced = items.value.every(i => i.currentRegion !== 'bank')
  if (allPlaced) {
    const allCorrect = items.value.every(i => i.currentRegion === i.targetRegion)
    if (allCorrect) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: 'Prima! Je hebt elk getal correct geplaatst.' }
      showWhy.value = true
    } else {
      attemptCount.value++
      const wrongItem = items.value.find(i => i.currentRegion !== i.targetRegion)
      const data = currentLevelData.value
      const idx = Math.min(attemptCount.value - 1, 2)

      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: data.hintLevels[0] }
      } else if (attemptCount.value === 2) {
        feedback.value = { type: 'error', text: data.hintLevels[1] }
      } else {
        feedback.value = { type: 'error', text: data.hintLevels[2] }
      }
    }
  }
}

function submitPrediction() {
  if (predictionText.value.trim().length > 0) {
    predictionSubmitted.value = true
    feedback.value = { type: 'info', text: 'Onthoud je antwoord. Bekijk het voorbeeld en probeer de opdracht!' }
    predictionAnswer.value = predictionText.value
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Selecteer een getal uit de bank, klik dan in het diagram.' }
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

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 3) {
    reflectionSubmitted.value = true
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Selecteer een getal uit de bank.' }
  selectedItemId.value = null
  attemptCount.value = 0
  hintCount.value = 0
  showPrediction.value = true
  predictionAnswer.value = null
  predictionText.value = ''
  predictionSubmitted.value = false
  showWorkedExample.value = true
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
  items.value = cloneItems(levels[currentInternalLevel.value].targetItems)
}

function handleNext() {
  if (showWhy.value && !showReflection.value) {
    showReflection.value = true
    return
  }
  if (showReflection.value && !reflectionSubmitted.value) {
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

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
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
            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="animate-fadeIn">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Voorspelling</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="font-bold text-slate-800 text-base mb-1">{{ currentLevelData.predictionQuestion }}</p>
                    <p class="text-sm text-slate-500 italic">{{ currentLevelData.predictionHint }}</p>
                  </div>
                </div>
                <textarea v-model="predictionText" :disabled="predictionSubmitted"
                          class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                          rows="2" placeholder="Typ je voorspelling..."></textarea>
                <button v-if="!predictionSubmitted" @click="submitPrediction"
                        class="mt-2 px-5 py-2 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                  Bevestig voorspelling
                </button>
                <p v-if="predictionSubmitted" class="text-xs text-slate-500 mt-2 italic">Voorspelling opgeslagen! Bekijk het voorbeeld.</p>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && predictionSubmitted" class="animate-fadeIn">
              <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" /> {{ currentLevelData.workedExample.title }}
                </h4>
                <MathText :content="currentLevelData.workedExample.content" class="text-sm text-slate-700 prose prose-sm" />
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- MAIN ACTIVITY -->
            <div v-if="!showPrediction && !showWorkedExample">
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
              <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

              <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
                <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
              </div>

              <button @click="showHint" :disabled="isCorrect"
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner relative overflow-visible">
                 <h4 class="font-bold text-slate-700 mb-2">Getallenbank</h4>
                 <p class="text-xs text-slate-500 mb-3">Klik om te selecteren, klik in diagram om te plaatsen.</p>
                 <div class="flex flex-wrap gap-2 min-h-[50px]">
                     <button v-for="item in bankItems" :key="item.id"
                             @click="selectItem(item.id)"
                             class="w-11 h-11 rounded-full font-bold text-lg flex items-center justify-center transition-all shadow-sm border-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                             :class="selectedItemId === item.id ? 'bg-amber-500 border-amber-600 text-white scale-110 shadow-md' : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400 hover:bg-amber-50'">
                         {{ item.value }}
                     </button>
                 </div>
                 <div v-if="selectedItemId" class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                     <PhHandGrabbing weight="fill" /> Klik nu op de juiste zone
                     <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div v-if="showWhy" class="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Waarom is dit zo?</p>
              <p class="text-sm text-slate-700 leading-relaxed">{{ currentLevelData.whyExplanation }}</p>
            </div>

            <div v-if="showReflection" class="p-3 mb-3 bg-slate-100 border border-slate-200 rounded-lg animate-fadeIn">
              <p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reflectie</p>
              <p class="text-sm font-medium text-slate-800 mb-2">{{ currentLevelData.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionSubmitted"
                        class="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        rows="2" placeholder="Typ je antwoord..."></textarea>
              <button v-if="!reflectionSubmitted" @click="submitReflection"
                      class="mt-2 px-4 py-1.5 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig
              </button>
              <p v-if="reflectionSubmitted" class="text-xs text-slate-500 mt-1 italic">Goed nagedacht!</p>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhArrowClockwise />
              </button>
              <button v-if="!isCorrect && !showPrediction && !showWorkedExample" disabled
                      class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60 text-sm">
                Auto-controle actief
              </button>
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 text-sm">
                <span v-if="showWhy && !showReflection">Bekijk uitleg</span>
                <span v-else-if="showReflection && !reflectionSubmitted">Reflecteer eerst</span>
                <span v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right panel: Venn diagram -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid"
               @click.self="placeInRegion('outside')" role="button" tabindex="0"
               @keydown.enter.prevent="placeInRegion('outside')" @keydown.space.prevent="placeInRegion('outside')" aria-label="Diagram">

            <div class="relative w-[600px] h-[420px] flex items-center justify-center">
              <!-- Outside zone (dark dashed border) -->
              <div class="absolute inset-0 border-4 border-dashed border-slate-300 rounded-xl cursor-pointer transition-colors"
                   :class="selectedItemId ? 'bg-slate-200/40 hover:bg-slate-300/60 border-amber-500/50' : 'hover:bg-slate-200/20'"
                   @click.self="placeInRegion('outside')">
                <div class="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-xs pointer-events-none">Buiten (geen van beide)</div>
                <div class="absolute inset-x-4 bottom-4 flex gap-2 pointer-events-none">
                    <button v-for="item in outsideItems" :key="item.id" @click.stop="selectItem(item.id)"
                            class="w-9 h-9 rounded-full font-bold bg-slate-200 border-2 border-slate-400 text-slate-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform text-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                        {{ item.value }}
                    </button>
                </div>
              </div>

              <div class="relative w-[450px] h-[300px] flex">
                <!-- A circle (left) -->
                <div class="absolute left-0 w-[300px] h-[300px] rounded-full border-[6px] border-amber-500 bg-amber-500/20 flex items-center justify-start p-8 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
                     :class="selectedItemId ? 'ring-4 ring-amber-500/50 ring-offset-4 ring-offset-slate-100 hover:bg-amber-500/40' : 'hover:bg-amber-500/30'"
                     @click="placeInRegion('aOnly')">
                     <span class="absolute top-8 left-12 font-black text-2xl text-amber-700 pointer-events-none">A</span>
                     <span class="absolute top-16 left-10 font-bold text-sm text-amber-800 pointer-events-none">{{ currentLevelData.labelA }}</span>
                     <div class="flex flex-wrap gap-2 w-28 pointer-events-none">
                         <button v-for="item in aOnlyItems" :key="item.id" @click.stop="selectItem(item.id)"
                                 class="w-9 h-9 rounded-full font-bold bg-white border-2 border-amber-500 text-amber-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform text-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                            {{ item.value }}
                         </button>
                     </div>
                </div>

                <!-- B circle (right) -->
                <div class="absolute right-0 w-[300px] h-[300px] rounded-full border-[6px] border-slate-500 bg-slate-500/20 flex items-center justify-end p-8 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
                     :class="selectedItemId ? 'ring-4 ring-amber-500/50 ring-offset-4 ring-offset-slate-100 hover:bg-slate-500/40' : 'hover:bg-slate-500/30'"
                     @click="placeInRegion('bOnly')">
                     <span class="absolute top-8 right-12 font-black text-2xl text-slate-700 pointer-events-none">B</span>
                     <span class="absolute top-16 right-6 font-bold text-sm text-slate-700 pointer-events-none text-right">{{ currentLevelData.labelB }}</span>
                     <div class="flex flex-wrap gap-2 justify-end w-28 pointer-events-none">
                         <button v-for="item in bOnlyItems" :key="item.id" @click.stop="selectItem(item.id)"
                                 class="w-9 h-9 rounded-full font-bold bg-white border-2 border-slate-500 text-slate-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform text-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                            {{ item.value }}
                         </button>
                     </div>
                </div>

                <!-- Intersection -->
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[200px] rounded-[100%] cursor-pointer z-10 flex flex-col items-center justify-center hover:bg-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
                     :class="selectedItemId ? 'ring-4 ring-amber-500/50 hover:bg-amber-500/40 bg-amber-500/10' : ''"
                     @click.stop="placeInRegion('intersection')">
                     <span class="text-[10px] font-bold text-amber-700 uppercase tracking-widest pointer-events-none mb-1">A ∩ B</span>
                     <div class="flex flex-wrap gap-2 justify-center pointer-events-none max-w-[80px]">
                         <button v-for="item in intersectionItems" :key="item.id" @click.stop="selectItem(item.id)"
                                 class="w-9 h-9 rounded-full font-bold bg-white border-2 border-amber-500 text-amber-700 pointer-events-auto shadow-sm hover:scale-110 transition-transform text-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                            {{ item.value }}
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
<SuccessCelebration :show="isCorrect && !celebrationDone && !showWhy" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
