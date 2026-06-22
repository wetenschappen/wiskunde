<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhRuler,
  PhArrowClockwise,
  PhLightbulb,
  PhBrain,
  PhBookOpen,
  PhChatCircleText,
  PhTarget
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Stelling van Pythagoras (Oppervlaktes)'
  },
  instruction: {
    type: String,
    default: 'De Stelling van Pythagoras draait om vierkanten! Bereken en sleep de juiste oppervlakte naar de bijbehorende vierkanten rond de rechthoekige driehoek.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhRuler }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)

// --- 8-element pedagogical state ---
const showWorkedExample = ref(true)
const workedStep = ref(0)
const workedSteps = [
  { label: 'Driehoek 3-4-5', detail: 'a = 3, b = 4, c = 5' },
  { label: 'Bereken a\u00b2 = 9', detail: '3 x 3 = 9' },
  { label: 'Bereken b\u00b2 = 16', detail: '4 x 4 = 16' },
  { label: 'a\u00b2 + b\u00b2 = 9 + 16 = 25', detail: 'Dat is c\u00b2 = 25, dus c = 5' },
  { label: 'Conclusie: a\u00b2 + b\u00b2 = c\u00b2', detail: 'Pythagoras klopt!' }
]

const showPrediction = ref(true)
const predictionChoice = ref(null)
const predictionMade = ref(false)
const predictionWrongCount = ref(0)

const showWhy = ref(false)
const showErrorAnalysis = ref(false)
const showReflection = ref(false)
const reflectionDone = ref(false)
const showLPDEvidence = ref(false)
const lpdDone = ref(false)
const reflectAns = ref('')

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildOptions(correctValues) {
  const set = new Set(correctValues)
  const distractors = []
  for (let n = 1; n <= 50; n++) {
    if (!set.has(n) && distractors.length < 6) {
      const isPlausible = correctValues.some(c => Math.abs(c - n) <= 15)
      if (isPlausible) distractors.push(n)
    }
  }
  return shuffle([...set, ...distractors])
}

function generateLevel(levelIndex) {
  const easyTriples = [[3, 4, 5], [6, 8, 10], [5, 12, 13]]
  const mediumTriples = [[8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]
  const hardTriples = [[9, 40, 41], [11, 60, 61], [20, 21, 29], [15, 20, 25]]

  const pools = [easyTriples, mediumTriples, hardTriples]
  const triple = pick(pools[Math.min(levelIndex, pools.length - 1)])
  const [sideA, sideB, sideC] = triple
  const areaA = sideA * sideA
  const areaB = sideB * sideB
  const areaC = sideC * sideC

  let predictionQ, predictionOpts, predictionCorrect, goalText, whyText, errorText, reflectQ, lpdText, bloomLabel
  let areaA_given, areaB_given, areaC_given, options, missingLabel, exportAreas

  if (levelIndex === 0) {
    bloomLabel = '(Toepassen)'
    goalText = 'Sleep de juiste oppervlaktes naar de vierkanten a\u00b2, b\u00b2 en c\u00b2.'
    areaA_given = null
    areaB_given = null
    areaC_given = null
    options = buildOptions([areaA, areaB, areaC])
    missingLabel = ''
    predictionQ = 'Bij een rechthoekige driehoek 3-4-5: wat is de oppervlakte van het grootste vierkant (c\u00b2)?'
    predictionOpts = ['9', '16', '25', '20']
    predictionCorrect = '25'
    whyText = '<strong>Waarom a\u00b2 + b\u00b2 = c\u00b2?</strong><br>In een rechthoekige driehoek ligt de rechte hoek tegenover de langste zijde (de schuine zijde c). De oppervlaktes van de vierkanten op de rechthoekszijden zijn samen precies even groot als de oppervlakte van het vierkant op de schuine zijde. Dit komt doordat de oppervlakte van een vierkant het kwadraat van de zijde is, en meetkundig bewijs toont aan dat de twee kleinere vierkanten exact in het grootste passen.'
    errorText = '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>(a + b)\u00b2 vs a\u00b2 + b\u00b2:</strong> Verwar deze niet! (3+4)\u00b2 = 49, maar 3\u00b2+4\u00b2 = 25. Ze zijn heel verschillend.</li><li><strong>Pythagoras werkt alleen voor rechthoekige driehoeken:</strong> Bij een willekeurige driehoek geldt a\u00b2 + b\u00b2 = c\u00b2 niet! Controleer altijd of er een rechte hoek is.</li><li><strong>Verkeerde zijde als c:</strong> De schuine zijde (c) is altijd de LANGSTE zijde, tegenover de rechte hoek.</li></ul>'
    reflectQ = 'Waarom is het belangrijk dat de vierkanten OP de zijden getekend worden? Wat stelt de oppervlakte van elk vierkant voor in de context van de driehoek?'
    lpdText = 'Ik kan aantonen dat a\u00b2 + b\u00b2 = c\u00b2 bij een rechthoekige driehoek door de oppervlaktes van de vierkanten te vergelijken.'
    exportAreas = { areaA, areaB, areaC, sideA, sideB, sideC }
  } else if (levelIndex === 1) {
    bloomLabel = '(Analyseren)'
    goalText = 'Zoek de ontbrekende oppervlakte. Je krijgt twee van de drie vierkanten — bereken het derde.'
    areaA_given = areaA
    areaB_given = null
    areaC_given = areaC
    options = buildOptions([areaB])
    missingLabel = 'b\u00b2'
    predictionQ = `We weten a\u00b2 = ${areaA} en c\u00b2 = ${areaC}. Hoe vinden we b\u00b2?`
    predictionOpts = [`${areaC - areaA}`, `${areaC + areaA}`, `${sideB}`, `${areaA + areaC}`]
    predictionCorrect = String(areaC - areaA)
    whyText = `<strong>Waarom b\u00b2 = c\u00b2 − a\u00b2?</strong><br>Omdat a\u00b2 + b\u00b2 = c\u00b2, kunnen we de vergelijking herschrijven: b\u00b2 = c\u00b2 − a\u00b2. In dit geval is ${areaC} − ${areaA} = ${areaB}. Dit is de omgekeerde toepassing van Pythagoras: in plaats van de schuine zijde te berekenen, zoeken we een rechthoekszijde.`
    errorText = '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>Optellen in plaats van aftrekken:</strong> Als je een rechthoekszijde zoekt, moet je AFTREKKEN (c\u00b2 − a\u00b2), niet optellen.</li><li><strong>Vergeten dat oppervlakte een kwadraat is:</strong> b\u00b2 = ${areaB} betekent dat b = √${areaB} = ${sideB}. Verwar de oppervlakte niet met de zijde zelf.</li><li><strong>Verkeerde formule gebruiken:</strong> Alleen a\u00b2 + b\u00b2 = c\u00b2 is de basis. Bepaal eerst welke zijde gevraagd wordt voordat je de formule herschrijft.</li></ul>'
    reflectQ = 'Waarom kun je bij Pythagoras de formule herschrijven om een ontbrekende zijde te vinden? Hoe verandert de strategie als je de schuine zijde zoekt versus een rechthoekszijde?'
    lpdText = 'Ik kan een ontbrekende oppervlakte berekenen door de formule a\u00b2 + b\u00b2 = c\u00b2 te herschrijven.'
    exportAreas = { areaA, areaB, areaC, sideA, sideB, sideC }
  } else {
    bloomLabel = '(Evalueren)'
    goalText = 'Je krijgt alleen de zijdelengtes. Bereken zelf de oppervlaktes van alle drie de vierkanten en controleer of de stelling van Pythagoras klopt.'
    areaA_given = null
    areaB_given = null
    areaC_given = null
    options = buildOptions([areaA, areaB, areaC])
    missingLabel = ''
    predictionQ = `Driehoek met zijden ${sideA}, ${sideB}, ${sideC}. Klopt het dat ${sideA}\u00b2 + ${sideB}\u00b2 = ${sideC}\u00b2?`
    predictionOpts = ['Ja', 'Nee', 'Alleen bij benadering']
    predictionCorrect = 'Ja'
    whyText = `<strong>Waarom klopt ${sideA}\u00b2 + ${sideB}\u00b2 = ${sideC}\u00b2?</strong><br>Omdat (${sideA}, ${sideB}, ${sideC}) een Pythagoreisch drietal is: ${areaA} + ${areaB} = ${areaC}. De stelling van Pythagoras zegt dat de som van de kwadraten van de rechthoekszijden gelijk is aan het kwadraat van de schuine zijde — maar alleen voor rechthoekige driehoeken. Dit drietal voldoet, dus de driehoek is gegarandeerd rechthoekig.`
    errorText = '<strong>Let op! Veelgemaakte fouten:</strong><ul class="list-disc pl-4 mt-1 space-y-1"><li><strong>Alleen checken of a\u00b2 + b\u00b2 = c\u00b2 volstaat niet altijd:</strong> Soms kan een drietal aan de formule voldoen zonder een geldige driehoek te zijn (bv. als c niet de langste zijde is). Controleer altijd of c de langste zijde is.</li><li><strong>Beweringen omkeren:</strong> Als a\u00b2 + b\u00b2 = c\u00b2, dan is de driehoek rechthoekig. Maar het omgekeerde (een rechthoekige driehoek is altijd een Pythagoreisch drietal) is ook waar.</li><li><strong>Rekenfouten:</strong> Controleer je kwadraten: ${sideA}\u00b2 = ${areaA}, ${sideB}\u00b2 = ${areaB}, ${sideC}\u00b2 = ${areaC}. Tel de eerste twee op en kijk of de som met de derde overeenkomt.</li></ul>'
    reflectQ = 'Waarom is het omgekeerde van Pythagoras (als a\u00b2+b\u00b2=c\u00b2, dan is de driehoek rechthoekig) een krachtig gereedschap in de meetkunde? Hoe zou je dit gebruiken in een bewijs?'
    lpdText = 'Ik kan evalueren of een driehoek rechthoekig is door de stelling van Pythagoras toe te passen op de kwadraten van de zijden.'
    exportAreas = { areaA, areaB, areaC, sideA, sideB, sideC }
  }

  return {
    goalText, sideA, sideB, sideC,
    areaA_given, areaB_given, areaC_given,
    targetA: areaA, targetB: areaB, targetC: areaC,
    options, missingLabel, bloomLabel,
    predictionQ, predictionOpts, predictionCorrect,
    whyText, errorText, reflectQ, lpdText,
    exportAreas
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Slots for drag-and-drop
const slotA = ref(null)
const slotB = ref(null)
const slotC = ref(null)

let draggedItem = null

function onDragStart(val) {
  if (isCorrect.value) return
  draggedItem = val
}

function onDrop(target) {
  if (isCorrect.value || !draggedItem) return
  if (target === 'A') slotA.value = draggedItem
  if (target === 'B') slotB.value = draggedItem
  if (target === 'C') slotC.value = draggedItem
  draggedItem = null
  isChecked.value = false
  tryAutoCorrect()
}

function removeSlot(target) {
  if (isCorrect.value) return
  if (target === 'A') slotA.value = null
  if (target === 'B') slotB.value = null
  if (target === 'C') slotC.value = null
  isChecked.value = false
}

function getHintText() {
  const d = currentLevelData.value
  const c = hintCount.value

  if (c <= 1) {
    if (d.levelIndex === 1) {
      return '<strong>Hint 1:</strong> Je kent twee van de drie oppervlaktes. Welke formule verbindt alle drie? a\u00b2 + b\u00b2 = c\u00b2. Als c\u00b2 en a\u00b2 bekend zijn, hoe vind je dan b\u00b2?'
    }
    if (d.levelIndex === 2) {
      return '<strong>Hint 1:</strong> Je moet eerst de oppervlakte van elk vierkant berekenen: a\u00b2 = ' + d.sideA + ' \u00d7 ' + d.sideA + ', b\u00b2 = ' + d.sideB + ' \u00d7 ' + d.sideB + ', c\u00b2 = ' + d.sideC + ' \u00d7 ' + d.sideC + '. Sleep daarna de juiste waarde naar elk vierkant.'
    }
    return '<strong>Hint 1:</strong> Bereken eerst de oppervlakte van elk vierkant. De oppervlakte van een vierkant met zijde x is x\u00b2 (x \u00d7 x). Sleep daarna de juiste getallen naar de juiste vierkanten.'
  } else if (c <= 3) {
    if (d.levelIndex === 1) {
      return '<strong>Hint 2:</strong> Voorbeeld: bij een driehoek 3-4-5 met a\u00b2 = 9 en c\u00b2 = 25, berekenen we b\u00b2 = 25 − 9 = 16. Pas dit toe op jouw getallen: ' + d.targetC + ' − ' + d.targetA + ' = ?'
    }
    if (d.levelIndex === 2) {
      return '<strong>Hint 2:</strong> Voorbeeld: een driehoek 6-8-10 heeft a\u00b2 = 36, b\u00b2 = 64, c\u00b2 = 100. En 36 + 64 = 100. Bereken nu voor jouw driehoek: a\u00b2 = ' + d.sideA + '\u00b2 = ..., b\u00b2 = ' + d.sideB + '\u00b2 = ..., c\u00b2 = ' + d.sideC + '\u00b2 = ...'
    }
    return '<strong>Hint 2:</strong> Voorbeeld: driehoek 3-4-5: oppervlakte a\u00b2 = 3\u00b2 = 9, b\u00b2 = 4\u00b2 = 16, c\u00b2 = 5\u00b2 = 25. In jouw driehoek: a\u00b2 = ' + d.sideA + '\u00b2 = ___, b\u00b2 = ' + d.sideB + '\u00b2 = ___, c\u00b2 = ' + d.sideC + '\u00b2 = ___'
  } else {
    if (d.levelIndex === 1) {
      return '<strong>Hint 3:</strong> Methode: b\u00b2 = c\u00b2 − a\u00b2. Hier: b\u00b2 = ' + d.targetC + ' − ' + d.targetA + ' = ___. Het antwoord is ' + d.targetB + '.'
    }
    if (d.levelIndex === 2) {
      return '<strong>Hint 3:</strong> Methode: voor elke rechthoekige driehoek geldt a\u00b2 + b\u00b2 = c\u00b2. Hier: ' + d.sideA + '\u00b2 + ' + d.sideB + '\u00b2 = ' + d.sideC + '\u00b2. Bereken: a\u00b2 = ' + d.targetA + ', b\u00b2 = ' + d.targetB + ', c\u00b2 = ' + d.targetC + '. Sleep dan ' + d.targetA + ', ' + d.targetB + ' en ' + d.targetC + ' naar de juiste vierkanten.'
    }
    return '<strong>Hint 3:</strong> Methode: maak de berekening af. a = ' + d.sideA + ', a\u00b2 = ' + d.sideA + ' \u00d7 ' + d.sideA + ' = ___. b = ' + d.sideB + ', b\u00b2 = ' + d.sideB + ' \u00d7 ' + d.sideB + ' = ___. c = ' + d.sideC + ', c\u00b2 = ' + d.sideC + ' \u00d7 ' + d.sideC + ' = ___. De antwoorden zijn ' + d.targetA + ', ' + d.targetB + ' en ' + d.targetC + '.'
  }
}

function tryAutoCorrect() {
  const d = currentLevelData.value
  const slotAVal = slotA.value
  const slotBVal = slotB.value
  const slotCVal = slotC.value

  const needA = d.areaA_given === null
  const needB = d.areaB_given === null
  const needC = d.areaC_given === null

  if ((needA && slotAVal === null) || (needB && slotBVal === null) || (needC && slotCVal === null)) {
    return
  }

  const aCorrect = !needA || slotAVal === d.targetA
  const bCorrect = !needB || slotBVal === d.targetB
  const cCorrect = !needC || slotCVal === d.targetC

  if (aCorrect && bCorrect && cCorrect) {
    isCorrect.value = true
    const a = needA ? slotAVal : d.targetA
    const b = needB ? slotBVal : d.targetB
    const c = needC ? slotCVal : d.targetC
    const sentence = `${a} + ${b} = ${c}`
    feedback.value = {
      type: 'success',
      text: `Schitterend! a\u00b2 + b\u00b2 = c\u00b2: ${sentence}. De stelling van Pythagoras klopt!`
    }
  } else {
    attemptCount.value++
    if (slotAVal !== null && slotAVal !== d.targetA && needA) {
      feedback.value = { type: 'error', text: `Let op: a\u00b2 = ${d.sideA}\u00b2 = ${d.targetA}, niet ${slotAVal}.` }
    } else if (slotBVal !== null && slotBVal !== d.targetB && needB) {
      feedback.value = { type: 'error', text: `Let op: b\u00b2 = ${d.sideB}\u00b2 = ${d.targetB}, niet ${slotBVal}.` }
    } else if (slotCVal !== null && slotCVal !== d.targetC && needC) {
      feedback.value = { type: 'error', text: `Let op: c\u00b2 = ${d.sideC}\u00b2 = ${d.targetC}, niet ${slotCVal}.` }
    } else {
      feedback.value = { type: 'error', text: `Niet helemaal. Controleer of de waarden kloppen: a\u00b2 + b\u00b2 moet gelijk zijn aan c\u00b2.` }
    }
  }
}

function submitPrediction() {
  if (predictionChoice.value === null) return
  const d = currentLevelData.value
  const chosen = d.predictionOpts[predictionChoice.value]
  if (chosen === d.predictionCorrect) {
    showPrediction.value = false
    predictionMade.value = true
    feedback.value = {
      type: 'info',
      text: '<strong>Juist voorspeld!</strong> Sleep nu de juiste oppervlaktes naar de vierkanten.'
    }
  } else {
    predictionWrongCount.value++
    hintCount.value++
    feedback.value = {
      type: 'error',
      text: `<strong>Niet helemaal.</strong> "${chosen}" is niet correct. Denk opnieuw na en kies een ander antwoord.`
    }
  }
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    const lvl = generateLevel(i)
    lvl.levelIndex = i
    newLevels.push(lvl)
  }
  levels.value = newLevels

  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  attemptCount.value = 0
  hintCount.value = 0

  const d = currentLevelData.value
  slotA.value = d.areaA_given
  slotB.value = d.areaB_given
  slotC.value = d.areaC_given

  showPrediction.value = true
  predictionChoice.value = null
  predictionMade.value = false
  predictionWrongCount.value = 0
  showWhy.value = false
  showErrorAnalysis.value = false
  showReflection.value = false
  reflectionDone.value = false
  showLPDEvidence.value = false
  lpdDone.value = false
  reflectAns.value = ''
}

function triggerHint() {
  hintCount.value++
  attemptCount.value++
}

function handleWhyDone() {
  /* shown inline */
}

function handleReflectionDone() {
  if (reflectAns.value.trim().length > 0) {
    reflectionDone.value = true
  }
}

function handleLPDDone() {
  lpdDone.value = true
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    showWorkedExample.value = currentInternalLevel.value === 0
    workedStep.value = 0
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

function advanceNextCheck() {
  if (!showWhy.value) {
    showWhy.value = true
    showErrorAnalysis.value = true
    return
  }
  if (!showReflection.value) {
    showReflection.value = true
    return
  }
  if (!reflectionDone.value && reflectAns.value.trim().length === 0) {
    return
  }
  if (!reflectionDone.value) {
    reflectionDone.value = true
    return
  }
  if (!showLPDEvidence.value && currentInternalLevel.value === totalInternalLevels - 1) {
    showLPDEvidence.value = true
    return
  }
  if (showLPDEvidence.value && !lpdDone.value) {
    lpdDone.value = true
    return
  }
  handleNext()
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    showWorkedExample.value = true
    workedStep.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      shouldPulse.value = true
      setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    shouldPulse.value = false
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')"
         @keydown.space.prevent="emit('close')"
         aria-label="Sluiten">
    </div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <!-- HEADER -->
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">
                Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}
                <span v-if="currentLevelData" class="ml-1 text-amber-600 font-bold">{{ currentLevelData.bloomLabel }}</span>
              </p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'">
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <!-- LEFT PANEL -->
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">

            <!-- WORKED EXAMPLE (Level 0 only) -->
            <div v-if="showWorkedExample && currentInternalLevel === 0"
                 class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" />
                <h4 class="font-bold text-indigo-800">Voorbeeld: Pythagoras visueel</h4>
              </div>
              <div class="space-y-1">
                <div v-for="(s, i) in workedSteps" :key="i"
                     @click="workedStep = i"
                     class="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                     :class="workedStep === i ? 'bg-indigo-100' : 'hover:bg-indigo-100/50'">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                       :class="workedStep >= i ? 'bg-indigo-500 text-white' : 'bg-indigo-200 text-indigo-400'">
                    {{ i + 1 }}
                  </div>
                  <div>
                    <p class="text-sm font-medium"
                       :class="workedStep === i ? 'text-indigo-900' : 'text-indigo-600'">
                      {{ s.label }}
                    </p>
                    <p v-if="workedStep === i" class="text-xs text-indigo-500">
                      {{ s.detail }}
                    </p>
                  </div>
                </div>
              </div>
              <button @click="showWorkedExample = false"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                Begrepen! Start de opdracht
              </button>
            </div>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction && !showWorkedExample"
                 class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.predictionQ }}
              </p>
              <div class="flex gap-2 mb-3 flex-wrap">
                <button v-for="(opt, idx) in currentLevelData.predictionOpts" :key="idx"
                        @click="predictionChoice = idx"
                        class="px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all"
                        :class="predictionChoice === idx
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'">
                  {{ opt }}
                </button>
              </div>
              <button @click="submitPrediction"
                      :disabled="predictionChoice === null"
                      class="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <!-- GOAL TEXT -->
            <div v-if="!showWorkedExample && !showPrediction"
                 class="text-center bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm mb-4 animate-fadeIn">
              <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- WHY EXPLANATION -->
            <div v-if="showWhy"
                 class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhCheckCircle weight="fill" class="w-5 h-5 text-indigo-600" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <MathText :content="currentLevelData.whyText"
                        class="text-sm text-indigo-700 leading-relaxed" />
            </div>

            <!-- ERROR ANALYSIS -->
            <div v-if="showErrorAnalysis"
                 class="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle weight="fill" class="w-5 h-5 text-red-500" />
                <span class="font-bold text-red-700 text-sm">Let op! Veelgemaakte fouten</span>
              </div>
              <div class="text-sm text-red-600 leading-relaxed"
                   v-html="currentLevelData.errorText">
              </div>
            </div>

            <!-- OPTIONS (drag sources) -->
            <div v-if="!showWorkedExample && !showPrediction" class="mt-4 space-y-4">
              <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Sleep het juiste getal</p>
              <div class="flex flex-wrap gap-3">
                <div v-for="opt in currentLevelData.options" :key="opt"
                     draggable="true"
                     @dragstart="onDragStart(opt)"
                     class="w-14 h-14 border-2 border-slate-300 bg-white rounded-xl flex items-center justify-center font-bold text-lg font-mono text-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm tabular-nums"
                     :class="{ 'opacity-30 pointer-events-none': slotA === opt || slotB === opt || slotC === opt }">
                  {{ opt }}
                </div>
              </div>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectionDone && !showWorkedExample && !showPrediction"
                 class="mt-6 p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhChatCircleText class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800">Reflectie</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                {{ currentLevelData.reflectQ }}
              </p>
              <textarea v-model="reflectAns" rows="3"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Typ je antwoord...">
              </textarea>
              <button @click="handleReflectionDone"
                      :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <!-- LPD EVIDENCE -->
            <div v-if="showLPDEvidence && !lpdDone"
                 class="mt-6 p-5 border-2 border-emerald-300 bg-emerald-50 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhTarget class="w-5 h-5 text-emerald-600" weight="fill" />
                <span class="font-bold text-emerald-800">LPD-bewijs</span>
              </div>
              <p class="text-sm text-emerald-700 mb-3">
                {{ currentLevelData.lpdText }}
              </p>
              <button @click="handleLPDDone"
                      class="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
                Ik bevestig dat ik dit doel bereikt heb
              </button>
            </div>

          </div>

          <!-- FOOTER -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle"
                          class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="feedback.text"></span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && hintCount > 0 && !showWorkedExample && !showPrediction"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed" v-html="getHintText()"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <!-- Before correct: hint button -->
              <button v-if="!isCorrect && !showWorkedExample && !showPrediction"
                      @click="triggerHint"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Geef me een hint
              </button>

              <!-- After correct: advance through pedagogical layers -->
              <button v-else-if="isCorrect"
                      @click="advanceNextCheck"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>
                  <template v-if="!showWhy">Waarom?</template>
                  <template v-else-if="!showReflection">Reflecteer</template>
                  <template v-else-if="!reflectionDone">Bevestig reflectie</template>
                  <template v-else-if="showLPDEvidence && !lpdDone">LPD-bewijs</template>
                  <template v-else>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</template>
                </span>
                <PhArrowRight weight="bold" />
              </button>

              <div v-else-if="showPrediction" class="flex-1 text-sm text-slate-400 text-center">
                Beantwoord eerst de voorspelling
              </div>
              <div v-else-if="showWorkedExample" class="flex-1 text-sm text-slate-400 text-center">
                Doorloop het voorbeeld
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: Visuals -->
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <!-- Scale visualization -->
              <div v-if="currentLevelData"
                   class="relative flex items-center justify-center transition-all duration-700 scale-75 md:scale-100">

                <!-- The central triangle -->
                <div class="absolute w-[120px] h-[160px] bg-slate-200"
                     style="clip-path: polygon(100% 0%, 0% 100%, 100% 100%); left: 0px; top: 0px;">
                </div>

                <!-- Right angle marker -->
                <div class="absolute border-t-4 border-l-4 border-slate-800 w-6 h-6"
                     style="left: 116px; top: 156px; transform: rotate(180deg);">
                </div>

                <!-- Side A Label (bottom) -->
                <div class="absolute font-bold text-blue-800 bg-white/80 px-1 rounded-lg tabular-nums"
                     style="left: 60px; top: 165px;">
                  a = {{ currentLevelData.sideA }}
                </div>

                <!-- Side B Label (right) -->
                <div class="absolute font-bold text-amber-600 bg-white/80 px-1 rounded-lg tabular-nums"
                     style="left: 130px; top: 80px;">
                  b = {{ currentLevelData.sideB }}
                </div>

                <!-- Side C Label (hypotenuse) -->
                <div class="absolute font-bold text-emerald-800 bg-white/80 px-1 rounded-lg tabular-nums transform -rotate-[53deg]"
                     style="left: 20px; top: 70px;">
                  c = {{ currentLevelData.sideC }}
                </div>

                <!-- Square A (Bottom) -->
                <div class="absolute flex flex-col items-center justify-center bg-blue-100 border-4 border-blue-400 rounded-lg shadow-inner"
                     style="left: 0px; top: 160px; width: 120px; height: 120px;">
                  <span class="text-blue-500 font-bold text-xs mb-1">a\u00b2</span>
                  <div v-if="currentLevelData.areaA_given !== null"
                       class="text-3xl font-mono font-black text-blue-600 tabular-nums">
                    {{ slotA }}
                  </div>
                  <div v-else
                       @dragover.prevent.stop
                       @drop.prevent.stop="onDrop('A')"
                       class="w-14 h-14 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
                       :class="slotA ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-blue-500 text-blue-600') : 'border-blue-300'"
                       @click="removeSlot('A')"
                       role="button" tabindex="0"
                       @keydown.enter.prevent="removeSlot('A')"
                       @keydown.space.prevent="removeSlot('A')">
                    <span v-if="slotA" class="font-mono text-xl font-black tabular-nums">{{ slotA }}</span>
                  </div>
                </div>

                <!-- Square B (Right) -->
                <div class="absolute flex flex-col items-center justify-center bg-amber-100 border-4 border-amber-400 rounded-lg shadow-inner"
                     style="left: 120px; top: 0px; width: 160px; height: 160px;">
                  <span class="text-amber-500 font-bold text-xs mb-1">b\u00b2</span>
                  <div v-if="currentLevelData.areaB_given !== null"
                       class="text-3xl font-mono font-black text-amber-600 tabular-nums">
                    {{ slotB }}
                  </div>
                  <div v-else
                       @dragover.prevent.stop
                       @drop.prevent.stop="onDrop('B')"
                       class="w-14 h-14 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
                       :class="slotB ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-amber-500 text-amber-600') : 'border-amber-300'"
                       @click="removeSlot('B')"
                       role="button" tabindex="0"
                       @keydown.enter.prevent="removeSlot('B')"
                       @keydown.space.prevent="removeSlot('B')">
                    <span v-if="slotB" class="font-mono text-xl font-black tabular-nums">{{ slotB }}</span>
                  </div>
                </div>

                <!-- Square C (Hypotenuse) -->
                <div class="absolute flex flex-col items-center justify-center bg-emerald-100 border-4 border-emerald-400 rounded-lg shadow-inner"
                     style="width: 200px; height: 200px; transform: rotate(36.87deg) translateY(-200px) translateX(0px); left: 0px; top: 160px;">
                  <div class="transform -rotate-[36.87deg] flex flex-col items-center">
                    <span class="text-emerald-600 font-bold text-xs mb-2">c\u00b2</span>
                    <div v-if="currentLevelData.areaC_given !== null"
                         class="text-4xl font-mono font-black text-emerald-600 tabular-nums">
                      {{ slotC }}
                    </div>
                    <div v-else
                         @dragover.prevent.stop
                         @drop.prevent.stop="onDrop('C')"
                         class="w-16 h-16 border-4 border-dashed rounded-xl flex items-center justify-center bg-white shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
                         :class="slotC ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-emerald-500 text-emerald-600') : 'border-emerald-300'"
                         @click="removeSlot('C')"
                         role="button" tabindex="0"
                         @keydown.enter.prevent="removeSlot('C')"
                         @keydown.space.prevent="removeSlot('C')">
                      <span v-if="slotC" class="font-mono text-2xl font-black tabular-nums">{{ slotC }}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <!-- Pythagoras sentence -->
            <div v-if="isCorrect && currentLevelData"
                 class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-fadeIn">
              <p class="font-bold text-emerald-800 text-lg font-mono tabular-nums">
                {{ currentLevelData.exportAreas.areaA }} + {{ currentLevelData.exportAreas.areaB }} = {{ currentLevelData.exportAreas.areaC }}
              </p>
              <p class="text-emerald-600 text-sm mt-1">
                a\u00b2 + b\u00b2 = c\u00b2 &check; De stelling van Pythagoras klopt!
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone"
                    @done="celebrationDone = true"
                    :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
:root {
  font-family: 'Inter', sans-serif;
}

.shadow-inner-light {
  box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1);
}

.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.ring-pulse-amber {
  animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3;
  z-index: 50;
}

@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
