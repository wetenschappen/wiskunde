<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX,
  PhCheckCircle,
  PhWarningCircle,
  PhArrowRight,
  PhListDashes,
  PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Sinus- en Cosinusregel'
  },
  instruction: {
    type: String,
    default: 'Selecteer een meetwaarde links en klik op een "slot" in de formules om hem in te vullen. Kies de regel waarbij exact 1 onbekende overblijft om het op te lossen!'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhListDashes }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const shouldPulse = ref(false)

const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: '' })

// Levels
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const attemptCount = ref(0)
const levels = ref([])

function generateLevel() {
  // Level 1: Z-H-Z → cosinusregel
  const sides1 = [3 + Math.floor(Math.random() * 6), 4 + Math.floor(Math.random() * 8)] // 3-8, 4-11
  const angle1 = 30 + Math.floor(Math.random() * 4) * 15 // 30, 45, 60, 75

  // Level 2: H-H-Z → sinusregel
  const angle2a = 30 + Math.floor(Math.random() * 6) * 10 // 30, 40, 50, 60, 70, 80
  const angle2b = angle2a + 20 + Math.floor(Math.random() * 4) * 10 // at least 30 more
  const side2 = 8 + Math.floor(Math.random() * 10) // 8-17

  // Level 3: Z-Z-Z → cosinusregel
  const sides3 = [
    5 + Math.floor(Math.random() * 5),  // 5-9
    6 + Math.floor(Math.random() * 6),  // 6-11
    7 + Math.floor(Math.random() * 7)   // 7-13
  ]

  levels.value = [
    {
      name: 'Situatie: Z-H-Z',
      targetRule: 'cosinus',
      data: [
        { id: 'd1', type: 'zijde', val: `${sides1[0]}`, label: 'Zijde b' },
        { id: 'd2', type: 'hoek', val: `${angle1}°`, label: `Hoek α` },
        { id: 'd3', type: 'zijde', val: `${sides1[1]}`, label: 'Zijde c' }
      ],
      hints: [
        'Bij Z-H-Z heb je twee zijden en de ingesloten hoek. Welke regel heeft 2 zijden en een hoek?',
        'De cosinusregel gebruikt b, c en α. De sinusregel heeft een overstaand paar nodig.',
        'Vul alle 3 waarden in de COSINUSREGEL. Die heeft b² + c² - 2bc·cos(α).'
      ]
    },
    {
      name: 'Situatie: H-H-Z',
      targetRule: 'sinus',
      data: [
        { id: 'd1', type: 'hoek', val: `${angle2a}°`, label: 'Hoek α' },
        { id: 'd2', type: 'hoek', val: `${angle2b}°`, label: 'Hoek β' },
        { id: 'd3', type: 'zijde', val: `${side2}`, label: 'Zijde a' }
      ],
      hints: [
        'Bij H-H-Z heb je twee hoeken en een zijde. Welke regel gebruikt een overstaand paar?',
        'De sinusregel heeft a/sin(α) = b/sin(β). Je hebt a en α als paar, en β gegeven.',
        'Vul alle 3 waarden in de SINUSREGEL. Die heeft a/sin(α) = b/sin(β).'
      ]
    },
    {
      name: 'Situatie: Z-Z-Z',
      targetRule: 'cosinus',
      data: [
        { id: 'd1', type: 'zijde', val: `${sides3[0]}`, label: 'Zijde a' },
        { id: 'd2', type: 'zijde', val: `${sides3[1]}`, label: 'Zijde b' },
        { id: 'd3', type: 'zijde', val: `${sides3[2]}`, label: 'Zijde c' }
      ],
      hints: [
        'Bij Z-Z-Z heb je alleen zijden. Welke regel werkt zonder hoeken?',
        'De cosinusregel a² = b² + c² - 2bc·cos(α) kan met enkel zijden als je een hoek zoekt.',
        'Vul alle 3 zijden in de COSINUSREGEL. Plaats de onbekende zijde als "a".'
      ]
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Interactive State
const selectedDataId = ref(null)

// Slots for Cosinusregel: a² = b² + c² - 2bc * cos(α)
const cosRuleSlots = ref({
  side_a: null,
  side_b1: null,
  side_c1: null,
  side_b2: null,
  side_c2: null,
  angle_alpha: null
})

// Slots for Sinusregel: a / sin(α) = b / sin(β)
const sinRuleSlots = ref({
  side_a: null,
  angle_alpha: null,
  side_b: null,
  angle_beta: null
})

function selectData(id) {
  if (isCorrect.value) return;
  selectedDataId.value = selectedDataId.value === id ? null : id;
}

function fillSlot(rule, slotKey, expectedType) {
  if (isCorrect.value) return;
  if (!selectedDataId.value) return;

  const dataItem = currentLevelData.value.data.find(d => d.id === selectedDataId.value);

  // Type check!
  if (dataItem.type !== expectedType) {
    feedback.value = { type: 'error', text: `Je probeert een ${dataItem.type} in een veld voor een ${expectedType} te plaatsen!` };
    return;
  }

  // Toewijzen
  if (rule === 'cosinus') {
    cosRuleSlots.value[slotKey] = dataItem;
  } else {
    sinRuleSlots.value[slotKey] = dataItem;
  }

  selectedDataId.value = null;
  feedback.value = { type: 'info', text: 'Voeg nog een waarde toe of wissel van regel.' };

  // Auto-validate: check if all 3 placed in the correct rule
  autoValidate();
}

function countFilledUnique(slotsRef) {
  const filled = Object.values(slotsRef).filter(v => v !== null);
  const uniqueIds = new Set(filled.map(f => f.id));
  return uniqueIds.size;
}

function autoValidate() {
  const cosFilled = countFilledUnique(cosRuleSlots);
  const sinFilled = countFilledUnique(sinRuleSlots);
  const target = currentLevelData.value;

  if (target.targetRule === 'cosinus' && cosFilled === 3) {
    isCorrect.value = true;
    isChecked.value = true;
    feedback.value = { type: 'success', text: 'Fantastisch! Met de cosinusregel blijft er nu exact 1 onbekende over, dus je kan het oplossen.' };
  } else if (target.targetRule === 'sinus' && sinFilled === 3) {
    isCorrect.value = true;
    isChecked.value = true;
    feedback.value = { type: 'success', text: 'Fantastisch! De sinusregel is hier perfect, want je kent een overstaand paar (zijde+hoek) en nog een hoek.' };
  }
}

function resetActivityState() {
  isCorrect.value = false;
  isChecked.value = false;
  attemptCount.value = 0;
  feedback.value = { type: 'info', text: 'Selecteer een waarde en plaats hem in de juiste regel.' };
  selectedDataId.value = null;

  Object.keys(cosRuleSlots.value).forEach(k => cosRuleSlots.value[k] = null);
  Object.keys(sinRuleSlots.value).forEach(k => sinRuleSlots.value[k] = null);
  generateLevel();
}

function checkAnswer() {
  isChecked.value = true;
  attemptCount.value++;

  const cosFilled = countFilledUnique(cosRuleSlots);
  const sinFilled = countFilledUnique(sinRuleSlots);

  if (cosFilled < 3 && sinFilled < 3) {
    const hints = currentLevelData.value.hints
    const hintIdx = Math.min(attemptCount.value - 1, hints.length - 1)
    feedback.value = { type: 'error', text: hints[hintIdx] };
    return;
  }

  const target = currentLevelData.value;
  if (target.targetRule === 'cosinus' && cosFilled === 3) {
    isCorrect.value = true;
    feedback.value = { type: 'success', text: 'Fantastisch! Met de cosinusregel blijft er nu exact 1 onbekende over, dus je kan het oplossen.' };
  } else if (target.targetRule === 'sinus' && sinFilled === 3) {
    isCorrect.value = true;
    feedback.value = { type: 'success', text: 'Fantastisch! De sinusregel is hier perfect, want je kent een overstaand paar (zijde+hoek) en nog een hoek.' };
  } else {
    if (cosFilled === 3) {
      feedback.value = { type: 'error', text: 'Kijk naar de cosinusregel. Heb je niet 2 onbekenden over? Probeer de sinusregel.' };
    } else {
      feedback.value = { type: 'error', text: 'Kijk naar de sinusregel. Je mist nu waarschijnlijk een compleet overstaand paar. Probeer de cosinusregel.' };
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++;
    resetActivityState();
  } else {
    if (props.currentStep < props.totalSteps) {
        emit('update:currentStep', props.currentStep + 1);
    } else {
        emit('complete');
    }
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0;
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
            <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

            <div class="text-center bg-emerald-50 p-4 border border-emerald-200 rounded-xl shadow-sm mb-6">
              <p class="font-bold text-emerald-800">{{ currentLevelData.name }}</p>
            </div>

            <div class="space-y-4">
              <p class="font-bold text-slate-800">Gegeven Meetwaarden:</p>

              <div class="flex flex-col gap-3">
                <button v-for="data in currentLevelData.data" :key="data.id"
                        @click="selectData(data.id)"
                        class="p-4 border-2 rounded-xl text-left font-bold transition-all flex items-center justify-between shadow-sm"
                        :class="selectedDataId === data.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300 bg-white text-slate-700'">
                  <span>{{ data.label }}</span>
                  <span class="font-mono text-xl" :class="data.type === 'zijde' ? 'text-blue-600' : 'text-rose-500'">{{ data.val }}</span>
                </button>
              </div>
            </div>

          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn"
                 :class="{
                   'bg-emerald-100 text-emerald-800': feedback.type === 'success',
                   'bg-red-100 text-red-800': feedback.type === 'error',
                   'bg-blue-100 text-blue-800': feedback.type === 'info',
                 }">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-relaxed">{{ feedback.text }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 shadow-sm">
                 <PhArrowClockwise />
              </button>

              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] animate-fadeIn">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-8 overflow-y-auto gap-8 items-center justify-center pattern-grid">

            <!-- Cosinusregel Box -->
            <div class="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-md p-6">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Cosinusregel</h3>

              <div class="flex items-center justify-center gap-3 text-2xl font-mono font-bold text-slate-700 flex-wrap">
                <!-- a^2 -->
                <button @click="fillSlot('cosinus', 'side_a', 'zijde')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.side_a ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.side_a ? cosRuleSlots.side_a.val : 'a' }}
                </button>
                <span>²</span>
                <span>=</span>
                <!-- b^2 -->
                <button @click="fillSlot('cosinus', 'side_b1', 'zijde')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.side_b1 ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.side_b1 ? cosRuleSlots.side_b1.val : 'b' }}
                </button>
                <span>²</span>
                <span>+</span>
                <!-- c^2 -->
                <button @click="fillSlot('cosinus', 'side_c1', 'zijde')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.side_c1 ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.side_c1 ? cosRuleSlots.side_c1.val : 'c' }}
                </button>
                <span>²</span>
                <span>-</span>
                <span>2</span>
                <span>·</span>
                <!-- b -->
                <button @click="fillSlot('cosinus', 'side_b2', 'zijde')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.side_b2 ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.side_b2 ? cosRuleSlots.side_b2.val : 'b' }}
                </button>
                <span>·</span>
                <!-- c -->
                <button @click="fillSlot('cosinus', 'side_c2', 'zijde')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.side_c2 ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.side_c2 ? cosRuleSlots.side_c2.val : 'c' }}
                </button>
                <span>·</span>
                <span>cos(</span>
                <!-- alpha -->
                <button @click="fillSlot('cosinus', 'angle_alpha', 'hoek')" class="h-14 min-w-[3.5rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="cosRuleSlots.angle_alpha ? 'border-rose-500 bg-rose-50 text-rose-700 border-solid' : (selectedDataId ? 'border-rose-300 hover:bg-rose-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                  {{ cosRuleSlots.angle_alpha ? cosRuleSlots.angle_alpha.val : 'α' }}
                </button>
                <span>)</span>
              </div>
            </div>

            <!-- Sinusregel Box -->
            <div class="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-md p-6">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Sinusregel</h3>

              <div class="flex items-center justify-center gap-6 text-2xl font-mono font-bold text-slate-700 flex-wrap">

                <!-- Left Fraction -->
                <div class="flex flex-col items-center gap-2">
                  <!-- a -->
                  <button @click="fillSlot('sinus', 'side_a', 'zijde')" class="h-12 min-w-[4rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="sinRuleSlots.side_a ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                    {{ sinRuleSlots.side_a ? sinRuleSlots.side_a.val : 'a' }}
                  </button>
                  <div class="w-24 h-1 bg-slate-300 rounded"></div>
                  <!-- sin(alpha) -->
                  <div class="flex items-center gap-1">
                    <span>sin(</span>
                    <button @click="fillSlot('sinus', 'angle_alpha', 'hoek')" class="h-12 min-w-[4rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="sinRuleSlots.angle_alpha ? 'border-rose-500 bg-rose-50 text-rose-700 border-solid' : (selectedDataId ? 'border-rose-300 hover:bg-rose-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                      {{ sinRuleSlots.angle_alpha ? sinRuleSlots.angle_alpha.val : 'α' }}
                    </button>
                    <span>)</span>
                  </div>
                </div>

                <span>=</span>

                <!-- Right Fraction -->
                <div class="flex flex-col items-center gap-2">
                  <!-- b -->
                  <button @click="fillSlot('sinus', 'side_b', 'zijde')" class="h-12 min-w-[4rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="sinRuleSlots.side_b ? 'border-blue-500 bg-blue-50 text-blue-700 border-solid' : (selectedDataId ? 'border-blue-300 hover:bg-blue-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                    {{ sinRuleSlots.side_b ? sinRuleSlots.side_b.val : 'b' }}
                  </button>
                  <div class="w-24 h-1 bg-slate-300 rounded"></div>
                  <!-- sin(beta) -->
                  <div class="flex items-center gap-1">
                    <span>sin(</span>
                    <button @click="fillSlot('sinus', 'angle_beta', 'hoek')" class="h-12 min-w-[4rem] px-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors" :class="sinRuleSlots.angle_beta ? 'border-rose-500 bg-rose-50 text-rose-700 border-solid' : (selectedDataId ? 'border-rose-300 hover:bg-rose-50 cursor-pointer' : 'border-slate-300 text-slate-300')">
                      {{ sinRuleSlots.angle_beta ? sinRuleSlots.angle_beta.val : 'β' }}
                    </button>
                    <span>)</span>
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
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.ring-pulse-amber { animation: ring-pulse-amber 1s cubic-bezier(0.24, 1, 0.32, 1) 3; z-index: 50; }
@keyframes ring-pulse-amber {
    0% { box-shadow: 0 0 0 0 #fbbf24; }
    70% { box-shadow: 0 0 0 20px rgba(251, 191, 36, 0); }
    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
}
</style>