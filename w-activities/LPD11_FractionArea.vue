<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise, PhLightbulb, PhMinus
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Breuken met Oppervlaktemodellen' },
  instruction: {
    type: String,
    default: 'Breuken optellen en aftrekken kan je zien met een oppervlaktemodel. Het rooster stelt de gemeenschappelijke noemer voor.<br/><br/><strong>Opdracht:</strong> Voorspel de uitkomst en gebruik de schuifregelaars om je antwoord te controleren.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Voorspel de breuk voordat je de schuifregelaars gebruikt.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

const showPrediction = ref(true)
const predictedNum = ref(null)
const predictedDen = ref(null)
const showWorkedExample = ref(true)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionPassed = ref(false)
const showWhy = ref(false)
const whyText = ref('')
const errorDetected = ref('')

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

function generateLevel(levelIndex) {
  if (levelIndex === 0) {
    // Level 1: Identify a fraction from a shaded area model
    const configs = [
      { total: 8, colored: 3, rows: 2, cols: 4 },
      { total: 6, colored: 2, rows: 2, cols: 3 },
      { total: 9, colored: 4, rows: 3, cols: 3 },
      { total: 10, colored: 3, rows: 2, cols: 5 },
      { total: 12, colored: 5, rows: 3, cols: 4 },
      { total: 8, colored: 5, rows: 2, cols: 4 }
    ]
    const c = pick(configs)
    const g = gcd(c.colored, c.total)
    return {
      mode: 'identify',
      goalText: `Opdracht 1: Welk deel van de figuur is gekleurd?`,
      totalCells: c.total, coloredCount: c.colored,
      rows: c.rows, cols: c.cols,
      answerNum: c.colored / g, answerDen: c.total / g,
      frac1Num: c.colored, frac1Den: c.total
    }
  } else if (levelIndex === 1) {
    // Level 2: Add fractions
    const configs = [
      { n1: 1, d1: 4, n2: 1, d2: 6, rows: 3, cols: 4 },
      { n1: 1, d1: 3, n2: 1, d2: 4, rows: 3, cols: 4 },
      { n1: 1, d1: 2, n2: 1, d2: 3, rows: 2, cols: 3 },
      { n1: 1, d1: 3, n2: 2, d2: 5, rows: 3, cols: 5 },
      { n1: 2, d1: 5, n2: 1, d2: 4, rows: 4, cols: 5 },
      { n1: 1, d1: 4, n2: 3, d2: 8, rows: 4, cols: 4 }
    ]
    const c = pick(configs)
    const common = lcm(c.d1, c.d2)
    const scaled1n = c.n1 * (common / c.d1)
    const scaled2n = c.n2 * (common / c.d2)
    const sum = scaled1n + scaled2n
    const g = gcd(sum, common)
    return {
      mode: 'add',
      goalText: `Opdracht 2: ${c.n1}/${c.d1} + ${c.n2}/${c.d2}`,
      totalCells: common, rows: c.rows, cols: c.cols,
      frac1Num: c.n1, frac1Den: c.d1,
      frac2Num: c.n2, frac2Den: c.d2,
      scaled1Num: scaled1n, scaled2Num: scaled2n,
      answerNum: sum / g, answerDen: common / g,
      rawNum: sum, rawDen: common,
      commonDen: common,
      needsSimplify: g > 1
    }
  } else {
    // Level 3: Subtract fractions
    const configs = [
      { n1: 1, d1: 2, n2: 1, d2: 4, rows: 2, cols: 4 },
      { n1: 2, d1: 3, n2: 1, d2: 2, rows: 2, cols: 3 },
      { n1: 3, d1: 4, n2: 1, d2: 3, rows: 3, cols: 4 },
      { n1: 2, d1: 3, n2: 2, d2: 5, rows: 3, cols: 5 },
      { n1: 3, d1: 4, n2: 1, d2: 2, rows: 2, cols: 4 },
      { n1: 5, d1: 6, n2: 1, d2: 3, rows: 3, cols: 6 }
    ]
    const c = pick(configs)
    const common = lcm(c.d1, c.d2)
    const scaled1n = c.n1 * (common / c.d1)
    const scaled2n = c.n2 * (common / c.d2)
    const diff = scaled1n - scaled2n
    const g = gcd(Math.abs(diff), common)
    return {
      mode: 'subtract',
      goalText: `Opdracht 3: ${c.n1}/${c.d1} - ${c.n2}/${c.d2}`,
      totalCells: common, rows: c.rows, cols: c.cols,
      frac1Num: c.n1, frac1Den: c.d1,
      frac2Num: c.n2, frac2Den: c.d2,
      scaled1Num: scaled1n, scaled2Num: scaled2n,
      answerNum: diff / g, answerDen: common / g,
      rawNum: diff, rawDen: common,
      commonDen: common,
      needsSimplify: g > 1 && diff > 0
    }
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const slider1 = ref(0)
const slider2 = ref(0)

const hintLevels = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']

  if (d.mode === 'identify') {
    return [
      `Het hele rooster stelt 1 geheel voor. Hoeveel vakjes zijn er in totaal? Hoeveel zijn er gekleurd?`,
      `Voorbeeld: 4 van de 6 vakjes gekleurd = 4/6 = 2/3 (vereenvoudigd). Hoeveel van de ${d.totalCells} vakjes zijn oranje?`,
      `Totaal: ${d.totalCells} vakjes. Gekleurd: ${d.coloredCount} vakjes. Breuk: ${d.coloredCount}/${d.totalCells} = __/__ (vereenvoudigd)`
    ]
  }

  if (d.mode === 'add') {
    return [
      `Eerst gelijknamig maken: de noemer wordt KGV = ${d.commonDen}. ${d.frac1Num}/${d.frac1Den} = ?/${d.commonDen} en ${d.frac2Num}/${d.frac2Den} = ?/${d.commonDen}`,
      `Voorbeeld: 1/3 + 1/6. Eerst gelijknamig: 1/3 = 2/6. Dan optellen: 2/6 + 1/6 = 3/6 = 1/2. Nu bij jou: ${d.frac1Num}/${d.frac1Den} + ${d.frac2Num}/${d.frac2Den}.`,
      `${d.frac1Num}/${d.frac1Den} = ${d.scaled1Num}/${d.commonDen}  en  ${d.frac2Num}/${d.frac2Den} = ${d.scaled2Num}/${d.commonDen}.  ${d.scaled1Num}/${d.commonDen} + ${d.scaled2Num}/${d.commonDen} = __/${d.commonDen} = __/__ (vereenvoudigd)`
    ]
  }

  if (d.mode === 'subtract') {
    return [
      `Eerst gelijknamig maken: de noemer wordt KGV = ${d.commonDen}. Dan tellers aftrekken.`,
      `Voorbeeld: 1/2 - 1/4. Eerst gelijknamig: 1/2 = 2/4. Dan aftrekken: 2/4 - 1/4 = 1/4. Nu bij jou: ${d.frac1Num}/${d.frac1Den} - ${d.frac2Num}/${d.frac2Den}.`,
      `${d.frac1Num}/${d.frac1Den} = ${d.scaled1Num}/${d.commonDen}  en  ${d.frac2Num}/${d.frac2Den} = ${d.scaled2Num}/${d.commonDen}.  ${d.scaled1Num}/${d.commonDen} - ${d.scaled2Num}/${d.commonDen} = __/${d.commonDen} = __/__`
    ]
  }
  return ['', '', '']
})

function getHintText() {
  const idx = Math.min(hintCount.value - 1, hintLevels.value.length - 1)
  if (idx >= 0) return hintLevels.value[idx]
  return ''
}

function getCellState(idx) {
  const d = currentLevelData.value
  if (!d) return 'white'

  if (d.mode === 'identify') {
    // First `coloredCount` cells are amber
    return idx < d.coloredCount ? 'amber' : 'white'
  }

  if (d.mode === 'add') {
    // First `scaled1Num` cells are amber-400 (frac1)
    // Next `scaled2Num` cells are amber-200 (frac2)
    if (idx < d.scaled1Num) return 'frac1'
    if (idx < d.scaled1Num + d.scaled2Num) return 'frac2'
    return 'white'
  }

  if (d.mode === 'subtract') {
    // First `scaled1Num` cells are amber-400 (frac1/minuend)
    // First `scaled2Num` of those are crossed out (subtrahend)
    if (idx < d.scaled1Num) {
      if (idx < d.scaled2Num) return 'crossed'
      return 'frac1'
    }
    return 'white'
  }

  return 'white'
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Voorspel de breuk voordat je de schuifregelaars gebruikt.' }
  attemptCount.value = 0
  hintCount.value = 0
  slider1.value = 0
  slider2.value = 0
  predictedNum.value = null
  predictedDen.value = null
  showPrediction.value = true
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionPassed.value = false
  showWhy.value = false
  whyText.value = ''
  errorDetected.value = ''
  showWorkedExample.value = currentInternalLevel.value === 0
}

function submitPrediction() {
  const d = currentLevelData.value
  if (predictedNum.value === null || predictedDen.value === null ||
      predictedNum.value === '' || predictedDen.value === '') {
    feedback.value = { type: 'error', text: 'Vul zowel een teller als een noemer in.' }
    return
  }

  const userGcd = gcd(predictedNum.value, predictedDen.value)
  const userSimpleNum = predictedNum.value / userGcd
  const userSimpleDen = predictedDen.value / userGcd

  const targetSimpleNum = d.answerNum
  const targetSimpleDen = d.answerDen

  if (userSimpleNum === targetSimpleNum && userSimpleDen === targetSimpleDen) {
    const label = d.mode === 'identify' ? 'de breuk' : (d.mode === 'add' ? 'de som' : 'het verschil')
    feedback.value = {
      type: 'success',
      text: `Correct! ${label} = ${d.answerNum}/${d.answerDen}. Gebruik nu de schuifregelaars om je antwoord visueel te controleren.`
    }
    showPrediction.value = false
    hintCount.value = 0
  } else {
    attemptCount.value++

    // Error analysis
    if (d.mode === 'add' || d.mode === 'subtract') {
      // Check if they added/subtracted denominators
      if (userSimpleNum !== targetSimpleNum && userSimpleDen === targetSimpleDen) {
        feedback.value = {
          type: 'error',
          text: `De noemer ${userSimpleDen} klopt, maar de teller nog niet. Denk aan: tellers ${d.mode === 'add' ? 'optellen' : 'aftrekken'} na gelijknamig maken.`
        }
      } else if (d.mode === 'add' && predictedNum.value === d.frac1Num + d.frac2Num && predictedDen.value === d.frac1Den + d.frac2Den) {
        feedback.value = {
          type: 'error',
          text: `Je hebt tellers EN noemers opgeteld: ${d.frac1Num}+${d.frac2Num}=${predictedNum.value} en ${d.frac1Den}+${d.frac2Den}=${predictedDen.value}. Bij breuken optellen moet je EERST gelijknamig maken (noemer = KGV), pas DAN tellers optellen. Noemers worden NOOIT opgeteld!`
        }
      } else if (d.mode === 'add' && predictedDen.value === d.frac1Den + d.frac2Den) {
        feedback.value = {
          type: 'error',
          text: `Je hebt noemers opgeteld (${d.frac1Den}+${d.frac2Den}=${predictedDen.value}). Noemers mag je NIET optellen! Eerst gelijknamig maken, dan alleen tellers optellen.`
        }
      } else if (d.mode === 'add' && predictedDen.value === d.frac1Den && predictedDen.value === d.frac2Den) {
        feedback.value = {
          type: 'error',
          text: `De noemer ${predictedDen.value} klopt niet voor beide breuken — ze hebben verschillende noemers. Maak ze eerst gelijknamig! KGV(${d.frac1Den}, ${d.frac2Den}) = ${d.commonDen}.`
        }
      } else if (d.mode === 'subtract' && predictedNum.value === Math.abs(d.frac1Num - d.frac2Num) && predictedDen.value === Math.max(d.frac1Den, d.frac2Den)) {
        feedback.value = {
          type: 'error',
          text: `Je hebt de breuken niet gelijknamig gemaakt. Eerst de noemer gelijk maken (KGV = ${d.commonDen}), dan pas de tellers aftrekken.`
        }
      } else {
        const opLabel = d.mode === 'add' ? 'optellen' : 'aftrekken'
        feedback.value = {
          type: 'error',
          text: `${predictedNum.value}/${predictedDen.value} klopt niet. Denk aan: gelijknamig maken, dan tellers ${opLabel}.`
        }
      }
    } else {
      // Level 1: identify
      feedback.value = {
        type: 'error',
        text: `${predictedNum.value}/${predictedDen.value} is niet correct. Tel het aantal gekleurde vakjes (teller) en het totaal aantal vakjes (noemer). Vereenvoudig daarna.`
      }
    }
  }
}

function showHint() {
  hintCount.value++
  feedback.value = { type: 'info', text: getHintText() }
}

function skipWorkedExample() {
  showWorkedExample.value = false
}

function checkAnswer() {
  isChecked.value = true
  const d = currentLevelData.value

  if (d.mode === 'identify') {
    // Check sliders match
    if (slider1.value === d.coloredCount) {
      isCorrect.value = true
      showReflection.value = true
      reflectionAnswer.value = ''
      reflectionPassed.value = false
      errorDetected.value = ''
      showWhy.value = true
      whyText.value = 'De noemer is het totale aantal gelijke delen (${d.totalCells}). De teller is het aantal gekleurde delen (${d.coloredCount}). Het rooster splitst het geheel in gelijke delen; de verhouding gekleurd/totaal is de breuk.'
      feedback.value = {
        type: 'success',
        text: `Juist! ${d.coloredCount} van de ${d.totalCells} vakjes zijn gekleurd = ${d.answerNum}/${d.answerDen}.`
      }
    } else {
      attemptCount.value++
      if (slider1.value > d.totalCells) {
        errorDetected.value = 'Het aantal gekleurde vakjes kan niet groter zijn dan het totale aantal vakjes (${d.totalCells}). Je hebt de teller en noemer misschien omgewisseld?'
      } else if (slider1.value < d.coloredCount) {
        errorDetected.value = 'Je hebt niet alle gekleurde vakjes geteld. Tel opnieuw: hoeveel oranje vakjes zie je?'
      } else {
        errorDetected.value = 'Er zijn ${d.coloredCount} oranje vakjes — niet ${slider1.value}. Tel ze één voor één.'
      }
      feedback.value = {
        type: 'error',
        text: `De schuif staat op ${slider1.value}, maar er zijn ${d.coloredCount} vakjes gekleurd.`
      }
    }
  } else if (d.mode === 'add') {
    if (slider1.value === d.scaled1Num && slider2.value === d.scaled2Num) {
      isCorrect.value = true
      showReflection.value = true
      reflectionAnswer.value = ''
      reflectionPassed.value = false
      errorDetected.value = ''
      showWhy.value = true
      whyText.value = 'Eerst maak je breuken gelijknamig met KGV(${d.frac1Den}, ${d.frac2Den}) = ${d.commonDen}. Dan tel je alleen de tellers op: ${d.scaled1Num} + ${d.scaled2Num} = ${d.rawNum}. De noemer blijft ${d.commonDen} omdat de grootte van elk deel niet verandert.'
      let extra = ''
      if (d.needsSimplify) {
        extra = ` Vereenvoudigd: ${d.answerNum}/${d.answerDen}.`
      }
      feedback.value = {
        type: 'success',
        text: `Perfect! ${d.scaled1Num}/${d.commonDen} + ${d.scaled2Num}/${d.commonDen} = ${d.rawNum}/${d.rawDen}.${extra}`
      }
    } else {
      attemptCount.value++
      const totalShown = slider1.value + slider2.value
      if (slider1.value !== d.scaled1Num) {
        errorDetected.value = 'De eerste schuif moet op ${d.frac1Num}/${d.frac1Den} = ${d.scaled1Num}/${d.commonDen} staan. Je hebt ${slider1.value} geselecteerd.'
      } else if (slider2.value !== d.scaled2Num) {
        errorDetected.value = 'De tweede schuif moet op ${d.frac2Num}/${d.frac2Den} = ${d.scaled2Num}/${d.commonDen} staan. Je hebt ${slider2.value} geselecteerd.'
      } else {
        errorDetected.value = 'De som klopt niet. ${slider1.value}/${d.commonDen} + ${slider2.value}/${d.commonDen} = ${totalShown}/${d.commonDen}, maar het juiste antwoord is ${d.scaled1Num + d.scaled2Num}/${d.commonDen}.'
      }
      const g2 = gcd(totalShown, d.commonDen)
      feedback.value = {
        type: 'error',
        text: `Je hebt ${slider1.value} + ${slider2.value} = ${totalShown}/${d.commonDen} = ${totalShown/g2}/${d.commonDen/g2} geselecteerd. Dat klopt niet. Gebruik de hint voor hulp.`
      }
    }
  } else if (d.mode === 'subtract') {
    if (slider1.value === d.scaled1Num && slider2.value === d.scaled2Num) {
      isCorrect.value = true
      showReflection.value = true
      reflectionAnswer.value = ''
      reflectionPassed.value = false
      errorDetected.value = ''
      showWhy.value = true
      whyText.value = 'Net als bij optellen: eerst gelijknamig maken met KGV(${d.frac1Den}, ${d.frac2Den}) = ${d.commonDen}. Dan alleen de tellers aftrekken: ${d.scaled1Num} - ${d.scaled2Num} = ${d.rawNum}. De noemer blijft hetzelfde omdat de grootte van de delen niet verandert.'
      let extra = ''
      if (d.needsSimplify) {
        extra = ` Vereenvoudigd: ${d.answerNum}/${d.answerDen}.`
      }
      feedback.value = {
        type: 'success',
        text: `Juist! ${d.scaled1Num}/${d.commonDen} - ${d.scaled2Num}/${d.commonDen} = ${d.rawNum}/${d.rawDen}.${extra}`
      }
    } else {
      attemptCount.value++
      const remaining = slider1.value - slider2.value
      if (slider1.value !== d.scaled1Num) {
        errorDetected.value = 'De minuend (eerste schuif) moet op ${d.scaled1Num}/${d.commonDen} staan, niet ${slider1.value}.'
      } else if (slider2.value !== d.scaled2Num) {
        errorDetected.value = 'De subtrahend (tweede schuif) moet op ${d.scaled2Num}/${d.commonDen} staan, niet ${slider2.value}.'
      } else {
        errorDetected.value = 'Het verschil ${remaining}/${d.commonDen} klopt niet. Het juiste verschil is ${d.rawNum}/${d.rawDen}.'
      }
      const g2 = gcd(Math.abs(remaining), d.commonDen)
      feedback.value = {
        type: 'error',
        text: `Je hebt ${slider1.value} - ${slider2.value} = ${remaining}/${d.commonDen} = ${remaining/g2}/${d.commonDen/g2}. Dat klopt niet. Gebruik de hint voor hulp.`
      }
    }
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase().trim()

  if ((ans.includes('teller') || ans.includes('noemer')) && ans.length > 5) {
    reflectionPassed.value = true
    showReflection.value = false
  } else {
    feedback.value = {
      type: 'info',
      text: 'Denk na: waarom tel je tellers op maar blijven noemers hetzelfde? Wat verandert er in het rooster als je breuken optelt?'
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
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
  <div
    class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
    @click="emit('close')" role="button" tabindex="0"
    @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')"
    aria-label="Achtergrond"
  ></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">
              Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}
            </p>
            <div class="flex gap-1">
              <div
                v-for="i in totalInternalLevels" :key="i"
                class="w-2 h-2 rounded-full"
                :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <button
        @click="emit('close')"
        class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        <PhX class="w-6 h-6" />
      </button>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: breuken optellen</p>
            <p class="text-sm text-slate-700 mb-2">Wat is 1/3 + 1/6?</p>
            <div class="text-xs text-slate-600 space-y-1 mb-2">
              <p><strong>Stap 1:</strong> Gelĳknamig maken. KGV(3, 6) = 6. 1/3 = 2/6.</p>
              <p><strong>Stap 2:</strong> Nu hebben ze dezelfde noemer (6). Tel de tellers op: 2/6 + 1/6.</p>
              <p><strong>Stap 3:</strong> Teller: 2 + 1 = 3. Noemer blijft 6. Antwoord: 3/6.</p>
              <p><strong>Stap 4:</strong> Vereenvoudig: 3/6 = 1/2.</p>
            </div>
            <p class="font-mono text-base font-bold text-slate-800">1/3 + 1/6 = 1/2</p>
            <button
              @click="skipWorkedExample"
              class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline"
            >
              Begrepen, start de opdracht &rarr;
            </button>
          </div>

          <!-- Goal -->
          <div
            v-if="!showWorkedExample"
            class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn"
          >
            <p class="font-bold text-amber-800">{{ currentLevelData?.goalText }}</p>
            <p v-if="currentLevelData?.mode === 'add' || currentLevelData?.mode === 'subtract'" class="text-xs text-slate-500 mt-1">
              Gemeenschappelijke noemer = {{ currentLevelData?.commonDen }}
            </p>
          </div>

          <!-- Prediction Gate -->
          <div
            v-if="showPrediction && !showWorkedExample"
            class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4"
          >
            <p class="font-bold text-amber-800 text-sm mb-2">
              <template v-if="currentLevelData?.mode === 'identify'">Voorspel: welk deel is gekleurd?</template>
              <template v-else-if="currentLevelData?.mode === 'add'">Voorspel de som</template>
              <template v-else>Voorspel het verschil</template>
            </p>
            <p class="text-sm text-slate-600 mb-3">
              <template v-if="currentLevelData?.mode === 'identify'">Welke breuk van de figuur is oranje gekleurd?</template>
              <template v-else-if="currentLevelData?.mode === 'add'">
                {{ currentLevelData?.frac1Num }}/{{ currentLevelData?.frac1Den }}
                + {{ currentLevelData?.frac2Num }}/{{ currentLevelData?.frac2Den }} = ?
              </template>
              <template v-else>
                {{ currentLevelData?.frac1Num }}/{{ currentLevelData?.frac1Den }}
                - {{ currentLevelData?.frac2Num }}/{{ currentLevelData?.frac2Den }} = ?
              </template>
            </p>
            <div class="flex items-center gap-2 justify-center">
              <span class="font-mono font-bold text-slate-700">=</span>
              <div class="flex flex-col items-center gap-1 w-16">
                <input
                  type="number" v-model.number="predictedNum"
                  @keyup.enter="submitPrediction"
                  class="w-full p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500"
                  placeholder="?"
                />
                <div class="h-0.5 w-full bg-slate-400 rounded-full"></div>
                <input
                  type="number" v-model.number="predictedDen"
                  @keyup.enter="submitPrediction"
                  class="w-full p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500"
                  placeholder="?"
                />
              </div>
              <button
                @click="submitPrediction"
                class="py-2 px-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]"
              >
                Voorspel
              </button>
            </div>
          </div>

          <!-- Slider controls (after prediction) -->
          <div v-if="!showPrediction && !isCorrect" class="p-4 border border-slate-200 bg-white rounded-xl shadow-sm mb-4 space-y-4 animate-fadeIn">
            <p class="text-sm font-bold text-slate-700">Stel de schuifregelaars in:</p>

            <!-- Level 1: single slider -->
            <div v-if="currentLevelData?.mode === 'identify'" class="space-y-2">
              <label class="text-xs text-slate-600">
                Gekleurde vakjes:
                <span class="font-bold text-amber-700">{{ slider1 }} / {{ currentLevelData?.totalCells }}</span>
              </label>
              <input
                type="range" min="0" :max="currentLevelData?.totalCells || 1" step="1"
                v-model.number="slider1"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <!-- Level 2/3: two sliders -->
            <div v-if="currentLevelData?.mode === 'add'" class="space-y-3">
              <div class="space-y-1">
                <label class="text-xs text-slate-600">
                  Breuk 1 (oranje): <span class="font-bold text-amber-700">{{ slider1 }} / {{ currentLevelData?.commonDen }}</span>
                </label>
                <input
                  type="range" min="0" :max="currentLevelData?.commonDen || 1" step="1"
                  v-model.number="slider1"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs text-slate-600">
                  Breuk 2 (licht oranje): <span class="font-bold text-amber-600">{{ slider2 }} / {{ currentLevelData?.commonDen }}</span>
                </label>
                <input
                  type="range" min="0" :max="(currentLevelData?.commonDen || 1) - slider1" step="1"
                  v-model.number="slider2"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <p class="text-xs text-slate-500 text-center">
                Totaal: <strong>{{ slider1 + slider2 }} / {{ currentLevelData?.commonDen }}</strong>
              </p>
            </div>

            <div v-if="currentLevelData?.mode === 'subtract'" class="space-y-3">
              <div class="space-y-1">
                <label class="text-xs text-slate-600">
                  Begin (minuend): <span class="font-bold text-amber-700">{{ slider1 }} / {{ currentLevelData?.commonDen }}</span>
                </label>
                <input
                  type="range" min="0" :max="currentLevelData?.commonDen || 1" step="1"
                  v-model.number="slider1"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs text-slate-600">
                  Weg te halen: <span class="font-bold text-slate-700">{{ slider2 }} / {{ currentLevelData?.commonDen }}</span>
                </label>
                <input
                  type="range" min="0" :max="slider1" step="1"
                  v-model.number="slider2"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <p class="text-xs text-slate-500 text-center">
                Verschil: <strong>{{ slider1 - slider2 }} / {{ currentLevelData?.commonDen }}</strong>
              </p>
            </div>
          </div>

          <!-- Error Analysis -->
          <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 border border-red-200 bg-red-50 rounded-xl animate-fadeIn">
            <h4 class="flex items-center gap-2 text-sm font-bold text-red-800 mb-1">
              <PhWarningCircle weight="fill" class="w-4 h-4" />
              Let op!
            </h4>
            <p class="text-sm text-red-700">{{ errorDetected }}</p>
          </div>

          <!-- Why explanation -->
          <div
            v-if="showWhy && isCorrect"
            class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn"
          >
            <p class="font-bold text-indigo-800 text-sm mb-1">
              <PhLightbulb weight="fill" class="w-4 h-4 inline" />
              Waarom werkt dit?
            </p>
            <p class="text-xs text-indigo-700 leading-relaxed">{{ whyText }}</p>
          </div>

          <!-- Reflection -->
          <div
            v-if="showReflection"
            class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn"
          >
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2">
              <template v-if="currentLevelData?.mode === 'add' || currentLevelData?.mode === 'subtract'">
                Waarom moet je breuken eerst gelijknamig maken voor je tellers kan optellen of aftrekken?
                Wat gebeurt er in het rooster?
              </template>
              <template v-else>
                Hoe zou je bepalen welk deel van een figuur gekleurd is als de figuur in ongelijke delen verdeeld was?
              </template>
            </p>
            <textarea
              v-model="reflectionAnswer"
              class="w-full p-2 text-sm border border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500 h-16 resize-none"
              placeholder="Typ je uitleg..."
            ></textarea>
            <button
              @click="checkReflection"
              class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98]"
            >
              Bevestig
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div
            v-if="feedback.text"
            class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4"
            role="status" aria-live="polite" aria-atomic="true"
            :class="{
              'bg-amber-50 text-amber-800 border-amber-400': feedback.type === 'success',
              'bg-red-100 text-red-800 border-red-400': feedback.type === 'error',
              'bg-slate-100 text-slate-700 border-slate-400': feedback.type === 'info'
            }"
          >
            <component
              :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)"
              class="w-5 h-5 shrink-0 mt-0.5" weight="fill"
            />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="resetActivityState"
              class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"
            >
              <PhArrowClockwise />
            </button>
            <button
              v-if="showPrediction && !showWorkedExample && attemptCount > 0"
              @click="showHint"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
            >
              <PhLightbulb weight="fill" class="w-4 h-4" />
              Hint {{ hintCount >= 3 ? '3/3' : hintCount + 1 + '/3' }}
            </button>
            <button
              v-if="!showPrediction && !isCorrect"
              @click="checkAnswer"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-sm"
            >
              Controleer
            </button>
            <button
              v-if="isCorrect && !showReflection"
              @click="handleNext"
              class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual area: Grid display -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

          <div class="relative flex flex-col items-center">

            <!-- The Grid -->
            <div
              class="relative bg-white border-4 border-slate-300 shadow-md"
              :style="{
                width: currentLevelData ? `${Math.min(currentLevelData.cols * 60, 420)}px` : '300px',
                height: currentLevelData ? `${Math.min(currentLevelData.rows * 60, 360)}px` : '200px'
              }"
            >
              <div
                class="absolute inset-0 grid"
                :style="currentLevelData ? {
                  gridTemplateColumns: `repeat(${currentLevelData.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${currentLevelData.rows}, minmax(0, 1fr))`
                } : {}"
              >
                <template v-if="currentLevelData">
                  <!-- Iterate cells row by row -->
                  <template v-for="row in currentLevelData.rows" :key="'r'+row">
                    <div
                      v-for="col in currentLevelData.cols" :key="'c'+col"
                      class="border border-slate-200 transition-colors duration-300 flex items-center justify-center relative"
                      :class="{
                        'bg-amber-400': getCellState((row-1) * currentLevelData.cols + (col-1)) === 'frac1',
                        'bg-amber-200': getCellState((row-1) * currentLevelData.cols + (col-1)) === 'frac2',
                        'bg-amber-100': getCellState((row-1) * currentLevelData.cols + (col-1)) === 'amber',
                        'bg-white': getCellState((row-1) * currentLevelData.cols + (col-1)) === 'white'
                      }"
                    >
                      <!-- Crossed-out cell for subtraction -->
                      <div
                        v-if="getCellState((row-1) * currentLevelData.cols + (col-1)) === 'crossed'"
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        <div class="w-full h-0.5 bg-slate-700 rotate-45 absolute"></div>
                        <div class="w-full h-0.5 bg-slate-700 -rotate-45 absolute"></div>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
            </div>

            <!-- Legend -->
            <div class="flex gap-6 mt-6 text-xs text-slate-500 flex-wrap justify-center">
              <div v-if="currentLevelData?.mode === 'identify'" class="flex items-center gap-2">
                <div class="w-4 h-4 bg-amber-100 rounded"></div>
                <span>Gekleurd ({{ currentLevelData?.coloredCount }}/{{ currentLevelData?.totalCells }})</span>
              </div>
              <div v-if="currentLevelData?.mode === 'add' || currentLevelData?.mode === 'subtract'" class="flex items-center gap-2">
                <div class="w-4 h-4 bg-amber-400 rounded"></div>
                <span v-if="currentLevelData?.mode === 'add'">
                  {{ currentLevelData?.frac1Num }}/{{ currentLevelData?.frac1Den }}
                  = {{ currentLevelData?.scaled1Num }}/{{ currentLevelData?.commonDen }}
                </span>
                <span v-else>
                  Minuend: {{ currentLevelData?.frac1Num }}/{{ currentLevelData?.frac1Den }}
                  = {{ currentLevelData?.scaled1Num }}/{{ currentLevelData?.commonDen }}
                </span>
              </div>
              <div v-if="currentLevelData?.mode === 'add'" class="flex items-center gap-2">
                <div class="w-4 h-4 bg-amber-200 rounded"></div>
                <span>
                  {{ currentLevelData?.frac2Num }}/{{ currentLevelData?.frac2Den }}
                  = {{ currentLevelData?.scaled2Num }}/{{ currentLevelData?.commonDen }}
                </span>
              </div>
              <div v-if="currentLevelData?.mode === 'subtract'" class="flex items-center gap-2">
                <div class="w-4 h-4 relative">
                  <div class="w-full h-full bg-amber-400 rounded"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-0.5 bg-slate-700 rotate-45 absolute"></div>
                    <div class="w-full h-0.5 bg-slate-700 -rotate-45 absolute"></div>
                  </div>
                </div>
                <span>
                  Subtrahend: {{ currentLevelData?.frac2Num }}/{{ currentLevelData?.frac2Den }}
                  = {{ currentLevelData?.scaled2Num }}/{{ currentLevelData?.commonDen }}
                </span>
              </div>
            </div>

            <!-- Sum / Difference display -->
            <div v-if="!showPrediction && currentLevelData?.mode === 'add'" class="mt-4 text-center text-sm text-slate-700">
              <span class="font-bold">{{ slider1 }}/{{ currentLevelData.commonDen }}</span>
              <span> + </span>
              <span class="font-bold">{{ slider2 }}/{{ currentLevelData.commonDen }}</span>
              <span> = </span>
              <span class="font-bold text-amber-700">{{ slider1 + slider2 }}/{{ currentLevelData.commonDen }}</span>
            </div>

            <div v-if="!showPrediction && currentLevelData?.mode === 'subtract'" class="mt-4 text-center text-sm text-slate-700">
              <span class="font-bold">{{ slider1 }}/{{ currentLevelData.commonDen }}</span>
              <span> - </span>
              <span class="font-bold">{{ slider2 }}/{{ currentLevelData.commonDen }}</span>
              <span> = </span>
              <span class="font-bold text-amber-700">{{ slider1 - slider2 }}/{{ currentLevelData.commonDen }}</span>
            </div>

          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration
  :show="isCorrect && !celebrationDone"
  @done="celebrationDone = true"
  :is-level-complete="currentInternalLevel === totalInternalLevels - 1"
/>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #d97706;
  border: 4px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  margin-top: -10px;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
