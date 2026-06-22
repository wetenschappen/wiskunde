<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRobot,
  PhArrowClockwise, PhCaretUp, PhCaretRight, PhCaretDown, PhCaretLeft,
  PhBackspace, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Algoritme Debuggen' },
  instruction: { type: String, default: 'Bouw een algoritme met pijltjes om de robot naar het groene doel te sturen zonder muren te raken.' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhRobot }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Bouw je algoritme met de pijltjesknoppen.' })
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

function generateLevel() {
  const pool1 = [
    [{x:1,y:0},{x:1,y:1},{x:3,y:1},{x:2,y:3}],
    [{x:0,y:1},{x:2,y:0},{x:3,y:1}],
    [{x:1,y:0},{x:2,y:1},{x:1,y:3}]
  ]
  const pool2 = [
    [{x:1,y:1},{x:2,y:2},{x:3,y:2}],
    [{x:0,y:2},{x:1,y:2},{x:2,y:0}],
    [{x:1,y:0},{x:2,y:1},{x:3,y:3}]
  ]
  const pool3 = [
    [{x:0,y:1},{x:1,y:1},{x:1,y:2}],
    [{x:1,y:0},{x:0,y:2},{x:1,y:3},{x:2,y:2}],
    [{x:0,y:0},{x:1,y:1},{x:2,y:2},{x:3,y:3}]
  ]
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)]
  return [
    { name:'Level 1: Beginner', startX:0, startY:0, goalX:3, goalY:3, walls:pick(pool1), hint1:'Denk na over de route. Welke richting moet je eerst?', hint2:'Begin met naar rechts te gaan (rechtse muur ontwijken).', hint3:'Methode: 1) Teken de route. 2) Zet pijltjes per stap. 3) Test. De laatste stap... (vul zelf in: pas aan tot het werkt).' },
    { name:'Level 2: Gemiddeld', startX:0, startY:0, goalX:3, goalY:3, walls:pick(pool2), hint1:'Kijk waar de muren zijn. Welke weg is vrij?', hint2:'Probeer een omweg. Soms moet je eerst de verkeerde kant op om muren te vermijden.', hint3:'Methode: 1) Omtrek muren. 2) Plan een pad eromheen. 3) Zet pijltjes. De laatste stap... (vul zelf in: test en debug).' },
    { name:'Level 3: Expert', startX:0, startY:0, goalX:3, goalY:3, walls:pick(pool3), hint1:'Dit is een lastige lay-out. Plan zorgvuldig.', hint2:'Soms moet je 3 stappen rechts, dan 3 omhoog, of een omweg langs links.', hint3:'Methode: 1) Analyseer muurposities. 2) Kies veilige route. 3) Implementeer in pijltjes. De laatste stap... (vul zelf in: test, debug, optimaliseer).' }
  ]
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const gridSize = 4
const robotX = ref(0); const robotY = ref(0)
const startX = ref(0); const startY = ref(0)
const goalX = ref(3); const goalY = ref(3)
const walls = ref([])

watch(currentLevel, (lvl) => {
  if (!lvl) return
  startX.value=lvl.startX; startY.value=lvl.startY; goalX.value=lvl.goalX; goalY.value=lvl.goalY
  walls.value=lvl.walls; robotX.value=lvl.startX; robotY.value=lvl.startY
},{immediate:true})

const algorithm = ref([])
const isRunning = ref(false)
const crashStatus = ref(false)

function addCommand(cmd) { if(isRunning.value||isCorrect.value||algorithm.value.length>=12) return; algorithm.value.push(cmd); isChecked.value=false }
function removeLast() { if(isRunning.value||isCorrect.value) return; algorithm.value.pop(); isChecked.value=false }
function hasWall(x,y) { return walls.value.some(w=>w.x===x&&w.y===y) }

function runAlgorithm() {
  if(algorithm.value.length===0) { feedback.value={type:'error',text:'Het algoritme is leeg! Voeg instructies toe.'}; return }
  isRunning.value=true; isChecked.value=true; crashStatus.value=false
  robotX.value=startX.value; robotY.value=startY.value
  feedback.value={type:'info',text:'Programma wordt uitgevoerd...'}
  let step=0
  const interval = setInterval(() => {
    if(step>=algorithm.value.length) { clearInterval(interval); finishRun(); return }
    const cmd=algorithm.value[step]
    let nx=robotX.value, ny=robotY.value
    if(cmd==='up') ny++; if(cmd==='down') ny--; if(cmd==='right') nx++; if(cmd==='left') nx--
    if(nx<0||nx>=gridSize||ny<0||ny>=gridSize) { crashStatus.value=true; clearInterval(interval); finishRun(true); return }
    if(hasWall(nx,ny)) { crashStatus.value=true; clearInterval(interval); finishRun(true); return }
    robotX.value=nx; robotY.value=ny; step++
  }, 400)
}

function finishRun(crashed=false) {
  isRunning.value=false
  if(crashed) {
    isCorrect.value=false; attemptCount.value++
    const lvl=currentLevel.value
    if(attemptCount.value<=1) feedback.value={type:'error',text:`BAM! Robot gecrasht. Bug gevonden! ${lvl.hint1}`}
    else if(attemptCount.value<=2) feedback.value={type:'error',text:`Bijna! ${lvl.hint2}`}
    else feedback.value={type:'error',text:lvl.hint3}
  } else if(robotX.value===goalX.value&&robotY.value===goalY.value) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:'Prima! Algoritme succesvol! De robot heeft het doel bereikt zonder te crashen.'}
  } else {
    isCorrect.value=false; attemptCount.value++
    const lvl=currentLevel.value
    if(attemptCount.value<=1) feedback.value={type:'error',text:`Programma gestopt maar doel niet bereikt. Je mist instructies. ${lvl.hint1}`}
    else if(attemptCount.value<=2) feedback.value={type:'error',text:`Doel=(3,3). Je start op (0,0). ${lvl.hint2}`}
    else feedback.value={type:'error',text:lvl.hint3}
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  levels.value=generateLevel()
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Bouw je algoritme met de pijltjesknoppen.'}
  algorithm.value=[]; isRunning.value=false; crashStatus.value=false; attemptCount.value=0
  showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
}

function resetPosition() { robotX.value=startX.value; robotY.value=startY.value; isChecked.value=false; crashStatus.value=false; feedback.value={type:'info',text:'Pas je code aan en probeer opnieuw.'} }

function handleNext() {
  if(currentInternalLevel.value<totalInternalLevels-1) {
    if(!showReflection.value){showReflection.value=true;return}
    if(!reflectionDone.value){reflectionDone.value=true;return}
    if(currentInternalLevel.value===totalInternalLevels-2&&!showLPDEvidence.value){showLPDEvidence.value=true;return}
    if(showLPDEvidence.value&&!lpdDone.value){lpdDone.value=true;return}
    currentInternalLevel.value++; resetActivityState()
    showWorkedExample.value=currentInternalLevel.value===0
    nextTick(()=>mainArea.value?.focus())
  } else {
    if(!showLPDEvidence.value){showLPDEvidence.value=true;return}
    if(!lpdDone.value){lpdDone.value=true;return}
    if(props.currentStep<props.totalSteps) emit('update:currentStep',props.currentStep+1); else emit('complete')
  }
}

watch(()=>props.isOpen,(val)=>{
  if(val){currentInternalLevel.value=0;resetActivityState();showWorkedExample.value=true;showPredictionGate.value=false;predictionMade.value=false;reflectionDone.value=false;showLPDEvidence.value=false;lpdDone.value=false;nextTick(()=>mainArea.value?.focus());window.addEventListener('keydown',handleKeydown)}
  else{window.removeEventListener('keydown',handleKeydown);shouldPulse.value=false}
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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: een algoritme bouwen en debuggen</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Stappenplan: algoritme ontwerpen</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1 (Analyseren):</strong> Bekijk de startpositie, het doel en de obstakels.</p>
            <p><strong>Stap 2 (Ontwerpen):</strong> Plan een route in je hoofd. Noteer de stappen.</p>
            <p><strong>Stap 3 (Implementeren):</strong> Zet de stappen om in pijltjes.</p>
            <p><strong>Stap 4 (Testen):</strong> Voer het algoritme uit. Werkt het?</p>
            <p><strong>Stap 5 (Debuggen):</strong> Als het fout gaat, zoek de fout en pas aan.</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: robot van (0,0) naar (3,3) zonder muren</p>
            <p class="text-slate-600 font-mono">Algoritme: [up, up, up, right, right, right]</p>
            <p class="text-slate-600">Test: robot beweegt 3 omhoog, dan 3 naar rechts. Doel (3,3) bereikt!</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 items-center justify-center mx-auto mb-4 flex"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Wat is de eerste stap?</h3>
        <p class="text-slate-600 mb-6">De robot start op (0,0) en moet naar (3,3). Er staat een muur op (1,0). Wat is de eerste beweging?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('up')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Omhoog (want naar rechts is geblokkeerd)</button>
          <button @click="handlePrediction('right')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Rechts (recht toe, recht aan)</button>
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

            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl flex flex-col gap-4">
              <label class="block text-sm font-bold text-slate-700">Bouw je algoritme:</label>
              <div class="grid grid-cols-3 gap-2 w-32 mx-auto">
                <div></div><button @click="addCommand('up')" :disabled="isRunning||isCorrect" class="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-all"><PhCaretUp weight="bold" class="w-6 h-6 text-slate-700" /></button><div></div>
                <button @click="addCommand('left')" :disabled="isRunning||isCorrect" class="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-all"><PhCaretLeft weight="bold" class="w-6 h-6 text-slate-700" /></button>
                <button @click="addCommand('down')" :disabled="isRunning||isCorrect" class="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-all"><PhCaretDown weight="bold" class="w-6 h-6 text-slate-700" /></button>
                <button @click="addCommand('right')" :disabled="isRunning||isCorrect" class="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-all"><PhCaretRight weight="bold" class="w-6 h-6 text-slate-700" /></button>
              </div>
              <div class="min-h-[60px] bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-wrap gap-2 items-center">
                <span v-if="algorithm.length===0" class="text-slate-400 text-sm italic">Code is leeg...</span>
                <div v-for="(cmd,idx) in algorithm" :key="idx" class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm animate-fadeIn">
                  <PhCaretUp v-if="cmd==='up'" weight="bold" /><PhCaretDown v-if="cmd==='down'" weight="bold" /><PhCaretLeft v-if="cmd==='left'" weight="bold" /><PhCaretRight v-if="cmd==='right'" weight="bold" />
                </div>
              </div>
              <button @click="removeLast" :disabled="isRunning||isCorrect||algorithm.length===0" class="self-end flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"><PhBackspace weight="fill" /> Wis laatste</button>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">Een algoritme is een exact stappenplan. Elke stap moet ondubbelzinnig zijn. De robot voert elke instructie letterlijk uit. Als er een fout zit (bug), voert de robot die fout ook uit. Debuggen is het proces van fouten zoeken en verbeteren -- een essentiële vaardigheid in computationeel denken.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>Te weinig stappen:</strong> Je hebt minstens 3 rechts en 3 omhoog nodig (soms meer door muren).</li>
                <li><strong>Muur over het hoofd gezien:</strong> Kijk goed waar de muren staan voor je de route plant.</li>
                <li><strong>Verkeerde volgorde:</strong> De volgorde van stappen is cruciaal. Eerst omhoog, dan rechts is anders dan eerst rechts, dan omhoog.</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is het belangrijk om een algoritme stap voor stap te testen? Wat gebeurt er als je een fout over het hoofd ziet?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 37: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt een algoritme ontworpen, getest en gedebugd. Vul aan: "Ik ontwerp een algoritme door eerst te _____, dan de stappen in _____ om te zetten, te testen, en te _____ als het fout gaat."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetPosition" :disabled="isRunning" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="runAlgorithm" :disabled="isRunning||algorithm.length===0" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98]">Voer Uit</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white shadow-md rounded-xl overflow-hidden border-8 border-slate-200 p-2" style="width:400px;height:400px;">
              <div class="absolute inset-2 grid grid-cols-4 grid-rows-4 gap-1 z-0">
                <template v-for="y in 4" :key="'ry'+y"><template v-for="x in 4" :key="'rx'+x">
                  <div class="bg-slate-100 rounded-lg relative flex items-center justify-center">
                    <div v-if="x-1===goalX&&4-y===goalY" class="absolute inset-1 bg-emerald-500/30 rounded-lg border-2 border-emerald-500 animate-pulse"></div>
                    <div v-if="hasWall(x-1,4-y)" class="absolute inset-0 bg-red-500/80 border-4 border-red-700 rounded-lg shadow-inner flex items-center justify-center"><PhX weight="bold" class="w-8 h-8 text-red-900/50" /></div>
                  </div>
                </template></template>
              </div>
              <div class="absolute w-[25%] h-[25%] transition-all duration-500 ease-in-out flex items-center justify-center z-10" :class="crashStatus?'animate-shake':''" :style="{ left:`${robotX*25}%`,bottom:`${robotY*25}%` }">
                <div class="w-16 h-16 bg-blue-500 border-4 border-white rounded-full shadow-md flex items-center justify-center" :class="crashStatus?'bg-red-500':''">
                  <PhRobot weight="fill" class="w-10 h-10 text-white" />
                  <div v-if="crashStatus" class="absolute inset-0 flex items-center justify-center"><PhX weight="bold" class="w-12 h-12 text-white" /></div>
                </div>
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
.animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) forwards; }
@keyframes shake { 10%,90%{transform:translate3d(-2px,0,0) rotate(-5deg)} 20%,80%{transform:translate3d(4px,0,0) rotate(5deg)} 30%,50%,70%{transform:translate3d(-8px,0,0) rotate(-10deg)} 40%,60%{transform:translate3d(8px,0,0) rotate(10deg)} }
</style>
