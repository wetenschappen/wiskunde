<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMagnifyingGlass, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Congruentie: Vind de Tweeling' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhMagnifyingGlass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een driehoek en het kenmerk.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

const levelBlueprints = [
  { goalText: 'Opdracht 1: ZHZ', targetSVG: '<polygon points="20,130 180,130 96,65" fill="rgba(14,165,233,0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" /><path d="M 50 130 A 30 30 0 0 0 42 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="55" y="120" font-weight="bold" font-size="12" fill="#ef4444">40</text><text x="100" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">8</text><text x="45" y="90" font-weight="bold" fill="#0284c7">5</text>',
    optA: { svg: '<polygon points="20,130 180,130 96,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><path d="M 150 130 A 30 30 0 0 1 155 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="130" y="120" font-weight="bold" font-size="12" fill="#ef4444">40</text><text x="100" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">8</text><text x="45" y="90" font-weight="bold" fill="#64748b">5</text>', isCorrect: false, errorRule: 'ZZH', errorMsg: 'De hoek ligt NIET tussen de zijden. Dit is ZZH, geen geldig kenmerk!' },
    optB: { svg: '<polygon points="180,130 20,130 104,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><path d="M 150 130 A 30 30 0 0 1 158 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="130" y="120" font-weight="bold" font-size="12" fill="#ef4444">40</text><text x="100" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">8</text><text x="145" y="90" font-weight="bold" fill="#64748b">5</text>', isCorrect: true, correctRule: 'ZHZ', successMsg: 'Perfect! De hoek (40) ligt ingesloten tussen de twee zijden (5 en 8). ZHZ!' },
    optC: { svg: '<polygon points="20,130 120,130 70,65" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><path d="M 50 130 A 30 30 0 0 0 42 105" fill="none" stroke="#ef4444" stroke-width="3" /><path d="M 90 130 A 30 30 0 0 1 98 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="45" y="125" font-weight="bold" font-size="10" fill="#ef4444">40</text><text x="75" y="125" font-weight="bold" font-size="10" fill="#ef4444">40</text><text x="70" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">5</text>', isCorrect: false, errorRule: 'HZH', errorMsg: 'Je hebt maar 1 zijde gegeven. Het doel eist 5 en 8.' } },
  { goalText: 'Opdracht 2: HZH', targetSVG: '<polygon points="20,130 160,130 70,50" fill="rgba(14,165,233,0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" /><text x="90" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">10</text><path d="M 45 130 A 25 25 0 0 0 35 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="45" y="120" font-weight="bold" font-size="12" fill="#ef4444">50</text><path d="M 135 130 A 25 25 0 0 1 145 110" fill="none" stroke="#ef4444" stroke-width="3" /><text x="125" y="120" font-weight="bold" font-size="12" fill="#ef4444">30</text>',
    optA: { svg: '<polygon points="20,130 160,130 70,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><text x="90" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">10</text><path d="M 60 70 A 15 15 0 0 1 80 70" fill="none" stroke="#ef4444" stroke-width="3" /><text x="70" y="85" font-weight="bold" font-size="12" fill="#ef4444">50</text><path d="M 135 130 A 25 25 0 0 1 145 110" fill="none" stroke="#ef4444" stroke-width="3" /><text x="125" y="120" font-weight="bold" font-size="12" fill="#ef4444">30</text>', isCorrect: false, errorRule: 'ZHH', errorMsg: 'Een hoek is verplaatst naar de top. Geen HZH meer.' },
    optB: { svg: '<polygon points="20,130 120,130 50,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><text x="70" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">7</text><path d="M 45 130 A 25 25 0 0 0 35 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="45" y="120" font-weight="bold" font-size="12" fill="#ef4444">50</text><path d="M 95 130 A 25 25 0 0 1 105 110" fill="none" stroke="#ef4444" stroke-width="3" /><text x="85" y="120" font-weight="bold" font-size="12" fill="#ef4444">30</text>', isCorrect: false, errorRule: 'HZH', errorMsg: 'HZH klopt, maar basis is 7, niet 10.' },
    optC: { svg: '<polygon points="160,130 20,130 110,50" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><text x="90" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">10</text><path d="M 45 130 A 25 25 0 0 0 55 110" fill="none" stroke="#ef4444" stroke-width="3" /><text x="50" y="120" font-weight="bold" font-size="12" fill="#ef4444">30</text><path d="M 135 130 A 25 25 0 0 1 125 105" fill="none" stroke="#ef4444" stroke-width="3" /><text x="135" y="120" font-weight="bold" font-size="12" fill="#ef4444">50</text>', isCorrect: true, correctRule: 'HZH', successMsg: 'Uitstekend! Zijde 10 ingesloten tussen hoeken 30 en 50. HZH!' } },
  { goalText: 'Opdracht 3: ZZ90', targetSVG: '<polygon points="20,130 150,130 20,30" fill="rgba(14,165,233,0.2)" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" /><polyline points="20,110 40,110 40,130" fill="none" stroke="#ef4444" stroke-width="3" /><text x="85" y="145" font-weight="bold" fill="#0284c7" text-anchor="middle">4</text><text x="100" y="75" font-weight="bold" fill="#0284c7">5</text>',
    optA: { svg: '<polygon points="20,130 150,130 20,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><polyline points="20,110 40,110 40,130" fill="none" stroke="#ef4444" stroke-width="3" /><text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text><text x="5" y="85" font-weight="bold" fill="#64748b">5</text>', isCorrect: false, errorRule: 'ZHZ', errorMsg: '5 is een RECHTHOEKSZIJDE, bij doel is 5 de SCHUINE zijde.' },
    optB: { svg: '<polygon points="150,130 20,130 150,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><polyline points="150,110 130,110 130,130" fill="none" stroke="#ef4444" stroke-width="3" /><text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text><text x="60" y="75" font-weight="bold" fill="#64748b">5</text>', isCorrect: true, correctRule: 'ZZ90', successMsg: 'Geniaal! ZZ90: een zijde, schuine zijde en rechte hoek. Enige uitzondering!' },
    optC: { svg: '<polygon points="20,130 150,130 80,30" fill="none" stroke="#64748b" stroke-width="4" stroke-linejoin="round" /><text x="85" y="145" font-weight="bold" fill="#64748b" text-anchor="middle">4</text><text x="120" y="75" font-weight="bold" fill="#64748b">5</text><path d="M 50 130 A 30 30 0 0 0 45 105" fill="none" stroke="#ef4444" stroke-width="3" />', isCorrect: false, errorRule: 'ZZH', errorMsg: 'Geen rechte hoek! ZZH valstrik.' } }
]
const levels = ref([])
function generateLevel() { levels.value = levelBlueprints.map(bp => ({...bp, optA:{...bp.optA}, optB:{...bp.optB}, optC:{...bp.optC}})) }
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const selectedTriangle = ref(null); const selectedRule = ref('')

function selectTriangle(opt) { if (isCorrect.value) return; selectedTriangle.value = opt }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Selecteer een driehoek en het kenmerk.' }; selectedTriangle.value = null; selectedRule.value = ''; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  if (selectedTriangle.value === null || selectedRule.value === '') { isCorrect.value = false; feedback.value = { type: 'error', text: 'Kies een driehoek en een kenmerk.' }; return }
  const optData = currentLevelData.value['opt' + selectedTriangle.value]
  if (optData.isCorrect && selectedRule.value === optData.correctRule) { isCorrect.value = true; feedback.value = { type: 'success', text: optData.successMsg + ' Congruentiekenmerken zijn regels die garanderen dat twee driehoeken identiek zijn (ZZZ, ZHZ, HZH, ZZ90).' } }
  else { isCorrect.value = false
    if (!optData.isCorrect) feedback.value = { type: 'error', text: optData.errorMsg }
    else feedback.value = { type: 'error', text: `Juiste driehoek! Maar het kenmerk is ${optData.correctRule}.` }
  }
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Congruentie herkennen
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>ZHZ:</strong> twee zijden en de ingesloten hoek gelijk.</p>
              <p><strong>HZH:</strong> een zijde en de twee aanliggende hoeken gelijk.</p>
              <p><strong>ZZZ:</strong> alle drie de zijden gelijk.</p>
              <p><strong>ZZ90:</strong> bij een rechte hoek: een rechthoekszijde en schuine zijde gelijk.</p>
              <p class="font-bold text-indigo-600">Zoek naar de juiste combinatie!</p>
            </div>
          </div>

          <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <label class="block text-sm font-bold text-slate-700 mb-2">Kenmerk:</label>
            <select v-model="selectedRule" :disabled="isCorrect" class="w-full p-4 border-2 border-slate-300 rounded-lg font-bold text-slate-700 bg-white">
              <option value="" disabled>Kies...</option>
              <option value="ZZZ">ZZZ (Zijde-Zijde-Zijde)</option>
              <option value="ZHZ">ZHZ (Zijde-Hoek-Zijde)</option>
              <option value="HZH">HZH (Hoek-Zijde-Hoek)</option>
              <option value="ZZ90">ZZ90 (Rechthoekszijde-Schuine Zijde bij 90)</option>
              <option value="ZZH">ZZH (Zijde-Zijde-Hoek) - LET OP: geen geldig kenmerk!</option>
            </select>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>De juiste combinatie van gegevens bepalen is cruciaal.</li>
              <li>ZZH is NOOIT geldig, behalve bij een rechte hoek (ZZ90).</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">{{ currentLevelData['opt'+selectedTriangle].successMsg }}</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom zijn er vier verschillende congruentiekenmerken? Wat hebben ze gemeen?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan de vier congruentiekenmerken toepassen om tweelingdriehoeken te herkennen.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-twin" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-twin" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
        <div class="flex flex-col flex-1 p-8 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-sm bg-white p-6 rounded-xl shadow-md border-4 border-slate-300 mb-8 flex flex-col items-center">
            <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Doel</h4>
            <svg width="200" height="150" viewBox="0 0 200 150" v-html="currentLevelData.targetSVG"></svg>
          </div>
          <div class="flex gap-6 w-full max-w-4xl justify-center">
            <div v-for="opt in ['A','B','C']" :key="opt" @click="selectTriangle(opt)" class="bg-white p-4 rounded-xl shadow-sm border-4 cursor-pointer transition-all hover:scale-105" :class="selectedTriangle === opt ? (isCorrect && currentLevelData['opt'+opt].isCorrect ? 'border-emerald-500 bg-emerald-100' : 'border-amber-500 bg-amber-50') : 'border-slate-200'" role="button" tabindex="0" @keydown.enter.prevent="selectTriangle(opt)" @keydown.space.prevent="selectTriangle(opt)" aria-label="Optie">
              <h4 class="font-bold text-slate-400 mb-2">Optie {{ opt }}</h4>
              <svg width="150" height="120" viewBox="0 0 200 150" v-html="currentLevelData['opt'+opt].svg"></svg>
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
</style>
