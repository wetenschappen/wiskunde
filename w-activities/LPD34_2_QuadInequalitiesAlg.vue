<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhListNumbers, PhArrowClockwise, PhLightbulb } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Tweedegraadsongelijkheden Algebraïsch' },
  instruction: { type: String, default: 'Los de ongelijkheid algebraïsch op via factorisatie en een tekentabel. Controleer daarna met de grafiek.' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhListNumbers }
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

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevels() {
  // Level 1: simple, a>0, standard form
  const s1 = { a: 1, b: -5, c: 6 }
  s1.r1 = 2; s1.r2 = 3; s1.ineq = '<'; s1.solution = '2 < x < 3'; s1.interval = ']2, 3['

  // Level 2: a<0, need to flip
  const s2 = { a: -1, b: 2, c: 3 }
  s2.r1 = -1; s2.r2 = 3; s2.ineq = '>'; s2.solution = '-1 < x < 3'; s2.interval = ']-1, 3['

  // Level 3: double root or no solution
  const s3 = { a: 1, b: -6, c: 9 }
  s3.r1 = 3; s3.r2 = 3; s3.ineq = '>'; s3.solution = 'x ≠ 3'; s3.interval = ']-∞, 3[ ∪ ]3, +∞['

  return [s1, s2, s3]
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const userRoot1 = ref(0)
const userRoot2 = ref(0)
const userSignLeft = ref('')
const userSignMiddle = ref('')
const userSignRight = ref('')
const userInequality = ref('')

function resetActivityState() {
  levels.value = generateLevels()
  isCorrect.value = false; celebrationDone.value = false; showReflection.value = false; reflectionAnswer.value = ''
  attemptCount.value = 0
  showWorkedExample.value = currentInternalLevel.value === 0
  feedback.value = { type: 'info', text: '' }
  userRoot1.value = 0; userRoot2.value = 0
  userSignLeft.value = ''; userSignMiddle.value = ''; userSignRight.value = ''
  userInequality.value = ''
}

function skipWorkedExample() { showWorkedExample.value = false }

function toggleSign(side) {
  if (isCorrect.value) return
  if (side === 'left') userSignLeft.value = userSignLeft.value === '+' ? '-' : (userSignLeft.value === '-' ? '' : '+')
  else if (side === 'middle') userSignMiddle.value = userSignMiddle.value === '+' ? '-' : (userSignMiddle.value === '-' ? '' : '+')
  else userSignRight.value = userSignRight.value === '+' ? '-' : (userSignRight.value === '-' ? '' : '+')
}

function checkAnswer() {
  attemptCount.value++
  const lvl = currentLevel.value
  const rootsOk = Math.abs(userRoot1.value - lvl.r1) < 0.01 && Math.abs(userRoot2.value - lvl.r2) < 0.01
  
  // Determine correct signs based on a>0 or a<0
  const aPos = lvl.a > 0
  const expectedLeft = aPos ? '+' : '-'
  const expectedMiddle = aPos ? '-' : '+'
  const expectedRight = aPos ? '+' : '-'
  const signsOk = userSignLeft.value === expectedLeft && userSignMiddle.value === expectedMiddle && userSignRight.value === expectedRight
  
  if (rootsOk && signsOk) {
    isCorrect.value = true
    showReflection.value = true
    reflectionAnswer.value = ''
    feedback.value = { type: 'success', text: `Perfect! Oplossing: ${lvl.solution}` }
  } else {
    if (!rootsOk) {
      feedback.value = { type: 'error', text: `Nulwaarden kloppen niet. Los ${lvl.a}x²${lvl.b >= 0 ? '+' : ''}${lvl.b}x${lvl.c >= 0 ? '+' : ''}${lvl.c} = 0 op via discriminant.` }
    } else {
      feedback.value = { type: 'error', text: 'Tekens kloppen niet. Denk aan de grafiek: a>0 = dalparabool (begin +, einde +). a<0 = bergparabool (begin -, einde -).' }
    }
  }
}

function getHint() {
  const lvl = currentLevel.value
  const hints = [
    `Ontbind ${lvl.a}x²${lvl.b >= 0 ? '+' : ''}${lvl.b}x${lvl.c >= 0 ? '+' : ''}${lvl.c} in factoren. Zoek twee getallen die ... opgeteld = ${-lvl.b} en vermenigvuldigd = ${lvl.c}`,
    `Voorbeeld: x²-5x+6 = (x-2)(x-3). Nulwaarden: x=2 en x=3. Tekentabel: +, -, + omdat a>0.`,
    `Nulwaarden: x = ${lvl.r1} en x = ${lvl.r2}. Tekens: links ${expectedLeft}, midden ${expectedMiddle}, rechts ${expectedRight}.`
  ]
  const idx = Math.min(attemptCount.value, 2)
  feedback.value = { type: 'info', text: hints[idx] }
}

function checkReflection() {
  if (reflectionAnswer.value.length > 10) { showReflection.value = false; celebrationDone.value = false }
  else feedback.value = { type: 'info', text: 'Leg uit waarom het teken wisselt bij elke nulwaarde.' }
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
            <p class="font-bold text-amber-800 mb-2">Voorbeeld: x² − 5x + 6 &lt; 0</p>
            <p class="text-sm text-slate-700 mb-1"><strong>1.</strong> Ontbind: (x−2)(x−3) = 0 → nulwaarden x=2 en x=3</p>
            <p class="text-sm text-slate-700 mb-1"><strong>2.</strong> Tekentabel: a=1&gt;0 (dalparabool dus +,−,+)</p>
            <p class="text-sm text-slate-700 mb-1"><strong>3.</strong> Gevraagd: &lt; 0 (negatief) dus oplossing: ]2, 3[</p>
            <p class="text-xs text-slate-500 mt-1">Altijd controleren met een snelle grafiekschets!</p>
            <button @click="skipWorkedExample" class="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700 underline">Begrepen, start →</button>
          </div>

          <div v-if="!showWorkedExample" class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-4 animate-fadeIn">
            <p class="font-mono text-lg font-black text-slate-800">{{ currentLevel.a }}x²{{ currentLevel.b >= 0 ? '+' : ''}}{{ currentLevel.b }}x{{ currentLevel.c >= 0 ? '+' : ''}}{{ currentLevel.c }} {{ currentLevel.ineq }} 0</p>
          </div>

          <div v-if="!showWorkedExample" class="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
            <div class="grid grid-cols-2 gap-2">
              <div><label class="block text-xs font-bold text-slate-700 mb-1">Nulwaarde 1</label><input type="number" step="0.5" v-model.number="userRoot1" class="w-full p-2 text-lg font-bold border-2 border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 tabular-nums" /></div>
              <div><label class="block text-xs font-bold text-slate-700 mb-1">Nulwaarde 2</label><input type="number" step="0.5" v-model.number="userRoot2" class="w-full p-2 text-lg font-bold border-2 border-slate-300 rounded-lg bg-white outline-none focus:border-amber-500 tabular-nums" /></div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Tekenschema (klik ± om te wisselen):</label>
              <table class="w-full border-collapse text-center">
                <tr>
                  <td class="border border-slate-200 p-1 text-xs font-bold text-slate-500 w-16">x</td>
                  <td class="border border-slate-200 p-2"></td>
                  <td class="border border-slate-200 p-1 font-mono font-bold">{{ userRoot1 }}</td>
                  <td class="border border-slate-200 p-2"></td>
                  <td class="border border-slate-200 p-1 font-mono font-bold">{{ userRoot2 }}</td>
                  <td class="border border-slate-200 p-2"></td>
                </tr>
                <tr>
                  <td class="border border-slate-200 p-1 text-xs font-bold text-slate-500">f(x)</td>
                  <td><button @click="toggleSign('left')" class="w-8 h-8 bg-slate-100 rounded border border-slate-300 font-mono font-bold hover:bg-slate-200">{{ userSignLeft || '±' }}</button></td>
                  <td class="text-amber-600 font-bold bg-amber-50">0</td>
                  <td><button @click="toggleSign('middle')" class="w-8 h-8 bg-slate-100 rounded border border-slate-300 font-mono font-bold hover:bg-slate-200">{{ userSignMiddle || '±' }}</button></td>
                  <td class="text-amber-600 font-bold bg-amber-50">0</td>
                  <td><button @click="toggleSign('right')" class="w-8 h-8 bg-slate-100 rounded border border-slate-300 font-mono font-bold hover:bg-slate-200">{{ userSignRight || '±' }}</button></td>
                </tr>
              </table>
            </div>

            <button @click="getHint" class="w-full py-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-[0.98] flex items-center justify-center gap-2">
              <PhLightbulb class="w-4 h-4" /> Hint
            </button>
            <button @click="checkAnswer" class="w-full py-3 font-bold text-white rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-[0.98] shadow-md">Controleer</button>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 text-sm mb-1">Waarom werkt dit?</p>
            <p class="text-xs text-indigo-700 leading-relaxed">Elke tweedegraadsfunctie f(x)=ax²+bx+c is een parabool. De nulwaarden zijn waar de parabool de x-as snijdt. Daartussen heeft f(x) het tegengestelde teken van daarbuiten. Bij a&gt;0 (dalparabool) is f(x) negatief tussen de nulwaarden. Bij a&lt;0 (bergparabool) is f(x) positief tussen de nulwaarden. De tekentabel vat dit visueel samen.</p>
          </div>

          <div v-if="showReflection" class="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400 animate-fadeIn">
            <p class="font-bold text-indigo-800 mb-2 text-sm">Reflectie:</p>
            <p class="text-xs text-indigo-700 mb-2">Waarom is een snelle grafische controle nuttig na het algebraïsch oplossen?</p>
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
          <svg width="400" height="300" viewBox="-3 -3 6 6" class="bg-white rounded-xl shadow-md border border-slate-200">
            <g stroke="#e2e8f0" stroke-width="0.05">
              <line v-for="i in 13" :key="'v'+i" :x1="i-7" y1="-3" :x2="i-7" y2="3" />
              <line v-for="i in 13" :key="'h'+i" x1="-3" :y1="i-7" x2="3" :y2="i-7" />
            </g>
            <line x1="-3" y1="0" x2="3" y2="0" stroke="#64748b" stroke-width="0.05" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#64748b" stroke-width="0.05" />
            <path :d="`M -3 ${-(currentLevel.a * 9 + currentLevel.b * -3 + currentLevel.c)} Q 0 ${-currentLevel.c} 3 ${-(currentLevel.a * 9 + currentLevel.b * 3 + currentLevel.c)}`" fill="none" stroke="#d97706" stroke-width="0.1" />
          </svg>
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
