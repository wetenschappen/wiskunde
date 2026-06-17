<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBalloon, PhArrowClockwise, PhHandGrabbing, PhPlus, PhMinus, PhLightbulb
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Gehele Getallen: De Luchtballon' },
  instruction: {
    type: String,
    default: 'Aftrekken van een negatief getal? Denk aan een luchtballon.<br/><strong>Hete lucht = positief</strong> (stijgt).<br/><strong>Zandzakken = negatief</strong> (daalt).<br/><br/><strong>Opdracht:</strong> Los de wiskundige bewerking op. Gebruik de animatie om te zien wat er met de zandzakken gebeurt.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhBalloon }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de actieknop om de bewerking visueel uit te voeren.' })
const attemptCount = ref(0)

// Level Logic — generated randomly
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const levels = ref([])

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateLevel(levelIndex) {
  let startAlt, weightVal, isAdd, targetAlt, expression, actionBtn, goalText

  if (levelIndex === 0) {
    // Level 1: simple subtract negative -> positive result
    startAlt = randomInt(1, 3)
    const w = randomInt(1, 4)
    weightVal = -w // negative weight
    isAdd = false // remove sandbags
    targetAlt = startAlt + w
    expression = `${startAlt} - (-${w})`
    actionBtn = `Gooi ${w} zandzakken (-${w}) eruit (-)`
    goalText = 'Opdracht 1: Aftrekken van een negatief getal.'
  } else if (levelIndex === 1) {
    // Level 2: add negative -> go down
    startAlt = randomInt(3, 5)
    const w = randomInt(1, 3)
    weightVal = -w
    isAdd = true // add sandbags
    targetAlt = startAlt - w
    expression = `${startAlt} + (-${w})`
    actionBtn = `Voeg ${w} zandzakken (-${w}) toe (+)`
    goalText = 'Opdracht 2: Optellen van een negatief getal.'
  } else {
    // Level 3: start negative or near zero
    startAlt = pick([-2, -1, 0, 1])
    const w = randomInt(2, 4)
    weightVal = -w
    isAdd = pick([true, false])
    if (isAdd) {
      targetAlt = startAlt - w
      expression = `${startAlt} + (-${w})`
      actionBtn = `Voeg ${w} zandzakken (-${w}) toe (+)`
    } else {
      targetAlt = startAlt + w
      expression = `${startAlt} - (-${w})`
      actionBtn = `Gooi ${w} zandzakken (-${w}) eruit (-)`
    }
    goalText = 'Opdracht 3: Starten onder of rond nul.'
  }

  return {
    goalText, expression, startAlt, targetAlt, actionBtn, isAdd, weightVal
  }
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

// Domain Logic
const altitude = ref(0)
const actionDone = ref(false)
const userAns = ref(null)

function getHintText() {
  const d = currentLevelData.value
  if (attemptCount.value === 1) {
    return 'Denk aan de ballon. Positief = hete lucht (stijgt). Negatief = zandzakken (daalt). Wat gebeurt er met de hoogte?'
  }
  if (attemptCount.value === 2) {
    if (d.isAdd) {
      return `We voegen zandzakken TOE. De ballon wordt zwaarder. Wat doet de hoogte? ${d.startAlt} - ${Math.abs(d.weightVal)}?`
    } else {
      return `We gooien zandzakken WEG. De ballon wordt lichter. Wat doet de hoogte? ${d.startAlt} + ${Math.abs(d.weightVal)}?`
    }
  }
  return `Druk op de actieknop, kijk naar de hoogtemeter, en lees de nieuwe hoogte af. Het antwoord is ${d.targetAlt}.`
}

function performAction() {
    if (actionDone.value || isCorrect.value) return
    actionDone.value = true
    setTimeout(() => {
        altitude.value = currentLevelData.value.targetAlt
    }, 1000)
}

function resetActivityState() {
  const newLevels = []
  for (let i = 0; i < totalInternalLevels; i++) {
    newLevels.push(generateLevel(i))
  }
  levels.value = newLevels

  isCorrect.value = false
  isChecked.value = false
  feedback.value = { type: 'info', text: 'Klik op de actieknop om de bewerking visueel uit te voeren.' }
  attemptCount.value = 0
  altitude.value = currentLevelData.value.startAlt
  actionDone.value = false
  userAns.value = null
}

function checkAnswer() {
  isChecked.value = true

  if (userAns.value === null || userAns.value === undefined || userAns.value === '') {
    feedback.value = { type: 'error', text: 'Vul eerst een getal in voordat je controleert.' }
    return
  }

  const d = currentLevelData.value

  if (userAns.value === d.targetAlt) {
    isCorrect.value = true
    feedback.value = {
      type: 'success',
      text: 'Perfect! De visuele bewerking klopt exact met de nieuwe hoogte.'
    }
  } else {
    attemptCount.value++

    if (userAns.value === d.startAlt + Math.abs(d.weightVal) && d.isAdd) {
      feedback.value = { type: 'error', text: 'Je hebt de zandzakken erbij opgeteld (hoogte gestegen), maar we VOEGEN zandzakken TOE, dus de ballon wordt zwaarder en daalt!' }
    } else if (userAns.value === d.startAlt - Math.abs(d.weightVal) && !d.isAdd) {
      feedback.value = { type: 'error', text: 'Je bent gedaald in hoogte, maar we HALEN zandzakken WEG (-), dus de ballon wordt lichter en stijgt!' }
    } else {
      feedback.value = { type: 'error', text: 'Kijk naar de meter van de ballon in de lucht. Op welke hoogte stopt hij?' }
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()
  } else {
    if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1)
    else emit('complete')
  }
}

// Lifecycle
watch(() => props.isOpen, (val) => {
  if (val) {
    currentInternalLevel.value = 0
    resetActivityState()
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-rose-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-rose-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-rose-50 p-4 border border-rose-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-rose-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-rose-200 bg-rose-50 rounded-xl shadow-inner">
               <label class="block text-sm font-bold text-slate-700 mb-2">Berekening:</label>
               <div class="flex items-center gap-2 mb-4">
                   <div class="flex-1 font-mono font-black text-2xl text-slate-800 text-center bg-white p-3 rounded-lg border border-slate-300">
                       {{ currentLevelData.expression }}
                   </div>
               </div>

               <label class="block text-sm font-bold text-slate-700 mb-2">Jouw antwoord (hoogte):</label>
               <div class="flex items-center gap-2">
                   <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                          class="w-full font-bold text-lg p-3 border border-slate-300 rounded-lg focus:border-rose-500 focus:ring-rose-500" />
               </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
            <div v-if="feedback.text" class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
               <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ feedback.text }}</span>
            </div>

            <!-- Progressive hint -->
            <div v-if="!isCorrect && attemptCount > 0"
                 class="flex items-start gap-3 p-3 mb-4 text-sm font-medium rounded-lg animate-fadeIn bg-amber-50 text-amber-800 border border-amber-200">
               <PhLightbulb class="w-5 h-5 shrink-0 mt-0.5" weight="fill" />
               <span class="leading-snug">{{ getHintText() }}</span>
            </div>

            <div class="flex items-center gap-3">
              <button @click="resetActivityState" class="p-3 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
              <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 active:scale-[0.98]">Controleer</button>
              <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <div class="w-full max-w-lg h-[500px] flex items-center justify-center relative">

                  <!-- Controls -->
                  <div class="absolute top-0 right-0 bg-white p-4 rounded-xl shadow-md border border-slate-200 z-30">
                      <button @click="performAction" :disabled="actionDone || isCorrect"
                              class="flex items-center gap-2 px-4 py-2 font-bold rounded-lg text-white transition-all shadow-sm active:scale-95"
                              :class="actionDone || isCorrect ? 'bg-slate-300' : 'bg-rose-500 hover:bg-rose-600'">
                          <PhHandGrabbing v-if="!currentLevelData.isAdd" weight="fill" />
                          <PhPlus v-if="currentLevelData.isAdd" weight="bold" />
                          {{ currentLevelData.actionBtn }}
                      </button>
                  </div>

                  <!-- The Sky background -->
                  <div class="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-50 rounded-3xl overflow-hidden border-2 border-slate-300">
                      <div class="absolute bottom-0 w-full h-[30%] bg-gradient-to-b from-amber-100 to-amber-700 opacity-50"></div>

                      <!-- Altitude Ruler -->
                      <div class="absolute left-0 top-0 bottom-0 w-24 bg-white/60 border-r border-slate-300 flex flex-col justify-between py-10">
                          <div v-for="i in 11" :key="i" class="flex items-center gap-2 px-2 w-full"
                               :class="10 - (i-1) === 0 ? 'bg-slate-300' : ''">
                              <span class="font-mono font-bold text-sm text-slate-500 w-4 text-right">{{ 10 - (i-1) - 4 }}</span>
                              <div class="h-px bg-slate-400 flex-1"></div>
                          </div>
                      </div>

                      <!-- The Balloon -->
                      <div class="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out flex flex-col items-center"
                           :style="{ top: `${100 - ((altitude + 4) * 10)}%` }">

                          <!-- Balloon Envelope -->
                          <div class="w-24 h-28 bg-rose-500 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-inner border-2 border-rose-700 relative overflow-hidden">
                              <div class="absolute inset-x-0 top-1/3 h-4 bg-yellow-400"></div>
                              <div class="absolute inset-x-0 top-2/3 h-4 bg-yellow-400"></div>
                          </div>

                          <!-- Ropes -->
                          <div class="w-12 h-6 border-x-2 border-slate-700 mx-auto"></div>

                          <!-- Basket -->
                          <div class="w-16 h-12 bg-amber-700 rounded-b shadow-md border-2 border-amber-900 relative">
                              <!-- Sandbags (The negative number) -->
                              <div class="absolute -right-2 top-2 w-6 h-8 bg-stone-300 rounded-[50%_50%_40%_40%] border border-stone-500 flex items-center justify-center transition-all duration-1000 origin-top z-10"
                                   :class="actionDone && !currentLevelData.isAdd ? 'translate-y-[400px] rotate-45 opacity-0' : (actionDone && currentLevelData.isAdd ? 'scale-125' : '')">
                                  <span class="text-[8px] font-bold text-stone-700">{{ currentLevelData.weightVal }}</span>
                              </div>
                              <div class="absolute top-1 right-0 w-2 h-2 bg-stone-500 rounded-full" :class="actionDone && !currentLevelData.isAdd ? 'hidden' : ''"></div>
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
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>