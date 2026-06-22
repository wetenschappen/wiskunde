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
  title: { type: String, default: 'Reststelling bij Veeltermen' },
  instruction: { type: String, default: 'Gebruik de reststelling of het schema van Horner om de rest te bepalen.' },
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

const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

function generateLevel(lvl) {
  if (lvl === 0) {
    const k = randInt(1,3)*(Math.random()>0.5?1:-1)
    const a = randInt(1,3); const b = randInt(-3,3); const c = randInt(-3,3)
    const correctA = -k
    const dExpr = 'x '+(k>=0?'+ '+k:'- '+Math.abs(k))
    const correctRest = a*correctA*correctA+b*correctA+c
    return {
      name: 'Reststelling + Horner',
      description: `P(x) = ${a}x² ${b>=0?'+'+b:b}x ${c>=0?'+'+c:c}, d(x) = ${dExpr}`,
      poly: { coeffs: [a, b, c] },
      divisor: { k: correctA, display: dExpr },
      correctA, correctRest,
      hornerSteps: [
        `Stap 1: Noteer coefficienten: [${a}, ${b}, ${c}] en a = ${correctA}.`,
        `Stap 2: Breng ${a} naar beneden.`,
        `Stap 3: ${a} × ${correctA} = ${a*correctA}. Tel op bij ${b}: ${b + a*correctA}.`,
        `Stap 4: ${b + a*correctA} × ${correctA} = ${(b + a*correctA)*correctA}. Tel op bij ${c}: ${correctRest}.`,
        `Stap 5: De rest = ${correctRest}.`
      ],
      hints: [
        'Hint 1: Reststelling: rest = P(a) met d(x) = x - a. Wat is a als d(x) = ' + dExpr + '?',
        `Hint 2: a = ${correctA}. Vul in in P(x). Of gebruik het schema van Horner.`,
        `Hint 3: Methode (Horner): 1) Noteer coeff [${a},${b},${c}]. 2) Noteer a=${correctA}. 3) Breng ${a} naar beneden. 4) Vermenigvuldig en tel op. 5) Herhaal. De laatste stap... (vul zelf in: de laatste som is de rest).`
      ]
    }
  } else if (lvl === 1) {
    const k = randInt(2,4); const a = randInt(1,3); const b = randInt(-4,4)
    const c = randInt(-4,4); const d = randInt(-5,5)
    const correctA = k; const dExpr = 'x - '+k
    const correctRest = a*k*k*k + b*k*k + c*k + d
    return {
      name: 'Schema van Horner (3e graad)',
      description: `P(x) = ${a}x³ ${b>=0?'+'+b:b}x² ${c>=0?'+'+c:c}x ${d>=0?'+'+d:d}, d(x) = ${dExpr}`,
      poly: { coeffs: [a, b, c, d] },
      divisor: { k: correctA, display: dExpr },
      correctA, correctRest,
      hints: [
        'Hint 1: Horner: breng eerste coeff naar beneden, vermenigvuldig met a, tel op bij volgende, herhaal.',
        `Hint 2: a = ${correctA}. Werk in het schema van links naar rechts.`,
        'Hint 3: Methode: 1) Noteer alle coefficienten. 2) Herhaal: vermenigvuldig vorige som met a, tel op bij volgende coeff. De laatste stap... (vul zelf in: de laatste som is de rest).'
      ]
    }
  } else {
    const k = randInt(3,5); const a = randInt(2,4); const b = randInt(-5,5)
    const c = randInt(-5,5); const d = randInt(-7,7)
    const correctA = -k; const dExpr = 'x + '+k
    const correctRest = a*correctA*correctA*correctA + b*correctA*correctA + c*correctA + d
    return {
      name: 'Horner met negatieve a',
      description: `P(x) = ${a}x³ ${b>=0?'+'+b:b}x² ${c>=0?'+'+c:c}x ${d>=0?'+'+d:d}, d(x) = ${dExpr}`,
      poly: { coeffs: [a, b, c, d] },
      divisor: { k: correctA, display: dExpr },
      correctA, correctRest,
      hints: [
        'Hint 1: Let op het teken! Als d(x) = x + k, dan is a = -k.',
        `Hint 2: a = ${correctA}. Werk met negatieve getallen in het schema.`,
        'Hint 3: Methode: 1) Bepaal a uit d(x). 2) Gebruik Horner. 3) Let op tekens bij vermenigvuldigen. De laatste stap... (vul zelf in: de rest is de laatste som).'
      ]
    }
  }
}

function generateLevels() { const arr=[]; for(let i=0;i<totalInternalLevels;i++) arr.push(generateLevel(i)); levels.value=arr }
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const userA = ref(''); const userRest = ref('')

function checkAnswer() {
  isChecked.value=true
  const a=parseInt(userA.value), rest=parseInt(userRest.value)
  if (a===currentLevel.value.correctA && rest===currentLevel.value.correctRest) {
    isCorrect.value=true; showWhySection.value=true; showErrorAnalysis.value=true; showReflection.value=true
    feedback.value={type:'success',text:`Correct! Rest = ${currentLevel.value.correctRest}. Het schema van Horner bevestigt de reststelling.`}
  } else if (a!==currentLevel.value.correctA) {
    attemptCount.value++; isCorrect.value=false
    feedback.value={type:'error',text:`a klopt niet. d(x) = ${currentLevel.value.divisor.display}, dus a = ? <br/>`+currentLevel.value.hints[Math.min(attemptCount.value-1,currentLevel.value.hints.length-1)]}
  } else {
    attemptCount.value++; isCorrect.value=false
    feedback.value={type:'error',text:`a is correct, maar de rest klopt niet. Gebruik het schema van Horner: <br/>`+currentLevel.value.hints[Math.min(attemptCount.value-1,currentLevel.value.hints.length-1)]}
  }
}

function handlePrediction(answer) { predictionChoice.value=answer; predictionMade.value=true; showPredictionGate.value=false }
function nextWorkedExample() { showWorkedExample.value=false; showPredictionGate.value=true }
function startLevel() { showPredictionGate.value=false; predictionMade.value=false; predictionChoice.value=null }
function handleReflectionDone() { reflectionDone.value=true }
function handleLPDDone() { lpdDone.value=true }

function resetActivityState() {
  generateLevels()
  isCorrect.value=false; celebrationDone.value=false; isChecked.value=false
  feedback.value={type:'info',text:'Bepaal a uit de deler en bereken de rest.'}
  attemptCount.value=0; userA.value=''; userRest.value=''
  showWhySection.value=false; showErrorAnalysis.value=false
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
        <div class="flex items-center gap-3 mb-6"><div class="p-2 rounded-lg bg-amber-100"><PhStar class="w-6 h-6 text-amber-600" weight="fill" /></div><h3 class="text-xl font-bold text-slate-800">Voorbeeld: Schema van Horner</h3></div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <p class="font-bold text-amber-800 mb-3">Het schema van Horner: efficienter dan de reststelling</p>
          <div class="space-y-3 text-slate-700">
            <p>Gegeven: P(x) = 2x³ - 3x² + 4x - 5, delen door x - 2.</p>
            <p><strong>Stap 1:</strong> Noteer coefficienten: [2, -3, 4, -5] en a = 2.</p>
            <div class="p-4 bg-white rounded-lg border border-amber-100 font-mono text-center">
              <table class="mx-auto">
                <tr><td class="p-2 font-bold">a=2</td><td class="p-2 border-b-2 border-slate-300">2</td><td class="p-2 border-b-2 border-slate-300">-3</td><td class="p-2 border-b-2 border-slate-300">4</td><td class="p-2 border-b-2 border-slate-300">-5</td></tr>
                <tr><td></td><td class="p-2 font-bold text-amber-600">$ down 2</td><td class="p-2">4</td><td class="p-2">2</td><td class="p-2">12</td></tr>
                <tr><td></td><td class="p-2 border-t-2 border-amber-500 font-bold text-amber-700">2</td><td class="p-2 border-t-2 border-amber-500 font-bold text-amber-700">1</td><td class="p-2 border-t-2 border-amber-500 font-bold text-amber-700">6</td><td class="p-2 border-t-2 border-amber-500 font-bold text-amber-700">7</td></tr>
              </table>
            </div>
            <p><strong>Stap 2:</strong> Breng 2 naar beneden.</p>
            <p><strong>Stap 3:</strong> 2 x 2 = 4; -3 + 4 = 1.</p>
            <p><strong>Stap 4:</strong> 1 x 2 = 2; 4 + 2 = 6.</p>
            <p><strong>Stap 5:</strong> 6 x 2 = 12; -5 + 12 = <strong>7</strong> = rest.</p>
            <p class="mt-2 font-bold text-emerald-700">Rest = 7. Het quotient: 2x² + 1x + 6.</p>
          </div>
        </div>
        <button @click="nextWorkedExample" class="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition-colors">Ik begrijp het</button>
      </div>
    </div>

    <div v-if="showPredictionGate&&!predictionMade" class="absolute inset-0 z-20 bg-white overflow-y-auto p-8">
      <div class="max-w-xl mx-auto text-center">
        <div class="p-3 rounded-full bg-indigo-100 w-16 h-16 items-center justify-center mx-auto mb-4 flex"><PhTarget class="w-8 h-8 text-indigo-600" weight="fill" /></div>
        <h3 class="text-xl font-bold text-slate-800 mb-4">Voorspel: Wat is de eerste stap van Horner?</h3>
        <p class="text-slate-600 mb-6">Je deelt P(x) = 2x² + 3x + 1 door x - 4. Wat noteer je als eerste coefficient?</p>
        <div class="flex flex-col gap-3">
          <button @click="handlePrediction('2')" class="p-4 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 font-bold text-slate-700 transition-all">2 (de coefficient van x²)</button>
          <button @click="handlePrediction('4')" class="p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">4 (a uit x - 4)</button>
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
            <MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div class="bg-amber-50 p-4 border border-amber-200 rounded-xl mb-4"><p class="font-bold text-amber-800 text-sm">{{ currentLevel.name }}</p></div>

            <div class="bg-white p-4 border border-slate-200 rounded-lg font-mono text-lg shadow-sm space-y-2 mb-4">
              <p class="text-slate-700">{{ currentLevel.description }}</p>
            </div>

            <div v-if="currentLevel.hornerSteps && currentInternalLevel === 0" class="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="font-bold text-amber-700 text-sm mb-2">Schema van Horner:</p>
              <div class="text-xs text-amber-800 space-y-1">
                <p v-for="(step, i) in currentLevel.hornerSteps" :key="i">{{ step }}</p>
              </div>
            </div>

            <div class="p-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4">
              <div><label class="block mb-2 text-sm font-bold text-slate-700">1. Wat is a? (uit d(x) = x - a)</label><input type="number" v-model="userA" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="a = ?" /></div>
              <div><label class="block mb-2 text-sm font-bold text-slate-700">2. Wat is de rest (R)?</label><input type="number" v-model="userRest" @keyup.enter="checkAnswer" class="w-full p-4 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-amber-500 transition-colors" placeholder="R = ?" /></div>
            </div>

            <div v-if="currentLevel.hornerSteps && currentInternalLevel >= 1" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
              <p class="font-bold text-indigo-700 mb-1">Tip: Horner-schema</p>
              <p class="text-indigo-600">Noteer coefficienten [{{ currentLevel.poly.coeffs.join(', ') }}] en a={{ currentLevel.divisor.k }}. Breng {{ currentLevel.poly.coeffs[0] }} naar beneden.</p>
            </div>

            <div v-if="showWhySection" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-2 text-sm">Waarom werkt dit?</h4>
              <p class="text-xs text-indigo-700">Het schema van Horner is een compacte notatie van de staartdeling. Elke veelterm is te schrijven als P(x) = (x-a).Q(x) + R. Door coefficienten in een schema te plaatsen en herhaaldelijk te vermenigvuldigen en op te tellen, vinden we zowel Q(x) als R. Dit is veel sneller dan de volledige staartdeling.</p>
            </div>

            <div v-if="showErrorAnalysis" class="p-4 mt-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-red-700 mb-2 text-sm">Let op! Veelgemaakte fouten:</h4>
              <ul class="text-xs text-red-600 space-y-2 list-disc pl-4">
                <li><strong>a verkeerd bepalen:</strong> d(x) = x + 3 betekent a = -3, niet +3! d(x) = x - 4 betekent a = +4.</li>
                <li><strong>Nulcoefficienten overslaan:</strong> Bij 2x³ + 0x² + 3x + 1 moet je een 0 noteren voor x².</li>
                <li><strong>Rekenen met tekens:</strong> -3 x (-2) = +6. Let goed op de tekens!</li>
              </ul>
            </div>

            <div v-if="showReflection&&!reflectionDone" class="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-indigo-800 mb-3 text-sm">Reflectie</h4>
              <p class="text-xs text-indigo-700 mb-3"><strong>Waarom</strong> is Horner efficienter dan de staartdeling? Wat betekent het als de rest = 0?</p>
              <button @click="handleReflectionDone" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 transition-colors">Ik heb nagedacht</button>
            </div>

            <div v-if="showLPDEvidence&&!lpdDone" class="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
              <h4 class="font-bold text-emerald-800 mb-3 text-sm">LPD B6: Bewijs van beheersing</h4>
              <p class="text-xs text-emerald-700 mb-3">Je hebt bewezen dat je Horner kan toepassen. Vul aan: "Ik bepaal a uit d(x)=x-a. In het schema noteer ik de ____, breng de eerste naar ____, en herhaal: ____ met a en ____ bij de volgende. De laatste waarde is de ____."</p>
              <button @click="handleLPDDone" class="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors">Ik kan dit uitleggen</button>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}">
               <component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-relaxed" v-html="feedback.text"></span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm active:scale-[0.98]"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="!userA||!userRest" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"><span>{{ currentInternalLevel<totalInternalLevels-1?'Volgend Level':'Afronden' }}</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>

        <div class="flex flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-1 p-6 items-center justify-center bg-slate-100 pattern-grid">
            <div class="bg-white p-8 rounded-xl shadow-md border-2 border-slate-200 w-full max-w-md">
              <h4 class="font-bold text-slate-500 mb-4 uppercase tracking-wider text-xs text-center">Schema van Horner</h4>
              <div class="font-mono">
                <table class="mx-auto text-center">
                  <tr><td class="p-2 font-bold text-amber-600">a={{ currentLevel.divisor.k }}</td>
                    <td v-for="(coeff, i) in currentLevel.poly.coeffs" :key="'h'+i" class="p-3 border-b-2 border-slate-300 w-14 text-lg font-bold">{{ coeff }}</td>
                  </tr>
                  <tr><td></td>
                    <td v-for="(coeff, i) in currentLevel.poly.coeffs" :key="'m'+i" class="p-3 text-amber-500 text-lg">$ down</td>
                  </tr>
                </table>
              </div>
              <div class="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p class="text-xs text-amber-800 text-center"><strong>Tip:</strong> Rest = P(a). Als rest = 0, dan is (x-a) een deler.</p>
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
