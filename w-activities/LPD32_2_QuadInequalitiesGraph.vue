<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhChartLineUp,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Grafisch Oplossen: Tweedegraadsongelijkheden'
  },
  instruction: {
    type: String,
    default: 'Construeer het juiste oplossingsinterval voor de gegeven ongelijkheid. Pas de grenzen aan en geef aan of de grenzen erbij horen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhChartLineUp }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showPrediction = ref(true)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)
const showWhy = ref(false)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

// User state for interval
const userRoot1 = ref(-1)
const userRoot2 = ref(1)
const userIncluded = ref(true)
const userAbove = ref(true) // true = f(x) > 0 zone geselecteerd / false = f(x) < 0 zone

const sortedUserRoots = computed(() => {
  return [userRoot1.value, userRoot2.value].sort((a,b) => a-b)
})

function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function formatQuadratic(a, p, q) {
  const aStr = a === 1 ? '' : a === -1 ? '-' : a
  if (p === 0) {
    const qStr = q === 0 ? '' : (q < 0 ? ` - ${Math.abs(q)}` : ` + ${q}`)
    return `f(x) = ${aStr}x²${qStr}`
  }
  const pPart = p < 0 ? `(x + ${Math.abs(p)})` : `(x - ${p})`
  const qStr = q === 0 ? '' : (q < 0 ? ` - ${Math.abs(q)}` : ` + ${q}`)
  return `f(x) = ${aStr}${pPart}²${qStr}`
}

function generateLevel(levelIndex) {
  let a, p, q, targetRoots, targetIncluded, targetAbove

  if (levelIndex === 0) {
    // Level 1: Read from graph (simple, a=1, symmetric)
    a = 1; p = 0
    const qValues = [-1, -4, -9, -16]
    q = qValues[rng(0, qValues.length - 1)]
    const rootVal = Math.sqrt(-q)
    targetRoots = [-rootVal, rootVal].sort((a,b) => a-b)
    targetAbove = Math.random() < 0.5
    targetIncluded = Math.random() < 0.4
  } else if (levelIndex === 1) {
    // Level 2: Sketch then solve
    const aOptions = [1, -1]
    a = aOptions[rng(0, aOptions.length - 1)]
    const pairs = [[-1, 3], [0, 4], [-3, 1], [-4, 0], [-2, 2], [-5, -1]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    targetRoots = pair.sort((a,b) => a-b)
    targetAbove = Math.random() < 0.5
    targetIncluded = Math.random() < 0.5
  } else {
    // Level 3: Multi-step with a<0
    const aOptions = [-2, -1, -0.5, 0.5, 1, 2]
    a = aOptions[rng(0, aOptions.length - 1)]
    const pairs = [[-5, 1], [-3, 3], [-1, 5], [-6, 0], [-4, 2], [-2, 4], [-7, -1], [0, 6]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    targetRoots = pair.sort((a,b) => a-b)
    targetAbove = Math.random() < 0.5
    targetIncluded = Math.random() < 0.5
  }

  const formula = formatQuadratic(a, p, q)
  // Build inequality: if a > 0, parabola opens up (smiley). f(x) > 0 = outside, f(x) < 0 = between
  // If a < 0, parabola opens down. f(x) > 0 = between, f(x) < 0 = outside
  const betweenZeros = (a > 0 && !targetAbove) || (a < 0 && targetAbove)
  const inequalitySign = targetAbove ? '>' : '<'
  const inclusiveSign = targetIncluded ? (inequalitySign === '>' ? '≥' : '≤') : inequalitySign
  const inequality = `${formula} ${inclusiveSign} 0`

  return {
    formula,
    inequality,
    a, p, q,
    targetRoots,
    targetAbove,
    targetIncluded,
    targetBetween: betweenZeros,
    inequalitySign
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const graphPath = computed(() => {
  if (!currentLevelData.value) return ''
  const { a, p, q } = currentLevelData.value
  const points = []
  for (let x = -6; x <= 6; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q
    if (y < -8 || y > 8) continue
    const svgX = x * 20
    const svgY = -y * 20
    points.push(`${svgX},${svgY}`)
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : ''
})

// 3-level hints
function getHintText(count) {
  const t = currentLevelData.value
  if (!t) return ''
  if (count <= 1) {
    const zoneLabel = t.targetAbove ? 'boven de x-as (f(x) > 0)' : 'onder de x-as (f(x) < 0)'
    return `<strong>Hint 1:</strong> De nulwaarden zijn x = ${t.targetRoots[0]} en x = ${t.targetRoots[1]}.<br>Kijk naar de grafiek. De functie is ${t.targetAbove ? 'positief (boven de x-as)' : 'negatief (onder de x-as)'}.<br><span class="text-xs text-slate-500">Waar ligt de grafiek ${zoneLabel}? Bepaal de x-waarden.</span>`
  } else if (count <= 3) {
    const aboveBelow = t.a > 0 ? (t.targetAbove ? 'buiten de nulwaarden (links en rechts)' : 'tussen de nulwaarden') : (t.targetAbove ? 'tussen de nulwaarden' : 'buiten de nulwaarden (links en rechts)')
    return `<strong>Hint 2:</strong> Voorbeeld: f(x) = x² - 4.<br>Nulwaarden: x = -2 en x = 2.<br>f(x) < 0 ? Tussen -2 en 2 → ]-2, 2[<br>De parabool opent naar ${t.a > 0 ? 'boven (dal)' : 'beneden (berg)'}.<br>$f(x) ${t.targetAbove ? '>' : '<'} 0$ betekent: ${aboveBelow}.<br><span class="text-xs text-slate-500">Bij een dalparabool: f(x) > 0 links en rechts van de nulwaarden. Bij een bergparabool: f(x) > 0 tussen de nulwaarden.</span>`
  } else {
    const label = t.targetAbove ? 'f(x) > 0' : 'f(x) < 0'
    return `<strong>Hint 3:</strong> Nulwaarden: ${t.targetRoots[0]} en ${t.targetRoots[1]}.<br>a = ${t.a} (${t.a > 0 ? 'dal' : 'berg'}parabool).<br>${label} → het interval is: ___ &lt; x &lt; ___ (of x &lt; ___ of x &gt; ___).<br>Let op $\le$ vs $<$: ${t.targetIncluded ? 'gesloten (≤, ≥)' : 'open (<, >)'} intervallen.`
  }
}

function submitPrediction() {
  showPrediction.value = false
  feedback.value = { type: 'info', text: 'Stel het juiste interval op de x-as in.' }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function resetActivityState() {
  generateLevels()
  isCorrect.value = false
  celebrationDone.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: '' }
  showPrediction.value = true
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  showWhy.value = false

  userRoot1.value = -1
  userRoot2.value = 1
  userIncluded.value = true
  userAbove.value = true
}

function checkAnswer() {
  if (showPrediction.value || showReflection.value || isCorrect.value) return
  if (!currentLevelData.value) return
  attemptCount.value++

  const t = currentLevelData.value
  const rootsCorrect = sortedUserRoots.value[0] === t.targetRoots[0] && sortedUserRoots.value[1] === t.targetRoots[1]
  const aboveCorrect = userAbove.value === t.targetAbove
  const includedCorrect = userIncluded.value === t.targetIncluded

  // Determine if user chose correct "between/outside" zone relative to graph
  // userAbove = true means they selected the region where f(x) > 0
  // For a > 0: f(x) > 0 is outside roots; f(x) < 0 is between roots
  // For a < 0: f(x) > 0 is between roots; f(x) < 0 is outside roots
  // We already compare userAbove to targetAbove, so that handles this.

  if (rootsCorrect && aboveCorrect && includedCorrect) {
    isCorrect.value = true
    showWhy.value = true
    showReflection.value = true
    const zone = t.targetAbove ? 'boven de x-as' : 'onder de x-as'
    const intervalStr = t.targetAbove
      ? (t.a > 0 ? `x < ${t.targetRoots[0]} of x > ${t.targetRoots[1]}` : `${t.targetRoots[0]} < x < ${t.targetRoots[1]}`)
      : (t.a > 0 ? `${t.targetRoots[0]} < x < ${t.targetRoots[1]}` : `x < ${t.targetRoots[0]} of x > ${t.targetRoots[1]}`)
    feedback.value = {
      type: 'success',
      text: `Prima! Je hebt de ongelijkheid correct opgelost.<br><br><strong>Oplossing:</strong> ${intervalStr} waar f(x) ${zone} is.<br><br><strong>Waarom?</strong> Een tweedegraadsongelijkheid los je grafisch op door:<br>1. Nulwaarden berekenen (f(x) = 0)<br>2. Kijken waar f(x) > 0 (boven x-as) of f(x) < 0 (onder x-as)<br>3. De vorm van de parabool (a > 0 = dal, a < 0 = berg) bepaalt of de oplossing tussen of buiten de nulwaarden ligt.<br><span class="text-xs text-slate-500">Een schets maken helpt altijd!</span>`
    }
  } else {
    isCorrect.value = false
    showWhy.value = false

    // Error analysis
    const aboveBelowConfusion = aboveCorrect === false && rootsCorrect === true
    const signMixup = includedCorrect === false && rootsCorrect && aboveCorrect

    if (!rootsCorrect) {
      feedback.value = {
        type: 'error',
        text: `<strong>De nulwaarden kloppen niet.</strong> De snijpunten van de parabool met de x-as zijn x = ${t.targetRoots[0]} en x = ${t.targetRoots[1]}.<br><span class="text-xs text-slate-500">Zoek waar de grafiek de x-as snijdt.</span><br>${getHintText(attemptCount.value)}`
      }
    } else if (aboveBelowConfusion) {
      feedback.value = {
        type: 'error',
        text: `<strong>Let op of de grafiek boven of onder de x-as ligt!</strong><br>In de ongelijkheid staat f(x) ${t.targetAbove ? '>' : '<'} 0. Dat betekent: ${t.targetAbove ? 'boven de x-as (positief)' : 'onder de x-as (negatief)'}.<br>Jij hebt het ${userAbove ? 'bovenste' : 'onderste'} gedeelte geselecteerd, maar het moet het ${t.targetAbove ? 'bovenste' : 'onderste'} zijn.<br>${getHintText(0)}<br><span class="text-xs text-slate-500">Tip: een dalparabool (a>0) is positief buiten de nulwaarden. Een bergparabool (a<0) is positief tussen de nulwaarden.</span>`
      }
    } else if (signMixup) {
      feedback.value = {
        type: 'error',
        text: `<strong>Let op ≤ vs < (en ≥ vs >)!</strong><br>De nulwaarden moet${t.targetIncluded ? '' : ' niet'} meegerekend worden.<br>Ongelijkheid: ${t.inequality}.<br>${t.targetIncluded ? 'Gesloten bollen (≤, ≥) — nulwaarden horen erbij.' : 'Open bollen (<, >) — nulwaarden horen er niet bij.'}`
      }
    } else {
      feedback.value = {
        type: 'error',
        text: getHintText(attemptCount.value)
      }
    }
  }
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

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {})
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
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Voor een tweedegraadsfunctie f(x) = ax² + bx + c:<br>
                Waar is f(x) > 0?<br>
                <span class="text-xs text-slate-500">Boven of onder de x-as?</span>
              </p>
              <div class="text-xs text-amber-700 p-3 bg-white rounded border border-amber-200 mb-3">
                <strong>Tip:</strong> f(x) > 0 betekent: de grafiek ligt <strong>boven</strong> de x-as.<br>
                f(x) < 0 betekent: de grafiek ligt <strong>onder</strong> de x-as.<br>
                Bij een dalparabool (a > 0): f(x) > 0 links en rechts van de nulwaarden.<br>
                Bij een bergparabool (a < 0): f(x) > 0 <strong>tussen</strong> de nulwaarden.<br><br>
                <strong>Voorbeeld:</strong> x² - 4 < 0 → nulwaarden x = -2 en x = 2, f(x) < 0 tussen -2 en 2 → ]-2, 2[
              </div>
              <button @click="submitPrediction"
                      class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="!showPrediction" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <strong>x² - 4 &lt; 0</strong><br>
                Stap 1: x² - 4 = 0 → x² = 4 → x = -2 of x = 2<br>
                Stap 2: a = 1 > 0 → dalparabool → f(x) &lt; 0 <strong>tussen</strong> de nulwaarden<br>
                Stap 3: Oplossing: -2 &lt; x &lt; 2 → interval ]-2, 2[<br>
                <span class="font-bold">Nu jij: Los de ongelijkheid hieronder op met behulp van de grafiek.</span>
              </p>
            </div>

            <!-- INEQUALITY DISPLAY -->
            <div v-if="!showPrediction && currentLevelData" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-lg shadow-sm mb-4">
              <p class="text-sm font-bold text-amber-700 mb-1">Los op:</p>
              <p class="font-mono text-xl font-black text-amber-700">{{ currentLevelData.inequality }}</p>
            </div>

            <!-- CONTROLS -->
            <div v-if="!showPrediction" class="space-y-6 p-6 border-t border-slate-200 bg-slate-50 rounded-xl">

              <!-- Boundaries -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Grenzen instellen (Nulwaarden)</label>
                <div class="space-y-4">
                  <div>
                    <span class="text-xs font-bold text-slate-500">Grens 1 (x) = {{ sortedUserRoots[0] }}</span>
                    <input type="range" v-model.number="userRoot1" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-500">Grens 2 (x) = {{ sortedUserRoots[1] }}</span>
                    <input type="range" v-model.number="userRoot2" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                </div>
              </div>

              <!-- Above / Below toggle -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Waar ligt de oplossing?</label>
                <div class="flex gap-2">
                  <button @click="userAbove = true"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="userAbove ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Boven de x-as (f(x) > 0)
                  </button>
                  <button @click="userAbove = false"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="!userAbove ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Onder de x-as (f(x) < 0)
                  </button>
                </div>
              </div>

              <!-- Included/Excluded -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <label class="block font-bold text-slate-700 mb-2">Zijn de grenzen inbegrepen?</label>
                <div class="flex gap-2">
                  <button @click="userIncluded = true"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="userIncluded ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Ja (≤, ≥)
                  </button>
                  <button @click="userIncluded = false"
                          class="flex-1 py-2 rounded-lg font-bold border-2 transition-all text-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="!userIncluded ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'">
                    Nee (<, >)
                  </button>
                </div>
              </div>

              <!-- REFLECTION -->
              <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
                <div class="flex items-center gap-2 mb-3">
                  <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                  <span class="font-bold text-amber-800">Waarom?</span>
                </div>
                <p class="text-sm text-amber-800 mb-3">
                  Waarom is het belangrijk om een schets te maken van de parabool bij het oplossen van tweedegraadsongelijkheden?<br>
                  <span class="text-xs text-slate-500">Kan het zonder schets? Waarom wel/niet?</span>
                </p>
                <textarea v-model="reflectAns" rows="2"
                          class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Een schets helpt om te zien of de oplossing tussen of buiten de nulwaarden ligt..."></textarea>
                <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                        class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Bevestig
                </button>
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showPrediction" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-if="isCorrect && reflectDone" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-if="!isCorrect && !showPrediction && attemptCount === 0" class="flex-1 py-4 text-sm text-slate-400 text-center">
                Stel de waarden in en klik op Controleren
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="400" height="400" viewBox="-120 -120 240 240" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 13" :key="'v'+i" :x1="(i-7)*20" y1="-120" :x2="(i-7)*20" y2="120" />
                  <line v-for="i in 13" :key="'h'+i" x1="-120" :y1="(i-7)*20" x2="120" :y2="(i-7)*20" />
                </g>

                <!-- User Selected Interval -->
                <g v-if="currentLevelData">
                  <rect :x="sortedUserRoots[0]*20" y="-120" :width="(sortedUserRoots[1] - sortedUserRoots[0])*20" height="240" fill="#d97706" opacity="0.12" class="transition-all duration-300" />
                </g>

                <!-- Axes -->
                <line x1="-120" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-120" x2="0" y2="120" stroke="#64748b" stroke-width="2" />

                <!-- Graph -->
                <path v-if="currentLevelData" :d="graphPath" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-500" />

                <!-- Boundary Markers -->
                <circle :cx="sortedUserRoots[0]*20" cy="0" r="6" :fill="userIncluded ? '#d97706' : 'white'" :stroke="userIncluded ? 'none' : '#d97706'" stroke-width="3" class="transition-all duration-300 shadow-sm" />
                <circle :cx="sortedUserRoots[1]*20" cy="0" r="6" :fill="userIncluded ? '#d97706' : 'white'" :stroke="userIncluded ? 'none' : '#d97706'" stroke-width="3" class="transition-all duration-300 shadow-sm" />

                <text :x="sortedUserRoots[0]*20 - 4" y="-12" font-size="12" font-weight="bold" fill="#d97706">{{ sortedUserRoots[0] }}</text>
                <text :x="sortedUserRoots[1]*20 - 4" y="-12" font-size="12" font-weight="bold" fill="#d97706">{{ sortedUserRoots[1] }}</text>

              </svg>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
