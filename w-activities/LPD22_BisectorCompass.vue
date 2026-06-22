<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCompass, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Constructie: De Middelloodlijn' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhCompass }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de eerste knop om te beginnen.' })
const attemptCount = ref(0)
const showWorkedExample = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const lpdConfirmed = ref(false)

const currentInternalLevel = ref(0)
const totalInternalLevels = ref(3)
const levels = ref([])

function generateLevel() {
  const pool = [
    { goalText: 'Opdracht 1: Horizontaal Lijnstuk', pA: { x: 150, y: 250 }, pB: { x: 450, y: 250 }, radius: 200, intersectTop: { x: 300, y: 117.7 }, intersectBot: { x: 300, y: 382.3 }, mid: { x: 300, y: 250 }, lineRotation: 0, hint1: 'Stel de passer in op een straal groter dan de helft van AB.', hint2: 'Trek cirkels vanuit A en B met dezelfde straal.', hint3: 'De middelloodlijn is de... (vul aan)' },
    { goalText: 'Opdracht 2: Langere Horizontaal', pA: { x: 100, y: 300 }, pB: { x: 500, y: 300 }, radius: 250, intersectTop: { x: 300, y: 117.7 }, intersectBot: { x: 300, y: 482.3 }, mid: { x: 300, y: 300 }, lineRotation: 0, hint1: 'Kies een straal die groter is dan de helft.', hint2: 'Beide cirkels moeten exact dezelfde straal hebben.', hint3: 'Verbind de twee ... van de cirkels voor de middelloodlijn.' },
    { goalText: 'Opdracht 3: Verticaal Lijnstuk', pA: { x: 300, y: 100 }, pB: { x: 300, y: 400 }, radius: 200, intersectTop: { x: 167.7, y: 250 }, intersectBot: { x: 432.3, y: 250 }, mid: { x: 300, y: 250 }, lineRotation: 90, hint1: 'Het lijnstuk staat verticaal, maar het principe blijft hetzelfde.', hint2: 'De snijpunten liggen links en rechts van het lijnstuk.', hint3: 'Verbind de snijpunten: de middelloodlijn is ... (welke richting?)' }
  ]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
function getHint() { const d = currentLevelData.value; if (!d) return ''; if (attemptCount.value >= 3) return d.hint3; if (attemptCount.value >= 2) return d.hint2; return d.hint1 }

const compassRadiusSet = ref(false)
const circlesDrawn = ref(false)
const lineDrawn = ref(false)

function setRadius() { if (isCorrect.value) return; compassRadiusSet.value = true; feedback.value = { type: 'info', text: 'Mooi! Straal groter dan de helft van AB.' } }
function drawCircles() { if (isCorrect.value) return; if (!compassRadiusSet.value) { attemptCount.value++; feedback.value = { type: 'error', text: 'Stel eerst de passer in! ' + getHint() }; return }; circlesDrawn.value = true; feedback.value = { type: 'info', text: 'Kijk! De snijpunten liggen op exact dezelfde afstand van A als van B.' } }
function drawLine() { if (isCorrect.value) return; if (!circlesDrawn.value) { attemptCount.value++; feedback.value = { type: 'error', text: 'Eerst de snijpunten zoeken! ' + getHint() }; return }; lineDrawn.value = true; isCorrect.value = true; attemptCount.value = 0; feedback.value = { type: 'success', text: 'Prima! De lijn door de twee snijpunten is altijd exact de middelloodlijn. Een middelloodlijn staat loodrecht op een lijnstuk en gaat door het midden ervan. Alle punten op deze lijn liggen even ver van A als van B.' } }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; attemptCount.value = 0; feedback.value = { type: 'info', text: 'Klik op de eerste knop om te beginnen.' }; compassRadiusSet.value = false; circlesDrawn.value = false; lineDrawn.value = false; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function handleNext() { if (currentInternalLevel.value < totalInternalLevels.value - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; levels.value = generateLevel(); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
function handleKeydown(e) { if (e.key === 'Escape' && props.isOpen) emit('close') }
onMounted(() => document.addEventListener('fullscreenchange', () => {}))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
<div v-if="isOpen" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800">
  <div class="absolute inset-0 bg-slate-900/10" @click="emit('close')" role="button" tabindex="0" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')" aria-label="Sluiten"></div>
  <div class="relative flex flex-col w-screen h-screen overflow-hidden shadow-md bg-white">
    <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center p-2 rounded-lg bg-amber-100">
          <component :is="props.icon" weight="fill" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
            <div class="flex gap-1"><div v-for="i in totalInternalLevels" :key="i" class="w-2 h-2 rounded-full" :class="i <= currentInternalLevel + 1 ? 'bg-amber-500' : 'bg-slate-200'"></div></div>
          </div>
        </div>
      </div>
      <button @click="emit('close')" class="relative p-2 text-slate-500 transition-colors rounded-full hover:bg-slate-100"><PhX class="w-6 h-6" /></button>
    </header>
    <main class="flex flex-1 overflow-hidden">
      <div class="flex-col hidden w-full max-w-sm bg-white border-r border-slate-200 shadow-inner-light md:flex z-10">
        <div ref="mainArea" tabindex="-1" class="flex-1 p-6 overflow-y-auto">
          <h3 class="mb-2 text-sm font-bold tracking-wider text-slate-500 uppercase">Instructies</h3>
          <MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />

          <!-- Worked Example -->
          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Middelloodlijn construeren
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Zet de passer in punt A. Kies een straal die groter is dan de helft van AB. Trek een cirkel.</p>
              <p><strong>Stap 2:</strong> Zet de passer in punt B met <strong>exact dezelfde straal</strong>. Trek een cirkel.</p>
              <p><strong>Stap 3:</strong> De twee cirkels snijden elkaar in twee punten. Verbind die punten met een rechte lijn.</p>
              <p class="font-bold text-indigo-600">Resultaat: de lijn staat loodrecht op AB en gaat door het midden.</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <h4 class="font-bold text-slate-700 mb-3">Stappenplan:</h4>
            <div class="flex flex-col gap-2">
              <button @click="setRadius" :disabled="isCorrect || compassRadiusSet" class="py-2 px-4 rounded-lg border-2 font-bold text-left flex items-center justify-between" :class="compassRadiusSet ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                <span>1. Stel passer in (> helft)</span><PhCheckCircle v-if="compassRadiusSet" weight="fill" class="text-amber-500" />
              </button>
              <button @click="drawCircles" :disabled="isCorrect || circlesDrawn" class="py-2 px-4 rounded-lg border-2 font-bold text-left flex items-center justify-between" :class="circlesDrawn ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'">
                <span>2. Teken cirkel A en B</span><PhCheckCircle v-if="circlesDrawn" weight="fill" class="text-amber-500" />
              </button>
              <button @click="drawLine" :disabled="isCorrect || lineDrawn" class="py-2 px-4 rounded-lg border-2 font-bold text-left flex items-center justify-between" :class="lineDrawn ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-slate-800 border-slate-900 text-white hover:bg-slate-700'">
                <span>3. Verbind de snijpunten</span><PhCheckCircle v-if="lineDrawn" weight="fill" class="text-emerald-500" />
              </button>
            </div>
          </div>

          <!-- Error Analysis -->
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op! Veelgemaakte fouten:</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Passerstraal te klein: cirkels overlappen niet. Kies altijd een straal groter dan de helft van AB.</li>
              <li>Verschillende straal bij A en B: dan liggen de snijpunten niet symmetrisch en klopt de lijn niet.</li>
            </ul>
          </div>

          <!-- Reflection and LPD -->
          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">De snijpunten van twee even grote cirkels liggen altijd op de middelloodlijn. Omdat beide cirkels dezelfde straal hebben, is elk snijpunt even ver van A als van B. Een punt dat even ver van A als van B ligt, ligt op de middelloodlijn. Twee punten bepalen precies een rechte.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom moeten de twee cirkels exact dezelfde straal hebben? Wat gebeurt er als de stralen verschillen?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed && !isCorrect" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan een middelloodlijn construeren met passer en lat en begrijp waarom de constructie werkt.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-bisect" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-bisect" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="isCorrect" @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
            <div v-else class="flex-1 py-4"></div>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8" :key="'lvl' + currentInternalLevel">
            <svg width="600" height="500" viewBox="0 0 600 500">
              <g v-if="circlesDrawn">
                <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" :r="currentLevelData.radius" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" />
                <circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" :r="currentLevelData.radius" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="8 4" class="animate-fadeIn" style="animation-delay: 0.3s" />
                <circle :cx="currentLevelData.intersectTop.x" :cy="currentLevelData.intersectTop.y" r="6" fill="#ef4444" class="animate-fadeIn" style="animation-delay: 0.8s" />
                <circle :cx="currentLevelData.intersectBot.x" :cy="currentLevelData.intersectBot.y" r="6" fill="#ef4444" class="animate-fadeIn" style="animation-delay: 0.8s" />
              </g>
              <g v-if="lineDrawn" class="animate-fadeIn">
                <line :x1="currentLevelData.intersectTop.x - (currentLevelData.intersectBot.x - currentLevelData.intersectTop.x)" :y1="currentLevelData.intersectTop.y - (currentLevelData.intersectBot.y - currentLevelData.intersectTop.y)" :x2="currentLevelData.intersectBot.x + (currentLevelData.intersectBot.x - currentLevelData.intersectTop.x)" :y2="currentLevelData.intersectBot.y + (currentLevelData.intersectBot.y - currentLevelData.intersectTop.y)" stroke="#10b981" stroke-width="4" stroke-linecap="round" />
                <g :transform="`translate(${currentLevelData.mid.x}, ${currentLevelData.mid.y}) rotate(${currentLevelData.lineRotation})`">
                  <polyline points="0,-15 15,-15 15,0" fill="none" stroke="#10b981" stroke-width="3" />
                  <line x1="-70" y1="-10" x2="-70" y2="10" stroke="#1e293b" stroke-width="3" />
                  <line x1="-80" y1="-10" x2="-80" y2="10" stroke="#1e293b" stroke-width="3" />
                  <line x1="70" y1="-10" x2="70" y2="10" stroke="#1e293b" stroke-width="3" />
                  <line x1="80" y1="-10" x2="80" y2="10" stroke="#1e293b" stroke-width="3" />
                </g>
              </g>
              <g v-if="compassRadiusSet && !circlesDrawn" class="animate-fadeIn">
                <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pA.x + currentLevelData.radius * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)" :y2="currentLevelData.pA.y + currentLevelData.radius * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180)" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                <text :x="currentLevelData.pA.x + (currentLevelData.radius/2) * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)" :y="currentLevelData.pA.y + (currentLevelData.radius/2) * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180) - 10" font-weight="bold" fill="#64748b" :transform="`rotate(${currentLevelData.lineRotation - 45} ${currentLevelData.pA.x + (currentLevelData.radius/2) * Math.cos((currentLevelData.lineRotation - 45) * Math.PI / 180)} ${currentLevelData.pA.y + (currentLevelData.radius/2) * Math.sin((currentLevelData.lineRotation - 45) * Math.PI / 180)})`">R > helft</text>
              </g>
              <line :x1="currentLevelData.pA.x" :y1="currentLevelData.pA.y" :x2="currentLevelData.pB.x" :y2="currentLevelData.pB.y" stroke="#1e293b" stroke-width="4" />
              <circle :cx="currentLevelData.pA.x" :cy="currentLevelData.pA.y" r="5" fill="#1e293b" /><circle :cx="currentLevelData.pB.x" :cy="currentLevelData.pB.y" r="5" fill="#1e293b" />
              <text :x="currentLevelData.pA.x - 20" :y="currentLevelData.pA.y + 25" font-weight="bold" fill="#1e293b">A</text>
              <text :x="currentLevelData.pB.x + 5" :y="currentLevelData.pB.y + 25" font-weight="bold" fill="#1e293b">B</text>
            </svg>
          </div>
        </div>
      </div>
    </main>
  </div>
  <SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" :is-level-complete="currentInternalLevel === totalInternalLevels - 1" />
</div>
</template>

<style scoped>
.pattern-grid { background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 2rem 2rem; }
.animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
