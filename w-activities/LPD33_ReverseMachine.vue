<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEngine, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Vergelijkingen: De Machine Terugdraaien' },
  instruction: { type: String, default: 'Een machine voert bewerkingen uit op x. Om x te vinden, draai je de machine achterstevoren: elke bewerking keer je om.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhEngine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  let x, a, b, final, correctOp1, correctOp2, expectedVal1, expectedVal2, eq, desc

  if (levelNum === 0) {
    const pattern = r(0, 1)
    a = r(2, 4); b = r(2, 6); x = r(3, 12) * a
    const val1 = x / a
    if (pattern === 0) {
      final = val1 - b; eq = `x / ${a} − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `×${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 * a
      desc = 'Eerst delen door ' + a + ', dan ' + b + ' aftrekken'
    } else {
      final = val1 + b; eq = `x / ${a} + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `×${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 * a
      desc = 'Eerst delen door ' + a + ', dan ' + b + ' optellen'
    }
  } else if (levelNum === 1) {
    const pattern = r(0, 1)
    a = r(2, 4); b = r(1, 6); x = r(3, 12)
    const val1 = x * a
    if (pattern === 0) {
      final = val1 + b; eq = `${a}x + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 / a
      desc = 'Eerst ×' + a + ', dan +' + b
    } else {
      final = val1 - b; eq = `${a}x − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 / a
      desc = 'Eerst ×' + a + ', dan −' + b
    }
  } else {
    const pattern = r(0, 3)
    if (pattern === 0) {
      a = r(2, 5); b = r(2, 8); x = r(4, 15) * a
      const val1 = x / a; final = val1 - b
      eq = `x / ${a} − ${b} = ${final}`; correctOp1 = `+${b}`; correctOp2 = `×${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 * a
      desc = 'Eerst ÷' + a + ', dan −' + b
    } else if (pattern === 1) {
      a = r(2, 5); b = r(2, 8); x = r(4, 15) * a
      const val1 = x / a; final = val1 + b
      eq = `x / ${a} + ${b} = ${final}`; correctOp1 = `−${b}`; correctOp2 = `×${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 * a
      desc = 'Eerst ÷' + a + ', dan +' + b
    } else if (pattern === 2) {
      a = r(2, 5); b = r(1, 9); x = r(3, 15)
      const val1 = x * a; final = val1 + b
      eq = `${a}x + ${b} = ${final}`; correctOp1 = `−${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 / a
      desc = 'Eerst ×' + a + ', dan +' + b
    } else {
      a = r(2, 5); b = r(1, 9); x = r(3, 15)
      const val1 = x * a; final = val1 - b
      eq = `${a}x − ${b} = ${final}`; correctOp1 = `+${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 / a
      desc = 'Eerst ×' + a + ', dan −' + b
    }
  }
  return { eq, final, correctOp1, correctOp2, expectedVal1, expectedVal2, desc }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const step = ref(0)
const op1 = ref(''); const val1 = ref(null); const op2 = ref(''); const val2 = ref(null)

const allOps = computed(() => {
  const lvl = currentLevel.value
  if (!lvl) return []
  const nums = new Set()
  const matches = `${lvl.eq} ${lvl.final} ${lvl.expectedVal1} ${lvl.expectedVal2}`.match(/\d+/g) || []
  matches.forEach(n => { const v = parseInt(n); if (v > 0 && v <= 12) nums.add(v) })
  ;[1, 2, 3, 4, 5, 6].forEach(n => nums.add(n))
  const ops = new Set([lvl.correctOp1, lvl.correctOp2])
  for (const n of nums) {
    if (ops.size >= 12) break
    if (!ops.has(`+${n}`)) ops.add(`+${n}`)
    if (!ops.has(`−${n}`)) ops.add(`−${n}`)
  }
  return Array.from(ops).slice(0, 12)
})

function getOpClass(op) {
  if (op.includes('+')) return 'bg-amber-100 text-amber-800 border-amber-400'
  if (op.includes('−')) return 'bg-red-100 text-red-800 border-red-400'
  return 'bg-slate-200 text-slate-700 border-slate-400'
}

function getHint() {
  const lvl = currentLevel.value
  if (step.value === 1) {
    if (attemptCount.value === 1) return { type: 'info', text: 'Welke tegengestelde bewerking maak je van de laatste bewerking?' }
    if (attemptCount.value === 2) return { type: 'info', text: `De laatste bewerking was in de machine. Het tegengestelde is ${lvl.correctOp1}.` }
    return { type: 'info', text: `Kies ${lvl.correctOp1} als eerste tegengestelde bewerking.` }
  }
  if (step.value === 3) {
    if (attemptCount.value === 1) return { type: 'info', text: 'Wat is het tegengestelde van de eerste bewerking?' }
    if (attemptCount.value === 2) return { type: 'info', text: `Het tegengestelde van de eerste bewerking is ${lvl.correctOp2}. Let op het bewerkingsteken!` }
    return { type: 'info', text: `Kies ${lvl.correctOp2}.` }
  }
  return { type: 'info', text: '' }
}

// --- Prediction gate state ---
const showPrediction = ref(true)
const predictedLastOp = ref('')

function initPrediction() {
  showPrediction.value = !showWorkedExample.value
  predictedLastOp.value = ''
  if (showPrediction.value) {
    const lvl = currentLevel.value
    const machineOps = [
      { id: lvl.correctOp1, label: `Het tegengestelde van ${lvl.eq.split(' ').slice(-2,-1)[0]}` },
    ]
  }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  initPrediction()
}

function selectOp(op) {
  const lvl = currentLevel.value
  if (step.value === 0) {
    if (op === lvl.correctOp1) {
      op1.value = op; step.value = 1
      attemptCount.value = 0
      feedback.value = { type: 'success', text: `Juist! Het tegengestelde van de laatste bewerking is "${op}". Bereken: ${lvl.final} ${op}` }
    } else {
      attemptCount.value++
      const hint = getHint()
      feedback.value = { type: 'error', text: `Fout. ${hint.text}` }
    }
  } else if (step.value === 2) {
    if (op === lvl.correctOp2) {
      op2.value = op; step.value = 3
      attemptCount.value = 0
      feedback.value = { type: 'success', text: `Juist! Het tegengestelde van de eerste bewerking is "${op}". Bereken: ${val1.value} ${op}` }
    } else {
      attemptCount.value++
      const hint = getHint()
      feedback.value = { type: 'error', text: `Fout. ${hint.text}` }
    }
  }
}

function checkVal1() {
  if (val1.value === currentLevel.value.expectedVal1) {
    step.value = 2; attemptCount.value = 0
    feedback.value = { type: 'success', text: `Correct, ${currentLevel.value.final} ${op1.value} = ${val1.value}. Kies nu de volgende tegengestelde bewerking.` }
  } else {
    attemptCount.value++
    const hint = getHint()
    feedback.value = { type: 'error', text: `Reken nog eens. ${hint.text}` }
  }
}

function checkVal2() {
  isChecked.value = true
  if (val2.value === currentLevel.value.expectedVal2) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Briljant! x = ${val2.value}.` }
  } else {
    attemptCount.value++
    const hint = getHint()
    feedback.value = { type: 'error', text: `Fout. ${hint.text}` }
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['tegengesteld', 'omgekeerd', 'omkeren', 'machin', 'achteruit']
  const hasKeyword = keywords.some(k => ans.includes(k))
  if (hasKeyword && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Probeer het uit te leggen: werk achteruit, elke bewerking keer je om.' }
  }
}

function resetActivityState() {
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
  isCorrect.value = false; isChecked.value = false; step.value = 0; op1.value = ''; val1.value = null; op2.value = ''; val2.value = null
  celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  feedback.value = { type: 'info', text: 'Kijk naar de machine: welke bewerking wordt als laatste toegepast op x?' }
  initPrediction()
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
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
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld:</p>
            <p class="font-mono text-lg font-bold text-slate-800 mb-2">2x + 3 = 11</p>
            <p class="text-sm text-slate-700 mb-2">De machine doet: <strong>x → ×2 → +3 → 11</strong></p>
            <p class="text-sm text-slate-700 mb-2">Terugdraaien: <strong>11 → −3 → ÷2 → x</strong></p>
            <p class="text-xs text-slate-500 mb-2">De omgekeerde volgorde is: eerst −3 (tegengestelde van +3), dan ÷2 (tegengestelde van ×2).</p>
            <p class="font-mono text-base font-bold text-emerald-700">x = (11 − 3) ÷ 2 = 4</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-mono text-2xl font-black text-slate-800">{{ currentLevel.eq }}</p>
            <p class="text-xs text-slate-500 mt-1">Beschrijving: {{ currentLevel.desc }}</p>
          </div>

          <!-- Prediction -->
          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Welke bewerking wordt als LAATST toegepast op x?</p>
            <p class="text-sm text-slate-600 mb-3">Kijk naar de vergelijking: {{ currentLevel.eq }}</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <button v-for="op in allOps" :key="op" @click="selectOp(op)"
                :disabled="step !== 0"
                class="py-2 px-3 rounded-lg border-2 font-bold text-sm transition-all disabled:opacity-30 hover:opacity-80"
                :class="getOpClass(op)">
                {{ op }}
              </button>
            </div>
          </div>

          <!-- Reverse pipeline (after prediction) -->
          <div v-if="!showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">
              {{ step === 0 ? 'Kies de eerste tegengestelde bewerking:' : step === 1 ? 'Bereken de tussenstap:' : step === 2 ? 'Kies de volgende tegengestelde bewerking:' : 'Bereken x:' }}
            </p>

            <!-- Op buttons (step 0 or 2) -->
            <div v-if="step === 0 || step === 2" class="flex flex-wrap gap-2 justify-center">
              <button v-for="op in allOps" :key="op" @click="selectOp(op)"
                class="py-2 px-3 rounded-lg border-2 font-bold text-sm transition-all hover:opacity-80 disabled:opacity-30"
                :class="getOpClass(op)">
                {{ op }}
              </button>
            </div>

            <!-- Value inputs -->
            <div v-if="step === 1" class="flex items-center gap-2 justify-center">
              <span class="text-slate-700 font-mono font-bold">{{ currentLevel.final }} {{ op1 }}</span>
              <input type="number" v-model.number="val1" @keyup.enter="checkVal1" class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500" placeholder="?" />
              <button @click="checkVal1" class="py-2 px-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">=</button>
            </div>
            <div v-if="step === 3" class="flex items-center gap-2 justify-center">
              <span class="text-slate-700 font-mono font-bold">{{ val1 }} {{ op2 }}</span>
              <input type="number" v-model.number="val2" @keyup.enter="checkVal2" class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500" placeholder="?" />
              <button @click="checkVal2" class="py-2 px-4 font-bold text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm active:scale-[0.98]">= x</button>
            </div>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt de machine terugdraaien?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Een vergelijking is een machine: x gaat erin, er worden bewerkingen op losgelaten, en het resultaat komt eruit. Door de machine <strong>achterstevoren</strong> te laten lopen — elke bewerking vervangen door zijn tegengestelde — vind je de oorspronkelijke x terug. Dit is identiek aan de balansmethode: wat je rechts doet (laatste bewerking wegwerken), doe je ook links.</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Waarom werk je in omgekeerde volgorde (laatste bewerking eerst)? Leg uit.</p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-indigo-300 rounded-lg bg-white outline-none focus:border-indigo-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]">Bevestig</button>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4" role="status" aria-live="polite" aria-atomic="true"
            :class="{ 'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-blue-100 text-blue-800 border-blue-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
            <button v-if="isCorrect && !showReflection" @click="nextLevel" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] flex items-center justify-center gap-2">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
              <PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <!-- Visual area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-4xl flex flex-col items-center gap-6">
            <div class="font-mono font-black text-2xl text-amber-600 bg-white px-6 py-3 rounded-xl shadow-sm border border-amber-200">{{ currentLevel.eq }}</div>

            <!-- Reverse Pipeline -->
            <div class="flex items-center w-full justify-between px-4 bg-white p-5 rounded-xl border-2 border-slate-200 shadow-md">
              <!-- x box -->
              <div class="w-20 h-20 rounded-xl flex items-center justify-center shadow-inner transition-colors border-2"
                :class="isCorrect ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : step >= 3 ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-400'">
                <span v-if="!isCorrect && step < 3" class="font-black text-3xl text-slate-400">x</span>
                <span v-else class="font-black text-3xl">{{ isCorrect ? currentLevel.expectedVal2 : val2 }}</span>
              </div>
              <!-- Arrow + op2 -->
              <div class="flex-1 flex flex-col items-center mx-2">
                <div class="h-1 w-full bg-amber-300 relative flex items-center">
                  <div class="w-3 h-3 border-b-2 border-l-2 border-amber-500 transform -rotate-45 absolute -left-1"></div>
                </div>
                <div class="mt-1 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg font-bold text-sm text-amber-800 min-w-[60px] text-center"
                  :class="step >= 2 ? 'ring-2 ring-amber-400' : 'opacity-50'">{{ op2 || '?' }}</div>
              </div>
              <!-- Mid box -->
              <div class="w-20 h-20 rounded-xl flex items-center justify-center shadow-inner transition-colors border-2"
                :class="step >= 1 ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-400'">
                <span v-if="step < 1" class="font-black text-3xl text-slate-400">?</span>
                <input v-else type="number" v-model.number="val1" :disabled="step >= 2"
                  class="w-full h-full bg-transparent text-center font-black text-2xl text-amber-700 outline-none" />
              </div>
              <!-- Arrow + op1 -->
              <div class="flex-1 flex flex-col items-center mx-2">
                <div class="h-1 w-full bg-amber-300 relative flex items-center">
                  <div class="w-3 h-3 border-b-2 border-l-2 border-amber-500 transform -rotate-45 absolute -left-1"></div>
                </div>
                <div class="mt-1 bg-amber-100 border border-amber-300 px-3 py-1 rounded-lg font-bold text-sm text-amber-800 min-w-[60px] text-center"
                  :class="step >= 0 ? 'ring-2 ring-amber-400' : 'opacity-50'">{{ op1 || '?' }}</div>
              </div>
              <!-- Final box -->
              <div class="w-20 h-20 rounded-xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-inner">
                <span class="font-black text-3xl text-slate-700">{{ currentLevel.final }}</span>
              </div>
            </div>

            <p class="text-xs text-slate-400 text-center">Pijlen lezen van rechts naar links: van resultaat → terug naar x</p>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
