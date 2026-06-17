<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhTable,
  PhArrowClockwise
} from '@phosphor-icons/vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Waarheidstabellen'
  },
  instruction: {
    type: String,
    default: 'Vul de waarheidstabel in voor de disjunctie (A of B) (genoteerd als A ∨ B). Klik op de vakjes in de laatste kolom om te wisselen tussen 0 (Onwaar) en 1 (Waar).'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhTable }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// --- 3-level structure ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  {
    label: 'Disjunctie (OF)',
    instruction: 'Vul de waarheidstabel in voor de disjunctie (A of B) (genoteerd als A ∨ B). Klik op de vakjes in de laatste kolom om te wisselen tussen 0 (Onwaar) en 1 (Waar).',
    operatorText: 'A ∨ B',
    description: 'Een disjunctie is enkel onwaar als alle beweringen onwaar zijn.',
    successText: 'Perfect! De disjunctie "A of B" is waar zodra minstens één van beide beweringen waar is.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 1 },
      { A: 1, B: 1, ans: null, correct: 1 }
    ]
  },
  {
    label: 'Conjunctie (EN)',
    instruction: 'Vul de waarheidstabel in voor de conjunctie (A en B) (genoteerd als A ∧ B). Klik op de vakjes in de laatste kolom om te wisselen tussen 0 (Onwaar) en 1 (Waar).',
    operatorText: 'A ∧ B',
    description: 'Een conjunctie is enkel waar als ALLE beweringen waar zijn.',
    successText: 'Perfect! De conjunctie "A en B" is enkel waar wanneer beide beweringen waar zijn.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 0 },
      { A: 1, B: 0, ans: null, correct: 0 },
      { A: 1, B: 1, ans: null, correct: 1 }
    ]
  },
  {
    label: 'Exclusieve Disjunctie (XOR)',
    instruction: 'Vul de waarheidstabel in voor de exclusieve disjunctie (A XOR B) (genoteerd als A ⊕ B). Klik op de vakjes in de laatste kolom om te wisselen tussen 0 (Onwaar) en 1 (Waar).',
    operatorText: 'A ⊕ B',
    description: 'Een exclusieve disjunctie is waar als precies één van beide beweringen waar is.',
    successText: 'Perfect! XOR is waar wanneer A en B verschillen.',
    tableRows: [
      { A: 0, B: 0, ans: null, correct: 0 },
      { A: 0, B: 1, ans: null, correct: 1 },
      { A: 1, B: 0, ans: null, correct: 1 },
      { A: 1, B: 1, ans: null, correct: 0 }
    ]
  }
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

const tableRows = ref([])

function toggleAns(index) {
  if (isCorrect.value) return;
  const current = tableRows.value[index].ans;
  if (current === null) tableRows.value[index].ans = 0;
  else if (current === 0) tableRows.value[index].ans = 1;
  else tableRows.value[index].ans = null;
  isChecked.value = false;
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  tableRows.value = currentLevel.value.tableRows.map(r => ({ ...r, ans: null }));
}

function checkAnswer() {
  isChecked.value = true;

  if (tableRows.value.some(r => r.ans === null)) {
    isCorrect.value = false;
    feedback.value = { type: 'error', text: 'Vul alle velden in de laatste kolom in.' };
    return;
  }

  const allCorrect = tableRows.value.every(r => r.ans === r.correct);

  if (allCorrect) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: currentLevel.value.successText
    }
  } else {
    isCorrect.value = false
    feedback.value = {
      type: 'error',
      text: 'Er zitten fouten in. Denk na: wanneer is "A of B" onwaar? Enkel als ze BEIDE onwaar zijn.'
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

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    emit('complete')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    resetActivityState();
    currentInternalLevel.value = 0;
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-sky-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <!-- Level indicator -->
          <div class="flex items-center gap-1.5 ml-4 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            <span v-for="i in totalInternalLevels" :key="i"
                  class="w-2.5 h-2.5 rounded-full border"
                  :class="i <= currentInternalLevel + 1 ? 'bg-sky-500 border-sky-600' : 'bg-slate-200 border-slate-300'">
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
            <div class="mb-6 prose prose-sm text-slate-600" v-html="currentLevel.instruction"></div>

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-4">
              <p class="font-bold text-slate-800">Logische Poorten:</p>
              <div class="bg-white p-4 border border-slate-200 rounded font-mono text-lg shadow-sm text-center">
                {{ currentLevel.operatorText }}
              </div>
              <p class="text-sm text-slate-600 italic">{{ currentLevel.description }}</p>
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

              <button v-if="!isCorrect" @click="checkAnswer" :disabled="isChecked && !isCorrect" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
                Controleer
              </button>

              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto">

            <div class="relative flex-1 flex flex-col items-center justify-center w-full min-h-[400px] p-8 bg-slate-100 rounded-2xl border-2 border-slate-200/50 pattern-grid overflow-hidden">

              <div class="bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden w-full max-w-lg">

                <div class="flex bg-slate-800 text-white text-xl font-bold">
                  <div class="flex-1 p-4 text-center border-r border-slate-600">A</div>
                  <div class="flex-1 p-4 text-center border-r border-slate-600">B</div>
                  <div class="flex-1 p-4 text-center text-sky-300">{{ currentLevel.operatorText }}</div>
                </div>

                <div v-for="(row, index) in tableRows" :key="index" class="flex border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors h-20 items-center">

                  <div class="flex-1 text-center font-mono text-2xl font-bold border-r border-slate-200 h-full flex items-center justify-center text-slate-700">
                    {{ row.A }}
                  </div>

                  <div class="flex-1 text-center font-mono text-2xl font-bold border-r border-slate-200 h-full flex items-center justify-center text-slate-700">
                    {{ row.B }}
                  </div>

                  <div class="flex-1 text-center font-mono text-2xl font-bold h-full flex items-center justify-center p-2">
                    <button @click="toggleAns(index)"
                            class="w-full h-full rounded border-2 border-dashed flex items-center justify-center transition-colors font-black text-3xl"
                            :class="{
                              'border-slate-300 hover:border-sky-400 bg-slate-50 text-transparent': row.ans === null,
                              'border-sky-500 bg-sky-50 text-sky-700': row.ans !== null
                            }">
                      {{ row.ans !== null ? row.ans : '?' }}
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