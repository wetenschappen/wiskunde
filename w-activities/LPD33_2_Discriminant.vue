<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhMathOperations, PhArrowClockwise, PhLightbulb, PhBrain, PhBookOpen, PhChatCircleText, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'
const props = defineProps({ isOpen: Boolean, title: { type: String, default: 'Discriminant en Oplossingen' }, instruction: { type: String, default: 'Verander a, b en c en let op de snijpunten met de x-as.' }, currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: true }, icon: { type: Object, default: () => PhMathOperations } })
const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const feedback = ref({ type: 'info', text: '' }); const attemptCount = ref(0); const wrongCounters = ref({ halfB: 0, signFlip: 0, productMix: 0 })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const showWorkedExample = ref(true); const workedStep = ref(0)
const workedSteps = [{label:'2x^2+5x+3=0',detail:'a=2,b=5,c=3'},{label:'D=5^2-4x2x3',detail:'D=25-24=1'},{label:'D>0 dus 2 oplossingen',detail:'x=(-5±√1)/(4)'}]
const levels = ref([])
function generateLevel(levelIndex) {
  const targets = [{ targetSnijpunten: 2, goalText: 'Maak een parabool met exact 2 snijpunten.', predictionQuestion: 'Hoeveel snijpunten als D>0?', predictionOptions: [0, 1, 2], predictionCorrect: 2, commonErrors: [{ condition: (a,b,c,d) => a === 0, message: 'Let op! a=0 is geen parabool.' }, { condition: (a,b,c,d) => d > 0 && d < 0.01, message: 'Let op! D is heel klein positief.' }] }, { targetSnijpunten: 1, goalText: 'Zorg dat de parabool de x-as op 1 punt raakt.', predictionQuestion: 'Wat is D bij 1 raakpunt?', predictionOptions: ['D>0', 'D=0', 'D<0'], predictionCorrect: 'D=0', commonErrors: [{ condition: (a,b,c,d) => d > 0, message: 'Let op! D>0 = 2 snijpunten. D=0 nodig.' }] }, { targetSnijpunten: 0, goalText: 'Maak een zwevende parabool (geen nulwaarden).', predictionQuestion: 'Wat is D als de parabool de x-as nergens raakt?', predictionOptions: ['D>0', 'D=0', 'D<0'], predictionCorrect: 'D<0', commonErrors: [{ condition: (a,b,c,d) => d >= 0, message: 'Let op! D moet negatief zijn.' }] }]
  return targets[levelIndex]
}
const cl = computed(() => levels.value[currentInternalLevel.value])
const sp = ref(true); const pa = ref(null); const pr = ref(false); const pc = ref(false)
function submit() { const c = cl.value.predictionCorrect; pc.value = Array.isArray(c) ? pa.value === c[currentInternalLevel.value] : pa.value === c; pr.value = true; sp.value = false }
const valA = ref(1); const valB = ref(0); const valC = ref(0)
const disc = computed(() => (valB.value * valB.value) - (4 * valA.value * valC.value))
const roots = computed(() => { const d = disc.value; if (valA.value === 0) return []; if (d < 0) return []; if (d === 0) return [-valB.value / (2 * valA.value)]; return [(-valB.value - Math.sqrt(d)) / (2 * valA.value), (-valB.value + Math.sqrt(d)) / (2 * valA.value)] })
function gh(count) { if (count >= 11) return { type: 'info', text: 'Methode: D=b^2-4ac. Probeer a=1,b=4,c=4 zodat D=4^2-4(1)(4)=_' }; if (count >= 8) return { type: 'info', text: 'Voorbeeld: a=2,b=5,c=3 - D=25-24=1. Jouw parameters...' }; if (count >= 5) return { type: 'info', text: 'Concept: D=b^2-4ac zegt hoeveel snijpunten.' }; if (count >= 2) return { type: 'info', text: 'Gebruik de schuifregelaars om a,b,c aan te passen.' }; return { type: 'info', text: 'Verschuif de sliders.' } }
function ce(a, b, c, d) { const errs = cl.value.commonErrors; for (const e of errs) { const m = e.condition(a, b, c, d); if (m) return m } return null }
function rs() { levels.value[currentInternalLevel.value] = generateLevel(currentInternalLevel.value); isCorrect.value = false; celebrationDone.value = false; attemptCount.value = 0; feedback.value = { type: 'info', text: 'Verschuif de sliders.' }; sp.value = true; pa.value = null; pr.value = false; pc.value = false; showWorkedExample.value = currentInternalLevel.value === 0; workedStep.value = 0; valA.value = 1; valB.value = 0; valC.value = 2 }
const dt = ref(null)
watch([valA, valB, valC], () => { if (dt.value) clearTimeout(dt.value); dt.value = setTimeout(() => { if (isCorrect.value || sp.value) return; if (valA.value === 0) { feedback.value = { type: 'error', text: 'Let op! a=0 geen parabool.' }; return } attemptCount.value++; if (roots.value.length === cl.value.targetSnijpunten) { isCorrect.value = true; feedback.value = { type: 'success', text: cl.value.successText || 'Correct!' } } else { const e = ce(valA.value, valB.value, valC.value, disc.value); feedback.value = e ? { type: 'error', text: e } : gh(attemptCount.value) } }, 400) })
function hn() { if (currentInternalLevel.value < 2) { currentInternalLevel.value++; rs(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }
watch(() => props.isOpen, (v) => { if (v) { currentInternalLevel.value = 0; rs(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && props.isOpen) emit('close') }) } else { shouldPulse.value = false } }, { immediate: true })
onMounted(() => document.addEventListener('fullscreenchange', () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }))
onUnmounted(() => {})
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
            <MathText :content="props.instruction" class="mb-4 prose prose-sm text-slate-600" />
            <div v-if="showWorkedExample&&currentInternalLevel===0" class="mb-4 border border-indigo-200 bg-indigo-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBookOpen class="w-5 h-5 text-indigo-600" weight="fill" /><h4 class="font-bold text-indigo-800">Voorbeeld: D berekenen</h4></div>
              <div class="space-y-1"><div v-for="(s,i) in workedSteps" :key="i" @click="workedStep=i" class="flex items-center gap-3 p-2 rounded-lg cursor-pointer" :class="workedStep===i?'bg-indigo-100':'hover:bg-indigo-100/50'"><div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" :class="workedStep>=i?'bg-indigo-500 text-white':'bg-indigo-200 text-indigo-400'">{{ i+1 }}</div><div><p class="text-sm font-medium" :class="workedStep===i?'text-indigo-900':'text-indigo-600'">{{ s.label }}</p></div></div></div>
              <button @click="showWorkedExample=false" class="mt-3 w-full py-2 text-sm font-bold text-indigo-600 bg-white rounded-lg border border-indigo-200">Begrepen! Start oefening.</button>
            </div>
            <div v-if="!showWorkedExample" class="text-center bg-math-blue-bg p-4 border border-surface-200 rounded-xl mb-4"><p class="font-bold text-math-blue">{{ cl.goalText }}</p></div>
            <div v-if="sp&&!showWorkedExample" class="mb-4 border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3"><PhBrain class="w-5 h-5 text-amber-600" weight="fill" /><h4 class="font-bold text-amber-800">Voorspel!</h4></div>
              <p class="text-sm text-amber-700 mb-3">{{ cl.predictionQuestion }}</p>
              <div class="flex gap-2 flex-wrap"><button v-for="opt in cl.predictionOptions" :key="opt" @click="pa=opt" class="px-4 py-2 rounded-lg border-2 font-bold text-sm" :class="pa===opt?'border-amber-500 bg-amber-100 text-amber-800':'border-amber-200 bg-white text-amber-600'">{{ typeof opt==='number'?opt:opt }}</button></div>
              <button v-if="pa!==null&&!pr" @click="submit" class="mt-3 w-full py-2 text-sm font-bold text-white bg-amber-500 rounded-lg">Bevestig</button>
              <div v-if="pr" class="mt-3 p-3 rounded-lg text-sm font-medium" :class="pc?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'"><span v-if="pc">Juist!</span><span v-else>Denk na.</span></div>
            </div>
            <div v-if="!showWorkedExample&&!sp" class="space-y-4">
              <div class="text-center bg-white p-4 border border-slate-200 rounded-lg"><p class="font-mono text-xl font-black text-slate-700">f(x) = {{ valA }}x^2 {{ valB>=0?'+'+valB:'-'+Math.abs(valB) }}x {{ valC>=0?'+'+valC:'-'+Math.abs(valC) }}</p><div class="bg-slate-100 p-2 rounded-lg mt-2"><p class="text-xs text-slate-500">D = b^2-4ac</p><p class="font-mono text-lg font-bold" :class="disc>0?'text-emerald-600':(disc<0?'text-red-500':'text-blue-600')">D = {{ disc }}</p></div></div>
              <div><label class="block mb-2 text-sm font-bold text-slate-700">a: {{ valA }}</label><input type="range" v-model.number="valA" min="-3" max="3" step="0.5" class="w-full accent-teal-600"></div>
              <div><label class="block mb-2 text-sm font-bold text-slate-700">b: {{ valB }}</label><input type="range" v-model.number="valB" min="-6" max="6" step="1" class="w-full accent-teal-600"></div>
              <div><label class="block mb-2 text-sm font-bold text-slate-700">c: {{ valC }}</label><input type="range" v-model.number="valC" min="-6" max="6" step="1" class="w-full accent-teal-600"></div>
            </div>
          </div>
          <div class="p-6 bg-slate-50 border-t border-slate-200">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg" :class="{'bg-emerald-100 text-emerald-800':feedback.type==='success','bg-red-100 text-red-800':feedback.type==='error','bg-blue-100 text-blue-800':feedback.type==='info'}"><component :is="feedback.type==='success'?PhCheckCircle:PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span>{{ feedback.text }}</span></div>
            <div v-if="isCorrect&&!showWorkedExample" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-indigo-100 text-indigo-800"><PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Waarom werkt dit?</p><p>D=b^2-4ac bepaalt of we 0,1 of 2 oplossingen krijgen via de abc-formule. D>0 = 2, D=0 = 1, D<0 = 0.</p></div></div>
            <div v-if="isCorrect&&currentInternalLevel===2" class="flex items-start gap-3 p-3 mb-3 text-sm font-medium rounded-lg bg-purple-100 text-purple-800"><PhChatCircleText class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><div><p class="font-bold">Reflectie</p><p>Waarom vertelt D ons het aantal snijpunten zonder de abc-formule? Omdat D de wortel-inhoud is: negatieve inhoud = geen oplossing in R.</p></div></div>
            <div class="flex items-center gap-3"><button @click="rs" class="p-3 text-slate-500 bg-white border border-slate-200 rounded-lg"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="hn" class="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-lg">{{ currentInternalLevel<2?'Volgend Level':'Afronden' }}</button>
              <div v-else class="flex-1 py-3 text-center text-slate-400 bg-slate-100 rounded-lg">Pas a,b,c aan</div>
            </div>
          </div>
        </div>
        <div class="flex flex-1 items-center justify-center bg-slate-50 pattern-grid"><p class="text-slate-400">Grafiek (vereenvoudigd)</p></div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect&&!celebrationDone" @done="celebrationDone=true" />
</template>
<style scoped>
.pattern-grid{background-image:linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px);background-size:2rem 2rem;}
</style>
