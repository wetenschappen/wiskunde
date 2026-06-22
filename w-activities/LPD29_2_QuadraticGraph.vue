<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhGraph,
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
    default: 'Grafiek van een Tweedegraadsfunctie'
  },
  instruction: {
    type: String,
    default: 'Pas de parameters a, p en q aan zodat de rode parabool exact over de stippellijn valt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhGraph }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showPrediction = ref(true)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)
const showWhy = ref(false)

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

const valA = ref(1)
const valP = ref(0)
const valQ = ref(0)

const levelGenerators = [
  // Level 1: Translation only (a = 1)
  () => {
    let p = Math.floor(Math.random() * 7) - 3
    let q = Math.floor(Math.random() * 7) - 3
    if (p === 0 && q === 0) p = 2
    return { a: 1, p, q }
  },
  // Level 2: Reflection and translation
  () => {
    let a = Math.random() > 0.5 ? 2 : -2
    let p = Math.floor(Math.random() * 7) - 3
    let q = Math.floor(Math.random() * 7) - 3
    return { a, p, q }
  },
  // Level 3: Scaling, reflection, and translation
  () => {
    let aOptions = [-1.5, -0.5, 0.5, 1.5]
    let a = aOptions[Math.floor(Math.random() * aOptions.length)]
    let p = Math.floor(Math.random() * 9) - 4
    let q = Math.floor(Math.random() * 9) - 4
    return { a, p, q }
  }
]

function generateLevels() {
  levels.value = levelGenerators.map(gen => gen())
}

const target = computed(() => levels.value[currentInternalLevel.value] || { a: 1, p: 0, q: 0 })

const graphPathTarget = computed(() => generateParabolaPath(target.value.a, target.value.p, target.value.q))
const graphPathUser = computed(() => generateParabolaPath(valA.value, valP.value, valQ.value))

function generateParabolaPath(a, p, q) {
  const points = []
  for (let x = -10; x <= 10; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q
    if (y < -12 || y > 12) continue
    const svgX = x * 15
    const svgY = -y * 15
    points.push(`${svgX},${svgY}`)
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : ''
}

// 3-level hints per HINT_TEMPLATE.md
function getHintText(count, t) {
  if (count <= 1) {
    return `<strong>Hint 1:</strong> De top van de parabool is (p, q) in f(x) = a(x - p)² + q. Kijk naar de stippellijn — wat is ongeveer de top?<br><span class="text-xs text-slate-500">De top is het laagste of hoogste punt van de parabool.</span>`
  } else if (count <= 3) {
    return `<strong>Hint 2:</strong> Voorbeeld: f(x) = 2(x - 1)² + 3 heeft top (1, 3) en opent naar boven. Bij jou is de top van de stippellijn (${t.p}, ${t.q}). Stel p en q in op deze waarden.<br><span class="text-xs text-slate-500">p verschuift horizontaal (tegenovergesteld teken!), q verschuift verticaal.</span>`
  } else {
    return `<strong>Hint 3:</strong> Doel: a = ${t.a}, p = ${t.p}, q = ${t.q}. <br>Vul in: f(x) = ${t.a === 1 ? '' : (t.a === -1 ? '-' : t.a)}(x - (___))² + (___).<br><span class="text-xs text-slate-500">Let op: in de formule staat (x - p), dus als p = ${t.p} moet je x - ${t.p} = x + ${-t.p} invoeren via de slider.</span>`
  }
}

function submitPrediction() {
  showPrediction.value = false
  feedback.value = { type: 'info', text: 'Pas de schuifregelaars aan tot de rode parabool de stippellijn bedekt.' }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function resetActivityState() {
  generateLevels()
  isCorrect.value = false
  celebrationDone.value = false
  attemptCount.value = 0
  hintCount.value = 0
  feedback.value = { type: 'info', text: '' }
  valA.value = 1
  valP.value = 0
  valQ.value = 0
  showPrediction.value = true
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  showWhy.value = false
}

function handleNext() {
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

// Auto-correct on slider match with 3-level hints
let sliderTimer = null

watch([valA, valP, valQ], () => {
  if (showPrediction.value || showReflection.value) return
  const t = target.value
  if (valA.value === t.a && valP.value === t.p && valQ.value === t.q) {
    isCorrect.value = true
    showWhy.value = true
    const aStr = t.a === 1 ? '' : (t.a === -1 ? '-' : t.a)
    const pStr = t.p >= 0 ? `- ${t.p}` : `+ ${Math.abs(t.p)}`
    const qStr = t.q >= 0 ? `+ ${t.q}` : `- ${Math.abs(t.q)}`
    feedback.value = {
      type: 'success',
      text: `Prima! De parabool dekt het doelwit perfect af. f(x) = ${aStr}(x ${pStr})² ${qStr}.<br><br><strong>Waarom?</strong> Completing the square herschrijft f(x) = ax² + bx + c naar a(x - p)² + q. De top (p, q) is dan direct afleesbaar. Als a &gt; 0 is het een dalparabool (minimum); als a &lt; 0 is het een bergparabool (maximum). De top is het belangrijkste punt: het vertelt je waar de parabool draait.`
    }
    showReflection.value = true
    clearTimeout(sliderTimer)
    return
  }
  // Not matched — reset
  if (isCorrect.value) return
  isCorrect.value = false
  showWhy.value = false
  attemptCount.value++

  // Error analysis: detect sign error in vertex
  const signErrorP = valP.value === -t.p && valQ.value === t.q
  const signErrorQ = valP.value === t.p && valQ.value === -t.q
  const swappedPQ = valP.value === t.q && valQ.value === t.p

  clearTimeout(sliderTimer)
  sliderTimer = setTimeout(() => {
    if (!isCorrect.value) {
      if (signErrorP) {
        feedback.value = {
          type: 'error',
          text: `<strong>Let op het teken!</strong> In f(x) = a(x - p)² + q is de top (p, q). Jij hebt p = ${valP.value} maar de top van de doelparabool is (${t.p}, ${t.q}).<br>Als de top op x = ${t.p} ligt, dan is p = ${t.p}, niet -${t.p}. Kijk: f(x) = a(x - ${t.p})² + q.`
        }
      } else if (signErrorQ) {
        feedback.value = {
          type: 'error',
          text: `<strong>Let op het teken van q!</strong> De top is (${t.p}, ${t.q}) — de y-coordinaat q = ${t.q}. Jij hebt q = ${valQ.value}.`
        }
      } else if (swappedPQ) {
        feedback.value = {
          type: 'error',
          text: `<strong>Niet verwarren!</strong> p is de x-coordinaat en q is de y-coordinaat van de top. Jij hebt p = ${valP.value} en q = ${valQ.value}, maar de top is (${t.p}, ${t.q}).`
        }
      } else {
        feedback.value = {
          type: 'error',
          text: getHintText(attemptCount.value, t)
        }
      }
    }
  }, 800)
})

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    generateLevels()
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
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
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
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Wat is de <strong>top</strong> van de doelparabool (stippellijn)?<br>
                <span class="text-xs text-slate-500">De top is het laagste of hoogste punt van de parabool.</span>
              </p>
              <div class="text-xs text-amber-700 p-3 bg-white rounded border border-amber-200 mb-3">
                <strong>Tip:</strong> De top is (p, q) in f(x) = a(x - p)² + q.<br>
                Kijk naar de stippellijn in de grafiek. Waar ligt het diepste of hoogste punt?
              </div>
              <button @click="submitPrediction"
                      class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="!showPrediction" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <strong>Gegeven:</strong> f(x) = x² + 6x + 5<br>
                <strong>Completing the square:</strong><br>
                x² + 6x + 5 = (x + 3)² - 9 + 5 = (x + 3)² - 4<br>
                <strong>Top:</strong> (-3, -4) en a = 1 (dalparabool)<br>
                <span class="font-bold">Jij moet nu de schuifregelaars gebruiken om de stippellijn na te maken.</span>
              </p>
            </div>

            <!-- FORMULA DISPLAY -->
            <div v-if="!showPrediction" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-lg shadow-sm mb-4">
              <p class="font-mono text-lg font-black text-amber-700">
                f(x) = {{ valA === 1 ? '' : (valA === -1 ? '-' : valA) }}(x {{ valP >= 0 ? '- ' + valP : '+ ' + Math.abs(valP) }})² {{ valQ >= 0 ? '+ ' + valQ : '- ' + Math.abs(valQ) }}
              </p>
              <p class="text-xs text-slate-400 mt-1">Doel: a={{ target.a }}, p={{ target.p }}, q={{ target.q }}</p>
            </div>

            <!-- SLIDERS -->
            <div v-if="!showPrediction" class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter a: {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-amber-500">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter p: {{ valP }}</label>
                <input type="range" v-model.number="valP" min="-5" max="5" step="1" class="w-full accent-amber-500">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Parameter q: {{ valQ }}</label>
                <input type="range" v-model.number="valQ" min="-5" max="5" step="1" class="w-full accent-amber-500">
              </div>

              <!-- REFLECTION -->
              <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
                <div class="flex items-center gap-2 mb-3">
                  <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                  <span class="font-bold text-amber-800">Waarom?</span>
                </div>
                <p class="text-sm text-amber-800 mb-3">
                  Waarom is de top van de parabool belangrijk om de grafiek te tekenen?<br>
                  <span class="text-xs text-slate-500">Denk aan wat de top vertelt over minimum/maximum en symmetrie.</span>
                </p>
                <textarea v-model="reflectAns" rows="2"
                          class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Omdat de top het hoogste of laagste punt is..."></textarea>
                <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                        class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Bevestig
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

              <button v-if="isCorrect && reflectDone" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] animate-fadeIn focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-if="!isCorrect && !showPrediction" class="flex-1 py-4 text-sm text-slate-400 text-center">
                Pas de schuifregelaars aan
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <svg width="450" height="450" viewBox="-150 -150 300 300" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*15" y1="-150" :x2="(i-11)*15" y2="150" />
                  <line v-for="i in 21" :key="'h'+i" x1="-150" :y1="(i-11)*15" x2="150" :y2="(i-11)*15" />
                </g>

                <!-- Axes -->
                <line x1="-150" y1="0" x2="150" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-150" x2="0" y2="150" stroke="#64748b" stroke-width="2" />

                <!-- Target Graph (dashed) -->
                <path :d="graphPathTarget" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="8,4" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />

                <!-- User Graph -->
                <path v-if="valA !== 0" :d="graphPathUser" fill="none" stroke="#d97706" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-150" />

                <!-- User Vertex Dot -->
                <circle :cx="valP * 15" :cy="-valQ * 15" r="5" fill="#1e293b" class="transition-all duration-150 shadow-sm" />

              </svg>

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
