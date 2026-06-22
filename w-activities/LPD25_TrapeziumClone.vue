<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhPolygon, PhArrowClockwise, PhCopy, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Oppervlakte: Trapezium' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhPolygon }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om het trapezium te klonen.' })
const attemptCount = ref(0); const currentInternalLevel = ref(0); const totalInternalLevels = 3
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }
const levels = ref([])
function generateLevel(idx) { return idx === 0 ? { baseTop: randomInt(2,4), baseBot: randomInt(5,8), height: randomInt(3,5) } : idx === 1 ? { baseTop: randomInt(3,6), baseBot: randomInt(7,10), height: randomInt(4,7) } : { baseTop: randomInt(4,8), baseBot: randomInt(8,12), height: randomInt(5,8) } }

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const targetArea = computed(() => ((currentLevelData.value.baseTop + currentLevelData.value.baseBot) * currentLevelData.value.height) / 2)
const totalArea = computed(() => (currentLevelData.value.baseTop + currentLevelData.value.baseBot) * currentLevelData.value.height)

const step = ref(0); const userAns = ref(null)

function transformShape() { if (isCorrect.value) return; step.value = 1; feedback.value = { type: 'success', text: `Kijk! Twee trapeziums = een groot PARALLELLOGRAM (basis ${currentLevelData.value.baseTop + currentLevelData.value.baseBot}, hoogte ${currentLevelData.value.height}). Bereken en deel door 2.` } }

function getHint() {
  if (attemptCount.value <= 1) return `Kijk naar de totale onderkant na het klonen.`
  if (attemptCount.value === 2) return `Het parallellogram heeft basis = (Boven + Onder) en hoogte = h. Deel door 2.`
  return `Berekening: (${currentLevelData.value.baseTop} + ${currentLevelData.value.baseBot}) x ${currentLevelData.value.height} / 2 = ?`
}

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Klik op de knop.' }; step.value = 0; userAns.value = null; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = [0,1,2].map(i => generateLevel(i)) }

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === targetArea.value) {
    if (step.value === 1) { isCorrect.value = true; feedback.value = { type: 'success', text: `Super! (${currentLevelData.value.baseTop}+${currentLevelData.value.baseBot})x${currentLevelData.value.height}/2 = ${targetArea.value}. De formule (boven + onder) x hoogte / 2 komt van het parallellogram dat twee trapeziums vormen. Omdat er 2 inzitten, delen we door 2.` } }
    else { isCorrect.value = false; attemptCount.value++; feedback.value = { type: 'error', text: `${targetArea.value} is correct! Klik eerst op de knop.` } }
  } else { isCorrect.value = false; attemptCount.value++
    if (userAns.value === totalArea.value) feedback.value = { type: 'error', text: `${totalArea.value} is het GROTE parallellogram. Deel door 2 voor een trapezium.` }
    else feedback.value = { type: 'error', text: getHint() }
  }
}

function handleNext() { if (currentInternalLevel.value < totalInternalLevels - 1) { currentInternalLevel.value++; resetActivityState(); nextTick(() => mainArea.value?.focus()) } else { if (props.currentStep < props.totalSteps) emit('update:currentStep', props.currentStep + 1); else emit('complete') } }

watch(() => props.isOpen, (val) => { if (val) { currentInternalLevel.value = 0; levels.value = [0,1,2].map(i => generateLevel(i)); resetActivityState(); nextTick(() => mainArea.value?.focus()); window.addEventListener('keydown', handleKeydown) } else { window.removeEventListener('keydown', handleKeydown) } }, { immediate: true })
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
          <div class="flex items-center gap-2"><p class="text-xs font-medium text-slate-500">Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}</p>
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Trapezium
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Kloon het trapezium en draai het 180.</p>
              <p><strong>Stap 2:</strong> Plaats het gekloonde trapezium tegen het origineel.</p>
              <p><strong>Stap 3:</strong> Ze vormen samen een PARALLELLOGRAM met basis = (boven + onder).</p>
              <p class="font-bold text-indigo-600">EEN trapezium = helft van het parallellogram.</p>
            </div>
          </div>

          <div class="p-4 mt-6 border border-sky-200 bg-sky-50 rounded-xl shadow-inner text-center">
            <label class="block text-sm font-bold text-sky-900 mb-2">Oppervlakte EEN Trapezium:</label>
            <div class="flex items-center gap-2">
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect" class="w-full font-bold text-xl p-4 border-2 border-amber-400 rounded-lg text-center bg-white" />
              <span class="font-black text-2xl text-slate-500">cm</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Vergeet niet te delen door 2. Het parallellogram heeft TWEE trapeziums.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Twee identieke trapeziums passen perfect in elkaar om een parallellogram te vormen. De totale oppervlakte is (boven + onder) x hoogte. Omdat dit twee keer het trapezium is, moet je delen door 2. Dit is dezelfde redenering als bij de oppervlakte van een driehoek (basis x hoogte / 2).</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom lijkt de trapeziumformule op de driehoekformule? Wat is het verband?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp de formule voor de oppervlakte van een trapezium en kan ze afleiden.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-trap" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-trap" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
          <div class="w-full max-w-4xl flex flex-col items-center">
            <div class="mb-12">
              <button @click="transformShape" :disabled="isCorrect || step === 1" class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 disabled:opacity-50"><PhCopy weight="bold" class="w-6 h-6" /> Kloon en Draai 180</button>
            </div>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-12" :key="'svg'+currentInternalLevel">
              <svg width="600" height="300" viewBox="0 0 600 300" class="block">
                <g stroke="#e2e8f0" stroke-width="1"><line v-for="i in 19" :key="'v'+i" :x1="i*30" y1="0" :x2="i*30" y2="300" /><line v-for="i in 9" :key="'h'+i" x1="0" :y1="i*30" x2="600" :y2="i*30" /></g>
                <g :transform="`translate(0, ${150 - (currentLevelData.height*30)/2})`">
                  <polygon :points="`150,${currentLevelData.height*30} ${150 + currentLevelData.baseBot*30},${currentLevelData.height*30} ${210 + currentLevelData.baseTop*30},0 210,0`" fill="rgba(14,165,233,0.7)" stroke="#0284c7" stroke-width="3" stroke-linejoin="round" />
                  <text :x="150 + (currentLevelData.baseBot*30)/2" :y="currentLevelData.height*30 + 25" font-weight="bold" fill="#0284c7" text-anchor="middle">Basis = {{ currentLevelData.baseBot }}</text>
                  <text :x="210 + (currentLevelData.baseTop*30)/2" y="-10" font-weight="bold" fill="#0284c7" text-anchor="middle">Basis = {{ currentLevelData.baseTop }}</text>
                  <line x1="180" y1="0" x2="180" :y2="currentLevelData.height*30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                  <text x="165" :y="(currentLevelData.height*30)/2" font-weight="bold" fill="#64748b" text-anchor="end">h = {{ currentLevelData.height }}</text>
                  <g class="transition-all duration-1000 ease-in-out" :style="{ transformOrigin: `${(150+currentLevelData.baseBot*30+210+currentLevelData.baseTop*30)/2}px ${(currentLevelData.height*30)/2}px`, opacity: step === 1 ? 1 : 0, transform: step === 1 ? 'rotate(180deg)' : 'translate(-100px, 0) scale(0.5)' }">
                    <polygon :points="`150,${currentLevelData.height*30} ${150 + currentLevelData.baseBot*30},${currentLevelData.height*30} ${210 + currentLevelData.baseTop*30},0 210,0`" fill="rgba(236,72,153,0.6)" stroke="#db2777" stroke-width="3" stroke-linejoin="round" />
                  </g>
                  <g v-if="step === 1" class="animate-fadeIn" style="animation-delay: 1s">
                    <line x1="150" :y1="currentLevelData.height*30+40" :x2="150+(currentLevelData.baseBot+currentLevelData.baseTop)*30" :y2="currentLevelData.height*30+40" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
                    <text :x="150+((currentLevelData.baseBot+currentLevelData.baseTop)*30)/2" :y="currentLevelData.height*30+65" font-weight="bold" font-size="18" fill="#1e293b" text-anchor="middle">Totaal = {{ currentLevelData.baseBot + currentLevelData.baseTop }}</text>
                  </g>
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
</style>
