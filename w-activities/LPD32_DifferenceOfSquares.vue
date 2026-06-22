<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise, PhSealQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Merkwaardige Producten: (a+b)(a-b)' },
  instruction: { type: String, default: 'Ontdek waarom (a+b)(a-b) = a\u00b2 - b\u00b2 via een visuele voorstelling.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhSealQuestion }
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

// Worked example phase
const showWorkedExample = ref(false)

// Why explanation
const showWhy = ref(false)

// Reflection
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionCorrect = ref(false)
const reflectionChecked = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let a, b

  if (levelIndex === 0) {
    const pairs = [[2, 1], [3, 1], [3, 2], [4, 1], [4, 3], [5, 2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else if (levelIndex === 1) {
    const pairs = [[5, 3], [6, 2], [7, 4], [8, 3], [5, 4], [7, 2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  } else {
    const pairs = [[9, 5], [10, 7], [8, 5], [11, 6], [12, 5], [9, 4]]
    const pair = pairs[rng(0, pairs.length - 1)]
    a = pair[0]; b = pair[1]
  }

  const formula = `(${a}+${b})(${a}-${b})`
  const result = `${a*a} - ${b*b} = ${a*a - b*b}`
  return { a, b, formula, result, answer: 'a\u00b2 - b\u00b2' }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

// Visual state
const isAnnihilated = ref(false)
const userAns = ref('')
const isChecked = ref(false)

const numericResult = computed(() => currentLevel.value.a * currentLevel.value.a - currentLevel.value.b * currentLevel.value.b)

// Hint levels (3-level pattern)
const hintLevels = [
  // Hint 1: conceptual direction
  `Kijk naar (${currentLevel.value.a}+${currentLevel.value.b})(${currentLevel.value.a}-${currentLevel.value.b}). Werk uit: a\u00b2 - ab + ab - b\u00b2. Wat valt op aan de middelste termen?`,
  // Hint 2: worked example with different numbers
  `Voorbeeld: (5+2)(5-2) = 5\u00b2 - 10 + 10 - 2\u00b2 = 25 - 4 = 21. De middelste termen (-10 en +10) vallen weg. Pas dit toe op jouw getallen.`,
  // Hint 3: step-by-step with blank
  `(a+b)(a-b) = a\u00b2 - ab + ab - b\u00b2 = a\u00b2 + __ - b\u00b2 = a\u00b2 - b\u00b2`
]

function annihilateTerms() {
  if (isCorrect.value) return
  isAnnihilated.value = true
  feedback.value = { type: 'success', text: `BAM! -${currentLevel.value.a}\u00b7${currentLevel.value.b} en +${currentLevel.value.b}\u00b7${currentLevel.value.a} (${-currentLevel.value.a * currentLevel.value.b} en ${currentLevel.value.b * currentLevel.value.a}) heffen elkaar op!` }
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
    if (isAnnihilated.value) {
      isCorrect.value = true
      showWhy.value = true
      feedback.value = {
        type: 'success',
        text: `Super! (${currentLevel.value.formula}) = ${currentLevel.value.result}. Altijd a\u00b2 - b\u00b2.`
      }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Voer eerst de botsing uit om te zien wat er gebeurt!' }
    }
  } else if (userAns.value === 'wrong1') {
    attemptCount.value++
    // Error analysis: confusing (a-b)² with a²-b²
    feedback.value = {
      type: 'error',
      text: 'Let op! (a-b)² = a² - 2ab + b² is iets anders. Hier hebben we (a+b)(a-b), geen kwadraat van een tweeterm.'
    }
  } else if (userAns.value === 'wrong2') {
    attemptCount.value++
    feedback.value = {
      type: 'error',
      text: 'Bijna! -ab + ab = 0. Die termen verdwijnen compleet. Wat blijft er over?'
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
    feedback.value = { type: 'info', text: 'Klik op "Botsing" om de tegengestelde termen te zien vernietigen.' }
  }
}

function checkReflection() {
  reflectionChecked.value = true
  const ans = reflectionAnswer.value.toLowerCase()
  if (ans.includes('geen') || ans.includes('niet') || ans.includes('0') || ans.includes('nul') || ans.includes('kan niet') || ans.includes('onmogelijk')) {
    reflectionCorrect.value = true
  } else if (ans.includes('ab') || ans.includes('middel')) {
    reflectionCorrect.value = true
  } else if (ans.length > 15) {
    reflectionCorrect.value = true
  } else {
    feedback.value = { type: 'error', text: 'Denk erover na: als a en b geen kwadraten zijn, kun je de formule dan nog steeds toepassen?' }
    return
  }
  feedback.value = { type: 'success', text: 'Juist! De formule werkt voor alle getallen, zolang je (a+b)(a-b) herkent.' }
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
  isAnnihilated.value = false
  attemptCount.value = 0
  hintCount.value = 0
  showWhy.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionCorrect.value = false
  reflectionChecked.value = false
  feedback.value = { type: 'info', text: '' }
  userAns.value = ''

  // Prediction phase for level 1 only, then skip for subsequent levels
  if (currentInternalLevel.value === 0) {
    predictionPhase.value = true
    prediction.value = ''
  } else {
    predictionPhase.value = false
  }
  showWorkedExample.value = currentInternalLevel.value === 0
}

function goToReflection() {
  showReflection.value = true
  showWhy.value = false
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
          <PhSealQuestion weight="fill" class="w-8 h-8 text-amber-500" />
          <h3 class="text-xl font-bold text-slate-800">Voorspel eerst</h3>
        </div>
        <p class="text-slate-700 mb-4 text-lg">Wat denk je dat <span class="font-mono font-bold text-amber-700">(x+2)(x-2)</span> is?</p>
        <p class="text-sm text-slate-500 mb-6">Schrijf je voorspelling op. Na het experiment zien we of je gelijk had.</p>
        <textarea v-model="prediction" rows="2" placeholder="Typ je antwoord..." class="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 resize-none text-slate-800"></textarea>
        <button @click="submitPrediction" :disabled="!prediction.trim()" class="mt-4 w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          Ik heb een voorspelling
        </button>
      </div>
    </div>

    <!-- WORKED EXAMPLE (shown before interaction) -->
    <div v-else-if="showWorkedExample" class="flex-1 flex items-center justify-center p-8 bg-slate-50">
      <div class="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <span class="text-amber-700 font-bold text-sm">VB</span>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Voorbeeld</h3>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <p class="text-slate-700"><span class="font-mono font-bold">(5+3)(5-3)</span></p>
          <p class="text-slate-700">= 5&sup2; - 5&middot;3 + 3&middot;5 - 3&sup2;</p>
          <p class="text-slate-700">= 25 - 15 + 15 - 9</p>
          <p class="text-slate-700">= 25 - 9 <span class="text-amber-600 font-bold">(de -15 en +15 vallen weg)</span></p>
          <p class="text-slate-700">= <span class="font-mono font-bold text-amber-700">16</span></p>
        </div>
        <p class="text-sm text-slate-500 mt-4 mb-6">Zie je hoe de middelste termen elkaar opheffen? Probeer het nu zelf.</p>
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
            <p class="text-sm font-bold text-amber-700 mb-1">Bereken:</p>
            <p class="font-mono text-2xl font-black text-slate-800">{{ currentLevel.formula }}</p>
          </div>

          <!-- Visual: Botsing button -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <p class="text-sm font-bold text-slate-700 mb-3">Stap 1: Vernietig de tegengestelden</p>
            <button @click="annihilateTerms" :disabled="isCorrect || isAnnihilated"
              class="w-full py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              Botsing: Vernietig -ab en +ab
            </button>
          </div>

          <!-- Conclusie -->
          <div class="p-4 bg-white border border-slate-200 rounded-xl">
            <label class="block text-sm font-bold text-slate-700 mb-2">Stap 2: Wat is de formule?</label>
            <select v-model="userAns" :disabled="isCorrect" class="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 font-bold text-slate-700 bg-white">
              <option value="" disabled>Kies de juiste formule...</option>
              <option value="wrong2">a&sup2; - a&sup2;b&sup2; - b&sup2;</option>
              <option value="wrong1">a&sup2; - 2ab + b&sup2;</option>
              <option value="correct">a&sup2; - b&sup2;</option>
            </select>
          </div>

          <!-- Hint button -->
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
              Waarom werkt dit?
            </button>

            <button v-if="reflectionCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual Area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-8 items-center justify-center">
          <div class="w-full max-w-xl">
            <div class="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <!-- Formula display -->
              <div class="text-center mb-8">
                <p class="font-mono text-3xl font-black text-slate-800">{{ currentLevel.formula }}</p>
              </div>

              <!-- Visual animation -->
              <div class="relative h-40 bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-between px-8 overflow-hidden">
                <!-- a² term -->
                <div class="w-20 h-20 flex items-center justify-center rounded-lg border-2 border-amber-500 bg-amber-50 shadow-sm transition-all duration-700" :class="isAnnihilated ? 'translate-x-6' : ''">
                  <span class="font-black text-lg text-amber-700">{{ currentLevel.a }}&sup2;</span>
                </div>

                <!-- -ab term (vanishing) -->
                <div class="absolute left-[28%] w-20 h-20 flex items-center justify-center rounded-lg border-2 border-red-400 bg-red-50 shadow-sm transition-all duration-700" :class="isAnnihilated ? 'translate-x-24 opacity-0 scale-50 rotate-45' : ''">
                  <span class="font-black text-sm text-red-600">-{{ currentLevel.a }}{{ currentLevel.b }}</span>
                </div>

                <!-- +ab term (vanishing) -->
                <div class="absolute right-[28%] w-20 h-20 flex items-center justify-center rounded-lg border-2 border-amber-300 bg-amber-50 shadow-sm transition-all duration-700" :class="isAnnihilated ? '-translate-x-24 opacity-0 scale-50 -rotate-45' : ''">
                  <span class="font-black text-sm text-amber-600">+{{ currentLevel.b }}{{ currentLevel.a }}</span>
                </div>

                <!-- -b² term -->
                <div class="w-20 h-20 flex items-center justify-center rounded-lg border-2 border-amber-600 bg-amber-50 shadow-sm transition-all duration-700" :class="isAnnihilated ? '-translate-x-6' : ''">
                  <span class="font-black text-lg text-amber-700">-{{ currentLevel.b }}&sup2;</span>
                </div>
              </div>

              <!-- Result after annihilation -->
              <div v-if="isAnnihilated" class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fadeIn">
                <p class="text-sm text-slate-600 text-center">
                  <span class="font-bold text-amber-700">-ab + ab = 0.</span>
                  De middelste termen verdwijnen. Enkel <span class="font-mono font-bold text-amber-700">{{ currentLevel.a }}&sup2; - {{ currentLevel.b }}&sup2;</span> blijft over!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- WHY Explanation -->
    <div v-if="showWhy" class="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 mx-4">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Waarom heffen -ab en +ab elkaar op?</h3>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
          <p class="text-slate-700 mb-3">(a+b)(a-b) = a&sup2; - ab + ba - b&sup2;</p>
          <p class="text-slate-700 mb-3">Omdat <span class="font-bold text-amber-700">ab = ba</span> (vermenigvuldigen is commutatief), zijn -ab en +ab precies tegengesteld.</p>
          <p class="text-slate-700">Ze sommeren tot 0. Daarom blijft enkel <span class="font-mono font-bold text-amber-700">a&sup2; - b&sup2;</span> over. Dit noemen we het <span class="font-bold">merkwaardig product (a+b)(a-b) = a&sup2; - b&sup2;</span>.</p>
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
        <p class="text-slate-700 mb-4">Wat gebeurt er als a en b <span class="font-bold">geen kwadraten</span> zijn? Bijvoorbeeld (x+1)(x-1) of (3+&radic;2)(3-&radic;2)? Werkt de formule dan nog?</p>
        <textarea v-model="reflectionAnswer" rows="2" placeholder="Wat denk je?" class="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 resize-none text-slate-800 mb-4"></textarea>
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
