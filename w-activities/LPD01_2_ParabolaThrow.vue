<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBasketball,
  PhArrowClockwise, PhPlay, PhLightbulb, PhQuestion, PhChatCircleText
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Fenomenen: De Basketbalworp' },
  instruction: { type: String, default: 'Stel de parabool y = a(x - p)^2 + q zo in dat je worp perfect in de basket belandt!' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhBasketball }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

// ---- State ----
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const hintLevel = ref(0)
const showHints = ref(false)

const feedback = ref({ type: 'info', text: 'Pas de parameters a, p en q aan om de parabool te vormen.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

// ---- Prediction gate ----
const predictionMade = ref(false)
const predictionChoice = ref(null)
const predictionOptions = computed(() => {
  const lvl = currentLevelData.value
  if (currentInternalLevel.value === 0) return [
    { id: 'easy', text: 'Ik kan de bal meteen in de basket krijgen' },
    { id: 'struggle', text: 'Ik moet de parameters enkele keren aanpassen' },
    { id: 'hard', text: 'Dit wordt moeilijk — ik moet precies mikken' }
  ]
  if (currentInternalLevel.value === 1) return [
    { id: 'further', text: 'Ik moet p vergroten want de basket staat verder' },
    { id: 'higher', text: 'Ik moet q verhogen voor een hogere boog' },
    { id: 'both', text: 'Ik moet zowel p als q aanpassen' }
  ]
  return [
    { id: 'over', text: 'Ik moet over de verdediger heen gaan, dus q moet hoog' },
    { id: 'around', text: 'Ik probeer langs de verdediger te gooien' },
    { id: 'steep', text: 'Een steile parabool met kleine a en hoge q' }
  ]
})

const predictionResult = ref('')

function confirmPrediction() {
  if (predictionChoice.value) {
    predictionMade.value = true
  }
}

function resetPrediction() {
  predictionMade.value = false
  predictionChoice.value = null
  predictionResult.value = ''
}

function checkPrediction() {
  const correct = isCorrect.value
  predictionResult.value = correct
    ? 'Je voorspelling klopt! Je hebt goed ingeschat wat er nodig was.'
    : 'Je voorspelling was anders dan de realiteit. Dat is oké — door te proberen leer je bij.' 
}

// ---- 3-level hints ----
const hintTexts = computed(() => {
  const lvl = currentLevelData.value
  if (currentInternalLevel.value === 0) return [
    'Tip 1: De top van de parabool (p, q) moet ongeveer bij de basket zijn. Begin met p en q dicht bij de basket-coördinaten.',
    'Tip 2: a bepaalt hoe wijd de parabool opent. Een waarde rond -0.5 geeft een realistische boog. Pas q aan om de hoogte te finetunen.',
    'Tip 3: Zet p op ' + lvl.basketX + ', q op ' + (lvl.basketY + 1) + ' en pas a aan tot ... (vul de ontbrekende waarde in).'
  ]
  if (currentInternalLevel.value === 1) return [
    'Tip 1: De basket staat verder dan bij level 1. Welke parameter moet je aanpassen voor de horizontale positie?',
    'Tip 2: p verschuift de parabool horizontaal. Zet p dichter bij de x-coordinaat van de basket. q moet hoog genoeg zijn.',
    'Tip 3: p = ' + lvl.basketX + ', q = ' + (lvl.basketY + 1) + ', a = ... (vul aan).'
  ]
  return [
    'Tip 1: De verdediger staat in de weg! Je bal moet eroverheen. Een hogere q-waarde helpt.',
    'Tip 2: Zet q minstens 2 eenheden hoger dan de verdediger. Maak a minder negatief (bv -0.3) voor een hogere boog.',
    'Tip 3: q = ' + (lvl.defenderY + 2) + ', a = ... (kies een waarde tussen -0.4 en -0.2), p = ' + lvl.basketX + '.'
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

// ---- Level generation ----
const aVal = ref(-0.5)
const pVal = ref(5)
const qVal = ref(5)
const isShooting = ref(false)
const ballX = ref(1)
const ballY = ref(3)

function generateLevel(index) {
  switch (index) {
    case 0: return {
      name: 'Level 1: Vrije Worp', basketX: Math.floor(Math.random() * 4) + 5,
      basketY: Math.floor(Math.random() * 2) + 2, hasDefender: false, defenderX: 0, defenderY: 0
    }
    case 1: return {
      name: 'Level 2: Driepunter', basketX: Math.floor(Math.random() * 4) + 8,
      basketY: Math.floor(Math.random() * 2) + 3, hasDefender: false, defenderX: 0, defenderY: 0
    }
    case 2: return {
      name: 'Level 3: Over de Verdediger', basketX: Math.floor(Math.random() * 3) + 8,
      basketY: Math.floor(Math.random() * 2) + 3, hasDefender: true,
      defenderX: Math.floor(Math.random() * 3) + 4, defenderY: Math.floor(Math.random() * 2) + 5
    }
    default: return { name: 'Level 1', basketX: 6, basketY: 3, hasDefender: false, defenderX: 0, defenderY: 0 }
  }
}

const levels = ref([ generateLevel(0), generateLevel(1), generateLevel(2) ])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// ---- Reflectie ----
const showReflection = ref(false)
const reflectionAnswers = ref(['', '', ''])
const reflectionQuestions = computed(() => [
  'Waarom bepaalt de parameter a of de bal de basket haalt of niet?',
  'Waarom moet je zowel p als q aanpassen als de basket verder weg staat?',
  'Waarom is een kwadratisch verband (parabool) geschikt om een worp te modelleren?'
])
const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false
    handleNextInternal()
  }
}

// ---- LPD Evidence ----
const showLPD = ref(false)
const lpdAnswer = ref('')
const lpdDone = ref(false)

const lpdQuestions = ['LPD 1: Contextrijke problemen oplossen met wiskundige modellen.']

function submitLPD() {
  if (lpdAnswer.value.length >= 20) {
    lpdDone.value = true
    emit('complete')
  }
}

function getLPDNumber() {
  return 1
}

// ---- Waarom werkt dit ----
const showWhy = ref(false)
const whyText = computed(() => {
  if (currentInternalLevel.value === 0) return [
    'Een parabool is de ideale baan voor een worp omdat de zwaartekracht een constante versnelling naar beneden geeft.',
    'De topvorm y = a(x - p)^2 + q maakt het makkelijk om de hoogte (q) en horizontale positie (p) van het hoogste punt in te stellen.'
  ]
  if (currentInternalLevel.value === 1) return [
    'Door p te vergroten verschuift de hele parabool naar rechts. Zo kun je de worp aanpassen aan de afstand.',
    'q blijft de maximale hoogte bepalen — onafhankelijk van de horizontale positie. Daarom heet dit de topvorm.'
  ]
  return [
    'Een smallere parabool (a dichter bij 0) geeft een hogere boog, handig om over hindernissen te gaan.',
    'De topvorm laat je elk aspect van de worp onafhankelijk aanpassen: hoogte, horizontale positie en vorm.'
  ]
})

// ---- Error analysis ----
function detectError(userA, userP, userQ, ballY_at_basket, basketY) {
  const errors = []
  if (ballY_at_basket > basketY + 0.5 && Math.abs(userA) > 0.8) {
    errors.push('Let op! De bal gaat te hoog. Maak a minder negatief (bv. -0.3) voor een hogere, wijdere boog.')
  }
  if (ballY_at_basket < basketY - 0.5 && Math.abs(userA) < 0.3) {
    errors.push('Let op! De bal gaat te laag. Maak a meer negatief (bv. -0.7) voor een steilere, lagere boog.')
  }
  if (ballY_at_basket < basketY - 1 && Math.abs(userP - basketY) > 3) {
    errors.push('Let op! p staat ver van de basket. De top van de parabool bepaalt waar de bal het hoogste punt bereikt. Zet p dichter bij de basket.')
  }
  if (errors.length === 0) {
    errors.push('Kijk naar de richting: een negatieve a opent naar beneden (correct voor een worp). Pas de parameters aan tot de curve door de basket gaat.')
  }
  return errors[0]
}

// ---- Core game logic ----
function shootBall() {
  if (isShooting.value) return
  isChecked.value = true
  isShooting.value = true
  let x = 1
  feedback.value = { type: 'info', text: 'Worp onderweg...' }
  const target = currentLevelData.value

  const interval = setInterval(() => {
    x += 0.15
    ballX.value = x
    ballY.value = aVal.value * Math.pow((x - pVal.value), 2) + qVal.value

    if (target.hasDefender && x > target.defenderX - 0.5 && x < target.defenderX + 0.5 && ballY.value < target.defenderY) {
      clearInterval(interval)
      attemptCount.value++
      isCorrect.value = false
      feedback.value = { type: 'error', text: detectError(aVal.value, pVal.value, qVal.value, ballY.value, target.basketY) + ' De bal werd geblokkeerd! Verhoog q.' }
      setTimeout(() => { isShooting.value = false; ballX.value = 1; ballY.value = 3 }, 2000)
      return
    }

    if (x >= target.basketX) {
      clearInterval(interval)
      if (Math.abs(ballY.value - target.basketY) < 0.4) {
        isCorrect.value = true
        attemptCount.value = 0
        showWhy.value = true
        checkPrediction()
        feedback.value = { type: 'success', text: 'Prima! SWISH! Perfecte parabool. De wiskunde klopt!' }
      } else {
        isCorrect.value = false
        attemptCount.value++
        feedback.value = { type: 'error', text: detectError(aVal.value, pVal.value, qVal.value, ballY.value, target.basketY) }
      }
      setTimeout(() => { isShooting.value = false; ballX.value = 1; ballY.value = 3 }, 2000)
      return
    }

    if (ballY.value < 0) {
      clearInterval(interval)
      isCorrect.value = false
      attemptCount.value++
      feedback.value = { type: 'error', text: 'Airball! De bal raakt de grond voor de basket. Zet p dichter bij ' + target.basketX + ' en q tussen ' + (target.basketY + 1) + ' en ' + (target.basketY + 3) + '.' }
      setTimeout(() => { isShooting.value = false; ballX.value = 1; ballY.value = 3 }, 2000)
    }
  }, 30)
}

function resetActivityState() {
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  hintLevel.value = 0
  showHints.value = false
  showWhy.value = false
  showReflection.value = false
  showLPD.value = false
  lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Pas de parameters a, p en q aan om de parabool te vormen.' }
  aVal.value = -0.5; pVal.value = 5; qVal.value = 5
  isShooting.value = false; ballX.value = 1; ballY.value = 3
  const lvl1 = generateLevel(0)
  const lvl2 = generateLevel(1)
  const lvl3 = generateLevel(2)
  levels.value = [lvl1, lvl2, lvl3]
  if (currentInternalLevel.value === 0) {
    aVal.value = -0.5; pVal.value = lvl1.basketX - 1; qVal.value = lvl1.basketY + 2
  }
}

function handleNextInternal() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    showReflection.value = false
    reflectionAnswers.value = ['', '', '']
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    showReflection.value = false
    showLPD.value = true
  }
}

function handleNext() {
  if (isCorrect.value && !showReflection.value) {
    showReflection.value = true
  } else if (showReflection.value && allReflectionsDone.value) {
    submitReflection()
  }
}

function closeActivity() { emit('close') }

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0; resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) closeActivity() })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    shouldPulse.value = false
  }
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="closeActivity"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">{{ !predictionMade ? 'Voorspel eerst!' : currentLevelData.name }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="closeActivity" class="p-2 text-slate-500 rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">

          <!-- Instruction -->
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <details class="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <summary class="font-bold text-amber-800 cursor-pointer text-sm">Voorbeeld — Stap voor Stap</summary>
            <div class="mt-3 text-sm space-y-2">
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Stel: de basket staat op (6, 3). We kiezen p = 6 (top horizontaal bij basket).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Kies q = 4 (top iets hoger dan basket, zodat de bal van boven komt).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Kies a = -0.5 (parabool opent naar beneden, realistische boog).</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Resultaat: y = -0.5(x - 6)^2 + 4 — de bal gaat door de basket!</p>
            </div>
          </details>

          <!-- Prediction Gate -->
          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">{{ currentInternalLevel === 0 ? 'Wat denk je? Hoe makkelijk wordt dit?' : currentInternalLevel === 1 ? 'Wat moet je aanpassen voor een verdere basket?' : 'Hoe ga je over de verdediger heen komen?' }}</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" />
                {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice"
              class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-500 transition-all">
              Bevestig Voorspelling
            </button>
          </div>

          <!-- Prediction result -->
          <div v-if="predictionResult && isCorrect" class="bg-emerald-50 rounded-xl p-3 border border-emerald-200 mb-4 text-xs">
            <p class="font-bold text-emerald-800">{{ predictionResult }}</p>
          </div>

          <!-- Main interface -->
          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <p class="font-bold text-amber-800 mb-2 text-sm">{{ currentLevelData.name }}</p>
              <div class="font-mono font-black text-xl text-slate-700 bg-white p-3 rounded-lg border text-center tabular-nums">
                y = <span class="text-amber-600">{{ aVal.toFixed(2) }}</span>(x - <span class="text-blue-600">{{ pVal }}</span>)² + <span class="text-emerald-600">{{ qVal }}</span>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <label class="text-xs font-bold text-amber-700 flex justify-between"><span>a (Opening)</span><span class="tabular-nums">{{ aVal.toFixed(2) }}</span></label>
                  <input type="range" min="-1.5" max="-0.05" step="0.05" v-model.number="aVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>
                <div>
                  <label class="text-xs font-bold text-blue-700 flex justify-between"><span>p (Horizontaal)</span><span class="tabular-nums">{{ pVal }}</span></label>
                  <input type="range" min="0" max="12" step="0.5" v-model.number="pVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div>
                  <label class="text-xs font-bold text-emerald-700 flex justify-between"><span>q (Hoogte)</span><span class="tabular-nums">{{ qVal }}</span></label>
                  <input type="range" min="0" max="12" step="0.5" v-model.number="qVal" :disabled="isCorrect || isShooting" class="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              </div>
            </div>

            <!-- Waarom werkt dit -->
            <div v-if="showWhy" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 animate-fadeIn">
              <h4 class="font-bold text-indigo-800 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(line, i) in whyText" :key="i" class="text-xs text-indigo-700 mb-1">{{ line }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <!-- Feedback -->
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span class="leading-snug">{{ feedback.text }}</span>
          </div>

          <!-- Buttons -->
          <div v-if="!predictionMade" class="flex gap-3">
            <button @click="closeActivity" class="flex-1 py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Sluiten</button>
          </div>

          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 shrink-0" title="Hint"><PhLightbulb weight="fill" /></button>
            <button v-if="!isCorrect" @click="shootBall" :disabled="isShooting"
              class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 flex items-center justify-center gap-2">
              <PhPlay weight="fill" /> Test Worp
            </button>
            <button v-else @click="handleNext" class="flex-1 py-3 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 animate-fadeIn">
              <span>Reflecteer</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>

          <!-- Reflectie -->
          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-800 text-sm">Reflectie</h4>
            <p class="text-xs text-indigo-600">Beantwoord deze vragen om je begrip te verdiepen.</p>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-700">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 border border-indigo-200 rounded-lg focus:border-indigo-500 bg-white resize-none"
                :placeholder="'Typ je antwoord (min 10 tekens)...'"></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone"
              class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-indigo-500 transition-all text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <!-- LPD Evidence -->
          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD {{ getLPDNumber() }}</h4>
            <p class="text-xs text-amber-700">{{ lpdQuestions[0] }}</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg focus:border-amber-500 bg-white resize-none"
              placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt (min 20 tekens)..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20"
              class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-amber-500 transition-all text-sm">
              Bevestig LPD {{ getLPDNumber() }}
            </button>
          </div>
        </div>
      </div>

      <!-- SVG Canvas -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="relative bg-[#f8fafc] shadow-md rounded-xl overflow-hidden border-4 border-slate-800">
            <svg width="600" height="500" viewBox="0 0 600 500" class="block">
              <g transform="translate(0, 500) scale(1, -1)">
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 13" :key="'v'+i" :x1="(i-1)*50" y1="0" :x2="(i-1)*50" y2="500" />
                  <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*50" x2="600" :y2="(i-1)*50" />
                </g>
                <g>
                  <line :x1="currentLevelData.basketX * 50 + 20" y1="0" :x2="currentLevelData.basketX * 50 + 20" y2="200" stroke="#64748b" stroke-width="6" />
                  <line :x1="currentLevelData.basketX * 50 + 20" :y1="currentLevelData.basketY * 50 - 30" :x2="currentLevelData.basketX * 50 + 20" :y2="currentLevelData.basketY * 50 + 50" stroke="#fef08a" stroke-width="8" />
                  <line :x1="currentLevelData.basketX * 50 - 20" :y1="currentLevelData.basketY * 50" :x2="currentLevelData.basketX * 50 + 20" :y2="currentLevelData.basketY * 50" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />
                </g>
                <g v-if="currentLevelData.hasDefender" class="animate-fadeIn">
                  <line :x1="currentLevelData.defenderX * 50" y1="0" :x2="currentLevelData.defenderX * 50" :y2="currentLevelData.defenderY * 50 - 20" stroke="#ef4444" stroke-width="12" stroke-linecap="round" />
                  <circle :cx="currentLevelData.defenderX * 50" :cy="currentLevelData.defenderY * 50 - 10" r="10" fill="#fca5a5" />
                </g>
                <g>
                  <circle cx="50" cy="120" r="15" fill="#3b82f6" />
                  <line x1="50" y1="105" x2="50" y2="40" stroke="#3b82f6" stroke-width="8" stroke-linecap="round" />
                </g>
                <polyline fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="10 5"
                  :points="Array.from({length: 120}, (_, i) => { const x = i * 0.1; const y = aVal * Math.pow((x - pVal), 2) + qVal; return `${x * 50},${y * 50}`; }).join(' ')" />
                <circle :cx="pVal * 50" :cy="qVal * 50" r="6" fill="#10b981" />
                <circle :cx="ballX * 50" :cy="ballY * 50" r="12" fill="#f97316" />
                <circle :cx="ballX * 50 - 3" :cy="ballY * 50 + 3" r="3" fill="rgba(255,255,255,0.4)" />
              </g>
            </svg>
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
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; border: 3px solid white; cursor: pointer; margin-top: -6px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; border-radius: 4px; }
</style>
