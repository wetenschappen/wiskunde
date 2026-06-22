<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhArrowUpRight, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vectoren Tekenen' },
  instruction: { type: String, default: 'Lees de vector-opdracht en klik op het assenstelsel om het eindpunt van de resulterende vector aan te duiden (startend vanuit de oorsprong).' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhArrowUpRight }
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

const gridSize = 30; const originX = 150; const originY = 250

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const newLevels = []
  const a1x = Math.floor(Math.random()*3)+1; const a1y = Math.floor(Math.random()*3)+1
  const b1x = Math.floor(Math.random()*3)+2; const b1y = Math.floor(Math.random()*3)+1
  newLevels.push({ goalText:'Opdracht 1: Teken de SOM-vector v = a + b.', vecA:{x:a1x,y:a1y}, vecB:{x:b1x,y:b1y}, op:'a + b', target:{x:a1x+b1x,y:a1y+b1y} })
  const a2x = Math.floor(Math.random()*4)+3; const a2y = Math.floor(Math.random()*4)+2
  const b2x = Math.floor(Math.random()*3)+1; const b2y = Math.floor(Math.random()*3)+1
  newLevels.push({ goalText:'Opdracht 2: Teken de VERSCHIL-vector v = a - b.', vecA:{x:a2x,y:a2y}, vecB:{x:b2x,y:b2y}, op:'a - b', target:{x:a2x-b2x,y:a2y-b2y} })
  let a3x = Math.floor(Math.random()*4)-1; let a3y = Math.floor(Math.random()*4)-1
  if (a3x===0&&a3y===0){a3x=1;a3y=1}
  const scalar = [-2,-1,2,3][Math.floor(Math.random()*4)]
  newLevels.push({ goalText:`Opdracht 3: Teken v = ${scalar>0?'':'-'}${Math.abs(scalar)}·a (scalaire vermenigvuldiging).`, vecA:{x:a3x,y:a3y}, vecB:null, op:`${scalar}·a`, target:{x:scalar*a3x,y:scalar*a3y} })
  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userPoint = ref(null)

function handleGridClick(e) {
  if (isCorrect.value||showPredictionGate.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  let gridX = Math.round((e.clientX-rect.left-originX)/gridSize)
  let gridY = Math.round((originY-(e.clientY-rect.top))/gridSize)
  gridX = Math.max(-5,Math.min(gridX,8)); gridY = Math.max(-5,Math.min(gridY,8))
  userPoint.value = {x:gridX,y:gridY}; isChecked.value=false
  const t = currentLevelData.value.target
  if (gridX===t.x&&gridY===t.y) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:`Correct! De resulterende vector ligt op (${t.x}, ${t.y}).`}
  } else {
    attemptCount.value++
    if (gridX!==t.x&&gridY===t.y) feedback.value={type:'error',text:`Je y-coordinaat klopt! Maar x=${gridX} is fout. Herbereken de x-component van ${currentLevelData.value.op}.`}
    else if (gridX===t.x&&gridY!==t.y) feedback.value={type:'error',text:`Je x-coordinaat klopt! Maar y=${gridY} is fout. Herbereken de y-component van ${currentLevelData.value.op}.`}
    else if (attemptCount.value<=1) feedback.value={type:'error',text:`Let op! Zowel x als y kloppen niet. Je tekende (${gridX},${gridY}). Bij ${currentLevelData.value.op} werk je op de x- en y-componenten APART. De x-component van a is ${currentLevelData.value.vecA.x}. De y-component van a is ${currentLevelData.value.vecA.y}.`}
    else if (attemptCount.value<=2) feedback.value={type:'error',text:`Bewerking: ${currentLevelData.value.op}. a=(${currentLevelData.value.vecA.x},${currentLevelData.value.vecA.y})${currentLevelData.value.vecB?`, b=(${currentLevelData.value.vecB.x},${currentLevelData.value.vecB.y})`:''}. Reken x en y apart uit. Let op dat je + en − tekens correct toepast op elke component.`}
    else feedback.value={type:'error',text:`Hint 3: Methode voor ${currentLevelData.value.op}: pas de bewerking toe op de x-coordinaat en de y-coordinaat. De laatste stap... (vul zelf in: combineer de resultaten). Het juiste antwoord is (${t.x},${t.y}).`}
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Klik op het raster om je antwoord te markeren.'}
  userPoint.value=null; attemptCount.value=0; generateLevel()
  showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false
  showLPDEvidence.value=false; lpdDone.value=false
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
    if (props.currentStep<props.totalSteps) emit('update:currentStep',props.currentStep+1)
    else emit('complete')
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
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div>
          <h3 class="text-xl font-bold text-slate-800">Voorbeeld: vectoroptelling</h3>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Stappenplan: a + b berekenen en tekenen</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1:</strong> Noteer de componenten: a = (a<sub>x</sub>, a<sub>y</sub>), b = (b<sub>x</sub>, b<sub>y</sub>).</p>
            <p><strong>Stap 2:</strong> Tel de x-componenten: a<sub>x</sub> + b<sub>x</sub> = nieuwe x.</p>
            <p><strong>Stap 3:</strong> Tel de y-componenten: a<sub>y</sub> + b<sub>y</sub> = nieuwe y.</p>
            <p><strong>Stap 4:</strong> Teken de vector van de oorsprong naar (nieuwe x, nieuwe y).</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: a = (2,3), b = (3,1)</p>
            <p class="text-slate-600">a + b = (2+3, 3+1) = (5,4). Teken pijl van (0,0) naar (5,4).</p>
            <p class="text-slate-600 mt-1">Voor verschil: a - b = (2-3, 3-1) = (-1,2).</p>
            <p class="text-slate-600 mt-1">Voor scalaire: 2·a = (2·2, 2·3) = (4,6).</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het, start de opdracht</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Hoe tel je vectoren op?</h3>
        <p class="text-slate-600 mb-6">Je krijgt dadelijk twee vectoren a en b. Hoe bereken je a + b?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('componenten')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Tel de x- en y-componenten apart op</button>
          <button @click="handlePrediction('lengte')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Tel de lengtes van de vectoren op</button>
          <button @click="handlePrediction('hoek')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Tel de hoeken van de vectoren op</button>
        </div>
      </div>
    </div>

    <template v-if="!showWorkedExample&&!(showPredictionGate&&!predictionMade)">
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
                <div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i<=currentInternalLevel+1?'bg-amber-500':'bg-slate-200'"></div>
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
            <div class="p-5 border border-amber-200 bg-amber-50 rounded-xl mb-6 text-center animate-fadeIn shadow-sm">
              <p class="font-bold text-amber-800 text-lg">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl space-y-4 shadow-inner">
              <p class="font-bold text-slate-800 mb-2 uppercase tracking-wider text-xs">Gegeven Vectoren:</p>
              <ul class="text-lg font-mono font-bold text-slate-700 space-y-4">
                <li class="flex items-center gap-2"><span class="inline-block w-4 h-4 bg-blue-500 rounded-lg"></span>a = ({{ currentLevelData.vecA.x }}, {{ currentLevelData.vecA.y }})</li>
                <li v-if="currentLevelData.vecB" class="flex items-center gap-2"><span class="inline-block w-4 h-4 bg-emerald-500 rounded-lg"></span>b = ({{ currentLevelData.vecB.x }}, {{ currentLevelData.vecB.y }})</li>
                <li class="pt-4 mt-2 border-t-2 border-dashed border-slate-300"></li>
                <li v-if="userPoint" class="flex items-center gap-2 text-amber-600"><span class="inline-block w-4 h-4 bg-amber-500 rounded-lg"></span>v = ({{ userPoint.x }}, {{ userPoint.y }})</li>
                <li v-else class="flex items-center gap-2 text-slate-400"><span class="inline-block w-4 h-4 border-2 border-dashed border-slate-400 rounded-lg"></span>v = (?, ?)</li>
              </ul>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2">Waarom werkt dit?</h4>
              <p class="text-sm text-indigo-700">Vectoren optellen door componenten op te tellen werkt omdat de x- en y-richtingen onafhankelijk zijn. Een verandering in x heeft geen invloed op y en omgekeerd. Daarom kan je ze apart behandelen en daarna combineren. Dit is het fundamentele principe van vectorrekening in een cartesisch assenstelsel.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-sm text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Componenten door elkaar halen:</strong> Tel x bij x en y bij y. Niet x bij y optellen!</li>
                <li><strong>Scalaire vermenigvuldiging:</strong> 2·a betekent beide componenten met 2 vermenigvuldigen, niet optellen.</li>
                <li><strong>Verschil a - b:</strong> a<sub>x</sub> - b<sub>x</sub> en a<sub>y</sub> - b<sub>y</sub>. Let op de volgorde!</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-sm text-indigo-700 mb-3"><strong>Waarom</strong> is het handig dat vectoren in componenten worden uitgedrukt? Hoe zou je anders de som bepalen?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht, ga verder</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 13: Bewijs van beheersing</h4>
              <p class="text-sm text-emerald-700 mb-3">Je hebt bewezen dat je vectoren kan tekenen in een assenstelsel. Vul aan: "Om de som a + b te tekenen, tel ik de _____ apart op en teken ik de vector van de _____ naar het nieuwe punt."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" />
              </button>
              <button v-else disabled class="flex-1 py-4 font-bold text-white rounded-lg bg-slate-400 cursor-not-allowed opacity-70">Klik op het raster</button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair" style="width:400px;height:400px;" @click="handleGridClick">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="none" stroke="#e2e8f0" stroke-width="1"/></pattern>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker>
                  <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" /></marker>
                  <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" /></marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <line x1="150" y1="0" x2="150" y2="400" stroke="#94a3b8" stroke-width="2" />
                <line x1="0" y1="250" x2="400" y2="250" stroke="#94a3b8" stroke-width="2" />
                <line :x1="originX" :y1="originY" :x2="originX+currentLevelData.vecA.x*gridSize" :y2="originY-currentLevelData.vecA.y*gridSize" stroke="#3b82f6" stroke-width="4" marker-end="url(#arrow-blue)" class="transition-all duration-300" />
                <line v-if="currentLevelData.vecB" :x1="originX" :y1="originY" :x2="originX+currentLevelData.vecB.x*gridSize" :y2="originY-currentLevelData.vecB.y*gridSize" stroke="#10b981" stroke-width="4" marker-end="url(#arrow-emerald)" class="transition-all duration-300" />
                <line v-if="userPoint" :x1="originX" :y1="originY" :x2="originX+userPoint.x*gridSize" :y2="originY-userPoint.y*gridSize" stroke="#f97316" stroke-width="5" marker-end="url(#arrow-amber)" class="transition-all duration-150" />
                <circle v-if="userPoint" :cx="originX+userPoint.x*gridSize" :cy="originY-userPoint.y*gridSize" r="5" fill="#f97316" stroke="white" stroke-width="2" />
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
