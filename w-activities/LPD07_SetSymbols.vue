<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhTextT, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Verzamelingen: De Symbolentaal' },
  instruction: {
    type: String,
    default: 'Wiskundige symbolen vertellen ons precies waar elementen thuishoren in een Venndiagram.<br/><br/><strong>Opdracht:</strong> Sleep de getallen naar de juiste zone in het Venndiagram, zodat de uitdrukking WAAR is.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTextT }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep de getallen naar de cirkels.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function generateLevel() {
  function pickN(n, min, max) {
    const result = []
    while (result.length < n) {
      const r = Math.floor(Math.random() * (max - min + 1)) + min
      if (!result.includes(r)) result.push(r)
    }
    return result
  }
  const l1Nums = pickN(1, 2, 6)
  const l2Nums = pickN(2, 1, 8)
  const l3Only = pickN(1, 3, 9)
  const l3InterNums = pickN(1, 2, 8).filter(n => !l3Only.includes(n))
  const l3Inter = l3InterNums.length > 0 ? l3InterNums[0] : (l3Only[0] === 3 ? 4 : 3)
  return [
    {
      goalText: 'Opdracht 1: De Doorsnede',
      expression: 'A ∩ B = {' + l1Nums[0] + '}',
      targetPlacements: { [l1Nums[0]]: 'intersect' },
      hint: 'De doorsnede (∩) is het stukje dat tot BEIDE verzamelingen behoort. Waar overlappen de cirkels?'
    },
    {
      goalText: 'Opdracht 2: Het Verschil',
      expression: 'A \\ B = {' + l2Nums[0] + ', ' + l2Nums[1] + '}',
      targetPlacements: { [l2Nums[0]]: 'a-only', [l2Nums[1]]: 'a-only' },
      hint: 'Het verschil (\\) betekent: alles wat in A zit, ZONDER de elementen die ook in B zitten.'
    },
    {
      goalText: 'Opdracht 3: Combinatie',
      expression: 'B \\ A = {' + l3Only[0] + '} en A ∩ B = {' + l3Inter + '}',
      targetPlacements: { [l3Only[0]]: 'b-only', [l3Inter]: 'intersect' },
      hint: 'Lees beide delen goed. B \\ A is B zonder A. En ∩ is de overlap.'
    }
  ]
}

const levels = ref(generateLevel())

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const numbersAvailable = computed(() => Object.keys(currentLevelData.value.targetPlacements).map(Number))

// State for placements: { number: 'zone' }
// zones: 'a-only', 'b-only', 'intersect', 'outside'
const placements = ref({})

let draggedNumber = null
function onDragStart(num) { if(!isCorrect.value) draggedNumber = num }
function onDrop(zone) {
    if (!isCorrect.value && draggedNumber !== null) {
        placements.value[draggedNumber] = zone
        draggedNumber = null

        // Auto-correct: check if all placed correctly
        const targets = currentLevelData.value.targetPlacements
        const required = Object.keys(targets).map(Number)
        const placed = Object.keys(placements.value).map(Number)
        const allPlaced = required.every(n => placed.includes(n))

        if (allPlaced) {
            const allCorrect = required.every(n => placements.value[n] === targets[n])
            if (allCorrect) {
                isCorrect.value = true
                feedback.value = {
                    type: 'success',
                    text: 'Magistraal! Je beheerst de symbolentaal van verzamelingen perfect.'
                }
            } else {
                attemptCount.value++
                const wrongNum = required.find(n => placements.value[n] !== targets[n])
                if (attemptCount.value === 1) {
                    feedback.value = { type: 'error', text: 'Kijk goed naar de symbolen. Waar hoort het getal ' + wrongNum + ' precies thuis?' }
                } else if (attemptCount.value === 2) {
                    feedback.value = { type: 'error', text: currentLevelData.value.hint }
                } else {
                    feedback.value = { type: 'error', text: 'Probeer de getallen stap voor stap te plaatsen zoals de uitdrukking aangeeft: ' + currentLevelData.value.expression }
                }
            }
        }
    }
}
function removePlacement(num) {
    if (!isCorrect.value) {
        delete placements.value[num]
    }
}

function resetActivityState() {
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Sleep de getallen naar de cirkels.' };
    placements.value = {};
    attemptCount.value = 0;
    levels.value = generateLevel();
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-teal-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-teal-500' : 'bg-slate-200'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-teal-50 p-4 border border-teal-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-teal-800">{{ currentLevelData.goalText }}</p>
              <div class="mt-3 bg-white p-3 border border-teal-300 rounded shadow-inner text-2xl font-mono font-black text-slate-800">
                  {{ currentLevelData.expression }}
              </div>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest text-center">Getallen</label>
               <div class="flex flex-wrap justify-center gap-2">
                   <div v-for="num in numbersAvailable" :key="num"
                        draggable="true" @dragstart="onDragStart(num)"
                        class="w-12 h-12 flex items-center justify-center border-2 border-slate-300 bg-white rounded-full font-bold text-xl text-slate-700 cursor-grab hover:border-teal-400 hover:text-teal-600 transition-colors shadow-sm"
                        :class="{'opacity-30 pointer-events-none': placements[num]}">
                       {{ num }}
                   </div>
               </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" disabled class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-400 cursor-not-allowed opacity-60">Auto-controle actief</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="relative w-[600px] h-[400px] flex items-center justify-center bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-200/50">

                  <div class="relative w-[500px] h-[300px] flex">

                      <!-- CIRCLE A (Left) / a-only drop zone -->
                      <div @dragover.prevent @drop.prevent.stop="onDrop('a-only')"
                           class="absolute left-0 w-[300px] h-[300px] rounded-full border-[6px] border-blue-500 bg-blue-500/10 flex flex-col p-8 transition-colors"
                           :class="draggedNumber ? 'hover:bg-blue-500/30' : ''">
                           <span class="font-black text-2xl text-blue-700 pointer-events-none">A</span>

                           <!-- Display placed items -->
                           <div class="absolute inset-0 flex flex-wrap items-center justify-center gap-2 pr-[100px] pointer-events-none">
                               <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'a-only')" :key="num"
                                    class="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center font-bold text-lg text-blue-800 shadow-sm pointer-events-auto cursor-pointer"
                                    @click="removePlacement(num)">
                                   {{ num }}
                               </div>
                           </div>
                      </div>

                      <!-- CIRCLE B (Right) / b-only drop zone -->
                      <div @dragover.prevent @drop.prevent.stop="onDrop('b-only')"
                           class="absolute right-0 w-[300px] h-[300px] rounded-full border-[6px] border-amber-500 bg-amber-500/10 flex flex-col p-8 items-end transition-colors"
                           :class="draggedNumber ? 'hover:bg-amber-500/30' : ''">
                           <span class="font-black text-2xl text-amber-700 pointer-events-none">B</span>

                           <!-- Display placed items -->
                           <div class="absolute inset-0 flex flex-wrap items-center justify-center gap-2 pl-[100px] pointer-events-none">
                               <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'b-only')" :key="num"
                                    class="w-10 h-10 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center font-bold text-lg text-amber-800 shadow-sm pointer-events-auto cursor-pointer"
                                    @click="removePlacement(num)">
                                   {{ num }}
                               </div>
                           </div>
                      </div>

                      <!-- INTERSECTION drop zone -->
                      <div @dragover.prevent @drop.prevent.stop="onDrop('intersect')"
                           class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[200px] rounded-full z-20 flex flex-col items-center justify-center gap-2 transition-colors cursor-crosshair"
                           :class="draggedNumber ? 'bg-teal-500/20' : ''">

                           <div v-for="num in Object.keys(placements).filter(k => placements[k] === 'intersect')" :key="num"
                                class="w-10 h-10 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center font-bold text-lg text-teal-800 shadow-sm cursor-pointer"
                                @click="removePlacement(num)">
                               {{ num }}
                           </div>
                      </div>

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
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
