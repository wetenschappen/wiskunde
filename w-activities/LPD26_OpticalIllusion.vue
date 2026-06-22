<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCube, PhArrowClockwise, PhEye, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Ruimtemeetkunde: De Optische Illusie' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op "Verander Perspectief" om rond de kubus te wandelen.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function shuffleArray(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [a[i], a[j]] = [a[j], a[i]] }; return a }

const illusionTemplates = [
  { goalText: 'Het X-patroon',
    svg2D: '<rect x="100" y="50" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" /><line x1="100" y1="50" x2="300" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><line x1="100" y1="250" x2="300" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />',
    svg3D: '<line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" /><rect x="150" y="30" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="150" y1="230" x2="350" y2="30" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="50" y="100" width="200" height="200" fill="rgba(255,255,255,0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" /><line x1="50" y1="100" x2="250" y2="300" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><circle cx="200" cy="130" r="15" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" />',
    correctAns: 'kruisend',
    successMsg: 'Perfect! In 2D lijkt het X-patroon alsof de lijnen snijden. In 3D zie je: de ene lijn zit vooraan, de andere achteraan. Ze zijn KRUISEND: niet evenwijdig en niet snijdend.' },
  { goalText: 'Het Dak', svg2D: '<rect x="100" y="50" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" /><line x1="100" y1="250" x2="200" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><line x1="300" y1="250" x2="200" y2="50" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />',
    svg3D: '<line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" /><rect x="150" y="30" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="350" y1="230" x2="250" y2="30" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="50" y="100" width="200" height="200" fill="rgba(255,255,255,0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" /><line x1="50" y1="300" x2="150" y2="100" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><circle cx="200" cy="65" r="15" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" />',
    correctAns: 'kruisend',
    successMsg: 'Fantastisch! Het dakje lijkt te snijden, maar in 3D stopt de ene vooraan, de andere achteraan. Kruisend!' },
  { goalText: 'Diagonale verwarring', svg2D: '<rect x="100" y="50" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" /><line x1="100" y1="50" x2="200" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><line x1="200" y1="50" x2="300" y2="250" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="100" y="50" width="200" height="200" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" />',
    svg3D: '<line x1="50" y1="100" x2="150" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="100" x2="350" y2="30" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="50" y1="300" x2="150" y2="230" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="300" x2="350" y2="230" stroke="#94a3b8" stroke-width="2" /><rect x="150" y="30" width="200" height="200" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" /><line x1="250" y1="30" x2="350" y2="230" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><rect x="50" y="100" width="200" height="200" fill="rgba(255,255,255,0.5)" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round" /><line x1="50" y1="100" x2="150" y2="300" stroke="#ef4444" stroke-width="6" stroke-linecap="round" /><circle cx="200" cy="180" r="15" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4" />',
    correctAns: 'evenwijdig',
    successMsg: 'Heel goed! Deze lijnen lopen in dezelfde richting. Ze zijn EVENWIJDIG, ook in 3D.' }
]

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const is3D = ref(false); const userAns = ref('')

function getHint() {
  const t = currentLevelData.value
  if (attemptCount.value <= 1) return 'Gebruik de "Verander Perspectief" knop.'
  if (attemptCount.value === 2) {
    if (!is3D.value) return 'Klik op de knop voor 3D!'
    if (t.correctAns === 'kruisend') return 'De lijnen zitten in verschillende vlakken. Ze snijden NIET en zijn NIET evenwijdig.'
    return 'Lopen ze in exact dezelfde richting?'
  }
  if (t.correctAns === 'kruisend') return 'Kruisend = niet evenwijdig en niet snijdend.'
  return 'Evenwijdig = zelfde richting, als treinsporen.'
}

function togglePerspective() { if (isCorrect.value) return; is3D.value = !is3D.value; if (is3D.value) feedback.value = { type: 'success', text: 'Kijk! De echte ligging wordt zichtbaar in 3D.' } }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Klik op "Verander Perspectief".' }; is3D.value = false; userAns.value = ''; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = shuffleArray(illusionTemplates) }

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === currentLevelData.value.correctAns) {
    if (is3D.value) { isCorrect.value = true; feedback.value = { type: 'success', text: currentLevelData.value.successMsg + ' In de ruimtemeetkunde zijn rechten kruisend als ze geen gemeenschappelijk punt hebben en niet evenwijdig zijn. Dit kan je alleen zien door het 3D-perspectief.' } }
    else { isCorrect.value = false; attemptCount.value++; feedback.value = { type: 'error', text: 'Juist! Maar wissel naar 3D om het visueel te bewijzen.' } }
  } else { isCorrect.value = false; attemptCount.value++; feedback.value = { type: 'error', text: getHint() } }
}

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; levels.value = shuffleArray(illusionTemplates); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Kruisende vs Snijdende rechten
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Snijdend:</strong> rechten die een gemeenschappelijk punt hebben.</p>
              <p><strong>Evenwijdig:</strong> rechten die in dezelfde richting lopen en elkaar nooit snijden.</p>
              <p><strong>Kruisend:</strong> rechten die NIET evenwijdig zijn maar ELKAAR NOOIT SNIJDEN (ze liggen in verschillende vlakken).</p>
              <p class="font-bold text-indigo-600">In 2D lijken kruisende rechten op snijdende rechten. Alleen 3D toont het verschil!</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <label class="block text-sm font-bold text-slate-700 mb-2">Onderlinge ligging:</label>
            <select v-model="userAns" :disabled="isCorrect" class="w-full p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 bg-white">
              <option value="" disabled>Kies...</option>
              <option value="snijdend">Snijdende rechten</option>
              <option value="evenwijdig">Evenwijdige rechten</option>
              <option value="kruisend">Kruisende rechten</option>
            </select>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>In 2D lijken kruisende rechten te snijden. Gebruik 3D om te controleren!</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Wanneer we 3D op een 2D-scherm tekenen, verliezen we diepte-informatie. Lijnen die in verschillende vlakken liggen lijken elkaar te snijden, maar in werkelijkheid zweven ze op verschillende dieptes. Alleen door het perspectief te veranderen zien we de ware ligging.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom kunnen we de onderlinge ligging van rechten niet altijd correct bepalen in een 2D-tekening?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp het verschil tussen snijdende, evenwijdige en kruisende rechten in de ruimte.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-illusie" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-illusie" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
            <div class="mb-12">
              <button @click="togglePerspective" :disabled="isCorrect" class="px-6 py-4 font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95" :class="is3D ? 'bg-amber-600 border-amber-700' : 'bg-slate-800 border-slate-900 hover:bg-slate-700'"><PhEye weight="fill" class="w-6 h-6" /> {{ is3D ? 'Terug naar 2D' : 'Bekijk in 3D' }}</button>
            </div>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-4 border-slate-200 p-8 flex items-center justify-center" style="width:500px;height:400px" :key="currentInternalLevel">
              <svg v-if="!is3D" width="400" height="300" viewBox="0 0 400 300" class="animate-fadeIn" v-html="currentLevelData.svg2D"></svg>
              <svg v-if="is3D" width="400" height="300" viewBox="0 0 400 300" class="animate-fadeIn" v-html="currentLevelData.svg3D"></svg>
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
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
