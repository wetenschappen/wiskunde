<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  PhX, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhArrowRight, 
  PhCirclesThree,
  PhArrowClockwise 
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Telproblemen met Venndiagrammen'
  },
  instruction: {
    type: String,
    default: 'Er zijn 30 leerlingen in een klas. 15 spelen voetbal, 10 spelen tennis, en 4 spelen beide. Sleep de juiste aantallen naar de gebieden in het venndiagram.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCirclesThree }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Rules:
// Total = 30
// V = 15
// T = 10
// V AND T (center) = 4
// V only (left) = 15 - 4 = 11
// T only (right) = 10 - 4 = 6
// Neither (outside) = 30 - (11 + 4 + 6) = 30 - 21 = 9

const correctMap = {
  left: 11,
  center: 4,
  right: 6,
  outside: 9
}

const numbers = [4, 6, 9, 11]
const availableNumbers = ref([...numbers])
const slots = ref({ left: null, center: null, right: null, outside: null })

let draggedItem = null

function onDragStart(num) {
  draggedItem = num
}

function onDrop(zone) {
  if (draggedItem !== null && slots.value[zone] === null) {
    slots.value[zone] = draggedItem
    availableNumbers.value = availableNumbers.value.filter(n => n !== draggedItem)
    draggedItem = null
    isChecked.value = false
  }
}

function returnToAvailable(zone) {
  const item = slots.value[zone]
  if (item !== null) {
    slots.value[zone] = null
    availableNumbers.value.push(item)
    // sort ascending for neatness
    availableNumbers.value.sort((a, b) => a - b)
    isChecked.value = false
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  availableNumbers.value = [...numbers];
  slots.value = { left: null, center: null, right: null, outside: null };
}

function checkAnswer() {
  isChecked.value = true;
  
  if (slots.value.left === null || slots.value.center === null || slots.value.right === null || slots.value.outside === null) {
    isCorrect.value = false
    feedback.value = { type: 'error', text: 'Vul alle 4 de gebieden in voordat je controleert.' }
    return
  }

  if (slots.value.left === correctMap.left && slots.value.center === correctMap.center && 
      slots.value.right === correctMap.right && slots.value.outside === correctMap.outside) {
    isCorrect.value = true
    feedback.value = { 
      type: 'success', 
      text: 'Perfect opgelost! Je hebt rekening gehouden met de doorsnede.' 
    }
  } else {
    isCorrect.value = false
    feedback.value = { 
      type: 'error', 
      text: 'Er zitten fouten in. Tip: Begin altijd met de doorsnede (midden) en trek dit aantal af van de totalen.'
    }
  }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    resetActivityState();
    window.addEventListener('keydown', handleKeydown)
    if (props.fullscreen) {
      nextTick(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => {})
        }
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
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
            
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
              
              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect || availableNumbers.length > 0" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>
              
              <button v-else @click="goToNextStep" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentStep < totalSteps ? 'Volgende' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">
            
            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">
              
              <div class="relative w-[500px] h-[350px] border-4 border-slate-300 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <!-- Universum Label (U) -->
                <div class="absolute top-2 left-2 font-bold text-slate-400">Totaal: 30</div>
                
                <!-- Outside zone drop area -->
                <div class="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center z-10 transition-colors"
                     @dragover.prevent @drop.stop="onDrop('outside')"
                     :class="slots.outside ? 'border-slate-400 bg-slate-100' : 'border-slate-300 bg-slate-50'">
                  <span v-if="!slots.outside" class="text-xs text-slate-400 font-bold uppercase">Geen</span>
                  <div v-else @click="returnToAvailable('outside')" class="w-full h-full flex items-center justify-center text-xl font-bold text-slate-800 cursor-pointer">{{ slots.outside }}</div>
                </div>

                <div class="relative flex w-full justify-center">
                  
                  <!-- Left Circle (Voetbal) -->
                  <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-blue-400 bg-blue-100/30 top-1/2 -translate-y-1/2 left-[50px]">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-blue-600 bg-white px-2 rounded">Voetbal (15)</div>
                  </div>

                  <!-- Right Circle (Tennis) -->
                  <div class="absolute w-[240px] h-[240px] rounded-full border-[6px] border-rose-400 bg-rose-100/30 top-1/2 -translate-y-1/2 right-[50px]">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-rose-600 bg-white px-2 rounded">Tennis (10)</div>
                  </div>

                  <!-- Drop Zones -->
                  <div class="relative flex w-full h-[240px] justify-center items-center z-10 pointer-events-none">
                    
                    <!-- Left Drop (Enkel Voetbal) -->
                    <div class="absolute left-[100px] pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('left')"
                           :class="slots.left ? 'border-blue-500' : 'border-blue-300'">
                        <span v-if="!slots.left" class="text-xs text-blue-400 font-bold">V \ T</span>
                        <div v-else @click="returnToAvailable('left')" class="w-full h-full flex items-center justify-center text-xl font-bold text-blue-800 cursor-pointer">{{ slots.left }}</div>
                      </div>
                    </div>

                    <!-- Center Drop (Voetbal AND Tennis) -->
                    <div class="absolute pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('center')"
                           :class="slots.center ? 'border-purple-500' : 'border-purple-300'">
                        <span v-if="!slots.center" class="text-xs text-purple-400 font-bold">V ∩ T</span>
                        <div v-else @click="returnToAvailable('center')" class="w-full h-full flex items-center justify-center text-xl font-bold text-purple-800 cursor-pointer">{{ slots.center }}</div>
                      </div>
                    </div>

                    <!-- Right Drop (Enkel Tennis) -->
                    <div class="absolute right-[100px] pointer-events-auto">
                      <div class="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors bg-white/80 backdrop-blur-sm"
                           @dragover.prevent @drop.stop="onDrop('right')"
                           :class="slots.right ? 'border-rose-500' : 'border-rose-300'">
                        <span v-if="!slots.right" class="text-xs text-rose-400 font-bold">T \ V</span>
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
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
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