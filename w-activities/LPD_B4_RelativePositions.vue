<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhList,
  PhArrowClockwise,
  PhLightbulb,
  PhQuestion
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Onderlinge Ligging van Rechten'
  },
  instruction: {
    type: String,
    default: 'Vergelijk de vergelijkingen van de twee rechten. Zijn ze evenwijdig (niet samenvallend), snijdend of samenvallend?'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhList }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  let scenarioCount, ranges
  if (lvl === 0) {
    scenarioCount = 2
    ranges = { a: [-3, 3], b: [-3, 3], c: [-5, 5] }
  } else if (lvl === 1) {
    scenarioCount = 4
    ranges = { a: [-5, 5], b: [-5, 5], c: [-8, 8] }
  } else {
    scenarioCount = 6
    ranges = { a: [-7, 7], b: [-7, 7], c: [-12, 12] }
  }

  const scenarios = []
  const usedKeys = new Set()

  function addScenario(type) {
    let a1, b1, c1, a2, b2, c2, correct, l1, l2
    const attemptLimit = 30
    for (let i = 0; i < attemptLimit; i++) {
      if (type === 'evenwijdig') {
        const factor = randInt(2, 4) * (Math.random() > 0.5 ? 1 : -1)
        a1 = randInt(ranges.a[0], ranges.a[1])
        b1 = randInt(ranges.b[0], ranges.b[1])
        if (a1 === 0 && b1 === 0) continue
        c1 = randInt(ranges.c[0], ranges.c[1])
        a2 = a1 * factor
        b2 = b1 * factor
        c2 = randInt(ranges.c[0], ranges.c[1])
        while (c2 === c1 * factor) { c2 = randInt(ranges.c[0], ranges.c[1]) }
        correct = 'evenwijdig'
      } else if (type === 'samenvallend') {
        const factor = randInt(2, 3) * (Math.random() > 0.5 ? 1 : -1)
        a1 = randInt(ranges.a[0], ranges.a[1])
        b1 = randInt(ranges.b[0], ranges.b[1])
        if (a1 === 0 && b1 === 0) continue
        c1 = randInt(ranges.c[0], ranges.c[1])
        a2 = a1 * factor
        b2 = b1 * factor
        c2 = c1 * factor
        correct = 'samenvallend'
      } else {
        a1 = randInt(ranges.a[0], ranges.a[1])
        b1 = randInt(ranges.b[0], ranges.b[1])
        if (a1 === 0 && b1 === 0) continue
        c1 = randInt(ranges.c[0], ranges.c[1])
        a2 = randInt(ranges.a[0], ranges.a[1])
        b2 = randInt(ranges.b[0], ranges.b[1])
        if (a2 === 0 && b2 === 0) continue
        if (a1 * b2 === a2 * b1) continue
        c2 = randInt(ranges.c[0], ranges.c[1])
        correct = 'snijdend'
      }

      l1 = formatLine(a1, b1, c1)
      l2 = formatLine(a2, b2, c2)
      const key = l1 + '|' + l2
      if (!usedKeys.has(key)) {
        usedKeys.add(key)
        scenarios.push({ id: scenarios.length + 1, l1, l2, correct, a1, b1, a2, b2 })
        return
      }
    }
    // Fallback
    const fallbacks = {
      'evenwijdig': { l1: '2x - 3y + 6 = 0', l2: '4x - 6y - 12 = 0', correct: 'evenwijdig', a1: 2, b1: -3, a2: 4, b2: -6 },
      'snijdend': { l1: '3x + y - 1 = 0', l2: '-x + 2y + 4 = 0', correct: 'snijdend', a1: 3, b1: 1, a2: -1, b2: 2 },
      'samenvallend': { l1: '2x - 3y + 6 = 0', l2: '4x - 6y + 12 = 0', correct: 'samenvallend', a1: 2, b1: -3, a2: 4, b2: -6 }
    }
    const f = fallbacks[type]
    if (f) scenarios.push({ ...f, id: scenarios.length + 1 })
  }

  const types = ['snijdend', 'evenwijdig', 'samenvallend']
  for (const t of types) {
    if (scenarios.length >= scenarioCount) break
    addScenario(t)
  }
  while (scenarios.length < scenarioCount) {
    addScenario(types[randInt(0, 2)])
  }

  return {
    name: lvl === 0 ? 'Basis' : lvl === 1 ? 'Toepassing' : 'Uitdaging',
    scenarios
  }
}

function formatLine(a, b, c) {
  const parts = []
  if (a !== 0) {
    if (a === 1) parts.push('x')
    else if (a === -1) parts.push('-x')
    else parts.push(a + 'x')
  }
  if (b !== 0) {
    if (b === 1) parts.push((parts.length ? '+' : '') + 'y')
    else if (b === -1) parts.push((parts.length ? '-' : '-') + 'y')
    else parts.push((b > 0 && parts.length ? '+' : '') + b + 'y')
  }
  if (c !== 0) {
    parts.push((c > 0 && parts.length ? '+' : '') + c)
  }
  if (parts.length === 0) return '0 = 0'
  let expr = parts.join(' ')
  if (expr.startsWith('+ ')) expr = expr.slice(2)
  return expr + ' = 0'
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

const currentScenarioIndex = ref(0)
const currentScenario = computed(() => currentLevel.value.scenarios[currentScenarioIndex.value])
const userChoice = ref(null)

const options = ['snijdend', 'evenwijdig', 'samenvallend']

// --- 8-element additions ---
const showPrediction = ref(true)
const predictionDone = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  showPrediction.value = false
  predictionDone.value = true
  feedback.value = { type: 'info', text: 'Kies telkens de juiste onderlinge ligging.' }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Kijk naar de richtingscoëfficiënten. Zelfde rico = evenwijdig of samenvallend. Dezelfde lijn = samenvallend. Anders = snijdend.'
  if (c === 2) return 'Hint: Schrijf beide vergelijkingen in de vorm y = ... . Vergelijk de richtingscoëfficiënt (rico) en het snijpunt met de y-as.'
  return 'Hint: Bij evenwijdig zijn de coëfficiënten (u, v) evenredig maar de constante w niet. Bij samenvallend is alles evenredig. Anders snijdend.'
}

function getErrorAnalysis(chosen) {
  const sc = currentScenario.value
  // Check for confusion between evenwijdig and samenvallend
  if (chosen === 'snijdend' && (sc.correct === 'evenwijdig' || sc.correct === 'samenvallend')) {
    const ratio1 = sc.a1 !== 0 && sc.a2 !== 0 ? sc.a2 / sc.a1 : null
    const ratio2 = sc.b1 !== 0 && sc.b2 !== 0 ? sc.b2 / sc.b1 : null
    if (ratio1 !== null && ratio2 !== null && Math.abs(ratio1 - ratio2) < 0.01) {
      return 'Let op: de coëfficiënten zijn evenredig, dus de rechten hebben dezelfde richting. Ze zijn niet snijdend, maar evenwijdig of samenvallend. Controleer of ook de constante term evenredig is.'
    }
  }
  // Confusing evenwijdig vs samenvallend
  if (chosen === 'evenwijdig' && sc.correct === 'samenvallend') {
    return 'Deze rechten zijn niet alleen evenwijdig, ze vallen ook samen! De constanten zijn ook evenredig. Als (a1, b1, c1) een veelvoud is van (a2, b2, c2), vallen ze samen.'
  }
  if (chosen === 'samenvallend' && sc.correct === 'evenwijdig') {
    return 'Deze rechten hebben dezelfde richting (evenredige a en b), maar de constante c is niet evenredig. Ze zijn dus evenwijdig maar niet samenvallend.'
  }
  // Snijdend confused
  if (chosen !== 'snijdend' && sc.correct === 'snijdend') {
    return 'Deze rechten hebben verschillende richtingen (a en b zijn niet evenredig), dus ze snijden elkaar. Ze zijn niet evenwijdig.'
  }
  return ''
}

function selectOption(opt) {
  if (isCorrect.value) return
  userChoice.value = opt

  if (opt === currentScenario.value.correct) {
    isCorrect.value = true
    isChecked.value = true
    feedback.value = {
      type: 'success',
      text: `Helemaal juist! ${opt === 'evenwijdig' ? 'De richtingen zijn gelijk maar de constante verschilt.' : opt === 'samenvallend' ? 'Alles is evenredig — het zijn dezelfde rechte.' : 'Verschillende richtingen — ze snijden elkaar.'}<br><br><strong>Waarom?</strong> De richting van een rechte wordt bepaald door de verhouding a:b. Als a₁/a₂ = b₁/b₂, dan zijn de rechten evenwijdig of samenvallend. Of ze samenvallen, hangt af van de constante c: als ook c₁/c₂ dezelfde factor heeft, vallen ze samen. Zo niet, dan zijn ze zuiver evenwijdig. Deze methode werkt omdat de normaalvector (a, b) de richting van de rechte bepaalt, en de constante c bepaalt waar de rechte ligt.`
    }
    showReflection.value = true
  } else {
    attemptCount.value++
    isCorrect.value = false
    isChecked.value = true
    const errorMsg = getErrorAnalysis(opt)
    feedback.value = {
      type: 'error',
      text: 'Niet helemaal... ' + (errorMsg || getHint())
    }
  }
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  userChoice.value = null
  showPrediction.value = true
  predictionDone.value = false
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  currentScenarioIndex.value = 0
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
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
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <div class="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <div v-for="(level, i) in levels" :key="i"
                 class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                 :class="i === currentInternalLevel ? 'bg-amber-500 ring-2 ring-amber-200 scale-125' : i < currentInternalLevel ? 'bg-amber-300' : 'bg-slate-300'">
            </div>
            <span class="text-xs font-bold text-amber-700 ml-1.5 uppercase">{{ currentLevel.name }}</span>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <p class="mb-2 text-xs font-semibold text-amber-600">Level {{ currentInternalLevel + 1 }} &mdash; {{ currentLevel.name }}</p>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Twee rechten <strong>2x + 3y - 6 = 0</strong> en <strong>4x + 6y - 12 = 0</strong>.<br>
                Wat is hun onderlinge ligging?
              </p>
              <div class="text-xs text-amber-700 mt-1 p-2 bg-white rounded border border-amber-200">
                <p>2/4 = 3/6 = 6/12 = 1/2 (alles evenredig) &rarr; samenvallend!</p>
              </div>
              <button @click="submitPrediction"
                      class="mt-2 px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen, start oefenen
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="predictionDone && !showPrediction && !showReflection && !isCorrect" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                Geef: 3x - 2y + 5 = 0 en 6x - 4y - 3 = 0<br>
                Vergelijk a: 3/6 = 1/2, b: -2/-4 = 1/2 &rarr; evenredig<br>
                Vergelijk c: 5/-3 = -5/3 &rarr; niet dezelfde factor<br>
                <span class="font-bold">Evenredige a en b, maar niet evenredige c = evenwijdig</span>
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Hoe bepaal je snel of twee rechten evenwijdig of samenvallend zijn (zonder te tekenen)?<br>
                <span class="text-xs text-slate-500">Welke coefficiënten moet je vergelijken?</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Ik kijk of a en b evenredig zijn..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div class="p-6 mt-4 border-t border-slate-200 bg-slate-50 rounded-xl">
              <div class="bg-white p-4 border border-slate-200 rounded-lg mb-6 font-mono text-lg shadow-sm">
                <p class="text-slate-700">l&8321;: {{ currentScenario.l1 }}</p>
                <p class="text-amber-700 mt-2">l&#x2082;: {{ currentScenario.l2 }}</p>
              </div>

              <div class="flex flex-col gap-4">
                <button v-for="opt in options" :key="opt"
                        @click="selectOption(opt)"
                        class="p-4 border-2 rounded-xl text-left font-bold transition-all capitalize active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        :class="{
                          'border-amber-500 bg-amber-50 text-amber-700': userChoice === opt && !isCorrect,
                          'border-amber-400 bg-amber-50 text-amber-700': isCorrect && opt === currentScenario.correct,
                          'border-red-300 bg-red-50 text-red-600': userChoice === opt && isChecked && !isCorrect,
                          'border-slate-200 hover:border-slate-300 text-slate-700': userChoice !== opt || isCorrect
                        }">
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true"
                 :class="{
                   'bg-amber-100 text-amber-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-amber-50 text-amber-700': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-4"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="w-64 h-64 relative bg-white border-2 border-slate-300 rounded-lg shadow-inner overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <g v-if="currentScenario.correct === 'evenwijdig'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#475569" stroke-width="4" />
                    <line x1="20" y1="100" x2="100" y2="20" stroke="#d97706" stroke-width="4" />
                  </g>
                  <g v-if="currentScenario.correct === 'snijdend'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#475569" stroke-width="4" />
                    <line x1="10" y1="10" x2="90" y2="90" stroke="#d97706" stroke-width="4" />
                  </g>
                  <g v-if="currentScenario.correct === 'samenvallend'">
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#475569" stroke-width="6" />
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#d97706" stroke-width="3" stroke-dasharray="4" />
                  </g>
                </svg>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
