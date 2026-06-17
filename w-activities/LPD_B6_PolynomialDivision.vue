<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhMathOperations,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Reststelling bij Veeltermen'
  },
  instruction: {
    type: String,
    default: 'Gebruik de reststelling om de rest te bepalen als je veelterm P(x) deelt door de deler d(x). Tip: De rest is gelijk aan P(a) als d(x) = x - a.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhMathOperations }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
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
  let coeffRanges, correctA, correctRest, pItems, dExpr, displayParts

  if (lvl === 0) {
    // Level 1: simple linear: P(x) = ax² + bx + c, divisor x ± k
    // Rest = a*k² + b*k + c
    const k = randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)
    const a = randInt(1, 3)
    const b = randInt(-3, 3)
    const c = randInt(-3, 3)
    correctA = -k // if d(x) = x + k then a = -k
    dExpr = 'x ' + (k >= 0 ? '+ ' + k : '- ' + Math.abs(k))
    correctRest = a * correctA * correctA + b * correctA + c
    const signB = b >= 0 ? '+' : '-'
    const signC = c >= 0 ? '+' : '-'
    pItems = [
      { coeff: a, power: 2 },
      (b !== 0 ? { coeff: Math.abs(b), power: 1, sign: signB } : null),
      (c !== 0 ? { coeff: Math.abs(c), power: 0, sign: signC } : null)
    ].filter(Boolean)
    displayParts = a + '({a})²' + (b >= 0 ? '+' + b : b) + '({a})' + (c >= 0 ? '+' + c : c)
  } else if (lvl === 1) {
    // Level 2: cubic: P(x) = ax³ + bx² + cx + d, divisor x - k
    const k = randInt(2, 4)
    const a = randInt(1, 3)
    const b = randInt(-4, 4)
    const c = randInt(-4, 4)
    const d = randInt(-5, 5)
    correctA = k
    dExpr = 'x - ' + k
    correctRest = a * k * k * k + b * k * k + c * k + d
    const signB = b >= 0 ? '+' : '-'
    const signC = c >= 0 ? '+' : '-'
    const signD = d >= 0 ? '+' : '-'
    pItems = [
      { coeff: a, power: 3 },
      (b !== 0 ? { coeff: Math.abs(b), power: 2, sign: signB } : null),
      (c !== 0 ? { coeff: Math.abs(c), power: 1, sign: signC } : null),
      (d !== 0 ? { coeff: Math.abs(d), power: 0, sign: signD } : null)
    ].filter(Boolean)
    displayParts = a + '({a})³' + (b >= 0 ? '+' + b : b) + '({a})²' + (c >= 0 ? '+' + c : c) + '({a})' + (d >= 0 ? '+' + d : d)
  } else {
    // Level 3: harder: P(x) = ax³ + bx² + cx + d or 2x³..., divisor x - k
    const k = randInt(3, 5)
    const a = randInt(2, 4)
    const b = randInt(-5, 5)
    const c = randInt(-5, 5)
    const d = randInt(-7, 7)
    correctA = k
    dExpr = 'x - ' + k
    correctRest = a * k * k * k + b * k * k + c * k + d
    const signB = b >= 0 ? '+' : '-'
    const signC = c >= 0 ? '+' : '-'
    const signD = d >= 0 ? '+' : '-'
    pItems = [
      { coeff: a, power: 3 },
      (b !== 0 ? { coeff: Math.abs(b), power: 2, sign: signB } : null),
      (c !== 0 ? { coeff: Math.abs(c), power: 1, sign: signC } : null),
      (d !== 0 ? { coeff: Math.abs(d), power: 0, sign: signD } : null)
    ].filter(Boolean)
    displayParts = a + '({a})³' + (b >= 0 ? '+' + b : b) + '({a})²' + (c >= 0 ? '+' + c : c) + '({a})' + (d >= 0 ? '+' + d : d)
  }

  // Build polynomial expression string
  function formatPoly(items) {
    return items.map((item, idx) => {
      let s = ''
      if (idx === 0) {
        s = (item.coeff === 1 ? '' : item.coeff === -1 ? '-' : item.coeff) + (item.power > 0 ? 'x' : '')
      } else {
        s = ' ' + item.sign + ' ' + (item.coeff === 1 && item.power > 0 ? '' : item.coeff) + (item.power > 0 ? 'x' : '')
      }
      if (item.power > 1) s += '<sup>' + item.power + '</sup>'
      return s
    }).join('')
  }

  const pExpr = formatPoly(pItems)

  return {
    name: lvl === 0 ? 'Basis' : lvl === 1 ? 'Toepassing' : 'Uitdaging',
    description: lvl === 0 ? 'Eenvoudige lineaire deler.' : lvl === 1 ? 'Derdegraads veelterm met positieve a.' : 'Complexe deler met negatieve co&euml;ffici&euml;nten.',
    p_expr: pExpr,
    d_expr: dExpr,
    correctA,
    correctRest,
    displayFormula: displayParts
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

const userA = ref('')
const userRest = ref('')

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Als d(x) = x - a, dan is de rest = P(a). Zoek eerst a uit d(x).'
  if (c === 2) return 'Hint: d(x) = ' + currentLevel.value.d_expr + ', dus a = ' + currentLevel.value.correctA + '. Vul dit in in P(x) om de rest te vinden.'
  return 'Hint: a = ' + currentLevel.value.correctA + '. Bereken P(' + currentLevel.value.correctA + ') door ' + String(currentLevel.value.correctA) + ' in te vullen in P(x).'
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userA.value = '';
  userRest.value = '';
}

function checkAnswer() {
  isChecked.value = true;
  const a = parseInt(userA.value)
  const rest = parseInt(userRest.value)

  if (a === currentLevel.value.correctA && rest === currentLevel.value.correctRest) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Helemaal juist! Omdat je deelt door (' + currentLevel.value.d_expr + '), is de rest gelijk aan P(' + currentLevel.value.correctA + ') = ' + currentLevel.value.correctRest + '.'
    }
  } else if (a !== currentLevel.value.correctA) {
    attemptCount.value++
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'De waarde van a klopt niet. Als d(x) = x - a en je hebt ' + currentLevel.value.d_expr + ', wat is dan a?<br/><br/>' + getHint()
    }
  } else {
    attemptCount.value++
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'Je hebt a correct, maar de rest klopt niet. Bereken P(a) door a in te vullen in de veelterm P(x).<br/><br/>' + getHint()
    }
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) {
      emit('update:currentStep', props.currentStep + 1)
    } else {
      emit('complete')
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <!-- Level indicator -->
          <div class="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <div v-for="(level, i) in levels" :key="i"
                 class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                 :class="i === currentInternalLevel ? 'bg-indigo-500 ring-2 ring-indigo-200 scale-125' : i < currentInternalLevel ? 'bg-indigo-300' : 'bg-slate-300'">
            </div>
            <span class="text-xs font-bold text-indigo-700 ml-1.5 uppercase">{{ currentLevel.name }}</span>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <p class="mb-2 text-xs font-semibold text-indigo-600">Level {{ currentInternalLevel + 1 }} &mdash; {{ currentLevel.name }}</p>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm space-y-2">
                <p class="text-indigo-600 font-bold" v-html="'P(x) = ' + currentLevel.p_expr"></p>
                <p class="text-slate-600 font-bold">d(x) = {{ currentLevel.d_expr }}</p>
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">1. Wat is a?</label>
                <input type="number" v-model="userA"
                       class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                       placeholder="a = ?">
              </div>

              <div>
                <label class="block mb-2 text-sm font-bold text-slate-700">2. Wat is de rest (R)?</label>
                <input type="number" v-model="userRest"
                       @keyup.enter="checkAnswer"
                       class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                       placeholder="R = ?">
              </div>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Keep Controleer: number/text input fields -->
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || !userA || !userRest" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden gap-12">

              <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-indigo-200 flex items-center justify-center gap-6 w-full max-w-2xl transform scale-110">
                <div class="font-mono text-3xl font-black text-indigo-700">P(x)</div>
                <div class="text-4xl font-light text-slate-300">/</div>
                <div class="font-mono text-3xl font-black text-slate-700">(x - a)</div>
                <div class="text-4xl font-light text-slate-300">&rarr;</div>
                <div class="font-mono text-3xl font-black text-emerald-600">Rest = P(a)</div>
              </div>

              <!-- Calculation hint box -->
              <div v-if="userA" class="bg-white p-6 rounded-xl shadow-md border border-slate-200 text-center animate-fadeIn w-full max-w-lg">
                <p class="font-bold text-slate-500 mb-2">Berekening:</p>
                <p class="font-mono text-xl text-slate-800">
                  P(<span class="text-indigo-600 font-bold">{{ userA }}</span>) =
                  {{ currentLevel.displayFormula.replace(/\{a\}/g, userA) }}
                </p>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  </div>
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>