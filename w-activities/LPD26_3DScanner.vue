<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScan, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Ruimtefiguren: De Aanzichten-Scanner' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhScan }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Kies de juiste vormen.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function shuffleArray(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [a[i], a[j]] = [a[j], a[i]] }; return a }

const shapeTemplates = [
  { goalText: 'Een Cilinder (Blik)', objSVG: '<rect x="10" y="25" width="80" height="100" fill="rgba(14,165,233,0.6)" stroke="#0ea5e9" stroke-width="2" /><ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(14,165,233,0.8)" stroke="#0ea5e9" stroke-width="2" /><ellipse cx="50" cy="25" rx="40" ry="15" fill="rgba(56,189,248,1)" stroke="#0284c7" stroke-width="3" />', topAns: 'circle', frontAns: 'rectangle', successMsg: 'Een cilinder = bovenaanzicht cirkel, vooraanzicht rechthoek. Omdat je geen diepte ziet, wordt de ronde vorm plat.', errTop: 'Het deksel van de cilinder is rond. Bovenaanzicht = cirkel.', errFront: 'Van voren zie je een platte rechthoek. Diepte verdwijnt!' },
  { goalText: 'Een Kegel (Feestmuts)', objSVG: '<polygon points="50,15 10,125 90,125" fill="rgba(245,158,11,0.6)" stroke="#d97706" stroke-width="2" /><ellipse cx="50" cy="125" rx="40" ry="15" fill="rgba(245,158,11,0.8)" stroke="#d97706" stroke-width="2" />', topAns: 'circle_dot', frontAns: 'triangle', successMsg: 'Een kegel = bovenaanzicht cirkel met stip (top), vooraanzicht driehoek. De top is een punt in het midden.', errTop: 'Vanbovenop de kegel zie je de ronde basis met de top als stip.', errFront: 'Plat van voren zonder diepte zie je een driehoek.' },
  { goalText: 'Een Piramide', objSVG: '<polygon points="50,15 10,120 90,120" fill="rgba(16,185,129,0.4)" stroke="#059669" stroke-width="2" /><line x1="50" y1="15" x2="60" y2="135" stroke="#059669" stroke-width="2" /><polygon points="10,120 60,135 90,120 40,105" fill="rgba(16,185,129,0.6)" stroke="#059669" stroke-width="2" /><line x1="50" y1="15" x2="40" y2="105" stroke="#059669" stroke-width="2" stroke-dasharray="2 2" />', topAns: 'square_cross', frontAns: 'triangle', successMsg: 'Een piramide = bovenaanzicht vierkant met kruis (ribben naar top), vooraanzicht driehoek.', errTop: 'Het grondvlak is een vierkant. De ribben naar de top vormen een kruis.', errFront: 'Plat van voren zonder diepte = driehoek.' }
]

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const topViewAns = ref(''); const frontViewAns = ref('')

function getHint() {
  const d = currentLevelData.value
  if (attemptCount.value <= 1) return 'Een aanzicht is ALTIJD een platte 2D-vorm. Diepte verdwijnt.'
  if (attemptCount.value === 2) { if (topViewAns.value !== d.topAns) return d.errTop; return d.errFront }
  if (topViewAns.value !== d.topAns) return d.errTop; return d.errFront
}

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Kies de juiste vormen.' }; topViewAns.value = ''; frontViewAns.value = ''; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = shuffleArray(shapeTemplates) }

function checkAnswer() {
  isChecked.value = true; const d = currentLevelData.value
  if (topViewAns.value === d.topAns && frontViewAns.value === d.frontAns) { isCorrect.value = true; feedback.value = { type: 'success', text: d.successMsg + ' Bij het projecteren van een 3D-figuur naar 2D valt alle diepte-informatie weg. Wat overblijft is de silhouetvorm in dat vlak.' } }
  else { isCorrect.value = false; attemptCount.value++
    if (['cylinder','cone','pyramid'].includes(topViewAns.value) || ['cylinder','cone','pyramid'].includes(frontViewAns.value)) { feedback.value = { type: 'error', text: 'Een aanzicht is altijd een 2D-vorm. Kies geen 3D-figuur.' }; return }
    feedback.value = { type: 'error', text: getHint() }
  }
}

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; levels.value = shuffleArray(shapeTemplates); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Aanzichten
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Bovenaanzicht:</strong> je kijkt van bovenaf. Diepte (hoogte) verdwijnt. Je ziet alleen het grondvlak.</p>
              <p><strong>Vooraanzicht:</strong> je kijkt van voren. Diepte (breedte naar achter) verdwijnt.</p>
              <p class="font-bold text-indigo-600">Een aanzicht is altijd een platte 2D-vorm!</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner flex flex-col gap-4">
            <div><label class="block text-sm font-bold text-slate-700 mb-2">1. Bovenaanzicht:</label>
              <select v-model="topViewAns" :disabled="isCorrect" class="w-full p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 bg-white">
                <option value="" disabled>Kies 2D vorm...</option>
                <option value="rectangle">Rechthoek</option><option value="triangle">Driehoek</option><option value="circle">Cirkel</option>
                <option value="circle_dot">Cirkel met stip</option><option value="square_cross">Vierkant met kruis</option><option value="square">Vierkant</option>
              </select>
            </div>
            <div><label class="block text-sm font-bold text-slate-700 mb-2">2. Vooraanzicht:</label>
              <select v-model="frontViewAns" :disabled="isCorrect" class="w-full p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 bg-white">
                <option value="" disabled>Kies 2D vorm...</option>
                <option value="rectangle">Rechthoek</option><option value="triangle">Driehoek</option><option value="circle">Cirkel</option><option value="square">Vierkant</option>
              </select>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Kies nooit een 3D-vorm als aanzicht!</li>
              <li>Denk aan het silhouet: welke vorm zie je als alle diepte wegvalt?</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Wanneer we een 3D-object projecteren naar 2D verliezen we een dimensie. Het bovenaanzicht toont de vorm van het grondvlak, het vooraanzicht toont de hoogte en breedte zonder diepte. Daarom worden ronde vormen (cilinder, kegel) platte rechthoeken of driehoeken.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom verandert het aanzicht afhankelijk van de richting waaruit je kijkt? Wat zegt dit over 3D-figuren?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan het voor- en bovenaanzicht van een 3D-figuur bepalen.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-scan" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-scan" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
          <div class="w-full max-w-4xl flex justify-center gap-12 items-center">
            <div class="flex flex-col items-center">
              <h4 class="font-bold text-slate-500 uppercase tracking-widest text-sm mb-4">3D Object</h4>
              <div class="relative w-48 h-64 bg-slate-100 rounded-xl shadow-inner border-2 border-slate-300 flex items-center justify-center overflow-hidden" :key="'obj'+currentInternalLevel">
                <svg width="100" height="150" viewBox="0 0 100 150" v-html="currentLevelData.objSVG"></svg>
                <div class="absolute inset-x-0 h-1 bg-green-400 shadow-[0_0_10px_#4ade80] animate-scan opacity-60"></div>
              </div>
            </div>
            <PhArrowRight weight="bold" class="w-8 h-8 text-slate-300" />
            <div class="flex flex-col gap-6">
              <div class="flex items-center gap-4">
                <span class="font-bold text-slate-400 w-24 text-right">Boven:</span>
                <div class="w-24 h-24 bg-white rounded-xl shadow-sm border-2 border-slate-300 flex items-center justify-center" :class="topViewAns === currentLevelData.topAns && isCorrect ? 'border-emerald-500 bg-emerald-50' : ''">
                  <span v-if="!topViewAns" class="text-slate-300 text-3xl font-black">?</span>
                  <div v-if="topViewAns==='circle'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn"></div>
                  <div v-if="topViewAns==='circle_dot'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>
                  <div v-if="topViewAns==='rectangle'" class="w-12 h-16 bg-slate-800 animate-fadeIn"></div>
                  <div v-if="topViewAns==='square'" class="w-16 h-16 bg-slate-800 animate-fadeIn"></div>
                  <div v-if="topViewAns==='square_cross'" class="w-16 h-16 bg-slate-800 animate-fadeIn relative"><svg width="100%" height="100%" class="absolute inset-0"><line x1="0" y1="0" x2="100%" y2="100%" stroke="white" stroke-width="2" /><line x1="100%" y1="0" x2="0" y2="100%" stroke="white" stroke-width="2" /></svg></div>
                  <div v-if="topViewAns==='triangle'" class="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-800 animate-fadeIn"></div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-bold text-slate-400 w-24 text-right">Voor:</span>
                <div class="w-24 h-24 bg-white rounded-xl shadow-sm border-2 border-slate-300 flex items-center justify-center" :class="frontViewAns === currentLevelData.frontAns && isCorrect ? 'border-emerald-500 bg-emerald-50' : ''">
                  <span v-if="!frontViewAns" class="text-slate-300 text-3xl font-black">?</span>
                  <div v-if="frontViewAns==='circle'" class="w-16 h-16 rounded-full bg-slate-800 animate-fadeIn"></div>
                  <div v-if="frontViewAns==='rectangle'" class="w-16 h-20 bg-slate-800 animate-fadeIn"></div>
                  <div v-if="frontViewAns==='square'" class="w-16 h-16 bg-slate-800 animate-fadeIn"></div>
                  <div v-if="frontViewAns==='triangle'" class="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-800 animate-fadeIn"></div>
                </div>
              </div>
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
.animate-scan { animation: scan 3s linear infinite alternate; }
@keyframes scan { 0% { top: 10%; } 100% { top: 90%; } }
</style>
