<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhBoundingBox, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Volume: De Balk Vullen' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhBoundingBox }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Stap 1: Bereken het Grondvlak.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }
const levels = ref([])
function generateLevel(idx) { return idx === 0 ? { w: randomInt(3,5), d: randomInt(2,4), h: randomInt(3,5) } : idx === 1 ? { w: randomInt(4,6), d: randomInt(3,5), h: randomInt(4,6) } : { w: randomInt(5,7), d: randomInt(3,5), h: randomInt(5,7) } }

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const baseArea = computed(() => currentLevelData.value.w * currentLevelData.value.d)
const totalVol = computed(() => baseArea.value * currentLevelData.value.h)

const step = ref(0); const ansBase = ref(null); const ansVol = ref(null)

function getHint(phase) {
  if (phase === 'base') {
    if (attemptCount.value <= 1) return `Bodem is ${currentLevelData.value.w} x ${currentLevelData.value.d}. Wat is de oppervlakte?`
    if (attemptCount.value === 2) return `L x B = ${currentLevelData.value.w} x ${currentLevelData.value.d} = ?`
    return `Berekening: ${currentLevelData.value.w} x ${currentLevelData.value.d} = ${baseArea.value}`
  }
  if (attemptCount.value <= 1) return `Elke laag heeft oppervlakte ${baseArea.value}. Hoeveel lagen (hoogte)?`
  if (attemptCount.value === 2) return `V = G x h = ${baseArea.value} x ${currentLevelData.value.h} = ?`
  return `${baseArea.value} x ${currentLevelData.value.h} = ${totalVol.value}`
}

function fillBase() {
  if (ansBase.value === baseArea.value) { step.value = 1; attemptCount.value = 0; feedback.value = { type: 'success', text: `Correct! Grondvlak = ${currentLevelData.value.w} x ${currentLevelData.value.d} = ${baseArea.value}. Hoeveel lagen (hoogte ${currentLevelData.value.h})?` } }
  else { attemptCount.value++; feedback.value = { type: 'error', text: getHint('base') } }
}

function fillAll() {
  isChecked.value = true
  if (ansVol.value === totalVol.value) { step.value = 2; isCorrect.value = true; feedback.value = { type: 'success', text: `Briljant! Volume = ${baseArea.value} x ${currentLevelData.value.h} = ${totalVol.value}. Het volume van een balk is altijd: oppervlakte grondvlak x hoogte. Je stapelt eigenlijk laagjes blokjes op elkaar. Elke laag heeft dezelfde oppervlakte (grondvlak) en er zijn h lagen.` } }
  else { isCorrect.value = false; attemptCount.value++
    if (ansVol.value === baseArea.value) feedback.value = { type: 'error', text: `${baseArea.value} is een laag. Hoeveel lagen (h = ${currentLevelData.value.h})?` }
    else feedback.value = { type: 'error', text: getHint('volume') }
  }
}

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Bereken het Grondvlak.' }; step.value = 0; ansBase.value = null; ansVol.value = null; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = [0,1,2].map(i => generateLevel(i)) }

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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Volume berekenen
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Bereken de oppervlakte van het grondvlak (G = l x b).</p>
              <p><strong>Stap 2:</strong> Vermenigvuldig met de hoogte (V = G x h).</p>
              <p><strong>Waarom?</strong> Je vult de balk laag per laag. Elke laag heeft oppervlakte G, en er passen h lagen in.</p>
            </div>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-slate-700">1. Oppervlakte Grondvlak (G):</label>
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="ansBase" placeholder="L x B" :disabled="step > 0" class="w-full font-bold text-lg p-2 border-2 border-slate-300 rounded-lg text-center bg-white" />
                <button @click="fillBase" v-if="step === 0" class="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500 active:scale-95">Vul Laag</button>
                <PhCheckCircle v-if="step > 0" weight="fill" class="w-8 h-8 text-emerald-500 shrink-0 animate-fadeIn" />
              </div>
            </div>
            <div class="flex flex-col gap-2 pt-4 border-t border-slate-200" :class="step === 0 ? 'opacity-50 pointer-events-none' : ''">
              <label class="text-sm font-bold text-slate-700">2. Totaal Volume (G x h):</label>
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="ansVol" placeholder="G x h" :disabled="isCorrect" class="w-full font-bold text-xl p-4 border-2 border-amber-400 rounded-lg text-center bg-white" />
                <span class="font-black text-slate-500">cm</span>
              </div>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Volume is niet hetzelfde als oppervlakte! De derde dimensie (hoogte) telt mee.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Het volume is het aantal eenheidskubusjes dat in de balk past. Elke laag heeft evenveel kubusjes (grondvlak) en er zijn h lagen. Daarom is Volume = G x h. Dit is hetzelfde principe als bij een stapel papier: elk blad heeft dezelfde oppervlakte.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom vermenigvuldigen we de oppervlakte van het grondvlak met de hoogte? Wat zegt dit over de structuur van een balk?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan het volume van een balk berekenen (G x h) en begrijp waarom deze formule werkt.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-prism" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-prism" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div v-if="feedback.text" class="flex items-start gap-4 p-4 mb-4 text-sm font-medium rounded-lg animate-fadeIn" role="status" aria-live="polite" aria-atomic="true" :class="{'bg-emerald-100 text-emerald-800': feedback.type === 'success', 'bg-red-100 text-red-800': feedback.type === 'error', 'bg-blue-100 text-blue-800': feedback.type === 'info'}">
            <component :is="feedback.type === 'success' ? PhCheckCircle : PhWarningCircle" class="w-5 h-5 shrink-0 mt-0.5" weight="fill" /><span class="leading-snug">{{ feedback.text }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="resetActivityState" class="p-4 text-lg font-medium transition-colors rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"><PhArrowClockwise /></button>
            <button v-if="!isCorrect" @click="fillAll" :disabled="step === 0 || ansVol === null" class="flex-1 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-slate-800 hover:bg-slate-900 disabled:opacity-50">Vul Doos</button>
            <button v-else @click="handleNext" class="flex items-center justify-center flex-1 gap-2 py-4 font-bold text-white transition-all rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500">
              <span>{{ currentInternalLevel < totalInternalLevels - 1 ? 'Volgend Level' : 'Afronden' }}</span><PhArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 overflow-hidden bg-slate-50">
        <div class="flex flex-col flex-1 p-6 overflow-y-auto items-center justify-center relative pattern-grid">
          <div class="w-full max-w-2xl flex flex-col items-center">
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-8 flex items-center justify-center" style="width:500px;height:500px" :key="currentInternalLevel">
              <svg width="400" height="400" viewBox="-200 -250 400 400">
                <g stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" fill="none">
                  <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                  <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15" />
                </g>
                <g v-if="step >= 1">
                  <template v-for="h in (step===2 ? currentLevelData.h : 1)" :key="'h'+h">
                    <template v-for="z in currentLevelData.d" :key="'z'+z">
                      <template v-for="x in currentLevelData.w" :key="'x'+x">
                        <g :transform="`translate(${(x-1)*26 - (z-1)*26}, ${(x-1)*15 + (z-1)*15 - (h-1)*30})`" class="animate-fadeIn" :style="`animation-delay: ${(h-1)*0.1+(z-1)*0.02+(x-1)*0.02}s`">
                          <polygon points="0,-30 26,-15 0,0 -26,-15" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1" />
                          <polygon points="-26,-15 0,0 0,30 -26,15" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1" />
                          <polygon points="0,0 26,-15 26,15 0,30" fill="#2563eb" stroke="#1d4ed8" stroke-width="1" />
                        </g>
                      </template>
                    </template>
                  </template>
                </g>
                <g stroke="#334155" stroke-width="3" fill="none">
                  <line x1="0" y1="0" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15" />
                  <line x1="0" y1="0" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15" />
                  <line x1="0" :y1="-currentLevelData.h*30" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15 - currentLevelData.h*30" />
                  <line x1="0" :y1="-currentLevelData.h*30" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                  <line :x1="currentLevelData.w*26" :y1="currentLevelData.w*15 - currentLevelData.h*30" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15 - currentLevelData.h*30" />
                  <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15 - currentLevelData.h*30" :x2="currentLevelData.w*26 - currentLevelData.d*26" :y2="currentLevelData.w*15 + currentLevelData.d*15 - currentLevelData.h*30" />
                  <line x1="0" y1="0" x2="0" :y2="-currentLevelData.h*30" />
                  <line :x1="currentLevelData.w*26" :y1="currentLevelData.w*15" :x2="currentLevelData.w*26" :y2="currentLevelData.w*15 - currentLevelData.h*30" />
                  <line :x1="-currentLevelData.d*26" :y1="currentLevelData.d*15" :x2="-currentLevelData.d*26" :y2="currentLevelData.d*15 - currentLevelData.h*30" />
                </g>
                <text :x="(currentLevelData.w*26)/2+15" :y="(currentLevelData.w*15)/2+15" font-weight="bold" fill="#1e293b">Breedte = {{ currentLevelData.w }}</text>
                <text :x="-(currentLevelData.d*26)/2-25" :y="(currentLevelData.d*15)/2-5" font-weight="bold" fill="#1e293b">Diepte = {{ currentLevelData.d }}</text>
                <text :x="currentLevelData.w*26+15" :y="currentLevelData.w*15-(currentLevelData.h*30)/2+5" font-weight="bold" fill="#1e293b">Hoogte = {{ currentLevelData.h }}</text>
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
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
