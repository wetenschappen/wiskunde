<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhCirclesThree, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Telproblemen met Venn- en Boomdiagrammen' },
  instruction: { type: String, default: 'Los telproblemen op met Venn- of boomdiagrammen.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhCirclesThree }
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
const showPredictionGate = ref(false)
const predictionChoice = ref(null)
const predictionMade = ref(false)
const showReflection = ref(false)
const reflectionDone = ref(false)
const showLPDEvidence = ref(false)
const lpdDone = ref(false)
const showWhySection = ref(false)
const showErrorAnalysis = ref(false)
// currentDiagramType is computed below (line ~109)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function r(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const labelPairs = [['Voetbal','Tennis'],['Wiskunde','Engels'],['Fictie','Non-fictie'],['Koffie','Thee'],['Zwemmen','Hardlopen'],['Gitaar','Piano'],['Frans','Duits'],['Basketbal','Volleybal']]

function generateVennLevel(levelNum) {
  let center, leftOnly, rightOnly, outside
  if (levelNum===0){center=r(2,6);leftOnly=r(4,12);rightOnly=r(3,10);outside=r(3,10)}
  else if (levelNum===1){center=r(8,25);leftOnly=r(15,40);rightOnly=r(10,35);outside=r(5,20)}
  else {center=r(5,15);leftOnly=r(10,25);rightOnly=r(8,20);outside=r(3,15)}
  const total = leftOnly+center+rightOnly+outside
  const pair = labelPairs[r(0,labelPairs.length-1)]
  const [leftLbl,rightLbl] = pair
  return {
    type: 'venn', label:`${leftLbl} & ${rightLbl}`,
    instruction:`Er zijn ${total} personen. ${leftOnly+center} houden van ${leftLbl}, ${rightOnly+center} houden van ${rightLbl}, en ${center} houden van beide. Sleep de aantallen naar de juiste gebieden.`,
    total, leftLabel:leftLbl, rightLabel:rightLbl, leftTotal:leftOnly+center, rightTotal:rightOnly+center,
    correctMap:{left:leftOnly,center,right:rightOnly,outside},
    numbers:shuffle([leftOnly,center,rightOnly,outside])
  }
}

function generateTreeLevel(levelNum) {
  // Tree diagram: 2-stage experiment
  // Stage 1: choose category (e.g. boys/girls), Stage 2: choose preference (e.g. math/arts)
  const total = 40 + r(0, 60)
  const pctA = [0.4,0.45,0.5,0.55,0.6][r(0,4)]
  const countA = Math.round(total * pctA)
  const countB = total - countA
  const pctA1 = [0.3,0.35,0.4,0.45,0.5,0.55,0.6][r(0,6)]
  const pctA2 = 1 - pctA1
  const pctB1 = [0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6][r(0,8)]
  const pctB2 = 1 - pctB1
  const choices = [['Jongens','Meisjes'],['Mannen','Vrouwen'],['Lager','Hoger']]
  const preferences = [['Wiskunde','Talen'],['STEM','Kunst'],['Sport','Muziek'],['Fictie','Non-fictie']]
  const [catA, catB] = choices[r(0,choices.length-1)]
  const [pref1, pref2] = preferences[r(0,preferences.length-1)]
  const aa = Math.round(countA * pctA1); const ab = countA - aa
  const ba = Math.round(countB * pctB1); const bb = countB - ba
  const correctMap = {
    total, countA, countB, pctA1, pctA2, pctB1, pctB2,
    aa, ab, ba, bb
  }
  return {
    type: 'tree', label:`${catA} & ${catB} × ${pref1} & ${pref2}`,
    instruction:`Er zijn ${total} studenten. ${countA} zijn ${catA.toLowerCase()}, ${countB} zijn ${catB.toLowerCase()}. Van de ${catA.toLowerCase()} kiest ${(pctA1*100).toFixed(0)}% voor ${pref1}, de rest voor ${pref2}. Van de ${catB.toLowerCase()} kiest ${(pctB1*100).toFixed(0)}% voor ${pref1}, de rest voor ${pref2}. Vul de aantallen in het boomdiagram in.`,
    catA, catB, pref1, pref2,
    correctMap, question:`Hoeveel ${catA.toLowerCase()} kiezen ${pref1}?`,
    correctAnswer: aa, tolerance: 2,
    numbers: shuffle([countA, countB, aa, ab, ba, bb].filter(n => n > 0))
  }
}

function generateLevel() {
  const newLevels = []
  // Level 1: Venn diagram (basic)
  newLevels.push(generateVennLevel(0))
  // Level 2: Venn diagram (advanced)
  newLevels.push(generateVennLevel(1))
  // Level 3: Tree diagram
  newLevels.push(generateTreeLevel(2))
  levels.value = newLevels
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const currentDiagramType = computed(() => currentLevel.value?.type || 'venn')

// Venn state
const availableNumbers = ref([])
const slots = ref({ left: null, center: null, right: null, outside: null })
let draggedItem = null

// Tree state
const treeInputs = ref({ countA: null, aa: null, ab: null, countB: null, ba: null, bb: null })

function onDragStart(num) { draggedItem = num }
function onDrop(zone) {
  if (draggedItem!==null && slots.value[zone]===null) {
    slots.value[zone]=draggedItem
    availableNumbers.value=availableNumbers.value.filter(n=>n!==draggedItem)
    draggedItem=null; isChecked.value=false; feedback.value={type:'info',text:''}
    if (slots.value.left!==null&&slots.value.center!==null&&slots.value.right!==null&&slots.value.outside!==null) autoCheck()
  }
}
function returnToAvailable(zone) {
  const item=slots.value[zone]
  if (item!==null) { slots.value[zone]=null; availableNumbers.value.push(item); availableNumbers.value.sort((a,b)=>a-b); isChecked.value=false; isCorrect.value=false }
}
function autoCheck() {
  isChecked.value=true
  const cm = currentLevel.value.correctMap
  if (slots.value.left===cm.left&&slots.value.center===cm.center&&slots.value.right===cm.right&&slots.value.outside===cm.outside) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:'Prima! Je hebt de doorsnede correct verwerkt.'}
  } else {
    attemptCount.value++
    if (attemptCount.value<=1) feedback.value={type:'error',text:'Begin altijd met de doorsnede (midden). Trek dat af van de totalen.'}
    else if (attemptCount.value<=2) feedback.value={type:'error',text:`Trek het midden (${cm.center}) af: links=(${currentLevel.value.leftTotal}-${cm.center}=${cm.left}), rechts=(${currentLevel.value.rightTotal}-${cm.center}=${cm.right}).`}
    else feedback.value={type:'error',text:`Hint 3: Methode: 1) Noteer totalen. 2) Doorsnede in midden. 3) Alleen links = totaal links - doorsnede. 4) Alleen rechts = totaal rechts - doorsnede. De laatste stap... (vul zelf in: buiten = totaal - (links+midden+rechts)).`}
  }
}

// Tree diagram input
function updateTreeField(field, value) {
  treeInputs.value[field] = parseInt(value) || null
  // Auto-check when all 6 fields filled
  if (treeInputs.value.countA && treeInputs.value.aa && treeInputs.value.ab &&
      treeInputs.value.countB && treeInputs.value.ba && treeInputs.value.bb) {
    autoCheckTree()
  }
}

function autoCheckTree() {
  isChecked.value = true
  const cm = currentLevel.value.correctMap
  const ti = treeInputs.value
  const diff = Math.abs(ti.countA - cm.countA) + Math.abs(ti.countB - cm.countB) +
    Math.abs(ti.aa - cm.aa) + Math.abs(ti.ab - cm.ab) +
    Math.abs(ti.ba - cm.ba) + Math.abs(ti.bb - cm.bb)
  if (diff <= 4) {
    isCorrect.value = true; showWhySection.value = true; showErrorAnalysis.value = true; showReflection.value = true
    feedback.value = { type: 'success', text: 'Perfect! Het boomdiagram klopt helemaal.' }
  } else {
    attemptCount.value++
    if (attemptCount.value <= 1) feedback.value = { type: 'error', text: 'Controleer: de eerste takken zijn de aantallen per categorie. De tweede takken zijn percentages van die categorie.' }
    else if (attemptCount.value <= 2) feedback.value = { type: 'error', text: `Denk aan: ${currentLevel.value.catA} = ${cm.countA} (${(cm.countA*100/cm.total).toFixed(0)}% van ${cm.total}). Waarvan ${(cm.pctA1*100).toFixed(0)}% × ${cm.countA} = ${cm.aa} voor ${currentLevel.value.pref1}.` }
    else feedback.value = { type: 'error', text: 'Hint 3: Methode: 1) Deel totaal in categorieen. 2) Vermenigvuldig elke categorie met het percentage. 3) Controleer of de som klopt. De laatste stap... (vul zelf in: totale som = totaal).' }
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  attemptCount.value=0; showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
  availableNumbers.value=[...currentLevel.value.numbers]
  slots.value={left:null,center:null,right:null,outside:null}
  treeInputs.value={countA:null,aa:null,ab:null,countB:null,ba:null,bb:null}
  feedback.value={type:'info',text:currentDiagramType==='venn'?'Sleep de getallen naar de juiste gebieden.':'Vul de aantallen in het boomdiagram in.'}
  generateLevel()
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    if (!showReflection.value) { showReflection.value=true; return }
    if (!reflectionDone.value) { reflectionDone.value=true; return }
    if (currentInternalLevel.value===totalInternalLevels-2&&!showLPDEvidence.value) { showLPDEvidence.value=true; return }
    if (showLPDEvidence.value&&!lpdDone.value) { lpdDone.value=true; return }
    currentInternalLevel.value++; resetActivityState()
    showWorkedExample.value=currentInternalLevel.value===0
    nextTick(()=>mainArea.value?.focus())
  } else {
    if (!showLPDEvidence.value) { showLPDEvidence.value=true; return }
    if (!lpdDone.value) { lpdDone.value=true; return }
    if (props.currentStep<props.totalSteps) emit('update:currentStep',props.currentStep+1); else emit('complete')
  }
}

watch(()=>props.isOpen,(val)=>{
  if (val) {
    currentInternalLevel.value=0; resetActivityState()
    showWorkedExample.value=true; showPredictionGate.value=false
    predictionMade.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
    nextTick(()=>mainArea.value?.focus())
    window.addEventListener('keydown',handleKeydown)
  } else { window.removeEventListener('keydown',handleKeydown); shouldPulse.value=false }
},{immediate:true})
function handleKeydown(e){if(e.key==='Escape'&&props.isOpen)emit('close')}
onMounted(()=>{})
onUnmounted(()=>{window.removeEventListener('keydown',handleKeydown)})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
  <div class="relative flex w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

    <div v-if="showWorkedExample" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: Venn- en boomdiagrammen</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Twee manieren om telproblemen voor te stellen:</p>
          <div class="space-y-4">
            <div class="p-3 bg-white rounded-lg border border-amber-100">
              <p class="font-bold text-blue-700">Venn-diagram (twee verzamelingen):</p>
              <p class="text-sm text-slate-600 mt-1">Twee overlappende cirkels. De overlap = doorsnede (beide). Buiten = noch/noch.</p>
              <p class="text-sm text-slate-600 mt-1">Tip: begin altijd met de doorsnede!</p>
            </div>
            <div class="p-3 bg-white rounded-lg border border-amber-100">
              <p class="font-bold text-emerald-700">Boomdiagram (twee opeenvolgende keuzes):</p>
              <p class="text-sm text-slate-600 mt-1">Eerste tak: categorie (bv. jongens/meisjes). Tweede tak: voorkeur (bv. wiskunde/talen).</p>
              <p class="text-sm text-slate-600 mt-1">Aantallen op tweede niveau = percentage × aantal van eerste niveau.</p>
            </div>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Welk diagram past het best?</h3>
        <p class="text-slate-600 mb-6">Je krijgt straks een probleem over aantallen mensen die van sport houden. Welk diagram gebruik je als je wil weten wie van beide sporten, een van beide, of geen van beide houdt?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('venn')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Venn-diagram (overlappende cirkels)</button>
          <button @click="handlePrediction('tree')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Boomdiagram (takkenstructuur)</button>
        </div>
      </div>
    </div>

    <template v-if="!showWorkedExample&&!(showPredictionGate&&!predictionMade)">
      <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><div class="flex items-center gap-2"><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel+1 }} van {{ totalInternalLevels }}</p><div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i<=currentInternalLevel+1?'bg-amber-500':'bg-slate-200'"></div></div></div></div>
          <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"><PhX class="w-6 h-6" /></button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl mb-4"><p class="font-bold text-amber-800 text-sm">{{ currentLevel.type === 'venn' ? 'Venn-diagram' : 'Boomdiagram' }} &mdash; {{ currentLevel.label }}</p></div>
            <MathText :content="currentLevel.instruction" class="mb-4 prose prose-sm text-slate-600" />

            <!-- Trigger diagram type notice -->
            <div class="p-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p class="text-xs font-bold text-indigo-700">{{ currentInternalLevel < 2 ? 'Venn-diagram: sleep de getallen' : 'Boomdiagram: vul de aantallen in' }}</p>
            </div>

            <div v-if="showWhySection" class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">Venn-diagrammen helpen om overlappingen tussen verzamelingen te visualiseren. Boomdiagrammen tonen opeenvolgende keuzes en hun kansen. Beide maken telproblemen overzichtelijk en helpen om dubbeltellingen te vermijden.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mb-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Doorsnede dubbel tellen:</strong> Personen in de doorsnede horen bij beide groepen. Als je enkel "A" wil, trek je de doorsnede af van totaal A.</li>
                <li><strong>Boomdiagram:</strong> Aantallen op de tweede tak = percentage van de eerste tak, niet van het totaal.</li>
                <li><strong>Som controleren:</strong> De som van alle deelgroepen moet gelijk zijn aan het totaal.</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> kies je een Venn-diagram boven een boomdiagram (of omgekeerd)? Welk type probleem past bij welk diagram?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 35: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je telproblemen kan oplossen met diagrammen. Vul aan: "Bij twee overlappende groepen gebruik ik een _____ diagram. Bij opeenvolgende keuzes gebruik ik een _____ diagram. In beide gevallen moet de som van alle delen gelijk zijn aan ____."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
              <div v-else class="flex-1 py-4 text-center text-xs text-slate-400">{{ currentDiagramType === 'venn' ? 'Plaats alle getallen' : 'Vul alle velden in' }}</div>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <!-- Venn Diagram -->
            <div v-if="currentDiagramType === 'venn'" class="relative w-[500px] h-[350px] border-4 border-slate-300 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <div class="absolute top-2 left-2 font-bold text-slate-400">Totaal: {{ currentLevel.total }}</div>
              <div class="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center z-10 transition-colors" @dragover.prevent @drop.stop="onDrop('outside')" :class="slots.outside?'border-slate-400 bg-slate-100':'border-slate-300 bg-slate-50'">
                <span v-if="!slots.outside" class="text-xs text-slate-400 font-bold uppercase">Geen</span>
                <div v-else @click="returnToAvailable('outside')" class="w-full h-full flex items-center justify-center text-xl font-bold text-slate-800 cursor-pointer">{{ slots.outside }}</div>
              </div>
              <div class="relative flex w-full justify-center">
                <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-blue-400 bg-blue-100/30 top-1/2 -translate-y-1/2 left-[50px]">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-blue-600 bg-white px-2 rounded-lg text-xs">{{ currentLevel.leftLabel }} ({{ currentLevel.leftTotal }})</div>
                </div>
                <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-amber-500 bg-amber-50/30 top-1/2 -translate-y-1/2 right-[50px]">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-amber-600 bg-white px-2 rounded-lg text-xs">{{ currentLevel.rightLabel }} ({{ currentLevel.rightTotal }})</div>
                </div>
                <div class="relative flex w-full h-[240px] justify-center items-center z-10 pointer-events-none">
                  <div class="absolute left-[100px] pointer-events-auto">
                    <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm" @dragover.prevent @drop.stop="onDrop('left')" :class="slots.left?'border-blue-500':'border-blue-300'">
                      <span v-if="!slots.left" class="text-xs text-blue-400 font-bold">{{ currentLevel.leftLabel[0] }}\{{ currentLevel.rightLabel[0] }}</span>
                      <div v-else @click="returnToAvailable('left')" class="w-full h-full flex items-center justify-center text-xl font-bold text-blue-800 cursor-pointer">{{ slots.left }}</div>
                    </div>
                  </div>
                  <div class="absolute pointer-events-auto">
                    <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm" @dragover.prevent @drop.stop="onDrop('center')" :class="slots.center?'border-amber-500':'border-amber-300'">
                      <span v-if="!slots.center" class="text-xs text-amber-500 font-bold">{{ currentLevel.leftLabel[0] }}∩{{ currentLevel.rightLabel[0] }}</span>
                      <div v-else @click="returnToAvailable('center')" class="w-full h-full flex items-center justify-center text-xl font-bold text-amber-700 cursor-pointer">{{ slots.center }}</div>
                    </div>
                  </div>
                  <div class="absolute right-[100px] pointer-events-auto">
                    <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm" @dragover.prevent @drop.stop="onDrop('right')" :class="slots.right?'border-amber-500':'border-amber-300'">
                      <span v-if="!slots.right" class="text-xs text-amber-500 font-bold">{{ currentLevel.rightLabel[0] }}\{{ currentLevel.leftLabel[0] }}</span>
                      <div v-else @click="returnToAvailable('right')" class="w-full h-full flex items-center justify-center text-xl font-bold text-amber-700 cursor-pointer">{{ slots.right }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tree Diagram (Level 3) -->
            <div v-else class="relative w-full max-w-lg min-h-[350px] bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <p class="font-bold text-slate-500 mb-6 text-center">Boomdiagram: {{ currentLevel.catA }} / {{ currentLevel.catB }} &times; {{ currentLevel.pref1 }} / {{ currentLevel.pref2 }}</p>
              <div class="flex justify-center gap-6">
                <!-- Left branch -->
                <div class="flex flex-col items-center gap-2">
                  <input type="number" :value="treeInputs.countA" @input="updateTreeField('countA', $event.target.value)" class="w-20 h-12 text-center font-bold border-2 border-blue-300 rounded-lg focus:border-blue-500 outline-none" placeholder="?" />
                  <span class="text-xs font-bold text-blue-600">{{ currentLevel.catA }}</span>
                  <div class="flex gap-3 mt-2">
                    <div class="flex flex-col items-center gap-1">
                      <input type="number" :value="treeInputs.aa" @input="updateTreeField('aa', $event.target.value)" class="w-16 h-10 text-center font-bold border-2 border-emerald-300 rounded-lg focus:border-emerald-500 outline-none" placeholder="?" />
                      <span class="text-xs text-emerald-600">{{ currentLevel.pref1 }}</span>
                    </div>
                    <div class="flex flex-col items-center gap-1">
                      <input type="number" :value="treeInputs.ab" @input="updateTreeField('ab', $event.target.value)" class="w-16 h-10 text-center font-bold border-2 border-emerald-300 rounded-lg focus:border-emerald-500 outline-none" placeholder="?" />
                      <span class="text-xs text-emerald-600">{{ currentLevel.pref2 }}</span>
                    </div>
                  </div>
                </div>
                <!-- Right branch -->
                <div class="flex flex-col items-center gap-2">
                  <input type="number" :value="treeInputs.countB" @input="updateTreeField('countB', $event.target.value)" class="w-20 h-12 text-center font-bold border-2 border-blue-300 rounded-lg focus:border-blue-500 outline-none" placeholder="?" />
                  <span class="text-xs font-bold text-blue-600">{{ currentLevel.catB }}</span>
                  <div class="flex gap-3 mt-2">
                    <div class="flex flex-col items-center gap-1">
                      <input type="number" :value="treeInputs.ba" @input="updateTreeField('ba', $event.target.value)" class="w-16 h-10 text-center font-bold border-2 border-emerald-300 rounded-lg focus:border-emerald-500 outline-none" placeholder="?" />
                      <span class="text-xs text-emerald-600">{{ currentLevel.pref1 }}</span>
                    </div>
                    <div class="flex flex-col items-center gap-1">
                      <input type="number" :value="treeInputs.bb" @input="updateTreeField('bb', $event.target.value)" class="w-16 h-10 text-center font-bold border-2 border-emerald-300 rounded-lg focus:border-emerald-500 outline-none" placeholder="?" />
                      <span class="text-xs text-emerald-600">{{ currentLevel.pref2 }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-6 text-center text-xs text-slate-500">
                <span class="font-bold">Totaal:</span> {{ currentLevel.correctMap.total }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
  <SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</div>
</template>

<style scoped>
.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid { background-image: linear-gradient(to right,#e2e8f0 1px,transparent 1px), linear-gradient(to bottom,#e2e8f0 1px,transparent 1px); background-size: 2rem 2rem; background-position: center center; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
</style>
