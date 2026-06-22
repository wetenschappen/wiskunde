<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowsLeftRight, PhArrowsClockwise, PhSplitHorizontal, PhLightbulb, PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Meetkunde: Symmetrie-Scanner' },
  instruction: {
    type: String,
    default: 'Mensen denken vaak dat bepaalde figuren heel symmetrisch zijn, totdat ze het echt uittesten.<br/><br/><strong>Opdracht:</strong> Gebruik de Symmetrie-Scanner. Test de <strong>Lijnsymmetrie</strong> (spiegelen over een as) en de <strong>Puntsymmetrie</strong> (180° draaien). Bepaal daarna de eigenschap van de figuur.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhArrowsLeftRight }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Voorspel eerst: heeft deze figuur lijnsymmetrie, puntsymmetrie, beide of geen?' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showHint = ref(false)

// --- Phase management ---
// 'predict' → 'test' → 'answer' → 'why' → 'reflect' → 'done'
const phase = ref('predict')

// --- Level Logic ---
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    {
      goalText: 'Opdracht: Het Parallellogram',
      shapeSVG: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="100,50 350,50 300,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'point',
      successMsg: 'Perfect! Een parallellogram past na 180° draaien (puntsymmetrie) exact op zichzelf, maar als je hem spiegelt (lijnsymmetrie) steken de hoeken uit.',
      whyText: '**Waarom:** Lijnsymmetrie betekent dat je een figuur over een as kunt spiegelen zodat beide helften perfect samenvallen. Puntsymmetrie betekent dat je de figuur 180° kunt draaien rond een centrumpunt. Een parallellogram heeft geen spiegelas, maar wel een centrumpunt — vandaar enkel puntsymmetrie.',
      reflectionQuestion: 'Waarom heeft een parallellogram puntsymmetrie maar geen lijnsymmetrie?',
      hintLevels: [
        'Probeer beide testen. Let op of de rode en blauwe vorm perfect samenvallen.',
        'Bij lijnsymmetrie moet de gespiegelde vorm exact passen — dat doet dit parallellogram niet. Bij puntsymmetrie (180° draaien) wel.',
        'Een parallellogram heeft puntsymmetrie (geen lijnsymmetrie). Na 180° draaien past hij exact op zichzelf.'
      ],
      // For error analysis
      commonMistake: 'both',
      mistakeMsg: 'Let op: een parallellogram heeft niet BEIDE soorten symmetrie. De lijnsymmetrie-test mislukt — kijk naar de uitstekende hoeken!'
    },
    {
      goalText: 'Opdracht: De Vlieger',
      shapeSVG: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,20 300,80 200,180 100,80" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'line',
      successMsg: 'Heel goed! Je kan een vlieger exact in de helft vouwen (spiegelen), maar als je hem ondersteboven draait (180°) past hij niet meer.',
      whyText: '**Waarom:** Een vlieger heeft een verticale symmetrieas — de linker- en rechterhelft zijn elkaars spiegelbeeld. Maar na 180° draaien wijst de punt naar beneden en past hij niet meer op de oorspronkelijke vorm.',
      reflectionQuestion: 'Waarom heeft een vlieger wel lijnsymmetrie maar geen puntsymmetrie?',
      hintLevels: [
        'Probeer beide testen. Welke past perfect?',
        'Let op of de vorm symmetrisch is over een middellijn (spiegelas) — de vlieger heeft dat. Maar 180° draaien werkt niet.',
        'Een vlieger heeft lijnsymmetrie (geen puntsymmetrie).'
      ],
      commonMistake: 'both',
      mistakeMsg: 'Een vlieger heeft niet BEIDE soorten. De puntsymmetrie-test mislukt — na 180° draaien steekt de staart bovenaan uit.'
    },
    {
      goalText: 'Opdracht: De Rechthoek',
      shapeSVG: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="50,50 350,50 350,150 50,150" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'both',
      successMsg: 'Fantastisch! Een rechthoek is zeer regelmatig — je kan hem vouwen (2 symmetrieassen) én 180° draaien, hij past altijd.',
      whyText: '**Waarom:** Een rechthoek heeft twee symmetrieassen (midden verticaal en midden horizontaal) én een centrumpunt (snijpunt van de diagonalen). Daarom slaagt hij voor beide testen.',
      reflectionQuestion: 'Waarom heeft een rechthoek beide soorten symmetrie, terwijl een parallellogram er maar één heeft?',
      hintLevels: [
        'Probeer beide testen zorgvuldig. Wat zie je?',
        'Een rechthoek is zeer symmetrisch. Test beide testen — let op of de rode vorm exact over de blauwe valt.',
        'Een rechthoek heeft zowel lijn- als puntsymmetrie.'
      ],
      commonMistake: 'line',
      mistakeMsg: 'Een rechthoek heeft meer dan alleen lijnsymmetrie! Test ook de puntsymmetrie (180° draaien) — hij past perfect.'
    },
    {
      goalText: 'Opdracht: Het Vierkant',
      shapeSVG: '<polygon points="100,30 300,30 300,170 100,170" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="100,30 300,30 300,170 100,170" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'both',
      successMsg: 'Super! Een vierkant is de meest symmetrische veelhoek — 4 symmetrieassen en puntsymmetrie in het centrum.',
      whyText: '**Waarom:** Een vierkant heeft 4 symmetrieassen (verticaal, horizontaal, twee diagonalen) én een centrumpunt. Daarom slaagt hij voor beide testen ruimschoots.',
      reflectionQuestion: 'Hoeveel symmetrieassen heeft een vierkant? En waarom heeft een ruit er maar twee?',
      hintLevels: [
        'Dit is een zeer regelmatige figuur. Beide testen zouden moeten werken.',
        'Een vierkant is symmetrisch in vele opzichten — test beide soorten!',
        'Een vierkant heeft zowel lijn- als puntsymmetrie.'
      ],
      commonMistake: 'line',
      mistakeMsg: 'Een vierkant heeft meer! Test ook de puntsymmetrie, die werkt ook perfect.'
    },
    {
      goalText: 'Opdracht: De Ruit',
      shapeSVG: '<polygon points="200,20 350,100 200,180 50,100" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,20 350,100 200,180 50,100" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'point',
      successMsg: 'Juist! Een ruit (geroteerd vierkant) heeft puntsymmetrie: na 180° draaien past hij perfect. Lijnsymmetrie werkt niet in deze stand.',
      whyText: '**Waarom:** Een ruit heeft weliswaar twee symmetrieassen (de diagonalen), maar in deze gedraaide oriëntatie valt geen enkele as samen met de spiegelas van de test. De puntsymmetrie daarentegen werkt altijd, ongeacht de oriëntatie.',
      reflectionQuestion: 'Een ruit heeft diagonalen als symmetrieassen — maar waarom werken ze niet in deze oriëntatie van de test?',
      hintLevels: [
        'Probeer de puntsymmetrie-test. Draai de figuur 180° rond het centrum.',
        'Deze ruit heeft puntsymmetrie maar geen lijnsymmetrie in deze stand — hint: de diagonalen zijn de symmetrieassen, maar vallen niet samen met de test-as.',
        'Een ruit heeft puntsymmetrie (geen lijnsymmetrie in deze oriëntatie).'
      ],
      commonMistake: 'both',
      mistakeMsg: 'De ruit heeft niet beide — alleen puntsymmetrie werkt hier. De lijnsymmetrie-test faalt in deze oriëntatie.'
    },
    {
      goalText: 'Opdracht: De Onregelmatige Vijfhoek',
      shapeSVG: '<polygon points="200,30 320,80 280,160 120,160 80,80" fill="rgba(251, 191, 36, 0.25)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />',
      shapeSVGRed: '<polygon points="200,30 320,80 280,160 120,160 80,80" fill="rgba(239, 68, 68, 0.4)" stroke="#dc2626" stroke-width="4" stroke-dasharray="10 5" stroke-linejoin="round" />',
      correctAns: 'none',
      successMsg: 'Goed gezien! Deze onregelmatige vijfhoek heeft geen enkele symmetrie. Niet alle figuren zijn symmetrisch!',
      whyText: '**Waarom:** Een figuur heeft enkel lijnsymmetrie als een spiegelas de figuur in twee exact gelijke helften verdeelt. Puntsymmetrie vereist dat de figuur na 180° draaien identiek is. Deze vijfhoek heeft ongelijke zijden en hoeken — geen van beide is mogelijk.',
      reflectionQuestion: 'Waarom heeft een onregelmatige vijfhoek geen symmetrie, terwijl een regelmatige vijfhoek dat wel heeft?',
      hintLevels: [
        'Sommige figuren hebben helemaal geen symmetrie. Test beide soorten.',
        'Let op of de rode vorm exact over de blauwe valt. Bij geen enkele test zou dat moeten lukken — de zijden zijn allemaal verschillend.',
        'Deze vijfhoek heeft geen lijn- en geen puntsymmetrie.'
      ],
      commonMistake: 'point',
      mistakeMsg: 'Kijk goed — na 180° draaien past hij niet precies. De ongelijke zijden zorgen dat hij niet symmetrisch is.'
    }
  ]

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// --- Worked example (always first) ---
const showWorkedExample = ref(true)

// --- Prediction ---
const prediction = ref('')
const predictionSubmitted = ref(false)

function submitPrediction() {
  if (!prediction.value) return
  predictionSubmitted.value = true
  phase.value = 'test'
  feedback.value = { type: 'info', text: 'Goed! Test nu je voorspelling met de scanner-knoppen.' }
}

// --- Test state ---
const testState = ref('none')
const userAns = ref('')

function runTest(type) {
  if (isCorrect.value || phase.value !== 'test') return
  testState.value = 'none'
  setTimeout(() => {
    testState.value = type
  }, 50)
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintCount.value = 0
  showHint.value = false
  prediction.value = ''
  predictionSubmitted.value = false
  phase.value = 'predict'
  feedback.value = { type: 'info', text: 'Voorspel eerst: heeft deze figuur lijnsymmetrie, puntsymmetrie, beide of geen?' }
  testState.value = 'none'
  userAns.value = ''
}

function showHintFn() {
  if (hintCount.value < 3) {
    hintCount.value++
    showHint.value = true
    const data = currentLevelData.value
    if (data && data.hintLevels) {
      const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
      if (idx >= 0) {
        feedback.value = { type: 'info', text: data.hintLevels[idx] }
      }
    }
  }
}

function checkAnswer() {
  isChecked.value = true
  const target = currentLevelData.value.correctAns
  const userVal = userAns.value

  if (testState.value === 'none') {
    isCorrect.value = false
    attemptCount.value++
    feedback.value = { type: 'error', text: 'Gebruik de scanner-knoppen om de figuur te testen voor je antwoord kiest!' }
    return
  }

  if (userVal === target) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: currentLevelData.value.successMsg }
    phase.value = 'why'
  } else {
    isCorrect.value = false
    attemptCount.value++
    hintCount.value = 0
    showHint.value = false

    // Error analysis: detect common misconception
    const data = currentLevelData.value
    if (userVal === data.commonMistake) {
      feedback.value = { type: 'error', text: data.mistakeMsg }
    } else if (userVal === 'none' && target !== 'none') {
      feedback.value = { type: 'error', text: 'Deze figuur heeft wel symmetrie! Test beide soorten opnieuw. ' + data.hintLevels[0] }
    } else if (userVal === 'both' && target === 'none') {
      feedback.value = { type: 'error', text: 'Deze figuur heeft geen symmetrie. Geen enkele test zou moeten passen. ' + data.hintLevels[0] }
    } else if (userVal === 'line') {
      feedback.value = { type: 'error', text: (data.correctAns === 'point' ? 'Lijnsymmetrie werkt niet — de gespiegelde versie past niet. Probeer puntsymmetrie.' : (data.errLine || 'Kijk goed. Past hij na het spiegelen echt perfect?')) }
    } else if (userVal === 'point') {
      feedback.value = { type: 'error', text: (data.correctAns === 'line' ? 'Puntsymmetrie werkt niet — na 180° draaien past hij niet. Probeer lijnsymmetrie.' : (data.errPoint || 'Kijk goed. Past hij na 180° draaien echt perfect?')) }
    } else {
      feedback.value = { type: 'error', text: 'Niet helemaal... ' + data.hintLevels[0] }
    }
  }
}

// --- Phase handlers ---
const reflectionAnswer = ref('')
const reflectionDone = ref(false)

function submitReflection() {
  if (!reflectionAnswer.value || reflectionAnswer.value.length < 5) {
    feedback.value = { type: 'error', text: 'Schrijf een volledige zin om verder te gaan.' }
    return
  }
  reflectionDone.value = true
  phase.value = 'done'
  feedback.value = { type: 'success', text: 'Uitstekende reflectie! Dit helpt je de leerstof beter te onthouden.' }
}

function handleNext() {
  reflectionDone.value = false
  reflectionAnswer.value = ''
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    // Show worked example again briefly
    showWorkedExample.value = true
    setTimeout(() => { showWorkedExample.value = false }, 500)
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// --- Lifecycle ---
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    levels.value = generateLevel()
    resetActivityState()
    showWorkedExample.value = true
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 text-slate-800">
    <div class="absolute inset-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')"
         aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
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
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <!-- LEFT SIDEBAR -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData?.goalText }}</p>
            </div>

            <!-- Worked Example -->
            <div v-if="showWorkedExample && currentInternalLevel === 0" class="p-4 mb-4 border border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <p class="text-sm font-bold text-amber-700 mb-2">Voorbeeld: Het Vierkant</p>
              <p class="text-xs text-slate-600 leading-relaxed">
                Een vierkant heeft <strong>zowel lijn- als puntsymmetrie</strong>.<br/>
                Je kan het vierkant over zijn middellijn spiegelen (lijnsymmetrie) én 180° draaien rond het centrum (puntsymmetrie). Beide testen slagen.
              </p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <label class="text-sm font-bold text-slate-700">Voorspel eerst:</label>
              </div>
              <p class="text-xs text-slate-500 mb-4">Voordat je test: welke symmetrie heeft deze figuur?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [
                  { value: 'line', label: 'Enkel Lijnsymmetrie' },
                  { value: 'point', label: 'Enkel Puntsymmetrie' },
                  { value: 'both', label: 'Beide' },
                  { value: 'none', label: 'Geen' }
                ]" :key="opt.value"
                  @click="prediction = opt.value"
                  class="p-3 border-2 rounded-lg font-medium transition-all text-sm text-left active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  :class="prediction === opt.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-amber-300 bg-white text-slate-600'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="prediction" @click="submitPrediction"
                      class="w-full mt-4 py-3 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig Voorspelling
              </button>
            </div>

            <!-- Test + Answer Phase -->
            <div v-if="phase === 'test' || phase === 'why' || phase === 'reflect' || phase === 'done'">
              <div class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                <label class="block text-sm font-bold text-slate-700 mb-3">Conclusie over de figuur:</label>
                <select v-model="userAns" :disabled="isCorrect || phase === 'why' || phase === 'reflect' || phase === 'done'"
                        class="w-full p-4 border-2 border-slate-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 font-bold text-slate-700 bg-white">
                  <option value="" disabled>Kies een eigenschap...</option>
                  <option value="line">Enkel Lijnsymmetrisch (Spiegelas)</option>
                  <option value="point">Enkel Puntsymmetrisch (180° draai)</option>
                  <option value="both">Zowel Lijn- als Puntsymmetrisch</option>
                  <option value="none">Geen van beide</option>
                </select>
              </div>
            </div>

            <!-- Why Phase -->
            <div v-if="phase === 'why'" class="p-4 mt-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <p class="text-sm font-bold text-amber-700 mb-2">Waarom is dit juist?</p>
              <MathText :content="currentLevelData?.whyText || ''" class="text-xs text-slate-700 leading-relaxed" />
            </div>

            <!-- Reflection Phase -->
            <div v-if="phase === 'reflect'" class="p-4 mt-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <label class="text-sm font-bold text-slate-700">Reflectievraag</label>
              </div>
              <p class="text-xs text-slate-600 mb-3">{{ currentLevelData?.reflectionQuestion }}</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                        class="w-full p-3 border-2 border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:ring-amber-500 focus:border-amber-500 resize-none"
                        rows="3" placeholder="Schrijf je antwoord..."></textarea>
              <button v-if="!reflectionDone" @click="submitReflection"
                      class="w-full mt-3 py-3 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Bevestig Reflectie
              </button>
            </div>
          </div>

          <!-- BOTTOM BAR -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-slate-100 text-slate-700': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowRight class="w-5 h-5 rotate-180" />
              </button>

              <!-- Check button (test phase) -->
              <button v-if="phase === 'test' && !isCorrect"
                      @click="checkAnswer"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                Controleer Eigenschap
              </button>

              <!-- Hint button -->
              <button v-if="phase === 'test' && !isCorrect && hintCount < 3"
                      @click="showHintFn"
                      class="flex items-center justify-center gap-2 px-4 py-4 font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                <PhLightbulb weight="fill" class="w-5 h-5" />
                <span v-if="hintCount === 0">Hint</span>
                <span v-else>Hint {{ hintCount + 1 }}</span>
              </button>

              <!-- Show 'why' button (why phase) -->
              <div v-if="phase === 'why'" class="flex-1 flex justify-center">
                <button @click="phase = 'reflect'"
                        class="py-4 px-6 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                  Reflectievraag
                </button>
              </div>

              <!-- Continue button (done/reflect phase) -->
              <button v-if="phase === 'done' || (phase === 'reflect' && reflectionDone)"
                      @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-if="phase === 'predict'" class="flex-1 py-4 text-center text-sm font-medium text-slate-400">
                Voorspel eerst hiernaast
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT MAIN AREA -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div class="w-full max-w-4xl flex flex-col items-center">
              <!-- Test Buttons -->
              <div class="flex gap-4 mb-12">
                <button @click="runTest('line')" :disabled="isCorrect || phase !== 'test'"
                        class="px-6 py-4 font-bold bg-white text-amber-600 border-2 border-amber-400 rounded-xl shadow-md flex items-center gap-2 hover:bg-amber-50 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
                        :class="{'opacity-50 cursor-not-allowed': isCorrect || phase !== 'test'}">
                  <PhSplitHorizontal weight="bold" class="w-6 h-6" /> Test Lijnsymmetrie
                </button>
                <button @click="runTest('point')" :disabled="isCorrect || phase !== 'test'"
                        class="px-6 py-4 font-bold bg-white text-amber-600 border-2 border-amber-400 rounded-xl shadow-md flex items-center gap-2 hover:bg-amber-50 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-amber-500"
                        :class="{'opacity-50 cursor-not-allowed': isCorrect || phase !== 'test'}">
                  <PhArrowsClockwise weight="bold" class="w-6 h-6" /> Test Puntsymmetrie
                </button>
              </div>

              <!-- Visualisation Area -->
              <div class="relative w-[500px] h-[300px] bg-white shadow-md border-4 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden"
                   :key="currentInternalLevel">

                <!-- Center Point -->
                <div v-if="testState === 'point'"
                     class="absolute z-30 w-3 h-3 bg-amber-500 rounded-full"
                     style="top: 148px; left: 248px;"></div>

                <!-- Axis of Symmetry -->
                <div v-if="testState === 'line'"
                     class="absolute w-0.5 h-full bg-slate-400 border-x border-white border-dashed z-30"
                     style="left: 50%;"></div>

                <!-- Base Shape (amber) -->
                <svg width="400" height="200" viewBox="0 0 400 200" class="absolute z-10"
                     v-html="currentLevelData?.shapeSVG"></svg>

                <!-- Animated Clone (red) -->
                <svg v-if="testState !== 'none'" width="400" height="200" viewBox="0 0 400 200"
                     class="absolute z-20 pointer-events-none"
                     :class="testState === 'line' ? 'animate-flip' : 'animate-spin180'"
                     v-html="currentLevelData?.shapeSVGRed"></svg>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true"
                    :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.animate-flip {
    animation: flipX 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-origin: center;
}
@keyframes flipX {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(-1); }
}

.animate-spin180 {
    animation: spin180 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    transform-origin: center;
}
@keyframes spin180 {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(180deg); }
}
</style>
