<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSteps, PhArrowClockwise, PhCaretDoubleRight, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'KGV: De Springende Kikkers' },
  instruction: {
    type: String,
    default: 'Het <strong>Kleinste Gemeenschappelijk Veelvoud (KGV)</strong> is het eerste getal waar twee sprongen elkaar overlappen.<br/><br/><strong>Opdracht:</strong> Voorspel eerst op welk getal de kikkers elkaar ontmoeten. Laat ze dan springen om te controleren.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhSteps }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Voorspel eerst waar de kikkers elkaar ontmoeten.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const showPrediction = ref(true)
const predictedKGV = ref(null)
const showWorkedExample = ref(true)
const hintCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const reflectionPassed = ref(false)

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
function lcm(a, b) { return (a * b) / gcd(a, b) }

function generateLevel(levelIndex) {
  let jump1, jump2, maxPos

  if (levelIndex === 0) {
    // Level 1: basic KGV (small numbers, easy common multiples)
    const pairs = [[4, 6], [3, 6], [4, 8], [2, 7]]
    const p = pick(pairs)
    jump1 = p[0]
    jump2 = p[1]
  } else if (levelIndex === 1) {
    // Level 2: KGV = product (coprime or small shared factors)
    const pairs = [[3, 5], [4, 7], [6, 8], [3, 8], [6, 9]]
    const p = pick(pairs)
    jump1 = p[0]
    jump2 = p[1]
  } else {
    // Level 3: KGV < product (larger overlap)
    const pairs = [[2, 7], [5, 6], [3, 7], [4, 9], [5, 8], [6, 7]]
    const p = pick(pairs)
    jump1 = p[0]
    jump2 = p[1]
  }

  const kgv = lcm(jump1, jump2)
  const isProduct = (jump1 * jump2) === kgv
  maxPos = kgv * 2

  return {
    goalText: `Opdracht ${levelIndex + 1}: Kikkers ${jump1} en ${jump2}`,
    jump1, jump2, maxPos, targetAns: kgv, isProduct
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const frog1 = ref({ pos: 0, history: [0] })
const frog2 = ref({ pos: 0, history: [0] })

const meetPoint = computed(() => {
  const set1 = new Set(frog1.value.history.filter(x => x > 0))
  const common = frog2.value.history.filter(x => x > 0 && set1.has(x))
  if (common.length > 0) return Math.min(...common)
  return null
})

const hintLevels = computed(() => {
  const d = currentLevelData.value
  if (!d) return ['', '', '']

  const h1 = `Maak de tafels van ${d.jump1} en ${d.jump2}. Het KGV is het eerste getal dat in BEIDE tafels voorkomt (groter dan 0). Welk getal is dat?`

  const h2 = `Voorbeeld: kikkers springen 3 en 4. Tafel van 3: 3, 6, 9, 12, 15... Tafel van 4: 4, 8, 12, 16... Eerste gemeenschappelijk getal = 12. KGV(3,4) = 12. Pas dit toe op ${d.jump1} en ${d.jump2}: welke getallen komen in beide tafels voor?`

  const h3 = `Tafel van ${d.jump1}: ${d.jump1}, ${d.jump1*2}, ${d.jump1*3}, ${d.jump1*4}, ${d.jump1*5}... Tafel van ${d.jump2}: ${d.jump2}, ${d.jump2*2}, ${d.jump2*3}, ${d.jump2*4}, ${d.jump2*5}... Het eerste getal uit de tafel van ${d.jump1} dat ook in de tafel van ${d.jump2} staat (behalve 0): __`

  return [h1, h2, h3]
})

function getHintText() {
  const idx = Math.min(hintCount.value - 1, hintLevels.value.length - 1)
  if (idx >= 0) return hintLevels.value[idx]
  return ''
}

function jump(frogRef, jumpSize) {
  if (frogRef.value.pos + jumpSize <= currentLevelData.value.maxPos) {
    frogRef.value.pos += jumpSize
    if (!frogRef.value.history.includes(frogRef.value.pos)) {
      frogRef.value.history.push(frogRef.value.pos)
    }
  }
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
  feedback.value = { type: 'info', text: 'Voorspel eerst waar de kikkers elkaar ontmoeten.' }
  attemptCount.value = 0
  hintCount.value = 0
  frog1.value = { pos: 0, history: [0] }
  frog2.value = { pos: 0, history: [0] }
  predictedKGV.value = null
  showPrediction.value = true
  showReflection.value = false
  reflectionAnswer.value = ''
  reflectionPassed.value = false
  showWorkedExample.value = currentInternalLevel.value === 0
}

function submitPrediction() {
  const d = currentLevelData.value
  if (predictedKGV.value === null || predictedKGV.value === '' || predictedKGV.value === undefined) {
    feedback.value = { type: 'error', text: 'Vul een getal in voor je voorspelling.' }
    return
  }

  if (predictedKGV.value === d.targetAns) {
    feedback.value = {
      type: 'success',
      text: `Goed zo! KGV(${d.jump1}, ${d.jump2}) = ${d.targetAns}. Laat nu de kikkers springen om te bewijzen dat ze elkaar op ${d.targetAns} ontmoeten!`
    }
    showPrediction.value = false
    hintCount.value = 0
  } else {
    attemptCount.value++

    // Error analysis: KGV vs GGD confusion
    if (predictedKGV.value > 0 && d.jump1 % predictedKGV.value === 0 && d.jump2 % predictedKGV.value === 0) {
      feedback.value = {
        type: 'error',
        text: `Let op: ${predictedKGV.value} is een deler van beide, dus dat is een GGD (Grootste Gemeenschappelijke Deler). Maar we zoeken het KGV (Kleinste Gemeenschappelijk Veelvoud). GGD en KGV worden vaak verward! Denk aan veelvouden (tafels van beide getallen), niet aan delers.`
      }
    } else if (predictedKGV.value === d.jump1 * d.jump2 && d.targetAns !== d.jump1 * d.jump2) {
      feedback.value = {
        type: 'error',
        text: `KGV is niet altijd het product van de twee getallen. Kijk naar de tafels van ${d.jump1} en ${d.jump2} — het eerste gemeenschappelijke getal is kleiner dan ${d.jump1 * d.jump2}.`
      }
    } else if (predictedKGV.value >= d.targetAns && predictedKGV.value % d.jump1 === 0 && predictedKGV.value % d.jump2 === 0) {
      feedback.value = {
        type: 'error',
        text: `${predictedKGV.value} is een veelvoud van beide, maar niet het KLEINSTE. Er is een kleiner getal waar ze elkaar ontmoeten.`
      }
    } else if (predictedKGV.value > 0 && predictedKGV.value < d.targetAns) {
      feedback.value = {
        type: 'error',
        text: `${predictedKGV.value} is te klein. Dit getal is niet door beide tegelijk deelbaar. Laat de kikkers springen om te zien waar ze stoppen.`
      }
    } else {
      feedback.value = {
        type: 'error',
        text: `${predictedKGV.value} klopt niet. Denk aan de tafels van ${d.jump1} en ${d.jump2}. Het eerste gemeenschappelijke getal is het KGV.`
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

  if (meetPoint.value === d.targetAns) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    reflectionPassed.value = false
    feedback.value = {
      type: 'success',
      text: `Super! De kikkers ontmoeten elkaar op steen ${d.targetAns}. KGV(${d.jump1}, ${d.jump2}) = ${d.targetAns}.`
    }
  } else {
    attemptCount.value++
    if (meetPoint.value && meetPoint.value !== d.targetAns) {
      feedback.value = {
        type: 'error',
        text: `De kikkers ontmoeten elkaar nu op ${meetPoint.value}, maar dat is niet de KGV. Spring verder!`
      }
    } else {
      feedback.value = {
        type: 'error',
        text: 'Laat de kikkers verder springen tot ze elkaar ontmoeten.'
      }
    }
  }
}

function checkReflection() {
  const d = currentLevelData.value
  const ans = reflectionAnswer.value.toLowerCase().trim()

  if ((ans.includes('kleinste') || ans.includes('veelvoud') || ans.includes(String(d.targetAns))) && ans.length > 5) {
    reflectionPassed.value = true
    showReflection.value = false
  } else {
    feedback.value = {
      type: 'info',
      text: `Denk na: waarom ontmoeten de kikkers elkaar op ${d.targetAns} en niet op een kleiner getal? Wat betekent 'kleinste' in KGV?`
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld:</p>
            <p class="text-sm text-slate-700 mb-2">Twee kikkers springen 2 en 3 stenen per sprong. Waar ontmoeten ze elkaar voor het eerst?</p>
            <div class="text-xs text-slate-600 space-y-1 mb-2">
              <p><strong>Stap 1:</strong> Schrijf de veelvouden van 2: 2, 4, 6, 8, 10...</p>
              <p><strong>Stap 2:</strong> Schrijf de veelvouden van 3: 3, 6, 9, 12, 15...</p>
              <p><strong>Stap 3:</strong> Welk getal staat in BEIDE rijen (behalve 0)? Het getal 6.</p>
              <p><strong>Stap 4:</strong> Het eerste gemeenschappelijke getal = 6. Dit is het KGV.</p>
            </div>
            <p class="font-mono text-base font-bold text-slate-800">KGV(2, 3) = 6</p>
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
          </div>

          <!-- Prediction Gate -->
          <div
            v-if="showPrediction && !showWorkedExample"
            class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4"
          >
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel de ontmoetingsplek</p>
            <p class="text-sm text-slate-600 mb-3">
              Op welk getal ontmoeten de kikkers elkaar voor het eerst?
            </p>
            <div class="flex items-center gap-2 justify-center">
              <span class="font-mono font-bold text-slate-700">
                KGV({{ currentLevelData?.jump1 }}, {{ currentLevelData?.jump2 }}) =
              </span>
              <input
                type="number" v-model.number="predictedKGV"
                @keyup.enter="submitPrediction"
                class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white outline-none focus:border-amber-500"
                placeholder="?"
              />
              <button
                @click="submitPrediction"
                class="py-2 px-4 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]"
              >
                Voorspel
              </button>
            </div>
            <p
              v-if="predictedKGV === currentLevelData?.targetAns && predictedKGV"
              class="text-xs text-amber-700 mt-2 font-medium"
            >
              Juist! Laat nu de kikkers springen om te bewijzen.
            </p>
          </div>

          <!-- Why explanation -->
          <div
            v-if="isCorrect && !showReflection"
            class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn"
          >
            <p class="font-bold text-amber-800 text-sm mb-1">Waarom is het KGV het kleinste gemeenschappelijke veelvoud?</p>
            <p class="text-xs text-amber-700 leading-relaxed">
              Het KGV is het kleinste getal dat door beide getallen deelbaar is. In de kikker-voorstelling is dat de eerste steen waar beide kikkers tegelijk landen.
              Bij breuken gebruik je het KGV om noemers gelijknamig te maken: je zoekt de kleinste noemer die door beide noemers deelbaar is.
              Zonder het KGV zou je met veel grotere getallen moeten werken, bijvoorbeeld bij 1/3 + 1/6 is KGV=6, niet 18.
            </p>
          </div>

          <!-- Reflection -->
          <div
            v-if="showReflection"
            class="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 animate-fadeIn"
          >
            <p class="font-bold text-amber-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-amber-700 mb-2" v-if="currentLevelData?.isProduct">
              Waarom is KGV({{ currentLevelData?.jump1 }}, {{ currentLevelData?.jump2 }}) =
              {{ currentLevelData?.jump1 * currentLevelData?.jump2 }}? Wat zegt dit over de
              twee getallen?
            </p>
            <p class="text-xs text-amber-700 mb-2" v-else>
              Waarom is KGV({{ currentLevelData?.jump1 }}, {{ currentLevelData?.jump2 }}) =
              {{ currentLevelData?.targetAns }} en niet
              {{ currentLevelData?.jump1 * currentLevelData?.jump2 }}?
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

      <!-- Visual area -->
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

          <div class="w-full max-w-4xl">

            <!-- Controls -->
            <div class="flex justify-center gap-6 mb-12">
              <button
                @click="jump(frog1, currentLevelData?.jump1)"
                :disabled="isCorrect || !currentLevelData || frog1.pos + currentLevelData.jump1 > currentLevelData.maxPos"
                class="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:bg-amber-300 text-white font-black rounded-xl shadow-md transition-all active:scale-95"
              >
                Kikker A (+{{ currentLevelData?.jump1 }}) <PhCaretDoubleRight weight="bold" />
              </button>
              <button
                @click="jump(frog2, currentLevelData?.jump2)"
                :disabled="isCorrect || !currentLevelData || frog2.pos + currentLevelData.jump2 > currentLevelData.maxPos"
                class="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 disabled:bg-slate-400 text-white font-black rounded-xl shadow-md transition-all active:scale-95"
              >
                Kikker B (+{{ currentLevelData?.jump2 }}) <PhCaretDoubleRight weight="bold" />
              </button>
            </div>

            <!-- Number Line -->
            <div class="relative w-full h-48 flex items-center pt-8">
              <div class="absolute inset-x-0 h-16 bg-amber-100/60 rounded-full blur-md"></div>

              <div class="flex w-full justify-between items-center relative z-10">
                <div v-for="i in ((currentLevelData?.maxPos || 0) + 1)" :key="i" class="flex flex-col items-center justify-center w-8 relative">
                  <!-- History trails -->
                  <div v-if="frog1.history.includes(i-1)" class="absolute -top-16 w-3 h-3 bg-amber-400 rounded-full shadow-sm"></div>
                  <div v-if="frog2.history.includes(i-1)" class="absolute -bottom-12 w-3 h-3 bg-slate-600 rounded-full shadow-sm"></div>

                  <!-- Meet point highlight -->
                  <div v-if="meetPoint === i-1" class="absolute -inset-2 bg-amber-300/40 rounded-full z-0"></div>

                  <!-- The Stone -->
                  <div
                    class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-white shadow-sm z-10"
                    :class="meetPoint === i-1 ? 'border-amber-500 text-amber-700 bg-amber-50' : 'border-slate-300 text-slate-500'"
                  >
                    {{ i - 1 }}
                  </div>
                </div>
              </div>

              <!-- The Frogs -->
              <div class="absolute top-0 bottom-0 left-0 right-0 pointer-events-none transition-all duration-500 ease-out z-20">
                <div
                  class="absolute transition-all duration-500 ease-out flex items-center justify-center w-8 h-8 -top-8"
                  :style="{ left: `calc(${(frog1.pos / (currentLevelData?.maxPos || 1)) * 100}% - 0px)` }"
                >
                  <div class="w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-md animate-bounce"></div>
                </div>
                <div
                  class="absolute transition-all duration-500 ease-out flex items-center justify-center w-8 h-8 bottom-0"
                  :style="{ left: `calc(${(frog2.pos / (currentLevelData?.maxPos || 1)) * 100}% - 0px)` }"
                >
                  <div class="w-6 h-6 bg-slate-800 rounded-full border-2 border-white shadow-md animate-bounce" style="animation-delay: 0.1s"></div>
                </div>
              </div>
            </div>

            <!-- Meet point display -->
            <div v-if="meetPoint" class="mt-8 text-center">
              <div class="inline-block px-6 py-3 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                <p class="text-sm text-amber-800 font-medium">
                  Ontmoetingspunt: steen <strong class="text-lg">{{ meetPoint }}</strong>
                </p>
                <p class="text-xs text-amber-600 mt-1">Klik op "Controleer" om je antwoord te bevestigen.</p>
              </div>
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
</style>
