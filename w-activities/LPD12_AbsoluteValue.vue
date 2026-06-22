<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRuler, PhArrowClockwise, PhCarProfile, PhLightbulb, PhBrain, PhBookOpen, PhChatCircleText, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Absolute Waarde' }, instruction: { type: String, default: '|x| is de afstand van x tot 0.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhRuler } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false); const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0)
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const showWorkedExample = ref(true); const workedStep = ref(0)
const workedSteps = [{label:'|5|=5, |-5|=5. Afstand tot 0.',detail:'Auto op +5 of -5. Afstand=5.'},{label:'Sleep meetlint van 0 naar auto',detail:'Gemeten afstand = antwoord'}]
const levels=ref([])
function gl(i){const p=[3,4,5,6,7,8];const n=[-3,-4,-5,-6,-7,-8];const f=[-10,-11,-12,9,10,11];const c=i===0?p[Math.floor(Math.random()*6)]:i===1?n[Math.floor(Math.random()*6)]:f[Math.floor(Math.random()*6)];return{carPos:c,exactAns:Math.abs(c),goalText:'Opdracht '+(i+1)+': |'+c+'| = ?',predictionQuestion:'Wat is |'+c+'|?',predictionOptions:[Math.abs(c),c,Math.abs(c)-1],predictionCorrect:Math.abs(c),commonErrors:[{condition:(v)=>v===c&&c<0,message:'Let op! |-5| is NIET -5. Afstand nooit negatief!'}]}}
const d=computed(()=>levels.value[currentInternalLevel.value])
const sp=ref(true);const pa=ref(null);const pr=ref(false);const pc=ref(false)
function submit(){pc.value=parseInt(pa.value)===d.value.predictionCorrect;pr.value=true;sp.value=false}
const ua=ref(null);const tl=ref(0);let id=false;let sx=0
const cd=computed(()=>d.value.carPos)
function gs(){return{type:'info',text:'Sleep het meetlint.'}}
function rs(){const nl=[];for(let i=0;i<3;i++)nl.push(gl(i));levels.value=nl;isCorrect.value=false;celebrationDone.value=false;feedback.value={type:'info',text:'Sleep meetlint.'};attemptCount.value=0;ua.value=null;tl.value=0;sp.value=true;pa.value=null;pr.value=false;pc.value=false;showWorkedExample.value=currentInternalLevel.value===0;workedStep.value=0}
function ca(){if(!ua.value&&ua.value!==0){feedback.value={type:'error',text:'Vul een getal in.'};return}if(ua.value===d.value.exactAns){isCorrect.value=true;feedback.value={type:'success',text:'Perfect! |'+d.value.carPos+'|='+d.value.exactAns+'.'}}else{attemptCount.value++;feedback.value={type:'error',text:'Meetlint tonen...'}}}
function hn(){if(currentInternalLevel.value<2){currentInternalLevel.value++;rs();nextTick(()=>mainArea.value?.focus())}else{if(props.currentStep<props.totalSteps)emit('update:currentStep',props.currentStep+1);else emit('complete')}}
watch(()=>props.isOpen,(v)=>{if(v){currentInternalLevel.value=0;rs();nextTick(()=>mainArea.value?.focus());window.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&props.isOpen)emit('close')})}else{shouldPulse.value=false}},{immediate:true})
onMounted(()=>document.addEventListener('fullscreenchange',()=>{if(props.isOpen&&props.fullscreen&&!document.fullscreenElement)emit('close')}))
onUnmounted(()=>{})
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen bg-white">
      <header class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div class="flex items-center gap-4"><div class="p-2 rounded-lg bg-emerald-100"><component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" /></div><div><h2 class="text-lg font-bold text-slate-900">{{ props.title }}</h2><p class="text-xs text-slate-500">Level {{ currentInternalLevel+1 }}/3 <span v-if="currentInternalLevel===0">(Toepassen)</span><span v-else-if="currentInternalLevel===1">(Analyseren)</span><span v-else>(Evalueren)</span></p></div></div>
        <button @click="emit('close')" class="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />
            <div v-if="showWorkedExample&&currentInternalLevel===0" class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld</h4></div>
              <div class="space-y-1"><div v-for="(s,i) in workedSteps" :key="i" @click="workedStep=i" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer" :class="workedStep===i?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="workedStep>=i?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ i+1 }}</div><div><p class="text-sm font-medium" :class="workedStep===i?'text-indigo-900':'text-indigo-600'">{{ s.label }}</p></div></div></div>
              <button @click="showWorkedExample=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200">Begrepen! Start de oefening.</button>
            </div>
            <div v-if="!showWorkedExample" class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl mb-4"><p class="font-bold text-emerald-800">{{ d.goalText }}</p></div>
            <div v-if="sp&&!showWorkedExample" class="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ d.predictionQuestion }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in d.predictionOptions" :key="opt" @click="pa=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm" :class="pa===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600'">{{ typeof opt==='number'?opt:opt }}</button></div>
              <button v-if="pa!==null&&!pr" @click="submit" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg">Bevestig</button>
              <div v-if="pr" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="pc?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'"><span v-if="pc">Juist!</span><span v-else>Afstand is altijd positief.</span></div>
            </div>
            <div v-if="!showWorkedExample&&!sp" class="p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
               <label class="block text-sm font-bold text-emerald-900 mb-2">Bereken:</label>
               <div class="flex items-center justify-center gap-3 text-2xl font-black text-slate-700"><span class="bg-white px-3 py-1 rounded-lg border border-emerald-200">|{{ cd }}|</span><span>=</span><input type="number" v-model.number="ua" placeholder="?" :disabled="isCorrect" class="w-20 font-bold text-xl p-2 border-2 border-emerald-300 rounded-lg text-center bg-white" /></div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!showWorkedExample" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-indigo-100 text-indigo-800"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Waarom werkt dit?</p><p>Absolute waarde = AFSTAND tot 0. Afstand nooit negatief.</p></div></div>
            <div v-if="isCorrect&&currentInternalLevel===2" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-purple-100 text-purple-800"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Reflectie</p><p>|x| = |-x| want +5 en -5 liggen even ver van 0.</p></div></div>
            <div class="flex items-center gap-3"><button @click="rs" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg"><PhArrowClockwise /></button>
              <button v-if="!isCorrect&&!sp&&!showWorkedExample" @click="ca" class="flex-1 py-3 font-bold text-white bg-slate-800 rounded-lg">Controleer</button>
              <button v-else-if="isCorrect" @click="hn" class="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-lg">{{ currentInternalLevel<2?'Volgend Level':'Afronden' }}</button>
            </div>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-center bg-slate-50 pattern-grid"><p class="text-slate-400 text-sm">Visuele getallenas (vereenvoudigd)</p></div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</template>
<style scoped>
.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}
</style>
