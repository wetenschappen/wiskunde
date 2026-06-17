<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhRobot, PhArrowClockwise, PhCaretUp, PhCaretRight, PhCaretDown, PhCaretLeft, PhBackspace
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Computationeel Denken: De Robot Debuggen' },
  instruction: {
    type: String,
    default: 'Een algoritme is een stappenplan. Als er een fout in zit (een "bug"), crasht het programma!<br/><br/><strong>Opdracht:</strong> Schrijf een algoritme (een reeks pijltjes) om de robot naar het groene doel te sturen zonder de rode muren te raken. Klik op "Voer uit" om je code te testen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 2 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhRobot }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Bouw je algoritme met de pijltjesknoppen.' })
const attemptCount = ref(0)

// Level System
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = ref([])

function generateLevel() {
  // Pool of wall layouts per difficulty — all have at least one valid path from (0,0) to (3,3)
  const pool1 = [
    [{x: 1, y: 0}, {x: 1, y: 1}, {x: 3, y: 1}, {x: 2, y: 3}],
    [{x: 0, y: 1}, {x: 2, y: 0}, {x: 3, y: 1}],
    [{x: 1, y: 0}, {x: 2, y: 1}, {x: 1, y: 3}]
  ]
  const pool2 = [
    [{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 2}],
    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 0}],
    [{x: 1, y: 0}, {x: 2, y: 1}, {x: 3, y: 3}]
  ]
  const pool3 = [
    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}],
    [{x: 1, y: 0}, {x: 0, y: 2}, {x: 1, y: 3}, {x: 2, y: 2}],
    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}]
  ]

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  return [
    { name: 'Level 1: Beginner', startX: 0, startY: 0, goalX: 3, goalY: 3, walls: pick(pool1) },
    { name: 'Level 2: Gemiddeld', startX: 0, startY: 0, goalX: 3, goalY: 3, walls: pick(pool2) },
    { name: 'Level 3: Expert', startX: 0, startY: 0, goalX: 3, goalY: 3, walls: pick(pool3) }
  ]
}

const currentLevel = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const gridSize = 4

const robotX = ref(0)
const robotY = ref(0)
const startX = ref(0)
const startY = ref(0)
const goalX = ref(3)
const goalY = ref(3)
const walls = ref([])

// Sync reactive helpers from currentLevel
watch(currentLevel, (lvl) => {
  if (!lvl) return
  startX.value = lvl.startX
  startY.value = lvl.startY
  goalX.value = lvl.goalX
  goalY.value = lvl.goalY
  walls.value = lvl.walls
  robotX.value = lvl.startX
  robotY.value = lvl.startY
}, { immediate: true })

const algorithm = ref([])
const isRunning = ref(false)
const crashStatus = ref(false)

function addCommand(cmd) {
    if (isRunning.value || isCorrect.value || algorithm.value.length >= 10) return
    algorithm.value.push(cmd)
    isChecked.value = false
}

function removeLast() {
    if (isRunning.value || isCorrect.value) return
    algorithm.value.pop()
    isChecked.value = false
}

function hasWall(x, y) {
    return walls.value.some(w => w.x === x && w.y === y)
}

function runAlgorithm() {
    if (algorithm.value.length === 0) {
        feedback.value = { type: 'error', text: 'Je algoritme is leeg! Voeg instructies toe.'}
        return
    }

    isRunning.value = true
    isChecked.value = true
    crashStatus.value = false
    robotX.value = startX.value
    robotY.value = startY.value

    feedback.value = { type: 'info', text: 'Programma wordt uitgevoerd...' }

    let step = 0;

    const interval = setInterval(() => {
        if (step >= algorithm.value.length) {
            clearInterval(interval)
            finishRun()
            return
        }

        const cmd = algorithm.value[step]
        let nx = robotX.value
        let ny = robotY.value

        if (cmd === 'up') ny++
        if (cmd === 'down') ny--
        if (cmd === 'right') nx++
        if (cmd === 'left') nx--

        // Bounds check
        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) {
            crashStatus.value = true
            clearInterval(interval)
            finishRun(true)
            return
        }

        // Wall check
        if (hasWall(nx, ny)) {
            crashStatus.value = true
            clearInterval(interval)
            finishRun(true)
            return
        }

        // Move
        robotX.value = nx
        robotY.value = ny
        step++

    }, 500)
}

function finishRun(crashed = false) {
    isRunning.value = false

    if (crashed) {
        isCorrect.value = false
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: 'BAM! Je robot is gecrasht. Er zit een "bug" in je code. Probeer opnieuw.'}
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: 'Bijna! Kijk goed naar waar de muur staat en pas je route aan.'}
        } else {
          feedback.value = { type: 'error', text: 'De muren staan op vaste plekken. Probeer een andere volgorde van stappen. Het doel is (3,3).'}
        }
    } else if (robotX.value === goalX.value && robotY.value === goalY.value) {
        isCorrect.value = true
        feedback.value = { type: 'success', text: 'Programma succesvol afgerond! Je algoritme is bug-vrij en heeft het doel bereikt.'}
    } else {
        isCorrect.value = false
        attemptCount.value++
        if (attemptCount.value === 1) {
          feedback.value = { type: 'error', text: 'Je programma is gestopt, maar je hebt het doel niet bereikt. Je mist nog instructies.'}
        } else if (attemptCount.value === 2) {
          feedback.value = { type: 'error', text: 'Het doel is op (3,3). Tel je stappen: hoeveel naar rechts en omhoog heb je nodig?'}
        } else {
          feedback.value = { type: 'error', text: 'Doel = (3,3). Je start op (0,0). Je hebt 3 stappen naar rechts en 3 omhoog nodig (minus omwegen om muren).'}
        }
    }
}

function resetActivityState() {
    levels.value = generateLevel()
    isCorrect.value = false;
celebrationDone.value = false
    isChecked.value = false;
    feedback.value = { type: 'info', text: 'Bouw je algoritme met de pijltjesknoppen.' };
    algorithm.value = [];
    isRunning.value = false;
    crashStatus.value = false;
    attemptCount.value = 0;
    // Sync will reset robot position via watch
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

function resetPosition() {
    robotX.value = startX.value
    robotY.value = startY.value
    isChecked.value = false
    crashStatus.value = false
    feedback.value = { type: 'info', text: 'Pas je code aan en probeer opnieuw.' }
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-emerald-500/20">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-100">{{ title }}</h2>
            <p v-if="totalSteps > 1" class="text-xs font-medium text-slate-400">Stap {{ currentStep }} van {{ totalSteps }}</p>
          </div>
          <div class="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-600">
            <span v-for="i in totalInternalLevels" :key="i"
                  class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 leading-none"
                  :class="i - 1 === currentInternalLevel ? 'bg-emerald-500 text-slate-900 scale-110' : i - 1 < currentInternalLevel ? 'bg-emerald-400/50 text-slate-300' : 'bg-slate-700 text-slate-500'">
              {{ i }}
            </span>
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

            <div class="p-4 mt-6 border border-slate-600 bg-slate-700/50 rounded-xl shadow-inner flex flex-col gap-4">

               <label class="block text-sm font-bold text-slate-300">Bouw je Algoritme:</label>

               <div class="grid grid-cols-3 gap-2 w-32 mx-auto">
                   <div></div>
                   <button @click="addCommand('up')" :disabled="isRunning || isCorrect" class="p-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-400 rounded-lg flex items-center justify-center border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all"><PhCaretUp weight="bold" class="w-6 h-6 text-white" /></button>
                   <div></div>

                   <button @click="addCommand('left')" :disabled="isRunning || isCorrect" class="p-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-400 rounded-lg flex items-center justify-center border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all"><PhCaretLeft weight="bold" class="w-6 h-6 text-white" /></button>
                   <button @click="addCommand('down')" :disabled="isRunning || isCorrect" class="p-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-400 rounded-lg flex items-center justify-center border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all"><PhCaretDown weight="bold" class="w-6 h-6 text-white" /></button>
                   <button @click="addCommand('right')" :disabled="isRunning || isCorrect" class="p-2 bg-slate-600 hover:bg-slate-500 active:bg-slate-400 rounded-lg flex items-center justify-center border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 transition-all"><PhCaretRight weight="bold" class="w-6 h-6 text-white" /></button>
               </div>

               <div class="min-h-[60px] bg-slate-900 border-2 border-slate-600 rounded-xl p-4 flex flex-wrap gap-2 items-center">
                   <span v-if="algorithm.length === 0" class="text-slate-500 text-sm italic">Code is leeg...</span>

                   <div v-for="(cmd, idx) in algorithm" :key="idx" class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm animate-fadeIn">
                       <PhCaretUp v-if="cmd==='up'" weight="bold" />
                       <PhCaretDown v-if="cmd==='down'" weight="bold" />
                       <PhCaretLeft v-if="cmd==='left'" weight="bold" />
                       <PhCaretRight v-if="cmd==='right'" weight="bold" />
                   </div>
               </div>

               <button @click="removeLast" :disabled="isRunning || isCorrect || algorithm.length === 0" class="self-end flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors">
                   <PhBackspace weight="fill" /> Wis laatste
               </button>

            </div>
          </div>

          <div class="p-6 bg-slate-900 border-t border-slate-700 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role='status' aria-live='polite' aria-atomic='true' :class="{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success', 'bg-red-900/50 text-red-300 border border-red-800': feedback.type === 'error', 'bg-blue-900/50 text-blue-300 border border-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="resetPosition" :disabled="isRunning" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-400 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-white shadow-sm"><PhArrowClockwise /></button>

              <button v-if="!isCorrect" @click="runAlgorithm" :disabled="isRunning || isCorrect || algorithm.length === 0" class="flex-1 py-4 font-bold tracking-widest uppercase transition-all shadow-md border-b-4 active:border-b-0 active:translate-y-1 rounded-lg" :class="(isRunning || isCorrect || algorithm.length === 0) ? 'bg-slate-600 border-slate-700 text-slate-400' : 'bg-math-blue border-math-blue text-white hover:bg-math-blue'">Voer Uit</button>
              <button v-else @click="nextLevel" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-slate-900 transition-all rounded-lg shadow-md bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-900">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative bg-circuit-pattern">

              <div class="w-full max-w-2xl flex flex-col items-center">

                  <div class="relative bg-slate-800 shadow-md rounded-xl overflow-hidden border-8 border-slate-700 p-2" style="width: 400px; height: 400px;">

                      <!-- Grid Layout -->
                      <div class="absolute inset-2 grid grid-cols-4 grid-rows-4 gap-1 z-0">
                          <template v-for="y in 4" :key="'ry'+y">
                              <template v-for="x in 4" :key="'rx'+x">
                                  <div class="bg-slate-900/50 rounded-lg relative flex items-center justify-center">

                                      <!-- Goal highlight -->
                                      <div v-if="x-1 === goalX && 4-y === goalY" class="absolute inset-1 bg-emerald-500/30 rounded-lg border-2 border-emerald-500 animate-pulse"></div>

                                      <!-- Wall block -->
                                      <div v-if="hasWall(x-1, 4-y)" class="absolute inset-0 bg-red-500/80 border-4 border-red-700 rounded-lg shadow-inner flex items-center justify-center">
                                          <PhX weight="bold" class="w-8 h-8 text-red-900/50" />
                                      </div>

                                  </div>
</template>
</template>
                      </div>

                      <!-- The Robot -->
                      <div class="absolute w-[25%] h-[25%] transition-all duration-500 ease-in-out flex items-center justify-center z-10"
                           :class="crashStatus ? 'animate-shake' : ''"
                           :style="{ left: `${robotX * 25}%`, bottom: `${robotY * 25}%` }">

                           <div class="w-16 h-16 bg-blue-500 border-4 border-white rounded-full shadow-md flex items-center justify-center relative"
                                :class="crashStatus ? 'bg-red-500' : ''">
                               <PhRobot weight="fill" class="w-10 h-10 text-white" />
                               <div v-if="crashStatus" class="absolute inset-0 flex items-center justify-center">
                                   <PhX weight="bold" class="w-12 h-12 text-white" />
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

.bg-circuit-pattern {
    background-color: #0f172a;
    background-image: radial-gradient(#1e293b 1px, transparent 1px);
    background-size: 20px 20px;
}

.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) forwards;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0) rotate(-5deg); }
  20%, 80% { transform: translate3d(4px, 0, 0) rotate(5deg); }
  30%, 50%, 70% { transform: translate3d(-8px, 0, 0) rotate(-10deg); }
  40%, 60% { transform: translate3d(8px, 0, 0) rotate(10deg); }
}
</style>
