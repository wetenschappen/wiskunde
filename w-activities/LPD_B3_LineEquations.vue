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
    default: 'Vergelijkingen van Rechten'
  },
  instruction: {
    type: String,
    default: 'Koppel de cartesische vergelijking (links) aan de bijhorende richtingsvector (rechts). Onthoud dat voor ux + vy + w = 0 de normaalvector (u, v) is en de richtingsvector (v, -u).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
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
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatExpr(u, v, w) {
  const parts = []
  if (u !== 0) {
    if (u === 1) parts.push('x')
    else if (u === -1) parts.push('-x')
    else parts.push(u + 'x')
  }
  if (v !== 0) {
    if (v === 1) parts.push((parts.length ? '+' : '') + 'y')
    else if (v === -1) parts.push((parts.length ? '-' : '-') + 'y')
    else parts.push((v > 0 && parts.length ? '+' : '') + v + 'y')
  }
  if (w !== 0) {
    parts.push((w > 0 && parts.length ? '+' : '') + w)
  }
  if (parts.length === 0) return '0 = 0'
  let expr = parts.join(' ')
  if (expr.startsWith('+ ')) expr = expr.slice(2)
  return expr + ' = 0'
}

function formatDir(u, v) {
  return '(' + v + ', ' + (-u) + ')'
}

function generateLevel(lvl) {
  let count
  if (lvl === 0) count = 2
  else if (lvl === 1) count = 4
  else count = 6

  const pairs = []
  const usedDirs = new Set()

  if (lvl === 0) {
    const basePairs = [
      { u: 2, v: 3, w: -6 },
      { u: 0, v: 1, w: -3, label: 'y = 3', dirLabel: '(1, 0)' }
    ]
    for (const bp of basePairs) {
      const dir = bp.dirLabel || formatDir(bp.u, bp.v)
      pairs.push({
        id: pairs.length + 1,
        expr: bp.label || formatExpr(bp.u, bp.v, bp.w),
        ans: dir,
        u: bp.u,
        v: bp.v
      })
      usedDirs.add(dir)
    }
  } else {
    let attempts = 0
    while (pairs.length < count && attempts < 100) {
      attempts++
      let u, v, w
      if (lvl === 1) {
        u = randInt(-4, 4)
        v = randInt(-4, 4)
        w = randInt(-10, 10)
      } else {
        u = randInt(-6, 6)
        v = randInt(-6, 6)
        w = randInt(-15, 15)
      }
      if (u === 0 && v === 0) continue

      const dir = formatDir(u, v)
      if (usedDirs.has(dir)) continue
      usedDirs.add(dir)

      const expr = formatExpr(u, v, w)
      pairs.push({ id: pairs.length + 1, expr, ans: dir, u, v })
    }

    if (pairs.length < count) {
      const specials = [
        { u: 0, v: 1, w: -3, label: 'y = 3', dirLabel: '(1, 0)' },
        { u: 1, v: 0, w: 2, label: 'x = -2', dirLabel: '(0, 1)' }
      ]
      const extras = specials.filter(s => !usedDirs.has(s.dirLabel))
      while (pairs.length < count && extras.length > 0) {
        const e = extras.shift()
        pairs.push({ id: pairs.length + 1, expr: e.label, ans: e.dirLabel, u: e.u, v: e.v })
      }
    }
  }

  return {
    name: lvl === 0 ? 'Basis' : lvl === 1 ? 'Toepassing' : 'Uitdaging',
    pairs
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

const expressions = ref([])
const answers = ref([])

const selectedExpr = ref(null)
const selectedAns = ref(null)
const matchedPairs = ref([])

// --- 8-element additions ---
const showPrediction = ref(true)
const predictionDone = ref(false)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

const showReflection = ref(false)
const reflectAns = ref('')
const reflectDone = ref(false)

function submitPrediction() {
  showPrediction.value = false
  predictionDone.value = true
  feedback.value = { type: 'info', text: 'Begin met koppelen. Onthoud: richtingsvector = (v, -u) uit ux + vy + w = 0.' }
}

function submitReflection() {
  if (reflectAns.value.trim().length > 0) {
    reflectDone.value = true
  }
}

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Onthoud de regel: voor ux + vy + w = 0 is de richtingsvector (v, -u).'
  if (c === 2) return 'Hint: Als de vergelijking y = c is (horizontaal), dan is u=0, dus richtingsvector = (1, 0). Bij x = c (verticaal) is v=0, dus (0, 1).'
  return 'Hint: Schrijf de vergelijking in de vorm ux + vy + w = 0. Lees u en v af. Richtingsvector = (v, -u). Let op tekens!'
}

function selectExpr(item) {
  if (matchedPairs.value.includes(item.id)) return
  selectedExpr.value = item.id === selectedExpr.value ? null : item.id
  checkMatch()
}

function selectAns(item) {
  if (matchedPairs.value.includes(item.id)) return
  selectedAns.value = item.id === selectedAns.value ? null : item.id
  checkMatch()
}

function checkMatch() {
  if (selectedExpr.value !== null && selectedAns.value !== null) {
    if (selectedExpr.value === selectedAns.value) {
      matchedPairs.value.push(selectedExpr.value)
      selectedExpr.value = null
      selectedAns.value = null

      if (matchedPairs.value.length === currentLevel.value.pairs.length) {
        isCorrect.value = true
        isChecked.value = true
        showReflection.value = true
        feedback.value = {
          type: 'success',
          text: 'Prima!! Je kan de richtingsvector aflezen uit een cartesische vergelijking.<br><br><strong>Waarom verschillende vormen?</strong> De cartesische vorm ux + vy + w = 0 is handig om snel de normaalvector (u, v) te vinden. De richtingsvector (v, -u) staat hier loodrecht op. De vectoriële en parameter vormen zijn dan weer handig om punten op de rechte te berekenen en om snijpunten te vinden. Afhankelijk van wat je wil doen, kies je de handigste vorm.'
        }
      }
    } else {
      attemptCount.value++
      // Error analysis: check if student confused normal vector with direction vector
      const exprItem = currentLevel.value.pairs.find(p => p.id === selectedExpr.value)
      const ansItem = currentLevel.value.pairs.find(p => p.id === selectedAns.value)
      if (exprItem && ansItem) {
        // Check if student gave (u, v) instead of (v, -u)
        const normalVector = '(' + exprItem.u + ', ' + exprItem.v + ')'
        if (ansItem.ans === normalVector) {
          feedback.value = {
            type: 'error',
            text: 'Bijna! Je hebt de normaalvector (u, v) geselecteerd. Maar we zoeken de <strong>richtingsvector</strong>. Die is (v, -u), niet (u, v). De normaalvector staat loodrecht op de rechte, de richtingsvector ligt erlangs.<br><br>' + getHint()
          }
        } else {
          feedback.value = {
            type: 'error',
            text: 'Niet helemaal... Die koppeling klopt niet. ' + getHint()
          }
        }
      } else {
        feedback.value = {
          type: 'error',
          text: 'Niet helemaal... Die koppeling klopt niet. ' + getHint()
        }
      }
      selectedExpr.value = null
      selectedAns.value = null
    }
  }
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false
  showWhy.value = false
  whyText.value = ""
  errorDetected.value = ""
  celebrationDone.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: '' }
  matchedPairs.value = []
  selectedExpr.value = null
  selectedAns.value = null
  showPrediction.value = true
  predictionDone.value = false
  showReflection.value = false
  reflectAns.value = ''
  reflectDone.value = false
  expressions.value = [...currentLevel.value.pairs].sort(() => Math.random() - 0.5)
  answers.value = [...currentLevel.value.pairs].sort(() => Math.random() - 0.5)
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
                <span class="font-bold text-amber-800">Voorspel eerst!</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Voor een rechte <strong>2x + 3y - 6 = 0</strong>:<br>
                Wat is de <strong>normaalvector</strong> en wat is de <strong>richtingsvector</strong>?
              </p>
              <div class="text-xs text-amber-700 mb-3 p-2 bg-white rounded border border-amber-200">
                <p>Normaalvector (u, v) = (2, 3) &larr; rechte uit de vergelijking</p>
                <p>Richtingsvector (v, -u) = (3, -2) &larr; loodrecht op normaal</p>
              </div>
              <p class="text-xs text-amber-700 mb-3">
                Klik op "Begrepen" om te starten met oefenen.
              </p>
              <button @click="submitPrediction"
                      class="px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Begrepen
              </button>
            </div>

            <!-- WORKED EXAMPLE -->
            <div v-if="predictionDone && !showPrediction && !showReflection && !isCorrect" class="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-2">
                <PhLightbulb weight="fill" class="w-5 h-5 text-amber-500" />
                <span class="font-bold text-amber-700 text-sm">Voorbeeld: omzetting</span>
              </div>
              <p class="text-xs text-amber-700 leading-relaxed">
                3x - 4y + 12 = 0<br>
                Normaalvector n = (3, -4)<br>
                Richtingsvector r = (v, -u) = (-4, -3) <span class="text-slate-500">of (4, 3) (een veelvoud)</span><br>
                <span class="font-bold">Van cartesisch naar vectorieel:</span><br>
                Een punt vinden: y=0 → 3x+12=0 → x=-4, dus punt P(-4, 0)<br>
                Vectorieel: (x, y) = (-4, 0) + k·(4, 3)
              </p>
            </div>

            <!-- REFLECTION -->
            <div v-if="showReflection && !reflectDone" class="p-5 border-2 border-amber-300 bg-amber-50 rounded-xl mb-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3">
                <PhQuestion weight="fill" class="w-5 h-5 text-amber-600" />
                <span class="font-bold text-amber-800">Waarom?</span>
              </div>
              <p class="text-sm text-amber-800 mb-3">
                Waarom zijn er verschillende vormen voor een rechte (cartesisch, vectorieel, parameter)?<br>
                <span class="text-xs text-slate-500">Welk voordeel heeft elke vorm?</span>
              </p>
              <textarea v-model="reflectAns" rows="2"
                        class="w-full p-3 text-sm border-2 border-amber-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
                        placeholder="De cartesische vorm is handig voor..."></textarea>
              <button @click="submitReflection" :disabled="reflectAns.trim().length === 0"
                      class="mt-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig
              </button>
            </div>

            <!-- Level info -->
            <div class="p-4 border-t border-slate-200 bg-slate-50 rounded-xl">
              <p class="text-xs font-bold text-slate-500 mb-2">Gekoppeld: {{ matchedPairs.length }} / {{ currentLevel.pairs.length }}</p>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full transition-all" :style="`width: ${(matchedPairs.length / currentLevel.pairs.length) * 100}%`"></div>
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

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid">

              <div class="flex w-full max-w-4xl gap-12 justify-center">

                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Cartesische Verg.</h4>
                  <button v-for="item in expressions" :key="'expr-'+item.id"
                          @click="selectExpr(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="{
                            'border-amber-400 bg-amber-50 text-amber-700 opacity-50': matchedPairs.includes(item.id),
                            'border-amber-500 ring-4 ring-amber-200': selectedExpr === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-slate-300': selectedExpr !== item.id && !matchedPairs.includes(item.id)
                          }">
                    {{ item.expr }}
                  </button>
                </div>

                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Richtingsvector</h4>
                  <button v-for="item in answers" :key="'ans-'+item.id"
                          @click="selectAns(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                          :class="{
                            'border-amber-400 bg-amber-50 text-amber-700 opacity-50': matchedPairs.includes(item.id),
                            'border-amber-500 ring-4 ring-amber-200': selectedAns === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-slate-300': selectedAns !== item.id && !matchedPairs.includes(item.id)
                          }">
                    {{ item.ans }}
                  </button>
                </div>

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
