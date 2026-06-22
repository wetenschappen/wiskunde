<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Vergelijkingen: De Balansmethode' },
  instruction: { type: String, default: 'Een weegschaal blijft in evenwicht als je aan BEIDE kanten hetzelfde doet.<br/><br/>Bij een vergelijking pas je steeds dezelfde bewerking toe op het LINKER- en het RECHTERLID.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhScales }
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

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])
const xCount = ref(3)
const constLeft = ref(2)
const constRight = ref(11)

// --- Level generation ---
function generateLevel(levelIndex) {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  let xCount, constLeft, constRight, answer

  if (levelIndex === 0) {
    const pairs = [
      { xCount: 3, constLeft: 2, constRight: 11, answer: 3 },
      { xCount: 2, constLeft: 5, constRight: 13, answer: 4 },
      { xCount: 4, constLeft: 3, constRight: 19, answer: 4 },
      { xCount: 2, constLeft: 7, constRight: 15, answer: 4 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  } else if (levelIndex === 1) {
    const pairs = [
      { xCount: 6, constLeft: 4, constRight: 22, answer: 3 },
      { xCount: 3, constLeft: 8, constRight: 26, answer: 6 },
      { xCount: 5, constLeft: 7, constRight: 32, answer: 5 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  } else {
    const pairs = [
      { xCount: 8, constLeft: 6, constRight: 38, answer: 4 },
      { xCount: 5, constLeft: 11, constRight: 46, answer: 7 },
    ]
    const pair = pairs[rng(0, pairs.length - 1)]
    xCount = pair.xCount; constLeft = pair.constLeft; constRight = pair.constRight; answer = pair.answer
  }

  const eq = `${xCount}x + ${constLeft} = ${constRight}`
  return { eq, xCount, constLeft, constRight, divisor: xCount, answer }
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

// --- Prediction gate state ---
const showPrediction = ref(true)
const predictedFirstStep = ref('')
const predictionOptions = ref([])
const stepAfterConst = ref(false)

function initPrediction() {
  const lvl = currentLevel.value
  showPrediction.value = !showWorkedExample.value  // Skip if worked example already shown
  stepAfterConst.value = false
  predictedFirstStep.value = ''

  if (showPrediction.value) {
    predictionOptions.value = [
      { id: 'subConst', label: `Eerst ${lvl.constLeft} wegwerken (beide kanten −${lvl.constLeft})` },
      { id: 'divX', label: `Eerst delen door ${lvl.divisor}` },
      { id: 'add', label: `Eerst iets toevoegen (beide kanten +)` },
      { id: 'mult', label: `Eerst vermenigvuldigen (beide kanten ×)` },
    ]
  }
}

function checkPrediction() {
  const lvl = currentLevel.value
  if (predictedFirstStep.value === 'subConst') {
    showPrediction.value = false
    feedback.value = { type: 'success', text: 'Juist! Eerst de constante wegwerken, dan delen.' }
  } else if (predictedFirstStep.value === 'divX') {
    feedback.value = { type: 'error', text: 'Let op: er staat nog een los getal. Eerst dat wegwerken, dan pas delen.' }
  } else if (predictedFirstStep.value === 'add') {
    feedback.value = { type: 'error', text: 'We willen x isoleren, niet groter maken. Wat moet je wegdoen?' }
  } else {
    feedback.value = { type: 'error', text: 'Vermenigvuldigen maakt het complexer. Welke GETALLEN staan in de weg?' }
  }
}

// --- Operation state ---
function performOperation(op) {
  if (isCorrect.value || showPrediction.value) return
  const lvl = currentLevel.value

  if (op === 'sub') {
    if (constLeft.value >= 1) {
      attemptCount.value = 0
      constLeft.value = Math.max(0, constLeft.value - 1); constRight.value -= 1
      if (constLeft.value === 0) {
        stepAfterConst.value = true
        feedback.value = { type: 'success', text: `Nu is de constante weg! Deel nu door ${lvl.divisor} om x te vinden.` }
      } else {
        feedback.value = { type: 'success', text: `Nog ${constLeft.value} los blokje(s) over aan de linkerkant.` }
      }
    } else {
      if (stepAfterConst.value) {
        feedback.value = { type: 'error', text: 'De constante is al weg. Deel nu door het aantal x-en.' }
      } else {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Er zijn geen losse blokjes meer om weg te halen bij x.' }
        if (attemptCount.value >= 3) feedback.value = getHintText(attemptCount.value)
      }
    }
  } else if (op === 'subAll') {
    if (constLeft.value > 0) {
      attemptCount.value = 0
      constRight.value -= constLeft.value
      constLeft.value = 0
      stepAfterConst.value = true
      feedback.value = { type: 'success', text: `Alle losse blokjes weg! Deel nu door ${lvl.divisor}.` }
    } else {
      feedback.value = { type: 'error', text: 'Er zijn geen losse blokjes meer.' }
    }
  } else if (op === 'add') {
    attemptCount.value++
    constLeft.value += 1; constRight.value += 1
    feedback.value = { type: 'error', text: 'Toevoegen maakt het groter — we willen x isoleren!' }
    if (attemptCount.value >= 3) feedback.value = getHintText(attemptCount.value)
  } else if (op === 'div') {
    if (constLeft.value === 0 && !stepAfterConst.value) {
      feedback.value = { type: 'error', text: 'Haal eerst de losse blokjes weg.' }
      return
    }
    if (xCount.value === lvl.divisor) {
      xCount.value = 1
      constRight.value = constRight.value / lvl.divisor
      isCorrect.value = true
      showReflection.value = true
      reflectionAnswer.value = ''
      const xVal = constRight.value
      feedback.value = { type: 'success', text: `Perfect! x = ${xVal}` }
    } else {
      attemptCount.value++
      feedback.value = { type: 'error', text: `Deel door het juiste aantal. Je hebt ${xCount.value} x-en, deel door ${xCount.value}.` }
      if (attemptCount.value >= 3) feedback.value = getHintText(attemptCount.value)
    }
  } else if (op === 'mult') {
    attemptCount.value++
    xCount.value *= 2; constLeft.value *= 2; constRight.value *= 2
    feedback.value = { type: 'error', text: 'Vermenigvuldigen van beide kanten is toegestaan, maar hier maakt het x groter, niet kleiner.' }
    if (attemptCount.value >= 3) feedback.value = getHintText(attemptCount.value)
  }
}

function getHintText(count) {
  const lvl = currentLevel.value
  if (count >= 7) {
    return { type: 'info', text: `Stap 1: −${lvl.constLeft} van beide kanten. Stap 2: ÷${lvl.divisor}. x = ${lvl.answer}` }
  } else if (count >= 5) {
    return { type: 'info', text: `Kijk naar de balans: ${lvl.xCount}x + ${lvl.constLeft} = ${lvl.constRight}. Wat staat er nog bij die x? Eerst dat wegwerken.` }
  } else if (count >= 3) {
    return { type: 'info', text: `Probeer het stap voor stap: eerst de losse blokjes (getallen zonder x), dan pas delen.` }
  }
  return { type: 'info', text: 'Wat moet je eerst doen? Welke blokjes zijn "los" (zonder x)?' }
}

// --- Reflection ---
function checkReflection() {
  const lvl = currentLevel.value
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['constant', lvl.constLeft.toString(), 'los', 'getal', 'wegwerk']
  const hasKeyword = keywords.some(k => ans.includes(k))
  if (hasKeyword && ans.length > 5) {
    showReflection.value = false
    celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Probeer uit te leggen met de woorden: constanten, wegwerken, delen.' }
  }
}

// --- Navigation ---
function resetActivityState() {
  levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value)
  isCorrect.value = false
  celebrationDone.value = false
  showReflection.value = false
  reflectionAnswer.value = ''
  stepAfterConst.value = false
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  predictedFirstStep.value = ''
  feedback.value = { type: 'info', text: '' }
  xCount.value = currentLevel.value.xCount
  constLeft.value = currentLevel.value.constLeft
  constRight.value = currentLevel.value.constRight
  initPrediction()
}

function skipWorkedExample() {
  showWorkedExample.value = false
  initPrediction()
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => {
      shouldPulse.value = true
      setTimeout(() => { shouldPulse.value = false }, 3000)
      mainArea.value?.focus()
    })
  } else {
    shouldPulse.value = false
    window.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => document.addEventListener('fullscreenchange', () => {
  if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close')
}))

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// --- Worked Example (Level 0) ---
const exampleData = {
  eq: '3x + 2 = 11',
  steps: [
    'Stap 1: −2 van beide kanten → 3x = 9',
    'Stap 2: ÷3 van beide kanten → x = 3'
  ],
  explanation: 'Waarom werkt dit? De balans is in evenwicht door het =-teken. Als je op de ene schaal een blokje wegneemt, moet je dat op de andere schaal ook doen om het evenwicht te bewaren.'
}
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

          <!-- Worked Example (Level 1 alleen) -->
          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld:</p>
            <p class="font-mono text-lg font-bold text-slate-800 mb-2">{{ exampleData.eq }}</p>
            <ol class="list-decimal list-inside text-sm text-slate-700 space-y-1 mb-2">
              <li v-for="(step, i) in exampleData.steps" :key="i">{{ step }}</li>
            </ol>
            <p class="text-xs text-slate-500 mt-1">{{ exampleData.explanation }}</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start de opdracht →</button>
          </div>

          <!-- Goal text -->
          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800 text-lg font-mono">{{ currentLevel.eq }}</p>
            <p class="text-sm text-slate-600 mt-1">{{ currentLevel.constLeft === 0 ? 'Deel door het aantal x-en.' : 'Haal de losse blokjes weg, deel dan door x.' }}</p>
          </div>

          <!-- Prediction gate -->
          <div v-if="showPrediction" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 mb-3 text-sm">Wat is de EERSTE stap?</p>
            <div class="flex flex-col gap-2">
              <button v-for="opt in predictionOptions" :key="opt.id" @click="predictedFirstStep = opt.id"
                class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                :class="predictedFirstStep === opt.id ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'">
                {{ opt.label }}
              </button>
            </div>
            <button v-if="predictedFirstStep" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">
              Bevestig
            </button>
          </div>

          <!-- Operation buttons -->
          <div v-if="!showPrediction && !showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-3 shadow-inner">
            <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Kies een actie (op beide kanten):</p>
            <div class="grid grid-cols-2 gap-2">
              <button @click="performOperation('sub')" :disabled="isCorrect" class="py-3 rounded-lg border-2 font-bold bg-white border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-600 active:scale-[0.98] text-lg disabled:opacity-40">− 1</button>
              <button @click="performOperation('add')" :disabled="isCorrect" class="py-3 rounded-lg border-2 font-bold bg-white border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-600 active:scale-[0.98] text-lg disabled:opacity-40">+ 1</button>
              <button v-if="constLeft > 0" @click="performOperation('subAll')" :disabled="isCorrect" class="py-3 rounded-lg border-2 font-bold bg-white border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-600 active:scale-[0.98] text-sm disabled:opacity-40 col-span-2">
                Blokjes allemaal weg: −{{ constLeft }}
              </button>
              <button @click="performOperation('div')" :disabled="isCorrect" class="py-3 rounded-lg border-2 font-bold bg-white border-amber-300 text-amber-700 hover:border-amber-500 active:scale-[0.98] text-lg disabled:opacity-40">
                ÷ {{ xCount }}
              </button>
              <button @click="performOperation('mult')" :disabled="isCorrect" class="py-3 rounded-lg border-2 font-bold bg-white border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-600 active:scale-[0.98] text-lg disabled:opacity-40">× 2</button>
            </div>
          </div>

          <!-- Why explanation after success -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt de balansmethode?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Het =-teken is als een balans in evenwicht. <strong>Alles wat je aan de ene kant doet, moet je aan de andere kant ook doen.</strong> Eerst haal je de constante weg (aftrekken), daarna deel je door de coëfficiënt van x. Zo blijft de vergelijking waar terwijl je x isoleert.</p>
          </div>

          <!-- Reflection -->
          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Waarom mag je de constante wegwerken VOOR je deelt? Leg uit in je eigen woorden.</p>
            <input v-model="reflectionAnswer" @keyup.enter="checkReflection" class="w-full p-2 text-sm border border-indigo-300 rounded-lg bg-white outline-none focus:border-indigo-500" placeholder="Typ je uitleg..." />
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4" role="status" aria-live="polite" aria-atomic="true"
            :class="{
              'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success',
              'bg-red-100 text-red-800 border-red-400': feedback.type === 'error',
              'bg-blue-100 text-blue-800 border-blue-400': feedback.type === 'info',
            }">
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

      <!-- Main visual area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center gap-6">
            <!-- Equation display -->
            <div class="font-mono font-black text-3xl text-slate-700 bg-white px-8 py-4 rounded-full shadow-sm border-2 border-slate-200 flex gap-3 items-center transition-all">
              <span v-if="xCount > 1">{{ xCount }}</span><span class="text-amber-600">x</span>
              <span v-if="constLeft > 0" class="text-slate-400">+</span><span v-if="constLeft > 0" class="tabular-nums">{{ constLeft }}</span>
              <span class="text-amber-500">=</span>
              <span class="tabular-nums">{{ constRight }}</span>
              <span v-if="isCorrect" class="text-emerald-600 ml-4">→ x = {{ constRight }}</span>
            </div>

            <!-- Visual balance -->
            <div class="relative w-full max-w-xl min-h-[280px]">
              <!-- Scale beam -->
              <div class="absolute bottom-24 left-0 w-full h-3 bg-amber-800 rounded-full shadow-md z-10 flex justify-between">
                <!-- Left pan -->
                <div class="absolute -left-4 bottom-full flex-col items-center flex" style="transform: translateX(-50%)">
                  <div class="flex items-end justify-center gap-1 mb-1 w-48 flex-wrap transition-all min-h-[120px]">
                    <div v-for="i in xCount" :key="'x'+i" class="w-14 h-14 bg-amber-100 border-2 border-amber-500 rounded-xl flex items-center justify-center shadow-sm animate-fadeIn">
                      <span class="font-black text-xl text-amber-600 font-mono">x</span>
                    </div>
                    <div v-for="i in constLeft" :key="'cl'+i" class="w-8 h-8 bg-slate-200 border border-slate-400 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm animate-fadeIn">1</div>
                  </div>
                  <div class="w-32 h-2 bg-amber-600 rounded-full"></div>
                </div>
                <!-- Right pan -->
                <div class="absolute -right-4 bottom-full flex-col items-center flex" style="transform: translateX(50%)">
                  <div class="flex items-end justify-center gap-1 mb-1 w-48 flex-wrap transition-all min-h-[120px]">
                    <div v-for="i in constRight" :key="'cr'+i" class="w-8 h-8 bg-slate-200 border border-slate-400 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm animate-fadeIn">1</div>
                  </div>
                  <div class="w-32 h-2 bg-amber-600 rounded-full"></div>
                </div>
              </div>
              <!-- Scale stand -->
              <div class="absolute left-1/2 bottom-20 -translate-x-1/2 w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[80px] border-b-amber-700 z-0"></div>
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
