<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTarget, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Grafisch Oplossen' },
  instruction: { type: String, default: 'Los vergelijkingen en ongelijkheden grafisch op door het snijpunt van grafieken te vinden.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhTarget }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedX = ref(null)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

// User state
const scanX = ref(-4)
const y1 = ref(0)
const y2 = ref(0)
const userClaimsNoIntersection = ref(false)
const hintCount = ref(0)

function generateLevel() {
  const levels = []

  // Level 1: solve f(x) = c (horizontal line intersection)
  let l1_a, l1_c, l1_target, l1_x
  do {
    l1_a = pickRandom([1, 2, -1, -2, 0.5, -0.5])
    l1_c = pickRandom([-3, -2, -1, 1, 2, 3, 4])
    l1_b = pickRandom([-2, -1, 0, 1, 2])
    const l1_fn = (x) => l1_a * x + l1_b
    l1_x = (l1_c - l1_b) / l1_a
  } while (!Number.isInteger(l1_x) || l1_x < -4 || l1_x > 4 || l1_a === 0)

  levels.push({
    label: 'Los f(x) = c op',
    goalText: `Bepaal x zodat f(x) = ${l1_c}`,
    f_str: formatFn(l1_a, l1_b),
    g_str: `${l1_c} (horizontale lijn)`,
    f: (x) => l1_a * x + l1_b,
    g: (x) => l1_c,
    hasIntersection: true,
    intersectionX: l1_x,
    isInequality: false,
    targetOperator: null,
    hintLevels: [
      `Je zoekt x waarvoor f(x) = ${l1_c}. Dat is het snijpunt van de schuine lijn met de horizontale lijn y = ${l1_c}.`,
      `Voorbeeld: f(x) = 2x + 1 en c = 7. Los 2x + 1 = 7 op: 2x = 6 → x = 3. Op de grafiek is dat waar de lijn y=2x+1 de lijn y=7 snijdt.`,
      `f(x) = ${l1_a}x ${l1_b >= 0 ? '+ ' : '- '}${Math.abs(l1_b)} = ${l1_c} → ${l1_a}x = ${l1_c - l1_b} → x = __`
    ],
    why: 'Grafisch oplossen betekent: de oplossing van f(x) = c is de x-coordinaat van het snijpunt van de grafiek van f met de horizontale lijn y = c. Het snijpunt is de x waar beide functies dezelfde y-waarde hebben.',
    errorType: 'fx_c'
  })

  // Level 2: solve f(x) = g(x) (two lines intersection)
  let l2_a1, l2_b1, l2_a2, l2_b2, l2_ix
  do {
    l2_a1 = pickRandom([1, 2, -1, 0.5, -0.5])
    l2_b1 = pickRandom([-3, -2, -1, 0, 1, 2, 3])
    l2_a2 = pickRandom([-2, -1.5, -1, -0.5, 0.5, 1.5])
    l2_b2 = pickRandom([-3, -2, -1, 0, 1, 2, 3])
    if (l2_a1 !== l2_a2) {
      l2_ix = (l2_b2 - l2_b1) / (l2_a1 - l2_a2)
    }
  } while (l2_a1 === l2_a2 || !Number.isInteger(l2_ix) || l2_ix < -4 || l2_ix > 4)

  levels.push({
    label: 'Los f(x) = g(x) op',
    goalText: `Bepaal x zodat f(x) = g(x)`,
    f_str: formatFn(l2_a1, l2_b1),
    g_str: formatFn(l2_a2, l2_b2),
    f: (x) => l2_a1 * x + l2_b1,
    g: (x) => l2_a2 * x + l2_b2,
    hasIntersection: true,
    intersectionX: l2_ix,
    isInequality: false,
    targetOperator: null,
    hintLevels: [
      `Je zoekt het snijpunt van de twee lijnen. Daar is f(x) = g(x). Stel de formules aan elkaar gelijk.`,
      `Voorbeeld: f(x) = 2x + 1 en g(x) = −x + 7. Los 2x + 1 = −x + 7 op: 3x = 6 → x = 2. Controle: f(2) = 5, g(2) = 5.`,
      `${formatFn(l2_a1, l2_b1)} = ${formatFn(l2_a2, l2_b2)} → ${l2_a1 - l2_a2}x = ${l2_b2 - l2_b1} → x = __`
    ],
    why: 'De oplossing van f(x) = g(x) is de x-coordinaat waar de twee grafieken elkaar snijden. Op dat punt hebben beide functies dezelfde functiewaarde, dus is de gelijkheid waar.',
    errorType: 'fx_gx'
  })

  // Level 3: inequality f(x) < c
  let l3_a, l3_c, l3_b, l3_target
  do {
    l3_a = pickRandom([1, 2, -1, -2])
    l3_b = pickRandom([-3, -2, -1, 0, 1, 2, 3])
    l3_c = pickRandom([-2, -1, 1, 2, 3, 4])
    l3_target = (l3_c - l3_b) / l3_a
  } while (!Number.isInteger(l3_target) || l3_target < -4 || l3_target > 4 || l3_a === 0)

  const lessThan = l3_a > 0 ? 'links' : 'rechts'
  levels.push({
    label: 'Los f(x) < c op (ongelijkheid)',
    goalText: `Bepaal alle x waarvoor f(x) < ${l3_c}`,
    f_str: formatFn(l3_a, l3_b),
    g_str: `${l3_c} (horizontale lijn)`,
    f: (x) => l3_a * x + l3_b,
    g: (x) => l3_c,
    hasIntersection: true,
    intersectionX: l3_target,
    isInequality: true,
    targetOperator: '<',
    lessDirection: lessThan,
    solutionStr: l3_a > 0 ? `x < ${l3_target}` : `x > ${l3_target}`,
    hintLevels: [
      `f(x) < c betekent: waar ligt de grafiek van f ONDER de horizontale lijn y = ${l3_c}? Vind eerst het snijpunt.`,
      `Voorbeeld: f(x) = 2x + 1, los f(x) < 7 op. Snijpunt: x = 3. Omdat a=2>0 (stijgend), is f(x) < 7 links van x=3. Oplossing: x < 3.`,
      `Snijpunt: x = ${l3_target}. a = ${l3_a} ${l3_a > 0 ? '> 0 (stijgend)' : '< 0 (dalend)'}. f(x) < ${l3_c} als x ${l3_a > 0 ? '<' : '>'} __`
    ],
    why: 'Bij een ongelijkheid f(x) < c ben je niet op zoek naar een punt, maar naar een GEBIED. Het snijpunt is de grens; het teken van a (stijgen/dalen) bepaalt of de oplossing links of rechts van die grens ligt.',
    errorType: 'inequality'
  })

  return levels
}

function formatFn(a, b) {
  const aStr = a === 1 ? 'x' : a === -1 ? '-x' : a + 'x'
  const bStr = b > 0 ? ' + ' + b : b < 0 ? ' − ' + Math.abs(b) : ''
  return aStr + bStr
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Computed y-values for scanner
const fAtScan = computed(() => currentLevelData.value ? currentLevelData.value.f(scanX.value) : 0)
const gAtScan = computed(() => currentLevelData.value ? currentLevelData.value.g(scanX.value) : 0)
const distVal = computed(() => Math.abs(fAtScan.value - gAtScan.value))

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0; hintCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value === 0
  predictedX.value = null
  scanX.value = -4
  userClaimsNoIntersection.value = false
  feedback.value = { type: 'info', text: currentInternalLevel.value === 0
    ? 'Voorspel eerst de oplossing, daarna controleer je met de scanner.'
    : 'Gebruik de scanner om de oplossing te vinden.' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Schat de oplossing voordat je de scanner gebruikt.' }
}

function checkPrediction() {
  const lvl = currentLevelData.value
  if (!lvl) return

  if (Math.abs(Number(predictedX.value) - lvl.intersectionX) < 0.01) {
    showPrediction.value = false
    scanX.value = lvl.intersectionX
    if (lvl.isInequality) {
      feedback.value = { type: 'success', text: `Goed! Snijpunt is x = ${lvl.intersectionX}. Maar bij een ongelijkheid zoek je een GEBIED. Kijk: f(x) < ${lvl.g(0)} voor x ${lvl.targetOperator} ${lvl.intersectionX}?` }
    } else {
      feedback.value = { type: 'success', text: `Juist! Het snijpunt is x = ${lvl.intersectionX}. Controleer met de scanner.` }
    }
  } else {
    if (lvl.isInequality) {
      feedback.value = { type: 'error', text: `Niet juist. De grens is het snijpunt waar f(x) = ${lvl.g(0)}. Los op: ${lvl.f_str} = ${lvl.g(0)}.` }
    } else {
      feedback.value = { type: 'error', text: `Niet juist. Kijk naar de grafieken: waar snijden ze elkaar? Los algebraisch op ter controle.` }
    }
  }
}

function showHint() {
  const lvl = currentLevelData.value
  if (!lvl) return
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, lvl.hintLevels.length - 1)
  if (idx >= 0) {
    feedback.value = { type: 'info', text: lvl.hintLevels[idx] }
  }
}

function toggleNoIntersection() {
  if (isCorrect.value) return
  userClaimsNoIntersection.value = !userClaimsNoIntersection.value
}

function checkAnswer() {
  attemptCount.value++
  const lvl = currentLevelData.value
  if (!lvl) return

  // Check intersection exists
  if (!lvl.hasIntersection) {
    if (userClaimsNoIntersection.value) {
      isCorrect.value = true
      showReflection.value = true
      reflectionAnswer.value = ''
      feedback.value = { type: 'success', text: 'Prima inzicht! Deze lijnen zijn evenwijdig (zelfde rico, ander snijpunt). Ze snijden elkaar nooit, dus er is geen oplossing.' }
    } else {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'info', text: `De lijnen hebben dezelfde rico, dus ze zijn evenwijdig. Er is GEEN snijpunt. Gebruik de knop "Geen snijpunt".` }
      } else {
        feedback.value = { type: 'error', text: 'Deze lijnen hebben dezelfde richtingscoëfficiënt. Wat betekent dat voor het snijpunt?' }
      }
    }
    return
  }

  // Inequality handling
  if (lvl.isInequality) {
    // For inequalities, check if the user has the right direction too
    const exactCorrect = Math.abs(scanX.value - lvl.intersectionX) < 0.01
    if (!exactCorrect) {
      const closenessFeedback = distVal.value < 1
        ? `Je bent in de buurt maar nog niet exact. Het snijpunt is x = ${lvl.intersectionX}.`
        : `Het snijpunt is x = ${lvl.intersectionX} (waar f(x) = ${lvl.g(0)}).`
      feedback.value = { type: 'error', text: closenessFeedback }
      return
    }

    // They found the intersection. Now check direction understanding via reflection
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Snijpunt gevonden: x = ${lvl.intersectionX}. Bij een stijgende lijn (a>0) is f(x) < c LINKS van het snijpunt. Bij een dalende (a<0) is het RECHTS. Oplossing: ${lvl.solutionStr}` }
    return
  }

  // Standard equation solving: check scanner position
  if (userClaimsNoIntersection.value) {
    feedback.value = { type: 'error', text: 'Deze lijnen hebben verschillende richtingscoëfficiënten, dus ze snijden elkaar WEL. Blijf de scanner verschuiven.' }
    return
  }

  if (Math.abs(scanX.value - lvl.intersectionX) < 0.01) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    const yVal = lvl.f(scanX.value)
    feedback.value = { type: 'success', text: `Bingo! Bij x = ${lvl.intersectionX} is f(x) = g(x) = ${yVal}. Het snijpunt is (${lvl.intersectionX}, ${yVal}).` }
  } else {
    // Error analysis
    const guessX = scanX.value
    const guessY_f = lvl.f(guessX)
    const guessY_g = lvl.g(guessX)
    const guessedProduct = guessY_f * guessY_g

    if (lvl.errorType === 'fx_c') {
      // For f(x) = c, check if they found where f(x)=0 instead
      if (Math.abs(guessY_f) < Math.abs(guessY_f - lvl.g(0))) {
        feedback.value = { type: 'error', text: `Let op! Je hebt de NULWAARDE gevonden (waar f(x)=0), maar we zoeken waar f(x) = ${lvl.g(0)}. De nulwaarde is het snijpunt met de x-as, niet met de horizontale lijn.` }
      } else if (Math.abs(guessY_g) < 0.5 && guessX !== lvl.intersectionX) {
        // Finding where g(x) = 0? g is horizontal... but this is for equation case
      }
    }

    // Common error: finding x-intercept (zero) of one function instead of the intersection
    if (Math.abs(guessY_f) < 0.3 && lvl.intersectionX !== guessX) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de nulwaarde van f gevonden (x = ${guessX}, waar f(x) = 0). Maar we zoeken waar f(x) = g(x). Die x is ${lvl.intersectionX}, niet waar f nul is.` }
      return
    }
    if (Math.abs(guessY_g) < 0.3 && lvl.intersectionX !== guessX && lvl.g_str !== `${lvl.g(0)}`) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de nulwaarde van g gevonden (x = ${guessX}, waar g(x) = 0). Maar we zoeken waar f(x) = g(x), niet waar g(x) = 0.` }
      return
    }

    // Common error: confusing inequality direction
    if (lvl.isInequality && fAtScan.value < gAtScan.value === lvl.targetAbove) {
      feedback.value = { type: 'error', text: 'Let op! Bij een ongelijkheid moet je niet alleen het snijpunt vinden, maar ook bepalen aan welke kant van het snijpunt de ongelijkheid klopt. Kijk of f boven of onder g ligt.' }
      return
    }

    if (attemptCount.value >= 3) {
      feedback.value = { type: 'info', text: `Het snijpunt is bij x = ${lvl.intersectionX}. Verifieer door in te vullen: f(${lvl.intersectionX}) = ${lvl.f(lvl.intersectionX)} en g(${lvl.intersectionX}) = ${lvl.g(lvl.intersectionX)}. Zet de scanner op ${lvl.intersectionX}.` }
    } else if (distVal.value < 1) {
      feedback.value = { type: 'error', text: `Heel warm! De stippen zijn bijna samen (verschil ${distVal.value.toFixed(2)}). Nog een klein beetje verder.` }
    } else {
      feedback.value = { type: 'error', text: `Bij x = ${guessX} is f(x) = ${guessY_f} en g(x) = ${guessY_g} (verschil ${distVal.value.toFixed(1)}). Je zoekt naar verschil 0 — waar f en g elkaar snijden.` }
    }
  }
}

function checkReflection() {
  const lvl = currentLevelData.value
  const ans = reflectionAnswer.value.toLowerCase()

  if (lvl.isInequality) {
    const keywords = ['links', 'rechts', 'stijg', 'daal', 'onder', 'boven', 'richting', 'teken', 'a']
    if (keywords.some(k => ans.includes(k)) && ans.length > 10) {
      showReflection.value = false
      celebrationDone.value = false
    } else {
      feedback.value = { type: 'info', text: 'Denk na: hoe bepaal je of de oplossing links of rechts van het snijpunt ligt? Gebruik termen als "stijgen", "dalen", "links", "rechts".' }
    }
  } else {
    const keywords = ['snij', 'zelfde', 'f(x)', 'g(x)', 'y', 'coordinaat', 'punt']
    if (keywords.some(k => ans.includes(k)) && ans.length > 10) {
      showReflection.value = false
      celebrationDone.value = false
    } else {
      feedback.value = { type: 'info', text: 'Denk na: waarom is de x-coördinaat van het snijpunt de oplossing van f(x) = g(x)? Gebruik termen als "zelfde y", "snijpunt", "f(x) = g(x)".' }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => mainArea.value?.focus())
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1">
              <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Los 2x + 1 = 7 grafisch op</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 1:</strong> Teken f(x) = 2x + 1 (schuine lijn) en g(x) = 7 (horizontale lijn).</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 2:</strong> Zoek het snijpunt: waar snijden de lijnen elkaar?</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 3:</strong> Bij x = <span class="font-bold text-amber-600">3</span> geldt f(3) = 2·3 + 1 = 7 = g(3).</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Controle:</strong> 2·3 + 1 = 7. Klopt!</p>
            <p class="text-xs text-slate-500 mt-1">Grafisch oplossen = het snijpunt van de twee grafieken aflezen.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.label }}</p>
            <p class="font-mono text-base font-bold text-slate-800 mt-1">{{ currentLevelData.f_str }}</p>
            <p class="font-mono text-sm text-slate-600">{{ currentLevelData.g_str }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ currentLevelData.goalText }}</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">
              {{ currentLevelData.isInequality ? 'Schat de GRENS (x van het snijpunt):' : 'Voorspel de x-waarde van het snijpunt:' }}
            </p>
            <p class="text-xs text-slate-600 mb-2">Beredeneer eerst algebraisch, daarna controleer je met de scanner.</p>
            <input type="number" step="0.1" v-model="predictedX"
              class="w-full p-3 text-lg font-bold bg-white border-2 border-amber-300 rounded-lg outline-none focus:border-amber-500 tabular-nums text-center mb-2"
              placeholder="x = ?" @keyup.enter="checkPrediction" />
            <button @click="checkPrediction" :disabled="predictedX === null || predictedX === ''"
              class="w-full py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm active:scale-[0.98]">
              Bevestig voorspelling
            </button>
          </div>

          <!-- Scanner controls -->
          <div v-if="!showPrediction || showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
            <!-- Scanner slider -->
            <div>
              <label class="block mb-1 text-sm font-bold text-slate-700">
                {{ currentLevelData.isInequality ? 'Schuif naar het snijpunt (grens):' : 'Verschuif de scanner naar x =' }}
                <span class="text-amber-600 font-mono">{{ scanX }}</span>
              </label>
              <input type="range" v-model.number="scanX" min="-5" max="5" step="0.5" :disabled="userClaimsNoIntersection" class="w-full accent-amber-500">
              <div class="flex justify-between mt-1 text-xs text-slate-400"><span>-5</span><span>0</span><span>5</span></div>
            </div>

            <!-- Live readout -->
            <div class="bg-white p-3 border border-slate-200 rounded-lg text-sm space-y-1">
              <p>f(<span class="font-mono">{{ scanX }}</span>) = <span class="font-mono font-bold text-amber-600">{{ fAtScan }}</span></p>
              <p>g(<span class="font-mono">{{ scanX }}</span>) = <span class="font-mono font-bold text-amber-600">{{ gAtScan }}</span></p>
              <p v-if="!currentLevelData.isInequality" class="text-xs text-slate-400">Verschil: {{ distVal.toFixed(1) }}</p>
              <p v-if="currentLevelData.isInequality" class="text-xs text-slate-400">
                f(x) {{ fAtScan < gAtScan ? '<' : '>' }} g(x) → {{ fAtScan < gAtScan ? 'f onder g' : 'f boven g' }}
              </p>
            </div>

            <!-- No intersection button (for Level 2+ extension) -->
            <div class="pt-2 text-center">
              <button @click="toggleNoIntersection"
                class="px-4 py-2 border-2 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="userClaimsNoIntersection ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'">
                Geen snijpunt (Strijdig)
              </button>
            </div>

            <button @click="showHint" class="w-full py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-[0.98] flex items-center justify-center gap-2">
              <PhLightbulb class="w-4 h-4" /> Hint {{ hintCount > 0 ? `(${Math.min(hintCount, 3)}/3)` : '' }}
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom werkt grafisch oplossen?</p>
            <p class="text-xs text-amber-700 leading-relaxed">{{ currentLevelData.why }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p v-if="currentLevelData.isInequality" class="text-xs text-amber-700 mb-2">
              Hoe bepaal je of de oplossing links of rechts van het snijpunt ligt? Wat heeft de richtingscoëfficiënt a ermee te maken?
            </p>
            <p v-else class="text-xs text-amber-700 mb-2">
              Waarom is de x-coordinaat van het snijpunt de oplossing van f(x) = g(x)? Leg uit.
            </p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4"
            role="status" aria-live="polite" aria-atomic="true"
            :class="{ 'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-amber-100 text-amber-800 border-amber-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>
            <button v-if="!isCorrect && !showPrediction" @click="checkAnswer"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">Controleer</button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" class="inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right panel: Graph -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
            <svg width="450" height="450" viewBox="-6 -6 12 12" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
              <!-- Grid -->
              <g stroke="#e2e8f0" stroke-width="0.1">
                <line v-for="i in 13" :key="'v'+i" :x1="i-7" y1="-6" :x2="i-7" y2="6" />
                <line v-for="i in 13" :key="'h'+i" x1="-6" :y1="i-7" x2="6" :y2="i-7" />
              </g>

              <!-- Highlight inequality zone -->
              <rect v-if="currentLevelData.isInequality && currentLevelData.intersectionX !== undefined"
                :x="currentLevelData.f(scanX) < currentLevelData.g(scanX) ? '-6' : currentLevelData.intersectionX"
                y="-6"
                :width="currentLevelData.f(scanX) < currentLevelData.g(scanX) ? (currentLevelData.intersectionX + 6) : (6 - currentLevelData.intersectionX)"
                height="12" fill="#d97706" opacity="0.06" />

              <!-- Axes -->
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#64748b" stroke-width="0.2" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#64748b" stroke-width="0.2" />

              <!-- Function f -->
              <line x1="-6" :y1="-currentLevelData.f(-6)" x2="6" :y2="-currentLevelData.f(6)"
                stroke="#d97706" stroke-width="0.3" stroke-linecap="round" />
              <text x="4.5" :y="-currentLevelData.f(4.5) - 0.4" class="fill-amber-600 font-bold" text-anchor="middle" font-size="0.35">f(x)</text>

              <!-- Function g -->
              <line x1="-6" :y1="-currentLevelData.g(-6)" x2="6" :y2="-currentLevelData.g(6)"
                stroke="#0f172a" stroke-width="0.25" stroke-linecap="round" stroke-dasharray="0.2" />
              <text x="4.5" :y="-currentLevelData.g(4.5) + 0.5" class="fill-slate-800 font-bold" text-anchor="middle" font-size="0.35">g(x)</text>

              <!-- Scanner line -->
              <line v-if="!userClaimsNoIntersection" :x1="scanX" y1="-6" :x2="scanX" y2="6"
                stroke="#f97316" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-150" />

              <!-- Dots -->
              <circle v-if="!userClaimsNoIntersection" :cx="scanX" :cy="-fAtScan" r="0.22" fill="#d97706" class="transition-all duration-150" />
              <circle v-if="!userClaimsNoIntersection" :cx="scanX" :cy="-gAtScan" r="0.22" fill="#0f172a" class="transition-all duration-150" />

              <!-- Distance connector -->
              <line v-if="!userClaimsNoIntersection && distVal > 0.01"
                :x1="scanX" :y1="-fAtScan" :x2="scanX" :y2="-gAtScan"
                stroke="#ef4444" stroke-width="0.08" stroke-dasharray="0.15" class="transition-all duration-150" />

              <!-- Correct highlight -->
              <circle v-if="isCorrect && currentLevelData.hasIntersection"
                :cx="currentLevelData.intersectionX" :cy="-currentLevelData.f(currentLevelData.intersectionX)"
                r="0.4" fill="#d97706" class="animate-pulse" />
              <text v-if="isCorrect && currentLevelData.hasIntersection"
                :x="currentLevelData.intersectionX" :y="-currentLevelData.f(currentLevelData.intersectionX) - 0.6"
                class="fill-amber-600 font-bold" text-anchor="middle" font-size="0.35">
                ({{ currentLevelData.intersectionX }}, {{ currentLevelData.f(currentLevelData.intersectionX) }})
              </text>
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showReflection" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
  background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  background-size: 2rem 2rem; background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
