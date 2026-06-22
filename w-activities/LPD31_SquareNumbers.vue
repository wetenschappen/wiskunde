<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhSquaresFour, PhArrowClockwise, PhBrain, PhBookOpen, PhLightbulb, PhChatCircleText, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Patronen: De Vierhoeksgetallen' }, instruction: { type: String, default: 'Ontdek het patroon en vul het antwoord in.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhSquaresFour } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false); const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0)
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const showWorkedExample = ref(true); const workedStep = ref(0)
const workedSteps = [
  { label: 'Vierkantsgetallen: 1²=1, 2²=4, 3²=9, 4²=16', detail: '1, 4, 9, 16...' },
  { label: 'Verschillen: +3, +5, +7', detail: 'Oneven getallen!' },
  { label: 'Formule: n²', detail: 'Elke figuur = n x n blokjes' }
]
const levels = ref([])
function generateLevel(levelIndex){
  let name, sequence, formula, fig4Ans
  if(levelIndex===0){name='Vierkantsgetallen';sequence=[1,4,9,16];formula='n²';fig4Ans=16}
  else if(levelIndex===1){name='Driehoeksgetallen';sequence=[1,3,6,10];formula='n(n+1)/2';fig4Ans=10}
  else{name='Vijfhoekgetallen';sequence=[1,5,12,22];formula='n(3n-1)/2';fig4Ans=22}
  return {name,sequence,formula,fig4Ans,predictionQuestion:'Wat is het volgende getal na '+sequence[2]+'?',predictionOptions:[fig4Ans,fig4Ans-2,fig4Ans+3],predictionCorrect:fig4Ans,commonErrors:[
    {condition:(v)=>v===sequence[2]+(sequence[2]-sequence[1]),message:'Let op! Het patroon is NIET lineair. Kijk naar de verschillen tussen de getallen: +'+(sequence[1]-sequence[0])+', +'+(sequence[2]-sequence[1])+', +_' },
    {condition:(v)=>v===Math.round(fig4Ans/2),message:'Let op! ' + fig4Ans + ', niet ' + Math.round(fig4Ans/2) + '. Kijk naar het visuele patroon.'}
  ]}
}
const currentLevel=computed(()=>levels.value[currentInternalLevel.value]);const ansFig4=ref(null);const showFig4=ref(false)
const showPrediction=ref(true);const predictionAnswer=ref(null);const predictionRevealed=ref(false);const predictionCorrect=ref(false)
function submitPrediction(){predictionCorrect.value=parseInt(predictionAnswer.value)===currentLevel.value.predictionCorrect;predictionRevealed.value=true;showPrediction.value=false}
const colorMap={pink:'bg-pink-100 text-pink-600 border-pink-200',blue:'bg-blue-100 text-blue-600 border-blue-200',purple:'bg-purple-100 text-purple-600 border-purple-200'};const colorMapBg={pink:'bg-pink-500 border-pink-700',blue:'bg-blue-500 border-blue-700',purple:'bg-purple-500 border-purple-700'}
function getHintText(count){
  const l=currentLevel.value
  if(count>=11)return `Methode: ${l.name}: ${l.sequence.slice(0,3).join(', ')}, ... Verschil=${l.sequence[1]-l.sequence[0]}, ${l.sequence[2]-l.sequence[1]}. Fig4 = _`
  if(count>=8)return `Voorbeeld: 1²=1, 2²=4, 3²=9, 4²=16. Verschillen: +3,+5,+7. Jouw reeks: ${l.sequence.slice(0,3).join(', ')}, ...`
  if(count>=5)return `Concept: bereken het verschil tussen opeenvolgende getallen: ${l.sequence[1]-l.sequence[0]}, ${l.sequence[2]-l.sequence[1]}, ...`
  return `Kijk naar het patroon. Hoeveel blokjes komen erbij?`
}
function checkErrorConditions(){
  const l=currentLevel.value;for(const err of l.commonErrors){if(err.condition(ansFig4.value))return err.message}
  return null
}
function resetActivityState(){levels.value[currentInternalLevel.value]=generateLevel(currentInternalLevel.value);isCorrect.value=false;showFig4.value=false;attemptCount.value=0;feedback.value={type:'info',text:'Ontdek het patroon.'};ansFig4.value=null;showPrediction.value=true;predictionAnswer.value=null;predictionRevealed.value=false;predictionCorrect.value=false;showWorkedExample.value=currentInternalLevel.value===0;workedStep.value=0}
function checkAnswer(){const l=currentLevel.value;if(ansFig4.value===l.fig4Ans){isCorrect.value=true;showFig4.value=true;feedback.value={type:'success',text:'Magistraal! Dit zijn '+l.name+': '+l.sequence.slice(0,3).join(', ')+'... Formule: '+l.formula+'.'}}else{attemptCount.value++;const err=checkErrorConditions();if(err){feedback.value={type:'error',text:err};return}feedback.value={type:'error',text:'Niet helemaal. Het patroon is: '+l.sequence.slice(0,3).join(', ')+', ...'}}
}
function nextLevel(){if(currentInternalLevel.value<totalInternalLevels-1){currentInternalLevel.value++;resetActivityState();nextTick(()=>mainArea.value?.focus())}else emit('complete')}
watch(()=>props.isOpen,(val)=>{if(val){currentInternalLevel.value=0;resetActivityState();window.addEventListener('keydown',handleKeydown)}else{window.removeEventListener('keydown',handleKeydown);shouldPulse.value=false}},{immediate:true})
function handleKeydown(e){if(e.key==='Escape'&&props.isOpen)emit('close')}
onMounted(()=>document.addEventListener('fullscreenchange',()=>{if(props.isOpen&&props.fullscreen&&!document.fullscreenElement)emit('close')}))
onUnmounted(()=>{window.removeEventListener('keydown',handleKeydown)})
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4"><div class="flex items-center justify-center p-2 rounded-lg" :class="colorMap[currentLevel?.color||'pink']"><component :is="props.icon" weight="fill" class="w-6 h-6" /></div><div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel+1 }} van {{ totalInternalLevels }} — {{ currentLevel?.name }} <span v-if="currentInternalLevel===0">(Toepassen)</span><span v-else-if="currentInternalLevel===1">(Analyseren)</span><span v-else>(Evalueren)</span></p></div></div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :class="{'ring-pulse-amber':shouldPulse}"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3><MathText :content="props.instruction" class="mb-6 prose prose-sm text-slate-600" />
            <div v-if="showWorkedExample&&currentInternalLevel===0" class="mb-6 border border-indigo-200 bg-indigo-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld: vierkantsgetallen</h4></div>
              <div class="space-y-1"><div v-for="(step,si) in workedSteps" :key="si" @click="workedStep=si" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" :class="workedStep===si?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="workedStep>=si?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ si+1 }}</div><div><p class="text-sm font-medium" :class="workedStep===si?'text-indigo-900':'text-indigo-600'">{{ step.label }}</p><p v-if="workedStep===si" class="text-xs text-indigo-500 mt-0.5">{{ step.detail }}</p></div></div></div>
              <button @click="showWorkedExample=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">Ik begrijp het. Start de oefening!</button>
            </div>
            <div v-if="!showWorkedExample&&!showPrediction" class="p-4 mt-6 border rounded-xl shadow-inner flex flex-col gap-6" :class="{'border-surface-200 bg-math-blue-bg':currentInternalLevel!==1,'border-blue-200 bg-blue-50':currentInternalLevel===1}">
              <div class="flex flex-col gap-2"><label class="text-sm font-bold text-slate-700">Hoeveel blokjes in Figuur 4?</label><input type="number" v-model.number="ansFig4" placeholder="..." :disabled="isCorrect" class="w-full font-bold text-lg p-2 border-2 rounded-lg focus:border-blue-500 text-center bg-white border-blue-300" /></div>
            </div>
            <div v-if="showPrediction&&!showWorkedExample" class="mb-6 border border-amber-200 bg-amber-50 rounded-xl p-4 animate-fadeIn">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ currentLevel?.predictionQuestion }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in currentLevel?.predictionOptions||[]" :key="opt" @click="predictionAnswer=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all" :class="predictionAnswer===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600 hover:border-amber-300'">{{ opt }}</button></div>
              <button v-if="predictionAnswer!==null&&!predictionRevealed" @click="submitPrediction" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors">Bevestig</button>
              <div v-if="predictionRevealed" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="predictionCorrect?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'"><span v-if="predictionCorrect">Juist!</span><span v-else>Bereken het verschil.</span></div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!showWorkedExample" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-indigo-100 text-indigo-800 border border-indigo-200"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold mb-1">Waarom werkt dit?</p><p class="leading-relaxed">Vierkantsgetallen groeien met de oneven getallen: 1, 1+3=4, 4+5=9, 9+7=16. Dit komt omdat (n+1)² = n² + 2n + 1. De toename 2n+1 is altijd oneven.</p></div></div>
            <div v-if="isCorrect&&currentInternalLevel===totalInternalLevels-1" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-purple-100 text-purple-800 border border-purple-200"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold mb-1">Reflectie</p><p class="leading-relaxed">Waarom is het verschil tussen opeenvolgende vierkantsgetallen altijd oneven? Omdat (n+1)² - n² = 2n + 1. 2n is altijd even, plus 1 is altijd oneven. Dit is een algebra\u00efsch bewijs van een patroon dat je eerst visueel zag.</p></div></div>
            <div class="flex items-center gap-4"><button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="!isCorrect&&!showPrediction&&!showWorkedExample" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none" :disabled="ansFig4===null">Controleer</button>
              <button v-if="isCorrect&&currentInternalLevel<totalInternalLevels-1" @click="nextLevel" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-math-blue focus-visible:outline-none">Volgend Level</button>
              <button v-if="isCorrect&&currentInternalLevel>=totalInternalLevels-1" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-math-blue hover:bg-math-blue active:scale-[0.98]"><span>Afronden</span><PhArrowRight weight="bold" /></button>
            </div>
          </div>
        </div>
        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
            <div class="w-full max-w-4xl flex items-end justify-center gap-8 min-h-[300px]">
              <div v-for="(figCount,figIdx) in 4" :key="'fig'+figIdx" class="flex flex-col items-center gap-4" :class="figIdx===3?'transition-all duration-1000'+(showFig4?' opacity-100 translate-y-0':' opacity-30 translate-y-4 blur-sm'):''">
                <div v-if="figIdx<3||showFig4" class="grid gap-1" :style="{gridTemplateColumns:`repeat(${figIdx+1},1fr)`}"><div v-for="i in currentLevel?.sequence[figIdx]||0" :key="'f'+(figIdx+1)+i" class="w-10 h-10 rounded-lg shadow-sm" :class="colorMapBg[currentInternalLevel===0?'pink':currentInternalLevel===1?'blue':'purple']"></div></div>
                <div v-else class="w-[176px] h-[176px] border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center"><span class="font-black text-4xl text-slate-300">?</span></div>
                <span class="font-bold uppercase text-xs tracking-widest text-slate-500">Fig {{ figIdx+1 }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" :is-level-complete="typeof currentInternalLevel!=='undefined'?currentInternalLevel===totalInternalLevels-1:true" />
</template>
<style scoped>
:root{font-family:'Inter',sans-serif;}.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}.animate-fadeIn{animation:fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;}.shadow-inner-light{box-shadow:inset -5px 0 15px -10px rgba(0,0,0,0.1);}
</style>
