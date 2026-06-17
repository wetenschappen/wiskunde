<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCarProfile, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Evenredigheden: Recht Evenredig' },
  instruction: {
    type: String,
    default: 'Een auto rijdt met een constante snelheid. Als je 2 keer zo lang rijdt, leg je 2 keer zoveel afstand af. Dit noemen we <strong>recht evenredig</strong>.<br/><br/><strong>Opdracht:</strong> Vul de ontbrekende afstanden in de tabel aan.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCarProfile }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Vul de lege vakjes in de tabel in.' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelNum) {
  let speed
  if (levelNum === 0) speed = r(40, 60)
  else if (levelNum === 1) speed = r(55, 80)
  else speed = r(30, 70)
  return {
    label: `${speed} km/uur`,
    speed,
    answers: { ans2: speed * 2, ans4: speed * 4, ans5: speed * 5 },
    instruction: `Een voertuig rijdt met een constante snelheid van <strong>${speed} km/uur</strong>.<br/><br/><strong>Opdracht:</strong> Vul de ontbrekende afstanden in de tabel. Wat valt je op aan de grafiek?`,
    successFeedback: `Perfect! Afstanden kloppen. De punten vormen een rechte lijn door de oorsprong — hét kenmerk van recht evenredigheid!`,
    errorHints: {
      ans2: `Fout bij 2 uur. Als je in 1 uur ${speed} km rijdt, hoeveel dan in 2 uur?`,
      ans4: `Fout bij 4 uur. Als je in 2 uur ${speed * 2} km rijdt, hoeveel dan in 4 uur?`,
      ans5: `Fout bij 5 uur. De formule is Afstand = Tijd × ${speed}.`
    }
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const displayInstruction = computed(() => currentLevel.value ? currentLevel.value.instruction : props.instruction)

const ans2 = ref(null)
const ans4 = ref(null)
const ans5 = ref(null)

const points = computed(() => {
    if (!currentLevel.value) return []
    const spd = currentLevel.value.speed
    return [
        { x: 1, y: spd, visible: true },
        { x: 2, y: ans2.value || 0, visible: ans2.value !== null },
        { x: 4, y: ans4.value || 0, visible: ans4.value !== null },
        { x: 5, y: ans5.value || 0, visible: ans5.value !== null }
    ]
})

function getHint() {
  if (attemptCount.value === 1) return 'Vermenigvuldig de tijd met de snelheid.'
  if (attemptCount.value === 2) return `Gebruik: afstand = tijd × ${currentLevel.value.speed}.`
  return `Kijk naar het voorbeeld: in 1 uur is het ${currentLevel.value.speed} km.`
}

function resetActivityState() {
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    isCorrect.value = false
celebrationDone.value = false
    isChecked.value = false
    attemptCount.value = 0
    feedback.value = { type: 'info', text: 'Vul de lege vakjes in de tabel in.' }
    ans2.value = null
    ans4.value = null
    ans5.value = null
}

function checkAnswer() {
  isChecked.value = true
  const lv = currentLevel.value
  if (!lv) return

  if (ans2.value === lv.answers.ans2 && ans4.value === lv.answers.ans4 && ans5.value === lv.answers.ans5) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: lv.successFeedback }
  } else {
    attemptCount.value++
    if (ans2.value !== lv.answers.ans2) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans2} ${getHint()}` }
    } else if (ans4.value !== lv.answers.ans4) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans4} ${getHint()}` }
    } else if (ans5.value !== lv.answers.ans5) {
        feedback.value = { type: 'error', text: `${lv.errorHints.ans5} ${getHint()}` }
    } else {
        feedback.value = { type: 'error', text: 'Vul alle vakjes in de tabel in.'}
    }
  }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    emit('complete')
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-blue-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p class="text-xs font-medium text-slate-500">
              Level {{ currentInternalLevel + 1 }} / {{ totalInternalLevels }}
              <span v-if="totalSteps > 1" class="ml-1">| Stap {{ currentStep }} van {{ totalSteps }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            {{ currentLevel.label }}
          </span>
          <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
            <PhX class="w-6 h-6" />
          </button>
        </div>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="displayInstruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border border-blue-200 bg-blue-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-blue-900 mb-4">Tabel:</h4>

               <table class="w-full text-center border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                   <thead>
                       <tr class="bg-blue-100 text-blue-800">
                           <th class="p-2 border border-blue-200">Tijd (h)</th>
                           <th class="p-2 border border-blue-200">Afstand (km)</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">1</td>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">{{ currentLevel.speed }}</td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">2</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans2" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans2 === currentLevel.answers.ans2 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">4</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans4" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans4 === currentLevel.answers.ans4 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                       <tr>
                           <td class="p-2 border border-slate-200 font-bold text-slate-700">5</td>
                           <td class="p-1 border border-slate-200">
                               <input type="number" v-model.number="ans5" :disabled="isCorrect" class="w-full p-1 text-center font-bold border-b-2 focus:border-blue-500 outline-none" :class="ans5 === currentLevel.answers.ans5 && isChecked ? 'border-emerald-500 text-emerald-600' : 'border-slate-300'" />
                           </td>
                       </tr>
                   </tbody>
               </table>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer Tabel</button>
              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-2xl bg-white shadow-xl rounded-3xl border-4 border-slate-300 p-8 flex flex-col items-center">

                  <h4 class="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Grafiek: Afstand i.f.v. Tijd</h4>

                  <div class="relative">
                      <svg width="450" height="350" viewBox="0 0 450 350" class="block">
                          <g stroke="#e2e8f0" stroke-width="1">
                              <line v-for="i in 7" :key="'vg'+i" :x1="50 + (i-1)*60" y1="50" :x2="50 + (i-1)*60" y2="300" />
                              <line v-for="i in 7" :key="'hg'+i" x1="50" :y1="300 - (i-1)*40" x2="410" :y2="300 - (i-1)*40" />
                          </g>

                          <line x1="50" y1="300" x2="420" y2="300" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />
                          <line x1="50" y1="300" x2="50" y2="30" stroke="#475569" stroke-width="3" marker-end="url(#arrow)" />

                          <defs>
                              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                  <polygon points="0 0, 10 5, 0 10" fill="#475569" />
                              </marker>
                          </defs>

                          <text x="400" y="325" font-weight="bold" fill="#64748b" font-size="12">Tijd (h)</text>
                          <text x="40" y="20" font-weight="bold" fill="#64748b" font-size="12" text-anchor="end">Afstand (km)</text>

                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="middle">
                              <text x="50" y="315">0</text>
                              <text x="110" y="315">1</text>
                              <text x="170" y="315">2</text>
                              <text x="230" y="315">3</text>
                              <text x="290" y="315">4</text>
                              <text x="350" y="315">5</text>
                          </g>

                          <g font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="end">
                              <text x="40" y="264">50</text>
                              <text x="40" y="224">100</text>
                              <text x="40" y="184">150</text>
                              <text x="40" y="144">200</text>
                              <text x="40" y="104">250</text>
                              <text x="40" y="64">300</text>
                          </g>

                          <line v-if="isCorrect" x1="50" y1="300" :x2="50 + 5*60" :y2="300 - (currentLevel.speed * 5 / 50) * 40" stroke="#0ea5e9" stroke-width="3" class="animate-slash origin-bottom-left" />

                          <g v-for="pt in points" :key="pt.x">
                              <circle v-if="pt.visible"
                                      :cx="50 + pt.x * 60"
                                      :cy="300 - (pt.y / 50) * 40"
                                      r="6" fill="#0284c7" stroke="white" stroke-width="2" class="animate-fadeIn shadow-sm" />
                          </g>

                      </svg>
                  </div>

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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-slash {
    animation: slash 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes slash {
    0% { transform: scaleX(0) scaleY(0); opacity: 0;}
    100% { transform: scaleX(1) scaleY(1); opacity: 1;}
}
</style>
