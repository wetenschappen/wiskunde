<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhEngine, PhArrowClockwise, PhArrowUUpLeft } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Vergelijkingen: De Machine Terugdraaien' },
  instruction: { type: String, default: 'Draai de machine om: kies de tegengestelde bewerkingen.<br/><br/><strong>Opdracht:</strong> Werk van achter naar voor om x te vinden.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhEngine }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de eerste tegengestelde bewerking.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  let x, a, b, final, correctOp1, correctOp2, expectedVal1, expectedVal2, eq

  if (levelNum === 0) {
    // Level 1: simple, small numbers, division then add/sub
    const pattern = r(0, 1)
    a = r(2, 4)
    b = r(2, 6)
    x = r(3, 12) * a
    const val1 = x / a
    if (pattern === 0) {
      final = val1 - b
      eq = `x/${a} − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `×${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 * a
    } else {
      final = val1 + b
      eq = `x/${a} + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `×${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 * a
    }
  } else if (levelNum === 1) {
    // Level 2: multiplication then add/sub, medium ranges
    const pattern = r(0, 1)
    a = r(2, 4)
    b = r(1, 6)
    x = r(3, 12)
    const val1 = x * a
    if (pattern === 0) {
      final = val1 + b
      eq = `${a}x + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 / a
    } else {
      final = val1 - b
      eq = `${a}x − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 / a
    }
  } else {
    // Level 3: wider ranges, mix of patterns
    const pattern = r(0, 3)
    if (pattern === 0) {
      a = r(2, 5); b = r(2, 8); x = r(4, 15) * a
      const val1 = x / a; final = val1 - b
      eq = `x/${a} − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `×${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 * a
    } else if (pattern === 1) {
      a = r(2, 5); b = r(2, 8); x = r(4, 15) * a
      const val1 = x / a; final = val1 + b
      eq = `x/${a} + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `×${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 * a
    } else if (pattern === 2) {
      a = r(2, 5); b = r(1, 9); x = r(3, 15)
      const val1 = x * a; final = val1 + b
      eq = `${a}x + ${b} = ${final}`
      correctOp1 = `−${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final - b; expectedVal2 = expectedVal1 / a
    } else {
      a = r(2, 5); b = r(1, 9); x = r(3, 15)
      const val1 = x * a; final = val1 - b
      eq = `${a}x − ${b} = ${final}`
      correctOp1 = `+${b}`; correctOp2 = `÷${a}`
      expectedVal1 = final + b; expectedVal2 = expectedVal1 / a
    }
  }
  return { eq, final, correctOp1, correctOp2, expectedVal1, expectedVal2, desc: '' }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])

const step = ref(0)
const op1 = ref(''); const val1 = ref(null); const op2 = ref(''); const val2 = ref(null)

const allOps = computed(() => {
  const lvl = currentLevel.value
  if (!lvl) return []
  const nums = new Set()
  const allText = `${lvl.eq} ${lvl.final} ${lvl.expectedVal1} ${lvl.expectedVal2}`
  const matches = allText.match(/\d+/g) || []
  matches.forEach(n => { const v = parseInt(n); if (v > 0 && v <= 12) nums.add(v) })
  ;[1, 2, 3, 4, 5, 6].forEach(n => nums.add(n))
  const ops = new Set([lvl.correctOp1, lvl.correctOp2])
  for (const n of nums) {
    if (ops.size >= 12) break
    if (!ops.has(`+${n}`)) ops.add(`+${n}`)
    if (!ops.has(`−${n}`)) ops.add(`−${n}`)
    if (!ops.has(`×${n}`)) ops.add(`×${n}`)
    if (!ops.has(`÷${n}`)) ops.add(`÷${n}`)
  }
  return Array.from(ops).slice(0, 12)
})

function getOpClass(op) {
  if (op.includes('+')) return 'bg-emerald-600 border-emerald-400'
  if (op.includes('−')) return 'bg-red-600 border-red-400'
  if (op.includes('×')) return 'bg-blue-600 border-blue-400'
  return 'bg-purple-600 border-purple-400'
}

function getHint() {
  const lvl = currentLevel.value
  if (step.value === 1) {
    if (attemptCount.value === 1) return 'Denk aan de omgekeerde bewerking. Wat is het tegengestelde?'
    if (attemptCount.value === 2) return `Bereken ${lvl.final} ${lvl.correctOp1}. Welk getal krijg je?`
    return `Het antwoord is ${lvl.expectedVal1}. Vul dat in.`
  }
  if (step.value === 3) {
    if (attemptCount.value === 1) return 'Controleer je tussenstap nog eens.'
    if (attemptCount.value === 2) return `Bereken ${lvl.expectedVal1} ${lvl.correctOp2}.`
    return `Het antwoord is ${lvl.expectedVal2}.`
  }
  return ''
}

function selectOp(op) {
  const lvl = currentLevel.value
  if (step.value === 0) {
    if (op === lvl.correctOp1) {
      op1.value = op; step.value = 1
      feedback.value = { type: 'success', text: `Juist! Het tegengestelde van "${lvl.eq.split(' ').slice(-2,-1)[0]}" is "${op}". Bereken nu ${lvl.final} ${op}.` }
    } else {
      attemptCount.value++
      const hint = attemptCount.value === 1 ? 'Wat is het tegengestelde van de laatste bewerking?' : attemptCount.value === 2 ? `De laatste bewerking is ... Het tegengestelde is ${lvl.correctOp1}.` : `Kies ${lvl.correctOp1}.`
      feedback.value = { type: 'error', text: `Fout. ${hint}` }
    }
  } else if (step.value === 2) {
    if (op === lvl.correctOp2) {
      op2.value = op; step.value = 3
      feedback.value = { type: 'success', text: `Juist! Het tegengestelde van de eerste bewerking is "${op}". Bereken ${val1.value} ${op}.` }
    } else {
      attemptCount.value++
      const hint = attemptCount.value === 1 ? 'Wat is het tegengestelde van de eerste bewerking?' : attemptCount.value === 2 ? `De eerste bewerking is ... Het tegengestelde is ${lvl.correctOp2}.` : `Kies ${lvl.correctOp2}.`
      feedback.value = { type: 'error', text: `Fout. ${hint}` }
    }
  }
}

function checkVal1() {
  if (val1.value === currentLevel.value.expectedVal1) {
    step.value = 2
    attemptCount.value = 0
    feedback.value = { type: 'success', text: `Correct, ${currentLevel.value.final} ${op1.value} = ${val1.value}. Kies nu de volgende bewerking.` }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: `Reken nog eens. ${getHint()}` }
  }
}

function checkVal2() {
  isChecked.value = true
  if (val2.value === currentLevel.value.expectedVal2) {
    isCorrect.value = true
    feedback.value = { type: 'success', text: `Briljant! x = ${val2.value}. Door alle bewerkingen om te keren vind je de onbekende!` }
  } else {
    attemptCount.value++
    feedback.value = { type: 'error', text: `Fout. ${getHint()}` }
  }
}

function resetActivityState() {
  levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
  isCorrect.value = false; isChecked.value = false; step.value = 0; op1.value = ''; val1.value = null; op2.value = ''; val2.value = null
celebrationDone.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Kies de eerste tegengestelde bewerking.' }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState() }
  else emit('complete')
}

function goToNextStep() { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') }

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}) })
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); window.removeEventListener('keydown', handleKeydown); shouldPulse.value = false }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.removeEventListener('fullscreenchange', handleFullscreenChange); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) })
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">
      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20"><component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" /></div>
          <div><h2 class="text-lg font-bold text-slate-100">{{ title }}</h2><p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p></div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="props.instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />
            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner text-center">
              <label class="block text-sm font-bold text-slate-300 mb-4 flex items-center justify-center gap-2"><PhArrowUUpLeft weight="bold" /> Kies tegengestelde:</label>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="op in allOps" :key="op" @click="selectOp(op)"
                  :disabled="isCorrect || (step !== 0 && step !== 2) || (step === 0 && currentLevel.correctOp1 !== op && op1.value !== '' && op !== currentLevel.correctOp1) || (step === 2 && currentLevel.correctOp2 !== op && op2.value !== '' && op !== currentLevel.correctOp2)"
                  class="py-2 rounded border-2 font-black text-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-80"
                  :class="getOpClass(op)">
                  {{ op }}
                </button>
              </div>
            </div>
          </div>
          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
              :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error'}">
              <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="step === 1" @click="checkVal1" class="flex-1 py-3 font-bold tracking-widest uppercase rounded-lg bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400 border-b-4 active:border-b-0">Tussenstap</button>
              <button v-else-if="step === 3 && !isCorrect" @click="checkVal2" class="flex-1 py-3 font-bold tracking-widest uppercase rounded-lg bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400 border-b-4 active:border-b-0">Bereken x</button>
              <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1" @click="nextLevel" class="flex-1 py-3 font-bold text-slate-900 rounded-lg bg-emerald-400 hover:bg-emerald-300">Volgend Level</button>
              <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1" @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 rounded-lg bg-amber-400 hover:bg-amber-300"><span>Afronden</span><PhArrowRight weight="bold" /></button>
              <div v-else-if="step !== 1 && step !== 3" class="flex-1 py-3"></div>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">
            <div class="w-full max-w-4xl flex flex-col items-center gap-8">
              <div class="font-mono font-black text-2xl text-emerald-400">{{ currentLevel.eq }}</div>
              <!-- Reverse Pipeline -->
              <div class="flex items-center w-full justify-between px-8 bg-slate-800 p-6 rounded-2xl border-4 border-slate-600 shadow-xl relative">
                <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner transition-colors" :class="isCorrect ? 'bg-emerald-500 border-4 border-emerald-300' : 'bg-slate-900 border-4 border-emerald-600'">
                  <span v-if="!isCorrect && step < 3" class="font-black text-4xl text-emerald-600 opacity-50">x</span>
                  <input v-else type="number" v-model.number="val2" :disabled="isCorrect" class="w-full h-full bg-transparent text-center font-black text-4xl text-white outline-none focus:bg-emerald-900" />
                </div>
                <div class="h-2 flex-1 bg-emerald-600 mx-4 relative flex items-center justify-center transition-all" :class="step >= 3 ? 'bg-emerald-400' : ''">
                  <div class="w-3 h-3 border-b-2 border-l-2 border-emerald-600 transform rotate-45 absolute -left-1" :class="step >= 3 ? 'border-emerald-400' : ''"></div>
                  <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 border-2 border-slate-500 px-4 py-2 rounded-lg font-black text-xl text-emerald-400 min-w-[80px] text-center" :class="step === 2 ? 'ring-2 ring-emerald-400 animate-pulse' : ''">{{ op2 || '…' }}</div>
                </div>
                <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner transition-colors" :class="step >= 2 ? 'bg-emerald-800 border-4 border-emerald-500' : 'bg-slate-900 border-4 border-slate-600'">
                  <span v-if="step < 1" class="font-black text-4xl text-slate-700">?</span>
                  <input v-else type="number" v-model.number="val1" :disabled="step >= 2" class="w-full h-full bg-transparent text-center font-black text-4xl text-emerald-300 outline-none focus:bg-slate-800" />
                </div>
                <div class="h-2 flex-1 bg-emerald-600 mx-4 relative flex items-center justify-center transition-all" :class="step >= 1 ? 'bg-emerald-400' : ''">
                  <div class="w-3 h-3 border-b-2 border-l-2 border-emerald-600 transform rotate-45 absolute -left-1" :class="step >= 1 ? 'border-emerald-400' : ''"></div>
                  <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-700 border-2 border-slate-500 px-4 py-2 rounded-lg font-black text-xl text-emerald-400 min-w-[80px] text-center" :class="step === 0 ? 'ring-2 ring-emerald-400 animate-pulse' : ''">{{ op1 || '…' }}</div>
                </div>
                <div class="w-24 h-24 rounded-2xl bg-slate-700 border-4 border-slate-500 flex items-center justify-center shadow-inner"><span class="font-black text-4xl text-white">{{ currentLevel.final }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>
<style scoped>
:root { font-family: 'Inter', sans-serif; }
.bg-circuit-pattern { background-color: #0f172a; background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 20px 20px; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
