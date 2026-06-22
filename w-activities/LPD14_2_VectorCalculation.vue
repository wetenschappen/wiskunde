<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight,
  PhMathOperations, PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Rekenen met Vectoren' },
  instruction: { type: String, default: 'Klik op het raster om een vector te tekenen met de gevraagde norm (lengte) en richting.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhMathOperations }
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

const gridSize = 25; const originX = 150; const originY = 250

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function generateLevel() {
  const newLevels = []
  const pythTriples = [[3,4,5],[6,8,10],[5,12,13],[9,12,15]]
  const t1 = pythTriples[Math.floor(Math.random()*pythTriples.length)]
  newLevels.push({ goalText:`Opdracht 1: Teken een vector in Q1 met norm ||v|| = ${t1[2]}.`, validate:(x,y)=>x>0&&y>0&&Math.sqrt(x*x+y*y)===t1[2], target:{x:t1[0],y:t1[1]}, norm:t1[2] })
  const t2 = pythTriples[Math.floor(Math.random()*pythTriples.length)]
  newLevels.push({ goalText:`Opdracht 2: Teken een vector met norm ||v|| = ${t2[2]}, x negatief.`, validate:(x,y)=>x<0&&Math.sqrt(x*x+y*y)===t2[2], target:{x:-t2[0],y:t2[1]}, norm:t2[2] })
  newLevels.push({ goalText:'Opdracht 3: Teken de kortste eenheidsvector omlaag op de y-as.', validate:(x,y)=>x===0&&y===-1, target:{x:0,y:-1}, norm:1 })
  levels.value = newLevels
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const userPoint = ref(null)
const userNorm = computed(() => { if (!userPoint.value) return 0; return Math.sqrt(userPoint.value.x*userPoint.value.x+userPoint.value.y*userPoint.value.y) })

function handleGridClick(e) {
  if (isCorrect.value||showPredictionGate.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  let gridX = Math.round((e.clientX-rect.left-originX)/gridSize)
  let gridY = Math.round((originY-(e.clientY-rect.top))/gridSize)
  gridX = Math.max(-5,Math.min(gridX,8)); gridY = Math.max(-5,Math.min(gridY,8))
  userPoint.value = {x:gridX,y:gridY}; isChecked.value=false
  if (currentLevelData.value.validate(gridX,gridY)) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    const n = Math.sqrt(gridX*gridX+gridY*gridY)
    feedback.value={type:'success',text:`Perfect! Jouw vector (${gridX},${gridY}) heeft norm ||v|| = √(${gridX}²+${gridY}²) = ${n}.`}
  } else {
    attemptCount.value++
    const n = Math.sqrt(gridX*gridX+gridY*gridY)
    const target = currentLevelData.value.target
    if (attemptCount.value<=1) {
      // Check for common error: confusing norm formula (x+y instead of sqrt(x²+y²))
      if (Math.abs(gridX)+Math.abs(gridY) === currentLevelData.value.norm) {
        feedback.value={type:'error',text:`Let op! Je hebt de som van de lengtes (${Math.abs(gridX)}+${Math.abs(gridY)} = ${Math.abs(gridX)+Math.abs(gridY)}) berekend. De norm is de lengte via Pythagoras: √(x²+y²). Jouw vector √(${gridX}²+${gridY}²) = ${n%1===0?n:n.toFixed(2)} moet ${currentLevelData.value.norm} zijn.`}
      } else {
        feedback.value={type:'error',text:`Jouw vector heeft norm √(${gridX}²+${gridY}²)=${n%1===0?n:n.toFixed(2)}. Denk aan Pythagoras: zoek a,b zodat a²+b²=${currentLevelData.value.norm}²=${currentLevelData.value.norm*currentLevelData.value.norm}.`}
      }
    }
    else if (attemptCount.value<=2) {
      if (gridX===target.x) feedback.value={type:'error',text:`Je x klopt! Maar y moet ${target.y} zijn (norm blijft ${currentLevelData.value.norm}).`}
      else if (gridY===target.y) feedback.value={type:'error',text:`Je y klopt! Maar x moet ${target.x} zijn.`}
      else feedback.value={type:'error',text:`Hint 2: Het antwoord is in de buurt van (${target.x},${target.y}). Denk aan Pythagoreische drietallen.`}
    } else feedback.value={type:'error',text:'Hint 3: Methode: gebruik a² + b² = ' + (currentLevelData.value.norm*currentLevelData.value.norm) + '. Zoek twee gehele getallen die hieraan voldoen. De laatste stap: (vul zelf in of de tekens kloppen voor de richting). Het juiste antwoord is (' + target.x + ',' + target.y + ').'}
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Klik op het raster om je vector te tekenen.'}
  userPoint.value=null; attemptCount.value=0; generateLevel()
  showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: norm van een vector</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Stappenplan: ||v|| berekenen met Pythagoras</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1:</strong> Noteer de componenten v = (x, y).</p>
            <p><strong>Stap 2:</strong> Bereken x² en y².</p>
            <p><strong>Stap 3:</strong> Tel ze op: x² + y².</p>
            <p><strong>Stap 4:</strong> Neem de vierkantswortel: ||v|| = √(x² + y²).</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: v = (3, 4)</p>
            <p class="text-slate-600">||v|| = √(3² + 4²) = √(9 + 16) = √25 = <strong>5</strong>.</p>
            <p class="text-slate-600 mt-1">Om een vector met norm 5 te tekenen, zoek je dus (a,b) met a² + b² = 25. Bijv. (3,4), (4,3), (-3,4), etc.</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het, start de opdracht</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center mx-auto mb-4"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Hoe bereken je de lengte van een vector?</h3>
        <p class="text-slate-600 mb-6">Welke stelling gebruik je om de norm (lengte) van een vector te berekenen?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('pythagoras')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Stelling van Pythagoras</button>
          <button @click="handlePrediction('thaless')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Stelling van Thales</button>
          <button @click="handlePrediction('sinus')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Sinusregel</button>
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
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl mb-6 animate-fadeIn"><p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p></div>

            <div class="p-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner space-y-4 text-center">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">Jouw Vector</p>
              <div v-if="userPoint" class="font-mono text-2xl font-black text-amber-600">v = ({{ userPoint.x }}, {{ userPoint.y }})</div>
              <div v-else class="font-mono text-2xl font-black text-slate-300">v = (?, ?)</div>
              <div class="h-px bg-slate-200 w-full my-2"></div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Huidige Norm</p>
              <div v-if="userPoint" class="font-mono text-xl font-bold text-slate-700">||v|| = {{ userNorm%1===0?userNorm:userNorm.toFixed(2) }}</div>
              <div v-else class="font-mono text-xl font-bold text-slate-300">||v|| = ?</div>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">De norm van een vector is de afstand van de oorsprong tot het punt (x,y). Deze afstand bereken je met Pythagoras omdat de x- en y-as loodrecht op elkaar staan. De vector is de schuine zijde van een rechthoekige driehoek met rechthoekszijden x en y.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Kwadraten vergeten:</strong> x² + y², niet x + y. √(3²+4²) = √25 = 5, niet √7.</li>
                <li><strong>Negatieve tekens:</strong> (-3)² = +9. Het teken verdwijnt door het kwadraat.</li>
                <li><strong>Enkel positieve norm:</strong> Een norm is altijd positief. √(a²+b²) ≥ 0.</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is de norm altijd positief? Wat stelt de norm fysisch voor?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht, ga verder</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 14: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je vectoren kan tekenen met een gegeven norm. Vul aan: "De norm van vector (x,y) is ||v|| = ____. Dit is eigenlijk de ____ van de oorsprong naar het punt (x,y)."</p>
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
              <button v-else disabled class="flex-1 py-4 font-bold text-white rounded-lg bg-slate-400 cursor-not-allowed opacity-70">Klik op het raster</button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden cursor-crosshair" style="width:400px;height:400px;" @click="handleGridClick">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="none" stroke="#e2e8f0" stroke-width="1"/></pattern>
                  <marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" /></marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <line x1="150" y1="0" x2="150" y2="400" stroke="#94a3b8" stroke-width="2" /><line x1="0" y1="250" x2="400" y2="250" stroke="#94a3b8" stroke-width="2" />
                <g v-if="userPoint" opacity="0.4">
                  <line :x1="originX" :y1="originY" :x2="originX+userPoint.x*gridSize" :y2="originY" stroke="#64748b" stroke-width="2" stroke-dasharray="4,2" />
                  <line :x1="originX+userPoint.x*gridSize" :y1="originY" :x2="originX+userPoint.x*gridSize" :y2="originY-userPoint.y*gridSize" stroke="#64748b" stroke-width="2" stroke-dasharray="4,2" />
                  <text :x="originX+(userPoint.x*gridSize)/2" :y="originY+15" fill="#64748b" font-weight="bold" font-size="12" text-anchor="middle">{{ userPoint.x }}</text>
                  <text :x="originX+userPoint.x*gridSize+10" :y="originY-(userPoint.y*gridSize)/2" fill="#64748b" font-weight="bold" font-size="12">{{ userPoint.y }}</text>
                </g>
                <line v-if="userPoint" :x1="originX" :y1="originY" :x2="originX+userPoint.x*gridSize" :y2="originY-userPoint.y*gridSize" stroke="#4f46e5" stroke-width="4" marker-end="url(#arrow-indigo)" class="transition-all duration-150" />
                <circle v-if="userPoint" :cx="originX+userPoint.x*gridSize" :cy="originY-userPoint.y*gridSize" r="5" fill="#4f46e5" stroke="white" stroke-width="2" />
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
