<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhGridFour, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Computationeel Denken: Het Priem-Algoritme' },
  instruction: {
    type: String,
    default: 'Een computer gebruikt algoritmes (stappenplannen) om patronen te vinden, zoals de "Zeef van Eratosthenes" om priemgetallen te filteren.<br/><br/><strong>Opdracht:</strong> Voer het algoritme handmatig uit op de getallen 1 t/m 20.<br/>Stap 1: Streep 1 door (geen priemgetal).<br/>Stap 2: Omcirkel 2 (priemgetal). Streep AL zijn veelvouden door.<br/>Stap 3: Omcirkel 3. Streep AL zijn veelvouden door.<br/>Stap 4: Herhaal tot je klaar bent.'
  },
  currentStep: { type: Number, default: 2 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhGridFour }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op getallen om ze te doorstrepen (1 klik) of te omcirkelen als priemgetal (2 klikken).' })
const attemptCount = ref(0)

// --- Level System ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generatePrimesUpTo(n) {
  const sieve = Array(n + 1).fill(true)
  sieve[0] = false
  sieve[1] = false
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false
      }
    }
  }
  return sieve.reduce((acc, isPrime, idx) => {
    if (isPrime) acc.push(idx)
    return acc
  }, [])
}

function generateLevel() {
  // Level 1: small range (8-12)
  const max1 = 8 + Math.floor(Math.random() * 5) // 8-12
  const primes1 = generatePrimesUpTo(max1)
  // Level 2: medium range (18-24)
  const max2 = 18 + Math.floor(Math.random() * 7) // 18-24
  const primes2 = generatePrimesUpTo(max2)
  // Level 3: larger range (28-34)
  const max3 = 28 + Math.floor(Math.random() * 7) // 28-34
  const primes3 = generatePrimesUpTo(max3)

  return [
    {
      maxNum: max1,
      primes: primes1,
      instruction: `Level 1: Laten we klein beginnen met de getallen 1 t/m ${max1}.<br/><br/><strong>Opdracht:</strong> Voer het algoritme handmatig uit.<br/>Stap 1: Streep 1 door (geen priemgetal).<br/>Stap 2: Omcirkel 2. Streep al zijn veelvouden door.<br/>Stap 3: Omcirkel 3. Streep al zijn veelvouden door.<br/>Stap 4: Herhaal tot je klaar bent.`,
      successFeedback: `Uitstekend! Je hebt alle priemgetallen tot ${max1} gevonden. Klaar voor level 2?`
    },
    {
      maxNum: max2,
      primes: primes2,
      instruction: `Level 2: De getallen 1 t/m ${max2} — uitbreiding van hetzelfde algoritme.<br/><br/><strong>Opdracht:</strong> Voer het algoritme handmatig uit.<br/>Stap 1: Streep 1 door.<br/>Stap 2: Omcirkel 2. Streep zijn veelvouden door.<br/>Stap 3: Omcirkel 3. Streep zijn veelvouden door.<br/>Stap 4: Herhaal tot je klaar bent.`,
      successFeedback: `Magistraal! Je hebt als een computer gewerkt (patroonherkenning en decompositie) en alle priemgetallen onder de ${max2} gevonden.`
    },
    {
      maxNum: max3,
      primes: primes3,
      instruction: `Level 3: De echte uitdaging met getallen 1 t/m ${max3}.<br/><br/><strong>Opdracht:</strong> Voer het algoritme zelfstandig uit.<br/>Let op: er zijn ${primes3.length} priemgetallen om te vinden!`,
      successFeedback: `Fenomenaal! Je beheerst de Zeef van Eratosthenes volledig. Alle ${primes3.length} priemgetallen tot ${max3} gevonden!`
    }
  ]
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const maxNum = computed(() => currentLevelData.value.maxNum)
const primes = computed(() => currentLevelData.value.primes)

// State: 'normal', 'crossed', 'circled'
const numStates = ref([])

function cycleState(index) {
    if (isCorrect.value) return
    const s = numStates.value[index]
    let newState
    if (s === 'normal') newState = 'crossed'
    else if (s === 'crossed') newState = 'circled'
    else newState = 'normal'
    numStates.value[index] = newState

    // Check for auto-correct after state change
    const allCorrect = checkAllCorrect()
    if (allCorrect) {
      isCorrect.value = true
      feedback.value = { type: 'success', text: currentLevelData.value.successFeedback }
    } else {
      // If all numbers have been interacted with but not all correct, it's a mistake
      if (numStates.value.every(s => s !== 'normal')) {
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: 'Niet alle getallen zijn juist. Controleer de priemgetallen en hun veelvouden.' }
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: 'Onthoud: een priemgetal heeft precies 2 delers (1 en zichzelf). Omcirkel die. Streep de rest door.' }
        } else {
          feedback.value = { type: 'error', text: `De priemgetallen tot ${maxNum.value} zijn: ${primes.value.join(', ')}.` }
        }
      }
    }
}

function checkAllCorrect() {
  for (let i = 0; i < numStates.value.length; i++) {
    const num = i + 1
    const state = numStates.value[i]
    const isPrime = primes.value.includes(num)
    if (num === 1 && state !== 'crossed') return false
    if (isPrime && state !== 'circled') return false
    if (!isPrime && num !== 1 && state !== 'crossed') return false
  }
  return true
}

function resetActivityState() {
    levels.value = generateLevel()
    isCorrect.value = false;
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Klik op getallen om ze te doorstrepen (1 klik) of te omcirkelen als priemgetal (2 klikken).' };
    numStates.value = Array(currentLevelData.value.maxNum).fill('normal');
    attemptCount.value = 0;
}

function handleLevelComplete() {
    if (currentInternalLevel.value < totalInternalLevels - 1) {
      currentInternalLevel.value++
      resetActivityState()
    } else {
      goToNextStep()
    }
}

function goToNextStep() {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1);
    else emit('complete');
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
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
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-slate-100">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
    <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-2xl bg-slate-800">

      <header class="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0 shadow-sm z-50">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center p-2 rounded-lg bg-indigo-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <div class="flex items-center gap-3 mt-0.5">
              <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="font-medium">Level {{ currentInternalLevel + 1 }}/{{ totalInternalLevels }}</span>
                <div class="flex items-center gap-1">
                  <span v-for="lvl in totalInternalLevels" :key="lvl"
                        class="w-2 h-2 rounded-full transition-all duration-300"
                        :class="lvl - 1 <= currentInternalLevel ? 'bg-indigo-400' : 'bg-slate-600'">
                  </span>
                </div>
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
          <div class="flex-1 p-6 overflow-y-auto">
            <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">Instructies</h3>
            <MathText :content="currentLevelData.instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />

            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-300 mb-4 uppercase tracking-widest text-xs">Legende:</h4>

               <div class="flex flex-col gap-4 font-mono text-sm">
                   <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded border-2 border-slate-500 bg-slate-700 flex items-center justify-center text-slate-400 font-bold">1</div>
                       <span class="text-slate-400">Nog te controleren (0 kliks)</span>
                   </div>
                   <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded border-2 border-red-500/50 bg-red-900/30 flex items-center justify-center text-slate-600 font-bold relative">
                           <span class="opacity-50">1</span>
                           <div class="absolute inset-0 flex items-center justify-center"><PhX weight="bold" class="text-red-500 w-6 h-6" /></div>
                       </div>
                       <span class="text-red-400">Geen priemgetal (1 klik)</span>
                   </div>
                   <div class="flex items-center gap-3">
                       <div class="w-8 h-8 rounded-full border-4 border-emerald-500 bg-emerald-900/30 flex items-center justify-center text-emerald-400 font-bold">
                           1
                       </div>
                       <span class="text-emerald-400">Priemgetal! (2 kliks)</span>
                   </div>
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>
              <!-- Auto-correct: no check button, grid clicks auto-verify -->
              <button v-if="isCorrect" @click="handleLevelComplete" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3 font-bold text-slate-400 transition-all rounded-lg shadow-md bg-slate-700 text-center select-none text-sm">
                Klik getallen om te markeren
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

              <div class="w-full max-w-3xl flex flex-col items-center">

                  <div class="grid grid-cols-5 gap-4 md:gap-6 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">

                      <button v-for="(state, idx) in numStates" :key="idx"
                              @click="cycleState(idx)" :disabled="isCorrect"
                              class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center font-black text-2xl md:text-3xl transition-all shadow-sm select-none relative focus:outline-none"
                              :class="{
                                  'bg-slate-700 border-2 border-slate-600 text-slate-400 hover:bg-slate-600 rounded-xl': state === 'normal',
                                  'bg-red-900/20 border-2 border-red-500/50 text-slate-600 rounded-xl': state === 'crossed',
                                  'bg-emerald-900/30 border-4 border-emerald-500 text-emerald-400 rounded-full scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)]': state === 'circled'
                              }">

                          <span :class="state === 'crossed' ? 'opacity-30' : ''">{{ idx + 1 }}</span>

                          <!-- Red X overlay for crossed -->
                          <div v-if="state === 'crossed'" class="absolute inset-0 flex items-center justify-center pointer-events-none animate-fadeIn">
                              <PhX weight="bold" class="w-10 h-10 md:w-14 md:h-14 text-red-500" />
                          </div>
                      </button>

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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
</style>