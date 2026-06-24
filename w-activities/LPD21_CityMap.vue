<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMapPin, PhArrowClockwise, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Stratenplan Symbolen' },
  instruction: {
    type: String,
    default: 'Kijk naar de kaart van de stad. Welke straten lopen evenwijdig (∥) of loodrecht (⊥) op elkaar? Kies het juiste wiskundige symbool voor elke combinatie van straten.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhMapPin }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWhy = ref(false)
const whyText = ref('')
const errorDetected = ref('')

// Prediction gate state
const predictionPhase = ref(false)
const predictionChoice = ref('')
const predictionRelation = ref(null)
const showWorkedExample = ref(true)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)

// Relation definitions
const relationDescriptions = {
  '∥': { label: 'Evenwijdig (parallel)', color: 'text-amber-600', bg: 'bg-amber-100' },
  '⊥': { label: 'Loodrecht', color: 'text-amber-700', bg: 'bg-amber-100' },
  '∦': { label: 'Snijdend, niet loodrecht', color: 'text-slate-600', bg: 'bg-slate-100' }
}

const levels = ref([])

function generateLevel() {
  const pool = [
    {
      left: 'a', right: 'b',
      leftDesc: 'Straat a (horizontaal)', rightDesc: 'Straat b (horizontaal)',
      correctSym: '∥',
      predictionQ: 'Straat a en b zijn allebei horizontaal. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Straat a en b gaan beide horizontaal. Ze snijden elkaar nooit. Denk aan evenwijdige spoorrails.',
      hint2: 'Evenwijdige straten hebben dezelfde richting en snijden elkaar niet. Horizontaal + horizontaal = ??',
      hint3: 'a __ b (evenwijdig, parallel)',
      why: 'Twee horizontale straten zijn evenwijdig (∥) omdat ze dezelfde richting hebben en elkaar nooit snijden.',
      errNotPerp: 'Ze snijden elkaar niet, dus loodrecht (⊥) kan niet.',
      errNotCross: 'Ze snijden elkaar niet, dus snijdend (∦) is onjuist.'
    },
    {
      left: 'a', right: 'c',
      leftDesc: 'Straat a (horizontaal)', rightDesc: 'Straat c (verticaal)',
      correctSym: '⊥',
      predictionQ: 'Straat a is horizontaal en straat c is verticaal. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Horizontaal en verticaal staan loodrecht op elkaar. Denk aan de assen van een assenstelsel.',
      hint2: 'Ze snijden elkaar met een rechte hoek van 90\u00b0. Kijk naar het hoektekentje op de kaart.',
      hint3: 'a __ c (loodrecht, 90\u00b0)',
      why: 'Een horizontale en een verticale straat zijn altijd loodrecht (⊥) omdat ze elkaar onder een hoek van 90\u00b0 snijden.',
      errNotPar: 'Ze hebben een verschillende richting, dus evenwijdig kan niet.',
      errNotCross: 'Ze snijden elkaar w\u00e9l, maar onder 90\u00b0, dus ⊥ is juist.'
    },
    {
      left: 'b', right: 'c',
      leftDesc: 'Straat b (horizontaal)', rightDesc: 'Straat c (verticaal)',
      correctSym: '⊥',
      predictionQ: 'Straat b is horizontaal en straat c is verticaal. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Deze straten kruisen elkaar. Is het 90\u00b0?',
      hint2: 'Kijk naar het rechte-hoek-tekentje op de kaart. Dat betekent loodrecht.',
      hint3: 'b __ c (loodrecht)',
      why: 'Een horizontale en een verticale straat snijden elkaar altijd onder 90\u00b0, dus ⊥.',
      errNotPar: 'Ze hebben een verschillende richting, dus evenwijdig kan niet.',
      errNotCross: 'Ze snijden onder 90\u00b0, dus loodrecht (⊥).'
    },
    {
      left: 'a', right: 'd',
      leftDesc: 'Straat a (horizontaal)', rightDesc: 'Straat d (schuin)',
      correctSym: '∦',
      predictionQ: 'Straat a is horizontaal en straat d is schuin. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Ze snijden elkaar, maar is het onder een rechte hoek? Nee! Dus het is niet ⊥.',
      hint2: 'Ze zijn niet evenwijdig want ze snijden elkaar. Maar de hoek is ook geen 90\u00b0.',
      hint3: 'a __ d (snijdend, niet loodrecht)',
      why: 'Straten a en d snijden elkaar wel, maar niet onder 90\u00b0. Daarom zijn ze snijdend maar niet loodrecht (∦).',
      errPerp: 'Een horizontale en een schuine lijn zijn nooit loodrecht tenzij de schuine exact verticaal is.',
      errPar: 'Ze snijden elkaar, dus ze zijn niet evenwijdig.'
    },
    {
      left: 'b', right: 'd',
      leftDesc: 'Straat b (horizontaal)', rightDesc: 'Straat d (schuin)',
      correctSym: '∦',
      predictionQ: 'Straat b is horizontaal en straat d is schuin. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Ze snijden elkaar. Maar is het 90\u00b0? Nee, want een horizontale en een schuine lijn kunnen geen 90\u00b0 maken.',
      hint2: 'Snijdend maar niet loodrecht. De hoek is geen 90\u00b0.',
      hint3: 'b __ d (snijdend, niet loodrecht)',
      why: 'Twee lijnen die elkaar snijden maar niet onder 90\u00b0 zijn snijdend zonder loodrecht te zijn (∦).',
      errPerp: 'Horizontaal + schuin = nooit loodrecht.',
      errPar: 'Ze snijden elkaar, dus niet evenwijdig.'
    },
    {
      left: 'c', right: 'd',
      leftDesc: 'Straat c (verticaal)', rightDesc: 'Straat d (schuin)',
      correctSym: '∦',
      predictionQ: 'Straat c is verticaal en straat d is schuin. Wat is de relatie?',
      options: ['∥', '⊥', '∦'],
      hint1: 'Ze snijden elkaar. Is de hoek 90\u00b0?',
      hint2: 'Alleen een horizontale lijn staat loodrecht op een verticale. Schuine lijnen zijn nooit loodrecht op verticale.',
      hint3: 'c __ d (snijdend, niet loodrecht)',
      why: 'Verticaal en schuin snijden elkaar wel maar nooit onder 90\u00b0, dus ∦.',
      errPerp: 'Verticaal + schuin = nooit 90\u00b0.',
      errPar: 'Ze snijden elkaar, dus niet evenwijdig.'
    }
  ]

  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  return [
    {
      goalText: 'Opdracht 1: Basis Relaties',
      relations: shuffled.slice(0, 2).map(r => ({ ...r, userSym: '' })),
      level: 0
    },
    {
      goalText: 'Opdracht 2: Gemengde Straten',
      relations: shuffled.slice(2, 4).map(r => ({ ...r, userSym: '' })),
      level: 1
    },
    {
      goalText: 'Opdracht 3: Uitdagende Combinaties',
      relations: shuffled.slice(4, 6).map(r => ({ ...r, userSym: '' })),
      level: 2
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const symbols = ['∥', '⊥', '∦']

function getHint(rel) {
  const idx = Math.min(hintCount.value, 2)
  return [rel.hint1, rel.hint2, rel.hint3][idx]
}

function showHint() {
  hintCount.value++
  const rel = currentLevelData.value.relations.find(r => r.userSym !== r.correctSym) || currentLevelData.value.relations[0]
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [rel.hint1, rel.hint2, rel.hint3]
  feedback.value = { type: 'info', text: `Hint ${idx + 1}: ${hints[idx]}` }
}

function startPrediction(rel, idx) {
  if (isCorrect.value) return
  predictionPhase.value = true
  predictionRelation.value = idx
  predictionChoice.value = ''
  feedback.value = { type: 'info', text: rel.predictionQ }
}

function submitPrediction() {
  if (predictionChoice.value === '' || predictionRelation.value === null) return
  const rel = currentLevelData.value.relations[predictionRelation.value]

  if (predictionChoice.value === rel.correctSym) {
    predictionPhase.value = false
    // Set the symbol
    errorDetected.value = ''
    currentLevelData.value.relations[predictionRelation.value].userSym = rel.correctSym
    feedback.value = {
      type: 'success',
      text: rel.why
    }
    // Check if all done
    checkAllComplete()
  } else {
    attemptCount.value++
    let specific = ''
    if (predictionChoice.value === '∥') {
      specific = rel.errPar || 'Evenwijdig is niet juist. Ze hebben een verschillende richting.'
      errorDetected.value = 'Twee straten zijn alleen evenwijdig als ze dezelfde richting hebben. Kijk naar de richting van beide straten op de kaart — hebben ze dezelfde oriëntatie?'
    } else if (predictionChoice.value === '⊥') {
      specific = rel.errPerp || rel.errNotPerp || 'Loodrecht is niet juist.'
      errorDetected.value = 'Loodrecht betekent dat de straten elkaar onder een rechte hoek (90°) snijden. Maakt jouw paar een rechte hoek?'
    } else {
      specific = rel.errNotCross || 'Snijdend-niet-loodrecht is niet juist.'
      errorDetected.value = '∦ gebruik je als straten elkaar snijden maar geen rechte hoek vormen. Kijk of dit van toepassing is.'
    }
    feedback.value = { type: 'error', text: specific + ' ' + getHint(rel) }
  }
}

function cancelPrediction() {
  predictionPhase.value = false
  predictionRelation.value = null
  predictionChoice.value = ''
}

function cycleSymbol(index) {
  if (isCorrect.value || predictionPhase.value) return
  // Start prediction before allowing symbol selection
  const rel = currentLevelData.value.relations[index]
  startPrediction(rel, index)
}

function checkAllComplete() {
  const rels = currentLevelData.value.relations
  const allFilled = rels.every(r => r.userSym !== '')
  if (allFilled) {
    const allCorrect = rels.every(r => r.userSym === r.correctSym)
    if (allCorrect) {
      isCorrect.value = true
      attemptCount.value = 0
      feedback.value = { type: 'success', text: 'Prima! Je hebt alle relaties correct bepaald.' }
    } else {
      const wrong = rels.find(r => r.userSym !== r.correctSym)
      feedback.value = { type: 'error', text: `Kijk nog naar ${wrong.leftDesc} en ${wrong.rightDesc}. ` + getHint(wrong) }
    }
  }
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: 'Klik op een ?-knop om de relatie tussen twee straten te bepalen.' }
  predictionPhase.value = false
  predictionChoice.value = ''
  predictionRelation.value = null
  showWorkedExample.value = true
  showWhy.value = false
  whyText.value = ''
  errorDetected.value = ''
  showReflection.value = false
  reflectionAnswer.value = ''
}

function submitReflection() {
  if (reflectionAnswer.value.trim().length > 2) {
    showReflection.value = false
    reflectionAnswer.value = ''
    handleNextInternal()
  } else {
    feedback.value = { type: 'error', text: 'Schrijf een korte gedachte op om verder te gaan.' }
  }
}

function handleNext() {
  if (isCorrect.value) {
    showReflection.value = true
    feedback.value = { type: 'info', text: 'Waarom zijn twee horizontale straten altijd evenwijdig?' }
  }
}

function handleNextInternal() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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
    levels.value = generateLevel()
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
  if (e.key === 'Enter' && predictionPhase.value) submitPrediction()
  if (e.key === 'Enter' && showReflection.value) submitReflection()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const workedExample = {
  streets: [
    { label: 'p', dir: 'horizontaal (oost-west)' },
    { label: 'q', dir: 'horizontaal (oost-west)' },
    { label: 'r', dir: 'verticaal (noord-zuid)' }
  ],
  relations: [
    { pair: 'p en q', sym: '∥', reason: 'beide horizontaal, zelfde richting, snijden elkaar nooit' },
    { pair: 'p en r', sym: '⊥', reason: 'horizontaal + verticaal = 90\u00b0' },
    { pair: 'q en r', sym: '⊥', reason: 'horizontaal + verticaal = 90\u00b0' }
  ]
}
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
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
        <button @click="emit('close')" class="p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98]">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="p-4 mb-4 bg-amber-50 border border-amber-300 rounded-xl">
              <p class="font-bold text-amber-800 mb-2 text-sm uppercase tracking-wider">Voorbeeld</p>
              <p class="font-bold text-amber-900 mb-2">Straten p, q (horizontaal) en r (verticaal)</p>
              <div class="bg-white p-3 rounded-lg border border-amber-200 space-y-1 text-sm">
                <div v-for="rel in workedExample.relations" :key="rel.pair"
                     class="font-mono text-slate-700">
                  {{ rel.pair }}: <strong class="text-amber-700">{{ rel.sym }}</strong> = {{ rel.reason }}
                </div>
              </div>
            </div>

            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl mb-4">
              <p class="font-bold text-slate-800 text-sm">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Relations -->
            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl">
               <h4 class="font-bold text-slate-700 mb-4">Bepaal de relatie:</h4>
               <div class="flex flex-col gap-4">
                   <div v-for="(rel, idx) in currentLevelData.relations" :key="idx"
                        class="flex items-center justify-center gap-4 bg-white p-4 rounded-lg border border-slate-200"
                        :class="rel.userSym === rel.correctSym && rel.userSym !== '' ? 'border-amber-400 bg-amber-50' : ''">
                       <span class="font-black text-xl text-slate-600">{{ rel.left }}</span>

                       <button @click="cycleSymbol(idx)" :disabled="isCorrect || predictionPhase"
                               class="w-12 h-12 rounded-lg border-2 flex items-center justify-center font-black text-2xl transition-colors"
                               :class="rel.userSym === rel.correctSym && rel.userSym !== '' ? 'border-amber-500 bg-amber-100 text-amber-700' : (rel.userSym ? 'border-red-400 bg-red-50 text-red-600' : 'border-dashed border-slate-400 text-slate-400 hover:border-amber-400 hover:text-amber-600')">
                           {{ rel.userSym || '?' }}
                       </button>

                       <span class="font-black text-xl text-slate-600">{{ rel.right }}</span>
                   </div>
               </div>

               <div class="mt-4 flex gap-2 text-xs text-slate-500">
                 <span class="px-2 py-1 bg-amber-100 rounded">∥ = evenwijdig</span>
                 <span class="px-2 py-1 bg-amber-100 rounded">⊥ = loodrecht</span>
                 <span class="px-2 py-1 bg-slate-100 rounded">∦ = snijdend (niet 90°)</span>
               </div>
            </div>

            <!-- Error Analysis -->
            <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 border border-red-200 bg-red-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-red-800 mb-1">
                <PhWarningCircle weight="fill" class="w-4 h-4" />
                Let op!
              </h4>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <!-- Why Explanation -->
            <div v-if="showWhy && isCorrect" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
              <p class="font-bold text-indigo-800 text-sm mb-1">
                <PhLightbulb weight="fill" class="w-4 h-4 inline" />
                Waarom werkt dit?
              </p>
              <p class="text-xs text-indigo-700 leading-relaxed">{{ whyText }}</p>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success' || feedback.type === 'info',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                 }">
               <component :is="feedback.type === 'error' ? PhWarningCircle : PhCheckCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100">
                <PhArrowClockwise />
              </button>

              <button @click="showHint" :disabled="isCorrect"
                      class="p-4 text-lg font-medium rounded-lg text-amber-600 bg-amber-50 border border-amber-300 hover:bg-amber-100">
                 <PhLightbulb class="w-5 h-5" />
              </button>

              <!-- Prediction Modal Choices -->
              <div v-if="predictionPhase && predictionRelation !== null" class="flex gap-2 flex-1">
                <button v-for="opt in ['∥', '⊥', '∦']" :key="opt"
                        @click="predictionChoice = opt; submitPrediction()"
                        class="flex-1 py-4 font-bold text-white rounded-lg text-lg"
                        :class="opt === '∥' ? 'bg-amber-600 hover:bg-amber-500' : opt === '⊥' ? 'bg-amber-700 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-500'">
                  {{ opt }}
                </button>
                <button @click="cancelPrediction" class="p-4 text-slate-500">X</button>
              </div>

              <button v-if="isCorrect && !showReflection" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-if="showReflection" class="flex-1">
                <input v-model="reflectionAnswer"
                       placeholder="Schrijf je antwoord..."
                       class="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 outline-none"
                       @keydown.enter="submitReflection" />
                <button v-if="showReflection" @click="submitReflection"
                        class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500">
                  Verder
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative">

              <!-- Map Visualization -->
              <div class="w-full max-w-3xl aspect-[4/3] bg-amber-50 border-4 border-amber-200 rounded-xl overflow-hidden shadow-md relative">

                  <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" class="absolute inset-0">

                      <!-- Street A (Horizontal Top) -->
                      <g>
                          <line x1="0" y1="200" x2="800" y2="200" stroke="#475569" stroke-width="24" />
                          <line x1="0" y1="200" x2="800" y2="200" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <rect x="50" y="160" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="65" y="180" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">a</text>
                      </g>

                      <!-- Street B (Horizontal Bottom) -->
                      <g>
                          <line x1="0" y1="400" x2="800" y2="400" stroke="#475569" stroke-width="24" />
                          <line x1="0" y1="400" x2="800" y2="400" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <rect x="50" y="360" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="65" y="380" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">b</text>
                      </g>

                      <!-- Street C (Vertical) -->
                      <g>
                          <line x1="600" y1="0" x2="600" y2="600" stroke="#475569" stroke-width="24" />
                          <line x1="600" y1="0" x2="600" y2="600" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <polyline points="588,200 588,188 600,188" fill="none" stroke="#f1f5f9" stroke-width="2" />
                          <polyline points="588,400 588,388 600,388" fill="none" stroke="#f1f5f9" stroke-width="2" />
                          <rect x="620" y="50" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="635" y="70" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">c</text>
                      </g>

                      <!-- Street D (Diagonal) -->
                      <g>
                          <line x1="200" y1="600" x2="500" y2="0" stroke="#475569" stroke-width="24" />
                          <line x1="200" y1="600" x2="500" y2="0" stroke="#f1f5f9" stroke-width="2" stroke-dasharray="12 12" />
                          <rect x="230" y="450" width="30" height="30" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                          <text x="245" y="470" text-anchor="middle" font-weight="900" font-size="18" fill="#0f172a">d</text>
                      </g>

                  </svg>
              </div>

              <!-- Legend -->
              <div class="flex gap-4 mt-4 text-sm">
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono">∥ evenwijdig</span>
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono">⟂ loodrecht</span>
                <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono">∦ snijdend</span>
              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
</style>
