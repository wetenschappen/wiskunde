<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMathOperations,
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
    default: 'Voorschrift van een Tweedegraadsfunctie'
  },
  instruction: {
    type: String,
    default: 'Construeer het voorschrift f(x) = a(x - p)² + q. Pas de parameters aan totdat je parabool precies door de top (T) en het extra punt (P) loopt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhMathOperations }
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

const levelOptions = [
  // Level 1 options (a = 1, simple translation)
  [
    { targetA: 1, targetP: 2, targetQ: -3, topX: 2, topY: -3, pointX: 0, pointY: 1 },
    { targetA: 1, targetP: -1, targetQ: 2, topX: -1, topY: 2, pointX: 0, pointY: 3 },
    { targetA: 1, targetP: 3, targetQ: -1, topX: 3, topY: -1, pointX: 2, pointY: 0 },
    { targetA: 1, targetP: -2, targetQ: -2, topX: -2, topY: -2, pointX: 0, pointY: 2 },
  ],
  // Level 2 options (a = ±1 or ±2, reflection)
  [
    { targetA: -1, targetP: -1, targetQ: 4, topX: -1, topY: 4, pointX: 1, pointY: 0 },
    { targetA: -2, targetP: 1, targetQ: 3, topX: 1, topY: 3, pointX: 0, pointY: 1 },
    { targetA: 2, targetP: -2, targetQ: -2, topX: -2, topY: -2, pointX: -1, pointY: 0 },
    { targetA: -1, targetP: 2, targetQ: 1, topX: 2, topY: 1, pointX: 0, pointY: -3 },
  ],
  // Level 3 options (decimal a)
  [
    { targetA: -0.5, targetP: 3, targetQ: 2, topX: 3, topY: 2, pointX: 1, pointY: 0 },
    { targetA: 0.5, targetP: -2, targetQ: 1, topX: -2, topY: 1, pointX: 0, pointY: 3 },
    { targetA: -1.5, targetP: 0, targetQ: -2, topX: 0, topY: -2, pointX: 1, pointY: -3.5 },
    { targetA: 0.5, targetP: 1, targetQ: -3, topX: 1, topY: -3, pointX: -1, pointY: -1 },
  ],
]

function generateLevels() {
  levels.value = levelOptions.map(opts => opts[Math.floor(Math.random() * opts.length)])
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value] || levelOptions[0][0])

const graphPath = computed(() => {
  const points = []
  for (let x = -10; x <= 10; x += 0.2) {
    let y = valA.value * Math.pow(x - valP.value, 2) + valQ.value
    if (y < -12 || y > 12) continue
    const svgX = x * 20
    const svgY = -y * 20
    points.push(`${svgX},${svgY}`)
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : ''
})

// 3-level hints per HINT_TEMPLATE.md
function getHintText(count, t) {
  if (count <= 1) {
    return `<strong>Hint 1:</strong> De top T is (${t.topX}, ${t.topY}). Dat geeft p = ${t.topX} en q = ${t.topY}.<br>Nu moet a nog worden berekend: vul het extra punt P(${t.pointX}, ${t.pointY}) in: <span class="font-mono">${t.pointY} = a(${t.pointX} - ${t.topX})² + ${t.topY}</span><br><span class="text-xs text-slate-500">Los deze vergelijking op voor a.</span>`
  } else if (count <= 3) {
    return `<strong>Hint 2:</strong> Voorbeeld: top T(2, 1) en punt P(0, 5).<br>f(x) = a(x - 2)² + 1 → 5 = a(0 - 2)² + 1 → 5 = a · 4 + 1 → 4a = 4 → a = 1<br>Dus f(x) = (x - 2)² + 1.<br><span class="text-xs text-slate-500">Pas dit toe met jouw waarden: T(${t.topX}, ${t.topY}) en P(${t.pointX}, ${t.pointY}).</span>`
  } else {
    return `<strong>Hint 3:</strong> Vul in: ${t.pointY} = a(${t.pointX} - (___))² + (___).<br>Los op: ${t.pointY} - ${t.topY} = a(${t.pointX - t.topX})² → a = (${t.pointY - t.topY}) / ${Math.pow(t.pointX - t.topX, 2)} = ___`
  }
}

function submitPrediction() {
  showPrediction.value = false
  feedback.value = { type: 'info', text: 'Bouw de formule op. De grafiek tekent live mee met jouw parameters.' }
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
  const target = currentLevelData.value
  if (valA.value === target.targetA && valP.value === target.targetP && valQ.value === target.targetQ) {
    isCorrect.value = true
    showWhy.value = true
    showReflection.value = true
    clearTimeout(sliderTimer)
    return
  }
  if (isCorrect.value) return
  isCorrect.value = false
  showWhy.value = false
  attemptCount.value++

  // Error analysis: detect common mistakes
  const t = currentLevelData.value
  const aCorrect = valA.value === t.targetA
  const wrongA = valA.value === -t.targetA || valA.value === -1
  const pWrong = valP.value !== t.targetP && valP.value === t.targetQ
  const forgotA = valA.value === 1 && t.targetA !== 1

  clearTimeout(sliderTimer)
  sliderTimer = setTimeout(() => {
    if (!isCorrect.value) {
      if (pWrong) {
        feedback.value = {
          type: 'error',
          text: `<strong>Let op!</strong> p is ${t.targetP} (de x-coordinaat van de top), niet ${t.targetQ}.<br>De top is T(${t.topX}, ${t.topY}), dus p = ${t.topX} en q = ${t.topY}.`
        }
      } else if (forgotA) {
        feedback.value = {
          type: 'error',
          text: `<strong>Vergeet a niet!</strong> de vorm van de parabool moet kloppen. a = ${t.targetA}, niet gewoon 1.<br>Bereken a door P(${t.pointX}, ${t.pointY}) in te vullen in f(x) = a(x - ${t.topX})² + ${t.topY}.`
        }
      } else if (wrongA && aCorrect === false) {
        feedback.value = {
          type: 'error',
          text: `<strong>Let op het teken!</strong> a = ${t.targetA} (${t.targetA > 0 ? 'dalparabool' : 'bergparabool'}). Jij hebt ${valA.value}, maar de parabool moet ${t.targetA > 0 ? 'open naar boven' : 'open naar beneden'} zijn.`
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
                Welke vorm van het voorschrift is het beste om een parabool op te stellen als je de top en een extra punt kent?<br>
                <span class="text-xs text-slate-500">Kies uit: topvorm, standaardvorm, of ontbonden vorm.</span>
              </p>
              <div class="flex gap-2 mb-3">
                <button disabled
                        class="flex-1 py-2 px-2 text-xs font-bold rounded-lg border-2 border-amber-200 bg-white text-amber-700">
                  f(x) = a(x - p)² + q
                </button>
                <button disabled
                        class="flex-1 py-2 px-2 text-xs font-bold rounded-lg border-2 border-slate-200 bg-white text-slate-400">
                  f(x) = ax² + bx + c
                </button>
                <button disabled
                        class="flex-1 py-2 px-2 text-xs font-bold rounded-lg border-2 border-slate-200 bg-white text-slate-400">
                  f(x) = a(x - r₁)(x - r₂)
                </button>
              </div>
              <div class="text-xs text-amber-700 p-3 bg-white rounded border border-amber-200 mb-3">
                <strong>Tip:</strong> De <strong>topvorm</strong> f(x) = a(x - p)² + q toont direct de top (p, q).<br>
                De standaardvorm f(x) = ax² + bx + c toont de y-as snijpunt.<br>
                De ontbonden vorm toont de nulwaarden.
              </div>
              <button @click="submitPrediction"
                      class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen — topvorm is het beste
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="!showPrediction" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                <strong>Gegeven:</strong> top T(2, 1) en punt P(0, 5)<br>
                <strong>Stap 1:</strong> f(x) = a(x - 2)² + 1<br>
                <strong>Stap 2:</strong> Vul P(0, 5) in: 5 = a(0 - 2)² + 1<br>
                <strong>Stap 3:</strong> 5 = 4a + 1 → 4a = 4 → a = 1<br>
                <strong>Resultaat:</strong> f(x) = (x - 2)² + 1<br>
                <span class="font-bold">Nu jij: vul T en P van deze level in en bereken a.</span>
              </p>
            </div>

            <!-- FORMULA DISPLAY -->
            <div v-if="!showPrediction" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-lg shadow-sm mb-4">
              <p class="text-xs text-slate-500 mb-1">Gegeven punten:</p>
              <p class="text-sm font-bold text-slate-700">
                T(<span class="text-amber-600">{{ currentLevelData.topX }}</span>, <span class="text-amber-600">{{ currentLevelData.topY }}</span>)
                en P(<span class="text-amber-600">{{ currentLevelData.pointX }}</span>, <span class="text-amber-600">{{ currentLevelData.pointY }}</span>)
              </p>
              <p class="font-mono text-lg font-black text-amber-700 mt-2">
                f(x) = {{ valA === 1 ? '' : (valA === -1 ? '-' : valA) }}(x {{ valP >= 0 ? '- ' + valP : '+ ' + Math.abs(valP) }})² {{ valQ >= 0 ? '+ ' + valQ : '- ' + Math.abs(valQ) }}
              </p>
            </div>

            <!-- SLIDERS -->
            <div v-if="!showPrediction" class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Factor a (opening): {{ valA }}</label>
                <input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-amber-500">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verschuiving horizontaal (p): {{ valP }}</label>
                <input type="range" v-model.number="valP" min="-5" max="5" step="1" class="w-full accent-amber-500">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Verschuiving verticaal (q): {{ valQ }}</label>
                <input type="range" v-model.number="valQ" min="-5" max="5" step="1" class="w-full accent-amber-500">
              </div>

              <!-- REFLECTION -->
              <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
                <div class="flex items-center gap-2 mb-3">
                  <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                  <span class="font-bold text-amber-800">Waarom?</span>
                </div>
                <p class="text-sm text-amber-800 mb-3">
                  Waarom is de topvorm f(x) = a(x - p)² + q handiger dan de standaardvorm om een parabool op te stellen vanuit de top en een punt?<br>
                  <span class="text-xs text-slate-500">Denk aan wat je direct kunt aflezen.</span>
                </p>
                <textarea v-model="reflectAns" rows="2"
                          class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Omdat de top direct zichtbaar is..."></textarea>
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

              <svg width="400" height="400" viewBox="-100 -100 200 200" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10">

                <!-- Grid Lines -->
                <g stroke="#e2e8f0" stroke-width="1">
                  <line v-for="i in 21" :key="'v'+i" :x1="(i-11)*20" y1="-100" :x2="(i-11)*20" y2="100" />
                  <line v-for="i in 21" :key="'h'+i" x1="-100" :y1="(i-11)*20" x2="100" :y2="(i-11)*20" />
                </g>

                <!-- Axes -->
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#64748b" stroke-width="2" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#64748b" stroke-width="2" />

                <!-- User Graph -->
                <path v-if="valA !== 0" :d="graphPath" fill="none" stroke="#d97706" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />

                <!-- Top T -->
                <circle :cx="currentLevelData.topX * 20" :cy="-currentLevelData.topY * 20" r="5" fill="#334155" />
                <text :x="currentLevelData.topX * 20 + 8" :y="-currentLevelData.topY * 20 - 8" font-size="10" font-weight="bold" fill="#334155">T({{ currentLevelData.topX }}, {{ currentLevelData.topY }})</text>

                <!-- Point P -->
                <circle :cx="currentLevelData.pointX * 20" :cy="-currentLevelData.pointY * 20" r="5" fill="#334155" />
                <text :x="currentLevelData.pointX * 20 + 8" :y="-currentLevelData.pointY * 20 - 8" font-size="10" font-weight="bold" fill="#334155">P({{ currentLevelData.pointX }}, {{ currentLevelData.pointY }})</text>

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
