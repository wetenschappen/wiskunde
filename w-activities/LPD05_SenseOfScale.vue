<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScales, PhArrowClockwise,
  PhBugBeetle, PhDrop, PhHouse, PhCar, PhPencilSimple, PhCoffee, PhPill, PhUser, PhHamburger, PhBathtub
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Grootheden en Eenheden: Maatbesef' },
  instruction: {
    type: String,
    default: 'Wiskunde gaat over de realiteit. Koppel de juiste eenheid aan elk object door het stempel naar het object te slepen!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhScales }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Sleep voor elk object de juiste eenheid-stempel.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const levelTemplates = [
  {
    stamps: ['mm', 'cm', 'm', 'km'],
    items: [
      { id: 'l1', name: 'Een huisvlieg', val: 8, correctUnit: 'mm', selectedUnit: null, icon: PhBugBeetle, color: 'text-slate-600', bg: 'bg-slate-100' },
      { id: 'l2', name: 'Een potlood', val: 15, correctUnit: 'cm', selectedUnit: null, icon: PhPencilSimple, color: 'text-orange-500', bg: 'bg-orange-50' },
      { id: 'l3', name: 'Een klaslokaal', val: 10, correctUnit: 'm', selectedUnit: null, icon: PhHouse, color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 'l4', name: 'Afstand tot de zee', val: 45, correctUnit: 'km', selectedUnit: null, icon: PhCar, color: 'text-emerald-500', bg: 'bg-emerald-50' }
    ]
  },
  {
    stamps: ['ml', 'cl', 'l', 'm³'],
    items: [
      { id: 'v1', name: 'Medicijnspuitje', val: 5, correctUnit: 'ml', selectedUnit: null, icon: PhDrop, color: 'text-red-500', bg: 'bg-red-50' },
      { id: 'v2', name: 'Kopje koffie', val: 25, correctUnit: 'cl', selectedUnit: null, icon: PhCoffee, color: 'text-amber-700', bg: 'bg-amber-100' },
      { id: 'v3', name: 'Fles water', val: 1.5, correctUnit: 'l', selectedUnit: null, icon: PhDrop, color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 'v4', name: 'Zwembad', val: 50, correctUnit: 'm³', selectedUnit: null, icon: PhBathtub, color: 'text-cyan-500', bg: 'bg-cyan-50' }
    ]
  },
  {
    stamps: ['mg', 'g', 'kg', 'ton'],
    items: [
      { id: 'm1', name: 'Medicijnpil', val: 500, correctUnit: 'mg', selectedUnit: null, icon: PhPill, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
      { id: 'm2', name: 'Hamburger', val: 200, correctUnit: 'g', selectedUnit: null, icon: PhHamburger, color: 'text-amber-500', bg: 'bg-amber-50' },
      { id: 'm3', name: 'Volwassen man', val: 80, correctUnit: 'kg', selectedUnit: null, icon: PhUser, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { id: 'm4', name: 'Vrachtwagen', val: 2.5, correctUnit: 'ton', selectedUnit: null, icon: PhCar, color: 'text-slate-700', bg: 'bg-slate-200' }
    ]
  }
]

function generateLevel() {
  return levelTemplates.map((tmpl, i) => ({
    goalText: i === 0 ? 'Opdracht 1: Lengtematen' : i === 1 ? 'Opdracht 2: Inhoudsmaten' : 'Opdracht 3: Massamaten (Gewicht)',
    stamps: shuffle(tmpl.stamps),
    items: shuffle(tmpl.items.map(item => ({
      ...item,
      selectedUnit: null
    })))
  }))
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const currentItems = ref([])
const currentStamps = computed(() => currentLevelData.value?.stamps || [])
const currentGoal = computed(() => currentLevelData.value?.goalText || '')

let draggedStamp = null

function onDragStart(stamp) { if(!isCorrect.value) draggedStamp = stamp }
function onDrop(item) {
    if (!isCorrect.value && draggedStamp !== null) {
        item.selectedUnit = draggedStamp
        draggedStamp = null
        isChecked.value = false
        // Auto-correct: check if ALL items are correctly stamped
        autoValidate()
    }
}

function autoValidate() {
  const allFilled = currentItems.value.every(item => item.selectedUnit !== null)
  if (!allFilled) {
    // Not all items filled yet — no feedback, just a gentle nudge if first few done
    const filledCount = currentItems.value.filter(item => item.selectedUnit !== null).length
    if (filledCount > 0) {
      feedback.value = { type: 'info', text: `Goed bezig! Nog ${currentItems.value.length - filledCount} object${currentItems.value.length - filledCount === 1 ? '' : 'en'} te gaan.` }
    }
    return
  }

  const allCorrect = currentItems.value.every(item => item.selectedUnit === item.correctUnit)

  if (allCorrect) {
    isCorrect.value = true
    isChecked.value = true
    feedback.value = {
      type: 'success',
      text: 'Perfect! Je hebt een uitstekend maatbesef voor deze grootheden.'
    }
  } else {
    attemptCount.value++
    isChecked.value = true

    const wrongItem = currentItems.value.find(item => item.selectedUnit !== item.correctUnit)

    if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: `Kijk nog eens goed naar '${wrongItem.name}'. ${wrongItem.val} ${wrongItem.selectedUnit} is niet logisch in de werkelijkheid.`}
    } else if (attemptCount.value === 2) {
      let hint = ''
      const idx = currentItems.value.indexOf(wrongItem)
      if (idx === 0) hint = 'Het kleinste object heeft de kleinste eenheid.'
      else if (idx === currentItems.value.length - 1) hint = 'Het grootste object heeft de grootste eenheid.'
      else hint = 'Kijk naar de grootte van het object. ' + wrongItem.val + ' is een klein getal — hoort daar een kleine of een grote eenheid bij?'
      feedback.value = { type: 'error', text: `'${wrongItem.name}' is nog niet juist. ${hint}`}
    } else {
      feedback.value = { type: 'error', text: `Probeer voor '${wrongItem.name}': ${wrongItem.val} ${wrongItem.correctUnit} is de realistische combinatie. Kun je de juiste stempel plaatsen?`}
    }
  }
}

function removeStamp(item) {
    if (!isCorrect.value) {
        item.selectedUnit = null
        isChecked.value = false
    }
}

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Sleep voor elk object de juiste eenheid-stempel.' };
    attemptCount.value = 0;
    // Deep clone the items from the generated level
    if (currentLevelData.value) {
      currentItems.value = currentLevelData.value.items.map(item => ({ ...item, selectedUnit: null }))
    }
}

watch(currentLevelData, (val) => {
  if (val) {
    currentItems.value = val.items.map(item => ({ ...item, selectedUnit: null }))
  }
}, { immediate: true })

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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-emerald-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-emerald-800">{{ currentGoal }}</p>
            </div>

            <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest text-center">Stempels</label>
               <div class="flex flex-wrap justify-center gap-2">
                   <div v-for="stamp in currentStamps" :key="stamp"
                        draggable="true" @dragstart="onDragStart(stamp)"
                        class="px-4 py-2 border-2 border-slate-300 bg-white rounded-lg font-bold text-lg text-slate-700 cursor-grab active:cursor-grabbing hover:border-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
                        :class="{'opacity-30 pointer-events-none': currentItems.some(i => i.selectedUnit === stamp) || isCorrect}">
                       {{ stamp }}
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
              <button @click="handleNext" v-if="isCorrect" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 px-4 text-center text-sm font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
                Plaats alle stempels op de objecten
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-8 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div v-for="item in currentItems" :key="item.id" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center animate-fadeIn transform transition-transform">

                      <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4" :class="item.bg">
                          <component :is="item.icon" weight="duotone" class="w-10 h-10" :class="item.color" />
                      </div>

                      <h3 class="font-bold text-slate-800 text-lg mb-1 text-center h-14 flex items-center">{{ item.name }}</h3>

                      <div class="mt-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full justify-center">
                          <span class="text-3xl font-black text-slate-700">{{ item.val }}</span>

                          <!-- Drop Zone -->
                          <div @dragover.prevent @drop="onDrop(item)"
                               class="w-20 h-12 border-2 border-dashed rounded-lg flex items-center justify-center relative transition-all"
                               :class="item.selectedUnit ? (isCorrect ? 'border-emerald-400 bg-emerald-50' : (isChecked && item.selectedUnit !== item.correctUnit ? 'border-red-400 bg-red-50' : 'border-slate-800 bg-slate-100')) : 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100'">

                               <span v-if="!item.selectedUnit" class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">Sleep<br>Hier</span>
                               <span v-else class="text-xl font-black" :class="isChecked && !isCorrect && item.selectedUnit !== item.correctUnit ? 'text-red-600' : 'text-slate-800'">{{ item.selectedUnit }}</span>

                               <button v-if="item.selectedUnit && !isCorrect" @click="removeStamp(item)" class="absolute -top-3 -right-3 bg-slate-200 rounded-full p-1 hover:bg-red-200 hover:text-red-700 border-2 border-white shadow-sm z-10">
                                   <PhX weight="bold" class="w-3 h-3" />
                               </button>
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
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>
