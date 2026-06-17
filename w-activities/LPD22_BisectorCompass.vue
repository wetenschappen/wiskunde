<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCompass, PhArrowClockwise
} from '@phosphor-icons/vue'
import MathText from './MathText.vue'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Constructie: De Middelloodlijn' },
  instruction: {
    type: String,
    default: 'Hoe vind je exact het midden én een loodrechte hoek (90°) met ENKEL een passer en een lat zonder maatverdeling?<br/><br/><strong>Opdracht:</strong> Construeer de middelloodlijn van het gegeven lijnstuk. Volg de stappen.'
  },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 1 },
  fullscreen: { type: Boolean, default: true },
  icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])

const shouldPulse = ref(false)
const isCorrect = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de eerste knop om te beginnen.' })
const attemptCount = ref(0)

// Level Logic
const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    // Horizontal segments at different y-positions
    {
      goalText: 'Opdracht 1: Horizontaal Lijnstuk',
      pA: { x: 150, y: 250 }, pB: { x: 450, y: 250 },
      radius: 200,
      intersectTop: { x: 300, y: 117.7 }, intersectBot: { x: 300, y: 382.3 },
      mid: { x: 300, y: 250 }, lineRotation: 0,
      hint1: 'Stel de passer in op een straal die groter is dan de helft van AB.',
      hint2: 'Trek cirkels vanuit A en B met dezelfde straal. Waar snijden ze?',
      hint3: 'De middelloodlijn is de verticale lijn door het midden van AB.'
    },
    {
      goalText: 'Opdracht 2: Langere Horizontaal',
      pA: { x: 100, y: 300 }, pB: { x: 500, y: 300 },
      radius: 250,
      intersectTop: { x: 300, y: 117.7 }, intersectBot: { x: 300, y: 482.3 },
      mid: { x: 300, y: 300 }, lineRotation: 0,
      hint1: 'Kies een straal die duidelijk groter is dan de helft van het lijnstuk.',
      hint2: 'Let op: beide cirkels moeten dezelfde straal hebben!',
      hint3: 'Verbind de twee snijpunten van de cirkels voor de middelloodlijn.'
    },
    {
      goalText: 'Opdracht 3: Verticaal Lijnstuk',
      pA: { x: 300, y: 100 }, pB: { x: 300, y: 400 },
      radius: 200,
      intersectTop: { x: 167.7, y: 250 }, intersectBot: { x: 432.3, y: 250 },
      mid: { x: 300, y: 250 }, lineRotation: 90,
      hint1: 'Deze keer staat het lijnstuk verticaal. Het principe blijft hetzelfde.',
      hint2: 'De snijpunten liggen nu links en rechts van het lijnstuk.',
      hint3: 'Verbind de snijpunten: de middelloodlijn is horizontaal.'
    },
    {
      goalText: 'Opdracht 4: Korte Verticaal',
      pA: { x: 300, y: 150 }, pB: { x: 300, y: 350 },
      radius: 150,
      intersectTop: { x: 200, y: 250 }, intersectBot: { x: 400, y: 250 },
      mid: { x: 300, y: 250 }, lineRotation: 90,
      hint1: 'Een korter lijnstuk, dus een kleinere straal volstaat.',
      hint2: 'De snijpunten liggen dichter bij het lijnstuk dan bij een grotere straal.',
      hint3: 'De middelloodlijn is de horizontale lijn door de snijpunten.'
    },
    {
      goalText: 'Opdracht 5: Schuin Lijnstuk (45°)',
      pA: { x: 150, y: 100 }, pB: { x: 450, y: 400 },
      radius: 250,
      intersectTop: { x: 206.5, y: 343.5 }, intersectBot: { x: 393.5, y: 156.5 },
      mid: { x: 300, y: 250 }, lineRotation: 45,
      hint1: 'Een schuin lijnstuk is niet moeilijker! Zelfde stappen.',
      hint2: 'De snijpunten liggen schuin ten opzichte van het lijnstuk.',
      hint3: 'De middelloodlijn staat altijd loodrecht op het lijnstuk, ook als het schuin is.'
    },
    {
      goalText: 'Opdracht 6: Schuin Lijnstuk (30°)',
      pA: { x: 120, y: 150 }, pB: { x: 480, y: 300 },
      radius: 220,
      mid: { x: 300, y: 225 }, lineRotation: 22,
      intersectTop: { x: 243.7, y: 290 }, intersectBot: { x: 356.3, y: 160 },
      hint1: 'De hoek van het lijnstuk verandert niets aan de constructie.',
      hint2: 'De cirkels worden iets verschoven, maar het principe is hetzelfde.',
      hint3: 'Let op: de middelloodlijn en het lijnstuk zijn altijd loodrecht.'
    }
  ]

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

function getHint() {
  const data = currentLevelData.value
  if (!data) return ''
  if (attemptCount.value >= 3) return data.hint3
  if (attemptCount.value >= 2) return data.hint2
  return data.hint1
}

// Domain Logic
const compassRadiusSet = ref(false)
const circlesDrawn = ref(false)
const lineDrawn = ref(false)

function setRadius() {
    if (isCorrect.value) return;
    compassRadiusSet.value = true
    feedback.value = { type: 'info', text: 'Mooi, we nemen een straal die duidelijk GROTER is dan de helft van het lijnstuk.' }
}

function drawCircles() {
    if (isCorrect.value) return;
    if (!compassRadiusSet.value) {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Stel eerst de passeropening (straal) in! ' + getHint() }
        return
    }
    circlesDrawn.value = true
    feedback.value = { type: 'info', text: 'Kijk! Omdat de twee cirkels exact dezelfde straal hebben, liggen hun twee snijpunten op exact dezelfde afstand van A als van B.' }
}

function drawLine() {
    if (isCorrect.value) return;
    if (!circlesDrawn.value) {
        attemptCount.value++
        feedback.value = { type: 'error', text: 'Je moet eerst de snijpunten zoeken met de passer! ' + getHint() }
        return
    }
    lineDrawn.value = true
    checkAnswer()
}

function resetActivityState() {
    isCorrect.value = false;
    isChecked.value = false;
    attemptCount.value = 0;
    feedback.value = { type: 'info', text: 'Klik op de eerste knop om te beginnen.' };
    compassRadiusSet.value = false;
    circlesDrawn.value = false;
    lineDrawn.value = false;
}

function checkAnswer() {
  isChecked.value = true;

  if (lineDrawn.value) {
    isCorrect.value = true
    attemptCount.value = 0
    feedback.value = {
      type: 'success',
      text: 'Magisch, toch? De verbindingslijn is ALTIJD exact de middelloodlijn, ongeacht hoe het lijnstuk gedraaid staat.'
    }
  }
}

function handleNext() {
  if (currentInternalLevel.value < totalInternalLevels.value - 1) {
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
    levels.value = generateLevel();
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
          <div class="flex items-center justify-center p-2 rounded-lg bg-pink-100">
            <component :is="props.icon" weight="fill" class="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
              <div class="flex gap-1">
                <div v-for="i in totalInternalLevels" :key="i"
                     class="w-2 h-2 rounded-full"
                     :class="i <= currentInternalLevel + 1 ? 'bg-pink-500' : 'bg-slate-200'"></div>
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

            <div class="text-center bg-pink-50 p-4 border border-pink-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
              <p class="font-bold text-pink-800">{{ currentLevelData.goalText }}</p>
            </div>

            <div class="p-4 mt-6 border border-pink-200 bg-pink-50 rounded-xl shadow-inner">
               <h4 class="font-bold text-slate-700 mb-3">Stappenplan:</h4>

               <div class="flex flex-col gap-2">
                   <button @click="setRadius" :disabled="isCorrect || compassRadiusSet" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="compassRadiusSet ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>1. Stel passer in (> helft)</span>
                       <PhCheckCircle v-if="compassRadiusSet" weight="fill" class="text-indigo-500" />
                   </button>
                   <button @click="drawCircles" :disabled="isCorrect || circlesDrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="circlesDrawn ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                       <span>2. Teken cirkel A én B</span>
                       <PhCheckCircle v-if="circlesDrawn" weight="fill" class="text-indigo-500" />
                   </button>
                   <button @click="drawLine" :disabled="isCorrect || lineDrawn" class="py-2 px-4 rounded border-2 font-bold text-left transition-colors flex items-center justify-between" :class="lineDrawn ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700 disabled:opacity-50'">
                       <span>3. Verbind de snijpunten</span>
                       <PhCheckCircle v-if="lineDrawn" weight="fill" class="text-emerald-500" />
                   </button>
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
              <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]">
                <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span>
                <PhArrowRight weight="bold" />
              </button>
              <div v-else class="flex-1 py-3"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">

              <!-- SVG Visualisation -->
              <div class="relative bg-white shadow-xl rounded-2xl overflow-hidden border-2 border-slate-200 p-8" :key="'lvl' + currentInternalLevel">
                  <svg width="600" height="500" viewBox="0 0 600 500">

                      <!-- The Circles -->
                      <g v-if="circlesDrawn">
                          <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.radius" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                          <circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.radius" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" style="animation-delay: 0.3s" />
                          <circle :cx="currentLevelData.intersectTop.x" :cy="currentLevelData.intersectTop.y" r="6" fill="#ef4444" class="animate-fadeIn" style="animation-delay: 0.8s" />
                          <circle :cx="currentLevelData.intersectBot.x" :cy="currentLevelData.intersectBot.y" r="6" fill="#ef4444" class="animate-fadeIn" style="animation-delay: 0.8s" />
                      </g>

                      <!-- The Bisector Line -->
                      <g v-if="lineDrawn" class="animate-fadeIn">
                          <line :x1="currentLevelData.intersectTop.x - (currentLevelData.intersectBot.x - currentLevelData.intersectTop.x)"
                                :y1="currentLevelData.intersectTop.y - (currentLevelData.intersectBot.y - currentLevelData.intersectTop.y)"
                                :x2="currentLevelData.intersectBot.x + (currentLevelData.intersectBot.x - currentLevelData.intersectTop.x)"
                                :y2="currentLevelData.intersectBot.y + (currentLevelData.intersectBot.y - currentLevelData.intersectTop.y)"
                                stroke="#10b981" stroke-width="4" stroke-linecap="round" />

                          <g :transform="`translate(${currentLevelData.mid.x}, ${currentLevelData.mid.y}) rotate(${currentLevelData.lineRotation})`">
                              <polyline points="0,-15 15,-15 15,0" fill="none" stroke="#10b981" stroke-width="3" />
                              <line x1="-70" y1="-10" x2="-70" y2="10" stroke="#1e293b" stroke-width="3" />
                              <line x1="-80" y1="-10" x2="-80" y2="10" stroke="#1e293b" stroke-width="3" />
                              <line x1="70" y1="-10" x2="70" y2="10" stroke="#1e293b" stroke-width="3" />
                              <line x1="80" y1="-10" x2="80" y2="10" stroke="#1e293b" stroke-width="3" />
                          </g>
                      </g>

                      <!-- Compass indication -->
                      <g v-if="compassRadiusSet && !circlesDrawn" class="animate-fadeIn">
                          <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y"
                                :x2="currentLevelData.pA.x + currentLevelData.radius * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)"
                                :y2="currentLevelData.pA.y + currentLevelData.radius * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180)"
                                stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                          <text :x="currentLevelData.pA.x + (currentLevelData.radius/2) * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)"
                                :y="currentLevelData.pA.y + (currentLevelData.radius/2) * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180) - 10"
                                font-weight="bold" fill="#64748b"
                                :transform="`rotate(${currentLevelData.lineRotation - 45} ${currentLevelData.pA.x + (currentLevelData.radius/2) * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)} ${currentLevelData.pA.y + (currentLevelData.radius/2) * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180)})`">
                                R > helft
                          </text>
                      </g>

                      <!-- The Base Segment AB (always visible) -->
                      <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pB.x" :y2="currentLevelData.pB.y" stroke="#1e293b" stroke-width="4" />
                      <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" r="5" fill="#1e293b" />
                      <circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" r="5" fill="#1e293b" />

                      <text :x="currentLevelData.pA.x - 20" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#1e293b">A</text>
                      <text :x="currentLevelData.pB.x + 5" :y="currentLevelData.pB.y + 25" font-weight="bold" fill="#1e293b">B</text>

                  </svg>
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
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
