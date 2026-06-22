<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMagnifyingGlassPlus,
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
    default: 'Kenmerken Tweedegraadsfuncties'
  },
  instruction: {
    type: String,
    default: 'Plaats de wiskundige kenmerken fysiek op de juiste locatie in de grafiek met behulp van de schuifregelaars.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhMagnifyingGlassPlus }
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

// User placements
const userAxis = ref(0)
const userVertexX = ref(0)
const userVertexY = ref(0)
const userRoot1 = ref(-1)
const userRoot2 = ref(1)

function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelIndex) {
  let a, p, q, roots

  if (levelIndex === 0) {
    a = 1
    const qValues = [-1, -4, -9, -16, -25]
    q = qValues[rng(0, qValues.length - 1)]
    p = 0
    const rootVal = Math.sqrt(-q)
    roots = [-rootVal, rootVal]
  } else if (levelIndex === 1) {
    a = Math.random() < 0.5 ? 1 : -1
    const pairs = [[-1, 3], [-3, 1], [0, 4], [-4, 0], [-2, 2], [-5, -1], [1, 5], [-3, 3]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    roots = pair
  } else {
    const aOptions = [-2, -1, -0.5, 0.5, 1, 2]
    a = aOptions[rng(0, aOptions.length - 1)]
    const pairs = [[-5, 1], [-3, 3], [-1, 5], [-6, 0], [-4, 2], [-2, 4], [-7, -1], [0, 6], [-4, 4], [-8, -2]]
    const pair = pairs[rng(0, pairs.length - 1)]
    p = (pair[0] + pair[1]) / 2
    const diff = pair[1] - pair[0]
    q = -a * diff * diff / 4
    roots = pair
  }

  return {
    a, p, q,
    roots: roots.sort((a, b) => a - b),
    formula: formatQuadratic(a, p, q),
    // Projectile motion context for worked example
    context: levelIndex === 0
      ? { domain: 'ℝ', range: q >= 0 ? `[${q}, ∞[` : `]${q}, ∞[`, maxMin: `minimum f(${p}) = ${q}`, maxVal: q }
      : levelIndex === 1
      ? { domain: 'ℝ', range: a > 0 ? `[${q}, ∞[` : `]-∞, ${q}]`, maxMin: a > 0 ? `minimum f(${p}) = ${q}` : `maximum f(${p}) = ${q}`, maxVal: q }
      : { domain: 'ℝ', range: a > 0 ? `[${q}, ∞[` : `]-∞, ${q}]`, maxMin: a > 0 ? `minimum f(${p}) = ${q}` : `maximum f(${p}) = ${q}`, maxVal: q },
    predictionQuestion: levelIndex === 0
      ? `Wat is de minimumwaarde (laagste y-waarde) van deze parabool?`
      : `Wat is de ${a > 0 ? 'minimum' : 'maximum'}waarde van deze parabool?`
  }
}

function formatQuadratic(a, p, q) {
  const aStr = a === 1 ? '' : a === -1 ? '-' : a
  if (p === 0 && q === 0) return `f(x) = ${aStr}x²`
  const pPart = p === 0 ? '' : p < 0 ? `(x + ${Math.abs(p)})` : `(x - ${p})`
  const squared = pPart ? `${aStr}${pPart}²` : `${aStr}x²`
  if (q === 0) return `f(x) = ${squared}`
  const qSign = q > 0 ? '+ ' : '- '
  return `f(x) = ${squared} ${qSign}${Math.abs(q)}`
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const graphPath = computed(() => {
  if (!currentLevelData.value) return ''
  const { a, p, q } = currentLevelData.value
  const points = []
  for (let x = -10; x <= 10; x += 0.2) {
    let y = a * Math.pow(x - p, 2) + q
    if (y < -12 || y > 12) continue
    const svgX = x * 15
    const svgY = -y * 15
    points.push(`${svgX},${svgY}`)
  }
  return points.length > 0 ? `M ${points.join(' L ')}` : ''
})

// 3-level hints
function getHintText(count) {
  const t = currentLevelData.value
  if (!t) return ''
  if (count <= 1) {
    return `<strong>Hint 1:</strong> De symmetrieas is x = p, dus x = ${t.p}.<br>De top is (p, q) = (${t.p}, ${t.q}).<br>De nulwaarden zijn de x-waarden waar y = 0: los f(x) = 0 op.<br><span class="text-xs text-slate-500">De top en symmetrieas hebben dezelfde x-waarde.</span>`
  } else if (count <= 3) {
    return `<strong>Hint 2:</strong> Voorbeeld: f(x) = (x - 1)² - 4.<br>Top: (1, -4). Symmetrieas: x = 1.<br>Nulwaarden: (x - 1)² = 4 → x = 3 of x = -1.<br>$\text{Toepassen op jouw formule: }$ f(x) = ${t.formula}.<br><span class="text-xs text-slate-500">Wat is de top? Wat zijn de nulwaarden (zet f(x) = 0)?</span>`
  } else {
    return `<strong>Hint 3:</strong> Symmetrieas: x = ${t.p}.<br>Top: (${t.p}, ${t.q}).<br>Nulwaarden: los op: (x - ${t.p})² = ${-t.q / t.a} → x = ___ of x = ___`
  }
}

function submitPrediction() {
  showPrediction.value = false
  feedback.value = { type: 'info', text: 'Plaats de symmetrieas, de top en de twee nulwaarden op de juiste coördinaten.' }
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
  showPrediction.value = true
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  showWhy.value = false

  // Randomize initial positions slightly away from target
  userAxis.value = -4
  userVertexX.value = 4
  userVertexY.value = 4
  userRoot1.value = -4
  userRoot2.value = 4
}

function checkAllCorrect() {
  if (!currentLevelData.value) return false
  const t = currentLevelData.value
  const axisCorrect = userAxis.value === t.p
  const vertexCorrect = userVertexX.value === t.p && userVertexY.value === t.q
  const userRoots = [userRoot1.value, userRoot2.value].sort((a,b) => a-b)
  const targetRoots = [...t.roots].sort((a,b) => a-b)
  const rootsCorrect = userRoots[0] === targetRoots[0] && userRoots[1] === targetRoots[1]
  return axisCorrect && vertexCorrect && rootsCorrect
}

function onSliderChanged() {
  if (showPrediction.value || showReflection.value || isCorrect.value) return
  if (!currentLevelData.value) return
  attemptCount.value++

  const t = currentLevelData.value
  const allCorrect = checkAllCorrect()

  if (allCorrect) {
    isCorrect.value = true
    showWhy.value = true
    showReflection.value = true
    const maxMin = t.a > 0 ? 'minimum' : 'maximum'
    feedback.value = {
      type: 'success',
      text: `Prima! Je hebt alle kenmerken correct geplaatst.<br><br><strong>Kenmerken:</strong><br>Symmetrieas: x = ${t.p}<br>Top: (${t.p}, ${t.q}) — dit is het ${maxMin}<br>Nulwaarden: x = ${t.roots[0]} en x = ${t.roots[1]}<br>Domein: ℝ &nbsp;|&nbsp; Bereik: ${t.a > 0 ? `[${t.q}, ∞[` : `]-∞, ${t.q}]`}<br><br><strong>Waarom?</strong> Wiskundige functies hebben altijd domein ℝ — elk reëel getal kan ingevuld worden. Het bereik wordt bepaald door de top: bij een dalparabool (a &gt; 0) zijn alle y-waarden ≥ q. Nulwaarden vind je door f(x) = 0 op te lossen. Symmetrieas en top delen dezelfde x-waarde p.`
    }
    return
  }

  // Error analysis
  const userRoots = [userRoot1.value, userRoot2.value].sort((a,b) => a-b)
  const targetRoots = [...t.roots].sort((a,b) => a-b)

  const axisWrong = userAxis.value !== t.p
  const vertexXwrong = userVertexX.value !== t.p
  const vertexYwrong = userVertexY.value !== t.q
  const rootsWrong = userRoots[0] !== targetRoots[0] || userRoots[1] !== targetRoots[1]
  const maxWithZero = t.a < 0 && userVertexY.value === 0 && t.q !== 0
  const domainRangeConfusion = userAxis.value === t.q || userVertexY.value === t.p

  if (maxWithZero) {
    feedback.value = {
      type: 'error',
      text: `<strong>Let op!</strong> Het maximum is de y-waarde van de top, niet een nulwaarde. De top is (${t.p}, ${t.q}) — dus het ${t.a > 0 ? 'minimum' : 'maximum'} is q = ${t.q}, niet 0.<br><span class="text-xs text-slate-500">Nulwaarden zijn waar y = 0 (op de x-as). Het maximum is waar de grafiek haar hoogste punt bereikt.</span>`
    }
  } else if (domainRangeConfusion) {
    feedback.value = {
      type: 'error',
      text: `<strong>Let op het verschil tussen domein en bereik!</strong><br>Symmetrieas is x = ${t.p} (x-waarde). Top y-coordinaat is q = ${t.q} (y-waarde).<br><span class="text-xs text-slate-500">Domein = alle mogelijke x-waarden. Bereik = alle mogelijke y-waarden.</span>`
    }
  } else if (vertexXwrong && !axisWrong) {
    feedback.value = {
      type: 'error',
      text: `<strong>De top en symmetrieas horen bij elkaar!</strong><br>Symmetrieas is x = ${t.p} (jouw waarde: ${userAxis.value}).<br>De top heeft dezelfde x-waarde x = ${t.p}. Jij hebt top x = ${userVertexX.value}. Pas aan.`
    }
  } else {
    feedback.value = {
      type: 'error',
      text: getHintText(attemptCount.value)
    }
  }
}

const debounceTimer = ref(null)
watch([userAxis, userVertexX, userVertexY, userRoot1, userRoot2], () => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(onSliderChanged, 400)
})

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
            <div v-if="showPrediction && currentLevelData" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Bekijk de formule: {{ currentLevelData.formula }}<br>
                <strong>{{ currentLevelData.predictionQuestion }}</strong><br>
                <span class="text-xs text-slate-500">Tip: kijk naar q in f(x) = a(x - p)² + q. De top is (p, q).</span>
              </p>
              <div class="text-xs text-amber-700 p-3 bg-white rounded border border-amber-200 mb-3">
                <strong>Voorbeeld (projectielbeweging):</strong><br>
                Een bal wordt omhoog gegooid: h(t) = -5(t - 2)² + 20.<br>
                De top (2, 20) betekent: na 2 seconden is de bal op 20 m hoogte (maximum).<br>
                De nulwaarden (t = 0 en t = 4) zijn wanneer de bal op de grond is (h = 0).<br>
                Domein is ℝ (alle tijden), maar in context is alleen t ∈ [0, 4] relevant!
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
                <strong>f(x) = (x - 1)² - 4</strong><br>
                Top: (1, -4) — minimum, want a = 1 &gt; 0<br>
                Symmetrieas: x = 1 (verticale lijn door de top)<br>
                Nulwaarden: (x - 1)² = 4 → x = 3 of -1<br>
                Domein: ℝ (alle reele getallen)<br>
                Bereik: [-4, ∞[ (vanaf minimum naar +∞)<br>
                <span class="font-bold">Nu jij: pas de schuifregelaars aan voor de formule hierboven.</span>
              </p>
            </div>

            <!-- FORMULA DISPLAY -->
            <div v-if="!showPrediction && currentLevelData" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-lg shadow-sm mb-4">
              <p class="text-sm font-bold text-amber-700">{{ currentLevelData.formula }}</p>
            </div>

            <!-- SLIDERS -->
            <div v-if="!showPrediction" class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <!-- Symmetrieas -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <label class="font-bold text-slate-700">Symmetrieas: x = {{ userAxis }}</label>
                </div>
                <input type="range" v-model.number="userAxis" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
              </div>

              <!-- Top -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <label class="font-bold text-slate-700">Top (Vertex): ({{ userVertexX }}, {{ userVertexY }})</label>
                </div>
                <div class="space-y-4">
                  <div>
                    <span class="text-xs text-slate-500">X-coördinaat</span>
                    <input type="range" v-model.number="userVertexX" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                  <div>
                    <span class="text-xs text-slate-500">Y-coördinaat</span>
                    <input type="range" v-model.number="userVertexY" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                </div>
              </div>

              <!-- Nulwaarden -->
              <div class="p-4 bg-white border border-slate-200 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 rounded-full bg-slate-400"></div>
                  <label class="font-bold text-slate-700">Nulwaarden op de x-as</label>
                </div>
                <div class="space-y-4">
                  <div>
                    <span class="text-xs text-slate-500">Nulwaarde 1: x = {{ userRoot1 }}</span>
                    <input type="range" v-model.number="userRoot1" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                  <div>
                    <span class="text-xs text-slate-500">Nulwaarde 2: x = {{ userRoot2 }}</span>
                    <input type="range" v-model.number="userRoot2" min="-6" max="6" step="0.5" class="w-full accent-amber-500">
                  </div>
                </div>
              </div>

              <!-- REFLECTION -->
              <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl animate-fadeIn">
                <div class="flex items-center gap-2 mb-3">
                  <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                  <span class="font-bold text-amber-800">Waarom?</span>
                </div>
                <p class="text-sm text-amber-800 mb-3">
                  In de context van een projectielbeweging (bv. een bal die wordt gegooid) — waarom is alleen een deel van de parabool relevant?<br>
                  <span class="text-xs text-slate-500">Denk aan de tijd — voor en na de worp.</span>
                </p>
                <textarea v-model="reflectAns" rows="2"
                          class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Omdat de tijd pas begint bij het loslaten..."></textarea>
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
                Pas alle schuifregelaars aan
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

                <!-- The Parabola -->
                <path v-if="currentLevelData" :d="graphPath" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />

                <!-- Symmetrieas -->
                <line :x1="userAxis * 15" y1="-150" :x2="userAxis * 15" y2="150" stroke="#d97706" stroke-width="3" stroke-dasharray="8,4" class="transition-all duration-150" />

                <!-- Nulwaarden (Roots) -->
                <circle :cx="userRoot1 * 15" cy="0" r="6" fill="#d97706" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />
                <circle :cx="userRoot2 * 15" cy="0" r="6" fill="#d97706" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />

                <!-- Top (Vertex) -->
                <circle :cx="userVertexX * 15" :cy="-userVertexY * 15" r="7" fill="#d97706" stroke="white" stroke-width="2" class="transition-all duration-150 shadow-sm" />

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
