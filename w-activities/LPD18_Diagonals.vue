<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGraph, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Diagonalen van Vierhoeken' },
  instruction: { type: String, default: 'Stel de 3 eigenschappen van diagonalen in om de juiste vierhoek te maken. Denk eerst na over welke combinatie de gevraagde vorm geeft.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhGraph }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const showWorkedExample = ref(true)
const showPrediction = ref(true)
const predictedAnswer = ref('')

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']
const levels = ref([])

const isPerp = ref(false)
const isBisect = ref(false)
const isEqual = ref(false)

const currentShape = computed(() => {
  if (isPerp.value && isBisect.value && isEqual.value) return 'Vierkant'
  if (isPerp.value && isBisect.value && !isEqual.value) return 'Ruit'
  if (!isPerp.value && isBisect.value && isEqual.value) return 'Rechthoek'
  if (!isPerp.value && isBisect.value && !isEqual.value) return 'Parallellogram'
  return 'Andere vierhoek'
})

function generateLevel() {
  return [
    {
      targetShape: 'Rechthoek',
      rules: { perp: false, bisect: true, equal: true },
      goalText: 'Maak een RECHTHOEK (geen vierkant)',
      hint: 'Rechthoek: diagonalen even lang + delen middendoor. Ze staan NIET loodrecht.',
      hint2: 'Zet de schakelaars: middendoor = aan, even lang = aan, loodrecht = uit.',
      hint3: 'loodrecht = __, middendoor = __, even lang = __'
    },
    {
      targetShape: 'Ruit',
      rules: { perp: true, bisect: true, equal: false },
      goalText: 'Maak een RUIT (geen vierkant)',
      hint: 'Ruit: diagonalen loodrecht + delen middendoor. Ze zijn NIET even lang.',
      hint2: 'loodrecht = aan, middendoor = aan, even lang = uit.',
      hint3: 'loodrecht = __, middendoor = __, even lang = __'
    },
    {
      targetShape: 'Vierkant',
      rules: { perp: true, bisect: true, equal: true },
      goalText: 'Maak een VIERKANT',
      hint: 'Vierkant: ALLE drie eigenschappen: loodrecht, middendoor én even lang.',
      hint2: 'Het vierkant heeft de meeste regels van alle vierhoeken.',
      hint3: 'loodrecht = __, middendoor = __, even lang = __'
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function resetActivityState() {
  levels.value = generateLevel()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  showPrediction.value = currentInternalLevel.value !== 0
  predictedAnswer.value = ''
  isPerp.value = false; isBisect.value = false; isEqual.value = false
  feedback.value = { type: 'info', text: '' }
}

function skipWorkedExample() {
  showWorkedExample.value = false
  if (currentInternalLevel.value === 0) showPrediction.value = true
}

function checkPrediction() {
  const lvl = currentLevelData.value
  const correct = lvl.targetShape
  if (predictedAnswer.value === correct) {
    showPrediction.value = false
    feedback.value = { type: 'success', text: `Juist! Stel nu de schakelaars in.` }
  } else {
    feedback.value = { type: 'error', text: `Niet correct. Denk aan de drie eigenschappen: loodrecht, middendoor, even lang.` }
  }
}

watch([isPerp, isBisect, isEqual], () => {
  if (isCorrect.value) return
  const lvl = currentLevelData.value
  if (isPerp.value === lvl.rules.perp && isBisect.value === lvl.rules.bisect && isEqual.value === lvl.rules.equal) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Correct! Dit is een ${lvl.targetShape}.` }
  }
})

function checkReflection() {
  const ans = reflectionAnswer.value.toLowerCase()
  const keywords = ['diagonaal', 'loodrecht', 'middendoor', 'even', 'lang', 'eigenschap']
  if (keywords.some(k => ans.includes(k)) && ans.length > 10) {
    showReflection.value = false; celebrationDone.value = false
  } else {
    feedback.value = { type: 'info', text: 'Gebruik termen: loodrecht, middendoor delen, even lang.' }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) }
  else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) { currentInternalLevel.value = 0; resetActivityState(); window.addEventListener('keydown', handleKeydown)
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000); mainArea.value?.focus() })
  } else { shouldPulse.value = false; window.removeEventListener('keydown', handleKeydown) }
}, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => {})
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Achtergrond"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />

          <div v-if="showWorkedExample" class="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400 animate-fadeIn">
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: Welke vierhoek heeft diagonalen die loodrecht staan, elkaar middendoor delen én even lang zijn?</p>
            <p class="text-sm text-slate-700 mb-1">Drie eigenschappen tegelijk? Dat kan alleen bij het <strong>vierkant</strong>.</p>
            <p class="text-sm text-slate-700 mb-1">Rechthoek: even lang + middendoor (niet loodrecht).</p>
            <p class="text-sm text-slate-700 mb-1">Ruit: loodrecht + middendoor (niet even lang).</p>
            <p class="text-sm text-slate-700 mb-1">Parallellogram: enkel middendoor.</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start →</button>
          </div>

          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
            <p class="text-lg font-black text-slate-800 mt-1">Huidige vorm: {{ currentShape }}</p>
          </div>

          <div v-if="showPrediction && !showWorkedExample" class="p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn mb-4">
            <p class="font-bold text-amber-800 text-sm mb-2">Voorspel: welke vierhoek ga je maken?</p>
            <div class="space-y-2">
              <button v-for="s in ['Vierkant', 'Rechthoek', 'Ruit', 'Parallellogram']" :key="s" @click="predictedAnswer = s"
                class="w-full text-left py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                :class="predictedAnswer === s ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-slate-200 bg-white text-slate-600'">{{ s }}</button>
            </div>
            <button v-if="predictedAnswer" @click="checkPrediction" class="w-full mt-3 py-2 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 text-sm active:scale-[0.98]">Bevestig</button>
          </div>

          <div v-if="!showPrediction && !showWorkedExample && !isCorrect" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
            <p class="font-bold text-slate-800 text-sm">Zet de schakelaars:</p>
            <div class="space-y-3">
              <label class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span class="text-sm font-medium text-slate-700">Diagonalen staan loodrecht (⊥)</span>
                <button @click="isPerp = !isPerp" class="w-12 h-6 rounded-full transition-colors" :class="isPerp ? 'bg-amber-500' : 'bg-slate-300'">
                  <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" :class="isPerp ? 'translate-x-7' : 'translate-x-1'"></div>
                </button>
              </label>
              <label class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span class="text-sm font-medium text-slate-700">Diagonalen delen elkaar middendoor</span>
                <button @click="isBisect = !isBisect" class="w-12 h-6 rounded-full transition-colors" :class="isBisect ? 'bg-amber-500' : 'bg-slate-300'">
                  <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" :class="isBisect ? 'translate-x-7' : 'translate-x-1'"></div>
                </button>
              </label>
              <label class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span class="text-sm font-medium text-slate-700">Diagonalen zijn even lang</span>
                <button @click="isEqual = !isEqual" class="w-12 h-6 rounded-full transition-colors" :class="isEqual ? 'bg-amber-500' : 'bg-slate-300'">
                  <div class="w-4 h-4 bg-white rounded-full shadow-sm transition-transform" :class="isEqual ? 'translate-x-7' : 'translate-x-1'"></div>
                </button>
              </label>
            </div>
            <p class="text-xs text-slate-400">Tip: <span class="font-bold text-amber-600">{{ currentLevelData.hint }}</span></p>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom bepalen diagonalen de vierhoek?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Elke combinatie van diagonaal-eigenschappen definieert een specifieke vierhoek. Een vierkant heeft ze alle drie. Een rechthoek heeft "even lang" + "middendoor". Een ruit heeft "loodrecht" + "middendoor". Een parallellogram heeft enkel "middendoor". Geen van deze = een andere vierhoek.</p>
          </div>

          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Welke vierhoeken hebben even lange diagonalen? En waarom?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-2 text-sm border border-indigo-300 rounded-lg bg-white outline-none focus:border-indigo-500 h-16 resize-none" placeholder="Typ je uitleg..."></textarea>
            <button @click="checkReflection" class="w-full mt-2 py-2 text-sm font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]">Bevestig</button>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn border-l-4"
            :class="{ 'bg-emerald-100 text-emerald-800 border-emerald-400': feedback.type === 'success', 'bg-red-100 text-red-800 border-red-400': feedback.type === 'error', 'bg-blue-100 text-blue-800 border-blue-400': feedback.type === 'info' }">
            <component :is="feedback.type === 'success' ? PhCheckCircle : (feedback.type === 'error' ? PhWarningCircle : PhLightbulb)" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span>
          </div>
          <button @click="resetActivityState" class="p-4 text-lg transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] mr-4"><PhArrowClockwise /></button>
          <button v-if="isCorrect && !showReflection" @click="handleNext" class="py-4 px-6 font-bold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
            <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" class="inline ml-1" />
          </button>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-1 p-6 overflow-y-auto items-center justify-center pattern-grid">
          <div class="w-64 h-64 relative">
            <svg viewBox="0 0 200 200" class="w-full h-full">
              <!-- Shape based on current settings -->
              <polygon v-if="currentShape === 'Vierkant'" points="30,30 170,30 170,170 30,170" fill="#fbbf24" fill-opacity="0.2" stroke="#d97706" stroke-width="3" />
              <polygon v-else-if="currentShape === 'Rechthoek'" points="20,50 180,50 180,170 20,170" fill="#fbbf24" fill-opacity="0.2" stroke="#d97706" stroke-width="3" />
              <polygon v-else-if="currentShape === 'Ruit'" points="100,20 180,100 100,180 20,100" fill="#fbbf24" fill-opacity="0.2" stroke="#d97706" stroke-width="3" />
              <polygon v-else-if="currentShape === 'Parallellogram'" points="30,50 170,50 150,170 10,170" fill="#fbbf24" fill-opacity="0.2" stroke="#d97706" stroke-width="3" />
              <polygon v-else points="20,30 180,60 170,170 10,150" fill="#fbbf24" fill-opacity="0.2" stroke="#d97706" stroke-width="3" />
              <!-- Diagonal lines -->
              <line v-if="isBisect || isEqual" x1="30" y1="30" x2="170" y2="170" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3" />
              <line v-if="isEqual || true" x1="170" y1="30" x2="30" y2="170" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3" />
              <!-- Right angle markers -->
              <text v-if="isPerp" x="95" y="95" font-size="12" fill="#f97316" font-weight="bold" text-anchor="middle">⊥</text>
              <!-- Equal length markers -->
              <text v-if="isEqual" x="100" y="185" font-size="10" fill="#64748b" text-anchor="middle">even lang ✓</text>
              <text v-if="isBisect" x="100" y="195" font-size="10" fill="#64748b" text-anchor="middle">middendoor ✓</text>
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
<SuccessCelebration :show="isCorrect && !celebrationDone && !showReflection" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>
<style scoped>
:root { font-family: 'Inter', sans-serif; }
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
