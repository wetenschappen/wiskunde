<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhArrowsOut,
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
    default: 'Inproduct (Scalair product) van Vectoren'
  },
  instruction: {
    type: String,
    default: 'Pas de y-coördinaat van vector b aan met de slider zodat vector a en vector b loodrecht op elkaar staan. Tip: Twee vectoren staan loodrecht als hun inproduct gelijk is aan 0.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhArrowsOut }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// --- Randomization: generateLevel() ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  let aRange, bxRange, sliderRange
  if (lvl === 0) {
    aRange = [-3, 3]
    bxRange = [-3, 3]
    sliderRange = [-4, 6]
  } else if (lvl === 1) {
    aRange = [-5, 5]
    bxRange = [-5, 5]
    sliderRange = [-6, 10]
  } else {
    aRange = [-7, 7]
    bxRange = [-6, 6]
    sliderRange = [-8, 12]
  }

  let vecA, vecB_x, correctB_y
  for (let attempt = 0; attempt < 50; attempt++) {
    const ax = randInt(aRange[0], aRange[1])
    const ay = randInt(aRange[0], aRange[1])
    const bx = randInt(bxRange[0], bxRange[1])
    if (ay === 0 || bx === 0) continue
    if ((-(ax * bx)) % ay !== 0) continue
    const by = -(ax * bx) / ay
    if (by < sliderRange[0] || by > sliderRange[1]) continue
    vecA = { x: ax, y: ay }
    vecB_x = bx
    correctB_y = by
    break
  }
  if (!vecA) {
    const fallbacks = [
      { a: { x: 2, y: 1 }, bx: -2, by: 4, sr: [-4, 6] },
      { a: { x: 4, y: 2 }, bx: -2, by: 4, sr: [-6, 10] },
      { a: { x: 6, y: 3 }, bx: -3, by: 6, sr: [-8, 12] }
    ]
    const f = fallbacks[lvl] || fallbacks[0]
    vecA = f.a
    vecB_x = f.bx
    correctB_y = f.by
  }

  const defaultB_y = correctB_y + (randInt(1, 2) * (Math.random() > 0.5 ? 1 : -1))

  return {
    vecA,
    vecB_x,
    defaultB_y,
    correctB_y,
    sliderMin: sliderRange[0],
    sliderMax: sliderRange[1],
    targetProduct: 0
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const vecA = computed(() => currentLevelData.value.vecA)
const vecB_x = computed(() => currentLevelData.value.vecB_x)
const vecB_y = ref(0)

const dotProduct = computed(() => {
  return vecA.value.x * vecB_x.value + vecA.value.y * vecB_y.value
})

// --- 8-element additions ---
const showPrediction = ref(true)
const predictAns = ref(null)
const predictionDone = ref(false)
const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  if (predictAns.value === null) return
  showPrediction.value = false
  predictionDone.value = true
  const data = currentLevelData.value
  const exact = data.vecA.x * data.vecB_x + data.vecA.y * data.correctB_y
  if (predictAns.value === exact) {
    feedback.value = { type: 'info', text: `Goed! Het inproduct moet 0 zijn voor loodrechte vectoren. Laten we controleren of de slider dat bevestigt.` }
  } else {
    feedback.value = { type: 'info', text: `Jij denkt dat het inproduct ${predictAns.value} is. Laten we de slider aanpassen tot het inproduct 0 wordt.` }
  }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function getHint() {
  const c = attemptCount.value
  const data = currentLevelData.value
  if (c === 1) return 'Hint: Het inproduct moet 0 zijn. Gebruik de formule: x1·x2 + y1·y2 = 0.'
  if (c === 2) return `Hint: a = (${data.vecA.x}, ${data.vecA.y}), b.x = ${data.vecB_x}. Bereken welke y dit nul maakt: (${data.vecA.x} × ${data.vecB_x}) + (${data.vecA.y} × y) = 0.`
  return `Hint: Los op: ${data.vecA.y} × y = ${-(data.vecA.x * data.vecB_x)}, dus y = ${-(data.vecA.x * data.vecB_x)} / ${data.vecA.y} = ?`
}

function getErrorAnalysis(userProduct) {
  const data = currentLevelData.value
  const expected = 0

  // Common error: thinking dot product = 0 means "vectors are zero" instead of "perpendicular"
  if (userProduct !== 0 && data.vecA.y !== 0 && data.vecB_x !== 0) {
    const ax = data.vecA.x, ay = data.vecA.y, bx = data.vecB_x
    const by = data.vecB_y.value
    // Check if x1·y1 + x2·y2 was used (wrong formula)
    const wrongFormula1 = ax * ay + bx * by
    if (userProduct === wrongFormula1) {
      return 'Let op! Je hebt x1·y1 + x2·y2 gebruikt. Het inproduct is x1·x2 + y1·y2: je moet x met x combineren en y met y, niet x met y.'
    }
    // Check if they did x1·x2 - y1·y2 (thinking difference instead of sum)
    const wrongFormula2 = ax * bx - ay * by
    if (userProduct === wrongFormula2) {
      return 'Let op! Het inproduct is een SOM, geen verschil. Formule: a·b = (x1·x2) + (y1·y2). Jij hebt (x1·x2) - (y1·y2) berekend.'
    }
  }

  // Check sign errors
  if (userProduct === -(data.vecA.x * data.vecB_x + data.vecA.y * data.vecB_y.value)) {
    return 'Let op! Je hebt het juiste getal maar met het verkeerde teken. Controleer of je de tekens van beide coördinaten correct hebt meegenomen.'
  }

  // Common error: vector magnitude (norm) instead of dot product
  const norm = Math.sqrt(data.vecA.x ** 2 + data.vecA.y ** 2) * Math.sqrt(data.vecB_x ** 2 + data.vecB_y.value ** 2)
  if (Math.abs(Math.abs(userProduct) - Math.round(norm)) < 1) {
    return 'Let op! Je hebt niet het inproduct berekend, maar het product van de lengtes (normen) van de vectoren. Het inproduct gebruikt de coördinaten: a·b = x1·x2 + y1·y2.'
  }

  if (userProduct !== 0) {
    // Suggest what the dot product result means
    return `Let op! Het inproduct is ${userProduct} maar moet 0 zijn voor loodrechte vectoren. Denk eraan: als a·b = 0 staan de vectoren loodrecht (orthogonaal), niet "zijn ze nul". Het inproduct 0 betekent dat de vectoren geen component in elkaars richting hebben.`
  }

  return ''
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  vecB_y.value = currentLevelData.value.defaultB_y
  showPrediction.value = true
  predictAns.value = null
  predictionDone.value = false
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
}

function nextLevel() {
    if (currentInternalLevel.value < totalInternalLevels - 1) {
      currentInternalLevel.value++
      resetActivityState()
      nextTick(() => mainArea.value?.focus())
    } else {
      goToNextStep()
    }
}

function checkAnswer() {
  isChecked.value = true
  if (dotProduct.value === 0) {
    isCorrect.value = true
    const data = currentLevelData.value
    const whyText = `<br><br><strong>Waarom werkt dit?</strong> De formule a·b = x₁·x₂ + y₁·y₂ meet hoezeer twee vectoren in dezelfde richting wijzen. Als a·b = 0, staan ze loodrecht — ze hebben geen component in elkaars richting. Visueel: de projectie van de ene vector op de andere is nul. Daarom gebruik je deze formule om orthogonaliteit te testen.`
    feedback.value = {
      type: 'success',
      text: `Perfect! Het inproduct is 0, de vectoren staan loodrecht.` + whyText
    }
    showReflection.value = true
  } else {
    attemptCount.value++
    isCorrect.value = false
    const errorMsg = getErrorAnalysis(dotProduct.value)
    feedback.value = {
      type: 'error',
      text: `Niet helemaal. Het inproduct is nu ${dotProduct.value}. Het moet 0 zijn.` +
        (errorMsg ? `<br><br>${errorMsg}` : `<br><br>${getHint()}`)
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1)
    } else {
        emit('complete')
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
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
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
            <div class="flex items-center gap-4 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span class="font-medium">Level {{ currentInternalLevel + 1 }}/{{ totalInternalLevels }}</span>
                <div class="flex items-center gap-1">
                  <span v-for="lvl in totalInternalLevels" :key="lvl"
                        class="w-2 h-2 rounded-full transition-all duration-300"
                        :class="lvl - 1 <= currentInternalLevel ? 'bg-amber-500' : 'bg-slate-300'">
                  </span>
                </div>
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
            <p class="mb-6 text-sm text-slate-600">
              Level {{ currentInternalLevel + 1 }}: Vind de y-coördinaat zodat a en b loodrecht staan.
            </p>

            <!-- PREDICTION GATE -->
            <div v-if="showPrediction" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Voorspel eerst!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Gegeven a = ({{ vecA.x }}, {{ vecA.y }}) en b = ({{ vecB_x }}, ?).<br>
                Wat moet het inproduct a·b zijn als de vectoren <strong>loodrecht</strong> staan?
              </p>
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="predictAns" placeholder="?"
                       class="w-20 p-2 text-lg font-bold text-center border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none" />
                <button @click="submitPrediction" :disabled="predictAns === null"
                        class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Voorspel
                </button>
              </div>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="predictionDone && !showPrediction && !showReflection && !isCorrect" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                Stel a = (3, 2) en b = (-2, ?). We willen a·b = 0.<br>
                a·b = 3·(-2) + 2·y = 0<br>
                -6 + 2y = 0<br>
                2y = 6<br>
                y = 3<br>
                <span class="font-bold">Dus b = (-2, 3). Controle: 3·(-2) + 2·3 = -6 + 6 = 0.</span>
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Waarom is het inproduct 0 als vectoren loodrecht staan?<br>
                <span class="text-xs text-slate-500">Denk aan de projectie van de ene vector op de andere.</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="Omdat loodrecht betekent dat de ene vector geen..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">
              <div class="font-mono text-sm space-y-2">
                <p><span class="text-slate-700 font-bold">a</span> = ({{ vecA.x }}, {{ vecA.y }})</p>
                <p><span class="text-amber-700 font-bold">b</span> = ({{ vecB_x }}, {{ vecB_y }})</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">Pas y-coördinaat van b aan:</label>
                <input type="range" v-model.number="vecB_y" :min="currentLevelData.sliderMin" :max="currentLevelData.sliderMax" step="1" class="w-full accent-amber-500">
                <div class="flex justify-between mt-1 text-xs text-slate-400">
                  <span>{{ currentLevelData.sliderMin }}</span><span>{{ currentLevelData.sliderMax }}</span>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border border-slate-200">
                <p class="text-sm font-bold text-slate-500 mb-2">Inproduct a &middot; b:</p>
                <p class="font-mono text-sm text-slate-600">(x&8321; &middot; x&#x2082;) + (y&8321; &middot; y&#x2082;)</p>
                <p class="font-mono text-sm text-slate-600">({{ vecA.x }} &middot; {{ vecB_x }}) + ({{ vecA.y }} &middot; {{ vecB_y }})</p>
                <p class="font-mono font-bold text-lg text-slate-800 mt-2">= {{ dotProduct }}</p>
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

              <button v-if="!isCorrect && !showPrediction" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Controleer
              </button>

              <button v-else-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative w-80 h-80 flex items-center justify-center">
                <svg width="320" height="320" viewBox="-160 -160 320 320" class="overflow-visible bg-white/50 rounded-lg shadow-sm border border-slate-300">
                  <defs>
                    <marker id="head-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                    <marker id="head-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
                    </marker>
                  </defs>

                  <line x1="-160" y1="0" x2="160" y2="0" stroke="#cbd5e1" stroke-width="2" />
                  <line x1="0" y1="-160" x2="0" y2="160" stroke="#cbd5e1" stroke-width="2" />

                  <line x1="0" y1="0" :x2="vecA.x * 20" :y2="-vecA.y * 20" stroke="#475569" stroke-width="3" marker-end="url(#head-a)" />
                  <text :x="(vecA.x * 20) + 10" :y="(-vecA.y * 20) + 5" fill="#475569" font-weight="bold">a</text>

                  <line x1="0" y1="0" :x2="vecB_x * 20" :y2="-vecB_y * 20" stroke="#d97706" stroke-width="3" marker-end="url(#head-b)" />
                  <text :x="(vecB_x * 20) - 20" :y="(-vecB_y * 20) - 5" fill="#d97706" font-weight="bold">b</text>

                  <g v-if="dotProduct === 0">
                    <path d="M 12 -6 L 18 6 L 6 12" fill="none" stroke="#d97706" stroke-width="2" />
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
    background-size: 20px 20px;
    background-position: center center;
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
