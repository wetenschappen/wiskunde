<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhListNumbers, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Volgorde van Bewerkingen' },
  instruction: {
    type: String,
    default: 'Wiskunde lees je niet zomaar van links naar rechts zoals een boek. Er is een strikte hiërarchie (voorrangsregels)!<br/><br/><strong>Opdracht:</strong> Klik in de formule telkens op de bewerking die je als EERSTE moet uitvoeren. Blijf klikken tot je één getal overhoudt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListNumbers }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op een wiskundig symbool in de formule.' })

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Power before multiply/add
  const n1 = 2 + Math.floor(Math.random() * 7) // 2-8
  const p1 = 2 + Math.floor(Math.random() * 2) // 2-3
  const m1 = 2 + Math.floor(Math.random() * 4) // 2-5
  const pow1 = Math.pow(n1, p1)

  // Level 2: Parentheses before divide
  const a2 = 5 + Math.floor(Math.random() * 7) // 5-11
  const b2 = 2 + Math.floor(Math.random() * 4) // 2-5
  const c2 = 2 + Math.floor(Math.random() * 4) // 2-5
  const parenSum2 = a2 + b2
  const divResult2 = Math.floor(parenSum2 / c2)

  // Level 3: Same precedence (L→R)
  const d3a = 12 + Math.floor(Math.random() * 13) // 12-24
  const d3b = 2 + Math.floor(Math.random() * 3)  // 2-4
  const d3c = 2 + Math.floor(Math.random() * 3)  // 2-4
  const div3 = Math.floor(d3a / d3b)

  levels.value = [
    {
      goalText: `Opdracht 1: Optellen, vermenigvuldigen en machten.`,
      steps: [
        {
          state: [
            { type: 'num', val: `${n1}` }, { type: 'op', val: '+', id: 'op1' },
            { type: 'num', val: `${m1}` }, { type: 'op', val: '×', id: 'op2' },
            { type: 'num', val: `${n1}`, render: `${n1}`, id: 'op3_power' },
            { type: 'op', val: '^', id: 'op3', render: `${p1}` }
          ],
          correctOp: 'op3',
          successMsg: `Mooi! Machten hebben voorrang. ${n1}^${p1} = ${pow1}.`,
          errorMsg: `Fout! Er staat een MACHT in de formule. Die heeft absolute voorrang.`
        },
        {
          state: [
            { type: 'num', val: `${n1}` }, { type: 'op', val: '+', id: 'op1' },
            { type: 'num', val: `${m1}` }, { type: 'op', val: '×', id: 'op2' },
            { type: 'num', val: `${pow1}`, highlight: true }
          ],
          correctOp: 'op2',
          successMsg: 'Klopt! Vermenigvuldigen komt voor optellen.',
          errorMsg: 'Nee. Vermenigvuldigen (×) is sterker dan optellen (+).'
        },
        {
          state: [
            { type: 'num', val: `${n1}` }, { type: 'op', val: '+', id: 'op1' },
            { type: 'num', val: `${m1 * pow1}`, highlight: true }
          ],
          correctOp: 'op1',
          successMsg: `Perfect! Het antwoord is ${n1 + m1 * pow1}.`,
          errorMsg: ''
        },
        {
          state: [ { type: 'num', val: `${n1 + m1 * pow1}`, final: true } ]
        }
      ]
    },
    {
      goalText: `Opdracht 2: Haakjes en Delen.`,
      steps: [
        {
          state: [
            { type: 'num', val: `${a2 + b2 + c2}` }, { type: 'op', val: '-', id: 'op1' },
            { type: 'num', val: `(${a2}` }, { type: 'op', val: '+', id: 'op2' },
            { type: 'num', val: `${b2})` }, { type: 'op', val: '÷', id: 'op3' },
            { type: 'num', val: `${c2}` }
          ],
          correctOp: 'op2',
          successMsg: `Juist! Wat BINNEN de haakjes staat eerst. ${a2} + ${b2} = ${parenSum2}.`,
          errorMsg: 'Let op! Haakjes ( ) zijn de absolute baas. Kijk binnen de haakjes.'
        },
        {
          state: [
            { type: 'num', val: `${a2 + b2 + c2}` }, { type: 'op', val: '-', id: 'op1' },
            { type: 'num', val: `${parenSum2}`, highlight: true }, { type: 'op', val: '÷', id: 'op3' },
            { type: 'num', val: `${c2}` }
          ],
          correctOp: 'op3',
          successMsg: `Heel goed. Delen heeft voorrang op aftrekken. ${parenSum2} ÷ ${c2} = ${divResult2}.`,
          errorMsg: 'Fout. Delen is sterker dan aftrekken.'
        },
        {
          state: [
            { type: 'num', val: `${a2 + b2 + c2}` }, { type: 'op', val: '-', id: 'op1' },
            { type: 'num', val: `${divResult2}`, highlight: true }
          ],
          correctOp: 'op1',
          successMsg: `Goed zo. ${a2 + b2 + c2} - ${divResult2} = ${a2 + b2 + c2 - divResult2}.`,
          errorMsg: ''
        },
        {
          state: [ { type: 'num', val: `${a2 + b2 + c2 - divResult2}`, final: true } ]
        }
      ]
    },
    {
      goalText: 'Opdracht 3: Gelijkwaardige bewerkingen (links naar rechts).',
      steps: [
        {
          state: [
            { type: 'num', val: `${d3a}` }, { type: 'op', val: '÷', id: 'op1' },
            { type: 'num', val: `${d3b}` }, { type: 'op', val: '×', id: 'op2' },
            { type: 'num', val: `${d3c}` }
          ],
          correctOp: 'op1',
          successMsg: `Correct! Delen en vermenigvuldigen zijn EVEN sterk. Van LINKS naar RECHTS. ${d3a} ÷ ${d3b} = ${div3}.`,
          errorMsg: 'Opgelet! Delen en × zijn even sterk. Lees van links naar rechts.'
        },
        {
          state: [
            { type: 'num', val: `${div3}`, highlight: true }, { type: 'op', val: '×', id: 'op2' },
            { type: 'num', val: `${d3c}` }
          ],
          correctOp: 'op2',
          successMsg: `Helemaal juist. ${div3} × ${d3c} = ${div3 * d3c}.`,
          errorMsg: ''
        },
        {
          state: [ { type: 'num', val: `${div3 * d3c}`, final: true } ]
        }
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const currentStepIdx = ref(0)
const expressionState = computed(() => currentLevelData.value.steps[currentStepIdx.value].state)

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op een wiskundig symbool in de formule.' };
    currentStepIdx.value = 0;
    generateLevel();
}

function handleOpClick(id) {
    if (isCorrect.value) return;

    const stepData = currentLevelData.value.steps[currentStepIdx.value]

    if (id === stepData.correctOp) {
        feedback.value = { type: 'success', text: stepData.successMsg }
        currentStepIdx.value++;

        // If this was the last operation, mark as fully correct
        if (currentStepIdx.value === currentLevelData.value.steps.length - 1) {
            isCorrect.value = true;
            isChecked.value = true;
        } else {
          attemptCount.value = 0
        }
    } else {
        isCorrect.value = false
        attemptCount.value++
        if (attemptCount.value >= 3) {
          feedback.value = { type: 'error', text: `${stepData.errorMsg} Bekijk de voorrangsregels in de instructies.` }
        } else if (attemptCount.value >= 2) {
          feedback.value = { type: 'error', text: `${stepData.errorMsg} Denk aan de hiërarchie: haakjes > machten > ×÷ > +-` }
        } else {
          feedback.value = { type: 'error', text: stepData.errorMsg }
        }
    }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) { nextTick(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {}) }) }
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
const handleFullscreenChange = () => { if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none min-w-[44px] min-h-[44px]" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Interactief element"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-amber-50">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-surface-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-600">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-2">Voorrangsregels</h4>
               <ol class="list-decimal pl-5 text-sm text-slate-600 font-medium space-y-1">
                   <li>Haakjes ( )</li>
                   <li>Machten en Wortels</li>
                   <li>Vermenigvuldigen en Delen</li>
                   <li>Optellen en Aftrekken</li>
               </ol>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-amber-50 text-amber-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Interactive Equation -->
              <div class="bg-white px-12 py-10 rounded-xl shadow-md border-4 border-slate-200 flex items-center justify-center min-w-[400px]">

                  <transition-group name="equation" tag="div" class="flex items-baseline gap-4 relative justify-center">
                      <template v-for="(item, idx) in expressionState" :key="item.val + idx + currentStepIdx">

                          <!-- Render Number -->
                          <div v-if="item.type === 'num'"
                               class="font-mono font-black text-5xl transition-all duration-500 px-2 rounded-lg"
                               :class="item.highlight ? 'bg-amber-500-light text-amber-600 scale-110 shadow-sm' : (item.final ? 'text-amber-500 scale-125' : 'text-slate-700')">
                              {{ item.val }}
                          </div>

                          <!-- Render Operator as Button -->
                          <button v-if="item.type === 'op'"
                                  @click="handleOpClick(item.id)"
                                  class="w-12 h-12 rounded-full border-4 font-black text-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                                  :class="item.id.includes('power') ? 'border-amber-500 text-amber-600 bg-amber-50 -mt-2 -ml-2' : 'border-amber-500 text-amber-600 bg-amber-50 relative top-1'">
                              {{ item.render || item.val }}
                          </button>

</template>
                  </transition-group>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }


.equation-move { transition: transform 0.5s ease-out; }
.equation-enter-active, .equation-leave-active { transition: all 0.5s ease-out; }
.equation-enter-from { opacity: 0; transform: translateY(30px) scale(0.5); }
.equation-leave-to { opacity: 0; transform: translateY(-30px) scale(0.5); position: absolute; }
</style>
