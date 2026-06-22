<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour,
  PhArrowClockwise, PhLightbulb, PhTarget, PhStar
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Zeef van Eratosthenes' },
  instruction: { type: String, default: 'Voer de Zeef van Eratosthenes uit om priemgetallen te vinden. Klik: 1x = doorstrepen (geen priem), 2x = omcirkelen (priemgetal).' },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: false },
  icon: { type: Object, default: () => PhGridFour }
})
const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op getallen: 1x = doorstrepen, 2x = omcirkelen (priemgetal).' })
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

function generatePrimesUpTo(n) {
  const sieve = Array(n+1).fill(true); sieve[0]=false; sieve[1]=false
  for(let i=2;i*i<=n;i++) if(sieve[i]) for(let j=i*i;j<=n;j+=i) sieve[j]=false
  return sieve.reduce((acc,isPrime,idx)=>{if(isPrime)acc.push(idx);return acc},[])
}

function generateLevel() {
  const max1 = 8+Math.floor(Math.random()*5)
  const primes1 = generatePrimesUpTo(max1)
  const max2 = 18+Math.floor(Math.random()*7)
  const primes2 = generatePrimesUpTo(max2)
  const max3 = 28+Math.floor(Math.random()*7)
  const primes3 = generatePrimesUpTo(max3)
  return [
    { maxNum:max1, primes:primes1, instruction:`Level 1: Getallen 1 t/m ${max1}.<br/>Stap 1: Streep 1 door. Stap 2: Omcirkel 2, streep veelvouden door. Stap 3: Omcirkel 3, streep veelvouden door. Stap 4: Herhaal.`, successFeedback:`Prima! Priemgetallen tot ${max1}: ${primes1.join(', ')}.` },
    { maxNum:max2, primes:primes2, instruction:`Level 2: Getallen 1 t/m ${max2} - uitgebreide zeef.<br/>Voer het algoritme systematisch uit.`, successFeedback:`Uitstekend! Priemgetallen tot ${max2}: ${primes2.join(', ')}.` },
    { maxNum:max3, primes:primes3, instruction:`Level 3: Getallen 1 t/m ${max3} - de echte uitdaging.<br/>Er zijn ${primes3.length} priemgetallen.`, successFeedback:`Fenomenaal! Alle ${primes3.length} priemgetallen tot ${max3} gevonden!` }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const numStates = ref([])

function cycleState(index) {
  if(isCorrect.value) return
  const s = numStates.value[index]
  numStates.value[index] = s==='normal' ? 'crossed' : s==='crossed' ? 'circled' : 'normal'
  const allCorrect = checkAllCorrect()
  if(allCorrect) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:currentLevelData.value.successFeedback}
  } else if(numStates.value.every(s=>s!=='normal')) {
    attemptCount.value++
    if(attemptCount.value<=1) feedback.value={type:'error',text:'Niet alle getallen zijn juist. Controleer de priemgetallen en hun veelvouden.'}
    else if(attemptCount.value<=2) feedback.value={type:'error',text:'Een priemgetal heeft precies 2 delers: 1 en zichzelf. Omcirkel die. Streep de rest door.'}
    else { feedback.value = { type: 'error', text: 'Hint 3: Methode: 1) Start bij 2. 2) Omcirkel het getal. 3) Streep alle veelvouden door. 4) Ga naar volgend niet-doorgestreept getal. 5) Herhaal. De laatste stap... (vul zelf in: stop als je bij de helft van het maximum bent).' } }
  }
}

function checkAllCorrect() {
  for(let i=0;i<numStates.value.length;i++) {
    const num=i+1; const state=numStates.value[i]; const isPrime=currentLevelData.value.primes.includes(num)
    if(num===1&&state!=='crossed') return false
    if(isPrime&&state!=='circled') return false
    if(!isPrime&&num!==1&&state!=='crossed') return false
  }
  return true
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  levels.value=generateLevel()
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Klik: 1x=doorstrepen, 2x=omcirkelen (priem).'}
  numStates.value=Array(currentLevelData.value.maxNum).fill('normal')
  attemptCount.value=0; showWhySection.value=false; showErrorAnalysis.value=false
  showReflection.value=false; reflectionDone.value=false; showLPDEvidence.value=false; lpdDone.value=false
}

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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: Zeef van Eratosthenes</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Het algoritme stap voor stap:</p>
          <div class="space-y-3 text-slate-700">
            <p><strong>Stap 1:</strong> Schrijf alle getallen op van 1 tot N.</p>
            <p><strong>Stap 2:</strong> Streep 1 door (1 is geen priemgetal).</p>
            <p><strong>Stap 3:</strong> Omcirkel 2 (eerste priemgetal). Streep ALLE veelvouden van 2 door (4, 6, 8, ...).</p>
            <p><strong>Stap 4:</strong> Omcirkel 3 (volgende niet-doorgestreepte). Streep ALLE veelvouden door (6, 9, 12, ...).</p>
            <p><strong>Stap 5:</strong> Herhaal: omcirkel het volgende niet-doorgestreepte getal en streep zijn veelvouden door.</p>
            <p><strong>Stap 6:</strong> Stop als je bij de helft van N bent. Alles wat nu niet is doorgestreept en niet is omcirkeld... is een priemgetal!</p>
          </div>
          <div class="mt-4 p-4 bg-white rounded-lg border border-amber-100">
            <p class="font-bold text-slate-700 mb-2">Voorbeeld: tot 10</p>
            <p class="text-slate-600">~1~ <strong>2</strong> <strong>3</strong> ~4~ <strong>5</strong> ~6~ <strong>7</strong> ~8~ ~9~ ~10~</p>
            <p class="text-slate-600 mt-1">Priemgetallen: 2, 3, 5, 7</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 items-center justify-center mx-auto mb-4 flex"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Wat doet de Zeef van Eratosthenes?</h3>
        <p class="text-slate-600 mb-6">Wat is het belangrijkste idee achter dit algoritme?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('veelvouden')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">Start met priemgetallen en streep hun veelvouden weg</button>
          <button @click="handlePrediction('delen')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">Deel elk getal door alle kleinere getallen</button>
        </div>
      </div>
    </div>

    <template v-if="!showWorkedExample&&!(showPredictionGate&&!predictionMade)">
      <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-2 rounded-lg bg-amber-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" /></div>
          <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><div class="flex items-center gap-2"><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel+1 }} van {{ totalInternalLevels }}</p><div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i<=currentInternalLevel+1?'bg-amber-500':'bg-slate-200'"></div></div></div></div>
          <button @click="emit('close')" class="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"><PhX class="w-6 h-6" /></button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentLevelData.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl">
              <h4 class="font-bold text-slate-700 mb-4 uppercase tracking-widest text-xs">Legende:</h4>
              <div class="flex flex-col gap-3 font-mono text-sm">
                <div class="flex items-center gap-4"><div class="w-8 h-8 rounded-lg border-2 border-slate-300 bg-white flex items-center justify-center text-slate-500 font-bold">1</div><span class="text-slate-600">Nog te controleren</span></div>
                <div class="flex items-center gap-4"><div class="w-8 h-8 rounded-lg border-2 border-red-400 bg-red-50 flex items-center justify-center text-slate-600 font-bold relative"><span class="opacity-30">1</span><PhX weight="bold" class="text-red-500 w-6 h-6 absolute" /></div><span class="text-red-600">Geen priemgetal (1 klik)</span></div>
                <div class="flex items-center gap-4"><div class="w-8 h-8 rounded-full border-4 border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">1</div><span class="text-emerald-600">Priemgetal! (2 kliks)</span></div>
              </div>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">De Zeef van Eratosthenes is efficiënt omdat elk samengesteld getal exact een keer wordt doorgestreept: bij de kleinste priemdeler. Hierdoor hoef je niet elk getal apart te testen. Dit is een elegant algoritme dat al meer dan 2200 jaar oud is!</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>1 is geen priemgetal:</strong> Een priemgetal heeft precies 2 delers. 1 heeft maar 1 deler.</li>
                <li><strong>Niet alle veelvouden:</strong> Als je 3 omcirkelt, vergeet dan niet 6, 9, 12, 15, ... allemaal door te strepen.</li>
                <li><strong>Vergeten dat je al aan het einde bent:</strong> Bij getallen boven de helft van N zijn de veelvouden al doorgestreept.</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is de Zeef van Eratosthenes sneller dan elk getal apart testen op priem zijn? Wat is het verschil in aanpak?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD 37: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt de Zeef van Eratosthenes uitgevoerd. Leg uit: "Ik start bij het eerste priemgetal ____, omcirkel het, en streep alle ____ door. Dan ga ik naar het volgende niet-doorgestreepte getal en herhaal. Op het einde zijn alle overblijvende ____ getallen de ____."</p>
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
              <div v-else class="flex-1 py-4 text-center text-xs text-slate-400">Klik getallen om te markeren</div>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="grid grid-cols-5 gap-4 bg-white p-8 rounded-xl shadow-md border border-slate-200">
              <button v-for="(state,idx) in numStates" :key="idx" @click="cycleState(idx)" :disabled="isCorrect"
                class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center font-black text-2xl md:text-3xl transition-all shadow-sm select-none relative focus:outline-none"
                :class="{
                  'bg-slate-100 border-2 border-slate-300 text-slate-600 hover:bg-slate-200 rounded-xl': state==='normal',
                  'bg-red-50 border-2 border-red-400 text-slate-600 rounded-xl': state==='crossed',
                  'bg-emerald-50 border-4 border-emerald-500 text-emerald-600 rounded-full scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)]': state==='circled'
                }">
                <span :class="state==='crossed'?'opacity-30':''">{{ idx+1 }}</span>
                <div v-if="state==='crossed'" class="absolute inset-0 flex items-center justify-center pointer-events-none animate-fadeIn"><PhX weight="bold" class="w-10 h-10 md:w-14 md:h-14 text-red-500" /></div>
              </button>
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
