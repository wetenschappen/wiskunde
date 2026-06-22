<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTriangle, PhArrowClockwise,
  PhLightbulb, PhQuestion, PhCursorClick
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Oppervlakte: Driehoek op Rooster' },
  instruction: {
    type: String,
    default: 'De oppervlakte van een driehoek bereken je met: <strong>opp = (basis × hoogte) / 2</strong>.<br/><br/><strong>Opdracht:</strong> Klik op de juiste oppervlakte in het rooster. De driehoek staat op een rooster van 1 cm × 1 cm.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Schat de oppervlakte, klik daarna op het juiste vakje.' })
const attemptCount = ref(0)
const hintCount = ref(0)

// --- 8-element state ---
const showPrediction = ref(true)
const predictionEstimate = ref(null)
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
    goalText: 'Driehoek A: Basis 4 cm, Hoogte 3 cm',
    triangle: { base: 4, height: 3, correctArea: 6 },
    gridWidth: 6, gridHeight: 5,
    vertices: [[1, 1], [5, 1], [1, 4]], // [col, row] in grid units
    correctAnswer: 6,
    options: [4, 6, 7, 12],
    predictionQuestion: 'Schat: wat is de oppervlakte van deze driehoek?',
    predictionHint: 'Basis = 4 hokjes, hoogte = 3 hokjes. Formule: opp = b × h / 2.',
    workedExample: {
      title: 'Voorbeeld: Oppervlakte Driehoek',
      content: 'De driehoek heeft basis = 4 cm en hoogte = 3 cm.<br/><br/>Opp = (basis × hoogte) / 2 = (4 × 3) / 2 = 12 / 2 = 6 cm²<br/><br/>Waarom? Een rechthoek van 4 × 3 = 12 cm². De driehoek is precies de helft van die rechthoek.',
      label: 'Opp = (4 × 3) / 2 = 6 cm²'
    },
    hintLevels: [
      'Oppervlakte = (basis × hoogte) / 2. Basis = horizontale afstand. Hoogte = verticale afstand loodrecht op de basis.',
      'Voorbeeld: basis is het onderste lijnstuk: van (1,1) naar (5,1) = 4 cm. Hoogte = van basis tot top = 3 cm. Opp = (4 × 3) / 2.',
      'Opp = (__ × 3) / 2 = __ / 2 = __ cm²'
    ],
    whyExplanation: 'De oppervlakte van een driehoek is altijd de helft van de rechthoek met dezelfde basis en hoogte. De rechthoek van 4 × 3 = 12 cm² wordt door de driehoek precies in tweeën gedeeld.',
    reflectionQuestion: 'Waarom deel je door 2 bij de oppervlakte van een driehoek?',
    reflectionAnswer: 'Omdat een driehoek precies de helft is van een rechthoek met dezelfde basis en hoogte.'
  },
  {
    goalText: 'Driehoek B: Basis 5 cm, Hoogte 4 cm',
    triangle: { base: 5, height: 4, correctArea: 10 },
    gridWidth: 7, gridHeight: 6,
    vertices: [[0, 2], [5, 2], [5, 5]],
    correctAnswer: 10,
    options: [9, 10, 12, 20],
    predictionQuestion: 'Schat: wat is de oppervlakte van deze driehoek?',
    predictionHint: 'Basis = 5 hokjes, hoogte = 4 hokjes. Deel door 2!',
    workedExample: {
      title: 'Voorbeeld: Oppervlakte Driehoek',
      content: 'Basis = 5 cm (horizontaal: van kolom 0 naar 5). Hoogte = 4 cm (verticaal: van rij 2 naar 5).<br/><br/>Opp = (5 × 4) / 2 = 20 / 2 = 10 cm²',
      label: 'Opp = (5 × 4) / 2 = 10 cm²'
    },
    hintLevels: [
      'Zoek de basis (langste horizontale zijde of een willekeurige zijde als basis). Meet de hoogte loodrecht op de basis.',
      'Basis: van (0,2) naar (5,2) = 5 cm. Hoogte: van basis naar top (5,5) = 4 cm. Opp = 5 × 4 / 2.',
      'Opp = (__ × __) / 2 = __ / 2 = __ cm²'
    ],
    whyExplanation: 'De rechthoek om de driehoek heen heeft oppervlakte 5 × 4 = 20 cm². De driehoek vult precies de helft van die rechthoek, dus 10 cm².',
    reflectionQuestion: 'Waarom is de oppervlakte 10 cm² en niet 20 cm²?',
    reflectionAnswer: 'Omdat de driehoek de helft is van de rechthoek 5 × 4. 20 / 2 = 10.'
  },
  {
    goalText: 'Driehoek C: Basis 3 cm, Hoogte 6 cm',
    triangle: { base: 3, height: 6, correctArea: 9 },
    gridWidth: 5, gridHeight: 8,
    vertices: [[1, 1], [4, 1], [1, 7]],
    correctAnswer: 9,
    options: [9, 12, 18, 6],
    predictionQuestion: 'Schat: wat is de oppervlakte van deze hoge, smalle driehoek?',
    predictionHint: 'Breedte = 3, hoogte = 6. Denk aan de formule!',
    workedExample: {
      title: 'Voorbeeld: Hoge Driehoek',
      content: 'Basis = 3 cm (van kolom 1 naar 4). Hoogte = 6 cm (van rij 1 naar 7).<br/><br/>Opp = (3 × 6) / 2 = 18 / 2 = 9 cm²<br/><br/>Zelfs al is de driehoek hoog en smal, de formule blijft hetzelfde!',
      label: 'Opp = (3 × 6) / 2 = 9 cm²'
    },
    hintLevels: [
      'Ook al staat de driehoek anders georiënteerd, de formule blijft: (basis × hoogte) / 2. Zoek de loodrechte hoogte.',
      'Basis = 3 cm (horizontaal). Hoogte = 6 cm (verticaal loodrecht op de basis). Opp = 3 × 6 / 2.',
      'Opp = (3 × __) / 2 = __ / 2 = __ cm²'
    ],
    whyExplanation: 'Het maakt niet uit hoe de driehoek eruitziet: de formule opp = (b × h) / 2 werkt altijd. De hoogte moet loodrecht op de basis staan. Hier is de basis 3 cm en de hoogte 6 cm.',
    reflectionQuestion: 'Verandert de formule als de driehoek anders staat? Waarom wel/niet?',
    reflectionAnswer: 'Nee, de formule (basis × hoogte) / 2 blijft hetzelfde, zolang je de loodrechte hoogte gebruikt.'
  }
]

const currentLevelData = computed(() => levels[currentInternalLevel.value])
const selectedOption = ref(null)

// Grid rendering helpers
function gridCols(n) { return n }
function gridRows(n) { return n }

function isVertex(col, row) {
  const v = currentLevelData.value.vertices
  return v.some(([c, r]) => c === col && r === row)
}

function isOnTriangle(col, row) {
  // Check if the cell center is inside the triangle using barycentric coordinates
  const v = currentLevelData.value.vertices
  const x = col + 0.5, y = row + 0.5
  const [x1, y1] = v[0], [x2, y2] = v[1], [x3, y3] = v[2]

  const d = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)
  if (Math.abs(d) < 0.001) return false

  const a = ((x2 - x3) * (y - y3) - (x - x3) * (y2 - y3)) / d
  const b = ((x3 - x1) * (y - y1) - (x - x1) * (y3 - y1)) / d
  const c = 1 - a - b

  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1
}

function selectOption(val) {
  if (isCorrect.value) return
  selectedOption.value = val
  checkAnswer(val)
}

function checkAnswer(val) {
  isChecked.value = true
  const correct = currentLevelData.value.correctAnswer
  const isMatch = val === correct

  if (isMatch) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: `Juist! De oppervlakte is ${correct} cm².` }
    showWhy.value = true
  } else {
    attemptCount.value++

    if (attemptCount.value === 1) {
      // Error analysis: common mistakes
      const data = currentLevelData.value
      if (val === data.triangle.base * data.triangle.height) {
        feedback.value = { type: 'error', text: 'Bijna! Je berekende basis × hoogte, maar vergeet niet te delen door 2. De driehoek is de helft van de rechthoek.' }
      } else if (val === data.triangle.base + data.triangle.height) {
        feedback.value = { type: 'error', text: 'Niet helemaal. Je moet vermenigvuldigen (basis × hoogte), niet optellen. Deel het resultaat door 2.' }
      } else {
        feedback.value = { type: 'error', text: 'Niet juist. Tel de hokjes in de driehoek of gebruik de formule: (basis × hoogte) / 2.' }
      }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: currentLevelData.value.hintLevels[0] }
    } else {
      feedback.value = { type: 'error', text: currentLevelData.value.hintLevels[1] }
    }
  }
}

function submitPrediction() {
  if (predictionEstimate.value !== null && predictionEstimate.value !== '') {
    predictionSubmitted.value = true
    const val = Number(predictionEstimate.value)
    feedback.value = { type: 'info', text: `Je schatting: ${val} cm². Bekijk het voorbeeld en probeer het!` }
  }
}

function dismissWorkedExample() {
  showWorkedExample.value = false
  feedback.value = { type: 'info', text: 'Klik op de juiste oppervlakte in het rooster.' }
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
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: 'Schat de oppervlakte, klik dan op het juiste vakje.' }
  selectedOption.value = null
  showPrediction.value = true
  predictionEstimate.value = null
  predictionSubmitted.value = false
  showWorkedExample.value = true
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionSubmitted.value = false
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
              <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Schatting</h3>
              <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <PhQuestion weight="fill" class="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="font-bold text-slate-800 text-base">{{ currentLevelData.predictionQuestion }}</p>
                    <p class="text-sm text-slate-500 italic mt-1">{{ currentLevelData.predictionHint }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <input v-model="predictionEstimate" type="number" placeholder="bv. 6"
                         class="w-24 p-2 border border-slate-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                         min="0" step="0.5" />
                  <span class="font-bold text-slate-500">cm²</span>
                  <button @click="submitPrediction"
                          class="px-5 py-2 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
                          :disabled="predictionEstimate === null || predictionEstimate === ''">
                    Schatten!
                  </button>
                </div>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="showWorkedExample && predictionSubmitted" class="animate-fadeIn">
              <div class="p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-sm mb-4">
                <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PhLightbulb weight="fill" class="w-4 h-4" /> {{ currentLevelData.workedExample.title }}
                </h4>
                <MathText :content="currentLevelData.workedExample.content" class="text-sm text-slate-700 prose prose-sm" />
                <div class="mt-3 p-3 bg-white border-2 border-amber-300 rounded-lg text-center font-black text-lg text-amber-700">
                  {{ currentLevelData.workedExample.label }}
                </div>
              </div>
              <button @click="dismissWorkedExample"
                      class="w-full py-2.5 rounded-lg font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500">
                Begrepen! Kies de oppervlakte
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
                      class="w-full mb-3 py-2 rounded-lg font-bold text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500"
                      :class="isCorrect ? 'opacity-50 cursor-not-allowed' : ''">
                <PhLightbulb weight="fill" class="w-4 h-4 text-amber-500" />
                Hint {{ hintCount > 0 ? hintCount : '' }}
              </button>

              <!-- Answer options -->
              <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                <h4 class="font-bold text-slate-700 mb-3 text-sm">Kies de juiste oppervlakte:</h4>
                <div class="grid grid-cols-2 gap-3">
                  <button v-for="opt in currentLevelData.options" :key="opt"
                          @click="selectOption(opt)"
                          class="py-4 rounded-xl font-bold text-xl border-2 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="selectedOption === opt
                            ? (opt === currentLevelData.correctAnswer
                              ? 'bg-amber-500 border-amber-600 text-white shadow-md'
                              : 'bg-red-400 border-red-500 text-white shadow-md')
                            : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400 hover:bg-amber-50'"
                          :disabled="isCorrect">
                    {{ opt }} cm²
                  </button>
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

        <!-- Right panel: Grid with triangle -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

            <div v-if="!showPrediction" class="w-full max-w-lg flex flex-col items-center animate-fadeIn">

              <!-- Grid with triangle -->
              <div class="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200">
                <div class="relative"
                     :style="{
                       width: currentLevelData.gridWidth * 48 + 'px',
                       height: currentLevelData.gridHeight * 48 + 'px'
                     }">

                  <!-- Grid cells -->
                  <div v-for="row in currentLevelData.gridHeight" :key="'r'+row"
                       class="absolute flex"
                       :style="{ top: (row-1) * 48 + 'px', left: 0 }">
                    <div v-for="col in currentLevelData.gridWidth" :key="'c'+col"
                         class="w-12 h-12 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-mono"
                         :class="{
                           'bg-amber-100 border-amber-300': isOnTriangle(col-1, row-1),
                           'bg-amber-200 border-amber-400': isVertex(col-1, row-1)
                         }">
                    </div>
                  </div>

                  <!-- Triangle SVG overlay -->
                  <svg class="absolute inset-0 pointer-events-none"
                       :width="currentLevelData.gridWidth * 48"
                       :height="currentLevelData.gridHeight * 48"
                       :viewBox="`0 0 ${currentLevelData.gridWidth * 48} ${currentLevelData.gridHeight * 48}`">
                    <polygon v-if="predictionSubmitted"
                             :points="currentLevelData.vertices.map(([c, r]) => `${c * 48 + 24},${r * 48 + 24}`).join(' ')"
                             fill="rgba(245, 158, 11, 0.3)"
                             stroke="#f59e0b"
                             stroke-width="3"
                             stroke-linejoin="round"
                             class="transition-all duration-700" />

                    <!-- Vertex dots -->
                    <circle v-for="(v, i) in currentLevelData.vertices" :key="i"
                            :cx="v[0] * 48 + 24" :cy="v[1] * 48 + 24"
                            r="5" fill="#f59e0b" stroke="white" stroke-width="2" />

                    <!-- Base dimension label -->
                    <text v-if="isCorrect"
                          :x="((currentLevelData.vertices[0][0] + currentLevelData.vertices[1][0]) / 2) * 48 + 24"
                          :y="(currentLevelData.vertices[0][1]) * 48 + 48"
                          text-anchor="middle" font-weight="bold" font-size="14"
                          fill="#64748b" font-family="Inter, sans-serif">
                      basis = {{ currentLevelData.triangle.base }}
                    </text>

                    <!-- Height dimension label -->
                    <text v-if="isCorrect"
                          :x="(currentLevelData.vertices[0][0]) * 48 - 4"
                          :y="((currentLevelData.vertices[0][1] + currentLevelData.vertices[2][1]) / 2) * 48 + 24"
                          text-anchor="end" font-weight="bold" font-size="14"
                          fill="#64748b" font-family="Inter, sans-serif">
                      h = {{ currentLevelData.triangle.height }}
                    </text>
                  </svg>

                  <!-- Grid coordinate labels -->
                  <div class="absolute -bottom-6 left-0 right-0 flex"
                       :style="{ width: currentLevelData.gridWidth * 48 + 'px' }">
                    <div v-for="col in currentLevelData.gridWidth" :key="'xl'+col"
                         class="flex-1 text-center text-[10px] text-slate-400 font-mono">
                      {{ col - 1 }}
                    </div>
                  </div>
                  <div class="absolute -left-6 top-0 flex flex-col"
                       :style="{ height: currentLevelData.gridHeight * 48 + 'px' }">
                    <div v-for="row in currentLevelData.gridHeight" :key="'yl'+row"
                         class="flex-1 flex items-center text-[10px] text-slate-400 font-mono">
                      {{ row - 1 }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Legend -->
              <div class="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div>
                  <span>Driehoek</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 bg-amber-200 border border-amber-400 rounded"></div>
                  <span>Hoekpunt</span>
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
