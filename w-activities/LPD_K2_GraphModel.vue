<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhGraph, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Grafen Interpreteren' },
  instruction: { type: String, default: 'Interpreteer een graaf als model van een reele situatie.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhGraph }
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

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

function generateLevel(lvl) {
  if (lvl === 0) {
    // Level 1: Graad van een knoop — model: sociaal netwerk
    const nodes = ['A','B','C','D']
    const targetNode = nodes[randInt(0,3)]
    // Fixed graph: A(3), B(2), C(1), D(2)
    const degMap = { 'A':3, 'B':2, 'C':1, 'D':2 }
    const correct = degMap[targetNode]
    return {
      name: `Graad van knoop ${targetNode}`,
      question: `Dit is een model van een sociaal netwerk. Elke knoop = persoon, elke lijn = vriendschap. Wat is de graad van persoon ${targetNode}?`,
      correctAnswer: correct,
      targetNode,
      successText: `Juist! ${targetNode} heeft graad ${correct}: ${targetNode} is bevriend met ${correct} mensen.`,
      hints: [
        'Hint 1: De graad is het aantal bogen dat aan een knoop vastzit. Tel de lijnen.',
        'Hint 2: Kijk naar knoop ' + targetNode + ' in de tekening. Hoeveel lijnen komen eruit?',
        `Hint 3: Methode: 1) Zoek knoop ${targetNode}. 2) Tel het aantal bogen dat vertrekt. De laatste stap... (vul zelf in: dat getal is de graad). Het antwoord is ${correct}.`
      ]
    }
  } else if (lvl === 1) {
    // Level 2: Wat stelt de graaf voor? Model herkennen
    const models = [
      { name: 'Vervoersnetwerk', scenario: 'Steden verbonden door wegen', degSum: 8, edges:4 },
      { name: 'Vriendennetwerk', scenario: 'Mensen die elkaar kennen', degSum: 8, edges:4 },
      { name: 'Computernetwerk', scenario: 'Computers verbonden via kabels', degSum: 8, edges:4 }
    ]
    const m = models[randInt(0, models.length-1)]
    return {
      name: 'Graaf als model', type: 'concept',
      question: `Deze graaf stelt een ${m.name.toLowerCase()} voor. De som van alle graden = ${m.degSum}. Hoeveel bogen (verbindingen) bevat de graaf? Tip: som der graden = 2 × aantal bogen.`,
      correctAnswer: m.edges,
      targetNode: null,
      successText: `Correct! ${m.degSum}/2 = ${m.edges} bogen. Dit is een model van een ${m.name.toLowerCase()}.`,
      hints: [
        'Hint 1: De som van alle graden is altijd 2 × aantal bogen.',
        `Hint 2: ${m.degSum} ÷ 2 = ?`,
        'Hint 3: Methode: som der graden / 2 = aantal bogen. De laatste stap... (vul zelf in: controleer of elk oneven getal een even som geeft).'
      ]
    }
  } else {
    // Level 3: Interpretatievraag — wat betekent de graad?
    return {
      name: 'Interpretatie', type: 'interpret',
      question: 'In een vriendennetwerk heeft knoop A graad 3, knoop B graad 0. Wat betekent het dat B graad 0 heeft?',
      correctAnswer: 'geen vrienden',
      successText: 'Juist! Graad 0 = geisoleerde knoop = geen verbindingen. B heeft geen vrienden in dit netwerk.',
      hints: [
        'Hint 1: Wat betekent een boog in dit model? Het stelt een vriendschap voor.',
        'Hint 2: Als een knoop graad 0 heeft, dan zijn er 0 bogen die eraan vastzitten.',
        'Hint 3: Methode: graad = aantal bogen. Graad 0 = 0 bogen = geen verbindingen. De laatste stap... (vul zelf in: in een sociaal netwerk betekent dat...).'
      ],
      options: ['geen vrienden', '1 vriend', 'onbekend']
    }
  }
}

function generateLevels() { const arr=[]; for(let i=0;i<totalInternalLevels;i++) arr.push(generateLevel(i)); levels.value=arr }
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const userAnswer = ref('')
const userChoice = ref(null)

function getHintText() {
  const c = attemptCount.value
  const hints = currentLevel.value.hints
  return hints[Math.min(c-1, hints.length-1)]
}

function checkAnswer() {
  isChecked.value=true
  const level=currentLevel.value
  let correct = false

  if (level.type === 'interpret') {
    correct = userChoice.value === level.correctAnswer
  } else {
    correct = parseInt(userAnswer.value) === level.correctAnswer
  }

  if (correct) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:level.successText}
  } else {
    attemptCount.value++
    isCorrect.value=false
    const hints=level.hints
    feedback.value={type:'error',text:hints[Math.min(attemptCount.value-1, hints.length-1)]}
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:''}; attemptCount.value=0; userAnswer.value=''; userChoice.value=null
  showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false; generateLevels()
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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: graaf als model</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Hoe lees je een graaf?</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1:</strong> Identificeer wat de knopen voorstellen (personen, steden, computers...).</p>
            <p><strong>Stap 2:</strong> Identificeer wat de bogen voorstellen (vriendschap, wegen, kabels...).</p>
            <p><strong>Stap 3:</strong> De graad van een knoop = aantal bogen dat eraan vastzit.</p>
            <p><strong>Stap 4:</strong> De som van ALLE graden = 2 × aantal bogen (elke boog telt immers 2 keer mee).</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: sociaal netwerk met 4 personen</p>
            <p class="text-slate-600">A(3), B(2), C(1), D(2). Som = 8. Aantal bogen = 8/2 = 4.</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 items-center justify-center mx-auto mb-4 flex"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Wat is een graad?</h3>
        <p class="text-slate-600 mb-6">In een graaf noemen we het aantal bogen dat aan een knoop vastzit de...</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('graad')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">graad van de knoop</button>
          <button @click="handlePrediction('gewicht')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">gewicht van de knoop</button>
          <button @click="handlePrediction('hoogte')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">hoogte van de knoop</button>
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
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl mb-4"><p class="font-bold text-amber-800 text-sm">{{ currentLevel.name }}</p></div>
            <MathText :content="currentLevel.question" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4">
              <template v-if="currentLevel.type === 'interpret'">
                <p class="text-sm font-bold text-slate-700 mb-2">Kies het juiste antwoord:</p>
                <div class="flex flex-col gap-2">
                  <button v-for="opt in currentLevel.options" :key="opt" @click="userChoice=opt; isChecked=false" class="p-4 border-2 rounded-xl font-bold text-left transition-all" :class="userChoice===opt?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-slate-200 hover:border-indigo-300 bg-white text-slate-700'">{{ opt }}</button>
                </div>
              </template>
              <template v-else>
                <label class="block mb-2 text-sm font-bold text-slate-700">Jouw antwoord:</label>
                <input type="number" v-model="userAnswer" @keyup.enter="checkAnswer" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="Bv. 3" />
              </template>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">Een graaf is een abstract model dat enkel de structuur van verbindingen weergeeft, niet de fysieke afstand of locatie. Dit maakt grafen krachtig om overal toe te passen waar relaties belangrijk zijn: sociale netwerken, transport, computer-netwerken, en zelfs moleculaire structuren.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Graad verwarren met iets anders:</strong> De graad is het aantal verbindingen, niet de waarde van de knoop of de afstand.</li>
                <li><strong>Som der graden:</strong> Elke boog telt twee keer in de som. Deel door 2 om het aantal bogen te krijgen.</li>
                <li><strong>Geïsoleerde knoop:</strong> Graad 0 betekent geen enkele verbinding. De knoop staat alleen.</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is het handig om een sociaal netwerk als een graaf voor te stellen? Wat zie je makkelijker in een graaf dan in een tabel?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD K2: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je een graaf kan interpreteren als model van een reele situatie. Vul aan: "In een graaf stellen de _____ de objecten voor en de _____ de relaties. De _____ van een knoop zegt hoeveel relaties die knoop heeft."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="currentLevel.type==='interpret'?!userChoice:!userAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[400px] flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 200 200">
                <line x1="100" y1="50" x2="50" y2="150" stroke="#cbd5e1" stroke-width="4" />
                <line x1="100" y1="50" x2="150" y2="150" stroke="#cbd5e1" stroke-width="4" />
                <line x1="100" y1="50" x2="100" y2="150" stroke="#cbd5e1" stroke-width="4" />
                <line x1="50" y1="150" x2="100" y2="150" stroke="#cbd5e1" stroke-width="4" />
                <template v-if="currentLevel.targetNode==='A'"><line x1="100" y1="50" x2="50" y2="150" stroke="#0ea5e9" stroke-width="5" /><line x1="100" y1="50" x2="150" y2="150" stroke="#0ea5e9" stroke-width="5" /><line x1="100" y1="50" x2="100" y2="150" stroke="#0ea5e9" stroke-width="5" /></template>
                <template v-else-if="currentLevel.targetNode==='B'"><line x1="100" y1="50" x2="50" y2="150" stroke="#f59e0b" stroke-width="5" /><line x1="50" y1="150" x2="100" y2="150" stroke="#f59e0b" stroke-width="5" /></template>
                <template v-else-if="currentLevel.targetNode==='C'"><line x1="100" y1="50" x2="150" y2="150" stroke="#10b981" stroke-width="5" /></template>
                <template v-else-if="currentLevel.targetNode==='D'"><line x1="100" y1="50" x2="100" y2="150" stroke="#8b5cf6" stroke-width="5" /><line x1="50" y1="150" x2="100" y2="150" stroke="#8b5cf6" stroke-width="5" /></template>
                <circle cx="100" cy="50" r="15" :fill="currentLevel.targetNode==='A'?'#0ea5e9':'#94a3b8'" stroke="#fff" stroke-width="3" /><text x="100" y="55" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">A</text>
                <circle cx="50" cy="150" r="15" :fill="currentLevel.targetNode==='B'?'#f59e0b':'#94a3b8'" stroke="#fff" stroke-width="3" /><text x="50" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">B</text>
                <circle cx="150" cy="150" r="15" :fill="currentLevel.targetNode==='C'?'#10b981':'#94a3b8'" stroke="#fff" stroke-width="3" /><text x="150" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">C</text>
                <circle cx="100" cy="150" r="15" :fill="currentLevel.targetNode==='D'?'#8b5cf6':'#94a3b8'" stroke="#fff" stroke-width="3" /><text x="100" y="155" text-anchor="middle" font-weight="bold" fill="#fff" font-size="14">D</text>
              </svg>
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
