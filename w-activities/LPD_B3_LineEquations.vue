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
const shouldPulse = ref(false)

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

function formatExpr(u, v, w) {
  // Format ux + vy + w = 0 nicely, handling special cases (0, ±1 coefficients)
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

  // Add special cases (horizontal/vertical lines) first for variety
  const specials = [
    { u: 0, v: 1, w: -3, label: 'y = 3', dirLabel: '(1, 0)' },
    { u: 1, v: 0, w: 2, label: 'x = -2', dirLabel: '(0, 1)' }
  ]

  // Always include at least y=3 in level 0 for a simpler example
  if (lvl === 0) {
    // Simple pairs with small coefficients
    const basePairs = [
      { u: 2, v: 3, w: -6 },
      { u: 0, v: 1, w: -3, label: 'y = 3', dirLabel: '(1, 0)' }
    ]
    for (const bp of basePairs) {
      const dir = bp.dirLabel || formatDir(bp.u, bp.v)
      pairs.push({
        id: pairs.length + 1,
        expr: bp.label || formatExpr(bp.u, bp.v, bp.w),
        ans: dir
      })
      usedDirs.add(dir)
    }
  } else {
    // Random generation with rejection for duplicates
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
      pairs.push({ id: pairs.length + 1, expr, ans: dir })
    }

    // If we didn't generate enough, add some hardcoded extras
    const extras = specials.filter(s => !usedDirs.has(s.dirLabel))
    while (pairs.length < count && extras.length > 0) {
      const e = extras.shift()
      pairs.push({ id: pairs.length + 1, expr: e.label, ans: e.dirLabel })
    }
  }

  return {
    name: lvl === 0 ? 'Basis' : lvl === 1 ? 'Toepassing' : 'Uitdaging',
    description: lvl === 0 ? 'Eenvoudige koppelingen.' : lvl === 1 ? 'Verschillende co&euml;ffici&euml;nten.' : 'Complexe vergelijkingen en speciale gevallen.',
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

function getHint() {
  const c = attemptCount.value
  if (c === 1) return 'Hint: Onthoud de regel: voor ux + vy + w = 0 is de richtingsvector (v, -u).'
  if (c === 2) return 'Hint: Als de vergelijking y = c is (horizontaal), dan is u=0, dus richtingsvector = (1, 0). Bij x = c (verticaal) is v=0, dus (0, 1).'
  return 'Hint: Schrijf de vergelijking in de vorm ux + vy + w = 0. Lees u en v af. Richtingsvector = (v, -u). Let op tekens!'
}

function selectExpr(item) {
  if (matchedPairs.value.includes(item.id)) return;
  if (selectedExpr.value === item.id) {
    selectedExpr.value = null;
  } else {
    selectedExpr.value = item.id;
    checkMatch();
  }
}

function selectAns(item) {
  if (matchedPairs.value.includes(item.id)) return;
  if (selectedAns.value === item.id) {
    selectedAns.value = null;
  } else {
    selectedAns.value = item.id;
    checkMatch();
  }
}

function checkMatch() {
  if (selectedExpr.value !== null && selectedAns.value !== null) {
    if (selectedExpr.value === selectedAns.value) {
      matchedPairs.value.push(selectedExpr.value);
      selectedExpr.value = null;
      selectedAns.value = null;

      if (matchedPairs.value.length === currentLevel.value.pairs.length) {
        // Auto-correct: all matched, no Controleer needed
        isCorrect.value = true
        isChecked.value = true
        feedback.value = {
          type: 'success',
          text: 'Uitstekend! Je kan de richtingsvector aflezen uit een cartesische vergelijking.'
        }
      }
    } else {
      attemptCount.value++
      selectedExpr.value = null;
      selectedAns.value = null;
      feedback.value = {
        type: 'error',
        text: 'Die koppeling klopt niet. Probeer opnieuw.<br/><br/>' + getHint()
      }
    }
  }
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  matchedPairs.value = [];
  selectedExpr.value = null;
  selectedAns.value = null;
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
    nextTick(() => mainArea.value?.focus())
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <!-- Level indicator -->
          <div class="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <div v-for="(level, i) in levels" :key="i"
                 class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                 :class="i === currentInternalLevel ? 'bg-emerald-500 ring-2 ring-emerald-200 scale-125' : i < currentInternalLevel ? 'bg-emerald-300' : 'bg-slate-300'">
            </div>
            <span class="text-xs font-bold text-emerald-700 ml-1.5 uppercase">{{ currentLevel.name }}</span>
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <p class="mb-2 text-xs font-semibold text-emerald-600">Level {{ currentInternalLevel + 1 }} &mdash; {{ currentLevel.name }}</p>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
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

              <!-- No Controleer button: auto-correct on match completion -->
              <button v-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid">

              <div class="flex w-full max-w-4xl gap-12 justify-center">

                <!-- Expressions -->
                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Cartesische Verg.</h4>
                  <button v-for="item in expressions" :key="'expr-'+item.id"
                          @click="selectExpr(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center"
                          :class="{
                            'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-50': matchedPairs.includes(item.id),
                            'border-indigo-500 ring-4 ring-indigo-100': selectedExpr === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-indigo-300': selectedExpr !== item.id && !matchedPairs.includes(item.id)
                          }">
                    {{ item.expr }}
                  </button>
                </div>

                <!-- Answers -->
                <div class="flex flex-col gap-4 w-1/2 max-w-xs">
                  <h4 class="text-center font-bold text-slate-500 mb-2">Richtingsvector</h4>
                  <button v-for="item in answers" :key="'ans-'+item.id"
                          @click="selectAns(item)"
                          :disabled="matchedPairs.includes(item.id)"
                          class="p-4 text-xl font-bold bg-white rounded-xl shadow-sm border-2 transition-all text-center"
                          :class="{
                            'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-50': matchedPairs.includes(item.id),
                            'border-amber-500 ring-4 ring-amber-100': selectedAns === item.id && !matchedPairs.includes(item.id),
                            'border-slate-200 hover:border-amber-300': selectedAns !== item.id && !matchedPairs.includes(item.id)
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
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
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
