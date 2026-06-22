<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCircleDashed, PhArrowClockwise, PhBrain, PhBookOpen, PhLightbulb, PhChatCircleText } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Goniometrische Cirkel' }, instruction: { type: String, default: 'Verander de hoek om de opdracht te voltooien.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhCircleDashed } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false); const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0)
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const showWorkedExample = ref(true); const workedStep = ref(0)
const workedSteps = [{label:'sin(30)=0.5,cos(30)=0.866',detail:'30 in Q1'},{label:'cos=x-as(rood),sin=y-as(groen)',detail:'Projecties op eenheidscirkel'}]
const levels = ref([])
function gl(){const a=[30,45,60,90];const t1=a[Math.floor(Math.random()*4)];const q3=[210,225,240,330];const t2=q3[Math.floor(Math.random()*4)];const s3=140+Math.floor(Math.random()*20);levels.value=[{goal:'Draai naar '+t1+'°.',check:(a)=>a===t1,pq:'In welk kwadrant ligt '+t1+'°?',po:['I','II','III','IV'],pc:'I',ce:[{c:(a)=>a>0&&a<90&&a!==t1&&Math.abs(a-t1)<10,m:'Let op! Dichtbij, maar nog niet exact.'}],hints:[''+t1+'° is een speciale hoek.','Zet de slider precies op '+t1+'°.']},{goal:'Zoek een hoek in Q3 met sin~'+Math.sin(t2*Math.PI/180).toFixed(3)+'.',check:(a)=>a===t2,pq:'In Q3: sin en cos positief of negatief?',po:['Beide positief','Beide negatief','Sin positief'],pc:'Beide negatief',ce:[{c:(a)=>a>0&&a<180,m:'Let op! Q3 is linksonder (180-270).'}],hints:['Q3 ligt linksonder. x en y negatief.','Probeer '+t2+'°.']},{goal:'Zoek een hoek in Q2 waarbij cos<-0.8 tussen '+s3+' en 180.',check:(a)=>a>=s3&&a<=180,pq:'In Q2 is cos positief of negatief?',po:['Positief','Negatief'],pc:'Negatief',ce:[{c:(a)=>a>180,m:'Let op! Q2 is 90-180.'}],hints:['Q2 is linksboven. cos negatief.','Kies tussen '+s3+' en 180.']}]}
const cl=computed(()=>levels.value[currentInternalLevel.value]);const sp=ref(true);const pa=ref(null);const pr=ref(false);const pc=ref(false)
function submit(){pc.value=pa.value===cl.value.pc;pr.value=true;sp.value=false}
const ag=ref(45);const ar=computed(()=>ag.value*(Math.PI/180));const cv=computed(()=>Math.cos(ar.value));const sv=computed(()=>Math.sin(ar.value))
function gh(c){const h=cl.value.hints;if(c>=11)return{type:'info',text:'Methode: '+h[1]};if(c>=8)return{type:'info',text:'Voorbeeld: sin(30)=0.5, cos(30)=0.866. '+h[0]};if(c>=5)return{type:'info',text:'Concept: '+h[0]};return{type:'info',text:'Draai de slider.'}}
function rs(){isCorrect.value=false;celebrationDone.value=false;attemptCount.value=0;feedback.value={type:'info',text:''};ag.value=45;gl();sp.value=true;pa.value=null;pr.value=false;pc.value=false;showWorkedExample.value=currentInternalLevel.value===0;workedStep.value=0}
watch(ag,(n)=>{if(isCorrect.value||!cl.value||sp.value)return;if(cl.value.check(n)){isCorrect.value=true;feedback.value={type:'success',text:'Prima!'}}else{attemptCount.value++;const e=cl.value.ce.find(x=>x.c(n));feedback.value=e?{type:'error',text:e.m}:gh(attemptCount.value)}})
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
        <div class="flex items-center gap-4"><div class="p-2 rounded-lg bg-math-blue-bg"><component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" /></div><div><h2 class="text-lg font-bold text-slate-900">{{ props.title }}</h2><p class="text-xs text-slate-500">Level {{ currentInternalLevel+1 }}/3 <span v-if="currentInternalLevel===0">(Toepassen)</span><span v-else-if="currentInternalLevel===1">(Analyseren)</span><span v-else>(Evalueren)</span></p></div></div>
        <button @click="emit('close')" class="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><PhX class="w-6 h-6" /></button>
      </header>
      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 md:flex">
          <div ref="mainArea" class="flex-1 p-6 overflow-y-auto">
            <MathText :content="props.instruction" class="mb-4 prose prose-sm" />
            <div v-if="showWorkedExample&&currentInternalLevel===0" class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld</h4></div>
              <div class="space-y-1"><div v-for="(s,i) in workedSteps" :key="i" @click="workedStep=i" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer" :class="workedStep===i?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="workedStep>=i?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ i+1 }}</div><div><p class="text-sm font-medium" :class="workedStep===i?'text-indigo-900':'text-indigo-600'">{{ s.label }}</p></div></div></div>
              <button @click="showWorkedExample=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200">Begrepen!</button>
            </div>
            <div v-if="!showWorkedExample" class="text-center bg-math-blue-bg p-4 border rounded-xl mb-4"><p class="font-bold text-math-blue">{{ cl.goal }}</p></div>
            <div v-if="sp&&!showWorkedExample" class="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ cl.pq }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in cl.po" :key="opt" @click="pa=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm" :class="pa===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600'">{{ opt }}</button></div>
              <button v-if="pa!==null&&!pr" @click="submit" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg">Bevestig</button>
              <div v-if="pr" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="pc?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'">{{ pc?'Juist!':'Denk na.' }}</div>
            </div>
            <div v-if="!showWorkedExample&&!sp" class="p-4 border rounded-xl bg-slate-50 space-y-4">
              <label class="block text-sm font-bold">Hoek: <span class="text-math-blue font-mono text-lg">{{ ag }}°</span></label>
              <input type="range" v-model.number="ag" min="0" max="360" step="1" class="w-full accent-pink-600">
              <div class="flex gap-3"><div class="flex-1 bg-white p-3 rounded-lg border text-center"><div class="text-xs text-math-blue font-bold">cos</div><div class="font-mono text-lg">{{ cv.toFixed(2) }}</div></div><div class="flex-1 bg-white p-3 rounded-lg border text-center"><div class="text-xs text-emerald-500 font-bold">sin</div><div class="font-mono text-lg">{{ sv.toFixed(2) }}</div></div></div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!showWorkedExample" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-indigo-100 text-indigo-800"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Waarom werkt dit?</p><p>sin=y-coordinaat, cos=x-coordinaat op eenheidscirkel met straal 1.</p></div></div>
            <div v-if="isCorrect&&currentInternalLevel===2" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-purple-100 text-purple-800"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Reflectie</p><p>Waarom heeft sin(30°) dezelfde waarde als sin(150°)? Omdat beiden even hoog op de y-as liggen.</p></div></div>
            <button v-if="isCorrect" @click="hn" class="w-full py-3 font-bold text-white bg-emerald-600 rounded-lg">{{ currentInternalLevel<2?'Volgend Level':'Afronden' }}</button>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-center bg-slate-50 pattern-grid"><p class="text-slate-400">Eenheidscirkel SVG</p></div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</template>
<style scoped>
.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}
</style>
