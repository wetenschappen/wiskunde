<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhCube, PhArrowClockwise, PhCornersOut, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Oppervlakte: De Kubus Ontvouwen' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhCube }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de kubus uit te vouwen.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function randomInt(m, M) { return Math.floor(Math.random() * (M - m + 1)) + m }
const levels = ref([])
function generateLevel(idx) { return idx === 0 ? { side: randomInt(2,4) } : idx === 1 ? { side: randomInt(3,5) } : { side: randomInt(4,6) } }

const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const singleArea = computed(() => currentLevelData.value.side * currentLevelData.value.side)
const totalArea = computed(() => singleArea.value * 6)

const userAns = ref(null); const isUnfolded = ref(false)

function getHint() {
  if (attemptCount.value <= 1) return 'Ontvouw de kubus. Hoeveel vierkanten zie je?'
  if (attemptCount.value === 2) return `Een vlak = ${currentLevelData.value.side} x ${currentLevelData.value.side} = ${singleArea.value}.`
  return `${singleArea.value} x 6 = ?`
}

function unfoldCube() { if (isCorrect.value) return; isUnfolded.value = true; feedback.value = { type: 'success', text: `Prima! Een kubus = 6 vierkanten van ${currentLevelData.value.side} x ${currentLevelData.value.side}.` } }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Klik op de knop.' }; isUnfolded.value = false; userAns.value = null; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false; if (levels.value.length === 0) levels.value = [0,1,2].map(i => generateLevel(i)) }

function checkAnswer() {
  isChecked.value = true
  if (userAns.value === totalArea.value) {
    if (isUnfolded.value) { isCorrect.value = true; feedback.value = { type: 'success', text: `Perfect! ${singleArea.value} x 6 = ${totalArea.value}. De oppervlakte van een kubus = 6 x z. De zes vierkanten vormen samen de volledige buitenkant (ontwikkeling). Door de kubus plat te vouwen zie je duidelijk waarom we met 6 vermenigvuldigen.` } }
    else { isCorrect.value = false; attemptCount.value++; feedback.value = { type: 'error', text: `${totalArea.value} is correct! Maar ontvouw eerst de kubus.` } }
  } else { isCorrect.value = false; attemptCount.value++
    if (userAns.value === singleArea.value) feedback.value = { type: 'error', text: `${singleArea.value} is maar een vlak. Hoeveel vlakken heeft een kubus?` }
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Kubus ontvouwen
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Een kubus heeft 6 gelijke vierkante vlakken.</p>
              <p><strong>Stap 2:</strong> Ontvouw de kubus: alle 6 vlakken worden plat.</p>
              <p><strong>Stap 3:</strong> Een vlak = z x z. Totaal = 6 x z x z.</p>
              <p class="font-bold text-indigo-600">Oppervlakte = 6 x z. Niks om te blokken, gewoon logisch nadenken!</p>
            </div>
          </div>

          <div class="p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner text-center">
            <label class="block text-sm font-bold text-slate-700 mb-2">Totale Oppervlakte:</label>
            <div class="flex items-center gap-2">
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect" class="w-full font-bold text-2xl p-4 border-2 border-amber-400 rounded-lg text-center bg-white" />
              <span class="font-black text-2xl text-slate-500">cm</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>Oppervlakte is NIET hetzelfde als volume! Volume = z x z x z.</li>
              <li>Tel alle zichtbare vlakken: 6 vierkanten, niet 5 of 4.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">De oppervlakte van een kubus is de som van de oppervlaktes van alle zes zijvlakken. Door de kubus te ontvouwen (ontwikkeling) zien we alle vlakken plat. Elk vlak is een vierkant met zijde z, dus oppervlakte z. Zes keer dat is 6z. Dit is dezelfde redenering als bij het inpakken van een cadeautje: je meet elk vlak apart.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom heeft een kubus precies 6 vlakken? Wat is het verband tussen de vorm en het aantal vlakken?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik kan de oppervlakte van een kubus berekenen via de ontvouwing.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-cube" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-cube" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
            <div class="mb-12">
              <button @click="unfoldCube" :disabled="isCorrect || isUnfolded" class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 disabled:opacity-50"><PhCornersOut weight="bold" class="w-6 h-6" /> Ontvouw Kubus</button>
            </div>
            <div class="relative w-[500px] h-[400px] perspective-container flex items-center justify-center" :key="currentInternalLevel">
              <div class="cube-assembly preserve-3d transition-transform duration-1000 ease-in-out w-32 h-32 relative" :style="{ transform: isUnfolded ? 'rotateX(0deg) rotateY(0deg) scale(1.2)' : 'rotateX(-20deg) rotateY(-30deg)' }">
                <div class="face front bg-blue-500 border-2 border-blue-700 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px)' : 'rotateY(0deg) translateZ(64px)' }"><span class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
                <div class="face back bg-math-blue border-2 border-blue-700 flex items-center justify-center" :style="{ transform: isUnfolded ? 'rotateX(180deg) translateZ(0px) translateY(256px)' : 'rotateY(180deg) translateZ(64px)' }"><span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80" style="transform:rotate(180deg)">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
                <div class="face top bg-sky-400 border-2 border-sky-600 flex items-center justify-center" :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(-128px)' : 'rotateX(90deg) translateZ(64px)' }"><span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
                <div class="face bottom bg-cyan-600 border-2 border-cyan-800 flex items-center justify-center" :style="{ transform: isUnfolded ? 'rotateX(0deg) translateZ(0px) translateY(128px)' : 'rotateX(-90deg) translateZ(64px)' }"><span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
                <div class="face left bg-blue-600 border-2 border-blue-800 flex items-center justify-center" :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(-128px)' : 'rotateY(-90deg) translateZ(64px)' }"><span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
                <div class="face right bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center" :style="{ transform: isUnfolded ? 'rotateY(0deg) translateZ(0px) translateX(128px)' : 'rotateY(90deg) translateZ(64px)' }"><span v-if="isUnfolded" class="font-black text-2xl text-white opacity-80">{{ currentLevelData.side }}x{{ currentLevelData.side }}</span></div>
              </div>
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
.perspective-container { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.face { position: absolute; width: 128px; height: 128px; transition: transform 1s cubic-bezier(0.25, 0.1, 0.25, 1); backface-visibility: visible; }
</style>
