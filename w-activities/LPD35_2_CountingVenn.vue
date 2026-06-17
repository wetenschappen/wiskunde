<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhCirclesThree,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Telproblemen met Venndiagrammen'
  },
  instruction: {
    type: String,
    default: 'Sleep de juiste aantallen naar de gebieden in het venndiagram.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCirclesThree }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const labelPairs = [
  ['Voetbal', 'Tennis'], ['Wiskunde', 'Engels'],
  ['Fictie', 'Non-fictie'], ['Koffie', 'Thee'],
  ['Zwemmen', 'Hardlopen'], ['Gitaar', 'Piano'],
  ['Frans', 'Duits'], ['Basketbal', 'Volleybal']
]

function generateLevel(levelNum) {
  let center, leftOnly, rightOnly, outside
  if (levelNum === 0) {
    center = r(2, 6); leftOnly = r(4, 12); rightOnly = r(3, 10); outside = r(3, 10)
  } else if (levelNum === 1) {
    center = r(8, 25); leftOnly = r(15, 40); rightOnly = r(10, 35); outside = r(5, 20)
  } else {
    center = r(5, 15); leftOnly = r(10, 25); rightOnly = r(8, 20); outside = r(3, 15)
  }
  const total = leftOnly + center + rightOnly + outside
  const pair = labelPairs[r(0, labelPairs.length - 1)]
  const [leftLbl, rightLbl] = pair
  return {
    label: `${leftLbl} & ${rightLbl}`,
    instruction: `Er zijn ${total} personen. ${leftOnly + center} houden van ${leftLbl}, ${rightOnly + center} houden van ${rightLbl}, en ${center} houden van beide. Sleep de juiste aantallen naar de gebieden.`,
    total, leftLabel: leftLbl, rightLabel: rightLbl,
    leftTotal: leftOnly + center, rightTotal: rightOnly + center,
    correctMap: { left: leftOnly, center, right: rightOnly, outside },
    numbers: shuffle([leftOnly, center, rightOnly, outside])
  }
}

const levels = ref([])
const currentLevel = computed(() => levels.value[currentInternalLevel.value])

const availableNumbers = ref([])
const slots = ref({ left: null, center: null, right: null, outside: null })

let draggedItem = null

function onDragStart(num) {
  draggedItem = num
}

function autoCheck() {
  isChecked.value = true
  const cm = currentLevel.value.correctMap
  if (slots.value.left === cm.left && slots.value.center === cm.center &&
      slots.value.right === cm.right && slots.value.outside === cm.outside) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = { type: 'success', text: 'Perfect opgelost! Je hebt rekening gehouden met de doorsnede.' }
  } else {
    attemptCount.value++
    let hint = ''
    if (attemptCount.value === 1) hint = 'Begin altijd met de doorsnede (midden).'
    else if (attemptCount.value === 2) hint = `Trek het midden (${cm.center}) af van de totalen om de buitenste gebieden te vinden.`
    else hint = `Alleen ${leftLabel}: ${currentLevel.value.leftTotal} − ${cm.center} = ${cm.left}. Alleen ${rightLabel}: ${currentLevel.value.rightTotal} − ${cm.center} = ${cm.right}.`
    feedback.value = { type: 'error', text: `Niet helemaal juist. ${hint}` }
  }
}

function onDrop(zone) {
  if (draggedItem !== null && slots.value[zone] === null) {
    slots.value[zone] = draggedItem
    availableNumbers.value = availableNumbers.value.filter(n => n !== draggedItem)
    draggedItem = null
    isChecked.value = false
    feedback.value = { type: 'info', text: '' }
    if (slots.value.left !== null && slots.value.center !== null && slots.value.right !== null && slots.value.outside !== null) {
      autoCheck()
    }
  }
}

function returnToAvailable(zone) {
  const item = slots.value[zone]
  if (item !== null) {
    slots.value[zone] = null
    availableNumbers.value.push(item)
    availableNumbers.value.sort((a, b) => a - b)
    isChecked.value = false
    isCorrect.value = false
  }
}

function resetActivityState() {
  isCorrect.value = false
celebrationDone.value = false
  isChecked.value = false
  attemptCount.value = 0
  feedback.value = { type: 'info', text: 'Sleep de getallen naar de juiste gebieden.' }
  availableNumbers.value = [...currentLevel.value.numbers]
  slots.value = { left: null, center: null, right: null, outside: null }
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
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
    levels.value = [generateLevel(0), generateLevel(1), generateLevel(2)]
    currentInternalLevel.value = 0
    resetActivityState()
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => {})
      })
    }
    nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
    })
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) emit('close')
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) emit('close')
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (document.fullscreenElement) document.exitFullscreen().catch(e => {})
})
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
    <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')"></div>

    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-white">

      <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <div class="flex items-center gap-1.5 ml-4 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            <span v-for="i in totalInternalLevels" :key="i"
                  class="w-2.5 h-2.5 rounded-full border"
                  :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'">
            </span>
            <span class="ml-1.5">Level {{ currentInternalLevel + 1 }}</span>
          </div>
        </div>
        <button @click="emit('close')"
                class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-700"
                :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">

        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentLevel.instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-4 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl">
              <p class="font-bold text-slate-800 mb-4">Beschikbare getallen:</p>
              <div class="flex flex-wrap gap-3">
                <div v-for="num in availableNumbers" :key="num"
                     draggable="true"
                     @dragstart="onDragStart(num)"
                     class="flex items-center justify-center w-14 h-14 bg-white border-2 border-slate-300 rounded-full shadow-sm text-xl font-bold text-slate-700 cursor-grab hover:border-emerald-400 active:cursor-grabbing transition-colors">
                  {{ num }}
                </div>
                <div v-if="availableNumbers.length === 0" class="text-sm text-slate-400 italic">
                  Alle getallen zijn geplaatst.
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-center gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0" weight="fill" />
               <span>{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 text-center text-xs text-slate-400">Plaats alle getallen voor automatische controle</div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="relative w-[500px] h-[350px] border-4 border-slate-300 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <div class="absolute top-2 left-2 font-bold text-slate-400">Totaal: {{ currentLevel.total }}</div>

                <div class="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center z-10 transition-colors"
                     @dragover.prevent @drop.stop="onDrop('outside')"
                     :class="slots.outside ? 'border-slate-400 bg-slate-100' : 'border-slate-300 bg-slate-50'">
                  <span v-if="!slots.outside" class="text-xs text-slate-400 font-bold uppercase">Geen</span>
                  <div v-else @click="returnToAvailable('outside')" class="w-full h-full flex items-center justify-center text-xl font-bold text-slate-800 cursor-pointer">{{ slots.outside }}</div>
                </div>

                <div class="relative flex w-full justify-center">

                  <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-blue-400 bg-blue-100/30 top-1/2 -translate-y-1/2 left-[50px]">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-blue-600 bg-white px-2 rounded">{{ currentLevel.leftLabel }} ({{ currentLevel.leftTotal }})</div>
                  </div>

                  <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-rose-400 bg-rose-100/30 top-1/2 -translate-y-1/2 right-[50px]">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-rose-600 bg-white px-2 rounded">{{ currentLevel.rightLabel }} ({{ currentLevel.rightTotal }})</div>
                  </div>

                  <div class="relative flex w-full h-[240px] justify-center items-center z-10 pointer-events-none">

                    <div class="absolute left-[100px] pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('left')"
                           :class="slots.left ? 'border-blue-500' : 'border-blue-300'">
                        <span v-if="!slots.left" class="text-xs text-blue-400 font-bold">{{ currentLevel.leftLabel[0] }} \ {{ currentLevel.rightLabel[0] }}</span>
                        <div v-else @click="returnToAvailable('left')" class="w-full h-full flex items-center justify-center text-xl font-bold text-blue-800 cursor-pointer">{{ slots.left }}</div>
                      </div>
                    </div>

                    <div class="absolute pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('center')"
                           :class="slots.center ? 'border-purple-500' : 'border-purple-300'">
                        <span v-if="!slots.center" class="text-xs text-purple-400 font-bold">{{ currentLevel.leftLabel[0] }} ∩ {{ currentLevel.rightLabel[0] }}</span>
                        <div v-else @click="returnToAvailable('center')" class="w-full h-full flex items-center justify-center text-xl font-bold text-purple-800 cursor-pointer">{{ slots.center }}</div>
                      </div>
                    </div>

                    <div class="absolute right-[100px] pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('right')"
                           :class="slots.right ? 'border-rose-500' : 'border-rose-300'">
                        <span v-if="!slots.right" class="text-xs text-rose-400 font-bold">{{ currentLevel.rightLabel[0] }} \ {{ currentLevel.leftLabel[0] }}</span>
                        <div v-else @click="returnToAvailable('right')" class="w-full h-full flex items-center justify-center text-xl font-bold text-rose-800 cursor-pointer">{{ slots.right }}</div>
                      </div>
                    </div>

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

.shadow-inner-light { box-shadow: inset -5px 0 15px -10px rgba(0,0,0,0.1); }
.pattern-grid {
    background-image:
        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 2rem 2rem;
    background-position: center center;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
