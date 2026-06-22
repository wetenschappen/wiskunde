<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise, PhSquaresFour } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Producten: (a+b)²' },
  instruction: { type: String, default: '(a+b)² is NIET a²+b²! Ontdek via een vierkant waar de 2ab vandaan komt.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSquaresFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)

// Prediction phase
const predictionPhase = ref(true)
const prediction = ref('')

// Worked example
const showWorkedExample = ref(false)

// Why explanation & reflection
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionCorrect = ref(false)
const reflectionChecked = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, b

  if (levelIndex === 0) {
    const pairs = [[3, 1], [2, 1], [4, 1], [3, 2], [5, 2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else if (levelIndex === 1) {
    const pairs = [[4, 2], [5, 3], [6, 2], [5, 4], [7, 3]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else {
    const pairs = [[6, 4], [7, 5], [8, 3], [9, 5], [8, 6]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  }

  const totalPx = 300
  const aPx = Math.round(totalPx * a / (a + b))
  const bPx = totalPx - aPx

  return { a, b, label: `(${a}+${b})²`, aPx, bPx }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const isSplit = ref(false)
const userAns = ref('')
const isChecked = ref(false)

// 3-level hints
const hintLevels = [
  `Kijk naar de onderdelen van het vierkant. Het grote vierkant met zijde (a+b) is verdeeld in 4 kleinere stukken.`,
  `Voorbeeld: (5+2)². Stel a=5, b=2. Het vierkant heeft oppervlakte 7×7 = 49. De delen: a²=25, 2ab=2×10=20, b²=4. Samen 25+20+4=49.`,
  `(a+b)² = a² + __ + b². Hoeveel oranje rechthoeken zie je? ab + ab = __ab`
]

function splitSquare() {
  if (!isCorrect.value) {
    isSplit.value = true
    feedback.value = { type: 'success', text: `Prima! a² (oranje) + b² (oranje) + 2×ab (oranje). Dus (a+b)² = a² + 2ab + b²` }
  }
}

function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, hintLevels.length - 1)
  if (idx >= 0) {
    feedback.value = { type: 'info', text: hintLevels[idx] }
  }
}

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === 'correct') {
    if (isSplit.value) {
      isCorrect.value = true
      showWhy.value = true
      feedback.value = {
        type: 'success',
        text: `Briljant! (${currentLevel.value.a}+${currentLevel.value.b})² = ${currentLevel.value.a}² + 2·${currentLevel.value.a}·${currentLevel.value.b} + ${currentLevel.value.b}² = ${currentLevel.value.a**2} + ${2*currentLevel.value.a*currentLevel.value.b} + ${currentLevel.value.b**2} = ${(currentLevel.value.a+currentLevel.value.b)**2}`
      }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Splits eerst het vierkant om de delen te zien!' }
    }
  } else if (userAns.value === 'wrong2') {
    attemptCount.value++
    // Error analysis: forgetting cross terms
    feedback.value = {
      type: 'error',
      text: 'Dat is NET de fout die we willen aantonen! (a+b)² is NIET a²+b². De twee oranje rechthoeken (ab+ab=2ab) ontbreken.'
    }
  } else if (userAns.value === 'wrong1') {
    attemptCount.value++
    feedback.value = {
      type: 'error',
      text: 'Bijna! Er zijn TWEE oranje rechthoeken, niet een. Tel opnieuw: ab + ab = 2ab.'
    }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: 'Kies een formule.' }
  }
}

function submitPrediction() {
  if (prediction.value.trim()) {
    predictionPhase.value = false
    hintCount.value = 0
    feedback.value = { type: 'info', text: 'Splits het vierkant om de formule te ontdekken.' }
  }
}

function checkReflection() {
  reflectionChecked.value = true
  const ans = reflectionAnswer.value.toLowerCase()
  if (ans.includes('middel') || ans.includes('2ab') || ans.includes('twee') || ans.includes('kruis') || ans.length > 15) {
    reflectionCorrect.value = true
    feedback.value = { type: 'success', text: 'Juist! Bij (a+b)(a-b) vallen de middelste termen weg (-ab+ab=0). Bij (a+b)² tellen de twee middelste termen op (ab+ab=2ab).' }
  } else {
    feedback.value = { type: 'error', text: 'Denk aan de uitwerking: (a+b)(a-b) = a² - ab + ab - b² vs (a+b)² = a² + ab + ab + b². Wat is het verschil in de middelste termen?' }
    return
  }
}

function goToReflection() {
  showReflection.value = true
  showWhy.value = false
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  isSplit.value = false
  attemptCount.value = 0
  hintCount.value = 0
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionCorrect.value = false
  reflectionChecked.value = false
  feedback.value = { type: 'info', text: '' }
  userAns.value = ''

  if (currentInternalLevel.value === 0) {
    predictionPhase.value = true
    prediction.value = ''
  } else {
    predictionPhase.value = false
  }
  showWorkedExample.value = currentInternalLevel.value === 0
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => mainArea.value?.focus())
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => document.addEventListener('fullscreenchange', () => {
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close')
}))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', () => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/20" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-xl bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <!-- PREDICTION GATE -->
    <div v-if="predictionPhase" class="flex-1 flex items-center justify-center p-8 bg-slate-50">
      <div class="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div class="flex items-center gap-3 mb-6">
          <PhSquaresFour weight="fill" class="w-8 h-8 text-amber-500" />
          <h3 class="text-xl font-bold text-slate-800">Voorspel eerst</h3>
        </div>
        <p class="text-slate-700 mb-4 text-lg">Wat denk je dat <span class="font-mono font-bold text-amber-700">(x+3)²</span> is?</p>
        <p class="text-sm text-slate-500 mb-6">Denk na voor je antwoordt. Klopt x² + 9? Of ontbreekt er iets?</p>
        <textarea v-model="prediction" rows="2" placeholder="Typ je voorspelling..." class="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 resize-none text-slate-800"></textarea>
        <button @click="submitPrediction" :disabled="!prediction.trim()" class="mt-4 w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          Ik heb een voorspelling
        </button>
      </div>
    </div>

    <!-- WORKED EXAMPLE -->
    <div v-else-if="showWorkedExample" class="flex-1 flex items-center justify-center p-8 bg-slate-50">
      <div class="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <span class="text-amber-700 font-bold text-sm">VB</span>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Voorbeeld met getallen</h3>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <p class="text-slate-700"><span class="font-mono font-bold">(3+2)²</span> met a=3, b=2</p>
          <p class="text-slate-700">= 3² + 2·3·2 + 2²</p>
          <p class="text-slate-700">= 9 + 12 + 4</p>
          <p class="text-slate-700">= <span class="font-mono font-bold text-amber-700">25</span></p>
          <p class="text-sm text-slate-500 mt-2">Niet 9+4=13! De <span class="font-bold text-amber-700">2ab = 12</span> is de helft van het totaal.</p>
        </div>
        <p class="text-sm text-slate-500 mt-4 mb-6">Zie je hoe belangrijk de 2ab is? Zonder die term klopt de formule niet.</p>
        <button @click="showWorkedExample = false" class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          Begrepen! Start oefening
        </button>
      </div>
    </div>

    <!-- MAIN INTERACTION -->
    <main v-else class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

          <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p class="text-sm font-bold text-amber-700 mb-1">Bestudeer:</p>
            <p class="font-mono text-2xl font-black text-slate-800">{{ currentLevel.label }}</p>
          </div>

          <!-- Splits button -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <p class="text-sm font-bold text-slate-700 mb-3">Stap 1: Bekijk de onderdelen</p>
            <button @click="splitSquare" :disabled="isCorrect || isSplit"
              class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              Splits Vierkant
            </button>
          </div>

          <!-- Keuze -->
          <div class="p-4 bg-white border border-slate-200 rounded-xl">
            <label class="block text-sm font-bold text-slate-700 mb-2">Stap 2: Wat is de formule?</label>
            <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 font-bold text-slate-700 bg-white">
              <option value="" disabled>Kies de formule...</option>
              <option value="wrong2">a² + b²</option>
              <option value="wrong1">a² + ab + b²</option>
              <option value="correct">a² + 2ab + b²</option>
            </select>
          </div>

          <button v-if="!isCorrect && hintCount < 3" @click="showHint" class="mt-4 w-full py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
            Toon hint ({{ 3 - hintCount }} over)
          </button>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-xl"
            role="status" aria-live="polite" aria-atomic="true" :class="{
              'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'success',
              'bg-red-50 text-red-800 border border-red-200': feedback.type === 'error',
              'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'info'
            }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-snug">{{ feedback.text }}</span>
          </div>

          <div class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-lg transition-colors rounded-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              <PhArrowClockwise />
            </button>

            <button v-if="!isCorrect" @click="checkAnswer" :disabled="userAns === ''" class="flex-1 py-3 font-bold text-white rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              Controleer
            </button>

            <button v-if="isCorrect && !showReflection" @click="goToReflection" class="flex-1 py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              Waarom 2ab?
            </button>

            <button v-if="reflectionCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual: Vierkant -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-8 items-center justify-center">
          <div class="bg-white rounded-2xl shadow-md border border-slate-200 p-10">
            <div class="text-center mb-6 font-mono text-2xl font-black text-slate-800">{{ currentLevel.label }}</div>

            <div class="relative" :style="{ width: (currentLevel.aPx + currentLevel.bPx) + 'px', height: (currentLevel.aPx + currentLevel.bPx) + 'px' }">

              <!-- a² (bovenlinks) -->
              <div class="absolute top-0 left-0 flex items-center justify-center transition-all duration-700"
                :style="{ width: currentLevel.aPx + 'px', height: currentLevel.aPx + 'px' }"
                :class="isSplit ? '-translate-x-3 -translate-y-3' : ''"
                style="background: rgba(251,146,60,0.12); border: 3px solid #f97316;">
                <span class="font-black text-3xl text-amber-600">a²</span>
              </div>

              <!-- ab (bovenrechts) -->
              <div class="absolute top-0 flex items-center justify-center transition-all duration-700"
                :style="{ left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.aPx + 'px' }"
                :class="isSplit ? 'translate-x-3 -translate-y-3' : ''"
                style="background: rgba(251,146,60,0.12); border: 3px solid #f59e0b;">
                <span class="font-black text-xl text-amber-500">ab</span>
              </div>

              <!-- ab (onderlinks) -->
              <div class="absolute left-0 flex items-center justify-center transition-all duration-700"
                :style="{ top: currentLevel.aPx + 'px', width: currentLevel.aPx + 'px', height: currentLevel.bPx + 'px' }"
                :class="isSplit ? '-translate-x-3 translate-y-3' : ''"
                style="background: rgba(251,146,60,0.12); border: 3px solid #f59e0b;">
                <span class="font-black text-xl text-amber-500">ab</span>
              </div>

              <!-- b² (onderrechts) -->
              <div class="absolute flex items-center justify-center transition-all duration-700"
                :style="{ top: currentLevel.aPx + 'px', left: currentLevel.aPx + 'px', width: currentLevel.bPx + 'px', height: currentLevel.bPx + 'px' }"
                :class="isSplit ? 'translate-x-3 translate-y-3' : ''"
                style="background: rgba(251,146,60,0.12); border: 3px solid #d97706;">
                <span class="font-black text-2xl text-amber-700">b²</span>
              </div>

              <!-- Labels a en b -->
              <div class="absolute -top-8 font-bold text-slate-500" :style="{ left: (currentLevel.aPx/2 - 6) + 'px' }">a</div>
              <div class="absolute -top-8 font-bold text-slate-500" :style="{ left: (currentLevel.aPx + currentLevel.bPx/2 - 6) + 'px' }">b</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- WHY Explanation -->
    <div v-if="showWhy" class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 mx-4">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Waarom is (a+b)² = a² + 2ab + b²?</h3>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
          <p class="text-slate-700 mb-3">Het vierkant heeft zijde (a+b), dus oppervlakte (a+b)².</p>
          <p class="text-slate-700 mb-3">Het is verdeeld in 4 delen: a² (groot vierkant), b² (klein vierkant), en <span class="font-bold text-amber-700">twee</span> rechthoeken ab.</p>
          <p class="text-slate-700">Die twee ab-rechthoeken samen = 2ab. Daarom is (a+b)² = a² + 2ab + b², niet a² + b².</p>
        </div>
        <button @click="showWhy = false; showReflection = true" class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          Begrepen! Reflectievraag
        </button>
      </div>
    </div>

    <!-- REFLECTION -->
    <div v-if="showReflection && !reflectionCorrect" class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 mx-4">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Reflectie</h3>
        <p class="text-slate-700 mb-4">Waarom heeft <span class="font-mono font-bold">(a+b)² = a² + 2ab + b²</span> een middelste term (2ab), maar <span class="font-mono font-bold">(a-b)(a+b) = a² - b²</span> niet?</p>
        <textarea v-model="reflectionAnswer" rows="2" placeholder="Wat is het verschil?" class="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 resize-none text-slate-800 mb-4"></textarea>
        <button @click="checkReflection" :disabled="!reflectionAnswer.trim()" class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          Bevestig
        </button>
      </div>
    </div>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
