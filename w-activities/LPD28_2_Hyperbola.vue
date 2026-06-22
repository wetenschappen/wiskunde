<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTrendDown, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Omgekeerd Evenredig (f(x) = c/x)' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhTrendDown }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider en bestudeer het effect.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }

const levels = ref([])
function generateLevel(idx) {
  if (idx === 0) return { goalText: 'Positieve hyperbool', q: 'Maak c positief zodat de takken in kwadrant I en III liggen.', checkFn: (c) => c > 0, successMsg: 'Juist! Positieve c = takken in I en III.', startC: -3, targetPoint: null }
  else if (idx === 1) return { goalText: 'Negatieve hyperbool', q: 'Maak c negatief zodat de takken in kwadrant II en IV liggen.', checkFn: (c) => c < 0, successMsg: 'Perfect! Negatieve c = takken in II en IV.', startC: 3, targetPoint: null }
  const tx = randomInt(1,4), ty = randomInt(1,4); const targetC = tx * ty
  return { goalText: 'Het Doelpunt', q: `Zorg dat de hyperbool door (${tx}, ${ty}) gaat.`, checkFn: (c) => c === targetC, successMsg: `Geweldig! c=${targetC}. y = c/x => ${ty} = ${targetC}/${tx}. Klopt!`, startC: 1, targetPoint: { x: tx, y: ty } }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const cValue = ref(1)

const graphPath = computed(() => {
  const pts1 = [], pts2 = []; const c = cValue.value; if (c === 0) return ''
  for (let x = -10; x <= 10; x += 0.2) {
    if (Math.abs(x) < 0.1) continue; let y = c / x; if (Math.abs(y) > 10) continue
    const sx = x * 10, sy = -y * 10
    if (x < 0) pts1.push(`${sx},${sy}`); else pts2.push(`${sx},${sy}`)
  }
  if (pts1.length === 0 || pts2.length === 0) return ''
  return `M ${pts1.join(' L ')} M ${pts2.join(' L ')}`
})

watch(cValue, (newVal) => {
  if (!isCorrect.value && levels.value.length > 0) {
    const t = currentLevelData.value
    if (t && t.checkFn(newVal)) { isCorrect.value = true; feedback.value = { type: 'success', text: t.successMsg + ' De hyperbool f(x) = c/x heeft twee takken die nooit de assen raken (asymptoten). Het teken van c bepaalt in welke kwadranten de takken liggen: c>0 = I en III, c<0 = II en IV. De grootte van c bepaalt hoe ver de takken van de oorsprong liggen.' } }
  }
})

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Beweeg de slider.' }; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = [0,1,2].map(i => generateLevel(i)); cValue.value = currentLevelData.value ? currentLevelData.value.startC : 1 }

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; levels.value = [0,1,2].map(i => generateLevel(i)); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => {}))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2"><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Hyperbool f(x) = c/x
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> f(x) = c/x is omgekeerd evenredig. Als x groter wordt, wordt y kleiner.</p>
              <p><strong>Stap 2:</strong> De grafiek heeft TWEE takken (een in de positieve x, een in de negatieve x).</p>
              <p><strong>Stap 3:</strong> c > 0: takken in kwadrant I en III. c < 0: takken in II en IV.</p>
              <p class="font-bold text-indigo-600">De x-as en y-as zijn asymptoten: de takken naderen maar raken ze nooit.</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData ? currentLevelData.goalText : '' }}</p>
          </div>

          <div class="p-6 border-2 border-slate-200 bg-white rounded-xl shadow-inner space-y-6">
            <div class="text-center">
              <p class="font-mono text-2xl font-black text-amber-600 flex items-center justify-center gap-2">
                <span>f(x) = </span>
                <span class="inline-flex flex-col items-center">
                  <span class="mb-0.5 tabular-nums" :class="cValue === 0 ? 'text-red-500' : ''">{{ cValue }}</span>
                  <span class="w-8 border-t-2 border-amber-600"></span>
                  <span class="mt-0.5">x</span>
                </span>
              </p>
            </div>
            <div>
              <label class="block mb-2 text-sm font-bold text-slate-700">Parameter c: <span class="tabular-nums">{{ cValue }}</span></label>
              <input type="range" v-model.number="cValue" min="-5" max="5" step="0.5" :disabled="isCorrect" class="w-full accent-amber-600">
              <div class="flex justify-between mt-1 text-xs text-slate-400 font-mono font-bold"><span>-5</span><span>0</span><span>5</span></div>
            </div>
            <div class="pt-4 border-t border-slate-200">
              <p class="font-bold text-slate-800 text-center">{{ currentLevelData ? currentLevelData.q : '' }}</p>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>De hyperbool heeft geen waarde bij x=0 (deling door nul).</li>
              <li>Het teken van c bepaalt de ligging (kwadranten I/III vs II/IV).</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">De functie f(x) = c/x heet omgekeerd evenredig omdat het product x * y = c constant is. Als x verdubbelt, halveert y. De grafiek heeft twee takken die de x-as en y-as als asymptoot hebben: ze komen er steeds dichter bij maar raken ze nooit.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom heeft de hyperbool twee aparte takken? Wat gebeurt er met de functiewaarde als x steeds dichter bij 0 komt?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp de invloed van parameter c op de hyperbool f(x) = c/x en kan de ligging van de takken bepalen.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-hyper" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-hyper" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-center gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <div v-if="!isCorrect" class="flex-1 py-4 font-bold text-slate-400 text-center rounded-lg shadow-md bg-slate-100 cursor-default">Schuif naar het juiste antwoord</div>
            <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto">
          <div class="relative flex-1 flex items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
            <svg width="400" height="400" viewBox="-100 -100 200 200" class="overflow-visible bg-white/90 rounded-xl shadow-md border border-slate-300 z-10" :key="currentInternalLevel">
              <text x="50" y="-50" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">I</text>
              <text x="-60" y="-50" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">II</text>
              <text x="-65" y="60" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">III</text>
              <text x="45" y="60" font-size="20" font-weight="bold" fill="#ec4899" opacity="0.1">IV</text>
              <g stroke="#e2e8f0" stroke-width="1"><line v-for="i in 21" :key="'v'+i" :x1="(i-11)*10" y1="-100" :x2="(i-11)*10" y2="100" /><line v-for="i in 21" :key="'h'+i" x1="-100" :y1="(i-11)*10" x2="100" :y2="(i-11)*10" /></g>
              <line x1="-100" y1="0" x2="100" y2="0" stroke="#64748b" stroke-width="2" /><line x1="0" y1="-100" x2="0" y2="100" stroke="#64748b" stroke-width="2" />
              <path v-if="cValue !== 0" :d="graphPath" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-all duration-300" />
              <g v-if="currentLevelData && currentLevelData.targetPoint" class="animate-fadeIn">
                <circle :cx="currentLevelData.targetPoint.x*10" :cy="-(currentLevelData.targetPoint.y*10)" r="4" fill="#ec4899" stroke="white" stroke-width="1" class="animate-pulse" />
                <text :x="currentLevelData.targetPoint.x*10+5" :y="-(currentLevelData.targetPoint.y*10)-5" font-weight="bold" fill="#ec4899" font-size="8">({{ currentLevelData.targetPoint.x }}, {{ currentLevelData.targetPoint.y }})</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</div>
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; background-position: center center; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #d97706; border: 4px solid white; cursor: pointer; margin-top: -10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #cbd5e1; border-radius: 2px; }
</style>
