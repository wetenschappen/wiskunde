<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhLightning, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Redeneren: Het Tegenvoorbeeld' },
  instruction: {
    type: String,
    default: 'Een enkele wiskundige bewering is verbroken als je slechts <strong>een tegenvoorbeeld</strong> kan geven. Klik op een getal in het rooster dat de bewering breekt!'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhLightning }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Selecteer een getal uit het rooster.' })
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

const rulePool = [
  {
    rule: '"Alle priemgetallen zijn oneven getallen."',
    hint: 'Zoek een priemgetal dat EVEN is.',
    checkTarget: (num) => {
      const isPrime = (n) => { for(let i=2,s=Math.sqrt(n);i<=s;i++) if(n%i===0) return false; return n>1; }
      return isPrime(num) && num % 2 === 0;
    },
    successMsg: 'BAM! 2 is een priemgetal, maar is EVEN. Regel vernietigd!'
  },
  {
    rule: '"Een veelvoud van 3 is altijd een oneven getal."',
    hint: 'Zoek een getal in de tafel van 3 dat EVEN is.',
    checkTarget: (num) => num % 3 === 0 && num % 2 === 0,
    successMsg: 'BAM! Je hebt een even veelvoud van 3 gevonden (bijv. 6, 12 of 18). Regel verbroken!'
  },
  {
    rule: '"Elk getal deelbaar door 2, is ook deelbaar door 4."',
    hint: 'Zoek een getal dat wel in de tafel van 2 zit, maar NIET in de tafel van 4.',
    checkTarget: (num) => num % 2 === 0 && num % 4 !== 0,
    successMsg: 'BAM! Getallen zoals 2, 6, 10, 14 of 18 zijn even, maar niet deelbaar door 4!'
  },
  {
    rule: '"Elk getal dat eindigt op 5 is deelbaar door 10."',
    hint: 'Zoek een getal dat eindigt op 5 maar niet op 0.',
    checkTarget: (num) => num % 5 === 0 && num % 10 !== 0,
    successMsg: 'BAM! 5, 15 zijn deelbaar door 5 maar niet door 10. Regel verbroken!'
  },
  {
    rule: '"Als een getal groter is dan 10, dan is het ook deelbaar door 2."',
    hint: 'Zoek een getal groter dan 10 dat ONEVEN is.',
    checkTarget: (num) => num > 10 && num % 2 !== 0,
    successMsg: 'BAM! 11, 13, 15, 17 en 19 zijn allemaal groter dan 10, maar oneven. Regel verbroken!'
  }
]

function generateLevel() {
  const chosen = shuffle(rulePool).slice(0, 3)
  return chosen.map((r, i) => ({
    rule: r.rule,
    hint: r.hint,
    checkTarget: r.checkTarget,
    successMsg: r.successMsg
  }))
}

const levels = ref([])
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const numbers = Array.from({length: 20}, (_, i) => i + 1)
const selectedNumber = ref(null)

const ruleShattered = ref(false)

function resetActivityState() {
    levels.value = generateLevel();
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Selecteer een getal uit het rooster.' };
    attemptCount.value = 0;
    selectedNumber.value = null;
    ruleShattered.value = false;
}

function selectNumber(num) {
    if (isCorrect.value) return;
    selectedNumber.value = num;

    if (currentLevelData.value.checkTarget(num)) {
      isCorrect.value = true
      isChecked.value = true
      ruleShattered.value = true
      feedback.value = {
        type: 'success',
        text: currentLevelData.value.successMsg
      }
    } else {
      attemptCount.value++
      isChecked.value = true

      if (attemptCount.value === 1) {
        feedback.value = { type: 'error', text: `${num} breekt de regel NIET. ${currentLevelData.value.hint}`}
      } else if (attemptCount.value === 2) {
        feedback.value = {
          type: 'error',
          text: `${num} is niet het juiste tegenvoorbeeld. Denk aan de definitie: wat zegt de regel precies? Waar zoeken we een uitzondering op?`
        }
      } else {
        feedback.value = {
          type: 'error',
          text: `Bij de regel "${currentLevelData.value.rule}" moet je zoeken naar een getal dat... het TEGENOVERSTELDE bewijst. Probeer de getallen in het rooster een voor een te testen.`
        }
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-slate-800">

      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-math-blue/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-math-blue" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-400">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-math-blue' : 'bg-slate-600'"></div>
              </div>
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="relative p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white" :class="{ 'ring-pulse-amber': shouldPulse }">
          <PhX class="w-6 h-6" />
        </button>
      </header>

      <main class="flex flex-1 overflow-hidden">
        <div class="flex-col hidden w-full max-w-sm bg-slate-800 border-r border-slate-700 shadow-inner md:flex z-10">
          <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

              <!-- The Rule to Shatter -->
              <div class="relative mb-12 w-full max-w-3xl px-4">
                  <h1 class="text-2xl md:text-4xl font-black text-center text-white transition-all duration-700"
                      :class="ruleShattered ? 'opacity-20 scale-110 filter blur-md' : 'opacity-100 scale-100'">
                      {{ currentLevelData.rule }}
                  </h1>

                  <!-- Shatter lines when rule is broken -->
                  <div v-if="ruleShattered" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div class="absolute w-[120%] h-1 bg-math-blue rotate-12 transform scale-150 animate-slash"></div>
                      <div class="absolute w-[120%] h-1 bg-math-blue -rotate-6 transform scale-150 animate-slash" style="animation-delay: 0.1s"></div>
                  </div>
              </div>

              <!-- The Number Grid -->
              <div class="grid grid-cols-5 gap-4 md:gap-4 p-6 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 shadow-md z-10 transition-opacity" :class="ruleShattered ? 'opacity-50 pointer-events-none' : 'opacity-100'">
                  <button v-for="num in numbers" :key="num"
                          @click="selectNumber(num)"
                          class="w-12 h-12 md:w-16 md:h-16 rounded-xl font-bold text-xl md:text-2xl flex items-center justify-center transition-all border-b-4 active:border-b-0 active:translate-y-1"
                          :class="selectedNumber === num ?
                                    (isCorrect ? 'bg-emerald-500 border-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'bg-red-500 border-red-700 text-white animate-shake')
                                    : 'bg-slate-700 border-slate-900 text-slate-200 hover:bg-math-blue hover:text-math-blue hover:border-math-blue'">
                      {{ num }}
                  </button>
              </div>

              <p v-if="ruleShattered" class="mt-8 text-xl font-bold text-math-blue animate-fadeIn text-center">
                  Regel vernietigd door tegenvoorbeeld: {{ selectedNumber }}
              </p>

          </div>
        </div>
      </main>
    </div>
  </div>
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
</template>

<style scoped>
:root { font-family: 'Inter', sans-serif; }

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.animate-slash {
    animation: slash 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes slash {
    0% { transform: scaleX(0); opacity: 1;}
    100% { transform: scaleX(1); opacity: 0.8;}
}
</style>
