<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTriangle, PhArrowClockwise, PhArrowsLeftRight, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Congruentie: De ZZH-Valstrik' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhTriangle }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Beweeg de slider om de blauwe zijde te laten slingeren.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

const userOptSets = [
  { userOpt1: 'uniek', userOpt1Text: 'ZZH maakt altijd 1 unieke driehoek', userOpt2: 'twee', userOpt2Text: 'ZZH kan 2 verschillende driehoeken maken', correctAns: 'twee',
    successMsg: 'Exact! ZZH is geen garantie voor congruentie! De zijde kan op twee plekken landen.',
    errMsg: 'Fout! Beweeg de slider. De blauwe lijn raakt op TWEE plekken de basis.' },
  { userOpt1: 'uniek', userOpt1Text: 'ZZH met scherpe hoek = 1 unieke driehoek', userOpt2: 'twee', userOpt2Text: 'Zelfs met scherpe hoek is ZZH verraderlijk', correctAns: 'twee',
    successMsg: 'Klopt! Ook met een scherpe hoek kan de zijde naar binnen of buiten klappen.',
    errMsg: 'Kijk goed! De zijde kan twee kanten op.' },
  { userOpt1: 'uniek', userOpt1Text: 'Bij 90 maakt ZZH 1 unieke driehoek', userOpt2: 'twee', userOpt2Text: 'Zelfs bij 90 kan het twee kanten op', correctAns: 'uniek',
    successMsg: 'Briljant! Bij exact 90 (ZZ90) is er maar één mogelijkheid dankzij Pythagoras.',
    errMsg: 'Probeer de slider. Bij 90 kan hij nergens anders heen.' }
]
const levels = ref([])
function generateLevel() { levels.value = [{ angleDeg: 30, cbLength: 130, ghostCircles: [{cx:190},{cx:356}], angleLabel:'30' }, { angleDeg: 45, cbLength: 160, ghostCircles: [{cx:166.6},{cx:316.2}], angleLabel:'45' }, { angleDeg: 90, cbLength: 250, ghostCircles: [{cx:250}], angleLabel:'90' }] }
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const currentOptions = computed(() => userOptSets[currentInternalLevel.value])
const swingAngle = ref(215); const userAns = ref('')
const A = { x: 100, y: 300 }
const C = computed(() => { const a = currentLevelData.value.angleDeg * Math.PI / 180; return { x: A.x + 200 * Math.cos(a), y: A.y - 200 * Math.sin(a) } })
const CBLength = computed(() => currentLevelData.value.cbLength)
const B_visual = computed(() => { const r = swingAngle.value * Math.PI / 180; return { x: C.value.x + CBLength.value * Math.cos(r), y: C.value.y + CBLength.value * Math.sin(r) } })
const isHittingBase = computed(() => Math.abs(B_visual.value.y - 300) < 5)

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Beweeg de slider.' }; userAns.value = ''; swingAngle.value = 90; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  if (userAns.value === currentOptions.value.correctAns) { isCorrect.value = true; feedback.value = { type: 'success', text: currentOptions.value.successMsg + ' Bij ZZH (Zijde-Zijde-Hoek) kan de derde zijde op twee manieren passen, behalve bij 90 (ZZ90). Daarom is ZZH geen congruentiekenmerk.' } }
  else { isCorrect.value = false; if (attemptCount.value >= 3) feedback.value = { type: 'error', text: currentOptions.value.errMsg + ' Antwoord = ' + (currentOptions.value.correctAns === 'twee' ? '2 mogelijkheden' : '1 unieke') + '.' }; else feedback.value = { type: 'error', text: currentOptions.value.errMsg } }
}

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; generateLevel(); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: ZZH-test
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>ZHZ</strong> = zijde-hoek-zijde: de hoek ligt tussen de twee zijden. Garandeert congruentie.</p>
              <p><strong>ZZH</strong> = zijde-zijde-hoek: de hoek ligt NIET tussen de twee zijden.</p>
              <p>Bij ZZH kan de derde zijde op twee manieren passen (behalve bij ).</p>
              <p class="font-bold text-indigo-600">Test het zelf met de slider!</p>
            </div>
          </div>

          <div class="p-4 mt-6 border border-red-200 bg-red-50 rounded-xl shadow-inner">
            <label class="block text-sm font-bold text-red-900 mb-2">Conclusie:</label>
            <select v-model="userAns" :disabled="isCorrect" class="w-full p-4 border-2 border-red-300 rounded-lg font-bold text-slate-700 bg-white">
              <option value="" disabled>Kies...</option>
              <option value="uniek">{{ currentOptions.userOpt1Text }}</option>
              <option value="twee">{{ currentOptions.userOpt2Text }}</option>
            </select>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>ZZH lijkt op ZHZ, maar de hoek zit op een andere plaats.</li>
              <li>Alleen bij een rechte hoek (90) werkt ZZH wel (ZZ90).</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Bij ZZH is de gegeven hoek ingesloten door slechts een van de twee zijden. De derde zijde is vrij om te roteren, waardoor twee verschillende driehoeken mogelijk zijn. Dit maakt ZZH onbetrouwbaar voor congruentie. Pas bij een rechte hoek (ZZ90) is er maar een oplossing door de stelling van Pythagoras.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom maakt de positie van de hoek ten opzichte van de zijden het verschil tussen ZHZ en ZZH?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp het verschil tussen ZHZ en ZZH en waarom ZZH geen congruentiekenmerk is.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-zzh" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-zzh" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900">Controleer</button>
            <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center">
            <div class="mb-8 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2 mb-2"><PhArrowsLeftRight weight="bold" /> Slinger (Zijde a)</label>
              <input type="range" min="10" max="170" step="1" v-model.number="swingAngle" :disabled="isCorrect" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8" :key="'svg'+currentInternalLevel">
              <svg width="500" height="350" viewBox="0 0 500 350">
                <g v-for="(g, gi) in currentLevelData.ghostCircles" :key="'ghost-'+gi"><circle :cx="g.cx" cy="300" r="10" fill="transparent" stroke="rgba(14,165,233,0.4)" stroke-width="2" stroke-dasharray="4 2" /></g>
                <line x1="50" y1="300" x2="450" y2="300" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8 4" />
                <path v-if="currentLevelData.angleDeg===30" d="M 140 300 A 40 40 0 0 0 134.6 280" fill="none" stroke="#ef4444" stroke-width="3" />
                <text v-if="currentLevelData.angleDeg===30" x="145" y="295" font-weight="bold" fill="#ef4444" font-size="12">30</text>
                <path v-if="currentLevelData.angleDeg===45" d="M 140 300 A 40 40 0 0 0 128.2 271.7" fill="none" stroke="#ef4444" stroke-width="3" />
                <text v-if="currentLevelData.angleDeg===45" x="145" y="285" font-weight="bold" fill="#ef4444" font-size="12">45</text>
                <polyline v-if="currentLevelData.angleDeg===90" points="100,280 120,280 120,300" fill="none" stroke="#ef4444" stroke-width="3" />
                <line x1="100" y1="300" :x2="C.x" :y2="C.y" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" />
                <text :x="(100 + C.x)/2 - 20" :y="(300 + C.y)/2 - 10" font-weight="bold" fill="#f59e0b">Vast</text>
                <line :x1="C.x" :y1="C.y" :x2="B_visual.x" :y2="B_visual.y" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" />
                <text :x="(C.x + B_visual.x)/2 + 10" :y="(C.y + B_visual.y)/2" font-weight="bold" fill="#0ea5e9">Vast</text>
                <polygon v-if="isHittingBase" :points="`100,300 ${C.x},${C.y} ${B_visual.x},${B_visual.y}`" fill="rgba(16,185,129,0.2)" class="animate-fadeIn pointer-events-none" />
                <circle cx="100" cy="300" r="5" fill="#1e293b" /><circle :cx="C.x" :cy="C.y" r="5" fill="#1e293b" />
                <circle :cx="B_visual.x" :cy="B_visual.y" r="8" fill="#0ea5e9" stroke="white" stroke-width="2" :class="isHittingBase ? '!fill-emerald-500' : ''" />
                <text x="80" y="315" font-weight="bold" fill="#1e293b">A</text><text :x="C.x-10" :y="C.y-15" font-weight="bold" fill="#1e293b">C</text><text :x="B_visual.x" :y="B_visual.y+25" font-weight="bold" fill="#0ea5e9">B</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</div>
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f59e0b; border: 4px solid white; cursor: pointer; margin-top: -11px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; border-radius: 3px; }
</style>
