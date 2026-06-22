<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTrendUp, PhArrowClockwise, PhBrain, PhBookOpen, PhLightbulb, PhChatCircleText } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Richtingscoefficient' }, instruction: { type: String, default: 'Pas de richtingscoefficient (a) aan.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhTrendUp } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false); const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0)
const ci = ref(0); const tl = 3; const sw = ref(true); const ws = ref(0)
const wks = [{label:'Punt (2,6): a=6/2=3',detail:'a=y/x'},{label:'f(2)=3x2=6 correct',detail:'Dus f(x)=3x'}]
const lv = ref([])
function gl(i){const r=[];const px=Math.floor(Math.random()*4)+1;const py=Math.floor(Math.random()*6)+1;const a1=Math.round(py/px*10)/10;r.push({g:'Lijn door ('+px+','+py+')',ta:a1,hp:true,px,py,pq:'Bereken a = y/x = '+py+'/'+px,po:[a1,a1*2,px/py],pc:a1,ce:[{c:(v)=>v>0&&v>a1+0.1,m:'Te steil. a='+py+'/'+px+'='+a1}],hn:'Dalend, maar punt positief.',hts:'Te steil.',htf:'Te vlak.'});const a2=-(Math.floor(Math.random()*4)+2);r.push({g:'Dalend, daalt '+Math.abs(a2)+' per stap',ta:a2,pq:'Dalend = welke a?',po:['Positieve','Negatieve'],pc:'Negatieve',ce:[{c:(v)=>v>0,m:'Let op! Dalend = negatieve a.'}],hn:'Stijgt! Moet dalen.'});r.push({g:'Horizontaal',ta:0,pq:'Horizontaal = a?',po:[0,1,'Ongedefinieerd'],pc:0,ce:[{c:(v)=>v!==0,m:'Let op! Horizontaal = a=0.'}]});return r}
const cl=computed(()=>lv.value[ci.value]);const av=ref(1)
const sp=ref(true);const pa=ref(null);const pr=ref(false);const pc=ref(false)
function submit(){const c=cl.value.pc;pc.value=typeof c==='number'?parseFloat(pa.value)===c:pa.value===c;pr.value=true;sp.value=false}
function rs(){isCorrect.value=false;celebrationDone.value=false;attemptCount.value=0;feedback.value={type:'info',text:''};lv.value=gl(0);showWorkedExample.value=ci.value===0;workedStep.value=0;sp.value=true;pa.value=null;pr.value=false;pc.value=false;const d=cl.value;if(!d)return;av.value=d.ta>0?-3:3}
function gh(c){if(c>=11)return{type:'info',text:'Methode: a = dy/dx = _.'};if(c>=8)return{type:'info',text:'Voorbeeld: punt (2,6), a=3.'};if(c>=5)return{type:'info',text:'Concept: a=dy/dx.'};return{type:'info',text:'Pas de slider aan.'}}
function hn(){if(ci.value<2){ci.value++;rs();nextTick(()=>mainArea.value?.focus())}else{if(props.currentStep<props.totalSteps)emit('update:currentStep',props.currentStep+1);else emit('complete')}}
watch(()=>props.isOpen,(v)=>{if(v){ci.value=0;lv.value=gl(0);rs();nextTick(()=>mainArea.value?.focus());window.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&props.isOpen)emit('close')})}else{shouldPulse.value=false}},{immediate:true})
onMounted(()=>document.addEventListener('fullscreenchange',()=>{if(props.isOpen&&props.fullscreen&&!document.fullscreenElement)emit('close')}))
onUnmounted(()=>{})
</script>
<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col bg-slate-50">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen bg-white">
      <header class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div class="flex items-center gap-4"><div class="p-2 rounded-lg bg-math-blue-bg"><component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" /></div><div><h2 class="text-lg font-bold">{{ props.title }}</h2><p class="text-xs text-slate-500">Level {{ ci+1 }}/{{ tl }} <span v-if="ci===0">(Toepassen)</span><span v-else-if="ci===1">(Analyseren)</span><span v-else>(Evalueren)</span></p></div></div>
        <button @click="emit('close')" class="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex">
          <div ref="mainArea" class="flex-1 p-6 overflow-y-auto">
            <div v-if="sw&&ci===0" class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld: rico berekenen</h4></div>
              <div class="space-y-1"><div v-for="(s,i) in wks" :key="i" @click="ws=i" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer" :class="ws===i?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="ws>=i?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ i+1 }}</div><div><p class="text-sm font-medium" :class="ws===i?'text-indigo-900':'text-indigo-600'">{{ s.label }}</p></div></div></div>
              <button @click="sw=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200">Begrepen!</button>
            </div>
            <div v-if="!sw" class="mb-4 text-center bg-math-blue-bg p-4 border rounded-xl"><p class="font-bold text-math-blue">{{ cl.g }}</p></div>
            <div v-if="sp&&!sw" class="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ cl.pq }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in cl.po" :key="opt" @click="pa=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm" :class="pa===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600'">{{ typeof opt==='number'?opt:opt }}</button></div>
              <button v-if="pa!==null&&!pr" @click="submit" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg">Bevestig</button>
              <div v-if="pr" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="pc?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'">{{ pc?'Juist!':'Denk opnieuw.' }}</div>
            </div>
            <div v-if="!sw&&!sp" class="p-4 border rounded-xl bg-slate-50 text-center">
              <p class="font-mono text-2xl font-black text-math-blue">f(x)={{ av }}x</p>
              <label class="block mt-4 text-sm font-bold">a: <span class="text-math-blue font-mono">{{ av }}</span></label>
              <input type="range" v-model.number="av" min="-5" max="5" step="1" class="w-full accent-teal-600">
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!sw" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-indigo-100 text-indigo-800"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Waarom?</p><p>Rico = dy/dx. Positief = stijgend, negatief = dalend, 0 = horizontaal.</p></div></div>
            <div v-if="isCorrect&&ci===2" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-purple-100 text-purple-800"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Reflectie</p><p>Waarom is horizontaal 0 en verticaal ongedefinieerd? Omdat dy=0 of dx=0.</p></div></div>
            <button v-if="isCorrect" @click="hn" class="w-full py-3 font-bold text-white bg-emerald-600 rounded-lg">{{ ci<2?'Volgend Level':'Afronden' }}</button>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-center bg-slate-50 pattern-grid"><p class="text-slate-400">Grafiek SVG</p></div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</template>
<style scoped>
.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}
</style>
