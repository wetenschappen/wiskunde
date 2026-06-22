<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhCube, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Onderlinge ligging in de ruimte' },
  instruction: { type: String, default: 'Klik op twee lijnen in de kubus om aan de opdracht te voldoen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCube }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)
const showWorkedExample = ref(true)
const workedExampleDone = ref(false)
const showPredictionGate = ref(false)
const predictionChoice = ref(null)
const predictionMade = ref(false)
const showReflection = ref(false)
const reflectionDone = ref(false)
const showLPDEvidence = ref(false)
const lpdDone = ref(false)
const showWhySection = ref(false)
const showErrorAnalysis = ref(false)

const allLines = ['AB','BC','CD','AD','EF','FG','GH','EH','AE','BF','CG','DH','AG','BH','CE','DF']
const parallelGroups = [
  ['AB','CD','EF','GH'], ['AD','BC','EH','FG'], ['AE','BF','CG','DH']
]

function getRelationship(l1, l2) {
  if (l1 === l2) return 'identical'
  for (let g of parallelGroups) { if (g.includes(l1) && g.includes(l2)) return 'evenwijdig' }
  const s1 = new Set(l1.split('')), s2 = new Set(l2.split(''))
  const inter = new Set([...s1].filter(x => s2.has(x)))
  if (inter.size === 1) return 'snijdend'
  const diag = ['AG','BH','CE','DF']
  if (diag.includes(l1) && diag.includes(l2)) return 'snijdend'
  return 'kruisend'
}

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function generateLevel(levelIndex) {
  const relations = ['snijdend','evenwijdig','kruisend']
  let targetRel
  if (levelIndex === 0) targetRel = 'snijdend'
  else if (levelIndex === 1) targetRel = 'evenwijdig'
  else targetRel = 'kruisend'
  const names = { 'snijdend':'elkaar snijden','evenwijdig':'evenwijdig zijn','kruisend':'kruisend zijn' }
  return { goalText: `Opdracht ${levelIndex+1}: Selecteer twee lijnen die ${names[targetRel]}.`, targetRel }
}
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const selectedLines = ref([])

function getHintText() {
  const t = currentLevelData.value.targetRel
  const c = attemptCount.value
  if (c <= 1) {
    if (t === 'snijdend') return 'Hint 1: Snijdende lijnen hebben een gemeenschappelijk punt. Zoek twee lijnen die een hoekpunt delen.'
    if (t === 'evenwijdig') return 'Hint 1: Evenwijdige lijnen lopen in dezelfde richting en ontmoeten elkaar nooit. Denk aan tegenoverliggende ribben.'
    return 'Hint 1: Kruisende lijnen zijn niet evenwijdig maar snijden elkaar ook niet. Ze liggen in verschillende vlakken.'
  }
  if (c <= 2) {
    if (t === 'snijdend') return 'Hint 2: Kies twee lijnen die samenkomen in een hoekpunt. Bijvoorbeeld: een verticale en een horizontale ribbe die in hetzelfde hoekpunt starten.'
    if (t === 'evenwijdig') return 'Hint 2: Zoek twee ribben die tegenover elkaar liggen in hetzelfde vlak. Bijvoorbeeld: de linker en rechter verticale ribben van het voorvlak.'
    return 'Hint 2: Zoek een lijn op het voorvlak en een op het achtervlak die elkaar kruisen zonder te raken. Ze hebben geen gemeenschappelijk punt.'
  }
  if (t === 'snijdend') return 'Hint 3: Methode: zoek een hoekpunt met minstens 3 ribben. Kies twee van die ribben. De laatste stap... (vul zelf in: ze snijden in dat hoekpunt).'
  if (t === 'evenwijdig') return 'Hint 3: Methode: zoek twee ribben die in dezelfde richting lopen en in parallelle vlakken liggen. De laatste stap... (vul zelf in: controleer of ze in evenwijdige vlakken liggen).'
  return 'Hint 3: Methode: zoek een lijn in het voorvlak en een lijn in een ander vlak die elkaar niet raken en niet evenwijdig zijn. De laatste stap... (vul zelf in: controleer of ze elkaar zouden raken als je ze verlengt).'
}

function toggleLine(lineName) {
  if (isCorrect.value || showPredictionGate.value) return
  if (selectedLines.value.includes(lineName)) {
    selectedLines.value = selectedLines.value.filter(l => l !== lineName)
  } else {
    if (selectedLines.value.length < 2) selectedLines.value.push(lineName)
    else { selectedLines.value.shift(); selectedLines.value.push(lineName) }
  }
  isChecked.value = false
  if (selectedLines.value.length === 2) tryAutoCorrect()
}

function tryAutoCorrect() {
  const rel = getRelationship(selectedLines.value[0], selectedLines.value[1])
  const t = currentLevelData.value.targetRel
  if (rel === t) {
    isCorrect.value = true
    showWhySection.value = true
    showErrorAnalysis.value = true
    showReflection.value = true
    feedback.value = { type:'success', text:`Perfect! De lijnen ${selectedLines.value[0]} en ${selectedLines.value[1]} zijn inderdaad ${rel}.` }
  }
}

function showHint() { attemptCount.value++ }

function handlePrediction(answer) {
  predictionChoice.value = answer
  predictionMade.value = true
  showPredictionGate.value = false
}

function nextWorkedExample() {
  showWorkedExample.value = false
  showPredictionGate.value = true
}

function startLevel() {
  showPredictionGate.value = false
  predictionMade.value = false
  predictionChoice.value = null
}

function handleWhyDone() { /* shown inline, student reads */ }
function handleReflectionDone() { reflectionDone.value = true }
function handleLPDDone() { lpdDone.value = true }

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) newLevels.push(generateLevel(i))
  levels.value = newLevels
  isCorrect.value = false; celebrationDone.value = false
  isChecked.value = false; feedback.value = { type:'info', text:'Selecteer exact 2 lijnen.' }
  attemptCount.value = 0; selectedLines.value = []
  showWhySection.value = false; showErrorAnalysis.value = false
  showReflection.value = false; reflectionDone.value = false
  showLPDEvidence.value = false; lpdDone.value = false
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    if (!showReflection.value) { showReflection.value = true; return }
    if (!reflectionDone.value) { reflectionDone.value = true; return }
    if (currentInternalLevel.value === totalInternalLevels - 2 && !showLPDEvidence.value) {
      showLPDEvidence.value = true; return
    }
    if (showLPDEvidence.value && !lpdDone.value) { lpdDone.value = true; return }
    currentInternalLevel.value++
    resetActivityState()
    showWorkedExample.value = currentInternalLevel.value === 0
    nextTick(() => mainArea.value?.focus())
  } else {
    if (!showLPDEvidence.value) { showLPDEvidence.value = true; return }
    if (!lpdDone.value) { lpdDone.value = true; return }
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0; resetActivityState()
    showWorkedExample.value = true; showPredictionGate.value = false
    predictionMade.value = false; reflectionDone.value = false
    showLPDEvidence.value = false; lpdDone.value = false
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }

onMounted(() => { /* no fullscreen */ })
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
  <div class="relative flex w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

    <!-- Worked Example Modal -->
    <div v-if="showWorkedExample" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div>
          <h3 class="text-xl font-bold text-slate-800">Voorbeeld: onderlinge ligging bepalen</h3>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Stappenplan: Hoe bepaal je de relatie tussen twee lijnen in een kubus?</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1:</strong> Kijk of de lijnen een gemeenschappelijk punt hebben.</p>
            <p><strong>Stap 2:</strong> Zo ja → ze zijn <strong>snijdend</strong>.</p>
            <p><strong>Stap 3:</strong> Zo nee → kijk of ze in dezelfde richting lopen.</p>
            <p><strong>Stap 4:</strong> Ja, zelfde richting → <strong>evenwijdig</strong>.</p>
            <p><strong>Stap 5:</strong> Nee, andere richting → <strong>kruisend</strong>.</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: AB en DH</p>
            <p class="text-slate-600">AB loopt horizontaal, DH is verticaal. Ze hebben geen gemeenschappelijk punt (AB ligt vooraan, DH achteraan). Ze lopen in verschillende richtingen. Conclusie: <strong>kruisend</strong>.</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het, start de opdracht</button>
      </div>
    </div>

    <!-- Prediction Gate -->
    <div v-if="showPredictionGate && !predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <PhTarget class="w-8 h-8 text-indigo-600" weight="fill" />
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Wat ga je oefenen?</h3>
        <p class="text-slate-600 mb-6">Bij deze opdracht ga je de relatie bepalen tussen lijnen in de ruimte. Welke drie mogelijke relaties bestaan er tussen twee lijnen in een kubus?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('snijdend-evenwijdig-kruisend')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Snijdend, evenwijdig, kruisend</button>
          <button @click="handlePrediction('horizontaal-verticaal-diagonaal')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Horizontaal, verticaal, diagonaal</button>
          <button @click="handlePrediction('parallel-snijdend-samenvallend')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Parallel, snijdend, samenvallend</button>
        </div>
      </div>
    </div>

    <template v-if="!showWorkedExample && !(showPredictionGate && !predictionMade)">
      <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel+1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel+1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"><PhX class="w-6 h-6" /></button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="bg-amber-50 p-5 border border-amber-200 rounded-xl mb-6 animate-fadeIn">
              <p class="font-bold text-amber-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div v-if="showWhySection" class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2">Waarom werkt dit?</h4>
              <p class="text-sm text-indigo-700">In de ruimtemeetkunde zijn er exact drie mogelijke relaties tussen twee rechten: ze snijden (gemeenschappelijk punt), zijn evenwijdig (zelfde richting, geen snijpunt) of kruisen (geen gemeenschappelijk punt en niet evenwijdig). Deze indeling is volledig — er is geen vierde mogelijkheid — en ligt aan de basis van alle 3D-meetkunde.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-sm text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Kruisend vs evenwijdig:</strong> Lijnen die in verschillende vlakken liggen zijn niet automatisch kruisend. Controleer altijd of ze dezelfde richting hebben.</li>
                <li><strong>Diagonaal vs ribbe:</strong> Een lichaamsdiagonaal (bv. AG) en een ribbe kunnen snijdend zijn als ze een hoekpunt delen, of kruisend als dat niet zo is.</li>
                <li><strong>Denk 3D:</strong> Twee lijnen die er in 2D-aanzicht uitzien alsof ze kruisen, kunnen in werkelijkheid snijdend zijn als ze in hetzelfde punt samenkomen.</li>
              </ul>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-6 shadow-inner text-center">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Geselecteerde Lijnen</p>
              <div class="flex gap-4 justify-center">
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all" :class="selectedLines[0] ? 'border-amber-500 text-amber-600 bg-amber-50 ring-4 ring-amber-200' : 'border-slate-300 text-slate-300'">{{ selectedLines[0] || '?' }}</div>
                <div class="h-16 w-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center font-mono font-bold text-xl transition-all" :class="selectedLines[1] ? 'border-amber-500 text-amber-600 bg-amber-50 ring-4 ring-amber-200' : 'border-slate-300 text-slate-300'">{{ selectedLines[1] || '?' }}</div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{ 'bg-emerald-100 text-emerald-800': feedback.type==='success', 'bg-red-100 text-red-800': feedback.type==='error', 'bg-blue-100 text-blue-800': feedback.type==='info' }">
               <component :is="feedback.type==='success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div v-if="!isCorrect && attemptCount>0" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ getHintText() }}</span>
            </div>

            <!-- Reflection Section -->
            <div v-if="showReflection && !reflectionDone" class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie: Denk dieper na</h4>
              <p class="text-sm text-indigo-700 mb-3"><strong>Waarom</strong> is het belangrijk om het verschil tussen kruisende en evenwijdige lijnen te kennen in de ruimtemeetkunde? Wat zou er fout gaan als je deze twee door elkaar haalt bij het berekenen van afstanden?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht, ga verder</button>
            </div>

            <!-- LPD Evidence -->
            <div v-if="showLPDEvidence && !lpdDone" class="p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 12: Bewijs van beheersing</h4>
              <p class="text-sm text-emerald-700 mb-3">Je hebt zojuist bewezen dat je de onderlinge ligging van rechten in de ruimte kan bepalen. Leg in je eigen woorden uit: "Ik weet dat twee lijnen in de ruimte _____ kunnen zijn als ze een gemeenschappelijk punt hebben, _____ als ze in dezelfde richting lopen zonder elkaar te raken, en _____ als ze geen gemeenschappelijk punt hebben en niet evenwijdig zijn."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen, ga verder</button>
            </div>

            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="showHint" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Geef me een hint</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <svg width="400" height="400" viewBox="-20 -20 240 240" class="overflow-visible stroke-slate-800 stroke-2 fill-none" stroke-linejoin="round" stroke-linecap="round">
              <polygon points="50,150 150,150 150,50 50,50" fill="white" opacity="0.6"/>
              <polygon points="150,150 180,110 180,10 150,50" fill="#f8fafc" opacity="0.6"/>
              <polygon points="50,50 150,50 180,10 80,10" fill="#f1f5f9" opacity="0.6"/>
              <line x1="50" y1="150" x2="150" y2="150" :stroke="selectedLines.includes('AB')?'#f97316':'#cbd5e1'" :stroke-width="selectedLines.includes('AB')?8:4" @click="toggleLine('AB')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="150" y1="150" x2="180" y2="110" :stroke="selectedLines.includes('BC')?'#f97316':'#cbd5e1'" :stroke-width="selectedLines.includes('BC')?8:4" @click="toggleLine('BC')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="180" y1="110" x2="80" y2="110" :stroke="selectedLines.includes('CD')?'#f97316':'#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('CD')?8:4" @click="toggleLine('CD')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="50" y1="150" x2="80" y2="110" :stroke="selectedLines.includes('AD')?'#f97316':'#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('AD')?8:4" @click="toggleLine('AD')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="50" y1="50" x2="150" y2="50" :stroke="selectedLines.includes('EF')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('EF')?8:4" @click="toggleLine('EF')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="150" y1="50" x2="180" y2="10" :stroke="selectedLines.includes('FG')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('FG')?8:4" @click="toggleLine('FG')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="180" y1="10" x2="80" y2="10" :stroke="selectedLines.includes('GH')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('GH')?8:4" @click="toggleLine('GH')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="50" y1="50" x2="80" y2="10" :stroke="selectedLines.includes('EH')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('EH')?8:4" @click="toggleLine('EH')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="50" y1="150" x2="50" y2="50" :stroke="selectedLines.includes('AE')?'#f97316':'#94a3b8'" :stroke-width="selectedLines.includes('AE')?8:4" @click="toggleLine('AE')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="150" y1="150" x2="150" y2="50" :stroke="selectedLines.includes('BF')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('BF')?8:4" @click="toggleLine('BF')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="180" y1="110" x2="180" y2="10" :stroke="selectedLines.includes('CG')?'#f97316':'#64748b'" :stroke-width="selectedLines.includes('CG')?8:4" @click="toggleLine('CG')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line x1="80" y1="110" x2="80" y2="10" :stroke="selectedLines.includes('DH')?'#f97316':'#94a3b8'" stroke-dasharray="6,4" :stroke-width="selectedLines.includes('DH')?8:4" @click="toggleLine('DH')" class="cursor-pointer hover:stroke-orange-300 transition-all" />
              <line v-if="selectedLines.includes('AG')" x1="50" y1="150" x2="180" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
              <line v-if="selectedLines.includes('BH')" x1="150" y1="150" x2="80" y2="10" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
              <line v-if="selectedLines.includes('CE')" x1="180" y1="110" x2="50" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
              <line v-if="selectedLines.includes('DF')" x1="80" y1="110" x2="150" y2="50" stroke="#f97316" stroke-width="8" class="pointer-events-none" />
              <line x1="50" y1="150" x2="180" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('AG')" class="cursor-pointer" />
              <line x1="150" y1="150" x2="80" y2="10" stroke="transparent" stroke-width="20" @click="toggleLine('BH')" class="cursor-pointer" />
              <line x1="180" y1="110" x2="50" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('CE')" class="cursor-pointer" />
              <line x1="80" y1="110" x2="150" y2="50" stroke="transparent" stroke-width="20" @click="toggleLine('DF')" class="cursor-pointer" />
              <g fill="#1e293b" font-weight="bold" font-size="16" stroke="none">
                <text x="35" y="165">A</text><text x="155" y="165">B</text><text x="185" y="125">C</text><text x="65" y="125">D</text>
                <text x="35" y="45">E</text><text x="155" y="45">F</text><text x="185" y="5">G</text><text x="65" y="5">H</text>
              </g>
            </svg>
          </div>
        </div>
      </main>
    </template>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</div>
</template>

<style scoped>
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right,#e2e8f0 1px,transparent 1px), linear-gradient(to bottom,#e2e8f0 1px,transparent 1px); background-size: 2rem 2rem; background-position: center center; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
</style>
