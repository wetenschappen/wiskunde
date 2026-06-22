<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMagnifyingGlass, PhArrowClockwise, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Kenmerken Eerstegraadsfuncties' },
  instruction: { type: String, default: 'Bepaal domein, bereik, nulwaarde en stel het tekenschema op.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhMagnifyingGlass }
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
const predictedRoot = ref(null)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

// User state
const userRoot = ref(0)
const userSignLeft = ref('')
const userSignRight = ref('')
const hintCount = ref(0)

function generateLevel() {
  const levels = []

  // Level 1: find zero and sign from given f(x) formula
  const l1_a = pickRandom([1, 2, -1, -2])
  const l1_b = pickRandom([-6, -4, -3, -2, 2, 3, 4, 6])
  const l1_root = -l1_b / l1_a
  levels.push({
    label: 'Nulwaarde en teken uit formule',
    goalText: `Bepaal de nulwaarde van f(x) = ${formatFn(l1_a, l1_b)} en stel het tekenschema op.`,
    f_str: formatFn(l1_a, l1_b),
    f: (x) => l1_a * x + l1_b,
    a: l1_a, b: l1_b, root: l1_root,
    signLeft: l1_a > 0 ? '-' : '+',
    signRight: l1_a > 0 ? '+' : '-',
    hintLevels: [
      `Nulwaarde: los f(x) = 0 op. ${l1_a}x ${l1_b >= 0 ? '+ ' : '- '}${Math.abs(l1_b)} = 0.`,
      `Voorbeeld: f(x) = 2x − 6. Stel 2x − 6 = 0 → 2x = 6 → x = 3. Pas toe op jouw functie.`,
      `${l1_a}x ${l1_b >= 0 ? '+ ' : '- '}${Math.abs(l1_b)} = 0 → ${l1_a}x = ${-l1_b} → x = __`
    ],
    why: 'De nulwaarde is het punt waar de grafiek de x-as snijdt (y = 0). Omdat een eerstegraadsfunctie overal stijgt of daalt, wisselt het teken precies één keer: vóór de nulwaarde is f(x) negatief, erna positief (of omgekeerd bij a < 0).',
    domain: 'ℝ', range: 'ℝ'
  })

  // Level 2: from graph only (student must read root and signs visually)
  const l2_a = pickRandom([0.5, 1, 1.5, 2, -0.5, -1, -1.5, -2])
  const l2_b = pickRandom([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
  const l2_root = -l2_b / l2_a
  levels.push({
    label: 'Nulwaarde en teken uit grafiek',
    goalText: 'Lees de nulwaarde af en bepaal het tekenschema. Gebruik de scannerlijn!',
    f_str: formatFn(l2_a, l2_b),
    f: (x) => l2_a * x + l2_b,
    a: l2_a, b: l2_b, root: l2_root,
    signLeft: l2_a > 0 ? '-' : '+',
    signRight: l2_a > 0 ? '+' : '-',
    hintLevels: [
      'Waar snijdt de grafiek de x-as? Dat is de nulwaarde. Links/rechts daarvan: ligt de grafiek boven (positief) of onder (negatief) de x-as?',
      `Voorbeeld: f(x) = 1,5x − 3. Nulwaarde: 1,5x − 3 = 0 → x = 2. Links: f(0) = −3 < 0. Rechts: f(4) = 3 > 0.`,
      `Scanner naar x = ${l2_root} (zwart bolletje). Links (x < ${l2_root}): teken __. Rechts (x > ${l2_root}): teken __.`
    ],
    why: 'Een eerstegraadsfunctie heeft exact één nulwaarde. Links en rechts daarvan heeft f(x) altijd tegengestelde tekens (behalve als a = 0). Het teken wordt bepaald door of de grafiek boven (+) of onder (−) de x-as ligt.',
    domain: 'ℝ', range: 'ℝ'
  })

  // Level 3: from context/word problem — extract and solve
  const l3_scenarios = [
    { text: 'Een taxi rekent €3 instapkosten en €2 per km. Het bedrag B als functie van km x: B(x) = 2x + 3. Na hoeveel km is het bedrag €11? (nulwaarde van B − 11?)', a: 2, b: 3, target: 4, rootCalc: true },
    { text: 'Een zwembad leeglopen: waterhoogte h(t) = −0,5t + 4 met t in uren. Wanneer is het bad leeg (h = 0)?', a: -0.5, b: 4, target: 8, rootCalc: true },
    { text: 'Op een spaarrekening staat €50, elke maand haal je €2 eraf. Saldo S(m) = −2m + 50. Wanneer is het saldo 0?', a: -2, b: 50, target: 25, rootCalc: true },
  ]
  const l3_scenario = l3_scenarios[Math.floor(Math.random() * l3_scenarios.length)]
  const l3_a = l3_scenario.a
  const l3_b = l3_scenario.b
  const l3_root = -l3_b / l3_a

  levels.push({
    label: 'Nulwaarde uit context',
    goalText: `Context: ${l3_scenario.text}`,
    f_str: formatFn(l3_a, l3_b),
    f: (x) => l3_a * x + l3_b,
    a: l3_a, b: l3_b, root: l3_root,
    signLeft: l3_a > 0 ? '-' : '+',
    signRight: l3_a > 0 ? '+' : '-',
    hintLevels: [
      'Wat betekent f(x) = 0 in deze context? Stel de formule gelijk aan 0 en los op.',
      `Voorbeeld: een zwembad met h(t) = −0,5t + 4. h=0 → −0,5t + 4 = 0 → 0,5t = 4 → t = 8 uur. Wat is jouw functie?`,
      `${formatFn(l3_a, l3_b)} = 0 → ${l3_a}x = ${-l3_b} → x = __`
    ],
    why: 'In contexten vertaalt f(x) = 0 zich naar "wanneer is er niets meer over" of "wanneer is het break-even". De wiskundige nulwaarde heeft dus een concrete betekenis in het probleem.',
    domain: 'ℝ', range: 'ℝ'
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

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0; hintCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value === 0
  predictedRoot.value = null
  userRoot.value = 0
  userSignLeft.value = ''
  userSignRight.value = ''
  feedback.value = { type: 'info', text: currentInternalLevel.value === 0
    ? 'Voorspel eerst de nulwaarde, stel daarna het tekenschema op.'
    : 'Beweeg de scanner om de nulwaarde te vinden. Stel daarna het tekenschema in.' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = true
  feedback.value = { type: 'info', text: 'Wat is de nulwaarde? Bereken f(x) = 0.' }
}

function checkPrediction() {
  const lvl = currentLevelData.value
  if (Math.abs(Number(predictedRoot.value) - lvl.root) < 0.01) {
    showPrediction.value = false
    userRoot.value = lvl.root
    feedback.value = { type: 'success', text: `Juist! De nulwaarde is x = ${lvl.root}. Stel nu het tekenschema op.` }
  } else {
    const zeroX = (predictedRoot.value !== null && predictedRoot.value !== '') ? Number(predictedRoot.value) : null
    if (zeroX !== null && Math.abs(-lvl.a * zeroX - lvl.b) < 0.01) {
      feedback.value = { type: 'error', text: 'Let op! De nulwaarde is een x-waarde, geen y-waarde. Los f(x) = 0 op naar x. Je zoekt waar de grafiek de x-as snijdt, niet de y-waarde die eruit komt.' }
    } else if (zeroX !== null && zeroX === lvl.b) {
      feedback.value = { type: 'error', text: `Let op! Je hebt de constante term (b = ${lvl.b}) ingevuld. De nulwaarde is niet hetzelfde als b. Je moet f(x) = 0 oplossen: ${lvl.f_str} = 0.` }
    } else if (zeroX !== null && Math.abs(zeroX) === Math.abs(lvl.root) && zeroX !== lvl.root) {
      feedback.value = { type: 'error', text: `Let op! Je hebt het juiste getal maar met het verkeerde teken. De nulwaarde is x = ${lvl.root}, niet x = ${zeroX}. Controleer of je het minteken correct hebt overgebracht bij het oplossen van ${lvl.f_str} = 0.` }
    } else {
      feedback.value = { type: 'error', text: `Let op! Dat is niet de nulwaarde. Los ${lvl.f_str} = 0 op door x te isoleren.` }
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

function toggleSign(side) {
  if (isCorrect.value) return
  if (side === 'left') {
    userSignLeft.value = userSignLeft.value === '+' ? '-' : (userSignLeft.value === '-' ? '' : '+')
  } else {
    userSignRight.value = userSignRight.value === '+' ? '-' : (userSignRight.value === '-' ? '' : '+')
  }
}

function checkAnswer() {
  attemptCount.value++
  const lvl = currentLevelData.value

  const rootOk = Math.abs(userRoot.value - lvl.root) < 0.01
  const signsOk = userSignLeft.value === lvl.signLeft && userSignRight.value === lvl.signRight

  if (rootOk && signsOk) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    const intervalNotation = lvl.signLeft === '+' ? `+]−∞, ${lvl.root}[ · 0 · ]${lvl.root}, +∞[−` : `−]−∞, ${lvl.root}[ · 0 · ]${lvl.root}, +∞[+`
    feedback.value = { type: 'success', text: `Perfect! Nulwaarde x = ${lvl.root}. Tekenschema: ${intervalNotation}` }
    return
  }

  // Error analysis
  if (!rootOk) {
    const guessY = lvl.f(userRoot.value)
    if (Math.abs(guessY) < 0.01) {
      // They got the right root but scanner position issue
      feedback.value = { type: 'error', text: `De nulwaarde is x = ${lvl.root}. Je scanner staat bijna goed, zet hem exact op ${lvl.root}.` }
    } else if (userRoot.value !== undefined && Math.abs(lvl.f(userRoot.value)) < Math.abs(lvl.f(lvl.root + 1))) {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'info', text: `De nulwaarde is de x-coördinaat waar f(x) = 0. Los op: ${lvl.f_str} = 0 → x = ${lvl.root}.` }
      } else {
        feedback.value = { type: 'error', text: `Bij x = ${userRoot.value} is f(x) = ${guessY}. De nulwaarde is waar f(x) = 0. Blijf zoeken.` }
      }
    } else {
      if (attemptCount.value >= 3) {
        feedback.value = { type: 'info', text: `Los ${lvl.f_str} = 0 op → x = ${lvl.root}.` }
      } else {
        feedback.value = { type: 'error', text: `De nulwaarde is fout. Tip: los ${lvl.f_str} = 0 op naar x.` }
      }
    }
    return
  }

  // Signs wrong
  if (userSignLeft.value === lvl.signRight && userSignRight.value === lvl.signLeft) {
    feedback.value = { type: 'error', text: 'Je hebt links en rechts omgewisseld! Bij een stijgende lijn (a>0) is links negatief en rechts positief. Bij een dalende lijn (a<0) is het omgekeerd.' }
  } else if (userSignLeft.value === userSignRight.value && userSignLeft.value !== '') {
    feedback.value = { type: 'error', text: 'Het teken kan niet links en rechts hetzelfde zijn bij een eerstegraadsfunctie (behalve als a = 0). De grafiek kruist de x-as, dus het teken wisselt.' }
  } else if (attemptCount.value >= 3) {
    feedback.value = { type: 'info', text: `Teken: links van x = ${lvl.root} is f(x) ${lvl.signLeft}, rechts is f(x) ${lvl.signRight}.` }
  } else {
    feedback.value = { type: 'error', text: `De nulwaarde klopt (x = ${lvl.root}), maar de tekens niet. Kijk naar de grafiek: ligt ze links van de nulwaarde boven (+) of onder (−) de x-as?` }
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['nulwaarde', 'x-as', 'snij', 'kruis', 'overgang', 'teken', 'wissel', 'positief', 'negatief', 'stijg', 'daal', 'nul']
  if (keywords.some(k => ans.includes(k)) && ans.length > 10) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Denk na: waarom is de nulwaarde belangrijk? Gebruik termen zoals "x-as", "tekenwissel", "snijpunt".' }
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: f(x) = 2x − 6</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Domein:</strong> ℝ &nbsp;|&nbsp; <strong>Bereik:</strong> ℝ</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Nulwaarde:</strong> 2x − 6 = 0 → 2x = 6 → x = <span class="font-bold text-amber-600">3</span></p>
            <p class="text-sm text-slate-700 mb-1"><strong>Tekenschema:</strong></p>
            <div class="bg-white border border-amber-200 rounded p-2 mb-2 text-xs">
              <table class="w-full text-center border-collapse">
                <tr><td class="border border-slate-200 p-1 font-bold">x</td><td class="border border-slate-200 p-1"></td><td class="border border-slate-200 p-1 font-bold text-amber-600">3</td><td class="border border-slate-200 p-1"></td></tr>
                <tr><td class="border border-slate-200 p-1 font-bold">f(x)</td><td class="border border-slate-200 p-1 text-red-600">−</td><td class="border border-slate-200 p-1 font-bold">0</td><td class="border border-slate-200 p-1 text-emerald-600">+</td></tr>
              </table>
            </div>
            <p class="text-xs text-slate-500 mb-1"><strong>Waarom?</strong> a = 2 > 0, dus stijgend. Links van x=3 negatief, rechts positief.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.label }}</p>
            <p class="font-mono text-base font-bold text-slate-800 mt-1">{{ currentLevelData.f_str }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ currentLevelData.goalText }}</p>
          </div>

          <!-- Prediction Gate -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel de nulwaarde: f(x) = 0</p>
            <p class="text-xs text-slate-600 mb-2">Wat is de x-waarde waarvoor f(x) = 0?</p>
            <input type="number" step="0.1" v-model="predictedRoot"
              class="w-full p-3 text-lg font-bold bg-white border-2 border-amber-300 rounded-lg outline-none focus:border-amber-500 tabular-nums text-center mb-2"
              placeholder="x = ?" @keyup.enter="checkPrediction" />
            <button @click="checkPrediction" :disabled="predictedRoot === null || predictedRoot === ''"
              class="w-full py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm active:scale-[0.98]">
              Bevestig voorspelling
            </button>
          </div>

          <!-- Scanner + Sign controls -->
          <div v-if="!showPrediction || showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
            <!-- Scanner slider -->
            <div>
              <label class="block mb-1 text-sm font-bold text-slate-700">1. Vind de Nulwaarde (x = <span class="text-amber-600 font-mono">{{ userRoot }}</span>)</label>
              <input type="range" v-model.number="userRoot" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
              <div class="flex justify-between mt-1 text-[10px] text-slate-400 font-mono"><span>-6</span><span>0</span><span>6</span></div>
            </div>

            <!-- Sign Table Builder -->
            <div>
              <label class="block mb-1 text-sm font-bold text-slate-700">2. Tekenschema</label>
              <div class="bg-white border-2 border-slate-200 rounded-lg p-3 shadow-sm overflow-hidden">
                <table class="w-full border-collapse text-center">
                  <tr>
                    <td class="border-b-2 border-r-2 border-slate-200 text-sm font-bold text-slate-500 py-2 w-12">x</td>
                    <td class="border-b-2 border-slate-200 py-2 w-14"></td>
                    <td class="border-b-2 border-slate-200 font-mono font-bold text-lg text-amber-600">{{ userRoot }}</td>
                    <td class="border-b-2 border-slate-200 py-2 w-14"></td>
                  </tr>
                  <tr>
                    <td class="text-sm font-bold text-slate-500 py-2 border-r-2 border-slate-200">f(x)</td>
                    <td class="py-2">
                      <button @click="toggleSign('left')"
                        class="w-10 h-10 bg-slate-100 rounded-lg hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                        {{ userSignLeft || '±' }}
                      </button>
                    </td>
                    <td class="font-mono font-bold text-xl text-amber-600 py-2 bg-amber-50 rounded-lg">0</td>
                    <td class="py-2">
                      <button @click="toggleSign('right')"
                        class="w-10 h-10 bg-slate-100 rounded-lg hover:bg-slate-200 font-mono text-2xl font-bold text-slate-700 border border-slate-300 transition-colors mx-auto flex items-center justify-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                        {{ userSignRight || '±' }}
                      </button>
                    </td>
                  </tr>
                </table>
                <p class="text-[10px] text-slate-400 mt-1">Klik op ± om te wisselen tussen + en −</p>
              </div>
            </div>

            <button @click="showHint" class="w-full py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-[0.98] flex items-center justify-center gap-2">
              <PhLightbulb class="w-4 h-4" /> Hint {{ hintCount > 0 ? `(${Math.min(hintCount, 3)}/3)` : '' }}
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom is de nulwaarde belangrijk?</p>
            <p class="text-xs text-amber-700 leading-relaxed">{{ currentLevelData.why }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2">Waarom is de nulwaarde het punt waar het teken van f(x) wisselt? Leg uit in je eigen woorden.</p>
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
              :disabled="!userSignLeft || !userSignRight"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">Controleer</button>
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
            <svg width="450" height="450" viewBox="-8 -8 16 16" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">
              <!-- Grid -->
              <g stroke="#e2e8f0" stroke-width="0.1">
                <line v-for="i in 17" :key="'v'+i" :x1="i-9" y1="-8" :x2="i-9" y2="8" />
                <line v-for="i in 17" :key="'h'+i" x1="-8" :y1="i-9" x2="8" :y2="i-9" />
              </g>
              <!-- Zone coloring based on signs -->
              <rect v-if="userSignLeft === '+'" x="-8" y="-8" :width="userRoot + 8" height="8" fill="#d97706" opacity="0.08" />
              <rect v-if="userSignLeft === '-'" x="-8" y="0" :width="userRoot + 8" height="8" fill="#d97706" opacity="0.08" />
              <rect v-if="userSignRight === '+'" :x="userRoot" y="-8" :width="8 - userRoot" height="8" fill="#d97706" opacity="0.08" />
              <rect v-if="userSignRight === '-'" :x="userRoot" y="0" :width="8 - userRoot" height="8" fill="#d97706" opacity="0.08" />
              <!-- Axis labels for zones -->
              <text v-if="userSignLeft" :x="(-8 + userRoot) / 2" y="-7" class="text-xs fill-amber-600 font-bold" text-anchor="middle" font-size="0.5">{{ userSignLeft }}</text>
              <text v-if="userSignRight" :x="(userRoot + 8) / 2" y="-7" class="text-xs fill-amber-600 font-bold" text-anchor="middle" font-size="0.5">{{ userSignRight }}</text>
              <!-- Axes -->
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748b" stroke-width="0.2" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" stroke-width="0.2" />
              <!-- Function graph -->
              <line x1="-8" :y1="-currentLevelData.f(-8)" x2="8" :y2="-currentLevelData.f(8)" stroke="#d97706" stroke-width="0.3" stroke-linecap="round" />
              <!-- Scanner line -->
              <line :x1="userRoot" y1="-8" :x2="userRoot" y2="8" stroke="#f97316" stroke-width="0.2" stroke-dasharray="0.3" class="transition-all duration-150" />
              <circle :cx="userRoot" cy="0" r="0.3" fill="#f97316" class="transition-all duration-150" />
              <!-- Correct highlight -->
              <circle v-if="isCorrect" :cx="currentLevelData.root" cy="0" r="0.5" fill="#d97706" class="animate-pulse" />
              <!-- Annotation: zero label -->
              <text v-if="isCorrect" :x="currentLevelData.root" y="0.8" class="fill-amber-600 font-bold" text-anchor="middle" font-size="0.4">nulwaarde</text>
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
