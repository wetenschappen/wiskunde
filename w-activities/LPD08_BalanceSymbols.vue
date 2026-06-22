<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Rationale Getallen: Ongelijkheden' },
  instruction: { type: String, default: 'Vergelijk twee getallen: bereken eerst welk groter is, gebruik dan de slider als controle.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(true)
const predictedAnswer = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  const pairs = [
    { left: '1/3', right: '1/4', leftVal: 0.333, rightVal: 0.25, correct: 'rechts', hint: 'Maak gelijke noemers: 1/3 = 4/12, 1/4 = 3/12. Welke is groter?' },
    { left: '1/2', right: '1/5', leftVal: 0.5, rightVal: 0.2, correct: 'links', hint: '1/2 = 5/10, 1/5 = 2/10.' },
    { left: '2/3', right: '3/4', leftVal: 0.666, rightVal: 0.75, correct: 'rechts', hint: 'Zet om naar twaalfden: 2/3 = 8/12, 3/4 = 9/12.' },
    { left: '-0.5', right: '-0.3', leftVal: -0.5, rightVal: -0.3, correct: 'rechts', hint: 'Negatieve getallen: hoe dichter bij 0, hoe groter.' },
    { left: '-0.5', right: '-0.8', leftVal: -0.5, rightVal: -0.8, correct: 'links', hint: '-0.5 > -0.8: -0.5 ligt dichter bij 0.' },
    { left: '-1.2', right: '-0.9', leftVal: -1.2, rightVal: -0.9, correct: 'rechts', hint: '-1.2 is kleiner dan -0.9.' },
    { left: '3/6', right: '1/2', leftVal: 0.5, rightVal: 0.5, correct: 'gelijk', hint: 'Vereenvoudig 3/6.' },
    { left: '-0.25', right: '-0.5', leftVal: -0.25, rightVal: -0.5, correct: 'links', hint: '-0.25 > -0.5.' },
    { left: '0.6', right: '2/3', leftVal: 0.6, rightVal: 0.666, correct: 'rechts', hint: '2/3 = 0,666...' },
  ]
  const shuffled = [...pairs].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const tiltValue = ref(0)

const currentSymbol = computed(() => {
  if (tiltValue.value < 0) return '>'
  if (tiltValue.value > 0) return '<'
  return '='
})

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value !== 0
  predictedAnswer.value = ''
  tiltValue.value = 0
  feedback.value = { type: 'info', text: '' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) showPrediction.value = true
}

function checkPrediction() {
  const prob = currentLevelData.value
  if (predictedAnswer.value === prob.correct) {
    showPrediction.value = false
    const tilt = prob.correct === 'links' ? -1 : (prob.correct === 'rechts' ? 1 : 0)
    tiltValue.value = tilt
    feedback.value = { type: 'success', text: `Juist! ${prob.leftVal > prob.rightVal ? prob.left + ' > ' + prob.right : prob.leftVal < prob.rightVal ? prob.left + ' < ' + prob.right : prob.left + ' = ' + prob.right}` }
  } else {
    feedback.value = { type: 'error', text: `Niet correct. Tip: ${prob.hint}` }
  }
}

watch(tiltValue, (val) => {
  if (isCorrect.value || showPrediction.value || showWorkedExample.value) return
  const prob = currentLevelData.value
  let correctTilt = prob.correct === 'links' ? -1 : (prob.correct === 'rechts' ? 1 : 0)
  if (val === correctTilt) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Correct! ${prob.left} ${currentSymbol.value} ${prob.right}` }
  }
})

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const prob = currentLevelData.value
  const isNegative = prob.leftVal < 0 || prob.rightVal < 0
  const keywords = isNegative ? ['negatief', 'nul', 'dichter', 'kleiner', 'groter'] : ['noemer', 'gelijknamig', 'breuk', 'kommagetal', 'decimaal']
  if (keywords.some(k => ans.includes(k)) && ans.length > 8) {
    showReflection.value = false; celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Probeer uit te leggen welke methode je hebt gebruikt.' }
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
onMounted(() => {})
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

          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Vergelijk 1/3 en 1/4</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Methode 1:</strong> gelijke noemers: 1/3 = 4/12, 1/4 = 3/12. 4/12 &gt; 3/12, dus 1/3 &gt; 1/4.</p>
            <p class="text-sm text-slate-700 mb-1"><strong>Methode 2:</strong> decimaal: 1/3 ≈ 0,333 en 1/4 = 0,25. 0,333 &gt; 0,25.</p>
            <p class="text-xs text-slate-500 mb-2"><strong>Let op negatieve getallen:</strong> -0,5 &lt; -0,3 omdat -0,5 links van -0,3 op de getallenas ligt.</p>
            <button @click="skipWorkedExample" class="text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start →</button>
          </div>

          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">Opdracht {{ currentInternalLevel + 1 }}:</p>
            <div class="flex items-center justify-center gap-4 mt-2">
              <span class="text-2xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200">{{ currentLevelData.left }}</span>
              <span class="text-2xl font-black text-amber-500">?</span>
              <span class="text-2xl font-black text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200">{{ currentLevelData.right }}</span>
            </div>
          </div>

          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Bereken: welk is groter?</p>
            <div class="grid grid-cols-3 gap-2">
              <button @click="predictedAnswer = 'links'" class="py-3 rounded-lg border-2 font-bold text-sm" :class="predictedAnswer === 'links' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">Links &gt;</button>
              <button @click="predictedAnswer = 'gelijk'" class="py-3 rounded-lg border-2 font-bold text-sm" :class="predictedAnswer === 'gelijk' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">Gelijk =</button>
              <button @click="predictedAnswer = 'rechts'" class="py-3 rounded-lg border-2 font-bold text-sm" :class="predictedAnswer === 'rechts' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">Rechts &gt;</button>
            </div>
            <button v-if="predictedAnswer" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">Bevestig</button>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">{{ currentLevelData.leftVal < 0 || currentLevelData.rightVal < 0 ? 'Waarom zijn negatieve getallen anders?' : 'Waarom werkt omzetten naar gelijke noemers?' }}</p>
            <p class="text-xs text-indigo-700 leading-relaxed">{{ currentLevelData.leftVal < 0 || currentLevelData.rightVal < 0 ? 'Op de getallenas liggen negatieve getallen links van 0. Hoe kleiner het getal, hoe verder het van 0 verwijderd is. -0,5 is kleiner dan -0,3 omdat -0,5 links van -0,3 ligt.' : 'Door breuken gelijknamig te maken (zelfde noemer), kun je de tellers rechtstreeks vergelijken. 1/3 en 1/4 worden 4/12 en 3/12 — en 4 > 3.' }}</p>
          </div>

          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">{{ currentLevelData.leftVal < 0 || currentLevelData.rightVal < 0 ? 'Waarom is -0,5 < -0,3 terwijl 0,5 > 0,3?' : 'Hoe heb je de getallen vergeleken?' }}</p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-indigo-300 rounded-lg bg-white outline-none focus:border-indigo-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4"
            :class="{ 'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-blue-100 text-blue-800 border-blue-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
            <button v-if="isCorrect && !showReflection" @click="handleNext" class="flex-1 py-4 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] flex items-center justify-center gap-2">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center gap-8">
            <div class="text-center" v-if="!showPrediction && !showWorkedExample">
              <span class="text-3xl font-black font-mono bg-white px-8 py-4 rounded-full shadow-sm border-2 border-slate-200">
                {{ currentLevelData.left }} {{ currentSymbol }} {{ currentLevelData.right }}
              </span>
            </div>
            <div class="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p class="text-center font-bold text-slate-500 mb-4 uppercase tracking-widest text-xs">Kantel de weegschaal (controle)</p>
              <input type="range" min="-1" max="1" step="1" v-model.number="tiltValue" :disabled="isCorrect || showPrediction || showWorkedExample"
                     class="w-full accent-amber-500" />
              <div class="flex justify-between text-xs text-slate-400 mt-1">
                <span>Links &gt;</span><span>=</span><span>&lt; Rechts</span>
              </div>
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
