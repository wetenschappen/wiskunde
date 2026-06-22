<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGraph, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Representaties van een Rechte' },
  instruction: { type: String, default: 'Bepaal het functievoorschrift f(x) = ax + b via gegeven punten, de grafiek of een tabel.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhGraph }
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
const predictedSlope = ref(null)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

// User input
const userA = ref(1)
const userB = ref(0)
const hintCount = ref(0)

function generateLevel() {
  const levels = []

  // Level 1: Find formula from two points (both given, nice integers)
  const l1_a = pickRandom([1, 2, -1, -2, 3])
  const l1_b = pickRandom([-3, -2, -1, 0, 1, 2, 3])
  const l1_pts = [
    { x: 0, y: l1_b },
    { x: pickRandom([1, 2, 3]), y: 0 }
  ]
  l1_pts[1].y = l1_a * l1_pts[1].x + l1_b
  // Ensure x=0 is one of them so b is obvious
  levels.push({
    label: 'Formule uit twee punten',
    goalText: 'Gegeven de punten P en Q, bepaal a en b zodat f(x) = ax + b.',
    points: l1_pts,
    targetA: l1_a,
    targetB: l1_b,
    hintLevels: [
      `Rico a = Δy/Δx = (y₂−y₁)/(x₂−x₁). Welke punten heb je?`,
      `Voorbeeld: punten (1,3) en (3,7): Δy/Δx = (7−3)/(3−1) = 4/2 = 2. Pas dit toe op jouw punten.`,
      `a = (${l1_pts[1].y} − ${l1_pts[0].y}) / (${l1_pts[1].x} − ${l1_pts[0].x}) = __ / __ = __`
    ],
    hintB: l1_b === 0
      ? 'b = 0: de lijn gaat door de oorsprong (0,0).'
      : `b is het snijpunt met de y-as. Je hebt punt (0,${l1_b}). Vul a en (0,${l1_b}) in: b = y − ax = ${l1_b} − a·0 = ${l1_b}`,
    why: `De richtingscoëfficiënt a = Δy/Δx is constant voor een rechte lijn. Dat betekent: onafhankelijk van welke twee punten je kiest, de verhouding (y₂−y₁)/(x₂−x₁) blijft hetzelfde. Dit is precies wat een lineair verband definieert.`,
    setupData: null
  })

  // Level 2: Find formula from graph (only x-intercepts / visual points)
  const l2_a = pickRandom([-3, -2, -1.5, -1, 1, 1.5, 2, 3])
  const l2_b = pickRandom([-4, -3, -2, -1, 0, 1, 2, 3, 4])
  const l2_pts = [
    { x: pickRandom([-2, -1, 1, 2]), y: 0 },
    { x: 0, y: l2_b }
  ]
  l2_pts[0].y = l2_a * l2_pts[0].x + l2_b
  if (l2_pts[0].x === 0) l2_pts[0].x = pickRandom([1, 2, -1, -2])

  const l2_extra_pts = [
    { x: 3, y: l2_a * 3 + l2_b },
    { x: -2, y: l2_a * -2 + l2_b }
  ]

  levels.push({
    label: 'Formule uit de grafiek',
    goalText: 'Lees de grafiek af: bepaal a en b.',
    points: l2_pts,
    extraPoints: l2_extra_pts,
    targetA: l2_a,
    targetB: l2_b,
    hintLevels: [
      `Lees eerst het snijpunt met de y-as af: dat is b. Neem daarna een tweede punt om a = Δy/Δx te berekenen.`,
      `Als b = ${l2_b} en je neemt punt (${l2_pts[0].x}, ${l2_pts[0].y}): Δy = ${l2_pts[0].y} − ${l2_b} = ${l2_pts[0].y - l2_b}. Δx = ${l2_pts[0].x} − 0 = ${l2_pts[0].x}.`,
      `a = (${l2_pts[0].y} − ${l2_b}) / (${l2_pts[0].x} − 0) = __ / __ = __`
    ],
    hintB: `Je hebt al b = ${l2_b}. Wil je controleren? Neem een punt: f(${l2_pts[0].x}) = a·${l2_pts[0].x} + ${l2_b} = ${l2_pts[0].y}. Los op: a = (${l2_pts[0].y} − ${l2_b})/${l2_pts[0].x}`,
    why: 'Een rechte lijn heeft overal dezelfde helling. Door twee punten op de grafiek af te lezen (bijv. het snijpunt met de y-as en een willekeurig ander punt), kun je altijd a en b vinden.',
    setupData: null
  })

  // Level 3: Table with fractions — x=0 NOT in table, must calculate b
  const l3_a = pickRandom([0.5, 1.5, 2.5, -0.5, -1.5])
  const l3_b = pickRandom([-2, -1, 1, 2])
  const l3_xs = [pickRandom([1, 2]), pickRandom([3, 4]), pickRandom([5, 6])]
  // deduplicate
  const l3_xs_dedup = [...new Set(l3_xs)].slice(0, 2)
  const l3_table = l3_xs_dedup.map(x => ({ x, y: l3_a * x + l3_b }))
  // Add a third point
  const l3_x3 = l3_xs_dedup[1] + 2
  l3_table.push({ x: l3_x3, y: l3_a * l3_x3 + l3_b })

  levels.push({
    label: 'Formule uit tabel (x=0 niet gegeven)',
    goalText: 'x=0 staat niet in de tabel! Bereken a uit twee punten, daarna b via invullen.',
    points: l3_table,
    targetA: l3_a,
    targetB: l3_b,
    hintLevels: [
      `Kies twee punten uit de tabel. Bereken a = Δy/Δx. Daarna vul je a en een punt in: b = y − ax.`,
      `Neem punten (${l3_table[0].x}, ${l3_table[0].y}) en (${l3_table[1].x}, ${l3_table[1].y}): Δx = ${l3_table[1].x - l3_table[0].x}, Δy = ${l3_table[1].y - l3_table[0].y}.`,
      `a = (${l3_table[1].y} − ${l3_table[0].y}) / (${l3_table[1].x} − ${l3_table[0].x}) = __ / __ = __`
    ],
    hintB: l3_b >= 0
      ? `Je hebt a = ${l3_a}. Neem punt (${l3_table[0].x}, ${l3_table[0].y}): ${l3_table[0].y} = ${l3_a}·${l3_table[0].x} + b → b = ${l3_table[0].y} − ${l3_a * l3_table[0].x} = __`
      : `Je hebt a = ${l3_a}. Neem punt (${l3_table[0].x}, ${l3_table[0].y}): ${l3_table[0].y} = ${l3_a}·${l3_table[0].x} + b → b = ${l3_table[0].y} − ${l3_a * l3_table[0].x} = __`,
    why: 'Zelfs als x=0 niet in de tabel staat, kun je b vinden door a eerst uit twee andere punten te berekenen en dan een punt in te vullen. Dit heet de "twee-punten-methode" en werkt altijd voor een rechte.',
    setupData: null
  })

  return levels
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0; hintCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value === 0
  predictedSlope.value = null
  const lvl = currentLevelData.value
  userA.value = 1
  userB.value = 0
  feedback.value = { type: 'info', text: currentInternalLevel.value === 0
    ? 'Bereken eerst zelf de richtingscoëfficiënt, daarna bepaal je b.'
    : 'Pas a (helling) en b (snijpunt y-as) aan om kloppend te maken.' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Schat eerst de richtingscoëfficiënt a = Δy/Δx.' }
}

function checkPrediction() {
  const lvl = currentLevelData.value
  const pts = lvl.points
  const correctA = (pts[1].y - pts[0].y) / (pts[1].x - pts[0].x)
  if (Math.abs(Number(predictedSlope.value) - correctA) < 0.01) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: `Juist! a = ${correctA}. Nu pas je de schuifregelaars aan om het te bevestigen.` }
  } else {
    const errType = detectedSlopeError(Number(predictedSlope.value), correctA, pts)
    feedback.value = { type: 'error', text: errType }
  }
}

function detectedSlopeError(guess, correct, pts) {
  const swapped = (pts[0].x - pts[1].x) / (pts[1].y - pts[0].y)
  if (Math.abs(guess - swapped) < 0.01) {
    return 'Je hebt x en y omgewisseld! a = Δy/Δx, niet Δx/Δy. Bereken opnieuw: (y₂−y₁)/(x₂−x₁).'
  }
  const signErr = -correct
  if (Math.abs(guess - signErr) < 0.01) {
    return 'Let op het teken! Controleer of je Δy en Δx correct hebt berekend (y₂−y₁ en x₂−x₁).'
  }
  return `Niet correct. a = (y₂−y₁)/(x₂−x₁). Je punten zijn (${pts[0].x},${pts[0].y}) en (${pts[1].x},${pts[1].y}). Bereken opnieuw.`
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

function checkAnswer() {
  attemptCount.value++
  const lvl = currentLevelData.value
  const aOk = Math.abs(userA.value - lvl.targetA) < 0.01
  const bOk = Math.abs(userB.value - lvl.targetB) < 0.01

  if (aOk && bOk) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Juist! f(x) = ${lvl.targetA}x ${lvl.targetB >= 0 ? '+ ' : '- '}${Math.abs(lvl.targetB)}. De punten kloppen met de formule.` }
  } else if (!aOk && !bOk) {
    if (attemptCount.value >= 3) {
      feedback.value = { type: 'info', text: `Let op: a = ${lvl.targetA} en b = ${lvl.targetB}. Gebruik de hint-knop voor de methode.` }
    } else {
      feedback.value = { type: 'error', text: `Zowel a als b kloppen niet. Begin met a = Δy/Δx te berekenen.` }
    }
  } else if (!aOk) {
    const swappedB = -1 / lvl.targetA // common: a = -1/a mistake
    if (Math.abs(userA.value - (lvl.targetB !== 0 ? lvl.points[1].y / lvl.points[1].x : 0)) < 0.01) {
      feedback.value = { type: 'error', text: 'Je hebt a berekend als y/x in plaats van Δy/Δx. Gebruik TWEE punten: a = (y₂−y₁)/(x₂−x₁).' }
    } else if (Math.abs(userA.value + lvl.targetA) < 0.01) {
      feedback.value = { type: 'error', text: 'Het teken van a is omgekeerd. Controleer of de lijn stijgt (a>0) of daalt (a<0).' }
    } else {
      feedback.value = { type: 'error', text: `a = ${userA.value} is niet correct. De juiste waarde heeft te maken met Δy/Δx = ${lvl.targetA}.` }
    }
  } else {
    // b wrong
    if (userB.value === 0 && lvl.targetB !== 0) {
      feedback.value = { type: 'error', text: `b is niet 0. De lijn gaat niet door de oorsprong. b = y − ax. Vul een punt in: b = ${lvl.points[0].y} − ${userA.value}·${lvl.points[0].x}.` }
    } else {
      feedback.value = { type: 'error', text: `b = ${userB.value} is niet correct. Tip: b = y − ax. Neem een punt uit de tabel en reken na.` }
    }
  }
}

// Watcher: auto-check when sliders change (only after prediction is done)
watch([userA, userB], () => {
  if (showPrediction.value || isCorrect.value) return
  // Don't auto-check, user must click "Controleer"
})

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['constant', 'helling', 'rico', 'Δy/Δx', 'verschil', 'ratio', 'verhouding', 'stijgen', 'dalen', 'altijd', 'zelfde', 'overal']
  if (keywords.some(k => ans.includes(k)) && ans.length > 10) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Denk na: wat maakt dat een rechte lijn overal dezelfde helling heeft? Gebruik termen zoals "constant", "Δy/Δx" of "verhouding".' }
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

          <!-- Worked Example (Level 1 only) -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Formule uit twee punten</p>
            <p class="text-sm text-slate-700 mb-1">Gegeven P(1, 3) en Q(3, 7):</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 1:</strong> Δy/Δx = (7−3)/(3−1) = 4/2 = <span class="font-bold text-amber-600">2</span></p>
            <p class="text-sm text-slate-700 mb-1"><strong>Stap 2:</strong> b = y − ax. Neem P: 3 − 2·1 = <span class="font-bold text-amber-600">1</span></p>
            <p class="text-sm text-slate-700">Dus f(x) = <strong class="text-amber-600">2x + 1</strong></p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.label }}</p>
            <p class="text-sm text-slate-600 mt-1">{{ currentLevelData.goalText }}</p>
          </div>

          <!-- Prediction Gate (Level 1) -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel a = Δy/Δx:</p>
            <p class="text-xs text-slate-600 mb-2">Bereken de richtingscoëfficiënt uit de twee gegeven punten.</p>
            <input type="number" step="0.1" v-model="predictedSlope"
              class="w-full p-3 text-lg font-bold bg-white border-2 border-amber-300 rounded-lg outline-none focus:border-amber-500 tabular-nums text-center mb-2"
              placeholder="a = ?" @keyup.enter="checkPrediction" />
            <button @click="checkPrediction" :disabled="predictedSlope === null || predictedSlope === ''"
              class="w-full py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm active:scale-[0.98]">
              Bevestig voorspelling
            </button>
          </div>

          <!-- Slider controls -->
          <div v-if="!showPrediction || showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
            <div class="text-center bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
              <p class="font-mono text-xl font-black text-slate-800">
                f(x) = <span class="text-amber-600">{{ userA }}</span>x <span v-if="userB >= 0">+ </span><span v-else>− </span><span class="text-amber-600">{{ Math.abs(userB) }}</span>
              </p>
            </div>

            <div>
              <label class="block mb-1 text-sm font-bold text-slate-700">Richtingscoëfficiënt (a): <span class="text-amber-600 font-mono">{{ userA }}</span></label>
              <input type="range" v-model.number="userA" min="-4" max="4" step="0.5" class="w-full accent-amber-500">
            </div>
            <div>
              <label class="block mb-1 text-sm font-bold text-slate-700">Y-as snijpunt (b): <span class="text-amber-600 font-mono">{{ userB }}</span></label>
              <input type="range" v-model.number="userB" min="-6" max="6" step="1" class="w-full accent-amber-500">
            </div>

            <button @click="showHint" class="w-full py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-[0.98] flex items-center justify-center gap-2">
              <PhLightbulb class="w-4 h-4" /> Hint {{ hintCount > 0 ? `(${Math.min(hintCount, 3)}/3)` : '' }}
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom is de helling constant?</p>
            <p class="text-xs text-amber-700 leading-relaxed">{{ currentLevelData.why }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2">Waarom kun je uit ELKE twee punten van een rechte lijn dezelfde richtingscoëfficiënt berekenen? Leg uit.</p>
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
            <button v-if="!isCorrect && !showPrediction" @click="checkAnswer" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">Controleer</button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" class="inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right panel: Graph + Table -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex flex-col md:flex-row items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-8">
            <!-- Data Table -->
            <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-center z-10 w-48 shrink-0">
              <div class="flex bg-slate-800 text-white font-bold text-sm">
                <div class="flex-1 p-3 border-r border-slate-600">x</div>
                <div class="flex-1 p-3">y</div>
              </div>
              <div v-for="row in currentLevelData.points" :key="row.x" class="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div class="flex-1 p-3 border-r border-slate-200 font-mono font-bold text-sm">{{ row.x }}</div>
                <div class="flex-1 p-3 font-mono font-bold text-amber-600 text-sm">{{ row.y }}</div>
              </div>
              <!-- Extra points for level 2 -->
              <div v-if="currentLevelData.extraPoints" v-for="row in currentLevelData.extraPoints" :key="'e'+row.x" class="flex border-t border-dashed border-slate-200 hover:bg-slate-50 transition-colors">
                <div class="flex-1 p-3 border-r border-slate-200 font-mono text-sm text-slate-400">{{ row.x }}</div>
                <div class="flex-1 p-3 font-mono text-sm text-slate-400">{{ row.y }}</div>
              </div>
            </div>

            <!-- Coordinate System SVG -->
            <svg width="400" height="400" viewBox="-8 -8 16 16" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10 shrink-0">
              <!-- Grid -->
              <g stroke="#e2e8f0" stroke-width="0.1">
                <line v-for="i in 17" :key="'v'+i" :x1="i-9" y1="-8" :x2="i-9" y2="8" />
                <line v-for="i in 17" :key="'h'+i" x1="-8" :y1="i-9" x2="8" :y2="i-9" />
              </g>
              <!-- Axes -->
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748b" stroke-width="0.2" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" stroke-width="0.2" />
              <!-- User's line -->
              <line x1="-8" :y1="-(userA * -8 + userB)" x2="8" :y2="-(userA * 8 + userB)" stroke="#d97706" stroke-width="0.3" stroke-linecap="round" class="transition-all duration-300" />
              <!-- Target points -->
              <circle v-for="row in currentLevelData.points" :key="'pt-'+row.x"
                :cx="row.x" :cy="-row.y" r="0.3" fill="#dc2626" />
              <!-- Extra points for level 2 -->
              <circle v-if="currentLevelData.extraPoints" v-for="row in currentLevelData.extraPoints" :key="'ept-'+row.x"
                :cx="row.x" :cy="-row.y" r="0.2" fill="#94a3b8" />
              <!-- Correct highlight -->
              <circle v-if="isCorrect" cx="0" :cy="-currentLevelData.targetB" r="0.4" fill="#d97706" class="animate-pulse" />
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
