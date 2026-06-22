<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBoundingBox, PhArrowClockwise, PhBrain, PhBookOpen, PhLightbulb, PhChatCircleText } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Gelijkvormigheid en Schaal' }, instruction: { type: String, default: 'Verander de schaalfactor k.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhBoundingBox } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false); const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0)
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const showWorkedExample = ref(true); const workedStep = ref(0)
const workedSteps = [{label:'Driehoek 3x4, k=2',detail:'Zijden 6x8, opp x4'},{label:'Oppervlakte schaalt met k^2',detail:'k=2 -> opp x4'}]
const levels = ref([])
function gl(){const c=[0.5,1.5,2,2.5,3].sort(()=>Math.random()-0.5).slice(0,3);return c.map((t,i)=>({goalText:'Oppervlakte x'+(t*t)+'. Zoek k.',targetK:t,pq:'Wat is k als k^2='+(t*t)+'?',po:[t,t*t,t/2],pc:t,ce:[{c:(v,tt)=>v*v===tt*tt&&v!==tt,m:'Let op! Oppervlakte klopt, maar k moet '+tt+' zijn.'},{c:(v,tt)=>v===tt*tt,m:'Let op! k='+v+', maar we zoeken k='+tt+'. k^2='+(tt*tt)+'.'}],hb:'Methode: k = sqrt(k^2). k^2='+(t*t)+', k=sqrt('+(t*t)+')=_'}))}
const cl=computed(()=>levels.value[currentInternalLevel.value]);const sf=ref(1)
const sp=ref(true);const pa=ref(null);const pr=ref(false);const pc=ref(false)
function submit(){const c=cl.value.pc;pc.value=typeof c==='number'?parseFloat(pa.value)===c:pa.value===c;pr.value=true;sp.value=false}
const ob=40;const oh=30;const oa=60;const nb=computed(()=>ob*sf.value);const nh=computed(()=>oh*sf.value);const na=computed(()=>oa*(sf.value*sf.value))
function gh(c){const d=cl.value;if(c>=11)return{type:'info',text:d.hb};if(c>=8)return{type:'info',text:'Voorbeeld: k=2 -> opp 4x. Jouw k^2='+(d.targetK*d.targetK)+', k=_'};if(c>=5)return{type:'info',text:'Concept: lengtes xk, opp xk^2.'};return{type:'info',text:'Stel k in.'}}
function ce(){const e=cl.value.ce;const t=cl.value.targetK;const v=sf.value;for(const x of e){const m=x.c(v,t);if(m)return m}return null}
function rs(){isCorrect.value=false;celebrationDone.value=false;feedback.value={type:'info',text:'Stel k in.'};sf.value=1;attemptCount.value=0;levels.value=gl();sp.value=true;pa.value=null;pr.value=false;pc.value=false;showWorkedExample.value=currentInternalLevel.value===0;workedStep.value=0}
watch(sf,(v)=>{if(!isCorrect.value&&!sp.value&&v===cl.value.targetK){isCorrect.value=true;feedback.value={type:'success',text:'Prima! Lengtes x'+v+', opp x'+(v*v)+'.'}}})
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
        <div class="flex items-center gap-4"><div class="p-2 rounded-lg bg-math-blue-bg"><component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" /></div><div><h2 class="text-lg font-bold">{{ props.title }}</h2><p class="text-xs text-slate-500">Level {{ currentInternalLevel+1 }}/3 <span v-if="currentInternalLevel===0">(Toepassen)</span><span v-else-if="currentInternalLevel===1">(Analyseren)</span><span v-else>(Evalueren)</span></p></div></div>
        <button @click="emit('close')" class="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex">
          <div ref="mainArea" class="flex-1 p-6 overflow-y-auto">
            <div v-if="showWorkedExample&&currentInternalLevel===0" class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld</h4></div>
              <div class="space-y-1"><div v-for="(s,i) in workedSteps" :key="i" @click="workedStep=i" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer" :class="workedStep===i?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="workedStep>=i?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ i+1 }}</div><div><p class="text-sm font-medium" :class="workedStep===i?'text-indigo-900':'text-indigo-600'">{{ s.label }}</p></div></div></div>
              <button @click="showWorkedExample=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200">Begrepen!</button>
            </div>
            <div v-if="!showWorkedExample" class="text-center bg-math-blue-bg p-4 border rounded-xl mb-4"><p class="font-bold text-math-blue">{{ cl.goalText }}</p></div>
            <div v-if="sp&&!showWorkedExample" class="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ cl.pq }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in cl.po" :key="opt" @click="pa=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm" :class="pa===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600'">{{ typeof opt==='number'?opt:opt }}</button></div>
              <button v-if="pa!==null&&!pr" @click="submit" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg">Bevestig</button>
              <div v-if="pr" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="pc?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'">{{ pc?'Juist!':'Denk opnieuw.' }}</div>
            </div>
            <div v-if="!showWorkedExample&&!sp" class="p-4 border rounded-xl bg-slate-50">
              <label class="block text-sm font-bold mb-2">k: <span class="text-lg text-math-blue">{{ sf }}</span></label>
              <input type="range" v-model.number="sf" min="0.5" max="3" step="0.5" class="w-full accent-indigo-600">
              <div class="mt-4 p-3 bg-white border rounded-lg flex justify-between"><span class="text-xs font-bold uppercase">Origineel</span><span class="font-mono font-black">{{ oa }}</span></div>
              <div class="mt-2 p-3 bg-math-blue-bg border-2 rounded-lg flex justify-between" :class="isCorrect?'border-emerald-400 bg-emerald-50':''"><span class="text-xs font-bold uppercase">Beeld</span><span class="font-mono font-black" :class="isCorrect?'text-emerald-600':'text-math-blue'">{{ na }}</span></div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!showWorkedExample" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-indigo-100 text-indigo-800"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Waarom?</p><p>2D: elke dimensie xk, opp xk^2.</p></div></div>
            <div v-if="isCorrect&&currentInternalLevel===2" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-purple-100 text-purple-800"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Reflectie</p><p>Oppervlakte schaalt met k^2 omdat oppervlakte 2 dimensies heeft.</p></div></div>
            <button v-if="isCorrect" @click="hn" class="w-full py-3 font-bold text-white bg-emerald-600 rounded-lg">{{ currentInternalLevel<2?'Volgend Level':'Afronden' }}</button>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-center bg-slate-50 pattern-grid"><p class="text-slate-400">Driehoek SVG</p></div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</template>
<style scoped>.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}</style>
