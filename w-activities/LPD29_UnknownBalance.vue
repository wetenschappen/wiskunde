<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise, PhLightbulb, PhQuestion } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algebra: Letters als Onbekenden' },
  instruction: { type: String, default: 'Pas het aantal blokjes in doos x aan tot de weegschaal in evenwicht is.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhScales }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const attemptCount = ref(0)
const hintLevel = ref(0)
const showHints = ref(false)
const feedback = ref({ type: 'info', text: 'Pas x aan tot evenwicht.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const showWhy = ref(false)
const showReflection = ref(false)
const reflectionAnswers = ref(['', '', ''])
const showLPD = ref(false)
const lpdAnswer = ref('')
const lpdDone = ref(false)

const predictionMade = ref(false)
const predictionChoice = ref(null)
const predictionOptions = computed(() => [
  { id: 'small', text: 'x zal een klein getal zijn (1-3)' },
  { id: 'medium', text: 'x zal een middelgroot getal zijn (4-7)' },
  { id: 'large', text: 'x zal een groot getal zijn (8-15)' }
])
const reflectionQuestions = computed(() => [
  'Waarom kun je x oplossen door dezelfde getallen aan beide kanten weg te halen?',
  'Waarom noemen we x een "onbekende" en niet gewoon een getal?',
  'Waarom blijft de vergelijking kloppen als je aan beide kanten hetzelfde doet?'
])

const levels = ref([])

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

function generateLevel() {
  const nl = []
  let x1 = randomInt(2, 5); let l1 = randomInt(1, 4)
  nl.push({ leftLoose: l1, rightLoose: x1 + l1, xValue: x1 })
  let x2 = randomInt(3, 7); let l2 = randomInt(2, 6)
  nl.push({ leftLoose: l2, rightLoose: x2 + l2, xValue: x2 })
  let x3 = randomInt(4, 9); let l3 = randomInt(3, 7)
  nl.push({ leftLoose: l3, rightLoose: x3 + l3, xValue: x3 })
  return nl
}

const equation = computed(() => levels.value[currentInternalLevel.value] || { leftLoose: 3, rightLoose: 8, xValue: 5 })
const xValue = ref(1)
const totalLeft = computed(() => xValue.value + equation.value.leftLoose)
const totalRight = computed(() => equation.value.rightLoose)
const tiltValue = computed(() => { if (totalLeft.value > totalRight.value) return -1; if (totalLeft.value < totalRight.value) return 1; return 0 })

const hintTexts = computed(() => {
  const eq = equation.value
  return [
    `Tip 1: De weegschaal moet in evenwicht zijn. x + ${eq.leftLoose} = ${eq.rightLoose}.`,
    `Tip 2: Wat moet x zijn zodat x + ${eq.leftLoose} = ${eq.rightLoose}? Trek ${eq.leftLoose} af van ${eq.rightLoose}.`,
    `Tip 3: x = ${eq.rightLoose} - ${eq.leftLoose} = ... (vul in). Dan is x + ${eq.leftLoose} = ${eq.rightLoose}.`
  ]
})

function cycleHint() {
  if (!showHints) { showHints.value = true; hintLevel.value = 0; return }
  if (hintLevel.value < 2) hintLevel.value++
  else { showHints.value = false; hintLevel.value = 0 }
}

function confirmPrediction() { if (predictionChoice.value) predictionMade.value = true }
function resetPrediction() { predictionMade.value = false; predictionChoice.value = null }

function increaseX() { if (!isCorrect.value && xValue.value < 15) { xValue.value++; attemptCount.value++; onValueChange() } }
function decreaseX() { if (!isCorrect.value && xValue.value > 0) { xValue.value--; attemptCount.value++; onValueChange() } }

function onValueChange() {
  const tv = tiltValue.value
  if (tv === 0) {
    isCorrect.value = true; showWhy.value = true
    const eq = equation.value
    feedback.value = { type: 'success', text: `Evenwicht! x = ${eq.xValue}. x + ${eq.leftLoose} = ${eq.rightLoose}.` }
  } else {
    isCorrect.value = false
    if (attemptCount.value % 3 === 0) {
      const eq = equation.value
      const hint = attemptCount.value >= 6 ? `Trek ${eq.leftLoose} af van ${eq.rightLoose}.` : `Zoek x zodat x + ${eq.leftLoose} = ${eq.rightLoose}.`
      feedback.value = { type: 'error', text: 'Nog niet in evenwicht. ' + hint }
    }
  }
}

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false
  attemptCount.value = 0; hintLevel.value = 0; showHints.value = false; showWhy.value = false
  showReflection.value = false; showLPD.value = false; lpdDone.value = false
  resetPrediction()
  feedback.value = { type: 'info', text: 'Pas x aan tot evenwicht.' }
  xValue.value = 1
}

const allReflectionsDone = computed(() => reflectionAnswers.value.every(a => a.length >= 10))

function handleNext() {
  if (isCorrect.value && !showReflection.value) { showReflection.value = true }
  else if (showReflection.value && allReflectionsDone.value) { submitReflection() }
}

function submitReflection() {
  if (allReflectionsDone.value) {
    showReflection.value = false; reflectionAnswers.value = ['', '', '']
    if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
    else { showLPD.value = true }
  }
}

function submitLPD() { if (lpdAnswer.value.length >= 20) { lpdDone.value = true; emit('complete') } }

const whyText = computed(() => [
  'Een vergelijking is als een weegschaal in evenwicht: wat links staat is evenveel waard als wat rechts staat.',
  'x is een onbekend getal. Door te zoeken tot de weegschaal in evenwicht is, ontdek je de waarde van x.'
])

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState()
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') })
    nextTick(() => mainArea.value?.focus()); nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else { shouldPulse.value = false }
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
        </div>
      </div>
      <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-4 prose prose-sm text-slate-600" />

          <details class="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
            <summary class="font-bold text-amber-800 cursor-pointer text-sm">Voorbeeld — Stap voor Stap</summary>
            <div class="mt-3 text-sm space-y-2">
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Vraag: x + 3 = 8. Wat is x?</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Stel x = 3: 3 + 3 = 6, niet 8. Te weinig.</p>
              <p class="flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-emerald-500 shrink-0" /> Stel x = 5: 5 + 3 = 8. Evenwicht! x = 5.</p>
            </div>
          </details>

          <div v-if="!predictionMade" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-4">
            <h4 class="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2"><PhQuestion weight="bold" class="w-4 h-4" /> Voorspel!</h4>
            <p class="text-xs text-indigo-600 mb-3">Hoe groot denk je dat x is?</p>
            <div class="space-y-2">
              <label v-for="opt in predictionOptions" :key="opt.id" class="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer text-xs"
                :class="predictionChoice === opt.id ? 'border-indigo-500 bg-indigo-100' : 'border-slate-200'">
                <input type="radio" :value="opt.id" v-model="predictionChoice" class="accent-indigo-600" /> {{ opt.text }}
              </label>
            </div>
            <button @click="confirmPrediction" :disabled="!predictionChoice" class="mt-3 w-full py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm disabled:opacity-50">Bevestig Voorspelling</button>
          </div>

          <div v-if="predictionMade" class="space-y-4">
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl text-center">
              <p class="font-bold text-amber-800 text-sm">Vergelijking:</p>
              <div class="font-mono font-black text-2xl text-slate-800 flex items-center justify-center gap-4 mt-2">
                <span class="bg-white px-4 py-1 rounded-lg border border-slate-200">x + {{ equation.leftLoose }}</span>
                <span class="text-amber-500">=</span>
                <span class="bg-white px-4 py-1 rounded-lg border border-slate-200">{{ equation.rightLoose }}</span>
              </div>
              <div class="mt-4 flex items-center justify-center gap-4">
                <button @click="decreaseX" :disabled="isCorrect || xValue <= 0"
                  class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl hover:bg-slate-50 disabled:opacity-30">-</button>
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase">Doos x</span>
                  <span class="text-3xl font-black text-amber-500 w-12 tabular-nums">{{ xValue }}</span>
                </div>
                <button @click="increaseX" :disabled="isCorrect || xValue >= 15"
                  class="w-10 h-10 bg-white border-2 border-slate-300 rounded-full font-black text-xl hover:bg-slate-50 disabled:opacity-30">+</button>
              </div>
            </div>
            <div v-if="showWhy" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200 animate-fadeIn">
              <h4 class="font-bold text-indigo-800 text-sm mb-2">Waarom werkt dit?</h4>
              <p v-for="(l, i) in whyText" :key="i" class="text-xs text-indigo-700 mb-1">{{ l }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm rounded-lg animate-fadeIn"
            :class="{'bg-emerald-100': feedback.type === 'success', 'bg-red-100': feedback.type === 'error', 'bg-blue-100': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
            <span>{{ feedback.text }}</span>
          </div>

          <div v-if="!predictionMade">
            <button @click="emit('close')" class="w-full py-3 font-bold text-slate-500 bg-white border border-slate-200 rounded-lg">Sluiten</button>
          </div>
          <div v-else-if="!showReflection && !showLPD" class="flex items-center gap-3">
            <button @click="resetActivityState" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg shrink-0"><PhArrowClockwise /></button>
            <button @click="cycleHint" class="p-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg shrink-0"><PhLightbulb weight="fill" /></button>
            <div v-if="showHints" class="bg-amber-100 p-2 rounded-lg text-xs text-amber-800 animate-fadeIn flex-1">{{ hintTexts[hintLevel] }}</div>
          </div>

          <div v-if="showReflection" class="space-y-3">
            <h4 class="font-bold text-indigo-800 text-sm">Reflectie</h4>
            <div v-for="(q, i) in reflectionQuestions" :key="i" class="space-y-1">
              <label class="text-xs font-medium text-slate-700">{{ q }}</label>
              <textarea v-model="reflectionAnswers[i]" rows="2" class="w-full text-sm p-2 border border-indigo-200 rounded-lg bg-white resize-none" placeholder="Min 10 tekens..."></textarea>
            </div>
            <button @click="submitReflection" :disabled="!allReflectionsDone" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">
              {{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Naar Bewijs van LPD' }}
            </button>
          </div>

          <div v-if="showLPD && !lpdDone" class="space-y-3">
            <h4 class="font-bold text-amber-800 text-sm flex items-center gap-2"><PhCheckCircle weight="bold" class="w-4 h-4 text-amber-600" /> Bewijs van LPD 29</h4>
            <p class="text-xs text-amber-700">LPD 29: Vergelijkingen van de vorm x + a = b oplossen via evenwicht.</p>
            <textarea v-model="lpdAnswer" rows="3" class="w-full text-sm p-2 border border-amber-200 rounded-lg bg-white resize-none" placeholder="Schrijf een zin die bewijst dat je dit leerplandoel bereikt hebt..."></textarea>
            <button @click="submitLPD" :disabled="lpdAnswer.length < 20" class="w-full py-2 bg-amber-600 text-white font-bold rounded-lg disabled:opacity-50 text-sm">Bevestig LPD 29</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl min-h-[500px] flex items-center justify-center relative">
            <div class="relative w-full max-w-lg transition-transform duration-700 ease-in-out origin-bottom" :style="{ transform: `rotate(${tiltValue * 8}deg)` }">
              <div class="w-full h-4 bg-slate-700 rounded-full shadow-md relative z-10 flex justify-between px-8">
                <div class="absolute left-8 bottom-4 w-40 flex flex-col items-center transition-transform duration-700" :style="{ transform: `rotate(${-tiltValue * 8}deg)` }">
                  <div class="flex items-end justify-center gap-2 mb-2">
                    <div class="w-20 h-20 bg-amber-100 border-4 border-amber-400 rounded-xl flex items-center justify-center shadow-md transition-all"
                      :class="isCorrect ? 'border-dashed border-slate-200 bg-transparent' : ''">
                      <div v-if="!isCorrect" class="flex flex-col items-center">
                        <span class="font-black text-2xl text-amber-500 font-mono">x</span>
                      </div>
                      <div v-else class="flex flex-wrap gap-1 p-1 justify-center">
                        <div v-for="i in xValue" :key="'xb'+i" class="w-5 h-5 bg-amber-400 border border-amber-500 rounded-lg animate-fadeIn"></div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1 justify-end h-full mb-1">
                      <div v-for="i in equation.leftLoose" :key="'ll'+i" class="w-6 h-6 bg-slate-200 border-2 border-slate-400 rounded-lg flex items-center justify-center font-bold text-slate-500 text-[10px]">1</div>
                    </div>
                  </div>
                  <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                </div>
                <div class="absolute right-8 bottom-4 w-40 flex flex-col items-center transition-transform duration-700" :style="{ transform: `rotate(${-tiltValue * 8}deg)` }">
                  <div class="flex items-end justify-center gap-1 mb-2 flex-wrap">
                    <div v-for="i in equation.rightLoose" :key="'rl'+i" class="w-8 h-8 bg-slate-200 border-2 border-slate-400 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xs">1</div>
                  </div>
                  <div class="w-full h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                </div>
              </div>
              <div class="absolute left-1/2 bottom-[-80px] -translate-x-1/2 w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[80px] border-b-slate-400 z-0"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
