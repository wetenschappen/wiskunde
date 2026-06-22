<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCarProfile, PhArrowClockwise,
  PhLightbulb, PhBrain, PhPencilSimpleLine
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Evenredigheden: Recht Evenredig' },
  instruction: {
    type: String,
    default: 'Een auto rijdt met een constante snelheid. Als je 2 keer zo lang rijdt, leg je 2 keer zoveel afstand af. Dit noemen we <strong>recht evenredig</strong>.<br/><br/><strong>Opdracht:</strong> Vul de ontbrekende afstanden in de tabel aan.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCarProfile }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Vul de lege vakjes in de tabel in.' })
const attemptCount = ref(0)

// ========== PEDAGOGICAL STATE ==========
const showWorkedExample = ref(true)
const showPrediction = ref(false)
const predictedType = ref(null)
const showWhy = ref(false)
const whyText = ref('')
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionDone = ref(false)
const hintCount = ref(0)
const errorDetected = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  let speed
  if (levelNum === 0) speed = r(40, 60)
  else if (levelNum === 1) speed = r(55, 80)
  else speed = r(30, 70)
  return {
    label: `${speed} km/uur`,
    speed,
    answers: { ans2: speed * 2, ans4: speed * 4, ans5: speed * 5 },
    instruction: `Een voertuig rijdt met een constante snelheid van <strong>${speed} km/uur</strong>.<br/><br/><strong>Opdracht:</strong> Vul de ontbrekende afstanden in de tabel. Wat valt je op aan de grafiek?`,
    successFeedback: `Perfect! Afstanden kloppen. De punten vormen een rechte lijn door de oorsprong — hét kenmerk van recht evenredigheid!`,
    errorHints: {
      ans2: `Fout bij 2 uur. Als je in 1 uur ${speed} km rijdt, hoeveel dan in 2 uur?`,
      ans4: `Fout bij 4 uur. Als je in 2 uur ${speed * 2} km rijdt, hoeveel dan in 4 uur?`,
      ans5: `Fout bij 5 uur. De formule is Afstand = Tijd × ${speed}.`
    }
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const displayInstruction = computed(() => currentLevel.value ? currentLevel.value.instruction : props.instruction)

const ans2 = ref(null)
const ans4 = ref(null)
const ans5 = ref(null)

const points = computed(() => {
    if (!currentLevel.value) return []
    const spd = currentLevel.value.speed
    return [
        { x: 1, y: spd, visible: true },
        { x: 2, y: ans2.value || 0, visible: ans2.value !== null },
        { x: 4, y: ans4.value || 0, visible: ans4.value !== null },
        { x: 5, y: ans5.value || 0, visible: ans5.value !== null }
    ]
})

// ========== WORKED EXAMPLE ==========
const workedExamples = [
  {
    speed: 50,
    rows: [
      { t: 1, d: 50 },
      { t: 2, d: 100 },
      { t: 4, d: 200 }
    ],
    steps: [
      'Een fietser rijdt 50 km/uur. In 1 uur: 50 km.',
      'Vermenigvuldig: Tijd × Snelheid = Afstand. 2 × 50 = 100 km.',
      '4 × 50 = 200 km. De lijn door de oorsprong is recht.'
    ]
  }
]

function skipWorkedExample() {
  showWorkedExample.value = false
  showPrediction.value = currentInternalLevel.value >= 1
  if (currentInternalLevel.value >= 1) {
    feedback.value = { type: 'info', text: 'Voorspel: wat voor grafiek krijg je bij recht evenredige verbanden?' }
  }
}

// ========== PREDICTION GATE ==========
function checkPrediction() {
  if (!predictedType.value) return
  if (predictedType.value === 'line') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Bij recht evenredigheid krijg je een rechte lijn door de oorsprong.' }
  } else {
    attemptCount.value++
    const hints = [
      'Denk aan de tabel: als de tijd verdubbelt, verdubbelt de afstand. Wat voor grafiek hoort daarbij?',
      'Bij een recht evenredig verband: y = c · x. Welke grafiek hoort bij zulke formules?',
      'Recht evenredig = rechte lijn. Andere opties: kromme, hyperbool.'
    ]
    feedback.value = { type: 'error', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

// ========== HINTS ==========
function showHint() {
  hintCount.value++
  const idx = Math.min(hintCount.value - 1, 2)
  const hints = [
    'Bij een recht evenredig verband is er een constante verhouding. Afstand = Tijd × Snelheid. Welke waarden missen er nog?',
    'Kijk naar de gegeven waarde: in 1 uur is de afstand de snelheid. Gebruik de formule Afstand = Tijd × Snelheid.',
    `Vul aan: 2 uur: ${currentLevel.value ? currentLevel.value.speed * 2 : '...'} km, 4 uur: ${currentLevel.value ? currentLevel.value.speed * 4 : '...'} km, 5 uur: ${currentLevel.value ? currentLevel.value.speed * 5 : '...'} km.`
  ]
  feedback.value = { type: 'info', text: hints[idx] }
}

// ========== ERROR ANALYSIS ==========
function getErrorAnalysis() {
  const lv = currentLevel.value
  if (!lv) return ''
  if (ans2.value !== null && ans2.value !== lv.answers.ans2 && ans2.value === lv.speed / 2) {
    return 'Let op! Je hebt gedeeld in plaats van vermenigvuldigd. In 2 uur leg je méér af dan in 1 uur, niet minder.'
  }
  if (ans5.value !== null && ans5.value === lv.answers.ans5 - lv.speed) {
    return 'Bijna! Denk aan de formule: Afstand = Tijd × Snelheid. Reken opnieuw voor 5 uur.'
  }
  if (ans4.value !== null && ans4.value === lv.speed * 3) {
    return 'Verwar niet: bij 4 uur rijden is het 4 × de snelheid, niet 3 ×.'
  }
  return ''
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    isCorrect.value = false
    celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    hintCount.value = 0
    errorDetected.value = ''
    showWhy.value = false
    whyText.value = ''
    showReflection.value = false
    reflectionAnswer.value = ''
    reflectionDone.value = false
    predictedType.value = null
    feedback.value = { type: 'info', text: 'Vul de lege vakjes in de tabel in.' }
    ans2.value = null
    ans4.value = null
    ans5.value = null

    showWorkedExample.value = currentInternalLevel.value === 0
    showPrediction.value = currentInternalLevel.value >= 1
    if (currentInternalLevel.value >= 1) {
      feedback.value = { type: 'info', text: 'Voorspel: wat voor grafiek krijg je?' }
    }
}

function checkAnswer() {
  isChecked.value = true
  const lv = currentLevel.value
  if (!lv) return

  const errAnalysis = getErrorAnalysis()
  if (errAnalysis) {
    errorDetected.value = errAnalysis
  }

  if (ans2.value === lv.answers.ans2 && ans4.value === lv.answers.ans4 && ans5.value === lv.answers.ans5) {
    isCorrect.value = true
    hintCount.value = 0
    errorDetected.value = ''
    const whyTexts = [
      'Recht evenredig betekent: als x verdubbelt, verdubbelt y. De formule is y = c · x. In dit geval: Afstand = Tijd × Snelheid. De grafiek is een rechte lijn door de oorsprong. Dit noemen we een lineair verband.',
      'Bij recht evenredigheid is de verhouding y/x altijd constant. Hier: afstand/tijd = snelheid = constant. De punten liggen op een rechte lijn door (0,0).',
      'Of je nu 1, 2 of 5 uur rijdt — de snelheid blijft hetzelfde. Dat is de constante in de evenredigheid. De formule is altijd Afstand = c · Tijd met c = snelheid.'
    ]
    showWhyExplanation(whyTexts[currentInternalLevel.value])
    feedback.value = { type: 'success', text: `${lv.successFeedback}<br/><br/>LPD 34: Je herkent en berekent recht evenredige verbanden.` }
  } else {
    attemptCount.value++
    if (ans2.value !== lv.answers.ans2) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans2}` }
    } else if (ans4.value !== lv.answers.ans4) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans4}` }
    } else if (ans5.value !== lv.answers.ans5) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans5}` }
    } else {
        feedback.value = { type: 'error', text: 'Niet helemaal... Vul alle vakjes in de tabel in.'}
    }
  }
}

function showWhyExplanation(text) {
  showWhy.value = true
  whyText.value = text
}

function nextLevel() {
  if (currentInternalLevel.value === totalInternalLevels - 1 && !showReflection.value && !reflectionDone.value) {
    showReflection.value = true
    showWhy.value = false
    isCorrect.value = false
    feedback.value = { type: 'info', text: 'Reflecteer op recht evenredige verbanden.' }
    return
  }

  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// ========== REFLECTION ==========
function checkReflection() {
  const text = reflectionAnswer.value.toLowerCase().trim()
  const hasConst = text.includes('constant') || text.includes('verhouding') || text.includes('snelheid')
  const hasReason = text.includes('omdat') || text.includes('want') || text.includes('daarom') || text.includes('dus')
  if (hasConst && hasReason && text.length > 15) {
    reflectionDone.value = true
    isCorrect.value = true
    feedback.value = { type: 'success', text: 'Uitstekend! Je begrijpt de constante verhouding.<br/><br/><strong>LPD 34 bewezen:</strong> Je kunt recht evenredige verbanden herkennen en berekenen.' }
  } else {
    attemptCount.value++
    const hints = [
      'Wat gebeurt er met de afstand als de tijd verdubbelt? Waarom?',
      'Leg uit: "Als ik twee keer zo lang rijd, dan is de afstand..."',
      'Wat is de constante in dit verband? Hoe noem je die in formule y = c · x?'
    ]
    feedback.value = { type: 'info', text: hints[Math.min(attemptCount.value - 1, 2)] }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]"
         @click="emit('close')" role="button" tabindex="0"
         @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <span v-for="i in totalInternalLevels" :key="i"
                      class="w-2.5 h-2.5 rounded-full border"
                      :class="i <= currentInternalLevel + 1 ? 'bg-amber-500 border-amber-600' : 'bg-slate-200 border-slate-300'">
                </span>
              </div>
              <span class="text-xs font-semibold text-slate-500">{{ levelLabels[currentInternalLevel] }} — Level {{ currentInternalLevel + 1 }}</span>
              <span v-if="totalSteps > 1" class="text-xs text-slate-400 ml-2">Stap {{ currentStep }} van {{ totalSteps }}</span>
            </div>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="displayInstruction" class="mb-4 prose prose-sm text-slate-600" />

            <div v-if="showWorkedExample" class="bg-indigo-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-400 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhBrain class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Voorbeeld — Doe ik voor</span>
              </div>
              <p class="text-sm font-bold text-slate-700 mb-2">Fietser rijdt {{ workedExamples[0].speed }} km/uur</p>
              <div class="overflow-x-auto mb-2">
                <table class="w-full text-sm border-collapse bg-white rounded">
                  <thead><tr class="bg-indigo-100"><th class="p-1 border">Tijd (h)</th><th class="p-1 border">Afstand (km)</th></tr></thead>
                  <tbody>
                    <tr v-for="row in workedExamples[0].rows" :key="row.t"><td class="p-1 border text-center font-bold">{{ row.t }}</td><td class="p-1 border text-center font-bold">{{ row.d }}</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="space-y-1 text-sm text-slate-700">
                <div v-for="(step, si) in workedExamples[0].steps" :key="si" class="flex items-start gap-2">
                  <span class="text-indigo-500 font-bold shrink-0 mt-0.5">{{ si + 1 }}.</span>
                  <span>{{ step }}</span>
                </div>
              </div>
              <div class="mt-2 p-2 bg-white rounded-lg text-center font-bold text-indigo-700 border border-indigo-200">
                Recht evenredig: y = {{ workedExamples[0].speed }} · x
              </div>
              <button @click="skipWorkedExample"
                      class="mt-3 w-full py-2 text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen! Zelf doen →
              </button>
            </div>

            <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhBrain class="w-5 h-5 text-amber-600" weight="fill" />
                <span class="font-bold text-amber-800 text-sm">Voorspel</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Wat voor grafiek verwacht je bij een recht evenredig verband?</p>
              <div class="flex flex-col gap-2">
                <button v-for="opt in [{id:'curve',label:'Een kromme lijn'},{id:'line',label:'Een rechte lijn door (0,0)'},{id:'hyperbola',label:'Een hyperbool'}]" :key="opt.id"
                        @click="predictedType = opt.id"
                        class="w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors border-2 text-left focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="predictedType === opt.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                  {{ opt.label }}
                </button>
              </div>
              <button v-if="predictedType" @click="checkPrediction"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig voorspelling
              </button>
            </div>

            <div v-if="!showWorkedExample && !showPrediction && !showReflection" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
              <div class="text-center bg-amber-50 p-3 border border-amber-200 rounded-lg mb-3">
                <p class="font-bold text-amber-800 text-sm">{{ currentLevel.label }}</p>
              </div>
              <h4 class="font-bold text-slate-700 mb-4 text-sm">Tabel:</h4>
              <table class="w-full text-center border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr class="bg-amber-100 text-amber-800">
                    <th class="p-2 border border-amber-200">Tijd (h)</th>
                    <th class="p-2 border border-amber-200">Afstand (km)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="p-2 border font-bold">1</td><td class="p-2 border font-bold">{{ currentLevel ? currentLevel.speed : '' }}</td></tr>
                  <tr>
                    <td class="p-2 border font-bold">2</td>
                    <td class="p-1 border"><input type="number" v-model.number="ans2" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-amber-500 outline-none tabular-nums" :class="ans2 === (currentLevel ? currentLevel.answers.ans2 : null) && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" /></td>
                  </tr>
                  <tr>
                    <td class="p-2 border font-bold">4</td>
                    <td class="p-1 border"><input type="number" v-model.number="ans4" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-amber-500 outline-none tabular-nums" :class="ans4 === (currentLevel ? currentLevel.answers.ans4 : null) && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" /></td>
                  </tr>
                  <tr>
                    <td class="p-2 border font-bold">5</td>
                    <td class="p-1 border"><input type="number" v-model.number="ans5" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-amber-500 outline-none tabular-nums" :class="ans5 === (currentLevel ? currentLevel.answers.ans5 : null) && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="showWhy && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Waarom werkt dit?</span>
              </div>
              <p class="text-sm text-indigo-700">{{ whyText }}</p>
            </div>

            <div v-if="errorDetected && !isCorrect" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhWarningCircle class="w-5 h-5 text-red-600" weight="fill" />
                <span class="font-bold text-red-800 text-sm">Let op!</span>
              </div>
              <p class="text-sm text-red-700">{{ errorDetected }}</p>
            </div>

            <div v-if="showReflection" class="p-4 border border-indigo-200 bg-indigo-50 rounded-xl animate-fadeIn mb-4">
              <div class="flex items-center gap-2 mb-3">
                <PhPencilSimpleLine class="w-5 h-5 text-indigo-600" weight="fill" />
                <span class="font-bold text-indigo-800 text-sm">Reflectie</span>
              </div>
              <p class="text-sm text-slate-700 mb-3">Waarom noemen we dit "recht evenredig"? Wat is de constante verhouding? Leg uit in je eigen woorden.</p>
              <textarea v-model="reflectionAnswer" :disabled="reflectionDone"
                class="w-full p-3 border-2 border-indigo-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows="4" placeholder="Recht evenredig betekent dat..."></textarea>
              <button v-if="!reflectionDone" @click="checkReflection"
                      :disabled="!reflectionAnswer.trim()"
                      class="mt-3 w-full py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
                Bevestig reflectie
              </button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-50 text-amber-800 border border-amber-200': feedback.type === 'success',
                          'bg-red-50 text-red-800 border border-red-200': feedback.type === 'error',
                          'bg-blue-50 text-blue-800 border border-blue-200': feedback.type === 'info'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : feedback.type === 'error' ? PhWarningCircle : PhLightbulb"
                         class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
              <span class="leading-snug" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState"
                      class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <PhArrowClockwise />
              </button>

              <button v-if="!isCorrect && !showWorkedExample && !showPrediction && !showReflection"
                      @click="showHint"
                      class="flex-1 py-4 font-bold text-slate-600 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none flex items-center justify-center gap-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                Hint
              </button>

              <button v-if="!isCorrect && !showReflection && !showWorkedExample && !showPrediction" @click="checkAnswer"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer Tabel
              </button>

              <button v-if="isCorrect && !showReflection" @click="nextLevel"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Volgende stap' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <button v-if="isCorrect && showReflection && reflectionDone" @click="handleNext || nextLevel"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
              <div class="w-full max-w-2xl bg-white shadow-md rounded-xl border-4 border-slate-300 p-8 flex flex-col items-center">
                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Grafiek: Afstand i.f.v. Tijd</h4>
                  <div class="relative">
                      <svg width="450" height="350" viewBox="0 0 450 350" class="block">
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 7" :key="'vg'+i" :x1="50 + (i-1)*60" y1="50" :x2="50 + (i-1)*60" y2="300" />
                              <line v-for="i in 7" :key="'hg'+i" x1="50" :y1="300 - (i-1)*40" x2="410" :y2="300 - (i-1)*40" />
                          </g>
                          <line x1="50" y1="300" x2="420" y2="300" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="50" y1="300" x2="50" y2="30" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>
                          <text x="400" y="325" font-weight="bold" fill="#64748b" font-size="12">Tijd (h)</text>
                          <text x="40" y="20" font-weight="bold" fill="#64748b" font-size="12" text-anchor="end">Afstand (km)</text>
                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="middle">
                              <text x="50" y="315">0</text><text x="110" y="315">1</text><text x="170" y="315">2</text>
                              <text x="230" y="315">3</text><text x="290" y="315">4</text><text x="350" y="315">5</text>
                          </g>
                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="end">
                              <text x="40" y="264">50</text><text x="40" y="224">100</text><text x="40" y="184">150</text>
                              <text x="40" y="144">200</text><text x="40" y="104">250</text><text x="40" y="64">300</text>
                          </g>
                          <line v-if="isCorrect" x1="50" y1="300" :x2="50 + 5*60" :y2="300 - ((currentLevel ? currentLevel.speed * 5 : 0) / 50) * 40" stroke="#0ea5e9" stroke-width="3" class="animate-slash origin-bottom-left" />
                          <g v-for="pt in points" :key="pt.x">
                              <circle v-if="pt.visible" :cx="50 + pt.x * 60" :cy="300 - (pt.y / 50) * 40" r="6" fill="#0284c7" stroke="white" stroke-width="2" class="animate-fadeIn shadow-sm" />
                          </g>
                      </svg>
                  </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel >= totalInternalLevels - 1 && reflectionDone" />
  </div>
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; }
@keyframes ring-pulse-amber { 0% { box-shadow: 0 0 0 0 #fbbf24; } 70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
.animate-slash { animation: slash 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes slash { 0% { transform: scaleX(0) scaleY(0); opacity: 0; } 100% { transform: scaleX(1) scaleY(1); opacity: 1; } }
</style>
