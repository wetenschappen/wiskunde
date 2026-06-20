<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhXCircle, PhLightbulb, PhTrophy,
  PhArrowClockwise, PhFunction
} from '@phosphor-icons/vue'
import MathGraphSvg from './MathGraphSvg.vue'
import { processMathText } from '../../composables/useMathEngine.js'

// ─── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  isOpen:      { type: Boolean },
  title:       { type: String,  default: 'Wiskundige Invuloefening' },
  instruction: { type: String,  default: 'Vul de juiste waarden in op basis van de context.' },

  /**
   * context: optional visual anchor shown on the left panel.
   *
   * { type: 'graph',    config: { functions, domain, range, points, segments } }
   * { type: 'equation', content: '\\( ... \\)'  }
   * { type: 'table',    headers: ['x','f(x)'],  rows: [[-2,1],[-1,3],[0,5]] }
   * { type: 'text',     content: 'Beschrijving of definitie...' }
   *
   * Omit / null → single-column layout (questions only).
   */
  context: { type: Object, default: null },

  /**
   * questions: [{ sentence, answer, altAnswers?, hint? }]
   *
   * sentence: plain text with ___ as blank placeholder.
   *           Supports \( ... \) math anywhere.
   * answer:   correct answer (string or number).
   * altAnswers: extra accepted values (array, optional).
   * hint:     shown when student clicks "Hint" (optional).
   */
  questions: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'complete'])

// ─── State ──────────────────────────────────────────────────────────────────
const currentIndex = ref(0)
const userInput    = ref('')
const feedback     = ref(null)   // 'correct' | 'incorrect' | null
const showHint     = ref(false)
const results      = ref([])
const isComplete   = ref(false)
const attempts     = ref(0)

// ─── Computed ────────────────────────────────────────────────────────────────
const currentQ = computed(() => props.questions[currentIndex.value] ?? {})

const progressPercent = computed(() =>
  props.questions.length
    ? Math.round((currentIndex.value / props.questions.length) * 100)
    : 0
)

const hasContext = computed(() => !!props.context)

// ─── Math helpers ────────────────────────────────────────────────────────────
function m(text) {
  return processMathText(String(text ?? ''))
}

/** Split 'Abc ___ xyz' → { before, after } with math rendered */
function parseSentence(sentence) {
  const parts = (sentence ?? '').split('___')
  return { before: m(parts[0] ?? ''), after: m(parts[1] ?? '') }
}

// ─── Logic ───────────────────────────────────────────────────────────────────
function normalise(v) {
  return String(v ?? '').trim().toLowerCase().replace(',', '.')
}

function checkAnswer() {
  if (feedback.value === 'correct' || !userInput.value.trim()) return
  attempts.value++

  const user    = normalise(userInput.value)
  const correct = normalise(currentQ.value.answer)
  const alts    = (currentQ.value.altAnswers ?? []).map(normalise)

  if (user === correct || alts.includes(user)) {
    feedback.value = 'correct'
    results.value.push({ correct: true })
    setTimeout(moveNext, 1100)
  } else {
    feedback.value = 'incorrect'
    setTimeout(() => { feedback.value = null; userInput.value = '' }, 1000)
  }
}

function moveNext() {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++
    userInput.value = ''
    feedback.value  = null
    showHint.value  = false
  } else {
    isComplete.value = true
    emit('complete')
  }
}

function resetActivity() {
  currentIndex.value = 0
  userInput.value    = ''
  feedback.value     = null
  showHint.value     = false
  results.value      = []
  isComplete.value   = false
  attempts.value     = 0
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
watch(() => props.isOpen, val => { if (val) resetActivity() })

function handleKeydown(e) {
  if (!props.isOpen) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Enter' && !isComplete.value) checkAnswer()
}

onMounted(()  => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center font-sans">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>

    <div class="relative bg-white shadow-2xl flex flex-col w-screen h-screen" @click.stop>

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="shrink-0 bg-brand-dark px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3 text-white">
          <div class="bg-white/10 p-2 rounded-lg">
            <PhFunction weight="bold" class="text-xl" />
          </div>
          <div>
            <h3 class="text-base font-bold m-0 leading-tight">{{ title }}</h3>
            <p class="text-xs text-white/60 m-0">{{ instruction }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="text-white/50 hover:text-white p-2 rounded-full transition-colors">
          <PhX class="text-2xl" />
        </button>
      </header>

      <!-- ── Progress bar ────────────────────────────────────────────────── -->
      <div class="shrink-0 h-1 bg-slate-200">
        <div class="h-full bg-amber-500 transition-all duration-500"
             :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- ── Body ────────────────────────────────────────────────────────── -->
      <div class="flex flex-1 overflow-hidden">

        <!-- LEFT — Math context panel (optional) -->
        <div v-if="hasContext"
             class="w-2/5 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">

          <!-- Graph -->
          <template v-if="context.type === 'graph'">
            <div class="flex-1 flex items-center justify-center p-6">
              <MathGraphSvg :config="context.config" class="w-full h-full" />
            </div>
          </template>

          <!-- Equation -->
          <template v-else-if="context.type === 'equation'">
            <div class="flex-1 flex items-center justify-center p-10">
              <div class="text-3xl text-slate-800 text-center leading-relaxed" v-html="m(context.content)"></div>
            </div>
          </template>

          <!-- Table -->
          <template v-else-if="context.type === 'table'">
            <div class="flex-1 flex items-center justify-center p-8">
              <table class="w-full border-collapse text-sm font-mono">
                <thead>
                  <tr>
                    <th v-for="h in context.headers" :key="h"
                        class="bg-slate-800 text-white px-4 py-2 text-center font-bold"
                        v-html="m(h)"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in context.rows" :key="ri"
                      class="border-b border-slate-200"
                      :class="ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'">
                    <td v-for="(cell, ci) in row" :key="ci"
                        class="px-4 py-2 text-center text-slate-700"
                        v-html="m(String(cell))"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Text / definition -->
          <template v-else-if="context.type === 'text'">
            <div class="flex-1 flex items-center justify-center p-10">
              <div class="text-slate-700 text-base leading-relaxed prose max-w-none"
                   v-html="m(context.content)"></div>
            </div>
          </template>

          <!-- Context label -->
          <div class="shrink-0 px-5 py-3 border-t border-slate-200 bg-white">
            <span class="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
              {{ context.label ?? 'Context' }}
            </span>
          </div>
        </div>

        <!-- RIGHT — Questions -->
        <div class="flex-1 flex flex-col overflow-hidden bg-white">

          <!-- Completion screen -->
          <div v-if="isComplete" class="flex-1 flex flex-col items-center justify-center gap-5 px-12 text-center">
            <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <PhTrophy weight="fill" class="text-4xl text-emerald-500" />
            </div>
            <h4 class="text-2xl font-black text-slate-800">Uitstekend!</h4>
            <p class="text-slate-500">
              {{ results.filter(r => r.correct).length }} / {{ questions.length }} correct
              &nbsp;·&nbsp; {{ attempts }} pogingen
            </p>
            <div class="flex gap-3 mt-2">
              <button @click="resetActivity"
                      class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-2 transition-colors">
                <PhArrowClockwise weight="bold" /> Opnieuw
              </button>
              <button @click="emit('close')"
                      class="px-7 py-2.5 bg-brand-dark hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
                Sluiten
              </button>
            </div>
          </div>

          <!-- Active question -->
          <div v-else class="flex-1 flex flex-col justify-center px-10 py-8 gap-6">

            <!-- Step indicator -->
            <div class="flex items-center gap-2">
              <span class="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
                Vraag {{ currentIndex + 1 }} / {{ questions.length }}
              </span>
              <div class="flex gap-1 ml-2">
                <div v-for="(_, i) in questions" :key="i"
                     class="h-1 rounded-full transition-all duration-300"
                     :class="[
                       i < currentIndex ? 'bg-emerald-400 w-4' :
                       i === currentIndex ? 'bg-amber-500 w-6' : 'bg-slate-200 w-4'
                     ]"></div>
              </div>
            </div>

            <!-- Sentence with inline blank -->
            <div class="text-xl text-slate-800 font-medium leading-relaxed flex flex-wrap items-baseline gap-x-1.5">
              <span v-html="parseSentence(currentQ.sentence).before"></span>

              <!-- Blank — shows typed value or answer on correct -->
              <span
                class="inline-flex items-center min-w-[100px] px-3 py-1 mx-1 rounded-lg border-b-2 font-bold text-center transition-all duration-200"
                :class="
                  feedback === 'correct'   ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                  feedback === 'incorrect' ? 'border-red-400 bg-red-50 text-red-700' :
                                            'border-amber-400 bg-amber-50/50 text-amber-700'
                "
              >
                <PhCheckCircle v-if="feedback === 'correct'"  weight="fill" class="mr-1 shrink-0 text-emerald-500" />
                <PhXCircle    v-if="feedback === 'incorrect'" weight="fill" class="mr-1 shrink-0 text-red-500" />
                <span v-html="feedback === 'correct' ? m(String(currentQ.answer)) : (userInput || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')"></span>
              </span>

              <span v-html="parseSentence(currentQ.sentence).after"></span>
            </div>

            <!-- Input field -->
            <div v-if="feedback !== 'correct'" class="flex gap-3 items-center">
              <input
                v-model="userInput"
                type="text"
                placeholder="Typ je antwoord..."
                autocomplete="off"
                autocapitalize="off"
                :disabled="feedback === 'incorrect'"
                class="flex-1 px-4 py-3 rounded-xl border-2 text-base font-semibold text-slate-800 outline-none transition-all"
                :class="
                  feedback === 'incorrect'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-slate-50 focus:border-amber-400 focus:bg-white'
                "
              />
              <button
                @click="checkAnswer"
                :disabled="!userInput.trim() || !!feedback"
                class="px-6 py-3 bg-brand-dark hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-colors"
              >
                Controleer
              </button>
            </div>

            <!-- Hint -->
            <div class="flex items-center gap-3 h-8">
              <button
                v-if="currentQ.hint && !showHint && feedback !== 'correct'"
                @click="showHint = true"
                class="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                <PhLightbulb weight="fill" /> Hint tonen
              </button>
              <p v-if="showHint"
                 class="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-medium"
                 v-html="m(currentQ.hint)"></p>
            </div>

          </div>

          <!-- Footer counter -->
          <div class="shrink-0 px-10 py-3 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-medium">
            <span>{{ results.filter(r => r.correct).length }} / {{ questions.length }} correct</span>
            <span>{{ attempts }} pogingen</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
