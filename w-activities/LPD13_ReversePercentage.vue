<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPercent, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Procenten: Terugrekenen' },
  instruction: { type: String, default: 'Gebruik het strokenmodel (Bar Model) om de originele prijs te berekenen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhPercent }
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
const feedback = ref({ type: 'info', text: 'Kijk naar de strook.' })
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
const predictionOptions = computed(() => {
  if (currentInternalLevel.value === 0) return [
    { id: 'divide', text: 'Ik deel eerst om 1 blokje te vinden' },
    { id: 'multiply', text: 'Ik vermenigvuldig de nieuwe prijs met het percentage' },
    { id: 'guess', text: 'Ik raad de originele prijs' }
  ]
  return [
    { id: 'moreblocks', text: 'Ik bereken weer per blokje, maar met meer blokjes' },
    { id: 'formula', text: 'Ik gebruik een vaste formule' },
    { id: 'different', text: 'Ik doe iets anders' }
  ]
})
const reflectionQuestions = computed(() => [
  'Waarom moet je eerst 1 blokje (1%) berekenen voor je de 100% kunt vinden?',
  'Waarom is terugrekenen via het strokenmodel makkelijker dan een formule onthouden?',
  'Waarom daalt de originele prijs niet met hetzelfde bedrag als de korting?'
])

const levels = ref([])

function generateLevel() {
  const nl = []
  const pp1 = [15, 20, 25, 30][Math.floor(Math.random() * 4)]
  nl.push({
    goalText: `Na 25% korting kost een artikel nog €${3 * pp1}. Wat was de beginprijs?`,
    discountPercent: 25, newPrice: 3 * pp1, blocksTotal: 4, blocksRemaining: 3,
    ansBlockExact: pp1, ansTotalExact: 4 * pp1,
    blockPct: 25
  })
  const pp2 = [40, 50, 75, 100][Math.floor(Math.random() * 4)]
  nl.push({
    goalText: `Na 20% korting kost een artikel nog €${4 * pp2}. Wat was de beginprijs?`,
    discountPercent: 20, newPrice: 4 * pp2, blocksTotal: 5, blocksRemaining: 4,
    ansBlockExact: pp2, ansTotalExact: 5 * pp2,
    blockPct: 20
  })
  const pp3 = [8, 10, 12, 15][Math.floor(Math.random() * 4)]
  nl.push({
    goalText: `Na 40% korting kost een artikel nog €${3 * pp3}. Wat was de beginprijs?`,
    discountPercent: 40, newPrice: 3 * pp3, blocksTotal: 5, blocksRemaining: 3,
    ansBlockExact: pp3, ansTotalExact: 5 * pp3,
    blockPct: 20
  })
  return nl
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const ansBlock = ref(null)
const ansTotal = ref(null)

const hintTexts = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']
  return [
    `Tip 1: De overgebleven prijs (€${d.newPrice}) stelt ${d.blocksRemaining * d.blockPct}% voor. Hoeveel is 1 blokje (${d.blockPct}%)?`,
    `Tip 2: ${d.blocksRemaining} blokjes = €${d.newPrice}. Deel €${d.newPrice} door ${d.blocksRemaining}.`,
    `Tip 3: 1 blokje = €${d.newPrice} ÷ ${d.blocksRemaining} = ... (vul in). De originele prijs = ... × ${d.blocksTotal} (vul het bedrag van 1 blokje in).`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function detectError(block, total) {
  const d = currentLevelData.value
  if (!d) return null
  if (total === d.newPrice) return 'Let op! De nieuwe prijs is niet de originele prijs. Je moet de originele 100% vinden, niet wat er overblijft.'
  if (block === d.newPrice) return 'Let op! 1 blokje is niet de nieuwe prijs. Deel de nieuwe prijs door het aantal blokjes.'
  if (block && total && block * d.blocksTotal !== total && total === d.ansTotalExact) return null
  return null
}

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  const d = currentLevelData.value
  const specific = detectError(ansBlock.value, ansTotal.value)
  if (ansBlock.value === d.ansBlockExact && ansTotal.value === d.ansTotalExact) {
    isCorrect.value = true; showWhy.value = true
    feedback.value = { type: 'success', text: `Briljant! 1 blokje = €${d.ansBlockExact}. Origineel = ${d.blocksTotal} × €${d.ansBlockExact} = €${d.ansTotalExact}.` }
  } else {
    isCorrect.value = false
    if (specific) feedback.value = { type: 'error', text: specific }
    else if (ansBlock.value !== d.ansBlockExact) feedback.value = { type: 'error', text: `Fout in stap 1. ${d.blocksRemaining} blokjes = €${d.newPrice}. Deel om 1 blokje te vinden.` }
    else feedback.value = { type: 'error', text: `Fout in stap 2. 1 blokje = €${d.ansBlockExact}. Origineel = ${d.blocksTotal} × dit bedrag.` }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; isChecked.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Kijk naar de strook.' }
  ansBlock.value = null; ansTotal.value = null
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
  'Het strokenmodel verdeelt 100% in gelijke blokjes. Elk blokje is evenveel waard.',
  'Door eerst de waarde van 1 blokje te vinden (delen), kun je daarna de totale 100% berekenen (vermenigvuldigen).'
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
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Na 25% korting kost een jas €60. Wat was de oorspronkelijke prijs?</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 100% - 25% = 75% = €60. 75% = 3 blokjes van 25%.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> 1 blokje (25%) = €60 ÷ 3 = €20.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Originele prijs (100%) = 4 × €20 = €80.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe ga je de originele prijs vinden?</p>
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
            <div class="p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-bold text-amber-700">Stap 1: Waarde van 1 blokje</label>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="font-black text-lg text-slate-500">€</span>
                    <input type="number" v-model.number="ansBlock" placeholder="?" :disabled="isCorrect"
                      class="w-full font-bold text-xl p-2 border border-amber-300 rounded-lg text-center bg-white tabular-nums" />
                  </div>
                </div>
                <div class="border-t border-amber-200 pt-3">
                  <label class="text-sm font-bold text-amber-700">Stap 2: Originele prijs (100%)</label>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="font-black text-2xl text-slate-500">€</span>
                    <input type="number" v-model.number="ansTotal" placeholder="..." :disabled="isCorrect"
                      class="w-full font-bold text-2xl p-3 border-2 border-amber-400 rounded-lg text-center bg-white tabular-nums" />
                  </div>
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
            <button v-if="!isCorrect" @click="checkAnswer" :disabled="ansBlock === null || ansTotal === null"
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
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 13</h4>
            <p class="text-xs text-amber-700">LPD 13: Rekenen met procenten — terugrekenen naar 100%.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 13</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl relative" v-if="currentLevelData">
            <div class="flex h-24 border-4 border-slate-700 rounded-xl shadow-md bg-white relative overflow-hidden">
              <div v-for="i in currentLevelData.blocksRemaining" :key="'b'+i" class="border-r-2 border-slate-700 bg-amber-400 relative flex items-center justify-center"
                :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                <span class="font-bold text-white/80 text-sm">{{ currentLevelData.blockPct }}%</span>
              </div>
              <div v-for="i in (currentLevelData.blocksTotal - currentLevelData.blocksRemaining)" :key="'d'+i" class="border-r-2 border-slate-700 bg-red-100 relative flex items-center justify-center"
                :style="{ width: `${100 / currentLevelData.blocksTotal}%` }">
                <span class="font-bold text-red-500 text-sm bg-white/80 px-2 rounded-lg">{{ currentLevelData.blockPct }}% (Korting)</span>
              </div>
            </div>
            <div class="mt-6 text-center">
              <span class="bg-amber-100 px-6 py-3 rounded-full font-black text-xl text-amber-700 shadow-sm border border-amber-200">
                Nieuw = €{{ currentLevelData.newPrice }}
              </span>
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
