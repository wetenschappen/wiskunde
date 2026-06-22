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
  title: { type: String, default: 'Eulerpaden en Eigenschappen' },
  instruction: { type: String, default: 'Analyseer grafen op Eulerpaden en eigenschappen.' },
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
const showPathTrace = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

function generateLevel(lvl) {
  if (lvl === 0) {
    // Level 1: Eulerpad herkennen (huisje-graaf)
    return {
      name: 'Eulerpad bestaan', type: 'euler',
      instruction: 'Bekijk de "huisje"-graaf. Stelling van Euler: een graaf heeft een Eulerpad als er 0 of 2 knopen met oneven graad zijn.',
      questions: [
        { id:'odd', label:'Aantal knopen met ONEVEN graad:', correct: 2 },
        { id:'path', label:'Bestaat er een Eulerpad?', correct: 'Ja' }
      ],
      successText: 'Perfect! Omdat er exact 2 knopen met oneven graad zijn (de twee onderste, graad 3), is er een Eulerpad mogelijk.',
      hints: [
        'Hint 1: Tel voor elke knoop het aantal bogen. Noteer de graden. Welke zijn oneven?',
        'Hint 2: De topknoop heeft graad 2, de linkse/rechtse middenknopen graad 4, de onderste knopen graad 3.',
        `Hint 3: Methode: 1) Bepaal graad van elke knoop. 2) Tel oneven graden (= knopen met oneven aantal bogen). 3) Eulerpad als 0 of 2 oneven. De laatste stap... (vul zelf in: als 0: Euler-kring; als 2: Euler-pad).`
      ]
    }
  } else if (lvl === 1) {
    // Level 2: Specifieke graad bepalen, daarna zelf een Eulerpad tekenen
    const colors = ['roze','blauw','geel']
    const nodesByColor = [
      { node:'top', color:'roze', correct:2 },
      { node:'links-midden', color:'blauw', correct:4 },
      { node:'rechtsonder', color:'geel', correct:3 }
    ]
    const chosen = nodesByColor[randInt(0, nodesByColor.length-1)]
    return {
      name: 'Graad & Eulerpad', type: 'trace',
      instruction: `Bepaal eerst de graad van de ${chosen.color}e knoop. Daarna: teken een Eulerpad door de knopen in de juiste volgorde te noteren.`,
      questions: [
        { id:'deg', label:`Graad van de ${chosen.color}e knoop:`, correct: chosen.correct }
      ],
      targetColor: chosen.color,
      successText: `Juist! De ${chosen.color}e knoop heeft graad ${chosen.correct}.`,
      hints: [
        'Hint 1: Tel de bogen die vertrekken uit de gevraagde knoop.',
        'Hint 2: Kijk naar de knoop in de tekening. Elke lijn telt als 1.',
        'Hint 3: Methode: elke boog die aan de knoop vastzit telt een keer. De laatste stap... (vul zelf in: het totaal is de graad).'
      ]
    }
  } else {
    // Level 3: Toepassing — modelleren met Eulerpaden
    const problems = [
      { question: 'Een postbode moet door elke straat van een wijk minstens een keer. Het stratenplan heeft 4 kruispunten met oneven graad. Kan de postbode een route lopen zonder een straat twee keer te doen?', answer: 'Nee', explanation: 'Een Eulerpad vereist 0 of 2 oneven knopen. Met 4 oneven knopen is het onmogelijk.' },
      { question: 'Een sneeuwruimer moet alle wegen van een stad schoonmaken. Het wegennet heeft 0 knopen met oneven graad. Bestaat er een route die elke weg precies een keer neemt en terugkeert naar het startpunt?', answer: 'Ja', explanation: '0 oneven knopen = Euler-kring. De sneeuwruimer kan vertrekken en terugkeren zonder een weg te missen.' },
      { question: 'Een toerist wil elke brug in een park bezoeken zonder een brug twee keer over te steken. Er zijn 2 knopen met oneven graad. Is dit mogelijk?', answer: 'Ja', explanation: '2 oneven knopen = Eulerpad. De toerist moet starten en eindigen in de twee oneven knopen.' }
    ]
    const p = problems[randInt(0, problems.length-1)]
    return {
      name: 'Eulerpad toepassen', type: 'apply',
      instruction: p.question,
      questions: [
        { id:'conclusion', label:'Jouw conclusie:', correct: p.answer }
      ],
      explanation: p.explanation,
      successText: `Correct! ${p.explanation}`,
      hints: [
        'Hint 1: De stelling van Euler: 0 oneven knopen = Euler-kring, 2 = Euler-pad, >2 = geen van beide.',
        'Hint 2: Tel het aantal knopen met oneven graad in het netwerk.',
        'Hint 3: Methode: 1) Tel oneven knopen. 2) 0: kring mogelijk (start=stop). 2: pad mogelijk (start≠stop). >2: onmogelijk. De laatste stap... (vul zelf in: 4 of meer oneven = geen Eulerpad of -kring).'
      ]
    }
  }
}

function generateLevels() { const arr=[]; for(let i=0;i<totalInternalLevels;i++) arr.push(generateLevel(i)); levels.value=arr }
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const userAnswers = ref({})
const userDeg = ref('')
const userPathChoice = ref(null)

function getHintText() {
  const hints = currentLevel.value.hints
  return hints[Math.min(attemptCount.value-1, hints.length-1)]
}

function checkAnswer() {
  isChecked.value=true
  let allCorrect = true
  const level = currentLevel.value

  if (level.type === 'euler' || level.type === 'trace') {
    if (level.type === 'euler') {
      const oddCorrect = parseInt(userOdd.value) === level.questions.find(q=>q.id==='odd').correct
      const pathCorrect = userHasPath.value === level.questions.find(q=>q.id==='path').correct
      if (oddCorrect && pathCorrect) allCorrect = true
      else {
        allCorrect = false
        if (!oddCorrect) {
          attemptCount.value++
          feedback.value={type:'error',text:'Het aantal oneven knopen klopt niet. ' + getHintText()}
          return
        } else {
          attemptCount.value++
          feedback.value={type:'error',text:'Het aantal oneven knopen klopt, maar de conclusie over het Eulerpad niet. ' + getHintText()}
          return
        }
      }
    } else if (level.type === 'trace') {
      const degCorrect = parseInt(userDeg.value) === level.questions.find(q=>q.id==='deg').correct
      if (degCorrect) allCorrect = true
      else {
        allCorrect = false
        attemptCount.value++
        feedback.value={type:'error',text:'De graad klopt niet. ' + getHintText()}
        return
      }
    }
  } else if (level.type === 'apply') {
    allCorrect = userPathChoice.value === level.questions.find(q=>q.id==='conclusion').correct
    if (!allCorrect) {
      attemptCount.value++
      feedback.value={type:'error',text:'Niet juist. ' + getHintText()}
      return
    }
  }

  if (allCorrect) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:level.successText}
  }
}

const userOdd = ref('')
const userHasPath = ref(null)

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:''}; attemptCount.value=0
  userOdd.value=''; userHasPath.value=null; userDeg.value=''; userPathChoice.value=null
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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: Eulerpaden</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">De stelling van Euler (1736):</p>
          <div class="space-y-3 text-slate-700">
            <p>Een graaf heeft een Eulerpad (elke boog exact een keer, niet per se terug naar start) als het aantal knopen met oneven graad <strong>0 of 2</strong> is.</p>
            <p><strong>0 oneven knopen</strong> &rarr; Euler-kring (start = einde).</p>
            <p><strong>2 oneven knopen</strong> &rarr; Euler-pad (start en einde zijn de oneven knopen).</p>
            <p><strong>>2 oneven knopen</strong> &rarr; geen Eulerpad mogelijk.</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: de "huisje"-graaf</p>
            <p class="text-slate-600">Graden: top=2, links-midden=4, rechts-midden=4, links-onder=3, rechts-onder=3.</p>
            <p class="text-slate-600">Oneven: 2 knopen (3). Eulerpad? <strong>Ja</strong>!</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Eulerpad of niet?</h3>
        <p class="text-slate-600 mb-6">Een graaf heeft 5 knopen met graden: 2, 4, 4, 3, 3. Bestaat er een Eulerpad?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('ja')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Ja, want er zijn 2 oneven knopen</button>
          <button @click="handlePrediction('nee')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Nee, want er zijn te veel oneven knopen</button>
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
            <MathText :content="currentLevel.instruction" class="mb-4 prose prose-sm text-slate-600" />

            <div class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">
              <template v-if="currentLevel.type==='euler'">
                <div><label class="block mb-2 text-sm font-bold text-slate-700">1. Aantal knopen met oneven graad:</label><input type="number" v-model="userOdd" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="Aantal = ?" /></div>
                <div><label class="block mb-2 text-sm font-bold text-slate-700">2. Bestaat er een Eulerpad?</label><div class="flex gap-2"><button v-for="opt in ['Ja','Nee']" :key="opt" @click="if(!isCorrect){userHasPath=opt;isChecked=false}" class="flex-1 p-4 border-2 rounded-lg font-bold transition-all text-center" :class="userHasPath===opt?'border-amber-500 bg-amber-50 text-amber-700':'border-slate-200 bg-white text-slate-700'">{{ opt }}</button></div></div>
              </template>
              <template v-else-if="currentLevel.type==='trace'">
                <div><label class="block mb-2 text-sm font-bold text-slate-700">Graad van de {{ currentLevel.targetColor }}e knoop:</label><input type="number" v-model="userDeg" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="Graad = ?" /></div>
              </template>
              <template v-else-if="currentLevel.type==='apply'">
                <div><label class="block mb-2 text-sm font-bold text-slate-700">Conclusie:</label><div class="flex gap-2"><button v-for="opt in ['Ja','Nee']" :key="opt" @click="if(!isCorrect){userPathChoice=opt;isChecked=false}" class="flex-1 p-4 border-2 rounded-lg font-bold transition-all text-center" :class="userPathChoice===opt?'border-amber-500 bg-amber-50 text-amber-700':'border-slate-200 bg-white text-slate-700'">{{ opt }}</button></div></div>
              </template>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">De stelling van Euler is een van de oudste stellingen uit de grafentheorie (1736). Ze zegt dat een graaf een Eulerpad heeft als er 0 of 2 knopen met oneven graad zijn. Een oneven graad betekent dat je de knoop evenveel keer moet verlaten als binnenkomen — bij oneven graad lukt dat niet tenzij je daar start of eindigt.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Graad verkeerd tellen:</strong> Een diagonale lijn is ook een boog! Tel ALLE bogen aan een knoop.</li>
                <li><strong>Oneven ≠ oneven aantal verbindingen:</strong> 3 is oneven (1e en 3e), 4 is even (2e en 4e). Controleer elk getal apart.</li>
                <li><strong>Eulerpad vs Euler-kring:</strong> Bij 0 oneven knopen = kring (start = einde). Bij 2 oneven knopen = pad (start ≠ einde). Beide zijn geldige Eulerpaden!</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is de stelling van Euler nuttig voor praktische problemen zoals postbedeling, sneeuwruimen of bridgen?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD K3: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je Eulerpaden kan toepassen op reele problemen. Vul aan: "Een graaf heeft een Eulerpad als het aantal knopen met _____ graad _____ of _____ is. Dit gebruik ik om problemen op te lossen zoals _____."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="currentLevel.type==='euler'?(!userOdd||!userHasPath):currentLevel.type==='apply'?!userPathChoice:!userDeg" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white rounded-xl shadow-md border border-slate-300 w-[400px] h-[400px] flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 200 200">
                <g stroke="#94a3b8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="50" y1="150" x2="150" y2="150" /><line x1="50" y1="150" x2="50" y2="80" /><line x1="150" y1="150" x2="150" y2="80" /><line x1="50" y1="80" x2="150" y2="80" />
                  <line x1="50" y1="150" x2="150" y2="80" /><line x1="150" y1="150" x2="50" y2="80" />
                  <line x1="50" y1="80" x2="100" y2="30" /><line x1="150" y1="80" x2="100" y2="30" />
                </g>
                <circle cx="100" cy="30" r="12" fill="#ec4899" stroke="#fff" stroke-width="3" />
                <circle cx="50" cy="80" r="12" fill="#3b82f6" stroke="#fff" stroke-width="3" />
                <circle cx="150" cy="80" r="12" fill="#3b82f6" stroke="#fff" stroke-width="3" />
                <circle cx="50" cy="150" r="12" fill="#f59e0b" stroke="#fff" stroke-width="3" />
                <circle cx="150" cy="150" r="12" fill="#f59e0b" stroke="#fff" stroke-width="3" />
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
