<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhGraph,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Eulerpaden en Eigenschappen'
  },
  instruction: {
    type: String,
    default: 'Kijk naar deze graaf (het "huisje"). Kan je deze tekenen zonder je pen op te heffen en zonder over dezelfde lijn te gaan? Bepaal eerst hoeveel knopen een oneven graad hebben.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGraph }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })
const attemptCount = ref(0)

// --- 3-Level structure with generateLevel() ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateLevel(lvl) {
  // Euler path graph is fixed ("huisje") but we vary questions
  if (lvl === 0) {
    return {
      name: 'Oneven Knopen',
      type: 'euler',
      instruction: 'Kijk naar deze graaf (het "huisje"). Kan je deze tekenen zonder je pen op te heffen en zonder over dezelfde lijn te gaan? Bepaal eerst hoeveel knopen een oneven graad hebben.',
      correctOddNodes: 2,
      correctHasPath: 'Ja',
      successFeedback: 'Perfect! Omdat er exact 2 knopen met een oneven graad zijn, is er een Eulerpad mogelijk.',
      errorFeedbackOdd: 'Tel de graden opnieuw. Hoeveel knopen hebben 1, 3, of 5 verbindingen?',
      errorFeedbackConclusion: 'Het aantal oneven knopen klopt, maar je conclusie is fout. De stelling van Euler zegt dat er een pad is bij 0 of 2 oneven knopen.'
    }
  } else if (lvl === 1) {
    // Vary which node's degree is asked
    const colors = ['roze', 'blauw', 'geel']
    const nodesByColor = [
      { node: 'top', color: 'roze', correct: 2 },
      { node: 'links-midden', color: 'blauw', correct: 4 },
      { node: 'rechtsonder', color: 'geel', correct: 3 }
    ]
    const chosen = nodesByColor[randInt(0, nodesByColor.length - 1)]
    return {
      name: 'Graad Bepalen',
      type: 'single-number',
      instruction: 'Bekijk dezelfde graaf. Wat is de graad van de ' + chosen.color + 'e knoop' + (chosen.node === 'top' ? ' (bovenaan)' : chosen.node === 'links-midden' ? ' (links in het midden)' : ' (rechts onder)') + '? Met hoeveel andere knopen is deze verbonden?',
      correctAnswer: chosen.correct,
      successFeedback: 'Juist! De ' + chosen.color + 'e knoop heeft graad ' + chosen.correct + '.',
      errorFeedback: 'Niet juist. Tel het aantal bogen dat vertrekt vanuit de ' + chosen.color + 'e knoop.'
    }
  } else {
    return {
      name: 'Aantal Bogen',
      type: 'single-number',
      instruction: 'Bekijk dezelfde graaf. Hoeveel bogen (lijnen) bevat deze graaf in totaal? Tel alle verbindingslijnen.',
      correctAnswer: 8,
      successFeedback: 'Helemaal juist! De graaf bevat 8 bogen. Je kan ook de som van alle graden delen door 2: 16/2 = 8.',
      errorFeedback: 'Niet juist. Tel het aantal lijnen &eacute;&eacute;n voor &eacute;&eacute;n. Vergeet de diagonalen en daklijnen niet.'
    }
  }
}

function generateLevels() {
  const arr = []
  for (let i = 0; i < totalInternalLevels; i++) {
    arr.push(generateLevel(i))
  }
  levels.value = arr
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])
const currentInstruction = computed(() => currentLevel.value.instruction || props.instruction)

const userOdd = ref('')
const userHasPath = ref(null)
const userAnswer = ref('')

function getHint() {
  const c = attemptCount.value
  if (currentInternalLevel.value === 0) {
    if (c === 1) return 'Hint: De graad van een knoop is het aantal lijnen dat eraan vastzit. Tel voor elke knoop.'
    if (c === 2) return 'Hint: De topknoop heeft graad 2. De linkse en rechtse middenknopen hebben graad 4. De onderste knopen hebben graad 3. Hoeveel zijn er oneven?'
    return 'Hint: Twee knopen hebben een oneven graad: de twee onderste (graad 3). De andere drie zijn even.'
  }
  if (c === 1) return 'Hint: Tel de bogen die vertrekken uit de gevraagde knoop.'
  if (c === 2) return 'Hint: Kijk in de tekening naar de knoop in kwestie. Volg elke lijn die eruit komt.'
  return 'Hint: Het antwoord is een klein geheel getal. Tel opnieuw vanuit de knoop.'
}

function resetActivityState() {
  generateLevels()
  attemptCount.value = 0
  isCorrect.value = false;
celebrationDone.value = false
  isChecked.value = false;
  feedback.value = { type: 'info', text: '' };
  userOdd.value = '';
  userHasPath.value = null;
  userAnswer.value = '';
}

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
    nextTick(() => mainArea.value?.focus())
  } else {
    goToNextStep()
  }
}

function checkAnswer() {
  isChecked.value = true;
  const level = currentLevel.value;

  if (level.type === 'euler') {
    if (parseInt(userOdd.value) === level.correctOddNodes && userHasPath.value === level.correctHasPath) {
      isCorrect.value = true
      feedback.value = {
        type: 'success',
        text: level.successFeedback
      }
    } else if (parseInt(userOdd.value) !== level.correctOddNodes) {
      attemptCount.value++
      isCorrect.value = false
      feedback.value = {
        type: 'error',
        text: level.errorFeedbackOdd + '<br/><br/>' + getHint()
      }
    } else {
      attemptCount.value++
      isCorrect.value = false
      feedback.value = {
        type: 'error',
        text: level.errorFeedbackConclusion + '<br/><br/>' + getHint()
      }
    }
  } else {
    if (parseInt(userAnswer.value) === level.correctAnswer) {
      isCorrect.value = true
      feedback.value = {
        type: 'success',
        text: level.successFeedback
      }
    } else {
      attemptCount.value++
      isCorrect.value = false
      feedback.value = {
        type: 'error',
        text: level.errorFeedback + '<br/><br/>' + getHint()
      }
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
    currentInternalLevel.value = 0;
    resetActivityState();
    nextTick(() => mainArea.value?.focus())
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-orange-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-500">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <p v-if="totalSteps > 1" class="text-xs text-slate-300">|</p>
              <p class="text-xs font-medium text-indigo-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }} &mdash; {{ currentLevel.name }}</p>
            </div>
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
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="currentInstruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="p-6 mt-6 border-t border-slate-200 bg-slate-50 rounded-xl space-y-6">

              <!-- Level 1: Euler path analysis -->
              <template v-if="currentInternalLevel === 0">
                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700">1. Aantal knopen met ONEVEN graad:</label>
                  <input type="number" v-model="userOdd"
                         class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-orange-500 transition-colors"
                         placeholder="Aantal = ?">
                </div>

                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700">2. Is er een Eulerpad mogelijk?</label>
                  <div class="flex gap-2">
                    <button v-for="opt in ['Ja', 'Nee']" :key="opt"
                            @click="() => { if(!isCorrect) { userHasPath = opt; isChecked = false; } }"
                            class="flex-1 p-3 border-2 rounded-lg font-bold transition-all text-center"
                            :class="userHasPath === opt ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-300 bg-white text-slate-700'">
                      {{ opt }}
                    </button>
                  </div>
                </div>
</template>

              <!-- Level 2: Degree of a node -->
              <template v-else-if="currentInternalLevel === 1">
                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700">Wat is de graad van de gevraagde knoop?</label>
                  <input type="number" v-model="userAnswer"
                         class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-orange-500 transition-colors"
                         placeholder="Graad = ?">
                </div>
</template>

              <!-- Level 3: Edge count -->
              <template v-else>
                <div>
                  <label class="block mb-2 text-sm font-bold text-slate-700">Hoeveel bogen (lijnen) bevat deze graaf?</label>
                  <input type="number" v-model="userAnswer"
                         class="w-full p-3 text-lg font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-lg outline-none focus:border-orange-500 transition-colors"
                         placeholder="Aantal = ?">
                </div>
</template>

            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 role="status" aria-live="polite" aria-atomic="true" :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug" v-html="feedback.text"></span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <!-- Keep Controleer: number inputs + Ja/Nee click -->
              <button v-if="!isCorrect" @click="checkAnswer"
                      :disabled="isChecked && !isCorrect || (currentInternalLevel === 0 ? (!userOdd || !userHasPath) : !userAnswer)"
                      class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50 active:scale-[0.98]">
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

              <div class="relative bg-white rounded-2xl shadow-xl border border-slate-300 w-[400px] h-[400px] flex items-center justify-center">
                <!-- SVG Graph (House) -->
                <svg width="100%" height="100%" viewBox="0 0 200 200">

                  <!-- Edges -->
                  <g stroke="#94a3b8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
                    <!-- Base box -->
                    <line x1="50" y1="150" x2="150" y2="150" /> <!-- Bot -->
                    <line x1="50" y1="150" x2="50" y2="80" />   <!-- Left -->
                    <line x1="150" y1="150" x2="150" y2="80" /> <!-- Right -->
                    <line x1="50" y1="80" x2="150" y2="80" />   <!-- Top of box -->

                    <!-- Diagonals -->
                    <line x1="50" y1="150" x2="150" y2="80" />
                    <line x1="150" y1="150" x2="50" y2="80" />

                    <!-- Roof -->
                    <line x1="50" y1="80" x2="100" y2="30" />
                    <line x1="150" y1="80" x2="100" y2="30" />
                  </g>

                  <!-- Nodes -->
                  <circle cx="100" cy="30" r="12" fill="#ec4899" stroke="#fff" stroke-width="3" />
                  <circle cx="50" cy="80" r="12" fill="#3b82f6" stroke="#fff" stroke-width="3" />
                  <circle cx="150" cy="80" r="12" fill="#3b82f6" stroke="#fff" stroke-width="3" />
                  <circle cx="50" cy="150" r="12" fill="#f59e0b" stroke="#fff" stroke-width="3" />
                  <circle cx="150" cy="150" r="12" fill="#f59e0b" stroke="#fff" stroke-width="3" />

                  <!-- Hover highlights for degrees -->
                  <text x="100" y="20" font-size="10" font-weight="bold" fill="#ec4899" text-anchor="middle" class="opacity-0 hover:opacity-100 transition-opacity">Graad 2</text>
                  <text x="30" y="80" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle" class="opacity-0 hover:opacity-100 transition-opacity">Graad 4</text>
                  <text x="170" y="80" font-size="10" font-weight="bold" fill="#3b82f6" text-anchor="middle" class="opacity-0 hover:opacity-100 transition-opacity">Graad 4</text>
                  <text x="30" y="160" font-size="10" font-weight="bold" fill="#f59e0b" text-anchor="middle" class="opacity-0 hover:opacity-100 transition-opacity">Graad 3</text>
                  <text x="170" y="160" font-size="10" font-weight="bold" fill="#f59e0b" text-anchor="middle" class="opacity-0 hover:opacity-100 transition-opacity">Graad 3</text>

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
