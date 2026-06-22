<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCalculator, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Schatten: De Kapotte Rekenmachine' },
  instruction: { type: String, default: 'Rond af naar makkelijke getallen om te schatten of het rekenmachine-antwoord klopt.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCalculator }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintLevel = ref(0)
const showHints = ref(false)
const feedback = ref({ type: 'info', text: 'Rond de getallen af en beoordeel het antwoord.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswers = ref(['', '', ''])
const showLPD = ref(false)
const lpdAnswer = ref('')
const lpdDone = ref(false)

const predictionMade = ref(false)
const predictionChoice = ref(null)
const predictionOptions = computed(() => [
  { id: 'correct', text: 'De rekenmachine heeft waarschijnlijk gelijk' },
  { id: 'wrong', text: 'De rekenmachine heeft waarschijnlijk ongelijk' },
  { id: 'unsure', text: 'Ik moet eerst een schatting maken om te oordelen' }
])
const reflectionQuestions = computed(() => [
  'Waarom is afronden naar een tiental een goede strategie om te schatten?',
  'Waarom kun je niet blind vertrouwen op een rekenmachine?',
  'Waarom is schatten een vaardigheid die je ook buiten wiskunde nodig hebt?'
])

const levels = ref([])

function generateLevel() {
  const nl = []
  const ops = ['+', '-', '×']
  for (let i = 0; i < 3; i++) {
    let n1, n2, op, real, wrong, isNonsense, round1, round2
    if (i === 0) {
      n1 = 20 + Math.floor(Math.random() * 60); n2 = 10 + Math.floor(Math.random() * 40)
      op = ops[Math.floor(Math.random() * 3)]
      real = op === '+' ? n1 + n2 : op === '-' ? n1 - n2 : n1 * n2
      wrong = op === '+' ? n1 + n2 + 100 : op === '-' ? n1 + n2 : n1 * n2 * 10
      isNonsense = Math.random() > 0.5
      round1 = Math.round(n1 / 10) * 10; round2 = Math.round(n2 / 5) * 5; if (round2 === 0) round2 = n2
    } else if (i === 1) {
      n1 = 80 + Math.floor(Math.random() * 121); n2 = 20 + Math.floor(Math.random() * 60)
      op = '−'; real = n1 - n2; wrong = n1 + n2
      isNonsense = Math.random() > 0.5
      round1 = Math.round(n1 / 10) * 10; round2 = Math.round(n2 / 10) * 10
    } else {
      n1 = 10 + Math.floor(Math.random() * 20); n2 = 3 + Math.floor(Math.random() * 8)
      op = '×'; real = n1 * n2; wrong = n1 * n2 * 10
      isNonsense = Math.random() > 0.5
      round1 = Math.round(n1 / 5) * 5; if (round1 === 0) round1 = n1; round2 = n2
    }
    const calcAns = isNonsense ? wrong : real
    nl.push({
      goalText: `Opdracht ${i+1}: ${op === '+' ? 'Optellen' : op === '-' ? 'Aftrekken' : 'Vermenigvuldigen'}`,
      num1: n1, num2: n2, op: op === '+' ? '+' : op === '-' ? '−' : '×',
      calcAns, targetRound1: round1, targetRound2: round2,
      targetVerdict: isNonsense ? 'nonsense' : 'correct',
      realAns: real
    })
  }
  return nl
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userRound1 = ref(null)
const userRound2 = ref(null)
const userVerdict = ref('')

const hintTexts = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']
  return [
    `Tip 1: Rond ${d.num1} af naar het dichtstbijzijnde tiental.`,
    `Tip 2: ${d.targetRound1} ${d.op} ${d.targetRound2} ≈ ${d.op === '+' ? d.targetRound1 + d.targetRound2 : d.op === '−' ? d.targetRound1 - d.targetRound2 : d.targetRound1 * d.targetRound2}. Ligt ${d.calcAns} in de buurt?`,
    `Tip 3: De schatting is ... (vul in). Vergelijk dit met ${d.calcAns}. Klopt het of is het onzin?`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError(v1, v2, verdict) {
  const d = currentLevelData.value
  if (!d) return null
  if (v1 === d.num1 || v2 === d.num2) return 'Let op! Je moet de getallen AFronden, niet de originele waarden gebruiken. Rond naar een makkelijk tiental.'
  if (verdict !== '' && v1 === d.targetRound1 && v2 === d.targetRound2 && verdict !== d.targetVerdict) {
    return d.realAns === d.calcAns
      ? 'Let op! Het antwoord lijkt misschien vreemd, maar de rekenmachine heeft gelijk! De schatting ligt in de buurt.'
      : 'Let op! Het antwoord is veel te groot/klein vergeleken met je schatting. Dat is ONZIN!'
  }
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const d = currentLevelData.value
  const specific = detectError(userRound1.value, userRound2.value, userVerdict.value)
  if (userRound1.value === d.targetRound1 && userRound2.value === d.targetRound2 && userVerdict.value === d.targetVerdict) {
    isCorrect.value = true; showWhy.value = true
    feedback.value = { type: 'success', text: d.targetVerdict === 'nonsense' ? `Geweldig! ${d.targetRound1} ${d.op} ${d.targetRound2} ≈ ${d.op === '+' ? d.targetRound1 + d.targetRound2 : d.op === '−' ? d.targetRound1 - d.targetRound2 : d.targetRound1 * d.targetRound2}. ${d.calcAns} is ONZIN!` : `Goed zo! Schatting klopt met het echte antwoord ${d.calcAns}.` }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else if (userRound1.value !== d.targetRound1) feedback.value = { type: 'error', text: `Rond ${d.num1} af naar een tiental.` }
    else if (userRound2.value !== d.targetRound2) feedback.value = { type: 'error', text: `Rond ${d.num2} af naar een mooi getal.` }
    else feedback.value = { type: 'error', text: 'Beoordeel het rekenmachine-antwoord: KLOPT of ONZIN?' }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Rond de getallen af en beoordeel.' }
  userRound1.value = null; userRound2.value = null; userVerdict.value = ''
}

const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function handleNext() {
  if (isCorrect.value && !showReflection.value) { showReflection.value = true }
  else if (showReflection.value && allReflectionsDone.value) { submitReflection() }
}

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false; reflectionAnswers.value = ['', '', '']
    if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
    else { showLPD.value = true }
  }
}

function submitLPD() { if (lpdAnswer.value.length >= 20) { lpdDone.value = true; emit('complete') } }

const whyText = computed(() => [
  'Door getallen af te ronden naar tientallen worden berekeningen eenvoudig genoeg voor hoofdrekenen.',
  'Een snelle schatting vertelt je of een rekenmachine-antwoord realistisch is of onzin.'
])

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
    nextTick(() => mainArea.value?.focus()); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { shouldPulse.value = false }
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <details class="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <summary class="font-bold text-amber-800 cursor-pointer text-sm">Voorbeeld — Stap voor Stap</summary>
            <div class="mt-3 text-sm space-y-2">
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Rekenmachine zegt: 72 × 8 = 5760. Klopt dat?</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Rond af: 72 ≈ 70, 8 blijft 8. Schatting: 70 × 8 = 560.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 5760 is véél groter dan 560. ONZIN! Het juiste antwoord is 576.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Wat denk je van het rekenmachine-antwoord?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig Voorspelling</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p class="font-bold text-amber-800 text-sm">{{ currentLevelData.goalText }}</p>
            </div>
            <div class="p-4 border border-amber-200 bg-amber-50 rounded-xl space-y-3">
              <div>
                <label class="text-sm font-bold text-amber-700">Stap 1: Schatting</label>
                <div class="flex items-center gap-2 mt-1">
                  <input type="number" v-model.number="userRound1" :placeholder="`${currentLevelData.num1}`" :disabled="isCorrect"
                    class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg text-center bg-white tabular-nums" />
                  <span class="font-black text-slate-400">{{ currentLevelData.op }}</span>
                  <input type="number" v-model.number="userRound2" :placeholder="`${currentLevelData.num2}`" :disabled="isCorrect"
                    class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg text-center bg-white tabular-nums" />
                </div>
              </div>
              <div>
                <label class="text-sm font-bold text-amber-700">Stap 2: Beoordeling</label>
                <div class="flex gap-2 mt-1">
                  <button @click="userVerdict = 'correct'" :disabled="isCorrect"
                    class="flex-1 py-2 rounded-lg font-bold border-2 text-xs"
                    :class="userVerdict === 'correct' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-600'">KLOPT</button>
                  <button @click="userVerdict = 'nonsense'" :disabled="isCorrect"
                    class="flex-1 py-2 rounded-lg font-bold border-2 text-xs"
                    :class="userVerdict === 'nonsense' ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-600'">ONZIN</button>
                </div>
              </div>
            </div>
            <div v-if="showWhy" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 animate-fadeIn">
              <h4 class="font-bold text-indigo-800 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(l, i) in whyText" :key="i" class="text-xs text-indigo-700 mb-1">{{ l }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-100': feedback.type === 'success', 'bg-red-100': feedback.type === 'error', 'bg-blue-100': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

          <div v-if="!predictionMade">
            <button @click="emit('close')" class="w-full py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-lg">Sluiten</button>
          </div>
          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg shrink-0"><PhLightbulb weight="fill" /></button>
            <div v-if="showHints" class="bg-amber-100 p-2 rounded-lg text-xs text-amber-800 animate-fadeIn flex-1">{{ hintTexts[hintLevel] }}</div>
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="userRound1 === null || userRound2 === null || userVerdict === ''"
              class="flex-1 py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50">Controleer</button>
            <button v-else @click="handleNext" class="flex-1 py-3 font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500">Reflecteer <PhArrowRight weight="bold" class="inline" /></button>
          </div>

          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-800 text-sm">Reflectie</h4>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-700">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 border border-indigo-200 rounded-lg bg-white resize-none" placeholder="Min 10 tekens..."></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 17</h4>
            <p class="text-xs text-amber-700">LPD 17: Hoofdrekenen en schatten van bewerkingen.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 17</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-72 bg-slate-800 rounded-xl p-6 shadow-md border-b-8 border-slate-900 flex flex-col">
            <div class="h-28 bg-[#a3c2b8] rounded-xl border-4 border-slate-700 shadow-inner flex flex-col p-4 mb-6 overflow-hidden">
              <span class="text-[10px] font-mono text-slate-600 font-bold">MATH</span>
              <span class="text-right text-base font-mono text-slate-600 mb-1">{{ currentLevelData.num1 }} {{ currentLevelData.op }} {{ currentLevelData.num2 }}</span>
              <span class="text-right text-3xl font-mono text-slate-800 font-black mt-auto tracking-widest tabular-nums">{{ currentLevelData.calcAns }}</span>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <div v-for="k in 16" :key="k" class="w-full aspect-square rounded-lg shadow-sm border-b-4"
                :class="k % 4 === 0 ? 'bg-amber-500 border-amber-600' : (k <= 4 ? 'bg-slate-600 border-slate-700' : 'bg-slate-300 border-slate-400')"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
