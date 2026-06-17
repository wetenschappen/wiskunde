<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLightning, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Zoek het Tegenvoorbeeld' },
  instruction: {
    type: String,
    default: 'Bewijs dat de bewering VALS is. Zoek een getal dat wél voldoet aan de voorwaarde (links van de pijl), maar NIET aan de conclusie (rechts van de pijl). Klik op dat getal.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const attemptCount = ref(0)
const feedback = ref({ type: 'info', text: 'Selecteer een getal op de getallenas.' })

// Levels Definition
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel(index) {
  const numbers = Array.from({length: 21}, (_, i) => i - 10)
  switch (index) {
    case 0: {
      const perfectSquares = [4, 9, 16, 25, 36, 49, 64, 81, 100]
      const sq = perfectSquares[Math.floor(Math.random() * perfectSquares.length)]
      const posRoot = Math.round(Math.sqrt(sq))
      const negRoot = -posRoot
      const ruleHTML = `x² = ${sq} <span class="text-amber-400">⇒</span> x = ${posRoot}`
      return {
        ruleHTML,
        validate: (x) => (x * x === sq) && (x !== posRoot),
        hintCond: `Je getal in het kwadraat is geen ${sq}. Het tegenvoorbeeld moet wél aan x² = ${sq} voldoen!`,
        hintConc: `Klopt, dat is ${posRoot}. Maar dit BEVESTIGT zijn theorie! Zoek een ANDER getal waarvan het kwadraat ook ${sq} is.`,
        success: `BAM! (${negRoot})² is OOK ${sq}! De uitspraak was dus vals, x hoeft niet per se ${posRoot} te zijn.`
      }
    }
    case 1: {
      const divisors = [[2, 2], [2, 3], [3, 2]]
      const pair = divisors[Math.floor(Math.random() * divisors.length)]
      const d = pair[0]
      const k = pair[1]
      const product = d * k
      const ruleHTML = `x is deelbaar door ${d} <span class="text-amber-400">⇒</span> x is deelbaar door ${product}`
      return {
        ruleHTML,
        validate: (x) => (x % d === 0) && (x % product !== 0),
        hintCond: `Je hebt een getal gekozen dat niet deelbaar is door ${d}. Een tegenvoorbeeld moet wél deelbaar zijn door ${d}.`,
        hintConc: `Dit getal is inderdaad deelbaar door ${product}. Dit is een BEVESTIGING, geen tegenvoorbeeld. Zoek een getal dat wél deelbaar is door ${d} maar NIET door ${product}.`,
        success: `BAM! Dit getal is deelbaar door ${d}, maar NIET door ${product}. De stelling is vals!`
      }
    }
    case 2: {
      const threshold = Math.floor(Math.random() * 8) // 0 to 7
      const targetNum = threshold + 1
      const minCondition = threshold
      const ruleHTML = `x > ${threshold} <span class="text-amber-400">⇒</span> x ≥ ${threshold + 2}`
      return {
        ruleHTML,
        validate: (x) => (x > threshold) && (x < threshold + 2),
        hintCond: `Dit getal is niet groter dan ${threshold}. Het moet wel > ${threshold} zijn om te beginnen.`,
        hintConc: `Dit getal is groter of gelijk aan ${threshold + 2}. Dit is een BEVESTIGING. Zoek een getal dat wél > ${threshold} is, maar kleiner dan ${threshold + 2}.`,
        success: `BAM! Het getal ${targetNum} is strikt groter dan ${threshold}, maar is NIET groter of gelijk aan ${threshold + 2}. Stelling ontkracht!`
      }
    }
    default:
      return { ruleHTML: 'x² = 36 ⇒ x = 6', validate: (x) => (x * x === 36) && (x !== 6), hintCond: 'Kwadraat is geen 36.', hintConc: 'Dat is 6. Zoek de andere wortel.', success: 'BAM! (-6)² is ook 36!' }
  }
}

const levels = ref([
  generateLevel(0),
  generateLevel(1),
  generateLevel(2)
])

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const numbers = Array.from({length: 21}, (_, i) => i - 10) // -10 to 10
const selectedNumber = ref(null)

const ruleShattered = ref(false)

function selectNumber(num) {
    if (isCorrect.value) return;
    selectedNumber.value = num;
    checkAnswer();
}

function checkAnswer() {
  isChecked.value = true;
  const num = selectedNumber.value;
  const target = currentLevelData.value;

  if (target.validate(num)) {
    isCorrect.value = true
    ruleShattered.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: target.success
    }
  } else {
    isCorrect.value = false
    ruleShattered.value = false
    attemptCount.value++

    // Determine premise vs conclusion failure
    let passesPremise = false;
    // Generic premise check based on the rule structure
    // We can extract premise from validate: it checks (premise) && (not conclusion)
    // So we re-check premise part separately
    const idx = currentInternalLevel.value
    if (idx === 0) passesPremise = (num * num === (Math.round(Math.sqrt(parseInt(currentLevelData.value.ruleHTML.match(/x² = (\d+)/)[1])))) ** 2)
    else if (idx === 1) {
      const dMatch = currentLevelData.value.ruleHTML.match(/deelbaar door (\d+)/)
      const d = dMatch ? parseInt(dMatch[1]) : 2
      passesPremise = (num % d === 0)
    }
    else if (idx === 2) {
      const tMatch = currentLevelData.value.ruleHTML.match(/x > (-?\d+)/)
      const t = tMatch ? parseInt(tMatch[1]) : 0
      passesPremise = (num > t)
    }

    const hintIdx = Math.min(attemptCount.value - 1, 2)
    const vagueHints = [
      'Kijk goed naar de bewering. Wat staat er links van de pijl? Wat rechts?',
      'Links staat de voorwaarde, rechts de conclusie. Zoek een getal dat links past maar rechts niet.',
      `Probeer ${currentLevelData.value.ruleHTML.replace(/<[^>]+>/g, '').replace('⇒', '→')} — welk getal past bij links maar breekt rechts?`
    ]

    if (!passesPremise) {
      feedback.value = { type: 'error', text: attemptCount.value <= 1 ? target.hintCond : vagueHints[hintIdx] }
    } else {
      feedback.value = { type: 'error', text: attemptCount.value <= 1 ? target.hintConc : vagueHints[hintIdx] }
    }
  }
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Selecteer een getal op de getallenas.' };
    selectedNumber.value = null;
    ruleShattered.value = false;
    levels.value = [
      generateLevel(0),
      generateLevel(1),
      generateLevel(2)
    ];
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">

      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-600'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />

          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

              <!-- The Rule to Shatter -->
              <div class="relative mb-24 w-full flex flex-col items-center">

                  <div :key="currentInternalLevel" class="bg-slate-800 border-2 border-slate-600 px-8 py-6 rounded-3xl shadow-2xl relative z-10 transition-all duration-700 ease-in-out animate-fadeIn"
                       :class="ruleShattered ? 'opacity-30 scale-110 filter blur-sm rotate-3' : 'opacity-100 scale-100'">
                      <p class="text-xl text-slate-400 font-bold uppercase tracking-widest mb-2 text-center">Bewering</p>
                      <h1 class="text-2xl md:text-4xl font-black text-center text-white font-mono" v-html="currentLevelData.ruleHTML">
                      </h1>
                  </div>

                  <!-- Shatter lines when rule is broken -->
                  <div v-if="ruleShattered" class="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                      <div class="w-full max-w-xl h-2 bg-amber-400 rotate-12 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]"></div>
                      <div class="absolute w-full max-w-xl h-2 bg-amber-400 -rotate-6 transform scale-150 animate-slash shadow-[0_0_20px_#fbbf24]" style="animation-delay: 0.1s"></div>
                  </div>
              </div>

              <!-- Interactive Number Line -->
              <div class="w-full max-w-4xl relative px-8 pb-12 transition-opacity" :class="ruleShattered ? 'opacity-50 pointer-events-none' : 'opacity-100'">

                  <div class="absolute left-8 right-8 top-8 h-2 bg-slate-600 rounded-full z-0"></div>

                  <div class="flex justify-between relative z-10">
                      <button v-for="num in numbers" :key="num"
                              @click="selectNumber(num)"
                              class="relative flex flex-col items-center group outline-none">

                          <!-- The Tick Point -->
                          <div class="w-4 h-4 rounded-full border-4 border-slate-800 transition-all z-20"
                               :class="{
                                   'bg-slate-400 group-hover:bg-amber-400 group-hover:scale-150': selectedNumber !== num,
                                   'bg-emerald-500 border-emerald-200 scale-150 shadow-[0_0_15px_#10b981]': isCorrect && selectedNumber === num,
                                   'bg-red-500 border-red-200 scale-150 shadow-[0_0_15px_#ef4444] animate-shake': !isCorrect && selectedNumber === num
                               }">
                          </div>

                          <!-- The Number Label -->
                          <span class="absolute top-8 font-bold font-mono transition-colors text-sm"
                                :class="selectedNumber === num ? (isCorrect ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500 group-hover:text-amber-400'">
                              {{ num }}
                          </span>

                      </button>
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash {
    animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    transform-origin: center;
}
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1;}
    100% { transform: scaleX(1); opacity: 0.8;}
}
</style>
