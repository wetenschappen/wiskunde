<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhScissors, PhArrowClockwise, PhLightbulb, PhTarget } from '@phosphor-icons/vue'
import MathText from './MathText.vue'
import SuccessCelebration from './SuccessCelebration.vue'

const props = defineProps({
  isOpen: Boolean, title: { type: String, default: 'Oppervlakte: Parallellogram' }, instruction: { type: String, default: '' },
  currentStep: { type: Number, default: 1 }, totalSteps: { type: Number, default: 1 }, fullscreen: { type: Boolean, default: false }, icon: { type: Object, default: () => PhScissors }
})

const emit = defineEmits(['close', 'complete', 'update:currentStep'])
const mainArea = ref(null); const shouldPulse = ref(false)
const isCorrect = ref(false); const celebrationDone = ref(false); const isChecked = ref(false)
const feedback = ref({ type: 'info', text: 'Klik op de knop om de vorm te transformeren.' })
const currentInternalLevel = ref(0); const totalInternalLevels = 3; const attemptCount = ref(0)
const showWorkedExample = ref(false); const showReflection = ref(false); const reflectionAnswer = ref(''); const lpdConfirmed = ref(false)

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
const levels = ref([])
function generateLevel() {
  const b1 = pickRandom([4,5,6]), h1 = pickRandom([3,4,5]), s1 = pickRandom([2,3])
  const b2 = pickRandom([6,7,8,9]), h2 = pickRandom([4,5,6]), s2 = pickRandom([3,4])
  const b3 = pickRandom([5,6,7,8,9,10]), h3 = pickRandom([5,6,7]), s3 = pickRandom([2,3,4])
  levels.value = [{ base: b1, height: h1, shear: s1 }, { base: b2, height: h2, shear: s2 }, { base: b3, height: h3, shear: s3 }]
}
const currentLevelData = computed(() => levels.value[currentInternalLevel.value])
const targetArea = computed(() => currentLevelData.value.base * currentLevelData.value.height)

const step = ref(0); const userAns = ref(null)

function transformShape() { if (isCorrect.value) return; step.value = 1; feedback.value = { type: 'success', text: 'Prima! Een parallellogram wordt een RECHTHOEK. Basis en hoogte blijven hetzelfde.' } }

function resetActivityState() { isCorrect.value = false; celebrationDone.value = false; isChecked.value = false; feedback.value = { type: 'info', text: 'Klik op de knop.' }; step.value = 0; userAns.value = null; attemptCount.value = 0; showReflection.value = false; reflectionAnswer.value = ''; lpdConfirmed.value = false }

function checkAnswer() {
  isChecked.value = true; attemptCount.value++
  if (userAns.value === targetArea.value) {
    if (step.value === 1) { isCorrect.value = true; feedback.value = { type: 'success', text: `Prima! Basis ${currentLevelData.value.base} hoogte ${currentLevelData.value.height} = ${targetArea.value}. Een parallellogram heeft dezelfde oppervlakteformule als een rechthoek: b x h. Het afgeknipte stukje past precies aan de andere kant, dus de oppervlakte verandert niet!` } }
    else { isCorrect.value = false; feedback.value = { type: 'error', text: `${targetArea.value} is correct! Klik eerst op de knop.` } }
  } else {
    isCorrect.value = false
    const d = currentLevelData.value
    if (attemptCount.value >= 3) feedback.value = { type: 'error', text: `Rechthoek = ${d.base} x ${d.height} = ${targetArea.value}.` }
    else if (attemptCount.value >= 2) feedback.value = { type: 'error', text: `Het is een rechthoek van ${d.base} x ${d.height}.` }
    else feedback.value = { type: 'error', text: `Kijk naar de rechthoek. Wat is ${d.base} x ${d.height}?` }
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
              <PhLightbulb weight="fill" class="w-4 h-4" /> Voorbeeld: Parallellogram
            </button>
            <div v-if="showWorkedExample" class="mt-3 text-sm text-indigo-800 space-y-2 animate-fadeIn">
              <p><strong>Stap 1:</strong> Een parallellogram heeft een schuine kant, maar de basis en hoogte zijn duidelijk.</p>
              <p><strong>Stap 2:</strong> Knip het uitstekende stukje aan een kant af.</p>
              <p><strong>Stap 3:</strong> Verplaats het naar de andere kant = een perfecte rechthoek!</p>
              <p class="font-bold text-indigo-600">Oppervlakte = basis x hoogte, net als een rechthoek.</p>
            </div>
          </div>

          <div class="p-4 mt-6 border border-slate-200 bg-slate-50 rounded-xl shadow-inner text-center">
            <label class="block text-sm font-bold text-slate-700 mb-2">Oppervlakte Parallellogram:</label>
            <div class="flex items-center gap-2">
              <input type="number" v-model.number="userAns" placeholder="..." :disabled="isCorrect" class="w-full font-bold text-xl p-4 border-2 border-amber-400 rounded-lg text-center bg-white" />
              <span class="font-black text-2xl text-slate-500">cm</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl" v-if="!isCorrect && attemptCount > 0">
            <h4 class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><PhWarningCircle weight="fill" class="w-4 h-4" /> Let op!</h4>
            <ul class="text-xs text-red-600 space-y-1 list-disc list-inside">
              <li>De schuine zijde is NIET de hoogte. De hoogte staat loodrecht op de basis.</li>
              <li>Na het knippen is het een rechthoek, geen parallellogram meer.</li>
            </ul>
          </div>

          <div v-if="isCorrect && !showReflection" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Waarom werkt dit?</h4>
            <p class="text-xs text-indigo-600">Door het uitstekende stukje af te knippen en te verplaatsen, verandert de oppervlakte niet (conservatie van oppervlakte). Het parallellogram wordt een rechthoek met dezelfde basis en hoogte. Daarom is de formule basis x hoogte.</p>
            <button @click="showReflection = true" class="mt-3 text-xs font-bold text-indigo-700 underline">Bevestig</button>
          </div>
          <div v-if="showReflection && !lpdConfirmed" class="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-indigo-700 mb-2">Reflectie</h4>
            <p class="text-xs text-indigo-600 mb-2">Waarom is de oppervlakteformule van een parallellogram hetzelfde als van een rechthoek?</p>
            <textarea v-model="reflectionAnswer" class="w-full p-3 text-sm border border-indigo-300 rounded-lg bg-white" rows="2" placeholder="Typ je antwoord..."></textarea>
            <button @click="lpdConfirmed = true" :disabled="reflectionAnswer.length < 5" class="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Bevestig</button>
          </div>
          <div v-if="lpdConfirmed" class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
            <h4 class="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2"><PhTarget weight="fill" class="w-4 h-4" /> LPD-bewijs</h4>
            <p class="text-xs text-emerald-600 mb-2">Ik begrijp waarom de oppervlakte van een parallellogram basis x hoogte is.</p>
            <div class="flex items-center gap-2"><input type="checkbox" id="lpd-para" v-model="lpdConfirmed" class="w-4 h-4 accent-emerald-600" /><label for="lpd-para" class="text-xs text-emerald-700 font-medium">Ik bevestig.</label></div>
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
              <button @click="transformShape" :disabled="isCorrect || step === 1" class="px-6 py-4 font-bold bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 hover:bg-slate-700 active:scale-95 disabled:opacity-50"><PhScissors weight="bold" class="w-6 h-6" /> Snij en Verplaats</button>
            </div>
            <div class="relative bg-white shadow-md rounded-xl overflow-hidden border-2 border-slate-200 p-12" :key="currentInternalLevel">
              <svg width="600" height="300" viewBox="0 0 600 300" class="block">
                <g stroke="#e2e8f0" stroke-width="1"><line v-for="i in 19" :key="'v'+i" :x1="i*30" y1="0" :x2="i*30" y2="300" /><line v-for="i in 9" :key="'h'+i" x1="0" :y1="i*30" x2="600" :y2="i*30" /></g>
                <g :transform="`translate(120, 240)`">
                  <polygon :points="`${currentLevelData.shear*30},0 ${currentLevelData.base*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},${-currentLevelData.height*30} ${currentLevelData.shear*30},${-currentLevelData.height*30}`" fill="rgba(249,115,22,0.5)" stroke="#ea580c" stroke-width="3" stroke-linejoin="round" />
                  <g class="transition-all duration-1000 ease-in-out" :style="{ transform: step === 1 ? `translateX(${currentLevelData.base*30}px)` : 'translateX(0)' }">
                    <polygon :points="`0,0 ${currentLevelData.shear*30},0 ${currentLevelData.shear*30},${-currentLevelData.height*30}`" fill="rgba(249,115,22,0.8)" stroke="#ea580c" stroke-width="3" stroke-linejoin="round" />
                  </g>
                  <line :x1="-20" y1="0" :x2="-20" :y2="-currentLevelData.height*30" stroke="#64748b" stroke-width="2" stroke-dasharray="4 2" />
                  <text :x="-30" :y="-currentLevelData.height*15" font-weight="bold" fill="#64748b" text-anchor="end">{{ currentLevelData.height }}</text>
                  <line x1="0" y1="20" :x2="currentLevelData.base*30" y2="20" stroke="#64748b" stroke-width="2" />
                  <text :x="currentLevelData.base*15" y="40" font-weight="bold" fill="#64748b" text-anchor="middle">{{ currentLevelData.base }}</text>
                  <polygon v-if="step===0" :points="`${currentLevelData.base*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},0 ${currentLevelData.base*30 + currentLevelData.shear*30},${-currentLevelData.height*30}`" fill="transparent" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
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
