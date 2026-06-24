<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhFunction, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Formules Omvormen' },
  instruction: { type: String, default: 'Vorm de formule om door aan BEIDE kanten dezelfde bewerkingen uit te voeren tot de gevraagde variabele alleen staat.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhFunction }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(true)
const predictedStep = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])
const stateL = ref({ term: '', fraction: null })
const stateR = ref({ term: '', fraction: null })
const opType = ref('*')
const opVar = ref('')

function generateLevel() {
  const formulaPool = [
    {
      goalText: 'Isoleer s in v = s/t (snelheid)',
      targetVar: 's', steps: 1,
      initL: { term: 'v', fraction: null },
      initR: { term: 's', fraction: 't' },
      solution: 's = v·t',
      hints: ['Wat staat er nog bij s in de noemer? Vermenigvuldig met t.', 'v = s/t → v·t = s. s is nu alleen.', 's = v·t. ×t van beide kanten.'],
      mistake: 's = t/v',
      mistakeFeedback: 'Bijna! Je hebt gedeeld, maar s stond in de NOEMER van een breuk. Vermenigvuldig met t.',
      why: 's staat in de noemer (s/t). Om s te isoleren, vermenigvuldig je met t. s = v·t.'
    },
    {
      goalText: 'Isoleer t in v = s/t',
      targetVar: 't', steps: 2,
      initL: { term: 'v', fraction: null },
      initR: { term: 's', fraction: 't' },
      solution: 't = s/v',
      hints: ['Eerst ×t om t uit de noemer te halen, dan ÷v.', 'v·t = s. Nu ÷v om t te isoleren.', 't = s/v. ×t, daarna ÷v.'],
      mistake: 't = v/s',
      mistakeFeedback: 'Bijna! Je hebt gedeeld door s, maar t stond in de noemer. Eerst ×t, dan ÷v.',
      why: 'Eerst ×t om de breuk weg te werken (v·t = s), dan ÷v om t te isoleren. t = s/v.'
    },
    {
      goalText: 'Isoleer m in F = m·a (Newton)',
      targetVar: 'm', steps: 1,
      initL: { term: 'F', fraction: null },
      initR: { term: 'm·a', fraction: null },
      solution: 'm = F/a',
      hints: ['m is vermenigvuldigd met a. Deel beide kanten door a.', 'F = m·a. Deel door a.', 'm = F/a. ÷a van beide kanten.'],
      mistake: 'm = F·a',
      mistakeFeedback: 'Bijna! m·a = F, dus m = F ÷ a, niet F × a. Deel door a.',
      why: 'a vermenigvuldigt m. Het tegengestelde van × is ÷. Deel dus beide kanten door a.'
    },
    {
      goalText: 'Isoleer R in V = I·R (Ohm)',
      targetVar: 'R', steps: 1,
      initL: { term: 'V', fraction: null },
      initR: { term: 'I·R', fraction: null },
      solution: 'R = V/I',
      hints: ['R is vermenigvuldigd met I. Deel door I.', 'V = I·R → deel door I.', 'R = V/I. ÷I van beide kanten.'],
      mistake: 'R = V·I',
      mistakeFeedback: 'I·R = V, dus R = V ÷ I. Deel door I, niet vermenigvuldigen.',
      why: 'Het tegengestelde van ×I is ÷I. I·R = V → R = V/I.'
    },
    {
      goalText: 'Isoleer h in A = b·h/2 (driehoek, 2 stappen)',
      targetVar: 'h', steps: 2,
      initL: { term: 'A', fraction: null },
      initR: { term: 'b·h', fraction: '2' },
      solution: 'h = 2A/b',
      hints: ['Eerst ×2 om de noemer weg te werken, dan ÷b.', '2A = b·h. Deel nu door b.', 'h = 2A/b. ×2, dan ÷b.'],
      mistake: 'h = A/(2b)',
      mistakeFeedback: 'Eerst ×2 om de breuk weg (2A = b·h), dan ÷b isoleren. h = 2A/b, niet A/(2b).',
      why: 'De noemer 2 wegwerken (×2), daarna de factor b wegwerken (÷b). h = 2A/b.'
    },
  ]
  const shuffled = [...formulaPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value !== 0
  predictedStep.value = ''
  const init = currentLevelData.value
  stateL.value = { ...init.initL }
  stateR.value = { ...init.initR }
  opType.value = '*'; opVar.value = ''
  feedback.value = { type: 'info', text: '' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) showPrediction.value = true
  feedback.value = { type: 'info', text: 'Kies een bewerking en voer die uit op beide kanten.' }
}

function applyOperation() {
  if (isCorrect.value) return
  const v = opVar.value.trim()
  if (!v) return

  const applySide = (state) => {
    let ns = { ...state }
    if (opType.value === '*') {
      if (ns.fraction === v) { ns.fraction = null }
      else if (ns.fraction === null) { ns.term = ns.term ? `${ns.term}·${v}` : v }
      else { ns.term = `${ns.term}·${v}` }
    } else if (opType.value === '/') {
      const parts = ns.term.split('·')
      const idx = parts.indexOf(v)
      if (idx > -1) { parts.splice(idx, 1); ns.term = parts.join('·') || '1' }
      else {
        if (ns.fraction === null) { ns.fraction = v }
        else { ns.fraction = `${ns.fraction}·${v}` }
      }
    }
    return ns
  }

  stateL.value = applySide(stateL.value)
  stateR.value = applySide(stateR.value)
  opVar.value = ''
  checkWin()
}

function isIsolated(state, target) {
  return state.term === target && state.fraction === null
}

function checkWin() {
  const target = currentLevelData.value.targetVar
  const isolatedLeft = isIsolated(stateL.value, target)
  const isolatedRight = isIsolated(stateR.value, target)

  if (isolatedLeft || isolatedRight) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = {
      type: 'success',
      text: `Uitstekend! ${currentLevelData.value.solution}`
    }
  } else {
    attemptCount.value++
    const lvl = currentLevelData.value
    const idx = Math.min(attemptCount.value - 1, 2)
    feedback.value = { type: 'info', text: lvl.hints[idx] }
  }
}

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['beide', 'kant', 'zelfde', 'tegengesteld', 'isoler', 'formule']
  if (keywords.some(k => ans.includes(k)) && ans.length > 8) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: `Leg uit: welke bewerkingen heb je toegepast en waarom? Hint: ${currentLevelData.value.why}` }
  }
}

function handleNext() {
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
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Isoleer b in A = b·h</p>
            <p class="text-sm text-slate-700 mb-1">b is vermenigvuldigd met h. De tegengestelde bewerking is delen door h.</p>
            <p class="text-sm text-slate-700 mb-1">A = b·h → beide kanten ÷h: A/h = b</p>
            <p class="text-sm font-bold text-emerald-700 mb-1">b = A/h</p>
            <p class="text-xs text-slate-500">dezelfde bewerking toepassen op beide kanten. Het tegengestelde van × is ÷.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <!-- Operation controls -->
          <div v-if="!showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner">
            <p class="font-bold text-slate-800 uppercase tracking-wider text-xs">Kies een bewerking:</p>
            <div class="grid grid-cols-2 gap-2">
              <button @click="opType = '*'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '*' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">× (vermenigvuldig)</button>
              <button @click="opType = '/'" class="py-2 rounded-lg font-black border-2 text-xl" :class="opType === '/' ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-slate-200 bg-white text-slate-500'">÷ (deel)</button>
            </div>
            <input type="text" v-model="opVar" class="w-full p-3 text-lg font-bold bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 text-center" placeholder="variabele of getal (bv. a, 2, t)" />
            <button @click="applyOperation" :disabled="isCorrect || !opVar" class="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50 active:scale-[0.98]">
              Uitvoeren op beide kanten
            </button>
          </div>

          <!-- Why explanation -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt dit?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">{{ currentLevelData.why }}</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Leg uit welke bewerkingen je hebt toegepast en waarom die de variabele isoleren.</p>
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
          <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] mr-4"><PhArrowClockwise /></button>
          <button v-if="isCorrect && !showReflection" @click="handleNext" class="py-4 px-6 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
            <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
            <PhArrowRight weight="bold" class="inline ml-1" />
          </button>
        </div>
      </div>

      <!-- Visual -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="bg-white p-12 rounded-xl shadow-md border-4 flex items-center gap-6 min-w-[300px] justify-center transition-all"
            :class="isCorrect ? 'border-emerald-400' : 'border-amber-200'">
            <div class="text-3xl font-mono font-black text-slate-700 min-w-[60px] text-right" :class="{ 'text-emerald-600': isCorrect && isIsolated(stateL, currentLevelData.targetVar) }">
              <span v-if="stateL.fraction !== null" class="inline-flex flex-col items-center"><span>{{ stateL.term }}<span class="border-t-[3px] border-slate-700 block my-1"></span><span>{{ stateL.fraction }}</span></span>
              </span><span v-else>{{ stateL.term }}</span>
            </div>
            <div class="text-4xl font-black text-amber-400">=</div>
            <div class="text-3xl font-mono font-black text-slate-700 min-w-[60px] text-left" :class="{ 'text-emerald-600': isCorrect && isIsolated(stateR, currentLevelData.targetVar) }">
              <span v-if="stateR.fraction !== null" class="inline-flex flex-col items-center"><span>{{ stateR.term }}<span class="border-t-[3px] border-slate-700 block my-1"></span><span>{{ stateR.fraction }}</span></span>
              </span><span v-else>{{ stateR.term }}</span>
            </div>
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
