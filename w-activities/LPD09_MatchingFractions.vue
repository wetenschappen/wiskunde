<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLink, PhArrowClockwise, PhCaretUp, PhCaretDown, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Vormen Omzetten: De Slotmachine' },
  instruction: {
    type: String,
    default: 'Breuken, decimalen en procenten horen bij elkaar.<br/><br/><strong>Opdracht:</strong> Draai aan de wielen (pijltjes omhoog/omlaag) totdat elke rij horizontaal een perfecte match vormt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  icon: { type: Object, default: () => PhLink }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const mainArea = ref(null)

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de pijltjes boven en onder de kolommen om ze te draaien.' })
const attemptCount = ref(0)
const hintCount = ref(0)
const showWhy = ref(false)
const whyText = ref("")
const errorDetected = ref("")

// Phases: 'predict' → 'match'
const phase = ref('predict')
const predictionValue = ref(null)
const showWorkedExample = ref(true)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levelLabels = ['Toepassen', 'Analyseren', 'Evalueren']

function generateLevels() {
  const pools = [
    {
      col1: [ { id: 'A', val: '1/2' }, { id: 'B', val: '1/4' }, { id: 'C', val: '3/4' } ],
      col2: [ { id: 'B', val: '0.25' }, { id: 'C', val: '0.75' }, { id: 'A', val: '0.50' } ],
      col3: [ { id: 'C', val: '75%' }, { id: 'A', val: '50%' }, { id: 'B', val: '25%' } ],
      hintLevels: [
        'Breuken omzetten naar decimalen: deel de teller door de noemer. 1/2 = 0,5. 1/4 = 0,25. 3/4 = 0,75.',
        'Stel dat 1/4 = 0,25 = 25% en 1/2 = 0,5 = 50%. Welke breuk hoort bij 0,75? Juist, 3/4 = 75%. Nu bij jou: wat hoort waar?',
        'Rij 1: 1/2 = 0,__ = 50%. Rij 2: 1/4 = 0,25 = __%. Rij 3: 3/4 = __ = 75%.'
      ],
      prediction: '1/4',
      predictionDecimal: '0.25'
    },
    {
      col1: [ { id: 'A', val: '1/5' }, { id: 'B', val: '2/5' }, { id: 'C', val: '4/5' } ],
      col2: [ { id: 'C', val: '0.80' }, { id: 'A', val: '0.20' }, { id: 'B', val: '0.40' } ],
      col3: [ { id: 'B', val: '40%' }, { id: 'C', val: '80%' }, { id: 'A', val: '20%' } ],
      hintLevels: [
        'Bij vijfden: deel de teller door 5. 1/5 = 0,2. 2/5 = 0,4. 4/5 = 0,8.',
        'Stel dat 1/5 = 0,20 = 20% en 3/5 = 0,60 = 60%. Nu bij jou: wat is 2/5 en 4/5?',
        'Rij 1: 1/5 = 0,__ = 20%. Rij 2: 2/5 = 0,40 = __%. Rij 3: 4/5 = __ = 80%.'
      ],
      prediction: '2/5',
      predictionDecimal: '0.40'
    },
    {
      col1: [ { id: 'A', val: '1/3' }, { id: 'B', val: '2/3' }, { id: 'C', val: '1/8' } ],
      col2: [ { id: 'B', val: '0.67' }, { id: 'C', val: '0.125' }, { id: 'A', val: '0.33' } ],
      col3: [ { id: 'C', val: '12.5%' }, { id: 'A', val: '33.3%' }, { id: 'B', val: '66.7%' } ],
      hintLevels: [
        '1/3 = 0,33... en 2/3 = 0,67... (afgerond). 1/8 = 0,125 want 1 : 8 = 0,125.',
        'Stel: 1/4 = 0,25. 1/8 is de helft van 1/4, dus 1/8 = 0,125 = 12,5%. Nu bij jou: wat is 1/3 en 2/3?',
        'Rij 1: 1/3 = 0,__ = 33,3%. Rij 2: 2/3 = 0,67 = __%. Rij 3: 1/8 = __ = 12,5%.'
      ],
      prediction: '1/8',
      predictionDecimal: '0.125'
    }
  ]

  const shuffled = [...pools].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map((p, i) => ({
    goalText: i === 0 ? 'Opdracht 1: Bekende breuken' : i === 1 ? 'Opdracht 2: Vijfden' : 'Opdracht 3: Speciale breuken',
    col1: p.col1,
    col2Start: p.col2,
    col3Start: p.col3,
    hintLevels: p.hintLevels,
    prediction: p.prediction,
    predictionDecimal: p.predictionDecimal
  }))
}

const levels = ref(generateLevels())
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Active Columns State
const col1 = ref([])
const col2 = ref([])
const col3 = ref([])

function shiftUp(colRef) {
    if (isCorrect.value) return;
    const first = colRef.value.shift()
    colRef.value.push(first)
    isChecked.value = false;
}

function shiftDown(colRef) {
    if (isCorrect.value) return;
    const last = colRef.value.pop()
    colRef.value.unshift(last)
    isChecked.value = false;
}

function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}

function submitPrediction() {
  if (predictionValue.value === null || predictionValue.value === '') return
  phase.value = 'match'
  feedback.value = { type: 'info', text: `Je antwoord: ${predictionValue.value}. Draai nu aan de wielen om alle matches te vinden.` }
}

function resetActivityState() {
    isCorrect.value = false;
    showWhy.value = false
    whyText.value = ""
    errorDetected.value = ""
    celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op de pijltjes boven en onder de kolommen om ze te draaien.' };
    attemptCount.value = 0;
    hintCount.value = 0;
    predictionValue.value = null;
    phase.value = 'predict';
    showWorkedExample.value = true;
    levels.value = generateLevels();

    const data = currentLevelData.value
    col1.value = data.col1.map(item => ({ ...item }))
    col2.value = data.col2Start.map(item => ({ ...item }))
    col3.value = data.col3Start.map(item => ({ ...item }))
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++

  let allMatch = true;
  let errorRow = -1;

  for (let i = 0; i < 3; i++) {
      if (col1.value[i].id !== col2.value[i].id || col1.value[i].id !== col3.value[i].id) {
          allMatch = false;
          errorRow = i;
          break;
      }
  }

  if (allMatch) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Prima! Jackpot! Je hebt alle representaties correct aan elkaar gekoppeld.'
    }
  } else {
    isCorrect.value = false

    const rowFrac = col1.value[errorRow].val
    const rowDec = col2.value[errorRow].val
    const rowPct = col3.value[errorRow].val

    // Error analysis: 1/4 = 0.25 confused with 0.4
    if (rowFrac === '1/4' && rowDec === '0.40') {
      feedback.value = {
        type: 'error',
        text: 'Let op! 1/4 is niet 0,4. 1/4 = 1 : 4 = 0,25. Het getal 0,4 is 4/10 = 2/5 = 40%. Verwar tienden niet met vierden!'
      }
    } else if (rowFrac === '1/5' && rowDec === '0.25') {
      feedback.value = {
        type: 'error',
        text: '1/5 = 0,20 = 20%, niet 0,25. 0,25 = 1/4. Je verwart vijfden met vierden.'
      }
    } else if (attemptCount.value === 1) {
      feedback.value = { type: 'error', text: 'Niet helemaal... Kijk naar de rij met breuk ' + rowFrac + '. De combinatie (' + rowDec + ', ' + rowPct + ') klopt niet. Welke decimaal en procent horen bij ' + rowFrac + '?' }
    } else if (attemptCount.value === 2) {
      feedback.value = { type: 'error', text: currentLevelData.value.hintLevels[0] }
    } else if (attemptCount.value === 3) {
      feedback.value = { type: 'error', text: currentLevelData.value.hintLevels[1] }
    } else {
      const matchA = col1.value[0].id
      const matchB = col1.value[1].id
      const matchC = col1.value[2].id
      feedback.value = { type: 'error', text: 'Niet helemaal... De juiste stand is: rij 1 = ' + matchA + ', rij 2 = ' + matchB + ', rij 3 = ' + matchC + '. Verschuif de kolommen tot ze overeenkomen.' }
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
    nextTick(() => { shouldPulse.value = true; setTimeout(() => { shouldPulse.value = false }, 3000) })
  } else {
    window.removeEventListener('keydown', handleKeydown)
    shouldPulse.value = false
  }
}, { immediate: true })

function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
        <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-amber-50 p-4 border border-slate-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-amber-700">{{ currentLevelData.goalText }}</p>
            </div>

            <!-- Worked Example -->
            <div v-if="showWorkedExample" class="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
              <h4 class="flex items-center gap-2 text-sm font-bold text-amber-800 mb-2">
                <PhLightbulb weight="fill" class="w-4 h-4" />
                Voorbeeld: 1/2 omzetten
              </h4>
              <ol class="text-sm text-slate-700 space-y-1 ml-4 list-decimal">
                <li>Een breuk omzetten naar een decimaal getal: <strong>deel de teller door de noemer</strong>.</li>
                <li>1/2 = 1 : 2 = <strong>0,50</strong>.</li>
                <li>Van decimaal naar procent: <strong>x 100</strong>. 0,50 x 100 = <strong>50%</strong>.</li>
              </ol>
              <p class="mt-2 text-sm text-slate-600">Dus: 1/2 = 0,50 = 50%.</p>
            </div>

            <!-- Prediction Phase -->
            <div v-if="phase === 'predict'" class="p-4 mt-2 border border-amber-200 bg-amber-50 rounded-xl shadow-inner animate-fadeIn">
               <label class="block text-sm font-bold text-slate-700 mb-2">Schat: wat is {{ currentLevelData.prediction }} als decimaal getal?</label>
               <div class="flex items-center gap-2">
                   <input type="text" v-model="predictionValue" placeholder="Bijv. 0,50"
                          class="w-full font-bold text-lg p-2 border border-amber-300 rounded-lg focus:border-amber-500 focus:ring-amber-500 text-center" />
               </div>
            </div>

            <!-- Match Phase: tips and info -->
            <div v-if="phase === 'match'" class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner animate-fadeIn">
               <h4 class="font-bold text-slate-700 mb-2">Tip</h4>
               <p class="text-sm text-slate-500">Als je een match hebt gevonden in een rij, controleer dan of de andere rijen ook kloppen!</p>
               <div v-if="predictionValue !== null && isChecked && !isCorrect" class="mt-3 text-xs text-slate-500">
                 Jouw antwoord: {{ predictionValue }}
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true"
                 :class="{'bg-amber-100 text-amber-800': feedback.type === 'success', 'bg-slate-100 text-slate-700': feedback.type === 'error', 'bg-slate-100 text-slate-600': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhArrowClockwise /></button>

              <!-- Prediction: submit -->
              <button v-if="phase === 'predict'" @click="submitPrediction" :disabled="predictionValue === null || predictionValue === ''"
                      class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                Bevestig en begin
              </button>

              <!-- Match: check or hint -->
              <template v-if="phase === 'match'">
                <button v-if="!isCorrect" @click="checkAnswer"
                        class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  Trek aan hendel
                </button>
                <button v-if="!isCorrect" @click="showHint"
                        class="py-4 px-4 text-lg font-medium transition-colors rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                  <PhLightbulb weight="fill" class="w-5 h-5" />
                </button>
              </template>

              <!-- Next after correct -->
              <button v-if="isCorrect" @click="handleNext"
                      class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-amber-600 hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- Prediction overlay -->
              <div v-if="phase === 'predict'" class="flex flex-col items-center justify-center p-8">
                <div class="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-amber-200 shadow-lg">
                  <PhLink weight="duotone" class="w-16 h-16 text-amber-500 mx-auto mb-3" />
                  <h3 class="text-xl font-bold text-slate-800 mb-2">Wat weet je al?</h3>
                  <p class="text-slate-600">Schat eerst het antwoord,<br>daarna kan je de wielen draaien.</p>
                </div>
              </div>

              <!-- Slot machine grid -->
              <div v-if="phase === 'match'" class="bg-slate-800 p-8 rounded-xl shadow-md border-b-8 border-slate-900 flex gap-6 relative">

                  <div class="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-32 bg-slate-700 rounded-l-lg border-y-4 border-slate-900"></div>

                  <div class="flex flex-col gap-2 relative">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Breuk</div>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2">
                          <div v-for="item in col1" :key="item.id" class="w-32 h-20 bg-slate-100 rounded-lg flex items-center justify-center font-black text-3xl text-slate-800 border-2 border-slate-300">
                              {{ item.val }}
                          </div>
                      </div>
                  </div>

                  <div class="flex flex-col gap-2 relative group">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Decimaal</div>
                      <button @click="shiftDown(col2)" :disabled="isCorrect" class="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 hover:text-amber-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhCaretUp weight="fill" class="w-8 h-8" /></button>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2 relative overflow-hidden">
                          <transition-group name="spin">
                              <div v-for="item in col2" :key="item.val" class="w-32 h-20 bg-amber-50 rounded-lg flex items-center justify-center font-black text-3xl text-amber-700 border-2 border-amber-200">
                                  {{ item.val }}
                              </div>
                          </transition-group>
                      </div>

                      <button @click="shiftUp(col2)" :disabled="isCorrect" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-amber-400 hover:text-amber-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhCaretDown weight="fill" class="w-8 h-8" /></button>
                  </div>

                  <div class="flex flex-col gap-2 relative group">
                      <div class="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">Procent</div>
                      <button @click="shiftDown(col3)" :disabled="isCorrect" class="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhCaretUp weight="fill" class="w-8 h-8" /></button>

                      <div class="bg-white p-2 rounded-xl shadow-inner border-[6px] border-slate-600 flex flex-col gap-2 relative overflow-hidden">
                          <transition-group name="spin">
                              <div v-for="item in col3" :key="item.val" class="w-32 h-20 bg-slate-200 rounded-lg flex items-center justify-center font-black text-3xl text-slate-700 border-2 border-slate-300">
                                  {{ item.val }}
                              </div>
                          </transition-group>
                      </div>

                      <button @click="shiftUp(col3)" :disabled="isCorrect" class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"><PhCaretDown weight="fill" class="w-8 h-8" /></button>
                  </div>

                  <div v-if="isCorrect" class="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center gap-[4.5rem] pt-8 px-6">
                      <div class="w-full h-2 bg-amber-400/80 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse"></div>
                      <div class="w-full h-2 bg-amber-400/80 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse"></div>
                      <div class="w-full h-2 bg-amber-400/80 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse"></div>
                  </div>

              </div>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone && phase === 'match'" @done="celebrationDone = true" :is-level-complete="typeof currentInternalLevel !== 'undefined' ? currentInternalLevel === totalInternalLevels - 1 : true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.spin-move,
.spin-enter-active,
.spin-leave-active {
  transition: all 0.3s ease;
}
.spin-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.spin-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.spin-leave-active {
  position: absolute;
}
</style>
