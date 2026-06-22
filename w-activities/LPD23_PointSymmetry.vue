<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowsClockwise, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Transformaties: Puntspiegeling = Rotatie' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhArrowsClockwise }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null)
const shouldPulse = ref(false)
const isCorrect = ref(false)
const celebrationDone = ref(false)
const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Gebruik de slider om de vorm te draaien.' })
const currentInternalLevel = ref(0)
const totalInternalLevels = 3
const attemptCount = ref(0)
const showWorkedExample = ref(false)
const showReflection = ref(false)
const reflectionAnswer = ref('')
const lpdConfirmed = ref(false)

const levels = ref([])
function generateLevel() {
  const cx = 250, cy = 200
  levels.value = [
    makeLevel([[150,100],[200,100],[200,150],[250,150],[250,200],[150,200]], cx, cy, 1, 'L-vorm'),
    makeLevel([[100,150],[200,100],[150,200]], cx, cy, 2, 'Asymmetrische driehoek'),
    makeLevel([[200,100],[250,50],[300,150],[200,150]], cx, cy, 3, 'Willekeurige vierhoek')
  ]
}
function makeLevel(points, cx, cy, l, label) {
  const shapePts = points.map(p => `${p[0]},${p[1]}`).join(' '), rotatedPts = points.map(p => `${2*cx - p[0]},${2*cy - p[1]}`).join(' ')
  const colors = ['rgba(99,102,241,0.8)','rgba(236,72,153,0.8)','rgba(16,185,129,0.8)'], strokes = ['#4f46e5','#db2777','#059669']
  return { goalText: `Opdracht ${l}: ${label}`, centerX: cx, centerY: cy, shapeSVG: `<polygon points="${shapePts}" fill="${colors[l-1]}" stroke="${strokes[l-1]}" stroke-width="3" stroke-linejoin="round" />`, targetSVG: `<polygon points="${rotatedPts}" fill="none" stroke="#94a3b8" stroke-width="4" stroke-dasharray="8 4" stroke-linejoin="round" />` }
}
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])

const rotation = ref(0)
const userAns = ref(null)
const isOverlapping = computed(() => rotation.value === 180)

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Gebruik de slider om de vorm te draaien.' }; rotation.value = 0; userAns.value = null; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  if (userAns.value === 180) {
    if (isOverlapping.value) { isCorrect.value = true; feedback.value = { type: 'success', text: 'Prima! Een puntspiegeling is wiskundig exact hetzelfde als een rotatie van 180 graden (halve draai). Elk punt (x,y) wordt afgebeeld op (-x, -y) ten opzichte van het centrum. Daarom valt de vorm perfect samen met het spiegelbeeld na een halve draai.' } }
    else { isCorrect.value = false; if (attemptCount.value >= 3) feedback.value = { type: 'error', text: 'Niet helemaal... 180 is correct! Zet de slider op 180.' }; else feedback.value = { type: 'error', text: '180 klopt! Zet de slider ook naar 180 om het te bewijzen.' } }
  } else { isCorrect.value = false
    if (userAns.value === 360 || userAns.value === 0) feedback.value = { type: 'error', text: 'Niet helemaal... 0 of 360 = geen draaiing. Je moet exact een halve draai maken (180).' }
    else if (isOverlapping.value) feedback.value = { type: 'error', text: `Vorm overlapt! Lees de hoek bovenaan de slider af.` }
    else feedback.value = { type: 'error', text: 'Niet helemaal... Sleep tot de vormen overlappen. Dat gebeurt bij 180.' }
  }
}

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; generateLevel(); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
        <div><h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
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

          <div class="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <button @click="showWorkedExample = !showWorkedExample" class="flex items-center gap-2 text-sm font-bold text-indigo-700 w-full text-left">
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Puntspiegeling = Rotatie van 180
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Neem een willekeurig punt P van de figuur.</p>
              <p><strong>Stap 2:</strong> Spiegel P door centrum C: P' ligt aan de overkant, op dezelfde lijn, op dezelfde afstand.</p>
              <p><strong>Stap 3:</strong> Draai P 180 rond C. Vergelijk de posities.</p>
              <p class="font-bold text-indigo-600">Conclusie: puntspiegeling en rotatie 180 geven exact hetzelfde resultaat voor elk punt.</p>
            </div>
          </div>

          <div class="text-center bg-amber-50 p-4 border border-amber-200 rounded-xl shadow-sm mb-6 animate-fadeIn">
            <p class="font-bold text-amber-800">{{ currentLevelData.goalText }}</p>
          </div>

          <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
            <label class="block text-sm font-bold text-slate-700 mb-2">Conclusie:</label>
            <div class="flex items-center gap-2 mb-2 text-slate-700 font-medium text-sm">Een puntspiegeling is gelijk aan een rotatie van:</div>
            <div class="flex items-center gap-2">
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect"
                class="flex-1 font-bold text-xl p-4 border-2 border-amber-400 rounded-lg focus:border-amber-500 text-center bg-white" />
              <span class="font-black text-2xl text-slate-500">°</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op! Veelgemaakte fouten:</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>90 of 270 = kwartdraai. De vorm staat dan haaks, niet gespiegeld.</li>
              <li>360 = volledige draai. De vorm ligt terug op de startpositie.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Een puntspiegeling door C beeldt een punt P af op P' zodanig dat C het midden is van PP'. Bij een rotatie van 180 om C draait P precies een halve cirkel naar de overkant. Beide transformaties geven dezelfde coördinaten: als P = (x, y) en C = (0,0), dan is P' = (-x, -y).</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom is een puntspiegeling hetzelfde als een rotatie van 180? Wat gebeurt er met de afstand tot het centrum?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp dat puntspiegeling equivalent is aan een 180 rotatie en kan dit aantonen.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-symm" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-symm" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="!isCorrect" @click="checkAnswer" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900">Controleer</button>
            <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center">
            <div class="mb-12 w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-slate-200 z-10">
              <div class="flex justify-between items-end mb-4">
                <label class="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><PhArrowsClockwise weight="bold" /> Rotatie</label>
                <span class="font-black text-2xl tabular-nums" :class="isOverlapping ? 'text-emerald-600' : 'text-amber-600'">{{ rotation }}°</span>
              </div>
              <input type="range" min="0" max="360" step="1" v-model.number="rotation" :disabled="isCorrect" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" :class="isOverlapping ? 'accent-emerald-500' : ''" />
            </div>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-4 border-slate-200 p-4" :key="currentInternalLevel">
              <svg width="500" height="400" viewBox="0 0 500 400" class="block">
                <g v-html="currentLevelData.targetSVG"></g>
                <circle :cx="currentLevelData.centerX" :cy="currentLevelData.centerY" r="6" fill="#1e293b" />
                <text :x="currentLevelData.centerX" :y="currentLevelData.centerY - 15" font-weight="bold" fill="#1e293b" text-anchor="middle">C</text>
                <g :transform="`rotate(${rotation}, ${currentLevelData.centerX}, ${currentLevelData.centerY})`">
                  <g :class="isOverlapping ? '[&>*]:fill-emerald-500/80 [&>*]:stroke-emerald-600' : ''" v-html="currentLevelData.shapeSVG"></g>
                </g>
              </svg>
            </div>
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
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 28px; width: 28px; border-radius: 50%; background: #f59e0b; border: 4px solid white; cursor: pointer; margin-top: -13px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #cbd5e1; border-radius: 2px; }
</style>
